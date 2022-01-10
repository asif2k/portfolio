function index(fin) {
 
  
  function before_load(fin, done) {
    fin.modules['osm'] = this;
    done();
  }


  var osm = this;

  function define(_creator, _super) {

    _super = _super || Object;
    var proto = {};
    Object.assign(proto, _super.prototype);
    var _class = _creator(proto, _super);
    _class.super_class = _super;
    _class.prototype = Object.create(_super.prototype);
    Object.assign(_class.prototype, proto);
    return (_class);
  };


  osm.str_hash= function (str) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };


  osm.object_pooler = define(function (proto) {


    proto.get = function (params) {
      if (this.freed > 0) {
        if (this.reuse)
          return this.reuse(this.free_objects[--this.freed], params);
        else
          return this.free_objects[--this.freed];
      }
      else {
        if (this.allocated >= this.pool_size) return null
        this.allocated++;
        return this.creator(params);
      }

    };
    proto.free = function (obj) {
      this.free_objects[this.freed++] = obj;
    };
    return function object_pooler(creator, reuse, pool_size) {
      this.creator = creator;
      this.reuse = reuse;
      this.allocated = 0;
      this.freed = 0;
      this.pool_size = pool_size || Infinity;
      this.free_objects = [];
    };
  });

  osm.qt = define(function (proto) {

    proto.init_root = function (minx, miny, maxx, maxy) {
      this.aclloc_node(minx, miny, maxx, maxy, 0);
    };



    proto.check_inbounds = function (bi, x, y) {
      if (x >= this.fmem[bi] && x <= this.fmem[bi + 2]) {
        if (y >= this.fmem[bi + 1] && y <= this.fmem[bi + 3]) {
          return true;
        }
      }
      return false;
    }

    proto.aclloc_node = function (minx, miny, maxx, maxy, level) {

      this.nodes_max_level = Math.max(this.nodes_max_level, level);
      var id = this.ii;
      this.ii += 4;



      var bi = this.if;
      this.if += 4;
      this.imem[id] = bi;
      this.imem[id + 1] = level;
      this.imem[id + 2] = 0;
      this.imem[id + 3] = 0;
      this.fmem[bi] = minx;
      this.fmem[bi + 1] = miny;
      this.fmem[bi + 2] = maxx;
      this.fmem[bi + 3] = maxy;
      this.nodes_count++;
      return id;
    };

    var work_stack = new Uint32Array(1024);
    var nchildern = [0, 0, 0, 0];


    proto.create_object = function (x, y) {
      var id = this.ii;
      this.ii += 4;
      var pi = this.if;
      this.if += 2;
      this.imem[id] = pi;
      this.fmem[pi] = x;
      this.fmem[pi + 1] = y;

      this.imem[id + 1] = 0;
      this.imem[id + 2] = 0;
      this.imem[id + 3] = 999999999;
      this.objects_count++;

      return id;

    }
    proto.link_object = function (id, link) {
      if (link > 0) this.imem[link + 2] = id;
      this.imem[id + 1] = link;
      return id;
    }
    proto.unlink_object = function (id) {
      var prev = this.imem[id + 1];
      var next = this.imem[id + 2];
      if (prev > 0) {
        this.imem[prev + 2] = this.imem[id + 2];
      }
      if (next > 0) {
        this.imem[next + 1] = prev;
      }
    }

    proto.link_object_node = function (nid, oid) {
      this.imem[nid + 3] = this.link_object(oid, this.imem[nid + 3]);
      this.imem[nid + 2] = this.imem[nid + 2] + 1;
      this.nodes_max_objects = Math.max(this.nodes_max_objects, this.imem[nid + 2]);

    }

   
    proto.add = function (x, y) {
      var imem = this.imem;
      var fmem = this.fmem;
      var pi, bi, iter = 0;
      var nc = nchildern;
      var st = work_stack;

      var id, pn = 0, ni = 0, olink, onext, oprev;
      var op, oop, si, ci, sw, sh, level, cc, nop, minx, miny, maxx, maxy;

      var oind = this.objects_in_node;

      si = 0;
      st[si++] = 0;

      op = this.create_object(x, y);
      id = 0;

      do {

        if (imem[id + 2] >= 100000) {
          pn = imem[id + 3];

          if (this.check_inbounds(imem[imem[pn]], x, y)) {
            st[si++] = imem[pn];
          }
          else if (this.check_inbounds(imem[imem[pn + 1]], x, y)) {
            st[si++] = imem[pn + 1];
          }
          else if (this.check_inbounds(imem[imem[pn + 2]], x, y)) {
            st[si++] = imem[pn + 2];
          }
          else if (this.check_inbounds(imem[imem[pn + 3]], x, y)) {
            st[si++] = imem[pn + 3];
          }

        }
        else if (this.check_inbounds(imem[id], x, y)) {
          this.nodes_max_level = Math.max(this.nodes_max_level, imem[id + 1]);
          if (imem[id + 2] < oind) {

            this.link_object_node(id, op);
            return op;


          }
          else {
            bi = imem[id];
            minx = fmem[bi]; miny = fmem[bi + 1];
            maxx = fmem[bi + 2]; maxy = fmem[bi + 3];


            sw = (maxx - minx) * 0.5;
            sh = (maxy - miny) * 0.5;
            level = imem[id + 1] + 1;

            pn = this.ii;
            this.ii += 4;


            imem[pn] = this.aclloc_node(minx, miny, minx + sw, miny + sh, level);
            imem[pn + 1] = this.aclloc_node(minx + sw, miny, maxx, miny + sh, level);
            imem[pn + 2] = this.aclloc_node(minx, miny + sh, minx + sw, maxy, level);
            imem[pn + 3] = this.aclloc_node(minx + sw, miny + sh, maxx, maxy, level);


            imem[id + 2] = 100000 + imem[id + 2]
            olink = imem[id + 3];
            imem[id + 3] = pn;


            while (olink > 0) {
              this.unlink_object(olink);
              oprev = imem[olink + 1];
              pi = imem[olink];
              ci = -1;
              for (ci = 0; ci < 4; ci++) {
                cc = imem[pn + ci];
                if (this.check_inbounds(imem[cc], fmem[pi], fmem[pi + 1])) {
                  this.link_object_node(cc, olink);
                  break;
                }
              }
              /*
              while (++ci < 4) {
               
              }
              */
              olink = oprev;
            }

            ci = -1;
            for (ci = 0; ci < 4; ci++) {
              cc = imem[pn + ci];
              if (this.check_inbounds(imem[cc], x, y)) {
                if (imem[cc + 2] < oind) {
                  this.link_object_node2(cc, op);
                  return op;
                }
                else {
                  st[si++] = cc;
                  break;
                }

                //
              }
            }
            /*
            while (++ci < 4) {
              
            }
            */
          }
        }


        iter++;
        this.msi = Math.max(this.msi, si);
        this.miter = Math.max(this.miter, iter);

        id = st[--si];
      } while (si > 0);
      return op;
    }


    proto.get_objects = function (gminx, gminy, gmaxx, gmaxy, result, max_level, node_cb) {

      // console.log(`select id from nodes where lon>=${gminx} and lon<=${gmaxx} and lat>=${gminy} and lat<=${gmaxy}`)
      //return
      var st = work_stack;
      var si = 0, iter = 0;
      var id = 0, pn = 0, bi = 0, level = 0, ri = 0, olink = 0, oprev = 0;
      var imem = this.imem;
      var fmem = this.fmem;

      var minx, miny, maxx, maxy, x, y;
      st[si++] = 0;

      do {
        level = imem[id + 1];
        if (level < max_level) {
          bi = imem[id];
          minx = fmem[bi];
          miny = fmem[bi + 1];
          maxx = fmem[bi + 2];
          maxy = fmem[bi + 3];
          if ((minx <= gmaxx && gminx <= maxx && miny <= gmaxy && gminy <= maxy)) {
            if (imem[id + 2] >= 100000) {
              pn = imem[id + 3];
              st[si++] = imem[pn];
              st[si++] = imem[pn + 1];
              st[si++] = imem[pn + 2];
              st[si++] = imem[pn + 3];
            }
            else {
              olink = imem[id + 3];
              if (node_cb) {
                node_cb(id, bi, imem, fmem);
              }
              while (olink > 0) {
                oprev = imem[olink + 1];
                result[ri++] = olink;
                olink = oprev;
              }
            }
          }

        }
        iter++;
        id = st[--si];
      } while (si > 0);
      // console.log(ri);
      return ri;
    }

    proto.init = function (max_nodes, objects_in_node, object_size, max_objects) {
      max_nodes = max_nodes || (8206040 * 2);
      max_objects = max_objects || 8206040

      this.objects_in_node = objects_in_node || 16;
      this.objects_in_node = Math.max(4, this.objects_in_node);

      this.node_size = 5;


      this.object_size = object_size || 4;
      this.object_size = Math.max(4, this.object_size);

      this.max_level = 40
      this.nodes_max_level = 0;
      this.nodes_count = 0;
      this.active_nodes_count = 0;
      this.objects_count = 0;
      this.msi = 0;

      this.ii = 0;
      this.if = 0;
      this.miter = 0;
      this.imem = new Uint32Array((max_nodes * (this.node_size)) + (max_objects * this.object_size));
      this.fmem = new Float32Array((max_nodes * 6) + (max_objects * 2));
    }

    return function qt() {


      this.objects_in_node = 16;

      this.node_size = 5;


      this.object_size = 4;

      this.max_level = 40
      this.nodes_max_level = 0;
      this.nodes_max_objects = 0;
      this.nodes_max_objects2 = 0;
      this.nodes_count = 0;
      this.active_nodes_count = 0;
      this.objects_count = 0;
      this.msi = 0;

      this.ii = 0;
      this.if = 0;
      this.miter = 0;
    }
  });





  osm.qt.dyn = define(function (proto, _super) {


    return function qtdyn() {
      _super.apply(this);
      this.miter = 0;
      this.imem = [];
      this.fmem = [];
    }
  }, osm.qt);


  

  osm.tile2lon=  function(x, zoom) {
    return (x / Math.pow(2, zoom) * 360 - 180);
  }

  osm.tile2lat= function(y, zoom) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
  }

  osm.lon2tile= function (lon, zoom) {
    return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
  }
  osm.lat2tile= function (lat, zoom) {
    return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
  }

  osm.tile_size= function (lon, lat, zoom) {

    const tileX = osm.lon2tile(lon, zoom);
    const tileZ = osm.lat2tile(lat, zoom);

    var slat = osm.tile2lat(tileZ, zoom);
    var slon = osm.tile2lon(tileX, zoom);
    var elat = osm.tile2lat(tileZ + 1, zoom);
    var elon = osm.tile2lon(tileX + 1, zoom);

    var minx = Math.min(elon, slon);
    var miny = Math.min(elat, slat);

    var maxx = Math.max(elon, slon);
    var maxy = Math.max(elat, slat);

    return [
      (maxx - minx),
      (maxy - miny)
    ];


  }


  osm.object_queue = define(function (proto) {

    proto.size = function () {
      return this._newestIndex - this._oldestIndex;
    };
    proto.enqueue = function (data) {
      this._storage[this._newestIndex] = data;
      this._newestIndex++;
    };


    proto.dequeue = function () {
      if (this._oldestIndex !== this._newestIndex) {
        var deletedData = this._storage[this._oldestIndex];
        this._storage[this._oldestIndex] = undefined;
        this._oldestIndex++;
        return deletedData;
      }
    };


    return function queue() {
      this._oldestIndex = 1;
      this._newestIndex = 1;
      this._storage = {};
    }

  });

  osm.bulk_url_loader = define(function (proto) {


    proto.load = function (url, params) {
      var xtp = this.pool.get();
      if (xtp === null) {
        this.park.enqueue([url, params]);
        return;
      }
      xtp.params = params;
      xtp.manager = this;
      xtp.responseType = "text";
      xtp.open("GET", url, !0);
      xtp.send();
    };


    proto.check_park = function () {
      if (this.park.size() > 0) {
        this.load.apply(this, this.park.dequeue());
      }
    };

    proto.free = function (xtp) {
      this.pool.free(xtp);
      xtp.params = undefined;
      xtp.manager = undefined;
      xtp.abort();

      this.check_park();
    };


    return function (pool_size) {
      this.park = new osm.object_queue();
      this.pool = new osm.object_pooler(function () {
        if (this.allocated <= this.max_size) {
          var xtp = new XMLHttpRequest;

          xtp.onload = function () {
            if (!this.manager) return;
            this.manager.onload(this, this.params);

            if (this.manager.auto_free) this.manager.free(this);
          };
          return xtp
        }
        this.allocated--;
        return null;
      });
      this.pool.max_size = pool_size;
      this.auto_free = true;
      return this;
    }




  });




  osm.googl_map_encode_styles= function(styles) {
    var ret = "";
    var styleparse_types = { "all": "0", "administrative": "1", "administrative.country": "17", "administrative.land_parcel": "21", "administrative.locality": "19", "administrative.neighborhood": "20", "administrative.province": "18", "landscape": "5", "landscape.man_made": "81", "landscape.natural": "82", "poi": "2", "poi.attraction": "37", "poi.business": "33", "poi.government": "34", "poi.medical": "36", "poi.park": "40", "poi.place_of_worship": "38", "poi.school": "35", "poi.sports_complex": "39", "road": "3", "road.arterial": "50", "road.highway": "49", "road.local": "51", "transit": "4", "transit.line": "65", "transit.station": "66", "water": "6" };
    var styleparse_elements = { "all": "a", "geometry": "g", "geometry.fill": "g.f", "geometry.stroke": "g.s", "labels": "l", "labels.icon": "l.i", "labels.text": "l.t", "labels.text.fill": "l.t.f", "labels.text.stroke": "l.t.s" };
    var styleparse_stylers = { "color": "p.c", "gamma": "p.g", "hue": "p.h", "invert_lightness": "p.il", "lightness": "p.l", "saturation": "p.s", "visibility": "p.v", "weight": "p.w" };
    for (i = 0; i < styles.length; i++) {
      if (styles[i].featureType) {
        ret += "s.t:" + styleparse_types[styles[i].featureType] + "|";
      }
      if (styles[i].elementType) {
        if (!styleparse_elements[styles[i].elementType])
          console.log("style element transcription unkown:" + styles[i].elementType);
        ret += "s.e:" + styleparse_elements[styles[i].elementType] + "|";
      }
      if (styles[i].stylers) {
        for (u = 0; u < styles[i].stylers.length; u++) {
          var keys = [];
          var cstyler = styles[i].stylers[u]
          for (var k in cstyler) {
            if (k == "color") {
              if (cstyler[k].length == 7)
                cstyler[k] = "#ff" + cstyler[k].slice(1);
              else if (cstyler[k].length != 9)
                console.log("malformed color:" + cstyler[k]);
            }
            ret += styleparse_stylers[k] + ":" + cstyler[k] + "|";
          }
        }
      }
      ret = ret.slice(0, ret.length - 1);
      ret += ","
    }
    return encodeURIComponent(ret.slice(0, ret.length - 1));
  }

  osm.image_tiles_loader = define(function (proto) {



    proto.get_tile_image = function (url) {
      if (this.tiles_loading[url]) {
        if (this.tiles_loading[url].loaded) {
          this.tiles_loading[url].last_time = Date.now();
          return this.tiles_loading[url];
        }
      }
      else {
        this.tiles_loading[url] = this.image_pool.get(url);
      }
    }

    proto.clean_up = () => {
      if (Date.now() - this.clean_up_last_time < 3000) return;
      var deleted = [];
      this.clean_up_last_time = Date.now();
      for (let url in this.tiles_loading) {
        if (this.tiles_loading[url].loaded) {
          if (Date.now() - this.tiles_loading[url].last_time > 3000) {
            deleted.push(url);

          }
        }
      }
      deleted.forEach(url => {
        this.tiles_loading[url].loaded = false;
        this.image_pool.free(this.tiles_loading[url]);
        delete this.tiles_loading[url];
      });
    }

    proto.on_tile_loaded = function (img) {

    }
    return function image_tiles_loader() {
      this.tiles_loading = {};
      this.image_pool = new osm.object_pooler((url) => {
        const img = new Image();
        img.onload = () => {
          img.loaded = true;
          img.last_time = Date.now();
          this.on_tile_loaded(img);

        }
        img.src = url;
        return img;
      }, (img, url) => {
        img.loaded = false;
        img.src = url;
        return img;
      });



    };
  });


  osm.nodes_tiles_manager = define(function (proto) {
    proto.by_tile = function (tileZ, tileX, tileZoom, result) {

      const slat = osm.tile2lat(tileZ, tileZoom);
      const slon = osm.tile2lon(tileX, tileZoom);
      const elat = osm.tile2lat(tileZ + 1, tileZoom);
      const elon = osm.tile2lon(tileX + 1, tileZoom);


      const minx = Math.min(elon, slon);
      const miny = Math.min(elat, slat);

      const maxx = Math.max(elon, slon);
      const maxy = Math.max(elat, slat);
      return this.nqt.get_objects(minx, miny, maxx, maxy, result, 40);

    }
    proto.load_tile_key = function (tkey) {
      if (!this.tiles_requested[tkey]) {
        this.tiles_requested[tkey] = true;
        this.nodes_loader.load(this.server_url + tkey, tkey);
      }
    }

    return function nodes_tiles_manager(server_url) {
      this.nodes_loader = new osm.bulk_url_loader(5);
      this.server_url = server_url ||  "http://localhost:8088"
      this.tiles_requested = {};
      var nr = 0;
      var nqt = new osm.qt.dyn();

      nqt.nodes = {};
      nqt.nodes_ref = [];
      nqt.ways = {};
      var self = this;
      this.nodes_loader.onload = function (xtp, tkey) {
        var data = JSON.parse(xtp.response);
        self.tiles_requested[tkey] = data.nodes.length;
        var node;
        for (var i = 0; i < data.nodes.length; i++) {
          node = data.nodes[i];
          if (!nqt.nodes[node.id]) {
            nqt.nodes[node.id] = node;
            nr = nqt.nodes_ref.length;
            nqt.nodes_ref[nr] = node.id;

            if (nqt.ii == 0) {
              var b = data.bounds;
              nqt.init_root(parseFloat(b.minx), parseFloat(b.miny), parseFloat(b.maxx), parseFloat(b.maxy));
            }

            node.lon = parseFloat(node.lon);
            node.lat = parseFloat(node.lat);

            nqt.imem[nqt.add(node.lon, node.lat) + 3] = nr;
          }
        }
      };

      this.nqt = nqt;


    };
  });


  


}