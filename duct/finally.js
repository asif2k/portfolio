var fin = {}
var saveAs = saveAs || function (e) { "use strict"; if (typeof e === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) { return } var t = e.document, n = function () { return e.URL || e.webkitURL || e }, r = t.createElementNS("http://www.w3.org/1999/xhtml", "a"), o = "download" in r, a = function (e) { var t = new MouseEvent("click"); e.dispatchEvent(t) }, i = /constructor/i.test(e.HTMLElement) || e.safari, f = /CriOS\/[\d]+/.test(navigator.userAgent), u = function (t) { (e.setImmediate || e.setTimeout)(function () { throw t }, 0) }, s = "application/octet-stream", d = 1e3 * 40, c = function (e) { var t = function () { if (typeof e === "string") { n().revokeObjectURL(e) } else { e.remove() } }; setTimeout(t, d) }, l = function (e, t, n) { t = [].concat(t); var r = t.length; while (r--) { var o = e["on" + t[r]]; if (typeof o === "function") { try { o.call(e, n || e) } catch (a) { u(a) } } } }, p = function (e) { if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)) { return new Blob([String.fromCharCode(65279), e], { type: e.type }) } return e }, v = function (t, u, d) { if (!d) { t = p(t) } var v = this, w = t.type, m = w === s, y, h = function () { l(v, "writestart progress write writeend".split(" ")) }, S = function () { if ((f || m && i) && e.FileReader) { var r = new FileReader; r.onloadend = function () { var t = f ? r.result : r.result.replace(/^data:[^;]*;/, "data:attachment/file;"); var n = e.open(t, "_blank"); if (!n) e.location.href = t; t = undefined; v.readyState = v.DONE; h() }; r.readAsDataURL(t); v.readyState = v.INIT; return } if (!y) { y = n().createObjectURL(t) } if (m) { e.location.href = y } else { var o = e.open(y, "_blank"); if (!o) { e.location.href = y } } v.readyState = v.DONE; h(); c(y) }; v.readyState = v.INIT; if (o) { y = n().createObjectURL(t); setTimeout(function () { r.href = y; r.download = u; a(r); h(); c(y); v.readyState = v.DONE }); return } S() }, w = v.prototype, m = function (e, t, n) { return new v(e, t || e.name || "download", n) }; if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) { return function (e, t, n) { t = t || e.name || "download"; if (!n) { e = p(e) } return navigator.msSaveOrOpenBlob(e, t) } } w.abort = function () { }; w.readyState = w.INIT = 0; w.WRITING = 1; w.DONE = 2; w.error = w.onwritestart = w.onprogress = w.onwrite = w.onabort = w.onerror = w.onwriteend = null; return m }(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content); if (typeof module !== "undefined" && module.exports) { module.exports.saveAs = saveAs } else if (typeof define !== "undefined" && define !== null && define.amd !== null) { define("FileSaver.js", function () { return saveAs }) }

var LZString;
(function () {
  LZString = function () { function a(a, b) { if (!e[a]) { e[a] = {}; for (var c = 0; c < a.length; c++) e[a][a.charAt(c)] = c } return e[a][b] } var b = String.fromCharCode, c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$", e = {}, f = { compressToBase64: function (a) { if (null == a) return ""; var b = f._compress(a, 6, function (a) { return c.charAt(a) }); switch (b.length % 4) { default: case 0: return b; case 1: return b + "==="; case 2: return b + "=="; case 3: return b + "=" } }, decompressFromBase64: function (b) { return null == b ? "" : "" == b ? null : f._decompress(b.length, 32, function (d) { return a(c, b.charAt(d)) }) }, compressToUTF16: function (a) { return null == a ? "" : f._compress(a, 15, function (a) { return b(a + 32) }) + " " }, decompressFromUTF16: function (a) { return null == a ? "" : "" == a ? null : f._decompress(a.length, 16384, function (b) { return a.charCodeAt(b) - 32 }) }, compressToUint8Array: function (a) { for (var b = f.compress(a), c = new Uint8Array(2 * b.length), d = 0, e = b.length; e > d; d++) { var g = b.charCodeAt(d); c[2 * d] = g >>> 8, c[2 * d + 1] = g % 256 } return c }, decompressFromUint8Array: function (a) { if (null === a || void 0 === a) return f.decompress(a); for (var c = new Array(a.length / 2), d = 0, e = c.length; e > d; d++) c[d] = 256 * a[2 * d] + a[2 * d + 1]; var g = []; return c.forEach(function (a) { g.push(b(a)) }), f.decompress(g.join("")) }, compressToEncodedURIComponent: function (a) { return null == a ? "" : f._compress(a, 6, function (a) { return d.charAt(a) }) }, decompressFromEncodedURIComponent: function (b) { return null == b ? "" : "" == b ? null : (b = b.replace(/ /g, "+"), f._decompress(b.length, 32, function (c) { return a(d, b.charAt(c)) })) }, compress: function (a) { return f._compress(a, 16, function (a) { return b(a) }) }, _compress: function (a, b, c) { if (null == a) return ""; var d, e, f, g = {}, h = {}, i = "", j = "", k = "", l = 2, m = 3, n = 2, o = [], p = 0, q = 0; for (f = 0; f < a.length; f += 1) if (i = a.charAt(f), Object.prototype.hasOwnProperty.call(g, i) || (g[i] = m++, h[i] = !0), j = k + i, Object.prototype.hasOwnProperty.call(g, j)) k = j; else { if (Object.prototype.hasOwnProperty.call(h, k)) { if (k.charCodeAt(0) < 256) { for (d = 0; n > d; d++) p <<= 1, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++; for (e = k.charCodeAt(0), d = 0; 8 > d; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1 } else { for (e = 1, d = 0; n > d; d++) p = p << 1 | e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e = 0; for (e = k.charCodeAt(0), d = 0; 16 > d; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1 } l--, 0 == l && (l = Math.pow(2, n), n++), delete h[k] } else for (e = g[k], d = 0; n > d; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1; l--, 0 == l && (l = Math.pow(2, n), n++), g[j] = m++, k = String(i) } if ("" !== k) { if (Object.prototype.hasOwnProperty.call(h, k)) { if (k.charCodeAt(0) < 256) { for (d = 0; n > d; d++) p <<= 1, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++; for (e = k.charCodeAt(0), d = 0; 8 > d; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1 } else { for (e = 1, d = 0; n > d; d++) p = p << 1 | e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e = 0; for (e = k.charCodeAt(0), d = 0; 16 > d; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1 } l--, 0 == l && (l = Math.pow(2, n), n++), delete h[k] } else for (e = g[k], d = 0; n > d; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1; 0 == --l && (l = Math.pow(2, n), n++) } for (e = 2, d = 0; n > d; d++) p = p << 1 | 1 & e, q == b - 1 ? (q = 0, o.push(c(p)), p = 0) : q++, e >>= 1; for (; ;) { if (p <<= 1, q == b - 1) { o.push(c(p)); break } q++ } return o.join("") }, decompress: function (a) { return null == a ? "" : "" == a ? null : f._decompress(a.length, 32768, function (b) { return a.charCodeAt(b) }) }, _decompress: function (a, c, d) { var e, f, g, h, i, j, k, l = [], m = 4, n = 4, o = 3, p = "", q = [], r = { val: d(0), position: c, index: 1 }; for (e = 0; 3 > e; e += 1) l[e] = e; for (g = 0, i = Math.pow(2, 2), j = 1; j != i;) h = r.val & r.position, r.position >>= 1, 0 == r.position && (r.position = c, r.val = d(r.index++)), g |= (h > 0 ? 1 : 0) * j, j <<= 1; switch (g) { case 0: for (g = 0, i = Math.pow(2, 8), j = 1; j != i;) h = r.val & r.position, r.position >>= 1, 0 == r.position && (r.position = c, r.val = d(r.index++)), g |= (h > 0 ? 1 : 0) * j, j <<= 1; k = b(g); break; case 1: for (g = 0, i = Math.pow(2, 16), j = 1; j != i;) h = r.val & r.position, r.position >>= 1, 0 == r.position && (r.position = c, r.val = d(r.index++)), g |= (h > 0 ? 1 : 0) * j, j <<= 1; k = b(g); break; case 2: return "" } for (l[3] = k, f = k, q.push(k); ;) { if (r.index > a) return ""; for (g = 0, i = Math.pow(2, o), j = 1; j != i;) h = r.val & r.position, r.position >>= 1, 0 == r.position && (r.position = c, r.val = d(r.index++)), g |= (h > 0 ? 1 : 0) * j, j <<= 1; switch (k = g) { case 0: for (g = 0, i = Math.pow(2, 8), j = 1; j != i;) h = r.val & r.position, r.position >>= 1, 0 == r.position && (r.position = c, r.val = d(r.index++)), g |= (h > 0 ? 1 : 0) * j, j <<= 1; l[n++] = b(g), k = n - 1, m--; break; case 1: for (g = 0, i = Math.pow(2, 16), j = 1; j != i;) h = r.val & r.position, r.position >>= 1, 0 == r.position && (r.position = c, r.val = d(r.index++)), g |= (h > 0 ? 1 : 0) * j, j <<= 1; l[n++] = b(g), k = n - 1, m--; break; case 2: return q.join("") } if (0 == m && (m = Math.pow(2, o), o++), l[k]) p = l[k]; else { if (k !== n) return null; p = f + f.charAt(0) } q.push(p), l[n++] = f + p.charAt(0), m--, f = p, 0 == m && (m = Math.pow(2, o), o++) } } }; return f }(); "function" == typeof define && define.amd ? define(function () { return LZString }) : "undefined" != typeof module && null != module && (module.exports = LZString)
})();


fin.compressBase64 = function (str) {
  return LZString.compressToBase64(str);
};

fin.decompressBase64 = function (str) {
  return LZString.decompressFromBase64(str);
};

fin.$A = function () {
  var str = '';
  for (var i = 0; i < arguments.length; i++) {
    str = str + arguments[i];
  }
  return str;
}

fin.guidi = (function () {
  var guidCounter = 0;
  return function () {
    return (Date.now() + guidCounter++);
  }
})();




fin.define = function (_creator, _super) {

  _super = _super || Object;
  var proto = {};
  Object.assign(proto, _super.prototype);
  var _class = _creator(proto, _super);
  _class.super_class = _super;
  
  _class.prototype = Object.create(_super.prototype);
  Object.assign(_class.prototype, proto);
  return (_class);
};

fin.queue = fin.define(function (proto) {

  proto.size = function () {
    return this._newestIndex - this._oldestIndex;
  };
  proto.enqueue = function (data) {
    this._storage[this._newestIndex] = data;
    this._newestIndex++;
    return data;
  };

  proto.realign = function () {
    let count = this.size();
    let i = 0;
    for (i = 0; i < count; i++) {
      this._storage[i + 1] = this._storage[this._oldestIndex + i];
    }
    for (i = this._oldestIndex; i < this._newestIndex; i++) {
      this._storage[i] = undefined;
    }

    this._oldestIndex = 1;
    this._newestIndex = this._oldestIndex+ count;
  }


  proto.dequeue = function () {
    if (this._oldestIndex !== this._newestIndex) {
      var deletedData = this._storage[this._oldestIndex];
      this._storage[this._oldestIndex] = undefined;
      this._oldestIndex++;
      return deletedData;
    }
  };

  proto.peek = function () {
    return this._storage[this._oldestIndex];
  }

  return function queue() {
    this._oldestIndex = 1;
    this._newestIndex = 1;
    this._storage = {};
  }

});


fin.merge_sort = (function (array, comparefn) {
  var i, j, k;
  function merge(arr, aux, lo, mid, hi, comparefn) {
    i = lo;
    j = mid + 1;
    k = lo;

    while (true) {
      if (comparefn(arr[i], arr[j]) <= 0) {
        aux[k++] = arr[i++];
        if (i > mid) {
          do
            aux[k++] = arr[j++];
          while (j <= hi);
          break;
        }
      } else {
        aux[k++] = arr[j++];
        if (j > hi) {
          do
            aux[k++] = arr[i++];
          while (i <= mid);
          break;
        }
      }
    }
  }

  function sortarrtoaux(arr, aux, lo, hi, comparefn) {
    if (hi < lo) return;
    if (hi == lo) {
      aux[lo] = arr[lo];
      return;
    }
    var mid = Math.floor(lo + (hi - lo) * 0.5);
    sortarrtoarr(arr, aux, lo, mid, comparefn);
    sortarrtoarr(arr, aux, mid + 1, hi, comparefn);
    merge(arr, aux, lo, mid, hi, comparefn);
  }

  function sortarrtoarr(arr, aux, lo, hi, comparefn) {
    if (hi <= lo) return;
    var mid = Math.floor(lo + (hi - lo) * 0.5);
    sortarrtoaux(arr, aux, lo, mid, comparefn);
    sortarrtoaux(arr, aux, mid + 1, hi, comparefn);
    merge(aux, arr, lo, mid, hi, comparefn);
  }


  var aux = [], ai = 0;;
  function merge_sort(arr, al, comparefn) {
    ai = 0;
    for (i = 0; i < al; i++)
      aux[ai++] = arr[i];

    sortarrtoarr(arr, aux, 0, al - 1, comparefn);
    return arr;
  }



  return merge_sort;
})();
fin.url_loader = (function () {
  var parking = new fin.queue();
  var xtp = new XMLHttpRequest;
  console.log("parking", parking);
  function process(url, cb, t, params) {
    if (xtp.isBusy) {
      parking.enqueue([url, cb, t, params]);
      return;
    }
    xtp.onload = function () {
      if (cb) cb(this.response, params);
      this.abort();
      this.isBusy = false;

      if (parking.size() > 0) {
        process.apply(this, parking.dequeue());
      }
    };
    xtp.responseType = t || "text";
    xtp.isBusy = true;
    xtp.open("GET", url, !0);
    xtp.send();
  }
  return process;

})();

fin.array = fin.define(function (proto) {

  proto.push = function (element) {
    this.data[this.length++] = element;
  };
  proto.peek = function () {
    return this.data[this.length - 1];
  };

  proto.pop = function () {
    if (this.length === 0) return null;
    return this.data[--this.length];
  };

  proto.clear = function () {
    this.length = 0;
  };

  proto.for_each = function (cb, self) {
    this.index = 0;
    while (this.index < this.length) {
      cb(this.data[this.index], this.index++, self);
    }
    this.index = 0;
  };

  proto.next = function () {
    if (this.index < this.length) {
      return this.data[this.index++];
    }
    return null;

  };
  return function array() {
    this.data = [];
    this.length = 0;
    this.index = 0;
  }
});
fin.object_pooler = fin.define(function (proto) {

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

fin.event = fin.define(function (proto) {
  proto.add = function (cb, callee) {
    callee = callee || this.owner;
    this.handlers[this.handlers.length] = [cb, callee];
  };
  proto.trigger = function (params) {
    for (var i = 0; i < this.handlers.length; i++)
      if (this.handlers[i][0].apply(this.handlers[i][1], params) === false) return false;
  };

  proto.trigger_params = function () {
    for (var i = 0; i < this.handlers.length; i++)
      if (this.handlers[i][0].apply(this.handlers[i][1], this.params) === false) return false;
  };

  return function event(owner, params) {
    this.owner = owner;
    this.handlers = [];
    this.params = params;
  };
});

fin.each_index = function (callback, index) {
  var func = function (index) {
    callback(index, func);
  };
  func(index || 0);
}

fin.rg=function(match, func) {
  if (match !== null) match.forEach(func);
}

fin.merge_object = (function () {
  var key, type;
  var func = function (source, dest, merge_only_not_exist) {
    for (var key in source) {
      type = Object.prototype.toString.call(source[key]).toLocaleLowerCase();
      if (type === '[object object]') {
        if (dest[key] !== undefined) func(source[key], dest[key], merge_only_not_exist);
        else if (merge_only_not_exist) {
          dest[key] = {};
          func(source[key], dest[key], merge_only_not_exist);
        }
      }
      else {
        if (merge_only_not_exist) {
          if (dest[key] === undefined) {
            dest[key] = source[key];
          }
        }
        else {
          dest[key] = source[key];
        }
      }
    }
    return dest;
  }
  return func;

})();
fin.create_float32 = (function (len, creator) {
  creator = creator || function (out) {
    return out;
  }
  var x = 0;
  return function () {
    var out = creator(new Float32Array(len));
    if (arguments[0] === undefined) return out;
    if (arguments.length === 1 && arguments[0].length > 0) {
      for (x = 0; x < arguments[0].length; x++)
        if (x < len) out[x] = arguments[0][x];
    }
    else {
      for (x = 0; x < arguments.length; x++)
        if (x < len) out[x] = arguments[x];
    }
    return out;
  }
});


fin.macro = function (func, modu, scope) {

  var text = func.toString();
  var mac = {name:func.name, scope: scope };
  mac.args = fin.parse_args_from_func(text);



  if ((/return.*\(/).test(text)) {    
    text = (new Function('return ' + text))()();
  }
  else {
    text = text.replace(/function.*\(.*\).*{/, '').replace(/}$/g, '').trim();
  }
  
  modu.macro_scopes = modu.macro_scopes || {};

  if (scope) {
    modu.macro_scopes[scope.name] = scope;
  }

  mac.text = text.trim();
  if ((/return.*function.*\(/).test(text)) {
    mac.func = (new Function('return function(' + mac.args.join(",") + '){' + text + '}'))();
  }

  modu['$'+func.name] = mac
  return func;
}

fin.macro_scope = function (func,name) {

  var s = func.toString().replace(/function.*\(/, '');
  var scope = { name: name, vars: [], key: 'S' + (fin.macro_scope.index++)};
  s.substr(0, s.indexOf(')')).trim().split(",").forEach(function (a, i) {
    if (i > 0) {
      scope.vars.push(a.trim());
    }

  });
    
  func(scope);

};
fin.macro_scope.index = 0;

fin.parse_macros = function (text,scope) {
  var modu, mname, mac, rg;
  fin.rg(text.match(/.*\$\(.*\)/g), function (s) {
    s = s.trim();

    mname = s.substr(0, s.indexOf(".")).trim();
    
    modu = fin.modules[mname];
    if (modu) {
      var m = '$' + s.substr(mname.length + 1, s.indexOf('$') - mname.length).replace(/\$/g, '');

      if (modu[m]) {
        mac = modu[m];
        var args = [];
        s.replace(/.*\(/, '').replace(/\)$/, '').split(",").forEach(function (a, i) {
          args[i] = a.trim();
        });
        
        var code = mac.text;
        if (mac.func) {
          code = mac.func.apply(mac, args).toString().replace(/function.*\(.*\).*{/, '').replace(/}$/g, '');
        }
        
        mac.args.forEach(function (a, i) {
          rg = new RegExp(a.replace(/\$/g, "\\$"), "g");
          code = code.replace(rg, args[i]);
        });
        code = fin.parse_macros(code, scope);
        if (mac.name === "transform_mult") {
        //  console.log("transform_mult", args);
//          console.log(code);
        }
       
        if (mac.scope) {
          mac.scope.vars.forEach(function (a, i) {
            if (a.indexOf("$") > -1) {
              rg = new RegExp(a.replace(/\$/g, "\\$"), "g");
              a = mac.scope.key + a;

              code = code.replace(rg, a);              
            }            
            if (code.indexOf(a) > -1) {
              scope[mac.scope.name] = scope[mac.scope.name] || {};
              scope[mac.scope.name][a] = a;

            }

          });
        }
        text = text.replace(s, code);
      }

    }
    
  });

  return text;
}



fin.modules = {};
fin.modules['fin'] = fin;
fin.module = fin.define(function (proto) {
  return function fin_module() {
    this.sources = [];
    this.children = [];
  }

});
console.log("modules", fin.modules);
Array.prototype.for_each = function (cb, base) {
  this.forEach(function (a, i) {
    cb(a, i, base);
  });
}


fin.is_function = function (obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
};

fin.traverse_object = (function () {
  let key;
  function func(obj, cb, pkey) {
    pkey = pkey || "";
    pkey = pkey.length > 0 ? pkey + "." : pkey;
    for (key in obj) {
      if (Object.prototype.toString.call(obj[key]).toLocaleLowerCase() === '[object object]' || fin.is_function(obj[key])) {
        func(obj[key], cb, pkey + key);
      }
      else cb(pkey + key, obj[key],obj,key);
    }
  }

  return func;

})();

fin.parse_args_from_func = function (text) {
  var args;
  fin.rg(text.match(/function.*\(.*\)/), function (s) {
    args = s.replace(/function.*\(/, '').replace(')', '').split(",");
    args.forEach(function (a, i) {
      args[i] = a.trim();
    })
  });
  
  return args || [];
}



fin.parse_resouce = function (text,base_url, done,scope) {

  var res = [];
  //text = fin.parse_macros(text,scope);


  fin.rg(text.match(/import\(["'\s][\s\S]*?.*["'\s]\)/g), function (s) {
    if (s) {      
      res.push(s);
    }
    
  });
  
  if (res.length > 0) {
    fin.each_index(function (i, next) {
      var s = res[i];
      var url = base_url +(s.replace(/import\(/, '').replace(")", '').replace(/\'|\"/g, ''));
      fin.load_module_source(url, function (data) {
        fin.parse_resouce(data, url, function (rtext) {
          text = text.replace(s, rtext);
          if (i < res.length - 1) {
            next(i + 1);
          }
          else done(text);
        }, scope);


      });
      
    })

  }
  else {
    done(text);
  }
  

}



fin.module_loader = function (modu, urls, path, done) {
  fin.each_index(function (i, next) {
    fin.load_module_source(path + urls[i], function (data) {
      fin.resolve_dependencies(path + urls[i], data, function () {
        if (i < urls.length - 1) next(i + 1); else done();
      }, modu);
    });
  });
}

fin.module_source_cache = {};
fin.module_source_cache_enabled = false;
fin.load_module_source = function (url, cb) {

  if (fin.module_source_cache[url]) {
    cb(fin.module_source_cache[url]);
    return;
  }

  fin.url_loader(url, function (data) {
    if (fin.module_source_cache_enabled) {
      fin.module_source_cache[url] = data;
    }    
    cb(data);
  });
}


fin.trace_brackets = function (chars, i,st,et) {
  var bc = 1;
  st = st || '{';
  et = et || '}';
  while (bc !== 0 && i < chars.length) {
    if (chars[i] === st) bc++;
    else if (chars[i] === et) bc--;
    i++;
  }
  return i;
}

fin.source_handlers = [];
fin.constants_replacer = [];

fin.add_constant = function (key, value) {
  fin.constants_replacer.push([key, value, null]);
}
fin.sort_constants = function () {
  fin.constants_replacer.sort(function (a, b) {
    return b[0].length - a[0].length;
  });
}

fin.process_constants=function(text) {
  fin.constants_replacer.forEach(function (a) {
    if (!a[2]) {
      a[2] = new RegExp(a[0], 'g');
    }
    text = text.replace(a[2], a[1]);
  });
  return text;
}

fin.compiled_sources = [];

fin.handle_begin_load = function (modu,text,scope, done) {
  if ((/function.*before_load.*\(.*\).*{/).test(text)) {
    fin.rg(text.match(/function.*before_load.*\(.*\).*{/), function (d) {
      var i = text.indexOf(d);
      fin.trace_brackets(text.split(''), i + d.length + 1);
      d = text.substr(i, fin.trace_brackets(text.split(''), i + d.length + 1) - i);
      text = text.replace(d, '');
      var args = [];
      fin.parse_args_from_func(d).forEach(function (a, i) {
        args[i] = fin.modules[a.trim()];
      });

      args[args.length - 1] = function () {
        text = fin.parse_macros(text, scope);
        done(text);

      }
      setTimeout(function () {
        (new Function('return ' + d)()).apply(modu, args);
      }, 100);
      
      

      

    });
  }
  else done(text);
  

}

fin.compile = function () {

  var ff = {
    modules: {},
    define: fin.define,
    queue: fin.queue,
    guidi: fin.guidi,
    create_float32: fin.create_float32,
    object_pooler: fin.object_pooler,
    merge_object: fin.merge_object,
    merge_sort: fin.merge_sort,
    macro_scope: function (func, name) { func();return func;}, macro: function (func, modu, scope) {return func;}
  };
  ff.modules['fin'] = ff;

  (new Function('fin', 'console.log(fin);' + fin.compiled_sources.join(';')))(ff);



  
  console.log(ff);

  fin.compiled_sources.forEach(function (s) {
    
  });

}

fin.resolve_dependencies = function (call_url,text, done,pmodu) {

  //console.log(call_url);


  function finished() {
    var modu = new fin.module();
    modu.path = call_url.replace(call_url.split("/").pop(), '');    
    var  args_names = [];
    fin.parse_args_from_func(text).forEach(function (a, i) {
      args_names[i] = a.trim();
    });
    var scope = {};
    fin.parse_resouce(text, modu.path, function (text) {

      text = text.trim();      

      var inline_macros = [];
      fin.rg(text.match(/fin.macro\$\(/g), function (d) {
        var i = text.indexOf(d);
        fin.trace_brackets(text.split(''), i + d.length + 1);
        d = text.substr(i, fin.trace_brackets(text.split(''), i + d.length + 1, '(', ')') - i);
        text = text.replace(d, '');
        inline_macros.push(d.replace('fin.macro$', 'fin.macro'));

      });

      modu.inline_macros = inline_macros;
      
      fin.handle_begin_load(modu, text, scope, function (text) {    

        if (fin.source_handlers.length > 0) {
          fin.each_index(function (index, next) {
            fin.source_handlers[index](text, function (handled_text) {
              text = handled_text;
              if (index < fin.source_handlers.length - 1) next(index + 1);
            });
          });
        }

        modu.url = call_url;        
        modu.args_names = args_names.slice();        
        modu.scope = scope;
        modu.text = text;

        if (pmodu)
          pmodu.children.push(modu);
        else fin.load_modules.push(modu);
        done();        
      });

      
    },scope);

  }
  if ((/dependencies.*\(/).test(text)) {
    fin.rg(text.match(/dependencies.*\([\s\S]*?\)\;/g), function (d) {
      text = text.replace(d, '');
      (new Function('dependencies', d))(function (deps) {
        var url;
        function next_item(i, next) {
          if (i < deps.length - 1) {
            next(i + 1);
          }
          else {
            finished();
          }
        }
        fin.each_index(function (i, next) {
          var item = deps[i];
          if (item.push) {
            if (item[0] === "cache_inline") {
              (new Function("fin", fin.decompressBase64(item[1])))(fin);
              next_item(i, next);
              return;
            }
            else if (!fin.modules[item[0]]) {
              url = item[1];
            }
            else return next_item(i, next);
          }
          else {
            url = item;
          }      
          fin.load_module_source(url, function (data) {
            fin.resolve_dependencies(url, data, function () {
              next_item(i, next);
            });

          });

        });
      });


    });
  }
  else finished();
}

fin.runing_code = [];

fin.process_module = function (modu) {
  //console.log(modu.url, modu);

  var text = modu.text;
  var args = [];

  modu.args_names.forEach(function (a, i) {
    args[i] = fin.modules[a];
  });
  text = fin.parse_macros(text, modu.scope);


 

  if (modu.inline_macros.length > 0) {
    (new Function('return function(' + modu.args_names.join(",") + '){ ' + modu.inline_macros.join('; ') + ' } ')()).apply(modu, args);
    text = fin.parse_macros(text, modu.scope);
  }
    

  if (Object.keys(modu.scope).length > 0) {
    var vars;

   // console.log("modu.scope", modu.scope);
    fin.rg(text.match(/macro_scope\$.*\(.*\)/g), function (d) {
      var s = d.replace(/macro_scope\$.*\(/, '').replace(')', '').replace(/\"|\'/g, '').trim();
      if (s.length === 0) {
        for (s in modu.scope) {
          vars = Object.keys(modu.scope[s]).join(",");
          
          if (vars.length > 0) vars = 'var ' + vars + ';';
          text = text.replace(d, vars);
        }
      }
      else {
        if (modu.scope[s]) {
          vars = Object.keys(modu.scope[s]).join(",");
          
          if (vars.length > 0) vars = 'var ' + vars + ';';
          text = text.replace(d, vars);
        }
      }
    });
  }
  else {
    fin.rg(text.match(/macro_scope\$.*\(.*\)/g), function (d) {
      text = text.replace(d, '');
    });
  }
  text = fin.process_constants(text);

  (new Function('return ' + text)()).apply(modu, args);   

  modu.byte_code = text;

  delete modu.text;
  //delete modu.args_names;

  modu.children.forEach(fin.process_module);

 
// modu.children = [];
 // delete modu.children;
}

fin.entry = function (url,done) {
  fin.depdencies_path = [];
  fin.source_handlers.length = 0;
  fin.compiled_sources.length = 0;
  fin.constants_replacer.length = 0;
  fin.runing_code = [];
  fin.load_modules = [];
  console.log(fin.load_modules);

  if (fin.is_function(url)) {
    url = URL.createObjectURL(new Blob([url.toString()]));
  }

  fin.module_source_cache_enabled = false;
  fin.load_module_source(url, function (data) {
    setTimeout(function () {
      fin.resolve_dependencies(url, data, function () {
        console.log('entry loaded');
        
        fin.load_modules.forEach(fin.process_module);
        if (done) done();
      });
    }, 50);

  });
};

fin.export_code = function () {
  var src = [];
 
  src.push(`var fin = {
  define: function (_creator, _super) {

    _super = _super || Object;
    var proto = {};
    Object.assign(proto, _super.prototype);
    var _class = _creator(proto, _super);
    _class.super_class = _super;
    _class.prototype = Object.create(_super.prototype);
    Object.assign(_class.prototype, proto);
    return (_class);
  },
  modules: {},
  macro_scope: function (func, name) { func(); return func; }, macro: function (func, modu, scope) { return func; }
}
fin.guidi = (function () {
  var guidCounter = 0;
  return function () {
    return (Date.now() + guidCounter++);
  }
})();


fin.queue = fin.define(function (proto) {

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


fin.merge_sort = (function (array, comparefn) {
  var i, j, k;
  function merge(arr, aux, lo, mid, hi, comparefn) {
    i = lo;
    j = mid + 1;
    k = lo;

    while (true) {
      if (comparefn(arr[i], arr[j]) <= 0) {
        aux[k++] = arr[i++];
        if (i > mid) {
          do
            aux[k++] = arr[j++];
          while (j <= hi);
          break;
        }
      } else {
        aux[k++] = arr[j++];
        if (j > hi) {
          do
            aux[k++] = arr[i++];
          while (i <= mid);
          break;
        }
      }
    }
  }

  function sortarrtoaux(arr, aux, lo, hi, comparefn) {
    if (hi < lo) return;
    if (hi == lo) {
      aux[lo] = arr[lo];
      return;
    }
    var mid = Math.floor(lo + (hi - lo) * 0.5);
    sortarrtoarr(arr, aux, lo, mid, comparefn);
    sortarrtoarr(arr, aux, mid + 1, hi, comparefn);
    merge(arr, aux, lo, mid, hi, comparefn);
  }

  function sortarrtoarr(arr, aux, lo, hi, comparefn) {
    if (hi <= lo) return;
    var mid = Math.floor(lo + (hi - lo) * 0.5);
    sortarrtoaux(arr, aux, lo, mid, comparefn);
    sortarrtoaux(arr, aux, mid + 1, hi, comparefn);
    merge(aux, arr, lo, mid, hi, comparefn);
  }


  var aux = [], ai = 0;;
  function merge_sort(arr, al, comparefn) {
    ai = 0;
    for (i = 0; i < al; i++)
      aux[ai++] = arr[i];

    sortarrtoarr(arr, aux, 0, al - 1, comparefn);
    return arr;
  }



  return merge_sort;
})();

fin.array = fin.define(function (proto) {

  proto.push = function (element) {
    this.data[this.length++] = element;
  };
  proto.peek = function () {
    return this.data[this.length - 1];
  };

  proto.pop = function () {
    if (this.length === 0) return null;
    return this.data[--this.length];
  };

  proto.clear = function () {
    this.length = 0;
  };

  proto.for_each = function (cb, self) {
    this.index = 0;
    while (this.index < this.length) {
      cb(this.data[this.index], this.index++, self);
    }
    this.index = 0;
  };

  proto.next = function () {
    if (this.index < this.length) {
      return this.data[this.index++];
    }
    return null;

  };
  return function array() {
    this.data = [];
    this.length = 0;
    this.index = 0;
  }
});
fin.object_pooler = fin.define(function (proto) {

  proto.get = function (params) {
    if (this.freed > 0) {
      if (this.reuse)
        return this.reuse(this.free_objects[--this.freed], params);
      else
        return this.free_objects[--this.freed];
    }
    this.allocated++;
    return this.creator(params);
  };
  proto.free = function (obj) {
    this.free_objects[this.freed++] = obj;
  };
  return function object_pooler(creator, reuse) {
    this.creator = creator;
    this.reuse = reuse;
    this.allocated = 0;
    this.freed = 0;
    this.free_objects = [];
  };
});


fin.each_index = function (callback, index) {
  var func = function (index) {
    callback(index, func);
  };
  func(index || 0);
}

fin.rg = function (match, func) {
  if (match !== null) match.forEach(func);
}

fin.merge_object = (function () {
  var key, type;
  var func = function (source, dest, merge_only_not_exist) {
    for (var key in source) {
      type = Object.prototype.toString.call(source[key]).toLocaleLowerCase();
      if (type === '[object object]') {
        if (dest[key] !== undefined) func(source[key], dest[key], merge_only_not_exist);
        else if (merge_only_not_exist) {
          dest[key] = {};
          func(source[key], dest[key], merge_only_not_exist);
        }
      }
      else {
        if (merge_only_not_exist) {
          if (dest[key] === undefined) {
            dest[key] = source[key];
          }
        }
        else {
          dest[key] = source[key];
        }
      }
    }
    return dest;
  }
  return func;

})();
fin.create_float32 = (function (len, creator) {
  creator = creator || function (out) {
    return out;
  }
  var x = 0;
  return function () {
    var out = creator(new Float32Array(len));
    if (arguments[0] === undefined) return out;
    if (arguments.length === 1 && arguments[0].length > 0) {
      for (x = 0; x < arguments[0].length; x++)
        if (x < len) out[x] = arguments[0][x];
    }
    else {
      for (x = 0; x < arguments.length; x++)
        if (x < len) out[x] = arguments[x];
    }
    return out;
  }
});


fin.is_function = function (obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
};

fin.traverse_object = (function () {
  let key;
  function func(obj, cb, pkey) {
    pkey = pkey || "";
    pkey = pkey.length > 0 ? pkey + "." : pkey;
    for (key in obj) {
      if (Object.prototype.toString.call(obj[key]).toLocaleLowerCase() === '[object object]' || fin.is_function(obj[key])) {
        func(obj[key], cb, pkey + key);
      }
      else cb(pkey + key, obj[key], obj, key);
    }
  }

  return func;

})();

fin.rg = function (match, func) {
  if (match !== null) match.forEach(func);
}
fin.parse_args_from_func = function (text) {
  var args;
  fin.rg(text.match(/function.*\\(.*\\)/), function (s) {
    args = s.replace(/function.*\\(/, '').replace(')', '').split(",");
    args.forEach(function (a, i) {
      args[i] = a.trim();
    })
  });

  return args || [];
}`)
  src.push('const _FM=fin.modules;\n_FM["fin"]=fin;');

  function export_module(modu, pmodu) {

    if (modu.module_export_code) modu.module_export_code();

    var args = [];
    modu.args_names.forEach(function (a, i) {
      args[i] = '_FM["' + a + '"]';
    });
    if (pmodu === undefined)
      src.push('(function(){ return ' + modu.byte_code + '})().apply(_FM["' + modu.module_name + '"],[' + args.join()+']);');
    else
      src.push('(function() { return ' + modu.byte_code + '})()(' + args.join()+');')

    modu.children.forEach(function (cmodu) {
      export_module(cmodu, modu);
    });

  }

  const mnames = [];
  for (var m in fin.modules) {
    console.log("module", m);
    fin.modules[m].module_name = m;
    mnames.push(m+':_FM["'+m+'"]');
  }
  fin.load_modules.forEach(function (modu) {
    src.push('_FM["' + modu.module_name + '"]=new Object();');
    export_module(modu)
  });

  var compiled = 'module.exports=(function(){' + src.join('\n') +'\n return _FM;})()'
 // src.push('module.exports={' + mnames.join()+'};\n')
  //var compiled = src.join('\n');
  saveAs(new Blob([compiled]), 'module_export.js');
}


fin.compile_modules_cache = function (mdls) {
  fin.depdencies_path = [];
  fin.source_handlers.length = 0;
  fin.compiled_sources.length = 0;
  fin.constants_replacer.length = 0;

  fin.load_modules = [];
  fin.module_source_cache_enabled = true;

  fin.module_source_cache['compile_modules_cache'] = (function index() {
    dependencies(all_modules);
  }).toString().replace('all_modules', JSON.stringify(mdls));


 // console.log(fin.module_source_cache['compile_modules_cache']);

 // return;
  var url = "compile_modules_cache";
  fin.load_module_source(url, function (data) {
    setTimeout(function () {
      fin.resolve_dependencies(url, data, function () {
        console.log('modules loaded');
        document.write('Compiling......');
        var s = [];
        for (var k in fin.module_source_cache) {
          if (k !== "compile_modules_cache") {
            s.push('fin.module_source_cache["' + k + '"]=' + JSON.stringify(fin.module_source_cache[k]) +";\n");
          }          
        }

        var list = [
          ['cache_inline', fin.compressBase64(s.join(""))]
        ];
        mdls.forEach(function (m) {
          list.push(m);
        });

        var src = (function index() {
          dependencies(all_modules);          
        }).toString()
          .replace('all_modules', JSON.stringify(list));


        //console.log(src)
        saveAs(new Blob([src]), 'modules_cache.js');
       // fin.load_modules.forEach(fin.process_module);
      });
    }, 50);

  });
}

console.log(fin);

