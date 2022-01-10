function pe(fin,  math ) {  
	dependencies([	
		['math', '/libs/math.js']
	]);

  function before_load(fin, done) {
		fin.modules['pe'] = this;

		fin.module_loader(this, [			
			'common.js',
			'collision.js',
			'dynamics.js',
			'physics_system.js',
    ], this.path, done);

  }

	var pe = this;
	pe.define = fin.define;
	pe.guidi = fin.guidi;


}