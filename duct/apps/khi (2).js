function index(ecs, ge, pe, math, html) {

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

  app.use_system('physics_system', {
    gravity: [0, -10, 0],
  });

  function RD(a) {
    return a * math.DEGTORAD;
  }



  var main_light = app.create_renderable(new ge.shading.light({
    intensity: 2.8,

    diffuse1: [0, 0, 0]
  }),
    function (m, e) {
      e.ge_transform.rotate_eular(RD(-135), RD(160), 0);

      m.enable_shadows({
        shadow_intensity: 0.15,
        shadow_map_size: 1024,
        shadow_camera_distance: 220
      })
    });








  var camera = app.render_system.camera;

  camera.ge_transform_controller.set_position(-472.10174560546875, 1345.0655517578125, 172.97280883789062)
    .set_rotate(-0.10899998247623444, -7.119897842407227, 0);

  camera.body = app.systems["physics_system"].create_sphere({
    flags: 4, size: 32,
    position: camera.ge_transform.position,
    shp: { friction: 0, restitution: 0 }
  });

  camera.body._gravityScale = 20;

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
    on_mouse_wheel: function (sp, e) {
      this.entity.ge_transform_controller.yaw_pitch(0, sp * 0.0005);
      return false;
    },
    on_mouse_drage: function (dx, dy, e) {

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
    front_back_delta: 4
  });

  var keys = camera.ge_keyboard_camera_controller.keys;

  app.create_renderable(new ge.geometry.mesh({
    geometry: ge.geometry.shapes.cube({ size: 16, width: 32, divs: 4 }),
    material: new ge.shading.shaded_material({ wireframe1: true })
  }),
    function (m, e) {

      m.material.flags += ge.SHADING.CAST_SHADOW;
      m.material.texture = ge.webgl.texture.from_url("res/tex2.jpg", true);
      e.ge_transform.set_position(22.270126342773438, 1244.2293090820312, -240.1539764404297);


      app.attach_component(e, "physics_item", {
        type: "dynamic", angular_velocity: [-1, 2, 0],
        shapes: [
          { type: "box", size: [16, 8, 8] }],

      });

      console.log(e);

    });


  window.onresize = function () {
    app.render_system.resize();
  }


  app.create_renderable(new ge.geometry.mesh({
    geometry: ge.geometry.shapes.plane({ width: 400, height: 400 }).scale_position_rotation(1, 1, 1, 0, 0, 0, RD(-90), 0, 0),
    material: new ge.shading.shaded_material({ specular: [0, 0, 0] })
  }),
    function (m, e) {
      e.ge_transform.set_position(52.270126342773438, 1044.2293090820312, -240.1539764404297);

      m.material.texture = ge.webgl.texture.from_url("res/r4.jpg", true);
      math.mat3.translate_rotate_scale(m.material.texture_matrix, 0, 0, 4, 4, 0);
      m.material.flags += ge.SHADING.RECEIVE_SHADOW;
      console.log("pl", e);
      app.attach_component(e, "physics_item", {
        type: "asif",
        angular_velocity1: [0, 0.2, 0.1],
        shapes: [
          { type: "box", size: [200, 0.1, 200] }],

      });
    });
 



  app.create_renderable(new ge.geometry.mesh({
    geometry: ge.geometry.shapes.terrain({ url: "res/h001.png", size: 256, details: 16, divisor: 1 }),
    material: new ge.shading.shaded_material({
      wireframe1: true,
      specular: [0, 0, 0]
    })
  }),
    function (m, e) {
      console.log(m);
      e.ge_transform.set_position(-12.270126342773438, 1414.2293090820312, -240.1539764404297);

     // e.ge_transform.set_scale(0.5, 0.5, 0.5);
      math.mat3.translate_rotate_scale(m.material.texture_matrix, 0, 0, 8, 8, 0);
      m.material.texture = ge.webgl.texture.from_url("res/grass.jpg", true);

      m.material.flags += ge.SHADING.CAST_SHADOW; // + ge.SHADING.RECEIVE_SHADOW;


    });


  
  app.create_renderable(new ge.terrain.land_mesh({
    region_size: 1024,
    world_size: 4096,
    terrain_quality: 6,
    regions_from_image_url: [
      ["res/heightmap10.jpg",
        -8, -8,// position of regsion in world
        0.128,//  divide height from source
        1024, 1024,//  input image size
        32 //  scale terrain at runtime by this factor it must be power 2
      ]
    ],
    quality_distance: 2400,
    draw_distance: 12000,
    detail_levels: [2, 8, 64, 128],
    region_distance: 8,
    fixed_detail1: 4,
    terrain_quality: 6,
    wireframe: false,
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
        "res/3601002.png",
        "res/grass.jpg",
        "res/mud.jpg",
        "res/stone.jpg"
      ],
      shader: `

uniform sampler2D u_sp_map_rw;


    vec4 mix_texture_tiles(vec4 tile1,vec4 tile2,vec4 tile3,vec4 tile4,vec3 normal){

vec4 r=texture2D(u_sp_map_rw, v_uv_rw*1.0);

tile1=mix(tile2,tile3,r.g);
tile1=mix(tile1,tile4,r.r);
return tile1;

    }
    void fragment(void){
    super_fragment();
    }
    `,

    })
  }),
    function (m, e) {
      var lines = new ge.debug.lines();
      console.log("m", m);

      e.ge_renderable.items.push(lines);
      var sp1 = ge.webgl.texture.from_url("res/dirt.jpg", true);
      m.on_region_render = function (reg, renderer, shader) {
        shader.set_uniform("u_sp_map_rw", 5);
        renderer.use_texture(sp1, 5);
      }
      m.on_render = function () {
        m.update(camera.ge_camera, app.timer);

        //        camera.ge_transform.position[1] = m.height_on_camera + 200;


        camera.ge_transform.require_update = -1;
        if (m.cm.cam_reg) {
          reg = m.cm.cam_reg;
          if (reg.aabbs) {

          }

          if (reg.patches) {
            var rx = (m.processor.regions[reg.key].x - m.processor.region_size_half);
            var rz = (m.processor.regions[reg.key].z - m.processor.region_size_half);

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
      };

      m.cm.on_new_patch = function (patch, rx, rz) {
        app.systems["physics_system"].create_terrain_patch(patch, rx, rz);
      };

    });

  app.start(function () {


  }, 1 / 60);

}