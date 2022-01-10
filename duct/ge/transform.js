function index(fin, ge, ecs, math) {


  ecs.register_component('ge_transform', fin.define(function (proto,_super) {

    proto.set_position = function (x, y, z) {
      math.vec3.set(this.position, x, y, z);
      this.require_update = 1;
      return this;
    };


    proto.set_scale = function (x, y, z) {
      math.vec3.set(this.scale, x, y, z);
      this.require_update = 1;
      return this;
    };

    proto.rotate_eular = function (x, y, z) {
      math.quat.rotate_eular(this.rotation, x, y, z);
      this.require_update = 1;
      return this;
    };

    var pos = math.vec3(), inv_rot = math.quat();

    proto.drage_to_direction = function (drag_dir, drag_mag) {      
      math.vec3.scale(pos, drag_dir, drag_mag);
      math.quat.invert(inv_rot, this.rotation_world);
      math.vec3.transform_quat(pos, pos, inv_rot);
      math.vec3.add(this.position, this.position, pos);
      this.require_update = 1;
      return this;
    }

    function ge_transform(def, en, app, comp) {
      this.entity = en;
      this.position = math.vec3(def.position);
      this.scale = math.vec3(def.scale || [1, 1, 1]);
      this.rotation = math.quat(def.rotation);
      this.position_world = math.vec3();
      this.scale_world = math.vec3();
      this.rotation_world = math.quat();

      this.animation_data = undefined;

      this.require_update = 1;
      this.parent = undefined;
      this.flags = 0;
      this.version = 0;
        

    }

    ge_transform.validate = function (comp) {
      comp.app.use_system('ge_transform_system');
    };
    return ge_transform;



  }, ecs.component));



  ecs.register_component('ge_transform_controller', fin.define(function (proto, _super) {


    proto.rotate_eular = function (x, y, z) {
      math.quat.rotate_eular(this.transform.rotation, x, y, z);
      this.transform.require_update = 1;
      return (this);
    };
    proto.yaw_pitch = function (dx, dy) {
      this.rotate[0] += dx;
      this.rotate[1] += dy;
      math.quat.rotate_eular(this.transform.rotation, this.rotate[0], this.rotate[1], this.rotate[2]);
      this.transform.require_update = 1;
      return (this);
    };

    proto.set_rotate = function (x, y, z) {
      this.rotate[0] = x;
      this.rotate[1] = y;
      this.rotate[2] = z;
      math.quat.rotate_eular(this.transform.rotation, this.rotate[0], this.rotate[1], this.rotate[2]);
      this.transform.require_update = 1;
      return (this);
    };

    proto.set_position = function (x, y, z) {
      this.transform.position[0] = x;
      this.transform.position[1] = y;
      this.transform.position[2] = z;
      this.transform.require_update = 1;
      return (this);
    };

    proto.set_position_x = function (x) {
      this.transform.position[0] = x;
      this.transform.require_update = 1;
      return (this);
    };
    proto.set_position_y = function (y) {
      this.transform.position[1] = y;
      this.transform.require_update = 1;
      return (this);
    };
    proto.set_position_z = function (z) {
      this.transform.position[2] = z;
      this.transform.require_update = 1;
      return (this);
    };


    proto.set_position_x_inc = function (x) {
      this.transform.position[0] += x;
      this.transform.require_update = 1;
      return (this);
    };
    proto.set_position_y_inc = function (y) {
      this.transform.position[1] += y;
      this.transform.require_update = 1;
      return (this);
    };
    proto.set_position_z_inc = function (z) {
      this.transform.position[2] += z;
      this.transform.require_update = 1;
      return (this);
    };


    proto.move_front_back = function (sp) {

      this.transform.position[0] += this.fw_vector[0] * sp;
      this.transform.position[1] += this.fw_vector[1] * sp;
      this.transform.position[2] += this.fw_vector[2] * sp;
      this.transform.require_update = 1;
      
      return (this);
    };

    proto.move_forward_xz = function (sp) {
      this.transform.position[0] += this.fw_vector[0] * sp;
      this.transform.position[2] += this.fw_vector[2] * sp;
      this.transform.require_update = 1;
      return (this);
    };

    proto.move_forward_xy = function (sp) {
      this.transform.position[0] += this.fw_vector[0] * sp;
      this.transform.position[1] += this.fw_vector[1] * sp;
      this.transform.require_update = 1;
      return (this);
    };

    proto.move_left_right = function (sp) {
      this.transform.position[0] += this.sd_vector[0] * sp;
      this.transform.position[1] += this.sd_vector[1] * sp;
      this.transform.position[2] += this.sd_vector[2] * sp;
      this.transform.require_update = 1;
      return (this);
    };

    proto.move_up_down = function (sp) {
      this.transform.position[0] += this.up_vector[0] * sp;
      this.transform.position[1] += this.up_vector[1] * sp;
      this.transform.position[2] += this.up_vector[2] * sp;
      this.transform.require_update = 1;
      return (this);
    };


    function ge_transform(def, en, app, comp) {
      this.entity = en;
      _super.apply(this, arguments);
      this.rotate = math.vec3(0, 0, 0);
      this.matrix_world = math.mat4();
      this.up_vector = new Float32Array(this.matrix_world.buffer, (4 * 4), 3);
      this.fw_vector = new Float32Array(this.matrix_world.buffer, (8 * 4), 3);
      this.sd_vector = new Float32Array(this.matrix_world.buffer, 0, 3);

      this.transform = en.ge_transform;

      if (def.rotate) {
        math.vec3.copy(this.rotate, def.rotate);
      }
      
      this.rotate_eular(this.rotate[0], this.rotate[1], this.rotate[2]);

      if (def.position) {
        this.set_position(def.position[0], def.position[1], def.position[2]);
      }


    }

    ge_transform.validate = function (comp) {
      comp.app.use_system('ge_transform_system');
    };
    return ge_transform;



  }, ecs.component));




  ecs.register_system('ge_transform_system', fin.define(function (proto, _super) {
  

    var i = 0, trans = null, entity = null, temp_pos = math.vec3(),temp_quat=math.quat(), anim_target = null;
    var local_scale = null, local_rotation = null, local_position = null;
   
    proto.step = function () {
      this.transforms.length = 0;
      i = 0;
      while ((entity = this.app.iterate_entities("ge_transform")) !== null) {
        trans = entity.ge_transform;
        this.transforms[i++] = trans;
        if (trans.flags & ge.TRANS.ANIMATED) {

        }
      }
      this.process(this.transforms, 1);

      while ((entity = this.app.iterate_entities("ge_transform_controller")) !== null) {
        trans = entity.ge_transform_controller;
        this.transforms[i++] = trans;
        if (trans.transform.require_update !== 0) {
          math.mat4.from_quat(trans.matrix_world, trans.transform.rotation_world);
          math.mat4.scale(trans.matrix_world, trans.transform.scale_world);
          trans.matrix_world[12] = trans.transform.position_world[0];
          trans.matrix_world[13] = trans.transform.position_world[1];
          trans.matrix_world[14] = trans.transform.position_world[2];
        }
      }


    };

   
    proto.step_end = function () {
      for (i = 0; i < this.transforms.length; i++) {
        trans = this.transforms[i];
        if (trans.require_update < 0) trans.require_update = Math.abs(trans.require_update);
        else trans.require_update = 0;
      }
    };


    function ge_transform_system() {
      _super.apply(this, arguments);
      this.transforms = [];
      this.priority = 100;    
    }


    ge.create_animation_data = function () {
      var data = new Float32Array(10);
      return {
        data: data,
        position: new Float32Array(data.buffer, 0, 3),
        scale: new Float32Array(data.buffer, 12, 3),
        rotation: new Float32Array(data.buffer, 24, 4)
      };
    };




    var anim_data = ge.create_animation_data();

    macro_scope$('math.quat')
    macro_scope$('math.vec3')

    proto.process = function (transforms, update_flag) {
      for (i = 0; i < transforms.length; i++) {
        trans = transforms[i];

        
        local_scale = trans.scale;
        local_position = trans.position;
        local_rotation = trans.rotation;

        if (trans.animation_data) {
        
          if (trans.animation_data.position) {
            anim_data.position[0] = trans.position[0] + trans.animation_data.position[0];
            anim_data.position[1] = trans.position[1] + trans.animation_data.position[1];
            anim_data.position[2] = trans.position[2] + trans.animation_data.position[2];
            local_position = anim_data.position;
          }

          if (trans.animation_data.scale) {
            anim_data.scale[0] = trans.scale[0] + trans.animation_data.scale[0];
            anim_data.scale[1] = trans.scale[1] + trans.animation_data.scale[1];
            anim_data.scale[2] = trans.scale[2] + trans.animation_data.scale[2];
            local_scale = anim_data.scale;
          }

          if (trans.animation_data.rotation) {
            math.quat_mult$(anim_data.rotation, trans.rotation, trans.animation_data.rotation)
            local_rotation = anim_data.rotation;
          }
          else if (trans.animation_data.eular) {
            math.quat_rotate_eular$(temp_quat, trans.animation_data.eular[0], trans.animation_data.eular[1], trans.animation_data.eular[2])
            math.quat_mult$(anim_data.rotation, trans.rotation, temp_quat)
            local_rotation = anim_data.rotation;
          }
         

          trans.require_update = 1;

        }

        if (trans.parent !== undefined) {

          if (trans.parent.require_update === update_flag || trans.parent.require_update === 100) trans.require_update = update_flag;

          if (trans.require_update === update_flag) {
            math.quat_mult$(trans.rotation_world, trans.parent.rotation_world, local_rotation)

            trans.scale_world[0] = trans.parent.scale_world[0] * local_scale[0];
            trans.scale_world[1] = trans.parent.scale_world[1] * local_scale[1];
            trans.scale_world[2] = trans.parent.scale_world[2] * local_scale[2];
            if (trans.flags & ge.TRANS.SCALABLE) {

              temp_pos[0] = local_position[0] * trans.parent.scale_world[0];
              temp_pos[1] = local_position[1] * trans.parent.scale_world[1];
              temp_pos[2] = local_position[2] * trans.parent.scale_world[2];

              math.vec3_transform_quat$(temp_pos, temp_pos, trans.parent.rotation_world)


            }
            else {

              math.vec3_transform_quat$(temp_pos, local_position, trans.parent.rotation_world)

            }
            trans.position_world[0] = temp_pos[0] + trans.parent.position_world[0];
            trans.position_world[1] = temp_pos[1] + trans.parent.position_world[1];
            trans.position_world[2] = temp_pos[2] + trans.parent.position_world[2];
            ge.version$(trans.version)
          }
        }
        else if (trans.require_update === update_flag) {
          trans.scale_world[0] = local_scale[0];
          trans.scale_world[1] = local_scale[1];
          trans.scale_world[2] = local_scale[2];

          trans.position_world[0] = local_position[0];
          trans.position_world[1] = local_position[1];
          trans.position_world[2] = local_position[2];

          trans.rotation_world[0] = local_rotation[0];
          trans.rotation_world[1] = local_rotation[1];
          trans.rotation_world[2] = local_rotation[2];
          trans.rotation_world[3] = local_rotation[3];

          ge.version$(trans.version)
        }






      }

    };
    
    return ge_transform_system;



  }, ecs.system));

}