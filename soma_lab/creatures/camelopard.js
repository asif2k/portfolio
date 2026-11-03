// camelopard: in soma's one form of a creature file (soma/creature_file.js): `body` is the creature as it was made, the rest is who it is to the others (family, nav, abilities) and its mind: the blocks of soma/world/blocks/ it loads by name and
// its tree. The old worker of this file is left out; the mind below is the default of a creature of its kind (animal): write the creature's own in `mind`.
// camelopard: a creature MADE OF THE PARTS CATALOGUE'S PIECES (mixed, long-necked deer): built by soma/tools/piece_creatures.js from its recipe soma/creator/saved/camelopard.creator.json (the recipe is the source of truth:
// `node soma/tools/piece_creatures.js regenerate camelopard` makes this file again after a piece of the catalogue is built again). The creator studio opens it for modification: /soma/soma_creator_studio_demo.jh?creator=/soma/creatures/camelopard.js
// CREDITS: the pieces were cut out of these models of the rigged corpus (D:\work\glb_skinned_meshes: the corpus keeps no author or licence fields; title and uid as the corpus has them):
//   "Doe" (uid a7b3fc46df064233931861399d106e20, uncategorized/a7b3fc46df064233931861399d106e20_Doe.glb): doe_torso, doe_leg_fl, doe_leg_hl, doe_head
//   "Giraffe lowpoly" (uid bb1fde5cbd9a4da987d535b0525a9a38, mammals_wild/bb1fde5cbd9a4da987d535b0525a9a38_Giraffe_lowpoly.glb): bb1fde_giraffe_neck
"use strict";
// camelopard: a camelopard: the doe's torso, legs and head on a giraffe's long neck. Made by the creature creator (soma/creator/creator.js, SOMA.md "The creator") from the `creator` object at the end of this file:
// the studio opens it again from that object (creator.from_definition). ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature. Metres, +x to its left, +y up, +z forward.
const skeleton = [
  {"name":"root","parent":null,"head":[0,0.87535,-0.21232],"tail":[0.00353,0.89135,-0.38707]},
  {"name":"torso_spine_1","parent":"root","head":[0,0.86253,-0.05723],"tail":[0,0.80034,0.12782]},
  {"name":"torso_spine_2","parent":"torso_spine_1","head":[0,0.80034,0.12782],"tail":[0,0.80084,0.38501]},
  {"name":"torso_spine_3","parent":"torso_spine_2","head":[0,0.80084,0.38501],"tail":[0,0.88153,0.55004]},
  {"name":"torso_clavicle_l","parent":"torso_spine_3","head":[0.0771,0.92668,0.40363],"tail":[0.11619,0.76801,0.39944]},
  {"name":"torso_clavicle_r","parent":"torso_spine_3","head":[-0.0771,0.92668,0.40363],"tail":[-0.11619,0.76801,0.39944]},
  {"name":"torso_pelvis_b1","parent":"root","head":[0.00353,0.89135,-0.38707],"tail":[0,0.81716,-0.42805]},
  {"name":"torso_pelvis_b1_b1","parent":"torso_pelvis_b1","head":[0,0.81716,-0.42805],"tail":[0,0.81816,-0.42805]},
  {"name":"fore_thigh_l","parent":"torso_clavicle_l","head":[0.11619,0.76801,0.39944],"tail":[0.12629,0.60791,0.39372],"mirror":"x"},
  {"name":"fore_shin_l","parent":"fore_thigh_l","head":[0.12629,0.60791,0.39372],"tail":[0.13906,0.34237,0.39151],"mirror":"x"},
  {"name":"fore_cannon_l","parent":"fore_shin_l","head":[0.13906,0.34237,0.39151],"tail":[0.13342,0.10447,0.40473],"mirror":"x"},
  {"name":"fore_foot_l","parent":"fore_cannon_l","head":[0.13342,0.10447,0.40473],"tail":[0.1318,0.0236,0.43478],"mirror":"x"},
  {"name":"fore_toe_l","parent":"fore_foot_l","head":[0.1318,0.0236,0.43478],"tail":[0.1318,0.0246,0.43478],"mirror":"x"},
  {"name":"hind_thigh_l","parent":"root","head":[0.11362,0.87412,-0.21005],"tail":[0.13519,0.60291,-0.22255],"mirror":"x"},
  {"name":"hind_shin_l","parent":"hind_thigh_l","head":[0.13519,0.60291,-0.22255],"tail":[0.13507,0.43616,-0.37894],"mirror":"x"},
  {"name":"hind_cannon_l","parent":"hind_shin_l","head":[0.13507,0.43616,-0.37894],"tail":[0.13252,0.09996,-0.40473],"mirror":"x"},
  {"name":"hind_foot_l","parent":"hind_cannon_l","head":[0.13252,0.09996,-0.40473],"tail":[0.13048,0.02582,-0.37513],"mirror":"x"},
  {"name":"hind_toe_l","parent":"hind_foot_l","head":[0.13048,0.02582,-0.37513],"tail":[0.13048,0.02682,-0.37513],"mirror":"x"},
  {"name":"neck_1","parent":"torso_spine_3","head":[0,0.88153,0.55004],"tail":[0.00006,0.98879,0.63181]},
  {"name":"neck_2","parent":"neck_1","head":[0.00006,0.98879,0.63181],"tail":[0.0001,1.10811,0.68797]},
  {"name":"neck_3","parent":"neck_2","head":[0.0001,1.10811,0.68797],"tail":[0.00014,1.2157,0.73585]},
  {"name":"neck_4","parent":"neck_3","head":[0.00014,1.2157,0.73585],"tail":[0.00017,1.30982,0.78209]},
  {"name":"neck_5","parent":"neck_4","head":[0.00017,1.30982,0.78209],"tail":[0.00021,1.40528,0.83016]},
  {"name":"neck_6","parent":"neck_5","head":[0.00021,1.40528,0.83016],"tail":[0.00022,1.44922,0.84936]},
  {"name":"neck_5_b1","parent":"neck_5","head":[-0.00998,1.28728,0.82192],"tail":[-0.00998,1.28777,0.82184]},
  {"name":"neck_3_b1","parent":"neck_3","head":[0.00018,1.07531,0.78596],"tail":[0.00018,1.07579,0.78587]},
  {"name":"neck_2_b1","parent":"neck_2","head":[0.00013,0.93741,0.72199],"tail":[0.00013,0.93789,0.72191]},
  {"name":"head_head","parent":"neck_6","head":[0.00022,1.44922,0.84936],"tail":[-0.07392,1.44937,0.8987]},
  {"name":"head_eye_l","parent":"head_head","head":[-0.07151,1.52177,0.83226],"tail":[-0.0718,1.52192,0.8329]},
  {"name":"head_ear_l","parent":"head_head","head":[-0.07392,1.44937,0.8987],"tail":[-0.13999,1.44755,0.91773]},
  {"name":"head_ear_2_l","parent":"head_ear_l","head":[-0.13999,1.44755,0.91773],"tail":[-0.14029,1.44771,0.91837]},
  {"name":"head_lid_l","parent":"head_head","head":[-0.07855,1.5227,0.82871],"tail":[-0.07884,1.52286,0.82935]},
  {"name":"head_head_2","parent":"head_head","head":[0.0025,1.47613,0.80493],"tail":[-0.01756,1.57255,0.74535]},
  {"name":"head_head_3","parent":"head_head_2","head":[-0.01756,1.57255,0.74535],"tail":[-0.01786,1.57271,0.74599]},
  {"name":"head_eye_r","parent":"head_head","head":[-0.00882,1.55225,0.85377],"tail":[-0.00911,1.5524,0.85441]},
  {"name":"head_ear_r","parent":"head_head","head":[0.01064,1.49049,0.92772],"tail":[0.03383,1.53206,0.97736]},
  {"name":"head_ear_2_r","parent":"head_ear_r","head":[0.03383,1.53206,0.97736],"tail":[0.03353,1.53221,0.978]},
  {"name":"head_lid_r","parent":"head_head","head":[-0.00787,1.56101,0.85635],"tail":[-0.00816,1.56117,0.85699]},
];
const rig = {
  joints: [
    {"bone":"fore_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"fore_shin_l","kind":"hinge","axis":[-0.762,-0.031,-0.647],"range":[-8,138],"mirror":"x"},
    {"bone":"fore_cannon_l","kind":"hinge","axis":[-0.665,-0.026,-0.747],"range":[-12,109],"mirror":"x"},
    {"bone":"fore_foot_l","kind":"ball","fwd":30,"back":30,"lat":15,"twist":15,"mirror":"x"},
    {"bone":"hind_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"hind_shin_l","kind":"hinge","axis":[0.993,0.083,-0.089],"range":[-47,99],"mirror":"x"},
    {"bone":"hind_cannon_l","kind":"hinge","axis":[-1,0.008,-0.008],"range":[-45,76],"mirror":"x"},
    {"bone":"hind_foot_l","kind":"ball","fwd":30,"back":30,"lat":15,"twist":15,"mirror":"x"},
    {"bone":"neck_1","kind":"ball","fwd":25,"back":25,"lat":25,"twist":20},
    {"bone":"neck_2","kind":"ball","fwd":25,"back":25,"lat":25,"twist":20},
    {"bone":"neck_3","kind":"ball","fwd":25,"back":25,"lat":25,"twist":20},
    {"bone":"neck_4","kind":"ball","fwd":25,"back":25,"lat":25,"twist":20},
    {"bone":"neck_5","kind":"ball","fwd":25,"back":25,"lat":25,"twist":20},
    {"bone":"neck_6","kind":"ball","fwd":25,"back":25,"lat":25,"twist":20},
    {"bone":"head_head_2","kind":"hinge","axis":[-0.948,0,0.319],"range":[-5,35]},
  ],
  chains: [
    {"name":"fore_l","bones":["fore_thigh_l","fore_shin_l","fore_cannon_l"],"solver":"z_leg","tip":"fore_foot_l","pole":[0.647,0.011,-0.763],"pole_w":1,"mirror":"x"},
    {"name":"hind_l","bones":["hind_thigh_l","hind_shin_l","hind_cannon_l"],"solver":"z_leg","tip":"hind_foot_l","pole":[0.272,-0.228,0.935],"pole_w":1,"mirror":"x"},
    {"name":"neck","bones":["neck_1","neck_2","neck_3","neck_4","neck_5","neck_6"]},
  ],
};
const legs = {"legs":[{"chain":"hind_l","mirror":"x","foot_height":0.09907},{"chain":"fore_l","mirror":"x","foot_height":0.10447}],"gait":{"from":"giraffe_walk_2","ride":0.84302}};
const body = {"gravity":9.8,"turn_rate":3.12,"max_speed":3.5};
const roles = {"hips":"root","spine":["torso_pelvis_b1"],"neck":["neck_1","neck_2","neck_3","neck_4","neck_5","neck_6"],"head":"head_head","eyes":["head_eye_l","head_eye_r"],"lids":["head_lid_l","head_lid_r"],"ears":[["head_ear_l","head_ear_2_l"],["head_ear_r","head_ear_2_r"]],"jaw":"head_head_2"};
const traits = {"ears":1.6,"tail":1.6,"fidget":1.4,"idle":1.2};
const physics = {"mass":95.757,"shapes":[{"id":"body","shape":"capsule","a":[-0.00011,0.80825,-0.27829],"b":[-0.00011,0.80825,0.4617],"radius":0.167,"bone":"root"},{"id":"head","shape":"sphere","center":[-0.08119,1.50408,0.88538],"radius":0.161,"bone":"head_head"},{"id":"fore_l","shape":"capsule","a":[0.11619,0.70153,0.39944],"b":[0.13342,0.07977,0.40473],"radius":0.046,"mirror":"x"},{"id":"hind_l","shape":"capsule","a":[0.11362,0.7903,-0.21005],"b":[0.13252,0.10058,-0.40473],"radius":0.06,"mirror":"x"}]};
const parts = [
  {"id":"torso_0","shape":"volume","volume":"doe_torso","origin":[0,0.87535,-0.21232],"rotate":[0,0,0],"scale":1,"bone":"root","bone_map":{"@host":"root","torso_pelvis":"root","torso_spine_1":"torso_spine_1","torso_spine_2":"torso_spine_2","torso_spine_3":"torso_spine_3","torso_clavicle_l":"torso_clavicle_l","torso_clavicle_r":"torso_clavicle_r","torso_pelvis_b1":"torso_pelvis_b1","torso_pelvis_b1_b1":"torso_pelvis_b1_b1","@neck":"neck_1","@leg_f_l":"fore_thigh_l","@leg_f_r":"fore_thigh_r","@leg_h_l":"hind_thigh_l","@leg_h_r":"hind_thigh_r"}},
  {"id":"fore_thigh_0","shape":"volume","volume":"doe_leg_fl","origin":[0.11619,0.76801,0.39944],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"torso_clavicle_l","bone_map":{"@host":"torso_clavicle_l","leg_thigh_l":"fore_thigh_l","leg_shin_l":"fore_shin_l","leg_cannon_l":"fore_cannon_l","leg_foot_l":"fore_foot_l","leg_toe_l":"fore_toe_l","neck_01_06":"neck_1"},"blend":0.02321,"blend_mode":"cubic"},
  {"id":"hind_thigh_0","shape":"volume","volume":"doe_leg_hl","origin":[0.11362,0.87412,-0.21005],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"root","bone_map":{"@host":"root","leg_thigh_l":"hind_thigh_l","leg_shin_l":"hind_shin_l","leg_cannon_l":"hind_cannon_l","leg_foot_l":"hind_foot_l","leg_toe_l":"hind_toe_l","spine_01_03":"torso_spine_1","thigh_R_037":"hind_thigh_r","spine_02_04":"torso_spine_2"},"blend":0.03023,"blend_mode":"cubic"},
  {"id":"neck_1_0","shape":"volume","volume":"bb1fde_giraffe_neck","origin":[0,0.88153,0.55004],"rotate":[-9.77557,0.04251,-0.00001],"scale":0.48954,"bone":"torso_spine_3","bone_map":{"@host":"torso_spine_3","neck_1":"neck_1","neck_2":"neck_2","neck_3":"neck_3","neck_4":"neck_4","neck_5":"neck_5","neck_6":"neck_6","neck_5_b1":"neck_5_b1","neck_3_b1":"neck_3_b1","neck_2_b1":"neck_2_b1","@head":"head_head"},"blend":0.02686,"blend_mode":"cubic"},
  {"id":"head_head_0","shape":"volume","volume":"doe_head","origin":[0.00022,1.44922,0.84936],"rotate":[111.83765,17.14868,-154.07234],"scale":0.72001,"bone":"neck_6","bone_map":{"@host":"neck_6","head_head":"head_head","head_eye_l":"head_eye_l","head_ear_l":"head_ear_l","head_ear_2_l":"head_ear_2_l","head_lid_l":"head_lid_l","head_head_2":"head_head_2","head_head_3":"head_head_3","head_eye_r":"head_eye_r","head_ear_r":"head_ear_r","head_ear_2_r":"head_ear_2_r","head_lid_r":"head_lid_r"},"blend":0.03185,"blend_mode":"cubic"},
];
const sdf = Object.assign({"cell":0.01472,"decimate":{"ratio":0.4},"skin":{"falloff":1.5,"seam":1},"shade":{"ao":0.45,"ao_radius":0.04416,"tone":0.2,"color_blend":1},"volumes":{"doe_torso":{"hash":"01df643e","piece":"/soma/parts/catalog/torso/doe_torso.somapart","bake":{"cell":0.0093,"band":6}},"doe_leg_fl":{"hash":"9278e897","piece":"/soma/parts/catalog/leg/doe_leg_fl.somapart","bake":{"cell":0.0093,"band":6}},"doe_leg_hl":{"hash":"c49f403a","piece":"/soma/parts/catalog/leg/doe_leg_hl.somapart","bake":{"cell":0.0093,"band":6}},"bb1fde_giraffe_neck":{"hash":"27f76c02","piece":"/soma/parts/catalog/neck/bb1fde_giraffe_neck.somapart","bake":{"cell":0.0186,"band":6}},"doe_head":{"hash":"2f2c9b36","piece":"/soma/parts/catalog/head/doe_head.somapart","bake":{"cell":0.0131,"band":6}}}}, { parts: parts });
const material = {"roughness":0.72,"metal":0};
const creator = {"format":"soma.creator","version":1,"name":"camelopard","description":"a camelopard: the doe's torso, legs and head on a giraffe's long neck","torso":{"shape":"piece","size":[0.36227,0.4358,1.07328],"axis":"z","round":0,"color":[0.434,0.216,0.125],"piece":"doe_torso","scale":1},"parts":[{"id":"fore","preset":"piece","params":{"piece":"doe_leg_fl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_clavicle_l","t":1,"dir":[-0.177552,0.984064,0.009653],"socket":"leg_f_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"hind","preset":"piece","params":{"piece":"doe_leg_hl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"root","t":0,"dir":[0.99996,-0.000766,-0.008957],"socket":"leg_h_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"neck","preset":"piece","params":{"piece":"bb1fde_giraffe_neck","scale":1.2,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_3","t":1,"dir":[0.002222,0.89399,-0.448081],"socket":"neck"},"mirror":false,"color":null,"colors":{},"ik":{"on":true},"roles":{}},{"id":"head","preset":"piece","params":{"piece":"doe_head","scale":0.6,"blend":-1,"inset":-1,"turn_x":-45,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"neck_6","t":1,"dir":[-0.514028,0.461839,0.722828],"socket":"neck.head"},"mirror":false,"color":null,"colors":{},"ik":{"on":false},"roles":{}}],"pieces":{"doe_torso":{"hash":"01df643e","file":"/soma/parts/catalog/torso/doe_torso.somapart"},"doe_leg_fl":{"hash":"9278e897","file":"/soma/parts/catalog/leg/doe_leg_fl.somapart"},"doe_leg_hl":{"hash":"c49f403a","file":"/soma/parts/catalog/leg/doe_leg_hl.somapart"},"bb1fde_giraffe_neck":{"hash":"27f76c02","file":"/soma/parts/catalog/neck/bb1fde_giraffe_neck.somapart"},"doe_head":{"hash":"2f2c9b36","file":"/soma/parts/catalog/head/doe_head.somapart"}},"roles":{},"soft":{},"material":{},"settings":{"gait":"giraffe_walk_2","pattern":"auto","slack":0.05,"center":true,"face_roles":true,"soft_roles":true,"body":{"turn_rate":3.12,"max_speed":3.5},"physics":"auto","traits":{"ears":1.6,"tail":1.6,"fidget":1.4,"idle":1.2},"flight":"auto","wave":"auto","sdf":{},"vehicle":"auto","aircraft":"auto","rotors":"auto"},"ui":{"library":{"built_from":"pieces","kind":"mixed","species":"long-necked deer","sources":[{"uid":"a7b3fc46df064233931861399d106e20","title":"Doe"},{"uid":"bb1fde5cbd9a4da987d535b0525a9a38","title":"Giraffe lowpoly"}],"recipe":"soma/creator/saved/camelopard.creator.json"}}};
return {
  name: "camelopard", max: 16,
  family: { faction: "animal", kind: "animal", hp: 55 },
  nav: { agent: { name: "camelopard", radius: 0.32, height: 1.67, step: 0.31, slope: 35, drop: 0.47 } },
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
      ["health", { hp: 55 }],
      ["flee", { speed: 4.2, distance: 12 }],
      ["curious", { approach: 0.3, cooldown: 20, near: 1.2 }],
      ["idle_life", {}],
      ["injured", { clip_flinch: "" }],
      ["wander", { speed: 1.58, near: 0.5 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "camelopard", select: [ld.node("flee"), ld.node("curious"), ld.node("idle_life"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
