
precision highp float;


uniform vec2 resolution;
uniform sampler2D u_texture;

uniform float intensity;

uniform vec2 lightXY;
uniform float specularHardness;
uniform float specularPower;
uniform float diffusePower;
uniform vec3 viewDir;

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


float luminance(vec3 c)
{
	return dot(c, vec3(.2126, .7152, .0722));
}

vec2 pixelOffset(vec2 offset){
	vec2 uv = gl_FragCoord.xy / resolution;
	return extract(u_texture, uv + offset);
}

vec3 calcNormal()
{
	vec2 yOffset = vec2(0., 1. / resolution.s);
	vec2 xOffset = vec2(1. / resolution.t, 0.);
	float R = abs(pixelOffset(xOffset).x );
	float L = abs(pixelOffset(-xOffset).x );
	float U = abs(pixelOffset(yOffset).x );
	float D = abs(pixelOffset(-yOffset).x );
				 
	float X = (L-R) * .5;
	float Y = (U-D) * .5;

	return normalize(vec3(X, Y, 1. / intensity));
}

void main()
{
	vec3 n = calcNormal();

	vec2 uv = gl_FragCoord.xy / resolution;

	vec3 lp1 = vec3(lightXY, 2.) + vec3(.5, .5, 0.);
	vec3 lp2 = vec3(-lightXY, 2.) + vec3(.5, .5, 0.);

	vec3 sp = vec3(uv, -1.);
	
	vec3 c1 = diffusePower*vec3(dot(n, normalize(lp1 - sp)));
	vec3 c2 = diffusePower*vec3(dot(n, normalize(lp2 - sp)));
	
    vec3 ep = vec3(.5, .5, 0.);
	c1 += specularPower*pow(clamp(dot(normalize(reflect(lp1 - sp, n)), 
					   normalize(sp - ep)), 0., 1.), specularHardness);
	c2 += specularPower*pow(clamp(dot(normalize(reflect(lp2 - sp, n)), 
					   normalize(sp - ep)), 0., 1.), specularHardness);

	float mult = sqrt(extract(u_texture, uv).r);
	gl_FragColor = pack(vec2(c1.r*mult, c2.r*mult));
	// gl_FragColor = vec4(c, 1.);
}
