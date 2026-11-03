"use strict";
// police_swat: A SWAT OFFICER of the police family (soma/tools/police_squad.js writes this file: the gear that several officers carry is one recipe there; edit this file by hand or the recipe and run it again).
// a woman in black: tactical helmet, plate vest, a carbine in her hands (nine shots a second), a pistol on her thigh, a radio, and flashbangs on the belt (six for the squad: a shared pool).
// The faction is `police`; the body is a person of the human system (soma/human/HUMAN.md); the props are what only this family knows (soma/js/family_props.js): each officer is BORN WITH what has a `start` (a holstered pistol, a helmet, a vest),
// takes the rest from the family's pool when it needs it; a prop with a `pool` is shared by every officer of the squad; a weapon has a `fire` section (the hitscan from its muzzle, the damage, the rate), a thrown one a `throw` section. The mind is the blocks it loads and its tree.
return {
  name: "police_swat", max: 12,
  family: { faction: "police", kind: "person", hp: 140 },
  nav: { agent: "person" },
  body: {
    human: {
      modifiers: { gender: 0, age: 0.35, height: 0.55, weight: 0.4, muscle: 0.7, proportions: 0.55, breast_size: 0.4 },
      parts: { hair: "ponytail01", brows: "eyebrow003", lashes: "eyelashes02", clothes: ["female_sportsuit01"], shoes: "shoes06" },
      colors: { hair: [0.15, 0.09, 0.05], clothes: [0.08, 0.08, 0.1], shoes: [0.1, 0.1, 0.1] }, eye: [0.22, 0.32, 0.4], tone: 0.2,
      face: { detail: 8, bones: false, mouth: true },
      gait: { walk: "person_walk" },
      soft: true,
    },
    // THE LOOKS (soma/js/variants.js): the individuals of this role: the uniform, the hair and the shoes (or the hat) are dyes of the parts of the mesh, each officer spawned wears one look of the list (spawn({ variant: n }) says which)
    variants: {
      dyes: {
        uniform: { parts: ["clothes"], palette: [[0.025, 0.025, 0.03], [0.08, 0.08, 0.09], [0.28, 0.22, 0.12], [0.09, 0.12, 0.06]] },
        hair: { parts: ["hair"], palette: [[0.03, 0.025, 0.02], [0.07, 0.04, 0.025], [0.16, 0.09, 0.05], [0.5, 0.36, 0.18], [0.28, 0.09, 0.04], [0.3, 0.3, 0.3]] },
        shoes: { parts: ["shoes"], palette: [[0.02, 0.02, 0.02], [0.1, 0.06, 0.03]] }
      },
      looks: [
        { uniform: 0, hair: 2, shoes: 0 },
        { uniform: 1, hair: 1, shoes: 0 },
        { uniform: 2, hair: 3, shoes: 1 },
        { uniform: 3, hair: 0, shoes: 0 },
        { uniform: 0, hair: 4, shoes: 0 },
        { uniform: 1, hair: 5, shoes: 0 }
      ]
    }
  },
  abilities: ["walk", "open", "climb", "use", "effects", "props"],
  interaction: { uses: ["sit", "sleep", "eat", "use"] },
  // PROPS: each a species of its own (an sdf the mesher makes), origin where the hand holds it, +y its long axis; `start`: every new officer takes one at once, at that place. A weapon of the library (soma/weapons/) is `api.weapon(name, { what this creature says over it })`:
  // its sdf, its grip, its muzzle, its shots and how it is aimed (both hands, the butt at the shoulder) are the library's, the flash at its muzzle comes with it
  props: {
    helmet: {
      sdf: { cell: 0.006, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "shell", shape: "ellipsoid", center: [0, 0, 0], radii: [0.102, 0.098, 0.117], color: [0.025, 0.025, 0.03, 1] },
        { id: "rail_l", shape: "box", center: [0.103, -0.01, 0], half: [0.009, 0.034, 0.05], color: [0.11, 0.12, 0.14, 1] },
        { id: "rail_r", shape: "box", center: [-0.103, -0.01, 0], half: [0.009, 0.034, 0.05], color: [0.11, 0.12, 0.14, 1] },
        { id: "mount", shape: "box", center: [0, 0.035, 0.112], half: [0.022, 0.022, 0.011], color: [0.11, 0.12, 0.14, 1] },
        { id: "goggle", shape: "cylinder", center: [0, 0.035, 0.135], axis: [0, 0, 1], radius: 0.022, half: 0.016, color: [0.025, 0.025, 0.03, 1] }
      ] },
      rest: { bone: "head", at: [0, 0.11, 0.01], dir: [0, 1, 0] },
      start: "rest"
    },
    vest: {
      sdf: { cell: 0.008, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "torso", shape: "box", center: [0, 0, 0], half: [0.172, 0.2, 0.125], round: 0.05, color: [0.025, 0.025, 0.03, 1] },
        { id: "plate", shape: "box", center: [0, 0.05, 0.125], half: [0.105, 0.125, 0.01], round: 0.012, color: [0.11, 0.12, 0.14, 1] },
        { id: "pouch_l", shape: "box", center: [0.1, -0.13, 0.135], half: [0.038, 0.04, 0.02], round: 0.006, color: [0.11, 0.12, 0.14, 1] },
        { id: "pouch_c", shape: "box", center: [0, -0.13, 0.135], half: [0.038, 0.04, 0.02], round: 0.006, color: [0.11, 0.12, 0.14, 1] },
        { id: "pouch_r", shape: "box", center: [-0.1, -0.13, 0.135], half: [0.038, 0.04, 0.02], round: 0.006, color: [0.11, 0.12, 0.14, 1] },
        { id: "shoulder_l", shape: "sphere", center: [0.175, 0.17, 0], radius: 0.06, color: [0.025, 0.025, 0.03, 1] },
        { id: "shoulder_r", shape: "sphere", center: [-0.175, 0.17, 0], radius: 0.06, color: [0.025, 0.025, 0.03, 1] },
        { id: "collar", shape: "box", center: [0, 0.2, -0.02], half: [0.1, 0.03, 0.08], round: 0.02, color: [0.025, 0.025, 0.03, 1] }
      ] },
      rest: { bone: "spine02", at: [0, 0.05, 0.03], dir: [0, 1, 0] },
      start: "rest"
    },
    radio: {
      sdf: { cell: 0.005, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "body", shape: "box", center: [0, 0, 0], half: [0.03, 0.05, 0.017], round: 0.006, color: [0.025, 0.025, 0.03, 1] },
        { id: "speaker", shape: "box", center: [0, -0.015, 0.016], half: [0.02, 0.025, 0.004], color: [0.11, 0.12, 0.14, 1] },
        { id: "antenna", shape: "capsule", a: [0.018, 0.05, 0], b: [0.018, 0.15, 0], radius: 0.004, color: [0.025, 0.025, 0.03, 1] }
      ] },
      rest: { bone: "spine01", at: [0.12, 0.08, 0.11], dir: [0, 1, 0] },
      start: "rest"
    },
    carbine: api.weapon("carbine", { start: "grip" }),
    pistol: api.weapon("pistol", { rest: { bone: "upperleg01.R", at: [-0.03, -0.14, 0.1], dir: [0, -1, 0.1] }, start: "rest" }),
    flashbang: {
      sdf: { cell: 0.005, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "can", shape: "cylinder", center: [0, 0, 0], axis: [0, 1, 0], radius: 0.027, half: 0.065, round: 0.006, color: [0.2, 0.22, 0.26, 1] },
        { id: "band", shape: "cylinder", center: [0, -0.02, 0], axis: [0, 1, 0], radius: 0.0285, half: 0.01, color: [0.8, 0.65, 0.1, 1] },
        { id: "top", shape: "cylinder", center: [0, 0.08, 0], axis: [0, 1, 0], radius: 0.015, half: 0.015, color: [0.5, 0.52, 0.57, 1] },
        { id: "pin", shape: "capsule", a: [0.018, 0.092, 0], b: [0.03, 0.082, 0], radius: 0.004, color: [0.5, 0.52, 0.57, 1] }
      ] },
      grip: { along: 0.09, dir: [0.024, 0.841, 0.541], roll: -33.9, hand: "main" },
      rest: { bone: "spine05", at: [0.17, -0.08, 0.11], dir: [0, 1, 0] },
      start: "rest",
      pool: 6,
      throw: { speed: 12, gravity: 1, spin: [5, 0, 0], radius: 0.05, life: 4, linger: 1.5, hit: { impulse: 0, damage: 0 } }
    }
  },
  // PARTICLES (soma/js/fx.js): the flash at a muzzle when a weapon fires, what a thrown prop does where it lands or while it lies
  particles: {
    flashbang_bang: { effect: "grenade", mount: { prop: "flashbang", at: [0, 0, 0], dir: [0, 1, 0] }, scale: 0.5, once: "impact" }
  },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 140 }],
      "injured",
      "greet",
      "curious",
      "idle_life",
      "patrol",
      ["guard", {  }]
    ],
    // THE WORKER: the tree. Greets and looks at whoever comes near, walks a round when the world has one, stands its post. Using a weapon is a verb of the mind (me.take / put / fire / throw: SOMA_WORKER_API.md); the blocks that do come later
    worker: function (api, ld) {
      var tree = { name: "police_swat", select: [ld.node("greet"), ld.node("curious"), ld.node("patrol"), ld.node("idle_life"), ld.node("guard")] };
      return { tree: tree };
    }
  }
};
