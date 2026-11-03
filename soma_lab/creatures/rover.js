"use strict";
// rover: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A small exploration rover: drives to a random place of its home, stops, drives on; backs away from danger. It cannot turn on the spot: it swings round while it rolls.
// rover: a small exploration rover, 0.9 m long on four wheels. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, rig, body, vehicle, couplers, roles, traits }.
// Metres, +x to its left, +y up, +z forward, the wheels on y = 0 (a wheel is a bone whose HEAD is the hub). A VEHICLE: it is driven by a driver's controls (`sp.set_controls`: throttle, brake, steer, handbrake) or by a WISH like any
// creature (`sp.set_intent`: the lab's brains wander and go-to drive it). It cannot pivot (a bicycle model: the front pair steers): it keeps rolling to swing round, its tyres hold 3 m/s^2 so it drifts when it is made to (the
// handbrake), the wheels spin with the ground under them and hang on a little suspension, and the hull leans over a hill and a bank. The mast and its camera head are the neck and the head of its life: the camera stays level
// when the hull pitches.
const bones = [
  { name: "root", head: [0, 0.2, 0], tail: [0, 0.22, 0.1] },
  { name: "mast", parent: "root", head: [0, 0.27, 0.17], tail: [0, 0.46, 0.19] },
  { name: "head", parent: "mast", head: [0, 0.46, 0.19], tail: [0, 0.5, 0.27] },
  { name: "wheel_f_l", parent: "root", head: [0.3, 0.12, 0.35], tail: [0.3, 0.2, 0.35], mirror: "x" },
  { name: "wheel_b_l", parent: "root", head: [0.3, 0.12, -0.35], tail: [0.3, 0.2, -0.35], mirror: "x" },
  // THE FACE (soma/SOMA.md "Authoring a face"): the camera head's two lenses are its EYES (a bone each at the middle of its barrel, pointing forward: an eye looks along its bone): they turn a little in the head, the head
  // and the mast do the rest of the looking
  { name: "eye_l", parent: "head", head: [0.04, 0.497, 0.255], tail: [0.04, 0.497, 0.28], mirror: "x" },
];
const rig = {
  joints: [
    { bone: "mast", kind: "ball", fwd: 25, back: 25, lat: 25, twist: 120 },
    { bone: "head", kind: "ball", fwd: 40, back: 40, lat: 35, twist: 60 },
    { bone: "eye_l", mirror: "x", kind: "ball", fwd: 20, back: 20, lat: 25, twist: [-5, 5] },
  ],
  chains: [],
};
const body = { max_speed: 4, accel: 5, turn_rate: 3, gravity: 19.8, step: 0.1, radius: 0.5 };                // (step: the highest prop of the physics world its wheels climb onto, radius: how far short of a wall it stops)
// a CAR with four wheels (the front pair steers by default, the rear one has the handbrake); the lock is 0.5 rad, followed at 6 per s; top speed 4 m/s, the tyres hold 3 m/s^2 (a low grip: it drifts and understeers easily),
// accel and brake default to 2.4 and 4.8, the suspension moves 4 cm and follows at 14 per s
const vehicle = { model: "car", wheels: [{ bone: "wheel_f_l" }, { bone: "wheel_f_r" }, { bone: "wheel_b_l" }, { bone: "wheel_b_r" }], top_speed: 4, grip: 3, max_steer: 0.5, steer_rate: 6, travel: 0.04, follow: 14 };
// where a hitch meets it: a hook at the rear for a wagon to be pulled by, and one at the front
const couplers = { rear: [0, 0.18, -0.47], front: [0, 0.18, 0.44] };
const roles = { neck: ["mast"], head: "head" };
// THE FACE: the roles of its lenses (soma 2.0's spelling: soma/SOMA.md "Authoring a face"), written into its roles on the next line (soma_face.cpp plays them)
const face = { eyes: [{ bone: "eye_l", yaw: 25, pitch: 20 }, { bone: "eye_r", yaw: 25, pitch: 20 }] };
Object.assign(roles, face);                 // THE FACE in roles (soma/tools/face_roles.js)
const traits = { breath: 0, idle: 0, stabilise: 0.7 };
// THE BODY (sdf): the parts stand on the creature's own bones by name. The hull, the panel, the suspension arms and the tow loops are on `root`, the mast on `mast`, the camera head on `head`, a wheel on its own bone (its hub is the bone's head).
// A wheel is round about the axle and its tyre's top is the hub's height (0.12 m) at the cleats, so the ground speed the worker computes is what the eye sees roll; the cleats are chevrons and a bright stripe is on the rim: both
// break the symmetry about the axle, so the spin shows. Each wheel is an ISLAND of its own (a grid just for it, its bone's weight alone: it is rigid and never smears into the arm); so are the camera head and the small bright
// things (crisp colours and a fine grid where the hull's coarse one would round them off), the hull and the arms are the main grid.
const CREAM = [0.88, 0.86, 0.80, 1], GOLD = [0.78, 0.58, 0.20, 1], DARK = [0.13, 0.14, 0.17, 1], SOLAR = [0.07, 0.13, 0.34, 1], FRAME = [0.60, 0.63, 0.68, 1], STEEL = [0.66, 0.69, 0.74, 1];
const RED = [0.85, 0.10, 0.08, 1], TYRE = [0.07, 0.07, 0.08, 1], RIM = [0.74, 0.76, 0.80, 1], LENS = [0.30, 0.85, 1.0, 1], ORANGE = [0.95, 0.45, 0.12, 1], LAMP = [1.0, 0.94, 0.72, 1];
const parts = [
  // the chassis: a dark frame, a gold wrapped lower hull, a cream upper hull with a lower nose in front, bumpers
  { id: "frame", shape: "box", center: [0, 0.185, -0.01], half: [0.176, 0.022, 0.37], round: 0.012, bone: "root", color: DARK },
  { id: "hull_low", shape: "box", center: [0, 0.215, -0.03], half: [0.192, 0.03, 0.3], round: 0.012, bone: "root", blend: 0.004, color: GOLD },
  { id: "hull", shape: "box", center: [0, 0.272, -0.02], half: [0.178, 0.05, 0.32], round: 0.03, bone: "root", blend: 0.006, color: CREAM },
  { id: "nose", shape: "box", center: [0, 0.24, 0.33], half: [0.15, 0.045, 0.1], round: 0.03, bone: "root", blend: 0.01, color: CREAM },
  { id: "bumper_f", shape: "box", center: [0, 0.19, 0.425], half: [0.16, 0.014, 0.018], round: 0.008, bone: "root", color: DARK },
  { id: "bumper_b", shape: "box", center: [0, 0.19, -0.395], half: [0.15, 0.022, 0.012], round: 0.008, bone: "root", color: DARK },
  // the deck: an orange stripe along each side, the solar panel in its frame
  { id: "stripe", shape: "box", center: [0.178, 0.272, -0.02], half: [0.008, 0.011, 0.2], bone: "root", island: "deck", mirror: "x", color: ORANGE },
  { id: "panel_frame", shape: "box", center: [0, 0.326, -0.1], half: [0.16, 0.008, 0.2], round: 0.004, bone: "root", island: "deck", color: FRAME },
  { id: "panel", shape: "box", center: [0, 0.33, -0.1], half: [0.146, 0.01, 0.186], round: 0.004, bone: "root", island: "deck", color: SOLAR },
  // the front: a grille, the headlights, the tow loop and a robot arm folded on the nose (on the right of the mast): a turret, the shoulder, the upper arm forward, the elbow, the forearm back and a tool drum with an orange face
  { id: "grille", shape: "box", center: [0, 0.245, 0.43], half: [0.09, 0.02, 0.008], round: 0.004, bone: "root", island: "front", color: DARK },
  { id: "lamp", shape: "cylinder", center: [0.125, 0.24, 0.43], axis: "z", radius: 0.018, half: 0.01, bone: "root", island: "front", mirror: "x", color: LAMP },
  { id: "tow_f", shape: "torus", center: [0, 0.18, 0.44], axis: "y", radius: 0.022, tube: 0.006, bone: "root", island: "front", color: STEEL },
  { id: "arm_turret", shape: "cylinder", center: [-0.09, 0.29, 0.34], axis: "y", radius: 0.024, half: 0.008, round: 0.004, bone: "root", island: "front", color: DARK },
  { id: "arm_shoulder", shape: "sphere", center: [-0.09, 0.306, 0.34], radius: 0.016, bone: "root", island: "front", color: STEEL },
  { id: "arm_upper", shape: "capsule", a: [-0.09, 0.306, 0.34], b: [-0.09, 0.318, 0.42], radius: 0.0105, bone: "root", island: "front", color: STEEL },
  { id: "arm_elbow", shape: "sphere", center: [-0.09, 0.318, 0.42], radius: 0.014, bone: "root", island: "front", color: DARK },
  { id: "arm_fore", shape: "capsule", a: [-0.09, 0.318, 0.42], b: [-0.135, 0.322, 0.345], radius: 0.009, bone: "root", island: "front", color: STEEL },
  { id: "arm_tool", shape: "cylinder", center: [-0.135, 0.322, 0.335], axis: "z", radius: 0.02, half: 0.016, round: 0.004, bone: "root", island: "front", color: DARK },
  { id: "arm_tip", shape: "cylinder", center: [-0.135, 0.322, 0.355], axis: "z", radius: 0.012, half: 0.007, bone: "root", island: "front", color: ORANGE },
  // the rear: the tow post with a draw pin (the coupler is at the pin: the ring of a wagon goes round it) and the tail lights
  { id: "post", shape: "capsule", a: [0, 0.18, -0.39], b: [0, 0.17, -0.455], radius: 0.01, bone: "root", island: "rear", color: STEEL },
  { id: "tow_plate", shape: "box", center: [0, 0.166, -0.46], half: [0.03, 0.007, 0.03], round: 0.003, bone: "root", island: "rear", color: STEEL },
  { id: "tow_pin", shape: "cylinder", center: [0, 0.185, -0.47], axis: "y", radius: 0.0085, half: 0.04, bone: "root", island: "rear", color: STEEL },
  { id: "tow_head", shape: "cylinder", center: [0, 0.23, -0.47], axis: "y", radius: 0.016, half: 0.005, round: 0.002, bone: "root", island: "rear", color: ORANGE },
  { id: "tail", shape: "box", center: [0.12, 0.2, -0.41], half: [0.022, 0.012, 0.007], round: 0.003, bone: "root", island: "rear", mirror: "x", color: RED },
  // an antenna on the rear deck: a stalk and a tilted dish
  { id: "stalk", shape: "capsule", a: [0.11, 0.32, -0.31], b: [0.11, 0.44, -0.31], radius: 0.007, bone: "root", island: "dish", color: STEEL },
  { id: "dish", shape: "cylinder", center: [0.11, 0.455, -0.31], axis: [0, 0.6, 0.8], radius: 0.05, half: 0.007, bone: "root", island: "dish", color: CREAM },
  // the mast: a collar on the hull and the mast itself (the `mast` bone), then the camera head (the `head` bone): a ball at its joint, the housing, two lenses with barrels, a sensor dome and a beacon
  { id: "collar", shape: "cylinder", center: [0, 0.326, 0.17], axis: "y", radius: 0.03, half: 0.012, round: 0.006, bone: "root", island: "collar", color: STEEL },
  { id: "mast", shape: "capsule", a: [0, 0.27, 0.17], b: [0, 0.465, 0.19], radius: 0.013, bone: "mast", color: STEEL },
  { id: "neck", shape: "sphere", center: [0, 0.46, 0.19], radius: 0.02, bone: "head", island: "head", color: STEEL },
  { id: "head", shape: "box", center: [0, 0.495, 0.205], half: [0.08, 0.035, 0.05], round: 0.02, bone: "head", island: "head", blend: 0.008, color: CREAM },
  { id: "barrel", shape: "cylinder", center: [0.04, 0.497, 0.255], axis: "z", radius: 0.026, half: 0.012, bone: "eye_l", island: "lenses", mirror: "x", color: DARK },          // (the lenses: an island of their own on the eye bones, so they turn clean)
  { id: "glass", shape: "cylinder", center: [0.04, 0.497, 0.268], axis: "z", radius: 0.018, half: 0.005, bone: "eye_l", island: "lenses", mirror: "x", color: LENS },
  { id: "dome", shape: "sphere", center: [0, 0.512, 0.258], radius: 0.013, bone: "head", island: "head", color: DARK },
  { id: "beacon", shape: "sphere", center: [0, 0.532, 0.18], radius: 0.012, bone: "head", island: "head", color: ORANGE },
];
// the four wheels, each its own island (side: +1 the left bone, -1 the right one: no mirrors, so each grid is just the wheel's box). The suspension arms (a wishbone from the hull to the hub) are on `root`; on the wheel's bone: the stub
// axle, a tyre with chevron cleats, a bright rim, a dark hub, a cap and a stripe
const WHEEL = { cell: 0.005, decimate: { ratio: 0.05, error: 0.001, max_edge: 0.03 } };
const islands = { deck: { cell: 0.0045, decimate: { ratio: 0.005, error: 0.0008, max_edge: 0.06 } }, head: { cell: 0.0035, decimate: { ratio: 0.2, error: 0.0006, max_edge: 0.04 } } };
const SMALL = { cell: 0.0035, decimate: { ratio: 0.15, error: 0.0006, max_edge: 0.02 } };
islands.front = SMALL; islands.rear = SMALL; islands.dish = SMALL; islands.collar = SMALL; islands.lenses = SMALL;
const wheel = function (bone, side, zc, zh, tag) {
  const R = 0.12, N = 12, Rc = 0.1125, rc = 0.0075, X = 0.3 * side, isl = "wheel_" + tag;
  const P = function (id, p) { p.id = id + "_" + tag; p.bone = bone; p.island = isl; parts.push(p); };
  parts.push({ id: "arm_up_" + tag, shape: "capsule", a: [0.16 * side, 0.23, zh], b: [0.222 * side, 0.14, zc], radius: 0.011, bone: "root", color: STEEL });
  parts.push({ id: "arm_dn_" + tag, shape: "capsule", a: [0.16 * side, 0.2, zh], b: [0.222 * side, 0.105, zc], radius: 0.011, bone: "root", color: STEEL });
  P("stub", { shape: "cylinder", center: [0.235 * side, R, zc], axis: "x", radius: 0.04, half: 0.025, round: 0.008, color: STEEL });
  P("tyre", { shape: "cylinder", center: [X, R, zc], axis: "x", radius: 0.115, half: 0.05, round: 0.02, color: TYRE });
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 2, b = a + 0.3, c = [X, R + Rc * Math.cos(a), zc + Rc * Math.sin(a)], e = [R + Rc * Math.cos(b), zc + Rc * Math.sin(b)];
    P("cleat_o" + i, { shape: "capsule", a: c, b: [X + 0.043 * side, e[0], e[1]], radius: rc, color: TYRE });
    P("cleat_i" + i, { shape: "capsule", a: c, b: [X - 0.043 * side, e[0], e[1]], radius: rc, color: TYRE });
  }
  P("rim", { shape: "cylinder", center: [X, R, zc], axis: "x", radius: 0.086, half: 0.054, round: 0.006, color: RIM });
  P("hub", { shape: "cylinder", center: [X, R, zc], axis: "x", radius: 0.055, half: 0.057, round: 0.004, color: DARK });
  P("cap", { shape: "cylinder", center: [X, R, zc], axis: "x", radius: 0.022, half: 0.062, round: 0.006, color: STEEL });
  P("mark", { shape: "box", center: [X + 0.059 * side, R + 0.05, zc], half: [0.007, 0.036, 0.011], round: 0.002, color: ORANGE });
  islands[isl] = WHEEL;
};
wheel("wheel_f_l", 1, 0.35, 0.3, "f_l");
wheel("wheel_f_r", -1, 0.35, 0.3, "f_r");
wheel("wheel_b_l", 1, -0.35, -0.3, "b_l");
wheel("wheel_b_r", -1, -0.35, -0.3, "b_r");
const sdf = {
  cell: 0.007, skin: { falloff: 4 }, shade: { ao: 0.3, ao_radius: 0.02, tone: 0.25, color_blend: 0.2 }, decimate: { ratio: 0.03, error: 0.001, max_edge: 0.04 },
  islands: islands,
  parts: parts,
};
// PHYSICS: the machine in the physics world (soma_phys.cpp, js/shapes.js): a FEW shapes in the bind pose's model space, one rigid body for every NEAR instance. A crate that is thrown at it moves it, it pushes what it drives into; a trailer that is hit gives a share of the push to what tows it.
const physics = { mass: 40, shapes: [{ id: "hull", shape: "box", center: [0, 0.22, 0], half: [0.21, 0.1, 0.4], bone: "root" }] };
return {
  name: "rover", max: 16,
  family: { faction: "machine", kind: "vehicle", hp: 60 },
  nav: { agent: {"name":"rover","radius":0.55,"height":0.9,"step":0.12,"slope":30,"drop":0.3} },
  body: {
    skeleton: bones,
    rig: rig,
    body: body,
    vehicle: vehicle,
    couplers: couplers,
    roles: roles,
    traits: traits,
    physics: physics,
    sdf: sdf
  },
  abilities: ["walk", "effects"],
  interaction: { uses: [] },
  // PARTICLES (soma/js/fx.js): the rear wheels kick up a little dust (a tiny machine: the effect is a seventh of a truck's)
  particles: {
    dust_l: { effect: "wheel_dust", mount: { bone: "root", at: [0.3, -0.17, -0.45], dir: [0, 1, -0.5] }, loop: { while: "speed", from: 0.3, to: 3 }, scale: 0.15 },
    dust_r: { effect: "wheel_dust", mount: { bone: "root", at: [-0.3, -0.17, -0.45], dir: [0, 1, -0.5] }, loop: { while: "speed", from: 0.3, to: 3 }, scale: 0.15 }
  },
  mind: {
    hz: 10, far_hz: 3,
    blocks: [
      ["health", { hp: 60 }],
      ["flee", { speed: 4, distance: 10, gait: "" }],
      ["walk", { speed: 2.4, run_speed: 3.6, wp_near: 0.9, near: 1.1, stuck_time: 5 }],
      ["avoid", { radius: 0.45, length: 0.9, margin: 0.5, neighbours: 3, look: 2.0, brake: 3.0, other: 0.4, edge: 3, creep: 0.4, stop_gap: 0.8, push: 1.6, slow: 0.2, max_bend: 1, turn: 2.5, relax: 1.2, settle: 4, probe: 4, bodies: 8, boxed_wait: 6, ghost: 0, wait: 0.1, commit: 2, give_up: 8 }],
      ["drive", { top: 4, grip: 3, wheelbase: 0.7, max_steer: 0.5 }],
      ["wander", { speed: 2.4, pause_min: 2, pause_max: 6, near: 1.1 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "rover", select: [ld.node("flee"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
