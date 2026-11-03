"use strict";
// forklift: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A fork lift: drives about its yard slowly, stops, drives on. It steers with its rear wheels (the tail swings out).
// forklift: a counterbalance fork lift, 2.9 m long with its forks. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, rig, body, vehicle, couplers, sdf }.
// Metres, +x to its left, +y up, +z forward, the wheels on y = 0 (a wheel is a bone whose HEAD is the hub). A VEHICLE of the car model that steers with its REAR wheels (their steer factor is -1: the tail swings out, as a
// forklift's does) and drives with its front ones; 4.5 m/s, a lock of 0.6 rad that closes with the speed. The CARRIAGE (the forks) is a bone that slides up the mast (a `fixed` joint with a slide of 2.2 m: the page,
// `sp.pose(c, "carriage", { y: 1.5 })`, the lab's slider of the carriage).
const bones = [
  { name: "root", head: [0, 0.8, -1.4], tail: [0, 0.8, 1.2] },                                  // (the chassis: it runs along the machine)
  { name: "mast", parent: "root", head: [0, 0.35, 1.25], tail: [0, 3.3, 1.25] },                // (the mast stands straight up: the carriage slides along ITS axis)
  { name: "carriage", parent: "mast", head: [0, 0.35, 1.25], tail: [0, 0.35, 1.7] },
  { name: "wheel_f_l", parent: "root", head: [0.82, 0.42, 0.55], tail: [0.82, 0.5, 0.55], mirror: "x" },
  { name: "wheel_r_l", parent: "root", head: [0.6, 0.32, -0.95], tail: [0.6, 0.4, -0.95], mirror: "x" },
];
const rig = {
  joints: [
    { bone: "mast", kind: "fixed" },
    { bone: "carriage", kind: "fixed", slide: [0, 2.2] },
  ],
  chains: [],
};
const body = { max_speed: 4.5, accel: 3, turn_rate: 2, gravity: 19.8, step: 0.3, radius: 1.3 };                // (step: the highest prop of the physics world its wheels climb onto, radius: how far short of a wall it stops)
const vehicle = { model: "car", wheels: [{ bone: "wheel_f_l", steer: 0, drive: 1, handbrake: 0 }, { bone: "wheel_f_r", steer: 0, drive: 1, handbrake: 0 }, { bone: "wheel_r_l", steer: -1, drive: 0, handbrake: 1 }, { bone: "wheel_r_r", steer: -1, drive: 0, handbrake: 1 }],
  top_speed: 4.5, grip: 5, max_steer: 0.6, steer_rate: 5, steer_speed: 4, travel: 0.04, follow: 12 };
const couplers = { rear: [0, 0.7, -1.55], front: [0, 0.7, 1.4] };

// SDF: what the mesh is made of (the mesher's grammar: soma/SOMA_MESHER.md; a part stands on a bone of the skeleton above by name, a `mirror: "x"` part of a `_l` bone writes the `_r` twin too, and a part of `root` with `mirror: "x"`
// is mirrored on `root`). Every group of parts that moves as one is an ISLAND (an island is a field of its own: it never blends into the others and its skin weights are its own bones'): the body (the default island: the
// frame, the side panels, the engine cover with the seat, the dash, the counterweight and the mudguards), the guard (posts, roof slats, beacon), the mast (two rails, the cross members, the lift and tilt cylinders), the
// carriage (the bone that slides up the mast: its bars, the shoes, the backrest and the two forks), the steering wheel, and the wheels: one island for the front pair, one for the rear pair. A WHEEL is centred on its hub (the bone's head) and
// round about the axle (the tyre's radius is the hub's height: 0.42 m in front, 0.32 m behind, the tyre's lowest point on y = 0), its parts are written for the LEFT wheel (+x is out) and mirrored; the spin shows in a
// yellow stripe on the rim, five lug nuts and a white dot on the sidewall. The REAR wheels swing to the sides (the lock is 0.6 rad): the body leaves them room (the counterweight's lower part is narrow, its upper part
// overhangs the tyres) and the steering axle beam stops short of them. Colour: the last union part of a list owns what it covers, so every patch (a stripe, a lamp) comes after the part it sits on and stands 8 mm or
// more proud of it; `color_blend` 0 (crisp panels). Thin things (slats, posts, spokes) are 2.5 cells thick or more in their island's cell.
const ORANGE = [0.95, 0.47, 0.04, 1], ORANGE_D = [0.74, 0.33, 0.03, 1], BLACK = [0.035, 0.035, 0.04, 1], DARK = [0.11, 0.115, 0.125, 1], GREY = [0.27, 0.285, 0.31, 1], STEEL = [0.66, 0.68, 0.72, 1], FORK = [0.19, 0.20, 0.22, 1], RUBBER = [0.04, 0.04, 0.045, 1], YELLOW = [0.98, 0.84, 0.08, 1], RED = [0.80, 0.06, 0.04, 1], AMBER = [1.0, 0.60, 0.05, 1], LAMP = [1.0, 0.94, 0.72, 1], SEAT = [0.09, 0.09, 0.11, 1], WHITE = [0.92, 0.92, 0.90, 1], MAT = [0.07, 0.07, 0.075, 1];
const parts = [
  // THE BODY (root, the default island): the frame, the axle beams, the side panels, the floor, the engine cover, the dash with its steering column, the seat, the counterweight, the mudguards, lamps
  { id: "frame", shape: "box", center: [0, 0.5, 0.3], half: [0.6, 0.09, 0.95], round: 0.04, bone: "root", color: DARK },
  { id: "axle_f", shape: "box", center: [0, 0.42, 0.55], half: [0.68, 0.075, 0.09], round: 0.03, bone: "root", color: DARK },
  { id: "axle_r", shape: "box", center: [0, 0.32, -0.95], half: [0.5, 0.06, 0.07], round: 0.025, bone: "root", color: DARK },
  { id: "side", shape: "box", center: [0.55, 0.72, 0.3], half: [0.09, 0.23, 0.78], round: 0.05, bone: "root", blend: 0.03, mirror: "x", color: ORANGE },
  { id: "floor", shape: "box", center: [0, 0.6, 0.4], half: [0.5, 0.03, 0.62], round: 0.01, bone: "root", color: MAT },
  { id: "engine", shape: "box", center: [0, 0.88, -0.28], half: [0.5, 0.34, 0.5], round: 0.14, bone: "root", blend: 0.03, color: ORANGE },
  { id: "dash", shape: "box", center: [0, 0.98, 0.84], half: [0.36, 0.4, 0.2], round: 0.12, bone: "root", blend: 0.03, color: ORANGE },
  { id: "dash_top", shape: "box", center: [0, 1.4, 0.84], half: [0.3, 0.025, 0.15], round: 0.01, bone: "root", island: "trim", color: DARK },
  { id: "seat", shape: "box", center: [0, 1.27, -0.22], half: [0.27, 0.06, 0.27], round: 0.04, bone: "root", island: "seat", color: SEAT },
  { id: "seat_back", shape: "loft", points: [[0, 1.3, -0.42], [0, 1.82, -0.53]], radii: [0.27, 0.21], radii_v: [0.07, 0.055], square: 0.7, bone: "root", island: "seat", color: SEAT },
  { id: "cw_top", shape: "box", center: [0, 1.07, -1.05], half: [0.73, 0.4, 0.5], round: 0.22, bone: "root", blend: 0.04, color: ORANGE },
  { id: "cw_low", shape: "box", center: [0, 0.5, -1.12], half: [0.32, 0.2, 0.42], round: 0.08, bone: "root", blend: 0.03, color: ORANGE_D },
  { id: "cw_band", shape: "box", center: [0, 1.0, -1.57], half: [0.46, 0.07, 0.03], round: 0.02, bone: "root", island: "trim", color: BLACK },
  { id: "tow", shape: "box", center: [0, 0.7, -1.59], half: [0.12, 0.05, 0.04], round: 0.015, bone: "root", island: "trim", color: DARK },
  { id: "tail_lamp", shape: "box", center: [0.55, 1.25, -1.57], half: [0.09, 0.05, 0.03], round: 0.015, bone: "root", mirror: "x", island: "trim", color: RED },
  { id: "head_lamp", shape: "box", center: [0.83, 0.97, 1.05], half: [0.09, 0.045, 0.02], round: 0.015, bone: "root", mirror: "x", island: "trim", color: LAMP },
  { id: "tank_cradle", shape: "box", center: [0, 1.5, -1.17], half: [0.2, 0.04, 0.2], round: 0.015, bone: "root", color: DARK },
  { id: "tank", shape: "capsule", a: [0, 1.66, -1.3], b: [0, 1.66, -1.04], radius: 0.16, bone: "root", color: STEEL },
  { id: "tank_strap", shape: "box", center: [0, 1.66, -1.17], half: [0.175, 0.175, 0.025], round: 0.01, bone: "root", island: "seat", color: DARK },
  // THE MUDGUARDS (an island): over each front tyre a shell = a cylinder minus a smaller one minus a box that takes the lower part away, so the arch ends well above the floor
  { id: "fender", shape: "cylinder", center: [0.78, 0.42, 0.55], axis: "x", radius: 0.515, half: 0.22, round: 0.02, bone: "root", island: "fenders", mirror: "x", color: ORANGE },
  { id: "fender_in", shape: "cylinder", center: [0.78, 0.42, 0.55], axis: "x", radius: 0.47, half: 0.25, bone: "root", island: "fenders", mirror: "x", op: "subtract" },
  { id: "fender_cut", shape: "box", center: [0.78, 0.04, 0.55], half: [0.3, 0.5, 0.7], bone: "root", island: "fenders", mirror: "x", op: "subtract" },
  // THE GUARD (an island): four posts, the roof frame and slats, the beacon
  { id: "post_f", shape: "loft", points: [[0.64, 0.95, 0.66], [0.66, 2.12, 0.92]], radii: [0.04, 0.035], radii_v: [0.035, 0.03], square: 0.85, bone: "root", island: "guard", mirror: "x", color: DARK },
  { id: "post_b", shape: "loft", points: [[0.62, 1.4, -0.72], [0.66, 2.12, -0.82]], radii: [0.04, 0.035], radii_v: [0.035, 0.03], square: 0.85, bone: "root", island: "guard", mirror: "x", color: DARK },
  { id: "roof_rail", shape: "box", center: [0.68, 2.12, 0.05], half: [0.04, 0.03, 0.95], bone: "root", island: "guard", mirror: "x", color: DARK },
  { id: "roof_front", shape: "box", center: [0, 2.12, 0.98], half: [0.68, 0.03, 0.035], bone: "root", island: "guard", color: DARK },
  { id: "roof_rear", shape: "box", center: [0, 2.12, -0.88], half: [0.68, 0.03, 0.035], bone: "root", island: "guard", color: DARK },
  { id: "slat_0", shape: "box", center: [0, 2.12, -0.62], half: [0.66, 0.02, 0.025], bone: "root", island: "guard", color: DARK },
  { id: "slat_1", shape: "box", center: [0, 2.12, -0.38], half: [0.66, 0.02, 0.025], bone: "root", island: "guard", color: DARK },
  { id: "slat_2", shape: "box", center: [0, 2.12, -0.14], half: [0.66, 0.02, 0.025], bone: "root", island: "guard", color: DARK },
  { id: "slat_3", shape: "box", center: [0, 2.12, 0.1], half: [0.66, 0.02, 0.025], bone: "root", island: "guard", color: DARK },
  { id: "slat_4", shape: "box", center: [0, 2.12, 0.34], half: [0.66, 0.02, 0.025], bone: "root", island: "guard", color: DARK },
  { id: "slat_5", shape: "box", center: [0, 2.12, 0.58], half: [0.66, 0.02, 0.025], bone: "root", island: "guard", color: DARK },
  { id: "slat_6", shape: "box", center: [0, 2.12, 0.8], half: [0.66, 0.02, 0.025], bone: "root", island: "guard", color: DARK },
  { id: "beacon", shape: "sphere", center: [0, 2.23, -0.8], radius: 0.07, bone: "root", island: "guard", color: AMBER },
  { id: "beacon_base", shape: "cylinder", center: [0, 2.16, -0.8], axis: "y", radius: 0.045, half: 0.03, bone: "root", island: "guard", color: DARK },
  // THE MAST (an island): two rails, the cross members, the foot, the lift cylinder with its chrome rod and the two tilt cylinders
  { id: "rail", shape: "box", center: [0.4, 1.75, 1.1], half: [0.075, 1.55, 0.1], round: 0.02, bone: "mast", island: "mast", mirror: "x", color: GREY },
  { id: "rail_face", shape: "box", center: [0.4, 1.7, 1.208], half: [0.04, 1.4, 0.012], bone: "mast", island: "mast", mirror: "x", color: STEEL },
  { id: "mast_top", shape: "box", center: [0, 3.25, 1.1], half: [0.48, 0.07, 0.1], round: 0.02, bone: "mast", island: "mast", color: GREY },
  { id: "mast_mid", shape: "box", center: [0, 2.1, 1.08], half: [0.35, 0.045, 0.06], round: 0.015, bone: "mast", island: "mast", color: GREY },
  { id: "mast_low", shape: "box", center: [0, 0.95, 1.08], half: [0.35, 0.05, 0.07], round: 0.015, bone: "mast", island: "mast", color: GREY },
  { id: "mast_foot", shape: "box", center: [0, 0.3, 1.08], half: [0.5, 0.1, 0.14], round: 0.04, bone: "mast", island: "mast", color: GREY },
  { id: "lift_cyl", shape: "cylinder", center: [0, 1.55, 1.02], axis: "y", radius: 0.065, half: 1.0, round: 0.02, bone: "mast", island: "mast", color: DARK },
  { id: "lift_rod", shape: "cylinder", center: [0, 2.8, 1.02], axis: "y", radius: 0.045, half: 0.5, round: 0.01, bone: "mast", island: "mast", color: STEEL },
  { id: "tilt_cyl", shape: "capsule", a: [0.28, 1.3, 0.82], b: [0.34, 1.72, 1.04], radius: 0.04, bone: "mast", island: "mast", mirror: "x", color: STEEL },
  // THE CARRIAGE (an island on the carriage bone, rest pose: the forks on the floor): two bars, the side plates, the shoes that run on the rails, the backrest, two forks (a blade that tapers to a rounded tip and a shank)
  { id: "car_top", shape: "box", center: [0, 0.66, 1.3], half: [0.52, 0.045, 0.045], round: 0.01, bone: "carriage", island: "carriage", color: DARK },
  { id: "car_bot", shape: "box", center: [0, 0.2, 1.3], half: [0.52, 0.05, 0.045], round: 0.01, bone: "carriage", island: "carriage", color: DARK },
  { id: "car_side", shape: "box", center: [0.49, 0.43, 1.3], half: [0.04, 0.27, 0.045], round: 0.01, bone: "carriage", island: "carriage", mirror: "x", color: DARK },
  { id: "car_mid", shape: "box", center: [0, 0.43, 1.3], half: [0.05, 0.25, 0.04], round: 0.01, bone: "carriage", island: "carriage", color: DARK },
  { id: "shoe", shape: "box", center: [0.4, 0.43, 1.225], half: [0.075, 0.13, 0.03], round: 0.01, bone: "carriage", island: "carriage", mirror: "x", color: GREY },
  { id: "back_bar", shape: "box", center: [0, 0.84, 1.34], half: [0.05, 0.22, 0.03], round: 0.01, bone: "carriage", island: "carriage", color: DARK },
  { id: "back_bar2", shape: "box", center: [0.25, 0.84, 1.34], half: [0.025, 0.22, 0.03], round: 0.008, bone: "carriage", island: "carriage", mirror: "x", color: DARK },
  { id: "back_bar3", shape: "box", center: [0.46, 0.84, 1.34], half: [0.03, 0.22, 0.03], round: 0.008, bone: "carriage", island: "carriage", mirror: "x", color: DARK },
  { id: "back_top", shape: "box", center: [0, 1.06, 1.34], half: [0.52, 0.035, 0.035], round: 0.01, bone: "carriage", island: "car_trim", color: YELLOW },
  { id: "back_mid", shape: "box", center: [0, 0.86, 1.34], half: [0.5, 0.025, 0.025], round: 0.008, bone: "carriage", island: "carriage", color: DARK },
  { id: "fork_blade", shape: "loft", points: [[0.3, 0.06, 1.42], [0.3, 0.05, 2.28], [0.3, 0.04, 2.4]], radii: [0.06, 0.06, 0.05], radii_v: [0.04, 0.03, 0.02], square: 0.85, bone: "carriage", island: "carriage", mirror: "x", color: FORK },
  { id: "fork_shank", shape: "box", center: [0.3, 0.42, 1.385], half: [0.06, 0.4, 0.04], round: 0.012, bone: "carriage", island: "carriage", mirror: "x", color: FORK },
  { id: "fork_tip", shape: "box", center: [0.3, 0.045, 2.43], half: [0.04, 0.02, 0.05], round: 0.012, bone: "carriage", island: "car_trim", mirror: "x", color: YELLOW },
  // THE STEERING WHEEL (an island): a column, a ring tilted to it, three spokes, a spinner knob
  { id: "column", shape: "capsule", a: [0, 1.38, 0.76], b: [0, 1.68, 0.5], radius: 0.035, bone: "root", island: "steer", color: DARK },
  { id: "steer_ring", shape: "torus", center: [0, 1.7, 0.48], axis: [0, 0.776, -0.631], radius: 0.17, tube: 0.022, bone: "root", island: "steer", color: BLACK },
  { id: "steer_hub", shape: "sphere", center: [0, 1.7, 0.48], radius: 0.045, bone: "root", island: "steer", color: DARK },
  { id: "steer_spoke", shape: "capsule", a: [0, 1.7, 0.48], b: [0.17, 1.7, 0.48], radius: 0.016, bone: "root", island: "steer", mirror: "x", color: DARK },
  { id: "steer_spoke2", shape: "capsule", a: [0, 1.7, 0.48], b: [0, 1.7 - 0.107, 0.48 - 0.132], radius: 0.016, bone: "root", island: "steer", color: DARK },
  { id: "spinner", shape: "sphere", center: [-0.12, 1.7 + 0.075, 0.48 + 0.095], radius: 0.032, bone: "root", island: "steer", color: YELLOW },
  { id: "lever_1", shape: "capsule", a: [-0.2, 1.4, 0.82], b: [-0.23, 1.6, 0.68], radius: 0.017, bone: "root", island: "steer", color: DARK },
  { id: "knob_1", shape: "sphere", center: [-0.23, 1.61, 0.675], radius: 0.034, bone: "root", island: "steer", color: RED },
  { id: "lever_2", shape: "capsule", a: [-0.3, 1.4, 0.82], b: [-0.32, 1.57, 0.7], radius: 0.017, bone: "root", island: "steer", color: DARK },
  { id: "knob_2", shape: "sphere", center: [-0.32, 1.58, 0.695], radius: 0.034, bone: "root", island: "steer", color: YELLOW },
];
// the wheels, one island a pair: the tyre (a rounded cylinder on the axle), the rim disc, a boss on the outer face, five lug nuts, a yellow stripe on the rim and a white dot on the sidewall; [front, rear] = hub x, z, radius, half the tyre's width
[["f", 0.82, 0.55, 0.42, 0.13], ["r", 0.6, -0.95, 0.32, 0.09]].forEach(function (w) {
  const k = w[0], x = w[1], z = w[2], r = w[3], hw = w[4], b = "wheel_" + k + "_l", isl = "wheels_" + k, face = x + hw, rim = r * 0.64;
  parts.push(
    { id: "tyre_" + k, shape: "cylinder", center: [x, r, z], axis: "x", radius: r, half: hw, round: hw * 0.55, bone: b, island: isl, mirror: "x", color: RUBBER },
    { id: "rim_" + k, shape: "cylinder", center: [x, r, z], axis: "x", radius: rim, half: hw + 0.012, round: 0.012, bone: b, island: isl, mirror: "x", color: STEEL },
    { id: "boss_" + k, shape: "cylinder", center: [x, r, z], axis: "x", radius: r * 0.3, half: hw + 0.03, round: 0.012, bone: b, island: isl, mirror: "x", color: DARK },
    { id: "dot_" + k, shape: "cylinder", center: [x, r + r * 0.86, z], axis: "x", radius: r * 0.07, half: hw + 0.006, bone: b, island: isl, mirror: "x", color: WHITE },
    { id: "stripe_" + k, shape: "box", center: [face + 0.026, r + r * 0.47, z], half: [0.012, r * 0.18, 0.035], bone: b, island: isl, mirror: "x", color: YELLOW });
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2 + 0.3;
    parts.push({ id: "nut_" + k + i, shape: "sphere", center: [face + 0.03, r + Math.cos(a) * r * 0.2, z + Math.sin(a) * r * 0.2], radius: 0.022, bone: b, island: isl, mirror: "x", color: STEEL });
  }
});
const sdf = {
  cell: 0.025, skin: { falloff: 4 }, shade: { ao: 0.35, ao_radius: 0.08, tone: 0.2, color_blend: 0 }, decimate: { ratio: 0.1, error: 0.009, max_edge: 0.8 },
  islands: {
    fenders: { cell: 0.015, decimate: { ratio: 0.05, error: 0.012, max_edge: 0.6 } },
    guard: { cell: 0.015, decimate: { ratio: 0.08, error: 0.012, max_edge: 1.2 } },
    mast: { cell: 0.02, decimate: { ratio: 0.05, error: 0.02, max_edge: 1.2 } },
    carriage: { cell: 0.017, decimate: { ratio: 0.1, error: 0.01, max_edge: 0.6 } },
    car_trim: { cell: 0.01, decimate: { ratio: 0.1, error: 0.004, max_edge: 0.4 } },
    trim: { cell: 0.012, decimate: { ratio: 0.05, error: 0.006, max_edge: 0.5 } },
    seat: { cell: 0.015, decimate: { ratio: 0.1, error: 0.006, max_edge: 0.5 } },
    steer: { cell: 0.012, decimate: { ratio: 0.1, error: 0.005, max_edge: 0.2 } },
    wheels_f: { cell: 0.015, decimate: { ratio: 0.05, error: 0.006, max_edge: 0.3 } },
    wheels_r: { cell: 0.012, decimate: { ratio: 0.06, error: 0.005, max_edge: 0.3 } },
  },
  parts: parts,
};
// PHYSICS: the machine in the physics world (soma_phys.cpp, js/shapes.js): a FEW shapes in the bind pose's model space, one rigid body for every NEAR instance. A crate that is thrown at it moves it, it pushes what it drives into; a trailer that is hit gives a share of the push to what tows it.
const physics = { mass: 3200, shapes: [{ id: "body", shape: "box", center: [0, 0.8, -0.1], half: [0.85, 0.45, 1.5], bone: "root" }, { id: "guard", shape: "box", center: [0, 2.2, 0], half: [0.7, 0.6, 0.85], bone: "root" }] };
return {
  name: "forklift", max: 16,
  family: { faction: "machine", kind: "vehicle", hp: 100 },
  nav: { agent: {"name":"forklift","radius":1.35,"height":2.3,"step":0.2,"slope":20,"drop":0.2} },
  body: {
    skeleton: bones,
    rig: rig,
    body: body,
    vehicle: vehicle,
    couplers: couplers,
    physics: physics,
    sdf: sdf
  },
  abilities: ["walk", "effects"],
  interaction: { uses: [] },
  // PARTICLES (soma/js/fx.js): the stack behind the seat puffs while it drives (it is slow: the smoke is full at 3 m/s)
  particles: {
    exhaust: { effect: "exhaust_smoke", mount: { bone: "root", at: [0.45, 0.35, -0.05], dir: [0, 1, -0.3] }, loop: { while: "speed", from: 0.2, to: 3 }, scale: 0.5 }
  },
  mind: {
    hz: 10, far_hz: 3,
    blocks: [
      ["health", { hp: 150 }],
      ["walk", { speed: 2.4, run_speed: 3.6, wp_near: 1.4, near: 1.8, stuck_time: 5 }],
      ["avoid", { radius: 1.0, length: 3.4, margin: 0.6, neighbours: 4, look: 2.5, brake: 3.0, other: 0.4, edge: 3, creep: 0.5, stop_gap: 0.8, push: 1.6, slow: 0.2, max_bend: 1, turn: 2.5, relax: 1.2, settle: 4, probe: 4, bodies: 8, boxed_wait: 6, ghost: 0, wait: 0.1, commit: 2, give_up: 8 }],
      ["drive", { top: 4.5, grip: 5, wheelbase: 1.5, max_steer: 0.6, steer_speed: 4 }],
      ["wander", { speed: 2.4, pause_min: 2, pause_max: 7, near: 1.8 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "forklift", select: [ld.node("wander")] };
      return { tree: tree };
    }
  }
};
