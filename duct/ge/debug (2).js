function debug(fin,ecs, ge,pe,math) { 

  var glsl = ge.webgl.shader.create_chunks_lib(`import('shaders/debug.glsl')`);

  ge.debug = {};

  ge.debug.points = ge.define(function (proto, _super) {

    var mat = new ge.shading.material();

    mat.shader = ge.webgl.shader.parse(glsl["points"]);

    mat.render_mesh = function (renderer, shader, mesh) {
      if (mesh.points_count < 1) return;

      renderer.gl.drawArrays(ge.GL_POINTS, 0, mesh.points_count);
    };


    proto.clear = function () {
      this.points_position.i = 0;
      this.points_count = 0;
    };


    proto.add = (function () {
      var i = 0, _r = 1, _g = 1, _b = 1, _s = 10;
      proto.add_vec3 = function (v, r, g, b, s) {
        _r = r; _g = g; _b = b; _s = s;
        this.add(v[0], v[1], v[2], _r, _g, _b, _s);
      };

      return function (x, y, z, r, g, b, s) {
        _r = r; _g = g; _b = b; _s = s;
        i = this.points_position.i;
        this.points_position.data[i] = x;
        this.points_position.data[i + 1] = y;
        this.points_position.data[i + 2] = z;

        this.points_position.data[i + 3] = r;
        this.points_position.data[i + 4] = g;
        this.points_position.data[i + 5] = b;
        this.points_position.data[i + 6] = s;

        this.points_position.i += 7;

        this.points_position.data_length = this.points_position.i;
        this.points_position.needs_update = true;

        this.points_count = (this.points_position.i / 7);
        this.draw_count = this.points_count;
      }
    })();


    proto.update_bounds = function (mat) { };

    function ge_debug_points(def) {
      def = def || {};
      _super.apply(this, [def]);


      def.max_points = def.max_points || 1000;

      this.geometry = new ge.geometry.geometry_data();

      this.points_position = this.geometry.add_attribute("a_point_position_rw", {
        item_size: 3, data: new Float32Array(def.max_points * 3), stride: 7 * 4
      });
      this.points_color = this.geometry.add_attribute("a_point_color_rw", {
        item_size: 4, stride: 7 * 4, offset: 3 * 4,
      });
      this.points_position.i = 0;
      this.points_count = 0;
      this.material = new ge.shading.material();
      this.material.shader = mat.shader;
      this.material.render_mesh = mat.render_mesh;
      this.draw_offset = 0;
      this.draw_count = this.geometry.num_items;

      this.flags += ge.DISPLAY_ALWAYS;


    }

    return ge_debug_points;
  }, ge.geometry.mesh);




  ge.debug.lines = ge.define(function (proto, _super) {
    var mat = new ge.shading.material();

    mat.shader = ge.webgl.shader.parse(glsl["lines"]);

    mat.render_mesh = function (renderer, shader, mesh) {
      if (mesh.line_count < 1) return;
      renderer.gl.drawArrays(ge.GL_LINES, 0, mesh.line_count);
    };


    proto.clear = function () {
      this.line_position.i = 0;
      this.line_count = 0;
    };


    proto._add = (function () {
      var i = 0;

      proto.set_color = function (r, g, b) {
        this.color[0] = r;
        this.color[1] = g;
        this.color[2] = b;
        return this;
      }

      proto.add_vec3 = function (v0, v1) {
        this._add(
          v0[0], v0[1], v0[2], this.color[0], this.color[1], this.color[2],
          v1[0], v1[1], v1[2], this.color[0], this.color[1], this.color[2]
        );
        return this;
      };

      proto.add2 = function (x0, y0, z0, x1, y1, z1) {
        this._add(
          x0, y0, z0, this.color[0], this.color[1], this.color[2],
          x1, y1, z1, this.color[0], this.color[1], this.color[2]
        )
      };

      return function (x0, y0, z0, r0, g0, b0, x1, y1, z1, r1, g1, b1) {
        i = this.line_position.i;
        this.line_position.data[i] = x0;
        this.line_position.data[i + 1] = y0;
        this.line_position.data[i + 2] = z0;

        this.line_position.data[i + 3] = r0;
        this.line_position.data[i + 4] = g0;
        this.line_position.data[i + 5] = b0;

        this.line_position.data[i + 6] = x1;
        this.line_position.data[i + 7] = y1;
        this.line_position.data[i + 8] = z1;

        this.line_position.data[i + 9] = r1;
        this.line_position.data[i + 10] = g1;
        this.line_position.data[i + 11] = b1;

        this.line_position.i += 12;

        this.line_position.data_length = this.line_position.i;
        this.line_position.needs_update = true;

        this.line_count = (this.line_position.i / 6);
        this.draw_count = this.line_count;
      }
    })();


    proto.update_bounds = function (mat) { };

    function ge_debug_lines(def) {
      def = def || {};
      _super.apply(this, [def]);


      def.max_lines = def.max_lines || 1000;

      this.geometry = new ge.geometry.geometry_data();

      this.line_position = this.geometry.add_attribute("a_line_position_rw", {
        item_size: 3, data: new Float32Array(def.max_lines * 3 * 2), stride: 6 * 4
      });
      this.line_color = this.geometry.add_attribute("a_line_color_rw", {
        item_size: 3, stride: 6 * 4, offset: 3 * 4,
      });
      this.line_position.i = 0;
      this.line_count = 0;
      this.material = mat;
      this.draw_offset = 0;
      this.draw_count = this.geometry.num_items;
      this.color = [1, 1, 1];
      this.flags = ge.DISPLAY_ALWAYS;

    }

    return ge_debug_lines;
  }, ge.geometry.mesh);





  ge.debug.triangles = ge.define(function (proto, _super) {

    var mat = new ge.shading.material({ transparent: 0.5 });

    mat.shader = ge.webgl.shader.parse(glsl["triangles"]);

    mat.render_mesh = function (renderer, shader, mesh) {
      if (mesh.triangle_count < 1) return;
      renderer.gl_disable(ge.GL_CULL_FACE);
      renderer.gl.drawArrays(ge.GL_TRIANGLES, 0, mesh.triangle_count*3);
      renderer.gl_enable(ge.GL_CULL_FACE);
    };


    proto.clear = function () {
      this.triangle_position.i = 0;
      this.triangle_count = 0;
    };


    proto._add = (function () {
      var i = 0;

      proto.set_color = function (r, g, b) {
        this.color[0] = r;
        this.color[1] = g;
        this.color[2] = b;
        return this;
      }

      proto.add_vec3 = function (v0, v1, v2) {
        this._add(
          v0[0], v0[1], v0[2], this.color[0], this.color[1], this.color[2],
          v1[0], v1[1], v1[2], this.color[0], this.color[1], this.color[2],
          v2[0], v2[1], v2[2], this.color[0], this.color[1], this.color[2]
        );
        return this;
      };

      proto.add2 = function (x0, y0, z0, x1, y1, z1, x2, y2, z2) {
        this._add(
          x0, y0, z0, this.color[0], this.color[1], this.color[2],
          x1, y1, z1, this.color[0], this.color[1], this.color[2],
          x2, y2, z2, this.color[0], this.color[1], this.color[2]
        )
      };

      return function (x0, y0, z0, r0, g0, b0, x1, y1, z1, r1, g1, b1, x2, y2, z2, r2, g2, b2) {
        i = this.triangle_position.i;
        this.triangle_position.data[i] = x0;
        this.triangle_position.data[i + 1] = y0;
        this.triangle_position.data[i + 2] = z0;

        this.triangle_position.data[i + 3] = r0;
        this.triangle_position.data[i + 4] = g0;
        this.triangle_position.data[i + 5] = b0;

        this.triangle_position.data[i + 6] = x1;
        this.triangle_position.data[i + 7] = y1;
        this.triangle_position.data[i + 8] = z1;

        this.triangle_position.data[i + 9] = r1;
        this.triangle_position.data[i + 10] = g1;
        this.triangle_position.data[i + 11] = b1;


        this.triangle_position.data[i + 12] = x2;
        this.triangle_position.data[i + 13] = y2;
        this.triangle_position.data[i + 14] = z2;

        this.triangle_position.data[i + 15] = r2;
        this.triangle_position.data[i + 16] = g2;
        this.triangle_position.data[i + 17] = b2;


        this.triangle_position.i += 18;

        this.triangle_position.data_length = this.triangle_position.i;
        this.triangle_position.needs_update = true;

        this.triangle_count = (this.triangle_position.i / 9);
        this.triangle_count = this.triangle_count;
      }
    })();



    proto.update_bounds = function (mat) { };

    function ge_debug_triangles(def) {
      def = def || {};
      _super.apply(this, [def]);


      def.max_triangles = def.max_triangles || 1000;

      this.geometry = new ge.geometry.geometry_data();


      this.triangle_position = this.geometry.add_attribute("a_triangle_position_rw", {
        item_size: 3, data: new Float32Array(def.max_triangles * 3 * 3), stride: 6 * 4
      });
      this.triangle_color = this.geometry.add_attribute("a_triangle_color_rw", {
        item_size: 3, stride: 6 * 4, offset: 3 * 4,
      });
      this.triangle_position.i = 0;
      this.triangle_count = 0;
      this.material = new ge.shading.material();

      this.material.shader = mat.shader;
      this.material.render_mesh = mat.render_mesh;
      this.draw_offset = 0;
      this.draw_count = this.geometry.num_items;
      this.color = [1, 1, 1];
      this.flags = ge.DISPLAY_ALWAYS;


    }

    return ge_debug_triangles;
  }, ge.geometry.mesh);




  ge.debug.aabbs = ge.define(function (proto, _super) {
    var mat = new ge.shading.material({ transparent: 0.5});

    mat.shader = ge.webgl.shader.parse(glsl["aabbs"]);

    mat.render_mesh = function (renderer, shader, mesh) {
      if (mesh.boxes_count < 1) return;
      renderer.gl_enable(ge.GL_DEPTH_TEST);
      renderer.gl.ANGLE_instanced_arrays.drawArraysInstancedANGLE(ge.GL_LINES, 0, mesh.geometry.num_items, mesh.boxes_count);

    };


    proto.update_bounds = function (mat) { };

    proto.clear = function () {
      this.di = 0;
      this.boxes_count = 0;
    };


    proto.add_aabb = (function () {
      var x, y, z, sx, sy, sz

      proto.add_aabb2 = function (minx, miny, minz, maxx, maxy, maxz) {
        sx = maxx - minx;
        sy = maxy - miny;
        sz = maxz - minz;
        x = minx + sx * 0.5;
        y = miny + sy * 0.5;
        z = minz + sz * 0.5;
        this.add(x, y, z, sx, sy, sz);
      }

      return function (b) {
        sx = b[3] - b[0];
        sy = b[4] - b[1];
        sz = b[5] - b[2];
        x = b[0] + sx * 0.5;
        y = b[1] + sy * 0.5;
        z = b[2] + sz * 0.5;

        this.add(x, y, z, sx, sy, sz);
      }
    })();
    proto.add = (function () {
      
      return function (x, y, z, sx, sy, sz) {
       var i = this.di;
        this.boxes_position.data[i] = x;
        this.boxes_position.data[i + 1] = y;
        this.boxes_position.data[i + 2] = z;

        this.boxes_size.data[i] = sx;
        this.boxes_size.data[i + 1] = sy;
        this.boxes_size.data[i + 2] = sz;

        this.boxes_color.data[i] = 1;
        this.boxes_color.data[i + 1] = 0;
        this.boxes_color.data[i + 2] = 0;

        this.di += 3;

        this.boxes_position.data_length = this.di;
        this.boxes_position.needs_update = true;

        this.boxes_size.data_length = this.di;
        this.boxes_size.needs_update = true;

        this.boxes_color.data_length = this.di;
        this.boxes_color.needs_update = true;
        this.boxes_count = this.di / 3;
      }
    })();

    function ge_debug_aabbs(def) {
      def = def || {};
      _super.apply(this, [def]);
      def.max_boxes = def.max_boxes || 1000;
      var geo = ge_debug_aabbs.get_lines_geometry();

      this.boxes_position = geo.add_attribute("a_box_position_rw", {
        item_size: 3, data: new Float32Array(def.max_boxes * 3), divisor: 1,
      });
      this.boxes_size = geo.add_attribute("a_box_size_rw", {
        item_size: 3, data: new Float32Array(def.max_boxes * 3), divisor: 1,
      });

      this.boxes_color = geo.add_attribute("a_box_color_rw", {
        item_size: 3, data: new Float32Array(def.max_boxes * 3), divisor: 1,
      });

      this.geometry = geo;
      this.material = mat;

      this.max_boxes = 0;
      this.di = 0;
      this.box_color = [0.5, 0.5, 0.5];

      this.flags =  ge.DISPLAY_ALWAYS;
      return (this);


    }
    ge_debug_aabbs.get_lines_geometry = function () {
      var b = ge.geometry.geometry_data.lines_builder;
      b.clear();
      b.move_to(-0.5, -0.5, -0.5)
        .add_to(0.5, -0.5, -0.5)
        .add_to(0.5, 0.5, -0.5)
        .add_to(-0.5, 0.5, -0.5)
        .add_to(-0.5, -0.5, -0.5);

      b.move_to(-0.5, -0.5, -0.5).add_to(-0.5, -0.5, 0.5);
      b.move_to(0.5, -0.5, -0.5).add_to(0.5, -0.5, 0.5);

      b.move_to(-0.5, 0.5, -0.5).add_to(-0.5, 0.5, 0.5);
      b.move_to(0.5, 0.5, -0.5).add_to(0.5, 0.5, 0.5);

      b.move_to(-0.5, -0.5, 0.5)
        .add_to(0.5, -0.5, 0.5)
        .add_to(0.5, 0.5, 0.5)
        .add_to(-0.5, 0.5, 0.5)
        .add_to(-0.5, -0.5, 0.5);

      return b.build();
    }


    return ge_debug_aabbs;
  }, ge.geometry.mesh);



  ge.debug.aabbs_solid = ge.define(function (proto, _super) {

    proto.update_bounds = function (mat) { };

    proto.clear = function () {
      this.di = 0;
      this.boxes_count = 0;
    };


    proto.add_aabb = (function () {
      var x, y, z, sx, sy, sz

      proto.add_aabb2 = function (minx, miny, minz, maxx, maxy, maxz) {
        sx = maxx - minx;
        sy = maxy - miny;
        sz = maxz - minz;
        x = minx + sx * 0.5;
        y = miny + sy * 0.5;
        z = minz + sz * 0.5;
        this.add(x, y, z, sx, sy, sz);
      }

      return function (b) {
        sx = b[3] - b[0];
        sy = b[4] - b[1];
        sz = b[5] - b[2];
        x = b[0] + sx * 0.5;
        y = b[1] + sy * 0.5;
        z = b[2] + sz * 0.5;

        this.add(x, y, z, sx, sy, sz);
      }
    })();
    proto.add = (function () {

      return function (x, y, z, sx, sy, sz) {
        var i = this.di;
        this.boxes_position.data[i] = x;
        this.boxes_position.data[i + 1] = y;
        this.boxes_position.data[i + 2] = z;

        this.boxes_size.data[i] = sx;
        this.boxes_size.data[i + 1] = sy;
        this.boxes_size.data[i + 2] = sz;

        this.boxes_color.data[i] = this.box_color[0];
        this.boxes_color.data[i + 1] = this.box_color[1];
        this.boxes_color.data[i + 2] = this.box_color[2];

        this.di += 3;

        this.boxes_position.data_length = this.di;
        this.boxes_position.needs_update = true;

        this.boxes_size.data_length = this.di;
        this.boxes_size.needs_update = true;

        this.boxes_color.data_length = this.di;
        this.boxes_color.needs_update = true;
        this.boxes_count = this.di / 3;
      }
    })();

    proto.set_color = function (r, g, b) {
      this.box_color[0] = r;
      this.box_color[1] = g;
      this.box_color[2] = b;
      return this;
    }


    
    var shader = ge.webgl.shader.parse(glsl["aabbs-solid"]);
    function ge_debug_aabbs_solid(def) {
      def = def || {};
      _super.apply(this, [def]);
      def.max_boxes = def.max_boxes || 1000; 
      var geo = ge.geometry.shapes.cube();


      this.boxes_position = geo.add_attribute("a_box_position_rw", {
        item_size: 3, data: new Float32Array(def.max_boxes * 3), divisor: 1,
      });
      this.boxes_size = geo.add_attribute("a_box_size_rw", {
        item_size: 3, data: new Float32Array(def.max_boxes * 3), divisor: 1,
      });

      this.boxes_color = geo.add_attribute("a_box_color_rw", {
        item_size: 3, data: new Float32Array(def.max_boxes * 3), divisor: 1,
      });

      this.geometry = geo;
      this.material = new ge.shading.material();
      this.material.shader = shader;
      this.draw_count = this.geometry.num_items;
      this.di = 0;
      this.box_color = [0.5, 0.5, 0.5];

      this.flags = ge.DISPLAY_ALWAYS;

      return (this);


    }

    return ge_debug_aabbs_solid;
  }, ge.geometry.mesh);



  ge.debug.physics_sim = ge.define(function (proto, _super) {

    var vec3 = math.vec3, mat = math.mat3, quat = math.quat;
    var ps = {};
    ps.setting = {
      default_friction: 0.4,
      default_restitution: 0.2,
      default_density: 1,
      default_collision_group: 1,
      default_collision_mask: 1,
      max_translation_per_step: 20,
      max_rotation_per_step: 3.14159265358979,
      bvh_proxy_padding: 0.1,
      bvhIncrementalCollisionThreshold: 0.45,
      defaultGJKMargin: 0.05,
      enableGJKCaching: true,
      maxEPAVertices: 128,
      maxEPAPolyhedronFaces: 128,
      contactEnableBounceThreshold: 0.5,
      velocityBaumgarte: 0.2,
      position_split_impulse_baumgarte: 0.4,
      position_ngs_baumgarte: 1.0,
      contactUseAlternativePositionCorrectionAlgorithmDepthThreshold: 0.05,
      defaultContactPositionCorrectionAlgorithm: 0,
      alternativeContactPositionCorrectionAlgorithm: 1,
      contactPersistenceThreshold: 0.05,
      maxManifoldPoints: 4,
      defaultJointConstraintSolverType: 0,
      defaultJointPositionCorrectionAlgorithm: 0,
      jointWarmStartingFactorForBaungarte: 0.8,
      jointWarmStartingFactor: 0.95,
      minSpringDamperDampingRatio: 1e-6,
      minRagdollMaxSwingAngle: 1e-6,
      maxJacobianRows: 6,
      directMlcpSolverEps: 1e-9,
      islandInitialRigidBodyArraySize: 128,
      islandInitialConstraintArraySize: 128,
      sleepingVelocityThreshold: 0.2,
      sleepingAngularVelocityThreshold: 0.5,
      sleepingTimeThreshold: 1.0,
      disableSleeping: false,
      linearSlop: 0.005,
      angularSlop: 0.017453292519943278
    };
    ps.world = ge.define(function (proto) {
      return function ps_world(def) {
        def = def || {};
        this.bodies = [];
      }

    });



    ps.transform = ge.define(function (proto) {
      proto.identify = function () {
        math.vec3.zero(this.position);
        math.mat3.identify(this.rotation);
      };



      return function ps_transform(position,rotation) {
        this.rotation = math.mat3(rotation);
        this.position = math.vec3(position);
        
      }
    });


    ps.geometry = ge.define(function (proto) {

      proto.update_mass = function () {

      }

      return function ps_geometry(def) {
        def = def || {};

        this.inertia_coeff = mat3();
        this.volume = 0;

      }
    });


    ps.box_geometry = ge.define(function (proto,_super) {
      return function ps_box_geometry(def) {
        def = def || {};
        _super.call(this, [def]);
        
      }
    }, ps.geometry);


    ps.sphere_geometry = ge.define(function (proto, _super) {
      proto.update_mass = function () {
        this.volume = 2 / 5 * this.radius * this.radius;
        math.mat3.set_diagonal(this.inertia_coeff, this.volume, this.volume, this.volume);
        this.volume = 4 / 3 * Math.PI * this.radius * this.radius * this.radius;
      }

      return function ps_sphere_geometry(def) {
        def = def || {};
        _super.call(this, [def]);
        this.radius = def.radius || 0.5;
        this.update_mass();
      }
    }, ps.geometry);


    ps.shape= ge.define(function (proto) {
      return function ps_shape(def) {
        def = def || {};
        this.transform = new ps.transform(def.position, def.rotation);
        this.local_transform = new ps.transform(def.position, def.rotation);
        this.pt_transform = new ps.transform(def.position, def.rotation);        


        this.restitution = def.restitution || ps.setting.default_restitution;
        this.friction = def.friction || ps.setting.default_friction;
        this.density = def.density || ps.setting.default_density;
        this.geometry = def.geometry;

      }
    });



    ps.body = ge.define(function (proto) {


      

      proto.apply_translation = function (translation) {
        vec3.add(this.transform.position, this.transform.position, translation);
      };


      proto.update_inv_intertia = function () {
        var __tmp__001, __tmp__011, __tmp__021, __tmp__101, __tmp__111, __tmp__121, __tmp__201, __tmp__211, __tmp__221;
        this.inv_inertia[0] = this.transform.rotation[0] * this.inv_local_inertia[0] + this.transform.rotation[1] * this.inv_local_inertia[3] + this.transform.rotation[2] * this.inv_local_inertia[6];
        this.inv_inertia[1] = this.transform.rotation[0] * this.inv_local_inertia[1] + this.transform.rotation[1] * this.inv_local_inertia[4] + this.transform.rotation[2] * this.inv_local_inertia[7];
        this.inv_inertia[2] = this.transform.rotation[0] * this.inv_local_inertia[2] + this.transform.rotation[1] * this.inv_local_inertia[5] + this.transform.rotation[2] * this.inv_local_inertia[8];
        this.inv_inertia[3] = this.transform.rotation[3] * this.inv_local_inertia[0] + this.transform.rotation[4] * this.inv_local_inertia[3] + this.transform.rotation[5] * this.inv_local_inertia[6];
        this.inv_inertia[4] = this.transform.rotation[3] * this.inv_local_inertia[1] + this.transform.rotation[4] * this.inv_local_inertia[4] + this.transform.rotation[5] * this.inv_local_inertia[7];
        this.inv_inertia[5] = this.transform.rotation[3] * this.inv_local_inertia[2] + this.transform.rotation[4] * this.inv_local_inertia[5] + this.transform.rotation[5] * this.inv_local_inertia[8];
        this.inv_inertia[6] = this.transform.rotation[6] * this.inv_local_inertia[0] + this.transform.rotation[7] * this.inv_local_inertia[3] + this.transform.rotation[8] * this.inv_local_inertia[6];
        this.inv_inertia[7] = this.transform.rotation[6] * this.inv_local_inertia[1] + this.transform.rotation[7] * this.inv_local_inertia[4] + this.transform.rotation[8] * this.inv_local_inertia[7];
        this.inv_inertia[8] = this.transform.rotation[6] * this.inv_local_inertia[2] + this.transform.rotation[7] * this.inv_local_inertia[5] + this.transform.rotation[8] * this.inv_local_inertia[8];



        __tmp__001 = (this.inv_inertia[0] * this.transform.rotation[0] + this.inv_inertia[1] * this.transform.rotation[1] + this.inv_inertia[2] * this.transform.rotation[2]) * this.rot_factor[0];
        __tmp__011 = (this.inv_inertia[0] * this.transform.rotation[3] + this.inv_inertia[1] * this.transform.rotation[4] + this.inv_inertia[2] * this.transform.rotation[5]) * this.rot_factor[0];
        __tmp__021 = (this.inv_inertia[0] * this.transform.rotation[6] + this.inv_inertia[1] * this.transform.rotation[7] + this.inv_inertia[2] * this.transform.rotation[8]) * this.rot_factor[0];

        __tmp__101 = (this.inv_inertia[3] * this.transform.rotation[0] + this.inv_inertia[4] * this.transform.rotation[1] + this.inv_inertia[5] * this.transform.rotation[2]) * this.rot_factor[1];
        __tmp__111 = (this.inv_inertia[3] * this.transform.rotation[3] + this.inv_inertia[4] * this.transform.rotation[4] + this.inv_inertia[5] * this.transform.rotation[5]) * this.rot_factor[1];
        __tmp__121 = (this.inv_inertia[3] * this.transform.rotation[6] + this.inv_inertia[4] * this.transform.rotation[7] + this.inv_inertia[5] * this.transform.rotation[8]) * this.rot_factor[1];

        __tmp__201 = (this.inv_inertia[6] * this.transform.rotation[0] + this.inv_inertia[7] * this.transform.rotation[1] + this.inv_inertia[8] * this.transform.rotation[2]) * this.rot_factor[2];
        __tmp__211 = (this.inv_inertia[6] * this.transform.rotation[3] + this.inv_inertia[7] * this.transform.rotation[4] + this.inv_inertia[8] * this.transform.rotation[5]) * this.rot_factor[2];
        __tmp__221 = (this.inv_inertia[6] * this.transform.rotation[6] + this.inv_inertia[7] * this.transform.rotation[7] + this.inv_inertia[8] * this.transform.rotation[8]) * this.rot_factor[2];

        this.inv_inertia[0] = __tmp__001;
        this.inv_inertia[1] = __tmp__011;
        this.inv_inertia[2] = __tmp__021;
        this.inv_inertia[3] = __tmp__101;
        this.inv_inertia[4] = __tmp__111;
        this.inv_inertia[5] = __tmp__121;
        this.inv_inertia[6] = __tmp__201;
        this.inv_inertia[7] = __tmp__211;
        this.inv_inertia[8] = __tmp__221;
      }

      var sin_axis = vec3(), q = quat(), dq = quat();
      proto.apply_rotation = function (rotation) {

        var theta = vec3.get_length(rotation);
        var half_theta = theta * 0.5;
        var rotation_to_sin_axis_factor = 0;
        var cos_half_theta = 0;

        if (half_theta > 0.5) {
          var ht2 = half_theta * half_theta;
          rotation_to_sin_axis_factor = (1 / 2) * (1 - ht2 * (1 / 6) + ht2 * ht2 * (1 / 120));
          cos_half_theta = 1 - ht2 * (1 / 2) + ht2 * ht2 * (1 / 24);
        }
        else {
          rotation_to_sin_axis_factor = Math.sin(half_theta) / theta;
          cos_half_theta = Math.cos(half_theta);
        }
        vec3.scale(sin_axis, rotation, rotation_to_sin_axis_factor);
        quat.from_vec3_float(dq, sin_axis, cos_half_theta);

        quat.from_mat3(q, this.transform.rotation);
        quat.mult(q, dq, q);
        quat.normalize(q, q);

        mat3.from_quat(this.transform.rotation, q);

      };

      var translation = vec3(), rotation = vec3();

      proto.integrate = function (dt) {


        if (this.type === 1) {
          vec3.scale(translation, this.linear_velocity, dt);
          vec3.scale(rotation, this.angular_velocity, dt);

          var translation_length_sq = vec3.length_sq(translation);
          var rotation_length_sq = vec3.length_sq(rotation);

          if (translation_length_sq == 0 && rotation_length_sq == 0) {
            return; // no need of integration
          }

          var l;
          // limit linear velocity
          if (translation_length_sq > ps.setting.max_translation_per_step * ps.setting.max_translation_per_step) {
            l = ps.setting.max_translation_per_step / Math.sqrt(translation_length_sq);
            vec3.scale(this.linear_velocity, this.linear_velocity, l);
            vec3.scale(translation, translation, l);
          }

          // limit angular velocity
          if (rotation_length_sq > Setting.maxRotationPerStep * Setting.maxRotationPerStep) {
            l = ps.setting.max_rotation_per_step / Math.sqrt(rotation_length_sq);

            vec3.scale(this.angular_velocity, this.angular_velocity, l);
            vec3.scale(rotation, rotation, l);
          }


        }

        
      }

      return function ps_body(def) {
        def = def || {};
        this.shape = def.shape;
        this.transform = new ps.transform(def.position, def.rotation);
        this.pt_transform = new ps.transform(def.position, def.rotation);        
        this.type = def.type || 0;

        this.mass = 0;
        this.inv_mass = 0;

        this.linear_velocity = math.vec3(def.linear_velocity);
        this.angular_velocity = math.vec3(def.angular_velocity);

        this.pseudo_linear_velocity = math.vec3();
        this.pseudo_angular_velocity = math.vec3();


        this.local_intertia = math.mat3();
        this.inv_local_intertia = math.mat3();
        this.inv_local_intertia_without_rot_factor = math.mat3();
        this.inv_intertia = math.mat3();

        this.linear_damping = def.linear_damping;
        this.angular_damping = def.angular_damping;

        this.force = math.vec3();
        this.torque = math.vec3();

        this.rot_factor = math.vec3(1, 1, 1);








      }
    });




    ps.rigid_body = ge.define(function (proto) {





      return function ps_rigid_body(def) {
        def = def || {};
        this.shape = def.shape;
        this.transform = new ps.transform(def.position, def.rotation);
        this.pt_transform = new ps.transform(def.position, def.rotation);
        this.type = def.type || 0;

        this.mass = 0;
        this.inv_mass = 0;

        this.linear_velocity = math.vec3(def.linear_velocity);
        this.angular_velocity = math.vec3(def.angular_velocity);

        this.pseudo_linear_velocity = math.vec3();
        this.pseudo_angular_velocity = math.vec3();


        this.local_intertia = math.mat3();
        this.inv_local_intertia = math.mat3();
        this.inv_local_intertia_without_rot_factor = math.mat3();
        this.inv_intertia = math.mat3();

        this.linear_damping = def.linear_damping;
        this.angular_damping = def.angular_damping;

        this.force = math.vec3();
        this.torque = math.vec3();

        this.rot_factor = math.vec3(1, 1, 1);


      }
    });



    var render_mesh = function (renderer, shader, mesh) {

    };





    proto.update_bounds = function () { };


    function ge_debug_physics_sim(def) {
      def = def || {};
      _super.apply(this, [def]);


      this.geometry = ge.geometry.geometry_data.merge([
        ge.geometry.shapes.sphere(),
        ge.geometry.shapes.cube()
      ]);

      this.material = def.material || (new ge.shading.material());
      this.material.render_mesh = render_mesh;
      this.flags = ge.DISPLAY_ALWAYS;
    }

    return ge_debug_physics_sim;
  }, ge.geometry.mesh);










  ge.debug.physics_sim = ge.define(function (proto, _super) {

    var vec3 = math.vec3, mat = math.mat3, quat = math.quat;

   

    var m4 = math.mat4(), subg = null, mscale = vec3();


    var render_mesh = function (renderer, shader, mesh) {
     
      var b;
      for (var i = 0; i < mesh.bodies.length; i++) {
        b = mesh.bodies[i];        
        if (b.hide) continue;



        b.color = b.color || [Math.random(), Math.random(), Math.random()];

        mesh.on_body(b);
       // math.mat4.from_mat3(m4, b._transform._rotation);
        math.mat4.from_quat(m4, b._transform._quat);

        m4[12] = b._transform._position[0];
        m4[13] = b._transform._position[1];
        m4[14] = b._transform._position[2];

        if (b.shp === 0) {
          mscale[0] = b._shapeList._geom._radius;
          mscale[1] = b._shapeList._geom._radius;
          mscale[2] = b._shapeList._geom._radius;
        }
        else if (b.shp === 1) {
          mscale[0] = b._shapeList._geom._halfExtents[0]*2;
          mscale[1] = b._shapeList._geom._halfExtents[1]*2;
          mscale[2] = b._shapeList._geom._halfExtents[2]*2;
        }

        math.mat4.scale(m4, mscale);
        this.object_material[4] = b.color[0];
        this.object_material[5] = b.color[1];
        this.object_material[6] = b.color[2];               

        shader.set_uniform("u_object_material_rw", this.object_material);
        shader.set_uniform("u_model_rw", m4);

        subg = mesh.geometry.subs[b.shp];
        if (this.wireframe) {
          renderer.gl.drawElements(ge.GL_LINES, subg.i_count*2, ge.GL_UNSIGNED_INT, subg.i_start*2);
        }
        else {
          renderer.gl.drawElements(ge.GL_TRIANGLES, subg.i_count, ge.GL_UNSIGNED_INT, subg.i_start);
        }
        
      }

    };



    proto.on_body = function (b) {

    }


    proto.add_sphere = function (rad,def) {
      def = def || {};
      def.shp = def.shp || {};
      rad = rad || 1;
      def.shapes = [Object.assign({
        geometry: new ge.pe.collision.geometry.SphereGeometry(rad)
      }, def.shp)];

      var body = new ge.pe.dynamics.rigidbody.RigidBody(def);
      body.shp = 0;
      body.hide = def.hide;
      this.pw.addRigidBody(body);
      this.bodies.push(body);

      return body;
    }


    proto.add_box = function (size, def) {
      def = def || {};
      def.shp = def.shp || {};
      def.shapes = [Object.assign({
        geometry: new ge.pe.collision.geometry.BoxGeometry(size || [1,1,1])
      }, def.shp)];

      var body = new ge.pe.dynamics.rigidbody.RigidBody(def);
      body.hide = def.hide;
      body.shp = 1;
      this.pw.addRigidBody(body);
      this.bodies.push(body);

      return body;
    }


    proto.update_bounds = function () { };

    proto.on_render = function () {
      this.pw.step(1 / 60);

    };

    function ge_debug_physics_sim(def) {
      def = def || {};
      _super.apply(this, [def]);

      this.pw = new ge.pe.dynamics.World(null, def.gravity || [0, -6.6, 0]);

      this.bodies = [];
      this.geometry = ge.geometry.geometry_data.merge([
        ge.geometry.shapes.sphere(),
        ge.geometry.shapes.cube({size:1,divs:4})
      ]);

      this.material = def.material || (new ge.shading.shaded_material({ wireframe:true }));
      this.material.complete_render_mesh = render_mesh;
      this.flags = ge.DISPLAY_ALWAYS;
      this.draw_count = this.geometry.num_items;
    }

    return ge_debug_physics_sim;
  }, ge.geometry.mesh);


}



