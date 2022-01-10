function index(fin) {
  var ecs = this;


  function before_load(fin, done) {
    fin.modules['ecs'] = this;
    done();
  }


  ecs.systems = {};
  ecs.components = {};

  ecs.app = fin.define(function (proto) {

    proto.sort_systems = function () {
      this._systems = fin.merge_sort(this._systems, this._systems.length, function (a, b) {
        return a.priority - b.priority;
      });
    }

    proto.iterate_entities = (function () {
      var comp = null;
      return function (name_id) {
        comp = this.components[name_id];
        if (comp === undefined) return null;
        if (comp.ei === -1) comp.ei = 0;
        if (comp.ei < comp.entities.length) {
          return this.entities[comp.entities[comp.ei++]];
        }
        comp.ei = -1;
        return null;
      }
    })();

    proto.use_system = function (name_id, def) {
      var sys = this.systems[name_id];
      if (!sys) {
        
        sys = new ecs.systems[name_id](def, this);        
        sys.name_id = name_id;
        this.systems[name_id] = sys;
        this._systems[this._systems.length] = sys;
        sys.validate(this);
        this.sort_systems();
        this.required_validation = true;
      }
      return sys;
    };

    proto.validate = function () {
      if (this.required_validation === true) {
        this.required_validation = false;
        for (i = 0; i < this._systems.length; i++) {
          this._systems[i].validate(this);
        }
        this.sort_systems();
      }

    };
    var name_id, i = 0;
    var comp, sys;
    proto.use_component = function (name_id) {
      if (!this.components[name_id]) {
        comp = ecs.components[name_id];
        this.components[name_id] = {
          priority: comp.priority,
          name_id: name_id, set_instance: null,
          creator: comp, app: this, entities: [], ei: 0
        };
        if (comp.super_class.name_id !== undefined) {
          this.components[name_id].parent = this.use_component(comp.super_class.name_id)
        }
       
        if (comp.validate) comp.validate(this.components[name_id]);
        this._components.push(this.components[name_id]);
        this._components = fin.merge_sort(this._components, this._components.length, function (a, b) {
          return a.priority - b.priority;
        });

        this.required_validation = true;
      }
      return this.components[name_id];
    };
    proto.map_component_entity = function (e, comp, ins) {
      comp.entities[comp.entities.length] = e.uuid;
      e[comp.name_id] = ins;
      if (comp.parent) this.map_component_entity(e, comp.parent, ins);

    };
    proto.attach_component = function (e, name_id, def) {
      comp = this.use_component(name_id);


      if (e[comp.name_id]) return e[comp.name_id];
      var ins = new comp.creator(def, e, this, comp);
      comp = this.components[name_id];      
      this.map_component_entity(e, this.components[name_id], ins);
      return e[comp.name_id];
    };

    proto.create_entity = function (def) {
      def = def || {};
      var entity = { uuid: def.uuid || fin.guidi() };
      this.entities[entity.uuid] = entity;
      if (def.components) {
        for (name_id in def.components) {
          this.use_component(name_id);
        }



        for (var i = 0; i < this._components.length; i++) {
          comp = this._components[i];
          
          if (def.components[comp.name_id]) {
            this.attach_component(entity, comp.name_id, def.components[comp.name_id]);
          }
        }

      }
      return entity;
    };


    proto.step = function (cb) {
      this.timer = performance.now() * 0.001;
      
     
      this.current_time_delta = this.timer - this.last_timer;
      if (this.current_time_delta < this.req_time_delta) {
        return;
      }

      this.current_time_delta = Math.max(this.req_time_delta, this.current_time_delta);
      this.current_time_delta = Math.min(this.req_time_delta * 2, this.current_time_delta);

      this.last_timer = this.timer - (this.current_time_delta % this.req_time_delta);

      this.validate();


      var i = 0, time_start = 0, s_count = this._systems.length;



      this._app_cb.apply(this);
      for (i = 0; i < s_count; i++) {
        sys = this._systems[i];
        if (sys.enabled === true) {
          sys.time_delta = this.timer - sys.last_step_time;
          if (sys.time_delta > sys.step_size) {
            sys.step_start();
          }

        }
      }

      for (i = 0; i < s_count; i++) {
        sys = this._systems[i];
        if (sys.enabled === true) {
          if (sys.time_delta > sys.step_size) {
            time_start = Date.now();
            sys.step();
            sys.on_frame.trigger();
            sys.frame_time = (Date.now() - time_start);
          }

        }
      }

      for (i = 0; i < s_count; i++) {
        sys = this._systems[i];
        if (sys.enabled === true) {
          if (sys.time_delta > sys.step_size) {
            sys.step_end();
            
            sys.last_step_time = this.timer - (sys.time_delta % sys.step_size);
          }
        }
      }

    };

    
    proto.start = function (cb,time_delta) {
      var app = this;
      app._app_cb = cb || function () { };
      app.req_time_delta = time_delta || (1 / 60);
      this.timer = performance.now() * 0.001;
      this.last_timer = this.timer 
      function step1() {        
        app.step();
        requestAnimationFrame(step2);
      }
      function step2() {        
        app.step();
        requestAnimationFrame(step1);
      }
      app.step();
      requestAnimationFrame(step1);
    }

    return function ecs_app(def) {
      def = def || {};
      
      this.systems = {};
      this.components = {};
      this._components = [];
      this._systems = [];
      this.entities = {};

      if (def.systems) {
        for (var s in def.systems) {
          this.use_system(s);
        }
      }


    }


  });


  ecs.component = fin.define(function (proto) {
    function component() { }
    return component;
  });

  ecs.system = fin.define(function (proto) {
    proto.validate = function (ecs) { };
    proto.step_start = function () { };
    proto.step = function () { };
    proto.step_end = function () { };

    function system(def, app) {
      def = def || {};
      this.uuid = def.uuid || fin.guidi();
      this.state = 1;
      this.step_size = 1 / 60;
      this.last_step_time = 0;
      this.worked_items = 0;
      this.enabled = true;
      this.time_delta = 0;
      this.app = app;
      this.on_frame = new fin.event(this);
    }
    return system;
  });


  ecs.register_component = function (name_id, comp) {
    comp.name_id = name_id;
    this.components[comp.name_id] = comp;
    comp.priority = ecs.register_component.priority;
    ecs.register_component.priority += 1000;
  };

  ecs.register_component.priority = 1000;


  ecs.register_system = function (name_id, sys) {
    sys.name_id = name_id;
    this.systems[sys.name_id] = sys;
  };

  console.log("ecs", ecs);
}