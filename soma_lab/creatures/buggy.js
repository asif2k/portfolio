"use strict";
// buggy: a dune buggy for two, a roll cage and NO doors: its riders climb in over the side. In soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// buggy: 3.3 m long, 1.8 m wide, 1.7 m high. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, family, nav, body, abilities, interaction, mind }.
// Metres, +x to its left, +y up, +z forward, the wheels on y = 0 (a wheel is a bone whose HEAD is the hub). A VEHICLE of the car model: the front wheels steer, the big rear ones drive; 16 m/s.
// SEATS (soma/js/seat_api.js, SOMA.md "Seats and doors"): two seats, no door: a seat with none has a `board` place beside it where a rider stands to get on (soma.enter walks there and sits, soma.leave gets up at once).
const ZF = 1.05, ZR = -1.0, RF = 0.36, RR = 0.44;
const bones = [
  { name: "root", head: [0, 0.4, -1.6], tail: [0, 0.4, 1.6] },
  { name: "wheel_f_l", parent: "root", head: [0.78, RF, ZF], tail: [0.78, RF + 0.1, ZF], mirror: "x" },
  { name: "wheel_r_l", parent: "root", head: [0.85, RR, ZR], tail: [0.85, RR + 0.1, ZR], mirror: "x" },
];
const rig = { joints: [], chains: [] };
const body = { max_speed: 16, accel: 6, turn_rate: 2.2, gravity: 19.8, step: 0.4, radius: 1.6 };                // (step: the highest prop of the physics world its wheels climb onto, radius: how far short of a wall it stops)
const vehicle = { model: "car", wheels: [{ bone: "wheel_f_l" }, { bone: "wheel_f_r" }, { bone: "wheel_r_l" }, { bone: "wheel_r_r" }], top_speed: 16, grip: 8, max_steer: 0.55, steer_rate: 5, steer_speed: 14, travel: 0.1, follow: 12, lean: 1 };
const couplers = { rear: [0, 0.6, -1.85], front: [0, 0.6, 1.8] };
// THE SEATS: the hips (0.14 over the cushion), the two ankles on the pedals, the driver's two hands on the wheel (at ten and two), and the place beside the seat where a rider stands to get on
const seats = {
  driver: { at: [0.36, 0.66, -0.15], yaw: 0, feet: { left: [0.46, 0.44, 0.38], right: [0.26, 0.44, 0.42] }, hands: { left: [0.51, 1.02, 0.34], right: [0.21, 1.02, 0.34] }, board: [1.05, 0, -0.15] },
  passenger: { at: [-0.36, 0.66, -0.15], yaw: 0, feet: { left: [-0.26, 0.44, 0.4], right: [-0.46, 0.44, 0.4] }, board: [-1.05, 0, -0.15] },
};

// SDF (the mesher's grammar: soma/SOMA_MESHER.md; a part stands on a bone of the skeleton above by name, a `mirror: "x"` part of a `_l` bone writes the `_r` twin too, and a part of `root` with `mirror: "x"` is mirrored on `root`).
// Islands: the body (default), the roll cage (a tube frame), the seats, the steering wheel, the trim and the wheels. Floor top 0.4, cushion 0.52, the cage's roof tubes at 1.62: a seated person's head is under it.
const ORANGE = [0.95, 0.52, 0.06, 1], ORANGE_D = [0.74, 0.38, 0.04, 1], DARK = [0.11, 0.115, 0.125, 1], BLACK = [0.035, 0.035, 0.04, 1], STEEL = [0.66, 0.68, 0.72, 1], RUBBER = [0.04, 0.04, 0.045, 1], SEAT = [0.12, 0.12, 0.14, 1], LAMP = [0.95, 0.9, 0.7, 1], RED = [0.78, 0.07, 0.05, 1], WHITE = [0.92, 0.92, 0.9, 1], MAT = [0.18, 0.18, 0.17, 1];
const parts = [
  // THE BODY: the chassis rails, the floor, the nose, the dash, the engine at the back, the skid plate, the bumpers
  { id: "rail", shape: "box", center: [0.45, 0.34, 0], half: [0.06, 0.07, 1.55], round: 0.025, bone: "root", mirror: "x", color: DARK },
  { id: "cross_f", shape: "box", center: [0, 0.36, ZF], half: [0.78, 0.05, 0.06], round: 0.02, bone: "root", color: DARK },
  { id: "cross_r", shape: "box", center: [0, 0.4, ZR], half: [0.85, 0.05, 0.06], round: 0.02, bone: "root", color: DARK },
  { id: "floor", shape: "box", center: [0, 0.4, -0.05], half: [0.62, 0.025, 0.85], round: 0.01, bone: "root", color: MAT },
  { id: "nose", shape: "box", center: [0, 0.68, 1.3], half: [0.55, 0.2, 0.42], round: 0.12, bone: "root", blend: 0.03, color: ORANGE },
  { id: "dash", shape: "box", center: [0, 0.8, 0.62], half: [0.55, 0.13, 0.12], round: 0.05, bone: "root", blend: 0.03, color: ORANGE_D },
  { id: "dash_top", shape: "box", center: [0, 0.94, 0.62], half: [0.48, 0.02, 0.09], round: 0.01, bone: "root", island: "trim", color: BLACK },
  { id: "engine", shape: "box", center: [0, 0.72, -1.22], half: [0.5, 0.3, 0.3], round: 0.1, bone: "root", blend: 0.03, color: ORANGE },
  { id: "exhaust", shape: "capsule", a: [0.2, 0.62, -1.5], b: [0.2, 0.62, -1.9], radius: 0.05, bone: "root", island: "trim", color: STEEL },
  { id: "bumper_f", shape: "box", center: [0, 0.5, 1.78], half: [0.6, 0.05, 0.04], round: 0.02, bone: "root", island: "trim", color: DARK },
  { id: "head_lamp", shape: "sphere", center: [0.34, 0.74, 1.7], radius: 0.09, bone: "root", mirror: "x", island: "trim", color: LAMP },
  { id: "tail_lamp", shape: "box", center: [0.4, 0.8, -1.52], half: [0.07, 0.05, 0.02], round: 0.01, bone: "root", mirror: "x", island: "trim", color: RED },
  { id: "side_pod", shape: "box", center: [0.58, 0.5, -0.1], half: [0.06, 0.07, 0.7], round: 0.03, bone: "root", mirror: "x", color: ORANGE_D },
  // THE ROLL CAGE (an island): the front hoop (two posts and a bar), the rear hoop, the roof tubes between them, the braces; a tube is a loft of one radius
  { id: "post_f", shape: "loft", points: [[0.6, 0.45, 0.58], [0.58, 1.62, 0.34]], radii: [0.03, 0.03], radii_v: [0.03, 0.03], square: 0.85, bone: "root", island: "cage", mirror: "x", color: STEEL },
  { id: "post_r", shape: "loft", points: [[0.6, 0.45, -0.62], [0.58, 1.62, -0.66]], radii: [0.03, 0.03], radii_v: [0.03, 0.03], square: 0.85, bone: "root", island: "cage", mirror: "x", color: STEEL },
  { id: "roof_tube", shape: "loft", points: [[0.58, 1.62, 0.34], [0.58, 1.62, -0.66]], radii: [0.03, 0.03], radii_v: [0.03, 0.03], square: 0.85, bone: "root", island: "cage", mirror: "x", color: STEEL },
  { id: "bar_f", shape: "box", center: [0, 1.62, 0.34], half: [0.58, 0.03, 0.03], bone: "root", island: "cage", color: STEEL },
  { id: "bar_r", shape: "box", center: [0, 1.62, -0.66], half: [0.58, 0.03, 0.03], bone: "root", island: "cage", color: STEEL },
  { id: "side_bar", shape: "loft", points: [[0.6, 0.95, 0.5], [0.6, 0.95, -0.62]], radii: [0.025, 0.025], radii_v: [0.025, 0.025], square: 0.85, bone: "root", island: "cage", mirror: "x", color: STEEL },
  { id: "brace", shape: "loft", points: [[0.58, 1.62, -0.66], [0.5, 0.78, -1.3]], radii: [0.025, 0.025], radii_v: [0.025, 0.025], square: 0.85, bone: "root", island: "cage", mirror: "x", color: STEEL },
  { id: "front_brace", shape: "loft", points: [[0.6, 0.95, 0.54], [0.5, 0.72, 1.4]], radii: [0.025, 0.025], radii_v: [0.025, 0.025], square: 0.85, bone: "root", island: "cage", mirror: "x", color: STEEL },
  // THE SEATS (an island): a bucket seat each, a base, a cushion (its top is 0.52 over the ground) and a back
  { id: "seat_base", shape: "box", center: [0.36, 0.44, -0.15], half: [0.2, 0.04, 0.22], bone: "root", island: "seats", mirror: "x", color: DARK },
  { id: "seat_cushion", shape: "box", center: [0.36, 0.48, -0.15], half: [0.22, 0.05, 0.25], round: 0.04, bone: "root", island: "seats", mirror: "x", color: SEAT },
  { id: "seat_back", shape: "loft", points: [[0.36, 0.54, -0.36], [0.36, 1.08, -0.46]], radii: [0.22, 0.2], radii_v: [0.06, 0.05], square: 0.7, bone: "root", island: "seats", mirror: "x", color: SEAT },
  // THE STEERING WHEEL (an island): the column, the ring tilted toward the driver, the hub, a spoke
  { id: "column", shape: "capsule", a: [0.36, 0.84, 0.58], b: [0.36, 0.96, 0.32], radius: 0.028, bone: "root", island: "steer", color: DARK },
  { id: "steer_ring", shape: "torus", center: [0.36, 0.96, 0.3], axis: [0, 0.55, -0.83], radius: 0.17, tube: 0.021, bone: "root", island: "steer", color: BLACK },
  { id: "steer_hub", shape: "sphere", center: [0.36, 0.96, 0.3], radius: 0.038, bone: "root", island: "steer", color: DARK },
  { id: "steer_spoke", shape: "capsule", a: [0.19, 0.96, 0.3], b: [0.53, 0.96, 0.3], radius: 0.013, bone: "root", island: "steer", color: DARK },
];
// the wheels, one island a pair: a front pair and a bigger rear pair; the tyre, the rim disc, a boss, five lug nuts and a white dot on the sidewall; centred on the hub (the bone's head), round about the axle; written for the LEFT wheel and mirrored
[["f", 0.78, ZF, RF, 0.1], ["r", 0.85, ZR, RR, 0.15]].forEach(function (w) {
  const k = w[0], x = w[1], z = w[2], r = w[3], hw = w[4], b = "wheel_" + k + "_l", isl = "wheels_" + k, face = x + hw, rim = r * 0.6;
  parts.push(
    { id: "tyre_" + k, shape: "cylinder", center: [x, r, z], axis: "x", radius: r, half: hw, round: hw * 0.55, bone: b, island: isl, mirror: "x", color: RUBBER },
    { id: "rim_" + k, shape: "cylinder", center: [x, r, z], axis: "x", radius: rim, half: hw + 0.012, round: 0.012, bone: b, island: isl, mirror: "x", color: STEEL },
    { id: "boss_" + k, shape: "cylinder", center: [x, r, z], axis: "x", radius: r * 0.3, half: hw + 0.03, round: 0.012, bone: b, island: isl, mirror: "x", color: DARK },
    { id: "dot_" + k, shape: "cylinder", center: [x, r + r * 0.86, z], axis: "x", radius: r * 0.07, half: hw + 0.006, bone: b, island: isl, mirror: "x", color: WHITE });
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2 + 0.3;
    parts.push({ id: "nut_" + k + i, shape: "sphere", center: [face + 0.03, r + Math.cos(a) * r * 0.2, z + Math.sin(a) * r * 0.2], radius: 0.022, bone: b, island: isl, mirror: "x", color: STEEL });
  }
});
const sdf = {
  cell: 0.03, skin: { falloff: 4 }, shade: { ao: 0.3, ao_radius: 0.08, tone: 0.2, color_blend: 0 }, decimate: { ratio: 0.1, error: 0.01, max_edge: 0.8 },
  islands: {
    cage: { cell: 0.012, decimate: { ratio: 0.08, error: 0.008, max_edge: 1.2 } },
    trim: { cell: 0.012, decimate: { ratio: 0.05, error: 0.006, max_edge: 0.5 } },
    seats: { cell: 0.016, decimate: { ratio: 0.1, error: 0.006, max_edge: 0.5 } },
    steer: { cell: 0.012, decimate: { ratio: 0.1, error: 0.005, max_edge: 0.2 } },
    wheels_f: { cell: 0.015, decimate: { ratio: 0.05, error: 0.006, max_edge: 0.3 } },
    wheels_r: { cell: 0.016, decimate: { ratio: 0.05, error: 0.006, max_edge: 0.3 } },
  },
  parts: parts,
};
// PHYSICS: the machine in the physics world (soma_phys.cpp, js/shapes.js): a FEW shapes in the bind pose's model space, one rigid body for every NEAR instance.
const physics = { mass: 600, shapes: [{ id: "body", shape: "box", center: [0, 0.8, -0.05], half: [0.9, 0.45, 1.7], bone: "root" }] };
return {
  name: "buggy", max: 16,
  family: { faction: "machine", kind: "vehicle", hp: 100 },
  nav: { agent: {"name":"buggy","radius":1.7,"height":1.7,"step":0.4,"slope":30,"drop":0.4} },
  body: {
    skeleton: bones,
    rig: rig,
    body: body,
    vehicle: vehicle,
    couplers: couplers,
    seats: seats,
    physics: physics,
    sdf: sdf
  },
  abilities: ["walk", "effects"],
  interaction: { uses: [] },
  // PARTICLES (soma/js/fx.js): the exhaust pipe at the back smokes while it drives, the big rear wheels throw dust up behind them (both on the root: a wheel's own bone spins, a mount on it would circle the hub)
  particles: {
    exhaust: { effect: "exhaust_smoke", mount: { bone: "root", at: [0.2, 0.22, -0.32], dir: [0, 0.4, -1] }, loop: { while: "speed", from: 0.3, to: 9 }, scale: 0.55 },
    dust_l: { effect: "wheel_dust", mount: { bone: "root", at: [0.85, -0.28, 0.3], dir: [0, 1, -0.6] }, loop: { while: "speed", from: 2.5, to: 10 }, scale: 1.1 },
    dust_r: { effect: "wheel_dust", mount: { bone: "root", at: [-0.85, -0.28, 0.3], dir: [0, 1, -0.6] }, loop: { while: "speed", from: 2.5, to: 10 }, scale: 1.1 }
  },
  mind: {
    hz: 10, far_hz: 3,
    blocks: [
      ["health", { hp: 100 }],
      ["walk", { speed: 5, run_speed: 9, wp_near: 2, near: 2.4, stuck_time: 5 }],
      ["avoid", { radius: 1.1, length: 3.6, margin: 0.8, neighbours: 5, look: 2.5, brake: 5.0, other: 0.4, edge: 3, creep: 0.8, stop_gap: 0.8, push: 1.6, slow: 0.2, max_bend: 1, turn: 2.5, relax: 1.2, settle: 4, probe: 4, bodies: 8, boxed_wait: 6, ghost: 0, wait: 0.1, commit: 2, give_up: 8 }],
      ["drive", { top: 16, grip: 8, wheelbase: 2.05, max_steer: 0.55, steer_speed: 14 }],
      ["wander", { speed: 5, pause_min: 2, pause_max: 7, near: 2.4 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "buggy", select: [ld.node("wander")] };
      return { tree: tree };
    }
  }
};
