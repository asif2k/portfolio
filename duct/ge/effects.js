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




  ge.effects.post_process.picture_adjustment = ge.define(function (proto, _super) {


    function picture_adjustment(params) {
      params = params || {};
      _super.apply(this);
      this.shader = ge.effects.post_process.picture_adjustment.shader;
      
      this.gamma = 1;
      this.contrast = 1;
      this.saturation = 1;
      this.brightness = 1;
      this.red = 1;
      this.green = 1;
      this.blue = 1;
      this.alpha = 1;
      fin.merge_object(params, this);

    }



    picture_adjustment.shader = ge.effects.post_process.shader.extend(glsl["pp-picture-adjustment"]);


    var u_pa_params = math.mat3();
    proto.on_apply = function (renderer, input, output) {
      u_pa_params[0] = this.gamma;
      u_pa_params[1] = this.contrast;
      u_pa_params[2] = this.saturation;
      u_pa_params[3] = this.brightness;
      u_pa_params[4] = this.red;
      u_pa_params[5] = this.green;
      u_pa_params[6] = this.blue;
      u_pa_params[7] = this.alpha;


      this.shader.set_uniform("u_pa_params", u_pa_params);
      return input;
    };

    return picture_adjustment;


  }, ge.effects.post_process);



  ge.effects.post_process.blank = ge.define(function (proto, _super) {


    function blank(params) {
      params = params || {};
      _super.apply(this);      
      Object.assign(this, params);

      if (params.on_init) params.on_init.apply(this);
    }

    proto.on_apply = function (renderer, input, output) {
    
      return input;
    };

    return blank;


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
      for (var i1 = 1; i < this.blur_quality; i++) {
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
      /*
      
  

 
  

this.bind_output(renderer, output);
      renderer.use_direct_texture(input, 0);
      renderer.use_shader(ge.effects.post_process.shader);
      renderer.draw_full_quad();
      */

     
      this.bind_output(renderer, output);
      renderer.use_direct_texture(input, 0);
      renderer.use_shader(ge.effects.post_process.bloom.shader);
      renderer.active_shader.set_uniform("u_glow_emission_rw", 5);

      u_glow_params_rw[0] = this.blend_exposure;
      u_glow_params_rw[1] = this.blend_gamma;
      u_glow_params_rw[2] = this.blend_factor;

      renderer.active_shader.set_uniform("u_glow_params_rw", u_glow_params_rw);
      renderer.use_direct_texture(this.targets[t].color_texture, 5);
      renderer.draw_full_quad();


      

    

     // renderer.draw_textured_quad(this.targets[t].color_texture, 0.35, 0.5, 0.35, 0.35);
      

    }

    bloom.shader = ge.effects.post_process.shader.extend(glsl["pp-bloom"]);
    bloom.blur_shader = ge.effects.post_process.shader.extend(glsl["pp-bloom-blur"]);
    bloom.emission = ge.effects.post_process.shader.extend(glsl["pp-bloom-emission"]);


    return bloom;


  }, ge.effects.post_process);







}