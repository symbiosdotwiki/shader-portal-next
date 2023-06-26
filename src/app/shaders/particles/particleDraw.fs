precision highp float;
varying vec3 color;

const float BASE = 255.0;
const float scale = BASE * BASE;
const float OFFSET = 0.0;
uniform float HD;

vec2 encode(float value) {
    value = floor(value * scale + OFFSET);
    float x = mod(value, BASE);
    float y = floor(value / BASE);
    return vec2(x, y) / BASE;
}

vec4 pack(vec2 value){
	return vec4(encode(value.x), encode(value.y));
}

void main () {
	// gl_FragColor = vec4(color, );
	// gl_FragColor = vec4(.13);
	gl_FragColor = pack(vec2(HD > .5 ? .02 : .02,.13));
}