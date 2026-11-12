import * as THREE from 'three';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = THREE.MathUtils.lerp;
const span = (value, start, end) => clamp((value - start) / (end - start));
const out = value => 1 - (1 - value) ** 3;
const WIDTH = 2.1, HEIGHT = 1.4, STEP = WIDTH + .03, NX = 28, NY = 3, SAMPLES = 1200;
const vertexShader = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
// Equal 3:2 frames, preserving complete images on a neutral white backing.
const fragmentShader = `uniform sampler2D artwork;uniform vec2 fit;uniform float ready;varying vec2 vUv;
void main(){
  vec2 uv=vUv;if(!gl_FrontFacing)uv.x=1.-uv.x;
  vec2 sampleUv=(uv-.5)/fit+.5;
  if(any(lessThan(sampleUv,vec2(0.)))||any(greaterThan(sampleUv,vec2(1.)))){
    gl_FragColor=vec4(vec3(1.),ready);return;
  }
  vec4 color=texture2D(artwork,sampleUv);
  gl_FragColor=vec4(color.rgb,color.a*ready);
  #include <colorspace_fragment>
}`;

/** Scroll-local ribbon; no global styles, wheel interception or duplicated cards. */
export function createProjectReel(canvas, stage, projects, options) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' }); }
  catch { options.unavailable(); return () => {}; }
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const track = stage.parentElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  const loader = new THREE.TextureLoader();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const lines = stage.querySelectorAll('.reel-title span');
  const caption = stage.querySelector('.reel-caption');
  const rule = stage.querySelector('.reel-rule');
  const tooltip = stage.querySelector('.reel-tooltip');
  const labels = [...stage.querySelectorAll('.reel-card-label')];
  const header = stage.querySelector('.reel-header');
  const bottom = stage.querySelector('.reel-bottom');
  const cards = projects.map((project, index) => {
    const geometry = new THREE.PlaneGeometry(1, 1, NX, NY);
    geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, transparent: true,
      side: THREE.DoubleSide, uniforms: { artwork: { value: null }, fit: { value: new THREE.Vector2(1, 1) }, ready: { value: 0 } } });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.visible = false;
    scene.add(mesh);
    return { project, index, geometry, material, mesh, texture: null };
  });
  const points = [];
  for (let i = 0; i <= 160; i++) {
    const t = i / 160, ph = mix(-1.5, Math.PI * 2 + 1.35, t), cs = Math.cos(ph), u = 2 * t - 1;
    const depth = cs > 0 ? 7.6 + 16.4 * cs ** .9 : 7.6 + 2.2 * cs;
    const edge = .84 + .5 * span(.14 - t, 0, .14) + .8 * span(t, .84, 1);
    points.push(new THREE.Vector3(edge * Math.sin(ph) * depth * .561, .5 * Math.sign(u) * Math.abs(u) ** 1.4 * depth * .63, -depth));
  }
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  curve.arcLengthDivisions = 1500;
  const length = curve.getLength();
  const pathPoints = [], tangents = [];
  for (let i = 0; i <= SAMPLES; i++) { pathPoints.push(curve.getPointAt(i / SAMPLES)); tangents.push(curve.getTangentAt(i / SAMPLES)); }
  const point = new THREE.Vector3(), tangent = new THREE.Vector3(), up = new THREE.Vector3();
  const worldUp = new THREE.Vector3(0, 1, 0);
  let width = 1, height = 1, aspect = 1, tanH = 1, cols = 3, rows = 3;
  let mobileGrid;
  let target = 0, progress = 0, frame = 0, visible = false, disposed = false, failed = false, hovered = -1;
  let lastTick = 0;

  function at(distance) {
    const f = clamp(distance / length) * SAMPLES, index = Math.min(SAMPLES - 1, Math.floor(f)), fraction = f - index;
    point.lerpVectors(pathPoints[index], pathPoints[index + 1], fraction);
    tangent.lerpVectors(tangents[index], tangents[index + 1], fraction).normalize();
    up.copy(worldUp).addScaledVector(tangent, -worldUp.dot(tangent)).normalize();
  }
  function grid(index) {
    const vh = 16 * tanH, vw = vh * aspect;
    if (width <= 820 && mobileGrid) {
      // Use the same measured cells for WebGL artwork and its DOM label. Reserve
      // header, hint and label space before fitting the complete mosaic.
      const { top, end, gap, labelHeight, w, h } = mobileGrid;
      const fullWidth = w * cols + gap * (cols - 1);
      const fullHeight = (h + labelHeight) * rows + gap * (rows - 1);
      const x = (width - fullWidth) / 2 + (index % cols) * (w + gap);
      const y = top + Math.max(0, (end - top - fullHeight) / 2) + Math.floor(index / cols) * (h + labelHeight + gap);
      const label = labels[index];
      if (label) { label.style.left = `${x}px`; label.style.top = `${y + h}px`; label.style.width = `${w}px`; }
      return { x: (x + w / 2 - width / 2) / width * vw, y: (height / 2 - y - h / 2) / height * vh, w: w / width * vw, h: h / height * vh };
    }
    const availableWidth = vw * (cols === 3 ? .74 : .88), availableHeight = vh * .64;
    const gap = availableWidth * .022;
    const w = Math.min((availableWidth - gap * (cols - 1)) / cols, (availableHeight - gap * (rows - 1)) / rows * WIDTH / HEIGHT);
    const h = w * HEIGHT / WIDTH, fullWidth = w * cols + gap * (cols - 1), fullHeight = h * rows + gap * (rows - 1);
    const col = index % cols, row = Math.floor(index / cols);
    return { x: -fullWidth / 2 + w / 2 + col * (w + gap), y: fullHeight / 2 - h / 2 - row * (h + gap) - vh * .025, w, h };
  }
  function pose(card, head, landing) {
    const positions = card.geometry.attributes.position;
    const g = grid(card.index);
    for (let iy = 0; iy <= NY; iy++) for (let ix = 0; ix <= NX; ix++) {
      const index = iy * (NX + 1) + ix, u = ix / NX - .5, v = .5 - iy / NY;
      at(head - card.index * STEP + u * WIDTH);
      const x = point.x + up.x * v * HEIGHT, y = point.y + up.y * v * HEIGHT, z = point.z + up.z * v * HEIGHT;
      positions.setXYZ(index, mix(x, g.x + u * g.w, landing), mix(y, g.y + v * g.h, landing), mix(z, -8, landing));
    }
    positions.needsUpdate = true;
    card.geometry.computeBoundingSphere();
  }
  function render() {
    const rise = 1 - out(span(progress, 0, .12));
    const run = mix(-50, 76, span(progress, 0, .58));
    lines.forEach((line, index) => {
      const focusProgress = span(progress, .015 + index * .025, .17 + index * .025);
      const focus = focusProgress * focusProgress * (3 - 2 * focusProgress);
      line.style.transform = `translate3d(${index ? -run : run}vw,${rise * 30}vh,0)`;
      line.style.filter = `blur(${((1 - focus) * 14).toFixed(2)}px)`;
      line.style.opacity = String(mix(.15, 1, focus) * (1 - span(progress, .56, .68)));
    });
    caption.style.opacity = String(1 - span(progress, .50, .57));
    caption.style.transform = `translate(-50%,calc(-50% + ${rise * 30}vh))`;
    rule.style.transform = `scaleX(${span(progress, .72, .86)})`;
    const head = mix(0, length + cards.length * STEP, span(progress, .14, .63));
    for (const card of cards) {
      const distance = head - card.index * STEP, end = length - WIDTH;
      let landing = 0;
      card.mesh.visible = distance > WIDTH && card.material.uniforms.ready.value > 0;
      if (card.mesh.visible && distance < end) pose(card, head, 0);
      else if (card.mesh.visible) {
        const start = mix(.14, .63, (end + card.index * STEP) / (length + cards.length * STEP));
        landing = out(span(progress, start, start + .13));
        pose(card, end + card.index * STEP, landing);
      }
      const label = labels[card.index];
      if (label) {
        const readable = width <= 820 && landing >= .995;
        label.style.visibility = readable ? 'visible' : 'hidden';
        label.style.opacity = String(span(landing, .995, 1));
        label.inert = !readable;
      }
    }
    renderer.render(scene, camera);
    stage.dataset.reelProgress = progress.toFixed(4);
  }
  function readScroll() {
    const distance = track.offsetHeight - stage.offsetHeight;
    target = distance > 0 ? clamp(-track.getBoundingClientRect().top / distance) : 1;
    schedule();
  }
  function tick(time) {
    frame = 0;
    if (disposed || failed || !visible || document.hidden) return;
    // Keep the same easing duration on slow mobile GPUs and high-refresh screens.
    const delta = lastTick ? Math.min(time - lastTick, 250) : 16.7;
    lastTick = time;
    progress += (target - progress) * (1 - Math.exp(-delta / 177));
    if (Math.abs(target - progress) < .00005) progress = target;
    render();
    if (Math.abs(target - progress) > .00005) schedule();
    else lastTick = 0;
  }
  function schedule() {
    if (!frame && visible && !disposed && !failed && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function resize() {
    if (disposed || failed) return;
    width = canvas.clientWidth; height = canvas.clientHeight;
    if (!width || !height) return;
    aspect = width / height;
    camera.aspect = aspect;
    camera.fov = aspect < 16 / 9 ? Math.atan(.561 / aspect) * 360 / Math.PI : 35;
    camera.updateProjectionMatrix();
    tanH = Math.tan(camera.fov * Math.PI / 360);
    cols = width <= 820 && height < 700 ? 3 : aspect < .9 ? 2 : 3; rows = Math.ceil(cards.length / cols);
    if (width <= 820) {
      const inset = parseFloat(getComputedStyle(bottom).left) || 24;
      const top = header.offsetTop + header.offsetHeight + 20, end = bottom.offsetTop - 16;
      const gap = 12, labelHeight = 44;
      const w = Math.max(1, Math.min((width - inset * 2 - gap * (cols - 1)) / cols,
        (end - top - gap * (rows - 1) - labelHeight * rows) / rows * WIDTH / HEIGHT));
      mobileGrid = { top, end, gap, labelHeight, w, h: w * HEIGHT / WIDTH };
    } else mobileGrid = undefined;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, width <= 820 ? 1.5 : 2));
    renderer.setSize(width, height, false);
    readScroll();
  }
  function hitTest(event) {
    const bounds = canvas.getBoundingClientRect();
    mouse.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
    scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(cards.filter(card => card.mesh.visible).map(card => card.mesh))[0];
    return hit ? cards.findIndex(card => card.mesh === hit.object) : -1;
  }
  function pointerMove(event) {
    if (event.pointerType === 'touch') return;
    const index = hitTest(event);
    canvas.style.cursor = index >= 0 ? 'pointer' : 'auto';
    tooltip.style.opacity = index >= 0 ? '1' : '0';
    if (index >= 0) {
      tooltip.textContent = projects[index].name;
      const bounds = stage.getBoundingClientRect();
      tooltip.style.left = `${clamp(event.clientX - bounds.left + 14, 12, width - 150)}px`;
      tooltip.style.top = `${clamp(event.clientY - bounds.top + 16, 12, height - 44)}px`;
      if (hovered !== index) { hovered = index; options.select(index); }
    }
  }
  function pointerLeave() { tooltip.style.opacity = '0'; hovered = -1; }
  function click(event) { const index = hitTest(event); if (index >= 0) options.activate(index); }
  function keyDown(event) {
    const directions = { ArrowRight: 1, ArrowDown: cols, ArrowLeft: -1, ArrowUp: -cols };
    let index = hovered >= 0 ? hovered : 0;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); options.activate(index); return; }
    if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = cards.length - 1;
    else if (event.key in directions) index = clamp(index + directions[event.key], 0, cards.length - 1);
    else return;
    event.preventDefault(); hovered = index; options.select(index);
  }
  function unavailable() {
    if (disposed || failed) return;
    failed = true; dispose(); options.unavailable();
  }
  function contextLost(event) { event.preventDefault(); unavailable(); }
  function preferenceChange() { if (preference.matches) unavailable(); }
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) readScroll(); }, { threshold: 0 });
  observer.observe(stage);
  const sizes = new ResizeObserver(resize); sizes.observe(canvas);
  window.addEventListener('scroll', readScroll, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  preference.addEventListener('change', preferenceChange);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerleave', pointerLeave);
  canvas.addEventListener('click', click);
  canvas.addEventListener('keydown', keyDown);
  canvas.addEventListener('webglcontextlost', contextLost);
  cards.forEach(card => {
    if (!card.project.image) { unavailable(); return; }
    loader.load(card.project.image, texture => {
      if (disposed || failed) { texture.dispose(); return; }
      card.texture = texture;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const aspect = texture.image.width / texture.image.height, cardAspect = WIDTH / HEIGHT;
      card.material.uniforms.fit.value.set(Math.min(1, aspect / cardAspect), Math.min(1, cardAspect / aspect));
      card.material.uniforms.artwork.value = texture;
      card.material.uniforms.ready.value = 1;
      schedule();
    }, undefined, unavailable);
  });
  if (preference.matches) unavailable();
  resize();
  document.fonts.ready.then(() => { if (!disposed) resize(); });
  function dispose() {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(frame); observer.disconnect(); sizes.disconnect();
    window.removeEventListener('scroll', readScroll);
    document.removeEventListener('visibilitychange', schedule);
    preference.removeEventListener('change', preferenceChange);
    canvas.removeEventListener('pointermove', pointerMove);
    canvas.removeEventListener('pointerleave', pointerLeave);
    canvas.removeEventListener('click', click);
    canvas.removeEventListener('keydown', keyDown);
    canvas.removeEventListener('webglcontextlost', contextLost);
    cards.forEach(card => { card.texture?.dispose(); card.material.dispose(); card.geometry.dispose(); });
    scene.clear(); renderer.dispose(); renderer.forceContextLoss();
    // A context loss or motion-preference change switches to the DOM gallery.
    // Its heading must not inherit the ribbon's translated/blurred final pose.
    lines.forEach(line => ['transform', 'filter', 'opacity'].forEach(property => line.style.removeProperty(property)));
    caption.style.removeProperty('transform'); caption.style.removeProperty('opacity');
    rule.style.removeProperty('transform');
    labels.forEach(label => { label.inert = true; label.style.visibility = 'hidden'; });
    delete stage.dataset.reelProgress;
  }
  return dispose;
}
