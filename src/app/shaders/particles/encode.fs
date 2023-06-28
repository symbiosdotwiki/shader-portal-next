precision highp float;

uniform vec2 resolution;
uniform sampler2D u_texture;

const float BASE = 255.0;
const float scale = BASE * BASE;

vec2 encode(float value) {
    value = floor(value * scale);
    float x = mod(value, BASE);
    float y = floor(value / BASE);
    return vec2(x, y) / BASE;
}

vec4 pack(vec2 value){
	return vec4(encode(value.x), encode(value.y));
}

void main() {
	vec2 uv = gl_FragCoord.xy / resolution;
	vec4 val = texture2D(u_texture, uv);
	gl_FragColor = pack(vec2(val.r * val.a));
}