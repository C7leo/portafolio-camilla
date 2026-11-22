export const vertexShader = `
  attribute vec2 aPosition;
  attribute vec3 aColor;
  attribute float aSeed;
  attribute vec2 aRingPosition;
  attribute float aFlowSeed;
  uniform float uTime;
  uniform float uProgress;
  uniform float uAspect;
  uniform float uPixelRatio;
  uniform float uLight;
  uniform float uCellSize;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vFill;
  void main() {
    float angle = aSeed * 6.2831853;
    float selection = fract(sin(dot(aRingPosition, vec2(127.1, 311.7))) * 43758.5453);
    float radialNoise = fract(sin(dot(aRingPosition, vec2(43.7, 79.9))) * 23145.783);
    float ringRadius = .136 + .008 * radialNoise;
    vec2 ring = vec2(.5 + cos(angle) * ringRadius / uAspect, .5 + sin(angle) * ringRadius);
    vec2 target = aPosition;
    float waveTime = max(0.0, uTime);
    float chroma = max(max(aColor.r, aColor.g), aColor.b) - min(min(aColor.r, aColor.g), aColor.b);
    float delay = .1 + (1.0 - chroma) * .3 + aFlowSeed * .22;
    float arrival = smoothstep(delay, 2.3 + delay, waveTime);
    float pulse = sin(waveTime * 5.0 + angle * 3.0) * .009 * exp(-waveTime * 2.0);
    vec2 disturbed = ring + vec2(cos(angle) / uAspect, sin(angle)) * pulse;
    float bend = sin(3.14159265 * arrival) * (.035 + .035 * aFlowSeed);
    float turn = angle * .65 + aFlowSeed * 6.2831853 + arrival * 1.8;
    vec2 position = mix(disturbed, target, arrival) + vec2(cos(turn) / uAspect, sin(turn)) * bend;
    gl_Position = vec4(position.x * 2.0 - 1.0, 1.0 - position.y * 2.0, 0.0, 1.0);
    vFill = smoothstep(.80, 1.0, arrival);
    gl_PointSize = mix(3.7 * uPixelRatio, uCellSize * mix(.85, 1.2, aFlowSeed), vFill);
    float hue = fract(sin(aSeed * 437.2 + 3.1) * 43758.5453) * 7.0;
    vec3 palette;
    if (hue < 1.0) palette = mix(vec3(.33,.63,1.0), vec3(.68,.84,1.0), hue);
    else if (hue < 2.0) palette = mix(vec3(.68,.84,1.0), vec3(.60,.68,1.0), hue - 1.0);
    else if (hue < 3.0) palette = mix(vec3(.60,.68,1.0), vec3(.80,.68,1.0), hue - 2.0);
    else if (hue < 4.0) palette = mix(vec3(.80,.68,1.0), vec3(1.0,.75,.85), hue - 3.0);
    else if (hue < 5.0) palette = mix(vec3(1.0,.75,.85), vec3(1.0,.41,.46), hue - 4.0);
    else if (hue < 6.0) palette = mix(vec3(1.0,.41,.46), vec3(1.0,.80,.71), hue - 5.0);
    else palette = mix(vec3(1.0,.80,.71), vec3(.95,.97,1.0), hue - 6.0);
    palette = mix(palette, palette * .66, uLight);
    vColor = mix(palette, aColor, arrival);
    float ringDensity = mix(.10, 1.0, step(.972, selection));
    float particleOpacity = mix(ringDensity, 1.0, arrival);
    vAlpha = particleOpacity;
    if (uProgress >= 0.0) {
      float clockwise = fract(aSeed + .25);
      float lit = 1.0 - smoothstep(uProgress - .008, uProgress + .008, clockwise);
      vAlpha = ringDensity * mix(.68, 1.0, lit);
      vColor = palette;
    }
  }
`;

export const fragmentShader = `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vFill;
  void main() {
    float d = length(gl_PointCoord - vec2(.5));
    float shape = 1.0 - smoothstep(.25, .5, d);
    gl_FragColor = vec4(vColor, vAlpha * shape);
  }
`;
