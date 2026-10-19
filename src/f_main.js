// ---------- screens
function dim(a,y0=-OYs/SC){g.fillStyle=`rgba(5,14,28,${a})`;g.fillRect(-400,y0,LW+800,LH-y0+OYs/SC+SAFE.b/SC+4)}
function drawTitle(){dim(.58);const best=ST.get('best',0),maxL=ST.get('maxL',1);
 let y=60+22;const s1=fitSize("JIMOTHY'S",40,LW-40);const s2=fitSize('CROSSING',48,LW-40);txt("JIMOTHY'S",LW/2,y,s1,'#ffd23f','center',{stroke:7,sc:'#16324f'});y+=s1*.6+s2*.6+3;
txt('CROSSING',LW/2,y,s2,'#ffffff','center',{stroke:7,sc:'#16324f'});y+=s2*.6+16;
 const tag="Help Seattle's famous raccoon cross the city!";txt(tag,LW/2,y,fitSize(tag,13,LW-30),'#cfe3ff');y+=16;
 const bl=[['▶  PLAY','#2e9e5b',()=>start(1)]];if(maxL>1)bl.push(['CONTINUE AT LEVEL '+maxL,'#2b6cb0',()=>start(maxL)]);bl.push(['HOW TO PLAY','#8d5bd6',showHelp]);bl.push(['D-PAD: '+(dpadOn?'ON':'OFF'),'#56616e',toggleDpad]);
 const bh=44,gap=10,bw=Math.min(250,LW-40),bestY=LH-16-(LH>=600?58:0),btop=bestY-18-bl.length*(bh+gap)+gap;
 const area=btop-12-y;if(area>70){const s=Math.min(1.7,area/122),cy=y+46*s+(area-118*s)/2;drawJimFront(LW/2,cy,s,gt)}
 bl.forEach((b,i)=>button(b[0],LW/2-bw/2,btop+i*(bh+gap),bw,bh,b[1],b[2],{sz:b[0].length>14?16:19}));
 txt('BEST  '+String(best).padStart(6,'0'),LW/2,bestY,14,'#ffd23f')}
function drawPause(){dim(.6,BY);let y=BY+2.6*T;txt('PAUSED',LW/2,y,34,'#ffd23f','center',{stroke:6,sc:'#16324f'});y+=40;const bw=Math.min(230,LW-60);
 [['▶  RESUME','#2e9e5b',togglePause],['RESTART','#2b6cb0',()=>{paused=false;start(1)}],['MAIN MENU','#56616e',toTitle]].forEach((b,i)=>button(b[0],LW/2-bw/2,y+i*56,bw,44,b[1],b[2]));
 y+=3*56+18;const tip='The game pauses by itself if you switch apps.';txt(tip,LW/2,y,fitSize(tip,12,LW-30),'#cfe3ff','center',{w:'normal'})}
function drawOver(){dim(.8,BY);let y=BY+32;const s=fitSize('GAME OVER',38,LW-30);txt('GAME OVER',LW/2,y,s,'#ff6b6b','center',{stroke:6,sc:'#2a0d0d'});y+=s*.6+24*.6+5;
 txt('SCORE  '+G.score.toLocaleString(),LW/2,y,24,'#fff');y+=28;
 if(G.newBest)txt('★ NEW BEST SCORE! ★',LW/2,y,16,'#ffd23f');else if(G.rank>=0&&G.score>0)txt('#'+(G.rank+1)+' ON YOUR TOP 5',LW/2,y,15,'#7CFC9A');else txt('BEST  '+ST.get('best',0).toLocaleString(),LW/2,y,15,'#ffd23f');y+=24;
 const st=`LEVEL ${G.L}  •  DENS ${G.homesTotal}  •  TRASH ${G.trash}`;txt(st,LW/2,y,fitSize(st,13,LW-24),'#cfe3ff');y+=19;
 if(G.golds){txt('GOLDEN CANS  '+G.golds,LW/2,y,13,'#ffd700');y+=19}
 y+=8;txt('TOP SCORES',LW/2,y,14,'#ffd23f');y+=19;const hs=ST.get('scores',[]);
 hs.forEach((e,i)=>{const s=`${i+1}.  ${String(e.s).padStart(6,'0')}   LV ${e.l}   ${e.d||''}`;txt(s,LW/2,y,fitSize(s,13,LW-30),i==G.rank?'#7CFC9A':'#ffffff','center',{w:'normal'});y+=18});
 const bw=Math.min(230,LW-60),by=Math.max(y+12,LH-20-44*2-10);const gap=by-y-8;if(gap>84){const sc=Math.min(1.15,(gap-6)/120);drawJimFront(LW/2,y+4+46*sc+(gap-118*sc)/2,sc,gt,'sad')}
 button('▶  PLAY AGAIN',LW/2-bw/2,by,bw,44,'#2e9e5b',()=>{if(gt-overAt>.7)start(1)});button('MAIN MENU',LW/2-bw/2,by+54,bw,44,'#56616e',()=>{if(gt-overAt>.7)toTitle()})}
function render(){UI=[];menuBtns=[];g.setTransform(1,0,0,1,0,0);g.fillStyle='#0b1622';g.fillRect(0,0,c.width,c.height);g.setTransform(SC*DPR,0,0,SC*DPR,OXs*DPR,OYs*DPR);
 drawWorld();
 if(state=='title')drawTitle();
 else{drawHUD();if(state=='play'){drawBar();drawControls();if(paused)drawPause();else drawPops()}else if(state=='over')drawOver()}
 lastUI=UI;BTN=state=='title'?UI.slice():[]}
// ---------- flow
let overAt=-9;
function toTitle(){state='title';paused=false;G=null;pops=[];pickups=[];buildLevel(1);lt=0;chrome();playSong('title')}
const _go=gameOver;gameOver=function(){_go();overAt=gt};
function togglePause(){if(state!='play')return;paused=!paused;holdDir=null;swipe=null;dpadPtr=null;if(!paused)queue=[];chrome()}
function toggleDpad(){dpadOn=!dpadOn;ST.set('dpad',dpadOn);onResize()}
function chrome(){$('pause').style.display=state=='play'?'block':'none';$('mute').style.display='block';$('help').style.display='block';$('pause').textContent=paused?'▶':'⏸';$('pause').setAttribute('aria-label',paused?'Resume':'Pause');try{if(window.__dock)__dock.tick()}catch(e){}}
function showHelp(){if(state=='play'&&!paused)togglePause();panelOpen=true;$('ptext').innerHTML=`<h2>🦝 Jimothy's Crossing</h2>
<p>Jimothy, Seattle's famous chunky raccoon, is waddling home! Hop him across busy streets and the Sound and tuck him into all <b>5 trash-can dens</b> at the top.</p>
<h3>Controls</h3><ul><li><b>Swipe</b> up / down / left / right to hop one space.</li><li><b>Tap</b> anywhere to hop forward.</li><li>Or use the <b>D-pad</b> (hold to keep hopping) or arrow keys / WASD.</li><li>Quick taps are remembered, so you can chain hops.</li></ul>
<h3>Watch out</h3><ul><li>Cars, Metro buses, trucks, bikes and scooters.</li><li>🚈 Light rail: when the lights flash and the bell rings, a train is coming!</li><li>🌊 Jimothy can't swim. Ride logs, ferries and crates. Crates that wobble are about to sink!</li><li>Don't get carried off the edge of the screen.</li><li>Level 3+: a seagull on the promenade and crows that sit in the dens.</li><li>Level 4+: orcas. Ride the back, never the mouth!</li></ul>
<h3>Points</h3><table><tr><td>Each new row forward</td><td>10</td></tr><tr><td>Reaching a den</td><td>50 + time bonus</td></tr><tr><td>🥤 Soda can / 🍕 Pizza box / 🗑️ Trash can</td><td>20 / 50 / 100</td></tr><tr><td>Grab trash quickly in a row</td><td>combo up to x4</td></tr><tr><td>✨ Golden can (rare)</td><td>500 + full timer</td></tr><tr><td>🪲 June bug in a den</td><td>200</td></tr><tr><td>🦝 Bring the baby raccoon home</td><td>200</td></tr><tr><td>All 5 dens filled</td><td>1000</td></tr></table>
<p>Extra life every 10,000 points. Each level gets faster and busier, with sunsets, Seattle rain and night shifts. Your best scores are saved on this device.</p>`;$('panel').style.display='flex'}
$('pclose').onclick=e=>{e.stopPropagation();$('panel').style.display='none';panelOpen=false};
['pointerdown','touchstart','mousedown'].forEach(ev=>{$('panel').addEventListener(ev,e=>e.stopPropagation());document.querySelectorAll('.tb').forEach(b=>b.addEventListener(ev,e=>e.stopPropagation()))});
$('mute').onclick=e=>{e.stopPropagation();A();setMute(!muted);if(!muted&&!musicOn)playSong(state=='title'?'title':songName||'day')};
$('pause').onclick=e=>{e.stopPropagation();A();togglePause()};
$('help').onclick=e=>{e.stopPropagation();A();showHelp()};
// ---------- input: swipe anywhere, tap = hop up, D-pad with hold-repeat, keyboard
let swipe=null,dpadPtr=null,downBtn=null;
const inR=(b,x,y,p=0)=>x>=b.x-p&&x<=b.x+b.w+p&&y>=b.y-p&&y<=b.y+b.h+p;
c.addEventListener('pointerdown',e=>{e.preventDefault();A();if(!musicOn)playSong(state=='play'&&G?(G.w=='day'||G.w=='dusk'?'day':'night'):'title');const [x,y]=toL(e.clientX,e.clientY);
 if(state!='play'||paused){downBtn=menuBtns.find(b=>inR(b,x,y,4))||null;return}
 if(DPAD){const b=DPAD.btns.find(b=>inR(b,x,y,8));if(b){dpadPtr=e.pointerId;holdDir=b.d;holdT=gt+.24;tryMove(b.d);return}}
 swipe={id:e.pointerId,x:e.clientX,y:e.clientY,t0:performance.now(),fired:false}},{passive:false});
c.addEventListener('pointermove',e=>{if(dpadPtr===e.pointerId&&DPAD){const [x,y]=toL(e.clientX,e.clientY);const b=DPAD.btns.find(b=>inR(b,x,y,8));if(b&&b.d!=holdDir){holdDir=b.d;holdT=gt+.24;tryMove(b.d)}return}
 if(!swipe||swipe.id!==e.pointerId)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y,th=Math.max(16,Math.min(26,innerWidth*.055));
 const d=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
 // one flick = one hop; keep dragging well past it (or turn) to chain more hops
 if(Math.hypot(dx,dy)>=(swipe.last==d?th*3.2:th)){tryMove(d);swipe.x=e.clientX;swipe.y=e.clientY;swipe.fired=true;swipe.last=d}});
function ptrEnd(e){if(dpadPtr===e.pointerId){dpadPtr=null;holdDir=null}
 if(swipe&&swipe.id===e.pointerId){if(!swipe.fired&&performance.now()-swipe.t0<450)tryMove('up');swipe=null}
 if(downBtn&&e.type=='pointerup'){const [x,y]=toL(e.clientX,e.clientY);const b=menuBtns.find(b=>inR(b,x,y,6));if(b&&b.x==downBtn.x&&b.y==downBtn.y){SFX.click();b.fn()}}downBtn=null}
c.addEventListener('pointerup',ptrEnd);c.addEventListener('pointercancel',ptrEnd);
const KM={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
addEventListener('keydown',e=>{if(panelOpen){if(e.key=='Escape'||e.key=='Enter'){$('pclose').click();e.preventDefault()}return}const k=e.key;A();
 if(KM[k]){e.preventDefault();if(state=='play'&&!paused){if(e.repeat&&(J.hopping||queue.length))return;tryMove(KM[k])}return}
 if(k=='p'||k=='P'||k=='Escape'){togglePause();return}if(k=='m'||k=='M'){setMute(!muted);return}
 if(k==' '||k=='Enter'){e.preventDefault();if(state=='title')start(1);else if(state=='over'&&gt-overAt>.8)start(1);else if(paused)togglePause();else if(state=='play')tryMove('up')}});
// auto-pause when the app is backgrounded (phone call, app switch, screen lock)
function bg(){if(state=='play'&&!paused)togglePause()}
document.addEventListener('visibilitychange',()=>{if(document.hidden)bg()});addEventListener('pagehide',bg);addEventListener('blur',bg);
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
// ---------- main loop (all timers run on game time: frozen while paused / backgrounded)
let lastT=0;function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-lastT)/1000||0);lastT=now;if(!window.__manual&&!paused&&!panelOpen&&!document.hidden)step(dt);render()}
onResize();buildLevel(1);setMute(muted);chrome();requestAnimationFrame(t=>{lastT=t;frame(t)});
// ---------- test hooks
function makeIcon(S){const cv=document.createElement('canvas');cv.width=cv.height=S;const old=g;g=cv.getContext('2d');const k=S/100;g.scale(k,k);
 const gr=g.createLinearGradient(0,0,0,100);gr.addColorStop(0,'#2f8fcf');gr.addColorStop(.55,'#1e6fa8');gr.addColorStop(.56,'#3b3e44');gr.addColorStop(1,'#2c2f34');g.fillStyle=gr;g.fillRect(0,0,100,100);
 g.fillStyle='#e8e8e8';for(let i=4;i<100;i+=18)g.fillRect(i,77,9,2);g.fillStyle='#ffd23f';g.fillRect(0,56,100,2);
 drawJimFront(50,49,.62,0.35);g=old;return cv.toDataURL('image/png')}
window.__T={icon:makeIcon,get:()=>({state,paused,panelOpen,L:G&&G.L,score:G&&G.score,lives:G&&G.lives,row:J.row,rowF:J.rowF,x:J.x,dead:J.dead,hopping:J.hopping,queue:queue.length,homes:G&&G.homes.slice(),time:G&&G.time,w:G&&G.w,clearT:G&&G.clearT,trash:G&&G.trash,carry:J.carry,kit:!!(G&&G.kit),plat:!!J.plat,gt,lt}),
 start,toTitle,togglePause,update:step,hop:tryMove,render,safeAt,now:()=>lt,platAt2:(r,x,t)=>{const p=platAt(r,x,t);return p?{speed:p.l.dir*p.l.speed,orca:orcaHead(p,x)}:null},platAt:(r,x)=>{const p=platAt(r,x);return p?{speed:p.l.dir*p.l.speed,orca:orcaHead(p,x)}:null},
 layout:()=>({SC,OXs,OYs,LH,BY,EXTRA,UI:lastUI.map(u=>({...u})),tb:tbRects(),dpad:DPAD&&DPAD.btns}),addPop,spawnPickup,god:v=>{god=v},
 fillHome:i=>{G.homes[i]=1},setWeather:w=>{G.w=w;initDrops()},level:L=>{G.L=L;startLevel(L)},die,dens:DENS,rail:()=>rail,gull:()=>G&&G.gull,crow:()=>G&&G.crow,setLives:n=>{G.lives=n},J:()=>({...J,plat:!!J.plat})};
