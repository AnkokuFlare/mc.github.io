const config = {
  cellSize: 32,       /* Visual grid tracking block size */
  trailLength: 0.99,  /* Lower number = shorter trail, higher = longer trail */
  cellRadius: 25,     /* Default width of the glowing square pixels */
  lineWidth: 1.5,     /* Border path thickness */
  colorSpeed: 0.015   /* Shifting frequency of the iridescent gradient */
};

const canvas = document.getElementById('grid-trail-canvas');
const ctx = canvas.getContext('2d');

let grid = [];
let cols = 0;
let rows = 0;
let gradientPhase = 0;

function initGrid() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.ceil(canvas.width / config.cellSize);
  rows = Math.ceil(canvas.height / config.cellSize);

  grid = [];
  for (let c = 0; c < cols; c++) {
    grid[c] = [];
    for (let r = 0; r < rows; r++) {
      grid[c][r] = 0;
    }
  }
}

initGrid();
window.addEventListener('resize', initGrid);

window.addEventListener('mousemove', (e) => {
  const c = Math.floor(e.clientX / config.cellSize);
  const r = Math.floor(e.clientY / config.cellSize);

  if (c >= 0 && c < cols && r >= 0 && r < rows) {
    grid[c][r] = 1.0;
    // Add neighbor blending light values to smooth out sharp line tracks
    if (c + 1 < cols) grid[c + 1][r] = Math.max(grid[c + 1][r], 0.6);
    if (c - 1 >= 0)   grid[c - 1][r] = Math.max(grid[c - 1][r], 0.6);
    if (r + 1 < rows) grid[c][r + 1] = Math.max(grid[c][r + 1], 0.6);
    if (r - 1 >= 0)   grid[c][r - 1] = Math.max(grid[c][r - 1], 0.6);
  }
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  gradientPhase += config.colorSpeed;

  const r1 = Math.floor(Math.sin(gradientPhase) * 127 + 128);
  const g1 = Math.floor(Math.sin(gradientPhase + 2) * 127 + 128);
  const b1 = Math.floor(Math.sin(gradientPhase + 4) * 127 + 128);
  const r2 = Math.floor(Math.sin(gradientPhase + 3) * 127 + 128);
  const g2 = Math.floor(Math.sin(gradientPhase + 5) * 127 + 128);
  const b2 = Math.floor(Math.sin(gradientPhase + 1) * 127 + 128);

  const irid1 = `rgba(${r1}, ${g1}, ${b1}, `;
  const irid2 = `rgba(${r2}, ${g2}, ${b2}, `;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      let opacity = grid[c][r];

      if (opacity > 0.005) {
        const cellX = c * config.cellSize + config.cellSize / 2;
        const cellY = r * config.cellSize + config.cellSize / 2;
        const colorBias = (cellX / canvas.width + cellY / canvas.height) / 2;
        const chosenColor = colorBias > 0.5 ? irid1 : irid2;

        ctx.save();
        ctx.translate(cellX, cellY);

        const dynamicSize = config.cellRadius * (0.4 + opacity * 0.6);
        ctx.fillStyle = `${chosenColor}${opacity * 0.12})`;
        ctx.strokeStyle = `${chosenColor}${opacity})`;
        ctx.lineWidth = config.lineWidth;

        ctx.beginPath();
        ctx.rect(-dynamicSize / 2, -dynamicSize / 2, dynamicSize, dynamicSize);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        grid[c][r] *= config.trailLength;
      } else {
        grid[c][r] = 0;
      }
    }
  }
  requestAnimationFrame(draw);
}
draw();
