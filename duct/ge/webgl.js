function webgl(fin,ge) {

  ge.webgl = {};

  ge.webgl.texture = ge.define(function (proto) {
    
    proto.enable_linear_interpolation = function () {
      this.parameters[ge.GL_TEXTURE_MAG_FILTER] = ge.GL_LINEAR;
      this.parameters[ge.GL_TEXTURE_MIN_FILTER] = ge.GL_LINEAR;

    };

    proto.enable_nearest_interpolation = function () {
      this.parameters[ge.GL_TEXTURE_MAG_FILTER] = ge.GL_NEAREST;
      this.parameters[ge.GL_TEXTURE_MIN_FILTER] = ge.GL_NEAREST;

    };

    proto.enable_clamp_to_edge = function () {
      this.parameters[ge.GL_TEXTURE_WRAP_S] = ge.GL_CLAMP_TO_EDGE;
    this.parameters[ge.GL_TEXTURE_WRAP_T] = ge.GL_CLAMP_TO_EDGE;

    };

   


    function texture(target, format, format_type, source, generate_mipmap, width, height) {

      this.uuid = fin.guidi();
      this.gl_texture = null;

      this.needs_update = false;
      if (source === undefined) {
        this.source = new Uint8Array([255, 255, 255, 255]);
        this.needs_update = true;
      }
      else {
        this.source = source;
      }
      this.width = width || 1;
      this.height = height || 1;


      this.last_used_time = 0;
      this.format = format || ge.GL_RGBA;
      this.format_type = format_type || ge.GL_UNSIGNED_BYTE;
      this.target = target || ge.GL_TEXTURE_2D;
      this.parameters = {};

      this.generate_mipmap = generate_mipmap || false;

      this.parameters[ge.GL_TEXTURE_WRAP_S] = ge.GL_REPEAT;
      this.parameters[ge.GL_TEXTURE_WRAP_T] = ge.GL_REPEAT;


      if (this.generate_mipmap) {
        this.parameters[ge.GL_TEXTURE_MAG_FILTER] = ge.GL_LINEAR;
        this.parameters[ge.GL_TEXTURE_MIN_FILTER] = ge.GL_LINEAR_MIPMAP_LINEAR;
      }
      else {
        this.parameters[ge.GL_TEXTURE_MAG_FILTER] = ge.GL_NEAREST;
        this.parameters[ge.GL_TEXTURE_MIN_FILTER] = ge.GL_NEAREST;
      }
      if (this.source && this.source !== null) this.needs_update = true;


    }


    texture.load_images = new ge.bulk_image_loader(20);
    texture.load_images.auto_free = false;

    console.log(texture.load_images);  

    texture.load_images.onload = (function () {
      var canv = ge.create_canvas(1, 1);
      return function (img, tex) {


        if (tex.fit_size) {
          canv.set_size(tex.fit_size, tex.fit_size);
          canv.ctx.drawImage(img, 0, 0, tex.fit_size, tex.fit_size);
          tex.source = canv._get_image_data().data;
          tex.width = tex.fit_size;
          tex.height = tex.fit_size;
          texture.load_images.free(img);
        }
        else {
          tex.source = img;
          tex.width = img.width;
          tex.height = img.height;
        }

        tex.needs_update = true;

      }
    })();


    proto.free_source = function () {
      if (this.source === null) return;
      if (this.source.src) texture.load_images.free(this.source);
      this.source = null;
    }

    texture.update_from_url = function (tex, url) {
      texture.load_images.load(url, tex);
      return tex;
    }
    texture.from_url = function (url, generate_mipmap, fit_size) {
      var tex = new ge.webgl.texture(undefined, undefined, undefined, null, generate_mipmap);
      tex.fit_size = fit_size;
      texture.load_images.load(url, tex);
      return tex;
    }
   
    texture.from_size = function (width, height) {
      return new ge.webgl.texture(false, false, false, null, false, width, height);
    }

    texture.create_tiled_texture = (function () {
      var canv = ge.create_canvas(1, 1);
      canv.is_busy = false;
      var tile_maker = ge.create_canvas(1, 1);
      var x = 0, y = 0, tx = 0, ty = 0, input = null;
      var pool = [];
      tile_maker.ctx.imageSmoothingEnabled = false;

      canv.ctx.imageSmoothingEnabled = false;
      function create_tiled_texture(tile_urls, tile_size, width, height, texture) {
        texture = texture || new ge.webgl.texture(false, false, false, null, true, width, height);



        texture.tile_size = tile_size;
        if (canv.is_busy) {
          pool.push([tile_urls, tile_size, width, height, texture]);
          return texture;
        }
        canv.is_busy = true;
        canv.set_size(width, height);
        tile_maker.set_size(tile_size, tile_size);



        var tile_size2 = tile_size / 2;
        texture.tile_offset = tile_size / 4;
        texture.tile_offsetf = texture.tile_offset / width;
        texture.tile_sizef = tile_size / width;

        x = 0; y = 0;
        fin.each_index(function (index, next) {
          //console.log("loading ", tile_urls[index]);

          ge.load_working_image(tile_urls[index], function (img) {

            tile_maker.ctx.drawImage(img, 0, 0, tile_size2, tile_size2);
            tile_maker.ctx.drawImage(img, tile_size2, 0, tile_size2, tile_size2);

            tile_maker.ctx.drawImage(img, 0, tile_size2, tile_size2, tile_size2);

            tile_maker.ctx.drawImage(img, tile_size2, tile_size2, tile_size2, tile_size2);




            canv.ctx.drawImage(tile_maker, x, y, tile_size, tile_size);
            if (x + tile_size < width) {
              x += tile_size;
            }
            else {
              x = 0;
              y += tile_size;
            }
            //console.log("tile " + index);
            if (index < tile_urls.length - 1) {
              next(index + 1);
            }
            else {
              texture.source = canv._get_image_data().data;
              texture.needs_update = true;
              canv.is_busy = false;
              if (pool.length > 0) {
                create_tiled_texture.apply(ge.webgl.texture, pool.shift());
              }

              //canv.toBlob(function (b) {saveAs(b, "image.jpg");});
              //document.getElementById("test_tile").src = canv.toDataURL("");
            }
          }, tile_size, tile_size);
        }, 0);

        return texture;
      }

      texture.create_texture_atlas = function (def, texture) {
        texture = texture || new ge.webgl.texture(false, false, false, null, true, def.width, def.height);

        if (canv.is_busy) {
          pool.push([def, texture]);
          return texture;
        }
        canv.is_busy = true;
        canv.set_size(def.width, def.height);

        fin.each_index(function (index, next) {
          input = def.inputs[index];

          ge.load_working_image(input.src, function (img) {
            if (input.tiles_in_row) {
              input.tile_size = img.width / input.tiles_in_row;
              input.tile_width = input.tile_size;
              input.tile_height = input.tile_size;
            }
            tx = 0; ty = 0;
            if (input.rotation_sprites) {
              canv.ctx.strokeStyle = "green";
              var asize = 6.283185 / input.rotation_sprites;
              var an = 0;
              while (an <= 6.283185) {
                canv.ctx.save();
                canv.ctx.translate((input.dest_x + tx) + input.dest_size * 0.5, (input.dest_y + ty) + input.dest_size * 0.5);
                canv.ctx.rotate(an);
                //canv.ctx.drawImage(img, input.dest_x + tx, input.dest_y + ty, input.dest_size, input.dest_size);

                //canv.ctx.drawImage(img, -img.width / 2, -img.height / 2, input.dest_size, input.dest_size);

                canv.ctx.drawImage(img, -input.dest_size * 0.5, -input.dest_size * 0.5, input.dest_size, input.dest_size);



                canv.ctx.restore();
              //  canv.ctx.strokeRect(input.dest_x + tx, input.dest_y + ty, input.dest_size, input.dest_size);

                tx += input.dest_size;
                an += asize;
              }
            }
            else {
              for (y = 0; y < img.height; y += input.tile_height) {
                for (x = 0; x < img.width; x += input.tile_width) {
                  canv.ctx.drawImage(img, x, y,
                    input.tile_width,
                    input.tile_height,
                    input.dest_x + tx,
                    input.dest_y + ty,
                    input.dest_size,
                    input.dest_size);
                  tx += input.dest_size;
                  if (input.dest_per_row) {
                    if ((tx / input.dest_size) >= input.dest_per_row) {
                      tx = 0;
                      ty += input.dest_size;
                    }
                  }
                }
              }
            }
            

            if (index < def.inputs.length - 1) {
              next(index + 1);
            }
            else {
              texture.source = canv._get_image_data().data;
              texture.needs_update = true;
              canv.is_busy = false;
              if (document.getElementById("test_texture_atlas")) {
                document.getElementById("test_texture_atlas").src = canv.toDataURL("");
              }
            

              if (pool.length > 0) {
                create_tiled_texture.apply(ge.webgl.texture, pool.shift());
              }
            }
          });



        }, 0);

        return texture;

      }


      return create_tiled_texture;
    })();

    texture.pooler = fin.define(function (proto) {
      proto.get = function (url) {
        return this.pool.get(url);
      };
      proto.free = function (tex) {
        tex.valid_id = -100;
        tex.free_source();
        this.pool.free(tex);
      };

      proto.valid_texture = function (tex, valid_id) {

        if (tex && valid_id) {
          return tex.valid_id === valid_id;
        }
        return false;
        
      };

      var i = 0, tex;
      proto.tick = function (timer) {
        if (timer - this.last_gc_time > this.gc_check_time) {
          this.last_gc_time = timer;
          
          for (i = 0; i < this.textures.length; i++) {
            tex = this.textures[i];
            if (tex.valid_id>0) {
              if (timer - tex.last_used_time > this.gc_time) {
                this.free(tex);

              }
            }
          }


        }
      };
      proto.create_texture = function (url) {
        return ge.webgl.texture.from_url(url, true);
      };

      proto.update_texture = function (tex,url) {
        return ge.webgl.texture.update_from_url(tex, url);
      };

      function texture_pooler(def) {
        def = def || {};
        this.last_gc_time = 0;
        this.gc_check_time = def.gc_check_time || 5;
        this.gc_time = def.gc_time || 3;

        var _this = this;
        this.textures = [];
        
        this.pool = new fin.object_pooler(
          function (url) {
            var tex = _this.create_texture(url);           
            tex.valid_id = fin.guidi();
            _this.textures[_this.textures.length] = tex;
            return tex
          },

          function (tex, url) {
            tex.valid_id = fin.guidi();
            return _this.update_texture(tex, url);
          }, def.pool_size);
      }
      return texture_pooler
    });


    return texture;

  });
  ge.webgl.texture.dummy = new ge.webgl.texture();


  ge.webgl.canvas_texture = ge.define(function (proto, _super) {   

    proto.update = function () {
      this.source = this.canvas;
      this.needs_update = true;
    };

    //target, format, format_type, source, generate_mipmap, width, height
    return function canvas_texture(width, height, target, format, format_type) {
      _super.apply(this, [target, format, format_type, null, false, width, height]);
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');

      this.parameters[ge.GL_TEXTURE_WRAP_S] = ge.GL_CLAMP_TO_EDGE;
      this.parameters[ge.GL_TEXTURE_WRAP_T] = ge.GL_CLAMP_TO_EDGE;


      this.source = this.canvas;
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      this.ctx.transform(1, 0, 0, -1, 0, this.canvas.height);

      this.needs_update = true;
    }


  }, ge.webgl.texture);

  ge.webgl.render_target = ge.define(function (proto) {

    function render_target(renderer, width, height) {
      this.uuid = fin.guidi();
      this.renderer = renderer;
      this.frame_buffer = renderer.gl.createFramebuffer();


      this.vp_left = 0;
      this.vp_top = 0;
      this.width = width;
      this.height = height;
      this.vp_bottom = height;
      this.vp_right = width;
      this.clear_buffer = true;
      this.owned_depth_buffer = false;
      this.set_default_viewport();
      this.ratio = 1;
      return this;
    }

    proto.resize = function (width, height) {

      this.width = width;
      this.height = height;
      if (this.color_texture) {
        this.color_texture.width = width;
        this.color_texture.height = height;
        this.renderer.update_texture(this.color_texture);
      }
      if (this.depth_texture) {
        this.depth_texture.width = width;
        this.depth_texture.height = height;
        this.renderer.update_texture(this.depth_texture);
      }
      if (this.owned_depth_buffer) {
        if (this.depth_buffer) {
          this.renderer.gl.bindRenderbuffer(ge.GL_RENDERBUFFER, this.depth_buffer);
          this.renderer.gl.renderbufferStorage(ge.GL_RENDERBUFFER, ge.GL_DEPTH_COMPONENT16, width, height);

        }
      }
      
      this.vp_bottom = height;
      this.vp_right = width;
    }

    proto.set_viewport_per = function (left, top, right, bottom) {
      this.vp_left = this.width * left;
      this.vp_top = this.height * top;
      this.vp_right = this.width * right;
      this.vp_bottom = this.height * bottom;
      return (this)
    };
    proto.set_viewport = function (left, top, right, bottom) {
      this.vp_left = left;
      this.vp_top = top;
      this.vp_right = right;
      this.vp_bottom = bottom;
    };


    proto.set_default_viewport = function () {
      this.set_viewport_per(0, 0, 1, 1);
      return (this)
    };
    proto.bind = function (force) {

     if (this.renderer.render_target_id === this.uuid && !force) return (false);

      this.renderer.gl.bindFramebuffer(ge.GL_FRAMEBUFFER, this.frame_buffer);
      this.apply_viewport();
      this.renderer.render_target_id = this.uuid;
      if (this.clear_buffer) this.renderer.gl.clear(ge.GL_COLOR_BUFFER_BIT | ge.GL_DEPTH_BUFFER_BIT);
      return (true)
    };

    proto.apply_viewport = function () {
      this.renderer.gl.viewport(this.vp_left, this.vp_top, this.vp_right - this.vp_left, this.vp_bottom - this.vp_top);
      return (this)
    };
    proto.bind_only = function () {
    
      if (this.renderer.render_target_id === this.uuid) return (this);
      this.renderer.render_target_id = this.uuid;
      this.renderer.gl_bindFramebuffer(ge.GL_FRAMEBUFFER, this.frame_buffer)
      this.renderer.gl.viewport(this.vp_left, this.vp_top, this.vp_right - this.vp_left, this.vp_bottom - this.vp_top);
      return (this)
    };


    proto.unbind = function () {
      this.renderer.render_target_id = -1;
      this.renderer.gl_bindFramebuffer(ge.GL_FRAMEBUFFER, null);
    };

    proto.attach_color = function () {
    //target, format, format_type, source, generate_mipmap, width, height
      this.color_texture = new ge.webgl.texture(undefined, undefined, undefined, null, false, this.width, this.height);
      
      this.bind_texture(this.color_texture, ge.GL_COLOR_ATTACHMENT0);
      this.color_texture.parameters[ge.GL_TEXTURE_WRAP_S] = ge.GL_CLAMP_TO_EDGE;
      this.color_texture.parameters[ge.GL_TEXTURE_WRAP_T] = ge.GL_CLAMP_TO_EDGE;
      this.renderer.update_texture(this.color_texture);
      return (this);

    };

    proto.attach_depth = function () {
      this.depth_texture = this.bind_texture(new ge.webgl.texture(undefined, ge.GL_DEPTH_COMPONENT, ge.GL_UNSIGNED_SHORT, null, false, this.width, this.height), ge.GL_DEPTH_ATTACHMENT);
      this.depth_texture.parameters[ge.GL_TEXTURE_WRAP_S] = ge.GL_CLAMP_TO_EDGE;
      this.depth_texture.parameters[ge.GL_TEXTURE_WRAP_T] = ge.GL_CLAMP_TO_EDGE;
      return (this)
    };
  
    proto.check_status = function () {

      this.valid = false;
      var status = this.renderer.gl.checkFramebufferStatus(ge.GL_FRAMEBUFFER);
      switch (status) {
        case ge.GL_FRAMEBUFFER_COMPLETE:
          this.valid = true;
          break;
        case ge.GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
          throw ("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
          break;
        case ge.GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
          throw ("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
          break;
        case ge.GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
          throw ("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
          break;
        case ge.GL_FRAMEBUFFER_UNSUPPORTED:
          throw ("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
          break;
        default:
          throw ("Incomplete framebuffer: " + status);
      }

    };
    proto.attach_depth_buffer = function (depth_buffer) {


      if (depth_buffer) {
        this.depth_buffer = depth_buffer;
        this.owned_depth_buffer = false;
      }
      else {
        this.owned_depth_buffer = true;
        this.depth_buffer = this.renderer.gl.createRenderbuffer();
        this.renderer.gl.bindRenderbuffer(ge.GL_RENDERBUFFER, this.depth_buffer);
        this.renderer.gl.renderbufferStorage(ge.GL_RENDERBUFFER, ge.GL_DEPTH_COMPONENT16, this.width, this.height);
      }
      
      this.renderer.gl.bindFramebuffer(ge.GL_FRAMEBUFFER, this.frame_buffer);
      this.renderer.gl.framebufferRenderbuffer(ge.GL_FRAMEBUFFER, ge.GL_DEPTH_ATTACHMENT, ge.GL_RENDERBUFFER, this.depth_buffer);
      this.check_status();

      this.renderer.gl.bindFramebuffer(ge.GL_FRAMEBUFFER, null);
      this.renderer.gl.bindRenderbuffer(ge.GL_RENDERBUFFER, null);
      return (this)
    };

    proto.bind_texture = function (texture, attachment) {

      this.renderer.gl.bindFramebuffer(ge.GL_FRAMEBUFFER, this.frame_buffer);

      if (texture.gl_texture === null) {       
        this.renderer.update_texture(texture);

      }
      this.renderer.gl.bindTexture(texture.target, texture.gl_texture);

      if (texture.generate_mipmap) {
        this.renderer.gl.generateMipmap(texture.target);
      }

      this.renderer.gl.framebufferTexture2D(ge.GL_FRAMEBUFFER, attachment, texture.target, texture.gl_texture, 0);


      this.check_status();
      /*
          var status = this.gl.checkFramebufferStatus(ge.GL_FRAMEBUFFER);
          if (status !== ge.GL_FRAMEBUFFER_COMPLETE) {
            console.error("frame buffer status:" + status.toString());
          }
          */
      this.renderer.gl.bindTexture(texture.target, null);
      this.renderer.gl.bindFramebuffer(ge.GL_FRAMEBUFFER, null);

      return (texture);
    };


    return render_target;


  });

  ge.webgl.shader = ge.define(function (proto) {

    function shader(vs, fs) {
      this.vs = vs;
      this.fs = fs;
      this.compiled = false;
      this.uuid = fin.guidi();
      this.params = {};
      this.parent = null;
      this.parts = null;
      return (this);
    }


    proto.collect_parts = function (vertex, fragment) {
      if (this.parent !== null) this.parent.collect_parts(vertex, fragment);
      if (this.parts.vertex) vertex.push(this.parts.vertex);
      if (this.parts.fragment) fragment.push(this.parts.fragment);
    };


    proto.extend = function (source, options) {
      return ge.webgl.shader.parse_shader(source, this, options);
    };

    proto.set_uniform = (function () {      
      return function (id, value) {
        var uni = this.uniforms[id];        
        if (uni) {
          uni.params[uni.params_length] = value;
          uni.func.apply(this.gl, uni.params);
          return true;
        }
        return false;
      }
    })();

    proto.enter = function (renderer) { };
    proto.exit = function (renderer) { };


    fin.macro(function webgl_shader_set_uniform(name$, value$) {
      uni = shader.uniforms[name$];
      if (uni) {
        uni.params[uni.params_length] = value$;
        uni.func.apply(shader.gl, uni.params);
      }
    }, ge);


    fin.macro(function webgl_shader_set_uniform_unsafe(name$, value$) {
      uni = shader.uniforms[name$]; uni.params[uni.params_length] = value$; uni.func.apply(shader.gl, uni.params);

    }, ge);
    

    shader.chunks = {};
    shader.load_chunks = function (text) {
      var chunks = text.split('/*chunk-');
      chunks.forEach(function (chunk) {
        chunk = chunk.trim();
        if (chunk.length > 0) {
          var name = chunk.substr(0, chunk.indexOf('*/') + 2);
          chunk = chunk.replace(name, '');
          name = name.replace('*/', '');
          shader.chunks[name] = chunk;
        }

      });
    };

    shader.create_chunks_lib = function (text) {
      var lib = {}, name;
      text.split('/*chunk-').forEach(function (chunk) {
        chunk = chunk.trim();
        if (chunk.length > 0) {
          name = chunk.substr(0, chunk.indexOf('*/') + 2);
          chunk = chunk.replace(name, '');
          name = name.replace('*/', '');
          if (name.indexOf('global-') === 0) {
            shader.chunks[name] = chunk;
          }
          lib[name] = chunk;
        }
      });
      return lib;
    }
    
    shader.load_chunks(`import('shaders/default_chunks.glsl')`);

    shader.context_param;
    shader.$str = function (s, nested_chunks) {
      return ge.str(s, "chunk", "param")(nested_chunks ? ge.webgl.shader.nested_get_chunk : ge.webgl.shader.get_chunk,
        ge.webgl.shader.get_param);
    }
    shader.nested_get_chunk = function (key) {
      return ge.webgl.shader.$str(ge.webgl.shader.chunks[key], true);
    }
    shader.get_chunk = function (key) {
      return ge.webgl.shader.chunks[key];
    }

    shader.get_param = function (p) {
      if (ge.webgl.shader.context_param && ge.webgl.shader.context_param[p] !== undefined) return ge.webgl.shader.context_param[p];
      return "";
    }

    shader.compile = (function () {


      function create_shader(gl, src, type) {
        var shdr = gl.createShader(type);
        gl.shaderSource(shdr, src);
        var source = gl.getShaderSource(shdr);

        gl.compileShader(shdr);
        if (!gl.getShaderParameter(shdr, ge.GL_COMPILE_STATUS)) {
          console.log('source', source);
          console.error("Error compiling shader : ", gl.getShaderInfoLog(shdr));
          console.log(src);
          gl.deleteShader(shdr);
          return null;
        }
        return shdr;
      }

      function create_program(gl, vshdr, fshdr, doValidate) {


        var prog = gl.createProgram();
        gl.attachShader(prog, vshdr);
        gl.attachShader(prog, fshdr);

        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, ge.GL_LINK_STATUS)) {
          console.error("Error creating shader program.", gl.getProgramInfoLog(prog));
          gl.deleteProgram(prog); return null;
        }
        if (doValidate) {
          gl.validateProgram(prog);
          if (!gl.getProgramParameter(prog, ge.GL_VALIDATE_STATUS)) {
            console.error("Error validating program", gl.getProgramInfoLog(prog));
            gl.deleteProgram(prog); return null;
          }
        }
        gl.detachShader(prog, vshdr);
        gl.detachShader(prog, fshdr);
        gl.deleteShader(fshdr);
        gl.deleteShader(vshdr);

        return prog;
      }


      var collect_uniforms_and_attributes = (function () {

        var uniforms_write_func = {
          5126: ['uniform1f', 2],//'float',
          35664: ['uniform2fv', 2],// 'vec2',                
          35665: ['uniform3fv', 2], //'vec3',
          35666: ['uniform4fv', 2], //'vec4',
          35678: ['uniform1i', 2], //'sampler2D',
          35680: ['uniform1i', 2], //'samplerCube',
          35675: ['uniformMatrix3fv', 3], //'mat3',
          35676: ['uniformMatrix4fv', 3],//'mat4'
          'float': 5126,
          'vec2': 35664,
          'vec3': 35665,
          'vec4': 35666,
        }


        function add_uniform_to_shader(gl, shdr, name, type) {


          var location = gl.getUniformLocation(shdr.program, name);

          var func = uniforms_write_func[type];
          var uni = {};
          if (func[1] === 3)
            uni.params = [location, false, 0];
          else if (func[1] === 2) {
            uni.params = [location, 0];
          }
          uni.func = gl[func[0]];
          uni.params_length = uni.params.length - 1;
          shdr.uniforms[name] = uni;
        }

        return function (gl, shdr) {
          var i = 0, a = 0, info;
          shdr.uniforms = {};
          for (i = 0; i < gl.getProgramParameter(shdr.program, ge.GL_ACTIVE_UNIFORMS); i++) {
            info = gl.getActiveUniform(shdr.program, i);
            if (info.size > 1) {
              for (a = 0; a < info.size; a++) {
                add_uniform_to_shader(gl, shdr, info.name.replace('[0]', '[' + a + ']'), info.type);
              }
            }
            else if (info.size === 1) {
              add_uniform_to_shader(gl, shdr, info.name, info.type);
            }
          }

          shdr.attributes = {};
          shdr.all_attributes = [];


          for (i = 0; i < gl.getProgramParameter(shdr.program, ge.GL_ACTIVE_ATTRIBUTES); i++) {
            info = gl.getActiveAttrib(shdr.program, i);


            shdr.attributes[info.name] = { name: info.name, location: gl.getAttribLocation(shdr.program, info.name) };

            shdr.all_attributes.push(shdr.attributes[info.name]);
          }


        }

      })();

      return function (gl, shdr, _params) {

        if (shdr.compiled) return;
        ge.webgl.shader.context_param = {};
        Object.assign(ge.webgl.shader.context_param, _params);
        Object.assign(ge.webgl.shader.context_param, shdr.params);
        shdr.vs = ge.webgl.shader.$str(shdr.vs, true);
        shdr.fs = ge.webgl.shader.$str(shdr.fs, true);
        shdr.gl = gl;
        var vshdr, fshdr;
        vshdr = create_shader(gl, shdr.vs, ge.GL_VERTEX_SHADER);
        if (!vshdr) return false;
        fshdr = create_shader(gl, shdr.fs, ge.GL_FRAGMENT_SHADER);
        if (!fshdr) { gl.deleteShader(vshdr); return false; }
        shdr.program = create_program(gl, vshdr, fshdr, true);

        gl.useProgram(shdr.program);
        collect_uniforms_and_attributes(gl, shdr);

        gl.useProgram(null);
        shdr.compiled = true;
        return (true);

      }
    })();

    shader.parse_flat = function (_source, params) {
      var source = _source.split('/*--fragment--*/');
      var shader = new ge.webgl.shader(source[0].toString().trim(), source[1].toString().trim());
      shader.source = _source;
      shader.params = params || {};
      return shader;
    };


    shader.parse_shader = (function () {
      var functions = ['vertex', 'fragment']
      function parse_shader_source(source) {
        source = source.replace(/\\n/g, '\n');
        var list = [];
        functions.forEach(function (f) {
          list.push({ f: f, i: source.indexOf(f) });
        });
        list.sort(function (a, b) { return a.i - b.i });

        var chars = source.split('');

        function trace_brackets(i) {
          var bc = 1;
          while (bc !== 0 && i < chars.length) {
            if (chars[i] === '{') bc++;
            else if (chars[i] === '}') bc--;
            i++;
          }
          return i;
        }
        function parse_block(m, i1) {
          return source.substr(i1, trace_brackets(source.indexOf(m) + m.length) - i1);
        }

        var i = 0;
        var params = {};
        list.forEach(function (f) {

          var regx = new RegExp('void ' + f.f + '[\\s\\S]*?{', 'ig');

          var m = source.match(regx);
          if (m !== null && m.length > 0) {
            params[f.f] = parse_block(m[0], i);
            i += params[f.f].length;
          }



        });
        return (params);
      }

      function _mm(match, func) {
        if (match !== null) match.forEach(func);
      }

      function get_func(source) {
        var func = {};
        var k = "", dbj = null;
        _mm(source.match(/(\w+ +\w+ *\([^\)]*\) *\{)|(\w+ +\w+ +\w+ *\([^\)]*\) *\{)/g), function (dec) {
          k = dec.replace(/\s+/g, ' ').substr(0, dec.indexOf('(')).trim();
          dbj = { a: k.split(' '), d: dec };
          dbj.f = dbj.a[dbj.a.length - 1];
          func[k] = dbj;
        });
        return func;

      }


      return function (source, parent, options) {
        options = options || {};
        var shader = new ge.webgl.shader(), p = null, part_s = "", part_p = "", rg = null,
          func_s, func_p, f = null, sf = "", sfc = "", dbs, dbp;

        shader.parts = parse_shader_source(source);
        shader.level = 0;
        for (p in shader.parts) {
          shader.parts[p] = shader.parts[p].replace(/\r?\n\s+\{|\r\s+\{/g, '\{').replace(/\s+\(/g, '(');
        }

        if (parent) {
          shader.level = parent.level + 1;
          for (p in shader.parts) {
            if (options[p] === false) {
              continue;
            }
            part_s = shader.parts[p];
            part_p = parent.parts[p];
            if (part_p) {
              func_s = get_func(part_s);
              func_p = get_func(part_p);

              for (f in func_s) {
                if (func_p[f]) {
                  dbs = func_s[f];
                  dbp = func_p[f];
                  sf = 'super_' + dbs.f;
                  if (shader.level > 1) {
                    sfc = f.replace(dbs.f, sf);

                    part_p = part_p.replace(sfc + '(', sfc + shader.level + '(');
                    part_p = part_p.replace(sf + '(', sf + shader.level + '(');

                    sf = dbp.d.replace(dbp.f, 'super_' + dbp.f);
                    part_p = part_p.replace(dbp.d, sf);


                  }
                  else {
                    sf = dbp.d.replace(dbp.f, 'super_' + dbp.f);
                    part_p = part_p.replace(dbp.d, sf);
                  }

                }
              }

              shader.parts[p] = part_p + part_s;



            }
          }

          shader.parts['vertex'] = shader.parts['vertex'] || parent.parts['vertex'];
          shader.parts['fragment'] = shader.parts['fragment'] || parent.parts['fragment'];
        }



        shader.vs = shader.parts['vertex'] + 'void main(){vertex();}';
        shader.fs = shader.parts['fragment'] + 'void main(){fragment();}';

        shader.parent = parent || null;
        return shader;

      }
    })();


    shader.parse = function (source) {
      return this.parse_shader(source, undefined, true, true);
    };


    return shader;

  });
}