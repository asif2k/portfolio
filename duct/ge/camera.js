
function camera(ge, ecs, math) { 


  function before_load(fin, done) {    
    var constants = {
      KBD_KEY_CANCEL: 3,
      KBD_KEY_HELP: 6,
      KBD_KEY_BACK_SPACE: 8,
      KBD_KEY_TAB: 9,
      KBD_KEY_CLEAR: 12,
      KBD_KEY_RETURN: 13,
      KBD_KEY_ENTER: 14,
      KBD_KEY_SHIFT: 16,
      KBD_KEY_CONTROL: 17,
      KBD_KEY_DLT: 18,
      KBD_KEY_PAUSE: 19,
      KBD_KEY_CAPS_LOCK: 20,
      KBD_KEY_ESCAPE: 27,
      KBD_KEY_SPACE: 32,
      KBD_KEY_PAGE_UP: 33,
      KBD_KEY_PAGE_DOWN: 34,
      KBD_KEY_END: 35,
      KBD_KEY_HOME: 36,
      KBD_KEY_LEFT: 37,
      KBD_KEY_UP: 38,
      KBD_KEY_RIGHT: 39,
      KBD_KEY_DOWN: 40,
      KBD_KEY_PRINTSCREEN: 44,
      KBD_KEY_INSERT: 45,
      KBD_KEY_DELETE: 46,
      KBD_KEY_0: 48,
      KBD_KEY_1: 49,
      KBD_KEY_2: 50,
      KBD_KEY_3: 51,
      KBD_KEY_4: 52,
      KBD_KEY_5: 53,
      KBD_KEY_6: 54,
      KBD_KEY_7: 55,
      KBD_KEY_8: 56,
      KBD_KEY_9: 57,
      KBD_KEY_SEMICOLON: 59,
      KBD_KEY_EQUALS: 61,
      KBD_KEY_A: 65,
      KBD_KEY_B: 66,
      KBD_KEY_C: 67,
      KBD_KEY_D: 68,
      KBD_KEY_E: 69,
      KBD_KEY_F: 70,
      KBD_KEY_G: 71,
      KBD_KEY_H: 72,
      KBD_KEY_I: 73,
      KBD_KEY_J: 74,
      KBD_KEY_K: 75,
      KBD_KEY_L: 76,
      KBD_KEY_M: 77,
      KBD_KEY_N: 78,
      KBD_KEY_O: 79,
      KBD_KEY_P: 80,
      KBD_KEY_Q: 81,
      KBD_KEY_R: 82,
      KBD_KEY_S: 83,
      KBD_KEY_T: 84,
      KBD_KEY_U: 85,
      KBD_KEY_V: 86,
      KBD_KEY_W: 87,
      KBD_KEY_X: 88,
      KBD_KEY_Y: 89,
      KBD_KEY_Z: 90,
      KBD_KEY_CONTEXT_MENU: 93,
      KBD_KEY_NUMPAD0: 96,
      KBD_KEY_NUMPAD1: 97,
      KBD_KEY_NUMPAD2: 98,
      KBD_KEY_NUMPAD3: 99,
      KBD_KEY_NUMPAD4: 100,
      KBD_KEY_NUMPAD5: 101,
      KBD_KEY_NUMPAD6: 102,
      KBD_KEY_NUMPAD7: 103,
      KBD_KEY_NUMPAD8: 104,
      KBD_KEY_NUMPAD9: 105,
      KBD_KEY_MULTIPLY: 106,
      KBD_KEY_DDD: 107,
      KBD_KEY_SEPARATOR: 108,
      KBD_KEY_SUBTRACT: 109,
      KBD_KEY_DECIMAL: 110,
      KBD_KEY_DIVIDE: 111,
      KBD_KEY_F1: 112,
      KBD_KEY_F2: 113,
      KBD_KEY_F3: 114,
      KBD_KEY_F4: 115,
      KBD_KEY_F5: 116,
      KBD_KEY_F6: 117,
      KBD_KEY_F7: 118,
      KBD_KEY_F8: 119,
      KBD_KEY_F9: 120,
      KBD_KEY_F10: 121,
      KBD_KEY_F11: 122,
      KBD_KEY_F12: 123,
      KBD_KEY_F13: 124,
      KBD_KEY_F14: 125,
      KBD_KEY_F15: 126,
      KBD_KEY_F16: 127,
      KBD_KEY_F17: 128,
      KBD_KEY_F18: 129,
      KBD_KEY_F19: 130,
      KBD_KEY_F20: 131,
      KBD_KEY_F21: 132,
      KBD_KEY_F22: 133,
      KBD_KEY_F23: 134,
      KBD_KEY_F24: 135,
      KBD_KEY_NUM_LOCK: 144,
      KBD_KEY_SCROLL_LOCK: 145,
      KBD_KEY_COMMA: 188,
      KBD_KEY_PERIOD: 190,
      KBD_KEY_SLASH: 191,
      KBD_KEY_BACK_QUOTE: 192,
      KBD_KEY_OPEN_BRACKET: 219,
      KBD_KEY_BACK_SLASH: 220,
      KBD_KEY_CLOSE_BRACKET: 221,
      KBD_KEY_QUOTE: 222,
      KBD_KEY_META: 224};
    fin.traverse_object(constants, function (k, v) {
      fin.add_constant(k, v);
    });
    fin.sort_constants();
    done();
  }


  ecs.register_component("ge_camera", ge.define(function (proto, _super) {

    proto.update_aspect = function (asp) {
      this.aspect = asp;
      this.update_view_projection = 1;
    };



    var len = 0;
    proto.update_frustum_plane = function (p, x, y, z, w) {
      len = x * x + y * y + z * z + w * w;
      len = 1 / Math.sqrt(len);
      this.frustum_plans[p][0] = x * len;
      this.frustum_plans[p][1] = y * len;
      this.frustum_plans[p][2] = z * len;
      this.frustum_plans[p][3] = w * len;
    };
    proto.calc_bounds = (function () {
      var minx, miny, minz, maxx, maxy, maxz;
      function update_bounds(x, y, z) {
        minx = Math.min(minx, x);
        miny = Math.min(miny, y);
        minz = Math.min(minz, z);

        maxx = Math.max(maxx, x);
        maxy = Math.max(maxy, y);
        maxz = Math.max(maxz, z);


      }
      return function () {

        var half_height = Math.tan((this.fov / 2.0));
        var half_width = half_height * this.aspect;
        var xn = half_width * this.near;
        var xf = half_width * this.far;
        var yn = half_width * this.near;
        var yf = half_width * this.far;


        minx = 99999;
        miny = 99999;
        minz = 99999;

        maxx = -99999;
        maxy = -99999;
        maxz = -99999;



        update_bounds(-xn, -yn, this.near);
        update_bounds(xn, -yn, this.near);
        update_bounds(xn, yn, this.near);
        update_bounds(-xn, yn, this.near);


        update_bounds(-xf, -yf, -this.far);
        update_bounds(xf, -yf, -this.far);
        update_bounds(xf, yf, -this.far);
        update_bounds(-xf, yf, -this.far);



        this._bounds[0] = minx;
        this._bounds[1] = miny;
        this._bounds[2] = minz;


        this._bounds[3] = maxx;
        this._bounds[4] = maxy;
        this._bounds[5] = maxz;



      }
    })();
    proto.update_frustum = function (me) {
      math.aabb.transform_mat4(this.bounds, this._bounds, this.view);
      //RIGHT
      this.update_frustum_plane(0, me[3] - me[0], me[7] - me[4], me[11] - me[8], me[15] - me[12]);
      //LEFT
      this.update_frustum_plane(1, me[3] + me[0], me[7] + me[4], me[11] + me[8], me[15] + me[12]);
      //BOTTOM
      this.update_frustum_plane(2, me[3] + me[1], me[7] + me[5], me[11] + me[9], me[15] + me[13]);
      //TOP
      this.update_frustum_plane(3, me[3] - me[1], me[7] - me[5], me[11] - me[9], me[15] - me[13]);
      //FAR
      this.update_frustum_plane(4, me[3] - me[2], me[7] - me[6], me[11] - me[10], me[15] - me[14]);
      //NEAR
      this.update_frustum_plane(5, me[3] + me[2], me[7] + me[6], me[11] + me[10], me[15] + me[14]);


    };

    proto.frustum_aabb = (function () {
      
      proto._frustum_aabb = function (minx, miny, minz, maxx, maxy, maxz) {
        var p = 0, plane;
        for (var p = 0; p < 6; p++) {
          plane = this.frustum_plans[p];
          if ((Math.max(minx * plane[0], maxx * plane[0])
            + Math.max(miny * plane[1], maxy * plane[1])
            + Math.max(minz * plane[2], maxz * plane[2])
            + plane[3]) < 0) return false;

        }
        return true;
      };

      return function (aabb) {
        return this._frustum_aabb(aabb[0], aabb[1], aabb[2], aabb[3], aabb[4], aabb[5]);
      }

    })();

    proto.aabb_aabb = (function () {
      var a;
      return function (b) {
        a = this.bounds;
        return (a[0] <= b[3] && a[3] >= b[0]) &&
          (a[1] <= b[4] && a[4] >= b[1]) &&
          (a[2] <= b[5] && a[5] >= b[2]);
      }

    })();


    proto.get_mouse_ray_pos = (function () {
      var v = math.vec4(), start = math.vec3();

      proto.set_drag_direction = function (mouse_x, mouse_y, width, height) {
        v[0] = (mouse_x / width) * 2 - 1;
        v[1] = -(mouse_y / height) * 2 + 1;
        v[2] = -1;
        math.vec3.transform_mat4(start, v, this.view_projection_inverse);
        v[2] = 1;
        math.vec3.transform_mat4(v, v, this.view_projection_inverse);

        math.vec3.subtract(this.drag_direction, v, this.last_drag_direction);
        math.vec3.normalize(this.drag_direction, this.drag_direction);
        math.vec3.copy(this.last_drag_direction, v);
        return this.drag_direction;

      };

      return function (mouse_ray_pos, mouse_x, mouse_y, width, height) {
        v[0] = (mouse_x / width) * 2 - 1;
        v[1] = -(mouse_y / height) * 2 + 1;
        v[2] = -1;

        math.vec3.transform_mat4(start, v, this.view_projection_inverse);
        v[2] = 1;
        math.vec3.transform_mat4(mouse_ray_pos, v, this.view_projection_inverse);
        return mouse_ray_pos;


      }

    })();



    function ge_camera(def, en, app, comp) {
      _super.apply(this, arguments);

      this.view = math.mat4();
      this.view_inverse = math.mat4();
      this.projection = math.mat4();
      this.projection_inverse = math.mat4();
      this.view_projection = math.mat4();
      this.view_projection_inverse = math.mat4();

      this.version = 0;

      this.up_vector = new Float32Array(this.view.buffer, (4 * 4), 3);
      this.fw_vector = new Float32Array(this.view.buffer, (8 * 4), 3);
      this.sd_vector = new Float32Array(this.view.buffer, 0, 3);

      this.frustum_plans = [math.vec4(), math.vec4(), math.vec4(), math.vec4(), math.vec4(), math.vec4()];
      this.world_position = new Float32Array(this.view.buffer, (12 * 4), 3);

      this.bounds = math.aabb();
      this._bounds = math.aabb();

      this.is_locked = false;
      this.entity = en;
      this.update_view_projection = true;
      this.type = def.type || "perspective";
      if (this.type === "perspective") {
        this.fov = (def.fov !== undefined ? def.fov : 60) * math.DEGTORAD;
        this.near = def.near !== undefined ? def.near : 0.1;
        this.far = def.far !== undefined ? def.far : 20000;
        this.aspect = def.aspect !== undefined ? def.aspect : 1;
      }
      else {
        this.left = def.left || -0.5;
        this.right = def.right || 0.5;
        this.bottom = def.bottom || -0.5;
        this.top = def.top || 0.5;
        this.near = def.near || 0.1;
        this.far = def.far || 20;

        this.aspect = Math.abs((this.right - this.left) / (this.top - this.bottom));
      }

      this.vp_left = 0;
      this.vp_top = 0;
      this.vp_width = 1;
      this.vp_height = 1;




      this.drag_direction = math.vec3();
      this.last_drag_direction = math.vec3();
      this.version = 0;
      this.update_view_projection = 1;

    }

    ge_camera.validate = function (comp) {
      comp.app.use_system('ge_camera_system');
    };

    return ge_camera;

  }, ecs.component));

  ecs.register_component('ge_mouse_camera_controller', fin.define(function (proto, _super) {



    proto.mouse_wheel = function (sp, e) {

      this.on_mouse_wheel.params[0] = sp;
      this.on_mouse_wheel.params[1] = e;
      if (this.on_mouse_wheel.trigger_params() === false) return;

      if (this.entity.ge_camera.is_locked) return;
      this.entity.ge_transform_controller.move_front_back(-this.wheel_delta * sp);

    };


    proto.get_mouse_camera_pos = function (pos) {
      this.entity.ge_camera.get_mouse_ray_pos(pos, this.mouse_x, this.mouse_y, this.elm_rect.width, this.elm_rect.height);
    }
    proto.mouse_drage = function (dx, dy, e) {
      
      this.entity.ge_camera.set_drag_direction(this.mouse_x, this.mouse_y, this.elm_rect.width, this.elm_rect.height);

      this.on_mouse_drage.params[0] = dx;
      this.on_mouse_drage.params[1] = dy;
      this.on_mouse_drage.params[2] = e;
      if (this.on_mouse_drage.trigger_params() === false) return;
      if (this.entity.ge_camera.is_locked) return;

      this.entity.ge_transform_controller.yaw_pitch(-dy * 0.005, -dx * 0.005);



    };

    proto.mouse_click = proto.mouse_move = function (x, y, e) { };



    proto.mouse_move2 = function (x, y, e) {
      this.entity.ge_camera.get_mouse_ray_pos(this.mouse_camera_ray_pos, this.mouse_x, this.mouse_y, this.elm_rect.width, this.elm_rect.height);
      math.vec3.subtract(this.mouse_camera_ray, this.mouse_camera_ray_pos, this.entity.ge_camera.world_position);
      math.vec3.normalize(this.mouse_camera_ray, this.mouse_camera_ray);
    };

    proto.mouse_down = function (x, y, e) {
      this.on_mouse_down.params[0] = x;
      this.on_mouse_down.params[1] = y;
      this.on_mouse_down.params[2] = e;
      this.on_mouse_down.trigger_params();
    }

    proto.mouse_up = function (x, y, e) {
      this.on_mouse_up.params[0] = x;
      this.on_mouse_up.params[1] = y;
      this.on_mouse_up.params[2] = e;
      this.on_mouse_up.trigger_params();
    }
  
    proto.mouse_drage2 = function (dx, dy, e) { };

    proto.set_mouse_input = function (elm) {      
      var _this = this;
      this.elm_rect = elm.getBoundingClientRect();

      elm.addEventListener((/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel", function (e) {        
        _this.mouse_wheel(e.detail ? e.detail * (-120) : e.wheelDelta, e);
      }, false);

      var x = 0, y = 0, rect = null;
      elm.addEventListener('mousedown', function (e) {
       
        this.elm_rect = elm.getBoundingClientRect();
        rect = this.elm_rect;
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
        _this.elm_width = rect.right - rect.left;
        _this.elm_height = rect.bottom - rect.top;
        _this.mouse_buttons = e.buttons;
        _this.mouse_down_x = x;
        _this.mouse_down_y = y;
        _this.mouse_down(_this.mouse_down_x, _this.mouse_down_y, e);
        _this.mouse_delta = 1;
        _this.mouse_is_down = true;
        _this.mouse_is_up = false;
      });
      elm.addEventListener('click', function (e) {

        _this.mouse_click(_this.mouse_x, _this.mouse_y, e);
      });
      elm.addEventListener('mouseup', function (e) {
        _this.mouse_buttons = 0;
        _this.mouse_is_up = true;
        _this.mouse_is_down = false;
        _this.mouse_up(_this.mouse_x, _this.mouse_y, e);
      });

      elm.addEventListener('mousemove', function (e) {
        rect = elm.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;

        _this.elm_width = rect.right - rect.left;
        _this.elm_height = rect.bottom - rect.top;

        _this.mouse_buttons = e.buttons;
        _this.mouse_x = x;
        _this.mouse_y = y;
        _this.mouse_draging = false;
        _this.mouse_move(_this.mouse_x, _this.mouse_y, e);
        
        if (e.buttons == 1) {
          _this.mouse_down_x = _this.mouse_down_x || x;
          _this.mouse_down_y = _this.mouse_down_y || y;


          _this.mouse_dx = (x - _this.mouse_down_x);
          _this.mouse_dy = (y - _this.mouse_down_y);
          _this.mouse_drage(_this.mouse_dx, _this.mouse_dy, e);

          _this.mouse_down_x = x;
          _this.mouse_down_y = y;
          _this.mouse_draging = true;

        }        
      });
    }

    proto.set_mouse_ray = function () {
      math.vec3.copy(this.mouse_ray_start, this.entity.ge_camera.world_position);
      this.entity.ge_camera.get_mouse_ray_pos(this.mouse_ray_end, this.mouse_x, this.mouse_y, this.elm_rect.width, this.elm_rect.height);
    };
   
    function ge_mouse_camera_controller(def, en, app, comp) {
      this.entity = en;

      console.log(en);
      this.element = def.element;
      this.wheel_delta = def.wheel_delta || 0.25;

      this.set_mouse_input(this.element);
      this.mouse_camera_ray_pos = math.vec3();
      this.mouse_camera_ray = math.vec3();
      this.on_mouse_down = new ge.event(this,[0,0,null]);
      this.on_mouse_up = new ge.event(this, [0, 0, null]);
      this.on_mouse_drage = new ge.event(this, [0, 0, null]);
      this.on_mouse_wheel = new ge.event(this, [0,  null]);

      this.mouse_ray_start = math.vec3();
      this.mouse_ray_end = math.vec3();

      this.suspended = false;
      if (def.on_mouse_down) {
        this.on_mouse_down.add(def.on_mouse_down);
      }
        
      if (def.on_mouse_up) {
        this.on_mouse_up.add(def.on_mouse_up);
      }

      if (def.on_mouse_drage) {
        this.on_mouse_drage.add(def.on_mouse_drage);
      }
      if (def.on_mouse_wheel) {
        this.on_mouse_wheel.add(def.on_mouse_wheel);
      }
    }

    ge_mouse_camera_controller.validate = function (comp) {
      comp.app.use_system('ge_camera_system');
      comp.app.use_system('ge_render_system');


    };
    return ge_mouse_camera_controller;



  }, ecs.component));


  ecs.register_component('ge_keyboard_camera_controller', fin.define(function (proto, _super) {



    proto.set_keyboard_input = function (elm) {
      var _this = this;    
      _this.keys = [];

      elm.addEventListener('keydown', function (e) {
        _this.keys[e.keyCode] = true;
        _this.shift_key = e.shiftKey;
        _this.key_down = true;
      });

      elm.addEventListener('keyup', function (e) {
        _this.keys[e.keyCode] = false;
        _this.shift_key = e.shiftKey;
        _this.key_down = false;
        
      });

     
    }

    proto.update = function () {      
      if (this.keys[KBD_KEY_W]) {
        if (this.shift_key) {
          this.entity.ge_transform_controller.move_front_back(-this.front_back_delta*4);

        }
        else {
          this.entity.ge_transform_controller.move_front_back(-this.front_back_delta);

        }
        this.entity.ge_transform.require_update = -1;
      }

      if (this.keys[KBD_KEY_S]) {

        if (this.shift_key) {
          this.entity.ge_transform_controller.move_front_back(this.front_back_delta*4);

        }
        else {
          this.entity.ge_transform_controller.move_front_back(this.front_back_delta);


        }
         this.entity.ge_transform.require_update = -1;
      }

      if (this.key_down) {
        if (this.on_key_down) this.on_key_down(this.keys);
      }

    }

   

    function ge_keyboard_camera_controller(def, en, app, comp) {
      this.entity = en;

      console.log(en);
      this.element = def.element;
      this.front_back_delta = def.front_back_delta || 1;
      this.shift_key = false;
      this.set_keyboard_input(this.element);
      this.key_down = false;
      this.on_key_down = def.on_key_down;
    }

    ge_keyboard_camera_controller.validate = function (comp) {
      comp.app.use_system('ge_camera_system');
      comp.app.use_system('ge_render_system');


    };
    return ge_keyboard_camera_controller;



  }, ecs.component));


  ecs.register_system("ge_camera_system", ge.define(function (proto, _super) {
    

    var trans = null, cam = null, entity = null;
    macro_scope$('math.mat4')
    proto.step = function () {

      while ((entity = this.app.iterate_entities("ge_keyboard_camera_controller")) !== null) {
        entity.ge_keyboard_camera_controller.update();
      }

      while ((entity = this.app.iterate_entities("ge_camera")) !== null) {
        cam = entity.ge_camera;
        trans = entity.ge_transform;
        if (cam.update_view_projection === 1) {
          if (cam.type === "perspective") {
            math.mat4.perspective(cam.projection, cam.fov, cam.aspect, cam.near, cam.far);
          }
          else {
            math.mat4.ortho(cam.projection, cam.left, cam.right, cam.bottom, cam.top, cam.near, cam.far);
          }
          math.mat4_inverse$(cam.projection_inverse, cam.projection)
        }

        if (trans.require_update !== 0) {

          ge.version$(cam.version)

          math.mat4_from_quat$(cam.view, trans.rotation_world)

          math.mat4_scale$(cam.view, trans.scale_world)

          cam.view[12] = trans.position_world[0];
          cam.view[13] = trans.position_world[1];
          cam.view[14] = trans.position_world[2];


          cam.update_view_projection = 1;
        }

        if (cam.update_view_projection === 1) {
          ge.version$(cam.version)
          cam.update_view_projection = 0;

          math.mat4_inverse$(cam.view_inverse, cam.view)

          math.mat4_multiply$(cam.view_projection, cam.projection, cam.view_inverse)

          math.mat4_inverse$(cam.view_projection_inverse, cam.view_projection)
          
          if (cam.type === "perspective") {
            
            cam.calc_bounds();
          }
          cam.update_frustum(cam.view_projection);
        }
      }



      

    };

    proto.validate = function (app) {
      this.priority = app.use_system('ge_transform_system').priority + 50;
    };

    function ge_camera_system(def, ecs) {
      _super.apply(this, arguments);

    }

    

    return ge_camera_system;

  }, ecs.system));


}