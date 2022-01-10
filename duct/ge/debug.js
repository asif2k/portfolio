function debug(fin,ecs, ge,math) { 

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
      proto.addtri = function (x0, y0, z0, x1, y1, z1, x2, y2, z2) {

        this.add2(x0, y0, z0, x1, y1, z1);
        this.add2(x1, y1, z1, x2, y2, z2);
        this.add2(x2, y2, z2,x0, y0, z0);


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


      def.max_lines = def.max_lines || 8000;

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


      def.max_triangles = def.max_triangles || 3000;

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
      def.max_boxes = def.max_boxes || 10000;
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




}



