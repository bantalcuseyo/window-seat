/* Minimal DOM stub so the game's pure logic can be loaded and checked in node.
   Rule from the `puzzle` skill: the board/content model is the only truth — validate it
   with a solver-style check, don't eyeball it. */
const noop = () => {};
function ctxStub() {
  const grad = { addColorStop: noop };
  return new Proxy({
    canvas: { width: 960, height: 1200 },
    createLinearGradient: () => grad,
    createRadialGradient: () => grad,
    getImageData: () => ({ data: [0, 0, 0, 255] }),
    putImageData: noop,
    measureText: () => ({ width: 10 }),
    setTransform: noop, save: noop, restore: noop, translate: noop, scale: noop,
    rotate: noop, beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop,
    arc: noop, arcTo: noop, ellipse: noop, quadraticCurveTo: noop, rect: noop,
    fill: noop, stroke: noop, clip: noop, fillRect: noop, strokeRect: noop,
    clearRect: noop, drawImage: noop, fillText: noop, setLineDash: noop,
  }, { get: (t, k) => (k in t ? t[k] : (typeof t[k] === "undefined" ? noop : t[k])),
       set: (t, k, v) => { t[k] = v; return true; } });
}
function canvasStub() {
  return { width: 960, height: 1200, style: {}, getContext: () => ctxStub(),
           toDataURL: () => "data:image/png;base64,", addEventListener: noop,
           getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 1200 }) };
}
global.window = global;
global.document = {
  createElement: (t) => (t === "canvas" ? canvasStub() : { style: {}, appendChild: noop, addEventListener: noop }),
  getElementById: () => canvasStub(),
  addEventListener: noop, body: { appendChild: noop }, scripts: [],
};
global.matchMedia = () => ({ matches: false });
global.getComputedStyle = () => ({ paddingTop: '0px', paddingRight: '0px', paddingBottom: '0px', paddingLeft: '0px' });
global.location = { search: "" };
global.URLSearchParams = URLSearchParams;
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = noop;
global.localStorage = { getItem: () => null, setItem: noop };
global.innerWidth = 960; global.innerHeight = 1200;
global.devicePixelRatio = 1;
global.addEventListener = noop;
global.setInterval = noop;
global.AudioContext = function () {
  return { createGain: () => ({ gain: { value: 0 }, connect: () => ({ connect: noop }) }),
    createBuffer: () => ({ getChannelData: () => new Float32Array(8) }),
    createBufferSource: () => ({ connect: () => ({ connect: noop }), start: noop, buffer: null, loop: false }),
    createBiquadFilter: () => ({ connect: () => ({ connect: noop }), type: "", frequency: { value: 0 } }),
    createOscillator: () => ({ connect: () => ({ connect: noop }), start: noop, stop: noop,
      frequency: { setValueAtTime: noop }, type: "" }),
    currentTime: 0, sampleRate: 8000, destination: {}, state: "running" };
};
module.exports = {};
