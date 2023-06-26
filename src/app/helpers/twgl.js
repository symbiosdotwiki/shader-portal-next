import * as twgljs from 'twgl.js'
export var twgl = twgljs
// export var twgl = require('twgl.js')

const canvasArrays = {
  position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
}

const objectMap = (obj, fn) =>
  Object.fromEntries(
    Object.entries(obj).map(
      ([k, v], i) => [k, fn(v, k, i)]
    )
  )

export var loadShadersDir = function(shaders, subDir) {
  var shaderDict = {}
  shaders.forEach(function (value) {
    var shader = require('@/shaders/' + subDir + value)
    shaderDict[value] = shader
  })
  return shaderDict
}

export var loadShaders = function(shaders) {
    return loadShadersDir(shaders, '')
}

function showGLSLError(error){
  let errorMessage = '\nError compiling FRAGMENT_SHADER: ERROR: '
  let actualError = error.split(errorMessage)[1]
  let errorIndex = error.indexOf('^^^ ERROR:')
  console.log(error.substring(
    Math.max(0, errorIndex - 500),
    Math.min(error.length, errorIndex + 500)
  ))
}

export var createProgramInfo = function(gl, shaderDict, vShader, fShader){
  let programInfo = twgl.createProgramInfo(
    gl, [shaderDict[vShader], shaderDict[fShader]], showGLSLError

  )
  return programInfo
  gl.flush()
}

export var createProgramInfos = function(gl, shaderDict, programDefs){
  let programs = objectMap(programDefs, x => createProgramInfo(gl, shaderDict, x[0], x[1]))
  return programs
}

export var createCanvasBuffer = function(gl){
    return twgl.createBufferInfoFromArrays(gl, canvasArrays)
}

export var runProgram = function(gl, program, uniforms, bufferInfo, frameBuffer, points=null){
  gl.useProgram(program.program)
  twgl.setBuffersAndAttributes(gl, program, bufferInfo)
  twgl.setUniforms(program, uniforms)
  twgl.bindFramebufferInfo(gl, frameBuffer)
  if(!points){
    twgl.drawBufferInfo(gl, bufferInfo)
  }
  else{
    twgl.drawBufferInfo(gl, bufferInfo, gl.POINTS)
  }
}