precision highp float;

uniform vec2 resolution;
uniform sampler2D u_texture;
uniform int pass;

const float BASE = 255.0;
const float scale = BASE * BASE;
const float OFFSET = 0.0;

vec2 encode(float value) {
    value = floor(value * scale + OFFSET);
    float x = mod(value, BASE);
    float y = floor(value / BASE);
    return vec2(x, y) / BASE;
}

vec4 pack(vec2 value){
	return vec4(encode(value.x), encode(value.y));
}

float decode(vec2 channels) {
    return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
}

vec2 extract(sampler2D tex, vec2 texcoord){
	vec4 valueRAW = texture2D(tex, texcoord);
	return vec2(decode(valueRAW.rg), decode(valueRAW.ba));
}

void main() {
	float sum = 0.;

	const int count = 1;
	int length = 2 * count + 1;
	float scale = float(length * length);
	scale = float(length);

	for(int i = -count; i <= count; i++){
		// for(int j = -count; j <= count; j++){
			vec2 fragCoord = gl_FragCoord.xy + vec2(i, 0.);
			if(pass > 0){
				fragCoord = gl_FragCoord.xy + vec2(0., i);
			}
			vec2 uv = fragCoord / resolution;
			sum += extract(u_texture, uv).x / scale;
		// }
	}
	gl_FragColor = pack(vec2(sum, 0.));
}