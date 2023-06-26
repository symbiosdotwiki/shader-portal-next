precision highp float;

uniform float time;
uniform float saturation;
uniform vec2 resolution;
uniform sampler2D u_texture;
uniform sampler2D u_add;

uniform float lightHue;
uniform float secondLight;
uniform float hueShift;
uniform float satMult;

const float BASE = 255.0;
const float scale = BASE * BASE;
const float OFFSET = 0.0;

const float PI = 3.1415926535;

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

vec3 hsv2rgb(vec3 c) {
	c.r = mod(c.r, 1.);
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 thinfilm(float t, float x, float d){
	return .5*(vec3(
		cos( 2.*PI * (x) ),
		cos( 2.*PI * 1.1 * t * (x + .0) ),
		cos( 2.*PI * 1.2 * t * (x + .0) )
	) * exp(-d * t) + 1.);
}


void main() {
	vec2 uv = gl_FragCoord.xy / resolution;
	vec2 l = extract(u_texture, uv);
	float lh = 1. + sin(lightHue);
	//vec3 light1 = thinfilm(3.*lh, .5, .3);// 1./saturation);
	vec3 light1 = l.x * hsv2rgb(vec3(lightHue, saturation * satMult, .85));
	// vec3 light2 = l.y * thinfilm(1.-l.y, lightHue, 1./saturation);
	// light2 = vec3(0.);
	vec3 light2 = l.y * hsv2rgb(vec3(lightHue + .5, saturation * satMult, .85));
	vec3 rgb = texture2D(u_add, uv).rgb;
	rgb = rgb2hsv(rgb);
	rgb = hsv2rgb(rgb + vec3(hueShift, 0., 0.));
	vec3 val = light1 + secondLight * light2 + rgb;
	gl_FragColor = vec4(val, 1.);
	// gl_FragColor = vec4(light1, 1.);
	// gl_FragColor = vec4(thinfilm(uv.x*4., .8, .2), 1.);
}