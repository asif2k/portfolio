// wyvern: in soma's one form of a creature file (soma/creature_file.js): `body` is the creature as it was made, the rest is who it is to the others (family, nav, abilities) and its mind: the blocks of soma/world/blocks/ it loads by name and
// its tree. The old worker of this file is left out; the mind below is the default of a creature of its kind (flyer): write the creature's own in `mind`.
// wyvern: a creature MADE OF THE PARTS CATALOGUE'S PIECES (mixed, wyvern): built by soma/tools/piece_creatures.js from its recipe soma/creator/saved/wyvern.creator.json (the recipe is the source of truth:
// `node soma/tools/piece_creatures.js regenerate wyvern` makes this file again after a piece of the catalogue is built again). The creator studio opens it for modification: /soma/soma_creator_studio_demo.jh?creator=/soma/creatures/wyvern.js
// CREDITS: the pieces were cut out of these models of the rigged corpus (D:\work\glb_skinned_meshes: the corpus keeps no author or licence fields; title and uid as the corpus has them):
//   "3DFoin   Raptor   02" (uid bcf2ce39b9a3418fb8c43c0cda83dd51, dinosaurs/bcf2ce39b9a3418fb8c43c0cda83dd51_3DFoin___Raptor___02.glb): 3dfoin_raptor_02_torso, 3dfoin_raptor_02_leg_l, 3dfoin_raptor_02_tail
//   "004 Dragón Eléctrico" (uid 8a8b3854abc14eab9b0c111932ab047a, dragons/8a8b3854abc14eab9b0c111932ab047a_004_Dragón_Eléctrico.glb): 004_dragon_electrico_neck, 004_dragon_electrico_head, 004_dragon_electrico_wing_l
"use strict";
// wyvern: a wyvern: the raptor's torso, legs and tail with the electric dragon's neck, horned head and membrane wings (appended as their own mesh). Made by the creature creator (soma/creator/creator.js, SOMA.md "The creator") from the `creator` object at the end of this file:
// the studio opens it again from that object (creator.from_definition). ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature. Metres, +x to its left, +y up, +z forward.
const skeleton = [
  {"name":"root","parent":null,"head":[0,0.50019,0.03805],"tail":[0,0.50119,0.03805]},
  {"name":"torso_spine_1","parent":"root","head":[0,0.50019,0.03805],"tail":[0,0.51639,0.12075]},
  {"name":"torso_spine_2","parent":"torso_spine_1","head":[0,0.51639,0.12075],"tail":[0,0.5371,0.24053]},
  {"name":"torso_spine_3","parent":"torso_spine_2","head":[0,0.5371,0.24053],"tail":[0,0.5964,0.38729]},
  {"name":"leg_thigh_l","parent":"torso_spine_2","head":[0.08717,0.50019,0.03805],"tail":[0.08326,0.32621,0.07053],"mirror":"x"},
  {"name":"leg_shin_l","parent":"leg_thigh_l","head":[0.08326,0.32621,0.07053],"tail":[0.08427,0.23233,-0.06816],"mirror":"x"},
  {"name":"leg_cannon_l","parent":"leg_shin_l","head":[0.08427,0.23233,-0.06816],"tail":[0.1129,0.02298,0],"mirror":"x"},
  {"name":"leg_toe_2_l","parent":"leg_cannon_l","head":[0.1129,0.02298,0],"tail":[0.12054,0.01959,0.03233],"mirror":"x"},
  {"name":"leg_toe_3_l","parent":"leg_toe_2_l","head":[0.12054,0.01959,0.03233],"tail":[0.12771,0.0164,0.06262],"mirror":"x"},
  {"name":"leg_toe_4_l","parent":"leg_toe_3_l","head":[0.12771,0.0164,0.06262],"tail":[0.12771,0.0174,0.06262],"mirror":"x"},
  {"name":"leg_toe_5_l","parent":"leg_cannon_l","head":[0.08925,0.02023,0.00225],"tail":[0.08675,0.01407,0.03803],"mirror":"x"},
  {"name":"leg_toe_6_l","parent":"leg_toe_5_l","head":[0.08675,0.01407,0.03803],"tail":[0.08438,0.00825,0.07186],"mirror":"x"},
  {"name":"leg_toe_7_l","parent":"leg_toe_6_l","head":[0.08438,0.00825,0.07186],"tail":[0.08438,0.00925,0.07186],"mirror":"x"},
  {"name":"leg_foot_l","parent":"leg_cannon_l","head":[0.06449,0.01446,0.00516],"tail":[0.05679,0.04901,0.01693],"mirror":"x"},
  {"name":"leg_toe_l","parent":"leg_foot_l","head":[0.05679,0.04901,0.01693],"tail":[0.04953,0.08241,0.02654],"mirror":"x"},
  {"name":"leg_tip_l","parent":"leg_toe_l","head":[0.04953,0.08241,0.02654],"tail":[0.04953,0.04967,0.02654],"mirror":"x"},
  {"name":"tail_1","parent":"torso_spine_2","head":[0,0.53403,-0.04862],"tail":[0,0.5505,-0.14369]},
  {"name":"tail_2","parent":"tail_1","head":[0,0.5505,-0.14369],"tail":[0,0.56705,-0.23875]},
  {"name":"tail_3","parent":"tail_2","head":[0,0.56705,-0.23875],"tail":[0,0.58369,-0.33379]},
  {"name":"tail_4","parent":"tail_3","head":[0,0.58369,-0.33379],"tail":[0,0.59937,-0.429]},
  {"name":"tail_5","parent":"tail_4","head":[0,0.59937,-0.429],"tail":[0,0.6141,-0.52436]},
  {"name":"tail_6","parent":"tail_5","head":[0,0.6141,-0.52436],"tail":[0,0.62786,-0.61986]},
  {"name":"tail_7","parent":"tail_6","head":[0,0.62786,-0.61986],"tail":[0,0.64068,-0.71549]},
  {"name":"tail_8","parent":"tail_7","head":[0,0.64068,-0.71549],"tail":[0,0.65253,-0.81125]},
  {"name":"tail_9","parent":"tail_8","head":[0,0.65253,-0.81125],"tail":[0,0.66342,-0.90712]},
  {"name":"tail_10","parent":"tail_9","head":[0,0.66342,-0.90712],"tail":[0,0.67567,-1.00282]},
  {"name":"tail_11","parent":"tail_10","head":[0,0.67567,-1.00282],"tail":[0,0.68697,-1.09865]},
  {"name":"tail_12","parent":"tail_11","head":[0,0.68697,-1.09865],"tail":[0,0.68797,-1.09865]},
  {"name":"neck_1","parent":"torso_spine_3","head":[0,0.5964,0.38729],"tail":[0,0.67949,0.42739]},
  {"name":"neck_2","parent":"neck_1","head":[0,0.67949,0.42739],"tail":[0,0.75717,0.45874]},
  {"name":"neck_3","parent":"neck_2","head":[0,0.75717,0.45874],"tail":[0,0.82864,0.48306]},
  {"name":"head_head","parent":"neck_3","head":[0,0.82864,0.48306],"tail":[-0.02797,0.8567,0.5098]},
  {"name":"head_head_b1_l","parent":"head_head","head":[-0.02797,0.8567,0.5098],"tail":[-0.02797,0.85661,0.50998]},
  {"name":"head_head_b1_b1_l","parent":"head_head_b1_l","head":[-0.02797,0.8567,0.5098],"tail":[-0.02797,0.85661,0.50998]},
  {"name":"head_head_b1_b2_l","parent":"head_head_b1_l","head":[-0.02797,0.8567,0.5098],"tail":[-0.02797,0.85661,0.50998]},
  {"name":"head_head_b1_r","parent":"head_head","head":[0.02797,0.8567,0.5098],"tail":[0.02797,0.85661,0.50998]},
  {"name":"head_head_b1_b1_r","parent":"head_head_b1_r","head":[0.02797,0.8567,0.5098],"tail":[0.02797,0.85661,0.50998]},
  {"name":"head_head_b1_b2_r","parent":"head_head_b1_r","head":[0.02797,0.8567,0.5098],"tail":[0.02797,0.85661,0.50998]},
  {"name":"head_head_2","parent":"head_head","head":[0,0.84491,0.4758],"tail":[0,0.84482,0.47598]},
  {"name":"head_head_3","parent":"head_head_2","head":[0,0.84491,0.4758],"tail":[0,0.84482,0.47598]},
  {"name":"wing_upper_l","parent":"torso_spine_3","head":[0.03046,0.61528,0.2874],"tail":[0.06867,0.69586,0.26521],"mirror":"x"},
  {"name":"wing_fore_l","parent":"wing_upper_l","head":[0.06867,0.69586,0.26521],"tail":[0.08329,0.74058,0.26666],"mirror":"x"},
  {"name":"wing_hand_l","parent":"wing_fore_l","head":[0.08329,0.74058,0.26666],"tail":[0.10971,0.83176,0.31164],"mirror":"x"},
  {"name":"wing_finger_l","parent":"wing_hand_l","head":[0.10971,0.83176,0.31164],"tail":[0.15971,0.90285,0.27979],"mirror":"x"},
  {"name":"wing_tip_l","parent":"wing_finger_l","head":[0.15971,0.90285,0.27979],"tail":[0.41302,1.08921,0.23881],"mirror":"x"},
  {"name":"wing_tip_2_l","parent":"wing_tip_l","head":[0.41302,1.08921,0.23881],"tail":[0.41302,1.08941,0.23881],"mirror":"x"},
  {"name":"wing_finger_b1_l","parent":"wing_finger_l","head":[0.10971,0.78245,0.20322],"tail":[0.1242,0.74339,0.14685],"mirror":"x"},
  {"name":"wing_finger_b1_b1_l","parent":"wing_finger_b1_l","head":[0.1242,0.74339,0.14685],"tail":[0.1242,0.74359,0.14685],"mirror":"x"},
  {"name":"wing_finger_b2_l","parent":"wing_finger_l","head":[0.14044,0.85275,0.19412],"tail":[0.19709,0.83606,0.123],"mirror":"x"},
  {"name":"wing_finger_b2_b1_l","parent":"wing_finger_b2_l","head":[0.19709,0.83606,0.123],"tail":[0.19709,0.83626,0.123],"mirror":"x"},
  {"name":"wing_finger_b3_l","parent":"wing_finger_l","head":[0.15932,0.90167,0.23862],"tail":[0.25768,0.96652,0.16896],"mirror":"x"},
  {"name":"wing_finger_b3_b1_l","parent":"wing_finger_b3_l","head":[0.25768,0.96652,0.16896],"tail":[0.25768,0.96672,0.16896],"mirror":"x"},
];
const rig = {
  joints: [
    {"bone":"leg_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"leg_shin_l","kind":"hinge","axis":[1,-0.019,0.02],"range":[-72,74],"mirror":"x"},
    {"bone":"leg_cannon_l","kind":"hinge","axis":[-0.991,-0.113,0.069],"range":[-80,41],"mirror":"x"},
    {"bone":"leg_toe_2_l","kind":"ball","fwd":30,"back":30,"lat":15,"twist":15,"mirror":"x"},
    {"bone":"tail_1","kind":"ball","fwd":14,"back":14,"lat":14,"twist":20},
    {"bone":"tail_2","kind":"ball","fwd":14,"back":14,"lat":14,"twist":20},
    {"bone":"tail_3","kind":"ball","fwd":14,"back":14,"lat":14,"twist":20},
    {"bone":"tail_4","kind":"ball","fwd":14,"back":14,"lat":14,"twist":20},
    {"bone":"tail_5","kind":"ball","fwd":14,"back":14,"lat":14,"twist":20},
    {"bone":"tail_6","kind":"ball","fwd":14,"back":14,"lat":14,"twist":20},
    {"bone":"tail_7","kind":"ball","fwd":14,"back":14,"lat":14,"twist":20},
    {"bone":"tail_8","kind":"ball","fwd":14,"back":14,"lat":14,"twist":20},
    {"bone":"tail_9","kind":"ball","fwd":14,"back":14,"lat":14,"twist":20},
    {"bone":"tail_10","kind":"ball","fwd":14,"back":14,"lat":14,"twist":20},
    {"bone":"tail_11","kind":"ball","fwd":14,"back":14,"lat":14,"twist":20},
    {"bone":"neck_1","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
    {"bone":"neck_2","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
    {"bone":"neck_3","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
  ],
  chains: [
    {"name":"leg_l","bones":["leg_thigh_l","leg_shin_l","leg_cannon_l"],"solver":"z_leg","tip":"leg_toe_2_l","pole":[-0.025,-0.368,0.929],"pole_w":1,"mirror":"x"},
    {"name":"tail","bones":["tail_1","tail_2","tail_3","tail_4","tail_5","tail_6","tail_7","tail_8","tail_9","tail_10","tail_11"]},
    {"name":"neck","bones":["neck_1","neck_2","neck_3"]},
  ],
};
const legs = {"legs":[{"chain":"leg_l","mirror":"x","foot_height":0.02298}],"gait":{"from":"raptor_walk","ride":0.50019}};
const body = {"gravity":9.8,"turn_rate":2.96,"max_speed":1.08};
const roles = {"hips":"root","chest":"root","neck":["neck_1","neck_2","neck_3"],"head":"head_head","tail":["tail_1","tail_2","tail_3","tail_4","tail_5","tail_6","tail_7","tail_8","tail_9","tail_10","tail_11","tail_12"]};
const traits = {"tail":1.4,"stabilise":0.8,"breath":1.3};
const physics = {"mass":26.837,"shapes":[{"id":"body","shape":"capsule","a":[0.00034,0.50357,0.02738],"b":[0.00034,0.50357,0.329],"radius":0.127,"bone":"root"},{"id":"head","shape":"sphere","center":[-0.00738,0.80534,0.5204],"radius":0.098,"bone":"head_head"},{"id":"leg_l","shape":"capsule","a":[0.08717,0.44354,0.03805],"b":[0.1129,0.06798,0],"radius":0.038,"mirror":"x"}]};
const parts = [
  {"id":"torso_0","shape":"volume","volume":"3dfoin_raptor_02_torso","origin":[0,0.50019,0.03805],"rotate":[0,0,0],"scale":1,"bone":"root","bone_map":{"@host":"root","torso_pelvis":"root","torso_spine_1":"torso_spine_1","torso_spine_2":"torso_spine_2","torso_spine_3":"torso_spine_3","@neck":"neck_1","@leg_l":"leg_thigh_l","@leg_r":"leg_thigh_r","@tail":"tail_1"},"roughness":0.257,"metal":0},
  {"id":"leg_thigh_0","shape":"volume","volume":"3dfoin_raptor_02_leg_l","origin":[0.08717,0.50019,0.03805],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"torso_spine_2","bone_map":{"@host":"torso_spine_2","leg_thigh_l":"leg_thigh_l","leg_shin_l":"leg_shin_l","leg_cannon_l":"leg_cannon_l","leg_toe_2_l":"leg_toe_2_l","leg_toe_3_l":"leg_toe_3_l","leg_toe_4_l":"leg_toe_4_l","leg_toe_5_l":"leg_toe_5_l","leg_toe_6_l":"leg_toe_6_l","leg_toe_7_l":"leg_toe_7_l","leg_foot_l":"leg_foot_l","leg_toe_l":"leg_toe_l","leg_tip_l":"leg_tip_l","Bip001 Spine1_04":"torso_spine_3","Bip001 Tail_075":"tail_1"},"blend":0.01895,"blend_mode":"cubic","roughness":0.257,"metal":0},
  {"id":"tail_1_0","shape":"volume","volume":"3dfoin_raptor_02_tail","origin":[0,0.53403,-0.04862],"rotate":[0,0,0],"scale":1,"bone":"torso_spine_2","bone_map":{"@host":"torso_spine_2","tail_1":"tail_1","tail_2":"tail_2","tail_3":"tail_3","tail_4":"tail_4","tail_5":"tail_5","tail_6":"tail_6","tail_7":"tail_7","tail_8":"tail_8","tail_9":"tail_9","tail_10":"tail_10","tail_11":"tail_11","tail_12":"tail_12","Bip001 L Thigh_045":"leg_thigh_l","Bip001 R Thigh_060":"leg_thigh_r"},"blend":0.02206,"blend_mode":"cubic","roughness":0.257,"metal":0},
];
const sdf = Object.assign({"cell":0.01791,"decimate":{"ratio":0.4},"skin":{"falloff":1.5,"seam":1},"shade":{"ao":0.45,"ao_radius":0.05373,"tone":0.2,"color_blend":1},"volumes":{"3dfoin_raptor_02_torso":{"hash":"d1a39e46","piece":"/soma/parts/catalog/torso/3dfoin_raptor_02_torso.somapart","bake":{"cell":0.011,"band":6}},"3dfoin_raptor_02_leg_l":{"hash":"fbfb580d","piece":"/soma/parts/catalog/leg/3dfoin_raptor_02_leg_l.somapart","bake":{"cell":0.011,"band":6}},"3dfoin_raptor_02_tail":{"hash":"3e07431a","piece":"/soma/parts/catalog/tail/3dfoin_raptor_02_tail.somapart","bake":{"cell":0.011,"band":6}},"004_dragon_electrico_neck":{"hash":"485f01aa","piece":"/soma/parts/catalog/neck/004_dragon_electrico_neck.somapart"},"004_dragon_electrico_head":{"hash":"2b40e6f1","piece":"/soma/parts/catalog/head/004_dragon_electrico_head.somapart"},"004_dragon_electrico_wing_l":{"hash":"d09c01ad","piece":"/soma/parts/catalog/wing/004_dragon_electrico_wing_l.somapart"}},"meshes":[{"id":"neck_1_0","volume":"004_dragon_electrico_neck","origin":[0,0.5964,0.38729],"rotate":[64.92177,0,180],"scale":0.20102,"bone":"torso_spine_3","bone_map":{"@host":"torso_spine_3","neck_1":"neck_1","neck_2":"neck_2","neck_3":"neck_3","@cabeza":"head_head"},"roughness":0.6,"metal":0},{"id":"head_head_0","volume":"004_dragon_electrico_head","origin":[0,0.82864,0.48306],"rotate":[64.92177,0,180],"scale":0.20102,"bone":"neck_3","bone_map":{"@host":"neck_3","head_head":"head_head","head_head_b1_l":"head_head_b1_l","head_head_b1_b1_l":"head_head_b1_b1_l","head_head_b1_b2_l":"head_head_b1_b2_l","head_head_b1_r":"head_head_b1_r","head_head_b1_b1_r":"head_head_b1_b1_r","head_head_b1_b2_r":"head_head_b1_b2_r","head_head_2":"head_head_2","head_head_3":"head_head_3"},"roughness":0.6,"metal":0},{"id":"wing_upper_0","volume":"004_dragon_electrico_wing_l","origin":[0.03046,0.61528,0.2874],"rotate":[0,0,0],"scale":0.20102,"mirror":"x","bone":"torso_spine_3","bone_map":{"@host":"torso_spine_3","wing_upper_l":"wing_upper_l","wing_fore_l":"wing_fore_l","wing_hand_l":"wing_hand_l","wing_finger_l":"wing_finger_l","wing_tip_l":"wing_tip_l","wing_tip_2_l":"wing_tip_2_l","wing_finger_b1_l":"wing_finger_b1_l","wing_finger_b1_b1_l":"wing_finger_b1_b1_l","wing_finger_b2_l":"wing_finger_b2_l","wing_finger_b2_b1_l":"wing_finger_b2_b1_l","wing_finger_b3_l":"wing_finger_b3_l","wing_finger_b3_b1_l":"wing_finger_b3_b1_l"},"roughness":0.6,"metal":0}]}, { parts: parts });
const flight = {"model":"wing","stall_speed":3.429,"cruise_speed":5.143,"max_speed":8.572,"thrust":0.5,"max_bank":1,"max_pitch":0.7,"clearance":0.915};
const wings = {"wings":[{"bone":"wing_upper_l","tip":"wing_fore_l","mirror":"x"}],"fold":80,"tip_fold":25,"droop":10,"amplitude":35,"tip_amplitude":25,"hz":2.8};
const material = {"roughness":0.72,"metal":0};
const creator = {"format":"soma.creator","version":1,"name":"wyvern","description":"a wyvern: the raptor's torso, legs and tail with the electric dragon's neck, horned head and membrane wings (appended as their own mesh)","torso":{"shape":"piece","size":[0.27574,0.27906,0.5553],"axis":"z","round":0,"color":[0.08,0.051,0.034],"piece":"3dfoin_raptor_02_torso","scale":1},"parts":[{"id":"leg","preset":"piece","params":{"piece":"3dfoin_raptor_02_leg_l","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_2","t":0,"dir":[0.718958,-0.694882,0.015451],"socket":"leg_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"tail","preset":"piece","params":{"piece":"3dfoin_raptor_02_tail","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_2","t":0,"dir":[0,-0.962429,-0.271532],"socket":"tail"},"mirror":false,"color":null,"colors":{},"ik":{"on":true},"roles":{}},{"id":"neck","preset":"piece","params":{"piece":"004_dragon_electrico_neck","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_3","t":1,"dir":[0,0.74037,-0.6722],"socket":"neck"},"mirror":false,"color":null,"colors":{},"ik":{"on":true},"roles":{}},{"id":"head","preset":"piece","params":{"piece":"004_dragon_electrico_head","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"neck_3","t":1,"dir":[-0.585227,0.73594,0.340442],"socket":"neck.cabeza"},"mirror":false,"color":null,"colors":{},"ik":{"on":false},"roles":{}},{"id":"wing","preset":"piece","params":{"piece":"004_dragon_electrico_wing_l","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_3","t":0.3,"dir":[0.447214,0.335083,-0.829288]},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"roles":{}}],"pieces":{"3dfoin_raptor_02_torso":{"hash":"d1a39e46","file":"/soma/parts/catalog/torso/3dfoin_raptor_02_torso.somapart"},"3dfoin_raptor_02_leg_l":{"hash":"fbfb580d","file":"/soma/parts/catalog/leg/3dfoin_raptor_02_leg_l.somapart"},"3dfoin_raptor_02_tail":{"hash":"3e07431a","file":"/soma/parts/catalog/tail/3dfoin_raptor_02_tail.somapart"},"004_dragon_electrico_neck":{"hash":"485f01aa","file":"/soma/parts/catalog/neck/004_dragon_electrico_neck.somapart"},"004_dragon_electrico_head":{"hash":"2b40e6f1","file":"/soma/parts/catalog/head/004_dragon_electrico_head.somapart"},"004_dragon_electrico_wing_l":{"hash":"d09c01ad","file":"/soma/parts/catalog/wing/004_dragon_electrico_wing_l.somapart"}},"roles":{},"soft":{},"material":{},"settings":{"gait":"auto","pattern":"auto","slack":0.05,"center":true,"face_roles":true,"soft_roles":true,"body":{"turn_rate":2.96,"max_speed":1.08},"physics":"auto","traits":{"tail":1.4,"stabilise":0.8,"breath":1.3},"flight":"auto","wave":"auto","sdf":{},"vehicle":"auto","aircraft":"auto","rotors":"auto"},"ui":{"library":{"built_from":"pieces","kind":"mixed","species":"wyvern","sources":[{"uid":"bcf2ce39b9a3418fb8c43c0cda83dd51","title":"3DFoin   Raptor   02"},{"uid":"8a8b3854abc14eab9b0c111932ab047a","title":"004 Dragón Eléctrico"}],"recipe":"soma/creator/saved/wyvern.creator.json"}}};
return {
  name: "wyvern", max: 16,
  family: { faction: "animal", kind: "animal", hp: 44 },
  nav: { agent: { name: "wyvern", radius: 0.41, height: 1.19, step: 0.22, slope: 35, drop: 0.33 } },
  body: {
    skeleton: skeleton,
    rig: rig,
    legs: legs,
    body: body,
    roles: roles,
    traits: traits,
    physics: physics,
    sdf: sdf,
    flight: flight,
    wings: wings,
    material: material,
    creator: creator
  },
  abilities: ["fly", "effects"],
  interaction: { uses: [] },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 44 }],
      ["fly", { alt: 10, cruise: 5.1, climb: 2.1, sink: 1.5, legs: 3, min_leg: 15, roam: 60, near: 3.1, rest_min: 8, rest_max: 20 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "wyvern", select: [ld.node("fly")] };
      return { tree: tree };
    }
  }
};
