"use strict";
// pickup: a two door pickup truck for two on a bench seat, a bed behind. In soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// pickup: 5.0 m long, 1.9 m wide, 1.85 m high, its windows open. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, family, nav, body, abilities, interaction, mind }.
// Metres, +x to its left, +y up, +z forward, the wheels on y = 0 (a wheel is a bone whose HEAD is the hub). A VEHICLE of the car model: the front wheels steer, all four drive; 12 m/s.
// SEATS AND DOORS (soma/js/seat_api.js, SOMA.md "Seats and doors"): two seats on one bench (the driver on the left, the passenger) and two doors hinged at their FRONT edge (the bone's head is the hinge, the bone runs back along the door).
// The floor is high (0.46: the cab sits over the axles), so the cushion is 0.64 over the ground and the hips of a rider 0.78.
const WR = 0.4, TRACK = 0.82, ZF = 1.45, ZR = -1.35;
const bones = [
  { name: "root", head: [0, 0.4, -2.4], tail: [0, 0.4, 2.4] },
  { name: "door_l", parent: "root", head: [0.92, 0.8, 0.62], tail: [0.92, 0.8, -0.38], mirror: "x" },
  { name: "wheel_f_l", parent: "root", head: [TRACK, WR, ZF], tail: [TRACK, WR + 0.1, ZF], mirror: "x" },
  { name: "wheel_r_l", parent: "root", head: [TRACK, WR, ZR], tail: [TRACK, WR + 0.1, ZR], mirror: "x" },
];
const rig = {
  joints: [
    { bone: "door_l", kind: "hinge", axis: [0, 1, 0], range: [-100, 0] },
    { bone: "door_r", kind: "hinge", axis: [0, 1, 0], range: [0, 100] },
  ],
  chains: [],
};
const body = { max_speed: 12, accel: 3.8, turn_rate: 1.5, gravity: 19.8, step: 0.35, radius: 2.4 };                // (step: the highest prop of the physics world its wheels climb onto, radius: how far short of a wall it stops)
const vehicle = { model: "car", wheels: [{ bone: "wheel_f_l" }, { bone: "wheel_f_r" }, { bone: "wheel_r_l" }, { bone: "wheel_r_r" }], top_speed: 12, grip: 6, max_steer: 0.5, steer_rate: 4, steer_speed: 10, travel: 0.08, follow: 10, lean: 1 };
const couplers = { rear: [0, 0.7, -2.55], front: [0, 0.7, 2.5] };
const doors = {
  left: { bone: "door_l", open: -1.0, speed: 3, at: [1.28, 0, -0.18] },
  right: { bone: "door_r", open: 1.0, speed: 3, at: [-1.28, 0, -0.18] },
};
const seats = {
  driver: { at: [0.42, 0.78, 0.05], yaw: 0, feet: { left: [0.52, 0.54, 0.6], right: [0.32, 0.54, 0.64] }, hands: { left: [0.576, 1.165, 0.56], right: [0.264, 1.165, 0.56] }, door: "left" },
  passenger: { at: [-0.42, 0.78, 0.05], yaw: 0, feet: { left: [-0.32, 0.54, 0.6], right: [-0.52, 0.54, 0.6] }, door: "right" },
};

// SDF (the mesher's grammar: soma/SOMA_MESHER.md; a part stands on a bone of the skeleton above by name, a `mirror: "x"` part of a `_l` bone writes the `_r` twin too, and a part of `root` with `mirror: "x"` is mirrored on `root`).
// Islands: the body (default), the doors, the cab's roof and pillars (guard), the bench, the steering wheel, the trim, the fenders and the wheels. Floor top 0.48, cushion 0.64, roof 1.8: a seated person's head is under it.
const RED = [0.62, 0.11, 0.08, 1], RED_D = [0.44, 0.07, 0.05, 1], DARK = [0.11, 0.115, 0.125, 1], BLACK = [0.035, 0.035, 0.04, 1], STEEL = [0.66, 0.68, 0.72, 1], RUBBER = [0.04, 0.04, 0.045, 1], SEAT = [0.34, 0.3, 0.26, 1], LAMP = [0.95, 0.9, 0.7, 1], TAIL = [0.78, 0.07, 0.05, 1], WHITE = [0.92, 0.92, 0.9, 1], MAT = [0.18, 0.18, 0.17, 1];
const parts = [
  // THE BODY: the frame, the floor of the cab, the firewall, the dash, the hood, the grille, the cab's back, the BED (floor, sides, front, tailgate), the sills and the front quarter panels
  { id: "frame", shape: "box", center: [0, 0.38, 0], half: [0.6, 0.08, 2.3], round: 0.03, bone: "root", color: DARK },
  { id: "floor", shape: "box", center: [0, 0.46, -0.0], half: [0.84, 0.03, 0.7], round: 0.01, bone: "root", color: MAT },
  { id: "firewall", shape: "box", center: [0, 0.85, 0.74], half: [0.84, 0.36, 0.04], round: 0.02, bone: "root", color: RED_D },
  { id: "dash", shape: "box", center: [0, 0.98, 0.6], half: [0.84, 0.13, 0.13], round: 0.05, bone: "root", blend: 0.03, color: RED_D },
  { id: "dash_top", shape: "box", center: [0, 1.12, 0.6], half: [0.76, 0.02, 0.1], round: 0.01, bone: "root", island: "trim", color: BLACK },
  { id: "hood", shape: "box", center: [0, 0.92, 1.66], half: [0.84, 0.2, 0.78], round: 0.1, bone: "root", blend: 0.03, color: RED },
  { id: "hood_ridge", shape: "box", center: [0, 1.13, 1.66], half: [0.2, 0.025, 0.66], round: 0.012, bone: "root", color: RED_D },
  { id: "grille", shape: "box", center: [0, 0.82, 2.44], half: [0.6, 0.17, 0.03], round: 0.015, bone: "root", island: "trim", color: DARK },
  { id: "cab_back", shape: "box", center: [0, 0.78, -0.66], half: [0.84, 0.3, 0.04], round: 0.02, bone: "root", color: RED },
  { id: "bed_floor", shape: "box", center: [0, 0.68, -1.6], half: [0.88, 0.04, 0.85], round: 0.01, bone: "root", color: MAT },
  { id: "bed_side", shape: "box", center: [0.9, 0.9, -1.6], half: [0.04, 0.26, 0.85], round: 0.02, bone: "root", mirror: "x", color: RED },
  { id: "bed_front", shape: "box", center: [0, 0.9, -0.77], half: [0.88, 0.26, 0.04], round: 0.02, bone: "root", color: RED },
  { id: "tailgate", shape: "box", center: [0, 0.9, -2.46], half: [0.88, 0.26, 0.04], round: 0.02, bone: "root", color: RED },
  { id: "bed_rail", shape: "box", center: [0.9, 1.17, -1.6], half: [0.05, 0.02, 0.88], round: 0.01, bone: "root", mirror: "x", color: RED_D },
  { id: "bumper_f", shape: "box", center: [0, 0.55, 2.5], half: [0.88, 0.09, 0.07], round: 0.03, bone: "root", island: "trim", color: DARK },
  { id: "bumper_r", shape: "box", center: [0, 0.55, -2.55], half: [0.88, 0.09, 0.06], round: 0.03, bone: "root", island: "trim", color: DARK },
  { id: "sill", shape: "box", center: [0.92, 0.55, 0.12], half: [0.04, 0.06, 0.78], round: 0.015, bone: "root", mirror: "x", color: RED_D },
  { id: "quarter_f", shape: "box", center: [0.92, 0.82, 1.7], half: [0.04, 0.28, 0.8], round: 0.03, bone: "root", mirror: "x", color: RED },
  { id: "head_lamp", shape: "box", center: [0.6, 0.95, 2.44], half: [0.16, 0.07, 0.03], round: 0.02, bone: "root", mirror: "x", island: "trim", color: LAMP },
  { id: "tail_lamp", shape: "box", center: [0.7, 1.0, -2.49], half: [0.1, 0.08, 0.02], round: 0.015, bone: "root", mirror: "x", island: "trim", color: TAIL },
  // THE CAB'S ROOF ON ITS PILLARS (an island): the windows are open
  { id: "pillar_a", shape: "loft", points: [[0.84, 1.1, 0.7], [0.8, 1.8, 0.32]], radii: [0.034, 0.03], radii_v: [0.034, 0.03], square: 0.85, bone: "root", island: "guard", mirror: "x", color: RED_D },
  { id: "pillar_c", shape: "loft", points: [[0.84, 1.1, -0.62], [0.8, 1.8, -0.6]], radii: [0.036, 0.032], radii_v: [0.036, 0.032], square: 0.85, bone: "root", island: "guard", mirror: "x", color: RED_D },
  { id: "roof", shape: "box", center: [0, 1.82, -0.14], half: [0.84, 0.03, 0.5], round: 0.03, bone: "root", island: "guard", color: RED },
  { id: "roof_rail", shape: "box", center: [0.81, 1.79, -0.14], half: [0.03, 0.03, 0.5], round: 0.012, bone: "root", island: "guard", mirror: "x", color: RED_D },
  { id: "roof_front", shape: "box", center: [0, 1.79, 0.34], half: [0.8, 0.03, 0.03], round: 0.01, bone: "root", island: "guard", color: RED_D },
  { id: "roof_rear", shape: "box", center: [0, 1.79, -0.6], half: [0.8, 0.03, 0.03], round: 0.01, bone: "root", island: "guard", color: RED_D },
];
// THE FENDERS (an island): over each wheel an arch = a cylinder minus a smaller one minus a box that takes the lower part away
[["f", ZF], ["r", ZR]].forEach(function (a) {
  parts.push(
    { id: "fender_" + a[0], shape: "cylinder", center: [0.86, WR, a[1]], axis: "x", radius: WR + 0.09, half: 0.17, round: 0.02, bone: "root", island: "fenders", mirror: "x", color: RED },
    { id: "fender_" + a[0] + "_in", shape: "cylinder", center: [0.86, WR, a[1]], axis: "x", radius: WR + 0.05, half: 0.2, bone: "root", island: "fenders", mirror: "x", op: "subtract" },
    { id: "fender_" + a[0] + "_cut", shape: "box", center: [0.86, 0.0, a[1]], half: [0.3, 0.5, 0.7], bone: "root", island: "fenders", mirror: "x", op: "subtract" });
});
// THE BENCH (an island): a base, one cushion (its top is 0.64 over the ground) and the back
parts.push(
  { id: "bench_base", shape: "box", center: [0, 0.54, 0.05], half: [0.66, 0.05, 0.24], bone: "root", island: "seats", color: DARK },
  { id: "bench_cushion", shape: "box", center: [0, 0.58, 0.05], half: [0.7, 0.06, 0.27], round: 0.04, bone: "root", island: "seats", color: SEAT },
  { id: "bench_back", shape: "loft", points: [[0, 0.66, -0.22], [0, 1.22, -0.32]], radii: [0.7, 0.66], radii_v: [0.06, 0.05], square: 0.7, bone: "root", island: "seats", color: SEAT });
// THE STEERING WHEEL (an island): the column, the ring tilted toward the driver, the hub, a spoke
parts.push(
  { id: "column", shape: "capsule", a: [0.42, 1.0, 0.7], b: [0.42, 1.1, 0.54], radius: 0.03, bone: "root", island: "steer", color: DARK },
  { id: "steer_ring", shape: "torus", center: [0.42, 1.1, 0.52], axis: [0, 0.55, -0.83], radius: 0.19, tube: 0.023, bone: "root", island: "steer", color: BLACK },
  { id: "steer_hub", shape: "sphere", center: [0.42, 1.1, 0.52], radius: 0.04, bone: "root", island: "steer", color: DARK },
  { id: "steer_spoke", shape: "capsule", a: [0.23, 1.1, 0.52], b: [0.61, 1.1, 0.52], radius: 0.014, bone: "root", island: "steer", color: DARK });
// THE DOORS (an island: they swing about their hinge at the front edge, the bone's head; the bone runs back along the door): the panel, the top rail, the handle, the hinge; the right one is the twin
parts.push(
  { id: "door_panel", shape: "box", center: [0.92, 0.8, 0.12], half: [0.03, 0.26, 0.5], round: 0.02, bone: "door_l", island: "doors", mirror: "x", color: RED },
  { id: "door_rail", shape: "box", center: [0.92, 1.07, 0.12], half: [0.035, 0.02, 0.5], round: 0.01, bone: "door_l", island: "doors", mirror: "x", color: RED_D },
  { id: "door_handle", shape: "box", center: [0.965, 0.92, -0.26], half: [0.014, 0.02, 0.07], round: 0.008, bone: "door_l", island: "doors", mirror: "x", color: STEEL },
  { id: "door_hinge", shape: "capsule", a: [0.94, 0.62, 0.61], b: [0.94, 0.98, 0.61], radius: 0.02, bone: "door_l", island: "doors", mirror: "x", color: DARK });
// the wheels, one island a pair: the tyre, the rim disc, a boss, five lug nuts and a white dot on the sidewall; centred on the hub (the bone's head), round about the axle; written for the LEFT wheel and mirrored
[["f", ZF], ["r", ZR]].forEach(function (w) {
  const k = w[0], x = TRACK, z = w[1], r = WR, hw = 0.12, b = "wheel_" + k + "_l", isl = "wheels_" + k, face = x + hw, rim = r * 0.62;
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
const physics = { mass: 2200, shapes: [{ id: "body", shape: "box", center: [0, 0.85, -0.05], half: [0.94, 0.5, 2.5], bone: "root" }] };
return {
  name: "pickup", max: 16,
  family: { faction: "machine", kind: "vehicle", hp: 100 },
  nav: { agent: {"name":"pickup","radius":2.5,"height":1.9,"step":0.35,"slope":25,"drop":0.3} },
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
    exhaust: { effect: "exhaust_smoke", mount: { bone: "root", at: [0.6, 0.05, -0.18], dir: [0, 0.6, -1] }, loop: { while: "speed", from: 0.3, to: 10 }, scale: 0.6 },
    dust_l: { effect: "wheel_dust", mount: { bone: "root", at: [0.82, -0.3, 0.75], dir: [0, 1, -0.5] }, loop: { while: "speed", from: 3, to: 12 }, scale: 1 },
    dust_r: { effect: "wheel_dust", mount: { bone: "root", at: [-0.82, -0.3, 0.75], dir: [0, 1, -0.5] }, loop: { while: "speed", from: 3, to: 12 }, scale: 1 }
  },
  mind: {
    hz: 10, far_hz: 3,
    blocks: [
      ["health", { hp: 180 }],
      ["walk", { speed: 4.5, run_speed: 7, wp_near: 2.5, near: 3, stuck_time: 5 }],
      ["avoid", { radius: 1.15, length: 5.2, margin: 0.8, neighbours: 5, look: 2.5, brake: 4.0, other: 0.4, edge: 3, creep: 0.8, stop_gap: 0.8, push: 1.6, slow: 0.2, max_bend: 1, turn: 2.5, relax: 1.2, settle: 4, probe: 4, bodies: 8, boxed_wait: 6, ghost: 0, wait: 0.1, commit: 2, give_up: 8 }],
      ["drive", { top: 12, grip: 6, wheelbase: 2.8, max_steer: 0.5, steer_speed: 10 }],
      ["wander", { speed: 4.5, pause_min: 2, pause_max: 7, near: 3 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "pickup", select: [ld.node("wander")] };
      return { tree: tree };
    }
  }
};
