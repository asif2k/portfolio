"use strict";
// human_man: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A villager: wanders about his home, gets tired, hungry and uncomfortable and goes to a bed, a table or a seat for it, greets the ones he meets, looks at newcomers, fidgets while he stands, runs from danger, can be hurt and limps.
// human_man: a man of MakeHuman's body made procedural (soma/human/HUMAN.md): see human_woman.js
return {
  name: "human_man", max: 16,
  family: { faction: "folk", kind: "person", hp: 100 },
  nav: { agent: "person" },
  body: {
    human: {
      modifiers: { gender: 1, age: 0.5, height: 0.6, weight: 0.5, muscle: 0.55, proportions: 0.5 },
      parts: { hair: "short02", brows: "eyebrow006", lashes: "eyelashes01", clothes: ["male_casualsuit02"], shoes: "shoes02" },
      colors: { hair: [0.17, 0.11, 0.07] }, eye: [0.30, 0.20, 0.10], tone: 0,
      face: { detail: 8, bones: false, mouth: true },
      gait: { walk: "person_walk" },
    }
  },
  abilities: ["walk", "open", "climb", "use", "effects", "props"],
  interaction: { uses: ["sit", "sleep", "eat", "use"] },
  // PROPS (soma/js/family_props.js): what only this family knows: an axe, drawn like the villagers themselves. Its origin is the grip and its +y the handle toward the head; the right hand holds it, the back carries it
  props: {
    axe: {
      sdf: { cell: 0.005, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "handle", shape: "capsule", a: [0, -0.1, 0], b: [0, 0.52, 0], radius: 0.021, color: [0.42, 0.28, 0.15, 1] },
        { id: "butt", shape: "sphere", center: [0, -0.11, 0], radius: 0.026, color: [0.36, 0.24, 0.13, 1] },
        { id: "neck", shape: "capsule", a: [0, 0.44, 0], b: [0, 0.5, 0], radius: 0.03, color: [0.5, 0.5, 0.54, 1] },
        { id: "blade", shape: "loft", points: [[0.03, 0.47, 0], [0.1, 0.5, 0], [0.15, 0.55, 0]], radii: [0.012, 0.008, 0.002], radii_v: [0.035, 0.065, 0.085], blend: 0.004, color: [0.72, 0.73, 0.78, 1] }
      ] },
      grip: { at: [0, -0.07, 0.02], dir: [0, 0.3, 0.95], hand: "main" },
      rest: { bone: "spine02", at: [0.12, 0.02, -0.17], dir: [0.15, 1, 0.1] },        // (spine02 is the chest of the human rig)
      // thrown: it tumbles head over handle (a spin about its own z), lands on what it meets (the world, or a creature: an impact on its zone) and lies there a while before it goes back to the pool
      throw: { speed: 13, gravity: 1, spin: [0, 0, 11], radius: 0.3, life: 5, linger: 4, hit: { impulse: 16, damage: 28 } },
      per: 1, pool: 4                                                              // (a villager may have one; the family has four axes for all its villagers: the tool shed. A take that finds none free says no)
    }
  },
  // PARTICLES (soma/js/fx.js): the dust where a thrown axe lands (a prop's mount: the burst is played at the axe where it lies)
  particles: {
    axe_dust: { effect: "dust_puff", mount: { prop: "axe", at: [0.05, 0.4, 0], dir: [0, 1, 0] }, once: "impact", scale: 0.6 }
  },
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
      var tree = { name: "man", select: [ld.node("flee"), ld.node("greet"), ld.node("use"), ld.node("curious"), ld.node("idle_life"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
