from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1] / 'assets'
root.mkdir(exist_ok=True)
scale = 4  # 1024px source for macOS icon conversion; geometry is defined on a 256px grid.
im = Image.new('RGBA', (256 * scale, 256 * scale), (0, 0, 0, 0))
d = ImageDraw.Draw(im)
d.rounded_rectangle(tuple(v * scale for v in (6, 6, 250, 250)), radius=58 * scale, fill='#24222e', outline='#71658e', width=4 * scale)
for box, color in [((53, 123, 83, 199), '#b3a5e9'), ((113, 57, 143, 199), '#d4c8ff'), ((173, 91, 203, 199), '#a596d7')]:
    d.rounded_rectangle(tuple(v * scale for v in box), radius=15 * scale, fill=color)
im.save(root / 'kota.png')
im.save(root / 'kota.ico', sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
