import asyncio,sys
from playwright.async_api import async_playwright
URL='http://localhost:8800/jimothys-crossing/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    ctx=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=2);pg=await ctx.new_page()
    await pg.goto(URL);await pg.wait_for_timeout(1200);await pg.add_script_tag(path='bot2.js')
    await pg.screenshot(path='s_title.png')
    for name,L,secs in [('s_day',1,float(sys.argv[1]) if len(sys.argv)>1 else 13.5),('s_night',4,16),('s_rain',3,9),('s_storm',8,11)]:
      await pg.evaluate(f"()=>{{Math.random=(()=>{{let s=42;return()=>(s=(s*16807)%2147483647)/2147483647}})();__bot2(99,{secs},{{startL:{L}}});window.__manual=true;__T.render()}}")
      await pg.wait_for_timeout(100);await pg.screenshot(path=name+'.png')
    await pg.evaluate("()=>{__T.togglePause();__T.render()}");await pg.screenshot(path='s_pause.png')
    await b.close()
asyncio.run(main())
