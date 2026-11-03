// antler_hound: in soma's one form of a creature file (soma/creature_file.js): `body` is the creature as it was made, the rest is who it is to the others (family, nav, abilities) and its mind: the blocks of soma/world/blocks/ it loads by name and
// its tree (an animal's own clips: the clip set `quad/hound`). The old worker of this file is left out; the mind below is the default of a creature of its kind (animal): write the creature's own in `mind`.
// antler_hound: a creature MADE OF THE PARTS CATALOGUE'S PIECES (mixed, antlered hound): built by soma/tools/piece_creatures.js from its recipe soma/creator/saved/antler_hound.creator.json (the recipe is the source of truth:
// `node soma/tools/piece_creatures.js regenerate antler_hound` makes this file again after a piece of the catalogue is built again). The creator studio opens it for modification: /soma/soma_creator_studio_demo.jh?creator=/soma/creatures/antler_hound.js
// CREDITS: the pieces were cut out of these models of the rigged corpus (D:\work\glb_skinned_meshes: the corpus keeps no author or licence fields; title and uid as the corpus has them):
//   "Saluki Dog Breed (Game Ready)" (uid 2310d29e78564402acd6ba44b5e6c34f, mammals_domestic/2310d29e78564402acd6ba44b5e6c34f_Saluki_Dog_Breed_(Game_Ready).glb): saluki_dog_breed_game_torso, saluki_dog_breed_game_leg_fl, saluki_dog_breed_game_leg_hl, saluki_dog_breed_game_neck, saluki_dog_breed_game_head, saluki_dog_breed_game_tail
//   "Deer walk cycle Animated" (uid 301b37056bdf44709c9c3966bdf26bf8, mammals_wild/301b37056bdf44709c9c3966bdf26bf8_Deer_walk_cycle_Animated.glb): deer_walk_cycle_horn
"use strict";
// antler_hound: an antlered hound: the saluki's torso, legs, neck, head and tail with a deer's antlers. Made by the creature creator (soma/creator/creator.js, SOMA.md "The creator") from the `creator` object at the end of this file:
// the studio opens it again from that object (creator.from_definition). ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature. Metres, +x to its left, +y up, +z forward.
const skeleton = [
  {"name":"root","parent":null,"head":[-0.00026,0.68665,-0.30607],"tail":[-0.00026,0.68164,-0.1649]},
  {"name":"torso_spine_1","parent":"root","head":[-0.00026,0.68164,-0.1649],"tail":[-0.00026,0.67653,-0.02378]},
  {"name":"torso_spine_2","parent":"torso_spine_1","head":[-0.00026,0.67653,-0.02378],"tail":[-0.00026,0.6689,0.11746]},
  {"name":"torso_spine_3","parent":"torso_spine_2","head":[-0.00026,0.6689,0.11746],"tail":[-0.00026,0.67957,0.25863]},
  {"name":"torso_spine_4","parent":"torso_spine_3","head":[-0.00026,0.67957,0.25863],"tail":[-0.00026,0.68666,0.39981]},
  {"name":"torso_spine_5","parent":"torso_spine_4","head":[-0.00026,0.68666,0.39981],"tail":[-0.00026,0.73768,0.46688]},
  {"name":"torso_clavicle_l","parent":"torso_spine_5","head":[0.08645,0.68666,0.39981],"tail":[0.1181,0.58462,0.44919]},
  {"name":"torso_clavicle_r","parent":"torso_spine_5","head":[-0.08696,0.68666,0.39981],"tail":[-0.11861,0.58462,0.44919]},
  {"name":"torso_pelvis_b1","parent":"root","head":[-0.00026,0.7351,-0.3307],"tail":[-0.00026,0.7361,-0.3307]},
  {"name":"fore_thigh_l","parent":"torso_clavicle_l","head":[0.1181,0.58462,0.44919],"tail":[0.1134,0.42679,0.38065],"mirror":"x"},
  {"name":"fore_shin_l","parent":"fore_thigh_l","head":[0.1134,0.42679,0.38065],"tail":[0.10501,0.13684,0.3894],"mirror":"x"},
  {"name":"fore_foot_l","parent":"fore_shin_l","head":[0.10501,0.13684,0.3894],"tail":[0.10501,0.03839,0.41331],"mirror":"x"},
  {"name":"fore_toe_l","parent":"fore_foot_l","head":[0.10501,0.03839,0.41331],"tail":[0.10501,0.00343,0.41331],"mirror":"x"},
  {"name":"hind_thigh_l","parent":"root","head":[0.10291,0.59144,-0.34231],"tail":[0.12794,0.46316,-0.24955],"mirror":"x"},
  {"name":"hind_shin_l","parent":"hind_thigh_l","head":[0.12794,0.46316,-0.24955],"tail":[0.12902,0.263,-0.41933],"mirror":"x"},
  {"name":"hind_cannon_l","parent":"hind_shin_l","head":[0.12902,0.263,-0.41933],"tail":[0.15256,0.05234,-0.3894],"mirror":"x"},
  {"name":"hind_foot_l","parent":"hind_cannon_l","head":[0.15256,0.05234,-0.3894],"tail":[0.15605,0.00621,-0.34936],"mirror":"x"},
  {"name":"hind_toe_l","parent":"hind_foot_l","head":[0.15605,0.00621,-0.34936],"tail":[0.15598,0.00721,-0.34935],"mirror":"x"},
  {"name":"neck_1","parent":"torso_spine_5","head":[-0.00026,0.73768,0.46688],"tail":[-0.00026,0.84543,0.542]},
  {"name":"neck_2","parent":"neck_1","head":[-0.00026,0.84543,0.542],"tail":[-0.00026,0.95424,0.6193]},
  {"name":"head_head","parent":"neck_2","head":[-0.00026,0.95424,0.6193],"tail":[-0.00026,1.01829,0.68664]},
  {"name":"head_head_2","parent":"head_head","head":[-0.00026,0.90315,0.72865],"tail":[-0.00029,0.89162,0.77207]},
  {"name":"head_head_3","parent":"head_head_2","head":[-0.00029,0.89162,0.77207],"tail":[-0.00029,0.8697,0.80116]},
  {"name":"head_head_4","parent":"head_head_3","head":[-0.00029,0.8697,0.80116],"tail":[-0.00029,0.8707,0.80116]},
  {"name":"head_ear_l","parent":"head_head","head":[0.07241,1.03809,0.65763],"tail":[0.08729,1.01139,0.64785]},
  {"name":"head_ear_2_l","parent":"head_ear_l","head":[0.08729,1.01139,0.64785],"tail":[0.09679,0.97749,0.64128]},
  {"name":"head_ear_3_l","parent":"head_ear_2_l","head":[0.09679,0.97749,0.64128],"tail":[0.09515,0.93343,0.62947]},
  {"name":"head_ear_4_l","parent":"head_ear_3_l","head":[0.09515,0.93343,0.62947],"tail":[0.09701,0.89187,0.62947]},
  {"name":"head_ear_5_l","parent":"head_ear_4_l","head":[0.09701,0.89187,0.62947],"tail":[0.10471,0.85838,0.62947]},
  {"name":"head_ear_6_l","parent":"head_ear_5_l","head":[0.10471,0.85838,0.62947],"tail":[0.11047,0.83667,0.62947]},
  {"name":"head_ear_7_l","parent":"head_ear_6_l","head":[0.11047,0.83667,0.62947],"tail":[0.11047,0.83767,0.62947]},
  {"name":"head_ear_r","parent":"head_head","head":[-0.07368,1.03618,0.65232],"tail":[-0.08795,1.00698,0.64387]},
  {"name":"head_ear_2_r","parent":"head_ear_r","head":[-0.08795,1.00698,0.64387],"tail":[-0.09479,0.97311,0.63732]},
  {"name":"head_ear_3_r","parent":"head_ear_2_r","head":[-0.09479,0.97311,0.63732],"tail":[-0.09597,0.93144,0.63127]},
  {"name":"head_ear_4_r","parent":"head_ear_3_r","head":[-0.09597,0.93144,0.63127],"tail":[-0.09597,0.89219,0.63127]},
  {"name":"head_ear_5_r","parent":"head_ear_4_r","head":[-0.09597,0.89219,0.63127],"tail":[-0.10235,0.85683,0.63127]},
  {"name":"head_ear_6_r","parent":"head_ear_5_r","head":[-0.10235,0.85683,0.63127],"tail":[-0.10944,0.83512,0.63127]},
  {"name":"head_ear_7_r","parent":"head_ear_6_r","head":[-0.10944,0.83512,0.63127],"tail":[-0.10944,0.83612,0.63127]},
  {"name":"head_head_b1","parent":"head_head","head":[-0.00026,1.01829,0.68664],"tail":[-0.00986,0.89763,0.87251]},
  {"name":"head_head_b1_b1_r","parent":"head_head_b1","head":[-0.00986,0.89763,0.87251],"tail":[-0.00986,0.89863,0.87251]},
  {"name":"head_head_b1_b1_l","parent":"head_head_b1","head":[0.0134,0.89689,0.87273],"tail":[0.0134,0.89789,0.87273]},
  {"name":"head_head_b2_r","parent":"head_head","head":[-0.03393,0.9894,0.76608],"tail":[-0.03393,0.9904,0.76608]},
  {"name":"head_head_b2_l","parent":"head_head","head":[0.03695,0.98959,0.76571],"tail":[0.03695,0.99059,0.76571]},
  {"name":"tail_1","parent":"root","head":[-0.00026,0.70154,-0.38953],"tail":[-0.00026,0.61214,-0.43731]},
  {"name":"tail_2","parent":"tail_1","head":[-0.00026,0.61214,-0.43731],"tail":[-0.00026,0.49874,-0.45138]},
  {"name":"tail_3","parent":"tail_2","head":[-0.00026,0.49874,-0.45138],"tail":[-0.00026,0.38887,-0.46245]},
  {"name":"tail_4","parent":"tail_3","head":[-0.00026,0.38887,-0.46245],"tail":[-0.00026,0.31231,-0.51607]},
  {"name":"tail_5","parent":"tail_4","head":[-0.00026,0.31231,-0.51607],"tail":[-0.00026,0.27348,-0.54921]},
  {"name":"tail_6","parent":"tail_5","head":[-0.00026,0.27348,-0.54921],"tail":[-0.00026,0.27448,-0.54921]},
  {"name":"antlers_1","parent":"head_head","head":[-0.00026,0.90571,0.63041],"tail":[-0.00026,0.90633,0.63041]},
];
const rig = {
  joints: [
    {"bone":"fore_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"fore_shin_l","kind":"hinge","axis":[-1,0.029,0.002],"range":[-31,115],"mirror":"x"},
    {"bone":"fore_foot_l","kind":"ball","fwd":30,"back":30,"lat":15,"twist":15,"mirror":"x"},
    {"bone":"hind_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"hind_shin_l","kind":"hinge","axis":[0.987,0.106,-0.119],"range":[-82,64],"mirror":"x"},
    {"bone":"hind_cannon_l","kind":"hinge","axis":[-0.99,-0.096,0.106],"range":[-55,66],"mirror":"x"},
    {"bone":"hind_foot_l","kind":"ball","fwd":30,"back":30,"lat":15,"twist":15,"mirror":"x"},
    {"bone":"neck_1","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
    {"bone":"neck_2","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
    {"bone":"head_head_2","kind":"hinge","axis":[1,0,0.001],"range":[-5,35]},
    {"bone":"tail_1","kind":"ball","fwd":30,"back":30,"lat":30,"twist":20},
    {"bone":"tail_2","kind":"ball","fwd":30,"back":30,"lat":30,"twist":20},
    {"bone":"tail_3","kind":"ball","fwd":30,"back":30,"lat":30,"twist":20},
    {"bone":"tail_4","kind":"ball","fwd":30,"back":30,"lat":30,"twist":20},
    {"bone":"tail_5","kind":"ball","fwd":30,"back":30,"lat":30,"twist":20},
  ],
  chains: [
    {"name":"fore_l","bones":["fore_thigh_l","fore_shin_l"],"solver":"limb","tip":"fore_foot_l","pole":[0.002,0.132,-0.991],"pole_w":1,"mirror":"x"},
    {"name":"hind_l","bones":["hind_thigh_l","hind_shin_l","hind_cannon_l"],"solver":"z_leg","tip":"hind_foot_l","pole":[0.133,-0.074,0.988],"pole_w":1,"mirror":"x"},
    {"name":"neck","bones":["neck_1","neck_2"]},
    {"name":"tail","bones":["tail_1","tail_2","tail_3","tail_4","tail_5"]},
  ],
};
const legs = {"legs":[{"chain":"hind_l","mirror":"x","foot_height":0.04876},{"chain":"fore_l","mirror":"x","foot_height":0.13684}],"gait":{"from":"dog_saluki_walk","ride":0.6738}};
const body = {"gravity":9.8,"turn_rate":3.26,"max_speed":2.91};
const roles = {"hips":"root","spine":["torso_spine_1","torso_spine_2","torso_spine_3","torso_spine_4","torso_spine_5"],"neck":["neck_1","neck_2"],"head":"head_head","ears":[["head_ear_l","head_ear_2_l","head_ear_3_l","head_ear_4_l","head_ear_5_l","head_ear_6_l","head_ear_7_l"],["head_ear_r","head_ear_2_r","head_ear_3_r","head_ear_4_r","head_ear_5_r","head_ear_6_r","head_ear_7_r"]],"jaw":"head_head_2","tail":["tail_1","tail_2","tail_3","tail_4","tail_5","tail_6"]};
const traits = {"tail":2,"ears":1.3,"fidget":1.2};
const physics = {"mass":54.783,"shapes":[{"id":"body","shape":"capsule","a":[0.00679,0.6545,-0.27837],"b":[0.00679,0.6545,0.44667],"radius":0.126,"bone":"root"},{"id":"head","shape":"sphere","center":[0.00256,0.93466,0.73273],"radius":0.161,"bone":"head_head"},{"id":"fore_l","shape":"capsule","a":[0.1181,0.53839,0.44919],"b":[0.10501,0.05548,0.3894],"radius":0.034,"mirror":"x"},{"id":"hind_l","shape":"capsule","a":[0.10291,0.52776,-0.34231],"b":[0.15256,0.07642,-0.3894],"radius":0.037,"mirror":"x"}]};
const parts = [
  {"id":"torso_0","shape":"volume","volume":"saluki_dog_breed_game_torso","origin":[-0.00026,0.68665,-0.30607],"rotate":[0,0,0],"scale":1,"bone":"root","bone_map":{"@host":"root","torso_pelvis":"root","torso_spine_1":"torso_spine_1","torso_spine_2":"torso_spine_2","torso_spine_3":"torso_spine_3","torso_spine_4":"torso_spine_4","torso_spine_5":"torso_spine_5","torso_clavicle_l":"torso_clavicle_l","torso_clavicle_r":"torso_clavicle_r","torso_pelvis_b1":"torso_pelvis_b1","@neck":"neck_1","@leg_f_l":"fore_thigh_l","@leg_f_r":"fore_thigh_r","@leg_h_l":"hind_thigh_l","@leg_h_r":"hind_thigh_r","@tail":"tail_1"},"roughness":1,"metal":0.62},
  {"id":"fore_thigh_0","shape":"volume","volume":"saluki_dog_breed_game_leg_fl","origin":[0.1181,0.58462,0.44919],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"torso_clavicle_l","bone_map":{"@host":"torso_clavicle_l","leg_thigh_l":"fore_thigh_l","leg_shin_l":"fore_shin_l","leg_foot_l":"fore_foot_l","leg_toe_l":"fore_toe_l","Wolf_r_Clavicle_01_01SHJnt_9":"torso_clavicle_r","Wolf_Neck_01SHJnt_34":"neck_1","Wolf_r_FrontLeg_HipSHJnt_8":"fore_thigh_r"},"blend":0.01716,"blend_mode":"cubic","roughness":1,"metal":0.62},
  {"id":"hind_thigh_0","shape":"volume","volume":"saluki_dog_breed_game_leg_hl","origin":[0.10291,0.59144,-0.34231],"rotate":[0.31551,0.03764,4.29203],"scale":1,"mirror":"x","bone":"root","bone_map":{"@host":"root","leg_thigh_l":"hind_thigh_l","leg_shin_l":"hind_shin_l","leg_cannon_l":"hind_cannon_l","leg_foot_l":"hind_foot_l","leg_toe_l":"hind_toe_l","Wolf_Spine_01SHJnt_39":"torso_spine_1","Wolf_ROOTSHJnt.001_56":"torso_pelvis_b1"},"blend":0.01827,"blend_mode":"cubic","roughness":1,"metal":0.62},
  {"id":"neck_1_0","shape":"volume","volume":"saluki_dog_breed_game_neck","origin":[-0.00026,0.73768,0.46688],"rotate":[0,0,0],"scale":1,"bone":"torso_spine_5","bone_map":{"@host":"torso_spine_5","neck_1":"neck_1","neck_2":"neck_2","@wolf_neck_top":"head_head","Wolf_l_Clavicle_01_01SHJnt_4":"torso_clavicle_l","Wolf_r_Clavicle_01_01SHJnt_9":"torso_clavicle_r","Wolf_l_FrontLeg_HipSHJnt_3":"fore_thigh_l","Wolf_r_FrontLeg_HipSHJnt_8":"fore_thigh_r"},"blend":0.02683,"blend_mode":"cubic","roughness":1,"metal":0.62},
  {"id":"head_head_0","shape":"volume","volume":"saluki_dog_breed_game_head","origin":[-0.00026,0.95424,0.6193],"rotate":[0,0,0],"scale":1,"bone":"neck_2","bone_map":{"@host":"neck_2","head_head":"head_head","head_head_2":"head_head_2","head_head_3":"head_head_3","head_head_4":"head_head_4","head_ear_l":"head_ear_l","head_ear_2_l":"head_ear_2_l","head_ear_3_l":"head_ear_3_l","head_ear_4_l":"head_ear_4_l","head_ear_5_l":"head_ear_5_l","head_ear_6_l":"head_ear_6_l","head_ear_7_l":"head_ear_7_l","head_ear_r":"head_ear_r","head_ear_2_r":"head_ear_2_r","head_ear_3_r":"head_ear_3_r","head_ear_4_r":"head_ear_4_r","head_ear_5_r":"head_ear_5_r","head_ear_6_r":"head_ear_6_r","head_ear_7_r":"head_ear_7_r","head_head_b1":"head_head_b1","head_head_b1_b1_r":"head_head_b1_b1_r","head_head_b1_b1_l":"head_head_b1_b1_l","head_head_b2_r":"head_head_b2_r","head_head_b2_l":"head_head_b2_l"},"blend":0.02099,"blend_mode":"cubic","roughness":1,"metal":0.62},
  {"id":"tail_1_0","shape":"volume","volume":"saluki_dog_breed_game_tail","origin":[-0.00026,0.70154,-0.38953],"rotate":[0,0,0],"scale":1,"bone":"root","bone_map":{"@host":"root","tail_1":"tail_1","tail_2":"tail_2","tail_3":"tail_3","tail_4":"tail_4","tail_5":"tail_5","tail_6":"tail_6","Wolf_ROOTSHJnt.001_56":"torso_pelvis_b1"},"blend":0.00821,"blend_mode":"cubic","roughness":1,"metal":0.62},
];
const sdf = Object.assign({"cell":0.01373,"decimate":{"ratio":0.4},"skin":{"falloff":1.5,"seam":1},"shade":{"ao":0.45,"ao_radius":0.04119,"tone":0.2,"color_blend":1},"volumes":{"saluki_dog_breed_game_torso":{"hash":"05ea146f","piece":"/soma/parts/catalog/torso/saluki_dog_breed_game_torso.somapart","bake":{"cell":0.0078,"band":6}},"saluki_dog_breed_game_leg_fl":{"hash":"237af5c3","piece":"/soma/parts/catalog/leg/saluki_dog_breed_game_leg_fl.somapart","bake":{"cell":0.0078,"band":6}},"saluki_dog_breed_game_leg_hl":{"hash":"228ffe43","piece":"/soma/parts/catalog/leg/saluki_dog_breed_game_leg_hl.somapart","bake":{"cell":0.0078,"band":6}},"saluki_dog_breed_game_neck":{"hash":"b4c25035","piece":"/soma/parts/catalog/neck/saluki_dog_breed_game_neck.somapart","bake":{"cell":0.0078,"band":6}},"saluki_dog_breed_game_head":{"hash":"54361976","piece":"/soma/parts/catalog/head/saluki_dog_breed_game_head.somapart","bake":{"cell":0.0078,"band":6}},"saluki_dog_breed_game_tail":{"hash":"d3b41228","piece":"/soma/parts/catalog/tail/saluki_dog_breed_game_tail.somapart","bake":{"cell":0.0078,"band":6}},"deer_walk_cycle_horn":{"hash":"c190e637","piece":"/soma/parts/catalog/horn/deer_walk_cycle_horn.somapart"}},"meshes":[{"id":"antlers_1_0","volume":"deer_walk_cycle_horn","origin":[-0.00026,0.90571,0.63041],"rotate":[0,0,0],"scale":0.61611,"bone":"head_head","bone_map":{"@host":"head_head","horn_1":"antlers_1"},"roughness":0.6,"metal":0}]}, { parts: parts });
const material = {"roughness":0.72,"metal":0};
const creator = {"format":"soma.creator","version":1,"name":"antler_hound","description":"an antlered hound: the saluki's torso, legs, neck, head and tail with a deer's antlers","torso":{"shape":"piece","size":[0.27317,0.3943,0.97636],"axis":"z","round":0,"color":[0.009,0.007,0.007],"piece":"saluki_dog_breed_game_torso","scale":1},"parts":[{"id":"fore","preset":"piece","params":{"piece":"saluki_dog_breed_game_leg_fl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_clavicle_l","t":1,"dir":[-0.201625,0.620527,0.757821],"socket":"leg_f_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"hind","preset":"piece","params":{"piece":"saluki_dog_breed_game_leg_hl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"root","t":0,"dir":[0.711562,-0.2265,0.665114],"socket":"leg_h_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"neck","preset":"piece","params":{"piece":"saluki_dog_breed_game_neck","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_5","t":1,"dir":[0,0.951825,-0.306641],"socket":"neck"},"mirror":false,"color":null,"colors":{},"ik":{"on":true},"roles":{}},{"id":"head","preset":"piece","params":{"piece":"saluki_dog_breed_game_head","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"neck_2","t":1,"dir":[0,0.981482,0.191554],"socket":"neck.wolf_neck_top"},"mirror":false,"color":null,"colors":{},"ik":{"on":false},"roles":{}},{"id":"tail","preset":"piece","params":{"piece":"saluki_dog_breed_game_tail","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"root","t":0,"dir":[0,-0.990065,-0.14061],"socket":"tail"},"mirror":false,"color":null,"colors":{},"ik":{"on":true},"roles":{}},{"id":"antlers","preset":"piece","params":{"piece":"deer_walk_cycle_horn","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"head_head","t":0.4,"dir":[0,0.533698,-0.845675]},"mirror":false,"color":null,"colors":{},"ik":{"on":false},"roles":{}}],"pieces":{"saluki_dog_breed_game_torso":{"hash":"05ea146f","file":"/soma/parts/catalog/torso/saluki_dog_breed_game_torso.somapart"},"saluki_dog_breed_game_leg_fl":{"hash":"237af5c3","file":"/soma/parts/catalog/leg/saluki_dog_breed_game_leg_fl.somapart"},"saluki_dog_breed_game_leg_hl":{"hash":"228ffe43","file":"/soma/parts/catalog/leg/saluki_dog_breed_game_leg_hl.somapart"},"saluki_dog_breed_game_neck":{"hash":"b4c25035","file":"/soma/parts/catalog/neck/saluki_dog_breed_game_neck.somapart"},"saluki_dog_breed_game_head":{"hash":"54361976","file":"/soma/parts/catalog/head/saluki_dog_breed_game_head.somapart"},"saluki_dog_breed_game_tail":{"hash":"d3b41228","file":"/soma/parts/catalog/tail/saluki_dog_breed_game_tail.somapart"},"deer_walk_cycle_horn":{"hash":"c190e637","file":"/soma/parts/catalog/horn/deer_walk_cycle_horn.somapart"}},"roles":{},"soft":{},"material":{},"settings":{"gait":"auto","pattern":"auto","slack":0.05,"center":true,"face_roles":true,"soft_roles":true,"body":{"turn_rate":3.26,"max_speed":2.91},"physics":"auto","traits":{"tail":2,"ears":1.3,"fidget":1.2},"flight":"auto","wave":"auto","sdf":{},"vehicle":"auto","aircraft":"auto","rotors":"auto"},"ui":{"library":{"built_from":"pieces","kind":"mixed","species":"antlered hound","sources":[{"uid":"2310d29e78564402acd6ba44b5e6c34f","title":"Saluki Dog Breed (Game Ready)"},{"uid":"301b37056bdf44709c9c3966bdf26bf8","title":"Deer walk cycle Animated"}],"recipe":"soma/creator/saved/antler_hound.creator.json"}}};
return {
  name: "antler_hound", max: 16,
  family: { faction: "animal", kind: "animal", hp: 37 },
  nav: { agent: { name: "antler_hound", radius: 0.32, height: 1.14, step: 0.21, slope: 35, drop: 0.31 } },
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
      ["health", { hp: 37 }],
      ["flee", { speed: 3.49, distance: 10 }],
      ["curious", { approach: 0.3, cooldown: 20, near: 1.2 }],
      ["idle_life", { clip_look: "hound_idle", clip_stretch: "hound_idle_2", clip_shift: "hound_idle", clip_sit: "hound_idle" }],
      ["injured", { clip_flinch: "" }],
      ["wander", { speed: 1.31, near: 0.5 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "antler_hound", select: [ld.node("flee"), ld.node("curious"), ld.node("idle_life"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
