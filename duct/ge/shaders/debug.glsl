/*chunk-points*/
<?=chunk('precision')?>
attribute vec3 a_point_position_rw;
attribute vec4 a_point_color_rw;

uniform mat4 u_view_projection_rw;
uniform mat4 u_model_rw;

varying vec3 point_color_v;

void vertex(){	    
    gl_Position = u_view_projection_rw*u_model_rw* vec4(a_point_position_rw,1.0);	
    point_color_v=a_point_color_rw.xyz;  
    gl_PointSize =a_point_color_rw.w;
}
<?=chunk('precision')?>

varying vec3 point_color_v;
void fragment(void) {	        
gl_FragColor.xyz=point_color_v;
gl_FragColor.w=1.0;
}



/*chunk-lines*/

<?=chunk('precision')?>
attribute vec3 a_line_position_rw;
attribute vec3 a_line_color_rw;

uniform mat4 u_view_projection_rw;
uniform mat4 u_model_rw;

varying vec3 line_color_v;

void vertex(){	    
    gl_Position = u_view_projection_rw*u_model_rw* vec4(a_line_position_rw,1.0);	
    line_color_v=a_line_color_rw.xyz;  
}
<?=chunk('precision')?>

varying vec3 line_color_v;
void fragment(void) {	        
gl_FragColor.xyz=line_color_v;
gl_FragColor.w=1.0;
}



/*chunk-triangles*/

<?=chunk('precision')?>
attribute vec3 a_triangle_position_rw;
attribute vec3 a_triangle_color_rw;

uniform mat4 u_view_projection_rw;
uniform mat4 u_model_rw;

varying vec3 triangle_color_v;

void vertex(){	    
    gl_Position = u_view_projection_rw*u_model_rw* vec4(a_triangle_position_rw,1.0);	
    triangle_color_v=a_triangle_color_rw.xyz;  
}
<?=chunk('precision')?>

varying vec3 triangle_color_v;
void fragment(void) {	        
gl_FragColor.xyz=triangle_color_v;
gl_FragColor.w=1.0;
}



/*chunk-aabbs*/

<?=chunk('precision')?>
attribute vec3 a_position_rw;
attribute vec3 a_box_position_rw;
attribute vec3 a_box_size_rw;
attribute vec3 a_box_color_rw;

uniform mat4 u_view_projection_rw;
uniform mat4 u_model_rw;
varying vec3 v_box_color_rw;
void vertex(){
    vec4 pos;
    pos.xyz=a_position_rw*a_box_size_rw;    
    pos.xyz+=a_box_position_rw;
    pos.w=1.0;    
    v_box_color_rw=a_box_color_rw;
    gl_Position = u_view_projection_rw*u_model_rw*pos;	

}
<?=chunk('precision')?>
varying vec3 v_box_color_rw;
void fragment(void) {	
gl_FragColor=vec4(v_box_color_rw,0.5);
}







/*chunk-aabbs-solid*/

<?=chunk('precision')?>
attribute vec4 a_position_rw;
attribute vec3 a_box_position_rw;
attribute vec3 a_box_size_rw;
attribute vec3 a_box_color_rw;

uniform mat4 u_view_projection_rw;
uniform mat4 u_model_rw;
varying vec3 v_box_color_rw;


void vertex(){
    vec4 p;
    p.xyz=a_position_rw.xyz*a_box_size_rw;    
    p.xyz+=a_box_position_rw;
    p.w=1.0;        
    v_box_color_rw=a_box_color_rw;
    gl_Position = u_view_projection_rw*u_model_rw*p;	
}
<?=chunk('precision')?>
varying vec3 v_box_color_rw;
void fragment(void) {	
gl_FragColor=vec4(v_box_color_rw,1.0);
}
