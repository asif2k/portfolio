/*chunk-pp-default*/

<?=chunk('precision')?>
attribute vec3 a_position_rw;
const vec2 madd=vec2(0.5,0.5);
varying vec2 v_uv_rw;
void vertex()
{
    gl_Position = vec4(a_position_rw.xy,0.0,1.0);	
	v_uv_rw = a_position_rw.xy*madd+madd;  
}
<?=chunk('precision')?>
uniform sampler2D u_texture_input_rw;
varying vec2 v_uv_rw;
void fragment(void){	
gl_FragColor = texture2D(u_texture_input_rw, v_uv_rw) ;	


}



/*chunk-pp-picture-adjustment*/

uniform mat3 u_pa_params;

void fragment(){	
	vec4 c = texture2D(u_texture_input_rw, v_uv_rw);
    if (c.a > 0.0) {

		
    }
        float gamma=u_pa_params[0].x;
		float contrast=u_pa_params[0].y;
		float saturation=u_pa_params[0].z;
		float brightness=u_pa_params[1].x;
		float red=u_pa_params[1].y;
		float green=u_pa_params[1].z;
		float blue=u_pa_params[2].x;
		
        //c.rgb /= c.a;

        vec3 rgb = pow(c.rgb, vec3(1.0 / gamma));
        rgb = mix(vec3(0.5), mix(vec3(dot(vec3(0.2125, 0.7154, 0.0721), rgb)), rgb, saturation), contrast);
        rgb.r *= red;
        rgb.g *= green;
        rgb.b *= blue;

        c.rgb = rgb * brightness;        
     //   c.rgb *= c.a;


	float alpha=u_pa_params[2].y;
    gl_FragColor = c * alpha;
}


/*chunk-pp-fxaa*/

uniform vec3 u_inverse_filter_texture_size;
uniform vec3 u_fxaa_params;

void fragment(void){	
	float R_fxaaSpanMax=u_fxaa_params.x;
	float R_fxaaReduceMin=u_fxaa_params.y;
	float R_fxaaReduceMul=u_fxaa_params.z;	
	vec2 texCoordOffset = u_inverse_filter_texture_size.xy;
	vec3 luma = vec3(0.299, 0.587, 0.114);	
	float lumaTL = dot(luma, texture2D(u_texture_input_rw, v_uv_rw.xy + (vec2(-1.0, -1.0) * texCoordOffset)).xyz);
	float lumaTR = dot(luma, texture2D(u_texture_input_rw, v_uv_rw.xy + (vec2(1.0, -1.0) * texCoordOffset)).xyz);
	float lumaBL = dot(luma, texture2D(u_texture_input_rw, v_uv_rw.xy + (vec2(-1.0, 1.0) * texCoordOffset)).xyz);
	float lumaBR = dot(luma, texture2D(u_texture_input_rw, v_uv_rw.xy + (vec2(1.0, 1.0) * texCoordOffset)).xyz);
	float lumaM  = dot(luma, texture2D(u_texture_input_rw, v_uv_rw.xy).xyz);

	vec2 dir;
	dir.x = -((lumaTL + lumaTR) - (lumaBL + lumaBR));
	dir.y = ((lumaTL + lumaBL) - (lumaTR + lumaBR));
	
	float dirReduce = max((lumaTL + lumaTR + lumaBL + lumaBR) * (R_fxaaReduceMul * 0.25), R_fxaaReduceMin);
	float inverseDirAdjustment = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);
	
	dir = min(vec2(R_fxaaSpanMax, R_fxaaSpanMax), 
		max(vec2(-R_fxaaSpanMax, -R_fxaaSpanMax), dir * inverseDirAdjustment)) * texCoordOffset;

	vec3 result1 = (1.0/2.0) * (
		texture2D(u_texture_input_rw, v_uv_rw.xy + (dir * vec2(1.0/3.0 - 0.5))).xyz +
		texture2D(u_texture_input_rw, v_uv_rw.xy + (dir * vec2(2.0/3.0 - 0.5))).xyz);

	vec3 result2 = result1 * (1.0/2.0) + (1.0/4.0) * (
		texture2D(u_texture_input_rw, v_uv_rw.xy + (dir * vec2(0.0/3.0 - 0.5))).xyz +
		texture2D(u_texture_input_rw, v_uv_rw.xy + (dir * vec2(3.0/3.0 - 0.5))).xyz);

	float lumaMin = min(lumaM, min(min(lumaTL, lumaTR), min(lumaBL, lumaBR)));
	float lumaMax = max(lumaM, max(max(lumaTL, lumaTR), max(lumaBL, lumaBR)));
	float lumaResult2 = dot(luma, result2);
	

if(lumaResult2 < lumaMin || lumaResult2 > lumaMax)
		gl_FragColor = vec4(result1, 1.0);
	else
		gl_FragColor = vec4(result2, 1.0);

if(v_uv_rw.x<0.5){
    gl_FragColor=texture2D(u_texture_input_rw, v_uv_rw);
}
else {
	
gl_FragColor.rgb*=0.75;
}

}



/*chunk-pp-glow*/
uniform sampler2D u_glow_emission_rw;
uniform vec3 u_glow_params_rw;

void fragment(void){	

vec4 cBase = texture2D(u_texture_input_rw, v_uv_rw);
	vec4 cOver = texture2D(u_glow_emission_rw, v_uv_rw);			
	vec4 blend = cBase + cOver * u_glow_params_rw.z;
    blend = vec4(1.0) - exp(-blend * u_glow_params_rw.x);
    blend = pow(blend, vec4(1.0 / u_glow_params_rw.y));
	gl_FragColor =blend;

}

/*chunk-pp-blur*/

uniform vec2 u_offset_rw;
uniform vec3 u_blurKernel_rw;
void fragment(){	
	vec3 A = u_blurKernel_rw.x* texture2D(u_texture_input_rw, v_uv_rw - u_offset_rw).xyz;
	vec3 B = u_blurKernel_rw.y* texture2D(u_texture_input_rw, v_uv_rw).xyz;
	vec3 C = u_blurKernel_rw.z* texture2D(u_texture_input_rw, v_uv_rw + u_offset_rw).xyz;
	vec3 color = A + B + C;
	gl_FragColor = vec4(color, 1);	
	
}



/*chunk-pp-emission*/
uniform vec4 u_bright_threshold_rw;
void fragment(){	
	 vec4 color = texture2D(u_texture_input_rw, v_uv_rw);        		
	 float luminance = dot(color.rgb, u_bright_threshold_rw.xyz );
	 luminance+=(color.a+u_bright_threshold_rw.w);		 
	 gl_FragColor = luminance* color;
}








/*chunk-pp-bloom*/
uniform sampler2D u_glow_emission_rw;
uniform vec3 u_glow_params_rw;

void fragment(void){	

vec4 cBase = texture2D(u_texture_input_rw, v_uv_rw);
	vec4 cOver = texture2D(u_glow_emission_rw, v_uv_rw);			
	vec4 blend = cBase + cOver * u_glow_params_rw.z;
    blend = vec4(1.0) - exp(-blend * u_glow_params_rw.x);
    blend = pow(blend, vec4(1.0 / u_glow_params_rw.y));
	gl_FragColor =blend;

}

/*chunk-pp-bloom-blur*/

uniform vec2 u_offset_rw;
uniform vec3 u_blurKernel_rw;
void fragment(){	
	vec3 A = u_blurKernel_rw.x* texture2D(u_texture_input_rw, v_uv_rw - u_offset_rw).xyz;
	vec3 B = u_blurKernel_rw.y* texture2D(u_texture_input_rw, v_uv_rw).xyz;
	vec3 C = u_blurKernel_rw.z* texture2D(u_texture_input_rw, v_uv_rw + u_offset_rw).xyz;
	vec3 color = A + B + C;
	gl_FragColor = vec4(color, 1);	
	
}



/*chunk-pp-bloom-emission*/
uniform vec4 u_bright_threshold_rw;
void fragment(){	
	 vec4 color = texture2D(u_texture_input_rw, v_uv_rw);        		
	 float luminance = dot(color.rgb, u_bright_threshold_rw.xyz );
	 luminance+=(color.a+u_bright_threshold_rw.w);		 
	 gl_FragColor =  color*luminance;
	
}













/*chunk-glow-material*/
void vertex(void){
super_vertex();
}

void fragment(void) {
super_fragment();

gl_FragColor.rgb*=1.1;
}





/*chunk-skybox*/
<?=chunk('precision')?>
attribute vec4 a_position_rw;
varying vec4 v_position_rw;

void vertex(){
  v_position_rw = a_position_rw;
  gl_Position = a_position_rw;
  gl_Position.z = 1.0;
}


<?=chunk('precision')?>
uniform mat4 u_view_projection_matrix_rw;
uniform vec4 u_sun_params_rw;
varying vec4 v_position_rw;
vec3 fragPosition;

const float turbidity = 10.0;
const float reileigh = 2.0;
const float mieCoefficient = 0.005;
const float mieDirectionalG = 0.8;

const float e = 2.71828182845904523536028747135266249775724709369995957;
const float pi = 3.141592653589793238462643383279502884197169;

const float n = 1.0003;// refractive index of air
const float N = 2.545E25; // number of molecules per unit volume for air at
											
const float pn = 0.035;
// wavelength of used primaries, according to preetham
const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);

const vec3 K = vec3(0.686, 0.678, 0.666);
const float v = 4.0;

const float rayleighZenithLength = 8.4E3;
const float mieZenithLength = 1.25E3;
const vec3 up = vec3(0.0, 1.0, 0.0);

const float EE = 1000.0;

float sunAngularDiameterCos =u_sun_params_rw.w; // 0.999956;

const float cutoffAngle = pi/1.95;
const float steepness = 1.5;

vec3 simplifiedRayleigh() {
	return 0.0005 / vec3(94, 40, 18);
}

float rayleighPhase(float cosTheta) {
	return (3.0 / (16.0*pi)) * (1.0 + pow(cosTheta, 2.0));
}

vec3 totalMie(vec3 lambda, vec3 K, float T) {
	float c = (0.2 * T ) * 10E-18;
	return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;
}

float hgPhase(float cosTheta, float g) {
	return (1.0 / (4.0*pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0*g*cosTheta + pow(g, 2.0), 1.5));
}

float sunIntensity(float zenithAngleCos) {	
	return EE * max(0.0, 1.0 - pow(e, -((cutoffAngle - acos(zenithAngleCos))/steepness)));
}

float A = 0.15;
float B = 0.50;
float C = 0.10;
float D = 0.20;
float E = 0.02;
float F = 0.30;
float W = 1000.0;

vec3 Uncharted2Tonemap(vec3 x) {
   return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

<?=chunk('global-render-system-fog-effect')?>

void fragment(void) {
	
   fragPosition=(u_view_projection_matrix_rw * v_position_rw).xyz;
	vec3 sunPosition=u_sun_params_rw.xyz;
	float sunfade = 1.0 - clamp(1.0 - exp(sunPosition.y), 0.0, 1.0);
	float reileighCoefficient = reileigh - (1.0 * (1.0-sunfade));
	vec3 sunDirection = normalize(sunPosition);
	float sunE = sunIntensity(dot(sunDirection, up));
	vec3 betaR = simplifiedRayleigh() * reileighCoefficient;

	// mie coefficients
	vec3 betaM = totalMie(lambda, K, turbidity) * mieCoefficient;

	// optical length
	// cutoff angle at 90 to avoid singularity in next formula.
	float zenithAngle = acos(max(0.0, dot(up, normalize(fragPosition))));
	float sR = rayleighZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));
	float sM = mieZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));

	// combined extinction factor
	vec3 Fex = exp(-(betaR * sR + betaM * sM));

	// in scattering
	float cosTheta = dot(normalize(fragPosition), sunDirection);

	float rPhase = rayleighPhase(cosTheta * 0.5+0.5);
	vec3 betaRTheta = betaR * rPhase;

	float mPhase = hgPhase(cosTheta, mieDirectionalG);
	vec3 betaMTheta = betaM * mPhase;

	vec3 Lin = pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex),vec3(1.5));
	Lin *= mix(vec3(1.0),pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * Fex,vec3(1.0/2.0)),clamp(pow(1.0-dot(up, sunDirection),5.0),0.0,1.0));

	//nightsky
	vec3 direction = normalize(fragPosition);
	float theta = acos(direction.y); // elevation --> y-axis, [-pi/2, pi/2]
	float phi = atan(direction.z, direction.x); // azimuth --> x-axis [-pi/2, pi/2]
	vec2 uv = vec2(phi, theta) / vec2(2.0*pi, pi) + vec2(0.5, 0.0);
	vec3 L0 = vec3(0.1) * Fex;

	// composition + solar disc
	float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosTheta);
	L0 += (sunE * 19000.0 * Fex)*sundisk;

	vec3 whiteScale = 1.0/Uncharted2Tonemap(vec3(W));

	vec3 texColor = (Lin+L0);
	texColor *= 0.04 ;
	texColor += vec3(0.0,0.001,0.0025)*0.3;

	vec3 curr = Uncharted2Tonemap(texColor);
	vec3 color = curr*whiteScale;

	vec3 retColor = pow(color,vec3(1.0/(1.2+(1.2*sunfade))));

	gl_FragColor = vec4(retColor, 1.0);
	gl_FragColor=mix_fog_color(gl_FragColor);
	
}





/*chunk-skybox2*/
<?=chunk('precision')?>
attribute vec4 a_position_rw;
varying vec4 v_position_rw;

void vertex(){
  v_position_rw = a_position_rw;
  gl_Position = a_position_rw;
  gl_Position.z = 1.0;
}


<?=chunk('precision')?>
uniform mat4 u_view_projection_matrix_rw;
uniform vec4 u_sun_params_rw;
varying vec4 v_position_rw;


const float depolarizationFactor=0.067;
const float luminance=1.0;
const float mieCoefficient=0.00335;
const float mieDirectionalG=0.787;
const vec3 mieKCoefficient=vec3(0.686,0.678,0.666);
const float mieV=4.012;
const float mieZenithLength=500.0;
const float numMolecules=2.542e+25;
const vec3 primaries=vec3(6.8e-7,5.5e-7,4.5e-7);
const float rayleigh=1.0;
const float rayleighZenithLength=615.0;
const float refractiveIndex=1.000317;
const float sunAngularDiameterDegrees=0.00758;
const float sunIntensityFactor=1111.0;
const float sunIntensityFalloffSteepness=0.98;
const float tonemapWeighting=9.50;
const float turbidity=1.25;

const float PI = 3.141592653589793238462643383279502884197169;
const vec3 UP = vec3(0.0, 1.0, 0.0);

vec3 totalRayleigh(vec3 lambda)
{
	return (8.0 * pow(PI, 3.0) * pow(pow(refractiveIndex, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * depolarizationFactor)) / (3.0 * numMolecules * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * depolarizationFactor));
}

vec3 totalMie(vec3 lambda, vec3 K, float T)
{
	float c = 0.2 * T * 10e-18;
	return 0.434 * c * PI * pow((2.0 * PI) / lambda, vec3(mieV - 2.0)) * K;
}

float rayleighPhase(float cosTheta)
{
	return (3.0 / (16.0 * PI)) * (1.0 + pow(cosTheta, 2.0));
}

float henyeyGreensteinPhase(float cosTheta, float g)
{
	return (1.0 / (4.0 * PI)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0 * g * cosTheta + pow(g, 2.0), 1.5));
}

float sunIntensity(float zenithAngleCos)
{
	float cutoffAngle = PI / 1.95; // Earth shadow hack
	return sunIntensityFactor * max(0.0, 1.0 - exp(-((cutoffAngle - acos(zenithAngleCos)) / sunIntensityFalloffSteepness)));
}

// Whitescale tonemapping calculation, see http://filmicgames.com/archives/75
// Also see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness
const float A = 0.15; // Shoulder strength
const float B = 0.50; // Linear strength
const float C = 0.10; // Linear angle
const float D = 0.20; // Toe strength
const float E = 0.02; // Toe numerator
const float F = 0.30; // Toe denominator
vec3 Uncharted2Tonemap(vec3 W)
{
	return ((W * (A * W + C * B) + D * E) / (W * (A * W + B) + D * F)) - E / F;
}



void fragment(void) {
	
  vec3 fragPosition=normalize((u_view_projection_matrix_rw * v_position_rw).xyz);
  // In-scattering	
	vec3 sunDirection=u_sun_params_rw.xyz;


  //float sunfade = 1.0 - clamp(1.0 - exp(((sunDirection*4500000.0).y / 450000.0)), 0.0, 1.0);

  float sunfade = 1.0 - clamp(1.0 - exp(sunDirection.y), 0.0, 1.0);
	float rayleighCoefficient = rayleigh - (1.0 * (1.0 - sunfade));
	vec3 betaR = totalRayleigh(primaries) * rayleighCoefficient;
	
	// Mie coefficient
	vec3 betaM = totalMie(primaries, mieKCoefficient, turbidity) * mieCoefficient;
	
	// Optical length, cutoff angle at 90 to avoid singularity
	float zenithAngle = acos(max(0.0, dot(UP, fragPosition)));
	float denom = cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / PI), -1.253);
	float sR = rayleighZenithLength / denom;
	float sM = mieZenithLength / denom;
	
	// Combined extinction factor
	vec3 Fex = exp(-(betaR * sR + betaM * sM));
	
	
	float cosTheta = dot(fragPosition, sunDirection);
	vec3 betaRTheta = betaR * rayleighPhase(cosTheta * 0.5 + 0.5);
	vec3 betaMTheta = betaM * henyeyGreensteinPhase(cosTheta, mieDirectionalG);
	float sunE = sunIntensity(dot(sunDirection, UP));
	vec3 Lin = pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex), vec3(1.5));
	Lin *= mix(vec3(1.0), pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * Fex, vec3(0.5)), clamp(pow(1.0 - dot(UP, sunDirection), 5.0), 0.0, 1.0));
	
	// Composition + solar disc
	float sunAngularDiameterCos = cos(sunAngularDiameterDegrees);
	float sundisk = smoothstep(sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta);
	vec3 L0 = vec3(0.1) * Fex;
	L0 += sunE * 19000.0 * Fex * sundisk;
	vec3 texColor = Lin + L0;
	texColor *= 0.04;
	texColor += vec3(0.0, 0.001, 0.0025) * 0.3;
	
	// Tonemapping
	vec3 whiteScale = 1.0 / Uncharted2Tonemap(vec3(tonemapWeighting));
	vec3 curr = Uncharted2Tonemap((log2(2.0 / pow(luminance, 4.0))) * texColor);
	vec3 color = curr * whiteScale;
	vec3 retColor = pow(color, vec3(1.0 / (1.2 + (1.2 * sunfade))));

	gl_FragColor = vec4(retColor, 1.0);
}
}