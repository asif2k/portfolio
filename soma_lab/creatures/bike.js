"use strict";
// bike: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A motorcycle: rides a round of the yard fast (it cannot stop on a point: it needs room to swing round), and rides away from danger.
// bike: a motorcycle, 1.9 m long. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, body, vehicle, couplers, sdf }.
// Metres, +x to its left, +y up, +z forward, the wheels on y = 0 (a wheel is a bone whose HEAD is the hub). A VEHICLE of the car model with two wheels in a line: the front one steers (by default: it is in front of the middle),
// the rear one drives and has the handbrake; 22 m/s, the tyres hold 8 m/s^2, a lock of 0.5 rad that closes with the speed. It shows what the model does with two wheels: it steers, drives, drifts and rides its suspension, but
// the chassis leans only to the plane through three or more contacts, so it stays upright in a corner.
const bones = [
  { name: "root", head: [0, 0.6, -0.95], tail: [0, 0.62, 0.7] },                                  // (the frame: it runs along the bike)
  { name: "wheel_f", parent: "root", head: [0, 0.34, 0.78], tail: [0.1, 0.34, 0.78] },
  { name: "wheel_r", parent: "root", head: [0, 0.34, -0.78], tail: [0.1, 0.34, -0.78] },
];
const body = { max_speed: 22, accel: 6, turn_rate: 2.4, gravity: 19.8, step: 0.25, radius: 1.1 };                // (step: the highest prop of the physics world its wheels climb onto, radius: how far short of a wall it stops)
const vehicle = { model: "car", wheels: [{ bone: "wheel_f", steer: 1, drive: 0, handbrake: 0 }, { bone: "wheel_r", steer: 0, drive: 1, handbrake: 1 }], top_speed: 22, grip: 8, max_steer: 0.5, steer_rate: 8, steer_speed: 14, travel: 0.04, follow: 14 };
const couplers = { rear: [0, 0.5, -1.0], front: [0, 0.5, 1.0] };

// SDF: what the mesh is made of (the mesher's grammar: soma/SOMA_MESHER.md; a part stands on a bone of the skeleton above by name; a `mirror: "x"` part of a bone that has no twin (root, a wheel) is mirrored on the same bone).
// A standard motorcycle in blue and yellow: a teardrop tank, a flat seat that rises into the tail, a round headlamp, a single cylinder engine with its covers, a high-level exhaust, two rear shocks with springs, wire-free
// five-spoke wheels. The FORKS stand at x = +-0.11 on the line through the front hub (21 degrees of rake) and ARE ON ROOT (the skeleton lets only the wheel turn): the wheel turns about the vertical axis through its hub, so
// the legs sit 0.11 off the middle plane and the tyre (0.065 half wide) and the rim clear them at the full lock of 0.5 rad; the fenders are shells over the tyres at 0.395 m, bigger than the tyre swings. A WHEEL is centred on its
// hub (the bone's head) and round about the axle: the tyre is a TORUS (ring radius + tube = 0.34 m, the hub's height: its lowest point is y = 0), the rim a ring, five spokes (ONE of them ORANGE, and a white dot on each
// sidewall, so the spin shows). Islands: the main one (root: frame, tank, seat, engine, exhaust, forks, bars), `fenders` (two shells made by subtracting a cylinder and two boxes from a cylinder), and one per wheel (an
// island is its own field: it never blends, and its skin is its bone's alone, so a wheel keeps its shape as it spins). Colour: the last union part of a list owns what it covers, so a patch (a stripe, a lens) comes after the part it
// sits on and stands proud of it; no soft colours (`color_blend` 0). A thin tube is 2.5 cells or more across (cell 0.012 in the main island, 0.01 in the wheels and fenders).
const BLUE = [0.10, 0.27, 0.80, 1], BLUE_D = [0.07, 0.19, 0.57, 1], DARK = [0.07, 0.07, 0.08, 1], STEEL = [0.60, 0.62, 0.66, 1], CHROME = [0.86, 0.88, 0.91, 1], YELLOW = [0.97, 0.84, 0.10, 1], ORANGE = [0.96, 0.46, 0.06, 1], RUBBER = [0.035, 0.035, 0.04, 1], SEAT = [0.10, 0.085, 0.08, 1], RED = [0.85, 0.07, 0.05, 1], AMBER = [1.0, 0.62, 0.05, 1], LENS = [1.0, 0.95, 0.75, 1], WHITE = [0.93, 0.93, 0.9, 1];
const FX = 0.11, FD = [0, 0.934, -0.358];                                                           // (the fork legs' x, and their direction up the steering axis: 21 degrees of rake)
const FP = function (t, x) { return [x === undefined ? FX : x, 0.34 + FD[1] * t, 0.78 + FD[2] * t]; };    // (a point of a fork leg, t metres up from the front hub)
const parts = [
  // the frame and the front end: the head tube, the down tube and the cradle under the engine, the subframe, the crown and the fork legs (a stout lower leg, a thin chrome stanchion above), the axle caps, the bars and grips
  { id: "head_tube", shape: "capsule", a: FP(0.84, 0), b: FP(0.5, 0), radius: 0.04, bone: "root", color: DARK },
  { id: "down_tube", shape: "capsule", a: [0, 0.92, 0.49], b: [0, 0.46, 0.27], radius: 0.03, bone: "root", color: DARK },
  { id: "cradle", shape: "chain", points: [[0, 0.46, 0.27], [0, 0.36, 0.02], [0, 0.38, -0.3]], radii: [0.028, 0.028, 0.028], bone: "root", color: DARK },
  { id: "crown", shape: "box", center: FP(0.8, 0), half: [0.13, 0.025, 0.04], round: 0.01, bone: "root", color: STEEL },
  { id: "leg_low", shape: "capsule", a: FP(0.0), b: FP(0.40), radius: 0.034, bone: "root", mirror: "x", color: STEEL },
  { id: "leg_up", shape: "capsule", a: FP(0.36), b: FP(0.8), radius: 0.026, bone: "root", mirror: "x", color: CHROME },
  { id: "axle_cap", shape: "cylinder", center: [0.125, 0.34, 0.78], axis: "x", radius: 0.032, half: 0.02, round: 0.008, bone: "root", mirror: "x", color: CHROME },
  { id: "riser", shape: "capsule", a: [0, 1.1, 0.48], b: [0, 1.17, 0.46], radius: 0.03, bone: "root", color: DARK },
  { id: "bar", shape: "chain", points: [[0, 1.19, 0.46], [0.3, 1.18, 0.43], [0.4, 1.15, 0.34]], radii: [0.02, 0.02, 0.02], bone: "root", mirror: "x", color: DARK },
  { id: "grip", shape: "capsule", a: [0.345, 1.168, 0.39], b: [0.41, 1.147, 0.332], radius: 0.029, bone: "root", mirror: "x", color: RUBBER },
  { id: "lever", shape: "capsule", a: [0.33, 1.175, 0.42], b: [0.42, 1.19, 0.5], radius: 0.014, bone: "root", mirror: "x", color: CHROME },
  // the headlamp between the legs (a chrome bucket and a lens), its arms and the front indicators
  { id: "headlamp", shape: "ellipsoid", center: [0, 1.0, 0.66], radii: [0.1, 0.1, 0.085], bone: "root", color: CHROME },
  { id: "lens", shape: "cylinder", center: [0, 1.0, 0.745], axis: "z", radius: 0.075, half: 0.015, round: 0.006, bone: "root", color: LENS },
  { id: "lamp_bolt", shape: "capsule", a: [-0.11, 1.0, 0.57], b: [0.11, 1.0, 0.57], radius: 0.02, bone: "root", color: DARK },
  { id: "lamp_arm", shape: "capsule", a: [0.09, 1.0, 0.64], b: [0.175, 1.0, 0.6], radius: 0.016, bone: "root", mirror: "x", color: DARK },
  { id: "blinker_f", shape: "sphere", center: [0.18, 1.0, 0.6], radius: 0.032, bone: "root", mirror: "x", color: AMBER },
  // the tank, the seat and the tail, the tail lamp, the plate and the rear indicators
  { id: "tank", shape: "ellipsoid", center: [0, 0.98, 0.17], radii: [0.17, 0.125, 0.32], bone: "root", color: BLUE },
  { id: "tank_cap", shape: "cylinder", center: [0, 1.105, 0.28], axis: "y", radius: 0.04, half: 0.012, round: 0.005, bone: "root", color: CHROME },
  { id: "seat", shape: "loft", points: [[0, 0.915, -0.14], [0, 0.93, -0.45], [0, 0.97, -0.76]], radii: [0.15, 0.16, 0.11], radii_v: [0.045, 0.055, 0.05], square: 0.6, bone: "root", island: "seat", color: SEAT },
  { id: "tail", shape: "loft", points: [[0, 0.95, -0.62], [0, 0.93, -0.86], [0, 0.88, -1.04]], radii: [0.1, 0.09, 0.07], radii_v: [0.04, 0.04, 0.035], square: 0.5, bone: "root", color: BLUE_D },
  { id: "tail_drop", shape: "capsule", a: [0, 0.89, -1.03], b: [0, 0.71, -1.07], radius: 0.03, bone: "root", color: BLUE_D },
  { id: "fender_stay", shape: "capsule", a: [0, 0.92, -0.8], b: [0, 0.73, -0.8], radius: 0.03, bone: "root", color: BLUE_D },
  { id: "tail_lamp", shape: "box", center: [0, 0.92, -1.08], half: [0.055, 0.025, 0.02], round: 0.01, bone: "root", color: RED },
  { id: "plate", shape: "box", center: [0, 0.7, -1.115], half: [0.095, 0.06, 0.008], round: 0.004, bone: "root", color: WHITE },
  { id: "tank_stripe", shape: "loft", points: [[0, 1.058, -0.07], [0, 1.092, 0.05], [0, 1.101, 0.17], [0, 1.092, 0.29], [0, 1.058, 0.41]], radii: [0.026, 0.028, 0.028, 0.028, 0.026], radii_v: [0.012, 0.014, 0.014, 0.014, 0.012], square: 0.7, bone: "root", island: "stripe", color: YELLOW },
  { id: "side_cover", shape: "box", center: [0.095, 0.835, -0.3], half: [0.028, 0.05, 0.2], round: 0.02, bone: "root", mirror: "x", color: BLUE_D },
  { id: "blinker_r", shape: "sphere", center: [0.14, 0.88, -1.0], radius: 0.028, bone: "root", mirror: "x", color: AMBER },
  // the engine: crankcase, a cylinder that leans forward with its head, side covers, the footpegs; the exhaust (a pipe and a silencer on each side)
  { id: "case", shape: "box", center: [0, 0.5, 0.06], half: [0.14, 0.14, 0.2], round: 0.06, bone: "root", color: STEEL },
  { id: "gearbox", shape: "box", center: [0, 0.47, -0.2], half: [0.12, 0.1, 0.12], round: 0.05, bone: "root", color: STEEL },
  { id: "barrel", shape: "cylinder", center: [0, 0.68, 0.12], axis: [0, 0.9, 0.43], radius: 0.1, half: 0.12, round: 0.01, bone: "root", color: DARK },
  { id: "head", shape: "cylinder", center: [0, 0.78, 0.17], axis: [0, 0.9, 0.43], radius: 0.105, half: 0.035, round: 0.012, bone: "root", color: STEEL },
  { id: "cover", shape: "cylinder", center: [0.155, 0.5, 0.02], axis: "x", radius: 0.085, half: 0.014, round: 0.006, bone: "root", mirror: "x", color: CHROME },
  { id: "peg", shape: "cylinder", center: [0.17, 0.46, -0.16], axis: "x", radius: 0.021, half: 0.07, bone: "root", mirror: "x", color: STEEL },
  { id: "pipe", shape: "chain", points: [[0.07, 0.72, 0.25], [0.15, 0.55, 0.33], [0.18, 0.43, 0.27], [0.19, 0.39, 0.0], [0.19, 0.4, -0.3]], radii: [0.022, 0.023, 0.025, 0.026, 0.03], bone: "root", mirror: "x", color: CHROME },
  { id: "muffler", shape: "capsule", a: [0.19, 0.4, -0.28], b: [0.2, 0.47, -0.98], ra: 0.044, rb: 0.056, bone: "root", mirror: "x", color: STEEL },
  { id: "muffler_end", shape: "cylinder", center: [0.2, 0.47, -0.99], axis: "z", radius: 0.038, half: 0.01, bone: "root", mirror: "x", color: DARK },
  // the swingarm with its cross brace, the shocks and their springs
  { id: "swing", shape: "capsule", a: [0.13, 0.44, -0.3], b: [0.13, 0.34, -0.78], radius: 0.031, bone: "root", mirror: "x", color: STEEL },
  { id: "swing_x", shape: "capsule", a: [-0.13, 0.43, -0.32], b: [0.13, 0.43, -0.32], radius: 0.028, bone: "root", color: STEEL },
  { id: "shock", shape: "capsule", a: [0.135, 0.4, -0.62], b: [0.12, 0.85, -0.44], radius: 0.02, bone: "root", mirror: "x", color: CHROME },
  { id: "spring", shape: "capsule", a: [0.133, 0.5, -0.59], b: [0.123, 0.78, -0.47], radius: 0.03, bone: "root", mirror: "x", color: YELLOW },
  { id: "axle_cap_r", shape: "cylinder", center: [0.15, 0.34, -0.78], axis: "x", radius: 0.032, half: 0.02, round: 0.008, bone: "root", mirror: "x", color: CHROME },
  // THE FENDERS (an island): a shell over each tyre = a cylinder minus a smaller one minus two boxes, ahead of / above the front tyre and behind / above the rear one
  { id: "fender_f", shape: "cylinder", center: [0, 0.34, 0.78], axis: "x", radius: 0.395, half: 0.085, round: 0.01, bone: "root", island: "fenders", color: BLUE },
  { id: "fender_f_in", shape: "cylinder", center: [0, 0.34, 0.78], axis: "x", radius: 0.362, half: 0.1, bone: "root", island: "fenders", op: "subtract" },
  { id: "fender_f_cut1", shape: "box", center: [0, 0.04, 0.78], half: [0.2, 0.4, 0.6], bone: "root", island: "fenders", op: "subtract" },
  { id: "fender_f_cut2", shape: "box", center: [0, 0.5, 0.0], half: [0.2, 0.6, 0.5], bone: "root", island: "fenders", op: "subtract" },
  { id: "fender_r", shape: "cylinder", center: [0, 0.34, -0.78], axis: "x", radius: 0.395, half: 0.1, round: 0.01, bone: "root", island: "fenders", color: BLUE_D },
  { id: "fender_r_in", shape: "cylinder", center: [0, 0.34, -0.78], axis: "x", radius: 0.362, half: 0.115, bone: "root", island: "fenders", op: "subtract" },
  { id: "fender_r_cut1", shape: "box", center: [0, 0.04, -0.78], half: [0.2, 0.4, 0.6], bone: "root", island: "fenders", op: "subtract" },
  { id: "fender_r_cut2", shape: "box", center: [0, 0.5, -0.2], half: [0.2, 0.6, 0.5], bone: "root", island: "fenders", op: "subtract" },
];
// the wheels, an island each: tyre (a torus), rim ring, hub, five spokes (the first one ORANGE), a white dot on each sidewall; [front, rear] = bone, hub z, the tyre's ring radius and tube, the rim's radius, half the hub
[["wheel_f", 0.78, 0.285, 0.055, 0.23, 0.07], ["wheel_r", -0.78, 0.265, 0.075, 0.2, 0.1]].forEach(function (w) {
  const b = w[0], z = w[1], R = w[2], T = w[3], rim = w[4], hh = w[5];
  parts.push(
    { id: "tyre_" + b, shape: "torus", center: [0, 0.34, z], axis: "x", radius: R, tube: T, bone: b, island: b, color: RUBBER },
    { id: "rim_" + b, shape: "torus", center: [0, 0.34, z], axis: "x", radius: rim + 0.003, tube: 0.024, bone: b, island: "rim_" + b, color: STEEL },
    { id: "hub_" + b, shape: "cylinder", center: [0, 0.34, z], axis: "x", radius: 0.05, half: hh, round: 0.012, bone: b, island: "rim_" + b, color: STEEL });
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2 + 0.2, ca = Math.cos(a), sa = Math.sin(a);
    parts.push({ id: "spoke_" + b + i, shape: "loft", points: [[0, 0.34 + ca * 0.04, z + sa * 0.04], [0, 0.34 + ca * (rim - 0.01), z + sa * (rim - 0.01)]], radii: [0.022, 0.016], radii_v: [0.03, 0.02], square: 0.7, bone: b, island: "rim_" + b, color: i === 0 ? ORANGE : STEEL });
  }
  parts.push({ id: "dot_" + b, shape: "cylinder", center: [T - 0.004, 0.34 + R, z], axis: "x", radius: 0.03, half: 0.012, round: 0.004, bone: b, island: b, mirror: "x", color: WHITE });
});
const sdf = {
  cell: 0.01, skin: { falloff: 1 }, shade: { ao: 0.35, ao_radius: 0.05, tone: 0.2, color_blend: 0 }, decimate: { ratio: 0.1, error: 0.005, max_edge: 0.5 },
  islands: {
    stripe: { cell: 0.005, decimate: { ratio: 0.1, error: 0.003, max_edge: 0.2 } },
    seat: { cell: 0.01, decimate: { ratio: 0.1, error: 0.004, max_edge: 0.3 } },
    fenders: { cell: 0.012, decimate: { ratio: 0.1, error: 0.008, max_edge: 0.4 } },
    wheel_f: { cell: 0.01, decimate: { ratio: 0.06, error: 0.004, max_edge: 0.2 } },
    rim_wheel_f: { cell: 0.008, decimate: { ratio: 0.08, error: 0.004, max_edge: 0.2 } },
    wheel_r: { cell: 0.01, decimate: { ratio: 0.06, error: 0.004, max_edge: 0.2 } },
    rim_wheel_r: { cell: 0.008, decimate: { ratio: 0.08, error: 0.004, max_edge: 0.2 } },
  },
  parts: parts,
};
// PHYSICS: the machine in the physics world (soma_phys.cpp, js/shapes.js): a FEW shapes in the bind pose's model space, one rigid body for every NEAR instance. A crate that is thrown at it moves it, it pushes what it drives into; a trailer that is hit gives a share of the push to what tows it.
const physics = { mass: 220, shapes: [{ id: "body", shape: "capsule", a: [0, 0.65, 0.45], b: [0, 0.65, -0.6], radius: 0.28, bone: "root" }] };
return {
  name: "bike", max: 16,
  family: { faction: "folk", kind: "vehicle", hp: 80 },
  nav: { agent: {"name":"bike","radius":1.15,"height":1.5,"step":0.2,"slope":30,"drop":0.3} },
  body: {
    skeleton: bones,
    body: body,
    vehicle: vehicle,
    couplers: couplers,
    physics: physics,
    sdf: sdf
  },
  abilities: ["walk", "effects"],
  interaction: { uses: [] },
  // PARTICLES (soma/js/fx.js): the pipe smokes a little while it rides, the rear wheel throws dust up (a mount on the root: the wheel's own bone spins, a mount on it would circle the hub)
  particles: {
    exhaust: { effect: "exhaust_smoke", mount: { bone: "root", at: [-0.2, -0.25, 0.1], dir: [0, 0.4, -1] }, loop: { while: "speed", from: 0.5, to: 12 }, scale: 0.6 },
    dust: { effect: "wheel_dust", mount: { bone: "root", at: [0, -0.56, 0.07], dir: [0, 1, -0.5] }, loop: { while: "speed", from: 4, to: 14 }, scale: 1 }
  },
  mind: {
    hz: 10, far_hz: 3,
    blocks: [
      ["health", { hp: 80 }],
      ["flee", { speed: 14, distance: 25, radius: 12, gait: "" }],
      ["walk", { speed: 8, run_speed: 12, wp_near: 2.2, near: 3, stuck_time: 6 }],
      ["avoid", { radius: 0.5, length: 2.0, margin: 0.8, neighbours: 5, look: 2.5, brake: 6.0, other: 0.4, edge: 3, creep: 0.8, stop_gap: 0.8, push: 1.6, slow: 0.2, max_bend: 1, turn: 2.5, relax: 1.2, settle: 4, probe: 4, bodies: 8, boxed_wait: 6, ghost: 0, wait: 0.1, commit: 2, give_up: 8 }],
      ["drive", { top: 22, grip: 8, wheelbase: 1.56, max_steer: 0.5, steer_speed: 14 }],
      ["patrol", { zones: ["yard"], pause_min: 1, pause_max: 4, speed: 8, near: 3 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "bike", select: [ld.node("flee"), ld.node("patrol")] };
      return { tree: tree };
    }
  }
};
