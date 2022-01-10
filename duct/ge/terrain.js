function terrain(ecs, ge, math) {

  ge.terrain = {};

  var WORKER_THREAD_MESSAGES = {
    REQUEST_REGION_MESH: 2000,
    REQUEST_REGION_QT: 3000,
    REQUEST_REGION_CQT: 3500,

  };

  ge.terrain.processor = ge.define(function (proto, _super) {

    proto.setup_mesh_processor = (function () {

      proto.regions_from_image_url = (function () {

        return function (url, xs, zs, divisor, ww, hh, scale) {
          var self = this;
          divisor = divisor || 1;
          ge.load_working_image_data(url, function (image_data, width, height) {
            var minh = 999999;
            var maxh = -999999, ht = 0;
            var data = []
            for (var i = 0; i < image_data.length / 4; i++) {
              ht = image_data[i * 4] / divisor;
              if (ht < minh) minh = ht;
              if (ht > maxh) maxh = ht;

              data[i] = ht;
            }
            size = maxh - minh;


            self.worker.postMessage([200, xs, zs, width, data, scale || 1]);
          }, ww, hh);
        }
      })();

      proto.regions_from_data = (function () {
        var i = 0;



        return function (data, xs, zs, width, scale, divisor) {
          if (divisor) {
            for (i = 0; i < data.length; i++) {
              data[i] *= divisor;
            }
          }
          this.worker.postMessage([200, xs, zs, width, data, scale]);
        }
      })();
      proto.update_terrain_parameters = function () {
        this.worker.postMessage([100, this.world_size, this.region_size, this.terrain_quality]);
        this.worker.postMessage([400,
          this.sun_direction[0] * this.world_size * this.region_size,
          this.sun_direction[1] * this.world_size * this.region_size,
          this.sun_direction[2] * this.world_size * this.region_size
        ]);
      };

      proto.generate_regions = function (settings, xs, zs, size, scale) {
        this.worker.postMessage([9999, settings, xs, zs, size, scale]);
      };



      return function () {
        var worker = ge.worker(
          function (thread) {
            var regions = {}, world_size, region_size, region_size1;
            var region_size2, terrain_quality = 1, region_size_scale, region_size_scale1;
            var reg_x, reg_z, reg, reg_key;

            console.log("regions", regions);

            regions.pool = [];
            regions.pool.free = function (reg) { this.push(reg); }
            regions.pool.get = function () {
              return this.length > 0 ? this.pop() : {
                HP: {}
              };
            }



            var PATCH_SIZE = 16, MIN_PATCH_SIZE = 2, MIN_FAN_DETAIL = 2, CQT_DETAIL = 0, ORIG_MIN_PATCH_SIZE = 0;;

            var WORKING_PATCH_SIZE = PATCH_SIZE, WORKING_MIN_PATCH_SIZE = MIN_PATCH_SIZE;

            var vkey, vindex_width = 1200;

            var vmap = new Uint8Array(0), vdata = new Float32Array(0);

            var vindex_width2 = vindex_width / 2;
            var check_vlevel_value = 0;
            function check_vlevel(x, z) {
              check_vlevel_value = vmap[(z + vindex_width2) * vindex_width + (x + vindex_width2)];
              return check_vlevel_value;
            };




            function set_vlevel(x, z, l) {
              vkey = (z + vindex_width2) * vindex_width + (x + vindex_width2);
              vmap[vkey] = Math.min(vmap[vkey], l);
            }

            fin.macro$(function terrain_set_velevel(x$, z$, l$) {
              vkey = (z$ + vindex_width2) * vindex_width + (x$ + vindex_width2);
              vmap[vkey] = Math.min(vmap[vkey], l$);
            }, ge);


            var time_start, rast_time;

            var output = new Float32Array(400000 * 6), oi = 0;

            var render_strips = (function () {
              var st = 0;
              return function (size) {
                for (st = 0; st < region_size; st += size * 2) {
                  set_vlevel(st, 0, size);
                  set_vlevel(st, region_size, size);
                  set_vlevel(0, st, size);
                  set_vlevel(region_size, st, size);
                }
              }
            })();

            var patches = {};

            var sun_x = 15000, sun_y = 5500, sun_z = 15000;
            thread[400] = function (op, _sun_x, _sun_y, _sun_z) {
              sun_x = _sun_x;
              sun_y = _sun_y;
              sun_z = _sun_z;
            };
            thread[100] = function (op, _world_size, _region_size, _terrain_quality) {
              world_size = _world_size;
              region_size = _region_size;
              region_size1 = region_size + 1;
              region_size2 = region_size * 0.5;
              terrain_quality = _terrain_quality;
              if (terrain_quality === 0) {
                PATCH_SIZE = 4;
                MIN_PATCH_SIZE = 1;
                MIN_DETAIL = 1;
                CQT_DETAIL = 4;
                MIN_FAN_DETAIL = 2;
              }
              else if (terrain_quality === 1) {
                PATCH_SIZE = 8;
                MIN_PATCH_SIZE = 2;
                CQT_DETAIL = 8;
                MIN_FAN_DETAIL = 2;
              }
              if (terrain_quality === 2) {
                PATCH_SIZE = 16;
                MIN_PATCH_SIZE = 4;
                CQT_DETAIL = 12;
                MIN_FAN_DETAIL = 2;
              }
              else if (terrain_quality === 3) {
                PATCH_SIZE = 32;
                MIN_PATCH_SIZE = 4;
                CQT_DETAIL = 9;
                MIN_FAN_DETAIL = 2;
              }
              else if (terrain_quality === 4) {
                PATCH_SIZE = 32;
                MIN_PATCH_SIZE = 8;
                CQT_DETAIL = 24;
                MIN_FAN_DETAIL = 4;
              }
              else if (terrain_quality === 5) {
                PATCH_SIZE = 32;
                MIN_PATCH_SIZE = 16;
                CQT_DETAIL = 32;
                MIN_FAN_DETAIL = 4;
              }

              else if (terrain_quality === 6) {
                PATCH_SIZE = 32;
                MIN_PATCH_SIZE = 16;
                CQT_DETAIL = 32;
                MIN_FAN_DETAIL = 8;
              }

              ORIG_MIN_PATCH_SIZE = MIN_PATCH_SIZE;

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



            };



            thread[200] = (function () {
              var tx, tz, i0, i1, i3, size;
              function adjust_data(data, data_size) {
                var new_data = new Float32Array((data_size + 1) * (data_size + 1));
                for (reg_z = 0; reg_z < data_size; reg_z++) {
                  for (reg_x = 0; reg_x < data_size; reg_x++) {
                    new_data[reg_z * (data_size + 1) + reg_x] = data[reg_z * data_size + reg_x];
                  }
                }
                for (reg_z = 0; reg_z < data_size; reg_z++) {
                  new_data[reg_z * (data_size + 1) + data_size] = data[reg_z * data_size + (data_size - 1)];
                }
                for (reg_x = 0; reg_x < data_size; reg_x++) {
                  new_data[data_size * (data_size + 1) + reg_x] = data[(data_size - 1) * data_size + reg_x];
                }

                new_data[data_size * (data_size + 1) + data_size] =
                  (data[(data_size - 1) * data_size + (data_size - 1)] +
                    data[(data_size - 1) * data_size + (data_size - 1)]) / 2;

                return new_data;
              }


              var build_region = (function () {
                return function (op, xs, zs, data_size, data, scale) {
                  data = adjust_data(data, data_size);
                  region_size_scale = region_size / scale;
                  region_size_scale1 = region_size_scale + 1;
                  size = Math.floor(data_size / region_size_scale);
                  data_size += 1;

                  for (reg_z = 0; reg_z < size; reg_z++) {
                    for (reg_x = 0; reg_x < size; reg_x++) {

                      reg_key = (reg_z + zs) * world_size + (reg_x + xs);
                      reg = regions[reg_key] || regions.pool.get();
                      reg.HP = {};
                      reg.QT = undefined;
                      reg.data = reg.data || new Float32Array(region_size_scale1 * region_size_scale1);
                      if (reg.size !== undefined) {
                        if (reg.size !== region_size_scale1) {
                          reg.data = new Float32Array(region_size_scale1 * region_size_scale1);
                        }

                      }


                      reg.minh = 999999;
                      reg.maxh = -999999;
                      reg.rx = (reg_x + xs);
                      reg.rz = (reg_z + zs);

                      reg.x = reg.rx * region_size;
                      reg.z = reg.rz * region_size;
                      reg.scale = scale;
                      reg.size = region_size_scale1;

                      i0 = (reg_x * region_size_scale);
                      for (tz = 0; tz < region_size_scale1; tz++) {
                        i1 = (((reg_z * region_size_scale) + tz) * (data_size)) + i0;
                        i3 = (tz * region_size_scale1);
                        for (tx = 0; tx < region_size_scale1; tx++) {
                          ht = data[i1 + tx] || 0;

                          if (ht < reg.minh) reg.minh = ht;
                          if (ht > reg.maxh) reg.maxh = ht;

                          reg.data[(i3 + tx)] = ht;
                        }
                      }
                      regions[reg_key] = reg;
                      reg.key = reg_key;
                      thread.postMessage([op, reg_key, reg.rx, reg.rz, reg.minh, reg.maxh]);



                    }
                  }
                  console.log((size * size) + ' regions loaded');
                }
              })();
              return build_region;
            })();

            var H = (function () {
              var z, x, ix1, iz1, ix2, iz2;
              var c1, c2, size, h1, h2, h3, h4, data, vk;


              return function (xp, zp) {
                if (reg.scale === 1) {
                  return reg.data[zp * region_size1 + xp];
                }


                vk = zp * region_size1 + xp;
                if (reg.HP[vk] !== undefined) {
                  return reg.HP[vk];
                }

                data = reg.data;
                size = reg.size;
                x = xp / reg.scale;
                z = zp / reg.scale;


                ix1 = (x < 0 ? 0 : x >= size ? size - 1 : x) | 0;
                iz1 = (z < 0 ? 0 : z >= size ? size - 1 : z) | 0;

                ix2 = ix1 === size - 1 ? ix1 : ix1 + 1;
                iz2 = iz1 === size - 1 ? iz1 : iz1 + 1;

                xp = x % 1;
                zp = z % 1;


                h1 = data[(ix1 + iz1 * size)];
                h2 = data[(ix2 + iz1 * size)];
                h3 = data[(ix1 + iz2 * size)];
                h4 = data[(ix2 + iz2 * size)];

                h1 = h1 * h1;
                h2 = h2 * h2;
                c1 = (h2 - h1) * xp + h1;
                c2 = (h4 * h4 - h4 * h3) * xp + h3 * h3;

                reg.HP[vk] = (Math.sqrt((c2 - c1) * zp + c1));


                return reg.HP[vk];
              }


            })();
            var HH = (function () {
              var _rx, _rz, v, temp_reg, rs;



              return function (x, z) {
                if (x > -1 && x < region_size1) {
                  if (z > -1 && z < region_size1) {
                    return H(x, z);
                  }
                }

                rs = region_size;
                _rx = 0; _rz = 0;
                if (x < 0) {
                  _rx = -1;
                  x = rs + x;
                }
                else if (x > rs) {
                  _rx = 1;
                  x = x % rs;
                }

                if (z < 0) {
                  _rz = -1;
                  z = rs + z;
                }
                else if (z > rs) {
                  _rz = 1;
                  z = z % rs;
                }

                reg_key = (reg.rz + _rz) * world_size + (reg.rx + _rx);
                temp_reg = reg;
                reg = regions[reg_key];
                if (reg) {
                  v = H(x, z);
                  reg = temp_reg;
                  return v;

                }
                reg = temp_reg;
                return 0;


              }
            })();


            var reg_data;
            var _fp, nx, ny, nz;


            var p, i = 0, x, z, j = 0, s = 1;
            var patch_index = 0;

        

            fin.macro$(function terrain_draw_triangle(x0$, z0$, x1$, z1$, x2$, z2$, s$) {
              ge.terrain_set_velevel$(x0$, z0$, s$)
              output[oi] = x0$;
              output[oi + 2] = z0$;
              output[oi + 3] = patch_index;
              oi += 6;

              ge.terrain_set_velevel$(x1$, z1$, s$)
              output[oi] = x1$;
              output[oi + 2] = z1$;
              output[oi + 3] = patch_index;
              oi += 6;

              ge.terrain_set_velevel$(x2$, z2$, s$)
              output[oi] = x2$;
              output[oi + 2] = z2$;
              output[oi + 3] = patch_index;
              oi += 6;


            }, ge);




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
                    ge.terrain_draw_triangle$(x, z, x + lfx * s, z + lfz * s, x + fx * s, z + fz * s, s)
                    lfx = fx; lfz = fz;
                  }
                  fi += fd;
                }
              }
            })();
            var check_for_edge_cases = false;

            var qii = 0, rg_QT = null;
            var hh0, hh1, hh2, hh3, hh4;

            function eval_area_height(x, z, s, pndx, slot) {

              hh0 = H(x, z); hh1 = H(x - s, z - s); hh2 = H(x + s, z - s); hh3 = H(x + s, z + s); hh4 = H(x - s, z + s);

              var indx = qii;

              output[indx] = Math.max(
                Math.abs(((hh1 + hh2) * 0.5) - hh0), Math.abs(((hh4 + hh3) * 0.5) - hh0), Math.abs(((hh1 + hh4) * 0.5) - hh0), Math.abs(((hh2 + hh3) * 0.5) - hh0)
              );

              if (pndx > -1) {
                output[pndx + slot] = indx;
              }

              if (s > ORIG_MIN_PATCH_SIZE) {
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



            var _RSK = new Float32Array(1024), _si = 0;
            var dd = 0, dlen = 0;
            function rasterize_region(x, z, s,  detail, rg_QT) {
              _si = 0;
              var i = 0;
              _RSK[_si] = x; _RSK[_si + 1] = z; _RSK[_si + 2] = s; _RSK[_si + 3] = i; _si += 4;

              while (_si > 0) {
                _si -= 4;
                x = _RSK[_si]; z = _RSK[_si + 1]; s = _RSK[_si + 2]; i = _RSK[_si + 3];
                dd = detail;

                if (s > WORKING_PATCH_SIZE || (s > WORKING_MIN_PATCH_SIZE && rg_QT[i] > dd)) {
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

           
            thread[2000] = (function () {


              
              var check_edge_cases;

              function render_patches() {
                s = WORKING_MIN_PATCH_SIZE;
                check_edge_cases = false;
                patch_index = 0;
                while (s <= WORKING_PATCH_SIZE) {
                  p = patches[s];

                  i = 0;
                  j = p.i;
                  while (i < j) {

                    x = p.list[i++];
                    z = p.list[i++];
                    fd = 16;

                    if (check_for_edge_cases) {
                      if (s >= WORKING_MIN_PATCH_SIZE || WORKING_MIN_PATCH_SIZE >= MIN_PATCH_SIZE) {
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
                          if (WORKING_MIN_PATCH_SIZE > MIN_PATCH_SIZE) fd = 2;
                        }
                        else {

                        }
                      }

                    }

                    if (check_for_edge_cases) {
                      draw_fan(x, z, s, fd);
                    }
                    else {
                      ge.terrain_draw_triangle$(x - s, z - s, x + s, z - s, x + s, z + s, s)
                      ge.terrain_draw_triangle$(x - s, z - s, x + s, z + s, x - s, z + s, s)
                    }
                    patch_index++;
                  }
                  s = s * 2;
                }

              }

              var nsize, xn, yn, zn, ss, ni;


              var calc_shadow_map = (function () {
                var ldx, ldy, ldz, cpx, cpy, cpz;

                return function () {
                  ss = MIN_PATCH_SIZE/2;

                  nsize = (region_size / ss);
                  var nmap = new Uint8Array(nsize * nsize * 4);
                  nmap.fill(255);
                  for (zn = 0; zn < region_size; zn += ss) {
                    for (xn = 0; xn < region_size; xn += ss) {


                      cpx = xn;
                      cpy = H(xn, zn);
                      cpz = zn;

                      ldx = (sun_x - reg.x) - cpx;
                      ldy = sun_y - cpy;
                      ldz = (sun_z - reg.z) - cpz;

                      _fp = ldx * ldx + ldy * ldy + ldz * ldz;
                      if (_fp > 0) _fp = 1 / Math.sqrt(_fp);
                      ldx *= _fp;
                      ldy *= _fp;
                      ldz *= _fp;



                      ldx = Math.sign(ldx);
                      ldy = Math.sign(ldy);
                      ldz = Math.sign(ldz);
                      while (cpx > -region_size && cpx < region_size * 2 &&
                        cpz > -region_size && cpz < region_size * 2) {
                        cpx += ldx * (ss / 1);
                        cpy += ldy * (ss / 1);
                        cpz += ldz * (ss / 1);



                        if (cpy <= HH(Math.round(cpx), Math.round(cpz))) {
                          ni = (((zn / ss)) * nsize + ((xn / ss))) * 4;
                          nmap[ni] = 150;
                          /*
                          for (ldz = 0; ldz < ss; ldz++) {
                              for (ldx = 0; ldx < ss; ldx++) {
                                  ni = (((zn / ss) + ldz) * nsize + ((xn / ss) + ldx)) * 4;
                                 // nmap[ni] = 100;
                              }
                          }
                          */
                          break;
                        }
                      }


                    }
                  }
                  reg.smap = true;
                  thread.postMessage([2300, reg.key, nsize, nmap.buffer], [nmap.buffer]);
                  //console.log(reg.key,nmap);
                }
                return function () {
                  ss = 1;
                  nsize = reg.size - 1;
                  var nmap = new Uint8Array(nsize * nsize * 4);
                  nmap.fill(255);
                  for (zn = 0; zn < nsize; zn += ss) {
                    for (xn = 0; xn < nsize; xn += ss) {


                      cpx = xn;
                      cpy = reg.data[zn * reg.size + xn];
                      cpz = zn;

                      ldx = (sun_x - reg.x) - cpx;
                      ldy = sun_y - cpy;
                      ldz = (sun_z - reg.z) - cpz;

                      _fp = ldx * ldx + ldy * ldy + ldz * ldz;
                      if (_fp > 0) _fp = 1 / Math.sqrt(_fp);
                      ldx *= _fp;
                      ldy *= _fp;
                      ldz *= _fp;


                      ni = ((zn / ss) * nsize + (xn / ss)) * 4;

                      while (cpx >= 0 && cpx < region_size - ss && cpz >= 0 && cpz < region_size - ss) {
                        cpx += ldx; cpy += ldy; cpz += ldz;
                        if (cpy <= reg.data[Math.round(cpz) * reg.size + Math.round(cpx)]) {
                          nmap[ni] = 100;
                          break;
                        }
                      }


                    }
                  }

                  thread.postMessage([2300, reg.key, nsize, nmap.buffer], [nmap.buffer]);
                  //console.log(reg.key,nmap);
                }
              })();

              function create_reg_QT(reg) {                
                qii = 0;
                eval_area_height(region_size2, region_size2, region_size2, -1, 0);
                reg.QT = new Float32Array(qii);
                i = 0; while (i < qii) { reg.QT[i] = output[i++]; }
              }


              var process_region = function (reg, detail) {
                if (!reg.QT) {
                  create_reg_QT(reg);
                }
                rg_QT = reg.QT;

                if (!reg.smap && detail < 24) {
                  // calc_shadow_map();
                }
                for (s = WORKING_MIN_PATCH_SIZE; s <= WORKING_PATCH_SIZE; s *= 2) patches[s].i = 0;
                
                rasterize_region(region_size2, region_size2, region_size2, detail, rg_QT);
                render_patches();
              };



              var _xx, _zz;
              var output_uncompressed_data = false;


              var COLLISION_MESH = false;
              function calculate_output_data(is, ie,xo,zo,sc) {
                i = is;
                s = PATCH_SIZE;

                if (COLLISION_MESH) {
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
                      reg.minh = Math.min(reg.minh, vdata[vkey]);
                      reg.maxh = Math.max(reg.maxh, vdata[vkey]);
                    }
                    else {
                      vkey *= 4;
                    }

                    output[i + 1] = vdata[vkey];  
                    output[i] = _xx;
                    output[i + 2] = _zz;

                    i += 6;
                  }

                }
                else {
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

                      nx = (HH(x - s, z) - HH(x + s, z));
                      ny = (s * 2);
                      nz = (HH(x, z - s) - HH(x, z + s));

                      _fp = nx * nx + ny * ny + nz * nz;
                      if (_fp > 0) _fp = 1 / Math.sqrt(_fp);

                      nx = (((nx * _fp) + 1) * 0.5) * 255;
                      ny = (((ny * _fp) + 1) * 0.5) * 255;
                      nz = (((nz * _fp) + 1) * 0.5) * 255;

                      vdata[vkey + 1] = nx;
                      vdata[vkey + 2] = ny;
                      vdata[vkey + 3] = nz;

                      reg.minh = Math.min(reg.minh, vdata[vkey]);
                      reg.maxh = Math.max(reg.maxh, vdata[vkey]);


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


                

              }



              function set_terrain_quality(terrain_quality) {
                if (terrain_quality === 0) {
                  PATCH_SIZE = 4;
                  MIN_PATCH_SIZE = 1;
                  MIN_DETAIL = 1;
                  CQT_DETAIL = 4;
                  MIN_FAN_DETAIL = 2;
                }
                else if (terrain_quality === 1) {
                  PATCH_SIZE = 8;
                  MIN_PATCH_SIZE = 2;
                  CQT_DETAIL = 8;
                  MIN_FAN_DETAIL = 2;
                }
                if (terrain_quality === 2) {
                  PATCH_SIZE = 16;
                  MIN_PATCH_SIZE = 4;
                  CQT_DETAIL = 12;
                  MIN_FAN_DETAIL = 2;
                }
                else if (terrain_quality === 3) {
                  PATCH_SIZE = 32;
                  MIN_PATCH_SIZE = 4;
                  CQT_DETAIL = 9;
                  MIN_FAN_DETAIL = 2;
                }
                else if (terrain_quality === 4) {
                  PATCH_SIZE = 32;
                  MIN_PATCH_SIZE = 8;
                  CQT_DETAIL = 24;
                  MIN_FAN_DETAIL = 4;
                }
                else if (terrain_quality === 5) {
                  PATCH_SIZE = 32;
                  MIN_PATCH_SIZE = 16;
                  CQT_DETAIL = 32;
                  MIN_FAN_DETAIL = 4;
                }

                else if (terrain_quality === 6) {
                  PATCH_SIZE = 32;
                  MIN_PATCH_SIZE = 16;
                  CQT_DETAIL = 32;
                  MIN_FAN_DETAIL = 8;
                }

                else if (terrain_quality === 7) {
                  PATCH_SIZE = 64;
                  MIN_PATCH_SIZE = 32;
                  CQT_DETAIL = 32;
                  MIN_FAN_DETAIL = 16;
                }

                else if (terrain_quality === 8) {
                  PATCH_SIZE = 128;
                  MIN_PATCH_SIZE = 64;
                  CQT_DETAIL = 128;
                  MIN_FAN_DETAIL = 32;
                }
                else if (terrain_quality === 9) {
                  PATCH_SIZE = 256;
                  MIN_PATCH_SIZE = 32;
                  CQT_DETAIL = 128;
                  MIN_FAN_DETAIL = 64;
                }
              }


              thread[3000] = function (op, terrain_quality, reg_key, detail, param1, param2, param3, param4,bindex, reg_data_buffer) {
                reg = regions[reg_key];
                if (reg) {
                  if (!reg.QT) {
                    create_reg_QT(reg);
                  }

                  j = reg.QT.length;
                  if (reg_data_buffer.byteLength < j * 4) {
                    reg_data = new Float32Array(j);
                  }
                  else {
                    reg_data = new Float32Array(reg_data_buffer);
                  }
                  reg_data_buffer = reg_data.buffer;

                  reg_data.set(reg.QT, 0);

                  this.postMessage([op, reg_key, detail, MIN_PATCH_SIZE, PATCH_SIZE, j, bindex, reg_data_buffer], [reg_data_buffer]);

                }
              };

              thread[1550] = (function () {              
                return function (op, reg_key, id, px, pz) {
                  reg = regions[reg_key];
                  if (reg) {
                    px -= reg.x;
                    pz -= reg.z;
                    px += region_size2;
                    pz += region_size2;

                    thread.postMessage([op, id, H(Math.floor(px), Math.floor(pz))]);

                  }
                }
              })();

              function rasterize_cqt(x, z, s, qi, detail, pndx, slot) {

                var indx = qii;
                if (pndx > -1) {
                  output[pndx + slot] = indx;
                }

                output[indx] = rg_QT[qi];

                hh1 = H(x - s, z - s); hh2 = H(x + s, z - s); hh3 = H(x + s, z + s); hh4 = H(x - s, z + s);

                output[indx + 1] = hh1; output[indx + 2] = hh2; output[indx + 3] = hh3; output[indx + 4] = hh4;
                output[indx + 5] = Math.max(hh1, hh2, hh3, hh4);

                hh1 = H(x, z - s); hh2 = H(x, z + s); hh3 = H(x + s, z); hh4 = H(x - s, z);

                output[indx + 6] = hh1; output[indx + 7] = hh2; output[indx + 8] = hh3; output[indx + 9] = hh4;
                output[indx + 10] = H(x, z);


                output[indx + 5] = Math.max(output[indx + 5], output[indx + 10], hh1, hh2, hh3, hh4);



                qii += 11;
                if (s > WORKING_PATCH_SIZE || (s > WORKING_MIN_PATCH_SIZE && rg_QT[qi] > detail)) {
                  s *= 0.5;
                  output[indx + 5] = Math.max(
                    output[indx + 5],
                    rasterize_cqt(x - s, z - s, s, rg_QT[qi + 1], detail, indx, 1),
                    rasterize_cqt(x + s, z - s, s, rg_QT[qi + 2], detail, indx, 2),
                    rasterize_cqt(x - s, z + s, s, rg_QT[qi + 3], detail, indx, 3),
                    rasterize_cqt(x + s, z + s, s, rg_QT[qi + 4], detail, indx, 4));

                  return output[indx + 5];
                }


                return output[indx + 5];
              }

              thread[3500] = function (op, terrain_quality, reg_key, detail, param1, param2, param3, param4, bindex, reg_data_buffer) {
                reg = regions[reg_key];
                if (reg) {
                  if (!reg.QT) {
                    create_reg_QT(reg);
                  }
                  rg_QT = reg.QT;
                  qii = 0;
                  rasterize_cqt(region_size2, region_size2, region_size2, 0, Math.abs(detail), -1, 0);


                  j = qii;
                  if (reg_data_buffer.byteLength < j * 4) {
                    reg_data = new Float32Array(j);
                  }
                  else {
                    reg_data = new Float32Array(reg_data_buffer);
                  }
                  reg_data_buffer = reg_data.buffer;

                  i = 0;
                  while (i < qii) {
                    reg_data[i] = output[i++];
                  }

                  this.postMessage([op, reg_key, detail, MIN_PATCH_SIZE, PATCH_SIZE, j, bindex, reg_data_buffer], [reg_data_buffer]);






                }
              };


              



              var detail;

              var req_flags = {
                COLLISION_MESH: 2
              };

              return function (op, terrain_quality, reg_key, reg_detail, cam_x, cam_z, reg_req_flags, param4, bindex, reg_data_buffer) {


                reg = regions[reg_key];
                if (reg) {

                  detail = reg_detail;

                  set_terrain_quality(terrain_quality);




                  check_for_edge_cases = true;

                  if (detail < 0) {
                    
                    detail = Math.abs(detail);
                    check_for_edge_cases = false;
                  } else if (detail > 1000) {
                    check_for_edge_cases = false;
                  }

                  WORKING_PATCH_SIZE = PATCH_SIZE;
                  WORKING_MIN_PATCH_SIZE = MIN_PATCH_SIZE;


                  if ( detail > 32) {
                    WORKING_PATCH_SIZE *= 2;
                    WORKING_MIN_PATCH_SIZE *= 2;
                  }

                  time_start = Date.now();

                  vmap.fill(255);

                  


                  //if (detail < 1000) check_for_edge_cases = true;

                  COLLISION_MESH = false;
                  if (reg_req_flags & req_flags.COLLISION_MESH) {
                    COLLISION_MESH = true;
                    
                  }


                  if (!COLLISION_MESH) render_strips(MIN_PATCH_SIZE);

                  oi = 0;
                  process_region(reg, detail);

                  calculate_output_data(0, oi, 0, 0, 1);



                  j = Math.floor(oi / 6) * 3;





                  if (reg_data_buffer.byteLength < j * 4) {
                    reg_data = new Float32Array(j);
                  }
                  else {
                    reg_data = new Float32Array(reg_data_buffer);
                  }
                  reg_data_buffer = reg_data.buffer;


                  i = 0; j = 0;
                  if (COLLISION_MESH) {

                    while (i < oi) {
                      reg_data[j] = output[i + 2] * region_size1 + output[i];
                      reg_data[j + 1] =  output[i + 1];
                      reg_data[j + 2] = output[i + 3];
                      
                      reg.minh = Math.min(reg.minh, reg_data[j + 1]);
                      reg.maxh = Math.max(reg.maxh, reg_data[j + 1]);
                      i += 6; j += 3;
                    }
                  }
                  else {

                    while (i < oi) {
                      reg_data[j] = output[i + 2] * region_size1 + output[i];
                      reg_data[j + 1] =  output[i + 1];

                      _fp = (output[i + 3] << 16) | (output[i + 4] << 8) | output[i + 5];
                      reg_data[j + 2] = _fp / (1 << 24);

                      reg.minh = Math.min(reg.minh, reg_data[j + 1]);
                      reg.maxh = Math.max(reg.maxh, reg_data[j + 1]);
                      i += 6;
                      j += 3;
                    }
                  }
                 


                   rast_time = Date.now() - time_start;


                  this.postMessage([op, reg_key, reg_detail, reg.minh, reg.maxh, j,
                    bindex, reg_data_buffer],
                    [reg_data_buffer]);

                  //return;
                 // console.log('render reg', rast_time + ' ms /' + reg_key + '/' + reg_detail + '/' + (j / 3));

                };

              }


            })();


            thread.onmessage = function (m) {
              this[m.data[0]].apply(this, m.data);
            };

            eval('(' + worker_overloaded.toString() + ')(thread)');


            thread[9999] = (function () {
              var noise = (function () {
                var noise = {};
                function Grad(x, y, z) { this.x = x; this.y = y; this.z = z; }
                Grad.prototype.dot2 = function (x, y) { return this.x * x + this.y * y; };
                Grad.prototype.dot3 = function (x, y, z) { return this.x * x + this.y * y + this.z * z; };

                var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0), new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1), new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];

                var p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103,
                  30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94,
                  252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171,
                  168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
                  60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
                  1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159,
                  86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147,
                  118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183,
                  170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129,
                  22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
                  251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239,
                  107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4,
                  150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215,
                  61, 156, 180];

                var perm = new Array(512), gradP = new Array(512);

                var i, v;
                noise.seed = function (seed) {
                  if (seed > 0 && seed < 1) {
                    seed *= 65536;
                  }

                  seed = Math.floor(seed);
                  if (seed < 256) {
                    seed |= seed << 8;
                  }

                  for (i = 0; i < 256; i++) {
                    if (i & 1) {
                      v = p[i] ^ (seed & 255);
                    }
                    else {
                      v = p[i] ^ ((seed >> 8) & 255);
                    }

                    perm[i] = perm[i + 256] = v;
                    gradP[i] = gradP[i + 256] = grad3[v % 12];
                  }
                };
                function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
                function lerp(a, b, t) { return (1 - t) * a + t * b; }
                // 2D Perlin Noise
                var X, Y, n00, n01, n10, n11, u;
                noise.perlin = function (x, y) {
                  // Find unit grid cell containing point
                  X = Math.floor(x);
                  Y = Math.floor(y);
                  // Get relative xy coordinates of point within that cell
                  x = x - X;
                  y = y - Y;
                  // Wrap the integer cells at 255 (smaller integer period can be introduced here)
                  X = X & 255;
                  Y = Y & 255;

                  // Calculate noise contributions from each of the four corners
                  n00 = gradP[X + perm[Y]].dot2(x, y);
                  n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
                  n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
                  n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1);

                  // Compute the fade curve value for x
                  u = fade(x);

                  // Interpolate the four results
                  return lerp(
                    lerp(n00, n10, u),
                    lerp(n01, n11, u),
                    fade(y)
                  );
                };


                return noise;
              })();

              var div = 0, l = 0, layer, layers, px, pz, elv, ns, o;
              var frequency, amplitude;



              var e, maxe, mine, ofx, ofz, height_scale, reg_x, reg_z;

              
              return function (op, settings, xs, zs, size, scale) {
               // console.log("seet", settings);
                noise.seed(settings.seed);


                ofx = settings.offset_x;
                ofz = settings.offset_z;
                height_scale = settings.height_scale;
                layers = settings.layers;
                for (reg_z = 0; reg_z < size; reg_z++) {
                  for (reg_x = 0; reg_x < size; reg_x++) {

                    px = reg_x + ofx * (size - 1);
                    pz = reg_z + ofz * (size - 1);

                    e = 0;
                    for (l = 0; l < layers.length; l++) {
                      layer = layers[l];

                      frequency = layer.base_roughness;
                      amplitude = 1;


                      ns = 0;
                      for (o = 0; o < layer.octaves; o++) {


                        ns += (noise.perlin(px / size * frequency, pz / size * frequency) / 2.0 + 0.5)
                          * amplitude;


                        frequency *= layer.roughness;
                        amplitude *= layer.persistence;

                      }

                      e += ns * layer.strength;
                    }
                    maxe = Math.max(maxe, e);
                    mine = Math.min(mine, e);
                    output[reg_z * size + reg_x] = e * height_scale;


                    
                  }
                }

                this[200](200, xs, zs, size, output, scale);
              }

            })();


          },
          [this.worker_overloaded]
        );


        this.worker = worker;
        this.worker.processor = this;

        this.update_reg_bounds = function (reg) {
          reg.rad = ((reg.maxh - reg.minh) / 2) * 1;
          reg.y = reg.minh + reg.rad;
          reg.a_minx = Math.min(reg.x - this.region_size_half, reg.x + this.region_size_half);
          reg.a_miny = Math.min(reg.y - reg.rad, reg.y + reg.rad);
          reg.a_minz = Math.min(reg.z - this.region_size_half, reg.z + this.region_size_half);

          reg.a_maxx = Math.max(reg.x - this.region_size_half, reg.x + this.region_size_half);
          reg.a_maxy = Math.max(reg.y - reg.rad, reg.y + reg.rad);
          reg.a_maxz = Math.max(reg.z - this.region_size_half, reg.z + this.region_size_half);

        };

        this.worker[100] = function (op, data_buffer) {

        };

        this.worker[200] = function (op, reg_key, rx, rz, minh, maxh) {
          var reg = this.processor.regions[reg_key] || {
            key: reg_key, last_time: 0, detail: -1,
            reg_x: rx, reg_z: rz, state: 0, req_detail: -1,
            type: 1,
            visibled: true,
          };

          reg.state = 0;
          reg.detail = -1;
          reg.reg_detail = -1;
          reg.maxh = maxh;
          reg.minh = minh;
          reg.x = rx * this.processor.region_size * 1.0;
          reg.z = rz * this.processor.region_size * 1.0;

          

          this.processor.update_reg_bounds(reg);
          this.processor.regions[reg_key] = reg;

          for (var h in this.processor.hosts) {
            this.processor.hosts[h].on_new_region(reg);
          }

        };

        this.worker[300] = function (op, reg_key, cqt_data_buffer) {
          reg = this.processor.regions[reg_key];
          if (reg) {
            reg.CQT = new Int16Array(cqt_data_buffer);
          }
        };

        this.worker[2300] = function (op, reg_key, size, smap) {
          reg = this.processor.regions[reg_key];
          if (reg) {

            console.log(size, smap);
            reg.smap = new ge.webgl.texture( undefined, undefined, undefined, new Uint8Array(smap), undefined, size, size);

            reg.smap.enable_clamp_to_edge();

          }
        };
        
        this.worker[1550] = function (op, id, height) {
          this.processor.query_heights[id] = height;
        };

        this.query_height = function (id, px, pz) {
          reg_x = Math.floor((px / this.region_size) + 0.5);
          reg_z = Math.floor((pz / this.region_size) + 0.5);
          reg_key = reg_z * this.world_size + reg_x;
          reg = this.regions[reg_key];
          this.query_heights[id] = -Infinity;
          if (reg) {
            this.worker.postMessage([1550, reg.key, id, px, pz]);
          }
        }

        worker.request_region = (function () {
          var parking = new fin.queue();


          var reg_data_buffers = [new ArrayBuffer(1), new ArrayBuffer(1), new ArrayBuffer(1)];
          var reg_data_buffers_hosts = [];


          console.log('reg_data_buffers', reg_data_buffers);

          var i = 0;
          function get_buffer_index() {
            i = 0;
            while (i < reg_data_buffers.length) {
              if (reg_data_buffers[i].byteLength > 0) return i;
              i++;
            }
            return -1;
          }

          var bindex = 0;
          worker[2000] = function (op, reg_key, detail, minh, maxh, ri, bindex, reg_data_buffer) {

            reg = this.processor.regions[reg_key];
            reg.minh = minh;
            reg.maxh = maxh;

            
            this.processor.update_reg_bounds(reg);           
            this.processor.hosts[reg_data_buffers_hosts[bindex]].on_region_data(reg, new Float32Array(reg_data_buffer), ri, detail);
            reg_data_buffers[bindex] = reg_data_buffer;
            if (parking.size() > 0) {
              this.region_parked_request(parking.dequeue());
            }

          };


          worker[2010] = function (op, reg_key, detail, minh, maxh, ri, bindex, reg_data_buffer) {            
            reg_data_buffers[bindex] = reg_data_buffer;
            if (parking.size() > 0) {
              this.region_parked_request(parking.dequeue());
            }

          };



          worker[3000] = function (op, reg_key, detail, _MIN_PATCH_SIZE, _PATCH_SIZE, ri, bindex, reg_data_buffer) {            
            this.processor.hosts[reg_data_buffers_hosts[bindex]].on_region_qt(this.processor.regions[reg_key],
              new Float32Array(reg_data_buffer), ri, _MIN_PATCH_SIZE, _PATCH_SIZE, detail);
            reg_data_buffers[bindex] = reg_data_buffer;
            if (parking.size() > 0) {
              this.region_parked_request(parking.dequeue());
            }
          };


          worker[3500] = function (op, reg_key, detail, _MIN_PATCH_SIZE, _PATCH_SIZE, ri, bindex, reg_data_buffer) {
            this.processor.hosts[reg_data_buffers_hosts[bindex]].on_region_cqt(this.processor.regions[reg_key],
              new Float32Array(reg_data_buffer), ri, _MIN_PATCH_SIZE, _PATCH_SIZE, detail);
            reg_data_buffers[bindex] = reg_data_buffer;
            if (parking.size() > 0) {
              this.region_parked_request(parking.dequeue());
            }
          };



          var request_pool = new fin.object_pooler(function () {
           
            return {
              host_id: 0,
              param1: [null, null, null, null, null, null, null, null, null, null],
              param2: [null]
            };
          });

          console.log("request_pool", request_pool);



          worker.region_parked_request = function (req) {
            bindex = get_buffer_index();
            if (bindex > -1) {
              reg_data_buffers_hosts[bindex] = req.host_id;
              req.param1[8] = bindex;
              req.param1[9] = reg_data_buffers[bindex];
              req.param2[0] = reg_data_buffers[bindex];
              this.postMessage(req.param1, req.param2);
              req.param1[9] = null;
              req.param2[0] = null;
              request_pool.free(req);
            }
            else {
              parking.enqueue(req);
            }
          };


          // processor.worker.request_region(2000, this.requested_regions[i++], this.cam_reg_x, this.cam_reg_z).last_time = timer;
          return function (wkm, reg, param1, param2, param3, param4) {
            if (reg.state !== 2) {
              return reg;
            }

            var req = request_pool.get();


            //[null, null, null, null, null, null, null, null, null, null],

            req.param1[0] = wkm;
            req.param1[1] = reg.terrain_quality || this.processor.terrain_quality;
            req.param1[2] = reg.key;
            req.param1[3] = reg.req_detail;

            req.param1[4] = param1;
            req.param1[5] = param2;
            req.param1[6] = param3;
            req.param1[7] = param4;


            bindex = get_buffer_index();
            if (bindex > -1) {
              reg_data_buffers_hosts[bindex] = reg.host_id;
              req.param1[8] = bindex;
              req.param1[9] = reg_data_buffers[bindex];
              req.param2[0] = reg_data_buffers[bindex];
              this.postMessage(req.param1, req.param2);
              
              req.param1[5] = null;
              req.param2[0] = null;
              request_pool.free(req);
            }
            else {
              req.host_id = reg.host_id;
              parking.enqueue(req);
            }


            return reg;

          }


        })();


        this.worker.onmessage = function (m) {
          this[m.data[0]].apply(this, m.data);
        };

       

      }
    })();


    var reg, reg_x, reg_z, reg_key, i = 0, render_item = null;
    proto.initialize = function () {
      this.update_terrain_parameters();
      if (this.def_regions_from_image_url) {
        for (i = 0; i < this.def_regions_from_image_url.length; i++) {
          this.regions_from_image_url.apply(this, this.def_regions_from_image_url[i]);
        }
      }
      if (this.on_initialized !== null) this.on_initialized(this);
      this.initialized = true;

    };


    proto.add_host = function (host) {
      host.host_id = ge.guidi();
      this.hosts[host.host_id] = host;
    };

    function ge_terrain_processor(def) {
      def = def || {};

      this.region_size = def.region_size || 512;
      this.world_size = def.world_size || (4096 * 2);
      this.region_size_width = this.region_size + 1;
      this.region_size_half = this.region_size * 0.5;


      this.regions = {};

      this.world_size_half = this.world_size * 0.5;


      this.timer = 0;

      this.last_validate_time = 0;
      this.last_updated_time = 0;
      this.terrain_quality = def.terrain_quality || 4;

      this.sun_direction = def.sun_direction || [0.5, 0.5, 0.3];

      this.worker_overloaded = "var worker_overloaded=function(thread){}";
      if (def.worker) {
        this.worker_overloaded = "var worker_overloaded=" + def.worker.toString();
      }
      this.setup_mesh_processor();
      this.def_regions_from_image_url = def.regions_from_image_url;

      this.on_initialized = def.on_initialized || null;
      this.initialized = false;
      this.initialize();
      this.hosts = {};
      this.query_heights = {};
    }



    return ge_terrain_processor;
  });

  


  var glsl = ge.webgl.shader.create_chunks_lib(`import('shaders/terrain.glsl')`);


  ge.terrain.material = ge.define(function (proto, _super) {

    proto.render_mesh = function (renderer, shader, mesh) {


      if (!mesh.renderer) {
        mesh.renderer = renderer;
        return;
      }

      ge.shading_material_depth_cull$(renderer)

      shader.set_uniform("u_object_material_rw", this.object_material);

      this.tile_size[0] = this.texture_tiles.tile_sizef;
      this.tile_size[1] = this.texture_tiles.tile_offsetf;

      shader.set_uniform("u_tile_size_rw", this.tile_size);
      shader.set_uniform("u_texture_repeat_rw", this.texture_repeat);
      shader.set_uniform("u_normalmap_repeat_rw", this.normalmap_repeat);

      renderer.use_texture(this.texture_tiles, 0);
      renderer.use_texture(this.normalmap_tiles, 1);


      shader.set_uniform("u_normalmap_tiles_rw", 1);



      mesh.render_terrain(renderer, shader);








    };

    function ge_terrain_material(def) {
      def = def || {};
      _super.apply(this, [def]);
      math.vec3.set(this.ambient, 0.5, 0.5, 0.5);
      math.vec3.set(this.specular, 0, 0, 0);
      this.flags += ge.SHADING.RECEIVE_SHADOW;
      this.texture_tiles = null;
      this.normalmap_tiles = null;

      this.tile_size = math.vec2(512, 0);
      this.texture_repeat = math.vec4(def.tile_repeat || [8, 8, 8, 8]);
      this.normalmap_repeat = math.vec4(1, 1, 1, 1);


      this.shader = ge_terrain_material.shader;

      if (def.normalmap_tiles) {
        this.normalmap_tiles = ge.webgl.texture.create_tiled_texture(def.normalmap_tiles,
          def.material.tile_size || 512,
          def.material.texture_size || 1024,
          def.material.texture_size || 1024
        );
      }
      else {
        this.normalmap_tiles = new ge.webgl.texture();
      }

      if (def.texture_tiles) {
        this.texture_tiles = ge.webgl.texture.create_tiled_texture(def.texture_tiles,
          def.tile_size || 512,
          def.texture_size || 1024,
          def.texture_size || 1024
        );

        this.texture_tiles.enable_clamp_to_edge();
      }
      else {
        this.texture_tiles = new ge.webgl.texture();
        this.texture_tiles.tile_sizef = 1.0;
        this.texture_tiles.tile_offsetf = 1.0;
      }

      if (def.transparent !== undefined) {
        this.set_tansparency(def.transparent);
      }

      if (def.shader) {
        this.shader = this.shader.extend(def.shader);
      }
      //this.flags += ge.DISPLAY_ALWAYS;




    }

    ge_terrain_material.shader = ge.webgl.shader.parse(glsl["default-material"]);


    return ge_terrain_material;


  }, ge.shading.shaded_material);




  ge.terrain.material.oclusion = ge.define(function (proto, _super) {

    proto.render_mesh = function (renderer, shader, mesh) {


      if (!mesh.renderer) {
        mesh.renderer = renderer;
        return;
      }

      ge.shading_material_depth_cull$(renderer)

      mesh.render_terrain(renderer, shader);



    };

    function ge_terrain_material_oclusion(def) {
      def = def || {};
      _super.apply(this, [def]);
      this.shader = ge_terrain_material_oclusion.shader;
      if (def.shader) {
        this.shader = this.shader.extend(def.shader);
      }
      this.flags += ge.DISPLAY_ALWAYS;

    }

    
    ge_terrain_material_oclusion.shader = ge.webgl.shader.parse(glsl["oclusion"]);


    return ge_terrain_material_oclusion;


  }, ge.shading.material);




  ge.terrain.mesh = ge.define(function (proto, _super) {



    proto.update = (function () {


      proto.validate_regions = (function () {
        var rk, reg;
        return function () {
          if (this.timer - this.last_validate_time < 5) return;
          this.last_validate_time = this.timer;
          for (rk in this.regions) {
            reg = this.regions[rk];
            if (reg.state > 0 && this.timer - reg.last_time > 2) {
              reg.last_time = this.timer;
              if (reg.buffer) {
                ge.renderer.gl_buffers.free(reg.buffer);
                reg.buffer = undefined;
                reg.detail = -1;
                this.on_region_dispose(reg);
              }
            }
          }
        }
      })();


      proto.request_region = function (lreg, detail) {

      
        
        if (lreg.detail !== detail && lreg.state !== 2) {
          lreg.req_detail = detail;
          lreg.state = 2;
          this.requested_regions[this.rqi++] = lreg;
        }
        if (lreg.buffer) {
          this.on_region_activated(lreg);
          this.regions_to_render[this.ri++] = lreg;
        }
        lreg.last_time = this.timer;
      };
      
      proto.update_terrain_frustum = (function () {
        var reg_dist = 0, fminx, fminy, fminz, fminx, fminy, fminz, fss;
        var lreg, reg, processor, region_size;
        function dist3d(x, y, z) {
          return Math.abs(Math.sqrt(x * x + y * y + z * z));
        }
        return function (x, z, s) {

          processor = this.processor;

          region_size = processor.region_size;

          reg_x = (this.cam_reg_x + (x + 0.5)) * region_size;
          reg_z = (this.cam_reg_z + (z + 0.5)) * region_size;


          if (s > 0.5) {
            fss = s * region_size;
            fminx = Math.min(reg_x - fss, reg_x + fss);
            fminy = -400;
            fminz = Math.min(reg_z - fss, reg_z + fss);

            fmaxx = Math.max(reg_x - fss, reg_x + fss);
            fmaxy = this.draw_distance;
            fmaxz = Math.max(reg_z - fss, reg_z + fss);

            if (this.camera._frustum_aabb(fminx, fminy, fminz, fmaxx, fmaxy, fmaxz)) {
              s *= 0.5;
              this.update_terrain_frustum(x - s, z - s, s);
              this.update_terrain_frustum(x + s, z - s, s);
              this.update_terrain_frustum(x - s, z + s, s);
              this.update_terrain_frustum(x + s, z + s, s);
              return;
            }
          }
          else {
            reg_x = this.cam_reg_x + (x + 0.5);
            reg_z = this.cam_reg_z + (z + 0.5);
            reg_key = reg_z * processor.world_size + reg_x;

            reg = processor.regions[reg_key];

            if (reg) {
              lreg = this.regions[reg_key];
              if (this.camera._frustum_aabb(reg.a_minx, reg.a_miny, reg.a_minz, reg.a_maxx, reg.a_maxy, reg.a_maxz)) {
              /*
                reg_dist = (
                  Math.abs((this.camera.world_position[0] - reg.x)) + Math.abs(this.camera.world_position[1] - reg.y) + Math.abs((this.camera.world_position[2] - reg.z)));

*/
                reg_dist = dist3d(this.camera.world_position[0] - reg.x, this.camera.world_position[1] - reg.y, this.camera.world_position[2] - reg.z);
                lreg.distance = reg_dist;

                if (reg_dist - processor.region_size_half > this.draw_distance ) {
                  return;
                }

                if (this.region_margin > 1) {
                  if (Math.abs(reg.reg_x % this.region_margin) !== 0 || Math.abs(reg.reg_z % this.region_margin) !== 0) {
                    return;
                  }
                }

                if (this.fixed_detail !== -1) {
                  this.request_region(lreg, this.fixed_detail);
                }
                else {

                  if (lreg.distance < processor.region_size) {
                    this.request_region(lreg, this.detail_levels[0]);
                  }
                  else {
                    reg_dist = Math.min(reg_dist / this.quality_distance, 1);
                    this.request_region(lreg, this.detail_levels[Math.floor((this.detail_levels.length - 1) * reg_dist)]);
                  }

                }

              }
            }


          }

        }
        return function (x, z, s) {

          processor = this.processor;

          region_size = processor.region_size;

          reg_x = (this.cam_reg_x + (x + 0.5)) * region_size;
          reg_z = (this.cam_reg_z + (z + 0.5)) * region_size;


          if (s > 0.5) {
            fss = s * region_size;
            fminx = Math.min(reg_x - fss, reg_x + fss);
            fminy = -this.draw_distance;
            fminz = Math.min(reg_z - fss, reg_z + fss);

            fmaxx = Math.max(reg_x - fss, reg_x + fss);
            fmaxy = this.draw_distance;
            fmaxz = Math.max(reg_z - fss, reg_z + fss);

            if (this.camera._frustum_aabb(fminx, fminy, fminz, fmaxx, fmaxy, fmaxz)) {
              s *= 0.5;
              this.update_terrain_frustum(x - s, z - s, s);
              this.update_terrain_frustum(x + s, z - s, s);
              this.update_terrain_frustum(x - s, z + s, s);
              this.update_terrain_frustum(x + s, z + s, s);
              return;
            }
          }
          else {
            reg_x = this.cam_reg_x + (x + 0.5);
            reg_z = this.cam_reg_z + (z + 0.5);
            reg_key = reg_z * processor.world_size + reg_x;

            reg = processor.regions[reg_key];

            if (reg) {
              lreg = this.regions[reg_key];
              if (this.camera._frustum_aabb(reg.a_minx, reg.a_miny, reg.a_minz, reg.a_maxx, reg.a_maxy, reg.a_maxz)) {
                reg_dist = (
                  Math.abs((this.camera.world_position[0] - reg.x)) +
                  Math.abs(this.camera.world_position[1] - reg.y) +
                  Math.abs((this.camera.world_position[2] - reg.z))

                );
                lreg.distance = reg_dist;

                if (reg_dist - processor.region_size_half > this.draw_distance ) {
                  return;
                }
                if (reg_dist < this.region_offset * (region_size * this.region_margin)) {
                 // return;
                }


                if (this.region_margin > 1) {
                  if (Math.abs(reg.reg_x % this.region_margin) !== 0 || Math.abs(reg.reg_z % this.region_margin) !== 0) {
                    return;
                  }
                }

                this.request_region(lreg, this.fixed_detail);

              }
            }


          }

        }

        
      })();



      var sort_regions_func = function (a, b) {
        return a.distance - b.distance;
      };
      var update_time_delta = 0;
      
      return function (camera, timer) {
        this.camera = camera;
        this.timer = timer;
        var processor = this.processor;

        update_time_delta = timer - this.last_updated_time;
        if (update_time_delta < this.time_step_size) {
          return;
        }
        this.last_updated_time = timer - (update_time_delta % this.time_step_size);


        this.camera_version = this.camera.version;


        this.cam_reg_x = Math.floor((this.camera.world_position[0] / processor.region_size) + 0.5) ;
        this.cam_reg_z = Math.floor((this.camera.world_position[2] / processor.region_size) + 0.5);


        this.cam_reg = this.regions[this.cam_reg_z * this.processor.world_size + this.cam_reg_x];

        if (this.cam_reg) {

        
          if (processor.query_heights[-1024] > -Infinity) {

            if (this.camera_pos_y === 0) {
              this.camera_pos_y = processor.query_heights[-1024];
            }
            else {
              this.camera_pos_y += ( (processor.query_heights[-1024]-this.height_on_camera ) % 42);
            }

            
           // console.log(this.camera_vel_y);
            this.height_on_camera = processor.query_heights[-1024];
           // this.camera_pos_y=this.height_on_camera+50;
            processor.query_heights[-1024] = -Infinity;

            this.camera_pos_y = Math.max(this.height_on_camera, this.camera_pos_y);

          }
          if (this.camera_pos_x !== this.camera.world_position[0] || this.camera_pos_z !== this.camera.world_position[2]) {
            this.camera_pos_x = this.camera.world_position[0];
            this.camera_pos_z = this.camera.world_position[2];
           // this.camera_pos_y = this.camera.world_position[1];
            processor.query_height(-1024, this.camera_pos_x, this.camera_pos_z);
          }

         //this.camera_pos_y += this.camera_vel_y;
          this.camera_vel_y -= this.camera_vel_y * 0.1;
          this.camera_vel_y = Math.max(0, this.camera_vel_y);
        }
        this.update_requested = false;
        this.last_updated_time = timer;
        

        this.ri = 0;
        this.rqi = 0;
        this.er = 0;


        this.update_terrain_frustum(0, 0, this.region_distance * this.region_margin);

        if (this.rqi > 0) {
          this.requested_regions = fin.merge_sort(this.requested_regions, this.rqi, sort_regions_func);
          i = 0;
          if (this.region_margin > 1) {
            while (i < this.rqi) {
              processor.worker.request_region(5000, this.requested_regions[i++], this.region_margin,
                this.region_offset, this.cam_reg_z, this.cam_reg_x).last_time = timer;
            }
          }
          else{
            while (i < this.rqi) {
              processor.worker.request_region(2000, this.requested_regions[i++], this.cam_reg_x, this.cam_reg_z, this.reg_req_flags).last_time = timer;
            }
          }
          

        }
        i = 0;

        this.validate_regions();


      }



    })();

    proto.on_new_region = function (reg) {
      if (!this.regions[reg.key]) {
        this.regions[reg.key] = {
          key: reg.key,
          host_id: this.host_id,
          req_detail: 0,
          terrain_quality: this.terrain_quality,
          last_time: 0
        };
      }
      else {
        this.regions[reg.key].reg_detail = 0;
        this.regions[reg.key].detail = 0;
      }
      return this.regions[reg.key];

    };
    proto.on_region_dispose = function (reg) {

    }

    proto.on_region_activated = function (reg) {

    }

    proto.on_region_data = function (reg, data, size, detail) {
      
      var lreg = this.regions[reg.key];

    
      lreg.state = 1;

      if (!this.renderer) return;
      lreg.ds = 0;
      lreg.di = size / 3;
      lreg.detail = detail;


      lreg.buffer = lreg.buffer || ge.renderer.gl_buffers.get(this.renderer.gl);
      this.renderer.gl.bindBuffer(ge.GL_ARRAY_BUFFER, lreg.buffer);
      this.renderer.gl.bufferData(ge.GL_ARRAY_BUFFER, data, ge.GL_DYNAMIC_DRAW, 0, size);
      this.on_region_activated(lreg);


      if (this.region_margin > 1) {

        var region_size_half = this.processor.region_size_half * this.region_margin;
        
        reg.a_minx = Math.min(reg.x - region_size_half, reg.x + region_size_half);
        reg.a_minz = Math.min(reg.z - region_size_half, reg.z + region_size_half);

        reg.a_maxx = Math.max(reg.x - region_size_half, reg.x + region_size_half);        
        reg.a_maxz = Math.max(reg.z - region_size_half, reg.z + region_size_half);

      }
      return lreg;

    };

    proto.on_region_render = function (reg, renderer, shader) {

    }

    proto.render_terrain = (function () {

      var reg_pos = math.vec4();
      var cam_reg_pos = math.vec3();
      var u_color_id_rw = new Float32Array(4);
      var uint32_color_id = new Uint32Array(1);
      var bytes_color_id = new Uint8Array(uint32_color_id.buffer);
      var lreg, reg, uni, i = 0, rd = 0;
      return function (renderer, shader) {

        cam_reg_pos[0] = this.cam_reg_x * this.processor.region_size;
        cam_reg_pos[1] = this.cam_reg_z * this.processor.region_size;

        


        ge.webgl_shader_set_uniform_unsafe$("cam_reg_pos", cam_reg_pos)

        cam_reg_pos[2] = this.processor.region_size + 1;

        renderer.use_texture(renderer.default_texture, 2);

        ge.webgl_shader_set_uniform$("u_shadow_map_rw", 2)

        ge.webgl_shader_set_uniform$("u_terrain_scale", this.terrian_scale);

        this.time_start = Date.now();



        renderer.bind_default_wireframe_indices();

        this.tri_count = 0;
        i = 0;
        this.region_max_tris = 0;
        this.rendered_regions = 0;
        while (i < this.ri) {
          lreg = this.regions_to_render[i++];
          reg = this.processor.regions[lreg.key];

          lreg.last_time = this.timer;

          if (this.region_offset > 0) {
            rd = Math.floor(Math.abs((this.cam_reg_x - reg.reg_x)) + Math.abs((this.cam_reg_z - reg.reg_z)));

            if (rd < this.region_offset) continue;
          }
          

          if (lreg.buffer) {


            this.tri_count += lreg.di;

            this.region_max_tris = Math.max(this.region_max_tris, lreg.di);


            if (this.region_margin > 1) {
              reg_pos[0] = reg.x - (this.processor.region_size_half * this.region_margin);
              reg_pos[2] = reg.z - (this.processor.region_size_half * this.region_margin );
            }
            else {
              reg_pos[0] = reg.x - this.processor.region_size_half;
              reg_pos[2] = reg.z - this.processor.region_size_half;
            }
            

            reg_pos[1] = 0;
            reg_pos[3] = this.region_margin;

            renderer.gl.bindBuffer(ge.GL_ARRAY_BUFFER, lreg.buffer);
            renderer.gl.vertexAttribPointer(0, 3, ge.GL_FLOAT, false, 12, 0);

            ge.webgl_shader_set_uniform_unsafe$("reg_pos", reg_pos)

            this.on_region_render(lreg, renderer, shader);

            if (this.wireframe) {
              ge.webgl_shader_set_uniform$("land_color", this.wire_color)
              renderer.gl.drawElements(ge.GL_LINES, lreg.di * 2, ge.GL_UNSIGNED_INT, (lreg.ds * 2) * 4);
            }


            if (this.shaded) {

              if (reg.smap) {
                renderer.use_texture(reg.smap, 2);

              }
              else {
                renderer.use_texture(renderer.default_texture, 2);
              }
             
              ge.webgl_shader_set_uniform$("land_color", this.shaded_color)
              renderer.gl.drawArrays(ge.GL_TRIANGLES, lreg.ds, lreg.di);
            }

            this.rendered_regions++;
          }

        }
        this.render_time = Date.now() - this.time_start;






      }
    })();


    function ge_terrain_mesh(def) {
      def = def || {};
      _super.apply(this, [def]);
      this.geometry = ge.geometry.geometry_data.create({ vertices: new Float32Array(0) });
      this.material = def.material || (new ge.terrain.material());
      this.processor = def.processor;
      this.regions = {};

      this.processor.add_host(this);


      this.camera_version = -121;

      this.terrian_scale = math.vec3(def.terrian_scale);
      this.ri = 0;
      this.rqi = 0;
      this.regions = {};
      this.region_max_tris = 0;
      this.camera_pos_x = Infinity;
      this.camera_pos_z = Infinity;
      this.camera_pos_y = 0;
      this.camera_vel_y = 0;
      this.timer = 0;
      this.terrain_quality = def.terrain_quality || 4;
      this.last_validate_time = 0;
      this.last_updated_time = 0;
      this.fixed_detail = - 1;
      this.region_offset = def.region_offset || 0;
      this.region_margin = def.region_margin || 1;
      this.rendered_regions = 0;
      if (def.fixed_detail !== undefined) {
        this.fixed_detail = def.fixed_detail;
      }
      this.region_distance = def.region_distance || 4;
      this.draw_distance = def.draw_distance || 2000;
      this.quality_distance = def.quality_distance || 1500;
      this.detail_levels = def.detail_levels || [1, 2, 6, 12, 20];

      this.height_on_camera = 0;
      this.time_step_size = def.time_step_size || (1 / 15);

      this.shaded_color = math.vec4(def.shaded_color || [1, 1, 1,1]);
      this.wire_color = math.vec4(def.wire_color || [2.0, 2.0, 2.0,1]);


      this.wireframe = def.wireframe || false;
      this.shaded = true;
      if (def.shaded !== undefined) this.shaded = def.shaded;
      this.regions_to_render = [];
      this.requested_regions = [];

      this.reg_req_flags = 0;


    }

    return ge_terrain_mesh;


  }, ge.geometry.mesh);






  ge.terrain.collision_mesh = ge.define(function (proto, _super) {

   





    proto.on_new_patch = function (patch) {

    }
    proto.on_region_data = (function (_super_func) {
      var x, z, i, pi;

      return function (reg, data, size, detail) {


        var lreg = this.regions[reg.key];

        if (!lreg.patches) {
          lreg.patches = [];
          x = (reg.x - this.processor.region_size_half);
          z = (reg.z - this.processor.region_size_half);

          for (i = 0; i < size; i += 3) {
            pi = data[i + 2];
            if (!lreg.patches[pi]) {
              lreg.patches[pi] = [];
            }
            lreg.patches[pi].push(
              (Math.floor(data[i] % (this.processor.region_size + 1)) * this.mesh_scale),
              data[i + 1] * this.mesh_scale,
              ((Math.floor(data[i] / (this.processor.region_size + 1))) * this.mesh_scale)
            );
          }
          for (i = 0; i < lreg.patches.length; i++)
            this.on_new_patch(lreg.patches[i], x, z);
        }


      }

    })(proto.on_region_data);





   
    function ge_terrain_collision_mesh(def) {
      def = def || {};
      _super.apply(this, [def]);
      this.reg_req_flags = 2;
      this.mesh_scale = 0.9965;
     // this.mesh_scale = 1.0015;
    }

    return ge_terrain_collision_mesh;


  }, ge.terrain.mesh);






  ge.terrain.land_mesh = ge.define(function (proto, _super) {



    proto.update = (function (_super_func) {

      var params = [null, null];

      return function (camera, timer) {
        params[0] = camera;
        params[1] = timer;

        _super_func.apply(this, params);
        this.cm.update(camera, timer);

      }

    })(proto.update);

    function ge_terrain_land_mesh(def) {
      def = def || {};
      def.terrian_scale = [1, 1, 1];
      def.processor = new ge.terrain.processor(def);

      _super.apply(this, [def]);
      this.cm = new ge.terrain.collision_mesh({
        processor: def.processor,
        quality_distance: 2000,
        draw_distance: 7000,
        fixed_detail: 32,
        region_distance: 8,
        terrain_quality: 8,
        wireframe: false,
        shaded: false,
        time_step_size: 1 / 5,
      });

      

    }

    return ge_terrain_land_mesh;


  }, ge.terrain.mesh);






  ge.terrain.patch_mesh = ge.define(function (proto, _super) {

    ge.terrain.patch_material = ge.define(function (proto, _super) {



      function ge_terrain_patch_material(def) {
        def = def || {};
        _super.apply(this, [def]);

        this.flags += ge.DISPLAY_ALWAYS;
      }


      return ge_terrain_patch_material;


    }, ge.shading.shaded_material);

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

    var hh0, hh1, hh2, hh3, hh4;
    var hdata, data_size, data_size2;
    var MIN_PATCH_SIZE = 4;
    var PATCH_SIZE = 16;
    var MIN_FAN_DETAIL = 4;
    function H(xp, zp) {
      return hdata[zp * data_size + xp];
    }

    fin.macro$(function terrain_patch_draw_triangle(x0$, z0$, x1$, z1$, x2$, z2$, s$) {
      ge.terrain_set_velevel$(x0$, z0$, s$)
      output[oi] = x0$;
      output[oi + 2] = z0$;
      output[oi + 3] = patch_index;
      oi += 6;

      ge.terrain_set_velevel$(x1$, z1$, s$)
      output[oi] = x1$;
      output[oi + 2] = z1$;
      output[oi + 3] = patch_index;
      oi += 6;

      ge.terrain_set_velevel$(x2$, z2$, s$)
      output[oi] = x2$;
      output[oi + 2] = z2$;
      output[oi + 3] = patch_index;
      oi += 6;


    }, ge);


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
            ge.terrain_patch_draw_triangle$(x, z, x + lfx * s, z + lfz * s, x + fx * s, z + fz * s, s)
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

        if (s > PATCH_SIZE || (s >MIN_PATCH_SIZE && rg_QT[i] > dd)) {
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
    var check_edge_cases=false;
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
            if (s >= MIN_PATCH_SIZE ) {
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

          if (check_for_edge_cases) {
            draw_fan(x, z, s, fd);
          }
          else {
            ge.terrain_patch_draw_triangle$(x - s, z - s, x + s, z - s, x + s, z + s, s)
            ge.terrain_patch_draw_triangle$(x - s, z - s, x + s, z + s, x - s, z + s, s)
          }
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

        //  nx = (((nx * _fp) + 1) * 0.5) * 1;
         // ny = (((ny * _fp) + 1) * 0.5) * 1;
        //  nz = (((nz * _fp) + 1) * 0.5) * 1;
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


    function ge_terrain_patch_mesh(def) {
      def = def || {};
      _super.apply(this, [def]);

      this.geometry = new ge.geometry.geometry_data();


      this.position = this.geometry.add_attribute("a_position_rw", {
        item_size: 3, data: new Float32Array(0), stride: 8 * 4
      });
      
      this.geometry.add_attribute("a_normal_rw", {
        item_size: 3, stride: 8 * 4, offset: 3 * 4,
      });

      this.geometry.add_attribute("a_uv_rw", {
        item_size: 2, stride: 8 * 4, offset: 6 * 4,
      });
      

      this.material = def.material || (new ge.terrain.patch_material());



      var self = this;
      var divisor = def.divisor || 1;
      ge.load_working_image_data(def.url, function (image_data, width, height) {
        self.hdata = new Float32Array((def.size + 1) * (def.size + 1));
        for (var i = 0; i < image_data.length / 4; i++) {
          self.hdata[i] = image_data[i * 4] / divisor;
        }
        self.data_size = def.size;
        hdata = self.hdata;
        data_size = self.data_size;
        data_size2 = data_size / 2;

        qii = 0;
        eval_area_height(data_size2, data_size2, data_size2, -1, 0);

        self.QT = new Float32Array(qii);
        var i = 0;
       
        while (i < qii) { self.QT[i] = output[i++]; }
        oi = 0;
        vmap.fill(255);
        output.fill(0);

        rasterize_patch(data_size2, data_size2, data_size2, def.details, self.QT);
        render_patches();

        calculate_output_data(0, oi, 0, 0, 1);

        self.position.data = new Float32Array((oi / 6) * 8);

        var ii = 0;
        for (i = 0; i < oi; i += 6) {
          self.position.data[ii] = output[i];
          self.position.data[ii+1] = output[i+1];
          self.position.data[ii+2] = output[i+2];
          self.position.data[ii+3] = output[i+3];
          self.position.data[ii + 4] = output[i + 4];
          self.position.data[ii + 5] = output[i + 5];

          self.position.data[ii + 6] = self.position.data[ii]/ data_size;
          self.position.data[ii + 7] = self.position.data[ii+2] / data_size;

          ii += 8;
        }
        self.draw_count = ii/8;
        self.position.data_length = ii;
        self.position.needs_update = true;
        console.log(output);
        console.log(self);

      }, def.size, def.size);
    }

    return ge_terrain_patch_mesh;


  }, ge.geometry.mesh);
 
}