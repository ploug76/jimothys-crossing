'use strict';
const GAME_ID='jimothys-crossing';
const c=document.getElementById('c'),$=id=>document.getElementById(id),R=Math.random,TAU=Math.PI*2,PI=Math.PI;
let g=c.getContext('2d');
const CL=(v,a,b)=>v<a?a:v>b?b:v,LERP=(a,b,k)=>a+(b-a)*k,PICK=a=>a[Math.floor(R()*a.length)],rnd=(a,b)=>a+R()*(b-a);
const FONT='"Trebuchet MS","Segoe UI",system-ui,-apple-system,sans-serif';
// ---------- board geometry (logical units)
const T=32,COLS=11,ROWS=14,LW=COLS*T,BH=ROWS*T,HUDH=48,BARH=30,HOP=0.118,TIME_MAX=30;
const DENS=[1,3,5,7,9].map(cl=>cl*T+T/2);
const colX=cl=>cl*T+T/2,nearCol=x=>CL(Math.round((x-T/2)/T),0,COLS-1);
function laneKind(r){return r==0?'home':r<=5?'water':r==6?'safe':r==9?'rail':r<=12?'road':'start'}
const isLand=r=>{const k=laneKind(r);return k=='safe'||k=='road'||k=='rail'||k=='start'};
// ---------- storage
const ST={get(k,d){try{const v=localStorage.getItem(GAME_ID+':'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(GAME_ID+':'+k,JSON.stringify(v))}catch(e){}}};
// ---------- safe area + layout
let SAFE={t:0,r:0,b:0,l:0};
function readSafe(){try{if(window.__SAFE){SAFE=Object.assign({t:0,r:0,b:0,l:0},window.__SAFE);return}const d=document.createElement('div');d.style.cssText='position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';document.body.appendChild(d);const cs=getComputedStyle(d);SAFE={t:parseFloat(cs.paddingTop)||0,r:parseFloat(cs.paddingRight)||0,b:parseFloat(cs.paddingBottom)||0,l:parseFloat(cs.paddingLeft)||0};d.remove()}catch(e){}}
let DPR=1,SC=1,OXs=0,OYs=0,LH=600,BY=HUDH,EXTRA=0,DPAD=null,dpadOn=ST.get('dpad',true);
let menuBtns=[],BTN=[],UI=[],lastUI=[];
function onResize(){DPR=Math.min(devicePixelRatio||1,3);readSafe();c.width=Math.round(innerWidth*DPR);c.height=Math.round(innerHeight*DPR);
 const aw=Math.max(120,innerWidth-SAFE.l-SAFE.r),ah=Math.max(120,innerHeight-SAFE.t-SAFE.b);
 SC=Math.min(aw/LW,ah/(HUDH+BH+BARH));LH=ah/SC;OXs=SAFE.l+(aw-LW*SC)/2;OYs=SAFE.t;BY=HUDH;EXTRA=LH-(HUDH+BH+BARH);
 DPAD=null;if(dpadOn&&EXTRA>=100){const s=Math.min(EXTRA-12,196),cy=HUDH+BH+BARH+EXTRA/2,b=s/3;
  DPAD={cx:LW/2,cy,s,b,btns:[{d:'up',x:LW/2-b/2,y:cy-s/2,w:b,h:b},{d:'down',x:LW/2-b/2,y:cy+s/2-b,w:b,h:b},{d:'left',x:LW/2-s/2,y:cy-b/2,w:b,h:b},{d:'right',x:LW/2+s/2-b,y:cy-b/2,w:b,h:b}]}}}
addEventListener('resize',onResize);
const toL=(x,y)=>[(x-OXs)/SC,(y-OYs)/SC];
function tbRects(){return [...document.querySelectorAll('.tb')].filter(e=>getComputedStyle(e).display!='none').map(e=>{const r=e.getBoundingClientRect();return{x:(r.left-OXs)/SC,y:(r.top-OYs)/SC,w:r.width/SC,h:r.height/SC,k:'dom',s:e.id}})}
const ov=(a,b,p=0)=>a.x<b.x+b.w+p&&b.x<a.x+a.w+p&&a.y<b.y+b.h+p&&b.y<a.y+a.h+p;
// ---------- audio
let ac=null,master=null,musicGain=null,sfxGain=null,muted=ST.get('mute',false);
function A(){try{if(!ac){ac=new(window.AudioContext||webkitAudioContext)();master=ac.createGain();master.connect(ac.destination);sfxGain=ac.createGain();sfxGain.gain.value=.55;sfxGain.connect(master);musicGain=ac.createGain();musicGain.gain.value=.2;musicGain.connect(master);master.gain.value=muted?0:1}
 if(ac.state=='suspended')ac.resume()}catch(e){}return ac}
function setMute(m){muted=m;ST.set('mute',m);if(master)master.gain.value=m?0:1;$('mute').textContent=m?'🔇':'🔊'}
function tone(f,d=.1,type='square',v=.3,f2=0,dl=0,dest){const a=ac;if(!a||muted||a.state!='running')return;const t=a.currentTime+dl,o=a.createOscillator(),gn=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);
 gn.gain.setValueAtTime(0.0001,t);gn.gain.exponentialRampToValueAtTime(v,t+.006);gn.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(gn);gn.connect(dest||sfxGain);o.start(t);o.stop(t+d+.03)}
let nbuf=null;function noise(d=.1,v=.3,fq=1000,q=1,type='bandpass',dl=0,f2=0,dest){const a=ac;if(!a||muted||a.state!='running')return;if(!nbuf){nbuf=a.createBuffer(1,a.sampleRate,a.sampleRate);const ch=nbuf.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=R()*2-1}
 const t=a.currentTime+dl,s=a.createBufferSource(),f=a.createBiquadFilter(),gn=a.createGain();s.buffer=nbuf;s.loop=true;f.type=type;f.frequency.setValueAtTime(fq,t);if(f2)f.frequency.exponentialRampToValueAtTime(f2,t+d);f.Q.value=q;gn.gain.setValueAtTime(v,t);gn.gain.exponentialRampToValueAtTime(0.0001,t+d);s.connect(f);f.connect(gn);gn.connect(dest||sfxGain);s.start(t,R());s.stop(t+d+.03)}
const NOTE=n=>440*Math.pow(2,(n-69)/12);
const SFX={
 hop(){tone(392,.05,'square',.09,620);tone(780,.035,'triangle',.05,0,.03)},
 bump(){tone(150,.08,'square',.1,110)},
 bonk(){noise(.18,.35,900,1.2,'bandpass');tone(520,.35,'square',.14,90);tone(1200,.08,'triangle',.08,0,.05)},
 splash(){noise(.5,.4,1800,.7,'lowpass',0,200);tone(300,.3,'sine',.12,80)},
 tick(){tone(1320,.05,'square',.07)},
 soda(){tone(988,.06,'square',.08);tone(1480,.09,'square',.07,0,.05)},
 pizza(){tone(660,.07,'triangle',.12);tone(880,.07,'triangle',.12,0,.07);tone(1100,.1,'triangle',.1,0,.14)},
 can(){[523,659,784,1047].forEach((f,i)=>tone(f,.09,'square',.07,0,i*.05))},
 gold(){[784,988,1175,1568,1976,2349].forEach((f,i)=>tone(f,.12,'triangle',.11,0,i*.055));noise(.5,.08,6000,.5,'highpass',.1)},
 home(){[523,659,784,659,784,1047].forEach((f,i)=>tone(f,.1,'square',.08,0,i*.07))},
 bug(){[1200,1500,1800].forEach((f,i)=>tone(f,.06,'sine',.1,0,i*.04))},
 kit(){tone(880,.08,'sine',.12,1320);tone(1320,.1,'sine',.1,1760,.09)},
 oneup(){[523,784,1047,1319,1568,2093].forEach((f,i)=>tone(f,.09,'square',.08,0,i*.06))},
 clear(){[523,523,659,784,0,659,784,1047].forEach((f,i)=>f&&tone(f,.16,'square',.09,0,i*.11));[262,330,392,523].forEach((f,i)=>tone(f,.3,'triangle',.12,0,i*.22))},
 die(){[659,622,587,554,523,494,466,440].forEach((f,i)=>tone(f,.07,'square',.07,0,.25+i*.06))},
 over(){[392,370,349,330,311,294,277,262].forEach((f,i)=>tone(f,.18,'triangle',.12,0,i*.16))},
 bell(){tone(1480,.18,'triangle',.07);tone(1760,.12,'sine',.04,0,.02)},
 horn(){tone(330,.16,'square',.05);tone(415,.16,'square',.04)},
 ferry(){tone(98,.9,'sawtooth',.05);tone(147,.9,'sine',.06)},
 gull(){tone(1500,.12,'sawtooth',.04,900);tone(1600,.14,'sawtooth',.04,1000,.16)},
 crow(){noise(.12,.15,700,3,'bandpass');noise(.12,.15,650,3,'bandpass',.18)},
 combo(){tone(1760,.06,'triangle',.06)},
 click(){tone(660,.05,'square',.07)}};
function vib(ms){try{if(!muted&&navigator.vibrate)navigator.vibrate(ms)}catch(e){}}
// ---------- music: tiny step sequencer (paused with the game)
const SONGS={
 title:{bpm:118,tracks:[{type:'square',vol:.09,notes:[72,0,0,74,76,0,79,0,76,0,74,0,72,0,67,0,69,0,72,0,74,0,72,0,69,0,67,0,0,0,0,0]},{type:'triangle',vol:.2,notes:[48,0,55,0,52,0,55,0,48,0,55,0,52,0,55,0,53,0,57,0,55,0,59,0,53,0,55,0,48,0,55,0]},{type:'drum',vol:.25,notes:[1,0,3,0,2,0,3,0]}]},
 day:{bpm:142,tracks:[{type:'square',vol:.08,notes:[72,0,76,0,79,0,76,0,74,0,77,0,81,0,77,0,76,0,79,0,84,0,79,0,77,76,74,0,72,0,0,0,72,0,72,74,76,0,72,0,74,0,74,76,77,0,74,0,76,0,79,0,77,0,76,0,74,0,71,0,72,0,0,0]},{type:'triangle',vol:.2,notes:[48,0,55,0,48,0,55,0,50,0,57,0,50,0,57,0,52,0,59,0,52,0,59,0,53,0,55,0,48,0,55,0]},{type:'drum',vol:.26,notes:[1,0,3,0,2,0,3,3,1,0,3,0,2,0,3,0]}]},
 night:{bpm:122,tracks:[{type:'square',vol:.07,notes:[69,0,72,0,76,0,72,0,71,0,74,0,77,0,74,0,72,0,76,0,79,0,76,0,74,72,71,0,69,0,0,0,69,0,0,71,72,0,74,0,76,0,74,0,72,0,71,0,69,0,71,72,74,0,72,71,69,0,68,0,69,0,0,0]},{type:'triangle',vol:.2,notes:[45,0,52,0,45,0,52,0,50,0,57,0,50,0,57,0,48,0,55,0,48,0,55,0,52,0,56,0,45,0,52,0]},{type:'drum',vol:.22,notes:[1,0,3,0,2,0,3,0,1,0,3,1,2,0,3,0]}]}};
let song=null,songName='',musicOn=false,mStep=0,mNext=0,mTimer=null;
function playSong(n){if(songName==n&&musicOn)return;songName=n;song=SONGS[n];mStep=0;const a=A();if(!a)return;if(!musicOn){musicOn=true;mNext=a.currentTime+.1;mTimer=setInterval(mTick,50)}}
function musicPaused(){return paused||panelOpen||document.hidden}
function mTick(){if(!ac||!song)return;const sp=60/song.bpm/4;if(mNext<ac.currentTime-.5)mNext=ac.currentTime+.05;
 while(mNext<ac.currentTime+.2){if(!muted&&!musicPaused()&&ac.state=='running'){for(const tr of song.tracks){const n=tr.notes[mStep%tr.notes.length];if(n>0){const t0=Math.max(0,mNext-ac.currentTime);
  if(tr.type=='drum'){if(n==1)tone(110,.12,'sine',tr.vol,40,t0,musicGain);else if(n==2)noise(.08,tr.vol*.6,2500,1,'highpass',t0,0,musicGain);else noise(.03,tr.vol*.35,8000,1,'highpass',t0,0,musicGain)}
  else tone(NOTE(n),sp*.9,tr.type,tr.vol,0,t0,musicGain)}}}
  mNext+=sp;mStep++}}
