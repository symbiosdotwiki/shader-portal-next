precision highp float;

// Uses code by IQ and anatole duprat - XT95/2015
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

// Approximating Translucency for a Fast, Cheap and Convincing Subsurface Scattering Look :
// http://colinbarrebrisebois.com/2011/03/07/gdc-2011-approximating-translucency-for-a-fast-cheap-and-convincing-subsurface-scattering-look/

struct Ray{
  vec3 p;
  int obj;
  float d;
};

uniform float iTime;
uniform sampler2D iChannel0;
uniform sampler2D randSampler;
uniform vec3 iAudio;
uniform vec2 iResolution;

uniform float tunnelPos;
uniform float fisheye;
uniform vec2 creatureXY;
uniform float tunnelLight;
uniform float tunnelBase;
uniform float creatureLight;
uniform float wingRot;
uniform float creatureFlip;
uniform float creatureTwist;
uniform int HD;
uniform float fairyLight;
uniform float tunnelWonky;
uniform float tunnelWidth;
uniform float checker;
uniform float fairyTime;
uniform vec2 rayUp;

const float PI = 3.14159265359;
const vec3 ax = vec3(1., 0., 0.);

Ray raymarche( in vec3 ro, in vec3 rd, in vec2 nfplane );
vec3 normal( in vec3 p );
Ray map( in vec3 p );
mat3 lookat( in vec3 fw, in vec3 up );
vec3 rotate( in vec3 v, in float angle, in vec3 pos);
float thickness( in vec3 p, in vec3 n, float maxDist, float falloff );
float ambientOcclusion( in vec3 p, in vec3 n, float maxDist, float falloff );
float smin( float a, float b, float k );


vec3 lpos1,lpos2,lpos3;
vec3 lpos4,lpos5,lpos6;
vec3 pCreature, pCreatureOffset;
vec4 rCreature;
vec3 posOff;
vec3 sssColor, diffColor1, diffColor2, diffColor3;

// vec2 tunnelOffset, tunnelWave;
// vec4 rCreatureI;
vec3 pTunnel;

vec3 fairy[9];
const int numFairy = 9;

float aoMaxSteps = 3.0;


vec4 quat_from_axis_angle(vec3 axis, float angle)
{ 
  vec4 qr;
  float half_angle = (angle * 0.5);
  qr.x = axis.x * sin(half_angle);
  qr.y = axis.y * sin(half_angle);
  qr.z = axis.z * sin(half_angle);
  qr.w = cos(half_angle);
  return qr;
}

vec4 quat_conj(vec4 q)
{ 
  return vec4(-q.x, -q.y, -q.z, q.w); 
}
  
vec4 quat_mult(vec4 q1, vec4 q2)
{ 
  vec4 qr;
  qr.x = (q1.w * q2.x) + (q1.x * q2.w) + (q1.y * q2.z) - (q1.z * q2.y);
  qr.y = (q1.w * q2.y) - (q1.x * q2.z) + (q1.y * q2.w) + (q1.z * q2.x);
  qr.z = (q1.w * q2.z) + (q1.x * q2.y) - (q1.y * q2.x) + (q1.z * q2.w);
  qr.w = (q1.w * q2.w) - (q1.x * q2.x) - (q1.y * q2.y) - (q1.z * q2.z);
  return qr;
}

vec3 rotate_vertex_position(vec3 position, vec4 qr)
{ 
  // vec4 qr = quat_from_axis_angle(axis, angle);
  vec4 qr_conj = quat_conj(qr);
  vec4 q_pos = vec4(position.x, position.y, position.z, 0);
  
  vec4 q_tmp = quat_mult(qr, q_pos);
  qr = quat_mult(q_tmp, qr_conj);
  
  return vec3(qr.x, qr.y, qr.z);
}

vec2 GetGradient(vec2 intPos, float t) {
    
    // Texture-based rand (a bit faster on my GPU)
    float rand = texture2D(randSampler, intPos / 64.0).r;
    
    // Rotate gradient: random starting rotation, random rotation rate
    float angle = 600.283185 * rand + 4.0 * t * rand;
    return vec2(cos(angle), sin(angle));
}


float Pseudo3dNoise(vec3 pos) {
    vec2 i = floor(pos.xy);
    vec2 f = pos.xy - i;
    vec2 blend = f * f * (3.0 - 2.0 * f);
    float noiseVal = 
        mix(
            mix(
                dot(GetGradient(i + vec2(0., 0.), pos.z), f - vec2(0., 0.)),
                dot(GetGradient(i + vec2(1., 0.), pos.z), f - vec2(1., 0.)),
                blend.x),
            mix(
                dot(GetGradient(i + vec2(0., 1.), pos.z), f - vec2(0., 1.)),
                dot(GetGradient(i + vec2(1., 1.), pos.z), f - vec2(1., 1.)),
                blend.x),
        blend.y
    );
    return noiseVal / 0.7; // normalize to about [-1..1]
}

vec3 threePsuedo3dNoise(vec3 pos){
    vec3 threeNoise;
    threeNoise.x = Pseudo3dNoise(pos + vec3(0.1, 0., 0.));
    threeNoise.y = Pseudo3dNoise(pos + vec3(0.3111, 10., 999.123));
    threeNoise.z = Pseudo3dNoise(pos + vec3(0.3578, 110., 999999.45));
    return threeNoise;
}


vec3 objTrans(vec3 pos, vec3 oPos, vec4 qr){
    return rotate_vertex_position(pos, qr) + oPos;
}

vec3 objTransI(vec3 pos, vec3 oPos, vec4 qr){
    return rotate_vertex_position(pos - oPos, quat_conj(qr));
}

vec3 creature(vec3 pos){
    return objTransI(pos + pCreatureOffset, pCreature, rCreature) - pCreatureOffset;
}

vec3 creatureI(vec3 pos){
    return objTrans(pos - pCreatureOffset, pCreature, rCreature) + pCreatureOffset;
}

float hash(float c){return fract(sin(dot(c,12.9898))*43758.5453);}

vec3 polarCoord(float r, float phi, float theta )
{
    // Theta starts at groundPlane
 	return vec3(
        r * sin(PI/2. - theta) * cos(phi),
        r * cos(PI/2. - theta),
       	r * sin(PI/2. - theta) * sin(phi)  
    );
}

vec3 polarCoordDeg(float r, float phi, float theta )
{
 	return polarCoord(r, phi * PI / 180., theta  * PI / 180. );
}

vec3 rectCoord(vec3 pos){
 	float r = length(pos);
    float theta = atan(pos.y, pos.x);
    float phi = atan(length(pos.xy), pos.z);
    return vec3(r, phi, theta);
}

// Picking colors with HSV is much simpler
vec3 hsv(float cX, float cY, float cZ)
{
    cX -= float(int(cX));
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(vec3(cX) + K.xyz) * 6.0 - K.www);
    return cZ * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), cY);
}

// Linear white point
const float W = 1.2;
const float T2 = 7.5;

//Gamma correction
vec3 gamma(vec3 x, float gamma) {
    return pow(x, vec3(1./gamma));
}

float fadeIn(float t){
 	return min(iTime/t,1.); 
}
    

Ray raymarche( in vec3 ro, in vec3 rd, in vec2 nfplane ){
    const int maxSteps = 80;
    float epsilon = 0.001;
	Ray ray = Ray(
        ro+rd*nfplane.x, 
        -1,
        -1.0
    );
	float t = 0.;
	for(int i=0; i<maxSteps; i++)
	{
        ray = map(ray.p);
        t += ray.d;
        ray.p += rd * ray.d;
        if( 
            ray.d < epsilon || 
            t > (nfplane.y - (1. - float(HD)) * 200.) ||
            (i > maxSteps / 4 && HD==0)
        )
            break;   
	}
	
	return ray;
}

vec3 normal( in vec3 p ){
	vec3 eps = vec3(0.001, 0.0, 0.0);
	return normalize( vec3(
		map(p+eps.xyy).d-map(p-eps.xyy).d,
		map(p+eps.yxy).d-map(p-eps.yxy).d,
		map(p+eps.yyx).d-map(p-eps.yyx).d
	) );
}


mat3 lookat( in vec3 fw, in vec3 up ){
	fw = normalize(fw);
	vec3 rt = normalize( cross(fw, normalize(up)) );
	return mat3( rt, cross(rt, fw), fw );
}


vec3 rotate( in vec3 v, in float angle, in vec3 pos){
	vec4 qr = quat_from_axis_angle(v, angle);
    return rotate_vertex_position(pos, qr);
}


float skinLookup(vec2 pos)
{
    float phase = .4*texture2D(iChannel0, mod(pos / 4., 1.0)).r;
    vec2 offset = vec2(sin(phase + iTime/20.), cos(phase + iTime/23.));
    return texture2D(iChannel0, mod(pos + offset, 1.0)).r ;
}

float smin( float a, float b, float k ) //Thx to iq^rgba
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float smax( float d1, float d2, float k )
{
	float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
	return mix( d2, -d1, h ) + k*h*(1.0-h);
}


vec3 randomSphereDir(vec2 rnd)
{
	float s = rnd.x*PI*2.;
	float t = rnd.y*2.-1.;
	return vec3(sin(s), cos(s), t) / sqrt(1.0 + t * t);
}

vec3 randomHemisphereDir(vec3 dir, float i)
{
	vec3 v = randomSphereDir( vec2(hash(i+1.), hash(i+2.)) );
	return v * sign(dot(v, dir));
}


float sdRoundCone( in vec3 p, in float r1, float r2, float h )
{
    vec2 q = vec2( length(p.xz), p.y );
    
    float b = (r1-r2)/h;
    float a = sqrt(1.0-b*b);
    float k = dot(q,vec2(-b,a));
    
    if( k < 0.0 ) return length(q) - r1;
    if( k > a*h ) return length(q-vec2(0.0,h)) - r2;
        
    return dot(q, vec2(a,b) ) - r1;
}

float sdCappedTorus(in vec3 p, in vec2 sc, in float ra, in float rb, in float h)
{
    p.z /= h;
    p.x = abs(p.x);
    float k = (sc.y*p.x>sc.x*p.y) ? dot(p.xy,sc) : length(p.xy);
    return (sqrt( dot(p,p) + ra*ra - 2.0*ra*k ) - rb) * min(h, 1.);
}

float sdCappedCylinder( vec3 p, float r, float h )
{
  vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(h,r);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}


float ambientOcclusion( in vec3 p, in vec3 n, float maxDist, float falloff )
{
	const int nbIte = 8;
    const float nbIteInv = 1./float(nbIte);
    const float rad = 1.-1.*nbIteInv; //Hemispherical factor (self occlusion correction)
    
	float ao = 0.0;
    for( int i=0; i<nbIte; i++ )
    {
        if(HD == 0 && i > nbIte / 8) break;
        float l = hash(float(i))*maxDist;
        vec3 rd = normalize(n+randomHemisphereDir(n, l )*rad)*l; // mix direction with the normal
            												        // for self occlusion problems
        ao += (l - map( p + rd ).d) / pow(1.+l, falloff);
    }
    return clamp( 1.-ao*nbIteInv, 0., 1.);
}


float thickness( in vec3 p, in vec3 n, float maxDist, float falloff )
{
    // Num near samples
	const int nbIte = 8;
    const float nbIteInv = 1./float(nbIte);    
	float ao = 0.0;
    for( int i=0; i<nbIte; i++ )
    {
        if(HD == 0 && i > nbIte / 8) break;
            float l = hash(float(i))*maxDist;
            // Normal is reversed from ao calculation
            vec3 rd = normalize(-n)*l;
            ao += (l + map( p + rd ).d) / pow(1.+l, falloff);
        
    }
    return clamp( 1.-ao*nbIteInv, 0., 1.);
}

vec4 calcTunnelOffset(vec3 tunnelP){
    vec2 tO = 6.*vec2(sin(tunnelP.x/12.), cos(tunnelP.x/12.));
    vec2 tW = 8.*vec2(sin(tunnelP.x/32.), cos(tunnelP.x/22.));
    return vec4(tO, tunnelWonky * tW);
}

//Map
Ray map( in vec3 p )
{
    float fairyDist = 999.;
    float fairySize = .08;
    // if(HD == 1){
    for(int i = 0; i < numFairy; i++){
        if(HD == 1 || mod(float(i), 2.) == 0.){
        float fd = length(p - fairy[i]) - fairySize;
        fairyDist = min(fairyDist, fd);
        }
    }
    // }

    vec3 pCreatROT = creature(p);;

    vec3 bBallCenter = creature(lpos1) - posOff;
    vec3 lBallCenter = creature(lpos1);
    float wingRotMod = mod(-wingRot, 1.);
    float suckIn = abs(3. * max(.333, wingRotMod) - 2.);
    vec3 tBallCenter = bBallCenter + vec3(0., 5., 4.) * suckIn;
    vec3 cBallCenter = bBallCenter + vec3(4. + sin(iTime), -3., 2.);

    // Render light balls
    float lightBallRad = .25;
    //p.xz = mod(p.xz+100., 200.)-100.;
    float d = 100.;//+textureLod(iChannel0, p.xz*.05, 0.0).r*1.5;
    d = min(d, length(pCreatROT-creature(lpos1))-lightBallRad);
    
    float lightBallRadWing = .2;
    d = min(d, length(pCreatROT-creature(lpos4))-lightBallRadWing);
    d = min(d, length(pCreatROT-creature(lpos5))-lightBallRadWing);
    d = min(d, length(pCreatROT-creature(lpos6))-lightBallRadWing);

    // Render skin ball
    
    
    
    float bBallRad = 6.;
    float lBallRad = lightBallRad + .5;
    float tBallRad = 3.;
    //p.xz = mod(p.xz, 60.)-30.;
    //p = rotate(vec3(0.,1.,0.), p.y*.05*cos(iTime+sin(iTime*1.5+id.x*5.)+id.y*42.))*p;
    float bD = length(pCreatROT-bBallCenter) - bBallRad;
    float lD = length(pCreatROT-lBallCenter) - lBallRad;
    float tD = length(pCreatROT-tBallCenter) - tBallRad;
    float tD2 = length(pCreatROT-cBallCenter) - tBallRad/1.5  * (pow(iAudio[1], .5) + .5);
    float texDisp = .35 * skinLookup(
        (pCreatROT-bBallCenter).yz / 15.
    );
    d = min(d, smin(smin(smax(tD2, bD, 0.6), lD, 1.), tD, 2.) - texDisp );

    //return d;
    
    vec3 pBranch = rotate(ax, 2.*PI/8., pCreatROT - bBallCenter);
    float branch = sdRoundCone(pBranch, .7, .3, 10.);
    
    pBranch = rotate(ax, 3.*PI/8., pCreatROT - bBallCenter);
    branch = smin(branch, sdRoundCone(pBranch, .7, .3, 10.), 2.);
    
    pBranch = rotate(ax, 4.*PI/8., pCreatROT - bBallCenter);
    branch = smin(branch, sdRoundCone(pBranch, .7, .3, 10.), 2.);
    
    pBranch = rotate(ax, 5.*PI/8., pCreatROT - bBallCenter);
    branch = smin(branch, sdRoundCone(pBranch, .7, .3, 10.), 2.);
    
    vec3 pWing = rotate(ax, 1.38 - 2.*PI * wingRot,  
        pCreatROT - bBallCenter + vec3(0., 0., .5));
    float wing = sdCappedTorus(
        pWing.zyx, 
        vec2(sin(.7),cos(.7)), 
        11., 1.5, .33
    );
    branch = smin(branch, wing, 1.);

    d = smin(d, branch - texDisp * .5, 2.);

    vec3 tunnelP = p - pTunnel;

    vec4 tunnelOffset = calcTunnelOffset(tunnelP);
    float tDist = length(tunnelP.yz + tunnelOffset.xy + tunnelOffset.zw);
    float cylinder = max(
        tunnelWidth - tDist, 
    0.);
    cylinder *= min(1., 1./max(0.001, (abs(tunnelWonky)+.5)));
    // // if(max(abs(tunnelOffset.x + tunnelOffset.z), abs(tunnelOffset.y + tunnelOffset.w)) > 1.){
    //     cylinder *= .5;
    // // }
    int obj = 0;

    // if(HD == 1){
    if(fairyDist < d && fairyDist < cylinder){
        d = smin(d, fairyDist, .5);
        obj = 2;
    }
    // }

    else if(cylinder < d){
        obj = 1;
        d = cylinder;
    }
    
    return  Ray(p, obj, d);
}

vec3 gradLight(vec3 pos){
    // pos = creature(pos - pCreatureOffset) + pCreatureOffset - pCreature;
    pos = rotate_vertex_position(pos - pCreature - pCreatureOffset, quat_conj(rCreature)) + pCreatureOffset;
    float angle = (atan(pos.y, pos.z) + PI) / (2. * PI);
    return hsv(angle * 3. + .2*sin(iTime * 1.5), .8, .4);
}

//Shading
vec3 shade( in Ray ray, in vec3 n, in vec3 ro, in vec3 rd )
{		
    vec3 p = vec3(ray.p);

    // vec3 diffColor4 = ;

    vec3 dC4 = gradLight(lpos4);
    vec3 dC5 = gradLight(lpos5);
    vec3 dC6 = gradLight(lpos6);
    
    float nLookup = skinLookup(rectCoord(n).yz / 25.);
    float nLookup2 = nLookup * nLookup - .5;
    vec3 skinColor = hsv(0.03, 0.3, nLookup-.2) + hsv(0.03 + nLookup2*.8, 0.7 - nLookup2, nLookup);
    skinColor /= 1.5;
    skinColor = abs(skinColor * skinColor);
    float roughness = 0.05;
    float shininess = .05;
    
    
    // Light positions wrt raymarch point
    float lL1 = length(lpos1-p);
    float lL2 = length(lpos2-p);
    float lL3 = length(lpos3-p);
    float lL4 = length(lpos4-p);
    float lL5 = length(lpos5-p);
    float lL6 = length(lpos6-p);

	vec3 ldir1 = (lpos1-p) / lL1;	
	vec3 ldir2 =  (lpos2-p) / lL2;	
	vec3 ldir3 =  (lpos3-p) / lL3;
    
    vec3 ldir4 = (lpos4-p) / lL4;	
	vec3 ldir5 =  (lpos5-p) / lL5;	
	vec3 ldir6 =  (lpos6-p) / lL6;
    
    float latt1 = .3*pow(lL1 *.15, 3. ) / iAudio.x;
    float latt2 = pow( lL2*.15, 3. ) / iAudio.y;
    float latt3 = 3.*pow( lL3*.15, 2.5 ) / iAudio.z;

    float latt4 = .3*pow( lL4*.15, 3. ) / iAudio.x;
    float latt5 = pow(lL5*.15, 3. ) / iAudio.y;
    float latt6 = pow( lL6*.15, 3. ) / iAudio.z;

    diffColor1 = hsv(-.001/latt1+.5, .8, .3);
    
    // SSS multiplier (thickness) and AO
    float sssThick = .8;
	float thick = thickness(p, n, aoMaxSteps, 1./sssThick);
    
    float aoFalloff = 1.;
	// float occ = .1*pow( ambientOcclusion(p, n, aoMaxSteps, aoFalloff), 6.);

    // Diffuse lighting from lights
	// vec3 diff1 = diffColor1 * (max(dot(n,ldir1),0.) ) / latt1;
	vec3 diff2 = diffColor2 * (max(dot(n,ldir2),0.) ) / latt2;
	// vec3 diff3 = diffColor3 * (max(dot(n,ldir3),0.) ) / latt3;

    vec3 col = vec3(0.);//skinColor * diff2;// + diff2;// + diff3;
    

    vec3 refl = reflect(rd,n);  

    float fairySSS = 0.;
    if(HD == 1){
        for(int i = 0; i < numFairy; i++){
            vec3 fpos = fairy[i];
            float ftrans = clamp( dot(-rd, -fpos+n), 0., 1.) + 1.;
            float flatt = pow( length(fpos-p), 4. );
            fairySSS += ftrans/flatt;
            }
    }
    fairySSS *= fairyLight;

    float trans1 =  clamp( dot(-rd, -ldir1+n), 0., 1.) + 1. ;
    float trans2 =  clamp( dot(-rd, -ldir2+n), 0., 1.) + 1. ;
    float trans3 =  clamp( dot(-rd, -ldir3+n), 0., 1.) + 1. ;
    
    // SSS from lights inside
    float trans4 =  clamp( dot(-rd, -ldir4+n), 0., 1.) + 1.;
    float trans5 =  clamp( dot(-rd, -ldir5+n), 0., 1.) + 1. ;
    float trans6 =  clamp( dot(-rd, -ldir6+n), 0., 1.) + 1. ;

    vec3 headLights = diffColor3 * creatureLight * trans3/latt3; 
    vec3 bodyLights = creatureLight * gradLight(p) * (
        dC4*trans4/latt4 + dC5*trans5/latt5 + dC6*trans6/latt6
    );
    vec3 topLight = diffColor2 * creatureLight * thick * trans2/latt2;
    

    if(ray.obj == 0){
        col = skinColor * diff2;// + diff2;// + diff3;
        // SSS from lights inside        
        
        col += thick * (sssColor * (
            .01*diffColor1*trans1/latt1 + 
            .2 * topLight) +
            .1 * headLights + 
            .05 * bodyLights +
            .001 * fairySSS
        ) ;
        col *= (.2 + .8*skinColor);
        float spec = pow(clamp( dot( refl, ldir2 ), 0.0, 1.0 ),1./roughness);
        col += shininess*spec + .02*skinColor;
        // col = gradLight(p);
    }

    else if(ray.obj == 1){
        vec3 pTunnelOff = p - pTunnel;
        vec4 tunnelOffset = calcTunnelOffset(pTunnelOff);
        pTunnelOff += 1. * vec3(0., tunnelOffset.xy);
        float spec = pow(clamp( dot( refl, ldir2 ), 0.0, 1.0 ), 1.);
        spec = 1.;
        spec =  3. * spec * iAudio[2] * tunnelLight + tunnelBase;
        int dBool = int(mod(length(pTunnelOff.x/12.) * 2., 2.));
        float angle = (atan(pTunnelOff.z, pTunnelOff.y)+PI) / (2. * PI);
        int aFix = 0;
        int aBool = int(mod(angle * checker - checker / 2. - .5, 2.));
        float checker = mod(float(dBool + aBool + aFix), 2.0);
        col = 
            vec3(checker) * (spec) * (
                pow(min(abs(p.x-50.), 300.)/300., 4.)  + 
                2. * bodyLights + 
                15. * headLights +
                pow(smoothstep(.0, .5, fairySSS), .6)
            ) + 10.*pow(smoothstep(.0, 2., fairySSS), 1.) * .3;
    }

    else if(ray.obj == 2){
        col = vec3(fairyLight * (iAudio[0] + .5));
    }

	return col;
}

vec3 render(vec2 q)
{
    // Camera coordinates
	vec2 v = -1.0 + 2.0*q;
	v.x *= iResolution.x/iResolution.y;


    sssColor = hsv(0.2, 0.6, 1.5);
    diffColor1 = hsv(0.3, 0.9, .5);
    diffColor2 = hsv(0.7, 0.1, 0.1);
    diffColor3 = hsv(0.9, 0.1, 0.5);
    
    //Camera Settings
    // float fisheye = ;
    float lens = 1.9 - fisheye * length(v);
    vec2 nfplane = vec2(.001, 400.);

    vec3 lightOffset = vec3(cos(iTime*.5)*6., 0., sin(iTime*.5)*15.);

    vec3 axisCreature = vec3(0., sin(iTime/1.4), cos(iTime/1.4));
    vec3 axisCreatureFlip = vec3(0., 0., 1.);
    vec3 axisCreatureTwist = vec3(0., 1., 0.);
    pCreature =  vec3(-15.-5.*exp(-cos(iTime/1.77)),-1.5+exp(-sin(iTime)), -1.);
    pCreature += vec3(creatureXY, 0.);
    // pCreature = vec3(0);

    posOff = vec3(6., 1.5, 1.5);
    
    pCreatureOffset = 3. * vec3(exp(-sin(iTime/1.53)),exp(-sin(iTime*1.11)), -cos(iTime*2.11));
    
    //Flip
    rCreature = quat_from_axis_angle(axisCreature, 2.*PI*creatureFlip);
    // rCreatureI = quat_from_axis_angle(axisCreature, -2.*PI*creatureFlip);

    //Twist
    rCreature = quat_mult(
        rCreature,
        quat_from_axis_angle(axisCreatureTwist, 2.*PI*creatureTwist)
    );
    // rCreatureI = quat_from_axis_angle(axisCreatureTwist, -2.*PI*creatureTwist);

    rCreature = quat_mult(
        rCreature,
        quat_from_axis_angle(axisCreature, PI/6. * sin(iTime))
    );
    // rCreatureI = quat_from_axis_angle(axisCreature, -PI/6. * sin(iTime));

    pTunnel = vec3(tunnelPos, 0., 0.);
    
	//define lights pos
    lpos1 = creatureI(vec3(6., 0., 0.));
	lpos2 = creatureI(vec3( 15., 3.5, 0.) + lightOffset);
	lpos3 = creatureI(vec3(2., 4., 2.8));
    
    lpos4 = creatureI(vec3(.5, 6.5, -9.5));
    lpos5 = creatureI(
        rotate(ax, 2.*PI * wingRot, vec3(.5, .65, -12.2) + posOff) - posOff - vec3(0., 0., .5)
    );
    lpos6 = creatureI(vec3(.5, -6., -11.));

    // if(HD == 1){
    for(int i = 0; i < numFairy; i++){
        if(HD == 0 && i > numFairy / 2) break;
        fairy[i] = tunnelWidth * .8 * threePsuedo3dNoise(vec3(float(i)*12345., fairyTime, 0.)) + vec3(-10., 0., 0.);
    }
    // }
   
	//camera ray
    float camDist = 25.;
    float camFreq = 9999999.;
    vec3 ro = vec3(camDist, 0.0, 0.);
    vec3 rd = normalize( vec3(v.x, v.y, lens) );
    vec3 target = vec3(0.0, 0.0, 0.0);
	rd = lookat( target-ro, vec3(0.,rayUp))*rd;
    
	//classic raymarching by distance field
	Ray ray = raymarche(ro, rd, nfplane );
	vec3 n = normal(ray.p.xyz);
	vec3 col = shade(ray, n, ro, rd);
    return col;
}

void main()
{
    vec2 p = gl_FragCoord.xy/iResolution.xy; 
    vec3 col = render(p);
    
    col = gamma(col, 2.2); 

    // col = texture2D(iChannel0, p).rgb;   
        
	gl_FragColor = vec4(col,1.0)*fadeIn(0.9);
}
