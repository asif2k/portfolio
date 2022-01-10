function shading(ge, math) {
  ge.shading = {};

  // Materials
  (function () {

    var glsl = ge.webgl.shader.create_chunks_lib(`import('shaders/shading.glsl')`);

    ge.shading.material = ge.define(function (proto, _super) {
      function ge_material(def) {

        def = def || {};


        _super.apply(this, [def]);


        this.uuid = ge.guidi();

        this.object_material = new Float32Array(16);
        this.ambient = new Float32Array(this.object_material.buffer, 0, 4);
        this.diffuse = new Float32Array(this.object_material.buffer, 4 * 4, 4);
        this.specular = new Float32Array(this.object_material.buffer, 8 * 4, 4);

        this.texture = def.texture || null;

        math.vec3.copy(this.ambient, def.ambient || [0.5, 0.5, 0.5]);
        math.vec3.copy(this.diffuse, def.diffuse || [0.5, 0.5, 0.5]);
        math.vec3.copy(this.specular, def.specular || [0.863, 0.863, 0.863]);

        this.ambient[3] = 1;

        this.texture_matrix = math.mat3();

        this.instances_count = -1;
        this.wireframe = def.wireframe || false;
        this.flags = ge.SHADING.FLAT;
        if (def.flags !== undefined) this.flags += def.flags;
        this.shader = def.shader || ge.shading.material.shader;
        this.draw_type = ge.GL_TRIANGLES;
        if (def.draw_type !== undefined) {
          this.draw_type = def.draw_type;
        }

        
        if (def.always_display) {
          this.flags += ge.DISPLAY_ALWAYS;
        }

        this.on_before_render = new ge.event(this);
        this.on_after_render = new ge.event(this);
        this.draw_elements = false;
        this.transparent_layer = def.transparent_layer ||  0;

        if (def.transparent !== undefined) {
          this.set_tansparency(def.transparent);
        }
        this.cull_face = def.cull_face || ge.GL_BACK;

      }

      ge_material.shader = ge.webgl.shader.parse(glsl["flat-material"]);


      proto.set_tansparency = function (v) {
        this.ambient[3] = Math.min(v, 1);
        if (v < 1) this.set_flag(ge.SHADING.TRANSPARENT);
        else this.unset_flag(ge.SHADING.TRANSPARENT);
        return (this);
      };
      proto.set_shinness = function (shin) {
        this.specular[3] = shin;
        return (this);
      };

      proto.set_ambient = function (r, g, b) {
        this.ambient[0] = r;
        this.ambient[1] = g;
        this.ambient[2] = b;
        return (this);
      };


      proto.set_diffuse = function (r, g, b) {
        this.diffuse[0] = r;
        this.diffuse[1] = g;
        this.diffuse[2] = b;
        return (this);
      };

      fin.macro$(function shading_material_depth_cull(renderer$) {
        if (this.flags & ge.SHADING.NO_DEPTH_TEST) {
          renderer$.gl_disable(ge.GL_DEPTH_TEST);
        }
        else {
          renderer$.gl_enable(ge.GL_DEPTH_TEST);
        }
        if ((this.flags & ge.SHADING.DOUBLE_SIDES) !== 0) {
          renderer$.gl_disable(ge.GL_CULL_FACE);
        }
        else {
          renderer$.gl_enable(ge.GL_CULL_FACE);
        }
      }, ge)

      
      proto.render_mesh = (function () {
        var eparams = [null, null, null]

        proto.complete_render_mesh = function (renderer, shader, mesh) {
          if (this.instances_count > -1) {
            if (this.instances_count > 0) {
              if (this.draw_elements) {
                renderer.gl.ANGLE_instanced_arrays.drawElementsInstancedANGLE(this.final_draw_type, this.final_draw_count, ge.GL_UNSIGNED_INT, mesh.draw_offset, this.instances_count);
              }
              else {
                renderer.gl.ANGLE_instanced_arrays.drawArraysInstancedANGLE(this.final_draw_type, mesh.draw_offset, this.final_draw_count, this.instances_count);
              }
            }
          }
          else {
            if (this.draw_elements) {
              renderer.gl.drawElements(this.final_draw_type, this.final_draw_count, ge.GL_UNSIGNED_INT, mesh.draw_offset);
            }
            else {

              renderer.gl.drawArrays(this.final_draw_type, mesh.draw_offset, this.final_draw_count);
            }
          }
        };
        return function (renderer, shader, mesh) {

          eparams[0] = renderer;
          eparams[1] = shader;
          eparams[2] = mesh;

          ge.shading_material_depth_cull$(renderer)

          var uni;

          ge.webgl_shader_set_uniform$("u_object_material_rw", this.object_material)
          ge.webgl_shader_set_uniform$("u_texture_matrix_rw", this.texture_matrix)
          
          renderer.use_texture(this.texture, 0);



          this.final_draw_type = this.wireframe ? ge.GL_LINES : this.draw_type;
          this.final_draw_count = mesh.draw_count || mesh.geometry.num_items;


          this.draw_elements = renderer.activate_geometry_index_buffer(mesh.geometry, this.wireframe);

          if (this.wireframe) this.final_draw_count *= 2;

          this.on_before_render.trigger(eparams);

          this.complete_render_mesh(renderer, shader, mesh);

          this.on_after_render.trigger(eparams);




        }
      })();

      return ge_material;
    }, ge.flags_setting);


    ge.shading.shaded_material = ge.define(function (proto, _super) {

      function ge_shaded_material(def) {
        def = def || {};
        _super.apply(this, [def]);
        this.shader = ge.shading.shaded_material.shader;
        this.flags = ge.SHADING.SHADED;
        this.light_pass_limit = 10000;
        this.lights_count = -1;
        this.set_shinness(def.shinness || 100);
        if (def.transparent !== undefined) {
          this.set_tansparency(def.transparent);
        }
        if (def.cast_shadows) {
          this.flags += ge.SHADING.CAST_SHADOW
        };

        if (def.receive_shadows) {
          this.flags += ge.SHADING.RECEIVE_SHADOW
        };
        if (def.flags !== undefined) this.set_flag(def.flags);
        return (this);

      }

      ge_shaded_material.shader = ge.webgl.shader.parse(glsl["shaded-material"]);


      return ge_shaded_material;
    }, ge.shading.material);

  })();

  // Lights
  (function () {
    ge.shading.light = ge.define(function (proto, _super) {

      proto.update_bounds = function (mat, trans) {
        if (this.light_type > -1) {
          var r = this.range * 0.5;
          var p = this.world_position;


          this.bounds[0] = p[0];
          this.bounds[1] = p[1];
          this.bounds[2] = p[2];
          this.bounds[3] = p[0];
          this.bounds[4] = p[1];
          this.bounds[5] = p[2];

          minx = p[0] - r;
          miny = p[1] - r;
          minz = p[2] - r;

          maxx = p[0] + r;
          maxy = p[1] + r;
          maxz = p[2] + r;


          this.expand_bounds(minx, miny, minz);
          this.expand_bounds(minx, miny, maxz);
          this.expand_bounds(minx, maxy, minz);
          this.expand_bounds(minx, maxy, maxz);

          this.expand_bounds(maxx, miny, minz);
          this.expand_bounds(maxx, miny, maxz);
          this.expand_bounds(maxx, maxy, minz);
          this.expand_bounds(maxx, maxy, maxz);

        }
      };
      proto.set_intensity = function (v) {
        this.ambient[3] = v;
        return (this);
      };
      proto.set_ambient = function (r, g, b) {
        math.vec3.set(this.ambient, r, g, b);
        return (this);
      };

      proto.set_diffuse = function (r, g, b) {
        math.vec3.set(this.diffuse, r, g, b);
        return (this);
      };

      proto.set_specular = function (r, g, b) {
        math.vec3.set(this.specular, r, g, b);
        return (this);
      };

      proto.enable_shadows = function (def) {
        def = def || {};
        this.cast_shadows = true;
        this.shadow_bias = def.shadow_bias || 0.00000001;
        this.shadow_intensity = def.shadow_intensity || this.shadow_intensity;
        this.shadow_map_size = def.shadow_map_size || 1024;
        this.shadow_camera_distance = def.shadow_camera_distance || 30;
        return (this);
      };



      function ge_light(def) {
        def = def || {};
        _super.apply(this, [def]);
        this.light_material = new Float32Array(16);
        this.ambient = new Float32Array(this.light_material.buffer, 0, 4);
        this.diffuse = new Float32Array(this.light_material.buffer, 4 * 4, 4);
        this.specular = new Float32Array(this.light_material.buffer, 8 * 4, 4);
        this.attenuation = new Float32Array(this.light_material.buffer, 12 * 4, 4);

        this.diffuse[3] = -1;
        this.specular[3] = -1;
        this.range = 20000;
        this.light_type = 0;
        this.enabled = true;
        this.item_type = ge.ITEM_TYPES.LIGHT;
        this.view_angle = Math.PI;
        this.flags = ge.DISPLAY_ALWAYS;

        this.version = 0;
        math.vec3.copy(this.ambient, def.ambient || [0.1, 0.1, 0.1]);
        math.vec3.copy(this.diffuse, def.diffuse || [0.87, 0.87, 0.87]);
        math.vec3.copy(this.specular, def.specular || [0.85, 0.85, 0.85]);
        math.vec4.copy(this.attenuation, def.attenuation || [0, 0, 0, 0]);

        this.ambient[3] = def.intensity || 1;
        this.diffuse[3] = -1;
        this.specular[3] = -1;

        this.cast_shadows = def.cast_shadows || false;
        this.shadow_bias = def.shadow_bias || 0.00000001;
        this.shadow_intensity = def.shadow_intensity || 0.25;
        this.shadow_map_size = def.shadow_map_size || 1024;
        this.shadow_camera_distance = def.shadow_camera_distance || 30;


      }

      return ge_light;
    }, ge.renderable);


    ge.shading.point_light = ge.define(function (proto, _super) {


      proto.set_attenuation_by_distance = (function () {
        var values = [[7, 1.0, 0.7, 1.8],
        [13, 1.0, 0.35, 0.44],
        [20, 1.0, 0.22, 0.20],
        [32, 1.0, 0.14, 0.07],
        [50, 1.0, 0.09, 0.032],
        [65, 1.0, 0.07, 0.017],
        [100, 1.0, 0.045, 0.0075],
        [160, 1.0, 0.027, 0.0028],
        [200, 1.0, 0.022, 0.0019],
        [325, 1.0, 0.014, 0.0007],
        [600, 1.0, 0.007, 0.0002],
        [3250, 1.0, 0.0014, 0.000007]];
        var v1, v2, i, f;
        return function (d) {
          for (i = 0; i < values.length; i++) {
            if (d < values[i][0]) {
              v2 = i;
              break;
            }
          }
          if (v2 === 0) {
            return this.set_attenuation.apply(this, values[0]);
          }
          v1 = v2 - 1;
          f = values[v2][0] - values[v1][0];
          f = (d - values[v1][0]) / f;
          this.attenuation[0] = values[v1][1] + (values[v2][1] - values[v1][1]) * f;
          this.attenuation[1] = values[v1][2] + (values[v2][2] - values[v1][2]) * f;
          this.attenuation[2] = values[v1][3] + (values[v2][3] - values[v1][3]) * f;
          return (this);
        }
      })();


      proto.set_attenuation = function (a, b, c) {
        math.vec3.set(this.attenuation, a, b, c);
        return (this);
      };


      function ge_point_light(def) {
        def = def || {};
        _super.apply(this, [def]);
        this.flags = 0;
        this.shadow_intensity = 0.9;
        this.range = def.range || 20;

        if (def.attenuation) {
          this.set_attenuation(this.attenuation[0], this.attenuation[1], this.attenuation[2]);
        }
        else {
          this.set_attenuation_by_distance(this.range * 2);
        }



        this.specular[3] = 0;
        this.diffuse[3] = 0;
        this.light_type = 1;



      }

      return ge_point_light;
    }, ge.shading.light);


    ge.shading.spot_light = ge.define(function (proto, _super) {


      proto.set_outer_angle = function (angle) {
        this.view_angle = angle;
        this.diffuse[3] = Math.cos(angle / 2);
        return (this);
      };

      proto.set_inner_angle = function (angle) {
        this.specular[3] = Math.cos(angle / 2);
        return (this);
      };

      function ge_spot_light(def) {
        def = def || {};
        _super.apply(this, [def]);

        this.range = def.range || 10;
        if (def.attenuation) {
          this.set_attenuation(this.attenuation[0], this.attenuation[1], this.attenuation[2]);
        }
        else {
          this.set_attenuation_by_distance(this.range * 2);
        }
        this.set_outer_angle(def.outer || math.DEGTORAD * 50).set_inner_angle(def.inner || math.DEGTORAD * 50);

        this.light_type = 2;




      }

      return ge_spot_light;
    }, ge.shading.point_light);


  })();


}