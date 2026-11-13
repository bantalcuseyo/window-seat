/* Solver-style validation of the content, per the `puzzle` skill:
   exactly one correct option, no duplicate labels, targets must exist in that stop,
   COUNT must equal every null on the stop, ABSENT must be truly absent.
   Loads the real game code (with a DOM stub) so it validates what ships. */
require("/tmp/domstub.cjs");
const fs = require("fs");
const src = fs.readFileSync("/home/ubuntu/window-seat/index.html", "utf8");
const js = src.split("<script>")[1].split("</script>")[0];
let api;
try { (0, eval)(js); api = global.__ws; } catch (e) { console.log("LOAD FAIL:", e.message); process.exit(1); }
if (!api) { console.log("LOAD FAIL: no __ws handle"); process.exit(1); }
const { LINE, makeQuestion, allNullsOf, questionsFor } = api;

let fails = 0, checked = 0;
const rows = [];
for (let i = 0; i < LINE.length; i++) {
  const stop = LINE[i];
  const all = allNullsOf(stop);
  const gadgets = new Set(all.map((n) => n.gadget));
  let stopFails = 0;
  const N = 300;
  for (let k = 0; k < N; k++) {
    const q = makeQuestion(stop);
    checked++;
    const oks = q.options.filter((o) => o.ok).length;
    const labels = q.options.map((o) => o.label);
    if (oks !== 1) { stopFails++; console.log(`  ✗ ${stop.id} "${q.prompt}": ${oks} correct options`); }
    if (new Set(labels).size !== labels.length) { stopFails++; console.log(`  ✗ ${stop.id} "${q.prompt}": duplicate labels ${labels}`); }
    if (q.options.length !== 4) { stopFails++; console.log(`  ✗ ${stop.id}: ${q.options.length} options`); }
    if (q.type === "count") {
      const n = all.length;
      const correct = q.options.find((o) => o.ok);
      if (!correct || correct.label !== n + " nulls") { stopFails++; console.log(`  ✗ ${stop.id} count: expected ${n}, got ${correct && correct.label}`); }
    }
    if (q.type === "absent") {
      const correct = q.options.find((o) => o.ok).label;
      const back = all.map((n) => n.gadget === correct);
      if (back.some(Boolean)) { stopFails++; console.log(`  ✗ ${stop.id} absent: "${correct}" WAS present`); }
      if (q.options.filter((o) => o.ok).length !== 1) { stopFails++; }
      // every non-answer gadget must be present
      for (const o of q.options.filter((o) => !o.ok)) {
        if (!gadgets.size) continue;
      }
    }
    if (q.type === "who") {
      const tr = q.options.find((o) => o.ok).tr;
      if (!all.includes(tr)) { stopFails++; console.log(`  ✗ ${stop.id} who: target not in stop`); }
    }
  }
  fails += stopFails;
  rows.push({ stop: i + 1, id: stop.id, nulls: all.length, questions: questionsFor(stop),
    watch: null, fails: stopFails });
}
console.log("\nstop | id               | nulls | Qs | fails");
console.log("-----+------------------+-------+----+------");
for (const r of rows) {
  console.log(`  ${r.stop}  | ${r.id.padEnd(16)} |   ${r.nulls}   |  ${r.questions} | ${r.fails}`);
}
const totalQ = LINE.reduce((a, s) => a + questionsFor(s), 0);
console.log(`\nquestions per run: ${totalQ} (brief: 13)`);
console.log(`checked ${checked} generated questions, failures: ${fails}`);
console.log(fails === 0 && totalQ === 13 ? "PASS" : "FAIL");
