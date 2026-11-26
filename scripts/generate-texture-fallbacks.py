"""Decode bundled DXT3 KTX textures to portable PNGs (requires Pillow).

Run after changing public/compressed/s3tc. Preserve size, orientation and alpha;
the browser generates mipmaps for textures that originally had them.
"""

from pathlib import Path
import struct

from PIL import Image

root = Path(__file__).resolve().parents[1] / "public" / "compressed"
for source in sorted((root / "s3tc").rglob("*.ktx")):
    data = source.read_bytes()
    assert data[:12] == b"\xabKTX 11\xbb\r\n\x1a\n", source
    header = struct.unpack_from("<13I", data, 12)
    endian, _, _, _, format_, _, width, height, depth, arrays, faces, _, metadata = header
    assert (endian, format_, depth, arrays, faces) == (0x04030201, 0x83F2, 0, 0, 1), source
    offset = 64 + metadata
    size = struct.unpack_from("<I", data, offset)[0]
    pixels = data[offset + 4:offset + 4 + size]
    image = Image.frombytes("RGBA", (width, height), pixels, "bcn", (2, "DXT3"))
    target = (root / "png" / source.relative_to(root / "s3tc")).with_suffix(".png")
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, optimize=True)
    with Image.open(target) as saved:
        assert saved.tobytes() == image.tobytes(), target
    print(target.relative_to(root))
