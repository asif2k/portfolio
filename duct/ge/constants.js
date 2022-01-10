function index(fin, ge) { 
  Object.assign(ge, {
    SHADING: {
      FLAT: 2,
      SHADED: 4,
      CAST_SHADOW: 8,
      RECEIVE_SHADOW: 16,
      SINGLE_LIGHT: 32,
      RECEIVE_REFLECTION: 64,
      TRANSPARENT: 128,
      OPUQUE: 256,
      DEPTH_TEST: 512,
      NO_DEPTH_TEST: 1024,
      DOUBLE_SIDES: 2048,
      SHADOW_DOUBLE_SIDES: 4096,
      PICKABLE: 8192,
    },

    DISPLAY_ALWAYS: 2,
    ITEM_TYPES: {
      MESH: 4,
      LIGHT: 8,
      CAMERA: 16,
      MANIPULATOR: 32,
      OTHER: 1024
    },

    TRANS: {
      SCALABLE: 2,
      ANIMATED: 4,
      ANIMATED_POSITION: 8,
      ANIMATED_SCALE: 16,
      ANIMATED_ROTATION: 32,
      IK_ANIMATED: 64,
    }
  });

  Object.assign(ge, {
    GL_ACTIVE_ATTRIBUTES: 35721,
    GL_ACTIVE_TEXTURE: 34016,
    GL_ACTIVE_UNIFORMS: 35718,
    GL_ALIASED_LINE_WIDTH_RANGE: 33902,
    GL_ALIASED_POINT_SIZE_RANGE: 33901,
    GL_ALPHA: 6406,
    GL_ALPHA_BITS: 3413,
    GL_ALWAYS: 519,
    GL_ARRAY_BUFFER: 34962,
    GL_ARRAY_BUFFER_BINDING: 34964,
    GL_ATTACHED_SHADERS: 35717,
    GL_BACK: 1029,
    GL_BLEND: 3042,
    GL_BLEND_COLOR: 32773,
    GL_BLEND_DST_ALPHA: 32970,
    GL_BLEND_DST_RGB: 32968,
    GL_BLEND_EQUATION: 32777,
    GL_BLEND_EQUATION_ALPHA: 34877,
    GL_BLEND_EQUATION_RGB: 32777,
    GL_BLEND_SRC_ALPHA: 32971,
    GL_BLEND_SRC_RGB: 32969,
    GL_BLUE_BITS: 3412,
    GL_BOOL: 35670,
    GL_BOOL_VEC2: 35671,
    GL_BOOL_VEC3: 35672,
    GL_BOOL_VEC4: 35673,
    GL_BROWSER_DEFAULT_WEBGL: 37444,
    GL_BUFFER_SIZE: 34660,
    GL_BUFFER_USAGE: 34661,
    GL_BYTE: 5120,
    GL_CCW: 2305,
    GL_CLAMP_TO_EDGE: 33071,
    GL_COLOR_ATTACHMENT0: 36064,
    GL_COLOR_BUFFER_BIT: 16384,
    GL_COLOR_CLEAR_VALUE: 3106,
    GL_COLOR_WRITEMASK: 3107,
    GL_COMPILE_STATUS: 35713,
    GL_COMPRESSED_TEXTURE_FORMATS: 34467,
    GL_CONSTANT_ALPHA: 32771,
    GL_CONSTANT_COLOR: 32769,
    GL_CONTEXT_LOST_WEBGL: 37442,
    GL_CULL_FACE: 2884,
    GL_CULL_FACE_MODE: 2885,
    GL_CURRENT_PROGRAM: 35725,
    GL_CURRENT_VERTEX_ATTRIB: 34342,
    GL_CW: 2304,
    GL_DECR: 7683,
    GL_DECR_WRAP: 34056,
    GL_DELETE_STATUS: 35712,
    GL_DEPTH_ATTACHMENT: 36096,
    GL_DEPTH_BITS: 3414,
    GL_DEPTH_BUFFER_BIT: 256,
    GL_DEPTH_CLEAR_VALUE: 2931,
    GL_DEPTH_COMPONENT: 6402,
    GL_DEPTH_COMPONENT16: 33189,
    GL_DEPTH_FUNC: 2932,
    GL_DEPTH_RANGE: 2928,
    GL_DEPTH_STENCIL: 34041,
    GL_DEPTH_STENCIL_ATTACHMENT: 33306,
    GL_DEPTH_TEST: 2929,
    GL_DEPTH_WRITEMASK: 2930,
    GL_DITHER: 3024,
    GL_DONT_CARE: 4352,
    GL_DST_ALPHA: 772,
    GL_DST_COLOR: 774,
    GL_DYNAMIC_DRAW: 35048,
    GL_ELEMENT_ARRAY_BUFFER: 34963,
    GL_ELEMENT_ARRAY_BUFFER_BINDING: 34965,
    GL_EQUAL: 514,
    GL_FASTEST: 4353,
    GL_FLOAT: 5126,
    GL_FLOAT_MAT2: 35674,
    GL_FLOAT_MAT3: 35675,
    GL_FLOAT_MAT4: 35676,
    GL_FLOAT_VEC2: 35664,
    GL_FLOAT_VEC3: 35665,
    GL_FLOAT_VEC4: 35666,
    GL_FRAGMENT_SHADER: 35632,
    GL_FRAMEBUFFER: 36160,
    GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME: 36049,
    GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE: 36048,
    GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE: 36051,
    GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL: 36050,
    GL_FRAMEBUFFER_BINDING: 36006,
    GL_FRAMEBUFFER_COMPLETE: 36053,
    GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT: 36054,
    GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS: 36057,
    GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: 36055,
    GL_FRAMEBUFFER_UNSUPPORTED: 36061,
    GL_FRONT: 1028,
    GL_FRONT_AND_BACK: 1032,
    GL_FRONT_FACE: 2886,
    GL_FUNC_ADD: 32774,
    GL_FUNC_REVERSE_SUBTRACT: 32779,
    GL_FUNC_SUBTRACT: 32778,
    GL_GENERATE_MIPMAP_HINT: 33170,
    GL_GEQUAL: 518,
    GL_GREATER: 516,
    GL_GREEN_BITS: 3411,
    GL_HIGH_FLOAT: 36338,
    GL_HIGH_INT: 36341,
    GL_IMPLEMENTATION_COLOR_READ_FORMAT: 35739,
    GL_IMPLEMENTATION_COLOR_READ_TYPE: 35738,
    GL_INCR: 7682,
    GL_INCR_WRAP: 34055,
    GL_INT: 5124,
    GL_INT_VEC2: 35667,
    GL_INT_VEC3: 35668,
    GL_INT_VEC4: 35669,
    GL_INVALID_ENUM: 1280,
    GL_INVALID_FRAMEBUFFER_OPERATION: 1286,
    GL_INVALID_OPERATION: 1282,
    GL_INVALID_VALUE: 1281,
    GL_INVERT: 5386,
    GL_KEEP: 7680,
    GL_LEQUAL: 515,
    GL_LESS: 513,
    GL_LINEAR: 9729,
    GL_LINEAR_MIPMAP_LINEAR: 9987,
    GL_LINEAR_MIPMAP_NEAREST: 9985,
    GL_LINES: 1,
    GL_LINE_LOOP: 2,
    GL_LINE_STRIP: 3,
    GL_LINE_WIDTH: 2849,
    GL_LINK_STATUS: 35714,
    GL_LOW_FLOAT: 36336,
    GL_LOW_INT: 36339,
    GL_LUMINANCE: 6409,
    GL_LUMINANCE_ALPHA: 6410,
    GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS: 35661,
    GL_MAX_CUBE_MAP_TEXTURE_SIZE: 34076,
    GL_MAX_FRAGMENT_UNIFORM_VECTORS: 36349,
    GL_MAX_RENDERBUFFER_SIZE: 34024,
    GL_MAX_TEXTURE_IMAGE_UNITS: 34930,
    GL_MAX_TEXTURE_SIZE: 3379,
    GL_MAX_VARYING_VECTORS: 36348,
    GL_MAX_VERTEX_ATTRIBS: 34921,
    GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS: 35660,
    GL_MAX_VERTEX_UNIFORM_VECTORS: 36347,
    GL_MAX_VIEWPORT_DIMS: 3386,
    GL_MEDIUM_FLOAT: 36337,
    GL_MEDIUM_INT: 36340,
    GL_MIRRORED_REPEAT: 33648,
    GL_NEAREST: 9728,
    GL_NEAREST_MIPMAP_LINEAR: 9986,
    GL_NEAREST_MIPMAP_NEAREST: 9984,
    GL_NEVER: 512,
    GL_NICEST: 4354,
    GL_NONE: 0,
    GL_NOTEQUAL: 517,
    GL_NO_ERROR: 0,
    GL_ONE: 1,
    GL_ONE_MINUS_CONSTANT_ALPHA: 32772,
    GL_ONE_MINUS_CONSTANT_COLOR: 32770,
    GL_ONE_MINUS_DST_ALPHA: 773,
    GL_ONE_MINUS_DST_COLOR: 775,
    GL_ONE_MINUS_SRC_ALPHA: 771,
    GL_ONE_MINUS_SRC_COLOR: 769,
    GL_OUT_OF_MEMORY: 1285,
    GL_PACK_ALIGNMENT: 3333,
    GL_POINTS: 0,
    GL_POLYGON_OFFSET_FACTOR: 32824,
    GL_POLYGON_OFFSET_FILL: 32823,
    GL_POLYGON_OFFSET_UNITS: 10752,
    GL_RED_BITS: 3410,
    GL_RENDERBUFFER: 36161,
    GL_RENDERBUFFER_ALPHA_SIZE: 36179,
    GL_RENDERBUFFER_BINDING: 36007,
    GL_RENDERBUFFER_BLUE_SIZE: 36178,
    GL_RENDERBUFFER_DEPTH_SIZE: 36180,
    GL_RENDERBUFFER_GREEN_SIZE: 36177,
    GL_RENDERBUFFER_HEIGHT: 36163,
    GL_RENDERBUFFER_INTERNAL_FORMAT: 36164,
    GL_RENDERBUFFER_RED_SIZE: 36176,
    GL_RENDERBUFFER_STENCIL_SIZE: 36181,
    GL_RENDERBUFFER_WIDTH: 36162,
    GL_RENDERER: 7937,
    GL_REPEAT: 10497,
    GL_REPLACE: 7681,
    GL_RGB: 6407,
    GL_RGB5_A1: 32855,
    GL_RGB565: 36194,
    GL_RGBA: 6408,
    GL_RGBA4: 32854,
    GL_SAMPLER_2D: 35678,
    GL_SAMPLER_CUBE: 35680,
    GL_SAMPLES: 32937,
    GL_SAMPLE_ALPHA_TO_COVERAGE: 32926,
    GL_SAMPLE_BUFFERS: 32936,
    GL_SAMPLE_COVERAGE: 32928,
    GL_SAMPLE_COVERAGE_INVERT: 32939,
    GL_SAMPLE_COVERAGE_VALUE: 32938,
    GL_SCISSOR_BOX: 3088,
    GL_SCISSOR_TEST: 3089,
    GL_SHADER_TYPE: 35663,
    GL_SHADING_LANGUAGE_VERSION: 35724,
    GL_SHORT: 5122,
    GL_SRC_ALPHA: 770,
    GL_SRC_ALPHA_SATURATE: 776,
    GL_SRC_COLOR: 768,
    GL_STATIC_DRAW: 35044,
    GL_STENCIL_ATTACHMENT: 36128,
    GL_STENCIL_BACK_FAIL: 34817,
    GL_STENCIL_BACK_FUNC: 34816,
    GL_STENCIL_BACK_PASS_DEPTH_FAIL: 34818,
    GL_STENCIL_BACK_PASS_DEPTH_PASS: 34819,
    GL_STENCIL_BACK_REF: 36003,
    GL_STENCIL_BACK_VALUE_MASK: 36004,
    GL_STENCIL_BACK_WRITEMASK: 36005,
    GL_STENCIL_BITS: 3415,
    GL_STENCIL_BUFFER_BIT: 1024,
    GL_STENCIL_CLEAR_VALUE: 2961,
    GL_STENCIL_FAIL: 2964,
    GL_STENCIL_FUNC: 2962,
    GL_STENCIL_INDEX8: 36168,
    GL_STENCIL_PASS_DEPTH_FAIL: 2965,
    GL_STENCIL_PASS_DEPTH_PASS: 2966,
    GL_STENCIL_REF: 2967,
    GL_STENCIL_TEST: 2960,
    GL_STENCIL_VALUE_MASK: 2963,
    GL_STENCIL_WRITEMASK: 2968,
    GL_STREAM_DRAW: 35040,
    GL_SUBPIXEL_BITS: 3408,
    GL_TEXTURE: 5890,
    GL_TEXTURE0: 33984,
    GL_TEXTURE1: 33985,
    GL_TEXTURE2: 33986,
    GL_TEXTURE3: 33987,
    GL_TEXTURE4: 33988,
    GL_TEXTURE5: 33989,
    GL_TEXTURE6: 33990,
    GL_TEXTURE7: 33991,
    GL_TEXTURE8: 33992,
    GL_TEXTURE9: 33993,
    GL_TEXTURE10: 33994,
    GL_TEXTURE11: 33995,
    GL_TEXTURE12: 33996,
    GL_TEXTURE13: 33997,
    GL_TEXTURE14: 33998,
    GL_TEXTURE15: 33999,
    GL_TEXTURE16: 34000,
    GL_TEXTURE17: 34001,
    GL_TEXTURE18: 34002,
    GL_TEXTURE19: 34003,
    GL_TEXTURE20: 34004,
    GL_TEXTURE21: 34005,
    GL_TEXTURE22: 34006,
    GL_TEXTURE23: 34007,
    GL_TEXTURE24: 34008,
    GL_TEXTURE25: 34009,
    GL_TEXTURE26: 34010,
    GL_TEXTURE27: 34011,
    GL_TEXTURE28: 34012,
    GL_TEXTURE29: 34013,
    GL_TEXTURE30: 34014,
    GL_TEXTURE31: 34015,
    GL_TEXTURE_2D: 3553,
    GL_TEXTURE_BINDING_2D: 32873,
    GL_TEXTURE_BINDING_CUBE_MAP: 34068,
    GL_TEXTURE_CUBE_MAP: 34067,
    GL_TEXTURE_CUBE_MAP_NEGATIVE_X: 34070,
    GL_TEXTURE_CUBE_MAP_NEGATIVE_Y: 34072,
    GL_TEXTURE_CUBE_MAP_NEGATIVE_Z: 34074,
    GL_TEXTURE_CUBE_MAP_POSITIVE_X: 34069,
    GL_TEXTURE_CUBE_MAP_POSITIVE_Y: 34071,
    GL_TEXTURE_CUBE_MAP_POSITIVE_Z: 34073,
    GL_TEXTURE_MAG_FILTER: 10240,
    GL_TEXTURE_MIN_FILTER: 10241,
    GL_TEXTURE_WRAP_S: 10242,
    GL_TEXTURE_WRAP_T: 10243,
    GL_TRIANGLES: 4,
    GL_TRIANGLE_FAN: 6,
    GL_TRIANGLE_STRIP: 5,
    GL_UNPACK_ALIGNMENT: 3317,
    GL_UNPACK_COLORSPACE_CONVERSION_WEBGL: 37443,
    GL_UNPACK_FLIP_Y_WEBGL: 37440,
    GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL: 37441,
    GL_UNSIGNED_BYTE: 5121,
    GL_UNSIGNED_INT: 5125,
    GL_UNSIGNED_SHORT: 5123,
    GL_UNSIGNED_SHORT_4_4_4_4: 32819,
    GL_UNSIGNED_SHORT_5_5_5_1: 32820,
    GL_UNSIGNED_SHORT_5_6_5: 33635,
    GL_VALIDATE_STATUS: 35715,
    GL_VENDOR: 7936,
    GL_VERSION: 7938,
    GL_VERTEX_ATTRIB_ARRAY_BUFFER_BINDING: 34975,
    GL_VERTEX_ATTRIB_ARRAY_ENABLED: 34338,
    GL_VERTEX_ATTRIB_ARRAY_NORMALIZED: 34922,
    GL_VERTEX_ATTRIB_ARRAY_POINTER: 34373,
    GL_VERTEX_ATTRIB_ARRAY_SIZE: 34339,
    GL_VERTEX_ATTRIB_ARRAY_STRIDE: 34340,
    GL_VERTEX_ATTRIB_ARRAY_TYPE: 34341,
    GL_VERTEX_SHADER: 35633,
    GL_VIEWPORT: 2978,
    GL_ZERO: 0,
  });

}