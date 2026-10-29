/* Game controller support (gamepad.js): Xbox / PlayStation / Switch pads, USB or Bluetooth, computer or phone. */
(function(){
 function addHelp(){var t=document.getElementById('ptext');if(t&&!t.querySelector('.gp-help')&&/<h2>/.test(t.innerHTML)&&/Jimothy/.test(t.innerHTML)){var p=document.createElement('p');p.className='gp-help';p.innerHTML='🎮 <b>Controller</b> (USB or Bluetooth, on a computer or paired to your phone): left stick or D-pad hops, <b>A</b> or <b>X</b> starts / hops forward, <b>Y</b> opens this help, <b>Start</b> pauses, <b>Select</b> sound. Menus: D-pad + A, <b>B</b> closes.';t.appendChild(p)}}
 try{var _sh=showHelp;showHelp=function(){var r=_sh.apply(this,arguments);addHelp();return r}}catch(e){}
 GamepadSupport.init({
  keys:{left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown',a:'Space',x:'Space',y:function(p){if(p&&!panelOpen)showHelp()},start:'KeyP',back:'KeyM'},
  noRepeat:['a','x','y','start','back'],
  repeatDelay:300,repeatRate:120,
  ignoreSel:'#dock,#mute,#pause,#help,#inst,#ios,.tb,#dockHint,#pad,.pad,#padt',
  menu:function(){return !!document.querySelector('#palbOv.on,#smpLock.on')||panelOpen;},
  backSel:'#pclose',
  hint:{text:'🎮 Controller: stick or D-pad to hop · A to start · Y help · Start pause',when:function(){return state==='title'&&!panelOpen&&!document.querySelector('#palbOv.on,#smpLock.on')}}
 });
})();
