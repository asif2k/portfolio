function animation_system(fin, ge, ecs, math) {

  ecs.register_component('animations_player', fin.define(function (proto, _super) {


    function animations_player(def, en, app, comp) {
      this.entity = en;
      this.clock = 0;
      this.animations = def.animations || [];
      this.anim_data = new Float32Array(1024);
    }

    animations_player.validate = function (comp) {
      comp.app.use_system('animation_system');
    };
    return animations_player;



  }, ecs.component));



  ecs.register_system('animation_system', fin.define(function (proto, _super) {

    var bi, block, fr_size, btime, fi, j, pi, f1, f2, frames, fvalues = new Float32Array(4);
    var total_frames, time_per_frame, time1;
    proto.run_animation = function (anim, clock, output) {
      fvalues.fill(0);
      
      for (bi = 0; bi <anim.blocks.length; bi++) {
        block = anim.blocks[bi];


        if (clock >= block.time && clock <= block.time + block.length) {

          btime = (clock - block.time) / block.length;
          frames = block.frames;


          fr_size = block.fr_size || 1;


          if (block.flat) {            
            total_frames = Math.floor(frames.length / fr_size) - 1;
            time_per_frame = 1 / (total_frames);

            f1 = (Math.floor(total_frames * btime));
            f2 = ((f1 + 1) * fr_size);
            time1 = time_per_frame * f1;
            f1 *= fr_size;
            j = (btime - time1) / ((time1 + time_per_frame) - time1);
            fr_size++;
            
            f1 -= 1;
            f2 -= 1;


          }
          else {
            fr_size++;
            for (fi = 0; fi <= frames.length; fi += fr_size) {
              if (fi > 0) {
                if (btime >= j && btime <= frames[fi] + 0.000001) {
                  pi = fi;
                  break;
                }
              }
              j = frames[fi];
            }
            f1 = pi - fr_size;
            f2 = pi;
            j = (btime - frames[f1]) / (frames[f2] - frames[f1]);

          }



          if (fr_size === 2) {
            fvalues[0] = frames[f1 + 1] + (frames[f2 + 1] - frames[f1 + 1]) * j;
          }
          else if (fr_size === 3) {
            fvalues[0] = frames[f1 + 1] + (frames[f2 + 1] - frames[f1 + 1]) * j;
            fvalues[1] = frames[f1 + 2] + (frames[f2 + 2] - frames[f1 + 2]) * j;
          }
          else if (fr_size === 4) {
            fvalues[0] = frames[f1 + 1] + (frames[f2 + 1] - frames[f1 + 1]) * j;
            fvalues[1] = frames[f1 + 2] + (frames[f2 + 2] - frames[f1 + 2]) * j;
            fvalues[2] = frames[f1 + 3] + (frames[f2 + 3] - frames[f1 + 3]) * j;
          }
          else if (fr_size === 5) {
            math.quat.slerp_flat(fvalues,
              frames[f1 + 1], frames[f1 + 2], frames[f1 + 3], frames[f1 + 4],
              frames[f2 + 1], frames[f2 + 2], frames[f2 + 3], frames[f2 + 4],
              j
            );
          }

          for (fi = 0; fi < fr_size - 1; fi++) {
            output[block.oi + fi] += fvalues[fi];
          }
        }
        

      }
    }

    proto.compile_animation = function (anim) {

    }




    proto.step = function () {

      var entity, anims_player, trans, anim, ai = 0;

      while ((entity = this.app.iterate_entities("animations_player")) !== null) {


        trans = entity.ge_transform;
        anims_player = entity.animations_player;

        anims_player.anim_data.fill(0);

        for (ai = 0; ai < anims_player.animations.length; ai++) {
          anim = anims_player.animations[ai];
          anim.duration = anim.duration || 1;

          this.run_animation(anim, anims_player.clock % anim.duration / anim.duration, anims_player.anim_data)
        }


        anims_player.clock += this.app.current_time_delta
      }


    }

    //0,1,2 ,3,4,5,6

    proto.validate = function (app) {
      this.priority = app.use_system('ge_transform_system').priority - 50;
    };

    function animation_system(def) {
      _super.apply(this, arguments);


    }




    return animation_system;



  }, ecs.system));



}