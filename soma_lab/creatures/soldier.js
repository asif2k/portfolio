"use strict";
// soldier: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A soldier on patrol: walks a round of the places of the yard, and looks at whoever comes near.
// soldier: Soldier, a rifleman made for soma: an olive uniform, a helmet, a vest with pouches, a backpack and boots, a head that looks and a spine that breathes, two arms and two legs on ik chains, and a rifle that is a prop with three mounts (aim, ready, sling) the hands go to by their points. It takes the PACK firearm (ready, shoulder, aim, fire, burst, reload, sling, throw: procedural; a shot is a ray from the muzzle against the body of the creature it was fired at and tells the page `hit` with the damage or `miss`; the magazine is a number it keeps: `empty` and `reloaded` are told; a grenade is thrown by `throw`, told as `grenade`) and the PACK locomotion (a jump, hops, a crouch, dying in eight ways). Its own action: salute.
// ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, rig, legs, body, roles, physics, mesh | sdf }. Metres, +x to its left, +y up, +z forward.
// PORTED from soma2.0/creatures/soldier.js by soma/tools/port_creature.js (recipe soma/tools/port_recipes/soldier.js).
// THE FACE (the bones kept, named, given joints; the roles in `roles`):
//   - eye 'eye_l': the sdf's sphere on the bone, an island with a ball, an iris, a pupil, a socket in the head, an upper lid made ('lid_up_l': a dome over it that closes down about its centre); it looks the way the donor's bone's does [0, 0, 1]
//   - jaw 'jaw': from its hinge to its chin, opens 20 degrees
// LEFT OUT of the donor's file (the restart has no place for it):
//   - arms' `can` (rest_on, hold): 2 arms (the restart has no hands that rest or hold)
//   - the prop's mounts, holsters, grip points and actions ('gun'): the prop itself stays as the donor models it, a rigid piece on 'chest'
//   - actions: salute
//   - packs: firearm, locomotion
//   - limbs: {"avoid":true}
const bones = [
  { name: "hips", parent: null, head: [0, 0.95, 0], tail: [0, 1, 0] },
  { name: "spine", parent: "hips", head: [0, 1, 0], tail: [0, 1.15, 0] },
  { name: "chest", parent: "spine", head: [0, 1.15, 0], tail: [0, 1.4, 0] },
  { name: "gun", parent: "chest", head: [-0.07, 0.885, -0.25], tail: [-0.07, 1.615, -0.32] },
  { name: "neck", parent: "chest", head: [0, 1.4, 0], tail: [0, 1.5, 0.01] },
  { name: "head", parent: "neck", head: [0, 1.5, 0.01], tail: [0, 1.74, 0.03] },
  { name: "eye_l", parent: "head", head: [0.034, 1.64, 0.1065], tail: [0.034, 1.64, 0.12525], mirror: "x" },
  { name: "upper_l", parent: "chest", head: [0.2, 1.36, 0], tail: [0.26, 1.1, 0], mirror: "x" },
  { name: "fore_l", parent: "upper_l", head: [0.26, 1.1, 0], tail: [0.31, 0.85, 0], mirror: "x" },
  { name: "hand_l", parent: "fore_l", head: [0.31, 0.85, 0], tail: [0.315, 0.75, 0.01], mirror: "x" },
  { name: "thigh_l", parent: "hips", head: [0.1, 0.95, 0], tail: [0.105, 0.52, 0], mirror: "x" },
  { name: "shin_l", parent: "thigh_l", head: [0.105, 0.52, 0], tail: [0.105, 0.09, 0], mirror: "x" },
  { name: "foot_l", parent: "shin_l", head: [0.105, 0.09, 0], tail: [0.105, 0.06, 0.13], mirror: "x" },
  { name: "jaw", parent: "head", head: [0, 1.6, 0], tail: [0, 1.565, 0.116] },
  { name: "lid_up_l", parent: "head", head: [0.034, 1.64, 0.1065], tail: [0.034, 1.64, 0.12213], mirror: "x" },
];
const rig = {
  joints: [
    { bone: "thigh_l", kind: "ball", fwd: 75, back: 60, out: 40, in: 25, twist: [-25, 25] },
    { bone: "shin_l", kind: "hinge", axis: [1, 0, 0], range: [-6, 140] },
    { bone: "foot_l", kind: "ball", fwd: 45, back: 45, lat: 20, twist: 15 },
    { bone: "thigh_r", kind: "ball", fwd: 75, back: 60, out: 40, in: 25, twist: [-25, 25] },
    { bone: "shin_r", kind: "hinge", axis: [1, 0, 0], range: [-6, 140] },
    { bone: "foot_r", kind: "ball", fwd: 45, back: 45, lat: 20, twist: 15 },
    { bone: "upper_l", kind: "ball", fwd: 130, back: 60, out: 100, in: 40, twist: [-80, 80] },
    { bone: "fore_l", kind: "hinge", axis: [-0.973, -0.195, -0.126], range: [-6, 150] },
    { bone: "upper_r", kind: "ball", fwd: 130, back: 60, out: 100, in: 40, twist: [-80, 80] },
    { bone: "fore_r", kind: "hinge", axis: [-0.973, 0.195, 0.126], range: [-6, 150] },
    { bone: "spine", kind: "ball", fwd: 40, back: 25, lat: 25, twist: 30 },
    { bone: "chest", kind: "ball", fwd: 30, back: 20, lat: 25, twist: 30 },
    { bone: "neck", kind: "ball", fwd: 50, back: 50, lat: 40, twist: 60 },
    { bone: "head", kind: "ball", fwd: 35, back: 45, lat: 35, twist: 50 },
    { bone: "eye_l", kind: "ball", fwd: 35, back: 35, lat: 35, twist: [-10, 10] },
    { bone: "eye_r", kind: "ball", fwd: 35, back: 35, lat: 35, twist: [-10, 10] },
    { bone: "lid_up_l", kind: "hinge", axis: [1, 0, 0], range: [-20, 85] },
    { bone: "lid_up_r", kind: "hinge", axis: [1, 0, 0], range: [-20, 85] },
    { bone: "jaw", kind: "hinge", axis: [1, 0, 0], range: [-3, 20] },
  ],
  chains: [
    { name: "leg_l", solver: "limb", bones: ["thigh_l", "shin_l"], tip: "foot_l", pole: [0, 0, 1], pole_w: 1 },
    { name: "leg_r", solver: "limb", bones: ["thigh_r", "shin_r"], tip: "foot_r", pole: [0, 0, 1], pole_w: 1 },
    { name: "arm_l", solver: "limb", bones: ["upper_l", "fore_l"], pole: [0.25, -0.6, -1], pole_w: 1 },
    { name: "arm_r", solver: "limb", bones: ["upper_r", "fore_r"], pole: [-0.25, -0.6, -1], pole_w: 1 },
    { name: "head", bones: ["spine", "chest", "neck", "head"] },
  ],
};
const legs = { legs: ["leg_l", "leg_r"], gait: { from: "cmu_113_09_march", upper: { posture: 0.15 }, ride: 0.907 } };
const roles = { hips: "hips", spine: ["spine", "chest"], chest: "chest", neck: ["neck"], head: "head", arms: [{ chain: "arm_l", rest: [0.211, -0.977, 0] }, { chain: "arm_r", rest: [0.211, -0.977, 0] }], eyes: ["eye_l", "eye_r"], lids: [{ bone: "lid_up_l", dir: 1 }, { bone: "lid_up_r", dir: 1 }], jaw: { bone: "jaw", max: 20 } };
const physics = { mass: 95, shapes: [
    { id: "body", shape: "capsule", a: [0, 0.32, 0], b: [0, 1.3, 0], radius: 0.2, bone: "hips" },
    { id: "head", shape: "sphere", center: [0, 1.63, 0.02], radius: 0.115, bone: "head" },
    { id: "leg_l", shape: "capsule", a: [0.1, 0.855, 0], b: [0.105, 0.114, 0], radius: 0.081 },
    { id: "leg_r", shape: "capsule", a: [-0.1, 0.855, 0], b: [-0.105, 0.114, 0], radius: 0.081 },
  ] };
const parts = [
  { id: "pelvis", shape: "ellipsoid", center: [0, 0.97, 0], radii: [0.165, 0.11, 0.115], bone: "hips", blend: 0.03, color: [0.33, 0.38, 0.22, 1] },
  { id: "seat", shape: "ellipsoid", center: [0, 0.9, -0.01], radii: [0.185, 0.14, 0.13], bone: "hips", blend: 0.03, color: [0.33, 0.38, 0.22, 1] },
  { id: "belt", shape: "ellipsoid", center: [0, 1.035, 0.004], radii: [0.17, 0.028, 0.125], bone: "hips", blend: 0.008, color: [0.52, 0.47, 0.32, 1] },
  { id: "abdomen", shape: "ellipsoid", center: [0, 1.09, 0.004], radii: [0.15, 0.12, 0.105], bone: "spine", blend: 0.03, color: [0.33, 0.38, 0.22, 1] },
  { id: "chest", shape: "ellipsoid", center: [0, 1.27, 0.004], radii: [0.195, 0.17, 0.12], bone: "chest", blend: 0.035, color: [0.33, 0.38, 0.22, 1] },
  { id: "vest", shape: "ellipsoid", center: [0, 1.25, 0.03], radii: [0.2, 0.15, 0.125], bone: "chest", blend: 0.012, color: [0.22, 0.26, 0.17, 1] },
  { id: "pouch_a", shape: "box", center: [0.075, 1.17, 0.145], half: [0.04, 0.045, 0.02], round: 0.008, bone: "chest", blend: 0.006, color: [0.24, 0.28, 0.16, 1] },
  { id: "pouch_b", shape: "box", center: [-0.075, 1.17, 0.145], half: [0.04, 0.045, 0.02], round: 0.008, bone: "chest", blend: 0.006, color: [0.24, 0.28, 0.16, 1] },
  { id: "pouch_c", shape: "box", center: [0, 1.3, 0.15], half: [0.03, 0.03, 0.015], round: 0.006, bone: "chest", blend: 0.006, color: [0.24, 0.28, 0.16, 1] },
  { id: "pack", shape: "box", center: [0, 1.22, -0.17], half: [0.14, 0.18, 0.07], round: 0.03, bone: "chest", blend: 0.02, color: [0.52, 0.47, 0.32, 1] },
  { id: "pack_roll", shape: "cylinder", center: [0, 1.04, -0.17], axis: "x", radius: 0.045, half: 0.13, bone: "chest", blend: 0.01, color: [0.24, 0.28, 0.16, 1] },
  { id: "neck", shape: "capsule", a: [0, 1.4, 0], b: [0, 1.5, 0.012], radius: 0.056, bone: "neck", blend: 0.02, color: [0.8, 0.6, 0.47, 1] },
  { id: "skull", shape: "ellipsoid", center: [0, 1.625, 0.018], radii: [0.094, 0.113, 0.104], bone: "head", blend: 0.03, color: [0.8, 0.6, 0.47, 1] },
  { id: "jaw", shape: "ellipsoid", center: [0, 1.565, 0.05], radii: [0.068, 0.052, 0.066], bone: "jaw", blend: 0.03, color: [0.8, 0.6, 0.47, 1] },
  { id: "nose", shape: "sphere", center: [0, 1.602, 0.118], radius: 0.02, bone: "head", blend: 0.015, color: [0.8, 0.6, 0.47, 1] },
  { id: "ear_l", shape: "sphere", center: [0.094, 1.622, 0], radius: 0.024, bone: "head", mirror: "x", blend: 0.012, color: [0.8, 0.6, 0.47, 1] },
  { id: "brow", shape: "capsule", a: [-0.062, 1.655, 0.098], b: [0.062, 1.655, 0.098], radius: 0.015, bone: "head", blend: 0.015, color: [0.68, 0.49, 0.38, 1] },
  { id: "helmet", shape: "ellipsoid", center: [0, 1.685, -0.005], radii: [0.118, 0.087, 0.128], bone: "head", blend: 0.02, color: [0.3, 0.35, 0.21, 1] },
  { id: "helmet_rim", shape: "torus", center: [0, 1.668, -0.005], axis: "y", radius: 0.112, tube: 0.012, bone: "head", blend: 0.008, color: [0.24, 0.28, 0.16, 1] },
  { id: "strap_l", shape: "capsule", a: [0.092, 1.64, 0.02], b: [0.052, 1.545, 0.06], radius: 0.006, bone: "head", mirror: "x", blend: 0.004, color: [0.1, 0.1, 0.11, 1] },
  { id: "eye_l", shape: "sphere", center: [0.034, 1.64, 0.1065], radius: 0.0125, bone: "eye_l", mirror: "x", color: [0.93, 0.92, 0.88, 1], island: "eyes" },
  { id: "shoulder_l", shape: "sphere", center: [0.205, 1.345, 0], radius: 0.072, bone: "upper_l", mirror: "x", blend: 0.025, color: [0.33, 0.38, 0.22, 1] },
  { id: "sleeve_l", shape: "loft", bones: ["upper_l"], radii: [0.06, 0.05], mirror: "x", blend: 0.02, color: [0.33, 0.38, 0.22, 1] },
  { id: "elbow_l", shape: "sphere", center: [0.26, 1.1, 0], radius: 0.046, bone: "fore_l", mirror: "x", blend: 0.015, color: [0.33, 0.38, 0.22, 1] },
  { id: "arm_low_l", shape: "loft", bones: ["fore_l"], radii: [0.046, 0.036], mirror: "x", blend: 0.02, color: [0.33, 0.38, 0.22, 1] },
  { id: "glove_l", shape: "ellipsoid", center: [0.314, 0.775, 0.025], radii: [0.05, 0.065, 0.058], bone: "hand_l", mirror: "x", blend: 0.02, color: [0.12, 0.12, 0.12, 1] },
  { id: "thumb_l", shape: "ellipsoid", center: [0.348, 0.795, 0.04], radii: [0.018, 0.034, 0.022], bone: "hand_l", mirror: "x", blend: 0.012, color: [0.12, 0.12, 0.12, 1] },
  { id: "thigh_l", shape: "loft", bones: ["thigh_l"], radii: [0.095, 0.07], mirror: "x", blend: 0.02, color: [0.33, 0.38, 0.22, 1] },
  { id: "knee_l", shape: "sphere", center: [0.105, 0.52, 0.012], radius: 0.06, bone: "shin_l", mirror: "x", blend: 0.015, color: [0.24, 0.28, 0.16, 1] },
  { id: "shin_l", shape: "loft", bones: ["shin_l"], radii: [0.066, 0.05], mirror: "x", blend: 0.02, color: [0.33, 0.38, 0.22, 1] },
  { id: "boot_l", shape: "box", center: [0.105, 0.052, 0.04], half: [0.052, 0.045, 0.098], round: 0.03, bone: "foot_l", mirror: "x", blend: 0.012, color: [0.08, 0.07, 0.07, 1] },
  { id: "boot_top_l", shape: "cylinder", center: [0.105, 0.14, 0], axis: "y", radius: 0.052, half: 0.06, bone: "shin_l", mirror: "x", blend: 0.01, color: [0.08, 0.07, 0.07, 1] },
  { id: "gun_stock", island: "gun", shape: "box", center: [-0.07, 0.75, -0.3], half: [0.019, 0.09, 0.048], round: 0.01, bone: "gun", blend: 0.004, color: [0.1, 0.1, 0.11, 1] },
  { id: "gun_receiver", island: "gun", shape: "box", center: [-0.07, 0.995, -0.32], half: [0.025, 0.15, 0.036], round: 0.008, bone: "gun", blend: 0.004, color: [0.3, 0.31, 0.33, 1] },
  { id: "gun_grip", island: "gun", shape: "box", center: [-0.07, 0.89, -0.25], half: [0.016, 0.02, 0.044], round: 0.006, bone: "gun", blend: 0.004, color: [0.1, 0.1, 0.11, 1] },
  { id: "gun_mag", island: "gun", shape: "box", center: [-0.07, 1.065, -0.25], half: [0.014, 0.018, 0.05], round: 0.004, bone: "gun", blend: 0.004, color: [0.1, 0.1, 0.11, 1] },
  { id: "gun_guard", island: "gun", shape: "box", center: [-0.07, 1.245, -0.317], half: [0.027, 0.1, 0.03], round: 0.01, bone: "gun", blend: 0.004, color: [0.1, 0.1, 0.11, 1] },
  { id: "gun_barrel", island: "gun", shape: "cylinder", center: [-0.07, 1.485, -0.323], axis: "y", radius: 0.0115, half: 0.14, bone: "gun", blend: 0.004, color: [0.3, 0.31, 0.33, 1] },
  { id: "gun_brake", island: "gun", shape: "cylinder", center: [-0.07, 1.62, -0.323], axis: "y", radius: 0.016, half: 0.02, bone: "gun", blend: 0.004, color: [0.1, 0.1, 0.11, 1] },
  { id: "gun_sight", island: "gun", shape: "box", center: [-0.07, 1.045, -0.37], half: [0.004, 0.03, 0.012], bone: "gun", color: [0.1, 0.1, 0.11, 1] },
  { id: "gun_front", island: "gun", shape: "box", center: [-0.07, 1.545, -0.36], half: [0.003, 0.004, 0.018], bone: "gun", color: [0.1, 0.1, 0.11, 1] },
  { id: "eye_l_iris", shape: "sphere", center: [0.034, 1.64, 0.11213], radius: 0.0085, bone: "eye_l", island: "eyes", color: [0.33, 0.2, 0.09, 1], mirror: "x" },
  { id: "eye_l_pupil", shape: "sphere", center: [0.034, 1.64, 0.11838], radius: 0.00375, bone: "eye_l", island: "eyes", color: [0.02, 0.02, 0.02, 1], mirror: "x" },
  { id: "lid_up_l", shape: "sphere", center: [0.034, 1.64, 0.1065], radius: 0.01775, bone: "lid_up_l", island: "lids_up", color: [0.8, 0.6, 0.47, 1], mirror: "x" },
  { id: "lid_up_l_cut", shape: "box", center: [0.034, 1.61875, 0.1065], half: [0.02308, 0.025, 0.02308], op: "subtract", bone: "lid_up_l", island: "lids_up", mirror: "x" },
  { id: "eye_l_socket", shape: "sphere", center: [0.034, 1.64, 0.1065], radius: 0.014, op: "subtract", bone: "head", blend: 0.002, mirror: "x" },
];
const sdf = { cell: 0.012, adaptive: { min_cell: 0.006, max_cell: 0.024 }, shade: { ao: 0.45, ao_radius: 0.03, tone: 0.18, color_blend: 0.3 }, skin: { falloff: 1.5 }, islands: { gun: { cell: 0.004, adaptive: false, decimate: { ratio: 0.3 } }, eyes: { cell: 0.0014, adaptive: false, decimate: { ratio: 0.35 } }, lids_up: { cell: 0.003, adaptive: false, decimate: { ratio: 0.3 } } }, decimate: { ratio: 0.6 }, parts: parts };
return {
  name: "soldier", max: 16,
  family: { faction: "guard", kind: "person", hp: 100 },
  nav: { agent: "person" },
  body: {
    skeleton: bones,
    rig: rig,
    legs: legs,
    body: { gravity: 9.8, radius: 0.24, max_speed: 5, accel: 14, turn_rate: 7 },
    roles: roles,
    physics: physics,
    sdf: sdf
  },
  abilities: ["walk", "open", "climb", "effects"],
  interaction: { uses: [] },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 100 }],
      ["patrol", { points: [[8, -10], [-8, -10], [-8, -5], [8, -5]], pause_min: 1.5, pause_max: 3, speed: 1.4 }],
      "curious",
      "injured"
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "soldier", select: [ld.node("curious"), ld.node("patrol")] };
      return { tree: tree };
    }
  }
};
