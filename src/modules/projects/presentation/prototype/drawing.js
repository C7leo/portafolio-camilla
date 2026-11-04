export function initDrawing(){
  const canvas=document.querySelector('#drawing'),ctx=canvas.getContext('2d');
  const status=document.querySelector('#drawing-status');
  let drawing=false,last=null,hasStroke=false;
  function resize(){const rect=canvas.getBoundingClientRect();const ratio=Math.min(devicePixelRatio,2);canvas.width=rect.width*ratio;canvas.height=rect.height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#6c8e71';if(hasStroke){status.textContent='Canvas resized. Ready for a new line.';hasStroke=false;}}
  function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  function stop(e){drawing=false;last=null;if(e&&canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drawing=true;last=point(e);canvas.setPointerCapture(e.pointerId);status.textContent='Your line, your pace. Keep exploring.';});
  canvas.addEventListener('pointermove',e=>{if(!drawing)return;const p=point(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;hasStroke=true;});
  canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);canvas.addEventListener('lostpointercapture',()=>{drawing=false;last=null;});
  document.querySelector('#clear-drawing').addEventListener('click',()=>{ctx.clearRect(0,0,canvas.width,canvas.height);hasStroke=false;status.textContent='A fresh start. Take your time.';});
  document.querySelector('#trace-demo').addEventListener('click',()=>{ctx.clearRect(0,0,canvas.width,canvas.height);const {width,height}=canvas.getBoundingClientRect();ctx.save();ctx.scale(width/500,height/150);ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(20,100);ctx.bezierCurveTo(70,100,50,30,110,30);ctx.bezierCurveTo(170,30,150,120,210,120);ctx.bezierCurveTo(270,120,250,30,310,30);ctx.bezierCurveTo(370,30,350,100,410,100);ctx.lineTo(480,100);ctx.stroke();ctx.restore();hasStroke=true;status.textContent='An example of the tracing path. Try your own, or start again.';});
  const observer=new ResizeObserver(resize);observer.observe(canvas);window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}
