function skeleton_system(fin, ge, ecs, math) {

  ecs.register_component('skeleton_item', fin.define(function (proto, _super) {
    var bind_pos = [];
    proto.add_joint = function (j, i, all_skin_joints) {


      var joint = this.app.create_entity({
        components: {
          'ge_transform': {
            position: j.position || j.pos,
            rotation: j.rotation || j.rot,
            scale: j.scale
          },
        }
      });



      if (j.eular) {
        joint.ge_transform.rotate_eular(j.eular[0], j.eular[1], j.eular[2]);
      }

      Object.assign(joint, {
        name: j.name || ('joint' + i), length: 0, parent: null,
        skin_index: (all_skin_joints ? i : j.skin_index),
      });

      if (j.skin_index !== undefined) joint.skin_index = j.skin_index;
      if (joint.skin_index === undefined) joint.skin_index = -1;




      if (joint.skin_index > -1) {

        joint.bind_transform = joint.bind_transform || math.dquat();
        joint.joint_transform = joint.joint_transform || math.dquat();


        if (j.bind_pos && j.bind_pos.length === 16) {
          joint.set_bind_pos = false;
          math.mat4.copy(bind_pos, j.bind_pos);
          if (def.pre_scale) {
            bind_pos[12] *= def.pre_scale[0];
            bind_pos[13] *= def.pre_scale[1];
            bind_pos[14] *= def.pre_scale[2];
          }



          math.dquat.from_mat4(joint.bind_transform, bind_pos);



        }
        else {
          joint.set_bind_pos = true;
        }



      }




      joint.ge_transform.bind_pos = math.vec3();
      joint.ge_transform.bind_rot = math.quat();
      if (j.pn !== undefined) {
        j.pr = this[j.pn].index;
      }

      if (j.pr === undefined && i > 0) {
        joint.ge_transform.parent = this.joints[i - 1].ge_transform;
        joint.parent = this.joints[i - 1];
      }
      else if (j.pr > -1) {
        joint.ge_transform.parent = this.joints[j.pr].ge_transform;
        joint.parent = this.joints[j.pr];

      }

      joint.index = this.joints.length;
      this[joint.name] = joint;
      this.joints[this.joints.length] = joint;

      if (joint.skin_index > -1) {
        this.skinned_joints[joint.skin_index] = joint;
      }

      return joint;
    };
    function skeleton_item(def, en, app, comp) {
      this.entity = en;
      this.app = app;
      this.skinned_joints = [];
      this.joints = [];
      this.joints_names = [];
      this.display = def.display;
      var self = this;
      this.on_joint_display = def.on_joint_display;

      def.joints.forEach(function (j, i) {
        self.add_joint(j, i, def.all_skin_joints);
      });
      return;
      def.joints.forEach(function (j, i) {
        joint = app.create_entity({
          components: {
            'ge_transform': {
              position: j.position || j.pos,
              rotation: j.rotation || j.rot,
              scale: j.scale,
              scaleable: false,
            },
          }
        });
        if (j.eular) {
          //math.quat.rotate_eular(joint.ge_transform.rotation, j.eular[0], j.eular[1], j.eular[2]);

          joint.ge_transform.rotate_eular(j.eular[0], j.eular[1], j.eular[2]);

        }

        if (def.pre_scale) {
          math.vec3.multiply(joint.ge_transform.position, joint.ge_transform.position, def.pre_scale);



        }

        Object.assign(joint, {
          name: j.name || ('j' + i), length: 0, parent: null,
          skin_index: (def.all_skin_joints ? i : j.skin_index),
          cone: j.cone
        });

        if (j.skin_index !== undefined) joint.skin_index = j.skin_index;
        if (joint.skin_index === undefined) joint.skin_index = -1;

        if (joint.skin_index > -1) {

          joint.bind_transform = joint.bind_transform || math.dquat();
          joint.joint_transform = joint.joint_transform || math.dquat();


          if (j.bind_pos && j.bind_pos.length === 16) {
            joint.set_bind_pos = false;
            math.mat4.copy(bind_pos, j.bind_pos);
            if (def.pre_scale) {
              bind_pos[12] *= def.pre_scale[0];
              bind_pos[13] *= def.pre_scale[1];
              bind_pos[14] *= def.pre_scale[2];
            }



            math.dquat.from_mat4(joint.bind_transform, bind_pos);



          }
          else {
            joint.set_bind_pos = true;
          }



        }


        if (j.pn !== undefined) {
          j.pr = self[j.pn].index;
        }


        if (j.pr === undefined && i > 0) {
          joint.ge_transform.parent = self.joints[i - 1].ge_transform;
          joint.parent = self.joints[i - 1];
        }
        else if (j.pr > -1) {
          joint.ge_transform.parent = self.joints[j.pr].ge_transform;
          joint.parent = self.joints[j.pr];

        }

        joint.index = self.joints.length;
        self[joint.name] = joint;
        self.joints[self.joints.length] = joint;
        self.joints_names.push(joint.name);
        if (joint.skin_index > -1) {
          self.skinned_joints[joint.skin_index] = joint;
        }

      });



      /*
      def.joints.forEach(function (j,i) {
        self.add_joint(j, i, def.all_skin_joints);
      })
      */
      //this.joints[0].ge_transform.parent = en.ge_transform;
    }

    skeleton_item.validate = function (comp) {
      comp.app.use_system('skeleton_system');
    };
    return skeleton_item;



  }, ecs.component));




  ecs.register_system('skeleton_system', fin.define(function (proto, _super) {


    var temp_dquat = math.dquat();
    macro_scope$('math.dquat')

    proto.step = function () {


      var entity, trans, ski, i = 0, joint, joints_changed;
      this.skeletons_count = 0;
      while ((entity = this.app.iterate_entities("skeleton_item")) !== null) {

        ski = entity.skeleton_item;
        trans = entity.ge_transform;
        this.skeletons[this.skeletons_count++] = ski;
        if (!ski.initialized) {
          this.initialize_skeleton(ski);
        }
        joints_changed = false;
        for (i = 0; i < ski.skinned_joints.length; i++) {
          joint = ski.skinned_joints[i];
          if (joint && joint.ge_transform.require_update !== 0) {

            math.dquat_from_quat_pos$(temp_dquat, joint.ge_transform.rotation_world, joint.ge_transform.position_world)

            math.dquat_mult$(joint.joint_transform, temp_dquat, joint.bind_transform)

            joints_changed = true;
          }
        }


      }





    }


    proto.setup_skeleton_display = function (app) {
      var mat = new ge.shading.shaded_material({ ambient: [0.25, 0.25, 0.25] ,wireframe:false});

      mat.shader = mat.shader.extend(`

uniform vec4 u_joint_qr;
uniform vec3 u_bone_start;
uniform vec3 u_bone_end;
<?=chunk('quat-dquat')?>

void vertex(){
  super_vertex();
   v_position_rw=vec4(a_position_rw,1.0);
  float len=length((u_bone_end-u_bone_start));
  v_position_rw.xz*=min(len,1.0);
  v_position_rw.y*=len;
  v_position_rw.xyz=quat_transform(u_joint_qr,v_position_rw.xyz);
  v_position_rw.xyz+=u_bone_start;
  gl_Position=u_view_projection_rw*v_position_rw;

}

`)
      mat.complete_render_mesh = function (renderer, shader, mesh) {
        var s, i, j, ske;
        for (s = 0; s < mesh.sk_system.skeletons_count; s++) {
          ske = mesh.sk_system.skeletons[s];
          if (ske.display) {
            for (i = 0; i < ske.joints.length; i++) {
              j = ske.joints[i];
              /*
              if (j.uuid === mesh.selected_joint) {
                this.set_ambient(1, 0, 0);
              }
              else {
                this.set_ambient(0.5, 0.5, 0.5);

              }
              */
              
              if (j && j.ge_transform.parent) {
               
                shader.set_uniform("u_bone_end", j.ge_transform.position_world);
                shader.set_uniform("u_bone_start", j.ge_transform.parent.position_world);
                shader.set_uniform("u_joint_qr", j.ge_transform.parent.rotation_world);

                if (ske.on_joint_display) {
                  ske.on_joint_display(j,shader, this);
                }
                renderer.gl.drawElements(this.final_draw_type, this.final_draw_count, ge.GL_UNSIGNED_INT, 0);

              }

            }
          }
        }

      }
      mat.flags += ge.SHADING.CAST_SHADOW;

      var geo = ge.geometry.shapes.cube({ width: 3, depth: 3 });

      for (i = 0; i < geo.attributes.a_position_rw.data.length; i += 3) {
        if (geo.attributes.a_position_rw.data[i + 1] > 0.3) {
          geo.attributes.a_position_rw.data[i] *= 0.15;
          geo.attributes.a_position_rw.data[i + 2] *= 0.15;
        }
        
      }
      geo.scale_position_rotation(0.1, 1, 0.1, 0, 0.5, 0, 0, 0, 0);


      var mesh = new ge.geometry.mesh({
        material: mat,
        geometry: geo,
        flags: ge.DISPLAY_ALWAYS
      });
      mesh.sk_system = this;
      app.root.ge_renderable.items.push(mesh);
    }

    proto.initialize_skeleton = function (skeleton) {
      if (skeleton.initialized) return;
      //this.set_zero_pos(skeleton);

      this.set_bind_pos(skeleton);


      skeleton.initialized = true;
    };
    var i = 0, v1 = math.vec3();

    proto.set_bind_pos = function (skeleton) {
      for (i = 0; i < skeleton.joints.length; i++) {
        joint = skeleton.joints[i];     
        if (joint.skin_index > -1 && joint.set_bind_pos) {
          math.dquat.from_quat_pos(joint.bind_transform, joint.ge_transform.rotation_world, joint.ge_transform.position_world);
          math.dquat.invert(joint.bind_transform, joint.bind_transform);
        }
        if (joint.ge_transform.parent !== undefined) {
          math.vec3.subtract(v1, joint.ge_transform.position_world, joint.ge_transform.parent.position_world);
          joint.length = math.vec3.get_length(v1);
        }
        else {
          joint.length = math.vec3.get_length(joint.ge_transform.position_world);
        }
      }
    };

    proto.set_zero_pos = function (skeleton) {
      for (i = 0; i < skeleton.joints.length; i++) {
        joint = skeleton.joints[i];
        joint.set_bind_pos = true;
        if (joint.ge_transform.parent !== undefined) {

          math.vec3_subtract$(joint.transform.position, joint.transform.position_world, joint.transform.parent.position_world)

          joint.ge_transform.rotation[0] = 0;
          joint.ge_transform.rotation[1] = 0;
          joint.ge_transform.rotation[2] = 0;
          joint.ge_transform.rotation[3] = 1;
        }
      }
    };
    
    proto.validate = function (app) {
      this.priority = app.use_system('ge_transform_system').priority + 100;
      this.setup_skeleton_display(app);

    };

    function skeleton_system(def) {
      _super.apply(this, arguments);

      this.skeletons = [];
      this.skeletons_count = 0;

    }

    skeleton_system.mesh = ge.define(function (proto, _super) {

      var skin_material_on_before_render = (function () {
        var qr = math.quat(), qd = math.quat(), qq = null, ske = null, j = null, i = 0;
        return function (renderer, shader, mesh) {
          ske = mesh.skeleton_item;
          for (i = 0; i < ske.skinned_joints.length; i++) {
            j = ske.skinned_joints[i];
            qq = j.joint_transform;
            qr[0] = qq[0];
            qr[1] = qq[1];
            qr[2] = qq[2];
            qr[3] = qq[3];

            qd[0] = qq[4];
            qd[1] = qq[5];
            qd[2] = qq[6];
            qd[3] = qq[7];


            shader.set_uniform("joint_qr[" + i + "]", qr);
            shader.set_uniform("joint_qd[" + i + "]", qd);
          }
        }

      })();
      function skin_shader(mat) {
        if (!mat.shader.skin_shader) {
          mat.shader = mat.shader.extend(glsl["skinned-mesh"]);
          mat.on_before_render.add(skin_material_on_before_render);
          mat.shader.skin_shader = true;
        }
      }

      proto.initialize_item = function () {
        this.item_type = ge.ITEM_TYPES.MESH;

        if (!this.geometry.attributes['a_joints_indices']) {
        //  this.skin_geometry(this.geometry, this.skeleton);
          console.log(skin_geometry);

        }

        skin_shader(this.material);
      };

      function skeleton_system_mesh(def) {
        def = def || {};
        _super.apply(this, [def]);

        this.skeleton_item = def.skeleton_item;

      }


      return skeleton_system_mesh;
    }, ge.renderable);


    skeleton_system.skin_material = function (mat) {


      mat.shader = mat.shader.extend(`
attribute vec4 a_joints_indices;
attribute vec4 a_joints_weights;

uniform vec4 joint_qr[60];
uniform vec4 joint_qd[60];

vec3 dquat_transform(vec4 qr, vec4 qd, vec3 v)
{
   return (v + cross(2.0 * qr.xyz, cross(qr.xyz, v) + qr.w * v))+
	  (2.0 * (qr.w * qd.xyz - qd.w * qr.xyz + cross(qr.xyz, qd.xyz)));
}
vec3 dquat_transform2(vec4 qr, vec4 qd, vec3 v)
{
   return (v + cross(2.0 * qr.xyz, cross(qr.xyz, v) + qr.w * v));
}

vec4 _qr;
vec4 _qd;
vec4 att_position(void){
vec4 pos=super_att_position();
vec4 w=a_joints_weights;
int i0=int(a_joints_indices.x);
int i1=int(a_joints_indices.y);
int i2=int(a_joints_indices.z);
int i3=int(a_joints_indices.w);


vec4 dqr0 = joint_qr[i0];
vec4 dqr1 = joint_qr[i1];
vec4 dqr2 = joint_qr[i2];
vec4 dqr3 = joint_qr[i3];
if (dot(dqr0, dqr1) < 0.0) w.y *= -1.0;
if (dot(dqr0, dqr2) < 0.0) w.z *= -1.0;
if (dot(dqr0, dqr3) < 0.0) w.w *= -1.0;

_qr=w.x*dqr0+w.y*dqr1+w.z*dqr2+w.w*dqr3;
_qd=w.x*joint_qd[i0]+w.y*joint_qd[i1]+w.z*joint_qd[i2]+w.w*joint_qd[i3];
float len =1.0/ length(_qr);
_qr *= len;
_qd *= len;

pos.xyz=dquat_transform(_qr,_qd,pos.xyz);

return pos;

}
vec4 att_normal(void){
    return vec4(dquat_transform2(_qr,_qd,a_normal_rw),0.0);
}

void vertex(){
super_vertex();

v_uv_rw=a_position_rw.xy;
}


`);

      var qr = math.quat(), qd = math.quat(), qq = null, ske = null, j = null, i = 0;
      mat.on_before_render.add(function (renderer, shader, mesh) {

        ske = mesh.skeleton_item;
        for (i = 0; i < ske.skinned_joints.length; i++) {
          j = ske.skinned_joints[i];
          qq = j.joint_transform;
          qr[0] = qq[0];
          qr[1] = qq[1];
          qr[2] = qq[2];
          qr[3] = qq[3];

          qd[0] = qq[4];
          qd[1] = qq[5];
          qd[2] = qq[6];
          qd[3] = qq[7];


          shader.set_uniform("joint_qr[" + i + "]", qr);
          shader.set_uniform("joint_qd[" + i + "]", qd);
        }
      });

      return mat;

    }

    return skeleton_system;



  }, ecs.system));



}