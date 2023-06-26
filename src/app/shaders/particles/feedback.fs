precision highp float;

uniform vec2 resolution;
uniform sampler2D u_curFrame;
uniform sampler2D u_prevFrame;
uniform float feedback1;
uniform float feedback2;
uniform float feedbackScale;
uniform bool HD;

const float BASE = 255.0;
const float RANGE = BASE * BASE;
const float OFFSET = 0.0;

vec2 encode(float value) {
    value = floor(value * RANGE + OFFSET);
    float x = mod(value, BASE);
    float y = floor(value / BASE);
    return vec2(x, y) / BASE;
}

vec4 pack(vec2 value){
	return vec4(encode(value.x), encode(value.y));
}

float decode(vec2 channels) {
    return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / RANGE;
}

vec2 extract(sampler2D tex, vec2 texcoord){
	vec4 valueRAW = texture2D(tex, texcoord);
	return vec2(decode(valueRAW.rg), decode(valueRAW.ba));
}

void main() {
	vec2 uv = gl_FragCoord.xy / resolution;
	vec2 uvScaled = ( uv - vec2(.5) ) * feedbackScale + vec2(.5);
	// uv -= .5;
	// uv *= scale;
	// uv += .5;
	float prevFrame = extract(u_prevFrame, uvScaled).x;
	float curFrame = extract(u_curFrame, uv).x;

	// float alpha = curFrame.y;

	// prevFrame.a = 0.0;

	float feedback = 0.985 + feedback1 + feedback2;
	if(!HD){
		feedback *= .998;
	}
      

	float nextFrame = curFrame + feedback * prevFrame;

	if(nextFrame > 1.0){
		nextFrame = 1.0;
	}

	gl_FragColor = pack(vec2(nextFrame, 0.));
	
}