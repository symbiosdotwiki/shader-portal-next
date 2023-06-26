precision highp float;

uniform vec2 resolution;
uniform sampler2D u_diffuse;
uniform sampler2D u_buttons;
uniform sampler2D u_playN;
uniform sampler2D u_pauseN;
uniform sampler2D u_height;
uniform vec3 light;
uniform float TIME;
uniform bool playing;
uniform vec3 buttonStatus;
uniform float toggleStatus;

vec3 hsv2rgb(vec3 c) {
    c.x = mod(c.x, 1.);
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 hsv2rgb(float h, float s, float v) {
  return hsv2rgb(vec3(h, s, v));
}

float sigmoid(float x){
	return 1.0 / (1.0 + exp(-1.0 * x));;
}

void main() {
	vec2 fragCoord = gl_FragCoord.xy;
	vec2 uv = fragCoord / resolution;

	vec3 diffuse = texture2D(u_diffuse, uv).rgb;
	vec3 buttonLights = texture2D(u_buttons, uv).rgb;
	vec3 heightRGB = texture2D(u_height, uv).rgb;

	vec3 normal = vec3(0.);
	vec3 metal = vec3(0.);
	vec3 buttons = vec3(0.);

	float text = heightRGB.g;
	float height = 0.;

	if(playing){
		metal = vec3(diffuse.g);
		normal = texture2D(u_playN, uv).rgb;
		height = heightRGB.r;
		buttons += hsv2rgb(.33, .85, buttonLights.b * buttonStatus.b);
	}
	else{
		metal = vec3(diffuse.r);
		normal = texture2D(u_pauseN, uv).rgb;
		height = heightRGB.b;
		buttons += hsv2rgb(.33, .85, buttonLights.g * buttonStatus.b);
	}

	if(uv.x < .5){
		buttons += hsv2rgb(.33, .85, buttonLights.r * buttonStatus.r);
	}
	else{
		buttons += hsv2rgb(.33, .85, buttonLights.r * buttonStatus.g);
	}

	// vec3 buttons = hsv2rgb(.33, .85, 1.) * color.g;
	float sOffset = toggleStatus + .5;
	float alpha = clamp(sigmoid(50.*(height + heightRGB.g - sOffset)), 0., 1.);
	// alpha *= ceil(height);
	// float alpha = clamp(ceil(height + heightRGB.g), 0., 1.) * (1. - toggleStatus);
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
			3.*(1.-light.y / resolution.y - .5)*.25, 
			1.
		);
		vec3 sp = vec3(uv - vec2(.5, .5), -1.)*vec3(1., .25, 1.);
		vec3 ep = vec3(.5, .5, 0.);
		c = hsv2rgb(.75, .85, pow(
			clamp(
				dot(
					normalize(reflect(lp-sp, normal)), 
					normalize(sp)
				),
				0., 1.
			),
			1000.
		));
	}


	gl_FragColor = vec4(metal + buttons + c, alpha);
}