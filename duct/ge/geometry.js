function index(fin, ge,math) { 

  ge.geometry = {
    shapes: {}
  };

  ge.geometry.geometry_data = ge.define(function (proto) {
    function geometry_data() {
      this.compiled = false;
      this.uuid = fin.guidi();
      this.attributes = {};
      this.version = 0;
      this.bounds_sphere = 0;
      this.aabb = math.aabb();
      this.index_buffer = null;
      this.index_data = null;

      return (this);
    }

    proto.set_indices = function (indices) {
      
      if (Object.prototype.toString.call(indices) === "[object Uint16Array]"
        || Object.prototype.toString.call(indices) === "[object Uint32Array]"
      ) {
        this.index_data = indices;
      }
      else this.index_data = geometry_data.create_index_data(indices);
      this.index_needs_update = true;
      this.num_items = this.index_data.length;
    };

    proto.add_attribute = function (name, attribute) {
      attribute.buffer = null;
      attribute.item_size = attribute.item_size || 3;
      attribute.data = attribute.data || null;
      attribute.needs_update = attribute.needs_update || false;
      attribute.divisor = attribute.divisor || 0;
      attribute.array = attribute.array || null;
      attribute.data_offset = attribute.data_offset || 0;
      attribute.data_length = attribute.data_length || 0;
      attribute.buffer_type = attribute.buffer_type || ge.GL_STATIC_DRAW;
      attribute.name = name;
      attribute.geo_id = this.uuid;
      if (attribute.data !== null) {
        attribute.data_length = attribute.data.length;
      }
      this.attributes[name] = attribute;
      return (attribute);
    };

    proto.create_instance_id_attribute = function (max_instances) {
      var att = this.add_attribute("a_instance_id_rw", {
        data: new Float32Array(max_instances),
        item_size: 1,
        divisor: 1
      });
      for (var i = 0; i < att.data.length; i++)
        att.data[i] = i;

    }


    proto.center_pivot = function (sx, sy, sz, rx, ry, rz) {
      var ab = this.aabb;
     

      // this.scale_position_rotation(1, 1, 1, -(ab[0] + width), -(ab[1] + height), -ab[2], 0, 0, 0);

      this.scale_position_rotation(1, 1, 1, -ab[0], -ab[1], -ab[2], 0, 0, 0);
      ab = this.aabb;
      var width = (ab[3] - ab[0]) * 0.5;
      var height = (ab[4] - ab[1]) * 0.5;
      var depth = (ab[5] - ab[2]) * 0.5;


      this.scale_position_rotation(1, 1, 1, -width, -height, -depth, 0, 0, 0);


      this.scale_position_rotation(sx, sy, sz, 0, 0, 0, rx, ry, rz);

      ge.geometry.geometry_data.calc_normals(this);
      //geometry_data.calc_bounds(this, this.attributes.a_position_rw.data, this.attributes.a_position_rw.item_size, true);
    }



    proto.scale_position_rotation = (function () {
      var mat = math.mat4(), quat = math.quat();
      return function (sx, sy, sz, x, y, z, rx, ry, rz, vert_att) {
        vert_att = vert_att || this.attributes["a_position_rw"];
        math.quat.rotate_eular(quat, rx, ry, rz);
        math.mat4.from_quat(mat, quat);

        mat[0] *= sx;
        mat[1] *= sy;
        mat[2] *= sz;

        mat[4] *= sx;
        mat[5] *= sy;
        mat[6] *= sz;

        mat[8] *= sx;
        mat[9] *= sy;
        mat[10] *= sz;

        mat[12] = x;
        mat[13] = y;
        mat[14] = z;

        geometry_data.transform(this, vert_att.data, vert_att.item_size, mat);

        if (this.attributes["a_normal_rw"]) {
          geometry_data.transform(this, this.attributes["a_normal_rw"].data, this.attributes["a_normal_rw"].item_size, mat);
        }

        geometry_data.calc_bounds(this, vert_att.data, vert_att.item_size);
        return this;

      }
    })();

    geometry_data.index_data_type = Uint32Array;
    geometry_data.create_index_data = function (size) {
      return new this.index_data_type(size);
    };

    geometry_data.calc_bounds = (function () {
      var p_min = math.vec3(), p_max = math.vec3();
      geometry_data.transform = function (g, vertices, item_size, mat) {
        for (i = 0; i < vertices.length; i += item_size) {
          math.vec3.transform_mat4x(p_min, vertices[i], vertices[i + 1], vertices[i + 2], mat);
          vertices[i] = p_min[0];
          vertices[i + 1] = p_min[1];
          vertices[i + 2] = p_min[2];


        }
      };



      return function (g, vertices, item_size) {
        g.bounds_sphere = 0;

        math.vec3.set(p_min, Infinity, Infinity, Infinity);
        math.vec3.set(p_max, -Infinity, -Infinity, -Infinity);
        for (i = 0; i < vertices.length; i += item_size) {
          g.bounds_sphere = Math.max(g.bounds_sphere, Math.abs(Math.hypot(vertices[i], vertices[i + 1], vertices[i + 2])));
          p_min[0] = Math.min(p_min[0], vertices[i]);
          p_min[1] = Math.min(p_min[1], vertices[i + 1]);
          p_min[2] = Math.min(p_min[2], vertices[i + 2]);

          p_max[0] = Math.max(p_max[0], vertices[i]);
          p_max[1] = Math.max(p_max[1], vertices[i + 1]);
          p_max[2] = Math.max(p_max[2], vertices[i + 2]);
        }
        
        math.aabb.set(g.aabb, p_min[0], p_min[1], p_min[2], p_max[0], p_max[1], p_max[2]);


        return g.bounds_sphere;

      }
    })();

    geometry_data.calc_normals = (function () {
      var v1 = math.vec3(), v2 = math.vec3(), v3 = math.vec3();
      var v1v2 = math.vec3(), v1v3 = math.vec3(), normal = math.vec3();
      var v2v3Alias = math.vec3(), v2v3Alias = math.vec3();
      var i1, i2, i3;
      var normals;
      geometry_data.invert_normals = function (geo) {
        normals = geo.attributes.a_normal_rw.data;
        for (i1 = 0; i1 < normals.length; i1 += 3) {
          normals[i1] = -normals[i1];
          normals[i1 + 1] = -normals[i1 + 1];
          normals[i1 + 2] = -normals[i1 + 2];
        }
        geo.attributes.needs_update = true;
      };

      return function (geo, flateFaces) {

        var vertices = geo.attributes.a_position_rw.data;

        if (!geo.attributes.a_normal_rw) {
          geo.add_attribute('a_normal_rw', {
            data: new Float32Array(vertices.length)
          });
        }

        normals = geo.attributes.a_normal_rw.data;
        var indices = geo.index_data;

        normals.fill(0);



        var weight1, weight2;
        var total = vertices.length;
        var step = 9;
        if (indices !== null) {
          total = indices.length;
          step = 3;
        }
        for (var j = 0; j < total; j += step) {
          if (indices !== null) {
            i1 = indices[j];
            i2 = indices[j + 1];
            i3 = indices[j + 2];
            math.vec3.set(v1, vertices[i1 * 3], vertices[i1 * 3 + 1], vertices[i1 * 3 + 2]);
            math.vec3.set(v2, vertices[i2 * 3], vertices[i2 * 3 + 1], vertices[i2 * 3 + 2]);
            math.vec3.set(v3, vertices[i3 * 3], vertices[i3 * 3 + 1], vertices[i3 * 3 + 2]);
          }
          else {
            math.vec3.set(v1, vertices[j + 0], vertices[j + 1], vertices[j + 2]);
            math.vec3.set(v2, vertices[j + 3], vertices[j + 4], vertices[j + 5]);
            math.vec3.set(v3, vertices[j + 6], vertices[j + 7], vertices[j + 8]);
          }




          math.vec3.subtract(v1v2, v3, v2);
          math.vec3.subtract(v1v3, v1, v2);





          if (indices !== null) {
            i1 = i1 * 3;
            i2 = i2 * 3;
            i3 = i3 * 3;
          }
          else {
            i1 = j;
            i2 = j + 3;
            i3 = j + 6;
          }

          if (flateFaces) {
            math.vec3.cross(normal, v1v2, v1v3);
            math.vec3.normalize(v1v2, normal);
            normals[i1 + 0] += v1v2[0];
            normals[i1 + 1] += v1v2[1];
            normals[i1 + 2] += v1v2[2];

            normals[i2 + 0] += v1v2[0];
            normals[i2 + 1] += v1v2[1];
            normals[i2 + 2] += v1v2[2];

            normals[i3 + 0] += v1v2[0];
            normals[i3 + 1] += v1v2[1];
            normals[i3 + 2] += v1v2[2];
          }
          else {

            //math.vec3.normalize(v1v2, v1v2);
            //math.vec3.normalize(v1v3, v1v3);
            math.vec3.cross(normal, v1v2, v1v3);
            //math.vec3.normalize(normal, normal);
            math.vec3.copy(v1v2, normal);


            //math.vec3.subtract(v2v3Alias, v3, v2);
            //math.vec3.normalize(v2v3Alias, v2v3Alias);

            //weight1 = Math.acos(Math.max(-1, Math.min(1, math.vec3.dot(v1v2, v1v3))));
            // weight2 = Math.PI - Math.acos(Math.max(-1, Math.min(1, math.vec3.dot(v1v2, v2v3Alias))));
            // math.vec3.scale(v1v2, normal, weight1);
            normals[i1 + 0] += v1v2[0];
            normals[i1 + 1] += v1v2[1];
            normals[i1 + 2] += v1v2[2];
            // math.vec3.scale(v1v2, normal, weight2);
            normals[i2 + 0] += v1v2[0];
            normals[i2 + 1] += v1v2[1];
            normals[i2 + 2] += v1v2[2];
            //  math.vec3.scale(v1v2, normal, Math.PI - weight1 - weight2);
            normals[i3 + 0] += v1v2[0];
            normals[i3 + 1] += v1v2[1];
            normals[i3 + 2] += v1v2[2];
          }




        }

        if (!flateFaces) {

        }
        for (a = 0; a < normals.length; a += 3) {
          math.vec3.set(v1v2, normals[a], normals[a + 1], normals[a + 2]);
          math.vec3.normalize(normal, v1v2);
          normals[a] = normal[0];
          normals[a + 1] = normal[1];
          normals[a + 2] = normal[2];
        }


      }
    })();

    geometry_data.calc_tangents = (function () {
      var n = math.vec3();
      var t = math.vec3();
      var tangent = math.vec4();
      var tn1 = math.vec3();
      var tn2 = math.vec3();
      var sn = math.vec3();
      var sdir = math.vec3();
      var tdir = math.vec3();
      return function (geo) {

        var vertices = geo.attributes.a_position_rw.data;
        var normals = geo.attributes.a_normal_rw.data;
        var tangents = geo.attributes.a_tangent_rw.data;
        var uvs = geo.attributes.a_uv_rw.data;
        var indices = geo.index_data;

        var tan1 = new Float32Array(vertices.length);
        tan1.fill(0);
        var tan2 = new Float32Array(vertices.length);
        tan2.fill(0);


        var i1, i2, i3;
        var v1, v2, v3;

        var x1, x2, y1, y2, z1, z2, w1, w2, w3, s1, s2, t1, t2, r;

        for (var j = 0; j < indices.length; j = j + 3) {
          i1 = indices[j];
          i2 = indices[j + 1];
          i3 = indices[j + 2];

          v1 = i1 * 3;
          v2 = i2 * 3;
          v3 = i3 * 3;

          x1 = vertices[v2] - vertices[v1];
          x2 = vertices[v3] - vertices[v1];
          y1 = vertices[v2 + 1] - vertices[v1 + 1];
          y2 = vertices[v3 + 1] - vertices[v1 + 1];
          z1 = vertices[v2 + 2] - vertices[v1 + 2];
          z2 = vertices[v3 + 2] - vertices[v1 + 2];

          w1 = i1 * 2; w2 = i2 * 2; w3 = i3 * 2;

          s1 = uvs[w2] - uvs[w1];
          s2 = uvs[w3] - uvs[w1];
          t1 = uvs[w2 + 1] - uvs[w1 + 1];
          t2 = uvs[w3 + 1] - uvs[w1 + 1];


          r = 1.0 / (s1 * t2 - s2 * t1);

          math.vec3.set(sdir,
            (t2 * x1 - t1 * x2) * r,
            (t2 * y1 - t1 * y2) * r,
            (t2 * z1 - t1 * z2) * r);
          math.vec3.set(tdir,
            (s1 * x2 - s2 * x1) * r,
            (s1 * y2 - s2 * y1) * r,
            (s1 * z2 - s2 * z1) * r);


          tan1[v1] += sdir[0]; tan1[v1 + 1] += sdir[1]; tan1[v1 + 2] += sdir[2];

          tan1[v2] += sdir[0]; tan1[v2 + 1] += sdir[1]; tan1[v2 + 2] += sdir[2];

          tan1[v3] += sdir[0]; tan1[v3 + 1] += sdir[1]; tan1[v3 + 2] += sdir[2];

          tan2[v1] += tdir[0]; tan2[v1 + 1] += tdir[1]; tan2[v1 + 2] += tdir[2];
          tan2[v2] += tdir[0]; tan2[v2 + 1] += tdir[1]; tan2[v2 + 2] += tdir[2];
          tan2[v3] += tdir[0]; tan2[v3 + 1] += tdir[1]; tan2[v3 + 2] += tdir[2];

        }


        var vi;
        for (var a = 0; a < vertices.length; a = a + 3) {

          vi = a / 3;
          math.vec3.set(n, normals[a], normals[a + 1], normals[a + 2]);
          math.vec3.set(t, tan1[a], tan1[a + 1], tan1[a + 2]);



          // Gram-Schmidt orthogonalize
          //tangent[a] = (t - n * Dot(n, t)).Normalize();

          math.vec3.scale(sn, n, math.vec3.dot(n, t));

          math.vec3.subtract(tn2, t, sn);

          math.vec3.normalize(tangent, tn2);

          math.vec3.cross(tn1, n, t);
          math.vec3.set(tn2, tan2[a], tan2[a + 1], tan2[a + 2]);

          tangent[3] = math.vec3.dot(tn1, tn2) < 0 ? -1 : 1;

          tangents[vi * 4] = tangent[0];
          tangents[vi * 4 + 1] = tangent[1];
          tangents[vi * 4 + 2] = tangent[2];
          tangents[vi * 4 + 3] = tangent[3];

          //tangent[a] = (t - n * Dot(n, t)).Normalize();
          // Calculate handedness
          //tangent[a].w = (Dot(Cross(n, t), tan2[a]) < 0.0F) ? -1.0F : 1.0F;
        }


      }
    })();


    geometry_data.lines_builder = new function () {

      this.vertices = new ge.array();


      var xx, yy, zz;
      var xs, ys, zs;

      this.clear = function () {
        this.vertices.clear();
        return this;
      };

      this.add = function (x, y, z) {
        xx = x; yy = y; zz = z;
        this.vertices.push(x);
        this.vertices.push(y);
        this.vertices.push(z);
        return (this);
      };
      this.add2 = function (x1, y1, z1, x2, y2, z2) {
        this.add(x1, y1, z1);
        this.add(x2, y2, z2);
        return (this);
      };
      this.add_to = function (x, y, z) {
        this.add(xx, yy, zz);
        this.add(x, y, z);
        return (this);
      };

      this.move_to = function (x, y, z) {
        xx = x; yy = y; zz = z;
        xs = x; ys = y; zs = z;
        return (this);
      };

      this.close_path = function () {
        this.add(xx, yy, zz);
        this.vertices.push(xs);
        this.vertices.push(ys);
        this.vertices.push(zs);

        return (this);
      };

      this.update_geo = function (g) {
        var a = g.attributes.a_position_rw;
        for (xx = 0; xx < a.data.length; xx++) {
          a.data[xx] = this.vertices.data[xx];
        }
        a.needs_update = true;
      };
      this.build = function () {
        var g = new ge.geometry.geometry_data();

        g.add_attribute("a_position_rw", {
          data: new Float32Array(this.vertices.length),
          item_size: 3
        });


        for (xx = 0; xx < this.vertices.length; xx++) {
          g.attributes.a_position_rw.data[xx] = this.vertices.data[xx];
        }



        g.num_items = this.vertices.length / 3;
        geometry_data.calc_bounds(g, g.attributes.a_position_rw.data, 3);
        this.clear();
        return (g);
      };

      return (this);
    }

    geometry_data.create = (function () {
      
      return function (def) {


        var vertex_size = def.vertex_size || 3;
        var g = new ge.geometry.geometry_data();

        if (def.vertices) {
          g.add_attribute("a_position_rw", {
            data: def.vertices,
            item_size: vertex_size
          });
          g.num_items = def.vertices.length / vertex_size;
        }

        if (def.normals) {
          g.add_attribute("a_normal_rw", { data: def.normals, item_size: vertex_size});
        }

        if (def.uvs) {
          g.add_attribute("a_uvs_rw", { data: def.uvs, item_size: 2 });
        }

        if (def.colors) {
          g.add_attribute("a_color_rw", { data: def.colors, item_size: 4 });
        }

        if (def.attr) {
          for (var a in def.attr) {
            g.add_attribute(a, def.attr[a]);
          }
        }

        geometry_data.calc_bounds(g, g.attributes.a_position_rw.data, 3);
        return g;
      }
    })();

    
    geometry_data.merge = (function () {

      return function (geos) {

        var att = {}, t, a, i;
        var index_size = 0;
        for (a in geos[0].attributes) {
          t = geos[0].attributes[a];
          att[a] = {
            __size: 0,
            __datas: [],
            item_size: t.item_size,
            divisor: t.divisor,
          };
        }


        var g = new ge.geometry.geometry_data();
        g.subs = [];
        var v_count = 0, v_index = 0;
        geos.forEach(function (geo) {
          if (geo.index_data) {
            index_size += geo.index_data.length;
          }
          for (a in geo.attributes) {
            if (att[a]) {
              att[a].__size += geo.attributes[a].data.length;
              att[a].__datas.push(geo.attributes[a].data);
            }
            if (a === 'a_position_rw') {
              v_count = geo.attributes[a].data.length / geo.attributes[a].item_size;
              g.subs.push({ v_index: v_index, v_count: v_count });
              v_index += v_count;
            }

          }


        });


        var di = 0, gi = 0;
        for (a in att) {
          t = geos[0].attributes[a];
          att[a].data = new Float32Array(att[a].__size);
          di = 0;
          att[a].__datas.forEach(function (d) {
            for (i = 0; i < d.length; i++) {
              att[a].data[di++] = d[i];
            }
          });
          delete att[a].__size;
          delete att[a].__datas;
          g.add_attribute(a, att[a]);
        }
        if (index_size > 0) {
          g.index_data = geometry_data.create_index_data(index_size);
          di = 0;
          gi = 0;
          geos.forEach(function (geo, ii) {
            for (i = 0; i < geo.index_data.length; i++) {
              g.index_data[di++] = g.subs[ii].v_index + geo.index_data[i];
            }
            g.subs[ii].i_start = gi * 4;
            g.subs[ii].i_count = geo.index_data.length;
            gi += geo.index_data.length;
          });
        }

        g.num_items = g.index_data.length;

       // ge.geometry.geometry_data.calc_normals(g);
        return g;



      }

    })();


   

    return geometry_data;

  });



  ge.geometry.shapes.from_gltf = (function () {

    var _gltf = {};

    _gltf.MODE_POINTS = 0; //Mode Constants for GLTF and WebGL are identical
    _gltf.MODE_LINES = 1; //https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
    _gltf.MODE_LINE_LOOP = 2;
    _gltf.MODE_LINE_STRIP = 3;
    _gltf.MODE_TRIANGLES = 4;
    _gltf.MODE_TRIANGLE_STRIP = 5;
    _gltf.MODE_TRIANGLE_FAN = 6;

    _gltf.TYPE_BYTE = 5120;
    _gltf.TYPE_UNSIGNED_BYTE = 5121;
    _gltf.TYPE_SHORT = 5122;
    _gltf.TYPE_UNSIGNED_SHORT = 5123;
    _gltf.TYPE_UNSIGNED_INT = 5125;
    _gltf.TYPE_FLOAT = 5126;

    _gltf.COMP_SCALAR = 1;
    _gltf.COMP_VEC2 = 2;
    _gltf.COMP_VEC3 = 3;
    _gltf.COMP_VEC4 = 4;
    _gltf.COMP_MAT2 = 4;
    _gltf.COMP_MAT3 = 9;
    _gltf.COMP_MAT4 = 16;
    var prepare_buffer = function (json,idx) {
      var buf = json.buffers[idx];

      if (buf.dView != undefined) return buf;

      if (buf.uri.substr(0, 5) != "data:") {
        //TODO Get Bin File
        return buf;
      }

      //Create and Fill DataView with buffer data
      var pos = buf.uri.indexOf("base64,") + 7,
        blob = window.atob(buf.uri.substr(pos)),
        dv = new DataView(new ArrayBuffer(blob.length));
      for (var i = 0; i < blob.length; i++) dv.setUint8(i, blob.charCodeAt(i));
      buf.dView = dv;

      //console.log("buffer len",buf.byteLength,dv.byteLength);
      //var fAry = new Float32Array(blob.length/4);
      //for(var j=0; j < fAry.length; j++) fAry[j] = dv.getFloat32(j*4,true);
      //console.log(fAry);
      return buf;
    }

    var process_accessor = function (json,idx) {

      var a = json.accessors[idx],								//Accessor Alias Ref
        bView = json.bufferViews[a.bufferView],				//bufferView Ref

        buf = prepare_buffer(json,bView.buffer),					//Buffer Data decodes into a ArrayBuffer/DataView
        bOffset = (a.byteOffset || 0) + (bView.byteOffset || 0),	//Starting point for reading.
        bLen = 0,//a.count,//bView.byteLength,									//Byte Length for this Accessor

        TAry = null,												//Type Array Ref
        DFunc = null;												//DateView Function name

      //Figure out which Type Array we need to save the data in
      switch (a.componentType) {
        case _gltf.TYPE_FLOAT: TAry = Float32Array; DFunc = "getFloat32"; break;
        case _gltf.TYPE_SHORT: TAry = Int16Array; DFunc = "getInt16"; break;
        case _gltf.TYPE_UNSIGNED_SHORT: TAry = Uint16Array; DFunc = "getUint16"; break;
        case _gltf.TYPE_UNSIGNED_INT: TAry = Uint32Array; DFunc = "getUint32"; break;
        case _gltf.TYPE_UNSIGNED_BYTE: TAry = Uint8Array; DFunc = "getUint8"; break;

        default: console.log("ERROR processAccessor", "componentType unknown", a.componentType); return null; break;
      }

      //When more then one accessor shares a buffer, The BufferView length is the whole section
      //but that won't work, so you need to calc the partition size of that whole chunk of data
      //The math in the spec about stride doesn't seem to work, it goes over bounds, what Im using works.
      //https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#data-alignment
      if (bView.byteStride != undefined) bLen = bView.byteStride * a.count;
      else bLen = a.count * _gltf["COMP_" + a.type] * TAry.BYTES_PER_ELEMENT; //elmCnt * compCnt * compByteSize)

      //Pull the data out of the dataView based on the Type.
      var bPer = TAry.BYTES_PER_ELEMENT,	//How many Bytes needed to make a single element
        aLen = bLen / bPer,				//Final Array Length
        ary = new TAry(aLen),			//Final Array
        p = 0;						//Starting position in DataView

      for (var i = 0; i < aLen; i++) {
        p = bOffset + i * bPer;
        ary[i] = buf.dView[DFunc](p, true);
      }

      //console.log(a.type,GLTFLoader["COMP_"+a.type],"offset",bOffset, "bLen",bLen, "aLen", aLen, ary);
      return { data: ary, max: a.max, min: a.min, count: a.count, compLen: _gltf["COMP_" + a.type] };
    }




    return function (json) {
      console.log(json);
      var geos = [];
      json.meshes.forEach(function (m) {
        var p, a;
        for (var i = 0; i < m.primitives.length; i++) {
          p = m.primitives[i];
          a = p.attributes;

          itm = {
            mode: p.mode != undefined ? p.mode : _gltf.MODE_TRIANGLES,
            indices: null, //p.indices
            vertices: null, //p.attributes.POSITION = vec3
            normals: null, //p.attributes.NORMAL = vec3
            texcoord: null, //p.attributes.TEXCOORD_0 = vec2
            joints: null, //p.attributes.JOINTS_0 = vec4
            weights: null, //p.attributes.WEIGHTS_0 = vec4
            armature: null
          };

          //Get Raw Data
          itm.vertices = process_accessor(json,a.POSITION);
          if (p.indices != undefined) itm.indices = process_accessor(json,p.indices);
          if (a.NORMAL != undefined) itm.normals = process_accessor(json,a.NORMAL);
          if (a.WEIGHTS_0 != undefined) itm.weights = process_accessor(json,a.WEIGHTS_0);
          if (a.JOINTS_0 != undefined) itm.joints = process_accessor(json,a.JOINTS_0);

          //NOTE : Spec pretty much states that a mesh CAN be made of up multiple objects, but each
          //object in reality is just a mesh with its own vertices and attributes. So each PRIMITIVE
          //is just a single draw call. For fungi I'm not going to build objects like this when
          //I export from mesh, so the first primitive in the mesh is enough for me.

          //May change the approach down the line if there is a need to have a single mesh
          //to be made up of sub meshes.

          console.log(itm);
          var g = ge.geometry.geometry_data.create({
            vertices: itm.vertices.data,
            normals: itm.normals ? itm.normals.data : undefined,

          });

          if (itm.indices) g.set_indices(itm.indices.data);
          geos.push(g);


        }


      });

      return geos;

    }
  })();
  ge.geometry.shapes.cube = function (options) {
    options = options || {};


    options.size = options.size || 1;
    var width = options.width || options.size;
    var height = options.height || options.size;
    var depth = options.depth;

    if (depth === undefined) depth = options.size;
    var divs = options.divs || 1;

    var divs_x = Math.floor(options.divs_x) || divs;
    var divs_y = Math.floor(options.divs_y) || divs;
    var divs_z = Math.floor(options.divs_z) || divs;

    var vector = math.vec3();
    var segmentWidth, segmentHeight, widthHalf, heightHalf, depthHalf;
    var gridX1, gridY1, vertexCounter, ix, iy, x, y;
    var indices = [];
    var vertices = [];
    var normals = [];
    var uvs = [];
    var numberOfVertices = 0;
    function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY) {

      segmentWidth = width / gridX;
      segmentHeight = height / gridY;

      widthHalf = width / 2;
      heightHalf = height / 2;
      depthHalf = depth / 2;

      gridX1 = gridX + 1;
      gridY1 = gridY + 1;

      vertexCounter = 0;

      // generate vertices, normals and uvs

      for (iy = 0; iy < gridY1; iy++) {

        y = iy * segmentHeight - heightHalf;

        for (ix = 0; ix < gridX1; ix++) {

          x = ix * segmentWidth - widthHalf;

          vector[u] = x * udir;
          vector[v] = y * vdir;
          vector[w] = depthHalf;

          vertices.push(vector[0], vector[1], vector[2]);

          vector[u] = 0;
          vector[v] = 0;
          vector[w] = depth > 0 ? 1 : - 1;

          normals.push(vector[0], vector[1], vector[2]);

          // uvs

          uvs.push(ix / gridX);
          uvs.push((iy / gridY));

          // counters

          vertexCounter += 1;

        }

      }

      // indices

      // 1. you need three indices to draw a single face
      // 2. a single segment consists of two faces
      // 3. so we need to generate six (2*3) indices per segment

      for (iy = 0; iy < gridY; iy++) {

        for (ix = 0; ix < gridX; ix++) {

          var a = numberOfVertices + ix + gridX1 * iy;
          var b = numberOfVertices + ix + gridX1 * (iy + 1);
          var c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
          var d = numberOfVertices + (ix + 1) + gridX1 * iy;

          // faces

          indices.push(a, b, d);
          indices.push(b, c, d);


        }

      }

      numberOfVertices += vertexCounter;

    }


    buildPlane(2, 1, 0, - 1, - 1, depth, height, width, divs_z, divs_y, 0); // px
    buildPlane(2, 1, 0, 1, - 1, depth, height, - width, divs_z, divs_y, 1); // nx
    buildPlane(0, 2, 1, 1, 1, width, depth, height, divs_x, divs_z, 2); // py
    buildPlane(0, 2, 1, 1, - 1, width, depth, - height, divs_x, divs_z, 3); // ny
    buildPlane(0, 1, 2, 1, - 1, width, height, depth, divs_x, divs_y, 4); // pz
    buildPlane(0, 1, 2, - 1, - 1, width, height, - depth, divs_x, divs_y, 5); // nz




    var g = new ge.geometry.geometry_data();

    g.add_attribute("a_position_rw", { data: new Float32Array(vertices) });
    g.add_attribute("a_normal_rw", { data: new Float32Array(normals) });
    g.add_attribute("a_uv_rw", { data: new Float32Array(uvs), item_size: 2 });
    g.add_attribute("a_tangent_rw", { data: new Float32Array(((vertices.length / 3) * 4)), item_size: 4 });
    g.set_indices(indices);
    g.shape_type = "cube";


    ge.geometry.geometry_data.calc_tangents(g);
    ge.geometry.geometry_data.calc_bounds(g, g.attributes.a_position_rw.data, 3);

    return (g);
  };

  ge.geometry.shapes.plane = function (options) {
    options = options || {};
    options.size = options.size || 1;

    width = options.width || options.size;
    height = options.height || options.size;
    options.divs = options.divs || 1;
    options.divsX = options.divsX || options.divs;
    options.divsY = options.divsY || options.divs;
    divs_x = options.divsX;
    divs_y = options.divsY;

    var width_half = width / 2;
    var height_half = height / 2;

    var gridX = Math.floor(divs_x);
    var gridY = Math.floor(divs_y);

    var gridX1 = gridX + 1;
    var gridY1 = gridY + 1;

    var segment_width = width / gridX;
    var segment_height = height / gridY;

    var ix, iy;
    var vCount = (divs_x + 1) * (divs_y + 1);
    var g = new ge.geometry.geometry_data();



    g.add_attribute("a_position_rw", { data: new Float32Array(vCount * 3), item_size: 3 });
    var normals = null, uvs = null;
    g.add_attribute("a_normal_rw", { data: new Float32Array(vCount * 3), item_size: 3 });
    normals = g.attributes.a_normal_rw.data;
    g.add_attribute("a_uv_rw", { data: new Float32Array(vCount * 2), item_size: 2 });
    uvs = g.attributes.a_uv_rw.data;
    g.add_attribute("a_tangent_rw", { data: new Float32Array(vCount * 4), item_size: 4 });




    g.index_data = ge.geometry.geometry_data.create_index_data((gridX * gridY) * 6);
    g.index_needs_update = true;
    g.num_items = g.index_data.length;
    g.shape_type = "plane";

    var positions = g.attributes.a_position_rw.data;


    var indices = g.index_data;
    var ii = 0, vi = 0;


    for (iy = 0; iy < gridY1; iy++) {
      var y = iy * segment_height - height_half;
      for (ix = 0; ix < gridX1; ix++) {
        var x = ix * segment_width - width_half;

        positions[(vi * 3) + 0] = x;
        positions[(vi * 3) + 1] = -y;
        positions[(vi * 3) + 2] = 0;

        if (normals !== null) {

          normals[(vi * 3) + 0] = 0;
          normals[(vi * 3) + 1] = 0;
          normals[(vi * 3) + 2] = 1;
        }

        if (uvs !== null) {
          uvs[(vi * 2) + 0] = ix / gridX;
          uvs[(vi * 2) + 1] = 1 - (iy / gridY);
        }


        vi++;
      }

    }
    ii = 0;
    var a, b, c, d;

    for (iy = 0; iy < gridY; iy++) {
      for (ix = 0; ix < gridX; ix++) {
        a = ix + gridX1 * iy;
        b = ix + gridX1 * (iy + 1);
        c = (ix + 1) + gridX1 * (iy + 1);
        d = (ix + 1) + gridX1 * iy;
        // faces
        indices[ii++] = a; indices[ii++] = b; indices[ii++] = d;
        indices[ii++] = b; indices[ii++] = c; indices[ii++] = d;
      }

    }

    ge.geometry.geometry_data.calc_tangents(g);

    ge.geometry.geometry_data.calc_bounds(g, g.attributes.a_position_rw.data, 3);



    return (g);
  };

  ge.geometry.shapes.sphere = (function () {
    var norm = math.vec3();
    var vert = math.vec3();
    return function (options) {
      options = options || {};
      options.rad = options.rad || 1;
      options.divs = options.divs || 8;
      options.divsX = options.divsX || options.divs;
      options.divsY = options.divsY || options.divs;


      var radX = options.radX || options.rad;
      var radY = options.radY || options.rad;
      var radZ = options.radZ || options.rad;

      var widthSegments = Math.max(3, Math.floor(options.divsX));
      var heightSegments = Math.max(2, Math.floor(options.divsY));

      var phiStart = options.phiStart !== undefined ? options.phiStart : 0;
      var phiLength = options.phiLength !== undefined ? options.phiLength : Math.PI * 2;

      var thetaStart = options.thetaStart !== undefined ? options.thetaStart : 0;
      var thetaLength = options.thetaLength !== undefined ? options.thetaLength : Math.PI;

      var thetaEnd = thetaStart + thetaLength;

      var ix, iy;

      var index = 0;
      var grid = [];


      var vCount = (widthSegments + 1) * (heightSegments + 1);
      var g = new ge.geometry.geometry_data();


      g.add_attribute("a_position_rw", { data: new Float32Array(vCount * 3), item_size: 3 });
      var normals = null, uvs = null;
      g.add_attribute("a_normal_rw", { data: new Float32Array(vCount * 3), item_size: 3 });
      normals = g.attributes.a_normal_rw.data;

      g.add_attribute("a_uv_rw", { data: new Float32Array(vCount * 2), item_size: 2 });
      uvs = g.attributes.a_uv_rw.data;


      g.add_attribute("a_tangent_rw", { data: new Float32Array(vCount * 4), item_size: 4 });




      g.index_data = ge.geometry.geometry_data.create_index_data(vCount * 6);
      g.num_items = g.index_data.length;
      g.index_needs_update = true;

      g.shape_type = "sphere";
      var positions = g.attributes.a_position_rw.data;


      var indices = g.index_data;
      var ii = 0, vi = 0;



      for (iy = 0; iy <= heightSegments; iy++) {

        var verticesRow = [];

        var v = iy / heightSegments;
        //
        // special case for the poles

        var uOffset = (iy == 0) ? 0.5 / widthSegments : ((iy == heightSegments) ? - 0.5 / widthSegments : 0);

        for (ix = 0; ix <= widthSegments; ix++) {

          var u = ix / widthSegments;

          vert[0] = - radX * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
          vert[1] = radY * Math.cos(thetaStart + v * thetaLength);
          vert[2] = radZ * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);


          positions[(vi * 3) + 0] = vert[0];
          positions[(vi * 3) + 1] = vert[1];
          positions[(vi * 3) + 2] = vert[2];

          if (normals !== null) {
            math.vec3.normalize(norm, vert);
            normals[(vi * 3) + 0] = norm[0];
            normals[(vi * 3) + 1] = norm[1];
            normals[(vi * 3) + 2] = norm[2];
          }

          if (uvs !== null) {
            uvs[(vi * 2) + 0] = u + uOffset;
            uvs[(vi * 2) + 1] = 1 - v;
          }



          vi++;

          verticesRow.push(index++);

        }

        grid.push(verticesRow);

      }
      ii = 0;
      for (iy = 0; iy < heightSegments; iy++) {
        for (ix = 0; ix < widthSegments; ix++) {
          var a = grid[iy][ix + 1];
          var b = grid[iy][ix];
          var c = grid[iy + 1][ix];
          var d = grid[iy + 1][ix + 1];

          if (iy !== 0 || thetaStart > 0) {
            indices[ii++] = a; indices[ii++] = b; indices[ii++] = d;
          }
          if (iy !== heightSegments - 1 || thetaEnd < Math.PI) {
            indices[ii++] = b; indices[ii++] = c; indices[ii++] = d;
          }

        }

      }
      ge.geometry.geometry_data.calc_tangents(g);
      ge.geometry.geometry_data.calc_bounds(g, g.attributes.a_position_rw.data, 3);
      return (g);

    }
  })();


  ge.geometry.shapes.terrain = (function () {
    var vkey, vindex_width = 1200;

    var vmap = new Uint8Array(0), vdata = new Float32Array(0);

    var patches = {};


    var vindex_width2 = vindex_width / 2;
    var check_vlevel_value = 0, vkey;
    function check_vlevel(x, z) {
      check_vlevel_value = vmap[(z + vindex_width2) * vindex_width + (x + vindex_width2)];
      return check_vlevel_value;
    };

    var region_size = 1024;
    var s = 1;
    while (s <= region_size) {
      patches[s] = { i: 0, list: [] };
      s = s * 2;
    }

    vindex_width = (region_size * 2) + 8;
    vindex_width2 = vindex_width / 2;

    vkey = vindex_width * vindex_width;
    if (vmap.length < vkey) {
      vmap = new Uint8Array(vkey)
      vdata = new Float32Array(vkey * 4);
    }

    function set_vlevel(x, z, l) {
      vkey = (z + vindex_width2) * vindex_width + (x + vindex_width2);
      vmap[vkey] = Math.min(vmap[vkey], l);
    }

    var output = new Float32Array(100000 * 6), oi = 0, qii = 0;
    var GQT = new Float32Array(100000 * 2);

    var hh0, hh1, hh2, hh3, hh4;
    var hdata, data_size, data_size2;
    var MIN_PATCH_SIZE = 4;
    var PATCH_SIZE = 16;
    var MIN_FAN_DETAIL = 2;
    function H(xp, zp) {
      return hdata[zp * (data_size) + xp];
    }

    var draw_triangle = function (x0$, z0$, x1$, z1$, x2$, z2$, s$) {
      set_vlevel(x0$, z0$, s$)
      output[oi] = x0$;
      output[oi + 2] = z0$;
      oi += 6;

      set_vlevel(x1$, z1$, s$)
      output[oi] = x1$;
      output[oi + 2] = z1$;
      oi += 6;

      set_vlevel(x2$, z2$, s$)
      output[oi] = x2$;
      output[oi + 2] = z2$;
      oi += 6;


    };


    var draw_fan = (function () {

      var fi = 0, lfx, lfz, fx, fz;

      var fan = [
        -1, 1, -0.75, 1, -0.5, 1, -0.25, 1, 0, 1, 0.25, 1, 0.5, 1, 0.75, 1, 1, 1,
        1, 0.75, 1, 0.5, 1, 0.25, 1, 0, 1, -0.25, 1, -0.5, 1, -0.75, 1, -1,
        0.75, -1, 0.5, -1, 0.25, -1, 0, -1, -0.25, -1, -0.5, -1, -0.75, -1, -1, -1,
        -1, -0.75, -1, -0.5, -1, -0.25, -1, 0, -1, 0.25, -1, 0.5, -1, 0.75, -1, 1
      ];

      var skip_edge_check = [];
      skip_edge_check[16] = true; skip_edge_check[32] = true; skip_edge_check[48] = true; skip_edge_check[64] = true;

      var fan_len = fan.length;
      return function (x, z, s, fd) {
        lfx = fan[0];
        lfz = fan[1];
        fi = fd;
        while (fi < fan_len) {
          fx = fan[fi]; fz = fan[fi + 1];

          check_vlevel_value = vmap[((z + fz * s) + vindex_width2) * vindex_width + ((x + fx * s) + vindex_width2)];
          if (skip_edge_check[fi] || check_vlevel_value < s) {
            draw_triangle(x, z, x + lfx * s, z + lfz * s, x + fx * s, z + fz * s, s)
            lfx = fx; lfz = fz;
          }
          fi += fd;
        }
      }
    })();


    function eval_area_height(x, z, s, pndx, slot) {

      hh0 = H(x, z);
      hh1 = H(x - s, z - s);
      hh2 = H(x + s, z - s);
      hh3 = H(x + s, z + s);
      hh4 = H(x - s, z + s);


      var indx = qii;

      output[indx] = Math.max(
        Math.abs(((hh1 + hh2) * 0.5) - hh0), Math.abs(((hh4 + hh3) * 0.5) - hh0), Math.abs(((hh1 + hh4) * 0.5) - hh0), Math.abs(((hh2 + hh3) * 0.5) - hh0)
      );

      if (pndx > -1) {
        output[pndx + slot] = indx;
      }

      if (s > MIN_PATCH_SIZE) {
        qii += 5;
        s *= 0.5;
        output[indx] = Math.max(
          output[indx],
          eval_area_height(x - s, z - s, s, indx, 1),
          eval_area_height(x + s, z - s, s, indx, 2),
          eval_area_height(x - s, z + s, s, indx, 3),
          eval_area_height(x + s, z + s, s, indx, 4));
      }

      return output[indx];
    }

    var _RSK = new Float32Array(1024), _si = 0, i = 0;
    var dd = 0, dlen = 0;
    function rasterize_patch(x, z, s, detail, rg_QT) {
      _si = 0;
      var i = 0;
      _RSK[_si] = x; _RSK[_si + 1] = z; _RSK[_si + 2] = s; _RSK[_si + 3] = i; _si += 4;

      while (_si > 0) {
        _si -= 4;
        x = _RSK[_si]; z = _RSK[_si + 1]; s = _RSK[_si + 2]; i = _RSK[_si + 3];
        dd = detail;

        if (s > PATCH_SIZE || (s > MIN_PATCH_SIZE && rg_QT[i] > dd)) {
          s *= 0.5;
          _RSK[_si] = x + s; _RSK[_si + 1] = z + s; _RSK[_si + 2] = s; _RSK[_si + 3] = rg_QT[i + 4]; _si += 4;
          _RSK[_si] = x - s; _RSK[_si + 1] = z + s; _RSK[_si + 2] = s; _RSK[_si + 3] = rg_QT[i + 3]; _si += 4;
          _RSK[_si] = x + s; _RSK[_si + 1] = z - s; _RSK[_si + 2] = s; _RSK[_si + 3] = rg_QT[i + 2]; _si += 4;
          _RSK[_si] = x - s; _RSK[_si + 1] = z - s; _RSK[_si + 2] = s; _RSK[_si + 3] = rg_QT[i + 1]; _si += 4;
        }
        else {
          p = patches[s];
          p.list[p.i++] = x;
          p.list[p.i++] = z;
        }
      }
    }

    var patch_index = 0;
    var check_for_edge_cases = true;
    var check_edge_cases = false;
    function render_patches() {
      s = MIN_PATCH_SIZE;
      check_edge_cases = false;
      patch_index = 0;
      while (s <= PATCH_SIZE) {
        p = patches[s];

        i = 0;
        j = p.i;
        while (i < j) {

          x = p.list[i++];
          z = p.list[i++];
          fd = 16;

          if (check_for_edge_cases) {
            if (s >= MIN_PATCH_SIZE) {
              check_edge_cases = false;

              if (check_vlevel(x - s, z) < s) {
                check_edge_cases = true;
              }
              else if (check_vlevel(x + s, z) < s) {
                check_edge_cases = true;
              }
              else if (check_vlevel(x, z - s) < s) {
                check_edge_cases = true;
              }
              else if (check_vlevel(x, z + s) < s) {
                check_edge_cases = true;
              }


              if (check_edge_cases) {

                fd = (s / check_vlevel_value);
                if (fd < 16) {
                  fd = Math.max(2, 8 / fd);
                }
                else fd = 2;

                fd = Math.min(MIN_FAN_DETAIL, fd);

              }

            }

          }
          draw_fan(x, z, s, fd);
          patch_index++;
        }
        s = s * 2;
      }

    }


    function calculate_output_data(is, ie, xo, zo, sc) {
      i = is;
      s = PATCH_SIZE;
      while (i < ie) {
        x = output[i]
        z = output[i + 2];
        _xx = (x * sc) + xo;
        _zz = (z * sc) + zo;
        vkey = (_zz + vindex_width2) * vindex_width + (_xx + vindex_width2);
        if (vmap[vkey] !== 222) {
          vmap[vkey] = 222;
          vkey *= 4;
          vdata[vkey] = H(x, z);

          nx = (H(x - s, z) - H(x + s, z));
          ny = (s * 2);
          nz = (H(x, z - s) - H(x, z + s));

          _fp = nx * nx + ny * ny + nz * nz;
          if (_fp > 0) _fp = 1 / Math.sqrt(_fp);
          nx *= _fp;
          ny *= _fp;
          nz *= _fp;

          vdata[vkey + 1] = nx;
          vdata[vkey + 2] = ny;
          vdata[vkey + 3] = nz;
        }
        else {
          vkey *= 4;
        }

        output[i + 1] = vdata[vkey];
        output[i + 3] = vdata[vkey + 1];
        output[i + 4] = vdata[vkey + 2];
        output[i + 5] = vdata[vkey + 3];


        output[i] = _xx;
        output[i + 2] = _zz;



        i += 6;
      }




    }


    function process(g, data,dsize,details) {

      hdata = data;
      data_size = dsize;
      data_size2 = data_size / 2;

      qii = 0;
      eval_area_height(data_size2, data_size2, data_size2, -1, 0);


      i = 0;

      while (i < qii) { GQT[i] = output[i++]; }
      oi = 0;
      vmap.fill(255);


      rasterize_patch(data_size2, data_size2, data_size2, details, GQT);
      render_patches();

      calculate_output_data(0, oi, 0, 0, 1);
      var position = g.attributes.a_position_rw;
      position.data = new Float32Array((oi / 6) * 8);

      var ii = 0;
      for (i = 0; i < oi; i += 6) {
        position.data[ii] = output[i];
        position.data[ii + 1] = output[i + 1];
        position.data[ii + 2] = output[i + 2];
        position.data[ii + 3] = output[i + 3];
        position.data[ii + 4] = output[i + 4];
        position.data[ii + 5] = output[i + 5];

        position.data[ii + 6] = position.data[ii] / data_size;
        position.data[ii + 7] = position.data[ii + 2] / data_size;

        ii += 8;
      }
      g.num_items = ii / 8;
      position.data_length = ii;
      position.needs_update = true;
      ge.geometry.geometry_data.calc_bounds(g, position.data, 8);
    }

    return function (def) {

      var g = new ge.geometry.geometry_data();


       g.add_attribute("a_position_rw", {
        item_size: 3, data: new Float32Array(0), stride: 8 * 4
      });

      g.add_attribute("a_normal_rw", {
        item_size: 3, stride: 8 * 4, offset: 3 * 4,
      });

      g.add_attribute("a_uv_rw", {
        item_size: 2, stride: 8 * 4, offset: 6 * 4,
      });


      
      if (def.url) {
        var divisor = def.divisor || 1;
        ge.load_working_image_data(def.url, function (image_data, width, height) {
          var data = new Float32Array((def.size + 1) * (def.size + 1));
          for (var i = 0; i < image_data.length / 4; i++) {
            data[i] = image_data[i * 4] / divisor;
          }
          process(g, data, def.size, def.details || 4);

        }, def.size, def.size);
      }
      

      return (g);

    }
  })();


  ge.geometry.shapes.from_obj = (function () {

    var min = new Float32Array(3), max = new Float32Array(3);
    var _readLine = function (a, off)	// Uint8Array, offset
    {
      var s = "";
      while (a[off] != 10) s += String.fromCharCode(a[off++]);
      return s;
    }
    return function (buff){
      var res = {};
      res.groups = {};

      res.c_verts = [];
      res.c_uvt = [];
      res.c_norms = [];

      res.i_verts = [];
      res.i_uvt = [];
      res.i_norms = [];

      var cg = { from: 0, to: 0 };	// current group
      var off = 0;
      var a = new Uint8Array(buff);

      while (off < a.length) {
        var line = _readLine(a, off);
        off += line.length + 1;
        line = line.replace(/ +(?= )/g, '');
        line = line.replace(/(^\s+|\s+$)/g, '');
        var cds = line.split(" ");
        if (cds[0] == "g") {
          cg.to = res.i_verts.length;
          if (res.groups[cds[1]] == null) res.groups[cds[1]] = { from: res.i_verts.length, to: 0 };
          cg = res.groups[cds[1]];
        }
        if (cds[0] == "v") {
          var x = parseFloat(cds[1]);
          var y = parseFloat(cds[2]);
          var z = parseFloat(cds[3]);
          res.c_verts.push(x, y, z);
        }
        if (cds[0] == "vt") {
          var x = parseFloat(cds[1]);
          var y = 1 - parseFloat(cds[2]);
          res.c_uvt.push(x, y);
        }
        if (cds[0] == "vn") {
          var x = parseFloat(cds[1]);
          var y = parseFloat(cds[2]);
          var z = parseFloat(cds[3]);
          res.c_norms.push(x, y, z);
        }
        if (cds[0] == "f") {
          var v0a = cds[1].split("/"), v1a = cds[2].split("/"), v2a = cds[3].split("/");
          var vi0 = parseInt(v0a[0]) - 1, vi1 = parseInt(v1a[0]) - 1, vi2 = parseInt(v2a[0]) - 1;
          var ui0 = parseInt(v0a[1]) - 1, ui1 = parseInt(v1a[1]) - 1, ui2 = parseInt(v2a[1]) - 1;
          var ni0 = parseInt(v0a[2]) - 1, ni1 = parseInt(v1a[2]) - 1, ni2 = parseInt(v2a[2]) - 1;

          var vlen = res.c_verts.length / 3, ulen = res.c_uvt.length / 2, nlen = res.c_norms.length / 3;
          if (vi0 < 0) vi0 = vlen + vi0 + 1; if (vi1 < 0) vi1 = vlen + vi1 + 1; if (vi2 < 0) vi2 = vlen + vi2 + 1;
          if (ui0 < 0) ui0 = ulen + ui0 + 1; if (ui1 < 0) ui1 = ulen + ui1 + 1; if (ui2 < 0) ui2 = ulen + ui2 + 1;
          if (ni0 < 0) ni0 = nlen + ni0 + 1; if (ni1 < 0) ni1 = nlen + ni1 + 1; if (ni2 < 0) ni2 = nlen + ni2 + 1;

          res.i_verts.push(vi0, vi1, vi2);  //cg.i_verts.push(vi0, vi1, vi2)
          res.i_uvt.push(ui0, ui1, ui2);  //cg.i_uvt  .push(ui0, ui1, ui2);
          res.i_norms.push(ni0, ni1, ni2);  //cg.i_norms.push(ni0, ni1, ni2);
          if (cds.length == 5) {
            var v3a = cds[4].split("/");
            var vi3 = parseInt(v3a[0]) - 1, ui3 = parseInt(v3a[1]) - 1, ni3 = parseInt(v3a[2]) - 1;
            if (vi3 < 0) vi3 = vlen + vi3 + 1;
            if (ui3 < 0) ui3 = ulen + ui3 + 1;
            if (ni3 < 0) ni3 = nlen + ni3 + 1;
            res.i_verts.push(vi0, vi2, vi3);  //cg.i_verts.push(vi0, vi2, vi3);
            res.i_uvt.push(ui0, ui2, ui3);  //cg.i_uvt  .push(ui0, ui2, ui3);
            res.i_norms.push(ni0, ni2, ni3);  //cg.i_norms.push(ni0, ni2, ni3);
          }
        }
      }
      cg.to = res.i_verts.length;

      console.log(res);

      var g = ge.geometry.geometry_data.create({
        vertices: new Float32Array(res.c_verts),
        normals1: new Float32Array(res.c_norms),
      });
      g.set_indices(res.i_verts);
      ge.geometry.geometry_data.calc_normals(g);

      
      // ge.geometry.geometry_data.calc_tangents(g);
        ge.geometry.geometry_data.calc_bounds(g, g.attributes.a_position_rw.data, 3);
      return (g);
    }
    return function (data) {
    //  var lines = data.split('\n');
    //  console.log(lines);
      var vertices = [], normals = [], indices = [];
      /*
      lines.forEach(function (l) {
        if (l.indexOf("v ") !== 0 && l.indexOf("vn ") !== 0 && l.indexOf("f ") !== 0) return;
        l = l.split(" ");

        if (l[0]==="vn") {         
          normals.push(
            parseFloat(l[1]),
            parseFloat(l[2]),
            parseFloat(l[3])
          )
        }
        else if (l[0] === "v") {
          vertices.push(
            parseFloat(l[1]),
            parseFloat(l[2]),
            parseFloat(l[3])
          )
        }

        else if (l[0] === "f") {
          indices.push(
            parseInt(l[1]),
            parseInt(l[2]),
            parseInt(l[3])
          )
        }

      });

*/

      var vertexMatches = data.match(/^v( -?\d+(\.\d+)?){3}$/gm);
      if (vertexMatches) {
         vertexMatches.forEach(function (vertex) {
           vertex = vertex.split(" ");
           vertices.push(
             parseFloat(vertex[1]),
             parseFloat(vertex[2]),
             parseFloat(vertex[3])
           )
        });
      }


      min.fill(Infinity);
      max.fill(-Infinity)


      var i;
      for (i = 0; i < vertices.length; i++) {
        vertices[i] *= 0.01;
      }
      for (i = 0; i < vertices.length; i += 3) {
        min[0] = Math.min(min[0], vertices[i]);
        min[1] = Math.min(min[1], vertices[i+1]);
        min[2] = Math.min(min[2], vertices[i+2]);


        max[0] = Math.max(max[0], vertices[i]);
        max[1] = Math.max(max[1], vertices[i + 1]);
        max[2] = Math.max(max[2], vertices[i + 2]);

      }
      for (i = 0; i < vertices.length; i += 3) {
       // vertices[i] -= min[0];
      //  vertices[i+1] -= min[1];
       // vertices[i+2] -= min[2];
      }

      var g = ge.geometry.geometry_data.create({
        vertices: new Float32Array(vertices),
        normals1: new Float32Array(normals)

      });
      g.set_indices(indices);
      ge.geometry.geometry_data.calc_normals(g);


     // ge.geometry.geometry_data.calc_tangents(g);
    //  ge.geometry.geometry_data.calc_bounds(g, g.attributes.a_position_rw.data, 3);
      return (g);

    }
  })();


  ge.geometry.shapes.flat_quad = new ge.geometry.geometry_data();

  ge.geometry.shapes.flat_quad.add_attribute('a_position_rw', {
    item_size: 3, data: new Float32Array([
      -1, -1, 0,
      1, -1, 0,
      1, 1, 0,
      -1, -1, 0,
      1, 1, 0,
      -1, 1, 0
    ])
  });
  ge.geometry.shapes.flat_quad.num_items = 12;












  ge.geometry.mesh = ge.define(function (proto, _super) {

    function ge_mesh(def) {
      def = def || {};
      _super.apply(this, [def]);

      this.geometry = def.geometry || null;
      this.material = def.material || null;
      this.draw_offset = 0;
      if (this.geometry !== null) this.draw_count = this.geometry.num_items;
      this.item_type = ge.ITEM_TYPES.MESH;
      this.flags = def.flags || 0;

    }
    proto.update_bounds = function (mat, trans) {
      math.aabb.transform_mat4(this.bounds, this.geometry.aabb, mat);
      this.bounds_sphere = this.geometry.bounds_sphere * trans.scale_world[0];
    };

    return ge_mesh;
  }, ge.renderable);



  ge.geometry.mesh.triangles = ge.define(function (proto, _super) {



    var ii = 0;
    proto.add = function (x0, y0, z0, x1, y1, z1, x2, y2, z2) {
      ii = this.ii;

      this.vertices[ii++] = x0;
      this.vertices[ii++] = y0;
      this.vertices[ii++] = z0;

      this.vertices[ii++] = x1;
      this.vertices[ii++] = y1;
      this.vertices[ii++] = z1;

      this.vertices[ii++] = x2;
      this.vertices[ii++] = y2;
      this.vertices[ii++] = z2;

      this.ii = ii;

      this.geometry.attributes.a_position_rw.data_length = ii;
      this.geometry.attributes.a_position_rw.needs_update = true;

      this.draw_count = ii/3;

      return this;

    

    }


    proto.render_list = function () {
      if (this.geometry.attributes.a_position_rw.needs_update) {
        ge.geometry.geometry_data.calc_normals(this.geometry);
      }

    }

    function ge_mesh_triangle(def) {
      def = def || {};
      _super.apply(this, [def]);
      def.max_triangles = def.max_triangles || 1000;


      this.vertices = new Float32Array(def.max_triangles * 9);
      this.geometry = ge.geometry.geometry_data.create({
        vertices: this.vertices,
        normals: new Float32Array(this.vertices.length)
      })
      this.material = def.material || null;
      this.ii = 0;
      this.draw_offset = 0;
      this.draw_count =0;
      this.item_type = ge.ITEM_TYPES.MESH;
      this.flags = def.flags || 0;
      if (def.triangles) {
        for (var i = 0; i < def.triangles.length; i++) {
          this.add.apply(this, def.triangles[i]);
        }
      }

    }
   

    return ge_mesh_triangle;
  }, ge.renderable);


}