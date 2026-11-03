"use strict";
// robot_arm: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A six-axis industrial arm: the base turns, the shoulder and the elbow bend, the wrist bends, the tool rolls, through a few poses.
// robot_arm: a six-axis industrial arm, 1.9 m high when it stands straight up. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, rig }.
// Metres, +x to its left, +y up, +z forward. The hardest kind of chain for a solver that thinks in positions: its joints are all hinges and twists, one after the other, in a column. The base turns (a joint that
// only twists), the shoulder and the elbow bend about x, the forearm rolls, the wrist bends, the tool rolls: the six axes. A target that is in reach of those six is reached, and none is ever outside its range.
const bones = [
  { name: "base", head: [0, 0, 0], tail: [0, 0.3, 0] },
  { name: "turret", parent: "base", head: [0, 0.3, 0], tail: [0, 0.55, 0] },                      // J1: it turns about the vertical
  { name: "link1", parent: "turret", head: [0, 0.55, 0], tail: [0, 1.05, 0] },                    // J2: the shoulder
  { name: "link2", parent: "link1", head: [0, 1.05, 0], tail: [0, 1.5, 0] },                      // J3: the elbow
  { name: "wrist1", parent: "link2", head: [0, 1.5, 0], tail: [0, 1.65, 0] },                     // J4: the forearm rolls
  { name: "wrist2", parent: "wrist1", head: [0, 1.65, 0], tail: [0, 1.75, 0] },                   // J5: the wrist bends
  { name: "tool", parent: "wrist2", head: [0, 1.75, 0], tail: [0, 1.9, 0] },                      // J6: the tool rolls
];
const rig = {
  joints: [
    { bone: "turret", kind: "ball", fwd: 0, back: 0, lat: 0, twist: 170 },
    { bone: "link1", kind: "hinge", axis: [1, 0, 0], range: [-100, 100] },
    { bone: "link2", kind: "hinge", axis: [1, 0, 0], range: [-140, 140] },
    { bone: "wrist1", kind: "ball", fwd: 0, back: 0, lat: 0, twist: 170 },
    { bone: "wrist2", kind: "hinge", axis: [1, 0, 0], range: [-115, 115] },
    { bone: "tool", kind: "ball", fwd: 0, back: 0, lat: 0, twist: 180 },
  ],
  chains: [
    { name: "arm", bones: ["turret", "link1", "link2", "wrist1", "wrist2"], tip: "tool" },        // (the tool's head, the flange, is the end)
  ],
};

// SDF: what the mesh is made of (the mesher's grammar: soma/SOMA_MESHER.md; the bones are the skeleton above, a part stands on one by name). A MACHINE, not a body: every link is an ISLAND of its own (a part with
// `island: "name"` melts into the parts of that island only), so a link keeps its shape whatever the arm does and its skin weight is its bone's alone: nothing stretches or tears at a joint. What hides the gap that a
// turn opens at a joint is a HUB, a cylinder whose axis is the joint's: it looks the same turned, so it covers the seam of the two links at every angle, and the links' round ends turn about the same point. The
// cables run to the axis of a hub (a point on the axis does not move when the joint turns) and go in there, so they never part.
const ORANGE = [0.93, 0.40, 0.06, 1], ORANGE_D = [0.74, 0.28, 0.04, 1], GREY = [0.60, 0.62, 0.66, 1], DARK = [0.17, 0.18, 0.20, 1], BLACK = [0.04, 0.04, 0.05, 1], CABLE = [0.20, 0.21, 0.23, 1], STEEL = [0.78, 0.80, 0.83, 1];
const parts = [
  // the base: a plate with four bolts, a pedestal with a connector at the back
  { id: "plate", shape: "box", center: [0, 0.03, 0], half: [0.36, 0.03, 0.36], round: 0.02, bone: "base", island: "base", color: DARK },
  { id: "bolt", shape: "cylinder", center: [0.29, 0.066, 0.29], axis: "y", radius: 0.03, half: 0.012, round: 0.006, bone: "base", island: "base", mirror: "xz", color: STEEL },
  { id: "pedestal", shape: "cylinder", center: [0, 0.18, 0], axis: "y", radius: 0.25, half: 0.12, round: 0.03, bone: "base", island: "base", color: GREY },
  { id: "plug", shape: "box", center: [0, 0.13, -0.265], half: [0.05, 0.035, 0.03], round: 0.01, bone: "base", island: "base", color: DARK },
  // the turret: a column, the shoulder housing, the shoulder's hub
  { id: "column", shape: "cylinder", center: [0, 0.41, 0], axis: "y", radius: 0.19, half: 0.1, round: 0.02, bone: "turret", island: "turret", color: ORANGE },
  { id: "housing", shape: "box", center: [0, 0.55, 0], half: [0.2, 0.17, 0.2], round: 0.08, bone: "turret", island: "turret", blend: 0.02, color: ORANGE },
  { id: "motor", shape: "box", center: [0, 0.5, -0.19], half: [0.14, 0.12, 0.08], round: 0.04, bone: "turret", island: "turret", blend: 0.02, color: ORANGE_D },
  { id: "shoulder", shape: "cylinder", center: [0, 0.55, 0], axis: "x", radius: 0.15, half: 0.24, round: 0.02, bone: "turret", island: "turret", color: DARK },
  { id: "shoulder_cap", shape: "cylinder", center: [0.245, 0.55, 0], axis: "x", radius: 0.1, half: 0.012, bone: "turret", island: "turret", mirror: "x", color: STEEL },
  // the lower arm: a tapered round link, a collar, the elbow's hub, a conduit that goes into the hub
  { id: "link1", shape: "loft", points: [[0, 0.55, 0], [0, 1.05, 0]], radii: [0.125, 0.1], radii_v: [0.125, 0.1], bone: "link1", island: "link1", blend: 0.02, color: ORANGE },
  { id: "elbow", shape: "cylinder", center: [0, 1.05, 0], axis: "x", radius: 0.115, half: 0.18, round: 0.02, bone: "link1", island: "link1", color: DARK },
  { id: "elbow_cap", shape: "cylinder", center: [0.185, 1.05, 0], axis: "x", radius: 0.075, half: 0.01, bone: "link1", island: "link1", mirror: "x", color: STEEL },
  { id: "conduit1", shape: "capsule", a: [0.1315, 0.58, 0], b: [0.1105, 1.0, 0], radius: 0.017, bone: "link1", island: "link1", color: CABLE },
  { id: "conduit1_in", shape: "capsule", a: [0.1105, 1.0, 0], b: [0.125, 1.05, 0], radius: 0.017, bone: "link1", island: "link1", color: CABLE },
  // the upper arm
  { id: "link2", shape: "loft", points: [[0, 1.05, 0], [0, 1.5, 0]], radii: [0.1, 0.07], radii_v: [0.1, 0.07], bone: "link2", island: "link2", blend: 0.02, color: ORANGE },
  { id: "conduit2_in", shape: "capsule", a: [0.125, 1.05, 0], b: [0.1038, 1.12, 0], radius: 0.017, bone: "link2", island: "link2", color: CABLE },
  { id: "conduit2", shape: "capsule", a: [0.1038, 1.12, 0], b: [0.0816, 1.44, 0], radius: 0.017, bone: "link2", island: "link2", color: CABLE },
  { id: "wrist_ring", shape: "cylinder", center: [0, 1.5, 0], axis: "y", radius: 0.078, half: 0.012, bone: "link2", island: "link2", color: DARK },
  // the forearm's roll: a housing, a connector on one side (so that the roll shows)
  { id: "roll", shape: "cylinder", center: [0, 1.575, 0], axis: "y", radius: 0.068, half: 0.075, round: 0.012, bone: "wrist1", island: "wrist1", color: GREY },
  { id: "connector", shape: "box", center: [0.075, 1.6, 0], half: [0.02, 0.02, 0.02], round: 0.006, bone: "wrist1", island: "wrist1", color: BLACK },
  // the wrist: a hub and a head
  { id: "wrist_hub", shape: "cylinder", center: [0, 1.65, 0], axis: "x", radius: 0.06, half: 0.09, round: 0.01, bone: "wrist2", island: "wrist2", color: DARK },
  { id: "wrist_cap", shape: "cylinder", center: [0.09, 1.65, 0], axis: "x", radius: 0.04, half: 0.01, bone: "wrist2", island: "wrist2", mirror: "x", color: STEEL },
  { id: "wrist_head", shape: "box", center: [0, 1.7, 0], half: [0.055, 0.05, 0.055], round: 0.025, bone: "wrist2", island: "wrist2", color: ORANGE },
  // the tool: a flange and a two finger gripper
  { id: "flange", shape: "cylinder", center: [0, 1.757, 0], axis: "y", radius: 0.058, half: 0.008, bone: "tool", island: "tool", color: GREY },
  { id: "palm", shape: "box", center: [0, 1.8, 0], half: [0.055, 0.03, 0.04], round: 0.01, bone: "tool", island: "tool", color: DARK },
  { id: "finger", shape: "box", center: [0.042, 1.87, 0], half: [0.011, 0.055, 0.025], round: 0.005, bone: "tool", island: "tool", mirror: "x", color: STEEL },
  { id: "pad", shape: "box", center: [0.029, 1.89, 0], half: [0.006, 0.025, 0.022], bone: "tool", island: "tool", mirror: "x", color: BLACK },
];
const sdf = { cell: 0.014, skin: { falloff: 0.5 }, shade: { ao: 0.4, ao_radius: 0.04, tone: 0.2, color_blend: 0.2 }, decimate: { ratio: 0.3, error: 0.003, max_edge: 0.3 }, islands: { tool: { cell: 0.005, decimate: { ratio: 0.5, error: 0.002, max_edge: 0.1 } } }, parts: parts };

return {
  name: "robot_arm", max: 16,
  family: { faction: "machine", kind: "machine", hp: 150 },
  nav: { agent: {"name":"robot_arm","radius":0.8,"height":2,"step":0.2,"slope":20,"drop":0.2} },
  body: {
    skeleton: bones,
    rig: rig,
    sdf: sdf
  },
  abilities: ["effects"],
  interaction: { uses: [] },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 150 }],
      ["operate", { joints: [{ bone: "turret", axis: "y" }, { bone: "link1", axis: "x" }, { bone: "link2", axis: "x" }, { bone: "wrist1", axis: "y" }, { bone: "wrist2", axis: "x" }, { bone: "tool", axis: "y" }], poses: [[0, 0, 0, 0, 0, 0], [60, -35, 55, 40, -30, 90], [-50, -20, 70, -60, 45, -90], [0, -40, 30, 0, 0, 0]], pause: 0.8, ease: 3 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "robot_arm", select: [ld.node("operate")] };
      return { tree: tree };
    }
  }
};
