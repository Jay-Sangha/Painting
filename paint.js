// WebGL Paint — organized per assignment (setupWebGL, connectVariablesToGLSL, click, renderAllShapes)

const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_PointSize;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_PointSize;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`;

let canvas;
let gl;
let program;
let uniforms;

let shapesList = [];
let strokeSegments = [];
let pictureTriangles = null;

let brushType = 'point'; // 'point' | 'triangle' | 'circle'
let g_size = 10;
let g_segments = 20;
let g_red = 200;
let g_green = 80;
let g_blue = 60;
const g_alpha = 0.75;

let lastX = null;
let lastY = null;
let lastAngle = 0;

function main() {
  if (!setupWebGL()) {
    console.log('Failed to get WebGL context.');
    return;
  }
  if (!connectVariablesToGLSL()) {
    console.log('Failed to initialize shaders.');
    return;
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  setupUI();
  setupCanvasEvents();

  renderAllShapes();
}

function setupWebGL() {
  canvas = document.getElementById('glcanvas');
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) {
    gl = canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
  }
  return !!gl;
}

function connectVariablesToGLSL() {
  program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  if (!program) return false;

  gl.useProgram(program);
  uniforms = {
    a_Position: gl.getAttribLocation(program, 'a_Position'),
    u_FragColor: gl.getUniformLocation(program, 'u_FragColor'),
    u_PointSize: gl.getUniformLocation(program, 'u_PointSize')
  };
  return true;
}

function setupUI() {
  document.getElementById('btnPoint').onclick = () => setBrush('point');
  document.getElementById('btnTriangle').onclick = () => setBrush('triangle');
  document.getElementById('btnCircle').onclick = () => setBrush('circle');

  document.getElementById('btnClear').onclick = () => {
    shapesList = [];
    strokeSegments = [];
    pictureTriangles = null;
    lastX = null;
    lastY = null;
    renderAllShapes();
  };

  document.getElementById('btnPicture').onclick = () => {
    pictureTriangles = buildTrianglePicture();
    renderAllShapes();
  };

  bindSlider('sliderRed', 'valRed', (v) => { g_red = v; updateColorPreview(); });
  bindSlider('sliderGreen', 'valGreen', (v) => { g_green = v; updateColorPreview(); });
  bindSlider('sliderBlue', 'valBlue', (v) => { g_blue = v; updateColorPreview(); });
  bindSlider('sliderSize', 'valSize', (v) => { g_size = v; });
  bindSlider('sliderSegments', 'valSegments', (v) => { g_segments = v; });

  updateColorPreview();
}

function bindSlider(id, valId, onChange) {
  const el = document.getElementById(id);
  const valEl = document.getElementById(valId);
  const update = () => {
    const v = parseInt(el.value, 10);
    valEl.textContent = v;
    onChange(v);
  };
  el.oninput = update;
  update();
}

function updateColorPreview() {
  const prev = document.getElementById('colorPreview');
  prev.style.background = `rgba(${g_red},${g_green},${g_blue},${g_alpha})`;
}

function setBrush(type) {
  brushType = type;
  document.getElementById('btnPoint').classList.toggle('active', type === 'point');
  document.getElementById('btnTriangle').classList.toggle('active', type === 'triangle');
  document.getElementById('btnCircle').classList.toggle('active', type === 'circle');
}

function setupCanvasEvents() {
  canvas.onmousedown = (ev) => {
    if (ev.button !== 0) return;
    lastX = null;
    lastY = null;
    click(ev);
  };
  canvas.onmousemove = (ev) => {
    if (ev.buttons === 1) click(ev);
  };
  const endStroke = () => {
    lastX = null;
    lastY = null;
  };
  canvas.onmouseup = endStroke;
  canvas.onmouseleave = endStroke;
}

function convertCoords(ev) {
  const rect = canvas.getBoundingClientRect();
  const x = ((ev.clientX - rect.left) - canvas.width / 2) / (canvas.width / 2);
  const y = (canvas.height / 2 - (ev.clientY - rect.top)) / (canvas.height / 2);
  return [x, y];
}

function currentColor() {
  return {
    r: g_red / 255,
    g: g_green / 255,
    b: g_blue / 255,
    a: g_alpha
  };
}

function click(ev) {
  const [x, y] = convertCoords(ev);
  const c = currentColor();
  const size = g_size / canvas.height * 2;

  let angle = lastAngle;
  if (lastX !== null) {
    angle = Math.atan2(y - lastY, x - lastX);
    addStrokeSegment(lastX, lastY, x, y, c);
  }
  lastAngle = angle;

  const shape = makeShape(x, y, c, size, angle);
  shapesList.push(shape);

  lastX = x;
  lastY = y;

  renderAllShapes();
}

function makeShape(x, y, c, size, angle) {
  if (brushType === 'triangle') {
    return new Triangle(x, y, c.r, c.g, c.b, c.a, size, angle);
  }
  if (brushType === 'circle') {
    return new Circle(x, y, c.r, c.g, c.b, c.a, size, g_segments);
  }
  return new Point(x, y, c.r, c.g, c.b, c.a, size * 15);
}

function addStrokeSegment(x1, y1, x2, y2, c) {
  strokeSegments.push({ x1, y1, x2, y2, r: c.r, g: c.g, b: c.b, a: c.a * 0.6 });
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  for (let i = 0; i < strokeSegments.length; i++) {
    const s = strokeSegments[i];
    drawLine(gl, program, uniforms, s.x1, s.y1, s.x2, s.y2, s.r, s.g, s.b, s.a);
  }

  for (let i = 0; i < shapesList.length; i++) {
    shapesList[i].render(gl, program, uniforms);
  }

  if (pictureTriangles) {
    renderTrianglePicture(gl, program, uniforms, pictureTriangles);
  }
}

function drawLine(gl, program, uniforms, x1, y1, x2, y2, r, g, b, a) {
  const verts = new Float32Array([x1, y1, x2, y2]);
  if (!drawLine.buffer) drawLine.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, drawLine.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(uniforms.a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(uniforms.a_Position);
  gl.uniform4f(uniforms.u_FragColor, r, g, b, a);
  gl.uniform1f(uniforms.u_PointSize, 1.0);
  gl.drawArrays(gl.LINES, 0, 2);
}

// --- Shader utilities (Matsuda style) ---

function createProgram(gl, vsrc, fsrc) {
  const vs = loadShader(gl, gl.VERTEX_SHADER, vsrc);
  const fs = loadShader(gl, gl.FRAGMENT_SHADER, fsrc);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

window.onload = main;
