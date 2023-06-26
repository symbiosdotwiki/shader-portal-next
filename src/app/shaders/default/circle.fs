precision highp float;

uniform vec2 resolution;
// uniform vec2 center;
uniform float radius;
uniform sampler2D rand;
uniform sampler2D pebbles;
uniform float iTime;

const vec2 zOffset = vec2(37.0,17.0);
const vec2 wOffset = vec2(59.0,83.0);

vec4 texNoise(vec2 uv)   // Emulate a single texture fetch into the precalculated texture
{
    // NOTE: Precalculate texture, so we can do a single fetch instead of 4.
    // Afaik we can't generate a texture of a specific size in shadertoy at the momemt.
    float r = texture2D( rand, mod((uv+0.5)/256.0, 1.)).r;
    float g = texture2D( rand, mod((uv+0.5 + zOffset)/256.0, 1.)).r;
    float b = texture2D( rand, mod((uv+0.5 + wOffset)/256.0, 1.)).r;
    float a = texture2D( rand, mod((uv+0.5 + zOffset + wOffset)/256.0, 1.)).r;
    
    return vec4(r, g, b, a);
}


float noise4dFast( in vec4 x )
{
    vec4 p = floor(x);
    vec4 f = fract(x);
    f = f*f*(3.0-2.0*f);
    
    vec2 uv = (p.xy + p.z*zOffset + p.w*wOffset) + f.xy;
    
    vec4 s = texNoise(uv);
    return mix(mix( s.x, s.y, f.z ), mix(s.z, s.w, f.z), f.w);
}

void main() {
	vec2 uv = 2.*(gl_FragCoord.xy / resolution - vec2(.5));
	vec4 col = vec4(vec3(0.), 1.);

	vec2 center = vec2(0.);
	center.x = 1.6 * noise4dFast(vec4(vec3(0.), iTime / 3. + 0.)) - .8;
	center.y = 1.6 * noise4dFast(vec4(iTime / 3. + 9999., vec3(0.))) - .8;

	if(length(uv-center)<radius){
		col.xyz = texture2D(pebbles, (uv-center) / radius).rgb;
	}
	gl_FragColor = col;
}