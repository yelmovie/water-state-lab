"""Repack the supplied, unevenly spaced poses into a padded 4x4 atlas.

No illustration is generated: retain the original pixels and alpha around each
connected character/accessory, excluding the preceding row and background dust.
Requires Pillow. Run from the project root.
"""
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'image/chatgpt_generated_035.png'
OUTPUT = ROOT / 'public/assets/v2/buddy-poses-clean.webp'
CELL = (362, 272)


def prepare():
    source = Image.open(SOURCE).convert('RGBA')
    width, height = source.size
    pending = bytearray(source.getchannel('A').point(lambda a: 255 if a > 100 else 0).tobytes())
    components = []
    for start in range(len(pending)):
        if not pending[start]:
            continue
        stack, pixels = [start], []
        pending[start] = 0
        while stack:
            pixel = stack.pop()
            pixels.append(pixel)
            y, x = divmod(pixel, width)
            for neighbor in (pixel - 1 if x else -1,
                             pixel + 1 if x < width - 1 else -1,
                             pixel - width, pixel + width):
                if 0 <= neighbor < len(pending) and pending[neighbor]:
                    pending[neighbor] = 0
                    stack.append(neighbor)
        if len(pixels) < 150:
            continue
        xs, ys = [p % width for p in pixels], [p // width for p in pixels]
        bounds = (min(xs), min(ys), max(xs) + 1, max(ys) + 1)
        components.append((pixels, bounds))

    bodies = sorted((c for c in components if len(c[0]) > 20_000),
                    key=lambda c: (round(c[1][1] / 270), c[1][0]))
    assert len(bodies) == 16, 'The supplied sheet must contain exactly 16 character bodies'
    centers = [((b[0] + b[2]) / 2, (b[1] + b[3]) / 2) for _, b in bodies]
    groups = [[] for _ in bodies]
    for pixels, bounds in components:
        x, y = (bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2
        pose = min(range(16), key=lambda i: (x - centers[i][0]) ** 2 + (y - centers[i][1]) ** 2)
        groups[pose].extend(pixels)

    atlas = Image.new('RGBA', (CELL[0] * 4, CELL[1] * 4))
    for pose, pixels in enumerate(groups):
        mask = bytearray(width * height)
        for pixel in pixels:
            mask[pixel] = 255
        # Keep the original soft outline, without connecting neighboring poses.
        outline = Image.frombytes('L', source.size, bytes(mask)).filter(ImageFilter.MaxFilter(3))
        frame = source.copy()
        alpha = source.getchannel('A')
        alpha.paste(0, mask=outline.point(lambda a: 255 - a))
        frame.putalpha(alpha)
        bounds = frame.getbbox()
        crop = frame.crop(bounds)
        crop = crop.resize((round(crop.width * .92), round(crop.height * .92)), Image.Resampling.LANCZOS)
        body = bodies[pose][1]
        x = round(CELL[0] / 2 - (centers[pose][0] - bounds[0]) * .92)
        y = round(CELL[1] - 10 - (body[3] - bounds[1]) * .92)
        assert x >= 8 and y >= 8 and x + crop.width <= CELL[0] - 8 and y + crop.height <= CELL[1] - 8
        atlas.alpha_composite(crop, (pose % 4 * CELL[0] + x, pose // 4 * CELL[1] + y))
    atlas.save(OUTPUT, lossless=True, method=6)
    print(f'{OUTPUT.name}: {atlas.width}x{atlas.height}; 16 poses, at least 8px clear padding')


if __name__ == '__main__':
    prepare()
