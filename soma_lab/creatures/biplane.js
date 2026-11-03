"use strict";
// biplane: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A propeller aeroplane: takes off, flies a round of places far apart at 22 m/s, glides down to the runway and lands.
// biplane: a small propeller aeroplane, 3.7 m long, 4.3 m across the upper wing. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, body, vehicle, aircraft, couplers, physics, sdf }.
// Metres, +x to its left, +y up, +z forward, the wheels on y = 0. An AIRCRAFT (soma_aircraft.cpp): a lifting body whose forces come from the airflow over it (lift and drag with a stall, a side force, thrust along the nose), flown by a PILOT
// from the wish (`sp.set_intent`: a velocity, `sp.set_climb`: a climb; the lab's brains) or with a STICK (`sp.set_controls`: throttle, brake, steer, handbrake, pitch, roll, yaw, flaps). It has NO LEGS: on the ground it is a car on its
// three wheels (the vehicle's: the nose wheel steers with the rudder), it rolls with full power, rotates at 1.15 stall speeds, lifts off when the wing carries the weight, turns in a bank, lands when its wheels reach the floor and brakes
// when it is asked to stay. Its ailerons, elevator and rudder move with the stick and its propeller turns with the engine.
const bones = [
  { name: "root", head: [0, 0.65, 0], tail: [0, 0.65, 0.5] },
  { name: "aileron_l", parent: "root", head: [0.7, 1.12, -0.28], tail: [2.1, 1.12, -0.28], mirror: "x" },       // (a surface turns about its own bone: the hinge line is the bone)
  { name: "elevator", parent: "root", head: [-0.75, 0.8, -1.86], tail: [0.75, 0.8, -1.86] },
  { name: "rudder", parent: "root", head: [0, 0.82, -1.9], tail: [0, 1.62, -1.9] },
  { name: "prop", parent: "root", head: [0, 0.65, 1.32], tail: [0, 0.65, 1.46] },
  { name: "wheel_n", parent: "root", head: [0, 0.25, 0.95], tail: [0, 0.35, 0.95] },                          // (a wheel is a bone whose HEAD is the hub: the radius is the hub's height)
  { name: "wheel_m_l", parent: "root", head: [0.62, 0.25, 0.2], tail: [0.62, 0.35, 0.2], mirror: "x" },
];
// THE BODY: the mover of the root on the ground. The gravity (m/s^2) is the g of the lift and of the thrust; step / radius: the highest prop of the physics world its wheels climb and how far short of a wall it stops
const body = { max_speed: 38, accel: 6, turn_rate: 3, gravity: 19.8, step: 0.2, radius: 0.7 };
// THE LANDING GEAR: a car on three wheels (the nose wheel steers: it is steered by the rudder of the stick, the mains do not and have no handbrake); top speed 38 m/s, brakes 4.5 m/s^2, grip 8, a lock of 0.5 rad that halves at 12 m/s
const vehicle = { model: "car", wheels: [{ bone: "wheel_n", steer: 1 }, { bone: "wheel_m_l", steer: 0, handbrake: 0 }, { bone: "wheel_m_r", steer: 0, handbrake: 0 }], max_steer: 0.5, steer_rate: 6, top_speed: 38, reverse: 0.1, accel: 3.8, brake: 4.5, grip: 8, roll: 0.5, steer_speed: 12, travel: 0.08 };
// THE AIRCRAFT: stall 12 m/s, cruise 20, top 38; thrust 0.36 g at rest, fading out at 60 m/s; cl_max 1.6 (a high-lift wing: it flies slowly); rotation 0.2 rad (the nose comes up 11 degrees for the take-off); the airframe's centre 70 cm over
// the root; roll 2.4, pitch 1.1, yaw 0.7 rad/s at full stick; realism 0.4 (a player's stick has 60 % of the arcade help: levelling, stall protection). Four surfaces: the ailerons (gain 0.4: 23 degrees at full roll), the elevator (0.4) and the
// rudder (-0.45: negative so that it turns the right way); one propeller: the bone `prop`, spinning about the nose axis [0, 0, 1] at 130 rad/s at full throttle (15 % at idle)
const aircraft = { stall_speed: 12, cruise_speed: 20, max_speed: 38, thrust: 0.36, engine_speed: 60, cl_max: 1.6, rotation: 0.2, pivot: 0.7, rates: { roll: 2.4, pitch: 1.1, yaw: 0.7 }, realism: 0.4,
  surfaces: [{ bone: "aileron_l", control: "aileron", gain: 0.4 }, { bone: "aileron_r", control: "aileron", gain: 0.4 }, { bone: "elevator", control: "elevator", gain: 0.4 }, { bone: "rudder", control: "rudder", gain: -0.45 }],
  propellers: [{ bone: "prop", rpm: 130, axis: [0, 0, 1] }] };
// COUPLERS: hooks at the nose and the tail: it can tow or be towed on the ground
const couplers = { front: [0, 0.4, 1.4], rear: [0, 0.5, -2.0] };
const RED = [0.80, 0.14, 0.10, 1], CREAM = [0.93, 0.88, 0.74, 1], WOOD = [0.62, 0.42, 0.22, 1], DARK = [0.12, 0.12, 0.14, 1], STEEL = [0.62, 0.65, 0.70, 1], TYRE = [0.07, 0.07, 0.08, 1], GLASS = [0.45, 0.65, 0.85, 1], YELLOW = [0.95, 0.78, 0.15, 1];
const LEATHER = [0.42, 0.25, 0.13, 1], BRASS = [0.80, 0.62, 0.24, 1], BURNT = [0.28, 0.22, 0.20, 1], BLUE = [0.15, 0.24, 0.55, 1];
// THE BODY (sdf): a small WWI biplane, 3.7 m from the spinner to the rudder, 4.3 m across the upper wing. The parts stand on the creature's own bones by name, in MODEL space (the bind pose). What does not move (the fuselage, the cowl,
// both wings, the struts, the tail plane, the fin, the legs of the gear) is on `root`; the three control surfaces are on their bones with their LEADING EDGE on the bone (the hinge line: each panel turns about its own front edge), the
// propeller is centred on the nose axis (x = 0, y = 0.65), and each wheel is on its own bone with the tyre round about the axle (its lowest point is the floor) and a yellow spoke that is not symmetric about the axle, so that the turn shows.
// Nearly everything is an ISLAND (a part of an island never blends with another island's, it is meshed on a grid of its own and its vertices follow only the island's own bones, so a panel is a closed piece that turns without dragging
// the wing): the thin things (the wings are 7 cm thick, the control surfaces 4-5 cm, the struts 3 cm, the blades 2.4 cm) need a fine grid, and colours that must stay crisp (the red tips, the cream belly, a roundel, a spoke) an island of their own,
// because the simplification (a quadric edge collapse, ratio near 0 so that the `error` and `max_edge` of each island decide) spreads a colour over its big triangles. The default island is the fuselage alone.
// Shapes that are big and flat are boxes and ellipsoids (exact for the mesher: a loft of a wide chord has a box as deep as the chord, ten times the sampling); lofts are for what is thin. A loft along x takes `radii` = the half chord (z) and
// `radii_v` = the half thickness (y); along y `radii` = the half thickness (x) and `radii_v` = the half chord (z); along z the half width (x) and the half height (y).
const parts = [];
const sin = Math.sin, cos = Math.cos;
// a wing: a flat slab whose edges are as round as it is thick (a box, `xb` the half span of its straight part) with an elliptical end at each tip (an ellipsoid out to `span`). `from`: only the piece beyond that x (the tip, one side:
// mirrored); `proud`: it stands that much out of the wing under it (the red tip is a sheath on the cream wing)
const wing = function (o) {
  const pr = o.proud || 0, th = o.th + pr, hc = o.hc + pr, tip = o.from !== undefined;
  const b = { id: o.id, shape: "box", bone: "root", center: [tip ? (o.from + o.xb) / 2 : 0, o.y, o.zc], half: [tip ? (o.xb - o.from) / 2 : o.xb, th, hc], round: th, blend: 0.015, blend_mode: "cubic", color: o.color };
  const e = { id: o.id + "_end", shape: "ellipsoid", bone: "root", center: [o.xb, o.y, o.zc], radii: [o.span - o.xb + pr, th, hc], mirror: "x", blend: 0.015, blend_mode: "cubic", color: o.color };
  if (tip) b.mirror = "x";
  if (o.island) { b.island = o.island; e.island = o.island; }
  parts.push(b, e);
};
// a strut: a streamlined loft (a thin ellipse, `t` half thickness across, `c` half chord along z) from one point to another
const strut = function (id, island, a, b, t, c, color, mirror) {
  const p = { id: id, shape: "loft", bone: "root", island: island, points: [a, b], radii: [t, t], radii_v: [c, c], color: color };
  if (mirror) p.mirror = "x";
  parts.push(p);
};

// ---- the fuselage (the default island): stations [z, centre y, half width, half height]; the nose goes into the cowl (which is a little wider than it there), the tail ends at the rudder post (z = -1.9); a hump behind the pilot
const FUS = [[0.88, 0.65, 0.27, 0.26], [0.5, 0.645, 0.33, 0.31], [0.1, 0.635, 0.32, 0.30], [-0.3, 0.645, 0.26, 0.27], [-0.7, 0.68, 0.19, 0.20], [-1.1, 0.73, 0.13, 0.15], [-1.5, 0.77, 0.085, 0.11], [-1.86, 0.80, 0.045, 0.08]];
parts.push({ id: "body", shape: "loft", bone: "root", points: FUS.map(function (s) { return [0, s[1], s[0]]; }), radii: FUS.map(function (s) { return s[2]; }), radii_v: FUS.map(function (s) { return s[3]; }), square: 0.25, blend: 0.03, blend_mode: "cubic", color: RED });
// the cream belly: the lower part of a copy of the body, 12 mm proud (less and the body shows through its simplified mesh), cut flat at y = 0.58, the lower wing's middle (the wing is the line between the red and the cream); an island, so the
// edge is crisp; it thins out toward the tail where the fuselage rises over the cut
const BEL = [[0.98, 0.65, 0.29, 0.28]].concat(FUS.slice(1, 7).map(function (s) { return [s[0], s[1], s[2] + 0.012, s[3] + 0.012]; }));        // (it starts inside the cowl)
parts.push({ id: "belly", shape: "loft", bone: "root", island: "belly", points: BEL.map(function (s) { return [0, s[1], s[0]]; }), radii: BEL.map(function (s) { return s[2]; }), radii_v: BEL.map(function (s) { return s[3]; }), square: 0.25, color: CREAM });
parts.push({ id: "belly_cut", shape: "box", bone: "root", island: "belly", center: [0, 0.29, -0.5], half: [0.6, 0.29, 1.6], op: "intersect" });
parts.push({ id: "belly_slot", shape: "box", bone: "root", island: "belly", center: [0, 0.38, 0.95], half: [0.09, 0.2, 0.27], op: "subtract" });
parts.push({ id: "hump", shape: "ellipsoid", bone: "root", center: [0, 0.88, -0.74], radii: [0.12, 0.09, 0.2], blend: 0.05, blend_mode: "cubic", color: RED });
// the open cockpit: a dish cut in the top; what is in it is an island of its own (a colour inside a cut keeps the fuselage's red): a dark floor (a bowl cut flat), the seat and its back, and a small windscreen of glass in front
parts.push({ id: "cockpit", shape: "ellipsoid", bone: "root", center: [0, 0.91, -0.32], radii: [0.165, 0.15, 0.30], op: "subtract" });
parts.push({ id: "floor", shape: "ellipsoid", bone: "root", island: "cockpit", center: [0, 0.91, -0.32], radii: [0.15, 0.14, 0.285], color: DARK });
parts.push({ id: "floor_cut", shape: "box", bone: "root", island: "cockpit", center: [0, 1.2, -0.32], half: [0.4, 0.36, 0.4], op: "subtract" });
parts.push({ id: "seat", shape: "box", bone: "root", island: "cockpit", center: [0, 0.865, -0.37], half: [0.095, 0.03, 0.085], round: 0.02, color: LEATHER });
parts.push({ id: "seat_back", shape: "box", bone: "root", island: "cockpit", center: [0, 0.92, -0.49], half: [0.095, 0.075, 0.016], round: 0.012, color: LEATHER });
parts.push({ id: "screen", shape: "loft", bone: "root", island: "glass", points: [[-0.15, 0.985, -0.03], [0.15, 0.985, -0.03]], radii: [0.006, 0.006], radii_v: [0.065, 0.065], twist: [-25, -25], square: 1, color: GLASS });
// the engine cowl (an island): a steel ring round the nose with a recess in front, a dark engine face in it (an island, with the seven cylinders of a radial engine), a slot in the belly for the nose wheel (cut in every island it crosses)
parts.push({ id: "slot", shape: "box", bone: "root", center: [0, 0.38, 0.95], half: [0.09, 0.2, 0.27], op: "subtract" });
parts.push({ id: "cowl", shape: "cylinder", bone: "root", island: "cowl", center: [0, 0.65, 1.03], axis: "z", radius: 0.315, half: 0.255, round: 0.07, color: STEEL });
parts.push({ id: "cup", shape: "cylinder", bone: "root", island: "cowl", center: [0, 0.65, 1.31], axis: "z", radius: 0.25, half: 0.11, op: "subtract" });
parts.push({ id: "slot_cowl", shape: "box", bone: "root", island: "cowl", center: [0, 0.38, 0.95], half: [0.09, 0.2, 0.27], op: "subtract" });
parts.push({ id: "engine", shape: "cylinder", bone: "root", island: "engine", center: [0, 0.65, 1.185], axis: "z", radius: 0.243, half: 0.03, round: 0.01, color: DARK });
for (let i = 0; i < 7; i++) {                                        // the cylinders of the radial engine, spread over its face
  const a = (i + 0.5) / 7 * Math.PI * 2, ca = cos(a), sa = sin(a);
  parts.push({ id: "cylinder_" + i, shape: "capsule", bone: "root", island: "engine", a: [0.07 * ca, 0.65 + 0.07 * sa, 1.232], b: [0.2 * ca, 0.65 + 0.2 * sa, 1.232], radius: 0.026, color: STEEL });
}

// ---- the lower wing (an island), 3.8 m across, a chord of 0.64, at y = 0.58 so that the wheels (tyre top at y = 0.5) pass under it
wing({ id: "wing_low", island: "wing_low", y: 0.58, zc: 0.02, hc: 0.32, xb: 1.72, span: 1.9, th: 0.034, color: CREAM });

// ---- the upper wing: 4.3 m across, a chord of 0.94 (from z = 0.44 to -0.50); the ailerons' notch (from the hinge line aft: 2 cm of air in front of the panel), the pilot's notch in the middle of the trailing edge
wing({ id: "wing_up", island: "wing_up", y: 1.12, zc: -0.03, hc: 0.47, xb: 1.95, span: 2.15, th: 0.036, color: CREAM });
parts.push({ id: "ail_cut", shape: "box", bone: "root", island: "wing_up", center: [1.4, 1.12, -0.45], half: [0.68, 0.1, 0.185], mirror: "x", op: "subtract" });
parts.push({ id: "pilot_cut", shape: "box", bone: "root", island: "wing_up", center: [0, 1.12, -0.37], half: [0.2, 0.1, 0.27], round: 0.06, op: "subtract" });
// the red wing tips: a sheath on each wing's end (an island of their own: a colour that does not smear over the wing's big triangles), the upper ones cut like the wing
wing({ id: "tip_up", island: "tips", y: 1.12, zc: -0.03, hc: 0.47, xb: 1.95, span: 2.15, th: 0.036, color: RED, from: 1.84, proud: 0.006 });
wing({ id: "tip_low", island: "tips", y: 0.58, zc: 0.02, hc: 0.32, xb: 1.72, span: 1.9, th: 0.034, color: RED, from: 1.6, proud: 0.006 });
parts.push({ id: "tip_cut", shape: "box", bone: "root", island: "tips", center: [1.4, 1.12, -0.45], half: [0.68, 0.1, 0.185], mirror: "x", op: "subtract" });

// ---- the aileron (a panel behind the hinge line z = -0.28, 7 cm of chord less than the wing's tip; its outer end follows the round tip)
const AIL = [[0.76, -0.50], [1.8, -0.50], [1.95, -0.47], [2.04, -0.40]];
parts.push({ id: "aileron_l", shape: "loft", bone: "aileron_l", island: "ail", points: AIL.map(function (s) { return [s[0], 1.12, (-0.28 + s[1]) / 2]; }), radii: AIL.map(function (s) { return (-0.28 - s[1]) / 2; }), radii_v: [0.026, 0.026, 0.024, 0.022], square: 0.55, mirror: "x", color: RED });

// ---- the struts (wood): the interplane pair on each side, the cabane over the fuselage
strut("strut_f_l", "struts", [1.15, 0.58, 0.28], [1.25, 1.12, 0.28], 0.016, 0.04, WOOD, true);
strut("strut_r_l", "struts", [1.15, 0.58, -0.06], [1.25, 1.12, -0.06], 0.016, 0.035, WOOD, true);
strut("cabane_f_l", "struts", [0.13, 0.86, 0.33], [0.27, 1.12, 0.30], 0.016, 0.03, WOOD, true);
strut("cabane_r_l", "struts", [0.13, 0.86, 0.10], [0.27, 1.12, 0.10], 0.016, 0.03, WOOD, true);

// ---- the tail (an island: a red tail plane and fin 4.5 cm thick, the elevator and the rudder behind the hinge lines z = -1.86 and z = -1.9): flat slabs with round edges and elliptical tips, a quarter ellipse for the fin and the rudder
const tslab = function (id, island, bone, y, zc, hc, th, xb, rx, color, extra) {
  const b = { id: id, shape: "box", bone: bone, island: island, center: [0, y, zc], half: [xb, th, hc], round: th, color: color };
  const e = { id: id + "_end", shape: "ellipsoid", bone: bone, island: island, center: [xb, y, zc], radii: [rx, th, hc], mirror: "x", color: color };
  if (extra) { Object.assign(b, extra); Object.assign(e, extra); }
  parts.push(b, e);
};
parts.push({ id: "fin", shape: "ellipsoid", bone: "root", island: "tail", center: [0, 0.8, -1.9], radii: [0.026, 0.52, 0.5], color: RED });
parts.push({ id: "fin_cut_a", shape: "box", bone: "root", island: "tail", center: [0, 0.5, -1.9], half: [0.1, 0.3, 0.7], op: "subtract" });
parts.push({ id: "fin_cut_b", shape: "box", bone: "root", island: "tail", center: [0, 1.2, -2.2], half: [0.1, 0.8, 0.3], op: "subtract" });
tslab("tailplane", "tail", "root", 0.8, -1.659, 0.199, 0.0225, 0.70, 0.09, RED, { blend: 0.02, blend_mode: "cubic" });
tslab("elevator", "elev", "elevator", 0.8, -1.97, 0.11, 0.02, 0.70, 0.09, CREAM);
parts.push({ id: "rudder", shape: "ellipsoid", bone: "rudder", island: "rudd", center: [0, 0.835, -1.912], radii: [0.02, 0.78, 0.29], color: CREAM });
parts.push({ id: "rudder_cut_a", shape: "box", bone: "rudder", island: "rudd", center: [0, 0.4, -2.0], half: [0.1, 0.435, 0.5], op: "subtract" });
parts.push({ id: "rudder_cut_b", shape: "box", bone: "rudder", island: "rudd", center: [0, 1.0, -1.4], half: [0.1, 1.2, 0.512], op: "subtract" });

// ---- the engine's exhaust stubs: three on each side of the cowl, pointing out and back
[-15, -45, -75].forEach(function (deg, i) {
  const a = deg * Math.PI / 180, ca = cos(a), sa = sin(a), z = 1.0;
  parts.push({ id: "stub" + i, shape: "capsule", bone: "root", island: "exhaust", a: [0.30 * ca, 0.65 + 0.30 * sa, z], b: [0.40 * ca, 0.65 + 0.40 * sa, z - 0.09], radius: 0.024, mirror: "x", color: BURNT });
});

// ---- the propeller (an island on the bone `prop`, everything on the nose axis x = 0, y = 0.65): a shaft, a brass hub plate and spinner, two wooden blades with a pitch and yellow tips
parts.push({ id: "shaft", shape: "cylinder", bone: "prop", island: "prop", center: [0, 0.65, 1.26], axis: "z", radius: 0.03, half: 0.07, color: STEEL });
parts.push({ id: "hub_plate", shape: "cylinder", bone: "prop", island: "prop", center: [0, 0.65, 1.345], axis: "z", radius: 0.085, half: 0.02, round: 0.008, color: BRASS });
const BL = [[0.05, 0.040, 0.016, 30], [0.14, 0.050, 0.014, 24], [0.26, 0.062, 0.012, 18], [0.38, 0.066, 0.012, 14], [0.50, 0.060, 0.011, 11], [0.58, 0.050, 0.010, 9]];
[1, -1].forEach(function (s) {
  parts.push({ id: "blade_" + (s > 0 ? "a" : "b"), shape: "loft", bone: "prop", island: "prop", points: BL.map(function (b) { return [s * b[0], 0.65, 1.385]; }), radii: BL.map(function (b) { return b[2]; }), radii_v: BL.map(function (b) { return b[1]; }), twist: BL.map(function (b) { return b[3]; }), square: 0.5, color: WOOD });
  parts.push({ id: "tip_" + (s > 0 ? "a" : "b"), shape: "loft", bone: "prop", island: "prop", points: [0.5, 0.58].map(function (x) { return [s * x, 0.65, 1.385]; }), radii: [0.0125, 0.0115], radii_v: [0.0625, 0.0525], twist: [11, 9], square: 0.5, color: YELLOW });
});
parts.push({ id: "spinner", shape: "ellipsoid", bone: "prop", island: "prop", center: [0, 0.65, 1.385], radii: [0.075, 0.075, 0.10], color: BRASS });

// ---- the landing gear: the legs are on `root` (wood V struts to the axle, a tail skid, the nose fork in its slot), the wheels on their bones
[0.36, 0.04].forEach(function (z, i) {
  parts.push({ id: "leg" + i, shape: "loft", bone: "root", island: "gear", points: [[0.17, 0.46, z], [0.58, 0.26, 0.2]], radii: [0.018, 0.018], radii_v: [0.03, 0.03], color: WOOD, mirror: "x" });
});
parts.push({ id: "fork", shape: "capsule", bone: "root", island: "gear", a: [0.075, 0.6, 0.95], b: [0.075, 0.25, 0.95], radius: 0.013, mirror: "x", color: STEEL });
parts.push({ id: "skid", shape: "capsule", bone: "root", island: "gear", a: [0, 0.74, -1.72], b: [0, 0.57, -1.95], radius: 0.018, color: STEEL });
// a wheel: a tyre round the axle (radius 0.25: its lowest point is the floor), a steel hub, a dark cap, and one yellow spoke up from the hub (the mark that shows the turn)
const wheel = function (bone, island, X, zc, w, mirror) {
  const P = function (id, p) { p.id = id; p.bone = bone; p.island = island; if (mirror) p.mirror = "x"; parts.push(p); };
  P("tyre_" + bone, { shape: "cylinder", center: [X, 0.25, zc], axis: "x", radius: 0.25, half: w, round: 0.035, color: TYRE });
  P("hub_" + bone, { shape: "cylinder", center: [X, 0.25, zc], axis: "x", radius: 0.145, half: w + 0.006, round: 0.004, color: STEEL });
  P("cap_" + bone, { shape: "cylinder", center: [X, 0.25, zc], axis: "x", radius: 0.06, half: w + 0.014, round: 0.004, color: DARK });
  const sp = { id: "spoke_" + bone, shape: "box", bone: bone, island: "spoke_" + island, center: [X, 0.25 + 0.12, zc], half: [w + 0.011, 0.075, 0.026], round: 0.005, color: YELLOW };
  if (mirror) sp.mirror = "x";
  parts.push(sp);
};
wheel("wheel_m_l", "wheel_m", 0.62, 0.2, 0.07, true);
wheel("wheel_n", "wheel_n", 0, 0.95, 0.055, false);

// the roundels on the upper wing (a blue ring, a cream disc, a red dot, each a few millimetres higher than the one under it: one island a side, a fine grid)
[1, -1].forEach(function (s) {
  const isl = s > 0 ? "mark_l" : "mark_r", top = 1.12 + 0.0333;
  [["ring", 0.17, BLUE, 0.006], ["disc", 0.115, CREAM, 0.010], ["dot", 0.06, RED, 0.014]].forEach(function (d) {
    parts.push({ id: "roundel_" + d[0] + "_" + isl, shape: "cylinder", bone: "root", island: isl, center: [1.45 * s, top + d[3] - 0.012, 0.09], axis: "y", radius: d[1], half: 0.012, color: d[2] });
  });
});

// the grid step is the default island's (the fuselage); every other island has a grid of its own, finer for the thin or the small, and is simplified afterwards: `ratio` is a floor so low that the island's `error` (how far a vertex may move
// from the surface) and `max_edge` (the longest edge: a flat panel keeps vertices inside, so that its normals stay flat) say how many vertices are left; the whole is about eight thousand
const I = function (cell, error, max_edge) { return { cell: cell, decimate: { ratio: 0.002, error: error, max_edge: max_edge } }; };
const sdf = {
  cell: 0.02, skin: { falloff: 0.5 }, shade: { ao: 0.5, ao_radius: 0.05, tone: 0.3, color_blend: 0.4 },
  decimate: { ratio: 0.002, error: 0.0033, max_edge: 0.25 },
  islands: {
    wing_low: I(0.02, 0.004, 0.6), wing_up: I(0.02, 0.004, 0.6), tips: I(0.012, 0.0033, 0.3), mark_l: I(0.003, 0.0013, 0.1), mark_r: I(0.003, 0.0013, 0.1),
    ail: I(0.01, 0.003, 0.5), elev: I(0.008, 0.0025, 0.12), rudd: I(0.008, 0.002, 0.08), tail: I(0.008, 0.003, 0.2), struts: I(0.01, 0.003, 0.3), cowl: I(0.02, 0.004, 0.3), belly: I(0.02, 0.0033, 0.3), engine: I(0.01, 0.003, 0.2), cockpit: I(0.008, 0.002, 0.15), glass: I(0.004, 0.0015, 0.1),
    exhaust: I(0.008, 0.003, 0.1), prop: I(0.007, 0.002, 0.15), gear: I(0.008, 0.003, 0.3), wheel_m: I(0.006, 0.002, 0.1), wheel_n: I(0.006, 0.002, 0.1), spoke_wheel_m: I(0.004, 0.0015, 0.1), spoke_wheel_n: I(0.004, 0.0015, 0.1),
  },
  parts: parts,
};
// PHYSICS: two boxes, the fuselage and the wings, 600 kg
const physics = { mass: 600, shapes: [{ id: "fuselage", shape: "box", center: [0, 0.65, -0.2], half: [0.35, 0.35, 1.5], bone: "root" }, { id: "wings", shape: "box", center: [0, 0.8, 0.15], half: [2.1, 0.4, 0.4], bone: "root" }] };

return {
  name: "biplane", max: 16,
  family: { faction: "folk", kind: "aircraft", hp: 120 },
  nav: { agent: {"name":"biplane","radius":3,"height":3.2,"step":0.2,"slope":15,"drop":0.3} },
  body: {
    skeleton: bones,
    body: body,
    vehicle: vehicle,
    aircraft: aircraft,
    couplers: couplers,
    physics: physics,
    sdf: sdf
  },
  abilities: ["fly", "effects"],
  interaction: { uses: [] },
  // PARTICLES (soma/js/fx.js): the engine's exhaust stubs puff while the engine runs (the propeller turns: `spin`; it idles on the ground too), one on each side of the cowl
  particles: {
    exhaust_l: { effect: "exhaust_smoke", mount: { bone: "root", at: [0.283, -0.283, 0.91], dir: [0.15, 0.1, -1] }, loop: { while: "spin", bone: "prop" }, scale: 0.5 },
    exhaust_r: { effect: "exhaust_smoke", mount: { bone: "root", at: [-0.283, -0.283, 0.91], dir: [-0.15, 0.1, -1] }, loop: { while: "spin", bone: "prop" }, scale: 0.5 }
  },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 120 }],
      ["orbit", { alt: 35, radius: 60, speed: 22 }],
      ["fly", { alt: 35, cruise: 22, climb: 5, sink: 4, take_off_time: 150, leg_time: 200, legs: 2, min_leg: 90, roam: 220, near: 22, land_radius: 40, glide: 0.12, rest_min: 10, rest_max: 25, land_zone: "runway" }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "biplane", select: [ld.node("orbit"), ld.node("fly")] };
      return { tree: tree };
    }
  }
};
