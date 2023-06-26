precision highp float;

uniform vec2 resolution;
uniform sampler2D u_texture;
uniform float iTime;

const float PI = 3.1415926535897;

vec3 sphericalToCartesian( float rho, float phi, float theta ) {
    float sinTheta = sin(theta);
    return vec3( sinTheta*cos(phi), sinTheta*sin(phi), cos(theta) )*rho;
}

int state(vec2 uv){
	if(uv.x > 1.){
		uv.x -= 1.;
	}
	if(uv.x < 0.){
		uv.x += 1.;
	}
	if(uv.y > 1.){
		uv.y -= 1.;
	}
	if(uv.y < 0.){
		uv.y += 1.;
	}
	return texture2D(u_texture, uv).r > .5 ? 1 : 0;
}

int sphericalState(vec2 uv){
	vec2 offset = uv * vec2(2.*PI, PI);
	vec3 sphereMap = sphericalToCartesian(1., offset.x, offset.y);
	return state(sphereMap.xy);
}

void main() {
		vec2 UV = gl_FragCoord.xy / resolution;

		int curState = state(UV);

		int sum = 0;

		for(int i = -1; i <= 1; i ++){
			for(int j = -1; j <= 1; j ++){
				if( !(i == 0 && j == 0)){
					vec2 offset = UV + vec2(i, j) /  resolution;
					sum += state(offset);
				}
			}
		}

		float newState1 = 
			(curState == 0 && sum == 3) || 
			(curState == 1 && (sum == 3 || sum == 2)) ? 1. : 0.;
		float newState2 = 
			(curState == 0 && sum == 2) || 
			(curState == 1 && (sum <= 4 || sum >= 2)) ? 1. : 0.;

		float newState = iTime > 10. && iTime < 10.3 ? newState2 : newState1;
		
		gl_FragColor = vec4(vec3(newState1), 1);
		// gl_FragColor = vec4(curState, curState, curState, 1);
		// gl_FragColor = vec4(.5, .1, 0, 1);

}