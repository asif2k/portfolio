function index(ecs, ge, math) {
    
  dependencies([
    ['ecs', '/libs/ecs.js'],
    ['math', '/libs/math.js'],
    ['ge', '/ge/index.js'],
    
  ]);

  fin.modules['pps'] = this;

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
    function (m, e) {
      e.ge_transform.rotate_eular(RD(-125), RD(160), 0);
           
      m.enable_shadows({
        shadow_intensity: 0.1,
        shadow_map_size: 2048,
        shadow_camera_distance: 20
      })
    });

  var cubes = [], spheres = [];
  console.log(cubes);
  var pw = new ge.pe.dynamics.World(null, [0, -4.6, 0]);
  var add_cube = (size, def) => {
    def = def || {};
    def.shp = def.shp || {};
    def.shapes = [Object.assign({
      geometry: new ge.pe.collision.geometry.BoxGeometry(size || [1, 1, 1])
    }, def.shp)];
    
    var body = new ge.pe.dynamics.rigidbody.RigidBody(def);
    pw.addRigidBody(body);
    cubes.push(body);
    return body
  };


  var add_convex = (vertices, def) => {
    def = def || {};
    def.shp = def.shp || {};
    def.shapes = [Object.assign({
      geometry: new ge.pe.collision.geometry.ConvexHullGeometry(vertices)
    }, def.shp)];

    var body = new ge.pe.dynamics.rigidbody.RigidBody(def);
    pw.addRigidBody(body);
    
    cubes.push(body);
    return body
  };



  console.log("pw", pw);


  app.create_renderable(new ge.geometry.mesh({
    geometry: ge.geometry.shapes.plane({ width: 100, height: 100 }), material: new ge.shading.shaded_material({ specular: [0, 0, 0] })
  }),
    function (m, e) {
      e.ge_transform.set_position(0, -3.5, 0).rotate_eular(RD(-90), 0, 0);

      add_cube([100, 0.1, 100], { position: e.ge_transform.position, type: 2, shp: { friction: 0.72 }});

      m.material.texture = ge.webgl.texture.from_url("res/dirt.jpg", true);
      math.mat3.translate_rotate_scale(m.material.texture_matrix, 0, 0, 16, 16, 0);
      m.material.flags += ge.SHADING.RECEIVE_SHADOW;


    });

  app.create_renderable(new ge.geometry.mesh({
    geometry: ge.geometry.shapes.cube({ size: 1, divs: 2 }), material: new ge.shading.shaded_material({
      ambient: [0.4774259924888611, 0.5197775363922119, 0.1997416913509369],
      diffuse: [0.9395785927772522, 0.8748997449874878, 0.6745122075080872],
    })
  }),
    function (m, e) {
      e.ge_transform.set_position(-3, 11, -5);

      m.material.flags += ge.SHADING.CAST_SHADOW + ge.SHADING.RECEIVE_SHADOW;

      add_cube([0.5, 0.5, 0.5], {
        position: e.ge_transform.position, angular_velocity1: [2, 0, 0]
      }).mm = e;

     

   
     

    });

  app.create_renderable(new ge.geometry.mesh.triangles({
    material: new ge.shading.shaded_material({wireframe1:true}),
    triangles: [      
      [3, -1, 3, 0, 1, 0, -3, -1, 3],

      [-3, -1, -3, 0, 1, 0, 3, -1, -3],

      [-3, -1, 3, 0, 1, 0, -3, -1, -3],

      [3, -1, -3, 0, 1, 0, 3, -1, 3],
    ]
  }),
    function (m, e) {
      e.ge_transform.set_position(-3.1, 2, -5);
      m.material.flags += ge.SHADING.RECEIVE_SHADOW;

      add_convex([
        [0, 1, 0],
        [-3, -1, 3],
        [3, -1, 3],
        [3, -1, -3],
        [-3, -1, -3]
      ], { type: 2, position: e.ge_transform.position }).mm = e;

      

    });


  var bloom = new ge.effects.post_process.bloom({ enabled: false });

  app.render_system.renderer.post_processes = [
    new ge.effects.post_process.fxaa({
      enabled: false

    }),
    bloom

  ];
  var camera = app.render_system.camera;


  



 

  camera.ge_transform_controller.set_position(-6.90, 14.04, 21.90).set_rotate(-0.27, -0.08, 0);
 

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


  ge.cui.define_component("pp-item", {
    init: function (node, parent, ui) {
      node.height = "25px";
      node.item.width = "60%";
      node.item.styles = { margin_top: 2 };
      node.styles.border_size = 1;
      node.children = [
        {
          type: "text", width: "40%", styles: {text_valign:"middle",font_size:10}, text: node.text },
        node.item
      ];
    }, 
    render: function (ctx, node, ui) {
      this.ui.components["block"].render(ctx, node, ui);
    }
    

  });

  app.create_renderable(new ge.cui.mesh({
    width: 220, height: 400,
    mouse_controller: camera.ge_mouse_camera_controller
  }),
    function (ui, e) {
      e.ge_transform.set_position(-3, 0, -6);


      e.ge_transform.parent = camera.ge_transform;
      ui.material.flags += ge.SHADING.CAST_SHADOW + ge.SHADING.RECEIVE_SHADOW;


      ui.set_document({
        body: {
          styles: { background_color: "rgba(160,160,160,0.5)", border_size: 2, padding: 5 },
          children: [
            { name: "bloom", type: "checkbox", text: "Bloom", checked: true },            
            {
              type: "pp-item", text: "Blur Quality",
              item: { name: "bloom_blur_quality", type: "hslider", min: 1, max: 16, value: 9, label_padding: 30 }
            },
            {
              type: "pp-item", text: "Blend Factor",
              item: { name: "bloom_blend_factor", type: "hslider", min: 1, max: 6, value: 3, label_padding: 30 }
            },
            {
              type: "pp-item", text: "Blend Exposure",
              item: { name: "bloom_blend_exposure", type: "hslider", min: 1, max: 12, value: 3, label_padding: 30 }
            },
            {
              type: "pp-item", text: "Blend Gamma",
              item: { name: "bloom_blend_gamma", type: "hslider", min: 1, max: 100, value: 50, label_padding: 30 }
            },
            { type: "text", text:"Bright Threshold"},
            { name: "bloom_bright_threshold1", type: "hslider", min: 0, max: 255, value: 26, label_padding: 25, height: "15px" },
            { name: "bloom_bright_threshold2", type: "hslider", min: 0, max: 255, value: 172, label_padding: 25, height: "15px" },
            { name: "bloom_bright_threshold3", type: "hslider", min: 0, max: 255, value: 15, label_padding: 25, height: "15px" },
            { name: "bloom_bright_threshold4", type: "hslider", min: -255, max: 255, value: -242, label_padding: 25, height: "15px" },

          ]
        }

      });

      ui.on_document_update.add(function (doc) {
        bloom.enabled = doc.get_node("bloom").checked;
        bloom.blur_quality = doc.get_node("bloom_blur_quality").value;
        bloom.blend_factor = doc.get_node("bloom_blend_factor").value;
        bloom.blend_exposure = doc.get_node("bloom_blend_exposure").value;

        bloom.blend_gamma = doc.get_node("bloom_blend_gamma").value / 100;

        bloom.u_bright_threshold_rw[0] = doc.get_node("bloom_bright_threshold1").value / 128;
        bloom.u_bright_threshold_rw[1] = doc.get_node("bloom_bright_threshold2").value / 128;
        bloom.u_bright_threshold_rw[2] = doc.get_node("bloom_bright_threshold3").value / 128;
        bloom.u_bright_threshold_rw[3] = doc.get_node("bloom_bright_threshold4").value / 255;
      });






    });



 


  window.onresize = function () {
    app.render_system.resize();
  }

  console.log('game 1 loaded', app);


  app.start(function () {
    pw.step(1 / 60);
    cubes.forEach((b) => {
      if (!b.mm) return;
      b.mm.ge_transform.position[0] = b._transform._position[0];
      b.mm.ge_transform.position[1] = b._transform._position[1];
      b.mm.ge_transform.position[2] = b._transform._position[2];


      b.mm.ge_transform.rotation[0] = b._transform._quat[0];
      b.mm.ge_transform.rotation[1] = b._transform._quat[1];
      b.mm.ge_transform.rotation[2] = b._transform._quat[2];
      b.mm.ge_transform.rotation[3] = b._transform._quat[3];



      b.mm.ge_transform.require_update = 1;

    });
  }, 1 / 30);

}