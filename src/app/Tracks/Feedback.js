import React, { Component } from 'react'
import { getCanvasMousePosition } from '@/helpers/screen'
import { render } from 'react-dom'
import * as twglr from '@/helpers/twgl'
import WebGLSequencer from '@/Components/WebGLSequencer'

var twgl = twglr.twgl

class Feedback extends WebGLSequencer {

  startBar = 34

  golScal = 2

  sequencerUniforms = {
    CircleX: .1,
    CircleY: .7,
  }

  keyframes = {
    '0' : [
      {
        name:'CircleX',
        type:'sine',
        range: [-.5, .5],
        dur: 9
      },
      {
        name:'CircleY',
        type:'cosine',
        range: [-.5, -.5],
        dur: 9
      },
    ],
    '10' : [
      {
        name:'CircleX',
        type:'sine',
        range: ['auto', 1],
        dur: 4
      },
      {
        name:'CircleY',
        type:'cosine',
        range: [null, -1],
        dur: 4
      },
    ]
  }

  programDefs = {
    'programLife' : ['default.vs', 'life.fs'],
    'programRandom' : ['default.vs', 'random.fs'],
    'programCircle' : ['default.vs', 'circle.fs'],
    'programAdd' : ['default.vs', 'add.fs'],
    'programDisplay' : ['default.vs', 'default.fs'],
  }

  bufferDefs = {
    'gol' : {
      num: 4,
      size: [512*this.golScal, 512*this.golScal],
    },
    'bh' : {
      num : 1,
      size : null
    }
  }

  textureDefs = {
    'rand': { 
      src: this.props.tex['rand.png'],
    },
    'pebbles': { 
      src: this.props.tex['pebbles.png'],
      // min: gl.LINEAR,
      // mag: gl.LINEAR,
    }
  }

  golBufferSize = () => {
    return this.bufferDefs['gol'].size
  }

  // constructor(props) {
  //   super(props)
  //  }
 
  setupUser = () => {
    this.gl.clearColor(0, 0, 0, 1)
    twglr.runProgram(this.gl, this.programs['programRandom'], {}, this.bufferInfo, this.buffers['gol'][0])
  }

  renderLoop = (rTime) => {
    let time = rTime/1000
    let {
      golBuffers, golBufferSize, 
    } = this

    let {
      gl, bufferInfo, seqUniEval, prevTime, audioData, lmh, textures, canvasSize,
      AUDIO_HIGH, AUDIO_MID, AUDIO_LOW,
    } = this

    let {
      gol, bh
    } = this.buffers

    let {
      programLife, programRandom, programCircle, programDisplay, programAdd
    } = this.programs



    // Calc Life
    const lifeUniforms = { 
      u_texture: gol[0].attachments[0],
      resolution: golBufferSize(),
      iTime: audioData.curTime
    }
    twglr.runProgram(gl, programLife, lifeUniforms, bufferInfo, gol[2])

    // Calc Circle
    const circleUniforms = { 
      resolution: golBufferSize(),
      radius: .1*AUDIO_LOW,
      iTime: audioData.curTime,
      rand: textures.rand,
      pebbles: textures.pebbles,
      ...seqUniEval
    }
    twglr.runProgram(gl, programCircle, circleUniforms, bufferInfo, gol[3])

    // Add Circle
    const addUniforms = { 
      resolution1: golBufferSize(),
      resolution2: golBufferSize(),
      tex1: gol[2].attachments[0],
      tex2: gol[3].attachments[0],
    }
    twglr.runProgram(gl, programAdd, addUniforms, bufferInfo, gol[1])

    // Display
    const displayUniforms = { 
      u_texture: gol[1].attachments[0],
      resolution: canvasSize(),
    }
    twglr.runProgram(gl, programDisplay, displayUniforms, this.bufferInfo, gl.canvas)


    // ping-pong buffers
    this.pingPong('gol', [0, 1])

  }
}
export default Feedback
