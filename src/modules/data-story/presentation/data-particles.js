const TAU = Math.PI * 2;
const random = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const clamp = value => Math.max(0, Math.min(1, value));

function samplePath(vertices, t) {
  const lengths = vertices.slice(1).map((v, i) => Math.hypot(v[0] - vertices[i][0], v[1] - vertices[i][1]));
  let distance = t * lengths.reduce((sum, length) => sum + length, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i] || i === lengths.length - 1) {
      const ratio = distance / lengths[i];
      return vertices[i].map((v, axis) => v + (vertices[i + 1][axis] - v) * ratio);
    }
    distance -= lengths[i];
  }
}

// Every target fits the same 12 × 8 drawing area; correspondence is deterministic.
export function createParticleShapes(count) {
  const shapes = Array.from({ length: 6 }, () => new Float32Array(count * 3));
  const cloud = [[-3.8,-1.8],[-4.7,-1.3],[-5,-.3],[-4.5,.7],[-3.5,1],[-3.2,2.1],[-2.2,2.8],[-.8,2.8],[.2,2.2],[1.3,2.5],[2.6,2.1],[3.1,1.1],[4.2,.9],[4.9,0],[4.6,-1.2],[3.7,-1.8],[-3.8,-1.8]];
  const cube = [[0,3.1],[3.5,1.4],[3.5,-1.5],[0,-3.1],[-3.5,-1.5],[-3.5,1.4],[0,3.1],[0,0],[3.5,1.4],[0,0],[-3.5,1.4],[0,0],[0,-3.1]];
  const shield = [[0,3.2],[3.2,2.1],[2.9,-.6],[2,-2.1],[0,-3.3],[-2,-2.1],[-2.9,-.6],[-3.2,2.1],[0,3.2]];
  const check = [[-1.7,-.1],[-.4,-1.4],[1.8,1.1]];
  const axes = [[-4.8,3],[-4.8,-2.8],[5,-2.8]];
  const trend = [[-4.2,-1.6],[-2.5,-.6],[-.7,-1.1],[1.2,.8],[3,1.3],[4.5,2.8]];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1), targets = [];
    targets[0] = i % 4 ? samplePath(cloud, t) : [(random(i) - .5) * 7.4, (random(i + 3) - .5) * 2.3];
    const ring = i % 5;
    targets[1] = ring < 3
      ? [3.2 * Math.cos(t * TAU * 9), [2.25,0,-2.25][ring] + .85 * Math.sin(t * TAU * 9)]
      : [ring === 3 ? -3.2 : 3.2, -2.25 + 4.5 * t];
    targets[2] = samplePath(cube, t);
    targets[3] = i % 3 === 0 ? samplePath(check, t) : samplePath(shield, t);
    const bar = i % 4, heights = [1.4,2.6,3.9,5.5], barX = -3.5 + bar * 2.15;
    targets[4] = i % 9 === 0 ? samplePath(axes, t)
      : [barX + (random(i + 5) - .5) * 1.1, -2.65 + heights[bar] * t];
    targets[5] = i % 5 === 0 ? samplePath(axes, t) : samplePath(trend, t);
    for (let stage = 0; stage < shapes.length; stage++) {
      const thickness = stage === 4 ? .012 : .055;
      shapes[stage][i * 3] = targets[stage][0] + (random(i + 11) - .5) * thickness;
      shapes[stage][i * 3 + 1] = targets[stage][1] + (random(i + 29) - .5) * thickness;
      shapes[stage][i * 3 + 2] = 0;
    }
  }
  return shapes;
}

export function particleStage(progress) {
  const position = clamp(progress) * 5;
  const from = Math.min(5, Math.floor(position)), to = Math.min(5, from + 1);
  // Hold each figure before morphing into the next one.
  const fraction = clamp((position - from - .22) / .56);
  return { from, to, mix: fraction * fraction * (3 - 2 * fraction), active: Math.round(position) };
}

export function interpolateParticles(shapes, output, progress) {
  const { from, to, mix } = particleStage(progress);
  for (let i = 0; i < output.length; i++) output[i] = shapes[from][i] + (shapes[to][i] - shapes[from][i]) * mix;
}

// SVG uses the same targets when WebGL is unavailable or loses its context.
export function createParticleFallback(container) {
  const count = 520, shapes = createParticleShapes(count), positions = new Float32Array(count * 3);
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('viewBox', '-6 -4 12 8');svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');svg.setAttribute('aria-hidden', 'true');
  const group = document.createElementNS(namespace, 'g');group.setAttribute('transform', 'scale(1 -1)');
  const dots = Array.from({ length:count }, (_, i) => {
    const dot = document.createElementNS(namespace, 'circle');dot.setAttribute('r', i % 7 === 0 ? '.047' : '.033');dot.setAttribute('fill', i % 7 === 0 ? '#5530ed' : '#171915');
    group.appendChild(dot);return dot;
  });
  svg.appendChild(group);container.replaceChildren(svg);
  return { update(progress) {
    interpolateParticles(shapes, positions, progress);
    dots.forEach((dot,i) => {dot.setAttribute('cx', positions[i*3].toFixed(3));dot.setAttribute('cy', positions[i*3+1].toFixed(3));});
  } };
}
