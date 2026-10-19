# Renders every labelled vehicle in both travel directions so the text can be checked for mirroring.
import asyncio,sys
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8800/jimothys-crossing/'
JS=r'''()=>{window.__manual=true;render=()=>{};const types=['taxi','bus','truck','foodtruck','coffee'];g.setTransform(1,0,0,1,0,0);g.fillStyle='#3b3e44';g.fillRect(0,0,c.width,c.height);const k=3*DPR;g.setTransform(k,0,0,k,0,0);
 types.forEach((t,i)=>{[1,-1].forEach((d,j)=>{const o={type:t,w:WID[t]*T,col:'#e63946'};drawVeh(o,6+j*115,4+i*36,d,false)})});
 g.fillStyle='#1e6fa8';g.fillRect(0,186,240,80);drawFerry(6,190,160,1,0);drawFerry(6,226,160,-1,0);drawTrain(0,270,T*4.8,1);drawTrain(0,306,T*4.8,-1);
 g.setTransform(1,0,0,1,0,0)}'''
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':760,'height':1060});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_timeout(600);await pg.evaluate(JS);await pg.screenshot(path='text_dirs.png');print('errs',errs);await b.close()
asyncio.run(main())
