const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uTime;
  uniform float uIntro;
  uniform float uScroll;
  uniform vec3 uSurface;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 uv = vUv;
    float nx = (uv.x - 0.5) * 2.0;
    vec2 pointer = uPointer * vec2(0.025, 0.012);

    float horizon = 0.60 + uScroll * 0.008 + pointer.y;
    float curvedX = nx + pointer.x;
    float edgeY = horizon - 0.45 * curvedX * curvedX;
    float signedEdge = uv.y - edgeY;
    float outside = max(signedEdge, 0.0);
    float inside = max(-signedEdge, 0.0);

    vec3 warm = vec3(0.933, 0.627, 1.0);
    vec3 cool = vec3(0.886, 0.957, 0.651);
    vec3 white = vec3(1.0);

    float sunX = 0.15 + sin(uTime * 0.065) * 0.015 + pointer.x * 0.7;
    float along = abs(nx - sunX);
    float sunSpread = exp(-along * 3.8);
    float sky = step(0.0, signedEdge);
    float atmosphere = exp(-outside * 28.0) * sky;
    float haze = exp(-outside * 8.5) * sky;
    float rim = exp(-abs(signedEdge) * 420.0);
    float airglow = exp(-abs(outside - 0.035) * 75.0) * sky;
    float sun = exp(-along * along * 54.0) * exp(-abs(signedEdge - 0.004) * 100.0);
    float flare = exp(-along * along * 20.0) * exp(-outside * 10.0) * sky;

    float auroraBands = sin(nx * 18.0 + uTime * 0.12) * 0.5 + 0.5;
    auroraBands *= sin(nx * 31.0 - uTime * 0.08) * 0.5 + 0.5;
    float aurora = auroraBands * exp(-outside * 6.0) * sky * sunSpread * 0.025;

    float cloudNoise = sin(nx * 28.0 + uTime * 0.035) * sin(nx * 13.0 - uTime * 0.02);
    float clouds = smoothstep(0.58, 0.94, cloudNoise) * exp(-inside * 32.0) * 0.015;

    float planetAlpha = 1.0 - smoothstep(-0.004, 0.008, signedEdge);
    vec3 atmosphereColor = mix(cool, warm, 0.72 + 0.28 * sunSpread);
    vec3 rimColor = mix(vec3(1.0, 0.72, 0.48), warm, 0.72);
    float glowAlpha = atmosphere * 0.22 + haze * 0.055 + airglow * 0.035;
    glowAlpha += rim * 0.9 + sun * 0.72 + flare * 0.08 + aurora;
    vec3 glowColor = mix(atmosphereColor, rimColor, clamp(rim + sun, 0.0, 1.0));
    glowColor = mix(glowColor, white, sun * 0.24);
    vec3 color = mix(glowColor, uSurface, planetAlpha);
    color = mix(color, warm, clouds);

    float alpha = max(planetAlpha, clamp(glowAlpha, 0.0, 0.94));

    float grain = (hash21(gl_FragCoord.xy + floor(uTime * 12.0)) - .5) * .018;
    color += grain * min(glowAlpha, 0.35);
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

export function mountHorizonBloom(host, options) {
  if (typeof IntersectionObserver === 'undefined' || typeof ResizeObserver === 'undefined') {
    options.ready(false);
    return () => {};
  }

  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  let disposed = false;
  let visible = false;
  let frame = 0;
  let renderer, material, geometry;
  let surfaceColor;
  let startTime = performance.now();
  let lastTime = 0;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollProgress = 0;

  const requestDraw = () => {
    if (!disposed && visible && !document.hidden && !frame && renderer && material) frame = requestAnimationFrame(draw);
  };
  const draw = time => {
    frame = 0;
    if (disposed || !visible || document.hidden || !renderer || !material) return;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, .05) : 1 / 60;
    lastTime = time;
    const blend = 1 - Math.exp(-4 * delta);
    pointer.x += (pointer.targetX - pointer.x) * blend;
    pointer.y += (pointer.targetY - pointer.y) * blend;
    const elapsed = (time - startTime) / 1000;
    material.uniforms.uPointer.value.set(pointer.x, pointer.y);
    material.uniforms.uScroll.value = scrollProgress;
    material.uniforms.uTime.value = preference.matches ? 8 : elapsed;
    material.uniforms.uIntro.value = 1;
    if (surfaceColor) {
      if (preference.matches) material.uniforms.uSurface.value.copy(surfaceColor);
      else material.uniforms.uSurface.value.lerp(surfaceColor, 1 - Math.exp(-12 * delta));
    }
    renderer.render(renderer.__scene, renderer.__camera);
    if (!preference.matches || Math.abs(pointer.targetX - pointer.x) > .001 || Math.abs(pointer.targetY - pointer.y) > .001) {
      frame = requestAnimationFrame(draw);
    }
  };
  const resize = () => {
    if (!renderer || !material) return;
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    material.uniforms.uResolution.value.set(width, height);
    requestDraw();
  };
  const onPointer = event => {
    if (preference.matches || !finePointer.matches || event.pointerType === 'touch') return;
    pointer.targetX = Math.max(-1, Math.min(1, event.clientX / innerWidth * 2 - 1));
    pointer.targetY = Math.max(-1, Math.min(1, event.clientY / innerHeight * 2 - 1));
    requestDraw();
  };
  const onPointerLeave = () => { pointer.targetX = 0; pointer.targetY = 0; requestDraw(); };
  const onScroll = () => {
    if (!visible || preference.matches) return;
    const stage = host.closest('.story-stage');
    const spacer = stage?.parentElement;
    if (!stage || !spacer) return;
    const start = spacer.getBoundingClientRect().top + scrollY - 84;
    const distance = Math.max(spacer.offsetHeight - stage.offsetHeight, 1);
    scrollProgress = Math.max(-1, Math.min(1, ((scrollY - start) / distance) * 2 - 1));
    requestDraw();
  };
  const onVisibility = () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else requestDraw();
  };
  const onPreference = () => {
    pointer.targetX = 0; pointer.targetY = 0;
    startTime = performance.now() - 8000;
    cancelAnimationFrame(frame); frame = 0;
    requestDraw();
  };
  const onContextLost = event => { event.preventDefault(); dispose(); options.ready(false); };

  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { onScroll(); requestDraw(); }
    else { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  }, { rootMargin: '80px 0px' });
  observer.observe(host);
  const sizes = new ResizeObserver(resize);
  sizes.observe(host);
  // Only change the neutral planet uniform. Keep the renderer, time, pointer,
  // scroll and brand-colored atmospheric effects alive through theme changes.
  const themeObserver = new MutationObserver(() => {
    surfaceColor?.set(getComputedStyle(host).getPropertyValue('--surface').trim()).convertLinearToSRGB();
    requestDraw();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('visibilitychange', onVisibility);
  preference.addEventListener('change', onPreference);

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect(); sizes.disconnect(); themeObserver.disconnect();
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('pointerleave', onPointerLeave);
    document.removeEventListener('visibilitychange', onVisibility);
    preference.removeEventListener('change', onPreference);
    renderer?.domElement.removeEventListener('webglcontextlost', onContextLost);
    geometry?.dispose(); material?.dispose();
    renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove();
  }

  async function initialize() {
    try {
      const THREE = await import('three');
      if (disposed) return;
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
      renderer.setClearColor(0xFFFFFF, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);
      host.append(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      surfaceColor = new THREE.Color(getComputedStyle(host).getPropertyValue('--surface').trim()).convertLinearToSRGB();
      geometry = new THREE.PlaneGeometry(2, 2);
      material = new THREE.ShaderMaterial({
        vertexShader, fragmentShader, transparent: true, depthWrite: false,
        uniforms: {
          uResolution: { value: new THREE.Vector2(1, 1) },
          uPointer: { value: new THREE.Vector2() },
          uTime: { value: 0 }, uIntro: { value: 0 }, uScroll: { value: 0 },
          uSurface: { value: surfaceColor.clone() },
        },
      });
      scene.add(new THREE.Mesh(geometry, material));
      renderer.__scene = scene;
      renderer.__camera = camera;
      resize();
      options.ready(true);
      requestDraw();
    } catch {
      if (!disposed) { dispose(); options.ready(false); }
    }
  }

  void initialize();
  return dispose;
}
