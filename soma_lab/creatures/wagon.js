"use strict";
// wagon: in soma's one form of a creature file (soma/creature_file.js): `body` is the creature as it was made, the rest is who it is to the others (family, nav, abilities) and its mind: the blocks of soma/world/blocks/ it loads by name and
// its tree. The old worker of this file is left out; the mind below is the default of a creature of its kind (vehicle): write the creature's own in `mind`.
// wagon: a little cart, 0.8 m long: a wooden bed with low sides, four wheels with spokes, a tongue with a ring. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature
// { name, skeleton, body, wheels, couplers }. Metres, +x to its left, +y up, +z forward, the wheels on y = 0 (a wheel is a bone whose HEAD is the hub). It has no engine and no legs: it is TOWED. Link it to anything that has
// a rear coupler (`sp.link(wagon, leader_species, leader)`): the ring goes to the leader's hitch point, the wagon faces the way to it and follows it round a bend, its wheels roll with the ground (they are PASSIVE: they turn
// with what moves the hub, whatever it is), and a wagon can pull a wagon (a chain of up to 32 links).
const bones = [
  { name: "root", head: [0, 0.24, -0.4], tail: [0, 0.26, 0.6] },                                  // (the bed and the tongue: it runs along the wagon)
  { name: "wheel_f_l", parent: "root", head: [0.3, 0.12, 0.2], tail: [0.3, 0.2, 0.2], mirror: "x" },
  { name: "wheel_b_l", parent: "root", head: [0.3, 0.12, -0.2], tail: [0.3, 0.2, -0.2], mirror: "x" },
];
// 3 m/s at most: a wagon that is pushed (a shove, a crate in the physics world) goes at no more than that; a towed wagon is moved by its hitch instead (its wish does nothing)
const body = { max_speed: 3, accel: 6, turn_rate: 4, gravity: 19.8, step: 0.1, radius: 0.45 };                // (step: the highest prop of the physics world its wheels climb onto, radius: how far short of a wall it stops)
// four PASSIVE wheels (front pair and back pair): they turn with the ground speed under their hubs (the radius is the hub's height), coast 1.5 s off the ground, and the bed leans fully (lean 1) to the plane through the wheels on a slope
const wheels = { wheels: [{ bone: "wheel_f_l" }, { bone: "wheel_f_r" }, { bone: "wheel_b_l" }, { bone: "wheel_b_r" }], coast: 1.5, lean: 1 };
// front = the tongue's ring (0, 0.2, 0.62): it is pulled from there; rear = a hook at the back (0, 0.22, -0.4) for another wagon
const couplers = { front: [0, 0.2, 0.62], rear: [0, 0.22, -0.4] };
// THE BODY (sdf): the parts stand on the creature's own bones by name. The bed, the frame, the axles, the tongue and the hitch are on `root`, a wheel on its own bone (its hub is the bone's head). A wheel is round about the axle,
// an iron band whose outer face is the hub's height (0.12 m: its lowest point is on the ground, so the roll the worker computes is the roll the eye sees), and one spoke is painted red: eight spokes alike would hide the spin.
// Everything is an ISLAND of its own (the wheels one each, the sides and the ends one each, the cargo, the hitch pieces) so that each has a small grid, a crisp colour and a skin weight of its bone alone; the gaps between the
// floor planks and between the boards of a side are real (a dark frame shows through the floor), which is what a cell of 3.5 mm buys.
const WOOD = [0.62, 0.43, 0.24, 1], WOOD2 = [0.50, 0.33, 0.18, 1], DARKW = [0.30, 0.20, 0.11, 1], IRON = [0.26, 0.27, 0.30, 1], RED = [0.72, 0.16, 0.12, 1], BURLAP = [0.74, 0.62, 0.42, 1], BRASS = [0.78, 0.62, 0.25, 1];
const parts = [];
const islands = {};
const on = function (isl, cell, ratio, error, max_edge) { islands[isl] = { cell: cell, decimate: { ratio: ratio, error: error, max_edge: max_edge } }; };
// the floor: six planks lengthwise with a gap between them, over a dark frame (two runners and four cross beams) that shows in the gaps; the axle beams and the iron axles under it
on("floor", 0.0055, 0.01, 0.0015, 0.045);
for (let k = 0; k < 6; k++) parts.push({ id: "plank_" + k, shape: "box", center: [-0.24375 + 0.03625 + k * 0.083, 0.22, -0.02], half: [0.03625, 0.012, 0.34], round: 0.006, bone: "root", island: "floor", color: k % 2 ? WOOD2 : WOOD });
on("frame", 0.0065, 0.02, 0.002, 0.06);
[0.15, -0.15].forEach(function (x, i) { parts.push({ id: "runner_" + i, shape: "box", center: [x, 0.186, -0.02], half: [0.024, 0.022, 0.34], round: 0.004, bone: "root", island: "frame", color: DARKW }); });
[-0.3, 0.27].forEach(function (z, i) { parts.push({ id: "cross_" + i, shape: "box", center: [0, 0.19, z], half: [0.23, 0.016, 0.022], round: 0.004, bone: "root", island: "frame", color: DARKW }); });
[0.2, -0.2].forEach(function (z, i) {
  parts.push({ id: "axle_beam_" + i, shape: "box", center: [0, 0.15, z], half: [0.2, 0.018, 0.026], round: 0.004, bone: "root", island: "frame", color: DARKW });
  parts.push({ id: "axle_" + i, shape: "cylinder", center: [0, 0.12, z], axis: "x", radius: 0.013, half: 0.285, bone: "root", island: "frame", color: IRON });
});
// the tongue (a pole that runs under the bed), two braces to the front axle beam, the iron ferrule and the ring at (0, 0.2, 0.62): the front coupler
on("tongue", 0.005, 0.02, 0.0012, 0.06);
parts.push({ id: "tongue", shape: "capsule", a: [0, 0.186, 0.1], b: [0, 0.2, 0.585], ra: 0.02, rb: 0.014, bone: "root", island: "tongue", color: DARKW });
[0.2, -0.2].forEach(function (x, i) { parts.push({ id: "brace_" + i, shape: "capsule", a: [x, 0.15, 0.2], b: [0.012 * (x > 0 ? 1 : -1), 0.198, 0.42], radius: 0.011, bone: "root", island: "tongue", color: DARKW }); });
on("ring", 0.0035, 0.1, 0.0005, 0.03);
parts.push({ id: "ferrule", shape: "cylinder", center: [0, 0.2, 0.58], axis: "z", radius: 0.019, half: 0.014, round: 0.004, bone: "root", island: "ring", color: IRON });
parts.push({ id: "ring", shape: "torus", center: [0, 0.2, 0.62], axis: "y", radius: 0.026, tube: 0.007, bone: "root", island: "ring", color: IRON });
// the sides (two boards each, a gap between), the ends (the same) and the four corner posts: each side is an island of its own
const board = function (isl, id, cx, cz, hx, hz, y, color) { parts.push({ id: id, shape: "box", center: [cx, y, cz], half: [hx, 0.019, hz], round: 0.009, bone: "root", island: isl, color: color }); };
[1, -1].forEach(function (s, i) {
  const isl = "side_" + i;
  on(isl, 0.0055, 0.02, 0.0012, 0.045);
  board(isl, "side_lo_" + i, 0.252 * s, -0.02, 0.012, 0.34, 0.2535, WOOD2);
  board(isl, "side_hi_" + i, 0.252 * s, -0.02, 0.012, 0.34, 0.3065, WOOD);
});
[["f", 0.332], ["b", -0.372]].forEach(function (e) {
  const isl = "end_" + e[0];
  on(isl, 0.0055, 0.02, 0.0012, 0.045);
  board(isl, "end_lo_" + e[0], 0, e[1], 0.264, 0.012, 0.2535, WOOD2);
  board(isl, "end_hi_" + e[0], 0, e[1], 0.264, 0.012, 0.3065, WOOD);
  [1, -1].forEach(function (s, i) { parts.push({ id: "post_" + e[0] + i, shape: "box", center: [0.258 * s, 0.255, e[1] + (e[0] === "f" ? -0.01 : 0.01)], half: [0.016, 0.077, 0.016], round: 0.008, bone: "root", island: isl, color: DARKW }); });
});
// the hook at the back, (0, 0.22, -0.4): a plate on the back board and a draw pin with a head, that the ring of another wagon goes round
on("hook", 0.0035, 0.1, 0.0005, 0.03);
parts.push({ id: "hook_plate", shape: "box", center: [0, 0.205, -0.402], half: [0.03, 0.01, 0.018], round: 0.004, bone: "root", island: "hook", color: IRON });
parts.push({ id: "hook_pin", shape: "cylinder", center: [0, 0.22, -0.4], axis: "y", radius: 0.0085, half: 0.04, bone: "root", island: "hook", color: IRON });
parts.push({ id: "hook_head", shape: "cylinder", center: [0, 0.262, -0.4], axis: "y", radius: 0.016, half: 0.005, round: 0.002, bone: "root", island: "hook", color: BRASS });
// the load: a barrel with iron hoops and a lid, a sack with a red tie
on("barrel", 0.004, 0.06, 0.0008, 0.04);
parts.push({ id: "barrel", shape: "cylinder", center: [-0.1, 0.309, 0.15], axis: "y", radius: 0.066, half: 0.077, round: 0.022, bone: "root", island: "barrel", color: WOOD2 });
parts.push({ id: "hoop_0", shape: "cylinder", center: [-0.1, 0.262, 0.15], axis: "y", radius: 0.0685, half: 0.006, bone: "root", island: "barrel", color: IRON });
parts.push({ id: "hoop_1", shape: "cylinder", center: [-0.1, 0.356, 0.15], axis: "y", radius: 0.0685, half: 0.006, bone: "root", island: "barrel", color: IRON });
parts.push({ id: "lid", shape: "cylinder", center: [-0.1, 0.384, 0.15], axis: "y", radius: 0.052, half: 0.004, round: 0.002, bone: "root", island: "barrel", color: WOOD });
on("sack", 0.005, 0.05, 0.001, 0.04);
parts.push({ id: "sack", shape: "ellipsoid", center: [0.07, 0.28, -0.2], radii: [0.095, 0.06, 0.12], bone: "root", island: "sack", color: BURLAP });
parts.push({ id: "neck", shape: "ellipsoid", center: [0.07, 0.325, -0.2], radii: [0.05, 0.05, 0.05], blend: 0.03, bone: "root", island: "sack", color: BURLAP });
parts.push({ id: "mouth", shape: "ellipsoid", center: [0.07, 0.372, -0.2], radii: [0.038, 0.028, 0.038], blend: 0.015, bone: "root", island: "sack", color: BURLAP });
parts.push({ id: "tie", shape: "torus", center: [0.07, 0.34, -0.2], axis: "y", radius: 0.047, tube: 0.009, bone: "root", island: "sack", color: RED });
// the four wheels, each an island (side: +1 the left bone, -1 the right one). An iron band (a torus: its outer radius is the hub's height), a wooden felloe a little wider than the band, eight spokes (one painted red), a wooden hub
// with an iron band each side and a brass cap on the end of the axle. (No `subtract` ring: a cut never changes the owner of a colour, and the disc that was cut would own the wood.)
const wheel = function (bone, side, zc, tag) {
  const R = 0.12, X = 0.3 * side, isl = "wheel_" + tag, C = [X, R, zc];
  on(isl, 0.0055, 0.05, 0.001, 0.03);
  const P = function (id, p) { p.id = id + "_" + tag; p.bone = bone; p.island = isl; parts.push(p); };
  P("felloe", { shape: "torus", center: C, axis: "x", radius: 0.084, tube: 0.019, color: WOOD2 });
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a);
    P("spoke_" + i, { shape: "capsule", a: [X, R + 0.03 * ca, zc + 0.03 * sa], b: [X, R + 0.088 * ca, zc + 0.088 * sa], ra: 0.0115, rb: 0.0085, color: i === 0 ? RED : WOOD });
  }
  P("band_a", { shape: "torus", center: [X + 0.008 * side, R, zc], axis: "x", radius: 0.111, tube: 0.009, blend: 0.005, color: IRON });
  P("band_b", { shape: "torus", center: [X - 0.008 * side, R, zc], axis: "x", radius: 0.111, tube: 0.009, blend: 0.005, color: IRON });
  P("hub", { shape: "cylinder", center: C, axis: "x", radius: 0.032, half: 0.034, round: 0.008, color: WOOD });
  P("hub_band_a", { shape: "cylinder", center: [X + 0.022 * side, R, zc], axis: "x", radius: 0.036, half: 0.005, color: IRON });
  P("hub_band_b", { shape: "cylinder", center: [X - 0.022 * side, R, zc], axis: "x", radius: 0.036, half: 0.005, color: IRON });
  P("cap", { shape: "cylinder", center: [X + 0.03 * side, R, zc], axis: "x", radius: 0.019, half: 0.012, round: 0.004, color: BRASS });
};
wheel("wheel_f_l", 1, 0.2, "f_l");
wheel("wheel_f_r", -1, 0.2, "f_r");
wheel("wheel_b_l", 1, -0.2, "b_l");
wheel("wheel_b_r", -1, -0.2, "b_r");
const sdf = { cell: 0.005, skin: { falloff: 4 }, shade: { ao: 0.25, ao_radius: 0.015, tone: 0.15, color_blend: 0.2 }, islands: islands, parts: parts };
// PHYSICS: the machine in the physics world (soma_phys.cpp, js/shapes.js): a FEW shapes in the bind pose's model space, one rigid body for every NEAR instance. A crate that is thrown at it moves it, it pushes what it drives into; a trailer that is hit gives a share of the push to what tows it.
const physics = { mass: 30, shapes: [{ id: "bed", shape: "box", center: [0, 0.27, -0.02], half: [0.26, 0.1, 0.38], bone: "root" }] };
return {
  name: "wagon", max: 16,
  family: { faction: "machine", kind: "vehicle", hp: 20 },
  nav: { agent: { name: "wagon", radius: 0.3, height: 0.36, step: 0.08, slope: 35, drop: 0.15 } },
  body: {
    skeleton: bones,
    body: body,
    wheels: wheels,
    couplers: couplers,
    physics: physics,
    sdf: sdf
  },
  abilities: ["walk", "effects"],
  interaction: { uses: [] },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 20 }],
      ["flee", { speed: 3, distance: 10, gait: "" }],
      ["walk", { speed: 2.4, run_speed: 3, wp_near: 1, near: 1.1, stuck_time: 5 }],
      ["wander", { speed: 2.4, pause_min: 2, pause_max: 6, near: 1.1 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "wagon", select: [ld.node("flee"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
