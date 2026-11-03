"use strict";
// copter: in soma's one form of a creature file (soma/creature_file.js): the body is the creature as it was made, the mind is the blocks of soma/world/blocks/ it loads and its tree.
// A small helicopter: flies a round of places of the field at 14 m/s, hangs over a place it is sent to, lands on a pad and rests.
// copter: a small helicopter, 3.6 m long with a main rotor 6.6 m across. ONE JS FILE IS ONE CREATURE: it is read as text, run with new Function("api", text) and RETURNS the creature { name, skeleton, body, flight, rotors, couplers, physics, sdf }.
// Metres, +x to its left, +y up, +z forward, the skids on y = 0. A HOVER (soma_flight.cpp): it accelerates toward the velocity it is wished to have (it leans into its acceleration), stands in the air with no wish, turns toward the way
// it goes, and lands on its skids. Flown by the wish (`sp.fly(c, true)` starts the engine, `sp.set_intent` and `sp.set_climb` steer it) or with a STICK in angle mode (`sp.set_controls`: the throttle is the collective, pitch and roll tilt
// the thrust, yaw turns it; on its skids it does not rise to a clearance and does not tilt). Its ROTORS (soma_aircraft.cpp) are bones that turn with the engine, which is on while it flies: the main rotor is governed to its speed with
// the time constant of its inertia (2.5 s), the tail rotor is geared to it (5 to 1), and both spin down when the engine stops.
const bones = [
  { name: "root", head: [0, 1.0, 0], tail: [0, 1.0, 0.5] },
  { name: "rotor", parent: "root", head: [0, 1.95, 0.1], tail: [0, 2.05, 0.1] },                              // (the main rotor: a bone that turns about its own y axis, the model's up)
  { name: "tail_rotor", parent: "root", head: [0.18, 1.2, -3.3], tail: [0.4, 1.2, -3.3] },                    // (the tail rotor turns about its own y axis, which runs along the model's x)
];
// THE BODY: the gravity (m/s^2) is the g of the hover's thrust; step / radius: the highest prop its skids climb and how far short of a wall it stops
const body = { max_speed: 22, accel: 6, turn_rate: 3, gravity: 19.8, step: 0.2, radius: 1.0 };
// THE FLIGHT: a HOVER, 22 m/s at most, 1.6 g of thrust (0.6 g spare: it climbs at about 10 m/s^2), leaning up to 0.5 rad into its acceleration, turning at 1.6 rad/s, its centre 1.1 m over the root, rising to 1.2 m over the floor when it takes off
const flight = { model: "hover", max_speed: 22, thrust: 1.6, max_bank: 0.5, max_pitch: 0.5, rate: 1.6, pivot: 1.1, clearance: 1.2 };
// THE ROTORS: the main rotor turns at 36 rad/s once up to speed (it spools up with a 2.5 s inertia); the tail rotor is geared to it (master "rotor", ratio 5: 180 rad/s)
const rotors = [{ bone: "rotor", role: "main", omega: 36, spool: 2.5 }, { bone: "tail_rotor", role: "tail", master: "rotor", ratio: 5 }];
// COUPLERS: a hook at the nose and the tail
const couplers = { front: [0, 0.3, 1.5], rear: [0, 1.1, -3.4] };
// SDF: what the mesh is made of (the mesher's grammar: soma/SOMA_MESHER.md; the parts stand on the bones above by name, in MODEL space: the bind pose). A light helicopter in white and blue: a white egg of a cabin with a big canopy of
// glass, a blue belly with an orange pinstripe, a white engine cowl and tail boom, a blue fin and stabiliser, two skids on struts, a four blade main rotor with orange tips and a two blade tail rotor. Everything is rigid (every part of the
// airframe is `root`'s); what turns is the main rotor (the bone `rotor`: its hub, grips and four blades are centred on the axis x = 0, z = 0.1) and the tail rotor (`tail_rotor`: centred on y = 1.2, z = -3.3, along x).
// How it is built (the lessons of SOMA.md, "Authoring a body"): the default island is only what is big and white (the egg, the boom, the cowl, the mast fairing: a uniform grid of 1.5 cm, simplified). EVERYTHING ELSE is an ISLAND with a grid of
// its own: a part of an island never blends into another one, so its edge is clean and its colour crisp, and a thin plank (a blade of 3.6 cm, a fin of 4-5 cm, a skid tube) gets a grid fine enough for it. The PAINT is islands that stand a few mm
// over the egg: a solid copy of the egg that an `intersect` cuts to a slab (the blue belly under y = 0.82, the pinstripe from 0.82 to 0.86; the glass from a copy 2 cm over it, cut to the window by a big ellipsoid, with the posts as slits
// whose edges are rounded by a `blend`: a sharp slit gives the vertices of its rim the normal of its wall, and a simplified mesh smears it); the same for the two bands of the boom. A blade is a plank (a box with rounded edges keeps
// straight edges when it is simplified), each blade and each orange tip an island of its own (one grid for the whole cross would be 16 M samples of air, and a colour on a long triangle fades). A loft with 15 points is slow in the
// field (13 s the first egg took), so the egg is ONE ellipsoid. About 9.3 k vertices.
const BLUE = [0.10, 0.27, 0.60, 1], WHITE = [0.92, 0.93, 0.95, 1], DARK = [0.12, 0.13, 0.15, 1], STEEL = [0.60, 0.63, 0.68, 1], GLASS = [0.36, 0.64, 0.84, 1], ORANGE = [0.95, 0.45, 0.10, 1];
const RED = [0.88, 0.10, 0.08, 1], GREEN = [0.12, 0.80, 0.30, 1], LAMP = [1.0, 0.93, 0.70, 1];
const parts = [];
// THE HULL: the egg of the cabin (one ellipsoid), white; its paint is islands that stand a few mm over it
const EGG = { center: [0, 1.06, 0.1], radii: [0.68, 0.57, 1.45] };
function egg(grow) { return { shape: "ellipsoid", center: EGG.center, radii: [EGG.radii[0] + grow, EGG.radii[1] + grow, EGG.radii[2] + grow] }; }
parts.push(Object.assign({ id: "hull", bone: "root", color: WHITE }, egg(0)));
// the tail boom: a cone that grows out of the cabin's back, and the gearbox of the tail rotor on its end
parts.push({ id: "boom", shape: "loft", bone: "root", points: [[0, 1.19, -1.1], [0, 1.2, -2.0], [0, 1.22, -2.7], [0, 1.22, -3.22]], radii: [0.25, 0.17, 0.10, 0.07], radii_v: [0.25, 0.17, 0.10, 0.07], blend: 0.08, blend_mode: "cubic", color: WHITE });
parts.push({ id: "gearbox", shape: "cylinder", center: [0.1, 1.2, -3.3], axis: "x", radius: 0.055, half: 0.14, round: 0.015, bone: "root", blend: 0.02, color: DARK });
// the engine cowl on the roof, the fairing round the mast and the mast (its top is under the hub)
parts.push({ id: "cowl", shape: "ellipsoid", center: [0, 1.58, -0.2], radii: [0.40, 0.22, 0.78], bone: "root", blend: 0.08, blend_mode: "cubic", color: WHITE });
parts.push({ id: "fairing", shape: "loft", bone: "root", points: [[0, 1.7, 0.1], [0, 1.86, 0.1]], radii: [0.15, 0.09], radii_v: [0.15, 0.09], blend: 0.04, blend_mode: "cubic", color: WHITE });
parts.push({ id: "mast", shape: "cylinder", center: [0, 1.9, 0.1], axis: "y", radius: 0.04, half: 0.05, bone: "root", color: STEEL });
// the tail: a swept fin, a small ventral fin and the stabiliser (an island: thin plates, a grid of 1 cm)
parts.push({ id: "fin", shape: "loft", bone: "root", points: [[0, 1.2, -3.0], [0, 1.95, -3.3]], radii: [0.03, 0.02], radii_v: [0.34, 0.15], square: 0.3, island: "tail", color: BLUE });
parts.push({ id: "ventral", shape: "loft", bone: "root", points: [[0, 1.15, -2.95], [0, 0.8, -3.1]], radii: [0.025, 0.018], radii_v: [0.2, 0.1], square: 0.3, island: "tail", blend: 0.03, color: BLUE });
parts.push({ id: "tailplane", shape: "loft", bone: "root", points: [[0, 1.24, -2.8], [0.62, 1.27, -2.86]], radii: [0.21, 0.13], radii_v: [0.022, 0.016], square: 0.4, mirror: "x", island: "tail", blend: 0.03, color: BLUE });
// the paint: a blue belly (the egg 1 cm bigger, cut under y = 0.84), an orange pinstripe on it (4 mm higher, y from 0.82 to 0.86)
parts.push(Object.assign({ id: "belly", bone: "root", island: "belly", color: BLUE }, egg(0.01)));
parts.push({ id: "belly_cut", shape: "box", center: [0, -0.16, 0.1], half: [2, 1.0, 3], op: "intersect", bone: "root", island: "belly" });
parts.push(Object.assign({ id: "stripe", bone: "root", island: "stripe", color: ORANGE }, egg(0.014)));
parts.push({ id: "stripe_cut", shape: "box", center: [0, 0.84, 0.1], half: [2, 0.02, 3], op: "intersect", bone: "root", island: "stripe" });
// the canopy glass: the egg 2 cm bigger, cut to the window by an ellipsoid, a post down the middle of the windscreen and one behind the door (slits: the body shows through)
parts.push(Object.assign({ id: "glass", bone: "root", island: "glass", color: GLASS }, egg(0.02)));
parts.push({ id: "glass_cut", shape: "ellipsoid", center: [0, 1.2, 0.62], radii: [2, 0.34, 1.12], op: "intersect", blend: 0.015, bone: "root", island: "glass" });
parts.push({ id: "post_front", shape: "box", center: [0, 1.1, 1.3], half: [0.025, 0.6, 0.4], op: "subtract", blend: 0.012, bone: "root", island: "glass" });
parts.push({ id: "post_door", shape: "box", center: [0.75, 1.1, 0.33], half: [0.3, 0.6, 0.025], op: "subtract", blend: 0.012, bone: "root", island: "glass", mirror: "x" });
// the skids (tubes that turn up at the ends, the bottom on y = 0) and the struts that carry the belly
parts.push({ id: "skid_l", shape: "loft", bone: "root", island: "gear", points: [[0.6, 0.2, 1.12], [0.6, 0.1, 1.0], [0.6, 0.045, 0.8], [0.6, 0.035, 0.5], [0.6, 0.035, -0.5], [0.6, 0.045, -0.7], [0.6, 0.1, -0.85], [0.6, 0.2, -0.93]], radii: [0.032, 0.035, 0.035, 0.035, 0.035, 0.035, 0.035, 0.032], mirror: "x", color: DARK });
[0.6, -0.35].forEach(function (z, i) {
  parts.push({ id: "strut_" + i, shape: "capsule", a: [0.6, 0.05, z], b: [0.35, 0.7, z], radius: 0.025, bone: "root", island: "gear", mirror: "x", color: DARK });
});
// two bands round the boom (a blue one, an orange pinstripe in front of it): islands that stand 1 cm over the boom, cut from a copy of its cone by a slab
parts.push({ id: "boom_band", shape: "loft", bone: "root", island: "boom_band", points: [[0, 1.2, -2.4], [0, 1.2, -2.75]], radii: [0.152, 0.108], radii_v: [0.152, 0.108], color: BLUE });
parts.push({ id: "boom_band_cut", shape: "box", center: [0, 1.2, -2.52], half: [1, 1, 0.12], op: "intersect", bone: "root", island: "boom_band" });
parts.push({ id: "boom_line", shape: "loft", bone: "root", island: "boom_line", points: [[0, 1.2, -2.2], [0, 1.2, -2.4]], radii: [0.167, 0.152], radii_v: [0.167, 0.152], color: ORANGE });
parts.push({ id: "boom_line_cut", shape: "box", center: [0, 1.2, -2.31], half: [1, 1, 0.025], op: "intersect", bone: "root", island: "boom_line" });
// the engine's air intake and the louvers on the cowl's flanks: dark slots, half sunk in its skin (the skin is the ellipsoid's: its x at a height y and a place z)
const COWL = { c: [0, 1.58, -0.2], r: [0.40, 0.22, 0.78] };
function cowl_x(y, z) { const q = 1 - Math.pow((y - COWL.c[1]) / COWL.r[1], 2) - Math.pow((z - COWL.c[2]) / COWL.r[2], 2); return COWL.r[0] * Math.sqrt(Math.max(q, 0)); }
parts.push({ id: "intake", shape: "ellipsoid", center: [0, 1.72, 0.4], radii: [0.15, 0.04, 0.03], bone: "root", island: "vents", color: DARK });
[1.62, 1.68, 1.74].forEach(function (y, i) {
  parts.push({ id: "louver_" + i, shape: "ellipsoid", center: [cowl_x(y, -0.3), y, -0.3], radii: [0.014, 0.012, 0.11], bone: "root", island: "vents", mirror: "x", color: DARK });
});
// the lights and the exhaust: one island each (an island's grid is the box of ALL its parts: far apart they would be a grid of the whole helicopter)
parts.push({ id: "lamp", shape: "cylinder", center: [0, 0.9, 1.485], axis: "z", radius: 0.05, half: 0.012, round: 0.006, bone: "root", island: "t_lamp", color: LAMP });
parts.push({ id: "nav_l", shape: "sphere", center: [0.63, 1.27, -2.86], radius: 0.025, bone: "root", island: "t_nav_l", color: RED });
parts.push({ id: "nav_r", shape: "sphere", center: [-0.63, 1.27, -2.86], radius: 0.025, bone: "root", island: "t_nav_r", color: GREEN });
parts.push({ id: "strobe", shape: "sphere", center: [0, 1.99, -3.4], radius: 0.03, bone: "root", island: "t_strobe", color: RED });
parts.push({ id: "exhaust", shape: "cylinder", center: [0.14, 1.66, -0.98], axis: "z", radius: 0.045, half: 0.1, round: 0.01, bone: "root", island: "t_exhaust", color: DARK });
// the main rotor (every part is on the bone `rotor` and centred on its axis, x = 0 and z = 0.1): the hub with its four grips (an island), then four blades, each a plank of 3 m (x or z from 0.3 to 3.1 out, 24 cm wide, 3.6 cm thick)
// and an orange tip of 40 cm that is 4 mm bigger: each blade and each tip an island of its own
parts.push({ id: "hub", shape: "cylinder", center: [0, 2, 0.1], axis: "y", radius: 0.15, half: 0.055, round: 0.02, bone: "rotor", island: "hub", color: STEEL });
parts.push({ id: "hub_cap", shape: "cylinder", center: [0, 2.07, 0.1], axis: "y", radius: 0.08, half: 0.02, round: 0.01, bone: "rotor", island: "hub", color: DARK });
[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d, i) {
  const at = function (t, y) { return [d[0] * t, y === undefined ? 2.02 : y, 0.1 + d[1] * t]; };
  parts.push({ id: "grip_" + i, shape: "capsule", a: at(0.12, 2.0), b: at(0.45, 2.0), radius: 0.05, bone: "rotor", island: "hub", color: STEEL });
  const plank = function (t0, t1, grow) { const m = (t0 + t1) / 2, h = (t1 - t0) / 2; return { shape: "box", center: at(m), half: [d[0] ? h : 0.12 + grow, 0.018 + grow, d[1] ? h : 0.12 + grow], round: 0.005 }; };
  parts.push(Object.assign({ id: "blade_" + i, bone: "rotor", island: "blade_" + i, color: DARK }, plank(0.3, 3.1, 0)));
  parts.push(Object.assign({ id: "tip_" + i, bone: "rotor", island: "tip_" + i, color: ORANGE }, plank(2.9, 3.3, 0.004)));
});
// the tail rotor (on the bone `tail_rotor`, centred on y = 1.2, z = -3.3, 1 m across): a hub and two blades with orange tips, an island
parts.push({ id: "thub", shape: "cylinder", center: [0.28, 1.2, -3.3], axis: "x", radius: 0.05, half: 0.04, bone: "tail_rotor", island: "tail_rotor", color: STEEL });
[1, -1].forEach(function (d, i) {
  parts.push({ id: "tblade_" + i, shape: "loft", bone: "tail_rotor", island: "tail_rotor", points: [[0.28, 1.2 + d * 0.06, -3.3], [0.28, 1.2 + d * 0.42, -3.3]], radii: [0.012, 0.01], radii_v: [0.045, 0.037], square: 0.5, color: DARK });
  parts.push({ id: "ttip_" + i, shape: "loft", bone: "tail_rotor", island: "tail_rotor", points: [[0.28, 1.2 + d * 0.39, -3.3], [0.28, 1.2 + d * 0.5, -3.3]], radii: [0.0125, 0.0125], radii_v: [0.039, 0.039], square: 0.5, color: ORANGE });
});
// the islands: each has the grid its thinnest part needs (2.5 cells of thickness at least) and its own simplification (`ratio` sets the count, `error` how far a vertex may leave the surface)
const TINY = { cell: 0.006, adaptive: false, decimate: { ratio: 0.1, error: 0.002, max_edge: 0.1 } };
const islands = {
  glass: { cell: 0.015, adaptive: false, decimate: { ratio: 0.02, error: 0.005, max_edge: 0.5 } },
  belly: { cell: 0.015, adaptive: false, decimate: { ratio: 0.02, error: 0.006, max_edge: 0.5 } },
  stripe: { cell: 0.01, adaptive: false, decimate: { ratio: 0.008, error: 0.004, max_edge: 0.5 } },
  tail: { cell: 0.01, adaptive: false, decimate: { ratio: 0.022, error: 0.004, max_edge: 0.4 } },
  gear: { cell: 0.012, adaptive: false, decimate: { ratio: 0.04, error: 0.005, max_edge: 0.4 } },
  boom_band: { cell: 0.008, adaptive: false, decimate: { ratio: 0.03, error: 0.003, max_edge: 0.2 } },
  boom_line: { cell: 0.008, adaptive: false, decimate: { ratio: 0.03, error: 0.003, max_edge: 0.2 } },
  vents: { cell: 0.006, adaptive: false, decimate: { ratio: 0.05, error: 0.002, max_edge: 0.1 } },
  hub: { cell: 0.006, adaptive: false, decimate: { ratio: 0.012, error: 0.003, max_edge: 0.2 } },
  tail_rotor: { cell: 0.005, adaptive: false, decimate: { ratio: 0.03, error: 0.003, max_edge: 0.2 } },
  t_lamp: TINY, t_nav_l: TINY, t_nav_r: TINY, t_strobe: TINY, t_exhaust: TINY,
};
for (let i = 0; i < 4; i++) {
  islands["blade_" + i] = { cell: 0.008, adaptive: false, decimate: { ratio: 0.004, error: 0.0028, max_edge: 1.5 } };       // (a finer grid and a smaller error make the long edges of a blade straight)
  islands["tip_" + i] = { cell: 0.008, adaptive: false, decimate: { ratio: 0.008, error: 0.003, max_edge: 0.3 } };
}
const sdf = {
  cell: 0.015, decimate: { ratio: 0.034, error: 0.003, max_edge: 0.3 },
  skin: { falloff: 0.5 }, shade: { ao: 0.18, ao_radius: 0.05, tone: 0.3, color_blend: 0.4 },
  islands: islands,
  parts: parts,
};
// PHYSICS: two boxes, the cabin and the tail boom, 900 kg
const physics = { mass: 900, shapes: [{ id: "cabin", shape: "box", center: [0, 1.0, 0.2], half: [0.7, 0.65, 1.4], bone: "root" }, { id: "boom", shape: "box", center: [0, 1.2, -2.2], half: [0.2, 0.25, 1.3], bone: "root" }] };

return {
  name: "copter", max: 16,
  family: { faction: "machine", kind: "aircraft", hp: 150 },
  nav: { agent: {"name":"copter","radius":2.4,"height":3.2,"step":0.2,"slope":15,"drop":0.3} },
  body: {
    skeleton: bones,
    body: body,
    flight: flight,
    rotors: rotors,
    couplers: couplers,
    physics: physics,
    sdf: sdf
  },
  abilities: ["fly", "effects"],
  interaction: { uses: [] },
  // PARTICLES (soma/js/fx.js): the turbine's exhaust pipe behind the cowl breathes haze while the main rotor turns (`spin`: it hovers, so its ground speed says nothing about its engine)
  particles: {
    turbine: { effect: "turbine_haze", mount: { bone: "root", at: [0.14, 0.66, -0.98], dir: [0, 0.3, -1] }, loop: { while: "spin", bone: "rotor" }, scale: 0.7 }
  },
  mind: {
    hz: 6, far_hz: 2,
    blocks: [
      ["health", { hp: 150 }],
      ["orbit", { alt: 30, radius: 24, speed: 9 }],
      ["fly", { alt: 30, cruise: 14, climb: 4, sink: 3, legs: 2, min_leg: 40, roam: 130, near: 10, rest_min: 10, rest_max: 25, land_zone: "pads" }]
    ],
    // THE WORKER: a creature declares its tree. The nodes of the blocks that have one are put in it by name, the ones that act first first; the blocks without a node (health, needs, injured) act through their hooks.
    worker: function (api, ld) {
      var tree = { name: "copter", select: [ld.node("orbit"), ld.node("fly")] };
      return { tree: tree };
    }
  }
};
