"use strict";
// sedan: a four door car for four, its windows open (no glass: the people in it are seen). In soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// sedan: 4.7 m long, 1.8 m wide, 1.7 m high. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, family, nav, body, abilities, interaction, mind }.
// Metres, +x to its left, +y up, +z forward, the wheels on y = 0 (a wheel is a bone whose HEAD is the hub). A VEHICLE of the car model: the front wheels steer, all four drive; 14 m/s.
// SEATS AND DOORS (soma/js/seat_api.js, SOMA.md "Seats and doors"): FOUR seats (the driver on the left in front, the passenger, the two in the rear) and FOUR doors, each hinged at its FRONT edge (the bone's head is the hinge, the bone runs back along the door).
// A rider stands behind the open door (the `at` of the door) and sits at once. A front seat's hips are 0.14 over its cushion; the rear passengers' feet are on the floor under the front seats, their hands in their laps (they have none to say).
const WR = 0.33, TRACK = 0.78, ZF = 1.35, ZR = -1.3;
const bones = [
  { name: "root", head: [0, 0.33, -2.2], tail: [0, 0.33, 2.2] },
  { name: "door_f_l", parent: "root", head: [0.88, 0.72, 0.78], tail: [0.88, 0.72, -0.22], mirror: "x" },
  { name: "door_r_l", parent: "root", head: [0.88, 0.72, -0.3], tail: [0.88, 0.72, -1.18], mirror: "x" },
  { name: "wheel_f_l", parent: "root", head: [TRACK, WR, ZF], tail: [TRACK, WR + 0.1, ZF], mirror: "x" },
  { name: "wheel_r_l", parent: "root", head: [TRACK, WR, ZR], tail: [TRACK, WR + 0.1, ZR], mirror: "x" },
];
const rig = {
  joints: [
    { bone: "door_f_l", kind: "hinge", axis: [0, 1, 0], range: [-100, 0] },                  // (the left doors swing out with a negative turn about up, the right ones with a positive)
    { bone: "door_r_l", kind: "hinge", axis: [0, 1, 0], range: [-100, 0] },
    { bone: "door_f_r", kind: "hinge", axis: [0, 1, 0], range: [0, 100] },
    { bone: "door_r_r", kind: "hinge", axis: [0, 1, 0], range: [0, 100] },
  ],
  chains: [],
};
const body = { max_speed: 14, accel: 4.5, turn_rate: 1.6, gravity: 19.8, step: 0.3, radius: 2.1 };                // (step: the highest prop of the physics world its wheels climb onto, radius: how far short of a wall it stops)
const vehicle = { model: "car", wheels: [{ bone: "wheel_f_l" }, { bone: "wheel_f_r" }, { bone: "wheel_r_l" }, { bone: "wheel_r_r" }], top_speed: 14, grip: 7, max_steer: 0.5, steer_rate: 4, steer_speed: 12, travel: 0.06, follow: 10, lean: 1 };
const couplers = { rear: [0, 0.6, -2.4], front: [0, 0.6, 2.4] };
// THE DOORS: the bone, how far it swings (radians), how fast, and where a rider stands outside to get in (behind the open door: its panel is in front of that place)
const doors = {
  front_left: { bone: "door_f_l", open: -1.0, speed: 3, at: [1.2, 0, -0.05] },
  front_right: { bone: "door_f_r", open: 1.0, speed: 3, at: [-1.2, 0, -0.05] },
  rear_left: { bone: "door_r_l", open: -1.0, speed: 3, at: [1.25, 0, -0.98] },
  rear_right: { bone: "door_r_r", open: 1.0, speed: 3, at: [-1.25, 0, -0.98] },
};
// THE SEATS: the hips (0.14 over the cushion), the two ankles, the two hands (the driver's on the wheel at ten and two), the door
const seats = {
  driver: { at: [0.42, 0.7, 0.2], yaw: 0, feet: { left: [0.52, 0.42, 0.72], right: [0.32, 0.42, 0.76] }, hands: { left: [0.576, 1.055, 0.71], right: [0.264, 1.055, 0.71] }, door: "front_left" },
  passenger: { at: [-0.42, 0.7, 0.2], yaw: 0, feet: { left: [-0.32, 0.42, 0.72], right: [-0.52, 0.42, 0.72] }, door: "front_right" },
  rear_left: { at: [0.42, 0.7, -0.85], yaw: 0, feet: { left: [0.52, 0.38, -0.3], right: [0.32, 0.38, -0.3] }, door: "rear_left" },
  rear_right: { at: [-0.42, 0.7, -0.85], yaw: 0, feet: { left: [-0.32, 0.38, -0.3], right: [-0.52, 0.38, -0.3] }, door: "rear_right" },
};

// SDF (the mesher's grammar: soma/SOMA_MESHER.md; a part stands on a bone of the skeleton above by name, a `mirror: "x"` part of a `_l` bone writes the `_r` twin too, and a part of `root` with `mirror: "x"` is mirrored on `root`).
// Islands: the body (default), the doors (they swing), the roof and its pillars (guard), the seats, the steering wheel, the trim, the fenders, the wheels (one island a pair). Floor top 0.35, cushions 0.56, roof 1.64: a seated person's head is under it.
const BLUE = [0.16, 0.23, 0.42, 1], BLUE_D = [0.11, 0.16, 0.30, 1], DARK = [0.11, 0.115, 0.125, 1], BLACK = [0.035, 0.035, 0.04, 1], STEEL = [0.66, 0.68, 0.72, 1], RUBBER = [0.04, 0.04, 0.045, 1], SEAT = [0.55, 0.52, 0.46, 1], LAMP = [0.95, 0.9, 0.7, 1], RED = [0.78, 0.07, 0.05, 1], WHITE = [0.92, 0.92, 0.9, 1], MAT = [0.2, 0.2, 0.19, 1];
const parts = [
  // THE BODY (root, the default island): the frame, the floor, the firewall, the dash, the hood, the grille, the trunk, the rear, the sills and the quarter panels (the doors are between them)
  { id: "frame", shape: "box", center: [0, 0.28, 0], half: [0.55, 0.07, 2.0], round: 0.03, bone: "root", color: DARK },
  { id: "floor", shape: "box", center: [0, 0.32, -0.2], half: [0.8, 0.03, 1.15], round: 0.01, bone: "root", color: MAT },
  { id: "firewall", shape: "box", center: [0, 0.72, 0.92], half: [0.8, 0.3, 0.04], round: 0.02, bone: "root", color: BLUE_D },
  { id: "dash", shape: "box", center: [0, 0.84, 0.76], half: [0.8, 0.13, 0.13], round: 0.05, bone: "root", blend: 0.03, color: BLUE_D },
  { id: "dash_top", shape: "box", center: [0, 0.98, 0.76], half: [0.72, 0.02, 0.1], round: 0.01, bone: "root", island: "trim", color: BLACK },
  { id: "hood", shape: "box", center: [0, 0.8, 1.62], half: [0.8, 0.16, 0.7], round: 0.09, bone: "root", blend: 0.03, color: BLUE },
  { id: "hood_ridge", shape: "box", center: [0, 0.97, 1.62], half: [0.18, 0.02, 0.6], round: 0.012, bone: "root", color: BLUE_D },
  { id: "grille", shape: "box", center: [0, 0.68, 2.32], half: [0.55, 0.14, 0.03], round: 0.015, bone: "root", island: "trim", color: DARK },
  { id: "trunk", shape: "box", center: [0, 0.8, -1.75], half: [0.8, 0.16, 0.57], round: 0.09, bone: "root", blend: 0.03, color: BLUE },
  { id: "rear", shape: "box", center: [0, 0.68, -2.31], half: [0.82, 0.2, 0.04], round: 0.02, bone: "root", color: BLUE },
  { id: "bumper_f", shape: "box", center: [0, 0.45, 2.37], half: [0.82, 0.07, 0.06], round: 0.03, bone: "root", island: "trim", color: DARK },
  { id: "bumper_r", shape: "box", center: [0, 0.45, -2.37], half: [0.82, 0.07, 0.05], round: 0.03, bone: "root", island: "trim", color: DARK },
  { id: "sill", shape: "box", center: [0.9, 0.46, -0.2], half: [0.04, 0.06, 1.0], round: 0.015, bone: "root", mirror: "x", color: BLUE_D },
  { id: "quarter_f", shape: "box", center: [0.9, 0.68, 1.55], half: [0.04, 0.26, 0.75], round: 0.03, bone: "root", mirror: "x", color: BLUE },
  { id: "quarter_r", shape: "box", center: [0.9, 0.7, -1.77], half: [0.04, 0.27, 0.58], round: 0.03, bone: "root", mirror: "x", color: BLUE },
  { id: "shelf", shape: "box", center: [0, 0.98, -1.4], half: [0.75, 0.02, 0.22], round: 0.01, bone: "root", island: "trim", color: BLACK },
  { id: "head_lamp", shape: "box", center: [0.58, 0.8, 2.34], half: [0.16, 0.06, 0.03], round: 0.02, bone: "root", mirror: "x", island: "trim", color: LAMP },
  { id: "tail_lamp", shape: "box", center: [0.66, 0.8, -2.34], half: [0.12, 0.06, 0.02], round: 0.015, bone: "root", mirror: "x", island: "trim", color: RED },
  { id: "plate", shape: "box", center: [0, 0.62, -2.35], half: [0.2, 0.06, 0.012], bone: "root", island: "trim", color: WHITE },
  // THE ROOF ON ITS PILLARS (an island): A, B and C pillars, the roof and its side rails. The windows between them are open
  { id: "pillar_a", shape: "loft", points: [[0.8, 0.97, 0.84], [0.76, 1.64, 0.45]], radii: [0.032, 0.028], radii_v: [0.032, 0.028], square: 0.85, bone: "root", island: "guard", mirror: "x", color: BLUE_D },
  { id: "pillar_b", shape: "loft", points: [[0.86, 0.97, -0.26], [0.82, 1.64, -0.26]], radii: [0.034, 0.03], radii_v: [0.034, 0.03], square: 0.85, bone: "root", island: "guard", mirror: "x", color: BLUE_D },
  { id: "pillar_c", shape: "loft", points: [[0.8, 0.97, -1.3], [0.76, 1.64, -1.22]], radii: [0.034, 0.03], radii_v: [0.034, 0.03], square: 0.85, bone: "root", island: "guard", mirror: "x", color: BLUE_D },
  { id: "roof", shape: "box", center: [0, 1.66, -0.38], half: [0.82, 0.03, 0.95], round: 0.03, bone: "root", island: "guard", color: BLUE },
  { id: "roof_rail", shape: "box", center: [0.79, 1.63, -0.38], half: [0.03, 0.03, 0.95], round: 0.012, bone: "root", island: "guard", mirror: "x", color: BLUE_D },
  { id: "roof_front", shape: "box", center: [0, 1.63, 0.46], half: [0.78, 0.03, 0.03], round: 0.01, bone: "root", island: "guard", color: BLUE_D },
  { id: "roof_rear", shape: "box", center: [0, 1.63, -1.24], half: [0.78, 0.03, 0.03], round: 0.01, bone: "root", island: "guard", color: BLUE_D },
];
// THE FENDERS (an island): over each wheel an arch = a cylinder minus a smaller one minus a box that takes the lower part away
[["f", ZF], ["r", ZR]].forEach(function (a) {
  parts.push(
    { id: "fender_" + a[0], shape: "cylinder", center: [0.8, WR, a[1]], axis: "x", radius: WR + 0.09, half: 0.17, round: 0.02, bone: "root", island: "fenders", mirror: "x", color: BLUE },
    { id: "fender_" + a[0] + "_in", shape: "cylinder", center: [0.8, WR, a[1]], axis: "x", radius: WR + 0.05, half: 0.2, bone: "root", island: "fenders", mirror: "x", op: "subtract" },
    { id: "fender_" + a[0] + "_cut", shape: "box", center: [0.8, 0.0, a[1]], half: [0.3, 0.45, 0.7], bone: "root", island: "fenders", mirror: "x", op: "subtract" });
});
// THE SEATS (an island): a base, a cushion (its top is 0.56 over the ground) and a back for each of the four; [x, z of the hips, the back's height, the back's lean]
[[0.42, 0.2], [0.42, -0.85]].forEach(function (s, i) {
  const x = s[0], z = s[1];
  parts.push(
    { id: "seat_base" + i, shape: "box", center: [x, 0.43, z], half: [0.22, 0.07, 0.24], bone: "root", island: "seats", mirror: "x", color: DARK },
    { id: "seat_cushion" + i, shape: "box", center: [x, 0.5, z], half: [0.25, 0.06, 0.27], round: 0.04, bone: "root", island: "seats", mirror: "x", color: SEAT },
    { id: "seat_back" + i, shape: "loft", points: [[x, 0.58, z - 0.27], [x, 1.14, z - 0.37]], radii: [0.25, 0.22], radii_v: [0.06, 0.05], square: 0.7, bone: "root", island: "seats", mirror: "x", color: SEAT });
});
// THE STEERING WHEEL (an island): the column, the ring tilted toward the driver, the hub, a spoke
parts.push(
  { id: "column", shape: "capsule", a: [0.42, 0.86, 0.9], b: [0.42, 0.98, 0.64], radius: 0.03, bone: "root", island: "steer", color: DARK },
  { id: "steer_ring", shape: "torus", center: [0.42, 0.98, 0.66], axis: [0, 0.55, -0.83], radius: 0.18, tube: 0.022, bone: "root", island: "steer", color: BLACK },
  { id: "steer_hub", shape: "sphere", center: [0.42, 0.98, 0.66], radius: 0.04, bone: "root", island: "steer", color: DARK },
  { id: "steer_spoke", shape: "capsule", a: [0.24, 0.98, 0.66], b: [0.6, 0.98, 0.66], radius: 0.014, bone: "root", island: "steer", color: DARK });
// THE DOORS (an island: they swing about their hinge at the front edge, the bone's head; the bone runs back along the door): the panel, the top rail, the handle; the right ones are the twins
[["door_f_l", 0.28, 0.5, -0.1], ["door_r_l", -0.74, 0.44, -0.55]].forEach(function (d) {
  const b = d[0], z = d[1], hz = d[2], hand = d[3], k = b.slice(5, 6);
  parts.push(
    { id: "door_panel_" + k, shape: "box", center: [0.88, 0.72, z], half: [0.03, 0.25, hz], round: 0.02, bone: b, island: "doors", mirror: "x", color: BLUE },
    { id: "door_rail_" + k, shape: "box", center: [0.88, 0.98, z], half: [0.035, 0.02, hz], round: 0.01, bone: b, island: "doors", mirror: "x", color: BLUE_D },
    { id: "door_handle_" + k, shape: "box", center: [0.925, 0.86, hand], half: [0.014, 0.02, 0.07], round: 0.008, bone: b, island: "doors", mirror: "x", color: STEEL },
    { id: "door_hinge_" + k, shape: "capsule", a: [0.9, 0.56, z + hz - 0.01], b: [0.9, 0.9, z + hz - 0.01], radius: 0.02, bone: b, island: "doors", mirror: "x", color: DARK });
});
// the wheels, one island a pair: the tyre, the rim disc, a boss, five lug nuts and a white dot on the sidewall; centred on the hub (the bone's head), round about the axle; written for the LEFT wheel and mirrored
[["f", ZF], ["r", ZR]].forEach(function (w) {
  const k = w[0], x = TRACK, z = w[1], r = WR, hw = 0.1, b = "wheel_" + k + "_l", isl = "wheels_" + k, face = x + hw, rim = r * 0.62;
  parts.push(
    { id: "tyre_" + k, shape: "cylinder", center: [x, r, z], axis: "x", radius: r, half: hw, round: hw * 0.55, bone: b, island: isl, mirror: "x", color: RUBBER },
    { id: "rim_" + k, shape: "cylinder", center: [x, r, z], axis: "x", radius: rim, half: hw + 0.012, round: 0.012, bone: b, island: isl, mirror: "x", color: STEEL },
    { id: "boss_" + k, shape: "cylinder", center: [x, r, z], axis: "x", radius: r * 0.3, half: hw + 0.03, round: 0.012, bone: b, island: isl, mirror: "x", color: DARK },
    { id: "dot_" + k, shape: "cylinder", center: [x, r + r * 0.86, z], axis: "x", radius: r * 0.07, half: hw + 0.006, bone: b, island: isl, mirror: "x", color: WHITE });
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2 + 0.3;
    parts.push({ id: "nut_" + k + i, shape: "sphere", center: [face + 0.03, r + Math.cos(a) * r * 0.2, z + Math.sin(a) * r * 0.2], radius: 0.02, bone: b, island: isl, mirror: "x", color: STEEL });
  }
});
const sdf = {
  cell: 0.03, skin: { falloff: 4 }, shade: { ao: 0.3, ao_radius: 0.08, tone: 0.2, color_blend: 0 }, decimate: { ratio: 0.1, error: 0.01, max_edge: 0.8 },
  islands: {
    fenders: { cell: 0.016, decimate: { ratio: 0.05, error: 0.012, max_edge: 0.6 } },
    guard: { cell: 0.014, decimate: { ratio: 0.08, error: 0.012, max_edge: 1.2 } },
    doors: { cell: 0.016, decimate: { ratio: 0.08, error: 0.008, max_edge: 0.5 } },
    trim: { cell: 0.012, decimate: { ratio: 0.05, error: 0.006, max_edge: 0.5 } },
    seats: { cell: 0.016, decimate: { ratio: 0.1, error: 0.006, max_edge: 0.5 } },
    steer: { cell: 0.012, decimate: { ratio: 0.1, error: 0.005, max_edge: 0.2 } },
    wheels_f: { cell: 0.015, decimate: { ratio: 0.05, error: 0.006, max_edge: 0.3 } },
    wheels_r: { cell: 0.015, decimate: { ratio: 0.05, error: 0.006, max_edge: 0.3 } },
  },
  parts: parts,
};
// PHYSICS: the machine in the physics world (soma_phys.cpp, js/shapes.js): a FEW shapes in the bind pose's model space, one rigid body for every NEAR instance.
const physics = { mass: 1500, shapes: [{ id: "body", shape: "box", center: [0, 0.8, -0.05], half: [0.9, 0.5, 2.3], bone: "root" }] };
return {
  name: "sedan", max: 16,
  family: { faction: "machine", kind: "vehicle", hp: 100 },
  nav: { agent: {"name":"sedan","radius":2.2,"height":1.8,"step":0.3,"slope":25,"drop":0.3} },
  body: {
    skeleton: bones,
    rig: rig,
    body: body,
    vehicle: vehicle,
    couplers: couplers,
    doors: doors,
    seats: seats,
    physics: physics,
    sdf: sdf
  },
  abilities: ["walk", "effects"],
  interaction: { uses: [] },
  // PARTICLES (soma/js/fx.js): the tail pipe under the rear bumper smokes while it drives, the rear wheels throw dust up behind them (both on the root: a wheel's own bone spins, a mount on it would circle the hub)
  particles: {
    exhaust: { effect: "exhaust_smoke", mount: { bone: "root", at: [0.55, 0.05, -0.2], dir: [0, 0.6, -1] }, loop: { while: "speed", from: 0.3, to: 10 }, scale: 0.5 },
    dust_l: { effect: "wheel_dust", mount: { bone: "root", at: [0.78, -0.23, 0.6], dir: [0, 1, -0.5] }, loop: { while: "speed", from: 3, to: 12 }, scale: 0.9 },
    dust_r: { effect: "wheel_dust", mount: { bone: "root", at: [-0.78, -0.23, 0.6], dir: [0, 1, -0.5] }, loop: { while: "speed", from: 3, to: 12 }, scale: 0.9 }
  },
  mind: {
    hz: 10, far_hz: 3,
    blocks: [
      ["health", { hp: 150 }],
      ["walk", { speed: 5, run_speed: 8, wp_near: 2.5, near: 2.8, stuck_time: 5 }],
      ["avoid", { radius: 1.1, length: 4.8, margin: 0.8, neighbours: 5, look: 2.5, brake: 5.0, other: 0.4, edge: 3, creep: 0.8, stop_gap: 0.8, push: 1.6, slow: 0.2, max_bend: 1, turn: 2.5, relax: 1.2, settle: 4, probe: 4, bodies: 8, boxed_wait: 6, ghost: 0, wait: 0.1, commit: 2, give_up: 8 }],
      ["drive", { top: 14, grip: 7, wheelbase: 2.65, max_steer: 0.5, steer_speed: 12 }],
      ["wander", { speed: 5, pause_min: 2, pause_max: 7, near: 2.8 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "sedan", select: [ld.node("wander")] };
      return { tree: tree };
    }
  }
};
