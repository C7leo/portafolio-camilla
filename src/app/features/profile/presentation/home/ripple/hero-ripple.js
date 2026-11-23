import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uImage;
  uniform vec2 uSize;
  uniform vec2 uImageSize;
  uniform float uPositionX;
  uniform float uTime;
  uniform vec4 uWaves[64];
  void main() {
    float field = 0.0;
    for (int i = 0; i < 64; i++) {
      vec4 wave = uWaves[i];
      float age = uTime - wave.z;
      if (wave.w > 0.0 && age >= 0.0 && age < 3.0) {
        vec2 delta = (vUv - wave.xy) * uSize;
        float radius = length(delta);
        float extent = 75.0 * (1.5 + 6.0 * (1.0 - exp(-age * 1.09)));
        float normalizedRadius = radius / extent;
        float brush = normalizedRadius < 1.0 ? max(0.0, (exp(-normalizedRadius * normalizedRadius * 5.0) - 0.00674) / 0.99326) : 0.0;
        brush *= 0.55 + 0.45 * cos(normalizedRadius * 25.1327);
        field += brush * exp(-age * 4.14) * wave.w;
      }
    }
    float amount = clamp(field, 0.0, 1.0);
    float angle = amount * 6.28318;
    vec2 shift = vec2(sin(angle), cos(angle)) * amount * 0.2;
    float scale = max(uSize.x / uImageSize.x, uSize.y / uImageSize.y);
    vec2 scaled = uImageSize * scale;
    vec2 offset = (uSize - scaled) * vec2(uPositionX, 0.5);
    vec2 imageUv = (vUv * uSize - offset) / scaled;
    gl_FragColor = texture2D(uImage, clamp(imageUv + shift, 0.0, 1.0));
  }
`;

export function mountHeroRipple(hero, mount) {
  const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
  const canvas = renderer.domElement;
  canvas.style.visibility = 'hidden';
  mount.appendChild(canvas);
  const waves = Array.from({ length: 64 }, () => new THREE.Vector4(0, 0, 0, 0));
  const uniforms = {
    uImage: { value: null }, uSize: { value: new THREE.Vector2(1, 1) },
    uImageSize: { value: new THREE.Vector2(1, 1) }, uPositionX: { value: 0.5 },
    uTime: { value: 0 }, uWaves: { value: waves },
  };
  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(geometry, material));
  const camera = new THREE.Camera();
  const loader = new THREE.TextureLoader();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let texture;
  let source = '';
  let frame = 0;
  let waveIndex = 0;
  let lastX = -1000;
  let lastY = -1000;
  let disposed = false;
  let imageVersion = 0;

  const resize = () => {
    if (disposed) return;
    const width = Math.max(1, hero.clientWidth);
    const height = Math.max(1, hero.clientHeight);
    renderer.setSize(width, height, false);
    uniforms.uSize.value.set(width, height);
    const style = getComputedStyle(hero);
    uniforms.uPositionX.value = (parseFloat(style.backgroundPositionX) || 50) / 100;
    const url = style.backgroundImage.match(/url\(["']?(.+?)["']?\)/)?.[1];
    if (!url || url === source) return;
    source = url;
    canvas.style.visibility = 'hidden';
    const version = ++imageVersion;
    loader.load(url, next => {
      if (disposed || version !== imageVersion) { next.dispose(); return; }
      texture?.dispose();
      texture = next;
      uniforms.uImage.value = next;
      uniforms.uImageSize.value.set(next.image.naturalWidth, next.image.naturalHeight);
    }, undefined, () => { if (version === imageVersion) source = ''; });
  };
  const render = now => {
    frame = 0;
    if (disposed || motion.matches || !texture) { canvas.style.visibility = 'hidden'; return; }
    const time = now / 1000;
    uniforms.uTime.value = time;
    if (!waves.some(wave => wave.w > 0 && time - wave.z < 3)) {
      canvas.style.visibility = 'hidden';
      return;
    }
    renderer.render(scene, camera);
    canvas.style.visibility = 'visible';
    frame = requestAnimationFrame(render);
  };
  const move = event => {
    if (motion.matches || event.pointerType !== 'mouse' || !texture) return;
    const rect = hero.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (Math.hypot(x - lastX, y - lastY) < 15) return;
    lastX = x; lastY = y;
    waves[waveIndex].set(x / rect.width, 1 - y / rect.height, performance.now() / 1000, 1);
    waveIndex = (waveIndex + 1) % waves.length;
    if (!frame) frame = requestAnimationFrame(render);
  };
  const onMotionChange = () => {
    if (!motion.matches) return;
    cancelAnimationFrame(frame); frame = 0;
    waves.forEach(wave => { wave.w = 0; });
    canvas.style.visibility = 'hidden';
  };
  const onContextLost = event => { event.preventDefault(); canvas.style.visibility = 'hidden'; };
  const observer = new ResizeObserver(resize);
  observer.observe(hero);
  hero.addEventListener('pointermove', move, { passive: true });
  motion.addEventListener('change', onMotionChange);
  canvas.addEventListener('webglcontextlost', onContextLost);
  resize();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    hero.removeEventListener('pointermove', move);
    motion.removeEventListener('change', onMotionChange);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    texture?.dispose(); geometry.dispose(); material.dispose(); renderer.dispose();
    canvas.remove();
  };
}
