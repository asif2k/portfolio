function pe_dynamics(fin, pe,math ) { 
 
	var vec3 = math.vec3, aabb = math.aabb, mat3 = math.mat3, quat = math.quat;
	var dynamics = {	
		callback: {},
		common: {},
		constraint: {
			contact: {},
			info: {
				contact: {},
				joint: {}
			},
			joint: {},
			solver: {
				common: {},
				direct: {},
				pgs: {}
			}
		},
		rigidbody: {}
	};


	var collision = pe.collision;


	
	macro_scope$('math.mat3')
	macro_scope$('math.vec3')


	


	fin.macro$(function transform_mult($this, a$, b$) {
		math.mat3_mult$($this._rotation, b$._rotation, a$._rotation)
		math.vec3_transform_mat3$($this._position, a$._position, b$._rotation)
		math.vec3_add$($this._position, $this._position, b$._position)
	}, pe)


	

	



	dynamics.Contact = pe.define(function (proto) {
		proto._updateManifold = function () {

			
			if (this._detector == null) {
				return;
			}
			var ptouching = this._touching;
			var result = this._detectorResult;
			this._detector.detect(result, this._s1._geom, this._s2._geom, this._s1._transform, this._s2._transform, this._cachedDetectorData);
		//	var num = result.numPoints;
			this._touching = result.numPoints > 0;
			if (this._touching) {
				this._manifold._buildBasis(result.normal);
				if (result.getMaxDepth() > pe.common.Setting.contactUseAlternativePositionCorrectionAlgorithmDepthThreshold) {
					this._contactConstraint._positionCorrectionAlgorithm = pe.common.Setting.alternativeContactPositionCorrectionAlgorithm;
				} else {
					this._contactConstraint._positionCorrectionAlgorithm = pe.common.Setting.defaultContactPositionCorrectionAlgorithm;
				}
				if (result.incremental) {
					this._updater.incrementalUpdate(result, this._b1._transform, this._b2._transform);
				} else {
					this._updater.totalUpdate(result, this._b1._transform, this._b2._transform);
				}
			} else {
				this._manifold._clear();
			}
			return;
			
			if (this._touching && !ptouching) {
				var cc1 = this._s1._contactCallback;
				var cc2 = this._s2._contactCallback;
				if (cc1 == cc2) {
					cc2 = null;
				}
				if (cc1 != null) {
					cc1.beginContact(this);
				}
				if (cc2 != null) {
					cc2.beginContact(this);
				}
			}
			if (!this._touching && ptouching) {
				var cc11 = this._s1._contactCallback;
				var cc21 = this._s2._contactCallback;
				if (cc11 == cc21) {
					cc21 = null;
				}
				if (cc11 != null) {
					cc11.endContact(this);
				}
				if (cc21 != null) {
					cc21.endContact(this);
				}
			}
			if (this._touching) {
				var cc12 = this._s1._contactCallback;
				var cc22 = this._s2._contactCallback;
				if (cc12 == cc22) {
					cc22 = null;
				}
				if (cc12 != null) {
					cc12.preSolve(this);
				}
				if (cc22 != null) {
					cc22.preSolve(this);
				}
			}
		}

		proto._postSolve = function () {
			var cc1 = this._s1._contactCallback;
			var cc2 = this._s2._contactCallback;
			if (cc1 == cc2) {
				cc2 = null;
			}
			if (cc1 != null) {
				cc1.postSolve(this);
			}
			if (cc2 != null) {
				cc2.postSolve(this);
			}
		}

		proto.isTouching = function () {
			return this._touching;
		}

		proto.getContactConstraint = function () {
			return this._contactConstraint;
		}

		proto.getPrev = function () {
			return this._prev;
		}

		proto.getNext = function () {
			return this._next;
		}

		var Contact = function () {
			this._next = null;
			this._prev = null;
			this._link1 = new dynamics.ContactLink();
			this._link2 = new dynamics.ContactLink();
			this._s1 = null;
			this._s2 = null;
			this._b1 = null;
			this._b2 = null;
			this._detector = null;
			this._cachedDetectorData = new collision.narrowphase.detector.CachedDetectorData();
			this._detectorResult = new collision.narrowphase.DetectorResult();
			this._latest = false;
			this._shouldBeSkipped = false;
			this._manifold = new dynamics.constraint.contact.Manifold();
			this._updater = new dynamics.constraint.contact.ManifoldUpdater(this._manifold);
			this._contactConstraint = new dynamics.constraint.contact.ContactConstraint(this._manifold);
			this._touching = false;
			dynamics.Contact.count++;
		}
		return Contact;
	});

	dynamics.ContactLink = pe.define(function (proto) {
		proto.getContact = function () {
			return this._contact;
		}

		proto.getOther = function () {
			return this._other;
		}

		proto.getPrev = function () {
			return this._prev;
		}

		proto.getNext = function () {
			return this._next;
		}

		var ContactLink = function () {
			this._prev = null;
			this._next = null;
			this._contact = null;
			this._other = null;
		}
		return ContactLink;
	});

	dynamics.ContactManager = pe.define(function (proto) {
		proto.createContacts = function () {
			p_pair = this._broadPhase._proxyPairList;
			while (p_pair != null) {
				while (true) {
					if (p_pair._p1._id < p_pair._p2._id) {
						s1 = p_pair._p1.userData;
						s2 = p_pair._p2.userData;
					} else {
						s1 = p_pair._p2.userData;
						s2 = p_pair._p1.userData;
					}
					if (!this.shouldCollide(s1, s2)) {
						break;
					}
					rb1 = s1._rigidBody;
					rb2 = s2._rigidBody;
					if (rb1._numContactLinks < rb2._numContactLinks) {
						list = rb1._contactLinkList;
					} else {
						list = rb2._contactLinkList;
					}

					found = false;
					while (list != null) {
						if (list._contact._s1._id === s1._id && list._contact._s2._id === s2._id) {
							list._contact._latest = true;
							found = true;
							break;
						}
						list = list._next;
					}
					if (!found) {
						cnt = this._contactPool;
						if (cnt != null) {
							this._contactPool = cnt._next;
							cnt._next = null;
						} else {
							cnt = new dynamics.Contact();
						}
						if (this._contactList == null) {
							this._contactList = cnt;
							this._contactListLast = cnt;
						} else {
							this._contactListLast._next = cnt;
							cnt._prev = this._contactListLast;
							this._contactListLast = cnt;
						}
						cnt._latest = true;
						cnt._s1 = s1;
						cnt._s2 = s2;
						cnt._b1 = s1._rigidBody;
						cnt._b2 = s2._rigidBody;
						cnt._touching = false;
						if (cnt._b1._contactLinkList === null) {
							cnt._b1._contactLinkList = cnt._link1;
							cnt._b1._contactLinkListLast = cnt._link1;
						} else {
							cnt._b1._contactLinkListLast._next = cnt._link1;
							cnt._link1._prev = cnt._b1._contactLinkListLast;
							cnt._b1._contactLinkListLast = cnt._link1;
						}
						if (cnt._b2._contactLinkList === null) {
							cnt._b2._contactLinkList = cnt._link2;
							cnt._b2._contactLinkListLast = cnt._link2;
						} else {
							cnt._b2._contactLinkListLast._next = cnt._link2;
							cnt._link2._prev = cnt._b2._contactLinkListLast;
							cnt._b2._contactLinkListLast = cnt._link2;
						}
						cnt._b1._numContactLinks++;
						cnt._b2._numContactLinks++;
						cnt._link1._other = cnt._b2;
						cnt._link2._other = cnt._b1;
						cnt._link1._contact = cnt;
						cnt._link2._contact = cnt;
						cnt._detector = this._collisionMatrix.detectors[s1._geom._type][s2._geom._type];


						cnt = cnt._contactConstraint;
						cnt._s1 = s1;
						cnt._s2 = s2;
						cnt._b1 = cnt._s1._rigidBody;
						cnt._b2 = cnt._s2._rigidBody;
						cnt._tf1 = cnt._b1._transform;
						cnt._tf2 = cnt._b2._transform;
						this._numContacts++;
					}
					break;
				}
				p_pair = p_pair._next;
			}
		}

		proto.destroyContact = function (cnt) {
			if (cnt._prev !== null) {
				cnt._prev._next = cnt._next;
			}
			if (cnt._next !== null) {
				cnt._next._prev = cnt._prev;
			}
			if (cnt == this._contactList) {
				this._contactList = this._contactList._next;
			}
			if (cnt == this._contactListLast) {
				this._contactListLast = this._contactListLast._prev;
			}
			cnt._next = null;
			cnt._prev = null;

			//===============================================
			if (cnt._touching) {
				//send contacts
			}

			if (cnt._link1._prev !== null) {
				cnt._link1._prev._next = cnt._link1._next;
			}
			if (cnt._link1._next != null) {
				cnt._link1._next._prev = cnt._link1._prev;
			}
			if (cnt._link1 === cnt._b1._contactLinkList) {
				cnt._b1._contactLinkList = cnt._b1._contactLinkList._next;
			}
			if (cnt._link1 == cnt._b1._contactLinkListLast) {
				cnt._b1._contactLinkListLast = cnt._b1._contactLinkListLast._prev;
			}
			cnt._link1._next = null;
			cnt._link1._prev = null;

			if (cnt._link2._prev !== null) {
				cnt._link2._prev._next = cnt._link2._next;
			}
			if (cnt._link2._next != null) {
				cnt._link2._next._prev = cnt._link2._prev;
			}
			if (cnt._link2 === cnt._b2._contactLinkList) {
				cnt._b2._contactLinkList = cnt._b2._contactLinkList._next;
			}
			if (cnt._link2 === cnt._b2._contactLinkListLast) {
				cnt._b2._contactLinkListLast = cnt._b2._contactLinkListLast._prev;
			}
			cnt._link2._next = null;
			cnt._link2._prev = null;

			cnt._b1._numContactLinks--;
			cnt._b2._numContactLinks--;
			cnt._link1._other = null;
			cnt._link2._other = null;
			cnt._link1._contact = null;
			cnt._link2._contact = null;
			cnt._s1 = null;
			cnt._s2 = null;
			cnt._b1 = null;
			cnt._b2 = null;
			cnt._touching = false;
			cnt._cachedDetectorData._clear();
			cnt._manifold._clear();
			cnt._detector = null;

			other = cnt._contactConstraint;
			other._s1 = null;
			other._s2 = null;
			other._b1 = null;
			other._b2 = null;
			other._tf1 = null;
			other._tf2 = null;
			cnt._next = this._contactPool;
			this._contactPool = cnt;
			this._numContacts--;
		}

		proto.destroyOutdatedContacts2 = function () {
			incremental = this._broadPhase._incremental;
			cnt = this._contactList;
			while (cnt !== null && cnt !== undefined) {

				while (true) {
					if (cnt._latest) {
						cnt._latest = false;
						cnt._shouldBeSkipped = false;
						break;
					}
					if (!incremental) {
						this.destroyContact(cnt);
						console.log("destroy", cnt);
						break;
					}
					s1 = cnt._s1;
					s2 = cnt._s2;
					rb1 = s1._rigidBody;
					rb2 = s2._rigidBody;
					if (!(!rb1._sleeping && rb1._type !== 1) && !(!rb2._sleeping && rb2._type !== 1)) {
						cnt._shouldBeSkipped = true;

						break;
					}

					pxy1 = s1._proxy;
					pxy2 = s2._proxy;
					if (!(pxy1._aabbMinX < pxy2._aabbMaxX && pxy1._aabbMaxX > pxy2._aabbMinX && pxy1._aabbMinY < pxy2._aabbMaxY && pxy1._aabbMaxY > pxy2._aabbMinY && pxy1._aabbMinZ < pxy2._aabbMaxZ && pxy1._aabbMaxZ > pxy2._aabbMinZ) || !this.shouldCollide(s1, s2)) {
						this.destroyContact(cnt);
						console.log("destroy2", cnt);
						break;
					}
					aabb1 = s1._aabb;
					aabb2 = s2._aabb;
					cnt._shouldBeSkipped = !(aabb1[0] < aabb2[3] && aabb1[3] > aabb2[0] && aabb1[1] < aabb2[4] && aabb1[4] > aabb2[1] && aabb1[2] < aabb2[5] && aabb1[5] > aabb2[2]);

					break;
				}
				cnt = cnt._next;
			}
		}

		proto.destroyOutdatedContacts = function () {
			var incremental = this._broadPhase._incremental;
			var c = this._contactList;
			while (c != null) {
				var n = c._next;
				while (true) {
					if (c._latest) {
						c._latest = false;
						c._shouldBeSkipped = false;
						break;
					}
					if (!incremental) {
						var prev = c._prev;
						var next = c._next;
						if (prev != null) {
							prev._next = next;
						}
						if (next != null) {
							next._prev = prev;
						}
						if (c == this._contactList) {
							this._contactList = this._contactList._next;
						}
						if (c == this._contactListLast) {
							this._contactListLast = this._contactListLast._prev;
						}
						c._next = null;
						c._prev = null;
						if (c._touching) {
							var cc1 = c._s1._contactCallback;
							var cc2 = c._s2._contactCallback;
							if (cc1 == cc2) {
								cc2 = null;
							}
							if (cc1 != null) {
								cc1.endContact(c);
							}
							if (cc2 != null) {
								cc2.endContact(c);
							}
						}
						var prev1 = c._link1._prev;
						var next1 = c._link1._next;
						if (prev1 != null) {
							prev1._next = next1;
						}
						if (next1 != null) {
							next1._prev = prev1;
						}
						if (c._link1 == c._b1._contactLinkList) {
							c._b1._contactLinkList = c._b1._contactLinkList._next;
						}
						if (c._link1 == c._b1._contactLinkListLast) {
							c._b1._contactLinkListLast = c._b1._contactLinkListLast._prev;
						}
						c._link1._next = null;
						c._link1._prev = null;
						var prev2 = c._link2._prev;
						var next2 = c._link2._next;
						if (prev2 != null) {
							prev2._next = next2;
						}
						if (next2 != null) {
							next2._prev = prev2;
						}
						if (c._link2 == c._b2._contactLinkList) {
							c._b2._contactLinkList = c._b2._contactLinkList._next;
						}
						if (c._link2 == c._b2._contactLinkListLast) {
							c._b2._contactLinkListLast = c._b2._contactLinkListLast._prev;
						}
						c._link2._next = null;
						c._link2._prev = null;
						c._b1._numContactLinks--;
						c._b2._numContactLinks--;
						c._link1._other = null;
						c._link2._other = null;
						c._link1._contact = null;
						c._link2._contact = null;
						c._s1 = null;
						c._s2 = null;
						c._b1 = null;
						c._b2 = null;
						c._touching = false;
						c._cachedDetectorData._clear();
						c._manifold._clear();
						c._detector = null;
						var _this = c._contactConstraint;
						_this._s1 = null;
						_this._s2 = null;
						_this._b1 = null;
						_this._b2 = null;
						_this._tf1 = null;
						_this._tf2 = null;
						c._next = this._contactPool;
						this._contactPool = c;
						this._numContacts--;
						break;
					}
					var s1 = c._s1;
					var s2 = c._s2;
					var r1 = s1._rigidBody;
					var r2 = s2._rigidBody;
					var active1 = !r1._sleeping && r1._type != 1;
					var active2 = !r2._sleeping && r2._type != 1;
					if (!active1 && !active2) {
						c._shouldBeSkipped = true;
						break;
					}
					var aabb1 = s1._aabb;
					var aabb2 = s2._aabb;
					var proxy1 = s1._proxy;
					var proxy2 = s2._proxy;
					if (!(proxy1._aabbMinX < proxy2._aabbMaxX && proxy1._aabbMaxX > proxy2._aabbMinX && proxy1._aabbMinY < proxy2._aabbMaxY && proxy1._aabbMaxY > proxy2._aabbMinY && proxy1._aabbMinZ < proxy2._aabbMaxZ && proxy1._aabbMaxZ > proxy2._aabbMinZ) || !this.shouldCollide(s1, s2)) {
						var prev3 = c._prev;
						var next3 = c._next;
						if (prev3 != null) {
							prev3._next = next3;
						}
						if (next3 != null) {
							next3._prev = prev3;
						}
						if (c == this._contactList) {
							this._contactList = this._contactList._next;
						}
						if (c == this._contactListLast) {
							this._contactListLast = this._contactListLast._prev;
						}
						c._next = null;
						c._prev = null;
						if (c._touching) {
							var cc11 = c._s1._contactCallback;
							var cc21 = c._s2._contactCallback;
							if (cc11 == cc21) {
								cc21 = null;
							}
							if (cc11 != null) {
								cc11.endContact(c);
							}
							if (cc21 != null) {
								cc21.endContact(c);
							}
						}
						var prev4 = c._link1._prev;
						var next4 = c._link1._next;
						if (prev4 != null) {
							prev4._next = next4;
						}
						if (next4 != null) {
							next4._prev = prev4;
						}
						if (c._link1 == c._b1._contactLinkList) {
							c._b1._contactLinkList = c._b1._contactLinkList._next;
						}
						if (c._link1 == c._b1._contactLinkListLast) {
							c._b1._contactLinkListLast = c._b1._contactLinkListLast._prev;
						}
						c._link1._next = null;
						c._link1._prev = null;
						var prev5 = c._link2._prev;
						var next5 = c._link2._next;
						if (prev5 != null) {
							prev5._next = next5;
						}
						if (next5 != null) {
							next5._prev = prev5;
						}
						if (c._link2 == c._b2._contactLinkList) {
							c._b2._contactLinkList = c._b2._contactLinkList._next;
						}
						if (c._link2 == c._b2._contactLinkListLast) {
							c._b2._contactLinkListLast = c._b2._contactLinkListLast._prev;
						}
						c._link2._next = null;
						c._link2._prev = null;
						c._b1._numContactLinks--;
						c._b2._numContactLinks--;
						c._link1._other = null;
						c._link2._other = null;
						c._link1._contact = null;
						c._link2._contact = null;
						c._s1 = null;
						c._s2 = null;
						c._b1 = null;
						c._b2 = null;
						c._touching = false;
						c._cachedDetectorData._clear();
						c._manifold._clear();
						c._detector = null;
						var _this1 = c._contactConstraint;
						_this1._s1 = null;
						_this1._s2 = null;
						_this1._b1 = null;
						_this1._b2 = null;
						_this1._tf1 = null;
						_this1._tf2 = null;
						c._next = this._contactPool;
						this._contactPool = c;
						this._numContacts--;
						break;
					}
					var aabbOverlapping = aabb1[0] < aabb2[3] && aabb1[3] > aabb2[0] && aabb1[1] < aabb2[4] && aabb1[4] > aabb2[1] && aabb1[2] < aabb2[5] && aabb1[5] > aabb2[2];
					c._shouldBeSkipped = !aabbOverlapping;
					if (!false) {
						break;
					}
				}
				c = n;
			}
		}

		proto.shouldCollide = function (s1, s2) {
			rb1 = s1._rigidBody;
			rb2 = s2._rigidBody;


			if (rb1 === rb2) {
				return false;
			}
			if (rb1._type !== 0 && rb2._type !== 0) {
				return false;
			}
			if ((s1._collisionGroup & s2._collisionMask) === 0 || (s2._collisionGroup & s1._collisionMask) === 0) {
				return false;
			}

			if (s1._rigidBody._numJointLinks < s2._rigidBody._numJointLinks) {
				list = rb1._jointLinkList;
				other = rb2;
			} else {
				list = rb2._jointLinkList;
				other = rb1;
			}
			while (list != null) {
				if (list._other == other && !list._joint._allowCollision) {
					return false;
				}
				list = list._next;
			}
			return true;
		}

		proto._updateContacts = function () {
			this._broadPhase.collectPairs();
			dynamics.common.Performance.box_detect_time = window.performance.now();
			this.createContacts();
			dynamics.common.Performance.box_detect_time = window.performance.now() - dynamics.common.Performance.box_detect_time;

			this.destroyOutdatedContacts();
		}

		proto._postSolve = function () {
			cnt = this._contactList;
			while (cnt != null) {
				if (cnt._touching) {
					cnt._postSolve();
				}
				cnt = cnt._next;
			}
		}

		var ContactManager = function (broadPhase) {
			this._broadPhase = broadPhase;
			this._collisionMatrix = new collision.narrowphase.CollisionMatrix();
			this._numContacts = 0;
		}
		return ContactManager;
	});

	dynamics.Island = pe.define(function (proto) {
		proto._clear = function () {
			while (this.numRigidBodies > 0) this.rigidBodies[--this.numRigidBodies] = null;
			while (this.numSolvers > 0) this.solvers[--this.numSolvers] = null;
			while (this.numSolversSi > 0) this.solversSi[--this.numSolversSi] = null;
			while (this.numSolversNgs > 0) this.solversNgs[--this.numSolversNgs] = null;
		}

		proto._addRigidBody = function (rigidBody) {
			if (this.numRigidBodies == this.rigidBodies.length) {
				this.rigidBodies.length = this.numRigidBodies << 1;
			}
			rigidBody._addedToIsland = true;
			this.rigidBodies[this.numRigidBodies++] = rigidBody;
		}

		proto._addConstraintSolver = function (solver, positionCorrection) {
			if (this.numSolvers == this.solvers.length) {
				this.solvers.length = this.numSolvers << 1;
			}
			solver._addedToIsland = true;
			this.solvers[this.numSolvers++] = solver;
			if (positionCorrection == dynamics.constraint.PositionCorrectionAlgorithm.SPLIT_IMPULSE) {
				if (this.numSolversSi == this.solversSi.length) {
					this.solversSi.length = this.numSolversSi << 1;
				}
				this.solversSi[this.numSolversSi++] = solver;
			}
			if (positionCorrection == dynamics.constraint.PositionCorrectionAlgorithm.NGS) {
				if (this.numSolversNgs == this.solversNgs.length) {
					this.solversNgs.length = this.numSolversNgs << 1;
				}
				this.solversNgs[this.numSolversNgs++] = solver;
			}
		}

		var dt = 0, dst = null, src = null, i1 = 0, i2 = 0, x = 0, x2 = 0, v_scale = 0,
			gX = 0, gY = 0, gZ = 0, rb = null, sp = null, sleepIsland = false;
		var acc = vec3();
		proto._stepSingleRigidBody = function (timeStep, rb) {

			if (rb._type == 1) {
				rb._sleeping = true;
				rb._sleepTime = 0;
				rb._integrate(dt);
				return;
			}
			
			dt = timeStep.dt;
			dst = rb._ptransform;
			src = rb._transform;
			math.vec3_copy$(dst._position, src._position)
			math.mat3_copy$(dst._rotation, src._rotation)
			if (rb._autoSleep && rb._vel[0] * rb._vel[0] + rb._vel[1] * rb._vel[1] + rb._vel[2] * rb._vel[2] < pe.common.Setting.sleepingVelocityThreshold * pe.common.Setting.sleepingVelocityThreshold
				&& rb._angVel[0] * rb._angVel[0] + rb._angVel[1] * rb._angVel[1] + rb._angVel[2] * rb._angVel[2] < pe.common.Setting.sleepingAngularVelocityThreshold * pe.common.Setting.sleepingAngularVelocityThreshold
			) {
				rb._sleepTime += dt;
			//	console.log("rb._sleepTime", rb._sleepTime);
				if (rb._sleepTime > pe.common.Setting.sleepingTimeThreshold) {
					rb._sleeping = true;
					rb._sleepTime = 0;
					console.log("sleep", rb);
				}
			} else {
				rb._sleepTime = 0;
			}
			if (!rb._sleeping) {

				if (rb._type == 0) {

					x = dt * rb._linearDamping;
					x2 = x * x;
					v_scale = 1 / (1 + x + x2 * (0.5 + x * 0.16666666666666666 + x2 * 0.041666666666666664));

					acc[0] = (this.gravity[0] * rb._gravityScale) + rb._force[0] * rb._invMass;
					acc[1] = (this.gravity[1] * rb._gravityScale) + rb._force[1] * rb._invMass;
					acc[2] = (this.gravity[2] * rb._gravityScale) + rb._force[2] * rb._invMass;

					math.vec3_scale_add$(rb._vel, rb._vel, acc, dt)
					math.vec3_scale$(rb._vel, rb._vel, v_scale)

					x = dt * rb._angularDamping;
					x2 = x * x;
					v_scale = 1 / (1 + x + x2 * (0.5 + x * 0.16666666666666666 + x2 * 0.041666666666666664));

					acc[0] = rb._invInertia[0] * rb._torque[0] + rb._invInertia[1] * rb._torque[1] + rb._invInertia[2] * rb._torque[2];
					acc[1] = rb._invInertia[3] * rb._torque[0] + rb._invInertia[4] * rb._torque[1] + rb._invInertia[5] * rb._torque[2];
					acc[2] = rb._invInertia[6] * rb._torque[0] + rb._invInertia[7] * rb._torque[1] + rb._invInertia[8] * rb._torque[2];


					math.vec3_scale_add$(rb._angVel, rb._angVel, acc, dt)
					math.vec3_scale$(rb._angVel, rb._angVel, v_scale)
				}
				rb._integrate(dt);
				sp = rb._shapeList;
				while (sp != null) {
					sp.sync(rb._ptransform, rb._transform);
					sp = sp._next;
				}
			}
		}

		proto._step = function (timeStep, numVelocityIterations, numPositionIterations) {
			dt = timeStep.dt;
			sleepIsland = true;

			math.vec3_decompose$(this.gravity, gX, gY, gZ)
			i1 = this.numRigidBodies;

			while (i1 > 0) {
				rb = this.rigidBodies[--i1];
				dst = rb._ptransform;
				src = rb._transform;
				math.vec3_copy$(dst._position, src._position)
				math.mat3_copy$(dst._rotation, src._rotation)

				rb._sleeping = false;
				if (rb._autoSleep && rb._vel[0] * rb._vel[0] + rb._vel[1] * rb._vel[1] + rb._vel[2] * rb._vel[2] < pe.common.Setting.sleepingVelocityThreshold * pe.common.Setting.sleepingVelocityThreshold && rb._angVel[0] * rb._angVel[0] + rb._angVel[1] * rb._angVel[1] + rb._angVel[2] * rb._angVel[2] < pe.common.Setting.sleepingAngularVelocityThreshold * pe.common.Setting.sleepingAngularVelocityThreshold) {
					rb._sleepTime += dt;
				} else {
					rb._sleepTime = 0;
				}
				if (rb._sleepTime < pe.common.Setting.sleepingTimeThreshold) {
					sleepIsland = false;
				}
				if (rb._type == 0) {
					x = dt * rb._linearDamping;
					x2 = x * x;
					v_scale = 1 / (1 + x + x2 * (0.5 + x * 0.16666666666666666 + x2 * 0.041666666666666664));

					acc[0] = (gX * rb._gravityScale) + rb._force[0] * rb._invMass;
					acc[1] = (gY * rb._gravityScale) + rb._force[1] * rb._invMass;
					acc[2] = (gZ * rb._gravityScale) + rb._force[2] * rb._invMass;
					math.vec3_scale_add$(rb._vel, rb._vel, acc, dt)
					math.vec3_scale$(rb._vel, rb._vel, v_scale)


					x = dt * rb._angularDamping;
					x2 = x * x;
					v_scale = 1 / (1 + x + x2 * (0.5 + x * 0.16666666666666666 + x2 * 0.041666666666666664));

					acc[0] = rb._invInertia[0] * rb._torque[0] + rb._invInertia[1] * rb._torque[1] + rb._invInertia[2] * rb._torque[2];
					acc[1] = rb._invInertia[3] * rb._torque[0] + rb._invInertia[4] * rb._torque[1] + rb._invInertia[5] * rb._torque[2];
					acc[2] = rb._invInertia[6] * rb._torque[0] + rb._invInertia[7] * rb._torque[1] + rb._invInertia[8] * rb._torque[2];

					math.vec3_scale_add$(rb._angVel, rb._angVel, acc, dt)
					math.vec3_scale$(rb._angVel, rb._angVel, v_scale);

				}
			}


			if (sleepIsland) {
				i1 = this.numRigidBodies;
				while (i1 > 0) {
					rb = this.rigidBodies[--i1];
					rb.sleeping = true;
					rb.sleepTime = 0
				}
				return;
			}

			i1 = this.numSolvers;
			while (i1 > 0) {
				this.solvers[--i1].preSolveVelocity(timeStep);
			}


			i1 = this.numSolvers;
			while (i1 > 0) {
				this.solvers[--i1].warmStart(timeStep);
			}

			i1 = numVelocityIterations;
			while (--i1 > 0) {
				i2 = this.numSolvers;
				while (i2 > 0) {
					this.solvers[--i2].solveVelocity();
				}
			}


			i1 = this.numSolvers;
			while (i1 > 0) {
				this.solvers[--i1].postSolveVelocity(timeStep);
			}


			i1 = this.numRigidBodies;
			while (i1 > 0) {
				this.rigidBodies[--i1]._integrate(dt);
			}

			i1 = this.numSolversSi;
			while (i1 > 0) {
				this.solversSi[--i1].preSolvePosition(timeStep);
			}

			i1 = numPositionIterations;
			while (--i1 > 0) {
				i2 = this.numSolversSi;
				while (i2 > 0) {
					this.solversSi[--i2].solvePositionSplitImpulse(timeStep);
				}
			}

			i1 = this.numRigidBodies;
			while (i1 > 0) {
				this.rigidBodies[--i1]._integratePseudoVelocity();
			}

			i1 = this.numSolversNgs;
			while (i1 > 0) {
				this.solversNgs[--i1].preSolvePosition(timeStep);
			}

			i1 = numPositionIterations;
			while (--i1 > 0) {
				i2 = this.numSolversNgs;
				while (i2 > 0) {
					this.solversNgs[--i2].solvePositionNgs(timeStep);
				}
			}

			i1 = this.numSolvers;
			while (i1 > 0) {
				this.solvers[--i1].postSolve();
			}

			i1 = this.numRigidBodies;
			while (i1 > 0) {
				rb = this.rigidBodies[--i1];
				sp = rb._shapeList;
				while (sp != null) {
					sp.sync(rb._ptransform, rb._transform);
					sp = sp._next;
				}
			}
		}

		var Island = function () {
			this.rigidBodies = new Array(pe.common.Setting.islandInitialRigidBodyArraySize);
			this.solvers = new Array(pe.common.Setting.islandInitialConstraintArraySize);
			this.solversSi = new Array(pe.common.Setting.islandInitialConstraintArraySize);
			this.solversNgs = new Array(pe.common.Setting.islandInitialConstraintArraySize);
			this.numRigidBodies = 0;
			this.numSolvers = 0;
			this.numSolversSi = 0;
			this.numSolversNgs = 0;
			this.gravity = vec3();
		}
		return Island;
	});

	dynamics.World = pe.define(function (proto) {
		proto._updateContacts = function () {
		//	var st = new Date().getTime() / 1000;
			this._contactManager._updateContacts();
		//	var en = new Date().getTime() / 1000;
		//	dynamics.common.Performance.broadPhaseCollisionTime = (en - st) * 1000;
		//	var st1 = new Date().getTime() / 1000;
			list = this._contactManager._contactList;
			while (list != null) {
				if (!list._shouldBeSkipped) {
					list._updateManifold();
				}
				list = list._next;
			}
		//	var en1 = new Date().getTime() / 1000;
		//	dynamics.common.Performance.narrowPhaseCollisionTime = (en1 - st1) * 1000;
		}

		proto._solveIslands = function () {
			//var st = new Date().getTime() / 1000;
			if (pe.common.Setting.disableSleeping) {
				body = this._rigidBodyList;
				while (body != null) {
					body._sleeping = false;
					body._sleepTime = 0;
					body = body._next;
				}
			}
			if (this._rigidBodyStack.length < this._numRigidBodies) {
				newStackSize = this._rigidBodyStack.length << 1;
				while (newStackSize < this._numRigidBodies) newStackSize <<= 1;
				this._rigidBodyStack.length = newStackSize;
			}
			this._numIslands = 0;

			math.vec3_copy$(this._island.gravity, this._gravity)
			var body = this._rigidBodyList;
			this._numSolversInIslands = 0;
			while (body !== null) {
				while (!(body._addedToIsland || body._sleeping || body._type === 1)) {
					if (body._numContactLinks === 0 && body._numJointLinks === 0) {
						this._island._stepSingleRigidBody(this._timeStep, body);
						this._numIslands++;
						break;
					}
					this.buildIsland(body);
					this._island._step(this._timeStep, this._numVelocityIterations, this._numPositionIterations);
					this._island._clear();
					this._numIslands++;
					break;
				}
				body = body._next;
			}
			this._contactManager._postSolve();
			body = this._rigidBodyList;
			while (body != null) {
				body._addedToIsland = false;
				body._force.fill(0);
				body = body._next;
			}

			while (this._numSolversInIslands > 0) {
				this._solversInIslands[--this._numSolversInIslands]._addedToIsland = false;
				this._solversInIslands[this._numSolversInIslands] = null;
			}
			//var en = new Date().getTime() / 1000;
		//	dynamics.common.Performance.dynamicsTime = (en - st) * 1000;
		}

		proto.buildIsland = function (base) {
			stackCount = 1;
			this._island._addRigidBody(base);
			this._rigidBodyStack[0] = base;
			while (stackCount > 0) {
				rb = this._rigidBodyStack[--stackCount];
				this._rigidBodyStack[stackCount] = null;
				if (rb._type == 1) {
					continue;
				}
				contact = rb._contactLinkList;
				while (contact != null) {
					if (contact._contact._contactConstraint.isTouching() && !contact._contact._contactConstraint._solver._addedToIsland) {
						if (this._solversInIslands.length == this._numSolversInIslands) {
							this._solversInIslands.length = this._numSolversInIslands << 1;
						}
						this._solversInIslands[this._numSolversInIslands++] = contact._contact._contactConstraint._solver;
						this._island._addConstraintSolver(contact._contact._contactConstraint._solver,
							contact._contact._contactConstraint._positionCorrectionAlgorithm);

						if (!contact._other._addedToIsland) {
							this._island._addRigidBody(contact._other);
							this._rigidBodyStack[stackCount++] = contact._other;
						}
					}
					contact = contact._next;
				}


				joint = rb._jointLinkList;
				while (joint != null) {
					if (!joint._joint._solver._addedToIsland) {
						if (this._solversInIslands.length == this._numSolversInIslands) {
							this._solversInIslands.length = this._numSolversInIslands << 1;
						}
						this._solversInIslands[this._numSolversInIslands++] = list._joint._solver;
						this._island._addConstraintSolver(joint._joint._solver, list._joint._positionCorrectionAlgorithm);

						if (!joint._other._addedToIsland) {
							this._island._addRigidBody(joint._other);
							this._rigidBodyStack[stackCount++] = joint._other;
						}
					}
					joint = joint._next;
				}
			}
		}

		proto.step = function (timeStep) {
			if (this._timeStep.dt > 0) {
				this._timeStep.dtRatio = timeStep / this._timeStep.dt;
			}


			this._timeStep.dt = timeStep;
			this._timeStep.invDt = 1 / timeStep;
		//	var st = new Date().getTime() / 1000;
			this._updateContacts();
			this._solveIslands();
		//	var en = new Date().getTime() / 1000;
		//	dynamics.common.Performance.totalTime = (en - st) * 1000;
		}

		proto.addRigidBody = function (rigidBody) {
			if (rigidBody._world != null) {
				throw new Error("A rigid body cannot belong to multiple worlds.");
			}
			if (this._rigidBodyList == null) {
				this._rigidBodyList = rigidBody;
				this._rigidBodyListLast = rigidBody;
			} else {
				this._rigidBodyListLast._next = rigidBody;
				rigidBody._prev = this._rigidBodyListLast;
				this._rigidBodyListLast = rigidBody;
			}
			rigidBody._world = this;
			sp = rigidBody._shapeList;
			while (sp != null) {
				sp._proxy = this._broadPhase.createProxy(sp, sp._aabb);
				sp._id = this._shapeIdCount++;
				this._numShapes++;
				sp = sp._next;
			}
			this._numRigidBodies++;
		}

		proto.removeRigidBody = function (rigidBody) {
			if (rigidBody._world != this) {
				throw new Error("The rigid body doesn't belong to the world.");
			}
			var prev = rigidBody._prev;
			var next = rigidBody._next;
			if (prev != null) {
				prev._next = next;
			}
			if (next != null) {
				next._prev = prev;
			}
			if (rigidBody == this._rigidBodyList) {
				this._rigidBodyList = this._rigidBodyList._next;
			}
			if (rigidBody == this._rigidBodyListLast) {
				this._rigidBodyListLast = this._rigidBodyListLast._prev;
			}
			rigidBody._next = null;
			rigidBody._prev = null;
			rigidBody._world = null;
			sp = rigidBody._shapeList;
			while (sp != null) {
				this._broadPhase.destroyProxy(sp._proxy);
				sp._proxy = null;
				sp._id = -1;
				var cl = s._rigidBody._contactLinkList;
				while (cl != null) {
					var n1 = cl._next;
					var c = cl._contact;
					if (c._s1 == s || c._s2 == s) {
						var _this = cl._other;
						_this._sleeping = false;
						_this._sleepTime = 0;
						var _this1 = this._contactManager;
						var prev1 = c._prev;
						var next1 = c._next;
						if (prev1 != null) {
							prev1._next = next1;
						}
						if (next1 != null) {
							next1._prev = prev1;
						}
						if (c == _this1._contactList) {
							_this1._contactList = _this1._contactList._next;
						}
						if (c == _this1._contactListLast) {
							_this1._contactListLast = _this1._contactListLast._prev;
						}
						c._next = null;
						c._prev = null;
						if (c._touching) {
							var cc1 = c._s1._contactCallback;
							var cc2 = c._s2._contactCallback;
							if (cc1 == cc2) {
								cc2 = null;
							}
							if (cc1 != null) {
								cc1.endContact(c);
							}
							if (cc2 != null) {
								cc2.endContact(c);
							}
						}
						var prev2 = c._link1._prev;
						var next2 = c._link1._next;
						if (prev2 != null) {
							prev2._next = next2;
						}
						if (next2 != null) {
							next2._prev = prev2;
						}
						if (c._link1 == c._b1._contactLinkList) {
							c._b1._contactLinkList = c._b1._contactLinkList._next;
						}
						if (c._link1 == c._b1._contactLinkListLast) {
							c._b1._contactLinkListLast = c._b1._contactLinkListLast._prev;
						}
						c._link1._next = null;
						c._link1._prev = null;
						var prev3 = c._link2._prev;
						var next3 = c._link2._next;
						if (prev3 != null) {
							prev3._next = next3;
						}
						if (next3 != null) {
							next3._prev = prev3;
						}
						if (c._link2 == c._b2._contactLinkList) {
							c._b2._contactLinkList = c._b2._contactLinkList._next;
						}
						if (c._link2 == c._b2._contactLinkListLast) {
							c._b2._contactLinkListLast = c._b2._contactLinkListLast._prev;
						}
						c._link2._next = null;
						c._link2._prev = null;
						c._b1._numContactLinks--;
						c._b2._numContactLinks--;
						c._link1._other = null;
						c._link2._other = null;
						c._link1._contact = null;
						c._link2._contact = null;
						c._s1 = null;
						c._s2 = null;
						c._b1 = null;
						c._b2 = null;
						c._touching = false;
						c._cachedDetectorData._clear();
						c._manifold._clear();
						c._detector = null;
						var _this2 = c._contactConstraint;
						_this2._s1 = null;
						_this2._s2 = null;
						_this2._b1 = null;
						_this2._b2 = null;
						_this2._tf1 = null;
						_this2._tf2 = null;
						c._next = _this1._contactPool;
						_this1._contactPool = c;
						_this1._numContacts--;
					}
					cl = n1;
				}
				this._numShapes--;
				sp = sp._next;
			}
			this._numRigidBodies--;
		}

		proto.addJoint = function (joint) {
			if (joint._world != null) {
				throw new Error("A joint cannot belong to multiple worlds.");
			}
			if (this._jointList == null) {
				this._jointList = joint;
				this._jointListLast = joint;
			} else {
				this._jointListLast._next = joint;
				joint._prev = this._jointListLast;
				this._jointListLast = joint;
			}
			joint._world = this;
			joint._link1._other = joint._b2;
			joint._link2._other = joint._b1;
			if (joint._b1._jointLinkList == null) {
				joint._b1._jointLinkList = joint._link1;
				joint._b1._jointLinkListLast = joint._link1;
			} else {
				joint._b1._jointLinkListLast._next = joint._link1;
				joint._link1._prev = joint._b1._jointLinkListLast;
				joint._b1._jointLinkListLast = joint._link1;
			}
			if (joint._b2._jointLinkList == null) {
				joint._b2._jointLinkList = joint._link2;
				joint._b2._jointLinkListLast = joint._link2;
			} else {
				joint._b2._jointLinkListLast._next = joint._link2;
				joint._link2._prev = joint._b2._jointLinkListLast;
				joint._b2._jointLinkListLast = joint._link2;
			}
			joint._b1._numJointLinks++;
			joint._b2._numJointLinks++;
			var _this = joint._b1;
			_this._sleeping = false;
			_this._sleepTime = 0;
			var _this1 = joint._b2;
			_this1._sleeping = false;
			_this1._sleepTime = 0;
			joint._syncAnchors();
			this._numJoints++;
		}

		proto.removeJoint = function (joint) {
			if (joint._world != this) {
				throw new Error("The joint doesn't belong to the world.");
			}
			var prev = joint._prev;
			var next = joint._next;
			if (prev != null) {
				prev._next = next;
			}
			if (next != null) {
				next._prev = prev;
			}
			if (joint == this._jointList) {
				this._jointList = this._jointList._next;
			}
			if (joint == this._jointListLast) {
				this._jointListLast = this._jointListLast._prev;
			}
			joint._next = null;
			joint._prev = null;
			joint._world = null;
			var prev1 = joint._link1._prev;
			var next1 = joint._link1._next;
			if (prev1 != null) {
				prev1._next = next1;
			}
			if (next1 != null) {
				next1._prev = prev1;
			}
			if (joint._link1 == joint._b1._jointLinkList) {
				joint._b1._jointLinkList = joint._b1._jointLinkList._next;
			}
			if (joint._link1 == joint._b1._jointLinkListLast) {
				joint._b1._jointLinkListLast = joint._b1._jointLinkListLast._prev;
			}
			joint._link1._next = null;
			joint._link1._prev = null;
			var prev2 = joint._link2._prev;
			var next2 = joint._link2._next;
			if (prev2 != null) {
				prev2._next = next2;
			}
			if (next2 != null) {
				next2._prev = prev2;
			}
			if (joint._link2 == joint._b2._jointLinkList) {
				joint._b2._jointLinkList = joint._b2._jointLinkList._next;
			}
			if (joint._link2 == joint._b2._jointLinkListLast) {
				joint._b2._jointLinkListLast = joint._b2._jointLinkListLast._prev;
			}
			joint._link2._next = null;
			joint._link2._prev = null;
			joint._link1._other = null;
			joint._link2._other = null;
			joint._b1._numJointLinks--;
			joint._b2._numJointLinks--;
			var _this = joint._b1;
			_this._sleeping = false;
			_this._sleepTime = 0;
			var _this1 = joint._b2;
			_this1._sleeping = false;
			_this1._sleepTime = 0;
			this._numJoints--;
		}

		proto.rayCast = function (begin, end, callback) {
			console.log("rayCast");
			var _this = this._rayCastWrapper.begin;
			_this[0] = begin[0];
			_this[1] = begin[1];
			_this[2] = begin[2];
			var _this1 = this._rayCastWrapper.end;
			_this1[0] = end[0];
			_this1[1] = end[1];
			_this1[2] = end[2];
			this._rayCastWrapper.callback = callback;
			this._broadPhase.rayCast(begin, end, this._rayCastWrapper);
		}

		proto.convexCast = function (convex, begin, translation, callback) {
			this._convexCastWrapper.convex = convex;
			var _this = this._convexCastWrapper.begin;
			_this._position[0] = begin._position[0];
			_this._position[1] = begin._position[1];
			_this._position[2] = begin._position[2];
			_this._rotation[0] = begin._rotation[0];
			_this._rotation[1] = begin._rotation[1];
			_this._rotation[2] = begin._rotation[2];
			_this._rotation[3] = begin._rotation[3];
			_this._rotation[4] = begin._rotation[4];
			_this._rotation[5] = begin._rotation[5];
			_this._rotation[6] = begin._rotation[6];
			_this._rotation[7] = begin._rotation[7];
			_this._rotation[8] = begin._rotation[8];
			var _this1 = this._convexCastWrapper.translation;
			_this1[0] = translation[0];
			_this1[1] = translation[1];
			_this1[2] = translation[2];
			this._convexCastWrapper.callback = callback;
			this._broadPhase.convexCast(convex, begin, translation, this._convexCastWrapper);
		}

		proto.aabbTest = function (aabb, callback) {
			this._aabbTestWrapper._aabb.copyFrom(aabb);
			this._aabbTestWrapper._callback = callback;
			this._broadPhase.aabbTest(aabb, this._aabbTestWrapper);
		}

		var World = function (broadPhaseType, gravity) {
			if (broadPhaseType == null) {
				broadPhaseType = 2;
			}
			switch (broadPhaseType) {
				case 1:
					this._broadPhase = new collision.broadphase.bruteforce.BruteForceBroadPhase();
					break;
				case 2:
					this._broadPhase = new collision.broadphase.bvh.BvhBroadPhase();
					break;
			}
			this._contactManager = new dynamics.ContactManager(this._broadPhase);
			this._gravity = vec3(gravity);
			this._rigidBodyList = null;
			this._rigidBodyListLast = null;
			this._jointList = null;
			this._jointListLast = null;
			this._numRigidBodies = 0;
			this._numShapes = 0;
			this._numJoints = 0;
			this._numIslands = 0;
			this._numVelocityIterations = 8;
			this._numPositionIterations = 4;
			this._rayCastWrapper = new World.RayCastWrapper();
			this._convexCastWrapper = new World.ConvexCastWrapper();
			this._aabbTestWrapper = new World.AabbTestWrapper();
			this._island = new dynamics.Island();
			this._solversInIslands = new Array(pe.common.Setting.islandInitialConstraintArraySize);
			this._rigidBodyStack = new Array(pe.common.Setting.islandInitialRigidBodyArraySize);
			this._timeStep = new dynamics.TimeStep();
			this._shapeIdCount = 0;
		}



		World.RayCastWrapper = pe.define(function (proto) {
			proto.process = function (proxy) {
				var shape = proxy.userData;
				if (shape._geom.rayCast(this.begin, this.end, shape._transform, this.rayCastHit)) {
					this.callback.process(shape, this.rayCastHit);
				}
			}

			var RayCastWrapper = function () {
				collision.broadphase.BroadPhaseProxyCallback.call(this);
				this.rayCastHit = new collision.geometry.RayCastHit();
				this.begin = vec3();
				this.end = vec3();
				this.callback = null;
			}
			return RayCastWrapper;
		});

		World.ConvexCastWrapper = pe.define(function (proto) {
			proto.process = function (proxy) {
				var shape = proxy.userData;
				var type = shape._geom._type;
				if (type < 0 || type > 5) {
					return;
				}
				var geom = shape._geom;
				if (collision.narrowphase.detector.gjkepa.GjkEpa.instance.convexCast(this.convex, geom, this.begin, shape._transform, this.translation, this.zero, this.rayCastHit)) {
					this.callback.process(shape, this.rayCastHit);
				}
			}

			var ConvexCastWrapper = function () {
				collision.broadphase.BroadPhaseProxyCallback.call(this);
				this.rayCastHit = new collision.geometry.RayCastHit();
				this.begin = new pe.common.Transform();
				this.translation = vec3();
				this.zero = vec3();
				this.callback = null;
				this.convex = null;
			}
			return ConvexCastWrapper;
		});

		World.AabbTestWrapper = pe.define(function (proto) {
			proto.process = function (proxy) {
				var shape = proxy.userData;
				var shapeAabb = shape._aabb;
				if (shapeAabb[0] < this._aabb[3] && shapeAabb[3] > this._aabb[0] && shapeAabb[1] < this._aabb[4] && shapeAabb[4] > this._aabb[1] && shapeAabb[2] < this._aabb[5] && shapeAabb[5] > this._aabb[2]) {
					this._callback.process(shape);
				}
			}

			var AabbTestWrapper = function () {
				collision.broadphase.BroadPhaseProxyCallback.call(this);
				this._aabb = aabb();
				this._callback = null;
			}
			return AabbTestWrapper;
		});









		return World;
	});



	dynamics.callback.AabbTestCallback = pe.define(function (proto) {
		proto.process = function (shape) {
		}

		var AabbTestCallback = function () {
		}
		return AabbTestCallback;
	});

	dynamics.callback.ContactCallback = pe.define(function (proto) {
		proto.beginContact = function (c) {
		}

		proto.preSolve = function (c) {
		}

		proto.postSolve = function (c) {
		}

		proto.endContact = function (c) {
		}

		var ContactCallback = function () {
		}
		return ContactCallback;
	});

	dynamics.callback.RayCastCallback = pe.define(function (proto) {
		proto.process = function (shape, hit) {
		}

		var RayCastCallback = function () {
		}
		return RayCastCallback;
	});

	dynamics.callback.RayCastClosest = pe.define(function (proto) {
		proto.clear = function () {
			this.shape = null;
			this.fraction = 1;
			this.position.zero();
			this.normal.zero();
			this.hit = false;
		}

		proto.process = function (shape, hit) {
			if (hit.fraction < this.fraction) {
				this.shape = shape;
				this.hit = true;
				this.fraction = hit.fraction;
				var _this = this.position;
				var v = hit.position;
				_this[0] = v[0];
				_this[1] = v[1];
				_this[2] = v[2];
				var _this1 = this.normal;
				var v1 = hit.normal;
				_this1[0] = v1[0];
				_this1[1] = v1[1];
				_this1[2] = v1[2];
			}
		}

		var RayCastClosest = function () {
			dynamics.callback.RayCastCallback.call(this);
			this.position = vec3();
			this.normal = vec3();
			this.shape = null;
			this.fraction = 1;
			this.position.zero();
			this.normal.zero();
			this.hit = false;
		}
		return RayCastClosest;
	});

	dynamics.constraint.ConstraintSolver = pe.define(function (proto) {
		proto.preSolveVelocity = function (timeStep) {
		}

		proto.warmStart = function (timeStep) {
		}

		proto.solveVelocity = function () {
		}

		proto.postSolveVelocity = function (timeStep) {
		}

		proto.preSolvePosition = function (timeStep) {
		}

		proto.solvePositionSplitImpulse = function () {
		}

		proto.solvePositionNgs = function (timeStep) {
		}

		proto.postSolve = function () {
		}

		var ConstraintSolver = function () {
			this._b1 = null;
			this._b2 = null;
			this._addedToIsland = false;
		}
		return ConstraintSolver;
	});

	dynamics.constraint.contact.ContactConstraint = pe.define(function (proto) {
		proto._getVelocitySolverInfo = function (timeStep, info) {
			info.b1 = this._b1;
			info.b2 = this._b2;
			var normal;
			var normalX;
			var normalY;
			var normalZ;
			var tangent;
			var tangentX;
			var tangentY;
			var tangentZ;
			var binormal;
			var binormalX;
			var binormalY;
			var binormalZ;
			normalX = this._manifold._normalX;
			normalY = this._manifold._normalY;
			normalZ = this._manifold._normalZ;
			tangentX = this._manifold._tangentX;
			tangentY = this._manifold._tangentY;
			tangentZ = this._manifold._tangentZ;
			binormalX = this._manifold._binormalX;
			binormalY = this._manifold._binormalY;
			binormalZ = this._manifold._binormalZ;
			var friction = Math.sqrt(this._s1._friction * this._s2._friction);
			var restitution = Math.sqrt(this._s1._restitution * this._s2._restitution);
			var num = this._manifold._numPoints;
			info.numRows = 0;
			var posDiff;
			var posDiffX;
			var posDiffY;
			var posDiffZ;
			posDiffX = this._tf1._position[0] - this._tf2._position[0];
			posDiffY = this._tf1._position[1] - this._tf2._position[1];
			posDiffZ = this._tf1._position[2] - this._tf2._position[2];
			var _g1 = 0;
			var _g = num;
			while (_g1 < _g) {
				var i = _g1++;
				var p = this._manifold._points[i];
				if (p._depth < 0) {
					p._disabled = true;
					var _this = p._impulse;
					_this.impulseN = 0;
					_this.impulseT = 0;
					_this.impulseB = 0;
					_this.impulseP = 0;
					_this.impulseLX = 0;
					_this.impulseLY = 0;
					_this.impulseLZ = 0;
					continue;
				} else {
					p._disabled = false;
				}
				var row = info.rows[info.numRows++];
				row.friction = friction;
				row.cfm = 0;
				var j = row.jacobianN;
				j.lin1X = normalX;
				j.lin1Y = normalY;
				j.lin1Z = normalZ;
				j.lin2X = normalX;
				j.lin2Y = normalY;
				j.lin2Z = normalZ;
				j.ang1X = p._relPos1Y * normalZ - p._relPos1Z * normalY;
				j.ang1Y = p._relPos1Z * normalX - p._relPos1X * normalZ;
				j.ang1Z = p._relPos1X * normalY - p._relPos1Y * normalX;
				j.ang2X = p._relPos2Y * normalZ - p._relPos2Z * normalY;
				j.ang2Y = p._relPos2Z * normalX - p._relPos2X * normalZ;
				j.ang2Z = p._relPos2X * normalY - p._relPos2Y * normalX;
				j = row.jacobianT;
				j.lin1X = tangentX;
				j.lin1Y = tangentY;
				j.lin1Z = tangentZ;
				j.lin2X = tangentX;
				j.lin2Y = tangentY;
				j.lin2Z = tangentZ;
				j.ang1X = p._relPos1Y * tangentZ - p._relPos1Z * tangentY;
				j.ang1Y = p._relPos1Z * tangentX - p._relPos1X * tangentZ;
				j.ang1Z = p._relPos1X * tangentY - p._relPos1Y * tangentX;
				j.ang2X = p._relPos2Y * tangentZ - p._relPos2Z * tangentY;
				j.ang2Y = p._relPos2Z * tangentX - p._relPos2X * tangentZ;
				j.ang2Z = p._relPos2X * tangentY - p._relPos2Y * tangentX;
				j = row.jacobianB;
				j.lin1X = binormalX;
				j.lin1Y = binormalY;
				j.lin1Z = binormalZ;
				j.lin2X = binormalX;
				j.lin2Y = binormalY;
				j.lin2Z = binormalZ;
				j.ang1X = p._relPos1Y * binormalZ - p._relPos1Z * binormalY;
				j.ang1Y = p._relPos1Z * binormalX - p._relPos1X * binormalZ;
				j.ang1Z = p._relPos1X * binormalY - p._relPos1Y * binormalX;
				j.ang2X = p._relPos2Y * binormalZ - p._relPos2Z * binormalY;
				j.ang2Y = p._relPos2Z * binormalX - p._relPos2X * binormalZ;
				j.ang2Z = p._relPos2X * binormalY - p._relPos2Y * binormalX;
				j = row.jacobianN;
				var rvn = j.lin1X * this._b1._vel[0] + j.lin1Y * this._b1._vel[1] + j.lin1Z * this._b1._vel[2] + (j.ang1X * this._b1._angVel[0] + j.ang1Y * this._b1._angVel[1] + j.ang1Z * this._b1._angVel[2]) - (j.lin2X * this._b2._vel[0] + j.lin2Y * this._b2._vel[1] + j.lin2Z * this._b2._vel[2] + (j.ang2X * this._b2._angVel[0] + j.ang2Y * this._b2._angVel[1] + j.ang2Z * this._b2._angVel[2]));
				if (rvn < -pe.common.Setting.contactEnableBounceThreshold && !p._warmStarted) {
					row.rhs = -rvn * restitution;
				} else {
					row.rhs = 0;
				}
				if (this._positionCorrectionAlgorithm == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE) {
					if (p._depth > pe.common.Setting.linearSlop) {
						var minRhs = (p._depth - pe.common.Setting.linearSlop) * pe.common.Setting.velocityBaumgarte * timeStep.invDt;
						if (row.rhs < minRhs) {
							row.rhs = minRhs;
						}
					}
				}
				if (!p._warmStarted) {
					var _this1 = p._impulse;
					_this1.impulseN = 0;
					_this1.impulseT = 0;
					_this1.impulseB = 0;
					_this1.impulseP = 0;
					_this1.impulseLX = 0;
					_this1.impulseLY = 0;
					_this1.impulseLZ = 0;
				}
				row.impulse = p._impulse;
			}
		}

		proto._getPositionSolverInfo = function (info) {
			info.b1 = this._b1;
			info.b2 = this._b2;
			var normal;
			var normalX;
			var normalY;
			var normalZ;
			normalX = this._manifold._normalX;
			normalY = this._manifold._normalY;
			normalZ = this._manifold._normalZ;
			var num = this._manifold._numPoints;
			info.numRows = 0;
			var _g1 = 0;
			var _g = num;
			while (_g1 < _g) {
				var i = _g1++;
				var p = this._manifold._points[i];
				if (p._disabled) {
					continue;
				}
				var row = info.rows[info.numRows++];
				var j = row.jacobianN;
				j.lin1X = normalX;
				j.lin1Y = normalY;
				j.lin1Z = normalZ;
				j.lin2X = normalX;
				j.lin2Y = normalY;
				j.lin2Z = normalZ;
				j.ang1X = p._relPos1Y * normalZ - p._relPos1Z * normalY;
				j.ang1Y = p._relPos1Z * normalX - p._relPos1X * normalZ;
				j.ang1Z = p._relPos1X * normalY - p._relPos1Y * normalX;
				j.ang2X = p._relPos2Y * normalZ - p._relPos2Z * normalY;
				j.ang2Y = p._relPos2Z * normalX - p._relPos2X * normalZ;
				j.ang2Z = p._relPos2X * normalY - p._relPos2Y * normalX;
				row.rhs = p._depth - pe.common.Setting.linearSlop;
				if (row.rhs < 0) {
					row.rhs = 0;
				}
				row.impulse = p._impulse;
			}
		}

		proto._syncManifold = function () {
			this._manifold._updateDepthsAndPositions(this._tf1, this._tf2);
		}

		proto.getManifold = function () {
			return this._manifold;
		}

		proto.isTouching = function () {
			var _g1 = 0;
			var _g = this._manifold._numPoints;
			while (_g1 < _g) {
				var i = _g1++;
				if (this._manifold._points[i]._depth >= 0) {
					return true;
				}
			}
			return false;
		}

		var ContactConstraint = function (manifold) {
			this._solver = new dynamics.constraint.solver.pgs.PgsContactConstraintSolver(this);
			this._manifold = manifold;
		}
		return ContactConstraint;
	});

	dynamics.constraint.contact.ContactImpulse = pe.define(function (proto) {
		proto.copyFrom = function (imp) {
			this.impulseN = imp.impulseN;
			this.impulseT = imp.impulseT;
			this.impulseB = imp.impulseB;
			this.impulseLX = imp.impulseLX;
			this.impulseLY = imp.impulseLY;
			this.impulseLZ = imp.impulseLZ;
		}

		var ContactImpulse = function () {
			this.impulseN = 0;
			this.impulseT = 0;
			this.impulseB = 0;
			this.impulseP = 0;
			this.impulseLX = 0;
			this.impulseLY = 0;
			this.impulseLZ = 0;
		}
		return ContactImpulse;
	});

	dynamics.constraint.contact.Manifold = pe.define(function (proto) {
		proto._clear = function () {
			var _g1 = 0;
			var _g = this._numPoints;
			while (_g1 < _g) {
				var i = _g1++;
				var _this = this._points[i];
				_this._localPos1X = 0;
				_this._localPos1Y = 0;
				_this._localPos1Z = 0;
				_this._localPos2X = 0;
				_this._localPos2Y = 0;
				_this._localPos2Z = 0;
				_this._relPos1X = 0;
				_this._relPos1Y = 0;
				_this._relPos1Z = 0;
				_this._relPos2X = 0;
				_this._relPos2Y = 0;
				_this._relPos2Z = 0;
				_this._pos1X = 0;
				_this._pos1Y = 0;
				_this._pos1Z = 0;
				_this._pos2X = 0;
				_this._pos2Y = 0;
				_this._pos2Z = 0;
				_this._depth = 0;
				var _this1 = _this._impulse;
				_this1.impulseN = 0;
				_this1.impulseT = 0;
				_this1.impulseB = 0;
				_this1.impulseP = 0;
				_this1.impulseLX = 0;
				_this1.impulseLY = 0;
				_this1.impulseLZ = 0;
				_this._warmStarted = false;
				_this._disabled = false;
				_this._id = -1;
			}
			this._numPoints = 0;
		}

		proto._buildBasis = function (normal) {
			var v = normal;
			this._normalX = v[0];
			this._normalY = v[1];
			this._normalZ = v[2];
			var nx = normal[0];
			var ny = normal[1];
			var nz = normal[2];
			var nx2 = nx * nx;
			var ny2 = ny * ny;
			var nz2 = nz * nz;
			var tx;
			var ty;
			var tz;
			var bx;
			var by;
			var bz;
			if (nx2 < ny2) {
				if (nx2 < nz2) {
					var invL = 1 / Math.sqrt(ny2 + nz2);
					tx = 0;
					ty = -nz * invL;
					tz = ny * invL;
					bx = ny * tz - nz * ty;
					by = -nx * tz;
					bz = nx * ty;
				} else {
					var invL1 = 1 / Math.sqrt(nx2 + ny2);
					tx = -ny * invL1;
					ty = nx * invL1;
					tz = 0;
					bx = -nz * ty;
					by = nz * tx;
					bz = nx * ty - ny * tx;
				}
			} else if (ny2 < nz2) {
				var invL2 = 1 / Math.sqrt(nx2 + nz2);
				tx = nz * invL2;
				ty = 0;
				tz = -nx * invL2;
				bx = ny * tz;
				by = nz * tx - nx * tz;
				bz = -ny * tx;
			} else {
				var invL3 = 1 / Math.sqrt(nx2 + ny2);
				tx = -ny * invL3;
				ty = nx * invL3;
				tz = 0;
				bx = -nz * ty;
				by = nz * tx;
				bz = nx * ty - ny * tx;
			}
			this._tangentX = tx;
			this._tangentY = ty;
			this._tangentZ = tz;
			this._binormalX = bx;
			this._binormalY = by;
			this._binormalZ = bz;
		}

		proto._updateDepthsAndPositions = function (tf1, tf2) {
			var _g1 = 0;
			var _g = this._numPoints;
			while (_g1 < _g) {
				var i = _g1++;
				var p = this._points[i];
				var __tmp__X;
				var __tmp__Y;
				var __tmp__Z;
				__tmp__X = tf1._rotation[0] * p._localPos1X + tf1._rotation[1] * p._localPos1Y + tf1._rotation[2] * p._localPos1Z;
				__tmp__Y = tf1._rotation[3] * p._localPos1X + tf1._rotation[4] * p._localPos1Y + tf1._rotation[5] * p._localPos1Z;
				__tmp__Z = tf1._rotation[6] * p._localPos1X + tf1._rotation[7] * p._localPos1Y + tf1._rotation[8] * p._localPos1Z;
				p._relPos1X = __tmp__X;
				p._relPos1Y = __tmp__Y;
				p._relPos1Z = __tmp__Z;
				var __tmp__X1;
				var __tmp__Y1;
				var __tmp__Z1;
				__tmp__X1 = tf2._rotation[0] * p._localPos2X + tf2._rotation[1] * p._localPos2Y + tf2._rotation[2] * p._localPos2Z;
				__tmp__Y1 = tf2._rotation[3] * p._localPos2X + tf2._rotation[4] * p._localPos2Y + tf2._rotation[5] * p._localPos2Z;
				__tmp__Z1 = tf2._rotation[6] * p._localPos2X + tf2._rotation[7] * p._localPos2Y + tf2._rotation[8] * p._localPos2Z;
				p._relPos2X = __tmp__X1;
				p._relPos2Y = __tmp__Y1;
				p._relPos2Z = __tmp__Z1;
				p._pos1X = p._relPos1X + tf1._position[0];
				p._pos1Y = p._relPos1Y + tf1._position[1];
				p._pos1Z = p._relPos1Z + tf1._position[2];
				p._pos2X = p._relPos2X + tf2._position[0];
				p._pos2Y = p._relPos2Y + tf2._position[1];
				p._pos2Z = p._relPos2Z + tf2._position[2];
				var diff;
				var diffX;
				var diffY;
				var diffZ;
				diffX = p._pos1X - p._pos2X;
				diffY = p._pos1Y - p._pos2Y;
				diffZ = p._pos1Z - p._pos2Z;
				var dotN = diffX * this._normalX + diffY * this._normalY + diffZ * this._normalZ;
				p._depth = -dotN;
			}
		}

		proto.getNormal = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._normalX;
			v1[1] = this._normalY;
			v1[2] = this._normalZ;
			return v;
		}

		proto.getNormalTo = function (normal) {
			var v = normal;
			v[0] = this._normalX;
			v[1] = this._normalY;
			v[2] = this._normalZ;
		}

		proto.getTangent = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._tangentX;
			v1[1] = this._tangentY;
			v1[2] = this._tangentZ;
			return v;
		}

		proto.getTangentTo = function (tangent) {
			var v = tangent;
			v[0] = this._tangentX;
			v[1] = this._tangentY;
			v[2] = this._tangentZ;
		}

		proto.getBinormal = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._binormalX;
			v1[1] = this._binormalY;
			v1[2] = this._binormalZ;
			return v;
		}

		proto.getBinormalTo = function (binormal) {
			var v = binormal;
			v[0] = this._binormalX;
			v[1] = this._binormalY;
			v[2] = this._binormalZ;
		}

		proto.getPoints = function () {
			return this._points;
		}

		proto.getNumPoints = function () {
			return this._numPoints;
		}

		var Manifold = function () {
			this._normalX = 0;
			this._normalY = 0;
			this._normalZ = 0;
			this._tangentX = 0;
			this._tangentY = 0;
			this._tangentZ = 0;
			this._binormalX = 0;
			this._binormalY = 0;
			this._binormalZ = 0;
			this._numPoints = 0;
			var length = pe.common.Setting.maxManifoldPoints;
			var this1 = new Array(length);
			this._points = this1;
			var _g1 = 0;
			var _g = pe.common.Setting.maxManifoldPoints;
			while (_g1 < _g) {
				var i = _g1++;
				this._points[i] = new dynamics.constraint.contact.ManifoldPoint();
			}
		}
		return Manifold;
	});

	dynamics.constraint.contact.ManifoldPoint = pe.define(function (proto) {
		proto.getPosition1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._pos1X;
			v1[1] = this._pos1Y;
			v1[2] = this._pos1Z;
			return v;
		}

		proto.getPosition1To = function (position) {
			var v = position;
			v[0] = this._pos1X;
			v[1] = this._pos1Y;
			v[2] = this._pos1Z;
		}

		proto.getPosition2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._pos2X;
			v1[1] = this._pos2Y;
			v1[2] = this._pos2Z;
			return v;
		}

		proto.getPosition2To = function (position) {
			var v = position;
			v[0] = this._pos2X;
			v[1] = this._pos2Y;
			v[2] = this._pos2Z;
		}

		proto.getDepth = function () {
			return this._depth;
		}

		proto.isWarmStarted = function () {
			return this._warmStarted;
		}

		proto.getNormalImpulse = function () {
			return this._impulse.impulseN;
		}

		proto.getTangentImpulse = function () {
			return this._impulse.impulseT;
		}

		proto.getBinormalImpulse = function () {
			return this._impulse.impulseB;
		}

		proto.isEnabled = function () {
			return !this._disabled;
		}

		var ManifoldPoint = function () {
			this._localPos1X = 0;
			this._localPos1Y = 0;
			this._localPos1Z = 0;
			this._localPos2X = 0;
			this._localPos2Y = 0;
			this._localPos2Z = 0;
			this._relPos1X = 0;
			this._relPos1Y = 0;
			this._relPos1Z = 0;
			this._relPos2X = 0;
			this._relPos2Y = 0;
			this._relPos2Z = 0;
			this._pos1X = 0;
			this._pos1Y = 0;
			this._pos1Z = 0;
			this._pos2X = 0;
			this._pos2Y = 0;
			this._pos2Z = 0;
			this._depth = 0;
			this._impulse = new dynamics.constraint.contact.ContactImpulse();
			this._warmStarted = false;
			this._disabled = false;
			this._id = -1;
		}
		return ManifoldPoint;
	});

	dynamics.constraint.contact.ManifoldUpdater = pe.define(function (proto) {
		proto.removeOutdatedPoints = function () {
			var num = this._manifold._numPoints;
			var index = num;
			while (--index >= 0) {
				var p = this._manifold._points[index];
				var diff;
				var diffX;
				var diffY;
				var diffZ;
				diffX = p._pos1X - p._pos2X;
				diffY = p._pos1Y - p._pos2Y;
				diffZ = p._pos1Z - p._pos2Z;
				var dotN = this._manifold._normalX * diffX + this._manifold._normalY * diffY + this._manifold._normalZ * diffZ;
				if (dotN > pe.common.Setting.contactPersistenceThreshold) {
					this.removeManifoldPoint(index);
					continue;
				}
				diffX += this._manifold._normalX * -dotN;
				diffY += this._manifold._normalY * -dotN;
				diffZ += this._manifold._normalZ * -dotN;
				if (diffX * diffX + diffY * diffY + diffZ * diffZ > pe.common.Setting.contactPersistenceThreshold * pe.common.Setting.contactPersistenceThreshold) {
					this.removeManifoldPoint(index);
					continue;
				}
			}
		}

		proto.removeManifoldPoint = function (index) {
			var lastIndex = --this._manifold._numPoints;
			if (index != lastIndex) {
				var tmp = this._manifold._points[index];
				this._manifold._points[index] = this._manifold._points[lastIndex];
				this._manifold._points[lastIndex] = tmp;
			}
			var _this = this._manifold._points[lastIndex];
			_this._localPos1X = 0;
			_this._localPos1Y = 0;
			_this._localPos1Z = 0;
			_this._localPos2X = 0;
			_this._localPos2Y = 0;
			_this._localPos2Z = 0;
			_this._relPos1X = 0;
			_this._relPos1Y = 0;
			_this._relPos1Z = 0;
			_this._relPos2X = 0;
			_this._relPos2Y = 0;
			_this._relPos2Z = 0;
			_this._pos1X = 0;
			_this._pos1Y = 0;
			_this._pos1Z = 0;
			_this._pos2X = 0;
			_this._pos2Y = 0;
			_this._pos2Z = 0;
			_this._depth = 0;
			var _this1 = _this._impulse;
			_this1.impulseN = 0;
			_this1.impulseT = 0;
			_this1.impulseB = 0;
			_this1.impulseP = 0;
			_this1.impulseLX = 0;
			_this1.impulseLY = 0;
			_this1.impulseLZ = 0;
			_this._warmStarted = false;
			_this._disabled = false;
			_this._id = -1;
		}

		proto.addManifoldPoint = function (point, tf1, tf2) {
			var num = this._manifold._numPoints;
			if (num == pe.common.Setting.maxManifoldPoints) {
				var targetIndex = this.computeTargetIndex(point, tf1, tf2);
				var _this = this._manifold._points[targetIndex];
				var v = point.position1;
				_this._pos1X = v[0];
				_this._pos1Y = v[1];
				_this._pos1Z = v[2];
				var v1 = point.position2;
				_this._pos2X = v1[0];
				_this._pos2Y = v1[1];
				_this._pos2Z = v1[2];
				_this._relPos1X = _this._pos1X - tf1._position[0];
				_this._relPos1Y = _this._pos1Y - tf1._position[1];
				_this._relPos1Z = _this._pos1Z - tf1._position[2];
				_this._relPos2X = _this._pos2X - tf2._position[0];
				_this._relPos2Y = _this._pos2Y - tf2._position[1];
				_this._relPos2Z = _this._pos2Z - tf2._position[2];
				var __tmp__X;
				var __tmp__Y;
				var __tmp__Z;
				__tmp__X = tf1._rotation[0] * _this._relPos1X + tf1._rotation[3] * _this._relPos1Y + tf1._rotation[6] * _this._relPos1Z;
				__tmp__Y = tf1._rotation[1] * _this._relPos1X + tf1._rotation[4] * _this._relPos1Y + tf1._rotation[7] * _this._relPos1Z;
				__tmp__Z = tf1._rotation[2] * _this._relPos1X + tf1._rotation[5] * _this._relPos1Y + tf1._rotation[8] * _this._relPos1Z;
				_this._localPos1X = __tmp__X;
				_this._localPos1Y = __tmp__Y;
				_this._localPos1Z = __tmp__Z;
				var __tmp__X1;
				var __tmp__Y1;
				var __tmp__Z1;
				__tmp__X1 = tf2._rotation[0] * _this._relPos2X + tf2._rotation[3] * _this._relPos2Y + tf2._rotation[6] * _this._relPos2Z;
				__tmp__Y1 = tf2._rotation[1] * _this._relPos2X + tf2._rotation[4] * _this._relPos2Y + tf2._rotation[7] * _this._relPos2Z;
				__tmp__Z1 = tf2._rotation[2] * _this._relPos2X + tf2._rotation[5] * _this._relPos2Y + tf2._rotation[8] * _this._relPos2Z;
				_this._localPos2X = __tmp__X1;
				_this._localPos2Y = __tmp__Y1;
				_this._localPos2Z = __tmp__Z1;
				_this._depth = point.depth;
				var _this1 = _this._impulse;
				_this1.impulseN = 0;
				_this1.impulseT = 0;
				_this1.impulseB = 0;
				_this1.impulseP = 0;
				_this1.impulseLX = 0;
				_this1.impulseLY = 0;
				_this1.impulseLZ = 0;
				_this._id = point.id;
				_this._warmStarted = false;
				_this._disabled = false;
				return;
			}
			var _this2 = this._manifold._points[num];
			var v2 = point.position1;
			_this2._pos1X = v2[0];
			_this2._pos1Y = v2[1];
			_this2._pos1Z = v2[2];
			var v3 = point.position2;
			_this2._pos2X = v3[0];
			_this2._pos2Y = v3[1];
			_this2._pos2Z = v3[2];
			_this2._relPos1X = _this2._pos1X - tf1._position[0];
			_this2._relPos1Y = _this2._pos1Y - tf1._position[1];
			_this2._relPos1Z = _this2._pos1Z - tf1._position[2];
			_this2._relPos2X = _this2._pos2X - tf2._position[0];
			_this2._relPos2Y = _this2._pos2Y - tf2._position[1];
			_this2._relPos2Z = _this2._pos2Z - tf2._position[2];
			var __tmp__X2;
			var __tmp__Y2;
			var __tmp__Z2;
			__tmp__X2 = tf1._rotation[0] * _this2._relPos1X + tf1._rotation[3] * _this2._relPos1Y + tf1._rotation[6] * _this2._relPos1Z;
			__tmp__Y2 = tf1._rotation[1] * _this2._relPos1X + tf1._rotation[4] * _this2._relPos1Y + tf1._rotation[7] * _this2._relPos1Z;
			__tmp__Z2 = tf1._rotation[2] * _this2._relPos1X + tf1._rotation[5] * _this2._relPos1Y + tf1._rotation[8] * _this2._relPos1Z;
			_this2._localPos1X = __tmp__X2;
			_this2._localPos1Y = __tmp__Y2;
			_this2._localPos1Z = __tmp__Z2;
			var __tmp__X3;
			var __tmp__Y3;
			var __tmp__Z3;
			__tmp__X3 = tf2._rotation[0] * _this2._relPos2X + tf2._rotation[3] * _this2._relPos2Y + tf2._rotation[6] * _this2._relPos2Z;
			__tmp__Y3 = tf2._rotation[1] * _this2._relPos2X + tf2._rotation[4] * _this2._relPos2Y + tf2._rotation[7] * _this2._relPos2Z;
			__tmp__Z3 = tf2._rotation[2] * _this2._relPos2X + tf2._rotation[5] * _this2._relPos2Y + tf2._rotation[8] * _this2._relPos2Z;
			_this2._localPos2X = __tmp__X3;
			_this2._localPos2Y = __tmp__Y3;
			_this2._localPos2Z = __tmp__Z3;
			_this2._depth = point.depth;
			var _this3 = _this2._impulse;
			_this3.impulseN = 0;
			_this3.impulseT = 0;
			_this3.impulseB = 0;
			_this3.impulseP = 0;
			_this3.impulseLX = 0;
			_this3.impulseLY = 0;
			_this3.impulseLZ = 0;
			_this2._id = point.id;
			_this2._warmStarted = false;
			_this2._disabled = false;
			this._manifold._numPoints++;
		}

		proto.computeTargetIndex = function (newPoint, tf1, tf2) {
			var p1 = this._manifold._points[0];
			var p2 = this._manifold._points[1];
			var p3 = this._manifold._points[2];
			var p4 = this._manifold._points[3];
			var maxDepth = p1._depth;
			var maxDepthIndex = 0;
			if (p2._depth > maxDepth) {
				maxDepth = p2._depth;
				maxDepthIndex = 1;
			}
			if (p3._depth > maxDepth) {
				maxDepth = p3._depth;
				maxDepthIndex = 2;
			}
			if (p4._depth > maxDepth) {
				maxDepth = p4._depth;
				maxDepthIndex = 3;
			}
			var rp1;
			var rp1X;
			var rp1Y;
			var rp1Z;
			var v = newPoint.position1;
			rp1X = v[0];
			rp1Y = v[1];
			rp1Z = v[2];
			rp1X -= tf1._position[0];
			rp1Y -= tf1._position[1];
			rp1Z -= tf1._position[2];
			var p1X = p2._relPos1X;
			var p1Y = p2._relPos1Y;
			var p1Z = p2._relPos1Z;
			var p2X = p3._relPos1X;
			var p2Y = p3._relPos1Y;
			var p2Z = p3._relPos1Z;
			var p3X = p4._relPos1X;
			var p3Y = p4._relPos1Y;
			var p3Z = p4._relPos1Z;
			var v12;
			var v12X;
			var v12Y;
			var v12Z;
			var v34;
			var v34X;
			var v34Y;
			var v34Z;
			var v13;
			var v13X;
			var v13Y;
			var v13Z;
			var v24;
			var v24X;
			var v24Y;
			var v24Z;
			var v14;
			var v14X;
			var v14Y;
			var v14Z;
			var v23;
			var v23X;
			var v23Y;
			var v23Z;
			v12X = p2X - p1X;
			v12Y = p2Y - p1Y;
			v12Z = p2Z - p1Z;
			v34X = rp1X - p3X;
			v34Y = rp1Y - p3Y;
			v34Z = rp1Z - p3Z;
			v13X = p3X - p1X;
			v13Y = p3Y - p1Y;
			v13Z = p3Z - p1Z;
			v24X = rp1X - p2X;
			v24Y = rp1Y - p2Y;
			v24Z = rp1Z - p2Z;
			v14X = rp1X - p1X;
			v14Y = rp1Y - p1Y;
			v14Z = rp1Z - p1Z;
			v23X = p3X - p2X;
			v23Y = p3Y - p2Y;
			v23Z = p3Z - p2Z;
			var cross1;
			var cross1X;
			var cross1Y;
			var cross1Z;
			var cross2;
			var cross2X;
			var cross2Y;
			var cross2Z;
			var cross3;
			var cross3X;
			var cross3Y;
			var cross3Z;
			cross1X = v12Y * v34Z - v12Z * v34Y;
			cross1Y = v12Z * v34X - v12X * v34Z;
			cross1Z = v12X * v34Y - v12Y * v34X;
			cross2X = v13Y * v24Z - v13Z * v24Y;
			cross2Y = v13Z * v24X - v13X * v24Z;
			cross2Z = v13X * v24Y - v13Y * v24X;
			cross3X = v14Y * v23Z - v14Z * v23Y;
			cross3Y = v14Z * v23X - v14X * v23Z;
			cross3Z = v14X * v23Y - v14Y * v23X;
			var a1 = cross1X * cross1X + cross1Y * cross1Y + cross1Z * cross1Z;
			var a2 = cross2X * cross2X + cross2Y * cross2Y + cross2Z * cross2Z;
			var a3 = cross3X * cross3X + cross3Y * cross3Y + cross3Z * cross3Z;
			var a11 = a1 > a2 ? a1 > a3 ? a1 : a3 : a2 > a3 ? a2 : a3;
			var p1X1 = p1._relPos1X;
			var p1Y1 = p1._relPos1Y;
			var p1Z1 = p1._relPos1Z;
			var p2X1 = p3._relPos1X;
			var p2Y1 = p3._relPos1Y;
			var p2Z1 = p3._relPos1Z;
			var p3X1 = p4._relPos1X;
			var p3Y1 = p4._relPos1Y;
			var p3Z1 = p4._relPos1Z;
			var v121;
			var v12X1;
			var v12Y1;
			var v12Z1;
			var v341;
			var v34X1;
			var v34Y1;
			var v34Z1;
			var v131;
			var v13X1;
			var v13Y1;
			var v13Z1;
			var v241;
			var v24X1;
			var v24Y1;
			var v24Z1;
			var v141;
			var v14X1;
			var v14Y1;
			var v14Z1;
			var v231;
			var v23X1;
			var v23Y1;
			var v23Z1;
			v12X1 = p2X1 - p1X1;
			v12Y1 = p2Y1 - p1Y1;
			v12Z1 = p2Z1 - p1Z1;
			v34X1 = rp1X - p3X1;
			v34Y1 = rp1Y - p3Y1;
			v34Z1 = rp1Z - p3Z1;
			v13X1 = p3X1 - p1X1;
			v13Y1 = p3Y1 - p1Y1;
			v13Z1 = p3Z1 - p1Z1;
			v24X1 = rp1X - p2X1;
			v24Y1 = rp1Y - p2Y1;
			v24Z1 = rp1Z - p2Z1;
			v14X1 = rp1X - p1X1;
			v14Y1 = rp1Y - p1Y1;
			v14Z1 = rp1Z - p1Z1;
			v23X1 = p3X1 - p2X1;
			v23Y1 = p3Y1 - p2Y1;
			v23Z1 = p3Z1 - p2Z1;
			var cross11;
			var cross1X1;
			var cross1Y1;
			var cross1Z1;
			var cross21;
			var cross2X1;
			var cross2Y1;
			var cross2Z1;
			var cross31;
			var cross3X1;
			var cross3Y1;
			var cross3Z1;
			cross1X1 = v12Y1 * v34Z1 - v12Z1 * v34Y1;
			cross1Y1 = v12Z1 * v34X1 - v12X1 * v34Z1;
			cross1Z1 = v12X1 * v34Y1 - v12Y1 * v34X1;
			cross2X1 = v13Y1 * v24Z1 - v13Z1 * v24Y1;
			cross2Y1 = v13Z1 * v24X1 - v13X1 * v24Z1;
			cross2Z1 = v13X1 * v24Y1 - v13Y1 * v24X1;
			cross3X1 = v14Y1 * v23Z1 - v14Z1 * v23Y1;
			cross3Y1 = v14Z1 * v23X1 - v14X1 * v23Z1;
			cross3Z1 = v14X1 * v23Y1 - v14Y1 * v23X1;
			var a12 = cross1X1 * cross1X1 + cross1Y1 * cross1Y1 + cross1Z1 * cross1Z1;
			var a21 = cross2X1 * cross2X1 + cross2Y1 * cross2Y1 + cross2Z1 * cross2Z1;
			var a31 = cross3X1 * cross3X1 + cross3Y1 * cross3Y1 + cross3Z1 * cross3Z1;
			var a22 = a12 > a21 ? a12 > a31 ? a12 : a31 : a21 > a31 ? a21 : a31;
			var p1X2 = p1._relPos1X;
			var p1Y2 = p1._relPos1Y;
			var p1Z2 = p1._relPos1Z;
			var p2X2 = p2._relPos1X;
			var p2Y2 = p2._relPos1Y;
			var p2Z2 = p2._relPos1Z;
			var p3X2 = p4._relPos1X;
			var p3Y2 = p4._relPos1Y;
			var p3Z2 = p4._relPos1Z;
			var v122;
			var v12X2;
			var v12Y2;
			var v12Z2;
			var v342;
			var v34X2;
			var v34Y2;
			var v34Z2;
			var v132;
			var v13X2;
			var v13Y2;
			var v13Z2;
			var v242;
			var v24X2;
			var v24Y2;
			var v24Z2;
			var v142;
			var v14X2;
			var v14Y2;
			var v14Z2;
			var v232;
			var v23X2;
			var v23Y2;
			var v23Z2;
			v12X2 = p2X2 - p1X2;
			v12Y2 = p2Y2 - p1Y2;
			v12Z2 = p2Z2 - p1Z2;
			v34X2 = rp1X - p3X2;
			v34Y2 = rp1Y - p3Y2;
			v34Z2 = rp1Z - p3Z2;
			v13X2 = p3X2 - p1X2;
			v13Y2 = p3Y2 - p1Y2;
			v13Z2 = p3Z2 - p1Z2;
			v24X2 = rp1X - p2X2;
			v24Y2 = rp1Y - p2Y2;
			v24Z2 = rp1Z - p2Z2;
			v14X2 = rp1X - p1X2;
			v14Y2 = rp1Y - p1Y2;
			v14Z2 = rp1Z - p1Z2;
			v23X2 = p3X2 - p2X2;
			v23Y2 = p3Y2 - p2Y2;
			v23Z2 = p3Z2 - p2Z2;
			var cross12;
			var cross1X2;
			var cross1Y2;
			var cross1Z2;
			var cross22;
			var cross2X2;
			var cross2Y2;
			var cross2Z2;
			var cross32;
			var cross3X2;
			var cross3Y2;
			var cross3Z2;
			cross1X2 = v12Y2 * v34Z2 - v12Z2 * v34Y2;
			cross1Y2 = v12Z2 * v34X2 - v12X2 * v34Z2;
			cross1Z2 = v12X2 * v34Y2 - v12Y2 * v34X2;
			cross2X2 = v13Y2 * v24Z2 - v13Z2 * v24Y2;
			cross2Y2 = v13Z2 * v24X2 - v13X2 * v24Z2;
			cross2Z2 = v13X2 * v24Y2 - v13Y2 * v24X2;
			cross3X2 = v14Y2 * v23Z2 - v14Z2 * v23Y2;
			cross3Y2 = v14Z2 * v23X2 - v14X2 * v23Z2;
			cross3Z2 = v14X2 * v23Y2 - v14Y2 * v23X2;
			var a13 = cross1X2 * cross1X2 + cross1Y2 * cross1Y2 + cross1Z2 * cross1Z2;
			var a23 = cross2X2 * cross2X2 + cross2Y2 * cross2Y2 + cross2Z2 * cross2Z2;
			var a32 = cross3X2 * cross3X2 + cross3Y2 * cross3Y2 + cross3Z2 * cross3Z2;
			var a33 = a13 > a23 ? a13 > a32 ? a13 : a32 : a23 > a32 ? a23 : a32;
			var p1X3 = p1._relPos1X;
			var p1Y3 = p1._relPos1Y;
			var p1Z3 = p1._relPos1Z;
			var p2X3 = p2._relPos1X;
			var p2Y3 = p2._relPos1Y;
			var p2Z3 = p2._relPos1Z;
			var p3X3 = p3._relPos1X;
			var p3Y3 = p3._relPos1Y;
			var p3Z3 = p3._relPos1Z;
			var v123;
			var v12X3;
			var v12Y3;
			var v12Z3;
			var v343;
			var v34X3;
			var v34Y3;
			var v34Z3;
			var v133;
			var v13X3;
			var v13Y3;
			var v13Z3;
			var v243;
			var v24X3;
			var v24Y3;
			var v24Z3;
			var v143;
			var v14X3;
			var v14Y3;
			var v14Z3;
			var v233;
			var v23X3;
			var v23Y3;
			var v23Z3;
			v12X3 = p2X3 - p1X3;
			v12Y3 = p2Y3 - p1Y3;
			v12Z3 = p2Z3 - p1Z3;
			v34X3 = rp1X - p3X3;
			v34Y3 = rp1Y - p3Y3;
			v34Z3 = rp1Z - p3Z3;
			v13X3 = p3X3 - p1X3;
			v13Y3 = p3Y3 - p1Y3;
			v13Z3 = p3Z3 - p1Z3;
			v24X3 = rp1X - p2X3;
			v24Y3 = rp1Y - p2Y3;
			v24Z3 = rp1Z - p2Z3;
			v14X3 = rp1X - p1X3;
			v14Y3 = rp1Y - p1Y3;
			v14Z3 = rp1Z - p1Z3;
			v23X3 = p3X3 - p2X3;
			v23Y3 = p3Y3 - p2Y3;
			v23Z3 = p3Z3 - p2Z3;
			var cross13;
			var cross1X3;
			var cross1Y3;
			var cross1Z3;
			var cross23;
			var cross2X3;
			var cross2Y3;
			var cross2Z3;
			var cross33;
			var cross3X3;
			var cross3Y3;
			var cross3Z3;
			cross1X3 = v12Y3 * v34Z3 - v12Z3 * v34Y3;
			cross1Y3 = v12Z3 * v34X3 - v12X3 * v34Z3;
			cross1Z3 = v12X3 * v34Y3 - v12Y3 * v34X3;
			cross2X3 = v13Y3 * v24Z3 - v13Z3 * v24Y3;
			cross2Y3 = v13Z3 * v24X3 - v13X3 * v24Z3;
			cross2Z3 = v13X3 * v24Y3 - v13Y3 * v24X3;
			cross3X3 = v14Y3 * v23Z3 - v14Z3 * v23Y3;
			cross3Y3 = v14Z3 * v23X3 - v14X3 * v23Z3;
			cross3Z3 = v14X3 * v23Y3 - v14Y3 * v23X3;
			var a14 = cross1X3 * cross1X3 + cross1Y3 * cross1Y3 + cross1Z3 * cross1Z3;
			var a24 = cross2X3 * cross2X3 + cross2Y3 * cross2Y3 + cross2Z3 * cross2Z3;
			var a34 = cross3X3 * cross3X3 + cross3Y3 * cross3Y3 + cross3Z3 * cross3Z3;
			var a4 = a14 > a24 ? a14 > a34 ? a14 : a34 : a24 > a34 ? a24 : a34;
			var max = a11;
			var target = 0;
			if (a22 > max && maxDepthIndex != 1 || maxDepthIndex == 0) {
				max = a22;
				target = 1;
			}
			if (a33 > max && maxDepthIndex != 2) {
				max = a33;
				target = 2;
			}
			if (a4 > max && maxDepthIndex != 3) {
				max = a4;
				target = 3;
			}
			return target;
		}

		proto.computeRelativePositions = function (tf1, tf2) {
			var num = this._manifold._numPoints;
			var _g1 = 0;
			var _g = num;
			while (_g1 < _g) {
				var i = _g1++;
				var p = this._manifold._points[i];
				var __tmp__X;
				var __tmp__Y;
				var __tmp__Z;
				__tmp__X = tf1._rotation[0] * p._localPos1X + tf1._rotation[1] * p._localPos1Y + tf1._rotation[2] * p._localPos1Z;
				__tmp__Y = tf1._rotation[3] * p._localPos1X + tf1._rotation[4] * p._localPos1Y + tf1._rotation[5] * p._localPos1Z;
				__tmp__Z = tf1._rotation[6] * p._localPos1X + tf1._rotation[7] * p._localPos1Y + tf1._rotation[8] * p._localPos1Z;
				p._relPos1X = __tmp__X;
				p._relPos1Y = __tmp__Y;
				p._relPos1Z = __tmp__Z;
				var __tmp__X1;
				var __tmp__Y1;
				var __tmp__Z1;
				__tmp__X1 = tf2._rotation[0] * p._localPos2X + tf2._rotation[1] * p._localPos2Y + tf2._rotation[2] * p._localPos2Z;
				__tmp__Y1 = tf2._rotation[3] * p._localPos2X + tf2._rotation[4] * p._localPos2Y + tf2._rotation[5] * p._localPos2Z;
				__tmp__Z1 = tf2._rotation[6] * p._localPos2X + tf2._rotation[7] * p._localPos2Y + tf2._rotation[8] * p._localPos2Z;
				p._relPos2X = __tmp__X1;
				p._relPos2Y = __tmp__Y1;
				p._relPos2Z = __tmp__Z1;
				p._warmStarted = true;
			}
		}

		proto.findNearestContactPointIndex = function (target, tf1, tf2) {
			var nearestSq = pe.common.Setting.contactPersistenceThreshold * pe.common.Setting.contactPersistenceThreshold;
			var idx = -1;
			var _g1 = 0;
			var _g = this._manifold._numPoints;
			while (_g1 < _g) {
				var i = _g1++;
				var mp = this._manifold._points[i];
				var rp1;
				var rp1X;
				var rp1Y;
				var rp1Z;
				var rp2;
				var rp2X;
				var rp2Y;
				var rp2Z;
				var v = target.position1;
				rp1X = v[0];
				rp1Y = v[1];
				rp1Z = v[2];
				var v1 = target.position2;
				rp2X = v1[0];
				rp2Y = v1[1];
				rp2Z = v1[2];
				rp1X -= tf1._position[0];
				rp1Y -= tf1._position[1];
				rp1Z -= tf1._position[2];
				rp2X -= tf2._position[0];
				rp2Y -= tf2._position[1];
				rp2Z -= tf2._position[2];
				var diff1;
				var diff1X;
				var diff1Y;
				var diff1Z;
				var diff2;
				var diff2X;
				var diff2Y;
				var diff2Z;
				diff1X = mp._relPos1X - rp1X;
				diff1Y = mp._relPos1Y - rp1Y;
				diff1Z = mp._relPos1Z - rp1Z;
				diff2X = mp._relPos2X - rp2X;
				diff2Y = mp._relPos2Y - rp2Y;
				diff2Z = mp._relPos2Z - rp2Z;
				var sq1 = diff1X * diff1X + diff1Y * diff1Y + diff1Z * diff1Z;
				var sq2 = diff2X * diff2X + diff2Y * diff2Y + diff2Z * diff2Z;
				var d = sq1 < sq2 ? sq1 : sq2;
				if (d < nearestSq) {
					nearestSq = d;
					idx = i;
				}
			}
			return idx;
		}

		proto.totalUpdate = function (result, tf1, tf2) {
			this.numOldPoints = this._manifold._numPoints;
			var _g1 = 0;
			var _g = this.numOldPoints;
			while (_g1 < _g) {
				var i = _g1++;
				var _this = this.oldPoints[i];
				var cp = this._manifold._points[i];
				_this._localPos1X = cp._localPos1X;
				_this._localPos1Y = cp._localPos1Y;
				_this._localPos1Z = cp._localPos1Z;
				_this._localPos2X = cp._localPos2X;
				_this._localPos2Y = cp._localPos2Y;
				_this._localPos2Z = cp._localPos2Z;
				_this._relPos1X = cp._relPos1X;
				_this._relPos1Y = cp._relPos1Y;
				_this._relPos1Z = cp._relPos1Z;
				_this._relPos2X = cp._relPos2X;
				_this._relPos2Y = cp._relPos2Y;
				_this._relPos2Z = cp._relPos2Z;
				_this._pos1X = cp._pos1X;
				_this._pos1Y = cp._pos1Y;
				_this._pos1Z = cp._pos1Z;
				_this._pos2X = cp._pos2X;
				_this._pos2Y = cp._pos2Y;
				_this._pos2Z = cp._pos2Z;
				_this._depth = cp._depth;
				_this._impulse.copyFrom(cp._impulse);
				_this._id = cp._id;
				_this._warmStarted = cp._warmStarted;
				_this._disabled = false;
			}
			var num = result.numPoints;
			this._manifold._numPoints = num;
			var _g11 = 0;
			var _g2 = num;
			while (_g11 < _g2) {
				var i1 = _g11++;
				var p = this._manifold._points[i1];
				var ref = result.points[i1];
				var v = ref.position1;
				p._pos1X = v[0];
				p._pos1Y = v[1];
				p._pos1Z = v[2];
				var v1 = ref.position2;
				p._pos2X = v1[0];
				p._pos2Y = v1[1];
				p._pos2Z = v1[2];
				p._relPos1X = p._pos1X - tf1._position[0];
				p._relPos1Y = p._pos1Y - tf1._position[1];
				p._relPos1Z = p._pos1Z - tf1._position[2];
				p._relPos2X = p._pos2X - tf2._position[0];
				p._relPos2Y = p._pos2Y - tf2._position[1];
				p._relPos2Z = p._pos2Z - tf2._position[2];
				var __tmp__X;
				var __tmp__Y;
				var __tmp__Z;
				__tmp__X = tf1._rotation[0] * p._relPos1X + tf1._rotation[3] * p._relPos1Y + tf1._rotation[6] * p._relPos1Z;
				__tmp__Y = tf1._rotation[1] * p._relPos1X + tf1._rotation[4] * p._relPos1Y + tf1._rotation[7] * p._relPos1Z;
				__tmp__Z = tf1._rotation[2] * p._relPos1X + tf1._rotation[5] * p._relPos1Y + tf1._rotation[8] * p._relPos1Z;
				p._localPos1X = __tmp__X;
				p._localPos1Y = __tmp__Y;
				p._localPos1Z = __tmp__Z;
				var __tmp__X1;
				var __tmp__Y1;
				var __tmp__Z1;
				__tmp__X1 = tf2._rotation[0] * p._relPos2X + tf2._rotation[3] * p._relPos2Y + tf2._rotation[6] * p._relPos2Z;
				__tmp__Y1 = tf2._rotation[1] * p._relPos2X + tf2._rotation[4] * p._relPos2Y + tf2._rotation[7] * p._relPos2Z;
				__tmp__Z1 = tf2._rotation[2] * p._relPos2X + tf2._rotation[5] * p._relPos2Y + tf2._rotation[8] * p._relPos2Z;
				p._localPos2X = __tmp__X1;
				p._localPos2Y = __tmp__Y1;
				p._localPos2Z = __tmp__Z1;
				p._depth = ref.depth;
				var _this1 = p._impulse;
				_this1.impulseN = 0;
				_this1.impulseT = 0;
				_this1.impulseB = 0;
				_this1.impulseP = 0;
				_this1.impulseLX = 0;
				_this1.impulseLY = 0;
				_this1.impulseLZ = 0;
				p._id = ref.id;
				p._warmStarted = false;
				p._disabled = false;
				var _g12 = 0;
				var _g3 = this.numOldPoints;
				while (_g12 < _g3) {
					var i2 = _g12++;
					var ocp = this.oldPoints[i2];
					if (p._id == ocp._id) {
						p._impulse.copyFrom(ocp._impulse);
						p._warmStarted = true;
						break;
					}
				}
			}
		}

		proto.incrementalUpdate = function (result, tf1, tf2) {
			this._manifold._updateDepthsAndPositions(tf1, tf2);
			var _g1 = 0;
			var _g = this._manifold._numPoints;
			while (_g1 < _g) {
				var i = _g1++;
				this._manifold._points[i]._warmStarted = true;
			}
			var newPoint = result.points[0];
			var index = this.findNearestContactPointIndex(newPoint, tf1, tf2);
			if (index == -1) {
				this.addManifoldPoint(newPoint, tf1, tf2);
			} else {
				var cp = this._manifold._points[index];
				var v = newPoint.position1;
				cp._pos1X = v[0];
				cp._pos1Y = v[1];
				cp._pos1Z = v[2];
				var v1 = newPoint.position2;
				cp._pos2X = v1[0];
				cp._pos2Y = v1[1];
				cp._pos2Z = v1[2];
				cp._relPos1X = cp._pos1X - tf1._position[0];
				cp._relPos1Y = cp._pos1Y - tf1._position[1];
				cp._relPos1Z = cp._pos1Z - tf1._position[2];
				cp._relPos2X = cp._pos2X - tf2._position[0];
				cp._relPos2Y = cp._pos2Y - tf2._position[1];
				cp._relPos2Z = cp._pos2Z - tf2._position[2];
				var __tmp__X;
				var __tmp__Y;
				var __tmp__Z;
				__tmp__X = tf1._rotation[0] * cp._relPos1X + tf1._rotation[3] * cp._relPos1Y + tf1._rotation[6] * cp._relPos1Z;
				__tmp__Y = tf1._rotation[1] * cp._relPos1X + tf1._rotation[4] * cp._relPos1Y + tf1._rotation[7] * cp._relPos1Z;
				__tmp__Z = tf1._rotation[2] * cp._relPos1X + tf1._rotation[5] * cp._relPos1Y + tf1._rotation[8] * cp._relPos1Z;
				cp._localPos1X = __tmp__X;
				cp._localPos1Y = __tmp__Y;
				cp._localPos1Z = __tmp__Z;
				var __tmp__X1;
				var __tmp__Y1;
				var __tmp__Z1;
				__tmp__X1 = tf2._rotation[0] * cp._relPos2X + tf2._rotation[3] * cp._relPos2Y + tf2._rotation[6] * cp._relPos2Z;
				__tmp__Y1 = tf2._rotation[1] * cp._relPos2X + tf2._rotation[4] * cp._relPos2Y + tf2._rotation[7] * cp._relPos2Z;
				__tmp__Z1 = tf2._rotation[2] * cp._relPos2X + tf2._rotation[5] * cp._relPos2Y + tf2._rotation[8] * cp._relPos2Z;
				cp._localPos2X = __tmp__X1;
				cp._localPos2Y = __tmp__Y1;
				cp._localPos2Z = __tmp__Z1;
				cp._depth = newPoint.depth;
			}
			this.removeOutdatedPoints();
		}

		var ManifoldUpdater = function (manifold) {
			this._manifold = manifold;
			this.numOldPoints = 0;
			var length = pe.common.Setting.maxManifoldPoints;
			var this1 = new Array(length);
			this.oldPoints = this1;
			var _g1 = 0;
			var _g = pe.common.Setting.maxManifoldPoints;
			while (_g1 < _g) {
				var i = _g1++;
				this.oldPoints[i] = new dynamics.constraint.contact.ManifoldPoint();
			}
		}
		return ManifoldUpdater;
	});

	dynamics.constraint.info.JacobianRow = pe.define(function (proto) {
		proto.updateSparsity = function () {
			this.flag = 0;
			if (!(this.lin1X == 0 && this.lin1Y == 0 && this.lin1Z == 0) || !(this.lin2X == 0 && this.lin2Y == 0 && this.lin2Z == 0)) {
				this.flag |= 1;
			}
			if (!(this.ang1X == 0 && this.ang1Y == 0 && this.ang1Z == 0) || !(this.ang2X == 0 && this.ang2Y == 0 && this.ang2Z == 0)) {
				this.flag |= 2;
			}
		}

		var JacobianRow = function () {
			this.lin1X = 0;
			this.lin1Y = 0;
			this.lin1Z = 0;
			this.lin2X = 0;
			this.lin2Y = 0;
			this.lin2Z = 0;
			this.ang1X = 0;
			this.ang1Y = 0;
			this.ang1Z = 0;
			this.ang2X = 0;
			this.ang2Y = 0;
			this.ang2Z = 0;
			this.flag = 0;
		}

		JacobianRow.BIT_LINEAR_SET = 1;
		JacobianRow.BIT_ANGULAR_SET = 2;

		return JacobianRow;
	});

	dynamics.constraint.joint.Joint = pe.define(function (proto) {
		proto._syncAnchors = function () {
			var tf1 = this._b1._transform;
			var tf2 = this._b2._transform;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = tf1._rotation[0] * this._localAnchor1X + tf1._rotation[1] * this._localAnchor1Y + tf1._rotation[2] * this._localAnchor1Z;
			__tmp__Y = tf1._rotation[3] * this._localAnchor1X + tf1._rotation[4] * this._localAnchor1Y + tf1._rotation[5] * this._localAnchor1Z;
			__tmp__Z = tf1._rotation[6] * this._localAnchor1X + tf1._rotation[7] * this._localAnchor1Y + tf1._rotation[8] * this._localAnchor1Z;
			this._relativeAnchor1X = __tmp__X;
			this._relativeAnchor1Y = __tmp__Y;
			this._relativeAnchor1Z = __tmp__Z;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = tf2._rotation[0] * this._localAnchor2X + tf2._rotation[1] * this._localAnchor2Y + tf2._rotation[2] * this._localAnchor2Z;
			__tmp__Y1 = tf2._rotation[3] * this._localAnchor2X + tf2._rotation[4] * this._localAnchor2Y + tf2._rotation[5] * this._localAnchor2Z;
			__tmp__Z1 = tf2._rotation[6] * this._localAnchor2X + tf2._rotation[7] * this._localAnchor2Y + tf2._rotation[8] * this._localAnchor2Z;
			this._relativeAnchor2X = __tmp__X1;
			this._relativeAnchor2Y = __tmp__Y1;
			this._relativeAnchor2Z = __tmp__Z1;
			this._anchor1X = this._relativeAnchor1X + tf1._position[0];
			this._anchor1Y = this._relativeAnchor1Y + tf1._position[1];
			this._anchor1Z = this._relativeAnchor1Z + tf1._position[2];
			this._anchor2X = this._relativeAnchor2X + tf2._position[0];
			this._anchor2Y = this._relativeAnchor2Y + tf2._position[1];
			this._anchor2Z = this._relativeAnchor2Z + tf2._position[2];
			var __tmp__X2;
			var __tmp__Y2;
			var __tmp__Z2;
			__tmp__X2 = tf1._rotation[0] * this._localBasisX1X + tf1._rotation[1] * this._localBasisX1Y + tf1._rotation[2] * this._localBasisX1Z;
			__tmp__Y2 = tf1._rotation[3] * this._localBasisX1X + tf1._rotation[4] * this._localBasisX1Y + tf1._rotation[5] * this._localBasisX1Z;
			__tmp__Z2 = tf1._rotation[6] * this._localBasisX1X + tf1._rotation[7] * this._localBasisX1Y + tf1._rotation[8] * this._localBasisX1Z;
			this._basisX1X = __tmp__X2;
			this._basisX1Y = __tmp__Y2;
			this._basisX1Z = __tmp__Z2;
			var __tmp__X3;
			var __tmp__Y3;
			var __tmp__Z3;
			__tmp__X3 = tf1._rotation[0] * this._localBasisY1X + tf1._rotation[1] * this._localBasisY1Y + tf1._rotation[2] * this._localBasisY1Z;
			__tmp__Y3 = tf1._rotation[3] * this._localBasisY1X + tf1._rotation[4] * this._localBasisY1Y + tf1._rotation[5] * this._localBasisY1Z;
			__tmp__Z3 = tf1._rotation[6] * this._localBasisY1X + tf1._rotation[7] * this._localBasisY1Y + tf1._rotation[8] * this._localBasisY1Z;
			this._basisY1X = __tmp__X3;
			this._basisY1Y = __tmp__Y3;
			this._basisY1Z = __tmp__Z3;
			var __tmp__X4;
			var __tmp__Y4;
			var __tmp__Z4;
			__tmp__X4 = tf1._rotation[0] * this._localBasisZ1X + tf1._rotation[1] * this._localBasisZ1Y + tf1._rotation[2] * this._localBasisZ1Z;
			__tmp__Y4 = tf1._rotation[3] * this._localBasisZ1X + tf1._rotation[4] * this._localBasisZ1Y + tf1._rotation[5] * this._localBasisZ1Z;
			__tmp__Z4 = tf1._rotation[6] * this._localBasisZ1X + tf1._rotation[7] * this._localBasisZ1Y + tf1._rotation[8] * this._localBasisZ1Z;
			this._basisZ1X = __tmp__X4;
			this._basisZ1Y = __tmp__Y4;
			this._basisZ1Z = __tmp__Z4;
			var __tmp__X5;
			var __tmp__Y5;
			var __tmp__Z5;
			__tmp__X5 = tf2._rotation[0] * this._localBasisX2X + tf2._rotation[1] * this._localBasisX2Y + tf2._rotation[2] * this._localBasisX2Z;
			__tmp__Y5 = tf2._rotation[3] * this._localBasisX2X + tf2._rotation[4] * this._localBasisX2Y + tf2._rotation[5] * this._localBasisX2Z;
			__tmp__Z5 = tf2._rotation[6] * this._localBasisX2X + tf2._rotation[7] * this._localBasisX2Y + tf2._rotation[8] * this._localBasisX2Z;
			this._basisX2X = __tmp__X5;
			this._basisX2Y = __tmp__Y5;
			this._basisX2Z = __tmp__Z5;
			var __tmp__X6;
			var __tmp__Y6;
			var __tmp__Z6;
			__tmp__X6 = tf2._rotation[0] * this._localBasisY2X + tf2._rotation[1] * this._localBasisY2Y + tf2._rotation[2] * this._localBasisY2Z;
			__tmp__Y6 = tf2._rotation[3] * this._localBasisY2X + tf2._rotation[4] * this._localBasisY2Y + tf2._rotation[5] * this._localBasisY2Z;
			__tmp__Z6 = tf2._rotation[6] * this._localBasisY2X + tf2._rotation[7] * this._localBasisY2Y + tf2._rotation[8] * this._localBasisY2Z;
			this._basisY2X = __tmp__X6;
			this._basisY2Y = __tmp__Y6;
			this._basisY2Z = __tmp__Z6;
			var __tmp__X7;
			var __tmp__Y7;
			var __tmp__Z7;
			__tmp__X7 = tf2._rotation[0] * this._localBasisZ2X + tf2._rotation[1] * this._localBasisZ2Y + tf2._rotation[2] * this._localBasisZ2Z;
			__tmp__Y7 = tf2._rotation[3] * this._localBasisZ2X + tf2._rotation[4] * this._localBasisZ2Y + tf2._rotation[5] * this._localBasisZ2Z;
			__tmp__Z7 = tf2._rotation[6] * this._localBasisZ2X + tf2._rotation[7] * this._localBasisZ2Y + tf2._rotation[8] * this._localBasisZ2Z;
			this._basisZ2X = __tmp__X7;
			this._basisZ2Y = __tmp__Y7;
			this._basisZ2Z = __tmp__Z7;
		}

		proto._getVelocitySolverInfo = function (timeStep, info) {
			info.b1 = this._b1;
			info.b2 = this._b2;
			info.numRows = 0;
		}

		proto._getPositionSolverInfo = function (info) {
			info.b1 = this._b1;
			info.b2 = this._b2;
			info.numRows = 0;
		}

		proto._checkDestruction = function () {
			var forceSq = this._appliedForceX * this._appliedForceX + this._appliedForceY * this._appliedForceY + this._appliedForceZ * this._appliedForceZ;
			var torqueSq = this._appliedTorqueX * this._appliedTorqueX + this._appliedTorqueY * this._appliedTorqueY + this._appliedTorqueZ * this._appliedTorqueZ;
			if (this._breakForce > 0 && forceSq > this._breakForce * this._breakForce) {
				this._world.removeJoint(this);
				return;
			}
			if (this._breakTorque > 0 && torqueSq > this._breakTorque * this._breakTorque) {
				this._world.removeJoint(this);
				return;
			}
		}

		proto.getRigidBody1 = function () {
			return this._b1;
		}

		proto.getRigidBody2 = function () {
			return this._b2;
		}

		proto.getType = function () {
			return this._type;
		}

		proto.getAnchor1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._anchor1X;
			v1[1] = this._anchor1Y;
			v1[2] = this._anchor1Z;
			return v;
		}

		proto.getAnchor2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._anchor2X;
			v1[1] = this._anchor2Y;
			v1[2] = this._anchor2Z;
			return v;
		}

		proto.getAnchor1To = function (anchor) {
			var v = anchor;
			v[0] = this._anchor1X;
			v[1] = this._anchor1Y;
			v[2] = this._anchor1Z;
		}

		proto.getAnchor2To = function (anchor) {
			var v = anchor;
			v[0] = this._anchor2X;
			v[1] = this._anchor2Y;
			v[2] = this._anchor2Z;
		}

		proto.getLocalAnchor1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localAnchor1X;
			v1[1] = this._localAnchor1Y;
			v1[2] = this._localAnchor1Z;
			return v;
		}

		proto.getLocalAnchor2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localAnchor2X;
			v1[1] = this._localAnchor2Y;
			v1[2] = this._localAnchor2Z;
			return v;
		}

		proto.getLocalAnchor1To = function (localAnchor) {
			var v = localAnchor;
			v[0] = this._localAnchor1X;
			v[1] = this._localAnchor1Y;
			v[2] = this._localAnchor1Z;
		}

		proto.getLocalAnchor2To = function (localAnchor) {
			var v = localAnchor;
			v[0] = this._localAnchor2X;
			v[1] = this._localAnchor2Y;
			v[2] = this._localAnchor2Z;
		}

		proto.getAllowCollision = function () {
			return this._allowCollision;
		}

		proto.setAllowCollision = function (allowCollision) {
			this._allowCollision = allowCollision;
		}

		proto.getBreakForce = function () {
			return this._breakForce;
		}

		proto.setBreakForce = function (breakForce) {
			this._breakForce = breakForce;
		}

		proto.getBreakTorque = function () {
			return this._breakTorque;
		}

		proto.setBreakTorque = function (breakTorque) {
			this._breakTorque = breakTorque;
		}

		proto.getPositionCorrectionAlgorithm = function () {
			return this._positionCorrectionAlgorithm;
		}

		proto.setPositionCorrectionAlgorithm = function (positionCorrectionAlgorithm) {
			switch (positionCorrectionAlgorithm) {
				case 0: case 1: case 2:
					break;
				default:
					throw new Error("invalid position correction algorithm id: " + positionCorrectionAlgorithm);
			}
			this._positionCorrectionAlgorithm = positionCorrectionAlgorithm;
		}

		proto.getAppliedForce = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._appliedForceX;
			v1[1] = this._appliedForceY;
			v1[2] = this._appliedForceZ;
			return v;
		}

		proto.getAppliedForceTo = function (appliedForce) {
			var v = appliedForce;
			v[0] = this._appliedForceX;
			v[1] = this._appliedForceY;
			v[2] = this._appliedForceZ;
		}

		proto.getAppliedTorque = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._appliedTorqueX;
			v1[1] = this._appliedTorqueY;
			v1[2] = this._appliedTorqueZ;
			return v;
		}

		proto.getAppliedTorqueTo = function (appliedTorque) {
			var v = appliedTorque;
			v[0] = this._appliedTorqueX;
			v[1] = this._appliedTorqueY;
			v[2] = this._appliedTorqueZ;
		}

		proto.getPrev = function () {
			return this._prev;
		}

		proto.getNext = function () {
			return this._next;
		}

		var Joint = function (config, type) {
			this._link1 = new dynamics.constraint.joint.JointLink(this);
			this._link2 = new dynamics.constraint.joint.JointLink(this);
			this._positionCorrectionAlgorithm = pe.common.Setting.defaultJointPositionCorrectionAlgorithm;
			this._type = type;
			this._world = null;
			this._b1 = config.rigidBody1;
			this._b2 = config.rigidBody2;
			this._allowCollision = config.allowCollision;
			this._breakForce = config.breakForce;
			this._breakTorque = config.breakTorque;
			var _g = config.solverType;
			switch (_g) {
				case 0:
					this._solver = new dynamics.constraint.solver.pgs.PgsJointConstraintSolver(this);
					break;
				case 1:
					this._solver = new dynamics.constraint.solver.direct.DirectJointConstraintSolver(this);
					break;
			}
			var v = config.localAnchor1;
			this._localAnchor1X = v[0];
			this._localAnchor1Y = v[1];
			this._localAnchor1Z = v[2];
			var v1 = config.localAnchor2;
			this._localAnchor2X = v1[0];
			this._localAnchor2Y = v1[1];
			this._localAnchor2Z = v1[2];
			this._relativeAnchor1X = 0;
			this._relativeAnchor1Y = 0;
			this._relativeAnchor1Z = 0;
			this._relativeAnchor2X = 0;
			this._relativeAnchor2Y = 0;
			this._relativeAnchor2Z = 0;
			this._anchor1X = 0;
			this._anchor1Y = 0;
			this._anchor1Z = 0;
			this._anchor2X = 0;
			this._anchor2Y = 0;
			this._anchor2Z = 0;
			this._localBasisX1X = 0;
			this._localBasisX1Y = 0;
			this._localBasisX1Z = 0;
			this._localBasisY1X = 0;
			this._localBasisY1Y = 0;
			this._localBasisY1Z = 0;
			this._localBasisZ1X = 0;
			this._localBasisZ1Y = 0;
			this._localBasisZ1Z = 0;
			this._localBasisX2X = 0;
			this._localBasisX2Y = 0;
			this._localBasisX2Z = 0;
			this._localBasisY2X = 0;
			this._localBasisY2Y = 0;
			this._localBasisY2Z = 0;
			this._localBasisZ2X = 0;
			this._localBasisZ2Y = 0;
			this._localBasisZ2Z = 0;
			var length = pe.common.Setting.maxJacobianRows;
			var this1 = new Array(length);
			this._impulses = this1;
			var _g2 = 0;
			var _g1 = pe.common.Setting.maxJacobianRows;
			while (_g2 < _g1) {
				var i = _g2++;
				this._impulses[i] = new dynamics.constraint.joint.JointImpulse();
			}
		}
		return Joint;
	});

	dynamics.constraint.joint.CylindricalJoint = pe.define(function (proto) {
		proto.getInfo = function (info, timeStep, isPositionPart) {
			var erp = isPositionPart ? 1 : this._positionCorrectionAlgorithm == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? timeStep.invDt * pe.common.Setting.velocityBaumgarte : 0;
			var linRhsY = this.linearErrorY * erp;
			var linRhsZ = this.linearErrorZ * erp;
			var angRhsY = this.angularErrorY * erp;
			var angRhsZ = this.angularErrorZ * erp;
			var crossR1;
			var crossR100;
			var crossR101;
			var crossR102;
			var crossR110;
			var crossR111;
			var crossR112;
			var crossR120;
			var crossR121;
			var crossR122;
			var crossR2;
			var crossR200;
			var crossR201;
			var crossR202;
			var crossR210;
			var crossR211;
			var crossR212;
			var crossR220;
			var crossR221;
			var crossR222;
			crossR100 = 0;
			crossR101 = -this._relativeAnchor1Z;
			crossR102 = this._relativeAnchor1Y;
			crossR110 = this._relativeAnchor1Z;
			crossR111 = 0;
			crossR112 = -this._relativeAnchor1X;
			crossR120 = -this._relativeAnchor1Y;
			crossR121 = this._relativeAnchor1X;
			crossR122 = 0;
			crossR200 = 0;
			crossR201 = -this._relativeAnchor2Z;
			crossR202 = this._relativeAnchor2Y;
			crossR210 = this._relativeAnchor2Z;
			crossR211 = 0;
			crossR212 = -this._relativeAnchor2X;
			crossR220 = -this._relativeAnchor2Y;
			crossR221 = this._relativeAnchor2X;
			crossR222 = 0;
			crossR100 = -crossR100;
			crossR101 = -crossR101;
			crossR102 = -crossR102;
			crossR110 = -crossR110;
			crossR111 = -crossR111;
			crossR112 = -crossR112;
			crossR120 = -crossR120;
			crossR121 = -crossR121;
			crossR122 = -crossR122;
			crossR200 = -crossR200;
			crossR201 = -crossR201;
			crossR202 = -crossR202;
			crossR210 = -crossR210;
			crossR211 = -crossR211;
			crossR212 = -crossR212;
			crossR220 = -crossR220;
			crossR221 = -crossR221;
			crossR222 = -crossR222;
			var row;
			var j;
			var translationalMotorMass = 1 / (this._b1._invMass + this._b2._invMass);
			var axisX = this._basis.xX;
			var axisY = this._basis.xY;
			var axisZ = this._basis.xZ;
			var ia1;
			var ia1X;
			var ia1Y;
			var ia1Z;
			var ia2;
			var ia2X;
			var ia2Y;
			var ia2Z;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = this._b1._invInertia[0] * axisX + this._b1._invInertia[1] * axisY + this._b1._invInertia[2] * axisZ;
			__tmp__Y = this._b1._invInertia[3] * axisX + this._b1._invInertia[4] * axisY + this._b1._invInertia[5] * axisZ;
			__tmp__Z = this._b1._invInertia[6] * axisX + this._b1._invInertia[7] * axisY + this._b1._invInertia[8] * axisZ;
			ia1X = __tmp__X;
			ia1Y = __tmp__Y;
			ia1Z = __tmp__Z;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = this._b2._invInertia[0] * axisX + this._b2._invInertia[1] * axisY + this._b2._invInertia[2] * axisZ;
			__tmp__Y1 = this._b2._invInertia[3] * axisX + this._b2._invInertia[4] * axisY + this._b2._invInertia[5] * axisZ;
			__tmp__Z1 = this._b2._invInertia[6] * axisX + this._b2._invInertia[7] * axisY + this._b2._invInertia[8] * axisZ;
			ia2X = __tmp__X1;
			ia2Y = __tmp__Y1;
			ia2Z = __tmp__Z1;
			var invI1 = ia1X * axisX + ia1Y * axisY + ia1Z * axisZ;
			var invI2 = ia2X * axisX + ia2Y * axisY + ia2Z * axisZ;
			if (invI1 > 0) {
				var rsq = this._relativeAnchor1X * this._relativeAnchor1X + this._relativeAnchor1Y * this._relativeAnchor1Y + this._relativeAnchor1Z * this._relativeAnchor1Z;
				var dot = axisX * this._relativeAnchor1X + axisY * this._relativeAnchor1Y + axisZ * this._relativeAnchor1Z;
				var projsq = rsq - dot * dot;
				if (projsq > 0) {
					if (this._b1._invMass > 0) {
						invI1 = 1 / (1 / invI1 + this._b1._mass * projsq);
					} else {
						invI1 = 0;
					}
				}
			}
			if (invI2 > 0) {
				var rsq1 = this._relativeAnchor2X * this._relativeAnchor2X + this._relativeAnchor2Y * this._relativeAnchor2Y + this._relativeAnchor2Z * this._relativeAnchor2Z;
				var dot1 = axisX * this._relativeAnchor2X + axisY * this._relativeAnchor2Y + axisZ * this._relativeAnchor2Z;
				var projsq1 = rsq1 - dot1 * dot1;
				if (projsq1 > 0) {
					if (this._b2._invMass > 0) {
						invI2 = 1 / (1 / invI2 + this._b2._mass * projsq1);
					} else {
						invI2 = 0;
					}
				}
			}
			var rotationalMotorMass = invI1 + invI2 == 0 ? 0 : 1 / (invI1 + invI2);
			if (this._translSd.frequency <= 0 || !isPositionPart) {
				var impulse = this._impulses[0];
				var row1 = info.rows[info.numRows++];
				var _this = row1.jacobian;
				_this.lin1X = 0;
				_this.lin1Y = 0;
				_this.lin1Z = 0;
				_this.lin2X = 0;
				_this.lin2Y = 0;
				_this.lin2Z = 0;
				_this.ang1X = 0;
				_this.ang1Y = 0;
				_this.ang1Z = 0;
				_this.ang2X = 0;
				_this.ang2Y = 0;
				_this.ang2Z = 0;
				row1.rhs = 0;
				row1.cfm = 0;
				row1.minImpulse = 0;
				row1.maxImpulse = 0;
				row1.motorSpeed = 0;
				row1.motorMaxImpulse = 0;
				row1.impulse = null;
				row1.impulse = impulse;
				row = row1;
				var diff = this.translation;
				var lm = this._translLm;
				var sd = this._translSd;
				var cfmFactor;
				var erp1;
				var slop = pe.common.Setting.linearSlop;
				if (isPositionPart) {
					cfmFactor = 0;
					erp1 = 1;
				} else {
					if (sd.frequency > 0) {
						slop = 0;
						var omega = 6.28318530717958 * sd.frequency;
						var zeta = sd.dampingRatio;
						if (zeta < pe.common.Setting.minSpringDamperDampingRatio) {
							zeta = pe.common.Setting.minSpringDamperDampingRatio;
						}
						var h = timeStep.dt;
						var c = 2 * zeta * omega;
						var k = omega * omega;
						if (sd.useSymplecticEuler) {
							cfmFactor = 1 / (h * c);
							erp1 = k / c;
						} else {
							cfmFactor = 1 / (h * (h * k + c));
							erp1 = k / (h * k + c);
						}
					} else {
						cfmFactor = 0;
						erp1 = this._positionCorrectionAlgorithm == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? timeStep.invDt * pe.common.Setting.velocityBaumgarte : 0;
					}
					if (lm.motorForce > 0) {
						row.motorSpeed = lm.motorSpeed;
						row.motorMaxImpulse = lm.motorForce * timeStep.dt;
					} else {
						row.motorSpeed = 0;
						row.motorMaxImpulse = 0;
					}
				}
				var lower = lm.lowerLimit;
				var upper = lm.upperLimit;
				var minImp;
				var maxImp;
				var error;
				if (lower > upper) {
					minImp = 0;
					maxImp = 0;
					error = 0;
				} else if (lower == upper) {
					minImp = -1.0 / 0.0;
					maxImp = 1.0 / 0.0;
					error = diff - lower;
				} else if (diff < lower) {
					minImp = -1.0 / 0.0;
					maxImp = 0;
					error = diff - lower + slop;
					if (error > 0) {
						error = 0;
					}
				} else if (diff > upper) {
					minImp = 0;
					maxImp = 1.0 / 0.0;
					error = diff - upper - slop;
					if (error < 0) {
						error = 0;
					}
				} else {
					minImp = 0;
					maxImp = 0;
					error = 0;
				}
				var invMass = translationalMotorMass == 0 ? 0 : 1 / translationalMotorMass;
				row.minImpulse = minImp;
				row.maxImpulse = maxImp;
				row.cfm = cfmFactor * invMass;
				row.rhs = error * erp1;
				j = row.jacobian;
				j.lin1X = this._basis.xX;
				j.lin1Y = this._basis.xY;
				j.lin1Z = this._basis.xZ;
				j.lin2X = this._basis.xX;
				j.lin2Y = this._basis.xY;
				j.lin2Z = this._basis.xZ;
				j.ang1X = crossR100;
				j.ang1Y = crossR101;
				j.ang1Z = crossR102;
				j.ang2X = crossR200;
				j.ang2Y = crossR201;
				j.ang2Z = crossR202;
			}
			var impulse1 = this._impulses[1];
			var row2 = info.rows[info.numRows++];
			var _this1 = row2.jacobian;
			_this1.lin1X = 0;
			_this1.lin1Y = 0;
			_this1.lin1Z = 0;
			_this1.lin2X = 0;
			_this1.lin2Y = 0;
			_this1.lin2Z = 0;
			_this1.ang1X = 0;
			_this1.ang1Y = 0;
			_this1.ang1Z = 0;
			_this1.ang2X = 0;
			_this1.ang2Y = 0;
			_this1.ang2Z = 0;
			row2.rhs = 0;
			row2.cfm = 0;
			row2.minImpulse = 0;
			row2.maxImpulse = 0;
			row2.motorSpeed = 0;
			row2.motorMaxImpulse = 0;
			row2.impulse = null;
			row2.impulse = impulse1;
			row = row2;
			row.rhs = linRhsY;
			row.cfm = 0;
			row.minImpulse = -1.0 / 0.0;
			row.maxImpulse = 1.0 / 0.0;
			j = row.jacobian;
			j.lin1X = this._basis.yX;
			j.lin1Y = this._basis.yY;
			j.lin1Z = this._basis.yZ;
			j.lin2X = this._basis.yX;
			j.lin2Y = this._basis.yY;
			j.lin2Z = this._basis.yZ;
			j.ang1X = crossR110;
			j.ang1Y = crossR111;
			j.ang1Z = crossR112;
			j.ang2X = crossR210;
			j.ang2Y = crossR211;
			j.ang2Z = crossR212;
			var impulse2 = this._impulses[2];
			var row3 = info.rows[info.numRows++];
			var _this2 = row3.jacobian;
			_this2.lin1X = 0;
			_this2.lin1Y = 0;
			_this2.lin1Z = 0;
			_this2.lin2X = 0;
			_this2.lin2Y = 0;
			_this2.lin2Z = 0;
			_this2.ang1X = 0;
			_this2.ang1Y = 0;
			_this2.ang1Z = 0;
			_this2.ang2X = 0;
			_this2.ang2Y = 0;
			_this2.ang2Z = 0;
			row3.rhs = 0;
			row3.cfm = 0;
			row3.minImpulse = 0;
			row3.maxImpulse = 0;
			row3.motorSpeed = 0;
			row3.motorMaxImpulse = 0;
			row3.impulse = null;
			row3.impulse = impulse2;
			row = row3;
			row.rhs = linRhsZ;
			row.cfm = 0;
			row.minImpulse = -1.0 / 0.0;
			row.maxImpulse = 1.0 / 0.0;
			j = row.jacobian;
			j.lin1X = this._basis.zX;
			j.lin1Y = this._basis.zY;
			j.lin1Z = this._basis.zZ;
			j.lin2X = this._basis.zX;
			j.lin2Y = this._basis.zY;
			j.lin2Z = this._basis.zZ;
			j.ang1X = crossR120;
			j.ang1Y = crossR121;
			j.ang1Z = crossR122;
			j.ang2X = crossR220;
			j.ang2Y = crossR221;
			j.ang2Z = crossR222;
			if (this._rotSd.frequency <= 0 || !isPositionPart) {
				var impulse3 = this._impulses[3];
				var row4 = info.rows[info.numRows++];
				var _this3 = row4.jacobian;
				_this3.lin1X = 0;
				_this3.lin1Y = 0;
				_this3.lin1Z = 0;
				_this3.lin2X = 0;
				_this3.lin2Y = 0;
				_this3.lin2Z = 0;
				_this3.ang1X = 0;
				_this3.ang1Y = 0;
				_this3.ang1Z = 0;
				_this3.ang2X = 0;
				_this3.ang2Y = 0;
				_this3.ang2Z = 0;
				row4.rhs = 0;
				row4.cfm = 0;
				row4.minImpulse = 0;
				row4.maxImpulse = 0;
				row4.motorSpeed = 0;
				row4.motorMaxImpulse = 0;
				row4.impulse = null;
				row4.impulse = impulse3;
				row = row4;
				var diff1 = this.angle;
				var lm1 = this._rotLm;
				var sd1 = this._rotSd;
				var cfmFactor1;
				var erp2;
				var slop1 = pe.common.Setting.angularSlop;
				if (isPositionPart) {
					cfmFactor1 = 0;
					erp2 = 1;
				} else {
					if (sd1.frequency > 0) {
						slop1 = 0;
						var omega1 = 6.28318530717958 * sd1.frequency;
						var zeta1 = sd1.dampingRatio;
						if (zeta1 < pe.common.Setting.minSpringDamperDampingRatio) {
							zeta1 = pe.common.Setting.minSpringDamperDampingRatio;
						}
						var h1 = timeStep.dt;
						var c1 = 2 * zeta1 * omega1;
						var k1 = omega1 * omega1;
						if (sd1.useSymplecticEuler) {
							cfmFactor1 = 1 / (h1 * c1);
							erp2 = k1 / c1;
						} else {
							cfmFactor1 = 1 / (h1 * (h1 * k1 + c1));
							erp2 = k1 / (h1 * k1 + c1);
						}
					} else {
						cfmFactor1 = 0;
						erp2 = this._positionCorrectionAlgorithm == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? timeStep.invDt * pe.common.Setting.velocityBaumgarte : 0;
					}
					if (lm1.motorTorque > 0) {
						row.motorSpeed = lm1.motorSpeed;
						row.motorMaxImpulse = lm1.motorTorque * timeStep.dt;
					} else {
						row.motorSpeed = 0;
						row.motorMaxImpulse = 0;
					}
				}
				var lower1 = lm1.lowerLimit;
				var upper1 = lm1.upperLimit;
				var mid = (lower1 + upper1) * 0.5;
				diff1 -= mid;
				diff1 = ((diff1 + 3.14159265358979) % 6.28318530717958 + 6.28318530717958) % 6.28318530717958 - 3.14159265358979;
				diff1 += mid;
				var minImp1;
				var maxImp1;
				var error1;
				if (lower1 > upper1) {
					minImp1 = 0;
					maxImp1 = 0;
					error1 = 0;
				} else if (lower1 == upper1) {
					minImp1 = -1.0 / 0.0;
					maxImp1 = 1.0 / 0.0;
					error1 = diff1 - lower1;
				} else if (diff1 < lower1) {
					minImp1 = -1.0 / 0.0;
					maxImp1 = 0;
					error1 = diff1 - lower1 + slop1;
					if (error1 > 0) {
						error1 = 0;
					}
				} else if (diff1 > upper1) {
					minImp1 = 0;
					maxImp1 = 1.0 / 0.0;
					error1 = diff1 - upper1 - slop1;
					if (error1 < 0) {
						error1 = 0;
					}
				} else {
					minImp1 = 0;
					maxImp1 = 0;
					error1 = 0;
				}
				var invMass1 = rotationalMotorMass == 0 ? 0 : 1 / rotationalMotorMass;
				row.minImpulse = minImp1;
				row.maxImpulse = maxImp1;
				row.cfm = cfmFactor1 * invMass1;
				row.rhs = error1 * erp2;
				j = row.jacobian;
				j.ang1X = this._basis.xX;
				j.ang1Y = this._basis.xY;
				j.ang1Z = this._basis.xZ;
				j.ang2X = this._basis.xX;
				j.ang2Y = this._basis.xY;
				j.ang2Z = this._basis.xZ;
			}
			var impulse4 = this._impulses[4];
			var row5 = info.rows[info.numRows++];
			var _this4 = row5.jacobian;
			_this4.lin1X = 0;
			_this4.lin1Y = 0;
			_this4.lin1Z = 0;
			_this4.lin2X = 0;
			_this4.lin2Y = 0;
			_this4.lin2Z = 0;
			_this4.ang1X = 0;
			_this4.ang1Y = 0;
			_this4.ang1Z = 0;
			_this4.ang2X = 0;
			_this4.ang2Y = 0;
			_this4.ang2Z = 0;
			row5.rhs = 0;
			row5.cfm = 0;
			row5.minImpulse = 0;
			row5.maxImpulse = 0;
			row5.motorSpeed = 0;
			row5.motorMaxImpulse = 0;
			row5.impulse = null;
			row5.impulse = impulse4;
			row = row5;
			row.rhs = angRhsY;
			row.cfm = 0;
			row.minImpulse = -1.0 / 0.0;
			row.maxImpulse = 1.0 / 0.0;
			j = row.jacobian;
			j.ang1X = this._basis.yX;
			j.ang1Y = this._basis.yY;
			j.ang1Z = this._basis.yZ;
			j.ang2X = this._basis.yX;
			j.ang2Y = this._basis.yY;
			j.ang2Z = this._basis.yZ;
			var impulse5 = this._impulses[5];
			var row6 = info.rows[info.numRows++];
			var _this5 = row6.jacobian;
			_this5.lin1X = 0;
			_this5.lin1Y = 0;
			_this5.lin1Z = 0;
			_this5.lin2X = 0;
			_this5.lin2Y = 0;
			_this5.lin2Z = 0;
			_this5.ang1X = 0;
			_this5.ang1Y = 0;
			_this5.ang1Z = 0;
			_this5.ang2X = 0;
			_this5.ang2Y = 0;
			_this5.ang2Z = 0;
			row6.rhs = 0;
			row6.cfm = 0;
			row6.minImpulse = 0;
			row6.maxImpulse = 0;
			row6.motorSpeed = 0;
			row6.motorMaxImpulse = 0;
			row6.impulse = null;
			row6.impulse = impulse5;
			row = row6;
			row.rhs = angRhsZ;
			row.cfm = 0;
			row.minImpulse = -1.0 / 0.0;
			row.maxImpulse = 1.0 / 0.0;
			j = row.jacobian;
			j.ang1X = this._basis.zX;
			j.ang1Y = this._basis.zY;
			j.ang1Z = this._basis.zZ;
			j.ang2X = this._basis.zX;
			j.ang2Y = this._basis.zY;
			j.ang2Z = this._basis.zZ;
		}

		proto._syncAnchors = function () {
			dynamics.constraint.joint.Joint.prototype._syncAnchors.call(this);
			var _this = this._basis;
			var invM1 = _this.joint._b1._invMass;
			var invM2 = _this.joint._b2._invMass;
			var q;
			var qX;
			var qY;
			var qZ;
			var qW;
			var idQ;
			var idQX;
			var idQY;
			var idQZ;
			var idQW;
			var slerpQ;
			var slerpQX;
			var slerpQY;
			var slerpQZ;
			var slerpQW;
			var slerpM;
			var slerpM00;
			var slerpM01;
			var slerpM02;
			var slerpM10;
			var slerpM11;
			var slerpM12;
			var slerpM20;
			var slerpM21;
			var slerpM22;
			var newX;
			var newXX;
			var newXY;
			var newXZ;
			var newY;
			var newYX;
			var newYY;
			var newYZ;
			var newZ;
			var newZX;
			var newZY;
			var newZZ;
			var prevX;
			var prevXX;
			var prevXY;
			var prevXZ;
			var prevY;
			var prevYX;
			var prevYY;
			var prevYZ;
			var d = _this.joint._basisX1X * _this.joint._basisX2X + _this.joint._basisX1Y * _this.joint._basisX2Y + _this.joint._basisX1Z * _this.joint._basisX2Z;
			if (d < -0.999999999) {
				var vX;
				var vY;
				var vZ;
				var x1 = _this.joint._basisX1X;
				var y1 = _this.joint._basisX1Y;
				var z1 = _this.joint._basisX1Z;
				var x2 = x1 * x1;
				var y2 = y1 * y1;
				var z2 = z1 * z1;
				var d1;
				if (x2 < y2) {
					if (x2 < z2) {
						d1 = 1 / Math.sqrt(y2 + z2);
						vX = 0;
						vY = z1 * d1;
						vZ = -y1 * d1;
					} else {
						d1 = 1 / Math.sqrt(x2 + y2);
						vX = y1 * d1;
						vY = -x1 * d1;
						vZ = 0;
					}
				} else if (y2 < z2) {
					d1 = 1 / Math.sqrt(z2 + x2);
					vX = -z1 * d1;
					vY = 0;
					vZ = x1 * d1;
				} else {
					d1 = 1 / Math.sqrt(x2 + y2);
					vX = y1 * d1;
					vY = -x1 * d1;
					vZ = 0;
				}
				qX = vX;
				qY = vY;
				qZ = vZ;
				qW = 0;
			} else {
				var cX;
				var cY;
				var cZ;
				cX = _this.joint._basisX1Y * _this.joint._basisX2Z - _this.joint._basisX1Z * _this.joint._basisX2Y;
				cY = _this.joint._basisX1Z * _this.joint._basisX2X - _this.joint._basisX1X * _this.joint._basisX2Z;
				cZ = _this.joint._basisX1X * _this.joint._basisX2Y - _this.joint._basisX1Y * _this.joint._basisX2X;
				var w = Math.sqrt((1 + d) * 0.5);
				d = 0.5 / w;
				cX *= d;
				cY *= d;
				cZ *= d;
				qX = cX;
				qY = cY;
				qZ = cZ;
				qW = w;
			}
			idQX = 0;
			idQY = 0;
			idQZ = 0;
			idQW = 1;
			var qx;
			var qy;
			var qz;
			var qw;
			var q1X;
			var q1Y;
			var q1Z;
			var q1W;
			var q2X;
			var q2Y;
			var q2Z;
			var q2W;
			q1X = idQX;
			q1Y = idQY;
			q1Z = idQZ;
			q1W = idQW;
			q2X = qX;
			q2Y = qY;
			q2Z = qZ;
			q2W = qW;
			var d2 = q1X * q2X + q1Y * q2Y + q1Z * q2Z + q1W * q2W;
			if (d2 < 0) {
				d2 = -d2;
				q2X = -q2X;
				q2Y = -q2Y;
				q2Z = -q2Z;
				q2W = -q2W;
			}
			if (d2 > 0.999999) {
				var dqX;
				var dqY;
				var dqZ;
				var dqW;
				dqX = q2X - q1X;
				dqY = q2Y - q1Y;
				dqZ = q2Z - q1Z;
				dqW = q2W - q1W;
				q2X = q1X + dqX * (invM1 / (invM1 + invM2));
				q2Y = q1Y + dqY * (invM1 / (invM1 + invM2));
				q2Z = q1Z + dqZ * (invM1 / (invM1 + invM2));
				q2W = q1W + dqW * (invM1 / (invM1 + invM2));
				var l = q2X * q2X + q2Y * q2Y + q2Z * q2Z + q2W * q2W;
				if (l > 1e-32) {
					l = 1 / Math.sqrt(l);
				}
				slerpQX = q2X * l;
				slerpQY = q2Y * l;
				slerpQZ = q2Z * l;
				slerpQW = q2W * l;
			} else {
				var theta = invM1 / (invM1 + invM2) * Math.acos(d2);
				q2X += q1X * -d2;
				q2Y += q1Y * -d2;
				q2Z += q1Z * -d2;
				q2W += q1W * -d2;
				var l1 = q2X * q2X + q2Y * q2Y + q2Z * q2Z + q2W * q2W;
				if (l1 > 1e-32) {
					l1 = 1 / Math.sqrt(l1);
				}
				q2X *= l1;
				q2Y *= l1;
				q2Z *= l1;
				q2W *= l1;
				var sin = Math.sin(theta);
				var cos = Math.cos(theta);
				q1X *= cos;
				q1Y *= cos;
				q1Z *= cos;
				q1W *= cos;
				slerpQX = q1X + q2X * sin;
				slerpQY = q1Y + q2Y * sin;
				slerpQZ = q1Z + q2Z * sin;
				slerpQW = q1W + q2W * sin;
			}
			var x = slerpQX;
			var y = slerpQY;
			var z = slerpQZ;
			var w1 = slerpQW;
			var x21 = 2 * x;
			var y21 = 2 * y;
			var z21 = 2 * z;
			var xx = x * x21;
			var yy = y * y21;
			var zz = z * z21;
			var xy = x * y21;
			var yz = y * z21;
			var xz = x * z21;
			var wx = w1 * x21;
			var wy = w1 * y21;
			var wz = w1 * z21;
			slerpM00 = 1 - yy - zz;
			slerpM01 = xy - wz;
			slerpM02 = xz + wy;
			slerpM10 = xy + wz;
			slerpM11 = 1 - xx - zz;
			slerpM12 = yz - wx;
			slerpM20 = xz - wy;
			slerpM21 = yz + wx;
			slerpM22 = 1 - xx - yy;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = slerpM00 * _this.joint._basisX1X + slerpM01 * _this.joint._basisX1Y + slerpM02 * _this.joint._basisX1Z;
			__tmp__Y = slerpM10 * _this.joint._basisX1X + slerpM11 * _this.joint._basisX1Y + slerpM12 * _this.joint._basisX1Z;
			__tmp__Z = slerpM20 * _this.joint._basisX1X + slerpM21 * _this.joint._basisX1Y + slerpM22 * _this.joint._basisX1Z;
			newXX = __tmp__X;
			newXY = __tmp__Y;
			newXZ = __tmp__Z;
			prevXX = _this.xX;
			prevXY = _this.xY;
			prevXZ = _this.xZ;
			prevYX = _this.yX;
			prevYY = _this.yY;
			prevYZ = _this.yZ;
			var d3 = prevXX * newXX + prevXY * newXY + prevXZ * newXZ;
			if (d3 < -0.999999999) {
				var vX1;
				var vY1;
				var vZ1;
				var x11 = prevXX;
				var y11 = prevXY;
				var z11 = prevXZ;
				var x22 = x11 * x11;
				var y22 = y11 * y11;
				var z22 = z11 * z11;
				var d4;
				if (x22 < y22) {
					if (x22 < z22) {
						d4 = 1 / Math.sqrt(y22 + z22);
						vX1 = 0;
						vY1 = z11 * d4;
						vZ1 = -y11 * d4;
					} else {
						d4 = 1 / Math.sqrt(x22 + y22);
						vX1 = y11 * d4;
						vY1 = -x11 * d4;
						vZ1 = 0;
					}
				} else if (y22 < z22) {
					d4 = 1 / Math.sqrt(z22 + x22);
					vX1 = -z11 * d4;
					vY1 = 0;
					vZ1 = x11 * d4;
				} else {
					d4 = 1 / Math.sqrt(x22 + y22);
					vX1 = y11 * d4;
					vY1 = -x11 * d4;
					vZ1 = 0;
				}
				slerpQX = vX1;
				slerpQY = vY1;
				slerpQZ = vZ1;
				slerpQW = 0;
			} else {
				var cX1;
				var cY1;
				var cZ1;
				cX1 = prevXY * newXZ - prevXZ * newXY;
				cY1 = prevXZ * newXX - prevXX * newXZ;
				cZ1 = prevXX * newXY - prevXY * newXX;
				var w2 = Math.sqrt((1 + d3) * 0.5);
				d3 = 0.5 / w2;
				cX1 *= d3;
				cY1 *= d3;
				cZ1 *= d3;
				slerpQX = cX1;
				slerpQY = cY1;
				slerpQZ = cZ1;
				slerpQW = w2;
			}
			var x3 = slerpQX;
			var y3 = slerpQY;
			var z3 = slerpQZ;
			var w3 = slerpQW;
			var x23 = 2 * x3;
			var y23 = 2 * y3;
			var z23 = 2 * z3;
			var xx1 = x3 * x23;
			var yy1 = y3 * y23;
			var zz1 = z3 * z23;
			var xy1 = x3 * y23;
			var yz1 = y3 * z23;
			var xz1 = x3 * z23;
			var wx1 = w3 * x23;
			var wy1 = w3 * y23;
			var wz1 = w3 * z23;
			slerpM00 = 1 - yy1 - zz1;
			slerpM01 = xy1 - wz1;
			slerpM02 = xz1 + wy1;
			slerpM10 = xy1 + wz1;
			slerpM11 = 1 - xx1 - zz1;
			slerpM12 = yz1 - wx1;
			slerpM20 = xz1 - wy1;
			slerpM21 = yz1 + wx1;
			slerpM22 = 1 - xx1 - yy1;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = slerpM00 * prevYX + slerpM01 * prevYY + slerpM02 * prevYZ;
			__tmp__Y1 = slerpM10 * prevYX + slerpM11 * prevYY + slerpM12 * prevYZ;
			__tmp__Z1 = slerpM20 * prevYX + slerpM21 * prevYY + slerpM22 * prevYZ;
			newYX = __tmp__X1;
			newYY = __tmp__Y1;
			newYZ = __tmp__Z1;
			newZX = newXY * newYZ - newXZ * newYY;
			newZY = newXZ * newYX - newXX * newYZ;
			newZZ = newXX * newYY - newXY * newYX;
			if (newZX * newZX + newZY * newZY + newZZ * newZZ > 1e-6) {
				var l2 = newZX * newZX + newZY * newZY + newZZ * newZZ;
				if (l2 > 0) {
					l2 = 1 / Math.sqrt(l2);
				}
				newZX *= l2;
				newZY *= l2;
				newZZ *= l2;
			} else {
				var x12 = newXX;
				var y12 = newXY;
				var z12 = newXZ;
				var x24 = x12 * x12;
				var y24 = y12 * y12;
				var z24 = z12 * z12;
				var d5;
				if (x24 < y24) {
					if (x24 < z24) {
						d5 = 1 / Math.sqrt(y24 + z24);
						newZX = 0;
						newZY = z12 * d5;
						newZZ = -y12 * d5;
					} else {
						d5 = 1 / Math.sqrt(x24 + y24);
						newZX = y12 * d5;
						newZY = -x12 * d5;
						newZZ = 0;
					}
				} else if (y24 < z24) {
					d5 = 1 / Math.sqrt(z24 + x24);
					newZX = -z12 * d5;
					newZY = 0;
					newZZ = x12 * d5;
				} else {
					d5 = 1 / Math.sqrt(x24 + y24);
					newZX = y12 * d5;
					newZY = -x12 * d5;
					newZZ = 0;
				}
			}
			newYX = newZY * newXZ - newZZ * newXY;
			newYY = newZZ * newXX - newZX * newXZ;
			newYZ = newZX * newXY - newZY * newXX;
			_this.xX = newXX;
			_this.xY = newXY;
			_this.xZ = newXZ;
			_this.yX = newYX;
			_this.yY = newYY;
			_this.yZ = newYZ;
			_this.zX = newZX;
			_this.zY = newZY;
			_this.zZ = newZZ;
			var angError;
			var angErrorX;
			var angErrorY;
			var angErrorZ;
			angErrorX = this._basisX1Y * this._basisX2Z - this._basisX1Z * this._basisX2Y;
			angErrorY = this._basisX1Z * this._basisX2X - this._basisX1X * this._basisX2Z;
			angErrorZ = this._basisX1X * this._basisX2Y - this._basisX1Y * this._basisX2X;
			var cos1 = this._basisX1X * this._basisX2X + this._basisX1Y * this._basisX2Y + this._basisX1Z * this._basisX2Z;
			var theta1 = cos1 <= -1 ? 3.14159265358979 : cos1 >= 1 ? 0 : Math.acos(cos1);
			var l3 = angErrorX * angErrorX + angErrorY * angErrorY + angErrorZ * angErrorZ;
			if (l3 > 0) {
				l3 = 1 / Math.sqrt(l3);
			}
			angErrorX *= l3;
			angErrorY *= l3;
			angErrorZ *= l3;
			angErrorX *= theta1;
			angErrorY *= theta1;
			angErrorZ *= theta1;
			this.angularErrorY = angErrorX * this._basis.yX + angErrorY * this._basis.yY + angErrorZ * this._basis.yZ;
			this.angularErrorZ = angErrorX * this._basis.zX + angErrorY * this._basis.zY + angErrorZ * this._basis.zZ;
			var perpCross;
			var perpCrossX;
			var perpCrossY;
			var perpCrossZ;
			perpCrossX = this._basisY1Y * this._basisY2Z - this._basisY1Z * this._basisY2Y;
			perpCrossY = this._basisY1Z * this._basisY2X - this._basisY1X * this._basisY2Z;
			perpCrossZ = this._basisY1X * this._basisY2Y - this._basisY1Y * this._basisY2X;
			cos1 = this._basisY1X * this._basisY2X + this._basisY1Y * this._basisY2Y + this._basisY1Z * this._basisY2Z;
			this.angle = cos1 <= -1 ? 3.14159265358979 : cos1 >= 1 ? 0 : Math.acos(cos1);
			if (perpCrossX * this._basis.xX + perpCrossY * this._basis.xY + perpCrossZ * this._basis.xZ < 0) {
				this.angle = -this.angle;
			}
			var anchorDiff;
			var anchorDiffX;
			var anchorDiffY;
			var anchorDiffZ;
			anchorDiffX = this._anchor2X - this._anchor1X;
			anchorDiffY = this._anchor2Y - this._anchor1Y;
			anchorDiffZ = this._anchor2Z - this._anchor1Z;
			this.translation = anchorDiffX * this._basis.xX + anchorDiffY * this._basis.xY + anchorDiffZ * this._basis.xZ;
			this.linearErrorY = anchorDiffX * this._basis.yX + anchorDiffY * this._basis.yY + anchorDiffZ * this._basis.yZ;
			this.linearErrorZ = anchorDiffX * this._basis.zX + anchorDiffY * this._basis.zY + anchorDiffZ * this._basis.zZ;
		}

		proto._getVelocitySolverInfo = function (timeStep, info) {
			dynamics.constraint.joint.Joint.prototype._getVelocitySolverInfo.call(this, timeStep, info);
			this.getInfo(info, timeStep, false);
		}

		proto._getPositionSolverInfo = function (info) {
			dynamics.constraint.joint.Joint.prototype._getPositionSolverInfo.call(this, info);
			this.getInfo(info, null, true);
		}

		proto.getAxis1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._basisX1X;
			v1[1] = this._basisX1Y;
			v1[2] = this._basisX1Z;
			return v;
		}

		proto.getAxis2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._basisX2X;
			v1[1] = this._basisX2Y;
			v1[2] = this._basisX2Z;
			return v;
		}

		proto.getAxis1To = function (axis) {
			var v = axis;
			v[0] = this._basisX1X;
			v[1] = this._basisX1Y;
			v[2] = this._basisX1Z;
		}

		proto.getAxis2To = function (axis) {
			var v = axis;
			v[0] = this._basisX2X;
			v[1] = this._basisX2Y;
			v[2] = this._basisX2Z;
		}

		proto.getLocalAxis1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localBasisX1X;
			v1[1] = this._localBasisX1Y;
			v1[2] = this._localBasisX1Z;
			return v;
		}

		proto.getLocalAxis2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localBasisX2X;
			v1[1] = this._localBasisX2Y;
			v1[2] = this._localBasisX2Z;
			return v;
		}

		proto.getLocalAxis1To = function (axis) {
			var v = axis;
			v[0] = this._localBasisX1X;
			v[1] = this._localBasisX1Y;
			v[2] = this._localBasisX1Z;
		}

		proto.getLocalAxis2To = function (axis) {
			var v = axis;
			v[0] = this._localBasisX2X;
			v[1] = this._localBasisX2Y;
			v[2] = this._localBasisX2Z;
		}

		proto.getTranslationalSpringDamper = function () {
			return this._translSd;
		}

		proto.getRotationalSpringDamper = function () {
			return this._rotSd;
		}

		proto.getTranslationalLimitMotor = function () {
			return this._translLm;
		}

		proto.getRotationalLimitMotor = function () {
			return this._rotLm;
		}

		proto.getAngle = function () {
			return this.angle;
		}

		proto.getTranslation = function () {
			return this.translation;
		}

		proto._checkDestruction = function () {
			var forceSq = this._appliedForceX * this._appliedForceX + this._appliedForceY * this._appliedForceY + this._appliedForceZ * this._appliedForceZ;
			var torqueSq = this._appliedTorqueX * this._appliedTorqueX + this._appliedTorqueY * this._appliedTorqueY + this._appliedTorqueZ * this._appliedTorqueZ;
			if (this._breakForce > 0 && forceSq > this._breakForce * this._breakForce) {
				this._world.removeJoint(this);
				return;
			}
			if (this._breakTorque > 0 && torqueSq > this._breakTorque * this._breakTorque) {
				this._world.removeJoint(this);
				return;
			}
		}

		proto.getRigidBody1 = function () {
			return this._b1;
		}

		proto.getRigidBody2 = function () {
			return this._b2;
		}

		proto.getType = function () {
			return this._type;
		}

		proto.getAnchor1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._anchor1X;
			v1[1] = this._anchor1Y;
			v1[2] = this._anchor1Z;
			return v;
		}

		proto.getAnchor2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._anchor2X;
			v1[1] = this._anchor2Y;
			v1[2] = this._anchor2Z;
			return v;
		}

		proto.getAnchor1To = function (anchor) {
			var v = anchor;
			v[0] = this._anchor1X;
			v[1] = this._anchor1Y;
			v[2] = this._anchor1Z;
		}

		proto.getAnchor2To = function (anchor) {
			var v = anchor;
			v[0] = this._anchor2X;
			v[1] = this._anchor2Y;
			v[2] = this._anchor2Z;
		}

		proto.getLocalAnchor1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localAnchor1X;
			v1[1] = this._localAnchor1Y;
			v1[2] = this._localAnchor1Z;
			return v;
		}

		proto.getLocalAnchor2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localAnchor2X;
			v1[1] = this._localAnchor2Y;
			v1[2] = this._localAnchor2Z;
			return v;
		}

		proto.getLocalAnchor1To = function (localAnchor) {
			var v = localAnchor;
			v[0] = this._localAnchor1X;
			v[1] = this._localAnchor1Y;
			v[2] = this._localAnchor1Z;
		}

		proto.getLocalAnchor2To = function (localAnchor) {
			var v = localAnchor;
			v[0] = this._localAnchor2X;
			v[1] = this._localAnchor2Y;
			v[2] = this._localAnchor2Z;
		}

		proto.getAllowCollision = function () {
			return this._allowCollision;
		}

		proto.setAllowCollision = function (allowCollision) {
			this._allowCollision = allowCollision;
		}

		proto.getBreakForce = function () {
			return this._breakForce;
		}

		proto.setBreakForce = function (breakForce) {
			this._breakForce = breakForce;
		}

		proto.getBreakTorque = function () {
			return this._breakTorque;
		}

		proto.setBreakTorque = function (breakTorque) {
			this._breakTorque = breakTorque;
		}

		proto.getPositionCorrectionAlgorithm = function () {
			return this._positionCorrectionAlgorithm;
		}

		proto.setPositionCorrectionAlgorithm = function (positionCorrectionAlgorithm) {
			switch (positionCorrectionAlgorithm) {
				case 0: case 1: case 2:
					break;
				default:
					throw new Error("invalid position correction algorithm id: " + positionCorrectionAlgorithm);
			}
			this._positionCorrectionAlgorithm = positionCorrectionAlgorithm;
		}

		proto.getAppliedForce = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._appliedForceX;
			v1[1] = this._appliedForceY;
			v1[2] = this._appliedForceZ;
			return v;
		}

		proto.getAppliedForceTo = function (appliedForce) {
			var v = appliedForce;
			v[0] = this._appliedForceX;
			v[1] = this._appliedForceY;
			v[2] = this._appliedForceZ;
		}

		proto.getAppliedTorque = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._appliedTorqueX;
			v1[1] = this._appliedTorqueY;
			v1[2] = this._appliedTorqueZ;
			return v;
		}

		proto.getAppliedTorqueTo = function (appliedTorque) {
			var v = appliedTorque;
			v[0] = this._appliedTorqueX;
			v[1] = this._appliedTorqueY;
			v[2] = this._appliedTorqueZ;
		}

		proto.getPrev = function () {
			return this._prev;
		}

		proto.getNext = function () {
			return this._next;
		}

		var CylindricalJoint = function (config) {
			dynamics.constraint.joint.Joint.call(this, config, 2);
			var v = config.localAxis1;
			this._localBasisX1X = v[0];
			this._localBasisX1Y = v[1];
			this._localBasisX1Z = v[2];
			var v1 = config.localAxis2;
			this._localBasisX2X = v1[0];
			this._localBasisX2Y = v1[1];
			this._localBasisX2Z = v1[2];
			if (this._localBasisX1X * this._localBasisX1X + this._localBasisX1Y * this._localBasisX1Y + this._localBasisX1Z * this._localBasisX1Z == 0) {
				this._localBasisX1X = 1;
				this._localBasisX1Y = 0;
				this._localBasisX1Z = 0;
			} else {
				var l = this._localBasisX1X * this._localBasisX1X + this._localBasisX1Y * this._localBasisX1Y + this._localBasisX1Z * this._localBasisX1Z;
				if (l > 0) {
					l = 1 / Math.sqrt(l);
				}
				this._localBasisX1X *= l;
				this._localBasisX1Y *= l;
				this._localBasisX1Z *= l;
			}
			if (this._localBasisX2X * this._localBasisX2X + this._localBasisX2Y * this._localBasisX2Y + this._localBasisX2Z * this._localBasisX2Z == 0) {
				this._localBasisX2X = 1;
				this._localBasisX2Y = 0;
				this._localBasisX2Z = 0;
			} else {
				var l1 = this._localBasisX2X * this._localBasisX2X + this._localBasisX2Y * this._localBasisX2Y + this._localBasisX2Z * this._localBasisX2Z;
				if (l1 > 0) {
					l1 = 1 / Math.sqrt(l1);
				}
				this._localBasisX2X *= l1;
				this._localBasisX2Y *= l1;
				this._localBasisX2Z *= l1;
			}
			var slerpQ;
			var slerpQX;
			var slerpQY;
			var slerpQZ;
			var slerpQW;
			var slerpM;
			var slerpM00;
			var slerpM01;
			var slerpM02;
			var slerpM10;
			var slerpM11;
			var slerpM12;
			var slerpM20;
			var slerpM21;
			var slerpM22;
			var d = this._localBasisX1X * this._localBasisX2X + this._localBasisX1Y * this._localBasisX2Y + this._localBasisX1Z * this._localBasisX2Z;
			if (d < -0.999999999) {
				var vX;
				var vY;
				var vZ;
				var x1 = this._localBasisX1X;
				var y1 = this._localBasisX1Y;
				var z1 = this._localBasisX1Z;
				var x2 = x1 * x1;
				var y2 = y1 * y1;
				var z2 = z1 * z1;
				var d1;
				if (x2 < y2) {
					if (x2 < z2) {
						d1 = 1 / Math.sqrt(y2 + z2);
						vX = 0;
						vY = z1 * d1;
						vZ = -y1 * d1;
					} else {
						d1 = 1 / Math.sqrt(x2 + y2);
						vX = y1 * d1;
						vY = -x1 * d1;
						vZ = 0;
					}
				} else if (y2 < z2) {
					d1 = 1 / Math.sqrt(z2 + x2);
					vX = -z1 * d1;
					vY = 0;
					vZ = x1 * d1;
				} else {
					d1 = 1 / Math.sqrt(x2 + y2);
					vX = y1 * d1;
					vY = -x1 * d1;
					vZ = 0;
				}
				slerpQX = vX;
				slerpQY = vY;
				slerpQZ = vZ;
				slerpQW = 0;
			} else {
				var cX;
				var cY;
				var cZ;
				cX = this._localBasisX1Y * this._localBasisX2Z - this._localBasisX1Z * this._localBasisX2Y;
				cY = this._localBasisX1Z * this._localBasisX2X - this._localBasisX1X * this._localBasisX2Z;
				cZ = this._localBasisX1X * this._localBasisX2Y - this._localBasisX1Y * this._localBasisX2X;
				var w = Math.sqrt((1 + d) * 0.5);
				d = 0.5 / w;
				cX *= d;
				cY *= d;
				cZ *= d;
				slerpQX = cX;
				slerpQY = cY;
				slerpQZ = cZ;
				slerpQW = w;
			}
			var x = slerpQX;
			var y = slerpQY;
			var z = slerpQZ;
			var w1 = slerpQW;
			var x21 = 2 * x;
			var y21 = 2 * y;
			var z21 = 2 * z;
			var xx = x * x21;
			var yy = y * y21;
			var zz = z * z21;
			var xy = x * y21;
			var yz = y * z21;
			var xz = x * z21;
			var wx = w1 * x21;
			var wy = w1 * y21;
			var wz = w1 * z21;
			slerpM00 = 1 - yy - zz;
			slerpM01 = xy - wz;
			slerpM02 = xz + wy;
			slerpM10 = xy + wz;
			slerpM11 = 1 - xx - zz;
			slerpM12 = yz - wx;
			slerpM20 = xz - wy;
			slerpM21 = yz + wx;
			slerpM22 = 1 - xx - yy;
			var x11 = this._localBasisX1X;
			var y11 = this._localBasisX1Y;
			var z11 = this._localBasisX1Z;
			var x22 = x11 * x11;
			var y22 = y11 * y11;
			var z22 = z11 * z11;
			var d2;
			if (x22 < y22) {
				if (x22 < z22) {
					d2 = 1 / Math.sqrt(y22 + z22);
					this._localBasisY1X = 0;
					this._localBasisY1Y = z11 * d2;
					this._localBasisY1Z = -y11 * d2;
				} else {
					d2 = 1 / Math.sqrt(x22 + y22);
					this._localBasisY1X = y11 * d2;
					this._localBasisY1Y = -x11 * d2;
					this._localBasisY1Z = 0;
				}
			} else if (y22 < z22) {
				d2 = 1 / Math.sqrt(z22 + x22);
				this._localBasisY1X = -z11 * d2;
				this._localBasisY1Y = 0;
				this._localBasisY1Z = x11 * d2;
			} else {
				d2 = 1 / Math.sqrt(x22 + y22);
				this._localBasisY1X = y11 * d2;
				this._localBasisY1Y = -x11 * d2;
				this._localBasisY1Z = 0;
			}
			this._localBasisZ1X = this._localBasisX1Y * this._localBasisY1Z - this._localBasisX1Z * this._localBasisY1Y;
			this._localBasisZ1Y = this._localBasisX1Z * this._localBasisY1X - this._localBasisX1X * this._localBasisY1Z;
			this._localBasisZ1Z = this._localBasisX1X * this._localBasisY1Y - this._localBasisX1Y * this._localBasisY1X;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = slerpM00 * this._localBasisX1X + slerpM01 * this._localBasisX1Y + slerpM02 * this._localBasisX1Z;
			__tmp__Y = slerpM10 * this._localBasisX1X + slerpM11 * this._localBasisX1Y + slerpM12 * this._localBasisX1Z;
			__tmp__Z = slerpM20 * this._localBasisX1X + slerpM21 * this._localBasisX1Y + slerpM22 * this._localBasisX1Z;
			this._localBasisX2X = __tmp__X;
			this._localBasisX2Y = __tmp__Y;
			this._localBasisX2Z = __tmp__Z;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = slerpM00 * this._localBasisY1X + slerpM01 * this._localBasisY1Y + slerpM02 * this._localBasisY1Z;
			__tmp__Y1 = slerpM10 * this._localBasisY1X + slerpM11 * this._localBasisY1Y + slerpM12 * this._localBasisY1Z;
			__tmp__Z1 = slerpM20 * this._localBasisY1X + slerpM21 * this._localBasisY1Y + slerpM22 * this._localBasisY1Z;
			this._localBasisY2X = __tmp__X1;
			this._localBasisY2Y = __tmp__Y1;
			this._localBasisY2Z = __tmp__Z1;
			var __tmp__X2;
			var __tmp__Y2;
			var __tmp__Z2;
			__tmp__X2 = slerpM00 * this._localBasisZ1X + slerpM01 * this._localBasisZ1Y + slerpM02 * this._localBasisZ1Z;
			__tmp__Y2 = slerpM10 * this._localBasisZ1X + slerpM11 * this._localBasisZ1Y + slerpM12 * this._localBasisZ1Z;
			__tmp__Z2 = slerpM20 * this._localBasisZ1X + slerpM21 * this._localBasisZ1Y + slerpM22 * this._localBasisZ1Z;
			this._localBasisZ2X = __tmp__X2;
			this._localBasisZ2Y = __tmp__Y2;
			this._localBasisZ2Z = __tmp__Z2;
			this.angle = 0;
			this.angularErrorY = 0;
			this.angularErrorZ = 0;
			this.translation = 0;
			this.linearErrorY = 0;
			this.linearErrorZ = 0;
			this._basis = new dynamics.constraint_joint_JointBasis(this);
			this._translSd = config.translationalSpringDamper.clone();
			this._translLm = config.translationalLimitMotor.clone();
			this._rotSd = config.rotationalSpringDamper.clone();
			this._rotLm = config.rotationalLimitMotor.clone();
		}
		return CylindricalJoint;
	});

	dynamics.constraint.joint.JointConfig = pe.define(function (proto) {
		proto._init = function (rb1, rb2, worldAnchor) {
			this.rigidBody1 = rb1;
			this.rigidBody2 = rb2;
			var _this = this.rigidBody1;
			var v;
			var vX;
			var vY;
			var vZ;
			var v1 = worldAnchor;
			vX = v1[0];
			vY = v1[1];
			vZ = v1[2];
			vX -= _this._transform._position[0];
			vY -= _this._transform._position[1];
			vZ -= _this._transform._position[2];
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = _this._transform._rotation[0] * vX + _this._transform._rotation[3] * vY + _this._transform._rotation[6] * vZ;
			__tmp__Y = _this._transform._rotation[1] * vX + _this._transform._rotation[4] * vY + _this._transform._rotation[7] * vZ;
			__tmp__Z = _this._transform._rotation[2] * vX + _this._transform._rotation[5] * vY + _this._transform._rotation[8] * vZ;
			vX = __tmp__X;
			vY = __tmp__Y;
			vZ = __tmp__Z;
			var v2 = this.localAnchor1;
			v2[0] = vX;
			v2[1] = vY;
			v2[2] = vZ;
			var _this1 = this.rigidBody2;
			var v3;
			var vX1;
			var vY1;
			var vZ1;
			var v4 = worldAnchor;
			vX1 = v4[0];
			vY1 = v4[1];
			vZ1 = v4[2];
			vX1 -= _this1._transform._position[0];
			vY1 -= _this1._transform._position[1];
			vZ1 -= _this1._transform._position[2];
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = _this1._transform._rotation[0] * vX1 + _this1._transform._rotation[3] * vY1 + _this1._transform._rotation[6] * vZ1;
			__tmp__Y1 = _this1._transform._rotation[1] * vX1 + _this1._transform._rotation[4] * vY1 + _this1._transform._rotation[7] * vZ1;
			__tmp__Z1 = _this1._transform._rotation[2] * vX1 + _this1._transform._rotation[5] * vY1 + _this1._transform._rotation[8] * vZ1;
			vX1 = __tmp__X1;
			vY1 = __tmp__Y1;
			vZ1 = __tmp__Z1;
			var v5 = this.localAnchor2;
			v5[0] = vX1;
			v5[1] = vY1;
			v5[2] = vZ1;
		}

		var JointConfig = function () {
			this.rigidBody1 = null;
			this.rigidBody2 = null;
			this.localAnchor1 = vec3();
			this.localAnchor2 = vec3();
			this.allowCollision = false;
			this.solverType = pe.common.Setting.defaultJointConstraintSolverType;
			this.positionCorrectionAlgorithm = pe.common.Setting.defaultJointPositionCorrectionAlgorithm;
			this.breakForce = 0;
			this.breakTorque = 0;
		}
		return JointConfig;
	});

	dynamics.constraint.joint.CylindricalJointConfig = pe.define(function (proto) {
		proto.init = function (rigidBody1, rigidBody2, worldAnchor, worldAxis) {
			this._init(rigidBody1, rigidBody2, worldAnchor);
			var v;
			var vX;
			var vY;
			var vZ;
			var v1 = worldAxis;
			vX = v1[0];
			vY = v1[1];
			vZ = v1[2];
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = rigidBody1._transform._rotation[0] * vX + rigidBody1._transform._rotation[3] * vY + rigidBody1._transform._rotation[6] * vZ;
			__tmp__Y = rigidBody1._transform._rotation[1] * vX + rigidBody1._transform._rotation[4] * vY + rigidBody1._transform._rotation[7] * vZ;
			__tmp__Z = rigidBody1._transform._rotation[2] * vX + rigidBody1._transform._rotation[5] * vY + rigidBody1._transform._rotation[8] * vZ;
			vX = __tmp__X;
			vY = __tmp__Y;
			vZ = __tmp__Z;
			var v2 = this.localAxis1;
			v2[0] = vX;
			v2[1] = vY;
			v2[2] = vZ;
			var v3;
			var vX1;
			var vY1;
			var vZ1;
			var v4 = worldAxis;
			vX1 = v4[0];
			vY1 = v4[1];
			vZ1 = v4[2];
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = rigidBody2._transform._rotation[0] * vX1 + rigidBody2._transform._rotation[3] * vY1 + rigidBody2._transform._rotation[6] * vZ1;
			__tmp__Y1 = rigidBody2._transform._rotation[1] * vX1 + rigidBody2._transform._rotation[4] * vY1 + rigidBody2._transform._rotation[7] * vZ1;
			__tmp__Z1 = rigidBody2._transform._rotation[2] * vX1 + rigidBody2._transform._rotation[5] * vY1 + rigidBody2._transform._rotation[8] * vZ1;
			vX1 = __tmp__X1;
			vY1 = __tmp__Y1;
			vZ1 = __tmp__Z1;
			var v5 = this.localAxis2;
			v5[0] = vX1;
			v5[1] = vY1;
			v5[2] = vZ1;
			return this;
		}

		proto._init = function (rb1, rb2, worldAnchor) {
			this.rigidBody1 = rb1;
			this.rigidBody2 = rb2;
			var _this = this.rigidBody1;
			var v;
			var vX;
			var vY;
			var vZ;
			var v1 = worldAnchor;
			vX = v1[0];
			vY = v1[1];
			vZ = v1[2];
			vX -= _this._transform._position[0];
			vY -= _this._transform._position[1];
			vZ -= _this._transform._position[2];
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = _this._transform._rotation[0] * vX + _this._transform._rotation[3] * vY + _this._transform._rotation[6] * vZ;
			__tmp__Y = _this._transform._rotation[1] * vX + _this._transform._rotation[4] * vY + _this._transform._rotation[7] * vZ;
			__tmp__Z = _this._transform._rotation[2] * vX + _this._transform._rotation[5] * vY + _this._transform._rotation[8] * vZ;
			vX = __tmp__X;
			vY = __tmp__Y;
			vZ = __tmp__Z;
			var v2 = this.localAnchor1;
			v2[0] = vX;
			v2[1] = vY;
			v2[2] = vZ;
			var _this1 = this.rigidBody2;
			var v3;
			var vX1;
			var vY1;
			var vZ1;
			var v4 = worldAnchor;
			vX1 = v4[0];
			vY1 = v4[1];
			vZ1 = v4[2];
			vX1 -= _this1._transform._position[0];
			vY1 -= _this1._transform._position[1];
			vZ1 -= _this1._transform._position[2];
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = _this1._transform._rotation[0] * vX1 + _this1._transform._rotation[3] * vY1 + _this1._transform._rotation[6] * vZ1;
			__tmp__Y1 = _this1._transform._rotation[1] * vX1 + _this1._transform._rotation[4] * vY1 + _this1._transform._rotation[7] * vZ1;
			__tmp__Z1 = _this1._transform._rotation[2] * vX1 + _this1._transform._rotation[5] * vY1 + _this1._transform._rotation[8] * vZ1;
			vX1 = __tmp__X1;
			vY1 = __tmp__Y1;
			vZ1 = __tmp__Z1;
			var v5 = this.localAnchor2;
			v5[0] = vX1;
			v5[1] = vY1;
			v5[2] = vZ1;
		}

		var CylindricalJointConfig = function () {
			dynamics.constraint.joint.JointConfig.call(this);
			this.localAxis1 = vec3(1, 0, 0);
			this.localAxis2 = vec3(1, 0, 0);
			this.translationalLimitMotor = new dynamics.constraint.joint.TranslationalLimitMotor();
			this.translationalSpringDamper = new dynamics.constraint.joint.SpringDamper();
			this.rotationalLimitMotor = new dynamics.constraint.joint.RotationalLimitMotor();
			this.rotationalSpringDamper = new dynamics.constraint.joint.SpringDamper();
		}
		return CylindricalJointConfig;
	});

	dynamics.constraint.joint.JointLink = pe.define(function (proto) {
		proto.getContact = function () {
			return this._joint;
		}

		proto.getOther = function () {
			return this._other;
		}

		proto.getPrev = function () {
			return this._prev;
		}

		proto.getNext = function () {
			return this._next;
		}

		var JointLink = function (joint) {
			this._joint = joint;
		}
		return JointLink;
	});

	dynamics.constraint.joint.PrismaticJoint = pe.define(function (proto) {
		proto.getInfo = function (info, timeStep, isPositionPart) {
			var erp = isPositionPart ? 1 : this._positionCorrectionAlgorithm == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? timeStep.invDt * pe.common.Setting.velocityBaumgarte : 0;
			var linRhsY = this.linearErrorY * erp;
			var linRhsZ = this.linearErrorZ * erp;
			var angRhsX = this.angularErrorX * erp;
			var angRhsY = this.angularErrorY * erp;
			var angRhsZ = this.angularErrorZ * erp;
			var crossR1;
			var crossR100;
			var crossR101;
			var crossR102;
			var crossR110;
			var crossR111;
			var crossR112;
			var crossR120;
			var crossR121;
			var crossR122;
			var crossR2;
			var crossR200;
			var crossR201;
			var crossR202;
			var crossR210;
			var crossR211;
			var crossR212;
			var crossR220;
			var crossR221;
			var crossR222;
			crossR100 = 0;
			crossR101 = -this._relativeAnchor1Z;
			crossR102 = this._relativeAnchor1Y;
			crossR110 = this._relativeAnchor1Z;
			crossR111 = 0;
			crossR112 = -this._relativeAnchor1X;
			crossR120 = -this._relativeAnchor1Y;
			crossR121 = this._relativeAnchor1X;
			crossR122 = 0;
			crossR200 = 0;
			crossR201 = -this._relativeAnchor2Z;
			crossR202 = this._relativeAnchor2Y;
			crossR210 = this._relativeAnchor2Z;
			crossR211 = 0;
			crossR212 = -this._relativeAnchor2X;
			crossR220 = -this._relativeAnchor2Y;
			crossR221 = this._relativeAnchor2X;
			crossR222 = 0;
			crossR100 = -crossR100;
			crossR101 = -crossR101;
			crossR102 = -crossR102;
			crossR110 = -crossR110;
			crossR111 = -crossR111;
			crossR112 = -crossR112;
			crossR120 = -crossR120;
			crossR121 = -crossR121;
			crossR122 = -crossR122;
			crossR200 = -crossR200;
			crossR201 = -crossR201;
			crossR202 = -crossR202;
			crossR210 = -crossR210;
			crossR211 = -crossR211;
			crossR212 = -crossR212;
			crossR220 = -crossR220;
			crossR221 = -crossR221;
			crossR222 = -crossR222;
			var row;
			var j;
			var motorMass = 1 / (this._b1._invMass + this._b2._invMass);
			if (this._sd.frequency <= 0 || !isPositionPart) {
				var impulse = this._impulses[0];
				var row1 = info.rows[info.numRows++];
				var _this = row1.jacobian;
				_this.lin1X = 0;
				_this.lin1Y = 0;
				_this.lin1Z = 0;
				_this.lin2X = 0;
				_this.lin2Y = 0;
				_this.lin2Z = 0;
				_this.ang1X = 0;
				_this.ang1Y = 0;
				_this.ang1Z = 0;
				_this.ang2X = 0;
				_this.ang2Y = 0;
				_this.ang2Z = 0;
				row1.rhs = 0;
				row1.cfm = 0;
				row1.minImpulse = 0;
				row1.maxImpulse = 0;
				row1.motorSpeed = 0;
				row1.motorMaxImpulse = 0;
				row1.impulse = null;
				row1.impulse = impulse;
				row = row1;
				var diff = this.translation;
				var lm = this._lm;
				var sd = this._sd;
				var cfmFactor;
				var erp1;
				var slop = pe.common.Setting.linearSlop;
				if (isPositionPart) {
					cfmFactor = 0;
					erp1 = 1;
				} else {
					if (sd.frequency > 0) {
						slop = 0;
						var omega = 6.28318530717958 * sd.frequency;
						var zeta = sd.dampingRatio;
						if (zeta < pe.common.Setting.minSpringDamperDampingRatio) {
							zeta = pe.common.Setting.minSpringDamperDampingRatio;
						}
						var h = timeStep.dt;
						var c = 2 * zeta * omega;
						var k = omega * omega;
						if (sd.useSymplecticEuler) {
							cfmFactor = 1 / (h * c);
							erp1 = k / c;
						} else {
							cfmFactor = 1 / (h * (h * k + c));
							erp1 = k / (h * k + c);
						}
					} else {
						cfmFactor = 0;
						erp1 = this._positionCorrectionAlgorithm == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? timeStep.invDt * pe.common.Setting.velocityBaumgarte : 0;
					}
					if (lm.motorForce > 0) {
						row.motorSpeed = lm.motorSpeed;
						row.motorMaxImpulse = lm.motorForce * timeStep.dt;
					} else {
						row.motorSpeed = 0;
						row.motorMaxImpulse = 0;
					}
				}
				var lower = lm.lowerLimit;
				var upper = lm.upperLimit;
				var minImp;
				var maxImp;
				var error;
				if (lower > upper) {
					minImp = 0;
					maxImp = 0;
					error = 0;
				} else if (lower == upper) {
					minImp = -1.0 / 0.0;
					maxImp = 1.0 / 0.0;
					error = diff - lower;
				} else if (diff < lower) {
					minImp = -1.0 / 0.0;
					maxImp = 0;
					error = diff - lower + slop;
					if (error > 0) {
						error = 0;
					}
				} else if (diff > upper) {
					minImp = 0;
					maxImp = 1.0 / 0.0;
					error = diff - upper - slop;
					if (error < 0) {
						error = 0;
					}
				} else {
					minImp = 0;
					maxImp = 0;
					error = 0;
				}
				var invMass = motorMass == 0 ? 0 : 1 / motorMass;
				row.minImpulse = minImp;
				row.maxImpulse = maxImp;
				row.cfm = cfmFactor * invMass;
				row.rhs = error * erp1;
				j = row.jacobian;
				j.lin1X = this._basis.xX;
				j.lin1Y = this._basis.xY;
				j.lin1Z = this._basis.xZ;
				j.lin2X = this._basis.xX;
				j.lin2Y = this._basis.xY;
				j.lin2Z = this._basis.xZ;
				j.ang1X = crossR100;
				j.ang1Y = crossR101;
				j.ang1Z = crossR102;
				j.ang2X = crossR200;
				j.ang2Y = crossR201;
				j.ang2Z = crossR202;
			}
			var impulse1 = this._impulses[1];
			var row2 = info.rows[info.numRows++];
			var _this1 = row2.jacobian;
			_this1.lin1X = 0;
			_this1.lin1Y = 0;
			_this1.lin1Z = 0;
			_this1.lin2X = 0;
			_this1.lin2Y = 0;
			_this1.lin2Z = 0;
			_this1.ang1X = 0;
			_this1.ang1Y = 0;
			_this1.ang1Z = 0;
			_this1.ang2X = 0;
			_this1.ang2Y = 0;
			_this1.ang2Z = 0;
			row2.rhs = 0;
			row2.cfm = 0;
			row2.minImpulse = 0;
			row2.maxImpulse = 0;
			row2.motorSpeed = 0;
			row2.motorMaxImpulse = 0;
			row2.impulse = null;
			row2.impulse = impulse1;
			row = row2;
			row.rhs = linRhsY;
			row.cfm = 0;
			row.minImpulse = -1.0 / 0.0;
			row.maxImpulse = 1.0 / 0.0;
			j = row.jacobian;
			j.lin1X = this._basis.yX;
			j.lin1Y = this._basis.yY;
			j.lin1Z = this._basis.yZ;
			j.lin2X = this._basis.yX;
			j.lin2Y = this._basis.yY;
			j.lin2Z = this._basis.yZ;
			j.ang1X = crossR110;
			j.ang1Y = crossR111;
			j.ang1Z = crossR112;
			j.ang2X = crossR210;
			j.ang2Y = crossR211;
			j.ang2Z = crossR212;
			var impulse2 = this._impulses[2];
			var row3 = info.rows[info.numRows++];
			var _this2 = row3.jacobian;
			_this2.lin1X = 0;
			_this2.lin1Y = 0;
			_this2.lin1Z = 0;
			_this2.lin2X = 0;
			_this2.lin2Y = 0;
			_this2.lin2Z = 0;
			_this2.ang1X = 0;
			_this2.ang1Y = 0;
			_this2.ang1Z = 0;
			_this2.ang2X = 0;
			_this2.ang2Y = 0;
			_this2.ang2Z = 0;
			row3.rhs = 0;
			row3.cfm = 0;
			row3.minImpulse = 0;
			row3.maxImpulse = 0;
			row3.motorSpeed = 0;
			row3.motorMaxImpulse = 0;
			row3.impulse = null;
			row3.impulse = impulse2;
			row = row3;
			row.rhs = linRhsZ;
			row.cfm = 0;
			row.minImpulse = -1.0 / 0.0;
			row.maxImpulse = 1.0 / 0.0;
			j = row.jacobian;
			j.lin1X = this._basis.zX;
			j.lin1Y = this._basis.zY;
			j.lin1Z = this._basis.zZ;
			j.lin2X = this._basis.zX;
			j.lin2Y = this._basis.zY;
			j.lin2Z = this._basis.zZ;
			j.ang1X = crossR120;
			j.ang1Y = crossR121;
			j.ang1Z = crossR122;
			j.ang2X = crossR220;
			j.ang2Y = crossR221;
			j.ang2Z = crossR222;
			var impulse3 = this._impulses[3];
			var row4 = info.rows[info.numRows++];
			var _this3 = row4.jacobian;
			_this3.lin1X = 0;
			_this3.lin1Y = 0;
			_this3.lin1Z = 0;
			_this3.lin2X = 0;
			_this3.lin2Y = 0;
			_this3.lin2Z = 0;
			_this3.ang1X = 0;
			_this3.ang1Y = 0;
			_this3.ang1Z = 0;
			_this3.ang2X = 0;
			_this3.ang2Y = 0;
			_this3.ang2Z = 0;
			row4.rhs = 0;
			row4.cfm = 0;
			row4.minImpulse = 0;
			row4.maxImpulse = 0;
			row4.motorSpeed = 0;
			row4.motorMaxImpulse = 0;
			row4.impulse = null;
			row4.impulse = impulse3;
			row = row4;
			row.rhs = angRhsX;
			row.cfm = 0;
			row.minImpulse = -1.0 / 0.0;
			row.maxImpulse = 1.0 / 0.0;
			j = row.jacobian;
			j.ang1X = 1;
			j.ang1Y = 0;
			j.ang1Z = 0;
			j.ang2X = 1;
			j.ang2Y = 0;
			j.ang2Z = 0;
			var impulse4 = this._impulses[4];
			var row5 = info.rows[info.numRows++];
			var _this4 = row5.jacobian;
			_this4.lin1X = 0;
			_this4.lin1Y = 0;
			_this4.lin1Z = 0;
			_this4.lin2X = 0;
			_this4.lin2Y = 0;
			_this4.lin2Z = 0;
			_this4.ang1X = 0;
			_this4.ang1Y = 0;
			_this4.ang1Z = 0;
			_this4.ang2X = 0;
			_this4.ang2Y = 0;
			_this4.ang2Z = 0;
			row5.rhs = 0;
			row5.cfm = 0;
			row5.minImpulse = 0;
			row5.maxImpulse = 0;
			row5.motorSpeed = 0;
			row5.motorMaxImpulse = 0;
			row5.impulse = null;
			row5.impulse = impulse4;
			row = row5;
			row.rhs = angRhsY;
			row.cfm = 0;
			row.minImpulse = -1.0 / 0.0;
			row.maxImpulse = 1.0 / 0.0;
			j = row.jacobian;
			j.ang1X = 0;
			j.ang1Y = 1;
			j.ang1Z = 0;
			j.ang2X = 0;
			j.ang2Y = 1;
			j.ang2Z = 0;
			var impulse5 = this._impulses[5];
			var row6 = info.rows[info.numRows++];
			var _this5 = row6.jacobian;
			_this5.lin1X = 0;
			_this5.lin1Y = 0;
			_this5.lin1Z = 0;
			_this5.lin2X = 0;
			_this5.lin2Y = 0;
			_this5.lin2Z = 0;
			_this5.ang1X = 0;
			_this5.ang1Y = 0;
			_this5.ang1Z = 0;
			_this5.ang2X = 0;
			_this5.ang2Y = 0;
			_this5.ang2Z = 0;
			row6.rhs = 0;
			row6.cfm = 0;
			row6.minImpulse = 0;
			row6.maxImpulse = 0;
			row6.motorSpeed = 0;
			row6.motorMaxImpulse = 0;
			row6.impulse = null;
			row6.impulse = impulse5;
			row = row6;
			row.rhs = angRhsZ;
			row.cfm = 0;
			row.minImpulse = -1.0 / 0.0;
			row.maxImpulse = 1.0 / 0.0;
			j = row.jacobian;
			j.ang1X = 0;
			j.ang1Y = 0;
			j.ang1Z = 1;
			j.ang2X = 0;
			j.ang2Y = 0;
			j.ang2Z = 1;
		}

		proto._syncAnchors = function () {
			dynamics.constraint.joint.Joint.prototype._syncAnchors.call(this);
			var _this = this._basis;
			var invM1 = _this.joint._b1._invMass;
			var invM2 = _this.joint._b2._invMass;
			var q;
			var qX;
			var qY;
			var qZ;
			var qW;
			var idQ;
			var idQX;
			var idQY;
			var idQZ;
			var idQW;
			var slerpQ;
			var slerpQX;
			var slerpQY;
			var slerpQZ;
			var slerpQW;
			var slerpM;
			var slerpM00;
			var slerpM01;
			var slerpM02;
			var slerpM10;
			var slerpM11;
			var slerpM12;
			var slerpM20;
			var slerpM21;
			var slerpM22;
			var newX;
			var newXX;
			var newXY;
			var newXZ;
			var newY;
			var newYX;
			var newYY;
			var newYZ;
			var newZ;
			var newZX;
			var newZY;
			var newZZ;
			var prevX;
			var prevXX;
			var prevXY;
			var prevXZ;
			var prevY;
			var prevYX;
			var prevYY;
			var prevYZ;
			var d = _this.joint._basisX1X * _this.joint._basisX2X + _this.joint._basisX1Y * _this.joint._basisX2Y + _this.joint._basisX1Z * _this.joint._basisX2Z;
			if (d < -0.999999999) {
				var vX;
				var vY;
				var vZ;
				var x1 = _this.joint._basisX1X;
				var y1 = _this.joint._basisX1Y;
				var z1 = _this.joint._basisX1Z;
				var x2 = x1 * x1;
				var y2 = y1 * y1;
				var z2 = z1 * z1;
				var d1;
				if (x2 < y2) {
					if (x2 < z2) {
						d1 = 1 / Math.sqrt(y2 + z2);
						vX = 0;
						vY = z1 * d1;
						vZ = -y1 * d1;
					} else {
						d1 = 1 / Math.sqrt(x2 + y2);
						vX = y1 * d1;
						vY = -x1 * d1;
						vZ = 0;
					}
				} else if (y2 < z2) {
					d1 = 1 / Math.sqrt(z2 + x2);
					vX = -z1 * d1;
					vY = 0;
					vZ = x1 * d1;
				} else {
					d1 = 1 / Math.sqrt(x2 + y2);
					vX = y1 * d1;
					vY = -x1 * d1;
					vZ = 0;
				}
				qX = vX;
				qY = vY;
				qZ = vZ;
				qW = 0;
			} else {
				var cX;
				var cY;
				var cZ;
				cX = _this.joint._basisX1Y * _this.joint._basisX2Z - _this.joint._basisX1Z * _this.joint._basisX2Y;
				cY = _this.joint._basisX1Z * _this.joint._basisX2X - _this.joint._basisX1X * _this.joint._basisX2Z;
				cZ = _this.joint._basisX1X * _this.joint._basisX2Y - _this.joint._basisX1Y * _this.joint._basisX2X;
				var w = Math.sqrt((1 + d) * 0.5);
				d = 0.5 / w;
				cX *= d;
				cY *= d;
				cZ *= d;
				qX = cX;
				qY = cY;
				qZ = cZ;
				qW = w;
			}
			idQX = 0;
			idQY = 0;
			idQZ = 0;
			idQW = 1;
			var qx;
			var qy;
			var qz;
			var qw;
			var q1X;
			var q1Y;
			var q1Z;
			var q1W;
			var q2X;
			var q2Y;
			var q2Z;
			var q2W;
			q1X = idQX;
			q1Y = idQY;
			q1Z = idQZ;
			q1W = idQW;
			q2X = qX;
			q2Y = qY;
			q2Z = qZ;
			q2W = qW;
			var d2 = q1X * q2X + q1Y * q2Y + q1Z * q2Z + q1W * q2W;
			if (d2 < 0) {
				d2 = -d2;
				q2X = -q2X;
				q2Y = -q2Y;
				q2Z = -q2Z;
				q2W = -q2W;
			}
			if (d2 > 0.999999) {
				var dqX;
				var dqY;
				var dqZ;
				var dqW;
				dqX = q2X - q1X;
				dqY = q2Y - q1Y;
				dqZ = q2Z - q1Z;
				dqW = q2W - q1W;
				q2X = q1X + dqX * (invM1 / (invM1 + invM2));
				q2Y = q1Y + dqY * (invM1 / (invM1 + invM2));
				q2Z = q1Z + dqZ * (invM1 / (invM1 + invM2));
				q2W = q1W + dqW * (invM1 / (invM1 + invM2));
				var l = q2X * q2X + q2Y * q2Y + q2Z * q2Z + q2W * q2W;
				if (l > 1e-32) {
					l = 1 / Math.sqrt(l);
				}
				slerpQX = q2X * l;
				slerpQY = q2Y * l;
				slerpQZ = q2Z * l;
				slerpQW = q2W * l;
			} else {
				var theta = invM1 / (invM1 + invM2) * Math.acos(d2);
				q2X += q1X * -d2;
				q2Y += q1Y * -d2;
				q2Z += q1Z * -d2;
				q2W += q1W * -d2;
				var l1 = q2X * q2X + q2Y * q2Y + q2Z * q2Z + q2W * q2W;
				if (l1 > 1e-32) {
					l1 = 1 / Math.sqrt(l1);
				}
				q2X *= l1;
				q2Y *= l1;
				q2Z *= l1;
				q2W *= l1;
				var sin = Math.sin(theta);
				var cos = Math.cos(theta);
				q1X *= cos;
				q1Y *= cos;
				q1Z *= cos;
				q1W *= cos;
				slerpQX = q1X + q2X * sin;
				slerpQY = q1Y + q2Y * sin;
				slerpQZ = q1Z + q2Z * sin;
				slerpQW = q1W + q2W * sin;
			}
			var x = slerpQX;
			var y = slerpQY;
			var z = slerpQZ;
			var w1 = slerpQW;
			var x21 = 2 * x;
			var y21 = 2 * y;
			var z21 = 2 * z;
			var xx = x * x21;
			var yy = y * y21;
			var zz = z * z21;
			var xy = x * y21;
			var yz = y * z21;
			var xz = x * z21;
			var wx = w1 * x21;
			var wy = w1 * y21;
			var wz = w1 * z21;
			slerpM00 = 1 - yy - zz;
			slerpM01 = xy - wz;
			slerpM02 = xz + wy;
			slerpM10 = xy + wz;
			slerpM11 = 1 - xx - zz;
			slerpM12 = yz - wx;
			slerpM20 = xz - wy;
			slerpM21 = yz + wx;
			slerpM22 = 1 - xx - yy;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = slerpM00 * _this.joint._basisX1X + slerpM01 * _this.joint._basisX1Y + slerpM02 * _this.joint._basisX1Z;
			__tmp__Y = slerpM10 * _this.joint._basisX1X + slerpM11 * _this.joint._basisX1Y + slerpM12 * _this.joint._basisX1Z;
			__tmp__Z = slerpM20 * _this.joint._basisX1X + slerpM21 * _this.joint._basisX1Y + slerpM22 * _this.joint._basisX1Z;
			newXX = __tmp__X;
			newXY = __tmp__Y;
			newXZ = __tmp__Z;
			prevXX = _this.xX;
			prevXY = _this.xY;
			prevXZ = _this.xZ;
			prevYX = _this.yX;
			prevYY = _this.yY;
			prevYZ = _this.yZ;
			var d3 = prevXX * newXX + prevXY * newXY + prevXZ * newXZ;
			if (d3 < -0.999999999) {
				var vX1;
				var vY1;
				var vZ1;
				var x11 = prevXX;
				var y11 = prevXY;
				var z11 = prevXZ;
				var x22 = x11 * x11;
				var y22 = y11 * y11;
				var z22 = z11 * z11;
				var d4;
				if (x22 < y22) {
					if (x22 < z22) {
						d4 = 1 / Math.sqrt(y22 + z22);
						vX1 = 0;
						vY1 = z11 * d4;
						vZ1 = -y11 * d4;
					} else {
						d4 = 1 / Math.sqrt(x22 + y22);
						vX1 = y11 * d4;
						vY1 = -x11 * d4;
						vZ1 = 0;
					}
				} else if (y22 < z22) {
					d4 = 1 / Math.sqrt(z22 + x22);
					vX1 = -z11 * d4;
					vY1 = 0;
					vZ1 = x11 * d4;
				} else {
					d4 = 1 / Math.sqrt(x22 + y22);
					vX1 = y11 * d4;
					vY1 = -x11 * d4;
					vZ1 = 0;
				}
				slerpQX = vX1;
				slerpQY = vY1;
				slerpQZ = vZ1;
				slerpQW = 0;
			} else {
				var cX1;
				var cY1;
				var cZ1;
				cX1 = prevXY * newXZ - prevXZ * newXY;
				cY1 = prevXZ * newXX - prevXX * newXZ;
				cZ1 = prevXX * newXY - prevXY * newXX;
				var w2 = Math.sqrt((1 + d3) * 0.5);
				d3 = 0.5 / w2;
				cX1 *= d3;
				cY1 *= d3;
				cZ1 *= d3;
				slerpQX = cX1;
				slerpQY = cY1;
				slerpQZ = cZ1;
				slerpQW = w2;
			}
			var x3 = slerpQX;
			var y3 = slerpQY;
			var z3 = slerpQZ;
			var w3 = slerpQW;
			var x23 = 2 * x3;
			var y23 = 2 * y3;
			var z23 = 2 * z3;
			var xx1 = x3 * x23;
			var yy1 = y3 * y23;
			var zz1 = z3 * z23;
			var xy1 = x3 * y23;
			var yz1 = y3 * z23;
			var xz1 = x3 * z23;
			var wx1 = w3 * x23;
			var wy1 = w3 * y23;
			var wz1 = w3 * z23;
			slerpM00 = 1 - yy1 - zz1;
			slerpM01 = xy1 - wz1;
			slerpM02 = xz1 + wy1;
			slerpM10 = xy1 + wz1;
			slerpM11 = 1 - xx1 - zz1;
			slerpM12 = yz1 - wx1;
			slerpM20 = xz1 - wy1;
			slerpM21 = yz1 + wx1;
			slerpM22 = 1 - xx1 - yy1;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = slerpM00 * prevYX + slerpM01 * prevYY + slerpM02 * prevYZ;
			__tmp__Y1 = slerpM10 * prevYX + slerpM11 * prevYY + slerpM12 * prevYZ;
			__tmp__Z1 = slerpM20 * prevYX + slerpM21 * prevYY + slerpM22 * prevYZ;
			newYX = __tmp__X1;
			newYY = __tmp__Y1;
			newYZ = __tmp__Z1;
			newZX = newXY * newYZ - newXZ * newYY;
			newZY = newXZ * newYX - newXX * newYZ;
			newZZ = newXX * newYY - newXY * newYX;
			if (newZX * newZX + newZY * newZY + newZZ * newZZ > 1e-6) {
				var l2 = newZX * newZX + newZY * newZY + newZZ * newZZ;
				if (l2 > 0) {
					l2 = 1 / Math.sqrt(l2);
				}
				newZX *= l2;
				newZY *= l2;
				newZZ *= l2;
			} else {
				var x12 = newXX;
				var y12 = newXY;
				var z12 = newXZ;
				var x24 = x12 * x12;
				var y24 = y12 * y12;
				var z24 = z12 * z12;
				var d5;
				if (x24 < y24) {
					if (x24 < z24) {
						d5 = 1 / Math.sqrt(y24 + z24);
						newZX = 0;
						newZY = z12 * d5;
						newZZ = -y12 * d5;
					} else {
						d5 = 1 / Math.sqrt(x24 + y24);
						newZX = y12 * d5;
						newZY = -x12 * d5;
						newZZ = 0;
					}
				} else if (y24 < z24) {
					d5 = 1 / Math.sqrt(z24 + x24);
					newZX = -z12 * d5;
					newZY = 0;
					newZZ = x12 * d5;
				} else {
					d5 = 1 / Math.sqrt(x24 + y24);
					newZX = y12 * d5;
					newZY = -x12 * d5;
					newZZ = 0;
				}
			}
			newYX = newZY * newXZ - newZZ * newXY;
			newYY = newZZ * newXX - newZX * newXZ;
			newYZ = newZX * newXY - newZY * newXX;
			_this.xX = newXX;
			_this.xY = newXY;
			_this.xZ = newXZ;
			_this.yX = newYX;
			_this.yY = newYY;
			_this.yZ = newYZ;
			_this.zX = newZX;
			_this.zY = newZY;
			_this.zZ = newZZ;
			var rot1;
			var rot100;
			var rot101;
			var rot102;
			var rot110;
			var rot111;
			var rot112;
			var rot120;
			var rot121;
			var rot122;
			var rot2;
			var rot200;
			var rot201;
			var rot202;
			var rot210;
			var rot211;
			var rot212;
			var rot220;
			var rot221;
			var rot222;
			rot100 = this._basisX1X;
			rot101 = this._basisY1X;
			rot102 = this._basisZ1X;
			rot110 = this._basisX1Y;
			rot111 = this._basisY1Y;
			rot112 = this._basisZ1Y;
			rot120 = this._basisX1Z;
			rot121 = this._basisY1Z;
			rot122 = this._basisZ1Z;
			rot200 = this._basisX2X;
			rot201 = this._basisY2X;
			rot202 = this._basisZ2X;
			rot210 = this._basisX2Y;
			rot211 = this._basisY2Y;
			rot212 = this._basisZ2Y;
			rot220 = this._basisX2Z;
			rot221 = this._basisY2Z;
			rot222 = this._basisZ2Z;
			var relRot;
			var relRot00;
			var relRot01;
			var relRot02;
			var relRot10;
			var relRot11;
			var relRot12;
			var relRot20;
			var relRot21;
			var relRot22;
			var __tmp__00;
			var __tmp__01;
			var __tmp__02;
			var __tmp__10;
			var __tmp__11;
			var __tmp__12;
			var __tmp__20;
			var __tmp__21;
			var __tmp__22;
			__tmp__00 = rot200 * rot100 + rot201 * rot101 + rot202 * rot102;
			__tmp__01 = rot200 * rot110 + rot201 * rot111 + rot202 * rot112;
			__tmp__02 = rot200 * rot120 + rot201 * rot121 + rot202 * rot122;
			__tmp__10 = rot210 * rot100 + rot211 * rot101 + rot212 * rot102;
			__tmp__11 = rot210 * rot110 + rot211 * rot111 + rot212 * rot112;
			__tmp__12 = rot210 * rot120 + rot211 * rot121 + rot212 * rot122;
			__tmp__20 = rot220 * rot100 + rot221 * rot101 + rot222 * rot102;
			__tmp__21 = rot220 * rot110 + rot221 * rot111 + rot222 * rot112;
			__tmp__22 = rot220 * rot120 + rot221 * rot121 + rot222 * rot122;
			relRot00 = __tmp__00;
			relRot01 = __tmp__01;
			relRot02 = __tmp__02;
			relRot10 = __tmp__10;
			relRot11 = __tmp__11;
			relRot12 = __tmp__12;
			relRot20 = __tmp__20;
			relRot21 = __tmp__21;
			relRot22 = __tmp__22;
			var relQ;
			var relQX;
			var relQY;
			var relQZ;
			var relQW;
			var e00 = relRot00;
			var e11 = relRot11;
			var e22 = relRot22;
			var t = e00 + e11 + e22;
			var s;
			if (t > 0) {
				s = Math.sqrt(t + 1);
				relQW = 0.5 * s;
				s = 0.5 / s;
				relQX = (relRot21 - relRot12) * s;
				relQY = (relRot02 - relRot20) * s;
				relQZ = (relRot10 - relRot01) * s;
			} else if (e00 > e11) {
				if (e00 > e22) {
					s = Math.sqrt(e00 - e11 - e22 + 1);
					relQX = 0.5 * s;
					s = 0.5 / s;
					relQY = (relRot01 + relRot10) * s;
					relQZ = (relRot02 + relRot20) * s;
					relQW = (relRot21 - relRot12) * s;
				} else {
					s = Math.sqrt(e22 - e00 - e11 + 1);
					relQZ = 0.5 * s;
					s = 0.5 / s;
					relQX = (relRot02 + relRot20) * s;
					relQY = (relRot12 + relRot21) * s;
					relQW = (relRot10 - relRot01) * s;
				}
			} else if (e11 > e22) {
				s = Math.sqrt(e11 - e22 - e00 + 1);
				relQY = 0.5 * s;
				s = 0.5 / s;
				relQX = (relRot01 + relRot10) * s;
				relQZ = (relRot12 + relRot21) * s;
				relQW = (relRot02 - relRot20) * s;
			} else {
				s = Math.sqrt(e22 - e00 - e11 + 1);
				relQZ = 0.5 * s;
				s = 0.5 / s;
				relQX = (relRot02 + relRot20) * s;
				relQY = (relRot12 + relRot21) * s;
				relQW = (relRot10 - relRot01) * s;
			}
			var cosHalfTheta = relQW;
			var theta1 = (cosHalfTheta <= -1 ? 3.14159265358979 : cosHalfTheta >= 1 ? 0 : Math.acos(cosHalfTheta)) * 2;
			this.angularErrorX = relQX;
			this.angularErrorY = relQY;
			this.angularErrorZ = relQZ;
			var l3 = this.angularErrorX * this.angularErrorX + this.angularErrorY * this.angularErrorY + this.angularErrorZ * this.angularErrorZ;
			if (l3 > 0) {
				l3 = 1 / Math.sqrt(l3);
			}
			this.angularErrorX *= l3;
			this.angularErrorY *= l3;
			this.angularErrorZ *= l3;
			this.angularErrorX *= theta1;
			this.angularErrorY *= theta1;
			this.angularErrorZ *= theta1;
			var anchorDiff;
			var anchorDiffX;
			var anchorDiffY;
			var anchorDiffZ;
			anchorDiffX = this._anchor2X - this._anchor1X;
			anchorDiffY = this._anchor2Y - this._anchor1Y;
			anchorDiffZ = this._anchor2Z - this._anchor1Z;
			this.translation = anchorDiffX * this._basis.xX + anchorDiffY * this._basis.xY + anchorDiffZ * this._basis.xZ;
			this.linearErrorY = anchorDiffX * this._basis.yX + anchorDiffY * this._basis.yY + anchorDiffZ * this._basis.yZ;
			this.linearErrorZ = anchorDiffX * this._basis.zX + anchorDiffY * this._basis.zY + anchorDiffZ * this._basis.zZ;
		}

		proto._getVelocitySolverInfo = function (timeStep, info) {
			dynamics.constraint.joint.Joint.prototype._getVelocitySolverInfo.call(this, timeStep, info);
			this.getInfo(info, timeStep, false);
		}

		proto._getPositionSolverInfo = function (info) {
			dynamics.constraint.joint.Joint.prototype._getPositionSolverInfo.call(this, info);
			this.getInfo(info, null, true);
		}

		proto.getAxis1To = function (axis) {
			var v = axis;
			v[0] = this._basisX1X;
			v[1] = this._basisX1Y;
			v[2] = this._basisX1Z;
		}

		proto.getAxis2To = function (axis) {
			var v = axis;
			v[0] = this._basisX2X;
			v[1] = this._basisX2Y;
			v[2] = this._basisX2Z;
		}

		proto.getLocalAxis1To = function (axis) {
			var v = axis;
			v[0] = this._localBasisX1X;
			v[1] = this._localBasisX1Y;
			v[2] = this._localBasisX1Z;
		}

		proto.getLocalAxis2To = function (axis) {
			var v = axis;
			v[0] = this._localBasisX2X;
			v[1] = this._localBasisX2Y;
			v[2] = this._localBasisX2Z;
		}

		proto.getSpringDamper = function () {
			return this._sd;
		}

		proto.getLimitMotor = function () {
			return this._lm;
		}

		proto.getTranslation = function () {
			return this.translation;
		}

		proto._checkDestruction = function () {
			var forceSq = this._appliedForceX * this._appliedForceX + this._appliedForceY * this._appliedForceY + this._appliedForceZ * this._appliedForceZ;
			var torqueSq = this._appliedTorqueX * this._appliedTorqueX + this._appliedTorqueY * this._appliedTorqueY + this._appliedTorqueZ * this._appliedTorqueZ;
			if (this._breakForce > 0 && forceSq > this._breakForce * this._breakForce) {
				this._world.removeJoint(this);
				return;
			}
			if (this._breakTorque > 0 && torqueSq > this._breakTorque * this._breakTorque) {
				this._world.removeJoint(this);
				return;
			}
		}

		proto.getRigidBody1 = function () {
			return this._b1;
		}

		proto.getRigidBody2 = function () {
			return this._b2;
		}

		proto.getType = function () {
			return this._type;
		}

		proto.getAnchor1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._anchor1X;
			v1[1] = this._anchor1Y;
			v1[2] = this._anchor1Z;
			return v;
		}

		proto.getAnchor2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._anchor2X;
			v1[1] = this._anchor2Y;
			v1[2] = this._anchor2Z;
			return v;
		}

		proto.getAnchor1To = function (anchor) {
			var v = anchor;
			v[0] = this._anchor1X;
			v[1] = this._anchor1Y;
			v[2] = this._anchor1Z;
		}

		proto.getAnchor2To = function (anchor) {
			var v = anchor;
			v[0] = this._anchor2X;
			v[1] = this._anchor2Y;
			v[2] = this._anchor2Z;
		}

		proto.getLocalAnchor1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localAnchor1X;
			v1[1] = this._localAnchor1Y;
			v1[2] = this._localAnchor1Z;
			return v;
		}

		proto.getLocalAnchor2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localAnchor2X;
			v1[1] = this._localAnchor2Y;
			v1[2] = this._localAnchor2Z;
			return v;
		}

		proto.getLocalAnchor1To = function (localAnchor) {
			var v = localAnchor;
			v[0] = this._localAnchor1X;
			v[1] = this._localAnchor1Y;
			v[2] = this._localAnchor1Z;
		}

		proto.getLocalAnchor2To = function (localAnchor) {
			var v = localAnchor;
			v[0] = this._localAnchor2X;
			v[1] = this._localAnchor2Y;
			v[2] = this._localAnchor2Z;
		}

		proto.getAllowCollision = function () {
			return this._allowCollision;
		}

		proto.setAllowCollision = function (allowCollision) {
			this._allowCollision = allowCollision;
		}

		proto.getBreakForce = function () {
			return this._breakForce;
		}

		proto.setBreakForce = function (breakForce) {
			this._breakForce = breakForce;
		}

		proto.getBreakTorque = function () {
			return this._breakTorque;
		}

		proto.setBreakTorque = function (breakTorque) {
			this._breakTorque = breakTorque;
		}

		proto.getPositionCorrectionAlgorithm = function () {
			return this._positionCorrectionAlgorithm;
		}

		proto.setPositionCorrectionAlgorithm = function (positionCorrectionAlgorithm) {
			switch (positionCorrectionAlgorithm) {
				case 0: case 1: case 2:
					break;
				default:
					throw new Error("invalid position correction algorithm id: " + positionCorrectionAlgorithm);
			}
			this._positionCorrectionAlgorithm = positionCorrectionAlgorithm;
		}

		proto.getAppliedForce = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._appliedForceX;
			v1[1] = this._appliedForceY;
			v1[2] = this._appliedForceZ;
			return v;
		}

		proto.getAppliedForceTo = function (appliedForce) {
			var v = appliedForce;
			v[0] = this._appliedForceX;
			v[1] = this._appliedForceY;
			v[2] = this._appliedForceZ;
		}

		proto.getAppliedTorque = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._appliedTorqueX;
			v1[1] = this._appliedTorqueY;
			v1[2] = this._appliedTorqueZ;
			return v;
		}

		proto.getAppliedTorqueTo = function (appliedTorque) {
			var v = appliedTorque;
			v[0] = this._appliedTorqueX;
			v[1] = this._appliedTorqueY;
			v[2] = this._appliedTorqueZ;
		}

		proto.getPrev = function () {
			return this._prev;
		}

		proto.getNext = function () {
			return this._next;
		}

		var PrismaticJoint = function (config) {
			dynamics.constraint.joint.Joint.call(this, config, dynamics.constraint.joint.JointType.PRISMATIC);
			var v = config.localAxis1;
			this._localBasisX1X = v[0];
			this._localBasisX1Y = v[1];
			this._localBasisX1Z = v[2];
			var v1 = config.localAxis2;
			this._localBasisX2X = v1[0];
			this._localBasisX2Y = v1[1];
			this._localBasisX2Z = v1[2];
			if (this._localBasisX1X * this._localBasisX1X + this._localBasisX1Y * this._localBasisX1Y + this._localBasisX1Z * this._localBasisX1Z == 0) {
				this._localBasisX1X = 1;
				this._localBasisX1Y = 0;
				this._localBasisX1Z = 0;
			} else {
				var l = this._localBasisX1X * this._localBasisX1X + this._localBasisX1Y * this._localBasisX1Y + this._localBasisX1Z * this._localBasisX1Z;
				if (l > 0) {
					l = 1 / Math.sqrt(l);
				}
				this._localBasisX1X *= l;
				this._localBasisX1Y *= l;
				this._localBasisX1Z *= l;
			}
			if (this._localBasisX2X * this._localBasisX2X + this._localBasisX2Y * this._localBasisX2Y + this._localBasisX2Z * this._localBasisX2Z == 0) {
				this._localBasisX2X = 1;
				this._localBasisX2Y = 0;
				this._localBasisX2Z = 0;
			} else {
				var l1 = this._localBasisX2X * this._localBasisX2X + this._localBasisX2Y * this._localBasisX2Y + this._localBasisX2Z * this._localBasisX2Z;
				if (l1 > 0) {
					l1 = 1 / Math.sqrt(l1);
				}
				this._localBasisX2X *= l1;
				this._localBasisX2Y *= l1;
				this._localBasisX2Z *= l1;
			}
			var slerpQ;
			var slerpQX;
			var slerpQY;
			var slerpQZ;
			var slerpQW;
			var slerpM;
			var slerpM00;
			var slerpM01;
			var slerpM02;
			var slerpM10;
			var slerpM11;
			var slerpM12;
			var slerpM20;
			var slerpM21;
			var slerpM22;
			var d = this._localBasisX1X * this._localBasisX2X + this._localBasisX1Y * this._localBasisX2Y + this._localBasisX1Z * this._localBasisX2Z;
			if (d < -0.999999999) {
				var vX;
				var vY;
				var vZ;
				var x1 = this._localBasisX1X;
				var y1 = this._localBasisX1Y;
				var z1 = this._localBasisX1Z;
				var x2 = x1 * x1;
				var y2 = y1 * y1;
				var z2 = z1 * z1;
				var d1;
				if (x2 < y2) {
					if (x2 < z2) {
						d1 = 1 / Math.sqrt(y2 + z2);
						vX = 0;
						vY = z1 * d1;
						vZ = -y1 * d1;
					} else {
						d1 = 1 / Math.sqrt(x2 + y2);
						vX = y1 * d1;
						vY = -x1 * d1;
						vZ = 0;
					}
				} else if (y2 < z2) {
					d1 = 1 / Math.sqrt(z2 + x2);
					vX = -z1 * d1;
					vY = 0;
					vZ = x1 * d1;
				} else {
					d1 = 1 / Math.sqrt(x2 + y2);
					vX = y1 * d1;
					vY = -x1 * d1;
					vZ = 0;
				}
				slerpQX = vX;
				slerpQY = vY;
				slerpQZ = vZ;
				slerpQW = 0;
			} else {
				var cX;
				var cY;
				var cZ;
				cX = this._localBasisX1Y * this._localBasisX2Z - this._localBasisX1Z * this._localBasisX2Y;
				cY = this._localBasisX1Z * this._localBasisX2X - this._localBasisX1X * this._localBasisX2Z;
				cZ = this._localBasisX1X * this._localBasisX2Y - this._localBasisX1Y * this._localBasisX2X;
				var w = Math.sqrt((1 + d) * 0.5);
				d = 0.5 / w;
				cX *= d;
				cY *= d;
				cZ *= d;
				slerpQX = cX;
				slerpQY = cY;
				slerpQZ = cZ;
				slerpQW = w;
			}
			var x = slerpQX;
			var y = slerpQY;
			var z = slerpQZ;
			var w1 = slerpQW;
			var x21 = 2 * x;
			var y21 = 2 * y;
			var z21 = 2 * z;
			var xx = x * x21;
			var yy = y * y21;
			var zz = z * z21;
			var xy = x * y21;
			var yz = y * z21;
			var xz = x * z21;
			var wx = w1 * x21;
			var wy = w1 * y21;
			var wz = w1 * z21;
			slerpM00 = 1 - yy - zz;
			slerpM01 = xy - wz;
			slerpM02 = xz + wy;
			slerpM10 = xy + wz;
			slerpM11 = 1 - xx - zz;
			slerpM12 = yz - wx;
			slerpM20 = xz - wy;
			slerpM21 = yz + wx;
			slerpM22 = 1 - xx - yy;
			var x11 = this._localBasisX1X;
			var y11 = this._localBasisX1Y;
			var z11 = this._localBasisX1Z;
			var x22 = x11 * x11;
			var y22 = y11 * y11;
			var z22 = z11 * z11;
			var d2;
			if (x22 < y22) {
				if (x22 < z22) {
					d2 = 1 / Math.sqrt(y22 + z22);
					this._localBasisY1X = 0;
					this._localBasisY1Y = z11 * d2;
					this._localBasisY1Z = -y11 * d2;
				} else {
					d2 = 1 / Math.sqrt(x22 + y22);
					this._localBasisY1X = y11 * d2;
					this._localBasisY1Y = -x11 * d2;
					this._localBasisY1Z = 0;
				}
			} else if (y22 < z22) {
				d2 = 1 / Math.sqrt(z22 + x22);
				this._localBasisY1X = -z11 * d2;
				this._localBasisY1Y = 0;
				this._localBasisY1Z = x11 * d2;
			} else {
				d2 = 1 / Math.sqrt(x22 + y22);
				this._localBasisY1X = y11 * d2;
				this._localBasisY1Y = -x11 * d2;
				this._localBasisY1Z = 0;
			}
			this._localBasisZ1X = this._localBasisX1Y * this._localBasisY1Z - this._localBasisX1Z * this._localBasisY1Y;
			this._localBasisZ1Y = this._localBasisX1Z * this._localBasisY1X - this._localBasisX1X * this._localBasisY1Z;
			this._localBasisZ1Z = this._localBasisX1X * this._localBasisY1Y - this._localBasisX1Y * this._localBasisY1X;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = slerpM00 * this._localBasisX1X + slerpM01 * this._localBasisX1Y + slerpM02 * this._localBasisX1Z;
			__tmp__Y = slerpM10 * this._localBasisX1X + slerpM11 * this._localBasisX1Y + slerpM12 * this._localBasisX1Z;
			__tmp__Z = slerpM20 * this._localBasisX1X + slerpM21 * this._localBasisX1Y + slerpM22 * this._localBasisX1Z;
			this._localBasisX2X = __tmp__X;
			this._localBasisX2Y = __tmp__Y;
			this._localBasisX2Z = __tmp__Z;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = slerpM00 * this._localBasisY1X + slerpM01 * this._localBasisY1Y + slerpM02 * this._localBasisY1Z;
			__tmp__Y1 = slerpM10 * this._localBasisY1X + slerpM11 * this._localBasisY1Y + slerpM12 * this._localBasisY1Z;
			__tmp__Z1 = slerpM20 * this._localBasisY1X + slerpM21 * this._localBasisY1Y + slerpM22 * this._localBasisY1Z;
			this._localBasisY2X = __tmp__X1;
			this._localBasisY2Y = __tmp__Y1;
			this._localBasisY2Z = __tmp__Z1;
			var __tmp__X2;
			var __tmp__Y2;
			var __tmp__Z2;
			__tmp__X2 = slerpM00 * this._localBasisZ1X + slerpM01 * this._localBasisZ1Y + slerpM02 * this._localBasisZ1Z;
			__tmp__Y2 = slerpM10 * this._localBasisZ1X + slerpM11 * this._localBasisZ1Y + slerpM12 * this._localBasisZ1Z;
			__tmp__Z2 = slerpM20 * this._localBasisZ1X + slerpM21 * this._localBasisZ1Y + slerpM22 * this._localBasisZ1Z;
			this._localBasisZ2X = __tmp__X2;
			this._localBasisZ2Y = __tmp__Y2;
			this._localBasisZ2Z = __tmp__Z2;
			this._basis = new dynamics.constraint.joint.JointBasis(this);
			this.translation = 0;
			this.linearErrorY = 0;
			this.linearErrorZ = 0;
			this.angularErrorX = 0;
			this.angularErrorY = 0;
			this.angularErrorZ = 0;
			this._sd = config.springDamper.clone();
			this._lm = config.limitMotor.clone();
		}
		return PrismaticJoint;
	});

	dynamics.constraint.joint.PrismaticJointConfig = pe.define(function (proto) {
		proto.init = function (rigidBody1, rigidBody2, worldAnchor, worldAxis) {
			this._init(rigidBody1, rigidBody2, worldAnchor);
			var v;
			var vX;
			var vY;
			var vZ;
			var v1 = worldAxis;
			vX = v1[0];
			vY = v1[1];
			vZ = v1[2];
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = rigidBody1._transform._rotation[0] * vX + rigidBody1._transform._rotation[3] * vY + rigidBody1._transform._rotation[6] * vZ;
			__tmp__Y = rigidBody1._transform._rotation[1] * vX + rigidBody1._transform._rotation[4] * vY + rigidBody1._transform._rotation[7] * vZ;
			__tmp__Z = rigidBody1._transform._rotation[2] * vX + rigidBody1._transform._rotation[5] * vY + rigidBody1._transform._rotation[8] * vZ;
			vX = __tmp__X;
			vY = __tmp__Y;
			vZ = __tmp__Z;
			var v2 = this.localAxis1;
			v2[0] = vX;
			v2[1] = vY;
			v2[2] = vZ;
			var v3;
			var vX1;
			var vY1;
			var vZ1;
			var v4 = worldAxis;
			vX1 = v4[0];
			vY1 = v4[1];
			vZ1 = v4[2];
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = rigidBody2._transform._rotation[0] * vX1 + rigidBody2._transform._rotation[3] * vY1 + rigidBody2._transform._rotation[6] * vZ1;
			__tmp__Y1 = rigidBody2._transform._rotation[1] * vX1 + rigidBody2._transform._rotation[4] * vY1 + rigidBody2._transform._rotation[7] * vZ1;
			__tmp__Z1 = rigidBody2._transform._rotation[2] * vX1 + rigidBody2._transform._rotation[5] * vY1 + rigidBody2._transform._rotation[8] * vZ1;
			vX1 = __tmp__X1;
			vY1 = __tmp__Y1;
			vZ1 = __tmp__Z1;
			var v5 = this.localAxis2;
			v5[0] = vX1;
			v5[1] = vY1;
			v5[2] = vZ1;
			return this;
		}

		proto._init = function (rb1, rb2, worldAnchor) {
			this.rigidBody1 = rb1;
			this.rigidBody2 = rb2;
			var _this = this.rigidBody1;
			var v;
			var vX;
			var vY;
			var vZ;
			var v1 = worldAnchor;
			vX = v1[0];
			vY = v1[1];
			vZ = v1[2];
			vX -= _this._transform._position[0];
			vY -= _this._transform._position[1];
			vZ -= _this._transform._position[2];
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = _this._transform._rotation[0] * vX + _this._transform._rotation[3] * vY + _this._transform._rotation[6] * vZ;
			__tmp__Y = _this._transform._rotation[1] * vX + _this._transform._rotation[4] * vY + _this._transform._rotation[7] * vZ;
			__tmp__Z = _this._transform._rotation[2] * vX + _this._transform._rotation[5] * vY + _this._transform._rotation[8] * vZ;
			vX = __tmp__X;
			vY = __tmp__Y;
			vZ = __tmp__Z;
			var v2 = this.localAnchor1;
			v2[0] = vX;
			v2[1] = vY;
			v2[2] = vZ;
			var _this1 = this.rigidBody2;
			var v3;
			var vX1;
			var vY1;
			var vZ1;
			var v4 = worldAnchor;
			vX1 = v4[0];
			vY1 = v4[1];
			vZ1 = v4[2];
			vX1 -= _this1._transform._position[0];
			vY1 -= _this1._transform._position[1];
			vZ1 -= _this1._transform._position[2];
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = _this1._transform._rotation[0] * vX1 + _this1._transform._rotation[3] * vY1 + _this1._transform._rotation[6] * vZ1;
			__tmp__Y1 = _this1._transform._rotation[1] * vX1 + _this1._transform._rotation[4] * vY1 + _this1._transform._rotation[7] * vZ1;
			__tmp__Z1 = _this1._transform._rotation[2] * vX1 + _this1._transform._rotation[5] * vY1 + _this1._transform._rotation[8] * vZ1;
			vX1 = __tmp__X1;
			vY1 = __tmp__Y1;
			vZ1 = __tmp__Z1;
			var v5 = this.localAnchor2;
			v5[0] = vX1;
			v5[1] = vY1;
			v5[2] = vZ1;
		}

		var PrismaticJointConfig = function () {
			dynamics.constraint.joint.JointConfig.call(this);
			this.localAxis1 = vec3(1, 0, 0);
			this.localAxis2 = vec3(1, 0, 0);
			this.limitMotor = new dynamics.constraint, joint, TranslationalLimitMotor();
			this.springDamper = new dynamics.constraint.joint.SpringDamper();
		}
		return PrismaticJointConfig;
	});

	dynamics.constraint.joint.RagdollJoint = pe.define(function (proto) {
		proto.getInfo = function (info, timeStep, isPositionPart) {
			var erp = isPositionPart ? 1 : this._positionCorrectionAlgorithm == dynamics.constraint_PositionCorrectionAlgorithm.BAUMGARTE ? timeStep.invDt * pe.common.Setting.velocityBaumgarte : 0;
			var linearRhs;
			var linearRhsX;
			var linearRhsY;
			var linearRhsZ;
			linearRhsX = this.linearErrorX * erp;
			linearRhsY = this.linearErrorY * erp;
			linearRhsZ = this.linearErrorZ * erp;
			var linRhsX = linearRhsX;
			var linRhsY = linearRhsY;
			var linRhsZ = linearRhsZ;
			var crossR1;
			var crossR100;
			var crossR101;
			var crossR102;
			var crossR110;
			var crossR111;
			var crossR112;
			var crossR120;
			var crossR121;
			var crossR122;
			var crossR2;
			var crossR200;
			var crossR201;
			var crossR202;
			var crossR210;
			var crossR211;
			var crossR212;
			var crossR220;
			var crossR221;
			var crossR222;
			crossR100 = 0;
			crossR101 = -this._relativeAnchor1Z;
			crossR102 = this._relativeAnchor1Y;
			crossR110 = this._relativeAnchor1Z;
			crossR111 = 0;
			crossR112 = -this._relativeAnchor1X;
			crossR120 = -this._relativeAnchor1Y;
			crossR121 = this._relativeAnchor1X;
			crossR122 = 0;
			crossR200 = 0;
			crossR201 = -this._relativeAnchor2Z;
			crossR202 = this._relativeAnchor2Y;
			crossR210 = this._relativeAnchor2Z;
			crossR211 = 0;
			crossR212 = -this._relativeAnchor2X;
			crossR220 = -this._relativeAnchor2Y;
			crossR221 = this._relativeAnchor2X;
			crossR222 = 0;
			crossR100 = -crossR100;
			crossR101 = -crossR101;
			crossR102 = -crossR102;
			crossR110 = -crossR110;
			crossR111 = -crossR111;
			crossR112 = -crossR112;
			crossR120 = -crossR120;
			crossR121 = -crossR121;
			crossR122 = -crossR122;
			crossR200 = -crossR200;
			crossR201 = -crossR201;
			crossR202 = -crossR202;
			crossR210 = -crossR210;
			crossR211 = -crossR211;
			crossR212 = -crossR212;
			crossR220 = -crossR220;
			crossR221 = -crossR221;
			crossR222 = -crossR222;
			var axisX = this.swingAxisX;
			var axisY = this.swingAxisY;
			var axisZ = this.swingAxisZ;
			var ia1;
			var ia1X;
			var ia1Y;
			var ia1Z;
			var ia2;
			var ia2X;
			var ia2Y;
			var ia2Z;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = this._b1._invInertia[0] * axisX + this._b1._invInertia[1] * axisY + this._b1._invInertia[2] * axisZ;
			__tmp__Y = this._b1._invInertia[3] * axisX + this._b1._invInertia[4] * axisY + this._b1._invInertia[5] * axisZ;
			__tmp__Z = this._b1._invInertia[6] * axisX + this._b1._invInertia[7] * axisY + this._b1._invInertia[8] * axisZ;
			ia1X = __tmp__X;
			ia1Y = __tmp__Y;
			ia1Z = __tmp__Z;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = this._b2._invInertia[0] * axisX + this._b2._invInertia[1] * axisY + this._b2._invInertia[2] * axisZ;
			__tmp__Y1 = this._b2._invInertia[3] * axisX + this._b2._invInertia[4] * axisY + this._b2._invInertia[5] * axisZ;
			__tmp__Z1 = this._b2._invInertia[6] * axisX + this._b2._invInertia[7] * axisY + this._b2._invInertia[8] * axisZ;
			ia2X = __tmp__X1;
			ia2Y = __tmp__Y1;
			ia2Z = __tmp__Z1;
			var invI1 = ia1X * axisX + ia1Y * axisY + ia1Z * axisZ;
			var invI2 = ia2X * axisX + ia2Y * axisY + ia2Z * axisZ;
			if (invI1 > 0) {
				var rsq = this._relativeAnchor1X * this._relativeAnchor1X + this._relativeAnchor1Y * this._relativeAnchor1Y + this._relativeAnchor1Z * this._relativeAnchor1Z;
				var dot = axisX * this._relativeAnchor1X + axisY * this._relativeAnchor1Y + axisZ * this._relativeAnchor1Z;
				var projsq = rsq - dot * dot;
				if (projsq > 0) {
					if (this._b1._invMass > 0) {
						invI1 = 1 / (1 / invI1 + this._b1._mass * projsq);
					} else {
						invI1 = 0;
					}
				}
			}
			if (invI2 > 0) {
				var rsq1 = this._relativeAnchor2X * this._relativeAnchor2X + this._relativeAnchor2Y * this._relativeAnchor2Y + this._relativeAnchor2Z * this._relativeAnchor2Z;
				var dot1 = axisX * this._relativeAnchor2X + axisY * this._relativeAnchor2Y + axisZ * this._relativeAnchor2Z;
				var projsq1 = rsq1 - dot1 * dot1;
				if (projsq1 > 0) {
					if (this._b2._invMass > 0) {
						invI2 = 1 / (1 / invI2 + this._b2._mass * projsq1);
					} else {
						invI2 = 0;
					}
				}
			}
			var swingMass = invI1 + invI2 == 0 ? 0 : 1 / (invI1 + invI2);
			var axisX1 = this._basisX2X;
			var axisY1 = this._basisX2Y;
			var axisZ1 = this._basisX2Z;
			var ia11;
			var ia1X1;
			var ia1Y1;
			var ia1Z1;
			var ia21;
			var ia2X1;
			var ia2Y1;
			var ia2Z1;
			var __tmp__X2;
			var __tmp__Y2;
			var __tmp__Z2;
			__tmp__X2 = this._b1._invInertia[0] * axisX1 + this._b1._invInertia[1] * axisY1 + this._b1._invInertia[2] * axisZ1;
			__tmp__Y2 = this._b1._invInertia[3] * axisX1 + this._b1._invInertia[4] * axisY1 + this._b1._invInertia[5] * axisZ1;
			__tmp__Z2 = this._b1._invInertia[6] * axisX1 + this._b1._invInertia[7] * axisY1 + this._b1._invInertia[8] * axisZ1;
			ia1X1 = __tmp__X2;
			ia1Y1 = __tmp__Y2;
			ia1Z1 = __tmp__Z2;
			var __tmp__X3;
			var __tmp__Y3;
			var __tmp__Z3;
			__tmp__X3 = this._b2._invInertia[0] * axisX1 + this._b2._invInertia[1] * axisY1 + this._b2._invInertia[2] * axisZ1;
			__tmp__Y3 = this._b2._invInertia[3] * axisX1 + this._b2._invInertia[4] * axisY1 + this._b2._invInertia[5] * axisZ1;
			__tmp__Z3 = this._b2._invInertia[6] * axisX1 + this._b2._invInertia[7] * axisY1 + this._b2._invInertia[8] * axisZ1;
			ia2X1 = __tmp__X3;
			ia2Y1 = __tmp__Y3;
			ia2Z1 = __tmp__Z3;
			var invI11 = ia1X1 * axisX1 + ia1Y1 * axisY1 + ia1Z1 * axisZ1;
			var invI21 = ia2X1 * axisX1 + ia2Y1 * axisY1 + ia2Z1 * axisZ1;
			if (invI11 > 0) {
				var rsq2 = this._relativeAnchor1X * this._relativeAnchor1X + this._relativeAnchor1Y * this._relativeAnchor1Y + this._relativeAnchor1Z * this._relativeAnchor1Z;
				var dot2 = axisX1 * this._relativeAnchor1X + axisY1 * this._relativeAnchor1Y + axisZ1 * this._relativeAnchor1Z;
				var projsq2 = rsq2 - dot2 * dot2;
				if (projsq2 > 0) {
					if (this._b1._invMass > 0) {
						invI11 = 1 / (1 / invI11 + this._b1._mass * projsq2);
					} else {
						invI11 = 0;
					}
				}
			}
			if (invI21 > 0) {
				var rsq3 = this._relativeAnchor2X * this._relativeAnchor2X + this._relativeAnchor2Y * this._relativeAnchor2Y + this._relativeAnchor2Z * this._relativeAnchor2Z;
				var dot3 = axisX1 * this._relativeAnchor2X + axisY1 * this._relativeAnchor2Y + axisZ1 * this._relativeAnchor2Z;
				var projsq3 = rsq3 - dot3 * dot3;
				if (projsq3 > 0) {
					if (this._b2._invMass > 0) {
						invI21 = 1 / (1 / invI21 + this._b2._mass * projsq3);
					} else {
						invI21 = 0;
					}
				}
			}
			var twistMass = invI11 + invI21 == 0 ? 0 : 1 / (invI11 + invI21);
			var impulse = this._impulses[0];
			var row = info.rows[info.numRows++];
			var _this = row.jacobian;
			_this.lin1X = 0;
			_this.lin1Y = 0;
			_this.lin1Z = 0;
			_this.lin2X = 0;
			_this.lin2Y = 0;
			_this.lin2Z = 0;
			_this.ang1X = 0;
			_this.ang1Y = 0;
			_this.ang1Z = 0;
			_this.ang2X = 0;
			_this.ang2Y = 0;
			_this.ang2Z = 0;
			row.rhs = 0;
			row.cfm = 0;
			row.minImpulse = 0;
			row.maxImpulse = 0;
			row.motorSpeed = 0;
			row.motorMaxImpulse = 0;
			row.impulse = null;
			row.impulse = impulse;
			var row1 = row;
			row1.rhs = linRhsX;
			row1.cfm = 0;
			row1.minImpulse = -1.0 / 0.0;
			row1.maxImpulse = 1.0 / 0.0;
			var j = row1.jacobian;
			j.lin1X = 1;
			j.lin1Y = 0;
			j.lin1Z = 0;
			j.lin2X = 1;
			j.lin2Y = 0;
			j.lin2Z = 0;
			j.ang1X = crossR100;
			j.ang1Y = crossR101;
			j.ang1Z = crossR102;
			j.ang2X = crossR200;
			j.ang2Y = crossR201;
			j.ang2Z = crossR202;
			var impulse1 = this._impulses[1];
			var row2 = info.rows[info.numRows++];
			var _this1 = row2.jacobian;
			_this1.lin1X = 0;
			_this1.lin1Y = 0;
			_this1.lin1Z = 0;
			_this1.lin2X = 0;
			_this1.lin2Y = 0;
			_this1.lin2Z = 0;
			_this1.ang1X = 0;
			_this1.ang1Y = 0;
			_this1.ang1Z = 0;
			_this1.ang2X = 0;
			_this1.ang2Y = 0;
			_this1.ang2Z = 0;
			row2.rhs = 0;
			row2.cfm = 0;
			row2.minImpulse = 0;
			row2.maxImpulse = 0;
			row2.motorSpeed = 0;
			row2.motorMaxImpulse = 0;
			row2.impulse = null;
			row2.impulse = impulse1;
			row1 = row2;
			row1.rhs = linRhsY;
			row1.cfm = 0;
			row1.minImpulse = -1.0 / 0.0;
			row1.maxImpulse = 1.0 / 0.0;
			j = row1.jacobian;
			j.lin1X = 0;
			j.lin1Y = 1;
			j.lin1Z = 0;
			j.lin2X = 0;
			j.lin2Y = 1;
			j.lin2Z = 0;
			j.ang1X = crossR110;
			j.ang1Y = crossR111;
			j.ang1Z = crossR112;
			j.ang2X = crossR210;
			j.ang2Y = crossR211;
			j.ang2Z = crossR212;
			var impulse2 = this._impulses[2];
			var row3 = info.rows[info.numRows++];
			var _this2 = row3.jacobian;
			_this2.lin1X = 0;
			_this2.lin1Y = 0;
			_this2.lin1Z = 0;
			_this2.lin2X = 0;
			_this2.lin2Y = 0;
			_this2.lin2Z = 0;
			_this2.ang1X = 0;
			_this2.ang1Y = 0;
			_this2.ang1Z = 0;
			_this2.ang2X = 0;
			_this2.ang2Y = 0;
			_this2.ang2Z = 0;
			row3.rhs = 0;
			row3.cfm = 0;
			row3.minImpulse = 0;
			row3.maxImpulse = 0;
			row3.motorSpeed = 0;
			row3.motorMaxImpulse = 0;
			row3.impulse = null;
			row3.impulse = impulse2;
			row1 = row3;
			row1.rhs = linRhsZ;
			row1.cfm = 0;
			row1.minImpulse = -1.0 / 0.0;
			row1.maxImpulse = 1.0 / 0.0;
			j = row1.jacobian;
			j.lin1X = 0;
			j.lin1Y = 0;
			j.lin1Z = 1;
			j.lin2X = 0;
			j.lin2Y = 0;
			j.lin2Z = 1;
			j.ang1X = crossR120;
			j.ang1Y = crossR121;
			j.ang1Z = crossR122;
			j.ang2X = crossR220;
			j.ang2Y = crossR221;
			j.ang2Z = crossR222;
			if (this.swingError > 0 && (this._swingSd.frequency <= 0 || !isPositionPart)) {
				var impulse3 = this._impulses[3];
				var row4 = info.rows[info.numRows++];
				var _this3 = row4.jacobian;
				_this3.lin1X = 0;
				_this3.lin1Y = 0;
				_this3.lin1Z = 0;
				_this3.lin2X = 0;
				_this3.lin2Y = 0;
				_this3.lin2Z = 0;
				_this3.ang1X = 0;
				_this3.ang1Y = 0;
				_this3.ang1Z = 0;
				_this3.ang2X = 0;
				_this3.ang2Y = 0;
				_this3.ang2Z = 0;
				row4.rhs = 0;
				row4.cfm = 0;
				row4.minImpulse = 0;
				row4.maxImpulse = 0;
				row4.motorSpeed = 0;
				row4.motorMaxImpulse = 0;
				row4.impulse = null;
				row4.impulse = impulse3;
				row1 = row4;
				var diff = this.swingError;
				var lm = this.dummySwingLm;
				var sd = this._swingSd;
				var cfmFactor;
				var erp1;
				var slop = pe.common.Setting.angularSlop;
				if (isPositionPart) {
					cfmFactor = 0;
					erp1 = 1;
				} else {
					if (sd.frequency > 0) {
						slop = 0;
						var omega = 6.28318530717958 * sd.frequency;
						var zeta = sd.dampingRatio;
						if (zeta < pe.common.Setting.minSpringDamperDampingRatio) {
							zeta = pe.common.Setting.minSpringDamperDampingRatio;
						}
						var h = timeStep.dt;
						var c = 2 * zeta * omega;
						var k = omega * omega;
						if (sd.useSymplecticEuler) {
							cfmFactor = 1 / (h * c);
							erp1 = k / c;
						} else {
							cfmFactor = 1 / (h * (h * k + c));
							erp1 = k / (h * k + c);
						}
					} else {
						cfmFactor = 0;
						erp1 = this._positionCorrectionAlgorithm == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? timeStep.invDt * pe.common.Setting.velocityBaumgarte : 0;
					}
					if (lm.motorTorque > 0) {
						row1.motorSpeed = lm.motorSpeed;
						row1.motorMaxImpulse = lm.motorTorque * timeStep.dt;
					} else {
						row1.motorSpeed = 0;
						row1.motorMaxImpulse = 0;
					}
				}
				var lower = lm.lowerLimit;
				var upper = lm.upperLimit;
				var mid = (lower + upper) * 0.5;
				diff -= mid;
				diff = ((diff + 3.14159265358979) % 6.28318530717958 + 6.28318530717958) % 6.28318530717958 - 3.14159265358979;
				diff += mid;
				var minImp;
				var maxImp;
				var error;
				if (lower > upper) {
					minImp = 0;
					maxImp = 0;
					error = 0;
				} else if (lower == upper) {
					minImp = -1.0 / 0.0;
					maxImp = 1.0 / 0.0;
					error = diff - lower;
				} else if (diff < lower) {
					minImp = -1.0 / 0.0;
					maxImp = 0;
					error = diff - lower + slop;
					if (error > 0) {
						error = 0;
					}
				} else if (diff > upper) {
					minImp = 0;
					maxImp = 1.0 / 0.0;
					error = diff - upper - slop;
					if (error < 0) {
						error = 0;
					}
				} else {
					minImp = 0;
					maxImp = 0;
					error = 0;
				}
				var invMass = swingMass == 0 ? 0 : 1 / swingMass;
				row1.minImpulse = minImp;
				row1.maxImpulse = maxImp;
				row1.cfm = cfmFactor * invMass;
				row1.rhs = error * erp1;
				j = row1.jacobian;
				j.ang1X = this.swingAxisX;
				j.ang1Y = this.swingAxisY;
				j.ang1Z = this.swingAxisZ;
				j.ang2X = this.swingAxisX;
				j.ang2Y = this.swingAxisY;
				j.ang2Z = this.swingAxisZ;
			}
			if (this._twistSd.frequency <= 0 || !isPositionPart) {
				var impulse4 = this._impulses[4];
				var row5 = info.rows[info.numRows++];
				var _this4 = row5.jacobian;
				_this4.lin1X = 0;
				_this4.lin1Y = 0;
				_this4.lin1Z = 0;
				_this4.lin2X = 0;
				_this4.lin2Y = 0;
				_this4.lin2Z = 0;
				_this4.ang1X = 0;
				_this4.ang1Y = 0;
				_this4.ang1Z = 0;
				_this4.ang2X = 0;
				_this4.ang2Y = 0;
				_this4.ang2Z = 0;
				row5.rhs = 0;
				row5.cfm = 0;
				row5.minImpulse = 0;
				row5.maxImpulse = 0;
				row5.motorSpeed = 0;
				row5.motorMaxImpulse = 0;
				row5.impulse = null;
				row5.impulse = impulse4;
				row1 = row5;
				var diff1 = this._twistAngle;
				var lm1 = this._twistLm;
				var sd1 = this._twistSd;
				var cfmFactor1;
				var erp2;
				var slop1 = pe.common.Setting.angularSlop;
				if (isPositionPart) {
					cfmFactor1 = 0;
					erp2 = 1;
				} else {
					if (sd1.frequency > 0) {
						slop1 = 0;
						var omega1 = 6.28318530717958 * sd1.frequency;
						var zeta1 = sd1.dampingRatio;
						if (zeta1 < pe.common.Setting.minSpringDamperDampingRatio) {
							zeta1 = pe.common.Setting.minSpringDamperDampingRatio;
						}
						var h1 = timeStep.dt;
						var c1 = 2 * zeta1 * omega1;
						var k1 = omega1 * omega1;
						if (sd1.useSymplecticEuler) {
							cfmFactor1 = 1 / (h1 * c1);
							erp2 = k1 / c1;
						} else {
							cfmFactor1 = 1 / (h1 * (h1 * k1 + c1));
							erp2 = k1 / (h1 * k1 + c1);
						}
					} else {
						cfmFactor1 = 0;
						erp2 = this._positionCorrectionAlgorithm == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? timeStep.invDt * pe.common.Setting.velocityBaumgarte : 0;
					}
					if (lm1.motorTorque > 0) {
						row1.motorSpeed = lm1.motorSpeed;
						row1.motorMaxImpulse = lm1.motorTorque * timeStep.dt;
					} else {
						row1.motorSpeed = 0;
						row1.motorMaxImpulse = 0;
					}
				}
				var lower1 = lm1.lowerLimit;
				var upper1 = lm1.upperLimit;
				var mid1 = (lower1 + upper1) * 0.5;
				diff1 -= mid1;
				diff1 = ((diff1 + 3.14159265358979) % 6.28318530717958 + 6.28318530717958) % 6.28318530717958 - 3.14159265358979;
				diff1 += mid1;
				var minImp1;
				var maxImp1;
				var error1;
				if (lower1 > upper1) {
					minImp1 = 0;
					maxImp1 = 0;
					error1 = 0;
				} else if (lower1 == upper1) {
					minImp1 = -1.0 / 0.0;
					maxImp1 = 1.0 / 0.0;
					error1 = diff1 - lower1;
				} else if (diff1 < lower1) {
					minImp1 = -1.0 / 0.0;
					maxImp1 = 0;
					error1 = diff1 - lower1 + slop1;
					if (error1 > 0) {
						error1 = 0;
					}
				} else if (diff1 > upper1) {
					minImp1 = 0;
					maxImp1 = 1.0 / 0.0;
					error1 = diff1 - upper1 - slop1;
					if (error1 < 0) {
						error1 = 0;
					}
				} else {
					minImp1 = 0;
					maxImp1 = 0;
					error1 = 0;
				}
				var invMass1 = twistMass == 0 ? 0 : 1 / twistMass;
				row1.minImpulse = minImp1;
				row1.maxImpulse = maxImp1;
				row1.cfm = cfmFactor1 * invMass1;
				row1.rhs = error1 * erp2;
				j = row1.jacobian;
				j.ang1X = this.twistAxisX;
				j.ang1Y = this.twistAxisY;
				j.ang1Z = this.twistAxisZ;
				j.ang2X = this.twistAxisX;
				j.ang2Y = this.twistAxisY;
				j.ang2Z = this.twistAxisZ;
			}
		}

		proto._syncAnchors = function () {
			dynamics.constraint.joint.Joint.prototype._syncAnchors.call(this);
			var tf1 = this._b1._transform;
			var tf2 = this._b2._transform;
			var axis1;
			var axis1X;
			var axis1Y;
			var axis1Z;
			var axis2;
			var axis2X;
			var axis2Y;
			var axis2Z;
			axis1X = this._basisX1X;
			axis1Y = this._basisX1Y;
			axis1Z = this._basisX1Z;
			axis2X = this._basisX2X;
			axis2Y = this._basisX2Y;
			axis2Z = this._basisX2Z;
			var basis1Mat;
			var basis1Mat00;
			var basis1Mat01;
			var basis1Mat02;
			var basis1Mat10;
			var basis1Mat11;
			var basis1Mat12;
			var basis1Mat20;
			var basis1Mat21;
			var basis1Mat22;
			var basis2Mat;
			var basis2Mat00;
			var basis2Mat01;
			var basis2Mat02;
			var basis2Mat10;
			var basis2Mat11;
			var basis2Mat12;
			var basis2Mat20;
			var basis2Mat21;
			var basis2Mat22;
			basis1Mat00 = this._basisX1X;
			basis1Mat01 = this._basisY1X;
			basis1Mat02 = this._basisZ1X;
			basis1Mat10 = this._basisX1Y;
			basis1Mat11 = this._basisY1Y;
			basis1Mat12 = this._basisZ1Y;
			basis1Mat20 = this._basisX1Z;
			basis1Mat21 = this._basisY1Z;
			basis1Mat22 = this._basisZ1Z;
			basis2Mat00 = this._basisX2X;
			basis2Mat01 = this._basisY2X;
			basis2Mat02 = this._basisZ2X;
			basis2Mat10 = this._basisX2Y;
			basis2Mat11 = this._basisY2Y;
			basis2Mat12 = this._basisZ2Y;
			basis2Mat20 = this._basisX2Z;
			basis2Mat21 = this._basisY2Z;
			basis2Mat22 = this._basisZ2Z;
			var swingQ;
			var swingQX;
			var swingQY;
			var swingQZ;
			var swingQW;
			var swingM;
			var swingM00;
			var swingM01;
			var swingM02;
			var swingM10;
			var swingM11;
			var swingM12;
			var swingM20;
			var swingM21;
			var swingM22;
			var swingV;
			var swingVX;
			var swingVY;
			var swingVZ;
			var d = axis1X * axis2X + axis1Y * axis2Y + axis1Z * axis2Z;
			if (d < -0.999999999) {
				var vX;
				var vY;
				var vZ;
				var x1 = axis1X;
				var y1 = axis1Y;
				var z1 = axis1Z;
				var x2 = x1 * x1;
				var y2 = y1 * y1;
				var z2 = z1 * z1;
				var d1;
				if (x2 < y2) {
					if (x2 < z2) {
						d1 = 1 / Math.sqrt(y2 + z2);
						vX = 0;
						vY = z1 * d1;
						vZ = -y1 * d1;
					} else {
						d1 = 1 / Math.sqrt(x2 + y2);
						vX = y1 * d1;
						vY = -x1 * d1;
						vZ = 0;
					}
				} else if (y2 < z2) {
					d1 = 1 / Math.sqrt(z2 + x2);
					vX = -z1 * d1;
					vY = 0;
					vZ = x1 * d1;
				} else {
					d1 = 1 / Math.sqrt(x2 + y2);
					vX = y1 * d1;
					vY = -x1 * d1;
					vZ = 0;
				}
				swingQX = vX;
				swingQY = vY;
				swingQZ = vZ;
				swingQW = 0;
			} else {
				var cX;
				var cY;
				var cZ;
				cX = axis1Y * axis2Z - axis1Z * axis2Y;
				cY = axis1Z * axis2X - axis1X * axis2Z;
				cZ = axis1X * axis2Y - axis1Y * axis2X;
				var w = Math.sqrt((1 + d) * 0.5);
				d = 0.5 / w;
				cX *= d;
				cY *= d;
				cZ *= d;
				swingQX = cX;
				swingQY = cY;
				swingQZ = cZ;
				swingQW = w;
			}
			var x = swingQX;
			var y = swingQY;
			var z = swingQZ;
			var w1 = swingQW;
			var x21 = 2 * x;
			var y21 = 2 * y;
			var z21 = 2 * z;
			var xx = x * x21;
			var yy = y * y21;
			var zz = z * z21;
			var xy = x * y21;
			var yz = y * z21;
			var xz = x * z21;
			var wx = w1 * x21;
			var wy = w1 * y21;
			var wz = w1 * z21;
			swingM00 = 1 - yy - zz;
			swingM01 = xy - wz;
			swingM02 = xz + wy;
			swingM10 = xy + wz;
			swingM11 = 1 - xx - zz;
			swingM12 = yz - wx;
			swingM20 = xz - wy;
			swingM21 = yz + wx;
			swingM22 = 1 - xx - yy;
			this._swingAngle = (swingQW <= -1 ? 3.14159265358979 : swingQW >= 1 ? 0 : Math.acos(swingQW)) * 2;
			swingVX = swingQX;
			swingVY = swingQY;
			swingVZ = swingQZ;
			var basisY2In1;
			var basisY2In1X;
			var basisY2In1Y;
			var basisY2In1Z;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = swingM00 * this._basisY2X + swingM10 * this._basisY2Y + swingM20 * this._basisY2Z;
			__tmp__Y = swingM01 * this._basisY2X + swingM11 * this._basisY2Y + swingM21 * this._basisY2Z;
			__tmp__Z = swingM02 * this._basisY2X + swingM12 * this._basisY2Y + swingM22 * this._basisY2Z;
			basisY2In1X = __tmp__X;
			basisY2In1Y = __tmp__Y;
			basisY2In1Z = __tmp__Z;
			var yCoord = this._basisY1X * basisY2In1X + this._basisY1Y * basisY2In1Y + this._basisY1Z * basisY2In1Z;
			var zCoord = this._basisZ1X * basisY2In1X + this._basisZ1Y * basisY2In1Y + this._basisZ1Z * basisY2In1Z;
			this._twistAngle = Math.atan2(zCoord, yCoord);
			this.twistAxisX = this._basisX1X + this._basisX2X;
			this.twistAxisY = this._basisX1Y + this._basisX2Y;
			this.twistAxisZ = this._basisX1Z + this._basisX2Z;
			var l = this.twistAxisX * this.twistAxisX + this.twistAxisY * this.twistAxisY + this.twistAxisZ * this.twistAxisZ;
			if (l > 0) {
				l = 1 / Math.sqrt(l);
			}
			this.twistAxisX *= l;
			this.twistAxisY *= l;
			this.twistAxisZ *= l;
			var invLen = Math.sqrt(swingVX * swingVX + swingVY * swingVY + swingVZ * swingVZ);
			if (invLen > 0) {
				invLen = 1 / invLen;
			}
			swingVX *= invLen * this._swingAngle;
			swingVY *= invLen * this._swingAngle;
			swingVZ *= invLen * this._swingAngle;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = basis1Mat00 * swingVX + basis1Mat10 * swingVY + basis1Mat20 * swingVZ;
			__tmp__Y1 = basis1Mat01 * swingVX + basis1Mat11 * swingVY + basis1Mat21 * swingVZ;
			__tmp__Z1 = basis1Mat02 * swingVX + basis1Mat12 * swingVY + basis1Mat22 * swingVZ;
			swingVX = __tmp__X1;
			swingVY = __tmp__Y1;
			swingVZ = __tmp__Z1;
			var x3 = swingVY;
			var y3 = swingVZ;
			var a = this._maxSwingAngle1;
			var b = this._maxSwingAngle2;
			var invA2 = 1 / (a * a);
			var invB2 = 1 / (b * b);
			var w2 = x3 * x3 * invA2 + y3 * y3 * invB2;
			if (w2 == 0) {
				this.swingAxisX = 0;
				this.swingAxisY = 0;
				this.swingAxisZ = 0;
				this.swingError = 0;
			} else {
				var t = Math.sqrt(1 / w2);
				var x0 = x3 * t;
				var y0 = y3 * t;
				var nx = x0 * invA2;
				var ny = y0 * invB2;
				invLen = 1 / Math.sqrt(nx * nx + ny * ny);
				nx *= invLen;
				ny *= invLen;
				var depth = (x3 - x0) * nx + (y3 - y0) * ny;
				if (depth > 0) {
					this.swingError = depth;
					this.swingAxisX = 0;
					this.swingAxisY = nx;
					this.swingAxisZ = ny;
					var __tmp__X2;
					var __tmp__Y2;
					var __tmp__Z2;
					__tmp__X2 = basis1Mat00 * this.swingAxisX + basis1Mat01 * this.swingAxisY + basis1Mat02 * this.swingAxisZ;
					__tmp__Y2 = basis1Mat10 * this.swingAxisX + basis1Mat11 * this.swingAxisY + basis1Mat12 * this.swingAxisZ;
					__tmp__Z2 = basis1Mat20 * this.swingAxisX + basis1Mat21 * this.swingAxisY + basis1Mat22 * this.swingAxisZ;
					this.swingAxisX = __tmp__X2;
					this.swingAxisY = __tmp__Y2;
					this.swingAxisZ = __tmp__Z2;
					var __tmp__X3;
					var __tmp__Y3;
					var __tmp__Z3;
					__tmp__X3 = swingM00 * this.swingAxisX + swingM01 * this.swingAxisY + swingM02 * this.swingAxisZ;
					__tmp__Y3 = swingM10 * this.swingAxisX + swingM11 * this.swingAxisY + swingM12 * this.swingAxisZ;
					__tmp__Z3 = swingM20 * this.swingAxisX + swingM21 * this.swingAxisY + swingM22 * this.swingAxisZ;
					this.swingAxisX = __tmp__X3;
					this.swingAxisY = __tmp__Y3;
					this.swingAxisZ = __tmp__Z3;
				} else {
					this.swingError = 0;
				}
			}
			this.linearErrorX = this._anchor2X - this._anchor1X;
			this.linearErrorY = this._anchor2Y - this._anchor1Y;
			this.linearErrorZ = this._anchor2Z - this._anchor1Z;
		}

		proto._getVelocitySolverInfo = function (timeStep, info) {
			dynamics.constraint.joint.Joint.prototype._getVelocitySolverInfo.call(this, timeStep, info);
			this.getInfo(info, timeStep, false);
		}

		proto._getPositionSolverInfo = function (info) {
			dynamics.constraint.joint.Joint.prototype._getPositionSolverInfo.call(this, info);
			this.getInfo(info, null, true);
		}

		proto.getAxis1To = function (axis) {
			var v = axis;
			v[0] = this._basisX1X;
			v[1] = this._basisX1Y;
			v[2] = this._basisX1Z;
		}

		proto.getAxis2To = function (axis) {
			var v = axis;
			v[0] = this._basisX2X;
			v[1] = this._basisX2Y;
			v[2] = this._basisX2Z;
		}

		proto.getLocalAxis1To = function (axis) {
			var v = axis;
			v[0] = this._localBasisX1X;
			v[1] = this._localBasisX1Y;
			v[2] = this._localBasisX1Z;
		}

		proto.getLocalAxis2To = function (axis) {
			var v = axis;
			v[0] = this._localBasisX2X;
			v[1] = this._localBasisX2Y;
			v[2] = this._localBasisX2Z;
		}

		proto.getTwistSpringDamper = function () {
			return this._twistSd;
		}

		proto.getTwistLimitMotor = function () {
			return this._twistLm;
		}

		proto.getSwingSpringDamper = function () {
			return this._swingSd;
		}

		proto.getSwingAxisTo = function (axis) {
			var v = axis;
			v[0] = this.swingAxisX;
			v[1] = this.swingAxisY;
			v[2] = this.swingAxisZ;
		}

		proto.getSwingAngle = function () {
			return this._swingAngle;
		}

		proto.getTwistAngle = function () {
			return this._twistAngle;
		}

		proto._checkDestruction = function () {
			var forceSq = this._appliedForceX * this._appliedForceX + this._appliedForceY * this._appliedForceY + this._appliedForceZ * this._appliedForceZ;
			var torqueSq = this._appliedTorqueX * this._appliedTorqueX + this._appliedTorqueY * this._appliedTorqueY + this._appliedTorqueZ * this._appliedTorqueZ;
			if (this._breakForce > 0 && forceSq > this._breakForce * this._breakForce) {
				this._world.removeJoint(this);
				return;
			}
			if (this._breakTorque > 0 && torqueSq > this._breakTorque * this._breakTorque) {
				this._world.removeJoint(this);
				return;
			}
		}

		proto.getRigidBody1 = function () {
			return this._b1;
		}

		proto.getRigidBody2 = function () {
			return this._b2;
		}

		proto.getType = function () {
			return this._type;
		}

		proto.getAnchor1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._anchor1X;
			v1[1] = this._anchor1Y;
			v1[2] = this._anchor1Z;
			return v;
		}

		proto.getAnchor2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._anchor2X;
			v1[1] = this._anchor2Y;
			v1[2] = this._anchor2Z;
			return v;
		}

		proto.getAnchor1To = function (anchor) {
			var v = anchor;
			v[0] = this._anchor1X;
			v[1] = this._anchor1Y;
			v[2] = this._anchor1Z;
		}

		proto.getAnchor2To = function (anchor) {
			var v = anchor;
			v[0] = this._anchor2X;
			v[1] = this._anchor2Y;
			v[2] = this._anchor2Z;
		}

		proto.getLocalAnchor1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localAnchor1X;
			v1[1] = this._localAnchor1Y;
			v1[2] = this._localAnchor1Z;
			return v;
		}

		proto.getLocalAnchor2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localAnchor2X;
			v1[1] = this._localAnchor2Y;
			v1[2] = this._localAnchor2Z;
			return v;
		}

		proto.getLocalAnchor1To = function (localAnchor) {
			var v = localAnchor;
			v[0] = this._localAnchor1X;
			v[1] = this._localAnchor1Y;
			v[2] = this._localAnchor1Z;
		}

		proto.getLocalAnchor2To = function (localAnchor) {
			var v = localAnchor;
			v[0] = this._localAnchor2X;
			v[1] = this._localAnchor2Y;
			v[2] = this._localAnchor2Z;
		}

		proto.getAllowCollision = function () {
			return this._allowCollision;
		}

		proto.setAllowCollision = function (allowCollision) {
			this._allowCollision = allowCollision;
		}

		proto.getBreakForce = function () {
			return this._breakForce;
		}

		proto.setBreakForce = function (breakForce) {
			this._breakForce = breakForce;
		}

		proto.getBreakTorque = function () {
			return this._breakTorque;
		}

		proto.setBreakTorque = function (breakTorque) {
			this._breakTorque = breakTorque;
		}

		proto.getPositionCorrectionAlgorithm = function () {
			return this._positionCorrectionAlgorithm;
		}

		proto.setPositionCorrectionAlgorithm = function (positionCorrectionAlgorithm) {
			switch (positionCorrectionAlgorithm) {
				case 0: case 1: case 2:
					break;
				default:
					throw new Error("invalid position correction algorithm id: " + positionCorrectionAlgorithm);
			}
			this._positionCorrectionAlgorithm = positionCorrectionAlgorithm;
		}

		proto.getAppliedForce = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._appliedForceX;
			v1[1] = this._appliedForceY;
			v1[2] = this._appliedForceZ;
			return v;
		}

		proto.getAppliedForceTo = function (appliedForce) {
			var v = appliedForce;
			v[0] = this._appliedForceX;
			v[1] = this._appliedForceY;
			v[2] = this._appliedForceZ;
		}

		proto.getAppliedTorque = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._appliedTorqueX;
			v1[1] = this._appliedTorqueY;
			v1[2] = this._appliedTorqueZ;
			return v;
		}

		proto.getAppliedTorqueTo = function (appliedTorque) {
			var v = appliedTorque;
			v[0] = this._appliedTorqueX;
			v[1] = this._appliedTorqueY;
			v[2] = this._appliedTorqueZ;
		}

		proto.getPrev = function () {
			return this._prev;
		}

		proto.getNext = function () {
			return this._next;
		}

		var RagdollJoint = function (config) {
			dynamics.constraint.joint.Joint.call(this, config, dynamics.constraint.joint.JointType.RAGDOLL);
			var v = config.localTwistAxis1;
			this._localBasisX1X = v[0];
			this._localBasisX1Y = v[1];
			this._localBasisX1Z = v[2];
			var v1 = config.localSwingAxis1;
			this._localBasisY1X = v1[0];
			this._localBasisY1Y = v1[1];
			this._localBasisY1Z = v1[2];
			var v2 = config.localTwistAxis2;
			this._localBasisX2X = v2[0];
			this._localBasisX2Y = v2[1];
			this._localBasisX2Z = v2[2];
			if (this._localBasisX1X * this._localBasisX1X + this._localBasisX1Y * this._localBasisX1Y + this._localBasisX1Z * this._localBasisX1Z == 0) {
				this._localBasisX1X = 1;
				this._localBasisX1Y = 0;
				this._localBasisX1Z = 0;
			} else {
				var l = this._localBasisX1X * this._localBasisX1X + this._localBasisX1Y * this._localBasisX1Y + this._localBasisX1Z * this._localBasisX1Z;
				if (l > 0) {
					l = 1 / Math.sqrt(l);
				}
				this._localBasisX1X *= l;
				this._localBasisX1Y *= l;
				this._localBasisX1Z *= l;
			}
			this._localBasisZ1X = this._localBasisX1Y * this._localBasisY1Z - this._localBasisX1Z * this._localBasisY1Y;
			this._localBasisZ1Y = this._localBasisX1Z * this._localBasisY1X - this._localBasisX1X * this._localBasisY1Z;
			this._localBasisZ1Z = this._localBasisX1X * this._localBasisY1Y - this._localBasisX1Y * this._localBasisY1X;
			if (this._localBasisZ1X * this._localBasisZ1X + this._localBasisZ1Y * this._localBasisZ1Y + this._localBasisZ1Z * this._localBasisZ1Z == 0) {
				var x1 = this._localBasisX1X;
				var y1 = this._localBasisX1Y;
				var z1 = this._localBasisX1Z;
				var x2 = x1 * x1;
				var y2 = y1 * y1;
				var z2 = z1 * z1;
				var d;
				if (x2 < y2) {
					if (x2 < z2) {
						d = 1 / Math.sqrt(y2 + z2);
						this._localBasisY1X = 0;
						this._localBasisY1Y = z1 * d;
						this._localBasisY1Z = -y1 * d;
					} else {
						d = 1 / Math.sqrt(x2 + y2);
						this._localBasisY1X = y1 * d;
						this._localBasisY1Y = -x1 * d;
						this._localBasisY1Z = 0;
					}
				} else if (y2 < z2) {
					d = 1 / Math.sqrt(z2 + x2);
					this._localBasisY1X = -z1 * d;
					this._localBasisY1Y = 0;
					this._localBasisY1Z = x1 * d;
				} else {
					d = 1 / Math.sqrt(x2 + y2);
					this._localBasisY1X = y1 * d;
					this._localBasisY1Y = -x1 * d;
					this._localBasisY1Z = 0;
				}
				this._localBasisZ1X = this._localBasisX1Y * this._localBasisY1Z - this._localBasisX1Z * this._localBasisY1Y;
				this._localBasisZ1Y = this._localBasisX1Z * this._localBasisY1X - this._localBasisX1X * this._localBasisY1Z;
				this._localBasisZ1Z = this._localBasisX1X * this._localBasisY1Y - this._localBasisX1Y * this._localBasisY1X;
			} else {
				var l1 = this._localBasisZ1X * this._localBasisZ1X + this._localBasisZ1Y * this._localBasisZ1Y + this._localBasisZ1Z * this._localBasisZ1Z;
				if (l1 > 0) {
					l1 = 1 / Math.sqrt(l1);
				}
				this._localBasisZ1X *= l1;
				this._localBasisZ1Y *= l1;
				this._localBasisZ1Z *= l1;
				this._localBasisY1X = this._localBasisZ1Y * this._localBasisX1Z - this._localBasisZ1Z * this._localBasisX1Y;
				this._localBasisY1Y = this._localBasisZ1Z * this._localBasisX1X - this._localBasisZ1X * this._localBasisX1Z;
				this._localBasisY1Z = this._localBasisZ1X * this._localBasisX1Y - this._localBasisZ1Y * this._localBasisX1X;
			}
			var slerpQ;
			var slerpQX;
			var slerpQY;
			var slerpQZ;
			var slerpQW;
			var slerpM;
			var slerpM00;
			var slerpM01;
			var slerpM02;
			var slerpM10;
			var slerpM11;
			var slerpM12;
			var slerpM20;
			var slerpM21;
			var slerpM22;
			var d1 = this._localBasisX1X * this._localBasisX2X + this._localBasisX1Y * this._localBasisX2Y + this._localBasisX1Z * this._localBasisX2Z;
			if (d1 < -0.999999999) {
				var vX;
				var vY;
				var vZ;
				var x11 = this._localBasisX1X;
				var y11 = this._localBasisX1Y;
				var z11 = this._localBasisX1Z;
				var x21 = x11 * x11;
				var y21 = y11 * y11;
				var z21 = z11 * z11;
				var d2;
				if (x21 < y21) {
					if (x21 < z21) {
						d2 = 1 / Math.sqrt(y21 + z21);
						vX = 0;
						vY = z11 * d2;
						vZ = -y11 * d2;
					} else {
						d2 = 1 / Math.sqrt(x21 + y21);
						vX = y11 * d2;
						vY = -x11 * d2;
						vZ = 0;
					}
				} else if (y21 < z21) {
					d2 = 1 / Math.sqrt(z21 + x21);
					vX = -z11 * d2;
					vY = 0;
					vZ = x11 * d2;
				} else {
					d2 = 1 / Math.sqrt(x21 + y21);
					vX = y11 * d2;
					vY = -x11 * d2;
					vZ = 0;
				}
				slerpQX = vX;
				slerpQY = vY;
				slerpQZ = vZ;
				slerpQW = 0;
			} else {
				var cX;
				var cY;
				var cZ;
				cX = this._localBasisX1Y * this._localBasisX2Z - this._localBasisX1Z * this._localBasisX2Y;
				cY = this._localBasisX1Z * this._localBasisX2X - this._localBasisX1X * this._localBasisX2Z;
				cZ = this._localBasisX1X * this._localBasisX2Y - this._localBasisX1Y * this._localBasisX2X;
				var w = Math.sqrt((1 + d1) * 0.5);
				d1 = 0.5 / w;
				cX *= d1;
				cY *= d1;
				cZ *= d1;
				slerpQX = cX;
				slerpQY = cY;
				slerpQZ = cZ;
				slerpQW = w;
			}
			var x = slerpQX;
			var y = slerpQY;
			var z = slerpQZ;
			var w1 = slerpQW;
			var x22 = 2 * x;
			var y22 = 2 * y;
			var z22 = 2 * z;
			var xx = x * x22;
			var yy = y * y22;
			var zz = z * z22;
			var xy = x * y22;
			var yz = y * z22;
			var xz = x * z22;
			var wx = w1 * x22;
			var wy = w1 * y22;
			var wz = w1 * z22;
			slerpM00 = 1 - yy - zz;
			slerpM01 = xy - wz;
			slerpM02 = xz + wy;
			slerpM10 = xy + wz;
			slerpM11 = 1 - xx - zz;
			slerpM12 = yz - wx;
			slerpM20 = xz - wy;
			slerpM21 = yz + wx;
			slerpM22 = 1 - xx - yy;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = slerpM00 * this._localBasisX1X + slerpM01 * this._localBasisX1Y + slerpM02 * this._localBasisX1Z;
			__tmp__Y = slerpM10 * this._localBasisX1X + slerpM11 * this._localBasisX1Y + slerpM12 * this._localBasisX1Z;
			__tmp__Z = slerpM20 * this._localBasisX1X + slerpM21 * this._localBasisX1Y + slerpM22 * this._localBasisX1Z;
			this._localBasisX2X = __tmp__X;
			this._localBasisX2Y = __tmp__Y;
			this._localBasisX2Z = __tmp__Z;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = slerpM00 * this._localBasisY1X + slerpM01 * this._localBasisY1Y + slerpM02 * this._localBasisY1Z;
			__tmp__Y1 = slerpM10 * this._localBasisY1X + slerpM11 * this._localBasisY1Y + slerpM12 * this._localBasisY1Z;
			__tmp__Z1 = slerpM20 * this._localBasisY1X + slerpM21 * this._localBasisY1Y + slerpM22 * this._localBasisY1Z;
			this._localBasisY2X = __tmp__X1;
			this._localBasisY2Y = __tmp__Y1;
			this._localBasisY2Z = __tmp__Z1;
			var __tmp__X2;
			var __tmp__Y2;
			var __tmp__Z2;
			__tmp__X2 = slerpM00 * this._localBasisZ1X + slerpM01 * this._localBasisZ1Y + slerpM02 * this._localBasisZ1Z;
			__tmp__Y2 = slerpM10 * this._localBasisZ1X + slerpM11 * this._localBasisZ1Y + slerpM12 * this._localBasisZ1Z;
			__tmp__Z2 = slerpM20 * this._localBasisZ1X + slerpM21 * this._localBasisZ1Y + slerpM22 * this._localBasisZ1Z;
			this._localBasisZ2X = __tmp__X2;
			this._localBasisZ2Y = __tmp__Y2;
			this._localBasisZ2Z = __tmp__Z2;
			this._twistSd = config.twistSpringDamper.clone();
			this._twistLm = config.twistLimitMotor.clone();
			this._swingSd = config.swingSpringDamper.clone();
			this._maxSwingAngle1 = config.maxSwingAngle1;
			this._maxSwingAngle2 = config.maxSwingAngle2;
			if (this._maxSwingAngle1 < pe.common.Setting.minRagdollMaxSwingAngle) {
				this._maxSwingAngle1 = pe.common.Setting.minRagdollMaxSwingAngle;
			}
			if (this._maxSwingAngle2 < pe.common.Setting.minRagdollMaxSwingAngle) {
				this._maxSwingAngle2 = pe.common.Setting.minRagdollMaxSwingAngle;
			}
			this.dummySwingLm = new dynamics.constraint.joint.RotationalLimitMotor();
			this.dummySwingLm.lowerLimit = -1;
			this.dummySwingLm.upperLimit = 0;
			this._swingAngle = 0;
			this._twistAngle = 0;
			this.swingError = 0;
			this.swingAxisX = 0;
			this.swingAxisY = 0;
			this.swingAxisZ = 0;
			this.twistAxisX = 0;
			this.twistAxisY = 0;
			this.twistAxisZ = 0;
		}
		return RagdollJoint;
	});

	dynamics.constraint.joint.RagdollJointConfig = pe.define(function (proto) {
		proto.init = function (rigidBody1, rigidBody2, worldAnchor, worldTwistAxis, worldSwingAxis) {
			this._init(rigidBody1, rigidBody2, worldAnchor);
			var v;
			var vX;
			var vY;
			var vZ;
			var v1 = worldTwistAxis;
			vX = v1[0];
			vY = v1[1];
			vZ = v1[2];
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = rigidBody1._transform._rotation[0] * vX + rigidBody1._transform._rotation[3] * vY + rigidBody1._transform._rotation[6] * vZ;
			__tmp__Y = rigidBody1._transform._rotation[1] * vX + rigidBody1._transform._rotation[4] * vY + rigidBody1._transform._rotation[7] * vZ;
			__tmp__Z = rigidBody1._transform._rotation[2] * vX + rigidBody1._transform._rotation[5] * vY + rigidBody1._transform._rotation[8] * vZ;
			vX = __tmp__X;
			vY = __tmp__Y;
			vZ = __tmp__Z;
			var v2 = this.localTwistAxis1;
			v2[0] = vX;
			v2[1] = vY;
			v2[2] = vZ;
			var v3;
			var vX1;
			var vY1;
			var vZ1;
			var v4 = worldTwistAxis;
			vX1 = v4[0];
			vY1 = v4[1];
			vZ1 = v4[2];
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = rigidBody2._transform._rotation[0] * vX1 + rigidBody2._transform._rotation[3] * vY1 + rigidBody2._transform._rotation[6] * vZ1;
			__tmp__Y1 = rigidBody2._transform._rotation[1] * vX1 + rigidBody2._transform._rotation[4] * vY1 + rigidBody2._transform._rotation[7] * vZ1;
			__tmp__Z1 = rigidBody2._transform._rotation[2] * vX1 + rigidBody2._transform._rotation[5] * vY1 + rigidBody2._transform._rotation[8] * vZ1;
			vX1 = __tmp__X1;
			vY1 = __tmp__Y1;
			vZ1 = __tmp__Z1;
			var v5 = this.localTwistAxis2;
			v5[0] = vX1;
			v5[1] = vY1;
			v5[2] = vZ1;
			var v6;
			var vX2;
			var vY2;
			var vZ2;
			var v7 = worldSwingAxis;
			vX2 = v7[0];
			vY2 = v7[1];
			vZ2 = v7[2];
			var __tmp__X2;
			var __tmp__Y2;
			var __tmp__Z2;
			__tmp__X2 = rigidBody1._transform._rotation[0] * vX2 + rigidBody1._transform._rotation[3] * vY2 + rigidBody1._transform._rotation[6] * vZ2;
			__tmp__Y2 = rigidBody1._transform._rotation[1] * vX2 + rigidBody1._transform._rotation[4] * vY2 + rigidBody1._transform._rotation[7] * vZ2;
			__tmp__Z2 = rigidBody1._transform._rotation[2] * vX2 + rigidBody1._transform._rotation[5] * vY2 + rigidBody1._transform._rotation[8] * vZ2;
			vX2 = __tmp__X2;
			vY2 = __tmp__Y2;
			vZ2 = __tmp__Z2;
			var v8 = this.localSwingAxis1;
			v8[0] = vX2;
			v8[1] = vY2;
			v8[2] = vZ2;
			return this;
		}

		proto._init = function (rb1, rb2, worldAnchor) {
			this.rigidBody1 = rb1;
			this.rigidBody2 = rb2;
			var _this = this.rigidBody1;
			var v;
			var vX;
			var vY;
			var vZ;
			var v1 = worldAnchor;
			vX = v1[0];
			vY = v1[1];
			vZ = v1[2];
			vX -= _this._transform._position[0];
			vY -= _this._transform._position[1];
			vZ -= _this._transform._position[2];
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = _this._transform._rotation[0] * vX + _this._transform._rotation[3] * vY + _this._transform._rotation[6] * vZ;
			__tmp__Y = _this._transform._rotation[1] * vX + _this._transform._rotation[4] * vY + _this._transform._rotation[7] * vZ;
			__tmp__Z = _this._transform._rotation[2] * vX + _this._transform._rotation[5] * vY + _this._transform._rotation[8] * vZ;
			vX = __tmp__X;
			vY = __tmp__Y;
			vZ = __tmp__Z;
			var v2 = this.localAnchor1;
			v2[0] = vX;
			v2[1] = vY;
			v2[2] = vZ;
			var _this1 = this.rigidBody2;
			var v3;
			var vX1;
			var vY1;
			var vZ1;
			var v4 = worldAnchor;
			vX1 = v4[0];
			vY1 = v4[1];
			vZ1 = v4[2];
			vX1 -= _this1._transform._position[0];
			vY1 -= _this1._transform._position[1];
			vZ1 -= _this1._transform._position[2];
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = _this1._transform._rotation[0] * vX1 + _this1._transform._rotation[3] * vY1 + _this1._transform._rotation[6] * vZ1;
			__tmp__Y1 = _this1._transform._rotation[1] * vX1 + _this1._transform._rotation[4] * vY1 + _this1._transform._rotation[7] * vZ1;
			__tmp__Z1 = _this1._transform._rotation[2] * vX1 + _this1._transform._rotation[5] * vY1 + _this1._transform._rotation[8] * vZ1;
			vX1 = __tmp__X1;
			vY1 = __tmp__Y1;
			vZ1 = __tmp__Z1;
			var v5 = this.localAnchor2;
			v5[0] = vX1;
			v5[1] = vY1;
			v5[2] = vZ1;
		}

		var RagdollJointConfig = function () {
			dynamics.constraint.joint.JointConfig.call(this);
			this.localTwistAxis1 = vec3(1, 0, 0);
			this.localTwistAxis2 = vec3(1, 0, 0);
			this.localSwingAxis1 = vec3(0, 1, 0);
			this.twistSpringDamper = new dynamics.constraint.joint.SpringDamper();
			this.swingSpringDamper = new dynamics.constraint.joint.SpringDamper();
			this.twistLimitMotor = new dynamics.constraint.joint.RotationalLimitMotor();
			this.maxSwingAngle1 = 3.14159265358979;
			this.maxSwingAngle2 = 3.14159265358979;
		}
		return RagdollJointConfig;
	});

	dynamics.constraint.joint.RevoluteJoint = pe.define(function (proto) {
		proto.getInfo = function (info, timeStep, isPositionPart) {
			var erp = isPositionPart ? 1 : this._positionCorrectionAlgorithm == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? timeStep.invDt * pe.common.Setting.velocityBaumgarte : 0;
			var linearRhs;
			var linearRhsX;
			var linearRhsY;
			var linearRhsZ;
			linearRhsX = this.linearErrorX * erp;
			linearRhsY = this.linearErrorY * erp;
			linearRhsZ = this.linearErrorZ * erp;
			var linRhsX = linearRhsX;
			var linRhsY = linearRhsY;
			var linRhsZ = linearRhsZ;
			var angRhsY = this.angularErrorY * erp;
			var angRhsZ = this.angularErrorZ * erp;
			var crossR1;
			var crossR100;
			var crossR101;
			var crossR102;
			var crossR110;
			var crossR111;
			var crossR112;
			var crossR120;
			var crossR121;
			var crossR122;
			var crossR2;
			var crossR200;
			var crossR201;
			var crossR202;
			var crossR210;
			var crossR211;
			var crossR212;
			var crossR220;
			var crossR221;
			var crossR222;
			crossR100 = 0;
			crossR101 = -this._relativeAnchor1Z;
			crossR102 = this._relativeAnchor1Y;
			crossR110 = this._relativeAnchor1Z;
			crossR111 = 0;
			crossR112 = -this._relativeAnchor1X;
			crossR120 = -this._relativeAnchor1Y;
			crossR121 = this._relativeAnchor1X;
			crossR122 = 0;
			crossR200 = 0;
			crossR201 = -this._relativeAnchor2Z;
			crossR202 = this._relativeAnchor2Y;
			crossR210 = this._relativeAnchor2Z;
			crossR211 = 0;
			crossR212 = -this._relativeAnchor2X;
			crossR220 = -this._relativeAnchor2Y;
			crossR221 = this._relativeAnchor2X;
			crossR222 = 0;
			crossR100 = -crossR100;
			crossR101 = -crossR101;
			crossR102 = -crossR102;
			crossR110 = -crossR110;
			crossR111 = -crossR111;
			crossR112 = -crossR112;
			crossR120 = -crossR120;
			crossR121 = -crossR121;
			crossR122 = -crossR122;
			crossR200 = -crossR200;
			crossR201 = -crossR201;
			crossR202 = -crossR202;
			crossR210 = -crossR210;
			crossR211 = -crossR211;
			crossR212 = -crossR212;
			crossR220 = -crossR220;
			crossR221 = -crossR221;
			crossR222 = -crossR222;
			var axisX = this._basis.xX;
			var axisY = this._basis.xY;
			var axisZ = this._basis.xZ;
			var ia1;
			var ia1X;
			var ia1Y;
			var ia1Z;
			var ia2;
			var ia2X;
			var ia2Y;
			var ia2Z;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = this._b1._invInertia[0] * axisX + this._b1._invInertia[1] * axisY + this._b1._invInertia[2] * axisZ;
			__tmp__Y = this._b1._invInertia[3] * axisX + this._b1._invInertia[4] * axisY + this._b1._invInertia[5] * axisZ;
			__tmp__Z = this._b1._invInertia[6] * axisX + this._b1._invInertia[7] * axisY + this._b1._invInertia[8] * axisZ;
			ia1X = __tmp__X;
			ia1Y = __tmp__Y;
			ia1Z = __tmp__Z;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = this._b2._invInertia[0] * axisX + this._b2._invInertia[1] * axisY + this._b2._invInertia[2] * axisZ;
			__tmp__Y1 = this._b2._invInertia[3] * axisX + this._b2._invInertia[4] * axisY + this._b2._invInertia[5] * axisZ;
			__tmp__Z1 = this._b2._invInertia[6] * axisX + this._b2._invInertia[7] * axisY + this._b2._invInertia[8] * axisZ;
			ia2X = __tmp__X1;
			ia2Y = __tmp__Y1;
			ia2Z = __tmp__Z1;
			var invI1 = ia1X * axisX + ia1Y * axisY + ia1Z * axisZ;
			var invI2 = ia2X * axisX + ia2Y * axisY + ia2Z * axisZ;
			if (invI1 > 0) {
				var rsq = this._relativeAnchor1X * this._relativeAnchor1X + this._relativeAnchor1Y * this._relativeAnchor1Y + this._relativeAnchor1Z * this._relativeAnchor1Z;
				var dot = axisX * this._relativeAnchor1X + axisY * this._relativeAnchor1Y + axisZ * this._relativeAnchor1Z;
				var projsq = rsq - dot * dot;
				if (projsq > 0) {
					if (this._b1._invMass > 0) {
						invI1 = 1 / (1 / invI1 + this._b1._mass * projsq);
					} else {
						invI1 = 0;
					}
				}
			}
			if (invI2 > 0) {
				var rsq1 = this._relativeAnchor2X * this._relativeAnchor2X + this._relativeAnchor2Y * this._relativeAnchor2Y + this._relativeAnchor2Z * this._relativeAnchor2Z;
				var dot1 = axisX * this._relativeAnchor2X + axisY * this._relativeAnchor2Y + axisZ * this._relativeAnchor2Z;
				var projsq1 = rsq1 - dot1 * dot1;
				if (projsq1 > 0) {
					if (this._b2._invMass > 0) {
						invI2 = 1 / (1 / invI2 + this._b2._mass * projsq1);
					} else {
						invI2 = 0;
					}
				}
			}
			var motorMass = invI1 + invI2 == 0 ? 0 : 1 / (invI1 + invI2);
			var impulse = this._impulses[0];
			var row = info.rows[info.numRows++];
			var _this = row.jacobian;
			_this.lin1X = 0;
			_this.lin1Y = 0;
			_this.lin1Z = 0;
			_this.lin2X = 0;
			_this.lin2Y = 0;
			_this.lin2Z = 0;
			_this.ang1X = 0;
			_this.ang1Y = 0;
			_this.ang1Z = 0;
			_this.ang2X = 0;
			_this.ang2Y = 0;
			_this.ang2Z = 0;
			row.rhs = 0;
			row.cfm = 0;
			row.minImpulse = 0;
			row.maxImpulse = 0;
			row.motorSpeed = 0;
			row.motorMaxImpulse = 0;
			row.impulse = null;
			row.impulse = impulse;
			var row1 = row;
			row1.rhs = linRhsX;
			row1.cfm = 0;
			row1.minImpulse = -1.0 / 0.0;
			row1.maxImpulse = 1.0 / 0.0;
			var j = row1.jacobian;
			j.lin1X = 1;
			j.lin1Y = 0;
			j.lin1Z = 0;
			j.lin2X = 1;
			j.lin2Y = 0;
			j.lin2Z = 0;
			j.ang1X = crossR100;
			j.ang1Y = crossR101;
			j.ang1Z = crossR102;
			j.ang2X = crossR200;
			j.ang2Y = crossR201;
			j.ang2Z = crossR202;
			var impulse1 = this._impulses[1];
			var row2 = info.rows[info.numRows++];
			var _this1 = row2.jacobian;
			_this1.lin1X = 0;
			_this1.lin1Y = 0;
			_this1.lin1Z = 0;
			_this1.lin2X = 0;
			_this1.lin2Y = 0;
			_this1.lin2Z = 0;
			_this1.ang1X = 0;
			_this1.ang1Y = 0;
			_this1.ang1Z = 0;
			_this1.ang2X = 0;
			_this1.ang2Y = 0;
			_this1.ang2Z = 0;
			row2.rhs = 0;
			row2.cfm = 0;
			row2.minImpulse = 0;
			row2.maxImpulse = 0;
			row2.motorSpeed = 0;
			row2.motorMaxImpulse = 0;
			row2.impulse = null;
			row2.impulse = impulse1;
			row1 = row2;
			row1.rhs = linRhsY;
			row1.cfm = 0;
			row1.minImpulse = -1.0 / 0.0;
			row1.maxImpulse = 1.0 / 0.0;
			j = row1.jacobian;
			j.lin1X = 0;
			j.lin1Y = 1;
			j.lin1Z = 0;
			j.lin2X = 0;
			j.lin2Y = 1;
			j.lin2Z = 0;
			j.ang1X = crossR110;
			j.ang1Y = crossR111;
			j.ang1Z = crossR112;
			j.ang2X = crossR210;
			j.ang2Y = crossR211;
			j.ang2Z = crossR212;
			var impulse2 = this._impulses[2];
			var row3 = info.rows[info.numRows++];
			var _this2 = row3.jacobian;
			_this2.lin1X = 0;
			_this2.lin1Y = 0;
			_this2.lin1Z = 0;
			_this2.lin2X = 0;
			_this2.lin2Y = 0;
			_this2.lin2Z = 0;
			_this2.ang1X = 0;
			_this2.ang1Y = 0;
			_this2.ang1Z = 0;
			_this2.ang2X = 0;
			_this2.ang2Y = 0;
			_this2.ang2Z = 0;
			row3.rhs = 0;
			row3.cfm = 0;
			row3.minImpulse = 0;
			row3.maxImpulse = 0;
			row3.motorSpeed = 0;
			row3.motorMaxImpulse = 0;
			row3.impulse = null;
			row3.impulse = impulse2;
			row1 = row3;
			row1.rhs = linRhsZ;
			row1.cfm = 0;
			row1.minImpulse = -1.0 / 0.0;
			row1.maxImpulse = 1.0 / 0.0;
			j = row1.jacobian;
			j.lin1X = 0;
			j.lin1Y = 0;
			j.lin1Z = 1;
			j.lin2X = 0;
			j.lin2Y = 0;
			j.lin2Z = 1;
			j.ang1X = crossR120;
			j.ang1Y = crossR121;
			j.ang1Z = crossR122;
			j.ang2X = crossR220;
			j.ang2Y = crossR221;
			j.ang2Z = crossR222;
			if (this._sd.frequency <= 0 || !isPositionPart) {
				var impulse3 = this._impulses[3];
				var row4 = info.rows[info.numRows++];
				var _this3 = row4.jacobian;
				_this3.lin1X = 0;
				_this3.lin1Y = 0;
				_this3.lin1Z = 0;
				_this3.lin2X = 0;
				_this3.lin2Y = 0;
				_this3.lin2Z = 0;
				_this3.ang1X = 0;
				_this3.ang1Y = 0;
				_this3.ang1Z = 0;
				_this3.ang2X = 0;
				_this3.ang2Y = 0;
				_this3.ang2Z = 0;
				row4.rhs = 0;
				row4.cfm = 0;
				row4.minImpulse = 0;
				row4.maxImpulse = 0;
				row4.motorSpeed = 0;
				row4.motorMaxImpulse = 0;
				row4.impulse = null;
				row4.impulse = impulse3;
				row1 = row4;
				var diff = this.angle;
				var lm = this._lm;
				var sd = this._sd;
				var cfmFactor;
				var erp1;
				var slop = pe.common.Setting.angularSlop;
				if (isPositionPart) {
					cfmFactor = 0;
					erp1 = 1;
				} else {
					if (sd.frequency > 0) {
						slop = 0;
						var omega = 6.28318530717958 * sd.frequency;
						var zeta = sd.dampingRatio;
						if (zeta < pe.common.Setting.minSpringDamperDampingRatio) {
							zeta = pe.common.Setting.minSpringDamperDampingRatio;
						}
						var h = timeStep.dt;
						var c = 2 * zeta * omega;
						var k = omega * omega;
						if (sd.useSymplecticEuler) {
							cfmFactor = 1 / (h * c);
							erp1 = k / c;
						} else {
							cfmFactor = 1 / (h * (h * k + c));
							erp1 = k / (h * k + c);
						}
					} else {
						cfmFactor = 0;
						erp1 = this._positionCorrectionAlgorithm == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? timeStep.invDt * pe.common.Setting.velocityBaumgarte : 0;
					}
					if (lm.motorTorque > 0) {
						row1.motorSpeed = lm.motorSpeed;
						row1.motorMaxImpulse = lm.motorTorque * timeStep.dt;
					} else {
						row1.motorSpeed = 0;
						row1.motorMaxImpulse = 0;
					}
				}
				var lower = lm.lowerLimit;
				var upper = lm.upperLimit;
				var mid = (lower + upper) * 0.5;
				diff -= mid;
				diff = ((diff + 3.14159265358979) % 6.28318530717958 + 6.28318530717958) % 6.28318530717958 - 3.14159265358979;
				diff += mid;
				var minImp;
				var maxImp;
				var error;
				if (lower > upper) {
					minImp = 0;
					maxImp = 0;
					error = 0;
				} else if (lower == upper) {
					minImp = -1.0 / 0.0;
					maxImp = 1.0 / 0.0;
					error = diff - lower;
				} else if (diff < lower) {
					minImp = -1.0 / 0.0;
					maxImp = 0;
					error = diff - lower + slop;
					if (error > 0) {
						error = 0;
					}
				} else if (diff > upper) {
					minImp = 0;
					maxImp = 1.0 / 0.0;
					error = diff - upper - slop;
					if (error < 0) {
						error = 0;
					}
				} else {
					minImp = 0;
					maxImp = 0;
					error = 0;
				}
				var invMass = motorMass == 0 ? 0 : 1 / motorMass;
				row1.minImpulse = minImp;
				row1.maxImpulse = maxImp;
				row1.cfm = cfmFactor * invMass;
				row1.rhs = error * erp1;
				j = row1.jacobian;
				j.ang1X = this._basis.xX;
				j.ang1Y = this._basis.xY;
				j.ang1Z = this._basis.xZ;
				j.ang2X = this._basis.xX;
				j.ang2Y = this._basis.xY;
				j.ang2Z = this._basis.xZ;
			}
			var impulse4 = this._impulses[4];
			var row5 = info.rows[info.numRows++];
			var _this4 = row5.jacobian;
			_this4.lin1X = 0;
			_this4.lin1Y = 0;
			_this4.lin1Z = 0;
			_this4.lin2X = 0;
			_this4.lin2Y = 0;
			_this4.lin2Z = 0;
			_this4.ang1X = 0;
			_this4.ang1Y = 0;
			_this4.ang1Z = 0;
			_this4.ang2X = 0;
			_this4.ang2Y = 0;
			_this4.ang2Z = 0;
			row5.rhs = 0;
			row5.cfm = 0;
			row5.minImpulse = 0;
			row5.maxImpulse = 0;
			row5.motorSpeed = 0;
			row5.motorMaxImpulse = 0;
			row5.impulse = null;
			row5.impulse = impulse4;
			row1 = row5;
			row1.rhs = angRhsY;
			row1.cfm = 0;
			row1.minImpulse = -1.0 / 0.0;
			row1.maxImpulse = 1.0 / 0.0;
			j = row1.jacobian;
			j.ang1X = this._basis.yX;
			j.ang1Y = this._basis.yY;
			j.ang1Z = this._basis.yZ;
			j.ang2X = this._basis.yX;
			j.ang2Y = this._basis.yY;
			j.ang2Z = this._basis.yZ;
			var impulse5 = this._impulses[5];
			var row6 = info.rows[info.numRows++];
			var _this5 = row6.jacobian;
			_this5.lin1X = 0;
			_this5.lin1Y = 0;
			_this5.lin1Z = 0;
			_this5.lin2X = 0;
			_this5.lin2Y = 0;
			_this5.lin2Z = 0;
			_this5.ang1X = 0;
			_this5.ang1Y = 0;
			_this5.ang1Z = 0;
			_this5.ang2X = 0;
			_this5.ang2Y = 0;
			_this5.ang2Z = 0;
			row6.rhs = 0;
			row6.cfm = 0;
			row6.minImpulse = 0;
			row6.maxImpulse = 0;
			row6.motorSpeed = 0;
			row6.motorMaxImpulse = 0;
			row6.impulse = null;
			row6.impulse = impulse5;
			row1 = row6;
			row1.rhs = angRhsZ;
			row1.cfm = 0;
			row1.minImpulse = -1.0 / 0.0;
			row1.maxImpulse = 1.0 / 0.0;
			j = row1.jacobian;
			j.ang1X = this._basis.zX;
			j.ang1Y = this._basis.zY;
			j.ang1Z = this._basis.zZ;
			j.ang2X = this._basis.zX;
			j.ang2Y = this._basis.zY;
			j.ang2Z = this._basis.zZ;
		}
		proto._syncAnchors = function () {
			dynamics.constraint.joint.Joint.prototype._syncAnchors.call(this);
			var _this = this._basis;
			var invM1 = _this.joint._b1._invMass;
			var invM2 = _this.joint._b2._invMass;
			var q;
			var qX;
			var qY;
			var qZ;
			var qW;
			var idQ;
			var idQX;
			var idQY;
			var idQZ;
			var idQW;
			var slerpQ;
			var slerpQX;
			var slerpQY;
			var slerpQZ;
			var slerpQW;
			var slerpM;
			var slerpM00;
			var slerpM01;
			var slerpM02;
			var slerpM10;
			var slerpM11;
			var slerpM12;
			var slerpM20;
			var slerpM21;
			var slerpM22;
			var newX;
			var newXX;
			var newXY;
			var newXZ;
			var newY;
			var newYX;
			var newYY;
			var newYZ;
			var newZ;
			var newZX;
			var newZY;
			var newZZ;
			var prevX;
			var prevXX;
			var prevXY;
			var prevXZ;
			var prevY;
			var prevYX;
			var prevYY;
			var prevYZ;
			var d = _this.joint._basisX1X * _this.joint._basisX2X + _this.joint._basisX1Y * _this.joint._basisX2Y + _this.joint._basisX1Z * _this.joint._basisX2Z;
			if (d < -0.999999999) {
				var vX;
				var vY;
				var vZ;
				var x1 = _this.joint._basisX1X;
				var y1 = _this.joint._basisX1Y;
				var z1 = _this.joint._basisX1Z;
				var x2 = x1 * x1;
				var y2 = y1 * y1;
				var z2 = z1 * z1;
				var d1;
				if (x2 < y2) {
					if (x2 < z2) {
						d1 = 1 / Math.sqrt(y2 + z2);
						vX = 0;
						vY = z1 * d1;
						vZ = -y1 * d1;
					} else {
						d1 = 1 / Math.sqrt(x2 + y2);
						vX = y1 * d1;
						vY = -x1 * d1;
						vZ = 0;
					}
				} else if (y2 < z2) {
					d1 = 1 / Math.sqrt(z2 + x2);
					vX = -z1 * d1;
					vY = 0;
					vZ = x1 * d1;
				} else {
					d1 = 1 / Math.sqrt(x2 + y2);
					vX = y1 * d1;
					vY = -x1 * d1;
					vZ = 0;
				}
				qX = vX;
				qY = vY;
				qZ = vZ;
				qW = 0;
			} else {
				var cX;
				var cY;
				var cZ;
				cX = _this.joint._basisX1Y * _this.joint._basisX2Z - _this.joint._basisX1Z * _this.joint._basisX2Y;
				cY = _this.joint._basisX1Z * _this.joint._basisX2X - _this.joint._basisX1X * _this.joint._basisX2Z;
				cZ = _this.joint._basisX1X * _this.joint._basisX2Y - _this.joint._basisX1Y * _this.joint._basisX2X;
				var w = Math.sqrt((1 + d) * 0.5);
				d = 0.5 / w;
				cX *= d;
				cY *= d;
				cZ *= d;
				qX = cX;
				qY = cY;
				qZ = cZ;
				qW = w;
			}
			idQX = 0;
			idQY = 0;
			idQZ = 0;
			idQW = 1;
			var qx;
			var qy;
			var qz;
			var qw;
			var q1X;
			var q1Y;
			var q1Z;
			var q1W;
			var q2X;
			var q2Y;
			var q2Z;
			var q2W;
			q1X = idQX;
			q1Y = idQY;
			q1Z = idQZ;
			q1W = idQW;
			q2X = qX;
			q2Y = qY;
			q2Z = qZ;
			q2W = qW;
			var d2 = q1X * q2X + q1Y * q2Y + q1Z * q2Z + q1W * q2W;
			if (d2 < 0) {
				d2 = -d2;
				q2X = -q2X;
				q2Y = -q2Y;
				q2Z = -q2Z;
				q2W = -q2W;
			}
			if (d2 > 0.999999) {
				var dqX;
				var dqY;
				var dqZ;
				var dqW;
				dqX = q2X - q1X;
				dqY = q2Y - q1Y;
				dqZ = q2Z - q1Z;
				dqW = q2W - q1W;
				q2X = q1X + dqX * (invM1 / (invM1 + invM2));
				q2Y = q1Y + dqY * (invM1 / (invM1 + invM2));
				q2Z = q1Z + dqZ * (invM1 / (invM1 + invM2));
				q2W = q1W + dqW * (invM1 / (invM1 + invM2));
				var l = q2X * q2X + q2Y * q2Y + q2Z * q2Z + q2W * q2W;
				if (l > 1e-32) {
					l = 1 / Math.sqrt(l);
				}
				slerpQX = q2X * l;
				slerpQY = q2Y * l;
				slerpQZ = q2Z * l;
				slerpQW = q2W * l;
			} else {
				var theta = invM1 / (invM1 + invM2) * Math.acos(d2);
				q2X += q1X * -d2;
				q2Y += q1Y * -d2;
				q2Z += q1Z * -d2;
				q2W += q1W * -d2;
				var l1 = q2X * q2X + q2Y * q2Y + q2Z * q2Z + q2W * q2W;
				if (l1 > 1e-32) {
					l1 = 1 / Math.sqrt(l1);
				}
				q2X *= l1;
				q2Y *= l1;
				q2Z *= l1;
				q2W *= l1;
				var sin = Math.sin(theta);
				var cos = Math.cos(theta);
				q1X *= cos;
				q1Y *= cos;
				q1Z *= cos;
				q1W *= cos;
				slerpQX = q1X + q2X * sin;
				slerpQY = q1Y + q2Y * sin;
				slerpQZ = q1Z + q2Z * sin;
				slerpQW = q1W + q2W * sin;
			}
			var x = slerpQX;
			var y = slerpQY;
			var z = slerpQZ;
			var w1 = slerpQW;
			var x21 = 2 * x;
			var y21 = 2 * y;
			var z21 = 2 * z;
			var xx = x * x21;
			var yy = y * y21;
			var zz = z * z21;
			var xy = x * y21;
			var yz = y * z21;
			var xz = x * z21;
			var wx = w1 * x21;
			var wy = w1 * y21;
			var wz = w1 * z21;
			slerpM00 = 1 - yy - zz;
			slerpM01 = xy - wz;
			slerpM02 = xz + wy;
			slerpM10 = xy + wz;
			slerpM11 = 1 - xx - zz;
			slerpM12 = yz - wx;
			slerpM20 = xz - wy;
			slerpM21 = yz + wx;
			slerpM22 = 1 - xx - yy;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = slerpM00 * _this.joint._basisX1X + slerpM01 * _this.joint._basisX1Y + slerpM02 * _this.joint._basisX1Z;
			__tmp__Y = slerpM10 * _this.joint._basisX1X + slerpM11 * _this.joint._basisX1Y + slerpM12 * _this.joint._basisX1Z;
			__tmp__Z = slerpM20 * _this.joint._basisX1X + slerpM21 * _this.joint._basisX1Y + slerpM22 * _this.joint._basisX1Z;
			newXX = __tmp__X;
			newXY = __tmp__Y;
			newXZ = __tmp__Z;
			prevXX = _this.xX;
			prevXY = _this.xY;
			prevXZ = _this.xZ;
			prevYX = _this.yX;
			prevYY = _this.yY;
			prevYZ = _this.yZ;
			var d3 = prevXX * newXX + prevXY * newXY + prevXZ * newXZ;
			if (d3 < -0.999999999) {
				var vX1;
				var vY1;
				var vZ1;
				var x11 = prevXX;
				var y11 = prevXY;
				var z11 = prevXZ;
				var x22 = x11 * x11;
				var y22 = y11 * y11;
				var z22 = z11 * z11;
				var d4;
				if (x22 < y22) {
					if (x22 < z22) {
						d4 = 1 / Math.sqrt(y22 + z22);
						vX1 = 0;
						vY1 = z11 * d4;
						vZ1 = -y11 * d4;
					} else {
						d4 = 1 / Math.sqrt(x22 + y22);
						vX1 = y11 * d4;
						vY1 = -x11 * d4;
						vZ1 = 0;
					}
				} else if (y22 < z22) {
					d4 = 1 / Math.sqrt(z22 + x22);
					vX1 = -z11 * d4;
					vY1 = 0;
					vZ1 = x11 * d4;
				} else {
					d4 = 1 / Math.sqrt(x22 + y22);
					vX1 = y11 * d4;
					vY1 = -x11 * d4;
					vZ1 = 0;
				}
				slerpQX = vX1;
				slerpQY = vY1;
				slerpQZ = vZ1;
				slerpQW = 0;
			} else {
				var cX1;
				var cY1;
				var cZ1;
				cX1 = prevXY * newXZ - prevXZ * newXY;
				cY1 = prevXZ * newXX - prevXX * newXZ;
				cZ1 = prevXX * newXY - prevXY * newXX;
				var w2 = Math.sqrt((1 + d3) * 0.5);
				d3 = 0.5 / w2;
				cX1 *= d3;
				cY1 *= d3;
				cZ1 *= d3;
				slerpQX = cX1;
				slerpQY = cY1;
				slerpQZ = cZ1;
				slerpQW = w2;
			}
			var x3 = slerpQX;
			var y3 = slerpQY;
			var z3 = slerpQZ;
			var w3 = slerpQW;
			var x23 = 2 * x3;
			var y23 = 2 * y3;
			var z23 = 2 * z3;
			var xx1 = x3 * x23;
			var yy1 = y3 * y23;
			var zz1 = z3 * z23;
			var xy1 = x3 * y23;
			var yz1 = y3 * z23;
			var xz1 = x3 * z23;
			var wx1 = w3 * x23;
			var wy1 = w3 * y23;
			var wz1 = w3 * z23;
			slerpM00 = 1 - yy1 - zz1;
			slerpM01 = xy1 - wz1;
			slerpM02 = xz1 + wy1;
			slerpM10 = xy1 + wz1;
			slerpM11 = 1 - xx1 - zz1;
			slerpM12 = yz1 - wx1;
			slerpM20 = xz1 - wy1;
			slerpM21 = yz1 + wx1;
			slerpM22 = 1 - xx1 - yy1;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = slerpM00 * prevYX + slerpM01 * prevYY + slerpM02 * prevYZ;
			__tmp__Y1 = slerpM10 * prevYX + slerpM11 * prevYY + slerpM12 * prevYZ;
			__tmp__Z1 = slerpM20 * prevYX + slerpM21 * prevYY + slerpM22 * prevYZ;
			newYX = __tmp__X1;
			newYY = __tmp__Y1;
			newYZ = __tmp__Z1;
			newZX = newXY * newYZ - newXZ * newYY;
			newZY = newXZ * newYX - newXX * newYZ;
			newZZ = newXX * newYY - newXY * newYX;
			if (newZX * newZX + newZY * newZY + newZZ * newZZ > 1e-6) {
				var l2 = newZX * newZX + newZY * newZY + newZZ * newZZ;
				if (l2 > 0) {
					l2 = 1 / Math.sqrt(l2);
				}
				newZX *= l2;
				newZY *= l2;
				newZZ *= l2;
			} else {
				var x12 = newXX;
				var y12 = newXY;
				var z12 = newXZ;
				var x24 = x12 * x12;
				var y24 = y12 * y12;
				var z24 = z12 * z12;
				var d5;
				if (x24 < y24) {
					if (x24 < z24) {
						d5 = 1 / Math.sqrt(y24 + z24);
						newZX = 0;
						newZY = z12 * d5;
						newZZ = -y12 * d5;
					} else {
						d5 = 1 / Math.sqrt(x24 + y24);
						newZX = y12 * d5;
						newZY = -x12 * d5;
						newZZ = 0;
					}
				} else if (y24 < z24) {
					d5 = 1 / Math.sqrt(z24 + x24);
					newZX = -z12 * d5;
					newZY = 0;
					newZZ = x12 * d5;
				} else {
					d5 = 1 / Math.sqrt(x24 + y24);
					newZX = y12 * d5;
					newZY = -x12 * d5;
					newZZ = 0;
				}
			}
			newYX = newZY * newXZ - newZZ * newXY;
			newYY = newZZ * newXX - newZX * newXZ;
			newYZ = newZX * newXY - newZY * newXX;
			_this.xX = newXX;
			_this.xY = newXY;
			_this.xZ = newXZ;
			_this.yX = newYX;
			_this.yY = newYY;
			_this.yZ = newYZ;
			_this.zX = newZX;
			_this.zY = newZY;
			_this.zZ = newZZ;
			var angError;
			var angErrorX;
			var angErrorY;
			var angErrorZ;
			angErrorX = this._basisX1Y * this._basisX2Z - this._basisX1Z * this._basisX2Y;
			angErrorY = this._basisX1Z * this._basisX2X - this._basisX1X * this._basisX2Z;
			angErrorZ = this._basisX1X * this._basisX2Y - this._basisX1Y * this._basisX2X;
			var cos1 = this._basisX1X * this._basisX2X + this._basisX1Y * this._basisX2Y + this._basisX1Z * this._basisX2Z;
			var theta1 = cos1 <= -1 ? 3.14159265358979 : cos1 >= 1 ? 0 : Math.acos(cos1);
			var l3 = angErrorX * angErrorX + angErrorY * angErrorY + angErrorZ * angErrorZ;
			if (l3 > 0) {
				l3 = 1 / Math.sqrt(l3);
			}
			angErrorX *= l3;
			angErrorY *= l3;
			angErrorZ *= l3;
			angErrorX *= theta1;
			angErrorY *= theta1;
			angErrorZ *= theta1;
			this.angularErrorY = angErrorX * this._basis.yX + angErrorY * this._basis.yY + angErrorZ * this._basis.yZ;
			this.angularErrorZ = angErrorX * this._basis.zX + angErrorY * this._basis.zY + angErrorZ * this._basis.zZ;
			var perpCross;
			var perpCrossX;
			var perpCrossY;
			var perpCrossZ;
			perpCrossX = this._basisY1Y * this._basisY2Z - this._basisY1Z * this._basisY2Y;
			perpCrossY = this._basisY1Z * this._basisY2X - this._basisY1X * this._basisY2Z;
			perpCrossZ = this._basisY1X * this._basisY2Y - this._basisY1Y * this._basisY2X;
			cos1 = this._basisY1X * this._basisY2X + this._basisY1Y * this._basisY2Y + this._basisY1Z * this._basisY2Z;
			this.angle = cos1 <= -1 ? 3.14159265358979 : cos1 >= 1 ? 0 : Math.acos(cos1);
			if (perpCrossX * this._basis.xX + perpCrossY * this._basis.xY + perpCrossZ * this._basis.xZ < 0) {
				this.angle = -this.angle;
			}
			this.linearErrorX = this._anchor2X - this._anchor1X;
			this.linearErrorY = this._anchor2Y - this._anchor1Y;
			this.linearErrorZ = this._anchor2Z - this._anchor1Z;
		}

		proto._getVelocitySolverInfo = function (timeStep, info) {
			dynamics.constraint.joint.Joint.prototype._getVelocitySolverInfo.call(this, timeStep, info);
			this.getInfo(info, timeStep, false);
		}

		proto._getPositionSolverInfo = function (info) {
			dynamics.constraint.joint.Joint.prototype._getPositionSolverInfo.call(this, info);
			this.getInfo(info, null, true);
		}

		proto.getAxis1To = function (axis) {
			var v = axis;
			v[0] = this._basisX1X;
			v[1] = this._basisX1Y;
			v[2] = this._basisX1Z;
		}

		proto.getAxis2To = function (axis) {
			var v = axis;
			v[0] = this._basisX2X;
			v[1] = this._basisX2Y;
			v[2] = this._basisX2Z;
		}

		proto.getLocalAxis1To = function (axis) {
			var v = axis;
			v[0] = this._localBasisX1X;
			v[1] = this._localBasisX1Y;
			v[2] = this._localBasisX1Z;
		}

		proto.getLocalAxis2To = function (axis) {
			var v = axis;
			v[0] = this._localBasisX2X;
			v[1] = this._localBasisX2Y;
			v[2] = this._localBasisX2Z;
		}

		proto.getSpringDamper = function () {
			return this._sd;
		}

		proto.getLimitMotor = function () {
			return this._lm;
		}

		proto.getAngle = function () {
			return this.angle;
		}

		proto._checkDestruction = function () {
			var forceSq = this._appliedForceX * this._appliedForceX + this._appliedForceY * this._appliedForceY + this._appliedForceZ * this._appliedForceZ;
			var torqueSq = this._appliedTorqueX * this._appliedTorqueX + this._appliedTorqueY * this._appliedTorqueY + this._appliedTorqueZ * this._appliedTorqueZ;
			if (this._breakForce > 0 && forceSq > this._breakForce * this._breakForce) {
				this._world.removeJoint(this);
				return;
			}
			if (this._breakTorque > 0 && torqueSq > this._breakTorque * this._breakTorque) {
				this._world.removeJoint(this);
				return;
			}
		}

		proto.getRigidBody1 = function () {
			return this._b1;
		}

		proto.getRigidBody2 = function () {
			return this._b2;
		}

		proto.getType = function () {
			return this._type;
		}

		proto.getAnchor1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._anchor1X;
			v1[1] = this._anchor1Y;
			v1[2] = this._anchor1Z;
			return v;
		}

		proto.getAnchor2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._anchor2X;
			v1[1] = this._anchor2Y;
			v1[2] = this._anchor2Z;
			return v;
		}

		proto.getAnchor1To = function (anchor) {
			var v = anchor;
			v[0] = this._anchor1X;
			v[1] = this._anchor1Y;
			v[2] = this._anchor1Z;
		}

		proto.getAnchor2To = function (anchor) {
			var v = anchor;
			v[0] = this._anchor2X;
			v[1] = this._anchor2Y;
			v[2] = this._anchor2Z;
		}

		proto.getLocalAnchor1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localAnchor1X;
			v1[1] = this._localAnchor1Y;
			v1[2] = this._localAnchor1Z;
			return v;
		}

		proto.getLocalAnchor2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localAnchor2X;
			v1[1] = this._localAnchor2Y;
			v1[2] = this._localAnchor2Z;
			return v;
		}

		proto.getLocalAnchor1To = function (localAnchor) {
			var v = localAnchor;
			v[0] = this._localAnchor1X;
			v[1] = this._localAnchor1Y;
			v[2] = this._localAnchor1Z;
		}

		proto.getLocalAnchor2To = function (localAnchor) {
			var v = localAnchor;
			v[0] = this._localAnchor2X;
			v[1] = this._localAnchor2Y;
			v[2] = this._localAnchor2Z;
		}

		proto.getAllowCollision = function () {
			return this._allowCollision;
		}

		proto.setAllowCollision = function (allowCollision) {
			this._allowCollision = allowCollision;
		}

		proto.getBreakForce = function () {
			return this._breakForce;
		}

		proto.setBreakForce = function (breakForce) {
			this._breakForce = breakForce;
		}

		proto.getBreakTorque = function () {
			return this._breakTorque;
		}

		proto.setBreakTorque = function (breakTorque) {
			this._breakTorque = breakTorque;
		}

		proto.getPositionCorrectionAlgorithm = function () {
			return this._positionCorrectionAlgorithm;
		}

		proto.setPositionCorrectionAlgorithm = function (positionCorrectionAlgorithm) {
			switch (positionCorrectionAlgorithm) {
				case 0: case 1: case 2:
					break;
				default:
					throw new Error("invalid position correction algorithm id: " + positionCorrectionAlgorithm);
			}
			this._positionCorrectionAlgorithm = positionCorrectionAlgorithm;
		}

		proto.getAppliedForce = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._appliedForceX;
			v1[1] = this._appliedForceY;
			v1[2] = this._appliedForceZ;
			return v;
		}

		proto.getAppliedForceTo = function (appliedForce) {
			var v = appliedForce;
			v[0] = this._appliedForceX;
			v[1] = this._appliedForceY;
			v[2] = this._appliedForceZ;
		}

		proto.getAppliedTorque = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._appliedTorqueX;
			v1[1] = this._appliedTorqueY;
			v1[2] = this._appliedTorqueZ;
			return v;
		}

		proto.getAppliedTorqueTo = function (appliedTorque) {
			var v = appliedTorque;
			v[0] = this._appliedTorqueX;
			v[1] = this._appliedTorqueY;
			v[2] = this._appliedTorqueZ;
		}

		proto.getPrev = function () {
			return this._prev;
		}

		proto.getNext = function () {
			return this._next;
		}

		var RevoluteJoint = function (config) {
			dynamics.constraint.joint.Joint.call(this, config, 1);
			var v = config.localAxis1;
			this._localBasisX1X = v[0];
			this._localBasisX1Y = v[1];
			this._localBasisX1Z = v[2];
			var v1 = config.localAxis2;
			this._localBasisX2X = v1[0];
			this._localBasisX2Y = v1[1];
			this._localBasisX2Z = v1[2];
			if (this._localBasisX1X * this._localBasisX1X + this._localBasisX1Y * this._localBasisX1Y + this._localBasisX1Z * this._localBasisX1Z == 0) {
				this._localBasisX1X = 1;
				this._localBasisX1Y = 0;
				this._localBasisX1Z = 0;
			} else {
				var l = this._localBasisX1X * this._localBasisX1X + this._localBasisX1Y * this._localBasisX1Y + this._localBasisX1Z * this._localBasisX1Z;
				if (l > 0) {
					l = 1 / Math.sqrt(l);
				}
				this._localBasisX1X *= l;
				this._localBasisX1Y *= l;
				this._localBasisX1Z *= l;
			}
			if (this._localBasisX2X * this._localBasisX2X + this._localBasisX2Y * this._localBasisX2Y + this._localBasisX2Z * this._localBasisX2Z == 0) {
				this._localBasisX2X = 1;
				this._localBasisX2Y = 0;
				this._localBasisX2Z = 0;
			} else {
				var l1 = this._localBasisX2X * this._localBasisX2X + this._localBasisX2Y * this._localBasisX2Y + this._localBasisX2Z * this._localBasisX2Z;
				if (l1 > 0) {
					l1 = 1 / Math.sqrt(l1);
				}
				this._localBasisX2X *= l1;
				this._localBasisX2Y *= l1;
				this._localBasisX2Z *= l1;
			}
			var slerpQ;
			var slerpQX;
			var slerpQY;
			var slerpQZ;
			var slerpQW;
			var slerpM;
			var slerpM00;
			var slerpM01;
			var slerpM02;
			var slerpM10;
			var slerpM11;
			var slerpM12;
			var slerpM20;
			var slerpM21;
			var slerpM22;
			var d = this._localBasisX1X * this._localBasisX2X + this._localBasisX1Y * this._localBasisX2Y + this._localBasisX1Z * this._localBasisX2Z;
			if (d < -0.999999999) {
				var vX;
				var vY;
				var vZ;
				var x1 = this._localBasisX1X;
				var y1 = this._localBasisX1Y;
				var z1 = this._localBasisX1Z;
				var x2 = x1 * x1;
				var y2 = y1 * y1;
				var z2 = z1 * z1;
				var d1;
				if (x2 < y2) {
					if (x2 < z2) {
						d1 = 1 / Math.sqrt(y2 + z2);
						vX = 0;
						vY = z1 * d1;
						vZ = -y1 * d1;
					} else {
						d1 = 1 / Math.sqrt(x2 + y2);
						vX = y1 * d1;
						vY = -x1 * d1;
						vZ = 0;
					}
				} else if (y2 < z2) {
					d1 = 1 / Math.sqrt(z2 + x2);
					vX = -z1 * d1;
					vY = 0;
					vZ = x1 * d1;
				} else {
					d1 = 1 / Math.sqrt(x2 + y2);
					vX = y1 * d1;
					vY = -x1 * d1;
					vZ = 0;
				}
				slerpQX = vX;
				slerpQY = vY;
				slerpQZ = vZ;
				slerpQW = 0;
			} else {
				var cX;
				var cY;
				var cZ;
				cX = this._localBasisX1Y * this._localBasisX2Z - this._localBasisX1Z * this._localBasisX2Y;
				cY = this._localBasisX1Z * this._localBasisX2X - this._localBasisX1X * this._localBasisX2Z;
				cZ = this._localBasisX1X * this._localBasisX2Y - this._localBasisX1Y * this._localBasisX2X;
				var w = Math.sqrt((1 + d) * 0.5);
				d = 0.5 / w;
				cX *= d;
				cY *= d;
				cZ *= d;
				slerpQX = cX;
				slerpQY = cY;
				slerpQZ = cZ;
				slerpQW = w;
			}
			var x = slerpQX;
			var y = slerpQY;
			var z = slerpQZ;
			var w1 = slerpQW;
			var x21 = 2 * x;
			var y21 = 2 * y;
			var z21 = 2 * z;
			var xx = x * x21;
			var yy = y * y21;
			var zz = z * z21;
			var xy = x * y21;
			var yz = y * z21;
			var xz = x * z21;
			var wx = w1 * x21;
			var wy = w1 * y21;
			var wz = w1 * z21;
			slerpM00 = 1 - yy - zz;
			slerpM01 = xy - wz;
			slerpM02 = xz + wy;
			slerpM10 = xy + wz;
			slerpM11 = 1 - xx - zz;
			slerpM12 = yz - wx;
			slerpM20 = xz - wy;
			slerpM21 = yz + wx;
			slerpM22 = 1 - xx - yy;
			var x11 = this._localBasisX1X;
			var y11 = this._localBasisX1Y;
			var z11 = this._localBasisX1Z;
			var x22 = x11 * x11;
			var y22 = y11 * y11;
			var z22 = z11 * z11;
			var d2;
			if (x22 < y22) {
				if (x22 < z22) {
					d2 = 1 / Math.sqrt(y22 + z22);
					this._localBasisY1X = 0;
					this._localBasisY1Y = z11 * d2;
					this._localBasisY1Z = -y11 * d2;
				} else {
					d2 = 1 / Math.sqrt(x22 + y22);
					this._localBasisY1X = y11 * d2;
					this._localBasisY1Y = -x11 * d2;
					this._localBasisY1Z = 0;
				}
			} else if (y22 < z22) {
				d2 = 1 / Math.sqrt(z22 + x22);
				this._localBasisY1X = -z11 * d2;
				this._localBasisY1Y = 0;
				this._localBasisY1Z = x11 * d2;
			} else {
				d2 = 1 / Math.sqrt(x22 + y22);
				this._localBasisY1X = y11 * d2;
				this._localBasisY1Y = -x11 * d2;
				this._localBasisY1Z = 0;
			}
			this._localBasisZ1X = this._localBasisX1Y * this._localBasisY1Z - this._localBasisX1Z * this._localBasisY1Y;
			this._localBasisZ1Y = this._localBasisX1Z * this._localBasisY1X - this._localBasisX1X * this._localBasisY1Z;
			this._localBasisZ1Z = this._localBasisX1X * this._localBasisY1Y - this._localBasisX1Y * this._localBasisY1X;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = slerpM00 * this._localBasisX1X + slerpM01 * this._localBasisX1Y + slerpM02 * this._localBasisX1Z;
			__tmp__Y = slerpM10 * this._localBasisX1X + slerpM11 * this._localBasisX1Y + slerpM12 * this._localBasisX1Z;
			__tmp__Z = slerpM20 * this._localBasisX1X + slerpM21 * this._localBasisX1Y + slerpM22 * this._localBasisX1Z;
			this._localBasisX2X = __tmp__X;
			this._localBasisX2Y = __tmp__Y;
			this._localBasisX2Z = __tmp__Z;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = slerpM00 * this._localBasisY1X + slerpM01 * this._localBasisY1Y + slerpM02 * this._localBasisY1Z;
			__tmp__Y1 = slerpM10 * this._localBasisY1X + slerpM11 * this._localBasisY1Y + slerpM12 * this._localBasisY1Z;
			__tmp__Z1 = slerpM20 * this._localBasisY1X + slerpM21 * this._localBasisY1Y + slerpM22 * this._localBasisY1Z;
			this._localBasisY2X = __tmp__X1;
			this._localBasisY2Y = __tmp__Y1;
			this._localBasisY2Z = __tmp__Z1;
			var __tmp__X2;
			var __tmp__Y2;
			var __tmp__Z2;
			__tmp__X2 = slerpM00 * this._localBasisZ1X + slerpM01 * this._localBasisZ1Y + slerpM02 * this._localBasisZ1Z;
			__tmp__Y2 = slerpM10 * this._localBasisZ1X + slerpM11 * this._localBasisZ1Y + slerpM12 * this._localBasisZ1Z;
			__tmp__Z2 = slerpM20 * this._localBasisZ1X + slerpM21 * this._localBasisZ1Y + slerpM22 * this._localBasisZ1Z;
			this._localBasisZ2X = __tmp__X2;
			this._localBasisZ2Y = __tmp__Y2;
			this._localBasisZ2Z = __tmp__Z2;
			this.angle = 0;
			this.angularErrorY = 0;
			this.angularErrorZ = 0;
			this._basis = new dynamics.constraint.joint.JointBasis(this);
			this._sd = config.springDamper.clone();
			this._lm = config.limitMotor.clone();
		}
		return RevoluteJoint;
	});

	dynamics.constraint.joint.RevoluteJointConfig = pe.define(function (proto) {
		proto.init = function (rigidBody1, rigidBody2, worldAnchor, worldAxis) {
			this._init(rigidBody1, rigidBody2, worldAnchor);
			var v;
			var vX;
			var vY;
			var vZ;
			var v1 = worldAxis;
			vX = v1[0];
			vY = v1[1];
			vZ = v1[2];
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = rigidBody1._transform._rotation[0] * vX + rigidBody1._transform._rotation[3] * vY + rigidBody1._transform._rotation[6] * vZ;
			__tmp__Y = rigidBody1._transform._rotation[1] * vX + rigidBody1._transform._rotation[4] * vY + rigidBody1._transform._rotation[7] * vZ;
			__tmp__Z = rigidBody1._transform._rotation[2] * vX + rigidBody1._transform._rotation[5] * vY + rigidBody1._transform._rotation[8] * vZ;
			vX = __tmp__X;
			vY = __tmp__Y;
			vZ = __tmp__Z;
			var v2 = this.localAxis1;
			v2[0] = vX;
			v2[1] = vY;
			v2[2] = vZ;
			var v3;
			var vX1;
			var vY1;
			var vZ1;
			var v4 = worldAxis;
			vX1 = v4[0];
			vY1 = v4[1];
			vZ1 = v4[2];
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = rigidBody2._transform._rotation[0] * vX1 + rigidBody2._transform._rotation[3] * vY1 + rigidBody2._transform._rotation[6] * vZ1;
			__tmp__Y1 = rigidBody2._transform._rotation[1] * vX1 + rigidBody2._transform._rotation[4] * vY1 + rigidBody2._transform._rotation[7] * vZ1;
			__tmp__Z1 = rigidBody2._transform._rotation[2] * vX1 + rigidBody2._transform._rotation[5] * vY1 + rigidBody2._transform._rotation[8] * vZ1;
			vX1 = __tmp__X1;
			vY1 = __tmp__Y1;
			vZ1 = __tmp__Z1;
			var v5 = this.localAxis2;
			v5[0] = vX1;
			v5[1] = vY1;
			v5[2] = vZ1;
			return this;
		}

		proto._init = function (rb1, rb2, worldAnchor) {
			this.rigidBody1 = rb1;
			this.rigidBody2 = rb2;
			var _this = this.rigidBody1;
			var v;
			var vX;
			var vY;
			var vZ;
			var v1 = worldAnchor;
			vX = v1[0];
			vY = v1[1];
			vZ = v1[2];
			vX -= _this._transform._position[0];
			vY -= _this._transform._position[1];
			vZ -= _this._transform._position[2];
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = _this._transform._rotation[0] * vX + _this._transform._rotation[3] * vY + _this._transform._rotation[6] * vZ;
			__tmp__Y = _this._transform._rotation[1] * vX + _this._transform._rotation[4] * vY + _this._transform._rotation[7] * vZ;
			__tmp__Z = _this._transform._rotation[2] * vX + _this._transform._rotation[5] * vY + _this._transform._rotation[8] * vZ;
			vX = __tmp__X;
			vY = __tmp__Y;
			vZ = __tmp__Z;
			var v2 = this.localAnchor1;
			v2[0] = vX;
			v2[1] = vY;
			v2[2] = vZ;
			var _this1 = this.rigidBody2;
			var v3;
			var vX1;
			var vY1;
			var vZ1;
			var v4 = worldAnchor;
			vX1 = v4[0];
			vY1 = v4[1];
			vZ1 = v4[2];
			vX1 -= _this1._transform._position[0];
			vY1 -= _this1._transform._position[1];
			vZ1 -= _this1._transform._position[2];
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = _this1._transform._rotation[0] * vX1 + _this1._transform._rotation[3] * vY1 + _this1._transform._rotation[6] * vZ1;
			__tmp__Y1 = _this1._transform._rotation[1] * vX1 + _this1._transform._rotation[4] * vY1 + _this1._transform._rotation[7] * vZ1;
			__tmp__Z1 = _this1._transform._rotation[2] * vX1 + _this1._transform._rotation[5] * vY1 + _this1._transform._rotation[8] * vZ1;
			vX1 = __tmp__X1;
			vY1 = __tmp__Y1;
			vZ1 = __tmp__Z1;
			var v5 = this.localAnchor2;
			v5[0] = vX1;
			v5[1] = vY1;
			v5[2] = vZ1;
		}

		var RevoluteJointConfig = function () {
			dynamics.constraint.joint.JointConfig.call(this);
			this.localAxis1 = vec3(1, 0, 0);
			this.localAxis2 = vec3(1, 0, 0);
			this.springDamper = new dynamics.constraint.joint.SpringDamper();
			this.limitMotor = new dynamics.constraint.joint.RotationalLimitMotor();
		}
		return RevoluteJointConfig;
	});

	dynamics.constraint.joint.RotationalLimitMotor = pe.define(function (proto) {
		proto.setLimits = function (lower, upper) {
			this.lowerLimit = lower;
			this.upperLimit = upper;
			return this;
		}

		proto.setMotor = function (speed, torque) {
			this.motorSpeed = speed;
			this.motorTorque = torque;
			return this;
		}

		proto.clone = function () {
			var lm = new dynamics.constraint.joint.RotationalLimitMotor();
			lm.lowerLimit = this.lowerLimit;
			lm.upperLimit = this.upperLimit;
			lm.motorSpeed = this.motorSpeed;
			lm.motorTorque = this.motorTorque;
			return lm;
		}

		var RotationalLimitMotor = function () {
			this.lowerLimit = 1;
			this.upperLimit = 0;
			this.motorTorque = 0;
		}
		return RotationalLimitMotor;
	});

	dynamics.constraint.joint.SphericalJoint = pe.define(function (proto) {
		proto.getInfo = function (info, timeStep, isPositionPart) {
			if (this._sd.frequency > 0 && isPositionPart) {
				return;
			}
			var error;
			var errorX;
			var errorY;
			var errorZ;
			errorX = this._anchor2X - this._anchor1X;
			errorY = this._anchor2Y - this._anchor1Y;
			errorZ = this._anchor2Z - this._anchor1Z;
			var cfm;
			var erp;
			if (this._sd.frequency > 0) {
				var omega = 6.28318530717958 * this._sd.frequency;
				var zeta = this._sd.dampingRatio;
				if (zeta < pe.common.Setting.minSpringDamperDampingRatio) {
					zeta = pe.common.Setting.minSpringDamperDampingRatio;
				}
				var h = timeStep.dt;
				var c = 2 * zeta * omega;
				var k = omega * omega;
				if (this._sd.useSymplecticEuler) {
					cfm = 1 / (h * c);
					erp = k / c;
				} else {
					cfm = 1 / (h * (h * k + c));
					erp = k / (h * k + c);
				}
				cfm *= this._b1._invMass + this._b2._invMass;
			} else {
				cfm = 0;
				erp = isPositionPart ? 1 : this._positionCorrectionAlgorithm == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? timeStep.invDt * pe.common.Setting.velocityBaumgarte : 0;
			}
			var linearRhs;
			var linearRhsX;
			var linearRhsY;
			var linearRhsZ;
			linearRhsX = errorX * erp;
			linearRhsY = errorY * erp;
			linearRhsZ = errorZ * erp;
			var linRhsX = linearRhsX;
			var linRhsY = linearRhsY;
			var linRhsZ = linearRhsZ;
			var crossR1;
			var crossR100;
			var crossR101;
			var crossR102;
			var crossR110;
			var crossR111;
			var crossR112;
			var crossR120;
			var crossR121;
			var crossR122;
			var crossR2;
			var crossR200;
			var crossR201;
			var crossR202;
			var crossR210;
			var crossR211;
			var crossR212;
			var crossR220;
			var crossR221;
			var crossR222;
			crossR100 = 0;
			crossR101 = -this._relativeAnchor1Z;
			crossR102 = this._relativeAnchor1Y;
			crossR110 = this._relativeAnchor1Z;
			crossR111 = 0;
			crossR112 = -this._relativeAnchor1X;
			crossR120 = -this._relativeAnchor1Y;
			crossR121 = this._relativeAnchor1X;
			crossR122 = 0;
			crossR200 = 0;
			crossR201 = -this._relativeAnchor2Z;
			crossR202 = this._relativeAnchor2Y;
			crossR210 = this._relativeAnchor2Z;
			crossR211 = 0;
			crossR212 = -this._relativeAnchor2X;
			crossR220 = -this._relativeAnchor2Y;
			crossR221 = this._relativeAnchor2X;
			crossR222 = 0;
			crossR100 = -crossR100;
			crossR101 = -crossR101;
			crossR102 = -crossR102;
			crossR110 = -crossR110;
			crossR111 = -crossR111;
			crossR112 = -crossR112;
			crossR120 = -crossR120;
			crossR121 = -crossR121;
			crossR122 = -crossR122;
			crossR200 = -crossR200;
			crossR201 = -crossR201;
			crossR202 = -crossR202;
			crossR210 = -crossR210;
			crossR211 = -crossR211;
			crossR212 = -crossR212;
			crossR220 = -crossR220;
			crossR221 = -crossR221;
			crossR222 = -crossR222;
			var impulse = this._impulses[0];
			var row = info.rows[info.numRows++];
			var _this = row.jacobian;
			_this.lin1X = 0;
			_this.lin1Y = 0;
			_this.lin1Z = 0;
			_this.lin2X = 0;
			_this.lin2Y = 0;
			_this.lin2Z = 0;
			_this.ang1X = 0;
			_this.ang1Y = 0;
			_this.ang1Z = 0;
			_this.ang2X = 0;
			_this.ang2Y = 0;
			_this.ang2Z = 0;
			row.rhs = 0;
			row.cfm = 0;
			row.minImpulse = 0;
			row.maxImpulse = 0;
			row.motorSpeed = 0;
			row.motorMaxImpulse = 0;
			row.impulse = null;
			row.impulse = impulse;
			var row1 = row;
			row1.rhs = linRhsX;
			row1.cfm = cfm;
			row1.minImpulse = -1.0 / 0.0;
			row1.maxImpulse = 1.0 / 0.0;
			var j = row1.jacobian;
			j.lin1X = 1;
			j.lin1Y = 0;
			j.lin1Z = 0;
			j.lin2X = 1;
			j.lin2Y = 0;
			j.lin2Z = 0;
			j.ang1X = crossR100;
			j.ang1Y = crossR101;
			j.ang1Z = crossR102;
			j.ang2X = crossR200;
			j.ang2Y = crossR201;
			j.ang2Z = crossR202;
			var impulse1 = this._impulses[1];
			var row2 = info.rows[info.numRows++];
			var _this1 = row2.jacobian;
			_this1.lin1X = 0;
			_this1.lin1Y = 0;
			_this1.lin1Z = 0;
			_this1.lin2X = 0;
			_this1.lin2Y = 0;
			_this1.lin2Z = 0;
			_this1.ang1X = 0;
			_this1.ang1Y = 0;
			_this1.ang1Z = 0;
			_this1.ang2X = 0;
			_this1.ang2Y = 0;
			_this1.ang2Z = 0;
			row2.rhs = 0;
			row2.cfm = 0;
			row2.minImpulse = 0;
			row2.maxImpulse = 0;
			row2.motorSpeed = 0;
			row2.motorMaxImpulse = 0;
			row2.impulse = null;
			row2.impulse = impulse1;
			row1 = row2;
			row1.rhs = linRhsY;
			row1.cfm = cfm;
			row1.minImpulse = -1.0 / 0.0;
			row1.maxImpulse = 1.0 / 0.0;
			j = row1.jacobian;
			j.lin1X = 0;
			j.lin1Y = 1;
			j.lin1Z = 0;
			j.lin2X = 0;
			j.lin2Y = 1;
			j.lin2Z = 0;
			j.ang1X = crossR110;
			j.ang1Y = crossR111;
			j.ang1Z = crossR112;
			j.ang2X = crossR210;
			j.ang2Y = crossR211;
			j.ang2Z = crossR212;
			var impulse2 = this._impulses[2];
			var row3 = info.rows[info.numRows++];
			var _this2 = row3.jacobian;
			_this2.lin1X = 0;
			_this2.lin1Y = 0;
			_this2.lin1Z = 0;
			_this2.lin2X = 0;
			_this2.lin2Y = 0;
			_this2.lin2Z = 0;
			_this2.ang1X = 0;
			_this2.ang1Y = 0;
			_this2.ang1Z = 0;
			_this2.ang2X = 0;
			_this2.ang2Y = 0;
			_this2.ang2Z = 0;
			row3.rhs = 0;
			row3.cfm = 0;
			row3.minImpulse = 0;
			row3.maxImpulse = 0;
			row3.motorSpeed = 0;
			row3.motorMaxImpulse = 0;
			row3.impulse = null;
			row3.impulse = impulse2;
			row1 = row3;
			row1.rhs = linRhsZ;
			row1.cfm = cfm;
			row1.minImpulse = -1.0 / 0.0;
			row1.maxImpulse = 1.0 / 0.0;
			j = row1.jacobian;
			j.lin1X = 0;
			j.lin1Y = 0;
			j.lin1Z = 1;
			j.lin2X = 0;
			j.lin2Y = 0;
			j.lin2Z = 1;
			j.ang1X = crossR120;
			j.ang1Y = crossR121;
			j.ang1Z = crossR122;
			j.ang2X = crossR220;
			j.ang2Y = crossR221;
			j.ang2Z = crossR222;
		}

		proto._getVelocitySolverInfo = function (timeStep, info) {
			dynamics.constraint.joint.Joint.prototype._getVelocitySolverInfo.call(this, timeStep, info);
			this.getInfo(info, timeStep, false);
		}

		proto._getPositionSolverInfo = function (info) {
			dynamics.constraint.joint.Joint.prototype._getPositionSolverInfo.call(this, info);
			this.getInfo(info, null, true);
		}

		proto.getSpringDamper = function () {
			return this._sd;
		}

		proto._syncAnchors = function () {
			var tf1 = this._b1._transform;
			var tf2 = this._b2._transform;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = tf1._rotation[0] * this._localAnchor1X + tf1._rotation[1] * this._localAnchor1Y + tf1._rotation[2] * this._localAnchor1Z;
			__tmp__Y = tf1._rotation[3] * this._localAnchor1X + tf1._rotation[4] * this._localAnchor1Y + tf1._rotation[5] * this._localAnchor1Z;
			__tmp__Z = tf1._rotation[6] * this._localAnchor1X + tf1._rotation[7] * this._localAnchor1Y + tf1._rotation[8] * this._localAnchor1Z;
			this._relativeAnchor1X = __tmp__X;
			this._relativeAnchor1Y = __tmp__Y;
			this._relativeAnchor1Z = __tmp__Z;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = tf2._rotation[0] * this._localAnchor2X + tf2._rotation[1] * this._localAnchor2Y + tf2._rotation[2] * this._localAnchor2Z;
			__tmp__Y1 = tf2._rotation[3] * this._localAnchor2X + tf2._rotation[4] * this._localAnchor2Y + tf2._rotation[5] * this._localAnchor2Z;
			__tmp__Z1 = tf2._rotation[6] * this._localAnchor2X + tf2._rotation[7] * this._localAnchor2Y + tf2._rotation[8] * this._localAnchor2Z;
			this._relativeAnchor2X = __tmp__X1;
			this._relativeAnchor2Y = __tmp__Y1;
			this._relativeAnchor2Z = __tmp__Z1;
			this._anchor1X = this._relativeAnchor1X + tf1._position[0];
			this._anchor1Y = this._relativeAnchor1Y + tf1._position[1];
			this._anchor1Z = this._relativeAnchor1Z + tf1._position[2];
			this._anchor2X = this._relativeAnchor2X + tf2._position[0];
			this._anchor2Y = this._relativeAnchor2Y + tf2._position[1];
			this._anchor2Z = this._relativeAnchor2Z + tf2._position[2];
			var __tmp__X2;
			var __tmp__Y2;
			var __tmp__Z2;
			__tmp__X2 = tf1._rotation[0] * this._localBasisX1X + tf1._rotation[1] * this._localBasisX1Y + tf1._rotation[2] * this._localBasisX1Z;
			__tmp__Y2 = tf1._rotation[3] * this._localBasisX1X + tf1._rotation[4] * this._localBasisX1Y + tf1._rotation[5] * this._localBasisX1Z;
			__tmp__Z2 = tf1._rotation[6] * this._localBasisX1X + tf1._rotation[7] * this._localBasisX1Y + tf1._rotation[8] * this._localBasisX1Z;
			this._basisX1X = __tmp__X2;
			this._basisX1Y = __tmp__Y2;
			this._basisX1Z = __tmp__Z2;
			var __tmp__X3;
			var __tmp__Y3;
			var __tmp__Z3;
			__tmp__X3 = tf1._rotation[0] * this._localBasisY1X + tf1._rotation[1] * this._localBasisY1Y + tf1._rotation[2] * this._localBasisY1Z;
			__tmp__Y3 = tf1._rotation[3] * this._localBasisY1X + tf1._rotation[4] * this._localBasisY1Y + tf1._rotation[5] * this._localBasisY1Z;
			__tmp__Z3 = tf1._rotation[6] * this._localBasisY1X + tf1._rotation[7] * this._localBasisY1Y + tf1._rotation[8] * this._localBasisY1Z;
			this._basisY1X = __tmp__X3;
			this._basisY1Y = __tmp__Y3;
			this._basisY1Z = __tmp__Z3;
			var __tmp__X4;
			var __tmp__Y4;
			var __tmp__Z4;
			__tmp__X4 = tf1._rotation[0] * this._localBasisZ1X + tf1._rotation[1] * this._localBasisZ1Y + tf1._rotation[2] * this._localBasisZ1Z;
			__tmp__Y4 = tf1._rotation[3] * this._localBasisZ1X + tf1._rotation[4] * this._localBasisZ1Y + tf1._rotation[5] * this._localBasisZ1Z;
			__tmp__Z4 = tf1._rotation[6] * this._localBasisZ1X + tf1._rotation[7] * this._localBasisZ1Y + tf1._rotation[8] * this._localBasisZ1Z;
			this._basisZ1X = __tmp__X4;
			this._basisZ1Y = __tmp__Y4;
			this._basisZ1Z = __tmp__Z4;
			var __tmp__X5;
			var __tmp__Y5;
			var __tmp__Z5;
			__tmp__X5 = tf2._rotation[0] * this._localBasisX2X + tf2._rotation[1] * this._localBasisX2Y + tf2._rotation[2] * this._localBasisX2Z;
			__tmp__Y5 = tf2._rotation[3] * this._localBasisX2X + tf2._rotation[4] * this._localBasisX2Y + tf2._rotation[5] * this._localBasisX2Z;
			__tmp__Z5 = tf2._rotation[6] * this._localBasisX2X + tf2._rotation[7] * this._localBasisX2Y + tf2._rotation[8] * this._localBasisX2Z;
			this._basisX2X = __tmp__X5;
			this._basisX2Y = __tmp__Y5;
			this._basisX2Z = __tmp__Z5;
			var __tmp__X6;
			var __tmp__Y6;
			var __tmp__Z6;
			__tmp__X6 = tf2._rotation[0] * this._localBasisY2X + tf2._rotation[1] * this._localBasisY2Y + tf2._rotation[2] * this._localBasisY2Z;
			__tmp__Y6 = tf2._rotation[3] * this._localBasisY2X + tf2._rotation[4] * this._localBasisY2Y + tf2._rotation[5] * this._localBasisY2Z;
			__tmp__Z6 = tf2._rotation[6] * this._localBasisY2X + tf2._rotation[7] * this._localBasisY2Y + tf2._rotation[8] * this._localBasisY2Z;
			this._basisY2X = __tmp__X6;
			this._basisY2Y = __tmp__Y6;
			this._basisY2Z = __tmp__Z6;
			var __tmp__X7;
			var __tmp__Y7;
			var __tmp__Z7;
			__tmp__X7 = tf2._rotation[0] * this._localBasisZ2X + tf2._rotation[1] * this._localBasisZ2Y + tf2._rotation[2] * this._localBasisZ2Z;
			__tmp__Y7 = tf2._rotation[3] * this._localBasisZ2X + tf2._rotation[4] * this._localBasisZ2Y + tf2._rotation[5] * this._localBasisZ2Z;
			__tmp__Z7 = tf2._rotation[6] * this._localBasisZ2X + tf2._rotation[7] * this._localBasisZ2Y + tf2._rotation[8] * this._localBasisZ2Z;
			this._basisZ2X = __tmp__X7;
			this._basisZ2Y = __tmp__Y7;
			this._basisZ2Z = __tmp__Z7;
		}

		proto._checkDestruction = function () {
			var forceSq = this._appliedForceX * this._appliedForceX + this._appliedForceY * this._appliedForceY + this._appliedForceZ * this._appliedForceZ;
			var torqueSq = this._appliedTorqueX * this._appliedTorqueX + this._appliedTorqueY * this._appliedTorqueY + this._appliedTorqueZ * this._appliedTorqueZ;
			if (this._breakForce > 0 && forceSq > this._breakForce * this._breakForce) {
				this._world.removeJoint(this);
				return;
			}
			if (this._breakTorque > 0 && torqueSq > this._breakTorque * this._breakTorque) {
				this._world.removeJoint(this);
				return;
			}
		}

		proto.getRigidBody1 = function () {
			return this._b1;
		}

		proto.getRigidBody2 = function () {
			return this._b2;
		}

		proto.getType = function () {
			return this._type;
		}

		proto.getAnchor1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._anchor1X;
			v1[1] = this._anchor1Y;
			v1[2] = this._anchor1Z;
			return v;
		}

		proto.getAnchor2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._anchor2X;
			v1[1] = this._anchor2Y;
			v1[2] = this._anchor2Z;
			return v;
		}

		proto.getAnchor1To = function (anchor) {
			var v = anchor;
			v[0] = this._anchor1X;
			v[1] = this._anchor1Y;
			v[2] = this._anchor1Z;
		}

		proto.getAnchor2To = function (anchor) {
			var v = anchor;
			v[0] = this._anchor2X;
			v[1] = this._anchor2Y;
			v[2] = this._anchor2Z;
		}

		proto.getLocalAnchor1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localAnchor1X;
			v1[1] = this._localAnchor1Y;
			v1[2] = this._localAnchor1Z;
			return v;
		}

		proto.getLocalAnchor2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localAnchor2X;
			v1[1] = this._localAnchor2Y;
			v1[2] = this._localAnchor2Z;
			return v;
		}

		proto.getLocalAnchor1To = function (localAnchor) {
			var v = localAnchor;
			v[0] = this._localAnchor1X;
			v[1] = this._localAnchor1Y;
			v[2] = this._localAnchor1Z;
		}

		proto.getLocalAnchor2To = function (localAnchor) {
			var v = localAnchor;
			v[0] = this._localAnchor2X;
			v[1] = this._localAnchor2Y;
			v[2] = this._localAnchor2Z;
		}

		proto.getAllowCollision = function () {
			return this._allowCollision;
		}

		proto.setAllowCollision = function (allowCollision) {
			this._allowCollision = allowCollision;
		}

		proto.getBreakForce = function () {
			return this._breakForce;
		}

		proto.setBreakForce = function (breakForce) {
			this._breakForce = breakForce;
		}

		proto.getBreakTorque = function () {
			return this._breakTorque;
		}

		proto.setBreakTorque = function (breakTorque) {
			this._breakTorque = breakTorque;
		}

		proto.getPositionCorrectionAlgorithm = function () {
			return this._positionCorrectionAlgorithm;
		}

		proto.setPositionCorrectionAlgorithm = function (positionCorrectionAlgorithm) {
			switch (positionCorrectionAlgorithm) {
				case 0: case 1: case 2:
					break;
				default:
					throw new Error("invalid position correction algorithm id: " + positionCorrectionAlgorithm);
			}
			this._positionCorrectionAlgorithm = positionCorrectionAlgorithm;
		}

		proto.getAppliedForce = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._appliedForceX;
			v1[1] = this._appliedForceY;
			v1[2] = this._appliedForceZ;
			return v;
		}

		proto.getAppliedForceTo = function (appliedForce) {
			var v = appliedForce;
			v[0] = this._appliedForceX;
			v[1] = this._appliedForceY;
			v[2] = this._appliedForceZ;
		}

		proto.getAppliedTorque = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._appliedTorqueX;
			v1[1] = this._appliedTorqueY;
			v1[2] = this._appliedTorqueZ;
			return v;
		}

		proto.getAppliedTorqueTo = function (appliedTorque) {
			var v = appliedTorque;
			v[0] = this._appliedTorqueX;
			v[1] = this._appliedTorqueY;
			v[2] = this._appliedTorqueZ;
		}

		proto.getPrev = function () {
			return this._prev;
		}

		proto.getNext = function () {
			return this._next;
		}

		var SphericalJoint = function (config) {
			dynamics.constraint.joint.Joint.call(this, config, 0);
			this._sd = config.springDamper.clone();
		}
		return SphericalJoint;
	});

	dynamics.constraint.joint.SphericalJointConfig = pe.define(function (proto) {
		proto.init = function (rigidBody1, rigidBody2, worldAnchor) {
			this._init(rigidBody1, rigidBody2, worldAnchor);
			return this;
		}

		proto._init = function (rb1, rb2, worldAnchor) {
			this.rigidBody1 = rb1;
			this.rigidBody2 = rb2;
			var _this = this.rigidBody1;
			var v;
			var vX;
			var vY;
			var vZ;
			var v1 = worldAnchor;
			vX = v1[0];
			vY = v1[1];
			vZ = v1[2];
			vX -= _this._transform._position[0];
			vY -= _this._transform._position[1];
			vZ -= _this._transform._position[2];
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = _this._transform._rotation[0] * vX + _this._transform._rotation[3] * vY + _this._transform._rotation[6] * vZ;
			__tmp__Y = _this._transform._rotation[1] * vX + _this._transform._rotation[4] * vY + _this._transform._rotation[7] * vZ;
			__tmp__Z = _this._transform._rotation[2] * vX + _this._transform._rotation[5] * vY + _this._transform._rotation[8] * vZ;
			vX = __tmp__X;
			vY = __tmp__Y;
			vZ = __tmp__Z;
			var v2 = this.localAnchor1;
			v2[0] = vX;
			v2[1] = vY;
			v2[2] = vZ;
			var _this1 = this.rigidBody2;
			var v3;
			var vX1;
			var vY1;
			var vZ1;
			var v4 = worldAnchor;
			vX1 = v4[0];
			vY1 = v4[1];
			vZ1 = v4[2];
			vX1 -= _this1._transform._position[0];
			vY1 -= _this1._transform._position[1];
			vZ1 -= _this1._transform._position[2];
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = _this1._transform._rotation[0] * vX1 + _this1._transform._rotation[3] * vY1 + _this1._transform._rotation[6] * vZ1;
			__tmp__Y1 = _this1._transform._rotation[1] * vX1 + _this1._transform._rotation[4] * vY1 + _this1._transform._rotation[7] * vZ1;
			__tmp__Z1 = _this1._transform._rotation[2] * vX1 + _this1._transform._rotation[5] * vY1 + _this1._transform._rotation[8] * vZ1;
			vX1 = __tmp__X1;
			vY1 = __tmp__Y1;
			vZ1 = __tmp__Z1;
			var v5 = this.localAnchor2;
			v5[0] = vX1;
			v5[1] = vY1;
			v5[2] = vZ1;
		}

		var SphericalJointConfig = function () {
			dynamics.constraint.joint.JointConfig.call(this);
			this.springDamper = new dynamics.constraint.joint.SpringDamper();
		}
		return SphericalJointConfig;
	});

	dynamics.constraint.joint.SpringDamper = pe.define(function (proto) {
		proto.setSpring = function (frequency, dampingRatio) {
			this.frequency = frequency;
			this.dampingRatio = dampingRatio;
			return this;
		}

		proto.setSymplecticEuler = function (useSymplecticEuler) {
			this.useSymplecticEuler = useSymplecticEuler;
			return this;
		}

		proto.clone = function () {
			var sd = new dynamics.constraint.joint.SpringDamper();
			sd.frequency = this.frequency;
			sd.dampingRatio = this.dampingRatio;
			sd.useSymplecticEuler = this.useSymplecticEuler;
			return sd;
		}

		var SpringDamper = function () {
			this.frequency = 0;
			this.dampingRatio = 0;
			this.useSymplecticEuler = false;
		}
		return SpringDamper;
	});

	dynamics.constraint.joint.TranslationalLimitMotor = pe.define(function (proto) {
		proto.setLimits = function (lower, upper) {
			this.lowerLimit = lower;
			this.upperLimit = upper;
			return this;
		}

		proto.setMotor = function (speed, force) {
			this.motorSpeed = speed;
			this.motorForce = force;
			return this;
		}

		proto.clone = function () {
			var lm = new dynamics.constraint.joint.TranslationalLimitMotor();
			lm.lowerLimit = this.lowerLimit;
			lm.upperLimit = this.upperLimit;
			lm.motorSpeed = this.motorSpeed;
			lm.motorForce = this.motorForce;
			return lm;
		}

		var TranslationalLimitMotor = function () {
			this.lowerLimit = 1;
			this.upperLimit = 0;
			this.motorForce = 0;
		}
		return TranslationalLimitMotor;
	});

	dynamics.constraint.joint.UniversalJoint = pe.define(function (proto) {
		proto.getInfo = function (info, timeStep, isPositionPart) {
			var erp = isPositionPart ? 1 : this._positionCorrectionAlgorithm == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? timeStep.invDt * pe.common.Setting.velocityBaumgarte : 0;
			var linearRhs;
			var linearRhsX;
			var linearRhsY;
			var linearRhsZ;
			linearRhsX = this.linearErrorX * erp;
			linearRhsY = this.linearErrorY * erp;
			linearRhsZ = this.linearErrorZ * erp;
			var linRhsX = linearRhsX;
			var linRhsY = linearRhsY;
			var linRhsZ = linearRhsZ;
			var angRhsY = this._angleY * erp;
			var crossR1;
			var crossR100;
			var crossR101;
			var crossR102;
			var crossR110;
			var crossR111;
			var crossR112;
			var crossR120;
			var crossR121;
			var crossR122;
			var crossR2;
			var crossR200;
			var crossR201;
			var crossR202;
			var crossR210;
			var crossR211;
			var crossR212;
			var crossR220;
			var crossR221;
			var crossR222;
			crossR100 = 0;
			crossR101 = -this._relativeAnchor1Z;
			crossR102 = this._relativeAnchor1Y;
			crossR110 = this._relativeAnchor1Z;
			crossR111 = 0;
			crossR112 = -this._relativeAnchor1X;
			crossR120 = -this._relativeAnchor1Y;
			crossR121 = this._relativeAnchor1X;
			crossR122 = 0;
			crossR200 = 0;
			crossR201 = -this._relativeAnchor2Z;
			crossR202 = this._relativeAnchor2Y;
			crossR210 = this._relativeAnchor2Z;
			crossR211 = 0;
			crossR212 = -this._relativeAnchor2X;
			crossR220 = -this._relativeAnchor2Y;
			crossR221 = this._relativeAnchor2X;
			crossR222 = 0;
			crossR100 = -crossR100;
			crossR101 = -crossR101;
			crossR102 = -crossR102;
			crossR110 = -crossR110;
			crossR111 = -crossR111;
			crossR112 = -crossR112;
			crossR120 = -crossR120;
			crossR121 = -crossR121;
			crossR122 = -crossR122;
			crossR200 = -crossR200;
			crossR201 = -crossR201;
			crossR202 = -crossR202;
			crossR210 = -crossR210;
			crossR211 = -crossR211;
			crossR212 = -crossR212;
			crossR220 = -crossR220;
			crossR221 = -crossR221;
			crossR222 = -crossR222;
			var axisX = this._axisXX;
			var axisY = this._axisXY;
			var axisZ = this._axisXZ;
			var ia1;
			var ia1X;
			var ia1Y;
			var ia1Z;
			var ia2;
			var ia2X;
			var ia2Y;
			var ia2Z;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = this._b1._invInertia[0] * axisX + this._b1._invInertia[1] * axisY + this._b1._invInertia[2] * axisZ;
			__tmp__Y = this._b1._invInertia[3] * axisX + this._b1._invInertia[4] * axisY + this._b1._invInertia[5] * axisZ;
			__tmp__Z = this._b1._invInertia[6] * axisX + this._b1._invInertia[7] * axisY + this._b1._invInertia[8] * axisZ;
			ia1X = __tmp__X;
			ia1Y = __tmp__Y;
			ia1Z = __tmp__Z;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = this._b2._invInertia[0] * axisX + this._b2._invInertia[1] * axisY + this._b2._invInertia[2] * axisZ;
			__tmp__Y1 = this._b2._invInertia[3] * axisX + this._b2._invInertia[4] * axisY + this._b2._invInertia[5] * axisZ;
			__tmp__Z1 = this._b2._invInertia[6] * axisX + this._b2._invInertia[7] * axisY + this._b2._invInertia[8] * axisZ;
			ia2X = __tmp__X1;
			ia2Y = __tmp__Y1;
			ia2Z = __tmp__Z1;
			var invI1 = ia1X * axisX + ia1Y * axisY + ia1Z * axisZ;
			var invI2 = ia2X * axisX + ia2Y * axisY + ia2Z * axisZ;
			if (invI1 > 0) {
				var rsq = this._relativeAnchor1X * this._relativeAnchor1X + this._relativeAnchor1Y * this._relativeAnchor1Y + this._relativeAnchor1Z * this._relativeAnchor1Z;
				var dot = axisX * this._relativeAnchor1X + axisY * this._relativeAnchor1Y + axisZ * this._relativeAnchor1Z;
				var projsq = rsq - dot * dot;
				if (projsq > 0) {
					if (this._b1._invMass > 0) {
						invI1 = 1 / (1 / invI1 + this._b1._mass * projsq);
					} else {
						invI1 = 0;
					}
				}
			}
			if (invI2 > 0) {
				var rsq1 = this._relativeAnchor2X * this._relativeAnchor2X + this._relativeAnchor2Y * this._relativeAnchor2Y + this._relativeAnchor2Z * this._relativeAnchor2Z;
				var dot1 = axisX * this._relativeAnchor2X + axisY * this._relativeAnchor2Y + axisZ * this._relativeAnchor2Z;
				var projsq1 = rsq1 - dot1 * dot1;
				if (projsq1 > 0) {
					if (this._b2._invMass > 0) {
						invI2 = 1 / (1 / invI2 + this._b2._mass * projsq1);
					} else {
						invI2 = 0;
					}
				}
			}
			var motorMassX = invI1 + invI2 == 0 ? 0 : 1 / (invI1 + invI2);
			var axisX1 = this._axisZX;
			var axisY1 = this._axisZY;
			var axisZ1 = this._axisZZ;
			var ia11;
			var ia1X1;
			var ia1Y1;
			var ia1Z1;
			var ia21;
			var ia2X1;
			var ia2Y1;
			var ia2Z1;
			var __tmp__X2;
			var __tmp__Y2;
			var __tmp__Z2;
			__tmp__X2 = this._b1._invInertia[0] * axisX1 + this._b1._invInertia[1] * axisY1 + this._b1._invInertia[2] * axisZ1;
			__tmp__Y2 = this._b1._invInertia[3] * axisX1 + this._b1._invInertia[4] * axisY1 + this._b1._invInertia[5] * axisZ1;
			__tmp__Z2 = this._b1._invInertia[6] * axisX1 + this._b1._invInertia[7] * axisY1 + this._b1._invInertia[8] * axisZ1;
			ia1X1 = __tmp__X2;
			ia1Y1 = __tmp__Y2;
			ia1Z1 = __tmp__Z2;
			var __tmp__X3;
			var __tmp__Y3;
			var __tmp__Z3;
			__tmp__X3 = this._b2._invInertia[0] * axisX1 + this._b2._invInertia[1] * axisY1 + this._b2._invInertia[2] * axisZ1;
			__tmp__Y3 = this._b2._invInertia[3] * axisX1 + this._b2._invInertia[4] * axisY1 + this._b2._invInertia[5] * axisZ1;
			__tmp__Z3 = this._b2._invInertia[6] * axisX1 + this._b2._invInertia[7] * axisY1 + this._b2._invInertia[8] * axisZ1;
			ia2X1 = __tmp__X3;
			ia2Y1 = __tmp__Y3;
			ia2Z1 = __tmp__Z3;
			var invI11 = ia1X1 * axisX1 + ia1Y1 * axisY1 + ia1Z1 * axisZ1;
			var invI21 = ia2X1 * axisX1 + ia2Y1 * axisY1 + ia2Z1 * axisZ1;
			if (invI11 > 0) {
				var rsq2 = this._relativeAnchor1X * this._relativeAnchor1X + this._relativeAnchor1Y * this._relativeAnchor1Y + this._relativeAnchor1Z * this._relativeAnchor1Z;
				var dot2 = axisX1 * this._relativeAnchor1X + axisY1 * this._relativeAnchor1Y + axisZ1 * this._relativeAnchor1Z;
				var projsq2 = rsq2 - dot2 * dot2;
				if (projsq2 > 0) {
					if (this._b1._invMass > 0) {
						invI11 = 1 / (1 / invI11 + this._b1._mass * projsq2);
					} else {
						invI11 = 0;
					}
				}
			}
			if (invI21 > 0) {
				var rsq3 = this._relativeAnchor2X * this._relativeAnchor2X + this._relativeAnchor2Y * this._relativeAnchor2Y + this._relativeAnchor2Z * this._relativeAnchor2Z;
				var dot3 = axisX1 * this._relativeAnchor2X + axisY1 * this._relativeAnchor2Y + axisZ1 * this._relativeAnchor2Z;
				var projsq3 = rsq3 - dot3 * dot3;
				if (projsq3 > 0) {
					if (this._b2._invMass > 0) {
						invI21 = 1 / (1 / invI21 + this._b2._mass * projsq3);
					} else {
						invI21 = 0;
					}
				}
			}
			var motorMassZ = invI11 + invI21 == 0 ? 0 : 1 / (invI11 + invI21);
			var impulse = this._impulses[0];
			var row = info.rows[info.numRows++];
			var _this = row.jacobian;
			_this.lin1X = 0;
			_this.lin1Y = 0;
			_this.lin1Z = 0;
			_this.lin2X = 0;
			_this.lin2Y = 0;
			_this.lin2Z = 0;
			_this.ang1X = 0;
			_this.ang1Y = 0;
			_this.ang1Z = 0;
			_this.ang2X = 0;
			_this.ang2Y = 0;
			_this.ang2Z = 0;
			row.rhs = 0;
			row.cfm = 0;
			row.minImpulse = 0;
			row.maxImpulse = 0;
			row.motorSpeed = 0;
			row.motorMaxImpulse = 0;
			row.impulse = null;
			row.impulse = impulse;
			var row1 = row;
			row1.rhs = linRhsX;
			row1.cfm = 0;
			row1.minImpulse = -1.0 / 0.0;
			row1.maxImpulse = 1.0 / 0.0;
			var j = row1.jacobian;
			j.lin1X = 1;
			j.lin1Y = 0;
			j.lin1Z = 0;
			j.lin2X = 1;
			j.lin2Y = 0;
			j.lin2Z = 0;
			j.ang1X = crossR100;
			j.ang1Y = crossR101;
			j.ang1Z = crossR102;
			j.ang2X = crossR200;
			j.ang2Y = crossR201;
			j.ang2Z = crossR202;
			var impulse1 = this._impulses[1];
			var row2 = info.rows[info.numRows++];
			var _this1 = row2.jacobian;
			_this1.lin1X = 0;
			_this1.lin1Y = 0;
			_this1.lin1Z = 0;
			_this1.lin2X = 0;
			_this1.lin2Y = 0;
			_this1.lin2Z = 0;
			_this1.ang1X = 0;
			_this1.ang1Y = 0;
			_this1.ang1Z = 0;
			_this1.ang2X = 0;
			_this1.ang2Y = 0;
			_this1.ang2Z = 0;
			row2.rhs = 0;
			row2.cfm = 0;
			row2.minImpulse = 0;
			row2.maxImpulse = 0;
			row2.motorSpeed = 0;
			row2.motorMaxImpulse = 0;
			row2.impulse = null;
			row2.impulse = impulse1;
			row1 = row2;
			row1.rhs = linRhsY;
			row1.cfm = 0;
			row1.minImpulse = -1.0 / 0.0;
			row1.maxImpulse = 1.0 / 0.0;
			j = row1.jacobian;
			j.lin1X = 0;
			j.lin1Y = 1;
			j.lin1Z = 0;
			j.lin2X = 0;
			j.lin2Y = 1;
			j.lin2Z = 0;
			j.ang1X = crossR110;
			j.ang1Y = crossR111;
			j.ang1Z = crossR112;
			j.ang2X = crossR210;
			j.ang2Y = crossR211;
			j.ang2Z = crossR212;
			var impulse2 = this._impulses[2];
			var row3 = info.rows[info.numRows++];
			var _this2 = row3.jacobian;
			_this2.lin1X = 0;
			_this2.lin1Y = 0;
			_this2.lin1Z = 0;
			_this2.lin2X = 0;
			_this2.lin2Y = 0;
			_this2.lin2Z = 0;
			_this2.ang1X = 0;
			_this2.ang1Y = 0;
			_this2.ang1Z = 0;
			_this2.ang2X = 0;
			_this2.ang2Y = 0;
			_this2.ang2Z = 0;
			row3.rhs = 0;
			row3.cfm = 0;
			row3.minImpulse = 0;
			row3.maxImpulse = 0;
			row3.motorSpeed = 0;
			row3.motorMaxImpulse = 0;
			row3.impulse = null;
			row3.impulse = impulse2;
			row1 = row3;
			row1.rhs = linRhsZ;
			row1.cfm = 0;
			row1.minImpulse = -1.0 / 0.0;
			row1.maxImpulse = 1.0 / 0.0;
			j = row1.jacobian;
			j.lin1X = 0;
			j.lin1Y = 0;
			j.lin1Z = 1;
			j.lin2X = 0;
			j.lin2Y = 0;
			j.lin2Z = 1;
			j.ang1X = crossR120;
			j.ang1Y = crossR121;
			j.ang1Z = crossR122;
			j.ang2X = crossR220;
			j.ang2Y = crossR221;
			j.ang2Z = crossR222;
			if (!this.xSingular && (this._sd1.frequency <= 0 || !isPositionPart)) {
				var impulse3 = this._impulses[3];
				var row4 = info.rows[info.numRows++];
				var _this3 = row4.jacobian;
				_this3.lin1X = 0;
				_this3.lin1Y = 0;
				_this3.lin1Z = 0;
				_this3.lin2X = 0;
				_this3.lin2Y = 0;
				_this3.lin2Z = 0;
				_this3.ang1X = 0;
				_this3.ang1Y = 0;
				_this3.ang1Z = 0;
				_this3.ang2X = 0;
				_this3.ang2Y = 0;
				_this3.ang2Z = 0;
				row4.rhs = 0;
				row4.cfm = 0;
				row4.minImpulse = 0;
				row4.maxImpulse = 0;
				row4.motorSpeed = 0;
				row4.motorMaxImpulse = 0;
				row4.impulse = null;
				row4.impulse = impulse3;
				row1 = row4;
				var diff = this._angleX;
				var lm = this._lm1;
				var sd = this._sd1;
				var cfmFactor;
				var erp1;
				var slop = pe.common.Setting.angularSlop;
				if (isPositionPart) {
					cfmFactor = 0;
					erp1 = 1;
				} else {
					if (sd.frequency > 0) {
						slop = 0;
						var omega = 6.28318530717958 * sd.frequency;
						var zeta = sd.dampingRatio;
						if (zeta < pe.common.Setting.minSpringDamperDampingRatio) {
							zeta = pe.common.Setting.minSpringDamperDampingRatio;
						}
						var h = timeStep.dt;
						var c = 2 * zeta * omega;
						var k = omega * omega;
						if (sd.useSymplecticEuler) {
							cfmFactor = 1 / (h * c);
							erp1 = k / c;
						} else {
							cfmFactor = 1 / (h * (h * k + c));
							erp1 = k / (h * k + c);
						}
					} else {
						cfmFactor = 0;
						erp1 = this._positionCorrectionAlgorithm == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? timeStep.invDt * pe.common.Setting.velocityBaumgarte : 0;
					}
					if (lm.motorTorque > 0) {
						row1.motorSpeed = lm.motorSpeed;
						row1.motorMaxImpulse = lm.motorTorque * timeStep.dt;
					} else {
						row1.motorSpeed = 0;
						row1.motorMaxImpulse = 0;
					}
				}
				var lower = lm.lowerLimit;
				var upper = lm.upperLimit;
				var mid = (lower + upper) * 0.5;
				diff -= mid;
				diff = ((diff + 3.14159265358979) % 6.28318530717958 + 6.28318530717958) % 6.28318530717958 - 3.14159265358979;
				diff += mid;
				var minImp;
				var maxImp;
				var error;
				if (lower > upper) {
					minImp = 0;
					maxImp = 0;
					error = 0;
				} else if (lower == upper) {
					minImp = -1.0 / 0.0;
					maxImp = 1.0 / 0.0;
					error = diff - lower;
				} else if (diff < lower) {
					minImp = -1.0 / 0.0;
					maxImp = 0;
					error = diff - lower + slop;
					if (error > 0) {
						error = 0;
					}
				} else if (diff > upper) {
					minImp = 0;
					maxImp = 1.0 / 0.0;
					error = diff - upper - slop;
					if (error < 0) {
						error = 0;
					}
				} else {
					minImp = 0;
					maxImp = 0;
					error = 0;
				}
				var invMass = motorMassX == 0 ? 0 : 1 / motorMassX;
				row1.minImpulse = minImp;
				row1.maxImpulse = maxImp;
				row1.cfm = cfmFactor * invMass;
				row1.rhs = error * erp1;
				j = row1.jacobian;
				j.ang1X = this._axisXX;
				j.ang1Y = this._axisXY;
				j.ang1Z = this._axisXZ;
				j.ang2X = this._axisXX;
				j.ang2Y = this._axisXY;
				j.ang2Z = this._axisXZ;
			}
			if (!this.ySingular) {
				var impulse4 = this._impulses[4];
				var row5 = info.rows[info.numRows++];
				var _this4 = row5.jacobian;
				_this4.lin1X = 0;
				_this4.lin1Y = 0;
				_this4.lin1Z = 0;
				_this4.lin2X = 0;
				_this4.lin2Y = 0;
				_this4.lin2Z = 0;
				_this4.ang1X = 0;
				_this4.ang1Y = 0;
				_this4.ang1Z = 0;
				_this4.ang2X = 0;
				_this4.ang2Y = 0;
				_this4.ang2Z = 0;
				row5.rhs = 0;
				row5.cfm = 0;
				row5.minImpulse = 0;
				row5.maxImpulse = 0;
				row5.motorSpeed = 0;
				row5.motorMaxImpulse = 0;
				row5.impulse = null;
				row5.impulse = impulse4;
				row1 = row5;
				row1.rhs = angRhsY;
				row1.cfm = 0;
				row1.minImpulse = -1.0 / 0.0;
				row1.maxImpulse = 1.0 / 0.0;
				j = row1.jacobian;
				j.ang1X = this._axisYX;
				j.ang1Y = this._axisYY;
				j.ang1Z = this._axisYZ;
				j.ang2X = this._axisYX;
				j.ang2Y = this._axisYY;
				j.ang2Z = this._axisYZ;
			}
			if (!this.zSingular && (this._sd2.frequency <= 0 || !isPositionPart)) {
				var impulse5 = this._impulses[5];
				var row6 = info.rows[info.numRows++];
				var _this5 = row6.jacobian;
				_this5.lin1X = 0;
				_this5.lin1Y = 0;
				_this5.lin1Z = 0;
				_this5.lin2X = 0;
				_this5.lin2Y = 0;
				_this5.lin2Z = 0;
				_this5.ang1X = 0;
				_this5.ang1Y = 0;
				_this5.ang1Z = 0;
				_this5.ang2X = 0;
				_this5.ang2Y = 0;
				_this5.ang2Z = 0;
				row6.rhs = 0;
				row6.cfm = 0;
				row6.minImpulse = 0;
				row6.maxImpulse = 0;
				row6.motorSpeed = 0;
				row6.motorMaxImpulse = 0;
				row6.impulse = null;
				row6.impulse = impulse5;
				row1 = row6;
				var diff1 = this._angleZ;
				var lm1 = this._lm2;
				var sd1 = this._sd2;
				var cfmFactor1;
				var erp2;
				var slop1 = pe.common.Setting.angularSlop;
				if (isPositionPart) {
					cfmFactor1 = 0;
					erp2 = 1;
				} else {
					if (sd1.frequency > 0) {
						slop1 = 0;
						var omega1 = 6.28318530717958 * sd1.frequency;
						var zeta1 = sd1.dampingRatio;
						if (zeta1 < pe.common.Setting.minSpringDamperDampingRatio) {
							zeta1 = pe.common.Setting.minSpringDamperDampingRatio;
						}
						var h1 = timeStep.dt;
						var c1 = 2 * zeta1 * omega1;
						var k1 = omega1 * omega1;
						if (sd1.useSymplecticEuler) {
							cfmFactor1 = 1 / (h1 * c1);
							erp2 = k1 / c1;
						} else {
							cfmFactor1 = 1 / (h1 * (h1 * k1 + c1));
							erp2 = k1 / (h1 * k1 + c1);
						}
					} else {
						cfmFactor1 = 0;
						erp2 = this._positionCorrectionAlgorithm == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? timeStep.invDt * pe.common.Setting.velocityBaumgarte : 0;
					}
					if (lm1.motorTorque > 0) {
						row1.motorSpeed = lm1.motorSpeed;
						row1.motorMaxImpulse = lm1.motorTorque * timeStep.dt;
					} else {
						row1.motorSpeed = 0;
						row1.motorMaxImpulse = 0;
					}
				}
				var lower1 = lm1.lowerLimit;
				var upper1 = lm1.upperLimit;
				var mid1 = (lower1 + upper1) * 0.5;
				diff1 -= mid1;
				diff1 = ((diff1 + 3.14159265358979) % 6.28318530717958 + 6.28318530717958) % 6.28318530717958 - 3.14159265358979;
				diff1 += mid1;
				var minImp1;
				var maxImp1;
				var error1;
				if (lower1 > upper1) {
					minImp1 = 0;
					maxImp1 = 0;
					error1 = 0;
				} else if (lower1 == upper1) {
					minImp1 = -1.0 / 0.0;
					maxImp1 = 1.0 / 0.0;
					error1 = diff1 - lower1;
				} else if (diff1 < lower1) {
					minImp1 = -1.0 / 0.0;
					maxImp1 = 0;
					error1 = diff1 - lower1 + slop1;
					if (error1 > 0) {
						error1 = 0;
					}
				} else if (diff1 > upper1) {
					minImp1 = 0;
					maxImp1 = 1.0 / 0.0;
					error1 = diff1 - upper1 - slop1;
					if (error1 < 0) {
						error1 = 0;
					}
				} else {
					minImp1 = 0;
					maxImp1 = 0;
					error1 = 0;
				}
				var invMass1 = motorMassZ == 0 ? 0 : 1 / motorMassZ;
				row1.minImpulse = minImp1;
				row1.maxImpulse = maxImp1;
				row1.cfm = cfmFactor1 * invMass1;
				row1.rhs = error1 * erp2;
				j = row1.jacobian;
				j.ang1X = this._axisZX;
				j.ang1Y = this._axisZY;
				j.ang1Z = this._axisZZ;
				j.ang2X = this._axisZX;
				j.ang2Y = this._axisZY;
				j.ang2Z = this._axisZZ;
			}
		}

		proto._syncAnchors = function () {
			dynamics.constraint.joint.Joint.prototype._syncAnchors.call(this);
			var rot1;
			var rot100;
			var rot101;
			var rot102;
			var rot110;
			var rot111;
			var rot112;
			var rot120;
			var rot121;
			var rot122;
			var rot2;
			var rot200;
			var rot201;
			var rot202;
			var rot210;
			var rot211;
			var rot212;
			var rot220;
			var rot221;
			var rot222;
			rot100 = this._basisX1X;
			rot101 = this._basisY1X;
			rot102 = this._basisZ1X;
			rot110 = this._basisX1Y;
			rot111 = this._basisY1Y;
			rot112 = this._basisZ1Y;
			rot120 = this._basisX1Z;
			rot121 = this._basisY1Z;
			rot122 = this._basisZ1Z;
			rot200 = this._basisX2X;
			rot201 = this._basisY2X;
			rot202 = this._basisZ2X;
			rot210 = this._basisX2Y;
			rot211 = this._basisY2Y;
			rot212 = this._basisZ2Y;
			rot220 = this._basisX2Z;
			rot221 = this._basisY2Z;
			rot222 = this._basisZ2Z;
			var relRot;
			var relRot00;
			var relRot01;
			var relRot02;
			var relRot10;
			var relRot11;
			var relRot12;
			var relRot20;
			var relRot21;
			var relRot22;
			var __tmp__00;
			var __tmp__01;
			var __tmp__02;
			var __tmp__10;
			var __tmp__11;
			var __tmp__12;
			var __tmp__20;
			var __tmp__21;
			var __tmp__22;
			__tmp__00 = rot100 * rot200 + rot110 * rot210 + rot120 * rot220;
			__tmp__01 = rot100 * rot201 + rot110 * rot211 + rot120 * rot221;
			__tmp__02 = rot100 * rot202 + rot110 * rot212 + rot120 * rot222;
			__tmp__10 = rot101 * rot200 + rot111 * rot210 + rot121 * rot220;
			__tmp__11 = rot101 * rot201 + rot111 * rot211 + rot121 * rot221;
			__tmp__12 = rot101 * rot202 + rot111 * rot212 + rot121 * rot222;
			__tmp__20 = rot102 * rot200 + rot112 * rot210 + rot122 * rot220;
			__tmp__21 = rot102 * rot201 + rot112 * rot211 + rot122 * rot221;
			__tmp__22 = rot102 * rot202 + rot112 * rot212 + rot122 * rot222;
			relRot00 = __tmp__00;
			relRot01 = __tmp__01;
			relRot02 = __tmp__02;
			relRot10 = __tmp__10;
			relRot11 = __tmp__11;
			relRot12 = __tmp__12;
			relRot20 = __tmp__20;
			relRot21 = __tmp__21;
			relRot22 = __tmp__22;
			var angleAxisX;
			var angleAxisXX;
			var angleAxisXY;
			var angleAxisXZ;
			var angleAxisY;
			var angleAxisYX;
			var angleAxisYY;
			var angleAxisYZ;
			var angleAxisZ;
			var angleAxisZX;
			var angleAxisZY;
			var angleAxisZZ;
			angleAxisXX = this._basisX1X;
			angleAxisXY = this._basisX1Y;
			angleAxisXZ = this._basisX1Z;
			angleAxisZX = this._basisZ2X;
			angleAxisZY = this._basisZ2Y;
			angleAxisZZ = this._basisZ2Z;
			angleAxisYX = angleAxisZY * angleAxisXZ - angleAxisZZ * angleAxisXY;
			angleAxisYY = angleAxisZZ * angleAxisXX - angleAxisZX * angleAxisXZ;
			angleAxisYZ = angleAxisZX * angleAxisXY - angleAxisZY * angleAxisXX;
			this._axisXX = angleAxisYY * angleAxisZZ - angleAxisYZ * angleAxisZY;
			this._axisXY = angleAxisYZ * angleAxisZX - angleAxisYX * angleAxisZZ;
			this._axisXZ = angleAxisYX * angleAxisZY - angleAxisYY * angleAxisZX;
			this._axisYX = angleAxisYX;
			this._axisYY = angleAxisYY;
			this._axisYZ = angleAxisYZ;
			this._axisZX = angleAxisXY * angleAxisYZ - angleAxisXZ * angleAxisYY;
			this._axisZY = angleAxisXZ * angleAxisYX - angleAxisXX * angleAxisYZ;
			this._axisZZ = angleAxisXX * angleAxisYY - angleAxisXY * angleAxisYX;
			var l = this._axisXX * this._axisXX + this._axisXY * this._axisXY + this._axisXZ * this._axisXZ;
			if (l > 0) {
				l = 1 / Math.sqrt(l);
			}
			this._axisXX *= l;
			this._axisXY *= l;
			this._axisXZ *= l;
			var l1 = this._axisYX * this._axisYX + this._axisYY * this._axisYY + this._axisYZ * this._axisYZ;
			if (l1 > 0) {
				l1 = 1 / Math.sqrt(l1);
			}
			this._axisYX *= l1;
			this._axisYY *= l1;
			this._axisYZ *= l1;
			var l2 = this._axisZX * this._axisZX + this._axisZY * this._axisZY + this._axisZZ * this._axisZZ;
			if (l2 > 0) {
				l2 = 1 / Math.sqrt(l2);
			}
			this._axisZX *= l2;
			this._axisZY *= l2;
			this._axisZZ *= l2;
			this.xSingular = this._axisXX * this._axisXX + this._axisXY * this._axisXY + this._axisXZ * this._axisXZ == 0;
			this.ySingular = this._axisYX * this._axisYX + this._axisYY * this._axisYY + this._axisYZ * this._axisYZ == 0;
			this.zSingular = this._axisZX * this._axisZX + this._axisZY * this._axisZY + this._axisZZ * this._axisZZ == 0;
			var rot11;
			var rot1001;
			var rot1011;
			var rot1021;
			var rot1101;
			var rot1111;
			var rot1121;
			var rot1201;
			var rot1211;
			var rot1221;
			var rot21;
			var rot2001;
			var rot2011;
			var rot2021;
			var rot2101;
			var rot2111;
			var rot2121;
			var rot2201;
			var rot2211;
			var rot2221;
			rot1001 = this._basisX1X;
			rot1011 = this._basisY1X;
			rot1021 = this._basisZ1X;
			rot1101 = this._basisX1Y;
			rot1111 = this._basisY1Y;
			rot1121 = this._basisZ1Y;
			rot1201 = this._basisX1Z;
			rot1211 = this._basisY1Z;
			rot1221 = this._basisZ1Z;
			rot2001 = this._basisX2X;
			rot2011 = this._basisY2X;
			rot2021 = this._basisZ2X;
			rot2101 = this._basisX2Y;
			rot2111 = this._basisY2Y;
			rot2121 = this._basisZ2Y;
			rot2201 = this._basisX2Z;
			rot2211 = this._basisY2Z;
			rot2221 = this._basisZ2Z;
			var relRot1;
			var relRot001;
			var relRot011;
			var relRot021;
			var relRot101;
			var relRot111;
			var relRot121;
			var relRot201;
			var relRot211;
			var relRot221;
			var __tmp__001;
			var __tmp__011;
			var __tmp__021;
			var __tmp__101;
			var __tmp__111;
			var __tmp__121;
			var __tmp__201;
			var __tmp__211;
			var __tmp__221;
			__tmp__001 = rot1001 * rot2001 + rot1101 * rot2101 + rot1201 * rot2201;
			__tmp__011 = rot1001 * rot2011 + rot1101 * rot2111 + rot1201 * rot2211;
			__tmp__021 = rot1001 * rot2021 + rot1101 * rot2121 + rot1201 * rot2221;
			__tmp__101 = rot1011 * rot2001 + rot1111 * rot2101 + rot1211 * rot2201;
			__tmp__111 = rot1011 * rot2011 + rot1111 * rot2111 + rot1211 * rot2211;
			__tmp__121 = rot1011 * rot2021 + rot1111 * rot2121 + rot1211 * rot2221;
			__tmp__201 = rot1021 * rot2001 + rot1121 * rot2101 + rot1221 * rot2201;
			__tmp__211 = rot1021 * rot2011 + rot1121 * rot2111 + rot1221 * rot2211;
			__tmp__221 = rot1021 * rot2021 + rot1121 * rot2121 + rot1221 * rot2221;
			relRot001 = __tmp__001;
			relRot011 = __tmp__011;
			relRot021 = __tmp__021;
			relRot101 = __tmp__101;
			relRot111 = __tmp__111;
			relRot121 = __tmp__121;
			relRot201 = __tmp__201;
			relRot211 = __tmp__211;
			relRot221 = __tmp__221;
			var angles;
			var anglesX;
			var anglesY;
			var anglesZ;
			var sy = relRot021;
			if (sy <= -1) {
				var xSubZ = Math.atan2(relRot211, relRot111);
				anglesX = xSubZ * 0.5;
				anglesY = -1.570796326794895;
				anglesZ = -xSubZ * 0.5;
			} else if (sy >= 1) {
				var xAddZ = Math.atan2(relRot211, relRot111);
				anglesX = xAddZ * 0.5;
				anglesY = 1.570796326794895;
				anglesZ = xAddZ * 0.5;
			} else {
				var y = Math.asin(sy);
				var x = Math.atan2(-relRot121, relRot221);
				var z = Math.atan2(-relRot011, relRot001);
				anglesX = x;
				anglesY = y;
				anglesZ = z;
			}
			this._angleX = anglesX;
			this._angleY = anglesY;
			this._angleZ = anglesZ;
			this.linearErrorX = this._anchor2X - this._anchor1X;
			this.linearErrorY = this._anchor2Y - this._anchor1Y;
			this.linearErrorZ = this._anchor2Z - this._anchor1Z;
		}

		proto._getVelocitySolverInfo = function (timeStep, info) {
			dynamics.constraint.joint.Joint.prototype._getVelocitySolverInfo.call(this, timeStep, info);
			this.getInfo(info, timeStep, false);
		}

		proto._getPositionSolverInfo = function (info) {
			dynamics.constraint.joint.Joint.prototype._getPositionSolverInfo.call(this, info);
			this.getInfo(info, null, true);
		}

		proto.getAxis1To = function (axis) {
			var v = axis;
			v[0] = this._basisX1X;
			v[1] = this._basisX1Y;
			v[2] = this._basisX1Z;
		}

		proto.getAxis2To = function (axis) {
			var v = axis;
			v[0] = this._basisZ2X;
			v[1] = this._basisZ2Y;
			v[2] = this._basisZ2Z;
		}

		proto.getLocalAxis1To = function (axis) {
			var v = axis;
			v[0] = this._localBasisX1X;
			v[1] = this._localBasisX1Y;
			v[2] = this._localBasisX1Z;
		}

		proto.getLocalAxis2To = function (axis) {
			var v = axis;
			v[0] = this._localBasisZ2X;
			v[1] = this._localBasisZ2Y;
			v[2] = this._localBasisZ2Z;
		}

		proto.getSpringDamper1 = function () {
			return this._sd1;
		}

		proto.getSpringDamper2 = function () {
			return this._sd2;
		}

		proto.getLimitMotor1 = function () {
			return this._lm1;
		}

		proto.getLimitMotor2 = function () {
			return this._lm2;
		}

		proto.getAngle1 = function () {
			return this._angleX;
		}

		proto.getAngle2 = function () {
			return this._angleZ;
		}

		proto._checkDestruction = function () {
			var forceSq = this._appliedForceX * this._appliedForceX + this._appliedForceY * this._appliedForceY + this._appliedForceZ * this._appliedForceZ;
			var torqueSq = this._appliedTorqueX * this._appliedTorqueX + this._appliedTorqueY * this._appliedTorqueY + this._appliedTorqueZ * this._appliedTorqueZ;
			if (this._breakForce > 0 && forceSq > this._breakForce * this._breakForce) {
				this._world.removeJoint(this);
				return;
			}
			if (this._breakTorque > 0 && torqueSq > this._breakTorque * this._breakTorque) {
				this._world.removeJoint(this);
				return;
			}
		}

		proto.getRigidBody1 = function () {
			return this._b1;
		}

		proto.getRigidBody2 = function () {
			return this._b2;
		}

		proto.getType = function () {
			return this._type;
		}

		proto.getAnchor1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._anchor1X;
			v1[1] = this._anchor1Y;
			v1[2] = this._anchor1Z;
			return v;
		}

		proto.getAnchor2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._anchor2X;
			v1[1] = this._anchor2Y;
			v1[2] = this._anchor2Z;
			return v;
		}

		proto.getAnchor1To = function (anchor) {
			var v = anchor;
			v[0] = this._anchor1X;
			v[1] = this._anchor1Y;
			v[2] = this._anchor1Z;
		}

		proto.getAnchor2To = function (anchor) {
			var v = anchor;
			v[0] = this._anchor2X;
			v[1] = this._anchor2Y;
			v[2] = this._anchor2Z;
		}

		proto.getLocalAnchor1 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localAnchor1X;
			v1[1] = this._localAnchor1Y;
			v1[2] = this._localAnchor1Z;
			return v;
		}

		proto.getLocalAnchor2 = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._localAnchor2X;
			v1[1] = this._localAnchor2Y;
			v1[2] = this._localAnchor2Z;
			return v;
		}

		proto.getLocalAnchor1To = function (localAnchor) {
			var v = localAnchor;
			v[0] = this._localAnchor1X;
			v[1] = this._localAnchor1Y;
			v[2] = this._localAnchor1Z;
		}

		proto.getLocalAnchor2To = function (localAnchor) {
			var v = localAnchor;
			v[0] = this._localAnchor2X;
			v[1] = this._localAnchor2Y;
			v[2] = this._localAnchor2Z;
		}

		proto.getAllowCollision = function () {
			return this._allowCollision;
		}

		proto.setAllowCollision = function (allowCollision) {
			this._allowCollision = allowCollision;
		}

		proto.getBreakForce = function () {
			return this._breakForce;
		}

		proto.setBreakForce = function (breakForce) {
			this._breakForce = breakForce;
		}

		proto.getBreakTorque = function () {
			return this._breakTorque;
		}

		proto.setBreakTorque = function (breakTorque) {
			this._breakTorque = breakTorque;
		}

		proto.getPositionCorrectionAlgorithm = function () {
			return this._positionCorrectionAlgorithm;
		}

		proto.setPositionCorrectionAlgorithm = function (positionCorrectionAlgorithm) {
			switch (positionCorrectionAlgorithm) {
				case 0: case 1: case 2:
					break;
				default:
					throw new Error("invalid position correction algorithm id: " + positionCorrectionAlgorithm);
			}
			this._positionCorrectionAlgorithm = positionCorrectionAlgorithm;
		}

		proto.getAppliedForce = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._appliedForceX;
			v1[1] = this._appliedForceY;
			v1[2] = this._appliedForceZ;
			return v;
		}

		proto.getAppliedForceTo = function (appliedForce) {
			var v = appliedForce;
			v[0] = this._appliedForceX;
			v[1] = this._appliedForceY;
			v[2] = this._appliedForceZ;
		}

		proto.getAppliedTorque = function () {
			var v = vec3();
			var v1 = v;
			v1[0] = this._appliedTorqueX;
			v1[1] = this._appliedTorqueY;
			v1[2] = this._appliedTorqueZ;
			return v;
		}

		proto.getAppliedTorqueTo = function (appliedTorque) {
			var v = appliedTorque;
			v[0] = this._appliedTorqueX;
			v[1] = this._appliedTorqueY;
			v[2] = this._appliedTorqueZ;
		}

		proto.getPrev = function () {
			return this._prev;
		}

		proto.getNext = function () {
			return this._next;
		}

		var UniversalJoint = function (config) {
			dynamics.constraint.joint.Joint.call(this, config, dynamics.constraint.joint.JointType.UNIVERSAL);
			var v = config.localAxis1;
			this._localBasisX1X = v[0];
			this._localBasisX1Y = v[1];
			this._localBasisX1Z = v[2];
			var v1 = config.localAxis2;
			this._localBasisZ2X = v1[0];
			this._localBasisZ2Y = v1[1];
			this._localBasisZ2Z = v1[2];
			if (this._localBasisX1X * this._localBasisX1X + this._localBasisX1Y * this._localBasisX1Y + this._localBasisX1Z * this._localBasisX1Z == 0) {
				this._localBasisX1X = 1;
				this._localBasisX1Y = 0;
				this._localBasisX1Z = 0;
			} else {
				var l = this._localBasisX1X * this._localBasisX1X + this._localBasisX1Y * this._localBasisX1Y + this._localBasisX1Z * this._localBasisX1Z;
				if (l > 0) {
					l = 1 / Math.sqrt(l);
				}
				this._localBasisX1X *= l;
				this._localBasisX1Y *= l;
				this._localBasisX1Z *= l;
			}
			if (this._localBasisZ2X * this._localBasisZ2X + this._localBasisZ2Y * this._localBasisZ2Y + this._localBasisZ2Z * this._localBasisZ2Z == 0) {
				this._localBasisZ2X = 0;
				this._localBasisZ2Y = 0;
				this._localBasisZ2Z = 1;
			} else {
				var l1 = this._localBasisZ2X * this._localBasisZ2X + this._localBasisZ2Y * this._localBasisZ2Y + this._localBasisZ2Z * this._localBasisZ2Z;
				if (l1 > 0) {
					l1 = 1 / Math.sqrt(l1);
				}
				this._localBasisZ2X *= l1;
				this._localBasisZ2Y *= l1;
				this._localBasisZ2Z *= l1;
			}
			var tf1 = this._b1._transform;
			var tf2 = this._b2._transform;
			var worldX1;
			var worldX1X;
			var worldX1Y;
			var worldX1Z;
			var worldZ1;
			var worldZ1X;
			var worldZ1Y;
			var worldZ1Z;
			var worldY;
			var worldYX;
			var worldYY;
			var worldYZ;
			var worldX2;
			var worldX2X;
			var worldX2Y;
			var worldX2Z;
			var worldZ2;
			var worldZ2X;
			var worldZ2Y;
			var worldZ2Z;
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = tf1._rotation[0] * this._localBasisX1X + tf1._rotation[1] * this._localBasisX1Y + tf1._rotation[2] * this._localBasisX1Z;
			__tmp__Y = tf1._rotation[3] * this._localBasisX1X + tf1._rotation[4] * this._localBasisX1Y + tf1._rotation[5] * this._localBasisX1Z;
			__tmp__Z = tf1._rotation[6] * this._localBasisX1X + tf1._rotation[7] * this._localBasisX1Y + tf1._rotation[8] * this._localBasisX1Z;
			worldX1X = __tmp__X;
			worldX1Y = __tmp__Y;
			worldX1Z = __tmp__Z;
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = tf2._rotation[0] * this._localBasisZ2X + tf2._rotation[1] * this._localBasisZ2Y + tf2._rotation[2] * this._localBasisZ2Z;
			__tmp__Y1 = tf2._rotation[3] * this._localBasisZ2X + tf2._rotation[4] * this._localBasisZ2Y + tf2._rotation[5] * this._localBasisZ2Z;
			__tmp__Z1 = tf2._rotation[6] * this._localBasisZ2X + tf2._rotation[7] * this._localBasisZ2Y + tf2._rotation[8] * this._localBasisZ2Z;
			worldZ2X = __tmp__X1;
			worldZ2Y = __tmp__Y1;
			worldZ2Z = __tmp__Z1;
			worldYX = worldZ2Y * worldX1Z - worldZ2Z * worldX1Y;
			worldYY = worldZ2Z * worldX1X - worldZ2X * worldX1Z;
			worldYZ = worldZ2X * worldX1Y - worldZ2Y * worldX1X;
			if (worldYX * worldYX + worldYY * worldYY + worldYZ * worldYZ == 0) {
				var x1 = worldX1X;
				var y1 = worldX1Y;
				var z1 = worldX1Z;
				var x2 = x1 * x1;
				var y2 = y1 * y1;
				var z2 = z1 * z1;
				var d;
				if (x2 < y2) {
					if (x2 < z2) {
						d = 1 / Math.sqrt(y2 + z2);
						worldYX = 0;
						worldYY = z1 * d;
						worldYZ = -y1 * d;
					} else {
						d = 1 / Math.sqrt(x2 + y2);
						worldYX = y1 * d;
						worldYY = -x1 * d;
						worldYZ = 0;
					}
				} else if (y2 < z2) {
					d = 1 / Math.sqrt(z2 + x2);
					worldYX = -z1 * d;
					worldYY = 0;
					worldYZ = x1 * d;
				} else {
					d = 1 / Math.sqrt(x2 + y2);
					worldYX = y1 * d;
					worldYY = -x1 * d;
					worldYZ = 0;
				}
			}
			worldZ1X = worldX1Y * worldYZ - worldX1Z * worldYY;
			worldZ1Y = worldX1Z * worldYX - worldX1X * worldYZ;
			worldZ1Z = worldX1X * worldYY - worldX1Y * worldYX;
			worldX2X = worldYY * worldZ2Z - worldYZ * worldZ2Y;
			worldX2Y = worldYZ * worldZ2X - worldYX * worldZ2Z;
			worldX2Z = worldYX * worldZ2Y - worldYY * worldZ2X;
			var __tmp__X2;
			var __tmp__Y2;
			var __tmp__Z2;
			__tmp__X2 = tf1._rotation[0] * worldX1X + tf1._rotation[3] * worldX1Y + tf1._rotation[6] * worldX1Z;
			__tmp__Y2 = tf1._rotation[1] * worldX1X + tf1._rotation[4] * worldX1Y + tf1._rotation[7] * worldX1Z;
			__tmp__Z2 = tf1._rotation[2] * worldX1X + tf1._rotation[5] * worldX1Y + tf1._rotation[8] * worldX1Z;
			this._localBasisX1X = __tmp__X2;
			this._localBasisX1Y = __tmp__Y2;
			this._localBasisX1Z = __tmp__Z2;
			var __tmp__X3;
			var __tmp__Y3;
			var __tmp__Z3;
			__tmp__X3 = tf1._rotation[0] * worldYX + tf1._rotation[3] * worldYY + tf1._rotation[6] * worldYZ;
			__tmp__Y3 = tf1._rotation[1] * worldYX + tf1._rotation[4] * worldYY + tf1._rotation[7] * worldYZ;
			__tmp__Z3 = tf1._rotation[2] * worldYX + tf1._rotation[5] * worldYY + tf1._rotation[8] * worldYZ;
			this._localBasisY1X = __tmp__X3;
			this._localBasisY1Y = __tmp__Y3;
			this._localBasisY1Z = __tmp__Z3;
			var __tmp__X4;
			var __tmp__Y4;
			var __tmp__Z4;
			__tmp__X4 = tf1._rotation[0] * worldZ1X + tf1._rotation[3] * worldZ1Y + tf1._rotation[6] * worldZ1Z;
			__tmp__Y4 = tf1._rotation[1] * worldZ1X + tf1._rotation[4] * worldZ1Y + tf1._rotation[7] * worldZ1Z;
			__tmp__Z4 = tf1._rotation[2] * worldZ1X + tf1._rotation[5] * worldZ1Y + tf1._rotation[8] * worldZ1Z;
			this._localBasisZ1X = __tmp__X4;
			this._localBasisZ1Y = __tmp__Y4;
			this._localBasisZ1Z = __tmp__Z4;
			var __tmp__X5;
			var __tmp__Y5;
			var __tmp__Z5;
			__tmp__X5 = tf2._rotation[0] * worldX2X + tf2._rotation[3] * worldX2Y + tf2._rotation[6] * worldX2Z;
			__tmp__Y5 = tf2._rotation[1] * worldX2X + tf2._rotation[4] * worldX2Y + tf2._rotation[7] * worldX2Z;
			__tmp__Z5 = tf2._rotation[2] * worldX2X + tf2._rotation[5] * worldX2Y + tf2._rotation[8] * worldX2Z;
			this._localBasisX2X = __tmp__X5;
			this._localBasisX2Y = __tmp__Y5;
			this._localBasisX2Z = __tmp__Z5;
			var __tmp__X6;
			var __tmp__Y6;
			var __tmp__Z6;
			__tmp__X6 = tf2._rotation[0] * worldYX + tf2._rotation[3] * worldYY + tf2._rotation[6] * worldYZ;
			__tmp__Y6 = tf2._rotation[1] * worldYX + tf2._rotation[4] * worldYY + tf2._rotation[7] * worldYZ;
			__tmp__Z6 = tf2._rotation[2] * worldYX + tf2._rotation[5] * worldYY + tf2._rotation[8] * worldYZ;
			this._localBasisY2X = __tmp__X6;
			this._localBasisY2Y = __tmp__Y6;
			this._localBasisY2Z = __tmp__Z6;
			var __tmp__X7;
			var __tmp__Y7;
			var __tmp__Z7;
			__tmp__X7 = tf2._rotation[0] * worldZ2X + tf2._rotation[3] * worldZ2Y + tf2._rotation[6] * worldZ2Z;
			__tmp__Y7 = tf2._rotation[1] * worldZ2X + tf2._rotation[4] * worldZ2Y + tf2._rotation[7] * worldZ2Z;
			__tmp__Z7 = tf2._rotation[2] * worldZ2X + tf2._rotation[5] * worldZ2Y + tf2._rotation[8] * worldZ2Z;
			this._localBasisZ2X = __tmp__X7;
			this._localBasisZ2Y = __tmp__Y7;
			this._localBasisZ2Z = __tmp__Z7;
			this._angleX = 0;
			this._angleY = 0;
			this._angleZ = 0;
			this.xSingular = false;
			this.ySingular = false;
			this.zSingular = false;
			this._sd1 = config.springDamper1.clone();
			this._sd2 = config.springDamper2.clone();
			this._lm1 = config.limitMotor1.clone();
			this._lm2 = config.limitMotor2.clone();
		}
		return UniversalJoint;
	});

	dynamics.constraint.joint.UniversalJointConfig = pe.define(function (proto) {
		proto.init = function (rigidBody1, rigidBody2, worldAnchor, worldAxis1, worldAxis2) {
			this._init(rigidBody1, rigidBody2, worldAnchor);
			var v;
			var vX;
			var vY;
			var vZ;
			var v1 = worldAxis1;
			vX = v1[0];
			vY = v1[1];
			vZ = v1[2];
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = rigidBody1._transform._rotation[0] * vX + rigidBody1._transform._rotation[3] * vY + rigidBody1._transform._rotation[6] * vZ;
			__tmp__Y = rigidBody1._transform._rotation[1] * vX + rigidBody1._transform._rotation[4] * vY + rigidBody1._transform._rotation[7] * vZ;
			__tmp__Z = rigidBody1._transform._rotation[2] * vX + rigidBody1._transform._rotation[5] * vY + rigidBody1._transform._rotation[8] * vZ;
			vX = __tmp__X;
			vY = __tmp__Y;
			vZ = __tmp__Z;
			var v2 = this.localAxis1;
			v2[0] = vX;
			v2[1] = vY;
			v2[2] = vZ;
			var v3;
			var vX1;
			var vY1;
			var vZ1;
			var v4 = worldAxis2;
			vX1 = v4[0];
			vY1 = v4[1];
			vZ1 = v4[2];
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = rigidBody2._transform._rotation[0] * vX1 + rigidBody2._transform._rotation[3] * vY1 + rigidBody2._transform._rotation[6] * vZ1;
			__tmp__Y1 = rigidBody2._transform._rotation[1] * vX1 + rigidBody2._transform._rotation[4] * vY1 + rigidBody2._transform._rotation[7] * vZ1;
			__tmp__Z1 = rigidBody2._transform._rotation[2] * vX1 + rigidBody2._transform._rotation[5] * vY1 + rigidBody2._transform._rotation[8] * vZ1;
			vX1 = __tmp__X1;
			vY1 = __tmp__Y1;
			vZ1 = __tmp__Z1;
			var v5 = this.localAxis2;
			v5[0] = vX1;
			v5[1] = vY1;
			v5[2] = vZ1;
			return this;
		}

		proto._init = function (rb1, rb2, worldAnchor) {
			this.rigidBody1 = rb1;
			this.rigidBody2 = rb2;
			var _this = this.rigidBody1;
			var v;
			var vX;
			var vY;
			var vZ;
			var v1 = worldAnchor;
			vX = v1[0];
			vY = v1[1];
			vZ = v1[2];
			vX -= _this._transform._position[0];
			vY -= _this._transform._position[1];
			vZ -= _this._transform._position[2];
			var __tmp__X;
			var __tmp__Y;
			var __tmp__Z;
			__tmp__X = _this._transform._rotation[0] * vX + _this._transform._rotation[3] * vY + _this._transform._rotation[6] * vZ;
			__tmp__Y = _this._transform._rotation[1] * vX + _this._transform._rotation[4] * vY + _this._transform._rotation[7] * vZ;
			__tmp__Z = _this._transform._rotation[2] * vX + _this._transform._rotation[5] * vY + _this._transform._rotation[8] * vZ;
			vX = __tmp__X;
			vY = __tmp__Y;
			vZ = __tmp__Z;
			var v2 = this.localAnchor1;
			v2[0] = vX;
			v2[1] = vY;
			v2[2] = vZ;
			var _this1 = this.rigidBody2;
			var v3;
			var vX1;
			var vY1;
			var vZ1;
			var v4 = worldAnchor;
			vX1 = v4[0];
			vY1 = v4[1];
			vZ1 = v4[2];
			vX1 -= _this1._transform._position[0];
			vY1 -= _this1._transform._position[1];
			vZ1 -= _this1._transform._position[2];
			var __tmp__X1;
			var __tmp__Y1;
			var __tmp__Z1;
			__tmp__X1 = _this1._transform._rotation[0] * vX1 + _this1._transform._rotation[3] * vY1 + _this1._transform._rotation[6] * vZ1;
			__tmp__Y1 = _this1._transform._rotation[1] * vX1 + _this1._transform._rotation[4] * vY1 + _this1._transform._rotation[7] * vZ1;
			__tmp__Z1 = _this1._transform._rotation[2] * vX1 + _this1._transform._rotation[5] * vY1 + _this1._transform._rotation[8] * vZ1;
			vX1 = __tmp__X1;
			vY1 = __tmp__Y1;
			vZ1 = __tmp__Z1;
			var v5 = this.localAnchor2;
			v5[0] = vX1;
			v5[1] = vY1;
			v5[2] = vZ1;
		}

		var UniversalJointConfig = function () {
			dynamics.constraint.joint.JointConfig.call(this);
			this.localAxis1 = vec3(1, 0, 0);
			this.localAxis2 = vec3(1, 0, 0);
			this.springDamper1 = new dynamics.constraint.joint.SpringDamper();
			this.springDamper2 = new dynamics.constraint.joint.SpringDamper();
			this.limitMotor1 = new dynamics.constraint.joint.RotationalLimitMotor();
			this.limitMotor2 = new dynamics.constraint.joint.RotationalLimitMotor();
		}
		return UniversalJointConfig;
	});

	dynamics.constraint.solver.direct.Boundary = pe.define(function (proto) {
		proto.init = function (buildInfo) {
			this.numBounded = buildInfo.numBounded;
			var _g1 = 0;
			var _g = this.numBounded;
			while (_g1 < _g) {
				var i = _g1++;
				this.iBounded[i] = buildInfo.iBounded[i];
				this.signs[i] = buildInfo.signs[i];
			}
			this.numUnbounded = buildInfo.numUnbounded;
			this.matrixId = 0;
			var _g11 = 0;
			var _g2 = this.numUnbounded;
			while (_g11 < _g2) {
				var i1 = _g11++;
				var idx = buildInfo.iUnbounded[i1];
				this.iUnbounded[i1] = idx;
				this.matrixId |= 1 << idx;
			}
		}

		proto.computeImpulses = function (info, mass, relVels, impulses, dImpulses, impulseFactor, noCheck) {
			var _g1 = 0;
			var _g = this.numUnbounded;
			while (_g1 < _g) {
				var i = _g1++;
				var idx = this.iUnbounded[i];
				var row = info.rows[idx];
				var relVel = relVels[idx];
				this.b[idx] = row.rhs * impulseFactor - relVel - row.cfm * impulses[idx];
			}
			var invMassWithoutCfm = mass._invMassWithoutCfm;
			var _g11 = 0;
			var _g2 = this.numBounded;
			while (_g11 < _g2) {
				var i1 = _g11++;
				var idx1 = this.iBounded[i1];
				var sign = this.signs[i1];
				var row1 = info.rows[idx1];
				var oldImpulse = impulses[idx1];
				var impulse = sign < 0 ? row1.minImpulse : sign > 0 ? row1.maxImpulse : 0;
				var dImpulse = impulse - oldImpulse;
				dImpulses[idx1] = dImpulse;
				if (dImpulse != 0) {
					var _g3 = 0;
					var _g21 = this.numUnbounded;
					while (_g3 < _g21) {
						var j = _g3++;
						var idx2 = this.iUnbounded[j];
						var dRelVel = invMassWithoutCfm[idx1][idx2] * dImpulse;
						var _g4 = idx2;
						var _g5 = this.b;
						_g5[_g4] = _g5[_g4] - dRelVel;
					}
				}
			}
			var indices = this.iUnbounded;
			var n = this.numUnbounded;
			var id = 0;
			var _g12 = 0;
			var _g6 = n;
			while (_g12 < _g6) {
				var i2 = _g12++;
				id |= 1 << indices[i2];
			}
			var massMatrix;
			if (mass._cacheComputed[id]) {
				massMatrix = mass._cachedSubmatrices[id];
			} else {
				mass.computeSubmatrix(id, indices, n);
				mass._cacheComputed[id] = true;
				massMatrix = mass._cachedSubmatrices[id];
			}
			var ok = true;
			var _g13 = 0;
			var _g7 = this.numUnbounded;
			while (_g13 < _g7) {
				var i3 = _g13++;
				var idx3 = this.iUnbounded[i3];
				var row2 = info.rows[idx3];
				var oldImpulse1 = impulses[idx3];
				var impulse1 = oldImpulse1;
				var _g31 = 0;
				var _g22 = this.numUnbounded;
				while (_g31 < _g22) {
					var j1 = _g31++;
					var idx21 = this.iUnbounded[j1];
					impulse1 += this.b[idx21] * massMatrix[i3][j1];
				}
				if (impulse1 < row2.minImpulse - pe.common.Setting.directMlcpSolverEps || impulse1 > row2.maxImpulse + pe.common.Setting.directMlcpSolverEps) {
					ok = false;
					break;
				}
				dImpulses[idx3] = impulse1 - oldImpulse1;
			}
			if (noCheck) {
				return true;
			}
			if (!ok) {
				return false;
			}
			var _g14 = 0;
			var _g8 = this.numBounded;
			while (_g14 < _g8) {
				var i4 = _g14++;
				var idx4 = this.iBounded[i4];
				var row3 = info.rows[idx4];
				var sign1 = this.signs[i4];
				var error = 0;
				var newImpulse = impulses[idx4] + dImpulses[idx4];
				var relVel1 = relVels[idx4];
				var _g32 = 0;
				var _g23 = info.numRows;
				while (_g32 < _g23) {
					var j2 = _g32++;
					relVel1 += invMassWithoutCfm[idx4][j2] * dImpulses[j2];
				}
				error = row3.rhs * impulseFactor - relVel1 - row3.cfm * newImpulse;
				if (sign1 < 0 && error > pe.common.Setting.directMlcpSolverEps || sign1 > 0 && error < -pe.common.Setting.directMlcpSolverEps) {
					ok = false;
					break;
				}
			}
			return ok;
		}

		var Boundary = function (maxRows) {
			var this1 = new Array(maxRows);
			this.iBounded = this1;
			var this2 = new Array(maxRows);
			this.iUnbounded = this2;
			var this3 = new Array(maxRows);
			this.signs = this3;
			var this4 = new Array(maxRows);
			this.b = this4;
			this.numBounded = 0;
			this.numUnbounded = 0;
			this.matrixId = 0;
		}
		return Boundary;
	});

	dynamics.constraint.solver.direct.BoundaryBuilder = pe.define(function (proto) {
		proto.buildBoundariesRecursive = function (info, i) {
			if (i == info.numRows) {
				if (this.boundaries[this.numBoundaries] == null) {
					this.boundaries[this.numBoundaries] = new dynamics.constraint.solver.direct.Boundary(this.maxRows);
				}
				this.boundaries[this.numBoundaries++].init(this.bbInfo);
				return;
			}
			var row = info.rows[i];
			var lowerLimitEnabled = row.minImpulse > -1.0 / 0.0;
			var upperLimitEnabled = row.maxImpulse < 1.0 / 0.0;
			var disabled = row.minImpulse == 0 && row.maxImpulse == 0;
			if (disabled) {
				var _this = this.bbInfo;
				_this.iBounded[_this.numBounded] = i;
				_this.signs[_this.numBounded] = 0;
				_this.numBounded++;
				this.buildBoundariesRecursive(info, i + 1);
				this.bbInfo.numBounded--;
				return;
			}
			var _this1 = this.bbInfo;
			_this1.iUnbounded[_this1.numUnbounded] = i;
			_this1.numUnbounded++;
			this.buildBoundariesRecursive(info, i + 1);
			this.bbInfo.numUnbounded--;
			if (lowerLimitEnabled) {
				var _this2 = this.bbInfo;
				_this2.iBounded[_this2.numBounded] = i;
				_this2.signs[_this2.numBounded] = -1;
				_this2.numBounded++;
				this.buildBoundariesRecursive(info, i + 1);
				this.bbInfo.numBounded--;
			}
			if (upperLimitEnabled) {
				var _this3 = this.bbInfo;
				_this3.iBounded[_this3.numBounded] = i;
				_this3.signs[_this3.numBounded] = 1;
				_this3.numBounded++;
				this.buildBoundariesRecursive(info, i + 1);
				this.bbInfo.numBounded--;
			}
		}

		proto.buildBoundaries = function (info) {
			this.numBoundaries = 0;
			var _this = this.bbInfo;
			_this.numBounded = 0;
			_this.numUnbounded = 0;
			this.buildBoundariesRecursive(info, 0);
		}

		var BoundaryBuilder = function (maxRows) {
			this.maxRows = maxRows;
			this.numBoundaries = 0;
			var this1 = new Array(1 << maxRows);
			this.boundaries = this1;
			this.bbInfo = new dynamics.constraint.solver.direct.BoundaryBuildInfo(maxRows);
		}
		return BoundaryBuilder;
	});

	dynamics.constraint.solver.direct.BoundarySelector = pe.define(function (proto) {
		proto.getIndex = function (i) {
			return this.indices[i];
		}

		proto.select = function (index) {
			var i = 0;
			while (this.indices[i] != index) ++i;
			while (i > 0) {
				var tmp = this.indices[i];
				this.indices[i] = this.indices[i - 1];
				this.indices[i - 1] = tmp;
				--i;
			}
		}

		proto.setSize = function (size) {
			var numSmaller = 0;
			var numGreater = 0;
			var _g1 = 0;
			var _g = this.n;
			while (_g1 < _g) {
				var i = _g1++;
				var idx = this.indices[i];
				if (idx < size) {
					this.tmpIndices[numSmaller] = idx;
					++numSmaller;
				} else {
					this.tmpIndices[size + numGreater] = idx;
					++numGreater;
				}
			}
			var tmp = this.indices;
			this.indices = this.tmpIndices;
			this.tmpIndices = tmp;
		}

		var BoundarySelector = function (n) {
			this.n = n;
			var this1 = new Array(n);
			this.indices = this1;
			var this2 = new Array(n);
			this.tmpIndices = this2;
			var _g1 = 0;
			var _g = n;
			while (_g1 < _g) {
				var i = _g1++;
				this.indices[i] = i;
			}
		}
		return BoundarySelector;
	});

	dynamics.constraint.solver.direct.DirectJointConstraintSolver = pe.define(function (proto) {
		proto.preSolveVelocity = function (timeStep) {
			this.joint._syncAnchors();
			this.joint._getVelocitySolverInfo(timeStep, this.info);
			this._b1 = this.info.b1;
			this._b2 = this.info.b2;
			this.massMatrix.computeInvMass(this.info, this.massData);
			var _this = this.boundaryBuilder;
			_this.numBoundaries = 0;
			var _this1 = _this.bbInfo;
			_this1.numBounded = 0;
			_this1.numUnbounded = 0;
			_this.buildBoundariesRecursive(this.info, 0);
			var _this2 = this.velBoundarySelector;
			var size = this.boundaryBuilder.numBoundaries;
			var numSmaller = 0;
			var numGreater = 0;
			var _g1 = 0;
			var _g = _this2.n;
			while (_g1 < _g) {
				var i = _g1++;
				var idx = _this2.indices[i];
				if (idx < size) {
					_this2.tmpIndices[numSmaller] = idx;
					++numSmaller;
				} else {
					_this2.tmpIndices[size + numGreater] = idx;
					++numGreater;
				}
			}
			var tmp = _this2.indices;
			_this2.indices = _this2.tmpIndices;
			_this2.tmpIndices = tmp;
		}

		proto.warmStart = function (timeStep) {
			var _g = this.joint._positionCorrectionAlgorithm;
			var factor = _g == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? pe.common.Setting.jointWarmStartingFactorForBaungarte : pe.common.Setting.jointWarmStartingFactor;
			factor *= timeStep.dtRatio;
			if (factor <= 0) {
				var _g1 = 0;
				var _g2 = this.info.numRows;
				while (_g1 < _g2) {
					var i = _g1++;
					var row = this.info.rows[i];
					var _this = row.impulse;
					_this.impulse = 0;
					_this.impulseM = 0;
					_this.impulseP = 0;
				}
				return;
			}
			var _g11 = 0;
			var _g3 = this.info.numRows;
			while (_g11 < _g3) {
				var i1 = _g11++;
				var row1 = this.info.rows[i1];
				var imp = row1.impulse;
				var impulse = imp.impulse * factor;
				if (impulse < row1.minImpulse) {
					impulse = row1.minImpulse;
				} else if (impulse > row1.maxImpulse) {
					impulse = row1.maxImpulse;
				}
				imp.impulse = impulse;
				if (row1.motorMaxImpulse > 0) {
					var impulseM = imp.impulseM * factor;
					var max = row1.motorMaxImpulse;
					if (impulseM < -max) {
						impulseM = -max;
					} else if (impulseM > max) {
						impulseM = max;
					}
					imp.impulseM = impulseM;
				} else {
					imp.impulseM = 0;
				}
				this.dImpulses[i1] = imp.impulse + imp.impulseM;
			}
			var impulses = this.dImpulses;
			var linearSet = false;
			var angularSet = false;
			var lv1;
			var lv1X;
			var lv1Y;
			var lv1Z;
			var lv2;
			var lv2X;
			var lv2Y;
			var lv2Z;
			var av1;
			var av1X;
			var av1Y;
			var av1Z;
			var av2;
			var av2X;
			var av2Y;
			var av2Z;
			lv1X = this._b1._vel[0];
			lv1Y = this._b1._vel[1];
			lv1Z = this._b1._vel[2];
			lv2X = this._b2._vel[0];
			lv2Y = this._b2._vel[1];
			lv2Z = this._b2._vel[2];
			av1X = this._b1._angVel[0];
			av1Y = this._b1._angVel[1];
			av1Z = this._b1._angVel[2];
			av2X = this._b2._angVel[0];
			av2Y = this._b2._angVel[1];
			av2Z = this._b2._angVel[2];
			var _g12 = 0;
			var _g4 = this.info.numRows;
			while (_g12 < _g4) {
				var i2 = _g12++;
				var row2 = this.info.rows[i2];
				var j = row2.jacobian;
				var md = this.massData[i2];
				var imp1 = impulses[i2];
				if ((j.flag & 1) != 0) {
					lv1X += md.invMLin1X * imp1;
					lv1Y += md.invMLin1Y * imp1;
					lv1Z += md.invMLin1Z * imp1;
					lv2X += md.invMLin2X * -imp1;
					lv2Y += md.invMLin2Y * -imp1;
					lv2Z += md.invMLin2Z * -imp1;
					linearSet = true;
				}
				if ((j.flag & 2) != 0) {
					av1X += md.invMAng1X * imp1;
					av1Y += md.invMAng1Y * imp1;
					av1Z += md.invMAng1Z * imp1;
					av2X += md.invMAng2X * -imp1;
					av2Y += md.invMAng2Y * -imp1;
					av2Z += md.invMAng2Z * -imp1;
					angularSet = true;
				}
			}
			if (linearSet) {
				this._b1._vel[0] = lv1X;
				this._b1._vel[1] = lv1Y;
				this._b1._vel[2] = lv1Z;
				this._b2._vel[0] = lv2X;
				this._b2._vel[1] = lv2Y;
				this._b2._vel[2] = lv2Z;
			}
			if (angularSet) {
				this._b1._angVel[0] = av1X;
				this._b1._angVel[1] = av1Y;
				this._b1._angVel[2] = av1Z;
				this._b2._angVel[0] = av2X;
				this._b2._angVel[1] = av2Y;
				this._b2._angVel[2] = av2Z;
			}
		}

		proto.solveVelocity = function () {
			var numRows = this.info.numRows;
			var lv1;
			var lv1X;
			var lv1Y;
			var lv1Z;
			var lv2;
			var lv2X;
			var lv2Y;
			var lv2Z;
			var av1;
			var av1X;
			var av1Y;
			var av1Z;
			var av2;
			var av2X;
			var av2Y;
			var av2Z;
			lv1X = this._b1._vel[0];
			lv1Y = this._b1._vel[1];
			lv1Z = this._b1._vel[2];
			lv2X = this._b2._vel[0];
			lv2Y = this._b2._vel[1];
			lv2Z = this._b2._vel[2];
			av1X = this._b1._angVel[0];
			av1Y = this._b1._angVel[1];
			av1Z = this._b1._angVel[2];
			av2X = this._b2._angVel[0];
			av2Y = this._b2._angVel[1];
			av2Z = this._b2._angVel[2];
			var _g1 = 0;
			var _g = numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var imp = row.impulse;
				var j = row.jacobian;
				var relVel = 0;
				relVel += lv1X * j.lin1X + lv1Y * j.lin1Y + lv1Z * j.lin1Z;
				relVel -= lv2X * j.lin2X + lv2Y * j.lin2Y + lv2Z * j.lin2Z;
				relVel += av1X * j.ang1X + av1Y * j.ang1Y + av1Z * j.ang1Z;
				relVel -= av2X * j.ang2X + av2Y * j.ang2Y + av2Z * j.ang2Z;
				this.relVels[i] = relVel;
				this.impulses[i] = imp.impulse;
				this.dTotalImpulses[i] = 0;
			}
			var invMass = this.massMatrix._invMassWithoutCfm;
			var _g11 = 0;
			var _g2 = numRows;
			while (_g11 < _g2) {
				var i1 = _g11++;
				var row1 = this.info.rows[i1];
				var imp1 = row1.impulse;
				var md = this.massData[i1];
				if (row1.motorMaxImpulse > 0) {
					var oldImpulseM = imp1.impulseM;
					var impulseM = oldImpulseM + md.massWithoutCfm * (-row1.motorSpeed - this.relVels[i1]);
					var maxImpulseM = imp1.impulseM;
					if (impulseM < -maxImpulseM) {
						impulseM = -maxImpulseM;
					} else if (impulseM > maxImpulseM) {
						impulseM = maxImpulseM;
					}
					imp1.impulseM = impulseM;
					var dImpulseM = impulseM - oldImpulseM;
					this.dTotalImpulses[i1] = dImpulseM;
					var _g3 = 0;
					var _g21 = numRows;
					while (_g3 < _g21) {
						var j1 = _g3++;
						var _g4 = j1;
						var _g5 = this.relVels;
						_g5[_g4] = _g5[_g4] + dImpulseM * invMass[i1][j1];
					}
				}
			}
			var solved = false;
			var _g12 = 0;
			var _g6 = this.boundaryBuilder.numBoundaries;
			while (_g12 < _g6) {
				var i2 = _g12++;
				var idx = this.velBoundarySelector.indices[i2];
				var b = this.boundaryBuilder.boundaries[idx];
				if (b.computeImpulses(this.info, this.massMatrix, this.relVels, this.impulses, this.dImpulses, 1, false)) {
					var _g31 = 0;
					var _g22 = numRows;
					while (_g31 < _g22) {
						var j2 = _g31++;
						var row2 = this.info.rows[j2];
						var imp2 = row2.impulse;
						var dimp = this.dImpulses[j2];
						imp2.impulse += dimp;
						var _g41 = j2;
						var _g51 = this.dTotalImpulses;
						_g51[_g41] = _g51[_g41] + dimp;
					}
					var impulses = this.dTotalImpulses;
					var linearSet = false;
					var angularSet = false;
					var lv11;
					var lv1X1;
					var lv1Y1;
					var lv1Z1;
					var lv21;
					var lv2X1;
					var lv2Y1;
					var lv2Z1;
					var av11;
					var av1X1;
					var av1Y1;
					var av1Z1;
					var av21;
					var av2X1;
					var av2Y1;
					var av2Z1;
					lv1X1 = this._b1._vel[0];
					lv1Y1 = this._b1._vel[1];
					lv1Z1 = this._b1._vel[2];
					lv2X1 = this._b2._vel[0];
					lv2Y1 = this._b2._vel[1];
					lv2Z1 = this._b2._vel[2];
					av1X1 = this._b1._angVel[0];
					av1Y1 = this._b1._angVel[1];
					av1Z1 = this._b1._angVel[2];
					av2X1 = this._b2._angVel[0];
					av2Y1 = this._b2._angVel[1];
					av2Z1 = this._b2._angVel[2];
					var _g13 = 0;
					var _g7 = this.info.numRows;
					while (_g13 < _g7) {
						var i3 = _g13++;
						var row3 = this.info.rows[i3];
						var j3 = row3.jacobian;
						var md1 = this.massData[i3];
						var imp3 = impulses[i3];
						if ((j3.flag & 1) != 0) {
							lv1X1 += md1.invMLin1X * imp3;
							lv1Y1 += md1.invMLin1Y * imp3;
							lv1Z1 += md1.invMLin1Z * imp3;
							lv2X1 += md1.invMLin2X * -imp3;
							lv2Y1 += md1.invMLin2Y * -imp3;
							lv2Z1 += md1.invMLin2Z * -imp3;
							linearSet = true;
						}
						if ((j3.flag & 2) != 0) {
							av1X1 += md1.invMAng1X * imp3;
							av1Y1 += md1.invMAng1Y * imp3;
							av1Z1 += md1.invMAng1Z * imp3;
							av2X1 += md1.invMAng2X * -imp3;
							av2Y1 += md1.invMAng2Y * -imp3;
							av2Z1 += md1.invMAng2Z * -imp3;
							angularSet = true;
						}
					}
					if (linearSet) {
						this._b1._vel[0] = lv1X1;
						this._b1._vel[1] = lv1Y1;
						this._b1._vel[2] = lv1Z1;
						this._b2._vel[0] = lv2X1;
						this._b2._vel[1] = lv2Y1;
						this._b2._vel[2] = lv2Z1;
					}
					if (angularSet) {
						this._b1._angVel[0] = av1X1;
						this._b1._angVel[1] = av1Y1;
						this._b1._angVel[2] = av1Z1;
						this._b2._angVel[0] = av2X1;
						this._b2._angVel[1] = av2Y1;
						this._b2._angVel[2] = av2Z1;
					}
					var _this = this.velBoundarySelector;
					var i4 = 0;
					while (_this.indices[i4] != idx) ++i4;
					while (i4 > 0) {
						var tmp = _this.indices[i4];
						_this.indices[i4] = _this.indices[i4 - 1];
						_this.indices[i4 - 1] = tmp;
						--i4;
					}
					solved = true;
					break;
				}
			}
			if (!solved) {
				console.log("DirectJointConstraintSolver.hx:338:", "could not find solution. (velocity)");
				return;
			}
		}

		proto.postSolveVelocity = function (timeStep) {
			var lin;
			var linX;
			var linY;
			var linZ;
			var ang;
			var angX;
			var angY;
			var angZ;
			linX = 0;
			linY = 0;
			linZ = 0;
			angX = 0;
			angY = 0;
			angZ = 0;
			var _g1 = 0;
			var _g = this.info.numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var imp = row.impulse;
				var j = row.jacobian;
				if ((j.flag & 1) != 0) {
					linX += j.lin1X * imp.impulse;
					linY += j.lin1Y * imp.impulse;
					linZ += j.lin1Z * imp.impulse;
				} else if ((j.flag & 2) != 0) {
					angX += j.ang1X * imp.impulse;
					angY += j.ang1Y * imp.impulse;
					angZ += j.ang1Z * imp.impulse;
				}
			}
			this.joint._appliedForceX = linX * timeStep.invDt;
			this.joint._appliedForceY = linY * timeStep.invDt;
			this.joint._appliedForceZ = linZ * timeStep.invDt;
			this.joint._appliedTorqueX = angX * timeStep.invDt;
			this.joint._appliedTorqueY = angY * timeStep.invDt;
			this.joint._appliedTorqueZ = angZ * timeStep.invDt;
		}

		proto.preSolvePosition = function (timeStep) {
			this.joint._syncAnchors();
			this.joint._getPositionSolverInfo(this.info);
			this._b1 = this.info.b1;
			this._b2 = this.info.b2;
			this.massMatrix.computeInvMass(this.info, this.massData);
			var _this = this.boundaryBuilder;
			_this.numBoundaries = 0;
			var _this1 = _this.bbInfo;
			_this1.numBounded = 0;
			_this1.numUnbounded = 0;
			_this.buildBoundariesRecursive(this.info, 0);
			var _this2 = this.posBoundarySelector;
			var size = this.boundaryBuilder.numBoundaries;
			var numSmaller = 0;
			var numGreater = 0;
			var _g1 = 0;
			var _g = _this2.n;
			while (_g1 < _g) {
				var i = _g1++;
				var idx = _this2.indices[i];
				if (idx < size) {
					_this2.tmpIndices[numSmaller] = idx;
					++numSmaller;
				} else {
					_this2.tmpIndices[size + numGreater] = idx;
					++numGreater;
				}
			}
			var tmp = _this2.indices;
			_this2.indices = _this2.tmpIndices;
			_this2.tmpIndices = tmp;
			var _g11 = 0;
			var _g2 = this.info.numRows;
			while (_g11 < _g2) {
				var i1 = _g11++;
				this.info.rows[i1].impulse.impulseP = 0;
			}
		}

		proto.solvePositionSplitImpulse = function () {
			var numRows = this.info.numRows;
			var lv1;
			var lv1X;
			var lv1Y;
			var lv1Z;
			var lv2;
			var lv2X;
			var lv2Y;
			var lv2Z;
			var av1;
			var av1X;
			var av1Y;
			var av1Z;
			var av2;
			var av2X;
			var av2Y;
			var av2Z;
			lv1X = this._b1._pseudoVel[0];
			lv1Y = this._b1._pseudoVel[1];
			lv1Z = this._b1._pseudoVel[2];
			lv2X = this._b2._pseudoVel[0];
			lv2Y = this._b2._pseudoVel[1];
			lv2Z = this._b2._pseudoVel[2];
			av1X = this._b1._angPseudoVel[0];
			av1Y = this._b1._angPseudoVel[1];
			av1Z = this._b1._angPseudoVel[2];
			av2X = this._b2._angPseudoVel[0];
			av2Y = this._b2._angPseudoVel[1];
			av2Z = this._b2._angPseudoVel[2];
			var _g1 = 0;
			var _g = numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var imp = row.impulse;
				var j = row.jacobian;
				var relVel = 0;
				relVel += lv1X * j.lin1X + lv1Y * j.lin1Y + lv1Z * j.lin1Z;
				relVel -= lv2X * j.lin2X + lv2Y * j.lin2Y + lv2Z * j.lin2Z;
				relVel += av1X * j.ang1X + av1Y * j.ang1Y + av1Z * j.ang1Z;
				relVel -= av2X * j.ang2X + av2Y * j.ang2Y + av2Z * j.ang2Z;
				this.relVels[i] = relVel;
				this.impulses[i] = imp.impulseP;
			}
			var solved = false;
			var _g11 = 0;
			var _g2 = this.boundaryBuilder.numBoundaries;
			while (_g11 < _g2) {
				var i1 = _g11++;
				var idx = this.posBoundarySelector.indices[i1];
				var b = this.boundaryBuilder.boundaries[idx];
				if (b.computeImpulses(this.info, this.massMatrix, this.relVels, this.impulses, this.dImpulses, pe.common.Setting.positionSplitImpulseBaumgarte, false)) {
					var _g3 = 0;
					var _g21 = numRows;
					while (_g3 < _g21) {
						var j1 = _g3++;
						var row1 = this.info.rows[j1];
						var imp1 = row1.impulse;
						var dimp = this.dImpulses[j1];
						imp1.impulseP += dimp;
					}
					var impulses = this.dImpulses;
					var linearSet = false;
					var angularSet = false;
					var lv11;
					var lv1X1;
					var lv1Y1;
					var lv1Z1;
					var lv21;
					var lv2X1;
					var lv2Y1;
					var lv2Z1;
					var av11;
					var av1X1;
					var av1Y1;
					var av1Z1;
					var av21;
					var av2X1;
					var av2Y1;
					var av2Z1;
					lv1X1 = this._b1._pseudoVel[0];
					lv1Y1 = this._b1._pseudoVel[1];
					lv1Z1 = this._b1._pseudoVel[2];
					lv2X1 = this._b2._pseudoVel[0];
					lv2Y1 = this._b2._pseudoVel[1];
					lv2Z1 = this._b2._pseudoVel[2];
					av1X1 = this._b1._angPseudoVel[0];
					av1Y1 = this._b1._angPseudoVel[1];
					av1Z1 = this._b1._angPseudoVel[2];
					av2X1 = this._b2._angPseudoVel[0];
					av2Y1 = this._b2._angPseudoVel[1];
					av2Z1 = this._b2._angPseudoVel[2];
					var _g12 = 0;
					var _g4 = this.info.numRows;
					while (_g12 < _g4) {
						var i2 = _g12++;
						var row2 = this.info.rows[i2];
						var j2 = row2.jacobian;
						var md = this.massData[i2];
						var imp2 = impulses[i2];
						if ((j2.flag & 1) != 0) {
							lv1X1 += md.invMLin1X * imp2;
							lv1Y1 += md.invMLin1Y * imp2;
							lv1Z1 += md.invMLin1Z * imp2;
							lv2X1 += md.invMLin2X * -imp2;
							lv2Y1 += md.invMLin2Y * -imp2;
							lv2Z1 += md.invMLin2Z * -imp2;
							linearSet = true;
						}
						if ((j2.flag & 2) != 0) {
							av1X1 += md.invMAng1X * imp2;
							av1Y1 += md.invMAng1Y * imp2;
							av1Z1 += md.invMAng1Z * imp2;
							av2X1 += md.invMAng2X * -imp2;
							av2Y1 += md.invMAng2Y * -imp2;
							av2Z1 += md.invMAng2Z * -imp2;
							angularSet = true;
						}
					}
					if (linearSet) {
						this._b1._pseudoVel[0] = lv1X1;
						this._b1._pseudoVel[1] = lv1Y1;
						this._b1._pseudoVel[2] = lv1Z1;
						this._b2._pseudoVel[0] = lv2X1;
						this._b2._pseudoVel[1] = lv2Y1;
						this._b2._pseudoVel[2] = lv2Z1;
					}
					if (angularSet) {
						this._b1._angPseudoVel[0] = av1X1;
						this._b1._angPseudoVel[1] = av1Y1;
						this._b1._angPseudoVel[2] = av1Z1;
						this._b2._angPseudoVel[0] = av2X1;
						this._b2._angPseudoVel[1] = av2Y1;
						this._b2._angPseudoVel[2] = av2Z1;
					}
					var _this = this.posBoundarySelector;
					var i3 = 0;
					while (_this.indices[i3] != idx) ++i3;
					while (i3 > 0) {
						var tmp = _this.indices[i3];
						_this.indices[i3] = _this.indices[i3 - 1];
						_this.indices[i3 - 1] = tmp;
						--i3;
					}
					solved = true;
					break;
				}
			}
			if (!solved) {
				console.log("DirectJointConstraintSolver.hx:454:", "could not find solution. (split impulse)");
				return;
			}
		}

		proto.solvePositionNgs = function (timeStep) {
			this.joint._syncAnchors();
			this.joint._getPositionSolverInfo(this.info);
			this._b1 = this.info.b1;
			this._b2 = this.info.b2;
			this.massMatrix.computeInvMass(this.info, this.massData);
			var _this = this.boundaryBuilder;
			_this.numBoundaries = 0;
			var _this1 = _this.bbInfo;
			_this1.numBounded = 0;
			_this1.numUnbounded = 0;
			_this.buildBoundariesRecursive(this.info, 0);
			var _this2 = this.posBoundarySelector;
			var size = this.boundaryBuilder.numBoundaries;
			var numSmaller = 0;
			var numGreater = 0;
			var _g1 = 0;
			var _g = _this2.n;
			while (_g1 < _g) {
				var i = _g1++;
				var idx = _this2.indices[i];
				if (idx < size) {
					_this2.tmpIndices[numSmaller] = idx;
					++numSmaller;
				} else {
					_this2.tmpIndices[size + numGreater] = idx;
					++numGreater;
				}
			}
			var tmp = _this2.indices;
			_this2.indices = _this2.tmpIndices;
			_this2.tmpIndices = tmp;
			var numRows = this.info.numRows;
			var _g11 = 0;
			var _g2 = numRows;
			while (_g11 < _g2) {
				var i1 = _g11++;
				var row = this.info.rows[i1];
				var imp = row.impulse;
				var j = row.jacobian;
				this.relVels[i1] = 0;
				this.impulses[i1] = imp.impulseP;
			}
			var solved = false;
			var _g12 = 0;
			var _g3 = this.boundaryBuilder.numBoundaries;
			while (_g12 < _g3) {
				var i2 = _g12++;
				var idx1 = this.posBoundarySelector.indices[i2];
				var b = this.boundaryBuilder.boundaries[idx1];
				if (b.computeImpulses(this.info, this.massMatrix, this.relVels, this.impulses, this.dImpulses, pe.common.Setting.positionNgsBaumgarte, false)) {
					var _g31 = 0;
					var _g21 = numRows;
					while (_g31 < _g21) {
						var j1 = _g31++;
						var row1 = this.info.rows[j1];
						var imp1 = row1.impulse;
						var dimp = this.dImpulses[j1];
						imp1.impulseP += dimp;
					}
					var impulses = this.dImpulses;
					var linearSet = false;
					var angularSet = false;
					var lv1;
					var lv1X;
					var lv1Y;
					var lv1Z;
					var lv2;
					var lv2X;
					var lv2Y;
					var lv2Z;
					var av1;
					var av1X;
					var av1Y;
					var av1Z;
					var av2;
					var av2X;
					var av2Y;
					var av2Z;
					lv1X = 0;
					lv1Y = 0;
					lv1Z = 0;
					lv2X = 0;
					lv2Y = 0;
					lv2Z = 0;
					av1X = 0;
					av1Y = 0;
					av1Z = 0;
					av2X = 0;
					av2Y = 0;
					av2Z = 0;
					var _g13 = 0;
					var _g4 = this.info.numRows;
					while (_g13 < _g4) {
						var i3 = _g13++;
						var row2 = this.info.rows[i3];
						var j2 = row2.jacobian;
						var md = this.massData[i3];
						var imp2 = impulses[i3];
						if ((j2.flag & 1) != 0) {
							lv1X += md.invMLin1X * imp2;
							lv1Y += md.invMLin1Y * imp2;
							lv1Z += md.invMLin1Z * imp2;
							lv2X += md.invMLin2X * -imp2;
							lv2Y += md.invMLin2Y * -imp2;
							lv2Z += md.invMLin2Z * -imp2;
							linearSet = true;
						}
						if ((j2.flag & 2) != 0) {
							av1X += md.invMAng1X * imp2;
							av1Y += md.invMAng1Y * imp2;
							av1Z += md.invMAng1Z * imp2;
							av2X += md.invMAng2X * -imp2;
							av2Y += md.invMAng2Y * -imp2;
							av2Z += md.invMAng2Z * -imp2;
							angularSet = true;
						}
					}
					if (linearSet) {
						var _this3 = this._b1;
						_this3._transform._position[0] += lv1X;
						_this3._transform._position[1] += lv1Y;
						_this3._transform._position[2] += lv1Z;
						var _this4 = this._b2;
						_this4._transform._position[0] += lv2X;
						_this4._transform._position[1] += lv2Y;
						_this4._transform._position[2] += lv2Z;
					}
					if (angularSet) {
						var _this5 = this._b1;
						var theta = Math.sqrt(av1X * av1X + av1Y * av1Y + av1Z * av1Z);
						var halfTheta = theta * 0.5;
						var rotationToSinAxisFactor;
						var cosHalfTheta;
						if (halfTheta < 0.5) {
							var ht2 = halfTheta * halfTheta;
							rotationToSinAxisFactor = 0.5 * (1 - ht2 * 0.16666666666666666 + ht2 * ht2 * 0.0083333333333333332);
							cosHalfTheta = 1 - ht2 * 0.5 + ht2 * ht2 * 0.041666666666666664;
						} else {
							rotationToSinAxisFactor = Math.sin(halfTheta) / theta;
							cosHalfTheta = Math.cos(halfTheta);
						}
						var sinAxis;
						var sinAxisX;
						var sinAxisY;
						var sinAxisZ;
						sinAxisX = av1X * rotationToSinAxisFactor;
						sinAxisY = av1Y * rotationToSinAxisFactor;
						sinAxisZ = av1Z * rotationToSinAxisFactor;
						var dq;
						var dqX;
						var dqY;
						var dqZ;
						var dqW;
						dqX = sinAxisX;
						dqY = sinAxisY;
						dqZ = sinAxisZ;
						dqW = cosHalfTheta;
						var q;
						var qX;
						var qY;
						var qZ;
						var qW;
						var e00 = _this5._transform._rotation[0];
						var e11 = _this5._transform._rotation[4];
						var e22 = _this5._transform._rotation[8];
						var t = e00 + e11 + e22;
						var s;
						if (t > 0) {
							s = Math.sqrt(t + 1);
							qW = 0.5 * s;
							s = 0.5 / s;
							qX = (_this5._transform._rotation[7] - _this5._transform._rotation[5]) * s;
							qY = (_this5._transform._rotation[2] - _this5._transform._rotation[6]) * s;
							qZ = (_this5._transform._rotation[3] - _this5._transform._rotation[1]) * s;
						} else if (e00 > e11) {
							if (e00 > e22) {
								s = Math.sqrt(e00 - e11 - e22 + 1);
								qX = 0.5 * s;
								s = 0.5 / s;
								qY = (_this5._transform._rotation[1] + _this5._transform._rotation[3]) * s;
								qZ = (_this5._transform._rotation[2] + _this5._transform._rotation[6]) * s;
								qW = (_this5._transform._rotation[7] - _this5._transform._rotation[5]) * s;
							} else {
								s = Math.sqrt(e22 - e00 - e11 + 1);
								qZ = 0.5 * s;
								s = 0.5 / s;
								qX = (_this5._transform._rotation[2] + _this5._transform._rotation[6]) * s;
								qY = (_this5._transform._rotation[5] + _this5._transform._rotation[7]) * s;
								qW = (_this5._transform._rotation[3] - _this5._transform._rotation[1]) * s;
							}
						} else if (e11 > e22) {
							s = Math.sqrt(e11 - e22 - e00 + 1);
							qY = 0.5 * s;
							s = 0.5 / s;
							qX = (_this5._transform._rotation[1] + _this5._transform._rotation[3]) * s;
							qZ = (_this5._transform._rotation[5] + _this5._transform._rotation[7]) * s;
							qW = (_this5._transform._rotation[2] - _this5._transform._rotation[6]) * s;
						} else {
							s = Math.sqrt(e22 - e00 - e11 + 1);
							qZ = 0.5 * s;
							s = 0.5 / s;
							qX = (_this5._transform._rotation[2] + _this5._transform._rotation[6]) * s;
							qY = (_this5._transform._rotation[5] + _this5._transform._rotation[7]) * s;
							qW = (_this5._transform._rotation[3] - _this5._transform._rotation[1]) * s;
						}
						qX = dqW * qX + dqX * qW + dqY * qZ - dqZ * qY;
						qY = dqW * qY - dqX * qZ + dqY * qW + dqZ * qX;
						qZ = dqW * qZ + dqX * qY - dqY * qX + dqZ * qW;
						qW = dqW * qW - dqX * qX - dqY * qY - dqZ * qZ;
						var l = qX * qX + qY * qY + qZ * qZ + qW * qW;
						if (l > 1e-32) {
							l = 1 / Math.sqrt(l);
						}
						qX *= l;
						qY *= l;
						qZ *= l;
						qW *= l;
						var x = qX;
						var y = qY;
						var z = qZ;
						var w = qW;
						var x2 = 2 * x;
						var y2 = 2 * y;
						var z2 = 2 * z;
						var xx = x * x2;
						var yy = y * y2;
						var zz = z * z2;
						var xy = x * y2;
						var yz = y * z2;
						var xz = x * z2;
						var wx = w * x2;
						var wy = w * y2;
						var wz = w * z2;
						_this5._transform._rotation[0] = 1 - yy - zz;
						_this5._transform._rotation[1] = xy - wz;
						_this5._transform._rotation[2] = xz + wy;
						_this5._transform._rotation[3] = xy + wz;
						_this5._transform._rotation[4] = 1 - xx - zz;
						_this5._transform._rotation[5] = yz - wx;
						_this5._transform._rotation[6] = xz - wy;
						_this5._transform._rotation[7] = yz + wx;
						_this5._transform._rotation[8] = 1 - xx - yy;
						var __tmp__00;
						var __tmp__01;
						var __tmp__02;
						var __tmp__10;
						var __tmp__11;
						var __tmp__12;
						var __tmp__20;
						var __tmp__21;
						var __tmp__22;
						__tmp__00 = _this5._transform._rotation[0] * _this5._invLocalInertia[0] + _this5._transform._rotation[1] * _this5._invLocalInertia[3] + _this5._transform._rotation[2] * _this5._invLocalInertia[6];
						__tmp__01 = _this5._transform._rotation[0] * _this5._invLocalInertia[1] + _this5._transform._rotation[1] * _this5._invLocalInertia[4] + _this5._transform._rotation[2] * _this5._invLocalInertia[7];
						__tmp__02 = _this5._transform._rotation[0] * _this5._invLocalInertia[2] + _this5._transform._rotation[1] * _this5._invLocalInertia[5] + _this5._transform._rotation[2] * _this5._invLocalInertia[8];
						__tmp__10 = _this5._transform._rotation[3] * _this5._invLocalInertia[0] + _this5._transform._rotation[4] * _this5._invLocalInertia[3] + _this5._transform._rotation[5] * _this5._invLocalInertia[6];
						__tmp__11 = _this5._transform._rotation[3] * _this5._invLocalInertia[1] + _this5._transform._rotation[4] * _this5._invLocalInertia[4] + _this5._transform._rotation[5] * _this5._invLocalInertia[7];
						__tmp__12 = _this5._transform._rotation[3] * _this5._invLocalInertia[2] + _this5._transform._rotation[4] * _this5._invLocalInertia[5] + _this5._transform._rotation[5] * _this5._invLocalInertia[8];
						__tmp__20 = _this5._transform._rotation[6] * _this5._invLocalInertia[0] + _this5._transform._rotation[7] * _this5._invLocalInertia[3] + _this5._transform._rotation[8] * _this5._invLocalInertia[6];
						__tmp__21 = _this5._transform._rotation[6] * _this5._invLocalInertia[1] + _this5._transform._rotation[7] * _this5._invLocalInertia[4] + _this5._transform._rotation[8] * _this5._invLocalInertia[7];
						__tmp__22 = _this5._transform._rotation[6] * _this5._invLocalInertia[2] + _this5._transform._rotation[7] * _this5._invLocalInertia[5] + _this5._transform._rotation[8] * _this5._invLocalInertia[8];
						_this5._invInertia[0] = __tmp__00;
						_this5._invInertia[1] = __tmp__01;
						_this5._invInertia[2] = __tmp__02;
						_this5._invInertia[3] = __tmp__10;
						_this5._invInertia[4] = __tmp__11;
						_this5._invInertia[5] = __tmp__12;
						_this5._invInertia[6] = __tmp__20;
						_this5._invInertia[7] = __tmp__21;
						_this5._invInertia[8] = __tmp__22;
						var __tmp__001;
						var __tmp__011;
						var __tmp__021;
						var __tmp__101;
						var __tmp__111;
						var __tmp__121;
						var __tmp__201;
						var __tmp__211;
						var __tmp__221;
						__tmp__001 = _this5._invInertia[0] * _this5._transform._rotation[0] + _this5._invInertia[1] * _this5._transform._rotation[1] + _this5._invInertia[2] * _this5._transform._rotation[2];
						__tmp__011 = _this5._invInertia[0] * _this5._transform._rotation[3] + _this5._invInertia[1] * _this5._transform._rotation[4] + _this5._invInertia[2] * _this5._transform._rotation[5];
						__tmp__021 = _this5._invInertia[0] * _this5._transform._rotation[6] + _this5._invInertia[1] * _this5._transform._rotation[7] + _this5._invInertia[2] * _this5._transform._rotation[8];
						__tmp__101 = _this5._invInertia[3] * _this5._transform._rotation[0] + _this5._invInertia[4] * _this5._transform._rotation[1] + _this5._invInertia[5] * _this5._transform._rotation[2];
						__tmp__111 = _this5._invInertia[3] * _this5._transform._rotation[3] + _this5._invInertia[4] * _this5._transform._rotation[4] + _this5._invInertia[5] * _this5._transform._rotation[5];
						__tmp__121 = _this5._invInertia[3] * _this5._transform._rotation[6] + _this5._invInertia[4] * _this5._transform._rotation[7] + _this5._invInertia[5] * _this5._transform._rotation[8];
						__tmp__201 = _this5._invInertia[6] * _this5._transform._rotation[0] + _this5._invInertia[7] * _this5._transform._rotation[1] + _this5._invInertia[8] * _this5._transform._rotation[2];
						__tmp__211 = _this5._invInertia[6] * _this5._transform._rotation[3] + _this5._invInertia[7] * _this5._transform._rotation[4] + _this5._invInertia[8] * _this5._transform._rotation[5];
						__tmp__221 = _this5._invInertia[6] * _this5._transform._rotation[6] + _this5._invInertia[7] * _this5._transform._rotation[7] + _this5._invInertia[8] * _this5._transform._rotation[8];
						_this5._invInertia[0] = __tmp__001;
						_this5._invInertia[1] = __tmp__011;
						_this5._invInertia[2] = __tmp__021;
						_this5._invInertia[3] = __tmp__101;
						_this5._invInertia[4] = __tmp__111;
						_this5._invInertia[5] = __tmp__121;
						_this5._invInertia[6] = __tmp__201;
						_this5._invInertia[7] = __tmp__211;
						_this5._invInertia[8] = __tmp__221;
						_this5._invInertia[0] *= _this5._rotFactor[0];
						_this5._invInertia[1] *= _this5._rotFactor[0];
						_this5._invInertia[2] *= _this5._rotFactor[0];
						_this5._invInertia[3] *= _this5._rotFactor[1];
						_this5._invInertia[4] *= _this5._rotFactor[1];
						_this5._invInertia[5] *= _this5._rotFactor[1];
						_this5._invInertia[6] *= _this5._rotFactor[2];
						_this5._invInertia[7] *= _this5._rotFactor[2];
						_this5._invInertia[8] *= _this5._rotFactor[2];
						var _this6 = this._b2;
						var theta1 = Math.sqrt(av2X * av2X + av2Y * av2Y + av2Z * av2Z);
						var halfTheta1 = theta1 * 0.5;
						var rotationToSinAxisFactor1;
						var cosHalfTheta1;
						if (halfTheta1 < 0.5) {
							var ht21 = halfTheta1 * halfTheta1;
							rotationToSinAxisFactor1 = 0.5 * (1 - ht21 * 0.16666666666666666 + ht21 * ht21 * 0.0083333333333333332);
							cosHalfTheta1 = 1 - ht21 * 0.5 + ht21 * ht21 * 0.041666666666666664;
						} else {
							rotationToSinAxisFactor1 = Math.sin(halfTheta1) / theta1;
							cosHalfTheta1 = Math.cos(halfTheta1);
						}
						var sinAxis1;
						var sinAxisX1;
						var sinAxisY1;
						var sinAxisZ1;
						sinAxisX1 = av2X * rotationToSinAxisFactor1;
						sinAxisY1 = av2Y * rotationToSinAxisFactor1;
						sinAxisZ1 = av2Z * rotationToSinAxisFactor1;
						var dq1;
						var dqX1;
						var dqY1;
						var dqZ1;
						var dqW1;
						dqX1 = sinAxisX1;
						dqY1 = sinAxisY1;
						dqZ1 = sinAxisZ1;
						dqW1 = cosHalfTheta1;
						var q1;
						var qX1;
						var qY1;
						var qZ1;
						var qW1;
						var e001 = _this6._transform._rotation[0];
						var e111 = _this6._transform._rotation[4];
						var e221 = _this6._transform._rotation[8];
						var t1 = e001 + e111 + e221;
						var s1;
						if (t1 > 0) {
							s1 = Math.sqrt(t1 + 1);
							qW1 = 0.5 * s1;
							s1 = 0.5 / s1;
							qX1 = (_this6._transform._rotation[7] - _this6._transform._rotation[5]) * s1;
							qY1 = (_this6._transform._rotation[2] - _this6._transform._rotation[6]) * s1;
							qZ1 = (_this6._transform._rotation[3] - _this6._transform._rotation[1]) * s1;
						} else if (e001 > e111) {
							if (e001 > e221) {
								s1 = Math.sqrt(e001 - e111 - e221 + 1);
								qX1 = 0.5 * s1;
								s1 = 0.5 / s1;
								qY1 = (_this6._transform._rotation[1] + _this6._transform._rotation[3]) * s1;
								qZ1 = (_this6._transform._rotation[2] + _this6._transform._rotation[6]) * s1;
								qW1 = (_this6._transform._rotation[7] - _this6._transform._rotation[5]) * s1;
							} else {
								s1 = Math.sqrt(e221 - e001 - e111 + 1);
								qZ1 = 0.5 * s1;
								s1 = 0.5 / s1;
								qX1 = (_this6._transform._rotation[2] + _this6._transform._rotation[6]) * s1;
								qY1 = (_this6._transform._rotation[5] + _this6._transform._rotation[7]) * s1;
								qW1 = (_this6._transform._rotation[3] - _this6._transform._rotation[1]) * s1;
							}
						} else if (e111 > e221) {
							s1 = Math.sqrt(e111 - e221 - e001 + 1);
							qY1 = 0.5 * s1;
							s1 = 0.5 / s1;
							qX1 = (_this6._transform._rotation[1] + _this6._transform._rotation[3]) * s1;
							qZ1 = (_this6._transform._rotation[5] + _this6._transform._rotation[7]) * s1;
							qW1 = (_this6._transform._rotation[2] - _this6._transform._rotation[6]) * s1;
						} else {
							s1 = Math.sqrt(e221 - e001 - e111 + 1);
							qZ1 = 0.5 * s1;
							s1 = 0.5 / s1;
							qX1 = (_this6._transform._rotation[2] + _this6._transform._rotation[6]) * s1;
							qY1 = (_this6._transform._rotation[5] + _this6._transform._rotation[7]) * s1;
							qW1 = (_this6._transform._rotation[3] - _this6._transform._rotation[1]) * s1;
						}
						qX1 = dqW1 * qX1 + dqX1 * qW1 + dqY1 * qZ1 - dqZ1 * qY1;
						qY1 = dqW1 * qY1 - dqX1 * qZ1 + dqY1 * qW1 + dqZ1 * qX1;
						qZ1 = dqW1 * qZ1 + dqX1 * qY1 - dqY1 * qX1 + dqZ1 * qW1;
						qW1 = dqW1 * qW1 - dqX1 * qX1 - dqY1 * qY1 - dqZ1 * qZ1;
						var l1 = qX1 * qX1 + qY1 * qY1 + qZ1 * qZ1 + qW1 * qW1;
						if (l1 > 1e-32) {
							l1 = 1 / Math.sqrt(l1);
						}
						qX1 *= l1;
						qY1 *= l1;
						qZ1 *= l1;
						qW1 *= l1;
						var x1 = qX1;
						var y1 = qY1;
						var z1 = qZ1;
						var w1 = qW1;
						var x21 = 2 * x1;
						var y21 = 2 * y1;
						var z21 = 2 * z1;
						var xx1 = x1 * x21;
						var yy1 = y1 * y21;
						var zz1 = z1 * z21;
						var xy1 = x1 * y21;
						var yz1 = y1 * z21;
						var xz1 = x1 * z21;
						var wx1 = w1 * x21;
						var wy1 = w1 * y21;
						var wz1 = w1 * z21;
						_this6._transform._rotation[0] = 1 - yy1 - zz1;
						_this6._transform._rotation[1] = xy1 - wz1;
						_this6._transform._rotation[2] = xz1 + wy1;
						_this6._transform._rotation[3] = xy1 + wz1;
						_this6._transform._rotation[4] = 1 - xx1 - zz1;
						_this6._transform._rotation[5] = yz1 - wx1;
						_this6._transform._rotation[6] = xz1 - wy1;
						_this6._transform._rotation[7] = yz1 + wx1;
						_this6._transform._rotation[8] = 1 - xx1 - yy1;
						var __tmp__002;
						var __tmp__012;
						var __tmp__022;
						var __tmp__102;
						var __tmp__112;
						var __tmp__122;
						var __tmp__202;
						var __tmp__212;
						var __tmp__222;
						__tmp__002 = _this6._transform._rotation[0] * _this6._invLocalInertia[0] + _this6._transform._rotation[1] * _this6._invLocalInertia[3] + _this6._transform._rotation[2] * _this6._invLocalInertia[6];
						__tmp__012 = _this6._transform._rotation[0] * _this6._invLocalInertia[1] + _this6._transform._rotation[1] * _this6._invLocalInertia[4] + _this6._transform._rotation[2] * _this6._invLocalInertia[7];
						__tmp__022 = _this6._transform._rotation[0] * _this6._invLocalInertia[2] + _this6._transform._rotation[1] * _this6._invLocalInertia[5] + _this6._transform._rotation[2] * _this6._invLocalInertia[8];
						__tmp__102 = _this6._transform._rotation[3] * _this6._invLocalInertia[0] + _this6._transform._rotation[4] * _this6._invLocalInertia[3] + _this6._transform._rotation[5] * _this6._invLocalInertia[6];
						__tmp__112 = _this6._transform._rotation[3] * _this6._invLocalInertia[1] + _this6._transform._rotation[4] * _this6._invLocalInertia[4] + _this6._transform._rotation[5] * _this6._invLocalInertia[7];
						__tmp__122 = _this6._transform._rotation[3] * _this6._invLocalInertia[2] + _this6._transform._rotation[4] * _this6._invLocalInertia[5] + _this6._transform._rotation[5] * _this6._invLocalInertia[8];
						__tmp__202 = _this6._transform._rotation[6] * _this6._invLocalInertia[0] + _this6._transform._rotation[7] * _this6._invLocalInertia[3] + _this6._transform._rotation[8] * _this6._invLocalInertia[6];
						__tmp__212 = _this6._transform._rotation[6] * _this6._invLocalInertia[1] + _this6._transform._rotation[7] * _this6._invLocalInertia[4] + _this6._transform._rotation[8] * _this6._invLocalInertia[7];
						__tmp__222 = _this6._transform._rotation[6] * _this6._invLocalInertia[2] + _this6._transform._rotation[7] * _this6._invLocalInertia[5] + _this6._transform._rotation[8] * _this6._invLocalInertia[8];
						_this6._invInertia[0] = __tmp__002;
						_this6._invInertia[1] = __tmp__012;
						_this6._invInertia[2] = __tmp__022;
						_this6._invInertia[3] = __tmp__102;
						_this6._invInertia[4] = __tmp__112;
						_this6._invInertia[5] = __tmp__122;
						_this6._invInertia[6] = __tmp__202;
						_this6._invInertia[7] = __tmp__212;
						_this6._invInertia[8] = __tmp__222;
						var __tmp__003;
						var __tmp__013;
						var __tmp__023;
						var __tmp__103;
						var __tmp__113;
						var __tmp__123;
						var __tmp__203;
						var __tmp__213;
						var __tmp__223;
						__tmp__003 = _this6._invInertia[0] * _this6._transform._rotation[0] + _this6._invInertia[1] * _this6._transform._rotation[1] + _this6._invInertia[2] * _this6._transform._rotation[2];
						__tmp__013 = _this6._invInertia[0] * _this6._transform._rotation[3] + _this6._invInertia[1] * _this6._transform._rotation[4] + _this6._invInertia[2] * _this6._transform._rotation[5];
						__tmp__023 = _this6._invInertia[0] * _this6._transform._rotation[6] + _this6._invInertia[1] * _this6._transform._rotation[7] + _this6._invInertia[2] * _this6._transform._rotation[8];
						__tmp__103 = _this6._invInertia[3] * _this6._transform._rotation[0] + _this6._invInertia[4] * _this6._transform._rotation[1] + _this6._invInertia[5] * _this6._transform._rotation[2];
						__tmp__113 = _this6._invInertia[3] * _this6._transform._rotation[3] + _this6._invInertia[4] * _this6._transform._rotation[4] + _this6._invInertia[5] * _this6._transform._rotation[5];
						__tmp__123 = _this6._invInertia[3] * _this6._transform._rotation[6] + _this6._invInertia[4] * _this6._transform._rotation[7] + _this6._invInertia[5] * _this6._transform._rotation[8];
						__tmp__203 = _this6._invInertia[6] * _this6._transform._rotation[0] + _this6._invInertia[7] * _this6._transform._rotation[1] + _this6._invInertia[8] * _this6._transform._rotation[2];
						__tmp__213 = _this6._invInertia[6] * _this6._transform._rotation[3] + _this6._invInertia[7] * _this6._transform._rotation[4] + _this6._invInertia[8] * _this6._transform._rotation[5];
						__tmp__223 = _this6._invInertia[6] * _this6._transform._rotation[6] + _this6._invInertia[7] * _this6._transform._rotation[7] + _this6._invInertia[8] * _this6._transform._rotation[8];
						_this6._invInertia[0] = __tmp__003;
						_this6._invInertia[1] = __tmp__013;
						_this6._invInertia[2] = __tmp__023;
						_this6._invInertia[3] = __tmp__103;
						_this6._invInertia[4] = __tmp__113;
						_this6._invInertia[5] = __tmp__123;
						_this6._invInertia[6] = __tmp__203;
						_this6._invInertia[7] = __tmp__213;
						_this6._invInertia[8] = __tmp__223;
						_this6._invInertia[0] *= _this6._rotFactor[0];
						_this6._invInertia[1] *= _this6._rotFactor[0];
						_this6._invInertia[2] *= _this6._rotFactor[0];
						_this6._invInertia[3] *= _this6._rotFactor[1];
						_this6._invInertia[4] *= _this6._rotFactor[1];
						_this6._invInertia[5] *= _this6._rotFactor[1];
						_this6._invInertia[6] *= _this6._rotFactor[2];
						_this6._invInertia[7] *= _this6._rotFactor[2];
						_this6._invInertia[8] *= _this6._rotFactor[2];
					}
					var _this7 = this.posBoundarySelector;
					var i4 = 0;
					while (_this7.indices[i4] != idx1) ++i4;
					while (i4 > 0) {
						var tmp1 = _this7.indices[i4];
						_this7.indices[i4] = _this7.indices[i4 - 1];
						_this7.indices[i4 - 1] = tmp1;
						--i4;
					}
					solved = true;
					break;
				}
			}
			if (!solved) {
				console.log("DirectJointConstraintSolver.hx:506:", "could not find solution. (NGS)");
				return;
			}
		}

		proto.postSolve = function () {
			this.joint._syncAnchors();
			this.joint._checkDestruction();
		}

		var DirectJointConstraintSolver = function (joint) {
			dynamics.constraint.ConstraintSolver.call(this);
			this.joint = joint;
			this.info = new dynamics.constraint.info.joint.JointSolverInfo();
			var maxRows = pe.common.Setting.maxJacobianRows;
			this.massMatrix = new dynamics.constraint.solver.direct.MassMatrix(maxRows);
			this.boundaryBuilder = new dynamics.constraint.solver.direct.BoundaryBuilder(maxRows);
			var this1 = new Array(maxRows);
			this.massData = this1;
			var _g1 = 0;
			var _g = this.massData.length;
			while (_g1 < _g) {
				var i = _g1++;
				this.massData[i] = new dynamics.constraint.solver.common.JointSolverMassDataRow();
			}
			var numMaxBoundaries = this.boundaryBuilder.boundaries.length;
			this.velBoundarySelector = new dynamics.constraint.solver.direct.BoundarySelector(numMaxBoundaries);
			this.posBoundarySelector = new dynamics.constraint.solver.direct.BoundarySelector(numMaxBoundaries);
			var this2 = new Array(maxRows);
			this.relVels = this2;
			var this3 = new Array(maxRows);
			this.impulses = this3;
			var this4 = new Array(maxRows);
			this.dImpulses = this4;
			var this5 = new Array(maxRows);
			this.dTotalImpulses = this5;
			var _g11 = 0;
			var _g2 = maxRows;
			while (_g11 < _g2) {
				var i1 = _g11++;
				this.relVels[i1] = 0;
				this.impulses[i1] = 0;
				this.dImpulses[i1] = 0;
				this.dTotalImpulses[i1] = 0;
			}
		}
		return DirectJointConstraintSolver;
	});

	dynamics.constraint.solver.direct.MassMatrix = pe.define(function (proto) {
		proto.computeSubmatrix = function (id, indices, size) {
			var _g1 = 0;
			var _g = size;
			while (_g1 < _g) {
				var i = _g1++;
				var ii = indices[i];
				var _g3 = 0;
				var _g2 = size;
				while (_g3 < _g2) {
					var j = _g3++;
					this.tmpMatrix[i][j] = this._invMass[ii][indices[j]];
				}
			}
			var src = this.tmpMatrix;
			var dst = this._cachedSubmatrices[id];
			var srci;
			var dsti;
			var srcj;
			var dstj;
			var diag;
			switch (size) {
				case 4:
					srci = src[0];
					dsti = dst[0];
					diag = 1 / srci[0];
					dsti[0] = diag;
					srci[1] = srci[1] * diag;
					srci[2] = srci[2] * diag;
					srci[3] = srci[3] * diag;
					srcj = src[1];
					dstj = dst[1];
					dstj[0] = -diag * srcj[0];
					srcj[1] = srcj[1] - srci[1] * srcj[0];
					srcj[2] = srcj[2] - srci[2] * srcj[0];
					srcj[3] = srcj[3] - srci[3] * srcj[0];
					srcj = src[2];
					dstj = dst[2];
					dstj[0] = -diag * srcj[0];
					srcj[1] = srcj[1] - srci[1] * srcj[0];
					srcj[2] = srcj[2] - srci[2] * srcj[0];
					srcj[3] = srcj[3] - srci[3] * srcj[0];
					srcj = src[3];
					dstj = dst[3];
					dstj[0] = -diag * srcj[0];
					srcj[1] = srcj[1] - srci[1] * srcj[0];
					srcj[2] = srcj[2] - srci[2] * srcj[0];
					srcj[3] = srcj[3] - srci[3] * srcj[0];
					srci = src[1];
					dsti = dst[1];
					diag = 1 / srci[1];
					dsti[1] = diag;
					dsti[0] = dsti[0] * diag;
					srci[2] = srci[2] * diag;
					srci[3] = srci[3] * diag;
					srcj = src[0];
					dstj = dst[0];
					dstj[0] = dstj[0] - dsti[0] * srcj[1];
					srcj[2] = srcj[2] - srci[2] * srcj[1];
					srcj[3] = srcj[3] - srci[3] * srcj[1];
					srcj = src[2];
					dstj = dst[2];
					dstj[0] = dstj[0] - dsti[0] * srcj[1];
					dstj[1] = -diag * srcj[1];
					srcj[2] = srcj[2] - srci[2] * srcj[1];
					srcj[3] = srcj[3] - srci[3] * srcj[1];
					srcj = src[3];
					dstj = dst[3];
					dstj[0] = dstj[0] - dsti[0] * srcj[1];
					dstj[1] = -diag * srcj[1];
					srcj[2] = srcj[2] - srci[2] * srcj[1];
					srcj[3] = srcj[3] - srci[3] * srcj[1];
					srci = src[2];
					dsti = dst[2];
					diag = 1 / srci[2];
					dsti[2] = diag;
					dsti[0] = dsti[0] * diag;
					dsti[1] = dsti[1] * diag;
					srci[3] = srci[3] * diag;
					srcj = src[0];
					dstj = dst[0];
					dstj[0] = dstj[0] - dsti[0] * srcj[2];
					srcj[3] = srcj[3] - srci[3] * srcj[2];
					srcj = src[1];
					dstj = dst[1];
					dstj[0] = dstj[0] - dsti[0] * srcj[2];
					dstj[1] = dstj[1] - dsti[1] * srcj[2];
					srcj[3] = srcj[3] - srci[3] * srcj[2];
					srcj = src[3];
					dstj = dst[3];
					dstj[0] = dstj[0] - dsti[0] * srcj[2];
					dstj[1] = dstj[1] - dsti[1] * srcj[2];
					dstj[2] = -diag * srcj[2];
					srcj[3] = srcj[3] - srci[3] * srcj[2];
					srci = src[3];
					dsti = dst[3];
					diag = 1 / srci[3];
					dsti[3] = diag;
					dsti[0] = dsti[0] * diag;
					dsti[1] = dsti[1] * diag;
					dsti[2] = dsti[2] * diag;
					srcj = src[0];
					dstj = dst[0];
					dstj[0] = dstj[0] - dsti[0] * srcj[3];
					srcj = src[1];
					dstj = dst[1];
					dstj[0] = dstj[0] - dsti[0] * srcj[3];
					dstj[1] = dstj[1] - dsti[1] * srcj[3];
					srcj = src[2];
					dstj = dst[2];
					dstj[0] = dstj[0] - dsti[0] * srcj[3];
					dstj[1] = dstj[1] - dsti[1] * srcj[3];
					dstj[2] = dstj[2] - dsti[2] * srcj[3];
					dsti = dst[1];
					dst[0][1] = dsti[0];
					dsti = dst[2];
					dst[0][2] = dsti[0];
					dst[1][2] = dsti[1];
					dsti = dst[3];
					dst[0][3] = dsti[0];
					dst[1][3] = dsti[1];
					dst[2][3] = dsti[2];
					break;
				case 5:
					srci = src[0];
					dsti = dst[0];
					diag = 1 / srci[0];
					dsti[0] = diag;
					srci[1] = srci[1] * diag;
					srci[2] = srci[2] * diag;
					srci[3] = srci[3] * diag;
					srci[4] = srci[4] * diag;
					srcj = src[1];
					dstj = dst[1];
					dstj[0] = -diag * srcj[0];
					srcj[1] = srcj[1] - srci[1] * srcj[0];
					srcj[2] = srcj[2] - srci[2] * srcj[0];
					srcj[3] = srcj[3] - srci[3] * srcj[0];
					srcj[4] = srcj[4] - srci[4] * srcj[0];
					srcj = src[2];
					dstj = dst[2];
					dstj[0] = -diag * srcj[0];
					srcj[1] = srcj[1] - srci[1] * srcj[0];
					srcj[2] = srcj[2] - srci[2] * srcj[0];
					srcj[3] = srcj[3] - srci[3] * srcj[0];
					srcj[4] = srcj[4] - srci[4] * srcj[0];
					srcj = src[3];
					dstj = dst[3];
					dstj[0] = -diag * srcj[0];
					srcj[1] = srcj[1] - srci[1] * srcj[0];
					srcj[2] = srcj[2] - srci[2] * srcj[0];
					srcj[3] = srcj[3] - srci[3] * srcj[0];
					srcj[4] = srcj[4] - srci[4] * srcj[0];
					srcj = src[4];
					dstj = dst[4];
					dstj[0] = -diag * srcj[0];
					srcj[1] = srcj[1] - srci[1] * srcj[0];
					srcj[2] = srcj[2] - srci[2] * srcj[0];
					srcj[3] = srcj[3] - srci[3] * srcj[0];
					srcj[4] = srcj[4] - srci[4] * srcj[0];
					srci = src[1];
					dsti = dst[1];
					diag = 1 / srci[1];
					dsti[1] = diag;
					dsti[0] = dsti[0] * diag;
					srci[2] = srci[2] * diag;
					srci[3] = srci[3] * diag;
					srci[4] = srci[4] * diag;
					srcj = src[0];
					dstj = dst[0];
					dstj[0] = dstj[0] - dsti[0] * srcj[1];
					srcj[2] = srcj[2] - srci[2] * srcj[1];
					srcj[3] = srcj[3] - srci[3] * srcj[1];
					srcj[4] = srcj[4] - srci[4] * srcj[1];
					srcj = src[2];
					dstj = dst[2];
					dstj[0] = dstj[0] - dsti[0] * srcj[1];
					dstj[1] = -diag * srcj[1];
					srcj[2] = srcj[2] - srci[2] * srcj[1];
					srcj[3] = srcj[3] - srci[3] * srcj[1];
					srcj[4] = srcj[4] - srci[4] * srcj[1];
					srcj = src[3];
					dstj = dst[3];
					dstj[0] = dstj[0] - dsti[0] * srcj[1];
					dstj[1] = -diag * srcj[1];
					srcj[2] = srcj[2] - srci[2] * srcj[1];
					srcj[3] = srcj[3] - srci[3] * srcj[1];
					srcj[4] = srcj[4] - srci[4] * srcj[1];
					srcj = src[4];
					dstj = dst[4];
					dstj[0] = dstj[0] - dsti[0] * srcj[1];
					dstj[1] = -diag * srcj[1];
					srcj[2] = srcj[2] - srci[2] * srcj[1];
					srcj[3] = srcj[3] - srci[3] * srcj[1];
					srcj[4] = srcj[4] - srci[4] * srcj[1];
					srci = src[2];
					dsti = dst[2];
					diag = 1 / srci[2];
					dsti[2] = diag;
					dsti[0] = dsti[0] * diag;
					dsti[1] = dsti[1] * diag;
					srci[3] = srci[3] * diag;
					srci[4] = srci[4] * diag;
					srcj = src[0];
					dstj = dst[0];
					dstj[0] = dstj[0] - dsti[0] * srcj[2];
					srcj[3] = srcj[3] - srci[3] * srcj[2];
					srcj[4] = srcj[4] - srci[4] * srcj[2];
					srcj = src[1];
					dstj = dst[1];
					dstj[0] = dstj[0] - dsti[0] * srcj[2];
					dstj[1] = dstj[1] - dsti[1] * srcj[2];
					srcj[3] = srcj[3] - srci[3] * srcj[2];
					srcj[4] = srcj[4] - srci[4] * srcj[2];
					srcj = src[3];
					dstj = dst[3];
					dstj[0] = dstj[0] - dsti[0] * srcj[2];
					dstj[1] = dstj[1] - dsti[1] * srcj[2];
					dstj[2] = -diag * srcj[2];
					srcj[3] = srcj[3] - srci[3] * srcj[2];
					srcj[4] = srcj[4] - srci[4] * srcj[2];
					srcj = src[4];
					dstj = dst[4];
					dstj[0] = dstj[0] - dsti[0] * srcj[2];
					dstj[1] = dstj[1] - dsti[1] * srcj[2];
					dstj[2] = -diag * srcj[2];
					srcj[3] = srcj[3] - srci[3] * srcj[2];
					srcj[4] = srcj[4] - srci[4] * srcj[2];
					srci = src[3];
					dsti = dst[3];
					diag = 1 / srci[3];
					dsti[3] = diag;
					dsti[0] = dsti[0] * diag;
					dsti[1] = dsti[1] * diag;
					dsti[2] = dsti[2] * diag;
					srci[4] = srci[4] * diag;
					srcj = src[0];
					dstj = dst[0];
					dstj[0] = dstj[0] - dsti[0] * srcj[3];
					srcj[4] = srcj[4] - srci[4] * srcj[3];
					srcj = src[1];
					dstj = dst[1];
					dstj[0] = dstj[0] - dsti[0] * srcj[3];
					dstj[1] = dstj[1] - dsti[1] * srcj[3];
					srcj[4] = srcj[4] - srci[4] * srcj[3];
					srcj = src[2];
					dstj = dst[2];
					dstj[0] = dstj[0] - dsti[0] * srcj[3];
					dstj[1] = dstj[1] - dsti[1] * srcj[3];
					dstj[2] = dstj[2] - dsti[2] * srcj[3];
					srcj[4] = srcj[4] - srci[4] * srcj[3];
					srcj = src[4];
					dstj = dst[4];
					dstj[0] = dstj[0] - dsti[0] * srcj[3];
					dstj[1] = dstj[1] - dsti[1] * srcj[3];
					dstj[2] = dstj[2] - dsti[2] * srcj[3];
					dstj[3] = -diag * srcj[3];
					srcj[4] = srcj[4] - srci[4] * srcj[3];
					srci = src[4];
					dsti = dst[4];
					diag = 1 / srci[4];
					dsti[4] = diag;
					dsti[0] = dsti[0] * diag;
					dsti[1] = dsti[1] * diag;
					dsti[2] = dsti[2] * diag;
					dsti[3] = dsti[3] * diag;
					srcj = src[0];
					dstj = dst[0];
					dstj[0] = dstj[0] - dsti[0] * srcj[4];
					srcj = src[1];
					dstj = dst[1];
					dstj[0] = dstj[0] - dsti[0] * srcj[4];
					dstj[1] = dstj[1] - dsti[1] * srcj[4];
					srcj = src[2];
					dstj = dst[2];
					dstj[0] = dstj[0] - dsti[0] * srcj[4];
					dstj[1] = dstj[1] - dsti[1] * srcj[4];
					dstj[2] = dstj[2] - dsti[2] * srcj[4];
					srcj = src[3];
					dstj = dst[3];
					dstj[0] = dstj[0] - dsti[0] * srcj[4];
					dstj[1] = dstj[1] - dsti[1] * srcj[4];
					dstj[2] = dstj[2] - dsti[2] * srcj[4];
					dstj[3] = dstj[3] - dsti[3] * srcj[4];
					dsti = dst[1];
					dst[0][1] = dsti[0];
					dsti = dst[2];
					dst[0][2] = dsti[0];
					dst[1][2] = dsti[1];
					dsti = dst[3];
					dst[0][3] = dsti[0];
					dst[1][3] = dsti[1];
					dst[2][3] = dsti[2];
					dsti = dst[4];
					dst[0][4] = dsti[0];
					dst[1][4] = dsti[1];
					dst[2][4] = dsti[2];
					dst[3][4] = dsti[3];
					break;
				case 6:
					srci = src[0];
					dsti = dst[0];
					diag = 1 / srci[0];
					dsti[0] = diag;
					srci[1] = srci[1] * diag;
					srci[2] = srci[2] * diag;
					srci[3] = srci[3] * diag;
					srci[4] = srci[4] * diag;
					srci[5] = srci[5] * diag;
					srcj = src[1];
					dstj = dst[1];
					dstj[0] = -diag * srcj[0];
					srcj[1] = srcj[1] - srci[1] * srcj[0];
					srcj[2] = srcj[2] - srci[2] * srcj[0];
					srcj[3] = srcj[3] - srci[3] * srcj[0];
					srcj[4] = srcj[4] - srci[4] * srcj[0];
					srcj[5] = srcj[5] - srci[5] * srcj[0];
					srcj = src[2];
					dstj = dst[2];
					dstj[0] = -diag * srcj[0];
					srcj[1] = srcj[1] - srci[1] * srcj[0];
					srcj[2] = srcj[2] - srci[2] * srcj[0];
					srcj[3] = srcj[3] - srci[3] * srcj[0];
					srcj[4] = srcj[4] - srci[4] * srcj[0];
					srcj[5] = srcj[5] - srci[5] * srcj[0];
					srcj = src[3];
					dstj = dst[3];
					dstj[0] = -diag * srcj[0];
					srcj[1] = srcj[1] - srci[1] * srcj[0];
					srcj[2] = srcj[2] - srci[2] * srcj[0];
					srcj[3] = srcj[3] - srci[3] * srcj[0];
					srcj[4] = srcj[4] - srci[4] * srcj[0];
					srcj[5] = srcj[5] - srci[5] * srcj[0];
					srcj = src[4];
					dstj = dst[4];
					dstj[0] = -diag * srcj[0];
					srcj[1] = srcj[1] - srci[1] * srcj[0];
					srcj[2] = srcj[2] - srci[2] * srcj[0];
					srcj[3] = srcj[3] - srci[3] * srcj[0];
					srcj[4] = srcj[4] - srci[4] * srcj[0];
					srcj[5] = srcj[5] - srci[5] * srcj[0];
					srcj = src[5];
					dstj = dst[5];
					dstj[0] = -diag * srcj[0];
					srcj[1] = srcj[1] - srci[1] * srcj[0];
					srcj[2] = srcj[2] - srci[2] * srcj[0];
					srcj[3] = srcj[3] - srci[3] * srcj[0];
					srcj[4] = srcj[4] - srci[4] * srcj[0];
					srcj[5] = srcj[5] - srci[5] * srcj[0];
					srci = src[1];
					dsti = dst[1];
					diag = 1 / srci[1];
					dsti[1] = diag;
					dsti[0] = dsti[0] * diag;
					srci[2] = srci[2] * diag;
					srci[3] = srci[3] * diag;
					srci[4] = srci[4] * diag;
					srci[5] = srci[5] * diag;
					srcj = src[0];
					dstj = dst[0];
					dstj[0] = dstj[0] - dsti[0] * srcj[1];
					srcj[2] = srcj[2] - srci[2] * srcj[1];
					srcj[3] = srcj[3] - srci[3] * srcj[1];
					srcj[4] = srcj[4] - srci[4] * srcj[1];
					srcj[5] = srcj[5] - srci[5] * srcj[1];
					srcj = src[2];
					dstj = dst[2];
					dstj[0] = dstj[0] - dsti[0] * srcj[1];
					dstj[1] = -diag * srcj[1];
					srcj[2] = srcj[2] - srci[2] * srcj[1];
					srcj[3] = srcj[3] - srci[3] * srcj[1];
					srcj[4] = srcj[4] - srci[4] * srcj[1];
					srcj[5] = srcj[5] - srci[5] * srcj[1];
					srcj = src[3];
					dstj = dst[3];
					dstj[0] = dstj[0] - dsti[0] * srcj[1];
					dstj[1] = -diag * srcj[1];
					srcj[2] = srcj[2] - srci[2] * srcj[1];
					srcj[3] = srcj[3] - srci[3] * srcj[1];
					srcj[4] = srcj[4] - srci[4] * srcj[1];
					srcj[5] = srcj[5] - srci[5] * srcj[1];
					srcj = src[4];
					dstj = dst[4];
					dstj[0] = dstj[0] - dsti[0] * srcj[1];
					dstj[1] = -diag * srcj[1];
					srcj[2] = srcj[2] - srci[2] * srcj[1];
					srcj[3] = srcj[3] - srci[3] * srcj[1];
					srcj[4] = srcj[4] - srci[4] * srcj[1];
					srcj[5] = srcj[5] - srci[5] * srcj[1];
					srcj = src[5];
					dstj = dst[5];
					dstj[0] = dstj[0] - dsti[0] * srcj[1];
					dstj[1] = -diag * srcj[1];
					srcj[2] = srcj[2] - srci[2] * srcj[1];
					srcj[3] = srcj[3] - srci[3] * srcj[1];
					srcj[4] = srcj[4] - srci[4] * srcj[1];
					srcj[5] = srcj[5] - srci[5] * srcj[1];
					srci = src[2];
					dsti = dst[2];
					diag = 1 / srci[2];
					dsti[2] = diag;
					dsti[0] = dsti[0] * diag;
					dsti[1] = dsti[1] * diag;
					srci[3] = srci[3] * diag;
					srci[4] = srci[4] * diag;
					srci[5] = srci[5] * diag;
					srcj = src[0];
					dstj = dst[0];
					dstj[0] = dstj[0] - dsti[0] * srcj[2];
					srcj[3] = srcj[3] - srci[3] * srcj[2];
					srcj[4] = srcj[4] - srci[4] * srcj[2];
					srcj[5] = srcj[5] - srci[5] * srcj[2];
					srcj = src[1];
					dstj = dst[1];
					dstj[0] = dstj[0] - dsti[0] * srcj[2];
					dstj[1] = dstj[1] - dsti[1] * srcj[2];
					srcj[3] = srcj[3] - srci[3] * srcj[2];
					srcj[4] = srcj[4] - srci[4] * srcj[2];
					srcj[5] = srcj[5] - srci[5] * srcj[2];
					srcj = src[3];
					dstj = dst[3];
					dstj[0] = dstj[0] - dsti[0] * srcj[2];
					dstj[1] = dstj[1] - dsti[1] * srcj[2];
					dstj[2] = -diag * srcj[2];
					srcj[3] = srcj[3] - srci[3] * srcj[2];
					srcj[4] = srcj[4] - srci[4] * srcj[2];
					srcj[5] = srcj[5] - srci[5] * srcj[2];
					srcj = src[4];
					dstj = dst[4];
					dstj[0] = dstj[0] - dsti[0] * srcj[2];
					dstj[1] = dstj[1] - dsti[1] * srcj[2];
					dstj[2] = -diag * srcj[2];
					srcj[3] = srcj[3] - srci[3] * srcj[2];
					srcj[4] = srcj[4] - srci[4] * srcj[2];
					srcj[5] = srcj[5] - srci[5] * srcj[2];
					srcj = src[5];
					dstj = dst[5];
					dstj[0] = dstj[0] - dsti[0] * srcj[2];
					dstj[1] = dstj[1] - dsti[1] * srcj[2];
					dstj[2] = -diag * srcj[2];
					srcj[3] = srcj[3] - srci[3] * srcj[2];
					srcj[4] = srcj[4] - srci[4] * srcj[2];
					srcj[5] = srcj[5] - srci[5] * srcj[2];
					srci = src[3];
					dsti = dst[3];
					diag = 1 / srci[3];
					dsti[3] = diag;
					dsti[0] = dsti[0] * diag;
					dsti[1] = dsti[1] * diag;
					dsti[2] = dsti[2] * diag;
					srci[4] = srci[4] * diag;
					srci[5] = srci[5] * diag;
					srcj = src[0];
					dstj = dst[0];
					dstj[0] = dstj[0] - dsti[0] * srcj[3];
					srcj[4] = srcj[4] - srci[4] * srcj[3];
					srcj[5] = srcj[5] - srci[5] * srcj[3];
					srcj = src[1];
					dstj = dst[1];
					dstj[0] = dstj[0] - dsti[0] * srcj[3];
					dstj[1] = dstj[1] - dsti[1] * srcj[3];
					srcj[4] = srcj[4] - srci[4] * srcj[3];
					srcj[5] = srcj[5] - srci[5] * srcj[3];
					srcj = src[2];
					dstj = dst[2];
					dstj[0] = dstj[0] - dsti[0] * srcj[3];
					dstj[1] = dstj[1] - dsti[1] * srcj[3];
					dstj[2] = dstj[2] - dsti[2] * srcj[3];
					srcj[4] = srcj[4] - srci[4] * srcj[3];
					srcj[5] = srcj[5] - srci[5] * srcj[3];
					srcj = src[4];
					dstj = dst[4];
					dstj[0] = dstj[0] - dsti[0] * srcj[3];
					dstj[1] = dstj[1] - dsti[1] * srcj[3];
					dstj[2] = dstj[2] - dsti[2] * srcj[3];
					dstj[3] = -diag * srcj[3];
					srcj[4] = srcj[4] - srci[4] * srcj[3];
					srcj[5] = srcj[5] - srci[5] * srcj[3];
					srcj = src[5];
					dstj = dst[5];
					dstj[0] = dstj[0] - dsti[0] * srcj[3];
					dstj[1] = dstj[1] - dsti[1] * srcj[3];
					dstj[2] = dstj[2] - dsti[2] * srcj[3];
					dstj[3] = -diag * srcj[3];
					srcj[4] = srcj[4] - srci[4] * srcj[3];
					srcj[5] = srcj[5] - srci[5] * srcj[3];
					srci = src[4];
					dsti = dst[4];
					diag = 1 / srci[4];
					dsti[4] = diag;
					dsti[0] = dsti[0] * diag;
					dsti[1] = dsti[1] * diag;
					dsti[2] = dsti[2] * diag;
					dsti[3] = dsti[3] * diag;
					srci[5] = srci[5] * diag;
					srcj = src[0];
					dstj = dst[0];
					dstj[0] = dstj[0] - dsti[0] * srcj[4];
					srcj[5] = srcj[5] - srci[5] * srcj[4];
					srcj = src[1];
					dstj = dst[1];
					dstj[0] = dstj[0] - dsti[0] * srcj[4];
					dstj[1] = dstj[1] - dsti[1] * srcj[4];
					srcj[5] = srcj[5] - srci[5] * srcj[4];
					srcj = src[2];
					dstj = dst[2];
					dstj[0] = dstj[0] - dsti[0] * srcj[4];
					dstj[1] = dstj[1] - dsti[1] * srcj[4];
					dstj[2] = dstj[2] - dsti[2] * srcj[4];
					srcj[5] = srcj[5] - srci[5] * srcj[4];
					srcj = src[3];
					dstj = dst[3];
					dstj[0] = dstj[0] - dsti[0] * srcj[4];
					dstj[1] = dstj[1] - dsti[1] * srcj[4];
					dstj[2] = dstj[2] - dsti[2] * srcj[4];
					dstj[3] = dstj[3] - dsti[3] * srcj[4];
					srcj[5] = srcj[5] - srci[5] * srcj[4];
					srcj = src[5];
					dstj = dst[5];
					dstj[0] = dstj[0] - dsti[0] * srcj[4];
					dstj[1] = dstj[1] - dsti[1] * srcj[4];
					dstj[2] = dstj[2] - dsti[2] * srcj[4];
					dstj[3] = dstj[3] - dsti[3] * srcj[4];
					dstj[4] = -diag * srcj[4];
					srcj[5] = srcj[5] - srci[5] * srcj[4];
					srci = src[5];
					dsti = dst[5];
					diag = 1 / srci[5];
					dsti[5] = diag;
					dsti[0] = dsti[0] * diag;
					dsti[1] = dsti[1] * diag;
					dsti[2] = dsti[2] * diag;
					dsti[3] = dsti[3] * diag;
					dsti[4] = dsti[4] * diag;
					srcj = src[0];
					dstj = dst[0];
					dstj[0] = dstj[0] - dsti[0] * srcj[5];
					srcj = src[1];
					dstj = dst[1];
					dstj[0] = dstj[0] - dsti[0] * srcj[5];
					dstj[1] = dstj[1] - dsti[1] * srcj[5];
					srcj = src[2];
					dstj = dst[2];
					dstj[0] = dstj[0] - dsti[0] * srcj[5];
					dstj[1] = dstj[1] - dsti[1] * srcj[5];
					dstj[2] = dstj[2] - dsti[2] * srcj[5];
					srcj = src[3];
					dstj = dst[3];
					dstj[0] = dstj[0] - dsti[0] * srcj[5];
					dstj[1] = dstj[1] - dsti[1] * srcj[5];
					dstj[2] = dstj[2] - dsti[2] * srcj[5];
					dstj[3] = dstj[3] - dsti[3] * srcj[5];
					srcj = src[4];
					dstj = dst[4];
					dstj[0] = dstj[0] - dsti[0] * srcj[5];
					dstj[1] = dstj[1] - dsti[1] * srcj[5];
					dstj[2] = dstj[2] - dsti[2] * srcj[5];
					dstj[3] = dstj[3] - dsti[3] * srcj[5];
					dstj[4] = dstj[4] - dsti[4] * srcj[5];
					dsti = dst[1];
					dst[0][1] = dsti[0];
					dsti = dst[2];
					dst[0][2] = dsti[0];
					dst[1][2] = dsti[1];
					dsti = dst[3];
					dst[0][3] = dsti[0];
					dst[1][3] = dsti[1];
					dst[2][3] = dsti[2];
					dsti = dst[4];
					dst[0][4] = dsti[0];
					dst[1][4] = dsti[1];
					dst[2][4] = dsti[2];
					dst[3][4] = dsti[3];
					dsti = dst[5];
					dst[0][5] = dsti[0];
					dst[1][5] = dsti[1];
					dst[2][5] = dsti[2];
					dst[3][5] = dsti[3];
					dst[4][5] = dsti[4];
					break;
				default:
					var _g11 = 0;
					var _g4 = size;
					while (_g11 < _g4) {
						var i1 = _g11++;
						srci = src[i1];
						dsti = dst[i1];
						var diag1 = 1 / srci[i1];
						dsti[i1] = diag1;
						var _g31 = 0;
						var _g21 = i1;
						while (_g31 < _g21) {
							var j1 = _g31++;
							dsti[j1] = dsti[j1] * diag1;
						}
						var _g32 = i1 + 1;
						var _g22 = size;
						while (_g32 < _g22) {
							var j2 = _g32++;
							srci[j2] = srci[j2] * diag1;
						}
						var _g33 = 0;
						var _g23 = i1;
						while (_g33 < _g23) {
							var j3 = _g33++;
							srcj = src[j3];
							dstj = dst[j3];
							var _g5 = 0;
							var _g41 = j3 + 1;
							while (_g5 < _g41) {
								var k = _g5++;
								dstj[k] = dstj[k] - dsti[k] * srcj[i1];
							}
							var _g51 = i1 + 1;
							var _g42 = size;
							while (_g51 < _g42) {
								var k1 = _g51++;
								srcj[k1] = srcj[k1] - srci[k1] * srcj[i1];
							}
						}
						var _g34 = i1 + 1;
						var _g24 = size;
						while (_g34 < _g24) {
							var j4 = _g34++;
							srcj = src[j4];
							dstj = dst[j4];
							var _g52 = 0;
							var _g43 = i1;
							while (_g52 < _g43) {
								var k2 = _g52++;
								dstj[k2] = dstj[k2] - dsti[k2] * srcj[i1];
							}
							dstj[i1] = -diag1 * srcj[i1];
							var _g53 = i1 + 1;
							var _g44 = size;
							while (_g53 < _g44) {
								var k3 = _g53++;
								srcj[k3] = srcj[k3] - srci[k3] * srcj[i1];
							}
						}
					}
					var _g12 = 1;
					var _g6 = size;
					while (_g12 < _g6) {
						var i2 = _g12++;
						dsti = dst[i2];
						var _g35 = 0;
						var _g25 = i2;
						while (_g35 < _g25) {
							var j5 = _g35++;
							dst[j5][i2] = dsti[j5];
						}
					}
			}
		}

		proto.computeInvMass = function (info, massData) {
			var invMass = this._invMass;
			var invMassWithoutCfm = this._invMassWithoutCfm;
			var numRows = info.numRows;
			var b1 = info.b1;
			var b2 = info.b2;
			var invM1 = b1._invMass;
			var invM2 = b2._invMass;
			var invI1;
			var invI100;
			var invI101;
			var invI102;
			var invI110;
			var invI111;
			var invI112;
			var invI120;
			var invI121;
			var invI122;
			var invI2;
			var invI200;
			var invI201;
			var invI202;
			var invI210;
			var invI211;
			var invI212;
			var invI220;
			var invI221;
			var invI222;
			invI100 = b1._invInertia[0];
			invI101 = b1._invInertia[1];
			invI102 = b1._invInertia[2];
			invI110 = b1._invInertia[3];
			invI111 = b1._invInertia[4];
			invI112 = b1._invInertia[5];
			invI120 = b1._invInertia[6];
			invI121 = b1._invInertia[7];
			invI122 = b1._invInertia[8];
			invI200 = b2._invInertia[0];
			invI201 = b2._invInertia[1];
			invI202 = b2._invInertia[2];
			invI210 = b2._invInertia[3];
			invI211 = b2._invInertia[4];
			invI212 = b2._invInertia[5];
			invI220 = b2._invInertia[6];
			invI221 = b2._invInertia[7];
			invI222 = b2._invInertia[8];
			var _g1 = 0;
			var _g = numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var j = info.rows[i].jacobian;
				var md = massData[i];
				j.updateSparsity();
				if ((j.flag & 1) != 0) {
					md.invMLin1X = j.lin1X * invM1;
					md.invMLin1Y = j.lin1Y * invM1;
					md.invMLin1Z = j.lin1Z * invM1;
					md.invMLin2X = j.lin2X * invM2;
					md.invMLin2Y = j.lin2Y * invM2;
					md.invMLin2Z = j.lin2Z * invM2;
				} else {
					md.invMLin1X = 0;
					md.invMLin1Y = 0;
					md.invMLin1Z = 0;
					md.invMLin2X = 0;
					md.invMLin2Y = 0;
					md.invMLin2Z = 0;
				}
				if ((j.flag & 2) != 0) {
					var __tmp__X;
					var __tmp__Y;
					var __tmp__Z;
					__tmp__X = invI100 * j.ang1X + invI101 * j.ang1Y + invI102 * j.ang1Z;
					__tmp__Y = invI110 * j.ang1X + invI111 * j.ang1Y + invI112 * j.ang1Z;
					__tmp__Z = invI120 * j.ang1X + invI121 * j.ang1Y + invI122 * j.ang1Z;
					md.invMAng1X = __tmp__X;
					md.invMAng1Y = __tmp__Y;
					md.invMAng1Z = __tmp__Z;
					var __tmp__X1;
					var __tmp__Y1;
					var __tmp__Z1;
					__tmp__X1 = invI200 * j.ang2X + invI201 * j.ang2Y + invI202 * j.ang2Z;
					__tmp__Y1 = invI210 * j.ang2X + invI211 * j.ang2Y + invI212 * j.ang2Z;
					__tmp__Z1 = invI220 * j.ang2X + invI221 * j.ang2Y + invI222 * j.ang2Z;
					md.invMAng2X = __tmp__X1;
					md.invMAng2Y = __tmp__Y1;
					md.invMAng2Z = __tmp__Z1;
				} else {
					md.invMAng1X = 0;
					md.invMAng1Y = 0;
					md.invMAng1Z = 0;
					md.invMAng2X = 0;
					md.invMAng2Y = 0;
					md.invMAng2Z = 0;
				}
			}
			var _g11 = 0;
			var _g2 = numRows;
			while (_g11 < _g2) {
				var i1 = _g11++;
				var j1 = info.rows[i1].jacobian;
				var _g3 = i1;
				var _g21 = numRows;
				while (_g3 < _g21) {
					var j2 = _g3++;
					var j21 = info.rows[j2].jacobian;
					var md2 = massData[j2];
					var val = j1.lin1X * md2.invMLin1X + j1.lin1Y * md2.invMLin1Y + j1.lin1Z * md2.invMLin1Z + (j1.ang1X * md2.invMAng1X + j1.ang1Y * md2.invMAng1Y + j1.ang1Z * md2.invMAng1Z) + (j1.lin2X * md2.invMLin2X + j1.lin2Y * md2.invMLin2Y + j1.lin2Z * md2.invMLin2Z) + (j1.ang2X * md2.invMAng2X + j1.ang2Y * md2.invMAng2Y + j1.ang2Z * md2.invMAng2Z);
					if (i1 == j2) {
						invMass[i1][j2] = val + info.rows[i1].cfm;
						invMassWithoutCfm[i1][j2] = val;
						md2.mass = val + info.rows[i1].cfm;
						md2.massWithoutCfm = val;
						if (md2.mass != 0) {
							md2.mass = 1 / md2.mass;
						}
						if (md2.massWithoutCfm != 0) {
							md2.massWithoutCfm = 1 / md2.massWithoutCfm;
						}
					} else {
						invMass[i1][j2] = val;
						invMass[j2][i1] = val;
						invMassWithoutCfm[i1][j2] = val;
						invMassWithoutCfm[j2][i1] = val;
					}
				}
			}
			var _g12 = 0;
			var _g4 = this._maxSubmatrixId;
			while (_g12 < _g4) {
				var i2 = _g12++;
				this._cacheComputed[i2] = false;
			}
		}

		var MassMatrix = function (size) {
			this._size = size;
			var length = this._size;
			var this1 = new Array(length);
			this.tmpMatrix = this1;
			var length1 = this._size;
			var this2 = new Array(length1);
			this._invMass = this2;
			var length2 = this._size;
			var this3 = new Array(length2);
			this._invMassWithoutCfm = this3;
			var _g1 = 0;
			var _g = this._size;
			while (_g1 < _g) {
				var i = _g1++;
				var this4 = this.tmpMatrix;
				var length3 = this._size;
				var this5 = new Array(length3);
				this4[i] = this5;
				var this6 = this._invMass;
				var length4 = this._size;
				var this7 = new Array(length4);
				this6[i] = this7;
				var this8 = this._invMassWithoutCfm;
				var length5 = this._size;
				var this9 = new Array(length5);
				this8[i] = this9;
				var _g3 = 0;
				var _g2 = this._size;
				while (_g3 < _g2) {
					var j = _g3++;
					this.tmpMatrix[i][j] = 0;
					this._invMass[i][j] = 0;
					this._invMassWithoutCfm[i][j] = 0;
				}
			}
			this._maxSubmatrixId = 1 << this._size;
			var length6 = this._maxSubmatrixId;
			var this10 = new Array(length6);
			this._cacheComputed = this10;
			var length7 = this._maxSubmatrixId;
			var this11 = new Array(length7);
			this._cachedSubmatrices = this11;
			var _g11 = 0;
			var _g4 = this._maxSubmatrixId;
			while (_g11 < _g4) {
				var i1 = _g11++;
				var t = i1;
				t = (t & 85) + (t >> 1 & 85);
				t = (t & 51) + (t >> 2 & 51);
				t = (t & 15) + (t >> 4 & 15);
				var matrixSize = t;
				var this12 = new Array(matrixSize);
				var subMatrix = this12;
				var _g31 = 0;
				var _g21 = matrixSize;
				while (_g31 < _g21) {
					var j1 = _g31++;
					var this13 = new Array(matrixSize);
					subMatrix[j1] = this13;
					var _g5 = 0;
					var _g41 = matrixSize;
					while (_g5 < _g41) {
						var k = _g5++;
						subMatrix[j1][k] = 0;
					}
				}
				this._cacheComputed[i1] = false;
				this._cachedSubmatrices[i1] = subMatrix;
			}
		}
		return MassMatrix;
	});

	dynamics.constraint.solver.pgs.PgsContactConstraintSolver = pe.define(function (proto) {
		proto.preSolveVelocity = function (timeStep) {
			this.constraint._getVelocitySolverInfo(timeStep, this.info);
			this._b1 = this.info.b1;
			this._b2 = this.info.b2;
			var invM1 = this._b1._invMass;
			var invM2 = this._b2._invMass;
			var invI1;
			var invI100;
			var invI101;
			var invI102;
			var invI110;
			var invI111;
			var invI112;
			var invI120;
			var invI121;
			var invI122;
			var invI2;
			var invI200;
			var invI201;
			var invI202;
			var invI210;
			var invI211;
			var invI212;
			var invI220;
			var invI221;
			var invI222;
			invI100 = this._b1._invInertia[0];
			invI101 = this._b1._invInertia[1];
			invI102 = this._b1._invInertia[2];
			invI110 = this._b1._invInertia[3];
			invI111 = this._b1._invInertia[4];
			invI112 = this._b1._invInertia[5];
			invI120 = this._b1._invInertia[6];
			invI121 = this._b1._invInertia[7];
			invI122 = this._b1._invInertia[8];
			invI200 = this._b2._invInertia[0];
			invI201 = this._b2._invInertia[1];
			invI202 = this._b2._invInertia[2];
			invI210 = this._b2._invInertia[3];
			invI211 = this._b2._invInertia[4];
			invI212 = this._b2._invInertia[5];
			invI220 = this._b2._invInertia[6];
			invI221 = this._b2._invInertia[7];
			invI222 = this._b2._invInertia[8];
			var _g1 = 0;
			var _g = this.info.numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var md = this.massData[i];
				var j = row.jacobianN;
				md.invMLinN1X = j.lin1X * invM1;
				md.invMLinN1Y = j.lin1Y * invM1;
				md.invMLinN1Z = j.lin1Z * invM1;
				md.invMLinN2X = j.lin2X * invM2;
				md.invMLinN2Y = j.lin2Y * invM2;
				md.invMLinN2Z = j.lin2Z * invM2;
				var __tmp__X;
				var __tmp__Y;
				var __tmp__Z;
				__tmp__X = invI100 * j.ang1X + invI101 * j.ang1Y + invI102 * j.ang1Z;
				__tmp__Y = invI110 * j.ang1X + invI111 * j.ang1Y + invI112 * j.ang1Z;
				__tmp__Z = invI120 * j.ang1X + invI121 * j.ang1Y + invI122 * j.ang1Z;
				md.invMAngN1X = __tmp__X;
				md.invMAngN1Y = __tmp__Y;
				md.invMAngN1Z = __tmp__Z;
				var __tmp__X1;
				var __tmp__Y1;
				var __tmp__Z1;
				__tmp__X1 = invI200 * j.ang2X + invI201 * j.ang2Y + invI202 * j.ang2Z;
				__tmp__Y1 = invI210 * j.ang2X + invI211 * j.ang2Y + invI212 * j.ang2Z;
				__tmp__Z1 = invI220 * j.ang2X + invI221 * j.ang2Y + invI222 * j.ang2Z;
				md.invMAngN2X = __tmp__X1;
				md.invMAngN2Y = __tmp__Y1;
				md.invMAngN2Z = __tmp__Z1;
				md.massN = invM1 + invM2 + (md.invMAngN1X * j.ang1X + md.invMAngN1Y * j.ang1Y + md.invMAngN1Z * j.ang1Z) + (md.invMAngN2X * j.ang2X + md.invMAngN2Y * j.ang2Y + md.invMAngN2Z * j.ang2Z);
				if (md.massN != 0) {
					md.massN = 1 / md.massN;
				}
				var jt = row.jacobianT;
				var jb = row.jacobianB;
				md.invMLinT1X = jt.lin1X * invM1;
				md.invMLinT1Y = jt.lin1Y * invM1;
				md.invMLinT1Z = jt.lin1Z * invM1;
				md.invMLinT2X = jt.lin2X * invM2;
				md.invMLinT2Y = jt.lin2Y * invM2;
				md.invMLinT2Z = jt.lin2Z * invM2;
				md.invMLinB1X = jb.lin1X * invM1;
				md.invMLinB1Y = jb.lin1Y * invM1;
				md.invMLinB1Z = jb.lin1Z * invM1;
				md.invMLinB2X = jb.lin2X * invM2;
				md.invMLinB2Y = jb.lin2Y * invM2;
				md.invMLinB2Z = jb.lin2Z * invM2;
				var __tmp__X2;
				var __tmp__Y2;
				var __tmp__Z2;
				__tmp__X2 = invI100 * jt.ang1X + invI101 * jt.ang1Y + invI102 * jt.ang1Z;
				__tmp__Y2 = invI110 * jt.ang1X + invI111 * jt.ang1Y + invI112 * jt.ang1Z;
				__tmp__Z2 = invI120 * jt.ang1X + invI121 * jt.ang1Y + invI122 * jt.ang1Z;
				md.invMAngT1X = __tmp__X2;
				md.invMAngT1Y = __tmp__Y2;
				md.invMAngT1Z = __tmp__Z2;
				var __tmp__X3;
				var __tmp__Y3;
				var __tmp__Z3;
				__tmp__X3 = invI200 * jt.ang2X + invI201 * jt.ang2Y + invI202 * jt.ang2Z;
				__tmp__Y3 = invI210 * jt.ang2X + invI211 * jt.ang2Y + invI212 * jt.ang2Z;
				__tmp__Z3 = invI220 * jt.ang2X + invI221 * jt.ang2Y + invI222 * jt.ang2Z;
				md.invMAngT2X = __tmp__X3;
				md.invMAngT2Y = __tmp__Y3;
				md.invMAngT2Z = __tmp__Z3;
				var __tmp__X4;
				var __tmp__Y4;
				var __tmp__Z4;
				__tmp__X4 = invI100 * jb.ang1X + invI101 * jb.ang1Y + invI102 * jb.ang1Z;
				__tmp__Y4 = invI110 * jb.ang1X + invI111 * jb.ang1Y + invI112 * jb.ang1Z;
				__tmp__Z4 = invI120 * jb.ang1X + invI121 * jb.ang1Y + invI122 * jb.ang1Z;
				md.invMAngB1X = __tmp__X4;
				md.invMAngB1Y = __tmp__Y4;
				md.invMAngB1Z = __tmp__Z4;
				var __tmp__X5;
				var __tmp__Y5;
				var __tmp__Z5;
				__tmp__X5 = invI200 * jb.ang2X + invI201 * jb.ang2Y + invI202 * jb.ang2Z;
				__tmp__Y5 = invI210 * jb.ang2X + invI211 * jb.ang2Y + invI212 * jb.ang2Z;
				__tmp__Z5 = invI220 * jb.ang2X + invI221 * jb.ang2Y + invI222 * jb.ang2Z;
				md.invMAngB2X = __tmp__X5;
				md.invMAngB2Y = __tmp__Y5;
				md.invMAngB2Z = __tmp__Z5;
				var invMassTB00 = invM1 + invM2 + (md.invMAngT1X * jt.ang1X + md.invMAngT1Y * jt.ang1Y + md.invMAngT1Z * jt.ang1Z) + (md.invMAngT2X * jt.ang2X + md.invMAngT2Y * jt.ang2Y + md.invMAngT2Z * jt.ang2Z);
				var invMassTB01 = md.invMAngT1X * jb.ang1X + md.invMAngT1Y * jb.ang1Y + md.invMAngT1Z * jb.ang1Z + (md.invMAngT2X * jb.ang2X + md.invMAngT2Y * jb.ang2Y + md.invMAngT2Z * jb.ang2Z);
				var invMassTB10 = invMassTB01;
				var invMassTB11 = invM1 + invM2 + (md.invMAngB1X * jb.ang1X + md.invMAngB1Y * jb.ang1Y + md.invMAngB1Z * jb.ang1Z) + (md.invMAngB2X * jb.ang2X + md.invMAngB2Y * jb.ang2Y + md.invMAngB2Z * jb.ang2Z);
				var invDet = invMassTB00 * invMassTB11 - invMassTB01 * invMassTB10;
				if (invDet != 0) {
					invDet = 1 / invDet;
				}
				md.massTB00 = invMassTB11 * invDet;
				md.massTB01 = -invMassTB01 * invDet;
				md.massTB10 = -invMassTB10 * invDet;
				md.massTB11 = invMassTB00 * invDet;
			}
		}

		proto.warmStart = function (timeStep) {
			var lv1;
			var lv1X;
			var lv1Y;
			var lv1Z;
			var lv2;
			var lv2X;
			var lv2Y;
			var lv2Z;
			var av1;
			var av1X;
			var av1Y;
			var av1Z;
			var av2;
			var av2X;
			var av2Y;
			var av2Z;
			lv1X = this._b1._vel[0];
			lv1Y = this._b1._vel[1];
			lv1Z = this._b1._vel[2];
			lv2X = this._b2._vel[0];
			lv2Y = this._b2._vel[1];
			lv2Z = this._b2._vel[2];
			av1X = this._b1._angVel[0];
			av1Y = this._b1._angVel[1];
			av1Z = this._b1._angVel[2];
			av2X = this._b2._angVel[0];
			av2Y = this._b2._angVel[1];
			av2Z = this._b2._angVel[2];
			var _g1 = 0;
			var _g = this.info.numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var imp = row.impulse;
				var md = this.massData[i];
				var jt = row.jacobianT;
				var jb = row.jacobianB;
				var impulseN = imp.impulseN;
				var impulseT = imp.impulseLX * jt.lin1X + imp.impulseLY * jt.lin1Y + imp.impulseLZ * jt.lin1Z;
				var impulseB = imp.impulseLX * jb.lin1X + imp.impulseLY * jb.lin1Y + imp.impulseLZ * jb.lin1Z;
				imp.impulseT = impulseT;
				imp.impulseB = impulseB;
				imp.impulseN *= timeStep.dtRatio;
				imp.impulseT *= timeStep.dtRatio;
				imp.impulseB *= timeStep.dtRatio;
				lv1X += md.invMLinN1X * impulseN;
				lv1Y += md.invMLinN1Y * impulseN;
				lv1Z += md.invMLinN1Z * impulseN;
				lv1X += md.invMLinT1X * impulseT;
				lv1Y += md.invMLinT1Y * impulseT;
				lv1Z += md.invMLinT1Z * impulseT;
				lv1X += md.invMLinB1X * impulseB;
				lv1Y += md.invMLinB1Y * impulseB;
				lv1Z += md.invMLinB1Z * impulseB;
				lv2X += md.invMLinN2X * -impulseN;
				lv2Y += md.invMLinN2Y * -impulseN;
				lv2Z += md.invMLinN2Z * -impulseN;
				lv2X += md.invMLinT2X * -impulseT;
				lv2Y += md.invMLinT2Y * -impulseT;
				lv2Z += md.invMLinT2Z * -impulseT;
				lv2X += md.invMLinB2X * -impulseB;
				lv2Y += md.invMLinB2Y * -impulseB;
				lv2Z += md.invMLinB2Z * -impulseB;
				av1X += md.invMAngN1X * impulseN;
				av1Y += md.invMAngN1Y * impulseN;
				av1Z += md.invMAngN1Z * impulseN;
				av1X += md.invMAngT1X * impulseT;
				av1Y += md.invMAngT1Y * impulseT;
				av1Z += md.invMAngT1Z * impulseT;
				av1X += md.invMAngB1X * impulseB;
				av1Y += md.invMAngB1Y * impulseB;
				av1Z += md.invMAngB1Z * impulseB;
				av2X += md.invMAngN2X * -impulseN;
				av2Y += md.invMAngN2Y * -impulseN;
				av2Z += md.invMAngN2Z * -impulseN;
				av2X += md.invMAngT2X * -impulseT;
				av2Y += md.invMAngT2Y * -impulseT;
				av2Z += md.invMAngT2Z * -impulseT;
				av2X += md.invMAngB2X * -impulseB;
				av2Y += md.invMAngB2Y * -impulseB;
				av2Z += md.invMAngB2Z * -impulseB;
			}
			this._b1._vel[0] = lv1X;
			this._b1._vel[1] = lv1Y;
			this._b1._vel[2] = lv1Z;
			this._b2._vel[0] = lv2X;
			this._b2._vel[1] = lv2Y;
			this._b2._vel[2] = lv2Z;
			this._b1._angVel[0] = av1X;
			this._b1._angVel[1] = av1Y;
			this._b1._angVel[2] = av1Z;
			this._b2._angVel[0] = av2X;
			this._b2._angVel[1] = av2Y;
			this._b2._angVel[2] = av2Z;
		}

		proto.solveVelocity = function () {
			var lv1;
			var lv1X;
			var lv1Y;
			var lv1Z;
			var lv2;
			var lv2X;
			var lv2Y;
			var lv2Z;
			var av1;
			var av1X;
			var av1Y;
			var av1Z;
			var av2;
			var av2X;
			var av2Y;
			var av2Z;
			lv1X = this._b1._vel[0];
			lv1Y = this._b1._vel[1];
			lv1Z = this._b1._vel[2];
			lv2X = this._b2._vel[0];
			lv2Y = this._b2._vel[1];
			lv2Z = this._b2._vel[2];
			av1X = this._b1._angVel[0];
			av1Y = this._b1._angVel[1];
			av1Z = this._b1._angVel[2];
			av2X = this._b2._angVel[0];
			av2Y = this._b2._angVel[1];
			av2Z = this._b2._angVel[2];
			var _g1 = 0;
			var _g = this.info.numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var md = this.massData[i];
				var imp = row.impulse;
				var rvt = 0;
				var j = row.jacobianT;
				rvt += lv1X * j.lin1X + lv1Y * j.lin1Y + lv1Z * j.lin1Z;
				rvt -= lv2X * j.lin2X + lv2Y * j.lin2Y + lv2Z * j.lin2Z;
				rvt += av1X * j.ang1X + av1Y * j.ang1Y + av1Z * j.ang1Z;
				rvt -= av2X * j.ang2X + av2Y * j.ang2Y + av2Z * j.ang2Z;
				var rvb = 0;
				j = row.jacobianB;
				rvb += lv1X * j.lin1X + lv1Y * j.lin1Y + lv1Z * j.lin1Z;
				rvb -= lv2X * j.lin2X + lv2Y * j.lin2Y + lv2Z * j.lin2Z;
				rvb += av1X * j.ang1X + av1Y * j.ang1Y + av1Z * j.ang1Z;
				rvb -= av2X * j.ang2X + av2Y * j.ang2Y + av2Z * j.ang2Z;
				var impulseT = -(rvt * md.massTB00 + rvb * md.massTB01);
				var impulseB = -(rvt * md.massTB10 + rvb * md.massTB11);
				var oldImpulseT = imp.impulseT;
				var oldImpulseB = imp.impulseB;
				imp.impulseT += impulseT;
				imp.impulseB += impulseB;
				var maxImpulse = row.friction * imp.impulseN;
				if (maxImpulse == 0) {
					imp.impulseT = 0;
					imp.impulseB = 0;
				} else {
					var impulseLengthSq = imp.impulseT * imp.impulseT + imp.impulseB * imp.impulseB;
					if (impulseLengthSq > maxImpulse * maxImpulse) {
						var invL = maxImpulse / Math.sqrt(impulseLengthSq);
						imp.impulseT *= invL;
						imp.impulseB *= invL;
					}
				}
				impulseT = imp.impulseT - oldImpulseT;
				impulseB = imp.impulseB - oldImpulseB;
				lv1X += md.invMLinT1X * impulseT;
				lv1Y += md.invMLinT1Y * impulseT;
				lv1Z += md.invMLinT1Z * impulseT;
				lv1X += md.invMLinB1X * impulseB;
				lv1Y += md.invMLinB1Y * impulseB;
				lv1Z += md.invMLinB1Z * impulseB;
				lv2X += md.invMLinT2X * -impulseT;
				lv2Y += md.invMLinT2Y * -impulseT;
				lv2Z += md.invMLinT2Z * -impulseT;
				lv2X += md.invMLinB2X * -impulseB;
				lv2Y += md.invMLinB2Y * -impulseB;
				lv2Z += md.invMLinB2Z * -impulseB;
				av1X += md.invMAngT1X * impulseT;
				av1Y += md.invMAngT1Y * impulseT;
				av1Z += md.invMAngT1Z * impulseT;
				av1X += md.invMAngB1X * impulseB;
				av1Y += md.invMAngB1Y * impulseB;
				av1Z += md.invMAngB1Z * impulseB;
				av2X += md.invMAngT2X * -impulseT;
				av2Y += md.invMAngT2Y * -impulseT;
				av2Z += md.invMAngT2Z * -impulseT;
				av2X += md.invMAngB2X * -impulseB;
				av2Y += md.invMAngB2Y * -impulseB;
				av2Z += md.invMAngB2Z * -impulseB;
			}
			var _g11 = 0;
			var _g2 = this.info.numRows;
			while (_g11 < _g2) {
				var i1 = _g11++;
				var row1 = this.info.rows[i1];
				var md1 = this.massData[i1];
				var imp1 = row1.impulse;
				var rvn = 0;
				var j1 = row1.jacobianN;
				rvn += lv1X * j1.lin1X + lv1Y * j1.lin1Y + lv1Z * j1.lin1Z;
				rvn -= lv2X * j1.lin2X + lv2Y * j1.lin2Y + lv2Z * j1.lin2Z;
				rvn += av1X * j1.ang1X + av1Y * j1.ang1Y + av1Z * j1.ang1Z;
				rvn -= av2X * j1.ang2X + av2Y * j1.ang2Y + av2Z * j1.ang2Z;
				var impulseN = (row1.rhs - rvn) * md1.massN;
				var oldImpulseN = imp1.impulseN;
				imp1.impulseN += impulseN;
				if (imp1.impulseN < 0) {
					imp1.impulseN = 0;
				}
				impulseN = imp1.impulseN - oldImpulseN;
				lv1X += md1.invMLinN1X * impulseN;
				lv1Y += md1.invMLinN1Y * impulseN;
				lv1Z += md1.invMLinN1Z * impulseN;
				lv2X += md1.invMLinN2X * -impulseN;
				lv2Y += md1.invMLinN2Y * -impulseN;
				lv2Z += md1.invMLinN2Z * -impulseN;
				av1X += md1.invMAngN1X * impulseN;
				av1Y += md1.invMAngN1Y * impulseN;
				av1Z += md1.invMAngN1Z * impulseN;
				av2X += md1.invMAngN2X * -impulseN;
				av2Y += md1.invMAngN2Y * -impulseN;
				av2Z += md1.invMAngN2Z * -impulseN;
			}
			this._b1._vel[0] = lv1X;
			this._b1._vel[1] = lv1Y;
			this._b1._vel[2] = lv1Z;
			this._b2._vel[0] = lv2X;
			this._b2._vel[1] = lv2Y;
			this._b2._vel[2] = lv2Z;
			this._b1._angVel[0] = av1X;
			this._b1._angVel[1] = av1Y;
			this._b1._angVel[2] = av1Z;
			this._b2._angVel[0] = av2X;
			this._b2._angVel[1] = av2Y;
			this._b2._angVel[2] = av2Z;
		}

		proto.preSolvePosition = function (timeStep) {
			this.constraint._syncManifold();
			this.constraint._getPositionSolverInfo(this.info);
			var invM1 = this._b1._invMass;
			var invM2 = this._b2._invMass;
			var invI1;
			var invI100;
			var invI101;
			var invI102;
			var invI110;
			var invI111;
			var invI112;
			var invI120;
			var invI121;
			var invI122;
			var invI2;
			var invI200;
			var invI201;
			var invI202;
			var invI210;
			var invI211;
			var invI212;
			var invI220;
			var invI221;
			var invI222;
			invI100 = this._b1._invInertia[0];
			invI101 = this._b1._invInertia[1];
			invI102 = this._b1._invInertia[2];
			invI110 = this._b1._invInertia[3];
			invI111 = this._b1._invInertia[4];
			invI112 = this._b1._invInertia[5];
			invI120 = this._b1._invInertia[6];
			invI121 = this._b1._invInertia[7];
			invI122 = this._b1._invInertia[8];
			invI200 = this._b2._invInertia[0];
			invI201 = this._b2._invInertia[1];
			invI202 = this._b2._invInertia[2];
			invI210 = this._b2._invInertia[3];
			invI211 = this._b2._invInertia[4];
			invI212 = this._b2._invInertia[5];
			invI220 = this._b2._invInertia[6];
			invI221 = this._b2._invInertia[7];
			invI222 = this._b2._invInertia[8];
			var _g1 = 0;
			var _g = this.info.numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var md = this.massData[i];
				var j = row.jacobianN;
				md.invMLinN1X = j.lin1X * invM1;
				md.invMLinN1Y = j.lin1Y * invM1;
				md.invMLinN1Z = j.lin1Z * invM1;
				md.invMLinN2X = j.lin2X * invM2;
				md.invMLinN2Y = j.lin2Y * invM2;
				md.invMLinN2Z = j.lin2Z * invM2;
				var __tmp__X;
				var __tmp__Y;
				var __tmp__Z;
				__tmp__X = invI100 * j.ang1X + invI101 * j.ang1Y + invI102 * j.ang1Z;
				__tmp__Y = invI110 * j.ang1X + invI111 * j.ang1Y + invI112 * j.ang1Z;
				__tmp__Z = invI120 * j.ang1X + invI121 * j.ang1Y + invI122 * j.ang1Z;
				md.invMAngN1X = __tmp__X;
				md.invMAngN1Y = __tmp__Y;
				md.invMAngN1Z = __tmp__Z;
				var __tmp__X1;
				var __tmp__Y1;
				var __tmp__Z1;
				__tmp__X1 = invI200 * j.ang2X + invI201 * j.ang2Y + invI202 * j.ang2Z;
				__tmp__Y1 = invI210 * j.ang2X + invI211 * j.ang2Y + invI212 * j.ang2Z;
				__tmp__Z1 = invI220 * j.ang2X + invI221 * j.ang2Y + invI222 * j.ang2Z;
				md.invMAngN2X = __tmp__X1;
				md.invMAngN2Y = __tmp__Y1;
				md.invMAngN2Z = __tmp__Z1;
				md.massN = invM1 + invM2 + (md.invMAngN1X * j.ang1X + md.invMAngN1Y * j.ang1Y + md.invMAngN1Z * j.ang1Z) + (md.invMAngN2X * j.ang2X + md.invMAngN2Y * j.ang2Y + md.invMAngN2Z * j.ang2Z);
				if (md.massN != 0) {
					md.massN = 1 / md.massN;
				}
			}
			var _g11 = 0;
			var _g2 = this.info.numRows;
			while (_g11 < _g2) {
				var i1 = _g11++;
				this.info.rows[i1].impulse.impulseP = 0;
			}
		}

		proto.solvePositionSplitImpulse = function () {
			var lv1;
			var lv1X;
			var lv1Y;
			var lv1Z;
			var lv2;
			var lv2X;
			var lv2Y;
			var lv2Z;
			var av1;
			var av1X;
			var av1Y;
			var av1Z;
			var av2;
			var av2X;
			var av2Y;
			var av2Z;
			lv1X = this._b1._pseudoVel[0];
			lv1Y = this._b1._pseudoVel[1];
			lv1Z = this._b1._pseudoVel[2];
			lv2X = this._b2._pseudoVel[0];
			lv2Y = this._b2._pseudoVel[1];
			lv2Z = this._b2._pseudoVel[2];
			av1X = this._b1._angPseudoVel[0];
			av1Y = this._b1._angPseudoVel[1];
			av1Z = this._b1._angPseudoVel[2];
			av2X = this._b2._angPseudoVel[0];
			av2Y = this._b2._angPseudoVel[1];
			av2Z = this._b2._angPseudoVel[2];
			var _g1 = 0;
			var _g = this.info.numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var md = this.massData[i];
				var imp = row.impulse;
				var j = row.jacobianN;
				var rvn = 0;
				rvn += lv1X * j.lin1X + lv1Y * j.lin1Y + lv1Z * j.lin1Z;
				rvn -= lv2X * j.lin2X + lv2Y * j.lin2Y + lv2Z * j.lin2Z;
				rvn += av1X * j.ang1X + av1Y * j.ang1Y + av1Z * j.ang1Z;
				rvn -= av2X * j.ang2X + av2Y * j.ang2Y + av2Z * j.ang2Z;
				var impulseP = (row.rhs - rvn) * md.massN * pe.common.Setting.positionSplitImpulseBaumgarte;
				var oldImpulseP = imp.impulseP;
				imp.impulseP += impulseP;
				if (imp.impulseP < 0) {
					imp.impulseP = 0;
				}
				impulseP = imp.impulseP - oldImpulseP;
				lv1X += md.invMLinN1X * impulseP;
				lv1Y += md.invMLinN1Y * impulseP;
				lv1Z += md.invMLinN1Z * impulseP;
				lv2X += md.invMLinN2X * -impulseP;
				lv2Y += md.invMLinN2Y * -impulseP;
				lv2Z += md.invMLinN2Z * -impulseP;
				av1X += md.invMAngN1X * impulseP;
				av1Y += md.invMAngN1Y * impulseP;
				av1Z += md.invMAngN1Z * impulseP;
				av2X += md.invMAngN2X * -impulseP;
				av2Y += md.invMAngN2Y * -impulseP;
				av2Z += md.invMAngN2Z * -impulseP;
			}
			this._b1._pseudoVel[0] = lv1X;
			this._b1._pseudoVel[1] = lv1Y;
			this._b1._pseudoVel[2] = lv1Z;
			this._b2._pseudoVel[0] = lv2X;
			this._b2._pseudoVel[1] = lv2Y;
			this._b2._pseudoVel[2] = lv2Z;
			this._b1._angPseudoVel[0] = av1X;
			this._b1._angPseudoVel[1] = av1Y;
			this._b1._angPseudoVel[2] = av1Z;
			this._b2._angPseudoVel[0] = av2X;
			this._b2._angPseudoVel[1] = av2Y;
			this._b2._angPseudoVel[2] = av2Z;
		}

		proto.solvePositionNgs = function (timeStep) {
			this.constraint._syncManifold();
			this.constraint._getPositionSolverInfo(this.info);
			var invM1 = this._b1._invMass;
			var invM2 = this._b2._invMass;
			var invI1;
			var invI100;
			var invI101;
			var invI102;
			var invI110;
			var invI111;
			var invI112;
			var invI120;
			var invI121;
			var invI122;
			var invI2;
			var invI200;
			var invI201;
			var invI202;
			var invI210;
			var invI211;
			var invI212;
			var invI220;
			var invI221;
			var invI222;
			invI100 = this._b1._invInertia[0];
			invI101 = this._b1._invInertia[1];
			invI102 = this._b1._invInertia[2];
			invI110 = this._b1._invInertia[3];
			invI111 = this._b1._invInertia[4];
			invI112 = this._b1._invInertia[5];
			invI120 = this._b1._invInertia[6];
			invI121 = this._b1._invInertia[7];
			invI122 = this._b1._invInertia[8];
			invI200 = this._b2._invInertia[0];
			invI201 = this._b2._invInertia[1];
			invI202 = this._b2._invInertia[2];
			invI210 = this._b2._invInertia[3];
			invI211 = this._b2._invInertia[4];
			invI212 = this._b2._invInertia[5];
			invI220 = this._b2._invInertia[6];
			invI221 = this._b2._invInertia[7];
			invI222 = this._b2._invInertia[8];
			var _g1 = 0;
			var _g = this.info.numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var md = this.massData[i];
				var j = row.jacobianN;
				md.invMLinN1X = j.lin1X * invM1;
				md.invMLinN1Y = j.lin1Y * invM1;
				md.invMLinN1Z = j.lin1Z * invM1;
				md.invMLinN2X = j.lin2X * invM2;
				md.invMLinN2Y = j.lin2Y * invM2;
				md.invMLinN2Z = j.lin2Z * invM2;
				var __tmp__X;
				var __tmp__Y;
				var __tmp__Z;
				__tmp__X = invI100 * j.ang1X + invI101 * j.ang1Y + invI102 * j.ang1Z;
				__tmp__Y = invI110 * j.ang1X + invI111 * j.ang1Y + invI112 * j.ang1Z;
				__tmp__Z = invI120 * j.ang1X + invI121 * j.ang1Y + invI122 * j.ang1Z;
				md.invMAngN1X = __tmp__X;
				md.invMAngN1Y = __tmp__Y;
				md.invMAngN1Z = __tmp__Z;
				var __tmp__X1;
				var __tmp__Y1;
				var __tmp__Z1;
				__tmp__X1 = invI200 * j.ang2X + invI201 * j.ang2Y + invI202 * j.ang2Z;
				__tmp__Y1 = invI210 * j.ang2X + invI211 * j.ang2Y + invI212 * j.ang2Z;
				__tmp__Z1 = invI220 * j.ang2X + invI221 * j.ang2Y + invI222 * j.ang2Z;
				md.invMAngN2X = __tmp__X1;
				md.invMAngN2Y = __tmp__Y1;
				md.invMAngN2Z = __tmp__Z1;
				md.massN = invM1 + invM2 + (md.invMAngN1X * j.ang1X + md.invMAngN1Y * j.ang1Y + md.invMAngN1Z * j.ang1Z) + (md.invMAngN2X * j.ang2X + md.invMAngN2Y * j.ang2Y + md.invMAngN2Z * j.ang2Z);
				if (md.massN != 0) {
					md.massN = 1 / md.massN;
				}
			}
			var lv1;
			var lv1X;
			var lv1Y;
			var lv1Z;
			var lv2;
			var lv2X;
			var lv2Y;
			var lv2Z;
			var av1;
			var av1X;
			var av1Y;
			var av1Z;
			var av2;
			var av2X;
			var av2Y;
			var av2Z;
			lv1X = 0;
			lv1Y = 0;
			lv1Z = 0;
			lv2X = 0;
			lv2Y = 0;
			lv2Z = 0;
			av1X = 0;
			av1Y = 0;
			av1Z = 0;
			av2X = 0;
			av2Y = 0;
			av2Z = 0;
			var _g11 = 0;
			var _g2 = this.info.numRows;
			while (_g11 < _g2) {
				var i1 = _g11++;
				var row1 = this.info.rows[i1];
				var md1 = this.massData[i1];
				var imp = row1.impulse;
				var j1 = row1.jacobianN;
				var rvn = 0;
				rvn += lv1X * j1.lin1X + lv1Y * j1.lin1Y + lv1Z * j1.lin1Z;
				rvn -= lv2X * j1.lin2X + lv2Y * j1.lin2Y + lv2Z * j1.lin2Z;
				rvn += av1X * j1.ang1X + av1Y * j1.ang1Y + av1Z * j1.ang1Z;
				rvn -= av2X * j1.ang2X + av2Y * j1.ang2Y + av2Z * j1.ang2Z;
				var impulseP = (row1.rhs - rvn) * md1.massN * pe.common.Setting.positionNgsBaumgarte;
				var oldImpulseP = imp.impulseP;
				imp.impulseP += impulseP;
				if (imp.impulseP < 0) {
					imp.impulseP = 0;
				}
				impulseP = imp.impulseP - oldImpulseP;
				lv1X += md1.invMLinN1X * impulseP;
				lv1Y += md1.invMLinN1Y * impulseP;
				lv1Z += md1.invMLinN1Z * impulseP;
				lv2X += md1.invMLinN2X * -impulseP;
				lv2Y += md1.invMLinN2Y * -impulseP;
				lv2Z += md1.invMLinN2Z * -impulseP;
				av1X += md1.invMAngN1X * impulseP;
				av1Y += md1.invMAngN1Y * impulseP;
				av1Z += md1.invMAngN1Z * impulseP;
				av2X += md1.invMAngN2X * -impulseP;
				av2Y += md1.invMAngN2Y * -impulseP;
				av2Z += md1.invMAngN2Z * -impulseP;
			}
			var _this = this._b1;
			_this._transform._position[0] += lv1X;
			_this._transform._position[1] += lv1Y;
			_this._transform._position[2] += lv1Z;
			var _this1 = this._b2;
			_this1._transform._position[0] += lv2X;
			_this1._transform._position[1] += lv2Y;
			_this1._transform._position[2] += lv2Z;
			var _this2 = this._b1;
			var theta = Math.sqrt(av1X * av1X + av1Y * av1Y + av1Z * av1Z);
			var halfTheta = theta * 0.5;
			var rotationToSinAxisFactor;
			var cosHalfTheta;
			if (halfTheta < 0.5) {
				var ht2 = halfTheta * halfTheta;
				rotationToSinAxisFactor = 0.5 * (1 - ht2 * 0.16666666666666666 + ht2 * ht2 * 0.0083333333333333332);
				cosHalfTheta = 1 - ht2 * 0.5 + ht2 * ht2 * 0.041666666666666664;
			} else {
				rotationToSinAxisFactor = Math.sin(halfTheta) / theta;
				cosHalfTheta = Math.cos(halfTheta);
			}
			var sinAxis;
			var sinAxisX;
			var sinAxisY;
			var sinAxisZ;
			sinAxisX = av1X * rotationToSinAxisFactor;
			sinAxisY = av1Y * rotationToSinAxisFactor;
			sinAxisZ = av1Z * rotationToSinAxisFactor;
			var dq;
			var dqX;
			var dqY;
			var dqZ;
			var dqW;
			dqX = sinAxisX;
			dqY = sinAxisY;
			dqZ = sinAxisZ;
			dqW = cosHalfTheta;
			var q;
			var qX;
			var qY;
			var qZ;
			var qW;
			var e00 = _this2._transform._rotation[0];
			var e11 = _this2._transform._rotation[4];
			var e22 = _this2._transform._rotation[8];
			var t = e00 + e11 + e22;
			var s;
			if (t > 0) {
				s = Math.sqrt(t + 1);
				qW = 0.5 * s;
				s = 0.5 / s;
				qX = (_this2._transform._rotation[7] - _this2._transform._rotation[5]) * s;
				qY = (_this2._transform._rotation[2] - _this2._transform._rotation[6]) * s;
				qZ = (_this2._transform._rotation[3] - _this2._transform._rotation[1]) * s;
			} else if (e00 > e11) {
				if (e00 > e22) {
					s = Math.sqrt(e00 - e11 - e22 + 1);
					qX = 0.5 * s;
					s = 0.5 / s;
					qY = (_this2._transform._rotation[1] + _this2._transform._rotation[3]) * s;
					qZ = (_this2._transform._rotation[2] + _this2._transform._rotation[6]) * s;
					qW = (_this2._transform._rotation[7] - _this2._transform._rotation[5]) * s;
				} else {
					s = Math.sqrt(e22 - e00 - e11 + 1);
					qZ = 0.5 * s;
					s = 0.5 / s;
					qX = (_this2._transform._rotation[2] + _this2._transform._rotation[6]) * s;
					qY = (_this2._transform._rotation[5] + _this2._transform._rotation[7]) * s;
					qW = (_this2._transform._rotation[3] - _this2._transform._rotation[1]) * s;
				}
			} else if (e11 > e22) {
				s = Math.sqrt(e11 - e22 - e00 + 1);
				qY = 0.5 * s;
				s = 0.5 / s;
				qX = (_this2._transform._rotation[1] + _this2._transform._rotation[3]) * s;
				qZ = (_this2._transform._rotation[5] + _this2._transform._rotation[7]) * s;
				qW = (_this2._transform._rotation[2] - _this2._transform._rotation[6]) * s;
			} else {
				s = Math.sqrt(e22 - e00 - e11 + 1);
				qZ = 0.5 * s;
				s = 0.5 / s;
				qX = (_this2._transform._rotation[2] + _this2._transform._rotation[6]) * s;
				qY = (_this2._transform._rotation[5] + _this2._transform._rotation[7]) * s;
				qW = (_this2._transform._rotation[3] - _this2._transform._rotation[1]) * s;
			}
			qX = dqW * qX + dqX * qW + dqY * qZ - dqZ * qY;
			qY = dqW * qY - dqX * qZ + dqY * qW + dqZ * qX;
			qZ = dqW * qZ + dqX * qY - dqY * qX + dqZ * qW;
			qW = dqW * qW - dqX * qX - dqY * qY - dqZ * qZ;
			var l = qX * qX + qY * qY + qZ * qZ + qW * qW;
			if (l > 1e-32) {
				l = 1 / Math.sqrt(l);
			}
			qX *= l;
			qY *= l;
			qZ *= l;
			qW *= l;
			var x = qX;
			var y = qY;
			var z = qZ;
			var w = qW;
			var x2 = 2 * x;
			var y2 = 2 * y;
			var z2 = 2 * z;
			var xx = x * x2;
			var yy = y * y2;
			var zz = z * z2;
			var xy = x * y2;
			var yz = y * z2;
			var xz = x * z2;
			var wx = w * x2;
			var wy = w * y2;
			var wz = w * z2;
			_this2._transform._rotation[0] = 1 - yy - zz;
			_this2._transform._rotation[1] = xy - wz;
			_this2._transform._rotation[2] = xz + wy;
			_this2._transform._rotation[3] = xy + wz;
			_this2._transform._rotation[4] = 1 - xx - zz;
			_this2._transform._rotation[5] = yz - wx;
			_this2._transform._rotation[6] = xz - wy;
			_this2._transform._rotation[7] = yz + wx;
			_this2._transform._rotation[8] = 1 - xx - yy;
			var __tmp__00;
			var __tmp__01;
			var __tmp__02;
			var __tmp__10;
			var __tmp__11;
			var __tmp__12;
			var __tmp__20;
			var __tmp__21;
			var __tmp__22;
			__tmp__00 = _this2._transform._rotation[0] * _this2._invLocalInertia[0] + _this2._transform._rotation[1] * _this2._invLocalInertia[3] + _this2._transform._rotation[2] * _this2._invLocalInertia[6];
			__tmp__01 = _this2._transform._rotation[0] * _this2._invLocalInertia[1] + _this2._transform._rotation[1] * _this2._invLocalInertia[4] + _this2._transform._rotation[2] * _this2._invLocalInertia[7];
			__tmp__02 = _this2._transform._rotation[0] * _this2._invLocalInertia[2] + _this2._transform._rotation[1] * _this2._invLocalInertia[5] + _this2._transform._rotation[2] * _this2._invLocalInertia[8];
			__tmp__10 = _this2._transform._rotation[3] * _this2._invLocalInertia[0] + _this2._transform._rotation[4] * _this2._invLocalInertia[3] + _this2._transform._rotation[5] * _this2._invLocalInertia[6];
			__tmp__11 = _this2._transform._rotation[3] * _this2._invLocalInertia[1] + _this2._transform._rotation[4] * _this2._invLocalInertia[4] + _this2._transform._rotation[5] * _this2._invLocalInertia[7];
			__tmp__12 = _this2._transform._rotation[3] * _this2._invLocalInertia[2] + _this2._transform._rotation[4] * _this2._invLocalInertia[5] + _this2._transform._rotation[5] * _this2._invLocalInertia[8];
			__tmp__20 = _this2._transform._rotation[6] * _this2._invLocalInertia[0] + _this2._transform._rotation[7] * _this2._invLocalInertia[3] + _this2._transform._rotation[8] * _this2._invLocalInertia[6];
			__tmp__21 = _this2._transform._rotation[6] * _this2._invLocalInertia[1] + _this2._transform._rotation[7] * _this2._invLocalInertia[4] + _this2._transform._rotation[8] * _this2._invLocalInertia[7];
			__tmp__22 = _this2._transform._rotation[6] * _this2._invLocalInertia[2] + _this2._transform._rotation[7] * _this2._invLocalInertia[5] + _this2._transform._rotation[8] * _this2._invLocalInertia[8];
			_this2._invInertia[0] = __tmp__00;
			_this2._invInertia[1] = __tmp__01;
			_this2._invInertia[2] = __tmp__02;
			_this2._invInertia[3] = __tmp__10;
			_this2._invInertia[4] = __tmp__11;
			_this2._invInertia[5] = __tmp__12;
			_this2._invInertia[6] = __tmp__20;
			_this2._invInertia[7] = __tmp__21;
			_this2._invInertia[8] = __tmp__22;
			var __tmp__001;
			var __tmp__011;
			var __tmp__021;
			var __tmp__101;
			var __tmp__111;
			var __tmp__121;
			var __tmp__201;
			var __tmp__211;
			var __tmp__221;
			__tmp__001 = _this2._invInertia[0] * _this2._transform._rotation[0] + _this2._invInertia[1] * _this2._transform._rotation[1] + _this2._invInertia[2] * _this2._transform._rotation[2];
			__tmp__011 = _this2._invInertia[0] * _this2._transform._rotation[3] + _this2._invInertia[1] * _this2._transform._rotation[4] + _this2._invInertia[2] * _this2._transform._rotation[5];
			__tmp__021 = _this2._invInertia[0] * _this2._transform._rotation[6] + _this2._invInertia[1] * _this2._transform._rotation[7] + _this2._invInertia[2] * _this2._transform._rotation[8];
			__tmp__101 = _this2._invInertia[3] * _this2._transform._rotation[0] + _this2._invInertia[4] * _this2._transform._rotation[1] + _this2._invInertia[5] * _this2._transform._rotation[2];
			__tmp__111 = _this2._invInertia[3] * _this2._transform._rotation[3] + _this2._invInertia[4] * _this2._transform._rotation[4] + _this2._invInertia[5] * _this2._transform._rotation[5];
			__tmp__121 = _this2._invInertia[3] * _this2._transform._rotation[6] + _this2._invInertia[4] * _this2._transform._rotation[7] + _this2._invInertia[5] * _this2._transform._rotation[8];
			__tmp__201 = _this2._invInertia[6] * _this2._transform._rotation[0] + _this2._invInertia[7] * _this2._transform._rotation[1] + _this2._invInertia[8] * _this2._transform._rotation[2];
			__tmp__211 = _this2._invInertia[6] * _this2._transform._rotation[3] + _this2._invInertia[7] * _this2._transform._rotation[4] + _this2._invInertia[8] * _this2._transform._rotation[5];
			__tmp__221 = _this2._invInertia[6] * _this2._transform._rotation[6] + _this2._invInertia[7] * _this2._transform._rotation[7] + _this2._invInertia[8] * _this2._transform._rotation[8];
			_this2._invInertia[0] = __tmp__001;
			_this2._invInertia[1] = __tmp__011;
			_this2._invInertia[2] = __tmp__021;
			_this2._invInertia[3] = __tmp__101;
			_this2._invInertia[4] = __tmp__111;
			_this2._invInertia[5] = __tmp__121;
			_this2._invInertia[6] = __tmp__201;
			_this2._invInertia[7] = __tmp__211;
			_this2._invInertia[8] = __tmp__221;
			_this2._invInertia[0] *= _this2._rotFactor[0];
			_this2._invInertia[1] *= _this2._rotFactor[0];
			_this2._invInertia[2] *= _this2._rotFactor[0];
			_this2._invInertia[3] *= _this2._rotFactor[1];
			_this2._invInertia[4] *= _this2._rotFactor[1];
			_this2._invInertia[5] *= _this2._rotFactor[1];
			_this2._invInertia[6] *= _this2._rotFactor[2];
			_this2._invInertia[7] *= _this2._rotFactor[2];
			_this2._invInertia[8] *= _this2._rotFactor[2];
			var _this3 = this._b2;
			var theta1 = Math.sqrt(av2X * av2X + av2Y * av2Y + av2Z * av2Z);
			var halfTheta1 = theta1 * 0.5;
			var rotationToSinAxisFactor1;
			var cosHalfTheta1;
			if (halfTheta1 < 0.5) {
				var ht21 = halfTheta1 * halfTheta1;
				rotationToSinAxisFactor1 = 0.5 * (1 - ht21 * 0.16666666666666666 + ht21 * ht21 * 0.0083333333333333332);
				cosHalfTheta1 = 1 - ht21 * 0.5 + ht21 * ht21 * 0.041666666666666664;
			} else {
				rotationToSinAxisFactor1 = Math.sin(halfTheta1) / theta1;
				cosHalfTheta1 = Math.cos(halfTheta1);
			}
			var sinAxis1;
			var sinAxisX1;
			var sinAxisY1;
			var sinAxisZ1;
			sinAxisX1 = av2X * rotationToSinAxisFactor1;
			sinAxisY1 = av2Y * rotationToSinAxisFactor1;
			sinAxisZ1 = av2Z * rotationToSinAxisFactor1;
			var dq1;
			var dqX1;
			var dqY1;
			var dqZ1;
			var dqW1;
			dqX1 = sinAxisX1;
			dqY1 = sinAxisY1;
			dqZ1 = sinAxisZ1;
			dqW1 = cosHalfTheta1;
			var q1;
			var qX1;
			var qY1;
			var qZ1;
			var qW1;
			var e001 = _this3._transform._rotation[0];
			var e111 = _this3._transform._rotation[4];
			var e221 = _this3._transform._rotation[8];
			var t1 = e001 + e111 + e221;
			var s1;
			if (t1 > 0) {
				s1 = Math.sqrt(t1 + 1);
				qW1 = 0.5 * s1;
				s1 = 0.5 / s1;
				qX1 = (_this3._transform._rotation[7] - _this3._transform._rotation[5]) * s1;
				qY1 = (_this3._transform._rotation[2] - _this3._transform._rotation[6]) * s1;
				qZ1 = (_this3._transform._rotation[3] - _this3._transform._rotation[1]) * s1;
			} else if (e001 > e111) {
				if (e001 > e221) {
					s1 = Math.sqrt(e001 - e111 - e221 + 1);
					qX1 = 0.5 * s1;
					s1 = 0.5 / s1;
					qY1 = (_this3._transform._rotation[1] + _this3._transform._rotation[3]) * s1;
					qZ1 = (_this3._transform._rotation[2] + _this3._transform._rotation[6]) * s1;
					qW1 = (_this3._transform._rotation[7] - _this3._transform._rotation[5]) * s1;
				} else {
					s1 = Math.sqrt(e221 - e001 - e111 + 1);
					qZ1 = 0.5 * s1;
					s1 = 0.5 / s1;
					qX1 = (_this3._transform._rotation[2] + _this3._transform._rotation[6]) * s1;
					qY1 = (_this3._transform._rotation[5] + _this3._transform._rotation[7]) * s1;
					qW1 = (_this3._transform._rotation[3] - _this3._transform._rotation[1]) * s1;
				}
			} else if (e111 > e221) {
				s1 = Math.sqrt(e111 - e221 - e001 + 1);
				qY1 = 0.5 * s1;
				s1 = 0.5 / s1;
				qX1 = (_this3._transform._rotation[1] + _this3._transform._rotation[3]) * s1;
				qZ1 = (_this3._transform._rotation[5] + _this3._transform._rotation[7]) * s1;
				qW1 = (_this3._transform._rotation[2] - _this3._transform._rotation[6]) * s1;
			} else {
				s1 = Math.sqrt(e221 - e001 - e111 + 1);
				qZ1 = 0.5 * s1;
				s1 = 0.5 / s1;
				qX1 = (_this3._transform._rotation[2] + _this3._transform._rotation[6]) * s1;
				qY1 = (_this3._transform._rotation[5] + _this3._transform._rotation[7]) * s1;
				qW1 = (_this3._transform._rotation[3] - _this3._transform._rotation[1]) * s1;
			}
			qX1 = dqW1 * qX1 + dqX1 * qW1 + dqY1 * qZ1 - dqZ1 * qY1;
			qY1 = dqW1 * qY1 - dqX1 * qZ1 + dqY1 * qW1 + dqZ1 * qX1;
			qZ1 = dqW1 * qZ1 + dqX1 * qY1 - dqY1 * qX1 + dqZ1 * qW1;
			qW1 = dqW1 * qW1 - dqX1 * qX1 - dqY1 * qY1 - dqZ1 * qZ1;
			var l1 = qX1 * qX1 + qY1 * qY1 + qZ1 * qZ1 + qW1 * qW1;
			if (l1 > 1e-32) {
				l1 = 1 / Math.sqrt(l1);
			}
			qX1 *= l1;
			qY1 *= l1;
			qZ1 *= l1;
			qW1 *= l1;
			var x1 = qX1;
			var y1 = qY1;
			var z1 = qZ1;
			var w1 = qW1;
			var x21 = 2 * x1;
			var y21 = 2 * y1;
			var z21 = 2 * z1;
			var xx1 = x1 * x21;
			var yy1 = y1 * y21;
			var zz1 = z1 * z21;
			var xy1 = x1 * y21;
			var yz1 = y1 * z21;
			var xz1 = x1 * z21;
			var wx1 = w1 * x21;
			var wy1 = w1 * y21;
			var wz1 = w1 * z21;
			_this3._transform._rotation[0] = 1 - yy1 - zz1;
			_this3._transform._rotation[1] = xy1 - wz1;
			_this3._transform._rotation[2] = xz1 + wy1;
			_this3._transform._rotation[3] = xy1 + wz1;
			_this3._transform._rotation[4] = 1 - xx1 - zz1;
			_this3._transform._rotation[5] = yz1 - wx1;
			_this3._transform._rotation[6] = xz1 - wy1;
			_this3._transform._rotation[7] = yz1 + wx1;
			_this3._transform._rotation[8] = 1 - xx1 - yy1;
			var __tmp__002;
			var __tmp__012;
			var __tmp__022;
			var __tmp__102;
			var __tmp__112;
			var __tmp__122;
			var __tmp__202;
			var __tmp__212;
			var __tmp__222;
			__tmp__002 = _this3._transform._rotation[0] * _this3._invLocalInertia[0] + _this3._transform._rotation[1] * _this3._invLocalInertia[3] + _this3._transform._rotation[2] * _this3._invLocalInertia[6];
			__tmp__012 = _this3._transform._rotation[0] * _this3._invLocalInertia[1] + _this3._transform._rotation[1] * _this3._invLocalInertia[4] + _this3._transform._rotation[2] * _this3._invLocalInertia[7];
			__tmp__022 = _this3._transform._rotation[0] * _this3._invLocalInertia[2] + _this3._transform._rotation[1] * _this3._invLocalInertia[5] + _this3._transform._rotation[2] * _this3._invLocalInertia[8];
			__tmp__102 = _this3._transform._rotation[3] * _this3._invLocalInertia[0] + _this3._transform._rotation[4] * _this3._invLocalInertia[3] + _this3._transform._rotation[5] * _this3._invLocalInertia[6];
			__tmp__112 = _this3._transform._rotation[3] * _this3._invLocalInertia[1] + _this3._transform._rotation[4] * _this3._invLocalInertia[4] + _this3._transform._rotation[5] * _this3._invLocalInertia[7];
			__tmp__122 = _this3._transform._rotation[3] * _this3._invLocalInertia[2] + _this3._transform._rotation[4] * _this3._invLocalInertia[5] + _this3._transform._rotation[5] * _this3._invLocalInertia[8];
			__tmp__202 = _this3._transform._rotation[6] * _this3._invLocalInertia[0] + _this3._transform._rotation[7] * _this3._invLocalInertia[3] + _this3._transform._rotation[8] * _this3._invLocalInertia[6];
			__tmp__212 = _this3._transform._rotation[6] * _this3._invLocalInertia[1] + _this3._transform._rotation[7] * _this3._invLocalInertia[4] + _this3._transform._rotation[8] * _this3._invLocalInertia[7];
			__tmp__222 = _this3._transform._rotation[6] * _this3._invLocalInertia[2] + _this3._transform._rotation[7] * _this3._invLocalInertia[5] + _this3._transform._rotation[8] * _this3._invLocalInertia[8];
			_this3._invInertia[0] = __tmp__002;
			_this3._invInertia[1] = __tmp__012;
			_this3._invInertia[2] = __tmp__022;
			_this3._invInertia[3] = __tmp__102;
			_this3._invInertia[4] = __tmp__112;
			_this3._invInertia[5] = __tmp__122;
			_this3._invInertia[6] = __tmp__202;
			_this3._invInertia[7] = __tmp__212;
			_this3._invInertia[8] = __tmp__222;
			var __tmp__003;
			var __tmp__013;
			var __tmp__023;
			var __tmp__103;
			var __tmp__113;
			var __tmp__123;
			var __tmp__203;
			var __tmp__213;
			var __tmp__223;
			__tmp__003 = _this3._invInertia[0] * _this3._transform._rotation[0] + _this3._invInertia[1] * _this3._transform._rotation[1] + _this3._invInertia[2] * _this3._transform._rotation[2];
			__tmp__013 = _this3._invInertia[0] * _this3._transform._rotation[3] + _this3._invInertia[1] * _this3._transform._rotation[4] + _this3._invInertia[2] * _this3._transform._rotation[5];
			__tmp__023 = _this3._invInertia[0] * _this3._transform._rotation[6] + _this3._invInertia[1] * _this3._transform._rotation[7] + _this3._invInertia[2] * _this3._transform._rotation[8];
			__tmp__103 = _this3._invInertia[3] * _this3._transform._rotation[0] + _this3._invInertia[4] * _this3._transform._rotation[1] + _this3._invInertia[5] * _this3._transform._rotation[2];
			__tmp__113 = _this3._invInertia[3] * _this3._transform._rotation[3] + _this3._invInertia[4] * _this3._transform._rotation[4] + _this3._invInertia[5] * _this3._transform._rotation[5];
			__tmp__123 = _this3._invInertia[3] * _this3._transform._rotation[6] + _this3._invInertia[4] * _this3._transform._rotation[7] + _this3._invInertia[5] * _this3._transform._rotation[8];
			__tmp__203 = _this3._invInertia[6] * _this3._transform._rotation[0] + _this3._invInertia[7] * _this3._transform._rotation[1] + _this3._invInertia[8] * _this3._transform._rotation[2];
			__tmp__213 = _this3._invInertia[6] * _this3._transform._rotation[3] + _this3._invInertia[7] * _this3._transform._rotation[4] + _this3._invInertia[8] * _this3._transform._rotation[5];
			__tmp__223 = _this3._invInertia[6] * _this3._transform._rotation[6] + _this3._invInertia[7] * _this3._transform._rotation[7] + _this3._invInertia[8] * _this3._transform._rotation[8];
			_this3._invInertia[0] = __tmp__003;
			_this3._invInertia[1] = __tmp__013;
			_this3._invInertia[2] = __tmp__023;
			_this3._invInertia[3] = __tmp__103;
			_this3._invInertia[4] = __tmp__113;
			_this3._invInertia[5] = __tmp__123;
			_this3._invInertia[6] = __tmp__203;
			_this3._invInertia[7] = __tmp__213;
			_this3._invInertia[8] = __tmp__223;
			_this3._invInertia[0] *= _this3._rotFactor[0];
			_this3._invInertia[1] *= _this3._rotFactor[0];
			_this3._invInertia[2] *= _this3._rotFactor[0];
			_this3._invInertia[3] *= _this3._rotFactor[1];
			_this3._invInertia[4] *= _this3._rotFactor[1];
			_this3._invInertia[5] *= _this3._rotFactor[1];
			_this3._invInertia[6] *= _this3._rotFactor[2];
			_this3._invInertia[7] *= _this3._rotFactor[2];
			_this3._invInertia[8] *= _this3._rotFactor[2];
		}

		proto.postSolve = function () {
			var _g1 = 0;
			var _g = this.info.numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var imp = row.impulse;
				var jt = row.jacobianT;
				var jb = row.jacobianB;
				var impulseL;
				var impulseLX;
				var impulseLY;
				var impulseLZ;
				impulseLX = 0;
				impulseLY = 0;
				impulseLZ = 0;
				impulseLX += jt.lin1X * imp.impulseT;
				impulseLY += jt.lin1Y * imp.impulseT;
				impulseLZ += jt.lin1Z * imp.impulseT;
				impulseLX += jb.lin1X * imp.impulseB;
				impulseLY += jb.lin1Y * imp.impulseB;
				impulseLZ += jb.lin1Z * imp.impulseB;
				imp.impulseLX = impulseLX;
				imp.impulseLY = impulseLY;
				imp.impulseLZ = impulseLZ;
			}
			this.constraint._syncManifold();
		}

		proto.postSolveVelocity = function (timeStep) {
		}

		var PgsContactConstraintSolver = function (constraint) {
			dynamics.constraint.ConstraintSolver.call(this);
			this.constraint = constraint;
			this.info = new dynamics.constraint.info.contact.ContactSolverInfo();
			var length = pe.common.Setting.maxManifoldPoints;
			var this1 = new Array(length);
			this.massData = this1;
			var _g1 = 0;
			var _g = this.massData.length;
			while (_g1 < _g) {
				var i = _g1++;
				this.massData[i] = new dynamics.constraint.solver.common.ContactSolverMassDataRow();
			}
		}
		return PgsContactConstraintSolver;
	});

	dynamics.constraint.solver.pgs.PgsJointConstraintSolver = pe.define(function (proto) {
		proto.preSolveVelocity = function (timeStep) {
			this.joint._syncAnchors();
			this.joint._getVelocitySolverInfo(timeStep, this.info);
			this._b1 = this.info.b1;
			this._b2 = this.info.b2;
			var invM1 = this._b1._invMass;
			var invM2 = this._b2._invMass;
			var invI1;
			var invI100;
			var invI101;
			var invI102;
			var invI110;
			var invI111;
			var invI112;
			var invI120;
			var invI121;
			var invI122;
			var invI2;
			var invI200;
			var invI201;
			var invI202;
			var invI210;
			var invI211;
			var invI212;
			var invI220;
			var invI221;
			var invI222;
			invI100 = this._b1._invInertia[0];
			invI101 = this._b1._invInertia[1];
			invI102 = this._b1._invInertia[2];
			invI110 = this._b1._invInertia[3];
			invI111 = this._b1._invInertia[4];
			invI112 = this._b1._invInertia[5];
			invI120 = this._b1._invInertia[6];
			invI121 = this._b1._invInertia[7];
			invI122 = this._b1._invInertia[8];
			invI200 = this._b2._invInertia[0];
			invI201 = this._b2._invInertia[1];
			invI202 = this._b2._invInertia[2];
			invI210 = this._b2._invInertia[3];
			invI211 = this._b2._invInertia[4];
			invI212 = this._b2._invInertia[5];
			invI220 = this._b2._invInertia[6];
			invI221 = this._b2._invInertia[7];
			invI222 = this._b2._invInertia[8];
			var _g1 = 0;
			var _g = this.info.numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var md = this.massData[i];
				var j = row.jacobian;
				j.updateSparsity();
				if ((j.flag & 1) != 0) {
					md.invMLin1X = j.lin1X * invM1;
					md.invMLin1Y = j.lin1Y * invM1;
					md.invMLin1Z = j.lin1Z * invM1;
					md.invMLin2X = j.lin2X * invM2;
					md.invMLin2Y = j.lin2Y * invM2;
					md.invMLin2Z = j.lin2Z * invM2;
				} else {
					md.invMLin1X = 0;
					md.invMLin1Y = 0;
					md.invMLin1Z = 0;
					md.invMLin2X = 0;
					md.invMLin2Y = 0;
					md.invMLin2Z = 0;
				}
				if ((j.flag & 2) != 0) {
					var __tmp__X;
					var __tmp__Y;
					var __tmp__Z;
					__tmp__X = invI100 * j.ang1X + invI101 * j.ang1Y + invI102 * j.ang1Z;
					__tmp__Y = invI110 * j.ang1X + invI111 * j.ang1Y + invI112 * j.ang1Z;
					__tmp__Z = invI120 * j.ang1X + invI121 * j.ang1Y + invI122 * j.ang1Z;
					md.invMAng1X = __tmp__X;
					md.invMAng1Y = __tmp__Y;
					md.invMAng1Z = __tmp__Z;
					var __tmp__X1;
					var __tmp__Y1;
					var __tmp__Z1;
					__tmp__X1 = invI200 * j.ang2X + invI201 * j.ang2Y + invI202 * j.ang2Z;
					__tmp__Y1 = invI210 * j.ang2X + invI211 * j.ang2Y + invI212 * j.ang2Z;
					__tmp__Z1 = invI220 * j.ang2X + invI221 * j.ang2Y + invI222 * j.ang2Z;
					md.invMAng2X = __tmp__X1;
					md.invMAng2Y = __tmp__Y1;
					md.invMAng2Z = __tmp__Z1;
				} else {
					md.invMAng1X = 0;
					md.invMAng1Y = 0;
					md.invMAng1Z = 0;
					md.invMAng2X = 0;
					md.invMAng2Y = 0;
					md.invMAng2Z = 0;
				}
				md.massWithoutCfm = md.invMLin1X * j.lin1X + md.invMLin1Y * j.lin1Y + md.invMLin1Z * j.lin1Z + (md.invMLin2X * j.lin2X + md.invMLin2Y * j.lin2Y + md.invMLin2Z * j.lin2Z) + (md.invMAng1X * j.ang1X + md.invMAng1Y * j.ang1Y + md.invMAng1Z * j.ang1Z) + (md.invMAng2X * j.ang2X + md.invMAng2Y * j.ang2Y + md.invMAng2Z * j.ang2Z);
				md.mass = md.massWithoutCfm + row.cfm;
				if (md.massWithoutCfm != 0) {
					md.massWithoutCfm = 1 / md.massWithoutCfm;
				}
				if (md.mass != 0) {
					md.mass = 1 / md.mass;
				}
			}
		}

		proto.warmStart = function (timeStep) {
			var _g = this.joint._positionCorrectionAlgorithm;
			var factor = _g == dynamics.constraint.PositionCorrectionAlgorithm.BAUMGARTE ? pe.common.Setting.jointWarmStartingFactorForBaungarte : pe.common.Setting.jointWarmStartingFactor;
			factor *= timeStep.dtRatio;
			if (factor <= 0) {
				var _g1 = 0;
				var _g2 = this.info.numRows;
				while (_g1 < _g2) {
					var i = _g1++;
					var row = this.info.rows[i];
					var _this = row.impulse;
					_this.impulse = 0;
					_this.impulseM = 0;
					_this.impulseP = 0;
				}
				return;
			}
			var lv1;
			var lv1X;
			var lv1Y;
			var lv1Z;
			var lv2;
			var lv2X;
			var lv2Y;
			var lv2Z;
			var av1;
			var av1X;
			var av1Y;
			var av1Z;
			var av2;
			var av2X;
			var av2Y;
			var av2Z;
			lv1X = this._b1._vel[0];
			lv1Y = this._b1._vel[1];
			lv1Z = this._b1._vel[2];
			lv2X = this._b2._vel[0];
			lv2Y = this._b2._vel[1];
			lv2Z = this._b2._vel[2];
			av1X = this._b1._angVel[0];
			av1Y = this._b1._angVel[1];
			av1Z = this._b1._angVel[2];
			av2X = this._b2._angVel[0];
			av2Y = this._b2._angVel[1];
			av2Z = this._b2._angVel[2];
			var _g11 = 0;
			var _g3 = this.info.numRows;
			while (_g11 < _g3) {
				var i1 = _g11++;
				var row1 = this.info.rows[i1];
				var md = this.massData[i1];
				var imp = row1.impulse;
				var j = row1.jacobian;
				imp.impulse *= factor;
				imp.impulseM *= factor;
				var impulse = imp.impulse + imp.impulseM;
				lv1X += md.invMLin1X * impulse;
				lv1Y += md.invMLin1Y * impulse;
				lv1Z += md.invMLin1Z * impulse;
				lv2X += md.invMLin2X * -impulse;
				lv2Y += md.invMLin2Y * -impulse;
				lv2Z += md.invMLin2Z * -impulse;
				av1X += md.invMAng1X * impulse;
				av1Y += md.invMAng1Y * impulse;
				av1Z += md.invMAng1Z * impulse;
				av2X += md.invMAng2X * -impulse;
				av2Y += md.invMAng2Y * -impulse;
				av2Z += md.invMAng2Z * -impulse;
			}
			this._b1._vel[0] = lv1X;
			this._b1._vel[1] = lv1Y;
			this._b1._vel[2] = lv1Z;
			this._b2._vel[0] = lv2X;
			this._b2._vel[1] = lv2Y;
			this._b2._vel[2] = lv2Z;
			this._b1._angVel[0] = av1X;
			this._b1._angVel[1] = av1Y;
			this._b1._angVel[2] = av1Z;
			this._b2._angVel[0] = av2X;
			this._b2._angVel[1] = av2Y;
			this._b2._angVel[2] = av2Z;
		}

		proto.solveVelocity = function () {
			var lv1;
			var lv1X;
			var lv1Y;
			var lv1Z;
			var lv2;
			var lv2X;
			var lv2Y;
			var lv2Z;
			var av1;
			var av1X;
			var av1Y;
			var av1Z;
			var av2;
			var av2X;
			var av2Y;
			var av2Z;
			lv1X = this._b1._vel[0];
			lv1Y = this._b1._vel[1];
			lv1Z = this._b1._vel[2];
			lv2X = this._b2._vel[0];
			lv2Y = this._b2._vel[1];
			lv2Z = this._b2._vel[2];
			av1X = this._b1._angVel[0];
			av1Y = this._b1._angVel[1];
			av1Z = this._b1._angVel[2];
			av2X = this._b2._angVel[0];
			av2Y = this._b2._angVel[1];
			av2Z = this._b2._angVel[2];
			var _g1 = 0;
			var _g = this.info.numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var md = this.massData[i];
				var imp = row.impulse;
				var j = row.jacobian;
				if (row.motorMaxImpulse == 0) {
					continue;
				}
				var rv = 0;
				rv += lv1X * j.lin1X + lv1Y * j.lin1Y + lv1Z * j.lin1Z;
				rv -= lv2X * j.lin2X + lv2Y * j.lin2Y + lv2Z * j.lin2Z;
				rv += av1X * j.ang1X + av1Y * j.ang1Y + av1Z * j.ang1Z;
				rv -= av2X * j.ang2X + av2Y * j.ang2Y + av2Z * j.ang2Z;
				var impulseM = (-row.motorSpeed - rv) * md.massWithoutCfm;
				var oldImpulseM = imp.impulseM;
				imp.impulseM += impulseM;
				if (imp.impulseM < -row.motorMaxImpulse) {
					imp.impulseM = -row.motorMaxImpulse;
				} else if (imp.impulseM > row.motorMaxImpulse) {
					imp.impulseM = row.motorMaxImpulse;
				}
				impulseM = imp.impulseM - oldImpulseM;
				if ((j.flag & 1) != 0) {
					lv1X += md.invMLin1X * impulseM;
					lv1Y += md.invMLin1Y * impulseM;
					lv1Z += md.invMLin1Z * impulseM;
					lv2X += md.invMLin2X * -impulseM;
					lv2Y += md.invMLin2Y * -impulseM;
					lv2Z += md.invMLin2Z * -impulseM;
				}
				if ((j.flag & 2) != 0) {
					av1X += md.invMAng1X * impulseM;
					av1Y += md.invMAng1Y * impulseM;
					av1Z += md.invMAng1Z * impulseM;
					av2X += md.invMAng2X * -impulseM;
					av2Y += md.invMAng2Y * -impulseM;
					av2Z += md.invMAng2Z * -impulseM;
				}
			}
			var _g11 = 0;
			var _g2 = this.info.numRows;
			while (_g11 < _g2) {
				var i1 = _g11++;
				var row1 = this.info.rows[i1];
				var md1 = this.massData[i1];
				var imp1 = row1.impulse;
				var j1 = row1.jacobian;
				var rv1 = 0;
				rv1 += lv1X * j1.lin1X + lv1Y * j1.lin1Y + lv1Z * j1.lin1Z;
				rv1 -= lv2X * j1.lin2X + lv2Y * j1.lin2Y + lv2Z * j1.lin2Z;
				rv1 += av1X * j1.ang1X + av1Y * j1.ang1Y + av1Z * j1.ang1Z;
				rv1 -= av2X * j1.ang2X + av2Y * j1.ang2Y + av2Z * j1.ang2Z;
				var impulse = (row1.rhs - rv1 - imp1.impulse * row1.cfm) * md1.mass;
				var oldImpulse = imp1.impulse;
				imp1.impulse += impulse;
				if (imp1.impulse < row1.minImpulse) {
					imp1.impulse = row1.minImpulse;
				} else if (imp1.impulse > row1.maxImpulse) {
					imp1.impulse = row1.maxImpulse;
				}
				impulse = imp1.impulse - oldImpulse;
				if ((j1.flag & 1) != 0) {
					lv1X += md1.invMLin1X * impulse;
					lv1Y += md1.invMLin1Y * impulse;
					lv1Z += md1.invMLin1Z * impulse;
					lv2X += md1.invMLin2X * -impulse;
					lv2Y += md1.invMLin2Y * -impulse;
					lv2Z += md1.invMLin2Z * -impulse;
				}
				if ((j1.flag & 2) != 0) {
					av1X += md1.invMAng1X * impulse;
					av1Y += md1.invMAng1Y * impulse;
					av1Z += md1.invMAng1Z * impulse;
					av2X += md1.invMAng2X * -impulse;
					av2Y += md1.invMAng2Y * -impulse;
					av2Z += md1.invMAng2Z * -impulse;
				}
			}
			this._b1._vel[0] = lv1X;
			this._b1._vel[1] = lv1Y;
			this._b1._vel[2] = lv1Z;
			this._b2._vel[0] = lv2X;
			this._b2._vel[1] = lv2Y;
			this._b2._vel[2] = lv2Z;
			this._b1._angVel[0] = av1X;
			this._b1._angVel[1] = av1Y;
			this._b1._angVel[2] = av1Z;
			this._b2._angVel[0] = av2X;
			this._b2._angVel[1] = av2Y;
			this._b2._angVel[2] = av2Z;
		}

		proto.postSolveVelocity = function (timeStep) {
			var lin;
			var linX;
			var linY;
			var linZ;
			var ang;
			var angX;
			var angY;
			var angZ;
			linX = 0;
			linY = 0;
			linZ = 0;
			angX = 0;
			angY = 0;
			angZ = 0;
			var _g1 = 0;
			var _g = this.info.numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var imp = row.impulse;
				var j = row.jacobian;
				if ((j.flag & 1) != 0) {
					linX += j.lin1X * imp.impulse;
					linY += j.lin1Y * imp.impulse;
					linZ += j.lin1Z * imp.impulse;
				} else if ((j.flag & 2) != 0) {
					angX += j.ang1X * imp.impulse;
					angY += j.ang1Y * imp.impulse;
					angZ += j.ang1Z * imp.impulse;
				}
			}
			this.joint._appliedForceX = linX * timeStep.invDt;
			this.joint._appliedForceY = linY * timeStep.invDt;
			this.joint._appliedForceZ = linZ * timeStep.invDt;
			this.joint._appliedTorqueX = angX * timeStep.invDt;
			this.joint._appliedTorqueY = angY * timeStep.invDt;
			this.joint._appliedTorqueZ = angZ * timeStep.invDt;
		}

		proto.preSolvePosition = function (timeStep) {
			this.joint._syncAnchors();
			this.joint._getPositionSolverInfo(this.info);
			this._b1 = this.info.b1;
			this._b2 = this.info.b2;
			var invM1 = this._b1._invMass;
			var invM2 = this._b2._invMass;
			var invI1;
			var invI100;
			var invI101;
			var invI102;
			var invI110;
			var invI111;
			var invI112;
			var invI120;
			var invI121;
			var invI122;
			var invI2;
			var invI200;
			var invI201;
			var invI202;
			var invI210;
			var invI211;
			var invI212;
			var invI220;
			var invI221;
			var invI222;
			invI100 = this._b1._invInertia[0];
			invI101 = this._b1._invInertia[1];
			invI102 = this._b1._invInertia[2];
			invI110 = this._b1._invInertia[3];
			invI111 = this._b1._invInertia[4];
			invI112 = this._b1._invInertia[5];
			invI120 = this._b1._invInertia[6];
			invI121 = this._b1._invInertia[7];
			invI122 = this._b1._invInertia[8];
			invI200 = this._b2._invInertia[0];
			invI201 = this._b2._invInertia[1];
			invI202 = this._b2._invInertia[2];
			invI210 = this._b2._invInertia[3];
			invI211 = this._b2._invInertia[4];
			invI212 = this._b2._invInertia[5];
			invI220 = this._b2._invInertia[6];
			invI221 = this._b2._invInertia[7];
			invI222 = this._b2._invInertia[8];
			var _g1 = 0;
			var _g = this.info.numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var md = this.massData[i];
				var imp = row.impulse;
				var j = row.jacobian;
				md.invMLin1X = j.lin1X * invM1;
				md.invMLin1Y = j.lin1Y * invM1;
				md.invMLin1Z = j.lin1Z * invM1;
				md.invMLin2X = j.lin2X * invM2;
				md.invMLin2Y = j.lin2Y * invM2;
				md.invMLin2Z = j.lin2Z * invM2;
				var __tmp__X;
				var __tmp__Y;
				var __tmp__Z;
				__tmp__X = invI100 * j.ang1X + invI101 * j.ang1Y + invI102 * j.ang1Z;
				__tmp__Y = invI110 * j.ang1X + invI111 * j.ang1Y + invI112 * j.ang1Z;
				__tmp__Z = invI120 * j.ang1X + invI121 * j.ang1Y + invI122 * j.ang1Z;
				md.invMAng1X = __tmp__X;
				md.invMAng1Y = __tmp__Y;
				md.invMAng1Z = __tmp__Z;
				var __tmp__X1;
				var __tmp__Y1;
				var __tmp__Z1;
				__tmp__X1 = invI200 * j.ang2X + invI201 * j.ang2Y + invI202 * j.ang2Z;
				__tmp__Y1 = invI210 * j.ang2X + invI211 * j.ang2Y + invI212 * j.ang2Z;
				__tmp__Z1 = invI220 * j.ang2X + invI221 * j.ang2Y + invI222 * j.ang2Z;
				md.invMAng2X = __tmp__X1;
				md.invMAng2Y = __tmp__Y1;
				md.invMAng2Z = __tmp__Z1;
				md.mass = md.invMLin1X * j.lin1X + md.invMLin1Y * j.lin1Y + md.invMLin1Z * j.lin1Z + (md.invMLin2X * j.lin2X + md.invMLin2Y * j.lin2Y + md.invMLin2Z * j.lin2Z) + (md.invMAng1X * j.ang1X + md.invMAng1Y * j.ang1Y + md.invMAng1Z * j.ang1Z) + (md.invMAng2X * j.ang2X + md.invMAng2Y * j.ang2Y + md.invMAng2Z * j.ang2Z);
				if (md.mass != 0) {
					md.mass = 1 / md.mass;
				}
			}
			var _g11 = 0;
			var _g2 = this.info.numRows;
			while (_g11 < _g2) {
				var i1 = _g11++;
				this.info.rows[i1].impulse.impulseP = 0;
			}
		}

		proto.solvePositionSplitImpulse = function () {
			var lv1;
			var lv1X;
			var lv1Y;
			var lv1Z;
			var lv2;
			var lv2X;
			var lv2Y;
			var lv2Z;
			var av1;
			var av1X;
			var av1Y;
			var av1Z;
			var av2;
			var av2X;
			var av2Y;
			var av2Z;
			lv1X = this._b1._pseudoVel[0];
			lv1Y = this._b1._pseudoVel[1];
			lv1Z = this._b1._pseudoVel[2];
			lv2X = this._b2._pseudoVel[0];
			lv2Y = this._b2._pseudoVel[1];
			lv2Z = this._b2._pseudoVel[2];
			av1X = this._b1._angPseudoVel[0];
			av1Y = this._b1._angPseudoVel[1];
			av1Z = this._b1._angPseudoVel[2];
			av2X = this._b2._angPseudoVel[0];
			av2Y = this._b2._angPseudoVel[1];
			av2Z = this._b2._angPseudoVel[2];
			var _g1 = 0;
			var _g = this.info.numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var md = this.massData[i];
				var imp = row.impulse;
				var j = row.jacobian;
				var rv = 0;
				rv += lv1X * j.lin1X + lv1Y * j.lin1Y + lv1Z * j.lin1Z;
				rv -= lv2X * j.lin2X + lv2Y * j.lin2Y + lv2Z * j.lin2Z;
				rv += av1X * j.ang1X + av1Y * j.ang1Y + av1Z * j.ang1Z;
				rv -= av2X * j.ang2X + av2Y * j.ang2Y + av2Z * j.ang2Z;
				var impulseP = (row.rhs * pe.common.Setting.positionSplitImpulseBaumgarte - rv) * md.mass;
				var oldImpulseP = imp.impulseP;
				imp.impulseP += impulseP;
				if (imp.impulseP < row.minImpulse) {
					imp.impulseP = row.minImpulse;
				} else if (imp.impulseP > row.maxImpulse) {
					imp.impulseP = row.maxImpulse;
				}
				impulseP = imp.impulseP - oldImpulseP;
				lv1X += md.invMLin1X * impulseP;
				lv1Y += md.invMLin1Y * impulseP;
				lv1Z += md.invMLin1Z * impulseP;
				lv2X += md.invMLin2X * -impulseP;
				lv2Y += md.invMLin2Y * -impulseP;
				lv2Z += md.invMLin2Z * -impulseP;
				av1X += md.invMAng1X * impulseP;
				av1Y += md.invMAng1Y * impulseP;
				av1Z += md.invMAng1Z * impulseP;
				av2X += md.invMAng2X * -impulseP;
				av2Y += md.invMAng2Y * -impulseP;
				av2Z += md.invMAng2Z * -impulseP;
			}
			this._b1._pseudoVel[0] = lv1X;
			this._b1._pseudoVel[1] = lv1Y;
			this._b1._pseudoVel[2] = lv1Z;
			this._b2._pseudoVel[0] = lv2X;
			this._b2._pseudoVel[1] = lv2Y;
			this._b2._pseudoVel[2] = lv2Z;
			this._b1._angPseudoVel[0] = av1X;
			this._b1._angPseudoVel[1] = av1Y;
			this._b1._angPseudoVel[2] = av1Z;
			this._b2._angPseudoVel[0] = av2X;
			this._b2._angPseudoVel[1] = av2Y;
			this._b2._angPseudoVel[2] = av2Z;
		}

		proto.solvePositionNgs = function (timeStep) {
			this.joint._syncAnchors();
			this.joint._getPositionSolverInfo(this.info);
			this._b1 = this.info.b1;
			this._b2 = this.info.b2;
			var invM1 = this._b1._invMass;
			var invM2 = this._b2._invMass;
			var invI1;
			var invI100;
			var invI101;
			var invI102;
			var invI110;
			var invI111;
			var invI112;
			var invI120;
			var invI121;
			var invI122;
			var invI2;
			var invI200;
			var invI201;
			var invI202;
			var invI210;
			var invI211;
			var invI212;
			var invI220;
			var invI221;
			var invI222;
			invI100 = this._b1._invInertia[0];
			invI101 = this._b1._invInertia[1];
			invI102 = this._b1._invInertia[2];
			invI110 = this._b1._invInertia[3];
			invI111 = this._b1._invInertia[4];
			invI112 = this._b1._invInertia[5];
			invI120 = this._b1._invInertia[6];
			invI121 = this._b1._invInertia[7];
			invI122 = this._b1._invInertia[8];
			invI200 = this._b2._invInertia[0];
			invI201 = this._b2._invInertia[1];
			invI202 = this._b2._invInertia[2];
			invI210 = this._b2._invInertia[3];
			invI211 = this._b2._invInertia[4];
			invI212 = this._b2._invInertia[5];
			invI220 = this._b2._invInertia[6];
			invI221 = this._b2._invInertia[7];
			invI222 = this._b2._invInertia[8];
			var _g1 = 0;
			var _g = this.info.numRows;
			while (_g1 < _g) {
				var i = _g1++;
				var row = this.info.rows[i];
				var md = this.massData[i];
				var imp = row.impulse;
				var j = row.jacobian;
				md.invMLin1X = j.lin1X * invM1;
				md.invMLin1Y = j.lin1Y * invM1;
				md.invMLin1Z = j.lin1Z * invM1;
				md.invMLin2X = j.lin2X * invM2;
				md.invMLin2Y = j.lin2Y * invM2;
				md.invMLin2Z = j.lin2Z * invM2;
				var __tmp__X;
				var __tmp__Y;
				var __tmp__Z;
				__tmp__X = invI100 * j.ang1X + invI101 * j.ang1Y + invI102 * j.ang1Z;
				__tmp__Y = invI110 * j.ang1X + invI111 * j.ang1Y + invI112 * j.ang1Z;
				__tmp__Z = invI120 * j.ang1X + invI121 * j.ang1Y + invI122 * j.ang1Z;
				md.invMAng1X = __tmp__X;
				md.invMAng1Y = __tmp__Y;
				md.invMAng1Z = __tmp__Z;
				var __tmp__X1;
				var __tmp__Y1;
				var __tmp__Z1;
				__tmp__X1 = invI200 * j.ang2X + invI201 * j.ang2Y + invI202 * j.ang2Z;
				__tmp__Y1 = invI210 * j.ang2X + invI211 * j.ang2Y + invI212 * j.ang2Z;
				__tmp__Z1 = invI220 * j.ang2X + invI221 * j.ang2Y + invI222 * j.ang2Z;
				md.invMAng2X = __tmp__X1;
				md.invMAng2Y = __tmp__Y1;
				md.invMAng2Z = __tmp__Z1;
				md.mass = md.invMLin1X * j.lin1X + md.invMLin1Y * j.lin1Y + md.invMLin1Z * j.lin1Z + (md.invMLin2X * j.lin2X + md.invMLin2Y * j.lin2Y + md.invMLin2Z * j.lin2Z) + (md.invMAng1X * j.ang1X + md.invMAng1Y * j.ang1Y + md.invMAng1Z * j.ang1Z) + (md.invMAng2X * j.ang2X + md.invMAng2Y * j.ang2Y + md.invMAng2Z * j.ang2Z);
				if (md.mass != 0) {
					md.mass = 1 / md.mass;
				}
			}
			var lv1;
			var lv1X;
			var lv1Y;
			var lv1Z;
			var lv2;
			var lv2X;
			var lv2Y;
			var lv2Z;
			var av1;
			var av1X;
			var av1Y;
			var av1Z;
			var av2;
			var av2X;
			var av2Y;
			var av2Z;
			lv1X = 0;
			lv1Y = 0;
			lv1Z = 0;
			lv2X = 0;
			lv2Y = 0;
			lv2Z = 0;
			av1X = 0;
			av1Y = 0;
			av1Z = 0;
			av2X = 0;
			av2Y = 0;
			av2Z = 0;
			var _g11 = 0;
			var _g2 = this.info.numRows;
			while (_g11 < _g2) {
				var i1 = _g11++;
				var row1 = this.info.rows[i1];
				var md1 = this.massData[i1];
				var imp1 = row1.impulse;
				var j1 = row1.jacobian;
				var rv = 0;
				rv += lv1X * j1.lin1X + lv1Y * j1.lin1Y + lv1Z * j1.lin1Z;
				rv -= lv2X * j1.lin2X + lv2Y * j1.lin2Y + lv2Z * j1.lin2Z;
				rv += av1X * j1.ang1X + av1Y * j1.ang1Y + av1Z * j1.ang1Z;
				rv -= av2X * j1.ang2X + av2Y * j1.ang2Y + av2Z * j1.ang2Z;
				var impulseP = (row1.rhs * pe.common.Setting.positionNgsBaumgarte - rv) * md1.mass;
				var oldImpulseP = imp1.impulseP;
				imp1.impulseP += impulseP;
				if (imp1.impulseP < row1.minImpulse) {
					imp1.impulseP = row1.minImpulse;
				} else if (imp1.impulseP > row1.maxImpulse) {
					imp1.impulseP = row1.maxImpulse;
				}
				impulseP = imp1.impulseP - oldImpulseP;
				lv1X += md1.invMLin1X * impulseP;
				lv1Y += md1.invMLin1Y * impulseP;
				lv1Z += md1.invMLin1Z * impulseP;
				lv2X += md1.invMLin2X * -impulseP;
				lv2Y += md1.invMLin2Y * -impulseP;
				lv2Z += md1.invMLin2Z * -impulseP;
				av1X += md1.invMAng1X * impulseP;
				av1Y += md1.invMAng1Y * impulseP;
				av1Z += md1.invMAng1Z * impulseP;
				av2X += md1.invMAng2X * -impulseP;
				av2Y += md1.invMAng2Y * -impulseP;
				av2Z += md1.invMAng2Z * -impulseP;
			}
			var _this = this._b1;
			_this._transform._position[0] += lv1X;
			_this._transform._position[1] += lv1Y;
			_this._transform._position[2] += lv1Z;
			var _this1 = this._b2;
			_this1._transform._position[0] += lv2X;
			_this1._transform._position[1] += lv2Y;
			_this1._transform._position[2] += lv2Z;
			var _this2 = this._b1;
			var theta = Math.sqrt(av1X * av1X + av1Y * av1Y + av1Z * av1Z);
			var halfTheta = theta * 0.5;
			var rotationToSinAxisFactor;
			var cosHalfTheta;
			if (halfTheta < 0.5) {
				var ht2 = halfTheta * halfTheta;
				rotationToSinAxisFactor = 0.5 * (1 - ht2 * 0.16666666666666666 + ht2 * ht2 * 0.0083333333333333332);
				cosHalfTheta = 1 - ht2 * 0.5 + ht2 * ht2 * 0.041666666666666664;
			} else {
				rotationToSinAxisFactor = Math.sin(halfTheta) / theta;
				cosHalfTheta = Math.cos(halfTheta);
			}
			var sinAxis;
			var sinAxisX;
			var sinAxisY;
			var sinAxisZ;
			sinAxisX = av1X * rotationToSinAxisFactor;
			sinAxisY = av1Y * rotationToSinAxisFactor;
			sinAxisZ = av1Z * rotationToSinAxisFactor;
			var dq;
			var dqX;
			var dqY;
			var dqZ;
			var dqW;
			dqX = sinAxisX;
			dqY = sinAxisY;
			dqZ = sinAxisZ;
			dqW = cosHalfTheta;
			var q;
			var qX;
			var qY;
			var qZ;
			var qW;
			var e00 = _this2._transform._rotation[0];
			var e11 = _this2._transform._rotation[4];
			var e22 = _this2._transform._rotation[8];
			var t = e00 + e11 + e22;
			var s;
			if (t > 0) {
				s = Math.sqrt(t + 1);
				qW = 0.5 * s;
				s = 0.5 / s;
				qX = (_this2._transform._rotation[7] - _this2._transform._rotation[5]) * s;
				qY = (_this2._transform._rotation[2] - _this2._transform._rotation[6]) * s;
				qZ = (_this2._transform._rotation[3] - _this2._transform._rotation[1]) * s;
			} else if (e00 > e11) {
				if (e00 > e22) {
					s = Math.sqrt(e00 - e11 - e22 + 1);
					qX = 0.5 * s;
					s = 0.5 / s;
					qY = (_this2._transform._rotation[1] + _this2._transform._rotation[3]) * s;
					qZ = (_this2._transform._rotation[2] + _this2._transform._rotation[6]) * s;
					qW = (_this2._transform._rotation[7] - _this2._transform._rotation[5]) * s;
				} else {
					s = Math.sqrt(e22 - e00 - e11 + 1);
					qZ = 0.5 * s;
					s = 0.5 / s;
					qX = (_this2._transform._rotation[2] + _this2._transform._rotation[6]) * s;
					qY = (_this2._transform._rotation[5] + _this2._transform._rotation[7]) * s;
					qW = (_this2._transform._rotation[3] - _this2._transform._rotation[1]) * s;
				}
			} else if (e11 > e22) {
				s = Math.sqrt(e11 - e22 - e00 + 1);
				qY = 0.5 * s;
				s = 0.5 / s;
				qX = (_this2._transform._rotation[1] + _this2._transform._rotation[3]) * s;
				qZ = (_this2._transform._rotation[5] + _this2._transform._rotation[7]) * s;
				qW = (_this2._transform._rotation[2] - _this2._transform._rotation[6]) * s;
			} else {
				s = Math.sqrt(e22 - e00 - e11 + 1);
				qZ = 0.5 * s;
				s = 0.5 / s;
				qX = (_this2._transform._rotation[2] + _this2._transform._rotation[6]) * s;
				qY = (_this2._transform._rotation[5] + _this2._transform._rotation[7]) * s;
				qW = (_this2._transform._rotation[3] - _this2._transform._rotation[1]) * s;
			}
			qX = dqW * qX + dqX * qW + dqY * qZ - dqZ * qY;
			qY = dqW * qY - dqX * qZ + dqY * qW + dqZ * qX;
			qZ = dqW * qZ + dqX * qY - dqY * qX + dqZ * qW;
			qW = dqW * qW - dqX * qX - dqY * qY - dqZ * qZ;
			var l = qX * qX + qY * qY + qZ * qZ + qW * qW;
			if (l > 1e-32) {
				l = 1 / Math.sqrt(l);
			}
			qX *= l;
			qY *= l;
			qZ *= l;
			qW *= l;
			var x = qX;
			var y = qY;
			var z = qZ;
			var w = qW;
			var x2 = 2 * x;
			var y2 = 2 * y;
			var z2 = 2 * z;
			var xx = x * x2;
			var yy = y * y2;
			var zz = z * z2;
			var xy = x * y2;
			var yz = y * z2;
			var xz = x * z2;
			var wx = w * x2;
			var wy = w * y2;
			var wz = w * z2;
			_this2._transform._rotation[0] = 1 - yy - zz;
			_this2._transform._rotation[1] = xy - wz;
			_this2._transform._rotation[2] = xz + wy;
			_this2._transform._rotation[3] = xy + wz;
			_this2._transform._rotation[4] = 1 - xx - zz;
			_this2._transform._rotation[5] = yz - wx;
			_this2._transform._rotation[6] = xz - wy;
			_this2._transform._rotation[7] = yz + wx;
			_this2._transform._rotation[8] = 1 - xx - yy;
			var __tmp__00;
			var __tmp__01;
			var __tmp__02;
			var __tmp__10;
			var __tmp__11;
			var __tmp__12;
			var __tmp__20;
			var __tmp__21;
			var __tmp__22;
			__tmp__00 = _this2._transform._rotation[0] * _this2._invLocalInertia[0] + _this2._transform._rotation[1] * _this2._invLocalInertia[3] + _this2._transform._rotation[2] * _this2._invLocalInertia[6];
			__tmp__01 = _this2._transform._rotation[0] * _this2._invLocalInertia[1] + _this2._transform._rotation[1] * _this2._invLocalInertia[4] + _this2._transform._rotation[2] * _this2._invLocalInertia[7];
			__tmp__02 = _this2._transform._rotation[0] * _this2._invLocalInertia[2] + _this2._transform._rotation[1] * _this2._invLocalInertia[5] + _this2._transform._rotation[2] * _this2._invLocalInertia[8];
			__tmp__10 = _this2._transform._rotation[3] * _this2._invLocalInertia[0] + _this2._transform._rotation[4] * _this2._invLocalInertia[3] + _this2._transform._rotation[5] * _this2._invLocalInertia[6];
			__tmp__11 = _this2._transform._rotation[3] * _this2._invLocalInertia[1] + _this2._transform._rotation[4] * _this2._invLocalInertia[4] + _this2._transform._rotation[5] * _this2._invLocalInertia[7];
			__tmp__12 = _this2._transform._rotation[3] * _this2._invLocalInertia[2] + _this2._transform._rotation[4] * _this2._invLocalInertia[5] + _this2._transform._rotation[5] * _this2._invLocalInertia[8];
			__tmp__20 = _this2._transform._rotation[6] * _this2._invLocalInertia[0] + _this2._transform._rotation[7] * _this2._invLocalInertia[3] + _this2._transform._rotation[8] * _this2._invLocalInertia[6];
			__tmp__21 = _this2._transform._rotation[6] * _this2._invLocalInertia[1] + _this2._transform._rotation[7] * _this2._invLocalInertia[4] + _this2._transform._rotation[8] * _this2._invLocalInertia[7];
			__tmp__22 = _this2._transform._rotation[6] * _this2._invLocalInertia[2] + _this2._transform._rotation[7] * _this2._invLocalInertia[5] + _this2._transform._rotation[8] * _this2._invLocalInertia[8];
			_this2._invInertia[0] = __tmp__00;
			_this2._invInertia[1] = __tmp__01;
			_this2._invInertia[2] = __tmp__02;
			_this2._invInertia[3] = __tmp__10;
			_this2._invInertia[4] = __tmp__11;
			_this2._invInertia[5] = __tmp__12;
			_this2._invInertia[6] = __tmp__20;
			_this2._invInertia[7] = __tmp__21;
			_this2._invInertia[8] = __tmp__22;
			var __tmp__001;
			var __tmp__011;
			var __tmp__021;
			var __tmp__101;
			var __tmp__111;
			var __tmp__121;
			var __tmp__201;
			var __tmp__211;
			var __tmp__221;
			__tmp__001 = _this2._invInertia[0] * _this2._transform._rotation[0] + _this2._invInertia[1] * _this2._transform._rotation[1] + _this2._invInertia[2] * _this2._transform._rotation[2];
			__tmp__011 = _this2._invInertia[0] * _this2._transform._rotation[3] + _this2._invInertia[1] * _this2._transform._rotation[4] + _this2._invInertia[2] * _this2._transform._rotation[5];
			__tmp__021 = _this2._invInertia[0] * _this2._transform._rotation[6] + _this2._invInertia[1] * _this2._transform._rotation[7] + _this2._invInertia[2] * _this2._transform._rotation[8];
			__tmp__101 = _this2._invInertia[3] * _this2._transform._rotation[0] + _this2._invInertia[4] * _this2._transform._rotation[1] + _this2._invInertia[5] * _this2._transform._rotation[2];
			__tmp__111 = _this2._invInertia[3] * _this2._transform._rotation[3] + _this2._invInertia[4] * _this2._transform._rotation[4] + _this2._invInertia[5] * _this2._transform._rotation[5];
			__tmp__121 = _this2._invInertia[3] * _this2._transform._rotation[6] + _this2._invInertia[4] * _this2._transform._rotation[7] + _this2._invInertia[5] * _this2._transform._rotation[8];
			__tmp__201 = _this2._invInertia[6] * _this2._transform._rotation[0] + _this2._invInertia[7] * _this2._transform._rotation[1] + _this2._invInertia[8] * _this2._transform._rotation[2];
			__tmp__211 = _this2._invInertia[6] * _this2._transform._rotation[3] + _this2._invInertia[7] * _this2._transform._rotation[4] + _this2._invInertia[8] * _this2._transform._rotation[5];
			__tmp__221 = _this2._invInertia[6] * _this2._transform._rotation[6] + _this2._invInertia[7] * _this2._transform._rotation[7] + _this2._invInertia[8] * _this2._transform._rotation[8];
			_this2._invInertia[0] = __tmp__001;
			_this2._invInertia[1] = __tmp__011;
			_this2._invInertia[2] = __tmp__021;
			_this2._invInertia[3] = __tmp__101;
			_this2._invInertia[4] = __tmp__111;
			_this2._invInertia[5] = __tmp__121;
			_this2._invInertia[6] = __tmp__201;
			_this2._invInertia[7] = __tmp__211;
			_this2._invInertia[8] = __tmp__221;
			_this2._invInertia[0] *= _this2._rotFactor[0];
			_this2._invInertia[1] *= _this2._rotFactor[0];
			_this2._invInertia[2] *= _this2._rotFactor[0];
			_this2._invInertia[3] *= _this2._rotFactor[1];
			_this2._invInertia[4] *= _this2._rotFactor[1];
			_this2._invInertia[5] *= _this2._rotFactor[1];
			_this2._invInertia[6] *= _this2._rotFactor[2];
			_this2._invInertia[7] *= _this2._rotFactor[2];
			_this2._invInertia[8] *= _this2._rotFactor[2];
			var _this3 = this._b2;
			var theta1 = Math.sqrt(av2X * av2X + av2Y * av2Y + av2Z * av2Z);
			var halfTheta1 = theta1 * 0.5;
			var rotationToSinAxisFactor1;
			var cosHalfTheta1;
			if (halfTheta1 < 0.5) {
				var ht21 = halfTheta1 * halfTheta1;
				rotationToSinAxisFactor1 = 0.5 * (1 - ht21 * 0.16666666666666666 + ht21 * ht21 * 0.0083333333333333332);
				cosHalfTheta1 = 1 - ht21 * 0.5 + ht21 * ht21 * 0.041666666666666664;
			} else {
				rotationToSinAxisFactor1 = Math.sin(halfTheta1) / theta1;
				cosHalfTheta1 = Math.cos(halfTheta1);
			}
			var sinAxis1;
			var sinAxisX1;
			var sinAxisY1;
			var sinAxisZ1;
			sinAxisX1 = av2X * rotationToSinAxisFactor1;
			sinAxisY1 = av2Y * rotationToSinAxisFactor1;
			sinAxisZ1 = av2Z * rotationToSinAxisFactor1;
			var dq1;
			var dqX1;
			var dqY1;
			var dqZ1;
			var dqW1;
			dqX1 = sinAxisX1;
			dqY1 = sinAxisY1;
			dqZ1 = sinAxisZ1;
			dqW1 = cosHalfTheta1;
			var q1;
			var qX1;
			var qY1;
			var qZ1;
			var qW1;
			var e001 = _this3._transform._rotation[0];
			var e111 = _this3._transform._rotation[4];
			var e221 = _this3._transform._rotation[8];
			var t1 = e001 + e111 + e221;
			var s1;
			if (t1 > 0) {
				s1 = Math.sqrt(t1 + 1);
				qW1 = 0.5 * s1;
				s1 = 0.5 / s1;
				qX1 = (_this3._transform._rotation[7] - _this3._transform._rotation[5]) * s1;
				qY1 = (_this3._transform._rotation[2] - _this3._transform._rotation[6]) * s1;
				qZ1 = (_this3._transform._rotation[3] - _this3._transform._rotation[1]) * s1;
			} else if (e001 > e111) {
				if (e001 > e221) {
					s1 = Math.sqrt(e001 - e111 - e221 + 1);
					qX1 = 0.5 * s1;
					s1 = 0.5 / s1;
					qY1 = (_this3._transform._rotation[1] + _this3._transform._rotation[3]) * s1;
					qZ1 = (_this3._transform._rotation[2] + _this3._transform._rotation[6]) * s1;
					qW1 = (_this3._transform._rotation[7] - _this3._transform._rotation[5]) * s1;
				} else {
					s1 = Math.sqrt(e221 - e001 - e111 + 1);
					qZ1 = 0.5 * s1;
					s1 = 0.5 / s1;
					qX1 = (_this3._transform._rotation[2] + _this3._transform._rotation[6]) * s1;
					qY1 = (_this3._transform._rotation[5] + _this3._transform._rotation[7]) * s1;
					qW1 = (_this3._transform._rotation[3] - _this3._transform._rotation[1]) * s1;
				}
			} else if (e111 > e221) {
				s1 = Math.sqrt(e111 - e221 - e001 + 1);
				qY1 = 0.5 * s1;
				s1 = 0.5 / s1;
				qX1 = (_this3._transform._rotation[1] + _this3._transform._rotation[3]) * s1;
				qZ1 = (_this3._transform._rotation[5] + _this3._transform._rotation[7]) * s1;
				qW1 = (_this3._transform._rotation[2] - _this3._transform._rotation[6]) * s1;
			} else {
				s1 = Math.sqrt(e221 - e001 - e111 + 1);
				qZ1 = 0.5 * s1;
				s1 = 0.5 / s1;
				qX1 = (_this3._transform._rotation[2] + _this3._transform._rotation[6]) * s1;
				qY1 = (_this3._transform._rotation[5] + _this3._transform._rotation[7]) * s1;
				qW1 = (_this3._transform._rotation[3] - _this3._transform._rotation[1]) * s1;
			}
			qX1 = dqW1 * qX1 + dqX1 * qW1 + dqY1 * qZ1 - dqZ1 * qY1;
			qY1 = dqW1 * qY1 - dqX1 * qZ1 + dqY1 * qW1 + dqZ1 * qX1;
			qZ1 = dqW1 * qZ1 + dqX1 * qY1 - dqY1 * qX1 + dqZ1 * qW1;
			qW1 = dqW1 * qW1 - dqX1 * qX1 - dqY1 * qY1 - dqZ1 * qZ1;
			var l1 = qX1 * qX1 + qY1 * qY1 + qZ1 * qZ1 + qW1 * qW1;
			if (l1 > 1e-32) {
				l1 = 1 / Math.sqrt(l1);
			}
			qX1 *= l1;
			qY1 *= l1;
			qZ1 *= l1;
			qW1 *= l1;
			var x1 = qX1;
			var y1 = qY1;
			var z1 = qZ1;
			var w1 = qW1;
			var x21 = 2 * x1;
			var y21 = 2 * y1;
			var z21 = 2 * z1;
			var xx1 = x1 * x21;
			var yy1 = y1 * y21;
			var zz1 = z1 * z21;
			var xy1 = x1 * y21;
			var yz1 = y1 * z21;
			var xz1 = x1 * z21;
			var wx1 = w1 * x21;
			var wy1 = w1 * y21;
			var wz1 = w1 * z21;
			_this3._transform._rotation[0] = 1 - yy1 - zz1;
			_this3._transform._rotation[1] = xy1 - wz1;
			_this3._transform._rotation[2] = xz1 + wy1;
			_this3._transform._rotation[3] = xy1 + wz1;
			_this3._transform._rotation[4] = 1 - xx1 - zz1;
			_this3._transform._rotation[5] = yz1 - wx1;
			_this3._transform._rotation[6] = xz1 - wy1;
			_this3._transform._rotation[7] = yz1 + wx1;
			_this3._transform._rotation[8] = 1 - xx1 - yy1;
			var __tmp__002;
			var __tmp__012;
			var __tmp__022;
			var __tmp__102;
			var __tmp__112;
			var __tmp__122;
			var __tmp__202;
			var __tmp__212;
			var __tmp__222;
			__tmp__002 = _this3._transform._rotation[0] * _this3._invLocalInertia[0] + _this3._transform._rotation[1] * _this3._invLocalInertia[3] + _this3._transform._rotation[2] * _this3._invLocalInertia[6];
			__tmp__012 = _this3._transform._rotation[0] * _this3._invLocalInertia[1] + _this3._transform._rotation[1] * _this3._invLocalInertia[4] + _this3._transform._rotation[2] * _this3._invLocalInertia[7];
			__tmp__022 = _this3._transform._rotation[0] * _this3._invLocalInertia[2] + _this3._transform._rotation[1] * _this3._invLocalInertia[5] + _this3._transform._rotation[2] * _this3._invLocalInertia[8];
			__tmp__102 = _this3._transform._rotation[3] * _this3._invLocalInertia[0] + _this3._transform._rotation[4] * _this3._invLocalInertia[3] + _this3._transform._rotation[5] * _this3._invLocalInertia[6];
			__tmp__112 = _this3._transform._rotation[3] * _this3._invLocalInertia[1] + _this3._transform._rotation[4] * _this3._invLocalInertia[4] + _this3._transform._rotation[5] * _this3._invLocalInertia[7];
			__tmp__122 = _this3._transform._rotation[3] * _this3._invLocalInertia[2] + _this3._transform._rotation[4] * _this3._invLocalInertia[5] + _this3._transform._rotation[5] * _this3._invLocalInertia[8];
			__tmp__202 = _this3._transform._rotation[6] * _this3._invLocalInertia[0] + _this3._transform._rotation[7] * _this3._invLocalInertia[3] + _this3._transform._rotation[8] * _this3._invLocalInertia[6];
			__tmp__212 = _this3._transform._rotation[6] * _this3._invLocalInertia[1] + _this3._transform._rotation[7] * _this3._invLocalInertia[4] + _this3._transform._rotation[8] * _this3._invLocalInertia[7];
			__tmp__222 = _this3._transform._rotation[6] * _this3._invLocalInertia[2] + _this3._transform._rotation[7] * _this3._invLocalInertia[5] + _this3._transform._rotation[8] * _this3._invLocalInertia[8];
			_this3._invInertia[0] = __tmp__002;
			_this3._invInertia[1] = __tmp__012;
			_this3._invInertia[2] = __tmp__022;
			_this3._invInertia[3] = __tmp__102;
			_this3._invInertia[4] = __tmp__112;
			_this3._invInertia[5] = __tmp__122;
			_this3._invInertia[6] = __tmp__202;
			_this3._invInertia[7] = __tmp__212;
			_this3._invInertia[8] = __tmp__222;
			var __tmp__003;
			var __tmp__013;
			var __tmp__023;
			var __tmp__103;
			var __tmp__113;
			var __tmp__123;
			var __tmp__203;
			var __tmp__213;
			var __tmp__223;
			__tmp__003 = _this3._invInertia[0] * _this3._transform._rotation[0] + _this3._invInertia[1] * _this3._transform._rotation[1] + _this3._invInertia[2] * _this3._transform._rotation[2];
			__tmp__013 = _this3._invInertia[0] * _this3._transform._rotation[3] + _this3._invInertia[1] * _this3._transform._rotation[4] + _this3._invInertia[2] * _this3._transform._rotation[5];
			__tmp__023 = _this3._invInertia[0] * _this3._transform._rotation[6] + _this3._invInertia[1] * _this3._transform._rotation[7] + _this3._invInertia[2] * _this3._transform._rotation[8];
			__tmp__103 = _this3._invInertia[3] * _this3._transform._rotation[0] + _this3._invInertia[4] * _this3._transform._rotation[1] + _this3._invInertia[5] * _this3._transform._rotation[2];
			__tmp__113 = _this3._invInertia[3] * _this3._transform._rotation[3] + _this3._invInertia[4] * _this3._transform._rotation[4] + _this3._invInertia[5] * _this3._transform._rotation[5];
			__tmp__123 = _this3._invInertia[3] * _this3._transform._rotation[6] + _this3._invInertia[4] * _this3._transform._rotation[7] + _this3._invInertia[5] * _this3._transform._rotation[8];
			__tmp__203 = _this3._invInertia[6] * _this3._transform._rotation[0] + _this3._invInertia[7] * _this3._transform._rotation[1] + _this3._invInertia[8] * _this3._transform._rotation[2];
			__tmp__213 = _this3._invInertia[6] * _this3._transform._rotation[3] + _this3._invInertia[7] * _this3._transform._rotation[4] + _this3._invInertia[8] * _this3._transform._rotation[5];
			__tmp__223 = _this3._invInertia[6] * _this3._transform._rotation[6] + _this3._invInertia[7] * _this3._transform._rotation[7] + _this3._invInertia[8] * _this3._transform._rotation[8];
			_this3._invInertia[0] = __tmp__003;
			_this3._invInertia[1] = __tmp__013;
			_this3._invInertia[2] = __tmp__023;
			_this3._invInertia[3] = __tmp__103;
			_this3._invInertia[4] = __tmp__113;
			_this3._invInertia[5] = __tmp__123;
			_this3._invInertia[6] = __tmp__203;
			_this3._invInertia[7] = __tmp__213;
			_this3._invInertia[8] = __tmp__223;
			_this3._invInertia[0] *= _this3._rotFactor[0];
			_this3._invInertia[1] *= _this3._rotFactor[0];
			_this3._invInertia[2] *= _this3._rotFactor[0];
			_this3._invInertia[3] *= _this3._rotFactor[1];
			_this3._invInertia[4] *= _this3._rotFactor[1];
			_this3._invInertia[5] *= _this3._rotFactor[1];
			_this3._invInertia[6] *= _this3._rotFactor[2];
			_this3._invInertia[7] *= _this3._rotFactor[2];
			_this3._invInertia[8] *= _this3._rotFactor[2];
		}

		proto.postSolve = function () {
			this.joint._syncAnchors();
			this.joint._checkDestruction();
		}

		var PgsJointConstraintSolver = function (joint) {
			dynamics.constraint.ConstraintSolver.call(this);
			this.joint = joint;
			this.info = new dynamics.constraint.info.joint.JointSolverInfo();
			var length = pe.common.Setting.maxJacobianRows;
			var this1 = new Array(length);
			this.massData = this1;
			var _g1 = 0;
			var _g = this.massData.length;
			while (_g1 < _g) {
				var i = _g1++;
				this.massData[i] = new dynamics.constraint.solver_commonn.JointSolverMassDataRow();
			}
		}
		return PgsJointConstraintSolver;
	});

	dynamics.rigidbody.RigidBody = pe.define(function (proto) {
		var totalMass, totalInertia00, totalInertia01, totalInertia02, totalInertia10, totalInertia11, totalInertia12, totalInertia20, totalInertia21, totalInertia22;

		var inertia00, inertia01, inertia02, inertia10, inertia11, inertia12, inertia20, inertia21, inertia22;

		proto.updateMass = function () {
			totalMass = 0;
			totalInertia00 = 0; totalInertia01 = 0; totalInertia02 = 0; totalInertia10 = 0; totalInertia11 = 0; totalInertia12 = 0; totalInertia20 = 0; totalInertia21 = 0; totalInertia22 = 0;
			var mass = 0;
			list = this._shapeList;
			while (list != null) {

				geo = list._geom;
				geo._updateMass();
				mass = list._density * geo._volume;

				inertia00 = list._localTransform._rotation[0] * geo._inertiaCoeff00 + list._localTransform._rotation[1] * geo._inertiaCoeff10 + list._localTransform._rotation[2] * geo._inertiaCoeff20;
				inertia01 = list._localTransform._rotation[0] * geo._inertiaCoeff01 + list._localTransform._rotation[1] * geo._inertiaCoeff11 + list._localTransform._rotation[2] * geo._inertiaCoeff21;
				inertia02 = list._localTransform._rotation[0] * geo._inertiaCoeff02 + list._localTransform._rotation[1] * geo._inertiaCoeff12 + list._localTransform._rotation[2] * geo._inertiaCoeff22;
				inertia10 = list._localTransform._rotation[3] * geo._inertiaCoeff00 + list._localTransform._rotation[4] * geo._inertiaCoeff10 + list._localTransform._rotation[5] * geo._inertiaCoeff20;
				inertia11 = list._localTransform._rotation[3] * geo._inertiaCoeff01 + list._localTransform._rotation[4] * geo._inertiaCoeff11 + list._localTransform._rotation[5] * geo._inertiaCoeff21;
				inertia12 = list._localTransform._rotation[3] * geo._inertiaCoeff02 + list._localTransform._rotation[4] * geo._inertiaCoeff12 + list._localTransform._rotation[5] * geo._inertiaCoeff22;
				inertia20 = list._localTransform._rotation[6] * geo._inertiaCoeff00 + list._localTransform._rotation[7] * geo._inertiaCoeff10 + list._localTransform._rotation[8] * geo._inertiaCoeff20;
				inertia21 = list._localTransform._rotation[6] * geo._inertiaCoeff01 + list._localTransform._rotation[7] * geo._inertiaCoeff11 + list._localTransform._rotation[8] * geo._inertiaCoeff21;
				inertia22 = list._localTransform._rotation[6] * geo._inertiaCoeff02 + list._localTransform._rotation[7] * geo._inertiaCoeff12 + list._localTransform._rotation[8] * geo._inertiaCoeff22;


				inertia00 = inertia00 * list._localTransform._rotation[0] + inertia01 * list._localTransform._rotation[1] + inertia02 * list._localTransform._rotation[2];
				inertia01 = inertia00 * list._localTransform._rotation[3] + inertia01 * list._localTransform._rotation[4] + inertia02 * list._localTransform._rotation[5];
				inertia02 = inertia00 * list._localTransform._rotation[6] + inertia01 * list._localTransform._rotation[7] + inertia02 * list._localTransform._rotation[8];
				inertia10 = inertia10 * list._localTransform._rotation[0] + inertia11 * list._localTransform._rotation[1] + inertia12 * list._localTransform._rotation[2];
				inertia11 = inertia10 * list._localTransform._rotation[3] + inertia11 * list._localTransform._rotation[4] + inertia12 * list._localTransform._rotation[5];
				inertia12 = inertia10 * list._localTransform._rotation[6] + inertia11 * list._localTransform._rotation[7] + inertia12 * list._localTransform._rotation[8];
				inertia20 = inertia20 * list._localTransform._rotation[0] + inertia21 * list._localTransform._rotation[1] + inertia22 * list._localTransform._rotation[2];
				inertia21 = inertia20 * list._localTransform._rotation[3] + inertia21 * list._localTransform._rotation[4] + inertia22 * list._localTransform._rotation[5];
				inertia22 = inertia20 * list._localTransform._rotation[6] + inertia21 * list._localTransform._rotation[7] + inertia22 * list._localTransform._rotation[8];


				inertia00 *= mass; inertia01 *= mass; inertia02 *= mass; inertia10 *= mass; inertia11 *= mass;
				inertia12 *= mass; inertia20 *= mass; inertia21 *= mass; inertia22 *= mass;

				xx = list._localTransform._position[0] * list._localTransform._position[0];
				yy = list._localTransform._position[1] * list._localTransform._position[1];
				zz = list._localTransform._position[2] * list._localTransform._position[2];
				xy = -list._localTransform._position[0] * list._localTransform._position[1];
				yz = -list._localTransform._position[1] * list._localTransform._position[2];
				zx = -list._localTransform._position[2] * list._localTransform._position[0];

				inertia00 += (yy + zz) * mass;
				inertia01 += xy * mass;
				inertia02 += zx * mass;
				inertia10 += xy * mass;
				inertia11 += (xx + zz) * mass;
				inertia12 += yz * mass;
				inertia20 += zx * mass;
				inertia21 += yz * mass;
				inertia22 += (xx + yy) * mass;
				totalMass += mass;
				totalInertia00 += inertia00;
				totalInertia01 += inertia01;
				totalInertia02 += inertia02;
				totalInertia10 += inertia10;
				totalInertia11 += inertia11;
				totalInertia12 += inertia12;
				totalInertia20 += inertia20;
				totalInertia21 += inertia21;
				totalInertia22 += inertia22;
				list = list._next;
			}
			this._mass = totalMass;
			this._localInertia[0] = totalInertia00;
			this._localInertia[1] = totalInertia01;
			this._localInertia[2] = totalInertia02;
			this._localInertia[3] = totalInertia10;
			this._localInertia[4] = totalInertia11;
			this._localInertia[5] = totalInertia12;
			this._localInertia[6] = totalInertia20;
			this._localInertia[7] = totalInertia21;
			this._localInertia[8] = totalInertia22;

			d00 = this._localInertia[4] * this._localInertia[8] - this._localInertia[5] * this._localInertia[7];
			d01 = this._localInertia[3] * this._localInertia[8] - this._localInertia[5] * this._localInertia[6];
			d02 = this._localInertia[3] * this._localInertia[7] - this._localInertia[4] * this._localInertia[6];
			det = this._localInertia[0] * d00 - this._localInertia[1] * d01 + this._localInertia[2] * d02;
			if (this._mass > 0 && det > 0 && this._type == 0) {
				this._invMass = 1 / this._mass;
				d001 = this._localInertia[4] * this._localInertia[8] - this._localInertia[5] * this._localInertia[7];
				d011 = this._localInertia[3] * this._localInertia[8] - this._localInertia[5] * this._localInertia[6];
				d021 = this._localInertia[3] * this._localInertia[7] - this._localInertia[4] * this._localInertia[6];
				d10 = this._localInertia[1] * this._localInertia[8] - this._localInertia[2] * this._localInertia[7];
				d11 = this._localInertia[0] * this._localInertia[8] - this._localInertia[2] * this._localInertia[6];
				d12 = this._localInertia[0] * this._localInertia[7] - this._localInertia[1] * this._localInertia[6];
				d20 = this._localInertia[1] * this._localInertia[5] - this._localInertia[2] * this._localInertia[4];
				d21 = this._localInertia[0] * this._localInertia[5] - this._localInertia[2] * this._localInertia[3];
				d22 = this._localInertia[0] * this._localInertia[4] - this._localInertia[1] * this._localInertia[3];
				d = this._localInertia[0] * d001 - this._localInertia[1] * d011 + this._localInertia[2] * d021;
				if (d < -1e-32 || d > 1e-32) {
					d = 1 / d;
				}
				this._invLocalInertia[0] = d001 * d;
				this._invLocalInertia[1] = -d10 * d;
				this._invLocalInertia[2] = d20 * d;
				this._invLocalInertia[3] = -d011 * d;
				this._invLocalInertia[4] = d11 * d;
				this._invLocalInertia[5] = -d21 * d;
				this._invLocalInertia[6] = d021 * d;
				this._invLocalInertia[7] = -d12 * d;
				this._invLocalInertia[8] = d22 * d;
				this._invLocalInertiaWithoutRotFactor[0] = this._invLocalInertia[0];
				this._invLocalInertiaWithoutRotFactor[1] = this._invLocalInertia[1];
				this._invLocalInertiaWithoutRotFactor[2] = this._invLocalInertia[2];
				this._invLocalInertiaWithoutRotFactor[3] = this._invLocalInertia[3];
				this._invLocalInertiaWithoutRotFactor[4] = this._invLocalInertia[4];
				this._invLocalInertiaWithoutRotFactor[5] = this._invLocalInertia[5];
				this._invLocalInertiaWithoutRotFactor[6] = this._invLocalInertia[6];
				this._invLocalInertiaWithoutRotFactor[7] = this._invLocalInertia[7];
				this._invLocalInertiaWithoutRotFactor[8] = this._invLocalInertia[8];
				this._invLocalInertia[0] = this._invLocalInertiaWithoutRotFactor[0] * this._rotFactor[0];
				this._invLocalInertia[1] = this._invLocalInertiaWithoutRotFactor[1] * this._rotFactor[0];
				this._invLocalInertia[2] = this._invLocalInertiaWithoutRotFactor[2] * this._rotFactor[0];
				this._invLocalInertia[3] = this._invLocalInertiaWithoutRotFactor[3] * this._rotFactor[1];
				this._invLocalInertia[4] = this._invLocalInertiaWithoutRotFactor[4] * this._rotFactor[1];
				this._invLocalInertia[5] = this._invLocalInertiaWithoutRotFactor[5] * this._rotFactor[1];
				this._invLocalInertia[6] = this._invLocalInertiaWithoutRotFactor[6] * this._rotFactor[2];
				this._invLocalInertia[7] = this._invLocalInertiaWithoutRotFactor[7] * this._rotFactor[2];
				this._invLocalInertia[8] = this._invLocalInertiaWithoutRotFactor[8] * this._rotFactor[2];
			} else {
				this._invMass = 0;
				this._invLocalInertia.fill(0);
				this._invLocalInertiaWithoutRotFactor.fill(0);
				if (this._type == 0) {
					this._type = 1;
				}
			}

			__tmp__001 = this._transform._rotation[0] * this._invLocalInertia[0] + this._transform._rotation[1] * this._invLocalInertia[3] + this._transform._rotation[2] * this._invLocalInertia[6];
			__tmp__011 = this._transform._rotation[0] * this._invLocalInertia[1] + this._transform._rotation[1] * this._invLocalInertia[4] + this._transform._rotation[2] * this._invLocalInertia[7];
			__tmp__021 = this._transform._rotation[0] * this._invLocalInertia[2] + this._transform._rotation[1] * this._invLocalInertia[5] + this._transform._rotation[2] * this._invLocalInertia[8];

			__tmp__101 = this._transform._rotation[3] * this._invLocalInertia[0] + this._transform._rotation[4] * this._invLocalInertia[3] + this._transform._rotation[5] * this._invLocalInertia[6];
			__tmp__111 = this._transform._rotation[3] * this._invLocalInertia[1] + this._transform._rotation[4] * this._invLocalInertia[4] + this._transform._rotation[5] * this._invLocalInertia[7];
			__tmp__121 = this._transform._rotation[3] * this._invLocalInertia[2] + this._transform._rotation[4] * this._invLocalInertia[5] + this._transform._rotation[5] * this._invLocalInertia[8];

			__tmp__201 = this._transform._rotation[6] * this._invLocalInertia[0] + this._transform._rotation[7] * this._invLocalInertia[3] + this._transform._rotation[8] * this._invLocalInertia[6];
			__tmp__211 = this._transform._rotation[6] * this._invLocalInertia[1] + this._transform._rotation[7] * this._invLocalInertia[4] + this._transform._rotation[8] * this._invLocalInertia[7];
			__tmp__221 = this._transform._rotation[6] * this._invLocalInertia[2] + this._transform._rotation[7] * this._invLocalInertia[5] + this._transform._rotation[8] * this._invLocalInertia[8];

			this._invInertia[0] = __tmp__001;
			this._invInertia[1] = __tmp__011;
			this._invInertia[2] = __tmp__021;

			this._invInertia[3] = __tmp__101;
			this._invInertia[4] = __tmp__111;
			this._invInertia[5] = __tmp__121;

			this._invInertia[6] = __tmp__201;
			this._invInertia[7] = __tmp__211;
			this._invInertia[8] = __tmp__221;

			__tmp__001 = this._invInertia[0] * this._transform._rotation[0] + this._invInertia[1] * this._transform._rotation[1] + this._invInertia[2] * this._transform._rotation[2];
			__tmp__011 = this._invInertia[0] * this._transform._rotation[3] + this._invInertia[1] * this._transform._rotation[4] + this._invInertia[2] * this._transform._rotation[5];
			__tmp__021 = this._invInertia[0] * this._transform._rotation[6] + this._invInertia[1] * this._transform._rotation[7] + this._invInertia[2] * this._transform._rotation[8];

			__tmp__101 = this._invInertia[3] * this._transform._rotation[0] + this._invInertia[4] * this._transform._rotation[1] + this._invInertia[5] * this._transform._rotation[2];
			__tmp__111 = this._invInertia[3] * this._transform._rotation[3] + this._invInertia[4] * this._transform._rotation[4] + this._invInertia[5] * this._transform._rotation[5];
			__tmp__121 = this._invInertia[3] * this._transform._rotation[6] + this._invInertia[4] * this._transform._rotation[7] + this._invInertia[5] * this._transform._rotation[8];

			__tmp__201 = this._invInertia[6] * this._transform._rotation[0] + this._invInertia[7] * this._transform._rotation[1] + this._invInertia[8] * this._transform._rotation[2];
			__tmp__211 = this._invInertia[6] * this._transform._rotation[3] + this._invInertia[7] * this._transform._rotation[4] + this._invInertia[8] * this._transform._rotation[5];
			__tmp__221 = this._invInertia[6] * this._transform._rotation[6] + this._invInertia[7] * this._transform._rotation[7] + this._invInertia[8] * this._transform._rotation[8];


			this._invInertia[0] = __tmp__001;
			this._invInertia[1] = __tmp__011;
			this._invInertia[2] = __tmp__021;

			this._invInertia[3] = __tmp__101;
			this._invInertia[4] = __tmp__111;
			this._invInertia[5] = __tmp__121;

			this._invInertia[6] = __tmp__201;
			this._invInertia[7] = __tmp__211;
			this._invInertia[8] = __tmp__221;


			this._invInertia[0] *= this._rotFactor[0];
			this._invInertia[1] *= this._rotFactor[0];
			this._invInertia[2] *= this._rotFactor[0];
			this._invInertia[3] *= this._rotFactor[1];
			this._invInertia[4] *= this._rotFactor[1];
			this._invInertia[5] *= this._rotFactor[1];
			this._invInertia[6] *= this._rotFactor[2];
			this._invInertia[7] *= this._rotFactor[2];
			this._invInertia[8] *= this._rotFactor[2];
			this._sleeping = false;
			this._sleepTime = 0;
		}



	
		var translation = vec3(), rotation = vec3(), sin_axis = vec3(), dq = quat(),
			translation_length_sq = 0, rotation_length_sq = 0,
			rotation_to_sin_axis_factor = 0, cos_half_theta = 0, half_theta = 0, theta = 0, e00 = 0, e11 = 0, e22 = 0, t = 0, s = 0;

		var __tmp__001, __tmp__011, __tmp__021, __tmp__101, __tmp__111, __tmp__121, __tmp__201, __tmp__211, __tmp__221;

		fin.macro$(function update_intertia() {
			
			this._invInertia[0] = this._transform._rotation[0] * this._invLocalInertia[0] + this._transform._rotation[1] * this._invLocalInertia[3] + this._transform._rotation[2] * this._invLocalInertia[6];
			this._invInertia[1] = this._transform._rotation[0] * this._invLocalInertia[1] + this._transform._rotation[1] * this._invLocalInertia[4] + this._transform._rotation[2] * this._invLocalInertia[7];
			this._invInertia[2] = this._transform._rotation[0] * this._invLocalInertia[2] + this._transform._rotation[1] * this._invLocalInertia[5] + this._transform._rotation[2] * this._invLocalInertia[8];
			this._invInertia[3] = this._transform._rotation[3] * this._invLocalInertia[0] + this._transform._rotation[4] * this._invLocalInertia[3] + this._transform._rotation[5] * this._invLocalInertia[6];
			this._invInertia[4] = this._transform._rotation[3] * this._invLocalInertia[1] + this._transform._rotation[4] * this._invLocalInertia[4] + this._transform._rotation[5] * this._invLocalInertia[7];
			this._invInertia[5] = this._transform._rotation[3] * this._invLocalInertia[2] + this._transform._rotation[4] * this._invLocalInertia[5] + this._transform._rotation[5] * this._invLocalInertia[8];
			this._invInertia[6] = this._transform._rotation[6] * this._invLocalInertia[0] + this._transform._rotation[7] * this._invLocalInertia[3] + this._transform._rotation[8] * this._invLocalInertia[6];
			this._invInertia[7] = this._transform._rotation[6] * this._invLocalInertia[1] + this._transform._rotation[7] * this._invLocalInertia[4] + this._transform._rotation[8] * this._invLocalInertia[7];
			this._invInertia[8] = this._transform._rotation[6] * this._invLocalInertia[2] + this._transform._rotation[7] * this._invLocalInertia[5] + this._transform._rotation[8] * this._invLocalInertia[8];



			__tmp__001 = (this._invInertia[0] * this._transform._rotation[0] + this._invInertia[1] * this._transform._rotation[1] + this._invInertia[2] * this._transform._rotation[2]) * this._rotFactor[0];
			__tmp__011 = (this._invInertia[0] * this._transform._rotation[3] + this._invInertia[1] * this._transform._rotation[4] + this._invInertia[2] * this._transform._rotation[5]) * this._rotFactor[0];
			__tmp__021 = (this._invInertia[0] * this._transform._rotation[6] + this._invInertia[1] * this._transform._rotation[7] + this._invInertia[2] * this._transform._rotation[8]) * this._rotFactor[0];

			__tmp__101 = (this._invInertia[3] * this._transform._rotation[0] + this._invInertia[4] * this._transform._rotation[1] + this._invInertia[5] * this._transform._rotation[2]) * this._rotFactor[1];
			__tmp__111 = (this._invInertia[3] * this._transform._rotation[3] + this._invInertia[4] * this._transform._rotation[4] + this._invInertia[5] * this._transform._rotation[5]) * this._rotFactor[1];
			__tmp__121 = (this._invInertia[3] * this._transform._rotation[6] + this._invInertia[4] * this._transform._rotation[7] + this._invInertia[5] * this._transform._rotation[8]) * this._rotFactor[1];

			__tmp__201 = (this._invInertia[6] * this._transform._rotation[0] + this._invInertia[7] * this._transform._rotation[1] + this._invInertia[8] * this._transform._rotation[2]) * this._rotFactor[2];
			__tmp__211 = (this._invInertia[6] * this._transform._rotation[3] + this._invInertia[7] * this._transform._rotation[4] + this._invInertia[8] * this._transform._rotation[5]) * this._rotFactor[2];
			__tmp__221 = (this._invInertia[6] * this._transform._rotation[6] + this._invInertia[7] * this._transform._rotation[7] + this._invInertia[8] * this._transform._rotation[8]) * this._rotFactor[2];

			this._invInertia[0] = __tmp__001;
			this._invInertia[1] = __tmp__011;
			this._invInertia[2] = __tmp__021;
			this._invInertia[3] = __tmp__101;
			this._invInertia[4] = __tmp__111;
			this._invInertia[5] = __tmp__121;
			this._invInertia[6] = __tmp__201;
			this._invInertia[7] = __tmp__211;
			this._invInertia[8] = __tmp__221;
		}, pe)

		fin.macro$(function transform_apply_rotation(r$) {
			theta =
				math.vec3_length$(r$)
			half_theta = theta * 0.5;

			if (half_theta < 0.5) {
				// use Maclaurin expansion
				xx = half_theta * half_theta;
				rotation_to_sin_axis_factor = (1 / 2) * (1 - xx * (1 / 6) + xx * xx * (1 / 120));
				cos_half_theta = 1 - xx * (1 / 2) + xx * xx * (1 / 24);
			} else {
				rotation_to_sin_axis_factor = Math.sin(half_theta) / theta;
				cos_half_theta = Math.cos(half_theta);
			}

			math.vec3_scale$(sin_axis, r$, rotation_to_sin_axis_factor)

			math.quat_from_vec3_float$(dq, sin_axis, cos_half_theta)




			dqX = r$[0] * rotation_to_sin_axis_factor;
			dqY = r$[1] * rotation_to_sin_axis_factor;
			dqZ = r$[2] * rotation_to_sin_axis_factor;
			dqW = cos_half_theta;




			e00 = this._transform._rotation[0];
			e11 = this._transform._rotation[4];
			e22 = this._transform._rotation[8];
			t = e00 + e11 + e22;
			if (t > 0) {
				s = Math.sqrt(t + 1);
				qW = 0.5 * s;
				s = 0.5 / s;
				qX = (this._transform._rotation[7] - this._transform._rotation[5]) * s;
				qY = (this._transform._rotation[2] - this._transform._rotation[6]) * s;
				qZ = (this._transform._rotation[3] - this._transform._rotation[1]) * s;
			} else if (e00 > e11) {
				if (e00 > e22) {
					s = Math.sqrt(e00 - e11 - e22 + 1);
					qX = 0.5 * s;
					s = 0.5 / s;
					qY = (this._transform._rotation[1] + this._transform._rotation[3]) * s;
					qZ = (this._transform._rotation[2] + this._transform._rotation[6]) * s;
					qW = (this._transform._rotation[7] - this._transform._rotation[5]) * s;
				} else {
					s = Math.sqrt(e22 - e00 - e11 + 1);
					qZ = 0.5 * s;
					s = 0.5 / s;
					qX = (this._transform._rotation[2] + this._transform._rotation[6]) * s;
					qY = (this._transform._rotation[5] + this._transform._rotation[7]) * s;
					qW = (this._transform._rotation[3] - this._transform._rotation[1]) * s;
				}
			} else if (e11 > e22) {
				s = Math.sqrt(e11 - e22 - e00 + 1);
				qY = 0.5 * s;
				s = 0.5 / s;
				qX = (this._transform._rotation[1] + this._transform._rotation[3]) * s;
				qZ = (this._transform._rotation[5] + this._transform._rotation[7]) * s;
				qW = (this._transform._rotation[2] - this._transform._rotation[6]) * s;
			} else {
				s = Math.sqrt(e22 - e00 - e11 + 1);
				qZ = 0.5 * s;
				s = 0.5 / s;
				qX = (this._transform._rotation[2] + this._transform._rotation[6]) * s;
				qY = (this._transform._rotation[5] + this._transform._rotation[7]) * s;
				qW = (this._transform._rotation[3] - this._transform._rotation[1]) * s;
			}
			qX = dqW * qX + dqX * qW + dqY * qZ - dqZ * qY;
			qY = dqW * qY - dqX * qZ + dqY * qW + dqZ * qX;
			qZ = dqW * qZ + dqX * qY - dqY * qX + dqZ * qW;
			qW = dqW * qW - dqX * qX - dqY * qY - dqZ * qZ;
			xx = qX * qX + qY * qY + qZ * qZ + qW * qW;
			if (xx > 1e-32) {
				xx = 1 / Math.sqrt(xx);
			}
			qX *= xx; qY *= xx; qZ *= xx; qW *= xx;

			x2 = 2 * qX;
			y2 = 2 * qY;
			z2 = 2 * qZ;
			xx = qX * x2;
			yy = qY * y2;
			zz = qZ * z2;
			xy = qX * y2;
			yz = qY * z2;
			xz = qX * z2;
			wx = qW * x2;
			wy = qW * y2;
			wz = qW * z2;

			this._transform._quat[0] = qX;
			this._transform._quat[1] = qY;
			this._transform._quat[2] = qZ;
			this._transform._quat[3] = qW;

			


			this._transform._rotation[0] = 1 - yy - zz;
			this._transform._rotation[1] = xy - wz;
			this._transform._rotation[2] = xz + wy;
			this._transform._rotation[3] = xy + wz;
			this._transform._rotation[4] = 1 - xx - zz;
			this._transform._rotation[5] = yz - wx;
			this._transform._rotation[6] = xz - wy;
			this._transform._rotation[7] = yz + wx;
			this._transform._rotation[8] = 1 - xx - yy;

			pe.update_intertia$()
		}, pe)

		fin.macro$(function transform_apply_translation(t$) {
			math.vec3_add$(this._transform._position, this._transform._position, t$)
		}, pe)


		proto._integrate = function (dt) {
			switch (this._type) {
				case 0: case 2:
					math.vec3_scale$(translation, this._vel, dt)
					math.vec3_scale$(rotation, this._angVel, dt)
					translation_length_sq =
						math.vec3_length_sqr$(translation)
					rotation_length_sq =
						math.vec3_length_sqr$(rotation)
					if (translation_length_sq === 0 && rotation_length_sq === 0) {


						return; // no need of integration
					}
					// limit linear velocity
					if (translation_length_sq > pe.common.Setting.maxTranslationPerStep * pe.common.Setting.maxTranslationPerStep) {
						xx = pe.common.Setting.maxTranslationPerStep / Math.sqrt(translation_length_sq);
						math.vec3_scale$(this._vel, this._vel, xx)
						math.vec3_scale$(translation, translation, xx)
					}

					// limit angular velocity
					if (rotation_length_sq > pe.common.Setting.maxRotationPerStep * pe.common.Setting.maxRotationPerStep) {
						xx = pe.common.Setting.maxRotationPerStep / Math.sqrt(rotation_length_sq);
						math.vec3_scale$(this._angVel, this._angVel, xx)
						math.vec3_scale$(rotation, rotation, xx)
					}


					//apply rotation

					

					if (!(this.flags & dynamics.rigidbody.RigidBodyFalgs.DONOTMOVE)) {
						pe.transform_apply_translation$(translation)

					}

					if (!(this.flags & dynamics.rigidbody.RigidBodyFalgs.DOTONROTATE)) {

						pe.transform_apply_rotation$(rotation)
					}
					
					



					break;
				case 1:
					math.vec3_zero$(this._vel)
					math.vec3_zero$(this._angVel)
					math.vec3_zero$(this._pseudoVel)
					math.vec3_zero$(this._angPseudoVel)
					break;
			}
		}

		proto._integratePseudoVelocity = function (dt) {
			translation_length_sq =
				math.vec3_length_sqr$(this._pseudoVel)
			rotation_length_sq =
				math.vec3_length_sqr$(this._angPseudoVel)
			if (translation_length_sq === 0 && rotation_length_sq === 0) {
				return; // no need of integration
			}
			switch (this._type) {
				case 0: case 2:
					math.vec3_copy$(translation, this._pseudoVel)
					math.vec3_copy$(rotation, this._angPseudoVel)

					// clear pseudo velocity
					math.vec3_zero$(this._pseudoVel)
					math.vec3_zero$(this._angPseudoVel)

					pe.transform_apply_translation$(translation)
					pe.transform_apply_rotation$(rotation)




					break;
				case 1:
					math.vec3_zero$(this._pseudoVel)
					math.vec3_zero$(this._angPseudoVel)
					break;
			}

		}

		proto.sync_shapes = function () {
			list = this._shapeList;
			while (list != null) {
				list.sync(this._ptransform, this._transform);
				list = list._next;
			}
		}

		proto.update_transform_ext = function () {
			vec3.copy(this._ptransform._position, this._transform._position);
			mat3.copy(this._ptransform._rotation, this._transform._rotation);
			//	this.sync_shapes();

			this.wakeUp();
		}

		proto.addShape = function (shape) {
			if (this._shapeList == null) {
				this._shapeList = shape;
				this._shapeListLast = shape;
			} else {
				this._shapeListLast._next = shape;
				shape._prev = this._shapeListLast;
				this._shapeListLast = shape;
			}
			this._numShapes++;
			shape._rigidBody = this;
			if (this._world != null) {
				shape._proxy = this._world._broadPhase.createProxy(shape, shape._aabb);
				shape._id = this._world._shapeIdCount++;
				this._world._numShapes++;
			}
			this.updateMass();
			list = this._shapeList;
			var min, minX, minY, minZ, max, maxX, maxY, maxZ;
			var dst, src1, src2;
			while (list != null) {
				dst = list._ptransform;
				src1 = list._localTransform;
				src2 = this._ptransform;
				var __tmp__00;
				var __tmp__01;
				var __tmp__02;
				var __tmp__10;
				var __tmp__11;
				var __tmp__12;
				var __tmp__20;
				var __tmp__21;
				var __tmp__22;
				__tmp__00 = src2._rotation[0] * src1._rotation[0] + src2._rotation[1] * src1._rotation[3] + src2._rotation[2] * src1._rotation[6];
				__tmp__01 = src2._rotation[0] * src1._rotation[1] + src2._rotation[1] * src1._rotation[4] + src2._rotation[2] * src1._rotation[7];
				__tmp__02 = src2._rotation[0] * src1._rotation[2] + src2._rotation[1] * src1._rotation[5] + src2._rotation[2] * src1._rotation[8];
				__tmp__10 = src2._rotation[3] * src1._rotation[0] + src2._rotation[4] * src1._rotation[3] + src2._rotation[5] * src1._rotation[6];
				__tmp__11 = src2._rotation[3] * src1._rotation[1] + src2._rotation[4] * src1._rotation[4] + src2._rotation[5] * src1._rotation[7];
				__tmp__12 = src2._rotation[3] * src1._rotation[2] + src2._rotation[4] * src1._rotation[5] + src2._rotation[5] * src1._rotation[8];
				__tmp__20 = src2._rotation[6] * src1._rotation[0] + src2._rotation[7] * src1._rotation[3] + src2._rotation[8] * src1._rotation[6];
				__tmp__21 = src2._rotation[6] * src1._rotation[1] + src2._rotation[7] * src1._rotation[4] + src2._rotation[8] * src1._rotation[7];
				__tmp__22 = src2._rotation[6] * src1._rotation[2] + src2._rotation[7] * src1._rotation[5] + src2._rotation[8] * src1._rotation[8];
				dst._rotation[0] = __tmp__00;
				dst._rotation[1] = __tmp__01;
				dst._rotation[2] = __tmp__02;
				dst._rotation[3] = __tmp__10;
				dst._rotation[4] = __tmp__11;
				dst._rotation[5] = __tmp__12;
				dst._rotation[6] = __tmp__20;
				dst._rotation[7] = __tmp__21;
				dst._rotation[8] = __tmp__22;

				dst._position[0] = src2._rotation[0] * src1._position[0] + src2._rotation[1] * src1._position[1] + src2._rotation[2] * src1._position[2];
				dst._position[1] = src2._rotation[3] * src1._position[0] + src2._rotation[4] * src1._position[1] + src2._rotation[5] * src1._position[2];
				dst._position[2] = src2._rotation[6] * src1._position[0] + src2._rotation[7] * src1._position[1] + src2._rotation[8] * src1._position[2];
				dst._position[0] += src2._position[0];
				dst._position[1] += src2._position[1];
				dst._position[2] += src2._position[2];
				var dst1 = list._transform;
				var src11 = list._localTransform;
				var src21 = this._transform;
				var __tmp__001;
				var __tmp__011;
				var __tmp__021;
				var __tmp__101;
				var __tmp__111;
				var __tmp__121;
				var __tmp__201;
				var __tmp__211;
				var __tmp__221;
				__tmp__001 = src21._rotation[0] * src11._rotation[0] + src21._rotation[1] * src11._rotation[3] + src21._rotation[2] * src11._rotation[6];
				__tmp__011 = src21._rotation[0] * src11._rotation[1] + src21._rotation[1] * src11._rotation[4] + src21._rotation[2] * src11._rotation[7];
				__tmp__021 = src21._rotation[0] * src11._rotation[2] + src21._rotation[1] * src11._rotation[5] + src21._rotation[2] * src11._rotation[8];
				__tmp__101 = src21._rotation[3] * src11._rotation[0] + src21._rotation[4] * src11._rotation[3] + src21._rotation[5] * src11._rotation[6];
				__tmp__111 = src21._rotation[3] * src11._rotation[1] + src21._rotation[4] * src11._rotation[4] + src21._rotation[5] * src11._rotation[7];
				__tmp__121 = src21._rotation[3] * src11._rotation[2] + src21._rotation[4] * src11._rotation[5] + src21._rotation[5] * src11._rotation[8];
				__tmp__201 = src21._rotation[6] * src11._rotation[0] + src21._rotation[7] * src11._rotation[3] + src21._rotation[8] * src11._rotation[6];
				__tmp__211 = src21._rotation[6] * src11._rotation[1] + src21._rotation[7] * src11._rotation[4] + src21._rotation[8] * src11._rotation[7];
				__tmp__221 = src21._rotation[6] * src11._rotation[2] + src21._rotation[7] * src11._rotation[5] + src21._rotation[8] * src11._rotation[8];
				dst1._rotation[0] = __tmp__001;
				dst1._rotation[1] = __tmp__011;
				dst1._rotation[2] = __tmp__021;
				dst1._rotation[3] = __tmp__101;
				dst1._rotation[4] = __tmp__111;
				dst1._rotation[5] = __tmp__121;
				dst1._rotation[6] = __tmp__201;
				dst1._rotation[7] = __tmp__211;
				dst1._rotation[8] = __tmp__221;

				dst1._position[0] = src21._rotation[0] * src11._position[0] + src21._rotation[1] * src11._position[1] + src21._rotation[2] * src11._position[2];
				dst1._position[1] = src21._rotation[3] * src11._position[0] + src21._rotation[4] * src11._position[1] + src21._rotation[5] * src11._position[2];
				dst1._position[2] = src21._rotation[6] * src11._position[0] + src21._rotation[7] * src11._position[1] + src21._rotation[8] * src11._position[2];
				dst1._position[0] += src21._position[0];
				dst1._position[1] += src21._position[1];
				dst1._position[2] += src21._position[2];


				list._geom._computeAabb(list._aabb, list._ptransform);
				minX = list._aabb[0];
				minY = list._aabb[1];
				minZ = list._aabb[2];
				maxX = list._aabb[3];
				maxY = list._aabb[4];
				maxZ = list._aabb[5];
				list._geom._computeAabb(list._aabb, list._transform);
				list._aabb[0] = minX < list._aabb[0] ? minX : list._aabb[0];
				list._aabb[1] = minY < list._aabb[1] ? minY : list._aabb[1];
				list._aabb[2] = minZ < list._aabb[2] ? minZ : list._aabb[2];
				list._aabb[3] = maxX > list._aabb[3] ? maxX : list._aabb[3];
				list._aabb[4] = maxY > list._aabb[4] ? maxY : list._aabb[4];
				list._aabb[5] = maxZ > list._aabb[5] ? maxZ : list._aabb[5];
				if (list._proxy != null) {
					s.displacement[0] = list._transform._position[0] - list._ptransform._position[0];
					s.displacement[1] = list._transform._position[1] - list._ptransform._position[1];
					s.displacement[2] = list._transform._position[2] - list._ptransform._position[2];

					list._rigidBody._world._broadPhase.moveProxy(list._proxy, list._aabb, list.displacement);
				}
				list = list._next;
			}
		}

		proto.removeShape = function (shape) {
			var prev = shape._prev;
			var next = shape._next;
			if (prev != null) {
				prev._next = next;
			}
			if (next != null) {
				next._prev = prev;
			}
			if (shape == this._shapeList) {
				this._shapeList = this._shapeList._next;
			}
			if (shape == this._shapeListLast) {
				this._shapeListLast = this._shapeListLast._prev;
			}
			shape._next = null;
			shape._prev = null;
			this._numShapes--;
			shape._rigidBody = null;
			if (this._world != null) {
				var _this = this._world;
				_this._broadPhase.destroyProxy(shape._proxy);
				shape._proxy = null;
				shape._id = -1;
				var cl = shape._rigidBody._contactLinkList;
				while (cl != null) {
					var n = cl._next;
					var c = cl._contact;
					if (c._s1 == shape || c._s2 == shape) {
						var _this1 = cl._other;
						_this1._sleeping = false;
						_this1._sleepTime = 0;
						var _this2 = _this._contactManager;
						var prev1 = c._prev;
						var next1 = c._next;
						if (prev1 != null) {
							prev1._next = next1;
						}
						if (next1 != null) {
							next1._prev = prev1;
						}
						if (c == _this2._contactList) {
							_this2._contactList = _this2._contactList._next;
						}
						if (c == _this2._contactListLast) {
							_this2._contactListLast = _this2._contactListLast._prev;
						}
						c._next = null;
						c._prev = null;
						if (c._touching) {
							var cc1 = c._s1._contactCallback;
							var cc2 = c._s2._contactCallback;
							if (cc1 == cc2) {
								cc2 = null;
							}
							if (cc1 != null) {
								cc1.endContact(c);
							}
							if (cc2 != null) {
								cc2.endContact(c);
							}
						}
						var prev2 = c._link1._prev;
						var next2 = c._link1._next;
						if (prev2 != null) {
							prev2._next = next2;
						}
						if (next2 != null) {
							next2._prev = prev2;
						}
						if (c._link1 == c._b1._contactLinkList) {
							c._b1._contactLinkList = c._b1._contactLinkList._next;
						}
						if (c._link1 == c._b1._contactLinkListLast) {
							c._b1._contactLinkListLast = c._b1._contactLinkListLast._prev;
						}
						c._link1._next = null;
						c._link1._prev = null;
						var prev3 = c._link2._prev;
						var next3 = c._link2._next;
						if (prev3 != null) {
							prev3._next = next3;
						}
						if (next3 != null) {
							next3._prev = prev3;
						}
						if (c._link2 == c._b2._contactLinkList) {
							c._b2._contactLinkList = c._b2._contactLinkList._next;
						}
						if (c._link2 == c._b2._contactLinkListLast) {
							c._b2._contactLinkListLast = c._b2._contactLinkListLast._prev;
						}
						c._link2._next = null;
						c._link2._prev = null;
						c._b1._numContactLinks--;
						c._b2._numContactLinks--;
						c._link1._other = null;
						c._link2._other = null;
						c._link1._contact = null;
						c._link2._contact = null;
						c._s1 = null;
						c._s2 = null;
						c._b1 = null;
						c._b2 = null;
						c._touching = false;
						c._cachedDetectorData._clear();
						c._manifold._clear();
						c._detector = null;
						var _this3 = c._contactConstraint;
						_this3._s1 = null;
						_this3._s2 = null;
						_this3._b1 = null;
						_this3._b2 = null;
						_this3._tf1 = null;
						_this3._tf2 = null;
						c._next = _this2._contactPool;
						_this2._contactPool = c;
						_this2._numContacts--;
					}
					cl = n;
				}
				_this._numShapes--;
			}
			this.updateMass();
			var s = this._shapeList;
			while (s != null) {
				var n1 = s._next;
				var dst = s._ptransform;
				var src1 = s._localTransform;
				var src2 = this._ptransform;
				var __tmp__00;
				var __tmp__01;
				var __tmp__02;
				var __tmp__10;
				var __tmp__11;
				var __tmp__12;
				var __tmp__20;
				var __tmp__21;
				var __tmp__22;
				__tmp__00 = src2._rotation[0] * src1._rotation[0] + src2._rotation[1] * src1._rotation[3] + src2._rotation[2] * src1._rotation[6];
				__tmp__01 = src2._rotation[0] * src1._rotation[1] + src2._rotation[1] * src1._rotation[4] + src2._rotation[2] * src1._rotation[7];
				__tmp__02 = src2._rotation[0] * src1._rotation[2] + src2._rotation[1] * src1._rotation[5] + src2._rotation[2] * src1._rotation[8];
				__tmp__10 = src2._rotation[3] * src1._rotation[0] + src2._rotation[4] * src1._rotation[3] + src2._rotation[5] * src1._rotation[6];
				__tmp__11 = src2._rotation[3] * src1._rotation[1] + src2._rotation[4] * src1._rotation[4] + src2._rotation[5] * src1._rotation[7];
				__tmp__12 = src2._rotation[3] * src1._rotation[2] + src2._rotation[4] * src1._rotation[5] + src2._rotation[5] * src1._rotation[8];
				__tmp__20 = src2._rotation[6] * src1._rotation[0] + src2._rotation[7] * src1._rotation[3] + src2._rotation[8] * src1._rotation[6];
				__tmp__21 = src2._rotation[6] * src1._rotation[1] + src2._rotation[7] * src1._rotation[4] + src2._rotation[8] * src1._rotation[7];
				__tmp__22 = src2._rotation[6] * src1._rotation[2] + src2._rotation[7] * src1._rotation[5] + src2._rotation[8] * src1._rotation[8];
				dst._rotation[0] = __tmp__00;
				dst._rotation[1] = __tmp__01;
				dst._rotation[2] = __tmp__02;
				dst._rotation[3] = __tmp__10;
				dst._rotation[4] = __tmp__11;
				dst._rotation[5] = __tmp__12;
				dst._rotation[6] = __tmp__20;
				dst._rotation[7] = __tmp__21;
				dst._rotation[8] = __tmp__22;
				var __tmp__X;
				var __tmp__Y;
				var __tmp__Z;
				__tmp__X = src2._rotation[0] * src1._position[0] + src2._rotation[1] * src1._position[1] + src2._rotation[2] * src1._position[2];
				__tmp__Y = src2._rotation[3] * src1._position[0] + src2._rotation[4] * src1._position[1] + src2._rotation[5] * src1._position[2];
				__tmp__Z = src2._rotation[6] * src1._position[0] + src2._rotation[7] * src1._position[1] + src2._rotation[8] * src1._position[2];
				dst._position[0] = __tmp__X;
				dst._position[1] = __tmp__Y;
				dst._position[2] = __tmp__Z;
				dst._position[0] += src2._position[0];
				dst._position[1] += src2._position[1];
				dst._position[2] += src2._position[2];
				var dst1 = s._transform;
				var src11 = s._localTransform;
				var src21 = this._transform;
				var __tmp__001;
				var __tmp__011;
				var __tmp__021;
				var __tmp__101;
				var __tmp__111;
				var __tmp__121;
				var __tmp__201;
				var __tmp__211;
				var __tmp__221;
				__tmp__001 = src21._rotation[0] * src11._rotation[0] + src21._rotation[1] * src11._rotation[3] + src21._rotation[2] * src11._rotation[6];
				__tmp__011 = src21._rotation[0] * src11._rotation[1] + src21._rotation[1] * src11._rotation[4] + src21._rotation[2] * src11._rotation[7];
				__tmp__021 = src21._rotation[0] * src11._rotation[2] + src21._rotation[1] * src11._rotation[5] + src21._rotation[2] * src11._rotation[8];
				__tmp__101 = src21._rotation[3] * src11._rotation[0] + src21._rotation[4] * src11._rotation[3] + src21._rotation[5] * src11._rotation[6];
				__tmp__111 = src21._rotation[3] * src11._rotation[1] + src21._rotation[4] * src11._rotation[4] + src21._rotation[5] * src11._rotation[7];
				__tmp__121 = src21._rotation[3] * src11._rotation[2] + src21._rotation[4] * src11._rotation[5] + src21._rotation[5] * src11._rotation[8];
				__tmp__201 = src21._rotation[6] * src11._rotation[0] + src21._rotation[7] * src11._rotation[3] + src21._rotation[8] * src11._rotation[6];
				__tmp__211 = src21._rotation[6] * src11._rotation[1] + src21._rotation[7] * src11._rotation[4] + src21._rotation[8] * src11._rotation[7];
				__tmp__221 = src21._rotation[6] * src11._rotation[2] + src21._rotation[7] * src11._rotation[5] + src21._rotation[8] * src11._rotation[8];
				dst1._rotation[0] = __tmp__001;
				dst1._rotation[1] = __tmp__011;
				dst1._rotation[2] = __tmp__021;
				dst1._rotation[3] = __tmp__101;
				dst1._rotation[4] = __tmp__111;
				dst1._rotation[5] = __tmp__121;
				dst1._rotation[6] = __tmp__201;
				dst1._rotation[7] = __tmp__211;
				dst1._rotation[8] = __tmp__221;
				var __tmp__X1;
				var __tmp__Y1;
				var __tmp__Z1;
				__tmp__X1 = src21._rotation[0] * src11._position[0] + src21._rotation[1] * src11._position[1] + src21._rotation[2] * src11._position[2];
				__tmp__Y1 = src21._rotation[3] * src11._position[0] + src21._rotation[4] * src11._position[1] + src21._rotation[5] * src11._position[2];
				__tmp__Z1 = src21._rotation[6] * src11._position[0] + src21._rotation[7] * src11._position[1] + src21._rotation[8] * src11._position[2];
				dst1._position[0] = __tmp__X1;
				dst1._position[1] = __tmp__Y1;
				dst1._position[2] = __tmp__Z1;
				dst1._position[0] += src21._position[0];
				dst1._position[1] += src21._position[1];
				dst1._position[2] += src21._position[2];
				var min;
				var minX;
				var minY;
				var minZ;
				var max;
				var maxX;
				var maxY;
				var maxZ;
				s._geom._computeAabb(s._aabb, s._ptransform);
				minX = s._aabb[0];
				minY = s._aabb[1];
				minZ = s._aabb[2];
				maxX = s._aabb[3];
				maxY = s._aabb[4];
				maxZ = s._aabb[5];
				s._geom._computeAabb(s._aabb, s._transform);
				s._aabb[0] = minX < s._aabb[0] ? minX : s._aabb[0];
				s._aabb[1] = minY < s._aabb[1] ? minY : s._aabb[1];
				s._aabb[2] = minZ < s._aabb[2] ? minZ : s._aabb[2];
				s._aabb[3] = maxX > s._aabb[3] ? maxX : s._aabb[3];
				s._aabb[4] = maxY > s._aabb[4] ? maxY : s._aabb[4];
				s._aabb[5] = maxZ > s._aabb[5] ? maxZ : s._aabb[5];
				if (s._proxy != null) {
					var d;
					var dX;
					var dY;
					var dZ;
					dX = s._transform._position[0] - s._ptransform._position[0];
					dY = s._transform._position[1] - s._ptransform._position[1];
					dZ = s._transform._position[2] - s._ptransform._position[2];
					var v = s.displacement;
					v[0] = dX;
					v[1] = dY;
					v[2] = dZ;
					s._rigidBody._world._broadPhase.moveProxy(s._proxy, s._aabb, s.displacement);
				}
				s = n1;
			}
		}

		proto.wakeUp = function () {
			this._sleeping = false;
			this._sleepTime = 0;
		}

		proto.clear_velocities = function () {
			math.vec3_zero$(this._vel)
			math.vec3_zero$(this._angVel)
		}

		proto.sleep = function () {
			this._sleeping = true;
			this._sleepTime = 0;
		}

		proto.set_position = function (pos) {

			math.vec3_copy$(this._ptransform._position, pos);
			math.vec3_copy$(this._transform._position, pos);
		};

		proto.set_rotation = function (quat) {

			math.mat3_from_quat$(this._transform._rotation, quat);
			math.mat3_from_quat$(this._ptransform._rotation, quat);
		}

		var RigidBody = function (config) {
			this._next = null;
			this._prev = null;
			this._shapeList = null;
			this._shapeListLast = null;
			this._numShapes = 0;
			this._contactLinkList = null;
			this._contactLinkListLast = null;
			this._numContactLinks = 0;
			this._jointLinkList = null;
			this._jointLinkListLast = null;
			this._numJointLinks = 0;
			this.flags = config.flags || 0;
			this._vel = vec3(config.linear_velocity);
			this._angVel = vec3(config.angular_velocity);

			this._pseudoVel = vec3();
			this._angPseudoVel = vec3();
			this._ptransform = new pe.common.Transform(config.position);
			this._transform = new pe.common.Transform(config.position);

			this._type = config.type || 0;
			this._sleepTime = 0;
			this._sleeping = false;
			this._autoSleep = true;
			if (config.autoSleep !== undefined) {
				this._autoSleep = config.autoSleep;
			}

			this._mass = 0;
			this._invMass = 0;

			this._localInertia = mat3();
			this._invLocalInertia = mat3();
			this._invLocalInertiaWithoutRotFactor = mat3();
			this._invInertia = mat3();

			this._linearDamping = 0;
			this._angularDamping = 0;

			this._force = new Float32Array(6);
			this._torque = new Float32Array(this._force.buffer, 12, 3);
			this._rotFactor = vec3(1, 1, 1);
			this._force.fill(0);

			this._addedToIsland = false;
			this._gravityScale = 1;
			this._world = null;

			if (config.shapes) {
				config.shapes.for_each(function (s, i, body) {
					body.addShape(new dynamics.rigidbody.Shape(s));

				}, this);
			}

		}
		return RigidBody;
	});

	dynamics.rigidbody.Shape = pe.define(function (proto) {
		var min = vec3(), max = vec3();
		proto.sync = function (tf1, tf2) {
			if (!this.moveableShape) return;
			pe.transform_mult$(this._ptransform, this._localTransform, tf1);
			pe.transform_mult$(this._transform, this._localTransform, tf2);
			this._geom._computeAabb(this._aabb, this._ptransform);
			math.aabb_decompose$(this._aabb, min, max)
			this._geom._computeAabb(this._aabb, this._transform);
			this._aabb[0] = Math.min(this._aabb[0], min[0]);
			this._aabb[1] = Math.min(this._aabb[1], min[1]);
			this._aabb[2] = Math.min(this._aabb[2], min[2]);
			this._aabb[3] = Math.max(this._aabb[3], max[0]);
			this._aabb[4] = Math.max(this._aabb[4], max[1]);
			this._aabb[5] = Math.max(this._aabb[5], max[2]);
			if (this.proxy !== null) {
				
				math.vec3_subtract$(this.displacement, this._transform._position, this._ptransform._position)
				this._rigidBody._world._broadPhase.moveProxy(this._proxy, this._aabb, this.displacement);
			}
		}

		var Shape = function (config) {
			this._id = -1;
			this._localTransform = new pe.common.Transform(config.position);
			this._ptransform = new pe.common.Transform(config.position);
			this._transform = new pe.common.Transform(config.position);
			this._restitution = config.restitution || pe.common.Setting.defaultRestitution;
			this._friction = config.friction || pe.common.Setting.defaultFriction;
			this._density = config.density || pe.common.Setting.defaultDensity;

			this._geom = config.geometry;
			this._collisionGroup = config.collisionGroup || pe.common.Setting.defaultCollisionGroup;
			this._collisionMask = config.collisionMask || pe.common.Setting.defaultCollisionMask;
			this._contactCallback = config.contactCallback;
			this._aabb = aabb();
			this._proxy = null;
			this.moveableShape = true;
			this.displacement = vec3();
		}
		return Shape;
	});



	dynamics.TimeStep = pe.define(function (proto) {
		return function () {
			this.dt = 0;
			this.invDt = 0;
			this.dtRatio = 1;
		}
	});





	dynamics.constraint.info.contact.ContactSolverInfo = pe.define(function (proto) {
		return function () {
			this.b1 = null;
			this.b2 = null;
			this.numRows = 0;
			var length = pe.common.Setting.maxManifoldPoints;
			var this1 = new Array(length);
			this.rows = this1;
			var _g1 = 0;
			var _g = this.rows.length;
			while (_g1 < _g) {
				var i = _g1++;
				this.rows[i] = new dynamics.constraint.info.contact.ContactSolverInfoRow();
			}
		}
	});

	dynamics.constraint.info.contact.ContactSolverInfoRow = pe.define(function (proto) {
		return function () {
			this.jacobianN = new dynamics.constraint.info.JacobianRow();
			this.jacobianT = new dynamics.constraint.info.JacobianRow();
			this.jacobianB = new dynamics.constraint.info.JacobianRow();
			this.rhs = 0;
			this.cfm = 0;
			this.friction = 0;
			this.impulse = null;
		}
	});

	dynamics.constraint.info.joint.JointSolverInfo = pe.define(function (proto) {
		return function () {
			this.b1 = null;
			this.b2 = null;
			this.numRows = 0;
			var length = pe.common.Setting.maxJacobianRows;
			var this1 = new Array(length);
			this.rows = this1;
			var _g1 = 0;
			var _g = this.rows.length;
			while (_g1 < _g) {
				var i = _g1++;
				this.rows[i] = new dynamics.constraint.info.joint.JointSolverInfoRow();
			}
		}
	});

	dynamics.constraint.info.joint.JointSolverInfoRow = pe.define(function (proto) {
		return function () {
			this.jacobian = new dynamics.constraint.info.JacobianRow();
			this.rhs = 0;
			this.cfm = 0;
			this.minImpulse = 0;
			this.maxImpulse = 0;
			this.motorSpeed = 0;
			this.motorMaxImpulse = 0;
			this.impulse = null;
		}
	});

	dynamics.constraint.joint.JointBasis = pe.define(function (proto) {
		return function (joint) {
			this.joint = joint;
			this.xX = 0;
			this.xY = 0;
			this.xZ = 0;
			this.yX = 0;
			this.yY = 0;
			this.yZ = 0;
			this.zX = 0;
			this.zY = 0;
			this.zZ = 0;
		}
	});

	dynamics.constraint.joint.JointImpulse = pe.define(function (proto) {
		return function () {
			this.impulse = 0;
			this.impulseM = 0;
			this.impulseP = 0;
		}
	});

	dynamics.constraint.joint.JointMacro = pe.define(function (proto) {
		return function () { }
	});



	dynamics.constraint.solver.common.ContactSolverMassDataRow = pe.define(function (proto) {
		return function () {
			this.invMLinN1X = 0;
			this.invMLinN1Y = 0;
			this.invMLinN1Z = 0;
			this.invMLinN2X = 0;
			this.invMLinN2Y = 0;
			this.invMLinN2Z = 0;
			this.invMAngN1X = 0;
			this.invMAngN1Y = 0;
			this.invMAngN1Z = 0;
			this.invMAngN2X = 0;
			this.invMAngN2Y = 0;
			this.invMAngN2Z = 0;
			this.invMLinT1X = 0;
			this.invMLinT1Y = 0;
			this.invMLinT1Z = 0;
			this.invMLinT2X = 0;
			this.invMLinT2Y = 0;
			this.invMLinT2Z = 0;
			this.invMAngT1X = 0;
			this.invMAngT1Y = 0;
			this.invMAngT1Z = 0;
			this.invMAngT2X = 0;
			this.invMAngT2Y = 0;
			this.invMAngT2Z = 0;
			this.invMLinB1X = 0;
			this.invMLinB1Y = 0;
			this.invMLinB1Z = 0;
			this.invMLinB2X = 0;
			this.invMLinB2Y = 0;
			this.invMLinB2Z = 0;
			this.invMAngB1X = 0;
			this.invMAngB1Y = 0;
			this.invMAngB1Z = 0;
			this.invMAngB2X = 0;
			this.invMAngB2Y = 0;
			this.invMAngB2Z = 0;
			this.massN = 0;
			this.massTB00 = 0;
			this.massTB01 = 0;
			this.massTB10 = 0;
			this.massTB11 = 0;
		}
	});

	dynamics.constraint.solver.common.JointSolverMassDataRow = pe.define(function (proto) {
		return function () {
			this.invMLin1X = 0;
			this.invMLin1Y = 0;
			this.invMLin1Z = 0;
			this.invMLin2X = 0;
			this.invMLin2Y = 0;
			this.invMLin2Z = 0;
			this.invMAng1X = 0;
			this.invMAng1Y = 0;
			this.invMAng1Z = 0;
			this.invMAng2X = 0;
			this.invMAng2Y = 0;
			this.invMAng2Z = 0;
			this.mass = 0;
			this.massWithoutCfm = 0;
		}
	});

	dynamics.constraint.solver.direct.BoundaryBuildInfo = pe.define(function (proto) {
		return function (size) {
			this.size = size;
			this.numBounded = 0;
			var this1 = new Array(size);
			this.iBounded = this1;
			var this2 = new Array(size);
			this.signs = this2;
			this.numUnbounded = 0;
			var this3 = new Array(size);
			this.iUnbounded = this3;
		}
	});

	dynamics.rigidbody.MassData = pe.define(function (proto) {
		return function () {
			this.mass = 0;
			this.localInertia = mat3();
		}
	});


	//RigidBodyType
	dynamics.rigidbody.RigidBodyType = {
		DYNAMIC: 0,
		STATIC: 1,
		KINEMATIC: 2

	};


	dynamics.rigidbody.RigidBodyFalgs = {
		DONOTMOVE: 2,
		DOTONROTATE: 4

	};

	dynamics.constraint.solver.ConstraintSolverType = {
		ITERATIVE: 0,
		DIRECT: 1
	};

	dynamics.constraint.joint.JointType = {
		SPHERICAL: 0,
		REVOLUTE: 1,
		CYLINDRICAL: 2,
		PRISMATIC: 3,
		UNIVERSAL: 4,
		RAGDOLL: 5
	};

	dynamics.common.Performance = {
		broadPhaseCollisionTime: 0,
		narrowPhaseCollisionTime: 0,
		dynamicsTime: 0,
		totalTime: 0
	};

	dynamics.constraint.PositionCorrectionAlgorithm = {
		BAUMGARTE: 0,
		SPLIT_IMPULSE: 1,
		NGS: 2
	};






	dynamics.Contact.count = 0;


	pe.dynamics = dynamics;
}