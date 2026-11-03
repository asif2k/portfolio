"use strict";
// truck: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A six wheeled dump truck: drives a round of the places of the yard at 6 m/s, stops a while at each, slows into a bend. It needs a lane wider than itself.
// truck: a six wheeled dump truck, 7.4 m long. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, rig, body, vehicle, couplers, sdf }.
// Metres, +x to its left, +y up, +z forward, the wheels on y = 0 (a wheel is a bone whose HEAD is the hub). A VEHICLE of the car model: the front axle steers (the default for the wheels in front of the middle), all six drive, the
// handbrake takes the grip of the rear four; 14 m/s, the tyres hold 7 m/s^2, a lock of 0.45 rad that closes with the speed (the steering of a truck at 50 km/h is not that of a truck at a walk). The BED is a bone on a hinge at its
// rear end that tips up to 55 degrees (the page: `sp.pose(c, "bed", { q })`, the lab's slider of the bed); a hitch at the back takes the wagon.
const AXLES = [["f", 2.3], ["m", -1.5], ["b", -2.8]], WR = 0.55, TRACK = 1.3;
const bones = [
  { name: "root", head: [0, 1.1, 0], tail: [0, 1.15, 0.8] },
  { name: "bed", parent: "root", head: [0, 1.55, -3.55], tail: [0, 1.55, -0.6] },
];
AXLES.forEach(function (a) { bones.push({ name: "wheel_" + a[0] + "_l", parent: "root", head: [TRACK, WR, a[1]], tail: [TRACK, WR + 0.1, a[1]], mirror: "x" }); });
const rig = {
  joints: [
    { bone: "bed", kind: "hinge", axis: [1, 0, 0], range: [-55, 0] },                      // (a turn about -x lifts the front of the bed: the hinge is at its rear end)
  ],
  chains: [],
};
const body = { max_speed: 14, accel: 3.5, turn_rate: 1.4, gravity: 19.8, step: 0.4, radius: 3.2 };                // (step: the highest prop of the physics world its wheels climb onto, radius: how far short of a wall it stops)
const vehicle = { model: "car", wheels: [{ bone: "wheel_f_l" }, { bone: "wheel_f_r" }, { bone: "wheel_m_l" }, { bone: "wheel_m_r" }, { bone: "wheel_b_l" }, { bone: "wheel_b_r" }], top_speed: 14, grip: 7, max_steer: 0.45, steer_rate: 3, steer_speed: 12, travel: 0.1, follow: 10, lean: 1 };
const couplers = { rear: [0, 1.0, -4.1], front: [0, 1.0, 4.0] };

// SDF: what the mesh is made of (the mesher's grammar: soma/SOMA_MESHER.md; the bones are the skeleton above, a part stands on one by name). A body of painted metal with a lot of small things of another colour on it, so it is made
// of ISLANDS (a part with `island: "name"` melts into that island only: two islands never blend, each has its own grid and its own decimation). The rules that were learnt drawing it: (1) a colour is a colour per VERTEX, so where
// one surface changes colour in the middle of a big flat area the decimation draws the edge ragged: the glass, the lamps, the stripes, the ribs are islands of their own and stand a few cm proud (or sunk in a pocket of the cab),
// so that the edge between two colours is a crease of the geometry; (2) what moves against what is an island each: the BED (the bed bone: it tips about the hinge at its rear end, (0, 1.55, -3.55)) and every WHEEL (they spin
// about x through the hub, the front two steer, and they pass through the fenders); (3) the grid is as fine as the island needs (the frame under it all 4 cm, a lamp 1.2 cm) and the decimation spends the vertices where the
// surface bends: `ratio` is only a ceiling, `error` is how far a vertex may be moved from the surface, `max_edge` the longest edge (a long edge makes the shading of a big plate smear: keep it under half a metre).
// The islands: chassis (frame, axles, rear fenders), sheet (hood and front arches: the red metal), front (grille, lamps, bumper), rear (hitch, tail lamps), stacks, tank, cab (a box with rounded edges cut by a big flat plate that
// leans back above the cowl: the raked windshield; the windows are pockets), cab_trim (the glass in the pockets, markers, handles, mirrors, the skirt), bed, bed_trim (ribs, rim, stripe, pins) and wheel_<axle>_<side>.
// A TYRE is a cylinder of the hub's height (0.55 m: its lowest point is on y = 0, so the ground speed the worker spins it with is what is seen) about the hub with two grooves cut round the tread; its OUTER face carries a steel
// rim, a hub cap, five nuts and an ORANGE STRIPE from the cap to the rim's edge: that is what shows the spin.
const RED = [0.74, 0.10, 0.07, 1], RED_D = [0.52, 0.07, 0.05, 1], GREY_D = [0.24, 0.26, 0.29, 1], DARK = [0.08, 0.08, 0.09, 1], TYRE = [0.06, 0.06, 0.065, 1], STEEL = [0.66, 0.68, 0.72, 1], CHROME = [0.86, 0.87, 0.90, 1],
  GLASS = [0.16, 0.30, 0.40, 1], ORANGE = [0.98, 0.52, 0.06, 1], AMBER = [1.0, 0.68, 0.10, 1], LAMP = [1.0, 0.96, 0.78, 1], TAIL = [0.85, 0.06, 0.05, 1], BED = [0.44, 0.46, 0.48, 1], BED_D = [0.30, 0.32, 0.34, 1];
const RAKE = function (y) { return 2.35 - 0.41 * (y - 2.35); };                                     // (the front face of the cab above the cowl: z at the height y; the plate of the `cab_rake` part has this face)
const parts = [], ISLANDS = {};
const add = function (name, cell, error, max_edge, list) {
  ISLANDS[name] = { cell: cell, decimate: { ratio: 0.01, error: error, max_edge: max_edge } };
  list.forEach(function (p) { p.island = name; parts.push(p); });
};
// THE FRAME, under everything (hard unions: a fillet at every joint of a ladder frame would cost a thousand vertices nobody sees): two rails, cross members, the axles with the differentials, the rocker beam of the rear pair,
// springs, the drive shaft, the battery box, the hinge brackets of the bed; and the long fender over each rear pair with its mud flap
add("chassis", 0.04, 0.012, 0.6, [
  { id: "rail", shape: "box", center: [0.58, 1.0, -0.15], half: [0.1, 0.17, 3.85], round: 0.03, bone: "root", mirror: "x", color: GREY_D },
  { id: "cross_a", shape: "box", center: [0, 1.0, 2.9], half: [0.6, 0.1, 0.12], bone: "root", color: GREY_D },
  { id: "cross_b", shape: "box", center: [0, 1.0, 0.6], half: [0.6, 0.1, 0.12], bone: "root", color: GREY_D },
  { id: "cross_c", shape: "box", center: [0, 1.0, -1.0], half: [0.6, 0.1, 0.12], bone: "root", color: GREY_D },
  { id: "cross_d", shape: "box", center: [0, 1.0, -3.85], half: [0.95, 0.15, 0.09], round: 0.03, bone: "root", color: GREY_D },
  { id: "axle_f", shape: "cylinder", center: [0, 0.55, 2.3], axis: "x", radius: 0.09, half: 1.1, bone: "root", color: DARK },
  { id: "axle_m", shape: "cylinder", center: [0, 0.55, -1.5], axis: "x", radius: 0.09, half: 1.1, bone: "root", color: DARK },
  { id: "axle_b", shape: "cylinder", center: [0, 0.55, -2.8], axis: "x", radius: 0.09, half: 1.1, bone: "root", color: DARK },
  { id: "diff_m", shape: "ellipsoid", center: [0, 0.55, -1.5], radii: [0.3, 0.27, 0.3], bone: "root", color: GREY_D },
  { id: "diff_b", shape: "ellipsoid", center: [0, 0.55, -2.8], radii: [0.3, 0.27, 0.3], bone: "root", color: GREY_D },
  { id: "rocker", shape: "box", center: [0.74, 0.85, -2.15], half: [0.09, 0.1, 0.95], round: 0.04, bone: "root", mirror: "x", color: GREY_D },
  { id: "spring_f", shape: "box", center: [0.7, 0.82, 2.3], half: [0.07, 0.04, 0.6], bone: "root", mirror: "x", color: DARK },
  { id: "shaft", shape: "cylinder", center: [0, 0.85, -0.5], axis: "z", radius: 0.06, half: 1.7, bone: "root", color: DARK },
  { id: "battery", shape: "box", center: [-1.0, 1.0, -0.05], half: [0.25, 0.22, 0.5], round: 0.04, bone: "root", color: GREY_D },
  { id: "bracket", shape: "box", center: [0.95, 1.45, -3.62], half: [0.13, 0.16, 0.14], round: 0.03, bone: "root", mirror: "x", color: GREY_D },
  { id: "fender_b", shape: "box", center: [1.3, 1.3, -2.15], half: [0.36, 0.05, 1.5], round: 0.04, bone: "root", mirror: "x", color: GREY_D },
  { id: "flap", shape: "box", center: [1.3, 0.78, -3.68], half: [0.3, 0.26, 0.022], round: 0.01, bone: "root", mirror: "x", color: DARK },
  { id: "flap_f", shape: "box", center: [1.3, 0.92, 1.6], half: [0.25, 0.2, 0.022], round: 0.01, bone: "root", mirror: "x", color: DARK },
]);
// THE RED METAL: over each front wheel an arch (a cylinder, a smaller one cut out of it, everything below the hub cut off: a half shell that a steered tyre swings inside; the cuts take what comes before them, so the hood
// and the shelves come after), the hood and its nose
add("sheet", 0.025, 0.004, 0.3, [
  { id: "arch", shape: "cylinder", center: [1.3, WR, 2.3], axis: "x", radius: 0.72, half: 0.38, round: 0.04, bone: "root", mirror: "x", color: RED },
  { id: "arch_cut", shape: "cylinder", center: [1.3, WR, 2.3], axis: "x", radius: 0.63, half: 0.5, op: "subtract", bone: "root", mirror: "x" },
  { id: "arch_low", shape: "box", center: [1.3, 0.2, 2.3], half: [0.6, 0.42, 1.0], op: "subtract", bone: "root", mirror: "x" },
  { id: "shelf", shape: "box", center: [0.86, 1.25, 2.6], half: [0.12, 0.04, 0.8], round: 0.02, bone: "root", mirror: "x", color: RED },
  { id: "hood", shape: "box", center: [0, 1.82, 3.1], half: [0.78, 0.44, 0.74], round: 0.13, bone: "root", blend: 0.03, color: RED },
  { id: "hood_nose", shape: "box", center: [0, 1.7, 3.62], half: [0.8, 0.32, 0.2], round: 0.08, bone: "root", blend: 0.03, color: RED },
]);
// THE FRONT (grille, bars, lamps, signals, bumper, tow hook), THE REAR (bumper, tail lamps, hitch with its ring), THE STACKS and THE TANK with its straps
add("front", 0.015, 0.006, 0.15, [
  { id: "grille", shape: "box", center: [0, 1.74, 3.84], half: [0.56, 0.3, 0.03], round: 0.02, bone: "root", color: DARK },
  { id: "bar_a", shape: "box", center: [0, 1.93, 3.88], half: [0.56, 0.028, 0.025], bone: "root", color: CHROME },
  { id: "bar_b", shape: "box", center: [0, 1.74, 3.88], half: [0.56, 0.028, 0.025], bone: "root", color: CHROME },
  { id: "bar_c", shape: "box", center: [0, 1.55, 3.88], half: [0.56, 0.028, 0.025], bone: "root", color: CHROME },
  { id: "lamp", shape: "cylinder", center: [0.8, 1.62, 3.86], axis: "z", radius: 0.12, half: 0.05, round: 0.03, bone: "root", mirror: "x", color: LAMP },
  { id: "lamp_rim", shape: "cylinder", center: [0.8, 1.62, 3.82], axis: "z", radius: 0.15, half: 0.04, round: 0.02, bone: "root", mirror: "x", color: CHROME },
  { id: "signal", shape: "box", center: [0.93, 1.9, 3.84], half: [0.07, 0.05, 0.03], round: 0.02, bone: "root", mirror: "x", color: AMBER },
  { id: "bumper", shape: "box", center: [0, 1.15, 3.93], half: [1.12, 0.14, 0.09], round: 0.05, bone: "root", color: CHROME },
  { id: "bumper_low", shape: "box", center: [0, 0.82, 3.85], half: [0.85, 0.09, 0.07], round: 0.03, bone: "root", color: GREY_D },
  { id: "tow_hook", shape: "torus", center: [0, 1.0, 4.04], axis: "y", radius: 0.1, tube: 0.04, bone: "root", color: ORANGE },
]);
add("rear", 0.015, 0.005, 0.15, [
  { id: "bumper_r", shape: "box", center: [0, 0.78, -3.95], half: [1.05, 0.09, 0.06], round: 0.03, bone: "root", color: STEEL },
  { id: "tail_l", shape: "box", center: [1.1, 1.18, -3.92], half: [0.09, 0.09, 0.04], round: 0.02, bone: "root", mirror: "x", color: TAIL },
  { id: "hitch", shape: "box", center: [0, 1.0, -3.98], half: [0.12, 0.09, 0.17], round: 0.03, bone: "root", color: ORANGE },
  { id: "hitch_ring", shape: "torus", center: [0, 1.0, -4.1], axis: "y", radius: 0.1, tube: 0.04, bone: "root", color: ORANGE },
]);
add("stacks", 0.015, 0.004, 0.3, [
  { id: "stack", shape: "cylinder", center: [1.18, 2.2, 0.3], axis: "y", radius: 0.075, half: 0.9, bone: "root", mirror: "x", color: CHROME },
  { id: "stack_cap", shape: "cylinder", center: [1.18, 3.12, 0.3], axis: "y", radius: 0.09, half: 0.05, round: 0.02, bone: "root", mirror: "x", color: DARK },
  { id: "stack_clamp", shape: "cylinder", center: [1.18, 1.7, 0.3], axis: "y", radius: 0.095, half: 0.04, bone: "root", mirror: "x", color: DARK },
]);
add("tank", 0.015, 0.004, 0.3, [
  { id: "tank", shape: "cylinder", center: [1.0, 1.0, -0.05], axis: "z", radius: 0.27, half: 0.6, round: 0.1, bone: "root", color: STEEL },
  { id: "tank_strap", shape: "cylinder", center: [1.0, 1.0, 0.25], axis: "z", radius: 0.285, half: 0.035, bone: "root", color: DARK },
  { id: "tank_strap_2", shape: "cylinder", center: [1.0, 1.0, -0.35], axis: "z", radius: 0.285, half: 0.035, bone: "root", color: DARK },
]);
// THE CAB: a box with rounded edges (flat sides, a flat roof) cut by a big flat plate that leans back above the cowl (an `intersect` with a loft whose face is the plane through (y 2.35, z 2.35) that leans back 0.41 m a metre:
// the raked windshield); the windows are pockets (a `subtract` of the cab's island only), the visor on top
add("cab", 0.02, 0.004, 0.2, [
  { id: "cab", shape: "box", center: [0, 2.3, 1.45], half: [1.15, 0.95, 0.9], round: 0.2, bone: "root", color: RED },
  { id: "cab_rake", shape: "loft", points: [[0, -0.176, 0.143], [0, 5.838, -2.323]], radii: [6, 6], radii_v: [3, 3], square: 1, op: "intersect", bone: "root" },
  { id: "win_front", shape: "loft", points: [[0, 2.5 + 0.0057, RAKE(2.5) + 0.0139], [0, 3.15 + 0.0057, RAKE(3.15) + 0.0139]], radii: [0.93, 0.93], radii_v: [0.05, 0.05], square: 1, op: "subtract", bone: "root" },
  { id: "win_side", shape: "box", center: [1.215, 2.84, 1.35], half: [0.1, 0.3, 0.52], round: 0.07, op: "subtract", bone: "root", mirror: "x" },
  { id: "win_back", shape: "box", center: [0, 2.85, 0.485], half: [0.55, 0.28, 0.1], round: 0.06, op: "subtract", bone: "root" },
  { id: "visor", shape: "box", center: [0, 3.2, 2.02], half: [1.06, 0.045, 0.22], round: 0.03, bone: "root", color: RED_D },
]);
// the panes sit in the pockets (a pane's face a cm in front of the pocket's floor, a few cm behind the cab's surface), the skirt under the door, the marker lamps, the door handles, two mirrors on arms, the step
add("cab_trim", 0.02, 0.008, 0.25, [
  { id: "glass_front", shape: "loft", points: [[0, 2.5 - 0.0171, RAKE(2.5) - 0.0416], [0, 3.15 - 0.0171, RAKE(3.15) - 0.0416]], radii: [0.925, 0.925], radii_v: [0.02, 0.02], square: 1, bone: "root", color: GLASS },
  { id: "glass_side", shape: "box", center: [1.105, 2.84, 1.35], half: [0.02, 0.3, 0.52], round: 0.015, bone: "root", mirror: "x", color: GLASS },
  { id: "glass_back", shape: "box", center: [0, 2.85, 0.595], half: [0.55, 0.28, 0.02], round: 0.015, bone: "root", color: GLASS },
  { id: "skirt", shape: "box", center: [0, 1.62, 1.45], half: [1.17, 0.07, 0.9], round: 0.03, bone: "root", color: DARK },
  { id: "marker", shape: "box", center: [-0.5, 3.3, 2.0], half: [0.07, 0.04, 0.03], round: 0.015, bone: "root", color: AMBER },
  { id: "marker_2", shape: "box", center: [0, 3.3, 2.0], half: [0.07, 0.04, 0.03], round: 0.015, bone: "root", color: AMBER },
  { id: "marker_3", shape: "box", center: [0.5, 3.3, 2.0], half: [0.07, 0.04, 0.03], round: 0.015, bone: "root", color: AMBER },
  { id: "handle", shape: "box", center: [1.18, 2.35, 1.0], half: [0.03, 0.04, 0.09], round: 0.015, bone: "root", mirror: "x", color: CHROME },
  { id: "mirror_arm", shape: "capsule", a: [1.12, 2.75, 2.12], b: [1.42, 2.8, 2.2], radius: 0.03, bone: "root", mirror: "x", color: DARK },
  { id: "mirror", shape: "box", center: [1.45, 2.82, 2.22], half: [0.035, 0.17, 0.08], round: 0.025, bone: "root", mirror: "x", color: DARK },
  { id: "step", shape: "box", center: [1.2, 1.45, 1.65], half: [0.16, 0.035, 0.34], round: 0.01, bone: "root", mirror: "x", color: DARK },
]);
// THE BED (bed bone): a floor, two sides that are taller at the front, a headboard with a canopy over the cab, a tailgate; and its trim: the rolled rim, the ribs, the beams under the floor, the stripe, the hinge pins
add("bed", 0.03, 0.008, 0.3, [
  { id: "bed_floor", shape: "box", center: [0, 1.65, -2.08], half: [1.32, 0.1, 1.54], round: 0.03, bone: "bed", color: BED },
  { id: "bed_side", shape: "box", center: [1.3, 2.17, -2.08], half: [0.075, 0.42, 1.54], round: 0.03, bone: "bed", mirror: "x", color: BED },
]);
add("bed_head", 0.025, 0.006, 0.3, [
  { id: "bed_head", shape: "box", center: [0, 2.55, -0.55], half: [1.32, 0.85, 0.09], round: 0.04, bone: "bed", color: RED_D },
  { id: "bed_canopy", shape: "box", center: [0, 3.38, 0.12], half: [1.32, 0.06, 0.68], round: 0.03, bone: "bed", color: RED },
]);
add("bed_trim", 0.02, 0.008, 0.25, [
  { id: "bed_tail", shape: "box", center: [0, 2.1, -3.63], half: [1.3, 0.5, 0.08], round: 0.02, bone: "bed", color: BED_D },
  { id: "bed_rim", shape: "capsule", a: [1.3, 2.59, -3.58], b: [1.3, 2.59, -0.58], radius: 0.075, bone: "bed", mirror: "x", color: BED_D },
  { id: "bed_rib", shape: "box", center: [1.38, 2.2, -3.25], half: [0.035, 0.42, 0.05], round: 0.015, bone: "bed", mirror: "x", color: BED_D },
  { id: "bed_rib_2", shape: "box", center: [1.38, 2.24, -2.6], half: [0.035, 0.45, 0.05], round: 0.015, bone: "bed", mirror: "x", color: BED_D },
  { id: "bed_rib_3", shape: "box", center: [1.38, 2.27, -1.95], half: [0.035, 0.48, 0.05], round: 0.015, bone: "bed", mirror: "x", color: BED_D },
  { id: "bed_rib_4", shape: "box", center: [1.38, 2.3, -1.3], half: [0.035, 0.5, 0.05], round: 0.015, bone: "bed", mirror: "x", color: BED_D },
  { id: "bed_beam", shape: "box", center: [0.55, 1.5, -2.08], half: [0.09, 0.07, 1.5], round: 0.02, bone: "bed", mirror: "x", color: BED_D },
  { id: "bed_pin", shape: "cylinder", center: [1.0, 1.55, -3.55], axis: "x", radius: 0.08, half: 0.17, round: 0.015, bone: "bed", mirror: "x", color: STEEL },
  { id: "bed_stripe", shape: "box", center: [1.385, 2.0, -2.2], half: [0.012, 0.055, 1.25], bone: "bed", mirror: "x", color: ORANGE },
]);
// THE WHEELS (one island each: a wheel never blends with the fender above it or with the next wheel, and its own grid is fine). Every part is round about the axle (the hub's y and z); the side is written out (s = +1 the
// left, the _l bone, -1 the _r bone), the hub cap, the nuts and the stripe stand on the outer face (x * s)
AXLES.forEach(function (a) {
  const k = a[0], z = a[1];
  [1, -1].forEach(function (s) {
    const b = "wheel_" + k + (s > 0 ? "_l" : "_r"), cx = TRACK * s, id = function (n) { return n + "_" + k + (s > 0 ? "l" : "r"); }, list = [
      { id: id("tyre"), shape: "cylinder", center: [cx, WR, z], axis: "x", radius: WR, half: 0.21, round: 0.11, bone: b, color: TYRE },
      { id: id("groove"), shape: "torus", center: [cx - 0.085, WR, z], axis: "x", radius: WR + 0.005, tube: 0.03, op: "subtract", bone: b },
      { id: id("groove2"), shape: "torus", center: [cx + 0.085, WR, z], axis: "x", radius: WR + 0.005, tube: 0.03, op: "subtract", bone: b },
      { id: id("rim"), shape: "cylinder", center: [cx + 0.2 * s, WR, z], axis: "x", radius: 0.37, half: 0.035, round: 0.012, bone: b, color: STEEL },
      { id: id("cap"), shape: "cylinder", center: [cx + 0.23 * s, WR, z], axis: "x", radius: 0.16, half: 0.05, round: 0.02, bone: b, color: GREY_D },
      { id: id("stripe"), shape: "box", center: [cx + 0.25 * s, WR + 0.25, z], half: [0.016, 0.1, 0.04], bone: b, color: ORANGE }];
    for (let i = 0; i < 5; i++) {
      const ang = (54 + 72 * i) * Math.PI / 180;
      list.push({ id: id("nut" + i), shape: "cylinder", center: [cx + 0.24 * s, WR + 0.25 * Math.sin(ang), z + 0.25 * Math.cos(ang)], axis: "x", radius: 0.032, half: 0.035, bone: b, color: DARK });
    }
    add(b, 0.018, 0.006, 0.15, list);
  });
});
const sdf = {
  cell: 0.03, skin: { falloff: 1 }, shade: { ao: 0, ao_radius: 0.12, tone: 0.2, color_blend: 0 }, decimate: { ratio: 0.01, error: 0.006, max_edge: 0.5 },
  islands: ISLANDS,
  parts: parts,
};
// PHYSICS: the machine in the physics world (soma_phys.cpp, js/shapes.js): a FEW shapes in the bind pose's model space, one rigid body for every NEAR instance. A crate that is thrown at it moves it, it pushes what it drives into; a trailer that is hit gives a share of the push to what tows it.
const physics = { mass: 9000, shapes: [{ id: "chassis", shape: "box", center: [0, 1.15, -0.25], half: [1.3, 0.5, 3.7], bone: "root" }, { id: "cab", shape: "box", center: [0, 2.4, 1.8], half: [1.2, 1.0, 1.2], bone: "root" }] };
return {
  name: "truck", max: 16,
  family: { faction: "machine", kind: "vehicle", hp: 100 },
  nav: { agent: {"name":"truck","radius":3.3,"height":3.4,"step":0.4,"slope":25,"drop":0.3} },
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
  // PARTICLES (soma/js/fx.js): what it asks the world's particle system to play, from the render loop: the stack behind the cab smokes while it drives, the rear wheels throw dust up
  particles: {
    exhaust: { effect: "exhaust_smoke", mount: { bone: "root", at: [-0.95, 2.1, 0.9], dir: [0, 1, 0.1] }, loop: { while: "speed", from: 0.2, to: 6 }, scale: 1.4 },
    dust_l: { effect: "wheel_dust", mount: { bone: "root", at: [1.4, -0.95, -3.1], dir: [0, 1, -0.3] }, loop: { while: "speed", from: 2, to: 9 }, scale: 2 },
    dust_r: { effect: "wheel_dust", mount: { bone: "root", at: [-1.4, -0.95, -3.1], dir: [0, 1, -0.3] }, loop: { while: "speed", from: 2, to: 9 }, scale: 2 }
  },
  mind: {
    hz: 10, far_hz: 3,
    blocks: [
      ["health", { hp: 300 }],
      ["walk", { speed: 6, run_speed: 8, wp_near: 3, near: 3.5, stuck_time: 6, timeout: 150 }],
      ["avoid", { radius: 1.55, length: 8.0, margin: 1.0, neighbours: 6, look: 3.0, brake: 3.5, other: 0.4, edge: 3, creep: 0.8, stop_gap: 0.8, push: 1.6, slow: 0.2, max_bend: 1, turn: 2.5, relax: 1.2, settle: 4, probe: 4, bodies: 8, boxed_wait: 6, ghost: 0, wait: 0.1, commit: 2, give_up: 8 }],
      ["drive", { top: 14, grip: 7, wheelbase: 4.45, max_steer: 0.45, steer_speed: 12 }],
      ["patrol", { zones: ["yard"], pause_min: 3, pause_max: 8, speed: 6, near: 3.5 }],
      ["wander", { speed: 5, pause_min: 3, pause_max: 8, near: 3.5 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "truck", select: [ld.node("patrol"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
