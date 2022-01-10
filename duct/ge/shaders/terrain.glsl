/*chunk-default-material*/

<?=chunk('precision')?>
attribute vec3 a_position_rw;
uniform mat4 u_view_projection_rw;

uniform vec4 reg_pos;
uniform vec3 cam_reg_pos;

uniform vec3 u_terrain_scale;




varying vec4 v_position_rw;
varying vec3 v_normal_rw;
varying vec2 v_uv_rw;
varying mat3 v_tbn_matrix;


<?=chunk('mat3-transpose')?>

void vertex(void){
  v_position_rw.z=floor(a_position_rw.x/cam_reg_pos.z);
  v_position_rw.x=floor(mod(a_position_rw.x,cam_reg_pos.z));
  v_position_rw.y=a_position_rw.y;  


  v_normal_rw.x = fract(a_position_rw.z);
  v_normal_rw.y = fract(a_position_rw.z* 256.0);  
  v_normal_rw.z = fract(a_position_rw.z * 65536.0);  


   v_normal_rw.x = (v_normal_rw.x * 2.0) - 1.0;
  v_normal_rw.y = (v_normal_rw.y * 2.0) - 1.0;
  v_normal_rw.z = (v_normal_rw.z * 2.0) - 1.0;  


  v_position_rw.w=1.0; 
  
  //v_position_rw.xyz+=(v_normal_rw*u_terrain_scale);

  v_uv_rw=v_position_rw.xz/cam_reg_pos.z;        
  
  //v_uv_rw+=0.5;

  v_position_rw.xyz*=u_terrain_scale;
  
 //  v_position_rw.xz-=((cam_reg_pos.z)*0.5);
  // v_position_rw.xz*=reg_pos.w;

  //v_position_rw.xz*=0.99;
  v_position_rw.xz+=reg_pos.xz;   
 // v_position_rw.y=0.0;

 

  gl_Position = u_view_projection_rw *v_position_rw;

 // v_uv_rw=v_position_rw.xz;        
 // v_uv_rw/=(cam_reg_pos.z);    
  v_normal_rw=normalize(v_normal_rw);

}

<?=chunk('precision')?>

uniform mat4 u_object_material_rw;
uniform vec4 u_eye_position_rw;
uniform vec4 reg_pos;
uniform vec3 cam_reg_pos;

varying vec4 v_position_rw;
varying vec3 v_normal_rw;
varying vec2 v_uv_rw;
varying mat3 v_tbn_matrix;

<?=chunk('global-render-system-lighting')?>

<?=chunk('global-render-system-fog-effect')?>


uniform vec4 land_color;

uniform sampler2D u_texture_tiles_rw;
uniform sampler2D u_normalmap_tiles_rw;
uniform sampler2D u_shadow_map_rw;

uniform vec2 u_tile_size_rw;
uniform vec4 u_texture_repeat_rw;
uniform vec4 u_normalmap_repeat_rw;

float tile_size;
vec2 tile_uv;
vec2 uv=vec2(0);
float tile_offset;

vec4 mix_texture_tiles(vec4 tile1,vec4 tile2,vec4 tile3,vec4 tile4,vec3 normal);
vec3 mix_normal_tiles(vec3 tile1,vec3 tile2,vec3 tile3,vec3 tile4,vec3 normal);

vec4 read_tile(sampler2D texture,float tile_repeat, float tx,float ty);

vec3 mix_normal_tiles(vec3 tile1,vec3 tile2,vec3 tile3,vec3 tile4,vec3 normal){


	return mix(tile1,tile4,abs(normal.x));
}

vec4 mix_texture_tiles(vec4 tile1,vec4 tile2,vec4 tile3,vec4 tile4,vec3 normal){
	return mix(tile4,tile2,0.5);
}


vec4 read_tile(sampler2D texture,float tile_repeat, float tx,float ty){

    uv.x=mod(v_uv_rw.x*tile_repeat,tile_size-(tile_offset*2.0));
    uv.y=mod(v_uv_rw.y*tile_repeat,tile_size-(tile_offset*2.0));
    uv.x+=tx*tile_size+tile_offset;
    uv.y+=ty*tile_size+tile_offset;
    return texture2D(texture, uv);
}



vec2 texelSize=vec2(1.0/128.0,1.0/128.0);
float sample_smap(vec2 coords){	
	vec2 pixelPos = coords / texelSize + vec2(0.5);
	vec2 fracPart = fract(pixelPos);
	vec2 startTexel = (pixelPos - fracPart) * texelSize;
	float blTexel = texture2D(u_shadow_map_rw, startTexel).r;
	float brTexel = texture2D(u_shadow_map_rw, startTexel + vec2(texelSize.x, 0.0)).r;
	float tlTexel = texture2D(u_shadow_map_rw, startTexel + vec2(0.0, texelSize.y)).r;
	float trTexel = texture2D(u_shadow_map_rw, startTexel + texelSize).r;
	float mixA = mix(blTexel, tlTexel, fracPart.y);
	float mixB = mix(brTexel, trTexel, fracPart.y);
	return mix(mixA, mixB, fracPart.x);
}



float sample_smap_pcf(vec2 coords)
{
	const float NUM_SAMPLES = 3.0;
	const float SAMPLES_START = (NUM_SAMPLES - 1.0) / 2.0;
	const float NUM_SAMPLES_SQUARED = NUM_SAMPLES * NUM_SAMPLES;
	float result = 0.0;
	for (float y = -SAMPLES_START; y <= SAMPLES_START; y += 1.0)
	{
		for (float x = -SAMPLES_START; x <= SAMPLES_START; x += 1.0)
		{
			vec2 coordsOffset = vec2(x, y) * texelSize;
			result += sample_smap(coords + coordsOffset);
		}
	}
	return result / NUM_SAMPLES_SQUARED;
}




void fragment(void) {	

tile_size=u_tile_size_rw.x;
tile_offset=u_tile_size_rw.y;




  
	vec4 tile1=read_tile(u_texture_tiles_rw,u_texture_repeat_rw.x, 0.0,0.0);
	vec4 tile2=read_tile(u_texture_tiles_rw,u_texture_repeat_rw.y, 1.0,0.0);
	vec4 tile3=read_tile(u_texture_tiles_rw,u_texture_repeat_rw.z, 0.0,1.0);
	vec4 tile4=read_tile(u_texture_tiles_rw,u_texture_repeat_rw.w, 1.0,1.0);

	vec3 norm1=(2.0 * read_tile(u_normalmap_tiles_rw,u_normalmap_repeat_rw.x, 0.0,0.0).xyz - 1.0);
	vec3 norm2=(2.0 * read_tile(u_normalmap_tiles_rw,u_normalmap_repeat_rw.y, 1.0,0.0).xyz - 1.0);
	vec3 norm3=(2.0 * read_tile(u_normalmap_tiles_rw,u_normalmap_repeat_rw.z, 0.0,1.0).xyz - 1.0);
	vec3 norm4=(2.0 * read_tile(u_normalmap_tiles_rw,u_normalmap_repeat_rw.w, 1.0,1.0).xyz - 1.0);



	
	vec3 normal= mix_normal_tiles(norm1,norm2,norm3,norm4,v_normal_rw);
	normal=normalize(v_normal_rw+normal);

	 vec3 fws_direction_to_eye = normalize(u_eye_position_rw.xyz - v_position_rw.xyz);		
	vec3 total_light=get_render_system_lighting(u_object_material_rw,v_position_rw.xyz,
	normal,
	fws_direction_to_eye);
	
	//*texture2D(u_shadow_map_rw, v_uv_rw).r;	

	


	gl_FragColor = vec4((total_light)*(land_color.xyz), u_object_material_rw[0].w)*	
	mix_texture_tiles(tile1,tile2,tile3,tile4,normal);

	gl_FragColor*=sample_smap_pcf(v_uv_rw);
	//gl_FragColor = texture2D(u_shadow_map_rw, v_uv_rw);

	//gl_FragColor=mix_fog_color(gl_FragColor);
	//gl_FragColor=texture2D(u_texture_tiles_rw, v_uv_rw);
	//gl_FragColor=vec4(1.0);
}




















/*chunk-default-patch-material*/

<?=chunk('precision')?>
attribute vec3 a_position_rw;
uniform mat4 u_view_projection_rw;

varying vec4 v_position_rw;
varying vec3 v_normal_rw;
varying vec2 v_uv_rw;
varying mat3 v_tbn_matrix;


<?=chunk('mat3-transpose')?>

void vertex(void){
  v_position_rw.z=floor(a_position_rw.x/cam_reg_pos.z);
  v_position_rw.x=floor(mod(a_position_rw.x,cam_reg_pos.z));
  v_position_rw.y=a_position_rw.y;  


  v_normal_rw.x = fract(a_position_rw.z);
  v_normal_rw.y = fract(a_position_rw.z* 256.0);  
  v_normal_rw.z = fract(a_position_rw.z * 65536.0);  


   v_normal_rw.x = (v_normal_rw.x * 2.0) - 1.0;
  v_normal_rw.y = (v_normal_rw.y * 2.0) - 1.0;
  v_normal_rw.z = (v_normal_rw.z * 2.0) - 1.0;  


  v_position_rw.w=1.0; 
  
  //v_position_rw.xyz+=(v_normal_rw*u_terrain_scale);

  v_uv_rw=v_position_rw.xz/cam_reg_pos.z;        
  
  //v_uv_rw+=0.5;

  v_position_rw.xyz*=u_terrain_scale;
  
 //  v_position_rw.xz-=((cam_reg_pos.z)*0.5);
  // v_position_rw.xz*=reg_pos.w;

  //v_position_rw.xz*=0.99;
  v_position_rw.xz+=reg_pos.xz;   
 // v_position_rw.y=0.0;

 

  gl_Position = u_view_projection_rw *v_position_rw;

 // v_uv_rw=v_position_rw.xz;        
 // v_uv_rw/=(cam_reg_pos.z);    
  v_normal_rw=normalize(v_normal_rw);

}

<?=chunk('precision')?>

uniform mat4 u_object_material_rw;
uniform vec4 u_eye_position_rw;
uniform vec4 reg_pos;
uniform vec3 cam_reg_pos;

varying vec4 v_position_rw;
varying vec3 v_normal_rw;
varying vec2 v_uv_rw;
varying mat3 v_tbn_matrix;

<?=chunk('global-render-system-lighting')?>

<?=chunk('global-render-system-fog-effect')?>


uniform vec4 land_color;

uniform sampler2D u_texture_tiles_rw;
uniform sampler2D u_normalmap_tiles_rw;
uniform sampler2D u_shadow_map_rw;

uniform vec2 u_tile_size_rw;
uniform vec4 u_texture_repeat_rw;
uniform vec4 u_normalmap_repeat_rw;

float tile_size;
vec2 tile_uv;
vec2 uv=vec2(0);
float tile_offset;

vec4 mix_texture_tiles(vec4 tile1,vec4 tile2,vec4 tile3,vec4 tile4,vec3 normal);
vec3 mix_normal_tiles(vec3 tile1,vec3 tile2,vec3 tile3,vec3 tile4,vec3 normal);

vec4 read_tile(sampler2D texture,float tile_repeat, float tx,float ty);

vec3 mix_normal_tiles(vec3 tile1,vec3 tile2,vec3 tile3,vec3 tile4,vec3 normal){


	return mix(tile1,tile4,abs(normal.x));
}

vec4 mix_texture_tiles(vec4 tile1,vec4 tile2,vec4 tile3,vec4 tile4,vec3 normal){
	return mix(tile4,tile2,0.5);
}


vec4 read_tile(sampler2D texture,float tile_repeat, float tx,float ty){

    uv.x=mod(v_uv_rw.x*tile_repeat,tile_size-(tile_offset*2.0));
    uv.y=mod(v_uv_rw.y*tile_repeat,tile_size-(tile_offset*2.0));
    uv.x+=tx*tile_size+tile_offset;
    uv.y+=ty*tile_size+tile_offset;
    return texture2D(texture, uv);
}



vec2 texelSize=vec2(1.0/128.0,1.0/128.0);
float sample_smap(vec2 coords){	
	vec2 pixelPos = coords / texelSize + vec2(0.5);
	vec2 fracPart = fract(pixelPos);
	vec2 startTexel = (pixelPos - fracPart) * texelSize;
	float blTexel = texture2D(u_shadow_map_rw, startTexel).r;
	float brTexel = texture2D(u_shadow_map_rw, startTexel + vec2(texelSize.x, 0.0)).r;
	float tlTexel = texture2D(u_shadow_map_rw, startTexel + vec2(0.0, texelSize.y)).r;
	float trTexel = texture2D(u_shadow_map_rw, startTexel + texelSize).r;
	float mixA = mix(blTexel, tlTexel, fracPart.y);
	float mixB = mix(brTexel, trTexel, fracPart.y);
	return mix(mixA, mixB, fracPart.x);
}



float sample_smap_pcf(vec2 coords)
{
	const float NUM_SAMPLES = 3.0;
	const float SAMPLES_START = (NUM_SAMPLES - 1.0) / 2.0;
	const float NUM_SAMPLES_SQUARED = NUM_SAMPLES * NUM_SAMPLES;
	float result = 0.0;
	for (float y = -SAMPLES_START; y <= SAMPLES_START; y += 1.0)
	{
		for (float x = -SAMPLES_START; x <= SAMPLES_START; x += 1.0)
		{
			vec2 coordsOffset = vec2(x, y) * texelSize;
			result += sample_smap(coords + coordsOffset);
		}
	}
	return result / NUM_SAMPLES_SQUARED;
}




void fragment(void) {	

tile_size=u_tile_size_rw.x;
tile_offset=u_tile_size_rw.y;




  
	vec4 tile1=read_tile(u_texture_tiles_rw,u_texture_repeat_rw.x, 0.0,0.0);
	vec4 tile2=read_tile(u_texture_tiles_rw,u_texture_repeat_rw.y, 1.0,0.0);
	vec4 tile3=read_tile(u_texture_tiles_rw,u_texture_repeat_rw.z, 0.0,1.0);
	vec4 tile4=read_tile(u_texture_tiles_rw,u_texture_repeat_rw.w, 1.0,1.0);

	vec3 norm1=(2.0 * read_tile(u_normalmap_tiles_rw,u_normalmap_repeat_rw.x, 0.0,0.0).xyz - 1.0);
	vec3 norm2=(2.0 * read_tile(u_normalmap_tiles_rw,u_normalmap_repeat_rw.y, 1.0,0.0).xyz - 1.0);
	vec3 norm3=(2.0 * read_tile(u_normalmap_tiles_rw,u_normalmap_repeat_rw.z, 0.0,1.0).xyz - 1.0);
	vec3 norm4=(2.0 * read_tile(u_normalmap_tiles_rw,u_normalmap_repeat_rw.w, 1.0,1.0).xyz - 1.0);



	
	vec3 normal= mix_normal_tiles(norm1,norm2,norm3,norm4,v_normal_rw);
	normal=normalize(v_normal_rw+normal);

	 vec3 fws_direction_to_eye = normalize(u_eye_position_rw.xyz - v_position_rw.xyz);		
	vec3 total_light=get_render_system_lighting(u_object_material_rw,v_position_rw.xyz,
	normal,
	fws_direction_to_eye);
	
	//*texture2D(u_shadow_map_rw, v_uv_rw).r;	

	


	gl_FragColor = vec4((total_light)*(land_color.xyz), u_object_material_rw[0].w)*	
	mix_texture_tiles(tile1,tile2,tile3,tile4,normal);

	gl_FragColor*=sample_smap_pcf(v_uv_rw);
	//gl_FragColor = texture2D(u_shadow_map_rw, v_uv_rw);

	//gl_FragColor=mix_fog_color(gl_FragColor);
	//gl_FragColor=texture2D(u_texture_tiles_rw, v_uv_rw);
	//gl_FragColor=vec4(1.0);
}










/*chunk-oclusion*/

<?=chunk('precision')?>
attribute vec3 a_position_rw;
uniform mat4 u_view_projection_rw;
uniform vec3 reg_pos;
uniform vec3 cam_reg_pos;

void vertex(void){
  gl_Position.z=floor(a_position_rw.x/cam_reg_pos.z);
  gl_Position.x=floor(mod(a_position_rw.x,cam_reg_pos.z));
  gl_Position.y=a_position_rw.y; 
  gl_Position.w=1.0;     
  gl_Position.xz+=reg_pos.xz;    
  gl_Position = u_view_projection_rw *gl_Position;
}

<?=chunk('precision')?>
uniform vec4 land_color;
void fragment(void) {	
	gl_FragColor=land_color/255.0;

}








