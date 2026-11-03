"use strict";
// human_child: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A child: follows the woman about (it is a group of the species `human_woman`), looks at everything, runs from danger, dances when it is told to, wanders fast when nobody is near.
return {
  name: "human_child", max: 16,
  family: { faction: "folk", kind: "person", hp: 100 },
  nav: { agent: "person" },
  body: {
    human: {
      modifiers: { gender: 0.2, age: 0.13, height: 0.7, weight: 0.4, muscle: 0.3 },
      parts: { hair: "short03", brows: "eyebrow004", lashes: "eyelashes03", clothes: ["female_casualsuit01"], shoes: "shoes01" },
      colors: { hair: [0.45, 0.28, 0.12] }, eye: [0.22, 0.34, 0.50], tone: 0.2,
      face: { detail: 8, bones: false, mouth: true },
      gait: { walk: "person_walk_cheerful" },
    }
  },
  abilities: ["walk", "open", "climb", "use", "effects"],
  interaction: { uses: ["sit", "sleep", "eat", "use"] },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 60 }],
      "needs",
      ["use", { kinds: [], clip_sit: "sit_chair", clip_sleep: "lie_on_back" }],
      ["flee", { speed: 3.8 }],
      ["follow", { group: "human_woman", look: 18, far: 3, near: 2 }],
      ["curious", { approach: 0.7, cooldown: 12 }],
      "dance",
      ["idle_life", { gap_min: 2, gap_max: 8 }],
      ["wander", { speed: 1.5, pause_min: 0.5, pause_max: 2.5 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "child", select: [ld.node("flee"), ld.node("dance"), ld.node("follow"), ld.node("use"), ld.node("curious"), ld.node("idle_life"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
