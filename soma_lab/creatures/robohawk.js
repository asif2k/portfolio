"use strict";
// robohawk: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A mechanical hawk: flies its circuits, circles over prey, dives on a creature of another side and strikes, can be hurt.
// robohawk: Robohawk, a mechanical hawk: on the ground it walks from the CURVES of the bird bank (a pigeon's, a puffin's, a chough's, a parrot's and a rat's walks and runs, scaled to its legs and planted so that its feet do not slide), in the air it flies on soma's wing model (it banks to turn, climbs, dives, lands on open wings; its wings fold and beat by themselves) and the locomotion lets its legs go while it is in the air. `takeoff`, `land`, `screech`.
// ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, rig, legs, body, roles, physics, mesh | sdf }. Metres, +x to its left, +y up, +z forward.
// PORTED from soma2.0/creatures/robohawk.js by soma/tools/port_creature.js (recipe soma/tools/port_recipes/robohawk.js).
// THE FACE (the bones kept, named, given joints; the roles in `roles`):
//   - eye 'eye_l': the sdf's sphere on the bone, an island with a pupil; it looks the way the donor's bone's does [0, 0, 1]
//   - jaw 'jaw': from its hinge to its chin, opens 30 degrees
// LEFT OUT of the donor's file (the restart has no place for it):
//   - actions: takeoff, land, screech
//   - packs: curves_bird
//   - curves: `data` / `start` (the donor's curve banks and the actions that start)
//   - trait blink = 0 (not a trait of the restart)
//   - trait wander = 0.2 (not a trait of the restart)
const bones = [
  { name: "root", parent: null, head: [0, 0.3, -0.1], tail: [0, 0.32, 0.05] },
  { name: "chest", parent: "root", head: [0, 0.32, 0.05], tail: [0, 0.36, 0.18] },
  { name: "neck", parent: "chest", head: [0, 0.36, 0.18], tail: [0, 0.46, 0.26] },
  { name: "head", parent: "neck", head: [0, 0.46, 0.26], tail: [0, 0.48, 0.38] },
  { name: "jaw", parent: "head", head: [0, 0.455, 0.33], tail: [0, 0.428, 0.41] },
  { name: "eye_l", parent: "head", head: [0.042, 0.5, 0.35], tail: [0.042, 0.5, 0.374], mirror: "x" },
  { name: "wing_l", parent: "chest", head: [0.09, 0.39, 0.08], tail: [0.52, 0.41, 0.03], mirror: "x" },
  { name: "wing_tip_l", parent: "wing_l", head: [0.52, 0.41, 0.03], tail: [0.96, 0.43, -0.16], mirror: "x" },
  { name: "tail1", parent: "root", head: [0, 0.31, -0.12], tail: [0, 0.3, -0.42] },
  { name: "thigh_l", parent: "root", head: [0.07, 0.3, -0.02], tail: [0.078, 0.17, 0], mirror: "x" },
  { name: "shin_l", parent: "thigh_l", head: [0.078, 0.17, 0], tail: [0.078, 0.045, -0.025], mirror: "x" },
  { name: "foot_l", parent: "shin_l", head: [0.078, 0.045, -0.025], tail: [0.078, 0.03, 0.075], mirror: "x" },
];
const rig = {
  joints: [
    { bone: "thigh_l", kind: "ball", fwd: 75, back: 60, out: 40, in: 25, twist: [-25, 25] },
    { bone: "shin_l", kind: "hinge", axis: [0.985, 0.034, -0.171], range: [-26, 120] },
    { bone: "foot_l", kind: "ball", fwd: 45, back: 45, lat: 20, twist: 15 },
    { bone: "thigh_r", kind: "ball", fwd: 75, back: 60, out: 40, in: 25, twist: [-25, 25] },
    { bone: "shin_r", kind: "hinge", axis: [0.985, -0.034, 0.171], range: [-26, 120] },
    { bone: "foot_r", kind: "ball", fwd: 45, back: 45, lat: 20, twist: 15 },
    { bone: "chest", kind: "ball", fwd: 15, back: 15, lat: 20, twist: 20 },
    { bone: "neck", kind: "ball", fwd: 40, back: 40, lat: 50, twist: 50 },
    { bone: "head", kind: "ball", fwd: 40, back: 40, lat: 45, twist: 40 },
    { bone: "eye_l", kind: "ball", fwd: 35, back: 35, lat: 35, twist: [-10, 10] },
    { bone: "eye_r", kind: "ball", fwd: 35, back: 35, lat: 35, twist: [-10, 10] },
    { bone: "jaw", kind: "hinge", axis: [1, 0, 0], range: [-3, 30] },
  ],
  chains: [
    { name: "leg_l", solver: "limb", bones: ["thigh_l", "shin_l"], tip: "foot_l", pole: [0.172, -0.014, 0.985], pole_w: 1 },
    { name: "leg_r", solver: "limb", bones: ["thigh_r", "shin_r"], tip: "foot_r", pole: [-0.172, -0.014, 0.985], pole_w: 1 },
    { name: "head", bones: ["chest", "neck", "head"] },
  ],
};
const legs = { legs: ["leg_l", "leg_r"], gait: { from: "pigeon_walk", ride: 0.291 } };
const flight = { model: "wing", stall_speed: 4.5, cruise_speed: 8, max_speed: 16, thrust: 0.6, max_bank: 1.1, max_pitch: 0.7, pivot: 0.3, clearance: 1.5 };
const wings = { wings: [{ bone: "wing_l", tip: "wing_tip_l", mirror: "x" }], fold: 80, tip_fold: 25, droop: 10, amplitude: 28, tip_amplitude: 22, hz: 3.5, climb_hz: 1.5, speed_hz: 1, sink: 1.8, flare: 0.6 };
const roles = { hips: "root", spine: ["chest"], chest: "chest", neck: ["neck"], head: "head", eyes: ["eye_l", "eye_r"], jaw: { bone: "jaw", max: 30 }, tail: ["tail1"] };
const physics = { mass: 1.4, shapes: [
    { id: "body", shape: "sphere", center: [0, 0.31, 0], radius: 0.15, bone: "root" },
    { id: "leg_l", shape: "capsule", a: [0.07, 0.27, -0.02], b: [0.078, 0.036, -0.025], radius: 0.026 },
    { id: "leg_r", shape: "capsule", a: [-0.07, 0.27, -0.02], b: [-0.078, 0.036, -0.025], radius: 0.026 },
  ] };
const parts = [
  { id: "body", shape: "ellipsoid", center: [0, 0.31, -0.02], radii: [0.105, 0.1, 0.2], bone: "root", blend: 0.04, color: [0.5, 0.53, 0.58, 1] },
  { id: "breast", shape: "ellipsoid", center: [0, 0.31, 0.12], radii: [0.09, 0.09, 0.1], bone: "chest", blend: 0.035, color: [0.85, 0.87, 0.9, 1] },
  { id: "back_plate", shape: "box", center: [0, 0.4, -0.02], half: [0.08, 0.012, 0.15], round: 0.01, bone: "root", blend: 0.01, color: [0.3, 0.32, 0.37, 1] },
  { id: "neck", shape: "loft", bones: ["neck"], radii: [0.055, 0.045], blend: 0.02, color: [0.08, 0.08, 0.1, 1] },
  { id: "skull", shape: "ellipsoid", center: [0, 0.48, 0.3], radii: [0.055, 0.052, 0.075], bone: "head", blend: 0.02, color: [0.5, 0.53, 0.58, 1] },
  { id: "beak_up", shape: "capsule", a: [0, 0.47, 0.35], b: [0, 0.44, 0.43], ra: 0.026, rb: 0.007, bone: "head", blend: 0.006, color: [0.85, 0.65, 0.18, 1] },
  { id: "beak_low", shape: "capsule", a: [0, 0.445, 0.34], b: [0, 0.428, 0.41], ra: 0.016, rb: 0.006, bone: "jaw", blend: 0.005, color: [0.85, 0.65, 0.18, 1] },
  { id: "eye_l", shape: "sphere", center: [0.042, 0.5, 0.35], radius: 0.016, bone: "eye_l", mirror: "x", color: [0.9, 0.12, 0.08, 1], island: "eyes" },
  { id: "brow_l", shape: "box", center: [0.045, 0.527, 0.34], half: [0.014, 0.006, 0.03], round: 0.004, bone: "head", mirror: "x", color: [0.3, 0.32, 0.37, 1] },
  { id: "wing_l", shape: "ellipsoid", center: [0.29, 0.41, 0.035], radii: [0.22, 0.012, 0.1], bone: "wing_l", mirror: "x", blend: 0.01, blend_mode: "cubic", color: [0.5, 0.53, 0.58, 1] },
  { id: "wing_lead_l", shape: "capsule", a: [0.1, 0.405, 0.1], b: [0.5, 0.415, 0.08], radius: 0.014, bone: "wing_l", mirror: "x", color: [0.3, 0.32, 0.37, 1] },
  { id: "wing_tip_l", shape: "ellipsoid", center: [0.74, 0.425, -0.065], radii: [0.22, 0.01, 0.065], bone: "wing_tip_l", mirror: "x", blend: 0.01, blend_mode: "cubic", color: [0.3, 0.32, 0.37, 1] },
  { id: "wing_end_l", shape: "ellipsoid", center: [0.9, 0.43, -0.12], radii: [0.07, 0.008, 0.04], bone: "wing_tip_l", mirror: "x", blend: 0.008, color: [0.12, 0.13, 0.16, 1] },
  { id: "tail", shape: "ellipsoid", center: [0, 0.305, -0.3], radii: [0.075, 0.01, 0.15], bone: "tail1", blend: 0.01, blend_mode: "cubic", color: [0.5, 0.53, 0.58, 1] },
  { id: "tail_tip", shape: "ellipsoid", center: [0, 0.3, -0.43], radii: [0.06, 0.008, 0.03], bone: "tail1", color: [0.12, 0.13, 0.16, 1] },
  { id: "thigh_l", shape: "loft", bones: ["thigh_l"], radii: [0.036, 0.022], mirror: "x", blend: 0.012, color: [0.3, 0.32, 0.37, 1] },
  { id: "shin_l", shape: "loft", bones: ["shin_l"], radii: [0.02, 0.014], mirror: "x", blend: 0.008, color: [0.85, 0.65, 0.18, 1] },
  { id: "foot_l", shape: "loft", bones: ["foot_l"], radii: [0.016, 0.012], mirror: "x", blend: 0.006, color: [0.85, 0.65, 0.18, 1] },
  { id: "claw_l", shape: "capsule", a: [0.078, 0.035, 0.07], b: [0.078, 0.01, 0.12], ra: 0.011, rb: 0.003, bone: "foot_l", mirror: "x", color: [0.12, 0.13, 0.16, 1] },
  { id: "eye_l_pupil", shape: "sphere", center: [0.042, 0.5, 0.3628], radius: 0.0064, bone: "eye_l", island: "eyes", color: [0.08, 0.02, 0.02, 1], mirror: "x" },
];
const sdf = { cell: 0.0055, shade: { ao: 0.5, ao_radius: 0.02, tone: 0.2, color_blend: 0.4 }, skin: { falloff: 1 }, decimate: { ratio: 0.25 }, islands: { eyes: { cell: 0.0023, adaptive: false, decimate: { ratio: 0.35 } } }, parts: parts };
return {
  name: "robohawk", max: 16,
  family: { faction: "machine", kind: "raptor", hp: 60 },
  nav: { agent: {"name":"robohawk","radius":0.6,"height":0.8,"step":0.1,"slope":25,"drop":0.5} },
  body: {
    skeleton: bones,
    rig: rig,
    legs: legs,
    body: { gravity: 9.8, radius: 0.2, max_speed: 2.5 },
    roles: roles,
    flight: flight,
    wings: wings,
    traits: { breath: 0.1 },
    physics: physics,
    sdf: sdf
  },
  abilities: ["fly", "effects"],
  interaction: { uses: [] },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 60 }],
      ["dive", { sight: 70, dive_speed: 16, damage: 20, alt: 24, cooldown: 10 }],
      ["orbit", { group: "mannequin", alt: 24, radius: 16, speed: 8, sight: 120 }],
      ["fly", { alt: 22, cruise: 9, climb: 4, sink: 3, legs: 3, min_leg: 20, roam: 90, near: 6, rest_min: 8, rest_max: 20, land_zone: "pads" }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "robohawk", select: [ld.node("dive"), ld.node("orbit"), ld.node("fly")] };
      return { tree: tree };
    }
  }
};
