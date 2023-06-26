precision highp float;

uniform vec2 resolution;
uniform sampler2D u_texture;

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
	vec2 uv = gl_FragCoord.xy / resolution;
	vec2 val = extract(u_texture, uv);
	gl_FragColor = vec4(val.x, val.x, val.x, 1.);
}