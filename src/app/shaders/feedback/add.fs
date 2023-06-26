precision highp float;

uniform vec2 resolution1;
uniform vec2 resolution2;
uniform sampler2D tex1;
uniform sampler2D tex2;

void main() {
	vec2 uv1 = gl_FragCoord.xy / resolution1;
	vec2 uv2 = gl_FragCoord.xy / resolution1;
	gl_FragColor = texture2D(tex1, uv1) + texture2D(tex2, uv2);
}