precision highp float;
varying vec2 v_position;
uniform int pass;

const float BASE = 255.0;
const float scale = BASE * BASE;
const float OFFSET = 0.0;

vec2 encode(float value) {
    value = value * scale + OFFSET;
    float x = mod(value, BASE);
    float y = floor(value / BASE);
    return vec2(x, y) / BASE;
}

vec4 pack(vec2 value){
	return vec4(encode(value.x), encode(value.y));
}

vec2 n2rand() {
	return vec2(
		fract(sin(dot(v_position.xy, vec2(12.9898, 78.233))) * 43758.5453),
  		fract(sin(dot(v_position.xy * 1.61803, vec2(12.9898, 78.233))) * 43758.5453)
  	);
}

void main() {
			vec2 pos_rand = 0.2*(n2rand()-.5);
	if(pass == 0){
		float sizing = .8;
		gl_FragColor = vec4(pack(sizing*v_position + pos_rand + .5*(1.-sizing)));// + vec4(n2rand(), -1., -1.);
	}
	else{
		gl_FragColor = vec4(pack(0.5 + 100.*pos_rand));
	}
}