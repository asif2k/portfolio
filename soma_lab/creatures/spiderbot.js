"use strict";
// spiderbot: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A machine with six legs, 0.5 m high and 1.6 m across: wanders its home on its six legs, stops to look at whatever comes near.
// spiderbot: a machine with six legs, 0.5 m high, 1.6 m across. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, rig }.
// Metres, +x to its left, +y up, +z forward. Each leg is three bones (a coxa that swings it forward and back, a femur and a tibia that are hinges about the horizontal axis across the leg) solved by the engine's
// FABRIK: the foot goes where it is asked to, the knee up, and the rig holds the bones to their joints. The six legs hang from the body and share no bone: six solves, each its own. (The engine's classic `insect_leg`
// is a SHAPE a leg folds into as the foot gets nearer, not a reach: it is one of the ten generic solvers a chain may name, `solver: "insect_leg"`.)
const bones = [{ name: "body", head: [0, 0.45, -0.3], tail: [0, 0.45, 0.3] }];
const joints = [], chains = [];
// three pairs of legs, front to back: where the coxa leaves the body (z), how far forward the leg points (a fan: the front pair forward, the back pair backward)
[["1", 0.25, 0.5], ["2", 0.0, 0.0], ["3", -0.25, -0.5]].forEach(function (leg) {
  const id = leg[0], z = leg[1], fan = leg[2], dx = Math.cos(fan), dz = Math.sin(fan);
  const p0 = [0.12, 0.45, z], p1 = [0.12 + 0.20 * dx, 0.45, z + 0.20 * dz], p2 = [0.12 + 0.20 * dx + 0.32 * dx, 0.62, z + 0.20 * dz + 0.32 * dz], p3 = [0.12 + 0.20 * dx + 0.32 * dx + 0.30 * dx, 0.0, z + 0.20 * dz + 0.32 * dz + 0.30 * dz];
  const names = ["coxa" + id + "_l", "femur" + id + "_l", "tibia" + id + "_l"], pts = [p0, p1, p2, p3];
  names.forEach(function (name, i) { bones.push({ name: name, parent: i === 0 ? "body" : names[i - 1], head: pts[i], tail: pts[i + 1], mirror: "x" }); });
  // the hinges' axis is across the leg and horizontal: perpendicular to the leg's direction in the ground plane (the model's z for a leg that points out along x)
  const axis = [-dz, 0, dx];
  joints.push({ bone: names[0], mirror: "x", fwd: 35, back: 35, up: 15, down: 20, twist: 5 });
  joints.push({ bone: names[1], mirror: "x", kind: "hinge", axis: axis, range: [-50, 70] });
  joints.push({ bone: names[2], mirror: "x", kind: "hinge", axis: axis, range: [-100, 40] });
  chains.push({ name: "leg" + id + "_l", mirror: "x", bones: names, pole: [0, 1, 0], pole_w: 1 });
});

// THE FACE (soma_face.cpp): six lenses are six EYES (an eye looks along its bone: the head of the bone is the middle of the lens, the tail the way it looks at rest, out of the sensor head where it sits) and the two fangs are the
// JAW (two bones that open apart, each about the model's forward axis: the mirror turns the right one's axis over). The number of eyes is the creature's: there is no limit but the skeleton's 255 bones
const LENSES = [["lens1", [0.055, 0.49, 0.44], 0.034, [0.22, 0.12, 0.97]], ["lens2", [0.105, 0.465, 0.38], 0.02, [0.89, 0.0, 0.45]], ["lens3", [0.04, 0.55, 0.41], 0.016, [0.23, 0.82, 0.52]]];
LENSES.forEach(function (l) {
  const d = l[3], n = Math.hypot(d[0], d[1], d[2]), c = l[1];
  l[3] = [d[0] / n, d[1] / n, d[2] / n];
  bones.push({ name: l[0] + "_l", parent: "body", head: c, tail: [c[0] + l[3][0] * 0.03, c[1] + l[3][1] * 0.03, c[2] + l[3][2] * 0.03], mirror: "x" });
});
bones.push({ name: "fang_l", parent: "body", head: [0.045, 0.43, 0.41], tail: [0.06, 0.34, 0.47], mirror: "x" });

// LEGS: six legs that walk in tripods (neighbours half a cycle apart); the feet stand far out of the hips, as they do at the bind pose (the spread is worked out from it)
const legs = { legs: [{ chain: "leg1_l", mirror: "x" }, { chain: "leg2_l", mirror: "x" }, { chain: "leg3_l", mirror: "x" }], gait: { speed: 1.2, stride: 0.4, swing: 0.45, step_height: 0.12 }, slots: 1 };

// ROLES: the body is the hips (the legs' body bone is the default): it rocks a little with the gait (a creature of six legs very little) and idles. The six lenses look (each from where it sits, within 40 degrees sideways and
// 30 up and down: a look further round is past what the lenses do, the machine has no head to turn), the fangs open (speech, a roar) and chew
const roles = { hips: "body",
  eyes: [{ bone: "lens1_l", mirror: "x", yaw: 40, pitch: 30 }, { bone: "lens2_l", mirror: "x", yaw: 40, pitch: 30 }, { bone: "lens3_l", mirror: "x", yaw: 40, pitch: 30 }],
  jaw: [{ bone: "fang_l", mirror: "x", axis: [0, 0, 1], max: 25 }] };

// SDF: what the mesh is made of (the mesher's grammar: soma/SOMA_MESHER.md; the parts stand on the bones above by name, a part on a _l bone with `mirror: "x"` also makes the _r twin). A gunmetal hull under two orange armour
// plates, a sensor head with cyan lenses and steel fangs, a reactor pod behind with a glowing ring; each leg is an armoured segment on every bone (a dark coxa, an orange femur, a steel tibia with an orange guard) with a steel
// ball at each hinge and a rubber foot. The legs are made from the bones' own head and tail points, so they follow the skeleton above, and they end where the leg chain puts the foot (the tibia's tail, on the floor).
// A machine is crisp: hard edges (the plates stand on the hull, blend 0), a low skin falloff (a joint is a ball that turns, not a skin that stretches). The lenses are an ISLAND on a finer octree of their own: round
// glass that never melts into the head. `adaptive` (an octree: fine cells only where the surface curves, 6 mm to 3 cm) and `decimate` take the vertices off the long straight tubes: a crowd of them is drawn, not one.
const ORANGE = [0.95, 0.50, 0.08, 1], DARK = [0.17, 0.19, 0.23, 1], STEEL = [0.62, 0.65, 0.70, 1], BLACK = [0.04, 0.04, 0.05, 1], CYAN = [0.25, 0.92, 1.0, 1];
const parts = [
  // the body: a hull, the armour plate on it, a sensor dome, the reactor pod behind with its plate and ring, a sensor head in front with a visor, three pairs of lenses and two fangs
  { id: "hull", shape: "box", center: [0, 0.455, 0.0], half: [0.19, 0.09, 0.3], round: 0.07, bone: "body", blend: 0.03, color: DARK },
  { id: "shell", shape: "box", center: [0, 0.545, -0.02], half: [0.15, 0.04, 0.235], round: 0.04, bone: "body", blend: 0, color: ORANGE },
  { id: "dome", shape: "ellipsoid", center: [0, 0.6, 0.06], radii: [0.045, 0.03, 0.06], bone: "body", blend: 0.012, color: STEEL },
  { id: "pod", shape: "ellipsoid", center: [0, 0.47, -0.39], radii: [0.14, 0.115, 0.17], bone: "body", blend: 0.03, color: DARK },
  { id: "pod_cap", shape: "box", center: [0, 0.565, -0.39], half: [0.1, 0.035, 0.12], round: 0.035, bone: "body", blend: 0, color: ORANGE },
  { id: "pod_ring", shape: "torus", center: [0, 0.47, -0.535], axis: "z", radius: 0.075, tube: 0.015, bone: "body", blend: 0.01, color: CYAN },
  { id: "head", shape: "ellipsoid", center: [0, 0.465, 0.34], radii: [0.12, 0.092, 0.105], bone: "body", blend: 0.03, color: DARK },
  { id: "visor", shape: "ellipsoid", center: [0, 0.48, 0.42], radii: [0.1, 0.045, 0.04], bone: "body", blend: 0.015, color: BLACK },
  { id: "fang_l", shape: "capsule", a: [0.045, 0.43, 0.41], b: [0.06, 0.34, 0.47], ra: 0.025, rb: 0.01, bone: "fang_l", mirror: "x", blend: 0.01, color: STEEL },
];
// the lenses: cyan glass, each with a dark pupil the way it looks (both on the lens's bone: it turns about the middle of the lens, the pupil shows where it looks)
LENSES.forEach(function (l) {
  const c = l[1], r = l[2], d = l[3];
  parts.push({ id: l[0] + "_l", shape: "sphere", center: c, radius: r, bone: l[0] + "_l", mirror: "x", island: "lens", color: CYAN },
    { id: l[0] + "_pupil_l", shape: "sphere", center: [c[0] + d[0] * 0.8 * r, c[1] + d[1] * 0.8 * r, c[2] + d[2] * 0.8 * r], radius: 0.4 * r, bone: l[0] + "_l", mirror: "x", island: "lens", color: BLACK });
});
// the six legs, one pair after the other from the bones above (the points are the bones' own): a hip ball and the coxa, a steel ball at the femur's head, the femur, a steel ball at the knee, the tibia with its guard, the foot
const bone_of = {};
bones.forEach(function (b) { bone_of[b.name] = b; });
["1", "2", "3"].forEach(function (id) {
  const coxa = bone_of["coxa" + id + "_l"], femur = bone_of["femur" + id + "_l"], tibia = bone_of["tibia" + id + "_l"];
  const hip = coxa.head, hx = femur.head, knee = tibia.head, foot = tibia.tail;
  const along = function (d) { const len = Math.hypot(foot[0] - knee[0], foot[1] - knee[1], foot[2] - knee[2]); return [foot[0] - d * (foot[0] - knee[0]) / len, foot[1] - d * (foot[1] - knee[1]) / len, foot[2] - d * (foot[2] - knee[2]) / len]; };   // (the point d metres up the tibia from the foot)
  const guard = [knee[0] + 0.45 * (foot[0] - knee[0]), knee[1] + 0.45 * (foot[1] - knee[1]), knee[2] + 0.45 * (foot[2] - knee[2])];
  // a loft rounds its end by its last radius, so the tibia stops short of the foot; the rubber ball is on the leg's axis, resting on the floor when the leg stands (nothing of the leg goes under the floor)
  parts.push(
    { id: "hip" + id, shape: "sphere", center: hip, radius: 0.068, bone: coxa.name, mirror: "x", blend: 0.015, color: DARK },
    { id: "coxa" + id, shape: "loft", bones: [coxa.name], radii: [0.052, 0.048], radii_v: [0.052, 0.048], mirror: "x", blend: 0.015, color: DARK },
    { id: "joint_a" + id, shape: "sphere", center: hx, radius: 0.056, bone: femur.name, mirror: "x", blend: 0.012, color: STEEL },
    { id: "femur" + id, shape: "loft", bones: [femur.name], radii: [0.036, 0.034], radii_v: [0.046, 0.042], mirror: "x", blend: 0.012, color: ORANGE },
    { id: "joint_b" + id, shape: "sphere", center: knee, radius: 0.058, bone: tibia.name, mirror: "x", blend: 0.012, color: STEEL },
    { id: "tibia" + id, shape: "loft", points: [knee, along(0.0235)], radii: [0.04, 0.02], radii_v: [0.044, 0.02], bone: tibia.name, mirror: "x", blend: 0.01, color: STEEL },
    { id: "guard" + id, shape: "loft", points: [knee, guard], radii: [0.047, 0.036], radii_v: [0.05, 0.039], bone: tibia.name, mirror: "x", blend: 0.01, color: ORANGE },
    { id: "foot" + id, shape: "sphere", center: along(0.037), radius: 0.03, bone: tibia.name, mirror: "x", blend: 0.008, color: BLACK }
  );
});
const sdf = { cell: 0.012, adaptive: { min_cell: 0.006, max_cell: 0.03 }, decimate: { ratio: 0.3 }, islands: { lens: { adaptive: { min_cell: 0.005, max_cell: 0.01 }, decimate: { ratio: 0.6 } } }, skin: { falloff: 0.8 }, shade: { ao: 0.5, ao_radius: 0.03, tone: 0.2, color_blend: 0.12 }, parts: parts };

// PHYSICS: the creature in the physics world (soma_phys.cpp, js/shapes.js): a capsule for the hull and a ball each for the reactor pod and the sensor head, all on the body bone; 14 kg
const physics = { mass: 14, shapes: [
  { id: "hull", shape: "capsule", a: [0, 0.47, -0.16], b: [0, 0.47, 0.2], radius: 0.14, bone: "body" },
  { id: "pod", shape: "sphere", center: [0, 0.5, -0.32], radius: 0.11, bone: "body" },
  { id: "sensor", shape: "sphere", center: [0, 0.48, 0.36], radius: 0.09, bone: "body" },
] };

return {
  name: "spiderbot", max: 16,
  family: { faction: "machine", kind: "mech", hp: 80 },
  nav: { agent: {"name":"spiderbot","radius":0.9,"height":0.6,"step":0.3,"slope":35,"drop":0.5} },
  body: {
    skeleton: bones,
    rig: { joints: joints, chains: chains },
    legs: legs,
    body: { gravity: 9.8 },
    roles: roles,
    physics: physics,
    sdf: sdf
  },
  abilities: ["walk", "effects"],
  interaction: { uses: [] },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 80 }],
      ["curious", { approach: 0.3, cooldown: 20 }],
      ["wander", { speed: 0.9, pause_min: 2, pause_max: 6 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "spiderbot", select: [ld.node("curious"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
