// ---------- drawing helpers (logical coords)
function el(x,y,rx,ry,col){g.fillStyle=col;g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);g.fill()}
function rr(x,y,w,h,r,col){g.fillStyle=col;g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h);g.fill()}
function setFont(sz,w='bold'){g.font=`${w} ${sz}px ${FONT}`}
// text that registers its rectangle (for the overlap guarantee + automated test)
function txt(s,x,y,sz,col,al='center',o={}){setFont(sz,o.w||'bold');const w=g.measureText(s).width,h=sz*1.2;const lx=al=='center'?x-w/2:al=='right'?x-w:x;
 g.textAlign=al;g.textBaseline='middle';if(o.sh!==false){g.fillStyle=o.shc||'rgba(0,0,0,.65)';g.fillText(s,x+1.5,y+1.5)}if(o.stroke){g.lineWidth=o.stroke;g.strokeStyle=o.sc||'#000';g.lineJoin='round';g.strokeText(s,x,y)}g.fillStyle=col;g.fillText(s,x,y);
 if(o.reg!==false)UI.push({x:lx,y:y-h/2,w,h,k:'text',s});return w}
function fitSize(s,sz,maxW,w='bold'){setFont(sz,w);const m=g.measureText(s).width;return m>maxW?Math.max(8,Math.floor(sz*maxW/m)):sz}
function button(label,x,y,w,h,col,fn,o={}){const pressed=0;rr(x,y+3,w,h,h/2,'rgba(0,0,0,.45)');rr(x,y,w,h,h/2,'#fff');rr(x+3,y+3,w-6,h-6,h/2-3,col);
 const sz=fitSize(label,o.sz||19,w-20);txt(label,x+w/2,y+h/2+1,sz,'#fff','center',{reg:false});menuBtns.push({x,y,w,h,fn});UI.push({x,y,w,h,k:'btn',s:label})}
// ---------- Jimothy (top-down, rotated to face his hop direction)
function drawJim(x,y,ang,o={}){const hop=o.hop||0,h=Math.sin(PI*hop),t=o.t||0;g.save();g.translate(x,y);if(o.alpha!=null)g.globalAlpha=o.alpha;
 el(0,4,12-h*2,8.5-h*2,'rgba(0,0,0,.28)');g.translate(0,-h*8);let sx=(o.sc||1)*(1+h*.12),sy=sx;if(o.land>0){sx*=1.12;sy*=.88}g.scale(sx,sy);
 const wad=o.idle?Math.sin(t*7)*.08:Math.sin(hop*TAU)*.16;g.rotate(ang+wad+(o.spin||0));
 const wag=Math.sin(t*6+hop*7)*.38;g.save();g.translate(0,8);g.rotate(wag);
 for(let i=0;i<5;i++)el(Math.sin(i*.6+t*3)*1.2,5+i*3.2,4.6-i*.35,2.6,i%2?'#2b2b31':'#a3a9b1');el(0,5+5*3.2,2.7,2.6,'#2b2b31');g.restore();
 const lp=hop?Math.sin(hop*TAU)*3.2:o.idle?Math.sin(t*7)*.8:0;
 for(const [px,py,s] of [[-8.5,-1,1],[8.5,-1,-1],[-7.5,9,-1],[7.5,9,1]])el(px,py+lp*s,3.1,3.4,'#26262c');
 el(0,3,11,10.5,'#737a83');el(0,2,8,8,'#89909a');el(0,6,3,4.5,'#666d76');
 if(o.carry){g.save();g.translate(0,4);g.scale(.5,.5);el(-6,-11,3,3,'#5d636b');el(6,-11,3,3,'#5d636b');el(0,-4,8,7,'#a3a9b1');el(0,-5,7,2.5,'#1f1f24');el(-3,-5,1.4,1.4,'#fff');el(3,-5,1.4,1.4,'#fff');el(0,-10,2,1.5,'#111');g.restore()}
 el(-6.5,-14,3.6,3.8,'#5a6068');el(6.5,-14,3.6,3.8,'#5a6068');el(-6.5,-14,1.8,2,'#2b2b31');el(6.5,-14,1.8,2,'#2b2b31');
 el(0,-8.5,9,7.8,'#a3a9b1');el(-4.6,-11.5,3.6,2.2,'#f1f1f1');el(4.6,-11.5,3.6,2.2,'#f1f1f1');
 g.fillStyle='#1d1d22';g.beginPath();g.ellipse(-4,-9,4.1,2.7,-.15,0,TAU);g.ellipse(4,-9,4.1,2.7,.15,0,TAU);g.fill();g.fillRect(-2,-10,4,2);
 el(-4,-9.3,1.6,1.6,'#fff');el(4,-9.3,1.6,1.6,'#fff');el(-3.6,-9.6,.7,.7,'#111');el(4.4,-9.6,.7,.7,'#111');
 el(0,-13.6,3.6,2.8,'#ededed');el(0,-15.6,1.7,1.3,'#111');g.restore()}
// front-facing portrait (title / game over)
function drawJimFront(x,y,s,t,mood='happy'){g.save();g.translate(x,y);g.scale(s,s);const b=Math.sin(t*5)*1.2,sw=Math.sin(t*2.6)*.06;g.rotate(sw);
 el(0,62,46,9,'rgba(0,0,0,.3)');
 g.save();g.translate(30,40);g.rotate(-.5+Math.sin(t*3)*.15);for(let i=0;i<6;i++)el(8+i*7,-i*6,9-i*.4,7.5,i%2?'#2b2b31':'#a3a9b1');el(52,-37,6,6,'#2b2b31');g.restore();
 el(-17,58,11,6,'#2b2b31');el(17,58,11,6,'#2b2b31');
 el(0,30+b*.3,36,34,'#7a818a');el(0,36+b*.3,23,24,'#c9ccd1');
 // arms + soda can
 g.save();g.translate(-24,26);g.rotate(.6+Math.sin(t*4)*.1);el(0,6,7,12,'#6e757e');g.restore();
 rr(12,14+b*.5,13,19,3,'#e63946');rr(12,17+b*.5,13,4,1,'#fff');rr(14,13+b*.5,9,2,1,'#ccc');el(20,30+b*.5,7,6,'#6e757e');
 g.translate(0,b);
 el(-25,-34,10,11,'#5a6068');el(25,-34,10,11,'#5a6068');el(-25,-33,5.5,6.5,'#2b2b31');el(25,-33,5.5,6.5,'#2b2b31');
 el(0,-12,34,28,'#a3a9b1');el(-15,-22,11,5,'#f4f4f4');el(15,-22,11,5,'#f4f4f4');
 g.fillStyle='#1d1d22';g.beginPath();g.ellipse(-13,-11,13,8.5,-.25,0,TAU);g.ellipse(13,-11,13,8.5,.25,0,TAU);g.fill();g.fillRect(-6,-15,12,6);
 const bl=(Math.sin(t*1.7)>.97)?.15:1;el(-12,-11,6.6,6.6*bl,'#fff');el(12,-11,6.6,6.6*bl,'#fff');el(-11,-10.5,4,4*bl,'#3a2414');el(13,-10.5,4,4*bl,'#3a2414');el(-11,-10.5,2,2*bl,'#000');el(13,-10.5,2,2*bl,'#000');el(-9.6,-12.3,1.5,1.5*bl,'#fff');el(14.4,-12.3,1.5,1.5*bl,'#fff');
 el(0,4,16,11,'#f4f4f4');el(-9,6,6,6,'#f4f4f4');el(9,6,6,6,'#f4f4f4');el(0,-1,5.5,4,'#111');el(-1.5,-2.2,1.5,1,'#555');
 g.strokeStyle='#222';g.lineWidth=1.6;g.beginPath();if(mood=='sad'){g.arc(0,12,5,PI*1.15,PI*1.85)}else{g.moveTo(0,3);g.lineTo(0,6);g.arc(-3.5,6,3.5,0,PI*.9);g.moveTo(7,6);g.arc(3.5,6,3.5,0,PI*.9,false)}g.stroke();
 if(mood!='sad'){el(0,10.5,2.4,2,'#e8708a')}
 g.restore()}
// ---------- vehicles & platforms (front is +x; mirrored for leftward lanes)
function wheels(hw,w){g.fillStyle='#111';for(const xx of [-hw+5,hw-11])for(const yy of [-12.5,9.5])g.fillRect(xx,yy,6,3)}
function drawVeh(o,x,y,dir,night){const w=o.w,hw=w/2;g.save();g.translate(x+hw,y+T/2);if(dir<0)g.scale(-1,1);
 const ty=o.type;
 if(ty=='bike'||ty=='scooter'){g.fillStyle='#222';g.fillRect(-11,-1.2,22,2.4);el(-10,0,3,1.6,'#111');el(10,0,3,1.6,'#111');if(ty=='scooter'){rr(-9,-5,16,10,4,o.col)}
  el(-1,0,5,7,ty=='bike'?'#2d6cdf':'#444');el(2,0,4,4,ty=='bike'?o.col:'#f1f1f1');if(ty=='bike'){g.fillStyle='#ffde59';g.fillRect(4,-.8,2,1.6)}if(night)el(12,0,1.6,1.6,'#fff7b0')}
 else if(ty=='bus'){rr(-hw+1,-13,w-2,26,5,'#0b4f8a');rr(-hw+1,4,w-2,9,4,'#13a89e');rr(-hw+4,-10,w-8,15,3,'#e9eef2');g.fillStyle='#0b4f8a';g.fillRect(-2,-13,4,26);g.fillStyle='#9aa7b3';for(let i=-hw+10;i<hw-12;i+=14)g.fillRect(i,-7,8,8);
  rr(hw-8,-11,6,22,2,'#1b2a38');setFont(8);g.fillStyle='#ffd23f';g.textAlign='center';g.textBaseline='middle';g.save();g.translate(hw-5,0);g.rotate(PI/2);g.fillText('44',0,0);g.restore();wheels(hw,w);
  el(hw-2,-10,1.8,2,'#fff7b0');el(hw-2,10,1.8,2,'#fff7b0');g.fillStyle='#ff3b30';g.fillRect(-hw+1,-11,2,4);g.fillRect(-hw+1,7,2,4)}
 else if(ty=='truck'||ty=='foodtruck'||ty=='coffee'){const cab=15;rr(hw-cab-1,-11,cab,22,4,ty=='coffee'?'#6b3e26':'#d64545');rr(hw-7,-9,5,18,2,'#1b2a38');
  const bc=ty=='foodtruck'?'#ffcf33':ty=='coffee'?'#f3e3c3':'#f2f2f2';rr(-hw+1,-13,w-cab-3,26,3,bc);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(-hw+1,9,w-cab-3,4);
  if(ty=='foodtruck'){g.fillStyle='#e63946';for(let i=-hw+3;i<hw-cab-4;i+=8)g.fillRect(i,-13,4,4)}
  const lab=ty=='foodtruck'?'TERIYAKI':ty=='coffee'?'ESPRESSO':'FRESH FISH';setFont(ty=='truck'?7.5:8);g.fillStyle=ty=='coffee'?'#6b3e26':ty=='foodtruck'?'#7a1d1d':'#1d4e89';g.textAlign='center';g.textBaseline='middle';g.fillText(lab,(-hw+1+hw-cab-2)/2,1);
  if(ty=='coffee'){el(-hw+9,-6,3,3,'#fff');}wheels(hw,w);el(hw-1,-9,1.6,2,'#fff7b0');el(hw-1,9,1.6,2,'#fff7b0')}
 else{const col=ty=='taxi'?'#ffb000':o.col;rr(-hw+1,-11,w-2,22,6,col);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(-hw+4,-9,w-8,3);
  rr(hw-14,-8.5,7,17,2,'#1b2a38');rr(-hw+5,-8,5,16,2,'#1b2a38');rr(-hw+10,-8,w-25,16,3,ty=='sport'?'#111':'rgba(0,0,0,.12)');
  if(ty=='sport'){g.fillStyle='#fff';g.fillRect(-hw+3,-1.5,w-6,3)}if(ty=='taxi'){rr(-4,-4,8,8,1,'#fff');setFont(4.5);g.fillStyle='#000';g.textAlign='center';g.textBaseline='middle';g.fillText('TAXI',0,.3)}
  wheels(hw,w);el(hw-2,-8,1.8,2,'#fff7b0');el(hw-2,8,1.8,2,'#fff7b0');g.fillStyle='#ff3b30';g.fillRect(-hw+1,-9,2,4);g.fillRect(-hw+1,5,2,4)}
 g.restore()}
function drawTrain(x,y,len,dir){const cars=Math.round(len/(T*2.4));for(let i=0;i<cars;i++){const cx=x+i*T*2.4,w=T*2.4-3;rr(cx+1,y+4,w,T-8,5,'#f1f3f5');rr(cx+1,y+T-12,w,4,1,'#1e5fb4');rr(cx+1,y+8,w,3,1,'#2fb37a');g.fillStyle='#8899aa';g.fillRect(cx+w/2-6,y+12,12,8);g.strokeStyle='#333';g.lineWidth=1;g.beginPath();g.moveTo(cx+w/2-5,y+16);g.lineTo(cx+w/2+5,y+12);g.lineTo(cx+w/2+5,y+20);g.stroke();
  if(i<cars-1){g.fillStyle='#333';g.fillRect(cx+w+1,y+10,3,T-20)}}
 const fx=dir>0?x+cars*T*2.4-4:x+2;el(fx,y+9,2,2,'#fff7b0');el(fx,y+T-9,2,2,'#fff7b0');setFont(7);g.fillStyle='#1e5fb4';g.textAlign='center';g.textBaseline='middle';g.fillText('LIGHT RAIL',x+T*1.2,y+T/2)}
function drawLog(x,y,w){rr(x,y+5,w,T-10,9,'#7a4a24');g.fillStyle='#8f5a2d';g.fillRect(x+6,y+8,w-12,4);g.fillStyle='#5e3818';for(let i=x+10;i<x+w-10;i+=17){g.fillRect(i,y+15,9,2);g.fillRect(i+6,y+21,7,2)}
 el(x+5,y+T/2,5,T/2-5,'#c89a62');el(x+5,y+T/2,3,7,'#a87b45');el(x+5,y+T/2,1.2,3,'#7a4a24');el(x+w-3,y+T/2,3,T/2-6,'#6a3f1e')}
function drawCrates(o,x,y,st,t){const n=Math.round(o.w/T);let a=1,dy=0;if(st=='warn'){dy=Math.sin(t*16)*1.4;a=.9}if(st=='down'||st=='rise'){a=st=='down'?.28:.55}
 g.save();g.globalAlpha=a;for(let i=0;i<n;i++){const cx=x+i*T+2,cy=y+4+dy;rr(cx,cy,T-4,T-8,2,'#b07a3f');g.strokeStyle='#7a4e22';g.lineWidth=2;g.strokeRect(cx+2,cy+2,T-8,T-12);g.beginPath();g.moveTo(cx+3,cy+3);g.lineTo(cx+T-7,cy+T-11);g.stroke()}g.restore();
 if(st!='up'){g.strokeStyle='rgba(255,255,255,'+(st=='warn'?.6:.35)+')';g.lineWidth=1.5;g.beginPath();g.ellipse(x+o.w/2,y+T/2,o.w/2+3+Math.sin(t*8)*2,T/2-3,0,0,TAU);g.stroke()}
 if(st=='down')for(let i=0;i<3;i++)el(x+8+((t*20+i*13)%(o.w-12)),y+T/2+Math.sin(t*5+i)*5,1.6,1.6,'rgba(255,255,255,.7)')}
function drawFerry(x,y,w,dir){g.save();g.translate(x+w/2,y+T/2);if(dir<0)g.scale(-1,1);const hw=w/2;
 g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(-hw-14,-9);g.lineTo(-hw,-12);g.lineTo(-hw,12);g.lineTo(-hw-14,9);g.fill();
 g.fillStyle='#f5f7f8';g.beginPath();g.moveTo(-hw+2,-13);g.lineTo(hw-12,-13);g.quadraticCurveTo(hw+2,0,hw-12,13);g.lineTo(-hw+2,13);g.closePath();g.fill();
 g.fillStyle='#1f7a4d';g.fillRect(-hw+2,9,w-16,4);g.fillRect(-hw+2,-13,w-16,4);rr(-hw+18,-8,w-46,16,3,'#e3e8eb');rr(-6,-6,14,12,2,'#1f7a4d');el(1,0,3.5,3.5,'#111');
 setFont(7);g.fillStyle='#1f7a4d';g.textAlign='center';g.textBaseline='middle';g.fillText('M/V SALISH',-hw+40,0);g.restore()}
function drawOrca(x,y,w,dir,t){g.save();g.translate(x+w/2,y+T/2);if(dir<0)g.scale(-1,1);const hw=w/2,f=Math.sin(t*4)*3;
 g.fillStyle='#111';g.beginPath();g.moveTo(-hw-6,-7+f);g.lineTo(-hw+8,0);g.lineTo(-hw-6,7+f);g.fill();el(0,0,hw-2,11,'#141414');el(hw-14,0,12,9,'#141414');
 el(hw-16,-6,5,2.4,'#fff');el(hw-16,6,5,2.4,'#fff');el(-4,0,14,4,'#2b2b2b');el(-2,0,6,2,'#ddd');
 const m=(Math.sin(t*3)+1)/2;g.fillStyle='#c0392b';g.beginPath();g.moveTo(hw+1,0);g.lineTo(hw-8,-3-m*2);g.lineTo(hw-8,3+m*2);g.fill();g.fillStyle='#fff';for(let i=0;i<3;i++){g.fillRect(hw-7+i*2.5,-2-m*2,1.2,1.5);g.fillRect(hw-7+i*2.5,.5+m*2,1.2,1.5)}
 g.restore()}
function drawPickup(p,t){const x=p.x,y=BY+p.row*T+T/2,bl=p.life-p.t<2&&Math.floor(p.t*8)%2;if(bl)return;const bob=Math.sin(t*5+p.x)*1.5;
 g.save();g.translate(x,y+bob);el(0,6,8,3,'rgba(0,0,0,.25)');
 if(p.type=='soda'){rr(-4.5,-7,9,14,2,'#e63946');rr(-4.5,-3,9,3,1,'#fff');rr(-3,-8,6,2,1,'#cfd4d8')}
 else if(p.type=='pizza'){rr(-9,-8,18,15,2,'#d9a066');g.strokeStyle='#a8743c';g.lineWidth=1;g.strokeRect(-7,-6,14,11);setFont(5);g.fillStyle='#c0392b';g.textAlign='center';g.textBaseline='middle';g.fillText('PIZZA',0,0)}
 else if(p.type=='can'){rr(-7,-7,14,14,3,'#6c7a86');el(0,-7,7,2.5,'#8d9ba7');g.fillStyle='#55626d';g.fillRect(-5,-4,1.5,10);g.fillRect(-1,-4,1.5,10);g.fillRect(3,-4,1.5,10);el(4,-9,2,1.5,'#e9c46a');el(-3,-8.5,2,1.2,'#9bd27a')}
 else{const sp=Math.sin(t*10);el(0,0,12+sp,12+sp,'rgba(255,215,0,.28)');rr(-5,-8,10,16,2,'#ffd700');rr(-5,-4,10,3,1,'#fff6c2');rr(-3.5,-9,7,2,1,'#fff2a8');g.fillStyle='#fff';g.fillRect(-8+((t*30)%16),-10,1.5,1.5)}
 g.restore()}
