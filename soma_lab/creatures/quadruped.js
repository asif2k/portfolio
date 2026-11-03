"use strict";
// quadruped: in soma's one form of a creature file (soma/creature_file.js): `body` is the creature as it was made, the rest is who it is to the others (family, nav, abilities) and its mind: the blocks of soma/world/blocks/ it loads by name and
// its tree. The old worker of this file is left out; the mind below is the default of a creature of its kind (animal): write the creature's own in `mind`.
// ---- the body: bone i of a run goes from points[i] to points[i + 1] and hangs from the one before (the first from `parent`); `mirror` writes the right-hand twin of a run whose names end in _l
var bones = [];
function run(parent, names, points, mirror) {
  names.forEach(function (name, i) {
    var b = { name: name, parent: i === 0 ? parent : names[i - 1], head: points[i], tail: points[i + 1] };
    if (mirror) b.mirror = "x";
    bones.push(b);
  });
}
run(null, ["root", "spine1", "spine2", "spine3", "spine4"], [[0, 0.6464, -0.2651], [0, 0.6324, -0.1218], [0, 0.6255, 0.022], [0, 0.6258, 0.1659], [0, 0.6332, 0.3097], [0, 0.6718, 0.3978]]);
run("spine4", ["neck1", "neck2"], [[0, 0.6718, 0.3978], [0, 0.7069, 0.4931], [0, 0.7299, 0.5877]]);
run("neck2", ["head"], [[0, 0.7299, 0.5877], [0, 0.745, 0.79]]);
run("head", ["jaw"], [[0, 0.705, 0.665], [0, 0.61, 0.805]]);
run("head", ["ear_l"], [[0.05, 0.79, 0.63], [0.07, 0.875, 0.61]], true);
run("root", ["tail1", "tail2", "tail3", "tail4", "tail5"], [[0, 0.70, -0.33], [0, 0.695, -0.42], [0, 0.665, -0.52], [0, 0.615, -0.60], [0, 0.555, -0.66], [0, 0.49, -0.70]]);
run("spine4", ["fore_thigh_l", "fore_shin_l", "fore_cannon_l", "fore_foot_l"], [[0.1105, 0.5476, 0.3615], [0.1105, 0.34995, 0.30246], [0.1105, 0.14132, 0.31648], [0.1105, 0.04396, 0.33863], [0.1105, 0.02861, 0.36574]], true);
run("root", ["hind_thigh_l", "hind_shin_l", "hind_cannon_l", "hind_foot_l"], [[0.1105, 0.6158, -0.3124], [0.1105, 0.37233, -0.28859], [0.1105, 0.20213, -0.3899], [0.1105, 0.04793, -0.33863], [0.1105, 0.03559, -0.31079]], true);

var ball = function (bone, fwd, back, lat, twist, mirror) { var j = { bone: bone, kind: "ball", fwd: fwd, back: back, lat: lat, twist: twist }; if (mirror) j.mirror = "x"; return j; };
var rig = {                                                                                          // FABRIK for the spine, the neck and the head (one chain) and for the tail, a three-bone leg solver (`z_leg`) for each of the four legs
  joints: [
    { bone: "fore_thigh_l", kind: "ball", fwd: 70, back: 60, out: 30, in: 20, twist: 20, mirror: "x" },
    { bone: "fore_shin_l", kind: "hinge", axis: [-1, 0, 0], range: [-26, 120], mirror: "x" },
    { bone: "fore_cannon_l", kind: "hinge", axis: [-1, 0, 0], range: [-15, 106], mirror: "x" },
    ball("fore_foot_l", 30, 30, 15, 15, true),
    { bone: "hind_thigh_l", kind: "ball", fwd: 70, back: 60, out: 30, in: 20, twist: 20, mirror: "x" },
    { bone: "hind_shin_l", kind: "hinge", axis: [1, 0, 0], range: [-42, 104], mirror: "x" },
    { bone: "hind_cannon_l", kind: "hinge", axis: [-1, 0, 0], range: [-55, 66], mirror: "x" },
    ball("hind_foot_l", 30, 30, 15, 15, true),
    ball("spine1", 15, 15, 20, 20), ball("spine2", 15, 15, 20, 20), ball("spine3", 15, 15, 20, 20), ball("spine4", 15, 15, 20, 20),
    ball("neck1", 50, 40, 45, 25), ball("neck2", 50, 40, 45, 25), ball("head", 40, 40, 45, 40),
    { bone: "jaw", kind: "hinge", axis: [1, 0, 0], range: [-3, 35] },
    ball("ear_l", 45, 55, 35, 25, true),
    ball("tail1", 40, 40, 45, 20), ball("tail2", 40, 40, 45, 20), ball("tail3", 40, 40, 45, 20), ball("tail4", 40, 40, 45, 20), ball("tail5", 40, 40, 45, 20)
  ],
  chains: [
    { name: "fore_l", mirror: "x", solver: "z_leg", bones: ["fore_thigh_l", "fore_shin_l", "fore_cannon_l"], tip: "fore_foot_l", pole: [0, 0.045, -0.999], pole_w: 1 },
    { name: "hind_l", mirror: "x", solver: "z_leg", bones: ["hind_thigh_l", "hind_shin_l", "hind_cannon_l"], tip: "hind_foot_l", pole: [0, -0.046, 0.999], pole_w: 1 },
    { name: "head", bones: ["spine1", "spine2", "spine3", "spine4", "neck1", "neck2", "head"] },
    { name: "tail", bones: ["tail1", "tail2", "tail3", "tail4", "tail5"] }
  ]
};

// the mesh (the mesher's grammar: soma/SOMA_MESHER.md): a coat of one colour, a lighter chest and belly, dark socks, ears and snout
var COAT = [0.62, 0.44, 0.26, 1], DARK = [0.28, 0.2, 0.13, 1], LIGHT = [0.88, 0.8, 0.66, 1], NOSE = [0.07, 0.06, 0.06, 1], EYE = [0.1, 0.07, 0.04, 1];
var parts = [
  { id: "torso", shape: "loft", bones: ["root", "spine1", "spine2", "spine3", "spine4"], radii: [0.115, 0.12, 0.115, 0.125, 0.14, 0.12], radii_v: [0.125, 0.13, 0.135, 0.15, 0.16, 0.13], blend: 0.04, blend_mode: "cubic", color: COAT },
  { id: "belly", shape: "ellipsoid", center: [0, 0.5, 0.05], radii: [0.075, 0.05, 0.27], bone: "spine2", blend: 0.05, blend_mode: "cubic", color: LIGHT },
  { id: "chest", shape: "ellipsoid", center: [0, 0.54, 0.31], radii: [0.09, 0.1, 0.1], bone: "spine4", blend: 0.05, blend_mode: "cubic", color: LIGHT },
  { id: "neck", shape: "loft", bones: ["neck1", "neck2"], radii: [0.085, 0.07, 0.06], radii_v: [0.09, 0.075, 0.065], blend: 0.04, blend_mode: "cubic", color: COAT },
  { id: "skull", shape: "ellipsoid", center: [0, 0.745, 0.65], radii: [0.075, 0.075, 0.095], bone: "head", blend: 0.035, blend_mode: "cubic", color: COAT },
  { id: "snout", shape: "ellipsoid", center: [0, 0.715, 0.765], radii: [0.042, 0.036, 0.09], bone: "head", blend: 0.03, blend_mode: "cubic", color: DARK },
  { id: "nose", shape: "sphere", center: [0, 0.725, 0.855], radius: 0.02, bone: "head", blend: 0.008, color: NOSE },
  { id: "jaw", shape: "ellipsoid", center: [0, 0.68, 0.74], radii: [0.036, 0.026, 0.08], bone: "jaw", blend: 0.03, blend_mode: "cubic", color: DARK },
  { id: "eye", shape: "sphere", center: [0.046, 0.77, 0.72], radius: 0.013, bone: "head", mirror: "x", blend: 0.004, color: EYE },
  { id: "ear", shape: "ellipsoid", center: [0.062, 0.835, 0.62], radii: [0.018, 0.048, 0.03], bone: "ear_l", mirror: "x", blend: 0.012, blend_mode: "cubic", color: DARK },
  { id: "tail", shape: "loft", bones: ["tail1", "tail2", "tail3", "tail4", "tail5"], radii: [0.045, 0.042, 0.038, 0.032, 0.024, 0.012], blend: 0.02, blend_mode: "cubic", color: COAT },
  { id: "fore_arm", shape: "loft", bones: ["fore_thigh_l", "fore_shin_l"], radii: [0.075, 0.048, 0.034], mirror: "x", blend: 0.03, blend_mode: "cubic", color: COAT },
  { id: "fore_cannon", shape: "loft", bones: ["fore_cannon_l"], radii: [0.032, 0.026], mirror: "x", blend: 0.02, blend_mode: "cubic", color: DARK },
  { id: "fore_paw", shape: "ellipsoid", center: [0.1105, 0.034, 0.36], radii: [0.032, 0.026, 0.055], bone: "fore_foot_l", mirror: "x", blend: 0.012, color: DARK },
  { id: "hind_thigh", shape: "loft", bones: ["hind_thigh_l", "hind_shin_l"], radii: [0.095, 0.058, 0.036], mirror: "x", blend: 0.035, blend_mode: "cubic", color: COAT },
  { id: "hind_cannon", shape: "loft", bones: ["hind_cannon_l"], radii: [0.032, 0.026], mirror: "x", blend: 0.02, blend_mode: "cubic", color: DARK },
  { id: "hind_paw", shape: "ellipsoid", center: [0.1105, 0.04, -0.325], radii: [0.032, 0.026, 0.055], bone: "hind_foot_l", mirror: "x", blend: 0.012, color: DARK }
];

return {
  name: "quadruped", max: 16,
  family: { faction: "animal", kind: "animal", hp: 33 },
  nav: { agent: { name: "quadruped", radius: 0.34, height: 0.98, step: 0.18, slope: 35, drop: 0.26 } },
  body: {
    skeleton: bones,
    rig: rig,
    legs: { legs: [{ chain: "hind_l", mirror: "x", foot_height: 0.048 }, { chain: "fore_l", mirror: "x", foot_height: 0.044 }], gait: { from: "shepherd_walk", ride: 0.6315 }, slots: 4 },
    body: { gravity: 9.8, turn_rate: 2.9, max_speed: 3.8 },
    roles: { hips: "root", spine: ["spine1", "spine2", "spine3", "spine4"], chest: "spine4", neck: ["neck1", "neck2"], head: "head", jaw: { bone: "jaw", max: 35 }, ears: [["ear_l"], ["ear_r"]], tail: ["tail1", "tail2", "tail3", "tail4", "tail5"] },
    traits: { tail: 1.2, ears: 1.2, stabilise: 0.85, wander: 1.5, head_yaw: 60, head_pitch: 40, neck_yaw: 45, neck_pitch: 40 },
    physics: { mass: 32, shapes: [
        { id: "body", shape: "capsule", a: [0, 0.6, -0.28], b: [0, 0.6, 0.34], radius: 0.16, bone: "root" },
        { id: "head", shape: "sphere", center: [0, 0.735, 0.7], radius: 0.12, bone: "head" },
        { id: "fore", shape: "capsule", a: [0.11, 0.5, 0.36], b: [0.11, 0.06, 0.34], radius: 0.046, mirror: "x" },
        { id: "hind", shape: "capsule", a: [0.11, 0.58, -0.3], b: [0.11, 0.06, -0.33], radius: 0.05, mirror: "x" }
      ] },
    sdf: { cell: 0.014, decimate: { ratio: 0.45 }, skin: { falloff: 1.5 }, shade: { ao: 0.5, ao_radius: 0.04, tone: 0.2, color_blend: 0.35 }, parts: parts },
    variants: {
        dyes: {
          coat: { parts: ["torso", "hind_thigh", "fore_arm", "tail", "skull", "neck"], palette: [[0.59, 0.42, 0.25], [0.36, 0.22, 0.12], [0.12, 0.10, 0.09], [0.72, 0.62, 0.45], [0.45, 0.43, 0.40], [0.62, 0.30, 0.12]] },
          underside: { parts: ["belly", "chest"], palette: [[0.80, 0.71, 0.58], [0.93, 0.90, 0.84], [0.45, 0.35, 0.25]] }
        },
        looks: { tan: { coat: 0, underside: 0 }, brown: { coat: 1, underside: 0 }, black: { coat: 2, underside: 2 }, sand: { coat: 3, underside: 1 }, grey: { coat: 4, underside: 1 }, ginger: { coat: 5, underside: 0 } }
      }
  },
  abilities: ["walk", "effects"],
  interaction: { uses: [] },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 33 }],
      ["flee", { speed: 4.56, distance: 9 }],
      ["curious", { approach: 0.3, cooldown: 20, near: 1.3 }],
      ["idle_life", {}],
      ["injured", { clip_flinch: "" }],
      ["wander", { speed: 1.71, near: 0.5 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "quadruped", select: [ld.node("flee"), ld.node("curious"), ld.node("idle_life"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
