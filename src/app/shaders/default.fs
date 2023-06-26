precision highp float;

uniform vec2 resolution;
uniform sampler2D u_texture;

void main() {
	vec2 uv = gl_FragCoord.xy / resolution;
	vec4 val = texture2D(u_texture, uv);
	gl_FragColor = val;
}