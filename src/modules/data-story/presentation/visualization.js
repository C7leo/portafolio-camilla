import * as THREE from 'three';
import { createParticleShapes, interpolateParticles } from './data-particles.js';

// Render on input only. Orthographic framing keeps complete figures in view.
export function createDataVisualization(container, reducedMotion) {
  const compact = matchMedia('(max-width:640px)').matches, count = compact ? 1050 : 2100;
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);
  renderer.domElement.setAttribute('aria-hidden','true');container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-6,6,4,-4,.1,100);
  camera.position.z=10;
  const shapes=createParticleShapes(count), positions=new Float32Array(count*3), colors=new Float32Array(count*3);
  const ink=new THREE.Color('#171915'), accent=new THREE.Color('#5530ed');
  for(let i=0;i<count;i++) (i%7===0?accent:ink).toArray(colors,i*3);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const textureCanvas=document.createElement('canvas');textureCanvas.width=32;textureCanvas.height=32;
  const context=textureCanvas.getContext('2d');context.fillStyle='#fff';context.beginPath();context.arc(16,16,14,0,Math.PI*2);context.fill();
  const texture=new THREE.CanvasTexture(textureCanvas);
  const material=new THREE.PointsMaterial({size:compact?3:3.4,sizeAttenuation:false,vertexColors:true,map:texture,alphaTest:.3,transparent:true,opacity:.95,depthWrite:false});
  const points=new THREE.Points(geometry,material);points.frustumCulled=false;scene.add(points);
  let progress=reducedMotion?1:0,frame=0,dead=false,lost=false;
  const render=()=>{frame=0;if(!dead&&!lost)renderer.render(scene,camera);};
  const schedule=()=>{if(!frame&&!dead&&!lost)frame=requestAnimationFrame(render);};
  function update(value){progress=Math.max(0,Math.min(1,value));interpolateParticles(shapes,positions,progress);geometry.attributes.position.needsUpdate=true;schedule();}
  function resize(){
    const {width,height}=container.getBoundingClientRect();if(!width||!height||dead)return;
    renderer.setSize(width,height);const aspect=width/height,halfHeight=Math.max(4.05,6/aspect);
    camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;camera.updateProjectionMatrix();schedule();
  }
  const observer=new ResizeObserver(resize);observer.observe(container);
  const onLost=event=>{event.preventDefault();lost=true;container.classList.remove('webgl-ready');container.classList.add('fallback-active');};
  const onRestored=()=>{lost=false;container.classList.remove('fallback-active');container.classList.add('webgl-ready');resize();update(progress);};
  renderer.domElement.addEventListener('webglcontextlost',onLost);renderer.domElement.addEventListener('webglcontextrestored',onRestored);
  resize();update(progress);container.classList.remove('fallback-active');container.classList.add('webgl-ready');
  return {update,dispose(){
    dead=true;if(frame)cancelAnimationFrame(frame);observer.disconnect();renderer.domElement.removeEventListener('webglcontextlost',onLost);renderer.domElement.removeEventListener('webglcontextrestored',onRestored);
    geometry.dispose();material.dispose();texture.dispose();renderer.dispose();renderer.domElement.remove();container.classList.remove('webgl-ready');
  }};
}
