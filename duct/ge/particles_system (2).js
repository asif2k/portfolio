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

      }
    };

    modules['init_emitter'] = function (em) {
      em.def = {
        particle_size: 4
      };
      //[em_def]

      em.particles = new em.object_pooler(function (size) {
        return new Float32Array(size);
      });




      em.instances = new em.object_pooler(function () {
        return {
          last_emit_time: 0,
          emit_delay: 0.2,
          life: 0,
          life_start: 0,
        };
      });


      

      em.active_instances = new em.queue();


      em.particles1 = [];
      em.particles2 = [];


      em.particles_queue = em.particles1;
      em.particles_updates = em.particles2;



      em.instances_ref = {};

      var ci = 0, nci = 0, dt, ccount = 0, cmd = 0;



      em.run_command = function (cmd, dt, ci) {

      }

      em.use_instance = function (ins,dt,ci) {

        return ins;
      }

      em.active_particles = new em.queue();
      var ins, par, ins_count, timer,  ii = 0, par_size = 0, pi = 0;

      em.use_particle = function (par,ins) {
        return par
      }
      em.queue_particle = function (time, ins_id, life) {
        par = this.particles.get(this.def.particle_size);
        par[0] = ins_id;
        par[1] = this.timer+time;
        par[2] = life;
        this.particles_queue[this.pi++] = par;
        return par;
      };
      em.queue_particle = function (time, ins_id, life) {
        par = this.particles.get(this.def.particle_size);
        par[0] = ins_id;
        par[1] = this.timer + time;
        par[2] = life;
        this.active_particles.enqueue(par);
        return par;
      };
      em.trigger_emitter = function (ins) {

      }


      em.updating_particles = [];
      em.pi = 0;

      em.last_timer = 0;
      em.time_delta = 0;
      em.onmessage = function (m) {
        ci = 0;
        this.data = new Float32Array(m.data[0]);

        dt = this.data;

        ccount = dt[ci++];
        par_size = this.def.particle_size;
        while (ci < ccount) {
          nci = dt[ci++];
          cmd = dt[ci++];
        //  console.log(cmd, nci);
          if (cmd === 100) {
            this.timer = dt[ci];
            this.time_delta = this.timer - this.last_timer;

            this.last_timer = this.timer;
            //console.log(this.timer);
          }
          else if (cmd === 200) {

            ins = this.instances.get();

            ins.id = dt[ci];
            ins.life = dt[ci + 1];
            ins.emit_delay = dt[ci + 2];

            ins.life_start = this.timer;
            ins.last_emit_time = this.timer - ins.emit_delay * 2;
            this.instances_ref[ins.id] = ins;
            this.use_instance(ins, dt, ci + 3);

            this.active_instances.enqueue(ins);
          }
          else {
            this.run_command(cmd, dt, ci);

          }

          ci += nci;
        }



        ins_count = this.active_instances.size();

        if (ins_count < this.active_instances._oldestIndex) {
          this.active_instances.realign();
        }

        timer = this.timer;
        time_delta = this.time_delta;

        while (ins_count > 0) {
          ins = this.active_instances.dequeue();
          if (ins.life < 0 || timer - ins.life_start < ins.life) {
            if (timer - ins.last_emit_time > ins.emit_delay) {
              ins.last_emit_time = timer;
              this.trigger_emitter(ins);
             
            }
            this.active_instances.enqueue(ins);
          }
          else {
           
            this.instances.free(ins);
          }
          ins_count--;
        }

        ci = 2;


        par_count = this.active_particles.size();

        this.pi = 0;
        while (par_count > 0) {
          par = this.active_particles.dequeue();
          if (timer - par[1] > 0) {
            if (par[2] < 0 || timer - par[1] < par[2]) {
              ins = this.instances_ref[par[0]];
              this.update_particle(par, ins, time_delta);
              this.active_particles.enqueue(par);
              for (ii = 0; ii < par.length; ii++) {
                dt[ci++] = par[ii];
              }

            }
            else {
              // console.log("fp", par);
              this.particles.free(par);
            }
          }
          else {
            //par[1] -= this.time_delta;
            if (timer - par[1] > 0) {
              par[1] = timer;
            }
            this.active_particles.enqueue(par);
          }

          par_count--;
        }

        dt[0] = ci;
        dt[1] = par_size;



        this.submit_data();
        return;
        pi = 0;

        while (this.pi > 0) {
          par = this.particles_queue[--this.pi];
          if (timer - par[1] > 0) {
            if (par[2] < 0 || timer - par[1] < par[2]) {
              ins = this.instances_ref[par[0]];
              this.update_particle(par, ins, time_delta);
              this.particles_updates[pi++] = par;
              for (ii = 0; ii < par_size; ii++) {
                dt[ci++] = par[ii];
              }
            }
            else {
              this.particles.free(par);
            }
          }
          else {

            if (timer - par[1] > 0) {
              par[1] = timer;
            }

            this.particles_updates[pi++] = par;
          }
        }

        this.pi = pi;

        var temp = this.particles_queue;
        this.particles_queue = this.particles_updates;
        this.particles_updates = temp;

        dt[0] = ci;
        dt[1] = par_size;



        this.submit_data();

       
      }
      em.submit_data = function () {
        this.postMessage([this.data.buffer], [this.data.buffer]);
      };
    };



    function add_modules(src, mods, cb) {
      if (cb) {
        mods.forEach(function (m) {
          if (!fin.is_function(m)) {
            src.push('(' + cb(modules[m].toString()) + ')(self)');
          }
          else src.push('(' + cb(m.toString()) + ')(self)');

        });
      }
      else {
        mods.forEach(function (m) {
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


    
    proto.define_emitter = function (name, def,mods) {


      var src = add_modules([], [
        'init',
        'queue',
        'object_pooler',
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



      em.onmessage = function (m) {
        this.data = new Float32Array(m.data[0]);
        this.data_callback = true;
        this.on_data(this.data, 2, this.data[0]);
        this.data_callback = false;
       
      }


      var ci = 0;
      em.on_data = function (dt, di,size) {

      }
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



    function worker_particles_system(def) {
      _super.apply(this, arguments);

      this.emitters = {};


    }



    return worker_particles_system;



  }, ecs.system));
}