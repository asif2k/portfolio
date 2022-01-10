function efffects(ge, math) {

  ge.effects = {};

  var glsl = ge.webgl.shader.create_chunks_lib(`import('shaders/effects.glsl')`);

  // Post Process

  ge.effects.post_process = ge.define(function (proto) {

    function post_process(shader) {
      this.guid = fin.guidi();
      this.shader = shader || ge.effects.post_process.shader;
      if (!this.on_apply) {
        this.on_apply = null;
      }
      this.enabled = true;
      this.post_shading = false;
    }

    post_process.shader = ge.webgl.shader.parse(glsl["pp-default"]);
    proto.resize = function (width, height) { }
    proto.bind_output = function (renderer, output) {
      if (output === null) {
        renderer.gl.bindFramebuffer(ge.GL_FRAMEBUFFER, null);
        renderer.gl.viewport(0, 0, renderer.render_width, renderer.render_height);
      }
      else {
        output.bind();
      }
    }

    var on_apply_params = [null, null, null];
    proto.apply = function (renderer, input, output) {
      renderer.use_shader(this.shader);
      this.bind_output(renderer, output);
      if (this.on_apply !== null) {
        on_apply_params[0] = renderer;
        on_apply_params[1] = input;
        on_apply_params[2] = output;
        input = this.on_apply.apply(this, on_apply_params);

      }     
      renderer.use_direct_texture(input, 0);
      renderer.draw_full_quad();
    }

    proto.on_apply = function (renderer, input, output) {
      return input;
    };

    return post_process;
  });


  ge.effects.post_process.fxaa = ge.define(function (proto, _super) {


    function fxaa(params) {
      params = params || {};
      _super.apply(this);
      this.shader = ge.effects.post_process.fxaa.shader;
      this.span_max = 16;
      this.reduce_min = (1 / 256);
      this.reduce_mul = (1 / 8);
      this.enabled = true;
      if (params.enabled !== undefined) this.enabled = params.enabled;
      fin.merge_object(params, this);

    }



    fxaa.shader = ge.effects.post_process.shader.extend(glsl["pp-fxaa"]);


    var u_inverse_filter_texture_size = math.vec3();
    var u_fxaa_params = math.vec3();

    proto.on_apply = function (renderer, input, output) {
      u_inverse_filter_texture_size[0] = 1 / input.width;
      u_inverse_filter_texture_size[1] = 1 / input.height;
      this.shader.set_uniform("u_inverse_filter_texture_size", u_inverse_filter_texture_size);

      u_fxaa_params[0] = this.span_max;
      u_fxaa_params[1] = this.reduce_min;
      u_fxaa_params[2] = this.reduce_mul;

      this.shader.set_uniform("u_fxaa_params", u_fxaa_params);

      return input;
    };

    return fxaa;


  }, ge.effects.post_process);




  ge.effects.post_process.bloom = ge.define(function (proto, _super) {


    function bloom(params) {
      params = params || {};
      _super.apply(this);
      fin.merge_object(params, this);
      this.resolution = params.resolution || 0.5;
      this.resolution_last = this.resolution;
      this.blur_quality = params.blur_quality || 9;
      this.u_bright_threshold_rw = math.vec4(params.bright_threshold || [0.2627, 0.6780, 0.0593, -0.95]);

      this.blend_exposure = params.blend_exposure || 3;
      this.blend_gamma = params.blend_gamma || 0.5;
      this.blend_factor = params.blend_factor || 3.0;

      this.u_offset_rw = math.vec2();
      this.blur_kernel = math.vec3(5.0 / 16.0, 6 / 16.0, 5 / 16.0);
     

    }
    var u_glow_params_rw = math.vec3();
    proto.apply = function (renderer, input, output) {
      if (!this.targets) {
        this.targets = [
          new ge.webgl.render_target(renderer, renderer.render_width * this.resolution, renderer.render_height * this.resolution),
          new ge.webgl.render_target(renderer, renderer.render_width * this.resolution, renderer.render_height * this.resolution)
        ];

        this.targets[0].attach_color().color_texture.enable_linear_interpolation();
        this.targets[1].attach_color().color_texture.enable_linear_interpolation();
      }       

           

      this.targets[0].bind();      
      renderer.use_shader(ge.effects.post_process.bloom.emission);
      renderer.use_direct_texture(input, 0);
      renderer.active_shader.set_uniform("u_bright_threshold_rw", this.u_bright_threshold_rw);
      renderer.draw_full_quad();

     
      
      renderer.use_shader(ge.effects.post_process.bloom.blur_shader);
      renderer.active_shader.set_uniform("u_blurKernel_rw", this.blur_kernel);
      

      var t = 0;
      for (var i = 1; i < this.blur_quality; i++) {
        t = i % 2;
        this.targets[t].bind();
        renderer.use_direct_texture(this.targets[(t === 0 ? 1 : 0)].color_texture, 0);
        if (t === 0) {
          this.u_offset_rw[0] = (1 / (input.width / i));
          this.u_offset_rw[1] = 0;

        }
        else {
          this.u_offset_rw[1] = (1 / (input.height / i));
          this.u_offset_rw[0] = 0;
        }

        renderer.active_shader.set_uniform("u_offset_rw", this.u_offset_rw);
        renderer.draw_full_quad();
      }

      this.bind_output(renderer, output);
      renderer.use_direct_texture(input, 0);
      renderer.use_shader(ge.effects.post_process.bloom.shader);      
      renderer.active_shader.set_uniform("u_glow_emission_rw", 1);

      u_glow_params_rw[0] = this.blend_exposure;
      u_glow_params_rw[1] = this.blend_gamma;
      u_glow_params_rw[2] = this.blend_factor;

      renderer.active_shader.set_uniform("u_glow_params_rw", u_glow_params_rw);
      renderer.use_direct_texture(this.targets[t].color_texture, 1);
      renderer.draw_full_quad();
      

      /*
      this.bind_output(renderer, output);     
      renderer.use_direct_texture(input, 0);
      renderer.use_shader(ge.effects.post_process.shader);           
      renderer.draw_full_quad();

      renderer.draw_textured_quad(this.targets[0].color_texture, 0.35, 0.5, 0.35, 0.35);
      */

    }

    bloom.shader = ge.effects.post_process.shader.extend(glsl["pp-bloom"]);
    bloom.blur_shader = ge.effects.post_process.shader.extend(glsl["pp-bloom-blur"]);
    bloom.emission = ge.effects.post_process.shader.extend(glsl["pp-bloom-emission"]);


    return bloom;


  }, ge.effects.post_process);





  ge.effects.glow_material = ge.define(function (proto, _super) {


    ge.effects.post_process.glow = ge.define(function (proto, _super) {


      function glow(params) {
        params = params || {};
        _super.apply(this);
        this.shader = ge.effects.post_process.glow.shader; 
        

        fin.merge_object(params, this);


        this.resolution = params.resolution || 0.5;
        this.resolution_last = this.resolution;
        this.blurQuality = params.blurQuality || 9;
        this.blendExposure = params.blendExposure || 3;
        this.blendGamma = params.blendGamma || 0.5;
        this.blendFactor = params.blendFactor || 3.0;
        this.u_offset_rw = math.vec2();
        this.blurKernel = math.vec3(5.0 / 16.0, 6 / 16.0, 5 / 16.0);


      }



      glow.shader = ge.effects.post_process.shader.extend(glsl["pp-glow"]);
      glow.blur_shader = ge.effects.post_process.shader.extend(glsl["pp-blur"]);
      glow.emission = ge.effects.post_process.shader.extend(glsl["pp-emission"]);


      console.log(glow.emission);

      var resolution = 0.5;
      glow.init = function (renderer) {
        if (!this.targets) {
          this.targets = [
            new ge.webgl.render_target(renderer, renderer.render_width * resolution, renderer.render_height *resolution),
            new ge.webgl.render_target(renderer, renderer.render_width * resolution, renderer.render_height * resolution)
          ];

          this.targets[0].attach_color().color_texture.enable_linear_interpolation();
          this.targets[1].attach_color().color_texture.enable_linear_interpolation();


          console.log(this.targets);
        }       
      }


      var u_glow_params_rw = math.vec3(1,1,3.0);
      proto.apply = function (renderer, input, output) {



        if (ge.effects.post_process.glow.meshes_count > 0) {

          renderer.use_shader(ge.effects.post_process.glow.blur_shader);
          renderer.active_shader.set_uniform("u_blurKernel_rw", this.blurKernel);


          var t = 0;
          for (var i = 1; i < this.blurQuality; i++) {
            t = i % 2;
            ge.effects.post_process.glow.targets[t].bind();
            renderer.use_direct_texture(ge.effects.post_process.glow.targets[(t === 0 ? 1 : 0)].color_texture, 0);
            if (t === 0) {
              this.u_offset_rw[0] = (1 / (input.width / i));
              this.u_offset_rw[1] = 0;

            }
            else {
              this.u_offset_rw[1] = (1 / (input.height / i));
              this.u_offset_rw[0] = 0;
            }

            renderer.active_shader.set_uniform("u_offset_rw", this.u_offset_rw);
            renderer.draw_full_quad();
          }


          this.bind_output(renderer, output);
          renderer.use_direct_texture(input, 0);
          renderer.use_shader(ge.effects.post_process.glow.shader);

          this.shader.set_uniform("u_glow_emission_rw", 1);
          this.shader.set_uniform("u_glow_params_rw", u_glow_params_rw);

          renderer.use_direct_texture(ge.effects.post_process.glow.targets[t].color_texture, 1);
          ge.effects.post_process.glow.meshes_count = 0;
        }

        else {
          this.bind_output(renderer, output);
          renderer.use_direct_texture(input, 0);
          renderer.use_shader(ge.effects.post_process.shader);
        }
        renderer.draw_full_quad();





        return input;

      };


      return glow;


    }, ge.effects.post_process);


    function ge_effects_glow_material(def) {
      def = def || {};
      _super.apply(this, [def]);
      this.shader = ge.effects.glow_material.shader;      
      return (this);

    }

    proto.complete_render_mesh_orig = proto.complete_render_mesh;
    proto.complete_render_mesh = function (renderer, shader, mesh) {

      if (shader.collect_meshes) {
        shader.glow_meshes[shader.glow_meshes.length] = mesh;
      }
      


      this.complete_render_mesh_orig(renderer, shader, mesh);
    }

    ge_effects_glow_material.shader = ge.shading.material.shader.extend(glsl["glow-material"]);
    ge_effects_glow_material.shader.ping_pong = false;

    var u_bright_threshold_rw = math.vec4(0.2627, 0.6780, 0.0593, -0.25)
    function handle_render(renderer, shader) {
      ge.effects.post_process.glow.init(renderer);
      ge.effects.post_process.glow.meshes_count = 0;
      if (shader.glow_meshes.length > 0) {
        shader.collect_meshes = false;
        if (renderer.render_target2.bind()) {
          renderer.gl.clear(ge.GL_COLOR_BUFFER_BIT);
        }
        renderer.gl_depthFunc(ge.GL_EQUAL);
        renderer.gl.useProgram(shader.program);

        var mesh;

        ge.effects.post_process.glow.meshes_count = shader.glow_meshes.length;


        for (var i = 0; i < shader.glow_meshes.length; i++) {
          mesh = shader.glow_meshes[i];
          shader.set_uniform("u_model_rw", mesh.matrix_world);
          renderer.use_geometry(mesh.geometry);
          mesh.material.render_mesh(renderer, shader, mesh);
        }
        renderer.gl_depthFunc(ge.GL_LESS);

        shader.glow_meshes.length = 0;


       
        renderer.use_shader(ge.effects.post_process.glow.emission);
        ge.effects.post_process.glow.targets[0].bind();
        renderer.gl_disable(ge.GL_DEPTH_TEST);
        ge.effects.post_process.glow.emission.set_uniform("u_bright_threshold_rw", u_bright_threshold_rw);
        renderer.use_direct_texture(renderer.render_target2.color_texture, 0);
        renderer.draw_full_quad();
        renderer.gl_enable(ge.GL_DEPTH_TEST);


        renderer.set_default_viewport();
       // renderer.draw_textured_quad(ge.effects.post_process.glow.targets[0].color_texture, 0.35, 0.5, 0.35, 0.35);







      }
    }

    ge_effects_glow_material.shader.enter = function (renderer) {
      if (!this.glow_meshes) {
        this.glow_meshes = [];
      }
      this.collect_meshes = true;
      this.glow_meshes.length = 0;      
      renderer.handler1[renderer.handler1.length] = handle_render;
      renderer.handler1[renderer.handler1.length] = this;


      
    };

    ge_effects_glow_material.shader.exit2 = function (renderer) {



      if (this.glow_meshes.length > 0) {
        this.collect_meshes = false;
        if (renderer.render_target3.bind()) {
          renderer.gl.clear(ge.GL_COLOR_BUFFER_BIT);
        }

      //  renderer.gl_blendFunc(ge.GL_ONE, ge.GL_ONE);
      //  renderer.gl_enable(ge.GL_BLEND);
       // renderer.gl_depthMask(false);
        renderer.gl_depthFunc(ge.GL_EQUAL);
        var mesh;


        for (var i = 0; i < this.glow_meshes.length; i++) {
          mesh = this.glow_meshes[i];
          this.set_uniform("u_model_rw", mesh.matrix_world);
          renderer.use_geometry(mesh.geometry);                    
          mesh.material.render_mesh(renderer, this, mesh);
        }
      //  renderer.gl_disable(ge.GL_BLEND);
        renderer.gl_depthFunc(ge.GL_LESS);
      //  renderer.gl_depthMask(true);


        this.glow_meshes.length = 0;
        renderer.set_default_viewport();
       // renderer.draw_textured_quad(renderer.render_target3.color_texture, 0.35, 0.5, 0.35, 0.35);

      }
      
    }
   
    return ge_effects_glow_material;
  }, ge.shading.material);





}