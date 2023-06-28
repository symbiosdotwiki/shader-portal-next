
precision mediump float;

uniform float TIME;
uniform float swirl;
uniform float border;
uniform int depth;
uniform vec2 resolution;

vec2 rotateLoc(vec2 loc, float angle){
	float oAngle = atan(loc.y, loc.x);
	float nAngle = oAngle + angle / 180.0 * 3.1415926535;
	vec2 rotated = length(loc) * vec2(cos(nAngle), sin(nAngle));
	return rotated;	
}

float negOnePow(int power){
	if(int(mod(float(power), 2.)) == 0){
		return 1.;
	}
	return -1.;
}

int getColVal(vec2 loc, int level, float rotate){
	float levelVal = .5*pow(.25, float(level));
	float radVal = pow(.5, float(level));
	
	vec2 newLoc = rotateLoc(loc, rotate);
	vec2 modLocW = newLoc + vec2(0., levelVal);
    vec2 modLocB = newLoc - vec2(0., levelVal);
    // top circle
    if(length(modLocB) < levelVal){
    	if(level == depth){
    		if(length(modLocB) < levelVal/3.){
    			return 2;
    		}
    	}
    	return 1;
    }
    // bottom circle
    else if(length(modLocW) < levelVal){
    if(level == depth){
    		if(length(modLocW) < levelVal/3.){
    			return 1;
    		}
    	}
    	return 2;
    }
    // left half
    else if(length(loc) < radVal && newLoc.x > 0.){
    	return 3;
    }
    // right half
    else if(length(loc) < radVal){
    	return 4;
    }
}

vec4 getYinYang(vec2 offset){
    vec2 uv = (gl_FragCoord.xy + offset) / resolution;

    vec4 color = vec4(0.0);
    
    vec2 loc = 2.*(uv - vec2(.5));
    vec2 ogLoc = vec2(loc);
    loc *= 1. + border;
    int colVal = 0;
    
    // vec2 ogLoc = vec2(loc);
   
    
    colVal = getColVal(loc, 0, TIME);
    loc = rotateLoc(loc, TIME);
   
    
    float multFac = .125;
    float sumVal = 0.;
    for(int i = 0; i < 16; i++){
        if (i >= depth){break;}
        if(colVal > 0 && colVal < 3){
            sumVal /= 2.;
            if(i > 0){
                sumVal += multFac*pow(.25, float(i-1));
            }
            loc = 0.5*(loc-loc.y/abs(loc.y)*vec2(0.,pow(.5, float(i+1)))  - negOnePow(colVal)*vec2(0.,sumVal));
            colVal = getColVal(loc, i+1, pow(swirl, float(i+3))*TIME);
            loc = rotateLoc(loc, pow(swirl, float(i+3))*TIME);
        }
    }
    
    
    
    
    if(colVal == 1){
        color = vec4(1.0); //white
    }
    else if(colVal == 2){
        color = vec4(1., 0., 0., 1.); //red
        color = vec4(0., 0., 0., 1.);
    }
    else if(colVal == 3){
        color = vec4(0., 1., 0., 1.); //green
        color = vec4(0., 0., 0., 1.);
    }
    else if(colVal == 4){
        color = vec4(0., 0., 1., 1.); //blue
        color = vec4(1.);
    }
    else {
        color = vec4(0.);
    }

    if(length(ogLoc) >= 1.){
        color = vec4(0.);
    }
    else if(length(ogLoc) >= 1./(1.+border)){
        color = vec4(0., 0., 0., 1.);
        color = vec4(1.);
    }

    return color;
}

void main()
{
    vec4 color = vec4(0.);

    for(int i = 0; i < 2; i++){
        for(int j = 0; j < 2; j++){
            vec2 boi = vec2(float(i)-.5, float(j)-.5)/2.;
            color += getYinYang(boi)/4.;
        }
    }

    // color = getYinYang(vec2(0.));
    
    gl_FragColor = color;
}
