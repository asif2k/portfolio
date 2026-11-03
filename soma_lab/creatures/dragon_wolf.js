// dragon_wolf: in soma's one form of a creature file (soma/creature_file.js): `body` is the creature as it was made, the rest is who it is to the others (family, nav, abilities) and its mind: the blocks of soma/world/blocks/ it loads by name and
// its tree. The old worker of this file is left out; the mind below is the default of a creature of its kind (flyer): write the creature's own in `mind`.
// dragon_wolf: a creature MADE OF THE PARTS CATALOGUE'S PIECES (mixed, dragon wolf): built by soma/tools/piece_creatures.js from its recipe soma/creator/saved/dragon_wolf.creator.json (the recipe is the source of truth:
// `node soma/tools/piece_creatures.js regenerate dragon_wolf` makes this file again after a piece of the catalogue is built again). The creator studio opens it for modification: /soma/soma_creator_studio_demo.jh?creator=/soma/creatures/dragon_wolf.js
// CREDITS: the pieces were cut out of these models of the rigged corpus (D:\work\glb_skinned_meshes: the corpus keeps no author or licence fields; title and uid as the corpus has them):
//   "Eurasian Gray Wolf" (uid 953b63602c9146abbdd84fc9091dfb09, mammals_wild/953b63602c9146abbdd84fc9091dfb09_Eurasian_Gray_Wolf.glb): eurasian_gray_wolf_torso, eurasian_gray_wolf_leg_fl, eurasian_gray_wolf_leg_hl, eurasian_gray_wolf_neck, eurasian_gray_wolf_head
//   "MOUNTAIN DRAGON ANIMATIONS" (uid 347cae9f87104374bc3ac554d9d3fd6e, dragons/347cae9f87104374bc3ac554d9d3fd6e_MOUNTAIN_DRAGON_ANIMATIONS.glb): mountain_dragon_tail
//   "Cartoon Brass Dragon Animated Low poly 3D Model" (uid 04e5798e14d64a76995c903b4c46f9c1, dragons/04e5798e14d64a76995c903b4c46f9c1_Cartoon_Brass_Dragon_Animated_Low_poly_3D_Model.glb): dragon_wing_l
"use strict";
// dragon_wolf: a dragon wolf: the gray wolf's torso, legs, neck and head, a cartoon dragon's wings and a mountain dragon's spiked tail. Made by the creature creator (soma/creator/creator.js, SOMA.md "The creator") from the `creator` object at the end of this file:
// the studio opens it again from that object (creator.from_definition). ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature. Metres, +x to its left, +y up, +z forward.
const skeleton = [
  {"name":"root","parent":null,"head":[0,0.64643,-0.2651],"tail":[0,0.6324,-0.12183]},
  {"name":"torso_spine_1","parent":"root","head":[0,0.6324,-0.12183],"tail":[0,0.6255,0.02196]},
  {"name":"torso_spine_2","parent":"torso_spine_1","head":[0,0.6255,0.02196],"tail":[0,0.62576,0.16592]},
  {"name":"torso_spine_3","parent":"torso_spine_2","head":[0,0.62576,0.16592],"tail":[0,0.63318,0.30968]},
  {"name":"torso_spine_4","parent":"torso_spine_3","head":[0,0.63318,0.30968],"tail":[0,0.67182,0.39779]},
  {"name":"torso_clavicle_l","parent":"torso_spine_4","head":[0.08561,0.54764,0.36145],"tail":[0.08561,0.54864,0.36145]},
  {"name":"torso_clavicle_r","parent":"torso_spine_4","head":[-0.08561,0.54764,0.36145],"tail":[-0.08561,0.54864,0.36145]},
  {"name":"fore_thigh_l","parent":"torso_spine_4","head":[0.11046,0.54764,0.36145],"tail":[0.11046,0.34995,0.30246],"mirror":"x"},
  {"name":"fore_shin_l","parent":"fore_thigh_l","head":[0.11046,0.34995,0.30246],"tail":[0.11046,0.14132,0.31648],"mirror":"x"},
  {"name":"fore_cannon_l","parent":"fore_shin_l","head":[0.11046,0.14132,0.31648],"tail":[0.11046,0.04396,0.33863],"mirror":"x"},
  {"name":"fore_foot_l","parent":"fore_cannon_l","head":[0.11046,0.04396,0.33863],"tail":[0.11046,0.02861,0.36574],"mirror":"x"},
  {"name":"fore_toe_l","parent":"fore_foot_l","head":[0.11046,0.02861,0.36574],"tail":[0.11046,0.00013,0.36574],"mirror":"x"},
  {"name":"hind_thigh_l","parent":"root","head":[0.11046,0.61579,-0.3124],"tail":[0.11046,0.37233,-0.28859],"mirror":"x"},
  {"name":"hind_shin_l","parent":"hind_thigh_l","head":[0.11046,0.37233,-0.28859],"tail":[0.11046,0.20213,-0.3899],"mirror":"x"},
  {"name":"hind_cannon_l","parent":"hind_shin_l","head":[0.11046,0.20213,-0.3899],"tail":[0.11046,0.04793,-0.33863],"mirror":"x"},
  {"name":"hind_foot_l","parent":"hind_cannon_l","head":[0.11046,0.04793,-0.33863],"tail":[0.11046,0.03559,-0.31079],"mirror":"x"},
  {"name":"hind_toe_l","parent":"hind_foot_l","head":[0.11046,0.03559,-0.31079],"tail":[0.11046,-0.00032,-0.31079],"mirror":"x"},
  {"name":"neck_1","parent":"torso_spine_4","head":[0,0.67182,0.39779],"tail":[0,0.70689,0.4931]},
  {"name":"neck_2","parent":"neck_1","head":[0,0.70689,0.4931],"tail":[0,0.72994,0.58766]},
  {"name":"head_head","parent":"neck_2","head":[0,0.72994,0.58766],"tail":[0.04441,0.80604,0.77007]},
  {"name":"head_head_2","parent":"head_head","head":[0,0.71534,0.67678],"tail":[0,0.56528,0.82966]},
  {"name":"head_head_3","parent":"head_head_2","head":[0,0.56528,0.82966],"tail":[0,0.56628,0.82966]},
  {"name":"head_jaw","parent":"head_head_2","head":[0,0.71666,0.66468],"tail":[0,0.71766,0.66468]},
  {"name":"head_jaw_2","parent":"head_head_2","head":[0,0.71534,0.67678],"tail":[0,0.71634,0.67678]},
  {"name":"head_lid_l","parent":"head_head","head":[0.05362,0.77396,0.74937],"tail":[0.05362,0.77496,0.74937]},
  {"name":"head_lid_2_l","parent":"head_head","head":[0.05362,0.77396,0.74937],"tail":[0.05362,0.77496,0.74937]},
  {"name":"head_nose","parent":"head_head","head":[0,0.71528,0.88857],"tail":[0,0.71628,0.88857]},
  {"name":"head_head_b1_l","parent":"head_head","head":[0.03005,0.68411,0.86494],"tail":[0.03005,0.68511,0.86494]},
  {"name":"head_head_b1_b1_l","parent":"head_head_b1_l","head":[0.03005,0.68411,0.86494],"tail":[0.03005,0.68511,0.86494]},
  {"name":"head_mouth_l","parent":"head_head","head":[0.05143,0.64747,0.76938],"tail":[0.05143,0.64847,0.76938]},
  {"name":"head_brow_l","parent":"head_head","head":[0.04441,0.80604,0.77007],"tail":[0.04441,0.80704,0.77007]},
  {"name":"head_ear_l","parent":"head_head","head":[0.09146,0.84692,0.63029],"tail":[0.09146,0.84792,0.63029]},
  {"name":"head_lid_r","parent":"head_head","head":[-0.05362,0.77396,0.74937],"tail":[-0.05362,0.77496,0.74937]},
  {"name":"head_lid_2_r","parent":"head_head","head":[-0.05362,0.77396,0.74937],"tail":[-0.05362,0.77496,0.74937]},
  {"name":"head_brow_r","parent":"head_head","head":[-0.04441,0.80604,0.77007],"tail":[-0.04441,0.80704,0.77007]},
  {"name":"head_ear_r","parent":"head_head","head":[-0.09146,0.84692,0.63029],"tail":[-0.09146,0.84792,0.63029]},
  {"name":"head_head_b1_r","parent":"head_head","head":[-0.03005,0.68411,0.86494],"tail":[-0.03005,0.68511,0.86494]},
  {"name":"head_head_b1_b1_r","parent":"head_head_b1_r","head":[-0.03005,0.68411,0.86494],"tail":[-0.03005,0.68511,0.86494]},
  {"name":"head_mouth_r","parent":"head_head","head":[-0.05143,0.64747,0.76938],"tail":[-0.05143,0.64847,0.76938]},
  {"name":"head_head_b2","parent":"head_head","head":[0,0.62857,0.61246],"tail":[0,0.62957,0.61246]},
  {"name":"head_head_b3","parent":"head_head","head":[0,0.74947,0.58054],"tail":[0,0.75047,0.58054]},
  {"name":"head_head_b4","parent":"head_head","head":[0,0.72994,0.58766],"tail":[0,0.73094,0.58766]},
  {"name":"tail_1","parent":"root","head":[0,0.72363,-0.4129],"tail":[0,0.72363,-0.52298]},
  {"name":"tail_2","parent":"tail_1","head":[0,0.72363,-0.52298],"tail":[0,0.72539,-0.63352]},
  {"name":"tail_3","parent":"tail_2","head":[0,0.72539,-0.63352],"tail":[0,0.72522,-0.69378]},
  {"name":"tail_4","parent":"tail_3","head":[0,0.72522,-0.69378],"tail":[0,0.72676,-0.75842]},
  {"name":"tail_5","parent":"tail_4","head":[0,0.72676,-0.75842],"tail":[0,0.72786,-0.81597]},
  {"name":"tail_6","parent":"tail_5","head":[0,0.72786,-0.81597],"tail":[0,0.72939,-0.87644]},
  {"name":"tail_7","parent":"tail_6","head":[0,0.72939,-0.87644],"tail":[0,0.7308,-0.93453]},
  {"name":"tail_8","parent":"tail_7","head":[0,0.7308,-0.93453],"tail":[0,0.73389,-0.98976]},
  {"name":"tail_9","parent":"tail_8","head":[0,0.73389,-0.98976],"tail":[0,0.73728,-1.05531]},
  {"name":"tail_10","parent":"tail_9","head":[0,0.73728,-1.05531],"tail":[0,0.74007,-1.12766]},
  {"name":"tail_11","parent":"tail_10","head":[0,0.74007,-1.12766],"tail":[0,0.74017,-1.12766]},
  {"name":"wing_upper_l","parent":"torso_spine_3","head":[0.01629,0.78774,0.31488],"tail":[0.13071,0.84007,0.20664],"mirror":"x"},
  {"name":"wing_fore_l","parent":"wing_upper_l","head":[0.13071,0.84007,0.20664],"tail":[0.28134,0.91842,0.10369],"mirror":"x"},
  {"name":"wing_hand_l","parent":"wing_fore_l","head":[0.28134,0.91842,0.10369],"tail":[0.28134,0.9189,0.10369],"mirror":"x"},
];
const rig = {
  joints: [
    {"bone":"fore_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"fore_shin_l","kind":"hinge","axis":[-1,0,0],"range":[-26,120],"mirror":"x"},
    {"bone":"fore_cannon_l","kind":"hinge","axis":[-1,0,0],"range":[-15,106],"mirror":"x"},
    {"bone":"fore_foot_l","kind":"ball","fwd":30,"back":30,"lat":15,"twist":15,"mirror":"x"},
    {"bone":"hind_thigh_l","kind":"ball","fwd":70,"back":60,"out":30,"in":20,"twist":20,"mirror":"x"},
    {"bone":"hind_shin_l","kind":"hinge","axis":[1,0,0],"range":[-42,104],"mirror":"x"},
    {"bone":"hind_cannon_l","kind":"hinge","axis":[-1,0,0],"range":[-55,66],"mirror":"x"},
    {"bone":"hind_foot_l","kind":"ball","fwd":30,"back":30,"lat":15,"twist":15,"mirror":"x"},
    {"bone":"neck_1","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
    {"bone":"neck_2","kind":"ball","fwd":50,"back":50,"lat":50,"twist":20},
    {"bone":"head_head_2","kind":"hinge","axis":[1,0,0],"range":[-5,35]},
    {"bone":"tail_1","kind":"ball","fwd":15,"back":15,"lat":15,"twist":20},
    {"bone":"tail_2","kind":"ball","fwd":15,"back":15,"lat":15,"twist":20},
    {"bone":"tail_3","kind":"ball","fwd":15,"back":15,"lat":15,"twist":20},
    {"bone":"tail_4","kind":"ball","fwd":15,"back":15,"lat":15,"twist":20},
    {"bone":"tail_5","kind":"ball","fwd":15,"back":15,"lat":15,"twist":20},
    {"bone":"tail_6","kind":"ball","fwd":15,"back":15,"lat":15,"twist":20},
    {"bone":"tail_7","kind":"ball","fwd":15,"back":15,"lat":15,"twist":20},
    {"bone":"tail_8","kind":"ball","fwd":15,"back":15,"lat":15,"twist":20},
    {"bone":"tail_9","kind":"ball","fwd":15,"back":15,"lat":15,"twist":20},
    {"bone":"tail_10","kind":"ball","fwd":15,"back":15,"lat":15,"twist":20},
  ],
  chains: [
    {"name":"fore_l","bones":["fore_thigh_l","fore_shin_l","fore_cannon_l"],"solver":"z_leg","tip":"fore_foot_l","pole":[0,0.045,-0.999],"pole_w":1,"mirror":"x"},
    {"name":"hind_l","bones":["hind_thigh_l","hind_shin_l","hind_cannon_l"],"solver":"z_leg","tip":"hind_foot_l","pole":[0,-0.046,0.999],"pole_w":1,"mirror":"x"},
    {"name":"neck","bones":["neck_1","neck_2"]},
    {"name":"tail","bones":["tail_1","tail_2","tail_3","tail_4","tail_5","tail_6","tail_7","tail_8","tail_9","tail_10"]},
  ],
};
const legs = {"legs":[{"chain":"hind_l","mirror":"x","foot_height":0.04793},{"chain":"fore_l","mirror":"x","foot_height":0.04376}],"gait":{"from":"wolf_walk","ride":0.63151}};
const body = {"gravity":9.8,"turn_rate":2.74,"max_speed":1.12};
const roles = {"hips":"root","spine":["torso_spine_1","torso_spine_2","torso_spine_3","torso_spine_4"],"neck":["neck_1","neck_2"],"head":"head_head","lids":["head_lid_l","head_lid_2_l","head_lid_r","head_lid_2_r"],"ears":[["head_ear_l"],["head_ear_r"]],"nose":"head_nose","jaw":"head_head_2","tail":["tail_1","tail_2","tail_3","tail_4","tail_5","tail_6","tail_7","tail_8","tail_9","tail_10","tail_11"],"brows":["head_brow_l","head_brow_r"],"mouth":{"corners":["head_head_3","head_mouth_l","head_mouth_r"]}};
const traits = {"tail":1.2,"ears":1.2,"stabilise":0.85,"wander":1.5};
const physics = {"mass":119.342,"shapes":[{"id":"body","shape":"capsule","a":[0.00007,0.6048,-0.27718],"b":[0.00007,0.6048,0.33699],"radius":0.168,"bone":"root"},{"id":"head","shape":"sphere","center":[-0.00004,0.73348,0.73605],"radius":0.195,"bone":"head_head"},{"id":"fore_l","shape":"capsule","a":[0.11046,0.49611,0.36145],"b":[0.11046,0.06183,0.33863],"radius":0.046,"mirror":"x"},{"id":"hind_l","shape":"capsule","a":[0.11046,0.55527,-0.3124],"b":[0.11046,0.07262,-0.33863],"radius":0.059,"mirror":"x"}]};
const parts = [
  {"id":"torso_0","shape":"volume","volume":"eurasian_gray_wolf_torso","origin":[0,0.64643,-0.2651],"rotate":[0,0,0],"scale":1,"bone":"root","bone_map":{"@host":"root","torso_pelvis":"root","torso_spine_1":"torso_spine_1","torso_spine_2":"torso_spine_2","torso_spine_3":"torso_spine_3","torso_spine_4":"torso_spine_4","torso_clavicle_l":"torso_clavicle_l","torso_clavicle_r":"torso_clavicle_r","@neck":"neck_1","@leg_f_l":"fore_thigh_l","@leg_f_r":"fore_thigh_r","@leg_h_l":"hind_thigh_l","@leg_h_r":"hind_thigh_r","@tail":"tail_1"},"roughness":0.5,"metal":0.3},
  {"id":"fore_thigh_0","shape":"volume","volume":"eurasian_gray_wolf_leg_fl","origin":[0.11046,0.54764,0.36145],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"torso_spine_4","bone_map":{"@host":"torso_spine_4","leg_thigh_l":"fore_thigh_l","leg_shin_l":"fore_shin_l","leg_cannon_l":"fore_cannon_l","leg_foot_l":"fore_foot_l","leg_toe_l":"fore_toe_l","neck_a01_05":"neck_1","humerus_r_01_031":"fore_thigh_r"},"blend":0.02283,"blend_mode":"cubic","roughness":0.5,"metal":0.3},
  {"id":"hind_thigh_0","shape":"volume","volume":"eurasian_gray_wolf_leg_hl","origin":[0.11046,0.61579,-0.3124],"rotate":[0,0,0],"scale":1,"mirror":"x","bone":"root","bone_map":{"@host":"root","leg_thigh_l":"hind_thigh_l","leg_shin_l":"hind_shin_l","leg_cannon_l":"hind_cannon_l","leg_foot_l":"hind_foot_l","leg_toe_l":"hind_toe_l","spine_a01_01":"torso_spine_1","spine_b01_02":"torso_spine_2"},"blend":0.02951,"blend_mode":"cubic","roughness":0.5,"metal":0.3},
  {"id":"neck_1_0","shape":"volume","volume":"eurasian_gray_wolf_neck","origin":[0,0.67182,0.39779],"rotate":[0,0,0],"scale":1,"bone":"torso_spine_4","bone_map":{"@host":"torso_spine_4","neck_1":"neck_1","neck_2":"neck_2","@head01":"head_head","humerus_l_01_025":"fore_thigh_l","humerus_r_01_031":"fore_thigh_r"},"blend":0.05364,"blend_mode":"cubic","roughness":0.5,"metal":0.3},
  {"id":"head_head_0","shape":"volume","volume":"eurasian_gray_wolf_head","origin":[0,0.72994,0.58766],"rotate":[0,0,0],"scale":1,"bone":"neck_2","bone_map":{"@host":"neck_2","head_head":"head_head","head_head_2":"head_head_2","head_head_3":"head_head_3","head_jaw":"head_jaw","head_jaw_2":"head_jaw_2","head_lid_l":"head_lid_l","head_lid_2_l":"head_lid_2_l","head_nose":"head_nose","head_head_b1_l":"head_head_b1_l","head_head_b1_b1_l":"head_head_b1_b1_l","head_mouth_l":"head_mouth_l","head_brow_l":"head_brow_l","head_ear_l":"head_ear_l","head_lid_r":"head_lid_r","head_lid_2_r":"head_lid_2_r","head_brow_r":"head_brow_r","head_ear_r":"head_ear_r","head_head_b1_r":"head_head_b1_r","head_head_b1_b1_r":"head_head_b1_b1_r","head_mouth_r":"head_mouth_r","head_head_b2":"head_head_b2","head_head_b3":"head_head_b3","head_head_b4":"head_head_b4"},"blend":0.04682,"blend_mode":"cubic","roughness":0.5,"metal":0.3},
  {"id":"tail_1_0","shape":"volume","volume":"mountain_dragon_tail","origin":[0,0.72363,-0.4129],"rotate":[-2.60901,0,0],"scale":0.09954,"bone":"root","bone_map":{"@host":"root","tail_1":"tail_1","tail_2":"tail_2","tail_3":"tail_3","tail_4":"tail_4","tail_5":"tail_5","tail_6":"tail_6","tail_7":"tail_7","tail_8":"tail_8","tail_9":"tail_9","tail_10":"tail_10","tail_11":"tail_11"},"blend":0.0181,"blend_mode":"cubic"},
];
const sdf = Object.assign({"cell":0.01939,"decimate":{"ratio":0.4},"skin":{"falloff":1.5,"seam":1},"shade":{"ao":0.45,"ao_radius":0.05817,"tone":0.2,"color_blend":1},"volumes":{"eurasian_gray_wolf_torso":{"hash":"2fe47959","piece":"/soma/parts/catalog/torso/eurasian_gray_wolf_torso.somapart","bake":{"cell":0.011,"band":6}},"eurasian_gray_wolf_leg_fl":{"hash":"5f339a11","piece":"/soma/parts/catalog/leg/eurasian_gray_wolf_leg_fl.somapart","bake":{"cell":0.011,"band":6}},"eurasian_gray_wolf_leg_hl":{"hash":"a9d8b085","piece":"/soma/parts/catalog/leg/eurasian_gray_wolf_leg_hl.somapart","bake":{"cell":0.011,"band":6}},"eurasian_gray_wolf_neck":{"hash":"2abf8384","piece":"/soma/parts/catalog/neck/eurasian_gray_wolf_neck.somapart","bake":{"cell":0.011,"band":6}},"eurasian_gray_wolf_head":{"hash":"a4ef708b","piece":"/soma/parts/catalog/head/eurasian_gray_wolf_head.somapart","bake":{"cell":0.011,"band":6}},"mountain_dragon_tail":{"hash":"54749f0f","piece":"/soma/parts/catalog/tail/mountain_dragon_tail.somapart","bake":{"cell":0.125,"band":6}},"dragon_wing_l":{"hash":"2df49706","piece":"/soma/parts/catalog/wing/dragon_wing_l.somapart"}},"meshes":[{"id":"wing_upper_0","volume":"dragon_wing_l","origin":[0.01629,0.78774,0.31488],"rotate":[0,0,0],"scale":0.48512,"mirror":"x","bone":"torso_spine_3","bone_map":{"@host":"torso_spine_3","wing_upper_l":"wing_upper_l","wing_fore_l":"wing_fore_l","wing_hand_l":"wing_hand_l"}}]}, { parts: parts });
const flight = {"model":"wing","stall_speed":3.174,"cruise_speed":4.762,"max_speed":7.936,"thrust":0.5,"max_bank":1,"max_pitch":0.7,"clearance":1.067};
const wings = {"wings":[{"bone":"wing_upper_l","tip":"wing_fore_l","mirror":"x"}],"fold":80,"tip_fold":25,"droop":10,"amplitude":35,"tip_amplitude":25,"hz":3.024};
const material = {"roughness":0.72,"metal":0};
const creator = {"format":"soma.creator","version":1,"name":"dragon_wolf","description":"a dragon wolf: the gray wolf's torso, legs, neck and head, a cartoon dragon's wings and a mountain dragon's spiked tail","torso":{"shape":"piece","size":[0.36553,0.49933,0.95046],"axis":"z","round":0,"color":[0.171,0.141,0.114],"piece":"eurasian_gray_wolf_torso","scale":1},"parts":[{"id":"fore","preset":"piece","params":{"piece":"eurasian_gray_wolf_leg_fl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_4","t":0.13571,"dir":[0.744245,0,0.667907],"socket":"leg_f_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"hind","preset":"piece","params":{"piece":"eurasian_gray_wolf_leg_hl","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"root","t":0,"dir":[0.890763,-0.355536,0.283083],"socket":"leg_h_l"},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"walk":true,"roles":{}},{"id":"neck","preset":"piece","params":{"piece":"eurasian_gray_wolf_neck","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_4","t":1,"dir":[0,0.998159,0.060657],"socket":"neck"},"mirror":false,"color":null,"colors":{},"ik":{"on":true},"roles":{}},{"id":"head","preset":"piece","params":{"piece":"eurasian_gray_wolf_head","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"neck_2","t":1,"dir":[0.219219,0.963807,-0.15172],"socket":"neck.head01"},"mirror":false,"color":null,"colors":{},"ik":{"on":false},"roles":{}},{"id":"tail","preset":"piece","params":{"piece":"mountain_dragon_tail","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"root","t":0,"dir":[0,-0.927273,-0.374385],"socket":"tail"},"mirror":false,"color":null,"colors":{},"ik":{"on":true},"roles":{}},{"id":"wing","preset":"piece","params":{"piece":"dragon_wing_l","scale":1,"blend":-1,"inset":-1,"turn_x":0,"turn_y":0,"turn_z":0,"flap":true,"thin":"auto","roughness":-1,"metal":-1},"attach":{"bone":"torso_spine_3","t":0.5,"dir":[0.447214,0.046103,-0.893238]},"mirror":"x","color":null,"colors":{},"ik":{"on":true},"roles":{}}],"pieces":{"eurasian_gray_wolf_torso":{"hash":"2fe47959","file":"/soma/parts/catalog/torso/eurasian_gray_wolf_torso.somapart"},"eurasian_gray_wolf_leg_fl":{"hash":"5f339a11","file":"/soma/parts/catalog/leg/eurasian_gray_wolf_leg_fl.somapart"},"eurasian_gray_wolf_leg_hl":{"hash":"a9d8b085","file":"/soma/parts/catalog/leg/eurasian_gray_wolf_leg_hl.somapart"},"eurasian_gray_wolf_neck":{"hash":"2abf8384","file":"/soma/parts/catalog/neck/eurasian_gray_wolf_neck.somapart"},"eurasian_gray_wolf_head":{"hash":"a4ef708b","file":"/soma/parts/catalog/head/eurasian_gray_wolf_head.somapart"},"mountain_dragon_tail":{"hash":"54749f0f","file":"/soma/parts/catalog/tail/mountain_dragon_tail.somapart"},"dragon_wing_l":{"hash":"2df49706","file":"/soma/parts/catalog/wing/dragon_wing_l.somapart"}},"roles":{},"soft":{},"material":{},"settings":{"gait":"auto","pattern":"auto","slack":0.05,"center":true,"face_roles":true,"soft_roles":true,"body":{"turn_rate":2.74,"max_speed":1.12},"physics":"auto","traits":{"tail":1.2,"ears":1.2,"stabilise":0.85,"wander":1.5},"flight":"auto","wave":"auto","sdf":{},"vehicle":"auto","aircraft":"auto","rotors":"auto"},"ui":{"library":{"built_from":"pieces","kind":"mixed","species":"dragon wolf","sources":[{"uid":"953b63602c9146abbdd84fc9091dfb09","title":"Eurasian Gray Wolf"},{"uid":"347cae9f87104374bc3ac554d9d3fd6e","title":"MOUNTAIN DRAGON ANIMATIONS"},{"uid":"04e5798e14d64a76995c903b4c46f9c1","title":"Cartoon Brass Dragon Animated Low poly 3D Model"}],"recipe":"soma/creator/saved/dragon_wolf.creator.json"}}};
return {
  name: "dragon_wolf", max: 16,
  family: { faction: "animal", kind: "animal", hp: 46 },
  nav: { agent: { name: "dragon_wolf", radius: 0.45, height: 1.02, step: 0.18, slope: 35, drop: 0.28 } },
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
      ["health", { hp: 46 }],
      ["fly", { alt: 10, cruise: 4.8, climb: 1.9, sink: 1.4, legs: 3, min_leg: 15, roam: 60, near: 2.9, rest_min: 8, rest_max: 20 }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "dragon_wolf", select: [ld.node("fly")] };
      return { tree: tree };
    }
  }
};
