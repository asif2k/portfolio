// pegasus: in soma's one form of a creature file (soma/creature_file.js): `body` is the creature as it was made, the rest is who it is to the others (family, nav, abilities) and its mind: the blocks of soma/world/blocks/ it loads by name and
// its tree. The old worker of this file is left out; the mind below is the default of a creature of its kind (flyer): write the creature's own in `mind`.
// pegasus: a creature MADE OF THE PARTS CATALOGUE'S PIECES (mixed, pegasus): built by soma/tools/piece_creatures.js from its recipe soma/creator/saved/pegasus.creator.json (the recipe is the source of truth:
// `node soma/tools/piece_creatures.js regenerate pegasus` makes this file again after a piece of the catalogue is built again). The creator studio opens it for modification: /soma/soma_creator_studio_demo.jh?creator=/soma/creatures/pegasus.js
// CREDITS: the pieces were cut out of these models of the rigged corpus (D:\work\glb_skinned_meshes: the corpus keeps no author or licence fields; title and uid as the corpus has them):
//   "Horse(Stallion)   Game Ready" (uid ed65f00c8b514e1dbc58fc431e0c2e1f, mammals_domestic/ed65f00c8b514e1dbc58fc431e0c2e1f_Horse(Stallion)___Game_Ready_.glb): horse_stallion_game_ready_torso, horse_stallion_game_ready_leg_fl, horse_stallion_game_ready_leg_hl, horse_stallion_game_ready_neck, horse_stallion_game_ready_head
//   "Toon Bird" (uid be17d104bbe545868ad1da72d75d7b73, birds/be17d104bbe545868ad1da72d75d7b73_Toon_Bird.glb): toon_bird_wing_l
"use strict";
// pegasus: a pegasus: the stallion's torso, legs, neck and head with a cartoon bird's spread wings on its withers (the pegasus model's own wings carry 38 bones each: with the horse's 65 they are over the mesher's 127). Made by the creature creator (soma/creator/creator.js, SOMA.md "The creator") from the `creator` object at the end of this file:
// the studio opens it again from that object (creator.from_definition). ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature. Metres, +x to its left, +y up, +z forward.
const skeleton = [
  {"name":"root","parent":null,"head":[0.02599,1.34628,-0.30043],"tail":[0.01858,1.3483,0.03835]},
  {"name":"torso_spine_1","parent":"root","head":[0.01858,1.3483,0.03835],"tail":[0.01137,1.35028,0.36826]},
  {"name":"torso_spine_2","parent":"torso_spine_1","head":[0.01137,1.35028,0.36826],"tail":[0.00416,1.35226,0.69819]},
  {"name":"torso_spine_3","parent":"torso_spine_2","head":[0.00416,1.35226,0.69819],"tail":[0.17498,1.22658,0.85729]},
  {"name":"torso_clavicle_l","parent":"torso_spine_3","head":[0.17498,1.22658,0.85729],"tail":[0.12661,0.9772,0.71268]},
  {"name":"torso_clavicle_r","parent":"torso_spine_3","head":[-0.17695,1.23148,0.84956],"tail":[-0.12921,0.98076,0.70706]},
  {"name":"torso_spine_2_b1_l","parent":"torso_spine_2","head":[0.25765,1.34536,0.34259],"tail":[0.25765,1.34636,0.34259]},
  {"name":"torso_spine_2_b1_r","parent":"torso_spine_2","head":[-0.23359,1.3522,0.33181],"tail":[-0.23359,1.3532,0.33181]},
  {"name":"torso_spine_1_b1","parent":"torso_spine_1","head":[0.01647,1.09413,-0.02661],"tail":[0.01647,1.09513,-0.02661]},
  {"name":"fore_thigh_l","parent":"torso_clavicle_l","head":[0.12661,0.9772,0.71268],"tail":[0.10285,0.50714,0.68361],"mirror":"x"},
  {"name":"fore_shin_l","parent":"fore_thigh_l","head":[0.10285,0.50714,0.68361],"tail":[0.08627,0.15752,0.66367],"mirror":"x"},
  {"name":"fore_cannon_l","parent":"fore_shin_l","head":[0.08627,0.15752,0.66367],"tail":[0.08387,0.11851,0.68595],"mirror":"x"},
  {"name":"fore_foot_l","parent":"fore_cannon_l","head":[0.08387,0.11851,0.68595],"tail":[0.08267,0.0995,0.69711],"mirror":"x"},
  {"name":"fore_toe_l","parent":"fore_foot_l","head":[0.08267,0.0995,0.69711],"tail":[0.08148,0.00983,0.70825],"mirror":"x"},
  {"name":"hind_thigh_l","parent":"root","head":[0.19643,1.36006,-0.49667],"tail":[0.18573,0.96665,-0.47525],"mirror":"x"},
  {"name":"hind_shin_l","parent":"hind_thigh_l","head":[0.18573,0.96665,-0.47525],"tail":[0.16559,0.60721,-0.6497],"mirror":"x"},
  {"name":"hind_cannon_l","parent":"hind_shin_l","head":[0.16559,0.60721,-0.6497],"tail":[0.14831,0.16709,-0.68595],"mirror":"x"},
  {"name":"hind_foot_l","parent":"hind_cannon_l","head":[0.14831,0.16709,-0.68595],"tail":[0.11071,0.12733,-0.94123],"mirror":"x"},
  {"name":"hind_toe_l","parent":"hind_foot_l","head":[0.11071,0.12733,-0.94123],"tail":[0.14625,0.08495,-0.64446],"mirror":"x"},
  {"name":"hind_tip_l","parent":"hind_toe_l","head":[0.14625,0.08495,-0.64446],"tail":[0.14625,-0.0011,-0.64446],"mirror":"x"},
  {"name":"neck_1","parent":"torso_spine_3","head":[0.00416,1.35226,0.69819],"tail":[0.00327,1.55095,0.86588]},
  {"name":"neck_2","parent":"neck_1","head":[0.00327,1.55095,0.86588],"tail":[0.00238,1.74964,1.03356]},
  {"name":"neck_hair","parent":"neck_2","head":[0.03708,1.75038,0.69612],"tail":[0.08014,1.7155,0.70351]},
  {"name":"neck_hair_2","parent":"neck_hair","head":[0.08014,1.7155,0.70351],"tail":[0.12185,1.62268,0.71761]},
  {"name":"neck_hair_3","parent":"neck_hair_2","head":[0.12185,1.62268,0.71761],"tail":[0.12185,1.62368,0.71761]},
  {"name":"neck_3","parent":"neck_2","head":[0.00238,1.74964,1.03356],"tail":[-0.01059,1.9548,1.19442]},
  {"name":"neck_4","parent":"neck_3","head":[-0.01059,1.9548,1.19442],"tail":[-0.00037,1.98451,1.31444]},
  {"name":"neck_5","parent":"neck_4","head":[0.02526,2.06718,1.11825],"tail":[0.07505,2.04739,1.1342]},
  {"name":"neck_6","parent":"neck_5","head":[0.07505,2.04739,1.1342],"tail":[0.14091,1.97191,1.15704]},
  {"name":"neck_7","parent":"neck_6","head":[0.14091,1.97191,1.15704],"tail":[0.14091,1.97291,1.15704]},
  {"name":"neck_2_b1","parent":"neck_2","head":[0.00327,1.55095,0.86588],"tail":[0.00327,1.55195,0.86588]},
  {"name":"neck_2_b2","parent":"neck_2","head":[0.00327,1.55095,0.86588],"tail":[0.00327,1.55195,0.86588]},
  {"name":"head_head","parent":"neck_4","head":[-0.00037,1.98451,1.31444],"tail":[0.0786,1.94331,1.40242]},
  {"name":"head_eye_l","parent":"head_head","head":[0.0786,1.94331,1.40242],"tail":[0.0786,1.94431,1.40242]},
  {"name":"head_lid_l","parent":"head_head","head":[0.0786,1.9433,1.40241],"tail":[0.0786,1.9443,1.40241]},
  {"name":"head_lid_2_l","parent":"head_head","head":[0.0786,1.9433,1.40241],"tail":[0.0786,1.9443,1.40241]},
  {"name":"head_eye_r","parent":"head_head","head":[-0.08465,1.9456,1.39883],"tail":[-0.08465,1.9466,1.39883]},
  {"name":"head_lid_2_r","parent":"head_head","head":[-0.08465,1.9456,1.39883],"tail":[-0.08465,1.9466,1.39883]},
  {"name":"head_lid_r","parent":"head_head","head":[-0.08465,1.9456,1.39883],"tail":[-0.08465,1.9466,1.39883]},
  {"name":"head_ear_l","parent":"head_head","head":[0.06943,2.05117,1.28855],"tail":[0.0862,2.11527,1.31626]},
  {"name":"head_ear_2_l","parent":"head_ear_l","head":[0.0862,2.11527,1.31626],"tail":[0.0862,2.11627,1.31626]},
  {"name":"head_ear_r","parent":"head_head","head":[-0.06747,2.0531,1.28553],"tail":[-0.08363,2.11764,1.31252]},
  {"name":"head_ear_2_r","parent":"head_ear_r","head":[-0.08363,2.11764,1.31252],"tail":[-0.08363,2.11864,1.31252]},
  {"name":"head_head_2","parent":"head_head","head":[0.00001,1.92463,1.29406],"tail":[-0.01061,1.6096,1.57226]},
  {"name":"head_head_3","parent":"head_head_2","head":[-0.01061,1.6096,1.57226],"tail":[-0.01061,1.6106,1.57226]},
  {"name":"head_head_b1","parent":"head_head","head":[-0.0099,1.70286,1.58097],"tail":[-0.01066,1.65379,1.60229]},
  {"name":"head_mouth","parent":"head_head_b1","head":[-0.01066,1.65379,1.60229],"tail":[-0.01066,1.65479,1.60229]},
  {"name":"head_nose_l","parent":"head_head_b1","head":[0.0224,1.69895,1.64627],"tail":[0.0224,1.69995,1.64627]},
  {"name":"head_nose_r","parent":"head_head_b1","head":[-0.04608,1.69991,1.64477],"tail":[-0.04608,1.70091,1.64477]},
  {"name":"head_hair_l","parent":"head_head","head":[0.02732,2.07756,1.3466],"tail":[0.09143,2.0017,1.36066]},
  {"name":"head_hair","parent":"head_hair_l","head":[0.09143,2.0017,1.36066],"tail":[0.09143,2.0027,1.36066]},
  {"name":"head_hair_2","parent":"head_hair_l","head":[0.05977,1.98425,1.42621],"tail":[0.05977,1.98525,1.42621]},
  {"name":"head_hair_r","parent":"head_head","head":[-0.01712,2.07801,1.32476],"tail":[-0.08476,2.0143,1.3517]},
  {"name":"head_hair_3","parent":"head_hair_r","head":[-0.08476,2.0143,1.3517],"tail":[-0.08476,2.0153,1.3517]},
  {"name":"wing_upper_l","parent":"torso_spine_2","head":[0.06849,1.53347,0.62961],"tail":[0.24129,1.72516,0.54825],"mirror":"x"},
  {"name":"wing_fore_l","parent":"wing_upper_l","head":[0.24129,1.72516,0.54825],"tail":[0.50839,1.92586,0.46583],"mirror":"x"},
  {"name":"wing_hand_l","parent":"wing_fore_l","head":[0.50839,1.92586,0.46583],"tail":[0.99639,2.02194,0.31892],"mirror":"x"},
  {"name":"wing_finger_l","parent":"wing_hand_l","head":[0.99639,2.02194,0.31892],"tail":[0.99639,2.03382,0.31892],"mirror":"x"},
];
const rig = {
  joints: [
    {"bone":"fore_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"fore_shin_l","kind":"hinge","axis":[-0.999,0.046,0.025],"range":[-6,140],"mirror":"x"},
    {"bone":"fore_cannon_l","kind":"hinge","axis":[-0.999,0.049,-0.022],"range":[-39,82],"mirror":"x"},
    {"bone":"fore_foot_l","kind":"ball","fwd":30,"back":30,"lat":15,"twist":15,"mirror":"x"},
    {"bone":"hind_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"hind_shin_l","kind":"hinge","axis":[0.998,-0.03,-0.053],"range":[-35,111],"mirror":"x"},
    {"bone":"hind_cannon_l","kind":"hinge","axis":[-0.998,0.036,0.042],"range":[-27,94],"mirror":"x"},
    {"bone":"hind_foot_l","kind":"ball","fwd":30,"back":30,"lat":15,"twist":15,"mirror":"x"},
    {"bone":"neck_1","kind":"ball","fwd":38,"back":38,"lat":38,"twist":20},
    {"bone":"neck_2","kind":"ball","fwd":38,"back":38,"lat":38,"twist":20},
    {"bone":"neck_3","kind":"ball","fwd":38,"back":38,"lat":38,"twist":20},
    {"bone":"neck_4","kind":"ball","fwd":38,"back":38,"lat":38,"twist":20},
    {"bone":"head_head_2","kind":"hinge","axis":[0.999,0,0.038],"range":[-5,35]},
  ],
  chains: [
    {"name":"fore_l","bones":["fore_thigh_l","fore_shin_l","fore_cannon_l"],"solver":"z_leg","tip":"fore_foot_l","pole":[-0.024,0.032,-0.999],"pole_w":1,"mirror":"x"},
    {"name":"hind_l","bones":["hind_thigh_l","hind_shin_l","hind_cannon_l"],"solver":"z_leg","tip":"hind_foot_l","pole":[0.056,-0.159,0.986],"pole_w":1,"mirror":"x"},
    {"name":"neck","bones":["neck_1","neck_2","neck_3","neck_4"]},
  ],
};
const legs = {"legs":[{"chain":"hind_l","mirror":"x","foot_height":0.16709},{"chain":"fore_l","mirror":"x","foot_height":0.10805}],"gait":{"from":"pegasus_walk","ride":1.29936}};
const body = {"gravity":9.8,"turn_rate":2.48,"max_speed":3.57};
const roles = {"hips":"root","spine":["torso_spine_1","torso_spine_2","torso_spine_3","torso_clavicle_l"],"neck":["neck_1","neck_2","neck_3","neck_4","neck_5","neck_6"],"head":"head_head","eyes":["head_eye_l","head_eye_r"],"lids":["head_lid_l","head_lid_2_l","head_lid_2_r","head_lid_r"],"ears":[["head_ear_l","head_ear_2_l"],["head_ear_r","head_ear_2_r"]],"nose":"head_nose_r","jaw":"head_head_2","mouth":{"corners":["head_head_3","head_mouth"]}};
const traits = {"ears":1.6,"tail":1.6,"fidget":1.4,"idle":1.2};
const physics = {"mass":522.405,"shapes":[{"id":"body","shape":"capsule","a":[0.00394,1.33726,-0.31316],"b":[0.00394,1.33726,0.65359],"radius":0.33,"bone":"root"},{"id":"head","shape":"sphere","center":[0.00091,1.87944,1.38392],"radius":0.296,"bone":"head_head"},{"id":"fore_l","shape":"capsule","a":[0.12661,0.89049,0.71268],"b":[0.08387,0.10406,0.68595],"radius":0.04,"mirror":"x"},{"id":"hind_l","shape":"capsule","a":[0.19643,1.23645,-0.49667],"b":[0.14831,0.14834,-0.68595],"radius":0.086,"mirror":"x"}]};
const parts = [
  {"id":"torso_0","shape":"volume","volume":"horse_stallion_game_ready_torso","origin":[0.02599,1.34628,-0.30043],"rotate":[0,0,0],"scale":1,"bone":"root","bone_map":{"@host":"root","torso_pelvis":"root","torso_spine_1":"torso_spine_1","torso_spine_2":"torso_spine_2","torso_spine_3":"torso_spine_3","torso_clavicle_l":"torso_clavicle_l","torso_clavicle_r":"torso_clavicle_r","torso_spine_2_b1_l":"torso_spine_2_b1_l","torso_spine_2_b1_r":"torso_spine_2_b1_r","torso_spine_1_b1":"torso_spine_1_b1","@neck":"neck_1","@leg_f_l":"fore_thigh_l","@leg_f_r":"fore_thigh_r","@leg_h_l":"hind_thigh_l","@leg_h_r":"hind_thigh_r","@tail":"root"}},
  {"id":"fore_thigh_0","shape":"volume","volume":"horse_stallion_game_ready_leg_fl","origin":[0.12661,0.9772,0.71268],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"torso_clavicle_l","bone_map":{"@host":"torso_clavicle_l","leg_thigh_l":"fore_thigh_l","leg_shin_l":"fore_shin_l","leg_cannon_l":"fore_cannon_l","leg_foot_l":"fore_foot_l","leg_toe_l":"fore_toe_l","BN_Neck_00_06":"neck_1","BN_R_Clavicle_043":"torso_clavicle_r","BN_R_UpperArm_044":"fore_thigh_r"},"blend":0.02005,"blend_mode":"cubic"},
  {"id":"hind_thigh_0","shape":"volume","volume":"horse_stallion_game_ready_leg_hl","origin":[0.19643,1.36006,-0.49667],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"root","bone_map":{"@host":"root","leg_thigh_l":"hind_thigh_l","leg_shin_l":"hind_shin_l","leg_cannon_l":"hind_cannon_l","leg_foot_l":"hind_foot_l","leg_toe_l":"hind_toe_l","leg_tip_l":"hind_tip_l","BN_R_Thing_056":"hind_thigh_r"},"blend":0.04296,"blend_mode":"cubic"},
  {"id":"neck_1_0","shape":"volume","volume":"horse_stallion_game_ready_neck","origin":[0.00416,1.35226,0.69819],"rotate":[0,0,0],"scale":1,"bone":"torso_spine_3","bone_map":{"@host":"torso_spine_3","neck_1":"neck_1","neck_2":"neck_2","neck_hair":"neck_hair","neck_hair_2":"neck_hair_2","neck_hair_3":"neck_hair_3","neck_3":"neck_3","neck_4":"neck_4","neck_5":"neck_5","neck_6":"neck_6","neck_7":"neck_7","neck_2_b1":"neck_2_b1","neck_2_b2":"neck_2_b2","@bn_head":"head_head","BN_L_Clavicle_038":"torso_clavicle_l","BN_R_Clavicle_043":"torso_clavicle_r","BN_L_UpperArm_039":"fore_thigh_l"},"blend":0.07937,"blend_mode":"cubic"},
  {"id":"head_head_0","shape":"volume","volume":"horse_stallion_game_ready_head","origin":[-0.00037,1.98451,1.31444],"rotate":[0,0,0],"scale":1,"bone":"neck_4","bone_map":{"@host":"neck_4","head_head":"head_head","head_eye_l":"head_eye_l","head_lid_l":"head_lid_l","head_lid_2_l":"head_lid_2_l","head_eye_r":"head_eye_r","head_lid_2_r":"head_lid_2_r","head_lid_r":"head_lid_r","head_ear_l":"head_ear_l","head_ear_2_l":"head_ear_2_l","head_ear_r":"head_ear_r","head_ear_2_r":"head_ear_2_r","head_head_2":"head_head_2","head_head_3":"head_head_3","head_head_b1":"head_head_b1","head_mouth":"head_mouth","head_nose_l":"head_nose_l","head_nose_r":"head_nose_r","head_hair_l":"head_hair_l","head_hair":"head_hair","head_hair_2":"head_hair_2","head_hair_r":"head_hair_r","head_hair_3":"head_hair_3","BN_Neck_01_07_0":"neck_2_b1","BN_Hair_03_013":"neck_5","BN_Hair_04_014":"neck_6","BN_Hair_05_015":"neck_7"},"blend":0.04048,"blend_mode":"cubic"},
  {"id":"wing_upper_0","shape":"volume","volume":"toon_bird_wing_l","origin":[0.06849,1.53347,0.62961],"rotate":[0,0,0],"scale":11.87629,"mirror":"x","bone":"torso_spine_2","bone_map":{"@host":"torso_spine_2","wing_upper_l":"wing_upper_l","wing_fore_l":"wing_fore_l","wing_hand_l":"wing_hand_l","wing_finger_l":"wing_finger_l"},"blend":0.03789,"blend_mode":"cubic","roughness":0.7,"metal":0},
];
const sdf = Object.assign({"cell":0.02392,"decimate":{"ratio":0.4},"skin":{"falloff":1.5,"seam":1},"shade":{"ao":0.45,"ao_radius":0.07176,"tone":0.2,"color_blend":1},"volumes":{"horse_stallion_game_ready_torso":{"hash":"8710d395","piece":"/soma/parts/catalog/torso/horse_stallion_game_ready_torso.somapart","bake":{"cell":0.0156,"band":7}},"horse_stallion_game_ready_leg_fl":{"hash":"27f52720","piece":"/soma/parts/catalog/leg/horse_stallion_game_ready_leg_fl.somapart","bake":{"cell":0.0156,"band":6}},"horse_stallion_game_ready_leg_hl":{"hash":"f4e038f8","piece":"/soma/parts/catalog/leg/horse_stallion_game_ready_leg_hl.somapart","bake":{"cell":0.0156,"band":6}},"horse_stallion_game_ready_neck":{"hash":"2f9dc0d7","piece":"/soma/parts/catalog/neck/horse_stallion_game_ready_neck.somapart","bake":{"cell":0.0156,"band":7}},"horse_stallion_game_ready_head":{"hash":"2d296163","piece":"/soma/parts/catalog/head/horse_stallion_game_ready_head.somapart","bake":{"cell":0.0156,"band":7}},"toon_bird_wing_l":{"hash":"1cbd383c","piece":"/soma/parts/catalog/wing/toon_bird_wing_l.somapart","bake":{"cell":0.0015,"band":6}}}}, { parts: parts });
const flight = {"model":"wing","stall_speed":4.95,"cruise_speed":7.426,"max_speed":12.376,"thrust":0.5,"max_bank":1,"max_pitch":0.7,"clearance":1.296};
const wings = {"wings":[{"bone":"wing_upper_l","tip":"wing_fore_l","mirror":"x"}],"fold":80,"tip_fold":25,"droop":10,"amplitude":35,"tip_amplitude":25,"hz":1.939};
const material = {"roughness":0.72,"metal":0};
const creator = {"format":"soma.creator","version":1,"name":"pegasus","description":"a pegasus: the stallion's torso, legs, neck and head with a cartoon bird's spread wings on its withers (the pegasus model's own wings carry 38 bones each: with the horse's 65 they are over the mesher's 127)","torso":{"shape":"piece","size":[0.71723,0.94163,1.62661],"axis":"z","round":0,"color":[0.112,0.067,0.038],"piece":"horse_stallion_game_ready_torso","scale":1},"parts":[{"id":"fore","preset":"piece","params":{"piece":"horse_stallion_game_ready_leg_fl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_clavicle_l","t":1,"dir":[-0.217571,0.889267,-0.402327],"socket":"leg_f_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"hind","preset":"piece","params":{"piece":"horse_stallion_game_ready_leg_hl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"root","t":0,"dir":[0.638178,-0.767744,-0.057436],"socket":"leg_h_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"neck","preset":"piece","params":{"piece":"horse_stallion_game_ready_neck","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_3","t":0,"dir":[-0.005424,0.022595,-0.99973],"socket":"neck"},"mirror":false,"color":null,"colors":{},"ik":{"on":true},"roles":{}},{"id":"head","preset":"piece","params":{"piece":"horse_stallion_game_ready_head","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"neck_4","t":1,"dir":[0.208899,0.652967,0.728008],"socket":"neck.bn_head"},"mirror":false,"color":null,"colors":{},"ik":{"on":false},"roles":{}},{"id":"wing","preset":"piece","params":{"piece":"toon_bird_wing_l","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_2","t":0.7,"dir":[0.447223,-0.004404,-0.894412]},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"roles":{}}],"pieces":{"horse_stallion_game_ready_torso":{"hash":"8710d395","file":"/soma/parts/catalog/torso/horse_stallion_game_ready_torso.somapart"},"horse_stallion_game_ready_leg_fl":{"hash":"27f52720","file":"/soma/parts/catalog/leg/horse_stallion_game_ready_leg_fl.somapart"},"horse_stallion_game_ready_leg_hl":{"hash":"f4e038f8","file":"/soma/parts/catalog/leg/horse_stallion_game_ready_leg_hl.somapart"},"horse_stallion_game_ready_neck":{"hash":"2f9dc0d7","file":"/soma/parts/catalog/neck/horse_stallion_game_ready_neck.somapart"},"horse_stallion_game_ready_head":{"hash":"2d296163","file":"/soma/parts/catalog/head/horse_stallion_game_ready_head.somapart"},"toon_bird_wing_l":{"hash":"1cbd383c","file":"/soma/parts/catalog/wing/toon_bird_wing_l.somapart"}},"roles":{},"soft":{},"material":{},"settings":{"gait":"pegasus_walk","pattern":"auto","slack":0.05,"center":true,"face_roles":true,"soft_roles":true,"body":{"turn_rate":2.48,"max_speed":3.57},"physics":"auto","traits":{"ears":1.6,"tail":1.6,"fidget":1.4,"idle":1.2},"flight":"auto","wave":"auto","sdf":{},"vehicle":"auto","aircraft":"auto","rotors":"auto"},"ui":{"library":{"built_from":"pieces","kind":"mixed","species":"pegasus","sources":[{"uid":"ed65f00c8b514e1dbc58fc431e0c2e1f","title":"Horse(Stallion)   Game Ready"},{"uid":"be17d104bbe545868ad1da72d75d7b73","title":"Toon Bird"}],"recipe":"soma/creator/saved/pegasus.creator.json"}}};
return {
  name: "pegasus", max: 16,
  family: { faction: "animal", kind: "animal", hp: 137 },
  nav: { agent: { name: "pegasus", radius: 1, height: 2.22, step: 0.42, slope: 35, drop: 0.64 } },
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
      ["health", { hp: 137 }],
      ["fly", { alt: 12, cruise: 7.4, climb: 3, sink: 2.2, legs: 3, min_leg: 15, roam: 60, near: 4.5, rest_min: 8, rest_max: 20 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "pegasus", select: [ld.node("fly")] };
      return { tree: tree };
    }
  }
};
