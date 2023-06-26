precision highp float;
uniform int pass;

const float BASE = 255.0;
const float scale = BASE * BASE;

vec2 encode(float value) {
    value = value * scale;
    float x = mod(value, BASE);
    float y = floor(value / BASE);
    return vec2(x, y) / BASE;
}

vec4 pack(vec2 value){
	return vec4(encode(value.x), encode(value.y));
}

vec2 n2rand() {
	return vec2(
		fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453),
  		fract(sin(dot(gl_FragCoord.xy * 1.61803, vec2(12.9898, 78.233))) * 43758.5453)
  	);
}

void main() {
			vec2 pos_rand = n2rand() - .5;
	if(pass == 0){
		gl_FragColor = pack(.5 + pos_rand );// + vec4(n2rand(), -1., -1.);
	}
	else{
		gl_FragColor = pack(2.*pos_rand);
	}
}