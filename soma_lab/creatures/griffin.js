// griffin: in soma's one form of a creature file (soma/creature_file.js): `body` is the creature as it was made, the rest is who it is to the others (family, nav, abilities) and its mind: the blocks of soma/world/blocks/ it loads by name and
// its tree (an animal's own clips: the clip set `dino/griffin`). The old worker of this file is left out; the mind below is the default of a creature of its kind (animal): write the creature's own in `mind`.
// griffin: a creature MADE OF THE PARTS CATALOGUE'S PIECES (mixed, griffin): built by soma/tools/piece_creatures.js from its recipe soma/creator/saved/griffin.creator.json (the recipe is the source of truth:
// `node soma/tools/piece_creatures.js regenerate griffin` makes this file again after a piece of the catalogue is built again). The creator studio opens it for modification: /soma/soma_creator_studio_demo.jh?creator=/soma/creatures/griffin.js
// CREDITS: the pieces were cut out of these models of the rigged corpus (D:\work\glb_skinned_meshes: the corpus keeps no author or licence fields; title and uid as the corpus has them):
//   "Lioness" (uid e33051ad558f4b15bdc8f9e34bdaca41, uncategorized/e33051ad558f4b15bdc8f9e34bdaca41_Lioness.glb): lioness_torso, lioness_leg_fl, lioness_leg_hl, lioness_neck
//   "Stylized pigeon" (uid fb285d61e9034b199ca78718f518c885, birds/fb285d61e9034b199ca78718f518c885_Stylized_pigeon.glb): stylized_pigeon_head
//   "KEKOS Horses   Pegasus [Single Character]" (uid 552165a3f7e0441ba78f84e00b919ee7, mammals_domestic/552165a3f7e0441ba78f84e00b919ee7_KEKOS_Horses___Pegasus_[Single_Character].glb): kekos_horses_pegasus_single_wing_l
"use strict";
// griffin: a griffin: a lioness's body, legs and neck, a bird's head (a stylized pigeon's) and a pegasus model's feathered wings spread from its shoulders. Made by the creature creator (soma/creator/creator.js, SOMA.md "The creator") from the `creator` object at the end of this file:
// the studio opens it again from that object (creator.from_definition). ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature. Metres, +x to its left, +y up, +z forward.
const skeleton = [
  {"name":"root","parent":null,"head":[0,0.88988,-0.36969],"tail":[0,0.85819,-0.19771]},
  {"name":"torso_spine_1","parent":"root","head":[0,0.85819,-0.19771],"tail":[0,0.79511,-0.01911]},
  {"name":"torso_spine_2","parent":"torso_spine_1","head":[0,0.79511,-0.01911],"tail":[0,0.78445,0.1883]},
  {"name":"torso_spine_3","parent":"torso_spine_2","head":[0,0.78445,0.1883],"tail":[0,0.82247,0.41315]},
  {"name":"fore_thigh_l","parent":"torso_spine_3","head":[0.12243,0.9385,0.41215],"tail":[0.13683,0.72965,0.52217],"mirror":"x"},
  {"name":"fore_shin_l","parent":"fore_thigh_l","head":[0.13683,0.72965,0.52217],"tail":[0.13683,0.49205,0.40737],"mirror":"x"},
  {"name":"fore_cannon_l","parent":"fore_shin_l","head":[0.13683,0.49205,0.40737],"tail":[0.13683,0.20484,0.43446],"mirror":"x"},
  {"name":"fore_foot_l","parent":"fore_cannon_l","head":[0.13683,0.20484,0.43446],"tail":[0.14569,0.08449,0.48072],"mirror":"x"},
  {"name":"fore_toe_l","parent":"fore_foot_l","head":[0.14569,0.08449,0.48072],"tail":[0.14569,0.0482,0.53256],"mirror":"x"},
  {"name":"fore_tip_l","parent":"fore_toe_l","head":[0.14569,0.0482,0.53256],"tail":[0.14569,0.00544,0.53256],"mirror":"x"},
  {"name":"hind_thigh_l","parent":"root","head":[0.0958,0.85815,-0.37859],"tail":[0.13065,0.59437,-0.30121],"mirror":"x"},
  {"name":"hind_shin_l","parent":"hind_thigh_l","head":[0.13065,0.59437,-0.30121],"tail":[0.13065,0.3283,-0.48126],"mirror":"x"},
  {"name":"hind_cannon_l","parent":"hind_shin_l","head":[0.13065,0.3283,-0.48126],"tail":[0.13065,0.08807,-0.43445],"mirror":"x"},
  {"name":"hind_foot_l","parent":"hind_cannon_l","head":[0.13065,0.08807,-0.43445],"tail":[0.13065,0.05435,-0.37666],"mirror":"x"},
  {"name":"hind_toe_l","parent":"hind_foot_l","head":[0.13065,0.05435,-0.37666],"tail":[0.13065,-0.00082,-0.37666],"mirror":"x"},
  {"name":"neck_1","parent":"torso_spine_3","head":[0,0.82247,0.41315],"tail":[0,0.86752,0.61396]},
  {"name":"neck_2","parent":"neck_1","head":[0,0.86752,0.61396],"tail":[0,0.90626,0.81869]},
  {"name":"head_head","parent":"neck_2","head":[0,0.79929,0.81869],"tail":[0,0.80293,0.81869]},
  {"name":"wing_upper_l","parent":"torso_spine_3","head":[0.05447,0.96341,0.27122],"tail":[0.15869,0.97506,0.29644],"mirror":"x"},
  {"name":"wing_fore_l","parent":"wing_upper_l","head":[0.18166,0.96341,0.30559],"tail":[0.25134,0.962,0.43392],"mirror":"x"},
  {"name":"wing_fore_b1_l","parent":"wing_fore_l","head":[0.18341,0.95774,0.32987],"tail":[0.18341,0.95837,0.32987],"mirror":"x"},
  {"name":"wing_hand_l","parent":"wing_fore_l","head":[0.25875,0.96341,0.45586],"tail":[0.28049,0.96305,0.45942],"mirror":"x"},
  {"name":"wing_hand_b1_l","parent":"wing_hand_l","head":[0.32383,0.94942,0.44939],"tail":[0.32383,0.95005,0.44939],"mirror":"x"},
  {"name":"wing_hand_b2_l","parent":"wing_hand_l","head":[0.26088,0.94613,0.4461],"tail":[0.26088,0.94676,0.4461],"mirror":"x"},
  {"name":"wing_hand_b3_l","parent":"wing_hand_l","head":[0.27492,0.94525,0.45091],"tail":[0.27492,0.94588,0.45091],"mirror":"x"},
  {"name":"wing_hand_b4_l","parent":"wing_hand_l","head":[0.30088,0.94728,0.45128],"tail":[0.30088,0.94791,0.45128],"mirror":"x"},
  {"name":"wing_hand_b5_l","parent":"wing_hand_l","head":[0.32501,0.94774,0.45304],"tail":[0.32501,0.94837,0.45304],"mirror":"x"},
  {"name":"wing_hand_b6_l","parent":"wing_hand_l","head":[0.35181,0.94772,0.45115],"tail":[0.35181,0.94835,0.45115],"mirror":"x"},
  {"name":"wing_hand_b7_l","parent":"wing_hand_l","head":[0.30841,0.9519,0.44572],"tail":[0.30841,0.95253,0.44572],"mirror":"x"},
  {"name":"wing_hand_b8_l","parent":"wing_hand_l","head":[0.29236,0.95265,0.44604],"tail":[0.29236,0.95328,0.44604],"mirror":"x"},
  {"name":"wing_hand_b9_l","parent":"wing_hand_l","head":[0.27231,0.95265,0.45112],"tail":[0.27231,0.95328,0.45112],"mirror":"x"},
  {"name":"wing_hand_b10_l","parent":"wing_hand_l","head":[0.28049,0.96305,0.45942],"tail":[0.28049,0.96368,0.45942],"mirror":"x"},
  {"name":"wing_hand_b11_l","parent":"wing_hand_l","head":[0.31288,0.96205,0.46395],"tail":[0.31288,0.96268,0.46395],"mirror":"x"},
  {"name":"wing_hand_b12_l","parent":"wing_hand_l","head":[0.33578,0.96205,0.46197],"tail":[0.33578,0.96268,0.46197],"mirror":"x"},
  {"name":"wing_hand_b13_l","parent":"wing_hand_l","head":[0.35767,0.96205,0.46398],"tail":[0.35767,0.96268,0.46398],"mirror":"x"},
  {"name":"wing_finger_l","parent":"wing_hand_l","head":[0.36594,0.94992,0.46362],"tail":[0.36594,0.95055,0.46362],"mirror":"x"},
  {"name":"wing_hand_b14_l","parent":"wing_hand_l","head":[0.33906,0.94855,0.45364],"tail":[0.33906,0.94919,0.45364],"mirror":"x"},
  {"name":"wing_fore_b2_l","parent":"wing_fore_l","head":[0.17661,0.94578,0.32685],"tail":[0.17661,0.94641,0.32685],"mirror":"x"},
  {"name":"wing_fore_b3_l","parent":"wing_fore_l","head":[0.21426,0.94451,0.39253],"tail":[0.21426,0.94514,0.39253],"mirror":"x"},
  {"name":"wing_fore_b4_l","parent":"wing_fore_l","head":[0.2481,0.95108,0.42936],"tail":[0.2481,0.95171,0.42936],"mirror":"x"},
  {"name":"wing_fore_b5_l","parent":"wing_fore_l","head":[0.21706,0.95505,0.38119],"tail":[0.21706,0.95569,0.38119],"mirror":"x"},
  {"name":"wing_fore_b6_l","parent":"wing_fore_l","head":[0.23137,0.96541,0.41092],"tail":[0.23137,0.96604,0.41092],"mirror":"x"},
  {"name":"wing_fore_b7_l","parent":"wing_fore_l","head":[0.25134,0.962,0.43392],"tail":[0.25134,0.96263,0.43392],"mirror":"x"},
  {"name":"wing_fore_b8_l","parent":"wing_fore_l","head":[0.19448,0.94379,0.36355],"tail":[0.19448,0.94442,0.36355],"mirror":"x"},
  {"name":"wing_fore_b9_l","parent":"wing_fore_l","head":[0.20516,0.96895,0.3711],"tail":[0.20516,0.96958,0.3711],"mirror":"x"},
  {"name":"wing_fore_b10_l","parent":"wing_fore_l","head":[0.18238,0.97285,0.33732],"tail":[0.18238,0.97348,0.33732],"mirror":"x"},
  {"name":"wing_fore_b11_l","parent":"wing_fore_l","head":[0.25916,0.95296,0.44925],"tail":[0.25916,0.95359,0.44925],"mirror":"x"},
  {"name":"wing_upper_b1_l","parent":"wing_upper_l","head":[0.15052,0.94613,0.29211],"tail":[0.15052,0.94676,0.29211],"mirror":"x"},
  {"name":"wing_upper_b2_l","parent":"wing_upper_l","head":[0.06424,0.96162,0.25059],"tail":[0.06424,0.96225,0.25059],"mirror":"x"},
  {"name":"wing_upper_b3_l","parent":"wing_upper_l","head":[0.0897,0.9609,0.25132],"tail":[0.0897,0.96153,0.25132],"mirror":"x"},
  {"name":"wing_upper_b4_l","parent":"wing_upper_l","head":[0.12276,0.96024,0.26555],"tail":[0.12276,0.96087,0.26555],"mirror":"x"},
  {"name":"wing_upper_b5_l","parent":"wing_upper_l","head":[0.15159,0.95852,0.30309],"tail":[0.15159,0.95915,0.30309],"mirror":"x"},
  {"name":"wing_upper_b6_l","parent":"wing_upper_l","head":[0.10763,0.97296,0.25104],"tail":[0.10763,0.97359,0.25104],"mirror":"x"},
  {"name":"wing_upper_b7_l","parent":"wing_upper_l","head":[0.13984,0.97512,0.26917],"tail":[0.13984,0.97575,0.26917],"mirror":"x"},
  {"name":"wing_upper_b8_l","parent":"wing_upper_l","head":[0.15869,0.97506,0.29644],"tail":[0.15869,0.97569,0.29644],"mirror":"x"},
  {"name":"wing_upper_b9_l","parent":"wing_upper_l","head":[0.12842,0.94938,0.27797],"tail":[0.12842,0.95001,0.27797],"mirror":"x"},
];
const rig = {
  joints: [
    {"bone":"fore_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"fore_shin_l","kind":"hinge","axis":[0.997,0.033,-0.068],"range":[-60,86],"mirror":"x"},
    {"bone":"fore_cannon_l","kind":"hinge","axis":[-1,0,0],"range":[-37,84],"mirror":"x"},
    {"bone":"fore_foot_l","kind":"ball","fwd":30,"back":30,"lat":15,"twist":15,"mirror":"x"},
    {"bone":"hind_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"hind_shin_l","kind":"hinge","axis":[0.987,0.091,-0.134],"range":[-57,89],"mirror":"x"},
    {"bone":"hind_cannon_l","kind":"hinge","axis":[-1,0,0],"range":[-51,70],"mirror":"x"},
    {"bone":"hind_foot_l","kind":"ball","fwd":30,"back":30,"lat":15,"twist":15,"mirror":"x"},
    {"bone":"neck_1","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
    {"bone":"neck_2","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
  ],
  chains: [
    {"name":"fore_l","bones":["fore_thigh_l","fore_shin_l","fore_cannon_l"],"solver":"z_leg","tip":"fore_foot_l","pole":[0.098,0.032,0.995],"pole_w":1,"mirror":"x"},
    {"name":"hind_l","bones":["hind_thigh_l","hind_shin_l","hind_cannon_l"],"solver":"z_leg","tip":"hind_foot_l","pole":[0.234,-0.06,0.97],"pole_w":1,"mirror":"x"},
    {"name":"neck","bones":["neck_1","neck_2"]},
  ],
};
const legs = {"legs":[{"chain":"hind_l","mirror":"x","foot_height":0.08807},{"chain":"fore_l","mirror":"x","foot_height":0.19838}],"gait":{"from":"griffin_walk","ride":0.88988}};
const body = {"gravity":9.8,"turn_rate":2.62,"max_speed":2.29};
const roles = {"hips":"root","spine":["torso_spine_1","torso_spine_2","torso_spine_3"],"neck":["neck_1","neck_2"],"head":"head_head"};
const traits = {"tail":1.6,"stabilise":0.9,"ears":1.2};
const physics = {"mass":182.172,"shapes":[{"id":"body","shape":"capsule","a":[0.00085,0.75143,-1.1949],"b":[0.00085,0.75143,0.38249],"radius":0.18,"bone":"root"},{"id":"head","shape":"sphere","center":[-0.00021,0.90054,0.84196],"radius":0.12,"bone":"head_head"},{"id":"fore_l","shape":"capsule","a":[0.12243,0.85961,0.41215],"b":[0.13683,0.09466,0.43446],"radius":0.054,"mirror":"x"},{"id":"hind_l","shape":"capsule","a":[0.0958,0.77384,-0.37859],"b":[0.13065,0.10117,-0.43445],"radius":0.082,"mirror":"x"}]};
const parts = [
  {"id":"torso_0","shape":"volume","volume":"lioness_torso","origin":[0,0.88988,-0.36969],"rotate":[0,0,0],"scale":1,"bone":"root","bone_map":{"@host":"root","torso_pelvis":"root","torso_spine_1":"torso_spine_1","torso_spine_2":"torso_spine_2","torso_spine_3":"torso_spine_3","@neck":"neck_1","@leg_f_l":"fore_thigh_l","@leg_f_r":"fore_thigh_r","@leg_h_l":"hind_thigh_l","@leg_h_r":"hind_thigh_r"}},
  {"id":"fore_thigh_0","shape":"volume","volume":"lioness_leg_fl","origin":[0.12243,0.9385,0.41215],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"torso_spine_3","bone_map":{"@host":"torso_spine_3","leg_thigh_l":"fore_thigh_l","leg_shin_l":"fore_shin_l","leg_cannon_l":"fore_cannon_l","leg_foot_l":"fore_foot_l","leg_toe_l":"fore_toe_l","leg_tip_l":"fore_tip_l","Spine_6_07":"neck_1","Neck_08":"neck_2"},"blend":0.02679,"blend_mode":"cubic"},
  {"id":"hind_thigh_0","shape":"volume","volume":"lioness_leg_hl","origin":[0.0958,0.85815,-0.37859],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"root","bone_map":{"@host":"root","leg_thigh_l":"hind_thigh_l","leg_shin_l":"hind_shin_l","leg_cannon_l":"hind_cannon_l","leg_foot_l":"hind_foot_l","leg_toe_l":"hind_toe_l","Spine_3_05":"torso_spine_1","Leg_B_1.R_037":"hind_thigh_r","Spine_4_06":"torso_spine_2"},"blend":0.04124,"blend_mode":"cubic"},
  {"id":"neck_1_0","shape":"volume","volume":"lioness_neck","origin":[0,0.82247,0.41315],"rotate":[0,0,0],"scale":1,"bone":"torso_spine_3","bone_map":{"@host":"torso_spine_3","neck_1":"neck_1","neck_2":"neck_2","@head":"neck_2","Leg_F_1.L_020":"fore_thigh_l","Leg_F_1.R_026":"fore_thigh_r","Leg_F_2.L_021":"fore_shin_l"},"blend":0.05395,"blend_mode":"cubic"},
  {"id":"head_head_0","shape":"volume","volume":"stylized_pigeon_head","origin":[0,0.79929,0.81869],"rotate":[0,0,0],"scale":3.63945,"bone":"neck_2","bone_map":{"@host":"neck_2","head_head":"head_head"},"blend":0.04011,"blend_mode":"cubic","roughness":0.689,"metal":0},
];
const sdf = Object.assign({"cell":0.02226,"decimate":{"ratio":0.4},"skin":{"falloff":1.5,"seam":1},"shade":{"ao":0.45,"ao_radius":0.06678,"tone":0.2,"color_blend":1},"volumes":{"lioness_torso":{"hash":"eb6e6a0a","piece":"/soma/parts/catalog/torso/lioness_torso.somapart","bake":{"cell":0.0131,"band":6}},"lioness_leg_fl":{"hash":"be49e37d","piece":"/soma/parts/catalog/leg/lioness_leg_fl.somapart","bake":{"cell":0.0131,"band":6}},"lioness_leg_hl":{"hash":"990e7970","piece":"/soma/parts/catalog/leg/lioness_leg_hl.somapart","bake":{"cell":0.0131,"band":6}},"lioness_neck":{"hash":"35f8006f","piece":"/soma/parts/catalog/neck/lioness_neck.somapart","bake":{"cell":0.0131,"band":6}},"stylized_pigeon_head":{"hash":"09148304","piece":"/soma/parts/catalog/head/stylized_pigeon_head.somapart","bake":{"cell":0.0039,"band":6}},"kekos_horses_pegasus_single_wing_l":{"hash":"90cccdc6","piece":"/soma/parts/catalog/wing/kekos_horses_pegasus_single_wing_l.somapart"}},"meshes":[{"id":"wing_upper_0","volume":"kekos_horses_pegasus_single_wing_l","origin":[0.05447,0.96341,0.27122],"rotate":[0,0,0],"scale":0.63043,"mirror":"x","bone":"torso_spine_3","bone_map":{"@host":"torso_spine_3","wing_upper_l":"wing_upper_l","wing_fore_l":"wing_fore_l","wing_fore_b1_l":"wing_fore_b1_l","wing_hand_l":"wing_hand_l","wing_hand_b1_l":"wing_hand_b1_l","wing_hand_b2_l":"wing_hand_b2_l","wing_hand_b3_l":"wing_hand_b3_l","wing_hand_b4_l":"wing_hand_b4_l","wing_hand_b5_l":"wing_hand_b5_l","wing_hand_b6_l":"wing_hand_b6_l","wing_hand_b7_l":"wing_hand_b7_l","wing_hand_b8_l":"wing_hand_b8_l","wing_hand_b9_l":"wing_hand_b9_l","wing_hand_b10_l":"wing_hand_b10_l","wing_hand_b11_l":"wing_hand_b11_l","wing_hand_b12_l":"wing_hand_b12_l","wing_hand_b13_l":"wing_hand_b13_l","wing_finger_l":"wing_finger_l","wing_hand_b14_l":"wing_hand_b14_l","wing_fore_b2_l":"wing_fore_b2_l","wing_fore_b3_l":"wing_fore_b3_l","wing_fore_b4_l":"wing_fore_b4_l","wing_fore_b5_l":"wing_fore_b5_l","wing_fore_b6_l":"wing_fore_b6_l","wing_fore_b7_l":"wing_fore_b7_l","wing_fore_b8_l":"wing_fore_b8_l","wing_fore_b9_l":"wing_fore_b9_l","wing_fore_b10_l":"wing_fore_b10_l","wing_fore_b11_l":"wing_fore_b11_l","wing_upper_b1_l":"wing_upper_b1_l","wing_upper_b2_l":"wing_upper_b2_l","wing_upper_b3_l":"wing_upper_b3_l","wing_upper_b4_l":"wing_upper_b4_l","wing_upper_b5_l":"wing_upper_b5_l","wing_upper_b6_l":"wing_upper_b6_l","wing_upper_b7_l":"wing_upper_b7_l","wing_upper_b8_l":"wing_upper_b8_l","wing_upper_b9_l":"wing_upper_b9_l"},"roughness":0.515,"metal":0}]}, { parts: parts });
const material = {"roughness":0.72,"metal":0};
const creator = {"format":"soma.creator","version":1,"name":"griffin","description":"a griffin: a lioness's body, legs and neck, a bird's head (a stylized pigeon's) and a pegasus model's feathered wings spread from its shoulders","torso":{"shape":"piece","size":[0.39145,0.56046,1.93752],"axis":"z","round":0,"color":[0.188,0.112,0.065],"piece":"lioness_torso","scale":1},"parts":[{"id":"fore","preset":"piece","params":{"piece":"lioness_leg_fl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_3","t":1,"dir":[0.725811,0.108844,-0.679229],"socket":"leg_f_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"hind","preset":"piece","params":{"piece":"lioness_leg_hl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"root","t":0,"dir":[0.945616,-0.029639,0.323932],"socket":"leg_h_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"neck","preset":"piece","params":{"piece":"lioness_neck","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_3","t":1,"dir":[0,0.998587,-0.053148],"socket":"neck"},"mirror":false,"color":null,"colors":{},"ik":{"on":true},"roles":{}},{"id":"head","preset":"piece","params":{"piece":"stylized_pigeon_head","scale":0.8,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"neck_2","t":1,"dir":[0,0.999946,-0.010382]},"mirror":false,"color":null,"colors":{},"ik":{"on":false},"roles":{}},{"id":"wing","preset":"piece","params":{"piece":"kekos_horses_pegasus_single_wing_l","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_3","t":0.4,"dir":[0.447214,0.149129,-0.881907]},"mirror":"x","color":null,"colors":{},"ik":{"on":false},"roles":{}}],"pieces":{"lioness_torso":{"hash":"eb6e6a0a","file":"/soma/parts/catalog/torso/lioness_torso.somapart"},"lioness_leg_fl":{"hash":"be49e37d","file":"/soma/parts/catalog/leg/lioness_leg_fl.somapart"},"lioness_leg_hl":{"hash":"990e7970","file":"/soma/parts/catalog/leg/lioness_leg_hl.somapart"},"lioness_neck":{"hash":"35f8006f","file":"/soma/parts/catalog/neck/lioness_neck.somapart"},"stylized_pigeon_head":{"hash":"09148304","file":"/soma/parts/catalog/head/stylized_pigeon_head.somapart"},"kekos_horses_pegasus_single_wing_l":{"hash":"90cccdc6","file":"/soma/parts/catalog/wing/kekos_horses_pegasus_single_wing_l.somapart"}},"roles":{},"soft":{},"material":{},"settings":{"gait":"griffin_walk","pattern":"auto","slack":0.05,"center":true,"face_roles":true,"soft_roles":true,"body":{"turn_rate":2.62,"max_speed":2.29},"physics":"auto","traits":{"tail":1.6,"stabilise":0.9,"ears":1.2},"flight":"auto","wave":"auto","sdf":{},"vehicle":"auto","aircraft":"auto","rotors":"auto"},"ui":{"library":{"built_from":"pieces","kind":"mixed","species":"griffin","sources":[{"uid":"e33051ad558f4b15bdc8f9e34bdaca41","title":"Lioness"},{"uid":"fb285d61e9034b199ca78718f518c885","title":"Stylized pigeon"},{"uid":"552165a3f7e0441ba78f84e00b919ee7","title":"KEKOS Horses   Pegasus [Single Character]"}],"recipe":"soma/creator/saved/griffin.creator.json"}}};
return {
  name: "griffin", max: 16,
  family: { faction: "animal", kind: "animal", hp: 32 },
  nav: { agent: { name: "griffin", radius: 0.37, height: 1.08, step: 0.2, slope: 35, drop: 0.29 } },
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
      ["health", { hp: 32 }],
      ["flee", { speed: 2.75, distance: 9 }],
      ["curious", { approach: 0.3, cooldown: 20, near: 1.1 }],
      ["idle_life", { clip_look: "griffin_idle", clip_stretch: "griffin_idle_2", clip_shift: "griffin_idle", clip_sit: "griffin_idle" }],
      ["injured", { clip_flinch: "" }],
      ["wander", { speed: 1.03, near: 0.5 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "griffin", select: [ld.node("flee"), ld.node("curious"), ld.node("idle_life"), ld.node("wander")] };
      return { tree: tree };
    }
  }
};
