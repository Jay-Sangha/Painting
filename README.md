# WebGL Paint — Assignment 1

Interactive WebGL paint program with points, triangles, and circles. Includes a triangle-art recreation of a paper sketch and extra paint features.

## Run locally

Serve the folder with any static file server (WebGL needs HTTP, not `file://`):

```bash
python3 -m http.server 8080
```

Open http://localhost:8080/index.html

## Deploy on GitHub Pages

1. Push this repo to [Jay-Sangha/Painting](https://github.com/Jay-Sangha/Painting).
2. On GitHub: **Settings → Pages → Build and deployment → Source**: deploy from branch **main**, folder **/ (root)**.
3. After the workflow finishes, the site is at `https://jay-sangha.github.io/Painting/`

## Files

| File | Purpose |
|------|---------|
| `index.html` | Canvas, UI controls, sketch reference |
| `paint.js` | `setupWebGL`, `connectVariablesToGLSL`, `click`, `renderAllShapes` |
| `Point.js` | Point brush class |
| `Triangle.js` | Triangle brush + `drawTriangle()` helper |
| `Circle.js` | Circle brush (triangle fan) |
| `TrianglePicture.js` | 30+ triangle sunset scene with initials **JS** |
| `triDraw.jpg` | Paper sketch reference (from `~/Downloads/triDraw.HEIC`) |

## Requirements checklist

- Canvas click/drag painting
- Point, triangle, circle brushes
- RGB + size + circle segment sliders
- Clear button
- Organized functions and `shapesList` with shape classes
- Triangle picture button (20+ triangles, initials in drawing)
- **Awesomeness:** alpha blending, stroke-aligned triangles, `GL_LINES` gap fill
