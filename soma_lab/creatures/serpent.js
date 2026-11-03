"use strict";
// serpent: in soma's one form of a creature file (soma/creature_file.js): `body` is the creature as it was made, the rest is who it is to the others (family, nav, abilities) and its mind: the blocks of soma/world/blocks/ it loads by name and
// its tree. The old worker of this file is left out; the mind below is the default of a creature of its kind (animal): write the creature's own in `mind`.
// serpent: a snake, 2.4 m long, fourteen bones in a row and a head that is its root. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, rig }.
// Metres, +x to its left, +y up, +z forward (the bind pose is the snake stretched out, its head forward at z = 0, the tail behind). A long FABRIK chain with ball joints that each bend a little: the whole body goes
// where the tail's end is asked to go, in the smoothest curve that the joints allow, and no joint bends more than its limit (the snake is a rope that can not kink).
const bones = [{ name: "head", head: [0, 0.1, 0], tail: [0, 0.1, -0.2] }];
const joints = [], names = [];
for (let i = 0; i < 13; i++) {
  const name = "body" + (i < 10 ? "0" : "") + i, z0 = -0.2 - i * 0.17;
  names.push(name);
  bones.push({ name: name, parent: i === 0 ? "head" : names[i - 1], head: [0, 0.1, z0], tail: [0, 0.1, z0 - 0.17] });
  joints.push({ bone: name, fwd: 28, back: 28, lat: 35, twist: 8 });                              // (a bone along z: forward means up for it)
}
// THE FACE (soma/SOMA.md "Authoring a face"): two eye bones (an eye looks along its bone: the head at the eyeball's centre, the tail at the slit pupil, which is on the eye's outer side; a snake turns its eyes a little, it
// has no lids) and a jaw (its hinge at the back of the mouth, its tail at the chin: it opens downward about the model's x); the head keeps the skull, the nostrils and the mark
bones.push({ name: "eye_l", parent: "head", head: [0.036, 0.1, -0.012], tail: [0.0527, 0.1, -0.0088], mirror: "x" });
bones.push({ name: "jaw", parent: "head", head: [0, 0.072, -0.15], tail: [0, 0.063, 0.03] });
joints.push({ bone: "eye_l", mirror: "x", kind: "ball", fwd: 12, back: 12, lat: 15, twist: [-5, 5] }, { bone: "jaw", kind: "hinge", axis: [1, 0, 0], range: [-3, 28] });
const rig = { joints: joints, chains: [{ name: "body", bones: names }] };

// SDF: what the mesh is made of (the mesher's grammar: soma/SOMA_MESHER.md; the bones are the skeleton above, the parts stand on them by name, in MODEL space: the bind pose). The body is a round tube that thickens
// behind the neck and thins to a whip of a tail, made of one short loft for every bone (they are one `group`: they meet in a hard union, so there is no bulge at a joint) and BOUND to that bone. The weights come from the
// parts: a vertex follows the bones of the parts whose surface is near it, by how near (`skin.falloff` times the part's `blend`, plus half a cell): a ring of vertices that is up to 8 cm from a joint (falloff 8 times a blend of 1 cm) is still pulled by the
// next bone, so the snake bends as a smooth curve and keeps its thickness (the page skins with dual quaternions). The colours are the parts': a cream belly (a flat ridge along the underside), dark saddles round the
// back (each a flattened ellipsoid that stands 3 mm proud of the tube, on the bone it lies over), a head with a pale chin, a dark mark, two eyes with a slit pupil.
const SKIN = [0.80, 0.62, 0.30, 1], BAND = [0.30, 0.14, 0.06, 1], BELLY = [0.95, 0.89, 0.70, 1], EYE = [0.98, 0.78, 0.12, 1], PUPIL = [0.03, 0.02, 0.02, 1], MARK = [0.34, 0.17, 0.07, 1], TONGUE = [0.80, 0.07, 0.10, 1];
const Y = 0.088;                                                                                      // (the axis of the body, a little under the bones: it lies on the ground)
const R = [0.034, 0.042, 0.052, 0.061, 0.067, 0.071, 0.073, 0.072, 0.068, 0.062, 0.053, 0.042, 0.029, 0.014];     // the half width at the 14 joints (the neck, then the end of each of the 13 bones)
const zj = function (j) { return -0.2 - 0.17 * j; };
const rad = function (z) { const f = (-0.2 - z) / 0.17, j = Math.max(0, Math.min(12, Math.floor(f))); return R[j] + (R[j + 1] - R[j]) * Math.max(0, Math.min(1, f - j)); };
const parts = [];
for (let j = 0; j < 13; j++) {
  parts.push({ id: "tube" + j, shape: "loft", bone: names[j], group: "tube", points: [[0, Y, zj(j)], [0, Y, zj(j + 1)]], radii: [R[j], R[j + 1]], blend: 0.01, color: SKIN });
}
parts.push({ id: "tip", shape: "loft", bone: names[12], group: "tube", points: [[0, Y, zj(13)], [0, Y, -2.53]], radii: [R[13], 0.004], blend: 0.01, color: SKIN });
for (let i = 0; i < 18; i++) {                                                                        // the saddles: one every 12 cm over the back and the sides, on the bone that they lie over (an ellipsoid that is
  const z = -0.3 - 0.12 * i, j = Math.min(12, Math.floor((-0.2 - z) / 0.17)), r = rad(z);                // centred above the axis: its lower half is inside the tube, so it leaves the belly alone)
  parts.push({ id: "saddle" + i, shape: "ellipsoid", bone: names[j], center: [0, Y + 0.3 * r, z], radii: [0.96 * r + 0.003, 0.7 * r + 0.003, 0.09], blend: 0.005, color: BAND });
}
for (let j = 0; j < 13; j++) {                                                                         // the belly comes last
  const a = 0.6 * R[j], c = 0.6 * R[j + 1];
  parts.push({ id: "belly" + j, shape: "loft", bone: names[j], group: "belly", points: [[0, Y - a, zj(j)], [0, Y - c, zj(j + 1)]], radii: [0.85 * R[j], 0.85 * R[j + 1]], radii_v: [0.4 * R[j] + 0.004, 0.4 * R[j + 1] + 0.004], blend: 0.01, color: BELLY });
}
// the head: a wide skull that narrows to a blunt snout, a pale lower jaw (the line where the two colours meet is the mouth), a dark mark on top; the eyes are an island of their own (a finer grid: an eye is
// a centimetre across) so that they are round, with a slit pupil, and so are the nostrils and the forked tongue
parts.push({ id: "skull", shape: "loft", bone: "head", points: [[0, 0.088, -0.2], [0, 0.09, -0.14], [0, 0.092, -0.08], [0, 0.09, -0.02], [0, 0.086, 0.025], [0, 0.082, 0.04]],
  radii: [0.034, 0.046, 0.053, 0.046, 0.030, 0.014], radii_v: [0.030, 0.037, 0.040, 0.034, 0.025, 0.012], blend: 0.015, blend_mode: "cubic", color: SKIN });
// (the lower jaw is an ISLAND on the jaw bone: the body's skin spreads 8 cm, which would have taken half the skull with the jaw; an island takes its weights from its own parts, so the seam is the line of the mouth. The eyes
// are on their bones, the tongue on the jaw)
parts.push({ id: "jaw", shape: "loft", bone: "jaw", island: "jaw", points: [[0, 0.064, -0.16], [0, 0.066, -0.08], [0, 0.065, -0.01], [0, 0.062, 0.03]], radii: [0.040, 0.048, 0.040, 0.020], radii_v: [0.020, 0.024, 0.021, 0.013], color: BELLY });
parts.push({ id: "mark", shape: "ellipsoid", bone: "head", center: [0, 0.127, -0.08], radii: [0.026, 0.008, 0.055], blend: 0.005, color: MARK });
parts.push({ id: "eye_l", shape: "sphere", bone: "eye_l", island: "face", center: [0.036, 0.1, -0.012], radius: 0.0115, mirror: "x", color: EYE });
parts.push({ id: "pupil_l", shape: "ellipsoid", bone: "eye_l", island: "face", center: [0.0465, 0.1, -0.01], radii: [0.0035, 0.0075, 0.0035], mirror: "x", color: PUPIL });
parts.push({ id: "nostril_l", shape: "sphere", bone: "head", island: "face", center: [0.009, 0.094, 0.0455], radius: 0.0035, mirror: "x", color: PUPIL });
parts.push({ id: "tongue", shape: "capsule", bone: "jaw", island: "face", a: [0, 0.071, 0.03], b: [0, 0.071, 0.085], radius: 0.0035, color: TONGUE });
parts.push({ id: "fork_l", shape: "capsule", bone: "jaw", island: "face", a: [0, 0.071, 0.085], b: [0.011, 0.071, 0.112], radius: 0.003, mirror: "x", color: TONGUE });
const sdf = {
  cell: 0.012, skin: { falloff: 8 }, shade: { ao: 0.35, ao_radius: 0.025, tone: 0.15, color_blend: 0.15 },
  islands: { face: { cell: 0.0035 }, jaw: { cell: 0.009 } },
  parts: parts,
};

// THE LIFE OF A SNAKE: its body is the spine (the head is the root), and the spine undulates as the body goes (a wave of a metre's length runs from the head to the tail by one length for every length the body goes: no point of it slips
// sideways) and follows the track the head leaves (it bends along the curve the head made when it turns). It goes where it is wished to (the body: no legs, so no gait: half its top speed is its pace).
const roles = { hips: "head", spine: names, wave: { length: 1.0, angle: 28, speed: 0.5, follow: true } };
// THE FACE: the roles of its eyes and its jaw (soma 2.0's spelling: soma/SOMA.md "Authoring a face"), written into its roles on the next line (soma_face.cpp plays them)
const face = { eyes: [{ bone: "eye_l", yaw: 15, pitch: 10 }, { bone: "eye_r", yaw: 15, pitch: 10 }], jaw: { bone: "jaw", max: 28 } };
Object.assign(roles, face);                 // THE FACE in roles (soma/tools/face_roles.js)
// PHYSICS: the creature in the physics world (soma_phys.cpp, js/shapes.js): a CHAIN of balls, one on the head and one on every second bone of the body (as big as the body is there), each on its own bone, so that the chain
// bends where the snake does; 9 kg
const physics = { mass: 9, shapes: [{ id: "head", shape: "sphere", center: [0, Y, -0.06], radius: 0.05, bone: "head" }].concat([1, 3, 5, 7, 9, 11].map(function (j) {
  return { id: "coil" + j, shape: "sphere", center: [0, Y, (zj(j) + zj(j + 1)) / 2], radius: R[j] + 0.006, bone: names[j] };
})) };

return {
  name: "serpent", max: 16,
  family: { faction: "animal", kind: "animal", hp: 20 },
  nav: { agent: { name: "serpent", radius: 0.55, height: 0.2, step: 0.08, slope: 35, drop: 0.15 } },
  body: {
    skeleton: bones,
    rig: rig,
    roles: roles,
    body: { max_speed: 1.6, accel: 2.5, turn_rate: 3, turn_radius: 0.5, gravity: 9.8, step: 0.06, radius: 0.12 },
    physics: physics,
    sdf: sdf
  },
  abilities: ["walk", "effects"],
  interaction: { uses: [] },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 20 }],
      ["flee", { speed: 1.92, distance: 6 }],
      ["curious", { approach: 0.3, cooldown: 20, near: 1.7 }],
      ["idle_life", {}],
      ["injured", { clip_flinch: "" }],
      ["wander", { speed: 0.72, near: 0.6 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "serpent", select: [ld.node("flee"), ld.node("curious"), ld.node("idle_life"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
