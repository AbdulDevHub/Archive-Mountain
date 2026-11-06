import sys, base64
from playwright.sync_api import sync_playwright
out = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle","--enable-webgl","--ignore-gpu-blocklist"])
    pg = b.new_page(viewport={"width":740,"height":630}, device_scale_factor=1)
    pg.goto("http://localhost:5199/", wait_until="networkidle")
    pg.wait_for_timeout(9000)
    pg.add_style_tag(content="body *{visibility:hidden!important} canvas{visibility:visible!important}"); pg.wait_for_timeout(500)
    canvas = pg.locator("canvas").first.screenshot()
    pg.screenshot(path=out.replace(".png","-raw.png"))
    img = base64.b64encode(canvas).decode()
    html = f"""<html><head><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@600;700&display=swap" rel="stylesheet"><style>
body{{margin:0;width:1200px;height:630px;display:flex;font-family:Inter,sans-serif}}
.l{{width:460px;box-sizing:border-box;padding:0 48px;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(160deg,#f7fbff,#d8eaf9)}}
h1{{font-family:Outfit;font-weight:700;font-size:64px;line-height:1.05;color:#1d3d5c;margin:18px 0 22px}}
p{{font-size:21px;color:#4d5f71;margin:0 0 22px;line-height:1.4}}
.t{{display:flex;flex-wrap:wrap;gap:10px;max-width:300px}} .t span{{color:#fff;font-weight:600;font-size:15px;padding:7px 14px;border-radius:99px}}
.u{{margin-top:22px;color:#2a7ab8;font-weight:600;font-size:16px}}
.r{{width:740px;height:630px;background:url(data:image/png;base64,{img}) center/cover}}
</style></head><body><div class=l>
<svg width=58 height=30 viewBox="0 0 58 30"><path d="M0 30 L20 4 L30 16 L38 8 L58 30Z" fill="#4c7a52"/><path d="M15 10.5 L20 4 L25 10.5Z M34 12.5 L38 8 L42 12.5Z" fill="#fff"/></svg>
<h1>Archive<br>Mountain</h1><p>27 web projects by Abdul Khan, explored as a low-poly 3D island.</p>
<div class=t><span style="background:#e07a5f">Tools</span><span style="background:#8b5cf6">Designs &amp; effects</span><span style="background:#2f6fe0">AI &amp; full-stack apps</span><span style="background:#ef476f">Games</span></div>
<div class=u>archive-mountain.netlify.app</div></div><div class=r></div></body></html>"""
    pg2 = b.new_page(viewport={"width":1200,"height":630})
    pg2.set_content(html, wait_until="networkidle"); pg2.wait_for_timeout(500)
    pg2.screenshot(path=out)
    b.close()
