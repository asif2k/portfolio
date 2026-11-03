"use strict";
// police_detective: A DETECTIVE of the police family (soma/tools/police_squad.js writes this file: the gear that several officers carry is one recipe there; edit this file by hand or the recipe and run it again).
// a man in a charcoal suit and a fedora: a badge on his chest, a pistol in the shoulder holster, a flashlight on his belt. Curious about whoever comes near.
// The faction is `police`; the body is a person of the human system (soma/human/HUMAN.md); the props are what only this family knows (soma/js/family_props.js): each officer is BORN WITH what has a `start` (a holstered pistol, a helmet, a vest),
// takes the rest from the family's pool when it needs it; a prop with a `pool` is shared by every officer of the squad; a weapon has a `fire` section (the hitscan from its muzzle, the damage, the rate), a thrown one a `throw` section. The mind is the blocks it loads and its tree.
return {
  name: "police_detective", max: 8,
  family: { faction: "police", kind: "person", hp: 100 },
  nav: { agent: "person" },
  body: {
    human: {
      modifiers: { gender: 1, age: 0.6, height: 0.5, weight: 0.5, muscle: 0.4, proportions: 0.5 },
      parts: { hair: "short04", brows: "eyebrow008", lashes: "eyelashes01", clothes: ["male_elegantsuit01"], shoes: "shoes02", hat: "fedora01" },
      colors: { hair: [0.25, 0.2, 0.15], clothes: [0.45, 0.45, 0.5], shoes: [0.1, 0.07, 0.05], hat: [0.35, 0.33, 0.3] }, eye: [0.32, 0.22, 0.12], tone: 0.05,
      face: { detail: 8, bones: false, mouth: true },
      gait: { walk: "person_walk" }
    },
    // THE LOOKS (soma/js/variants.js): the individuals of this role: the uniform, the hair and the shoes (or the hat) are dyes of the parts of the mesh, each officer spawned wears one look of the list (spawn({ variant: n }) says which)
    variants: {
      dyes: {
        uniform: { parts: ["clothes"], palette: [[0.08, 0.08, 0.1], [0.17, 0.1, 0.06], [0.04, 0.06, 0.14], [0.3, 0.3, 0.33]] },
        hair: { parts: ["hair"], palette: [[0.03, 0.025, 0.02], [0.07, 0.04, 0.025], [0.16, 0.09, 0.05], [0.5, 0.36, 0.18], [0.28, 0.09, 0.04], [0.3, 0.3, 0.3]] },
        hat_color: { parts: ["hat"], palette: [[0.2, 0.17, 0.13], [0.03, 0.03, 0.03], [0.35, 0.28, 0.18], [0.15, 0.16, 0.2]] }
      },
      optional: { hat: { parts: ["hat"] } },
      looks: [
        { uniform: 0, hair: 1, hat_color: 0 },
        { uniform: 1, hair: 2, hat_color: 2 },
        { uniform: 2, hair: 0, hat_color: 1, hat: false },
        { uniform: 3, hair: 3, hat_color: 3 },
        { uniform: 0, hair: 5, hat_color: 1 },
        { uniform: 1, hair: 4, hat_color: 0, hat: false }
      ]
    }
  },
  abilities: ["walk", "open", "climb", "use", "effects", "props"],
  interaction: { uses: ["sit", "sleep", "eat", "use"] },
  // PROPS: each a species of its own (an sdf the mesher makes), origin where the hand holds it, +y its long axis; `start`: every new officer takes one at once, at that place. A weapon of the library (soma/weapons/) is `api.weapon(name, { what this creature says over it })`:
  // its sdf, its grip, its muzzle, its shots and how it is aimed (both hands, the butt at the shoulder) are the library's, the flash at its muzzle comes with it
  props: {
    badge: {
      sdf: { cell: 0.005, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "plate", shape: "cylinder", center: [0, 0, 0], axis: [0, 0, 1], radius: 0.027, half: 0.004, color: [0.72, 0.52, 0.1, 1] },
        { id: "star", shape: "sphere", center: [0, 0, 0.004], radius: 0.012, color: [0.85, 0.65, 0.15, 1] }
      ] },
      rest: { bone: "spine02", at: [-0.08, 0.1, 0.13], dir: [0, 1, 0] },
      start: "rest"
    },
    pistol: api.weapon("pistol", { rest: { bone: "spine02", at: [0.16, 0, 0.04], dir: [0.1, -1, 0.15] }, start: "rest" }),
    flashlight: {
      sdf: { cell: 0.005, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "body", shape: "cylinder", center: [0, 0, 0], axis: [0, 1, 0], radius: 0.02, half: 0.075, color: [0.025, 0.025, 0.03, 1] },
        { id: "head", shape: "cylinder", center: [0, 0.09, 0], axis: [0, 1, 0], radius: 0.032, half: 0.025, color: [0.11, 0.12, 0.14, 1] },
        { id: "lens", shape: "cylinder", center: [0, 0.113, 0], axis: [0, 1, 0], radius: 0.027, half: 0.004, color: [0.8, 0.78, 0.6, 1] }
      ] },
      grip: { along: 0.09, dir: [-0.003, 0.819, 0.574], roll: -34.3, hand: "main" },
      rest: { bone: "spine05", at: [-0.15, -0.08, -0.1], dir: [0, -1, 0] },
      start: "rest"
    }
  },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 100 }],
      "injured",
      "greet",
      "curious",
      "idle_life",
      ["guard", {  }]
    ],
    // THE WORKER: the tree. Greets and looks at whoever comes near, walks a round when the world has one, stands its post. Using a weapon is a verb of the mind (me.take / put / fire / throw: SOMA_WORKER_API.md); the blocks that do come later
    worker: function (api, ld) {
      var tree = { name: "police_detective", select: [ld.node("greet"), ld.node("curious"), ld.node("idle_life"), ld.node("guard")] };
      return { tree: tree };
    }
  }
};
