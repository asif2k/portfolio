function index(ecs, ge,pe, math,html) {
    
  dependencies([
    ['ecs', '/libs/ecs.js'],
    ['math', '/libs/math.js'],
    ['ge', '/ge/index.js'],
    ['pe', '/pe/index.js'],
    ['html', '/libs/html.js']
  ]);

  console.log("pe", pe);


  var app = new ge.app({
    renderer: {
      pixel_ratio: 1
    }
  });

  function RD(a) {
    return a * math.DEGTORAD;
  }



  var main_light = app.create_renderable(new ge.shading.light({
    intensity: 2.8,

    diffuse1:[0,0,0]
  }),
    function (m, e) {
      e.ge_transform.rotate_eular(RD(-125), RD(160), 0);
           
      m.enable_shadows({
        shadow_intensity: 0.15,
        shadow_map_size: 4096,
        shadow_camera_distance: 20
      })
    });

  
 

 



  var camera = app.render_system.camera;

  camera.ge_transform_controller.set_position(-1287.8719482421875, 2479.942626953125, 1086.1318359375).set_rotate(-0.6149993538856506, -0.06499692052602768, 0);
 
  app.attach_component(camera, 'ge_mouse_camera_controller', {
    element: app.render_system.renderer.canvas,
    wheel_delta: 0.02,
    on_mouse_down: function (x, y, e) {
      app.render_system.picking_mouse_x = x;
      app.render_system.picking_mouse_y = y;
    },
    on_mouse_up: function (x, y, e) {
      camera.ge_camera.is_locked = false;
    },
    on_mouse_wheel: function (sp,e) {
      this.entity.ge_transform_controller.yaw_pitch(0, sp * 0.0005);
      return false;
    },
    on_mouse_drage: function (dx,dy,e) {
     
      if (!e.ctrlKey) {
        camera.ge_transform_controller.move_left_right(-dx * 2);
        camera.ge_transform_controller.move_forward_xz(-dy * 2);
        return false;
      }
      else {
        //this.entity.ge_transform_controller.yaw_pitch(0, -dx * 0.005);
      }
      //return false;
    }
  });

  app.attach_component(camera, 'ge_keyboard_camera_controller', {
    element: document,
    front_back_delta:4
  });

  var keys = camera.ge_keyboard_camera_controller.keys;


  function proc_terrian() {
    function test6() {
      var seed = Math.random();
      var layers = [
        {       
          base_roughness: 0, roughness: 0,
          persistence: 0, strength: 0, octaves: 2,          
        },
        {
          base_roughness: 0, roughness:0,
          persistence: 0, strength: 0, octaves: 2,
        }
        
      ];
      var ter = new ge.terrain.processor({
        region_size: 1024,
        world_size: 4096,
        terrain_quality: 4,
        on_initialized: function () {
         
        }
      });

      var tsize = 128;
      var gen = {
        seed: seed,
        layers: layers,
        offset_x: 0, offset_z: 0,
        height_scale: 100
      };
      console.log("gen", gen);

      var last_time = 0;
      var generate = function () {
        if (Date.now() - last_time < 50) return;
        ter.generate_regions(gen, 0, 0, tsize, (1024*4) / tsize);
        last_time = Date.now();
      }
      var gene = html.json_editor(gen, function (obj) {
       // obj.offset_x = Math.round(obj.offset_x);
        obj.seed = Math.min(1, obj.seed);
        obj.layers.forEach(function (l) {
          l.octaves = Math.max(1, Math.round(l.octaves));
          l.base_roughness = Math.max(0, l.base_roughness);
          l.roughness = Math.max(0, l.roughness);
          l.strength = Math.max(0, l.strength);
          l.persistence = Math.max(0, l.persistence);
        });

        generate();

      });
      gene.style.width = "350px";
      document.body.appendChild(gene);

      console.log(ter);
      generate();
      function ui() {
        app.create_renderable(new ge.cui.mesh({
          width: 200, height: 320,
          mouse_controller: camera.ge_mouse_camera_controller
        }),
          function (ui, e) {
            e.ge_transform.set_position(0, 0, -6).rotate_eular(0, 0, 0);


            e.ge_transform.parent = camera.ge_transform;


            ui.flags += ge.DISPLAY_ALWAYS;


            ui.set_document({
              body: {
                styles: { background_color: "rgba(190,190,190,0.5)", border_size: 2, padding: 5 },
                children: [
                  {
                    type: "label-field", label: "Persistence",
                    field: { name: "persistence", type: "hslider", min: 1, max: 200, value: 100, label_padding: 30 }
                  },
                  {
                    name: "layers", type: "listbox", height: "100px", items: [
                      "Layer1",
                      "Layer2",
                      "Layer3",
                      "Layer4",
                      "Layer5",
                      "Layer6",
                      "Layer7"
                    ]
                  }
                ]
              }

            });

            ui.on_document_update.add(function (doc) {



            });






          });

      }
      

      app.create_renderable(new ge.terrain.mesh({
        processor: ter,
        quality_distance: 2400,
        draw_distance: 7000,
        detail_levels: [2, 8, 64, 128],
        region_distance: 8,
        fixed_detail1: 4,
        terrain_quality: 4,
        wireframe: true,
        shaded: true,
        region_offset: 0,
        region_margin: 1,
        terrian_scale: [1, 1, 1],
        wire_color: [1.25, 1.25, 1.25],
        shaded_color: [0.5, 0.5, 0.5],
        time_step_size: 1 / 15,
        material: new ge.terrain.material({
          transparent1: 0.85,
          texture_tiles: [
            "res/dirt.jpg",
            "res/grass.jpg",
            "res/mud.jpg",
            "res/stone.jpg"
          ],

        })
      }),
        function (m, e) {

          app.display_debug = (function (_super) {
            return function (ctx) {
              _super.apply(this, [ctx]);
              ctx.fillText(m.ri + '/' + m.rendered_regions + " regions (" + m.region_max_tris + ")/" + m.tri_count + " Tris /ms " + m.render_time, 2, 100);
            }
          })(app.display_debug);
          m.on_render = function (camera) {
            m.update(camera, app.timer);
          }
        });
    }

    test6();
  }

  var cm1 = app.create_entity({
    components: {
      'ge_transform': {},
      'ge_transform_controller': {},
      'ge_camera': {},
    }
  });


  

  cm1.ge_transform_controller.set_position(-636.5343017578125, 1777.55859375, -382.9630126953125).set_rotate(-0.6749992966651917, 1.2150028944015503, 0);


  var pw = new pe.dynamics.World(null, [0, -69.8, 0]);

  var add_sphere = function (rad, def) {
    def = def || {};
    def.shp = def.shp || {};
    rad = rad || 1;
    def.shapes = [Object.assign({
      geometry: new pe.collision.geometry.SphereGeometry(rad)
    }, def.shp)];

    var body = new pe.dynamics.rigidbody.RigidBody(def);
    body.shp = 0;
    body.hide = def.hide;
    pw.addRigidBody(body);

    return body;
  }
  var add_cube = (size, def) => {
    def = def || {};
    def.shp = def.shp || {};
    def.shapes = [Object.assign({
      geometry: new pe.collision.geometry.BoxGeometry(size || [1, 1, 1])
    }, def.shp)];

    var body = new pe.dynamics.rigidbody.RigidBody(def);
    pw.addRigidBody(body);
    return body
  };


  var add_convex = (vertices, def) => {
    def = def || {};
    def.shp = def.shp || {};
    def.shapes = [Object.assign({
      geometry: new pe.collision.geometry.ConvexHullGeometry(vertices)
    }, def.shp)];

    var body = new pe.dynamics.rigidbody.RigidBody(def);
    pw.addRigidBody(body);
    return body
  };


  var add_tpatch = (vertices, def) => {
    def = def || {};
    def.shp = def.shp || {};
    def.shapes = [Object.assign({
      geometry: new pe.collision.geometry.TerrainPatch(vertices)
    }, def.shp)];

    var body = new pe.dynamics.rigidbody.RigidBody(def);
    pw.addRigidBody(body);
    return body
  };
  console.log(pw);


  app.create_renderable(new ge.geometry.mesh({
    geometry: ge.geometry.shapes.cube({
      size: 32,
      width: 32,
      depth:32,
      height: 64,


      divs: 2
    }), material: new ge.shading.shaded_material({
      ambient: [0.4774259924888611, 0.5197775363922119, 0.1997416913509369],
      diffuse: [0.9395785927772522, 0.8748997449874878, 0.6745122075080872],
    })
  }),
    function (m, e) {
      //e.ge_transform.parent = cm1.ge_transform;


      e.ge_transform.set_position(-236.5343017578125, 1777.55859375, -382.9630126953125);

     e.pp= add_cube([16, 32, 16], {
       position: e.ge_transform.position, angular_velocity1: [2, 0, 0],
       shp1: { density:214}
      });
      console.log("e.pp", e.pp)
      m.on_render = function () {
        e.ge_transform.position[0] = e.pp._transform._position[0];
        e.ge_transform.position[1] = e.pp._transform._position[1];
        e.ge_transform.position[2] = e.pp._transform._position[2];


        e.ge_transform.rotation[0] = e.pp._transform._quat[0];
        e.ge_transform.rotation[1] = e.pp._transform._quat[1];
        e.ge_transform.rotation[2] = e.pp._transform._quat[2];
        e.ge_transform.rotation[3] = e.pp._transform._quat[3];

        e.ge_transform.require_update = -1;
      }

    });



  app.create_renderable(new ge.geometry.mesh({
    geometry: ge.geometry.shapes.sphere({ rad: 32, divs: 8 }), material: new ge.shading.shaded_material({
      ambient: [0.4774259924888611, 0.5197775363922119, 0.1997416913509369],
      diffuse: [0.9395785927772522, 0.8748997449874878, 0.6745122075080872],
    })
  }),
    function (m, e) {
      //e.ge_transform.parent = cm1.ge_transform;


      e.ge_transform.set_position(-336.5343017578125, 1277.55859375, -382.9630126953125);

      e.pp = add_sphere(32, {
        type: 0,
        position: e.ge_transform.position, angular_velocity1: [-2, 0, 0],
        shp: { friction: 10.0001, restitution:1}
      });

      m.on_render = function () {
        e.ge_transform.position[0] = e.pp._transform._position[0];
        e.ge_transform.position[1] = e.pp._transform._position[1];
        e.ge_transform.position[2] = e.pp._transform._position[2];


       // camera.ge_transform.position[0] = e.pp._transform._position[0];
      //  camera.ge_transform.position[1] = e.pp._transform._position[1]+32;
//camera.ge_transform.position[2] = e.pp._transform._position[2];
      //  camera.ge_transform.require_update = -1;

        e.ge_transform.rotation[0] = e.pp._transform._quat[0];
        e.ge_transform.rotation[1] = e.pp._transform._quat[1];
        e.ge_transform.rotation[2] = e.pp._transform._quat[2];
        e.ge_transform.rotation[3] = e.pp._transform._quat[3];

        e.ge_transform.require_update = -1;
      }

    });

  function terrain_shadow() {
    var ter = new ge.terrain.processor({
      region_size: 1024,
      world_size: 4096,
      terrain_quality: 4,
      regions_from_image_url: [
        ["res/h14.png",
          -4, -4,
          0.0952,
          1024, 1024,
          64
        ]
      ],
      on_initialized: function () {

      }
    });

    var cm = new ge.terrain.collision_mesh({
      processor: ter,
      quality_distance: 2000,
      draw_distance: 7000,
      detail_levels1: [-8, -16, -32, -64, -128],
      fixed_detail: 64,
      region_distance: 8,
      terrain_quality: 7,
      wireframe: false,
      terrian_scale: [1, 1, 1],
      shaded: false,
      wire_color: [2, 2, 2, 1],
      shaded_color: [0.5, 0.5, 0.5, 1],
      time_step_size: 1 / 5,
      material: new ge.terrain.material({
        transparent: 0.55,
        texture_tiles: [
          "res/dirt.jpg",
          "res/grass.jpg",
          "res/mud.jpg",
          "res/stone.jpg"
        ]
      })
    });

    var aabbs = new ge.debug.aabbs();
    var tris = new ge.debug.triangles();
    var lines = new ge.debug.lines();

   
    app.create_renderable(new ge.terrain.mesh({
      processor: ter,
      quality_distance: 2400,
      draw_distance: 7000,
      detail_levels: [4, 8, 64, 128],
      region_distance: 8,
      fixed_detail1: 4,
      terrain_quality: 5,
      wireframe: true,
      shaded: true,
      region_offset: 0,
      region_margin: 1,
      terrian_scale: [1, 1, 1],
      wire_color: [0.125, 0.125, 0.125],
      shaded_color: [0.5, 0.5, 0.5],
      time_step_size: 1 / 25,
      material: new ge.terrain.material({
        transparent1: 0.75,
        texture_tiles: [
          "res/dirt.jpg",
          "res/grass.jpg",
          "res/mud.jpg",
          "res/stone.jpg"
        ],

      })
    }),
      function (m, e) {

        console.log("m", m);
        e.ge_renderable.items.push(cm);
        e.ge_renderable.items.push(aabbs);

        e.ge_renderable.items.push(tris);

        e.ge_renderable.items.push(lines);
        var tpatches = 0;
        cm.on_new_patch = function (patch,rx,rz) {
          tpatches++;
          var p = add_tpatch(patch, {
            type: 2, position: [rx, 0, rz],
            shp: { collisionMask: 3, friction: 10.0001, restitution: 0.01}
          });
          p._shapeList.moveableShape = true;

        }

        app.display_debug = (function (_super) {
          return function (ctx) {
            _super.apply(this, [ctx]);
            ctx.fillText(m.ri + '/' + m.rendered_regions + " regions (" + m.region_max_tris + ")/" + m.tri_count + " Tris /ms " + m.render_time, 2, 100);
            ctx.fillText(tpatches+" # "+ cm.ri + '/' + cm.rendered_regions + " regions (" + cm.region_max_tris + ")/" + cm.tri_count + " Tris /ms " + cm.render_time, 2, 120);

            aabbs.clear();

            var body = pw._rigidBodyList;
            while (body != null) {
            
              aabbs.add_aabb(body._shapeList._aabb)

              body = body._next;
            }


          }
        })(app.display_debug);

        var i = 0;
       
        m.on_render = function () {

          

          m.update(camera.ge_camera, app.timer);
          cm.update(camera.ge_camera, app.timer);

          if (cm.cam_reg) {
            reg = cm.cam_reg;
            if (reg.aabbs) {
             
            }

            if (reg.patches) {
              var rx = (ter.regions[reg.key].x - ter.region_size_half);
              var rz = (ter.regions[reg.key].z - ter.region_size_half);

              lines.clear();
              lines.set_color(0, 1, 1);
              reg.patches.forEach((p) => {
                
                for (i = 0; i < p.length; i += 9) {
                  lines.addtri(
                    rx + p[i],
                    p[i + 1],
                    rz + p[i + 2],

                    rx + p[i + 3],
                    p[i + 4],
                    rz + p[i + 5],

                    rx + p[i + 6],
                    p[i + 7],
                    rz + p[i + 8]
                  );
                }

              })
            }
          }


        }
      });

  }

 // proc_terrian();
  //terrain_shadow();


  window.onresize = function () {
    app.render_system.resize();
  }


  app.start(function () {
    pw.step(1 / 60);
    if (keys[KBD_KEY_Q]) {
      cm1.ge_transform_controller.move_forward_xz(-12);
    }
    else if (keys[KBD_KEY_E]) {
      cm1.ge_transform_controller.move_forward_xz(12);
    }

    if (keys[KBD_KEY_A]) {
      cm1.ge_transform_controller.move_left_right(-12);
    }
    else if (keys[KBD_KEY_D]) {
      cm1.ge_transform_controller.move_left_right(12);
    }

  }, 1 / 60);

}