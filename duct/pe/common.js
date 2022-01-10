function ps_common(fin, pe,  math ) { 
 
	var vec3 = math.vec3, aabb = math.aabb, mat3 = math.mat3, quat = math.quat;
	var common = {};



	common.Transform = pe.define(function (proto) {
		proto.identity = function () {
			vec3.set(this._position, 0, 0, 0);
			mat3.identity(this._rotation);
			return this;
		}

		var Transform = function (position, rotation) {
			this._position = vec3(position);
			this._rotation = mat3(rotation);
			this._quat = quat();
		}







		return Transform;
	});


	common.Setting = {
		defaultFriction: 0.4,
		defaultRestitution: 0.2,
		defaultDensity: 1,
		defaultCollisionGroup: 1,
		defaultCollisionMask: 1,
		maxTranslationPerStep: 10,
		maxRotationPerStep: 3.14159265358979,
		bvhProxyPadding: 0.1,
		bvhIncrementalCollisionThreshold: 0.145,
		defaultGJKMargin: 0.025,
		enableGJKCaching: false,
		maxEPAVertices: 128,
		maxEPAPolyhedronFaces: 128,
		contactEnableBounceThreshold: 0.5,
		velocityBaumgarte: 0.2,
		positionSplitImpulseBaumgarte: 0.4,
		positionNgsBaumgarte: 1.0,
		contactUseAlternativePositionCorrectionAlgorithmDepthThreshold: 0.05,
		defaultContactPositionCorrectionAlgorithm: 0,
		alternativeContactPositionCorrectionAlgorithm: 1,
		contactPersistenceThreshold: 0.05,
		maxManifoldPoints: 4,
		defaultJointConstraintSolverType: 0,
		defaultJointPositionCorrectionAlgorithm: 0,
		jointWarmStartingFactorForBaungarte: 0.8,
		jointWarmStartingFactor: 0.95,
		minSpringDamperDampingRatio: 1e-6,
		minRagdollMaxSwingAngle: 1e-6,
		maxJacobianRows: 6,
		directMlcpSolverEps: 1e-9,
		islandInitialRigidBodyArraySize: 128,
		islandInitialConstraintArraySize: 128,
		sleepingVelocityThreshold: 0.2,
		sleepingAngularVelocityThreshold: 0.15,
		sleepingTimeThreshold: 1.0,
		disableSleeping: false,
		linearSlop: 0.005,
		angularSlop: 0.017453292519943278
	};


	
	pe.common = common;
}