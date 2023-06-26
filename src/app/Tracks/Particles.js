import React, { Component } from 'react'
import { render } from 'react-dom'
import * as twglr from '@/helpers/twgl'
import {afn, minGreater} from '@/helpers/animation'
import WebGLSequencer from '@/Components/WebGLSequencer'

var twgl = twglr.twgl

// function pingPong(frameBuffers){
//   var temp = frameBuffers[0]
//   frameBuffers[0] = frameBuffers[1]
//   frameBuffers[1] = temp
// }

class Particles extends WebGLSequencer {

  startBar = 32
  randomSeed = Math.random() * 999999

  n = 1024 * 1
  m = 1024 * 1

  timeMult = 3

  temp = null

  sequencerUniforms = {
    feedback1: 0,
    feedback2: 0,
    lightXY: [1, 0],
    specularHardness: 70,
    feedbackScale: 1,
    lightHue: 0,
    secondLight: 0,
    hueShift:0,
    satMult: 1,
  }
  // Math.sin(audioData.curTime*2.2/10)*.005+.003*Math.cos(audioData.curTime*5.3/10)

  keyframes = {
    '0' : [
      {
        name:'feedback1',
        type:'sine',
        range:[-.001, .002],
        dur: 2.5
      },
      {
        name:'feedback2',
        type:'cosine',
        range:[.001, .000],
        dur: 3.5
      },
      {
        name:'lightXY',
        type:'ellipse',
        range:[1, 1],
        dur: 4
      },
      {
        name:'specularHardness',
        type:'sine',
        range:[55, 85],
        dur: 6
      },
      {
        name:'lightHue',
        type:'mono',
        range:[.5, 1.5],
        dur: 7
      },
    ],
    '64':[
      {
        name:'satMult',
        type:'const',
        val:0,
      },
      {
        name:'hueShift',
        type:'mono',
        range:[0,1],
        dur:16,
      },
    ]
  }

  programDefs = {
    'programInit' : ['particleInit.vs', 'particleInit.fs'],
    'programPhysics' : ['particlePhysics.vs', 'particlePhysics.fs'],
    'programDraw' : ['particleDraw.vs', 'particleDraw.fs'],
    'programEncode' : ['default.vs', 'encode.fs'],
    'programFeedback' : ['default.vs', 'feedback.fs'],
    'programDisplay' : ['default.vs', 'extract.fs'],
    'programBlack' : ['default.vs', 'black.fs'],
    'programBlur' : ['default.vs', 'blur.fs'],
    'programLookup' : ['default.vs', 'lookup.fs'],
    'programPhong' : ['default.vs', 'phong.fs'],
    'programAdd' : ['default.vs', 'composite.fs'],
    'programCopy' : ['default.vs', 'copy.fs'],
  }

  bufferDefs = {
    'pos' : {
      num: 2,
      size: [this.n, this.m],
    },
    'vel' : {
      num: 2,
      size: [this.n, this.m],
    },
    'fb' : {
      num : 4,
    }
  }

  // constructor(props) {
  //   super(props)
  // }

  setupUser = () => {
    let { gl, programs, buffers } = this
    const {n, m} = this
    // let programs = {}
    // let buffers = {}

    // const gl = this.CANVAS_REF.current.getContext('webgl', { 
    //   depth: false, antialiasing: false
    // })

    // // Setup
    // programs = twglr.createProgramInfos(gl, this.props.shaders, this.programDefs)
    

    // gl.clearColor(0, 0, 0, 1)

    // // Particle Frame Buffers
    // buffers['posFrameBuffers'] = [
    //   twgl.createFramebufferInfo(gl, undefined, n, m), 
    //   twgl.createFramebufferInfo(gl, undefined, n, m)
    // ]
    // buffers['velFrameBuffers'] = [
    //   twgl.createFramebufferInfo(gl, undefined, n, m), 
    //   twgl.createFramebufferInfo(gl, undefined, n, m)
    // ]
    const positionObject = { 
      position: { data: [1, 1, 1, -1, -1, -1, -1, 1], numComponents: 2 } 
    }
    this.posBufferInfo = twgl.createBufferInfoFromArrays(
      gl, positionObject
    )

    const pointData = []
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        pointData.push((i+.5) / n)
        pointData.push((j+.5) / m)
      }
    }
    const pointsObject = { 
      v_texcoord: { data: pointData, numComponents: 2 } 
    }
    this.pointBufferInfo = twgl.createBufferInfoFromArrays(
      gl, pointsObject
    )

    // particle initialization
    // gl.useProgram(programs['programInit'].program)
    // twgl.setBuffersAndAttributes(
    //   gl, programs['programInit'], this.pointBufferInfo
    // )
    // twgl.setUniforms(programs['programInit'], {
    //   pass: 0,
    // })
    // twgl.bindFramebufferInfo(gl, buffers['pos'][0])
    // twgl.drawBufferInfo(
    //   gl, this.pointBufferInfo, gl.TRIANGLE_FAN
    // )
    // twgl.setUniforms(programs['programInit'], {
    //   pass: 1,
    // })
    // twgl.bindFramebufferInfo(gl, buffers['vel'][0]);
    // twgl.drawBufferInfo(
    //   gl, this.pointBufferInfo, gl.TRIANGLE_FAN
    // )

    // this.programs = programs
    // this.buffers = buffers
    // this.gl = gl
    
  }

  renderLoop = (rTime) => {
    let { 
      programInit, programPhysics, programDraw, programFeedback,
      programDisplay, programBlack, programBlur, programLookup,
      programPhong, programAdd, programCopy, programEncode
    } = this.programs
    let {
      pos, vel,
      fb
    } = this.buffers
    let { 
      gl, bufferInfo, canvasSize, prevTime, audioData, randomSeed, seqUniEval,
      AUDIO_HIGH, AUDIO_MID, AUDIO_LOW
    } = this

    let { n, m, pointBufferInfo, posBufferInfo } = this

    let hdSize = this.hdAA[0] ? 1 : .5

    // console.log(AUDIO_LOW)

    if(twgl.resizeCanvasToDisplaySize(gl.canvas, window.devicePixelRatio * hdSize || hdSize)){
      // console.log('hi')
      twgl.resizeFramebufferInfo(gl, fb[2])

      // gl.useProgram(programCopy.program)
      // twgl.setBuffersAndAttributes(gl, programCopy, textureBuffer)
      // twgl.setUniforms(programCopy, { 
      //   resolution: canvasSize(),
      //   u_texture: fb[1].attachments[0],
      // })
      // twgl.bindFramebufferInfo(gl, fb[2])
      // twgl.drawBufferInfo(gl, textureBuffer)

      const copyUniforms = {
        resolution: canvasSize(),
        u_texture: fb[1].attachments[0],
      }
      twglr.runProgram(gl, programCopy, copyUniforms, bufferInfo, fb[2])

      twgl.resizeFramebufferInfo(gl, fb[1])

      // gl.useProgram(programCopy.program)
      // twgl.setBuffersAndAttributes(gl, programCopy, textureBuffer)
      // twgl.setUniforms(programPhong, { 
      //   resolution: canvasSize(),
      //   u_texture: fb[2].attachments[0],
      // })
      // twgl.bindFramebufferInfo(gl, fb[1])
      // twgl.drawBufferInfo(gl, textureBuffer)

      const copyUniforms2 = {
        resolution: canvasSize(),
        u_texture: fb[2].attachments[0],
      }
      twglr.runProgram(gl, programCopy, copyUniforms2, bufferInfo, fb[1])


      twgl.resizeFramebufferInfo(gl, fb[0])
      twgl.resizeFramebufferInfo(gl, fb[3])
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)


    // particle physics
    // gl.useProgram(programPhysics.program)
    // twgl.setBuffersAndAttributes(
    //   gl, programPhysics, posBufferInfo
    // )
    // twgl.setUniforms(programPhysics, {
    //   resolution: canvasSize(),
    //   u_pheromones:fb[1].attachments[0],
    //   u_position: pos[0].attachments[0],
    //   u_velocity: vel[0].attachments[0],
    //   pass: 0,
    //   time: audioData.curTime/this.timeMult + randomSeed + AUDIO_MID * 3,
    // })
    // // velocity pass
    // twgl.bindFramebufferInfo(gl, vel[1])
    // twgl.drawBufferInfo(gl, posBufferInfo, gl.TRIANGLE_FAN)
    // // position pass
    // twgl.setUniforms(programPhysics, {
    //   pass: 1,
    // })
    // twgl.bindFramebufferInfo(gl, pos[1])
    // twgl.drawBufferInfo(gl, posBufferInfo, gl.TRIANGLE_FAN)


    const physarumUniforms = {
      resolution: canvasSize(),
      u_pheromones: fb[1].attachments[0],
      u_position: pos[0].attachments[0],
      u_velocity: vel[0].attachments[0],
      time: audioData.curTime/this.timeMult + randomSeed + AUDIO_MID * 3,
      pass: 0,
    }
    twglr.runProgram(gl, programPhysics, physarumUniforms, bufferInfo, vel[1])

    const physarumUniforms2 = {
      pass: 1
    }
    twglr.runProgram(gl, programPhysics, physarumUniforms2, bufferInfo, pos[1])


    // drawing black for particles
    gl.useProgram(programBlack.program)
    twgl.setBuffersAndAttributes(gl, programBlack, bufferInfo)
    twgl.bindFramebufferInfo(gl, fb[3])
    gl.clear(gl.COLOR_BUFFER_BIT)
    twgl.drawBufferInfo(gl, bufferInfo)

    // gl.clear(fb[2])

    gl.enable(gl.BLEND)
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // drawing particles
    // gl.useProgram(programDraw.program)
    // twgl.setBuffersAndAttributes(gl, programDraw, pointBufferInfo)
    // twgl.setUniforms(programDraw, { 
    //   u_texture: pos[1].attachments[0],
    //   HD: this.hdAA[0]
    // })
    // twgl.bindFramebufferInfo(gl, fb[3])
    // twgl.drawBufferInfo(gl, pointBufferInfo, gl.POINTS)

    const drawUniforms = { 
      u_texture: pos[1].attachments[0],
      HD: this.hdAA[0]
    }
    twglr.runProgram(gl, programDraw, drawUniforms, pointBufferInfo, fb[3], 'points')


    gl.disable(gl.BLEND)


    //encode particles
    //  gl.useProgram(programEncode.program)
    // twgl.setBuffersAndAttributes(gl, programEncode, bufferInfo)
    // twgl.setUniforms(programEncode, {
    //   resolution: canvasSize(),
    //   u_texture: fb[3].attachments[0],
    // })
    // // twgl.setUniforms(programFeedback, this.evalObj(this.sequencerUniforms))
    // twgl.bindFramebufferInfo(gl, fb[2])
    // twgl.drawBufferInfo(gl, bufferInfo)

    const encodeUniforms = {
      resolution: canvasSize(),
      u_texture: fb[3].attachments[0],
      ...seqUniEval
    }
    twglr.runProgram(gl, programEncode, encodeUniforms, bufferInfo, fb[2])


    // blur prevFrame
    // gl.useProgram(programBlur.program)
    // twgl.setBuffersAndAttributes(gl, programBlur, bufferInfo)
    // twgl.setUniforms(programBlur, {
    //   resolution: canvasSize(),
    //   u_texture: fb[1].attachments[0],
    //   pass: 0,
    // })
    // twgl.bindFramebufferInfo(gl, fb[3])
    // twgl.drawBufferInfo(gl, bufferInfo)
    // twgl.setUniforms(programBlur, {
    //   u_texture: fb[3].attachments[0],
    //   pass: 1,
    // })
    // twgl.bindFramebufferInfo(gl, fb[1])
    // twgl.drawBufferInfo(gl, bufferInfo)

    const blurUniforms = {
      resolution: canvasSize(),
      u_texture: fb[1].attachments[0],
      pass: 0,
    }
    twglr.runProgram(gl, programBlur, blurUniforms, bufferInfo, fb[3])

    const blurUniforms2 = {
      resolution: canvasSize(),
      u_texture: fb[3].attachments[0],
      pass: 1,
    }
    twglr.runProgram(gl, programBlur, blurUniforms2, bufferInfo, fb[1])


    // drawing black
    gl.useProgram(programBlack.program)
    twgl.setBuffersAndAttributes(gl, programBlack, bufferInfo)
    twgl.bindFramebufferInfo(gl, fb[0])
    gl.clear(gl.COLOR_BUFFER_BIT)
    // twgl.drawBufferInfo(gl, textureBuffer)


    // particles feedback trails
    // gl.useProgram(programFeedback.program)
    // twgl.setBuffersAndAttributes(gl, programFeedback, bufferInfo)
    // twgl.setUniforms(programFeedback, {
    //   resolution: canvasSize(),
    //   u_prevFrame: fb[1].attachments[0],
    //   u_curFrame: fb[2].attachments[0],
    //   HD: this.hdAA[0],
    //   // scale: FEEDBACK_SCALE,
    // })
    // twgl.setUniforms(programFeedback, seqUniEval)
    // twgl.bindFramebufferInfo(gl, fb[0])
    // twgl.drawBufferInfo(gl, bufferInfo)

    const feedbackUniforms = {
      resolution: canvasSize(),
      u_prevFrame: fb[1].attachments[0],
      u_curFrame: fb[2].attachments[0],
      HD: this.hdAA[0],
      ...seqUniEval
    }
    twglr.runProgram(gl, programFeedback, feedbackUniforms, bufferInfo, fb[0])

    // lookup for phong
    // gl.useProgram(programLookup.program)
    // twgl.setBuffersAndAttributes(gl, programLookup, bufferInfo)
    // twgl.setUniforms(programLookup, { 
    //   resolution: canvasSize(),
    //   u_texture: fb[0].attachments[0] ,
    //   multiplier: .7+Math.pow(AUDIO_MID, .5)*.8,
    // })
    // twgl.bindFramebufferInfo(gl, fb[3])
    // twgl.drawBufferInfo(gl, bufferInfo)

    const lookupUniforms = {
      resolution: canvasSize(),
      u_texture: fb[0].attachments[0] ,
      multiplier: .7+Math.pow(AUDIO_MID, .5)*.8,
    }
    twglr.runProgram(gl, programLookup, lookupUniforms, bufferInfo, fb[3])

    // shiny phong
    // gl.useProgram(programPhong.program)
    // twgl.setBuffersAndAttributes(gl, programPhong, bufferInfo)
    // twgl.setUniforms(programPhong, { 
    //   resolution: canvasSize(),
    //   u_texture: fb[0].attachments[0] ,
    //   intensity: 100,
    //   specularPower: 30*(AUDIO_HIGH+.01),
    //   diffusePower: .0,
    //   viewDir: [0,0,-1]
    // })
    // twgl.setUniforms(programPhong, this.evalObj(this.sequencerUniforms))
    // twgl.bindFramebufferInfo(gl, fb[2])
    // twgl.drawBufferInfo(gl, bufferInfo)

    const phongUniforms = {
      resolution: canvasSize(),
      u_texture: fb[0].attachments[0] ,
      intensity: 100,
      specularPower: 30*(AUDIO_HIGH+.01),
      diffusePower: .0,
      viewDir: [0,0,-1],
      ...seqUniEval
    }
    twglr.runProgram(gl, programPhong, phongUniforms, bufferInfo, fb[2])

    // drawing display
    // gl.useProgram(programAdd.program)
    // twgl.setBuffersAndAttributes(gl, programAdd, bufferInfo)
    // twgl.setUniforms(programAdd, { 
    //   resolution: canvasSize(),
    //   u_texture: fb[2].attachments[0] ,
    //   u_add: fb[3].attachments[0] ,
    //   time: audioData.curTime/10,
    //   saturation: AUDIO_LOW * 5,
    // })
    // twgl.setUniforms(programAdd, this.evalObj(this.sequencerUniforms))
    // twgl.bindFramebufferInfo(gl, gl.canvas)
    // twgl.drawBufferInfo(gl, bufferInfo)

    const addUniforms = {
      resolution: canvasSize(),
      u_texture: fb[2].attachments[0] ,
      u_add: fb[3].attachments[0] ,
      time: audioData.curTime/10,
      saturation: AUDIO_LOW * 5,
      ...seqUniEval
    }
    twglr.runProgram(gl, programAdd, addUniforms, bufferInfo, gl.canvas)

    // ping-pong buffers
    this.pingPong('pos', [0,1])
    this.pingPong('vel', [0,1])

    // ping-pong buffers
    // let temp = fb[0]
    // this.buffers['fb[0]'] = fb[1]
    // this.buffers['fb[1]'] = temp

    this.pingPong('fb', [0,1])

    // this.buffers['posFrameBuffers'] = posFrameBuffers
    // this.buffers['velFrameBuffers'] = velFrameBuffers

    
  }

}
export default Particles
