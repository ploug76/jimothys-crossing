# Functional checks: touch controls, input buffering, pause/auto-pause on game time, saving, SW cache, mute, sizes.
import sys,asyncio,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8800/jimothys-crossing/'
res=[]
def ok(name,cond,info=''):res.append((name,bool(cond)));print(('PASS ' if cond else 'FAIL ')+name,info,flush=True)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for (w,h) in [(390,844),(375,667),(430,932),(360,640)]:
      ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=True,has_touch=True,device_scale_factor=3);pg=await ctx.new_page();errs=[]
      pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
      await pg.goto(URL);await pg.wait_for_timeout(1500)
      # start via the PLAY button on the canvas
      L=await pg.evaluate("__T.layout()");btn=[u for u in L['UI'] if u['k']=='btn' and 'PLAY' in u['s']][0]
      cx=btn['x']*L['SC']+L['OXs']+btn['w']*L['SC']/2;cy=btn['y']*L['SC']+L['OYs']+btn['h']*L['SC']/2
      await pg.mouse.click(cx,cy);await pg.wait_for_timeout(300);st=await pg.evaluate("__T.get()");ok(f'{w}x{h} PLAY button starts game',st['state']=='play')
      await pg.evaluate("__T.god(true)")
      # tap = hop up
      r0=(await pg.evaluate("__T.get()"))['row'];await pg.mouse.click(w/2,h*.45);await pg.wait_for_timeout(350);r1=(await pg.evaluate("__T.get()"))['row'];ok(f'{w}x{h} tap hops up',r1==r0-1,f'{r0}->{r1}')
      # swipe left/right/down via pointer drag
      x0=(await pg.evaluate("__T.get()"))['x'];await pg.mouse.move(w/2,h*.4);await pg.mouse.down();await pg.mouse.move(w/2-40,h*.4,steps=4);await pg.mouse.up();await pg.wait_for_timeout(350)
      x1=(await pg.evaluate("__T.get()"))['x'];ok(f'{w}x{h} swipe left hops one column',abs((x0-x1)-32)<1,f'{x0}->{x1}')
      await pg.mouse.move(w/2,h*.4);await pg.mouse.down();await pg.mouse.move(w/2,h*.4+40,steps=4);await pg.mouse.up();await pg.wait_for_timeout(350)
      r2=(await pg.evaluate("__T.get()"))['row'];ok(f'{w}x{h} swipe down',r2==r1+1,f'{r1}->{r2}')
      # input buffering: 3 rapid taps inside one hop -> 3 hops (queue holds 2)
      await pg.evaluate("__T.start(1);__T.god(true)");await pg.wait_for_timeout(200)
      await pg.evaluate("()=>{__T.hop('up');__T.hop('up');__T.hop('up')}");await pg.wait_for_timeout(900);r=(await pg.evaluate("__T.get()"))['row'];ok(f'{w}x{h} buffered rapid hops',r==10,f'row {r}')
      # D-pad hold repeats
      if L['dpad'] if (L:=await pg.evaluate("__T.layout()")) else False:
        await pg.evaluate("__T.start(1);__T.god(true)");await pg.wait_for_timeout(200);up=[d for d in L['dpad'] if d['d']=='up'][0]
        ux=(up['x']+up['w']/2)*L['SC']+L['OXs'];uy=(up['y']+up['h']/2)*L['SC']+L['OYs'];await pg.mouse.move(ux,uy);await pg.mouse.down();await pg.wait_for_timeout(900);await pg.mouse.up()
        r=(await pg.evaluate("__T.get()"))['row'];ok(f'{w}x{h} D-pad hold keeps hopping',r<=10,f'row {r}')
      # pause freezes game time + timer
      await pg.evaluate("__T.start(1)");await pg.wait_for_timeout(600);a=await pg.evaluate("__T.get()");await pg.click('#pause');await pg.wait_for_timeout(1500);b2=await pg.evaluate("__T.get()")
      ok(f'{w}x{h} pause freezes timers',b2['paused'] and abs(a['time']-b2['time'])<0.2 and b2['lt']-a['lt']<0.2,f"{a['time']:.2f}->{b2['time']:.2f}")
      await pg.click('#pause');await pg.wait_for_timeout(500);c=await pg.evaluate("__T.get()");ok(f'{w}x{h} resume runs timer',not c['paused'] and c['time']<b2['time'])
      # auto-pause when backgrounded
      await pg.evaluate("()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))}");await pg.wait_for_timeout(300)
      d=await pg.evaluate("__T.get()");ok(f'{w}x{h} auto-pause on background',d['paused'])
      await pg.evaluate("()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))}")
      # mute toggle persists
      await pg.click('#mute');m=await pg.evaluate("localStorage.getItem('jimothys-crossing:mute')");await pg.click('#mute');ok(f'{w}x{h} mute toggles + saves',m=='true')
      # best score saved
      await pg.evaluate("()=>{__T.togglePause();__T.god(false);__T.setLives(1);__T.die('bonk')}");await pg.wait_for_timeout(2200)
      sc=await pg.evaluate("[__T.get().state,localStorage.getItem('jimothys-crossing:scores'),localStorage.getItem('jimothys-crossing:best')]");ok(f'{w}x{h} game over + scores saved',sc[0]=='over' and sc[1] and sc[2] is not None,str(sc))
      if w==390:
        sw=await pg.evaluate("navigator.serviceWorker.ready.then(r=>r.active&&r.active.scriptURL)");await pg.wait_for_timeout(800);ck=await pg.evaluate("caches.keys()")
        ok('service worker active + own cache',sw and sw.endswith('sw.js') and ck==['jimothys-crossing-v1'],f'{ck}')
        man=await pg.evaluate("fetch('manifest.json').then(r=>r.json())");ok('manifest ok',man['name']=="Jimothy's Crossing" and len(man['icons'])==2)
      ok(f'{w}x{h} no JS errors',not errs,str(errs[:3]))
      await ctx.close()
    await b.close()
  f=[n for n,c in res if not c];print(f'{len(res)-len(f)}/{len(res)} passed',f);sys.exit(1 if f else 0)
asyncio.run(main())
