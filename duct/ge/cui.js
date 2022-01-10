function cui(fin, ge,math) { 
  ge.cui = ge.define(function (proto, _super) {
    var ge_cui;


   

    proto.bubble_event = function (node, e, params) {
      if (!node) return;
      if (node[e]) {
        node[e].apply(node, params);
      }
      else this.bubble_event(node.parent,e, params);
    }

    proto.set_mouse_position = function (x, y, button) {


      x = Math.floor(x);
      y = Math.floor(y);

      
      this.mouse_x = x;
      this.mouse_y = y;

      this.mouse_dx = this.mouse_x - this.last_mouse_x;
      this.mouse_dy = this.mouse_y - this.last_mouse_y;

      this.mouse_down_dx = this.mouse_x - this.mouse_down_x;
      this.mouse_down_dy = this.mouse_y - this.mouse_down_y;


      this.mouse_down_delta = Math.sqrt(this.mouse_down_dx * this.mouse_down_dx + this.mouse_down_dy * this.mouse_down_dy);
      this.mouse_delta = Math.sqrt(this.mouse_dx * this.mouse_dx + this.mouse_dy * this.mouse_dy);



      if (button === this.mouse_button && this.mouse_delta === 0) {      
        this.last_mouse_x = x;
        this.last_mouse_y = y;
        if (button === 1) {          
          this.mouse_down_x = x;
          this.mouse_down_y = y;          
        }
        return false ;

      }

      this.mouse_is_moving = false;
      if (this.mouse_delta!==0) {
        this.mouse_is_moving = true;
      }

     
      this.mouse_click = false;
      

      if (this.mouse_down && button === 0 && !this.last_mouse_draging) {
        if (!this.mouse_is_moving && this.mouse_down_delta === 0) {
          this.mouse_click = true;
          this.mouse_down = false;
         // console.log("mouse click");
        }

      }
      this.mouse_draging = false;
      if (this.mouse_down && this.mouse_down_delta !== 0) {
        //console.log("mouse_draging", this.mouse_down_delta);
        this.mouse_draging = true;
        
      }

      if (button === 1 && !this.mouse_down && !this.mouse_draging) {
        this.mouse_down = true;
        this.mouse_down_x = x;
        this.mouse_down_y = y;
       // console.log("mouse_down");
      }
      else {
        if (button === 0) {
          this.mouse_down = false;    
          
        }
      }
      

      this.last_mouse_x = x;
      this.last_mouse_y = y;
      this.mouse_button = button;


      if (this.mouse_down && !this.mouse_draging ) {
        this.mouse_node_id = 0;
        this.mouse_hit_node(this.doc.body, this.doc);
      }



      if (this.mouse_node_id !== 0) {
        var node = this.doc.nodes[this.mouse_node_id];
        if (node) {
          if (this.mouse_draging) {
            if (node.on_mouse_draging) {
              node.on_mouse_draging(node, this.mouse_dx, this.mouse_dy);
            }
            else {
              this.bubble_event(node.parent, "on_mouse_draging", [node, this.mouse_dx, this.mouse_dy]);
            }
          }
          else if (this.mouse_down && !this.mouse_draging) {
            if (node.on_mouse_down) {
              node.on_mouse_down(node, this.mouse_down_x, this.mouse_down_y);
            }
            else {
              
            }
          }
          else if (this.mouse_click) {
            if (node.on_mouse_click) {
              node.on_mouse_click(node, this.mouse_x, this.mouse_y);
            }
            else {
              this.bubble_event(node.parent, "on_mouse_click", [node, this.mouse_x, this.mouse_y]);
            }
          }
        }
      }

      this.last_mouse_draging = this.mouse_draging;
      this.mouse_draging = false;
    //  this.mouse_down_x = x;
   //   this.mouse_down_y = y;
      if (this.mouse_button === 0) this.mouse_node_id = 0;
      return true;
      
    }



    proto.render_node = function (ctx,node, parent) {
     
      if (node.render) {
        node.render(ctx, node, this, this.components[node.type]);
      }
      else {
        this.components[node.type].render(ctx, node, this);
      }
      
      node.actual_height = node._height;
      node.actual_width = node._width;


     
      node.gx = node._x + parent.gx;
      node.gy = node._y + parent.gy;

           
      if (node.children) {
        var child;
        if (node.styles.overflow === "hidden") {
          ctx.beginPath();
          ctx.rect(node.styles.padding_left, node.styles.padding_top,
            node._width - (node.styles.padding_left + node.styles.padding_right)
            , node._height- (node.styles.padding_top + node.styles.padding_bottom)

          );
          ctx.clip();

        }
        ctx.translate(-node.scroll_left, -node.scroll_top);
        var y = node.styles.padding_top, x = node.styles.padding_left,last_node_height=0;
        for (var i = 0; i < node.children.length; i++) {
          child = node.children[i];
          if (!child.styles.visibled) continue;

          if (x + child._width + node.styles.padding_right > node._width) {
            x = node.styles.padding_left;
            y += last_node_height;
          }

          if (child.styles.position === "absolute") {
            x = 0; y = 0;
          }

          x += child._left + child.styles.margin_left;
          y += child._top + child.styles.margin_top;

        


          
          ctx.save();
          ctx.translate(x, y + child.styles.margin_top);
          
          child._x = x - node.scroll_left;
          child._y = ((y + child.styles.margin_top) - node.scroll_top);

          x += this.render_node(ctx, child, node);
          ctx.restore();
          last_node_height = child.actual_height + child.styles.margin_bottom;
        }
      }
      

      
      node.initiated = true;
      return node.actual_width;
    }


    proto.mouse_hit_node = function (node, parent) {


      if (!node.styles.visibled) return;
      if (this.mouse_x > node.gx && this.mouse_x < node.gx + node.actual_width) {
        if (this.mouse_y > node.gy && this.mouse_y < node.gy + node.actual_height) {
          if (node.styles.mouse_events) this.mouse_node_id = node.uuid;
          if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
              this.mouse_hit_node(node.children[i], node);
            }
          }

        }
      }
    };

    proto.get_node = function (name) {
      return this.doc.nodes_names[name];

    };

    proto.init_node = function (node, parent) {
      if (!node.initiated) {

        node.uuid = ge.guidi();
        
        this.doc.nodes[node.uuid] = node;

        node.name = node.name || ("n" + node.uuid);


        this.doc.nodes_names[node.name] = node;

        node.document = parent.document ? parent.document : parent;

        node.scroll_left = node.scroll_left || 0;
        node.scroll_top = node.scroll_top || 0;


       

        node.type = node.type || "block";

        node.left = node.left || "0px";
        node.top = node.top || "0px";

        node.styles = node.styles || {};


        if (node.styles.padding) {
          if (node.styles.padding_left === undefined) node.styles.padding_left = node.styles.padding;
          if (node.styles.padding_right === undefined) node.styles.padding_right = node.styles.padding;
          if (node.styles.padding_top === undefined) node.styles.padding_top = node.styles.padding;
          if (node.styles.padding_bottom === undefined) node.styles.padding_bottom = node.styles.padding;

        }

        if (this.components[node.type].init) {
          this.components[node.type].init(node, parent, this);
        }
        node.height = node.height || "100%";
        node.width = node.width || "100%";

        var pw = (parent._width - (parent.styles.padding_left + parent.styles.padding_right));
        var ph = (parent._height - (parent.styles.padding_top + parent.styles.padding_bottom));



        if (node.left.indexOf("%") > 0) {
          node._left = (parseFloat(node.left) / 100) * pw;
        }
        else {
          node._left = parseFloat(node.left);
        }


        if (node.top.indexOf("%") > 0) {
          node._top = (parseFloat(node.top) / 100) * ph;
        }
        else {
          node._top = parseFloat(node.top);
        }






        if (node.width.indexOf("%") > 0) {
          node._width = (parseFloat(node.width) / 100) * pw;
        }
        else {
          node._width = parseFloat(node.width);
        }
        node.parent = parent;

        if (node.height.indexOf("%") > 0) {
          node._height = (parseFloat(node.height) / 100) * ph;
        }
        else {
          node._height = parseFloat(node.height);
        }

        node._x = 0;
        node._y = 0;

       
        for (var s in this.styles) {
          if (node.styles[s] === undefined) {
            node.styles[s] = this.styles[s];
          }
        }
        if (node.on_init) node.on_init(node, parent);

        if (node.styles.background_color.join) {
          ge_cui.images_loader.load(node.styles.background_color[0], [
            ge_cui.background_pattern_creator,
            node,
            this,
            node.styles.background_color[1] || "repeat",
            node.styles.background_color[2]
          ]);
          node.styles.background_color = "transparent";
        }

        node.initiated = true;
        if (node.children) {

          for (var i = 0; i < node.children.length; i++) {
            node.children[i].index = i;
            this.init_node(node.children[i], node);
          }
        }
      }


    };


    proto.display_document = function (doc) {
      if (doc) {
        this.doc = doc;
      }
      else {
        doc = this.doc;

      }
      
      doc._width = this.canv.width;
      doc._height = this.canv.height;
      doc.gx = 0; doc.gy = 0;
      
      if (!doc.body.initiated) {
        for (var k in ge_cui.components) {
          this.components[k] = ge_cui.components[k];
        }

    
        doc.styles = this.styles;
        this.doc.nodes = {};
        this.doc.nodes_names = {};

        
        this.init_node(doc.body, doc);
        

      }
      this.canv.ctx.clearRect(0, 0, this.canv.width, this.canv.height);
      this.render_node(this.canv.ctx, doc.body, doc);
      this.canv.ctx.fillStyle = "rgba(10,10,10,0.37)";
      this.canv.ctx.fillRect(this.mouse_x-3, this.mouse_y-3, 6, 6);
      

     
      
    }


    ge_cui = function (def) {
      def = def || {};

      fin.merge_object({
        width: 512,
        height: 512
      }, def, true);

      this.components = {};

      
      this.canv = ge.create_canvas(def.width, def.height);
      this.mouse_node_id = 0;
      this.mouse_x = -10;
      this.mouse_y = -10;
      this.last_mouse_x = 0;
      this.last_mouse_y = 0;

      this.mouse_dx = 0;
      this.mouse_dy = 0;

     

      this.styles = {
        font: "arial",
        font_size: 12,
        text_valign: "top",
        text_align:"left",                
        background_color: "transparent",
        background_alpha:1,
        foreground_color: "black",
        margin_left: 0,
        margin_right: 0,
        margin_top: 0,
        margin_bottom: 0,
        padding_left: 0,
        padding_right: 0,
        padding_top: 0,
        padding_bottom: 0,        
        overflow: "visible",
        position: "relative",
        mouse_events: true,
        visibled: true,
        border_size: 0,
        border_type: "outset",
        border_color:"transparent",
        focus_rect:false
      }
      this.doc = null;
    };


    ge_cui.load_images = {};
    ge_cui.load_image = function (url) {
      if (ge_cui.load_images[url]) return ge_cui.load_images[url];

      var img = new Image();
      img.src = url;
      ge_cui.load_images[url] = img;

      return img;


    }


    ge_cui.background_pattern_creator = (function () {
      var canv = ge.create_canvas(1, 1);
      return function (img, node, ui, repeat, size) {

        size = size || 64;

        canv.set_size(size, size);
        canv.ctx.drawImage(img, 0, 0,size,size);


        node.styles.background_color = ui.canv.ctx.createPattern(canv, repeat);
        ui.needs_update = true;
      }
    })();

    ge_cui.images_loader = new ge.bulk_image_loader(5);
   

    ge_cui.images_loader.onload = (function () {
     
      return function (img, params) {
        var func = params[0];
        params[0] = img;
        func.apply(this, params);             
        ge_cui.images_loader.free(img);

      }
    })();


    ge_cui.components = {};

    ge_cui.define_component = function (name, comp) {
      this.components[name] = comp;
      comp.ui = this;
    };

    ge_cui.define_component("block", {
      render: function (ctx, node, ui) {
        //  if (node.styles.background_color === "transparent") return;

        if (node.styles.background_color !== "transparent") {
          ctx.fillStyle = node.styles.background_color;
          ctx.globalAlpha = node.styles.background_alpha;

          ctx.fillRect(0, 0, node._width, node._height);

        }
        ctx.globalAlpha  = 1.0;

        if (node.styles.border_size > 0) {
          ctx.lineWidth = node.styles.border_size;


          ctx.strokeStyle = node.styles.border_color;
          ctx.strokeRect(0, 0, node._width, node._height);

          if (node.styles.border_type === "outset") {
            ctx.strokeStyle = "rgba(110,110,110,0.5)";
            ctx.beginPath();
            ctx.moveTo(0, node._height);
            ctx.lineTo(0, 0);
            ctx.lineTo(node._width, 0);
            ctx.stroke();
            ctx.strokeStyle = "rgba(50,50,50,0.5)";
            ctx.beginPath();
            ctx.moveTo(0, node._height);
            ctx.lineTo(node._width, node._height);
            ctx.lineTo(node._width, 0);
            ctx.stroke();
          }
          else if (node.styles.border_type === "inset") {
            ctx.strokeStyle = "rgba(50,50,50,0.5)";
            ctx.beginPath();
            ctx.moveTo(0, node._height);
            ctx.lineTo(0, 0);
            ctx.lineTo(node._width, 0);
            ctx.stroke();
            ctx.strokeStyle = "rgba(110,110,110,0.5)";
            ctx.beginPath();
            ctx.moveTo(0, node._height);
            ctx.lineTo(node._width, node._height);
            ctx.lineTo(node._width, 0);
            ctx.stroke();
          }



        }


        ctx.lineWidth = 1;

        if (node.uuid === ui.mouse_node_id) {
          if (ui.mouse_down && node.styles.focus_rect) {
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.fillRect(0, 0, node._width, node._height);

          }
        }

      }
    });


    ge_cui.define_component("scroll-panel", {
      init: function (node, parent, ui) {
        node.styles.overflow = "hidden";

        node.on_mouse_draging = function (node, dx, dy) {
          this.scroll_top -= dy;
          this.scroll_top = Math.max(this.scroll_top, 0);
        }

      },
      render: function (ctx, node, ui) {
        ge_cui.components["block"].render(ctx, node, ui);
      }
    });


    ge_cui.define_component("text", {
      init: function (node, parent, ui) {
        if (node.height === undefined) node.height = "20px";
        if (node.styles['mouse_events'] === undefined) {
          node.styles['mouse_events'] = false;
        }

        if (node.styles['background_color'] === undefined) {
          node.styles['background_color'] = 'transparent';
        }
      },
      render: function (ctx, node, ui) {

        ctx.font = node.styles.font_size + "px " + node.styles.font;


        if (node._text !== node.text) {
          node._text_m = ctx.measureText(node.text);
          node._text = node.text;
          node._height = Math.max(node._height, node._text_m.actualBoundingBoxDescent + node.styles.padding_top + node.styles.padding_bottom);
          node._width = Math.max(node._width, node._text_m.width + node.styles.padding_left + node.styles.padding_right);
        }


        var x = node.styles.padding_left, y = node.styles.padding_top;

        ge_cui.components["block"].render(ctx, node, ui);

        ctx.textAlign = node.styles.text_align;
        ctx.textBaseline = node.styles.text_valign;

        ctx.fillStyle = node.styles.foreground_color;
        if (node.styles.text_align === "center") {
          x += node._width * 0.5;
        }

        if (node.styles.text_valign === "middle") {
          y += (node._height * 0.5) + (node._text_m.actualBoundingBoxDescent * 0.35);
        }

        ctx.fillText(node.text, x, y);



      }
    });

    ge_cui.define_component("button", {
      init: function (node, parent, ui) {
        node.styles.text_align = "center";
        node.styles.text_valign = "middle";
        //node.styles.focus_rect = true;
        if (node.styles['border_size'] === undefined) {
          node.styles['border_size'] = 3;
        }

      },
      render: function (ctx, node, ui) {
        if (ui.mouse_down && node.uuid === ui.mouse_node_id) {
          node.styles.border_type = "inset";
          node.styles.padding_left = 2;
          node.styles.padding_top = 2;
        }
        else {
          node.styles.padding_left = 0;
          node.styles.padding_top = 0;
          node.styles.border_type = "outset";
        }
        ge_cui.components["text"].render(ctx, node, ui);
      }
    });

    ge_cui.define_component("hslider", {
      init: function (node, parent, ui) {
        node.value = node.value || 50;
        node.min = node.min || 0;
        node.max = node.max || 100;

        if (node.height === undefined) node.height = "20px";



        node.label_padding = node.label_padding || 0;
        node.children = [
          {
            on_init: function (node, parent) {

              parent.trail_width = parent._width - parent.label_padding - 10;

              node.parent.per = (node.parent.value - node.parent.min) / (node.parent.max - node.parent.min);
                            
              node._left = (parent.trail_width * parent.per);
            },
            width: "10px",
            styles: { background_color: "rgba(30,30,30,0.75)", position: "absolute", margin_top: 0, border_size: 1 },
            on_mouse_draging: function (node, dx, dy) {
              node._left += dx;
              if (node._left < 0) node._left = 0;
              if (node._left > node.parent.trail_width) node._left = node.parent.trail_width;
              node.parent.per = node._left / node.parent.trail_width;
              node.parent.value = node.parent.min + ((node.parent.max - node.parent.min) * node.parent.per);
            }
          }
        ];

      },

      render: function (ctx, node, ui) {
        ge_cui.components["block"].render(ctx, node, ui);
        ctx.fillStyle = "rgba(40,40,40,0.5)";

        ctx.fillRect(0, (node._height * 0.5) - 2, node.trail_width + 10, 6);
        if (node.label_padding > 0) {
          ctx.textBaseline = "middle";
          ctx.font = "12px " + node.styles.font;
          ctx.textAlign = "right";
          ctx.fillStyle = node.styles.foreground_color;
          ctx.fillText(parseInt(node.value), node._width - 2, node._height * 0.5);
        }

      }
    });

    ge_cui.define_component("checkbox", {
      init: function (node, parent, ui) {
        if (node.checked === undefined) node.checked = false;
        node.styles.text_valign = "middle";
        if (node.height === undefined) node.height = "20px";
        node.on_mouse_down = function () {
          this.checked = !this.checked;
          if (this.on_checked) this.on_checked(this.checked);
        }
      },
      render: function (ctx, node, ui) {

        node.styles.padding_left = node._height;
        ge_cui.components["text"].render(ctx, node, ui);
        ctx.strokeStyle = node.styles.foreground_color;
        ctx.strokeRect(4, 4, node._height - 8, node._height - 8);
        if (node.checked) {
          ctx.fillStyle = node.styles.foreground_color;
          ctx.fillRect(6, 6, node._height - 12, node._height - 12);
        }
      }
    });

    ge_cui.define_component("listbox", {
      init: function (node, parent, ui) {
        ge_cui.components["scroll-panel"].init(node, parent, ui);

        node.item_height = node.item_height || 20;
        node.item_count = 50;
        console.log("node", node);
      },
      render: function (ctx, node, ui) {
        ge_cui.components["scroll-panel"].render(ctx, node, ui);

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        var istart = 0, y = 0, item;
        ctx.fillStyle = node.styles.foreground_color;
        while (istart < node.items.length) {
          item = node.items[istart++];
          ctx.fillText(item, 2, y + node.styles.font_size);
          y += node.item_height;

          if (y > node._height) {
            break;
          }

        }



      }
    });


    ge_cui.define_component("label-field", {
      init: function (node, parent, ui) {
        node.height =node.height || "25px";
        node.field.width =node.field_size || "60%";
        node.field.styles = { margin_top: 2 };
        node.styles.border_size = 1;
        node.children = [
          {
            type: "text", width: "40%", styles: { text_valign: "middle", font_size: 10 }, text: node.label
          },
          node.field
        ];
      },
      render: function (ctx, node, ui) {
        ge_cui.components["block"].render(ctx, node, ui);
      }


    });

    return ge_cui;
  });



  ge.cui.mesh = ge.define(function (proto, _super) {

    function ge_mesh(def) {
      def = def || {};
      _super.apply(this, [def]);



      this.width = def.width / 100;
      this.height = def.height / 100;

      this.mouse_controller = def.mouse_controller;

      
      this.geometry = ge.geometry.shapes.plane({ width: this.width, height: this.height });
      this.material = new ge.shading.material({
        ambient: [1, 1, 1],
        specular: [0, 0, 0],
        transparent:0.95
      });
      
      this.ui = new ge.cui(def);
      this.material.texture = ge.webgl.texture.from_size(def.width, def.height);
      this.material.texture.source = this.ui.canv;
      this.material.texture.needs_update = true;


      this.material.flags += ge.SHADING.DOUBLE_SIDES;

      this.material.texture.parameters[ge.GL_TEXTURE_WRAP_S] = ge.GL_CLAMP_TO_EDGE;
      this.material.texture.parameters[ge.GL_TEXTURE_WRAP_T] = ge.GL_CLAMP_TO_EDGE;
      this.material.texture.enable_linear_interpolation();

      this.ui.canv.ctx.transform(1, 0, 0, -1, 0, this.ui.canv.height);

      this.draw_offset = 0;
      this.draw_count = this.geometry.num_items;
      this.item_type = ge.ITEM_TYPES.MESH;
      this.flags = def.flags || 0;

      this.mesh_version = -1;
      this.imatrix_world = math.mat4();
      this.flags += ge.PICKABLE_MESH;

      this.mouse_int_point = math.vec3();

      this.on_document_update = new ge.event(this, [null]);
      
    }


    
    proto.on_render = function (camera) {
      if (this.ui.needs_update) {
        this.update_document();
        this.ui.needs_update = false;
      }
      if (this.is_picked) {


        camera.is_locked = true;  

        this.mouse_controller.set_mouse_ray();
        if (this.mouse_controller.mouse_delta !== 0) {
          if (math.utils.ray_plane_intersection(this.mouse_int_point, this.mouse_controller.mouse_ray_start, this.mouse_controller.mouse_ray_end, this.world_position, this.fw_vector)) {
            this.set_mouse_position(this.mouse_int_point, this.mouse_controller.mouse_buttons);    
          }
        }
        
        
        
        
        if (this.mouse_controller.mouse_buttons===0) {
          this.is_picked = false;
          camera.is_locked = false;
          if (this.ui.set_mouse_position(-10,-10, 0)) {
            this.update_document();
          }
        }
        
      }
      
    }

    proto.set_mouse_position = function (pos, mouse_button) {      
      if (this.mesh_version !== this.version) {
        this.mesh_version = this.version;
        math.mat4.inverse(this.imatrix_world, this.matrix_world);
      }
      math.vec3.transform_mat4(pos, pos, this.imatrix_world); 
   

      pos[0] = pos[0] / this.width;
      pos[1] = pos[1] / this.height;

      pos[0] += 0.5;
      pos[1] += 0.5;


      pos[1] = 1 - pos[1];
     

      if (this.ui.set_mouse_position(pos[0] * this.ui.canv.width, pos[1] * this.ui.canv.height, mouse_button)) {
        this.update_document();
      }


      

    };


    proto.update_bounds = function (mat, trans) {
      math.aabb.transform_mat4(this.bounds, this.geometry.aabb, mat);
      this.bounds_sphere = this.geometry.bounds_sphere * trans.scale_world[0];
    };

    proto.update_document = function () {
      this.ui.display_document();
      this.material.texture.source = this.ui.canv;
      this.material.texture.needs_update = true;
      this.on_document_update.params[0] = this.ui;
      this.on_document_update.trigger_params();
    };

    proto.set_document = function (doc) {
      this.ui.display_document(doc);
      this.material.texture.needs_update = true;
    }

    return ge_mesh;
  }, ge.renderable);

}