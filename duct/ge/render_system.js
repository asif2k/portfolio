function render_system(fin, ge, ecs, math ) { 

  ecs.register_component('ge_renderable', fin.define(function (proto, _super) {

    proto.set_layer = function (layer) {
      layer = Math.pow(2, layer);
      if (!(this.layers & layer)) {
        this.layers |= layer;
      }
      return (this);
    };

    proto.unset_layer = function (layer) {
      layer = Math.pow(2, layer);
      if ((this.layers & layer) !== 0) {
        this.layers &= ~layer;
      }
      return (this);
    };

    proto.update_bounds = function (mat) { }
    function ge_renderable(def, en, app, comp) {
      this.entity = en;
      this.items = def.items || [];
      this.version = 0;
      this.layers = 0;
      this.set_layer(def.layer || 1);
    }

    ge_renderable.validate = function (comp) {
      comp.app.use_system('ge_render_system');
    };
    return ge_renderable;



  }, ecs.component));

  

  ecs.register_system('ge_render_system', fin.define(function (proto, _super) {


    function transparent_meshes_sort(a, b) {
      return (a.view_position[2] + a.transparent_layer) - (b.view_position[2] + b.transparent_layer);
    }

    function meshes_sort(a, b) {
      a.suid = a.material.shader.uuid;
      b.suid = b.material.shader.uuid;
      return a.material.shader.uuid - b.material.shader.uuid;
    }
    proto.step = function () {
      //




      if (this.app.timer - this.fps_timer > 1) {
        this.fps = this.fps_counter;
        this.fps_timer = this.app.timer - ((this.app.timer - this.fps_timer) % this.step_size);
        this.fps_counter = 0;
      }
      this.fps_counter++;

      var entity, trans, item, renderable, i = 0;
      var camera = this.camera.ge_camera, process_list = false;



      if ((this.camera_version !== camera.version) || (this.app.timer - this.list_refereshed_timer) > (this.step_size * 4)) {


        process_list = true;
        this.meshes.length = 0;
        this.lights.length = 0;

        this.list_refereshed_timer = this.app.timer;
        this.camera_version = camera.version;

        var fmi = 0, omi = 0, tmi = 0;
      }



      while ((entity = this.app.iterate_entities("ge_renderable")) !== null) {
        trans = entity.ge_transform;
        renderable = entity.ge_renderable;
        for (i = 0; i < renderable.items.length; i++) {
          item = renderable.items[i]
          if (trans.require_update !== 0) {
            math.mat4.from_quat(item.matrix_world, trans.rotation_world);

            math.mat4.scale(item.matrix_world, trans.scale_world);

            item.matrix_world[12] = trans.position_world[0];
            item.matrix_world[13] = trans.position_world[1];
            item.matrix_world[14] = trans.position_world[2];

            ge.version$(item.version)

            item.update_bounds(item.matrix_world, trans);
            if (item.item_type === ge.ITEM_TYPES.OTHER) {
              item.initialize_item();
            }
          }
          if (process_list) {
            if (item.render_list) {
              item.render_list();
            }
            if (item.item_type === ge.ITEM_TYPES.MESH && (item.flags & ge.DISPLAY_ALWAYS || item.material.flags & ge.DISPLAY_ALWAYS)) {
              this.meshes[omi++] = item;
            }
            else if (item.item_type === ge.ITEM_TYPES.LIGHT && (item.flags & ge.DISPLAY_ALWAYS)) {              
              if (item.enabled) this.lights[fmi++] = item;
            }
           else  if (item.bounds ) {

              if (camera.aabb_aabb(item.bounds)) {
                if (camera.frustum_aabb(item.bounds)) {

                  math.vec3.transform_mat4(item.view_position, item.world_position, camera.view_inverse);


                  if (item.item_type === ge.ITEM_TYPES.MESH) {
                    this.meshes[omi++] = item;
                  }
                  else if (item.item_type === ge.ITEM_TYPES.LIGHT) {

                    if (item.enabled) this.lights[fmi++] = item;
                  }
                }
              }
            }
          }
         
         

          ge.version$(renderable.version)

        }

      }


     


      if (!this.renderer_ready) return;


      if (process_list) {

        if (this.meshes.length > 0) {
          fin.merge_sort(this.meshes, this.meshes.length, meshes_sort);
        }

        this.flat_meshes.length = 0;
        this.opuque_meshes.length = 0;
        this.transparent_meshes.length = 0;

        fmi = 0; omi = 0; tmi = 0;

        this.pickable_meshes.length = 0;
        i = this.meshes.length;
        while (--i > -1) {
          item = this.meshes[i];
          if ((item.material.flags & ge.SHADING.TRANSPARENT)) {
            item.transparent_layer = item.material.transparent_layer * 100000;
            this.transparent_meshes[tmi++] = item;
          }
          else {
            if (item.material.flags & ge.SHADING.FLAT) {
              this.flat_meshes[fmi++] = item;
            }
            else {
              this.opuque_meshes[omi++] = item;
            }
          }
          
          if (this.picking_mouse_x > -1) {
         
            if (item.flags & ge.PICKABLE_MESH) {
              
              this.pickable_meshes[this.pickable_meshes.length] = item;

            }
          }
        }
        if (this.transparent_meshes.length > 0) {
          fin.merge_sort(this.transparent_meshes, this.transparent_meshes.length, transparent_meshes_sort);
        }



      }
      i = this.meshes.length;
      while (--i > -1) {
        item = this.meshes[i];
        if (item.on_render) item.on_render(camera);
      }


      
     

      this.renderer.timer = this.app.timer;
      this.renderer.render_scene(camera, this.flat_meshes, this.opuque_meshes, this.transparent_meshes, this.lights);
      if (this.pickable_meshes.length > 0) {
        this.process_pickable_meshes();
      }
      else {
        //this.picking_mouse_x = -1;
      }
      




    }


    proto.resize = function () {
      var rect = this.host.getBoundingClientRect();
      this.renderer.set_canvas_size(rect.width, rect.height);
      this.camera.ge_camera.update_aspect(rect.width / rect.height);
    }

    proto.setup_host = function (host) {
      this.host = host;
      this.host.appendChild(this.renderer.canvas);
      setTimeout(function (self) {
        self.resize();
        self.renderer_ready = true;
      }, 50, this);

    }


    proto.process_pickable_meshes = (function () {
      var uint32_color_id = new Uint32Array(1);
      var byte_id = new Uint8Array(uint32_color_id.buffer);
      var u_color_id_rw = new Float32Array(4);

     

      fin.macro$(function render_system_set_picking_color_id(id$) {
        uint32_color_id[0] = id$;
        byte_id[3] = 255;
        u_color_id_rw[0] = byte_id[0];
        u_color_id_rw[1] = byte_id[1];
        u_color_id_rw[2] = byte_id[2];
        u_color_id_rw[3] = byte_id[3];
        ge.webgl_shader_set_uniform_unsafe$("u_color_id_rw", u_color_id_rw)
      }, ge)

      proto.new_pick_color_id = function () {
        ge.render_system_set_picking_color_id$(this.picking_color_id)
        this.picking_color_id += 32;
        return uint32_color_id[0];
      };


      var pickable_shader = "<?=chunk('precision')?>\nuniform vec4 u_color_id_rw;\nvoid fragment(void) {\ngl_FragColor=u_color_id_rw/255.0;\n}";


      return function () {
       
          var renderer = this.renderer, shader, mesh, uni, i = 0;
          var camera = renderer.active_camera;

          if (renderer.render_target2.bind()) {
            renderer.gl.clear(ge.GL_COLOR_BUFFER_BIT);
          }
          renderer.gl_depthFunc(ge.GL_EQUAL);
          for (i = 0; i < this.pickable_meshes.length; i++) {
            mesh = this.pickable_meshes[i];

            if (!mesh.material.shader.pickable) {
              mesh.material.shader.pickable = mesh.material.shader.extend(pickable_shader, { fragment: false });
            }
            if (renderer.use_shader(mesh.material.shader.pickable)) {
              shader = renderer.active_shader;
              ge.renderer_update_camera_uniforms$(camera)
            }

            if (!mesh.picking_color_id) {
              ge.render_system_set_picking_color_id$(this.picking_color_id)
              mesh.picking_color_id = uint32_color_id[0];
              this.picking_color_id += 32;
            }
            else {
              ge.render_system_set_picking_color_id$(mesh.picking_color_id)
              mesh.picking_color_id = uint32_color_id[0];
            }

            ge.webgl_shader_set_uniform_unsafe$("u_model_rw", mesh.matrix_world)
            ge.renderer_render_mesh$(mesh)
          }
          renderer.gl_depthFunc(ge.GL_LESS);


          if (this.picking_mouse_x > -1) {
            this.picking_mouse_x *= renderer.pixel_ratio;
            this.picking_mouse_y *= renderer.pixel_ratio;
            this.picking_mouse_y = renderer.render_height - this.picking_mouse_y;


            renderer.gl.readPixels(this.picking_mouse_x, this.picking_mouse_y, 1, 1, ge.GL_RGBA, ge.GL_UNSIGNED_BYTE, byte_id);
            var picked_id = uint32_color_id[0];

            this.picking_mouse_x = -1;
            this.picking_mouse_y = -1;

            this.picked_mesh = null;
            for (i = 0; i < this.pickable_meshes.length; i++) {
              mesh = this.pickable_meshes[i];
              mesh.is_picked = false;
              this.picked_mesh = mesh;
              if (mesh.picking_color_id === picked_id) {
                this.on_mesh_picked.params[0] = mesh;
                mesh.is_picked = true;
                this.on_mesh_picked.trigger_params();
                break;
              }
            }

          }
          
      }
    })();


    function ge_render_system(def) {
      _super.apply(this, arguments);      
      this.priority = 10000;
      this.renderer = new ge.renderer(def.renderer);

      this.renderer_ready = false;
      console.log("ge_render_system", this);
     
      this.lights = [];
      this.meshes = [];

      this.flat_meshes = [];
      this.opuque_meshes = [];
      this.transparent_meshes = [];
      this.camera_version = -1;
      this.list_refereshed_timer = 0;
      this.fps_counter = 0;
      this.fps_timer = 0;
      this.fps = 0;
      this.pickable_meshes = [];

      this.picking_color_id = 1024 * 4;

      this.picking_mouse_x = -1;
      this.picking_mouse_y = -1;

      this.on_mesh_picked = new ge.event(this, [null]);



      this.camera = def.camera || this.app.create_entity({
        components: {
          'ge_transform': {},
          'ge_transform_controller': {},
          'ge_camera': {},
        }
      });
      this.setup_host(def.host);
     

     



      
    }




    return ge_render_system;



  }, ecs.system));



}