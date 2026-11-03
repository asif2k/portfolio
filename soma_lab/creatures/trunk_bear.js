// trunk_bear: in soma's one form of a creature file (soma/creature_file.js): `body` is the creature as it was made, the rest is who it is to the others (family, nav, abilities) and its mind: the blocks of soma/world/blocks/ it loads by name and
// its tree (an animal's own clips: the clip set `quad/bear`). The old worker of this file is left out; the mind below is the default of a creature of its kind (animal): write the creature's own in `mind`.
// trunk_bear: a creature MADE OF THE PARTS CATALOGUE'S PIECES (mixed, trunked bear): built by soma/tools/piece_creatures.js from its recipe soma/creator/saved/trunk_bear.creator.json (the recipe is the source of truth:
// `node soma/tools/piece_creatures.js regenerate trunk_bear` makes this file again after a piece of the catalogue is built again). The creator studio opens it for modification: /soma/soma_creator_studio_demo.jh?creator=/soma/creatures/trunk_bear.js
// CREDITS: the pieces were cut out of these models of the rigged corpus (D:\work\glb_skinned_meshes: the corpus keeps no author or licence fields; title and uid as the corpus has them):
//   "Giant Panda Bear Male (Endangered)" (uid 9291b3d011b04dd09b6a91ddcb35b729, monsters_creatures/9291b3d011b04dd09b6a91ddcb35b729_Giant_Panda_Bear_Male_(Endangered).glb): giant_panda_bear_male_torso, giant_panda_bear_male_leg_fl, giant_panda_bear_male_leg_hl, giant_panda_bear_male_neck, giant_panda_bear_male_head
//   "African Elephant" (uid 33b4c1d4466c4cdc94de2ac01f596ca4, mammals_wild/33b4c1d4466c4cdc94de2ac01f596ca4_African_Elephant.glb): african_elephant_snout
"use strict";
// trunk_bear: a trunked bear: the giant panda's torso, legs, neck and head with an African elephant's trunk on its snout. Made by the creature creator (soma/creator/creator.js, SOMA.md "The creator") from the `creator` object at the end of this file:
// the studio opens it again from that object (creator.from_definition). ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature. Metres, +x to its left, +y up, +z forward.
const skeleton = [
  {"name":"root","parent":null,"head":[-0.00502,1.17641,-0.50375],"tail":[-0.00433,0.98913,-0.44622]},
  {"name":"torso_spine_1","parent":"root","head":[-0.00433,0.98913,-0.44622],"tail":[-0.0036,0.92081,-0.21587]},
  {"name":"torso_spine_2","parent":"torso_spine_1","head":[-0.0036,0.92081,-0.21587],"tail":[-0.0028,0.90086,0.1092]},
  {"name":"torso_spine_3","parent":"torso_spine_2","head":[-0.0028,0.90086,0.1092],"tail":[-0.00249,1.02963,0.41574]},
  {"name":"torso_spine_4","parent":"torso_spine_3","head":[-0.00249,1.02963,0.41574],"tail":[-0.00208,1.0553,0.63163]},
  {"name":"torso_spine_5","parent":"torso_spine_4","head":[-0.00208,1.0553,0.63163],"tail":[-0.00165,1.01499,0.76796]},
  {"name":"torso_clavicle_l","parent":"torso_spine_5","head":[0.11176,1.05564,0.63137],"tail":[0.2344,0.79623,0.55372]},
  {"name":"torso_clavicle_r","parent":"torso_spine_5","head":[-0.11592,1.05496,0.63189],"tail":[-0.24219,0.79452,0.56206]},
  {"name":"torso_spine_2_b1","parent":"torso_spine_2","head":[-0.00242,0.50583,-0.24729],"tail":[-0.00242,0.50683,-0.24729]},
  {"name":"fore_thigh_l","parent":"torso_clavicle_l","head":[0.2344,0.79623,0.55372],"tail":[0.24298,0.42924,0.47782],"mirror":"x"},
  {"name":"fore_shin_l","parent":"fore_thigh_l","head":[0.24298,0.42924,0.47782],"tail":[0.22343,0.16061,0.43836],"mirror":"x"},
  {"name":"fore_cannon_l","parent":"fore_shin_l","head":[0.22343,0.16061,0.43836],"tail":[0.17124,0.01078,0.49962],"mirror":"x"},
  {"name":"fore_foot_l","parent":"fore_cannon_l","head":[0.17124,0.01078,0.49962],"tail":[0.17463,0.01065,0.64085],"mirror":"x"},
  {"name":"fore_toe_l","parent":"fore_foot_l","head":[0.17463,0.01065,0.64085],"tail":[0.17463,0.01165,0.64085],"mirror":"x"},
  {"name":"hind_thigh_l","parent":"root","head":[0.27547,0.85729,-0.51168],"tail":[0.25174,0.42672,-0.56464],"mirror":"x"},
  {"name":"hind_shin_l","parent":"hind_thigh_l","head":[0.25174,0.42672,-0.56464],"tail":[0.2371,0.19672,-0.57641],"mirror":"x"},
  {"name":"hind_cannon_l","parent":"hind_shin_l","head":[0.2371,0.19672,-0.57641],"tail":[0.19236,0.04906,-0.49962],"mirror":"x"},
  {"name":"hind_foot_l","parent":"hind_cannon_l","head":[0.19236,0.04906,-0.49962],"tail":[0.19267,0.04521,-0.36785],"mirror":"x"},
  {"name":"hind_toe_l","parent":"hind_foot_l","head":[0.19267,0.04521,-0.36785],"tail":[0.19267,0.04621,-0.36785],"mirror":"x"},
  {"name":"neck_1","parent":"torso_spine_5","head":[-0.00165,1.01499,0.76796],"tail":[-0.00158,1.05269,0.84833]},
  {"name":"neck_2","parent":"neck_1","head":[-0.00158,1.05269,0.84833],"tail":[-0.00127,1.03648,0.96239]},
  {"name":"head_head","parent":"neck_2","head":[-0.00127,1.03648,0.96239],"tail":[-0.01397,0.68333,1.09737]},
  {"name":"head_head_2","parent":"head_head","head":[-0.01397,0.68333,1.09737],"tail":[0.01343,0.63947,1.23042]},
  {"name":"head_head_3","parent":"head_head_2","head":[0.01343,0.63947,1.23042],"tail":[0.01343,0.64047,1.23042]},
  {"name":"head_ear_left","parent":"head_head","head":[0.18892,1.29549,1.04272],"tail":[0.22446,1.32201,1.06843]},
  {"name":"head_ear_2_left","parent":"head_ear_left","head":[0.22446,1.32201,1.06843],"tail":[0.22446,1.32301,1.06843]},
  {"name":"head_ear_right","parent":"head_head","head":[-0.14682,1.28772,1.0399],"tail":[-0.17264,1.32081,1.06933]},
  {"name":"head_ear_2_right","parent":"head_ear_right","head":[-0.17264,1.32081,1.06933],"tail":[-0.17264,1.32181,1.06933]},
  {"name":"trunk_1","parent":"head_head","head":[-0.0108,0.80669,1.28664],"tail":[-0.0108,0.73235,1.35427]},
  {"name":"trunk_2","parent":"trunk_1","head":[-0.0108,0.73235,1.35427],"tail":[-0.0108,0.68018,1.4206]},
  {"name":"trunk_3","parent":"trunk_2","head":[-0.0108,0.68018,1.4206],"tail":[-0.0108,0.64963,1.49214]},
  {"name":"trunk_4","parent":"trunk_3","head":[-0.0108,0.64963,1.49214],"tail":[-0.0108,0.64814,1.56814]},
  {"name":"trunk_5","parent":"trunk_4","head":[-0.0108,0.64814,1.56814],"tail":[-0.0108,0.65783,1.63745]},
  {"name":"trunk_6","parent":"trunk_5","head":[-0.0108,0.65783,1.63745],"tail":[-0.0108,0.65822,1.63745]},
];
const rig = {
  joints: [
    {"bone":"fore_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"fore_shin_l","kind":"hinge","axis":[-0.522,0.161,-0.838],"range":[-12,134],"mirror":"x"},
    {"bone":"fore_cannon_l","kind":"hinge","axis":[-0.888,0.129,-0.44],"range":[-39,82],"mirror":"x"},
    {"bone":"fore_foot_l","kind":"ball","fwd":30,"back":30,"lat":15,"twist":15,"mirror":"x"},
    {"bone":"hind_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"hind_shin_l","kind":"hinge","axis":[-0.943,0.077,-0.325],"range":[-10,136],"mirror":"x"},
    {"bone":"hind_cannon_l","kind":"hinge","axis":[-0.919,0.078,-0.385],"range":[-38,83],"mirror":"x"},
    {"bone":"hind_foot_l","kind":"ball","fwd":30,"back":30,"lat":15,"twist":15,"mirror":"x"},
    {"bone":"neck_1","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
    {"bone":"neck_2","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
    {"bone":"head_head_2","kind":"hinge","axis":[0.979,0,-0.202],"range":[-5,35]},
    {"bone":"trunk_1","kind":"ball","fwd":30,"back":30,"lat":30,"twist":20},
    {"bone":"trunk_2","kind":"ball","fwd":30,"back":30,"lat":30,"twist":20},
    {"bone":"trunk_3","kind":"ball","fwd":30,"back":30,"lat":30,"twist":20},
    {"bone":"trunk_4","kind":"ball","fwd":30,"back":30,"lat":30,"twist":20},
    {"bone":"trunk_5","kind":"ball","fwd":30,"back":30,"lat":30,"twist":20},
  ],
  chains: [
    {"name":"fore_l","bones":["fore_thigh_l","fore_shin_l","fore_cannon_l"],"solver":"z_leg","tip":"fore_foot_l","pole":[0.602,0.007,-0.799],"pole_w":1,"mirror":"x"},
    {"name":"hind_l","bones":["hind_thigh_l","hind_shin_l","hind_cannon_l"],"solver":"z_leg","tip":"hind_foot_l","pole":[0.322,-0.047,-0.945],"pole_w":1,"mirror":"x"},
    {"name":"neck","bones":["neck_1","neck_2"]},
  ],
};
const legs = {"legs":[{"chain":"hind_l","mirror":"x","foot_height":0.00878},{"chain":"fore_l","mirror":"x","foot_height":0.01078}],"gait":{"from":"panda_bear_walk","ride":1.11915}};
const body = {"gravity":9.8,"turn_rate":2.43,"max_speed":3};
const roles = {"hips":"root","spine":["torso_spine_1","torso_spine_2","torso_spine_3","torso_spine_4","torso_spine_5"],"neck":["neck_1","neck_2"],"head":"head_head","ears":[["head_ear_left","head_ear_2_left"],["head_ear_right","head_ear_2_right"]],"jaw":"head_head_2"};
const traits = {"breath":1.3,"idle":1.2,"fidget":0.8};
const physics = {"mass":1123.857,"shapes":[{"id":"body","shape":"capsule","a":[0.01388,0.88951,-0.54412],"b":[0.01388,0.88951,0.40666],"radius":0.44,"bone":"root"},{"id":"head","shape":"sphere","center":[0.01611,1.04014,1.1479],"radius":0.344,"bone":"head_head"},{"id":"fore_l","shape":"capsule","a":[0.2344,0.71451,0.55372],"b":[0.17124,0.10737,0.49962],"radius":0.106,"mirror":"x"},{"id":"hind_l","shape":"capsule","a":[0.27547,0.77353,-0.51168],"b":[0.19236,0.12381,-0.49962],"radius":0.123,"mirror":"x"}]};
const parts = [
  {"id":"torso_0","shape":"volume","volume":"giant_panda_bear_male_torso","origin":[-0.00502,1.17641,-0.50375],"rotate":[0,0,0],"scale":1,"bone":"root","bone_map":{"@host":"root","torso_pelvis":"root","torso_spine_1":"torso_spine_1","torso_spine_2":"torso_spine_2","torso_spine_3":"torso_spine_3","torso_spine_4":"torso_spine_4","torso_spine_5":"torso_spine_5","torso_clavicle_l":"torso_clavicle_l","torso_clavicle_r":"torso_clavicle_r","torso_spine_2_b1":"torso_spine_2_b1","@neck":"neck_1","@leg_f_l":"fore_thigh_l","@leg_f_r":"fore_thigh_r","@leg_h_l":"hind_thigh_l","@leg_h_r":"hind_thigh_r","@tail":"root"}},
  {"id":"fore_thigh_0","shape":"volume","volume":"giant_panda_bear_male_leg_fl","origin":[0.2344,0.79623,0.55372],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"torso_clavicle_l","bone_map":{"@host":"torso_clavicle_l","leg_thigh_l":"fore_thigh_l","leg_shin_l":"fore_shin_l","leg_cannon_l":"fore_cannon_l","leg_foot_l":"fore_foot_l","leg_toe_l":"fore_toe_l","Belly_24":"torso_spine_2_b1","Bear_Neck_01SHJnt_20":"neck_1","Bear_r_FrontLeg_HipSHJnt_10":"fore_thigh_r"},"blend":0.05318,"blend_mode":"cubic"},
  {"id":"hind_thigh_0","shape":"volume","volume":"giant_panda_bear_male_leg_hl","origin":[0.27547,0.85729,-0.51168],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"root","bone_map":{"@host":"root","leg_thigh_l":"hind_thigh_l","leg_shin_l":"hind_shin_l","leg_cannon_l":"hind_cannon_l","leg_foot_l":"hind_foot_l","leg_toe_l":"hind_toe_l","Bear_Spine_01SHJnt_26":"torso_spine_1","Bear_r_HindLeg_HipSHJnt_36":"hind_thigh_r","Bear_Spine_02SHJnt_25":"torso_spine_2","Belly_24":"torso_spine_2_b1"},"blend":0.06141,"blend_mode":"cubic"},
  {"id":"neck_1_0","shape":"volume","volume":"giant_panda_bear_male_neck","origin":[-0.00165,1.01499,0.76796],"rotate":[0,0,0],"scale":1,"bone":"torso_spine_5","bone_map":{"@host":"torso_spine_5","neck_1":"neck_1","neck_2":"neck_2","@bear_neck_top":"head_head","Bear_l_Clavicle_01_01SHJnt_5":"torso_clavicle_l","Bear_r_Clavicle_01_01SHJnt_11":"torso_clavicle_r","Bear_l_FrontLeg_HipSHJnt_4":"fore_thigh_l","Bear_r_FrontLeg_HipSHJnt_10":"fore_thigh_r"},"blend":0.06183,"blend_mode":"cubic"},
  {"id":"head_head_0","shape":"volume","volume":"giant_panda_bear_male_head","origin":[-0.00127,1.03648,0.96239],"rotate":[0,0,0],"scale":1,"bone":"neck_2","bone_map":{"@host":"neck_2","head_head":"head_head","head_head_2":"head_head_2","head_head_3":"head_head_3","head_ear_left":"head_ear_left","head_ear_2_left":"head_ear_2_left","head_ear_right":"head_ear_right","head_ear_2_right":"head_ear_2_right","Bear_l_Clavicle_01_01SHJnt_5":"torso_clavicle_l","Bear_r_Clavicle_01_01SHJnt_11":"torso_clavicle_r"},"blend":0.0731,"blend_mode":"cubic"},
  {"id":"trunk_1_0","shape":"volume","volume":"african_elephant_snout","origin":[-0.0108,0.80669,1.28664],"rotate":[0,0,0],"scale":0.39217,"bone":"head_head","bone_map":{"@host":"head_head","snout_1":"trunk_1","snout_2":"trunk_2","snout_3":"trunk_3","snout_4":"trunk_4","snout_5":"trunk_5","snout_6":"trunk_6"},"blend":0.01778,"blend_mode":"cubic"},
];
const sdf = Object.assign({"cell":0.02462,"decimate":{"ratio":0.4},"skin":{"falloff":1.5,"seam":1},"shade":{"ao":0.45,"ao_radius":0.07386,"tone":0.2,"color_blend":1},"volumes":{"giant_panda_bear_male_torso":{"hash":"22061e23","piece":"/soma/parts/catalog/torso/giant_panda_bear_male_torso.somapart","bake":{"cell":0.0156,"band":9}},"giant_panda_bear_male_leg_fl":{"hash":"e323b166","piece":"/soma/parts/catalog/leg/giant_panda_bear_male_leg_fl.somapart","bake":{"cell":0.0156,"band":6}},"giant_panda_bear_male_leg_hl":{"hash":"afee502f","piece":"/soma/parts/catalog/leg/giant_panda_bear_male_leg_hl.somapart","bake":{"cell":0.0156,"band":6}},"giant_panda_bear_male_neck":{"hash":"79190db0","piece":"/soma/parts/catalog/neck/giant_panda_bear_male_neck.somapart","bake":{"cell":0.0156,"band":6}},"giant_panda_bear_male_head":{"hash":"88d4fcc7","piece":"/soma/parts/catalog/head/giant_panda_bear_male_head.somapart","bake":{"cell":0.0156,"band":6}},"african_elephant_snout":{"hash":"8b495651","piece":"/soma/parts/catalog/snout/african_elephant_snout.somapart","bake":{"cell":0.0372,"band":7}}}}, { parts: parts });
const material = {"roughness":0.72,"metal":0};
const creator = {"format":"soma.creator","version":1,"name":"trunk_bear","description":"a trunked bear: the giant panda's torso, legs, neck and head with an African elephant's trunk on its snout","torso":{"shape":"piece","size":[0.95661,1.14951,1.83086],"axis":"z","round":0,"color":[0.381,0.342,0.328],"piece":"giant_panda_bear_male_torso","scale":1},"parts":[{"id":"fore","preset":"piece","params":{"piece":"giant_panda_bear_male_leg_fl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_clavicle_l","t":1,"dir":[-0.39033,0.9167,-0.085461],"socket":"leg_f_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"hind","preset":"piece","params":{"piece":"giant_panda_bear_male_leg_hl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"root","t":1,"dir":[0.88381,0.340941,0.320374],"socket":"leg_h_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"neck","preset":"piece","params":{"piece":"giant_panda_bear_male_neck","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_5","t":1,"dir":[0.000368,0.74774,-0.663992],"socket":"neck"},"mirror":false,"color":null,"colors":{},"ik":{"on":true},"roles":{}},{"id":"head","preset":"piece","params":{"piece":"giant_panda_bear_male_head","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"neck_2","t":1,"dir":[-0.037487,0.484535,0.873968],"socket":"neck.bear_neck_top"},"mirror":false,"color":null,"colors":{},"ik":{"on":false},"roles":{}},{"id":"trunk","preset":"piece","params":{"piece":"african_elephant_snout","scale":0.75,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"head_head","t":0.75,"dir":[0.011142,0.356826,-0.934104]},"mirror":false,"color":null,"colors":{},"ik":{"on":false},"roles":{}}],"pieces":{"giant_panda_bear_male_torso":{"hash":"22061e23","file":"/soma/parts/catalog/torso/giant_panda_bear_male_torso.somapart"},"giant_panda_bear_male_leg_fl":{"hash":"e323b166","file":"/soma/parts/catalog/leg/giant_panda_bear_male_leg_fl.somapart"},"giant_panda_bear_male_leg_hl":{"hash":"afee502f","file":"/soma/parts/catalog/leg/giant_panda_bear_male_leg_hl.somapart"},"giant_panda_bear_male_neck":{"hash":"79190db0","file":"/soma/parts/catalog/neck/giant_panda_bear_male_neck.somapart"},"giant_panda_bear_male_head":{"hash":"88d4fcc7","file":"/soma/parts/catalog/head/giant_panda_bear_male_head.somapart"},"african_elephant_snout":{"hash":"8b495651","file":"/soma/parts/catalog/snout/african_elephant_snout.somapart"}},"roles":{},"soft":{},"material":{},"settings":{"gait":"auto","pattern":"auto","slack":0.05,"center":true,"face_roles":true,"soft_roles":true,"body":{"turn_rate":2.43,"max_speed":3},"physics":"auto","traits":{"breath":1.3,"idle":1.2,"fidget":0.8},"flight":"auto","wave":"auto","sdf":{},"vehicle":"auto","aircraft":"auto","rotors":"auto"},"ui":{"library":{"built_from":"pieces","kind":"mixed","species":"trunked bear","sources":[{"uid":"9291b3d011b04dd09b6a91ddcb35b729","title":"Giant Panda Bear Male (Endangered)"},{"uid":"33b4c1d4466c4cdc94de2ac01f596ca4","title":"African Elephant"}],"recipe":"soma/creator/saved/trunk_bear.creator.json"}}};
return {
  name: "trunk_bear", max: 16,
  family: { faction: "animal", kind: "animal", hp: 73 },
  nav: { agent: { name: "trunk_bear", radius: 0.5, height: 1.42, step: 0.26, slope: 35, drop: 0.4 } },
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
      ["health", { hp: 73 }],
      ["flee", { speed: 3.6, distance: 11 }],
      ["curious", { approach: 0.3, cooldown: 20, near: 1.6 }],
      ["idle_life", { clip_look: "bear_emote_3", clip_stretch: "bear_emote", clip_scratch: "bear_emote_2", clip_yawn: "bear_emote", clip_shift: "bear_idle", clip_sit: "bear_rest_2" }],
      ["injured", { clip_flinch: "" }],
      ["wander", { speed: 1.35, near: 0.6 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "trunk_bear", select: [ld.node("flee"), ld.node("curious"), ld.node("idle_life"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
