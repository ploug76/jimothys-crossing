import asyncio,sys,json
from playwright.async_api import async_playwright
URL='http://localhost:8800/jimothys-crossing/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_timeout(500);await pg.add_script_tag(path='bot2.js')
    for run in range(int(sys.argv[1]) if len(sys.argv)>1 else 2):
      r=await pg.evaluate("__bot2(%s,%s,{keepAlive:true})"%(sys.argv[2] if len(sys.argv)>2 else 6, sys.argv[3] if len(sys.argv)>3 else 600));print(json.dumps(r))
    print('ERRS',errs);await b.close()
asyncio.run(main())
