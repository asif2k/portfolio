function ps_collision(fin, pe, math ) { 
 
	var vec3 = math.vec3, aabb = math.aabb, mat3 = math.mat3, quat = math.quat;
	var collision = {
		broadphase: {
			bruteforce: {},
			bvh: {}
		},
		geometry: {},
		narrowphase: {
			detector: {								
				gjkepa: {}
			}
		}
	}; 


	collision.broadphase.BroadPhase = pe.define(function (proto) {
		proto.createProxy = function (userData, aabb) {
			return null;
		}

		proto.destroyProxy = function (proxy) {
		}

		proto.moveProxy = function (proxy, aabb, displacement) {
		}

		proto.isOverlapping = function (proxy1, proxy2) {
			if (proxy1._aabbMinX < proxy2._aabbMaxX && proxy1._aabbMaxX > proxy2._aabbMinX && proxy1._aabbMinY < proxy2._aabbMaxY && proxy1._aabbMaxY > proxy2._aabbMinY && proxy1._aabbMinZ < proxy2._aabbMaxZ) {
				return proxy1._aabbMaxZ > proxy2._aabbMinZ;
			} else {
				return false;
			}
		}

		proto.collectPairs = function () {
		}

		proto.getProxyPairList = function () {
			return this._proxyPairList;
		}

		proto.isIncremental = function () {
			return this._incremental;
		}

		proto.rayCast = function (begin, end, callback) {
		}

		proto.convexCast = function (convex, begin, translation, callback) {
		}

		proto.aabbTest = function (aabb, callback) {
		}

		var BroadPhase = function (type) {
			this._type = type;
			this._numProxies = 0;
			this._proxyList = null;
			this._proxyListLast = null;
			this._proxyPairList = null;
			this._incremental = false;
			this._testCount = 0;
			this._proxyPairPool = null;
			this._idCount = 0;
			this._convexSweep = new BroadPhase.ConvexSweepGeometry();
			this._aabb = new BroadPhase.AabbGeometry();
			this.identity = new pe.common.Transform();
			this.zero = vec3();
			this.rayCastHit = new collision.geometry.RayCastHit();
		}

		BroadPhase.ConvexSweepGeometry = pe.define(function (proto) {
			proto.init = function (c, transform, translation) {
				this.c = c;
				var tr;
				var trX;
				var trY;
				var trZ;
				var v = translation;
				trX = v[0];
				trY = v[1];
				trZ = v[2];
				var localTr;
				var localTrX;
				var localTrY;
				var localTrZ;
				var __tmp__X;
				var __tmp__Y;
				var __tmp__Z;
				__tmp__X = transform._rotation[0] * trX + transform._rotation[3] * trY + transform._rotation[6] * trZ;
				__tmp__Y = transform._rotation[1] * trX + transform._rotation[4] * trY + transform._rotation[7] * trZ;
				__tmp__Z = transform._rotation[2] * trX + transform._rotation[5] * trY + transform._rotation[8] * trZ;
				localTrX = __tmp__X;
				localTrY = __tmp__Y;
				localTrZ = __tmp__Z;
				this.localTranslation = vec3();
				var v1 = this.localTranslation;
				v1[0] = localTrX;
				v1[1] = localTrY;
				v1[2] = localTrZ;
				this._gjkMargin = c._gjkMargin;
			}

			proto.computeLocalSupportingVertex = function (dir, out) {
				this.c.computeLocalSupportingVertex(dir, out);
				var v = this.localTranslation;
				if (dir[0] * v[0] + dir[1] * v[1] + dir[2] * v[2] > 0) {
					var v1 = this.localTranslation;
					var tx = out[0] + v1[0];
					var ty = out[1] + v1[1];
					var tz = out[2] + v1[2];
					out[0] = tx;
					out[1] = ty;
					out[2] = tz;
				}
			}

			proto.rayCast = function (begin, end, transform, hit) {
				if (this._useGjkRayCast) {
					return collision.narrowphase.detector.gjkepa.GjkEpa.instance.rayCast(this, transform, begin, end, hit);
				} else {
					return collision.geometry.Geometry.prototype.rayCast.call(this, begin, end, transform, hit);
				}
			}

			proto._updateMass = function () {
			}

			proto._computeAabb = function (aabb, tf) {
			}

			proto._rayCastLocal = function (beginX, beginY, beginZ, endX, endY, endZ, hit) {
				return false;
			}

			var ConvexSweepGeometry = function () {
				collision.geometry.ConvexGeometry.call(this, -1);
			}
			return ConvexSweepGeometry;
		});

		BroadPhase.AabbGeometry = pe.define(function (proto) {
			proto.computeLocalSupportingVertex = function (dir, out) {
				out[0] = dir[0] > 0 ? this.max[0] : this.min[0];
				out[1] = dir[1] > 0 ? this.max[1] : this.min[1];
				out[2] = dir[2] > 0 ? this.max[2] : this.min[2];
			}

			proto.rayCast = function (begin, end, transform, hit) {
				if (this._useGjkRayCast) {
					return collision.narrowphase.detector.gjkepa.GjkEpa.instance.rayCast(this, transform, begin, end, hit);
				} else {
					return collision.geometry.Geometry.prototype.rayCast.call(this, begin, end, transform, hit);
				}
			}

			proto._updateMass = function () {
			}

			proto._computeAabb = function (aabb, tf) {
			}

			proto._rayCastLocal = function (beginX, beginY, beginZ, endX, endY, endZ, hit) {
				return false;
			}

			var AabbGeometry = function () {
				collision.geometry.ConvexGeometry.call(this, -1);
				this.min = vec3();
				this.max = vec3();
			}
			return AabbGeometry;
		});

		return BroadPhase;
	});



	collision.broadphase.BroadPhaseProxyCallback = pe.define(function (proto) {
		proto.process = function (proxy) {
		}

		var BroadPhaseProxyCallback = function () {
		}
		return BroadPhaseProxyCallback;
	});

	collision.broadphase.bruteforce.BruteForceBroadPhase = pe.define(function (proto) {
		proto.createProxy = function (userData, aabb) {
			var proxy = new collision.broadphase.Proxy(userData, this._idCount++);
			this._numProxies++;
			if (this._proxyList == null) {
				this._proxyList = proxy;
				this._proxyListLast = proxy;
			} else {
				this._proxyListLast._next = proxy;
				proxy._prev = this._proxyListLast;
				this._proxyListLast = proxy;
			}
			proxy._aabbMinX = aabb[0];
			proxy._aabbMinY = aabb[1];
			proxy._aabbMinZ = aabb[2];
			proxy._aabbMaxX = aabb[3];
			proxy._aabbMaxY = aabb[4];
			proxy._aabbMaxZ = aabb[5];
			return proxy;
		}

		proto.destroyProxy = function (proxy) {
			this._numProxies--;
			var prev = proxy._prev;
			var next = proxy._next;
			if (prev != null) {
				prev._next = next;
			}
			if (next != null) {
				next._prev = prev;
			}
			if (proxy == this._proxyList) {
				this._proxyList = this._proxyList._next;
			}
			if (proxy == this._proxyListLast) {
				this._proxyListLast = this._proxyListLast._prev;
			}
			proxy._next = null;
			proxy._prev = null;
			proxy.userData = null;
		}

		proto.moveProxy = function (proxy, aabb, dislacement) {
			proxy._aabbMinX = aabb[0];
			proxy._aabbMinY = aabb[1];
			proxy._aabbMinZ = aabb[2];
			proxy._aabbMaxX = aabb[3];
			proxy._aabbMaxY = aabb[4];
			proxy._aabbMaxZ = aabb[5];
		}

		proto.collectPairs = function () {
			var p = this._proxyPairList;
			if (p != null) {
				while (true) {
					p._p1 = null;
					p._p2 = null;
					p = p._next;
					if (!(p != null)) {
						break;
					}
				}
				this._proxyPairList._next = this._proxyPairPool;
				this._proxyPairPool = this._proxyPairList;
				this._proxyPairList = null;
			}
			this._testCount = 0;
			var p1 = this._proxyList;
			while (p1 != null) {
				var n = p1._next;
				var p2 = p1._next;
				while (p2 != null) {
					var n1 = p2._next;
					this._testCount++;
					if (p1._aabbMinX < p2._aabbMaxX && p1._aabbMaxX > p2._aabbMinX && p1._aabbMinY < p2._aabbMaxY && p1._aabbMaxY > p2._aabbMinY && p1._aabbMinZ < p2._aabbMaxZ && p1._aabbMaxZ > p2._aabbMinZ) {
						var first = this._proxyPairPool;
						if (first != null) {
							this._proxyPairPool = first._next;
							first._next = null;
						} else {
							first = new collision.broadphase.ProxyPair();
						}
						var pp = first;
						if (this._proxyPairList == null) {
							this._proxyPairList = pp;
						} else {
							pp._next = this._proxyPairList;
							this._proxyPairList = pp;
						}
						pp._p1 = p1;
						pp._p2 = p2;
					}
					p2 = n1;
				}
				p1 = n;
			}
		}

		proto.rayCast = function (begin, end, callback) {
			var p1;
			var p1X;
			var p1Y;
			var p1Z;
			var p2;
			var p2X;
			var p2Y;
			var p2Z;
			var dir;
			var dirX;
			var dirY;
			var dirZ;
			var v = begin;
			p1X = v[0];
			p1Y = v[1];
			p1Z = v[2];
			var v1 = end;
			p2X = v1[0];
			p2Y = v1[1];
			p2Z = v1[2];
			dirX = p2X - p1X;
			dirY = p2Y - p1Y;
			dirZ = p2Z - p1Z;
			var min;
			var minX;
			var minY;
			var minZ;
			var max;
			var maxX;
			var maxY;
			var maxZ;
			minX = p1X < p2X ? p1X : p2X;
			minY = p1Y < p2Y ? p1Y : p2Y;
			minZ = p1Z < p2Z ? p1Z : p2Z;
			maxX = p1X > p2X ? p1X : p2X;
			maxY = p1Y > p2Y ? p1Y : p2Y;
			maxZ = p1Z > p2Z ? p1Z : p2Z;
			var p = this._proxyList;
			while (p != null) {
				var n = p._next;
				var x1 = p1X;
				var y1 = p1Y;
				var z1 = p1Z;
				var x2 = p2X;
				var y2 = p2Y;
				var z2 = p2Z;
				var sminx = x1 < x2 ? x1 : x2;
				var sminy = y1 < y2 ? y1 : y2;
				var sminz = z1 < z2 ? z1 : z2;
				var smaxx = x1 > x2 ? x1 : x2;
				var smaxy = y1 > y2 ? y1 : y2;
				var smaxz = z1 > z2 ? z1 : z2;
				var pminx = p._aabbMinX;
				var pminy = p._aabbMinY;
				var pminz = p._aabbMinZ;
				var pmaxx = p._aabbMaxX;
				var pmaxy = p._aabbMaxY;
				var pmaxz = p._aabbMaxZ;
				var tmp;
				if (pminx > smaxx || pmaxx < sminx || pminy > smaxy || pmaxy < sminy || pminz > smaxz || pmaxz < sminz) {
					tmp = false;
				} else {
					var dx = x2 - x1;
					var dy = y2 - y1;
					var dz = z2 - z1;
					var adx = dx < 0 ? -dx : dx;
					var ady = dy < 0 ? -dy : dy;
					var adz = dz < 0 ? -dz : dz;
					var pextx = (pmaxx - pminx) * 0.5;
					var pexty = (pmaxy - pminy) * 0.5;
					var pextz = (pmaxz - pminz) * 0.5;
					var pcntx = (pmaxx + pminx) * 0.5;
					var pcnty = (pmaxy + pminy) * 0.5;
					var pcntz = (pmaxz + pminz) * 0.5;
					var cpx = x1 - pcntx;
					var cpy = y1 - pcnty;
					var cpz = z1 - pcntz;
					var tmp1;
					var tmp2;
					var x = cpy * dz - cpz * dy;
					if (!((x < 0 ? -x : x) - (pexty * adz + pextz * ady) > 0)) {
						var x3 = cpz * dx - cpx * dz;
						tmp2 = (x3 < 0 ? -x3 : x3) - (pextz * adx + pextx * adz) > 0;
					} else {
						tmp2 = true;
					}
					if (!tmp2) {
						var x4 = cpx * dy - cpy * dx;
						tmp1 = (x4 < 0 ? -x4 : x4) - (pextx * ady + pexty * adx) > 0;
					} else {
						tmp1 = true;
					}
					tmp = tmp1 ? false : true;
				}
				if (tmp) {
					callback.process(p);
				}
				p = n;
			}
		}

		proto.convexCast = function (convex, begin, translation, callback) {
			var p = this._proxyList;
			while (p != null) {
				var n = p._next;
				var v = this._aabb.min;
				v[0] = p._aabbMinX;
				v[1] = p._aabbMinY;
				v[2] = p._aabbMinZ;
				var v1 = this._aabb.max;
				v1[0] = p._aabbMaxX;
				v1[1] = p._aabbMaxY;
				v1[2] = p._aabbMaxZ;
				this._convexSweep.init(convex, begin, translation);
				var gjkEpa = collision.narrowphase.detector.gjkepa.GjkEpa.instance;
				if (gjkEpa.computeClosestPointsImpl(this._convexSweep, this._aabb, begin, this.identity, null, false) == 0 && gjkEpa.distance <= 0) {
					callback.process(p);
				}
				p = n;
			}
		}

		proto.aabbTest = function (aabb, callback) {
			var p = this._proxyList;
			while (p != null) {
				var n = p._next;
				if (aabb[0] < p._aabbMaxX && aabb[3] > p._aabbMinX && aabb[1] < p._aabbMaxY && aabb[4] > p._aabbMinY && aabb[2] < p._aabbMaxZ && aabb[5] > p._aabbMinZ) {
					callback.process(p);
				}
				p = n;
			}
		}

		proto.isOverlapping = function (proxy1, proxy2) {
			if (proxy1._aabbMinX < proxy2._aabbMaxX && proxy1._aabbMaxX > proxy2._aabbMinX && proxy1._aabbMinY < proxy2._aabbMaxY && proxy1._aabbMaxY > proxy2._aabbMinY && proxy1._aabbMinZ < proxy2._aabbMaxZ) {
				return proxy1._aabbMaxZ > proxy2._aabbMinZ;
			} else {
				return false;
			}
		}

		proto.getProxyPairList = function () {
			return this._proxyPairList;
		}

		proto.isIncremental = function () {
			return this._incremental;
		}

		var BruteForceBroadPhase = function () {
			collision.broadphase.BroadPhase.call(this, 1);
			this._incremental = false;
		}
		return BruteForceBroadPhase;
	});

	collision.broadphase.bvh.BvhBroadPhase = pe.define(function (proto) {
		proto.collide = function (n1, n2) {
			
			this._testCount++;
			var l1 = n1._height == 0;
			var l2 = n2._height == 0;
			if (n1 == n2) {
				if (l1) {
					return;
				}
				this.collide(n1._children[0], n2);
				this.collide(n1._children[1], n2);
				return;
			}
			if (!(n1._aabbMinX < n2._aabbMaxX && n1._aabbMaxX > n2._aabbMinX && n1._aabbMinY < n2._aabbMaxY && n1._aabbMaxY > n2._aabbMinY && n1._aabbMinZ < n2._aabbMaxZ && n1._aabbMaxZ > n2._aabbMinZ)) {
				return;
			}
			if (l1 && l2) {
				var p1 = n1._proxy;
				var p2 = n2._proxy;
				var first = this._proxyPairPool;
				if (first != null) {
					this._proxyPairPool = first._next;
					first._next = null;
				} else {
					first = new collision.broadphase.ProxyPair();
				}
				var pp = first;
				if (this._proxyPairList == null) {
					this._proxyPairList = pp;
				} else {
					pp._next = this._proxyPairList;
					this._proxyPairList = pp;
				}
				pp._p1 = p1;
				pp._p2 = p2;
				return;
			}
			if (l2 || n1._height > n2._height) {
				this.collide(n1._children[0], n2);
				this.collide(n1._children[1], n2);
			} else {
				this.collide(n2._children[0], n1);
				this.collide(n2._children[1], n1);
			}
		}

		proto.rayCastRecursive = function (node, _p1X, _p1Y, _p1Z, _p2X, _p2Y, _p2Z, callback) {
			var p1;
			var p1X;
			var p1Y;
			var p1Z;
			var p2;
			var p2X;
			var p2Y;
			var p2Z;
			p1X = _p1X;
			p1Y = _p1Y;
			p1Z = _p1Z;
			p2X = _p2X;
			p2Y = _p2Y;
			p2Z = _p2Z;
			var x1 = p1X;
			var y1 = p1Y;
			var z1 = p1Z;
			var x2 = p2X;
			var y2 = p2Y;
			var z2 = p2Z;
			var sminx = x1 < x2 ? x1 : x2;
			var sminy = y1 < y2 ? y1 : y2;
			var sminz = z1 < z2 ? z1 : z2;
			var smaxx = x1 > x2 ? x1 : x2;
			var smaxy = y1 > y2 ? y1 : y2;
			var smaxz = z1 > z2 ? z1 : z2;
			var pminx = node._aabbMinX;
			var pminy = node._aabbMinY;
			var pminz = node._aabbMinZ;
			var pmaxx = node._aabbMaxX;
			var pmaxy = node._aabbMaxY;
			var pmaxz = node._aabbMaxZ;
			var tmp;
			if (pminx > smaxx || pmaxx < sminx || pminy > smaxy || pmaxy < sminy || pminz > smaxz || pmaxz < sminz) {
				tmp = false;
			} else {
				var dx = x2 - x1;
				var dy = y2 - y1;
				var dz = z2 - z1;
				var adx = dx < 0 ? -dx : dx;
				var ady = dy < 0 ? -dy : dy;
				var adz = dz < 0 ? -dz : dz;
				var pextx = (pmaxx - pminx) * 0.5;
				var pexty = (pmaxy - pminy) * 0.5;
				var pextz = (pmaxz - pminz) * 0.5;
				var pcntx = (pmaxx + pminx) * 0.5;
				var pcnty = (pmaxy + pminy) * 0.5;
				var pcntz = (pmaxz + pminz) * 0.5;
				var cpx = x1 - pcntx;
				var cpy = y1 - pcnty;
				var cpz = z1 - pcntz;
				var tmp1;
				var tmp2;
				var x = cpy * dz - cpz * dy;
				if (!((x < 0 ? -x : x) - (pexty * adz + pextz * ady) > 0)) {
					var x3 = cpz * dx - cpx * dz;
					tmp2 = (x3 < 0 ? -x3 : x3) - (pextz * adx + pextx * adz) > 0;
				} else {
					tmp2 = true;
				}
				if (!tmp2) {
					var x4 = cpx * dy - cpy * dx;
					tmp1 = (x4 < 0 ? -x4 : x4) - (pextx * ady + pexty * adx) > 0;
				} else {
					tmp1 = true;
				}
				tmp = tmp1 ? false : true;
			}
			if (!tmp) {
				return;
			}
			if (node._height == 0) {
				callback.process(node._proxy);
				return;
			}
			this.rayCastRecursive(node._children[0], p1X, p1Y, p1Z, p2X, p2Y, p2Z, callback);
			this.rayCastRecursive(node._children[1], p1X, p1Y, p1Z, p2X, p2Y, p2Z, callback);
		}

		proto.convexCastRecursive = function (node, convex, begin, translation, callback) {
			var v = this._aabb.min;
			v[0] = node._aabbMinX;
			v[1] = node._aabbMinY;
			v[2] = node._aabbMinZ;
			var v1 = this._aabb.max;
			v1[0] = node._aabbMaxX;
			v1[1] = node._aabbMaxY;
			v1[2] = node._aabbMaxZ;
			this._convexSweep.init(convex, begin, translation);
			var gjkEpa = collision.narrowphase.detector.gjkepa.GjkEpa.instance;
			if (!(gjkEpa.computeClosestPointsImpl(this._convexSweep, this._aabb, begin, this.identity, null, false) == 0 && gjkEpa.distance <= 0)) {
				return;
			}
			if (node._height == 0) {
				callback.process(node._proxy);
				return;
			}
			this.convexCastRecursive(node._children[0], convex, begin, translation, callback);
			this.convexCastRecursive(node._children[1], convex, begin, translation, callback);
		}

		proto.aabbTestRecursive = function (node, aabb, callback) {
			if (!(node._aabbMinX < aabb[3] && node._aabbMaxX > aabb[0] && node._aabbMinY < aabb[4] && node._aabbMaxY > aabb[1] && node._aabbMinZ < aabb[5] && node._aabbMaxZ > aabb[2])) {
				return;
			}
			if (node._height == 0) {
				callback.process(node._proxy);
				return;
			}
			this.aabbTestRecursive(node._children[0], aabb, callback);
			this.aabbTestRecursive(node._children[1], aabb, callback);
		}

		proto.createProxy = function (userData, aabb) {
			var p = new collision.broadphase.bvh.BvhProxy(userData, this._idCount++);
			this._numProxies++;
			if (this._proxyList == null) {
				this._proxyList = p;
				this._proxyListLast = p;
			} else {
				this._proxyListLast._next = p;
				p._prev = this._proxyListLast;
				this._proxyListLast = p;
			}
			p._aabbMinX = aabb[0];
			p._aabbMinY = aabb[1];
			p._aabbMinZ = aabb[2];
			p._aabbMaxX = aabb[3];
			p._aabbMaxY = aabb[4];
			p._aabbMaxZ = aabb[5];
			var padding = pe.common.Setting.bvhProxyPadding;
			var paddingVec;
			var paddingVecX;
			var paddingVecY;
			var paddingVecZ;
			paddingVecX = padding;
			paddingVecY = padding;
			paddingVecZ = padding;
			p._aabbMinX -= paddingVecX;
			p._aabbMinY -= paddingVecY;
			p._aabbMinZ -= paddingVecZ;
			p._aabbMaxX += paddingVecX;
			p._aabbMaxY += paddingVecY;
			p._aabbMaxZ += paddingVecZ;
			var _this = this._tree;
			var first = _this._nodePool;
			if (first != null) {
				_this._nodePool = first._next;
				first._next = null;
			} else {
				first = new collision.broadphase.bvh.BvhNode();
			}
			var leaf = first;
			leaf._proxy = p;
			p._leaf = leaf;
			leaf._aabbMinX = p._aabbMinX;
			leaf._aabbMinY = p._aabbMinY;
			leaf._aabbMinZ = p._aabbMinZ;
			leaf._aabbMaxX = p._aabbMaxX;
			leaf._aabbMaxY = p._aabbMaxY;
			leaf._aabbMaxZ = p._aabbMaxZ;
			_this._numLeaves++;
			if (_this.leafList == null) {
				_this.leafList = leaf;
				_this.leafListLast = leaf;
			} else {
				_this.leafListLast._nextLeaf = leaf;
				leaf._prevLeaf = _this.leafListLast;
				_this.leafListLast = leaf;
			}
			if (_this._root == null) {
				_this._root = leaf;
			} else {
				var sibling = _this._root;
				while (sibling._height > 0) {
					var nextStep = _this._strategy._decideInsertion(sibling, leaf);
					if (nextStep == -1) {
						break;
					} else {
						sibling = sibling._children[nextStep];
					}
				}
				var parent = sibling._parent;
				var first1 = _this._nodePool;
				if (first1 != null) {
					_this._nodePool = first1._next;
					first1._next = null;
				} else {
					first1 = new collision.broadphase.bvh.BvhNode();
				}
				var node = first1;
				if (parent == null) {
					_this._root = node;
				} else {
					var index = sibling._childIndex;
					parent._children[index] = node;
					node._parent = parent;
					node._childIndex = index;
				}
				var index1 = sibling._childIndex;
				node._children[index1] = sibling;
				sibling._parent = node;
				sibling._childIndex = index1;
				var index2 = sibling._childIndex ^ 1;
				node._children[index2] = leaf;
				leaf._parent = node;
				leaf._childIndex = index2;
				while (node != null) {
					if (_this._strategy._balancingEnabled) {
						var nh = node._height;
						if (nh < 2) {
							node = node;
						} else {
							var p1 = node._parent;
							var l = node._children[0];
							var r = node._children[1];
							var lh = l._height;
							var rh = r._height;
							var balance = lh - rh;
							var nodeIndex = node._childIndex;
							if (balance > 1) {
								var ll = l._children[0];
								var lr = l._children[1];
								var llh = ll._height;
								var lrh = lr._height;
								if (llh > lrh) {
									l._children[1] = node;
									node._parent = l;
									node._childIndex = 1;
									node._children[0] = lr;
									lr._parent = node;
									lr._childIndex = 0;
									var c1 = l._children[0];
									var c2 = l._children[1];
									l._aabbMinX = c1._aabbMinX < c2._aabbMinX ? c1._aabbMinX : c2._aabbMinX;
									l._aabbMinY = c1._aabbMinY < c2._aabbMinY ? c1._aabbMinY : c2._aabbMinY;
									l._aabbMinZ = c1._aabbMinZ < c2._aabbMinZ ? c1._aabbMinZ : c2._aabbMinZ;
									l._aabbMaxX = c1._aabbMaxX > c2._aabbMaxX ? c1._aabbMaxX : c2._aabbMaxX;
									l._aabbMaxY = c1._aabbMaxY > c2._aabbMaxY ? c1._aabbMaxY : c2._aabbMaxY;
									l._aabbMaxZ = c1._aabbMaxZ > c2._aabbMaxZ ? c1._aabbMaxZ : c2._aabbMaxZ;
									var h1 = l._children[0]._height;
									var h2 = l._children[1]._height;
									l._height = (h1 > h2 ? h1 : h2) + 1;
									var c11 = node._children[0];
									var c21 = node._children[1];
									node._aabbMinX = c11._aabbMinX < c21._aabbMinX ? c11._aabbMinX : c21._aabbMinX;
									node._aabbMinY = c11._aabbMinY < c21._aabbMinY ? c11._aabbMinY : c21._aabbMinY;
									node._aabbMinZ = c11._aabbMinZ < c21._aabbMinZ ? c11._aabbMinZ : c21._aabbMinZ;
									node._aabbMaxX = c11._aabbMaxX > c21._aabbMaxX ? c11._aabbMaxX : c21._aabbMaxX;
									node._aabbMaxY = c11._aabbMaxY > c21._aabbMaxY ? c11._aabbMaxY : c21._aabbMaxY;
									node._aabbMaxZ = c11._aabbMaxZ > c21._aabbMaxZ ? c11._aabbMaxZ : c21._aabbMaxZ;
									var h11 = node._children[0]._height;
									var h21 = node._children[1]._height;
									node._height = (h11 > h21 ? h11 : h21) + 1;
								} else {
									l._children[0] = node;
									node._parent = l;
									node._childIndex = 0;
									node._children[0] = ll;
									ll._parent = node;
									ll._childIndex = 0;
									var c12 = l._children[0];
									var c22 = l._children[1];
									l._aabbMinX = c12._aabbMinX < c22._aabbMinX ? c12._aabbMinX : c22._aabbMinX;
									l._aabbMinY = c12._aabbMinY < c22._aabbMinY ? c12._aabbMinY : c22._aabbMinY;
									l._aabbMinZ = c12._aabbMinZ < c22._aabbMinZ ? c12._aabbMinZ : c22._aabbMinZ;
									l._aabbMaxX = c12._aabbMaxX > c22._aabbMaxX ? c12._aabbMaxX : c22._aabbMaxX;
									l._aabbMaxY = c12._aabbMaxY > c22._aabbMaxY ? c12._aabbMaxY : c22._aabbMaxY;
									l._aabbMaxZ = c12._aabbMaxZ > c22._aabbMaxZ ? c12._aabbMaxZ : c22._aabbMaxZ;
									var h12 = l._children[0]._height;
									var h22 = l._children[1]._height;
									l._height = (h12 > h22 ? h12 : h22) + 1;
									var c13 = node._children[0];
									var c23 = node._children[1];
									node._aabbMinX = c13._aabbMinX < c23._aabbMinX ? c13._aabbMinX : c23._aabbMinX;
									node._aabbMinY = c13._aabbMinY < c23._aabbMinY ? c13._aabbMinY : c23._aabbMinY;
									node._aabbMinZ = c13._aabbMinZ < c23._aabbMinZ ? c13._aabbMinZ : c23._aabbMinZ;
									node._aabbMaxX = c13._aabbMaxX > c23._aabbMaxX ? c13._aabbMaxX : c23._aabbMaxX;
									node._aabbMaxY = c13._aabbMaxY > c23._aabbMaxY ? c13._aabbMaxY : c23._aabbMaxY;
									node._aabbMaxZ = c13._aabbMaxZ > c23._aabbMaxZ ? c13._aabbMaxZ : c23._aabbMaxZ;
									var h13 = node._children[0]._height;
									var h23 = node._children[1]._height;
									node._height = (h13 > h23 ? h13 : h23) + 1;
								}
								if (p1 != null) {
									p1._children[nodeIndex] = l;
									l._parent = p1;
									l._childIndex = nodeIndex;
								} else {
									_this._root = l;
									l._parent = null;
								}
								node = l;
							} else if (balance < -1) {
								var rl = r._children[0];
								var rr = r._children[1];
								var rlh = rl._height;
								var rrh = rr._height;
								if (rlh > rrh) {
									r._children[1] = node;
									node._parent = r;
									node._childIndex = 1;
									node._children[1] = rr;
									rr._parent = node;
									rr._childIndex = 1;
									var c14 = r._children[0];
									var c24 = r._children[1];
									r._aabbMinX = c14._aabbMinX < c24._aabbMinX ? c14._aabbMinX : c24._aabbMinX;
									r._aabbMinY = c14._aabbMinY < c24._aabbMinY ? c14._aabbMinY : c24._aabbMinY;
									r._aabbMinZ = c14._aabbMinZ < c24._aabbMinZ ? c14._aabbMinZ : c24._aabbMinZ;
									r._aabbMaxX = c14._aabbMaxX > c24._aabbMaxX ? c14._aabbMaxX : c24._aabbMaxX;
									r._aabbMaxY = c14._aabbMaxY > c24._aabbMaxY ? c14._aabbMaxY : c24._aabbMaxY;
									r._aabbMaxZ = c14._aabbMaxZ > c24._aabbMaxZ ? c14._aabbMaxZ : c24._aabbMaxZ;
									var h14 = r._children[0]._height;
									var h24 = r._children[1]._height;
									r._height = (h14 > h24 ? h14 : h24) + 1;
									var c15 = node._children[0];
									var c25 = node._children[1];
									node._aabbMinX = c15._aabbMinX < c25._aabbMinX ? c15._aabbMinX : c25._aabbMinX;
									node._aabbMinY = c15._aabbMinY < c25._aabbMinY ? c15._aabbMinY : c25._aabbMinY;
									node._aabbMinZ = c15._aabbMinZ < c25._aabbMinZ ? c15._aabbMinZ : c25._aabbMinZ;
									node._aabbMaxX = c15._aabbMaxX > c25._aabbMaxX ? c15._aabbMaxX : c25._aabbMaxX;
									node._aabbMaxY = c15._aabbMaxY > c25._aabbMaxY ? c15._aabbMaxY : c25._aabbMaxY;
									node._aabbMaxZ = c15._aabbMaxZ > c25._aabbMaxZ ? c15._aabbMaxZ : c25._aabbMaxZ;
									var h15 = node._children[0]._height;
									var h25 = node._children[1]._height;
									node._height = (h15 > h25 ? h15 : h25) + 1;
								} else {
									r._children[0] = node;
									node._parent = r;
									node._childIndex = 0;
									node._children[1] = rl;
									rl._parent = node;
									rl._childIndex = 1;
									var c16 = r._children[0];
									var c26 = r._children[1];
									r._aabbMinX = c16._aabbMinX < c26._aabbMinX ? c16._aabbMinX : c26._aabbMinX;
									r._aabbMinY = c16._aabbMinY < c26._aabbMinY ? c16._aabbMinY : c26._aabbMinY;
									r._aabbMinZ = c16._aabbMinZ < c26._aabbMinZ ? c16._aabbMinZ : c26._aabbMinZ;
									r._aabbMaxX = c16._aabbMaxX > c26._aabbMaxX ? c16._aabbMaxX : c26._aabbMaxX;
									r._aabbMaxY = c16._aabbMaxY > c26._aabbMaxY ? c16._aabbMaxY : c26._aabbMaxY;
									r._aabbMaxZ = c16._aabbMaxZ > c26._aabbMaxZ ? c16._aabbMaxZ : c26._aabbMaxZ;
									var h16 = r._children[0]._height;
									var h26 = r._children[1]._height;
									r._height = (h16 > h26 ? h16 : h26) + 1;
									var c17 = node._children[0];
									var c27 = node._children[1];
									node._aabbMinX = c17._aabbMinX < c27._aabbMinX ? c17._aabbMinX : c27._aabbMinX;
									node._aabbMinY = c17._aabbMinY < c27._aabbMinY ? c17._aabbMinY : c27._aabbMinY;
									node._aabbMinZ = c17._aabbMinZ < c27._aabbMinZ ? c17._aabbMinZ : c27._aabbMinZ;
									node._aabbMaxX = c17._aabbMaxX > c27._aabbMaxX ? c17._aabbMaxX : c27._aabbMaxX;
									node._aabbMaxY = c17._aabbMaxY > c27._aabbMaxY ? c17._aabbMaxY : c27._aabbMaxY;
									node._aabbMaxZ = c17._aabbMaxZ > c27._aabbMaxZ ? c17._aabbMaxZ : c27._aabbMaxZ;
									var h17 = node._children[0]._height;
									var h27 = node._children[1]._height;
									node._height = (h17 > h27 ? h17 : h27) + 1;
								}
								if (p1 != null) {
									p1._children[nodeIndex] = r;
									r._parent = p1;
									r._childIndex = nodeIndex;
								} else {
									_this._root = r;
									r._parent = null;
								}
								node = r;
							} else {
								node = node;
							}
						}
					}
					var h18 = node._children[0]._height;
					var h28 = node._children[1]._height;
					node._height = (h18 > h28 ? h18 : h28) + 1;
					var c18 = node._children[0];
					var c28 = node._children[1];
					node._aabbMinX = c18._aabbMinX < c28._aabbMinX ? c18._aabbMinX : c28._aabbMinX;
					node._aabbMinY = c18._aabbMinY < c28._aabbMinY ? c18._aabbMinY : c28._aabbMinY;
					node._aabbMinZ = c18._aabbMinZ < c28._aabbMinZ ? c18._aabbMinZ : c28._aabbMinZ;
					node._aabbMaxX = c18._aabbMaxX > c28._aabbMaxX ? c18._aabbMaxX : c28._aabbMaxX;
					node._aabbMaxY = c18._aabbMaxY > c28._aabbMaxY ? c18._aabbMaxY : c28._aabbMaxY;
					node._aabbMaxZ = c18._aabbMaxZ > c28._aabbMaxZ ? c18._aabbMaxZ : c28._aabbMaxZ;
					node = node._parent;
				}
			}
			if (!p._moved) {
				p._moved = true;
				if (this.movedProxies.length == this.numMovedProxies) {
					var newLength = this.numMovedProxies << 1;
					var this1 = new Array(newLength);
					var newArray = this1;
					var _g1 = 0;
					var _g = this.numMovedProxies;
					while (_g1 < _g) {
						var i = _g1++;
						newArray[i] = this.movedProxies[i];
						this.movedProxies[i] = null;
					}
					this.movedProxies = newArray;
				}
				this.movedProxies[this.numMovedProxies++] = p;
			}
			return p;
		}

		proto.destroyProxy = function (proxy) {
			this._numProxies--;
			var prev = proxy._prev;
			var next = proxy._next;
			if (prev != null) {
				prev._next = next;
			}
			if (next != null) {
				next._prev = prev;
			}
			if (proxy == this._proxyList) {
				this._proxyList = this._proxyList._next;
			}
			if (proxy == this._proxyListLast) {
				this._proxyListLast = this._proxyListLast._prev;
			}
			proxy._next = null;
			proxy._prev = null;
			var bvhProxy = proxy;
			var _this = this._tree;
			var leaf = bvhProxy._leaf;
			_this._numLeaves--;
			var prev1 = leaf._prevLeaf;
			var next1 = leaf._nextLeaf;
			if (prev1 != null) {
				prev1._nextLeaf = next1;
			}
			if (next1 != null) {
				next1._prevLeaf = prev1;
			}
			if (leaf == _this.leafList) {
				_this.leafList = _this.leafList._nextLeaf;
			}
			if (leaf == _this.leafListLast) {
				_this.leafListLast = _this.leafListLast._prevLeaf;
			}
			leaf._nextLeaf = null;
			leaf._prevLeaf = null;
			if (_this._root == leaf) {
				_this._root = null;
			} else {
				var parent = leaf._parent;
				var sibling = parent._children[leaf._childIndex ^ 1];
				var grandParent = parent._parent;
				if (grandParent == null) {
					sibling._parent = null;
					sibling._childIndex = 0;
					_this._root = sibling;
					parent._next = null;
					parent._childIndex = 0;
					parent._children[0] = null;
					parent._children[1] = null;
					parent._childIndex = 0;
					parent._parent = null;
					parent._height = 0;
					parent._proxy = null;
					parent._next = _this._nodePool;
					_this._nodePool = parent;
				} else {
					sibling._parent = grandParent;
					var index = parent._childIndex;
					grandParent._children[index] = sibling;
					sibling._parent = grandParent;
					sibling._childIndex = index;
					parent._next = null;
					parent._childIndex = 0;
					parent._children[0] = null;
					parent._children[1] = null;
					parent._childIndex = 0;
					parent._parent = null;
					parent._height = 0;
					parent._proxy = null;
					parent._next = _this._nodePool;
					_this._nodePool = parent;
					var node = grandParent;
					while (node != null) {
						if (_this._strategy._balancingEnabled) {
							var nh = node._height;
							if (nh < 2) {
								node = node;
							} else {
								var p = node._parent;
								var l = node._children[0];
								var r = node._children[1];
								var lh = l._height;
								var rh = r._height;
								var balance = lh - rh;
								var nodeIndex = node._childIndex;
								if (balance > 1) {
									var ll = l._children[0];
									var lr = l._children[1];
									var llh = ll._height;
									var lrh = lr._height;
									if (llh > lrh) {
										l._children[1] = node;
										node._parent = l;
										node._childIndex = 1;
										node._children[0] = lr;
										lr._parent = node;
										lr._childIndex = 0;
										var c1 = l._children[0];
										var c2 = l._children[1];
										l._aabbMinX = c1._aabbMinX < c2._aabbMinX ? c1._aabbMinX : c2._aabbMinX;
										l._aabbMinY = c1._aabbMinY < c2._aabbMinY ? c1._aabbMinY : c2._aabbMinY;
										l._aabbMinZ = c1._aabbMinZ < c2._aabbMinZ ? c1._aabbMinZ : c2._aabbMinZ;
										l._aabbMaxX = c1._aabbMaxX > c2._aabbMaxX ? c1._aabbMaxX : c2._aabbMaxX;
										l._aabbMaxY = c1._aabbMaxY > c2._aabbMaxY ? c1._aabbMaxY : c2._aabbMaxY;
										l._aabbMaxZ = c1._aabbMaxZ > c2._aabbMaxZ ? c1._aabbMaxZ : c2._aabbMaxZ;
										var h1 = l._children[0]._height;
										var h2 = l._children[1]._height;
										l._height = (h1 > h2 ? h1 : h2) + 1;
										var c11 = node._children[0];
										var c21 = node._children[1];
										node._aabbMinX = c11._aabbMinX < c21._aabbMinX ? c11._aabbMinX : c21._aabbMinX;
										node._aabbMinY = c11._aabbMinY < c21._aabbMinY ? c11._aabbMinY : c21._aabbMinY;
										node._aabbMinZ = c11._aabbMinZ < c21._aabbMinZ ? c11._aabbMinZ : c21._aabbMinZ;
										node._aabbMaxX = c11._aabbMaxX > c21._aabbMaxX ? c11._aabbMaxX : c21._aabbMaxX;
										node._aabbMaxY = c11._aabbMaxY > c21._aabbMaxY ? c11._aabbMaxY : c21._aabbMaxY;
										node._aabbMaxZ = c11._aabbMaxZ > c21._aabbMaxZ ? c11._aabbMaxZ : c21._aabbMaxZ;
										var h11 = node._children[0]._height;
										var h21 = node._children[1]._height;
										node._height = (h11 > h21 ? h11 : h21) + 1;
									} else {
										l._children[0] = node;
										node._parent = l;
										node._childIndex = 0;
										node._children[0] = ll;
										ll._parent = node;
										ll._childIndex = 0;
										var c12 = l._children[0];
										var c22 = l._children[1];
										l._aabbMinX = c12._aabbMinX < c22._aabbMinX ? c12._aabbMinX : c22._aabbMinX;
										l._aabbMinY = c12._aabbMinY < c22._aabbMinY ? c12._aabbMinY : c22._aabbMinY;
										l._aabbMinZ = c12._aabbMinZ < c22._aabbMinZ ? c12._aabbMinZ : c22._aabbMinZ;
										l._aabbMaxX = c12._aabbMaxX > c22._aabbMaxX ? c12._aabbMaxX : c22._aabbMaxX;
										l._aabbMaxY = c12._aabbMaxY > c22._aabbMaxY ? c12._aabbMaxY : c22._aabbMaxY;
										l._aabbMaxZ = c12._aabbMaxZ > c22._aabbMaxZ ? c12._aabbMaxZ : c22._aabbMaxZ;
										var h12 = l._children[0]._height;
										var h22 = l._children[1]._height;
										l._height = (h12 > h22 ? h12 : h22) + 1;
										var c13 = node._children[0];
										var c23 = node._children[1];
										node._aabbMinX = c13._aabbMinX < c23._aabbMinX ? c13._aabbMinX : c23._aabbMinX;
										node._aabbMinY = c13._aabbMinY < c23._aabbMinY ? c13._aabbMinY : c23._aabbMinY;
										node._aabbMinZ = c13._aabbMinZ < c23._aabbMinZ ? c13._aabbMinZ : c23._aabbMinZ;
										node._aabbMaxX = c13._aabbMaxX > c23._aabbMaxX ? c13._aabbMaxX : c23._aabbMaxX;
										node._aabbMaxY = c13._aabbMaxY > c23._aabbMaxY ? c13._aabbMaxY : c23._aabbMaxY;
										node._aabbMaxZ = c13._aabbMaxZ > c23._aabbMaxZ ? c13._aabbMaxZ : c23._aabbMaxZ;
										var h13 = node._children[0]._height;
										var h23 = node._children[1]._height;
										node._height = (h13 > h23 ? h13 : h23) + 1;
									}
									if (p != null) {
										p._children[nodeIndex] = l;
										l._parent = p;
										l._childIndex = nodeIndex;
									} else {
										_this._root = l;
										l._parent = null;
									}
									node = l;
								} else if (balance < -1) {
									var rl = r._children[0];
									var rr = r._children[1];
									var rlh = rl._height;
									var rrh = rr._height;
									if (rlh > rrh) {
										r._children[1] = node;
										node._parent = r;
										node._childIndex = 1;
										node._children[1] = rr;
										rr._parent = node;
										rr._childIndex = 1;
										var c14 = r._children[0];
										var c24 = r._children[1];
										r._aabbMinX = c14._aabbMinX < c24._aabbMinX ? c14._aabbMinX : c24._aabbMinX;
										r._aabbMinY = c14._aabbMinY < c24._aabbMinY ? c14._aabbMinY : c24._aabbMinY;
										r._aabbMinZ = c14._aabbMinZ < c24._aabbMinZ ? c14._aabbMinZ : c24._aabbMinZ;
										r._aabbMaxX = c14._aabbMaxX > c24._aabbMaxX ? c14._aabbMaxX : c24._aabbMaxX;
										r._aabbMaxY = c14._aabbMaxY > c24._aabbMaxY ? c14._aabbMaxY : c24._aabbMaxY;
										r._aabbMaxZ = c14._aabbMaxZ > c24._aabbMaxZ ? c14._aabbMaxZ : c24._aabbMaxZ;
										var h14 = r._children[0]._height;
										var h24 = r._children[1]._height;
										r._height = (h14 > h24 ? h14 : h24) + 1;
										var c15 = node._children[0];
										var c25 = node._children[1];
										node._aabbMinX = c15._aabbMinX < c25._aabbMinX ? c15._aabbMinX : c25._aabbMinX;
										node._aabbMinY = c15._aabbMinY < c25._aabbMinY ? c15._aabbMinY : c25._aabbMinY;
										node._aabbMinZ = c15._aabbMinZ < c25._aabbMinZ ? c15._aabbMinZ : c25._aabbMinZ;
										node._aabbMaxX = c15._aabbMaxX > c25._aabbMaxX ? c15._aabbMaxX : c25._aabbMaxX;
										node._aabbMaxY = c15._aabbMaxY > c25._aabbMaxY ? c15._aabbMaxY : c25._aabbMaxY;
										node._aabbMaxZ = c15._aabbMaxZ > c25._aabbMaxZ ? c15._aabbMaxZ : c25._aabbMaxZ;
										var h15 = node._children[0]._height;
										var h25 = node._children[1]._height;
										node._height = (h15 > h25 ? h15 : h25) + 1;
									} else {
										r._children[0] = node;
										node._parent = r;
										node._childIndex = 0;
										node._children[1] = rl;
										rl._parent = node;
										rl._childIndex = 1;
										var c16 = r._children[0];
										var c26 = r._children[1];
										r._aabbMinX = c16._aabbMinX < c26._aabbMinX ? c16._aabbMinX : c26._aabbMinX;
										r._aabbMinY = c16._aabbMinY < c26._aabbMinY ? c16._aabbMinY : c26._aabbMinY;
										r._aabbMinZ = c16._aabbMinZ < c26._aabbMinZ ? c16._aabbMinZ : c26._aabbMinZ;
										r._aabbMaxX = c16._aabbMaxX > c26._aabbMaxX ? c16._aabbMaxX : c26._aabbMaxX;
										r._aabbMaxY = c16._aabbMaxY > c26._aabbMaxY ? c16._aabbMaxY : c26._aabbMaxY;
										r._aabbMaxZ = c16._aabbMaxZ > c26._aabbMaxZ ? c16._aabbMaxZ : c26._aabbMaxZ;
										var h16 = r._children[0]._height;
										var h26 = r._children[1]._height;
										r._height = (h16 > h26 ? h16 : h26) + 1;
										var c17 = node._children[0];
										var c27 = node._children[1];
										node._aabbMinX = c17._aabbMinX < c27._aabbMinX ? c17._aabbMinX : c27._aabbMinX;
										node._aabbMinY = c17._aabbMinY < c27._aabbMinY ? c17._aabbMinY : c27._aabbMinY;
										node._aabbMinZ = c17._aabbMinZ < c27._aabbMinZ ? c17._aabbMinZ : c27._aabbMinZ;
										node._aabbMaxX = c17._aabbMaxX > c27._aabbMaxX ? c17._aabbMaxX : c27._aabbMaxX;
										node._aabbMaxY = c17._aabbMaxY > c27._aabbMaxY ? c17._aabbMaxY : c27._aabbMaxY;
										node._aabbMaxZ = c17._aabbMaxZ > c27._aabbMaxZ ? c17._aabbMaxZ : c27._aabbMaxZ;
										var h17 = node._children[0]._height;
										var h27 = node._children[1]._height;
										node._height = (h17 > h27 ? h17 : h27) + 1;
									}
									if (p != null) {
										p._children[nodeIndex] = r;
										r._parent = p;
										r._childIndex = nodeIndex;
									} else {
										_this._root = r;
										r._parent = null;
									}
									node = r;
								} else {
									node = node;
								}
							}
						}
						var h18 = node._children[0]._height;
						var h28 = node._children[1]._height;
						node._height = (h18 > h28 ? h18 : h28) + 1;
						var c18 = node._children[0];
						var c28 = node._children[1];
						node._aabbMinX = c18._aabbMinX < c28._aabbMinX ? c18._aabbMinX : c28._aabbMinX;
						node._aabbMinY = c18._aabbMinY < c28._aabbMinY ? c18._aabbMinY : c28._aabbMinY;
						node._aabbMinZ = c18._aabbMinZ < c28._aabbMinZ ? c18._aabbMinZ : c28._aabbMinZ;
						node._aabbMaxX = c18._aabbMaxX > c28._aabbMaxX ? c18._aabbMaxX : c28._aabbMaxX;
						node._aabbMaxY = c18._aabbMaxY > c28._aabbMaxY ? c18._aabbMaxY : c28._aabbMaxY;
						node._aabbMaxZ = c18._aabbMaxZ > c28._aabbMaxZ ? c18._aabbMaxZ : c28._aabbMaxZ;
						node = node._parent;
					}
				}
			}
			bvhProxy._leaf = null;
			leaf._next = null;
			leaf._childIndex = 0;
			leaf._children[0] = null;
			leaf._children[1] = null;
			leaf._childIndex = 0;
			leaf._parent = null;
			leaf._height = 0;
			leaf._proxy = null;
			leaf._next = _this._nodePool;
			_this._nodePool = leaf;
			bvhProxy.userData = null;
			bvhProxy._next = null;
			bvhProxy._prev = null;
			if (bvhProxy._moved) {
				bvhProxy._moved = false;
			}
		}

		proto.moveProxy = function (proxy, aabb, displacement) {


			var p = proxy;
			if (p._aabbMinX <= aabb[0] && p._aabbMaxX >= aabb[3] && p._aabbMinY <= aabb[1] && p._aabbMaxY >= aabb[4] && p._aabbMinZ <= aabb[2] && p._aabbMaxZ >= aabb[5]) {
				return;
			}
			p._aabbMinX = aabb[0];
			p._aabbMinY = aabb[1];
			p._aabbMinZ = aabb[2];
			p._aabbMaxX = aabb[3];
			p._aabbMaxY = aabb[4];
			p._aabbMaxZ = aabb[5];
			var padding = pe.common.Setting.bvhProxyPadding;
			var paddingVec;
			var paddingVecX;
			var paddingVecY;
			var paddingVecZ;
			paddingVecX = padding;
			paddingVecY = padding;
			paddingVecZ = padding;
			p._aabbMinX -= paddingVecX;
			p._aabbMinY -= paddingVecY;
			p._aabbMinZ -= paddingVecZ;
			p._aabbMaxX += paddingVecX;
			p._aabbMaxY += paddingVecY;
			p._aabbMaxZ += paddingVecZ;
			if (displacement != null) {
				var d;
				var dX;
				var dY;
				var dZ;
				var zero;
				var zeroX;
				var zeroY;
				var zeroZ;
				var addToMin;
				var addToMinX;
				var addToMinY;
				var addToMinZ;
				var addToMax;
				var addToMaxX;
				var addToMaxY;
				var addToMaxZ;
				zeroX = 0;
				zeroY = 0;
				zeroZ = 0;
				var v = displacement;
				dX = v[0];
				dY = v[1];
				dZ = v[2];
				addToMinX = zeroX < dX ? zeroX : dX;
				addToMinY = zeroY < dY ? zeroY : dY;
				addToMinZ = zeroZ < dZ ? zeroZ : dZ;
				addToMaxX = zeroX > dX ? zeroX : dX;
				addToMaxY = zeroY > dY ? zeroY : dY;
				addToMaxZ = zeroZ > dZ ? zeroZ : dZ;
				p._aabbMinX += addToMinX;
				p._aabbMinY += addToMinY;
				p._aabbMinZ += addToMinZ;
				p._aabbMaxX += addToMaxX;
				p._aabbMaxY += addToMaxY;
				p._aabbMaxZ += addToMaxZ;
			}
			if (!p._moved) {
				p._moved = true;
				if (this.movedProxies.length == this.numMovedProxies) {
					var newLength = this.numMovedProxies << 1;
					var this1 = new Array(newLength);
					var newArray = this1;
					var _g1 = 0;
					var _g = this.numMovedProxies;
					while (_g1 < _g) {
						var i = _g1++;
						newArray[i] = this.movedProxies[i];
						this.movedProxies[i] = null;
					}
					this.movedProxies = newArray;
				}
				this.movedProxies[this.numMovedProxies++] = p;
			}
		}

		proto.collectPairs = function () {
			var p = this._proxyPairList;
			if (p != null) {
				while (true) {
					p._p1 = null;
					p._p2 = null;
					p = p._next;
					if (!(p != null)) {
						break;
					}
				}
				this._proxyPairList._next = this._proxyPairPool;
				this._proxyPairPool = this._proxyPairList;
				this._proxyPairList = null;
			}
			this._testCount = 0;
			if (this._numProxies < 2) {
				return;
			}
			var topDown = false;
			if (topDown) {
				while (this.numMovedProxies > 0) this.movedProxies[--this.numMovedProxies] = null;
				var _this = this._tree;
				if (_this._root != null) {
					if (_this._root != null) {
						_this.decomposeRecursive(_this._root);
						_this._root = null;
					}
					while (_this.tmp.length < _this._numLeaves) {
						var newLength = _this.tmp.length << 1;
						var this1 = new Array(newLength);
						var newArray = this1;
						var _g1 = 0;
						var _g = _this.tmp.length;
						while (_g1 < _g) {
							var i = _g1++;
							newArray[i] = _this.tmp[i];
							_this.tmp[i] = null;
						}
						_this.tmp = newArray;
					}
					var idx = 0;
					var leaf = _this.leafList;
					while (leaf != null) {
						var n = leaf._nextLeaf;
						_this.tmp[idx] = leaf;
						++idx;
						leaf = n;
					}
					_this._root = _this.buildTopDownRecursive(_this.tmp, 0, _this._numLeaves);
				}
				this.collide(this._tree._root, this._tree._root);
				return;
			}
			var incrementalCollision = this.numMovedProxies / this._numProxies < pe.common.Setting.bvhIncrementalCollisionThreshold;
			var _g11 = 0;
			var _g2 = this.numMovedProxies;
			while (_g11 < _g2) {
				var i1 = _g11++;
				var p1 = this.movedProxies[i1];
				if (p1._moved) {
					var _this1 = this._tree;
					var leaf1 = p1._leaf;
					_this1._numLeaves--;
					var prev = leaf1._prevLeaf;
					var next = leaf1._nextLeaf;
					if (prev != null) {
						prev._nextLeaf = next;
					}
					if (next != null) {
						next._prevLeaf = prev;
					}
					if (leaf1 == _this1.leafList) {
						_this1.leafList = _this1.leafList._nextLeaf;
					}
					if (leaf1 == _this1.leafListLast) {
						_this1.leafListLast = _this1.leafListLast._prevLeaf;
					}
					leaf1._nextLeaf = null;
					leaf1._prevLeaf = null;
					if (_this1._root == leaf1) {
						_this1._root = null;
					} else {
						var parent = leaf1._parent;
						var sibling = parent._children[leaf1._childIndex ^ 1];
						var grandParent = parent._parent;
						if (grandParent == null) {
							sibling._parent = null;
							sibling._childIndex = 0;
							_this1._root = sibling;
							parent._next = null;
							parent._childIndex = 0;
							parent._children[0] = null;
							parent._children[1] = null;
							parent._childIndex = 0;
							parent._parent = null;
							parent._height = 0;
							parent._proxy = null;
							parent._next = _this1._nodePool;
							_this1._nodePool = parent;
						} else {
							sibling._parent = grandParent;
							var index = parent._childIndex;
							grandParent._children[index] = sibling;
							sibling._parent = grandParent;
							sibling._childIndex = index;
							parent._next = null;
							parent._childIndex = 0;
							parent._children[0] = null;
							parent._children[1] = null;
							parent._childIndex = 0;
							parent._parent = null;
							parent._height = 0;
							parent._proxy = null;
							parent._next = _this1._nodePool;
							_this1._nodePool = parent;
							var node = grandParent;
							while (node != null) {
								if (_this1._strategy._balancingEnabled) {
									var nh = node._height;
									if (nh < 2) {
										node = node;
									} else {
										var p2 = node._parent;
										var l = node._children[0];
										var r = node._children[1];
										var lh = l._height;
										var rh = r._height;
										var balance = lh - rh;
										var nodeIndex = node._childIndex;
										if (balance > 1) {
											var ll = l._children[0];
											var lr = l._children[1];
											var llh = ll._height;
											var lrh = lr._height;
											if (llh > lrh) {
												l._children[1] = node;
												node._parent = l;
												node._childIndex = 1;
												node._children[0] = lr;
												lr._parent = node;
												lr._childIndex = 0;
												var c1 = l._children[0];
												var c2 = l._children[1];
												l._aabbMinX = c1._aabbMinX < c2._aabbMinX ? c1._aabbMinX : c2._aabbMinX;
												l._aabbMinY = c1._aabbMinY < c2._aabbMinY ? c1._aabbMinY : c2._aabbMinY;
												l._aabbMinZ = c1._aabbMinZ < c2._aabbMinZ ? c1._aabbMinZ : c2._aabbMinZ;
												l._aabbMaxX = c1._aabbMaxX > c2._aabbMaxX ? c1._aabbMaxX : c2._aabbMaxX;
												l._aabbMaxY = c1._aabbMaxY > c2._aabbMaxY ? c1._aabbMaxY : c2._aabbMaxY;
												l._aabbMaxZ = c1._aabbMaxZ > c2._aabbMaxZ ? c1._aabbMaxZ : c2._aabbMaxZ;
												var h1 = l._children[0]._height;
												var h2 = l._children[1]._height;
												l._height = (h1 > h2 ? h1 : h2) + 1;
												var c11 = node._children[0];
												var c21 = node._children[1];
												node._aabbMinX = c11._aabbMinX < c21._aabbMinX ? c11._aabbMinX : c21._aabbMinX;
												node._aabbMinY = c11._aabbMinY < c21._aabbMinY ? c11._aabbMinY : c21._aabbMinY;
												node._aabbMinZ = c11._aabbMinZ < c21._aabbMinZ ? c11._aabbMinZ : c21._aabbMinZ;
												node._aabbMaxX = c11._aabbMaxX > c21._aabbMaxX ? c11._aabbMaxX : c21._aabbMaxX;
												node._aabbMaxY = c11._aabbMaxY > c21._aabbMaxY ? c11._aabbMaxY : c21._aabbMaxY;
												node._aabbMaxZ = c11._aabbMaxZ > c21._aabbMaxZ ? c11._aabbMaxZ : c21._aabbMaxZ;
												var h11 = node._children[0]._height;
												var h21 = node._children[1]._height;
												node._height = (h11 > h21 ? h11 : h21) + 1;
											} else {
												l._children[0] = node;
												node._parent = l;
												node._childIndex = 0;
												node._children[0] = ll;
												ll._parent = node;
												ll._childIndex = 0;
												var c12 = l._children[0];
												var c22 = l._children[1];
												l._aabbMinX = c12._aabbMinX < c22._aabbMinX ? c12._aabbMinX : c22._aabbMinX;
												l._aabbMinY = c12._aabbMinY < c22._aabbMinY ? c12._aabbMinY : c22._aabbMinY;
												l._aabbMinZ = c12._aabbMinZ < c22._aabbMinZ ? c12._aabbMinZ : c22._aabbMinZ;
												l._aabbMaxX = c12._aabbMaxX > c22._aabbMaxX ? c12._aabbMaxX : c22._aabbMaxX;
												l._aabbMaxY = c12._aabbMaxY > c22._aabbMaxY ? c12._aabbMaxY : c22._aabbMaxY;
												l._aabbMaxZ = c12._aabbMaxZ > c22._aabbMaxZ ? c12._aabbMaxZ : c22._aabbMaxZ;
												var h12 = l._children[0]._height;
												var h22 = l._children[1]._height;
												l._height = (h12 > h22 ? h12 : h22) + 1;
												var c13 = node._children[0];
												var c23 = node._children[1];
												node._aabbMinX = c13._aabbMinX < c23._aabbMinX ? c13._aabbMinX : c23._aabbMinX;
												node._aabbMinY = c13._aabbMinY < c23._aabbMinY ? c13._aabbMinY : c23._aabbMinY;
												node._aabbMinZ = c13._aabbMinZ < c23._aabbMinZ ? c13._aabbMinZ : c23._aabbMinZ;
												node._aabbMaxX = c13._aabbMaxX > c23._aabbMaxX ? c13._aabbMaxX : c23._aabbMaxX;
												node._aabbMaxY = c13._aabbMaxY > c23._aabbMaxY ? c13._aabbMaxY : c23._aabbMaxY;
												node._aabbMaxZ = c13._aabbMaxZ > c23._aabbMaxZ ? c13._aabbMaxZ : c23._aabbMaxZ;
												var h13 = node._children[0]._height;
												var h23 = node._children[1]._height;
												node._height = (h13 > h23 ? h13 : h23) + 1;
											}
											if (p2 != null) {
												p2._children[nodeIndex] = l;
												l._parent = p2;
												l._childIndex = nodeIndex;
											} else {
												_this1._root = l;
												l._parent = null;
											}
											node = l;
										} else if (balance < -1) {
											var rl = r._children[0];
											var rr = r._children[1];
											var rlh = rl._height;
											var rrh = rr._height;
											if (rlh > rrh) {
												r._children[1] = node;
												node._parent = r;
												node._childIndex = 1;
												node._children[1] = rr;
												rr._parent = node;
												rr._childIndex = 1;
												var c14 = r._children[0];
												var c24 = r._children[1];
												r._aabbMinX = c14._aabbMinX < c24._aabbMinX ? c14._aabbMinX : c24._aabbMinX;
												r._aabbMinY = c14._aabbMinY < c24._aabbMinY ? c14._aabbMinY : c24._aabbMinY;
												r._aabbMinZ = c14._aabbMinZ < c24._aabbMinZ ? c14._aabbMinZ : c24._aabbMinZ;
												r._aabbMaxX = c14._aabbMaxX > c24._aabbMaxX ? c14._aabbMaxX : c24._aabbMaxX;
												r._aabbMaxY = c14._aabbMaxY > c24._aabbMaxY ? c14._aabbMaxY : c24._aabbMaxY;
												r._aabbMaxZ = c14._aabbMaxZ > c24._aabbMaxZ ? c14._aabbMaxZ : c24._aabbMaxZ;
												var h14 = r._children[0]._height;
												var h24 = r._children[1]._height;
												r._height = (h14 > h24 ? h14 : h24) + 1;
												var c15 = node._children[0];
												var c25 = node._children[1];
												node._aabbMinX = c15._aabbMinX < c25._aabbMinX ? c15._aabbMinX : c25._aabbMinX;
												node._aabbMinY = c15._aabbMinY < c25._aabbMinY ? c15._aabbMinY : c25._aabbMinY;
												node._aabbMinZ = c15._aabbMinZ < c25._aabbMinZ ? c15._aabbMinZ : c25._aabbMinZ;
												node._aabbMaxX = c15._aabbMaxX > c25._aabbMaxX ? c15._aabbMaxX : c25._aabbMaxX;
												node._aabbMaxY = c15._aabbMaxY > c25._aabbMaxY ? c15._aabbMaxY : c25._aabbMaxY;
												node._aabbMaxZ = c15._aabbMaxZ > c25._aabbMaxZ ? c15._aabbMaxZ : c25._aabbMaxZ;
												var h15 = node._children[0]._height;
												var h25 = node._children[1]._height;
												node._height = (h15 > h25 ? h15 : h25) + 1;
											} else {
												r._children[0] = node;
												node._parent = r;
												node._childIndex = 0;
												node._children[1] = rl;
												rl._parent = node;
												rl._childIndex = 1;
												var c16 = r._children[0];
												var c26 = r._children[1];
												r._aabbMinX = c16._aabbMinX < c26._aabbMinX ? c16._aabbMinX : c26._aabbMinX;
												r._aabbMinY = c16._aabbMinY < c26._aabbMinY ? c16._aabbMinY : c26._aabbMinY;
												r._aabbMinZ = c16._aabbMinZ < c26._aabbMinZ ? c16._aabbMinZ : c26._aabbMinZ;
												r._aabbMaxX = c16._aabbMaxX > c26._aabbMaxX ? c16._aabbMaxX : c26._aabbMaxX;
												r._aabbMaxY = c16._aabbMaxY > c26._aabbMaxY ? c16._aabbMaxY : c26._aabbMaxY;
												r._aabbMaxZ = c16._aabbMaxZ > c26._aabbMaxZ ? c16._aabbMaxZ : c26._aabbMaxZ;
												var h16 = r._children[0]._height;
												var h26 = r._children[1]._height;
												r._height = (h16 > h26 ? h16 : h26) + 1;
												var c17 = node._children[0];
												var c27 = node._children[1];
												node._aabbMinX = c17._aabbMinX < c27._aabbMinX ? c17._aabbMinX : c27._aabbMinX;
												node._aabbMinY = c17._aabbMinY < c27._aabbMinY ? c17._aabbMinY : c27._aabbMinY;
												node._aabbMinZ = c17._aabbMinZ < c27._aabbMinZ ? c17._aabbMinZ : c27._aabbMinZ;
												node._aabbMaxX = c17._aabbMaxX > c27._aabbMaxX ? c17._aabbMaxX : c27._aabbMaxX;
												node._aabbMaxY = c17._aabbMaxY > c27._aabbMaxY ? c17._aabbMaxY : c27._aabbMaxY;
												node._aabbMaxZ = c17._aabbMaxZ > c27._aabbMaxZ ? c17._aabbMaxZ : c27._aabbMaxZ;
												var h17 = node._children[0]._height;
												var h27 = node._children[1]._height;
												node._height = (h17 > h27 ? h17 : h27) + 1;
											}
											if (p2 != null) {
												p2._children[nodeIndex] = r;
												r._parent = p2;
												r._childIndex = nodeIndex;
											} else {
												_this1._root = r;
												r._parent = null;
											}
											node = r;
										} else {
											node = node;
										}
									}
								}
								var h18 = node._children[0]._height;
								var h28 = node._children[1]._height;
								node._height = (h18 > h28 ? h18 : h28) + 1;
								var c18 = node._children[0];
								var c28 = node._children[1];
								node._aabbMinX = c18._aabbMinX < c28._aabbMinX ? c18._aabbMinX : c28._aabbMinX;
								node._aabbMinY = c18._aabbMinY < c28._aabbMinY ? c18._aabbMinY : c28._aabbMinY;
								node._aabbMinZ = c18._aabbMinZ < c28._aabbMinZ ? c18._aabbMinZ : c28._aabbMinZ;
								node._aabbMaxX = c18._aabbMaxX > c28._aabbMaxX ? c18._aabbMaxX : c28._aabbMaxX;
								node._aabbMaxY = c18._aabbMaxY > c28._aabbMaxY ? c18._aabbMaxY : c28._aabbMaxY;
								node._aabbMaxZ = c18._aabbMaxZ > c28._aabbMaxZ ? c18._aabbMaxZ : c28._aabbMaxZ;
								node = node._parent;
							}
						}
					}
					p1._leaf = null;
					leaf1._next = null;
					leaf1._childIndex = 0;
					leaf1._children[0] = null;
					leaf1._children[1] = null;
					leaf1._childIndex = 0;
					leaf1._parent = null;
					leaf1._height = 0;
					leaf1._proxy = null;
					leaf1._next = _this1._nodePool;
					_this1._nodePool = leaf1;
					var _this2 = this._tree;
					var first = _this2._nodePool;
					if (first != null) {
						_this2._nodePool = first._next;
						first._next = null;
					} else {
						first = new collision.broadphase.bvh.BvhNode();
					}
					var leaf2 = first;
					leaf2._proxy = p1;
					p1._leaf = leaf2;
					leaf2._aabbMinX = p1._aabbMinX;
					leaf2._aabbMinY = p1._aabbMinY;
					leaf2._aabbMinZ = p1._aabbMinZ;
					leaf2._aabbMaxX = p1._aabbMaxX;
					leaf2._aabbMaxY = p1._aabbMaxY;
					leaf2._aabbMaxZ = p1._aabbMaxZ;
					_this2._numLeaves++;
					if (_this2.leafList == null) {
						_this2.leafList = leaf2;
						_this2.leafListLast = leaf2;
					} else {
						_this2.leafListLast._nextLeaf = leaf2;
						leaf2._prevLeaf = _this2.leafListLast;
						_this2.leafListLast = leaf2;
					}
					if (_this2._root == null) {
						_this2._root = leaf2;
					} else {
						var sibling1 = _this2._root;
						while (sibling1._height > 0) {
							var nextStep = _this2._strategy._decideInsertion(sibling1, leaf2);
							if (nextStep == -1) {
								break;
							} else {
								sibling1 = sibling1._children[nextStep];
							}
						}
						var parent1 = sibling1._parent;
						var first1 = _this2._nodePool;
						if (first1 != null) {
							_this2._nodePool = first1._next;
							first1._next = null;
						} else {
							first1 = new collision.broadphase.bvh.BvhNode();
						}
						var node1 = first1;
						if (parent1 == null) {
							_this2._root = node1;
						} else {
							var index1 = sibling1._childIndex;
							parent1._children[index1] = node1;
							node1._parent = parent1;
							node1._childIndex = index1;
						}
						var index2 = sibling1._childIndex;
						node1._children[index2] = sibling1;
						sibling1._parent = node1;
						sibling1._childIndex = index2;
						var index3 = sibling1._childIndex ^ 1;
						node1._children[index3] = leaf2;
						leaf2._parent = node1;
						leaf2._childIndex = index3;
						while (node1 != null) {
							if (_this2._strategy._balancingEnabled) {
								var nh1 = node1._height;
								if (nh1 < 2) {
									node1 = node1;
								} else {
									var p3 = node1._parent;
									var l1 = node1._children[0];
									var r1 = node1._children[1];
									var lh1 = l1._height;
									var rh1 = r1._height;
									var balance1 = lh1 - rh1;
									var nodeIndex1 = node1._childIndex;
									if (balance1 > 1) {
										var ll1 = l1._children[0];
										var lr1 = l1._children[1];
										var llh1 = ll1._height;
										var lrh1 = lr1._height;
										if (llh1 > lrh1) {
											l1._children[1] = node1;
											node1._parent = l1;
											node1._childIndex = 1;
											node1._children[0] = lr1;
											lr1._parent = node1;
											lr1._childIndex = 0;
											var c19 = l1._children[0];
											var c29 = l1._children[1];
											l1._aabbMinX = c19._aabbMinX < c29._aabbMinX ? c19._aabbMinX : c29._aabbMinX;
											l1._aabbMinY = c19._aabbMinY < c29._aabbMinY ? c19._aabbMinY : c29._aabbMinY;
											l1._aabbMinZ = c19._aabbMinZ < c29._aabbMinZ ? c19._aabbMinZ : c29._aabbMinZ;
											l1._aabbMaxX = c19._aabbMaxX > c29._aabbMaxX ? c19._aabbMaxX : c29._aabbMaxX;
											l1._aabbMaxY = c19._aabbMaxY > c29._aabbMaxY ? c19._aabbMaxY : c29._aabbMaxY;
											l1._aabbMaxZ = c19._aabbMaxZ > c29._aabbMaxZ ? c19._aabbMaxZ : c29._aabbMaxZ;
											var h19 = l1._children[0]._height;
											var h29 = l1._children[1]._height;
											l1._height = (h19 > h29 ? h19 : h29) + 1;
											var c110 = node1._children[0];
											var c210 = node1._children[1];
											node1._aabbMinX = c110._aabbMinX < c210._aabbMinX ? c110._aabbMinX : c210._aabbMinX;
											node1._aabbMinY = c110._aabbMinY < c210._aabbMinY ? c110._aabbMinY : c210._aabbMinY;
											node1._aabbMinZ = c110._aabbMinZ < c210._aabbMinZ ? c110._aabbMinZ : c210._aabbMinZ;
											node1._aabbMaxX = c110._aabbMaxX > c210._aabbMaxX ? c110._aabbMaxX : c210._aabbMaxX;
											node1._aabbMaxY = c110._aabbMaxY > c210._aabbMaxY ? c110._aabbMaxY : c210._aabbMaxY;
											node1._aabbMaxZ = c110._aabbMaxZ > c210._aabbMaxZ ? c110._aabbMaxZ : c210._aabbMaxZ;
											var h110 = node1._children[0]._height;
											var h210 = node1._children[1]._height;
											node1._height = (h110 > h210 ? h110 : h210) + 1;
										} else {
											l1._children[0] = node1;
											node1._parent = l1;
											node1._childIndex = 0;
											node1._children[0] = ll1;
											ll1._parent = node1;
											ll1._childIndex = 0;
											var c111 = l1._children[0];
											var c211 = l1._children[1];
											l1._aabbMinX = c111._aabbMinX < c211._aabbMinX ? c111._aabbMinX : c211._aabbMinX;
											l1._aabbMinY = c111._aabbMinY < c211._aabbMinY ? c111._aabbMinY : c211._aabbMinY;
											l1._aabbMinZ = c111._aabbMinZ < c211._aabbMinZ ? c111._aabbMinZ : c211._aabbMinZ;
											l1._aabbMaxX = c111._aabbMaxX > c211._aabbMaxX ? c111._aabbMaxX : c211._aabbMaxX;
											l1._aabbMaxY = c111._aabbMaxY > c211._aabbMaxY ? c111._aabbMaxY : c211._aabbMaxY;
											l1._aabbMaxZ = c111._aabbMaxZ > c211._aabbMaxZ ? c111._aabbMaxZ : c211._aabbMaxZ;
											var h111 = l1._children[0]._height;
											var h211 = l1._children[1]._height;
											l1._height = (h111 > h211 ? h111 : h211) + 1;
											var c112 = node1._children[0];
											var c212 = node1._children[1];
											node1._aabbMinX = c112._aabbMinX < c212._aabbMinX ? c112._aabbMinX : c212._aabbMinX;
											node1._aabbMinY = c112._aabbMinY < c212._aabbMinY ? c112._aabbMinY : c212._aabbMinY;
											node1._aabbMinZ = c112._aabbMinZ < c212._aabbMinZ ? c112._aabbMinZ : c212._aabbMinZ;
											node1._aabbMaxX = c112._aabbMaxX > c212._aabbMaxX ? c112._aabbMaxX : c212._aabbMaxX;
											node1._aabbMaxY = c112._aabbMaxY > c212._aabbMaxY ? c112._aabbMaxY : c212._aabbMaxY;
											node1._aabbMaxZ = c112._aabbMaxZ > c212._aabbMaxZ ? c112._aabbMaxZ : c212._aabbMaxZ;
											var h112 = node1._children[0]._height;
											var h212 = node1._children[1]._height;
											node1._height = (h112 > h212 ? h112 : h212) + 1;
										}
										if (p3 != null) {
											p3._children[nodeIndex1] = l1;
											l1._parent = p3;
											l1._childIndex = nodeIndex1;
										} else {
											_this2._root = l1;
											l1._parent = null;
										}
										node1 = l1;
									} else if (balance1 < -1) {
										var rl1 = r1._children[0];
										var rr1 = r1._children[1];
										var rlh1 = rl1._height;
										var rrh1 = rr1._height;
										if (rlh1 > rrh1) {
											r1._children[1] = node1;
											node1._parent = r1;
											node1._childIndex = 1;
											node1._children[1] = rr1;
											rr1._parent = node1;
											rr1._childIndex = 1;
											var c113 = r1._children[0];
											var c213 = r1._children[1];
											r1._aabbMinX = c113._aabbMinX < c213._aabbMinX ? c113._aabbMinX : c213._aabbMinX;
											r1._aabbMinY = c113._aabbMinY < c213._aabbMinY ? c113._aabbMinY : c213._aabbMinY;
											r1._aabbMinZ = c113._aabbMinZ < c213._aabbMinZ ? c113._aabbMinZ : c213._aabbMinZ;
											r1._aabbMaxX = c113._aabbMaxX > c213._aabbMaxX ? c113._aabbMaxX : c213._aabbMaxX;
											r1._aabbMaxY = c113._aabbMaxY > c213._aabbMaxY ? c113._aabbMaxY : c213._aabbMaxY;
											r1._aabbMaxZ = c113._aabbMaxZ > c213._aabbMaxZ ? c113._aabbMaxZ : c213._aabbMaxZ;
											var h113 = r1._children[0]._height;
											var h213 = r1._children[1]._height;
											r1._height = (h113 > h213 ? h113 : h213) + 1;
											var c114 = node1._children[0];
											var c214 = node1._children[1];
											node1._aabbMinX = c114._aabbMinX < c214._aabbMinX ? c114._aabbMinX : c214._aabbMinX;
											node1._aabbMinY = c114._aabbMinY < c214._aabbMinY ? c114._aabbMinY : c214._aabbMinY;
											node1._aabbMinZ = c114._aabbMinZ < c214._aabbMinZ ? c114._aabbMinZ : c214._aabbMinZ;
											node1._aabbMaxX = c114._aabbMaxX > c214._aabbMaxX ? c114._aabbMaxX : c214._aabbMaxX;
											node1._aabbMaxY = c114._aabbMaxY > c214._aabbMaxY ? c114._aabbMaxY : c214._aabbMaxY;
											node1._aabbMaxZ = c114._aabbMaxZ > c214._aabbMaxZ ? c114._aabbMaxZ : c214._aabbMaxZ;
											var h114 = node1._children[0]._height;
											var h214 = node1._children[1]._height;
											node1._height = (h114 > h214 ? h114 : h214) + 1;
										} else {
											r1._children[0] = node1;
											node1._parent = r1;
											node1._childIndex = 0;
											node1._children[1] = rl1;
											rl1._parent = node1;
											rl1._childIndex = 1;
											var c115 = r1._children[0];
											var c215 = r1._children[1];
											r1._aabbMinX = c115._aabbMinX < c215._aabbMinX ? c115._aabbMinX : c215._aabbMinX;
											r1._aabbMinY = c115._aabbMinY < c215._aabbMinY ? c115._aabbMinY : c215._aabbMinY;
											r1._aabbMinZ = c115._aabbMinZ < c215._aabbMinZ ? c115._aabbMinZ : c215._aabbMinZ;
											r1._aabbMaxX = c115._aabbMaxX > c215._aabbMaxX ? c115._aabbMaxX : c215._aabbMaxX;
											r1._aabbMaxY = c115._aabbMaxY > c215._aabbMaxY ? c115._aabbMaxY : c215._aabbMaxY;
											r1._aabbMaxZ = c115._aabbMaxZ > c215._aabbMaxZ ? c115._aabbMaxZ : c215._aabbMaxZ;
											var h115 = r1._children[0]._height;
											var h215 = r1._children[1]._height;
											r1._height = (h115 > h215 ? h115 : h215) + 1;
											var c116 = node1._children[0];
											var c216 = node1._children[1];
											node1._aabbMinX = c116._aabbMinX < c216._aabbMinX ? c116._aabbMinX : c216._aabbMinX;
											node1._aabbMinY = c116._aabbMinY < c216._aabbMinY ? c116._aabbMinY : c216._aabbMinY;
											node1._aabbMinZ = c116._aabbMinZ < c216._aabbMinZ ? c116._aabbMinZ : c216._aabbMinZ;
											node1._aabbMaxX = c116._aabbMaxX > c216._aabbMaxX ? c116._aabbMaxX : c216._aabbMaxX;
											node1._aabbMaxY = c116._aabbMaxY > c216._aabbMaxY ? c116._aabbMaxY : c216._aabbMaxY;
											node1._aabbMaxZ = c116._aabbMaxZ > c216._aabbMaxZ ? c116._aabbMaxZ : c216._aabbMaxZ;
											var h116 = node1._children[0]._height;
											var h216 = node1._children[1]._height;
											node1._height = (h116 > h216 ? h116 : h216) + 1;
										}
										if (p3 != null) {
											p3._children[nodeIndex1] = r1;
											r1._parent = p3;
											r1._childIndex = nodeIndex1;
										} else {
											_this2._root = r1;
											r1._parent = null;
										}
										node1 = r1;
									} else {
										node1 = node1;
									}
								}
							}
							var h117 = node1._children[0]._height;
							var h217 = node1._children[1]._height;
							node1._height = (h117 > h217 ? h117 : h217) + 1;
							var c117 = node1._children[0];
							var c217 = node1._children[1];
							node1._aabbMinX = c117._aabbMinX < c217._aabbMinX ? c117._aabbMinX : c217._aabbMinX;
							node1._aabbMinY = c117._aabbMinY < c217._aabbMinY ? c117._aabbMinY : c217._aabbMinY;
							node1._aabbMinZ = c117._aabbMinZ < c217._aabbMinZ ? c117._aabbMinZ : c217._aabbMinZ;
							node1._aabbMaxX = c117._aabbMaxX > c217._aabbMaxX ? c117._aabbMaxX : c217._aabbMaxX;
							node1._aabbMaxY = c117._aabbMaxY > c217._aabbMaxY ? c117._aabbMaxY : c217._aabbMaxY;
							node1._aabbMaxZ = c117._aabbMaxZ > c217._aabbMaxZ ? c117._aabbMaxZ : c217._aabbMaxZ;
							node1 = node1._parent;
						}
					}
					if (incrementalCollision) {
						this.collide(this._tree._root, p1._leaf);
					}
					p1._moved = false;
				}
				this.movedProxies[i1] = null;
			}
			if (!incrementalCollision) {
				this.collide(this._tree._root, this._tree._root);
			}
			this.numMovedProxies = 0;
		}

		proto.rayCast = function (begin, end, callback) {
			if (this._tree._root == null) {
				return;
			}
			var p1;
			var p1X;
			var p1Y;
			var p1Z;
			var p2;
			var p2X;
			var p2Y;
			var p2Z;
			var v = begin;
			p1X = v[0];
			p1Y = v[1];
			p1Z = v[2];
			var v1 = end;
			p2X = v1[0];
			p2Y = v1[1];
			p2Z = v1[2];
			this.rayCastRecursive(this._tree._root, p1X, p1Y, p1Z, p2X, p2Y, p2Z, callback);
		}

		proto.convexCast = function (convex, begin, translation, callback) {
			if (this._tree._root == null) {
				return;
			}
			this.convexCastRecursive(this._tree._root, convex, begin, translation, callback);
		}

		proto.aabbTest = function (aabb, callback) {
			if (this._tree._root == null) {
				return;
			}
			this.aabbTestRecursive(this._tree._root, aabb, callback);
		}

		proto.isOverlapping = function (proxy1, proxy2) {
			if (proxy1._aabbMinX < proxy2._aabbMaxX && proxy1._aabbMaxX > proxy2._aabbMinX && proxy1._aabbMinY < proxy2._aabbMaxY && proxy1._aabbMaxY > proxy2._aabbMinY && proxy1._aabbMinZ < proxy2._aabbMaxZ) {
				return proxy1._aabbMaxZ > proxy2._aabbMinZ;
			} else {
				return false;
			}
		}

		proto.getProxyPairList = function () {
			return this._proxyPairList;
		}

		proto.isIncremental = function () {
			return this._incremental;
		}

		var BvhBroadPhase = function () {
			collision.broadphase.BroadPhase.call(this, 2);
			this._incremental = true;
			this._tree = new collision.broadphase.bvh.BvhTree();
			var this1 = new Array(1024);
			this.movedProxies = this1;
			this.numMovedProxies = 0;
		}
		return BvhBroadPhase;
	});

	collision.broadphase.bvh.BvhStrategy = pe.define(function (proto) {
		proto._decideInsertion = function (currentNode, leaf) {
			var _g = this._insertionStrategy;
			switch (_g) {
				case 0:
					var center;
					var centerX;
					var centerY;
					var centerZ;
					centerX = leaf._aabbMinX + leaf._aabbMaxX;
					centerY = leaf._aabbMinY + leaf._aabbMaxY;
					centerZ = leaf._aabbMinZ + leaf._aabbMaxZ;
					var c1 = currentNode._children[0];
					var c2 = currentNode._children[1];
					var diff1;
					var diff1X;
					var diff1Y;
					var diff1Z;
					var diff2;
					var diff2X;
					var diff2Y;
					var diff2Z;
					diff1X = c1._aabbMinX + c1._aabbMaxX;
					diff1Y = c1._aabbMinY + c1._aabbMaxY;
					diff1Z = c1._aabbMinZ + c1._aabbMaxZ;
					diff2X = c2._aabbMinX + c2._aabbMaxX;
					diff2Y = c2._aabbMinY + c2._aabbMaxY;
					diff2Z = c2._aabbMinZ + c2._aabbMaxZ;
					diff1X -= centerX;
					diff1Y -= centerY;
					diff1Z -= centerZ;
					diff2X -= centerX;
					diff2Y -= centerY;
					diff2Z -= centerZ;
					var dist1 = diff1X * diff1X + diff1Y * diff1Y + diff1Z * diff1Z;
					var dist2 = diff2X * diff2X + diff2Y * diff2Y + diff2Z * diff2Z;
					if (dist1 < dist2) {
						return 0;
					} else {
						return 1;
					}
					break;
				case 1:
					var c11 = currentNode._children[0];
					var c21 = currentNode._children[1];
					var ex = currentNode._aabbMaxX - currentNode._aabbMinX;
					var ey = currentNode._aabbMaxY - currentNode._aabbMinY;
					var ez = currentNode._aabbMaxZ - currentNode._aabbMinZ;
					var oldArea = (ex * (ey + ez) + ey * ez) * 2;
					var combinedMin;
					var combinedMinX;
					var combinedMinY;
					var combinedMinZ;
					var combinedMax;
					var combinedMaxX;
					var combinedMaxY;
					var combinedMaxZ;
					combinedMinX = currentNode._aabbMinX < leaf._aabbMinX ? currentNode._aabbMinX : leaf._aabbMinX;
					combinedMinY = currentNode._aabbMinY < leaf._aabbMinY ? currentNode._aabbMinY : leaf._aabbMinY;
					combinedMinZ = currentNode._aabbMinZ < leaf._aabbMinZ ? currentNode._aabbMinZ : leaf._aabbMinZ;
					combinedMaxX = currentNode._aabbMaxX > leaf._aabbMaxX ? currentNode._aabbMaxX : leaf._aabbMaxX;
					combinedMaxY = currentNode._aabbMaxY > leaf._aabbMaxY ? currentNode._aabbMaxY : leaf._aabbMaxY;
					combinedMaxZ = currentNode._aabbMaxZ > leaf._aabbMaxZ ? currentNode._aabbMaxZ : leaf._aabbMaxZ;
					var ex1 = combinedMaxX - combinedMinX;
					var ey1 = combinedMaxY - combinedMinY;
					var ez1 = combinedMaxZ - combinedMinZ;
					var newArea = (ex1 * (ey1 + ez1) + ey1 * ez1) * 2;
					var creatingCost = newArea * 2;
					var incrementalCost = (newArea - oldArea) * 2;
					var descendingCost1 = incrementalCost;
					combinedMinX = c11._aabbMinX < leaf._aabbMinX ? c11._aabbMinX : leaf._aabbMinX;
					combinedMinY = c11._aabbMinY < leaf._aabbMinY ? c11._aabbMinY : leaf._aabbMinY;
					combinedMinZ = c11._aabbMinZ < leaf._aabbMinZ ? c11._aabbMinZ : leaf._aabbMinZ;
					combinedMaxX = c11._aabbMaxX > leaf._aabbMaxX ? c11._aabbMaxX : leaf._aabbMaxX;
					combinedMaxY = c11._aabbMaxY > leaf._aabbMaxY ? c11._aabbMaxY : leaf._aabbMaxY;
					combinedMaxZ = c11._aabbMaxZ > leaf._aabbMaxZ ? c11._aabbMaxZ : leaf._aabbMaxZ;
					if (c11._height == 0) {
						var ex2 = combinedMaxX - combinedMinX;
						var ey2 = combinedMaxY - combinedMinY;
						var ez2 = combinedMaxZ - combinedMinZ;
						descendingCost1 += (ex2 * (ey2 + ez2) + ey2 * ez2) * 2;
					} else {
						var ex3 = combinedMaxX - combinedMinX;
						var ey3 = combinedMaxY - combinedMinY;
						var ez3 = combinedMaxZ - combinedMinZ;
						var ex4 = c11._aabbMaxX - c11._aabbMinX;
						var ey4 = c11._aabbMaxY - c11._aabbMinY;
						var ez4 = c11._aabbMaxZ - c11._aabbMinZ;
						descendingCost1 += (ex3 * (ey3 + ez3) + ey3 * ez3) * 2 - (ex4 * (ey4 + ez4) + ey4 * ez4) * 2;
					}
					var descendingCost2 = incrementalCost;
					combinedMinX = c21._aabbMinX < leaf._aabbMinX ? c21._aabbMinX : leaf._aabbMinX;
					combinedMinY = c21._aabbMinY < leaf._aabbMinY ? c21._aabbMinY : leaf._aabbMinY;
					combinedMinZ = c21._aabbMinZ < leaf._aabbMinZ ? c21._aabbMinZ : leaf._aabbMinZ;
					combinedMaxX = c21._aabbMaxX > leaf._aabbMaxX ? c21._aabbMaxX : leaf._aabbMaxX;
					combinedMaxY = c21._aabbMaxY > leaf._aabbMaxY ? c21._aabbMaxY : leaf._aabbMaxY;
					combinedMaxZ = c21._aabbMaxZ > leaf._aabbMaxZ ? c21._aabbMaxZ : leaf._aabbMaxZ;
					if (c21._height == 0) {
						var ex5 = combinedMaxX - combinedMinX;
						var ey5 = combinedMaxY - combinedMinY;
						var ez5 = combinedMaxZ - combinedMinZ;
						descendingCost2 += (ex5 * (ey5 + ez5) + ey5 * ez5) * 2;
					} else {
						var ex6 = combinedMaxX - combinedMinX;
						var ey6 = combinedMaxY - combinedMinY;
						var ez6 = combinedMaxZ - combinedMinZ;
						var ex7 = c21._aabbMaxX - c21._aabbMinX;
						var ey7 = c21._aabbMaxY - c21._aabbMinY;
						var ez7 = c21._aabbMaxZ - c21._aabbMinZ;
						descendingCost2 += (ex6 * (ey6 + ez6) + ey6 * ez6) * 2 - (ex7 * (ey7 + ez7) + ey7 * ez7) * 2;
					}
					if (creatingCost < descendingCost1) {
						if (creatingCost < descendingCost2) {
							return -1;
						} else {
							return 1;
						}
					} else if (descendingCost1 < descendingCost2) {
						return 0;
					} else {
						return 1;
					}
					break;
				default:
					console.log("BvhStrategy.hx:37:", "invalid BVH insertion strategy: " + this._insertionStrategy);
					return -1;
			}
		}

		proto._splitLeaves = function (leaves, from, until) {
			var invN = 1.0 / (until - from);
			var centerMean;
			var centerMeanX;
			var centerMeanY;
			var centerMeanZ;
			centerMeanX = 0;
			centerMeanY = 0;
			centerMeanZ = 0;
			var _g1 = from;
			var _g = until;
			while (_g1 < _g) {
				var i = _g1++;
				var leaf = leaves[i];
				leaf._tmpX = leaf._aabbMaxX + leaf._aabbMinX;
				leaf._tmpY = leaf._aabbMaxY + leaf._aabbMinY;
				leaf._tmpZ = leaf._aabbMaxZ + leaf._aabbMinZ;
				centerMeanX += leaf._tmpX;
				centerMeanY += leaf._tmpY;
				centerMeanZ += leaf._tmpZ;
			}
			centerMeanX *= invN;
			centerMeanY *= invN;
			centerMeanZ *= invN;
			var variance;
			var varianceX;
			var varianceY;
			var varianceZ;
			varianceX = 0;
			varianceY = 0;
			varianceZ = 0;
			var _g11 = from;
			var _g2 = until;
			while (_g11 < _g2) {
				var i1 = _g11++;
				var leaf1 = leaves[i1];
				var diff;
				var diffX;
				var diffY;
				var diffZ;
				diffX = leaf1._tmpX - centerMeanX;
				diffY = leaf1._tmpY - centerMeanY;
				diffZ = leaf1._tmpZ - centerMeanZ;
				diffX *= diffX;
				diffY *= diffY;
				diffZ *= diffZ;
				varianceX += diffX;
				varianceY += diffY;
				varianceZ += diffZ;
			}
			var varX = varianceX;
			var varY = varianceY;
			var varZ = varianceZ;
			var l = from;
			var r = until - 1;
			if (varX > varY) {
				if (varX > varZ) {
					var mean = centerMeanX;
					while (true) {
						while (true) {
							var leaf2 = leaves[l];
							if (leaf2._tmpX <= mean) {
								break;
							}
							++l;
						}
						while (true) {
							var leaf3 = leaves[r];
							if (leaf3._tmpX >= mean) {
								break;
							}
							--r;
						}
						if (l >= r) {
							break;
						}
						var tmp = leaves[l];
						leaves[l] = leaves[r];
						leaves[r] = tmp;
						++l;
						--r;
					}
				} else {
					var mean1 = centerMeanZ;
					while (true) {
						while (true) {
							var leaf4 = leaves[l];
							if (leaf4._tmpZ <= mean1) {
								break;
							}
							++l;
						}
						while (true) {
							var leaf5 = leaves[r];
							if (leaf5._tmpZ >= mean1) {
								break;
							}
							--r;
						}
						if (l >= r) {
							break;
						}
						var tmp1 = leaves[l];
						leaves[l] = leaves[r];
						leaves[r] = tmp1;
						++l;
						--r;
					}
				}
			} else if (varY > varZ) {
				var mean2 = centerMeanY;
				while (true) {
					while (true) {
						var leaf6 = leaves[l];
						if (leaf6._tmpY <= mean2) {
							break;
						}
						++l;
					}
					while (true) {
						var leaf7 = leaves[r];
						if (leaf7._tmpY >= mean2) {
							break;
						}
						--r;
					}
					if (l >= r) {
						break;
					}
					var tmp2 = leaves[l];
					leaves[l] = leaves[r];
					leaves[r] = tmp2;
					++l;
					--r;
				}
			} else {
				var mean3 = centerMeanZ;
				while (true) {
					while (true) {
						var leaf8 = leaves[l];
						if (leaf8._tmpZ <= mean3) {
							break;
						}
						++l;
					}
					while (true) {
						var leaf9 = leaves[r];
						if (leaf9._tmpZ >= mean3) {
							break;
						}
						--r;
					}
					if (l >= r) {
						break;
					}
					var tmp3 = leaves[l];
					leaves[l] = leaves[r];
					leaves[r] = tmp3;
					++l;
					--r;
				}
			}
			return l;
		}

		var BvhStrategy = function () {
			this._insertionStrategy = 0;
			this._balancingEnabled = false;
		}
		return BvhStrategy;
	});

	collision.broadphase.bvh.BvhTree = pe.define(function (proto) {
		proto._print = function (root, indent) {
			if (indent == null) {
				indent = "";
			}
			if (root == null) {
				return;
			}
			if (root._height == 0) {
				console.log("BvhTree.hx:39:", indent + root._proxy._id);
			} else {
				this._print(root._children[0], indent + "  ");
				var tmp;
				var size;
				var sizeX;
				var sizeY;
				var sizeZ;
				sizeX = root._aabbMaxX - root._aabbMinX;
				sizeY = root._aabbMaxY - root._aabbMinY;
				sizeZ = root._aabbMaxZ - root._aabbMinZ;
				var x = sizeX;
				var y = sizeY;
				var z = sizeZ;
				if (x * (y + z) + y * z > 0) {
					var size1;
					var sizeX1;
					var sizeY1;
					var sizeZ1;
					sizeX1 = root._aabbMaxX - root._aabbMinX;
					sizeY1 = root._aabbMaxY - root._aabbMinY;
					sizeZ1 = root._aabbMaxZ - root._aabbMinZ;
					var x1 = sizeX1;
					var y1 = sizeY1;
					var z1 = sizeZ1;
					tmp = ((x1 * (y1 + z1) + y1 * z1) * 1000 + 0.5 | 0) / 1000;
				} else {
					var size2;
					var sizeX2;
					var sizeY2;
					var sizeZ2;
					sizeX2 = root._aabbMaxX - root._aabbMinX;
					sizeY2 = root._aabbMaxY - root._aabbMinY;
					sizeZ2 = root._aabbMaxZ - root._aabbMinZ;
					var x2 = sizeX2;
					var y2 = sizeY2;
					var z2 = sizeZ2;
					tmp = ((x2 * (y2 + z2) + y2 * z2) * 1000 - 0.5 | 0) / 1000;
				}
				console.log("BvhTree.hx:42:", indent + "#" + root._height + ", " + tmp);
				this._print(root._children[1], indent + "  ");
			}
		}

		proto._getBalance = function () {
			return this.getBalanceRecursive(this._root);
		}

		proto.deleteRecursive = function (root) {
			if (root._height == 0) {
				var prev = root._prevLeaf;
				var next = root._nextLeaf;
				if (prev != null) {
					prev._nextLeaf = next;
				}
				if (next != null) {
					next._prevLeaf = prev;
				}
				if (root == this.leafList) {
					this.leafList = this.leafList._nextLeaf;
				}
				if (root == this.leafListLast) {
					this.leafListLast = this.leafListLast._prevLeaf;
				}
				root._nextLeaf = null;
				root._prevLeaf = null;
				root._proxy._leaf = null;
				root._next = null;
				root._childIndex = 0;
				root._children[0] = null;
				root._children[1] = null;
				root._childIndex = 0;
				root._parent = null;
				root._height = 0;
				root._proxy = null;
				root._next = this._nodePool;
				this._nodePool = root;
				return;
			}
			this.deleteRecursive(root._children[0]);
			this.deleteRecursive(root._children[1]);
			root._next = null;
			root._childIndex = 0;
			root._children[0] = null;
			root._children[1] = null;
			root._childIndex = 0;
			root._parent = null;
			root._height = 0;
			root._proxy = null;
			root._next = this._nodePool;
			this._nodePool = root;
		}

		proto.decomposeRecursive = function (root) {
			if (root._height == 0) {
				root._childIndex = 0;
				root._parent = null;
				return;
			}
			this.decomposeRecursive(root._children[0]);
			this.decomposeRecursive(root._children[1]);
			root._next = null;
			root._childIndex = 0;
			root._children[0] = null;
			root._children[1] = null;
			root._childIndex = 0;
			root._parent = null;
			root._height = 0;
			root._proxy = null;
			root._next = this._nodePool;
			this._nodePool = root;
		}

		proto.buildTopDownRecursive = function (leaves, from, until) {
			var num = until - from;
			if (num == 1) {
				var leaf = leaves[from];
				var proxy = leaf._proxy;
				leaf._aabbMinX = proxy._aabbMinX;
				leaf._aabbMinY = proxy._aabbMinY;
				leaf._aabbMinZ = proxy._aabbMinZ;
				leaf._aabbMaxX = proxy._aabbMaxX;
				leaf._aabbMaxY = proxy._aabbMaxY;
				leaf._aabbMaxZ = proxy._aabbMaxZ;
				return leaf;
			}
			var splitAt = this._strategy._splitLeaves(leaves, from, until);
			var child1 = this.buildTopDownRecursive(leaves, from, splitAt);
			var child2 = this.buildTopDownRecursive(leaves, splitAt, until);
			var first = this._nodePool;
			if (first != null) {
				this._nodePool = first._next;
				first._next = null;
			} else {
				first = new collision.broadphase.bvh.BvhNode();
			}
			var parent = first;
			parent._children[0] = child1;
			child1._parent = parent;
			child1._childIndex = 0;
			parent._children[1] = child2;
			child2._parent = parent;
			child2._childIndex = 1;
			var c1 = parent._children[0];
			var c2 = parent._children[1];
			parent._aabbMinX = c1._aabbMinX < c2._aabbMinX ? c1._aabbMinX : c2._aabbMinX;
			parent._aabbMinY = c1._aabbMinY < c2._aabbMinY ? c1._aabbMinY : c2._aabbMinY;
			parent._aabbMinZ = c1._aabbMinZ < c2._aabbMinZ ? c1._aabbMinZ : c2._aabbMinZ;
			parent._aabbMaxX = c1._aabbMaxX > c2._aabbMaxX ? c1._aabbMaxX : c2._aabbMaxX;
			parent._aabbMaxY = c1._aabbMaxY > c2._aabbMaxY ? c1._aabbMaxY : c2._aabbMaxY;
			parent._aabbMaxZ = c1._aabbMaxZ > c2._aabbMaxZ ? c1._aabbMaxZ : c2._aabbMaxZ;
			var h1 = parent._children[0]._height;
			var h2 = parent._children[1]._height;
			parent._height = (h1 > h2 ? h1 : h2) + 1;
			return parent;
		}

		proto.getBalanceRecursive = function (root) {
			if (root == null || root._height == 0) {
				return 0;
			}
			var balance = root._children[0]._height - root._children[1]._height;
			if (balance < 0) {
				balance = -balance;
			}
			return balance + this.getBalanceRecursive(root._children[0]) + this.getBalanceRecursive(root._children[1]);
		}

		var BvhTree = function () {
			this._root = null;
			this._numLeaves = 0;
			this._strategy = new collision.broadphase.bvh.BvhStrategy();
			this._nodePool = null;
			this.leafList = null;
			this.leafListLast = null;
			var this1 = new Array(1024);
			this.tmp = this1;
		}
		return BvhTree;
	});

	collision.geometry.Geometry = pe.define(function (proto) {
		proto._updateMass = function () {
		}

		proto._computeAabb = function (aabb, tf) {
		}

		proto._rayCastLocal = function (beginX, beginY, beginZ, endX, endY, endZ, hit) {
			return false;
		}

		proto.rayCast = function (begin, end, transform, hit) {
			var beginLocal;
			var beginLocalX;
			var beginLocalY;
			var beginLocalZ;
			var endLocal;
			var endLocalX;
			var endLocalY;
			var endLocalZ;
			var v = begin;
			beginLocalX = v[0];
			beginLocalY = v[1];
			beginLocalZ = v[2];
			var v1 = end;
			endLocalX = v1[0];
			endLocalY = v1[1];
			endLocalZ = v1[2];
			beginLocalX -= transform._position[0];
			beginLocalY -= transform._position[1];
			beginLocalZ -= transform._position[2];
			endLocalX -= transform._position[0];
			endLocalY -= transform._position[1];
			endLocalZ -= transform._position[2];
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = transform._rotation[0] * beginLocalX + transform._rotation[3] * beginLocalY + transform._rotation[6] * beginLocalZ;
			__tmp__Y = transform._rotation[1] * beginLocalX + transform._rotation[4] * beginLocalY + transform._rotation[7] * beginLocalZ;
			__tmp__Z = transform._rotation[2] * beginLocalX + transform._rotation[5] * beginLocalY + transform._rotation[8] * beginLocalZ;
			beginLocalX = __tmp__X;
			beginLocalY = __tmp__Y;
			beginLocalZ = __tmp__Z;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = transform._rotation[0] * endLocalX + transform._rotation[3] * endLocalY + transform._rotation[6] * endLocalZ;
			__tmp__Y1 = transform._rotation[1] * endLocalX + transform._rotation[4] * endLocalY + transform._rotation[7] * endLocalZ;
			__tmp__Z1 = transform._rotation[2] * endLocalX + transform._rotation[5] * endLocalY + transform._rotation[8] * endLocalZ;
			endLocalX = __tmp__X1;
			endLocalY = __tmp__Y1;
			endLocalZ = __tmp__Z1;
			if (this._rayCastLocal(beginLocalX, beginLocalY, beginLocalZ, endLocalX, endLocalY, endLocalZ, hit)) {
				var localPos;
				var localPosX;
				var localPosY;
				var localPosZ;
				var localNormal;
				var localNormalX;
				var localNormalY;
				var localNormalZ;
				var v2 = hit.position;
				localPosX = v2[0];
				localPosY = v2[1];
				localPosZ = v2[2];
				var v3 = hit.normal;
				localNormalX = v3[0];
				localNormalY = v3[1];
				localNormalZ = v3[2];
				var __tmp__X2;
				var __tmp__Y2;
				var __tmp__Z2;
				__tmp__X2 = transform._rotation[0] * localPosX + transform._rotation[1] * localPosY + transform._rotation[2] * localPosZ;
				__tmp__Y2 = transform._rotation[3] * localPosX + transform._rotation[4] * localPosY + transform._rotation[5] * localPosZ;
				__tmp__Z2 = transform._rotation[6] * localPosX + transform._rotation[7] * localPosY + transform._rotation[8] * localPosZ;
				localPosX = __tmp__X2;
				localPosY = __tmp__Y2;
				localPosZ = __tmp__Z2;
				var __tmp__X3;
				var __tmp__Y3;
				var __tmp__Z3;
				__tmp__X3 = transform._rotation[0] * localNormalX + transform._rotation[1] * localNormalY + transform._rotation[2] * localNormalZ;
				__tmp__Y3 = transform._rotation[3] * localNormalX + transform._rotation[4] * localNormalY + transform._rotation[5] * localNormalZ;
				__tmp__Z3 = transform._rotation[6] * localNormalX + transform._rotation[7] * localNormalY + transform._rotation[8] * localNormalZ;
				localNormalX = __tmp__X3;
				localNormalY = __tmp__Y3;
				localNormalZ = __tmp__Z3;
				localPosX += transform._position[0];
				localPosY += transform._position[1];
				localPosZ += transform._position[2];
				var v4 = hit.position;
				v4[0] = localPosX;
				v4[1] = localPosY;
				v4[2] = localPosZ;
				var v5 = hit.normal;
				v5[0] = localNormalX;
				v5[1] = localNormalY;
				v5[2] = localNormalZ;
				return true;
			}
			return false;
		}

		var Geometry = function (type) {
			this._type = type;
			this._volume = 0;
		}
		return Geometry;
	});

	collision.geometry.ConvexGeometry = pe.define(function (proto) {
		proto.computeLocalSupportingVertex = function (dir, out) {
		}

		proto.rayCast = function (begin, end, transform, hit) {
			if (this._useGjkRayCast) {
				return collision.narrowphase.detector.gjkepa.GjkEpa.instance.rayCast(this, transform, begin, end, hit);
			} else {
				return collision.geometry.Geometry.prototype.rayCast.call(this, begin, end, transform, hit);
			}
		}

		proto._updateMass = function () {
		}

		proto._computeAabb = function (aabb, tf) {
		}

		proto._rayCastLocal = function (beginX, beginY, beginZ, endX, endY, endZ, hit) {
			return false;
		}

		var ConvexGeometry = function (type) {
			collision.geometry.Geometry.call(this, type);
			this._gjkMargin = pe.common.Setting.defaultGJKMargin;
			this._useGjkRayCast = false;
		}
		return ConvexGeometry;
	});

	collision.geometry.BoxGeometry = pe.define(function (proto) {
		proto._updateMass = function () {
			this._volume = 8 * (this._halfExtents[0] * this._halfExtents[1] * this._halfExtents[2]);
			var sq;
			var sqX;
			var sqY;
			var sqZ;
			sqX = this._halfExtents[0] * this._halfExtents[0];
			sqY = this._halfExtents[1] * this._halfExtents[1];
			sqZ = this._halfExtents[2] * this._halfExtents[2];
			this._inertiaCoeff00 = 0.33333333333333331 * (sqY + sqZ);
			this._inertiaCoeff01 = 0;
			this._inertiaCoeff02 = 0;
			this._inertiaCoeff10 = 0;
			this._inertiaCoeff11 = 0.33333333333333331 * (sqZ + sqX);
			this._inertiaCoeff12 = 0;
			this._inertiaCoeff20 = 0;
			this._inertiaCoeff21 = 0;
			this._inertiaCoeff22 = 0.33333333333333331 * (sqX + sqY);
		}

		proto._computeAabb = function (aabb, tf) {
			var tfx;
			var tfxX;
			var tfxY;
			var tfxZ;
			var tfy;
			var tfyX;
			var tfyY;
			var tfyZ;
			var tfz;
			var tfzX;
			var tfzY;
			var tfzZ;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = tf._rotation[0] * this._halfAxisX[0] + tf._rotation[1] * this._halfAxisX[1] + tf._rotation[2] * this._halfAxisX[2];
			__tmp__Y = tf._rotation[3] * this._halfAxisX[0] + tf._rotation[4] * this._halfAxisX[1] + tf._rotation[5] * this._halfAxisX[2];
			__tmp__Z = tf._rotation[6] * this._halfAxisX[0] + tf._rotation[7] * this._halfAxisX[1] + tf._rotation[8] * this._halfAxisX[2];
			tfxX = __tmp__X;
			tfxY = __tmp__Y;
			tfxZ = __tmp__Z;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = tf._rotation[0] * this._halfAxisY[0] + tf._rotation[1] * this._halfAxisY[1] + tf._rotation[2] * this._halfAxisY[2];
			__tmp__Y1 = tf._rotation[3] * this._halfAxisY[0] + tf._rotation[4] * this._halfAxisY[1] + tf._rotation[5] * this._halfAxisY[2];
			__tmp__Z1 = tf._rotation[6] * this._halfAxisY[0] + tf._rotation[7] * this._halfAxisY[1] + tf._rotation[8] * this._halfAxisY[2];
			tfyX = __tmp__X1;
			tfyY = __tmp__Y1;
			tfyZ = __tmp__Z1;
			var __tmp__X2;
			var __tmp__Y2;
			var __tmp__Z2;
			__tmp__X2 = tf._rotation[0] * this._halfAxisZ[0] + tf._rotation[1] * this._halfAxisZ[1] + tf._rotation[2] * this._halfAxisZ[2];
			__tmp__Y2 = tf._rotation[3] * this._halfAxisZ[0] + tf._rotation[4] * this._halfAxisZ[1] + tf._rotation[5] * this._halfAxisZ[2];
			__tmp__Z2 = tf._rotation[6] * this._halfAxisZ[0] + tf._rotation[7] * this._halfAxisZ[1] + tf._rotation[8] * this._halfAxisZ[2];
			tfzX = __tmp__X2;
			tfzY = __tmp__Y2;
			tfzZ = __tmp__Z2;
			tfxX = tfxX < 0 ? -tfxX : tfxX;
			tfxY = tfxY < 0 ? -tfxY : tfxY;
			tfxZ = tfxZ < 0 ? -tfxZ : tfxZ;
			tfyX = tfyX < 0 ? -tfyX : tfyX;
			tfyY = tfyY < 0 ? -tfyY : tfyY;
			tfyZ = tfyZ < 0 ? -tfyZ : tfyZ;
			tfzX = tfzX < 0 ? -tfzX : tfzX;
			tfzY = tfzY < 0 ? -tfzY : tfzY;
			tfzZ = tfzZ < 0 ? -tfzZ : tfzZ;
			var tfs;
			var tfsX;
			var tfsY;
			var tfsZ;
			tfsX = tfxX + tfyX;
			tfsY = tfxY + tfyY;
			tfsZ = tfxZ + tfyZ;
			tfsX += tfzX;
			tfsY += tfzY;
			tfsZ += tfzZ;
			aabb[0] = tf._position[0] - tfsX;
			aabb[1] = tf._position[1] - tfsY;
			aabb[2] = tf._position[2] - tfsZ;
			aabb[3] = tf._position[0] + tfsX;
			aabb[4] = tf._position[1] + tfsY;
			aabb[5] = tf._position[2] + tfsZ;
		}

		proto.computeLocalSupportingVertex = function (dir, out) {
			var gjkMargins;
			var gjkMarginsX;
			var gjkMarginsY;
			var gjkMarginsZ;
			var coreExtents;
			var coreExtentsX;
			var coreExtentsY;
			var coreExtentsZ;
			gjkMarginsX = this._gjkMargin;
			gjkMarginsY = this._gjkMargin;
			gjkMarginsZ = this._gjkMargin;
			gjkMarginsX = gjkMarginsX < this._halfExtents[0] ? gjkMarginsX : this._halfExtents[0];
			gjkMarginsY = gjkMarginsY < this._halfExtents[1] ? gjkMarginsY : this._halfExtents[1];
			gjkMarginsZ = gjkMarginsZ < this._halfExtents[2] ? gjkMarginsZ : this._halfExtents[2];
			coreExtentsX = this._halfExtents[0] - gjkMarginsX;
			coreExtentsY = this._halfExtents[1] - gjkMarginsY;
			coreExtentsZ = this._halfExtents[2] - gjkMarginsZ;
			out[0] = dir[0] > 0 ? coreExtentsX : -coreExtentsX;
			out[1] = dir[1] > 0 ? coreExtentsY : -coreExtentsY;
			out[2] = dir[2] > 0 ? coreExtentsZ : -coreExtentsZ;
		}

		proto._rayCastLocal = function (beginX, beginY, beginZ, endX, endY, endZ, hit) {
			var p1x = beginX;
			var p1y = beginY;
			var p1z = beginZ;
			var p2x = endX;
			var p2y = endY;
			var p2z = endZ;
			var halfW = this._halfExtents[0];
			var halfH = this._halfExtents[1];
			var halfD = this._halfExtents[2];
			var dx = p2x - p1x;
			var dy = p2y - p1y;
			var dz = p2z - p1z;
			var tminx = 0;
			var tminy = 0;
			var tminz = 0;
			var tmaxx = 1;
			var tmaxy = 1;
			var tmaxz = 1;
			if (dx > -1e-6 && dx < 1e-6) {
				if (p1x <= -halfW || p1x >= halfW) {
					return false;
				}
			} else {
				var invDx = 1 / dx;
				var t1 = (-halfW - p1x) * invDx;
				var t2 = (halfW - p1x) * invDx;
				if (t1 > t2) {
					var tmp = t1;
					t1 = t2;
					t2 = tmp;
				}
				if (t1 > 0) {
					tminx = t1;
				}
				if (t2 < 1) {
					tmaxx = t2;
				}
			}
			if (dy > -1e-6 && dy < 1e-6) {
				if (p1y <= -halfH || p1y >= halfH) {
					return false;
				}
			} else {
				var invDy = 1 / dy;
				var t11 = (-halfH - p1y) * invDy;
				var t21 = (halfH - p1y) * invDy;
				if (t11 > t21) {
					var tmp1 = t11;
					t11 = t21;
					t21 = tmp1;
				}
				if (t11 > 0) {
					tminy = t11;
				}
				if (t21 < 1) {
					tmaxy = t21;
				}
			}
			if (dz > -1e-6 && dz < 1e-6) {
				if (p1z <= -halfD || p1z >= halfD) {
					return false;
				}
			} else {
				var invDz = 1 / dz;
				var t12 = (-halfD - p1z) * invDz;
				var t22 = (halfD - p1z) * invDz;
				if (t12 > t22) {
					var tmp2 = t12;
					t12 = t22;
					t22 = tmp2;
				}
				if (t12 > 0) {
					tminz = t12;
				}
				if (t22 < 1) {
					tmaxz = t22;
				}
			}
			if (tminx >= 1 || tminy >= 1 || tminz >= 1 || tmaxx <= 0 || tmaxy <= 0 || tmaxz <= 0) {
				return false;
			}
			var min = tminx;
			var max = tmaxx;
			var hitDirection = 0;
			if (tminy > min) {
				min = tminy;
				hitDirection = 1;
			}
			if (tminz > min) {
				min = tminz;
				hitDirection = 2;
			}
			if (tmaxy < max) {
				max = tmaxy;
			}
			if (tmaxz < max) {
				max = tmaxz;
			}
			if (min > max) {
				return false;
			}
			if (min == 0) {
				return false;
			}
			switch (hitDirection) {
				case 0:
					hit.normal.init(dx > 0 ? -1 : 1, 0, 0);
					break;
				case 1:
					hit.normal.init(0, dy > 0 ? -1 : 1, 0);
					break;
				case 2:
					hit.normal.init(0, 0, dz > 0 ? -1 : 1);
					break;
			}
			hit.position.init(p1x + min * dx, p1y + min * dy, p1z + min * dz);
			hit.fraction = min;
			return true;
		}

		proto.rayCast = function (begin, end, transform, hit) {
			if (this._useGjkRayCast) {
				return collision.narrowphase.detector.gjkepa.GjkEpa.instance.rayCast(this, transform, begin, end, hit);
			} else {
				return collision.geometry.Geometry.prototype.rayCast.call(this, begin, end, transform, hit);
			}
		}

		var BoxGeometry = function (halfExtents) {
			collision.geometry.ConvexGeometry.call(this, 1);
			this._halfExtents = vec3(halfExtents);

			this._halfAxisX = vec3(this._halfExtents[0], 0, 0);
			this._halfAxisY = vec3(0, this._halfExtents[1], 0);
			this._halfAxisZ = vec3(0, 0, this._halfExtents[2]);

			this._updateMass();
			var minHalfExtents = this._halfExtents[0] < this._halfExtents[1] ? this._halfExtents[2] < this._halfExtents[0] ? this._halfExtents[2] : this._halfExtents[0] : this._halfExtents[2] < this._halfExtents[1] ? this._halfExtents[2] : this._halfExtents[1];
			if (this._gjkMargin > minHalfExtents * 0.2) {
				this._gjkMargin = minHalfExtents * 0.2;
			}
		}
		return BoxGeometry;
	});

	collision.geometry.CapsuleGeometry = pe.define(function (proto) {
		proto.getRadius = function () {
			return this._radius;
		}

		proto.getHalfHeight = function () {
			return this._halfHeight;
		}

		proto._updateMass = function () {
			var r2 = this._radius * this._radius;
			var hh2 = this._halfHeight * this._halfHeight;
			var cylinderVolume = 6.28318530717958 * r2 * this._halfHeight;
			var sphereVolume = 3.14159265358979 * r2 * this._radius * 4 / 3;
			this._volume = cylinderVolume + sphereVolume;
			var invVolume = this._volume == 0 ? 0 : 1 / this._volume;
			var inertiaY = invVolume * (cylinderVolume * r2 * 0.5 + sphereVolume * r2 * 0.4);
			var inertiaXZ = invVolume * (cylinderVolume * (r2 * 0.25 + hh2 / 3) + sphereVolume * (r2 * 0.4 + this._halfHeight * this._radius * 0.75 + hh2));
			this._inertiaCoeff00 = inertiaXZ;
			this._inertiaCoeff01 = 0;
			this._inertiaCoeff02 = 0;
			this._inertiaCoeff10 = 0;
			this._inertiaCoeff11 = inertiaY;
			this._inertiaCoeff12 = 0;
			this._inertiaCoeff20 = 0;
			this._inertiaCoeff21 = 0;
			this._inertiaCoeff22 = inertiaXZ;
		}

		proto._computeAabb = function (aabb, tf) {
			var radVec;
			var radVecX;
			var radVecY;
			var radVecZ;
			radVecX = this._radius;
			radVecY = this._radius;
			radVecZ = this._radius;
			var axis;
			var axisX;
			var axisY;
			var axisZ;
			axisX = tf._rotation[1];
			axisY = tf._rotation[4];
			axisZ = tf._rotation[7];
			axisX = axisX < 0 ? -axisX : axisX;
			axisY = axisY < 0 ? -axisY : axisY;
			axisZ = axisZ < 0 ? -axisZ : axisZ;
			axisX *= this._halfHeight;
			axisY *= this._halfHeight;
			axisZ *= this._halfHeight;
			radVecX += axisX;
			radVecY += axisY;
			radVecZ += axisZ;
			aabb[0] = tf._position[0] - radVecX;
			aabb[1] = tf._position[1] - radVecY;
			aabb[2] = tf._position[2] - radVecZ;
			aabb[3] = tf._position[0] + radVecX;
			aabb[4] = tf._position[1] + radVecY;
			aabb[5] = tf._position[2] + radVecZ;
		}

		proto.computeLocalSupportingVertex = function (dir, out) {
			if (dir[1] > 0) {
				out.init(0, this._halfHeight, 0);
			} else {
				out.init(0, -this._halfHeight, 0);
			}
		}

		proto._rayCastLocal = function (beginX, beginY, beginZ, endX, endY, endZ, hit) {
			var p1x = beginX;
			var p1y = beginY;
			var p1z = beginZ;
			var p2x = endX;
			var p2y = endY;
			var p2z = endZ;
			var halfH = this._halfHeight;
			var dx = p2x - p1x;
			var dy = p2y - p1y;
			var dz = p2z - p1z;
			var tminxz = 0;
			var tmaxxz = 1;
			var a = dx * dx + dz * dz;
			var b = p1x * dx + p1z * dz;
			var c = p1x * p1x + p1z * p1z - this._radius * this._radius;
			var D = b * b - a * c;
			if (D < 0) {
				return false;
			}
			var t;
			if (a > 0) {
				var sqrtD = Math.sqrt(D);
				tminxz = (-b - sqrtD) / a;
				tmaxxz = (-b + sqrtD) / a;
				if (tminxz >= 1 || tmaxxz <= 0) {
					return false;
				}
			} else {
				if (c >= 0) {
					return false;
				}
				tminxz = 0;
				tmaxxz = 1;
			}
			var crossY = p1y + dy * tminxz;
			var min;
			if (crossY > -halfH && crossY < halfH) {
				if (tminxz > 0) {
					min = tminxz;
					var _this = hit.normal.init(p1x + dx * min, 0, p1z + dz * min);
					var invLen = Math.sqrt(_this[0] * _this[0] + _this[1] * _this[1] + _this[2] * _this[2]);
					if (invLen > 0) {
						invLen = 1 / invLen;
					}
					var tx = _this[0] * invLen;
					var ty = _this[1] * invLen;
					var tz = _this[2] * invLen;
					_this[0] = tx;
					_this[1] = ty;
					_this[2] = tz;
					hit.position.init(p1x + min * dx, crossY, p1z + min * dz);
					hit.fraction = min;
					return true;
				}
				return false;
			}
			var sphereY = crossY < 0 ? -halfH : halfH;
			var spherePos;
			var spherePosX;
			var spherePosY;
			var spherePosZ;
			var sphereToBegin;
			var sphereToBeginX;
			var sphereToBeginY;
			var sphereToBeginZ;
			spherePosX = 0;
			spherePosY = sphereY;
			spherePosZ = 0;
			sphereToBeginX = beginX - spherePosX;
			sphereToBeginY = beginY - spherePosY;
			sphereToBeginZ = beginZ - spherePosZ;
			var d;
			var dX;
			var dY;
			var dZ;
			dX = endX - beginX;
			dY = endY - beginY;
			dZ = endZ - beginZ;
			a = dX * dX + dY * dY + dZ * dZ;
			b = sphereToBeginX * dX + sphereToBeginY * dY + sphereToBeginZ * dZ;
			c = sphereToBeginX * sphereToBeginX + sphereToBeginY * sphereToBeginY + sphereToBeginZ * sphereToBeginZ - this._radius * this._radius;
			D = b * b - a * c;
			if (D < 0) {
				return false;
			}
			var t1 = (-b - Math.sqrt(D)) / a;
			if (t1 < 0 || t1 > 1) {
				return false;
			}
			var hitPos;
			var hitPosX;
			var hitPosY;
			var hitPosZ;
			var hitNormal;
			var hitNormalX;
			var hitNormalY;
			var hitNormalZ;
			hitPosX = sphereToBeginX + dX * t1;
			hitPosY = sphereToBeginY + dY * t1;
			hitPosZ = sphereToBeginZ + dZ * t1;
			var l = hitPosX * hitPosX + hitPosY * hitPosY + hitPosZ * hitPosZ;
			if (l > 0) {
				l = 1 / Math.sqrt(l);
			}
			hitNormalX = hitPosX * l;
			hitNormalY = hitPosY * l;
			hitNormalZ = hitPosZ * l;
			hitPosX += spherePosX;
			hitPosY += spherePosY;
			hitPosZ += spherePosZ;
			var v = hit.position;
			v[0] = hitPosX;
			v[1] = hitPosY;
			v[2] = hitPosZ;
			var v1 = hit.normal;
			v1[0] = hitNormalX;
			v1[1] = hitNormalY;
			v1[2] = hitNormalZ;
			hit.fraction = t1;
			return true;
		}

		proto.rayCast = function (begin, end, transform, hit) {
			if (this._useGjkRayCast) {
				return collision.narrowphase.detector.gjkepa.GjkEpa.instance.rayCast(this, transform, begin, end, hit);
			} else {
				return collision.geometry.Geometry.prototype.rayCast.call(this, begin, end, transform, hit);
			}
		}

		var CapsuleGeometry = function (radius, halfHeight) {
			collision.geometry.ConvexGeometry.call(this, 4);
			this._radius = radius;
			this._halfHeight = halfHeight;
			this._gjkMargin = this._radius;
			this._updateMass();
		}
		return CapsuleGeometry;
	});

	collision.geometry.ConeGeometry = pe.define(function (proto) {
		proto.getRadius = function () {
			return this._radius;
		}

		proto.getHalfHeight = function () {
			return this._halfHeight;
		}

		proto._updateMass = function () {
			var r2 = this._radius * this._radius;
			var h2 = this._halfHeight * this._halfHeight * 4;
			this._volume = 3.14159265358979 * r2 * this._halfHeight * 2 / 3;
			this._inertiaCoeff00 = 0.05 * (3 * r2 + 2 * h2);
			this._inertiaCoeff01 = 0;
			this._inertiaCoeff02 = 0;
			this._inertiaCoeff10 = 0;
			this._inertiaCoeff11 = 0.3 * r2;
			this._inertiaCoeff12 = 0;
			this._inertiaCoeff20 = 0;
			this._inertiaCoeff21 = 0;
			this._inertiaCoeff22 = 0.083333333333333329 * (3 * r2 + 2 * h2);
		}

		proto._computeAabb = function (aabb, tf) {
			var axis;
			var axisX;
			var axisY;
			var axisZ;
			var axis2;
			var axis2X;
			var axis2Y;
			var axis2Z;
			var eh;
			var ehX;
			var ehY;
			var ehZ;
			var er;
			var erX;
			var erY;
			var erZ;
			axisX = tf._rotation[1];
			axisY = tf._rotation[4];
			axisZ = tf._rotation[7];
			axis2X = axisX * axisX;
			axis2Y = axisY * axisY;
			axis2Z = axisZ * axisZ;
			var axis2x = axis2X;
			var axis2y = axis2Y;
			var axis2z = axis2Z;
			erX = Math.sqrt(1 - axis2x);
			erY = Math.sqrt(1 - axis2y);
			erZ = Math.sqrt(1 - axis2z);
			erX *= this._radius;
			erY *= this._radius;
			erZ *= this._radius;
			ehX = axisX * this._halfHeight;
			ehY = axisY * this._halfHeight;
			ehZ = axisZ * this._halfHeight;
			var rmin;
			var rminX;
			var rminY;
			var rminZ;
			var rmax;
			var rmaxX;
			var rmaxY;
			var rmaxZ;
			rminX = -ehX;
			rminY = -ehY;
			rminZ = -ehZ;
			rminX -= erX;
			rminY -= erY;
			rminZ -= erZ;
			rmaxX = -ehX;
			rmaxY = -ehY;
			rmaxZ = -ehZ;
			rmaxX += erX;
			rmaxY += erY;
			rmaxZ += erZ;
			var max;
			var maxX;
			var maxY;
			var maxZ;
			var min;
			var minX;
			var minY;
			var minZ;
			maxX = rminX > rmaxX ? rminX : rmaxX;
			maxY = rminY > rmaxY ? rminY : rmaxY;
			maxZ = rminZ > rmaxZ ? rminZ : rmaxZ;
			maxX = maxX > ehX ? maxX : ehX;
			maxY = maxY > ehY ? maxY : ehY;
			maxZ = maxZ > ehZ ? maxZ : ehZ;
			minX = rminX < rmaxX ? rminX : rmaxX;
			minY = rminY < rmaxY ? rminY : rmaxY;
			minZ = rminZ < rmaxZ ? rminZ : rmaxZ;
			minX = minX < ehX ? minX : ehX;
			minY = minY < ehY ? minY : ehY;
			minZ = minZ < ehZ ? minZ : ehZ;
			aabb[0] = tf._position[0] + minX;
			aabb[1] = tf._position[1] + minY;
			aabb[2] = tf._position[2] + minZ;
			aabb[3] = tf._position[0] + maxX;
			aabb[4] = tf._position[1] + maxY;
			aabb[5] = tf._position[2] + maxZ;
		}

		proto.computeLocalSupportingVertex = function (dir, out) {
			var dx = dir[0];
			var dy = dir[1];
			var dz = dir[2];
			if (dy > 0 && dy * dy > this.sinTheta * this.sinTheta * (dx * dx + dy * dy + dz * dz)) {
				out.init(0, this._halfHeight - this._gjkMargin / this.sinTheta, 0);
				if (out[1] < 0) {
					out[1] = 0;
				}
				return;
			}
			var rx = dir[0];
			var rz = dir[2];
			var len = rx * rx + rz * rz;
			var height = 2 * this._halfHeight;
			var coreRadius = (height - this._gjkMargin) / height * this._radius - this._gjkMargin / this.cosTheta;
			if (coreRadius < 0) {
				coreRadius = 0;
			}
			var invLen = len > 0 ? coreRadius / Math.sqrt(len) : 0;
			var coreHalfHeight = this._halfHeight - this._gjkMargin;
			if (coreHalfHeight < 0) {
				coreHalfHeight = 0;
			}
			out[0] = rx * invLen;
			out[1] = -coreHalfHeight;
			out[2] = rz * invLen;
		}

		proto._rayCastLocal = function (beginX, beginY, beginZ, endX, endY, endZ, hit) {
			var p1x = beginX;
			var p1y = beginY;
			var p1z = beginZ;
			var p2x = endX;
			var p2y = endY;
			var p2z = endZ;
			var halfH = this._halfHeight;
			var dx = p2x - p1x;
			var dy = p2y - p1y;
			var dz = p2z - p1z;
			var tminy = 0;
			var tmaxy = 1;
			if (dy > -1e-6 && dy < 1e-6) {
				if (p1y <= -halfH || p1y >= halfH) {
					return false;
				}
			} else {
				var invDy = 1 / dy;
				var t1 = (-halfH - p1y) * invDy;
				var t2 = (halfH - p1y) * invDy;
				if (t1 > t2) {
					var tmp = t1;
					t1 = t2;
					t2 = tmp;
				}
				if (t1 > 0) {
					tminy = t1;
				}
				if (t2 < 1) {
					tmaxy = t2;
				}
			}
			if (tminy >= 1 || tmaxy <= 0) {
				return false;
			}
			var tminxz = 0;
			var tmaxxz = 0;
			p1y -= halfH;
			var cos2 = this.cosTheta * this.cosTheta;
			var a = cos2 * (dx * dx + dy * dy + dz * dz) - dy * dy;
			var b = cos2 * (p1x * dx + p1y * dy + p1z * dz) - p1y * dy;
			var c = cos2 * (p1x * p1x + p1y * p1y + p1z * p1z) - p1y * p1y;
			var D = b * b - a * c;
			if (a != 0) {
				if (D < 0) {
					return false;
				}
				var sqrtD = Math.sqrt(D);
				if (a < 0) {
					if (dy > 0) {
						tminxz = 0;
						tmaxxz = (-b + sqrtD) / a;
						if (tmaxxz <= 0) {
							return false;
						}
					} else {
						tminxz = (-b - sqrtD) / a;
						tmaxxz = 1;
						if (tminxz >= 1) {
							return false;
						}
					}
				} else {
					tminxz = (-b - sqrtD) / a;
					tmaxxz = (-b + sqrtD) / a;
					if (tminxz >= 1 || tmaxxz <= 0) {
						return false;
					}
				}
			} else {
				var t = -c / (2 * b);
				if (b > 0) {
					tminxz = 0;
					tmaxxz = t;
					if (t <= 0) {
						return false;
					}
				} else {
					tminxz = t;
					tmaxxz = 1;
					if (t >= 1) {
						return false;
					}
				}
			}
			p1y += halfH;
			var min;
			if (tmaxxz <= tminy || tmaxy <= tminxz) {
				return false;
			}
			if (tminxz < tminy) {
				min = tminy;
				if (min == 0) {
					return false;
				}
				hit.normal.init(0, dy > 0 ? -1 : 1, 0);
			} else {
				min = tminxz;
				if (min == 0) {
					return false;
				}
				var _this = hit.normal.init(p1x + dx * min, 0, p1z + dz * min);
				var invLen = Math.sqrt(_this[0] * _this[0] + _this[1] * _this[1] + _this[2] * _this[2]);
				if (invLen > 0) {
					invLen = 1 / invLen;
				}
				var tx = _this[0] * invLen;
				var ty = _this[1] * invLen;
				var tz = _this[2] * invLen;
				_this[0] = tx;
				_this[1] = ty;
				_this[2] = tz;
				var _this1 = _this;
				var s = this.cosTheta;
				var tx1 = _this1[0] * s;
				var ty1 = _this1[1] * s;
				var tz1 = _this1[2] * s;
				_this1[0] = tx1;
				_this1[1] = ty1;
				_this1[2] = tz1;
				hit.normal[1] += this.sinTheta;
			}
			hit.position.init(p1x + min * dx, p1y + min * dy, p1z + min * dz);
			hit.fraction = min;
			return true;
		}

		proto.rayCast = function (begin, end, transform, hit) {
			if (this._useGjkRayCast) {
				return collision.narrowphase.detector.gjkepa.GjkEpa.instance.rayCast(this, transform, begin, end, hit);
			} else {
				return collision.geometry.Geometry.prototype.rayCast.call(this, begin, end, transform, hit);
			}
		}

		var ConeGeometry = function (radius, halfHeight) {
			collision.geometry.ConvexGeometry.call(this, 3);
			this._radius = radius;
			this._halfHeight = halfHeight;
			this.sinTheta = radius / Math.sqrt(radius * radius + 4 * halfHeight * halfHeight);
			this.cosTheta = 2 * halfHeight / Math.sqrt(radius * radius + 4 * halfHeight * halfHeight);
			this._updateMass();
		}
		return ConeGeometry;
	});

	collision.geometry.ConvexHullGeometry = pe.define(function (proto) {
		proto.getVertices = function () {
			return this._vertices;
		}

		proto._updateMass = function () {
			this._volume = 1;
			this._inertiaCoeff00 = 1;
			this._inertiaCoeff01 = 0;
			this._inertiaCoeff02 = 0;
			this._inertiaCoeff10 = 0;
			this._inertiaCoeff11 = 1;
			this._inertiaCoeff12 = 0;
			this._inertiaCoeff20 = 0;
			this._inertiaCoeff21 = 0;
			this._inertiaCoeff22 = 1;
			var minx = this._vertices[0][0];
			var miny = this._vertices[0][1];
			var minz = this._vertices[0][2];
			var maxx = minx;
			var maxy = miny;
			var maxz = maxz;
			var i = 1, vx, vy, vz;

			var _g = this._numVertices;
			while (i < _g) {

				vx = this._vertices[i][0];
				vy = this._vertices[i][1];
				vz = this._vertices[i][2];
				if (vx < minx) {
					minx = vx;
				} else if (vx > maxx) {
					maxx = vx;
				}
				if (vy < miny) {
					miny = vy;
				} else if (vy > maxy) {
					maxy = vy;
				}
				if (vz < minz) {
					minz = vz;
				} else if (vz > maxz) {
					maxz = vz;
				}
				i++;
			}
			var sizex = maxx - minx;
			var sizey = maxy - miny;
			var sizez = maxz - minz;
			this._volume = sizex * sizey * sizez;
			var diffCog = ((minx + maxx) * (minx + maxx) + (miny + maxy) * (miny + maxy) + (minz + maxz) * (minz + maxz)) * 0.25;
			sizex = sizex * sizex * 0.25;
			sizey = sizey * sizey * 0.25;
			sizez = sizez * sizez * 0.25;
			this._inertiaCoeff00 = 0.33333333333333331 * (sizey + sizez) + diffCog;
			this._inertiaCoeff01 = 0;
			this._inertiaCoeff02 = 0;
			this._inertiaCoeff10 = 0;
			this._inertiaCoeff11 = 0.33333333333333331 * (sizez + sizex) + diffCog;
			this._inertiaCoeff12 = 0;
			this._inertiaCoeff20 = 0;
			this._inertiaCoeff21 = 0;
			this._inertiaCoeff22 = 0.33333333333333331 * (sizex + sizey) + diffCog;
		}

		proto._computeAabb = function (aabb, tf) {
			var min;
			var minX;
			var minY;
			var minZ;
			var max;
			var maxX;
			var maxY;
			var maxZ;
			var margin;
			var marginX;
			var marginY;
			var marginZ;
			marginX = this._gjkMargin;
			marginY = this._gjkMargin;
			marginZ = this._gjkMargin;
			var localV;
			var localVX;
			var localVY;
			var localVZ;
			var v = this._vertices[0];
			localVX = v[0];
			localVY = v[1];
			localVZ = v[2];
			var worldV;
			var worldVX;
			var worldVY;
			var worldVZ;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = tf._rotation[0] * localVX + tf._rotation[1] * localVY + tf._rotation[2] * localVZ;
			__tmp__Y = tf._rotation[3] * localVX + tf._rotation[4] * localVY + tf._rotation[5] * localVZ;
			__tmp__Z = tf._rotation[6] * localVX + tf._rotation[7] * localVY + tf._rotation[8] * localVZ;
			worldVX = __tmp__X;
			worldVY = __tmp__Y;
			worldVZ = __tmp__Z;
			worldVX += tf._position[0];
			worldVY += tf._position[1];
			worldVZ += tf._position[2];
			minX = worldVX;
			minY = worldVY;
			minZ = worldVZ;
			maxX = worldVX;
			maxY = worldVY;
			maxZ = worldVZ;
			var _g1 = 1;
			var _g = this._numVertices;
			while (_g1 < _g) {
				var i = _g1++;
				var v1 = this._vertices[i];
				localVX = v1[0];
				localVY = v1[1];
				localVZ = v1[2];
				var __tmp__X1;
				var __tmp__Y1;
				var __tmp__Z1;
				__tmp__X1 = tf._rotation[0] * localVX + tf._rotation[1] * localVY + tf._rotation[2] * localVZ;
				__tmp__Y1 = tf._rotation[3] * localVX + tf._rotation[4] * localVY + tf._rotation[5] * localVZ;
				__tmp__Z1 = tf._rotation[6] * localVX + tf._rotation[7] * localVY + tf._rotation[8] * localVZ;
				worldVX = __tmp__X1;
				worldVY = __tmp__Y1;
				worldVZ = __tmp__Z1;
				worldVX += tf._position[0];
				worldVY += tf._position[1];
				worldVZ += tf._position[2];
				minX = minX < worldVX ? minX : worldVX;
				minY = minY < worldVY ? minY : worldVY;
				minZ = minZ < worldVZ ? minZ : worldVZ;
				maxX = maxX > worldVX ? maxX : worldVX;
				maxY = maxY > worldVY ? maxY : worldVY;
				maxZ = maxZ > worldVZ ? maxZ : worldVZ;
			}
			aabb[0] = minX - marginX;
			aabb[1] = minY - marginY;
			aabb[2] = minZ - marginZ;
			aabb[3] = maxX + marginX;
			aabb[4] = maxY + marginY;
			aabb[5] = maxZ + marginZ;
		}

		proto.computeLocalSupportingVertex = function (dir, out) {
			var v = this._vertices[0];
			var maxDot = v[0] * dir[0] + v[1] * dir[1] + v[2] * dir[2];
			var maxIndex = 0;


			var _g = this._numVertices;
			var i = 1, dot;
			while (i < _g) {
				
				v = this._vertices[i];
				dot = v[0] * dir[0] + v[1] * dir[1] + v[2] * dir[2];
				if (dot > maxDot) {
					maxDot = dot;
					maxIndex = i;
				}
				i++;
			}
			v = this._vertices[maxIndex];
			out[0] = v[0];
			out[1] = v[1];
			out[2] = v[2];
		}

		proto.rayCast = function (begin, end, transform, hit) {
			if (this._useGjkRayCast) {
				return collision.narrowphase.detector.gjkepa.GjkEpa.instance.rayCast(this, transform, begin, end, hit);
			} else {
				return collision.geometry.Geometry.prototype.rayCast.call(this, begin, end, transform, hit);
			}
		}

		proto._rayCastLocal = function (beginX, beginY, beginZ, endX, endY, endZ, hit) {
			return false;
		}

		var ConvexHullGeometry = function (vertices) {
			collision.geometry.ConvexGeometry.call(this, 5);
			this._numVertices = vertices.length;

			this._vertices = vertices;
			/*
			var length = this._numVertices;
			var this1 = new Array(length);
			this._vertices = this1;
			var length1 = this._numVertices;
			var this2 = new Array(length1);
		//	this._tmpVertices = this2;
			var _g1 = 0;
			var _g = this._numVertices;
			while (_g1 < _g) {
				var i = _g1++;
				this._vertices[i] = vertices[i];
				//this._tmpVertices[i] = vec3();
			}
			*/
			this._useGjkRayCast = true;
			this._updateMass();
		}
		return ConvexHullGeometry;
	});


	collision.geometry.TerrainPatch = pe.define(function (proto) {

		proto._updateMass = function () {
			this._volume = 1;
			this._inertiaCoeff00 = 1;
			this._inertiaCoeff01 = 0;
			this._inertiaCoeff02 = 0;
			this._inertiaCoeff10 = 0;
			this._inertiaCoeff11 = 1;
			this._inertiaCoeff12 = 0;
			this._inertiaCoeff20 = 0;
			this._inertiaCoeff21 = 0;
			this._inertiaCoeff22 = 1;
		}

		proto._computeAabb = function (aabb, tf) {


			var marginX = this._gjkMargin;
			var marginY = this._gjkMargin;
			var marginZ = this._gjkMargin;

			var minX = Infinity;
			var minY = Infinity;
			var minZ = Infinity;
			var maxX = -Infinity;
			var maxY = -Infinity;
			var maxZ = -Infinity;

			var i = 0;
			var v;



			while (i < this._numVertices) {
				v = this._vertices[i];
				minX = Math.min(minX, v[0] + tf._position[0]);
				minY = Math.min(minY, v[1] + tf._position[1]);
				minZ = Math.min(minZ, v[2] + tf._position[2]);

				maxX = Math.max(maxX, v[0] + tf._position[0]);
				maxY = Math.max(maxY, v[1] + tf._position[1]);
				maxZ = Math.max(maxZ, v[2] + tf._position[2]);
				i++;
			}

			/*
			aabb[0] = minX - marginX;
			aabb[1] = minY - marginY;
			aabb[2] = minZ - marginZ;
			aabb[3] = maxX + marginX;
			aabb[4] = maxY + marginY;
			aabb[5] = maxZ + marginZ;
			*/

			aabb[0] = minX;
			aabb[1] = minY;
			aabb[2] = minZ;
			aabb[3] = maxX;
			aabb[4] = maxY;
			aabb[5] = maxZ;
		}

		proto.computeLocalSupportingVertex = function (dir, out) {
			var v = this._vertices[0];
			var maxDot = v[0] * dir[0] + v[1] * dir[1] + v[2] * dir[2];
			var maxIndex = 0;


			var _g = this._numVertices;
			var i = 1, dot;
			while (i < _g) {

				v = this._vertices[i];
				dot = v[0] * dir[0] + v[1] * dir[1] + v[2] * dir[2];
				if (dot > maxDot) {
					maxDot = dot;
					maxIndex = i;
				}
				i++;
			}
			v = this._vertices[maxIndex];
			out[0] = v[0];
			out[1] = v[1];
			out[2] = v[2];
		}


		proto._computeAabb = function (aabb, tf) {


			var verts = this._vertices;



			var minX = Infinity;
			var minY = Infinity;
			var minZ = Infinity;
			var maxX = -Infinity;
			var maxY = -Infinity;
			var maxZ = -Infinity;

			var i = 0;
			var v;

			for (i = 0; i < this._numVertices; i+=3) {
				minX = Math.min(minX, verts[i+0] + tf._position[0]);
				minY = Math.min(minY, verts[i +1] + tf._position[1]);
				minZ = Math.min(minZ, verts[i +2] + tf._position[2]);

				maxX = Math.max(maxX, verts[i +0] + tf._position[0]);
				maxY = Math.max(maxY, verts[i +1] + tf._position[1]);
				maxZ = Math.max(maxZ, verts[i +2] + tf._position[2]);
      }

			aabb[0] = minX - this._gjkMargin;
			aabb[1] = minY - this._gjkMargin;
			aabb[2] = minZ - this._gjkMargin;
			aabb[3] = maxX + this._gjkMargin;
			aabb[4] = maxY + this._gjkMargin;
			aabb[5] = maxZ + this._gjkMargin;

		}

		proto.computeLocalSupportingVertex = function (dir, out) {
			var v = this._vertices[0];
		
			var i = 1, dot;
			var verts = this._vertices;

			var maxDot = verts[0] * dir[0] + verts[1] * dir[1] + verts[2] * dir[2];
			var maxIndex = 0;

			for (i = 3; i < this._numVertices; i += 3) {
				dot = verts[i + 0] * dir[0] + verts[i + 1] * dir[1] + verts[i +2] * dir[2];
				if (dot > maxDot) {
					maxDot = dot;
					maxIndex = i;
				}

			}

			out[0] = verts[maxIndex + 0];
			out[1] = verts[maxIndex + 1];
			out[2] = verts[maxIndex + 2];
		}



		proto.rayCast = function (begin, end, transform, hit) {
			if (this._useGjkRayCast) {
				return collision.narrowphase.detector.gjkepa.GjkEpa.instance.rayCast(this, transform, begin, end, hit);
			} else {
				return collision.geometry.Geometry.prototype.rayCast.call(this, begin, end, transform, hit);
			}
		}

		proto._rayCastLocal = function (beginX, beginY, beginZ, endX, endY, endZ, hit) {
			return false;
		}

		var TerrainPatch = function (vertices) {
			collision.geometry.ConvexGeometry.call(this, 5);
			this._numVertices = vertices.length;
			this._vertices = vertices;
			this._useGjkRayCast = false;
			this._updateMass();
		}
		return TerrainPatch;
	});


	collision.geometry.CylinderGeometry = pe.define(function (proto) {
		proto.getRadius = function () {
			return this._radius;
		}

		proto.getHalfHeight = function () {
			return this._halfHeight;
		}

		proto._updateMass = function () {
			var r2 = this._radius * this._radius;
			var h2 = this._halfHeight * this._halfHeight * 4;
			this._volume = 3.14159265358979 * r2 * this._halfHeight * 2;
			this._inertiaCoeff00 = 0.083333333333333329 * (3 * r2 + h2);
			this._inertiaCoeff01 = 0;
			this._inertiaCoeff02 = 0;
			this._inertiaCoeff10 = 0;
			this._inertiaCoeff11 = 0.5 * r2;
			this._inertiaCoeff12 = 0;
			this._inertiaCoeff20 = 0;
			this._inertiaCoeff21 = 0;
			this._inertiaCoeff22 = 0.083333333333333329 * (3 * r2 + h2);
		}

		proto._computeAabb = function (aabb, tf) {
			var axis;
			var axisX;
			var axisY;
			var axisZ;
			var axis2;
			var axis2X;
			var axis2Y;
			var axis2Z;
			var eh;
			var ehX;
			var ehY;
			var ehZ;
			var er;
			var erX;
			var erY;
			var erZ;
			axisX = tf._rotation[1];
			axisY = tf._rotation[4];
			axisZ = tf._rotation[7];
			axisX = axisX < 0 ? -axisX : axisX;
			axisY = axisY < 0 ? -axisY : axisY;
			axisZ = axisZ < 0 ? -axisZ : axisZ;
			axis2X = axisX * axisX;
			axis2Y = axisY * axisY;
			axis2Z = axisZ * axisZ;
			var axis2x = axis2X;
			var axis2y = axis2Y;
			var axis2z = axis2Z;
			erX = Math.sqrt(1 - axis2x);
			erY = Math.sqrt(1 - axis2y);
			erZ = Math.sqrt(1 - axis2z);
			erX *= this._radius;
			erY *= this._radius;
			erZ *= this._radius;
			ehX = axisX * this._halfHeight;
			ehY = axisY * this._halfHeight;
			ehZ = axisZ * this._halfHeight;
			var max;
			var maxX;
			var maxY;
			var maxZ;
			maxX = erX + ehX;
			maxY = erY + ehY;
			maxZ = erZ + ehZ;
			aabb[0] = tf._position[0] - maxX;
			aabb[1] = tf._position[1] - maxY;
			aabb[2] = tf._position[2] - maxZ;
			aabb[3] = tf._position[0] + maxX;
			aabb[4] = tf._position[1] + maxY;
			aabb[5] = tf._position[2] + maxZ;
		}

		proto.computeLocalSupportingVertex = function (dir, out) {
			var rx = dir[0];
			var rz = dir[2];
			var len = rx * rx + rz * rz;
			var coreRadius = this._radius - this._gjkMargin;
			if (coreRadius < 0) {
				coreRadius = 0;
			}
			var invLen = len > 0 ? coreRadius / Math.sqrt(len) : 0;
			var coreHeight = this._halfHeight - this._gjkMargin;
			if (coreHeight < 0) {
				coreHeight = 0;
			}
			out[0] = rx * invLen;
			out[1] = dir[1] > 0 ? coreHeight : -coreHeight;
			out[2] = rz * invLen;
		}

		proto._rayCastLocal = function (beginX, beginY, beginZ, endX, endY, endZ, hit) {
			var p1x = beginX;
			var p1y = beginY;
			var p1z = beginZ;
			var p2x = endX;
			var p2y = endY;
			var p2z = endZ;
			var halfH = this._halfHeight;
			var dx = p2x - p1x;
			var dy = p2y - p1y;
			var dz = p2z - p1z;
			var tminy = 0;
			var tmaxy = 1;
			if (dy > -1e-6 && dy < 1e-6) {
				if (p1y <= -halfH || p1y >= halfH) {
					return false;
				}
			} else {
				var invDy = 1 / dy;
				var t1 = (-halfH - p1y) * invDy;
				var t2 = (halfH - p1y) * invDy;
				if (t1 > t2) {
					var tmp = t1;
					t1 = t2;
					t2 = tmp;
				}
				if (t1 > 0) {
					tminy = t1;
				}
				if (t2 < 1) {
					tmaxy = t2;
				}
			}
			if (tminy >= 1 || tmaxy <= 0) {
				return false;
			}
			var tminxz = 0;
			var tmaxxz = 1;
			var a = dx * dx + dz * dz;
			var b = p1x * dx + p1z * dz;
			var c = p1x * p1x + p1z * p1z - this._radius * this._radius;
			var D = b * b - a * c;
			if (D < 0) {
				return false;
			}
			var t;
			if (a > 0) {
				var sqrtD = Math.sqrt(D);
				tminxz = (-b - sqrtD) / a;
				tmaxxz = (-b + sqrtD) / a;
				if (tminxz >= 1 || tmaxxz <= 0) {
					return false;
				}
			} else {
				if (c >= 0) {
					return false;
				}
				tminxz = 0;
				tmaxxz = 1;
			}
			var min;
			if (tmaxxz <= tminy || tmaxy <= tminxz) {
				return false;
			}
			if (tminxz < tminy) {
				min = tminy;
				if (min == 0) {
					return false;
				}
				hit.normal.init(0, dy > 0 ? -1 : 1, 0);
			} else {
				min = tminxz;
				if (min == 0) {
					return false;
				}
				var _this = hit.normal.init(p1x + dx * min, 0, p1z + dz * min);
				var invLen = Math.sqrt(_this[0] * _this[0] + _this[1] * _this[1] + _this[2] * _this[2]);
				if (invLen > 0) {
					invLen = 1 / invLen;
				}
				var tx = _this[0] * invLen;
				var ty = _this[1] * invLen;
				var tz = _this[2] * invLen;
				_this[0] = tx;
				_this[1] = ty;
				_this[2] = tz;
			}
			hit.position.init(p1x + min * dx, p1y + min * dy, p1z + min * dz);
			hit.fraction = min;
			return true;
		}

		proto.rayCast = function (begin, end, transform, hit) {
			if (this._useGjkRayCast) {
				return collision.narrowphase.detector.gjkepa.GjkEpa.instance.rayCast(this, transform, begin, end, hit);
			} else {
				return collision.geometry.Geometry.prototype.rayCast.call(this, begin, end, transform, hit);
			}
		}

		var CylinderGeometry = function (radius, halfHeight) {
			collision.geometry.ConvexGeometry.call(this, 2);
			this._radius = radius;
			this._halfHeight = halfHeight;
			this._updateMass();
		}
		return CylinderGeometry;
	});

	collision.geometry.SphereGeometry = pe.define(function (proto) {
		proto._updateMass = function () {
			this._volume = 4.1887902047863861 * this._radius * this._radius * this._radius;
			this._inertiaCoeff00 = 0.4 * this._radius * this._radius;
			this._inertiaCoeff01 = 0;
			this._inertiaCoeff02 = 0;
			this._inertiaCoeff10 = 0;
			this._inertiaCoeff11 = 0.4 * this._radius * this._radius;
			this._inertiaCoeff12 = 0;
			this._inertiaCoeff20 = 0;
			this._inertiaCoeff21 = 0;
			this._inertiaCoeff22 = 0.4 * this._radius * this._radius;
		}

		proto._computeAabb = function (aabb, tf) {

			aabb[0] = tf._position[0] - this._radius;
			aabb[1] = tf._position[1] - this._radius;
			aabb[2] = tf._position[2] - this._radius;
			aabb[3] = tf._position[0] + this._radius;
			aabb[4] = tf._position[1] + this._radius;
			aabb[5] = tf._position[2] + this._radius;
		}

		proto.computeLocalSupportingVertex = function (dir, out) {
			math.vec3_zero$(out)
		}

		proto._rayCastLocal = function (beginX, beginY, beginZ, endX, endY, endZ, hit) {
			var d;
			var dX;
			var dY;
			var dZ;
			dX = endX - beginX;
			dY = endY - beginY;
			dZ = endZ - beginZ;
			var a = dX * dX + dY * dY + dZ * dZ;
			var b = beginX * dX + beginY * dY + beginZ * dZ;
			var c = beginX * beginX + beginY * beginY + beginZ * beginZ - this._radius * this._radius;
			var D = b * b - a * c;
			if (D < 0) {
				return false;
			}
			var t = (-b - Math.sqrt(D)) / a;
			if (t < 0 || t > 1) {
				return false;
			}
			var hitPos;
			var hitPosX;
			var hitPosY;
			var hitPosZ;
			var hitNormal;
			var hitNormalX;
			var hitNormalY;
			var hitNormalZ;
			hitPosX = beginX + dX * t;
			hitPosY = beginY + dY * t;
			hitPosZ = beginZ + dZ * t;
			var l = hitPosX * hitPosX + hitPosY * hitPosY + hitPosZ * hitPosZ;
			if (l > 0) {
				l = 1 / Math.sqrt(l);
			}
			hitNormalX = hitPosX * l;
			hitNormalY = hitPosY * l;
			hitNormalZ = hitPosZ * l;
			var v = hit.position;
			v[0] = hitPosX;
			v[1] = hitPosY;
			v[2] = hitPosZ;
			var v1 = hit.normal;
			v1[0] = hitNormalX;
			v1[1] = hitNormalY;
			v1[2] = hitNormalZ;
			hit.fraction = t;
			return true;
		}

		proto.rayCast = function (begin, end, transform, hit) {
			if (this._useGjkRayCast) {
				return collision.narrowphase.detector.gjkepa.GjkEpa.instance.rayCast(this, transform, begin, end, hit);
			} else {
				return collision.geometry.Geometry.prototype.rayCast.call(this, begin, end, transform, hit);
			}
		}

		var SphereGeometry = function (radius) {
			collision.geometry.ConvexGeometry.call(this, 0);
			this._radius = radius;
			this._gjkMargin = this._radius;
			this._updateMass();
		}
		return SphereGeometry;
	});

	collision.narrowphase.CollisionMatrix = pe.define(function (proto) {
		proto.getDetector = function (geomType1, geomType2) {
			return this.detectors[geomType1][geomType2];
		}

		var CollisionMatrix = function () {
			var this1 = new Array(8);
			this.detectors = this1;
			var _g = 0;
			while (_g < 6) {
				var i = _g++;
				var this2 = this.detectors;
				var this3 = new Array(8);
				this2[i] = this3;
			}
			var gjkEpaDetector = new collision.narrowphase.detector.GjkEpaDetector();
			var sp = 0;
			var bo = 1;
			var cy = 2;
			var co = 3;
			var ca = 4;
			var ch = 5;
			this.detectors[sp][sp] = new collision.narrowphase.detector.SphereSphereDetector();
			this.detectors[sp][bo] = new collision.narrowphase.detector.SphereBoxDetector(false);
			this.detectors[sp][cy] = gjkEpaDetector;
			this.detectors[sp][co] = gjkEpaDetector;
			this.detectors[sp][ca] = new collision.narrowphase.detector.SphereCapsuleDetector(false);
			this.detectors[sp][ch] = gjkEpaDetector;
			this.detectors[bo][sp] = new collision.narrowphase.detector.SphereBoxDetector(true);
			this.detectors[bo][bo] = new collision.narrowphase.detector.BoxBoxDetector();
			this.detectors[bo][cy] = gjkEpaDetector;
			this.detectors[bo][co] = gjkEpaDetector;
			this.detectors[bo][ca] = gjkEpaDetector;
			this.detectors[bo][ch] = gjkEpaDetector;
			this.detectors[cy][sp] = gjkEpaDetector;
			this.detectors[cy][bo] = gjkEpaDetector;
			this.detectors[cy][cy] = gjkEpaDetector;
			this.detectors[cy][co] = gjkEpaDetector;
			this.detectors[cy][ca] = gjkEpaDetector;
			this.detectors[cy][ch] = gjkEpaDetector;
			this.detectors[co][sp] = gjkEpaDetector;
			this.detectors[co][bo] = gjkEpaDetector;
			this.detectors[co][cy] = gjkEpaDetector;
			this.detectors[co][co] = gjkEpaDetector;
			this.detectors[co][ca] = gjkEpaDetector;
			this.detectors[co][ch] = gjkEpaDetector;
			this.detectors[ca][sp] = new collision.narrowphase.detector.SphereCapsuleDetector(true);
			this.detectors[ca][bo] = gjkEpaDetector;
			this.detectors[ca][cy] = gjkEpaDetector;
			this.detectors[ca][co] = gjkEpaDetector;
			this.detectors[ca][ca] = new collision.narrowphase.detector.CapsuleCapsuleDetector();
			this.detectors[ca][ch] = gjkEpaDetector;
			this.detectors[ch][sp] = gjkEpaDetector;
			this.detectors[ch][bo] = gjkEpaDetector;
			this.detectors[ch][cy] = gjkEpaDetector;
			this.detectors[ch][co] = gjkEpaDetector;
			this.detectors[ch][ca] = gjkEpaDetector;
			this.detectors[ch][ch] = gjkEpaDetector;
		}
		return CollisionMatrix;
	});

	collision.narrowphase.DetectorResult = pe.define(function (proto) {
		proto.getMaxDepth = function () {
			var max = 0;
			var _g1 = 0;
			var _g = this.numPoints;
			while (_g1 < _g) {
				var i = _g1++;
				if (this.points[i].depth > max) {
					max = this.points[i].depth;
				}
			}
			return max;
		}

		proto.clear = function () {
			this.numPoints = 0;
			var _g = 0;
			var _g1 = this.points;
			while (_g < _g1.length) {
				var p = _g1[_g];
				++_g;
				p.position1[0] = 0;
				p.position1[1] = 0;
				p.position1[2] = 0;

				p.position2[0] = 0;
				p.position2[1] = 0;
				p.position2[2] = 0;
				p.depth = 0;
				p.id = 0;
			}
			this.normal[0] = 0;
			this.normal[1] = 0;
			this.normal[2] = 0;

		}

		var DetectorResult = function () {
			this.numPoints = 0;
			this.normal = vec3();
			this.points = new Array(pe.common.Setting.maxManifoldPoints);
			this.incremental = false;
			var _g1 = 0;
			while (_g1 < this.points.length) {
				this.points[_g1++] = new collision.narrowphase.DetectorResultPoint();
			}

			collision.narrowphase.DetectorResult.count++;

		}
		return DetectorResult;
	});

	collision.narrowphase.detector.Detector = pe.define(function (proto) {
		proto.setNormal = function (result, nX, nY, nZ) {
			if (this.swapped) {
				math.vec3_set$(result.normal, -nX, -nY, -nZ)
			}
			else {
				math.vec3_set$(result.normal, nX, nY, nZ)
			}
		}

		proto.addPoint = function (result, pos1X, pos1Y, pos1Z, pos2X, pos2Y, pos2Z, depth, id) {
			point = result.points[result.numPoints++];
			point.depth = depth;
			point.id = id;
			pos1 = point.position1;
			pos2 = point.position2;
			if (this.swapped) {
				pos1[0] = pos2X;
				pos1[1] = pos2Y;
				pos1[2] = pos2Z;
				pos2[0] = pos1X;
				pos2[1] = pos1Y;
				pos2[2] = pos1Z;
			} else {
				pos1[0] = pos1X;
				pos1[1] = pos1Y;
				pos1[2] = pos1Z;
				pos2[0] = pos2X;
				pos2[1] = pos2Y;
				pos2[2] = pos2Z;
			}
		}

		proto.detectImpl = function (result, geom1, geom2, tf1, tf2, cachedData) { }

		proto.detect = function (result, geom1, geom2, transform1, transform2, cachedData) {
			result.numPoints = 0;
			i1 = result.points.length
			while (--i1 > 0) {
				point = result.points[i1];
				pos1 = point.position1;
				pos2 = point.position2;
				math.vec3_zero$(pos1)
				math.vec3_zero$(pos2)
				point.depth = 0;
				point.id = 0;
			}

			math.vec3_zero$(result.normal)

			if (this.swapped) {
				this.detectImpl(result, geom2, geom1, transform2, transform1, cachedData);
			} else {
				this.detectImpl(result, geom1, geom2, transform1, transform2, cachedData);
			}

		}

		var Detector = function (swapped) {
			this.swapped = swapped;
		}
		return Detector;
	});

	collision.narrowphase.detector.BoxBoxDetector = pe.define(function (proto) {
		proto.detectImpl = function (result, geom1, geom2, tf1, tf2, cachedData) {
			var b1 = geom1;
			var b2 = geom2;
			result.incremental = false;
			var c1;
			var c1X;
			var c1Y;
			var c1Z;
			var c2;
			var c2X;
			var c2Y;
			var c2Z;
			var c12;
			var c12X;
			var c12Y;
			var c12Z;
			c1X = tf1._position[0];
			c1Y = tf1._position[1];
			c1Z = tf1._position[2];
			c2X = tf2._position[0];
			c2Y = tf2._position[1];
			c2Z = tf2._position[2];
			c12X = c2X - c1X;
			c12Y = c2Y - c1Y;
			c12Z = c2Z - c1Z;
			var x1;
			var x1X;
			var x1Y;
			var x1Z;
			var y1;
			var y1X;
			var y1Y;
			var y1Z;
			var z1;
			var z1X;
			var z1Y;
			var z1Z;
			var x2;
			var x2X;
			var x2Y;
			var x2Z;
			var y2;
			var y2X;
			var y2Y;
			var y2Z;
			var z2;
			var z2X;
			var z2Y;
			var z2Z;
			x1X = tf1._rotation[0];
			x1Y = tf1._rotation[3];
			x1Z = tf1._rotation[6];
			y1X = tf1._rotation[1];
			y1Y = tf1._rotation[4];
			y1Z = tf1._rotation[7];
			z1X = tf1._rotation[2];
			z1Y = tf1._rotation[5];
			z1Z = tf1._rotation[8];
			x2X = tf2._rotation[0];
			x2Y = tf2._rotation[3];
			x2Z = tf2._rotation[6];
			y2X = tf2._rotation[1];
			y2Y = tf2._rotation[4];
			y2Z = tf2._rotation[7];
			z2X = tf2._rotation[2];
			z2Y = tf2._rotation[5];
			z2Z = tf2._rotation[8];
			var w1 = b1._halfExtents[0];
			var h1 = b1._halfExtents[1];
			var d1 = b1._halfExtents[2];
			var w2 = b2._halfExtents[0];
			var h2 = b2._halfExtents[1];
			var d2 = b2._halfExtents[2];
			var sx1;
			var sx1X;
			var sx1Y;
			var sx1Z;
			var sy1;
			var sy1X;
			var sy1Y;
			var sy1Z;
			var sz1;
			var sz1X;
			var sz1Y;
			var sz1Z;
			var sx2;
			var sx2X;
			var sx2Y;
			var sx2Z;
			var sy2;
			var sy2X;
			var sy2Y;
			var sy2Z;
			var sz2;
			var sz2X;
			var sz2Y;
			var sz2Z;
			sx1X = x1X * w1;
			sx1Y = x1Y * w1;
			sx1Z = x1Z * w1;
			sy1X = y1X * h1;
			sy1Y = y1Y * h1;
			sy1Z = y1Z * h1;
			sz1X = z1X * d1;
			sz1Y = z1Y * d1;
			sz1Z = z1Z * d1;
			sx2X = x2X * w2;
			sx2Y = x2Y * w2;
			sx2Z = x2Z * w2;
			sy2X = y2X * h2;
			sy2Y = y2Y * h2;
			sy2Z = y2Z * h2;
			sz2X = z2X * d2;
			sz2Y = z2Y * d2;
			sz2Z = z2Z * d2;
			var projSum;
			var projC12Abs;
			var mDepth = 1.0 / 0.0;
			var mId = -1;
			var mSign = 0;
			var mAxis;
			var mAxisX;
			var mAxisY;
			var mAxisZ;
			mAxisX = 0;
			mAxisY = 0;
			mAxisZ = 0;
			var proj1 = w1;
			var dx = x1X * sx2X + x1Y * sx2Y + x1Z * sx2Z;
			var dy = x1X * sy2X + x1Y * sy2Y + x1Z * sy2Z;
			var dz = x1X * sz2X + x1Y * sz2Y + x1Z * sz2Z;
			if (dx < 0) {
				dx = -dx;
			}
			if (dy < 0) {
				dy = -dy;
			}
			if (dz < 0) {
				dz = -dz;
			}
			var proj2 = dx + dy + dz;
			var projC12 = x1X * c12X + x1Y * c12Y + x1Z * c12Z;
			var sum = proj1 + proj2;
			var neg = projC12 < 0;
			var abs = neg ? -projC12 : projC12;
			if (abs < sum) {
				var depth = sum - abs;
				if (depth < mDepth) {
					mDepth = depth;
					mId = 0;
					mAxisX = x1X;
					mAxisY = x1Y;
					mAxisZ = x1Z;
					mSign = neg ? -1 : 1;
				}
			} else {
				return;
			}
			proj1 = h1;
			var dx1 = y1X * sx2X + y1Y * sx2Y + y1Z * sx2Z;
			var dy1 = y1X * sy2X + y1Y * sy2Y + y1Z * sy2Z;
			var dz1 = y1X * sz2X + y1Y * sz2Y + y1Z * sz2Z;
			if (dx1 < 0) {
				dx1 = -dx1;
			}
			if (dy1 < 0) {
				dy1 = -dy1;
			}
			if (dz1 < 0) {
				dz1 = -dz1;
			}
			proj2 = dx1 + dy1 + dz1;
			projC12 = y1X * c12X + y1Y * c12Y + y1Z * c12Z;
			var sum1 = proj1 + proj2;
			var neg1 = projC12 < 0;
			var abs1 = neg1 ? -projC12 : projC12;
			if (abs1 < sum1) {
				var depth1 = sum1 - abs1;
				if (depth1 < mDepth) {
					mDepth = depth1;
					mId = 1;
					mAxisX = y1X;
					mAxisY = y1Y;
					mAxisZ = y1Z;
					mSign = neg1 ? -1 : 1;
				}
			} else {
				return;
			}
			proj1 = d1;
			var dx2 = z1X * sx2X + z1Y * sx2Y + z1Z * sx2Z;
			var dy2 = z1X * sy2X + z1Y * sy2Y + z1Z * sy2Z;
			var dz2 = z1X * sz2X + z1Y * sz2Y + z1Z * sz2Z;
			if (dx2 < 0) {
				dx2 = -dx2;
			}
			if (dy2 < 0) {
				dy2 = -dy2;
			}
			if (dz2 < 0) {
				dz2 = -dz2;
			}
			proj2 = dx2 + dy2 + dz2;
			projC12 = z1X * c12X + z1Y * c12Y + z1Z * c12Z;
			var sum2 = proj1 + proj2;
			var neg2 = projC12 < 0;
			var abs2 = neg2 ? -projC12 : projC12;
			if (abs2 < sum2) {
				var depth2 = sum2 - abs2;
				if (depth2 < mDepth) {
					mDepth = depth2;
					mId = 2;
					mAxisX = z1X;
					mAxisY = z1Y;
					mAxisZ = z1Z;
					mSign = neg2 ? -1 : 1;
				}
			} else {
				return;
			}
			if (mDepth > pe.common.Setting.linearSlop) {
				mDepth -= pe.common.Setting.linearSlop;
			} else {
				mDepth = 0;
			}
			var dx3 = x2X * sx1X + x2Y * sx1Y + x2Z * sx1Z;
			var dy3 = x2X * sy1X + x2Y * sy1Y + x2Z * sy1Z;
			var dz3 = x2X * sz1X + x2Y * sz1Y + x2Z * sz1Z;
			if (dx3 < 0) {
				dx3 = -dx3;
			}
			if (dy3 < 0) {
				dy3 = -dy3;
			}
			if (dz3 < 0) {
				dz3 = -dz3;
			}
			proj1 = dx3 + dy3 + dz3;
			proj2 = w2;
			projC12 = x2X * c12X + x2Y * c12Y + x2Z * c12Z;
			var sum3 = proj1 + proj2;
			var neg3 = projC12 < 0;
			var abs3 = neg3 ? -projC12 : projC12;
			if (abs3 < sum3) {
				var depth3 = sum3 - abs3;
				if (depth3 < mDepth) {
					mDepth = depth3;
					mId = 3;
					mAxisX = x2X;
					mAxisY = x2Y;
					mAxisZ = x2Z;
					mSign = neg3 ? -1 : 1;
				}
			} else {
				return;
			}
			var dx4 = y2X * sx1X + y2Y * sx1Y + y2Z * sx1Z;
			var dy4 = y2X * sy1X + y2Y * sy1Y + y2Z * sy1Z;
			var dz4 = y2X * sz1X + y2Y * sz1Y + y2Z * sz1Z;
			if (dx4 < 0) {
				dx4 = -dx4;
			}
			if (dy4 < 0) {
				dy4 = -dy4;
			}
			if (dz4 < 0) {
				dz4 = -dz4;
			}
			proj1 = dx4 + dy4 + dz4;
			proj2 = h2;
			projC12 = y2X * c12X + y2Y * c12Y + y2Z * c12Z;
			var sum4 = proj1 + proj2;
			var neg4 = projC12 < 0;
			var abs4 = neg4 ? -projC12 : projC12;
			if (abs4 < sum4) {
				var depth4 = sum4 - abs4;
				if (depth4 < mDepth) {
					mDepth = depth4;
					mId = 4;
					mAxisX = y2X;
					mAxisY = y2Y;
					mAxisZ = y2Z;
					mSign = neg4 ? -1 : 1;
				}
			} else {
				return;
			}
			var dx5 = z2X * sx1X + z2Y * sx1Y + z2Z * sx1Z;
			var dy5 = z2X * sy1X + z2Y * sy1Y + z2Z * sy1Z;
			var dz5 = z2X * sz1X + z2Y * sz1Y + z2Z * sz1Z;
			if (dx5 < 0) {
				dx5 = -dx5;
			}
			if (dy5 < 0) {
				dy5 = -dy5;
			}
			if (dz5 < 0) {
				dz5 = -dz5;
			}
			proj1 = dx5 + dy5 + dz5;
			proj2 = d2;
			projC12 = z2X * c12X + z2Y * c12Y + z2Z * c12Z;
			var sum5 = proj1 + proj2;
			var neg5 = projC12 < 0;
			var abs5 = neg5 ? -projC12 : projC12;
			if (abs5 < sum5) {
				var depth5 = sum5 - abs5;
				if (depth5 < mDepth) {
					mDepth = depth5;
					mId = 5;
					mAxisX = z2X;
					mAxisY = z2Y;
					mAxisZ = z2Z;
					mSign = neg5 ? -1 : 1;
				}
			} else {
				return;
			}
			if (mDepth > pe.common.Setting.linearSlop) {
				mDepth -= pe.common.Setting.linearSlop;
			} else {
				mDepth = 0;
			}
			var edgeAxis;
			var edgeAxisX;
			var edgeAxisY;
			var edgeAxisZ;
			edgeAxisX = x1Y * x2Z - x1Z * x2Y;
			edgeAxisY = x1Z * x2X - x1X * x2Z;
			edgeAxisZ = x1X * x2Y - x1Y * x2X;
			if (!(edgeAxisX == 0 && edgeAxisY == 0 && edgeAxisZ == 0)) {
				var l = edgeAxisX * edgeAxisX + edgeAxisY * edgeAxisY + edgeAxisZ * edgeAxisZ;
				if (l > 0) {
					l = 1 / Math.sqrt(l);
				}
				edgeAxisX *= l;
				edgeAxisY *= l;
				edgeAxisZ *= l;
				var dx6 = edgeAxisX * sy1X + edgeAxisY * sy1Y + edgeAxisZ * sy1Z;
				var dy6 = edgeAxisX * sz1X + edgeAxisY * sz1Y + edgeAxisZ * sz1Z;
				if (dx6 < 0) {
					dx6 = -dx6;
				}
				if (dy6 < 0) {
					dy6 = -dy6;
				}
				proj1 = dx6 + dy6;
				var dx7 = edgeAxisX * sy2X + edgeAxisY * sy2Y + edgeAxisZ * sy2Z;
				var dy7 = edgeAxisX * sz2X + edgeAxisY * sz2Y + edgeAxisZ * sz2Z;
				if (dx7 < 0) {
					dx7 = -dx7;
				}
				if (dy7 < 0) {
					dy7 = -dy7;
				}
				proj2 = dx7 + dy7;
				projC12 = edgeAxisX * c12X + edgeAxisY * c12Y + edgeAxisZ * c12Z;
				var sum6 = proj1 + proj2;
				var neg6 = projC12 < 0;
				var abs6 = neg6 ? -projC12 : projC12;
				if (abs6 < sum6) {
					var depth6 = sum6 - abs6;
					if (depth6 < mDepth) {
						mDepth = depth6;
						mId = 6;
						mAxisX = edgeAxisX;
						mAxisY = edgeAxisY;
						mAxisZ = edgeAxisZ;
						mSign = neg6 ? -1 : 1;
					}
				} else {
					return;
				}
			}
			edgeAxisX = x1Y * y2Z - x1Z * y2Y;
			edgeAxisY = x1Z * y2X - x1X * y2Z;
			edgeAxisZ = x1X * y2Y - x1Y * y2X;
			if (!(edgeAxisX == 0 && edgeAxisY == 0 && edgeAxisZ == 0)) {
				var l1 = edgeAxisX * edgeAxisX + edgeAxisY * edgeAxisY + edgeAxisZ * edgeAxisZ;
				if (l1 > 0) {
					l1 = 1 / Math.sqrt(l1);
				}
				edgeAxisX *= l1;
				edgeAxisY *= l1;
				edgeAxisZ *= l1;
				var dx8 = edgeAxisX * sy1X + edgeAxisY * sy1Y + edgeAxisZ * sy1Z;
				var dy8 = edgeAxisX * sz1X + edgeAxisY * sz1Y + edgeAxisZ * sz1Z;
				if (dx8 < 0) {
					dx8 = -dx8;
				}
				if (dy8 < 0) {
					dy8 = -dy8;
				}
				proj1 = dx8 + dy8;
				var dx9 = edgeAxisX * sx2X + edgeAxisY * sx2Y + edgeAxisZ * sx2Z;
				var dy9 = edgeAxisX * sz2X + edgeAxisY * sz2Y + edgeAxisZ * sz2Z;
				if (dx9 < 0) {
					dx9 = -dx9;
				}
				if (dy9 < 0) {
					dy9 = -dy9;
				}
				proj2 = dx9 + dy9;
				projC12 = edgeAxisX * c12X + edgeAxisY * c12Y + edgeAxisZ * c12Z;
				var sum7 = proj1 + proj2;
				var neg7 = projC12 < 0;
				var abs7 = neg7 ? -projC12 : projC12;
				if (abs7 < sum7) {
					var depth7 = sum7 - abs7;
					if (depth7 < mDepth) {
						mDepth = depth7;
						mId = 7;
						mAxisX = edgeAxisX;
						mAxisY = edgeAxisY;
						mAxisZ = edgeAxisZ;
						mSign = neg7 ? -1 : 1;
					}
				} else {
					return;
				}
			}
			edgeAxisX = x1Y * z2Z - x1Z * z2Y;
			edgeAxisY = x1Z * z2X - x1X * z2Z;
			edgeAxisZ = x1X * z2Y - x1Y * z2X;
			if (!(edgeAxisX == 0 && edgeAxisY == 0 && edgeAxisZ == 0)) {
				var l2 = edgeAxisX * edgeAxisX + edgeAxisY * edgeAxisY + edgeAxisZ * edgeAxisZ;
				if (l2 > 0) {
					l2 = 1 / Math.sqrt(l2);
				}
				edgeAxisX *= l2;
				edgeAxisY *= l2;
				edgeAxisZ *= l2;
				var dx10 = edgeAxisX * sy1X + edgeAxisY * sy1Y + edgeAxisZ * sy1Z;
				var dy10 = edgeAxisX * sz1X + edgeAxisY * sz1Y + edgeAxisZ * sz1Z;
				if (dx10 < 0) {
					dx10 = -dx10;
				}
				if (dy10 < 0) {
					dy10 = -dy10;
				}
				proj1 = dx10 + dy10;
				var dx11 = edgeAxisX * sx2X + edgeAxisY * sx2Y + edgeAxisZ * sx2Z;
				var dy11 = edgeAxisX * sy2X + edgeAxisY * sy2Y + edgeAxisZ * sy2Z;
				if (dx11 < 0) {
					dx11 = -dx11;
				}
				if (dy11 < 0) {
					dy11 = -dy11;
				}
				proj2 = dx11 + dy11;
				projC12 = edgeAxisX * c12X + edgeAxisY * c12Y + edgeAxisZ * c12Z;
				var sum8 = proj1 + proj2;
				var neg8 = projC12 < 0;
				var abs8 = neg8 ? -projC12 : projC12;
				if (abs8 < sum8) {
					var depth8 = sum8 - abs8;
					if (depth8 < mDepth) {
						mDepth = depth8;
						mId = 8;
						mAxisX = edgeAxisX;
						mAxisY = edgeAxisY;
						mAxisZ = edgeAxisZ;
						mSign = neg8 ? -1 : 1;
					}
				} else {
					return;
				}
			}
			edgeAxisX = y1Y * x2Z - y1Z * x2Y;
			edgeAxisY = y1Z * x2X - y1X * x2Z;
			edgeAxisZ = y1X * x2Y - y1Y * x2X;
			if (!(edgeAxisX == 0 && edgeAxisY == 0 && edgeAxisZ == 0)) {
				var l3 = edgeAxisX * edgeAxisX + edgeAxisY * edgeAxisY + edgeAxisZ * edgeAxisZ;
				if (l3 > 0) {
					l3 = 1 / Math.sqrt(l3);
				}
				edgeAxisX *= l3;
				edgeAxisY *= l3;
				edgeAxisZ *= l3;
				var dx12 = edgeAxisX * sx1X + edgeAxisY * sx1Y + edgeAxisZ * sx1Z;
				var dy12 = edgeAxisX * sz1X + edgeAxisY * sz1Y + edgeAxisZ * sz1Z;
				if (dx12 < 0) {
					dx12 = -dx12;
				}
				if (dy12 < 0) {
					dy12 = -dy12;
				}
				proj1 = dx12 + dy12;
				var dx13 = edgeAxisX * sy2X + edgeAxisY * sy2Y + edgeAxisZ * sy2Z;
				var dy13 = edgeAxisX * sz2X + edgeAxisY * sz2Y + edgeAxisZ * sz2Z;
				if (dx13 < 0) {
					dx13 = -dx13;
				}
				if (dy13 < 0) {
					dy13 = -dy13;
				}
				proj2 = dx13 + dy13;
				projC12 = edgeAxisX * c12X + edgeAxisY * c12Y + edgeAxisZ * c12Z;
				var sum9 = proj1 + proj2;
				var neg9 = projC12 < 0;
				var abs9 = neg9 ? -projC12 : projC12;
				if (abs9 < sum9) {
					var depth9 = sum9 - abs9;
					if (depth9 < mDepth) {
						mDepth = depth9;
						mId = 9;
						mAxisX = edgeAxisX;
						mAxisY = edgeAxisY;
						mAxisZ = edgeAxisZ;
						mSign = neg9 ? -1 : 1;
					}
				} else {
					return;
				}
			}
			edgeAxisX = y1Y * y2Z - y1Z * y2Y;
			edgeAxisY = y1Z * y2X - y1X * y2Z;
			edgeAxisZ = y1X * y2Y - y1Y * y2X;
			if (!(edgeAxisX == 0 && edgeAxisY == 0 && edgeAxisZ == 0)) {
				var l4 = edgeAxisX * edgeAxisX + edgeAxisY * edgeAxisY + edgeAxisZ * edgeAxisZ;
				if (l4 > 0) {
					l4 = 1 / Math.sqrt(l4);
				}
				edgeAxisX *= l4;
				edgeAxisY *= l4;
				edgeAxisZ *= l4;
				var dx14 = edgeAxisX * sx1X + edgeAxisY * sx1Y + edgeAxisZ * sx1Z;
				var dy14 = edgeAxisX * sz1X + edgeAxisY * sz1Y + edgeAxisZ * sz1Z;
				if (dx14 < 0) {
					dx14 = -dx14;
				}
				if (dy14 < 0) {
					dy14 = -dy14;
				}
				proj1 = dx14 + dy14;
				var dx15 = edgeAxisX * sx2X + edgeAxisY * sx2Y + edgeAxisZ * sx2Z;
				var dy15 = edgeAxisX * sz2X + edgeAxisY * sz2Y + edgeAxisZ * sz2Z;
				if (dx15 < 0) {
					dx15 = -dx15;
				}
				if (dy15 < 0) {
					dy15 = -dy15;
				}
				proj2 = dx15 + dy15;
				projC12 = edgeAxisX * c12X + edgeAxisY * c12Y + edgeAxisZ * c12Z;
				var sum10 = proj1 + proj2;
				var neg10 = projC12 < 0;
				var abs10 = neg10 ? -projC12 : projC12;
				if (abs10 < sum10) {
					var depth10 = sum10 - abs10;
					if (depth10 < mDepth) {
						mDepth = depth10;
						mId = 10;
						mAxisX = edgeAxisX;
						mAxisY = edgeAxisY;
						mAxisZ = edgeAxisZ;
						mSign = neg10 ? -1 : 1;
					}
				} else {
					return;
				}
			}
			edgeAxisX = y1Y * z2Z - y1Z * z2Y;
			edgeAxisY = y1Z * z2X - y1X * z2Z;
			edgeAxisZ = y1X * z2Y - y1Y * z2X;
			if (!(edgeAxisX == 0 && edgeAxisY == 0 && edgeAxisZ == 0)) {
				var l5 = edgeAxisX * edgeAxisX + edgeAxisY * edgeAxisY + edgeAxisZ * edgeAxisZ;
				if (l5 > 0) {
					l5 = 1 / Math.sqrt(l5);
				}
				edgeAxisX *= l5;
				edgeAxisY *= l5;
				edgeAxisZ *= l5;
				var dx16 = edgeAxisX * sx1X + edgeAxisY * sx1Y + edgeAxisZ * sx1Z;
				var dy16 = edgeAxisX * sz1X + edgeAxisY * sz1Y + edgeAxisZ * sz1Z;
				if (dx16 < 0) {
					dx16 = -dx16;
				}
				if (dy16 < 0) {
					dy16 = -dy16;
				}
				proj1 = dx16 + dy16;
				var dx17 = edgeAxisX * sx2X + edgeAxisY * sx2Y + edgeAxisZ * sx2Z;
				var dy17 = edgeAxisX * sy2X + edgeAxisY * sy2Y + edgeAxisZ * sy2Z;
				if (dx17 < 0) {
					dx17 = -dx17;
				}
				if (dy17 < 0) {
					dy17 = -dy17;
				}
				proj2 = dx17 + dy17;
				projC12 = edgeAxisX * c12X + edgeAxisY * c12Y + edgeAxisZ * c12Z;
				var sum11 = proj1 + proj2;
				var neg11 = projC12 < 0;
				var abs11 = neg11 ? -projC12 : projC12;
				if (abs11 < sum11) {
					var depth11 = sum11 - abs11;
					if (depth11 < mDepth) {
						mDepth = depth11;
						mId = 11;
						mAxisX = edgeAxisX;
						mAxisY = edgeAxisY;
						mAxisZ = edgeAxisZ;
						mSign = neg11 ? -1 : 1;
					}
				} else {
					return;
				}
			}
			edgeAxisX = z1Y * x2Z - z1Z * x2Y;
			edgeAxisY = z1Z * x2X - z1X * x2Z;
			edgeAxisZ = z1X * x2Y - z1Y * x2X;
			if (!(edgeAxisX == 0 && edgeAxisY == 0 && edgeAxisZ == 0)) {
				var l6 = edgeAxisX * edgeAxisX + edgeAxisY * edgeAxisY + edgeAxisZ * edgeAxisZ;
				if (l6 > 0) {
					l6 = 1 / Math.sqrt(l6);
				}
				edgeAxisX *= l6;
				edgeAxisY *= l6;
				edgeAxisZ *= l6;
				var dx18 = edgeAxisX * sx1X + edgeAxisY * sx1Y + edgeAxisZ * sx1Z;
				var dy18 = edgeAxisX * sy1X + edgeAxisY * sy1Y + edgeAxisZ * sy1Z;
				if (dx18 < 0) {
					dx18 = -dx18;
				}
				if (dy18 < 0) {
					dy18 = -dy18;
				}
				proj1 = dx18 + dy18;
				var dx19 = edgeAxisX * sy2X + edgeAxisY * sy2Y + edgeAxisZ * sy2Z;
				var dy19 = edgeAxisX * sz2X + edgeAxisY * sz2Y + edgeAxisZ * sz2Z;
				if (dx19 < 0) {
					dx19 = -dx19;
				}
				if (dy19 < 0) {
					dy19 = -dy19;
				}
				proj2 = dx19 + dy19;
				projC12 = edgeAxisX * c12X + edgeAxisY * c12Y + edgeAxisZ * c12Z;
				var sum12 = proj1 + proj2;
				var neg12 = projC12 < 0;
				var abs12 = neg12 ? -projC12 : projC12;
				if (abs12 < sum12) {
					var depth12 = sum12 - abs12;
					if (depth12 < mDepth) {
						mDepth = depth12;
						mId = 12;
						mAxisX = edgeAxisX;
						mAxisY = edgeAxisY;
						mAxisZ = edgeAxisZ;
						mSign = neg12 ? -1 : 1;
					}
				} else {
					return;
				}
			}
			edgeAxisX = z1Y * y2Z - z1Z * y2Y;
			edgeAxisY = z1Z * y2X - z1X * y2Z;
			edgeAxisZ = z1X * y2Y - z1Y * y2X;
			if (!(edgeAxisX == 0 && edgeAxisY == 0 && edgeAxisZ == 0)) {
				var l7 = edgeAxisX * edgeAxisX + edgeAxisY * edgeAxisY + edgeAxisZ * edgeAxisZ;
				if (l7 > 0) {
					l7 = 1 / Math.sqrt(l7);
				}
				edgeAxisX *= l7;
				edgeAxisY *= l7;
				edgeAxisZ *= l7;
				var dx20 = edgeAxisX * sx1X + edgeAxisY * sx1Y + edgeAxisZ * sx1Z;
				var dy20 = edgeAxisX * sy1X + edgeAxisY * sy1Y + edgeAxisZ * sy1Z;
				if (dx20 < 0) {
					dx20 = -dx20;
				}
				if (dy20 < 0) {
					dy20 = -dy20;
				}
				proj1 = dx20 + dy20;
				var dx21 = edgeAxisX * sx2X + edgeAxisY * sx2Y + edgeAxisZ * sx2Z;
				var dy21 = edgeAxisX * sz2X + edgeAxisY * sz2Y + edgeAxisZ * sz2Z;
				if (dx21 < 0) {
					dx21 = -dx21;
				}
				if (dy21 < 0) {
					dy21 = -dy21;
				}
				proj2 = dx21 + dy21;
				projC12 = edgeAxisX * c12X + edgeAxisY * c12Y + edgeAxisZ * c12Z;
				var sum13 = proj1 + proj2;
				var neg13 = projC12 < 0;
				var abs13 = neg13 ? -projC12 : projC12;
				if (abs13 < sum13) {
					var depth13 = sum13 - abs13;
					if (depth13 < mDepth) {
						mDepth = depth13;
						mId = 13;
						mAxisX = edgeAxisX;
						mAxisY = edgeAxisY;
						mAxisZ = edgeAxisZ;
						mSign = neg13 ? -1 : 1;
					}
				} else {
					return;
				}
			}
			edgeAxisX = z1Y * z2Z - z1Z * z2Y;
			edgeAxisY = z1Z * z2X - z1X * z2Z;
			edgeAxisZ = z1X * z2Y - z1Y * z2X;
			if (!(edgeAxisX == 0 && edgeAxisY == 0 && edgeAxisZ == 0)) {
				var l8 = edgeAxisX * edgeAxisX + edgeAxisY * edgeAxisY + edgeAxisZ * edgeAxisZ;
				if (l8 > 0) {
					l8 = 1 / Math.sqrt(l8);
				}
				edgeAxisX *= l8;
				edgeAxisY *= l8;
				edgeAxisZ *= l8;
				var dx22 = edgeAxisX * sx1X + edgeAxisY * sx1Y + edgeAxisZ * sx1Z;
				var dy22 = edgeAxisX * sy1X + edgeAxisY * sy1Y + edgeAxisZ * sy1Z;
				if (dx22 < 0) {
					dx22 = -dx22;
				}
				if (dy22 < 0) {
					dy22 = -dy22;
				}
				proj1 = dx22 + dy22;
				var dx23 = edgeAxisX * sx2X + edgeAxisY * sx2Y + edgeAxisZ * sx2Z;
				var dy23 = edgeAxisX * sy2X + edgeAxisY * sy2Y + edgeAxisZ * sy2Z;
				if (dx23 < 0) {
					dx23 = -dx23;
				}
				if (dy23 < 0) {
					dy23 = -dy23;
				}
				proj2 = dx23 + dy23;
				projC12 = edgeAxisX * c12X + edgeAxisY * c12Y + edgeAxisZ * c12Z;
				var sum14 = proj1 + proj2;
				var neg14 = projC12 < 0;
				var abs14 = neg14 ? -projC12 : projC12;
				if (abs14 < sum14) {
					var depth14 = sum14 - abs14;
					if (depth14 < mDepth) {
						mDepth = depth14;
						mId = 14;
						mAxisX = edgeAxisX;
						mAxisY = edgeAxisY;
						mAxisZ = edgeAxisZ;
						mSign = neg14 ? -1 : 1;
					}
				} else {
					return;
				}
			}
			if (mId >= 6) {
				mAxisX *= mSign;
				mAxisY *= mSign;
				mAxisZ *= mSign;
				var id1 = (mId - 6) / 3 | 0;
				var id2 = mId - 6 - id1 * 3;
				var p1;
				var p1X;
				var p1Y;
				var p1Z;
				var p2;
				var p2X;
				var p2Y;
				var p2Z;
				var d11;
				var d1X;
				var d1Y;
				var d1Z;
				var d21;
				var d2X;
				var d2Y;
				var d2Z;
				switch (id1) {
					case 0:
						d1X = x1X;
						d1Y = x1Y;
						d1Z = x1Z;
						var signX = sy1X * mAxisX + sy1Y * mAxisY + sy1Z * mAxisZ > 0;
						var signY = sz1X * mAxisX + sz1Y * mAxisY + sz1Z * mAxisZ > 0;
						if (signX) {
							if (signY) {
								p1X = sy1X + sz1X;
								p1Y = sy1Y + sz1Y;
								p1Z = sy1Z + sz1Z;
							} else {
								p1X = sy1X - sz1X;
								p1Y = sy1Y - sz1Y;
								p1Z = sy1Z - sz1Z;
							}
						} else if (signY) {
							p1X = sz1X - sy1X;
							p1Y = sz1Y - sy1Y;
							p1Z = sz1Z - sy1Z;
						} else {
							p1X = sy1X + sz1X;
							p1Y = sy1Y + sz1Y;
							p1Z = sy1Z + sz1Z;
							p1X = -p1X;
							p1Y = -p1Y;
							p1Z = -p1Z;
						}
						break;
					case 1:
						d1X = y1X;
						d1Y = y1Y;
						d1Z = y1Z;
						var signX1 = sx1X * mAxisX + sx1Y * mAxisY + sx1Z * mAxisZ > 0;
						var signY1 = sz1X * mAxisX + sz1Y * mAxisY + sz1Z * mAxisZ > 0;
						if (signX1) {
							if (signY1) {
								p1X = sx1X + sz1X;
								p1Y = sx1Y + sz1Y;
								p1Z = sx1Z + sz1Z;
							} else {
								p1X = sx1X - sz1X;
								p1Y = sx1Y - sz1Y;
								p1Z = sx1Z - sz1Z;
							}
						} else if (signY1) {
							p1X = sz1X - sx1X;
							p1Y = sz1Y - sx1Y;
							p1Z = sz1Z - sx1Z;
						} else {
							p1X = sx1X + sz1X;
							p1Y = sx1Y + sz1Y;
							p1Z = sx1Z + sz1Z;
							p1X = -p1X;
							p1Y = -p1Y;
							p1Z = -p1Z;
						}
						break;
					default:
						d1X = z1X;
						d1Y = z1Y;
						d1Z = z1Z;
						var signX2 = sx1X * mAxisX + sx1Y * mAxisY + sx1Z * mAxisZ > 0;
						var signY2 = sy1X * mAxisX + sy1Y * mAxisY + sy1Z * mAxisZ > 0;
						if (signX2) {
							if (signY2) {
								p1X = sx1X + sy1X;
								p1Y = sx1Y + sy1Y;
								p1Z = sx1Z + sy1Z;
							} else {
								p1X = sx1X - sy1X;
								p1Y = sx1Y - sy1Y;
								p1Z = sx1Z - sy1Z;
							}
						} else if (signY2) {
							p1X = sy1X - sx1X;
							p1Y = sy1Y - sx1Y;
							p1Z = sy1Z - sx1Z;
						} else {
							p1X = sx1X + sy1X;
							p1Y = sx1Y + sy1Y;
							p1Z = sx1Z + sy1Z;
							p1X = -p1X;
							p1Y = -p1Y;
							p1Z = -p1Z;
						}
				}
				p1X = c1X + p1X;
				p1Y = c1Y + p1Y;
				p1Z = c1Z + p1Z;
				switch (id2) {
					case 0:
						d2X = x2X;
						d2Y = x2Y;
						d2Z = x2Z;
						var signX3 = sy2X * mAxisX + sy2Y * mAxisY + sy2Z * mAxisZ > 0;
						var signY3 = sz2X * mAxisX + sz2Y * mAxisY + sz2Z * mAxisZ > 0;
						if (signX3) {
							if (signY3) {
								p2X = sy2X + sz2X;
								p2Y = sy2Y + sz2Y;
								p2Z = sy2Z + sz2Z;
							} else {
								p2X = sy2X - sz2X;
								p2Y = sy2Y - sz2Y;
								p2Z = sy2Z - sz2Z;
							}
						} else if (signY3) {
							p2X = sz2X - sy2X;
							p2Y = sz2Y - sy2Y;
							p2Z = sz2Z - sy2Z;
						} else {
							p2X = sy2X + sz2X;
							p2Y = sy2Y + sz2Y;
							p2Z = sy2Z + sz2Z;
							p2X = -p2X;
							p2Y = -p2Y;
							p2Z = -p2Z;
						}
						break;
					case 1:
						d2X = y2X;
						d2Y = y2Y;
						d2Z = y2Z;
						var signX4 = sx2X * mAxisX + sx2Y * mAxisY + sx2Z * mAxisZ > 0;
						var signY4 = sz2X * mAxisX + sz2Y * mAxisY + sz2Z * mAxisZ > 0;
						if (signX4) {
							if (signY4) {
								p2X = sx2X + sz2X;
								p2Y = sx2Y + sz2Y;
								p2Z = sx2Z + sz2Z;
							} else {
								p2X = sx2X - sz2X;
								p2Y = sx2Y - sz2Y;
								p2Z = sx2Z - sz2Z;
							}
						} else if (signY4) {
							p2X = sz2X - sx2X;
							p2Y = sz2Y - sx2Y;
							p2Z = sz2Z - sx2Z;
						} else {
							p2X = sx2X + sz2X;
							p2Y = sx2Y + sz2Y;
							p2Z = sx2Z + sz2Z;
							p2X = -p2X;
							p2Y = -p2Y;
							p2Z = -p2Z;
						}
						break;
					default:
						d2X = z2X;
						d2Y = z2Y;
						d2Z = z2Z;
						var signX5 = sx2X * mAxisX + sx2Y * mAxisY + sx2Z * mAxisZ > 0;
						var signY5 = sy2X * mAxisX + sy2Y * mAxisY + sy2Z * mAxisZ > 0;
						if (signX5) {
							if (signY5) {
								p2X = sx2X + sy2X;
								p2Y = sx2Y + sy2Y;
								p2Z = sx2Z + sy2Z;
							} else {
								p2X = sx2X - sy2X;
								p2Y = sx2Y - sy2Y;
								p2Z = sx2Z - sy2Z;
							}
						} else if (signY5) {
							p2X = sy2X - sx2X;
							p2Y = sy2Y - sx2Y;
							p2Z = sy2Z - sx2Z;
						} else {
							p2X = sx2X + sy2X;
							p2Y = sx2Y + sy2Y;
							p2Z = sx2Z + sy2Z;
							p2X = -p2X;
							p2Y = -p2Y;
							p2Z = -p2Z;
						}
				}
				p2X = c2X - p2X;
				p2Y = c2Y - p2Y;
				p2Z = c2Z - p2Z;
				var r;
				var rX;
				var rY;
				var rZ;
				rX = p1X - p2X;
				rY = p1Y - p2Y;
				rZ = p1Z - p2Z;
				var dot12 = d1X * d2X + d1Y * d2Y + d1Z * d2Z;
				var dot1r = d1X * rX + d1Y * rY + d1Z * rZ;
				var dot2r = d2X * rX + d2Y * rY + d2Z * rZ;
				var invDet = 1 / (1 - dot12 * dot12);
				var t1 = (dot12 * dot2r - dot1r) * invDet;
				var t2 = (dot2r - dot12 * dot1r) * invDet;
				var cp1;
				var cp1X;
				var cp1Y;
				var cp1Z;
				var cp2;
				var cp2X;
				var cp2Y;
				var cp2Z;
				cp1X = p1X + d1X * t1;
				cp1Y = p1Y + d1Y * t1;
				cp1Z = p1Z + d1Z * t1;
				cp2X = p2X + d2X * t2;
				cp2Y = p2Y + d2Y * t2;
				cp2Z = p2Z + d2Z * t2;
				var normal;
				var normalX;
				var normalY;
				var normalZ;
				normalX = -mAxisX;
				normalY = -mAxisY;
				normalZ = -mAxisZ;
				this.setNormal(result, normalX, normalY, normalZ);
				this.addPoint(result, cp1X, cp1Y, cp1Z, cp2X, cp2Y, cp2Z, mDepth, 4);
				return;
			}
			var tmp;
			var tmpX;
			var tmpY;
			var tmpZ;
			var swapped;
			if (mId >= 3) {
				mSign = -mSign;
				c12X = -c12X;
				c12Y = -c12Y;
				c12Z = -c12Z;
				var tmp1 = b1;
				b1 = b2;
				b2 = tmp1;
				var tmp2 = w1;
				w1 = w2;
				w2 = tmp2;
				var tmp3 = h1;
				h1 = h2;
				h2 = tmp3;
				var tmp4 = d1;
				d1 = d2;
				d2 = tmp4;
				tmpX = c1X;
				tmpY = c1Y;
				tmpZ = c1Z;
				c1X = c2X;
				c1Y = c2Y;
				c1Z = c2Z;
				c2X = tmpX;
				c2Y = tmpY;
				c2Z = tmpZ;
				tmpX = x1X;
				tmpY = x1Y;
				tmpZ = x1Z;
				x1X = x2X;
				x1Y = x2Y;
				x1Z = x2Z;
				x2X = tmpX;
				x2Y = tmpY;
				x2Z = tmpZ;
				tmpX = y1X;
				tmpY = y1Y;
				tmpZ = y1Z;
				y1X = y2X;
				y1Y = y2Y;
				y1Z = y2Z;
				y2X = tmpX;
				y2Y = tmpY;
				y2Z = tmpZ;
				tmpX = z1X;
				tmpY = z1Y;
				tmpZ = z1Z;
				z1X = z2X;
				z1Y = z2Y;
				z1Z = z2Z;
				z2X = tmpX;
				z2Y = tmpY;
				z2Z = tmpZ;
				tmpX = sx1X;
				tmpY = sx1Y;
				tmpZ = sx1Z;
				sx1X = sx2X;
				sx1Y = sx2Y;
				sx1Z = sx2Z;
				sx2X = tmpX;
				sx2Y = tmpY;
				sx2Z = tmpZ;
				tmpX = sy1X;
				tmpY = sy1Y;
				tmpZ = sy1Z;
				sy1X = sy2X;
				sy1Y = sy2Y;
				sy1Z = sy2Z;
				sy2X = tmpX;
				sy2Y = tmpY;
				sy2Z = tmpZ;
				tmpX = sz1X;
				tmpY = sz1Y;
				tmpZ = sz1Z;
				sz1X = sz2X;
				sz1Y = sz2Y;
				sz1Z = sz2Z;
				sz2X = tmpX;
				sz2Y = tmpY;
				sz2Z = tmpZ;
				mId -= 3;
				swapped = true;
			} else {
				swapped = false;
			}
			var refCenter;
			var refCenterX;
			var refCenterY;
			var refCenterZ;
			var refNormal;
			var refNormalX;
			var refNormalY;
			var refNormalZ;
			var refX;
			var refXX;
			var refXY;
			var refXZ;
			var refY;
			var refYX;
			var refYY;
			var refYZ;
			var refW;
			var refH;
			switch (mId) {
				case 0:
					refCenterX = sx1X;
					refCenterY = sx1Y;
					refCenterZ = sx1Z;
					refNormalX = x1X;
					refNormalY = x1Y;
					refNormalZ = x1Z;
					refXX = y1X;
					refXY = y1Y;
					refXZ = y1Z;
					refYX = z1X;
					refYY = z1Y;
					refYZ = z1Z;
					refW = h1;
					refH = d1;
					break;
				case 1:
					refCenterX = sy1X;
					refCenterY = sy1Y;
					refCenterZ = sy1Z;
					refNormalX = y1X;
					refNormalY = y1Y;
					refNormalZ = y1Z;
					refXX = z1X;
					refXY = z1Y;
					refXZ = z1Z;
					refYX = x1X;
					refYY = x1Y;
					refYZ = x1Z;
					refW = d1;
					refH = w1;
					break;
				default:
					refCenterX = sz1X;
					refCenterY = sz1Y;
					refCenterZ = sz1Z;
					refNormalX = z1X;
					refNormalY = z1Y;
					refNormalZ = z1Z;
					refXX = x1X;
					refXY = x1Y;
					refXZ = x1Z;
					refYX = y1X;
					refYY = y1Y;
					refYZ = y1Z;
					refW = w1;
					refH = h1;
			}
			if (mSign < 0) {
				refCenterX = -refCenterX;
				refCenterY = -refCenterY;
				refCenterZ = -refCenterZ;
				refNormalX = -refNormalX;
				refNormalY = -refNormalY;
				refNormalZ = -refNormalZ;
				tmpX = refXX;
				tmpY = refXY;
				tmpZ = refXZ;
				refXX = refYX;
				refXY = refYY;
				refXZ = refYZ;
				refYX = tmpX;
				refYY = tmpY;
				refYZ = tmpZ;
				var tmp5 = refW;
				refW = refH;
				refH = tmp5;
			}
			refCenterX += c1X;
			refCenterY += c1Y;
			refCenterZ += c1Z;
			var minIncDot = 1;
			var incId = 0;
			var incDot = refNormalX * x2X + refNormalY * x2Y + refNormalZ * x2Z;
			if (incDot < minIncDot) {
				minIncDot = incDot;
				incId = 0;
			}
			if (-incDot < minIncDot) {
				minIncDot = -incDot;
				incId = 1;
			}
			incDot = refNormalX * y2X + refNormalY * y2Y + refNormalZ * y2Z;
			if (incDot < minIncDot) {
				minIncDot = incDot;
				incId = 2;
			}
			if (-incDot < minIncDot) {
				minIncDot = -incDot;
				incId = 3;
			}
			incDot = refNormalX * z2X + refNormalY * z2Y + refNormalZ * z2Z;
			if (incDot < minIncDot) {
				minIncDot = incDot;
				incId = 4;
			}
			if (-incDot < minIncDot) {
				minIncDot = -incDot;
				incId = 5;
			}
			var incV1;
			var incV1X;
			var incV1Y;
			var incV1Z;
			var incV2;
			var incV2X;
			var incV2Y;
			var incV2Z;
			var incV3;
			var incV3X;
			var incV3Y;
			var incV3Z;
			var incV4;
			var incV4X;
			var incV4Y;
			var incV4Z;
			switch (incId) {
				case 0:
					incV1X = sx2X + sy2X;
					incV1Y = sx2Y + sy2Y;
					incV1Z = sx2Z + sy2Z;
					incV1X += sz2X;
					incV1Y += sz2Y;
					incV1Z += sz2Z;
					incV2X = sx2X - sy2X;
					incV2Y = sx2Y - sy2Y;
					incV2Z = sx2Z - sy2Z;
					incV2X += sz2X;
					incV2Y += sz2Y;
					incV2Z += sz2Z;
					incV3X = sx2X - sy2X;
					incV3Y = sx2Y - sy2Y;
					incV3Z = sx2Z - sy2Z;
					incV3X -= sz2X;
					incV3Y -= sz2Y;
					incV3Z -= sz2Z;
					incV4X = sx2X + sy2X;
					incV4Y = sx2Y + sy2Y;
					incV4Z = sx2Z + sy2Z;
					incV4X -= sz2X;
					incV4Y -= sz2Y;
					incV4Z -= sz2Z;
					break;
				case 1:
					incV1X = sy2X - sx2X;
					incV1Y = sy2Y - sx2Y;
					incV1Z = sy2Z - sx2Z;
					incV1X += sz2X;
					incV1Y += sz2Y;
					incV1Z += sz2Z;
					incV2X = sy2X - sx2X;
					incV2Y = sy2Y - sx2Y;
					incV2Z = sy2Z - sx2Z;
					incV2X -= sz2X;
					incV2Y -= sz2Y;
					incV2Z -= sz2Z;
					incV3X = sx2X + sy2X;
					incV3Y = sx2Y + sy2Y;
					incV3Z = sx2Z + sy2Z;
					incV3X = -incV3X;
					incV3Y = -incV3Y;
					incV3Z = -incV3Z;
					incV3X -= sz2X;
					incV3Y -= sz2Y;
					incV3Z -= sz2Z;
					incV4X = sx2X + sy2X;
					incV4Y = sx2Y + sy2Y;
					incV4Z = sx2Z + sy2Z;
					incV4X = -incV4X;
					incV4Y = -incV4Y;
					incV4Z = -incV4Z;
					incV4X += sz2X;
					incV4Y += sz2Y;
					incV4Z += sz2Z;
					break;
				case 2:
					incV1X = sx2X + sy2X;
					incV1Y = sx2Y + sy2Y;
					incV1Z = sx2Z + sy2Z;
					incV1X += sz2X;
					incV1Y += sz2Y;
					incV1Z += sz2Z;
					incV2X = sx2X + sy2X;
					incV2Y = sx2Y + sy2Y;
					incV2Z = sx2Z + sy2Z;
					incV2X -= sz2X;
					incV2Y -= sz2Y;
					incV2Z -= sz2Z;
					incV3X = sy2X - sx2X;
					incV3Y = sy2Y - sx2Y;
					incV3Z = sy2Z - sx2Z;
					incV3X -= sz2X;
					incV3Y -= sz2Y;
					incV3Z -= sz2Z;
					incV4X = sy2X - sx2X;
					incV4Y = sy2Y - sx2Y;
					incV4Z = sy2Z - sx2Z;
					incV4X += sz2X;
					incV4Y += sz2Y;
					incV4Z += sz2Z;
					break;
				case 3:
					incV1X = sx2X - sy2X;
					incV1Y = sx2Y - sy2Y;
					incV1Z = sx2Z - sy2Z;
					incV1X += sz2X;
					incV1Y += sz2Y;
					incV1Z += sz2Z;
					incV2X = sx2X + sy2X;
					incV2Y = sx2Y + sy2Y;
					incV2Z = sx2Z + sy2Z;
					incV2X = -incV2X;
					incV2Y = -incV2Y;
					incV2Z = -incV2Z;
					incV2X += sz2X;
					incV2Y += sz2Y;
					incV2Z += sz2Z;
					incV3X = sx2X + sy2X;
					incV3Y = sx2Y + sy2Y;
					incV3Z = sx2Z + sy2Z;
					incV3X = -incV3X;
					incV3Y = -incV3Y;
					incV3Z = -incV3Z;
					incV3X -= sz2X;
					incV3Y -= sz2Y;
					incV3Z -= sz2Z;
					incV4X = sx2X - sy2X;
					incV4Y = sx2Y - sy2Y;
					incV4Z = sx2Z - sy2Z;
					incV4X -= sz2X;
					incV4Y -= sz2Y;
					incV4Z -= sz2Z;
					break;
				case 4:
					incV1X = sx2X + sy2X;
					incV1Y = sx2Y + sy2Y;
					incV1Z = sx2Z + sy2Z;
					incV1X += sz2X;
					incV1Y += sz2Y;
					incV1Z += sz2Z;
					incV2X = sy2X - sx2X;
					incV2Y = sy2Y - sx2Y;
					incV2Z = sy2Z - sx2Z;
					incV2X += sz2X;
					incV2Y += sz2Y;
					incV2Z += sz2Z;
					incV3X = sx2X + sy2X;
					incV3Y = sx2Y + sy2Y;
					incV3Z = sx2Z + sy2Z;
					incV3X = -incV3X;
					incV3Y = -incV3Y;
					incV3Z = -incV3Z;
					incV3X += sz2X;
					incV3Y += sz2Y;
					incV3Z += sz2Z;
					incV4X = sx2X - sy2X;
					incV4Y = sx2Y - sy2Y;
					incV4Z = sx2Z - sy2Z;
					incV4X += sz2X;
					incV4Y += sz2Y;
					incV4Z += sz2Z;
					break;
				default:
					incV1X = sx2X + sy2X;
					incV1Y = sx2Y + sy2Y;
					incV1Z = sx2Z + sy2Z;
					incV1X -= sz2X;
					incV1Y -= sz2Y;
					incV1Z -= sz2Z;
					incV2X = sx2X - sy2X;
					incV2Y = sx2Y - sy2Y;
					incV2Z = sx2Z - sy2Z;
					incV2X -= sz2X;
					incV2Y -= sz2Y;
					incV2Z -= sz2Z;
					incV3X = sx2X + sy2X;
					incV3Y = sx2Y + sy2Y;
					incV3Z = sx2Z + sy2Z;
					incV3X = -incV3X;
					incV3Y = -incV3Y;
					incV3Z = -incV3Z;
					incV3X -= sz2X;
					incV3Y -= sz2Y;
					incV3Z -= sz2Z;
					incV4X = sy2X - sx2X;
					incV4Y = sy2Y - sx2Y;
					incV4Z = sy2Z - sx2Z;
					incV4X -= sz2X;
					incV4Y -= sz2Y;
					incV4Z -= sz2Z;
			}
			incV1X += c12X;
			incV1Y += c12Y;
			incV1Z += c12Z;
			incV2X += c12X;
			incV2Y += c12Y;
			incV2Z += c12Z;
			incV3X += c12X;
			incV3Y += c12Y;
			incV3Z += c12Z;
			incV4X += c12X;
			incV4Y += c12Y;
			incV4Z += c12Z;
			var _this = this.clipper;
			_this.w = refW;
			_this.h = refH;
			_this.numVertices = 0;
			_this.numTmpVertices = 0;
			var _this1 = this.clipper;
			var _this2 = _this1.vertices[_this1.numVertices++];
			_this2[0] = incV1X * refXX + incV1Y * refXY + incV1Z * refXZ;
			_this2[1] = incV1X * refYX + incV1Y * refYY + incV1Z * refYZ;
			_this2.wx = incV1X;
			_this2.wy = incV1Y;
			_this2.wz = incV1Z;
			var _this3 = this.clipper;
			var _this4 = _this3.vertices[_this3.numVertices++];
			_this4[0] = incV2X * refXX + incV2Y * refXY + incV2Z * refXZ;
			_this4[1] = incV2X * refYX + incV2Y * refYY + incV2Z * refYZ;
			_this4.wx = incV2X;
			_this4.wy = incV2Y;
			_this4.wz = incV2Z;
			var _this5 = this.clipper;
			var _this6 = _this5.vertices[_this5.numVertices++];
			_this6[0] = incV3X * refXX + incV3Y * refXY + incV3Z * refXZ;
			_this6[1] = incV3X * refYX + incV3Y * refYY + incV3Z * refYZ;
			_this6.wx = incV3X;
			_this6.wy = incV3Y;
			_this6.wz = incV3Z;
			var _this7 = this.clipper;
			var _this8 = _this7.vertices[_this7.numVertices++];
			_this8[0] = incV4X * refXX + incV4Y * refXY + incV4Z * refXZ;
			_this8[1] = incV4X * refYX + incV4Y * refYY + incV4Z * refYZ;
			_this8.wx = incV4X;
			_this8.wy = incV4Y;
			_this8.wz = incV4Z;
			this.clipper.clip();
			this.clipper.reduce();
			var normal1;
			var normalX1;
			var normalY1;
			var normalZ1;
			if (swapped) {
				normalX1 = refNormalX;
				normalY1 = refNormalY;
				normalZ1 = refNormalZ;
			} else {
				normalX1 = -refNormalX;
				normalY1 = -refNormalY;
				normalZ1 = -refNormalZ;
			}
			this.setNormal(result, normalX1, normalY1, normalZ1);
			var _g1 = 0;
			var _g = this.clipper.numVertices;
			while (_g1 < _g) {
				var i = _g1++;
				var v = this.clipper.vertices[i];
				var clippedVertex;
				var clippedVertexX;
				var clippedVertexY;
				var clippedVertexZ;
				clippedVertexX = v.wx;
				clippedVertexY = v.wy;
				clippedVertexZ = v.wz;
				clippedVertexX += c1X;
				clippedVertexY += c1Y;
				clippedVertexZ += c1Z;
				var clippedVertexToRefCenter;
				var clippedVertexToRefCenterX;
				var clippedVertexToRefCenterY;
				var clippedVertexToRefCenterZ;
				clippedVertexToRefCenterX = refCenterX - clippedVertexX;
				clippedVertexToRefCenterY = refCenterY - clippedVertexY;
				clippedVertexToRefCenterZ = refCenterZ - clippedVertexZ;
				var depth15 = clippedVertexToRefCenterX * refNormalX + clippedVertexToRefCenterY * refNormalY + clippedVertexToRefCenterZ * refNormalZ;
				var clippedVertexOnRefFace;
				var clippedVertexOnRefFaceX;
				var clippedVertexOnRefFaceY;
				var clippedVertexOnRefFaceZ;
				clippedVertexOnRefFaceX = clippedVertexX + refNormalX * depth15;
				clippedVertexOnRefFaceY = clippedVertexY + refNormalY * depth15;
				clippedVertexOnRefFaceZ = clippedVertexZ + refNormalZ * depth15;
				if (depth15 > -pe.common.Setting.contactPersistenceThreshold) {
					if (swapped) {
						this.addPoint(result, clippedVertexX, clippedVertexY, clippedVertexZ, clippedVertexOnRefFaceX, clippedVertexOnRefFaceY, clippedVertexOnRefFaceZ, depth15, i);
					} else {
						this.addPoint(result, clippedVertexOnRefFaceX, clippedVertexOnRefFaceY, clippedVertexOnRefFaceZ, clippedVertexX, clippedVertexY, clippedVertexZ, depth15, i);
					}
				}
			}
		}


		proto.setNormal = function (result, nX, nY, nZ) {
			if (this.swapped) {
				math.vec3_set$(result.normal, -nX, -nY, -nZ)
			}
			else {
				math.vec3_set$(result.normal, nX, nY, nZ);
			}
		}

		proto.addPoint = function (result, pos1X, pos1Y, pos1Z, pos2X, pos2Y, pos2Z, depth, id) {
			var point = result.points[result.numPoints++];
			point.depth = depth;
			point.id = id;
			if (this.swapped) {
				math.vec3_set$(point.position1, pos2X, pos2Y, pos2Z)
				math.vec3_set$(point.position2, pos1X, pos1Y, pos1Z)
			} else {
				math.vec3_set$(point.position1, pos1X, pos1Y, pos1Z)
				math.vec3_set$(point.position2, pos2X, pos2Y, pos2Z)
			}
		}

		proto.detect = function (result, geom1, geom2, transform1, transform2, cachedData) {
			result.numPoints = 0;
			var i1 = result.points.length
			var point;
			while (--i1 > 0) {
				point = result.points[i1];
				math.vec3_zero$(point.position1)
				math.vec3_zero$(point.position2)
				point.depth = 0;
				point.id = 0;
			}

			math.vec3_zero$(result.normal)

			if (this.swapped) {
				this.detectImpl(result, geom2, geom1, transform2, transform1, cachedData);
			} else {
				this.detectImpl(result, geom1, geom2, transform1, transform2, cachedData);
			}

		}

		var BoxBoxDetector = function () {
			collision.narrowphase.detector.Detector.call(this, false);
			this.clipper = new BoxBoxDetector.FaceClipper();
		}


		BoxBoxDetector.FaceClipper = pe.define(function (proto) {
			proto.clip = function () {
				var _g1 = 0;
				var _g = this.numVertices;
				while (_g1 < _g) {
					var i = _g1++;
					var v1 = this.vertices[i];
					var v2 = this.vertices[(i + 1) % this.numVertices];
					var s1 = this.w + v1[0];
					var s2 = this.w + v2[0];
					if (s1 > 0 && s2 > 0) {
						var _this = this.tmpVertices[this.numTmpVertices++];
						_this[0] = v1[0];
						_this[1] = v1[1];
						_this.wx = v1.wx;
						_this.wy = v1.wy;
						_this.wz = v1.wz;
					} else if (s1 > 0 && s2 <= 0) {
						var _this1 = this.tmpVertices[this.numTmpVertices++];
						_this1[0] = v1[0];
						_this1[1] = v1[1];
						_this1.wx = v1.wx;
						_this1.wy = v1.wy;
						_this1.wz = v1.wz;
						var t = s1 / (s1 - s2);
						var _this2 = this.tmpVertices[this.numTmpVertices++];
						_this2[0] = v1[0] + (v2[0] - v1[0]) * t;
						_this2[1] = v1[1] + (v2[1] - v1[1]) * t;
						_this2.wx = v1.wx + (v2.wx - v1.wx) * t;
						_this2.wy = v1.wy + (v2.wy - v1.wy) * t;
						_this2.wz = v1.wz + (v2.wz - v1.wz) * t;
					} else if (s1 <= 0 && s2 > 0) {
						var t1 = s1 / (s1 - s2);
						var _this3 = this.tmpVertices[this.numTmpVertices++];
						_this3[0] = v1[0] + (v2[0] - v1[0]) * t1;
						_this3[1] = v1[1] + (v2[1] - v1[1]) * t1;
						_this3.wx = v1.wx + (v2.wx - v1.wx) * t1;
						_this3.wy = v1.wy + (v2.wy - v1.wy) * t1;
						_this3.wz = v1.wz + (v2.wz - v1.wz) * t1;
					}
				}
				var tmp = this.vertices;
				this.vertices = this.tmpVertices;
				this.tmpVertices = tmp;
				this.numVertices = this.numTmpVertices;
				this.numTmpVertices = 0;
				var _g11 = 0;
				var _g2 = this.numVertices;
				while (_g11 < _g2) {
					var i1 = _g11++;
					var v11 = this.vertices[i1];
					var v21 = this.vertices[(i1 + 1) % this.numVertices];
					var s11 = this.w - v11[0];
					var s21 = this.w - v21[0];
					if (s11 > 0 && s21 > 0) {
						var _this4 = this.tmpVertices[this.numTmpVertices++];
						_this4[0] = v11[0];
						_this4[1] = v11[1];
						_this4.wx = v11.wx;
						_this4.wy = v11.wy;
						_this4.wz = v11.wz;
					} else if (s11 > 0 && s21 <= 0) {
						var _this5 = this.tmpVertices[this.numTmpVertices++];
						_this5[0] = v11[0];
						_this5[1] = v11[1];
						_this5.wx = v11.wx;
						_this5.wy = v11.wy;
						_this5.wz = v11.wz;
						var t2 = s11 / (s11 - s21);
						var _this6 = this.tmpVertices[this.numTmpVertices++];
						_this6[0] = v11[0] + (v21[0] - v11[0]) * t2;
						_this6[1] = v11[1] + (v21[1] - v11[1]) * t2;
						_this6.wx = v11.wx + (v21.wx - v11.wx) * t2;
						_this6.wy = v11.wy + (v21.wy - v11.wy) * t2;
						_this6.wz = v11.wz + (v21.wz - v11.wz) * t2;
					} else if (s11 <= 0 && s21 > 0) {
						var t3 = s11 / (s11 - s21);
						var _this7 = this.tmpVertices[this.numTmpVertices++];
						_this7[0] = v11[0] + (v21[0] - v11[0]) * t3;
						_this7[1] = v11[1] + (v21[1] - v11[1]) * t3;
						_this7.wx = v11.wx + (v21.wx - v11.wx) * t3;
						_this7.wy = v11.wy + (v21.wy - v11.wy) * t3;
						_this7.wz = v11.wz + (v21.wz - v11.wz) * t3;
					}
				}
				var tmp1 = this.vertices;
				this.vertices = this.tmpVertices;
				this.tmpVertices = tmp1;
				this.numVertices = this.numTmpVertices;
				this.numTmpVertices = 0;
				var _g12 = 0;
				var _g3 = this.numVertices;
				while (_g12 < _g3) {
					var i2 = _g12++;
					var v12 = this.vertices[i2];
					var v22 = this.vertices[(i2 + 1) % this.numVertices];
					var s12 = this.h + v12[1];
					var s22 = this.h + v22[1];
					if (s12 > 0 && s22 > 0) {
						var _this8 = this.tmpVertices[this.numTmpVertices++];
						_this8[0] = v12[0];
						_this8[1] = v12[1];
						_this8.wx = v12.wx;
						_this8.wy = v12.wy;
						_this8.wz = v12.wz;
					} else if (s12 > 0 && s22 <= 0) {
						var _this9 = this.tmpVertices[this.numTmpVertices++];
						_this9[0] = v12[0];
						_this9[1] = v12[1];
						_this9.wx = v12.wx;
						_this9.wy = v12.wy;
						_this9.wz = v12.wz;
						var t4 = s12 / (s12 - s22);
						var _this10 = this.tmpVertices[this.numTmpVertices++];
						_this10[0] = v12[0] + (v22[0] - v12[0]) * t4;
						_this10[1] = v12[1] + (v22[1] - v12[1]) * t4;
						_this10.wx = v12.wx + (v22.wx - v12.wx) * t4;
						_this10.wy = v12.wy + (v22.wy - v12.wy) * t4;
						_this10.wz = v12.wz + (v22.wz - v12.wz) * t4;
					} else if (s12 <= 0 && s22 > 0) {
						var t5 = s12 / (s12 - s22);
						var _this11 = this.tmpVertices[this.numTmpVertices++];
						_this11[0] = v12[0] + (v22[0] - v12[0]) * t5;
						_this11[1] = v12[1] + (v22[1] - v12[1]) * t5;
						_this11.wx = v12.wx + (v22.wx - v12.wx) * t5;
						_this11.wy = v12.wy + (v22.wy - v12.wy) * t5;
						_this11.wz = v12.wz + (v22.wz - v12.wz) * t5;
					}
				}
				var tmp2 = this.vertices;
				this.vertices = this.tmpVertices;
				this.tmpVertices = tmp2;
				this.numVertices = this.numTmpVertices;
				this.numTmpVertices = 0;
				var _g13 = 0;
				var _g4 = this.numVertices;
				while (_g13 < _g4) {
					var i3 = _g13++;
					var v13 = this.vertices[i3];
					var v23 = this.vertices[(i3 + 1) % this.numVertices];
					var s13 = this.h - v13[1];
					var s23 = this.h - v23[1];
					if (s13 > 0 && s23 > 0) {
						var _this12 = this.tmpVertices[this.numTmpVertices++];
						_this12[0] = v13[0];
						_this12[1] = v13[1];
						_this12.wx = v13.wx;
						_this12.wy = v13.wy;
						_this12.wz = v13.wz;
					} else if (s13 > 0 && s23 <= 0) {
						var _this13 = this.tmpVertices[this.numTmpVertices++];
						_this13[0] = v13[0];
						_this13[1] = v13[1];
						_this13.wx = v13.wx;
						_this13.wy = v13.wy;
						_this13.wz = v13.wz;
						var t6 = s13 / (s13 - s23);
						var _this14 = this.tmpVertices[this.numTmpVertices++];
						_this14[0] = v13[0] + (v23[0] - v13[0]) * t6;
						_this14[1] = v13[1] + (v23[1] - v13[1]) * t6;
						_this14.wx = v13.wx + (v23.wx - v13.wx) * t6;
						_this14.wy = v13.wy + (v23.wy - v13.wy) * t6;
						_this14.wz = v13.wz + (v23.wz - v13.wz) * t6;
					} else if (s13 <= 0 && s23 > 0) {
						var t7 = s13 / (s13 - s23);
						var _this15 = this.tmpVertices[this.numTmpVertices++];
						_this15[0] = v13[0] + (v23[0] - v13[0]) * t7;
						_this15[1] = v13[1] + (v23[1] - v13[1]) * t7;
						_this15.wx = v13.wx + (v23.wx - v13.wx) * t7;
						_this15.wy = v13.wy + (v23.wy - v13.wy) * t7;
						_this15.wz = v13.wz + (v23.wz - v13.wz) * t7;
					}
				}
				var tmp3 = this.vertices;
				this.vertices = this.tmpVertices;
				this.tmpVertices = tmp3;
				this.numVertices = this.numTmpVertices;
				this.numTmpVertices = 0;
			}

			proto.reduce = function () {
				if (this.numVertices < 4) {
					return;
				}
				var max1 = -1.0 / 0.0;
				var min1 = 1.0 / 0.0;
				var max2 = -1.0 / 0.0;
				var min2 = 1.0 / 0.0;
				var max1V = null;
				var min1V = null;
				var max2V = null;
				var min2V = null;
				var e1x = 1;
				var e1y = 1;
				var e2x = -1;
				var e2y = 1;
				var _g1 = 0;
				var _g = this.numVertices;
				while (_g1 < _g) {
					var i = _g1++;
					var v = this.vertices[i];
					var dot1 = v[0] * e1x + v[1] * e1y;
					var dot2 = v[0] * e2x + v[1] * e2y;
					if (dot1 > max1) {
						max1 = dot1;
						max1V = v;
					}
					if (dot1 < min1) {
						min1 = dot1;
						min1V = v;
					}
					if (dot2 > max2) {
						max2 = dot2;
						max2V = v;
					}
					if (dot2 < min2) {
						min2 = dot2;
						min2V = v;
					}
				}
				var _this = this.tmpVertices[this.numTmpVertices++];
				_this[0] = max1V[0];
				_this[1] = max1V[1];
				_this.wx = max1V.wx;
				_this.wy = max1V.wy;
				_this.wz = max1V.wz;
				var _this1 = this.tmpVertices[this.numTmpVertices++];
				_this1[0] = max2V[0];
				_this1[1] = max2V[1];
				_this1.wx = max2V.wx;
				_this1.wy = max2V.wy;
				_this1.wz = max2V.wz;
				var _this2 = this.tmpVertices[this.numTmpVertices++];
				_this2[0] = min1V[0];
				_this2[1] = min1V[1];
				_this2.wx = min1V.wx;
				_this2.wy = min1V.wy;
				_this2.wz = min1V.wz;
				var _this3 = this.tmpVertices[this.numTmpVertices++];
				_this3[0] = min2V[0];
				_this3[1] = min2V[1];
				_this3.wx = min2V.wx;
				_this3.wy = min2V.wy;
				_this3.wz = min2V.wz;
				var tmp = this.vertices;
				this.vertices = this.tmpVertices;
				this.tmpVertices = tmp;
				this.numVertices = this.numTmpVertices;
				this.numTmpVertices = 0;
			}

			var FaceClipper = function () {
				this.w = 0;
				this.h = 0;
				this.numVertices = 0;
				this.numTmpVertices = 0;
				var this1 = new Array(8);
				this.vertices = this1;
				var this2 = new Array(8);
				this.tmpVertices = this2;
				var _g = 0;
				while (_g < 8) {
					var i = _g++;
					this.vertices[i] = new BoxBoxDetector.IncidentVertex();
					this.tmpVertices[i] = new BoxBoxDetector.IncidentVertex();
				}
			}
			return FaceClipper;
		});


		BoxBoxDetector.IncidentVertex = pe.define(function (proto) {
			return function () {
				this[0] = 0;
				this[1] = 0;
				this.wx = 0;
				this.wy = 0;
				this.wz = 0;
			}
		});




		return BoxBoxDetector;
	});



	collision.narrowphase.detector.CachedDetectorData = pe.define(function (proto) {
		proto._clear = function () {
			if (this._gjkCache != null) {
				this._gjkCache.clear();
			}
		}

		var CachedDetectorData = function () {
		}
		return CachedDetectorData;
	});

	collision.narrowphase.detector.CapsuleCapsuleDetector = pe.define(function (proto) {
		proto.detectImpl = function (result, geom1, geom2, tf1, tf2, cachedData) {
			var c1 = geom1;
			var c2 = geom2;
			result.incremental = false;
			var axis1;
			var axis1X;
			var axis1Y;
			var axis1Z;
			var axis2;
			var axis2X;
			var axis2Y;
			var axis2Z;
			axis1X = tf1._rotation[1];
			axis1Y = tf1._rotation[4];
			axis1Z = tf1._rotation[7];
			axis2X = tf2._rotation[1];
			axis2Y = tf2._rotation[4];
			axis2Z = tf2._rotation[7];
			var hh1 = c1._halfHeight;
			var hh2 = c2._halfHeight;
			var r1 = c1._radius;
			var r2 = c2._radius;
			var p1;
			var p1X;
			var p1Y;
			var p1Z;
			var q1;
			var q1X;
			var q1Y;
			var q1Z;
			var p2;
			var p2X;
			var p2Y;
			var p2Z;
			var q2;
			var q2X;
			var q2Y;
			var q2Z;
			p1X = tf1._position[0] + axis1X * -hh1;
			p1Y = tf1._position[1] + axis1Y * -hh1;
			p1Z = tf1._position[2] + axis1Z * -hh1;
			q1X = tf1._position[0] + axis1X * hh1;
			q1Y = tf1._position[1] + axis1Y * hh1;
			q1Z = tf1._position[2] + axis1Z * hh1;
			p2X = tf2._position[0] + axis2X * -hh2;
			p2Y = tf2._position[1] + axis2Y * -hh2;
			p2Z = tf2._position[2] + axis2Z * -hh2;
			q2X = tf2._position[0] + axis2X * hh2;
			q2Y = tf2._position[1] + axis2Y * hh2;
			q2Z = tf2._position[2] + axis2Z * hh2;
			var p12;
			var p12X;
			var p12Y;
			var p12Z;
			p12X = p1X - p2X;
			p12Y = p1Y - p2Y;
			p12Z = p1Z - p2Z;
			var d1;
			var d1X;
			var d1Y;
			var d1Z;
			var d2;
			var d2X;
			var d2Y;
			var d2Z;
			d1X = q1X - p1X;
			d1Y = q1Y - p1Y;
			d1Z = q1Z - p1Z;
			d2X = q2X - p2X;
			d2Y = q2Y - p2Y;
			d2Z = q2Z - p2Z;
			var p21d1 = -(p12X * d1X + p12Y * d1Y + p12Z * d1Z);
			var p12d2 = p12X * d2X + p12Y * d2Y + p12Z * d2Z;
			var d11 = hh1 * hh1 * 4;
			var d12 = d1X * d2X + d1Y * d2Y + d1Z * d2Z;
			var d22 = hh2 * hh2 * 4;
			var t1;
			var t2;
			if (d11 == 0 && d22 == 0) {
				t1 = 0;
				t2 = 0;
			} else if (d11 == 0) {
				t1 = 0;
				t2 = p12d2;
				if (t2 < 0) {
					t2 = 0;
				} else if (t2 > d22) {
					t2 = 1;
				} else {
					t2 /= d22;
				}
			} else if (d22 == 0) {
				t2 = 0;
				t1 = p21d1;
				if (t1 < 0) {
					t1 = 0;
				} else if (t1 > d11) {
					t1 = 1;
				} else {
					t1 /= d11;
				}
			} else {
				var det = d11 * d22 - d12 * d12;
				if (det == 0) {
					t1 = 0;
				} else {
					t1 = d12 * p12d2 + d22 * p21d1;
					if (t1 < 0) {
						t1 = 0;
					} else if (t1 > det) {
						t1 = 1;
					} else {
						t1 /= det;
					}
				}
				t2 = t1 * d12 + p12d2;
				if (t2 < 0) {
					t2 = 0;
					t1 = p21d1;
					if (t1 < 0) {
						t1 = 0;
					} else if (t1 > d11) {
						t1 = 1;
					} else {
						t1 /= d11;
					}
				} else if (t2 > d22) {
					t2 = 1;
					t1 = d12 + p21d1;
					if (t1 < 0) {
						t1 = 0;
					} else if (t1 > d11) {
						t1 = 1;
					} else {
						t1 /= d11;
					}
				} else {
					t2 /= d22;
				}
			}
			var cp1;
			var cp1X;
			var cp1Y;
			var cp1Z;
			var cp2;
			var cp2X;
			var cp2Y;
			var cp2Z;
			cp1X = p1X + d1X * t1;
			cp1Y = p1Y + d1Y * t1;
			cp1Z = p1Z + d1Z * t1;
			cp2X = p2X + d2X * t2;
			cp2Y = p2Y + d2Y * t2;
			cp2Z = p2Z + d2Z * t2;
			var d;
			var dX;
			var dY;
			var dZ;
			dX = cp1X - cp2X;
			dY = cp1Y - cp2Y;
			dZ = cp1Z - cp2Z;
			var len2 = dX * dX + dY * dY + dZ * dZ;
			if (len2 >= (r1 + r2) * (r1 + r2)) {
				return;
			}
			var len = Math.sqrt(len2);
			var n;
			var nX;
			var nY;
			var nZ;
			if (len > 0) {
				nX = dX * (1 / len);
				nY = dY * (1 / len);
				nZ = dZ * (1 / len);
			} else {
				nX = 1;
				nY = 0;
				nZ = 0;
			}
			this.setNormal(result, nX, nY, nZ);
			var pos1;
			var pos1X;
			var pos1Y;
			var pos1Z;
			var pos2;
			var pos2X;
			var pos2Y;
			var pos2Z;
			pos1X = cp1X + nX * -r1;
			pos1Y = cp1Y + nY * -r1;
			pos1Z = cp1Z + nZ * -r1;
			pos2X = cp2X + nX * r2;
			pos2Y = cp2Y + nY * r2;
			pos2Z = cp2Z + nZ * r2;
			this.addPoint(result, pos1X, pos1Y, pos1Z, pos2X, pos2Y, pos2Z, r1 + r2 - len, 0);
		}

		proto.setNormal = function (result, nX, nY, nZ) {
			if (this.swapped) {
				math.vec3_set$(result.normal, -nX, -nY, -nZ)
			}
			else {
				math.vec3_set$(result.normal, nX, nY, nZ)
			}
		}

		proto.addPoint = function (result, pos1X, pos1Y, pos1Z, pos2X, pos2Y, pos2Z, depth, id) {
			point = result.points[result.numPoints++];
			point.depth = depth;
			point.id = id;
			pos1 = point.position1;
			pos2 = point.position2;
			if (this.swapped) {
				pos1[0] = pos2X;
				pos1[1] = pos2Y;
				pos1[2] = pos2Z;
				pos2[0] = pos1X;
				pos2[1] = pos1Y;
				pos2[2] = pos1Z;
			} else {
				pos1[0] = pos1X;
				pos1[1] = pos1Y;
				pos1[2] = pos1Z;
				pos2[0] = pos2X;
				pos2[1] = pos2Y;
				pos2[2] = pos2Z;
			}
		}

		proto.detect = function (result, geom1, geom2, transform1, transform2, cachedData) {
			result.numPoints = 0;
			i1 = result.points.length
			while (--i1 > 0) {
				point = result.points[i1];
				pos1 = point.position1;
				pos2 = point.position2;
				math.vec3_zero$(pos1)
				math.vec3_zero$(pos2)
				point.depth = 0;
				point.id = 0;
			}

			math.vec3_zero$(result.normal)

			if (this.swapped) {
				this.detectImpl(result, geom2, geom1, transform2, transform1, cachedData);
			} else {
				this.detectImpl(result, geom1, geom2, transform1, transform2, cachedData);
			}

		}

		var CapsuleCapsuleDetector = function () {
			collision.narrowphase.detector.Detector.call(this, false);
		}
		return CapsuleCapsuleDetector;
	});

	collision.narrowphase.detector.GjkEpaDetector = pe.define(function (proto) {
		proto.detectImpl = function (result, geom1, geom2, tf1, tf2, cachedData) {
			var gjkEpa = collision.narrowphase.detector.gjkepa.GjkEpa.instance;
			var g1 = geom1;
			var g2 = geom2;
			var status = gjkEpa.computeClosestPointsImpl(g1, g2, tf1, tf2, pe.common.Setting.enableGJKCaching ? cachedData : null, true);
			result.incremental = true;
			if (status !== collision.narrowphase.detector.gjkepa.GjkEpaResultState.SUCCEEDED) {
				//console.log("GjkEpaDetector.hx:28:", "GJK/EPA failed: status=" + status);
			//	throw new Error("fuck " + status);
				return;
			}
			var margin1 = g1._gjkMargin;
			var margin2 = g2._gjkMargin;
			if (gjkEpa.distance > margin1 + margin2) {
				return;
			}
			var pos1;
			var pos1X;
			var pos1Y;
			var pos1Z;
			var pos2;
			var pos2X;
			var pos2Y;
			var pos2Z;
			var v = gjkEpa.closestPoint1;
			pos1X = v[0];
			pos1Y = v[1];
			pos1Z = v[2];
			var v1 = gjkEpa.closestPoint2;
			pos2X = v1[0];
			pos2Y = v1[1];
			pos2Z = v1[2];
			var normal;
			var normalX;
			var normalY;
			var normalZ;
			normalX = pos1X - pos2X;
			normalY = pos1Y - pos2Y;
			normalZ = pos1Z - pos2Z;
			if (normalX * normalX + normalY * normalY + normalZ * normalZ == 0) {
				return;
			}
			if (gjkEpa.distance < 0) {
				normalX = -normalX;
				normalY = -normalY;
				normalZ = -normalZ;
			}
			var l = normalX * normalX + normalY * normalY + normalZ * normalZ;
			if (l > 0) {
				l = 1 / Math.sqrt(l);
			}
			normalX *= l;
			normalY *= l;
			normalZ *= l;
			this.setNormal(result, normalX, normalY, normalZ);
			pos1X += normalX * -g1._gjkMargin;
			pos1Y += normalY * -g1._gjkMargin;
			pos1Z += normalZ * -g1._gjkMargin;
			pos2X += normalX * g2._gjkMargin;
			pos2Y += normalY * g2._gjkMargin;
			pos2Z += normalZ * g2._gjkMargin;
			this.addPoint(result, pos1X, pos1Y, pos1Z, pos2X, pos2Y, pos2Z, g1._gjkMargin + g2._gjkMargin - gjkEpa.distance, 0);
		}

		proto.setNormal = function (result, nX, nY, nZ) {
			if (this.swapped) {
				math.vec3_set$(result.normal, -nX, -nY, -nZ)
			}
			else {
				math.vec3_set$(result.normal, nX, nY, nZ)
			}
		}

		proto.addPoint = function (result, pos1X, pos1Y, pos1Z, pos2X, pos2Y, pos2Z, depth, id) {
			point = result.points[result.numPoints++];
			point.depth = depth;
			point.id = id;
			pos1 = point.position1;
			pos2 = point.position2;
			if (this.swapped) {
				pos1[0] = pos2X;
				pos1[1] = pos2Y;
				pos1[2] = pos2Z;
				pos2[0] = pos1X;
				pos2[1] = pos1Y;
				pos2[2] = pos1Z;
			} else {
				pos1[0] = pos1X;
				pos1[1] = pos1Y;
				pos1[2] = pos1Z;
				pos2[0] = pos2X;
				pos2[1] = pos2Y;
				pos2[2] = pos2Z;
			}
		}

		proto.detect = function (result, geom1, geom2, transform1, transform2, cachedData) {
			result.numPoints = 0;
			i1 = result.points.length
			while (--i1 > 0) {
				point = result.points[i1];
				pos1 = point.position1;
				pos2 = point.position2;
				math.vec3_zero$(pos1)
				math.vec3_zero$(pos2)
				point.depth = 0;
				point.id = 0;
			}

			math.vec3_zero$(result.normal)

			if (this.swapped) {
				this.detectImpl(result, geom2, geom1, transform2, transform1, cachedData);
			} else {
				this.detectImpl(result, geom1, geom2, transform1, transform2, cachedData);
			}

		}

		var GjkEpaDetector = function () {
			collision.narrowphase.detector.Detector.call(this, false);
		}
		return GjkEpaDetector;
	});

	collision.narrowphase.detector.SphereBoxDetector = pe.define(function (proto) {
		proto.detectImpl = function (result, geom1, geom2, tf1, tf2, cachedData) {
			var s = geom1;
			var b = geom2;
			result.incremental = false;
			var halfExt;
			var halfExtX;
			var halfExtY;
			var halfExtZ;
			var negHalfExt;
			var negHalfExtX;
			var negHalfExtY;
			var negHalfExtZ;
			halfExtX = b._halfExtents[0];
			halfExtY = b._halfExtents[1];
			halfExtZ = b._halfExtents[2];
			negHalfExtX = -halfExtX;
			negHalfExtY = -halfExtY;
			negHalfExtZ = -halfExtZ;
			var r = s._radius;
			var boxToSphere;
			var boxToSphereX;
			var boxToSphereY;
			var boxToSphereZ;
			boxToSphereX = tf1._position[0] - tf2._position[0];
			boxToSphereY = tf1._position[1] - tf2._position[1];
			boxToSphereZ = tf1._position[2] - tf2._position[2];
			var boxToSphereInBox;
			var boxToSphereInBoxX;
			var boxToSphereInBoxY;
			var boxToSphereInBoxZ;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = tf2._rotation[0] * boxToSphereX + tf2._rotation[3] * boxToSphereY + tf2._rotation[6] * boxToSphereZ;
			__tmp__Y = tf2._rotation[1] * boxToSphereX + tf2._rotation[4] * boxToSphereY + tf2._rotation[7] * boxToSphereZ;
			__tmp__Z = tf2._rotation[2] * boxToSphereX + tf2._rotation[5] * boxToSphereY + tf2._rotation[8] * boxToSphereZ;
			boxToSphereInBoxX = __tmp__X;
			boxToSphereInBoxY = __tmp__Y;
			boxToSphereInBoxZ = __tmp__Z;
			var insideBox = negHalfExtX < boxToSphereInBoxX && halfExtX > boxToSphereInBoxX && negHalfExtY < boxToSphereInBoxY && halfExtY > boxToSphereInBoxY && negHalfExtZ < boxToSphereInBoxZ && halfExtZ > boxToSphereInBoxZ;
			if (insideBox) {
				var sphereToBoxSurface;
				var sphereToBoxSurfaceX;
				var sphereToBoxSurfaceY;
				var sphereToBoxSurfaceZ;
				sphereToBoxSurfaceX = boxToSphereInBoxX < 0 ? -boxToSphereInBoxX : boxToSphereInBoxX;
				sphereToBoxSurfaceY = boxToSphereInBoxY < 0 ? -boxToSphereInBoxY : boxToSphereInBoxY;
				sphereToBoxSurfaceZ = boxToSphereInBoxZ < 0 ? -boxToSphereInBoxZ : boxToSphereInBoxZ;
				sphereToBoxSurfaceX = halfExtX - sphereToBoxSurfaceX;
				sphereToBoxSurfaceY = halfExtY - sphereToBoxSurfaceY;
				sphereToBoxSurfaceZ = halfExtZ - sphereToBoxSurfaceZ;
				var normalInBox;
				var normalInBoxX;
				var normalInBoxY;
				var normalInBoxZ;
				var distX = sphereToBoxSurfaceX;
				var distY = sphereToBoxSurfaceY;
				var distZ = sphereToBoxSurfaceZ;
				var depth;
				var projectionMask;
				var projectionMaskX;
				var projectionMaskY;
				var projectionMaskZ;
				if (distX < distY) {
					if (distX < distZ) {
						if (boxToSphereInBoxX > 0) {
							normalInBoxX = 1;
							normalInBoxY = 0;
							normalInBoxZ = 0;
						} else {
							normalInBoxX = -1;
							normalInBoxY = 0;
							normalInBoxZ = 0;
						}
						projectionMaskX = 0;
						projectionMaskY = 1;
						projectionMaskZ = 1;
						depth = distX;
					} else {
						if (boxToSphereInBoxZ > 0) {
							normalInBoxX = 0;
							normalInBoxY = 0;
							normalInBoxZ = 1;
						} else {
							normalInBoxX = 0;
							normalInBoxY = 0;
							normalInBoxZ = -1;
						}
						projectionMaskX = 1;
						projectionMaskY = 1;
						projectionMaskZ = 0;
						depth = distZ;
					}
				} else if (distY < distZ) {
					if (boxToSphereInBoxY > 0) {
						normalInBoxX = 0;
						normalInBoxY = 1;
						normalInBoxZ = 0;
					} else {
						normalInBoxX = 0;
						normalInBoxY = -1;
						normalInBoxZ = 0;
					}
					projectionMaskX = 1;
					projectionMaskY = 0;
					projectionMaskZ = 1;
					depth = distY;
				} else {
					if (boxToSphereInBoxZ > 0) {
						normalInBoxX = 0;
						normalInBoxY = 0;
						normalInBoxZ = 1;
					} else {
						normalInBoxX = 0;
						normalInBoxY = 0;
						normalInBoxZ = -1;
					}
					projectionMaskX = 1;
					projectionMaskY = 1;
					projectionMaskZ = 0;
					depth = distZ;
				}
				var base;
				var baseX;
				var baseY;
				var baseZ;
				baseX = projectionMaskX * boxToSphereInBoxX;
				baseY = projectionMaskY * boxToSphereInBoxY;
				baseZ = projectionMaskZ * boxToSphereInBoxZ;
				var boxToClosestPointInBox;
				var boxToClosestPointInBoxX;
				var boxToClosestPointInBoxY;
				var boxToClosestPointInBoxZ;
				boxToClosestPointInBoxX = normalInBoxX * halfExtX;
				boxToClosestPointInBoxY = normalInBoxY * halfExtY;
				boxToClosestPointInBoxZ = normalInBoxZ * halfExtZ;
				boxToClosestPointInBoxX += baseX;
				boxToClosestPointInBoxY += baseY;
				boxToClosestPointInBoxZ += baseZ;
				var boxToClosestPoint;
				var boxToClosestPointX;
				var boxToClosestPointY;
				var boxToClosestPointZ;
				var normal;
				var normalX;
				var normalY;
				var normalZ;
				var __tmp__X1;
				var __tmp__Y1;
				var __tmp__Z1;
				__tmp__X1 = tf2._rotation[0] * boxToClosestPointInBoxX + tf2._rotation[1] * boxToClosestPointInBoxY + tf2._rotation[2] * boxToClosestPointInBoxZ;
				__tmp__Y1 = tf2._rotation[3] * boxToClosestPointInBoxX + tf2._rotation[4] * boxToClosestPointInBoxY + tf2._rotation[5] * boxToClosestPointInBoxZ;
				__tmp__Z1 = tf2._rotation[6] * boxToClosestPointInBoxX + tf2._rotation[7] * boxToClosestPointInBoxY + tf2._rotation[8] * boxToClosestPointInBoxZ;
				boxToClosestPointX = __tmp__X1;
				boxToClosestPointY = __tmp__Y1;
				boxToClosestPointZ = __tmp__Z1;
				var __tmp__X2;
				var __tmp__Y2;
				var __tmp__Z2;
				__tmp__X2 = tf2._rotation[0] * normalInBoxX + tf2._rotation[1] * normalInBoxY + tf2._rotation[2] * normalInBoxZ;
				__tmp__Y2 = tf2._rotation[3] * normalInBoxX + tf2._rotation[4] * normalInBoxY + tf2._rotation[5] * normalInBoxZ;
				__tmp__Z2 = tf2._rotation[6] * normalInBoxX + tf2._rotation[7] * normalInBoxY + tf2._rotation[8] * normalInBoxZ;
				normalX = __tmp__X2;
				normalY = __tmp__Y2;
				normalZ = __tmp__Z2;
				this.setNormal(result, normalX, normalY, normalZ);
				var pos1;
				var pos1X;
				var pos1Y;
				var pos1Z;
				var pos2;
				var pos2X;
				var pos2Y;
				var pos2Z;
				pos1X = tf1._position[0] + normalX * -r;
				pos1Y = tf1._position[1] + normalY * -r;
				pos1Z = tf1._position[2] + normalZ * -r;
				pos2X = tf2._position[0] + boxToClosestPointX;
				pos2Y = tf2._position[1] + boxToClosestPointY;
				pos2Z = tf2._position[2] + boxToClosestPointZ;
				this.addPoint(result, pos1X, pos1Y, pos1Z, pos2X, pos2Y, pos2Z, depth, 0);
				return;
			}
			var boxToClosestPointInBox1;
			var boxToClosestPointInBoxX1;
			var boxToClosestPointInBoxY1;
			var boxToClosestPointInBoxZ1;
			var eps = 1e-9;
			var epsVec;
			var epsVecX;
			var epsVecY;
			var epsVecZ;
			epsVecX = eps;
			epsVecY = eps;
			epsVecZ = eps;
			halfExtX -= epsVecX;
			halfExtY -= epsVecY;
			halfExtZ -= epsVecZ;
			negHalfExtX += epsVecX;
			negHalfExtY += epsVecY;
			negHalfExtZ += epsVecZ;
			boxToClosestPointInBoxX1 = boxToSphereInBoxX < halfExtX ? boxToSphereInBoxX : halfExtX;
			boxToClosestPointInBoxY1 = boxToSphereInBoxY < halfExtY ? boxToSphereInBoxY : halfExtY;
			boxToClosestPointInBoxZ1 = boxToSphereInBoxZ < halfExtZ ? boxToSphereInBoxZ : halfExtZ;
			boxToClosestPointInBoxX1 = boxToClosestPointInBoxX1 > negHalfExtX ? boxToClosestPointInBoxX1 : negHalfExtX;
			boxToClosestPointInBoxY1 = boxToClosestPointInBoxY1 > negHalfExtY ? boxToClosestPointInBoxY1 : negHalfExtY;
			boxToClosestPointInBoxZ1 = boxToClosestPointInBoxZ1 > negHalfExtZ ? boxToClosestPointInBoxZ1 : negHalfExtZ;
			var closestPointToSphereInBox;
			var closestPointToSphereInBoxX;
			var closestPointToSphereInBoxY;
			var closestPointToSphereInBoxZ;
			closestPointToSphereInBoxX = boxToSphereInBoxX - boxToClosestPointInBoxX1;
			closestPointToSphereInBoxY = boxToSphereInBoxY - boxToClosestPointInBoxY1;
			closestPointToSphereInBoxZ = boxToSphereInBoxZ - boxToClosestPointInBoxZ1;
			var dist = closestPointToSphereInBoxX * closestPointToSphereInBoxX + closestPointToSphereInBoxY * closestPointToSphereInBoxY + closestPointToSphereInBoxZ * closestPointToSphereInBoxZ;
			if (dist >= r * r) {
				return;
			}
			dist = Math.sqrt(dist);
			var boxToClosestPoint1;
			var boxToClosestPointX1;
			var boxToClosestPointY1;
			var boxToClosestPointZ1;
			var closestPointToSphere;
			var closestPointToSphereX;
			var closestPointToSphereY;
			var closestPointToSphereZ;
			var __tmp__X3;
			var __tmp__Y3;
			var __tmp__Z3;
			__tmp__X3 = tf2._rotation[0] * boxToClosestPointInBoxX1 + tf2._rotation[1] * boxToClosestPointInBoxY1 + tf2._rotation[2] * boxToClosestPointInBoxZ1;
			__tmp__Y3 = tf2._rotation[3] * boxToClosestPointInBoxX1 + tf2._rotation[4] * boxToClosestPointInBoxY1 + tf2._rotation[5] * boxToClosestPointInBoxZ1;
			__tmp__Z3 = tf2._rotation[6] * boxToClosestPointInBoxX1 + tf2._rotation[7] * boxToClosestPointInBoxY1 + tf2._rotation[8] * boxToClosestPointInBoxZ1;
			boxToClosestPointX1 = __tmp__X3;
			boxToClosestPointY1 = __tmp__Y3;
			boxToClosestPointZ1 = __tmp__Z3;
			var __tmp__X4;
			var __tmp__Y4;
			var __tmp__Z4;
			__tmp__X4 = tf2._rotation[0] * closestPointToSphereInBoxX + tf2._rotation[1] * closestPointToSphereInBoxY + tf2._rotation[2] * closestPointToSphereInBoxZ;
			__tmp__Y4 = tf2._rotation[3] * closestPointToSphereInBoxX + tf2._rotation[4] * closestPointToSphereInBoxY + tf2._rotation[5] * closestPointToSphereInBoxZ;
			__tmp__Z4 = tf2._rotation[6] * closestPointToSphereInBoxX + tf2._rotation[7] * closestPointToSphereInBoxY + tf2._rotation[8] * closestPointToSphereInBoxZ;
			closestPointToSphereX = __tmp__X4;
			closestPointToSphereY = __tmp__Y4;
			closestPointToSphereZ = __tmp__Z4;
			var normal1;
			var normalX1;
			var normalY1;
			var normalZ1;
			var l = closestPointToSphereX * closestPointToSphereX + closestPointToSphereY * closestPointToSphereY + closestPointToSphereZ * closestPointToSphereZ;
			if (l > 0) {
				l = 1 / Math.sqrt(l);
			}
			normalX1 = closestPointToSphereX * l;
			normalY1 = closestPointToSphereY * l;
			normalZ1 = closestPointToSphereZ * l;
			this.setNormal(result, normalX1, normalY1, normalZ1);
			var pos11;
			var pos1X1;
			var pos1Y1;
			var pos1Z1;
			var pos21;
			var pos2X1;
			var pos2Y1;
			var pos2Z1;
			pos1X1 = tf1._position[0] + normalX1 * -r;
			pos1Y1 = tf1._position[1] + normalY1 * -r;
			pos1Z1 = tf1._position[2] + normalZ1 * -r;
			pos2X1 = tf2._position[0] + boxToClosestPointX1;
			pos2Y1 = tf2._position[1] + boxToClosestPointY1;
			pos2Z1 = tf2._position[2] + boxToClosestPointZ1;
			this.addPoint(result, pos1X1, pos1Y1, pos1Z1, pos2X1, pos2Y1, pos2Z1, r - dist, 0);
		}

		proto.setNormal = function (result, nX, nY, nZ) {
			if (this.swapped) {
				math.vec3_set$(result.normal, -nX, -nY, -nZ)
			}
			else {
				math.vec3_set$(result.normal, nX, nY, nZ)
			}
		}

		proto.addPoint = function (result, pos1X, pos1Y, pos1Z, pos2X, pos2Y, pos2Z, depth, id) {
			point = result.points[result.numPoints++];
			point.depth = depth;
			point.id = id;
			pos1 = point.position1;
			pos2 = point.position2;
			if (this.swapped) {
				pos1[0] = pos2X;
				pos1[1] = pos2Y;
				pos1[2] = pos2Z;
				pos2[0] = pos1X;
				pos2[1] = pos1Y;
				pos2[2] = pos1Z;
			} else {
				pos1[0] = pos1X;
				pos1[1] = pos1Y;
				pos1[2] = pos1Z;
				pos2[0] = pos2X;
				pos2[1] = pos2Y;
				pos2[2] = pos2Z;
			}
		}

		proto.detect = function (result, geom1, geom2, transform1, transform2, cachedData) {
			result.numPoints = 0;
			i1 = result.points.length
			while (--i1 > 0) {
				point = result.points[i1];
				pos1 = point.position1;
				pos2 = point.position2;
				math.vec3_zero$(pos1)
				math.vec3_zero$(pos2)
				point.depth = 0;
				point.id = 0;
			}

			math.vec3_zero$(result.normal)

			if (this.swapped) {
				this.detectImpl(result, geom2, geom1, transform2, transform1, cachedData);
			} else {
				this.detectImpl(result, geom1, geom2, transform1, transform2, cachedData);
			}

		}

		var SphereBoxDetector = function (swapped) {
			collision.narrowphase.detector.Detector.call(this, swapped);
		}
		return SphereBoxDetector;
	});

	collision.narrowphase.detector.SphereCapsuleDetector = pe.define(function (proto) {
		proto.detectImpl = function (result, geom1, geom2, tf1, tf2, cachedData) {
			var s1 = geom1;
			var c2 = geom2;
			result.incremental = false;
			var hh2 = c2._halfHeight;
			var r1 = s1._radius;
			var r2 = c2._radius;
			var axis2;
			var axis2X;
			var axis2Y;
			var axis2Z;
			axis2X = tf2._rotation[1];
			axis2Y = tf2._rotation[4];
			axis2Z = tf2._rotation[7];
			var cp1;
			var cp1X;
			var cp1Y;
			var cp1Z;
			cp1X = tf1._position[0];
			cp1Y = tf1._position[1];
			cp1Z = tf1._position[2];
			var p2;
			var p2X;
			var p2Y;
			var p2Z;
			var q2;
			var q2X;
			var q2Y;
			var q2Z;
			p2X = tf2._position[0] + axis2X * -hh2;
			p2Y = tf2._position[1] + axis2Y * -hh2;
			p2Z = tf2._position[2] + axis2Z * -hh2;
			q2X = tf2._position[0] + axis2X * hh2;
			q2Y = tf2._position[1] + axis2Y * hh2;
			q2Z = tf2._position[2] + axis2Z * hh2;
			var p12;
			var p12X;
			var p12Y;
			var p12Z;
			p12X = cp1X - p2X;
			p12Y = cp1Y - p2Y;
			p12Z = cp1Z - p2Z;
			var d2;
			var d2X;
			var d2Y;
			var d2Z;
			d2X = q2X - p2X;
			d2Y = q2Y - p2Y;
			d2Z = q2Z - p2Z;
			var d22 = hh2 * hh2 * 4;
			var t = p12X * d2X + p12Y * d2Y + p12Z * d2Z;
			if (t < 0) {
				t = 0;
			} else if (t > d22) {
				t = 1;
			} else {
				t /= d22;
			}
			var cp2;
			var cp2X;
			var cp2Y;
			var cp2Z;
			cp2X = p2X + d2X * t;
			cp2Y = p2Y + d2Y * t;
			cp2Z = p2Z + d2Z * t;
			var d;
			var dX;
			var dY;
			var dZ;
			dX = cp1X - cp2X;
			dY = cp1Y - cp2Y;
			dZ = cp1Z - cp2Z;
			var len2 = dX * dX + dY * dY + dZ * dZ;
			if (len2 >= (r1 + r2) * (r1 + r2)) {
				return;
			}
			var len = Math.sqrt(len2);
			var n;
			var nX;
			var nY;
			var nZ;
			if (len > 0) {
				nX = dX * (1 / len);
				nY = dY * (1 / len);
				nZ = dZ * (1 / len);
			} else {
				nX = 1;
				nY = 0;
				nZ = 0;
			}
			this.setNormal(result, nX, nY, nZ);
			var pos1;
			var pos1X;
			var pos1Y;
			var pos1Z;
			var pos2;
			var pos2X;
			var pos2Y;
			var pos2Z;
			pos1X = cp1X + nX * -r1;
			pos1Y = cp1Y + nY * -r1;
			pos1Z = cp1Z + nZ * -r1;
			pos2X = cp2X + nX * r2;
			pos2Y = cp2Y + nY * r2;
			pos2Z = cp2Z + nZ * r2;
			this.addPoint(result, pos1X, pos1Y, pos1Z, pos2X, pos2Y, pos2Z, r1 + r2 - len, 0);
		}

		proto.setNormal = function (result, nX, nY, nZ) {
			if (this.swapped) {
				math.vec3_set(result.normal, -nX, -nY, -nZ)
			}
			else {
				math.vec3_set$(result.normal, nX, nY, nZ)
			}
		}

		proto.addPoint = function (result, pos1X, pos1Y, pos1Z, pos2X, pos2Y, pos2Z, depth, id) {
			point = result.points[result.numPoints++];
			point.depth = depth;
			point.id = id;
			pos1 = point.position1;
			pos2 = point.position2;
			if (this.swapped) {
				pos1[0] = pos2X;
				pos1[1] = pos2Y;
				pos1[2] = pos2Z;
				pos2[0] = pos1X;
				pos2[1] = pos1Y;
				pos2[2] = pos1Z;
			} else {
				pos1[0] = pos1X;
				pos1[1] = pos1Y;
				pos1[2] = pos1Z;
				pos2[0] = pos2X;
				pos2[1] = pos2Y;
				pos2[2] = pos2Z;
			}
		}

		proto.detect = function (result, geom1, geom2, transform1, transform2, cachedData) {
			result.numPoints = 0;
			i1 = result.points.length
			while (--i1 > 0) {
				point = result.points[i1];
				pos1 = point.position1;
				pos2 = point.position2;
				math.vec3_zero$(pos1)
				math.vec3_zero$(pos2)
				point.depth = 0;
				point.id = 0;
			}

			math.vec3_zero$(result.normal)

			if (this.swapped) {
				this.detectImpl(result, geom2, geom1, transform2, transform1, cachedData);
			} else {
				this.detectImpl(result, geom1, geom2, transform1, transform2, cachedData);
			}

		}

		var SphereCapsuleDetector = function (swapped) {
			collision.narrowphase.detector.Detector.call(this, swapped);
		}
		return SphereCapsuleDetector;
	});

	collision.narrowphase.detector.SphereSphereDetector = pe.define(function (proto) {
		proto.detectImpl = function (result, geom1, geom2, tf1, tf2, cachedData) {
			var s1 = geom1;
			var s2 = geom2;
			result.incremental = false;
			var d;
			var dX;
			var dY;
			var dZ;
			dX = tf1._position[0] - tf2._position[0];
			dY = tf1._position[1] - tf2._position[1];
			dZ = tf1._position[2] - tf2._position[2];
			var r1 = s1._radius;
			var r2 = s2._radius;
			var len2 = dX * dX + dY * dY + dZ * dZ;
			if (len2 >= (r1 + r2) * (r1 + r2)) {
				return;
			}
			var len = Math.sqrt(len2);
			var n;
			var nX;
			var nY;
			var nZ;
			if (len > 0) {
				nX = dX * (1 / len);
				nY = dY * (1 / len);
				nZ = dZ * (1 / len);
			} else {
				nX = 1;
				nY = 0;
				nZ = 0;
			}
			this.setNormal(result, nX, nY, nZ);
			var pos1;
			var pos1X;
			var pos1Y;
			var pos1Z;
			var pos2;
			var pos2X;
			var pos2Y;
			var pos2Z;
			pos1X = tf1._position[0] + nX * -r1;
			pos1Y = tf1._position[1] + nY * -r1;
			pos1Z = tf1._position[2] + nZ * -r1;
			pos2X = tf2._position[0] + nX * r2;
			pos2Y = tf2._position[1] + nY * r2;
			pos2Z = tf2._position[2] + nZ * r2;
			this.addPoint(result, pos1X, pos1Y, pos1Z, pos2X, pos2Y, pos2Z, r1 + r2 - len, 0);
		}

		proto.setNormal = function (result, nX, nY, nZ) {
			if (this.swapped) {
				math.vec3_set$(result.normal, -nX, -nY, -nZ)
			}
			else {
				math.vec3_set$(result.normal, nX, nY, nZ)
			}
		}

		proto.addPoint = function (result, pos1X, pos1Y, pos1Z, pos2X, pos2Y, pos2Z, depth, id) {
			point = result.points[result.numPoints++];
			point.depth = depth;
			point.id = id;
			pos1 = point.position1;
			pos2 = point.position2;
			if (this.swapped) {
				pos1[0] = pos2X;
				pos1[1] = pos2Y;
				pos1[2] = pos2Z;
				pos2[0] = pos1X;
				pos2[1] = pos1Y;
				pos2[2] = pos1Z;
			} else {
				pos1[0] = pos1X;
				pos1[1] = pos1Y;
				pos1[2] = pos1Z;
				pos2[0] = pos2X;
				pos2[1] = pos2Y;
				pos2[2] = pos2Z;
			}
		}

		proto.detect = function (result, geom1, geom2, transform1, transform2, cachedData) {
			result.numPoints = 0;
			i1 = result.points.length
			while (--i1 > 0) {
				point = result.points[i1];
				pos1 = point.position1;
				pos2 = point.position2;
				math.vec3_zero$(pos1)
				math.vec3_zero$(pos2)
				point.depth = 0;
				point.id = 0;
			}

			math.vec3_zero$(result.normal)

			if (this.swapped) {
				this.detectImpl(result, geom2, geom1, transform2, transform1, cachedData);
			} else {
				this.detectImpl(result, geom1, geom2, transform1, transform2, cachedData);
			}

		}

		var SphereSphereDetector = function () {
			collision.narrowphase.detector.Detector.call(this, false);
		}
		return SphereSphereDetector;
	});

	collision.narrowphase.detector.gjkepa.EpaPolyhedron = pe.define(function (proto) {
		proto.dumpHoleEdge = function (first) {
		}

		proto.validate = function () {
			var t = this._triangleList;
			while (t != null) {
				var n = t._next;
				var _g = 0;
				while (_g < 3) {
					var i = _g++;
					t._vertices[i]._tmpEdgeLoopOuterTriangle = null;
					t._vertices[i]._tmpEdgeLoopNext = null;
					if (t._adjacentPairIndex[i] == -1) {
						this._status = 2;
						return false;
					}
					if (t._adjacentTriangles[i] == null) {
						this._status = 3;
						return false;
					}
				}
				t = n;
			}
			return true;
		}

		proto.findEdgeLoop = function (id, base, from) {
			if (base._tmpDfsId == id) {
				return;
			}
			base._tmpDfsId = id;
			var _this = base.tmp;
			_this[0] = from[0];
			_this[1] = from[1];
			_this[2] = from[2];
			var _this1 = _this;
			var v = base._vertices[0].v;
			var tx = _this1[0] - v[0];
			var ty = _this1[1] - v[1];
			var tz = _this1[2] - v[2];
			_this1[0] = tx;
			_this1[1] = ty;
			_this1[2] = tz;
			var _this2 = base.tmp;
			var v1 = base._normal;
			base._tmpDfsVisible = _this2[0] * v1[0] + _this2[1] * v1[1] + _this2[2] * v1[2] > 0;
			if (!base._tmpDfsVisible) {
				this._status = 6;
				return;
			}
			var _g = 0;
			while (_g < 3) {
				var i = _g++;
				var t = base._adjacentTriangles[i];
				if (t == null) {
					continue;
				}
				var _this3 = t.tmp;
				_this3[0] = from[0];
				_this3[1] = from[1];
				_this3[2] = from[2];
				var _this4 = _this3;
				var v2 = t._vertices[0].v;
				var tx1 = _this4[0] - v2[0];
				var ty1 = _this4[1] - v2[1];
				var tz1 = _this4[2] - v2[2];
				_this4[0] = tx1;
				_this4[1] = ty1;
				_this4[2] = tz1;
				var _this5 = t.tmp;
				var v3 = t._normal;
				t._tmpDfsVisible = _this5[0] * v3[0] + _this5[1] * v3[1] + _this5[2] * v3[2] > 0;
				if (t._tmpDfsVisible) {
					this.findEdgeLoop(id, t, from);
				} else {
					var i2 = base._nextIndex[i];
					var v11 = base._vertices[i];
					var v21 = base._vertices[i2];
					v11._tmpEdgeLoopNext = v21;
					v11._tmpEdgeLoopOuterTriangle = t;
				}
			}
			var _g1 = 0;
			while (_g1 < 3) {
				var i1 = _g1++;
				var triangle = base._adjacentTriangles[i1];
				if (triangle != null) {
					var pairIndex = base._adjacentPairIndex[i1];
					triangle._adjacentTriangles[pairIndex] = null;
					triangle._adjacentPairIndex[pairIndex] = -1;
					base._adjacentTriangles[i1] = null;
					base._adjacentPairIndex[i1] = -1;
				}
			}
			this._numTriangles--;
			var prev = base._prev;
			var next = base._next;
			if (prev != null) {
				prev._next = next;
			}
			if (next != null) {
				next._prev = prev;
			}
			if (base == this._triangleList) {
				this._triangleList = this._triangleList._next;
			}
			if (base == this._triangleListLast) {
				this._triangleListLast = this._triangleListLast._prev;
			}
			base._next = null;
			base._prev = null;
			base.removeReferences();
			base._next = this._trianglePool;
			this._trianglePool = base;
		}

		proto._init = function (v1, v2, v3, v4) {
			this._status = 0;
			this._numVertices = 4;
			this._vertices[0] = v1;
			this._vertices[1] = v2;
			this._vertices[2] = v3;
			this._vertices[3] = v4;
			var _this = this._center;
			var v = v1.v;
			_this[0] = v[0];
			_this[1] = v[1];
			_this[2] = v[2];
			var _this1 = _this;
			var v5 = v2.v;
			var tx = _this1[0] + v5[0];
			var ty = _this1[1] + v5[1];
			var tz = _this1[2] + v5[2];
			_this1[0] = tx;
			_this1[1] = ty;
			_this1[2] = tz;
			var _this2 = _this1;
			var v6 = v3.v;
			var tx1 = _this2[0] + v6[0];
			var ty1 = _this2[1] + v6[1];
			var tz1 = _this2[2] + v6[2];
			_this2[0] = tx1;
			_this2[1] = ty1;
			_this2[2] = tz1;
			var _this3 = _this2;
			var v7 = v4.v;
			var tx2 = _this3[0] + v7[0];
			var ty2 = _this3[1] + v7[1];
			var tz2 = _this3[2] + v7[2];
			_this3[0] = tx2;
			_this3[1] = ty2;
			_this3[2] = tz2;
			var _this4 = _this3;
			var tx3 = _this4[0] * 0.25;
			var ty3 = _this4[1] * 0.25;
			var tz3 = _this4[2] * 0.25;
			_this4[0] = tx3;
			_this4[1] = ty3;
			_this4[2] = tz3;
			var first = this._trianglePool;
			if (first != null) {
				this._trianglePool = first._next;
				first._next = null;
			} else {
				first = new collision.narrowphase.detector.gjkepa.EpaTriangle();
			}
			var t1 = first;
			var first1 = this._trianglePool;
			if (first1 != null) {
				this._trianglePool = first1._next;
				first1._next = null;
			} else {
				first1 = new collision.narrowphase.detector.gjkepa.EpaTriangle();
			}
			var t2 = first1;
			var first2 = this._trianglePool;
			if (first2 != null) {
				this._trianglePool = first2._next;
				first2._next = null;
			} else {
				first2 = new collision.narrowphase.detector.gjkepa.EpaTriangle();
			}
			var t3 = first2;
			var first3 = this._trianglePool;
			if (first3 != null) {
				this._trianglePool = first3._next;
				first3._next = null;
			} else {
				first3 = new collision.narrowphase.detector.gjkepa.EpaTriangle();
			}
			var t4 = first3;
			if (!t1.init(v1, v2, v3, this._center, true)) {
				this._status = 1;
			}
			if (!t2.init(v1, v2, v4, this._center, true)) {
				this._status = 1;
			}
			if (!t3.init(v1, v3, v4, this._center, true)) {
				this._status = 1;
			}
			if (!t4.init(v2, v3, v4, this._center, true)) {
				this._status = 1;
			}
			if (!t1.setAdjacentTriangle(t2)) {
				this._status = 1;
			}
			if (!t1.setAdjacentTriangle(t3)) {
				this._status = 1;
			}
			if (!t1.setAdjacentTriangle(t4)) {
				this._status = 1;
			}
			if (!t2.setAdjacentTriangle(t3)) {
				this._status = 1;
			}
			if (!t2.setAdjacentTriangle(t4)) {
				this._status = 1;
			}
			if (!t3.setAdjacentTriangle(t4)) {
				this._status = 1;
			}
			this._numTriangles++;
			if (this._triangleList == null) {
				this._triangleList = t1;
				this._triangleListLast = t1;
			} else {
				this._triangleListLast._next = t1;
				t1._prev = this._triangleListLast;
				this._triangleListLast = t1;
			}
			this._numTriangles++;
			if (this._triangleList == null) {
				this._triangleList = t2;
				this._triangleListLast = t2;
			} else {
				this._triangleListLast._next = t2;
				t2._prev = this._triangleListLast;
				this._triangleListLast = t2;
			}
			this._numTriangles++;
			if (this._triangleList == null) {
				this._triangleList = t3;
				this._triangleListLast = t3;
			} else {
				this._triangleListLast._next = t3;
				t3._prev = this._triangleListLast;
				this._triangleListLast = t3;
			}
			this._numTriangles++;
			if (this._triangleList == null) {
				this._triangleList = t4;
				this._triangleListLast = t4;
			} else {
				this._triangleListLast._next = t4;
				t4._prev = this._triangleListLast;
				this._triangleListLast = t4;
			}
			return this._status == 0;
		}

		proto._addVertex = function (vertex, base) {
			this._vertices[this._numVertices++] = vertex;
			var v1 = base._vertices[0];
			this.findEdgeLoop(this._numVertices, base, vertex.v);
			if (this._status != 0) {
				return false;
			}
			var v = v1;
			var firstV = v1;
			var prevT = null;
			var firstT = null;
			while (true) {
				if (v._tmpEdgeLoopNext == null) {
					this._dumpAsObjModel();
					this._status = 4;
					return false;
				}
				if (v._tmpEdgeLoopOuterTriangle == null) {
					this._status = 5;
					return false;
				}
				var first = this._trianglePool;
				if (first != null) {
					this._trianglePool = first._next;
					first._next = null;
				} else {
					first = new collision.narrowphase.detector.gjkepa.EpaTriangle();
				}
				var t = first;
				if (firstT == null) {
					firstT = t;
				}
				if (!t.init(v, v._tmpEdgeLoopNext, vertex, this._center, false)) {
					this._status = 1;
				}
				if (this._status != 0) {
					return false;
				}
				this._numTriangles++;
				if (this._triangleList == null) {
					this._triangleList = t;
					this._triangleListLast = t;
				} else {
					this._triangleListLast._next = t;
					t._prev = this._triangleListLast;
					this._triangleListLast = t;
				}
				if (!t.setAdjacentTriangle(v._tmpEdgeLoopOuterTriangle)) {
					this._status = 1;
				}
				if (prevT != null) {
					if (!t.setAdjacentTriangle(prevT)) {
						this._status = 1;
					}
				}
				prevT = t;
				v = v._tmpEdgeLoopNext;
				if (!(v != firstV)) {
					break;
				}
			}
			if (!prevT.setAdjacentTriangle(firstT)) {
				this._status = 1;
			}
			if (this._status == 0) {
				return this.validate();
			} else {
				return false;
			}
		}

		proto._dumpAsObjModel = function () {
		}

		var EpaPolyhedron = function () {
			var length = pe.common.Setting.maxEPAVertices;
			var this1 = new Array(length);
			this._vertices = this1;
			this._center = vec3();
			this._numVertices = 0;
			this._triangleList = null;
			this._triangleListLast = null;
			this._numTriangles = 0;
			this._trianglePool = null;
			this._vertexPool = null;
		}
		return EpaPolyhedron;
	});

	collision.narrowphase.detector.gjkepa.EpaTriangle = pe.define(function (proto) {
		proto.init = function (vertex1, vertex2, vertex3, center, autoCheck) {
			if (autoCheck == null) {
				autoCheck = false;
			}
			var v1;
			var v1X;
			var v1Y;
			var v1Z;
			var v2;
			var v2X;
			var v2Y;
			var v2Z;
			var v3;
			var v3X;
			var v3Y;
			var v3Z;
			var vc;
			var vcX;
			var vcY;
			var vcZ;
			var v = vertex1.v;
			v1X = v[0];
			v1Y = v[1];
			v1Z = v[2];
			var v4 = vertex2.v;
			v2X = v4[0];
			v2Y = v4[1];
			v2Z = v4[2];
			var v5 = vertex3.v;
			v3X = v5[0];
			v3Y = v5[1];
			v3Z = v5[2];
			var v6 = center;
			vcX = v6[0];
			vcY = v6[1];
			vcZ = v6[2];
			var v12;
			var v12X;
			var v12Y;
			var v12Z;
			var v13;
			var v13X;
			var v13Y;
			var v13Z;
			var vc1;
			var vc1X;
			var vc1Y;
			var vc1Z;
			v12X = v2X - v1X;
			v12Y = v2Y - v1Y;
			v12Z = v2Z - v1Z;
			v13X = v3X - v1X;
			v13Y = v3Y - v1Y;
			v13Z = v3Z - v1Z;
			vc1X = v1X - vcX;
			vc1Y = v1Y - vcY;
			vc1Z = v1Z - vcZ;
			var inor;
			var inorX;
			var inorY;
			var inorZ;
			inorX = v12Y * v13Z - v12Z * v13Y;
			inorY = v12Z * v13X - v12X * v13Z;
			inorZ = v12X * v13Y - v12Y * v13X;
			var inverted = false;
			var d = vc1X * inorX + vc1Y * inorY + vc1Z * inorZ;
			if (d < 0) {
				if (autoCheck) {
					var tmp = vertex2;
					vertex2 = vertex3;
					vertex3 = tmp;
					inorX *= -1;
					inorY *= -1;
					inorZ *= -1;
				} else {
					inverted = true;
				}
			}
			this._vertices[0] = vertex1;
			this._vertices[1] = vertex2;
			this._vertices[2] = vertex3;
			var v7 = this._normal;
			v7[0] = inorX;
			v7[1] = inorY;
			v7[2] = inorZ;
			var vec1 = vertex1.v;
			var vec2 = vertex2.v;
			var vec3 = vertex3.v;
			var out = this.tmp;
			var v11;
			var v1X1;
			var v1Y1;
			var v1Z1;
			var v21;
			var v2X1;
			var v2Y1;
			var v2Z1;
			var v31;
			var v3X1;
			var v3Y1;
			var v3Z1;
			var v121;
			var v12X1;
			var v12Y1;
			var v12Z1;
			var v23;
			var v23X;
			var v23Y;
			var v23Z;
			var v311;
			var v31X;
			var v31Y;
			var v31Z;
			var v8 = vec1;
			v1X1 = v8[0];
			v1Y1 = v8[1];
			v1Z1 = v8[2];
			var v9 = vec2;
			v2X1 = v9[0];
			v2Y1 = v9[1];
			v2Z1 = v9[2];
			var v10 = vec3;
			v3X1 = v10[0];
			v3Y1 = v10[1];
			v3Z1 = v10[2];
			v12X1 = v2X1 - v1X1;
			v12Y1 = v2Y1 - v1Y1;
			v12Z1 = v2Z1 - v1Z1;
			v23X = v3X1 - v2X1;
			v23Y = v3Y1 - v2Y1;
			v23Z = v3Z1 - v2Z1;
			v31X = v1X1 - v3X1;
			v31Y = v1Y1 - v3Y1;
			v31Z = v1Z1 - v3Z1;
			var n;
			var nX;
			var nY;
			var nZ;
			nX = v12Y1 * v23Z - v12Z1 * v23Y;
			nY = v12Z1 * v23X - v12X1 * v23Z;
			nZ = v12X1 * v23Y - v12Y1 * v23X;
			var n12;
			var n12X;
			var n12Y;
			var n12Z;
			var n23;
			var n23X;
			var n23Y;
			var n23Z;
			var n31;
			var n31X;
			var n31Y;
			var n31Z;
			n12X = v12Y1 * nZ - v12Z1 * nY;
			n12Y = v12Z1 * nX - v12X1 * nZ;
			n12Z = v12X1 * nY - v12Y1 * nX;
			n23X = v23Y * nZ - v23Z * nY;
			n23Y = v23Z * nX - v23X * nZ;
			n23Z = v23X * nY - v23Y * nX;
			n31X = v31Y * nZ - v31Z * nY;
			n31Y = v31Z * nX - v31X * nZ;
			n31Z = v31X * nY - v31Y * nX;
			var d12 = v1X1 * n12X + v1Y1 * n12Y + v1Z1 * n12Z;
			var d23 = v2X1 * n23X + v2Y1 * n23Y + v2Z1 * n23Z;
			var d31 = v3X1 * n31X + v3Y1 * n31Y + v3Z1 * n31Z;
			var mind = -1;
			var minv;
			var minvX;
			var minvY;
			var minvZ;
			var mini = 0;
			minvX = 0;
			minvY = 0;
			minvZ = 0;
			if (d12 < 0) {
				var v14;
				var v1X2;
				var v1Y2;
				var v1Z2;
				var v22;
				var v2X2;
				var v2Y2;
				var v2Z2;
				var v15 = vec1;
				v1X2 = v15[0];
				v1Y2 = v15[1];
				v1Z2 = v15[2];
				var v16 = vec2;
				v2X2 = v16[0];
				v2Y2 = v16[1];
				v2Z2 = v16[2];
				var v122;
				var v12X2;
				var v12Y2;
				var v12Z2;
				v12X2 = v2X2 - v1X2;
				v12Y2 = v2Y2 - v1Y2;
				v12Z2 = v2Z2 - v1Z2;
				var d1 = v12X2 * v12X2 + v12Y2 * v12Y2 + v12Z2 * v12Z2;
				var t = v12X2 * v1X2 + v12Y2 * v1Y2 + v12Z2 * v1Z2;
				t = -t / d1;
				var b;
				if (t < 0) {
					var v17 = out;
					v17[0] = v1X2;
					v17[1] = v1Y2;
					v17[2] = v1Z2;
					b = 1;
				} else if (t > 1) {
					var v18 = out;
					v18[0] = v2X2;
					v18[1] = v2Y2;
					v18[2] = v2Z2;
					b = 2;
				} else {
					var p;
					var pX;
					var pY;
					var pZ;
					pX = v1X2 + v12X2 * t;
					pY = v1Y2 + v12Y2 * t;
					pZ = v1Z2 + v12Z2 * t;
					var v19 = out;
					v19[0] = pX;
					v19[1] = pY;
					v19[2] = pZ;
					b = 3;
				}
				var d2 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
				mini = b;
				mind = d2;
				var v20 = out;
				minvX = v20[0];
				minvY = v20[1];
				minvZ = v20[2];
			}
			if (d23 < 0) {
				var v110;
				var v1X3;
				var v1Y3;
				var v1Z3;
				var v24;
				var v2X3;
				var v2Y3;
				var v2Z3;
				var v25 = vec2;
				v1X3 = v25[0];
				v1Y3 = v25[1];
				v1Z3 = v25[2];
				var v26 = vec3;
				v2X3 = v26[0];
				v2Y3 = v26[1];
				v2Z3 = v26[2];
				var v123;
				var v12X3;
				var v12Y3;
				var v12Z3;
				v12X3 = v2X3 - v1X3;
				v12Y3 = v2Y3 - v1Y3;
				v12Z3 = v2Z3 - v1Z3;
				var d3 = v12X3 * v12X3 + v12Y3 * v12Y3 + v12Z3 * v12Z3;
				var t1 = v12X3 * v1X3 + v12Y3 * v1Y3 + v12Z3 * v1Z3;
				t1 = -t1 / d3;
				var b1;
				if (t1 < 0) {
					var v27 = out;
					v27[0] = v1X3;
					v27[1] = v1Y3;
					v27[2] = v1Z3;
					b1 = 1;
				} else if (t1 > 1) {
					var v28 = out;
					v28[0] = v2X3;
					v28[1] = v2Y3;
					v28[2] = v2Z3;
					b1 = 2;
				} else {
					var p1;
					var pX1;
					var pY1;
					var pZ1;
					pX1 = v1X3 + v12X3 * t1;
					pY1 = v1Y3 + v12Y3 * t1;
					pZ1 = v1Z3 + v12Z3 * t1;
					var v29 = out;
					v29[0] = pX1;
					v29[1] = pY1;
					v29[2] = pZ1;
					b1 = 3;
				}
				var d4 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
				if (mind < 0 || d4 < mind) {
					mini = b1 << 1;
					mind = d4;
					var v30 = out;
					minvX = v30[0];
					minvY = v30[1];
					minvZ = v30[2];
				}
			}
			if (d31 < 0) {
				var v111;
				var v1X4;
				var v1Y4;
				var v1Z4;
				var v210;
				var v2X4;
				var v2Y4;
				var v2Z4;
				var v32 = vec1;
				v1X4 = v32[0];
				v1Y4 = v32[1];
				v1Z4 = v32[2];
				var v33 = vec3;
				v2X4 = v33[0];
				v2Y4 = v33[1];
				v2Z4 = v33[2];
				var v124;
				var v12X4;
				var v12Y4;
				var v12Z4;
				v12X4 = v2X4 - v1X4;
				v12Y4 = v2Y4 - v1Y4;
				v12Z4 = v2Z4 - v1Z4;
				var d5 = v12X4 * v12X4 + v12Y4 * v12Y4 + v12Z4 * v12Z4;
				var t2 = v12X4 * v1X4 + v12Y4 * v1Y4 + v12Z4 * v1Z4;
				t2 = -t2 / d5;
				var b2;
				if (t2 < 0) {
					var v34 = out;
					v34[0] = v1X4;
					v34[1] = v1Y4;
					v34[2] = v1Z4;
					b2 = 1;
				} else if (t2 > 1) {
					var v35 = out;
					v35[0] = v2X4;
					v35[1] = v2Y4;
					v35[2] = v2Z4;
					b2 = 2;
				} else {
					var p2;
					var pX2;
					var pY2;
					var pZ2;
					pX2 = v1X4 + v12X4 * t2;
					pY2 = v1Y4 + v12Y4 * t2;
					pZ2 = v1Z4 + v12Z4 * t2;
					var v36 = out;
					v36[0] = pX2;
					v36[1] = pY2;
					v36[2] = pZ2;
					b2 = 3;
				}
				var d6 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
				if (mind < 0 || d6 < mind) {
					mini = b2 & 1 | (b2 & 2) << 1;
					mind = d6;
					var v37 = out;
					minvX = v37[0];
					minvY = v37[1];
					minvZ = v37[2];
				}
			}
			if (mind > 0) {
				var v38 = out;
				v38[0] = minvX;
				v38[1] = minvY;
				v38[2] = minvZ;
			} else {
				var l = nX * nX + nY * nY + nZ * nZ;
				if (l > 0) {
					l = 1 / Math.sqrt(l);
				}
				nX *= l;
				nY *= l;
				nZ *= l;
				var dn = v1X1 * nX + v1Y1 * nY + v1Z1 * nZ;
				var l2 = nX * nX + nY * nY + nZ * nZ;
				l2 = dn / l2;
				minvX = nX * l2;
				minvY = nY * l2;
				minvZ = nZ * l2;
				var v39 = out;
				v39[0] = minvX;
				v39[1] = minvY;
				v39[2] = minvZ;
			}
			var _this = this.tmp;
			this._distanceSq = _this[0] * _this[0] + _this[1] * _this[1] + _this[2] * _this[2];
			this._adjacentTriangles[0] = null;
			this._adjacentTriangles[1] = null;
			this._adjacentTriangles[2] = null;
			this._adjacentPairIndex[0] = -1;
			this._adjacentPairIndex[1] = -1;
			this._adjacentPairIndex[2] = -1;
			return !inverted;
		}

		proto.setAdjacentTriangle = function (triangle) {
			var count = 0;
			var _g = 0;
			while (_g < 3) {
				var i = _g++;
				var _g1 = 0;
				while (_g1 < 3) {
					var j = _g1++;
					var i2 = this._nextIndex[i];
					var j2 = this._nextIndex[j];
					if (this._vertices[i] == triangle._vertices[j2] && this._vertices[i2] == triangle._vertices[j]) {
						this._adjacentTriangles[i] = triangle;
						this._adjacentPairIndex[i] = j;
						triangle._adjacentTriangles[j] = this;
						triangle._adjacentPairIndex[j] = i;
						++count;
					}
				}
			}
			if (count != 1) {
				return false;
			}
			return true;
		}

		proto.removeAdjacentTriangles = function () {
			var _g = 0;
			while (_g < 3) {
				var i = _g++;
				var triangle = this._adjacentTriangles[i];
				if (triangle != null) {
					var pairIndex = this._adjacentPairIndex[i];
					triangle._adjacentTriangles[pairIndex] = null;
					triangle._adjacentPairIndex[pairIndex] = -1;
					this._adjacentTriangles[i] = null;
					this._adjacentPairIndex[i] = -1;
				}
			}
		}

		proto.removeReferences = function () {
			this._next = null;
			this._prev = null;
			this._tmpDfsId = 0;
			this._tmpDfsVisible = false;
			this._distanceSq = 0;
			this._vertices[0] = null;
			this._vertices[1] = null;
			this._vertices[2] = null;
			this._adjacentTriangles[0] = null;
			this._adjacentTriangles[1] = null;
			this._adjacentTriangles[2] = null;
			this._adjacentPairIndex[0] = 0;
			this._adjacentPairIndex[1] = 0;
			this._adjacentPairIndex[2] = 0;
		}

		proto.dump = function () {
		}

		var EpaTriangle = function () {
			this.id = ++collision.narrowphase.detector.gjkepa.EpaTriangle.count;
			this._next = null;
			this._prev = null;
			this._normal = vec3();
			this._distanceSq = 0;
			this._tmpDfsId = 0;
			this._tmpDfsVisible = false;
			var this1 = new Array(3);
			this._vertices = this1;
			var this2 = new Array(3);
			this._adjacentTriangles = this2;
			var this3 = new Array(3);
			this._adjacentPairIndex = this3;
			this.tmp = vec3();
			var this4 = new Array(3);
			this._nextIndex = this4;
			this._nextIndex[0] = 1;
			this._nextIndex[1] = 2;
			this._nextIndex[2] = 0;
		}
		return EpaTriangle;
	});

	collision.narrowphase.detector.gjkepa.EpaVertex = pe.define(function (proto) {
		proto.init = function (v, w1, w2) {
			var _this = this.v;
			_this[0] = v[0];
			_this[1] = v[1];
			_this[2] = v[2];
			var _this1 = this.w1;
			_this1[0] = w1[0];
			_this1[1] = w1[1];
			_this1[2] = w1[2];
			var _this2 = this.w2;
			_this2[0] = w2[0];
			_this2[1] = w2[1];
			_this2[2] = w2[2];
			this._next = null;
			this._tmpEdgeLoopNext = null;
			this._tmpEdgeLoopOuterTriangle = null;
			return this;
		}

		proto.removeReferences = function () {
			this._next = null;
			this._tmpEdgeLoopNext = null;
			this._tmpEdgeLoopOuterTriangle = null;
		}

		var EpaVertex = function () {
			this.randId = Math.random() * 100000 | 0;
			this.v = vec3();
			this.w1 = vec3();
			this.w2 = vec3();
		}
		return EpaVertex;
	});

	collision.narrowphase.detector.gjkepa.GjkCache = pe.define(function (proto) {
		proto.clear = function () {
			
			math.vec3_zero$(this.prevClosestDir)
		}

		var GjkCache = function () {
			this.prevClosestDir = vec3();
		}
		return GjkCache;
	});

	collision.narrowphase.detector.gjkepa.GjkEpa = pe.define(function (proto) {
		proto.computeClosestPointsImpl = function (c1, c2, tf1, tf2, cache, useEpa) {
			this.c1 = c1;
			this.c2 = c2;
			this.tf1 = tf1;
			this.tf2 = tf2;
			var s = this.s;
			var w1 = this.w1;
			var w2 = this.w2;
			var closest = this.closest;
			var dir = this.dir;
			if (cache != null) {
				if (cache._gjkCache == null) {
					cache._gjkCache = new collision.narrowphase.detector.gjkepa.GjkCache();
				}
				this.loadCache(cache._gjkCache);
			} else {
				math.vec3_zero$(dir)
			}
			if (dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2] == 0) {
				var firstDir;
				var firstDirX;
				var firstDirY;
				var firstDirZ;
				firstDirX = tf2._position[0] - tf1._position[0];
				firstDirY = tf2._position[1] - tf1._position[1];
				firstDirZ = tf2._position[2] - tf1._position[2];
				var v = dir;
				v[0] = firstDirX;
				v[1] = firstDirY;
				v[2] = firstDirZ;
				if (dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2] < 1e-6) {
					dir.init(1, 0, 0);
				}
			}
			this.simplexSize = 0;
			this.computeWitnessPoint1(false);
			this.computeWitnessPoint2(false);
			var _this = this.s[this.simplexSize];
			var v1 = this.w1[this.simplexSize];
			_this[0] = v1[0];
			_this[1] = v1[1];
			_this[2] = v1[2];
			var _this1 = _this;
			var v2 = this.w2[this.simplexSize];
			var tx = _this1[0] - v2[0];
			var ty = _this1[1] - v2[1];
			var tz = _this1[2] - v2[2];
			_this1[0] = tx;
			_this1[1] = ty;
			_this1[2] = tz;
			this.simplexSize = 1;
			var count = 0;
			var max = 40;
			var eps = 1e-4;
			var eps2 = eps * eps;
			while (count < max) {
				var v3 = 0;
				var _g = this.simplexSize;
				switch (_g) {
					case 1:
						var v4 = s[0];
						closest[0] = v4[0];
						closest[1] = v4[1];
						closest[2] = v4[2];
						v3 = 1;
						break;
					case 2:
						var v11;
						var v1X;
						var v1Y;
						var v1Z;
						var v21;
						var v2X;
						var v2Y;
						var v2Z;
						var v5 = s[0];
						v1X = v5[0];
						v1Y = v5[1];
						v1Z = v5[2];
						var v6 = s[1];
						v2X = v6[0];
						v2Y = v6[1];
						v2Z = v6[2];
						var v12;
						var v12X;
						var v12Y;
						var v12Z;
						v12X = v2X - v1X;
						v12Y = v2Y - v1Y;
						v12Z = v2Z - v1Z;
						var d = v12X * v12X + v12Y * v12Y + v12Z * v12Z;
						var t = v12X * v1X + v12Y * v1Y + v12Z * v1Z;
						t = -t / d;
						if (t < 0) {
							var v7 = closest;
							v7[0] = v1X;
							v7[1] = v1Y;
							v7[2] = v1Z;
							v3 = 1;
						} else if (t > 1) {
							var v8 = closest;
							v8[0] = v2X;
							v8[1] = v2Y;
							v8[2] = v2Z;
							v3 = 2;
						} else {
							var p;
							var pX;
							var pY;
							var pZ;
							pX = v1X + v12X * t;
							pY = v1Y + v12Y * t;
							pZ = v1Z + v12Z * t;
							var v9 = closest;
							v9[0] = pX;
							v9[1] = pY;
							v9[2] = pZ;
							v3 = 3;
						}
						break;
					case 3:
						var vec1 = s[0];
						var vec2 = s[1];
						var vec3 = s[2];
						var v13;
						var v1X1;
						var v1Y1;
						var v1Z1;
						var v22;
						var v2X1;
						var v2Y1;
						var v2Z1;
						var v31;
						var v3X;
						var v3Y;
						var v3Z;
						var v121;
						var v12X1;
						var v12Y1;
						var v12Z1;
						var v23;
						var v23X;
						var v23Y;
						var v23Z;
						var v311;
						var v31X;
						var v31Y;
						var v31Z;
						var v10 = vec1;
						v1X1 = v10[0];
						v1Y1 = v10[1];
						v1Z1 = v10[2];
						var v14 = vec2;
						v2X1 = v14[0];
						v2Y1 = v14[1];
						v2Z1 = v14[2];
						var v15 = vec3;
						v3X = v15[0];
						v3Y = v15[1];
						v3Z = v15[2];
						v12X1 = v2X1 - v1X1;
						v12Y1 = v2Y1 - v1Y1;
						v12Z1 = v2Z1 - v1Z1;
						v23X = v3X - v2X1;
						v23Y = v3Y - v2Y1;
						v23Z = v3Z - v2Z1;
						v31X = v1X1 - v3X;
						v31Y = v1Y1 - v3Y;
						v31Z = v1Z1 - v3Z;
						var n;
						var nX;
						var nY;
						var nZ;
						nX = v12Y1 * v23Z - v12Z1 * v23Y;
						nY = v12Z1 * v23X - v12X1 * v23Z;
						nZ = v12X1 * v23Y - v12Y1 * v23X;
						var n12;
						var n12X;
						var n12Y;
						var n12Z;
						var n23;
						var n23X;
						var n23Y;
						var n23Z;
						var n31;
						var n31X;
						var n31Y;
						var n31Z;
						n12X = v12Y1 * nZ - v12Z1 * nY;
						n12Y = v12Z1 * nX - v12X1 * nZ;
						n12Z = v12X1 * nY - v12Y1 * nX;
						n23X = v23Y * nZ - v23Z * nY;
						n23Y = v23Z * nX - v23X * nZ;
						n23Z = v23X * nY - v23Y * nX;
						n31X = v31Y * nZ - v31Z * nY;
						n31Y = v31Z * nX - v31X * nZ;
						n31Z = v31X * nY - v31Y * nX;
						var d12 = v1X1 * n12X + v1Y1 * n12Y + v1Z1 * n12Z;
						var d23 = v2X1 * n23X + v2Y1 * n23Y + v2Z1 * n23Z;
						var d31 = v3X * n31X + v3Y * n31Y + v3Z * n31Z;
						var mind = -1;
						var minv;
						var minvX;
						var minvY;
						var minvZ;
						var mini = 0;
						minvX = 0;
						minvY = 0;
						minvZ = 0;
						if (d12 < 0) {
							var v16;
							var v1X2;
							var v1Y2;
							var v1Z2;
							var v24;
							var v2X2;
							var v2Y2;
							var v2Z2;
							var v17 = vec1;
							v1X2 = v17[0];
							v1Y2 = v17[1];
							v1Z2 = v17[2];
							var v18 = vec2;
							v2X2 = v18[0];
							v2Y2 = v18[1];
							v2Z2 = v18[2];
							var v122;
							var v12X2;
							var v12Y2;
							var v12Z2;
							v12X2 = v2X2 - v1X2;
							v12Y2 = v2Y2 - v1Y2;
							v12Z2 = v2Z2 - v1Z2;
							var d1 = v12X2 * v12X2 + v12Y2 * v12Y2 + v12Z2 * v12Z2;
							var t1 = v12X2 * v1X2 + v12Y2 * v1Y2 + v12Z2 * v1Z2;
							t1 = -t1 / d1;
							var b;
							if (t1 < 0) {
								var v19 = closest;
								v19[0] = v1X2;
								v19[1] = v1Y2;
								v19[2] = v1Z2;
								b = 1;
							} else if (t1 > 1) {
								var v20 = closest;
								v20[0] = v2X2;
								v20[1] = v2Y2;
								v20[2] = v2Z2;
								b = 2;
							} else {
								var p1;
								var pX1;
								var pY1;
								var pZ1;
								pX1 = v1X2 + v12X2 * t1;
								pY1 = v1Y2 + v12Y2 * t1;
								pZ1 = v1Z2 + v12Z2 * t1;
								var v25 = closest;
								v25[0] = pX1;
								v25[1] = pY1;
								v25[2] = pZ1;
								b = 3;
							}
							var d2 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
							mini = b;
							mind = d2;
							var v26 = closest;
							minvX = v26[0];
							minvY = v26[1];
							minvZ = v26[2];
						}
						if (d23 < 0) {
							var v110;
							var v1X3;
							var v1Y3;
							var v1Z3;
							var v27;
							var v2X3;
							var v2Y3;
							var v2Z3;
							var v28 = vec2;
							v1X3 = v28[0];
							v1Y3 = v28[1];
							v1Z3 = v28[2];
							var v29 = vec3;
							v2X3 = v29[0];
							v2Y3 = v29[1];
							v2Z3 = v29[2];
							var v123;
							var v12X3;
							var v12Y3;
							var v12Z3;
							v12X3 = v2X3 - v1X3;
							v12Y3 = v2Y3 - v1Y3;
							v12Z3 = v2Z3 - v1Z3;
							var d3 = v12X3 * v12X3 + v12Y3 * v12Y3 + v12Z3 * v12Z3;
							var t2 = v12X3 * v1X3 + v12Y3 * v1Y3 + v12Z3 * v1Z3;
							t2 = -t2 / d3;
							var b1;
							if (t2 < 0) {
								var v30 = closest;
								v30[0] = v1X3;
								v30[1] = v1Y3;
								v30[2] = v1Z3;
								b1 = 1;
							} else if (t2 > 1) {
								var v32 = closest;
								v32[0] = v2X3;
								v32[1] = v2Y3;
								v32[2] = v2Z3;
								b1 = 2;
							} else {
								var p2;
								var pX2;
								var pY2;
								var pZ2;
								pX2 = v1X3 + v12X3 * t2;
								pY2 = v1Y3 + v12Y3 * t2;
								pZ2 = v1Z3 + v12Z3 * t2;
								var v33 = closest;
								v33[0] = pX2;
								v33[1] = pY2;
								v33[2] = pZ2;
								b1 = 3;
							}
							var d4 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
							if (mind < 0 || d4 < mind) {
								mini = b1 << 1;
								mind = d4;
								var v34 = closest;
								minvX = v34[0];
								minvY = v34[1];
								minvZ = v34[2];
							}
						}
						if (d31 < 0) {
							var v111;
							var v1X4;
							var v1Y4;
							var v1Z4;
							var v210;
							var v2X4;
							var v2Y4;
							var v2Z4;
							var v35 = vec1;
							v1X4 = v35[0];
							v1Y4 = v35[1];
							v1Z4 = v35[2];
							var v36 = vec3;
							v2X4 = v36[0];
							v2Y4 = v36[1];
							v2Z4 = v36[2];
							var v124;
							var v12X4;
							var v12Y4;
							var v12Z4;
							v12X4 = v2X4 - v1X4;
							v12Y4 = v2Y4 - v1Y4;
							v12Z4 = v2Z4 - v1Z4;
							var d5 = v12X4 * v12X4 + v12Y4 * v12Y4 + v12Z4 * v12Z4;
							var t3 = v12X4 * v1X4 + v12Y4 * v1Y4 + v12Z4 * v1Z4;
							t3 = -t3 / d5;
							var b2;
							if (t3 < 0) {
								var v37 = closest;
								v37[0] = v1X4;
								v37[1] = v1Y4;
								v37[2] = v1Z4;
								b2 = 1;
							} else if (t3 > 1) {
								var v38 = closest;
								v38[0] = v2X4;
								v38[1] = v2Y4;
								v38[2] = v2Z4;
								b2 = 2;
							} else {
								var p3;
								var pX3;
								var pY3;
								var pZ3;
								pX3 = v1X4 + v12X4 * t3;
								pY3 = v1Y4 + v12Y4 * t3;
								pZ3 = v1Z4 + v12Z4 * t3;
								var v39 = closest;
								v39[0] = pX3;
								v39[1] = pY3;
								v39[2] = pZ3;
								b2 = 3;
							}
							var d6 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
							if (mind < 0 || d6 < mind) {
								mini = b2 & 1 | (b2 & 2) << 1;
								mind = d6;
								var v40 = closest;
								minvX = v40[0];
								minvY = v40[1];
								minvZ = v40[2];
							}
						}
						if (mind > 0) {
							var v41 = closest;
							v41[0] = minvX;
							v41[1] = minvY;
							v41[2] = minvZ;
							v3 = mini;
						} else {
							var l = nX * nX + nY * nY + nZ * nZ;
							if (l > 0) {
								l = 1 / Math.sqrt(l);
							}
							nX *= l;
							nY *= l;
							nZ *= l;
							var dn = v1X1 * nX + v1Y1 * nY + v1Z1 * nZ;
							var l2 = nX * nX + nY * nY + nZ * nZ;
							l2 = dn / l2;
							minvX = nX * l2;
							minvY = nY * l2;
							minvZ = nZ * l2;
							var v42 = closest;
							v42[0] = minvX;
							v42[1] = minvY;
							v42[2] = minvZ;
							v3 = 7;
						}
						break;
					case 4:
						var vec11 = s[0];
						var vec21 = s[1];
						var vec31 = s[2];
						var vec4 = s[3];
						var v112;
						var v1X5;
						var v1Y5;
						var v1Z5;
						var v211;
						var v2X5;
						var v2Y5;
						var v2Z5;
						var v310;
						var v3X1;
						var v3Y1;
						var v3Z1;
						var v43;
						var v4X;
						var v4Y;
						var v4Z;
						var v125;
						var v12X5;
						var v12Y5;
						var v12Z5;
						var v131;
						var v13X;
						var v13Y;
						var v13Z;
						var v141;
						var v14X;
						var v14Y;
						var v14Z;
						var v231;
						var v23X1;
						var v23Y1;
						var v23Z1;
						var v241;
						var v24X;
						var v24Y;
						var v24Z;
						var v341;
						var v34X;
						var v34Y;
						var v34Z;
						var v44 = vec11;
						v1X5 = v44[0];
						v1Y5 = v44[1];
						v1Z5 = v44[2];
						var v45 = vec21;
						v2X5 = v45[0];
						v2Y5 = v45[1];
						v2Z5 = v45[2];
						var v46 = vec31;
						v3X1 = v46[0];
						v3Y1 = v46[1];
						v3Z1 = v46[2];
						var v47 = vec4;
						v4X = v47[0];
						v4Y = v47[1];
						v4Z = v47[2];
						v12X5 = v2X5 - v1X5;
						v12Y5 = v2Y5 - v1Y5;
						v12Z5 = v2Z5 - v1Z5;
						v13X = v3X1 - v1X5;
						v13Y = v3Y1 - v1Y5;
						v13Z = v3Z1 - v1Z5;
						v14X = v4X - v1X5;
						v14Y = v4Y - v1Y5;
						v14Z = v4Z - v1Z5;
						v23X1 = v3X1 - v2X5;
						v23Y1 = v3Y1 - v2Y5;
						v23Z1 = v3Z1 - v2Z5;
						v24X = v4X - v2X5;
						v24Y = v4Y - v2Y5;
						v24Z = v4Z - v2Z5;
						v34X = v4X - v3X1;
						v34Y = v4Y - v3Y1;
						v34Z = v4Z - v3Z1;
						var rev;
						var n123;
						var n123X;
						var n123Y;
						var n123Z;
						var n134;
						var n134X;
						var n134Y;
						var n134Z;
						var n142;
						var n142X;
						var n142Y;
						var n142Z;
						var n243;
						var n243X;
						var n243Y;
						var n243Z;
						var n1;
						var nX1;
						var nY1;
						var nZ1;
						n123X = v12Y5 * v13Z - v12Z5 * v13Y;
						n123Y = v12Z5 * v13X - v12X5 * v13Z;
						n123Z = v12X5 * v13Y - v12Y5 * v13X;
						n134X = v13Y * v14Z - v13Z * v14Y;
						n134Y = v13Z * v14X - v13X * v14Z;
						n134Z = v13X * v14Y - v13Y * v14X;
						n142X = v14Y * v12Z5 - v14Z * v12Y5;
						n142Y = v14Z * v12X5 - v14X * v12Z5;
						n142Z = v14X * v12Y5 - v14Y * v12X5;
						n243X = v24Y * v23Z1 - v24Z * v23Y1;
						n243Y = v24Z * v23X1 - v24X * v23Z1;
						n243Z = v24X * v23Y1 - v24Y * v23X1;
						var sign = v12X5 * n243X + v12Y5 * n243Y + v12Z5 * n243Z > 0 ? 1 : -1;
						var d123 = v1X5 * n123X + v1Y5 * n123Y + v1Z5 * n123Z;
						var d134 = v1X5 * n134X + v1Y5 * n134Y + v1Z5 * n134Z;
						var d142 = v1X5 * n142X + v1Y5 * n142Y + v1Z5 * n142Z;
						var d243 = v2X5 * n243X + v2Y5 * n243Y + v2Z5 * n243Z;
						var mind1 = -1;
						var minv1;
						var minvX1;
						var minvY1;
						var minvZ1;
						var mini1 = 0;
						minvX1 = 0;
						minvY1 = 0;
						minvZ1 = 0;
						if (d123 * sign < 0) {
							var v113;
							var v1X6;
							var v1Y6;
							var v1Z6;
							var v212;
							var v2X6;
							var v2Y6;
							var v2Z6;
							var v312;
							var v3X2;
							var v3Y2;
							var v3Z2;
							var v126;
							var v12X6;
							var v12Y6;
							var v12Z6;
							var v232;
							var v23X2;
							var v23Y2;
							var v23Z2;
							var v313;
							var v31X1;
							var v31Y1;
							var v31Z1;
							var v48 = vec11;
							v1X6 = v48[0];
							v1Y6 = v48[1];
							v1Z6 = v48[2];
							var v49 = vec21;
							v2X6 = v49[0];
							v2Y6 = v49[1];
							v2Z6 = v49[2];
							var v50 = vec31;
							v3X2 = v50[0];
							v3Y2 = v50[1];
							v3Z2 = v50[2];
							v12X6 = v2X6 - v1X6;
							v12Y6 = v2Y6 - v1Y6;
							v12Z6 = v2Z6 - v1Z6;
							v23X2 = v3X2 - v2X6;
							v23Y2 = v3Y2 - v2Y6;
							v23Z2 = v3Z2 - v2Z6;
							v31X1 = v1X6 - v3X2;
							v31Y1 = v1Y6 - v3Y2;
							v31Z1 = v1Z6 - v3Z2;
							var n2;
							var nX2;
							var nY2;
							var nZ2;
							nX2 = v12Y6 * v23Z2 - v12Z6 * v23Y2;
							nY2 = v12Z6 * v23X2 - v12X6 * v23Z2;
							nZ2 = v12X6 * v23Y2 - v12Y6 * v23X2;
							var n121;
							var n12X1;
							var n12Y1;
							var n12Z1;
							var n231;
							var n23X1;
							var n23Y1;
							var n23Z1;
							var n311;
							var n31X1;
							var n31Y1;
							var n31Z1;
							n12X1 = v12Y6 * nZ2 - v12Z6 * nY2;
							n12Y1 = v12Z6 * nX2 - v12X6 * nZ2;
							n12Z1 = v12X6 * nY2 - v12Y6 * nX2;
							n23X1 = v23Y2 * nZ2 - v23Z2 * nY2;
							n23Y1 = v23Z2 * nX2 - v23X2 * nZ2;
							n23Z1 = v23X2 * nY2 - v23Y2 * nX2;
							n31X1 = v31Y1 * nZ2 - v31Z1 * nY2;
							n31Y1 = v31Z1 * nX2 - v31X1 * nZ2;
							n31Z1 = v31X1 * nY2 - v31Y1 * nX2;
							var d121 = v1X6 * n12X1 + v1Y6 * n12Y1 + v1Z6 * n12Z1;
							var d231 = v2X6 * n23X1 + v2Y6 * n23Y1 + v2Z6 * n23Z1;
							var d311 = v3X2 * n31X1 + v3Y2 * n31Y1 + v3Z2 * n31Z1;
							var mind2 = -1;
							var minv2;
							var minvX2;
							var minvY2;
							var minvZ2;
							var mini2 = 0;
							minvX2 = 0;
							minvY2 = 0;
							minvZ2 = 0;
							if (d121 < 0) {
								var v114;
								var v1X7;
								var v1Y7;
								var v1Z7;
								var v213;
								var v2X7;
								var v2Y7;
								var v2Z7;
								var v51 = vec11;
								v1X7 = v51[0];
								v1Y7 = v51[1];
								v1Z7 = v51[2];
								var v52 = vec21;
								v2X7 = v52[0];
								v2Y7 = v52[1];
								v2Z7 = v52[2];
								var v127;
								var v12X7;
								var v12Y7;
								var v12Z7;
								v12X7 = v2X7 - v1X7;
								v12Y7 = v2Y7 - v1Y7;
								v12Z7 = v2Z7 - v1Z7;
								var d7 = v12X7 * v12X7 + v12Y7 * v12Y7 + v12Z7 * v12Z7;
								var t4 = v12X7 * v1X7 + v12Y7 * v1Y7 + v12Z7 * v1Z7;
								t4 = -t4 / d7;
								var b3;
								if (t4 < 0) {
									var v53 = closest;
									v53[0] = v1X7;
									v53[1] = v1Y7;
									v53[2] = v1Z7;
									b3 = 1;
								} else if (t4 > 1) {
									var v54 = closest;
									v54[0] = v2X7;
									v54[1] = v2Y7;
									v54[2] = v2Z7;
									b3 = 2;
								} else {
									var p4;
									var pX4;
									var pY4;
									var pZ4;
									pX4 = v1X7 + v12X7 * t4;
									pY4 = v1Y7 + v12Y7 * t4;
									pZ4 = v1Z7 + v12Z7 * t4;
									var v55 = closest;
									v55[0] = pX4;
									v55[1] = pY4;
									v55[2] = pZ4;
									b3 = 3;
								}
								var d8 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								mini2 = b3;
								mind2 = d8;
								var v56 = closest;
								minvX2 = v56[0];
								minvY2 = v56[1];
								minvZ2 = v56[2];
							}
							if (d231 < 0) {
								var v115;
								var v1X8;
								var v1Y8;
								var v1Z8;
								var v214;
								var v2X8;
								var v2Y8;
								var v2Z8;
								var v57 = vec21;
								v1X8 = v57[0];
								v1Y8 = v57[1];
								v1Z8 = v57[2];
								var v58 = vec31;
								v2X8 = v58[0];
								v2Y8 = v58[1];
								v2Z8 = v58[2];
								var v128;
								var v12X8;
								var v12Y8;
								var v12Z8;
								v12X8 = v2X8 - v1X8;
								v12Y8 = v2Y8 - v1Y8;
								v12Z8 = v2Z8 - v1Z8;
								var d9 = v12X8 * v12X8 + v12Y8 * v12Y8 + v12Z8 * v12Z8;
								var t5 = v12X8 * v1X8 + v12Y8 * v1Y8 + v12Z8 * v1Z8;
								t5 = -t5 / d9;
								var b4;
								if (t5 < 0) {
									var v59 = closest;
									v59[0] = v1X8;
									v59[1] = v1Y8;
									v59[2] = v1Z8;
									b4 = 1;
								} else if (t5 > 1) {
									var v60 = closest;
									v60[0] = v2X8;
									v60[1] = v2Y8;
									v60[2] = v2Z8;
									b4 = 2;
								} else {
									var p5;
									var pX5;
									var pY5;
									var pZ5;
									pX5 = v1X8 + v12X8 * t5;
									pY5 = v1Y8 + v12Y8 * t5;
									pZ5 = v1Z8 + v12Z8 * t5;
									var v61 = closest;
									v61[0] = pX5;
									v61[1] = pY5;
									v61[2] = pZ5;
									b4 = 3;
								}
								var d10 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind2 < 0 || d10 < mind2) {
									mini2 = b4 << 1;
									mind2 = d10;
									var v62 = closest;
									minvX2 = v62[0];
									minvY2 = v62[1];
									minvZ2 = v62[2];
								}
							}
							if (d311 < 0) {
								var v116;
								var v1X9;
								var v1Y9;
								var v1Z9;
								var v215;
								var v2X9;
								var v2Y9;
								var v2Z9;
								var v63 = vec11;
								v1X9 = v63[0];
								v1Y9 = v63[1];
								v1Z9 = v63[2];
								var v64 = vec31;
								v2X9 = v64[0];
								v2Y9 = v64[1];
								v2Z9 = v64[2];
								var v129;
								var v12X9;
								var v12Y9;
								var v12Z9;
								v12X9 = v2X9 - v1X9;
								v12Y9 = v2Y9 - v1Y9;
								v12Z9 = v2Z9 - v1Z9;
								var d11 = v12X9 * v12X9 + v12Y9 * v12Y9 + v12Z9 * v12Z9;
								var t6 = v12X9 * v1X9 + v12Y9 * v1Y9 + v12Z9 * v1Z9;
								t6 = -t6 / d11;
								var b5;
								if (t6 < 0) {
									var v65 = closest;
									v65[0] = v1X9;
									v65[1] = v1Y9;
									v65[2] = v1Z9;
									b5 = 1;
								} else if (t6 > 1) {
									var v66 = closest;
									v66[0] = v2X9;
									v66[1] = v2Y9;
									v66[2] = v2Z9;
									b5 = 2;
								} else {
									var p6;
									var pX6;
									var pY6;
									var pZ6;
									pX6 = v1X9 + v12X9 * t6;
									pY6 = v1Y9 + v12Y9 * t6;
									pZ6 = v1Z9 + v12Z9 * t6;
									var v67 = closest;
									v67[0] = pX6;
									v67[1] = pY6;
									v67[2] = pZ6;
									b5 = 3;
								}
								var d13 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind2 < 0 || d13 < mind2) {
									mini2 = b5 & 1 | (b5 & 2) << 1;
									mind2 = d13;
									var v68 = closest;
									minvX2 = v68[0];
									minvY2 = v68[1];
									minvZ2 = v68[2];
								}
							}
							var b6;
							if (mind2 > 0) {
								var v69 = closest;
								v69[0] = minvX2;
								v69[1] = minvY2;
								v69[2] = minvZ2;
								b6 = mini2;
							} else {
								var l1 = nX2 * nX2 + nY2 * nY2 + nZ2 * nZ2;
								if (l1 > 0) {
									l1 = 1 / Math.sqrt(l1);
								}
								nX2 *= l1;
								nY2 *= l1;
								nZ2 *= l1;
								var dn1 = v1X6 * nX2 + v1Y6 * nY2 + v1Z6 * nZ2;
								var l21 = nX2 * nX2 + nY2 * nY2 + nZ2 * nZ2;
								l21 = dn1 / l21;
								minvX2 = nX2 * l21;
								minvY2 = nY2 * l21;
								minvZ2 = nZ2 * l21;
								var v70 = closest;
								v70[0] = minvX2;
								v70[1] = minvY2;
								v70[2] = minvZ2;
								b6 = 7;
							}
							var d14 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
							mini1 = b6;
							mind1 = d14;
							var v71 = closest;
							minvX1 = v71[0];
							minvY1 = v71[1];
							minvZ1 = v71[2];
						}
						if (d134 * sign < 0) {
							var v117;
							var v1X10;
							var v1Y10;
							var v1Z10;
							var v216;
							var v2X10;
							var v2Y10;
							var v2Z10;
							var v314;
							var v3X3;
							var v3Y3;
							var v3Z3;
							var v1210;
							var v12X10;
							var v12Y10;
							var v12Z10;
							var v233;
							var v23X3;
							var v23Y3;
							var v23Z3;
							var v315;
							var v31X2;
							var v31Y2;
							var v31Z2;
							var v72 = vec11;
							v1X10 = v72[0];
							v1Y10 = v72[1];
							v1Z10 = v72[2];
							var v73 = vec31;
							v2X10 = v73[0];
							v2Y10 = v73[1];
							v2Z10 = v73[2];
							var v74 = vec4;
							v3X3 = v74[0];
							v3Y3 = v74[1];
							v3Z3 = v74[2];
							v12X10 = v2X10 - v1X10;
							v12Y10 = v2Y10 - v1Y10;
							v12Z10 = v2Z10 - v1Z10;
							v23X3 = v3X3 - v2X10;
							v23Y3 = v3Y3 - v2Y10;
							v23Z3 = v3Z3 - v2Z10;
							v31X2 = v1X10 - v3X3;
							v31Y2 = v1Y10 - v3Y3;
							v31Z2 = v1Z10 - v3Z3;
							var n3;
							var nX3;
							var nY3;
							var nZ3;
							nX3 = v12Y10 * v23Z3 - v12Z10 * v23Y3;
							nY3 = v12Z10 * v23X3 - v12X10 * v23Z3;
							nZ3 = v12X10 * v23Y3 - v12Y10 * v23X3;
							var n122;
							var n12X2;
							var n12Y2;
							var n12Z2;
							var n232;
							var n23X2;
							var n23Y2;
							var n23Z2;
							var n312;
							var n31X2;
							var n31Y2;
							var n31Z2;
							n12X2 = v12Y10 * nZ3 - v12Z10 * nY3;
							n12Y2 = v12Z10 * nX3 - v12X10 * nZ3;
							n12Z2 = v12X10 * nY3 - v12Y10 * nX3;
							n23X2 = v23Y3 * nZ3 - v23Z3 * nY3;
							n23Y2 = v23Z3 * nX3 - v23X3 * nZ3;
							n23Z2 = v23X3 * nY3 - v23Y3 * nX3;
							n31X2 = v31Y2 * nZ3 - v31Z2 * nY3;
							n31Y2 = v31Z2 * nX3 - v31X2 * nZ3;
							n31Z2 = v31X2 * nY3 - v31Y2 * nX3;
							var d122 = v1X10 * n12X2 + v1Y10 * n12Y2 + v1Z10 * n12Z2;
							var d232 = v2X10 * n23X2 + v2Y10 * n23Y2 + v2Z10 * n23Z2;
							var d312 = v3X3 * n31X2 + v3Y3 * n31Y2 + v3Z3 * n31Z2;
							var mind3 = -1;
							var minv3;
							var minvX3;
							var minvY3;
							var minvZ3;
							var mini3 = 0;
							minvX3 = 0;
							minvY3 = 0;
							minvZ3 = 0;
							if (d122 < 0) {
								var v118;
								var v1X11;
								var v1Y11;
								var v1Z11;
								var v217;
								var v2X11;
								var v2Y11;
								var v2Z11;
								var v75 = vec11;
								v1X11 = v75[0];
								v1Y11 = v75[1];
								v1Z11 = v75[2];
								var v76 = vec31;
								v2X11 = v76[0];
								v2Y11 = v76[1];
								v2Z11 = v76[2];
								var v1211;
								var v12X11;
								var v12Y11;
								var v12Z11;
								v12X11 = v2X11 - v1X11;
								v12Y11 = v2Y11 - v1Y11;
								v12Z11 = v2Z11 - v1Z11;
								var d15 = v12X11 * v12X11 + v12Y11 * v12Y11 + v12Z11 * v12Z11;
								var t7 = v12X11 * v1X11 + v12Y11 * v1Y11 + v12Z11 * v1Z11;
								t7 = -t7 / d15;
								var b7;
								if (t7 < 0) {
									var v77 = closest;
									v77[0] = v1X11;
									v77[1] = v1Y11;
									v77[2] = v1Z11;
									b7 = 1;
								} else if (t7 > 1) {
									var v78 = closest;
									v78[0] = v2X11;
									v78[1] = v2Y11;
									v78[2] = v2Z11;
									b7 = 2;
								} else {
									var p7;
									var pX7;
									var pY7;
									var pZ7;
									pX7 = v1X11 + v12X11 * t7;
									pY7 = v1Y11 + v12Y11 * t7;
									pZ7 = v1Z11 + v12Z11 * t7;
									var v79 = closest;
									v79[0] = pX7;
									v79[1] = pY7;
									v79[2] = pZ7;
									b7 = 3;
								}
								var d16 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								mini3 = b7;
								mind3 = d16;
								var v80 = closest;
								minvX3 = v80[0];
								minvY3 = v80[1];
								minvZ3 = v80[2];
							}
							if (d232 < 0) {
								var v119;
								var v1X12;
								var v1Y12;
								var v1Z12;
								var v218;
								var v2X12;
								var v2Y12;
								var v2Z12;
								var v81 = vec31;
								v1X12 = v81[0];
								v1Y12 = v81[1];
								v1Z12 = v81[2];
								var v82 = vec4;
								v2X12 = v82[0];
								v2Y12 = v82[1];
								v2Z12 = v82[2];
								var v1212;
								var v12X12;
								var v12Y12;
								var v12Z12;
								v12X12 = v2X12 - v1X12;
								v12Y12 = v2Y12 - v1Y12;
								v12Z12 = v2Z12 - v1Z12;
								var d17 = v12X12 * v12X12 + v12Y12 * v12Y12 + v12Z12 * v12Z12;
								var t8 = v12X12 * v1X12 + v12Y12 * v1Y12 + v12Z12 * v1Z12;
								t8 = -t8 / d17;
								var b8;
								if (t8 < 0) {
									var v83 = closest;
									v83[0] = v1X12;
									v83[1] = v1Y12;
									v83[2] = v1Z12;
									b8 = 1;
								} else if (t8 > 1) {
									var v84 = closest;
									v84[0] = v2X12;
									v84[1] = v2Y12;
									v84[2] = v2Z12;
									b8 = 2;
								} else {
									var p8;
									var pX8;
									var pY8;
									var pZ8;
									pX8 = v1X12 + v12X12 * t8;
									pY8 = v1Y12 + v12Y12 * t8;
									pZ8 = v1Z12 + v12Z12 * t8;
									var v85 = closest;
									v85[0] = pX8;
									v85[1] = pY8;
									v85[2] = pZ8;
									b8 = 3;
								}
								var d18 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind3 < 0 || d18 < mind3) {
									mini3 = b8 << 1;
									mind3 = d18;
									var v86 = closest;
									minvX3 = v86[0];
									minvY3 = v86[1];
									minvZ3 = v86[2];
								}
							}
							if (d312 < 0) {
								var v120;
								var v1X13;
								var v1Y13;
								var v1Z13;
								var v219;
								var v2X13;
								var v2Y13;
								var v2Z13;
								var v87 = vec11;
								v1X13 = v87[0];
								v1Y13 = v87[1];
								v1Z13 = v87[2];
								var v88 = vec4;
								v2X13 = v88[0];
								v2Y13 = v88[1];
								v2Z13 = v88[2];
								var v1213;
								var v12X13;
								var v12Y13;
								var v12Z13;
								v12X13 = v2X13 - v1X13;
								v12Y13 = v2Y13 - v1Y13;
								v12Z13 = v2Z13 - v1Z13;
								var d19 = v12X13 * v12X13 + v12Y13 * v12Y13 + v12Z13 * v12Z13;
								var t9 = v12X13 * v1X13 + v12Y13 * v1Y13 + v12Z13 * v1Z13;
								t9 = -t9 / d19;
								var b9;
								if (t9 < 0) {
									var v89 = closest;
									v89[0] = v1X13;
									v89[1] = v1Y13;
									v89[2] = v1Z13;
									b9 = 1;
								} else if (t9 > 1) {
									var v90 = closest;
									v90[0] = v2X13;
									v90[1] = v2Y13;
									v90[2] = v2Z13;
									b9 = 2;
								} else {
									var p9;
									var pX9;
									var pY9;
									var pZ9;
									pX9 = v1X13 + v12X13 * t9;
									pY9 = v1Y13 + v12Y13 * t9;
									pZ9 = v1Z13 + v12Z13 * t9;
									var v91 = closest;
									v91[0] = pX9;
									v91[1] = pY9;
									v91[2] = pZ9;
									b9 = 3;
								}
								var d20 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind3 < 0 || d20 < mind3) {
									mini3 = b9 & 1 | (b9 & 2) << 1;
									mind3 = d20;
									var v92 = closest;
									minvX3 = v92[0];
									minvY3 = v92[1];
									minvZ3 = v92[2];
								}
							}
							var b10;
							if (mind3 > 0) {
								var v93 = closest;
								v93[0] = minvX3;
								v93[1] = minvY3;
								v93[2] = minvZ3;
								b10 = mini3;
							} else {
								var l3 = nX3 * nX3 + nY3 * nY3 + nZ3 * nZ3;
								if (l3 > 0) {
									l3 = 1 / Math.sqrt(l3);
								}
								nX3 *= l3;
								nY3 *= l3;
								nZ3 *= l3;
								var dn2 = v1X10 * nX3 + v1Y10 * nY3 + v1Z10 * nZ3;
								var l22 = nX3 * nX3 + nY3 * nY3 + nZ3 * nZ3;
								l22 = dn2 / l22;
								minvX3 = nX3 * l22;
								minvY3 = nY3 * l22;
								minvZ3 = nZ3 * l22;
								var v94 = closest;
								v94[0] = minvX3;
								v94[1] = minvY3;
								v94[2] = minvZ3;
								b10 = 7;
							}
							var d21 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
							if (mind1 < 0 || d21 < mind1) {
								mini1 = b10 & 1 | (b10 & 6) << 1;
								mind1 = d21;
								var v95 = closest;
								minvX1 = v95[0];
								minvY1 = v95[1];
								minvZ1 = v95[2];
							}
						}
						if (d142 * sign < 0) {
							var v130;
							var v1X14;
							var v1Y14;
							var v1Z14;
							var v220;
							var v2X14;
							var v2Y14;
							var v2Z14;
							var v316;
							var v3X4;
							var v3Y4;
							var v3Z4;
							var v1214;
							var v12X14;
							var v12Y14;
							var v12Z14;
							var v234;
							var v23X4;
							var v23Y4;
							var v23Z4;
							var v317;
							var v31X3;
							var v31Y3;
							var v31Z3;
							var v96 = vec11;
							v1X14 = v96[0];
							v1Y14 = v96[1];
							v1Z14 = v96[2];
							var v97 = vec21;
							v2X14 = v97[0];
							v2Y14 = v97[1];
							v2Z14 = v97[2];
							var v98 = vec4;
							v3X4 = v98[0];
							v3Y4 = v98[1];
							v3Z4 = v98[2];
							v12X14 = v2X14 - v1X14;
							v12Y14 = v2Y14 - v1Y14;
							v12Z14 = v2Z14 - v1Z14;
							v23X4 = v3X4 - v2X14;
							v23Y4 = v3Y4 - v2Y14;
							v23Z4 = v3Z4 - v2Z14;
							v31X3 = v1X14 - v3X4;
							v31Y3 = v1Y14 - v3Y4;
							v31Z3 = v1Z14 - v3Z4;
							var n4;
							var nX4;
							var nY4;
							var nZ4;
							nX4 = v12Y14 * v23Z4 - v12Z14 * v23Y4;
							nY4 = v12Z14 * v23X4 - v12X14 * v23Z4;
							nZ4 = v12X14 * v23Y4 - v12Y14 * v23X4;
							var n124;
							var n12X3;
							var n12Y3;
							var n12Z3;
							var n233;
							var n23X3;
							var n23Y3;
							var n23Z3;
							var n313;
							var n31X3;
							var n31Y3;
							var n31Z3;
							n12X3 = v12Y14 * nZ4 - v12Z14 * nY4;
							n12Y3 = v12Z14 * nX4 - v12X14 * nZ4;
							n12Z3 = v12X14 * nY4 - v12Y14 * nX4;
							n23X3 = v23Y4 * nZ4 - v23Z4 * nY4;
							n23Y3 = v23Z4 * nX4 - v23X4 * nZ4;
							n23Z3 = v23X4 * nY4 - v23Y4 * nX4;
							n31X3 = v31Y3 * nZ4 - v31Z3 * nY4;
							n31Y3 = v31Z3 * nX4 - v31X3 * nZ4;
							n31Z3 = v31X3 * nY4 - v31Y3 * nX4;
							var d124 = v1X14 * n12X3 + v1Y14 * n12Y3 + v1Z14 * n12Z3;
							var d233 = v2X14 * n23X3 + v2Y14 * n23Y3 + v2Z14 * n23Z3;
							var d313 = v3X4 * n31X3 + v3Y4 * n31Y3 + v3Z4 * n31Z3;
							var mind4 = -1;
							var minv4;
							var minvX4;
							var minvY4;
							var minvZ4;
							var mini4 = 0;
							minvX4 = 0;
							minvY4 = 0;
							minvZ4 = 0;
							if (d124 < 0) {
								var v132;
								var v1X15;
								var v1Y15;
								var v1Z15;
								var v221;
								var v2X15;
								var v2Y15;
								var v2Z15;
								var v99 = vec11;
								v1X15 = v99[0];
								v1Y15 = v99[1];
								v1Z15 = v99[2];
								var v100 = vec21;
								v2X15 = v100[0];
								v2Y15 = v100[1];
								v2Z15 = v100[2];
								var v1215;
								var v12X15;
								var v12Y15;
								var v12Z15;
								v12X15 = v2X15 - v1X15;
								v12Y15 = v2Y15 - v1Y15;
								v12Z15 = v2Z15 - v1Z15;
								var d22 = v12X15 * v12X15 + v12Y15 * v12Y15 + v12Z15 * v12Z15;
								var t10 = v12X15 * v1X15 + v12Y15 * v1Y15 + v12Z15 * v1Z15;
								t10 = -t10 / d22;
								var b11;
								if (t10 < 0) {
									var v101 = closest;
									v101[0] = v1X15;
									v101[1] = v1Y15;
									v101[2] = v1Z15;
									b11 = 1;
								} else if (t10 > 1) {
									var v102 = closest;
									v102[0] = v2X15;
									v102[1] = v2Y15;
									v102[2] = v2Z15;
									b11 = 2;
								} else {
									var p10;
									var pX10;
									var pY10;
									var pZ10;
									pX10 = v1X15 + v12X15 * t10;
									pY10 = v1Y15 + v12Y15 * t10;
									pZ10 = v1Z15 + v12Z15 * t10;
									var v103 = closest;
									v103[0] = pX10;
									v103[1] = pY10;
									v103[2] = pZ10;
									b11 = 3;
								}
								var d24 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								mini4 = b11;
								mind4 = d24;
								var v104 = closest;
								minvX4 = v104[0];
								minvY4 = v104[1];
								minvZ4 = v104[2];
							}
							if (d233 < 0) {
								var v133;
								var v1X16;
								var v1Y16;
								var v1Z16;
								var v222;
								var v2X16;
								var v2Y16;
								var v2Z16;
								var v105 = vec21;
								v1X16 = v105[0];
								v1Y16 = v105[1];
								v1Z16 = v105[2];
								var v106 = vec4;
								v2X16 = v106[0];
								v2Y16 = v106[1];
								v2Z16 = v106[2];
								var v1216;
								var v12X16;
								var v12Y16;
								var v12Z16;
								v12X16 = v2X16 - v1X16;
								v12Y16 = v2Y16 - v1Y16;
								v12Z16 = v2Z16 - v1Z16;
								var d25 = v12X16 * v12X16 + v12Y16 * v12Y16 + v12Z16 * v12Z16;
								var t11 = v12X16 * v1X16 + v12Y16 * v1Y16 + v12Z16 * v1Z16;
								t11 = -t11 / d25;
								var b12;
								if (t11 < 0) {
									var v107 = closest;
									v107[0] = v1X16;
									v107[1] = v1Y16;
									v107[2] = v1Z16;
									b12 = 1;
								} else if (t11 > 1) {
									var v108 = closest;
									v108[0] = v2X16;
									v108[1] = v2Y16;
									v108[2] = v2Z16;
									b12 = 2;
								} else {
									var p11;
									var pX11;
									var pY11;
									var pZ11;
									pX11 = v1X16 + v12X16 * t11;
									pY11 = v1Y16 + v12Y16 * t11;
									pZ11 = v1Z16 + v12Z16 * t11;
									var v109 = closest;
									v109[0] = pX11;
									v109[1] = pY11;
									v109[2] = pZ11;
									b12 = 3;
								}
								var d26 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind4 < 0 || d26 < mind4) {
									mini4 = b12 << 1;
									mind4 = d26;
									var v134 = closest;
									minvX4 = v134[0];
									minvY4 = v134[1];
									minvZ4 = v134[2];
								}
							}
							if (d313 < 0) {
								var v135;
								var v1X17;
								var v1Y17;
								var v1Z17;
								var v223;
								var v2X17;
								var v2Y17;
								var v2Z17;
								var v136 = vec11;
								v1X17 = v136[0];
								v1Y17 = v136[1];
								v1Z17 = v136[2];
								var v137 = vec4;
								v2X17 = v137[0];
								v2Y17 = v137[1];
								v2Z17 = v137[2];
								var v1217;
								var v12X17;
								var v12Y17;
								var v12Z17;
								v12X17 = v2X17 - v1X17;
								v12Y17 = v2Y17 - v1Y17;
								v12Z17 = v2Z17 - v1Z17;
								var d27 = v12X17 * v12X17 + v12Y17 * v12Y17 + v12Z17 * v12Z17;
								var t12 = v12X17 * v1X17 + v12Y17 * v1Y17 + v12Z17 * v1Z17;
								t12 = -t12 / d27;
								var b13;
								if (t12 < 0) {
									var v138 = closest;
									v138[0] = v1X17;
									v138[1] = v1Y17;
									v138[2] = v1Z17;
									b13 = 1;
								} else if (t12 > 1) {
									var v139 = closest;
									v139[0] = v2X17;
									v139[1] = v2Y17;
									v139[2] = v2Z17;
									b13 = 2;
								} else {
									var p12;
									var pX12;
									var pY12;
									var pZ12;
									pX12 = v1X17 + v12X17 * t12;
									pY12 = v1Y17 + v12Y17 * t12;
									pZ12 = v1Z17 + v12Z17 * t12;
									var v140 = closest;
									v140[0] = pX12;
									v140[1] = pY12;
									v140[2] = pZ12;
									b13 = 3;
								}
								var d28 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind4 < 0 || d28 < mind4) {
									mini4 = b13 & 1 | (b13 & 2) << 1;
									mind4 = d28;
									var v142 = closest;
									minvX4 = v142[0];
									minvY4 = v142[1];
									minvZ4 = v142[2];
								}
							}
							var b14;
							if (mind4 > 0) {
								var v143 = closest;
								v143[0] = minvX4;
								v143[1] = minvY4;
								v143[2] = minvZ4;
								b14 = mini4;
							} else {
								var l4 = nX4 * nX4 + nY4 * nY4 + nZ4 * nZ4;
								if (l4 > 0) {
									l4 = 1 / Math.sqrt(l4);
								}
								nX4 *= l4;
								nY4 *= l4;
								nZ4 *= l4;
								var dn3 = v1X14 * nX4 + v1Y14 * nY4 + v1Z14 * nZ4;
								var l23 = nX4 * nX4 + nY4 * nY4 + nZ4 * nZ4;
								l23 = dn3 / l23;
								minvX4 = nX4 * l23;
								minvY4 = nY4 * l23;
								minvZ4 = nZ4 * l23;
								var v144 = closest;
								v144[0] = minvX4;
								v144[1] = minvY4;
								v144[2] = minvZ4;
								b14 = 7;
							}
							var d29 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
							if (mind1 < 0 || d29 < mind1) {
								mini1 = b14 & 3 | (b14 & 4) << 1;
								mind1 = d29;
								var v145 = closest;
								minvX1 = v145[0];
								minvY1 = v145[1];
								minvZ1 = v145[2];
							}
						}
						if (d243 * sign < 0) {
							var v146;
							var v1X18;
							var v1Y18;
							var v1Z18;
							var v224;
							var v2X18;
							var v2Y18;
							var v2Z18;
							var v318;
							var v3X5;
							var v3Y5;
							var v3Z5;
							var v1218;
							var v12X18;
							var v12Y18;
							var v12Z18;
							var v235;
							var v23X5;
							var v23Y5;
							var v23Z5;
							var v319;
							var v31X4;
							var v31Y4;
							var v31Z4;
							var v147 = vec21;
							v1X18 = v147[0];
							v1Y18 = v147[1];
							v1Z18 = v147[2];
							var v148 = vec31;
							v2X18 = v148[0];
							v2Y18 = v148[1];
							v2Z18 = v148[2];
							var v149 = vec4;
							v3X5 = v149[0];
							v3Y5 = v149[1];
							v3Z5 = v149[2];
							v12X18 = v2X18 - v1X18;
							v12Y18 = v2Y18 - v1Y18;
							v12Z18 = v2Z18 - v1Z18;
							v23X5 = v3X5 - v2X18;
							v23Y5 = v3Y5 - v2Y18;
							v23Z5 = v3Z5 - v2Z18;
							v31X4 = v1X18 - v3X5;
							v31Y4 = v1Y18 - v3Y5;
							v31Z4 = v1Z18 - v3Z5;
							var n5;
							var nX5;
							var nY5;
							var nZ5;
							nX5 = v12Y18 * v23Z5 - v12Z18 * v23Y5;
							nY5 = v12Z18 * v23X5 - v12X18 * v23Z5;
							nZ5 = v12X18 * v23Y5 - v12Y18 * v23X5;
							var n125;
							var n12X4;
							var n12Y4;
							var n12Z4;
							var n234;
							var n23X4;
							var n23Y4;
							var n23Z4;
							var n314;
							var n31X4;
							var n31Y4;
							var n31Z4;
							n12X4 = v12Y18 * nZ5 - v12Z18 * nY5;
							n12Y4 = v12Z18 * nX5 - v12X18 * nZ5;
							n12Z4 = v12X18 * nY5 - v12Y18 * nX5;
							n23X4 = v23Y5 * nZ5 - v23Z5 * nY5;
							n23Y4 = v23Z5 * nX5 - v23X5 * nZ5;
							n23Z4 = v23X5 * nY5 - v23Y5 * nX5;
							n31X4 = v31Y4 * nZ5 - v31Z4 * nY5;
							n31Y4 = v31Z4 * nX5 - v31X4 * nZ5;
							n31Z4 = v31X4 * nY5 - v31Y4 * nX5;
							var d125 = v1X18 * n12X4 + v1Y18 * n12Y4 + v1Z18 * n12Z4;
							var d234 = v2X18 * n23X4 + v2Y18 * n23Y4 + v2Z18 * n23Z4;
							var d314 = v3X5 * n31X4 + v3Y5 * n31Y4 + v3Z5 * n31Z4;
							var mind5 = -1;
							var minv5;
							var minvX5;
							var minvY5;
							var minvZ5;
							var mini5 = 0;
							minvX5 = 0;
							minvY5 = 0;
							minvZ5 = 0;
							if (d125 < 0) {
								var v150;
								var v1X19;
								var v1Y19;
								var v1Z19;
								var v225;
								var v2X19;
								var v2Y19;
								var v2Z19;
								var v151 = vec21;
								v1X19 = v151[0];
								v1Y19 = v151[1];
								v1Z19 = v151[2];
								var v152 = vec31;
								v2X19 = v152[0];
								v2Y19 = v152[1];
								v2Z19 = v152[2];
								var v1219;
								var v12X19;
								var v12Y19;
								var v12Z19;
								v12X19 = v2X19 - v1X19;
								v12Y19 = v2Y19 - v1Y19;
								v12Z19 = v2Z19 - v1Z19;
								var d30 = v12X19 * v12X19 + v12Y19 * v12Y19 + v12Z19 * v12Z19;
								var t13 = v12X19 * v1X19 + v12Y19 * v1Y19 + v12Z19 * v1Z19;
								t13 = -t13 / d30;
								var b15;
								if (t13 < 0) {
									var v153 = closest;
									v153[0] = v1X19;
									v153[1] = v1Y19;
									v153[2] = v1Z19;
									b15 = 1;
								} else if (t13 > 1) {
									var v154 = closest;
									v154[0] = v2X19;
									v154[1] = v2Y19;
									v154[2] = v2Z19;
									b15 = 2;
								} else {
									var p13;
									var pX13;
									var pY13;
									var pZ13;
									pX13 = v1X19 + v12X19 * t13;
									pY13 = v1Y19 + v12Y19 * t13;
									pZ13 = v1Z19 + v12Z19 * t13;
									var v155 = closest;
									v155[0] = pX13;
									v155[1] = pY13;
									v155[2] = pZ13;
									b15 = 3;
								}
								var d32 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								mini5 = b15;
								mind5 = d32;
								var v156 = closest;
								minvX5 = v156[0];
								minvY5 = v156[1];
								minvZ5 = v156[2];
							}
							if (d234 < 0) {
								var v157;
								var v1X20;
								var v1Y20;
								var v1Z20;
								var v226;
								var v2X20;
								var v2Y20;
								var v2Z20;
								var v158 = vec31;
								v1X20 = v158[0];
								v1Y20 = v158[1];
								v1Z20 = v158[2];
								var v159 = vec4;
								v2X20 = v159[0];
								v2Y20 = v159[1];
								v2Z20 = v159[2];
								var v1220;
								var v12X20;
								var v12Y20;
								var v12Z20;
								v12X20 = v2X20 - v1X20;
								v12Y20 = v2Y20 - v1Y20;
								v12Z20 = v2Z20 - v1Z20;
								var d33 = v12X20 * v12X20 + v12Y20 * v12Y20 + v12Z20 * v12Z20;
								var t14 = v12X20 * v1X20 + v12Y20 * v1Y20 + v12Z20 * v1Z20;
								t14 = -t14 / d33;
								var b16;
								if (t14 < 0) {
									var v160 = closest;
									v160[0] = v1X20;
									v160[1] = v1Y20;
									v160[2] = v1Z20;
									b16 = 1;
								} else if (t14 > 1) {
									var v161 = closest;
									v161[0] = v2X20;
									v161[1] = v2Y20;
									v161[2] = v2Z20;
									b16 = 2;
								} else {
									var p14;
									var pX14;
									var pY14;
									var pZ14;
									pX14 = v1X20 + v12X20 * t14;
									pY14 = v1Y20 + v12Y20 * t14;
									pZ14 = v1Z20 + v12Z20 * t14;
									var v162 = closest;
									v162[0] = pX14;
									v162[1] = pY14;
									v162[2] = pZ14;
									b16 = 3;
								}
								var d34 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind5 < 0 || d34 < mind5) {
									mini5 = b16 << 1;
									mind5 = d34;
									var v163 = closest;
									minvX5 = v163[0];
									minvY5 = v163[1];
									minvZ5 = v163[2];
								}
							}
							if (d314 < 0) {
								var v164;
								var v1X21;
								var v1Y21;
								var v1Z21;
								var v227;
								var v2X21;
								var v2Y21;
								var v2Z21;
								var v165 = vec21;
								v1X21 = v165[0];
								v1Y21 = v165[1];
								v1Z21 = v165[2];
								var v166 = vec4;
								v2X21 = v166[0];
								v2Y21 = v166[1];
								v2Z21 = v166[2];
								var v1221;
								var v12X21;
								var v12Y21;
								var v12Z21;
								v12X21 = v2X21 - v1X21;
								v12Y21 = v2Y21 - v1Y21;
								v12Z21 = v2Z21 - v1Z21;
								var d35 = v12X21 * v12X21 + v12Y21 * v12Y21 + v12Z21 * v12Z21;
								var t15 = v12X21 * v1X21 + v12Y21 * v1Y21 + v12Z21 * v1Z21;
								t15 = -t15 / d35;
								var b17;
								if (t15 < 0) {
									var v167 = closest;
									v167[0] = v1X21;
									v167[1] = v1Y21;
									v167[2] = v1Z21;
									b17 = 1;
								} else if (t15 > 1) {
									var v168 = closest;
									v168[0] = v2X21;
									v168[1] = v2Y21;
									v168[2] = v2Z21;
									b17 = 2;
								} else {
									var p15;
									var pX15;
									var pY15;
									var pZ15;
									pX15 = v1X21 + v12X21 * t15;
									pY15 = v1Y21 + v12Y21 * t15;
									pZ15 = v1Z21 + v12Z21 * t15;
									var v169 = closest;
									v169[0] = pX15;
									v169[1] = pY15;
									v169[2] = pZ15;
									b17 = 3;
								}
								var d36 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind5 < 0 || d36 < mind5) {
									mini5 = b17 & 1 | (b17 & 2) << 1;
									mind5 = d36;
									var v170 = closest;
									minvX5 = v170[0];
									minvY5 = v170[1];
									minvZ5 = v170[2];
								}
							}
							var b18;
							if (mind5 > 0) {
								var v171 = closest;
								v171[0] = minvX5;
								v171[1] = minvY5;
								v171[2] = minvZ5;
								b18 = mini5;
							} else {
								var l5 = nX5 * nX5 + nY5 * nY5 + nZ5 * nZ5;
								if (l5 > 0) {
									l5 = 1 / Math.sqrt(l5);
								}
								nX5 *= l5;
								nY5 *= l5;
								nZ5 *= l5;
								var dn4 = v1X18 * nX5 + v1Y18 * nY5 + v1Z18 * nZ5;
								var l24 = nX5 * nX5 + nY5 * nY5 + nZ5 * nZ5;
								l24 = dn4 / l24;
								minvX5 = nX5 * l24;
								minvY5 = nY5 * l24;
								minvZ5 = nZ5 * l24;
								var v172 = closest;
								v172[0] = minvX5;
								v172[1] = minvY5;
								v172[2] = minvZ5;
								b18 = 7;
							}
							var d37 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
							if (mind1 < 0 || d37 < mind1) {
								mini1 = b18 << 1;
								mind1 = d37;
								var v173 = closest;
								minvX1 = v173[0];
								minvY1 = v173[1];
								minvZ1 = v173[2];
							}
						}
						if (mind1 > 0) {
							var v174 = closest;
							v174[0] = minvX1;
							v174[1] = minvY1;
							v174[2] = minvZ1;
							v3 = mini1;
						} else {
							
							math.vec3_zero$(closest)
							v3 = 15;
						}
						break;
				}
				if (closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2] < eps2) {
					if (!useEpa) {
						this.distance = 0;
						return 0;
					}
					var _g1 = this.simplexSize;
					switch (_g1) {
						case 1:
							this.pointToTetrahedron();
							break;
						case 2:
							this.lineToTetrahedron();
							break;
						case 3:
							this.triangleToTetrahedron();
							break;
					}
					if (this.simplexSize == 4) {
						var epaState = this.computeDepth(c1, c2, tf1, tf2, s, w1, w2);
						if (epaState != 0) {
							this.distance = 0;
							return epaState;
						}
						this.distance = -this.depth;
						return 0;
					}
					this.distance = 0;
					return 1;
				}
				this.shrinkSimplex(v3);
				dir[0] = closest[0];
				dir[1] = closest[1];
				dir[2] = closest[2];
				var _this2 = dir;
				var tx1 = -_this2[0];
				var ty1 = -_this2[1];
				var tz1 = -_this2[2];
				_this2[0] = tx1;
				_this2[1] = ty1;
				_this2[2] = tz1;
				this.computeWitnessPoint1(false);
				this.computeWitnessPoint2(false);
				var _this3 = this.s[this.simplexSize];
				var v175 = this.w1[this.simplexSize];
				_this3[0] = v175[0];
				_this3[1] = v175[1];
				_this3[2] = v175[2];
				var _this4 = _this3;
				var v176 = this.w2[this.simplexSize];
				var tx2 = _this4[0] - v176[0];
				var ty2 = _this4[1] - v176[1];
				var tz2 = _this4[2] - v176[2];
				_this4[0] = tx2;
				_this4[1] = ty2;
				_this4[2] = tz2;
				if (dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2] < eps2) {
					throw new Error("!?");
				}
				var d110 = closest[0] * dir[0] + closest[1] * dir[1] + closest[2] * dir[2];
				var _this5 = s[this.simplexSize];
				var d210 = _this5[0] * dir[0] + _this5[1] * dir[1] + _this5[2] * dir[2];
				if (d210 - d110 < eps2) {
					this.interpolateClosestPoints();
					this.distance = Math.sqrt(closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2]);
					if (cache != null && cache._gjkCache != null) {
						this.saveCache(cache._gjkCache);
					}
					return 0;
				}
				this.simplexSize++;
				++count;
			}
			return 2;
		}

		proto.convexCastImpl = function (c1, c2, tf1, tf2, tl1, tl2, hit) {
			this.c1 = c1;
			this.c2 = c2;
			this.tf1 = tf1;
			this.tf2 = tf2;
			var s = this.s;
			var w1 = this.w1;
			var w2 = this.w2;
			var closest = this.closest;
			var dir = this.dir;
			var firstDir;
			var firstDirX;
			var firstDirY;
			var firstDirZ;
			firstDirX = tf2._position[0] - tf1._position[0];
			firstDirY = tf2._position[1] - tf1._position[1];
			firstDirZ = tf2._position[2] - tf1._position[2];
			var v = dir;
			v[0] = firstDirX;
			v[1] = firstDirY;
			v[2] = firstDirZ;
			if (dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2] < 1e-6) {
				dir.init(1, 0, 0);
			}
			this.simplexSize = 0;
			if (this.c1 != null) {
				this.computeWitnessPoint1(true);
			} else {
				var v1 = this.w1[this.simplexSize];
				v1[0] = this.tf1._position[0];
				v1[1] = this.tf1._position[1];
				v1[2] = this.tf1._position[2];
			}
			this.computeWitnessPoint2(true);
			var _this = this.s[this.simplexSize];
			var v2 = this.w1[this.simplexSize];
			_this[0] = v2[0];
			_this[1] = v2[1];
			_this[2] = v2[2];
			var _this1 = _this;
			var v3 = this.w2[this.simplexSize];
			var tx = _this1[0] - v3[0];
			var ty = _this1[1] - v3[1];
			var tz = _this1[2] - v3[2];
			_this1[0] = tx;
			_this1[1] = ty;
			_this1[2] = tz;
			this.simplexSize = 1;
			var count = 0;
			var max = 40;
			var lambda = 0.0;
			var rayX = this.rayX;
			var rayR = this.rayR;
			
			math.vec3_zero$(rayX)
			rayR[0] = tl2[0];
			rayR[1] = tl2[1];
			rayR[2] = tl2[2];
			var _this2 = rayR;
			var tx1 = _this2[0] - tl1[0];
			var ty1 = _this2[1] - tl1[1];
			var tz1 = _this2[2] - tl1[2];
			_this2[0] = tx1;
			_this2[1] = ty1;
			_this2[2] = tz1;
			var eps = 1e-4;
			var eps2 = eps * eps;
			while (count < max) {
				var v4 = 0;
				var _g = this.simplexSize;
				switch (_g) {
					case 1:
						var v5 = s[0];
						closest[0] = v5[0];
						closest[1] = v5[1];
						closest[2] = v5[2];
						v4 = 1;
						break;
					case 2:
						var v11;
						var v1X;
						var v1Y;
						var v1Z;
						var v21;
						var v2X;
						var v2Y;
						var v2Z;
						var v6 = s[0];
						v1X = v6[0];
						v1Y = v6[1];
						v1Z = v6[2];
						var v7 = s[1];
						v2X = v7[0];
						v2Y = v7[1];
						v2Z = v7[2];
						var v12;
						var v12X;
						var v12Y;
						var v12Z;
						v12X = v2X - v1X;
						v12Y = v2Y - v1Y;
						v12Z = v2Z - v1Z;
						var d = v12X * v12X + v12Y * v12Y + v12Z * v12Z;
						var t = v12X * v1X + v12Y * v1Y + v12Z * v1Z;
						t = -t / d;
						if (t < 0) {
							var v8 = closest;
							v8[0] = v1X;
							v8[1] = v1Y;
							v8[2] = v1Z;
							v4 = 1;
						} else if (t > 1) {
							var v9 = closest;
							v9[0] = v2X;
							v9[1] = v2Y;
							v9[2] = v2Z;
							v4 = 2;
						} else {
							var p;
							var pX;
							var pY;
							var pZ;
							pX = v1X + v12X * t;
							pY = v1Y + v12Y * t;
							pZ = v1Z + v12Z * t;
							var v10 = closest;
							v10[0] = pX;
							v10[1] = pY;
							v10[2] = pZ;
							v4 = 3;
						}
						break;
					case 3:
						var vec1 = s[0];
						var vec2 = s[1];
						var vec3 = s[2];
						var v13;
						var v1X1;
						var v1Y1;
						var v1Z1;
						var v22;
						var v2X1;
						var v2Y1;
						var v2Z1;
						var v31;
						var v3X;
						var v3Y;
						var v3Z;
						var v121;
						var v12X1;
						var v12Y1;
						var v12Z1;
						var v23;
						var v23X;
						var v23Y;
						var v23Z;
						var v311;
						var v31X;
						var v31Y;
						var v31Z;
						var v14 = vec1;
						v1X1 = v14[0];
						v1Y1 = v14[1];
						v1Z1 = v14[2];
						var v15 = vec2;
						v2X1 = v15[0];
						v2Y1 = v15[1];
						v2Z1 = v15[2];
						var v16 = vec3;
						v3X = v16[0];
						v3Y = v16[1];
						v3Z = v16[2];
						v12X1 = v2X1 - v1X1;
						v12Y1 = v2Y1 - v1Y1;
						v12Z1 = v2Z1 - v1Z1;
						v23X = v3X - v2X1;
						v23Y = v3Y - v2Y1;
						v23Z = v3Z - v2Z1;
						v31X = v1X1 - v3X;
						v31Y = v1Y1 - v3Y;
						v31Z = v1Z1 - v3Z;
						var n;
						var nX;
						var nY;
						var nZ;
						nX = v12Y1 * v23Z - v12Z1 * v23Y;
						nY = v12Z1 * v23X - v12X1 * v23Z;
						nZ = v12X1 * v23Y - v12Y1 * v23X;
						var n12;
						var n12X;
						var n12Y;
						var n12Z;
						var n23;
						var n23X;
						var n23Y;
						var n23Z;
						var n31;
						var n31X;
						var n31Y;
						var n31Z;
						n12X = v12Y1 * nZ - v12Z1 * nY;
						n12Y = v12Z1 * nX - v12X1 * nZ;
						n12Z = v12X1 * nY - v12Y1 * nX;
						n23X = v23Y * nZ - v23Z * nY;
						n23Y = v23Z * nX - v23X * nZ;
						n23Z = v23X * nY - v23Y * nX;
						n31X = v31Y * nZ - v31Z * nY;
						n31Y = v31Z * nX - v31X * nZ;
						n31Z = v31X * nY - v31Y * nX;
						var d12 = v1X1 * n12X + v1Y1 * n12Y + v1Z1 * n12Z;
						var d23 = v2X1 * n23X + v2Y1 * n23Y + v2Z1 * n23Z;
						var d31 = v3X * n31X + v3Y * n31Y + v3Z * n31Z;
						var mind = -1;
						var minv;
						var minvX;
						var minvY;
						var minvZ;
						var mini = 0;
						minvX = 0;
						minvY = 0;
						minvZ = 0;
						if (d12 < 0) {
							var v17;
							var v1X2;
							var v1Y2;
							var v1Z2;
							var v24;
							var v2X2;
							var v2Y2;
							var v2Z2;
							var v18 = vec1;
							v1X2 = v18[0];
							v1Y2 = v18[1];
							v1Z2 = v18[2];
							var v19 = vec2;
							v2X2 = v19[0];
							v2Y2 = v19[1];
							v2Z2 = v19[2];
							var v122;
							var v12X2;
							var v12Y2;
							var v12Z2;
							v12X2 = v2X2 - v1X2;
							v12Y2 = v2Y2 - v1Y2;
							v12Z2 = v2Z2 - v1Z2;
							var d1 = v12X2 * v12X2 + v12Y2 * v12Y2 + v12Z2 * v12Z2;
							var t1 = v12X2 * v1X2 + v12Y2 * v1Y2 + v12Z2 * v1Z2;
							t1 = -t1 / d1;
							var b;
							if (t1 < 0) {
								var v20 = closest;
								v20[0] = v1X2;
								v20[1] = v1Y2;
								v20[2] = v1Z2;
								b = 1;
							} else if (t1 > 1) {
								var v25 = closest;
								v25[0] = v2X2;
								v25[1] = v2Y2;
								v25[2] = v2Z2;
								b = 2;
							} else {
								var p1;
								var pX1;
								var pY1;
								var pZ1;
								pX1 = v1X2 + v12X2 * t1;
								pY1 = v1Y2 + v12Y2 * t1;
								pZ1 = v1Z2 + v12Z2 * t1;
								var v26 = closest;
								v26[0] = pX1;
								v26[1] = pY1;
								v26[2] = pZ1;
								b = 3;
							}
							var d2 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
							mini = b;
							mind = d2;
							var v27 = closest;
							minvX = v27[0];
							minvY = v27[1];
							minvZ = v27[2];
						}
						if (d23 < 0) {
							var v110;
							var v1X3;
							var v1Y3;
							var v1Z3;
							var v28;
							var v2X3;
							var v2Y3;
							var v2Z3;
							var v29 = vec2;
							v1X3 = v29[0];
							v1Y3 = v29[1];
							v1Z3 = v29[2];
							var v30 = vec3;
							v2X3 = v30[0];
							v2Y3 = v30[1];
							v2Z3 = v30[2];
							var v123;
							var v12X3;
							var v12Y3;
							var v12Z3;
							v12X3 = v2X3 - v1X3;
							v12Y3 = v2Y3 - v1Y3;
							v12Z3 = v2Z3 - v1Z3;
							var d3 = v12X3 * v12X3 + v12Y3 * v12Y3 + v12Z3 * v12Z3;
							var t2 = v12X3 * v1X3 + v12Y3 * v1Y3 + v12Z3 * v1Z3;
							t2 = -t2 / d3;
							var b1;
							if (t2 < 0) {
								var v32 = closest;
								v32[0] = v1X3;
								v32[1] = v1Y3;
								v32[2] = v1Z3;
								b1 = 1;
							} else if (t2 > 1) {
								var v33 = closest;
								v33[0] = v2X3;
								v33[1] = v2Y3;
								v33[2] = v2Z3;
								b1 = 2;
							} else {
								var p2;
								var pX2;
								var pY2;
								var pZ2;
								pX2 = v1X3 + v12X3 * t2;
								pY2 = v1Y3 + v12Y3 * t2;
								pZ2 = v1Z3 + v12Z3 * t2;
								var v34 = closest;
								v34[0] = pX2;
								v34[1] = pY2;
								v34[2] = pZ2;
								b1 = 3;
							}
							var d4 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
							if (mind < 0 || d4 < mind) {
								mini = b1 << 1;
								mind = d4;
								var v35 = closest;
								minvX = v35[0];
								minvY = v35[1];
								minvZ = v35[2];
							}
						}
						if (d31 < 0) {
							var v111;
							var v1X4;
							var v1Y4;
							var v1Z4;
							var v210;
							var v2X4;
							var v2Y4;
							var v2Z4;
							var v36 = vec1;
							v1X4 = v36[0];
							v1Y4 = v36[1];
							v1Z4 = v36[2];
							var v37 = vec3;
							v2X4 = v37[0];
							v2Y4 = v37[1];
							v2Z4 = v37[2];
							var v124;
							var v12X4;
							var v12Y4;
							var v12Z4;
							v12X4 = v2X4 - v1X4;
							v12Y4 = v2Y4 - v1Y4;
							v12Z4 = v2Z4 - v1Z4;
							var d5 = v12X4 * v12X4 + v12Y4 * v12Y4 + v12Z4 * v12Z4;
							var t3 = v12X4 * v1X4 + v12Y4 * v1Y4 + v12Z4 * v1Z4;
							t3 = -t3 / d5;
							var b2;
							if (t3 < 0) {
								var v38 = closest;
								v38[0] = v1X4;
								v38[1] = v1Y4;
								v38[2] = v1Z4;
								b2 = 1;
							} else if (t3 > 1) {
								var v39 = closest;
								v39[0] = v2X4;
								v39[1] = v2Y4;
								v39[2] = v2Z4;
								b2 = 2;
							} else {
								var p3;
								var pX3;
								var pY3;
								var pZ3;
								pX3 = v1X4 + v12X4 * t3;
								pY3 = v1Y4 + v12Y4 * t3;
								pZ3 = v1Z4 + v12Z4 * t3;
								var v40 = closest;
								v40[0] = pX3;
								v40[1] = pY3;
								v40[2] = pZ3;
								b2 = 3;
							}
							var d6 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
							if (mind < 0 || d6 < mind) {
								mini = b2 & 1 | (b2 & 2) << 1;
								mind = d6;
								var v41 = closest;
								minvX = v41[0];
								minvY = v41[1];
								minvZ = v41[2];
							}
						}
						if (mind > 0) {
							var v42 = closest;
							v42[0] = minvX;
							v42[1] = minvY;
							v42[2] = minvZ;
							v4 = mini;
						} else {
							var l = nX * nX + nY * nY + nZ * nZ;
							if (l > 0) {
								l = 1 / Math.sqrt(l);
							}
							nX *= l;
							nY *= l;
							nZ *= l;
							var dn = v1X1 * nX + v1Y1 * nY + v1Z1 * nZ;
							var l2 = nX * nX + nY * nY + nZ * nZ;
							l2 = dn / l2;
							minvX = nX * l2;
							minvY = nY * l2;
							minvZ = nZ * l2;
							var v43 = closest;
							v43[0] = minvX;
							v43[1] = minvY;
							v43[2] = minvZ;
							v4 = 7;
						}
						break;
					case 4:
						var vec11 = s[0];
						var vec21 = s[1];
						var vec31 = s[2];
						var vec4 = s[3];
						var v112;
						var v1X5;
						var v1Y5;
						var v1Z5;
						var v211;
						var v2X5;
						var v2Y5;
						var v2Z5;
						var v310;
						var v3X1;
						var v3Y1;
						var v3Z1;
						var v44;
						var v4X;
						var v4Y;
						var v4Z;
						var v125;
						var v12X5;
						var v12Y5;
						var v12Z5;
						var v131;
						var v13X;
						var v13Y;
						var v13Z;
						var v141;
						var v14X;
						var v14Y;
						var v14Z;
						var v231;
						var v23X1;
						var v23Y1;
						var v23Z1;
						var v241;
						var v24X;
						var v24Y;
						var v24Z;
						var v341;
						var v34X;
						var v34Y;
						var v34Z;
						var v45 = vec11;
						v1X5 = v45[0];
						v1Y5 = v45[1];
						v1Z5 = v45[2];
						var v46 = vec21;
						v2X5 = v46[0];
						v2Y5 = v46[1];
						v2Z5 = v46[2];
						var v47 = vec31;
						v3X1 = v47[0];
						v3Y1 = v47[1];
						v3Z1 = v47[2];
						var v48 = vec4;
						v4X = v48[0];
						v4Y = v48[1];
						v4Z = v48[2];
						v12X5 = v2X5 - v1X5;
						v12Y5 = v2Y5 - v1Y5;
						v12Z5 = v2Z5 - v1Z5;
						v13X = v3X1 - v1X5;
						v13Y = v3Y1 - v1Y5;
						v13Z = v3Z1 - v1Z5;
						v14X = v4X - v1X5;
						v14Y = v4Y - v1Y5;
						v14Z = v4Z - v1Z5;
						v23X1 = v3X1 - v2X5;
						v23Y1 = v3Y1 - v2Y5;
						v23Z1 = v3Z1 - v2Z5;
						v24X = v4X - v2X5;
						v24Y = v4Y - v2Y5;
						v24Z = v4Z - v2Z5;
						v34X = v4X - v3X1;
						v34Y = v4Y - v3Y1;
						v34Z = v4Z - v3Z1;
						var rev;
						var n123;
						var n123X;
						var n123Y;
						var n123Z;
						var n134;
						var n134X;
						var n134Y;
						var n134Z;
						var n142;
						var n142X;
						var n142Y;
						var n142Z;
						var n243;
						var n243X;
						var n243Y;
						var n243Z;
						var n1;
						var nX1;
						var nY1;
						var nZ1;
						n123X = v12Y5 * v13Z - v12Z5 * v13Y;
						n123Y = v12Z5 * v13X - v12X5 * v13Z;
						n123Z = v12X5 * v13Y - v12Y5 * v13X;
						n134X = v13Y * v14Z - v13Z * v14Y;
						n134Y = v13Z * v14X - v13X * v14Z;
						n134Z = v13X * v14Y - v13Y * v14X;
						n142X = v14Y * v12Z5 - v14Z * v12Y5;
						n142Y = v14Z * v12X5 - v14X * v12Z5;
						n142Z = v14X * v12Y5 - v14Y * v12X5;
						n243X = v24Y * v23Z1 - v24Z * v23Y1;
						n243Y = v24Z * v23X1 - v24X * v23Z1;
						n243Z = v24X * v23Y1 - v24Y * v23X1;
						var sign = v12X5 * n243X + v12Y5 * n243Y + v12Z5 * n243Z > 0 ? 1 : -1;
						var d123 = v1X5 * n123X + v1Y5 * n123Y + v1Z5 * n123Z;
						var d134 = v1X5 * n134X + v1Y5 * n134Y + v1Z5 * n134Z;
						var d142 = v1X5 * n142X + v1Y5 * n142Y + v1Z5 * n142Z;
						var d243 = v2X5 * n243X + v2Y5 * n243Y + v2Z5 * n243Z;
						var mind1 = -1;
						var minv1;
						var minvX1;
						var minvY1;
						var minvZ1;
						var mini1 = 0;
						minvX1 = 0;
						minvY1 = 0;
						minvZ1 = 0;
						if (d123 * sign < 0) {
							var v113;
							var v1X6;
							var v1Y6;
							var v1Z6;
							var v212;
							var v2X6;
							var v2Y6;
							var v2Z6;
							var v312;
							var v3X2;
							var v3Y2;
							var v3Z2;
							var v126;
							var v12X6;
							var v12Y6;
							var v12Z6;
							var v232;
							var v23X2;
							var v23Y2;
							var v23Z2;
							var v313;
							var v31X1;
							var v31Y1;
							var v31Z1;
							var v49 = vec11;
							v1X6 = v49[0];
							v1Y6 = v49[1];
							v1Z6 = v49[2];
							var v50 = vec21;
							v2X6 = v50[0];
							v2Y6 = v50[1];
							v2Z6 = v50[2];
							var v51 = vec31;
							v3X2 = v51[0];
							v3Y2 = v51[1];
							v3Z2 = v51[2];
							v12X6 = v2X6 - v1X6;
							v12Y6 = v2Y6 - v1Y6;
							v12Z6 = v2Z6 - v1Z6;
							v23X2 = v3X2 - v2X6;
							v23Y2 = v3Y2 - v2Y6;
							v23Z2 = v3Z2 - v2Z6;
							v31X1 = v1X6 - v3X2;
							v31Y1 = v1Y6 - v3Y2;
							v31Z1 = v1Z6 - v3Z2;
							var n2;
							var nX2;
							var nY2;
							var nZ2;
							nX2 = v12Y6 * v23Z2 - v12Z6 * v23Y2;
							nY2 = v12Z6 * v23X2 - v12X6 * v23Z2;
							nZ2 = v12X6 * v23Y2 - v12Y6 * v23X2;
							var n121;
							var n12X1;
							var n12Y1;
							var n12Z1;
							var n231;
							var n23X1;
							var n23Y1;
							var n23Z1;
							var n311;
							var n31X1;
							var n31Y1;
							var n31Z1;
							n12X1 = v12Y6 * nZ2 - v12Z6 * nY2;
							n12Y1 = v12Z6 * nX2 - v12X6 * nZ2;
							n12Z1 = v12X6 * nY2 - v12Y6 * nX2;
							n23X1 = v23Y2 * nZ2 - v23Z2 * nY2;
							n23Y1 = v23Z2 * nX2 - v23X2 * nZ2;
							n23Z1 = v23X2 * nY2 - v23Y2 * nX2;
							n31X1 = v31Y1 * nZ2 - v31Z1 * nY2;
							n31Y1 = v31Z1 * nX2 - v31X1 * nZ2;
							n31Z1 = v31X1 * nY2 - v31Y1 * nX2;
							var d121 = v1X6 * n12X1 + v1Y6 * n12Y1 + v1Z6 * n12Z1;
							var d231 = v2X6 * n23X1 + v2Y6 * n23Y1 + v2Z6 * n23Z1;
							var d311 = v3X2 * n31X1 + v3Y2 * n31Y1 + v3Z2 * n31Z1;
							var mind2 = -1;
							var minv2;
							var minvX2;
							var minvY2;
							var minvZ2;
							var mini2 = 0;
							minvX2 = 0;
							minvY2 = 0;
							minvZ2 = 0;
							if (d121 < 0) {
								var v114;
								var v1X7;
								var v1Y7;
								var v1Z7;
								var v213;
								var v2X7;
								var v2Y7;
								var v2Z7;
								var v52 = vec11;
								v1X7 = v52[0];
								v1Y7 = v52[1];
								v1Z7 = v52[2];
								var v53 = vec21;
								v2X7 = v53[0];
								v2Y7 = v53[1];
								v2Z7 = v53[2];
								var v127;
								var v12X7;
								var v12Y7;
								var v12Z7;
								v12X7 = v2X7 - v1X7;
								v12Y7 = v2Y7 - v1Y7;
								v12Z7 = v2Z7 - v1Z7;
								var d7 = v12X7 * v12X7 + v12Y7 * v12Y7 + v12Z7 * v12Z7;
								var t4 = v12X7 * v1X7 + v12Y7 * v1Y7 + v12Z7 * v1Z7;
								t4 = -t4 / d7;
								var b3;
								if (t4 < 0) {
									var v54 = closest;
									v54[0] = v1X7;
									v54[1] = v1Y7;
									v54[2] = v1Z7;
									b3 = 1;
								} else if (t4 > 1) {
									var v55 = closest;
									v55[0] = v2X7;
									v55[1] = v2Y7;
									v55[2] = v2Z7;
									b3 = 2;
								} else {
									var p4;
									var pX4;
									var pY4;
									var pZ4;
									pX4 = v1X7 + v12X7 * t4;
									pY4 = v1Y7 + v12Y7 * t4;
									pZ4 = v1Z7 + v12Z7 * t4;
									var v56 = closest;
									v56[0] = pX4;
									v56[1] = pY4;
									v56[2] = pZ4;
									b3 = 3;
								}
								var d8 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								mini2 = b3;
								mind2 = d8;
								var v57 = closest;
								minvX2 = v57[0];
								minvY2 = v57[1];
								minvZ2 = v57[2];
							}
							if (d231 < 0) {
								var v115;
								var v1X8;
								var v1Y8;
								var v1Z8;
								var v214;
								var v2X8;
								var v2Y8;
								var v2Z8;
								var v58 = vec21;
								v1X8 = v58[0];
								v1Y8 = v58[1];
								v1Z8 = v58[2];
								var v59 = vec31;
								v2X8 = v59[0];
								v2Y8 = v59[1];
								v2Z8 = v59[2];
								var v128;
								var v12X8;
								var v12Y8;
								var v12Z8;
								v12X8 = v2X8 - v1X8;
								v12Y8 = v2Y8 - v1Y8;
								v12Z8 = v2Z8 - v1Z8;
								var d9 = v12X8 * v12X8 + v12Y8 * v12Y8 + v12Z8 * v12Z8;
								var t5 = v12X8 * v1X8 + v12Y8 * v1Y8 + v12Z8 * v1Z8;
								t5 = -t5 / d9;
								var b4;
								if (t5 < 0) {
									var v60 = closest;
									v60[0] = v1X8;
									v60[1] = v1Y8;
									v60[2] = v1Z8;
									b4 = 1;
								} else if (t5 > 1) {
									var v61 = closest;
									v61[0] = v2X8;
									v61[1] = v2Y8;
									v61[2] = v2Z8;
									b4 = 2;
								} else {
									var p5;
									var pX5;
									var pY5;
									var pZ5;
									pX5 = v1X8 + v12X8 * t5;
									pY5 = v1Y8 + v12Y8 * t5;
									pZ5 = v1Z8 + v12Z8 * t5;
									var v62 = closest;
									v62[0] = pX5;
									v62[1] = pY5;
									v62[2] = pZ5;
									b4 = 3;
								}
								var d10 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind2 < 0 || d10 < mind2) {
									mini2 = b4 << 1;
									mind2 = d10;
									var v63 = closest;
									minvX2 = v63[0];
									minvY2 = v63[1];
									minvZ2 = v63[2];
								}
							}
							if (d311 < 0) {
								var v116;
								var v1X9;
								var v1Y9;
								var v1Z9;
								var v215;
								var v2X9;
								var v2Y9;
								var v2Z9;
								var v64 = vec11;
								v1X9 = v64[0];
								v1Y9 = v64[1];
								v1Z9 = v64[2];
								var v65 = vec31;
								v2X9 = v65[0];
								v2Y9 = v65[1];
								v2Z9 = v65[2];
								var v129;
								var v12X9;
								var v12Y9;
								var v12Z9;
								v12X9 = v2X9 - v1X9;
								v12Y9 = v2Y9 - v1Y9;
								v12Z9 = v2Z9 - v1Z9;
								var d11 = v12X9 * v12X9 + v12Y9 * v12Y9 + v12Z9 * v12Z9;
								var t6 = v12X9 * v1X9 + v12Y9 * v1Y9 + v12Z9 * v1Z9;
								t6 = -t6 / d11;
								var b5;
								if (t6 < 0) {
									var v66 = closest;
									v66[0] = v1X9;
									v66[1] = v1Y9;
									v66[2] = v1Z9;
									b5 = 1;
								} else if (t6 > 1) {
									var v67 = closest;
									v67[0] = v2X9;
									v67[1] = v2Y9;
									v67[2] = v2Z9;
									b5 = 2;
								} else {
									var p6;
									var pX6;
									var pY6;
									var pZ6;
									pX6 = v1X9 + v12X9 * t6;
									pY6 = v1Y9 + v12Y9 * t6;
									pZ6 = v1Z9 + v12Z9 * t6;
									var v68 = closest;
									v68[0] = pX6;
									v68[1] = pY6;
									v68[2] = pZ6;
									b5 = 3;
								}
								var d13 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind2 < 0 || d13 < mind2) {
									mini2 = b5 & 1 | (b5 & 2) << 1;
									mind2 = d13;
									var v69 = closest;
									minvX2 = v69[0];
									minvY2 = v69[1];
									minvZ2 = v69[2];
								}
							}
							var b6;
							if (mind2 > 0) {
								var v70 = closest;
								v70[0] = minvX2;
								v70[1] = minvY2;
								v70[2] = minvZ2;
								b6 = mini2;
							} else {
								var l1 = nX2 * nX2 + nY2 * nY2 + nZ2 * nZ2;
								if (l1 > 0) {
									l1 = 1 / Math.sqrt(l1);
								}
								nX2 *= l1;
								nY2 *= l1;
								nZ2 *= l1;
								var dn1 = v1X6 * nX2 + v1Y6 * nY2 + v1Z6 * nZ2;
								var l21 = nX2 * nX2 + nY2 * nY2 + nZ2 * nZ2;
								l21 = dn1 / l21;
								minvX2 = nX2 * l21;
								minvY2 = nY2 * l21;
								minvZ2 = nZ2 * l21;
								var v71 = closest;
								v71[0] = minvX2;
								v71[1] = minvY2;
								v71[2] = minvZ2;
								b6 = 7;
							}
							var d14 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
							mini1 = b6;
							mind1 = d14;
							var v72 = closest;
							minvX1 = v72[0];
							minvY1 = v72[1];
							minvZ1 = v72[2];
						}
						if (d134 * sign < 0) {
							var v117;
							var v1X10;
							var v1Y10;
							var v1Z10;
							var v216;
							var v2X10;
							var v2Y10;
							var v2Z10;
							var v314;
							var v3X3;
							var v3Y3;
							var v3Z3;
							var v1210;
							var v12X10;
							var v12Y10;
							var v12Z10;
							var v233;
							var v23X3;
							var v23Y3;
							var v23Z3;
							var v315;
							var v31X2;
							var v31Y2;
							var v31Z2;
							var v73 = vec11;
							v1X10 = v73[0];
							v1Y10 = v73[1];
							v1Z10 = v73[2];
							var v74 = vec31;
							v2X10 = v74[0];
							v2Y10 = v74[1];
							v2Z10 = v74[2];
							var v75 = vec4;
							v3X3 = v75[0];
							v3Y3 = v75[1];
							v3Z3 = v75[2];
							v12X10 = v2X10 - v1X10;
							v12Y10 = v2Y10 - v1Y10;
							v12Z10 = v2Z10 - v1Z10;
							v23X3 = v3X3 - v2X10;
							v23Y3 = v3Y3 - v2Y10;
							v23Z3 = v3Z3 - v2Z10;
							v31X2 = v1X10 - v3X3;
							v31Y2 = v1Y10 - v3Y3;
							v31Z2 = v1Z10 - v3Z3;
							var n3;
							var nX3;
							var nY3;
							var nZ3;
							nX3 = v12Y10 * v23Z3 - v12Z10 * v23Y3;
							nY3 = v12Z10 * v23X3 - v12X10 * v23Z3;
							nZ3 = v12X10 * v23Y3 - v12Y10 * v23X3;
							var n122;
							var n12X2;
							var n12Y2;
							var n12Z2;
							var n232;
							var n23X2;
							var n23Y2;
							var n23Z2;
							var n312;
							var n31X2;
							var n31Y2;
							var n31Z2;
							n12X2 = v12Y10 * nZ3 - v12Z10 * nY3;
							n12Y2 = v12Z10 * nX3 - v12X10 * nZ3;
							n12Z2 = v12X10 * nY3 - v12Y10 * nX3;
							n23X2 = v23Y3 * nZ3 - v23Z3 * nY3;
							n23Y2 = v23Z3 * nX3 - v23X3 * nZ3;
							n23Z2 = v23X3 * nY3 - v23Y3 * nX3;
							n31X2 = v31Y2 * nZ3 - v31Z2 * nY3;
							n31Y2 = v31Z2 * nX3 - v31X2 * nZ3;
							n31Z2 = v31X2 * nY3 - v31Y2 * nX3;
							var d122 = v1X10 * n12X2 + v1Y10 * n12Y2 + v1Z10 * n12Z2;
							var d232 = v2X10 * n23X2 + v2Y10 * n23Y2 + v2Z10 * n23Z2;
							var d312 = v3X3 * n31X2 + v3Y3 * n31Y2 + v3Z3 * n31Z2;
							var mind3 = -1;
							var minv3;
							var minvX3;
							var minvY3;
							var minvZ3;
							var mini3 = 0;
							minvX3 = 0;
							minvY3 = 0;
							minvZ3 = 0;
							if (d122 < 0) {
								var v118;
								var v1X11;
								var v1Y11;
								var v1Z11;
								var v217;
								var v2X11;
								var v2Y11;
								var v2Z11;
								var v76 = vec11;
								v1X11 = v76[0];
								v1Y11 = v76[1];
								v1Z11 = v76[2];
								var v77 = vec31;
								v2X11 = v77[0];
								v2Y11 = v77[1];
								v2Z11 = v77[2];
								var v1211;
								var v12X11;
								var v12Y11;
								var v12Z11;
								v12X11 = v2X11 - v1X11;
								v12Y11 = v2Y11 - v1Y11;
								v12Z11 = v2Z11 - v1Z11;
								var d15 = v12X11 * v12X11 + v12Y11 * v12Y11 + v12Z11 * v12Z11;
								var t7 = v12X11 * v1X11 + v12Y11 * v1Y11 + v12Z11 * v1Z11;
								t7 = -t7 / d15;
								var b7;
								if (t7 < 0) {
									var v78 = closest;
									v78[0] = v1X11;
									v78[1] = v1Y11;
									v78[2] = v1Z11;
									b7 = 1;
								} else if (t7 > 1) {
									var v79 = closest;
									v79[0] = v2X11;
									v79[1] = v2Y11;
									v79[2] = v2Z11;
									b7 = 2;
								} else {
									var p7;
									var pX7;
									var pY7;
									var pZ7;
									pX7 = v1X11 + v12X11 * t7;
									pY7 = v1Y11 + v12Y11 * t7;
									pZ7 = v1Z11 + v12Z11 * t7;
									var v80 = closest;
									v80[0] = pX7;
									v80[1] = pY7;
									v80[2] = pZ7;
									b7 = 3;
								}
								var d16 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								mini3 = b7;
								mind3 = d16;
								var v81 = closest;
								minvX3 = v81[0];
								minvY3 = v81[1];
								minvZ3 = v81[2];
							}
							if (d232 < 0) {
								var v119;
								var v1X12;
								var v1Y12;
								var v1Z12;
								var v218;
								var v2X12;
								var v2Y12;
								var v2Z12;
								var v82 = vec31;
								v1X12 = v82[0];
								v1Y12 = v82[1];
								v1Z12 = v82[2];
								var v83 = vec4;
								v2X12 = v83[0];
								v2Y12 = v83[1];
								v2Z12 = v83[2];
								var v1212;
								var v12X12;
								var v12Y12;
								var v12Z12;
								v12X12 = v2X12 - v1X12;
								v12Y12 = v2Y12 - v1Y12;
								v12Z12 = v2Z12 - v1Z12;
								var d17 = v12X12 * v12X12 + v12Y12 * v12Y12 + v12Z12 * v12Z12;
								var t8 = v12X12 * v1X12 + v12Y12 * v1Y12 + v12Z12 * v1Z12;
								t8 = -t8 / d17;
								var b8;
								if (t8 < 0) {
									var v84 = closest;
									v84[0] = v1X12;
									v84[1] = v1Y12;
									v84[2] = v1Z12;
									b8 = 1;
								} else if (t8 > 1) {
									var v85 = closest;
									v85[0] = v2X12;
									v85[1] = v2Y12;
									v85[2] = v2Z12;
									b8 = 2;
								} else {
									var p8;
									var pX8;
									var pY8;
									var pZ8;
									pX8 = v1X12 + v12X12 * t8;
									pY8 = v1Y12 + v12Y12 * t8;
									pZ8 = v1Z12 + v12Z12 * t8;
									var v86 = closest;
									v86[0] = pX8;
									v86[1] = pY8;
									v86[2] = pZ8;
									b8 = 3;
								}
								var d18 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind3 < 0 || d18 < mind3) {
									mini3 = b8 << 1;
									mind3 = d18;
									var v87 = closest;
									minvX3 = v87[0];
									minvY3 = v87[1];
									minvZ3 = v87[2];
								}
							}
							if (d312 < 0) {
								var v120;
								var v1X13;
								var v1Y13;
								var v1Z13;
								var v219;
								var v2X13;
								var v2Y13;
								var v2Z13;
								var v88 = vec11;
								v1X13 = v88[0];
								v1Y13 = v88[1];
								v1Z13 = v88[2];
								var v89 = vec4;
								v2X13 = v89[0];
								v2Y13 = v89[1];
								v2Z13 = v89[2];
								var v1213;
								var v12X13;
								var v12Y13;
								var v12Z13;
								v12X13 = v2X13 - v1X13;
								v12Y13 = v2Y13 - v1Y13;
								v12Z13 = v2Z13 - v1Z13;
								var d19 = v12X13 * v12X13 + v12Y13 * v12Y13 + v12Z13 * v12Z13;
								var t9 = v12X13 * v1X13 + v12Y13 * v1Y13 + v12Z13 * v1Z13;
								t9 = -t9 / d19;
								var b9;
								if (t9 < 0) {
									var v90 = closest;
									v90[0] = v1X13;
									v90[1] = v1Y13;
									v90[2] = v1Z13;
									b9 = 1;
								} else if (t9 > 1) {
									var v91 = closest;
									v91[0] = v2X13;
									v91[1] = v2Y13;
									v91[2] = v2Z13;
									b9 = 2;
								} else {
									var p9;
									var pX9;
									var pY9;
									var pZ9;
									pX9 = v1X13 + v12X13 * t9;
									pY9 = v1Y13 + v12Y13 * t9;
									pZ9 = v1Z13 + v12Z13 * t9;
									var v92 = closest;
									v92[0] = pX9;
									v92[1] = pY9;
									v92[2] = pZ9;
									b9 = 3;
								}
								var d20 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind3 < 0 || d20 < mind3) {
									mini3 = b9 & 1 | (b9 & 2) << 1;
									mind3 = d20;
									var v93 = closest;
									minvX3 = v93[0];
									minvY3 = v93[1];
									minvZ3 = v93[2];
								}
							}
							var b10;
							if (mind3 > 0) {
								var v94 = closest;
								v94[0] = minvX3;
								v94[1] = minvY3;
								v94[2] = minvZ3;
								b10 = mini3;
							} else {
								var l3 = nX3 * nX3 + nY3 * nY3 + nZ3 * nZ3;
								if (l3 > 0) {
									l3 = 1 / Math.sqrt(l3);
								}
								nX3 *= l3;
								nY3 *= l3;
								nZ3 *= l3;
								var dn2 = v1X10 * nX3 + v1Y10 * nY3 + v1Z10 * nZ3;
								var l22 = nX3 * nX3 + nY3 * nY3 + nZ3 * nZ3;
								l22 = dn2 / l22;
								minvX3 = nX3 * l22;
								minvY3 = nY3 * l22;
								minvZ3 = nZ3 * l22;
								var v95 = closest;
								v95[0] = minvX3;
								v95[1] = minvY3;
								v95[2] = minvZ3;
								b10 = 7;
							}
							var d21 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
							if (mind1 < 0 || d21 < mind1) {
								mini1 = b10 & 1 | (b10 & 6) << 1;
								mind1 = d21;
								var v96 = closest;
								minvX1 = v96[0];
								minvY1 = v96[1];
								minvZ1 = v96[2];
							}
						}
						if (d142 * sign < 0) {
							var v130;
							var v1X14;
							var v1Y14;
							var v1Z14;
							var v220;
							var v2X14;
							var v2Y14;
							var v2Z14;
							var v316;
							var v3X4;
							var v3Y4;
							var v3Z4;
							var v1214;
							var v12X14;
							var v12Y14;
							var v12Z14;
							var v234;
							var v23X4;
							var v23Y4;
							var v23Z4;
							var v317;
							var v31X3;
							var v31Y3;
							var v31Z3;
							var v97 = vec11;
							v1X14 = v97[0];
							v1Y14 = v97[1];
							v1Z14 = v97[2];
							var v98 = vec21;
							v2X14 = v98[0];
							v2Y14 = v98[1];
							v2Z14 = v98[2];
							var v99 = vec4;
							v3X4 = v99[0];
							v3Y4 = v99[1];
							v3Z4 = v99[2];
							v12X14 = v2X14 - v1X14;
							v12Y14 = v2Y14 - v1Y14;
							v12Z14 = v2Z14 - v1Z14;
							v23X4 = v3X4 - v2X14;
							v23Y4 = v3Y4 - v2Y14;
							v23Z4 = v3Z4 - v2Z14;
							v31X3 = v1X14 - v3X4;
							v31Y3 = v1Y14 - v3Y4;
							v31Z3 = v1Z14 - v3Z4;
							var n4;
							var nX4;
							var nY4;
							var nZ4;
							nX4 = v12Y14 * v23Z4 - v12Z14 * v23Y4;
							nY4 = v12Z14 * v23X4 - v12X14 * v23Z4;
							nZ4 = v12X14 * v23Y4 - v12Y14 * v23X4;
							var n124;
							var n12X3;
							var n12Y3;
							var n12Z3;
							var n233;
							var n23X3;
							var n23Y3;
							var n23Z3;
							var n313;
							var n31X3;
							var n31Y3;
							var n31Z3;
							n12X3 = v12Y14 * nZ4 - v12Z14 * nY4;
							n12Y3 = v12Z14 * nX4 - v12X14 * nZ4;
							n12Z3 = v12X14 * nY4 - v12Y14 * nX4;
							n23X3 = v23Y4 * nZ4 - v23Z4 * nY4;
							n23Y3 = v23Z4 * nX4 - v23X4 * nZ4;
							n23Z3 = v23X4 * nY4 - v23Y4 * nX4;
							n31X3 = v31Y3 * nZ4 - v31Z3 * nY4;
							n31Y3 = v31Z3 * nX4 - v31X3 * nZ4;
							n31Z3 = v31X3 * nY4 - v31Y3 * nX4;
							var d124 = v1X14 * n12X3 + v1Y14 * n12Y3 + v1Z14 * n12Z3;
							var d233 = v2X14 * n23X3 + v2Y14 * n23Y3 + v2Z14 * n23Z3;
							var d313 = v3X4 * n31X3 + v3Y4 * n31Y3 + v3Z4 * n31Z3;
							var mind4 = -1;
							var minv4;
							var minvX4;
							var minvY4;
							var minvZ4;
							var mini4 = 0;
							minvX4 = 0;
							minvY4 = 0;
							minvZ4 = 0;
							if (d124 < 0) {
								var v132;
								var v1X15;
								var v1Y15;
								var v1Z15;
								var v221;
								var v2X15;
								var v2Y15;
								var v2Z15;
								var v100 = vec11;
								v1X15 = v100[0];
								v1Y15 = v100[1];
								v1Z15 = v100[2];
								var v101 = vec21;
								v2X15 = v101[0];
								v2Y15 = v101[1];
								v2Z15 = v101[2];
								var v1215;
								var v12X15;
								var v12Y15;
								var v12Z15;
								v12X15 = v2X15 - v1X15;
								v12Y15 = v2Y15 - v1Y15;
								v12Z15 = v2Z15 - v1Z15;
								var d22 = v12X15 * v12X15 + v12Y15 * v12Y15 + v12Z15 * v12Z15;
								var t10 = v12X15 * v1X15 + v12Y15 * v1Y15 + v12Z15 * v1Z15;
								t10 = -t10 / d22;
								var b11;
								if (t10 < 0) {
									var v102 = closest;
									v102[0] = v1X15;
									v102[1] = v1Y15;
									v102[2] = v1Z15;
									b11 = 1;
								} else if (t10 > 1) {
									var v103 = closest;
									v103[0] = v2X15;
									v103[1] = v2Y15;
									v103[2] = v2Z15;
									b11 = 2;
								} else {
									var p10;
									var pX10;
									var pY10;
									var pZ10;
									pX10 = v1X15 + v12X15 * t10;
									pY10 = v1Y15 + v12Y15 * t10;
									pZ10 = v1Z15 + v12Z15 * t10;
									var v104 = closest;
									v104[0] = pX10;
									v104[1] = pY10;
									v104[2] = pZ10;
									b11 = 3;
								}
								var d24 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								mini4 = b11;
								mind4 = d24;
								var v105 = closest;
								minvX4 = v105[0];
								minvY4 = v105[1];
								minvZ4 = v105[2];
							}
							if (d233 < 0) {
								var v133;
								var v1X16;
								var v1Y16;
								var v1Z16;
								var v222;
								var v2X16;
								var v2Y16;
								var v2Z16;
								var v106 = vec21;
								v1X16 = v106[0];
								v1Y16 = v106[1];
								v1Z16 = v106[2];
								var v107 = vec4;
								v2X16 = v107[0];
								v2Y16 = v107[1];
								v2Z16 = v107[2];
								var v1216;
								var v12X16;
								var v12Y16;
								var v12Z16;
								v12X16 = v2X16 - v1X16;
								v12Y16 = v2Y16 - v1Y16;
								v12Z16 = v2Z16 - v1Z16;
								var d25 = v12X16 * v12X16 + v12Y16 * v12Y16 + v12Z16 * v12Z16;
								var t11 = v12X16 * v1X16 + v12Y16 * v1Y16 + v12Z16 * v1Z16;
								t11 = -t11 / d25;
								var b12;
								if (t11 < 0) {
									var v108 = closest;
									v108[0] = v1X16;
									v108[1] = v1Y16;
									v108[2] = v1Z16;
									b12 = 1;
								} else if (t11 > 1) {
									var v109 = closest;
									v109[0] = v2X16;
									v109[1] = v2Y16;
									v109[2] = v2Z16;
									b12 = 2;
								} else {
									var p11;
									var pX11;
									var pY11;
									var pZ11;
									pX11 = v1X16 + v12X16 * t11;
									pY11 = v1Y16 + v12Y16 * t11;
									pZ11 = v1Z16 + v12Z16 * t11;
									var v134 = closest;
									v134[0] = pX11;
									v134[1] = pY11;
									v134[2] = pZ11;
									b12 = 3;
								}
								var d26 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind4 < 0 || d26 < mind4) {
									mini4 = b12 << 1;
									mind4 = d26;
									var v135 = closest;
									minvX4 = v135[0];
									minvY4 = v135[1];
									minvZ4 = v135[2];
								}
							}
							if (d313 < 0) {
								var v136;
								var v1X17;
								var v1Y17;
								var v1Z17;
								var v223;
								var v2X17;
								var v2Y17;
								var v2Z17;
								var v137 = vec11;
								v1X17 = v137[0];
								v1Y17 = v137[1];
								v1Z17 = v137[2];
								var v138 = vec4;
								v2X17 = v138[0];
								v2Y17 = v138[1];
								v2Z17 = v138[2];
								var v1217;
								var v12X17;
								var v12Y17;
								var v12Z17;
								v12X17 = v2X17 - v1X17;
								v12Y17 = v2Y17 - v1Y17;
								v12Z17 = v2Z17 - v1Z17;
								var d27 = v12X17 * v12X17 + v12Y17 * v12Y17 + v12Z17 * v12Z17;
								var t12 = v12X17 * v1X17 + v12Y17 * v1Y17 + v12Z17 * v1Z17;
								t12 = -t12 / d27;
								var b13;
								if (t12 < 0) {
									var v139 = closest;
									v139[0] = v1X17;
									v139[1] = v1Y17;
									v139[2] = v1Z17;
									b13 = 1;
								} else if (t12 > 1) {
									var v140 = closest;
									v140[0] = v2X17;
									v140[1] = v2Y17;
									v140[2] = v2Z17;
									b13 = 2;
								} else {
									var p12;
									var pX12;
									var pY12;
									var pZ12;
									pX12 = v1X17 + v12X17 * t12;
									pY12 = v1Y17 + v12Y17 * t12;
									pZ12 = v1Z17 + v12Z17 * t12;
									var v142 = closest;
									v142[0] = pX12;
									v142[1] = pY12;
									v142[2] = pZ12;
									b13 = 3;
								}
								var d28 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind4 < 0 || d28 < mind4) {
									mini4 = b13 & 1 | (b13 & 2) << 1;
									mind4 = d28;
									var v143 = closest;
									minvX4 = v143[0];
									minvY4 = v143[1];
									minvZ4 = v143[2];
								}
							}
							var b14;
							if (mind4 > 0) {
								var v144 = closest;
								v144[0] = minvX4;
								v144[1] = minvY4;
								v144[2] = minvZ4;
								b14 = mini4;
							} else {
								var l4 = nX4 * nX4 + nY4 * nY4 + nZ4 * nZ4;
								if (l4 > 0) {
									l4 = 1 / Math.sqrt(l4);
								}
								nX4 *= l4;
								nY4 *= l4;
								nZ4 *= l4;
								var dn3 = v1X14 * nX4 + v1Y14 * nY4 + v1Z14 * nZ4;
								var l23 = nX4 * nX4 + nY4 * nY4 + nZ4 * nZ4;
								l23 = dn3 / l23;
								minvX4 = nX4 * l23;
								minvY4 = nY4 * l23;
								minvZ4 = nZ4 * l23;
								var v145 = closest;
								v145[0] = minvX4;
								v145[1] = minvY4;
								v145[2] = minvZ4;
								b14 = 7;
							}
							var d29 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
							if (mind1 < 0 || d29 < mind1) {
								mini1 = b14 & 3 | (b14 & 4) << 1;
								mind1 = d29;
								var v146 = closest;
								minvX1 = v146[0];
								minvY1 = v146[1];
								minvZ1 = v146[2];
							}
						}
						if (d243 * sign < 0) {
							var v147;
							var v1X18;
							var v1Y18;
							var v1Z18;
							var v224;
							var v2X18;
							var v2Y18;
							var v2Z18;
							var v318;
							var v3X5;
							var v3Y5;
							var v3Z5;
							var v1218;
							var v12X18;
							var v12Y18;
							var v12Z18;
							var v235;
							var v23X5;
							var v23Y5;
							var v23Z5;
							var v319;
							var v31X4;
							var v31Y4;
							var v31Z4;
							var v148 = vec21;
							v1X18 = v148[0];
							v1Y18 = v148[1];
							v1Z18 = v148[2];
							var v149 = vec31;
							v2X18 = v149[0];
							v2Y18 = v149[1];
							v2Z18 = v149[2];
							var v150 = vec4;
							v3X5 = v150[0];
							v3Y5 = v150[1];
							v3Z5 = v150[2];
							v12X18 = v2X18 - v1X18;
							v12Y18 = v2Y18 - v1Y18;
							v12Z18 = v2Z18 - v1Z18;
							v23X5 = v3X5 - v2X18;
							v23Y5 = v3Y5 - v2Y18;
							v23Z5 = v3Z5 - v2Z18;
							v31X4 = v1X18 - v3X5;
							v31Y4 = v1Y18 - v3Y5;
							v31Z4 = v1Z18 - v3Z5;
							var n5;
							var nX5;
							var nY5;
							var nZ5;
							nX5 = v12Y18 * v23Z5 - v12Z18 * v23Y5;
							nY5 = v12Z18 * v23X5 - v12X18 * v23Z5;
							nZ5 = v12X18 * v23Y5 - v12Y18 * v23X5;
							var n125;
							var n12X4;
							var n12Y4;
							var n12Z4;
							var n234;
							var n23X4;
							var n23Y4;
							var n23Z4;
							var n314;
							var n31X4;
							var n31Y4;
							var n31Z4;
							n12X4 = v12Y18 * nZ5 - v12Z18 * nY5;
							n12Y4 = v12Z18 * nX5 - v12X18 * nZ5;
							n12Z4 = v12X18 * nY5 - v12Y18 * nX5;
							n23X4 = v23Y5 * nZ5 - v23Z5 * nY5;
							n23Y4 = v23Z5 * nX5 - v23X5 * nZ5;
							n23Z4 = v23X5 * nY5 - v23Y5 * nX5;
							n31X4 = v31Y4 * nZ5 - v31Z4 * nY5;
							n31Y4 = v31Z4 * nX5 - v31X4 * nZ5;
							n31Z4 = v31X4 * nY5 - v31Y4 * nX5;
							var d125 = v1X18 * n12X4 + v1Y18 * n12Y4 + v1Z18 * n12Z4;
							var d234 = v2X18 * n23X4 + v2Y18 * n23Y4 + v2Z18 * n23Z4;
							var d314 = v3X5 * n31X4 + v3Y5 * n31Y4 + v3Z5 * n31Z4;
							var mind5 = -1;
							var minv5;
							var minvX5;
							var minvY5;
							var minvZ5;
							var mini5 = 0;
							minvX5 = 0;
							minvY5 = 0;
							minvZ5 = 0;
							if (d125 < 0) {
								var v151;
								var v1X19;
								var v1Y19;
								var v1Z19;
								var v225;
								var v2X19;
								var v2Y19;
								var v2Z19;
								var v152 = vec21;
								v1X19 = v152[0];
								v1Y19 = v152[1];
								v1Z19 = v152[2];
								var v153 = vec31;
								v2X19 = v153[0];
								v2Y19 = v153[1];
								v2Z19 = v153[2];
								var v1219;
								var v12X19;
								var v12Y19;
								var v12Z19;
								v12X19 = v2X19 - v1X19;
								v12Y19 = v2Y19 - v1Y19;
								v12Z19 = v2Z19 - v1Z19;
								var d30 = v12X19 * v12X19 + v12Y19 * v12Y19 + v12Z19 * v12Z19;
								var t13 = v12X19 * v1X19 + v12Y19 * v1Y19 + v12Z19 * v1Z19;
								t13 = -t13 / d30;
								var b15;
								if (t13 < 0) {
									var v154 = closest;
									v154[0] = v1X19;
									v154[1] = v1Y19;
									v154[2] = v1Z19;
									b15 = 1;
								} else if (t13 > 1) {
									var v155 = closest;
									v155[0] = v2X19;
									v155[1] = v2Y19;
									v155[2] = v2Z19;
									b15 = 2;
								} else {
									var p13;
									var pX13;
									var pY13;
									var pZ13;
									pX13 = v1X19 + v12X19 * t13;
									pY13 = v1Y19 + v12Y19 * t13;
									pZ13 = v1Z19 + v12Z19 * t13;
									var v156 = closest;
									v156[0] = pX13;
									v156[1] = pY13;
									v156[2] = pZ13;
									b15 = 3;
								}
								var d32 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								mini5 = b15;
								mind5 = d32;
								var v157 = closest;
								minvX5 = v157[0];
								minvY5 = v157[1];
								minvZ5 = v157[2];
							}
							if (d234 < 0) {
								var v158;
								var v1X20;
								var v1Y20;
								var v1Z20;
								var v226;
								var v2X20;
								var v2Y20;
								var v2Z20;
								var v159 = vec31;
								v1X20 = v159[0];
								v1Y20 = v159[1];
								v1Z20 = v159[2];
								var v160 = vec4;
								v2X20 = v160[0];
								v2Y20 = v160[1];
								v2Z20 = v160[2];
								var v1220;
								var v12X20;
								var v12Y20;
								var v12Z20;
								v12X20 = v2X20 - v1X20;
								v12Y20 = v2Y20 - v1Y20;
								v12Z20 = v2Z20 - v1Z20;
								var d33 = v12X20 * v12X20 + v12Y20 * v12Y20 + v12Z20 * v12Z20;
								var t14 = v12X20 * v1X20 + v12Y20 * v1Y20 + v12Z20 * v1Z20;
								t14 = -t14 / d33;
								var b16;
								if (t14 < 0) {
									var v161 = closest;
									v161[0] = v1X20;
									v161[1] = v1Y20;
									v161[2] = v1Z20;
									b16 = 1;
								} else if (t14 > 1) {
									var v162 = closest;
									v162[0] = v2X20;
									v162[1] = v2Y20;
									v162[2] = v2Z20;
									b16 = 2;
								} else {
									var p14;
									var pX14;
									var pY14;
									var pZ14;
									pX14 = v1X20 + v12X20 * t14;
									pY14 = v1Y20 + v12Y20 * t14;
									pZ14 = v1Z20 + v12Z20 * t14;
									var v163 = closest;
									v163[0] = pX14;
									v163[1] = pY14;
									v163[2] = pZ14;
									b16 = 3;
								}
								var d34 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind5 < 0 || d34 < mind5) {
									mini5 = b16 << 1;
									mind5 = d34;
									var v164 = closest;
									minvX5 = v164[0];
									minvY5 = v164[1];
									minvZ5 = v164[2];
								}
							}
							if (d314 < 0) {
								var v165;
								var v1X21;
								var v1Y21;
								var v1Z21;
								var v227;
								var v2X21;
								var v2Y21;
								var v2Z21;
								var v166 = vec21;
								v1X21 = v166[0];
								v1Y21 = v166[1];
								v1Z21 = v166[2];
								var v167 = vec4;
								v2X21 = v167[0];
								v2Y21 = v167[1];
								v2Z21 = v167[2];
								var v1221;
								var v12X21;
								var v12Y21;
								var v12Z21;
								v12X21 = v2X21 - v1X21;
								v12Y21 = v2Y21 - v1Y21;
								v12Z21 = v2Z21 - v1Z21;
								var d35 = v12X21 * v12X21 + v12Y21 * v12Y21 + v12Z21 * v12Z21;
								var t15 = v12X21 * v1X21 + v12Y21 * v1Y21 + v12Z21 * v1Z21;
								t15 = -t15 / d35;
								var b17;
								if (t15 < 0) {
									var v168 = closest;
									v168[0] = v1X21;
									v168[1] = v1Y21;
									v168[2] = v1Z21;
									b17 = 1;
								} else if (t15 > 1) {
									var v169 = closest;
									v169[0] = v2X21;
									v169[1] = v2Y21;
									v169[2] = v2Z21;
									b17 = 2;
								} else {
									var p15;
									var pX15;
									var pY15;
									var pZ15;
									pX15 = v1X21 + v12X21 * t15;
									pY15 = v1Y21 + v12Y21 * t15;
									pZ15 = v1Z21 + v12Z21 * t15;
									var v170 = closest;
									v170[0] = pX15;
									v170[1] = pY15;
									v170[2] = pZ15;
									b17 = 3;
								}
								var d36 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
								if (mind5 < 0 || d36 < mind5) {
									mini5 = b17 & 1 | (b17 & 2) << 1;
									mind5 = d36;
									var v171 = closest;
									minvX5 = v171[0];
									minvY5 = v171[1];
									minvZ5 = v171[2];
								}
							}
							var b18;
							if (mind5 > 0) {
								var v172 = closest;
								v172[0] = minvX5;
								v172[1] = minvY5;
								v172[2] = minvZ5;
								b18 = mini5;
							} else {
								var l5 = nX5 * nX5 + nY5 * nY5 + nZ5 * nZ5;
								if (l5 > 0) {
									l5 = 1 / Math.sqrt(l5);
								}
								nX5 *= l5;
								nY5 *= l5;
								nZ5 *= l5;
								var dn4 = v1X18 * nX5 + v1Y18 * nY5 + v1Z18 * nZ5;
								var l24 = nX5 * nX5 + nY5 * nY5 + nZ5 * nZ5;
								l24 = dn4 / l24;
								minvX5 = nX5 * l24;
								minvY5 = nY5 * l24;
								minvZ5 = nZ5 * l24;
								var v173 = closest;
								v173[0] = minvX5;
								v173[1] = minvY5;
								v173[2] = minvZ5;
								b18 = 7;
							}
							var d37 = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
							if (mind1 < 0 || d37 < mind1) {
								mini1 = b18 << 1;
								mind1 = d37;
								var v174 = closest;
								minvX1 = v174[0];
								minvY1 = v174[1];
								minvZ1 = v174[2];
							}
						}
						if (mind1 > 0) {
							var v175 = closest;
							v175[0] = minvX1;
							v175[1] = minvY1;
							v175[2] = minvZ1;
							v4 = mini1;
						} else {
							math.vec3_zero$(closest)
							
							v4 = 15;
						}
						break;
				}
				this.shrinkSimplex(v4);
				if (closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2] < eps2) {
					if (lambda == 0 || this.simplexSize == 4) {
						hit.fraction = lambda;
						return false;
					}
					this.interpolateClosestPoints();
					hit.fraction = lambda;
					var _this3 = hit.normal;
					_this3[0] = dir[0];
					_this3[1] = dir[1];
					_this3[2] = dir[2];
					var _this4 = _this3;
					var invLen = Math.sqrt(_this4[0] * _this4[0] + _this4[1] * _this4[1] + _this4[2] * _this4[2]);
					if (invLen > 0) {
						invLen = 1 / invLen;
					}
					var tx2 = _this4[0] * invLen;
					var ty2 = _this4[1] * invLen;
					var tz2 = _this4[2] * invLen;
					_this4[0] = tx2;
					_this4[1] = ty2;
					_this4[2] = tz2;
					var _this5 = hit.position;
					var v176 = this.closestPoint1;
					_this5[0] = v176[0];
					_this5[1] = v176[1];
					_this5[2] = v176[2];
					var _this6 = _this5;
					var tx3 = _this6[0] + tl1[0] * lambda;
					var ty3 = _this6[1] + tl1[1] * lambda;
					var tz3 = _this6[2] + tl1[2] * lambda;
					_this6[0] = tx3;
					_this6[1] = ty3;
					_this6[2] = tz3;
					return true;
				}
				dir[0] = closest[0];
				dir[1] = closest[1];
				dir[2] = closest[2];
				var _this7 = dir;
				var tx4 = -_this7[0];
				var ty4 = -_this7[1];
				var tz4 = -_this7[2];
				_this7[0] = tx4;
				_this7[1] = ty4;
				_this7[2] = tz4;
				if (this.c1 != null) {
					this.computeWitnessPoint1(true);
				} else {
					var v177 = this.w1[this.simplexSize];
					v177[0] = this.tf1._position[0];
					v177[1] = this.tf1._position[1];
					v177[2] = this.tf1._position[2];
				}
				this.computeWitnessPoint2(true);
				var _this8 = this.s[this.simplexSize];
				var v178 = this.w1[this.simplexSize];
				_this8[0] = v178[0];
				_this8[1] = v178[1];
				_this8[2] = v178[2];
				var _this9 = _this8;
				var v179 = this.w2[this.simplexSize];
				var tx5 = _this9[0] - v179[0];
				var ty5 = _this9[1] - v179[1];
				var tz5 = _this9[2] - v179[2];
				_this9[0] = tx5;
				_this9[1] = ty5;
				_this9[2] = tz5;
				var _this10 = s[this.simplexSize];
				var tx6 = _this10[0] - rayX[0];
				var ty6 = _this10[1] - rayX[1];
				var tz6 = _this10[2] - rayX[2];
				_this10[0] = tx6;
				_this10[1] = ty6;
				_this10[2] = tz6;
				if (dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2] < eps2) {
					throw new Error("!?");
				}
				var p16 = s[this.simplexSize];
				var n6 = dir;
				var pn = p16[0] * n6[0] + p16[1] * n6[1] + p16[2] * n6[2];
				if (pn < 0) {
					if (rayR[0] * n6[0] + rayR[1] * n6[1] + rayR[2] * n6[2] >= 0) {
						return false;
					}
					var dLambda = pn / (rayR[0] * n6[0] + rayR[1] * n6[1] + rayR[2] * n6[2]);
					lambda += dLambda;
					if (lambda >= 1) {
						return false;
					}
					var tx7 = rayX[0] + rayR[0] * dLambda;
					var ty7 = rayX[1] + rayR[1] * dLambda;
					var tz7 = rayX[2] + rayR[2] * dLambda;
					rayX[0] = tx7;
					rayX[1] = ty7;
					rayX[2] = tz7;
					var _g2 = 0;
					var _g1 = this.simplexSize + 1;
					while (_g2 < _g1) {
						var i = _g2++;
						var _this11 = s[i];
						var s1 = -dLambda;
						var tx8 = _this11[0] + rayR[0] * s1;
						var ty8 = _this11[1] + rayR[1] * s1;
						var tz8 = _this11[2] + rayR[2] * s1;
						_this11[0] = tx8;
						_this11[1] = ty8;
						_this11[2] = tz8;
					}
				}
				var duplicate = false;
				var _g21 = 0;
				var _g11 = this.simplexSize;
				while (_g21 < _g11) {
					var i1 = _g21++;
					var dx = s[i1][0] - s[this.simplexSize][0];
					var dy = s[i1][1] - s[this.simplexSize][1];
					var dz = s[i1][2] - s[this.simplexSize][2];
					if (dx * dx + dy * dy + dz * dz < eps2) {
						duplicate = true;
						break;
					}
				}
				if (!duplicate) {
					this.simplexSize++;
				}
				++count;
			}
			return false;
		}

		proto.interpolateClosestPoints = function () {
			var _g = this.simplexSize;
			switch (_g) {
				case 1:
					var _this = this.closestPoint1;
					var v = this.w1[0];
					_this[0] = v[0];
					_this[1] = v[1];
					_this[2] = v[2];
					var _this1 = this.closestPoint2;
					var v1 = this.w2[0];
					_this1[0] = v1[0];
					_this1[1] = v1[1];
					_this1[2] = v1[2];
					break;
				case 2:
					var c;
					var cX;
					var cY;
					var cZ;
					var v2 = this.closest;
					cX = v2[0];
					cY = v2[1];
					cZ = v2[2];
					var s0;
					var s0X;
					var s0Y;
					var s0Z;
					var w10;
					var w10X;
					var w10Y;
					var w10Z;
					var w20;
					var w20X;
					var w20Y;
					var w20Z;
					var s1;
					var s1X;
					var s1Y;
					var s1Z;
					var w11;
					var w11X;
					var w11Y;
					var w11Z;
					var w21;
					var w21X;
					var w21Y;
					var w21Z;
					var s2;
					var s2X;
					var s2Y;
					var s2Z;
					var w12;
					var w12X;
					var w12Y;
					var w12Z;
					var w22;
					var w22X;
					var w22Y;
					var w22Z;
					var v3 = this.s[0];
					s0X = v3[0];
					s0Y = v3[1];
					s0Z = v3[2];
					var v4 = this.w1[0];
					w10X = v4[0];
					w10Y = v4[1];
					w10Z = v4[2];
					var v5 = this.w2[0];
					w20X = v5[0];
					w20Y = v5[1];
					w20Z = v5[2];
					var v6 = this.s[1];
					s1X = v6[0];
					s1Y = v6[1];
					s1Z = v6[2];
					var v7 = this.w1[1];
					w11X = v7[0];
					w11Y = v7[1];
					w11Z = v7[2];
					var v8 = this.w2[1];
					w21X = v8[0];
					w21Y = v8[1];
					w21Z = v8[2];
					var v9 = this.s[2];
					s2X = v9[0];
					s2Y = v9[1];
					s2Z = v9[2];
					var v10 = this.w1[2];
					w12X = v10[0];
					w12Y = v10[1];
					w12Z = v10[2];
					var v11 = this.w2[2];
					w22X = v11[0];
					w22Y = v11[1];
					w22Z = v11[2];
					var s01;
					var s01X;
					var s01Y;
					var s01Z;
					s01X = s1X - s0X;
					s01Y = s1Y - s0Y;
					s01Z = s1Z - s0Z;
					var invDet = s01X * s01X + s01Y * s01Y + s01Z * s01Z;
					if (invDet != 0) {
						invDet = 1 / invDet;
					}
					var s0c;
					var s0cX;
					var s0cY;
					var s0cZ;
					s0cX = cX - s0X;
					s0cY = cY - s0Y;
					s0cZ = cZ - s0Z;
					var t = (s0cX * s01X + s0cY * s01Y + s0cZ * s01Z) * invDet;
					var diff;
					var diffX;
					var diffY;
					var diffZ;
					var cp1;
					var cp1X;
					var cp1Y;
					var cp1Z;
					var cp2;
					var cp2X;
					var cp2Y;
					var cp2Z;
					diffX = w11X - w10X;
					diffY = w11Y - w10Y;
					diffZ = w11Z - w10Z;
					cp1X = w10X + diffX * t;
					cp1Y = w10Y + diffY * t;
					cp1Z = w10Z + diffZ * t;
					diffX = w21X - w20X;
					diffY = w21Y - w20Y;
					diffZ = w21Z - w20Z;
					cp2X = w20X + diffX * t;
					cp2Y = w20Y + diffY * t;
					cp2Z = w20Z + diffZ * t;
					var v12 = this.closestPoint1;
					v12[0] = cp1X;
					v12[1] = cp1Y;
					v12[2] = cp1Z;
					var v13 = this.closestPoint2;
					v13[0] = cp2X;
					v13[1] = cp2Y;
					v13[2] = cp2Z;
					break;
				case 3:
					var c1;
					var cX1;
					var cY1;
					var cZ1;
					var v14 = this.closest;
					cX1 = v14[0];
					cY1 = v14[1];
					cZ1 = v14[2];
					var s02;
					var s0X1;
					var s0Y1;
					var s0Z1;
					var w101;
					var w10X1;
					var w10Y1;
					var w10Z1;
					var w201;
					var w20X1;
					var w20Y1;
					var w20Z1;
					var s11;
					var s1X1;
					var s1Y1;
					var s1Z1;
					var w111;
					var w11X1;
					var w11Y1;
					var w11Z1;
					var w211;
					var w21X1;
					var w21Y1;
					var w21Z1;
					var s21;
					var s2X1;
					var s2Y1;
					var s2Z1;
					var w121;
					var w12X1;
					var w12Y1;
					var w12Z1;
					var w221;
					var w22X1;
					var w22Y1;
					var w22Z1;
					var v15 = this.s[0];
					s0X1 = v15[0];
					s0Y1 = v15[1];
					s0Z1 = v15[2];
					var v16 = this.w1[0];
					w10X1 = v16[0];
					w10Y1 = v16[1];
					w10Z1 = v16[2];
					var v17 = this.w2[0];
					w20X1 = v17[0];
					w20Y1 = v17[1];
					w20Z1 = v17[2];
					var v18 = this.s[1];
					s1X1 = v18[0];
					s1Y1 = v18[1];
					s1Z1 = v18[2];
					var v19 = this.w1[1];
					w11X1 = v19[0];
					w11Y1 = v19[1];
					w11Z1 = v19[2];
					var v20 = this.w2[1];
					w21X1 = v20[0];
					w21Y1 = v20[1];
					w21Z1 = v20[2];
					var v21 = this.s[2];
					s2X1 = v21[0];
					s2Y1 = v21[1];
					s2Z1 = v21[2];
					var v22 = this.w1[2];
					w12X1 = v22[0];
					w12Y1 = v22[1];
					w12Z1 = v22[2];
					var v23 = this.w2[2];
					w22X1 = v23[0];
					w22Y1 = v23[1];
					w22Z1 = v23[2];
					var s011;
					var s01X1;
					var s01Y1;
					var s01Z1;
					var s021;
					var s02X;
					var s02Y;
					var s02Z;
					var s0c1;
					var s0cX1;
					var s0cY1;
					var s0cZ1;
					s01X1 = s1X1 - s0X1;
					s01Y1 = s1Y1 - s0Y1;
					s01Z1 = s1Z1 - s0Z1;
					s02X = s2X1 - s0X1;
					s02Y = s2Y1 - s0Y1;
					s02Z = s2Z1 - s0Z1;
					s0cX1 = cX1 - s0X1;
					s0cY1 = cY1 - s0Y1;
					s0cZ1 = cZ1 - s0Z1;
					var d11 = s01X1 * s01X1 + s01Y1 * s01Y1 + s01Z1 * s01Z1;
					var d12 = s01X1 * s02X + s01Y1 * s02Y + s01Z1 * s02Z;
					var d22 = s02X * s02X + s02Y * s02Y + s02Z * s02Z;
					var d1c = s01X1 * s0cX1 + s01Y1 * s0cY1 + s01Z1 * s0cZ1;
					var d2c = s02X * s0cX1 + s02Y * s0cY1 + s02Z * s0cZ1;
					var invDet1 = d11 * d22 - d12 * d12;
					if (invDet1 != 0) {
						invDet1 = 1 / invDet1;
					}
					var s = (d1c * d22 - d2c * d12) * invDet1;
					var t1 = (-d1c * d12 + d2c * d11) * invDet1;
					var diff1;
					var diffX1;
					var diffY1;
					var diffZ1;
					var cp11;
					var cp1X1;
					var cp1Y1;
					var cp1Z1;
					var cp21;
					var cp2X1;
					var cp2Y1;
					var cp2Z1;
					diffX1 = w11X1 - w10X1;
					diffY1 = w11Y1 - w10Y1;
					diffZ1 = w11Z1 - w10Z1;
					cp1X1 = w10X1 + diffX1 * s;
					cp1Y1 = w10Y1 + diffY1 * s;
					cp1Z1 = w10Z1 + diffZ1 * s;
					diffX1 = w12X1 - w10X1;
					diffY1 = w12Y1 - w10Y1;
					diffZ1 = w12Z1 - w10Z1;
					cp1X1 += diffX1 * t1;
					cp1Y1 += diffY1 * t1;
					cp1Z1 += diffZ1 * t1;
					diffX1 = w21X1 - w20X1;
					diffY1 = w21Y1 - w20Y1;
					diffZ1 = w21Z1 - w20Z1;
					cp2X1 = w20X1 + diffX1 * s;
					cp2Y1 = w20Y1 + diffY1 * s;
					cp2Z1 = w20Z1 + diffZ1 * s;
					diffX1 = w22X1 - w20X1;
					diffY1 = w22Y1 - w20Y1;
					diffZ1 = w22Z1 - w20Z1;
					cp2X1 += diffX1 * t1;
					cp2Y1 += diffY1 * t1;
					cp2Z1 += diffZ1 * t1;
					var v24 = this.closestPoint1;
					v24[0] = cp1X1;
					v24[1] = cp1Y1;
					v24[2] = cp1Z1;
					var v25 = this.closestPoint2;
					v25[0] = cp2X1;
					v25[1] = cp2Y1;
					v25[2] = cp2Z1;
					break;
				default:
					throw new Error("!?");
			}
		}

		proto.loadCache = function (gjkCache) {
			var _this = this.dir;
			var v = gjkCache.prevClosestDir;
			_this[0] = v[0];
			_this[1] = v[1];
			_this[2] = v[2];
		}

		proto.saveCache = function (gjkCache) {
			var _this = gjkCache.prevClosestDir;
			var v = this.closest;
			_this[0] = v[0];
			_this[1] = v[1];
			_this[2] = v[2];
			var _this1 = _this;
			var tx = -_this1[0];
			var ty = -_this1[1];
			var tz = -_this1[2];
			_this1[0] = tx;
			_this1[1] = ty;
			_this1[2] = tz;
		}

		proto.shrinkSimplex = function (vertexBits) {
			this.simplexSize = vertexBits;
			this.simplexSize = (this.simplexSize & 5) + (this.simplexSize >> 1 & 5);
			this.simplexSize = (this.simplexSize & 3) + (this.simplexSize >> 2 & 3);
			switch (vertexBits) {
				case 2:
					var _this = this.s[0];
					var v = this.s[1];
					_this[0] = v[0];
					_this[1] = v[1];
					_this[2] = v[2];
					var _this1 = this.w1[0];
					var v1 = this.w1[1];
					_this1[0] = v1[0];
					_this1[1] = v1[1];
					_this1[2] = v1[2];
					var _this2 = this.w2[0];
					var v2 = this.w2[1];
					_this2[0] = v2[0];
					_this2[1] = v2[1];
					_this2[2] = v2[2];
					break;
				case 4:
					var _this3 = this.s[0];
					var v3 = this.s[2];
					_this3[0] = v3[0];
					_this3[1] = v3[1];
					_this3[2] = v3[2];
					var _this4 = this.w1[0];
					var v4 = this.w1[2];
					_this4[0] = v4[0];
					_this4[1] = v4[1];
					_this4[2] = v4[2];
					var _this5 = this.w2[0];
					var v5 = this.w2[2];
					_this5[0] = v5[0];
					_this5[1] = v5[1];
					_this5[2] = v5[2];
					break;
				case 5:
					var _this6 = this.s[1];
					var v6 = this.s[2];
					_this6[0] = v6[0];
					_this6[1] = v6[1];
					_this6[2] = v6[2];
					var _this7 = this.w1[1];
					var v7 = this.w1[2];
					_this7[0] = v7[0];
					_this7[1] = v7[1];
					_this7[2] = v7[2];
					var _this8 = this.w2[1];
					var v8 = this.w2[2];
					_this8[0] = v8[0];
					_this8[1] = v8[1];
					_this8[2] = v8[2];
					break;
				case 6:
					var _this9 = this.s[0];
					var v9 = this.s[2];
					_this9[0] = v9[0];
					_this9[1] = v9[1];
					_this9[2] = v9[2];
					var _this10 = this.w1[0];
					var v10 = this.w1[2];
					_this10[0] = v10[0];
					_this10[1] = v10[1];
					_this10[2] = v10[2];
					var _this11 = this.w2[0];
					var v11 = this.w2[2];
					_this11[0] = v11[0];
					_this11[1] = v11[1];
					_this11[2] = v11[2];
					break;
				case 8:
					var _this12 = this.s[0];
					var v12 = this.s[3];
					_this12[0] = v12[0];
					_this12[1] = v12[1];
					_this12[2] = v12[2];
					var _this13 = this.w1[0];
					var v13 = this.w1[3];
					_this13[0] = v13[0];
					_this13[1] = v13[1];
					_this13[2] = v13[2];
					var _this14 = this.w2[0];
					var v14 = this.w2[3];
					_this14[0] = v14[0];
					_this14[1] = v14[1];
					_this14[2] = v14[2];
					break;
				case 9:
					var _this15 = this.s[1];
					var v15 = this.s[3];
					_this15[0] = v15[0];
					_this15[1] = v15[1];
					_this15[2] = v15[2];
					var _this16 = this.w1[1];
					var v16 = this.w1[3];
					_this16[0] = v16[0];
					_this16[1] = v16[1];
					_this16[2] = v16[2];
					var _this17 = this.w2[1];
					var v17 = this.w2[3];
					_this17[0] = v17[0];
					_this17[1] = v17[1];
					_this17[2] = v17[2];
					break;
				case 10:
					var _this18 = this.s[0];
					var v18 = this.s[3];
					_this18[0] = v18[0];
					_this18[1] = v18[1];
					_this18[2] = v18[2];
					var _this19 = this.w1[0];
					var v19 = this.w1[3];
					_this19[0] = v19[0];
					_this19[1] = v19[1];
					_this19[2] = v19[2];
					var _this20 = this.w2[0];
					var v20 = this.w2[3];
					_this20[0] = v20[0];
					_this20[1] = v20[1];
					_this20[2] = v20[2];
					break;
				case 11:
					var _this21 = this.s[2];
					var v21 = this.s[3];
					_this21[0] = v21[0];
					_this21[1] = v21[1];
					_this21[2] = v21[2];
					var _this22 = this.w1[2];
					var v22 = this.w1[3];
					_this22[0] = v22[0];
					_this22[1] = v22[1];
					_this22[2] = v22[2];
					var _this23 = this.w2[2];
					var v23 = this.w2[3];
					_this23[0] = v23[0];
					_this23[1] = v23[1];
					_this23[2] = v23[2];
					break;
				case 12:
					var _this24 = this.s[0];
					var v24 = this.s[2];
					_this24[0] = v24[0];
					_this24[1] = v24[1];
					_this24[2] = v24[2];
					var _this25 = this.w1[0];
					var v25 = this.w1[2];
					_this25[0] = v25[0];
					_this25[1] = v25[1];
					_this25[2] = v25[2];
					var _this26 = this.w2[0];
					var v26 = this.w2[2];
					_this26[0] = v26[0];
					_this26[1] = v26[1];
					_this26[2] = v26[2];
					var _this27 = this.s[1];
					var v27 = this.s[3];
					_this27[0] = v27[0];
					_this27[1] = v27[1];
					_this27[2] = v27[2];
					var _this28 = this.w1[1];
					var v28 = this.w1[3];
					_this28[0] = v28[0];
					_this28[1] = v28[1];
					_this28[2] = v28[2];
					var _this29 = this.w2[1];
					var v29 = this.w2[3];
					_this29[0] = v29[0];
					_this29[1] = v29[1];
					_this29[2] = v29[2];
					break;
				case 13:
					var _this30 = this.s[1];
					var v30 = this.s[3];
					_this30[0] = v30[0];
					_this30[1] = v30[1];
					_this30[2] = v30[2];
					var _this31 = this.w1[1];
					var v31 = this.w1[3];
					_this31[0] = v31[0];
					_this31[1] = v31[1];
					_this31[2] = v31[2];
					var _this32 = this.w2[1];
					var v32 = this.w2[3];
					_this32[0] = v32[0];
					_this32[1] = v32[1];
					_this32[2] = v32[2];
					break;
				case 14:
					var _this33 = this.s[0];
					var v33 = this.s[3];
					_this33[0] = v33[0];
					_this33[1] = v33[1];
					_this33[2] = v33[2];
					var _this34 = this.w1[0];
					var v34 = this.w1[3];
					_this34[0] = v34[0];
					_this34[1] = v34[1];
					_this34[2] = v34[2];
					var _this35 = this.w2[0];
					var v35 = this.w2[3];
					_this35[0] = v35[0];
					_this35[1] = v35[1];
					_this35[2] = v35[2];
					break;
			}
		}

		proto.computeWitnessPoint1 = function (addMargin) {
			var tmp;
			var tmpX;
			var tmpY;
			var tmpZ;
			var idir;
			var idirX;
			var idirY;
			var idirZ;
			var v = this.dir;
			idirX = v[0];
			idirY = v[1];
			idirZ = v[2];
			var ldir1;
			var ldir1X;
			var ldir1Y;
			var ldir1Z;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = this.tf1._rotation[0] * idirX + this.tf1._rotation[3] * idirY + this.tf1._rotation[6] * idirZ;
			__tmp__Y = this.tf1._rotation[1] * idirX + this.tf1._rotation[4] * idirY + this.tf1._rotation[7] * idirZ;
			__tmp__Z = this.tf1._rotation[2] * idirX + this.tf1._rotation[5] * idirY + this.tf1._rotation[8] * idirZ;
			ldir1X = __tmp__X;
			ldir1Y = __tmp__Y;
			ldir1Z = __tmp__Z;
			var iw1;
			var iw1X;
			var iw1Y;
			var iw1Z;
			var v1 = this.dir;
			v1[0] = ldir1X;
			v1[1] = ldir1Y;
			v1[2] = ldir1Z;
			this.c1.computeLocalSupportingVertex(this.dir, this.w1[this.simplexSize]);
			if (addMargin) {
				var _this = this.dir;
				var invLen = Math.sqrt(_this[0] * _this[0] + _this[1] * _this[1] + _this[2] * _this[2]);
				if (invLen > 0) {
					invLen = 1 / invLen;
				}
				var tx = _this[0] * invLen;
				var ty = _this[1] * invLen;
				var tz = _this[2] * invLen;
				_this[0] = tx;
				_this[1] = ty;
				_this[2] = tz;
				var _this1 = this.w1[this.simplexSize];
				var v2 = this.dir;
				var s = this.c1._gjkMargin;
				var tx1 = _this1[0] + v2[0] * s;
				var ty1 = _this1[1] + v2[1] * s;
				var tz1 = _this1[2] + v2[2] * s;
				_this1[0] = tx1;
				_this1[1] = ty1;
				_this1[2] = tz1;
			}
			var v3 = this.w1[this.simplexSize];
			tmpX = v3[0];
			tmpY = v3[1];
			tmpZ = v3[2];
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = this.tf1._rotation[0] * tmpX + this.tf1._rotation[1] * tmpY + this.tf1._rotation[2] * tmpZ;
			__tmp__Y1 = this.tf1._rotation[3] * tmpX + this.tf1._rotation[4] * tmpY + this.tf1._rotation[5] * tmpZ;
			__tmp__Z1 = this.tf1._rotation[6] * tmpX + this.tf1._rotation[7] * tmpY + this.tf1._rotation[8] * tmpZ;
			iw1X = __tmp__X1;
			iw1Y = __tmp__Y1;
			iw1Z = __tmp__Z1;
			iw1X += this.tf1._position[0];
			iw1Y += this.tf1._position[1];
			iw1Z += this.tf1._position[2];
			var v4 = this.w1[this.simplexSize];
			v4[0] = iw1X;
			v4[1] = iw1Y;
			v4[2] = iw1Z;
			var v5 = this.dir;
			v5[0] = idirX;
			v5[1] = idirY;
			v5[2] = idirZ;
		}

		proto.computeWitnessPoint2 = function (addMargin) {
			var tmp;
			var tmpX;
			var tmpY;
			var tmpZ;
			var idir;
			var idirX;
			var idirY;
			var idirZ;
			var v = this.dir;
			idirX = v[0];
			idirY = v[1];
			idirZ = v[2];
			var ldir2;
			var ldir2X;
			var ldir2Y;
			var ldir2Z;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = this.tf2._rotation[0] * idirX + this.tf2._rotation[3] * idirY + this.tf2._rotation[6] * idirZ;
			__tmp__Y = this.tf2._rotation[1] * idirX + this.tf2._rotation[4] * idirY + this.tf2._rotation[7] * idirZ;
			__tmp__Z = this.tf2._rotation[2] * idirX + this.tf2._rotation[5] * idirY + this.tf2._rotation[8] * idirZ;
			ldir2X = __tmp__X;
			ldir2Y = __tmp__Y;
			ldir2Z = __tmp__Z;
			ldir2X = -ldir2X;
			ldir2Y = -ldir2Y;
			ldir2Z = -ldir2Z;
			var iw2;
			var iw2X;
			var iw2Y;
			var iw2Z;
			var v1 = this.dir;
			v1[0] = ldir2X;
			v1[1] = ldir2Y;
			v1[2] = ldir2Z;
			this.c2.computeLocalSupportingVertex(this.dir, this.w2[this.simplexSize]);
			if (addMargin) {
				var _this = this.dir;
				var invLen = Math.sqrt(_this[0] * _this[0] + _this[1] * _this[1] + _this[2] * _this[2]);
				if (invLen > 0) {
					invLen = 1 / invLen;
				}
				var tx = _this[0] * invLen;
				var ty = _this[1] * invLen;
				var tz = _this[2] * invLen;
				_this[0] = tx;
				_this[1] = ty;
				_this[2] = tz;
				var _this1 = this.w2[this.simplexSize];
				var v2 = this.dir;
				var s = this.c2._gjkMargin;
				var tx1 = _this1[0] + v2[0] * s;
				var ty1 = _this1[1] + v2[1] * s;
				var tz1 = _this1[2] + v2[2] * s;
				_this1[0] = tx1;
				_this1[1] = ty1;
				_this1[2] = tz1;
			}
			var v3 = this.w2[this.simplexSize];
			tmpX = v3[0];
			tmpY = v3[1];
			tmpZ = v3[2];
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = this.tf2._rotation[0] * tmpX + this.tf2._rotation[1] * tmpY + this.tf2._rotation[2] * tmpZ;
			__tmp__Y1 = this.tf2._rotation[3] * tmpX + this.tf2._rotation[4] * tmpY + this.tf2._rotation[5] * tmpZ;
			__tmp__Z1 = this.tf2._rotation[6] * tmpX + this.tf2._rotation[7] * tmpY + this.tf2._rotation[8] * tmpZ;
			iw2X = __tmp__X1;
			iw2Y = __tmp__Y1;
			iw2Z = __tmp__Z1;
			iw2X += this.tf2._position[0];
			iw2Y += this.tf2._position[1];
			iw2Z += this.tf2._position[2];
			var v4 = this.w2[this.simplexSize];
			v4[0] = iw2X;
			v4[1] = iw2Y;
			v4[2] = iw2Z;
			var v5 = this.dir;
			v5[0] = idirX;
			v5[1] = idirY;
			v5[2] = idirZ;
		}

		proto.pointToTetrahedron = function () {
			var _g = 0;
			while (_g < 3) {
				var i = _g++;
				var _this = this.dir;
				var v = this.baseDirs[i];
				_this[0] = v[0];
				_this[1] = v[1];
				_this[2] = v[2];
				this.computeWitnessPoint1(false);
				this.computeWitnessPoint2(false);
				var _this1 = this.s[this.simplexSize];
				var v1 = this.w1[this.simplexSize];
				_this1[0] = v1[0];
				_this1[1] = v1[1];
				_this1[2] = v1[2];
				var _this2 = _this1;
				var v2 = this.w2[this.simplexSize];
				var tx = _this2[0] - v2[0];
				var ty = _this2[1] - v2[1];
				var tz = _this2[2] - v2[2];
				_this2[0] = tx;
				_this2[1] = ty;
				_this2[2] = tz;
				this.simplexSize++;
				this.lineToTetrahedron();
				if (this.simplexSize == 4) {
					break;
				}
				this.simplexSize--;
				var _this3 = this.dir;
				var tx1 = -_this3[0];
				var ty1 = -_this3[1];
				var tz1 = -_this3[2];
				_this3[0] = tx1;
				_this3[1] = ty1;
				_this3[2] = tz1;
				this.computeWitnessPoint1(false);
				this.computeWitnessPoint2(false);
				var _this4 = this.s[this.simplexSize];
				var v3 = this.w1[this.simplexSize];
				_this4[0] = v3[0];
				_this4[1] = v3[1];
				_this4[2] = v3[2];
				var _this5 = _this4;
				var v4 = this.w2[this.simplexSize];
				var tx2 = _this5[0] - v4[0];
				var ty2 = _this5[1] - v4[1];
				var tz2 = _this5[2] - v4[2];
				_this5[0] = tx2;
				_this5[1] = ty2;
				_this5[2] = tz2;
				this.simplexSize++;
				this.lineToTetrahedron();
				if (this.simplexSize == 4) {
					break;
				}
				this.simplexSize--;
			}
		}

		proto.lineToTetrahedron = function () {
			var oldDir;
			var oldDirX;
			var oldDirY;
			var oldDirZ;
			var v = this.dir;
			oldDirX = v[0];
			oldDirY = v[1];
			oldDirZ = v[2];
			var s0;
			var s0X;
			var s0Y;
			var s0Z;
			var s1;
			var s1X;
			var s1Y;
			var s1Z;
			var lineDir;
			var lineDirX;
			var lineDirY;
			var lineDirZ;
			var v1 = this.s[0];
			s0X = v1[0];
			s0Y = v1[1];
			s0Z = v1[2];
			var v2 = this.s[1];
			s1X = v2[0];
			s1Y = v2[1];
			s1Z = v2[2];
			lineDirX = s0X - s1X;
			lineDirY = s0Y - s1Y;
			lineDirZ = s0Z - s1Z;
			var _g = 0;
			while (_g < 3) {
				var i = _g++;
				var baseDir;
				var baseDirX;
				var baseDirY;
				var baseDirZ;
				var v3 = this.baseDirs[i];
				baseDirX = v3[0];
				baseDirY = v3[1];
				baseDirZ = v3[2];
				var newDir;
				var newDirX;
				var newDirY;
				var newDirZ;
				newDirX = lineDirY * baseDirZ - lineDirZ * baseDirY;
				newDirY = lineDirZ * baseDirX - lineDirX * baseDirZ;
				newDirZ = lineDirX * baseDirY - lineDirY * baseDirX;
				var v4 = this.dir;
				v4[0] = newDirX;
				v4[1] = newDirY;
				v4[2] = newDirZ;
				this.computeWitnessPoint1(false);
				this.computeWitnessPoint2(false);
				var _this = this.s[this.simplexSize];
				var v5 = this.w1[this.simplexSize];
				_this[0] = v5[0];
				_this[1] = v5[1];
				_this[2] = v5[2];
				var _this1 = _this;
				var v6 = this.w2[this.simplexSize];
				var tx = _this1[0] - v6[0];
				var ty = _this1[1] - v6[1];
				var tz = _this1[2] - v6[2];
				_this1[0] = tx;
				_this1[1] = ty;
				_this1[2] = tz;
				this.simplexSize++;
				this.triangleToTetrahedron();
				if (this.simplexSize == 4) {
					break;
				}
				this.simplexSize--;
				var _this2 = this.dir;
				var tx1 = -_this2[0];
				var ty1 = -_this2[1];
				var tz1 = -_this2[2];
				_this2[0] = tx1;
				_this2[1] = ty1;
				_this2[2] = tz1;
				this.computeWitnessPoint1(false);
				this.computeWitnessPoint2(false);
				var _this3 = this.s[this.simplexSize];
				var v7 = this.w1[this.simplexSize];
				_this3[0] = v7[0];
				_this3[1] = v7[1];
				_this3[2] = v7[2];
				var _this4 = _this3;
				var v8 = this.w2[this.simplexSize];
				var tx2 = _this4[0] - v8[0];
				var ty2 = _this4[1] - v8[1];
				var tz2 = _this4[2] - v8[2];
				_this4[0] = tx2;
				_this4[1] = ty2;
				_this4[2] = tz2;
				this.simplexSize++;
				this.triangleToTetrahedron();
				if (this.simplexSize == 4) {
					break;
				}
				this.simplexSize--;
			}
			var v9 = this.dir;
			v9[0] = oldDirX;
			v9[1] = oldDirY;
			v9[2] = oldDirZ;
		}

		proto.triangleToTetrahedron = function () {
			var oldDir;
			var oldDirX;
			var oldDirY;
			var oldDirZ;
			var v = this.dir;
			oldDirX = v[0];
			oldDirY = v[1];
			oldDirZ = v[2];
			while (true) {
				var s0;
				var s0X;
				var s0Y;
				var s0Z;
				var s1;
				var s1X;
				var s1Y;
				var s1Z;
				var s2;
				var s2X;
				var s2Y;
				var s2Z;
				var s01;
				var s01X;
				var s01Y;
				var s01Z;
				var s02;
				var s02X;
				var s02Y;
				var s02Z;
				var v1 = this.s[0];
				s0X = v1[0];
				s0Y = v1[1];
				s0Z = v1[2];
				var v2 = this.s[1];
				s1X = v2[0];
				s1Y = v2[1];
				s1Z = v2[2];
				var v3 = this.s[2];
				s2X = v3[0];
				s2Y = v3[1];
				s2Z = v3[2];
				s01X = s1X - s0X;
				s01Y = s1Y - s0Y;
				s01Z = s1Z - s0Z;
				s02X = s2X - s0X;
				s02Y = s2Y - s0Y;
				s02Z = s2Z - s0Z;
				var n;
				var nX;
				var nY;
				var nZ;
				nX = s01Y * s02Z - s01Z * s02Y;
				nY = s01Z * s02X - s01X * s02Z;
				nZ = s01X * s02Y - s01Y * s02X;
				var v4 = this.dir;
				v4[0] = nX;
				v4[1] = nY;
				v4[2] = nZ;
				this.computeWitnessPoint1(false);
				this.computeWitnessPoint2(false);
				var _this = this.s[this.simplexSize];
				var v5 = this.w1[this.simplexSize];
				_this[0] = v5[0];
				_this[1] = v5[1];
				_this[2] = v5[2];
				var _this1 = _this;
				var v6 = this.w2[this.simplexSize];
				var tx = _this1[0] - v6[0];
				var ty = _this1[1] - v6[1];
				var tz = _this1[2] - v6[2];
				_this1[0] = tx;
				_this1[1] = ty;
				_this1[2] = tz;
				this.simplexSize++;
				if (this.isValidTetrahedron()) {
					break;
				}
				this.simplexSize--;
				var _this2 = this.dir;
				var tx1 = -_this2[0];
				var ty1 = -_this2[1];
				var tz1 = -_this2[2];
				_this2[0] = tx1;
				_this2[1] = ty1;
				_this2[2] = tz1;
				this.computeWitnessPoint1(false);
				this.computeWitnessPoint2(false);
				var _this3 = this.s[this.simplexSize];
				var v7 = this.w1[this.simplexSize];
				_this3[0] = v7[0];
				_this3[1] = v7[1];
				_this3[2] = v7[2];
				var _this4 = _this3;
				var v8 = this.w2[this.simplexSize];
				var tx2 = _this4[0] - v8[0];
				var ty2 = _this4[1] - v8[1];
				var tz2 = _this4[2] - v8[2];
				_this4[0] = tx2;
				_this4[1] = ty2;
				_this4[2] = tz2;
				this.simplexSize++;
				if (this.isValidTetrahedron()) {
					break;
				}
				this.simplexSize--;
				if (!false) {
					break;
				}
			}
			var v9 = this.dir;
			v9[0] = oldDirX;
			v9[1] = oldDirY;
			v9[2] = oldDirZ;
		}

		proto.isValidTetrahedron = function () {
			var e00 = this.s[1][0] - this.s[0][0];
			var e01 = this.s[1][1] - this.s[0][1];
			var e02 = this.s[1][2] - this.s[0][2];
			var e10 = this.s[2][0] - this.s[0][0];
			var e11 = this.s[2][1] - this.s[0][1];
			var e12 = this.s[2][2] - this.s[0][2];
			var e20 = this.s[3][0] - this.s[0][0];
			var e21 = this.s[3][1] - this.s[0][1];
			var e22 = this.s[3][2] - this.s[0][2];
			var det = e00 * (e11 * e22 - e12 * e21) - e01 * (e10 * e22 - e12 * e20) + e02 * (e10 * e21 - e11 * e20);
			if (!(det > 1e-12)) {
				return det < -1e-12;
			} else {
				return true;
			}
		}

		proto.computeDepth = function (convex1, convex2, tf1, tf2, initialPolyhedron, initialPolyhedron1, initialPolyhedron2) {
			var _this = this.polyhedron;
			while (_this._numTriangles > 0) {
				var t = _this._triangleList;
				_this._numTriangles--;
				var prev = t._prev;
				var next = t._next;
				if (prev != null) {
					prev._next = next;
				}
				if (next != null) {
					next._prev = prev;
				}
				if (t == _this._triangleList) {
					_this._triangleList = _this._triangleList._next;
				}
				if (t == _this._triangleListLast) {
					_this._triangleListLast = _this._triangleListLast._prev;
				}
				t._next = null;
				t._prev = null;
				t.removeReferences();
				t._next = _this._trianglePool;
				_this._trianglePool = t;
			}
			while (_this._numVertices > 0) {
				var v = _this._vertices[--_this._numVertices];
				v.removeReferences();
				v._next = _this._vertexPool;
				_this._vertexPool = v;
			}
			var tmp = this.polyhedron;
			var _this1 = this.polyhedron;
			var first = _this1._vertexPool;
			if (first != null) {
				_this1._vertexPool = first._next;
				first._next = null;
			} else {
				first = new collision.narrowphase.detector.gjkepa.EpaVertex();
			}
			var tmp1 = first.init(initialPolyhedron[0], initialPolyhedron1[0], initialPolyhedron2[0]);
			var _this2 = this.polyhedron;
			var first1 = _this2._vertexPool;
			if (first1 != null) {
				_this2._vertexPool = first1._next;
				first1._next = null;
			} else {
				first1 = new collision.narrowphase.detector.gjkepa.EpaVertex();
			}
			var tmp2 = first1.init(initialPolyhedron[1], initialPolyhedron1[1], initialPolyhedron2[1]);
			var _this3 = this.polyhedron;
			var first2 = _this3._vertexPool;
			if (first2 != null) {
				_this3._vertexPool = first2._next;
				first2._next = null;
			} else {
				first2 = new collision.narrowphase.detector.gjkepa.EpaVertex();
			}
			var tmp3 = first2.init(initialPolyhedron[2], initialPolyhedron1[2], initialPolyhedron2[2]);
			var _this4 = this.polyhedron;
			var first3 = _this4._vertexPool;
			if (first3 != null) {
				_this4._vertexPool = first3._next;
				first3._next = null;
			} else {
				first3 = new collision.narrowphase.detector.gjkepa.EpaVertex();
			}
			if (!tmp._init(tmp1, tmp2, tmp3, first3.init(initialPolyhedron[3], initialPolyhedron1[3], initialPolyhedron2[3]))) {
				return collision.narrowphase.detector.gjkepa.GjkEpaResultState.EPA_FAILED_TO_INIT;
			}
			this.simplexSize = 0;
			var supportingVertex = this.s[0];
			var witness1 = this.w1[0];
			var witness2 = this.w2[0];
			var count = 0;
			var maxIterations = 40;
			while (count < maxIterations) {
				var f = this.polyhedron._triangleList;
				var mind = 1.0 / 0;
				var minf = null;
				while (f != null) {
					var n = f._next;
					if (f._distanceSq < mind) {
						mind = f._distanceSq;
						minf = f;
					}
					f = n;
				}
				var face = minf;
				var _this5 = this.dir;
				var v1 = face._normal;
				_this5[0] = v1[0];
				_this5[1] = v1[1];
				_this5[2] = v1[2];
				var _this6 = _this5;
				var invLen = Math.sqrt(_this6[0] * _this6[0] + _this6[1] * _this6[1] + _this6[2] * _this6[2]);
				if (invLen > 0) {
					invLen = 1 / invLen;
				}
				var tx = _this6[0] * invLen;
				var ty = _this6[1] * invLen;
				var tz = _this6[2] * invLen;
				_this6[0] = tx;
				_this6[1] = ty;
				_this6[2] = tz;
				this.computeWitnessPoint1(false);
				this.computeWitnessPoint2(false);
				var _this7 = this.s[this.simplexSize];
				var v2 = this.w1[this.simplexSize];
				_this7[0] = v2[0];
				_this7[1] = v2[1];
				_this7[2] = v2[2];
				var _this8 = _this7;
				var v3 = this.w2[this.simplexSize];
				var tx1 = _this8[0] - v3[0];
				var ty1 = _this8[1] - v3[1];
				var tz1 = _this8[2] - v3[2];
				_this8[0] = tx1;
				_this8[1] = ty1;
				_this8[2] = tz1;
				var v0 = face._vertices[0];
				var v11 = face._vertices[1];
				var v21 = face._vertices[2];
				var _this9 = v0.v;
				var v4 = this.dir;
				var dot1 = _this9[0] * v4[0] + _this9[1] * v4[1] + _this9[2] * v4[2];
				var v5 = this.dir;
				var dot2 = supportingVertex[0] * v5[0] + supportingVertex[1] * v5[1] + supportingVertex[2] * v5[2];
				if (dot2 - dot1 < 1e-6 || count == maxIterations - 1) {
					var _this10 = this.closest;
					var v6 = this.dir;
					_this10[0] = v6[0];
					_this10[1] = v6[1];
					_this10[2] = v6[2];
					var _this11 = _this10;
					var _this12 = this.dir;
					var v7 = v0.v;
					var _this13 = this.dir;
					var s = (_this12[0] * v7[0] + _this12[1] * v7[1] + _this12[2] * v7[2]) / (_this13[0] * _this13[0] + _this13[1] * _this13[1] + _this13[2] * _this13[2]);
					var tx2 = _this11[0] * s;
					var ty2 = _this11[1] * s;
					var tz2 = _this11[2] * s;
					_this11[0] = tx2;
					_this11[1] = ty2;
					_this11[2] = tz2;
					var c;
					var cX;
					var cY;
					var cZ;
					var v8 = this.closest;
					cX = v8[0];
					cY = v8[1];
					cZ = v8[2];
					var s0;
					var s0X;
					var s0Y;
					var s0Z;
					var w10;
					var w10X;
					var w10Y;
					var w10Z;
					var w20;
					var w20X;
					var w20Y;
					var w20Z;
					var s1;
					var s1X;
					var s1Y;
					var s1Z;
					var w11;
					var w11X;
					var w11Y;
					var w11Z;
					var w21;
					var w21X;
					var w21Y;
					var w21Z;
					var s2;
					var s2X;
					var s2Y;
					var s2Z;
					var w12;
					var w12X;
					var w12Y;
					var w12Z;
					var w22;
					var w22X;
					var w22Y;
					var w22Z;
					var v9 = v0.v;
					s0X = v9[0];
					s0Y = v9[1];
					s0Z = v9[2];
					var v10 = v0.w1;
					w10X = v10[0];
					w10Y = v10[1];
					w10Z = v10[2];
					var v12 = v0.w2;
					w20X = v12[0];
					w20Y = v12[1];
					w20Z = v12[2];
					var v13 = v11.v;
					s1X = v13[0];
					s1Y = v13[1];
					s1Z = v13[2];
					var v14 = v11.w1;
					w11X = v14[0];
					w11Y = v14[1];
					w11Z = v14[2];
					var v15 = v11.w2;
					w21X = v15[0];
					w21Y = v15[1];
					w21Z = v15[2];
					var v16 = v21.v;
					s2X = v16[0];
					s2Y = v16[1];
					s2Z = v16[2];
					var v17 = v21.w1;
					w12X = v17[0];
					w12Y = v17[1];
					w12Z = v17[2];
					var v18 = v21.w2;
					w22X = v18[0];
					w22Y = v18[1];
					w22Z = v18[2];
					var s01;
					var s01X;
					var s01Y;
					var s01Z;
					var s02;
					var s02X;
					var s02Y;
					var s02Z;
					var s0c;
					var s0cX;
					var s0cY;
					var s0cZ;
					s01X = s1X - s0X;
					s01Y = s1Y - s0Y;
					s01Z = s1Z - s0Z;
					s02X = s2X - s0X;
					s02Y = s2Y - s0Y;
					s02Z = s2Z - s0Z;
					s0cX = cX - s0X;
					s0cY = cY - s0Y;
					s0cZ = cZ - s0Z;
					var d11 = s01X * s01X + s01Y * s01Y + s01Z * s01Z;
					var d12 = s01X * s02X + s01Y * s02Y + s01Z * s02Z;
					var d22 = s02X * s02X + s02Y * s02Y + s02Z * s02Z;
					var d1c = s01X * s0cX + s01Y * s0cY + s01Z * s0cZ;
					var d2c = s02X * s0cX + s02Y * s0cY + s02Z * s0cZ;
					var invDet = d11 * d22 - d12 * d12;
					if (invDet != 0) {
						invDet = 1 / invDet;
					}
					var s3 = (d1c * d22 - d2c * d12) * invDet;
					var t1 = (-d1c * d12 + d2c * d11) * invDet;
					var diff;
					var diffX;
					var diffY;
					var diffZ;
					var cp1;
					var cp1X;
					var cp1Y;
					var cp1Z;
					var cp2;
					var cp2X;
					var cp2Y;
					var cp2Z;
					diffX = w11X - w10X;
					diffY = w11Y - w10Y;
					diffZ = w11Z - w10Z;
					cp1X = w10X + diffX * s3;
					cp1Y = w10Y + diffY * s3;
					cp1Z = w10Z + diffZ * s3;
					diffX = w12X - w10X;
					diffY = w12Y - w10Y;
					diffZ = w12Z - w10Z;
					cp1X += diffX * t1;
					cp1Y += diffY * t1;
					cp1Z += diffZ * t1;
					diffX = w21X - w20X;
					diffY = w21Y - w20Y;
					diffZ = w21Z - w20Z;
					cp2X = w20X + diffX * s3;
					cp2Y = w20Y + diffY * s3;
					cp2Z = w20Z + diffZ * s3;
					diffX = w22X - w20X;
					diffY = w22Y - w20Y;
					diffZ = w22Z - w20Z;
					cp2X += diffX * t1;
					cp2Y += diffY * t1;
					cp2Z += diffZ * t1;
					var v19 = this.closestPoint1;
					v19[0] = cp1X;
					v19[1] = cp1Y;
					v19[2] = cp1Z;
					var v20 = this.closestPoint2;
					v20[0] = cp2X;
					v20[1] = cp2Y;
					v20[2] = cp2Z;
					var _this14 = this.closest;
					this.depth = Math.sqrt(_this14[0] * _this14[0] + _this14[1] * _this14[1] + _this14[2] * _this14[2]);
					return collision.narrowphase.detector.gjkepa.GjkEpaResultState.SUCCEEDED;
				}
				var _this15 = this.polyhedron;
				var first4 = _this15._vertexPool;
				if (first4 != null) {
					_this15._vertexPool = first4._next;
					first4._next = null;
				} else {
					first4 = new collision.narrowphase.detector.gjkepa.EpaVertex();
				}
				var epaVertex = first4.init(supportingVertex, witness1, witness2);
				if (!this.polyhedron._addVertex(epaVertex, face)) {
					return collision.narrowphase.detector.gjkepa.GjkEpaResultState.EPA_FAILED_TO_ADD_VERTEX;
				}
				++count;
			}
			return collision.narrowphase.detector.gjkepa.GjkEpaResultState.EPA_DID_NOT_CONVERGE;
		}

		proto.computeClosestPoints = function (c1, c2, tf1, tf2, cache) {
			return this.computeClosestPointsImpl(c1, c2, tf1, tf2, cache, true);
		}

		proto.computeDistance = function (c1, c2, tf1, tf2, cache) {
			return this.computeClosestPointsImpl(c1, c2, tf1, tf2, cache, false);
		}

		proto.convexCast = function (c1, c2, tf1, tf2, tl1, tl2, hit) {
			return this.convexCastImpl(c1, c2, tf1, tf2, tl1, tl2, hit);
		}

		proto.rayCast = function (c, tf, begin, end, hit) {
			var tf1 = this.tempTransform;
			var tf2 = tf;
			var v = begin;
			tf1._position[0] = v[0];
			tf1._position[1] = v[1];
			tf1._position[2] = v[2];
			var tl1 = this.tl1;
			var tl2 = this.tl2;
			tl1[0] = end[0];
			tl1[1] = end[1];
			tl1[2] = end[2];
			var _this = tl1;
			var tx = _this[0] - begin[0];
			var ty = _this[1] - begin[1];
			var tz = _this[2] - begin[2];
			_this[0] = tx;
			_this[1] = ty;
			_this[2] = tz;
			math.vec3_zero$(tl2)
			return this.convexCastImpl(null, c, tf1, tf2, tl1, tl2, hit);
		}

		var GjkEpa = function () {
			var this1 = new Array(4);
			this.s = this1;
			var this2 = new Array(4);
			this.w1 = this2;
			var this3 = new Array(4);
			this.w2 = this3;
			var this4 = new Array(3);
			this.baseDirs = this4;
			this.baseDirs[0] = vec3(1, 0, 0);
			this.baseDirs[1] = vec3(0, 1, 0);
			this.baseDirs[2] = vec3(0, 0, 1);
			this.tl1 = vec3();
			this.tl2 = vec3();
			this.rayX = vec3();
			this.rayR = vec3();
			this.tempTransform = new pe.common.Transform();
			var _g = 0;
			while (_g < 4) {
				var i = _g++;
				this.s[i] = vec3();
				this.w1[i] = vec3();
				this.w2[i] = vec3();
			}
			this.dir = vec3();
			this.closest = vec3();
			this.closestPoint1 = vec3();
			this.closestPoint2 = vec3();
			this.polyhedron = new collision.narrowphase.detector.gjkepa.EpaPolyhedron();
		}
		return GjkEpa;
	});

	collision.broadphase.BroadPhaseType = pe.define(function (proto) {
		return function () { }
	});

	collision.broadphase.Proxy = pe.define(function (proto) {
		return function (userData, id) {
			this.userData = userData;
			this._id = id;
			this._prev = null;
			this._next = null;
			this._aabbMinX = 0;
			this._aabbMinY = 0;
			this._aabbMinZ = 0;
			this._aabbMaxX = 0;
			this._aabbMaxY = 0;
			this._aabbMaxZ = 0;
		}
	});

	collision.broadphase.ProxyPair = pe.define(function (proto) {
		return function () {
			this._p1 = null;
			this._p2 = null;
		}
	});

	collision.broadphase.bvh.BvhInsertionStrategy = pe.define(function (proto) {
		return function () { }
	});

	collision.broadphase.bvh.BvhNode = pe.define(function (proto) {
		return function () {
			this._next = null;
			this._prevLeaf = null;
			this._nextLeaf = null;
			var this1 = new Array(2);
			this._children = this1;
			this._childIndex = 0;
			this._parent = null;
			this._height = 0;
			this._proxy = null;
			this._aabbMinX = 0;
			this._aabbMinY = 0;
			this._aabbMinZ = 0;
			this._aabbMaxX = 0;
			this._aabbMaxY = 0;
			this._aabbMaxZ = 0;
		}
	});

	collision.broadphase.bvh.BvhProxy = pe.define(function (proto) {
		return function (userData, id) {
			collision.broadphase.Proxy.call(this, userData, id);
			this._leaf = null;
			this._moved = false;
		}
	});

	collision.geometry.GeometryType = pe.define(function (proto) {
		return function () { }
	});

	collision.geometry.RayCastHit = pe.define(function (proto) {
		return function () {
			this.position = vec3();
			this.normal = vec3();
			this.fraction = 0;
		}
	});

	collision.narrowphase.DetectorResultPoint = pe.define(function (proto) {
		return function () {
			this.position1 = vec3();
			this.position2 = vec3();
			this.depth = 0;
			this.id = 0;
			collision.narrowphase.DetectorResultPoint.count++;
		}
	});

	
	
	collision.narrowphase.detector.gjkepa.EpaPolyhedronState = pe.define(function (proto) {
		return function () { }
	});

	collision.narrowphase.detector.gjkepa.GjkEpa.getInstance = pe.define(function (proto) {
		return function () {
			return collision.narrowphase.detector.gjkepa.GjkEpa.instance;
		}
	});

	collision.narrowphase.detector.gjkepa.GjkEpaLog = pe.define(function (proto) {
		return function () { }
	});



	collision.narrowphase.detector.gjkepa.SimplexUtil = pe.define(function (proto) {
		return function () { }
	});

	collision.narrowphase.detector.gjkepa.SimplexUtil.projectOrigin2 = pe.define(function (proto) {
		return function (vec1, vec2, out) {
			var v1;
			var v1X;
			var v1Y;
			var v1Z;
			var v2;
			var v2X;
			var v2Y;
			var v2Z;
			var v = vec1;
			v1X = v[0];
			v1Y = v[1];
			v1Z = v[2];
			var v3 = vec2;
			v2X = v3[0];
			v2Y = v3[1];
			v2Z = v3[2];
			var v12;
			var v12X;
			var v12Y;
			var v12Z;
			v12X = v2X - v1X;
			v12Y = v2Y - v1Y;
			v12Z = v2Z - v1Z;
			var d = v12X * v12X + v12Y * v12Y + v12Z * v12Z;
			var t = v12X * v1X + v12Y * v1Y + v12Z * v1Z;
			t = -t / d;
			if (t < 0) {
				var v4 = out;
				v4[0] = v1X;
				v4[1] = v1Y;
				v4[2] = v1Z;
				return 1;
			}
			if (t > 1) {
				var v5 = out;
				v5[0] = v2X;
				v5[1] = v2Y;
				v5[2] = v2Z;
				return 2;
			}
			var p;
			var pX;
			var pY;
			var pZ;
			pX = v1X + v12X * t;
			pY = v1Y + v12Y * t;
			pZ = v1Z + v12Z * t;
			var v6 = out;
			v6[0] = pX;
			v6[1] = pY;
			v6[2] = pZ;
			return 3;
		}
	});

	collision.narrowphase.detector.gjkepa.SimplexUtil.projectOrigin3 = pe.define(function (proto) {
		return function (vec1, vec2, vec3, out) {
			var v1;
			var v1X;
			var v1Y;
			var v1Z;
			var v2;
			var v2X;
			var v2Y;
			var v2Z;
			var v3;
			var v3X;
			var v3Y;
			var v3Z;
			var v12;
			var v12X;
			var v12Y;
			var v12Z;
			var v23;
			var v23X;
			var v23Y;
			var v23Z;
			var v31;
			var v31X;
			var v31Y;
			var v31Z;
			var v = vec1;
			v1X = v[0];
			v1Y = v[1];
			v1Z = v[2];
			var v4 = vec2;
			v2X = v4[0];
			v2Y = v4[1];
			v2Z = v4[2];
			var v5 = vec3;
			v3X = v5[0];
			v3Y = v5[1];
			v3Z = v5[2];
			v12X = v2X - v1X;
			v12Y = v2Y - v1Y;
			v12Z = v2Z - v1Z;
			v23X = v3X - v2X;
			v23Y = v3Y - v2Y;
			v23Z = v3Z - v2Z;
			v31X = v1X - v3X;
			v31Y = v1Y - v3Y;
			v31Z = v1Z - v3Z;
			var n;
			var nX;
			var nY;
			var nZ;
			nX = v12Y * v23Z - v12Z * v23Y;
			nY = v12Z * v23X - v12X * v23Z;
			nZ = v12X * v23Y - v12Y * v23X;
			var n12;
			var n12X;
			var n12Y;
			var n12Z;
			var n23;
			var n23X;
			var n23Y;
			var n23Z;
			var n31;
			var n31X;
			var n31Y;
			var n31Z;
			n12X = v12Y * nZ - v12Z * nY;
			n12Y = v12Z * nX - v12X * nZ;
			n12Z = v12X * nY - v12Y * nX;
			n23X = v23Y * nZ - v23Z * nY;
			n23Y = v23Z * nX - v23X * nZ;
			n23Z = v23X * nY - v23Y * nX;
			n31X = v31Y * nZ - v31Z * nY;
			n31Y = v31Z * nX - v31X * nZ;
			n31Z = v31X * nY - v31Y * nX;
			var d12 = v1X * n12X + v1Y * n12Y + v1Z * n12Z;
			var d23 = v2X * n23X + v2Y * n23Y + v2Z * n23Z;
			var d31 = v3X * n31X + v3Y * n31Y + v3Z * n31Z;
			var mind = -1;
			var minv;
			var minvX;
			var minvY;
			var minvZ;
			var mini = 0;
			minvX = 0;
			minvY = 0;
			minvZ = 0;
			if (d12 < 0) {
				var v11;
				var v1X1;
				var v1Y1;
				var v1Z1;
				var v21;
				var v2X1;
				var v2Y1;
				var v2Z1;
				var v6 = vec1;
				v1X1 = v6[0];
				v1Y1 = v6[1];
				v1Z1 = v6[2];
				var v7 = vec2;
				v2X1 = v7[0];
				v2Y1 = v7[1];
				v2Z1 = v7[2];
				var v121;
				var v12X1;
				var v12Y1;
				var v12Z1;
				v12X1 = v2X1 - v1X1;
				v12Y1 = v2Y1 - v1Y1;
				v12Z1 = v2Z1 - v1Z1;
				var d = v12X1 * v12X1 + v12Y1 * v12Y1 + v12Z1 * v12Z1;
				var t = v12X1 * v1X1 + v12Y1 * v1Y1 + v12Z1 * v1Z1;
				t = -t / d;
				var b;
				if (t < 0) {
					var v8 = out;
					v8[0] = v1X1;
					v8[1] = v1Y1;
					v8[2] = v1Z1;
					b = 1;
				} else if (t > 1) {
					var v9 = out;
					v9[0] = v2X1;
					v9[1] = v2Y1;
					v9[2] = v2Z1;
					b = 2;
				} else {
					var p;
					var pX;
					var pY;
					var pZ;
					pX = v1X1 + v12X1 * t;
					pY = v1Y1 + v12Y1 * t;
					pZ = v1Z1 + v12Z1 * t;
					var v10 = out;
					v10[0] = pX;
					v10[1] = pY;
					v10[2] = pZ;
					b = 3;
				}
				var d1 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
				mini = b;
				mind = d1;
				var v13 = out;
				minvX = v13[0];
				minvY = v13[1];
				minvZ = v13[2];
			}
			if (d23 < 0) {
				var v14;
				var v1X2;
				var v1Y2;
				var v1Z2;
				var v22;
				var v2X2;
				var v2Y2;
				var v2Z2;
				var v15 = vec2;
				v1X2 = v15[0];
				v1Y2 = v15[1];
				v1Z2 = v15[2];
				var v16 = vec3;
				v2X2 = v16[0];
				v2Y2 = v16[1];
				v2Z2 = v16[2];
				var v122;
				var v12X2;
				var v12Y2;
				var v12Z2;
				v12X2 = v2X2 - v1X2;
				v12Y2 = v2Y2 - v1Y2;
				v12Z2 = v2Z2 - v1Z2;
				var d2 = v12X2 * v12X2 + v12Y2 * v12Y2 + v12Z2 * v12Z2;
				var t1 = v12X2 * v1X2 + v12Y2 * v1Y2 + v12Z2 * v1Z2;
				t1 = -t1 / d2;
				var b1;
				if (t1 < 0) {
					var v17 = out;
					v17[0] = v1X2;
					v17[1] = v1Y2;
					v17[2] = v1Z2;
					b1 = 1;
				} else if (t1 > 1) {
					var v18 = out;
					v18[0] = v2X2;
					v18[1] = v2Y2;
					v18[2] = v2Z2;
					b1 = 2;
				} else {
					var p1;
					var pX1;
					var pY1;
					var pZ1;
					pX1 = v1X2 + v12X2 * t1;
					pY1 = v1Y2 + v12Y2 * t1;
					pZ1 = v1Z2 + v12Z2 * t1;
					var v19 = out;
					v19[0] = pX1;
					v19[1] = pY1;
					v19[2] = pZ1;
					b1 = 3;
				}
				var d3 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
				if (mind < 0 || d3 < mind) {
					mini = b1 << 1;
					mind = d3;
					var v20 = out;
					minvX = v20[0];
					minvY = v20[1];
					minvZ = v20[2];
				}
			}
			if (d31 < 0) {
				var v110;
				var v1X3;
				var v1Y3;
				var v1Z3;
				var v24;
				var v2X3;
				var v2Y3;
				var v2Z3;
				var v25 = vec1;
				v1X3 = v25[0];
				v1Y3 = v25[1];
				v1Z3 = v25[2];
				var v26 = vec3;
				v2X3 = v26[0];
				v2Y3 = v26[1];
				v2Z3 = v26[2];
				var v123;
				var v12X3;
				var v12Y3;
				var v12Z3;
				v12X3 = v2X3 - v1X3;
				v12Y3 = v2Y3 - v1Y3;
				v12Z3 = v2Z3 - v1Z3;
				var d4 = v12X3 * v12X3 + v12Y3 * v12Y3 + v12Z3 * v12Z3;
				var t2 = v12X3 * v1X3 + v12Y3 * v1Y3 + v12Z3 * v1Z3;
				t2 = -t2 / d4;
				var b2;
				if (t2 < 0) {
					var v27 = out;
					v27[0] = v1X3;
					v27[1] = v1Y3;
					v27[2] = v1Z3;
					b2 = 1;
				} else if (t2 > 1) {
					var v28 = out;
					v28[0] = v2X3;
					v28[1] = v2Y3;
					v28[2] = v2Z3;
					b2 = 2;
				} else {
					var p2;
					var pX2;
					var pY2;
					var pZ2;
					pX2 = v1X3 + v12X3 * t2;
					pY2 = v1Y3 + v12Y3 * t2;
					pZ2 = v1Z3 + v12Z3 * t2;
					var v29 = out;
					v29[0] = pX2;
					v29[1] = pY2;
					v29[2] = pZ2;
					b2 = 3;
				}
				var d5 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
				if (mind < 0 || d5 < mind) {
					mini = b2 & 1 | (b2 & 2) << 1;
					mind = d5;
					var v30 = out;
					minvX = v30[0];
					minvY = v30[1];
					minvZ = v30[2];
				}
			}
			if (mind > 0) {
				var v32 = out;
				v32[0] = minvX;
				v32[1] = minvY;
				v32[2] = minvZ;
				return mini;
			}
			var l = nX * nX + nY * nY + nZ * nZ;
			if (l > 0) {
				l = 1 / Math.sqrt(l);
			}
			nX *= l;
			nY *= l;
			nZ *= l;
			var dn = v1X * nX + v1Y * nY + v1Z * nZ;
			var l2 = nX * nX + nY * nY + nZ * nZ;
			l2 = dn / l2;
			minvX = nX * l2;
			minvY = nY * l2;
			minvZ = nZ * l2;
			var v33 = out;
			v33[0] = minvX;
			v33[1] = minvY;
			v33[2] = minvZ;
			return 7;
		}
	});

	collision.narrowphase.detector.gjkepa.SimplexUtil.projectOrigin4 = pe.define(function (proto) {
		return function (vec1, vec2, vec3, vec4, out) {
			var v1;
			var v1X;
			var v1Y;
			var v1Z;
			var v2;
			var v2X;
			var v2Y;
			var v2Z;
			var v3;
			var v3X;
			var v3Y;
			var v3Z;
			var v4;
			var v4X;
			var v4Y;
			var v4Z;
			var v12;
			var v12X;
			var v12Y;
			var v12Z;
			var v13;
			var v13X;
			var v13Y;
			var v13Z;
			var v14;
			var v14X;
			var v14Y;
			var v14Z;
			var v23;
			var v23X;
			var v23Y;
			var v23Z;
			var v24;
			var v24X;
			var v24Y;
			var v24Z;
			var v34;
			var v34X;
			var v34Y;
			var v34Z;
			var v = vec1;
			v1X = v[0];
			v1Y = v[1];
			v1Z = v[2];
			var v5 = vec2;
			v2X = v5[0];
			v2Y = v5[1];
			v2Z = v5[2];
			var v6 = vec3;
			v3X = v6[0];
			v3Y = v6[1];
			v3Z = v6[2];
			var v7 = vec4;
			v4X = v7[0];
			v4Y = v7[1];
			v4Z = v7[2];
			v12X = v2X - v1X;
			v12Y = v2Y - v1Y;
			v12Z = v2Z - v1Z;
			v13X = v3X - v1X;
			v13Y = v3Y - v1Y;
			v13Z = v3Z - v1Z;
			v14X = v4X - v1X;
			v14Y = v4Y - v1Y;
			v14Z = v4Z - v1Z;
			v23X = v3X - v2X;
			v23Y = v3Y - v2Y;
			v23Z = v3Z - v2Z;
			v24X = v4X - v2X;
			v24Y = v4Y - v2Y;
			v24Z = v4Z - v2Z;
			v34X = v4X - v3X;
			v34Y = v4Y - v3Y;
			v34Z = v4Z - v3Z;
			var rev;
			var n123;
			var n123X;
			var n123Y;
			var n123Z;
			var n134;
			var n134X;
			var n134Y;
			var n134Z;
			var n142;
			var n142X;
			var n142Y;
			var n142Z;
			var n243;
			var n243X;
			var n243Y;
			var n243Z;
			var n;
			var nX;
			var nY;
			var nZ;
			n123X = v12Y * v13Z - v12Z * v13Y;
			n123Y = v12Z * v13X - v12X * v13Z;
			n123Z = v12X * v13Y - v12Y * v13X;
			n134X = v13Y * v14Z - v13Z * v14Y;
			n134Y = v13Z * v14X - v13X * v14Z;
			n134Z = v13X * v14Y - v13Y * v14X;
			n142X = v14Y * v12Z - v14Z * v12Y;
			n142Y = v14Z * v12X - v14X * v12Z;
			n142Z = v14X * v12Y - v14Y * v12X;
			n243X = v24Y * v23Z - v24Z * v23Y;
			n243Y = v24Z * v23X - v24X * v23Z;
			n243Z = v24X * v23Y - v24Y * v23X;
			var sign = v12X * n243X + v12Y * n243Y + v12Z * n243Z > 0 ? 1 : -1;
			var d123 = v1X * n123X + v1Y * n123Y + v1Z * n123Z;
			var d134 = v1X * n134X + v1Y * n134Y + v1Z * n134Z;
			var d142 = v1X * n142X + v1Y * n142Y + v1Z * n142Z;
			var d243 = v2X * n243X + v2Y * n243Y + v2Z * n243Z;
			var mind = -1;
			var minv;
			var minvX;
			var minvY;
			var minvZ;
			var mini = 0;
			minvX = 0;
			minvY = 0;
			minvZ = 0;
			if (d123 * sign < 0) {
				var v11;
				var v1X1;
				var v1Y1;
				var v1Z1;
				var v21;
				var v2X1;
				var v2Y1;
				var v2Z1;
				var v31;
				var v3X1;
				var v3Y1;
				var v3Z1;
				var v121;
				var v12X1;
				var v12Y1;
				var v12Z1;
				var v231;
				var v23X1;
				var v23Y1;
				var v23Z1;
				var v311;
				var v31X;
				var v31Y;
				var v31Z;
				var v8 = vec1;
				v1X1 = v8[0];
				v1Y1 = v8[1];
				v1Z1 = v8[2];
				var v9 = vec2;
				v2X1 = v9[0];
				v2Y1 = v9[1];
				v2Z1 = v9[2];
				var v10 = vec3;
				v3X1 = v10[0];
				v3Y1 = v10[1];
				v3Z1 = v10[2];
				v12X1 = v2X1 - v1X1;
				v12Y1 = v2Y1 - v1Y1;
				v12Z1 = v2Z1 - v1Z1;
				v23X1 = v3X1 - v2X1;
				v23Y1 = v3Y1 - v2Y1;
				v23Z1 = v3Z1 - v2Z1;
				v31X = v1X1 - v3X1;
				v31Y = v1Y1 - v3Y1;
				v31Z = v1Z1 - v3Z1;
				var n1;
				var nX1;
				var nY1;
				var nZ1;
				nX1 = v12Y1 * v23Z1 - v12Z1 * v23Y1;
				nY1 = v12Z1 * v23X1 - v12X1 * v23Z1;
				nZ1 = v12X1 * v23Y1 - v12Y1 * v23X1;
				var n12;
				var n12X;
				var n12Y;
				var n12Z;
				var n23;
				var n23X;
				var n23Y;
				var n23Z;
				var n31;
				var n31X;
				var n31Y;
				var n31Z;
				n12X = v12Y1 * nZ1 - v12Z1 * nY1;
				n12Y = v12Z1 * nX1 - v12X1 * nZ1;
				n12Z = v12X1 * nY1 - v12Y1 * nX1;
				n23X = v23Y1 * nZ1 - v23Z1 * nY1;
				n23Y = v23Z1 * nX1 - v23X1 * nZ1;
				n23Z = v23X1 * nY1 - v23Y1 * nX1;
				n31X = v31Y * nZ1 - v31Z * nY1;
				n31Y = v31Z * nX1 - v31X * nZ1;
				n31Z = v31X * nY1 - v31Y * nX1;
				var d12 = v1X1 * n12X + v1Y1 * n12Y + v1Z1 * n12Z;
				var d23 = v2X1 * n23X + v2Y1 * n23Y + v2Z1 * n23Z;
				var d31 = v3X1 * n31X + v3Y1 * n31Y + v3Z1 * n31Z;
				var mind1 = -1;
				var minv1;
				var minvX1;
				var minvY1;
				var minvZ1;
				var mini1 = 0;
				minvX1 = 0;
				minvY1 = 0;
				minvZ1 = 0;
				if (d12 < 0) {
					var v15;
					var v1X2;
					var v1Y2;
					var v1Z2;
					var v22;
					var v2X2;
					var v2Y2;
					var v2Z2;
					var v16 = vec1;
					v1X2 = v16[0];
					v1Y2 = v16[1];
					v1Z2 = v16[2];
					var v17 = vec2;
					v2X2 = v17[0];
					v2Y2 = v17[1];
					v2Z2 = v17[2];
					var v122;
					var v12X2;
					var v12Y2;
					var v12Z2;
					v12X2 = v2X2 - v1X2;
					v12Y2 = v2Y2 - v1Y2;
					v12Z2 = v2Z2 - v1Z2;
					var d = v12X2 * v12X2 + v12Y2 * v12Y2 + v12Z2 * v12Z2;
					var t = v12X2 * v1X2 + v12Y2 * v1Y2 + v12Z2 * v1Z2;
					t = -t / d;
					var b;
					if (t < 0) {
						var v18 = out;
						v18[0] = v1X2;
						v18[1] = v1Y2;
						v18[2] = v1Z2;
						b = 1;
					} else if (t > 1) {
						var v19 = out;
						v19[0] = v2X2;
						v19[1] = v2Y2;
						v19[2] = v2Z2;
						b = 2;
					} else {
						var p;
						var pX;
						var pY;
						var pZ;
						pX = v1X2 + v12X2 * t;
						pY = v1Y2 + v12Y2 * t;
						pZ = v1Z2 + v12Z2 * t;
						var v20 = out;
						v20[0] = pX;
						v20[1] = pY;
						v20[2] = pZ;
						b = 3;
					}
					var d1 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
					mini1 = b;
					mind1 = d1;
					var v25 = out;
					minvX1 = v25[0];
					minvY1 = v25[1];
					minvZ1 = v25[2];
				}
				if (d23 < 0) {
					var v110;
					var v1X3;
					var v1Y3;
					var v1Z3;
					var v26;
					var v2X3;
					var v2Y3;
					var v2Z3;
					var v27 = vec2;
					v1X3 = v27[0];
					v1Y3 = v27[1];
					v1Z3 = v27[2];
					var v28 = vec3;
					v2X3 = v28[0];
					v2Y3 = v28[1];
					v2Z3 = v28[2];
					var v123;
					var v12X3;
					var v12Y3;
					var v12Z3;
					v12X3 = v2X3 - v1X3;
					v12Y3 = v2Y3 - v1Y3;
					v12Z3 = v2Z3 - v1Z3;
					var d2 = v12X3 * v12X3 + v12Y3 * v12Y3 + v12Z3 * v12Z3;
					var t1 = v12X3 * v1X3 + v12Y3 * v1Y3 + v12Z3 * v1Z3;
					t1 = -t1 / d2;
					var b1;
					if (t1 < 0) {
						var v29 = out;
						v29[0] = v1X3;
						v29[1] = v1Y3;
						v29[2] = v1Z3;
						b1 = 1;
					} else if (t1 > 1) {
						var v30 = out;
						v30[0] = v2X3;
						v30[1] = v2Y3;
						v30[2] = v2Z3;
						b1 = 2;
					} else {
						var p1;
						var pX1;
						var pY1;
						var pZ1;
						pX1 = v1X3 + v12X3 * t1;
						pY1 = v1Y3 + v12Y3 * t1;
						pZ1 = v1Z3 + v12Z3 * t1;
						var v32 = out;
						v32[0] = pX1;
						v32[1] = pY1;
						v32[2] = pZ1;
						b1 = 3;
					}
					var d3 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
					if (mind1 < 0 || d3 < mind1) {
						mini1 = b1 << 1;
						mind1 = d3;
						var v33 = out;
						minvX1 = v33[0];
						minvY1 = v33[1];
						minvZ1 = v33[2];
					}
				}
				if (d31 < 0) {
					var v111;
					var v1X4;
					var v1Y4;
					var v1Z4;
					var v210;
					var v2X4;
					var v2Y4;
					var v2Z4;
					var v35 = vec1;
					v1X4 = v35[0];
					v1Y4 = v35[1];
					v1Z4 = v35[2];
					var v36 = vec3;
					v2X4 = v36[0];
					v2Y4 = v36[1];
					v2Z4 = v36[2];
					var v124;
					var v12X4;
					var v12Y4;
					var v12Z4;
					v12X4 = v2X4 - v1X4;
					v12Y4 = v2Y4 - v1Y4;
					v12Z4 = v2Z4 - v1Z4;
					var d4 = v12X4 * v12X4 + v12Y4 * v12Y4 + v12Z4 * v12Z4;
					var t2 = v12X4 * v1X4 + v12Y4 * v1Y4 + v12Z4 * v1Z4;
					t2 = -t2 / d4;
					var b2;
					if (t2 < 0) {
						var v37 = out;
						v37[0] = v1X4;
						v37[1] = v1Y4;
						v37[2] = v1Z4;
						b2 = 1;
					} else if (t2 > 1) {
						var v38 = out;
						v38[0] = v2X4;
						v38[1] = v2Y4;
						v38[2] = v2Z4;
						b2 = 2;
					} else {
						var p2;
						var pX2;
						var pY2;
						var pZ2;
						pX2 = v1X4 + v12X4 * t2;
						pY2 = v1Y4 + v12Y4 * t2;
						pZ2 = v1Z4 + v12Z4 * t2;
						var v39 = out;
						v39[0] = pX2;
						v39[1] = pY2;
						v39[2] = pZ2;
						b2 = 3;
					}
					var d5 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
					if (mind1 < 0 || d5 < mind1) {
						mini1 = b2 & 1 | (b2 & 2) << 1;
						mind1 = d5;
						var v40 = out;
						minvX1 = v40[0];
						minvY1 = v40[1];
						minvZ1 = v40[2];
					}
				}
				var b3;
				if (mind1 > 0) {
					var v41 = out;
					v41[0] = minvX1;
					v41[1] = minvY1;
					v41[2] = minvZ1;
					b3 = mini1;
				} else {
					var l = nX1 * nX1 + nY1 * nY1 + nZ1 * nZ1;
					if (l > 0) {
						l = 1 / Math.sqrt(l);
					}
					nX1 *= l;
					nY1 *= l;
					nZ1 *= l;
					var dn = v1X1 * nX1 + v1Y1 * nY1 + v1Z1 * nZ1;
					var l2 = nX1 * nX1 + nY1 * nY1 + nZ1 * nZ1;
					l2 = dn / l2;
					minvX1 = nX1 * l2;
					minvY1 = nY1 * l2;
					minvZ1 = nZ1 * l2;
					var v42 = out;
					v42[0] = minvX1;
					v42[1] = minvY1;
					v42[2] = minvZ1;
					b3 = 7;
				}
				var d6 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
				mini = b3;
				mind = d6;
				var v43 = out;
				minvX = v43[0];
				minvY = v43[1];
				minvZ = v43[2];
			}
			if (d134 * sign < 0) {
				var v112;
				var v1X5;
				var v1Y5;
				var v1Z5;
				var v211;
				var v2X5;
				var v2Y5;
				var v2Z5;
				var v310;
				var v3X2;
				var v3Y2;
				var v3Z2;
				var v125;
				var v12X5;
				var v12Y5;
				var v12Z5;
				var v232;
				var v23X2;
				var v23Y2;
				var v23Z2;
				var v312;
				var v31X1;
				var v31Y1;
				var v31Z1;
				var v44 = vec1;
				v1X5 = v44[0];
				v1Y5 = v44[1];
				v1Z5 = v44[2];
				var v45 = vec3;
				v2X5 = v45[0];
				v2Y5 = v45[1];
				v2Z5 = v45[2];
				var v46 = vec4;
				v3X2 = v46[0];
				v3Y2 = v46[1];
				v3Z2 = v46[2];
				v12X5 = v2X5 - v1X5;
				v12Y5 = v2Y5 - v1Y5;
				v12Z5 = v2Z5 - v1Z5;
				v23X2 = v3X2 - v2X5;
				v23Y2 = v3Y2 - v2Y5;
				v23Z2 = v3Z2 - v2Z5;
				v31X1 = v1X5 - v3X2;
				v31Y1 = v1Y5 - v3Y2;
				v31Z1 = v1Z5 - v3Z2;
				var n2;
				var nX2;
				var nY2;
				var nZ2;
				nX2 = v12Y5 * v23Z2 - v12Z5 * v23Y2;
				nY2 = v12Z5 * v23X2 - v12X5 * v23Z2;
				nZ2 = v12X5 * v23Y2 - v12Y5 * v23X2;
				var n121;
				var n12X1;
				var n12Y1;
				var n12Z1;
				var n231;
				var n23X1;
				var n23Y1;
				var n23Z1;
				var n311;
				var n31X1;
				var n31Y1;
				var n31Z1;
				n12X1 = v12Y5 * nZ2 - v12Z5 * nY2;
				n12Y1 = v12Z5 * nX2 - v12X5 * nZ2;
				n12Z1 = v12X5 * nY2 - v12Y5 * nX2;
				n23X1 = v23Y2 * nZ2 - v23Z2 * nY2;
				n23Y1 = v23Z2 * nX2 - v23X2 * nZ2;
				n23Z1 = v23X2 * nY2 - v23Y2 * nX2;
				n31X1 = v31Y1 * nZ2 - v31Z1 * nY2;
				n31Y1 = v31Z1 * nX2 - v31X1 * nZ2;
				n31Z1 = v31X1 * nY2 - v31Y1 * nX2;
				var d121 = v1X5 * n12X1 + v1Y5 * n12Y1 + v1Z5 * n12Z1;
				var d231 = v2X5 * n23X1 + v2Y5 * n23Y1 + v2Z5 * n23Z1;
				var d311 = v3X2 * n31X1 + v3Y2 * n31Y1 + v3Z2 * n31Z1;
				var mind2 = -1;
				var minv2;
				var minvX2;
				var minvY2;
				var minvZ2;
				var mini2 = 0;
				minvX2 = 0;
				minvY2 = 0;
				minvZ2 = 0;
				if (d121 < 0) {
					var v113;
					var v1X6;
					var v1Y6;
					var v1Z6;
					var v212;
					var v2X6;
					var v2Y6;
					var v2Z6;
					var v47 = vec1;
					v1X6 = v47[0];
					v1Y6 = v47[1];
					v1Z6 = v47[2];
					var v48 = vec3;
					v2X6 = v48[0];
					v2Y6 = v48[1];
					v2Z6 = v48[2];
					var v126;
					var v12X6;
					var v12Y6;
					var v12Z6;
					v12X6 = v2X6 - v1X6;
					v12Y6 = v2Y6 - v1Y6;
					v12Z6 = v2Z6 - v1Z6;
					var d7 = v12X6 * v12X6 + v12Y6 * v12Y6 + v12Z6 * v12Z6;
					var t3 = v12X6 * v1X6 + v12Y6 * v1Y6 + v12Z6 * v1Z6;
					t3 = -t3 / d7;
					var b4;
					if (t3 < 0) {
						var v49 = out;
						v49[0] = v1X6;
						v49[1] = v1Y6;
						v49[2] = v1Z6;
						b4 = 1;
					} else if (t3 > 1) {
						var v50 = out;
						v50[0] = v2X6;
						v50[1] = v2Y6;
						v50[2] = v2Z6;
						b4 = 2;
					} else {
						var p3;
						var pX3;
						var pY3;
						var pZ3;
						pX3 = v1X6 + v12X6 * t3;
						pY3 = v1Y6 + v12Y6 * t3;
						pZ3 = v1Z6 + v12Z6 * t3;
						var v51 = out;
						v51[0] = pX3;
						v51[1] = pY3;
						v51[2] = pZ3;
						b4 = 3;
					}
					var d8 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
					mini2 = b4;
					mind2 = d8;
					var v52 = out;
					minvX2 = v52[0];
					minvY2 = v52[1];
					minvZ2 = v52[2];
				}
				if (d231 < 0) {
					var v114;
					var v1X7;
					var v1Y7;
					var v1Z7;
					var v213;
					var v2X7;
					var v2Y7;
					var v2Z7;
					var v53 = vec3;
					v1X7 = v53[0];
					v1Y7 = v53[1];
					v1Z7 = v53[2];
					var v54 = vec4;
					v2X7 = v54[0];
					v2Y7 = v54[1];
					v2Z7 = v54[2];
					var v127;
					var v12X7;
					var v12Y7;
					var v12Z7;
					v12X7 = v2X7 - v1X7;
					v12Y7 = v2Y7 - v1Y7;
					v12Z7 = v2Z7 - v1Z7;
					var d9 = v12X7 * v12X7 + v12Y7 * v12Y7 + v12Z7 * v12Z7;
					var t4 = v12X7 * v1X7 + v12Y7 * v1Y7 + v12Z7 * v1Z7;
					t4 = -t4 / d9;
					var b5;
					if (t4 < 0) {
						var v55 = out;
						v55[0] = v1X7;
						v55[1] = v1Y7;
						v55[2] = v1Z7;
						b5 = 1;
					} else if (t4 > 1) {
						var v56 = out;
						v56[0] = v2X7;
						v56[1] = v2Y7;
						v56[2] = v2Z7;
						b5 = 2;
					} else {
						var p4;
						var pX4;
						var pY4;
						var pZ4;
						pX4 = v1X7 + v12X7 * t4;
						pY4 = v1Y7 + v12Y7 * t4;
						pZ4 = v1Z7 + v12Z7 * t4;
						var v57 = out;
						v57[0] = pX4;
						v57[1] = pY4;
						v57[2] = pZ4;
						b5 = 3;
					}
					var d10 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
					if (mind2 < 0 || d10 < mind2) {
						mini2 = b5 << 1;
						mind2 = d10;
						var v58 = out;
						minvX2 = v58[0];
						minvY2 = v58[1];
						minvZ2 = v58[2];
					}
				}
				if (d311 < 0) {
					var v115;
					var v1X8;
					var v1Y8;
					var v1Z8;
					var v214;
					var v2X8;
					var v2Y8;
					var v2Z8;
					var v59 = vec1;
					v1X8 = v59[0];
					v1Y8 = v59[1];
					v1Z8 = v59[2];
					var v60 = vec4;
					v2X8 = v60[0];
					v2Y8 = v60[1];
					v2Z8 = v60[2];
					var v128;
					var v12X8;
					var v12Y8;
					var v12Z8;
					v12X8 = v2X8 - v1X8;
					v12Y8 = v2Y8 - v1Y8;
					v12Z8 = v2Z8 - v1Z8;
					var d11 = v12X8 * v12X8 + v12Y8 * v12Y8 + v12Z8 * v12Z8;
					var t5 = v12X8 * v1X8 + v12Y8 * v1Y8 + v12Z8 * v1Z8;
					t5 = -t5 / d11;
					var b6;
					if (t5 < 0) {
						var v61 = out;
						v61[0] = v1X8;
						v61[1] = v1Y8;
						v61[2] = v1Z8;
						b6 = 1;
					} else if (t5 > 1) {
						var v62 = out;
						v62[0] = v2X8;
						v62[1] = v2Y8;
						v62[2] = v2Z8;
						b6 = 2;
					} else {
						var p5;
						var pX5;
						var pY5;
						var pZ5;
						pX5 = v1X8 + v12X8 * t5;
						pY5 = v1Y8 + v12Y8 * t5;
						pZ5 = v1Z8 + v12Z8 * t5;
						var v63 = out;
						v63[0] = pX5;
						v63[1] = pY5;
						v63[2] = pZ5;
						b6 = 3;
					}
					var d13 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
					if (mind2 < 0 || d13 < mind2) {
						mini2 = b6 & 1 | (b6 & 2) << 1;
						mind2 = d13;
						var v64 = out;
						minvX2 = v64[0];
						minvY2 = v64[1];
						minvZ2 = v64[2];
					}
				}
				var b7;
				if (mind2 > 0) {
					var v65 = out;
					v65[0] = minvX2;
					v65[1] = minvY2;
					v65[2] = minvZ2;
					b7 = mini2;
				} else {
					var l1 = nX2 * nX2 + nY2 * nY2 + nZ2 * nZ2;
					if (l1 > 0) {
						l1 = 1 / Math.sqrt(l1);
					}
					nX2 *= l1;
					nY2 *= l1;
					nZ2 *= l1;
					var dn1 = v1X5 * nX2 + v1Y5 * nY2 + v1Z5 * nZ2;
					var l21 = nX2 * nX2 + nY2 * nY2 + nZ2 * nZ2;
					l21 = dn1 / l21;
					minvX2 = nX2 * l21;
					minvY2 = nY2 * l21;
					minvZ2 = nZ2 * l21;
					var v66 = out;
					v66[0] = minvX2;
					v66[1] = minvY2;
					v66[2] = minvZ2;
					b7 = 7;
				}
				var d14 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
				if (mind < 0 || d14 < mind) {
					mini = b7 & 1 | (b7 & 6) << 1;
					mind = d14;
					var v67 = out;
					minvX = v67[0];
					minvY = v67[1];
					minvZ = v67[2];
				}
			}
			if (d142 * sign < 0) {
				var v116;
				var v1X9;
				var v1Y9;
				var v1Z9;
				var v215;
				var v2X9;
				var v2Y9;
				var v2Z9;
				var v313;
				var v3X3;
				var v3Y3;
				var v3Z3;
				var v129;
				var v12X9;
				var v12Y9;
				var v12Z9;
				var v233;
				var v23X3;
				var v23Y3;
				var v23Z3;
				var v314;
				var v31X2;
				var v31Y2;
				var v31Z2;
				var v68 = vec1;
				v1X9 = v68[0];
				v1Y9 = v68[1];
				v1Z9 = v68[2];
				var v69 = vec2;
				v2X9 = v69[0];
				v2Y9 = v69[1];
				v2Z9 = v69[2];
				var v70 = vec4;
				v3X3 = v70[0];
				v3Y3 = v70[1];
				v3Z3 = v70[2];
				v12X9 = v2X9 - v1X9;
				v12Y9 = v2Y9 - v1Y9;
				v12Z9 = v2Z9 - v1Z9;
				v23X3 = v3X3 - v2X9;
				v23Y3 = v3Y3 - v2Y9;
				v23Z3 = v3Z3 - v2Z9;
				v31X2 = v1X9 - v3X3;
				v31Y2 = v1Y9 - v3Y3;
				v31Z2 = v1Z9 - v3Z3;
				var n3;
				var nX3;
				var nY3;
				var nZ3;
				nX3 = v12Y9 * v23Z3 - v12Z9 * v23Y3;
				nY3 = v12Z9 * v23X3 - v12X9 * v23Z3;
				nZ3 = v12X9 * v23Y3 - v12Y9 * v23X3;
				var n122;
				var n12X2;
				var n12Y2;
				var n12Z2;
				var n232;
				var n23X2;
				var n23Y2;
				var n23Z2;
				var n312;
				var n31X2;
				var n31Y2;
				var n31Z2;
				n12X2 = v12Y9 * nZ3 - v12Z9 * nY3;
				n12Y2 = v12Z9 * nX3 - v12X9 * nZ3;
				n12Z2 = v12X9 * nY3 - v12Y9 * nX3;
				n23X2 = v23Y3 * nZ3 - v23Z3 * nY3;
				n23Y2 = v23Z3 * nX3 - v23X3 * nZ3;
				n23Z2 = v23X3 * nY3 - v23Y3 * nX3;
				n31X2 = v31Y2 * nZ3 - v31Z2 * nY3;
				n31Y2 = v31Z2 * nX3 - v31X2 * nZ3;
				n31Z2 = v31X2 * nY3 - v31Y2 * nX3;
				var d122 = v1X9 * n12X2 + v1Y9 * n12Y2 + v1Z9 * n12Z2;
				var d232 = v2X9 * n23X2 + v2Y9 * n23Y2 + v2Z9 * n23Z2;
				var d312 = v3X3 * n31X2 + v3Y3 * n31Y2 + v3Z3 * n31Z2;
				var mind3 = -1;
				var minv3;
				var minvX3;
				var minvY3;
				var minvZ3;
				var mini3 = 0;
				minvX3 = 0;
				minvY3 = 0;
				minvZ3 = 0;
				if (d122 < 0) {
					var v117;
					var v1X10;
					var v1Y10;
					var v1Z10;
					var v216;
					var v2X10;
					var v2Y10;
					var v2Z10;
					var v71 = vec1;
					v1X10 = v71[0];
					v1Y10 = v71[1];
					v1Z10 = v71[2];
					var v72 = vec2;
					v2X10 = v72[0];
					v2Y10 = v72[1];
					v2Z10 = v72[2];
					var v1210;
					var v12X10;
					var v12Y10;
					var v12Z10;
					v12X10 = v2X10 - v1X10;
					v12Y10 = v2Y10 - v1Y10;
					v12Z10 = v2Z10 - v1Z10;
					var d15 = v12X10 * v12X10 + v12Y10 * v12Y10 + v12Z10 * v12Z10;
					var t6 = v12X10 * v1X10 + v12Y10 * v1Y10 + v12Z10 * v1Z10;
					t6 = -t6 / d15;
					var b8;
					if (t6 < 0) {
						var v73 = out;
						v73[0] = v1X10;
						v73[1] = v1Y10;
						v73[2] = v1Z10;
						b8 = 1;
					} else if (t6 > 1) {
						var v74 = out;
						v74[0] = v2X10;
						v74[1] = v2Y10;
						v74[2] = v2Z10;
						b8 = 2;
					} else {
						var p6;
						var pX6;
						var pY6;
						var pZ6;
						pX6 = v1X10 + v12X10 * t6;
						pY6 = v1Y10 + v12Y10 * t6;
						pZ6 = v1Z10 + v12Z10 * t6;
						var v75 = out;
						v75[0] = pX6;
						v75[1] = pY6;
						v75[2] = pZ6;
						b8 = 3;
					}
					var d16 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
					mini3 = b8;
					mind3 = d16;
					var v76 = out;
					minvX3 = v76[0];
					minvY3 = v76[1];
					minvZ3 = v76[2];
				}
				if (d232 < 0) {
					var v118;
					var v1X11;
					var v1Y11;
					var v1Z11;
					var v217;
					var v2X11;
					var v2Y11;
					var v2Z11;
					var v77 = vec2;
					v1X11 = v77[0];
					v1Y11 = v77[1];
					v1Z11 = v77[2];
					var v78 = vec4;
					v2X11 = v78[0];
					v2Y11 = v78[1];
					v2Z11 = v78[2];
					var v1211;
					var v12X11;
					var v12Y11;
					var v12Z11;
					v12X11 = v2X11 - v1X11;
					v12Y11 = v2Y11 - v1Y11;
					v12Z11 = v2Z11 - v1Z11;
					var d17 = v12X11 * v12X11 + v12Y11 * v12Y11 + v12Z11 * v12Z11;
					var t7 = v12X11 * v1X11 + v12Y11 * v1Y11 + v12Z11 * v1Z11;
					t7 = -t7 / d17;
					var b9;
					if (t7 < 0) {
						var v79 = out;
						v79[0] = v1X11;
						v79[1] = v1Y11;
						v79[2] = v1Z11;
						b9 = 1;
					} else if (t7 > 1) {
						var v80 = out;
						v80[0] = v2X11;
						v80[1] = v2Y11;
						v80[2] = v2Z11;
						b9 = 2;
					} else {
						var p7;
						var pX7;
						var pY7;
						var pZ7;
						pX7 = v1X11 + v12X11 * t7;
						pY7 = v1Y11 + v12Y11 * t7;
						pZ7 = v1Z11 + v12Z11 * t7;
						var v81 = out;
						v81[0] = pX7;
						v81[1] = pY7;
						v81[2] = pZ7;
						b9 = 3;
					}
					var d18 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
					if (mind3 < 0 || d18 < mind3) {
						mini3 = b9 << 1;
						mind3 = d18;
						var v82 = out;
						minvX3 = v82[0];
						minvY3 = v82[1];
						minvZ3 = v82[2];
					}
				}
				if (d312 < 0) {
					var v119;
					var v1X12;
					var v1Y12;
					var v1Z12;
					var v218;
					var v2X12;
					var v2Y12;
					var v2Z12;
					var v83 = vec1;
					v1X12 = v83[0];
					v1Y12 = v83[1];
					v1Z12 = v83[2];
					var v84 = vec4;
					v2X12 = v84[0];
					v2Y12 = v84[1];
					v2Z12 = v84[2];
					var v1212;
					var v12X12;
					var v12Y12;
					var v12Z12;
					v12X12 = v2X12 - v1X12;
					v12Y12 = v2Y12 - v1Y12;
					v12Z12 = v2Z12 - v1Z12;
					var d19 = v12X12 * v12X12 + v12Y12 * v12Y12 + v12Z12 * v12Z12;
					var t8 = v12X12 * v1X12 + v12Y12 * v1Y12 + v12Z12 * v1Z12;
					t8 = -t8 / d19;
					var b10;
					if (t8 < 0) {
						var v85 = out;
						v85[0] = v1X12;
						v85[1] = v1Y12;
						v85[2] = v1Z12;
						b10 = 1;
					} else if (t8 > 1) {
						var v86 = out;
						v86[0] = v2X12;
						v86[1] = v2Y12;
						v86[2] = v2Z12;
						b10 = 2;
					} else {
						var p8;
						var pX8;
						var pY8;
						var pZ8;
						pX8 = v1X12 + v12X12 * t8;
						pY8 = v1Y12 + v12Y12 * t8;
						pZ8 = v1Z12 + v12Z12 * t8;
						var v87 = out;
						v87[0] = pX8;
						v87[1] = pY8;
						v87[2] = pZ8;
						b10 = 3;
					}
					var d20 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
					if (mind3 < 0 || d20 < mind3) {
						mini3 = b10 & 1 | (b10 & 2) << 1;
						mind3 = d20;
						var v88 = out;
						minvX3 = v88[0];
						minvY3 = v88[1];
						minvZ3 = v88[2];
					}
				}
				var b11;
				if (mind3 > 0) {
					var v89 = out;
					v89[0] = minvX3;
					v89[1] = minvY3;
					v89[2] = minvZ3;
					b11 = mini3;
				} else {
					var l3 = nX3 * nX3 + nY3 * nY3 + nZ3 * nZ3;
					if (l3 > 0) {
						l3 = 1 / Math.sqrt(l3);
					}
					nX3 *= l3;
					nY3 *= l3;
					nZ3 *= l3;
					var dn2 = v1X9 * nX3 + v1Y9 * nY3 + v1Z9 * nZ3;
					var l22 = nX3 * nX3 + nY3 * nY3 + nZ3 * nZ3;
					l22 = dn2 / l22;
					minvX3 = nX3 * l22;
					minvY3 = nY3 * l22;
					minvZ3 = nZ3 * l22;
					var v90 = out;
					v90[0] = minvX3;
					v90[1] = minvY3;
					v90[2] = minvZ3;
					b11 = 7;
				}
				var d21 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
				if (mind < 0 || d21 < mind) {
					mini = b11 & 3 | (b11 & 4) << 1;
					mind = d21;
					var v91 = out;
					minvX = v91[0];
					minvY = v91[1];
					minvZ = v91[2];
				}
			}
			if (d243 * sign < 0) {
				var v120;
				var v1X13;
				var v1Y13;
				var v1Z13;
				var v219;
				var v2X13;
				var v2Y13;
				var v2Z13;
				var v315;
				var v3X4;
				var v3Y4;
				var v3Z4;
				var v1213;
				var v12X13;
				var v12Y13;
				var v12Z13;
				var v234;
				var v23X4;
				var v23Y4;
				var v23Z4;
				var v316;
				var v31X3;
				var v31Y3;
				var v31Z3;
				var v92 = vec2;
				v1X13 = v92[0];
				v1Y13 = v92[1];
				v1Z13 = v92[2];
				var v93 = vec3;
				v2X13 = v93[0];
				v2Y13 = v93[1];
				v2Z13 = v93[2];
				var v94 = vec4;
				v3X4 = v94[0];
				v3Y4 = v94[1];
				v3Z4 = v94[2];
				v12X13 = v2X13 - v1X13;
				v12Y13 = v2Y13 - v1Y13;
				v12Z13 = v2Z13 - v1Z13;
				v23X4 = v3X4 - v2X13;
				v23Y4 = v3Y4 - v2Y13;
				v23Z4 = v3Z4 - v2Z13;
				v31X3 = v1X13 - v3X4;
				v31Y3 = v1Y13 - v3Y4;
				v31Z3 = v1Z13 - v3Z4;
				var n4;
				var nX4;
				var nY4;
				var nZ4;
				nX4 = v12Y13 * v23Z4 - v12Z13 * v23Y4;
				nY4 = v12Z13 * v23X4 - v12X13 * v23Z4;
				nZ4 = v12X13 * v23Y4 - v12Y13 * v23X4;
				var n124;
				var n12X3;
				var n12Y3;
				var n12Z3;
				var n233;
				var n23X3;
				var n23Y3;
				var n23Z3;
				var n313;
				var n31X3;
				var n31Y3;
				var n31Z3;
				n12X3 = v12Y13 * nZ4 - v12Z13 * nY4;
				n12Y3 = v12Z13 * nX4 - v12X13 * nZ4;
				n12Z3 = v12X13 * nY4 - v12Y13 * nX4;
				n23X3 = v23Y4 * nZ4 - v23Z4 * nY4;
				n23Y3 = v23Z4 * nX4 - v23X4 * nZ4;
				n23Z3 = v23X4 * nY4 - v23Y4 * nX4;
				n31X3 = v31Y3 * nZ4 - v31Z3 * nY4;
				n31Y3 = v31Z3 * nX4 - v31X3 * nZ4;
				n31Z3 = v31X3 * nY4 - v31Y3 * nX4;
				var d124 = v1X13 * n12X3 + v1Y13 * n12Y3 + v1Z13 * n12Z3;
				var d233 = v2X13 * n23X3 + v2Y13 * n23Y3 + v2Z13 * n23Z3;
				var d313 = v3X4 * n31X3 + v3Y4 * n31Y3 + v3Z4 * n31Z3;
				var mind4 = -1;
				var minv4;
				var minvX4;
				var minvY4;
				var minvZ4;
				var mini4 = 0;
				minvX4 = 0;
				minvY4 = 0;
				minvZ4 = 0;
				if (d124 < 0) {
					var v130;
					var v1X14;
					var v1Y14;
					var v1Z14;
					var v220;
					var v2X14;
					var v2Y14;
					var v2Z14;
					var v95 = vec2;
					v1X14 = v95[0];
					v1Y14 = v95[1];
					v1Z14 = v95[2];
					var v96 = vec3;
					v2X14 = v96[0];
					v2Y14 = v96[1];
					v2Z14 = v96[2];
					var v1214;
					var v12X14;
					var v12Y14;
					var v12Z14;
					v12X14 = v2X14 - v1X14;
					v12Y14 = v2Y14 - v1Y14;
					v12Z14 = v2Z14 - v1Z14;
					var d22 = v12X14 * v12X14 + v12Y14 * v12Y14 + v12Z14 * v12Z14;
					var t9 = v12X14 * v1X14 + v12Y14 * v1Y14 + v12Z14 * v1Z14;
					t9 = -t9 / d22;
					var b12;
					if (t9 < 0) {
						var v97 = out;
						v97[0] = v1X14;
						v97[1] = v1Y14;
						v97[2] = v1Z14;
						b12 = 1;
					} else if (t9 > 1) {
						var v98 = out;
						v98[0] = v2X14;
						v98[1] = v2Y14;
						v98[2] = v2Z14;
						b12 = 2;
					} else {
						var p9;
						var pX9;
						var pY9;
						var pZ9;
						pX9 = v1X14 + v12X14 * t9;
						pY9 = v1Y14 + v12Y14 * t9;
						pZ9 = v1Z14 + v12Z14 * t9;
						var v99 = out;
						v99[0] = pX9;
						v99[1] = pY9;
						v99[2] = pZ9;
						b12 = 3;
					}
					var d24 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
					mini4 = b12;
					mind4 = d24;
					var v100 = out;
					minvX4 = v100[0];
					minvY4 = v100[1];
					minvZ4 = v100[2];
				}
				if (d233 < 0) {
					var v131;
					var v1X15;
					var v1Y15;
					var v1Z15;
					var v221;
					var v2X15;
					var v2Y15;
					var v2Z15;
					var v101 = vec3;
					v1X15 = v101[0];
					v1Y15 = v101[1];
					v1Z15 = v101[2];
					var v102 = vec4;
					v2X15 = v102[0];
					v2Y15 = v102[1];
					v2Z15 = v102[2];
					var v1215;
					var v12X15;
					var v12Y15;
					var v12Z15;
					v12X15 = v2X15 - v1X15;
					v12Y15 = v2Y15 - v1Y15;
					v12Z15 = v2Z15 - v1Z15;
					var d25 = v12X15 * v12X15 + v12Y15 * v12Y15 + v12Z15 * v12Z15;
					var t10 = v12X15 * v1X15 + v12Y15 * v1Y15 + v12Z15 * v1Z15;
					t10 = -t10 / d25;
					var b13;
					if (t10 < 0) {
						var v103 = out;
						v103[0] = v1X15;
						v103[1] = v1Y15;
						v103[2] = v1Z15;
						b13 = 1;
					} else if (t10 > 1) {
						var v104 = out;
						v104[0] = v2X15;
						v104[1] = v2Y15;
						v104[2] = v2Z15;
						b13 = 2;
					} else {
						var p10;
						var pX10;
						var pY10;
						var pZ10;
						pX10 = v1X15 + v12X15 * t10;
						pY10 = v1Y15 + v12Y15 * t10;
						pZ10 = v1Z15 + v12Z15 * t10;
						var v105 = out;
						v105[0] = pX10;
						v105[1] = pY10;
						v105[2] = pZ10;
						b13 = 3;
					}
					var d26 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
					if (mind4 < 0 || d26 < mind4) {
						mini4 = b13 << 1;
						mind4 = d26;
						var v106 = out;
						minvX4 = v106[0];
						minvY4 = v106[1];
						minvZ4 = v106[2];
					}
				}
				if (d313 < 0) {
					var v132;
					var v1X16;
					var v1Y16;
					var v1Z16;
					var v222;
					var v2X16;
					var v2Y16;
					var v2Z16;
					var v107 = vec2;
					v1X16 = v107[0];
					v1Y16 = v107[1];
					v1Z16 = v107[2];
					var v108 = vec4;
					v2X16 = v108[0];
					v2Y16 = v108[1];
					v2Z16 = v108[2];
					var v1216;
					var v12X16;
					var v12Y16;
					var v12Z16;
					v12X16 = v2X16 - v1X16;
					v12Y16 = v2Y16 - v1Y16;
					v12Z16 = v2Z16 - v1Z16;
					var d27 = v12X16 * v12X16 + v12Y16 * v12Y16 + v12Z16 * v12Z16;
					var t11 = v12X16 * v1X16 + v12Y16 * v1Y16 + v12Z16 * v1Z16;
					t11 = -t11 / d27;
					var b14;
					if (t11 < 0) {
						var v109 = out;
						v109[0] = v1X16;
						v109[1] = v1Y16;
						v109[2] = v1Z16;
						b14 = 1;
					} else if (t11 > 1) {
						var v133 = out;
						v133[0] = v2X16;
						v133[1] = v2Y16;
						v133[2] = v2Z16;
						b14 = 2;
					} else {
						var p11;
						var pX11;
						var pY11;
						var pZ11;
						pX11 = v1X16 + v12X16 * t11;
						pY11 = v1Y16 + v12Y16 * t11;
						pZ11 = v1Z16 + v12Z16 * t11;
						var v134 = out;
						v134[0] = pX11;
						v134[1] = pY11;
						v134[2] = pZ11;
						b14 = 3;
					}
					var d28 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
					if (mind4 < 0 || d28 < mind4) {
						mini4 = b14 & 1 | (b14 & 2) << 1;
						mind4 = d28;
						var v135 = out;
						minvX4 = v135[0];
						minvY4 = v135[1];
						minvZ4 = v135[2];
					}
				}
				var b15;
				if (mind4 > 0) {
					var v136 = out;
					v136[0] = minvX4;
					v136[1] = minvY4;
					v136[2] = minvZ4;
					b15 = mini4;
				} else {
					var l4 = nX4 * nX4 + nY4 * nY4 + nZ4 * nZ4;
					if (l4 > 0) {
						l4 = 1 / Math.sqrt(l4);
					}
					nX4 *= l4;
					nY4 *= l4;
					nZ4 *= l4;
					var dn3 = v1X13 * nX4 + v1Y13 * nY4 + v1Z13 * nZ4;
					var l23 = nX4 * nX4 + nY4 * nY4 + nZ4 * nZ4;
					l23 = dn3 / l23;
					minvX4 = nX4 * l23;
					minvY4 = nY4 * l23;
					minvZ4 = nZ4 * l23;
					var v137 = out;
					v137[0] = minvX4;
					v137[1] = minvY4;
					v137[2] = minvZ4;
					b15 = 7;
				}
				var d29 = out[0] * out[0] + out[1] * out[1] + out[2] * out[2];
				if (mind < 0 || d29 < mind) {
					mini = b15 << 1;
					mind = d29;
					var v138 = out;
					minvX = v138[0];
					minvY = v138[1];
					minvZ = v138[2];
				}
			}
			if (mind > 0) {
				var v139 = out;
				v139[0] = minvX;
				v139[1] = minvY;
				v139[2] = minvZ;
				return mini;
			}
			math.vec3_zero$(outmath)
			return 15;
		}
	});



	collision.broadphase.BroadPhaseType = {
		BRUTE_FORCE: 1,
		BVH: 2
	};


	collision.broadphase.bvh.BvhInsertionStrategy = {
		SIMPLE: 0,
		MINIMIZE_SURFACE_AREA: 1
	};

	collision.geometry.GeometryType = {
		SPHERE: 0,
		BOX: 1,
		CYLINDER: 2,
		CONE: 3,
		CAPSULE: 4,
		CONVEX_HULL: 5
	};


	collision.narrowphase.DetectorResult.count = 0;
	collision.narrowphase.DetectorResultPoint.count = 0;

	collision.narrowphase.detector.BoxBoxDetector.EDGE_BIAS_MULT = 1;


	collision.narrowphase.detector.gjkepa.EpaPolyhedronState.OK = 0;

	collision.narrowphase.detector.gjkepa.EpaPolyhedronState = {
		INVALID_TRIANGLE: 1,
		NO_ADJACENT_PAIR_INDEX: 2,
		NO_ADJACENT_TRIANGLE: 3,
		EDGE_LOOP_BROKEN: 4,
		NO_OUTER_TRIANGLE: 5,
		TRIANGLE_INVISIBLE: 6
	};


	collision.narrowphase.detector.gjkepa.EpaTriangle.count = 0;

	collision.narrowphase.detector.gjkepa.GjkEpa.instance = new collision.narrowphase.detector.gjkepa.GjkEpa();



	collision.narrowphase.detector.gjkepa.GjkEpaResultState = {
		SUCCEEDED: 0,
		GJK_FAILED_TO_MAKE_TETRAHEDRON: 1,
		GJK_DID_NOT_CONVERGE: 2,
		EPA_FAILED_TO_INIT: 257,
		EPA_FAILED_TO_ADD_VERTEX: 258,
		EPA_DID_NOT_CONVERGE: 259
	};

	pe.collision = collision;
	
}