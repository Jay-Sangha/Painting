// Circle brush — triangle fan approximation.

class Circle {
  constructor(x, y, r, g, b, a, size, segments) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.size = size;
    this.segments = Math.max(3, segments | 0);
  }

  render(gl, program, uniforms) {
    const n = this.segments;
    const verts = [];
    verts.push(this.x, this.y);
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * 2 * Math.PI;
      verts.push(
        this.x + this.size * Math.cos(a),
        this.y + this.size * Math.sin(a)
      );
    }
    const arr = new Float32Array(verts);
    if (!Circle.buffer) {
      Circle.buffer = gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, Circle.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(uniforms.a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(uniforms.a_Position);

    gl.uniform4f(uniforms.u_FragColor, this.r, this.g, this.b, this.a);
    gl.uniform1f(uniforms.u_PointSize, 1.0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n + 2);
  }
}
