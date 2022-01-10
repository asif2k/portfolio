function index(ecs, ge, math) {
    
  dependencies([
    ['ecs', '/libs/ecs.js'],
    ['math', '/libs/math.js'],
    ['ge', '/ge/index.js'],
    
  ]);

  var app = new ge.app({
    renderer: {
      pixel_ratio: 1
    }
  });

  function RD(a) {
    return a * math.DEGTORAD;
  }



  


  /*
 


 app.create_renderable(new ge.shading.point_light({
    intensity: 12,
  }),
    function (m, e) {
      //e.ge_transform.rotate_eular(RD(-125), RD(90), 0);

      e.ge_transform.set_position(0, 20, 1);
      return;
      m.enable_shadows({
        shadow_intensity: 1.5,
        shadow_map_size: 2048,
        shadow_camera_distance: 20
      })
    });


  */

  app.create_renderable(new ge.shading.light({
    intensity: 2,
    ambient1:[1,1,1]
  }),
    function (m, e) {
      e.ge_transform.rotate_eular(RD(-125), RD(90), 0);


      m.enable_shadows({
        shadow_intensity: 0.2,
        shadow_map_size: 2048,
        shadow_camera_distance: 15
      })
    });



  var camera = app.render_system.camera;



  app.create_renderable(new ge.geometry.mesh({
    geometry: ge.geometry.shapes.plane({ width: 20, height: 20 }), material: new ge.shading.shaded_material({ specular: [0, 0, 0] })
  }),
    function (m, e) {
      e.ge_transform.set_position(0, -3.5, 0).rotate_eular(RD(-90), 0, 0);
      m.material.texture = ge.webgl.texture.from_url("res/r4.jpg", true);
      math.mat3.translate_rotate_scale(m.material.texture_matrix, 0, 0, 4, 4, 0);
      m.material.flags += ge.SHADING.RECEIVE_SHADOW;

      var psm = new ge.debug.physics_sim({ gravity: [0, -9.8, 0] });

      psm.material.flags += ge.SHADING.CAST_SHADOW + ge.SHADING.RECEIVE_SHADOW;
      e.ge_renderable.items.push(psm);

      for (var i = 0; i < 50; i++) {
        psm.add_sphere(Math.random() + 0.2, { position: [(Math.random() - 0.5) * 8, 40 + ((Math.random() - 0.5) * 55), (Math.random() - 0.5) * 8] });

        psm.add_box([Math.random() + 0.1, Math.random() + 0.1, Math.random() + 0.1], { position: [(Math.random() - 0.5) * 8, 40 + ((Math.random() - 0.5) * 55), (Math.random() - 0.5) * 8] });

      }



      psm.add_box([6, 0.5, 0.5], { type: 2,  position: [0, -3, 0],angular_velocity:[0,2,0] });

      psm.add_box([10, 1, 10], { type: 1, hide: true, position: [0, -4.4, 0] });

      psm.on_body = function (b) {
        if (b._transform._position[1] < -20) {
          b._transform._position[1] = 80;
          b._transform._position[0] = 0;
          b._transform._position[2] = 0;
          b.clear_velocities();
        }
      }

      console.log(psm.bodies);


    });


  
 

  camera.ge_transform_controller.set_position(-5.861514568328857, 9.781133651733398, 16.22023582458496).set_rotate(-0.6799997091293335, -0.31999993324279785, 0);
 

  app.attach_component(camera, 'ge_mouse_camera_controller', {
    element: app.render_system.renderer.canvas,
    on_mouse_down: function (x, y, e) {
      app.render_system.picking_mouse_x = x;
      app.render_system.picking_mouse_y = y;               
    },
    on_mouse_up: function (x, y, e) {
      camera.ge_camera.is_locked = false;
    },
  });

  
  window.onresize = function () {
    app.render_system.resize();
  }

  console.log('game 1 loaded', app);


  app.start(function () {
    
  }, 1 / 60);

}