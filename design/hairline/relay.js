/**
 * Relay: a phone controller lying beside a laptop. The pad under the pointer
 * presses down, a pulse rides the dashed arc to the laptop's screen, and the
 * little player on it answers: the stick steps it, A makes it jump, B dashes.
 * The slider is how high the jump goes, in world units on the screen.
 */
const {
  Cam, circ, clamp, facing, fillet, fit, open, poly, proj, prism, rad, ringAt, rings, rrect, seg, unproj,
  tdone, tset, tval, tween, disposer, mk, place, pointer, put, register, solid,
} = HL;

// phone (landscape, lying flat) and its three pads: stick, A, B
const PH = [0, 0, 70, 36], PZ = 4, PADZ = 7;
const PADS = [
  { u: 17, v: 18, r: 8.5, name: "move" },
  { u: 52, v: 25, r: 5, name: "jump" },
  { u: 58, v: 11, r: 5, name: "dash" },
];
// laptop: base plate, and a screen standing on its far edge, tipped back 12°
const LB = [96, -46, 172, 2], LZ = 3, SX0 = 100, SX1 = 168, SY = -45, SH = 50, TIP = 12;
const EMIT = [68, 18, PZ], AIM = [126, SY, 30];

const shift = (ring, cu, cv) => ring.map((q) => ({ ...q, u: q.u + cu, v: q.v + cv }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let jumpH = value;

  const C = Cam(45, 0.5, 1.85);
  fit(C, [[0, 0, 0], [70, 36, 0], [0, 36, 0], [LB[0], LB[1], 0], [LB[2], LB[1], SH + 6], [LB[2], LB[3], 0], [100, -40, 60]], 200, 170);
  const P = proj(C), front = facing(C);

  // a point on the screen's plane: u along the screen, v up it
  const s = Math.sin(rad(TIP)), c = Math.cos(rad(TIP));
  const onScreen = (u, v, off = 0) => P(u, SY - v * s + off, LZ + v * c);

  const g = mk("g", {}, svg);

  // laptop screen first (it is the farthest thing), then the base under it
  const scr = fillet([[SX0, 0], [SX1, 0], [SX1, SH], [SX0, SH]], [2, 2, 4, 4]);
  mk("path", { d: poly(scr.map(([u, v]) => onScreen(u, v, -1.6))), class: "lo" }, g);
  mk("path", { d: poly(scr.map(([u, v]) => onScreen(u, v))), class: "sil" }, g);
  const bez = fillet([[SX0 + 4, 5], [SX1 - 4, 5], [SX1 - 4, SH - 4], [SX0 + 4, SH - 4]], [1.5, 1.5, 1.5, 1.5]);
  mk("path", { d: poly(bez.map(([u, v]) => onScreen(u, v, 0.2))), class: "nf lo" }, g);
  // the game on the screen: a floor with one step, and the player
  mk("path", { d: open([onScreen(SX0 + 8, 13, 0.3), onScreen(140, 13, 0.3), onScreen(140, 19, 0.3), onScreen(SX1 - 8, 19, 0.3)]), class: "nf lo" }, g);
  const player = mk("path", { class: "nf" }, g);
  const eye = mk("circle", { r: 0.9, class: "dot m" }, g);

  const [bRing, bInner] = rings(LB[0], LB[1], LB[2], LB[3], 5, 1.4);
  put(solid(g), prism(P, front, bRing, bInner, 0, LZ));
  mk("path", { d: poly(ringAt(P, rrect(124, -14, 146, -2, 2.5, 4), LZ)), class: "nf lo" }, g);
  mk("path", { d: [0, 1, 2].map((k) => seg(P(104, -40 + k * 6, LZ), P(166, -40 + k * 6, LZ))).join(""), class: "nf lo" }, g);

  // the phone, and its pads, painted far to near
  const [pRing, pInner] = rings(PH[0], PH[1], PH[2], PH[3], 7, 1.6);
  put(solid(g), prism(P, front, pRing, pInner, 0, PZ));
  mk("path", { d: poly(ringAt(P, rrect(30, 4, 40, 32, 3, 4), PZ)), class: "nf lo" }, g);
  const pads = PADS.map((pd) => ({ ...pd, el: solid(g), z: tween(PADZ) })).sort((a, b) => a.u + a.v - (b.u + b.v));

  // the relay: a dashed arc from the phone's edge to the screen, and the pulse riding it
  const M = [(EMIT[0] + AIM[0]) / 2, (EMIT[1] + AIM[1]) / 2, 46];
  const arcAt = (t) => [0, 1, 2].map((k) => (1 - t) ** 2 * EMIT[k] + 2 * t * (1 - t) * M[k] + t * t * AIM[k]);
  mk("path", { d: open(Array.from({ length: 25 }, (_, i) => P(...arcAt(i / 24)))), class: "nf dash" }, g);
  const pulse = mk("circle", { r: 2, class: "dot off" }, g);

  const st = { p: tween(0), dx: tween(0), dy: tween(0) };
  let drawn = "";

  function drawPad(pd, z) {
    const ring = shift(circ(pd.r, 16), pd.u, pd.v), inner = shift(circ(pd.r - 1.2, 16), pd.u, pd.v);
    put(pd.el, prism(P, front, ring, inner, PZ, z));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const pd of pads) { drawPad(pd, tval(pd.z, now)); if (!tdone(pd.z, now)) moving = true; }
    const t = tval(st.p, now), dx = tval(st.dx, now), dy = tval(st.dy, now);
    const key = [t, dx, dy].map((n) => n.toFixed(2)).join();
    if (key !== drawn) {
      drawn = key;
      place(pulse, P(...arcAt(t)));
      const u0 = 112 + dx, v0 = 13 + clamp(dy, 0, 28);
      player.setAttribute("d", poly(fillet([[u0, v0], [u0 + 10, v0], [u0 + 10, v0 + 12], [u0, v0 + 12]], [1.2, 1.2, 2.5, 2.5]).map(([u, v]) => onScreen(u, v, 0.4))));
      place(eye, onScreen(u0 + 7, v0 + 8, 0.5));
    }
    if (!tdone(st.p, now) || !tdone(st.dx, now) || !tdone(st.dy, now)) moving = true;
    return moving;
  });
  bag.add(B.unregister);

  // hit test on the pads' REST tops (all at PADZ), never on where they are drawn
  function hit([x, y]) {
    const [wx, wy] = unproj(C, x, y, PADZ);
    let best = -1, bd = Infinity;
    pads.forEach((pd, i) => { const d = Math.hypot(wx - pd.u, wy - pd.v); if (d < pd.r + 4 && d < bd) { bd = d; best = i; } });
    return best;
  }

  let act = -1;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now();
    act = a;
    const name = a < 0 ? "rest" : pads[a].name;
    pads.forEach((pd, i) => {
      tset(pd.z, i === a ? PZ + 1 : PADZ, now, 0);
      pd.el.sil.classList.toggle("hi", a < 0 ? pd.name === "jump" : i === a);
    });
    // the pulse leaves at once; the player answers as it lands (stagger by distance along the arc)
    tset(st.p, a < 0 ? 0 : 1, now, 0);
    tset(st.dx, name === "move" ? 12 : name === "dash" ? 34 : 0, now, a < 0 ? 0 : 420);
    tset(st.dy, name === "jump" ? jumpH : 0, now, a < 0 ? 0 : 420);
    pulse.setAttribute("class", a < 0 ? "dot off" : "dot");
    read.textContent = name;
    B.wake();
  }

  setActive(-2);
  act = -1;
  pads.forEach((pd) => pd.el.sil.classList.toggle("hi", pd.name === "jump"));
  read.textContent = "rest";

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { jumpH = v; if (act >= 0 && pads[act].name === "jump") { tset(st.dy, v, performance.now(), 0); B.wake(); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "relay",
  means: "A phone pad pressed on the sofa sends a pulse to the laptop, and the player on screen moves, jumps or dashes.",
  rules: [1, 4, 8, 10],
  range: [12, 20, 28],
  tour: [[110, 205], [178, 196], [183, 172], null],
  mount,
});
