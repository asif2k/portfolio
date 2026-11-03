"use strict";
// sentry: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A SENTRY GUN: a machine gun on a tripod behind a shield, 1.3 m high. It cannot move; it watches. The `gunner` block turns its turret (the bone `turret`, about the vertical) and raises its gun (the bone `gun`, a hinge) to the nearest creature that is hostile to it
// within 50 m and fires bursts of ten (the prop `mg`: a hitscan from its muzzle, 12 shots a second; the page plays the flash), taking the target's hit points as the shots hit. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and
// RETURNS the creature { name, family, nav, body, props, particles, abilities, interaction, mind }.
// Metres, +x to its left, +y up, +z forward. A machine of ISLANDS: the tripod (the root), the turret (the turret bone: the shield, the drum and the seat of the gun), the gun's cradle (the gun bone); the gun itself is the PROP `mg`, a mesh round a bone of its own that the
// gun bone carries at its rest place (the breech) and that the page draws with the sentry's own rows: nothing of it is in the worker.
const bones = [
  { name: "root", head: [0, 0.05, 0], tail: [0, 0.3, 0] },
  { name: "turret", parent: "root", head: [0, 0.85, 0], tail: [0, 1.05, 0] },
  { name: "gun", parent: "turret", head: [0, 1.05, 0.12], tail: [0, 1.05, 0.9] },
];
const rig = {
  joints: [
    { bone: "turret", kind: "ball", fwd: 0, back: 0, lat: 0, twist: 180 },                    // (it slews about its own axis, it does not tilt)
    { bone: "gun", kind: "hinge", axis: [1, 0, 0], range: [-40, 15] },                         // (a turn about -x raises the muzzle: 40 degrees up, 15 down)
  ],
  chains: [],
};
const OLIVE = [0.19, 0.22, 0.12, 1], OLIVE_D = [0.12, 0.14, 0.075, 1], STEEL = [0.5, 0.52, 0.55, 1], DARK = [0.08, 0.085, 0.09, 1], BRASS = [0.6, 0.45, 0.14, 1], SAND = [0.4, 0.34, 0.2, 1];
const parts = [
  // the tripod: three legs from a head over the root, each with a foot, and a column up to the turret ring
  { id: "column", shape: "cylinder", center: [0, 0.55, 0], axis: "y", radius: 0.07, half: 0.3, round: 0.01, bone: "root", island: "tripod", color: DARK },
  { id: "head", shape: "sphere", center: [0, 0.82, 0], radius: 0.11, bone: "root", island: "tripod", color: OLIVE_D },
  { id: "leg_a", shape: "capsule", a: [0, 0.8, 0], b: [0.62, 0.03, 0.52], radius: 0.035, bone: "root", island: "tripod", color: OLIVE_D },
  { id: "leg_b", shape: "capsule", a: [0, 0.8, 0], b: [-0.62, 0.03, 0.52], radius: 0.035, bone: "root", island: "tripod", color: OLIVE_D },
  { id: "leg_c", shape: "capsule", a: [0, 0.8, 0], b: [0, 0.03, -0.75], radius: 0.035, bone: "root", island: "tripod", color: OLIVE_D },
  { id: "foot_a", shape: "cylinder", center: [0.62, 0.02, 0.52], axis: "y", radius: 0.07, half: 0.02, bone: "root", island: "tripod", color: DARK },
  { id: "foot_b", shape: "cylinder", center: [-0.62, 0.02, 0.52], axis: "y", radius: 0.07, half: 0.02, bone: "root", island: "tripod", color: DARK },
  { id: "foot_c", shape: "cylinder", center: [0, 0.02, -0.75], axis: "y", radius: 0.07, half: 0.02, bone: "root", island: "tripod", color: DARK },
  // the turret: the shield (a plate with a gap for the gun, a wing each side), a drum for the traverse, an ammunition box and a sandbag on the seat
  { id: "ring", shape: "cylinder", center: [0, 0.9, 0], axis: "y", radius: 0.17, half: 0.04, round: 0.01, bone: "turret", island: "turret", color: OLIVE_D },
  { id: "shield", shape: "box", center: [0, 1.08, 0.2], half: [0.3, 0.2, 0.018], round: 0.01, bone: "turret", island: "turret", color: OLIVE },
  { id: "wing", shape: "box", center: [0.3, 1.08, 0.13], half: [0.018, 0.2, 0.09], round: 0.008, bone: "turret", island: "turret", mirror: "x", color: OLIVE },
  { id: "gap", shape: "box", center: [0, 1.05, 0.2], half: [0.045, 0.045, 0.05], op: "subtract", bone: "turret", island: "turret" },
  { id: "ammo", shape: "box", center: [-0.2, 0.93, 0.0], half: [0.07, 0.08, 0.1], round: 0.01, bone: "turret", island: "turret", color: SAND },
  { id: "seat", shape: "box", center: [0, 0.93, -0.12], half: [0.1, 0.03, 0.1], round: 0.01, bone: "turret", island: "turret", color: DARK },
  // the gun's cradle: a pair of trunnion blocks and the sleeve that the gun bone turns in
  { id: "trunnion", shape: "box", center: [0.075, 1.05, 0.12], half: [0.02, 0.05, 0.05], round: 0.006, bone: "gun", island: "cradle", mirror: "x", color: STEEL },
  { id: "sleeve", shape: "cylinder", center: [0, 1.05, 0.13], axis: "z", radius: 0.04, half: 0.06, round: 0.008, bone: "gun", island: "cradle", color: DARK },
];
const sdf = {
  cell: 0.015, skin: { falloff: 1 }, shade: { ao: 0.3, ao_radius: 0.06, tone: 0.2, color_blend: 0 }, decimate: { ratio: 0.05, error: 0.004, max_edge: 0.4 },
  islands: {
    tripod: { cell: 0.012, decimate: { ratio: 0.05, error: 0.003, max_edge: 0.3 } },
    turret: { cell: 0.01, decimate: { ratio: 0.05, error: 0.003, max_edge: 0.25 } },
    cradle: { cell: 0.008, decimate: { ratio: 0.1, error: 0.002, max_edge: 0.15 } },
  },
  parts: parts,
};
// the machine gun: a mesh round one imaginary bone, +y along its barrel, the origin at the breech, the muzzle at the far end of +y
const mg_sdf = {
  cell: 0.007, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
    { id: "receiver", shape: "box", center: [0, 0.14, 0], half: [0.04, 0.16, 0.045], round: 0.008, color: DARK },
    { id: "jacket", shape: "cylinder", center: [0, 0.5, 0], axis: [0, 1, 0], radius: 0.03, half: 0.22, round: 0.006, color: STEEL },
    { id: "barrel", shape: "capsule", a: [0, 0.7, 0], b: [0, 1.0, 0], radius: 0.013, color: DARK },
    { id: "hider", shape: "cylinder", center: [0, 1.02, 0], axis: [0, 1, 0], radius: 0.022, half: 0.03, color: DARK },
    { id: "box", shape: "box", center: [-0.07, 0.14, -0.02], half: [0.04, 0.07, 0.07], round: 0.008, color: OLIVE },
    { id: "belt", shape: "capsule", a: [-0.04, 0.18, 0], b: [-0.025, 0.18, 0.03], radius: 0.01, color: BRASS },
    { id: "handle", shape: "box", center: [0, 0.4, -0.05], half: [0.008, 0.07, 0.014], color: DARK }
  ]
};
return {
  name: "sentry", max: 16,
  family: { faction: "army", kind: "machine", hp: 200 },
  nav: { agent: {"name":"sentry","radius":0.8,"height":1.4,"step":0.2,"slope":20,"drop":0.2} },
  body: {
    skeleton: bones,
    rig: rig,
    sdf: sdf
  },
  abilities: ["walk", "effects", "props"],
  interaction: { uses: [] },
  // PROPS (soma/js/family_props.js): the machine gun, carried by the gun bone at its rest place; `fire` makes it a weapon (the hitscan from its muzzle: range, damage, spread, a rate of shots a second), `start: "rest"` has every sentry born with its own
  props: {
    mg: {
      sdf: mg_sdf,
      rest: { bone: "gun", along: 0.02, at: [0, 0, 0], dir: [0, 0, 1] },
      start: "rest",
      fire: { muzzle: { at: [0, 1.06, 0] }, range: 160, impulse: 5, damage: 12, spread: 0.02, rate: 12 }
    }
  },
  // PARTICLES (soma/js/fx.js): the flash at the muzzle when the gun fires (a mount on the prop: it plays at every shot)
  particles: {
    mg_flash: { effect: "muzzle_flash", mount: { prop: "mg", at: [0, 1.07, 0], dir: [0, 1, 0] }, once: "fire", scale: 1.1 }
  },
  mind: {
    hz: 8, far_hz: 3,
    blocks: [
      ["health", { hp: 200 }],
      ["gunner", { weapon: "mg", mode: "fire", aim: "turret", hold: true, sight: 60, range: 50, burst: 10, shot_gap: 0.085, pause: 1.1, aim_time: 0.35, damage: 10, accuracy: 0.7, aim_y: 1.0, turret: "turret", gun: "gun", muzzle_y: 1.05, turret_rate: 2.2, gun_rate: 1.5, gun_min: -0.26, gun_max: 0.7, fx: "" }]
    ],
    // THE WORKER: a creature declares its tree. It does one thing: it shoots what is hostile and in range; the rest of the time it watches.
    worker: function (api, ld) {
      var tree = { name: "sentry", select: [ld.node("gunner")] };
      return { tree: tree };
    }
  }
};
