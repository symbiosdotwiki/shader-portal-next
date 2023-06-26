#version 300 es
precision mediump float;

uniform float u_TimeDelta;
uniform float u_Time;
uniform sampler2D u_RgNoise;
uniform vec2 u_Gravity;
uniform vec2 u_Origin;
uniform float u_MinTheta;
uniform float u_MaxTheta;
uniform float u_MinSpeed;
uniform float u_MaxSpeed;

in vec2 i_Position;
in float i_Age;
in float i_Life;
in vec2 i_Velocity;
in float i_Pheromones;

out vec2 v_Position;
out float v_Age;
out float v_Life;
out vec2 v_Velocity;

vec3 grad(vec3 p) {
  const float texture_width = 512.0;
  vec4 v = texture(u_RgNoise, vec2((p.x+p.z) / texture_width, (p.y-p.z) / texture_width));
    return normalize(v.xyz*2.0 - vec3(1.0));
}

/* S-shaped curve for 0 <= t <= 1 */
float fade(float t) {
  return t*t*t*(t*(t*6.0 - 15.0) + 10.0);
}


/* 3D noise */
float noise(vec3 p) {
  /* Calculate lattice points. */
  vec3 p0 = floor(p);
  vec3 p1 = p0 + vec3(1.0, 0.0, 0.0);
  vec3 p2 = p0 + vec3(0.0, 1.0, 0.0);
  vec3 p3 = p0 + vec3(1.0, 1.0, 0.0);
  vec3 p4 = p0 + vec3(0.0, 0.0, 1.0);
  vec3 p5 = p4 + vec3(1.0, 0.0, 0.0);
  vec3 p6 = p4 + vec3(0.0, 1.0, 0.0);
  vec3 p7 = p4 + vec3(1.0, 1.0, 0.0);
    
  /* Look up gradients at lattice points. */
  vec3 g0 = grad(p0);
  vec3 g1 = grad(p1);
  vec3 g2 = grad(p2);
  vec3 g3 = grad(p3);
  vec3 g4 = grad(p4);
  vec3 g5 = grad(p5);
  vec3 g6 = grad(p6);
  vec3 g7 = grad(p7);
    
  float t0 = p.x - p0.x;
  float fade_t0 = fade(t0); /* Used for interpolation in horizontal direction */

  float t1 = p.y - p0.y;
  float fade_t1 = fade(t1); /* Used for interpolation in vertical direction. */
    
  float t2 = p.z - p0.z;
  float fade_t2 = fade(t2);

  /* Calculate dot products and interpolate.*/
  float p0p1 = (1.0 - fade_t0) * dot(g0, (p - p0)) + fade_t0 * dot(g1, (p - p1)); /* between upper two lattice points */
  float p2p3 = (1.0 - fade_t0) * dot(g2, (p - p2)) + fade_t0 * dot(g3, (p - p3)); /* between lower two lattice points */

  float p4p5 = (1.0 - fade_t0) * dot(g4, (p - p4)) + fade_t0 * dot(g5, (p - p5)); /* between upper two lattice points */
  float p6p7 = (1.0 - fade_t0) * dot(g6, (p - p6)) + fade_t0 * dot(g7, (p - p7)); /* between lower two lattice points */

  float y1 = (1.0 - fade_t1) * p0p1 + fade_t1 * p2p3;
  float y2 = (1.0 - fade_t1) * p4p5 + fade_t1 * p6p7;

  /* Calculate final result */
  return (1.0 - fade_t2) * y1 + fade_t2 * y2;
}

void main() {
  vec2 force = 4.0 * vec2(noise(vec3(i_Position, u_Time)), noise(vec3(i_Position + 700.0, u_Time)));
  if (i_Age >= i_Life) {
    ivec2 noise_coord = ivec2(gl_VertexID % 512, gl_VertexID / 512);
    vec2 rand = texelFetch(u_RgNoise, noise_coord, 0).rg;
    float theta = u_MinTheta + rand.r*(u_MaxTheta - u_MinTheta);
    float x = cos(theta);
    float y = sin(theta);
    v_Position = u_Origin;
    v_Age = 0.0;
    v_Life = i_Life;
    v_Velocity =
      vec2(x, y) * (u_MinSpeed + rand.g * (u_MaxSpeed - u_MinSpeed));
  } else {
    v_Position = i_Position + i_Velocity * u_TimeDelta;
    v_Age = i_Age + u_TimeDelta;
    v_Life = i_Life;
    v_Velocity = i_Velocity + u_Gravity * u_TimeDelta + force * u_TimeDelta;
  }

}