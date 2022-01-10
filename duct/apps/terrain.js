function index(ecs, ge, math,html,bvh) {

  dependencies([
    ['ecs', '/libs/ecs.js'],
    ['math', '/libs/math.js'],
    ['ge', '/ge/index.js'],
    ['html', '/libs/html.js'],
    ['bvh', '/libs/bvh.js'],

  ]);

  var app = new ge.app({
    renderer: {
      pixel_ratio: 1
    }
  });

  function RD(a) {
    return a * math.DEGTORAD;
  }



  var bloom = new ge.effects.post_process.bloom({ enabled: false });
  app.render_system.renderer.post_processes = [new ge.effects.post_process.fxaa({ enabled: false }), bloom];

  var camera = app.render_system.camera;

  app.create_renderable(new ge.shading.light({
    intensity: 1,
  }),
    function (light, e) {
      e.ge_transform.rotate_eular(RD(-125), RD(160), 0);

      light.set_intensity(1)
        .set_diffuse(1, 1, 1)
        .set_ambient(0.52, 0.52, 0.52);

      light.enable_shadows({
        shadow_intensity: 0.2,
        shadow_map_size: 2048,
        shadow_camera_distance: 20
      })
    });


  var easingFn = {};
  (function () {
    easingFn.none = function (t) { return 0.00001; };
    easingFn.linear = function (t) { return t; };
    easingFn.easingSinusoidalIn = function (t) { return -Math.cos(t * Math.PI / 2) + 1; };
    easingFn.easingSinusoidalOut = function (t) { return Math.sin(t * Math.PI / 2); };
    easingFn.easingSinusoidalInOut = function (t) { return -0.5 * (Math.cos(Math.PI * t) - 1); };
    easingFn.easingQuadraticIn = function (t) { return t * t; };
    easingFn.easingQuadraticOut = function (t) { return t * (2 - t); };
    easingFn.easingQuadraticInOut = function (t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; };
    easingFn.easingCubicIn = function (t) { return t * t * t; };
    easingFn.easingCubicOut = function (t) { return (--t) * t * t + 1; };
    easingFn.easingCubicInOut = function (t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; };
    easingFn.easingQuarticIn = function (t) { return t * t * t * t; };
    easingFn.easingQuarticOut = function (t) { return 1 - (--t) * t * t * t; };
    easingFn.easingQuarticInOut = function (t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t; };
    easingFn.easingQuinticIn = function (t) { return t * t * t * t * t; };
    easingFn.easingQuinticOut = function (t) { return 1 + (--t) * t * t * t * t; };
    easingFn.easingQuinticInOut = function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t; };
    easingFn.easingCircularIn = function (t) { return -(Math.sqrt(1 - (t * t)) - 1); };
    easingFn.easingCircularOut = function (t) { return Math.sqrt(1 - (t = t - 1) * t); };
    easingFn.easingCircularInOut = function (t) { return ((t *= 2) < 1) ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1); };
    easingFn.easingExponentialIn = function (t) { return Math.pow(2, 10 * (t - 1)) - 0.001; };
    easingFn.easingExponentialOut = function (t) { return 1 - Math.pow(2, -10 * t); };
    easingFn.easingExponentialInOut = function (t) { return (t *= 2) < 1 ? 0.5 * Math.pow(2, 10 * (t - 1)) : 0.5 * (2 - Math.pow(2, -10 * (t - 1))); };
    easingFn.easingBackIn = function (t) { var s = 1.70158; return t * t * ((s + 1) * t - s); };
    easingFn.easingBackOut = function (t) { var s = 1.70158; return --t * t * ((s + 1) * t + s) + 1; };
    easingFn.easingBackInOut = function (t) { var s = 1.70158 * 1.525; if ((t *= 2) < 1) return 0.5 * (t * t * ((s + 1) * t - s)); return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2); };
    easingFn.easingElasticIn = function (t) {
      var s, _kea = 0.1, _kep = 0.4;
      if (t === 0) return 0; if (t === 1) return 1;
      if (!_kea || _kea < 1) { _kea = 1; s = _kep / 4; } else s = _kep * Math.asin(1 / _kea) / Math.PI * 2;
      return -(_kea * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * Math.PI * 2 / _kep));
    };
    easingFn.easingElasticOut = function (t) {
      var s, _kea = 0.1, _kep = 0.4;
      if (t === 0) return 0; if (t === 1) return 1;
      if (!_kea || _kea < 1) { _kea = 1; s = _kep / 4; } else s = _kep * Math.asin(1 / _kea) / Math.PI * 2;
      return (_kea * Math.pow(2, -10 * t) * Math.sin((t - s) * Math.PI * 2 / _kep) + 1);
    };
    easingFn.easingElasticInOut = function (t) {
      var s, _kea = 0.1, _kep = 0.4;
      if (t === 0) return 0; if (t === 1) return 1;
      if (!_kea || _kea < 1) { _kea = 1; s = _kep / 4; } else s = _kep * Math.asin(1 / _kea) / Math.PI * 2;
      if ((t *= 2) < 1) return -0.5 * (_kea * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * Math.PI * 2 / _kep));
      return _kea * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * Math.PI * 2 / _kep) * 0.5 + 1;
    };
    easingFn.easingBounceIn = function (t) { return 1 - easingFn.easingBounceOut(1 - t); };
    easingFn.easingBounceOut = function (t) {
      if (t < (1 / 2.75)) { return 7.5625 * t * t; }
      else if (t < (2 / 2.75)) { return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75; }
      else if (t < (2.5 / 2.75)) { return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375; }
      else { return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375; }
    };
    easingFn.easingBounceInOut = function (t) { if (t < 0.5) return easingFn.easingBounceIn(t * 2) * 0.5; return easingFn.easingBounceOut(t * 2 - 1) * 0.5 + 0.5; };

  })();

  function test1() {
    app.create_renderable(new ge.terrain({
      wireframe: true,
      shaded: false,
      region_size: 1024, // size of a single region in unit
      world_size: 4096, // size of whole world (no of regions)
      terrain_quality: 4, // cannot be set during runtime, quality of terrain mesh(1-6) ,lower is better but cosume more memory and processing
      detail_levels: [17, 32, 64], // level details at different distance
      fixed_detail1: 32,
      quality_distance: 2000, // distrubute lod in this distance
      draw_distance: 2000,// do not draw region after this distance
      region_distance: 8,// region to scan from camera 
      regions_from_image_url: [
        ["res/h14.png",
          -4, -4,// position of regsion in world
          0.5,//  divide height from source
          1024, 1024,//  input image size
          8 //  scale terrain at runtime by this factor it must be power 2
        ]
      ],
      material: {
        // support 4 textures to blend from , it creates a single texture from these times
        texture_tiles: [
          "res/dirt.jpg",
          "res/grass.jpg",
          "res/mud.jpg",
          "res/stone.jpg"
        ],
        // extend shader and provide custome texturing , for example from a splat map
        shader: `
    vec4 mix_texture_tiles(vec4 tile1,vec4 tile2,vec4 tile3,vec4 tile4,vec3 normal){
    return mix(tile1,mix(read_tile(u_texture_tiles_rw,4.0, 1.0,0.0), tile3,0.5),abs(normal.x));
    }
    void fragment(void){
    super_fragment();
    }
    `
      }
    }),
      function (m, e) {

        console.log("m", m);
        m.on_render = function () {
          //  camera.ge_transform.position[1] = Math.floor(m.height_on_camera + 70);
        };


        app.display_debug = (function (_super) {
          return function (ctx) {
            _super.apply(this, [ctx]);
            ctx.fillText(m.debug_text, 2, 110);
          }

        })(app.display_debug);


      });



    app.create_renderable(new ge.terrain({
      wireframe: true,
      shaded: true,
      region_size: 1024, // size of a single region in unit
      world_size: 4096, // size of whole world (no of regions)
      terrain_quality: 4, // cannot be set during runtime, quality of terrain mesh(1-6) ,lower is better but cosume more memory and processing
      detail_levels: [1, 4, 8, 12, 16], // level details at different distance
      quality_distance: 2000, // distrubute lod in this distance
      draw_distance: 2000,// do not draw region after this distance
      region_distance: 8,// region to scan from camera 
      regions_from_image_url: [
        ["res/h14.png",
          -4, -4,// position of regsion in world
          0.5,//  divide height from source
          1024, 1024,//  input image size
          8 //  scale terrain at runtime by this factor it must be power 2
        ]
      ],
      material: {
        transparent: 0.65,
        // support 4 textures to blend from , it creates a single texture from these times
        texture_tiles: [
          "res/dirt.jpg",
          "res/grass.jpg",
          "res/mud.jpg",
          "res/stone.jpg"
        ],
        // extend shader and provide custome texturing , for example from a splat map
        shader: `
    vec4 mix_texture_tiles(vec4 tile1,vec4 tile2,vec4 tile3,vec4 tile4,vec3 normal){
    return mix(tile1,mix(read_tile(u_texture_tiles_rw,4.0, 1.0,0.0), tile3,0.5),abs(normal.x));
    }
    void fragment(void){
    super_fragment();
    }
    `
      }
    }),
      function (m, e) {

        console.log("m", m);
        m.on_render = function () {
          //  camera.ge_transform.position[1] = Math.floor(m.height_on_camera + 70);
        };


        app.display_debug = (function (_super) {
          return function (ctx) {
            _super.apply(this, [ctx]);
            ctx.fillText(m.debug_text, 2, 140);
          }

        })(app.display_debug);


      });

  }


  function test2() {

    var aabbs = new ge.debug.aabbs();


    var t1 = new ge.terrain.processor({
      region_size: 512, // size of a single region in unit
      world_size: 4096, // size of whole world (no of regions)
      terrain_quality: 4, // cannot be set during runtime, quality of terrain mesh(1-6) ,lower is better but cosume more memory and processing                  
      regions_from_image_url: [
        ["res/h40.png",
          -4, -4,// position of regsion in world
          0.5,//  divide height from source
          1024, 1024,//  input image size
          8 //  scale terrain at runtime by this factor it must be power 2
        ]
      ],
    });


    var cm = new ge.terrain.collision_mesh({
      processor: t1,
      quality_distance: 2000,
      draw_distance: 4000,
      detail_levels: [-8, -16, -32, -64, -128],
      detail_levels1: [16, 32, 64, 128],
      fixed_detail: 16,
      region_distance: 8,
      terrain_quality: 7,
      wireframe: true,
      terrian_scale: [4, 4, 4],
      shaded: false,
      wire_color: [0, 1.25, 0],
      shaded_color: [0.5, 0.5, 0.5],
      time_step_size: 1 / 15,
      material: new ge.terrain.material({
        transparent: 0.5,
        texture_tiles: [
          "res/dirt.jpg",
          "res/grass.jpg",
          "res/mud.jpg",
          "res/stone.jpg"
        ]
      })
    });

    app.create_renderable(new ge.terrain.mesh({
      processor: t1,
      quality_distance: 2000,
      draw_distance: 6000,
      detail_levels: [1, 8, 16, 32],
      region_distance: 8,
      terrain_quality: 4,
      wireframe: true,
      shaded: true,
      wire_color: [0.75, 0.75, 0.75],
      shaded_color: [0.5, 0.5, 0.5],
      time_step_size: 1 / 15,
      material: new ge.terrain.material({
        transparent: 0.55,
        texture_tiles: [
          "res/dirt.jpg",
          "res/grass.jpg",
          "res/mud.jpg",
          "res/stone.jpg"
        ]
      })
    }),
      function (m, e) {
        console.log("cm", cm);

        e.ge_renderable.items.push(cm);
        e.ge_renderable.items.push(aabbs);

        app.display_debug = (function (_super) {
          return function (ctx) {
            _super.apply(this, [ctx]);
            ctx.fillText(m.ri + " regions (" + m.region_max_tris + ")/" + m.tri_count + " Tris", 2, 100);
            ctx.fillText(cm.ri + " regions (" + cm.region_max_tris + ")/" + cm.tri_count + " Tris", 2, 120);


          }

        })(app.display_debug);

        var reg;
        m.on_render = function (camera) {

          aabbs.clear();
          m.update(camera, app.timer);
          cm.update(camera, app.timer);

          if (cm.cam_reg) {
            reg = cm.cam_reg;
            if (reg.aabbs) {
              var rx = (t1.regions[reg.key].x - t1.region_size_half);
              var rz = (t1.regions[reg.key].z - t1.region_size_half);


              reg.aabbs.forEach(function (aa) {
                aabbs.add_aabb2(aa[0] + rx, t1.regions[reg.key].a_miny, aa[2] + rz, aa[3] + rx, aa[4], aa[5] + rz);
              });
            }
          }

        }



      });


    console.log(t1);
    app.on_frame.add(function () {
      // t1.update(app.timer);

    });

  }


  function test3() {


    var aabbs = new ge.debug.aabbs_solid();
    var aabbs2 = new ge.debug.aabbs();
    var tris = new ge.debug.triangles();

    var t1 = new ge.terrain.processor({
      region_size: 512, // size of a single region in unit
      world_size: 4096, // size of whole world (no of regions)
      terrain_quality: 4, // cannot be set during runtime, quality of terrain mesh(1-6) ,lower is better but cosume more memory and processing                  
      regions_from_image_url: [
        ["res/heightmap8.jpg",
          -4, -4,// position of regsion in world
          0.25,//  divide height from source
          1024, 1024,//  input image size
          16 //  scale terrain at runtime by this factor it must be power 2
        ]
      ],
    });


    app.create_renderable(new ge.terrain.mesh({
      processor: t1,
      quality_distance: 2000,
      draw_distance: 6000,
      detail_levels: [1, 8, 16, 32],
      region_distance: 8,
      terrain_quality: 6,
      wireframe: true,
      shaded: true,
      wire_color: [0.75, 0.75, 0.75],
      shaded_color: [0.5, 0.5, 0.5],
      time_step_size: 1 / 15,
      material: new ge.terrain.material({
        transparent1: 0.55,
        texture_tiles: [
          "res/dirt.jpg",
          "res/grass.jpg",
          "res/mud.jpg",
          "res/stone.jpg"
        ]
      })
    }),
      function (m, e) {
        app.display_debug = (function (_super) {
          return function (ctx) {
            _super.apply(this, [ctx]);
            ctx.fillText(m.ri + " regions (" + m.region_max_tris + ")/" + m.tri_count + " Tris", 2, 100);


          }

        })(app.display_debug);

        e.ge_renderable.items.push(tris);
        e.ge_renderable.items.push(aabbs);

        console.log(m);


        var show_box = true;
        var uint32_color_id = new Uint32Array(1);
        var byte_id = new Uint8Array(uint32_color_id.buffer);


        document.onkeyup = function (e) {
          if (e.keyCode === 32) {
            show_box = !show_box;
          }
        }

        var reg_color = 98982;

        var reg;

        function render_boxes() {
          tris.clear();
          for (var i = 0; i < m.ri; i++) {
            reg = t1.regions[m.regions_to_render[i].key];

            uint32_color_id[0] = reg_color;
            reg_color += 1000;

            reg.color = reg.color || [byte_id[0] / 255, byte_id[1] / 255, byte_id[2] / 255];


            tris.set_color(reg.color[0], reg.color[1], reg.color[2]);
            tris.add2(
              reg.a_minx, reg.a_maxy, reg.a_maxz,
              reg.a_maxx, reg.a_maxy, reg.a_maxz,
              reg.a_maxx, reg.a_miny, reg.a_maxz
            );
            tris.add2(
              reg.a_minx, reg.a_maxy, reg.a_maxz,
              reg.a_maxx, reg.a_miny, reg.a_maxz,
              reg.a_minx, reg.a_miny, reg.a_maxz
            );
            tris.add2(
              reg.a_minx, reg.a_maxy, reg.a_minz,
              reg.a_maxx, reg.a_maxy, reg.a_minz,
              reg.a_maxx, reg.a_miny, reg.a_minz
            );
            tris.add2(
              reg.a_minx, reg.a_maxy, reg.a_minz,
              reg.a_maxx, reg.a_miny, reg.a_minz,
              reg.a_minx, reg.a_miny, reg.a_minz
            );


            tris.add2(
              reg.a_maxx, reg.a_maxy, reg.a_minz,
              reg.a_maxx, reg.a_maxy, reg.a_maxz,
              reg.a_maxx, reg.a_miny, reg.a_maxz,
            );
            tris.add2(
              reg.a_maxx, reg.a_maxy, reg.a_minz,
              reg.a_maxx, reg.a_miny, reg.a_maxz,
              reg.a_maxx, reg.a_miny, reg.a_minz,
            );


            tris.add2(
              reg.a_minx, reg.a_maxy, reg.a_minz,
              reg.a_minx, reg.a_maxy, reg.a_maxz,
              reg.a_minx, reg.a_miny, reg.a_maxz,
            );
            tris.add2(
              reg.a_minx, reg.a_maxy, reg.a_minz,
              reg.a_minx, reg.a_miny, reg.a_maxz,
              reg.a_minx, reg.a_miny, reg.a_minz,
            );



            tris.add2(
              reg.a_minx, reg.a_maxy, reg.a_maxz,
              reg.a_maxx, reg.a_maxy, reg.a_maxz,
              reg.a_maxx, reg.a_maxy, reg.a_minz

            );
            tris.add2(
              reg.a_minx, reg.a_maxy, reg.a_maxz,
              reg.a_maxx, reg.a_maxy, reg.a_minz,
              reg.a_minx, reg.a_maxy, reg.a_minz
            );



          }
        }



        var rds = ge.webgl.shader.parse(`

<?=chunk('precision')?>
attribute vec3 a_point_position_rw;
attribute vec4 a_point_color_rw;

uniform mat4 u_view_projection_rw;
uniform mat4 u_model_rw;

varying vec3 point_color_v;

void vertex(){	    
    gl_Position = vec4(a_point_position_rw,1.0);	
    gl_Position.x-=1.0;
    point_color_v=a_point_color_rw.xyz;  
    gl_PointSize =a_point_color_rw.w;
}
<?=chunk('precision')?>
uniform sampler2D u_texture_rw;

varying vec3 point_color_v;
void fragment(void) {	        

vec2 uv;
vec4 c;
gl_FragColor.xyz=vec3(0.0);
for(int y=0;y<256;y++)
{
  for(int x=0;x<256;x++)
{
    uv.x=float(x)/255.0;
    uv.y=float(y)/255.0;
    c = texture2D(u_texture_rw, uv);
    if(c.r==point_color_v.r && c.g==point_color_v.g && c.b==point_color_v.b)
{
      gl_FragColor.xyz=point_color_v;
}
  }
}





gl_FragColor.w=1.0;
}



`);


        var pp = new ge.debug.points();
        e.ge_renderable.items.push(pp);
        e.ge_renderable.items.push(aabbs2);
        pp.material.shader = rds;

        aabbs.material.complete_render_mesh = function (renderer, shader, mesh) {

          if (!this.rd) {
            this.rd = new ge.webgl.render_target(renderer, 256, 256);
            this.rd.attach_depth_buffer().attach_color();
          }
          aabbs.clear();
          aabbs2.clear();
          pp.clear();
          for (var i = 0; i < m.ri; i++) {
            reg = t1.regions[m.regions_to_render[i].key];
            uint32_color_id[0] = reg_color;
            reg_color += 2000;
            reg.color = reg.color || [byte_id[0] / 255, byte_id[1] / 255, byte_id[2] / 255];
            aabbs.set_color(reg.color[0], reg.color[1], reg.color[2]);
            pp.add((i / 128), 0, 0, reg.color[0], reg.color[1], reg.color[2], 1);

            aabbs.add_aabb2(reg.a_minx, 0, reg.a_minz, reg.a_maxx, reg.a_maxy, reg.a_maxz);
            aabbs2.add_aabb2(reg.a_minx, 0, reg.a_minz, reg.a_maxx, reg.a_maxy, reg.a_maxz);
          }

          this.rd.bind();
          renderer.gl.ANGLE_instanced_arrays.drawElementsInstancedANGLE(this.final_draw_type, this.final_draw_count, ge.GL_UNSIGNED_INT, 0, mesh.boxes_count);

          renderer.set_default_viewport();
          renderer.draw_textured_quad(this.rd.color_texture, 0.35, 0.5, 0.35, 0.35);
        }


        pp.material.render_mesh = function (renderer, shader, mesh) {
          if (!this.rd) {
            this.rd = new ge.webgl.render_target(renderer, 256, 1);
            this.rd.attach_depth_buffer().attach_color();
          }

          this.rd.bind();
          if (mesh.points_count > 0) {
            renderer.use_direct_texture(aabbs.material.rd.color_texture, 0);
            renderer.gl_disable(ge.GL_DEPTH_TEST);
            renderer.gl.drawArrays(ge.GL_POINTS, 0, mesh.points_count);
            renderer.gl_enable(ge.GL_DEPTH_TEST);
          }

          renderer.set_default_viewport();
          renderer.draw_textured_quad(this.rd.color_texture, 1.5, -0.2, 2, 0.05);
        }
        app.render_system.renderer.post_processes.push(new ge.effects.post_process.blank({
          shader: ge.effects.post_process.shader.extend(`
void fragment(){	
	 vec4 color = texture2D(u_texture_input_rw, v_uv_rw);        			 
    color.r=1.0;
	 gl_FragColor =color;
}

          `),
          on_init: function () {

          },
          apply: function (renderer, input, output) {

            // this.rd.bind();      



            this.bind_output(renderer, output);
            renderer.use_direct_texture(input, 0);
            renderer.use_shader(ge.effects.post_process.shader);
            renderer.draw_full_quad();
          }
        }));



        m.on_render = function (camera) {
          m.update(camera, app.timer);
        }

      });



  }


  function test4() {


    var t1 = new ge.terrain.processor({
      region_size: 512, // size of a single region in unit
      world_size: 4096, // size of whole world (no of regions)
      terrain_quality: 4, // cannot be set during runtime, quality of terrain mesh(1-6) ,lower is better but cosume more memory and processing                  
      regions_from_image_url: [
        ["res/heightmap8.jpg",
          -4, -4,// position of regsion in world
          0.25,//  divide height from source
          1024, 1024,//  input image size
          16 //  scale terrain at runtime by this factor it must be power 2
        ]
      ],
    });


    app.create_renderable(new ge.terrain.mesh({
      processor: t1,
      quality_distance: 2000,
      draw_distance: 6000,
      detail_levels: [1, 8, 16, 32],
      region_distance: 8,
      terrain_quality: 6,
      wireframe: true,
      shaded: true,
      wire_color: [0.75, 0.75, 0.75],
      shaded_color: [0.5, 0.5, 0.5],
      time_step_size: 1 / 15,
      material: new ge.terrain.material({
        transparent1: 0.55,
        texture_tiles: [
          "res/dirt.jpg",
          "res/grass.jpg",
          "res/mud.jpg",
          "res/stone.jpg"
        ]
      })
    }),
      function (m, e) {

        var cm = new ge.terrain.mesh({
          processor: t1,
          quality_distance: 2000,
          draw_distance: 6000,
          detail_levels: [16, 32, 64, 128],
          fixed_detail: 32,
          region_distance: 8,
          terrain_quality: 7,
          wireframe: false,
          terrian_scale: [4, 4, 4],
          shaded: true,
          material: new ge.terrain.material.oclusion({

          })
        });


        app.display_debug = (function (_super) {
          return function (ctx) {
            _super.apply(this, [ctx]);
            ctx.fillText(m.ri + '/' + m.rendered_regions + " regions (" + m.region_max_tris + ")/" + m.tri_count + " Tris", 2, 100);
            ctx.fillText(cm.ri + " regions (" + cm.region_max_tris + ")/" + cm.tri_count + " Tris", 2, 130);
          }
        })(app.display_debug);

        console.log(m);


        var uint32_color_id = new Uint32Array(1);
        var bytes_color_id = new Uint8Array(uint32_color_id.buffer);
        var reg_color = 98982;
        var u_color_id_rw = new Float32Array(4);
        var reg;

        var pp = new ge.debug.points();
        e.ge_renderable.items.push(cm);
        e.ge_renderable.items.push(pp);


        pp.material.shader = ge.webgl.shader.parse(`
<?=chunk('precision')?>
attribute vec3 a_point_position_rw;
attribute vec4 a_point_color_rw;

uniform mat4 u_view_projection_rw;
uniform mat4 u_model_rw;

varying vec3 point_color_v;

void vertex(){	    
    gl_Position =vec4(a_point_position_rw,1.0);	
    point_color_v=a_point_color_rw.xyz; 
    gl_PointSize=1.0;
}
<?=chunk('precision')?>

uniform sampler2D u_texture_rw;

varying vec3 point_color_v;
void fragment(void) {	        

vec2 uv;
vec4 c;
vec4 vv;

vv.r=floor(point_color_v.r);
vv.g=floor(point_color_v.g);
vv.b=floor(point_color_v.b);
vv.a=255.0;
vv=vv/255.0;

gl_FragColor.xyz=vec3(0.0);
for(int y=0;y<256;y++)
{
  for(int x=0;x<256;x++)
{
    uv.x=float(x)/255.0;
    uv.y=float(y)/255.0;
    c = texture2D(u_texture_rw, uv);
    if(c.r==vv.r && c.g==vv.g && c.b==vv.b)
{
      gl_FragColor=vv;
}
  }
}




 //gl_FragColor=vv;

}

`);
        cm.material.render_mesh = function (renderer, shader, mesh) {
          if (!mesh.renderer) {
            mesh.renderer = renderer;
            return;
          }

          if (!this.rd) {
            this.rd = new ge.webgl.render_target(renderer, 256, 256);
            this.rd.attach_depth_buffer().attach_color();
          }

          this.rd.bind();
          mesh.render_terrain(renderer, shader, true);

          renderer.set_default_viewport();
          renderer.draw_textured_quad(this.rd.color_texture, 0.35, 0.5, 0.35, 0.35);

          if (pp.material.rd) {

            renderer.draw_textured_quad(pp.material.rd.color_texture, 0.15, -0.2, 0.85, 0.05);
          }

        }

        var reg_color_ids = new Uint32Array(256);
        var reg_color_ids_bytes = new Uint8Array(reg_color_ids.buffer);


        console.log("reg_color_ids", reg_color_ids);
        pp.material.camera_version = -1;
        var reg_color = 110;
        pp.material.render_mesh = function (renderer, shader, mesh) {
          if (renderer.active_camera.version === this.camera_version) return;

          this.camera_version = renderer.active_camera.version;
          //console.log(this.camera_version);
          if (!this.rd) {
            this.rd = new ge.webgl.render_target(renderer, 256, 1);
            this.rd.attach_color();
          }

          this.rd.bind();




          pp.clear();



          for (var i = 0; i < cm.ri; i++) {
            reg = t1.regions[cm.regions_to_render[i].key];

            if (!reg.color_id) {
              uint32_color_id[0] = reg_color;
              reg_color += 10110;
              reg.color_id = uint32_color_id[0];

            }

            //console.log(reg_color_ids[i], reg.color_id);


            for (var c = 0; c < 128; c++) {
              uint32_color_id[0] = reg_color_ids[c];
              //bytes_color_id[3] = 255;
              if (uint32_color_id[0] === reg.color_id) {
                reg.visibled = true;
              }
            }

            uint32_color_id[0] = reg.color_id;
            bytes_color_id[3] = 255;
            u_color_id_rw[0] = bytes_color_id[0];
            u_color_id_rw[1] = bytes_color_id[1];
            u_color_id_rw[2] = bytes_color_id[2];
            u_color_id_rw[3] = bytes_color_id[3];

            pp.add((i / 128) - 1, 0, 0, bytes_color_id[0], bytes_color_id[1], bytes_color_id[2], 1);
          }



          if (mesh.points_count > 0) {
            renderer.use_direct_texture(cm.material.rd.color_texture, 0);
            renderer.gl_disable(ge.GL_DEPTH_TEST);
            renderer.gl.drawArrays(ge.GL_POINTS, 0, mesh.points_count);

            renderer.gl_enable(ge.GL_DEPTH_TEST);

            renderer.gl.readPixels(0, 0, 128, 1, ge.GL_RGBA, ge.GL_UNSIGNED_BYTE, reg_color_ids_bytes);



          }

          renderer.set_default_viewport();
          // renderer.draw_textured_quad(this.rd.color_texture, 0.15, -0.2, 1, 0.05);
        }


        m.on_render = function (camera) {
          m.update(camera, app.timer);
          cm.update(camera, app.timer);

        }

      });



  }




  function test5() {


    var aabbs = new ge.debug.aabbs();

    var t1 = new ge.terrain.processor({
      region_size: 512, // size of a single region in unit
      world_size: 4096, // size of whole world (no of regions)
      terrain_quality: 4, // cannot be set during runtime, quality of terrain mesh(1-6) ,lower is better but cosume more memory and processing                  
      regions_from_image_url: [
        ["res/heightmap8.jpg",
          -4, -4,// position of regsion in world
          0.25,//  divide height from source
          1024, 1024,//  input image size
          16 //  scale terrain at runtime by this factor it must be power 2
        ]
      ],
    });


    var cm = new ge.terrain.collision_mesh({
      processor: t1,
      quality_distance: 2000,
      draw_distance: 4000,
      detail_levels1: [-8, -16, -32, -64, -128],
      fixed_detail: 32,
      region_distance: 8,
      terrain_quality: 7,
      wireframe1: true,
      terrian_scale: [2, 2, 2],
      shaded: false,
      wire_color: [2, 2, 2, 1],
      shaded_color: [0.5, 0.5, 0.5, 1],
      time_step_size: 1 / 5,
      material: new ge.terrain.material({
        transparent: 0.5,
        texture_tiles: [
          "res/dirt.jpg",
          "res/grass.jpg",
          "res/mud.jpg",
          "res/stone.jpg"
        ]
      })
    });

    app.create_renderable(new ge.terrain.mesh({
      processor: t1,
      quality_distance: 2000,
      draw_distance: 6000,
      detail_levels: [1, 8, 16, 32],
      region_distance: 8,
      terrain_quality: 6,
      wireframe: true,
      shaded: true,
      wire_color: [1, 1, 1],
      shaded_color: [0.5, 0.5, 0.5],
      time_step_size: 1 / 15,
      material: new ge.terrain.material({
        transparent: 0.75,
        texture_tiles: [
          "res/dirt.jpg",
          "res/grass.jpg",
          "res/mud.jpg",
          "res/stone.jpg"
        ],
        shader: `
    vec4 mix_texture_tiles(vec4 tile1,vec4 tile2,vec4 tile3,vec4 tile4,vec3 normal){
    return mix(tile1,mix(read_tile(u_texture_tiles_rw,4.0, 1.0,0.0), tile2,0.5),abs(normal.x));
    }
    void fragment(void){
    super_fragment();
    }
    `
      })
    }),
      function (m, e) {
        app.display_debug = (function (_super) {
          return function (ctx) {
            _super.apply(this, [ctx]);
            ctx.fillText(m.ri + '/' + m.rendered_regions + " regions (" + m.region_max_tris + ")/" + m.tri_count + " Tris /ms " + m.render_time, 2, 100);
            //ctx.fillText(cm.ri + '/' + cm.rendered_regions + " regions (" + cm.region_max_tris + ")/" + cm.tri_count + " Tris /ms " + cm.render_time, 2, 120);


          }

        })(app.display_debug);

        e.ge_renderable.items.push(cm);
        e.ge_renderable.items.push(aabbs);

        console.log(m);
        console.log(cm);

        var reg;

        m.on_render = function (camera) {
          m.update(camera, app.timer);
          cm.update(camera, app.timer);

          if (cm.cam_reg) {
            reg = cm.cam_reg;
            if (reg.aabbs) {
              aabbs.clear();
              var rx = (t1.regions[reg.key].x - t1.region_size_half);
              var rz = (t1.regions[reg.key].z - t1.region_size_half);


              reg.aabbs.forEach(function (aa) {
                aabbs.add_aabb2(aa[0] + rx, t1.regions[reg.key].a_miny, aa[2] + rz, aa[3] + rx, aa[4], aa[5] + rz);
              });
            }
          }

        }

      });




  }


  function test6() {
    var t1 = new ge.terrain.processor({
      region_size: 1024,
      world_size: 4096,
      terrain_quality: 4,

      regions_from_image_url: [
        ["res/heightmap17.jpg",
          -4, -4,
          0.125,
          1024, 1024,
          32
        ]
      ],
      worker: function (thread) {
        console.log('worder overload hogaya');
      }

    });

    console.log(t1);


    app.create_renderable(new ge.terrain.mesh({
      processor: t1,
      quality_distance: 2400,
      draw_distance: 10000,
      detail_levels: [4, 8, 64, 128],
      region_distance: 16,
      fixed_detail1: 99,
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

        var cm = new ge.terrain.mesh({
          processor: t1,
          quality_distance: 2000,
          draw_distance: 20000,
          detail_levels: [1, 4, 8, 16, 32],
          region_distance: 32,
          fixed_detail: 99,
          terrain_quality: 8,
          wireframe: true,
          shaded: true,
          region_offset: 8,
          region_margin: 4,
          terrian_scale: [1, 1, 1],
          wire_color: [1, 1, 1],
          shaded_color: [0.75, 0.75, 0.75],
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
        });

        //  e.ge_renderable.items.push(cm);
        app.display_debug = (function (_super) {
          return function (ctx) {
            _super.apply(this, [ctx]);
            ctx.fillText(m.ri + '/' + m.rendered_regions + " regions (" + m.region_max_tris + ")/" + m.tri_count + " Tris /ms " + m.render_time, 2, 100);
            ctx.fillText(cm.ri + '/' + cm.rendered_regions + " regions (" + cm.region_max_tris + ")/" + cm.tri_count + " Tris /ms " + cm.render_time, 2, 130);
          }
        })(app.display_debug);
        m.on_render = function (camera) {
          m.update(camera, app.timer);
          //cm.update(camera, app.timer);
        }
      });
  }

  function test7() {
    var t1 = new ge.terrain.host({
      region_size: 1024,
      world_size: 4096,
      terrain_quality: 4,
      regions_from_image_url: [
        ["res/heightmap10.jpg",
          -4, -4,
          0.125,
          1024, 1024,
          16
        ]
      ]
    });

    console.log(t1);

  }

  function test_skeleton1() {
    app.create_renderable(new ge.geometry.mesh({
      geometry: ge.geometry.shapes.plane({ width: 400, height: 400 }).scale_position_rotation(1, 1, 1, 0, 0, 0, RD(-90), 0, 0),
      material: new ge.shading.shaded_material({ specular: [0, 0, 0] })
    }),
      function (m, e) {


        m.material.texture = ge.webgl.texture.from_url("res/grass.jpg", true);
        math.mat3.translate_rotate_scale(m.material.texture_matrix, 0, 0, 16, 16, 0);
        m.material.flags += ge.SHADING.RECEIVE_SHADOW;

      });


    var j1 = [
      { name: 'root', position: [0, 5, 0], skin_index: -1 },
      { name: 'hips', position: [0, 0, 0], pn: 'root', skin_index: -1 },
      { name: 'spine1', position: [0, 1, 0] },
      { name: 'spine2', position: [0, 1, 0] },

      { name: 'l_upper_arm', pn: 'spine2', position: [1, 0, 0], eular: [0, 0, -RD(90)] },
      { name: 'l_fore_arm', position: [0, 1, 0] },
      { name: 'l_arm', position: [0, 1, 0] },



      { name: 'r_upper_arm', pn: 'spine2', position: [-1, 0, 0], eular: [0, 0, RD(90)] },
      { name: 'r_fore_arm', position: [0, 1, 0] },
      { name: 'r_arm', position: [0, 1, 0] },



      { name: 'l_upper_leg', pn: 'hips', position: [0.7, 0, 0], eular: [0, 0, -RD(180)] },
      { name: 'l_fore_leg', position: [0, 1.8, 0] },
      { name: 'l_leg', position: [0, 1.5, 0] },

      { name: 'r_upper_leg', pn: 'hips', position: [-0.7, 0, 0], eular: [0, 0, -RD(180)] },
      { name: 'r_fore_leg', position: [0, 1.8, 0] },
      { name: 'r_leg', position: [0, 1.5, 0] },




      { name: 'spine_trackor', pn: 'root', position: [0, 2, 0], skin_index: -1 },
      { name: 'spine_trackor_limit', pn: 'root', position: [0, 2.5, 0], skin_index: -1 },


      { name: 'eff1', pn: 'root', position: [3, 2, 0], skin_index: -1 },
      { name: 'eff2', pn: 'root', position: [-3, 2, 0], skin_index: -1 },

      { name: 'eff3', pn: 'root', position: [1, -3.5, 0], skin_index: -1 },
      { name: 'eff4', pn: 'root', position: [-1, -3.5, 0], skin_index: -1 },


    ];

    fin.url_loader("res/Idle.fbx0.json", function (data) {
      var s = JSON.parse(data);
      console.log(s);
      var gg = ge.geometry.geometry_data.create({
        vertices: new Float32Array(s.vertices),
        normals: new Float32Array(s.normals), 
        uvs: new Float32Array(s.uv),
        attr: {
          "a_joints_indices": { data: new Float32Array(s.skin_indices), item_size: 4 },
          "a_joints_weights": { data: new Float32Array(s.skin_weights), item_size: 4 }
        }
      });
      gg.scale_position_rotation(0.1, 0.1, 0.1, 0, 0, 0, 0, 0, 0);

      var sk1 = app.create_entity({
        components: {
          'animations_player': {
            animations: [
              {
                duration: 4,
                blocks: [
                  { oi: 0, time: 0, length: 1, flat: true, frames: [-1, 1, -1] },
                  {
                    oi: 1, time: 0, length: 1, fr_size: 3, flat: true, frames: [33.5106, 84.1613, 1.57659, -1.9712, -7.3214, -4.2806, 3.73826, 8.70171, -0.905082, -0.508403, -0.260231, -0.131595, -2.64985, 5.13383, -2.42413, 9.30075, -32.6696, -1.75061, -0.0, 0.0, 0.0, -0.0, 0.0, 0.0, -9.64055e-14, 1.03358e-14, -3.96575e-14, 36.3757, 63.9356, 60.778, -24.1387, -19.3585, 50.0512, -0.00662153, 2.32276, 0.326623, 6.90467e-11, -4.95367e-10, -3.89427e-11, 1.16377e-10, -8.684e-10, -6.51624e-11, 6.90467e-11, -4.9537e-10, -3.89491e-11, 7.73091, 5.47488, 0.417314, 6.90469e-11, -4.9536e-10, -3.89459e-11, 2.90554, 0.965183, 0.102902, 6.90528e-11, -4.95375e-10, -3.89443e-11, 10.2786, 0.731801, 0.0259123, 6.90381e-11, -4.95376e-10, -3.89364e-11, 2.22167, -0.733487, -0.20892, -9.62232e-14, 1.03391e-14, -3.98563e-14, -53.8875, 51.7748, -46.4692, 27.2817, -27.3288, -62.9967, 1.03305, -27.5721, 4.20848, 1.63528e-10, -2.61899e-09, -8.7207e-10, 3.00681e-10, -4.51401e-09, -1.49961e-09, 1.63526e-10, -2.619e-09, -8.7207e-10, -7.73091, 5.47488, -0.417314, 1.63531e-10, -2.61899e-09, -8.72067e-10, -2.90554, 0.965183, -0.102902, 1.63521e-10, -2.619e-09, -8.72074e-10, -10.2786, 0.731801, -0.0259123, 1.63532e-10, -2.61899e-09, -8.72083e-10, -2.22167, -0.733487, 0.20892, -2.03217e-16, 0.0, -3.88251e-19, 1.39531, -14.2579, 12.3545, -0.159916, 30.3581, 0.440515, -2.25812, -7.99118, -7.83036, 2.03217e-16, 0.0, 3.88251e-19, 2.9451, -8.70921, 14.5044, 0.177612, 32.5589, -0.807863, 9.59324, -16.4132, 22.593]
                  }
                ]
              }
            ]
          },
          'skeleton_item': {
            display: false,
            all_skin_joints: true,
            joints: s.joints,
            pre_scale: [0.1, 0.1, 0.1]
          },
          'ge_transform': {
            scale1: [0.3, 0.3, 0.3]
          },
          'ge_renderable': {
            items: []
          }

        }
      });

      var skm = new ge.geometry.mesh({
        geometry: gg,
        material: ecs.systems["skeleton_system"].skin_material(new ge.shading.shaded_material({
          cast_shadows: true, receive_shadows:false, wireframe: false, transparent: 0.99,
          texture: ge.webgl.texture.from_url("res/3601003.png", true,256),
          specular: [0, 0, 0]
        }))
      });
      skm.skeleton_item = sk1.skeleton_item;

      math.mat3.translate_rotate_scale(skm.material.texture_matrix, 0, 0, 16, 16, 0);
      sk1.ge_renderable.items.push(skm);
      console.log(sk1);
      var a1 = sk1.animations_player;
     

      console.log(a1);

      var ads = {
        "mixamorig1RightForeArm": {
          eular: [0, 0, 0],
          centerAngle: 0,
          rotationRange: Math.PI / 4,
          phaseOffset: 0
        },
        "mixamorig1Spine": {
          eular: [0, 0, 0],
          centerAngle: -Math.PI / 4,
          rotationRange: Math.PI / 4,
          phaseOffset: -1
        },
        
        
      };

      ads["mixamorig1Neck"] = ads["mixamorig1RightForeArm"]

      for (var k in ads) {
        sk1.skeleton_item[k].ge_transform.animation_data = ads[k];
      }


      var ad;
      app.systems["animation_system"].on_frame.add(function () {
        var phase = app.timer;
        for (var k in ads) {
          ad = ads[k];
         ad.eular[0] = ad.centerAngle + Math.sin(phase+ ad.phaseOffset) * ad.rotationRange;
        }
        //ads["mixamorig1RightForeArm"].eular[0] = RD(a1.anim_data[1]);
        //ads["mixamorig1RightForeArm"].eular[1] = RD(a1.anim_data[2]);
        //ads["mixamorig1RightForeArm"].eular[2] = RD(a1.anim_data[3]);

        ads["mixamorig1Spine"].eular[1] = a1.anim_data[0]

      });

    });
    
    





  }


  function test_skeleton2() {
    app.create_renderable(new ge.geometry.mesh({
      geometry: ge.geometry.shapes.plane({ width: 400, height: 400 }).scale_position_rotation(1, 1, 1, 0, 0, 0, RD(-90), 0, 0),
      material: new ge.shading.shaded_material({ specular: [0, 0, 0] })
    }),
      function (m, e) {


        m.material.texture = ge.webgl.texture.from_url("res/grass.jpg", true);
        math.mat3.translate_rotate_scale(m.material.texture_matrix, 0, 0, 16, 16, 0);
        m.material.flags += ge.SHADING.RECEIVE_SHADOW;

      });



    fin.url_loader("res/Idle.fbx0.json", function (data) {
      var s = JSON.parse(data);
      console.log(s);
      var gg = ge.geometry.geometry_data.create({
        vertices: new Float32Array(s.vertices),
        normals: new Float32Array(s.normals),
        uvs: new Float32Array(s.uv),
        attr: {
          "a_joints_indices": { data: new Float32Array(s.skin_indices), item_size: 4 },
          "a_joints_weights": { data: new Float32Array(s.skin_weights), item_size: 4 }
        }
      });
      gg.scale_position_rotation(0.1, 0.1, 0.1, 0, 0, 0, 0, 0, 0);

      var sk1 = app.create_entity({
        components: {
          'animations_player': {
            animations: [
              {
                duration: 0.25,
                blocks: [
                  { oi: 0, time: 0, length: 1, flat: true, frames: [-1, 1, -1] },                 
                ]
              }
            ]
          },
          'skeleton_item': {
            display: true,
            all_skin_joints: true,
            joints: s.joints,
            pre_scale: [0.1, 0.1, 0.1]
          },
          'ge_transform': {
            scale1: [0.3, 0.3, 0.3]
          },
          'ge_renderable': {
            items: []
          }

        }
      });

      var skm = new ge.geometry.mesh({
        geometry: gg,
        material: ecs.systems["skeleton_system"].skin_material(new ge.shading.shaded_material({
          cast_shadows: true, receive_shadows: false, wireframe: false, transparent: 0.90,
         
          specular: [0, 0, 0]
        }))
      });
      skm.skeleton_item = sk1.skeleton_item;

      math.mat3.translate_rotate_scale(skm.material.texture_matrix, 0, 0, 16, 16, 0);
      sk1.ge_renderable.items.push(skm);
      console.log(sk1);


      var names = "mixamorig1Hips,mixamorig1Neck,mixamorig1Spine,mixamorig1Spine1,mixamorig1Spine2,mixamorig1LeftShoulder,mixamorig1LeftArm,mixamorig1LeftForeArm,mixamorig1LeftLeg,mixamorig1LeftUpLeg,mixamorig1RightShoulder,mixamorig1RightArm,mixamorig1RightForeArm,mixamorig1RightLeg,mixamorig1RightUpLeg".split(",");

      var amimation_data = {};
      names.forEach(t => {
        amimation_data[t] = {
          eular: [0, 0, 0],
          position: [0, 0, 0],
          xa: [0, 0, 1],
          ya: [0, 0, 1],
          za: [0, 0, 1]
        };
        

        sk1.skeleton_item[t].ge_transform.animation_data = amimation_data[t];

      });

      var j$ = html.json_editor(amimation_data, function (o) {


      });
      j$.setAttribute("style", "position:absolute;right:2px;width:300px");

      document.body.appendChild(j$);

      fin.url_loader("res/02_01.bvh", function (data) {
        var b = bvh.parse(data);
        console.log(b);
      });



      var total_frames, time_per_frame
      var time1, f1, f2, j;
      function frames_values(time, frames) {
        time = (app.timer % time) / time;
        time_per_frame = 1 / (frames.length - 1);

        f1 = (Math.floor((frames.length - 1) * time));
        f2 = ((f1 + 1) * 1);
        time1 = time_per_frame * f1;
        
        j = (time - time1) / ((time1 + time_per_frame) - time1);

        return frames[f1] + (frames[f2] - frames[f1]) * j;

      }

      var k, ad, timer = 0;

      var tframes = [-1, 1, -1];
      app.on_frame.add(function () {


        for (k in amimation_data) {
          ad = amimation_data[k];

          ad.eular[0] = ad.xa[0] + frames_values(ad.xa[2], tframes) * ad.xa[1];
          ad.eular[1] = ad.ya[0] + frames_values(ad.ya[2], tframes) * ad.ya[1];
          ad.eular[2] = ad.za[0] + frames_values(ad.za[2], tframes) * ad.za[1];

          
        }

      });

    });







  }


  function test_skeleton3() {
    app.create_renderable(new ge.geometry.mesh({
      geometry: ge.geometry.shapes.plane({ width: 400, height: 400 }).scale_position_rotation(1, 1, 1, 0, 0, 0, RD(-90), 0, 0),
      material: new ge.shading.shaded_material({ specular: [0, 0, 0] })
    }),
      function (m, e) {


        m.material.texture = ge.webgl.texture.from_url("res/grass.jpg", true);
        math.mat3.translate_rotate_scale(m.material.texture_matrix, 0, 0, 16, 16, 0);
        m.material.flags += ge.SHADING.RECEIVE_SHADOW;

      });



    fin.url_loader("res/Idle.fbx0.json", function (data) {
      var s = JSON.parse(data);
      console.log(s);
      var gg = ge.geometry.geometry_data.create({
        vertices: new Float32Array(s.vertices),
        normals: new Float32Array(s.normals),
        uvs: new Float32Array(s.uv),
        attr: {
          "a_joints_indices": { data: new Float32Array(s.skin_indices), item_size: 4 },
          "a_joints_weights": { data: new Float32Array(s.skin_weights), item_size: 4 }
        }
      });
      gg.scale_position_rotation(0.1, 0.1, 0.1, 0, 0, 0, 0, 0, 0);

      var sk1 = app.create_entity({
        components: {
          'animations_player': {
            animations: []
          },
          'skeleton_item': {
            display: true,
            all_skin_joints: true,
            joints: s.joints,
            pre_scale: [0.1, 0.1, 0.1]
          },
          
          'ge_renderable': {
            items: []
          },
          'ge_transform': {}


        }
      });

      var skm = new ge.geometry.mesh({
        geometry: gg,
        material: ecs.systems["skeleton_system"].skin_material(new ge.shading.shaded_material({
          cast_shadows: true, receive_shadows: false, wireframe: true, transparent1: 0.90,

          specular: [0, 0, 0]
        }))
      });
      skm.skeleton_item = sk1.skeleton_item;
      var animations_player = sk1.animations_player;

      


      math.mat3.translate_rotate_scale(skm.material.texture_matrix, 0, 0, 16, 16, 0);
      sk1.ge_renderable.items.push(skm);
      console.log(sk1);



      fin.url_loader("res/walk_loop.bvh", function (data) {
        var b = bvh.parse(data);
        var anim1 = {
          duration: 5,
          blocks: []
        };

        var oi = 0;
        var jblocks = {};
        b.joints.forEach(function (j) {
          if (j.name !== "") {
            j.adata = {
              position: [0, 0, 0],
              eular: [0, 0, 0]
            };
            if (j.positions.length > 0) {
              j.positionsBlock = { name: j.name, fr_size: 3, key: "position", oi: oi, time: 0, length: 1, flat: true, frames: j.positions };
              anim1.blocks.push(j.positionsBlock);
            }
            if (j.rotations.length > 0) {
              j.rotationsBlock = { name: j.name, fr_size: 3, key: "eular", oi: oi, time: 0, length: 1, flat: true, frames: j.rotations };
              anim1.blocks.push(j.rotationsBlock);
            }
            jblocks[j.name] = j;
            oi += j.channels.length;
          }

        });
        animations_player.animations.push(anim1);
        console.log(animations_player);
        console.log(b);

        var dp1 = html.createElm("select");
        var dp2 = html.createElm("select");

        var div = html.createElm("div");
        div.setAttribute("style", "position:absolute;right:5px;top:5px");

        div.appendChild(dp1);
        div.appendChild(dp2);

        document.body.appendChild(div);

        html.setSelectData(dp1, sk1.skeleton_item.joints_names,true);

        html.setSelectData(dp2, Object.keys(jblocks), true);
        var current_joint = undefined;
        dp1.oninput = function () {
          current_joint = sk1.skeleton_item[this.value];
          if (current_joint) dp2.value = current_joint.bvh;
        };

        dp2.oninput = function () {
          if (current_joint) {
            current_joint.bvh = this.value;
            current_joint.ge_transform.animation_data = undefined;
            if (jblocks[current_joint.bvh]) {
              current_joint.ge_transform.animation_data = jblocks[current_joint.bvh].adata;
            }
            else current_joint.ge_transform.require_update = 1;
            console.log(current_joint.ge_transform.animation_data);
          }
        };


        var jb, k, oi;
        var ad = animations_player.anim_data;
        app.on_frame.add(function () {

          for (k in jblocks) {
            jb = jblocks[k];

            if (jb.rotationsBlock) {
              oi = jb.rotationsBlock.oi;

              jb.adata.eular[0] = ad[oi];
              jb.adata.eular[1] = ad[oi + 1];
              jb.adata.eular[2] = ad[oi + 2];
            }


            if (jb.positionsBlock2) {
              oi = jb.positionsBlock.oi;

              jb.adata.position[0] = ad[oi];
              jb.adata.position[1] = ad[oi + 1];
              jb.adata.position[2] = ad[oi + 2];

            }

          }


        });

      });



   

    });







  }



  function test_skeleton4() {
    app.create_renderable(new ge.geometry.mesh({
      geometry: ge.geometry.shapes.plane({ width: 400, height: 400 }).scale_position_rotation(1, 1, 1, 0, 0, 0, RD(-90), 0, 0),
      material: new ge.shading.shaded_material({ specular: [0, 0, 0] })
    }),
      function (m, e) {


        m.material.texture = ge.webgl.texture.from_url("res/grass.jpg", true);
        math.mat3.translate_rotate_scale(m.material.texture_matrix, 0, 0, 16, 16, 0);
        m.material.flags += ge.SHADING.RECEIVE_SHADOW;

      });



    fin.url_loader("res/Idle.fbx0.json", function (data) {
      var s = JSON.parse(data);
      console.log(s);
      var gg = ge.geometry.geometry_data.create({
        vertices: new Float32Array(s.vertices),
        normals: new Float32Array(s.normals),
        uvs: new Float32Array(s.uv),
        attr: {
          "a_joints_indices": { data: new Float32Array(s.skin_indices), item_size: 4 },
          "a_joints_weights": { data: new Float32Array(s.skin_weights), item_size: 4 }
        }
      });
      gg.scale_position_rotation(0.1, 0.1, 0.1, 0, 0, 0, 0, 0, 0);

      var sk1 = app.create_entity({
        components: {
          'animations_player': {
            animations: [
              {
                duration: 0.25,
                blocks: [
                  { oi: 0, time: 0, length: 1, flat: true, frames: [-1, 1, -1] },
                ]
              }
            ]
          },
          'skeleton_item': {
            display: false,
            all_skin_joints: true,
            joints: s.joints,
            pre_scale: [0.1, 0.1, 0.1]
          },
          'ge_transform': {
            scale1: [0.3, 0.3, 0.3]
          },
          'ge_renderable': {
            items: []
          }

        }
      });

      var skm = new ge.geometry.mesh({
        geometry: gg,
        material: ecs.systems["skeleton_system"].skin_material(new ge.shading.shaded_material({
          cast_shadows: true, receive_shadows: false, wireframe: true, transparent1: 0.90,

          specular: [0, 0, 0]
        }))
      });
      skm.skeleton_item = sk1.skeleton_item;

      math.mat3.translate_rotate_scale(skm.material.texture_matrix, 0, 0, 16, 16, 0);
      sk1.ge_renderable.items.push(skm);
      console.log(sk1);


      var names = "mixamorig1Hips,mixamorig1Neck,mixamorig1Spine,mixamorig1Spine1,mixamorig1Spine2,mixamorig1LeftShoulder,mixamorig1LeftArm,mixamorig1LeftForeArm,mixamorig1LeftLeg,mixamorig1LeftUpLeg,mixamorig1RightShoulder,mixamorig1RightArm,mixamorig1RightForeArm,mixamorig1RightLeg,mixamorig1RightUpLeg".split(",");

      var amimation_data = {};
      names.forEach(t => {
        amimation_data[t] = {
          eular: [0, 0, 0],
          position: [0, 0, 0],
          xa: [0, 0, 1,0.5],
          ya: [0, 0, 1, 0.5],
          za: [0, 0, 1, 0.5]
        };


        sk1.skeleton_item[t].ge_transform.animation_data = amimation_data[t];

      });

      var j$ = html.json_editor(amimation_data, function (o) {


      });
      j$.setAttribute("style", "position:absolute;right:2px;width:300px");

      document.body.appendChild(j$);

    


      var total_frames, time_per_frame
      var time1, f1, f2, j;
      function frames_values(time, frames,gain) {
        time = (app.timer % time) / time;
        time_per_frame = 1 / (frames.length - 1);

        f1 = (Math.floor((frames.length - 1) * time));
        f2 = ((f1 + 1) * 1);
        time1 = time_per_frame * f1;

        j = (time - time1) / ((time1 + time_per_frame) - time1);
        j = easingFn.easingSinusoidalInOut(j);
        //j = math.utils.get_gain(j, gain);
        return frames[f1] + (frames[f2] - frames[f1]) * j;

      }

      var k, ad, timer = 0;

      var tframes = [-1, 1, -1];
      app.on_frame.add(function () {


        for (k in amimation_data) {
          ad = amimation_data[k];

          ad.eular[0] = ad.xa[0] + frames_values(ad.xa[2], tframes, ad.xa[3]) * ad.xa[1];
          ad.eular[1] = ad.ya[0] + frames_values(ad.ya[2], tframes, ad.ya[3]) * ad.ya[1];
          ad.eular[2] = ad.za[0] + frames_values(ad.za[2], tframes, ad.za[3]) * ad.za[1];


        }

      });

    });







  }



  function test_skeleton5() {
    app.create_renderable(new ge.geometry.mesh({
      geometry: ge.geometry.shapes.plane({ width: 400, height: 400 }).scale_position_rotation(1, 1, 1, 0, 0, 0, RD(-90), 0, 0),
      material: new ge.shading.shaded_material({ specular: [0, 0, 0] })
    }),
      function (m, e) {


        m.material.texture = ge.webgl.texture.from_url("res/grass.jpg", true);
        math.mat3.translate_rotate_scale(m.material.texture_matrix, 0, 0, 16, 16, 0);
        m.material.flags += ge.SHADING.RECEIVE_SHADOW;

      });



    fin.url_loader("res/Idle.fbx0.json", function (data) {
      var s = JSON.parse(data);
      console.log(s);
      var gg = ge.geometry.geometry_data.create({
        vertices: new Float32Array(s.vertices),
        normals: new Float32Array(s.normals),
        uvs: new Float32Array(s.uv),
        attr: {
          "a_joints_indices": { data: new Float32Array(s.skin_indices), item_size: 4 },
          "a_joints_weights": { data: new Float32Array(s.skin_weights), item_size: 4 }
        }
      });
      gg.scale_position_rotation(0.1, 0.1, 0.1, 0, 0, 0, 0, 0, 0);

      var sk1 = app.create_entity({
        components: {
          'animations_player': {
            animations: [
              {
                duration: 0.25,
                blocks: [
                  { oi: 0, time: 0, length: 1, flat: true, frames: [-1, 1, -1] },
                ]
              }
            ]
          },
          'skeleton_item': {
            display: false,
            all_skin_joints: true,
            joints: s.joints,
            pre_scale: [0.1, 0.1, 0.1]
          },
          'ge_transform': {
            scale1: [0.3, 0.3, 0.3]
          },
          'ge_renderable': {
            items: []
          }

        }
      });

      var skm = new ge.geometry.mesh({
        geometry: gg,
        material: ecs.systems["skeleton_system"].skin_material(new ge.shading.shaded_material({
          cast_shadows: true, receive_shadows: false, wireframe: true, transparent1: 0.90,

          specular: [0, 0, 0]
        }))
      });
      skm.skeleton_item = sk1.skeleton_item;

      math.mat3.translate_rotate_scale(skm.material.texture_matrix, 0, 0, 16, 16, 0);
      sk1.ge_renderable.items.push(skm);
      console.log(sk1);


      var animation_data = {
        "speed": 1,
        angle: 1
      };
      var dp1 = html.createElm("select");
      var dp2 = html.createElm("select");

      var div = html.createElm("div");
      div.setAttribute("style", "position:absolute;right:5px;top:5px;width:400px");

      div.appendChild(dp1);
      div.appendChild(dp2);

      html.setSelectData(dp1, sk1.skeleton_item.joints_names, true);
      var props = ["xp", "yp", "zp", "xa", "ya", "za"];

      function set_attr(o, keys, i, v) {
        if (i < keys.length-1) {
          set_attr(o[keys[i]], keys, i + 1, v);
        }
        else {
          o[keys[i]] = v;
          
        }
      }

      function attr(j, o) {
       
        fin.traverse_object(o, function (pkey, value, obj, key) {
         
          set_attr(j, pkey.split("."), 0, value);

        });
      }
      function set_data(key,att) {
        var ad = {
          "position": new Float32Array(6),
        };
        ad.eular = new Float32Array(ad.position.buffer, 12, 3);

        props.forEach(function (p) {
          ad[p] = {
            "enabled": false,
            "start": 0,
            "range": 0,
            "offset": 0,
            "speed": 3
          }
        });
        if (att) {
          attr(ad, att);

        }
        animation_data[key] = ad;
        sk1.skeleton_item[key].ge_transform.animation_data = ad;
        
      }

     

      dp1.oninput = function () {
        console.log(this.value);
        if (!animation_data[this.value]) {
          set_data(this.value);
          display_json();
        }
      };
      var j$
      function display_json() {
        j$ = html.json_editor(animation_data, undefined, j$);
        //j$.setAttribute("style", "margin-top:40px");

        div.appendChild(j$);
      }

      dp1.onkeyup = function (e) {
        if (e.key === "x") {
          delete animation_data[this.value];
          sk1.skeleton_item[this.value] = undefined;
          display_json();
        }
      }

      document.body.appendChild(div);
      
      display_json();

   
      var PI = Math.PI;
      var PI2 = PI / 2;
      var PI3 = PI / 3;
      var PI4 = PI / 4;
      var PI5 = PI / 5;
      var PI6 = PI / 6;
      var PI7 = PI / 7;
      var PI8 = PI / 8;

      var A45 = RD(45);
      var A80 = RD(80);
      var A90 = RD(90);


      

      set_data("mixamorig1RightUpLeg", {
        xa: { enabled: true }
      });

      set_data("mixamorig1RightLeg", {
        xa: {
          enabled: true
        },

      });

      set_data("mixamorig1RightArm", {
        xa: { enabled: true, start: A80 },
        ya: { enabled:true,range:-A45 }
      });
      set_data("mixamorig1RightForeArm", {
       
        za: { enabled: true, start: -A45, range: A45 }
      });

      set_data("mixamorig1LeftUpLeg", {
        xa: { enabled: true }
      });
      set_data("mixamorig1LeftLeg", {
        xa: { enabled: true }
      });

      set_data("mixamorig1LeftArm", {
        xa: { enabled: true, start: A80 },
        ya: { enabled: true, range: -A45 }
      });
      set_data("mixamorig1LeftForeArm", {
        za: { enabled: true, start: A45, range: A45 }
      });


      set_data("mixamorig1Spine2", {
        xa: { enabled: true, start: 0, range: -A45/3 }
      });
      set_data("mixamorig1Hips", {
        yp: { enabled: true, start: 0.4, range: -0.4 }
      });


      display_json();



      var k, ad,ap, timer = 0;

      //    ad.eular[0] = ad.centerAngle + Math.sin(phase+ ad.phaseOffset) * ad.rotationRange;
      var mixamorig1RightUpLeg = animation_data["mixamorig1RightUpLeg"];
      var mixamorig1RightLeg = animation_data["mixamorig1RightLeg"];
      var mixamorig1RightArm = animation_data["mixamorig1RightArm"];
      var mixamorig1RightForeArm = animation_data["mixamorig1RightForeArm"];


      var mixamorig1LeftUpLeg = animation_data["mixamorig1LeftUpLeg"];
      var mixamorig1LeftLeg = animation_data["mixamorig1LeftLeg"];
      var mixamorig1LeftArm = animation_data["mixamorig1LeftArm"];
      var mixamorig1LeftForeArm = animation_data["mixamorig1LeftForeArm"];


      var angle;
      app.on_frame.add(function () {

        angle = animation_data.angle * A45;
        mixamorig1RightUpLeg.xa.range = angle;
        mixamorig1RightLeg.xa.range = angle/1.2;
        mixamorig1RightLeg.xa.start = -angle  / 1.5;
        mixamorig1RightLeg.xa.offset = -angle / 2;

        mixamorig1RightArm.ya.range = -angle / 1.2;

        mixamorig1RightForeArm.za.range = angle/1.2;
        mixamorig1RightForeArm.za.start = -angle/1.2;


        mixamorig1LeftUpLeg.xa.range = -angle;
        mixamorig1LeftLeg.xa.range = -angle/1.2;
        mixamorig1LeftLeg.xa.start = -angle / 1.5;

        mixamorig1LeftLeg.xa.offset = -angle / 2;
        mixamorig1LeftArm.ya.range = -angle / 1.2;

        mixamorig1LeftForeArm.za.range = angle / 1.2;
        mixamorig1LeftForeArm.za.start = angle / 1.2;




        for (k in animation_data) {
          if (sk1.skeleton_item[k]) {
            ad = animation_data[k];
            props.forEach(function (p, i) {
              ap = ad[p];
              ad.position[i] = 0;
              if (ap.enabled) {
                ad.position[i] = ap.start + Math.sin(ap.offset + app.timer * (ap.speed * animation_data.speed)) * ap.range;

              }
            });
          }
          
        }
      });

    });







  }

  

  function test_skeleton6() {
    app.create_renderable(new ge.geometry.mesh({
      geometry: ge.geometry.shapes.plane({ width: 400, height: 400 }).scale_position_rotation(1, 1, 1, 0, 0, 0, RD(-90), 0, 0),
      material: new ge.shading.shaded_material({ specular: [0, 0, 0] })
    }),
      function (m, e) {


        m.material.texture = ge.webgl.texture.from_url("res/grass.jpg", true);
        math.mat3.translate_rotate_scale(m.material.texture_matrix, 0, 0, 16, 16, 0);
        m.material.flags += ge.SHADING.RECEIVE_SHADOW;

      });






    var j1 = [
      { name: 'root', position: [0, 5, 0], skin_index: -1 },
      { name: 'hips', position: [0, 0, 0], pn: 'root', skin_index: -1 },
      { name: 'spine1', position: [0, 1, 0] },
      { name: 'spine2', position: [0, 1, 0] },

      { name: 'l_upper_arm', pn: 'spine2', position: [1, 0, 0], eular: [0, 0, -RD(90)] },
      { name: 'l_fore_arm', position: [0, 1, 0] },
      { name: 'l_arm', position: [0, 1, 0] },



      { name: 'r_upper_arm', pn: 'spine2', position: [-1, 0, 0], eular: [0, 0, RD(90)] },
      { name: 'r_fore_arm', position: [0, 1, 0] },
      { name: 'r_arm', position: [0, 1, 0] },



      { name: 'l_upper_leg', pn: 'hips', position: [0.7, 0, 0], eular: [0, 0, -RD(180)] },
      { name: 'l_fore_leg', position: [0, 1.8, 0] },
      { name: 'l_leg', position: [0, 1.5, 0] },

      { name: 'r_upper_leg', pn: 'hips', position: [-0.7, 0, 0], eular: [0, 0, -RD(180)] },
      { name: 'r_fore_leg', position: [0, 1.8, 0] },
      { name: 'r_leg', position: [0, 1.5, 0] },



    ];

    var selected_joint = 0;
    var sk1 = app.create_entity({
      components: {

        'skeleton_item': {
          display: true,
          joints: j1,
          on_joint_display: function (j, shader, material) {

            if (j.uuid !==selected_joint) {
              material.set_ambient(1, 0, 0);
            }
            else {
              material.set_ambient(0.5, 0.5, 0.5);

            }

            shader.set_uniform("u_object_material_rw", material.object_material);

          }
        },
        'ge_transform': {},
        'ge_renderable': {
          items: []
        }

      }
    });

    console.log(sk1);
  }


  test_skeleton6();


  app.attach_component(camera, 'ge_mouse_camera_controller', {
    element: app.render_system.renderer.canvas,
    wheel_delta: 0.01,
    on_mouse_down: function (x, y, e) {
      app.render_system.picking_mouse_x = x;
      app.render_system.picking_mouse_y = y;
    },
    on_mouse_up: function (x, y, e) {
      camera.ge_camera.is_locked = false;
    },
  });
  



  function pa_setup() {
    var pa = new ge.effects.post_process.picture_adjustment({ enabled: true });

    app.render_system.renderer.post_processes = [pa];




    ge.cui.define_component("pp-item", {
      init: function (node, parent, ui) {
        node.height = "25px";
        node.item.width = "60%";
        node.item.styles = { margin_top: 2 };
        node.styles.border_size = 1;
        node.children = [
          {
            type: "text", width: "40%", styles: { text_valign: "middle", font_size: 10 }, text: node.text
          },
          node.item
        ];
      },
      render: function (ctx, node, ui) {
        this.ui.components["block"].render(ctx, node, ui);
      }


    });
    app.create_renderable(new ge.cui.mesh({
      width: 220, height: 220,
      mouse_controller: camera.ge_mouse_camera_controller
    }),
      function (ui, e) {
        e.ge_transform.set_position(0, 0, -6).rotate_eular(0.5, 0, 0);


        e.ge_transform.parent = camera.ge_transform;


        ui.flags += ge.DISPLAY_ALWAYS;


        ui.set_document({
          body: {
            styles: { background_color: "rgba(190,190,190,0.5)", border_size: 2, padding: 5 },
            children: [
              { name: "pa", type: "checkbox", text: "Picture Adjustment", checked: true },
              {
                type: "pp-item", text: "Gamma",
                item: { name: "gamma", type: "hslider", min: 1, max: 200, value: 100, label_padding: 30 }
              },

              {
                type: "pp-item", text: "Contrast",
                item: { name: "contrast", type: "hslider", min: 1, max: 200, value: 100, label_padding: 30 }
              },

              {
                type: "pp-item", text: "Saturation",
                item: { name: "saturation", type: "hslider", min: 1, max: 200, value: 100, label_padding: 30 }
              },

              {
                type: "pp-item", text: "Brightness",
                item: { name: "brightness", type: "hslider", min: 1, max: 200, value: 100, label_padding: 30 }
              },

              {
                type: "pp-item", text: "Red",
                item: { name: "red", type: "hslider", min: 1, max: 200, value: 100, label_padding: 30 }
              },
              {
                type: "pp-item", text: "Green",
                item: { name: "green", type: "hslider", min: 1, max: 200, value: 100, label_padding: 30 }
              },
              {
                type: "pp-item", text: "Blue",
                item: { name: "blue", type: "hslider", min: 1, max: 200, value: 100, label_padding: 30 }
              },


            ]
          }

        });

        ui.on_document_update.add(function (doc) {
          pa.enabled = doc.get_node("pa").checked;
          pa.gamma = doc.get_node("gamma").value / 100;
          pa.contrast = doc.get_node("contrast").value / 100;
          pa.saturation = doc.get_node("saturation").value / 100;
          pa.brightness = doc.get_node("brightness").value / 100;
          pa.red = doc.get_node("red").value / 100;
          pa.green = doc.get_node("green").value / 100;
          pa.blue = doc.get_node("blue").value / 100;


        });






      });
  }

  

 
  



 

  camera.ge_transform_controller.set_position(2.0751357078552246, 8.539578437805176, 9.504454612731934)
    .set_rotate(-0.19499962031841278, 0.18500226736068726, 0);
 

 


  app.attach_component(camera, 'ge_keyboard_camera_controller', {
    element: document,
  });

    

  window.onresize = function () {
    app.render_system.resize();
  }

  console.log('game 1 loaded', app);


  app.start(function () {
   
  }, 1 / 60);

}