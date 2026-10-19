// Search-based bot: plans hop sequences with the game's own deterministic lane model (safeAt/platAt).
// Used to prove each level can be cleared, and to drive long automated play sessions.
window.__bot2=function(maxLevel,maxSecs,opts={}){const T=__T,H=0.118,DW=0.045,STEP=0.05,HZ=opts.hz||5.5,DT=1/60;window.__manual=true;T.start(opts.startL||1);
 const colX=c=>c*32+16,near=x=>Math.max(0,Math.min(10,Math.round((x-16)/32)));const kind=r=>r==0?'home':r<=5?'water':r==6?'safe':r==9?'rail':r<=12?'road':'start';
 const landish=r=>{const k=kind(r);return k=='safe'||k=='road'||k=='rail'||k=='start'};
 function spd(r,x,t){if(kind(r)!='water')return 0;const p=T.platAt2(r,x,t);return p?p.speed:null}
 function hopSim(r,x,t,d,homes){const dx=d=='left'?-1:d=='right'?1:0,dy=d=='up'?-1:d=='down'?1:0,r1=r+dy;if(r1<0||r1>13)return null;
  const drift=kind(r)=='water'?(spd(r,x,t)||0):0;let x1;
  if(landish(r1)){const c=dx?near(x)+dx:near(x);if(c<0||c>10)return null;x1=colX(c)}
  else if(kind(r1)=='water'){x1=x+dx*32;if(x1<8||x1>344)return null}
  else{const ax=x+drift*H;let i=-1;for(let k=0;k<5;k++)if(Math.abs(ax-T.dens[k])<=14)i=k;if(i<0||homes[i])return null;const cw=T.crow();if(cw&&cw.i==i)return null;return{r:0,x:T.dens[i],t:t+H,home:i}}
  const wd=kind(r1)=='water'?drift:0;
  for(let tt=0;tt<=H+1e-9;tt+=H/6){const k=tt/H,e=1-(1-k)*(1-k),xx=x+(x1-x)*e+wd*tt;for(const rr of [e<.75?r:-1,e>.25?r1:-1]){if(rr<0)continue;if(landish(rr)&&!T.safeAt(rr,xx,t+tt-T.now()))return null}}
  const lx=x1+wd*H;if(kind(r1)=='water'){const p=T.platAt2(r1,lx,t+H);if(!p||p.orca)return null}
  return{r:r1,x:lx,t:t+H+DW}}
 function waitSim(r,x,t){const t2=t+STEP;if(kind(r)=='water'){const s=spd(r,x,t);if(s==null)return null;const x2=x+s*STEP;if(x2<6||x2>346)return null;const p=T.platAt2(r,x2,t2);if(!p||p.orca)return null;return{r,x:x2,t:t2}}
  if(!T.safeAt(r,x,t2-T.now()))return null;return{r,x,t:t2}}
 function plan(){const s=T.get(),homes=s.homes,t0=T.now();const start={r:s.row,x:s.x,t:t0,first:null};let best=start,frontier=[start],seen=new Set();
  const key=n=>n.r+':'+Math.round(n.x/3)+':'+Math.round((n.t-t0)/STEP);let found=null,count=0;
  while(frontier.length&&!found){const nf=[];for(const n of frontier){if(n.t-t0>HZ)continue;
    for(const d of ['up','left','right','down','wait']){const m=d=='wait'?waitSim(n.r,n.x,n.t):hopSim(n.r,n.x,n.t,d,homes);if(!m)continue;m.first=n.first||d;count++;
     if(m.home!=null){if(!found||m.t<found.t)found=m;continue}const k=key(m);if(seen.has(k))continue;seen.add(k);
     if(m.r<best.r||(m.r==best.r&&m.t<best.t))best=m;nf.push(m)}}
   nf.sort((a,b)=>a.t-b.t);frontier=nf.slice(0,4000)}
  return{act:(found||best).first,found:!!found,count}}
 let t=0,deaths=0,lastLives=T.get().lives,levels=0,lastL=T.get().L,trace=[],homes=0,plans=0,maxNodes=0;
 while(t<maxSecs){const s=T.get(),J=T.J();
  if(s.state=='play'&&!s.dead&&!s.hopping&&!s.queue&&J.land<=0.04&&!s.clearT){const p=plan();plans++;maxNodes=Math.max(maxNodes,p.count);if(p.act&&p.act!='wait')T.hop(p.act)}
  T.update(DT);t+=DT;if(opts.onFrame)opts.onFrame(t);const s2=T.get();
  if(s2.state!='play'){trace.push('over L'+s2.L);break}
  if(s2.lives<lastLives){deaths++;trace.push(`${T.J().dtype} L${s2.L} r${s2.row} x${Math.round(s2.x)}`)}lastLives=s2.lives;
  if(s2.L>lastL){levels++;trace.push(`clear L${lastL} @${Math.round(t)}s`);lastL=s2.L;if(s2.L>maxLevel)break}
  if(opts.keepAlive&&s2.lives<2){T.setLives(3);lastLives=3}}
 const s=T.get();window.__manual=false;return{levels,deaths,t:Math.round(t),L:s.L,score:s.score,plans,maxNodes,trace:trace.slice(-16)}}
