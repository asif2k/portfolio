"use strict";
// tank: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A main battle tank on watch: stays at the place it was born, goes to look at a noise within its leash and goes back. It pivots on the spot (tracks). It FIRES: the `gunner` block turns the turret to the nearest hostile creature within 55 m,
// raises the gun and throws its BOMB (a prop of the file: `props.bomb`, loaded in the breech) at it; the bomb blasts where it lands (see props).
// tank: a main battle tank, 5.5 m long without its gun. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, rig, body, vehicle, couplers, sdf }.
// Metres, +x to its left, +y up, +z forward, the wheels on y = 0 (a wheel is a bone whose HEAD is the hub). A TRACKED vehicle with eight road wheels (four a side; skid steering): it pivots on the spot to face where it is
// sent and then drives, its two sides' wheels turn opposite ways while it pivots; 9 m/s, the tracks hold 10 m/s^2, the suspension moves 6 cm. The TURRET is a bone that only turns about the vertical axis and the GUN a hinge
// that pitches (the page: `sp.pose(c, "turret", { ry })`, `sp.pose(c, "gun", { q })`, the lab's sliders).
const bones = [
  { name: "root", head: [0, 0.6, 0], tail: [0, 0.7, 0.4] },
  { name: "turret", parent: "root", head: [0, 1.15, -0.2], tail: [0, 1.5, -0.2] },
  { name: "gun", parent: "turret", head: [0, 1.5, 1.05], tail: [0, 1.5, 4.0] },
  { name: "wheel_1_l", parent: "root", head: [1.3, 0.4, 1.95], tail: [1.3, 0.5, 1.95], mirror: "x" },
  { name: "wheel_2_l", parent: "root", head: [1.3, 0.4, 0.65], tail: [1.3, 0.5, 0.65], mirror: "x" },
  { name: "wheel_3_l", parent: "root", head: [1.3, 0.4, -0.65], tail: [1.3, 0.5, -0.65], mirror: "x" },
  { name: "wheel_4_l", parent: "root", head: [1.3, 0.4, -1.95], tail: [1.3, 0.5, -1.95], mirror: "x" },
];
const rig = {
  joints: [
    { bone: "turret", kind: "ball", fwd: 0, back: 0, lat: 0, twist: 180 },               // (the turret slews: it turns about its own axis, it does not tilt)
    { bone: "gun", kind: "hinge", axis: [1, 0, 0], range: [-20, 8] },                      // (a turn about -x raises the muzzle: 20 degrees up (the range's low end), 8 down (its high end): measured with a bomb on the gun bone, the range used to be the other way round)
  ],
  chains: [],
};
// a heavy tank: acceleration 3, it turns at 0.9 rad/s; 9 m/s at most (the vehicle's own top speed: keep the two together)
const body = { max_speed: 9, accel: 3, turn_rate: 0.9, gravity: 19.8, step: 0.5, radius: 2.6 };                // (step: the highest prop of the physics world its wheels climb onto, radius: how far short of a wall it stops)
const vehicle = { model: "tracked", wheels: [{ bone: "wheel_1_l" }, { bone: "wheel_1_r" }, { bone: "wheel_2_l" }, { bone: "wheel_2_r" }, { bone: "wheel_3_l" }, { bone: "wheel_3_r" }, { bone: "wheel_4_l" }, { bone: "wheel_4_r" }], top_speed: 9, grip: 10, turn_rate: 0.9, travel: 0.06 };
const couplers = { rear: [0, 0.8, -2.9], front: [0, 0.8, 2.9] };

// SDF: what the mesh is made of (the mesher's grammar: soma/SOMA_MESHER.md; the bones are the skeleton above, a part stands on one by name). A machine of flat armour plates, so it is made of ISLANDS (a part with `island: "name"`
// melts into that island only: two islands never blend, each has its own grid and its own decimation, and a surface that moves against another is never torn). The rules that were learnt drawing it: (1) a colour is a colour per
// VERTEX, so where one surface changes colour in the middle of a big flat area the decimation draws the edge ragged: what is of another colour (the louvres, the lamps, the hatches, the stowage, the red marks) is an island of its own
// and stands a few cm proud, so that the edge between two colours is a crease of the geometry; (2) what moves is an island: the TURRET and its trim (the turret bone), the GUN (the gun bone: barrel, mantlet) and every ROAD WHEEL
// (a wheel bone: it spins in place and turns the other way on the other side when the tank pivots); (3) the grid is as fine as the island needs, and the decimation spends the vertices where the surface bends.
// Two more things were learnt: a `max_edge` of 15 to 30 cm keeps the shading of a flat plate honest (the vertices of a crease carry the averaged normal of its two faces, and over a long triangle that smears into the plate: the
// first pictures looked melted), and a loft is a chain of round cones, so its faces are not flat and cost a vertex every few cm: what is a plate is a `box` (an `ellipsoid` and a `box` that cuts it, below, make the dome of the turret).
// The hull is a box with its nose cut by a flat plate (an `intersect` with a loft that is so big that its face is a plane: the glacis), with the fenders over the tracks; the tracks are a HOLLOW band round the wheels (a stadium,
// a smaller one cut out of it; its lower run is 3 cm under the ground and its inner face is 5 cm above it: a road wheel is 0.35 m round about its hub at 0.4 m, so it rolls on the inner face, and the ground speed that the worker
// spins it with (over the hub's height) is what is seen, to 12 %); the road wheels, the sprocket and the idler show inside the band; every road wheel has a red mark on its outer face (a stripe off the axle: the spin shows).
const GREY = [0.30, 0.32, 0.34, 1], OLIVE = [0.30, 0.35, 0.22, 1], OLIVE_D = [0.22, 0.26, 0.16, 1], DARK = [0.10, 0.11, 0.12, 1], STEEL = [0.50, 0.52, 0.55, 1], TRACK = [0.11, 0.11, 0.12, 1], RUBBER = [0.07, 0.07, 0.075, 1], TAN = [0.55, 0.50, 0.34, 1],
  RED = [0.82, 0.12, 0.08, 1], LENS = [0.20, 0.34, 0.42, 1], AMBER = [1.0, 0.68, 0.10, 1];
const TRACK_X = 1.3, TRACK_L = 2.5;                                  // (the tracks' middle, the half length of the straight runs: the sprocket and the idler are at z = -+2.5)
const parts = [], ISLANDS = {};
// the parts of an island: its settings (the grid step, the decimation: ratio is a ceiling, `error` how far a vertex may be moved from the surface, max_edge the longest edge) and its parts
const add = function (name, cell, error, max_edge, list) {
  ISLANDS[name] = { cell: cell, decimate: { ratio: 0.01, error: error, max_edge: max_edge } };
  list.forEach(function (p) { p.island = name; parts.push(p); });
};
// THE HULL: a box (the glacis cut by a plate that falls from the deck, 0.45 m in 1.15 m, to the nose), a raised engine deck, a fender over each track and a guard in front of it (what comes after the cut is not cut)
add("hull", 0.03, 0.005, 0.25, [
  { id: "hull", shape: "box", center: [0, 0.675, 0.05], half: [1.05, 0.35, 2.8], round: 0.05, bone: "root", color: OLIVE },
  { id: "glacis", shape: "loft", points: [[0, 0.027, -4.047], [0, -3.613, 5.263]], radii: [6, 6], radii_v: [3, 3], square: 1, op: "intersect", bone: "root" },
  { id: "deck", shape: "box", center: [0, 1.04, -1.85], half: [0.95, 0.05, 0.85], round: 0.03, bone: "root", color: OLIVE_D },
  { id: "fender", shape: "box", center: [1.32, 0.99, 0], half: [0.3, 0.04, 2.6], round: 0.02, bone: "root", mirror: "x", color: OLIVE_D },
  { id: "guard", shape: "box", center: [1.32, 0.9, 2.72], half: [0.3, 0.03, 0.26], round: 0.02, bone: "root", mirror: "x", color: OLIVE_D },
]);
// THE HULL'S TRIM: the stowage boxes on the fenders, the collar under the turret, the louvres of the engine deck, the lamps, the driver's hatch and his periscopes, the tow eyes
add("hull_trim", 0.02, 0.005, 0.15, [
  { id: "stow_a", shape: "box", center: [1.35, 1.12, -1.15], half: [0.2, 0.12, 0.55], round: 0.04, bone: "root", mirror: "x", color: OLIVE },
  { id: "stow_b", shape: "box", center: [1.35, 1.09, 0.9], half: [0.2, 0.09, 0.4], round: 0.04, bone: "root", mirror: "x", color: OLIVE },
  { id: "collar", shape: "cylinder", center: [0, 1.05, -0.2], axis: "y", radius: 0.98, half: 0.05, round: 0.015, bone: "root", color: DARK },
  { id: "louvre", shape: "box", center: [0, 1.11, -1.85], half: [0.7, 0.018, 0.62], round: 0.008, bone: "root", color: DARK },
  { id: "louvre_a", shape: "box", center: [0, 1.135, -1.65], half: [0.7, 0.012, 0.025], bone: "root", color: STEEL },
  { id: "louvre_b", shape: "box", center: [0, 1.135, -1.85], half: [0.7, 0.012, 0.025], bone: "root", color: STEEL },
  { id: "louvre_c", shape: "box", center: [0, 1.135, -2.05], half: [0.7, 0.012, 0.025], bone: "root", color: STEEL },
  { id: "lamp", shape: "box", center: [0.82, 0.83, 2.2], half: [0.13, 0.08, 0.07], round: 0.025, bone: "root", mirror: "x", color: DARK },
  { id: "lens", shape: "box", center: [0.82, 0.86, 2.26], half: [0.08, 0.04, 0.03], round: 0.012, bone: "root", mirror: "x", color: AMBER },
  { id: "hatch", shape: "cylinder", center: [-0.45, 1.11, 1.15], axis: "y", radius: 0.26, half: 0.045, round: 0.02, bone: "root", color: OLIVE_D },
  { id: "hatch_lid", shape: "cylinder", center: [-0.45, 1.16, 1.15], axis: "y", radius: 0.17, half: 0.02, round: 0.01, bone: "root", color: DARK },
  { id: "peri", shape: "box", center: [0, 1.14, 1.5], half: [0.08, 0.04, 0.05], round: 0.012, bone: "root", mirror: "x", color: LENS },
  { id: "tow_f", shape: "torus", center: [0, 0.42, 2.9], axis: "z", radius: 0.09, tube: 0.03, bone: "root", color: STEEL },
  { id: "tow_r", shape: "torus", center: [0, 0.8, -2.83], axis: "z", radius: 0.09, tube: 0.03, bone: "root", color: STEEL },
]);
// THE TRACKS (an island each side): the band (a stadium: a box and a cylinder at each end, a smaller stadium cut out of it); and, in an island of their own, the sprocket behind and the idler in front with their hub caps and
// three return rollers under the top run (they stand a little in the band: no thin slit between two surfaces, a slit of 1 cm costs a thousand vertices)
[1, -1].forEach(function (s) {
  const side = s > 0 ? "l" : "r", cx = TRACK_X * s;
  add("track_" + side, 0.02, 0.008, 0.3, [
    { id: "belt_" + side, shape: "box", center: [cx, 0.435, 0], half: [0.26, 0.465, TRACK_L], round: 0.02, bone: "root", color: TRACK },
    { id: "belt_f_" + side, shape: "cylinder", center: [cx, 0.435, TRACK_L], axis: "x", radius: 0.465, half: 0.26, round: 0.02, bone: "root", color: TRACK },
    { id: "belt_b_" + side, shape: "cylinder", center: [cx, 0.435, -TRACK_L], axis: "x", radius: 0.465, half: 0.26, round: 0.02, bone: "root", color: TRACK },
    { id: "hollow_" + side, shape: "box", center: [cx, 0.435, 0], half: [0.4, 0.385, TRACK_L], op: "subtract", bone: "root" },
    { id: "hollow_f_" + side, shape: "cylinder", center: [cx, 0.435, TRACK_L], axis: "x", radius: 0.385, half: 0.4, op: "subtract", bone: "root" },
    { id: "hollow_b_" + side, shape: "cylinder", center: [cx, 0.435, -TRACK_L], axis: "x", radius: 0.385, half: 0.4, op: "subtract", bone: "root" },
  ]);
  add("drive_" + side, 0.015, 0.005, 0.2, [
    { id: "sprocket_" + side, shape: "cylinder", center: [cx, 0.435, -TRACK_L], axis: "x", radius: 0.4, half: 0.2, round: 0.03, bone: "root", color: GREY },
    { id: "idler_" + side, shape: "cylinder", center: [cx, 0.435, TRACK_L], axis: "x", radius: 0.4, half: 0.2, round: 0.03, bone: "root", color: GREY },
    { id: "sprocket_cap_" + side, shape: "cylinder", center: [cx + 0.03 * s, 0.435, -TRACK_L], axis: "x", radius: 0.14, half: 0.2, round: 0.02, bone: "root", color: DARK },
    { id: "idler_cap_" + side, shape: "cylinder", center: [cx + 0.03 * s, 0.435, TRACK_L], axis: "x", radius: 0.14, half: 0.2, round: 0.02, bone: "root", color: DARK },
    { id: "roller_a_" + side, shape: "cylinder", center: [cx, 0.745, 1.3], axis: "x", radius: 0.09, half: 0.18, round: 0.015, bone: "root", color: GREY },
    { id: "roller_b_" + side, shape: "cylinder", center: [cx, 0.745, 0], axis: "x", radius: 0.09, half: 0.18, round: 0.015, bone: "root", color: GREY },
    { id: "roller_c_" + side, shape: "cylinder", center: [cx, 0.745, -1.3], axis: "x", radius: 0.09, half: 0.18, round: 0.015, bone: "root", color: GREY },
  ]);
});
// THE ROAD WHEELS (an island each: a wheel never blends with anything, its own grid is fine): a rubber tyre 0.35 m round about the hub, a steel disc inside it, a hub cap, and a RED MARK on the outer face a hand's breadth
// off the axle: that is what shows the spin. The side is written out (s = +1 the _l bone, -1 the _r bone); the face is at x * s
[[1, 1.95], [2, 0.65], [3, -0.65], [4, -1.95]].forEach(function (w) {
  [1, -1].forEach(function (s) {
    const name = "wheel_" + w[0] + (s > 0 ? "_l" : "_r"), b = name, z = w[1], cx = TRACK_X * s, id = function (n) { return n + "_" + w[0] + (s > 0 ? "l" : "r"); };
    add(name, 0.015, 0.004, 0.15, [
      { id: id("tyre"), shape: "cylinder", center: [cx, 0.4, z], axis: "x", radius: 0.35, half: 0.16, round: 0.05, bone: b, color: RUBBER },
      { id: id("disc"), shape: "cylinder", center: [cx, 0.4, z], axis: "x", radius: 0.25, half: 0.185, round: 0.02, bone: b, color: STEEL },
      { id: id("cap"), shape: "cylinder", center: [cx, 0.4, z], axis: "x", radius: 0.1, half: 0.215, round: 0.02, bone: b, color: DARK },
      { id: id("mark"), shape: "box", center: [cx + 0.1975 * s, 0.4 + 0.17, z], half: [0.0175, 0.075, 0.04], bone: b, color: RED },
    ]);
  });
});
// THE TURRET (the turret bone: it slews about the vertical through (0, *, -0.2)): a cast dome (an ellipsoid blended with a smaller one for the bustle, cut flat below by a box: an `intersect`; the ring under it comes after the cut), and its trim in an island of its own
add("turret", 0.02, 0.003, 0.25, [
  { id: "turret", shape: "ellipsoid", center: [0, 1.53, -0.3], radii: [1.02, 0.4, 1.45], bone: "turret", blend: 0.1, color: OLIVE },
  { id: "bustle", shape: "ellipsoid", center: [0, 1.5, -1.25], radii: [0.8, 0.32, 0.6], bone: "turret", blend: 0.1, color: OLIVE },
  { id: "turret_floor", shape: "box", center: [0, 1.7, -0.3], half: [3, 0.53, 3], op: "intersect", bone: "turret" },
  { id: "ring", shape: "cylinder", center: [0, 1.17, -0.2], axis: "y", radius: 0.9, half: 0.08, round: 0.02, bone: "turret", color: OLIVE_D },
]);
add("turret_trim", 0.012, 0.004, 0.15, [
  { id: "cupola", shape: "cylinder", center: [0.42, 1.88, -0.5], axis: "y", radius: 0.24, half: 0.08, round: 0.03, bone: "turret", color: OLIVE_D },
  { id: "cupola_lid", shape: "cylinder", center: [0.42, 1.97, -0.5], axis: "y", radius: 0.17, half: 0.025, round: 0.01, bone: "turret", color: DARK },
  { id: "loader", shape: "cylinder", center: [-0.45, 1.86, -0.3], axis: "y", radius: 0.2, half: 0.06, round: 0.025, bone: "turret", color: OLIVE_D },
  { id: "loader_lid", shape: "cylinder", center: [-0.45, 1.92, -0.3], axis: "y", radius: 0.14, half: 0.02, round: 0.01, bone: "turret", color: DARK },
  { id: "mg", shape: "cylinder", center: [0.42, 2.07, -0.15], axis: "z", radius: 0.035, half: 0.32, bone: "turret", color: DARK },
  { id: "mg_mount", shape: "box", center: [0.42, 2.03, -0.5], half: [0.05, 0.05, 0.06], round: 0.015, bone: "turret", color: DARK },
  { id: "sight", shape: "box", center: [-0.5, 1.93, 0.55], half: [0.15, 0.07, 0.17], round: 0.025, bone: "turret", color: OLIVE_D },
  { id: "sight_lens", shape: "box", center: [-0.5, 1.94, 0.73], half: [0.1, 0.04, 0.02], round: 0.01, bone: "turret", color: LENS },
  { id: "bin", shape: "box", center: [0, 1.58, -1.72], half: [0.7, 0.17, 0.26], round: 0.06, bone: "turret", color: TAN },
  { id: "aerial", shape: "cylinder", center: [-0.75, 2.3, -1.2], axis: "y", radius: 0.03, half: 0.45, bone: "turret", color: DARK },
  { id: "aerial_base", shape: "cylinder", center: [-0.75, 1.9, -1.2], axis: "y", radius: 0.07, half: 0.05, round: 0.015, bone: "turret", color: DARK },
]);
// THE GUN (the gun bone: it pitches about the trunnion (0, 1.5, 1.05)): the mantlet (an ellipsoid round the trunnion: it looks the same pitched), the breech sleeve, the barrel, the bore evacuator and the muzzle brake, a bore cut in
add("gun", 0.012, 0.003, 0.2, [
  { id: "mantlet", shape: "ellipsoid", center: [0, 1.5, 1.08], radii: [0.4, 0.3, 0.3], bone: "gun", blend: 0.05, color: OLIVE_D },
  { id: "sleeve", shape: "cylinder", center: [0, 1.5, 1.65], axis: "z", radius: 0.135, half: 0.35, round: 0.02, bone: "gun", blend: 0.05, color: STEEL },
  { id: "barrel", shape: "cylinder", center: [0, 1.5, 2.65], axis: "z", radius: 0.09, half: 1.35, bone: "gun", color: STEEL },
  { id: "evac", shape: "cylinder", center: [0, 1.5, 2.95], axis: "z", radius: 0.14, half: 0.2, round: 0.04, bone: "gun", color: STEEL },
  { id: "brake", shape: "cylinder", center: [0, 1.5, 3.9], axis: "z", radius: 0.125, half: 0.1, round: 0.015, bone: "gun", color: DARK },
  { id: "bore", shape: "cylinder", center: [0, 1.5, 4.1], axis: "z", radius: 0.05, half: 0.3, op: "subtract", bone: "gun" },
]);
const sdf = {
  cell: 0.03, skin: { falloff: 1 }, shade: { ao: 0, ao_radius: 0.12, tone: 0.2, color_blend: 0 }, decimate: { ratio: 0.01, error: 0.006, max_edge: 0.5 },
  islands: ISLANDS,
  parts: parts,
};
// PHYSICS: the machine in the physics world (soma_phys.cpp, js/shapes.js): a FEW shapes in the bind pose's model space, one rigid body for every NEAR instance. A crate that is thrown at it moves it, it pushes what it drives into; a trailer that is hit gives a share of the push to what tows it.
const physics = { mass: 4000, shapes: [{ id: "hull", shape: "box", center: [0, 0.75, 0], half: [1.55, 0.55, 2.8], bone: "root" }, { id: "turret", shape: "box", center: [0, 1.5, -0.15], half: [0.95, 0.3, 1.2], bone: "turret" }] };
return {
  name: "tank", max: 16,
  family: { faction: "guard", kind: "vehicle", hp: 400 },
  nav: { agent: {"name":"tank","radius":2.7,"height":2.6,"step":0.5,"slope":30,"drop":0.4} },
  body: {
    skeleton: bones,
    rig: rig,
    body: body,
    vehicle: vehicle,
    couplers: couplers,
    physics: physics,
    sdf: sdf
  },
  abilities: ["walk", "effects", "props"],
  interaction: { uses: [] },
  // PROPS (soma/js/family_props.js): the BOMB, the gun's round: a prop is a mesh round one imaginary bone, +y its long axis. It is born LOADED (`start: "rest"`: every tank takes one at once at its rest place, inside the gun's sleeve, where the mantlet hides it);
  // the mind's `gunner` block throws it AT a target (me.throw_at: the page solves the arc of `speed` and `gravity` from where the shell is, and the shell flies out of the barrel, `align` points its nose along its flight) and loads the next after the reload.
  // Where it lands it BLASTS (`throw.blast`: every creature within 7 m takes an impact that falls off with the distance; the world's health blocks take the damage, the creatures with hit zones the shock); it is gone at once (`linger: 0`), back in the family's pool.
  props: {
    bomb: {
      sdf: { cell: 0.012, shade: { ao: 0.3, ao_radius: 0.04, tone: 0.1 }, parts: [
        { id: "body", shape: "capsule", a: [0, -0.3, 0], b: [0, 0.12, 0], radius: 0.105, color: [0.2, 0.23, 0.12, 1] },
        { id: "nose", shape: "capsule", a: [0, 0.1, 0], b: [0, 0.4, 0], ra: 0.105, rb: 0.012, color: [0.17, 0.2, 0.1, 1] },
        { id: "band", shape: "cylinder", center: [0, 0.0, 0], axis: [0, 1, 0], radius: 0.109, half: 0.03, color: [0.9, 0.7, 0.1, 1] },
        { id: "case", shape: "cylinder", center: [0, -0.3, 0], axis: [0, 1, 0], radius: 0.112, half: 0.07, color: [0.62, 0.45, 0.16, 1] },
        { id: "fin_a", shape: "box", center: [0.11, -0.36, 0], half: [0.04, 0.07, 0.006], color: [0.15, 0.17, 0.09, 1] },
        { id: "fin_b", shape: "box", center: [-0.11, -0.36, 0], half: [0.04, 0.07, 0.006], color: [0.15, 0.17, 0.09, 1] },
        { id: "fin_c", shape: "box", center: [0, -0.36, 0.11], half: [0.006, 0.07, 0.04], color: [0.15, 0.17, 0.09, 1] },
        { id: "fin_d", shape: "box", center: [0, -0.36, -0.11], half: [0.006, 0.07, 0.04], color: [0.15, 0.17, 0.09, 1] }
      ] },
      rest: { bone: "gun", along: 0.5, at: [0, 0, 0], dir: [0, 0, 1] },
      start: "rest",
      throw: { speed: 60, gravity: 1, align: true, radius: 0.35, life: 8, linger: 0, fuse: "aim", hit: { impulse: 150, damage: 40 }, blast: { radius: 7, impulse: 800, damage: 160 } }
    }
  },
  // PARTICLES (soma/js/fx.js): the exhaust at the rear while it drives, and the flash of the gun when its mind says `me.fx("fire")`
  particles: {
    exhaust: { effect: "exhaust_smoke", mount: { bone: "root", at: [0.55, 0.45, -2.1], dir: [0, 1, -0.5] }, loop: { while: "speed", from: 0.2, to: 4 }, scale: 1.6 },
    fire: { effect: "muzzle_flash", mount: { bone: "gun", at: [0, 0, 2.95], dir: [0, 0, 1] }, once: "mind", scale: 4 },
    // the bomb in the air: a trail of smoke while it flies, and the burst where it lands
    bomb_trail: { effect: "exhaust_smoke", mount: { prop: "bomb", at: [0, -0.4, 0], dir: [0, -1, 0] }, loop: { while: "thrown" }, scale: 0.7 },
    bomb_burst: { effect: "grenade", mount: { prop: "bomb", at: [0, 0, 0], dir: [0, 1, 0] }, once: "impact", scale: 5 }
  },
  mind: {
    hz: 10, far_hz: 3,
    blocks: [
      ["health", { hp: 400 }],
      ["walk", { speed: 3, run_speed: 5, wp_near: 2, near: 3, stuck_time: 6 }],
      ["avoid", { radius: 1.65, length: 5.8, margin: 1.0, neighbours: 6, look: 3.0, brake: 5.0, other: 0.4, edge: 3, creep: 0.6, stop_gap: 0.8, push: 1.6, slow: 0.2, max_bend: 1, turn: 2.5, relax: 1.2, settle: 4, probe: 4, bodies: 8, boxed_wait: 6, ghost: 0, wait: 0.1, commit: 2, give_up: 8 }],
      ["drive", { model: "tracked", top: 9, grip: 10, turn_rate: 0.9 }],
      ["guard", { speed: 3, leash: 40, look_gap: 7, near: 3, check_time: 6, eye: 2.2 }],
      ["gunner", { weapon: "bomb", mode: "throw", aim: "turret", hold: true, sight: 70, range: 55, min_range: 9, aim_time: 0.5, pause: 1, reload: 3.5, shell_speed: 60, shell_gravity: 1, turret: "turret", gun: "gun", muzzle_y: 1.5, turret_rate: 1.2, gun_rate: 0.7, aim_y: 0.8, fx: "fire" }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "tank", select: [ld.node("gunner"), ld.node("guard")] };
      return { tree: tree };
    }
  }
};
