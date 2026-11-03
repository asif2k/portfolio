"use strict";
// police_riot: A RIOT OFFICER of the police family (soma/tools/police_squad.js writes this file: the gear that several officers carry is one recipe there; edit this file by hand or the recipe and run it again).
// a big man in dark grey: riot helmet, plate vest, a shield in his left hand and a baton in his right, and tear gas on the belt (the squad has three canisters for all its riot officers: a shared pool). He holds his post.
// The faction is `police`; the body is a person of the human system (soma/human/HUMAN.md); the props are what only this family knows (soma/js/family_props.js): each officer is BORN WITH what has a `start` (a holstered pistol, a helmet, a vest),
// takes the rest from the family's pool when it needs it; a prop with a `pool` is shared by every officer of the squad; a weapon has a `fire` section (the hitscan from its muzzle, the damage, the rate), a thrown one a `throw` section. The mind is the blocks it loads and its tree.
return {
  name: "police_riot", max: 12,
  family: { faction: "police", kind: "person", hp: 170 },
  nav: { agent: "person" },
  body: {
    human: {
      modifiers: { gender: 1, age: 0.45, height: 0.7, weight: 0.68, muscle: 0.85, proportions: 0.5 },
      parts: { hair: "short01", brows: "eyebrow006", lashes: "eyelashes01", clothes: ["male_casualsuit04"], shoes: "shoes06" },
      colors: { hair: [0.07, 0.05, 0.04], clothes: [0.22, 0.24, 0.28], shoes: [0.15, 0.15, 0.15] }, eye: [0.2, 0.15, 0.1], tone: 0,
      face: { detail: 8, bones: false, mouth: true },
      gait: { walk: "person_walk" }
    },
    // THE LOOKS (soma/js/variants.js): the individuals of this role: the uniform, the hair and the shoes (or the hat) are dyes of the parts of the mesh, each officer spawned wears one look of the list (spawn({ variant: n }) says which)
    variants: {
      dyes: {
        uniform: { parts: ["clothes"], palette: [[0.09, 0.1, 0.12], [0.025, 0.025, 0.03], [0.08, 0.1, 0.06], [0.14, 0.16, 0.19]] },
        hair: { parts: ["hair"], palette: [[0.03, 0.025, 0.02], [0.07, 0.04, 0.025], [0.16, 0.09, 0.05], [0.5, 0.36, 0.18], [0.28, 0.09, 0.04], [0.3, 0.3, 0.3]] },
        shoes: { parts: ["shoes"], palette: [[0.02, 0.02, 0.02], [0.1, 0.06, 0.03]] }
      },
      looks: [
        { uniform: 0, hair: 0, shoes: 0 },
        { uniform: 1, hair: 1, shoes: 0 },
        { uniform: 2, hair: 2, shoes: 0 },
        { uniform: 3, hair: 0, shoes: 1 },
        { uniform: 0, hair: 5, shoes: 0 },
        { uniform: 1, hair: 3, shoes: 0 }
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
        { id: "shell", shape: "ellipsoid", center: [0, 0, 0], radii: [0.108, 0.108, 0.124], color: [0.11, 0.12, 0.14, 1] },
        { id: "visor", shape: "box", center: [0, -0.03, 0.105], half: [0.085, 0.052, 0.011], round: 0.008, color: [0.06, 0.09, 0.14, 1] },
        { id: "guard", shape: "ellipsoid", center: [0, -0.105, -0.07], radii: [0.092, 0.045, 0.05], color: [0.11, 0.12, 0.14, 1] },
        { id: "ridge", shape: "box", center: [0, 0.1, 0], half: [0.008, 0.012, 0.11], color: [0.025, 0.025, 0.03, 1] }
      ] },
      rest: { bone: "head", at: [0, 0.1, 0.01], dir: [0, 1, 0] },
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
    shield: {
      sdf: { cell: 0.01, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "plate", shape: "box", center: [-0.17, 0.14, 0.03], half: [0.27, 0.43, 0.014], round: 0.012, color: [0.16, 0.22, 0.3, 1] },
        { id: "rim", shape: "box", center: [-0.17, 0.14, 0.021], half: [0.285, 0.445, 0.006], round: 0.008, color: [0.025, 0.025, 0.03, 1] },
        { id: "stripe", shape: "box", center: [-0.17, 0.2, 0.046], half: [0.25, 0.03, 0.004], color: [0.85, 0.85, 0.9, 1] },
        { id: "handle", shape: "capsule", a: [0, -0.05, 0], b: [0, 0.05, 0], radius: 0.014, color: [0.025, 0.025, 0.03, 1] }
      ] },
      grip: { along: 0.09, dir: [-0.525, 0.739, -0.421], roll: 23.1, hand: "off" },
      rest: { bone: "spine02", at: [0, 0, -0.17], dir: [0, 1, 0] },
      start: "grip"
    },
    baton: {
      sdf: { cell: 0.005, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "shaft", shape: "capsule", a: [0, -0.075, 0], b: [0, 0.385, 0], radius: 0.014, color: [0.025, 0.025, 0.03, 1] },
        { id: "handle", shape: "capsule", a: [0, -0.075, 0], b: [0, 0.075, 0], radius: 0.019, color: [0.06, 0.06, 0.07, 1] },
        { id: "cap", shape: "sphere", center: [0, -0.08, 0], radius: 0.02, color: [0.025, 0.025, 0.03, 1] }
      ] },
      grip: { along: 0.09, dir: [0.088, 0.885, 0.458], roll: -32.7, hand: "main" },
      rest: { bone: "spine05", at: [0.19, -0.12, 0.02], dir: [0.05, -1, -0.1] },
      start: "grip"
    },
    tear_gas: {
      sdf: { cell: 0.005, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "can", shape: "cylinder", center: [0, 0, 0], axis: [0, 1, 0], radius: 0.032, half: 0.085, round: 0.006, color: [0.26, 0.29, 0.26, 1] },
        { id: "band", shape: "cylinder", center: [0, 0.03, 0], axis: [0, 1, 0], radius: 0.0335, half: 0.012, color: [0.5, 0.06, 0.05, 1] },
        { id: "top", shape: "cylinder", center: [0, 0.1, 0], axis: [0, 1, 0], radius: 0.017, half: 0.016, color: [0.5, 0.52, 0.57, 1] },
        { id: "pin", shape: "capsule", a: [0.02, 0.112, 0], b: [0.034, 0.1, 0], radius: 0.004, color: [0.5, 0.52, 0.57, 1] }
      ] },
      grip: { along: 0.09, dir: [0.024, 0.841, 0.541], roll: -33.9, hand: "main" },
      rest: { bone: "spine05", at: [-0.17, -0.08, 0.11], dir: [0, 1, 0] },
      start: "rest",
      pool: 3,
      throw: { speed: 11, gravity: 1, spin: [6, 0, 0], radius: 0.05, life: 5, linger: 14, hit: { impulse: 0, damage: 0 } }
    }
  },
  // PARTICLES (soma/js/fx.js): the flash at a muzzle when a weapon fires, what a thrown prop does where it lands or while it lies
  particles: {
    tear_gas_gas: { effect: "smoke_column", mount: { prop: "tear_gas", at: [0, 0.1, 0], dir: [0, 1, 0] }, scale: 0.45, loop: { while: "thrown" } },
    tear_gas_hiss: { effect: "dust_puff", mount: { prop: "tear_gas", at: [0, 0, 0], dir: [0, 1, 0] }, scale: 0.4, once: "impact" }
  },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 170 }],
      "injured",
      "greet",
      "curious",
      "idle_life",
      ["guard", {  }]
    ],
    // THE WORKER: the tree. Greets and looks at whoever comes near, walks a round when the world has one, stands its post. Using a weapon is a verb of the mind (me.take / put / fire / throw: SOMA_WORKER_API.md); the blocks that do come later
    worker: function (api, ld) {
      var tree = { name: "police_riot", select: [ld.node("greet"), ld.node("curious"), ld.node("idle_life"), ld.node("guard")] };
      return { tree: tree };
    }
  }
};
