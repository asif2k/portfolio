function index(fin, ge, math) {


	var gltf = fin.define(function (proto) {

		function _gltf() {


		}

		proto.parseSkin = function (idx) {
			//Check if the skin has already processed skeleton info
			var i,
				s = this.json.skins[idx]; //skin reference

			//skeleton not processed, do it now.
			var stack = [],
				//Queue
				final = [],
				//Flat array of joints for skeleton
				n,
				//Node reference 
				itm,
				//popped queue tiem
				pIdx; //parent index

			if (s.joints.indexOf(s.skeleton) != -1) stack.push([s.skeleton, null]); //Add Root bone Node Index, final index ofParent	
			else {
				var cAry = this.json.nodes[s.skeleton].children;
				for (var c = 0; c < cAry.length; c++) {
					stack.push([cAry[c], null]);
				}
			}

			while (stack.length > 0) {
				itm = stack.pop(); //Pop off the list
				n = this.json.nodes[itm[0]]; //Get node info for joint

				if (n.isJoint != true) continue; //Check preprocessing to make sure its actually a used node.

				//Save copy of data : Ques? Are bones's joint number always in a linear fashion where parents have
				//a lower index then the children;
				final.push({
					jointNum: s.joints.indexOf(itm[0]),
					name: n.name || null,
					position: n.translation || null,
					scale: n.scale || null,
					rotation: n.rotation || null,
					matrix: n.matrix || null,
					parent: itm[1],
					nodeIdx: itm[0]
				});

				//Save the the final index for this joint for children reference 
				pIdx = final.length - 1;

				//Add children to stack
				if (n.children != undefined) {
					for (i = 0; i < n.children.length; i++) {
						stack.push([n.children[i], pIdx]);
					}
				}
			}

			//final.nodeIdx = s.skeleton; //Save root node index to make sure we dont process the same skeleton twice.
			return final;
		}

		proto.fixSkinData = function () {
			var complete = [],
				//list of skeleton root nodes, prevent prcessing duplicate data that can exist in file
				s = this.json.skins,
				//alias for skins
				j; //loop index

			for (var i = 0; i < s.length; i++) {
				if (complete.indexOf(s[i].skeleton) != -1) continue; //If already processed, go to next skin

				//Loop through all specified joints and mark the nodes as joints.
				for (j in s[i].joints) {
					this.json.nodes[s[i].joints[j]].isJoint = true;
				} complete.push(s[i].skeleton); //push root node index to complete list.
			}

			this.linkSkinToMesh(); //Since we have skin data, Link Mesh to skin for easy parsing.
		}

		proto.linkSkinToMesh = function () {
			var rNodes = this.json.scenes[0].nodes,
				nStack = [],
				node,
				idx,
				i;

			//Setup Initial Stack
			for (i = 0; i < rNodes.length; i++) {
				nStack.push(rNodes[i]);
			} //Process Stack of nodes, check for children to add to stack
			while (nStack.length > 0) {
				idx = nStack.pop();
				node = this.json.nodes[idx];

				//Create a new property on the mesh object that has the skin index.
				if (node.mesh != undefined && node.skin != undefined) this.json.meshes[node.mesh]["fSkinIdx"] = node.skin;

				//Add More Nodes to the stack
				if (node.children != undefined) for (i = 0; i < node.children.length; i++) {
					nStack.push(node.children[i]);
				}
			}
		}

		proto.processAccessor = function (idx) {
			var a = this.json.accessors[idx],
				//Accessor Alias Ref
				bView = this.json.bufferViews[a.bufferView],
				//bufferView Ref

				buf = this.prepareBuffer(bView.buffer),
				//Buffer Data decodes into a ArrayBuffer/DataView
				bOffset = (a.byteOffset || 0) + (bView.byteOffset || 0),
				//Starting point for reading.
				bLen = 0,
				//a.count,//bView.byteLength,									//Byte Length for this Accessor

				TAry = null,
				//Type Array Ref
				DFunc = null; //DateView Function name

			//Figure out which Type Array we need to save the data in
			switch (a.componentType) {
				case _gltf.TYPE_FLOAT:
					TAry = Float32Array; DFunc = "getFloat32"; break;
				case _gltf.TYPE_SHORT:
					TAry = Int16Array; DFunc = "getInt16"; break;
				case _gltf.TYPE_UNSIGNED_SHORT:
					TAry = Uint16Array; DFunc = "getUint16"; break;
				case _gltf.TYPE_UNSIGNED_INT:
					TAry = Uint32Array; DFunc = "getUint32"; break;
				case _gltf.TYPE_UNSIGNED_BYTE:
					TAry = Uint8Array; DFunc = "getUint8"; break;

				default:
					console.log("ERROR processAccessor", "componentType unknown", a.componentType); return null; break;
			}

			//When more then one accessor shares a buffer, The BufferView length is the whole section
			//but that won't work, so you need to calc the partition size of that whole chunk of data
			//The math in the spec about stride doesn't seem to work, it goes over bounds, what Im using works.
			//https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#data-alignment
			if (bView.byteStride != undefined) bLen = bView.byteStride * a.count; else bLen = a.count * _gltf["COMP_" + a.type] * TAry.BYTES_PER_ELEMENT; //elmCnt * compCnt * compByteSize)

			//Pull the data out of the dataView based on the Type.
			var bPer = TAry.BYTES_PER_ELEMENT,
				//How many Bytes needed to make a single element
				aLen = bLen / bPer,
				//Final Array Length
				ary = new TAry(aLen),
				//Final Array
				p = 0; //Starting position in DataView

			for (var i = 0; i < aLen; i++) {
				p = bOffset + i * bPer;
				ary[i] = buf.dView[DFunc](p, true);
			}

			//console.log(a.type,_gltf["COMP_"+a.type],"offset",bOffset, "bLen",bLen, "aLen", aLen, ary);
			return { data: ary, max: a.max, min: a.min, count: a.count, compLen: _gltf["COMP_" + a.type] };
		}

		proto.prepareBuffer = function (idx) {
			var buf = this.json.buffers[idx];

			if (buf.dView != undefined) return buf;

			if (buf.uri.substr(0, 5) != "data:") {
				//TODO Get Bin File
				return buf;
			}

			//Create and Fill DataView with buffer data
			var pos = buf.uri.indexOf("base64,") + 7,
				blob = window.atob(buf.uri.substr(pos)),
				dv = new DataView(new ArrayBuffer(blob.length));
			for (var i = 0; i < blob.length; i++) {
				dv.setUint8(i, blob.charCodeAt(i));
			} buf.dView = dv;

			//console.log("buffer len",buf.byteLength,dv.byteLength);
			//var fAry = new Float32Array(blob.length/4);
			//for(var j=0; j < fAry.length; j++) fAry[j] = dv.getFloat32(j*4,true);
			//console.log(fAry);
			return buf;
		}

		proto.get = function () {
			return this.json.asset.version;
		};

		proto.parseMesh = function (idx) {
			var m = this.json.meshes[idx];
			var meshName = m.name || "unnamed";
			//m.weights = for morph targets
			//m.name

			//p.attributes.TANGENT = vec4
			//p.attributes.TEXCOORD_1 = vec2
			//p.attributes.COLOR_0 = vec3 or vec4
			//p.material
			//p.targets = Morph Targets
			console.log("Parse Mesh", meshName);
			//.....................................
			var p,
				//Alias for primative element
				a,
				//Alias for primative's attributes
				itm,
				mesh = [];

			for (var i = 0; i < m.primitives.length; i++) {
				p = m.primitives[i];
				a = p.attributes;

				itm = {
					name: meshName + "_p" + i,
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
				itm.vertices = this.processAccessor(a.POSITION);
				if (p.indices != undefined) itm.indices = this.processAccessor(p.indices);
				if (a.NORMAL != undefined) itm.normals = this.processAccessor(a.NORMAL);
				if (a.WEIGHTS_0 != undefined) itm.weights = this.processAccessor(a.WEIGHTS_0);
				if (a.JOINTS_0 != undefined) itm.joints = this.processAccessor(a.JOINTS_0);

				//NOTE : Spec pretty much states that a mesh CAN be made of up multiple objects, but each
				//object in reality is just a mesh with its own vertices and attributes. So each PRIMITIVE
				//is just a single draw call. For fungi I'm not going to build objects like this when
				//I export from mesh, so the first primitive in the mesh is enough for me.

				//May change the approach down the line if there is a need to have a single mesh
				//to be made up of sub meshes.

				if (m.fSkinIdx !== undefined) itm.armature = this.parseSkin(m.fSkinIdx);

				return itm;
			}
		}

	


		_gltf.load = function (str) {
			if (!this.sng) this.sng = new gltf();
			this.sng.json = JSON.parse(str);
		}


		_gltf.parse_mesh = function (str) {
			this.load(str);
			return this.sng.parseMesh(0);

		};



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

		return _gltf;

	});

	ge.gltf = gltf;
}