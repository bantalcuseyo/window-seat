/* Readability audit — follows abagames/auditing-game-screen-readability:
   the renderer reports the rectangles and colours it draws (SURVEY), and this script runs the
   mechanical checks. No pixels, no eyeballing, so it runs headless in node.

   Checks: contrast of every null head against the wall, bench value below wall value,
   seat plane below the heads, heads not drifting into the train band, figures not overlapping. */
require("/tmp/domstub.cjs");
const fs = require("fs");
const src = fs.readFileSync("/home/ubuntu/window-seat/index.html", "utf8");
const js = src.split("<script>")[1].split("</script>")[0];
(0, eval)(js);
const W = window.__ws;
if (!W) { console.log("LOAD FAIL: no __ws"); process.exit(1); }

const rel = (hex) => {
  const c = hex.replace("#", "");
  const v = [0, 2, 4].map((i) => parseInt(c.substr(i, 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const contrast = (a, b) => {
  const [x, y] = [rel(a), rel(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

let findings = [];
const push = (el, check, detail) => findings.push({ el, check, detail });

let headChecks = 0, minContrast = 99;
for (let si = 0; si < W.LINE.length; si++) {
  const stop = W.LINE[si];
  const items = W.stripOf(stop).items;
  const scroll = Math.max(0, items[Math.floor(items.length / 2)].x - 260);
  W.drawScene(2.2, scroll, stop);
  const sv = W.SURVEY.slice();

  const wall = sv.find((e) => e.el === "wall");
  const seat = sv.find((e) => e.el === "bench.seat");
  const back = sv.find((e) => e.el === "bench.back");
  const heads = sv.filter((e) => e.el === "head");

  if (!wall) push(`stop ${si + 1}`, "wall-missing", "renderer reported no wall rect");
  if (!seat) push(`stop ${si + 1}`, "seat-missing", "renderer reported no seat plane");
  if (!back) push(`stop ${si + 1}`, "back-missing", "renderer reported no backrest");

  if (wall && back && rel(back.color) >= rel(wall.color))
    push(`stop ${si + 1}`, "bench-not-darker", `backrest L ${rel(back.color).toFixed(2)} >= wall L ${rel(wall.color).toFixed(2)}`);

  for (const h of heads) {
    headChecks++;
    if (wall) {
      const c = contrast(h.color, wall.color);
      minContrast = Math.min(minContrast, c);
      if (c < 4) push(`stop ${si + 1}`, "head-contrast", `${c.toFixed(1)}:1 vs wall (need >=4:1) for ${h.traits.top}`);
    }
    if (seat && h.y + h.h > seat.y + 4)
      push(`stop ${si + 1}`, "head-below-seat", `head bottom ${Math.round(h.y + h.h)} overlaps seat top ${seat.y}`);
    if (h.y < 360) push(`stop ${si + 1}`, "head-in-train-band", `head top ${Math.round(h.y)} above wall top 360`);
  }
  // horizontal overlap between neighbouring heads
  heads.sort((a, b) => a.x - b.x);
  for (let i = 1; i < heads.length; i++) {
    const gap = heads[i].x - (heads[i - 1].x + heads[i - 1].w);
    if (gap < 0) push(`stop ${si + 1}`, "heads-overlap", `${Math.round(-gap)}px overlap`);
  }
}

console.log(`stops audited: ${W.LINE.length} · heads checked: ${headChecks} · min contrast: ${minContrast.toFixed(1)}:1`);
if (findings.length === 0) {
  console.log("PASS — every mechanical check clean");
} else {
  console.log(`\n${findings.length} finding(s):`);
  const byCheck = {};
  findings.forEach((f) => { (byCheck[f.check] = byCheck[f.check] || []).push(f); });
  for (const k of Object.keys(byCheck)) {
    console.log(`  ${k} ×${byCheck[k].length}  e.g. ${byCheck[k][0].el}: ${byCheck[k][0].detail}`);
  }
  console.log("FAIL");
}
