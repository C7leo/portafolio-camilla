// Original procedural scene. No Gladeye bundles, models, textures or audio are used.
const flowerVertex = `
  attribute vec3 aCenter;
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uScatter;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vDistance;
  varying float vGlow;
  varying float vSeed;
  void main() {
    vUv = uv;
    vColor = aColor;
    vSeed = aSeed;
    vec3 center = aCenter;
    center.x += sin(uTime * .55 + aSeed) * .12;
    center.x += sign(center.x) * uScatter * (1.0 + fract(aSeed) * 2.0);
    center.y += uScatter * fract(aSeed * 1.7) * 2.0;
    vec4 view = modelViewMatrix * vec4(center, 1.0);
    vDistance = -view.z;
    vec4 projected = projectionMatrix * view;
    vec2 delta = projected.xy / max(projected.w, .1) - uPointer;
    float proximity = exp(-dot(delta, delta) * 18.0) * uPointerActive;
    vGlow = proximity;
    view.xy += normalize(delta + vec2(.001)) * proximity * .32;
    float bloom = 1.0 - smoothstep(12.0, 80.0, vDistance);
    float defocus = 1.0 + (1.0 - smoothstep(2.0, 15.0, vDistance)) * .65;
    view.xy += position.xy * aSize * (.5 + bloom * .5) * defocus;
    gl_Position = projectionMatrix * view;
  }
`;

const flowerFragment = `
  precision highp float;
  uniform float uScatter;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vDistance;
  varying float vGlow;
  varying float vSeed;
  void main() {
    vec2 p = (vUv - .5) * 2.0;
    float radius = length(p);
    float angle = atan(p.y, p.x) + vSeed;
    float focus = smoothstep(3.0, 16.0, vDistance);
    float lobes = .29 + .035 * sin(angle * 5.0 + radius * 4.0);
    float petals = exp(-pow(radius / lobes, 4.0) * 2.0);
    float core = exp(-radius * radius * 95.0);
    float halo = exp(-radius * radius * 5.5) * .24;
    float bokeh = exp(-radius * radius * 4.5) * .66;
    float shape = mix(bokeh, petals + core, focus);
    shape = mix(shape, exp(-radius * radius * 12.0), uScatter);
    float fog = exp(-max(vDistance, 0.0) * .019);
    float nearFade = smoothstep(1.2, 7.0, vDistance);
    float alpha = (shape + halo) * fog * nearFade * .62 * (1.0 + vGlow * .8);
    float grain = fract(sin(dot(gl_FragCoord.xy + floor(uTime * 24.0), vec2(12.9898, 78.233))) * 43758.5453);
    alpha *= .82 + grain * .36;
    vec3 color = mix(vColor, vec3(1.0, 1.0, .91), core * .88 + vGlow * .1);
    if (alpha < .008) discard;
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const leafFragment = `
  precision highp float;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vDistance;
  varying float vGlow;
  varying float vSeed;
  void main() {
    vec2 p = (vUv - .5) * 2.0;
    float angle = sin(vSeed) * .65;
    p = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p;
    float leaf = 1.0 - smoothstep(.45, .7, length(vec2(p.x * .65 + p.y * .5, p.y * 2.4)));
    float vein = exp(-abs(p.y) * 55.0) * .25;
    float alpha = leaf * .025 * exp(-vDistance * .045) * smoothstep(2.0, 8.0, vDistance);
    if (alpha < .008) discard;
    gl_FragColor = vec4(vColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function mountExperienceValley(host, options) {
  const preview = options.preview;
  const previewContext = preview?.getContext('2d', { alpha: false });
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  let disposed = false, visible = false;
  let renderer, scene, camera, flowers, leaves, dust, terrain;
  let frame = 0, lastTime = 0, lastDraw = 0;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, active: 0, targetActive: 0 };
  const resources = [];
  const uniforms = {
    uTime: { value: 0 }, uScatter: { value: 0 },
    uPointer: { value: { x: 0, y: 0 } }, uPointerActive: { value: 0 },
  };
  let randomSeed = 87341;
  const random = () => { randomSeed = (randomSeed * 16807) % 2147483647; return (randomSeed - 1) / 2147483646; };
  const pathX = z => Math.sin(z * .033) * 2.6 + Math.sin(z * .075) * .7;
  const ground = (x, z) => Math.pow(Math.abs(x - pathX(z)) * .145, 1.65) + Math.sin(z * .09) * .45;
  const requestDraw = () => {
    if (!disposed && visible && !document.hidden && renderer && !frame) frame = requestAnimationFrame(draw);
  };
  const stop = () => { cancelAnimationFrame(frame); frame = 0; lastTime = 0; };
  const draw = time => {
    frame = 0;
    if (disposed || !renderer || !visible || document.hidden) return;
    const reduced = preference.matches;
    if (!reduced && time - lastDraw < 1000 / 30) { requestDraw(); return; }
    const delta = lastTime ? Math.min((time - lastTime) / 1000, .08) : 1 / 30;
    lastTime = time; lastDraw = time;
    const blend = 1 - Math.exp(-3.5 * delta);
    pointer.x += (pointer.targetX - pointer.x) * blend;
    pointer.y += (pointer.targetY - pointer.y) * blend;
    pointer.active += (pointer.targetActive - pointer.active) * blend;
    const progress = Math.max(0, Math.min(1, options.state.progress));
    const z = reduced ? -28 : 12 - progress * 92;
    camera.position.set(pathX(z), 1.8, z);
    camera.lookAt(pathX(z - 20), 1.8, z - 20);
    uniforms.uTime.value = reduced ? 4 : progress * 80;
    uniforms.uScatter.value = 0;
    uniforms.uPointer.value.set(pointer.x, pointer.y);
    uniforms.uPointerActive.value = reduced ? 0 : pointer.active;
    dust.rotation.y = reduced ? 0 : Math.sin(progress * 2) * .06;
    renderer.render(scene, camera);
    // Copy the same frame immediately, before WebGL clears its drawing buffer.
    // CSS cover keeps the existing aperture crop as it expands to the viewport.
    if (previewContext) {
      const bounds = preview.getBoundingClientRect();
      if (bounds.width && bounds.height && bounds.bottom > 0 && bounds.top < innerHeight) {
        const source = renderer.domElement;
        if (preview.width !== source.width || preview.height !== source.height) {
          preview.width = source.width;
          preview.height = source.height;
        }
        previewContext.drawImage(source, 0, 0);
      }
    }
    const pointerMoving = Math.abs(pointer.x - pointer.targetX) + Math.abs(pointer.y - pointer.targetY) + Math.abs(pointer.active - pointer.targetActive) > .002;
    if (!reduced && pointerMoving) requestDraw();
  };
  const resize = () => {
    if (!renderer) return;
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, width < 641 ? 1.2 : 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 641 ? 76 : 54;
    camera.updateProjectionMatrix();
    flowers.geometry.instanceCount = width < 641 ? 3200 : 7800;
    leaves.geometry.instanceCount = flowers.geometry.instanceCount;
    requestDraw();
  };
  const onPointer = event => {
    if (!visible || preference.matches || !finePointer.matches || event.pointerType === 'touch') return;
    pointer.targetX = event.clientX / innerWidth * 2 - 1;
    pointer.targetY = 1 - event.clientY / innerHeight * 2;
    pointer.targetActive = 1;
    requestDraw();
  };
  const clearPointer = () => { pointer.targetX = 0; pointer.targetY = 0; pointer.targetActive = 0; requestDraw(); };
  const onVisibility = () => { if (document.hidden) stop(); else requestDraw(); };
  const onPreference = () => { stop(); clearPointer(); requestDraw(); };
  const onContextLost = event => { event.preventDefault(); dispose(); options.ready(false); };
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) requestDraw(); else stop();
  });
  observer.observe(host);
  const sizes = new ResizeObserver(resize);
  sizes.observe(host);
  window.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('pointerleave', clearPointer);
  document.addEventListener('visibilitychange', onVisibility);
  preference.addEventListener('change', onPreference);

  function dispose() {
    if (disposed) return;
    disposed = true; stop(); observer.disconnect(); sizes.disconnect();
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('pointerleave', clearPointer);
    document.removeEventListener('visibilitychange', onVisibility);
    preference.removeEventListener('change', onPreference);
    renderer?.domElement.removeEventListener('webglcontextlost', onContextLost);
    resources.forEach(resource => resource.dispose());
    renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove();
  }

  async function initialize() {
    try {
      const THREE = await import('three');
      if (disposed) return;
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
      renderer.setClearColor(0x000000, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);
      host.append(renderer.domElement);
      scene = new THREE.Scene();
      scene.background = new THREE.Color('#000000');
      scene.fog = new THREE.FogExp2('#000000', .034);
      camera = new THREE.PerspectiveCamera(54, 1, .1, 180);
      uniforms.uPointer.value = new THREE.Vector2();

      const palette = [new THREE.Color('#5A4EFF'), new THREE.Color('#EEA0FF'), new THREE.Color('#E2F4A6'), new THREE.Color('#FFFFFF')];
      const centers = [], leafCenters = [], scales = [], leafScales = [], seeds = [], colors = [], leafColors = [], stems = [], stemSeeds = [], stemTips = [];
      const green = new THREE.Color('#E2F4A6');
      for (let index = 0; index < 7800; index++) {
        const z = 24 - random() * 192;
        const side = random() < .5 ? -1 : 1;
        const x = pathX(z) + side * (1.9 + Math.pow(random(), 1.6) * 28);
        const y = ground(x, z);
        const height = .12 + random() * .8;
        const seed = random() * 100;
        const tone = random();
        const color = palette[tone < .15 ? 0 : tone < .52 ? 1 : tone < .88 ? 2 : 3];
        centers.push(x, y + height, z);
        leafCenters.push(x + .12, y + height * .4, z);
        scales.push(.18 + random() * .65);
        leafScales.push(.3 + random() * .34);
        seeds.push(seed);
        colors.push(color.r, color.g, color.b);
        leafColors.push(green.r, green.g, green.b);
        stems.push(x, y, z, x, y + height, z);
        stemSeeds.push(seed, seed);
        stemTips.push(0, 1);
      }
      const makePlants = (positions, sizes, tint, fragmentShader) => {
        const quad = new THREE.PlaneGeometry(1, 1);
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.index = quad.index;
        geometry.attributes.position = quad.attributes.position;
        geometry.attributes.uv = quad.attributes.uv;
        geometry.setAttribute('aCenter', new THREE.InstancedBufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('aSize', new THREE.InstancedBufferAttribute(new Float32Array(sizes), 1));
        geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(new Float32Array(seeds), 1));
        geometry.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(tint), 3));
        geometry.instanceCount = 7800;
        const material = new THREE.ShaderMaterial({ uniforms, vertexShader: flowerVertex, fragmentShader,
          transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        resources.push(geometry, material);
        scene.add(mesh);
        return mesh;
      };
      flowers = makePlants(centers, scales, colors, flowerFragment);
      leaves = makePlants(leafCenters, leafScales, leafColors, leafFragment);
      const stemGeometry = new THREE.BufferGeometry();
      stemGeometry.setAttribute('position', new THREE.Float32BufferAttribute(stems, 3));
      stemGeometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(stemSeeds, 1));
      stemGeometry.setAttribute('aTip', new THREE.Float32BufferAttribute(stemTips, 1));
      const stemMaterial = new THREE.ShaderMaterial({ uniforms, transparent: true, depthWrite: false,
        vertexShader: `attribute float aSeed; attribute float aTip; uniform float uTime; uniform float uScatter; varying float vDistance;
          void main() { vec3 p = position; p.x += sin(uTime * .55 + aSeed) * .12 * aTip;
            p.x += sign(p.x) * uScatter * (1.0 + fract(aSeed) * 2.0) * aTip;
            p.y += uScatter * fract(aSeed * 1.7) * 2.0 * aTip;
            vec4 view = modelViewMatrix * vec4(p, 1.0); vDistance = -view.z; gl_Position = projectionMatrix * view; }`,
        fragmentShader: `varying float vDistance; void main() { gl_FragColor = vec4(.886, .957, .651, .035 * exp(-vDistance * .045)); }`,
      });
      scene.add(new THREE.LineSegments(stemGeometry, stemMaterial));
      resources.push(stemGeometry, stemMaterial);

      const terrainGeometry = new THREE.PlaneGeometry(76, 210, 56, 96);
      terrainGeometry.rotateX(-Math.PI / 2);
      const vertices = terrainGeometry.attributes.position;
      for (let index = 0; index < vertices.count; index++) {
        const z = vertices.getZ(index) - 75;
        vertices.setZ(index, z);
        vertices.setY(index, ground(vertices.getX(index), z) - .08);
      }
      vertices.needsUpdate = true;
      const terrainMaterial = new THREE.MeshBasicMaterial({ color: '#212121', transparent: true, opacity: .2, fog: true });
      terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
      terrain.renderOrder = -1;
      scene.add(terrain);
      resources.push(terrainGeometry, terrainMaterial);

      const dustPositions = [];
      for (let index = 0; index < 260; index++) dustPositions.push((random() - .5) * 52, 1 + random() * 12, 24 - random() * 190);
      const dustGeometry = new THREE.BufferGeometry();
      dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3));
      const dustMaterial = new THREE.PointsMaterial({ color: '#EEA0FF', size: .035, transparent: true, opacity: .48, depthWrite: false, blending: THREE.AdditiveBlending });
      dust = new THREE.Points(dustGeometry, dustMaterial);
      scene.add(dust);
      resources.push(dustGeometry, dustMaterial);
      resize();
      options.ready(true);
      requestDraw();
    } catch { if (!disposed) { dispose(); options.ready(false); } }
  }
  void initialize();
  return { update: requestDraw, dispose };
}
