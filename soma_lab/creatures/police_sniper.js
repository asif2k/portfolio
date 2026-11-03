"use strict";
// police_sniper: A POLICE SNIPER of the police family (soma/tools/police_squad.js writes this file: the gear that several officers carry is one recipe there; edit this file by hand or the recipe and run it again).
// a lean man in olive: a boonie hat, a scoped rifle slung on his back (one slow, heavy shot), a pistol in the holster. He holds a post and watches.
// The faction is `police`; the body is a person of the human system (soma/human/HUMAN.md); the props are what only this family knows (soma/js/family_props.js): each officer is BORN WITH what has a `start` (a holstered pistol, a helmet, a vest),
// takes the rest from the family's pool when it needs it; a prop with a `pool` is shared by every officer of the squad; a weapon has a `fire` section (the hitscan from its muzzle, the damage, the rate), a thrown one a `throw` section. The mind is the blocks it loads and its tree.
return {
  name: "police_sniper", max: 8,
  family: { faction: "police", kind: "person", hp: 90 },
  nav: { agent: "person" },
  body: {
    human: {
      modifiers: { gender: 1, age: 0.5, height: 0.6, weight: 0.35, muscle: 0.45, proportions: 0.5 },
      parts: { hair: "short02", brows: "eyebrow002", lashes: "eyelashes01", clothes: ["male_casualsuit06"], shoes: "shoes04" },
      colors: { hair: [0.2, 0.15, 0.1], clothes: [0.26, 0.32, 0.18], shoes: [0.2, 0.2, 0.15] }, eye: [0.3, 0.38, 0.45], tone: 0.15,
      face: { detail: 8, bones: false, mouth: true },
      gait: { walk: "person_walk" }
    },
    // THE LOOKS (soma/js/variants.js): the individuals of this role: the uniform, the hair and the shoes (or the hat) are dyes of the parts of the mesh, each officer spawned wears one look of the list (spawn({ variant: n }) says which)
    variants: {
      dyes: {
        uniform: { parts: ["clothes"], palette: [[0.1, 0.14, 0.06], [0.3, 0.25, 0.14], [0.12, 0.15, 0.1], [0.15, 0.17, 0.15]] },
        hair: { parts: ["hair"], palette: [[0.03, 0.025, 0.02], [0.07, 0.04, 0.025], [0.16, 0.09, 0.05], [0.5, 0.36, 0.18], [0.28, 0.09, 0.04], [0.3, 0.3, 0.3]] },
        shoes: { parts: ["shoes"], palette: [[0.02, 0.02, 0.02], [0.1, 0.06, 0.03]] }
      },
      looks: [
        { uniform: 0, hair: 1, shoes: 1 },
        { uniform: 1, hair: 2, shoes: 1 },
        { uniform: 2, hair: 3, shoes: 0 },
        { uniform: 3, hair: 0, shoes: 0 },
        { uniform: 0, hair: 4, shoes: 0 },
        { uniform: 1, hair: 5, shoes: 1 }
      ]
    }
  },
  abilities: ["walk", "open", "climb", "use", "effects", "props"],
  interaction: { uses: ["sit", "sleep", "eat", "use"] },
  // PROPS: each a species of its own (an sdf the mesher makes), origin where the hand holds it, +y its long axis; `start`: every new officer takes one at once, at that place. A weapon of the library (soma/weapons/) is `api.weapon(name, { what this creature says over it })`:
  // its sdf, its grip, its muzzle, its shots and how it is aimed (both hands, the butt at the shoulder) are the library's, the flash at its muzzle comes with it
  props: {
    hat: {
      sdf: { cell: 0.006, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "brim", shape: "cylinder", center: [0, 0, 0], axis: [0, 1, 0], radius: 0.19, half: 0.004, color: [0.12, 0.15, 0.07, 1] },
        { id: "crown", shape: "ellipsoid", center: [0, 0.035, 0.005], radii: [0.097, 0.065, 0.108], color: [0.12, 0.15, 0.07, 1] },
        { id: "band", shape: "cylinder", center: [0, 0.012, 0.005], axis: [0, 1, 0], radius: 0.099, half: 0.01, color: [0.07, 0.09, 0.04, 1] }
      ] },
      rest: { bone: "head", at: [0, 0.11, 0.01], dir: [0, 1, 0] },
      start: "rest"
    },
    rifle: api.weapon("sniper_rifle", { start: "rest" }),
    pistol: api.weapon("pistol", { start: "rest" })
  },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 90 }],
      "injured",
      "greet",
      "idle_life",
      ["guard", {  }]
    ],
    // THE WORKER: the tree. Greets and looks at whoever comes near, walks a round when the world has one, stands its post. Using a weapon is a verb of the mind (me.take / put / fire / throw: SOMA_WORKER_API.md); the blocks that do come later
    worker: function (api, ld) {
      var tree = { name: "police_sniper", select: [ld.node("greet"), ld.node("idle_life"), ld.node("guard")] };
      return { tree: tree };
    }
  }
};
