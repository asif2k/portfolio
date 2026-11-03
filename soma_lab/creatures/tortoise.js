// tortoise: in soma's one form of a creature file (soma/creature_file.js): `body` is the creature as it was made, the rest is who it is to the others (family, nav, abilities) and its mind: the blocks of soma/world/blocks/ it loads by name and
// its tree (an animal's own clips: the clip set `quad/tortoise`). The old worker of this file is left out; the mind below is the default of a creature of its kind (animal): write the creature's own in `mind`.
// tortoise: a creature MADE OF THE PARTS CATALOGUE'S PIECES (mixed, tortoise): built by soma/tools/piece_creatures.js from its recipe soma/creator/saved/tortoise.creator.json (the recipe is the source of truth:
// `node soma/tools/piece_creatures.js regenerate tortoise` makes this file again after a piece of the catalogue is built again). The creator studio opens it for modification: /soma/soma_creator_studio_demo.jh?creator=/soma/creatures/tortoise.js
// CREDITS: the pieces were cut out of these models of the rigged corpus (D:\work\glb_skinned_meshes: the corpus keeps no author or licence fields; title and uid as the corpus has them):
//   "Tortoise" (uid 6f03791913284fd8af4a620d7e30ff20, reptiles_amphibians/6f03791913284fd8af4a620d7e30ff20_Tortoise.glb): tortoise_torso, tortoise_leg_fl, tortoise_leg_hl, tortoise_tail
//   "Green Turtle" (uid 360911cc7bc1425bb822b3cdef1fad61, reptiles_amphibians/360911cc7bc1425bb822b3cdef1fad61_Green_Turtle.glb): green_turtle_head
"use strict";
// tortoise: a tortoise: the tortoise's shell, legs and tail with a green turtle's head (the tortoise's own neck is a stump the catalogue left out). Made by the creature creator (soma/creator/creator.js, SOMA.md "The creator") from the `creator` object at the end of this file:
// the studio opens it again from that object (creator.from_definition). ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature. Metres, +x to its left, +y up, +z forward.
const skeleton = [
  {"name":"root","parent":null,"head":[0.00384,0.30392,-0.31712],"tail":[-0.01178,0.32844,0.42026]},
  {"name":"fore_thigh_l","parent":"root","head":[0.12079,0.31529,0.33873],"tail":[0.20585,0.25944,0.39705],"mirror":"x"},
  {"name":"fore_shin_l","parent":"fore_thigh_l","head":[0.20585,0.25944,0.39705],"tail":[0.24342,0.14918,0.41812],"mirror":"x"},
  {"name":"fore_foot_l","parent":"fore_shin_l","head":[0.24342,0.14918,0.41812],"tail":[0.24342,-0.00155,0.41812],"mirror":"x"},
  {"name":"hind_thigh_l","parent":"root","head":[0.05795,0.28897,-0.38422],"tail":[0.17314,0.20391,-0.41717],"mirror":"x"},
  {"name":"hind_shin_l","parent":"hind_thigh_l","head":[0.17314,0.20391,-0.41717],"tail":[0.17646,0.01328,-0.41812],"mirror":"x"},
  {"name":"tail_1","parent":"root","head":[-0.00105,0.29124,-0.34858],"tail":[0.00426,0.29047,-0.43758]},
  {"name":"tail_2","parent":"tail_1","head":[0.00426,0.29047,-0.43758],"tail":[0.00426,0.29147,-0.43758]},
  {"name":"head_head","parent":"root","head":[-0.01178,0.32844,0.42026],"tail":[0.00593,0.33102,0.51112]},
  {"name":"head_head_2","parent":"head_head","head":[0.00593,0.33102,0.51112],"tail":[0.00587,0.33163,0.51082]},
  {"name":"head_eye_l","parent":"head_head","head":[0.03661,0.39158,0.5054],"tail":[0.03655,0.39219,0.5051]},
  {"name":"head_eye_r","parent":"head_head","head":[-0.02466,0.39158,0.51734],"tail":[-0.02472,0.39219,0.51704]},
];
const rig = {
  joints: [
    {"bone":"fore_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"fore_shin_l","kind":"hinge","axis":[0.585,0.044,-0.81],"range":[-46,100],"mirror":"x"},
    {"bone":"fore_foot_l","kind":"ball","fwd":30,"back":30,"lat":15,"twist":15,"mirror":"x"},
    {"bone":"hind_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"hind_shin_l","kind":"hinge","axis":[-0.275,0,-0.961],"range":[-60,86],"mirror":"x"},
    {"bone":"tail_1","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
    {"bone":"tail_2","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
  ],
  chains: [
    {"name":"fore_l","bones":["fore_thigh_l","fore_shin_l"],"solver":"limb","tip":"fore_foot_l","pole":[0.592,0.659,0.464],"pole_w":1,"mirror":"x"},
    {"name":"hind_l","bones":["hind_thigh_l","hind_shin_l"],"solver":"limb","pole":[0.878,0.408,-0.251],"pole_w":1,"mirror":"x"},
    {"name":"tail","bones":["tail_1","tail_2"]},
  ],
};
const legs = {"legs":[{"chain":"hind_l","mirror":"x","foot_height":-0.00009},{"chain":"fore_l","mirror":"x","foot_height":0.14918}],"gait":{"from":"tortoise_walk","ride":0.30392}};
const body = {"gravity":9.8,"turn_rate":3.84,"max_speed":0.22};
const roles = {"hips":"root","chest":"root","head":"head_head","eyes":["head_eye_l","head_eye_r"],"tail":["tail_1","tail_2"],"mouth":{"corners":["head_head_2"]}};
const traits = {"idle":0.4,"breath":0.6,"fidget":0.3,"wander":0.4};
const physics = {"mass":101.965,"shapes":[{"id":"body","shape":"capsule","a":[0.00838,0.38693,-0.24139],"b":[0.00838,0.38693,0.2513],"radius":0.206,"bone":"root"},{"id":"head","shape":"sphere","center":[-0.00866,0.34613,0.48054],"radius":0.094,"bone":"head_head"},{"id":"fore_l","shape":"capsule","a":[0.12079,0.29172,0.33873],"b":[0.24342,0.03804,0.41812],"radius":0.037,"mirror":"x"},{"id":"hind_l","shape":"capsule","a":[0.05795,0.25521,-0.38422],"b":[0.17646,0.04051,-0.41812],"radius":0.039,"mirror":"x"}]};
const parts = [
  {"id":"torso_0","shape":"volume","volume":"tortoise_torso","origin":[0.00384,0.30392,-0.31712],"rotate":[0,0,0],"scale":1,"bone":"root","bone_map":{"@host":"root","torso_pelvis":"root","@neck":"head_head","@leg_f_l":"fore_thigh_l","@leg_f_r":"fore_thigh_r","@leg_h_r":"hind_thigh_r","@leg_h_l":"hind_thigh_l","@tail":"tail_1"},"roughness":0.311,"metal":0},
  {"id":"fore_thigh_0","shape":"volume","volume":"tortoise_leg_fl","origin":[0.12079,0.31529,0.33873],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"root","bone_map":{"@host":"root","leg_thigh_l":"fore_thigh_l","leg_shin_l":"fore_shin_l","leg_foot_l":"fore_foot_l"},"blend":0.01852,"blend_mode":"cubic","roughness":0.282,"metal":0},
  {"id":"hind_thigh_0","shape":"volume","volume":"tortoise_leg_hl","origin":[0.05795,0.28897,-0.38422],"rotate":[0.28793,-7.50908,0.96001],"scale":1,"mirror":"x","bone":"root","bone_map":{"@host":"root","leg_thigh_l":"hind_thigh_l","leg_shin_l":"hind_shin_l","tail1_018":"tail_1","tail2_019":"tail_2"},"blend":0.01971,"blend_mode":"cubic","roughness":0.289,"metal":0},
  {"id":"tail_1_0","shape":"volume","volume":"tortoise_tail","origin":[-0.00105,0.29124,-0.34858],"rotate":[0,0,0],"scale":1,"bone":"root","bone_map":{"@host":"root","tail_1":"tail_1","tail_2":"tail_2","legbrhindright_014":"hind_thigh_r","legbehindleft_016":"hind_thigh_l"},"blend":0.01979,"blend_mode":"cubic","roughness":0.311,"metal":0},
  {"id":"head_head_0","shape":"volume","volume":"green_turtle_head","origin":[-0.01178,0.32844,0.42026],"rotate":[-26.69327,11.02779,0.00023],"scale":0.67971,"bone":"root","bone_map":{"@host":"root","head_head":"head_head","head_head_2":"head_head_2","head_eye_l":"head_eye_l","head_eye_r":"head_eye_r"},"blend":0.0224,"blend_mode":"cubic"},
];
const sdf = Object.assign({"cell":0.01158,"decimate":{"ratio":0.4},"skin":{"falloff":1.5,"seam":1},"shade":{"ao":0.45,"ao_radius":0.03474,"tone":0.2,"color_blend":1},"volumes":{"tortoise_torso":{"hash":"535a8729","piece":"/soma/parts/catalog/torso/tortoise_torso.somapart","bake":{"cell":0.0066,"band":6}},"tortoise_leg_fl":{"hash":"89d6da05","piece":"/soma/parts/catalog/leg/tortoise_leg_fl.somapart","bake":{"cell":0.0066,"band":6}},"tortoise_leg_hl":{"hash":"f706d12c","piece":"/soma/parts/catalog/leg/tortoise_leg_hl.somapart","bake":{"cell":0.0066,"band":6}},"tortoise_tail":{"hash":"fff4f8c3","piece":"/soma/parts/catalog/tail/tortoise_tail.somapart","bake":{"cell":0.0066,"band":6}},"green_turtle_head":{"hash":"b022aa11","piece":"/soma/parts/catalog/head/green_turtle_head.somapart","bake":{"cell":0.011,"band":6}}}}, { parts: parts });
const material = {"roughness":0.72,"metal":0};
const creator = {"format":"soma.creator","version":1,"name":"tortoise","description":"a tortoise: the tortoise's shell, legs and tail with a green turtle's head (the tortoise's own neck is a stump the catalogue left out)","torso":{"shape":"piece","size":[0.62905,0.4472,0.90411],"axis":"z","round":0,"color":[0.209,0.168,0.082],"piece":"tortoise_torso","scale":1},"parts":[{"id":"fore","preset":"piece","params":{"piece":"tortoise_leg_fl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"root","t":0.88521,"dir":[0.996834,0,0.079508],"socket":"leg_f_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"hind","preset":"piece","params":{"piece":"tortoise_leg_hl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"root","t":0,"dir":[0.602015,-0.785154,0.1453],"socket":"leg_h_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"tail","preset":"piece","params":{"piece":"tortoise_tail","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"root","t":0,"dir":[-0.16234,-0.926568,0.33929],"socket":"tail"},"mirror":false,"color":null,"colors":{},"ik":{"on":true},"roles":{}},{"id":"head","preset":"piece","params":{"piece":"green_turtle_head","scale":0.45,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"root","t":1,"dir":[0.211944,0.97727,0.004733],"socket":"neck"},"mirror":false,"color":null,"colors":{},"ik":{"on":false},"roles":{}}],"pieces":{"tortoise_torso":{"hash":"535a8729","file":"/soma/parts/catalog/torso/tortoise_torso.somapart"},"tortoise_leg_fl":{"hash":"89d6da05","file":"/soma/parts/catalog/leg/tortoise_leg_fl.somapart"},"tortoise_leg_hl":{"hash":"f706d12c","file":"/soma/parts/catalog/leg/tortoise_leg_hl.somapart"},"tortoise_tail":{"hash":"fff4f8c3","file":"/soma/parts/catalog/tail/tortoise_tail.somapart"},"green_turtle_head":{"hash":"b022aa11","file":"/soma/parts/catalog/head/green_turtle_head.somapart"}},"roles":{},"soft":{},"material":{},"settings":{"gait":"auto","pattern":"auto","slack":0.05,"center":true,"face_roles":true,"soft_roles":true,"body":{"turn_rate":3.84,"max_speed":0.22},"physics":"auto","traits":{"idle":0.4,"breath":0.6,"fidget":0.3,"wander":0.4},"flight":"auto","wave":"auto","sdf":{},"vehicle":"auto","aircraft":"auto","rotors":"auto"},"ui":{"library":{"built_from":"pieces","kind":"mixed","species":"tortoise","sources":[{"uid":"6f03791913284fd8af4a620d7e30ff20","title":"Tortoise"},{"uid":"360911cc7bc1425bb822b3cdef1fad61","title":"Green Turtle"}],"recipe":"soma/creator/saved/tortoise.creator.json"}}};
return {
  name: "tortoise", max: 16,
  family: { faction: "animal", kind: "animal", hp: 20 },
  nav: { agent: "small" },
  body: {
    skeleton: skeleton,
    rig: rig,
    legs: legs,
    body: body,
    roles: roles,
    traits: traits,
    physics: physics,
    sdf: sdf,
    material: material,
    creator: creator
  },
  abilities: ["walk", "effects"],
  interaction: { uses: [] },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 20 }],
      ["flee", { speed: 1.2, distance: 6 }],
      ["curious", { approach: 0.3, cooldown: 20, near: 1 }],
      ["idle_life", { clip_look: "tortoise_idle", clip_stretch: "tortoise_idle_2", clip_shift: "tortoise_idle", clip_sit: "tortoise_idle" }],
      ["injured", { clip_flinch: "" }],
      ["wander", { speed: 0.25, near: 0.5 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "tortoise", select: [ld.node("flee"), ld.node("curious"), ld.node("idle_life"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
