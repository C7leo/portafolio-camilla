import { vertexShader, fragmentShader } from './particle-shaders.js';

function loadImage(url, signal) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const cancel = () => { image.src = ''; reject(new Error('cancelled')); };
    if (signal.aborted) { cancel(); return; }
    signal.addEventListener('abort', cancel, { once: true });
    image.onload = () => { signal.removeEventListener('abort', cancel); resolve(image); };
    image.onerror = () => { signal.removeEventListener('abort', cancel); reject(new Error('image unavailable')); };
    image.src = url;
  });
}

function makeSamples(image, hero, canvas, compact) {
  const rect = hero.getBoundingClientRect();
  const viewport = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) throw new Error('empty Hero');
  const columns = compact ? 32 : 150;
  const rows = Math.max(48, Math.min(120, Math.round(columns * rect.height / rect.width)));
  const buffer = document.createElement('canvas');
  buffer.width = columns; buffer.height = rows;
  const ctx = buffer.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('image sampling unavailable');
  const scale = Math.max(columns / image.naturalWidth, rows / image.naturalHeight);
  const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
  const position = getComputedStyle(hero).backgroundPosition.split(' ');
  const horizontal = position[0].endsWith('%') ? parseFloat(position[0]) / 100 : .5;
  const vertical = position[1]?.endsWith('%') ? parseFloat(position[1]) / 100 : .5;
  ctx.drawImage(image, (columns - width) * horizontal, (rows - height) * vertical, width, height);
  const pixels = ctx.getImageData(0, 0, columns, rows).data;
  // Shuffle destinations independently of the original ring ordering. Stratified
  // random positions keep coverage without exposing the sampling grid.
  const count = columns * rows;
  const destinations = Uint32Array.from({ length: count }, (_, i) => i);
  let randomState = 0x6d2b79f5;
  const random = () => {
    randomState ^= randomState << 13; randomState ^= randomState >>> 17; randomState ^= randomState << 5;
    return (randomState >>> 0) / 4294967296;
  };
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const value = destinations[i]; destinations[i] = destinations[j]; destinations[j] = value;
  }
  const data = new Float32Array(count * 9);
  let n = 0;
  for (let i = 0; i < count; i++) {
    const originalX = i % columns, originalY = Math.floor(i / columns);
    const cell = destinations[i], x = cell % columns, y = Math.floor(cell / columns);
    const sampleX = Math.min(columns - 1, Math.max(0, x + random() - .5));
    const sampleY = Math.min(rows - 1, Math.max(0, y + random() - .5));
    const left = Math.floor(sampleX), top = Math.floor(sampleY);
    const right = Math.min(columns - 1, left + 1), bottom = Math.min(rows - 1, top + 1);
    const fx = sampleX - left, fy = sampleY - top;
    data[n++] = (rect.left - viewport.left + (sampleX + .5) / columns * rect.width) / viewport.width;
    data[n++] = (rect.top - viewport.top + (sampleY + .5) / rows * rect.height) / viewport.height;
    for (let channel = 0; channel < 3; channel++) {
      const a = pixels[(top * columns + left) * 4 + channel];
      const b = pixels[(top * columns + right) * 4 + channel];
      const c = pixels[(bottom * columns + left) * 4 + channel];
      const d = pixels[(bottom * columns + right) * 4 + channel];
      data[n++] = ((a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy) / 255;
    }
    data[n++] = ((originalX * 73 + originalY * 151) % 997) / 997;
    data[n++] = (rect.left - viewport.left + (originalX + .5) / columns * rect.width) / viewport.width;
    data[n++] = (rect.top - viewport.top + (originalY + .5) / rows * rect.height) / viewport.height;
    data[n++] = random();
  }
  return data;
}

function mountCompactScene(canvas, data, signal, onReady, onProgress, onDisperse, onConsolidate, onComplete) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('canvas unavailable');
  const colors = [];
  const targetChannels = [];
  const initialChannels = [];
  const palette = [[85,161,254], [174,214,255], [153,174,255], [204,174,255], [255,191,217], [255,105,117], [255,204,181], [242,248,255]];
  const initialColors = [];
  const lightInitialColors = [];
  const selections = [];
  for (let i = 0; i < data.length; i += 9) {
    const rgb = [data[i + 2], data[i + 3], data[i + 4]].map(channel => Math.round(channel * 255));
    colors.push(`rgb(${rgb.join(' ')})`);
    targetChannels.push(rgb);
    const h = Math.abs(Math.sin(data[i + 5] * 437.2 + 3.1) * 43758.5453) % 1 * 7;
    const a = Math.floor(h), f = h - a;
    const initial = palette[a].map((channel, j) => Math.round(channel * (1 - f) + palette[a + 1][j] * f));
    initialChannels.push(initial);
    initialColors.push(`rgb(${initial.join(' ')})`);
    lightInitialColors.push(`rgb(${initial.map(channel => Math.round(channel * .66)).join(' ')})`);
    selections.push(Math.abs(Math.sin(data[i + 6] * 127.1 + data[i + 7] * 311.7) * 43758.5453) % 1);
  }
  let frame = 0, disposed = false, previous = 0, consolidated = false;
  const timeline = makeTimeline(onProgress, onDisperse);
  const ratio = Math.min(devicePixelRatio || 1, 1);
  const resize = () => { const rect = canvas.getBoundingClientRect(); canvas.width = Math.max(1, Math.round(rect.width * ratio)); canvas.height = Math.max(1, Math.round(rect.height * ratio)); };
  const dispose = () => { if (disposed) return; disposed = true; cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  resize(); window.addEventListener('resize', resize, { passive: true }); onReady();
  const start = performance.now();
  const tick = now => {
    if (disposed || signal.aborted) { dispose(); return; }
    if (now - previous < 33) { frame = requestAnimationFrame(tick); return; }
    previous = now;
    const { time: t, progress } = timeline((now - start) / 1000);
    if (t >= 2.9 && !consolidated) { consolidated = true; onConsolidate(); }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dark = document.documentElement.dataset.theme === 'dark';
    const aspect = canvas.width / canvas.height;
    for (let i = 0; i < data.length; i += 9) {
      const x = data[i], y = data[i + 1], seed = data[i + 5], angle = seed * Math.PI * 2;
      const flowSeed = data[i + 8];
      const chroma = Math.max(data[i + 2], data[i + 3], data[i + 4]) - Math.min(data[i + 2], data[i + 3], data[i + 4]);
      const delay = .1 + (1 - chroma) * .3 + flowSeed * .22;
      const arrival = progress >= 0 ? 0 : Math.max(0, Math.min(1, (t - delay) / 2.3));
      const smooth = arrival * arrival * (3 - 2 * arrival);
      const pulse = Math.sin(t * 5 + angle * 3) * .009 * Math.exp(-t * 2);
      const ringX = .5 + Math.cos(angle) * (.14 + pulse) / aspect;
      const ringY = .5 + Math.sin(angle) * (.14 + pulse);
      const bend = Math.sin(Math.PI * smooth) * (.035 + .035 * flowSeed);
      const turn = angle * .65 + flowSeed * Math.PI * 2;
      const px = ringX + (x - ringX) * smooth + Math.cos(turn + smooth * 1.8) * bend / aspect;
      const py = ringY + (y - ringY) * smooth + Math.sin(turn + smooth * 1.8) * bend;
      const clockwise = (seed + .25) % 1;
      const density = selections[i / 9] >= .90 ? 1 : .10;
      ctx.globalAlpha = progress >= 0 ? density * (clockwise <= progress ? 1 : .68) : density + (1 - density) * smooth;
      const index = i / 9;
      if (progress >= 0 || smooth === 0) ctx.fillStyle = dark ? initialColors[index] : lightInitialColors[index];
      else if (smooth >= 1) ctx.fillStyle = colors[index];
      else {
        const initial = initialChannels[index], target = targetChannels[index], factor = dark ? 1 : .66;
        ctx.fillStyle = `rgb(${initial.map((channel, j) => Math.round(channel * factor * (1 - smooth) + target[j] * smooth)).join(' ')})`;
      }
      const size = 3.6 + Math.max(0, (smooth - .8) / .2) * (canvas.width / 32 * 1.12 - 3.6);
      if (progress >= 0) ctx.fillRect(px * canvas.width - size / 2, py * canvas.height - size / 2, size, size);
      else { ctx.beginPath(); ctx.arc(px * canvas.width, py * canvas.height, size * (.4 + .1 * flowSeed), 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    if (t >= 4) { dispose(); onComplete(); return; }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return dispose;
}

// One elapsed-time timeline drives the counter, ring and existing particle motion.
function makeTimeline(onProgress, onDisperse) {
  let previousCount = 0, faded = false, dispersed = false;
  return elapsed => {
    elapsed = Math.max(0, elapsed);
    const count = Math.min(10, Math.floor(elapsed / .5) + 1);
    const fading = elapsed >= 5;
    if (count !== previousCount || fading !== faded) {
      previousCount = count; faded = fading; onProgress(count, fading);
    }
    if (elapsed >= 5.3 && !dispersed) { dispersed = true; onDisperse(); }
    return { time: Math.max(0, elapsed - 5.3), progress: elapsed < 5.3 ? Math.min(1, elapsed / 5) : -1 };
  };
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('shader unavailable');
  gl.shaderSource(shader, source); gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw new Error('shader compilation failed'); }
  return shader;
}

export async function mountParticleScene(canvas, hero, url, signal, onReady, onProgress, onDisperse, onConsolidate, onComplete) {
  const image = await loadImage(url, signal);
  if (signal.aborted) return () => {};
  const compact = matchMedia('(max-width: 640px)').matches;
  const data = makeSamples(image, hero, canvas, compact);
  if (compact) return mountCompactScene(canvas, data, signal, onReady, onProgress, onDisperse, onConsolidate, onComplete);
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power', depth: false, stencil: false });
  if (!gl) throw new Error('WebGL unavailable');
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const program = gl.createProgram();
  if (!program) throw new Error('program unavailable');
  gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('program linking failed');
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error('buffer unavailable');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  for (const [name, size, offset] of [['aPosition', 2, 0], ['aColor', 3, 8], ['aSeed', 1, 20], ['aRingPosition', 2, 24], ['aFlowSeed', 1, 32]]) {
    const index = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(index); gl.vertexAttribPointer(index, size, gl.FLOAT, false, 36, offset);
  }
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const time = gl.getUniformLocation(program, 'uTime');
  const progressUniform = gl.getUniformLocation(program, 'uProgress');
  const lightUniform = gl.getUniformLocation(program, 'uLight');
  const cellSize = gl.getUniformLocation(program, 'uCellSize');
  const aspect = gl.getUniformLocation(program, 'uAspect');
  const ratioUniform = gl.getUniformLocation(program, 'uPixelRatio');
  let frame = 0, disposed = false, consolidated = false;
  const timeline = makeTimeline(onProgress, onDisperse);
  const pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(aspect, canvas.width / canvas.height); gl.uniform1f(ratioUniform, pixelRatio);
    gl.uniform1f(cellSize, hero.getBoundingClientRect().width / 150 * pixelRatio);
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize); canvas.removeEventListener('webglcontextlost', onLost);
    gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment);
  };
  const onLost = event => { event.preventDefault(); dispose(); onDisperse(); onComplete(); };
  canvas.addEventListener('webglcontextlost', onLost);
  window.addEventListener('resize', resize, { passive: true });
  resize(); onReady();
  const start = performance.now();
  const tick = now => {
    if (disposed || signal.aborted) { dispose(); return; }
    const { time: elapsed, progress } = timeline((now - start) / 1000);
    if (elapsed >= 2.9 && !consolidated) { consolidated = true; onConsolidate(); }
    const backgroundAlpha = 0;
    const dark = document.documentElement.dataset.theme === 'dark';
    const background = dark ? [9 / 255, 9 / 255, 11 / 255] : [1, 1, 1];
    gl.clearColor(background[0] * backgroundAlpha, background[1] * backgroundAlpha, background[2] * backgroundAlpha, backgroundAlpha); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(time, elapsed); gl.uniform1f(progressUniform, progress); gl.uniform1f(lightUniform, dark ? 0 : 1); gl.drawArrays(gl.POINTS, 0, data.length / 9);
    if (elapsed >= 4) { dispose(); onComplete(); return; }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return dispose;
}
