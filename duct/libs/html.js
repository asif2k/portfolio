function index(fin) {

  var html = this;

  var elm$ = (function () {
    var _html$ = document.createElement('div');
    var e$;
    return function (html) {
      _html$.innerHTML = html;
      e$ = _html$.firstChild;
      _html$.removeChild(e$);
      return e$;
    }
  })();

  var elm = function (tag,content,att) {
    var e = document.createElement(tag);
    if (content) e.innerHTML = content
    if (att) {
      for (var a in att) {
        e.setAttribute(a, att[a]);
      }
    }
    return e;

  }

  var createElm = function (tag, proto, callback) {
    var e = document.createElement(tag);
    Object.assign(e, proto);
    if (callback) callback(e);
    return (e);
  };


  var $$ = (function () {
    var temp = [], i;
    return function () {
      temp.length = 0;
      for (i = 0; i < arguments.length; i++)
        temp[i] = arguments[i];

      return temp.join("");
    }
  })();

  html.json_editor = (function () {
    function populate_prop(key, value,object) {
     

      var row = elm("tr");
      var td;
      if (Object.prototype.toString.call(value).toLocaleLowerCase() === '[object object]') {
        td = elm('td', '[' + key + ']', { "colspan": "2" });
        row.appendChild(td);
        td.etype = "object";
        td.key = key;
        td.eobj = object;
        td.value = value;
        td.style.pointerEvents = "fill";
      }
      else if (Array.isArray(value)) {
        td = elm('td', '[' + key + ']', { "colspan": "2" });
        row.appendChild(td);
        td.etype = "array";
        td.key = key;
        td.eobj = object;
        td.value = value;
        td.style.pointerEvents = "fill";
      }
      else {
       
        row.appendChild(elm("td"));
        row.appendChild(elm("td"));
        td = row.firstChild.nextSibling;
        td.eobj = object;
        td.etype = "text";
        td.key = key;
        td.value = value;
        row.firstChild.innerText = key;
        td.innerText = value;
        if (value === true || value === false) {
          td.etype = "bool";
          td.style.pointerEvents = "fill";
        }
        else if (!isNaN(parseFloat(value))) {
          td.etype = "numeric";
          row.handle_value = td;
        }
      }
      

      return row

    }

    function populate_object(obj) {
      var tab = elm("table");
      for (var key in obj) {
        tab.appendChild(populate_prop(key, obj[key],obj));

      }
      return tab;
    }
    function populate_array(array) {
      var tab = elm("table");
      for (var i = 0; i < array.length;i++) {
        tab.appendChild(populate_prop(i, array[i],array));

      }
      return tab;
    }
    var overlay = elm$('<div style="display:none; position:fixed;left:0;top:0;width:100%;height:100%;z-index:9999;opacity:0.0;background-color:gray"></div>');
    overlay.appendChild(elm$('<style>.json_editor table {width:100%;color:white;padding-left:5px;} .json_editor table >tr {pointer-events:fill;display:inline-table;width:100%;} .json_editor input {display:none;} .json_editor td {pointer-events:none;position:relative;user-select:none;border:solid 1px #383737;} .json_editor td input {border:none;position:absolute;left:0;top:0;width:100%;height:100%;display:block;} .json_editor table tr > td:first-child{width:40%;} </style>'))

    return function (obj, callback, item$) {
      document.body.appendChild(overlay);
      if (item$) {

      }
      else {
        item$ = elm$('<div class="json_editor" style="z-index:9998;"></div>');
        item$.ebox = elm$('<input type=text />');

      }

      item$.innerHTML = "";

      var ep;
      item$.ebox.oninput = function () {
        ep = this.parentNode;
        if (ep && ep.etype) {
          ep.eobj[ep.key] = parseFloat(this.value);
          if (callback) callback(ep.eobj, ep.key, obj);
         
        }
      };

     
      item$.restore_ebox = function () {
        
        ep = this.ebox.parentNode;
        if (ep && ep.etype) {
          ep.innerText = this.ebox.value;
        }
        this.appendChild(this.ebox);
      };

      item$.add_ebox = function (td) {
        td.appendChild(this.ebox);
        
        this.ebox.value = td.innerText;
        this.ebox.focus();
        this.ebox.select();
      };
      var mouse_down_x, x,rect, handle_value = undefined;

      document.onmouseup = function (e) {
        overlay.style.display = "none";
        handle_value = undefined;
      }
      item$.onmousedown = function (e) {
        item$.onclick(e);
        overlay.style.display = "block";
        rect = e.target.getBoundingClientRect();
        mouse_down_x = e.clientX;
        if (e.target.handle_value) {
          handle_value = e.target.handle_value;
        }
      };

      document.onmousemove = function (e) {
        if (e.buttons == 1) {
          if (handle_value) {
            x = e.clientX - e.target.getBoundingClientRect().left;
            // handle_value = e.target.handle_value;
            handle_value.eobj[handle_value.key] += (x - mouse_down_x) * (e.ctrlKey ? 0.25 : 0.001);
            if (callback) callback(obj);
            handle_value.innerText = handle_value.eobj[handle_value.key].toFixed(3);
            mouse_down_x = x;
            e.preventDefault();
          }
         
        }
      };

      item$.onclick = function (e) {
       
        var td = e.target;
        if (td.etype) {

          if (td.etype === "bool") {
            td.eobj[td.key] = !td.eobj[td.key];
            td.innerText = td.eobj[td.key];
            if (callback) callback(obj);
            return;
          }
          e.preventDefault();
          item$.restore_ebox();

          if (td.object_populated) {
            td.object_populated.style.display = (td.object_populated.style.display === "none" ? "block" : "none");
            return;
          }

          if (td.etype === "array") {
            td.object_populated = populate_array(td.value)
            td.appendChild(td.object_populated);
          }
          else if (td.etype === "object") {
            td.object_populated = populate_object(td.value)
            td.appendChild(td.object_populated);  
          }
          else if (td.etype === "text") {
            item$.add_ebox(td);
          }
          return false;
        }
      }
      item$.appendChild(populate_object(obj));
      return item$;

    };

  })();

  html.elm$ = elm$;
  html.createElm = createElm;

  html.setSelectData = (function () {
    var i, type, item;
    return function (select, data,add_empty_value) {
      select.innerHTML = "";

      if (!data) return;


      if (add_empty_value) {
        select.appendChild(createElm('option', {
          value: "", innerHTML: ""
        }));
      }
      type = Object.prototype.toString.call(data).toLocaleLowerCase();
      if (type === "[object array]") {
        for (i = 0; i < data.length; i++) {
          item = data[i];
          type = Object.prototype.toString.call(item).toLocaleLowerCase();
          if (type == "[object array]") {
            select.appendChild(createElm('option', {
              value: item[0], innerHTML: item[1]
            }));
          } else {
            select.appendChild(createElm('option', {
              value: item, innerHTML: item
            }));
          }
        }
      }
      else {
        for (i in data) {
          item = data[i];
          select.appendChild(createElm('option', {
            value: i, innerHTML: item
          }));
        }
      }
    }
  })();

  fin.modules['html'] = html;


}