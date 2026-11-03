"use strict";
// human_elder: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// An elder: slow, sits and sleeps often (it tires sooner), looks at whoever comes by and stands about, wanders a little.
// human_elder: a man of eighty, MakeHuman's body made procedural (soma/human/HUMAN.md): see human_woman.js. The old skins (the baked ones are blended by age), grey hair, a careful walk.
return {
  name: "human_elder", max: 16,
  family: { faction: "folk", kind: "person", hp: 100 },
  nav: { agent: "person" },
  body: {
    human: {
      modifiers: { gender: 1, age: 0.93, height: 0.45, weight: 0.45, muscle: 0.2, proportions: 0.4 },
      parts: { hair: "short04", brows: "eyebrow007", lashes: "eyelashes01", clothes: ["male_casualsuit04"], shoes: "shoes02" },
      colors: { hair: [0.78, 0.78, 0.76], brows: [0.65, 0.64, 0.62] }, eye: [0.35, 0.28, 0.18], tone: 0,
      face: { detail: 8, bones: false, mouth: true },
      gait: { walk: "person_walk_cautious" },
    }
  },
  abilities: ["walk", "open", "climb", "use", "effects"],
  interaction: { uses: ["sit", "sleep", "eat", "use"] },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 70 }],
      ["needs", { needs: { energy: { affordance: "sleep", decay: 0.007, low: 0.4, high: 0.9, restore: 0.05, start: 0.6 }, hunger: { affordance: "eat", decay: 0.006, low: 0.35, high: 0.95, restore: 0.12, start: 0.7 }, comfort: { affordance: "sit", decay: 0.012, low: 0.35, high: 0.85, restore: 0.1, start: 0.5 } } }],
      ["use", { kinds: [], clip_sit: "sit_chair", clip_sleep: "lie_on_back" }],
      ["flee", { speed: 2 }],
      ["curious", { approach: 0.2 }],
      ["idle_life", { gap_min: 3, gap_max: 9 }],
      ["injured", { at_limp: 0.15 }],
      ["wander", { speed: 0.7, pause_min: 3, pause_max: 9, radius: 5 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "elder", select: [ld.node("flee"), ld.node("use"), ld.node("curious"), ld.node("idle_life"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
