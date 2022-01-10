function physics_system(fin, pe, ecs, math) {

  ecs.register_component('physics_item', fin.define(function (proto, _super) {


    proto.update_bounds = function (mat) { }
    function physics_item(def, en, app, comp) {
      this.entity = en;

      var shapes = [];
      def.shapes.forEach(function (s) {
        var shp = {};
        if (s.type === "box") {
          shp.geometry = new pe.collision.geometry.BoxGeometry(s.size || [1, 1, 1]);
        }
        else if (s.type === "sphere") {
          shp.geometry = new pe.collision.geometry.SphereGeometry(s.size || 1);
        }
        delete s.type;
        shp = Object.assign(shp, s);
        shapes.push(shp);
      });
      def.shapes = shapes;
      def.type = def.type === "dynamic" ? 0 : (def.type === "static" ? 1 : 2);
      console.log(def);
      def.flags = 0;
      this.body = new pe.dynamics.rigidbody.RigidBody(def);
      
    }

    physics_item.validate = function (comp) {
      comp.app.use_system('physics_system');
    };
    return physics_item;



  }, ecs.component));



  ecs.register_system('physics_system', fin.define(function (proto, _super) {


    proto.step = function () {


      var entity, physics_body,trans;

      while ((entity = this.app.iterate_entities("physics_item")) !== null) {
        
        physics_body = entity.physics_item.body;
        trans = entity.ge_transform;

        if (physics_body._world == null) {


          this.world.addRigidBody(physics_body);


          physics_body.set_position(trans.position);
          physics_body.set_rotation(trans.rotation);



        }
        else {
          trans.position[0] = physics_body._transform._position[0];
          trans.position[1] = physics_body._transform._position[1];
          trans.position[2] = physics_body._transform._position[2];

          trans.rotation[0] = physics_body._transform._quat[0];
          trans.rotation[1] = physics_body._transform._quat[1];
          trans.rotation[2] = physics_body._transform._quat[2];
          trans.rotation[3] = physics_body._transform._quat[3];


          trans.require_update = 1;
        }

      }


      this.world.step(this.step_size);


    }


    proto.create_terrain_patch = function (patch,rx,rz) {
      var def = { type: 1, position: [rx, 0, rz] };
      def.shapes = [{
        geometry: new pe.collision.geometry.TerrainPatch(patch),
        collisionMask: 3, friction: 10.0001, restitution: 0.01
      }];

      var body = new pe.dynamics.rigidbody.RigidBody(def);

      this.world.addRigidBody(body);

      return body;
    };


    proto.create_sphere = function (def) {
      def = def || {};
      def.shp = def.shp || {};
   
      def.shapes = [Object.assign({
        geometry: new pe.collision.geometry.SphereGeometry(def.size)
      }, def.shp)];

      var body = new pe.dynamics.rigidbody.RigidBody(def);

      this.world.addRigidBody(body);
      return body;
    };


    proto.validate = function (app) {
      this.priority = app.use_system('ge_transform_system').priority - 50;
    };

    function physics_system(def) {
      _super.apply(this, arguments);
      console.log("physics_system", this);
      this.world = new pe.dynamics.World(null, def.gravity || [0, -39.8, 0]);

      this.step_size = 1 / 60;


    }




    return physics_system;



  }, ecs.system));



}