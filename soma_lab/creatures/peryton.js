// peryton: in soma's one form of a creature file (soma/creature_file.js): `body` is the creature as it was made, the rest is who it is to the others (family, nav, abilities) and its mind: the blocks of soma/world/blocks/ it loads by name and
// its tree. The old worker of this file is left out; the mind below is the default of a creature of its kind (animal): write the creature's own in `mind`.
// peryton: a creature MADE OF THE PARTS CATALOGUE'S PIECES (mixed, peryton): built by soma/tools/piece_creatures.js from its recipe soma/creator/saved/peryton.creator.json (the recipe is the source of truth:
// `node soma/tools/piece_creatures.js regenerate peryton` makes this file again after a piece of the catalogue is built again). The creator studio opens it for modification: /soma/soma_creator_studio_demo.jh?creator=/soma/creatures/peryton.js
// CREDITS: the pieces were cut out of these models of the rigged corpus (D:\work\glb_skinned_meshes: the corpus keeps no author or licence fields; title and uid as the corpus has them):
//   "Doe" (uid a7b3fc46df064233931861399d106e20, uncategorized/a7b3fc46df064233931861399d106e20_Doe.glb): doe_torso, doe_leg_fl, doe_leg_hl, doe_neck, doe_head
//   "Deer walk cycle Animated" (uid 301b37056bdf44709c9c3966bdf26bf8, mammals_wild/301b37056bdf44709c9c3966bdf26bf8_Deer_walk_cycle_Animated.glb): deer_walk_cycle_horn
//   "KEKOS Horses   Pegasus [Single Character]" (uid 552165a3f7e0441ba78f84e00b919ee7, mammals_domestic/552165a3f7e0441ba78f84e00b919ee7_KEKOS_Horses___Pegasus_[Single_Character].glb): kekos_horses_pegasus_single_wing_l
"use strict";
// peryton: a peryton, the winged deer: the doe's torso, legs, neck and head, a deer's antlers and a pegasus model's feathered wings. Made by the creature creator (soma/creator/creator.js, SOMA.md "The creator") from the `creator` object at the end of this file:
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
  {"name":"neck_1","parent":"torso_spine_3","head":[0,0.88153,0.55004],"tail":[0.00006,0.99,0.63274]},
  {"name":"neck_2","parent":"neck_1","head":[0.00006,0.99,0.63274],"tail":[0.00014,1.15142,0.69787]},
  {"name":"head_head","parent":"neck_2","head":[0.00014,1.15142,0.69787],"tail":[0.06834,1.25435,0.70534]},
  {"name":"head_eye_l","parent":"head_head","head":[0.05066,1.19273,0.82587],"tail":[0.05066,1.19373,0.82587]},
  {"name":"head_ear_l","parent":"head_head","head":[0.06834,1.25435,0.70534],"tail":[0.14046,1.31475,0.72191]},
  {"name":"head_ear_2_l","parent":"head_ear_l","head":[0.14046,1.31475,0.72191],"tail":[0.14046,1.31575,0.72191]},
  {"name":"head_lid_l","parent":"head_head","head":[0.05997,1.19263,0.83177],"tail":[0.05997,1.19363,0.83177]},
  {"name":"head_head_2","parent":"head_head","head":[0,1.10343,0.75183],"tail":[-0.00761,1.0702,0.90802]},
  {"name":"head_head_3","parent":"head_head_2","head":[-0.00761,1.0702,0.90802],"tail":[-0.00761,1.0712,0.90802]},
  {"name":"head_eye_r","parent":"head_head","head":[-0.05066,1.19273,0.82587],"tail":[-0.05066,1.19373,0.82587]},
  {"name":"head_ear_r","parent":"head_head","head":[-0.06833,1.25435,0.70534],"tail":[-0.14046,1.31475,0.72191]},
  {"name":"head_ear_2_r","parent":"head_ear_r","head":[-0.14046,1.31475,0.72191],"tail":[-0.14046,1.31575,0.72191]},
  {"name":"head_lid_r","parent":"head_head","head":[-0.05794,1.19799,0.83494],"tail":[-0.05794,1.19899,0.83494]},
  {"name":"antlers_1","parent":"head_head","head":[0.02742,1.0702,0.6846],"tail":[0.02742,1.07102,0.6846]},
  {"name":"wing_upper_l","parent":"torso_spine_2","head":[0.0418,0.95757,0.32419],"tail":[0.18104,0.97313,0.35788],"mirror":"x"},
  {"name":"wing_fore_l","parent":"wing_upper_l","head":[0.21172,0.95757,0.37011],"tail":[0.30481,0.95568,0.54155],"mirror":"x"},
  {"name":"wing_fore_b1_l","parent":"wing_fore_l","head":[0.21405,0.94999,0.40255],"tail":[0.21405,0.95083,0.40255],"mirror":"x"},
  {"name":"wing_hand_l","parent":"wing_fore_l","head":[0.31472,0.95757,0.57086],"tail":[0.34375,0.95708,0.57561],"mirror":"x"},
  {"name":"wing_hand_b1_l","parent":"wing_hand_l","head":[0.40166,0.93887,0.56222],"tail":[0.40166,0.93971,0.56222],"mirror":"x"},
  {"name":"wing_hand_b2_l","parent":"wing_hand_l","head":[0.31755,0.93448,0.55782],"tail":[0.31755,0.93532,0.55782],"mirror":"x"},
  {"name":"wing_hand_b3_l","parent":"wing_hand_l","head":[0.33632,0.9333,0.56425],"tail":[0.33632,0.93414,0.56425],"mirror":"x"},
  {"name":"wing_hand_b4_l","parent":"wing_hand_l","head":[0.37099,0.93601,0.56475],"tail":[0.37099,0.93685,0.56475],"mirror":"x"},
  {"name":"wing_hand_b5_l","parent":"wing_hand_l","head":[0.40322,0.93662,0.5671],"tail":[0.40322,0.93747,0.5671],"mirror":"x"},
  {"name":"wing_hand_b6_l","parent":"wing_hand_l","head":[0.43904,0.93661,0.56456],"tail":[0.43904,0.93745,0.56456],"mirror":"x"},
  {"name":"wing_hand_b7_l","parent":"wing_hand_l","head":[0.38106,0.94219,0.55731],"tail":[0.38106,0.94303,0.55731],"mirror":"x"},
  {"name":"wing_hand_b8_l","parent":"wing_hand_l","head":[0.35961,0.94319,0.55774],"tail":[0.35961,0.94404,0.55774],"mirror":"x"},
  {"name":"wing_hand_b9_l","parent":"wing_hand_l","head":[0.33283,0.94319,0.56453],"tail":[0.33283,0.94404,0.56453],"mirror":"x"},
  {"name":"wing_hand_b10_l","parent":"wing_hand_l","head":[0.34375,0.95708,0.57561],"tail":[0.34375,0.95792,0.57561],"mirror":"x"},
  {"name":"wing_hand_b11_l","parent":"wing_hand_l","head":[0.38703,0.95575,0.58167],"tail":[0.38703,0.95659,0.58167],"mirror":"x"},
  {"name":"wing_hand_b12_l","parent":"wing_hand_l","head":[0.41762,0.95575,0.57902],"tail":[0.41762,0.95659,0.57902],"mirror":"x"},
  {"name":"wing_hand_b13_l","parent":"wing_hand_l","head":[0.44686,0.95575,0.5817],"tail":[0.44686,0.95659,0.5817],"mirror":"x"},
  {"name":"wing_finger_l","parent":"wing_hand_l","head":[0.45791,0.93954,0.58123],"tail":[0.45791,0.94038,0.58123],"mirror":"x"},
  {"name":"wing_hand_b14_l","parent":"wing_hand_l","head":[0.42201,0.93772,0.56789],"tail":[0.42201,0.93856,0.56789],"mirror":"x"},
  {"name":"wing_fore_b2_l","parent":"wing_fore_l","head":[0.20497,0.93401,0.39851],"tail":[0.20497,0.93486,0.39851],"mirror":"x"},
  {"name":"wing_fore_b3_l","parent":"wing_fore_l","head":[0.25528,0.93232,0.48625],"tail":[0.25528,0.93316,0.48625],"mirror":"x"},
  {"name":"wing_fore_b4_l","parent":"wing_fore_l","head":[0.30048,0.9411,0.53546],"tail":[0.30048,0.94194,0.53546],"mirror":"x"},
  {"name":"wing_fore_b5_l","parent":"wing_fore_l","head":[0.25901,0.9464,0.4711],"tail":[0.25901,0.94724,0.4711],"mirror":"x"},
  {"name":"wing_fore_b6_l","parent":"wing_fore_l","head":[0.27813,0.96023,0.51083],"tail":[0.27813,0.96107,0.51083],"mirror":"x"},
  {"name":"wing_fore_b7_l","parent":"wing_fore_l","head":[0.30481,0.95568,0.54155],"tail":[0.30481,0.95653,0.54155],"mirror":"x"},
  {"name":"wing_fore_b8_l","parent":"wing_fore_l","head":[0.22885,0.93135,0.44754],"tail":[0.22885,0.93219,0.44754],"mirror":"x"},
  {"name":"wing_fore_b9_l","parent":"wing_fore_l","head":[0.24312,0.96496,0.45763],"tail":[0.24312,0.96581,0.45763],"mirror":"x"},
  {"name":"wing_fore_b10_l","parent":"wing_fore_l","head":[0.21269,0.97017,0.4125],"tail":[0.21269,0.97101,0.4125],"mirror":"x"},
  {"name":"wing_fore_b11_l","parent":"wing_fore_l","head":[0.31525,0.9436,0.56203],"tail":[0.31525,0.94444,0.56203],"mirror":"x"},
  {"name":"wing_upper_b1_l","parent":"wing_upper_l","head":[0.17012,0.93448,0.35211],"tail":[0.17012,0.93532,0.35211],"mirror":"x"},
  {"name":"wing_upper_b2_l","parent":"wing_upper_l","head":[0.05485,0.95517,0.29664],"tail":[0.05485,0.95601,0.29664],"mirror":"x"},
  {"name":"wing_upper_b3_l","parent":"wing_upper_l","head":[0.08887,0.95421,0.29761],"tail":[0.08887,0.95505,0.29761],"mirror":"x"},
  {"name":"wing_upper_b4_l","parent":"wing_upper_l","head":[0.13303,0.95333,0.31661],"tail":[0.13303,0.95418,0.31661],"mirror":"x"},
  {"name":"wing_upper_b5_l","parent":"wing_upper_l","head":[0.17155,0.95103,0.36677],"tail":[0.17155,0.95188,0.36677],"mirror":"x"},
  {"name":"wing_upper_b6_l","parent":"wing_upper_l","head":[0.11282,0.97032,0.29723],"tail":[0.11282,0.97116,0.29723],"mirror":"x"},
  {"name":"wing_upper_b7_l","parent":"wing_upper_l","head":[0.15585,0.97321,0.32145],"tail":[0.15585,0.97405,0.32145],"mirror":"x"},
  {"name":"wing_upper_b8_l","parent":"wing_upper_l","head":[0.18104,0.97313,0.35788],"tail":[0.18104,0.97398,0.35788],"mirror":"x"},
  {"name":"wing_upper_b9_l","parent":"wing_upper_l","head":[0.14059,0.93882,0.33321],"tail":[0.14059,0.93966,0.33321],"mirror":"x"},
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
    {"bone":"neck_1","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
    {"bone":"neck_2","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
    {"bone":"head_head_2","kind":"hinge","axis":[0.999,0,0.049],"range":[-5,35]},
  ],
  chains: [
    {"name":"fore_l","bones":["fore_thigh_l","fore_shin_l","fore_cannon_l"],"solver":"z_leg","tip":"fore_foot_l","pole":[0.647,0.011,-0.763],"pole_w":1,"mirror":"x"},
    {"name":"hind_l","bones":["hind_thigh_l","hind_shin_l","hind_cannon_l"],"solver":"z_leg","tip":"hind_foot_l","pole":[0.272,-0.228,0.935],"pole_w":1,"mirror":"x"},
    {"name":"neck","bones":["neck_1","neck_2"]},
  ],
};
const legs = {"legs":[{"chain":"hind_l","mirror":"x","foot_height":0.09907},{"chain":"fore_l","mirror":"x","foot_height":0.10447}],"gait":{"from":"doe_walk","ride":0.84302}};
const body = {"gravity":9.8,"turn_rate":3.03,"max_speed":2.21};
const roles = {"hips":"root","spine":["torso_pelvis_b1"],"neck":["neck_1","neck_2"],"head":"head_head","eyes":["head_eye_l","head_eye_r"],"lids":["head_lid_l","head_lid_r"],"ears":[["head_ear_l","head_ear_2_l"],["head_ear_r","head_ear_2_r"]],"jaw":"head_head_2"};
const traits = {"ears":1.6,"tail":1.6,"fidget":1.4,"idle":1.2};
const physics = {"mass":108.186,"shapes":[{"id":"body","shape":"capsule","a":[-0.00011,0.80825,-0.27829],"b":[-0.00011,0.80825,0.4617],"radius":0.167,"bone":"root"},{"id":"head","shape":"sphere","center":[0.00017,1.23794,0.79305],"radius":0.227,"bone":"head_head"},{"id":"fore_l","shape":"capsule","a":[0.11619,0.70153,0.39944],"b":[0.13342,0.07977,0.40473],"radius":0.046,"mirror":"x"},{"id":"hind_l","shape":"capsule","a":[0.11362,0.7903,-0.21005],"b":[0.13252,0.10058,-0.40473],"radius":0.06,"mirror":"x"}]};
const parts = [
  {"id":"torso_0","shape":"volume","volume":"doe_torso","origin":[0,0.87535,-0.21232],"rotate":[0,0,0],"scale":1,"bone":"root","bone_map":{"@host":"root","torso_pelvis":"root","torso_spine_1":"torso_spine_1","torso_spine_2":"torso_spine_2","torso_spine_3":"torso_spine_3","torso_clavicle_l":"torso_clavicle_l","torso_clavicle_r":"torso_clavicle_r","torso_pelvis_b1":"torso_pelvis_b1","torso_pelvis_b1_b1":"torso_pelvis_b1_b1","@neck":"neck_1","@leg_f_l":"fore_thigh_l","@leg_f_r":"fore_thigh_r","@leg_h_l":"hind_thigh_l","@leg_h_r":"hind_thigh_r"}},
  {"id":"fore_thigh_0","shape":"volume","volume":"doe_leg_fl","origin":[0.11619,0.76801,0.39944],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"torso_clavicle_l","bone_map":{"@host":"torso_clavicle_l","leg_thigh_l":"fore_thigh_l","leg_shin_l":"fore_shin_l","leg_cannon_l":"fore_cannon_l","leg_foot_l":"fore_foot_l","leg_toe_l":"fore_toe_l","neck_01_06":"neck_1"},"blend":0.02321,"blend_mode":"cubic"},
  {"id":"hind_thigh_0","shape":"volume","volume":"doe_leg_hl","origin":[0.11362,0.87412,-0.21005],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"root","bone_map":{"@host":"root","leg_thigh_l":"hind_thigh_l","leg_shin_l":"hind_shin_l","leg_cannon_l":"hind_cannon_l","leg_foot_l":"hind_foot_l","leg_toe_l":"hind_toe_l","spine_01_03":"torso_spine_1","thigh_R_037":"hind_thigh_r","spine_02_04":"torso_spine_2"},"blend":0.03023,"blend_mode":"cubic"},
  {"id":"neck_1_0","shape":"volume","volume":"doe_neck","origin":[0,0.88153,0.55004],"rotate":[0,0,0],"scale":1,"bone":"torso_spine_3","bone_map":{"@host":"torso_spine_3","neck_1":"neck_1","neck_2":"neck_2","@head":"head_head","clavicle_L_018":"torso_clavicle_l","clavicle_R_024":"torso_clavicle_r","upperArm_L_019":"fore_thigh_l","upperArm_R_025":"fore_thigh_r"},"blend":0.02738,"blend_mode":"cubic"},
  {"id":"head_head_0","shape":"volume","volume":"doe_head","origin":[0.00014,1.15142,0.69787],"rotate":[0,0,0],"scale":1,"bone":"neck_2","bone_map":{"@host":"neck_2","head_head":"head_head","head_eye_l":"head_eye_l","head_ear_l":"head_ear_l","head_ear_2_l":"head_ear_2_l","head_lid_l":"head_lid_l","head_head_2":"head_head_2","head_head_3":"head_head_3","head_eye_r":"head_eye_r","head_ear_r":"head_ear_r","head_ear_2_r":"head_ear_2_r","head_lid_r":"head_lid_r"},"blend":0.04424,"blend_mode":"cubic"},
  {"id":"wing_upper_0","shape":"volume","volume":"kekos_horses_pegasus_single_wing_l","origin":[0.0418,0.95757,0.32419],"rotate":[0,0,0],"scale":0.84222,"mirror":"x","bone":"torso_spine_2","bone_map":{"@host":"torso_spine_2","wing_upper_l":"wing_upper_l","wing_fore_l":"wing_fore_l","wing_fore_b1_l":"wing_fore_b1_l","wing_hand_l":"wing_hand_l","wing_hand_b1_l":"wing_hand_b1_l","wing_hand_b2_l":"wing_hand_b2_l","wing_hand_b3_l":"wing_hand_b3_l","wing_hand_b4_l":"wing_hand_b4_l","wing_hand_b5_l":"wing_hand_b5_l","wing_hand_b6_l":"wing_hand_b6_l","wing_hand_b7_l":"wing_hand_b7_l","wing_hand_b8_l":"wing_hand_b8_l","wing_hand_b9_l":"wing_hand_b9_l","wing_hand_b10_l":"wing_hand_b10_l","wing_hand_b11_l":"wing_hand_b11_l","wing_hand_b12_l":"wing_hand_b12_l","wing_hand_b13_l":"wing_hand_b13_l","wing_finger_l":"wing_finger_l","wing_hand_b14_l":"wing_hand_b14_l","wing_fore_b2_l":"wing_fore_b2_l","wing_fore_b3_l":"wing_fore_b3_l","wing_fore_b4_l":"wing_fore_b4_l","wing_fore_b5_l":"wing_fore_b5_l","wing_fore_b6_l":"wing_fore_b6_l","wing_fore_b7_l":"wing_fore_b7_l","wing_fore_b8_l":"wing_fore_b8_l","wing_fore_b9_l":"wing_fore_b9_l","wing_fore_b10_l":"wing_fore_b10_l","wing_fore_b11_l":"wing_fore_b11_l","wing_upper_b1_l":"wing_upper_b1_l","wing_upper_b2_l":"wing_upper_b2_l","wing_upper_b3_l":"wing_upper_b3_l","wing_upper_b4_l":"wing_upper_b4_l","wing_upper_b5_l":"wing_upper_b5_l","wing_upper_b6_l":"wing_upper_b6_l","wing_upper_b7_l":"wing_upper_b7_l","wing_upper_b8_l":"wing_upper_b8_l","wing_upper_b9_l":"wing_upper_b9_l"},"blend":0.01505,"blend_mode":"cubic","roughness":0.515,"metal":0},
];
const sdf = Object.assign({"cell":0.01583,"decimate":{"ratio":0.4},"skin":{"falloff":1.5,"seam":1},"shade":{"ao":0.45,"ao_radius":0.04749,"tone":0.2,"color_blend":1},"volumes":{"doe_torso":{"hash":"01df643e","piece":"/soma/parts/catalog/torso/doe_torso.somapart","bake":{"cell":0.0093,"band":6}},"doe_leg_fl":{"hash":"9278e897","piece":"/soma/parts/catalog/leg/doe_leg_fl.somapart","bake":{"cell":0.0093,"band":6}},"doe_leg_hl":{"hash":"c49f403a","piece":"/soma/parts/catalog/leg/doe_leg_hl.somapart","bake":{"cell":0.0093,"band":6}},"doe_neck":{"hash":"d0b008bb","piece":"/soma/parts/catalog/neck/doe_neck.somapart","bake":{"cell":0.0093,"band":6}},"doe_head":{"hash":"2f2c9b36","piece":"/soma/parts/catalog/head/doe_head.somapart","bake":{"cell":0.0093,"band":6}},"deer_walk_cycle_horn":{"hash":"c190e637","piece":"/soma/parts/catalog/horn/deer_walk_cycle_horn.somapart"},"kekos_horses_pegasus_single_wing_l":{"hash":"90cccdc6","piece":"/soma/parts/catalog/wing/kekos_horses_pegasus_single_wing_l.somapart","bake":{"cell":0.011,"band":6}}},"meshes":[{"id":"antlers_1_0","volume":"deer_walk_cycle_horn","origin":[0.02742,1.0702,0.6846],"rotate":[0,0,0],"scale":0.81869,"bone":"head_head","bone_map":{"@host":"head_head","horn_1":"antlers_1"},"roughness":0.6,"metal":0}]}, { parts: parts });
const material = {"roughness":0.72,"metal":0};
const creator = {"format":"soma.creator","version":1,"name":"peryton","description":"a peryton, the winged deer: the doe's torso, legs, neck and head, a deer's antlers and a pegasus model's feathered wings","torso":{"shape":"piece","size":[0.36227,0.4358,1.07328],"axis":"z","round":0,"color":[0.434,0.216,0.125],"piece":"doe_torso","scale":1},"parts":[{"id":"fore","preset":"piece","params":{"piece":"doe_leg_fl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_clavicle_l","t":1,"dir":[-0.177552,0.984064,0.009653],"socket":"leg_f_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"hind","preset":"piece","params":{"piece":"doe_leg_hl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"root","t":0,"dir":[0.99996,-0.000766,-0.008957],"socket":"leg_h_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"neck","preset":"piece","params":{"piece":"doe_neck","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_3","t":1,"dir":[0.002222,0.89399,-0.448081],"socket":"neck"},"mirror":false,"color":null,"colors":{},"ik":{"on":true},"roles":{}},{"id":"head","preset":"piece","params":{"piece":"doe_head","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"neck_2","t":1,"dir":[0.551849,0.794515,-0.253395],"socket":"neck.head"},"mirror":false,"color":null,"colors":{},"ik":{"on":false},"roles":{}},{"id":"antlers","preset":"piece","params":{"piece":"deer_walk_cycle_horn","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"head_head","t":0.4,"dir":[-0.530261,0.804094,-0.268806]},"mirror":false,"color":null,"colors":{},"ik":{"on":false},"roles":{}},{"id":"wing","preset":"piece","params":{"piece":"kekos_horses_pegasus_single_wing_l","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_2","t":0.8,"dir":[0.451143,0.001739,-0.89245]},"mirror":"x","color":null,"colors":{},"ik":{"on":false},"roles":{}}],"pieces":{"doe_torso":{"hash":"01df643e","file":"/soma/parts/catalog/torso/doe_torso.somapart"},"doe_leg_fl":{"hash":"9278e897","file":"/soma/parts/catalog/leg/doe_leg_fl.somapart"},"doe_leg_hl":{"hash":"c49f403a","file":"/soma/parts/catalog/leg/doe_leg_hl.somapart"},"doe_neck":{"hash":"d0b008bb","file":"/soma/parts/catalog/neck/doe_neck.somapart"},"doe_head":{"hash":"2f2c9b36","file":"/soma/parts/catalog/head/doe_head.somapart"},"deer_walk_cycle_horn":{"hash":"c190e637","file":"/soma/parts/catalog/horn/deer_walk_cycle_horn.somapart"},"kekos_horses_pegasus_single_wing_l":{"hash":"90cccdc6","file":"/soma/parts/catalog/wing/kekos_horses_pegasus_single_wing_l.somapart"}},"roles":{},"soft":{},"material":{},"settings":{"gait":"auto","pattern":"auto","slack":0.05,"center":true,"face_roles":true,"soft_roles":true,"body":{"turn_rate":3.03,"max_speed":2.21},"physics":"auto","traits":{"ears":1.6,"tail":1.6,"fidget":1.4,"idle":1.2},"flight":"auto","wave":"auto","sdf":{},"vehicle":"auto","aircraft":"auto","rotors":"auto"},"ui":{"library":{"built_from":"pieces","kind":"mixed","species":"peryton","sources":[{"uid":"a7b3fc46df064233931861399d106e20","title":"Doe"},{"uid":"301b37056bdf44709c9c3966bdf26bf8","title":"Deer walk cycle Animated"},{"uid":"552165a3f7e0441ba78f84e00b919ee7","title":"KEKOS Horses   Pegasus [Single Character]"}],"recipe":"soma/creator/saved/peryton.creator.json"}}};
return {
  name: "peryton", max: 16,
  family: { faction: "animal", kind: "animal", hp: 44 },
  nav: { agent: { name: "peryton", radius: 0.46, height: 1.42, step: 0.26, slope: 35, drop: 0.39 } },
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
      ["health", { hp: 44 }],
      ["flee", { speed: 2.65, distance: 11 }],
      ["curious", { approach: 0.3, cooldown: 20, near: 1.2 }],
      ["idle_life", {}],
      ["injured", { clip_flinch: "" }],
      ["wander", { speed: 0.99, near: 0.5 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "peryton", select: [ld.node("flee"), ld.node("curious"), ld.node("idle_life"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
