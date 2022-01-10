function particles_system(fin, ge, ecs, math) {



  ecs.register_system('particles_system', fin.define(function (proto, _super) {

   


    proto.step = function () {



      for (var ei in this.emitters) {
        this.emitters[ei].update(this.app.timer, this.app.current_time_delta);
      }

    }
    



    proto.validate = function (app) {
      this.priority = app.use_system('ge_transform_system').priority - 50;
    };

    proto.add_emitter = function (name, em) {
      if (!em.is_emitter) {
        em = new particles_system.emitter(em);
      }
      this.emitters[name] = em;
      return em;
    }

    function particles_system(def) {
      _super.apply(this, arguments);
      this.emitters = {};
      this.base_emitter = particles_system.emitter;
      this.clock = 0;


    }

    particles_system.emitter = fin.define(function (proto) {




      proto.create_instance = function (params) {
        var ins = this.use_instance( this.instances.get());
        if (params) Object.assign(ins, params);
        this.active_instances.enqueue(ins);
        return ins;
      };




      proto.update_particle = function ( par,ins) {

      };

      proto.use_particle = function (par,ins) {
        par[0] = 1;
        par[1] = 0.1;
        return par;
      }
      

     
      proto.update = (function () {
        var particles = [], pi = 0, ii = 0,rate;
        var ins, par, ins_count;


        return function (clock, time_delta) {
         


          this.pi = 0;
          ins_count = this.active_instances.size();

          if (ins_count < this.active_instances._oldestIndex) {
            this.active_instances.realign();
          }



          while (ins_count > 0) {
            ins = this.active_instances.dequeue();
            pi = ins.pi;
            rate=ins.rate
            if (ins.life > 0) {
              if (clock - ins.last_clock > ins.emit_delay) {
                if (rate > 1) {
                  while (rate > 0 && pi < ins.max_particles) {
                    par = this.use_particle(this.particles.get(), ins);
                    par[0] = clock;
                    ins.active_particles[pi++] = par;
                    rate--;
                  }
                }
                else {
                  if (pi < ins.max_particles) {
                    par = this.use_particle(this.particles.get(), ins);
                    par[0] = clock;
                    ins.active_particles[pi++] = par;
                  }
                }
                
                ins.last_clock = clock;
              }
              ins.life -= ins.life_decay * time_delta;
              this.active_instances.enqueue(ins);
            }
            else {
              this.instances.free(ins);
            }

            ii = 0;
            while (pi > 0) {
              par = ins.active_particles[--pi];
             // par[0] -= par[1] * time_delta;
              if (par[1]<0 || clock- par[0] < par[1]) {               
                particles[ii++] = par;
                this.active_particles[this.pi++] = par;
                this.update_particle(par, ins, time_delta);
              }
              else {
                this.particles.free(par);
              }
            }

            pi = 0;
            while (ii > 0) {
              ins.active_particles[pi++] = particles[--ii];
            }
            ins.pi = pi;
            ins_count--;
          }




        }


      })();
      proto.create_particle = function () {
        return new Float32Array(this.particle_size);
      };
      proto.use_instance = function (ins) {

        return ins;
      }
      return function particles_system_emitter(params) {
        var self = this;
        this.is_emitter = true;
        this.instances = new fin.object_pooler(function () {
          return {
            max_particles: 10,
            last_clock: 0,
            emit_delay: 0.2,
            life: 1,
            life_decay: 0,
            active_particles: [],
            pi: 0,
            rate:1
          };
        });




        this.active_instances = new fin.queue();



        this.active_particles = [];
        this.pi = 0;
        this.particle_size =  2;
        this.particles = new fin.object_pooler(function () {

          return self.create_particle();

        });

        if (params) {
          Object.assign(this, params);
        }

        this.particles.refs = {};

      }
    });



    return particles_system;



  }, ecs.system));


  ecs.register_system('worker_particles_system', fin.define(function (proto, _super) {




    proto.step = function () {

      for (var e in this.emitters) {
        this.emitters[e].update(this.app.timer, this.app.current_time_delta);
      }




    }
    var modules = {
      'init': function (worker) {
        worker.is_function = function (obj) {
          return !!(obj && obj.constructor && obj.call && obj.apply);
        };
        worker.define = function (_creator, _super) {

          _super = _super || Object;
          var proto = {};
          Object.assign(proto, _super.prototype);
          var _class = _creator(proto, _super);
          _class.super_class = _super;

          _class.prototype = Object.create(_super.prototype);
          Object.assign(_class.prototype, proto);
          return (_class);
        };

        worker.rg = function (match, func) {
          if (match !== null) match.forEach(func);
        };

        worker.parse_args_from_func = function (text) {
          var args;
          worker.rg(text.match(/function.*\(.*\)/), function (s) {
            args = s.replace(/function.*\(/, '').replace(')', '').split(",");
            args.forEach(function (a, i) {
              args[i] = a.trim();
            })
          });

          return args || [];
        }

        worker.prep_worker = function () {
          var findex = [],src;
          for (var k in worker) {
            if (this.is_function(worker[k])) {
              src = worker[k].toString();
              if (src.indexOf("[native code]") < 0) {

                console.log(k, worker.parse_args_from_func(src));
                findex.push(src);

              }

            }
          }

          worker.postMessage(["prep_worker", [findex]]);
        }
        worker.onmessage = function (m) {
          this[m.data[0]].apply(this, m.data[1]);


        };
      },

      'queue': function (worker) {
        worker.queue = worker.define(function (proto) {

          proto.size = function () {
            return this._newestIndex - this._oldestIndex;
          };
          proto.enqueue = function (data) {
            this._storage[this._newestIndex] = data;
            this._newestIndex++;
          };

          proto.realign = function () {
            let count = this.size();
            let i = 0;
            for (i = 0; i < count; i++) {
              this._storage[i + 1] = this._storage[this._oldestIndex + i];
            }
            for (i = this._oldestIndex; i < this._newestIndex; i++) {
              this._storage[i] = undefined;
            }

            this._oldestIndex = 1;
            this._newestIndex = this._oldestIndex + count;
          }


          proto.dequeue = function () {
            if (this._oldestIndex !== this._newestIndex) {
              var deletedData = this._storage[this._oldestIndex];
              this._storage[this._oldestIndex] = undefined;
              this._oldestIndex++;
              return deletedData;
            }
          };

          proto.peek = function () {
            return this._storage[this._oldestIndex];
          }

          return function queue() {
            this._oldestIndex = 1;
            this._newestIndex = 1;
            this._storage = {};
          }

        });
      },
      'object_pooler': function (worker) {
        worker.object_pooler = worker.define(function (proto) {

          proto.get = function (params) {
            if (this.freed > 0) {
              if (this.reuse)
                return this.reuse(this.free_objects[--this.freed], params);
              else
                return this.free_objects[--this.freed];
            }
            else {
              if (this.allocated >= this.pool_size) return null
              this.allocated++;
              return this.creator(params);
            }

          };
          proto.free = function (obj) {
            this.free_objects[this.freed++] = obj;
          };
          return function object_pooler(creator, reuse, pool_size) {
            this.creator = creator;
            this.reuse = reuse;
            this.allocated = 0;
            this.freed = 0;
            this.pool_size = pool_size || Infinity;
            this.free_objects = [];
          };
        });

      },

      'ping_pong_array': function (worker) {
        worker.ping_pong_array = worker.define(function (proto) {
          var temp;
          proto.swap = function () {
            temp = this[this.ping_name];
            this[this.ping_name] = this[this.pong_name];
            this[this.pong_name] = temp;
            temp = undefined;
          };
          return function ping_pong_array(ping_name, pong_name) {
            this.ping_name = ping_name;
            this.pong_name = pong_name;
            this[ping_name] = [];
            this[pong_name] = [];

          };
        });

      }
    };

    modules['init_emitter'] = function (em) {
      em.def = {
        particle_size: 4
      };
      //[em_def]

      var ins, par, time=0, last_time=0, time_delta=0, ii = 0, par_size = 0, _pi = 0;
      var iid = 1;

      em.particles_pool = new em.object_pooler(function (size) {
        return new Float32Array(size);
      });


      
      em.instances_pool = new em.object_pooler(function () {
        ins = {
          last_emit_time: 0,
          emit_delay: 0.2,
          life: 0,
          life_start: 0,
          id: iid++
        };
        em.instances_pool.ref[ins.id] = ins;
        return ins;
      });


      em.instances_pool.ref = {};

      em.active_particles = new em.ping_pong_array("queue", "updates");

      em.active_instances = new em.ping_pong_array("queue", "updates");



      var ci = 0, nci = 0, dt, ccount = 0, cmd = 0;



      em.run_command = function (cmd, dt, ci) { }
      em.trigger_emitter = function (ins) { }
      em.use_instance = function (ins,dt,ci) { return ins;}
      em.use_particle = function (par, ins) { return par; }

      em.queue_particle = function (delay, ins_id, life) {
        par = this.particles_pool.get(this.def.particle_size);
        par[0] = ins_id;
        par[1] = time+delay;
        par[2] = life;
        this.active_particles.queue[this.pi++] = par;
        return par;
      };

      em.pi = 0;
      em.ii = 0;
      em.time = 0;
      em.time_delta = 0;
      em.onmessage = function (m) {
        ci = 0;
        this.data = new Float32Array(m.data[0]);

        dt = this.data;

        ccount = dt[ci++];
       
        while (ci < ccount) {
          nci = dt[ci++];
          cmd = dt[ci++];
          if (cmd === 100) {
            time = dt[ci];
            this.time = time;
            time_delta = time - last_time;
            this.time_delta = time_delta;
            last_time = time;
          }
          else if (cmd === 200) {

            ins = this.instances_pool.get();
            ins.type = dt[ci];
            ins.life = dt[ci + 1];
            ins.emit_delay = dt[ci + 2];
            ins.life_start = time;
            ins.last_emit_time = time - ins.emit_delay * 2;
            this.use_instance(ins, dt, ci + 3);
            this.active_instances.queue[this.ii++] = ins;

          }
          else {
            this.run_command(cmd, dt, ci);

          }

          ci += nci;
        }


        ii = 0;
        while (this.ii > 0) {
          ins = this.active_instances.queue[--this.ii];
          this.active_instances.queue[this.ii] = undefined;
          if (ins.life < 0 || time - ins.life_start < ins.life) {
            if (time - ins.last_emit_time > ins.emit_delay) {
              ins.last_emit_time = time;
              this.trigger_emitter(ins);
            }
            this.active_instances.updates[ii++] = ins;
          }
          else {
            this.instances_pool.free(ins);
          }
        }

        this.ii = ii;
        this.active_instances.swap();

        _pi = 0;

        var ap = this.active_particles;

        while (this.pi > 0) {
          par = ap.queue[--this.pi];
          ap.queue[this.pi] = undefined;
          if (time - par[1] > 0) {
            if (par[2] < 0 || time - par[1] < par[2]) {
              ins = this.instances_pool.ref[par[0]];
              this.update_particle(par, ins, time_delta);
              ap.updates[_pi++] = par;
            }
            else {
              this.particles_pool.free(par);
            }
          }
          else {
            if (time - par[1] > 0) {
              par[1] = time;
            }
            ap.updates[_pi++] = par;
          }
        }

        this.pi = _pi;
        ap.swap();

        this.submit_data(dt);

       
      }
      em.submit_data = function (dt) {
        ci = 2;
        par_size = this.def.particle_size;
        _pi = this.pi;
        while (_pi > 0) {
          par = this.active_particles.queue[--_pi];
          dt[ci++] = this.instances_pool.ref[par[0]].type;
          dt[ci++] = (time - par[1]) / par[2];
          for (ii = 2; ii < par_size; ii++) {
            dt[ci++] = par[ii];
          }
        }

        dt[0] = ci;
        dt[1] = par_size;
        
        this.postMessage([this.data.buffer], [this.data.buffer]);
      };
    };

    modules['generic_emitter'] = function (em) {
      em.def.particle_size = 10;
      var par;
      em.on_particle_update = function (par, ins, time_delta) {
        
      }
      em.update_particle = function (par, ins, time_delta) {
        par[3] += par[6] * time_delta;
        par[4] += par[7] * time_delta;
        par[5] += par[8] * time_delta;

        par[7] -= par[8] * time_delta;
        this.on_particle_update(par, ins, time_delta);

      };
      em.use_instance = function (ins, dt, ci) {
        ins.x = dt[ci];
        ins.y = dt[ci + 1];
        ins.z = dt[ci + 2];
        ins.particle_life = dt[ci + 3];

      }

      em.trigger_emitter = function (ins) {
        par = this.queue_particle(0, ins.id, ins.particle_life);
        par[3] = ins.x;
        par[4] = ins.y;
        par[5] = ins.z;

        par[6] = (Math.random() - 0.5) * 3;
        par[7] = (Math.random() * 2) + 1;
        par[8] = (Math.random() - 0.5) * 3;


        par[9] = -0.8;
      }
      console.log(em);
    };

    function add_modules(src, mods, cb) {
      if (cb) {
        mods.forEach(function (m) {
          if (!m) return;
          if (!fin.is_function(m)) {
            src.push('(' + cb(modules[m].toString()) + ')(self)');
          }
          else src.push('(' + cb(m.toString()) + ')(self)');

        });
      }
      else {
        mods.forEach(function (m) {
          if (!m) return;
          if (!fin.is_function(m)) {
            src.push('(' + modules[m].toString() + ')(self)');
          }
          else src.push('(' + m.toString() + ')(self)');

        });
      }
      
      return src;

    }

    function create_worker(src) {
      var wkr = new Worker(window.URL.createObjectURL(new Blob([src.join(";")])));

      return wkr
    };


    
    proto.define_emitter = function (name, def, mods) {

      def = def || {};
      var src = add_modules([], [
        'init',
        'queue',
        'object_pooler',
        'ping_pong_array',
        'init_emitter'
      ], function (s) {
        return s.replace('//[em_def]', 'Object.assign(em.def,' + JSON.stringify(def) + ');');
      });



      add_modules(src, mods);

      var em = create_worker(src);
      def.data_size = def.data_size || (1024 * 100);


      Object.assign(em, def);

      em.is_working = true;
      em.data = new Float32Array(def.data_size);
      em.command_data = new Float32Array(1024 * 5);
      em.ci = 0;
      em.system = this;
      em.data_callback = false;

      em.on_data = def.on_data || function (dt, di, size) {

      };

      em.onmessage = function (m) {
        this.data = new Float32Array(m.data[0]);
        this.data_callback = true;
        this.on_data(this.data, 2, this.data[0]);
        this.data_callback = false;
       
      }


      var ci = 0;
      em.push_command = function (params) {
        this.command_data[this.ci++] = params.length-1;
        for (ci = 0; ci < params.length; ci++) {
          this.command_data[this.ci++] = params[ci];
        }
      };



      em.update = function (timer, time_delta) {


        if (!this.data_callback && this.data.buffer.byteLength > 0) {
         

          this.data[1] = 1;
          this.data[2] = 100;
          this.data[3] = timer;
          this.data[4] = time_delta;

          ci = 0;
          this.data[0] = this.ci+4;
          while (ci < this.ci) {
            this.data[ci+4] = this.command_data[ci++];
          }
          this.postMessage([this.data.buffer], [this.data.buffer]);
          this.ci = 0;

        }
        
      }

      this.emitters[name] = em;
      return em;

    };



    proto.validate = function (app) {
      this.priority = app.use_system('ge_transform_system').priority - 50;
    };

    proto.create_quad_particle_emitter = (function () {

      var mat = new ge.shading.material({
        shader: ge.shading.material.shader.extend(`
attribute vec4 a_particle_pos_rw;
varying vec4 v_particle_pos_rw;
vec4 att_position(void){
    return vec4(((a_position_rw.xyz)+a_particle_pos_rw.xyz),1.0);
}
void vertex(){
	super_vertex();
v_particle_pos_rw=a_particle_pos_rw;

}
varying vec4 v_particle_pos_rw;
void fragment(){
	super_fragment();
}
`)
      });

      mat.complete_render_mesh = (function (_super) {
        return function (renderer, shader, mesh) {
          mesh.emitter.renderer = renderer;
          this.instances_count = mesh.geometry.instances_count;
          if (this.instances_count > 0) {
            _super.apply(this, [renderer, shader, mesh]);
          }
          
        }
      })(mat.complete_render_mesh);

     

      var geo = ge.geometry.geometry_data.create({
        vertices: new Float32Array([
          -0.5, -0.5, 0,
          0.5, -0.5, 0,
          0.5, 0.5, 0,
          -0.5, -0.5, 0,
          0.5, 0.5, 0,
          -0.5, 0.5, 0
        ]),
        attr: {
          a_particle_pos_rw: { item_size: 4, buffer_type: ge.GL_DYNAMIC_DRAW, divisor: 1 },

        }
      });
      geo.instances_count = -1;
      geo.create_emitter = function (ps) {
        this.emitter = ps.define_emitter("quad_particle_emitter", {}, [
          'generic_emitter',
          function (em) {
            em.submit_data = function (dt) {
              var ci = 0;
              var _pi = this.pi;

              while (_pi > 0) {
                par = this.active_particles.queue[--_pi];
                dt[ci++] = par[3];
                dt[ci++] = par[4];
                dt[ci++] = par[5];
                dt[ci++] = 1;
              }

              dt[dt.length - 1] = ci;
              this.postMessage([this.data.buffer], [this.data.buffer]);
            };
          }

        ]);

        this.emitter.on_data = function (dt) {
          if (this.renderer) {
            if (this.geo.attributes.a_particle_pos_rw.buffer === null) {
              this.geo.attributes.a_particle_pos_rw.buffer = this.renderer.gl.createBuffer();
            }
            this.renderer.gl.bindBuffer(ge.GL_ARRAY_BUFFER, this.geo.attributes.a_particle_pos_rw.buffer);
            this.renderer.gl.bufferData(ge.GL_ARRAY_BUFFER, dt, ge.GL_DYNAMIC_DRAW, 0, dt[dt.length - 1]);
            this.geo.instances_count = dt[dt.length - 1] / 4;
          }        

        };

        this.emitter.geo = this;

      }


      return function (def) {
        if (!geo.emitter) {
          geo.create_emitter(this);
         
        }
        var mesh = new ge.geometry.mesh({ geometry: geo, material: mat });
        mesh.emitter = geo.emitter;
        return mesh;

      }
    })();


    proto.create_point_particle_emitter = (function () {

      var mat = new ge.shading.material({
        shader: ge.webgl.shader.parse(`
<?=chunk('precision')?>

attribute vec4 a_position_rw;


uniform mat4 u_view_projection_rw;
uniform mat4 u_model_rw;

void vertex(void){

  gl_Position=u_view_projection_rw*vec4(a_position_rw.xyz,1.0);
  gl_PointSize =5.0;




}
<?=chunk('precision')?>

void fragment(void) {
    gl_FragColor =vec4(1.0);
}


`)
      });

      mat.render_mesh = function (renderer, shader, mesh) {
        mesh.emitter.renderer = renderer;
        if (mesh.geometry.instances_count > 0) {
          renderer.gl.enable(ge.GL_BLEND);
          renderer.gl.blendFunc(ge.GL_SRC_ALPHA, ge.GL_ONE_MINUS_SRC_ALPHA);
          renderer.gl.depthMask(false);
          renderer.use_texture(this.texture, 0);
          renderer.gl.bindBuffer(ge.GL_ARRAY_BUFFER, mesh.emitter.a_particle_pos_buffer);
          renderer.gl.vertexAttribPointer(0, 4, ge.GL_FLOAT, false, 16, 0);

          renderer.gl.drawArrays(ge.GL_POINTS, 0, mesh.geometry.instances_count);

          renderer.gl.disable(ge.GL_BLEND);
          renderer.gl.depthMask(true);
        }

      };



      var geo = ge.geometry.geometry_data.create({
        vertices: new Float32Array(0), vertex_size:4
      });
      geo.instances_count = -1;
      geo.create_emitter = function (ps) {
        this.emitter = ps.define_emitter("quad_particle_emitter", {}, [
          'generic_emitter',
          function (em) {
            em.submit_data = function (dt) {
              var ci = 0;
              var _pi = this.pi;

              while (_pi > 0) {
                par = this.active_particles.queue[--_pi];
                dt[ci++] = par[3];
                dt[ci++] = par[4];
                dt[ci++] = par[5];
                dt[ci++] = 1;
              }

              dt[dt.length - 1] = ci;
              this.postMessage([this.data.buffer], [this.data.buffer]);
            };
          }

        ]);

        this.emitter.on_data = function (dt) {
          if (this.renderer) {
            if (!this.a_particle_pos_buffer) {
              this.a_particle_pos_buffer = this.renderer.gl.createBuffer();
            }
            this.renderer.gl.bindBuffer(ge.GL_ARRAY_BUFFER, this.a_particle_pos_buffer);
            this.renderer.gl.bufferData(ge.GL_ARRAY_BUFFER, dt, ge.GL_DYNAMIC_DRAW, 0, dt[dt.length - 1]);
            this.geo.instances_count = dt[dt.length - 1] / 4;
          }

        };

        this.emitter.geo = this;

      }


      return function (def) {
        if (!geo.emitter) {
          geo.create_emitter(this);

        }
        var mesh = new ge.geometry.mesh({ geometry: geo, material: mat });
        mesh.emitter = geo.emitter;
        return mesh;

      }
    })();

    proto.create_point_particle_emitter = (function () {

      var mat = new ge.shading.material({
        shader: ge.webgl.shader.parse(`
<?=chunk('precision')?>

attribute vec4 a_position_rw;

uniform vec4 u_texture_sets_rw[10];

uniform mat4 u_view_projection_rw;
uniform mat4 u_model_rw;

varying float v_life_rw;
varying float v_life_blend;
varying vec4 v_texture_set_rw;
varying vec2 v_texture_coord1_rw;
varying vec2 v_texture_coord2_rw;

void vertex(void){

v_life_rw= fract(a_position_rw.w);

  int texture_set =int(fract(a_position_rw.w * 256.0)*255.0);
  float size = (fract(a_position_rw.w * 65536.0)*255.0);

  v_texture_set_rw=u_texture_sets_rw[texture_set];

  gl_Position=u_view_projection_rw*vec4(a_position_rw.xyz,1.0);

 gl_PointSize =(size/gl_Position.w)*15.0;



    float d=v_texture_set_rw.z/v_texture_set_rw.w;

    float lf=((1.0-v_life_rw)/(1.0/d));

    v_life_blend=fract(lf);

    v_texture_coord1_rw=vec2(floor(lf)*v_texture_set_rw.w,0.0);
    v_texture_coord2_rw=vec2(v_texture_coord1_rw.x+v_texture_set_rw.w,v_texture_coord1_rw.y);

    v_texture_coord2_rw=v_texture_coord1_rw;




}
<?=chunk('precision')?>
uniform sampler2D u_texture_rw;

varying float v_life_rw;
varying float v_life_blend;
varying vec4 v_texture_set_rw;
varying vec2 v_texture_coord1_rw;
varying vec2 v_texture_coord2_rw;

vec2 rotcoord(vec2 c,vec2 p,float r){


return vec2((cos(r) * (p.x-c.x)  + sin(r) * (p.y-c.y))+c.x,               (cos(r) * (p.y-c.y)  - sin(r) * (p.x-c.x))+c.y );

 return vec2(cos(r) * (p.x)  + sin(r) * (p.y),               cos(r) * (p.y)  - sin(r) * (p.x) );


//return p;
 
}
void fragment(void) {
     vec2 coords =gl_PointCoord*v_texture_set_rw.w+v_texture_set_rw.xy;
 //   gl_FragColor =texture2D(u_texture_rw, coords+v_texture_coord1_rw);
//rotcoord(vec2(v_texture_set_rw.w*0.5),v_texture_coord2_rw,-0.2)
gl_FragColor =mix( texture2D(u_texture_rw, coords+v_texture_coord1_rw),
    texture2D(u_texture_rw, coords+v_texture_coord2_rw),v_life_blend);
//gl_FragColor=vec4(1.0);
}


`),
        transparent_layer: 100,
      });

      mat.render_mesh = function (renderer, shader, mesh) {
        mesh.emitter.renderer = renderer;
        if (mesh.emitter.instances_count > 0) {
          renderer.gl_enable(ge.GL_BLEND);
          renderer.gl_blendFunc(ge.GL_SRC_ALPHA, ge.GL_ONE_MINUS_SRC_ALPHA);
          renderer.gl_depthMask(false);
          renderer.use_texture(this.texture, 0);
          renderer.gl.bindBuffer(ge.GL_ARRAY_BUFFER, mesh.emitter.a_particle_pos_buffer);
          renderer.gl.vertexAttribPointer(0, 4, ge.GL_FLOAT, false, 16, 0);

          renderer.use_texture(mesh.texture, 0);
          for (s = 0; s < mesh.texture_sets.length; s++) {
            shader.set_uniform('u_texture_sets_rw[' + s + ']', mesh.texture_sets[s]);
          }

          renderer.gl.drawArrays(ge.GL_POINTS, 0, mesh.emitter.instances_count);

         renderer.gl_disable(ge.GL_BLEND);
          renderer.gl_depthMask(true);
         // renderer.use_texture(null, 0);
        }

      };



      var geo = ge.geometry.geometry_data.create({
        vertices: new Float32Array(0), vertex_size: 4
      });
     

      return function (def) {
        var mesh = new ge.geometry.mesh({ geometry: geo, material: mat });
        mesh.emitter = this.define_emitter("point_particle_emitter", {
          on_data: function (dt) {
            if (this.renderer) {
              if (!this.a_particle_pos_buffer) {
                this.a_particle_pos_buffer = this.renderer.gl.createBuffer();
              }
              this.renderer.gl.bindBuffer(ge.GL_ARRAY_BUFFER, this.a_particle_pos_buffer);
              this.renderer.gl.bufferData(ge.GL_ARRAY_BUFFER, dt, ge.GL_DYNAMIC_DRAW, 0, dt[dt.length - 1]);
              this.instances_count = dt[dt.length - 1] / 4;
            }
          }

        }, [
          'generic_emitter',
          function (em) {
            var uint32 = new Uint32Array(1), uint8 = new Uint8Array(4);
            var ci, _pi;
            em.pack_life_texture_size = function (uint8, par) {
            };

            em.submit_data = function (dt) {
              ci = 0; _pi = this.pi;

              while (_pi > 0) {
                par = this.active_particles.queue[--_pi];
                dt[ci++] = par[3];
                dt[ci++] = par[4];
                dt[ci++] = par[5];

                uint8[0] = ((this.time - par[1]) / par[2]) * 255; // life
                uint8[1] = 0; //texture_set;
                uint8[2] = 10; //size;
                this.pack_life_texture_size(uint8, par);
                // pack life, texture set and size in one float                    
                uint32[0] = (uint8[0] << 16) | (uint8[1] << 8) | uint8[2];
                dt[ci++] = uint32[0] / (1 << 24);


              }

              dt[dt.length - 1] = ci;
              this.postMessage([this.data.buffer], [this.data.buffer]);
            };
          },
          def.emitter

        ]);

        mesh.texture = def.texture;
        mesh.texture_sets = [];
        if (def.texture) {
          this.texture = def.texture;
          if (def.texture_sets) {

            var ww = def.texture.width;
            var hh = def.texture.height;

            var ratio = 1;
            if (ww > hh) {
              ratio = (ww / hh);
            }

            def.texture_sets.for_each(function (tx, i, self) {
              tx = new Float32Array(tx);
              tx[0] /= ww;
              tx[1] /= hh;
              tx[2] /= ww;
              tx[3] /= hh;

              mesh.texture_sets.push(tx);
            }, this);
          }


        }
        mesh.emitter.emit_intance = function () {

        }

        return mesh;

      }
    })();


    function worker_particles_system(def) {
      _super.apply(this, arguments);

      this.emitters = {};


    }



    return worker_particles_system;



  }, ecs.system));
}