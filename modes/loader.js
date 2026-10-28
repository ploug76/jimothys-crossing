/* Jimothy's Crossing - graphics versions (Peter 10/28).
   Same game, same rules, same scores; only the picture changes.
   ?mode=32bit | 64bit | 2000s | modern | hyperreal   (no mode = the original 8-bit look)
   The 3D looks are drawn by modes/r3d.js under the normal 2D HUD/buttons, so controls never change. */
(()=>{'use strict';
const MODES=[['original','Original','The 8-bit original'],['32bit','32-Bit','PS1 / Saturn era 3D'],['64bit','64-Bit','N64 era 3D'],['2000s','2000s 3D','PS2 / GameCube era'],['modern','Modern','Stylized modern 3D'],['hyperreal','Hyperreal','Photoreal lighting & materials']];
const VER='16';
const ENABLED=['original','32bit','64bit','2000s'];// tiers go live one at a time
const q=new URLSearchParams(location.search);let m=(q.get('mode')||'').toLowerCase();if(!MODES.some(x=>x[0]==m&&ENABLED.includes(x[0])))m='original';
window.__JC_MODE=m;window.__JC_MODES=MODES;
const label=MODES.find(x=>x[0]==m)[1];
// ---------- picker (🎨 button left of ❓, and a list sheet)
const st=document.createElement('style');st.textContent=`#look{right:calc(153px + env(safe-area-inset-right))!important;display:block}
#lookP{position:fixed;inset:0;z-index:30;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.66);padding:calc(10px + env(safe-area-inset-top)) 10px calc(10px + env(safe-area-inset-bottom));box-sizing:border-box;touch-action:pan-y}
#lookB{background:#0f2236;border:4px solid #ffd23f;border-radius:18px;width:min(92vw,400px);max-height:100%;overflow:auto;padding:12px 14px 14px;box-sizing:border-box;color:#fff;font-family:"Trebuchet MS","Segoe UI",sans-serif}
#lookB h2{margin:2px 0 10px;text-align:center;color:#ffd23f;font-size:20px}
#lookB button{display:flex;width:100%;min-height:52px;margin:0 0 8px;border-radius:14px;border:2px solid #ffffff55;background:#1d3c5c;color:#fff;font:bold 17px "Trebuchet MS","Segoe UI",sans-serif;text-align:left;padding:6px 14px;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;touch-action:manipulation}
#lookB button small{font-weight:normal;font-size:14px;color:#cfe3ff;text-align:right}
#lookB button.on{background:#2e9e5b;border-color:#fff}
#lookB #lookX{justify-content:center;background:#56616e;margin:4px 0 0}
#lookL{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:25;background:rgba(0,0,0,.75);color:#fff;font:bold 15px "Trebuchet MS",sans-serif;padding:8px 14px;border-radius:20px;display:none;pointer-events:none;white-space:nowrap}`;
document.head.appendChild(st);
const b=document.createElement('button');b.id='look';b.className='tb';b.type='button';b.textContent='🎨';b.setAttribute('aria-label','Graphics version: '+label);
document.body.appendChild(b);
const p=document.createElement('div');p.id='lookP';p.setAttribute('role','dialog');p.setAttribute('aria-modal','true');
p.innerHTML='<div id="lookB"><h2>🎨 Pick a look</h2>'+MODES.filter(x=>ENABLED.includes(x[0])).map(x=>`<button type="button" data-m="${x[0]}" class="${x[0]==m?'on':''}"><span>${x[1]}${x[0]==m?' ✓':''}</span><small>${x[2]}</small></button>`).join('')+'<button type="button" id="lookX">Close</button></div>';
document.body.appendChild(p);
const lt=document.createElement('div');lt.id='lookL';document.body.appendChild(lt);
const stop=e=>e.stopPropagation();['pointerdown','touchstart','mousedown','pointerup','touchend','keydown'].forEach(ev=>{b.addEventListener(ev,stop);p.addEventListener(ev,stop)});
let wasPanel=false;
function openP(){try{if(state=='play'&&!paused)togglePause()}catch(e){}try{wasPanel=panelOpen;panelOpen=true}catch(e){}p.style.display='flex'}
function closeP(){p.style.display='none';try{panelOpen=wasPanel}catch(e){}}
b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();try{A()}catch(_){}try{SFX.click()}catch(_){}openP()});
p.addEventListener('click',e=>{e.stopPropagation();const t=e.target.closest('button');if(!t){if(e.target===p)closeP();return}
 if(t.id=='lookX'){closeP();return}const nm=t.dataset.m;if(nm==m){closeP();return}
 const u=new URL(location.href);if(nm=='original')u.searchParams.delete('mode');else u.searchParams.set('mode',nm);location.href=u.toString()});
window.__JC_loading=(txt)=>{if(txt){lt.textContent=txt;lt.style.display='block'}else lt.style.display='none'};
if(m=='original')return;
// ---------- 3D looks: the 2D canvas keeps the HUD, menus, pop-ups and the D-pad; the world comes from r3d.js
try{document.title="Jimothy's Crossing: "+label}catch(e){}
const im=document.createElement('script');im.type='importmap';im.textContent=JSON.stringify({imports:{three:'./modes/vendor/three.module.min.js','three/addons/':'./modes/vendor/jsm/'}});document.head.appendChild(im);
const ms=document.createElement('script');ms.type='module';ms.src='modes/r3d.js?v='+VER;ms.onerror=()=>{window.__JC_loading('');};document.head.appendChild(ms);
window.__JC_loading('Loading '+label+' graphics…');
const DARK='#0b1622';
function overlay2D(){// rain streaks + storm flash (sky / darkness come from the 3D lighting)
 if(!G||state=='title')return;const w=G.w;
 if(w=='rain'||w=='storm'){g.strokeStyle='rgba(210,225,255,.38)';g.lineWidth=1;g.beginPath();for(const d of drops){g.moveTo(d.x,d.y);g.lineTo(d.x-d.l*.18,d.y+d.l)}g.stroke()}
 if(w=='storm'){if(!G.flashT||gt>G.flashT){G.flashT=gt+rnd(6,12);G.flashS=gt;if(state=='play'&&!paused)noise(1.2,.25,180,.6,'lowpass',.3)}const fa=1-(gt-G.flashS)/.45;window.__JC_flash=Math.max(0,fa);if(fa>0){g.fillStyle=`rgba(230,240,255,${fa*.3})`;g.fillRect(-400,-OYs/SC,LW+800,BY+BH+OYs/SC)}}else window.__JC_flash=0}
function popsMapped(ok){if(!ok||!R3map()){drawPops();return}const sv=pops.map(p=>[p.x,p.y]);try{for(const p of pops){const q=window.__R3D.mapXY(p.x,p.y);p.x=q[0];p.y=q[1]}drawPops()}finally{pops.forEach((p,i)=>{p.x=sv[i][0];p.y=sv[i][1]})}}
const R3map=()=>window.__R3D&&window.__R3D.mapXY;
function badge(){if(LH<600)return;const s='🎨 '+label.toUpperCase()+' EDITION';const y=LH-16-58+26;txt(s,LW/2,y,fitSize(s,14,LW-40),'#7fe0ff','center',{stroke:4,sc:'#0b1622'})}
render=function(){UI=[];menuBtns=[];const R=window.__R3D,ok=!!(R&&R.ready);
 g.setTransform(1,0,0,1,0,0);if(ok)g.clearRect(0,0,c.width,c.height);else{g.fillStyle=DARK;g.fillRect(0,0,c.width,c.height)}
 g.setTransform(SC*DPR,0,0,SC*DPR,OXs*DPR,OYs*DPR);
 if(ok){try{R.draw()}catch(e){console.warn('r3d',e);R.ready=false}overlay2D()}else drawWorld();
 if(ok&&state!='title'){const y=BY+BH+BARH;g.fillStyle=DARK;g.fillRect(-OXs/SC-4,y,innerWidth/SC+8,LH-y+(innerHeight/SC)+8)}
 if(state=='title'){drawTitle();badge()}
 else{drawHUD();if(state=='play'){drawBar();drawControls();if(paused)drawPause();else popsMapped(ok)}else if(state=='over')drawOver()}
 lastUI=UI;BTN=state=='title'?UI.slice():[]};
})();
