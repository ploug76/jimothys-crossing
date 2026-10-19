// ---------- scene
const dk=document.createElement('canvas'),dg=dk.getContext('2d');
function drawSky(w){const top=w=='night'||w=='storm'?['#050b1f','#14234a']:w=='dusk'?['#3b2a6b','#f08a5d']:w=='rain'?['#4a5763','#7d8b96']:['#5fb3f0','#bfe3ff'];
 const gr=g.createLinearGradient(0,0,0,HUDH);gr.addColorStop(0,top[0]);gr.addColorStop(1,top[1]);g.fillStyle=gr;g.fillRect(-400,-OYs/SC-2,LW+800,HUDH+OYs/SC+2);
 const nt=w=='night'||w=='storm';
 if(nt){g.fillStyle='#fff';for(let i=0;i<24;i++){const sx=(i*73)%LW,sy=(i*37)%30+3;g.globalAlpha=.4+.4*Math.sin(gt*2+i);g.fillRect(sx,sy,1.2,1.2)}g.globalAlpha=1;el(40,14,7,7,'#f6f1d5');el(43,12,6,6,top[0])}
 else if(w=='day')el(60,13,8,8,'#fff3b0');
 // Mt. Rainier
 g.fillStyle=nt?'#1d2b4f':w=='dusk'?'#7d5c8f':'#9fb4c8';g.beginPath();g.moveTo(-10,HUDH);g.lineTo(70,20);g.lineTo(90,24);g.lineTo(170,HUDH);g.fill();g.fillStyle=nt?'#3a4a70':'#f4f8fb';g.beginPath();g.moveTo(58,28);g.lineTo(70,20);g.lineTo(90,24);g.lineTo(100,30);g.lineTo(84,28);g.lineTo(74,31);g.fill();
 // skyline + Space Needle
 const bc=nt?'#0d1530':w=='dusk'?'#2c1f45':w=='rain'?'#3b464f':'#36597a';g.fillStyle=bc;
 const bl=[[150,26,14],[166,18,12],[180,30,10],[192,12,15],[209,22,12],[223,16,13],[238,28,9],[249,20,14],[265,32,10],[276,24,12],[290,34,10],[302,27,14],[318,36,11],[331,22,13],[-6,34,16],[12,38,12]];
 for(const [x,h,ww] of bl)g.fillRect(x,HUDH-h,ww,h);
 if(nt||w=='dusk'){g.fillStyle='#ffd86b';for(const [x,h,ww] of bl)for(let yy=HUDH-h+3;yy<HUDH-2;yy+=5)for(let xx=x+2;xx<x+ww-2;xx+=4)if(((xx*7+yy*13)%5)<2)g.fillRect(xx,yy,1.5,2)}
 const nx=208;g.fillStyle=bc;g.fillRect(nx-1,HUDH-38,2,38);g.beginPath();g.moveTo(nx-6,HUDH);g.lineTo(nx-1.5,HUDH-30);g.lineTo(nx+1.5,HUDH-30);g.lineTo(nx+6,HUDH);g.fill();
 g.beginPath();g.ellipse(nx,HUDH-33,9,2.6,0,0,TAU);g.fill();g.fillRect(nx-6,HUDH-37,12,3);g.fillRect(nx-.5,HUDH-46,1,9);if(nt){el(nx,HUDH-46,1.5,1.5,Math.sin(gt*4)>0?'#ff4d4d':'#7a1010')}
 g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-400,HUDH-1,LW+800,1)}
function drawLanesBG(w){const nt=w=='night'||w=='storm',wet=w=='rain'||w=='storm';
 // homes: hedge + seawall
 g.fillStyle=nt?'#173a1f':'#2e6b36';g.fillRect(0,BY,LW,T);g.fillStyle=nt?'#1f4a28':'#3b8445';for(let i=0;i<LW;i+=9)el(i+4,BY+6+(i*7)%9,6,5,g.fillStyle);
 g.fillStyle=nt?'#3a3f45':'#8a8f96';g.fillRect(0,BY+T-5,LW,5);g.fillStyle='rgba(0,0,0,.2)';for(let i=0;i<LW;i+=12)g.fillRect(i,BY+T-5,1,5);
 for(let i=0;i<5;i++){const x=DENS[i];rr(x-16,BY+1,32,T-3,6,nt?'#0e1a10':'#1e3320');}
 // water
 const wc=nt?['#0b2742','#12395c']:w=='dusk'?['#2d4f7c','#c27a6a']:wet?['#2b4a5e','#3d6278']:['#1e6fa8','#2f8fcf'];const wg=g.createLinearGradient(0,BY+T,0,BY+6*T);wg.addColorStop(0,wc[0]);wg.addColorStop(1,wc[1]);g.fillStyle=wg;g.fillRect(0,BY+T,LW,5*T);
 g.strokeStyle=nt?'rgba(140,180,255,.18)':'rgba(255,255,255,.22)';g.lineWidth=1.2;for(let r=1;r<=5;r++){const l=lanes[r],d=l?l.dir:1;for(let i=0;i<7;i++){const x=((i*61+d*gt*14+r*29)%(LW+40)+LW+40)%(LW+40)-20,y=BY+r*T+8+(i*11+r*5)%18;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+5,y-3,x+10,y);g.stroke()}}
 // promenade
 const py=BY+6*T;g.fillStyle=nt?'#4d463d':'#c9b48f';g.fillRect(0,py,LW,T);g.fillStyle=nt?'#433d35':'#b8a17a';for(let i=0;i<LW;i+=16)for(let j=0;j<2;j++)g.fillRect(i+(j?8:0),py+4+j*13,14,11);
 g.fillStyle='#2b2f33';g.fillRect(0,py,LW,3);for(let i=4;i<LW;i+=22)g.fillRect(i,py,2,6);
 // road
 const ry=BY+7*T;g.fillStyle=wet?'#2c3036':nt?'#25282d':'#3b3e44';g.fillRect(0,ry,LW,6*T);
 if(wet){g.fillStyle='rgba(160,190,220,.08)';for(let i=0;i<9;i++)el((i*83)%LW,ry+((i*47)%(6*T)),18,4,g.fillStyle)}
 g.fillStyle='#e8e8e8';for(const r of [8,11,12])for(let i=4;i<LW;i+=28)g.fillRect(i,BY+r*T-1,14,2);
 g.fillStyle='#ffd23f';g.fillRect(0,BY+9*T-3,LW,2);g.fillRect(0,BY+10*T+1,LW,2);g.fillStyle='#f0f0f0';g.fillRect(0,ry,LW,2);g.fillRect(0,BY+13*T-2,LW,2);
 // light rail track
 const ty=BY+9*T;g.fillStyle=nt?'#3d4046':'#6b6f76';g.fillRect(0,ty,LW,T);g.fillStyle='#4a3a2a';for(let i=0;i<LW;i+=10)g.fillRect(i,ty+5,5,T-10);g.fillStyle='#c9ced6';g.fillRect(0,ty+9,LW,2);g.fillRect(0,ty+T-11,LW,2);
 const warn=rail&&rail.phase=='warn'||rail&&rail.phase=='go';const on=warn&&Math.floor(gt*4)%2;for(const x of [5,LW-5]){el(x,ty+6,3.6,3.6,'#111');el(x,ty+T-6,3.6,3.6,'#111');el(x,ty+6,2.4,2.4,on?'#ff2d2d':'#4a1010');el(x,ty+T-6,2.4,2.4,!on&&warn?'#ff2d2d':'#4a1010')}
 // sidewalk start
 const sy=BY+13*T;g.fillStyle=nt?'#5b6066':'#a9afb5';g.fillRect(0,sy,LW,T);g.fillStyle='rgba(0,0,0,.15)';for(let i=0;i<LW;i+=T)g.fillRect(i,sy,1,T);g.fillRect(0,sy+T/2,LW,1);g.fillStyle=nt?'#2f4d2f':'#5c9a4f';g.fillRect(0,sy+T-5,LW,5);
 // lamp posts (decor at the edges of the promenade + sidewalk)
 for(const [x,y] of [[3,py+T/2],[LW-3,py+T/2],[3,sy+T/2],[LW-3,sy+T/2]]){el(x,y,3,3,'#2b2f33');el(x,y,1.6,1.6,nt||w=='dusk'?'#fff2a8':'#d6d6d6')}}
function drawHomes(t){for(let i=0;i<5;i++){const x=DENS[i],y=BY+T/2;el(x,y+1,12,11,'#5d6a75');el(x,y,11,10,'#8795a1');el(x,y,8,7,G&&G.homes[i]?'#2c343b':'#20262b');g.fillStyle='#6b7884';g.fillRect(x+8,y-12,6,4);
  if(G&&G.homes[i]){g.save();g.translate(x,y);g.scale(.72,.72);el(-6.5,-6,3.5,3.5,'#5a6068');el(6.5,-6,3.5,3.5,'#5a6068');el(0,1,9,7.5,'#a3a9b1');g.fillStyle='#1d1d22';g.beginPath();g.ellipse(-4,0,4,2.6,-.15,0,TAU);g.ellipse(4,0,4,2.6,.15,0,TAU);g.fill();el(-4,-.3,1.5,1.5,'#fff');el(4,-.3,1.5,1.5,'#fff');el(0,5,3.4,2.4,'#eee');el(0,4,1.5,1.1,'#111');g.restore()}}
 if(G&&G.bug){const x=DENS[G.bug.i],y=BY+T/2+Math.sin(t*6)*2;if(G.bug.t>1.2||Math.floor(t*8)%2){el(x,y+8,5,2,'rgba(0,0,0,.25)');el(x-4,y-2,4,2.5,'rgba(220,255,220,.7)');el(x+4,y-2,4,2.5,'rgba(220,255,220,.7)');el(x,y,4,5.5,'#2fbf4a');el(x,y-4.5,2.6,2,'#145c22');g.fillStyle='rgba(255,255,255,.6)';g.fillRect(x-1,y-2,1,4)}}
 if(G&&G.crow){const cw=G.crow,x=DENS[cw.i];let y=BY+T/2-2,a=1,fl=Math.sin(t*20)*4;if(cw.ph=='land'){y-=cw.t*40;a=1-cw.t*.4}if(cw.ph=='leave'){y-=(0.6-cw.t)*60}if(cw.ph=='sit')fl=1;
  el(x,BY+T/2+6,6*(cw.ph=='land'?1-cw.t*.6:1),2,'rgba(0,0,0,.3)');g.save();g.globalAlpha=a;g.translate(x,y);el(-7,0,7,2.5+fl*.3,'#111');el(7,0,7,2.5+fl*.3,'#111');el(0,0,4,7,'#1a1a1a');el(0,-6,3,3,'#222');g.fillStyle='#f2b134';g.beginPath();g.moveTo(-1.3,-8);g.lineTo(1.3,-8);g.lineTo(0,-11.5);g.fill();el(-1.2,-6.5,.8,.8,'#fff');el(1.2,-6.5,.8,.8,'#fff');g.restore()}}
function drawGull(s,t){const x=s.x,y=BY+6*T+T/2,st=s.wait>0?0:Math.sin(t*14)*2;g.save();g.translate(x,y);if(s.dir<0)g.scale(-1,1);el(0,7,9,2.5,'rgba(0,0,0,.25)');el(-2,0,9,6,'#f4f4f4');el(-5,0,5,4.5,'#9aa3ab');el(-11,0,3,2.6,'#2b2b2b');el(6,-1,4.5,4,'#fff');g.fillStyle='#f5a623';g.beginPath();g.moveTo(9.5,-2);g.lineTo(14,-1);g.lineTo(9.5,.5);g.fill();el(7,-2.5,.9,.9,'#111');g.fillStyle='#f5a623';g.fillRect(-1+st,5,1.5,3);g.fillRect(2-st,5,1.5,3);g.restore()}
function drawWorld(){const w=G&&state!='title'?G.w:'day',t=gt;drawSky(w);drawLanesBG(w);drawHomes(t);
 // water platforms
 for(let r=1;r<=5;r++){const l=lanes[r];if(!l)continue;const y=BY+r*T;for(const o of l.objs){const x=objX(l,o);if(x>LW||x+o.w<0)continue;const ty=o.type;
  if(ty.startsWith('log'))drawLog(x,y,o.w);else if(ty=='ferry')drawFerry(x,y,o.w,l.dir);else if(ty=='orca')drawOrca(x,y,o.w,l.dir,t);else drawCrates(o,x,y,sinkState(o),t)}}
 if(G&&G.kit&&state=='play'){const k=G.kit;drawJim(k.x,BY+k.row*T+T/2,k.o&&lanes[k.row].dir>0?PI/2:-PI/2,{sc:.55,t:t*1.4,idle:1});const a=.5+.5*Math.sin(t*6);g.strokeStyle=`rgba(255,179,217,${a})`;g.lineWidth=1.5;g.beginPath();g.arc(k.x,BY+k.row*T+T/2,11,0,TAU);g.stroke()}
 if(state=='play')for(const p of pickups)drawPickup(p,t);
 // traffic
 const nt=w=='night'||w=='storm';for(const r of [7,8,10,11,12]){const l=lanes[r];if(!l)continue;const y=BY+r*T;for(const o of l.objs){const x=objX(l,o);if(x>LW+2||x+o.w<-2)continue;drawVeh(o,x,y,l.dir,nt)}}
 if(rail&&rail.phase=='go')drawTrain(rail.x,BY+9*T,rail.len,rail.dir);
 if(G&&G.gull&&state!='title')drawGull(G.gull,t);
 // Jimothy
 if(state!='title'&&G&&J.visible){const y=BY+J.rowF*T+T/2;if(J.dead){const k=J.dT,wet=J.dtype=='splash'||J.dtype=='swept'||J.dtype=='orca';
   if(wet){if(k<.5)drawJim(J.x,y,J.ang,{sc:1-k*1.6,alpha:1-k*1.8,t})}else if(J.dtype=='time'){drawJim(J.x,y,J.ang,{t,alpha:k<1?1:2-k*1,spin:0});setFont(10);g.fillStyle='#fff';g.textAlign='center';g.fillText('z',J.x+10,y-12-k*8);g.fillText('Z',J.x+16,y-20-k*10)}
   else{drawJim(J.x,y,J.ang,{t,spin:k*14*(1-k*.5),sc:1+Math.sin(k*20)*.05,alpha:k<1.1?1:Math.max(0,1-(k-1.1)*3)});for(let i=0;i<4;i++){const a=gt*6+i*TAU/4;el(J.x+Math.cos(a)*13,y-12+Math.sin(a)*4,2.2,2.2,'#ffe14d')}}}
  else drawJim(J.x,y,J.ang,{hop:J.hopping?Math.min(1,J.hopT):0,t,idle:!J.hopping,land:J.land,carry:J.carry})}
 for(const p of parts){const a=1-p.t/p.life;if(p.ring){g.strokeStyle=`rgba(255,255,255,${a})`;g.lineWidth=2;g.beginPath();g.ellipse(p.x,p.y,6+p.t*30,3+p.t*14,0,0,TAU);g.stroke()}else{g.globalAlpha=a;el(p.x,p.y,p.sz,p.sz,p.col);g.globalAlpha=1}}
 drawWeather(w)}
function drawWeather(w){const nt=w=='night'||w=='storm',wet=w=='rain'||w=='storm';
 if(w=='dusk'){const gr=g.createLinearGradient(0,0,0,BY+BH);gr.addColorStop(0,'rgba(255,120,60,.22)');gr.addColorStop(1,'rgba(120,40,120,.12)');g.fillStyle=gr;g.fillRect(-400,-OYs/SC,LW+800,BY+BH+OYs/SC)}
 if(nt)darkness(w=='storm'?.6:.55);
 if(wet){g.fillStyle='rgba(60,80,100,.12)';g.fillRect(0,BY,LW,BH);g.strokeStyle='rgba(200,220,255,.45)';g.lineWidth=1;g.beginPath();for(const d of drops){g.moveTo(d.x,d.y);g.lineTo(d.x-d.l*.18,d.y+d.l)}g.stroke();
  g.strokeStyle='rgba(220,235,255,.35)';for(let i=0;i<6;i++){const k=(gt*1.7+i*.37)%1,x=(i*97+Math.floor(gt*1.7+i*.37)*53)%LW,y=BY+((i*71+Math.floor(gt*1.7+i*.37)*31)%BH);g.beginPath();g.ellipse(x,y,2+k*7,1+k*3,0,0,TAU);g.stroke()}}
 if(w=='storm'&&G){if(!G.flashT||gt>G.flashT){G.flashT=gt+rnd(6,12);G.flashS=gt;if(state=='play'&&!paused)noise(1.2,.25,180,.6,'lowpass',.3)}const fa=1-(gt-G.flashS)/.45;if(fa>0){g.fillStyle=`rgba(230,240,255,${fa*.45})`;g.fillRect(-400,-OYs/SC,LW+800,BY+BH+OYs/SC)}}}
function darkness(a){const W=c.width,H=c.height;if(dk.width!=W||dk.height!=H){dk.width=W;dk.height=H}dg.setTransform(1,0,0,1,0,0);dg.globalCompositeOperation='source-over';dg.clearRect(0,0,W,H);
 dg.setTransform(SC*DPR,0,0,SC*DPR,OXs*DPR,OYs*DPR);dg.fillStyle=`rgba(3,8,26,${a})`;dg.fillRect(0,BY,LW,BH);dg.globalCompositeOperation='destination-out';
 const L=(x,y,r,s=1)=>{const gr=dg.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(0,0,0,${s})`);gr.addColorStop(1,'rgba(0,0,0,0)');dg.fillStyle=gr;dg.beginPath();dg.arc(x,y,r,0,TAU);dg.fill()};
 if(state!='title'&&J.visible)L(J.x,BY+J.rowF*T+T/2,62,.95);
 for(const [x,y] of [[3,BY+6.5*T],[LW-3,BY+6.5*T],[3,BY+13.5*T],[LW-3,BY+13.5*T],[LW/2,BY+13.5*T],[LW/2,BY+6.5*T]])L(x,y,46,.7);
 for(const x of DENS)L(x,BY+T/2,20,.6);
 for(const r of [7,8,10,11,12]){const l=lanes[r];if(!l)continue;const y=BY+r*T+T/2;for(const o of l.objs){const x=objX(l,o);if(x>LW+60||x+o.w<-60)continue;const fx=l.dir>0?x+o.w:x;const gr=dg.createRadialGradient(fx,y,0,fx,y,64);gr.addColorStop(0,'rgba(0,0,0,.9)');gr.addColorStop(1,'rgba(0,0,0,0)');dg.fillStyle=gr;dg.beginPath();dg.moveTo(fx,y);dg.arc(fx,y,64,l.dir>0?-.42:PI-.42,l.dir>0?.42:PI+.42);dg.closePath();dg.fill();L(x+o.w/2,y,o.w*.55,.35)}}
 if(rail&&rail.phase=='go'){const fx=rail.dir>0?rail.x+rail.len:rail.x;L(fx,BY+9.5*T,70,.9);L(rail.x+rail.len/2,BY+9.5*T,rail.len*.5,.4)}
 if(rail&&rail.phase=='warn'&&Math.floor(gt*4)%2){L(5,BY+9.5*T,24,.9);L(LW-5,BY+9.5*T,24,.9)}
 for(let r=1;r<=5;r++){const l=lanes[r];if(!l)continue;for(const o of l.objs)if(o.type=='ferry'){const x=objX(l,o);L(x+o.w/2,BY+r*T+T/2,o.w*.6,.6)}}
 for(const p of pickups)if(p.type=='gold')L(p.x,BY+p.row*T+T/2,26,.8);
 g.save();g.setTransform(1,0,0,1,0,0);g.drawImage(dk,0,0);g.restore()}
// ---------- HUD / bottom bar / D-pad
function hudRight(){let r=LW-4;for(const b of tbRects())if(b.y<HUDH)r=Math.min(r,b.x-6);return r}
function drawHUD(){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(-400,-OYs/SC,LW+800,HUDH+OYs/SC);const right=hudRight(),best=Math.max(ST.get('best',0),G.score);
 const sv=String(G.score).padStart(6,'0'),hv=String(best).padStart(6,'0');let sz=19;while(sz>11){setFont(sz);const w1=g.measureText(sv).width,w2=g.measureText(hv).width;if(8+Math.max(w1,50)+14+Math.max(w2,30)<=right)break;sz--}
 setFont(sz);const w1=Math.max(g.measureText(sv).width,46);txt('SCORE',8,13,10,'#ffd23f','left');txt(sv,8,32,sz,'#fff','left');const hx=8+w1+14;txt('HI',hx,13,10,'#ff9f9f','left');txt(hv,hx,32,sz,'#fff','left')}
function drawBar(){const y=BY+BH;g.fillStyle='#0d1b2a';g.fillRect(-400,y,LW+800,BARH);g.fillStyle='#22384f';g.fillRect(-400,y,LW+800,2);
 const n=Math.min(G.lives,5);for(let i=0;i<n;i++){const x=12+i*17,yy=y+BARH/2;el(x-5,yy-6,2.6,2.6,'#5a6068');el(x+5,yy-6,2.6,2.6,'#5a6068');el(x,yy,7,6,'#a3a9b1');el(x,yy-.5,6,2.2,'#1d1d22');el(x-2.5,yy-.7,1,1,'#fff');el(x+2.5,yy-.7,1,1,'#fff');el(x,yy+3.5,2.2,1.6,'#eee')}
 let lx=12+5*17;if(G.lives>5){txt('x'+G.lives,12+5*17-4,y+BARH/2+1,12,'#fff','left');lx+=18}
 const lv='LV '+G.L;txt(lv,lx+6,y+BARH/2+1,14,'#ffd23f','left');setFont(14);const lvw=g.measureText(lv).width;
 const ix=lx+6+lvw+14;wIcon(G.w,ix,y+BARH/2);
 const tx=ix+16;txt('TIME',tx,y+BARH/2+1,11,'#cfe3ff','left');setFont(11);const bx=tx+g.measureText('TIME').width+6,bw=LW-8-bx,f=CL(G.time/TIME_MAX,0,1);
 rr(bx,y+BARH/2-5,bw,10,5,'#2a3d52');rr(bx,y+BARH/2-5,Math.max(10,bw*f),10,5,f>.5?'#3ddc84':f>.22?'#ffd23f':(Math.floor(gt*6)%2?'#ff4d4d':'#ff9a9a'))}
function wIcon(w,x,y){if(w=='day')el(x,y,5,5,'#ffd23f');else if(w=='dusk'){el(x,y+1,5,5,'#ff8c42');g.fillStyle='#0d1b2a';g.fillRect(x-6,y+2,12,5)}else if(w=='rain'){el(x,y-1,6,3.5,'#cfd8e0');g.fillStyle='#7fc4ff';g.fillRect(x-3,y+3,1,3);g.fillRect(x+1,y+3,1,3)}else{el(x,y,5,5,'#f6f1d5');el(x+2,y-2,4.5,4.5,'#0d1b2a');if(w=='storm'){g.fillStyle='#ffd23f';g.fillRect(x+3,y+1,1.5,4)}}}
function drawControls(){if(DPAD){const d=DPAD;g.globalAlpha=.9;el(d.cx,d.cy,d.s/2,d.s/2,'rgba(255,255,255,.06)');for(const b of d.btns){const on=holdDir==b.d&&dpadPtr!=null;rr(b.x,b.y,b.w,b.h,12,on?'rgba(255,210,63,.55)':'rgba(255,255,255,.14)');g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;g.beginPath();g.roundRect?g.roundRect(b.x,b.y,b.w,b.h,12):g.rect(b.x,b.y,b.w,b.h);g.stroke();
  const cx=b.x+b.w/2,cy=b.y+b.h/2,a={up:-PI/2,down:PI/2,left:PI,right:0}[b.d],s=b.w*.22;g.fillStyle='#fff';g.beginPath();g.moveTo(cx+Math.cos(a)*s,cy+Math.sin(a)*s);g.lineTo(cx+Math.cos(a+2.4)*s,cy+Math.sin(a+2.4)*s);g.lineTo(cx+Math.cos(a-2.4)*s,cy+Math.sin(a-2.4)*s);g.fill();UI.push({x:b.x,y:b.y,w:b.w,h:b.h,k:'btn',s:'dpad-'+b.d})}g.globalAlpha=1;
  const room=(LW-d.s)/2-12;if(room>60){const sz=fitSize('SWIPE',11,room);txt('SWIPE',(LW-d.s)/4,d.cy-8,sz,'rgba(255,255,255,.55)','center',{sh:false});txt('ANYWHERE',(LW-d.s)/4,d.cy+8,sz,'rgba(255,255,255,.55)','center',{sh:false});txt('TAP =',LW-(LW-d.s)/4,d.cy-8,sz,'rgba(255,255,255,.55)','center',{sh:false});txt('HOP UP',LW-(LW-d.s)/4,d.cy+8,sz,'rgba(255,255,255,.55)','center',{sh:false})}}
 else if(EXTRA>=26){const s='SWIPE TO HOP  •  TAP = HOP UP';txt(s,LW/2,BY+BH+BARH+Math.min(EXTRA,60)/2,fitSize(s,12,LW-20),'rgba(255,255,255,.6)','center',{sh:false})}}
// ---------- popup layout: every label gets a free spot (never overlaps HUD, buttons or other popups)
function popRect(p){const banner=p.kind=='banner';setFont(p.size);let w=g.measureText(p.text).width;if(banner&&p.sub){setFont(13);w=Math.max(w,g.measureText(p.sub).width)}w=Math.min(LW-8,w+(p.kind=='float'?6:banner?36:20));const h=banner?p.size*1.2+(p.sub?20:0)+14:p.kind=='msg'?p.size*1.25+10:p.size*1.25+2;return{w,h}}
function placePops(forbid){const area={x:2,y:BY+2,w:LW-4,h:BH-4},placed=[];const list=pops.slice().sort((a,b)=>b.pri-a.pri||a.born-b.born);
 for(const p of list){const {w,h}=popRect(p);p.rw=w;p.rh=h;const age=gt-p.born;let x=CL(p.x-w/2,area.x,area.x+area.w-w);let y0=p.kind=='banner'?p.y-h/2:p.y-h/2-(p.kind=='float'?age*24:Math.min(age*40,10));y0=CL(y0,area.y,area.y+area.h-h);
  const obs=forbid.concat(placed);let y=null,xs=[x,area.x,area.x+area.w-w,LW/2-w/2];
  for(const xx of xs){y=freeY(xx,y0,w,h,obs,area);if(y!=null){x=xx;break}}
  p.vis=y!=null;if(p.vis){p.rx=x;p.ry=y;placed.push({x,y,w,h})}}}
function freeY(x,y0,w,h,obs,area){for(let d=0;d<=area.h;d+=2){for(const s of d?[-1,1]:[1]){const y=y0+s*d;if(y<area.y||y+h>area.y+area.h)continue;const r={x,y,w,h};if(!obs.some(o=>ov(r,o,1)))return y}}return null}
function drawPops(){const forbid=UI.filter(u=>u.k!='bg').concat(tbRects());if(state=='play'&&J.visible&&!J.dead)forbid.push({x:J.x-15,y:BY+J.rowF*T+T/2-19,w:30,h:34,k:'jim'});placePops(forbid);
 for(const p of pops){if(!p.vis)continue;const age=gt-p.born,a=Math.min(1,(p.life-age)/.35),x=p.rx,y=p.ry,w=p.rw,h=p.rh;g.globalAlpha=CL(a,0,1);
  if(p.kind=='banner'){const pop=Math.min(1,age*6);g.save();g.translate(x+w/2,y+h/2);g.scale(.7+.3*pop,.7+.3*pop);rr(-w/2,-h/2+3,w,h,10,'rgba(0,0,0,.45)');rr(-w/2,-h/2,w,h,10,'#16324f');g.strokeStyle=p.col;g.lineWidth=3;g.beginPath();g.roundRect?g.roundRect(-w/2+2,-h/2+2,w-4,h-4,8):g.rect(-w/2,-h/2,w,h);g.stroke();
   const sz=fitSize(p.text,p.size,w-30);setFont(sz);g.textAlign='center';g.textBaseline='middle';const ty=p.sub?-9:0;g.fillStyle='rgba(0,0,0,.5)';g.fillText(p.text,2,ty+2);g.fillStyle=p.col;g.fillText(p.text,0,ty);if(p.sub){setFont(fitSize(p.sub,13,w-30));g.fillStyle='#fff';g.fillText(p.sub,0,ty+sz*.6+10)}g.restore()}
  else if(p.kind=='msg'){rr(x,y,w,h,h/2,'rgba(10,20,35,.82)');g.strokeStyle=p.col;g.lineWidth=2;g.beginPath();g.roundRect?g.roundRect(x+1,y+1,w-2,h-2,h/2-1):g.rect(x,y,w,h);g.stroke();setFont(fitSize(p.text,p.size,w-16));g.textAlign='center';g.textBaseline='middle';g.fillStyle=p.col;g.fillText(p.text,x+w/2,y+h/2+1)}
  else{setFont(p.size);g.textAlign='center';g.textBaseline='middle';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.8)';g.lineJoin='round';g.strokeText(p.text,x+w/2,y+h/2);g.fillStyle=p.col;g.fillText(p.text,x+w/2,y+h/2)}
  g.globalAlpha=1;UI.push({x,y,w,h,k:'pop',s:p.text})}}
