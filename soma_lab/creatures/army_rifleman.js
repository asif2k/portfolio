"use strict";
// army_rifleman: A RIFLEMAN of the army family (soma/tools/police_squad.js writes this file: the gear that several soldiers carry is one recipe there; edit this file by hand or the recipe and run it again).
// a man in olive: a steel helmet, a vest, a rucksack and an assault rifle in his hands (eight shots a second, bursts of four, a magazine of thirty). He looks for the nearest raider, walks up to forty metres of him, turns, raises the rifle and shoots; with nobody in sight he walks a round and holds his post.
// The faction is `army`; the body is a person of the human system (soma/human/HUMAN.md); the props are what only this family knows (soma/js/family_props.js): each soldier is BORN WITH what has a `start` (a holstered pistol, a helmet, a vest),
// takes the rest from the family's pool when it needs it; a prop with a `pool` is shared by every soldier of the squad; a weapon has a `fire` section (the hitscan from its muzzle, the damage, the rate), a thrown one a `throw` section. The mind is the blocks it loads and its tree.
return {
  name: "army_rifleman", max: 12,
  family: { faction: "army", kind: "person", hp: 120 },
  nav: { agent: "person" },
  body: {
    human: {
      modifiers: { gender: 1, age: 0.35, height: 0.55, weight: 0.5, muscle: 0.6, proportions: 0.5 },
      parts: { hair: "short01", brows: "eyebrow004", lashes: "eyelashes01", clothes: ["male_casualsuit06"], shoes: "shoes06" },
      colors: { hair: [0.09, 0.065, 0.05], clothes: [0.12, 0.15, 0.08], shoes: [0.12, 0.1, 0.08] }, eye: [0.28, 0.2, 0.12], tone: 0.12,
      face: { detail: 8, bones: false, mouth: true },
      gait: { walk: "person_walk" }
    },
    // THE LOOKS (soma/js/variants.js): the individuals of this role: the uniform, the hair and the shoes (or the hat) are dyes of the parts of the mesh, each soldier spawned wears one look of the list (spawn({ variant: n }) says which)
    variants: {
      dyes: {
        uniform: { parts: ["clothes"], palette: [[0.12, 0.15, 0.08], [0.3, 0.26, 0.15], [0.15, 0.18, 0.15], [0.09, 0.11, 0.07]] },
        hair: { parts: ["hair"], palette: [[0.03, 0.025, 0.02], [0.07, 0.04, 0.025], [0.16, 0.09, 0.05], [0.5, 0.36, 0.18], [0.28, 0.09, 0.04], [0.3, 0.3, 0.3]] },
        shoes: { parts: ["shoes"], palette: [[0.02, 0.02, 0.02], [0.1, 0.06, 0.03]] }
      },
      looks: [
        { uniform: 0, hair: 1, shoes: 0 },
        { uniform: 1, hair: 2, shoes: 1 },
        { uniform: 2, hair: 0, shoes: 0 },
        { uniform: 3, hair: 3, shoes: 0 },
        { uniform: 0, hair: 4, shoes: 1 },
        { uniform: 1, hair: 5, shoes: 0 }
      ]
    }
  },
  abilities: ["walk", "open", "climb", "use", "effects", "props"],
  interaction: { uses: ["sit", "sleep", "eat", "use"] },
  // PROPS: each a species of its own (an sdf the mesher makes), origin where the hand holds it, +y its long axis; `start`: every new soldier takes one at once, at that place. A weapon of the library (soma/weapons/) is `api.weapon(name, { what this creature says over it })`:
  // its sdf, its grip, its muzzle, its shots and how it is aimed (both hands, the butt at the shoulder) are the library's, the flash at its muzzle comes with it
  props: {
    helmet: {
      sdf: { cell: 0.006, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "shell", shape: "ellipsoid", center: [0, 0, 0], radii: [0.108, 0.088, 0.122], color: [0.13, 0.16, 0.08, 1] },
        { id: "brim", shape: "cylinder", center: [0, -0.06, 0.01], axis: [0, 1, 0], radius: 0.118, half: 0.008, color: [0.09, 0.11, 0.055, 1] },
        { id: "net", shape: "ellipsoid", center: [0, 0.02, -0.01], radii: [0.112, 0.075, 0.127], color: [0.09, 0.11, 0.055, 1] },
        { id: "strap", shape: "box", center: [0, -0.1, 0.03], half: [0.09, 0.006, 0.06], color: [0.025, 0.025, 0.03, 1] }
      ] },
      rest: { bone: "head", at: [0, 0.1, 0.01], dir: [0, 1, 0] },
      start: "rest"
    },
    vest: {
      sdf: { cell: 0.008, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "torso", shape: "box", center: [0, 0, 0], half: [0.17, 0.19, 0.122], round: 0.05, color: [0.13, 0.16, 0.08, 1] },
        { id: "plate", shape: "box", center: [0, 0.05, 0.124], half: [0.1, 0.12, 0.01], round: 0.012, color: [0.09, 0.11, 0.055, 1] },
        { id: "pouch_l", shape: "box", center: [0.09, -0.12, 0.135], half: [0.04, 0.045, 0.022], round: 0.006, color: [0.14, 0.17, 0.09, 1] },
        { id: "pouch_c", shape: "box", center: [0, -0.12, 0.135], half: [0.04, 0.045, 0.022], round: 0.006, color: [0.14, 0.17, 0.09, 1] },
        { id: "pouch_r", shape: "box", center: [-0.09, -0.12, 0.135], half: [0.04, 0.045, 0.022], round: 0.006, color: [0.14, 0.17, 0.09, 1] },
        { id: "collar", shape: "box", center: [0, 0.2, -0.02], half: [0.1, 0.03, 0.08], round: 0.02, color: [0.09, 0.11, 0.055, 1] }
      ] },
      rest: { bone: "spine02", at: [0, 0.05, 0.03], dir: [0, 1, 0] },
      start: "rest"
    },
    pack: {
      sdf: { cell: 0.008, shade: { ao: 0.4, ao_radius: 0.02, tone: 0.1 }, parts: [
        { id: "pack", shape: "box", center: [0, 0, 0], half: [0.15, 0.2, 0.095], round: 0.04, color: [0.09, 0.11, 0.055, 1] },
        { id: "flap", shape: "box", center: [0, 0.13, -0.05], half: [0.14, 0.07, 0.05], round: 0.02, color: [0.13, 0.16, 0.08, 1] },
        { id: "roll", shape: "cylinder", center: [0, -0.22, -0.02], axis: [1, 0, 0], radius: 0.06, half: 0.14, color: [0.32, 0.27, 0.16, 1] },
        { id: "pocket_l", shape: "box", center: [0.1, -0.05, -0.11], half: [0.05, 0.08, 0.025], round: 0.01, color: [0.13, 0.16, 0.08, 1] },
        { id: "pocket_r", shape: "box", center: [-0.1, -0.05, -0.11], half: [0.05, 0.08, 0.025], round: 0.01, color: [0.13, 0.16, 0.08, 1] }
      ] },
      rest: { bone: "spine02", at: [0, 0.02, -0.2], dir: [0, 1, 0] },
      start: "rest"
    },
    rifle: api.weapon("assault_rifle", { start: "grip" })
  },
  mind: {
    hz: 8, far_hz: 2,
    blocks: [
      ["health", { hp: 120 }],
      "injured",
      ["avoid", { radius: 0.35, margin: 0.4, neighbours: 4, look: 1.8 }],
      ["walk", { speed: 2.2, run_speed: 4.2, near: 0.5 }],
      ["gunner", { weapon: "rifle", mode: "fire", aim: "arms", holster: false, sight: 55, range: 45, burst: 4, shot_gap: 0.13, pause: 1, aim_time: 0.4, mag: 30, reload: 3, damage: 11, accuracy: 0.8, speed: 2.2, run_speed: 4.2 }],
      "patrol",
      ["guard", {  }]
    ],
    // THE WORKER: the tree. Greets and looks at whoever comes near, walks a round when the world has one, stands its post. Using a weapon is a verb of the mind (me.take / put / fire / throw: SOMA_WORKER_API.md); the blocks that do come later
    worker: function (api, ld) {
      var tree = { name: "army_rifleman", select: [ld.node("gunner"), ld.node("patrol"), ld.node("guard")] };
      return { tree: tree };
    }
  }
};
