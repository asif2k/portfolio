"use strict";
// gun_hound (soma/tools/gun_hound.js makes this file from hound.js): the HOUND below, with a machine gun turret on its back and a mind that fights with it. The turret is a RIG of the weapon library (a weapon with a skeleton and no mind: the dog is its controller).
// hound: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A dog: follows the man about, looks at what comes near, runs from danger, scratches and stretches while it stands, wanders. Its clips are a dog's (the blocks' defaults are a person's).
// hound: a four-legged animal, 0.9 m long, 0.6 m at the shoulder. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, rig }.
// Metres, +x to its left, +y up, +z forward. Three kinds of solver on one body: the spine and the head are a FABRIK chain from the pelvis, the tail is another FABRIK chain of its own, the hind legs are
// `z_leg` (three bones: the thigh forward, the shin back, the metatarsus down, the way a dog's leg folds) and the front legs `limb` (two bones and a paw). Each leg is a unit of its own: the rig solves it when
// the bone it hangs from has its frame: the front legs after the spine has been solved, the hind legs from the pelvis. (A solve is the chains that have a bone in common: the spine's chain and the tail's share none.)
const bones = [];
function run(parent, names, points, mirror) {
  names.forEach(function (name, i) {
    const b = { name: name, parent: i === 0 ? parent : names[i - 1], head: points[i], tail: points[i + 1] };
    if (mirror) b.mirror = "x";
    bones.push(b);
  });
}
run(null, ["pelvis"], [[0, 0.60, -0.30], [0, 0.60, -0.12]]);
run("pelvis", ["spine", "chest", "neck", "head"], [[0, 0.60, -0.12], [0, 0.60, 0.08], [0, 0.60, 0.28], [0, 0.76, 0.40], [0, 0.78, 0.62]]);
run("pelvis", ["tail1", "tail2", "tail3"], [[0, 0.60, -0.30], [0, 0.70, -0.45], [0, 0.82, -0.55], [0, 0.95, -0.60]]);
run("pelvis", ["thigh_l", "shin_l", "meta_l", "paw_l"], [[0.09, 0.58, -0.30], [0.09, 0.40, -0.21], [0.09, 0.20, -0.33], [0.09, 0.04, -0.30], [0.09, 0.02, -0.21]], true);
run("chest", ["humerus_l", "radius_l", "fpaw_l"], [[0.09, 0.58, 0.20], [0.09, 0.36, 0.17], [0.09, 0.04, 0.20], [0.09, 0.02, 0.30]], true);
// THE FACE (soma_face.cpp): an eye LOOKS ALONG ITS BONE (the head is the middle of the eyeball, the tail toward the pupil: 30 degrees out of straight ahead); a lid turns about the level axis across its bone (the eye's: down closes it);
// the jaw opens down about its hinge (the head of the bone, at the back of the mouth); the nose sniffs and wrinkles in a snarl; an ear is a chain of two bones that hangs from the top of the head (its pitch takes the tip forward)
const EYE_DIR = [Math.sin(30 * Math.PI / 180), 0, Math.cos(30 * Math.PI / 180)];
const at = function (c, d, k) { return [c[0] + d[0] * k, c[1] + d[1] * k, c[2] + d[2] * k]; };
const EYE_C = [0.043, 0.805, 0.5];
bones.push({ name: "eye_l", parent: "head", head: EYE_C, tail: at(EYE_C, EYE_DIR, 0.015), mirror: "x" });
bones.push({ name: "lid_l", parent: "head", head: EYE_C, tail: at(EYE_C, EYE_DIR, 0.018), mirror: "x" });
bones.push({ name: "jaw", parent: "head", head: [0, 0.758, 0.47], tail: [0, 0.736, 0.612] });
bones.push({ name: "nose", parent: "head", head: [0, 0.766, 0.625], tail: [0, 0.762, 0.668] });
run("head", ["ear1_l", "ear2_l"], [[0.046, 0.842, 0.435], [0.088, 0.792, 0.434], [0.1, 0.712, 0.428]], true);

const rig = {
  joints: [
    { bone: "spine", fwd: 15, back: 15, lat: 20, twist: 20 },                // (the spine bones lie along z: forward means up for them)
    { bone: "chest", fwd: 15, back: 15, lat: 20, twist: 20 },
    { bone: "neck", fwd: 40, back: 40, lat: 50, twist: 50 },
    { bone: "head", fwd: 40, back: 40, lat: 45, twist: 40 },
    { bone: "tail1", fwd: 50, back: 50, lat: 50, twist: 20 },
    { bone: "tail2", fwd: 50, back: 50, lat: 50, twist: 20 },
    { bone: "tail3", fwd: 50, back: 50, lat: 50, twist: 20 },
    { bone: "thigh_l", mirror: "x", fwd: 70, back: 50, out: 30, in: 20, twist: 20 },
    { bone: "shin_l", mirror: "x", kind: "hinge", axis: [1, 0, 0], range: [-60, 90] },      // (0 is the bind pose, the shin 58 degrees back of the thigh: -58 is a straight leg)
    { bone: "meta_l", mirror: "x", kind: "hinge", axis: [1, 0, 0], range: [-70, 30] },
    { bone: "paw_l", mirror: "x", fwd: 30, back: 30, lat: 15, twist: 15 },
    { bone: "humerus_l", mirror: "x", fwd: 70, back: 70, out: 40, in: 20, twist: 20 },
    { bone: "radius_l", mirror: "x", kind: "hinge", axis: [-1, 0, 0], range: [-15, 140] },      // the elbow: flexing it brings the paw FORWARD and up (the bind pose is 13 degrees flexed: -13 is a straight leg)
    { bone: "fpaw_l", mirror: "x", fwd: 40, back: 40, lat: 15, twist: 15 },
  ],
  chains: [
    { name: "head", bones: ["spine", "chest", "neck", "head"] },
    { name: "tail", bones: ["tail1", "tail2", "tail3"] },                                        // (no bone in common with the spine's chain: a solve of its own)
    { name: "hind_l", mirror: "x", solver: "z_leg", bones: ["thigh_l", "shin_l", "meta_l"], tip: "paw_l", pole: [0, 0, 1], pole_w: 1 },
    { name: "fore_l", mirror: "x", solver: "limb", bones: ["humerus_l", "radius_l"], tip: "fpaw_l", pole: [0, 0, -1], pole_w: 1 },
  ],
};

// LEGS: four legs that trot (the diagonal pairs step together); a dog walks at 1 m/s with a stride of 0.3 m
const legs = { legs: [{ chain: "fore_l", mirror: "x" }, { chain: "hind_l", mirror: "x" }], gait: { speed: 1.0, stride: 0.3, swing: 0.4, step_height: 0.05, crouch: 0.02, bob: 0.006 } };

// ROLES: the pelvis is the hips, the spine and the chest the back, the neck and the head: the life breathes the chest, sways the head, twists the back with the gait and keeps the head level (the pitch of a bone that lies
// along z is about x: forward is a bend down). The face: eyes that look (the head, the neck and the back follow a look, and the head leads a turn), lids that blink, a jaw that pants when it runs, a nose that sniffs, two drop
// ears that swing out of a turn and flick, and the tail (also a FABRIK chain of the rig, for a page that asks it for a place) that wags, more as it walks
const roles = { hips: "pelvis", spine: ["spine", "chest"], neck: ["neck"], head: "head",
  eyes: [{ bone: "eye_l", mirror: "x" }], lids: [{ bone: "lid_l", mirror: "x" }], jaw: { bone: "jaw", max: 30 }, nose: "nose", ears: [{ bones: ["ear1_l", "ear2_l"], mirror: "x" }], tail: ["tail1", "tail2", "tail3"] };
// TRAITS: how far the head and the neck turn to look, in the joints' own limits (the head swings 45 degrees to the side and 40 up and down, the neck 50 and 40)
const traits = { head_yaw: 45, head_pitch: 35, neck_yaw: 40, neck_pitch: 30, blink_close: 95 };          // (its lids are small caps cut high over a deep-set eye: they turn 95 degrees to close it)

// SDF: what the mesh is made of (the mesher's grammar: soma/SOMA_MESHER.md; the parts stand on the bones above by name, a part on a _l bone with `mirror: "x"` also makes the _r twin). A tan hound with a dark saddle, a white
// brisket, white socks and a white tip to the tail, long dark drop ears and a red collar. The body melts into one skin (cubic blends of 3 to 6 cm, `skin.falloff` 1.5: a joint bends through a handful of vertices); the eyes
// and the collar are an ISLAND: they never melt into the head and neck. `adaptive` (an octree: fine cells only where the surface curves, 5 mm to 3 cm) and `decimate` (the quadric collapse of what is left) keep the
// vertices where the shape is: a crowd of hounds is drawn, not one.
const LID = [0.62, 0.37, 0.16, 1], MOUTH = [0.45, 0.12, 0.13, 1], DARKM = [0.10, 0.03, 0.03, 1];          // (the lids, the tongue, the palate: islands, with none of the head's baked shade on them)
const TAN = [0.76, 0.47, 0.21, 1], SADDLE = [0.23, 0.12, 0.06, 1], WHITE = [0.95, 0.92, 0.85, 1], EAR = [0.30, 0.16, 0.08, 1], NOSE = [0.05, 0.04, 0.04, 1], AMBER = [0.72, 0.42, 0.07, 1], PUPIL = [0.02, 0.02, 0.02, 1], RED = [0.78, 0.10, 0.08, 1], BRASS = [0.85, 0.65, 0.20, 1];
const parts = [
  // the trunk: a rump, a tucked up loin, a deep rib cage and a white brisket. The saddle is one long ellipsoid on the loin: it shows only where it stands proud of the back
  { id: "rump", shape: "ellipsoid", center: [0, 0.555, -0.265], radii: [0.098, 0.115, 0.125], bone: "pelvis", blend: 0.05, blend_mode: "cubic", color: TAN },
  { id: "loin", shape: "ellipsoid", center: [0, 0.553, -0.08], radii: [0.088, 0.108, 0.15], bone: "spine", blend: 0.06, blend_mode: "cubic", color: TAN },
  { id: "ribs", shape: "ellipsoid", center: [0, 0.515, 0.13], radii: [0.112, 0.15, 0.185], bone: "chest", blend: 0.05, blend_mode: "cubic", color: TAN },
  { id: "brisket", shape: "ellipsoid", center: [0, 0.485, 0.27], radii: [0.07, 0.10, 0.075], bone: "chest", blend: 0.04, blend_mode: "cubic", color: WHITE },
  { id: "saddle", shape: "ellipsoid", center: [0, 0.567, -0.05], radii: [0.092, 0.105, 0.35], bone: "spine", blend: 0.02, color: SADDLE },
  // the neck and the head: a skull, a long square muzzle, the hanging flews and the lower jaw
  { id: "neck", shape: "loft", bones: ["neck"], radii: [0.095, 0.066], radii_v: [0.095, 0.066], blend: 0.05, blend_mode: "cubic", color: TAN },
  { id: "skull", shape: "ellipsoid", center: [0, 0.79, 0.445], radii: [0.066, 0.064, 0.072], bone: "head", blend: 0.04, blend_mode: "cubic", color: TAN },
  { id: "muzzle", shape: "loft", points: [[0, 0.77, 0.5], [0, 0.764, 0.58], [0, 0.76, 0.625]], radii: [0.042, 0.034, 0.028], radii_v: [0.04, 0.034, 0.029], square: [0.2, 0.35, 0.35], bone: "head", blend: 0.03, blend_mode: "cubic", color: TAN },
  { id: "flew_l", shape: "ellipsoid", center: [0.036, 0.742, 0.565], radii: [0.017, 0.023, 0.048], bone: "head", mirror: "x", blend: 0.025, blend_mode: "cubic", color: TAN },
  // the lower jaw is an island of its own on the jaw bone (white, a dark tongue on top), over a dark palate under the muzzle (another island, on the head): the jaw that opens shows the dark inside of the mouth, not skin that stretches
  { id: "jaw", shape: "ellipsoid", center: [0, 0.742, 0.545], radii: [0.028, 0.018, 0.075], bone: "jaw", island: "jaw", color: WHITE },
  { id: "tongue", shape: "ellipsoid", center: [0, 0.757, 0.555], radii: [0.019, 0.006, 0.05], bone: "jaw", island: "jaw", color: MOUTH },
  { id: "palate", shape: "ellipsoid", center: [0, 0.733, 0.555], radii: [0.022, 0.006, 0.055], bone: "head", island: "palate", color: DARKM },
  { id: "nose", shape: "ellipsoid", center: [0, 0.762, 0.655], radii: [0.022, 0.018, 0.017], bone: "nose", blend: 0.012, color: NOSE },
  { id: "ear_l", shape: "loft", bones: ["ear1_l", "ear2_l"], radii: [0.014, 0.013, 0.01], radii_v: [0.032, 0.044, 0.026], mirror: "x", blend: 0.012, blend_mode: "cubic", color: EAR },
  // the eyes (amber, a pupil and a glint on the eye's bone: they turn about the middle of the eyeball, the pupil 30 degrees out of straight ahead) and the collar with its tag: an island on a grid of its own (the nose and the
  // ears melt into the head)
  { id: "eye_l", shape: "sphere", center: EYE_C, radius: 0.015, bone: "eye_l", mirror: "x", island: "face", color: AMBER },
  { id: "pupil_l", shape: "sphere", center: at(EYE_C, EYE_DIR, 0.0115), radius: 0.0055, bone: "eye_l", mirror: "x", island: "face", color: PUPIL },
  { id: "glint_l", shape: "sphere", center: [EYE_C[0] + EYE_DIR[0] * 0.0145, EYE_C[1] + 0.004, EYE_C[2] + EYE_DIR[2] * 0.0145], radius: 0.002, bone: "eye_l", mirror: "x", island: "face", color: [1, 1, 1, 1] },
  // the upper lids: a cap of fur a little wider than the eyeball and its pupil, cut a little above the middle (an island of their own: the cap would swallow the eye in the face's); a blink turns it down over the eye
  { id: "lid_l", shape: "sphere", center: EYE_C, radius: 0.0183, bone: "lid_l", mirror: "x", island: "lids", color: LID },
  { id: "lid_cut_l", shape: "box", center: [EYE_C[0], EYE_C[1] + 0.010 - 0.025, EYE_C[2]], half: [0.03, 0.025, 0.03], bone: "lid_l", mirror: "x", island: "lids", op: "subtract", color: LID },          // (cut 10 mm over the middle: at 6 and 8 the hound looked sleepy; closed, the cap still covers the eye)
  { id: "collar", shape: "torus", center: [0, 0.68, 0.34], axis: [0, 0.8, 0.6], radius: 0.082, tube: 0.012, bone: "neck", island: "face", color: RED },
  { id: "tag", shape: "sphere", center: [0, 0.618, 0.43], radius: 0.015, bone: "neck", island: "face", color: BRASS },
  // the tail: a sabre carried high, with a white tip
  { id: "tail", shape: "loft", bones: ["tail1", "tail2"], radii: [0.042, 0.036, 0.029], blend: 0.03, blend_mode: "cubic", color: TAN },
  { id: "tail_tip", shape: "loft", bones: ["tail3"], radii: [0.029, 0.016], blend: 0.03, blend_mode: "cubic", color: WHITE },
  // the fore legs: the upper arm, the elbow, a long forearm that goes white at mid leg, the paw
  { id: "blade_l", shape: "ellipsoid", center: [0.085, 0.575, 0.17], radii: [0.04, 0.085, 0.085], bone: "chest", mirror: "x", blend: 0.05, blend_mode: "cubic", color: TAN },
  { id: "upper_arm", shape: "loft", bones: ["humerus_l"], radii: [0.046, 0.038], radii_v: [0.066, 0.046], mirror: "x", blend: 0.05, blend_mode: "cubic", color: TAN },
  { id: "elbow", shape: "sphere", center: [0.09, 0.36, 0.165], radius: 0.042, bone: "radius_l", mirror: "x", blend: 0.03, blend_mode: "cubic", color: TAN },
  { id: "forearm_up", shape: "loft", points: [[0.09, 0.36, 0.17], [0.09, 0.20, 0.185]], radii: [0.044, 0.0355], bone: "radius_l", mirror: "x", blend: 0.03, blend_mode: "cubic", color: TAN },
  { id: "forearm", shape: "loft", points: [[0.09, 0.20, 0.185], [0.09, 0.04, 0.20]], radii: [0.0355, 0.027], bone: "radius_l", mirror: "x", blend: 0.03, blend_mode: "cubic", color: WHITE },
  { id: "fpaw", shape: "ellipsoid", center: [0.09, 0.033, 0.245], radii: [0.032, 0.032, 0.058], bone: "fpaw_l", mirror: "x", blend: 0.02, blend_mode: "cubic", color: WHITE },
  // the hind legs: a big haunch, the thigh, the shin, a high hock, the metatarsus, the paw
  { id: "haunch", shape: "ellipsoid", center: [0.095, 0.50, -0.30], radii: [0.06, 0.105, 0.10], bone: "thigh_l", mirror: "x", blend: 0.04, blend_mode: "cubic", color: TAN },
  { id: "thigh", shape: "loft", bones: ["thigh_l"], radii: [0.07, 0.048], mirror: "x", blend: 0.04, blend_mode: "cubic", color: TAN },
  { id: "stifle", shape: "sphere", center: [0.09, 0.40, -0.21], radius: 0.048, bone: "shin_l", mirror: "x", blend: 0.03, blend_mode: "cubic", color: TAN },
  { id: "shin", shape: "loft", bones: ["shin_l"], radii: [0.048, 0.03], mirror: "x", blend: 0.03, blend_mode: "cubic", color: TAN },
  { id: "hock", shape: "sphere", center: [0.09, 0.205, -0.337], radius: 0.032, bone: "meta_l", mirror: "x", blend: 0.025, blend_mode: "cubic", color: TAN },
  { id: "meta", shape: "loft", bones: ["meta_l"], radii: [0.03, 0.021], mirror: "x", blend: 0.025, blend_mode: "cubic", color: WHITE },
  { id: "hpaw", shape: "ellipsoid", center: [0.09, 0.033, -0.255], radii: [0.032, 0.032, 0.058], bone: "paw_l", mirror: "x", blend: 0.02, blend_mode: "cubic", color: WHITE },
];
const sdf = { cell: 0.01, adaptive: { min_cell: 0.005, max_cell: 0.03 }, decimate: { ratio: 0.4 }, skin: { falloff: 1.5 }, shade: { ao: 0.5, ao_radius: 0.03, tone: 0.2, color_blend: 0.5 }, parts: parts,
  islands: { lids: { cell: 0.0035, adaptive: false, decimate: false }, jaw: { cell: 0.005, adaptive: false, decimate: { ratio: 0.5 } }, palate: { cell: 0.005, adaptive: false, decimate: { ratio: 0.5 } } } };

// PHYSICS: the creature in the physics world (soma_phys.cpp, js/shapes.js): a capsule for the trunk, a ball for the head, a capsule for each leg (the hind legs on the thighs, the fore legs on the humeri); 30 kg
const physics = { mass: 30, shapes: [
  { id: "body", shape: "capsule", a: [0, 0.60, -0.2], b: [0, 0.60, 0.18], radius: 0.14, bone: "spine" },
  { id: "head", shape: "sphere", center: [0, 0.77, 0.52], radius: 0.1, bone: "head" },
  { id: "hind", shape: "capsule", a: [0.09, 0.50, -0.27], b: [0.09, 0.12, -0.27], radius: 0.06, bone: "thigh_l", mirror: "x" },
  { id: "fore", shape: "capsule", a: [0.09, 0.48, 0.2], b: [0.09, 0.12, 0.2], radius: 0.05, bone: "humerus_l", mirror: "x" },
] };

// The hounds of a pack differ in the colour of their coat and of the saddle on their back: the tan parts are the COAT and the saddle is its own dye (soma.js, js/variants.js). The paws, the ears, the brisket
// and the tip of the tail stay as they are. `looks` is the LIST a spawn picks from: sp.spawn({ variant: 2 }) is a black one (a number is taken round the list; a name does as well: variant: "black"), sp.spawn({ seed })
// picks one by a seed, and a spawn that says nothing is as this file paints it.
const variants = {
  dyes: {
    coat: { parts: ["rump", "loin", "ribs", "neck", "skull", "muzzle", "flew_l", "tail", "blade_l", "upper_arm", "elbow", "forearm_up", "haunch", "thigh", "stifle", "shin", "hock"],
            palette: [[0.76, 0.47, 0.21], [0.35, 0.20, 0.10], [0.12, 0.10, 0.09], [0.80, 0.72, 0.50], [0.55, 0.50, 0.45]] },
    saddle: { parts: ["saddle"], palette: [[0.23, 0.12, 0.06], [0.06, 0.05, 0.05], [0.50, 0.45, 0.35]] }
  },
  looks: { classic: { coat: 0, saddle: 0 }, chestnut: { coat: 1, saddle: 1 }, black: { coat: 2, saddle: 2 }, cream: { coat: 3, saddle: 0 }, grey: { coat: 4, saddle: 1 } }
};

return {
  name: "gun_hound", max: 12,
  family: { faction: "army", kind: "dog", hp: 90 },
  nav: { agent: "small" },
  body: {
    skeleton: bones,
    rig: rig,
    legs: legs,
    body: { gravity: 9.8 },
    roles: roles,
    traits: traits,
    physics: physics,
    sdf: sdf,
    variants: variants
  },
  abilities: ["walk", "effects", "props"],
  interaction: { uses: [] },
  // PROPS (soma/js/family_props.js, soma/weapons/machine_gun_turret.js): the turret is a RIG, three parts that are mounted together on the dog's chest bone (its back): a base, a head that turns about the vertical, a gun that nods. It has no mind: the dog's own mind turns it (me.aim / me.turn) and fires it (me.fire).
  // `scale` makes it a dog's size; the flash at its muzzle is the creature's particle `mg_flash`. Born with the dog (`start: "rest"`).
  props: Object.assign({}, api.rig("machine_gun_turret", "mg", { rest: { bone: "chest", at: [0, 0.12, 0], dir: [0, 0, 1] }, scale: 0.5 })),
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 90 }],
      ["flee", { speed: 5.5, distance: 12 }],
      ["follow", { group: "human_man", look: 16, far: 3, near: 1.5, speed: 1.8, run_speed: 5 }],
      ["curious", { approach: 0.8, cooldown: 15, near: 1 }],
      ["idle_life", { clip_look: "corgi_emote_3", clip_stretch: "lion_emote", clip_scratch: "cat_groom_2", clip_yawn: "yawn_hand", clip_shift: "retriever_idle_2", clip_sit: "akita_inu_rest" }],
      ["injured", { clip_flinch: "" }],
      ["gunner", { weapon: "mg", mode: "fire", aim: "mount", hold: false, sight: 40, range: 22, burst: 6, shot_gap: 0.09, pause: 1.1, aim_time: 0.25, damage: 8, accuracy: 0.7, aim_y: 0.9, speed: 1.6, run_speed: 5 }],
      ["wander", { speed: 1.4 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "gun_hound", select: [ld.node("gunner"), ld.node("flee"), ld.node("follow"), ld.node("curious"), ld.node("idle_life"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
