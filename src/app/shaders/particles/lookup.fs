precision highp float;


uniform vec2 resolution;
uniform sampler2D u_texture;
const int numColors = 4;
uniform float multiplier;

const float BASE = 255.0;
const float scale = BASE * BASE;
const float OFFSET = 0.0;


vec3 hsv2rgb(vec3 c) {
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 hsv2rgb(float c1, float c2, float c3) {
	return hsv2rgb(vec3(c1, c2, c3));
}

float decode(vec2 channels) {
    return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
}

vec2 extract(sampler2D tex, vec2 texcoord){
	vec4 valueRAW = texture2D(tex, texcoord);
	return vec2(decode(valueRAW.rg), decode(valueRAW.ba));
}

void main () {
	vec3 colors[numColors];
	// colors[0] = hsv2rgb(0., 0., 0.);
	// colors[1] = hsv2rgb(.2, .6, .75);
	// colors[2] = hsv2rgb(.9, .75, .95);
	// colors[3] = hsv2rgb(.65, .9, .95);

	// colors[0] = hsv2rgb(0., 0., 0.);
	// colors[1] = hsv2rgb(.02, .6, .75);
	// colors[2] = hsv2rgb(.55, .75, .95);
	// colors[3] = hsv2rgb(.25, .9, .95);

	colors[0] = hsv2rgb(0., 0., 0.);
	colors[1] = hsv2rgb(.42, .6, .75);
	colors[2] = hsv2rgb(.95, .75, .95);
	colors[3] = hsv2rgb(.15, .9, .95);

	float positions[numColors];
	positions[0] = .001;
	positions[1] = .15;
	positions[2] = .4;
	positions[3] = .999;

	vec2 uv = gl_FragCoord.xy / resolution;
	float val = extract(u_texture, uv).x;// * multiplier;
	// val = pow(val, .6);

	vec3 color = vec3(0.);

	bool found = false;

	if(positions[0] > val){
		color = colors[0];
	}
	else if(positions[numColors-1] < val){
		color = colors[numColors-1];
	}
	else{
		for(int i = 1; i < numColors; i++){
			if(positions[i] > val && !found){
				vec3 color1 = colors[i-1];
				vec3 color2 = colors[i];
				float range = positions[i] - positions[i-1];
				float alpha = (val - positions[i-1]) / range;
				color = alpha * color2 + (1.-alpha)*color1;
				found = true;
			}
		}
	}

	// color = vec3(val);

	// vec3 color = hsv2rgb(vec3(val, .5, .95));

	gl_FragColor = vec4(color, 1.);
}