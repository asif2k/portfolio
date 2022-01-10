function index(fin,ecs, ge,math) { 

  ge.define = fin.define;
  ge.guidi = fin.guidi;
  ge.str = function (str, arg1, arg2, arg3, arg4, arg5) {
    str = "var arr=[];arr.push('" + str
      .replace(/\n/g, "\\n")
      .replace(/[\r\t]/g, " ")
      .split("<?").join("\t")
      .replace(/((^|\?>)[^\t]*)'/g, "$1\r")
      .replace(/\t=(.*?)\?>/g, "',$1,'")
      .split("\t").join("');")
      .split("?>").join("arr.push('")
      .split("\r").join("\\'")
      + "');return arr.join('');";
    return new Function(arg1, arg2, arg3, arg4, arg5, str);
  }


  ge.create_canvas = function (w, h) {
    var temp_canvas = document.createElement('canvas');
    temp_canvas.ctx = temp_canvas.getContext('2d');
    temp_canvas.width = w;
    temp_canvas.height = h;
    temp_canvas.set_size = function (ww, hh) {
      this.width = ww;
      this.height = hh;
    };
    temp_canvas._get_image_data = function () {
      this.imd = this.ctx.getImageData(0, 0, this.width, this.height);
      return this.imd;
    };

    temp_canvas._put_image_data = function () {
      this.ctx.putImageData(this.imd, 0, 0);
    };

    return (temp_canvas);
  };


  ge.mouse_events = function (elm, cb) {
    
    elm.addEventListener('mousedown', function (e) {
      elm.bound_rect = elm.bound_rect || elm.getBoundingClientRect();
      elm.mouse_x = e.clientX - elm.bound_rect.left;
      elm.mouse_y = e.clientY - elm.bound_rect.top; 
      elm.mouse_button = e.buttons;
      cb(elm, "mousedown", elm.mouse_x, elm.mouse_y, e);

    });
   
    elm.addEventListener('mouseup', function (e) {
      elm.mouse_button = e.buttons;
      cb(elm, "mouseup", elm.mouse_x, elm.mouse_y, e);

    });

    elm.addEventListener('mousemove', function (e) {
      elm.bound_rect = elm.bound_rect || elm.getBoundingClientRect();
      elm.mouse_x = e.clientX - elm.bound_rect.left;
      elm.mouse_y = e.clientY - elm.bound_rect.top;
      elm.mouse_button = e.buttons;
      cb(elm, "mousemove", elm.mouse_x, elm.mouse_y, e);

    });



  }

  ge.event = ge.define(function (proto) {
    proto.add = function (cb, callee) {
      callee = callee || this.owner;
      this.handlers[this.handlers.length] = [cb, callee];
    };    
    proto.trigger = function (params) {
      for (var i = 0; i < this.handlers.length; i++)
        if (this.handlers[i][0].apply(this.handlers[i][1], params) === false) return false;
    };

    proto.trigger_params = function () {
      for (var i = 0; i < this.handlers.length; i++)
        if (this.handlers[i][0].apply(this.handlers[i][1], this.params) === false) return false;
    };

    return function event(owner, params) {
      this.owner = owner;
      this.handlers = [];
      this.params = params;
    };
  });

  ge.flags_setting = ge.define(function (proto) {

    ge.set_flag = function (flags, flag) {
      if (!(flags & flag)) {
        flags |= flag;
      }
      return flags;
    };

    ge.unset_flag = function (flags, flag) {
      if ((flags & flag) !== 0) {
        flags &= ~flag;
      }
      return flags;
    };

    proto.set_flag = function (flag) {
      if (!(this.flags & flag)) {
        this.flags |= flag;
      }
      return (this);
    };

    proto.unset_flag = function (flag) {
      if ((this.flags & flag) !== 0) {
        this.flags &= ~flag;
      }
      return (this);
    };
    return function flags_setting() {
      this.flags = 0;
    }

  });


  ge.bulk_image_loader = ge.define(function (proto) {


    var dummy_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=";

    proto.load = function (url, params) {
      var img = this.pool.get();      
      if (img === null) {
        this.park.enqueue([url, params]);
        return;
      }
      img.params = params;
      img.manager = this;   
      img.src = url;
    };

   
    proto.check_park = function () {
      if (this.park.size() > 0) {
        this.load.apply(this, this.park.dequeue());
      }
    };

    proto.free = function (img) {
      this.pool.free(img);
      img.params = undefined;
      img.manager = undefined;
      img.src = dummy_image;
      this.check_park();
    };


    return function (pool_size) {
      this.park = new fin.queue();
      this.pool = new fin.object_pooler(function () {
        if (this.allocated <= this.max_size) {
          var img = new Image();          
          img.crossOrigin = "Anonymous";
          img.onload = function () {
            if (!this.manager) return;
            this.manager.onload(this, this.params);
          
            if (this.manager.auto_free) this.manager.free(this);
          };
          return img
        }
        this.allocated--;
        return null;        
      });
      this.pool.max_size = pool_size;    
      this.auto_free = true;
      return this;
    }




  });



  ge.load_working_image = (function () {
    var parking = new fin.queue();
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.is_busy = false;

    function process(url, cb) {
      if (img.is_busy) {
        parking.enqueue([url, cb]);
        return;
      }
      img.onload = function () {
        if (cb) cb(this);
        this.is_busy = false;
        if (parking.size() > 0) {
          process.apply(this, parking.dequeue());
        }
      };
      img.is_busy = true;
      img.src = url;

    }

    return process;

  })();


  ge.load_working_image_data = (function () {
    var parking = new fin.queue();
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.is_busy = false;
    var canv = ge.create_canvas(1, 1);




    function process(url, cb, w, h) {
      if (img.is_busy) {
        parking.enqueue([url, cb, w, h]);
        return;
      }
      img.onload = function () {
        canv.set_size(w || this.width, h || this.height);
        canv.ctx.drawImage(this, 0, 0, canv.width, canv.height);
        if (cb) cb(canv._get_image_data().data, canv.width, canv.height, this);
        canv._put_image_data();
        this.is_busy = false;
        if (parking.size() > 0) {
          process.apply(this, parking.dequeue());
        }
      };
      img.is_busy = true;
      img.src = url;

    }

    return process;

  })();





  ge.array = ge.define(function (proto) {

    proto.push = function (element) {
      this.data[this.length++] = element;
    };
    proto.peek = function () {
      return this.data[this.length - 1];
    };

    proto.pop = function () {
      if (this.length === 0) return null;
      return this.data[--this.length];
    };

    proto.clear = function () {
      this.length = 0;
    };

    proto.for_each = function (cb, self) {
      this.index = 0;
      while (this.index < this.length) {
        cb(this.data[this.index], this.index++, self);
      }
      this.index = 0;
    };

    proto.next = function () {
      if (this.index < this.length) {
        return this.data[this.index++];
      }
      return null;

    };
    return function array() {
      this.data = [];
      this.length = 0;
      this.index = 0;
    }
  });


  ge.worker = (function () {

    return function (func, libs) {
      var worker = new Worker(window.URL.createObjectURL(new Blob([
        (libs || []).join(';') + ';self.main=' + func.toString() + ';self.main(self);'])));

      return (worker);
    }

  }());



  ge.worker_processor = ge.define(function (proto) {

    proto.add_job = function (name, func, response) {
      var id = this.job_id++;

      var server = func.toString();
      
      var func_arguments = fin.parse_args_from_func(server);

      if (response) {
        var client = response.toString();
        var respone_arguments = fin.parse_args_from_func(client).join(",");
        server = ((function () {
          function response(respone_arguments) {
            self.postMessage([job_id, respone_arguments]);
          }
          return function (jid, func_arguments) {
            func_body()
          }


        })).toString()
          .replace(/job_id/g, id)
          .replace(/func_arguments/g, func_arguments.join(","))
          .replace(/respone_arguments/g, respone_arguments)
          .replace('func_body()', server.replace(/^function.*\(.*\)\s*\{|\}$/g, ""));


        this.jobs.push('self[' + id + ']=(' + server + ')()');

        this.callbacks[id] = (new Function('return ' +
          (function (jid, respone_arguments) {

            func_body()

          }).toString()
            .replace(/respone_arguments/g, respone_arguments)
            .replace('func_body()', client.replace(/^function.*\(.*\)\s*\{|\}$/g, ""))
        ))();

      }
      else {
        server = (function (jid, func_arguments) {
          func_body()
        }).toString()
          .replace(/job_id/g, id)
          .replace(/func_arguments/g, func_arguments.join(","))
          .replace('func_body()', server.replace(/^function.*\(.*\)\s*\{|\}$/g, ""));


        this.jobs.push('\nself[' + id + ']=' + server);
      }

      this.jobs_func.push({
        name: name,
        func: (new Function('return ' +
          (function (func_arguments) {
            this.postMessage([job_id, func_arguments]);
          }).toString()
            .replace(/job_id/g, id)
            .replace(/func_arguments/g, func_arguments.join(","))
        ))()
      });

    };
    proto.data_processor = function (name, func, response) {
      var id = this.data_processor_id++;
      var server = func.toString();
      var client = response.toString();
      var respone_arguments = fin.parse_args_from_func(client).join(",");
      var func_arguments = fin.parse_args_from_func(server);
      server = ((function () {
        var _bindx;
        function response(respone_arguments) {
          self.postMessage([job_id, _bindx, respone_arguments], [data_buffer]);
        }
        return function (jid, bindx, func_arguments) {
          _bindx = bindx;
          func_body()
        }


      })).toString()
        .replace(/job_id/g, id)
        .replace(/func_arguments/g, func_arguments.join(","))
        .replace(/respone_arguments/g, respone_arguments)
        .replace('func_body()', server.replace(/^function.*\(.*\)\s*\{|\}$/g, ""));


      this.jobs.push('self[' + id + ']=(' + server + ')()');
      var DP = this.DP;
      this.data_processors.push({
        name: name,
        creator: ge.define(function (proto) {
          proto.params = new Array(func_arguments.length + 2);
          proto.DP = DP;
          proto.parking = new fin.queue();


          proto.release = function (bindx, buffer) {
            this.DP.release(bindx, buffer);
            if (this.parking.size() > 0) {
              this.func.apply(this, this.parking.dequeue())
            }
          }
          proto.call = (new Function('return ' +
            (function (func_arguments) {

              this._func_name.func(func_arguments);
            }).toString()
              .replace(/func_arguments/g, func_arguments.join(","))
              .replace(/func_name/g, name)
          ))()


          proto.func = (new Function('return ' +
            (function (func_arguments) {

              var bindx = this.DP.free_index();
              if (bindx > -1) {
                data_buffer = this.DP.buffers[bindx];
                this.worker.postMessage([job_id, bindx, func_arguments], [data_buffer]);
              }
              else {
                this.parking.enqueue([func_arguments])
              }


            }).toString()
              .replace(/func_arguments/g, func_arguments.join(","))
              .replace(/job_id/g, id)

          ))();

          return function (worker) {
            this.worker = worker;
          }
        }),


      });

      this.callbacks[id] = (new Function('return ' +
        (function (jid, bindx, respone_arguments) {

          func_body()

          this._func_name.release(bindx, data_buffer);

        }).toString()
          .replace(/respone_arguments/g, respone_arguments)
          .replace(/func_name/g, name)
          .replace('func_body()', client.replace(/^function.*\(.*\)\s*\{|\}$/g, ""))
      ))();

    };

    proto.build_worker = function (host) {
      var code = this.globals.join('\n') + this.jobs.join('\n');

      var worker = new Worker(window.URL.createObjectURL(new Blob([code])));
      console.log(code);

      for (var c in this.callbacks) {
        worker[c] = this.callbacks[c];
      }
      worker.host = host;
      this.data_processors.forEach(function (dp) {
        worker["_" + dp.name] = (new dp.creator(worker));
        worker[dp.name] = worker["_" + dp.name].call;
      });

      this.jobs_func.forEach(function (jb) {
        worker[jb.name] = jb.func;
      });



      worker.onmessage = function (m) {
        this[m.data[0]].apply(this, m.data);
      };
      return worker;
    }
   
    proto.add_global = function (func) {
      this.globals.push(func.toString().replace(/^function.*\(.*\)\s*\{|\}$/g, "").trim());
    }

    return function worker_processor() {
      this.globals = [];
      this.data_processors = [];
      this.jobs = [];
      this.jobs_func = [];
      this.callbacks = {};
      this.job_id = 100;
      this.data_processor_id = 10000;
      var i = 0;
      this.DP = {
        buffers: [new ArrayBuffer(1), new ArrayBuffer(1), new ArrayBuffer(1)],
        free_index: function () {
          i = 0;
          while (i < this.buffers.length) {
            if (this.buffers[i].byteLength > 0) return i;
            i++;
          }
          return -1;
        },
        release: function (indx, buffer) {
          this.buffers[indx] = buffer;
        }
      }

      this.add_global(function () {
        self.onmessage = function (m) {
          this[m.data[0]].apply(this, m.data);
        };

        function buffer_float_data(buffer, size) {
          if (buffer.byteLength < size * 4) {
            return new Float32Array(size);
          }
          else {
            return new Float32Array(buffer);
          }
        }


      });
    }


  });

  fin.macro$(function version(ver$) {
    ver$ = ((ver$ | 0) + 1) % (99999 | 0);
  }, ge);


  ge.renderable = ge.define(function (proto, _super) {

    proto.expand_bounds = function (x, y, z) {
      this.bounds[0] = Math.min(this.bounds[0], x);
      this.bounds[1] = Math.min(this.bounds[1], y);
      this.bounds[2] = Math.min(this.bounds[2], z);

      this.bounds[3] = Math.max(this.bounds[3], x);
      this.bounds[4] = Math.max(this.bounds[4], y);
      this.bounds[5] = Math.max(this.bounds[5], z);
    };
    proto.initialize_item = function () {

    };
    proto.update_bounds = function (mat) { };
    function ge_renderable(def) {
      this.matrix_world = math.mat4();
      this.world_position = new Float32Array(this.matrix_world.buffer, (12 * 4), 3);
      this.view_position = math.vec3();

      this.fw_vector = new Float32Array(this.matrix_world.buffer, (8 * 4), 3);
      this.bounds = math.aabb();
      this.item_type = ge.ITEM_TYPES.OTHER;
      this.flags = 0;

    }

    return ge_renderable;
  });


  
  ge.utils = {};

  ge.utils.timers =( function () {

    var all_timers = [], i = 0, tim = null, now_time = 0;
    var timers = new fin.object_pooler(function () {
      all_timers.push({});
      return all_timers[all_timers.length - 1];
    });



    function tick() {

      now_time = Date.now();
      for (i = 0; i < all_timers.length; i++) {
        tim = all_timers[i];
        if (tim.cb) {
          if (now_time - tim.last_time > tim.interval) {
            tim.last_time = now_time;
            tim.cb(now_time - tim.begin_time, now_time);
          }
        }
      }

      setTimeout(tick, 100);

    }

    tick();
    
    return {
      create: function (cb, interval) {
        interval = interval || 1000;
        var tim = timers.get();
        tim.cb = cb;
        tim.interval = interval;
        tim.last_time = Date.now() - interval;
        tim.begin_time = tim.last_time + interval;

        return tim;

      },
      release: function (tim) {
        tim.cb = undefined;
        timers.free(tim);        
      }

    }


  })()


  ge.utils.canvas_data_url = (function () {

    var canv = new ge.create_canvas(1,1)
    function canvas_data_url (width, height, cb) {
      canv.set_size(width, height);
      return cb(canv,canv.ctx);
    }
    canvas_data_url.box = function (width, height, color) {
      canv.set_size(width, height);
      canv.ctx.fillStyle = color;
      canv.ctx.fillRect(0, 0, width, height);
      return canv.toDataURL("image/png");

    }
    return canvas_data_url;

  })();

  ge.app = ge.define(function (proto, _super) {

    proto.create_renderable = function (item, cb) {
      var e = this.create_entity({
        components: {
          'ge_transform': {},
          'ge_renderable': {
            items: [item]
          },
        }
      });
      item.entity_id = e.uuid;
      cb(e.ge_renderable.items[0], e);

      return e;
    }

    proto.start = (function (_super) {

      return function (cb, step_size) {
        var self = this;

        _super.apply(this, [function () {
          this.on_frame.trigger();
          cb();
          if (self.timer - self.last_debug_timer > 0.2) {
            self.last_debug_timer = self.timer;
            self.display_debug(self.debug_ctx);
          }
        }, step_size]);
      
      }

    })(proto.start);

    proto.display_debug = function (ctx) {
      ctx.clearRect(0, 0, this.debug_canvas.width, this.debug_canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(this.render_system.fps + " FPS", 2, 10);
      
      for (var i = 0; i < this._systems.length; i++) { 
        ctx.fillText(this._systems[i].name_id + ' ' + this._systems[i].frame_time + ' ms ', 1, (i * 10) + 25);

      }

    }

    

    return function ge_app(def) {
      def = def || {};
      _super.apply(this, arguments);
      def.host = def.host || (function () {
        document.body.style.height = "100vh";
        document.body.style.width = "100%";
        document.body.style.padding = "0";
        document.body.style.margin = "0";
        document.body.style.overflow = "hidden";

        return document.body;

      })();

      this.use_system('ge_render_system', {
        host: def.host,
        renderer: def.renderer
      });

      this.root = this.create_entity({
        components: {
          'ge_transform': {},
          'ge_renderable': {items: []},
        },
      });

      
      this.on_frame = new ge.event(this);

      this.last_debug_timer = 0;
      this.debug_canvas = ge.create_canvas(1, 1);
      this.debug_canvas.setAttribute("style", "position:absolute;width:100%;height:100%;left:0;top:0;box-sizing: border-box;pointer-events: none;");
      this.debug_ctx = this.debug_canvas.ctx;

      this.render_system = this.systems['ge_render_system']
      this.render_system.host.appendChild(this.debug_canvas);

     


      var self = this;

      this.all_timers = [];
      this.timers = new fin.object_pooler(function () {
        var timer = {
          cb: undefined,
          interval: 0,
          created: 0,
          lastClock: 0
        };
        this.all_timers.push(timer);
        return timer;

      });

      this.render_system.renderer.on_canvas_size = function (width, height) {
        self.debug_canvas.set_size(width * 0.5, height * 0.5);
      }


    }


  }, ecs.app);

}