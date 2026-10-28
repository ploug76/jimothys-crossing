// Jimothy's Crossing - 3D renderer for the graphics versions (32-bit, 64-bit, 2000s, modern, hyperreal).
// Reads the live game state (lanes, J, G, rail, pickups...) every frame; never changes game rules.
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const MODE=window.__JC_MODE||'32bit';
const TIERS={
 '32bit':{res:240,px:true,psx:true,dither:true,tex:32,near:true,seg:.35,lam:true,flat:true,blob:true,fog:1,pitch:53},
 '64bit':{res:256,tex:32,lin:true,seg:.6,lam:true,blob:true,fog:1,fogNF:[29,50],pitch:53,sat:1.15},
 '2000s':{maxDpr:1,tex:128,seg:.8,phong:true,shadow:1,blob:false,bloom:[.45,.5,.86],fog:.8,fogNF:[33,68],msaa:4,pitch:53},
 'modern':{maxDpr:2,tex:256,seg:1,std:true,round:true,shadow:2,bloom:[.22,.4,.95],fog:.6,fogNF:[36,85],msaa:4,pitch:53,toon:true},
 'hyperreal':{maxDpr:1.5,tex:512,seg:1.4,std:true,round:true,pbr:true,shadow:2,bloom:[.22,.45,.92],fog:.55,fogNF:[38,110],msaa:4,pitch:53}};
const TI=TIERS[MODE]||TIERS['32bit'];
const R3={ready:false};window.__R3D=R3;
const loading=t=>{try{window.__JC_loading&&window.__JC_loading(t)}catch(e){}};

// ---------- renderer
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance',alpha:false});
const cv=renderer.domElement;cv.id='c3d';cv.setAttribute('aria-hidden','true');
cv.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none;touch-action:none'+(TI.px?';image-rendering:pixelated;image-rendering:crisp-edges':'');
document.body.insertBefore(cv,document.getElementById('c'));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=TI.pbr?THREE.ACESFilmicToneMapping:TI.std?THREE.NeutralToneMapping:THREE.NoToneMapping;
renderer.toneMappingExposure=TI.pbr?1.0:TI.std?1.05:1;
if(TI.shadow){renderer.shadowMap.enabled=true;renderer.shadowMap.type=TI.shadow==2?THREE.PCFSoftShadowMap:THREE.BasicShadowMap}
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(30,1,.5,400);
let quality=1;// drops automatically if the phone struggles
function pixelRatio(){if(TI.res)return TI.res/Math.max(1,innerWidth);return Math.min(devicePixelRatio||1,TI.maxDpr||1)*quality}
// ---------- post
let composer=null,bloom=null,ditherPass=null;
const snapRes={value:new THREE.Vector2(160,240)};
function buildComposer(){const pr=pixelRatio(),W=Math.max(1,Math.round(innerWidth*pr)),H=Math.max(1,Math.round(innerHeight*pr));
 const rt=new THREE.WebGLRenderTarget(W,H,{type:THREE.HalfFloatType,samples:TI.msaa||0});
 composer=new EffectComposer(renderer,rt);composer.setPixelRatio(pr);composer.setSize(innerWidth,innerHeight);
 composer.addPass(new RenderPass(scene,camera));
 if(TI.bloom){bloom=new UnrealBloomPass(new THREE.Vector2(W,H),TI.bloom[0],TI.bloom[1],TI.bloom[2]);composer.addPass(bloom)}
 composer.addPass(new OutputPass());
 if(TI.dither){ditherPass=new ShaderPass({uniforms:{tDiffuse:{value:null},uRes:{value:new THREE.Vector2(W,H)}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 uRes;varying vec2 vUv;
  float b2(vec2 q){return 2.0*q.x+3.0*q.y-4.0*q.x*q.y;}
  void main(){vec2 p=floor(vUv*uRes);vec2 q=mod(p,4.0);vec2 lo=mod(q,2.0),hi=floor(q/2.0);float bay=(4.0*b2(lo)+b2(hi)+0.5)/16.0;
   vec4 c=texture2D(tDiffuse,vUv);vec3 col=floor(c.rgb*31.0+bay)/31.0;gl_FragColor=vec4(col,1.0);}`});composer.addPass(ditherPass)}
}
// ---------- materials
const texCache={};
function canvasTex(key,size,draw,o={}){const k=key+size;if(texCache[k])return texCache[k];const cvs=document.createElement('canvas');cvs.width=cvs.height=size;const x=cvs.getContext('2d');x.save();x.scale(size/64,size/64);draw(x);x.restore();
 const t=new THREE.CanvasTexture(cvs);t.colorSpace=o.data?THREE.NoColorSpace:THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;
 if(TI.near){t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false}else if(TI.lin){t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearFilter;t.generateMipmaps=false}else{t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())}
 texCache[k]=t;return t}
let seedv=7;const srand=()=>{seedv=(seedv*16807)%2147483647;return seedv/2147483647};
function speck(x,base,cols,n,sz){x.fillStyle=base;x.fillRect(0,0,64,64);for(let i=0;i<n;i++){x.fillStyle=cols[i%cols.length];const s=sz*(.5+srand());x.fillRect(srand()*64,srand()*64,s,s)}}
const TX={
 asphalt:x=>speck(x,'#3b3e44',['#44474e','#32353a','#4c4f56','#2a2d31'],380,1.6),
 asphaltWet:x=>{speck(x,'#2c3036',['#353a41','#24282d','#3e444c'],300,1.6);x.fillStyle='rgba(150,180,210,.12)';for(let i=0;i<6;i++){x.beginPath();x.ellipse(srand()*64,srand()*64,8,3,0,0,7);x.fill()}},
 pavers:x=>{x.fillStyle='#b8a17a';x.fillRect(0,0,64,64);for(let j=0;j<4;j++)for(let i=0;i<4;i++){const o=j%2?8:0;x.fillStyle=['#c9b48f','#c2ab84','#cfbb97','#bfa780'][(i+j*3)%4];x.fillRect(((i*16+o)%64)+1,j*16+1,14,14);if(o&&i==3){x.fillRect(1-8+0,j*16+1,6,14)}}},
 sidewalk:x=>{speck(x,'#a9afb5',['#b3b9bf','#9da3a9','#b8bec4'],160,1.4);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(0,0,64,1.2);x.fillRect(0,0,1.2,64);x.fillRect(0,32,64,.8)},
 grass:x=>speck(x,'#4f8f45',['#5c9a4f','#437a3a','#6aa95a','#3d6e35'],420,2),
 hedge:x=>{speck(x,'#2e6b36',['#3b8445','#255a2c','#46944f','#1f4a26'],300,4)},
 water:x=>{x.fillStyle='#1e6fa8';x.fillRect(0,0,64,64);x.strokeStyle='rgba(255,255,255,.28)';x.lineWidth=1.4;for(let i=0;i<9;i++){const px=srand()*64,py=srand()*64;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+5,py-3,px+10,py);x.stroke()}x.fillStyle='rgba(40,140,210,.35)';for(let i=0;i<10;i++)x.fillRect(srand()*64,srand()*64,8,2)},
 bark:x=>{x.fillStyle='#7a4a24';x.fillRect(0,0,64,64);for(let i=0;i<14;i++){x.fillStyle=i%2?'#5e3818':'#8f5a2d';x.fillRect(0,srand()*64,64,1.5+srand()*2)}for(let i=0;i<40;i++){x.fillStyle='#4e2d12';x.fillRect(srand()*64,srand()*64,4+srand()*6,1)}},
 logEnd:x=>{x.fillStyle='#c89a62';x.fillRect(0,0,64,64);x.strokeStyle='#a87b45';x.lineWidth=2;for(let r=5;r<32;r+=6){x.beginPath();x.arc(32,32,r,0,7);x.stroke()}x.fillStyle='#7a4a24';x.beginPath();x.arc(32,32,3,0,7);x.fill()},
 crate:x=>{x.fillStyle='#b07a3f';x.fillRect(0,0,64,64);x.strokeStyle='#7a4e22';x.lineWidth=6;x.strokeRect(3,3,58,58);x.lineWidth=5;x.beginPath();x.moveTo(5,5);x.lineTo(59,59);x.stroke();x.fillStyle='rgba(0,0,0,.12)';for(let i=12;i<64;i+=13)x.fillRect(0,i,64,1.5)},
 gravel:x=>{speck(x,'#6b6f76',['#7c8088','#5a5e65','#878b92'],300,2.4)},
 ties:x=>{x.fillStyle='rgba(0,0,0,0)';x.clearRect(0,0,64,64);x.fillStyle='#4a3a2a';for(let i=0;i<64;i+=16)x.fillRect(i+2,0,8,64)},
 windows:x=>{x.fillStyle='#36597a';x.fillRect(0,0,64,64);for(let j=2;j<64;j+=8)for(let i=2;i<64;i+=8){x.fillStyle=(i*7+j*13)%5<2?'#a9c7e0':'#21384e';x.fillRect(i,j,5,5)}},
 windowsLit:x=>{x.fillStyle='#000';x.fillRect(0,0,64,64);for(let j=2;j<64;j+=8)for(let i=2;i<64;i+=8){x.fillStyle=(i*7+j*13)%5<2?'#ffd86b':'#000';x.fillRect(i,j,5,5)}},
 metal:x=>{speck(x,'#8795a1',['#7b8894','#93a0ab','#6f7b86'],120,2);x.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<64;i+=8)x.fillRect(i,0,2,64)},
 soda:x=>{x.fillStyle='#e63946';x.fillRect(0,0,64,64);x.fillStyle='#fff';x.fillRect(0,26,64,12);x.fillStyle='#e63946';x.font='bold 10px sans-serif';x.fillText('COLA',18,36)},
 pizza:x=>{x.fillStyle='#d9a066';x.fillRect(0,0,64,64);x.strokeStyle='#a8743c';x.lineWidth=2;x.strokeRect(5,5,54,54);x.fillStyle='#c0392b';x.font='bold 14px sans-serif';x.textAlign='center';x.fillText('PIZZA',32,38)},
 gold:x=>{const gr=x.createLinearGradient(0,0,64,0);gr.addColorStop(0,'#b8860b');gr.addColorStop(.5,'#fff3a0');gr.addColorStop(1,'#d4a017');x.fillStyle=gr;x.fillRect(0,0,64,64);x.fillStyle='#fff6c2';x.fillRect(0,26,64,10)}};
function tex(name,o){return canvasTex(name,TI.tex,TX[name],o)}
const pbr={};// hyperreal photo textures (Poly Haven, CC0)
const matCache={};
function M(key,o={}){if(matCache[key])return matCache[key];let m;const base={color:new THREE.Color(o.color??0xffffff)};
 if(o.map)base.map=o.map;if(o.emissive!=null){base.emissive=new THREE.Color(o.emissive);base.emissiveIntensity=o.ei??1;if(o.emap)base.emissiveMap=o.emap}
 if(o.transparent){base.transparent=true;base.opacity=o.opacity??1;base.depthWrite=false}
 if(o.side)base.side=o.side;
 if(o.basic)m=new THREE.MeshBasicMaterial(base);
 else if(TI.lam)m=new THREE.MeshLambertMaterial({...base,flatShading:!!TI.flat});
 else if(TI.phong)m=new THREE.MeshPhongMaterial({...base,shininess:o.metal?80:o.gloss?60:18,specular:new THREE.Color(o.metal?0x888888:o.gloss?0x666666:0x222222)});
 else{const P=TI.pbr&&o.pbr?pbr[o.pbr]:null;const opt={...base,roughness:o.rough??(TI.pbr?.75:.62),metalness:o.metal??0};
  if(P){opt.map=P.map;opt.normalMap=P.nor;opt.roughnessMap=P.arm;opt.metalnessMap=o.metalMap?P.arm:null;opt.aoMap=null;opt.normalScale=new THREE.Vector2(o.ns??1,o.ns??1);if(o.pbrTint==null)opt.color=new THREE.Color(0xffffff)}
  if(o.clear&&TI.pbr){m=new THREE.MeshPhysicalMaterial({...opt,clearcoat:1,clearcoatRoughness:.06})}
  else if(o.sheen&&TI.pbr){m=new THREE.MeshPhysicalMaterial({...opt,sheen:1,sheenRoughness:.55,sheenColor:new THREE.Color(o.sheen)})}
  else m=new THREE.MeshStandardMaterial(opt)}
 if(TI.psx&&!o.basic)psx(m);
 if(o.clip)m.clippingPlanes=CLIP;
 matCache[key]=m;return m}
const CLIP=[new THREE.Plane(new THREE.Vector3(1,0,0),6.1),new THREE.Plane(new THREE.Vector3(-1,0,0),6.1)];
function psx(m){m.onBeforeCompile=s=>{s.uniforms.uSnap=snapRes;
 s.vertexShader='uniform vec2 uSnap;\nvarying float vAffW;\n'+s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n gl_Position.xy=floor(gl_Position.xy/gl_Position.w*uSnap+0.5)/uSnap*gl_Position.w;\n vAffW=gl_Position.w;\n#ifdef USE_MAP\n vMapUv*=gl_Position.w;\n#endif');
 s.fragmentShader='varying float vAffW;\n'+s.fragmentShader.replace('#include <map_fragment>','#ifdef USE_MAP\n vec4 sampledDiffuseColor=texture2D(map,vMapUv/vAffW);\n diffuseColor*=sampledDiffuseColor;\n#endif')};m.customProgramCacheKey=()=>'psx'}
// ---------- geometry helpers
const geoCache={};const segN=n=>Math.max(3,Math.round(n*TI.seg));
function G_(key,make){return geoCache[key]||(geoCache[key]=make())}
const box=(w,h,d,r=.06)=>G_(`b${w},${h},${d},${r}`,()=>TI.round&&r>0?new RoundedBoxGeometry(w,h,d,TI.pbr?3:2,Math.min(r,w/2-.001,h/2-.001,d/2-.001)):new THREE.BoxGeometry(w,h,d));
const sph=(r=1,ws=16,hs=12)=>G_(`s${r},${ws},${hs}`,()=>new THREE.SphereGeometry(r,segN(ws),segN(hs)));
const cyl=(rt,rb,h,s=16,open=false)=>G_(`c${rt},${rb},${h},${s},${open}`,()=>new THREE.CylinderGeometry(rt,rb,h,segN(s),1,open));
const cone=(r,h,s=12)=>G_(`k${r},${h},${s}`,()=>new THREE.ConeGeometry(r,h,segN(s)));
function mesh(geo,mat,x=0,y=0,z=0,sx=1,sy=1,sz=1,shadow=true){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);if(TI.shadow&&shadow){m.castShadow=true;m.receiveShadow=true}return m}
function planeXZ(x0,x1,z0,z1,y,mat,uvs=1,segPerUnit=1){const nx=Math.max(1,Math.round((x1-x0)*segPerUnit)),nz=Math.max(1,Math.round((z1-z0)*segPerUnit));
 const g=new THREE.PlaneGeometry(x1-x0,z1-z0,TI.psx?nx:1,TI.psx?nz:1);g.rotateX(-Math.PI/2);g.translate((x0+x1)/2,y,(z0+z1)/2);const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)*uvs,-p.getZ(i)*uvs);
 const m=new THREE.Mesh(g,mat);if(TI.shadow)m.receiveShadow=true;return m}
// ---------- coordinates: 1 world unit = 1 tile; x across, z down the screen
const WX=x=>x/T-COLS/2,WZ=row=>row-ROWS/2+.5;
// ---------- lights & sky
const hemi=new THREE.HemisphereLight(0xbfe3ff,0x6b5a40,1);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(-6,14,8);scene.add(sun);scene.add(sun.target);
if(TI.shadow){sun.castShadow=true;const s=TI.shadow==2?2048:1024;sun.shadow.mapSize.set(s,s);const cm=sun.shadow.camera;cm.left=-11;cm.right=11;cm.top=11;cm.bottom=-11;cm.near=1;cm.far=50;sun.shadow.bias=-.0006;sun.shadow.normalBias=.02;if(TI.shadow==2)sun.shadow.radius=3}
const amb=new THREE.AmbientLight(0xffffff,TI.lam?.35:TI.phong?.25:0);scene.add(amb);
scene.fog=new THREE.Fog(0xbcd8ee,30,90);
const WEATHER={
 day:{dk:1,sky:0x8ec9f0,sun:0xfff4e0,si:2.3,hs:0xbfe3ff,hg:0x6b5a40,hi:1,fog:0xbcd8ee,env:.8,lamps:0,win:0,exp:1},
 dusk:{dk:.75,sky:0xf0a070,sun:0xffa060,si:1.6,hs:0xf08a5d,hg:0x3b2a6b,hi:.8,fog:0xd8907a,env:.75,lamps:.5,win:.6,exp:1},
 rain:{dk:.62,sky:0x7d8b96,sun:0xdfe6ee,si:.7,hs:0xa0adb8,hg:0x3a3f45,hi:.9,fog:0x7d8b96,env:.55,lamps:.3,win:.3,exp:1.05,wet:1},
 night:{dk:.3,sky:0x0b1530,sun:0x8fa8ff,si:.45,hs:0x2a3a6a,hg:0x0c0f18,hi:.45,fog:0x0d1733,env:.18,lamps:1,win:1,exp:1.1},
 storm:{dk:.24,sky:0x070b18,sun:0x8fa8ff,si:.35,hs:0x22304f,hg:0x08090f,hi:.35,fog:0x0a1020,env:.13,lamps:1,win:1,exp:1.1,wet:1}};
let curW='',lampLights=[],envDay=null,envDusk=null,envNight=null;
function setWeather(w){if(w==curW)return;curW=w;const P=WEATHER[w]||WEATHER.day;scene.background=new THREE.Color(P.sky);scene.fog.color.set(P.fog);
 const f=TI.fog;scene.fog.near=(w=='rain'||w=='storm'?16:26)*f+6;scene.fog.far=(w=='rain'||w=='storm'?55:85)*f+10;if(TI.fogNF){scene.fog.near=TI.fogNF[0]-(w=='rain'||w=='storm'?4:0);scene.fog.far=TI.fogNF[1]-(w=='rain'||w=='storm'?6:0)}
 sun.color.set(P.sun);sun.userData.base=P.si;hemi.color.set(P.hs);hemi.groundColor.set(P.hg);hemi.intensity=P.hi*(TI.pbr?.25:TI.std?.9:1);
 const dusk=w=='dusk';sun.position.set(dusk?-12:-6,dusk?6:14,dusk?-4:8);
 if(TI.std){scene.environment=TI.pbr?(w=='dusk'?envDusk:(w=='night'||w=='storm')?envNight:envDay):envDay;scene.environmentIntensity=TI.pbr?P.env:P.env*.35}
 renderer.toneMappingExposure=(TI.pbr?1:TI.std?.92:1)*P.exp;
 for(const L of lampLights)L.intensity=L.userData.base*P.lamps;
 for(const m of lampMats)m.emissiveIntensity=P.lamps?2.2*P.lamps+.2:0.05;
 for(const m of winMats){m.emissiveIntensity=P.win*1.3}
 for(const m of wetMats){m.roughness=P.wet?(m.userData.wr??.25):(m.userData.dr??m.roughness);if(TI.phong){m.shininess=P.wet?70:12}}
 headOn=P.lamps>0.4;for(const m of headMats)m.emissiveIntensity=headOn?2.6:.25;
 if(!TI.std){sun.intensity=P.si*(TI.lam?.85:1)*(P.dk<.5?.6:1);amb.intensity=(TI.lam?.35:.25)*P.dk;hemi.intensity=P.hi*P.dk*1.1}else sun.intensity=P.si*(TI.pbr?1.4:1)}
let headOn=false;const lampMats=[],winMats=[],wetMats=[],headMats=[];
// ---------- static world
const world=new THREE.Group();scene.add(world);
let waterMat,waterTex;
function buildWorld(){
 const X0=-24,X1=24;
 // water (rows 1-5)
 if(TI.pbr){waterMat=new THREE.MeshPhysicalMaterial({color:0x0f3a52,roughness:.07,metalness:0,normalMap:pbr.waterNor,normalScale:new THREE.Vector2(.55,.55),clearcoat:1,clearcoatRoughness:.04,clearcoatNormalMap:pbr.waterNor2,clearcoatNormalScale:new THREE.Vector2(.35,.35),envMapIntensity:1.4});}
 else{waterTex=tex('water');waterMat=TI.std?new THREE.MeshStandardMaterial({color:0x3aa0e0,map:waterTex,roughness:.25,metalness:0}):TI.phong?new THREE.MeshPhongMaterial({color:0xffffff,map:waterTex,shininess:90,specular:0x99bbdd}):new THREE.MeshLambertMaterial({map:waterTex,flatShading:!!TI.flat});if(TI.psx)psx(waterMat)}
 const wtr=planeXZ(X0,X1,WZ(1)-.5,WZ(5)+.5,-.2,waterMat,TI.pbr?.25:.5);wtr.receiveShadow=true;world.add(wtr);
 // seawalls under the land edges
 const wall=M('seawall',{color:0x8a8f96,map:TI.pbr?null:tex('sidewalk'),pbr:'sidewalk'});
 world.add(mesh(box(X1-X0,.5,.25,0),wall,0,-.2,WZ(0)+.5+.12));world.add(mesh(box(X1-X0,.5,.25,0),wall,0,-.2,WZ(6)-.5-.12));
 // hedge row with dens (row 0) and the city beyond
 const hedgeM=M('hedge',{color:TI.pbr?0x7fa860:0xffffff,map:TI.pbr?null:tex('hedge'),pbr:TI.pbr?'grass':null,pbrTint:1,rough:.95,ns:2});
 world.add(planeXZ(X0,X1,WZ(0)-.5,WZ(0)+.5,0,M('grassG',{map:TI.pbr?null:tex('grass'),pbr:'grass',rough:.95}),TI.pbr?.5:1));
 for(let i=0;i<6;i++){const xa=i==0?X0:WX(DENS[i-1])+.55,xb=i==5?X1:WX(DENS[i])-.55;if(xb-xa>.05){const h=mesh(box(xb-xa,.42,.7,.12),hedgeM,(xa+xb)/2,.21,WZ(0)-.05);world.add(h)}}
 // sidewalk + street behind the dens
 world.add(planeXZ(X0,X1,-8.6,WZ(0)-.5,.0,M('sw',{map:TI.pbr?null:tex('sidewalk'),pbr:'sidewalk'}),TI.pbr?.5:1));
 world.add(planeXZ(X0,X1,-40,-8.6,-.01,M('swB',{color:0x9aa0a6,map:TI.pbr?null:tex('asphalt'),pbr:'road'}),TI.pbr?.35:.7));
 // promenade (row 6)
 world.add(planeXZ(X0,X1,WZ(6)-.5,WZ(6)+.5,0,M('prom',{map:TI.pbr?null:tex('pavers'),pbr:'promenade'}),TI.pbr?.6:1));
 // road (rows 7-12, with the rail in row 9)
 const roadM=M('road',{map:TI.pbr?null:tex('asphalt'),pbr:'road',rough:.85});roadM.userData.dr=.85;roadM.userData.wr=.18;wetMats.push(roadM);
 world.add(planeXZ(X0,X1,WZ(7)-.5,WZ(8)+.5,0,roadM,TI.pbr?.45:1));world.add(planeXZ(X0,X1,WZ(10)-.5,WZ(12)+.5,0,roadM,TI.pbr?.45:1));
 const railBed=M('gravel',{map:TI.pbr?null:tex('gravel'),pbr:'gravel'});world.add(planeXZ(X0,X1,WZ(9)-.5,WZ(9)+.5,0,railBed,TI.pbr?.7:1));
 const tieM=M('tie',{color:0x4a3a2a,map:TI.pbr?null:tex('bark'),pbr:'planks'});const tieG=box(.16,.06,.78,0);
 const ties=new THREE.InstancedMesh(tieG,tieM,Math.round((X1-X0)/.32));const d=new THREE.Object3D();for(let i=0;i<ties.count;i++){d.position.set(X0+i*.32,.03,WZ(9));d.updateMatrix();ties.setMatrixAt(i,d.matrix)}if(TI.shadow)ties.receiveShadow=true;world.add(ties);
 const railM=M('rail',{color:0xc9ced6,metal:.9,rough:.3,gloss:1});for(const z of [WZ(9)-.22,WZ(9)+.22])world.add(mesh(box(X1-X0,.06,.06,0),railM,0,.09,z));
 // lane markings
 const white=M('white',{color:0xe8e8e8,rough:.6}),yel=M('yel',{color:0xffd23f,rough:.6});
 const dash=box(.44,.012,.06,0);const nd=Math.round((X1-X0)/.875);for(const r of [8,11,12]){const im=new THREE.InstancedMesh(dash,white,nd);for(let i=0;i<nd;i++){d.position.set(X0+i*.875+.2,.006,WZ(r)-.5);d.updateMatrix();im.setMatrixAt(i,d.matrix)}world.add(im)}
 for(const z of [WZ(9)-.5+.06,WZ(9)+.5-.06])world.add(mesh(box(X1-X0,.012,.06,0),yel,0,.006,z,1,1,1,false));
 for(const z of [WZ(7)-.5+.04,WZ(12)+.5-.04])world.add(mesh(box(X1-X0,.012,.05,0),white,0,.006,z,1,1,1,false));
 // start sidewalk (row 13) and grass beyond
 world.add(planeXZ(X0,X1,WZ(13)-.5,WZ(13)+.35,0,M('sw',{}),TI.pbr?.5:1));
 world.add(planeXZ(X0,X1,WZ(13)+.35,30,0,M('grassG',{}),TI.pbr?.5:1));
 const curb=M('curb',{color:0xc0c4c8,map:TI.pbr?null:tex('sidewalk'),pbr:'sidewalk'});
 for(const z of [WZ(13)-.5,WZ(7)-.5])world.add(mesh(box(X1-X0,.06,.08,0),curb,0,.03,z));
 // rail crossing signals
 for(const sx of [-1,1]){const x=sx*5.75;const post=M('post',{color:0x2b2f33,metal:.6,rough:.45});world.add(mesh(cyl(.035,.035,.9,8),post,x,.45,WZ(9)-.45));world.add(mesh(box(.32,.12,.06,.02),post,x,.82,WZ(9)-.45));
  for(const k of [-1,1]){const L=new THREE.Mesh(sph(.05,8,6),M('sig'+sx+k,{color:0x4a1010,emissive:0xff2d2d,ei:0}));L.position.set(x+k*.11,.82,WZ(9)-.41);world.add(L);signals.push({m:L.material,k})}}
 // lamp posts at the ends of the promenade and sidewalk
 const pole=M('pole',{color:0x2b2f33,metal:.7,rough:.4,gloss:1});
 for(const [x,z] of [[-5.85,WZ(6)],[5.85,WZ(6)],[-5.85,WZ(13)],[5.85,WZ(13)],[-5.85,WZ(0)-1.1],[5.85,WZ(0)-1.1]]){
  if(TI.pbr&&models.lamp){const o=models.lamp.clone();o.position.set(x,0,z);world.add(o)}else{world.add(mesh(cyl(.04,.06,1.6,8),pole,x,.8,z));world.add(mesh(box(.3,.05,.08,.02),pole,x-Math.sign(x)*.12,1.58,z))}
  const lm=M('lampbulb',{color:0xfff2a8,emissive:0xfff2a8,ei:.05});if(!lampMats.includes(lm))lampMats.push(lm);const bulb=new THREE.Mesh(sph(.07,10,8),lm);bulb.position.set(x-Math.sign(x)*(TI.pbr&&models.lamp?.0:.22),TI.pbr&&models.lamp?models.lampH:1.52,z);world.add(bulb);
  if(!TI.lam&&lampLights.length<6){const pl=new THREE.PointLight(0xffd98a,0,7,1.6);pl.userData.base=TI.pbr?6:3;pl.position.copy(bulb.position).y-=.1;world.add(pl);lampLights.push(pl)}}
 // city skyline beyond the dens
 const wm=tex('windows'),wl=tex('windowsLit');
 const bc=[0x36597a,0x5a6b7d,0x7a6a5a,0x4d5f72,0x8a8f96,0x6b5848];let k=0;
 for(let x=-22;x<22;){const w=1.4+srand()*2.2,h=2+srand()*5.5+(Math.abs(x)<6?0:2.5),z=-12.6-srand()*4;const key='bld'+(k%6);
  const m=M(key,{color:TI.pbr?0xffffff:bc[k%6],map:wm,pbr:k%2?'brick':null,pbrTint:k%2?null:1,emissive:0xffd86b,ei:0,emap:wl,rough:.8});if(!winMats.includes(m))winMats.push(m);
  const b=mesh(box(w,h,2.2,.05),m,x+w/2,h/2,z);const uv=b.geometry;world.add(b);x+=w+.25+srand()*.6;k++}
 // windows on the brick ones in hyperreal get the lit-window emissive too; Space Needle + Mt. Rainier
 const nd2=M('needle',{color:0xe8ecef,metal:.3,rough:.4,gloss:1}),nx=3.4,nz=-18;
 for(let i=0;i<3;i++){const a=i*2.094;const leg=mesh(cyl(.06,.16,9,8),nd2,nx+Math.cos(a)*.35,4.5,nz+Math.sin(a)*.35);leg.rotation.z=Math.cos(a)*.035;leg.rotation.x=-Math.sin(a)*.035;world.add(leg)}
 world.add(mesh(cyl(1.5,.6,.5,24),nd2,nx,9.2,nz));world.add(mesh(cyl(1.1,1.5,.25,24),M('needleTop',{color:0xffb000,rough:.5}),nx,9.55,nz));world.add(mesh(cyl(.04,.08,2,6),nd2,nx,10.6,nz));
 const mt=M('mtn',{color:0x7f93a8,rough:1}),snow=M('snow',{color:0xf4f8fb,rough:.8});world.add(mesh(cone(30,16,TI.pbr?40:10),mt,-20,7,-75,1,1,.6,false));world.add(mesh(cone(10.5,5.6,TI.pbr?40:10),snow,-20,12.2,-75,1,1,.6,false));
 // decoration props (hyperreal uses real scanned models)
 if(TI.pbr&&models.can){for(const [x,z,r] of [[-7.2,-8.0,.4],[7.6,-7.9,2],[-9.5,7.6,1],[8.4,7.8,.2],[-12,-8.1,0]]){const o=models.can.clone();o.position.set(x,0,z);o.rotation.y=r;world.add(o)}}
 world.traverse(o=>{if(o.isMesh&&!TI.shadow){o.castShadow=false}})}
const signals=[];
// ---------- dens (5 trash cans in row 0)
const denObjs=[];
function buildDens(){for(let i=0;i<5;i++){const x=WX(DENS[i]),z=WZ(0),g=new THREE.Group();g.position.set(x,0,z);
  if(TI.pbr&&models.can){const o=models.can.clone();g.add(o)}else{const cm=M('can',{color:0x8795a1,map:tex('metal'),metal:.5,rough:.45,pbr:'metal'});g.add(mesh(cyl(.34,.3,.62,18,true),M('canSide',{color:0x8795a1,map:tex('metal'),metal:.5,rough:.45,pbr:'metal',side:THREE.DoubleSide}),0,.31,0));g.add(mesh(cyl(.37,.37,.04,18,true),cm,0,.62,0));
   g.add(mesh(cyl(.3,.3,.02,16),M('canIn',{color:0x15191c}),0,.5,0));const hd=mesh(box(.12,.05,.04,.01),cm,.36,.5,0);g.add(hd);const hd2=hd.clone();hd2.position.x=-.36;g.add(hd2)}
  const fill=jimModel(.72);fill.position.set(0,TI.pbr&&models.can?models.canH-.12:.42,0);fill.visible=false;g.add(fill);g.userData.fill=fill;
  world.add(g);denObjs.push(g)}}
// ---------- Jimothy (built from shapes; fur sheen in hyperreal)
function jimModel(sc=1){const g=new THREE.Group(),b=new THREE.Group();g.add(b);g.userData.b=b;
 const grey=M('jgrey',{color:0x737a83,rough:.92,sheen:0xb8c0c8,pbrTint:1}),lg=M('jlgrey',{color:0xa3a9b1,rough:.92,sheen:0xe0e4e8}),dk=M('jdark',{color:0x26262c,rough:.9,sheen:0x555560}),blk=M('jblack',{color:0x16161a,rough:.7}),wh=M('jwhite',{color:0xf1f1f1,rough:.85,sheen:0xffffff}),eye=M('jeye',{color:0x0a0a0a,rough:.15,gloss:1}),pink=M('jpink',{color:0xe8708a,rough:.5});
 const s=16,h=12;
 b.add(mesh(sph(1,s,h),grey,0,.3,.05,.36,.3,.44));
 b.add(mesh(sph(1,s,h),lg,0,.24,-.02,.27,.2,.34));
 const head=new THREE.Group();head.position.set(0,.44,-.34);b.add(head);
 head.add(mesh(sph(1,s,h),lg,0,0,0,.27,.23,.24));
 head.add(mesh(sph(1,s,h),blk,0,.03,-.13,.26,.085,.12));// mask
 head.add(mesh(sph(1,s,h),wh,-.1,.11,-.15,.08,.04,.06));head.add(mesh(sph(1,s,h),wh,.1,.11,-.15,.08,.04,.06));// brows
 for(const ex of [-.095,.095]){head.add(mesh(sph(1,10,8),wh,ex,.035,-.215,.045,.045,.03));head.add(mesh(sph(1,8,6),eye,ex,.035,-.24,.024,.026,.015))}
 head.add(mesh(sph(1,s,h),wh,0,-.06,-.2,.12,.08,.1));head.add(mesh(sph(1,10,8),eye,0,-.03,-.3,.04,.03,.03));head.add(mesh(sph(1,8,6),pink,0,-.12,-.26,.03,.015,.02));
 for(const ex of [-.17,.17]){const e=mesh(cone(.075,.14,8),dk,ex,.2,.02);e.rotation.z=-ex*1.2;head.add(e)}
 const legs=[];for(const [lx,lz] of [[-.25,-.2],[.25,-.2],[-.24,.25],[.24,.25]]){const l=mesh(sph(1,8,6),dk,lx,.08,lz,.09,.09,.11);b.add(l);legs.push(l)}
 const tail=new THREE.Group();tail.position.set(0,.3,.45);b.add(tail);for(let i=0;i<6;i++){tail.add(mesh(sph(1,10,8),i%2?dk:lg,0,i*.035,i*.1,.12-i*.008,.11-i*.008,.08))}
 const kit=new THREE.Group();kit.visible=false;kit.position.set(0,.55,.08);kit.scale.setScalar(.42);b.add(kit);g.userData.kit=kit;
 if(sc>=.99){const k2=jimLite();kit.add(k2)}
 Object.assign(g.userData,{head,tail,legs});g.scale.setScalar(sc);return g}
function jimLite(){const g=new THREE.Group();const lg=M('jlgrey',{}),blk=M('jblack',{}),dk=M('jdark',{}),wh=M('jwhite',{});
 g.add(mesh(sph(1,10,8),M('jgrey',{}),0,.3,.05,.36,.3,.44));g.add(mesh(sph(1,10,8),lg,0,.46,-.34,.27,.23,.24));g.add(mesh(sph(1,10,8),blk,0,.49,-.47,.26,.085,.12));for(const ex of [-.17,.17])g.add(mesh(cone(.075,.14,6),dk,ex,.66,-.32));g.add(mesh(sph(1,8,6),wh,0,.4,-.54,.12,.08,.1));return g}
// ---------- vehicles & platforms
const CARS={};
const TIRE=()=>M('tire',{color:0x151515,rough:.8}),GLASS=()=>M('glass',{color:0x1b2a38,rough:.08,metal:.2,gloss:1}),HEAD=()=>{const hm=M('head',{color:0xfff7d0,emissive:0xfff2b0,ei:.25});if(!headMats.includes(hm))headMats.push(hm);return hm};
function labelTex(text,bg,fg,w=128,h=32){const k='lbl'+text+bg+fg;if(texCache[k])return texCache[k];const s=TI.tex<64?.5:TI.tex<200?1:2;const c=document.createElement('canvas');c.width=w*s;c.height=h*s;const x=c.getContext('2d');x.scale(s,s);x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle=fg;x.font=`bold ${Math.round(h*.62)}px "Trebuchet MS",sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,w/2,h/2+1);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;if(TI.near){t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false}texCache[k]=t;return t}
function wheelsOn(g,L,W,r=.13){const wm=TIRE(),hub=M('hub',{color:0xbfc5cc,metal:.8,rough:.3,gloss:1});for(const x of [-L/2+r+.12,L/2-r-.12])for(const z of [-W/2,W/2]){const w=mesh(cyl(r,r,.09,14),wm,x,r,z);w.rotation.x=Math.PI/2;g.add(w);const h=mesh(cyl(r*.55,r*.55,.1,10),hub,x,r,z);h.rotation.x=Math.PI/2;g.add(h)}}
function lightsOn(g,L,W,y,front=true){const hm=HEAD();const tm=M('tail',{color:0x8a1010,emissive:0xff2020,ei:.6});
 for(const z of [-W/2+.12,W/2-.12]){g.add(mesh(box(.04,.07,.12,.01),hm,L/2+.005,y,z,1,1,1,false));g.add(mesh(box(.04,.06,.1,.01),tm,-L/2-.005,y,z,1,1,1,false))}}
function makeVeh(o,dir){const ty=o.type,L=o.w/T-.08,g=new THREE.Group();const glass=GLASS();
 if(ty=='bike'||ty=='scooter'){const fr=M('bikefr',{color:0x222222,metal:.6,rough:.4});g.add(mesh(box(.62,.05,.05,0),fr,0,.22,0));for(const x of [-.25,.25]){const w=mesh(cyl(.16,.16,.04,14),TIRE(),x,.16,0);w.rotation.x=Math.PI/2;g.add(w)}
  if(ty=='scooter')g.add(mesh(box(.5,.18,.3,.06),M('car'+o.col,{color:o.col,clear:1,rough:.35}),0,.32,0));
  const shirt=M(ty=='bike'?'shirtB':'shirtS',{color:ty=='bike'?0x2d6cdf:0x444444,rough:.85});g.add(mesh(box(.2,.32,.24,.06),shirt,-.02,.55,0));g.add(mesh(sph(.1,10,8),M('skin',{color:0xe0b08a,rough:.7}),.02,.8,0));g.add(mesh(sph(.115,10,8),M('helm'+o.col,{color:ty=='bike'?o.col:0xf1f1f1,rough:.3,gloss:1}),.0,.85,0,1,.75,1));
  lightsOn(g,.66,.12,.3)}
 else if(ty=='bus'){const W=.82;g.add(mesh(box(L,.78,W,.08),M('bus',{color:TI.pbr?0x083b68:0x0b4f8a,clear:1,rough:.35}),0,.5,0));g.add(mesh(box(L+.01,.16,W+.01,.04),M('busT',{color:0x13a89e,rough:.4}),0,.3,0));
  g.add(mesh(box(L-.3,.26,W+.012,.03),glass,-.05,.66,0));g.add(mesh(box(.02,.3,W-.15,.02),glass,L/2+.006,.62,0));
  const sign=mesh(box(.02,.12,.4,0),M('bus44',{color:0xffffff,map:labelTex('44','#1b2a38','#ffd23f',64,32),emissive:0xffffff,ei:.4,emap:labelTex('44','#1b2a38','#ffd23f',64,32)}),L/2+.02,.86,0,1,1,1,false);g.add(sign);wheelsOn(g,L,W*.9,.15);lightsOn(g,L,W,.32)}
 else if(ty=='truck'||ty=='foodtruck'||ty=='coffee'){const W=.78,cab=.5;const cm=M('cab'+ty,{color:ty=='coffee'?0x6b3e26:0xd64545,clear:1,rough:.35});g.add(mesh(box(cab,.6,W,.08),cm,L/2-cab/2,.42,0));g.add(mesh(box(.02,.22,W-.14,.02),glass,L/2+.005,.56,0));g.add(mesh(box(cab*.55,.2,W+.01,.02),glass,L/2-cab*.42,.56,0));
  const lab=ty=='foodtruck'?'TERIYAKI':ty=='coffee'?'ESPRESSO':'FRESH FISH',bg=ty=='foodtruck'?'#ffcf33':ty=='coffee'?'#f3e3c3':'#f2f2f2',fg=ty=='coffee'?'#6b3e26':ty=='foodtruck'?'#7a1d1d':'#1d4e89';
  const lt=labelTex(lab,bg,fg,192,48),bm=M('box'+ty,{color:0xffffff,map:lt,rough:.5}),plain=M('boxp'+ty,{color:new THREE.Color(bg).getHex(),rough:.5});
  const bx=new THREE.Mesh(box(L-cab-.06,.82,W+.04,0),[plain,plain,plain,plain,bm,bm]);bx.position.set(-cab/2-.03,.55,0);if(TI.shadow){bx.castShadow=bx.receiveShadow=true}if(TI.psx)[plain,bm].forEach(m=>{});g.add(bx);
  if(ty=='foodtruck'){const aw=M('awn',{color:0xe63946,rough:.7});g.add(mesh(box(L-cab-.2,.05,.18,0),aw,-cab/2,.86,W/2+.1))}
  wheelsOn(g,L,W*.92,.14);lightsOn(g,L,W,.34)}
 else{const W=.66,col=ty=='taxi'?0xffb000:o.col;const body=M('car'+col,{color:TI.pbr?new THREE.Color(col).multiplyScalar(.62).getHex():col,clear:1,rough:TI.pbr?.42:.32,metal:TI.pbr?.55:0,gloss:1});const low=ty=='sport'?.8:1;
  g.add(mesh(box(L,.26*low,W,.08),body,0,.22*low+.02,0));g.add(mesh(box(L*(ty=='hatch'?.62:.52),.2*low,W*.9,.08),body,ty=='hatch'?-L*.1:-L*.04,.42*low+.02,0));
  g.add(mesh(box(L*(ty=='hatch'?.6:.5)+.01,.14*low,W*.9+.01,.04),glass,ty=='hatch'?-L*.1:-L*.04,.44*low+.02,0));
  if(ty=='sport')g.add(mesh(box(L+.005,.012,.08,0),M('stripe',{color:0xffffff,rough:.4}),0,.37*low+.02,0,1,1,1,false));
  if(ty=='taxi'){const tl=labelTex('TAXI','#ffffff','#000000',64,24);g.add(mesh(box(.22,.08,.12,.02),M('taxisign',{color:0xffffff,map:tl,emissive:0xffffff,ei:.3,emap:tl}),-.04,.58,0))}
  wheelsOn(g,L,W,.12);lightsOn(g,L,W,.24);if(TI.std){const chrome=M('chrome',{color:0xd8dde2,metal:1,rough:.15,gloss:1}),grille=M('grille',{color:0x202326,rough:.5,metal:.4});g.add(mesh(box(.05,.07,W*.96,.02),chrome,L/2+.01,.13,0));g.add(mesh(box(.05,.07,W*.96,.02),chrome,-L/2-.01,.13,0));g.add(mesh(box(.02,.06,W*.45,.01),grille,L/2+.012,.24,0,1,1,1,false));for(const z of [-W/2-.03,W/2+.03])g.add(mesh(box(.05,.04,.05,.01),body,L*.12,.42*low,z))}}
 g.traverse(m=>{if(m.isMesh){m.material=Array.isArray(m.material)?m.material.map(clipMat):clipMat(m.material)}});
 return g}
const clipCache=new Map();function clipMat(m){if(m.clippingPlanes)return m;let c=clipCache.get(m);if(!c){c=m.clone();c.clippingPlanes=CLIP;if(m.onBeforeCompile&&TI.psx)psx(c);
 if(headMats.includes(m))headMats.push(c);clipCache.set(m,c)}return c}
function makeTrain(cars){const g=new THREE.Group(),body=M('lrBody',{color:TI.pbr?0xc8ccd0:0xf1f3f5,clear:1,rough:.3,gloss:1}),blue=M('lrBlue',{color:0x1e5fb4,rough:.4}),grn=M('lrGreen',{color:0x2fb37a,rough:.4}),glass=GLASS();
 const lr=labelTex('LIGHT RAIL','#f1f3f5','#1e5fb4',192,40);
 for(let i=0;i<cars;i++){const cx=i*2.4+1.2,w=2.3;g.add(mesh(box(w,.95,.84,.1),body,cx,.62,0));g.add(mesh(box(w+.01,.12,.85,.03),blue,cx,.3,0));g.add(mesh(box(w+.01,.06,.85,.02),grn,cx,.92,0));g.add(mesh(box(w-.3,.3,.852,.03),glass,cx,.7,0));
  g.add(mesh(box(1.1,.16,.02,0),M('lrlab',{color:0xffffff,map:lr}),cx,.4,.43,1,1,1,false));g.add(mesh(box(.2,.25,.2,.02),M('panto',{color:0x333333,metal:.6}),cx,1.2,0));
  if(i<cars-1)g.add(mesh(box(.14,.6,.6,.02),M('bell',{color:0x333333}),cx+1.22,.6,0))}
 const hm=HEAD();for(const z of [-.28,.28]){g.add(mesh(box(.04,.08,.12,.01),hm,-.02,.45,z,1,1,1,false));g.add(mesh(box(.04,.08,.12,.01),hm,cars*2.4+.02,.45,z,1,1,1,false))}
 g.traverse(m=>{if(m.isMesh)m.material=clipMat(m.material)});return g}
function makeLog(o){const L=o.w/T-.1,g=new THREE.Group();const bark=M('bark',{color:TI.pbr?0xffffff:0xffffff,map:TI.pbr?null:tex('bark'),pbr:'bark',rough:.9}),end=M('logend',{map:tex('logEnd'),rough:.8});
 const c=new THREE.Mesh(cyl(.3,.3,L,16),[bark,end,end]);c.rotation.z=Math.PI/2;c.position.y=0;if(TI.shadow){c.castShadow=c.receiveShadow=true}g.add(c);
 if(TI.seg>=.8)for(let i=0;i<2;i++){const k=mesh(sph(1,8,6),bark,(i?.25:-.3)*L,.22,.12*(i?1:-1),.08,.05,.08);g.add(k)}
 g.traverse(m=>{if(m.isMesh)m.material=Array.isArray(m.material)?m.material.map(clipMat):clipMat(m.material)});return g}
function makeCrates(o){const n=Math.round(o.w/T),g=new THREE.Group();
 for(let i=0;i<n;i++){let c;if(TI.pbr&&models.crate){c=models.crate.clone();c.position.y=-.2}else{c=mesh(box(.84,.6,.84,.03),M('crate',{map:tex('crate'),pbr:'planks',rough:.85}));c.position.y=.1}c.position.x=i-(n-1)/2;g.add(c)}
 g.traverse(m=>{if(m.isMesh)m.material=clipMat(m.material)});return g}
function makeFerry(o){const L=o.w/T-.1,g=new THREE.Group(),wh=M('ferryW',{color:TI.pbr?0xc9ced2:0xf5f7f8,clear:1,rough:.3,gloss:1}),gr=M('ferryG',{color:0x1f7a4d,rough:.45});
 g.add(mesh(box(L-.4,.4,.92,.08),wh,-.2,.05,0));const bow=mesh(cyl(.46,.46,.4,TI.pbr?24:8,false),wh,L/2-.42,.05,0,.9,1,1);g.add(bow);
 g.add(mesh(box(L-.38,.08,.94,.02),gr,-.2,.2,0));g.add(mesh(box(L-1.4,.38,.7,.06),wh,-.4,.45,0));g.add(mesh(box(L-1.35,.12,.71,.03),GLASS(),-.4,.5,0));
 g.add(mesh(box(.6,.32,.5,.05),gr,.2,.8,0));g.add(mesh(cyl(.1,.12,.4,10),M('stack',{color:0x111111}),-.2,1,0));
 const lb=labelTex('M/V SALISH','#f5f7f8','#1f7a4d',192,40);g.add(mesh(box(1.4,.18,.02,0),M('fname',{color:0xffffff,map:lb}),-L/2+1.2,.05,.465,1,1,1,false));
 g.traverse(m=>{if(m.isMesh)m.material=clipMat(m.material)});return g}
function makeOrca(o){const L=o.w/T-.1,g=new THREE.Group(),bk=M('orcaB',{color:0x121212,rough:.25,gloss:1}),wh=M('orcaW',{color:0xf2f2f2,rough:.3,gloss:1});
 const b=new THREE.Group();g.add(b);g.userData.b=b;
 b.add(mesh(sph(1,20,14),bk,0,0,0,L/2-.15,.32,.4));b.add(mesh(sph(1,12,10),wh,L/2-.6,.12,-.27,.2,.08,.08));b.add(mesh(sph(1,12,10),wh,L/2-.6,.12,.27,.2,.08,.08));b.add(mesh(sph(1,14,10),wh,.2,-.08,0,L/2-.5,.2,.32));
 b.add(mesh(sph(1,10,8),M('saddle',{color:0x9aa0a6,rough:.4}),-.3,.26,0,.4,.06,.22));const fin=mesh(cone(.16,.75,8),bk,-.1,.55,0,1.2,1,.35);fin.rotation.z=.25;b.add(fin);
 const tail=new THREE.Group();tail.position.x=-L/2+.05;b.add(tail);tail.add(mesh(sph(1,10,8),bk,-.2,0,0,.3,.06,.45));g.userData.tail=tail;
 const mouth=mesh(box(.3,.06,.3,.02),M('mouth',{color:0xc0392b,rough:.5}),L/2-.2,-.02,0);b.add(mouth);g.userData.mouth=mouth;
 g.traverse(m=>{if(m.isMesh)m.material=clipMat(m.material)});return g}
function makePickup(type){const g=new THREE.Group();
 if(type=='soda'){g.add(mesh(cyl(.1,.1,.28,14),M('soda',{map:tex('soda'),metal:.7,rough:.3,clear:1}),0,.16,0));g.add(mesh(cyl(.085,.1,.03,14),M('alu',{color:0xcfd4d8,metal:.9,rough:.25,gloss:1}),0,.31,0))}
 else if(type=='pizza'){if(TI.pbr&&models.box){const o=models.box.clone();o.scale.multiply(new THREE.Vector3(1,.22,1));g.add(o);const t=mesh(box(.3,.002,.18,0),M('pizzalbl',{map:labelTex('PIZZA','#d9a066','#c0392b',96,48),transparent:false}),0,models.boxH*.22+.003,0,1,1,1,false);g.add(t)}else{const top=M('pizzaT',{map:tex('pizza'),rough:.85}),side=M('pizzaS',{color:0xd9a066,rough:.85});const p=new THREE.Mesh(box(.52,.09,.52,0),[side,side,top,side,side,side]);p.position.y=.06;if(TI.shadow)p.castShadow=true;g.add(p)}}
 else if(type=='can'){const cm=M('can',{color:0x8795a1,map:tex('metal'),metal:.5,rough:.45,pbr:'metal'});g.add(mesh(cyl(.2,.17,.42,16),cm,0,.21,0));g.add(mesh(cyl(.22,.22,.05,16),cm,0,.44,0));g.add(mesh(sph(.05,8,6),M('banana',{color:0xe9c46a}),.08,.49,0,1.4,.6,.8));g.add(mesh(sph(.05,8,6),M('apple',{color:0x9bd27a}),-.07,.49,.04))}
 else{const gm=M('goldcan',{color:0xffd700,map:tex('gold'),metal:1,rough:.18,emissive:0x8a6a00,ei:.5,clear:1});g.add(mesh(cyl(.13,.13,.36,18),gm,0,.22,0));g.add(mesh(cyl(.11,.13,.04,18),gm,0,.41,0));
  const halo=new THREE.Mesh(sph(.42,16,12),M('halo',{basic:1,color:0xffd700,transparent:true,opacity:.18}));halo.position.y=.22;g.add(halo);g.userData.halo=halo}
 return g}
function makeGull(){const g=new THREE.Group(),wh=M('gullW',{color:0xf4f4f4,rough:.7,sheen:0xffffff}),gr=M('gullG',{color:0x9aa3ab,rough:.7}),bk=M('gullK',{color:0x2b2b2b}),bo=M('beak',{color:0xf5a623,rough:.5});
 g.add(mesh(sph(1,12,10),wh,0,.3,0,.26,.16,.14));g.add(mesh(sph(1,10,8),wh,.22,.42,0,.11,.1,.1));const bk2=mesh(cone(.035,.14,6),bo,.36,.41,0);bk2.rotation.z=-Math.PI/2;g.add(bk2);
 const wl=mesh(sph(1,10,8),gr,-.02,.36,-.13,.22,.04,.1),wr=mesh(sph(1,10,8),gr,-.02,.36,.13,.22,.04,.1);g.add(wl,wr);g.add(mesh(sph(1,8,6),bk,-.28,.33,0,.08,.04,.07));
 for(const z of [-.05,.05])g.add(mesh(cyl(.012,.012,.16,4),bo,0,.08,z));g.add(mesh(sph(.018,6,4),bk,.3,.46,-.06));g.add(mesh(sph(.018,6,4),bk,.3,.46,.06));g.userData.w=[wl,wr];return g}
function makeCrow(){const g=new THREE.Group(),bk=M('crow',{color:0x1a1a1a,rough:.4,gloss:1}),bo=M('crowB',{color:0xf2b134});g.add(mesh(sph(1,12,10),bk,0,0,0,.14,.14,.24));g.add(mesh(sph(1,10,8),bk,0,.1,-.22,.1,.1,.1));const b=mesh(cone(.04,.14,6),M('crowBk',{color:0x333333}),0,.09,-.36);b.rotation.x=-Math.PI/2;g.add(b);
 const wl=mesh(sph(1,10,6),bk,-.2,.04,0,.24,.03,.12),wr=mesh(sph(1,10,6),bk,.2,.04,0,.24,.03,.12);g.add(wl,wr);g.userData.w=[wl,wr];return g}
function makeBug(){const g=new THREE.Group();g.add(mesh(sph(1,10,8),M('bug',{color:0x2fbf4a,rough:.25,gloss:1,metal:.3}),0,0,0,.1,.08,.14));g.add(mesh(sph(1,8,6),M('bugH',{color:0x145c22}),0,0,-.13,.06,.05,.05));
 const wm=M('bugW',{basic:1,color:0xdcffdc,transparent:true,opacity:.55});const wl=mesh(sph(1,8,6),wm,-.12,.06,0,.12,.01,.07,false),wr=mesh(sph(1,8,6),wm,.12,.06,0,.12,.01,.07,false);g.add(wl,wr);g.userData.w=[wl,wr];return g}
// blob shadows for the older looks
const blobTex=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');const gr=x.createRadialGradient(16,16,2,16,16,16);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);const t=new THREE.CanvasTexture(c);return t})();
const blobMat=new THREE.MeshBasicMaterial({map:blobTex,transparent:true,depthWrite:false});const blobGeo=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2);
function blob(sx,sz){const m=new THREE.Mesh(blobGeo,blobMat);m.scale.set(sx,1,sz);m.position.y=.012;m.renderOrder=1;return m}
// ---------- live objects (created on demand, removed when gone)
const live=new Map();let fid=0;
function use(key,make){let e=live.get(key);if(!e){const o=make();scene.add(o);e={o};live.set(key,e)}e.f=fid;e.o.visible=true;return e.o}
function sweep(){for(const [k,e] of live)if(e.f!==fid){scene.remove(e.o);live.delete(k)}}
// particles
const PMAX=160,pGeo=sph(1,6,4),pMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.95,depthWrite:false});
const pMesh=new THREE.InstancedMesh(pGeo,pMat,PMAX);pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);pMesh.frustumCulled=false;scene.add(pMesh);const pd=new THREE.Object3D(),pc=new THREE.Color();
const ringMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false});const ringGeo=new THREE.TorusGeometry(1,.06,6,segN(28)).rotateX(Math.PI/2);
// stars for a bonk
const stars=new THREE.Group();for(let i=0;i<4;i++)stars.add(mesh(sph(.07,8,6),M('star',{basic:1,color:0xffe14d}),0,0,0,1,1,1,false));stars.visible=false;scene.add(stars);
const kitRing=new THREE.Mesh(new THREE.TorusGeometry(.38,.03,6,segN(28)).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:0xffb3d9,transparent:true}));scene.add(kitRing);
// ---------- camera fit: the board (11x14 tiles) lands exactly where the 2D game puts it, so the HUD, bar and D-pad line up
let fitKey='';const vA=new THREE.Vector3(),M4=new THREE.Matrix4();
function fit(){const k=[innerWidth,innerHeight,SC,OXs,OYs].join();if(k==fitKey)return;fitKey=k;
 const W=innerWidth,H=innerHeight,pr=pixelRatio();renderer.setPixelRatio(pr);renderer.setSize(W,H,false);if(composer){composer.setPixelRatio(pr);composer.setSize(W,H)}
 const bw=Math.round(W*pr),bh=Math.round(H*pr);snapRes.value.set(bw/2,bh/2);if(ditherPass)ditherPass.uniforms.uRes.value.set(bw,bh);
 camera.aspect=W/H;camera.fov=28;const p=TI.pitch*Math.PI/180,D=30,tz=.2;camera.position.set(0,Math.sin(p)*D,tz+Math.cos(p)*D);camera.lookAt(0,0,tz);camera.updateProjectionMatrix();camera.updateMatrixWorld();
 const pj=(x,y,z)=>vA.set(x,y,z).project(camera).clone();
 const nl=pj(-COLS/2,0,ROWS/2),nr=pj(COLS/2,0,ROWS/2),ft=pj(0,0,-ROWS/2);
 const L=OXs,Rr=OXs+LW*SC,Tp=OYs+BY*SC,Bt=OYs+(BY+BH)*SC;const ndx=x=>x/W*2-1,ndy=y=>1-y/H*2;
 const aw=(ndx(Rr)-ndx(L))/(nr.x-nl.x),ah=(ndy(Tp)-ndy(Bt))/(ft.y-nl.y),a=Math.min(aw,ah);
 const bx=(ndx(L)+ndx(Rr))/2-a*(nl.x+nr.x)/2,by=ndy(Bt)-a*nl.y;
 M4.set(a,0,0,bx, 0,a,0,by, 0,0,1,0, 0,0,0,1);camera.projectionMatrix.premultiply(M4);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()}
// ---------- per-frame sync with the game
const v3=new THREE.Vector3();let lastNow=performance.now(),ftAcc=0,ftN=0,qChecked=false;
function draw(){fid++;fit();const t=gt,w=G&&state!='title'?G.w:'day';setWeather(w);
 // lightning
 const fl=window.__JC_flash||0;if(fl>0){sun.intensity=(sun.userData.base||1)*(TI.pbr?1.4:1)+fl*4;hemi.intensity+=0}else if(curW=='storm')sun.intensity=WEATHER.storm.si*(TI.pbr?1.4:1);
 // water motion
 if(waterTex){waterTex.offset.x=(t*.05)%1;waterTex.offset.y=(t*.03)%1}
 if(TI.pbr&&pbr.waterNor){pbr.waterNor.offset.set((t*.02)%1,(t*.035)%1);pbr.waterNor2.offset.set((-t*.03)%1,(t*.017)%1)}
 // rail signals
 const warn=rail&&(rail.phase=='warn'||rail.phase=='go'),on=warn&&Math.floor(gt*4)%2;for(const s of signals){const lit=warn&&((s.k>0)==!!on);s.m.emissiveIntensity=lit?3:0;s.m.color.set(lit?0xff2d2d:0x4a1010)}
 // lane objects
 for(let r=1;r<=12;r++){const l=lanes[r];if(!l)continue;const z=WZ(r);
  for(const o of l.objs){const x=objX(l,o);if(x>LW+T*3||x+o.w<-T*3)continue;const cx=WX(x+o.w/2);
   if(l.kind=='water'){const ty=o.type;
    if(ty.startsWith('log')){const m=use(o,()=>makeLog(o));m.position.set(cx,-.08+Math.sin(t*1.6+o.off)*.025,z);m.rotation.x=Math.sin(t*1.3+o.off)*.04}
    else if(ty=='ferry'){const m=use(o,()=>makeFerry(o));m.position.set(cx,-.05+Math.sin(t*1.1)*.02,z);m.rotation.y=l.dir<0?Math.PI:0;m.rotation.x=Math.sin(t*1.2)*.015}
    else if(ty=='orca'){const m=use(o,()=>makeOrca(o));m.position.set(cx,-.12+Math.sin(t*2)*.04,z);m.rotation.y=l.dir<0?Math.PI:0;m.userData.tail.rotation.y=Math.sin(t*4)*.35;const mo=(Math.sin(t*3)+1)/2;m.userData.mouth.rotation.z=-mo*.3;m.userData.mouth.position.y=-.02-mo*.04}
    else{const st=sinkState(o);const m=use(o,()=>makeCrates(o));let y=-.12,rx=0;if(st=='warn'){rx=Math.sin(t*16)*.05;y=-.14}else if(st=='down')y=-.75;else if(st=='rise')y=-.42;m.position.set(cx,y,z);m.rotation.x=rx}}
   else{const m=use(o,()=>makeVeh(o,l.dir));m.position.set(cx,0,z);m.rotation.y=l.dir<0?Math.PI:0;if(TI.blob&&!m.userData.bl){m.add(blob(o.w/T+.1,.95));m.userData.bl=1}}}}
 // train
 if(rail&&rail.phase=='go'){const cars=Math.round(rail.len/(T*2.4));const m=use('train'+cars,()=>makeTrain(cars));m.position.set(WX(rail.x),0,WZ(9))}
 // dens
 for(let i=0;i<5;i++){const f=denObjs[i]&&denObjs[i].userData.fill;if(f){f.visible=!!(G&&G.homes[i]);if(f.visible){f.rotation.y=Math.PI+Math.sin(t*1.5+i)*.25;f.userData.b.position.y=Math.sin(t*3+i)*.02}}}
 if(G&&G.bug){const m=use('bug',makeBug);const x=WX(DENS[G.bug.i]);m.position.set(x,1+Math.sin(t*6)*.08,WZ(0));m.rotation.y=t*2;const fl2=Math.sin(t*60)*.6;m.userData.w[0].rotation.z=fl2;m.userData.w[1].rotation.z=-fl2;m.visible=G.bug.t>1.2||Math.floor(t*8)%2==0}
 if(G&&G.crow){const cw=G.crow,m=use('crow',makeCrow);let y=.75,fl3=Math.sin(t*20)*.6;if(cw.ph=='land')y+=cw.t*2.2;if(cw.ph=='leave')y+=(0.6-cw.t)*3.5;if(cw.ph=='sit')fl3=.1;m.position.set(WX(DENS[cw.i]),TI.pbr&&models.can?y+models.canH-.6:y,WZ(0));m.rotation.y=Math.sin(t)*.4;m.userData.w[0].rotation.z=fl3;m.userData.w[1].rotation.z=-fl3}
 // kit
 if(G&&G.kit&&state=='play'){const k=G.kit,m=use('kit',()=>jimModel(.5));const lz=WZ(k.row),lx=WX(k.x);m.position.set(lx,.12,lz);m.rotation.y=lanes[k.row].dir>0?-Math.PI/2:Math.PI/2;m.userData.tail.rotation.y=Math.sin(t*6)*.4;kitRing.visible=true;kitRing.position.set(lx,.2,lz);kitRing.material.opacity=.5+.5*Math.sin(t*6)}else kitRing.visible=false;
 // pickups
 if(state=='play')for(const p of pickups){const bl=p.life-p.t<2&&Math.floor(p.t*8)%2;const m=use(p,()=>makePickup(p.type));m.visible=!bl;const water=laneKind(p.row)=='water';m.position.set(WX(p.x),(water?.18:0)+Math.sin(t*5+p.x)*.04+(p.type=='gold'?.05:0),WZ(p.row));m.rotation.y=t*(p.type=='gold'?2.4:.8)+p.x;if(m.userData.halo)m.userData.halo.scale.setScalar(1+Math.sin(t*10)*.08);if(TI.blob&&!m.userData.bl){m.add(blob(.5,.5));m.userData.bl=1}}
 // seagull
 if(G&&G.gull&&state!='title'){const s=G.gull,m=use('gull',makeGull);const st=s.wait>0?0:1;m.position.set(WX(s.x),Math.abs(Math.sin(t*14))*.04*st,WZ(6));m.rotation.y=s.dir<0?Math.PI:0;const fl4=st?Math.sin(t*14)*.25:0;m.userData.w[0].rotation.x=fl4;m.userData.w[1].rotation.x=-fl4;if(TI.blob&&!m.userData.bl){m.add(blob(.6,.4));m.userData.bl=1}}
 // Jimothy
 stars.visible=false;
 if(state!='title'&&G&&J.visible){const m=use('jim',()=>{const j=jimModel(1.15);if(TI.blob)j.add(blob(.9,1.05));return j});const b=m.userData.b;const x=WX(J.x),z=WZ(J.rowF);
  let y=0,s=1,sy=1,rot=-J.ang,spin=0;const water=laneKind(Math.round(J.rowF))=='water';
  if(J.dead){const k=J.dT,wet=J.dtype=='splash'||J.dtype=='swept'||J.dtype=='orca';if(wet){s=Math.max(0,1-k*1.6);y=-k*.8;m.visible=k<.6}else if(J.dtype=='time'){sy=.85;y=0}else{spin=k*14*(1-k*.5);s=1+Math.sin(k*20)*.05;m.visible=k<1.45;stars.visible=k<1.2;stars.position.set(x,.95,z);stars.children.forEach((c,i)=>{const a=gt*6+i*Math.PI/2;c.position.set(Math.cos(a)*.42,Math.sin(a*2)*.05,Math.sin(a)*.42)})}}
  else{const hop=J.hopping?Math.min(1,J.hopT):0;y=Math.sin(Math.PI*hop)*.55;if(J.land>0){s=1.08;sy=.82}if(J.hopping){sy*=1+Math.sin(Math.PI*hop)*.12}}
  const onPlat=water&&!J.hopping&&J.plat;m.position.set(x,y+(onPlat?.18:0)+(water&&J.hopping?.09:0),z);m.rotation.y=rot+spin;m.scale.set(s,s*sy,s);
  m.userData.tail.rotation.y=Math.sin(t*6)*.38;m.userData.tail.rotation.x=-.3;const lp=J.hopping?Math.sin(J.hopT*Math.PI*2)*.08:0;m.userData.legs.forEach((l,i)=>{l.position.y=.08+(i%2?lp:-lp)*.5});
  m.userData.head.rotation.x=J.dead&&J.dtype=='time'?.5:Math.sin(t*2)*.04;m.userData.kit.visible=!!J.carry}
 // particles (score bursts, splashes)
 let n=0;for(const p of parts){if(p.ring){const m=use(p,()=>new THREE.Mesh(ringGeo,ringMat.clone()));const k=p.t;m.scale.set(.2+k*1.1,1,.2+k*1.1);m.position.set(WX(p.x),-.15,WZ((p.y-BY)/T-.5));m.material.opacity=1-k/p.life;continue}
  if(n>=PMAX)continue;const a=1-p.t/p.life;const row=(p.y-BY)/T-.5;pd.position.set(WX(p.x),.35+(1-a)*.2,WZ(row));pd.scale.setScalar(p.sz/T*1.4*Math.max(.3,a));pd.updateMatrix();pMesh.setMatrixAt(n,pd.matrix);pc.set(p.col);pMesh.setColorAt(n,pc);n++}
 pMesh.count=n;pMesh.instanceMatrix.needsUpdate=true;if(pMesh.instanceColor)pMesh.instanceColor.needsUpdate=true;
 sweep();
 composer.render();
 // automatic quality for slower phones (hyperreal/modern): watch the first few seconds
 const now=performance.now(),dt=now-lastNow;lastNow=now;if(!qChecked&&TI.maxDpr&&dt<200){ftAcc+=dt;ftN++;if(ftN==90){qChecked=true;const avg=ftAcc/ftN;if(avg>30&&quality>.67){quality=Math.max(.6,1/Math.min(devicePixelRatio||1,TI.maxDpr));if(bloom&&avg>45)bloom.enabled=false;fitKey='';qChecked=false;ftAcc=0;ftN=0;if(quality<=.61)qChecked=true}}}}
// ---------- hyperreal assets
const models={};
async function loadHyper(){const base='modes/hr/';let done=0;const tot=38;const tick=()=>{done++;loading('Loading Hyperreal graphics… '+Math.min(99,Math.round(done/tot*100))+'%')};
 const tl=new THREE.TextureLoader();const aniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const T_=(f,srgb)=>new Promise(res=>tl.load(base+'tex/'+f,t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=aniso;if(srgb)t.colorSpace=THREE.SRGBColorSpace;tick();res(t)},undefined,()=>{tick();res(null)}));
 const sets=['road','promenade','sidewalk','bark','planks','grass','hedge','gravel','brick','metal'];
 await Promise.all(sets.map(async n=>{const [map,nor,arm]=await Promise.all([T_(n+'_diff.jpg',1),T_(n+'_nor.jpg'),T_(n+'_arm.jpg')]);if(map)pbr[n]={map,nor,arm}}));
 const wn=await T_('water_nor.jpg');if(wn){wn.repeat.set(1,1);pbr.waterNor=wn;pbr.waterNor2=wn.clone();pbr.waterNor2.repeat.set(.6,.6)}
 const {RGBELoader}=await import('three/addons/loaders/RGBELoader.js');const pm=new THREE.PMREMGenerator(renderer);
 const H=f=>new Promise(res=>new RGBELoader().load(base+'hdr/'+f,t=>{t.mapping=THREE.EquirectangularReflectionMapping;const e=pm.fromEquirectangular(t).texture;t.dispose();tick();res(e)},undefined,()=>{tick();res(null)}));
 [envDay,envDusk,envNight]=await Promise.all([H('day.hdr'),H('dusk.hdr'),H('night.hdr')]);
 const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');const gl=new GLTFLoader();
 const Ld=(n,size,axis='y')=>new Promise(res=>gl.load(base+'models/'+n+'/'+n+'.gltf',g=>{const o=g.scene;const bb=new THREE.Box3().setFromObject(o),sz=bb.getSize(new THREE.Vector3());if(Array.isArray(size))o.scale.set(size[0]/sz.x,size[1]/sz.y,size[2]/sz.z);else o.scale.setScalar(size/(axis=='y'?sz.y:Math.max(sz.x,sz.z)));
  const bb2=new THREE.Box3().setFromObject(o),c=bb2.getCenter(new THREE.Vector3());o.position.set(-c.x,-bb2.min.y,-c.z);const w=new THREE.Group();w.add(o);w.userData.h=bb2.max.y-bb2.min.y;o.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true}});tick();res(w)},undefined,()=>{tick();res(null)}));
 const [can,crate,lamp,bx]=await Promise.all([Ld('metal_trash_can',.78),Ld('wooden_crate_01',[.84,.62,.84]),Ld('street_lamp_01',1.9),Ld('cardboard_box_01',.5,'xz')]);
 if(can){models.can=can;models.canH=can.userData.h}if(crate){models.crate=crate}if(lamp){models.lamp=lamp;models.lampH=lamp.userData.h-.12}if(bx){models.box=bx;models.boxH=bx.userData.h}
 pm.dispose()}
async function init(){try{
 if(TI.pbr)await loadHyper();
 else if(TI.std){const {RoomEnvironment}=await import('./room.js');const pm=new THREE.PMREMGenerator(renderer);envDay=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose()}
 renderer.localClippingEnabled=true;buildComposer();buildWorld();buildDens();fitKey='';fit();setWeather('day');
 // compile everything once so the first frames don't stutter
 try{renderer.compile(scene,camera)}catch(e){}
 R3.ready=true;loading('');
 }catch(e){console.warn('3D graphics failed, showing the original look',e);loading('');R3.ready=false;try{cv.remove()}catch(_){}}}
const pv=new THREE.Vector3();R3.mapXY=(x,y)=>{pv.set(WX(x),.45,WZ((y-BY)/T-.5)).project(camera);const sx=(pv.x+1)/2*innerWidth,sy=(1-pv.y)/2*innerHeight;return[(sx-OXs)/SC,(sy-OYs)/SC]};
R3.draw=draw;R3.TI=TI;R3.scene=scene;R3.camera=camera;R3.renderer=renderer;
init();
