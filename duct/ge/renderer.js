function renderer(fin,ge, math) {
  
  

  ge.renderer = ge.define(function (proto, _super) {

    var ge_renderer;

    var glsl = ge.webgl.shader.create_chunks_lib(`import('shaders/renderer.glsl')`);


    proto.gl_enable = function (state) {
      if (this.gl_states_flags[state] === 1) return (false);
      this.gl_states_flags[state] = 1;
      this.gl.enable(state);
      return (true);    
    };
    proto.gl_disable = function (state) {
      if (this.gl_states_flags[state] === 0) return (false);
      this.gl_states_flags[state] = 0;
      this.gl.disable(state);
      return (true);
    };

    proto.gl_blendFunc = function (func0, func1) {
      if (this.gl_states.blendFunc0 !== func0 || this.gl_states.blendFunc1 !== func1) {
        this.gl_states.blendFunc0 = func0;
        this.gl_states.blendFunc1 = func1;
        this.gl.blendFunc(func0, func1);
        return (true);
      }
      return (false);
    };
    proto.gl_blendEquation = function (param) {
      if (this.gl_states.blendEQuation !== param) {
        this.gl_states.blendEQuation = param;
        this.gl.blendEquation(param);
      }

    };
    proto.gl_depthMask = function (mask) {
      if (mask !== this.gl_states.depthMask) {
        this.gl_states.depthMask = mask;
        this.gl.depthMask(mask);
      }

    };
    proto.gl_depthFunc = function (func) {
      if (func !== this.gl_states.depthFunc) {
        this.gl_states.depthFunc = func;
        this.gl.depthFunc(func);
      }

    };
    proto.gl_cullFace = function (param) {
      if (param !== this.gl_states.cullFace) {
        this.gl_states.cullFace = param;
        this.gl.cullFace(param);
      }

    };
    proto.gl_bindFramebuffer2 = function (mode,param) {
      if (param !== this.gl_states.framebuffer) {
        this.gl_states.framebuffer = param;     
        this.gl.bindFramebuffer(mode,param);
        return true;
      }
      return false;

    };
    
    proto.set_canvas_size = function (width, height) {
      
      this.render_width = width * this.pixel_ratio;
      this.render_height = height * this.pixel_ratio;
      this.canvas.width = this.render_width;
      this.canvas.height = this.render_height;

      var i = 0;
      for (i = 0; i < this.post_processes.length; i++) {
        this.post_processes[i].resize(this.render_width, this.render_height);
      }

      for (i = 0; i < this.render_targets.length; i++) {
        this.render_targets[i].resize(this.render_width * this.render_targets[i].ratio, this.render_height * this.render_targets[i].ratio);

      }

      this.on_canvas_size(this.render_width, this.render_height);

    }
    proto.on_canvas_size = function (width,height) {   }


    proto.clear_screen = function () {
      this.gl.clear(ge.GL_COLOR_BUFFER_BIT | ge.GL_DEPTH_BUFFER_BIT);
      return (this);
    };

    proto.set_default_viewport = function () {
      if (this.default_render_target === null) {
        if (this.gl.bindFramebuffer(ge.GL_FRAMEBUFFER, this.frame_buffer_layer)) {

        }
        if (this.active_camera !== null) {
          this.gl.viewport(
            this.vp_left * this.render_width,
            this.vp_top * this.render_height,
            this.vp_width * this.render_width,
            this.vp_height * this.render_height);
        }

      }
      else {
        this.default_render_target.bind();
      }
      return (this)
    };


    proto.use_geometry = (function () {
      var return_value = 0, shader = null, i = 0, att = null, gl = null;
      var geometry_data = ge.geometry.geometry_data;
      proto.activate_geometry_index_buffer = (function () {
        var i, ii, a, b, c;
        function update_wireframe_indices(g) {
          if (g.index_buffer !== null) {
            if (!g.w_index_data) {
              g.w_index_data = geometry_data.create_index_data(g.index_data.length * 2);
            } else if (g.w_index_data.length < g.index_data.length * 2) {
              g.w_index_data = ggeometry_data.create_index_data(g.index_data.length * 2);
            }
            ii = 0;
            for (i = 0; i < g.index_data.length; i += 3) {
              a = g.index_data[i + 0];
              b = g.index_data[i + 1];
              c = g.index_data[i + 2];
              g.w_index_data[ii] = a;
              g.w_index_data[ii + 1] = b;
              g.w_index_data[ii + 2] = b;
              g.w_index_data[ii + 3] = c;
              g.w_index_data[ii + 4] = c;
              g.w_index_data[ii + 5] = a;
              ii += 6;
            }
          }
        }


        proto.reset_wireframe_index_buffer = function (gl, vert_count) {
          var indices = [];
          indices.length = 0;
          for (i = 0; i < (vert_count) - 1; i += 3) {
            a = i + 0;
            b = i + 1;
            c = i + 2;

            ii = indices.length;
            indices[ii] = a;
            indices[ii + 1] = b;
            indices[ii + 2] = b;
            indices[ii + 3] = c;
            indices[ii + 4] = c;
            indices[ii + 5] = a;



          }
          if (!this.wireframe_index_buffer) {
            this.wireframe_index_buffer = ge_renderer.gl_buffers.get(gl);
          }

          gl.bindBuffer(ge.GL_ELEMENT_ARRAY_BUFFER, this.wireframe_index_buffer);
          gl.bufferData(ge.GL_ELEMENT_ARRAY_BUFFER, geometry_data.create_index_data(indices), ge.GL_DYNAMIC_DRAW);
          indices.length = 0;
        };

        proto.bind_default_wireframe_indices = function () {
          if (!this.wireframe_index_buffer) {
            this.reset_wireframe_index_buffer(gl, 100000 * 10);
            this.compile_attribute(this.default_color_attribute);
          }
          this.gl.bindBuffer(ge.GL_ELEMENT_ARRAY_BUFFER, this.wireframe_index_buffer);
        };

        return function (geo, is_wireframe) {
         
          if (geo.index_data) {
            var gl = this.gl;
            if (geo.index_needs_update) {
              if (geo.index_buffer === null) geo.index_buffer = ge_renderer.gl_buffers.get(gl);
              gl.bindBuffer(ge.GL_ELEMENT_ARRAY_BUFFER, geo.index_buffer);
              gl.bufferData(ge.GL_ELEMENT_ARRAY_BUFFER, geo.index_data, ge.GL_DYNAMIC_DRAW);
            }


            if (is_wireframe) {
              if (geo.index_needs_update || !geo.w_index_data) {
                update_wireframe_indices(geo);
                if (!geo.w_index_buffer) geo.w_index_buffer = ge_renderer.gl_buffers.get(gl);
                gl.bindBuffer(ge.GL_ELEMENT_ARRAY_BUFFER, geo.w_index_buffer);
                gl.bufferData(ge.GL_ELEMENT_ARRAY_BUFFER, geo.w_index_data, ge.GL_DYNAMIC_DRAW);
              }
              else
                gl.bindBuffer(ge.GL_ELEMENT_ARRAY_BUFFER, geo.w_index_buffer);
            }
            else {
              gl.bindBuffer(ge.GL_ELEMENT_ARRAY_BUFFER, geo.index_buffer);
            }
            geo.index_needs_update = false;
            return true;
          }
          else if (is_wireframe) {
            this.gl.bindBuffer(ge.GL_ELEMENT_ARRAY_BUFFER, this.wireframe_index_buffer);
            return true;
          }

          return false;

        }

      })();


      proto.update_geomerty_attribute = function (location, att) {
        
        if (att === null) {
          this.gl.disableVertexAttribArray(location);
          return (-1);
        }
        else {
          var gl = this.gl;
          var return_value = 0;
          gl.enableVertexAttribArray(location);

          if (att.needs_update === true) {
            if (att.buffer === null) {
              att.buffer = ge_renderer.gl_buffers.get(gl);
            }
            gl.bindBuffer(ge.GL_ARRAY_BUFFER, att.buffer);
            gl.bufferData(ge.GL_ARRAY_BUFFER, att.data, att.buffer_type, att.data_offset, att.data_length);
            return_value = 1;
            att.version += 1;
            att.needs_update = false;
          }
          else if (att.buffer !== null) {
            gl.bindBuffer(ge.GL_ARRAY_BUFFER, att.buffer);
          }
          gl.vertexAttribPointer(location, att.item_size, att.data_type, false, att.stride, att.offset);
          gl.ANGLE_instanced_arrays.vertexAttribDivisorANGLE(location, att.divisor);




        }

        return return_value
      }

      proto.compile_geometry = (function () {
        proto.compile_attribute = function (att) {
          if (att.compiled) return;
          att.stride = att.stride || 0;
          att.offset = att.offset || 0;
          att.needs_update = att.needs_update || false;
          att.array = att.array || null;
          att.data_type = att.data_type || ge.GL_FLOAT;
          att.buffer_type = att.buffer_type || ge.GL_STATIC_DRAW;
          att.version = att.version || 1;

          att.divisor = att.divisor || 0;
          att.array = att.array || null;
          att.data_offset = att.data_offset || 0;
          att.data_length = att.data_length || 0;

          if (att.data) {
            att.data_length = att.data.length;
            if (att.buffer === null || att.buffer === undefined) att.buffer = ge_renderer.gl_buffers.get(this.gl);

            this.gl.bindBuffer(ge.GL_ARRAY_BUFFER, att.buffer);
            this.gl.bufferData(ge.GL_ARRAY_BUFFER, att.data, att.buffer_type, att.data_offset, att.data_length);
          }
          att.compiled = true;
          return (att);
        }

        proto.use_geometry_attribute = function (location, att) {
          this.compile_attribute(att);

          this.update_geomerty_attribute(location, att);
        };


        return function (gl, geo) {
          if (geo.compiled) return;

          if (!this.wireframe_index_buffer) {
            this.reset_wireframe_index_buffer(gl, 200000 * 10);
            this.compile_attribute(this.default_color_attribute);
          }



          for (aid in geo.attributes) {
            this.compile_attribute(geo.attributes[aid]);
          }

          geo.attributes.a_color_rw = geo.attributes.a_color_rw || this.default_color_attribute;

          if (geo.index_data) {

            if (geo.index_buffer === null) geo.index_buffer = ge_renderer.gl_buffers.get(gl);
            gl.bindBuffer(ge.GL_ELEMENT_ARRAY_BUFFER, geo.index_buffer);
            gl.bufferData(ge.GL_ELEMENT_ARRAY_BUFFER, geo.index_data, ge.GL_DYNAMIC_DRAW);
          }
          geo.compiled = true;
        }
      })();


      return function (geo) {
        if (!geo.compiled) this.compile_geometry(this.gl, geo);

        shader = this.active_shader;

        if (shader.used_geo_id === geo.uuid) return;
        shader.used_geo_id = geo.uuid;
        

        for (i = 0; i < shader.all_attributes.length; i++) {
          att = shader.all_attributes[i];

          if (geo.attributes[att.name]) {

            this.update_geomerty_attribute(att.location, geo.attributes[att.name]);
          }
          else {
            this.update_geomerty_attribute(att.location, null);
          }
        }


      }
    })();

    proto.use_shader = function (shader,skip_enter) {
      if (this.last_shader_id != shader.uuid) {

        if (this.active_shader !== null) {
           this.active_shader.exit(this);
        }
        if (!shader.compiled) {
          ge.webgl.shader.compile(this.gl, shader, this.shader_parameters);
        }
       
        this.gl.useProgram(shader.program);
         shader.enter(this);


        var uni;
        ge.webgl_shader_set_uniform$("u_fog_params_rw", this.fog_params, shader, uni)
        ge.webgl_shader_set_uniform$("u_fog_color_rw", this.u_fog_color, shader, uni)
        ge.webgl_shader_set_uniform$("u_timer_rw", this.timer, shader, uni)


        this.active_shader = shader;
        this.active_shader.camera_version = -1;
        this.last_shader_id = shader.uuid;
        this.active_shader.used_geo_id = -100;

        return (true);
      }
      return (false);
    };

   

    var cube_map_texture_sequence = [
      ge.GL_TEXTURE_CUBE_MAP_NEGATIVE_X, ge.GL_TEXTURE_CUBE_MAP_POSITIVE_X,
      ge.GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, ge.GL_TEXTURE_CUBE_MAP_POSITIVE_Y,
      ge.GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, ge.GL_TEXTURE_CUBE_MAP_POSITIVE_Z
    ];
    proto.update_texture = function (tex) {
      var new_texture = false;
      var gl = this.gl;

      if (tex.gl_texture === null) {
        tex.gl_texture = ge_renderer.gl_textures.get(gl);
        new_texture = true;
      }



      gl.bindTexture(tex.target, tex.gl_texture);

      if (tex.target === ge.GL_TEXTURE_CUBE_MAP) {
        for (i = 0; i < tex.source.length; i++) {
          gl.texImage2D(cube_map_texture_sequence[i], 0, tex.format, tex.format, texture.format_type, tex.source[i]);
        }
      }
      else {

        if (tex.source !== null && (tex.source.src || tex.source.getContext)) {
          gl.texImage2D(tex.target, 0, tex.format, tex.format, tex.format_type, tex.source);                    
          
        }        
        else {          
          gl.texImage2D(tex.target, 0, tex.format, tex.width, tex.height, 0, tex.format, tex.format_type, tex.source);
        }
      }
      
      if (new_texture) {

      }
      for (p in tex.parameters) {
        gl.texParameteri(tex.target, p, tex.parameters[p]);
      }

      if (tex.generate_mipmap) {
        gl.generateMipmap(tex.target);
      }
      gl.bindTexture(tex.target, null);
      tex.needs_update = false;
      tex.free_source();
      return tex;
    }

    proto.use_texture = function (texture, slot) {
      if (texture === null) {
        this.use_texture(this.default_texture, slot);
        return;
      }
      else {
        if (texture.needs_update) {
          this.update_texture(texture);
        }
        if (texture.gl_texture === null) {
          this.use_texture(this.default_texture, slot);
          return;
        }

      }

      texture.last_used_time = this.timer;
      if (this.texture_slots[slot] !== texture.uuid) {
        this.texture_slots[slot] = texture.uuid;
        this.gl.activeTexture(ge.GL_TEXTURE0 + slot);
        this.gl.bindTexture(texture.target, texture.gl_texture);
      }

    };

    proto.use_direct_texture = function (texture, slot) {
      this.gl.activeTexture(ge.GL_TEXTURE0 + slot);
      this.gl.bindTexture(texture.target, texture.gl_texture);
    };
    proto.draw_textured_quad = (function () {
      var att = {
        item_size: 2, data: new Float32Array([
          -1, -1,
          1, -1,
          1, 1,

          -1, -1,
          1, 1,
          -1, 1
        ])
      }
      var shdr = ge.webgl.shader.parse(glsl["textured-quad"]);
      var u_pos_size = math.vec4();
      return function (texture, left, top, width, height) {
        u_pos_size[0] = left;
        u_pos_size[1] = top;
        u_pos_size[2] = width;
        u_pos_size[3] = height;
        this.use_geometry_attribute(0, att);
        this.use_shader(shdr);
        shdr.set_uniform("u_pos_size", u_pos_size);
        this.gl_disable(ge.GL_DEPTH_TEST);
        this.gl_disable(ge.GL_CULL_FACE);
        this.use_texture(texture, 0);
        this.gl.drawArrays(4, 0, 6);

      }
    })();
    proto.draw_full_quad = function () {
      this.gl.bindBuffer(ge.GL_ARRAY_BUFFER, this.full_quad);
      this.gl.enableVertexAttribArray(0);
      this.gl.vertexAttribPointer(0, 2, ge.GL_FLOAT, false, 0, 0);
      this.gl.drawArrays(ge.GL_TRIANGLES, 0, 6);
    };

    

    proto.apply_post_processes = (function () {




      return function () {
        
        this.post_process_input = this.default_render_target.color_texture;
        this.post_target = this.default_render_target.swap;



        var i1 = 0;
        this.gl_disable(ge.GL_DEPTH_TEST);
        
        for (var i0 = 0; i0 < this.post_processes.length; i0++) {
          post_process = this.post_processes[i0];
          if (post_process.enabled) {
            
            if (i1 % 2 === 0) {
              post_process.apply(this, this.post_process_input, this.post_target);
              this.post_process_input = this.post_target.color_texture;
              this.post_target = this.post_target.swap;
            }
            else {              
              post_process.apply(this, this.post_process_input, this.post_target);
              this.post_process_input = this.post_target.color_texture;
              this.post_target = this.post_target.swap;
            }
            i1++;
          }
        }
        


        if (this.output_to_screen) {
          this.render_target_id = -1;
          this.gl.bindFramebuffer(ge.GL_FRAMEBUFFER, null);
          this.use_shader(ge.effects.post_process.shader);


          this.gl.viewport(this.render_width * this.vp_left, this.render_height * this.vp_top,
            this.render_width * this.vp_width, this.render_height * this.vp_height);


        
          this.use_direct_texture(this.post_process_input, 0);
          this.draw_full_quad();
          this.has_error = this.gl.getError();
          if (this.has_error !== this.gl.NO_ERROR) {
            console.error(this.has_error);

          }

        }


        this.gl_enable(ge.GL_DEPTH_TEST);
      }
    })();


    // shadow mapping ////
    proto.render_light_shadows = (function () {

      var shadow_maps = {}, shadow_map = null;
      function get_shadow_map(renderer, size) {
        shadow_map = shadow_maps[size];
        if (!shadow_map) {
          shadow_map = new ge.webgl.render_target(renderer, size, size);
          shadow_map.attach_color();
          shadow_map.attach_depth();
          shadow_maps[size] = shadow_map;
        }
        return shadow_map;
      }
      

      fin.macro$(function renderer_render_shadow_receivers(light$, light_camera$, camera$, meshes$) {
        for (mi = 0; mi < meshes$.length; mi++) {
          mesh = meshes$[mi];

          if ((mesh.material.flags & ge.SHADING.RECEIVE_SHADOW) !== 0) {


            if (light$.light_type > 0) {
              if (math.vec3.calc_distance(
                light_camera.view[12],
                light_camera.view[13],
                light_camera.view[14],
                mesh.world_position[0],
                mesh.world_position[1],
                mesh.world_position[2]
              ) - mesh.bounds_sphere > light.range * 2) {
                continue
              }
            }
            renderer.receive_shadow_count++;


            // if shadow receiving  shader is not created , extend it from mesh material shader and create it
            shader = mesh.material.shader;
            if (light$.light_type > -1) {
              if (!shader.default_shadow_receiver) {
                shader.default_shadow_receiver = shader.extend(glsl['receive-shadow'], { fragment: false });
                shader.default_shadow_receiver.shadow_shader = true;
              }
              shader = shader.default_shadow_receiver;
            }

           
            if (renderer.use_shader(shader)) {
              ge.webgl_shader_set_uniform_unsafe$("u_view_projection_rw", camera$.view_projection)
            };

            ge.webgl_shader_set_uniform_unsafe$("u_shadow_map_rw", 4)
            ge.webgl_shader_set_uniform_unsafe$("u_light_camera_matrix_rw", light_camera$.view_projection)
            ge.webgl_shader_set_uniform_unsafe$("u_light_pos_rw", u_light_pos_rw)
            ge.webgl_shader_set_uniform_unsafe$("u_light_dir_rw", u_light_dir_rw)
            ge.webgl_shader_set_uniform_unsafe$("u_shadow_params_rw", u_shadow_params_rw)
            ge.webgl_shader_set_uniform_unsafe$("u_shadow_attenuation_rw", u_shadow_attenuation_rw)


            ge.webgl_shader_set_uniform$("u_model_rw", mesh.matrix_world)

            ge.renderer_render_mesh$(mesh)

          }


        }

      }, ge)

      fin.macro$(function renderer_render_shadow_casters(light$, light_camera$, meshes$) {
        cast_count = 0;
        for (mi = 0; mi < meshes$.length; mi++) {
          mesh = meshes$[mi];
          if ((mesh.material.flags & ge.SHADING.CAST_SHADOW) !== 0) {

            if (light$.light_type > 0) {
              if (math.vec3.calc_distance(
                light_camera$.view[12],
                light_camera$.view[13],
                light_camera$.view[14],
                mesh.world_position[0],
                mesh.world_position[1],
                mesh.world_position[2]
              ) - mesh.bounds_sphere > light$.range * 3) {
                continue
              }
            }


            cast_count++;
            

            
            // if shadow casting shader is not created , extend it from mesh material shader and create it
            
            shader = mesh.material.shader;
            if (light$.light_type > -1) {
              if (!shader.default_shadow_map) {
                shader.default_shadow_map = shader.extend(glsl['render-shadow-map'], { fragment: false });
                shader.default_shadow_map.shadow_shader = true;               
              }
              shader = shader.default_shadow_map;
            }

            if (renderer.use_shader(shader)) {
              ge.webgl_shader_set_uniform_unsafe$("u_view_projection_rw", light_camera$.view_projection)
            }           

            ge.webgl_shader_set_uniform_unsafe$("u_model_rw", mesh.matrix_world)
            ge.renderer_render_mesh$(mesh)
          }
        }



      }, ge)



      var qa = math.quat(), u_shadow_params_rw = math.vec4(), u_light_pos_rw = math.vec3(), u_light_dir_rw = math.vec3(), u_shadow_attenuation_rw = math.vec4();
      var cast_count = 0, total_shadow_casters = 0;
      macro_scope$('math.quat')
      macro_scope$('math.mat4')

      return function (light, camera, opuque_meshes, transparent_meshes) {


      // get shadow map based on shadow map size in light
        shadow_map = get_shadow_map(this, light.shadow_map_size);

        var mesh, light_camera = null, mi = 0, shader, uni, renderer = this, d = 0, gl = this.gl, update_light_camera_matrices = false;


        // create light camera 
        if (!light.camera) {
          light.camera = {
            view: math.mat4(),
            view_inverse: math.mat4(),
            projection: math.mat4(),
            view_projection: math.mat4(),
            light_version: -1,
            camera_version: -1,
            version: 0
          };

          // default directional light
          if (light.light_type === 0) {
            d = light.shadow_camera_distance * 2;
            math.mat4_ortho$(light.camera.projection, -d, d, -d, d, -d * 0.75, d * 5)

          }
          // point light (fake camera since actual point ligh shadows requires 4 cameras and render pass)
          else if (light.light_type === 1) {
            d = 150 * math.DEGTORAD;
            math.mat4_perspective$(light.camera.projection, d, 1, 0.5, light.range * 8)
            d = -90 * math.DEGTORAD;
            math.quat_rotate_eular$(qa, d, 0, 0)
            math.mat4_from_quat$(light.camera.view, qa)

          }
          // spot light
          else if (light.light_type === 2) {

            math.mat4_perspective$(light.camera.projection, light.view_angle, 1, 0.1, light.range * 4)
          }
          light.camera.world_position = new Float32Array(light.camera.view.buffer, (12 * 4), 3);


        }

        light_camera = light.camera;


        // check light is moved then light camera needs to be updated
        if (light_camera.light_version !== light.version || update_light_camera_matrices) {
          if (light.light_type === 1) { // point light only set position
            light_camera.view[12] = light.world_position[0];
            light_camera.view[13] = light.world_position[1];
            light_camera.view[14] = light.world_position[2];
          }
          else {
            math.mat4_copy$(light_camera.view, light.matrix_world)
          }
          update_light_camera_matrices = true;
        }

        ///light moves or viewer camera updated
        if (light_camera.camera_version !== camera.version || update_light_camera_matrices) {
          if (light.light_type === 0) {
            d = -light.shadow_camera_distance;
            light_camera.world_position[0] = (camera.fw_vector[0] * d) + camera.world_position[0];
            light_camera.world_position[1] = (camera.fw_vector[1] * d) + camera.world_position[1];
            light_camera.world_position[2] = (camera.fw_vector[2] * d) + camera.world_position[2];
          }

          update_light_camera_matrices = true;
        }

        // if light view camera need updates
        if (update_light_camera_matrices) {

          math.mat4_inverse$(light_camera.view_inverse, light_camera.view)
          math.mat4_multiply$(light_camera.view_projection, light_camera.projection, light_camera.view_inverse)

        }


        light_camera.camera_version = camera.version;
        light_camera.light_version = light.version;
        light_camera.version = camera.version + light.version;

        // bind shadow map
        shadow_map.bind();


        

        //cull front faces for better shadow rendering so only back faces are rendered
        this.gl_cullFace(ge.GL_FRONT);

        // render all the opuque shadow casters
        ge.renderer_render_shadow_casters$(light, light_camera, opuque_meshes)


        total_shadow_casters = cast_count;


        if (transparent_meshes.length > 0) {
          this.gl_enable(ge.GL_BLEND);
          this.gl_blendFunc(ge.GL_SRC_ALPHA, ge.GL_ONE_MINUS_SRC_ALPHA);

          // render all the  transparent shadow casters

          ge.renderer_render_shadow_casters$(light, light_camera, transparent_meshes)
          total_shadow_casters += cast_count;

        }


        u_shadow_params_rw[0] = light.shadow_intensity;
        u_shadow_params_rw[1] = 1 / light.shadow_map_size;
        u_shadow_params_rw[2] = light.shadow_bias;

        u_light_dir_rw[0] = light.matrix_world[8];
        u_light_dir_rw[1] = light.matrix_world[9];
        u_light_dir_rw[2] = light.matrix_world[10];


        // light camera view angle  to clamp shadow
        u_shadow_params_rw[3] = Math.cos(light.view_angle * 0.5);


        if (light.light_type === 0) {
          u_light_pos_rw[0] = u_light_dir_rw[0] * light.range;
          u_light_pos_rw[1] = u_light_dir_rw[1] * light.range;
          u_light_pos_rw[2] = u_light_dir_rw[2] * light.range;
        }
        else {

          math.vec3_copy$(u_light_pos_rw, light.world_position)
        }


        this.gl_cullFace(ge.GL_BACK);


        this.set_default_viewport();

        if (total_shadow_casters > 0) {

          // if there are any shadow casters then render shadow receivers 

          this.receive_shadow_count = 0;

          if (light.light_type === 1) {
            u_shadow_attenuation_rw[0] = 0;
            u_shadow_attenuation_rw[1] = (
              light.attenuation[0]
              + light.attenuation[1]

            ) * 2;
            u_shadow_attenuation_rw[2] = light.attenuation[2] * 2;
            u_shadow_attenuation_rw[3] = light.range * 0.95;
          }
          else if (light.light_type === 2) {
            u_shadow_attenuation_rw[0] = 0;
            u_shadow_attenuation_rw[1] = (
              light.attenuation[1]

            ) * 0.75;
            u_shadow_attenuation_rw[2] = light.attenuation[2] * 0.5;
            u_shadow_attenuation_rw[3] = light.range;

            u_shadow_attenuation_rw[0] = 1;
            u_shadow_attenuation_rw[1] = 0;
            u_shadow_attenuation_rw[2] = 0;
            u_shadow_attenuation_rw[3] = light.range;

          }
          else {

            // u_shadow_params_rw[0] = light.shadow_intensity * (light.range * 0.5);
            u_shadow_attenuation_rw[0] = 1;
            u_shadow_attenuation_rw[1] = 0;
            u_shadow_attenuation_rw[2] = 0;
            u_shadow_attenuation_rw[3] = light.range;

          }




          
          ge.renderer_enable_fw_rendering$(renderer)

          this.gl_blendEquation(ge.GL_FUNC_REVERSE_SUBTRACT);
          this.use_direct_texture(shadow_map.color_texture, 0);
          this.use_direct_texture(shadow_map.depth_texture, 4);

          // render all the opuque shadow receivers
          ge.renderer_render_shadow_receivers$(light, light_camera, camera, opuque_meshes)

          if (transparent_meshes.length > 0) {
            this.gl_depthFunc(ge.GL_LESS);
            // render all the transparent shadow receivers
            ge.renderer_render_shadow_receivers$(light, light_camera, camera, transparent_meshes)
          }
          this.gl_blendEquation(ge.GL_FUNC_ADD);
          ge.renderer_disable_fw_rendering$(renderer)
        }






        //this.draw_textured_quad(shadow_map.color_texture,0.65, 0.5, 0.25 / camera.aspect, 0.35);



      }
    })();



   

   



    fin.macro$(function renderer_enable_fw_rendering(renderer$) {
      //enable forward rendering
      renderer$.gl_blendFunc(ge.GL_ONE, ge.GL_ONE);
      if (!renderer$.fw_rendering_mode) {
        renderer$.gl_enable(ge.GL_BLEND);
        renderer$.gl_depthMask(false);
        renderer$.gl_depthFunc(ge.GL_EQUAL);
        renderer$.fw_rendering_mode = true;
      }

    }, ge)


    fin.macro$(function renderer_disable_fw_rendering(renderer$) {
      //disable forward rendering
      if (renderer$.fw_rendering_mode) {
        renderer$.gl_disable(ge.GL_BLEND);
        renderer$.gl_depthFunc(ge.GL_LESS);
        renderer$.gl_depthMask(true);
        renderer$.fw_rendering_mode = false;
      }
    }, ge)


    fin.macro$(function renderer_render_mesh(mesh$) {
      renderer.use_geometry(mesh$.geometry);
      mesh$.material.render_mesh(renderer, shader, mesh$);
    }, ge)

      

    fin.macro$(function renderer_update_camera_uniforms(camera$) {
      if (shader.camera_version !== camera$.version) {
        shader.camera_version = camera.version;
        ge.webgl_shader_set_uniform$("u_view_projection_rw", camera$.view_projection)
        ge.webgl_shader_set_uniform$("u_view_rw", camera$.view_inverse)
        ge.webgl_shader_set_uniform$("u_view_fw", camera$.fw_vector)
        ge.webgl_shader_set_uniform$("u_view_sd", camera$.sd_vector)
        ge.webgl_shader_set_uniform$("u_view_up", camera$.up_vector)
      }
    }, ge)
      
    fin.macro$(function renderer_render_light_begin() {
      return (['this.light_pass_count = 0;this.lights_batch_size = 0;',
        'for (li = 0; li < lights.length; li++) {',
        'light = lights[li];',
        'this.shading_lights[this.lights_batch_size++] = light;',
        'update_shading_lights = this.lights_batch_size === this.fws_num_lights || li === lights.length - 1;',
        ' if (update_shading_lights) {'].join('\n'));
    }, ge)

    fin.macro$(function renderer_render_light_end() {
      return (['this.lights_batch_size = 0;this.light_pass_count++;',
        'if (lights.length > this.fws_num_lights) {',
        'ge.renderer_enable_fw_rendering$(this)',
        '}}}'].join('\n'));
    }, ge)


    fin.macro$(function renderer_update_shading_lights(camera$) {

      total_lights = 0;

      if (loop_count === -1) loop_count = this.lights_batch_size;
      for (si = 0; si < loop_count; si++) {
        light = this.shading_lights[si];

        if (light != null) {
          if (light.light_type === 0) {
            math.vec3_copy$(lights_eye_position, light.world_position)
            math.vec3_set$(light.world_position, light.matrix_world[8] * 99999, light.matrix_world[9] * 99999, light.matrix_world[10] * 99999)
            light.attenuation[3] = 1;
          }
          else {
            light.attenuation[3] = 0;
          }

          ge.webgl_shader_set_uniform_unsafe$("u_light_material_rw" + si, light.light_material)
          ge.webgl_shader_set_uniform_unsafe$("u_light_matrix_rw" + si, light.matrix_world)

          if (light.light_type === 0) {
            math.vec3_copy$(light.world_position, lights_eye_position)
          }



        }



      }


      for (si = loop_count; si < this.fws_num_lights; si++) {
        ge.webgl_shader_set_uniform$("u_light_material_rw" + si, dummy_light_m4)
        ge.webgl_shader_set_uniform$("u_light_matrix_rw" + si, dummy_m4)
      }

      math.vec3_copy$(lights_eye_position, camera$.world_position)


      lights_eye_position[3] = this.lights_batch_size;

      ge.webgl_shader_set_uniform$("u_eye_position_rw" , lights_eye_position)


    }, ge)


   



    var lights_eye_position = math.vec4(), dummy_light_m4 = math.mat4();
    dummy_light_m4.fill(0);
    dummy_light_m4[3] = 0; dummy_light_m4[15] = 0.5;


    var dummy_m4 = math.mat4();

    proto.render_single_mesh = function (camera, mesh) {

      if (renderer.use_shader(mesh.material.shader) || update_shading_lights) {
        shader = renderer.active_shader;
        update_shading_lights = false;
        ge.renderer_update_camera_uniforms$(camera)


      }
      ge.webgl_shader_set_uniform$("u_model_rw", mesh.matrix_world)
      ge.renderer_render_mesh$(mesh)
    }

    proto.render_scene = function (camera, flat_meshes, opuque_meshes, transparent_meshes, lights) {
      if (this.has_error !== this.gl.NO_ERROR) { return; }

      this.last_shader_id = -1;
      this.render_target_id = -1;
      this.active_shader = null;
      this.texture_slots[0] = -1;
      this.texture_slots[1] = -1;
      this.texture_slots[2] = -1;
      this.flat_meshes = flat_meshes;
      this.opuque_meshes = opuque_meshes;
      this.transparent_meshes = transparent_meshes;

      this.active_camera = camera;

      var i, li = 0, si = 0, mesh, light, renderer, shader, uni, update_shading_lights = false, loop_count = 0, gl = this.gl;



      renderer = this;
      shader = renderer.active_shader;

      renderer.set_default_viewport();
      renderer.clear_screen();

      
      ge.renderer_disable_fw_rendering$(renderer)

      if (opuque_meshes.length > 0) {
        //begin render lighting
        ge.renderer_render_light_begin$()
        for (i = 0; i < opuque_meshes.length; i++) {
          mesh = opuque_meshes[i];
          if (renderer.light_pass_count >= mesh.material.light_pass_limit) continue;
          if (renderer.use_shader(mesh.material.shader) || update_shading_lights) {
            shader = renderer.active_shader;
            update_shading_lights = false;
            //update camera uniforms
            ge.renderer_update_camera_uniforms$(camera)

            loop_count = mesh.material.lights_count;
            ge.renderer_update_shading_lights$(camera)
            
          }
          ge.webgl_shader_set_uniform$("u_model_rw", mesh.matrix_world)
          ge.renderer_render_mesh$(mesh)
          
        }
        ge.renderer_render_light_end$()
        
      }


      ge.renderer_disable_fw_rendering$(renderer)
      // flat_meshes


      for (i = 0; i < flat_meshes.length; i++) {
        mesh = flat_meshes[i];
        if (renderer.use_shader(mesh.material.shader)) {          
          shader = renderer.active_shader;
          ge.renderer_update_camera_uniforms$(camera)
        }
        ge.webgl_shader_set_uniform$("u_model_rw", mesh.matrix_world)
        ge.renderer_render_mesh$(mesh)  
      }

      
      for (li = 0; li < lights.length; li++) {
        light = lights[li];
        if (light.cast_shadows) {
          this.render_light_shadows(light, camera, opuque_meshes, transparent_meshes);
        }
        this.texture_slots[0] = -1;


      }




     

      if (transparent_meshes.length > 0) {
        ge.renderer_disable_fw_rendering$(renderer)

        for (i = 0; i < transparent_meshes.length; i++) {
          mesh = transparent_meshes[i];

          if (mesh.material.flags & ge.SHADING.SHADED) {
            if (renderer.light_pass_count >= mesh.material.light_pass_limit) continue;
            ge.renderer_render_light_begin$()
            if (renderer.use_shader(mesh.material.shader) || update_shading_lights) {
              shader = renderer.active_shader;
              ge.renderer_update_camera_uniforms$(camera)
              ge.webgl_shader_set_uniform$("u_model_rw", mesh.matrix_world)

              loop_count = mesh.material.lights_count;
              ge.renderer_update_shading_lights$(camera)

              if (renderer.light_pass_count === 0) {
                renderer.gl_enable(ge.GL_BLEND);
                renderer.gl_blendFunc(ge.GL_SRC_ALPHA, ge.GL_ONE_MINUS_SRC_ALPHA);
                renderer.gl_cullFace(ge.GL_FRONT);
                ge.renderer_render_mesh$(mesh)
                renderer.gl_cullFace(ge.GL_BACK);
                ge.renderer_render_mesh$(mesh)
              }
              else {
                renderer.gl_blendFunc(ge.GL_SRC_ALPHA, ge.GL_ONE);
                ge.renderer_render_mesh$(mesh)
              }
            }
            ge.renderer_render_light_end$()

          }

          else {
            if (renderer.use_shader(mesh.material.shader)) {
              shader = renderer.active_shader;
              ge.renderer_update_camera_uniforms$(camera)
            }
            ge.webgl_shader_set_uniform$("u_model_rw", mesh.matrix_world)
            renderer.gl_enable(ge.GL_BLEND);
            renderer.gl_blendFunc(ge.GL_SRC_ALPHA, ge.GL_ONE_MINUS_SRC_ALPHA);
            ge.renderer_render_mesh$(mesh)
          }


        }
      }

      



      //disable forward rendering
      ge.renderer_disable_fw_rendering$(renderer)
      renderer.set_default_viewport();
      if (this.active_shader !== null) {
        this.active_shader.exit(this);
      }

     

      if (this.default_render_target !== null) this.apply_post_processes();





    };

   
    ge_renderer=function (def) {
      def = def || {};
      
      var _canvas = def.canvas
      if (!_canvas) {
        _canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
        _canvas.setAttribute("style", "position:absolute;width:100%;height:100%;left:0;top:0;box-sizing: border-box;");
       
      }

      this.priority = 5000;

      def = fin.merge_object(def, {
        alpha: false, depth: true, stencil: true,
        antialias: false, premultipliedAlpha: false,
        preserveDrawingBuffer: false, xrCompatible: true
      });
      var gl = def.context || _canvas.getContext('webgl', def );

      this.shader_parameters = {
        fws_num_lights: def.lights_count_per_pass || 1
      };

      if (gl === null) {
        if (_canvas.getContext('webgl') !== null) {
          throw new Error('Error creating WebGL context with your selected attributes.');
        } else {
          throw new Error('Error creating WebGL context.');
        }
      }

      this.pixel_ratio = def.pixel_ratio || window.devicePixelRatio;

      _canvas.addEventListener('webglcontextlost', function () {
        console.log('webglcontextlost', this);
      }, false);

      _canvas.addEventListener('webglcontextrestored', function () {
        console.log('webglcontextrestored', this);
      }, false);


      gl.OES_vertex_array_object = gl.getExtension("OES_vertex_array_object");
      gl.OES_standard_derivatives = gl.getExtension("OES_standard_derivatives");
      gl.WEBGL_depth_texture = gl.getExtension('WEBGL_depth_texture');
      gl.ANGLE_instanced_arrays = gl.getExtension('ANGLE_instanced_arrays');
      gl.OES_element_index_uint = gl.getExtension('OES_element_index_uint');
    
      this.gl_states = {
        depthMask: false, blendFunc0: -1, blendFunc1: -1, framebuffer: undefined,
      };
      this.gl_states_flags = new Uint8Array(1024 * 64);
      this.gl = gl;
      this.canvas = _canvas;

      
      this.render_target_id = 0;
      
      this.render_target1 = new ge.webgl.render_target(this, 10, 10);
      this.render_target1.attach_depth_buffer().attach_color();
      this.render_target1.clear_buffer = false;



      this.default_render_target = this.render_target1;


      this.render_target2 = new ge.webgl.render_target(this, 10, 10);
      this.render_target2.attach_depth_buffer(this.render_target1.depth_buffer).attach_color();
      this.render_target2.clear_buffer = false;




      this.render_target1.swap = this.render_target2;
      this.render_target2.swap = this.render_target1;

     // this.default_render_target = null;
      
      this.post_processes = [];
      this.render_targets = [
        this.render_target1,
        this.render_target2,
      ];




      this.texture_slots = [-1, -1, -1, -1, -1, -1 - 1, -1, -1, -1];
      this.texture_updates = [];
      this.default_texture = new ge.webgl.texture();
      this.default_texture.needs_update = true;
      this.update_texture(this.default_texture);


      this.gl_enable(ge.GL_DEPTH_TEST);
      this.gl_cullFace(ge.GL_BACK);
      this.gl_enable(ge.GL_CULL_FACE);
      this.gl.clearColor(0, 0, 0, 1);


      this.full_quad = ge_renderer.gl_buffers.get(gl);
      gl.bindBuffer(ge.GL_ARRAY_BUFFER, this.full_quad);
      gl.bufferData(ge.GL_ARRAY_BUFFER, new Float32Array([
        -1, -1,
        1, -1,
        1, 1,
        -1, -1,
        1, 1,
        -1, 1,
      ]), ge.GL_STATIC_DRAW, 0, 12);


      this.fws_num_lights = this.shader_parameters.fws_num_lights;
      this.shading_lights = [];
      for (var i = 0; i < this.shader_parameters.fws_num_lights; i++) {
        this.shading_lights[i] = null;
      }


      this.has_error = 0;

      this.light_pass_count = 0;
      this.lights_batch_size = 0;
      this.active_camera = null;
      this.frame_buffer_layer = null;

      this.default_color_attribute = {
        name: "a_color_rw",
        item_size: 4,
        data: new Float32Array(100000 * 4)
      };
      this.vp_left = 0;
      this.vp_top = 0;
      this.vp_width = 1;
      this.vp_height = 1;
      this.sbs_display = false;
      this.sbs_depth = 2;

      this.default_color_attribute.data.fill(1);
      this.is_renderer = true;
      this.active_camera = null;

      this.fog_params = math.vec3(0, 0, 0);
      this.fog_color = math.vec4(0.165, 0.165, 0.165, 0.001);

      this.timer = 0;

      this.output_to_screen = true;
      this.frame_eye_index = 0;
      this.render_width = this.canvas.width;
      this.render_height = this.canvas.height;


    }

    ge_renderer.gl_buffers = new fin.object_pooler(function (gl) {
      return gl.createBuffer();
    });
    ge_renderer.gl_textures = new fin.object_pooler(function (gl) {
      return gl.createTexture();
    });
    











    return ge_renderer;
    
  });



}