precision highp float;

attribute vec2 v_texcoord;
attribute vec2 position;

uniform sampler2D u_texture;
varying vec3 color;

const float BASE = 255.0;
const float scale = BASE * BASE;
const float OFFSET = 0.0;

// vec3 hsv2rgb(vec3 c) {
// 	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
// 	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
// 	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
// }

float decode(vec2 channels) {
    return (dot(channels, vec2(BASE, BASE * BASE))) / scale;
}

vec2 extract(sampler2D tex){
	vec4 valueRAW = texture2D(tex, position);
	return vec2(decode(valueRAW.xy), decode(valueRAW.zw));
}

void main () {
	vec2 pos = extract(u_texture);
	// color = hsv2rgb(vec3(0.5 * v_texcoord + 0.4, 0.9)) * .1;
	gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
	gl_PointSize = .5;
}