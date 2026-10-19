// ---------- game state
let state='title',paused=false,panelOpen=false,gt=0,lt=0,god=false;
let G=null,lanes=[],rail=null,pickups=[],pops=[],parts=[],drops=[],queue=[],holdDir=null,holdT=0;
const J={row:13,x:colX(5),rowF:13,fx:0,fy:0,tx:0,ty:0,hopT:0,hopping:false,dir:'up',ang:0,dead:false,dT:0,dtype:'',plat:null,drift:0,best:13,carry:false,land:0,visible:true};
const WID={log2:2.2,log3:3.1,log4:4.2,orca:3,ferry:5,crate2:2,crate3:3,sport:1.3,taxi:1.3,sedan:1.35,hatch:1.2,truck:2.1,foodtruck:2.2,coffee:2.1,bus:3.2,bike:.8,scooter:.8};
const SPEC={
 1:{dir:1,sp:38,kinds:L=>L>=4?['log3','log3','orca']:['log3'],gap:[1.4,2.4]},
 2:{dir:-1,sp:44,kinds:()=>['crate2'],gap:[1.0,2.0],sink:L=>L>=2?.34:0},
 3:{dir:1,sp:54,kinds:()=>['ferry','log4','log4'],gap:[1.7,2.8]},
 4:{dir:-1,sp:30,kinds:()=>['log2'],gap:[1.3,2.3]},
 5:{dir:1,sp:35,kinds:()=>['crate3'],gap:[1.2,2.1],sink:L=>L>=3?.3:0},
 7:{dir:-1,sp:90,kinds:()=>['sport','taxi'],gap:[3.2,6]},
 8:{dir:1,sp:46,kinds:()=>['truck','foodtruck','coffee'],gap:[3,5]},
 10:{dir:-1,sp:38,kinds:()=>['bus'],gap:[3.4,5.5]},
 11:{dir:1,sp:64,kinds:()=>['bike','scooter'],gap:[2.6,5]},
 12:{dir:-1,sp:42,kinds:()=>['sedan','sedan','hatch'],gap:[2.6,4.5]}};
const CARCOL=['#e63946','#2a9d8f','#f4a261','#457b9d','#8d5bd6','#e9c46a','#3a86ff','#ef476f','#06d6a0','#adb5bd'];
const spMul=L=>1+Math.min(1.15,(L-1)*.1);
function weather(L){const w=['day','dusk','rain','night'][(L-1)%4];return L>=8&&w=='night'?'storm':w}
const WNAME={day:'SUNNY SEATTLE',dusk:'SUNSET ON THE SOUND',rain:'RAINY DAY DOWNTOWN',night:'NIGHT SHIFT',storm:'STORMY NIGHT'};
function buildLane(r,L){const s=SPEC[r],water=r<=5,dens=Math.min(1,(L-1)/8);let g0=s.gap[0],g1=s.gap[1];
 if(water){g0+=dens*.45;g1=Math.min(3.1,g1+dens*.7)}else{g0=Math.max(1.9,g0-dens*1.1);g1=Math.max(g0+.8,g1-dens*1.9)}
 const ks=s.kinds(L),sink=s.sink?s.sink(L)+dens*.15:0,objs=[];let x=0,maxW=0,orcas=0;
 do{let k=PICK(ks);if(k=='orca'&&(orcas||objs.length==0))k='log3';if(k=='orca')orcas++;const w=WID[k]*T;
  const o={type:k,w,off:x,col:PICK(CARCOL),id:Math.random()};if(sink&&R()<sink){o.sink=true;o.ph=R()*6}objs.push(o);maxW=Math.max(maxW,w);x+=w+rnd(g0,g1)*T}
 while(x<LW+maxW+T*1.5||objs.length<2);
 if(objs.every(o=>o.sink))objs[0].sink=false;
 return{row:r,kind:water?'water':'road',dir:s.dir,speed:s.sp*spMul(L),loop:x,pad:maxW,objs}}
function buildLevel(L){lanes=[];for(const r of [1,2,3,4,5,7,8,10,11,12])lanes[r]=buildLane(r,L);
 rail={phase:'idle',t:rnd(2.5,5),dir:1,x:0,len:0,speed:0,bell:0}}
const objX=(l,o,t=lt)=>{const v=o.off+l.dir*l.speed*t;return((v%l.loop)+l.loop)%l.loop-l.pad};
const SINKP=6;
function sinkState(o,t=lt){if(!o.sink)return'up';const p=((t+o.ph)%SINKP+SINKP)%SINKP;return p<3.4?'up':p<4.5?'warn':p<5.8?'down':'rise'}
function platAt(r,x,t=lt,tol=5){const l=lanes[r];if(!l||l.kind!='water')return null;for(const o of l.objs){const ox=objX(l,o,t);if(x>=ox-tol&&x<=ox+o.w+tol){const s=sinkState(o,t);if(s=='down'||s=='rise')return null;return{l,o,ox}}}return null}
function orcaHead(p,x){if(p.o.type!='orca')return false;const hx=p.l.dir>0?p.ox+p.o.w-T*.85:p.ox,hw=T*.85;return x>=hx-2&&x<=hx+hw+2}
function railRange(t=0){if(!rail)return null;if(rail.phase=='go'){const x=rail.x+rail.dir*rail.speed*t;return[x,x+rail.len]}if(rail.phase=='warn'&&t>rail.t){const tt=t-rail.t,x=rail.dir>0?-rail.len0+rail.speed0*tt:LW-rail.speed0*tt;return[x,x+rail.len0]}return null}
// safety prediction used by hazards, hints and the automated tests
function safeAt(r,x,t=0){const k=laneKind(r);
 if(k=='road'){const l=lanes[r];for(const o of l.objs){const ox=objX(l,o,lt+t);if(x+9>ox+2&&x-9<ox+o.w-2)return false}return true}
 if(k=='rail'){if(rail.phase=='warn'&&rail.t<t+.2)return false;const rr=railRange(t);return!(rr&&x+9>rr[0]&&x-9<rr[1])}
 if(k=='water'){const p=platAt(r,x,lt+t);return!!p&&!orcaHead(p,x)}
 if(k=='safe'&&G&&G.gull){const gx=G.gull.x+G.gull.dir*G.gull.sp*t*(G.gull.wait>0?0:1);if(Math.abs(gx-x)<22)return false}
 return true}
function newGame(L=1){G={L,score:0,lives:3,homes:[0,0,0,0,0],time:TIME_MAX,w:weather(L),nextLife:10000,combo:0,lastTrash:-9,trash:0,golds:0,homesTotal:0,bugT:rnd(5,8),bug:null,crowT:rnd(6,10),crow:null,kit:null,kitT:rnd(6,10),gull:null,pickT:2,goldDone:false,clearT:0,deathPause:0,tickS:99,levelsCleared:0,hint:0};
 startLevel(L,true)}
function startLevel(L,first){G.L=L;ST.set('maxL',Math.max(ST.get('maxL',1),L));G.w=weather(L);G.homes=[0,0,0,0,0];lt=0;buildLevel(L);pickups=[];G.bug=null;G.crow=null;G.kit=null;G.goldDone=false;
 G.gull=L>=3?{x:R()<.5?20:LW-20,dir:R()<.5?1:-1,sp:26+L*2,wait:0}:null;
 initDrops();respawn();playSong(G.w=='night'||G.w=='storm'||G.w=='rain'?'night':'day');
 addPop('LEVEL '+L,LW/2,BY+6.5*T,'banner',{life:2.3,col:'#ffd23f',sub:WNAME[G.w]});
 const tip=L==1?(ST.get('played',0)?'':'SWIPE OR TAP TO HOP!'):L==2?'RESCUE THE BABY RACCOON ON THE LOGS: +200':L==3?'WATCH OUT FOR SEAGULLS AND CROWS!':L==4?'ORCAS! RIDE THE BACK, NOT THE MOUTH':'';
 if(tip)addPop(tip,LW/2,BY+10.5*T,'msg',{life:3.2,col:'#ffffff',size:13,pri:5})}
function respawn(){Object.assign(J,{row:13,rowF:13,x:colX(5),hopping:false,dead:false,dir:'up',ang:0,plat:null,drift:0,best:13,carry:false,land:0,visible:true});queue=[];G.time=TIME_MAX;G.tickS=99}
// ---------- input → hops (grid snapped, buffered)
function tryMove(d){if(state!='play'||paused||panelOpen||!G||J.dead||G.clearT>0)return false;
 if(J.hopping||J.land>0.04){queue.push({d,t:gt});if(queue.length>2)queue.shift();return true}
 return doHop(d)}
function doHop(d){let tr=J.row,tx=J.x;const dx=d=='left'?-1:d=='right'?1:0,dy=d=='up'?-1:d=='down'?1:0;tr+=dy;
 J.dir=d;J.ang={up:0,right:PI/2,down:PI,left:-PI/2}[d];
 if(tr>ROWS-1||tr<0){SFX.bump();return false}
 const k=laneKind(tr);let drift=0;
 if(J.plat&&J.plat.l)drift=J.plat.l.dir*J.plat.l.speed;
 if(isLand(tr)){const cl=dx?nearCol(J.x)+dx:nearCol(J.x);if(cl<0||cl>=COLS){SFX.bump();return false}tx=colX(cl);drift=0}
 else if(k=='water'){tx=J.x+dx*T;if(tx<8||tx>LW-8){SFX.bump();return false}}
 else{const ax=J.x+drift*HOP;J.den=-1;for(let i=0;i<5;i++)if(Math.abs(ax-DENS[i])<=14)J.den=i;tx=J.den>=0?DENS[J.den]:ax;drift=0}
 Object.assign(J,{fx:J.x,fy:J.row,tx,ty:tr,hopT:0,hopping:true,drift});J.plat=null;SFX.hop();return true}
function endHop(){J.hopping=false;J.row=J.ty;J.rowF=J.row;J.x=J.tx;J.land=.07;
 const k=laneKind(J.row);
 if(J.row<J.best){J.best=J.row;addScore(10,false)}
 if(k=='home'){reachHome();return}
 if(k=='water'){const p=platAt(J.row,J.x);if(!p){die('splash');return}if(orcaHead(p,J.x)){die('orca');return}J.plat=p}
 else J.plat=null}
function reachHome(){const i=J.den;
 if(i<0){die('wall');return}if(G.homes[i]){die('full');return}if(G.crow&&G.crow.i==i&&G.crow.ph=='sit'){die('crow');return}
 G.homes[i]=1;G.homesTotal++;const tb=Math.floor(G.time*2)*10;addScore(50+tb);SFX.home();vib(30);
 addPop('HOME! +'+(50+tb),DENS[i],BY+T*1.4,'float',{col:'#ffd23f',size:15});
 if(G.bug&&G.bug.i==i){addScore(200);addPop('JUNE BUG +200',DENS[i],BY+T*1.9,'float',{col:'#9bff6a'});SFX.bug();G.bug=null;burst(DENS[i],BY+T/2,'#9bff6a',14)}
 if(J.carry){addScore(200);addPop('KIT HOME +200',DENS[i],BY+T*2.3,'float',{col:'#ffb3d9'});SFX.kit()}
 burst(DENS[i],BY+T/2,'#ffd23f',18);
 if(G.homes.every(h=>h)){addScore(1000);G.levelsCleared++;addPop('ALL 5 DENS! +1000',LW/2,BY+6.5*T,'banner',{life:2.3,col:'#7CFC9A',sub:'LEVEL '+G.L+' CLEAR'});SFX.clear();G.clearT=2.5;J.visible=false;J.hopping=false;queue=[];return}
 respawn()}
function addScore(n,pop){const before=G.score;G.score+=n;if(G.score>=G.nextLife){G.nextLife+=10000;if(G.lives<9){G.lives++;SFX.oneup();addPop('EXTRA LIFE!',LW/2,BY+8.5*T,'msg',{col:'#7CFC9A',size:18,pri:4})}}}
const DEATHMSG={bonk:'BONK!',splash:'SPLASH!',swept:'SWEPT AWAY!',time:"TIME'S UP!",gull:'SEAGULL GOT YOU!',crow:'CROW IN THAT CAN!',orca:'ORCA CHOMP!',wall:'OUCH! AIM FOR A CAN',full:'THAT DEN IS FULL!',train:'LIGHT RAIL! BONK!'};
function die(type){if(J.dead||god&&type!='time')return;if(god&&type=='time'){G.time=TIME_MAX;return}
 J.dead=true;J.dT=0;J.dtype=type;J.hopping=false;queue=[];holdDir=null;G.lives--;G.combo=0;
 const wet=type=='splash'||type=='swept'||type=='orca';if(wet){SFX.splash();splash(J.x,BY+J.rowF*T+T/2)}else{SFX.bonk();burst(J.x,BY+J.rowF*T+T/2,'#ffffff',10)}
 SFX.die();vib([60,40,90]);addPop(DEATHMSG[type]||'OOPS!',J.x,BY+J.rowF*T-4,'msg',{col:'#ff6b6b',size:17,life:1.4,pri:3})}
// ---------- particles
function burst(x,y,col,n){for(let i=0;i<n;i++){const a=R()*TAU,s=rnd(30,110);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(.4,.8),t:0,col,sz:rnd(1.5,3.5),g:120})}}
function splash(x,y){for(let i=0;i<22;i++){const a=-PI/2+rnd(-1.3,1.3),s=rnd(40,140);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(.4,.9),t:0,col:i%3?'#bfe9ff':'#ffffff',sz:rnd(1.5,3),g:300})}parts.push({ring:1,x,y,t:0,life:.9})}
function initDrops(){drops=[];const n=G&&G.w=='storm'?150:G&&G.w=='rain'?110:0;for(let i=0;i<n;i++)drops.push({x:R()*LW,y:R()*(HUDH+BH),s:rnd(380,520),l:rnd(8,15)})}
// ---------- popups (score floats, messages, banners) — laid out so they never overlap
function addPop(text,x,y,kind='float',o={}){const life=o.life||(kind=='float'?1.05:kind=='msg'?1.4:2.2);
 if(kind=='banner')pops=pops.filter(p=>p.kind!='banner');
 pops.push({text,x,y,kind,born:gt,life,col:o.col||'#fff',size:o.size||(kind=='banner'?30:kind=='msg'?16:14),sub:o.sub||'',pri:o.pri||(kind=='banner'?9:kind=='msg'?3:1),vis:false});
 if(pops.length>14)pops.splice(pops.findIndex(p=>p.kind=='float'),1)}
// ---------- update
function step(dt){let rem=dt;while(rem>1e-6){const s=Math.min(rem,1/120);update(s);rem-=s}}
function update(dt){gt+=dt;lt+=dt;updRail(dt);
 for(const p of parts){p.t+=dt;if(!p.ring){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g||0)*dt}}parts=parts.filter(p=>p.t<p.life);
 for(const d of drops){d.y+=d.s*dt;d.x-=d.s*.18*dt;if(d.y>HUDH+BH){d.y=-10;d.x=R()*(LW+60)}}
 pops=pops.filter(p=>gt-p.born<p.life);
 if(state!='play'||!G)return;
 if(G.clearT>0){G.clearT-=dt;if(G.clearT<=0){G.clearT=0;startLevel(G.L+1)}return}
 updHazards(dt);
 if(J.dead){J.dT+=dt;if(J.dT>1.45){if(G.lives<=0)gameOver();else respawn()}return}
 // timer
 G.time-=dt;const s=Math.ceil(G.time);if(G.time<=6&&s!=G.tickS){G.tickS=s;if(s>0)SFX.tick()}if(G.time<=0){G.time=0;die('time');return}
 // hop tween
 if(J.land>0)J.land-=dt;
 if(J.hopping){J.hopT+=dt/HOP;J.fx+=J.drift*dt;J.tx+=J.drift*dt;const k=Math.min(1,J.hopT),e=1-(1-k)*(1-k);J.x=LERP(J.fx,J.tx,e);J.rowF=LERP(J.fy,J.ty,e);if(J.hopT>=1)endHop()}
 else if(J.plat){const p=J.plat;J.x+=p.l.dir*p.l.speed*dt;const q=platAt(J.row,J.x,lt,7);if(!q||q.o!==p.o){die(J.x<6||J.x>LW-6?'swept':'splash');return}J.plat=q;if(orcaHead(q,J.x)){die('orca');return}if(J.x<5||J.x>LW-5){die('swept');return}}
 if(J.dead)return;
 if(!J.hopping&&J.land<=0.04&&queue.length){while(queue.length&&gt-queue[0].t>.45)queue.shift();if(queue.length)doHop(queue.shift().d)}
 if(holdDir&&!J.hopping&&!queue.length&&gt>=holdT){if(doHop(holdDir))holdT=gt+.16;else holdT=gt+.3}
 collide();if(J.dead)return;collect()}
function updRail(dt){const r=rail;if(!r)return;const sm=G?spMul(G.L):1;r.speed0=330+(G?G.L:1)*24;r.len0=r.len0||T*4.8;
 if(r.phase=='idle'){r.t-=dt;if(r.t<=0){r.phase='warn';r.t=1.6;r.dir=R()<.5?1:-1;r.len0=T*(R()<.5?4.8:7.2);r.bell=0}}
 else if(r.phase=='warn'){r.t-=dt;r.bell-=dt;if(r.bell<=0){r.bell=.42;if(state=='play'&&!J.dead)SFX.bell()}if(r.t<=0){r.phase='go';r.len=r.len0;r.speed=r.speed0;r.x=r.dir>0?-r.len:LW}}
 else{r.x+=r.dir*r.speed*dt;if(r.dir>0?r.x>LW+4:r.x+r.len<-4){r.phase='idle';r.t=rnd(3.5,7.5)/sm}}}
function updHazards(dt){const L=G.L;
 // june bug in an empty den
 if(G.bug){G.bug.t-=dt;if(G.bug.t<=0||G.homes[G.bug.i])G.bug=null}else{G.bugT-=dt;if(G.bugT<=0){const e=[0,1,2,3,4].filter(i=>!G.homes[i]&&!(G.crow&&G.crow.i==i));if(e.length)G.bug={i:PICK(e),t:4.5};G.bugT=rnd(6,10)}}
 // crows (level 3+)
 if(L>=3){if(G.crow){const cw=G.crow;cw.t-=dt;if(cw.ph=='land'&&cw.t<=0){cw.ph='sit';cw.t=rnd(2.5,4);SFX.crow()}else if(cw.ph=='sit'&&cw.t<=0){cw.ph='leave';cw.t=.6}else if(cw.ph=='leave'&&cw.t<=0)G.crow=null}
  else{G.crowT-=dt;if(G.crowT<=0){const e=[0,1,2,3,4].filter(i=>!G.homes[i]&&!(G.bug&&G.bug.i==i));if(e.length>1)G.crow={i:PICK(e),ph:'land',t:.9};G.crowT=rnd(5,9)}}}
 // seagull patrols the promenade (level 3+)
 if(G.gull){const s=G.gull;if(s.wait>0)s.wait-=dt;else{s.x+=s.dir*s.sp*dt;if(s.x<14||s.x>LW-14){s.x=CL(s.x,14,LW-14);s.dir*=-1;s.wait=rnd(.6,1.6);if(R()<.4&&state=='play')SFX.gull()}else if(R()<dt*.25){s.wait=rnd(.5,1.2)}}}
 // baby raccoon kit riding a log (level 2+)
 if(L>=2){if(G.kit){const k=G.kit,l=lanes[k.row],ox=objX(l,k.o);k.wt+=dt;k.off=CL(k.off+Math.sin(k.wt*1.3)*14*dt,8,k.o.w-8);k.x=ox+k.off;if(k.x<-10||k.x>LW+10)G.kit=null}
  else if(!J.carry){G.kitT-=dt;if(G.kitT<=0){G.kitT=rnd(9,15);const row=PICK([1,4]),l=lanes[row],c=l.objs.filter(o=>o.type.startsWith('log')).map(o=>({o,x:objX(l,o)})).filter(q=>(l.dir>0?q.x>-q.o.w&&q.x<LW*.35:q.x>LW*.45&&q.x<LW));if(c.length){const q=PICK(c);G.kit={row,o:q.o,off:q.o.w/2,wt:0,x:q.x+q.o.w/2}}}}}
 // trash pickups
 G.pickT-=dt;if(G.pickT<=0){G.pickT=rnd(2.6,4.8);if(pickups.length<5)spawnPickup()}
 for(const p of pickups){p.t+=dt;if(p.plat){p.x=objX(p.plat.l,p.plat.o)+p.off}}
 pickups=pickups.filter(p=>p.t<p.life&&p.x>-20&&p.x<LW+20)}
function spawnPickup(type,row,col){const r=R();type=type||(!G.goldDone&&r<.07?'gold':r<.52?'soda':r<.82?'pizza':'can');if(type=='gold')G.goldDone=true;
 row=row??PICK([6,6,7,8,10,11,12,12,2,3,4,1,5]);const p={type,row,t:0,life:type=='gold'?6.5:9,x:0,plat:null,off:0};
 if(laneKind(row)=='water'){const l=lanes[row],c=l.objs.filter(o=>!o.sink&&o.type!='orca').map(o=>({o,x:objX(l,o)})).filter(q=>q.x>0&&q.x+q.o.w<LW);if(!c.length)return;const q=PICK(c);p.plat={l,o:q.o};p.off=rnd(10,q.o.w-10);p.x=q.x+p.off}
 else{let cl=col??Math.floor(R()*COLS);if(col==null&&cl==nearCol(J.x)&&row==J.row)cl=(cl+3)%COLS;p.x=colX(cl);if(pickups.some(q=>q.row==row&&Math.abs(q.x-p.x)<T))return}
 pickups.push(p);return p}
const TRASH={soda:[20,'SODA CAN'],pizza:[50,'PIZZA BOX'],can:[100,'TRASH CAN'],gold:[500,'GOLDEN CAN']};
function collect(){for(const p of pickups){if(p.got)continue;if(Math.abs(J.rowF-p.row)<.45&&Math.abs(J.x-p.x)<17){p.got=1;
 G.combo=gt-G.lastTrash<3.2?Math.min(4,G.combo+1):1;G.lastTrash=gt;const [pts,name]=TRASH[p.type];const tot=pts*(p.type=='gold'?1:G.combo);addScore(tot);G.trash++;
 const py=BY+p.row*T;
 if(p.type=='gold'){G.golds++;G.time=TIME_MAX;SFX.gold();vib(40);addPop('GOLDEN CAN! +500',p.x,py,'msg',{col:'#ffd700',size:17,pri:4});addPop('TIMER REFILLED',p.x,py+20,'float',{col:'#ffe680',size:13});burst(p.x,py+16,'#ffd700',24)}
 else{SFX[p.type]();if(G.combo>1)SFX.combo();addPop('+'+tot+(G.combo>1?' x'+G.combo:''),p.x,py,'float',{col:p.type=='pizza'?'#ffb347':p.type=='can'?'#9ad0ff':'#c6ff8a'});burst(p.x,py+16,'#ffffff',8)}}}
 pickups=pickups.filter(p=>!p.got);
 if(G.kit&&!J.carry&&Math.abs(J.rowF-G.kit.row)<.45&&Math.abs(J.x-G.kit.x)<16){J.carry=true;G.kit=null;SFX.kit();addPop('KIT ON BOARD!',J.x,BY+J.row*T,'float',{col:'#ffb3d9'})}}
function collide(){const jy=BY+J.rowF*T+T/2,jt=jy-9,jb=jy+9,jl=J.x-9,jr=J.x+9;
 for(const r of [7,8,10,11,12]){const top=BY+r*T+5,bot=BY+r*T+T-5;if(jb<top||jt>bot)continue;const l=lanes[r];for(const o of l.objs){const ox=objX(l,o);if(jr>ox+2&&jl<ox+o.w-2){die('bonk');return}}}
 {const top=BY+9*T+4,bot=BY+10*T-4;if(!(jb<top||jt>bot)&&rail.phase=='go'&&jr>rail.x+2&&jl<rail.x+rail.len-2){die('train');return}}
 if(G.gull){const top=BY+6*T+4,bot=BY+7*T-4;if(!(jb<top||jt>bot)&&Math.abs(G.gull.x-J.x)<17){die('gull');return}}}
function gameOver(){state='over';chrome();SFX.over();playSong('title');ST.set('played',1);
 const hs=ST.get('scores',[]);const e={s:G.score,l:G.L,d:(()=>{const n=new Date();return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0')})()};hs.push(e);hs.sort((a,b)=>b.s-a.s);const top=hs.slice(0,5);ST.set('scores',top);
 G.rank=top.indexOf(e);G.newBest=G.rank==0&&G.score>0;ST.set('best',Math.max(ST.get('best',0),G.score));ST.set('maxL',Math.max(ST.get('maxL',1),G.L))}
function start(L=1){A();state='play';paused=false;newGame(L);chrome();ST.set('played',1)}
