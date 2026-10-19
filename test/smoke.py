import asyncio,sys
from playwright.async_api import async_playwright
URL='http://localhost:8800/jimothys-crossing/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto(URL);await pg.wait_for_timeout(800);await pg.screenshot(path='title.png')
    await pg.evaluate("__T.start(1)");await pg.evaluate("__T.god(true)")
    for i in range(6):
      await pg.evaluate("__T.hop('up')");await pg.wait_for_timeout(250)
    await pg.screenshot(path='play1.png')
    for L,w in [(3,'rain'),(4,'night'),(2,'dusk')]:
      await pg.evaluate(f"__T.level({L})");await pg.wait_for_timeout(1500)
      for i in range(8):
        await pg.evaluate("__T.hop('up')");await pg.wait_for_timeout(200)
      await pg.screenshot(path=f'play{L}.png')
    await pg.evaluate("__T.god(false);__T.setLives(1);__T.die('bonk')");await pg.wait_for_timeout(2200);await pg.screenshot(path='over.png')
    print(await pg.evaluate("__T.get()"));print('ERRS',errs);await b.close()
asyncio.run(main())
