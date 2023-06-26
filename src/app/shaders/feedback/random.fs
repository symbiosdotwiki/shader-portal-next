precision highp float;

float hash1( float n ){
    return fract(sin(n)*138.5453123);
}

float random (vec2 st) {
    return step(0.5, hash1(st.x*13.0+hash1(st.y*71.1)));
}

void main() {
	float random = random(gl_FragCoord.xy/1000.);
	gl_FragColor = vec4(random, random, random, 1.);
}