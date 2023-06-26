precision mediump float;

attribute vec2 position;
varying vec2 v_texcoord;

void main() {
	v_texcoord = 0.5 * position + 0.5;
	// v_texcoord = position;
	gl_Position = vec4(position, 0.0, 1.0);
}