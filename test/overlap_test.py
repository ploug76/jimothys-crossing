# Pop-up / label overlap test for Jimothy's Crossing.
# Every canvas label, button and pop-up registers its rectangle each frame; this checks that none of them
# overlap each other, the DOM buttons (pause/mute/help) or the Share/Install dock, on many phone sizes.
import sys,asyncio,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8800/jimothys-crossing/'
VIEWS=[(390,844,None),(375,667,None),(360,640,None),(430,932,None),(414,896,{'t':44,'b':34}),(390,844,{'t':47,'b':34}),(768,1024,None)]
CHECK=r'''(tag)=>{const L=__T.layout(),U=L.UI.filter(u=>u.k=='text'||u.k=='btn'||u.k=='pop'),tb=L.tb;const ov=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;const bad=[];
 for(let i=0;i<U.length;i++){for(let j=i+1;j<U.length;j++)if(ov(U[i],U[j]))bad.push([tag,U[i].s,U[j].s]);for(const b of tb)if(ov(U[i],b))bad.push([tag,U[i].s,'#'+b.s]);
  const vx0=-L.OXs/L.SC,vx1=(innerWidth-L.OXs)/L.SC,vy0=-L.OYs/L.SC,vy1=(innerHeight-L.OYs)/L.SC;if(U[i].x<vx0-.5||U[i].x+U[i].w>vx1+.5||U[i].y<vy0-.5||U[i].y+U[i].h>vy1+.5)bad.push([tag,'offscreen',U[i].s]);
  if(U[i].k=='pop'&&(U[i].y<L.BY||U[i].y+U[i].h>L.BY+448))bad.push([tag,'pop outside board',U[i].s])}
 const dock=['shareBtn','instBtn','dockHint'].map(i=>document.getElementById(i)).filter(e=>e&&getComputedStyle(e).display!='none'&&e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return{x:(r.left-L.OXs)/L.SC,y:(r.top-L.OYs)/L.SC,w:r.width/L.SC,h:r.height/L.SC,s:e.id}});
 for(const d of dock){for(const u of U)if(ov(d,u))bad.push([tag,'dock:'+d.s,u.s]);for(const b of tb)if(ov(d,b))bad.push([tag,'dock:'+d.s,'#'+b.s])}
 return {n:U.length,pops:U.filter(u=>u.k=='pop').length,dock:dock.length,bad}}'''
PLAY=r'''async(L)=>{window.__manual=true;const T=__T;T.start(L);T.god(true);const res={frames:0,maxPops:0,bad:[]};const words=['+20','+50 x2','+100 x3','HOME! +410','JUNE BUG +200','KIT HOME +200','GOLDEN CAN! +500','TIMER REFILLED','EXTRA LIFE!','BONK!','SPLASH!','THAT DEN IS FULL!','KIT ON BOARD!'];
 const dirs=['up','up','up','left','right','down'];
 for(let f=0;f<2400;f++){if(f%9==0)T.hop(dirs[Math.floor(Math.random()*dirs.length)]);
  if(f%13==0){const k=Math.random();T.addPop(words[Math.floor(Math.random()*words.length)],Math.random()*352,48+Math.random()*448,k<.6?'float':k<.93?'msg':'banner',{sub:k>.93?'SUNNY SEATTLE':''})}
  if(f%40==0)T.spawnPickup();if(f%600==300)T.level(L+1);
  T.update(1/60);if(f%4==0){T.render();const c=__check('play L'+L);res.frames++;res.maxPops=Math.max(res.maxPops,c.pops);res.bad.push(...c.bad)}}
 T.god(false);window.__manual=false;return res}'''
BOT=r'''async()=>{const res={frames:0,bad:[],maxPops:0};const r=__bot2(4,160,{keepAlive:true,onFrame:(t)=>{if(Math.round(t*60)%5)return;__T.render();const c=__check('bot');res.frames++;res.maxPops=Math.max(res.maxPops,c.pops);res.bad.push(...c.bad)}});res.bot=r;return res}'''
async def main():
  tot=0;frames=0
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for (w,h,safe) in VIEWS:
      ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=w<700,has_touch=True,device_scale_factor=2);pg=await ctx.new_page()
      errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'sw.js' not in m.text else None)
      if safe:await pg.add_init_script('window.__SAFE='+json.dumps(safe))
      await pg.goto(URL);await pg.wait_for_timeout(900)
      await pg.add_script_tag(path='/workspace/jimothys-crossing/test/bot2.js')
      await pg.evaluate("window.__check="+CHECK)
      bad=[];nf=0
      # title with share/install dock + iOS hint forced visible
      await pg.evaluate("()=>{__dock.forceInstall();__dock.showHint();__dock.tick();__T.render()}");r=await pg.evaluate("__check('title')");bad+=r['bad'];nf+=1
      # gameplay with forced pop-up storms, several levels/weathers
      for L in (1,3,4,8):
        r=await pg.evaluate(PLAY,L);bad+=r['bad'];nf+=r['frames']
      # real play by the planner bot (natural pop-ups: homes, trash, combos, deaths, level banners)
      r=await pg.evaluate(BOT);bad+=r['bad'];nf+=r['frames'];botinfo=r['bot']
      # pause screen
      await pg.evaluate("()=>{window.__manual=true;__T.start(2);__T.update(1);__T.togglePause();__T.render()}");r=await pg.evaluate("__check('pause')");bad+=r['bad'];nf+=1
      # game over with a full top-5 table + new best
      await pg.evaluate("()=>{localStorage.setItem('jimothys-crossing:scores',JSON.stringify([5,4,3,2].map(i=>({s:i*11111,l:i*3,d:'2026-10-18'}))));__T.togglePause();__T.addPop('BONK!',100,300,'msg');__T.setLives(1);__T.die('bonk');for(let i=0;i<120;i++)__T.update(1/60);__T.render()}")
      st=await pg.evaluate("__T.get().state");r=await pg.evaluate("__check('over')");bad+=r['bad'];nf+=1
      # help panel fits on screen and its OK button is reachable
      await pg.evaluate("()=>{__T.toTitle();document.getElementById('help').click()}");hp=await pg.evaluate("()=>{const b=document.getElementById('pclose').getBoundingClientRect(),p=document.getElementById('pbox').getBoundingClientRect();return p.top>=0&&p.bottom<=innerHeight+1&&p.left>=0&&p.right<=innerWidth+1&&b.height>30}")
      if not hp:bad.append(['help panel does not fit'])
      if st!='over':bad.append(['game over screen not reached',st])
      if errs:bad.append(['JS errors',errs[:3]])
      tot+=len(bad);frames+=nf
      print(f'{w}x{h}{" safe"+json.dumps(safe) if safe else ""}: frames {nf}, overlaps {len(bad)}, bot cleared {botinfo["levels"]} levels', ('SAMPLE '+json.dumps(bad[:5])) if bad else '',flush=True)
      await ctx.close()
    await b.close()
  print(f'TOTAL frames checked {frames}, overlaps/errors {tot}');sys.exit(1 if tot else 0)
asyncio.run(main())
