// Point shape — draws a single GL point with per-shape color and size.

class Point {
  constructor(x, y, r, g, b, a, size) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.size = size;
  }

  render(gl, program, uniforms) {
    const verts = new Float32Array([this.x, this.y]);
    if (!Point.buffer) {
      Point.buffer = gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, Point.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(uniforms.a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(uniforms.a_Position);

    gl.uniform4f(uniforms.u_FragColor, this.r, this.g, this.b, this.a);
    gl.uniform1f(uniforms.u_PointSize, this.size);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}
