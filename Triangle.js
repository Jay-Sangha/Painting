// Triangle brush — equilateral triangle centered at (x,y), optionally rotated.

class Triangle {
  constructor(x, y, r, g, b, a, size, angle) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.size = size;
    this.angle = angle || 0;
  }

  static verticesFor(x, y, size, angle) {
    const verts = [];
    for (let i = 0; i < 3; i++) {
      const a = angle + (i * 2 * Math.PI) / 3 - Math.PI / 2;
      verts.push(x + size * Math.cos(a), y + size * Math.sin(a));
    }
    return verts;
  }

  render(gl, program, uniforms) {
    const flat = Triangle.verticesFor(this.x, this.y, this.size, this.angle);
    const verts = new Float32Array(flat);
    if (!Triangle.buffer) {
      Triangle.buffer = gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, Triangle.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(uniforms.a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(uniforms.a_Position);

    gl.uniform4f(uniforms.u_FragColor, this.r, this.g, this.b, this.a);
    gl.uniform1f(uniforms.u_PointSize, 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

// Standalone helper from HelloTriangle — arbitrary triangle by three vertices.
function drawTriangle(gl, program, uniforms, x1, y1, x2, y2, x3, y3, r, g, b, a) {
  const verts = new Float32Array([x1, y1, x2, y2, x3, y3]);
  if (!drawTriangle.buffer) {
    drawTriangle.buffer = gl.createBuffer();
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, drawTriangle.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(uniforms.a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(uniforms.a_Position);
  gl.uniform4f(uniforms.u_FragColor, r, g, b, a);
  gl.uniform1f(uniforms.u_PointSize, 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
