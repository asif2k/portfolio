"use strict";
// human_woman: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A gardener: walks a round of her yard (a patrol of its zone), stands a while at each place, greets the ones she meets, sits and sleeps when she needs to, runs from danger.
// human_woman: a woman of MakeHuman's body made procedural (soma/human/HUMAN.md). ONE JS FILE IS ONE CREATURE: the `human` is the definition of her body, her hair and her clothes; the human system makes the skeleton where her morph puts
// the bones, the rig, the roles, the legs (the people style person_walk, scaled by her own legs) and the skinned mesh. A key of the file that is also a section of the creature (`legs`, `roles`, `body`, `physics`) is said over what the system made.
return {
  name: "human_woman", max: 16,
  family: { faction: "folk", kind: "person", hp: 100 },
  nav: { agent: "person" },
  body: {
    human: {
      modifiers: { gender: 0, age: 0.5, height: 0.55, weight: 0.38, muscle: 0.3, proportions: 0.55, breast_size: 0.55 },
      parts: { hair: "long01", brows: "eyebrow003", lashes: "eyelashes02", clothes: ["female_casualsuit02"], shoes: "shoes03" },
      colors: { hair: [0.36, 0.22, 0.11] }, eye: [0.27, 0.42, 0.30], tone: 0.15,
      face: { detail: 8, bones: false, mouth: true },
      gait: { walk: "person_walk_relaxed" },
      soft: true,                                                    // (soft tissue: the rig's two breast bones are masses on springs, their numbers from her macros (human_creature.js SOFT TISSUE); no bone is added)
    }
  },
  abilities: ["walk", "open", "climb", "use", "effects"],
  interaction: { uses: ["sit", "sleep", "eat", "use"] },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 100 }],
      "needs",
      ["use", { kinds: [], clip_sit: "sit_chair", clip_sleep: "lie_on_back" }],
      "flee",
      ["greet", { meet: 6 }],
      "idle_life",
      ["patrol", { zones: ["yard"], pause_min: 2, pause_max: 6, speed: 1 }],
      "injured"
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "woman", select: [ld.node("flee"), ld.node("greet"), ld.node("use"), ld.node("idle_life"), ld.node("patrol")] };
      return { tree: tree };
    }
  }
};
