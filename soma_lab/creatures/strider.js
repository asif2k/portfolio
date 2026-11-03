"use strict";
// strider: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A six legged tripod walker: walks a round of the places of the yard, looks at whatever comes near.
// strider: Strider, a six legged tripod walker made for soma: an armoured hull with an engine glowing at the back, a sensor dome that turns to look, one red eye under an iris lid, a mast that springs, and six ik legs that walk in two tripods, with a walk and a run. Collision shapes: the hull and the dome.
// ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, rig, legs, body, roles, physics, mesh | sdf }. Metres, +x to its left, +y up, +z forward.
// PORTED from soma2.0/creatures/strider.js by soma/tools/port_creature.js (recipe soma/tools/port_recipes/strider.js).
// THE FACE (the bones kept, named, given joints; the roles in `roles`):
//   - eye 'eye_c': the sdf's sphere on the bone, an island with a pupil; it looks the way the donor's bone's does [0, 0, 1]
//   - lid 'lid_up_c' (upper): turns about the centre of 'eye_c'
//   - appendages: 'ant1' > 'ant2' (follow)
const bones = [
  { name: "root", parent: null, head: [0, 0.34, -0.06], tail: [0, 0.36, 0.08] },
  { name: "dome", parent: "root", head: [0, 0.4, 0.06], tail: [0, 0.5, 0.08] },
  { name: "eye_c", parent: "dome", head: [0, 0.455, 0.14], tail: [0, 0.455, 0.194] },
  { name: "lid_up_c", parent: "dome", head: [0, 0.455, 0.14], tail: [0, 0.455, 0.185] },
  { name: "ant1", parent: "dome", head: [0, 0.545, 0], tail: [0, 0.62, 0] },
  { name: "ant2", parent: "ant1", head: [0, 0.62, 0], tail: [0, 0.7, 0] },
  { name: "thigh_f_l", parent: "root", head: [0.14, 0.34, 0.22], tail: [0.38, 0.5, 0.25], mirror: "x" },
  { name: "shin_f_l", parent: "thigh_f_l", head: [0.38, 0.5, 0.25], tail: [0.52, 0.03, 0.29], mirror: "x" },
  { name: "foot_f_l", parent: "shin_f_l", head: [0.52, 0.03, 0.29], tail: [0.52, 0.03, 0.34], mirror: "x" },
  { name: "thigh_m_l", parent: "root", head: [0.14, 0.34, 0], tail: [0.38, 0.5, 0.03], mirror: "x" },
  { name: "shin_m_l", parent: "thigh_m_l", head: [0.38, 0.5, 0.03], tail: [0.52, 0.03, 0.07], mirror: "x" },
  { name: "foot_m_l", parent: "shin_m_l", head: [0.52, 0.03, 0.07], tail: [0.52, 0.03, 0.12], mirror: "x" },
  { name: "thigh_b_l", parent: "root", head: [0.14, 0.34, -0.22], tail: [0.38, 0.5, -0.19], mirror: "x" },
  { name: "shin_b_l", parent: "thigh_b_l", head: [0.38, 0.5, -0.19], tail: [0.52, 0.03, -0.15], mirror: "x" },
  { name: "foot_b_l", parent: "shin_b_l", head: [0.52, 0.03, -0.15], tail: [0.52, 0.03, -0.1], mirror: "x" },
];
const rig = {
  joints: [
    { bone: "thigh_f_l", kind: "ball", fwd: 75, back: 60, out: 40, in: 25, twist: [-25, 25] },
    { bone: "shin_f_l", kind: "hinge", axis: [0.15, -0.039, -0.988], range: [-112, 34] },
    { bone: "foot_f_l", kind: "ball", fwd: 45, back: 45, lat: 20, twist: 15 },
    { bone: "thigh_f_r", kind: "ball", fwd: 75, back: 60, out: 40, in: 25, twist: [-25, 25] },
    { bone: "shin_f_r", kind: "hinge", axis: [0.15, 0.039, 0.988], range: [-112, 34] },
    { bone: "foot_f_r", kind: "ball", fwd: 45, back: 45, lat: 20, twist: 15 },
    { bone: "thigh_m_l", kind: "ball", fwd: 75, back: 60, out: 40, in: 25, twist: [-25, 25] },
    { bone: "shin_m_l", kind: "hinge", axis: [0.15, -0.039, -0.988], range: [-112, 34] },
    { bone: "foot_m_l", kind: "ball", fwd: 45, back: 45, lat: 20, twist: 15 },
    { bone: "thigh_m_r", kind: "ball", fwd: 75, back: 60, out: 40, in: 25, twist: [-25, 25] },
    { bone: "shin_m_r", kind: "hinge", axis: [0.15, 0.039, 0.988], range: [-112, 34] },
    { bone: "foot_m_r", kind: "ball", fwd: 45, back: 45, lat: 20, twist: 15 },
    { bone: "thigh_b_l", kind: "ball", fwd: 75, back: 60, out: 40, in: 25, twist: [-25, 25] },
    { bone: "shin_b_l", kind: "hinge", axis: [0.15, -0.039, -0.988], range: [-112, 34] },
    { bone: "foot_b_l", kind: "ball", fwd: 45, back: 45, lat: 20, twist: 15 },
    { bone: "thigh_b_r", kind: "ball", fwd: 75, back: 60, out: 40, in: 25, twist: [-25, 25] },
    { bone: "shin_b_r", kind: "hinge", axis: [0.15, 0.039, 0.988], range: [-112, 34] },
    { bone: "foot_b_r", kind: "ball", fwd: 45, back: 45, lat: 20, twist: 15 },
    { bone: "dome", kind: "ball", fwd: 40, back: 40, lat: 45, twist: 40 },
    { bone: "eye_c", kind: "ball", fwd: 35, back: 35, lat: 35, twist: [-10, 10] },
    { bone: "lid_up_c", kind: "hinge", axis: [1, 0, 0], range: [-20, 85] },
    { bone: "ant1", kind: "ball", fwd: 35, back: 35, lat: 35, twist: 15 },
    { bone: "ant2", kind: "ball", fwd: 35, back: 35, lat: 35, twist: 15 },
  ],
  chains: [
    { name: "leg_f_l", solver: "limb", bones: ["thigh_f_l", "shin_f_l"], tip: "foot_f_l", pole: [0.624, 0.779, 0.063], pole_w: 1 },
    { name: "leg_f_r", solver: "limb", bones: ["thigh_f_r", "shin_f_r"], tip: "foot_f_r", pole: [-0.624, 0.779, 0.063], pole_w: 1 },
    { name: "leg_m_l", solver: "limb", bones: ["thigh_m_l", "shin_m_l"], tip: "foot_m_l", pole: [0.624, 0.779, 0.063], pole_w: 1 },
    { name: "leg_m_r", solver: "limb", bones: ["thigh_m_r", "shin_m_r"], tip: "foot_m_r", pole: [-0.624, 0.779, 0.063], pole_w: 1 },
    { name: "leg_b_l", solver: "limb", bones: ["thigh_b_l", "shin_b_l"], tip: "foot_b_l", pole: [0.624, 0.779, 0.063], pole_w: 1 },
    { name: "leg_b_r", solver: "limb", bones: ["thigh_b_r", "shin_b_r"], tip: "foot_b_r", pole: [-0.624, 0.779, 0.063], pole_w: 1 },
    { name: "head", bones: ["dome"] },
  ],
};
const legs = { legs: ["leg_f_l", "leg_f_r", "leg_m_l", "leg_m_r", "leg_b_l", "leg_b_r"], gait: { speed: 0.7, stride: 0.22, swing: 0.5, step_height: 0.07, bob: 0.004 } };
const roles = { hips: "root", chest: "root", head: "dome", eyes: ["eye_c"], lids: [{ bone: "lid_up_c", dir: 1 }], appendages: [{ bones: ["ant1", "ant2"], kind: "follow" }] };
const physics = { mass: 400, shapes: [
    { id: "hull", shape: "capsule", a: [0, 0.34, -0.15], b: [0, 0.34, 0.15], radius: 0.18, bone: "root" },
    { id: "dome", shape: "sphere", center: [0, 0.46, 0.065], radius: 0.1, bone: "dome" },
    { id: "leg_f_l", shape: "capsule", a: [0.14, 0.306, 0.22], b: [0.52, 0.041, 0.29], radius: 0.029 },
    { id: "leg_f_r", shape: "capsule", a: [-0.14, 0.306, 0.22], b: [-0.52, 0.041, 0.29], radius: 0.029 },
    { id: "leg_m_l", shape: "capsule", a: [0.14, 0.306, 0], b: [0.52, 0.041, 0.07], radius: 0.029 },
    { id: "leg_m_r", shape: "capsule", a: [-0.14, 0.306, 0], b: [-0.52, 0.041, 0.07], radius: 0.029 },
    { id: "leg_b_l", shape: "capsule", a: [0.14, 0.306, -0.22], b: [0.52, 0.041, -0.15], radius: 0.029 },
    { id: "leg_b_r", shape: "capsule", a: [-0.14, 0.306, -0.22], b: [-0.52, 0.041, -0.15], radius: 0.029 },
  ] };
const parts = [
  { id: "hull", shape: "ellipsoid", center: [0, 0.34, 0], radii: [0.17, 0.08, 0.27], bone: "root", blend: 0.03, blend_mode: "cubic", color: [0.3, 0.33, 0.38, 1] },
  { id: "plate", shape: "ellipsoid", center: [0, 0.385, -0.02], radii: [0.125, 0.04, 0.2], bone: "root", blend: 0.02, blend_mode: "cubic", color: [0.52, 0.56, 0.62, 1] },
  { id: "belly", shape: "ellipsoid", center: [0, 0.29, 0], radii: [0.13, 0.04, 0.22], bone: "root", blend: 0.02, color: [0.1, 0.11, 0.13, 1] },
  { id: "nose", shape: "ellipsoid", center: [0, 0.35, 0.24], radii: [0.09, 0.05, 0.06], bone: "root", blend: 0.025, color: [0.3, 0.33, 0.38, 1] },
  { id: "engine", shape: "cylinder", center: [0, 0.345, -0.28], axis: "z", radius: 0.07, half: 0.04, round: 0.015, bone: "root", blend: 0.012, color: [0.1, 0.11, 0.13, 1] },
  { id: "glow", shape: "sphere", center: [0, 0.345, -0.325], radius: 0.045, bone: "root", color: [0.95, 0.45, 0.1, 1] },
  { id: "fin_l", shape: "box", center: [0.11, 0.4, -0.12], half: [0.008, 0.035, 0.06], round: 0.004, bone: "root", mirror: "x", color: [0.52, 0.56, 0.62, 1] },
  { id: "dome", shape: "sphere", center: [0, 0.46, 0.065], radius: 0.095, bone: "dome", blend: 0.02, color: [0.7, 0.73, 0.78, 1] },
  { id: "ring", shape: "torus", center: [0, 0.405, 0.065], axis: "y", radius: 0.09, tube: 0.014, bone: "dome", color: [0.1, 0.11, 0.13, 1] },
  { id: "eye", shape: "sphere", center: [0, 0.455, 0.14], radius: 0.036, bone: "eye_c", color: [1, 0.18, 0.1, 1], island: "eyes" },
  { id: "iris", shape: "ellipsoid", center: [0, 0.484, 0.138], radii: [0.042, 0.022, 0.042], bone: "lid_up_c", color: [0.1, 0.11, 0.13, 1], island: "lids" },
  { id: "antenna", shape: "loft", bones: ["ant1", "ant2"], radii: [0.011, 0.008, 0.006], color: [0.7, 0.73, 0.78, 1] },
  { id: "bulb", shape: "sphere", center: [0, 0.715, 0], radius: 0.017, bone: "ant2", color: [1, 0.18, 0.1, 1] },
  { id: "hip_f", shape: "sphere", center: [0.14, 0.34, 0.22], radius: 0.05, bone: "thigh_f_l", mirror: "x", blend: 0.02, color: [0.1, 0.11, 0.13, 1] },
  { id: "thigh_f", shape: "loft", bones: ["thigh_f_l"], radii: [0.042, 0.032], mirror: "x", blend: 0.012, color: [0.3, 0.33, 0.38, 1] },
  { id: "knee_f", shape: "sphere", center: [0.38, 0.5, 0.25], radius: 0.04, bone: "shin_f_l", mirror: "x", blend: 0.012, color: [0.1, 0.11, 0.13, 1] },
  { id: "shin_f", shape: "loft", bones: ["shin_f_l"], radii: [0.03, 0.012], mirror: "x", blend: 0.01, color: [0.52, 0.56, 0.62, 1] },
  { id: "foot_f", shape: "sphere", center: [0.52, 0.028, 0.31], radius: 0.028, bone: "foot_f_l", mirror: "x", blend: 0.008, color: [0.1, 0.11, 0.13, 1] },
  { id: "hip_m", shape: "sphere", center: [0.14, 0.34, 0], radius: 0.05, bone: "thigh_m_l", mirror: "x", blend: 0.02, color: [0.1, 0.11, 0.13, 1] },
  { id: "thigh_m", shape: "loft", bones: ["thigh_m_l"], radii: [0.042, 0.032], mirror: "x", blend: 0.012, color: [0.3, 0.33, 0.38, 1] },
  { id: "knee_m", shape: "sphere", center: [0.38, 0.5, 0.03], radius: 0.04, bone: "shin_m_l", mirror: "x", blend: 0.012, color: [0.1, 0.11, 0.13, 1] },
  { id: "shin_m", shape: "loft", bones: ["shin_m_l"], radii: [0.03, 0.012], mirror: "x", blend: 0.01, color: [0.52, 0.56, 0.62, 1] },
  { id: "foot_m", shape: "sphere", center: [0.52, 0.028, 0.09], radius: 0.028, bone: "foot_m_l", mirror: "x", blend: 0.008, color: [0.1, 0.11, 0.13, 1] },
  { id: "hip_b", shape: "sphere", center: [0.14, 0.34, -0.22], radius: 0.05, bone: "thigh_b_l", mirror: "x", blend: 0.02, color: [0.1, 0.11, 0.13, 1] },
  { id: "thigh_b", shape: "loft", bones: ["thigh_b_l"], radii: [0.042, 0.032], mirror: "x", blend: 0.012, color: [0.3, 0.33, 0.38, 1] },
  { id: "knee_b", shape: "sphere", center: [0.38, 0.5, -0.19], radius: 0.04, bone: "shin_b_l", mirror: "x", blend: 0.012, color: [0.1, 0.11, 0.13, 1] },
  { id: "shin_b", shape: "loft", bones: ["shin_b_l"], radii: [0.03, 0.012], mirror: "x", blend: 0.01, color: [0.52, 0.56, 0.62, 1] },
  { id: "foot_b", shape: "sphere", center: [0.52, 0.028, -0.13], radius: 0.028, bone: "foot_b_l", mirror: "x", blend: 0.008, color: [0.1, 0.11, 0.13, 1] },
  { id: "eye_pupil", shape: "sphere", center: [0, 0.455, 0.1688], radius: 0.0144, bone: "eye_c", island: "eyes", color: [0.08, 0.02, 0.02, 1] },
];
const sdf = { cell: 0.0065, shade: { ao: 0.5, ao_radius: 0.03, tone: 0.2, color_blend: 0.3 }, decimate: { ratio: 0.2 }, islands: { eyes: { cell: 0.0051, adaptive: false, decimate: { ratio: 0.35 } }, lids: { cell: 0.0051, adaptive: false, decimate: { ratio: 0.4 } } }, parts: parts };
return {
  name: "strider", max: 16,
  family: { faction: "machine", kind: "mech", hp: 200 },
  nav: { agent: {"name":"strider","radius":0.9,"height":1.4,"step":0.3,"slope":35,"drop":0.5} },
  body: {
    skeleton: bones,
    rig: rig,
    legs: legs,
    body: { gravity: 9.8, radius: 0.32, max_speed: 2.6 },
    roles: roles,
    physics: physics,
    sdf: sdf
  },
  abilities: ["walk", "effects"],
  interaction: { uses: [] },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 200 }],
      "curious",
      ["patrol", { zones: ["yard"], pause_min: 2, pause_max: 5, speed: 1.1 }],
      ["wander", { speed: 1 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "strider", select: [ld.node("curious"), ld.node("patrol"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
