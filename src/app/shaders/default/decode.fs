precision highp float;

uniform vec2 resolution;
uniform sampler2D u_texture;

const float BASE = 255.0;
const float scale = BASE * BASE;

float decode(vec2 channels) {
    return (dot(channels, vec2(BASE, BASE * BASE))) / scale;
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