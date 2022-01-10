function index(fin,ge,math,osm) {    
  dependencies([
    ['ecs', '/libs/ecs.js'],
    ['math', '/libs/math.js'],
    ['ge', '/ge/index.js'],
    ['osm', '/libs/osm.js']

  ]);
  var app = new ge.app({
    renderer: {
      pixel_ratio: 1
    }
  });

  function RD(a) {
    return a * math.DEGTORAD;
  }

  app.create_renderable(new ge.shading.light({
    intensity: 1,
  }),
    function (light, e) {
      e.ge_transform.rotate_eular(RD(-125), RD(160), 0);

      light.set_intensity(1)
        .set_diffuse(1, 1, 1)
        .set_ambient(0.52, 0.52, 0.52);

    });


  var camera = app.render_system.camera;

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

   window.onresize = function () {
    app.render_system.resize();
  }

  var tp = new ge.terrain.processor({ region_size: 1024, world_size: 4096, terrain_quality: 8 });

  tp.regions_from_data(new Float32Array(65 * 65), 0, 0, 65, 1024, 1);

  var land = new ge.terrain.mesh({
    processor: tp,
    quality_distance: 2400,
    draw_distance: 10000,
    detail_levels: [8, 16, 32, 64],
    region_distance: 8,
    terrain_quality: 5,
    wireframe: false,
    shaded: true,
    wire_color: [0.5, 0.5, 0.5],
    shaded_color: [1, 1, 1],
    terrian_scale: [1, 1, 1],
    time_step_size: 1 / 15,
    material: new ge.terrain.material({
      tile_repeat: [16,16, 16, 16],
      texture_tiles: [
        "res/dirt.jpg",
        "res/grass.jpg",
        "res/mud.jpg",
        "res/water.jpg"
      ],
      shader: `
    uniform sampler2D u_reg_texture_rw;
    void fragment(void){
super_fragment();
    gl_FragColor=texture2D(u_reg_texture_rw, v_uv_rw);
gl_FragColor.xyz*=(land_color.xyz);
    }
    `
    })
  });
  app.create_renderable(land, function (m, e) {
    console.log(m);
   
  });




  var tpooler = new ge.webgl.texture.pooler({ pool_size: 100, gc_time: 6, gc_check_time:5 });

  tpooler.create_texture1 = function (url) {
    return this.update_texture(new ge.webgl.canvas_texture(256 ,256),url);
  };


  tpooler.create_texture = function (url) {
    var tex = ge.webgl.texture.from_url(url, true);
    tex.enable_clamp_to_edge();
    return tex
  };
  tpooler.update_texture1 = function (tex, url) {
    
    tex.ctx.fillStyle = "gray";
    tex.ctx.fillRect(0, 0, tex.width, tex.height);
    tex.ctx.fillStyle = "red";
    tex.ctx.font = "32px arial";
    tex.ctx.fillText(url, 110, 110);
    tex.update();
    return tex;
  };

  console.log("tpooler", tpooler);
  var zoom = 19;
  const tile_y = osm.lat2tile(24.914219259652633, zoom);
  const tile_x = osm.lon2tile(67.08039863380324, zoom);



  const lon = osm.tile2lon(tile_x, zoom);
  const lat = osm.tile2lat(tile_y, zoom);


  land.on_region_activated = function (reg) {
    if (!tpooler.valid_texture(reg.texture, reg.texture_valid_id)) {

      reg.tx = tile_x+ (tp.regions[reg.key].reg_x);
      reg.ty = tile_y+ (tp.regions[reg.key].reg_z);

     // reg.turl = "/tmg!!" + reg.ty + "!!" + reg.tx + "!!16";
      reg.turl = url =  ('https://tile.openstreetmap.org/' + zoom + '/' + reg.tx + '/' + reg.ty + '.png');
      reg.turl = url = 'http://mt1.google.com/vt/lyrs=s&hl2=pl&x=' + reg.tx + '&y=' + reg.ty + '&z=' + zoom + '&s=Gal';//&apistyle=' + stl;


//'http://localhost:8088/tmg!!' +
      reg.texture = tpooler.get(reg.turl);
      if (reg.texture) reg.texture_valid_id = reg.texture.valid_id;
    }
  };

  land.on_render = function (camera) {
    tpooler.tick(app.timer);
    land.update(camera, app.timer);
  };



  land.on_region_render = function (reg, renderer, shader) {    
    renderer.use_texture(reg.texture, 5);
    shader.set_uniform("u_reg_texture_rw", 5);
  }

  land.on_region_dispose = function (reg) {
    if (reg.texture ) {
     reg.texture.free_source();
      reg.texture = undefined;
    }
  }


  app.display_debug = (function (_super) {
    return function (ctx) {
      _super.apply(this, [ctx]);
      ctx.fillText(land.ri + " regions (" + land.region_max_tris + ")/" + land.tri_count + " Tris", 2, 100);
    }

  })(app.display_debug);


  camera.ge_transform_controller.set_position(4076.37060546875, 1361.303955078125, 4982.3466796875).set_rotate(-1.004999041557312, -3.389988899230957, 0);

  app.start(function () {

  }, 1 / 60);

 
}