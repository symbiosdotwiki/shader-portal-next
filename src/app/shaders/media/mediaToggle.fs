precision highp float;

uniform vec2 resolution;
uniform sampler2D u_diffuse;
uniform sampler2D u_normal;
uniform vec3 light;
uniform float TIME;
uniform float toggleStatus;

const float A_COL = .45;
const float I_COL = .17;

vec3 hsv2rgb(vec3 c) {
    c.x = mod(c.x, 1.);
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 hsv2rgb(float h, float s, float v) {
  return hsv2rgb(vec3(h, s, v));
}

void main() {
	vec2 fragCoord = gl_FragCoord.xy;
	vec2 uv = fragCoord / resolution;

	vec3 diffuse = texture2D(u_diffuse, uv).rgb;
	vec3 normal = texture2D(u_normal, uv).rgb;
	vec3 metal = vec3(diffuse.r);
	vec3 buttons = toggleStatus > 0. ? 
		hsv2rgb(I_COL, .85, diffuse.g) : hsv2rgb(A_COL, .85, diffuse.g);

	float height = 0.;

	// vec3 buttons = hsv2rgb(.33, .85, 1.) * color.g;
	float alpha = ceil(diffuse.b);
	if(abs(uv.x-.5) > .49){
		alpha = 0.;
	}

	vec3 c = vec3(0.);
	if(alpha > 0.){
		// Phong
		normal = (normal - vec3(.5))*2.;
		vec3 lp = vec3(
			3. * (light.x / resolution.x - .5), 
			// .8 * clamp((1.-light.y / resolution.y - .5), .2, 1.) + 3.*clamp((1.-light.y / resolution.y - .5), -1., .2),
			3.*(1.-light.y / resolution.y - .5), 
			1.
		);
		vec3 sp = vec3(uv - vec2(.5, .5), -1.);
		vec3 ep = vec3(.5, .5, 0.);
		c = hsv2rgb(TIME/80. + .5, .85, pow(
			clamp(
				dot(
					normalize(reflect(lp-sp, normal)), 
					normalize(sp)
				),
				0., 1.
			),
			10.
		));
	}


	gl_FragColor = vec4(metal + buttons + c, 1.0) * alpha;
}