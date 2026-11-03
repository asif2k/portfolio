"use strict";
// police_patrol: A PATROL OFFICER of the police family (soma/tools/police_squad.js writes this file: the gear that several officers carry is one recipe there; edit this file by hand or the recipe and run it again).
// a man in navy: cap, soft vest, a radio, a pistol in the holster, a baton on the belt and a flashlight. Walks a round, stands his post, greets and looks at whoever comes near.
// The faction is `police`; the body is a person of the human system (soma/human/HUMAN.md); the props are what only this family knows (soma/js/family_props.js): each officer is BORN WITH what has a `start` (a holstered pistol, a helmet, a vest),
// takes the rest from the family's pool when it needs it; a prop with a `pool` is shared by every officer of the squad; a weapon has a `fire` section (the hitscan from its muzzle, the damage, the rate), a thrown one a `throw` section. The mind is the blocks it loads and its tree.
return {
  name: "police_patrol", max: 12,
  family: { faction: "police", kind: "person", hp: 110 },
  nav: { agent: "person" },
  body: {
    human: {
      modifiers: { gender: 1, age: 0.4, height: 0.55, weight: 0.5, muscle: 0.5, proportions: 0.5 },
      parts: { hair: "short03", brows: "eyebrow004", lashes: "eyelashes01", clothes: ["male_casualsuit03"], shoes: "shoes05" },
      colors: { hair: [0.09, 0.065, 0.05], clothes: [0.1, 0.14, 0.3], shoes: [0.12, 0.12, 0.12] }, eye: [0.28, 0.2, 0.12], tone: 0.1,
      face: { detail: 8, bones: false, mouth: true },
      gait: { walk: "person_walk" }
    },
    // THE LOOKS (soma/js/variants.js): the individuals of this role: the uniform, the hair and the shoes (or the hat) are dyes of the parts of the mesh, each officer spawned wears one look of the list (spawn({ variant: n }) says which)
    variants: {
      dyes: {
        uniform: { parts: ["clothes"], palette: [[0.045, 0.07, 0.18], [0.03, 0.04, 0.09], [0.09, 0.11, 0.17], [0.2, 0.32, 0.55]] },
        hair: { parts: ["hair"], palette: [[0.03, 0.025, 0.02], [0.07, 0.04, 0.025], [0.16, 0.09, 0.05], [0.5, 0.36, 0.18], [0.28, 0.09, 0.04], [0.3, 0.3, 0.3]] },
        shoes: { parts: ["shoes"], palette: [[0.02, 0.02, 0.02], [0.1, 0.06, 0.03]] }
      },
      looks: [
        { uniform: 0, hair: 1, shoes: 0 },
        { uniform: 1, hair: 2, shoes: 0 },
        { uniform: 2, hair: 0, shoes: 1 },
        { uniform: 3, hair: 3, shoes: 0 },
        { uniform: 0, hair: 4, shoes: 1 },
        { uniform: 1, hair: 5, shoes: 0 }
      ]
    }
  },
  abilities: ["walk", "open", "climb", "use", "effects", "props"],
  interaction: { uses: ["sit", "sleep", "eat", "use"] },
  // PROPS: each a species of its own (an sdf the mesher makes), origin where the hand holds it, +y its long axis; `start`: every new officer takes one at once, at that place. A weapon of the library (soma/weapons/) is `api.weapon(name, { what this creature says over it })`:
  // its sdf, its grip, its muzzle, its shots and how it is aimed (both hands, the butt at the shoulder) are the library's, the flash at its muzzle comes with it
  props: {
    cap: {
      sdf: { cell: 0.005, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "crown", shape: "cylinder", center: [0, 0.04, 0], axis: [0, 1, 0], radius: 0.1, half: 0.04, round: 0.012, color: [0.035, 0.05, 0.13, 1] },
        { id: "band", shape: "cylinder", center: [0, 0.012, 0], axis: [0, 1, 0], radius: 0.104, half: 0.014, color: [0.025, 0.025, 0.03, 1] },
        { id: "visor", shape: "ellipsoid", center: [0, 0, 0.1], radii: [0.07, 0.006, 0.05], color: [0.025, 0.025, 0.03, 1] },
        { id: "badge", shape: "cylinder", center: [0, 0.045, 0.099], axis: [0, 0, 1], radius: 0.017, half: 0.004, color: [0.72, 0.52, 0.1, 1] }
      ] },
      rest: { bone: "head", at: [0, 0.12, 0.01], dir: [0, 1, 0] },
      start: "rest"
    },
    vest: {
      sdf: { cell: 0.008, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "torso", shape: "box", center: [0, 0, 0], half: [0.168, 0.17, 0.118], round: 0.045, color: [0.035, 0.05, 0.13, 1] },
        { id: "panel", shape: "box", center: [0, 0.02, 0.118], half: [0.1, 0.1, 0.006], round: 0.004, color: [0.05, 0.07, 0.16, 1] },
        { id: "pocket_l", shape: "box", center: [0.08, -0.1, 0.122], half: [0.04, 0.035, 0.012], round: 0.005, color: [0.025, 0.025, 0.03, 1] },
        { id: "pocket_r", shape: "box", center: [-0.08, -0.1, 0.122], half: [0.04, 0.035, 0.012], round: 0.005, color: [0.025, 0.025, 0.03, 1] }
      ] },
      rest: { bone: "spine02", at: [0, 0.04, 0.03], dir: [0, 1, 0] },
      start: "rest"
    },
    radio: {
      sdf: { cell: 0.005, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "body", shape: "box", center: [0, 0, 0], half: [0.03, 0.05, 0.017], round: 0.006, color: [0.025, 0.025, 0.03, 1] },
        { id: "speaker", shape: "box", center: [0, -0.015, 0.016], half: [0.02, 0.025, 0.004], color: [0.11, 0.12, 0.14, 1] },
        { id: "antenna", shape: "capsule", a: [0.018, 0.05, 0], b: [0.018, 0.15, 0], radius: 0.004, color: [0.025, 0.025, 0.03, 1] }
      ] },
      rest: { bone: "spine01", at: [0.12, 0.07, 0.1], dir: [0, 1, 0] },
      start: "rest"
    },
    pistol: api.weapon("pistol", { start: "rest" }),
    baton: {
      sdf: { cell: 0.005, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "shaft", shape: "capsule", a: [0, -0.075, 0], b: [0, 0.385, 0], radius: 0.014, color: [0.025, 0.025, 0.03, 1] },
        { id: "handle", shape: "capsule", a: [0, -0.075, 0], b: [0, 0.075, 0], radius: 0.019, color: [0.06, 0.06, 0.07, 1] },
        { id: "cap", shape: "sphere", center: [0, -0.08, 0], radius: 0.02, color: [0.025, 0.025, 0.03, 1] }
      ] },
      grip: { along: 0.09, dir: [0.088, 0.885, 0.458], roll: -32.7, hand: "main" },
      rest: { bone: "spine05", at: [0.19, -0.12, 0.02], dir: [0.05, -1, -0.1] },
      start: "rest"
    },
    flashlight: {
      sdf: { cell: 0.005, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "body", shape: "cylinder", center: [0, 0, 0], axis: [0, 1, 0], radius: 0.02, half: 0.075, color: [0.025, 0.025, 0.03, 1] },
        { id: "head", shape: "cylinder", center: [0, 0.09, 0], axis: [0, 1, 0], radius: 0.032, half: 0.025, color: [0.11, 0.12, 0.14, 1] },
        { id: "lens", shape: "cylinder", center: [0, 0.113, 0], axis: [0, 1, 0], radius: 0.027, half: 0.004, color: [0.8, 0.78, 0.6, 1] }
      ] },
      grip: { along: 0.09, dir: [-0.003, 0.819, 0.574], roll: -34.3, hand: "main" },
      rest: { bone: "spine05", at: [-0.1, -0.1, -0.12], dir: [0, -1, 0] },
      start: "rest"
    }
  },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 110 }],
      "injured",
      "greet",
      "curious",
      "idle_life",
      "patrol",
      ["guard", {  }]
    ],
    // THE WORKER: the tree. Greets and looks at whoever comes near, walks a round when the world has one, stands its post. Using a weapon is a verb of the mind (me.take / put / fire / throw: SOMA_WORKER_API.md); the blocks that do come later
    worker: function (api, ld) {
      var tree = { name: "police_patrol", select: [ld.node("greet"), ld.node("curious"), ld.node("patrol"), ld.node("idle_life"), ld.node("guard")] };
      return { tree: tree };
    }
  }
};
