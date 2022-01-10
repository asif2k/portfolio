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






  ge.effects.glow_material = ge.define(function (proto, _super) {


    ge.effects.post_process.glow = ge.define(function (proto, _super) {


      function glow(params) {
        params = params || {};
        _super.apply(this);
        this.shader = ge.effects.post_process.glow.shader; 
        

        fin.merge_object(params, this);
      }



      glow.shader = ge.effects.post_process.shader.extend(glsl["pp-glow"]);

      var u_glow_params_rw = math.vec3(1,1,3.0);
      proto.on_apply = function (renderer, input, output) {
        renderer.use_direct_texture(ge_effects_glow_material.rd.color_texture, 1);
        this.shader.set_uniform("u_glow_emission_rw", 1);
        this.shader.set_uniform("u_glow_params_rw", u_glow_params_rw);
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
    proto.complete_render_mesh1 = function (renderer, shader, mesh) {
      if (!ge_effects_glow_material.shader.ping_pong) {
        renderer.use_direct_texture(renderer.render_target3.color_texture, 1);
        
      }
      else {
        renderer.use_direct_texture(renderer.default_texture, 1);
      }

      this.shader.set_uniform("u_ref_texture_rw", 1);
      this.complete_render_mesh_orig(renderer, shader, mesh);
    }

    ge_effects_glow_material.shader = ge.shading.material.shader.extend(glsl["glow-material"]);
    ge_effects_glow_material.shader.ping_pong = false;


    ge_effects_glow_material.shader.enter = function (renderer) {
      if (!ge_effects_glow_material.rd) {
        ge_effects_glow_material.rd = new ge.webgl.render_target(renderer, 256, 256);
        ge_effects_glow_material.rd.attach_color();
      }
      

      if (renderer.render_target3.bind()) {
        renderer.gl.clear(ge.GL_COLOR_BUFFER_BIT);
      }
      this.already_exit = false;
      
    };
    ge_effects_glow_material.shader.exit = function (renderer) {
      if (this.already_exit) return;
      this.already_exit = true;
      ge_effects_glow_material.rd.bind();

      renderer.gl_disable(ge.GL_DEPTH_TEST);    
      renderer.use_direct_texture(renderer.render_target3.color_texture, 0);
      renderer.use_shader(ge.effects.post_process.shader);
      renderer.draw_full_quad();            
      renderer.gl_enable(ge.GL_DEPTH_TEST);

      renderer.use_direct_texture(renderer.default_texture, 0);
      renderer.set_default_viewport();


      renderer.draw_textured_quad(ge_effects_glow_material.rd.color_texture, 0.35, 0.5, 0.35, 0.35);
    };

    return ge_effects_glow_material;
  }, ge.shading.material);





}