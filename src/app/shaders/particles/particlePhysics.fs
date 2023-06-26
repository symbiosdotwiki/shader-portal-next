precision highp float;

varying vec2 v_texcoord;
uniform vec2 resolution;
uniform sampler2D u_pheromones;
uniform sampler2D u_position;
uniform sampler2D u_velocity;
uniform int pass;
uniform float time;

const float BASE = 255.0;
const float scale = BASE * BASE;
const float OFFSET = 0.0;
const float PI = 3.1415926535;

float atan2(in float y, in float x)
{
    float s = (abs(x) > abs(y)) ? 1. : 0.;
    return mix(PI/2.0 - atan(x,y), atan(y,x), s);
}

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float noise(vec2 uv, float time){
	return noise(vec3(uv, time));
}

vec2 encode(float value) {
    value = floor(value * scale + OFFSET);
    float x = mod(value, BASE);
    float y = floor(value / BASE);
    return vec2(x, y) / BASE;
}

float sinh(float x){
	return ( exp(x) - exp(-x) ) / 2.;
}

float cosh(float x){
	return ( exp(x) + exp(-x) ) / 2.;
}

float tanh(float x){
	return sinh(x) / cosh(x);
}

float sStep(float x, int nSteps, int aI){
	float a = float(aI);
	x *= 2.;
	x = mod(x, 1.);
	float h = 1. / (.00001 + float(nSteps));
	float w = h;
	// return 1. - abs(1. - h * (
	// 	1./(2.*tanh(a/2.)) * tanh(
	// 		a * (fract(x/w)-0.5)
	// 	) + .5 + floor(x/w)
	// ));
	return 1. - abs(
		1. - h * (
			.5 / tanh(a/2.) * tanh(
				a * (
					(x/w - floor(x/w)) - 0.5)
				) + .5 + floor(x/w)
			)
		);
}

vec4 pack(vec2 value){
	return vec4(encode(value.x), encode(value.y));
}

float decode(vec2 channels) {
    return (dot(channels, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
}

vec2 extract(sampler2D tex, vec2 texcoord){
	vec4 valueRAW = texture2D(tex, mod(texcoord, 1.));
	return vec2(decode(valueRAW.rg), decode(valueRAW.ba));
}

vec2 n2rand(float mult) {
	return vec2(
		fract(sin(dot(v_texcoord.xy * mult, vec2(12.9898, 78.233))) * 43758.5453),
		fract(sin(dot(v_texcoord.xy * 1.61803 * mult, vec2(12.9898, 78.233))) * 43758.5453)
	);
}

vec2 n2rand() {
	return n2rand(1.);
}

vec2 unitCircle(float angle){
	return vec2( cos(angle), sin(angle) );
}

vec2 unitCircleDeg(float angle){
	return unitCircle(PI*angle/180.0);
}

void main() {
	float maxVel = 1.8 + .45 * sin(time*3.111) +  + .9 * cos(time*.411);
	if(pass == 0){
		vec2 r, d, a, x, v;

		vec2 velOut, posOut;

		x = extract(u_position, v_texcoord);
		v = extract(u_velocity, v_texcoord);

		velOut = (2. * v - 1.);

		vec2 uv = x;

		float velMult = 1.;

		// sin(time*1.63)*
		float sensorDist = 33. + 32.*(pow(noise(
			uv * sStep(.0173*time, 12, 1) * 6., 
			time * .43752
		), 1.) *2. - 1.);

		// sensorDist = 30.;

		// sensorDist = 30.;

		// float sensorDist2 = 15. + 14.*(pow(noise(vec3(
		// 	uv * 1.*(1. + cos(time * 3.21334)), 
		// 	time * 15.232)
		// ), 2.) *2. - 1.);

		// float sensorDist3 = 70. + 69.*(pow(noise(vec3(
		// 	uv * 15.*(1. + cos(time * 1.21334)), 
		// 	time * 5.232)
		// ), 2.) *2. - 1.);
		float multy = sStep(.773*time, 10, 4) * 3. + 1.;
		// multy = 3.;
		// multy = pow(noise(uv * 1., time * .122), 2.) * 3. + 1.;
		float sensorDist2 = sensorDist / multy;
		float sensorDist3 = sensorDist * multy;

		// float degTurn = 1.// + 8.2*(sin(time*1.512)+1.)/2.567;
		// + 5.*(pow(noise(
		// 	uv*(2. + 3.5*sin(time*1.885)), 
		// 	time*0.7112
		// ) * 2. - 1., 33.));

		float degTurn = 20.*(2. + sin(time*.1347))*sStep(
			noise(
				uv*(sStep(time*.07742, 10, 4)*3.), 
				.2144*time
			),
		10, 6);

		float randAngle = 90.*sStep(
			noise(
				uv*(1. + sStep(time*.06342, 10, 2)*4.),
				.5131*time
			),
		16, 6);
		// randAngle = degTurn;

		// + 8.2*(sin(time*5.12)+1.)/2.56;
		degTurn = radians(degTurn);
		randAngle = radians(randAngle);

		float degRange = degTurn * sStep(.0143*time, 4, 4);

		// float degRange = 180.*sStep(300.*time, 8, 100);
		// degRange = radians(degRange);

		float curSensor = extract(u_pheromones, uv).r * 4. * (1.5+sin(time / 3.12));

		float degMulty= 1.5 * 2.-curSensor;
		float velMulty = 1.2 * curSensor;
		degRange *= curSensor;
		randAngle *= curSensor * sin(time / 1.12);
		degTurn *= 1.1 + sin(curSensor / 3.3);
		sensorDist *= pow(curSensor, 1.+sin(time*2.114));
		sensorDist2 *= curSensor;
		sensorDist3 *= curSensor;

		float velAngle = atan2(velOut.y, velOut.x);

		vec2 sensorDistScaled = sensorDist / resolution;
		vec2 sensorDistScaled2 = sensorDist2 / resolution;
		vec2 sensorDistScaled3 = sensorDist3 / resolution;


		vec2 fSensorOffset = sensorDistScaled * unitCircle(velAngle);
		vec2 lSensorOffset = sensorDistScaled * unitCircle(velAngle + degRange);
		vec2 rSensorOffset = sensorDistScaled * unitCircle(velAngle - degRange);

		float fSensor = extract(u_pheromones, uv + fSensorOffset).r;
		float lSensor = extract(u_pheromones, uv + lSensorOffset).r;
		float rSensor = extract(u_pheromones, uv + rSensorOffset).r;


		// vec2 fSensorOffset2 = sensorDistScaled2 * unitCircle(velAngle);
		// vec2 lSensorOffset2 = sensorDistScaled2 * unitCircle(velAngle + degRange/degMulty);
		// vec2 rSensorOffset2 = sensorDistScaled2 * unitCircle(velAngle - degRange/degMulty);

		// float fSensor2 = extract(u_pheromones, uv + fSensorOffset2).r;
		// float lSensor2 = extract(u_pheromones, uv + lSensorOffset2).r;
		// float rSensor2 = extract(u_pheromones, uv + rSensorOffset2).r;


		// vec2 fSensorOffset3 = sensorDistScaled3 * unitCircle(velAngle);
		// vec2 lSensorOffset3 = sensorDistScaled3 * unitCircle(velAngle + degRange*degMulty);
		// vec2 rSensorOffset3 = sensorDistScaled3 * unitCircle(velAngle - degRange*degMulty);

		// float fSensor3 = extract(u_pheromones, uv + fSensorOffset3).r;
		// float lSensor3 = extract(u_pheromones, uv + lSensorOffset3).r;
		// float rSensor3 = extract(u_pheromones, uv + rSensorOffset3).r;


		// // fSensor3 = 0.;
		// // lSensor3 = 0.;
		// // rSensor3 = 0.;

		// fSensor = max(max(fSensor, fSensor2), fSensor3);
		// lSensor = max(max(lSensor, lSensor2), lSensor3);
		// rSensor = max(max(rSensor, rSensor2), rSensor3);

		float lrDiff = abs(lSensor - rSensor);
		lrDiff *= 3.;
		lrDiff = 1. / (lrDiff + 2.1);


		if(fSensor >= lSensor && fSensor >= rSensor){
			velOut = unitCircle(velAngle) * lrDiff;
		}
		if(lSensor >= fSensor && lSensor >= rSensor){
			// if(lSensor == lSensor2){
			// 	degTurn /= degMulty;
			// 	velMult *= velMulty;
			// }
			// else if(lSensor == lSensor3){
			// 	degTurn *= degMulty;
			// 	velMult /= velMulty;
			// }
			velOut = unitCircle(velAngle + degTurn) * lrDiff;
		}
		else if(rSensor >= lSensor && rSensor >= fSensor){
			// if(rSensor == rSensor2){
			// 	degTurn /= degMulty;
			// 	velMult *= velMulty;
			// }
			// else if(rSensor == rSensor3){
			// 	degTurn *= degMulty;
			// 	velMult /= velMulty;
			// }
			velOut = unitCircle(velAngle - degTurn) * lrDiff;
		}
		else{
		//   float randVal = n2rand();
			float rNum = sin(5000000.*time*n2rand(time*10.).r);
			rNum = n2rand(time*10.).r - .5;

				// float curVal = texture2D(u_pheromones, uv).r;
			 //  velOut = unitCircle(velAngle + fSensor * degTurn * sin(time));
			 if(rNum > 0.){
			 	velOut = unitCircle(velAngle - randAngle) * .9;
			 }
			 else{
			 	velOut = unitCircle(velAngle + randAngle) * .9;
			 }

			 // velOut = vec2(0.);

			 // velOut = unitCircle(velAngle + 8. * sin(time*2.997));
		  // velOut = rNum;
		}

		// velOut -= vec2(.75, 0.);

		// posOut += velOut;
		velOut *= noise(vec3(uv * 3.* (1.1 + sin(time*.11325)), time*1.113)) * .5 + .5;
		velOut *= velMult;// * 2.;
		v = (velOut + vec2(1.)) / 2.;

		

		gl_FragColor = pack(v);
	}
	if(pass == 1){
		vec2 x = extract(u_position, v_texcoord);
		vec2 v = extract(u_velocity, v_texcoord);

		float lenX = pow(smoothstep(0., .5, length(x-.5)), 4.) * .8;

		v = 2. * v - vec2(1.);
		// v = -.3 * (1. - lenX) * x ;//+ lenX * v;
		// v = -lenX * (x - .5) * .3 + (1.-lenX)*v;
		x += v * maxVel / resolution;


		// if(length(x -.5 + .1*unitCircle(n2rand().r * 22.*PI)) > .42){
		// 	x = vec2(0.5) + .25 * unitCircle(n2rand().x*200.) + .1 * unitCircle((n2rand().y*500.));
		// }

		x = mod(x, 1.);

		gl_FragColor = pack(x);
		// gl_FragColor = pack(x);
		// gl_FragColor = texture2D(u_position, v_texcoord);
	}
}