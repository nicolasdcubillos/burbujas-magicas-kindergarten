"""Genera docs/presentacion-burbujas-magicas.pdf (16:9).

Uso: python docs/presentacion/build.py   (requiere: pip install playwright; playwright install chromium)
"""
import pathlib
from playwright.sync_api import sync_playwright

here = pathlib.Path(__file__).resolve().parent
out = here.parent / "presentacion-burbujas-magicas.pdf"

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 720})
    pg.goto((here / "index.html").as_uri())
    pg.wait_for_timeout(1500)
    pg.pdf(path=str(out), width="1280px", height="720px", print_background=True)
    for i, s in enumerate(pg.query_selector_all("section.s"), 1):
        s.screenshot(path=str(here / f"prev-{i}.png"))
    b.close()
print(out)
