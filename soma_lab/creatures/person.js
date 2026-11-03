"use strict";
// person: in soma's one form of a creature file (soma/creature_file.js): `body` is the creature as it was made, the rest is who it is to the others (family, nav, abilities) and its mind: the blocks of soma/world/blocks/ it loads by name and
// its tree. The old worker of this file is left out; the mind below is the default of a creature of its kind (person): write the creature's own in `mind`.
// person: a standing person, 1.8 m, in a T-pose (arms out along x). ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, rig }.
// Metres, +x to its left, +y up, +z forward. The rig is FABRIK for the spine, the head and the two arms (one tree: they share the chest, so a hand that pulls the chest pulls the head with it) and the engine's analytic
// two-bone `limb` solver for each leg (a leg of two bones has an exact solution: a walking person costs a third less than with FABRIK, and the rig holds the joints' limits all the same). The limits are what a body does, written for the bind pose (the T-pose): a ball joint says how far the bone's axis may tilt forward / back / out and in (a bone that lies along x
// has up / down in place of out / in) and how far it may twist; the elbow and the knee are hinges.
const bones = [];
// a run of bones: bone i goes from points[i] to points[i + 1] and hangs from the one before (the first from `parent`); `mirror` writes the right-hand twin of a run whose names end in _l
function run(parent, names, points, mirror) {
  names.forEach(function (name, i) {
    const b = { name: name, parent: i === 0 ? parent : names[i - 1], head: points[i], tail: points[i + 1] };
    if (mirror) b.mirror = "x";
    bones.push(b);
  });
}
run(null, ["hips"], [[0, 0.95, 0], [0, 1.05, 0]]);
run("hips", ["spine", "chest", "neck", "head"], [[0, 1.05, 0], [0, 1.25, 0], [0, 1.45, 0], [0, 1.58, 0], [0, 1.80, 0]]);
run("chest", ["clav_l", "upper_l", "fore_l", "hand_l"], [[0, 1.42, 0], [0.17, 1.42, 0], [0.45, 1.42, 0], [0.71, 1.42, 0], [0.82, 1.42, 0]], true);
run("hips", ["thigh_l", "shin_l", "foot_l"], [[0.09, 0.95, 0], [0.09, 0.52, 0], [0.09, 0.09, 0], [0.09, 0.03, 0.16]], true);
// THE FACE (soma_face.cpp): an eye LOOKS ALONG ITS BONE (the head of the bone is the middle of the eyeball, the tail the pupil); a lid turns about the level axis across its bone (here the eye's own: a positive turn takes it down
// over the eye); a brow's head is its OUTER end (a knit turns the inner end down); the jaw opens down about its hinge (the head of the bone, in front of the ear) toward the chin; the corners of the mouth go out and up in a smile
bones.push({ name: "eye_l", parent: "head", head: [0.033, 1.699, 0.094], tail: [0.033, 1.699, 0.1085], mirror: "x" });
bones.push({ name: "lid_l", parent: "head", head: [0.033, 1.699, 0.094], tail: [0.033, 1.699, 0.11], mirror: "x" });
bones.push({ name: "brow_l", parent: "head", head: [0.054, 1.733, 0.088], tail: [0.016, 1.729, 0.099], mirror: "x" });
bones.push({ name: "jaw", parent: "head", head: [0, 1.664, 0.0], tail: [0, 1.597, 0.088] });
bones.push({ name: "mouth_l", parent: "head", head: [0.021, 1.629, 0.099], tail: [0.031, 1.629, 0.095], mirror: "x" });

const rig = {
  joints: [
    { bone: "spine", fwd: 40, back: 25, lat: 25, twist: 30 },
    { bone: "chest", fwd: 30, back: 20, lat: 25, twist: 30 },
    { bone: "neck", fwd: 50, back: 50, lat: 40, twist: 60 },
    { bone: "head", fwd: 35, back: 45, lat: 35, twist: 50 },
    { bone: "clav_l", mirror: "x", up: 30, down: 15, fwd: 20, back: 20, twist: 15 },
    { bone: "upper_l", mirror: "x", up: 100, down: 110, fwd: 100, back: 50, twist: [-90, 90] },
    { bone: "fore_l", mirror: "x", kind: "hinge", axis: [0, -1, 0], range: [0, 150] },            // the elbow: the hand comes forward
    { bone: "hand_l", mirror: "x", up: 35, down: 35, fwd: 70, back: 70, twist: 40 },
    { bone: "thigh_l", mirror: "x", fwd: 120, back: 25, out: 50, in: 30, twist: [-40, 40] },
    { bone: "shin_l", mirror: "x", kind: "hinge", axis: [1, 0, 0], range: [0, 150] },            // the knee: the foot goes back
    { bone: "foot_l", mirror: "x", fwd: 30, back: 50, lat: 20, twist: 20 },
  ],
  chains: [
    { name: "head", bones: ["spine", "chest", "neck", "head"] },                                  // (its end is the top of the head)
    { name: "arm_l", mirror: "x", bones: ["spine", "chest", "clav_l", "upper_l", "fore_l"], tip: "hand_l", pole: [0.3, -1, -0.3], pole_w: 0.5 },
    { name: "leg_l", mirror: "x", solver: "limb", bones: ["thigh_l", "shin_l"], tip: "foot_l", pole: [0, 0, 1], pole_w: 1 },
  ],
};

// LEGS: the two leg chains are the feet (the end of a chain is the ankle: the foot bone is its tip, kept flat on the floor); the gait is a person's walk: 1.4 m/s at a stride of 0.7 m (two steps a second), the hips
// lower by the crouch of speed and a bob of a centimetre; BODY: the mover (a person goes up to 2.8 m/s, gets to a walk in half a second, turns by stepping)
const legs = { legs: [{ chain: "leg_l", mirror: "x" }], gait: { speed: 1.4, stride: 0.7, swing: 0.4, step_height: 0.09, bob: 0.012, crouch: 0.04, run_stride: 1.5, run_step_height: 1.6 } };

// ROLES: which bone plays which part. The life breathes the chest, sways the head, couples the hips and the spine to the gait, keeps the head level, plays the upper body of a gait style (the hips, the spine, the neck, the head
// and the hands), and each arm hangs from its shoulder and swings opposite to the leg on its side. An arm is a chain of the rig: its last two bones are the arm (the upper arm, the forearm), the bone before them (the clavicle)
// is the shoulder that the breath lifts. The bones of the rig's own chains may have roles: the overlay is part of the animation that the solves start from.
const roles = { hips: "hips", spine: ["spine", "chest"], neck: ["neck"], head: "head", arms: [{ chain: "arm_l", mirror: "x" }],
  // the face: two eyes that look (saccade, aim at a goal: the head, the neck and the spine follow), lids that blink, brows that rise and knit, a jaw that opens (speech, a yawn) and the corners of the mouth (a smile)
  eyes: [{ bone: "eye_l", mirror: "x" }], lids: [{ bone: "lid_l", mirror: "x" }], brows: [{ bone: "brow_l", mirror: "x" }], jaw: { bone: "jaw", max: 22 }, mouth: { corners: [{ bone: "mouth_l", mirror: "x" }] },
  face_unit: 0.025 };                                                                                      // (how far a brow or a corner of the mouth moves: a share of it; the default, 0.2 of the head, took the brows into the forehead)
// TRAITS: how far the head and the neck turn to look, in the joints' own limits (the head twists 50 degrees, the neck 60: the look's stages are kept inside them)
const traits = { head_yaw: 50, head_pitch: 35, neck_yaw: 45, neck_pitch: 30 };

// SDF: what the mesh is made of (the mesher's grammar: soma/SOMA_MESHER.md; the bones are the skeleton above, the parts stand on them by name). A part is a shape on a bone, with a colour and a `blend`: how smoothly it
// melts into the parts around it (metres), which is also how far its skin weights blend with its neighbours' (`skin.falloff` 1.5: a person's joints bend through a handful of vertices, not a hinge of rigid pieces).
// A loft along a bone takes `radii` (one more than there are bones: at each bone's head and at the last one's tail) and `radii_v` (the depth, front to back, when it is not round). The body is meshed with an octree
// (`adaptive`: a few millimetres where there is a finger or a lip, two centimetres on a flat shirt) and simplified; the face's features (eyes, brows, lips: small, of other colours, on a curved skin) are an
// ISLAND: its parts never melt into the others, they are meshed on a grid of their own (3.5 mm) and sit on the skin; so are the soles (a slab under the shoes).
const SKIN = [0.87, 0.67, 0.55, 1], SHIRT = [0.20, 0.36, 0.65, 1], TRIM = [0.13, 0.25, 0.50, 1], PANTS = [0.17, 0.19, 0.27, 1], SHOE = [0.13, 0.11, 0.10, 1], SOLE = [0.88, 0.87, 0.84, 1], HAIR = [0.16, 0.10, 0.06, 1];
const LID = [0.74, 0.54, 0.44, 1];                 // (the lids are an island of their own: none of the face's baked shade falls on them, so their skin is a shade darker)
const BROW = [0.12, 0.08, 0.05, 1], LIP = [0.66, 0.36, 0.34, 1], WHITE = [0.95, 0.95, 0.93, 1], IRIS = [0.27, 0.42, 0.55, 1], DARK = [0.04, 0.03, 0.03, 1], BELT = [0.13, 0.09, 0.06, 1], BUCKLE = [0.78, 0.68, 0.40, 1];
const parts = [
  // the pelvis and the trunk: a shirt over a belt of trousers
  { id: "pelvis", shape: "ellipsoid", center: [0, 0.99, 0], radii: [0.155, 0.12, 0.105], bone: "hips", blend: 0.04, blend_mode: "cubic", color: PANTS },
  { id: "glute_l", shape: "ellipsoid", center: [0.075, 0.95, -0.065], radii: [0.08, 0.085, 0.075], bone: "hips", mirror: "x", blend: 0.04, blend_mode: "cubic", color: PANTS },
  { id: "torso", shape: "loft", bones: ["spine", "chest"], radii: [0.14, 0.15, 0.175], radii_v: [0.095, 0.105, 0.115], blend: 0.045, blend_mode: "cubic", color: SHIRT },
  { id: "shoulders", shape: "capsule", a: [-0.185, 1.40, 0], b: [0.185, 1.40, 0], radius: 0.062, bone: "chest", blend: 0.04, blend_mode: "cubic", color: SHIRT },
  { id: "trap_l", shape: "ellipsoid", center: [0.075, 1.435, -0.005], radii: [0.085, 0.04, 0.06], bone: "chest", mirror: "x", blend: 0.04, blend_mode: "cubic", color: SHIRT },
  { id: "deltoid_l", shape: "sphere", center: [0.185, 1.405, 0], radius: 0.058, bone: "upper_l", mirror: "x", blend: 0.035, blend_mode: "cubic", color: SHIRT },
  { id: "belt", shape: "ellipsoid", center: [0, 1.007, 0], radii: [0.162, 0.022, 0.112], bone: "hips", blend: 0.004, color: BELT },
  { id: "buckle", shape: "box", center: [0, 1.008, 0.112], half: [0.02, 0.016, 0.005], round: 0.003, bone: "hips", blend: 0.003, color: BUCKLE },
  { id: "collar", shape: "torus", center: [0, 1.482, 0], axis: "y", radius: 0.058, tube: 0.012, bone: "neck", blend: 0.004, color: TRIM },
  // the neck and the head: a skull, a jaw with a chin, cheek bones, a nose, two ears
  { id: "neck", shape: "loft", bones: ["neck"], radii: [0.052, 0.046], blend: 0.03, blend_mode: "cubic", color: SKIN },
  { id: "skull", shape: "ellipsoid", center: [0, 1.69, 0.012], radii: [0.084, 0.108, 0.098], bone: "head", blend: 0.03, blend_mode: "cubic", color: SKIN },
  { id: "jaw", shape: "ellipsoid", center: [0, 1.628, 0.035], radii: [0.064, 0.058, 0.07], bone: "jaw", blend: 0.014, blend_mode: "cubic", color: SKIN },          // (a small blend: the chin's skin goes with the jaw, so the lower lip on it does not sink in when the mouth opens)
  { id: "chin", shape: "sphere", center: [0, 1.598, 0.074], radius: 0.03, bone: "jaw", blend: 0.014, blend_mode: "cubic", color: SKIN },
  { id: "cheek_l", shape: "ellipsoid", center: [0.052, 1.662, 0.066], radii: [0.03, 0.025, 0.03], bone: "head", mirror: "x", blend: 0.03, blend_mode: "cubic", color: SKIN },
  { id: "nose_bridge", shape: "ellipsoid", center: [0, 1.684, 0.1], radii: [0.011, 0.03, 0.016], bone: "head", blend: 0.015, blend_mode: "cubic", color: SKIN },
  { id: "nose_tip", shape: "sphere", center: [0, 1.656, 0.116], radius: 0.0135, bone: "head", blend: 0.015, blend_mode: "cubic", color: SKIN },
  { id: "nostril_l", shape: "sphere", center: [0.0135, 1.653, 0.106], radius: 0.009, bone: "head", mirror: "x", blend: 0.012, blend_mode: "cubic", color: SKIN },
  { id: "ear_l", shape: "ellipsoid", center: [0.086, 1.685, -0.005], radii: [0.012, 0.032, 0.021], bone: "head", mirror: "x", blend: 0.012, blend_mode: "cubic", color: SKIN },
  // the face's features: eyes (white, iris, pupil: on the eye bones, they turn about the middle of the eyeball), brows, lips, the mouth; and the hair: islands, crisp on the skin
  { id: "eye_l", shape: "sphere", center: [0.033, 1.699, 0.094], radius: 0.0135, bone: "eye_l", mirror: "x", island: "face", color: WHITE },
  { id: "iris_l", shape: "ellipsoid", center: [0.033, 1.699, 0.107], radii: [0.0075, 0.0075, 0.0019], bone: "eye_l", mirror: "x", island: "face", color: IRIS },          // (flat: what stands proud of the eyeball has to stay under the lid when it closes)
  { id: "pupil_l", shape: "ellipsoid", center: [0.033, 1.699, 0.1079], radii: [0.0037, 0.0037, 0.0018], bone: "eye_l", mirror: "x", island: "face", color: DARK },
  { id: "brow_l", shape: "capsule", a: [0.016, 1.729, 0.1005], b: [0.052, 1.733, 0.0895], radius: 0.005, bone: "brow_l", mirror: "x", island: "face", color: BROW },
  // the lips: the middle of the upper lip on the head, of the lower lip on the jaw, the corners on bones of their own; between them the mouth, dark, in two halves (the upper one on the head, the lower one on the jaw): the jaw
  // that opens stretches the seam between the halves, dark to dark
  { id: "lip_up", shape: "ellipsoid", center: [0, 1.6338, 0.1062], radii: [0.019, 0.0052, 0.0072], bone: "head", island: "face", color: LIP },
  { id: "lip_low", shape: "ellipsoid", center: [0, 1.6242, 0.1052], radii: [0.017, 0.0058, 0.0072], bone: "jaw", island: "face", color: LIP },
  { id: "lip_corner_l", shape: "ellipsoid", center: [0.019, 1.629, 0.1032], radii: [0.0075, 0.0052, 0.0058], bone: "mouth_l", mirror: "x", island: "face", color: LIP },
  { id: "mouth_up", shape: "ellipsoid", center: [0, 1.6303, 0.1048], radii: [0.018, 0.0025, 0.0062], bone: "head", island: "face", color: DARK },
  { id: "mouth_dn", shape: "ellipsoid", center: [0, 1.6277, 0.1048], radii: [0.017, 0.0025, 0.0062], bone: "jaw", island: "face", color: DARK },
  // the upper lids: a cap of skin a little wider than the eyeball, cut below the top of the iris (an island of their own: the cap is bigger than the eye and would swallow it in the face's); a blink turns it down over the eye
  { id: "lid_l", shape: "sphere", center: [0.033, 1.699, 0.094], radius: 0.0162, bone: "lid_l", mirror: "x", island: "lids", color: LID },
  { id: "lid_cut_l", shape: "box", center: [0.033, 1.6845, 0.094], half: [0.025, 0.02, 0.025], bone: "lid_l", mirror: "x", island: "lids", op: "subtract", color: LID },
  { id: "hair", shape: "ellipsoid", center: [0, 1.715, -0.018], radii: [0.092, 0.101, 0.108], bone: "head", blend: 0.004, color: HAIR },
  // the arms: a short sleeve (an island: a crisp hem), bare arms, an elbow, hands with fingers and a thumb
  { id: "upper_arm", shape: "loft", bones: ["upper_l"], radii: [0.050, 0.041], mirror: "x", blend: 0.025, blend_mode: "cubic", color: SKIN },
  { id: "sleeve", shape: "loft", points: [[0.17, 1.42, 0], [0.37, 1.42, 0]], radii: [0.058, 0.051], bone: "upper_l", mirror: "x", blend: 0.006, color: SHIRT },
  { id: "forearm", shape: "loft", bones: ["fore_l"], radii: [0.040, 0.029], mirror: "x", blend: 0.02, blend_mode: "cubic", color: SKIN },
  { id: "elbow", shape: "sphere", center: [0.45, 1.42, -0.004], radius: 0.039, bone: "fore_l", mirror: "x", blend: 0.025, blend_mode: "cubic", color: SKIN },
  { id: "palm", shape: "ellipsoid", center: [0.765, 1.42, 0.004], radii: [0.052, 0.014, 0.04], bone: "hand_l", mirror: "x", blend: 0.012, blend_mode: "cubic", color: SKIN },
  { id: "index", shape: "capsule", a: [0.79, 1.418, 0.032], b: [0.865, 1.415, 0.04], radius: 0.0078, bone: "hand_l", mirror: "x", blend: 0.008, color: SKIN },
  { id: "middle", shape: "capsule", a: [0.795, 1.418, 0.012], b: [0.878, 1.415, 0.014], radius: 0.0082, bone: "hand_l", mirror: "x", blend: 0.008, color: SKIN },
  { id: "ring", shape: "capsule", a: [0.79, 1.418, -0.008], b: [0.866, 1.415, -0.012], radius: 0.0078, bone: "hand_l", mirror: "x", blend: 0.008, color: SKIN },
  { id: "pinky", shape: "capsule", a: [0.782, 1.418, -0.026], b: [0.84, 1.415, -0.034], radius: 0.007, bone: "hand_l", mirror: "x", blend: 0.008, color: SKIN },
  { id: "thumb", shape: "capsule", a: [0.73, 1.412, 0.034], b: [0.772, 1.408, 0.07], radius: 0.0108, bone: "hand_l", mirror: "x", blend: 0.01, color: SKIN },
  // the legs: trousers to the ankle, calves, shoes (a heel and a tapering toe) with a sole
  { id: "thigh", shape: "loft", bones: ["thigh_l"], radii: [0.092, 0.062], mirror: "x", blend: 0.03, blend_mode: "cubic", color: PANTS },
  { id: "shin", shape: "loft", bones: ["shin_l"], radii: [0.060, 0.040], mirror: "x", blend: 0.025, blend_mode: "cubic", color: PANTS },
  { id: "calf_l", shape: "ellipsoid", center: [0.09, 0.38, -0.02], radii: [0.05, 0.11, 0.056], bone: "shin_l", mirror: "x", blend: 0.03, blend_mode: "cubic", color: PANTS },
  { id: "shoe", shape: "box", center: [0.09, 0.056, 0.02], half: [0.041, 0.032, 0.075], round: 0.02, bone: "foot_l", mirror: "x", blend: 0.012, color: SHOE },
  { id: "toe", shape: "ellipsoid", center: [0.09, 0.048, 0.118], radii: [0.04, 0.025, 0.062], bone: "foot_l", mirror: "x", blend: 0.02, blend_mode: "cubic", color: SHOE },
  { id: "sole", shape: "box", center: [0.09, 0.012, 0.064], half: [0.044, 0.012, 0.116], round: 0.011, bone: "foot_l", mirror: "x", island: "soles", color: SOLE },
];
const sdf = {
  cell: 0.01, adaptive: { min_cell: 0.005, max_cell: 0.02, features: 3 }, decimate: { ratio: 0.45 },
  islands: { face: { cell: 0.0035, adaptive: false, decimate: false }, lids: { cell: 0.003, adaptive: false, decimate: false }, soles: { cell: 0.006, adaptive: false, decimate: { ratio: 0.4 } } },
  skin: { falloff: 1.5 }, shade: { ao: 0.5, ao_radius: 0.03, tone: 0.2, color_blend: 0.35 }, parts: parts,
};

// PHYSICS: the creature in the physics world (soma_phys.cpp, js/shapes.js): a FEW shapes on bones, in the bind pose's model space: a capsule for the trunk, a ball for the head, a capsule for each leg. A crate thrown at
// it knocks it, a crate it walks into is pushed (dynamic: the proxy has the creature's mass, 75 kg); `mode` "kinematic" would push and not be pushed, "off" has no proxy. soma.debug({ shapes: true }) draws them.
const physics = { mass: 75, shapes: [
  { id: "trunk", shape: "capsule", a: [0, 1.12, 0], b: [0, 1.36, 0], radius: 0.17, bone: "spine" },
  { id: "head", shape: "sphere", center: [0, 1.70, 0.02], radius: 0.115, bone: "head" },
  { id: "leg", shape: "capsule", a: [0.09, 0.85, 0], b: [0.09, 0.2, 0], radius: 0.085, mirror: "x" },          // (on the ROOT, not on the thigh: a leg that swings with the gait teleports through a crate between two frames and walks through it)
] };

return {
  name: "person", max: 16,
  family: { faction: "folk", kind: "person", hp: 100 },
  nav: { agent: "person" },
  body: {
    skeleton: bones,
    rig: rig,
    legs: legs,
    body: { accel: 3, gravity: 9.8 },
    roles: roles,
    traits: traits,
    physics: physics,
    sdf: sdf
  },
  abilities: ["walk", "open", "climb", "use", "effects"],
  interaction: { uses: ["sit", "sleep", "eat", "use"] },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 100 }],
      "needs",
      ["use", { kinds: [], clip_sit: "sit_chair", clip_sleep: "lie_on_back" }],
      ["flee", { gait: "" }],
      ["greet", { meet: 6 }],
      "curious",
      "idle_life",
      "injured",
      ["wander", { speed: 1.1 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "person", select: [ld.node("flee"), ld.node("greet"), ld.node("use"), ld.node("curious"), ld.node("idle_life"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
