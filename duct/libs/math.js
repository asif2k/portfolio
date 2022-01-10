function index(fin) {
  var math = this;

  function before_load(fin, done) {
    fin.modules['math'] = this;
    var constants = {};
    Object.assign(constants, {
      DEGTORAD: 0.017453292519943295,
      RADTODEG: 57.295779513082323
    });

    fin.traverse_object(constants, function (k, v) {
      fin.add_constant('math.' + k, v);
    });
    fin.sort_constants();
    Object.assign(this, constants);
    this.str_constants = JSON.stringify(constants);
    done();
  }

  /*STR_CONSTANTS*/

  this.module_export_code = function () {

    this.byte_code = this.byte_code.replace("/*STR_CONSTANTS*/", 'Object.assign(this,' + this.str_constants + ');');

  }


  math.vec2 = fin.create_float32(2);
  math.vec3 = fin.create_float32(3);
  math.vec4 = fin.create_float32(4);
  math.utils = {};

  math.utils.get_bias = function (time, bias) {
    return (time / ((((1.0 / bias) - 2.0) * (1.0 - time)) + 1.0));
  };

  math.utils.get_gain = function (time, gain) {
    if (time < 0.5)
      return this.get_bias(time * 2.0, gain) / 2.0;
    else
      return this.get_bias(time * 2.0 - 1.0, 1.0 - gain) / 2.0 + 0.5;
  }

  math.vec3.pool = new fin.object_pooler(function () {
    return math.vec3();
  });


  math.mat3 = fin.create_float32(9, function (out) {
    out[0] = 1;
    out[4] = 1;
    out[8] = 1;
    return out;
  });

  math.mat4 = fin.create_float32(16, function (out) {
    out[0] = 1;
    out[5] = 1;
    out[10] = 1;
    out[15] = 1;
    return out;
  });

  math.quat = fin.create_float32(4, function (out) {
    out[3] = 1;
    return out;
  });


  math.dquat = fin.create_float32(8, function (out) {
    out[3] = 1;
    return out;
  });

  math.aabb = fin.create_float32(6);


  //vec3
  fin.macro_scope(function (scope, $i, $j, $x, $y, $z,$w, $qx, $qy, $qz, $qw, $A, $uvx, $uvy, $uvz, $uuvx, $uuvy, $uuvz,$mat) {



    math.vec3.set = fin.macro(function vec3_set(v$, x$, y$, z$) {
      v$[0] = x$; v$[1] = y$; v$[2] = z$;
    }, math);

    math.vec3.zero = fin.macro(function vec3_zero(v$) {
      v$[0] = 0; v$[1] = 0; v$[2] = 0;
    }, math);


    fin.macro(function vec3_decompose(v$, x$, y$, z$) {
      x$ = v$[0]; y$ = v$[1]; z$ = v$[2];
    }, math);


    fin.macro(function vec3_length_sqr(a$) {
      a$[0] * a$[0] + a$[1] * a$[1] + a$[2] * a$[2];
    }, math);

    fin.macro(function vec3_length(a$) {
      Math.abs(Math.sqrt(a$[0] * a$[0] + a$[1] * a$[1] + a$[2] * a$[2]));
    }, math);



    math.vec3.length_sq = function (a) {
      return (a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    };


    math.vec3.get_length = function (a) {
      return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    };

    math.vec3.negate = fin.macro(function vec3_negate(v$) {
      v$[0] = -v$[0]; v$[1] = -v$[1]; v$[2] = -v$[2];
    }, math);


    math.vec3.calc_distance = function calc_distance(x0, y0, z0, x1, y1, z1) {
      x1 = (x1 - x0);
      y1 = (y1 - y0);
      z1 = (z1 - z0);
      return Math.abs(Math.sqrt(x1 * x1 + y1 * y1 + z1 * z1));
    };



    math.vec3.normalize = fin.macro(function vec3_normalize(out$, a$) {
      $x = a$[0] * a$[0] + a$[1] * a$[1] + a$[2] * a$[2];
      if ($x > 0) {
        $x = 1 / Math.sqrt($x);
      }
      out$[0] = a$[0] * $x; out$[1] = a$[1] * $x; out$[2] = a$[2] * $x;
    }, math, scope);

    math.vec3.transform_quat = fin.macro(function vec3_transform_quat(out$, a$, q$) {

      $x = a$[0]; $y = a$[1]; $z = a$[2];
      $qx = q$[0]; $qy = q$[1]; $qz = q$[2]; $qw = q$[3];


      $uvx = $qy * $z - $qz * $y;
      $uvy = $qz * $x - $qx * $z;
      $uvz = $qx * $y - $qy * $x;


      $uuvx = $qy * $uvz - $qz * $uvy;
      $uuvy = $qz * $uvx - $qx * $uvz;
      $uuvz = $qx * $uvy - $qy * $uvx;

      
      $A = $qw * 2;
      $uvx *= $A;
      $uvy *= $A;
      $uvz *= $A;

      $uuvx *= 2;
      $uuvy *= 2;
      $uuvz *= 2;

      out$[0] = $x + $uvx + $uuvx;
      out$[1] = $y + $uvy + $uuvy;
      out$[2] = $z + $uvz + $uuvz;



    }, math, scope);





    math.vec3.copy = fin.macro(function vec3_copy(out$, v$) {
      out$[0] = v$[0]; out$[1] = v$[1]; out$[2] = v$[2];
    }, math);

    math.vec3.scale = fin.macro(function vec3_scale(out$, v$, s$) {
      out$[0] = v$[0] * s$; out$[1] = v$[1] * s$; out$[2] = v$[2] * s$;
    }, math);


    math.vec3.scale_add = fin.macro(function vec3_scale_add(out$, a$, b$, s$) {
      out$[0] = a$[0] + b$[0] * s$; out$[1] = a$[1] + b$[1] * s$; out$[2] = a$[2] + b$[2] * s$;
    }, math);



    math.vec3.cross = fin.macro(function vec3_cross(out$, a$, b$) {
      out$[0] = a$[1] * b$[2] - a$[2] * b$[1];
      out$[1] = a$[2] * b$[0] - a$[0] * b$[2];
      out$[2] = a$[0] * b$[1] - a$[1] * b$[0];
    }, math);


    math.vec3.transform_mat4 = fin.macro(function vec3_transform_mat4(out$, a$, m$) {
      $x = a$[0]; $y = a$[1]; $z = a$[2];
      $w = 1 / (m$[3] * $x + m$[7] * $y + m$[11] * $z + m$[15]);
      $mat = m$;
      out$[0] = (($mat[0] * $x + $mat[4] * $y + $mat[8] * $z) + $mat[12]) * $w;
      out$[1] = (($mat[1] * $x + $mat[5] * $y + $mat[9] * $z) + $mat[13]) * $w;
      out$[2] = (($mat[2] * $x + $mat[6] * $y + $mat[10] * $z) + $mat[14]) * $w;
    }, math, scope);


    math.vec3.transform_mat3 = fin.macro(function vec3_transform_mat3(out$, a$, m$) {
      $x = a$[0]; $y = a$[1]; $z = a$[2];
      $mat = m$;

      out$[0] = $x * $mat[0] + $y * $mat[3] + $z * $mat[6];
      out$[1] = $x * $mat[1] + $y * $mat[4] + $z * $mat[7];
      out$[2] = $x * $mat[2] + $y * $mat[5] + $z * $mat[8];
    }, math, scope);


    math.vec3.transform_mat4x = fin.macro(function vec3_transform_mat4x(out$, vx$, vy$, vz$, m$) {
      $x = vx$; $y = vy$; $z = vz$;
      $w = 1 / (m$[3] * $x + m$[7] * $y + m$[11] * $z + m$[15]);

      out$[0] = ((m$[0] * $x + m$[4] * $y + m$[8] * $z) + m$[12]) * $w;
      out$[1] = ((m$[1] * $x + m$[5] * $y + m$[9] * $z) + m$[13]) * $w;
      out$[2] = ((m$[2] * $x + m$[6] * $y + m$[10] * $z) + m$[14]) * $w;
    }, math, scope);


    math.vec3.add = fin.macro(function vec3_add(out$, a$, b$) {
      out$[0] = a$[0] + b$[0]; out$[1] = a$[1] + b$[1]; out$[2] = a$[2] + b$[2];
    }, math);

    math.vec3.subtract = fin.macro(function vec3_subtract(out$, a$, b$) {
      out$[0] = a$[0] - b$[0]; out$[1] = a$[1] - b$[1]; out$[2] = a$[2] - b$[2];
    }, math);


    math.vec3.multiply = fin.macro(function vec3_multiply(out$, a$, b$) {
      out$[0] = a$[0] * b$[0]; out$[1] = a$[1] * b$[1]; out$[2] = a$[2] * b$[2];
    }, math);


    math.vec3.dot = function (a,b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    };


  }, "math.vec3");

  //vec4
  fin.macro_scope(function (scope) {

    math.vec4.set = fin.macro(function vec4_set(v$, x$, y$, z$,w$) {
      v$[0] = x$; v$[1] = y$; v$[2] = z$; v$[3] = w$;
    }, math);


    math.vec4.copy = fin.macro(function vec4_copy(out$, v$) {
      out$[0] = v$[0]; out$[1] = v$[1]; out$[2] = v$[2]; out$[3] = v$[3];
    }, math);
    


  }, "math.vec4");



  //mat3
  fin.macro_scope(function (scope, $bx, $by, mat1$, mat2$, mat3$, $a00, $a01, $a02, $a03, $a10, $a11, $a12, $a20, $a21, $a22, $b00, $b01, $b02, $b10, $b11, $b12, $b20, $b21, $b22) {

    

    math.mat3.translate_rotate_scale = fin.macro(function mat3_translate_rotate_scale(out$, x$, y$, sx$, sy$, rad$) {
      $bx = Math.sin(rad$);
      $by = Math.cos(rad$);

      out$[0] = ($by * 1 + $bx * 0) * sx$;
      out$[1] = ($by * 0 + $bx * 1) * sx$;
      out$[2] = ($by * 0 + $bx * 0) * sx$;

      out$[3] = ($by * 0 - $bx * 1) * sy$;
      out$[4] = ($by * 1 - $bx * 0) * sy$;
      out$[5] = ($by * 0 - $bx * 0) * sy$;

      out$[6] = x$ * out$[0] + y$ * out$[3];
      out$[7] = x$ * out$[1] + y$ * out$[4];
      out$[8] = x$ * out$[2] + y$ * out$[5];


    }, math, scope);


    math.mat3.from_quat = fin.macro(function mat3_from_quat(out$, q$) {


      $a00 = q$[0];
      $a01 = q$[1];
      $a02 = q$[2];
      $a03 = q$[3];

      $b00 = $a00 + $a00;
      $b01 = $a01 + $a01;
      $b02 = $a02 + $a02;

      $a10  = $a00 * $b00;
      $a11  = $a01 * $b00;
      $a12  = $a01 * $b01;

      $a20  = $a02 * $b00;
      $a21  = $a02 * $b01;
      $a22  = $a02 * $b02;

      $b10  = $a03 * $b00;
      $b11  = $a03 * $b01;
      $b11  = $a03 * $b02;

      out$[0] = 1 - $a12 - $a22;
      out$[3] = $a11 - $b11;
      out$[6] = $a20 + $b11;

      out$[1] = $a11 + $b11;
      out$[4] = 1 - $a10 - $a22;
      out$[7] = $a21 - $b10;

      out$[2] = $a20 - $b11;
      out$[5] = $a21 + $b10;
      out$[8] = 1 - $a10 - $a12;




    }, math, scope);

    math.mat3.copy = fin.macro(function mat3_copy(out$, a$) {      
      out$[0] = a$[0];
      out$[1] = a$[1];
      out$[2] = a$[2];
      out$[3] = a$[3];
      out$[4] = a$[4];
      out$[5] = a$[5];
      out$[6] = a$[6];
      out$[7] = a$[7];
      out$[8] = a$[8];
    }, math, scope);


  
    math.mat3.set_diagonal = fin.macro(function mat3_set_diagonal(out$, x$,y$,z$) {
      out$[0] = x$;
      out$[4] = y$;
      out$[8] = z$;

    }, math, scope);

    math.mat3.mult = fin.macro(function mat3_mult(out$,a$, b$) {

      mat1$ = out$;
      mat2$ = a$;
      mat3$ = b$;

      $a00 = mat2$[0]; $a01 = mat2$[1]; $a02 = mat2$[2];
      $a10 = mat2$[3]; $a11 = mat2$[4]; $a12 = mat2$[5];
      $a20 = mat2$[6]; $a21 = mat2$[7]; $a22 = mat2$[8];
      $b00 = mat3$[0]; $b01 = mat3$[1]; $b02 = mat3$[2];
      $b10 = mat3$[3]; $b11 = mat3$[4]; $b12 = mat3$[5];
      $b20 = mat3$[6]; $b21 = mat3$[7]; $b22 = mat3$[8];


      mat1$[0] = $b00 * $a00 + $b01 * $a10 + $b02 * $a20;
      mat1$[1] = $b00 * $a01 + $b01 * $a11 + $b02 * $a21;
      mat1$[2] = $b00 * $a02 + $b01 * $a12 + $b02 * $a22;

      mat1$[3] = $b10 * $a00 + $b11 * $a10 + $b12 * $a20;
      mat1$[4] = $b10 * $a01 + $b11 * $a11 + $b12 * $a21;
      mat1$[5] = $b10 * $a02 + $b11 * $a12 + $b12 * $a22;

      mat1$[6] = $b20 * $a00 + $b21 * $a10 + $b22 * $a20;
      mat1$[7] = $b20 * $a01 + $b21 * $a11 + $b22 * $a21;
      mat1$[8] = $b20 * $a02 + $b21 * $a12 + $b22 * $a22;
    }, math, scope);



  }, "math.mat3");


  //mat4
  fin.macro_scope(function (scope, $a00, $a01, $a02, $a03, $a04, $a05, $a06, $a07, $a08, $a09, $a10, $a11, $a12, $a13, $a20, $a21, $a22, $a23, $a30, $a31, $a32, $a33, $det, $b00, $b01, $b02, $b03, $b04, $b05, $b06, $b07, $b08, $b09, $b10,$b11, $mat1, $mat2, $mat3, $vec1) {




    math.mat4.identity = fin.macro(function mat4_identity(out$) {
      out$.fill(0); out$[0] = 1; out$[5] = 1; out$[10] = 1; out$[15] = 1;
    }, math, scope);

    math.mat4.perspective = fin.macro(function mat4_perspective(out$, fovy$, aspect$, near$, far$) {
      $mat1 = out$;

      $a00 = 1.0 / Math.tan(fovy$ / 2);
      $mat1[0] = $a00 / aspect$;
      $mat1[1] = 0;
      $mat1[2] = 0;
      $mat1[3] = 0;
      $mat1[4] = 0;
      $mat1[5] = $a00;
      $mat1[6] = 0;
      $mat1[7] = 0;
      $mat1[8] = 0;
      $mat1[9] = 0;
      $mat1[11] = -1;
      $mat1[12] = 0;
      $mat1[13] = 0;
      $mat1[15] = 0;
      if (far$ != null && far$ !== Infinity) {
        $a00 = 1 / (near$ - far$);
        $mat1[10] = (far$ + near$) * $a00;
        $mat1[14] = (2 * far$ * near$) * $a00;
      } else {
        $mat1[10] = -1;
        $mat1[14] = -2 * near$;
      }
    }, math, scope);


    math.mat4.ortho = fin.macro(function mat4_ortho(out$, left$, right$, bottom$, top$, near$, far$) {

      $mat1 = out$;

      $a00 = 1 / (left$ - right$);
      $a01 = 1 / (bottom$ - top$);
      $a02 = 1 / (near$ - far$);
      $mat1[0] = -2 * $a00;
      $mat1[1] = 0; $mat1[2] = 0; $mat1[3] = 0; $mat1[4] = 0;
      $mat1[6] = 0; $mat1[7] = 0; $mat1[8] = 0; $mat1[9] = 0;
      $mat1[5] = -2 * $a01;
      $mat1[10] = 2 * $a02;
      $mat1[11] = 0;
      $mat1[12] = (left$ + right$) * $a00;
      $mat1[13] = (top$ + bottom$) * $a01;
      $mat1[14] = (far$ + near$) * $a02;
      $mat1[15] = 1;
    }, math, scope);





    math.mat4.inverse = fin.macro(function mat4_inverse(out$, a$) {

      $mat1 = out$;
      $mat2 = a$;


      $a00 = $mat2[0]; $a01 = $mat2[1]; $a02 = $mat2[2]; $a03 = $mat2[3];
      $a10 = $mat2[4]; $a11 = $mat2[5]; $a12 = $mat2[6]; $a13 = $mat2[7];
      $a20 = $mat2[8]; $a21 = $mat2[9]; $a22 = $mat2[10]; $a23 = $mat2[11];
      $a30 = $mat2[12]; $a31 = $mat2[13]; $a32 = $mat2[14]; $a33 = $mat2[15];


      $b00 = $a00 * $a11 - $a01 * $a10;
      $b01 = $a00 * $a12 - $a02 * $a10;
      $b02 = $a00 * $a13 - $a03 * $a10;
      $b03 = $a01 * $a12 - $a02 * $a11;
      $b04 = $a01 * $a13 - $a03 * $a11;
      $b05 = $a02 * $a13 - $a03 * $a12;
      $b06 = $a20 * $a31 - $a21 * $a30;
      $b07 = $a20 * $a32 - $a22 * $a30;
      $b08 = $a20 * $a33 - $a23 * $a30;
      $b09 = $a21 * $a32 - $a22 * $a31;
      $b10 = $a21 * $a33 - $a23 * $a31;
      $b11 = $a22 * $a33 - $a23 * $a32;

      $det = $b00 * $b11 - $b01 * $b10 + $b02 * $b09 + $b03 * $b08 - $b04 * $b07 + $b05 * $b06;

      if ($det) {
        $det = 1.0 / $det;

        $mat1[0] = ($a11 * $b11 - $a12 * $b10 + $a13 * $b09) * $det;
        $mat1[1] = ($a02 * $b10 - $a01 * $b11 - $a03 * $b09) * $det;
        $mat1[2] = ($a31 * $b05 - $a32 * $b04 + $a33 * $b03) * $det;
        $mat1[3] = ($a22 * $b04 - $a21 * $b05 - $a23 * $b03) * $det;
        $mat1[4] = ($a12 * $b08 - $a10 * $b11 - $a13 * $b07) * $det;
        $mat1[5] = ($a00 * $b11 - $a02 * $b08 + $a03 * $b07) * $det;
        $mat1[6] = ($a32 * $b02 - $a30 * $b05 - $a33 * $b01) * $det;
        $mat1[7] = ($a20 * $b05 - $a22 * $b02 + $a23 * $b01) * $det;
        $mat1[8] = ($a10 * $b10 - $a11 * $b08 + $a13 * $b06) * $det;
        $mat1[9] = ($a01 * $b08 - $a00 * $b10 - $a03 * $b06) * $det;
        $mat1[10] = ($a30 * $b04 - $a31 * $b02 + $a33 * $b00) * $det;
        $mat1[11] = ($a21 * $b02 - $a20 * $b04 - $a23 * $b00) * $det;
        $mat1[12] = ($a11 * $b07 - $a10 * $b09 - $a12 * $b06) * $det;
        $mat1[13] = ($a00 * $b09 - $a01 * $b07 + $a02 * $b06) * $det;
        $mat1[14] = ($a31 * $b01 - $a30 * $b03 - $a32 * $b00) * $det;
        $mat1[15] = ($a20 * $b03 - $a21 * $b01 + $a22 * $b00) * $det;
      }



    }, math, scope);

    math.mat4.transpose = fin.macro(function mat4_transpose(out$, a$) {

      out$[1] = a$[4];
      out$[2] = a$[8];
      out$[3] = a$[12];
      out$[4] = a$[1];
      out$[6] = a$[9];
      out$[7] = a$[13];
      out$[8] = a$[2];
      out$[9] = a$[6];
      out$[11] = a$[14];
      out$[12] = a$[3];
      out$[13] = a$[7];
      out$[14] = a$[11];

    }, math, scope);


    math.mat4.from_quat = fin.macro(function mat4_from_quat(out$, q$) {

      $mat1 = out$;
      $vec1 = q$;

      $a00 = $vec1[0]; $a01 = $vec1[1]; $a02 = $vec1[2]; $a03 = $vec1[3];
      $a05 = $a00 + $a00; $a06 = $a01 + $a01; $a07 = $a02 + $a02;

      $b00 = $a00 * $a05;
      $b01 = $a00 * $a06;
      $b02 = $a00 * $a07;
      $b03 = $a01 * $a06;
      $b04 = $a01 * $a07;
      $b05 = $a02 * $a07;
      $b06 = $a03 * $a05;
      $b07 = $a03 * $a06;
      $b08 = $a03 * $a07;


      $mat1[0] = (1 - ($b03 + $b05));
      $mat1[1] = ($b01 + $b08);
      $mat1[2] = ($b02 - $b07);
      $mat1[3] = 0;
      $mat1[4] = ($b01 - $b08);
      $mat1[5] = (1 - ($b00 + $b05));
      $mat1[6] = ($b04 + $b06);
      $mat1[7] = 0;
      $mat1[8] = ($b02 + $b07);
      $mat1[9] = ($b04 - $b06);
      $mat1[10] = (1 - ($b00 + $b03));
      $mat1[11] = 0;

    }, math, scope);




    math.mat4.scale = fin.macro(function mat4_scale(out$, scale$) {

      $mat1 = out$;
      $vec1 = scale$;


      $mat1[0] *= $vec1[0];
      $mat1[1] *= $vec1[0];
      $mat1[2] *= $vec1[0];
      $mat1[3] *= $vec1[0];

      $mat1[4] *= $vec1[1];
      $mat1[5] *= $vec1[1];
      $mat1[6] *= $vec1[1];
      $mat1[7] *= $vec1[1];


      $mat1[8] *= $vec1[2];
      $mat1[9] *= $vec1[2];
      $mat1[10] *= $vec1[2];
      $mat1[11] *= $vec1[2];

    }, math, scope);


    math.mat4.multiply= fin.macro(function mat4_multiply(out$, a$, b$) {

      $mat1 = out$;
      $mat2 = a$;
      $mat3 = b$;


      $a00 = $mat2[0]; $a01 = $mat2[1]; $a02 = $mat2[2]; $a03 = $mat2[3];
      $a10 = $mat2[4]; $a11 = $mat2[5]; $a12 = $mat2[6]; $a13 = $mat2[7];
      $a20 = $mat2[8]; $a21 = $mat2[9]; $a22 = $mat2[10]; $a23 = $mat2[11];
      $a30 = $mat2[12]; $a31 = $mat2[13]; $a32 = $mat2[14]; $a33 = $mat2[15];


      $b00 = $mat3[0]; $b01 = $mat3[1]; $b02 = $mat3[2]; $b03 = $mat3[3];
      $mat1[0] = $b00 * $a00 + $b01 * $a10 + $b02 * $a20 + $b03 * $a30;
      $mat1[1] = $b00 * $a01 + $b01 * $a11 + $b02 * $a21 + $b03 * $a31;
      $mat1[2] = $b00 * $a02 + $b01 * $a12 + $b02 * $a22 + $b03 * $a32;
      $mat1[3] = $b00 * $a03 + $b01 * $a13 + $b02 * $a23 + $b03 * $a33;

      $b00 = $mat3[4]; $b01 = $mat3[5]; $b02 = $mat3[6]; $b03 = $mat3[7];
      $mat1[4] = $b00 * $a00 + $b01 * $a10 + $b02 * $a20 + $b03 * $a30;
      $mat1[5] = $b00 * $a01 + $b01 * $a11 + $b02 * $a21 + $b03 * $a31;
      $mat1[6] = $b00 * $a02 + $b01 * $a12 + $b02 * $a22 + $b03 * $a32;
      $mat1[7] = $b00 * $a03 + $b01 * $a13 + $b02 * $a23 + $b03 * $a33;

      $b00 = $mat3[8]; $b01 = $mat3[9]; $b02 = $mat3[10]; $b03 = $mat3[11];
      $mat1[8] = $b00 * $a00 + $b01 * $a10 + $b02 * $a20 + $b03 * $a30;
      $mat1[9] = $b00 * $a01 + $b01 * $a11 + $b02 * $a21 + $b03 * $a31;
      $mat1[10] = $b00 * $a02 + $b01 * $a12 + $b02 * $a22 + $b03 * $a32;
      $mat1[11] = $b00 * $a03 + $b01 * $a13 + $b02 * $a23 + $b03 * $a33;

      $b00 = $mat3[12]; $b01 = $mat3[13]; $b02 = $mat3[14]; $b03 = $mat3[15];
      $mat1[12] = $b00 * $a00 + $b01 * $a10 + $b02 * $a20 + $b03 * $a30;
      $mat1[13] = $b00 * $a01 + $b01 * $a11 + $b02 * $a21 + $b03 * $a31;
      $mat1[14] = $b00 * $a02 + $b01 * $a12 + $b02 * $a22 + $b03 * $a32;
      $mat1[15] = $b00 * $a03 + $b01 * $a13 + $b02 * $a23 + $b03 * $a33;

    }, math, scope);

    math.mat4.copy = fin.macro(function mat4_copy(out$, a$) {
      $mat1 = out$;
      $mat2 = a$;

      $mat1[0] = $mat2[0];
      $mat1[1] = $mat2[1];
      $mat1[2] = $mat2[2];
      $mat1[3] = $mat2[3];
      $mat1[4] = $mat2[4];
      $mat1[5] = $mat2[5];
      $mat1[6] = $mat2[6];
      $mat1[7] = $mat2[7];
      $mat1[8] = $mat2[8];
      $mat1[9] = $mat2[9];
      $mat1[10] = $mat2[10];
      $mat1[11] = $mat2[11];
      $mat1[12] = $mat2[12];
      $mat1[13] = $mat2[13];
      $mat1[14] = $mat2[14];
      $mat1[15] = $mat2[15];
    }, math, scope);


    /*
     0  1  2  3
     4  5  6  7
     8  9  10 11
     12 13 14 15     
     */ 

    math.mat4.from_mat3 = fin.macro(function mat4_from_mat3(out$, a$) {
      $mat1 = out$;
      $mat2 = a$;

      $mat1[0] = $mat2[0];
      $mat1[1] = $mat2[1];
      $mat1[2] = $mat2[2];

      $mat1[4] = $mat2[3];
      $mat1[5] = $mat2[4];
      $mat1[6] = $mat2[5];

      $mat1[8] = $mat2[6];
      $mat1[9] = $mat2[7];
      $mat1[10] = $mat2[8];

    }, math, scope);


    math.mat4.get_scaling = function (out, mat) {
      out[0] = Math.hypot(mat[0], mat[1], mat[2]);
      out[1] = Math.hypot(mat[4], mat[5], mat[6]);
      out[2] = Math.hypot(mat[8], mat[9], mat[10]);
      return out;
    };

    math.mat4.get_translation = function (out, mat) {
      out[0] = mat[12];
      out[1] = mat[13];
      out[2] = mat[14];

      return out;
    };

    var v31 = math.vec3();

    var is1, is2, is3, sm11, sm12, sm13, sm21, sm22, sm23, sm31, sm32, sm33, trace,S;

    math.mat4.get_rotation = function (out, mat) {
      this.get_scaling(v31, mat);
      is1 = 1 / v31[0];
      is2 = 1 / v31[1];
      is3 = 1 / v31[2];

      sm11 = mat[0] * is1;
      sm12 = mat[1] * is2;
      sm13 = mat[2] * is3;
      sm21 = mat[4] * is1;
      sm22 = mat[5] * is2;
      sm23 = mat[6] * is3;
      sm31 = mat[8] * is1;
      sm32 = mat[9] * is2;
      sm33 = mat[10] * is3;

      trace = sm11 + sm22 + sm33;
      S = 0;
      if (trace > 0) {
        S = Math.sqrt(trace + 1.0) * 2;
        out[3] = 0.25 * S;
        out[0] = (sm23 - sm32) / S;
        out[1] = (sm31 - sm13) / S;
        out[2] = (sm12 - sm21) / S;
      } else if (sm11 > sm22 && sm11 > sm33) {
        S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
        out[3] = (sm23 - sm32) / S;
        out[0] = 0.25 * S;
        out[1] = (sm12 + sm21) / S;
        out[2] = (sm31 + sm13) / S;
      } else if (sm22 > sm33) {
        S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
        out[3] = (sm31 - sm13) / S;
        out[0] = (sm12 + sm21) / S;
        out[1] = 0.25 * S;
        out[2] = (sm23 + sm32) / S;
      } else {
        S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
        out[3] = (sm12 - sm21) / S;
        out[0] = (sm31 + sm13) / S;
        out[1] = (sm23 + sm32) / S;
        out[2] = 0.25 * S;
      }

      return out;
    };


  }, "math.mat4");

  //aabb
  fin.macro_scope(function (scope, $i,  $j, $x, $y, $z) {
    math.aabb.set = fin.macro(function aabb_set(out$, minx$, miny$, minz$, maxx$, maxy$, maxz$) {
      out$[0] = minx$; out$[1] = miny$; out$[2] = minz$;
      out$[3] = maxx$; out$[4] = maxy$; out$[5] = maxz$;
    }, math, scope);

    math.aabb.transform_mat4 = fin.macro(function aabb_transform_mat4(out$, a$,m$) {

      for ($i = 0; $i < 3; $i++) {
        out$[$i] = m$[12 + $i];
        out$[$i + 3] = m$[12 + $i];
        for ($j = 0; $j < 3; $j++) {
          $z = m$[($j * 3 + $i) + $j];
          $x = $z * a$[$j];
          $y = $z * a$[$j + 3];
          if ($x < $y) {
            out$[$i] += $x;
            out$[$i + 3] += $y;
          }
          else {
            out$[$i] += $y;
            out$[$i + 3] += $x;
          }
        }
      }

    }, math, scope);



    math.aabb.decompose = fin.macro(function aabb_decompose(ab$, min$, max$) {
      min$[0] = ab$[0]
      min$[1] = ab$[1]
      min$[2] = ab$[2]

      max$[0] = ab$[3];
      max$[1] = ab$[4];
      max$[2] = ab$[5];
    }, math, scope);


    function $$AABB_DECOMPOSE(ab$, min$, max$) {
      min$[0] = ab$[0]
      min$[1] = ab$[1]
      min$[2] = ab$[2]

      max$[0] = ab$[3];
      max$[1] = ab$[4];
      max$[2] = ab$[5];
    }



  },"math.aabb");

  //quat
  fin.macro_scope(function (scope, $qX, $qY, $qZ, $qW, $dqX, $dqY, $dqZ, $dqW, $qLen, mat1$, $quat1, $quat2, $quat3, $cosom, $omega, $sinom, $scale0, $scale1) {

    math.quat.mult = fin.macro(function quat_mult(out$, a$, b$) {
      $quat1 = out$;
      $quat2 = a$;
      $quat3 = b$;


      $qX = $quat2[0]; $qY = $quat2[1]; $qZ = $quat2[2]; $qW = $quat2[3];

      $dqX = $quat3[0]; $dqY = $quat3[1]; $dqZ = $quat3[2]; $dqW = $quat3[3];

      $quat1[0] = $qX * $dqW + $qW * $dqX + $qY * $dqZ - $qZ * $dqY;
      $quat1[1] = $qY * $dqW + $qW * $dqY + $qZ * $dqX - $qX * $dqZ;
      $quat1[2] = $qZ * $dqW + $qW * $dqZ + $qX * $dqY - $qY * $dqX;
      $quat1[3] = $qW * $dqW - $qX * $dqX - $qY * $dqY - $qZ * $dqZ;

    }, math, scope);




    math.quat.copy = fin.macro(function quat_copy(out$, a$) {
      out$[0] = a$[0];out$[1] = a$[1];out$[2] = a$[2];out$[3] = a$[3];
    }, math, scope);


    math.quat.normalize = fin.macro(function quat_normalize(out$, a$) {
      $quat1 = out$;
      $quat2 = a$;

      $qX = $quat2[0]; $qY = $quat2[1]; $qZ = $quat2[2]; $qW = $quat2[3];
      $qLen = $qX * $qX + $qY * $qY + $qZ * $qZ + $qW * $qW;
      if ($qLen > 0) {
        $qLen = 1 / Math.sqrt($qLen);
      }
      $quat1[0] = $qX * $qLen;
      $quat1[1] = $qY * $qLen;
      $quat1[2] = $qZ * $qLen;
      $quat1[3] = $qW * $qLen;

    }, math, scope);



    math.quat.rotate_eular = fin.macro(function quat_rotate_eular(out$, x$, y$, z$) {
      $quat1 = out$;

      
      $qX = Math.sin(x$ * 0.5); $qY = Math.sin(y$ * 0.5); $qZ = Math.sin(z$ * 0.5);
      $dqX = Math.cos(x$ * 0.5); $dqY = Math.cos(y$ * 0.5); $dqZ = Math.cos(z$ * 0.5);



      $quat1[0] = $qX * $dqY * $dqZ - $dqX * $qY * $qZ;
      $quat1[1] = $dqX * $qY * $dqZ + $qX * $dqY * $qZ;
      $quat1[2] = $dqX * $dqY * $qZ - $qX * $qY * $dqZ;
      $quat1[3] = $dqX * $dqY * $dqZ + $qX * $qY * $qZ;


      $qX = $quat1[0]; $qY = $quat1[1]; $qZ = $quat1[2]; $qW = $quat1[3];
      $qLen = $qX * $qX + $qY * $qY + $qZ * $qZ + $qW * $qW;

      if ($qLen > 0) {
        $qLen = 1 / Math.sqrt($qLen);
      }

      $quat1[0] = $qX * $qLen;
      $quat1[1] = $qY * $qLen;
      $quat1[2] = $qZ * $qLen;
      $quat1[3] = $qW * $qLen;

    }, math, scope);

    math.quat.invert = fin.macro(function quat_invert(out$, a$) {
      $quat1 = out$;
      $quat2 = a$;

      $qX = $quat2[0]; $qY = $quat2[1]; $qZ = $quat2[2]; $qW = $quat2[3];
      $qLen = $qX * $qX + $qY * $qY + $qZ * $qZ + $qW * $qW;
      if ($qLen > 0) {
        $qLen = 1 / Math.sqrt($qLen);
      }
      $quat1[0] = -$qX * $qLen;
      $quat1[1] = -$qY * $qLen;
      $quat1[2] = -$qZ * $qLen;
      $quat1[3] = $qW * $qLen;
    }, math, scope);



    math.quat.slerp_flat = fin.macro(function quat_slerp_flat(out$, $qX, $qY, $qZ, $qW, $dqX, $dqY, $dqZ, $dqW,$t) {

      $cosom = $qX * $dqX + $qY * $dqY + $qZ * $dqZ + $qW * $dqW;

      if ($cosom < 0.0) {
        $cosom = -$cosom;
        $dqX = -$dqX;
        $dqY = -$dqY;
        $dqZ = -$dqZ;
        $dqW = -$dqW;
      }

      
      if (1.0 - $cosom > 0.000001) {

        $omega = Math.acos($cosom);
        $sinom = Math.sin($omega);
        $scale0 = Math.sin((1.0 - $t) * $omega) / $sinom;
        $scale1 = Math.sin($t * $omega) / $sinom;

      } else {       
        $scale0 = 1.0 - $t;
        $scale1 = $t;
      }


      out$[0] = scale0 * $qX + scale1 * $dqX;
      out$[1] = scale0 * $qY + scale1 * $dqY;
      out$[2] = scale0 * $qZ + scale1 * $dqZ;
      out$[3] = scale0 * $qW + scale1 * $dqW;


    }, math, scope);



  


    math.quat.from_vec3_float = fin.macro(function quat_from_vec3_float(out$, a$, f$) {
      out$[0] = a$[0];
      out$[1] = a$[1];
      out$[2] = a$[2];
      out$[3] = f$;
    }, math);


    math.quat.from_mat3 = fin.macro(function quat_from_mat3(out$, m$) {
      mat1$ = m$;
      $quat1 = out$;


      $dqX = mat1$[0];
      $dqY = mat1$[4];
      $dqZ = mat1$[8];
      $dqW= $dqX + $dqY + $dqZ;
      if ($dqW > 0) {
        $dqW = Math.sqrt($dqW + 1);
        quat1$[3] = 0.5 * $dqW;
        s = 0.5 / $dqW;
        quat1$[0] = (mat1$[7] - mat1$[5]) * $dqW;
        quat1$[1] = (mat1$[2] - mat1$[6]) * $dqW;
        quat1$[2] = (mat1$[3] - mat1$[1]) * $dqW;
      } else if ($dqX > $dqY) {
        if ($dqX > $dqZ) {
          $dqW = Math.sqrt($dqX - $dqY - $dqZ + 1);
          quat1$[0] = 0.5 * $dqW;
          $dqW = 0.5 / $dqW;
          quat1$[1] = (mat1$[1] + mat1$[3]) * $dqW;
          quat1$[2] = (mat1$[2] + mat1$[6]) * $dqW;
          quat1$[3] = (mat1$[7] - mat1$[5]) * $dqW;
        } else {
          $dqW = Math.sqrt(e22 - $dqX - $dqY + 1);
          quat1$[2] = 0.5 * $dqW;
          $dqW = 0.5 / $dqW;
          quat1$[0] = (mat1$[2] + mat1$[6]) * $dqW;
          quat1$[1] = (mat1$[5] + mat1$[7]) * $dqW;
          quat1$[3] = (mat1$[3] - mat1$[1]) * $dqW;
        }
      } else if ($dqY > $dqZ) {
        $dqW = Math.sqrt($dqY - $dqZ - $dqX + 1);
        quat1$[1] = 0.5 * $dqW;
        $dqW = 0.5 / $dqW;
        quat1$[0] = (mat1$[1] + mat1$[3]) * $dqW;
        quat1$[2] = (mat1$[5] + mat1$[7]) * $dqW;
        quat1$[3] = (mat1$[2] - mat1$[6]) * $dqW;
      } else {
        $dqW = Math.sqrt($dqZ - $dqX - $dqY + 1);
        quat1$[2] = 0.5 * $dqW;
        $dqW = 0.5 / $dqW;
        quat1$[0] = (mat1$[2] + mat1$[6]) * $dqW;
        quat1$[1] = (mat1$[5] + mat1$[7]) * $dqW;
        quat1$[3] = (mat1$[3] - mat1$[1]) * $dqW;
      }





    }, math);




  }, "math.quat");





  //dquat
  fin.macro_scope(function (scope, $dquat1, $dquat2, $dquat3, $ax0, $ay0, $az0, $aw0, $ax1, $ay1, $az1, $aw1, $bx0, $by0, $bz0, $bw0, $bx1, $by1, $bz1, $bw1, $qLen) {

    math.dquat.mult = fin.macro(function dquat_mult(out$, a$, b$) {
      $dquat1 = out$;
      $dquat2 = a$;
      $dquat3 = b$;

      $ax0 = $dquat2[0]; $ay0 = $dquat2[1]; $az0 = $dquat2[2]; $aw0 = $dquat2[3];
      $ax1 = $dquat2[4]; $ay1 = $dquat2[5]; $az1 = $dquat2[6]; $aw1 = $dquat2[7];

      $bx0 = $dquat3[0]; $by0 = $dquat3[1]; $bz0 = $dquat3[2]; $bw0 = $dquat3[3];
      $bx1 = $dquat3[4]; $by1 = $dquat3[5]; $bz1 = $dquat3[6]; $bw1 = $dquat3[7];

      $dquat1[0] = $ax0 * $bw0 + $aw0 * $bx0 + $ay0 * $bz0 - $az0 * $by0;
      $dquat1[1] = $ay0 * $bw0 + $aw0 * $by0 + $az0 * $bx0 - $ax0 * $bz0;
      $dquat1[2] = $az0 * $bw0 + $aw0 * $bz0 + $ax0 * $by0 - $ay0 * $bx0;
      $dquat1[3] = $aw0 * $bw0 - $ax0 * $bx0 - $ay0 * $by0 - $az0 * $bz0;

      $dquat1[4] = $ax0 * $bw1 + $aw0 * $bx1 + $ay0 * $bz1 - $az0 * $by1 + $ax1 * $bw0 + $aw1 * $bx0 + $ay1 * $bz0 - $az1 * $by0;
      $dquat1[5] = $ay0 * $bw1 + $aw0 * $by1 + $az0 * $bx1 - $ax0 * $bz1 + $ay1 * $bw0 + $aw1 * $by0 + $az1 * $bx0 - $ax1 * $bz0;
      $dquat1[6] = $az0 * $bw1 + $aw0 * $bz1 + $ax0 * $by1 - $ay0 * $bx1 + $az1 * $bw0 + $aw1 * $bz0 + $ax1 * $by0 - $ay1 * $bx0;
      $dquat1[7] = $aw0 * $bw1 - $ax0 * $bx1 - $ay0 * $by1 - $az0 * $bz1 + $aw1 * $bw0 - $ax1 * $bx0 - $ay1 * $by0 - $az1 * $bz0;


    }, math, scope);

    math.dquat.from_quat_pos = fin.macro(function dquat_from_quat_pos(out$, qt$, pos$) {
      $dquat1 = out$;

      $dquat1[0] = qt$[0];
      $dquat1[1] = qt$[1];
      $dquat1[2] = qt$[2];
      $dquat1[3] = qt$[3];

      $ax0 = pos$[0] * 0.5;
      $ay0 = pos$[1] * 0.5;
      $az0 = pos$[2] * 0.5;



      $bx0 = $dquat1[0];
      $by0 = $dquat1[1];
      $bz0 = $dquat1[2];
      $bw0 = $dquat1[3];



      $dquat1[4] = $ax0 * $bw0 + $ay0 * $bz0 - $az0 * $by0;
      $dquat1[5] = $ay0 * $bw0 + $az0 * $bx0 - $ax0 * $bz0;
      $dquat1[6] = $az0 * $bw0 + $ax0 * $by0 - $ay0 * $bx0;
      $dquat1[7] = -$ax0 * $bx0 - $ay0 * $by0 - $az0 * $bz0;

    }, math, scope);

    math.dquat.invert = fin.macro(function dquat_invert(out$, a$) {
      $dquat1 = out$;
      $dquat2 = a$;



      $ax0 = $dquat2[0]; $ay0 = $dquat2[1]; $az0 = $dquat2[2]; $aw0 = $dquat2[3];

      $qLen = $ax0 * $ax0 + $ay0 * $ay0 + $az0 * $az0 + $aw0 * $aw0;


      if ($qLen > 0) {
        $qLen = 1 / Math.sqrt($qLen);
      }
      $dquat1[0] = -$ax0 * $qLen;
      $dquat1[1] = -$ay0 * $qLen;
      $dquat1[2] = -$az0 * $qLen;
      $dquat1[3] = $aw0 * $qLen;
    }, math, scope);


    var QT_1 = math.quat(), v3_1 = math.vec3();

    math.dquat.from_mat4 = function (out, mat) {
      math.mat4.get_rotation(QT_1, mat)
      math.mat4.get_translation(v3_1, mat);

      math.dquat.from_quat_pos(out, QT_1, v3_1);
      return out;
    };


    math.dquat.get_translation = function (out, a) {


      $ax0 = a[4];
      $ay0 = a[5];
      $az0 = a[6];
      $aw0 = a[7];
      $bx0 = -a[0];
      $by0 = -a[1];
      $bz0 = -a[2];
      $bw0 = a[3];

      out[0] = ($ax0 * $bw0 + $aw0 * $bx0 + $ay0 * $bz0 - $az0 * $by0) * 2;
      out[1] = ($ay0 * $bw0 + $aw0 * $by0 + $az0 * $bx0 - $ax0 * $bz0) * 2;
      out[2] = ($az0 * $bw0 + $aw0 * $bz0 + $ax0 * $by0 - $ay0 * $bx0) * 2;
      return out;
    };


  }, "math.dquat");


  //utils
  fin.macro_scope(function (scope) {


    math.utils.ray_plane_intersection = function (out$, ray_start$, ray_end$, plane_pos$, plane_normal$) {

      var ray_len = math.vec3.pool.get();

      math.vec3.subtract(ray_len, ray_end$, ray_start$);

      var denom = math.vec3.dot(ray_len, plane_normal$);
      if (denom <= 0.000001 && denom >= -0.000001) return false;

      var ray2_plane_len = math.vec3.pool.get();

      math.vec3.subtract(ray2_plane_len, plane_pos$, ray_start$);
      denom = math.vec3.dot(ray2_plane_len, plane_normal$) / denom;


      math.vec3.pool.free(ray_len);
      math.vec3.pool.free(ray2_plane_len);

      if (denom >= 0) {
        math.vec3.scale_add(out$, ray_start$, ray_len, denom);
        return true;
      }
      return false;

    };








  }, "math.utils");


}
