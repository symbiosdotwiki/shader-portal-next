import React, { Component } from 'react'
import { render } from 'react-dom'

import * as twglr from '@/helpers/twgl'
import { getCanvasMousePosition } from '@/helpers/screen'
import {afn, minGreater} from '@/helpers/animation'

import WebGLSequencer from '@/Components/WebGLSequencer'
import keyframes from './HopingSeq'

var twgl = twglr.twgl;

class Hoping extends WebGLSequencer {

  startBar = 56

  sequencerUniforms = {
    tunnelPos: 0,
    fisheye: 0,
    creatureXY: [1000, 0],
    tunnelLight: 1,
    tunnelBase: 0,
    createLight: 0,
    wingRot: 0,
    creatureFlip:0,
    fairyLight: 1,
    tunnelWonky: 0,
    tunnelWidth: 10,
    checker:0.,
    fairyTime: 0,
    rayUp: [1, 0]
  }

  keyframes = keyframes

  programDefs = {
    'programSkin' : ['default.vs', 'skin.fs'],
  }

  textureDefs = {
    rand: { 
      src: this.props.tex['rand.png'],
    },
    pebbles: { 
      src: this.props.tex['pebbles.png'],
      // min: gl.LINEAR,
      // mag: gl.LINEAR,
    },
  }

  bufferDefs = {
    'skinBuffer' : {}
  }


  constructor(props) {
    super(props)
  }

  setupUser = () => {
    // let programs = {}
    // let buffers = {}

    // const gl = this.CANVAS_REF.current.getContext('webgl')

    // this.textures = twgl.createTextures(gl, {
    //   rand: { 
    //     src: this.props.tex['rand.png'],
    //   },
    //   pebbles: { 
    //     src: this.props.tex['pebbles.png'],
    //     min: gl.LINEAR,
    //     mag: gl.LINEAR,
    //   },
    // })

    // programs = twglr.createProgramInfos(gl, this.props.shaders, this.programDefs)

    // buffers['skinBuffer'] = twgl.createFramebufferInfo(
    //   gl, undefined, 
    //   gl.canvas.width, gl.canvas.height
    // )


    // const canvasArrays = {
    //   position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    // }
    // buffers['textureBuffer'] = twgl.createBufferInfoFromArrays(
    //   gl, canvasArrays
    // )
    // buffers['canvasBuffer'] = twgl.createBufferInfoFromArrays(
    //   gl, canvasArrays
    // )

    // this.programs = programs
    // this.buffers = buffers
    // this.gl = gl

  }

  renderLoop = (rTime) => {
    let {
      gl, bufferInfo, prevTime, textures, audioData,
      lmh, AUDIO_HIGH, AUDIO_MID, AUDIO_LOW, seqUniEval
    } = this

    let {
      // textureBuffer, canvasBuffer,
      skinBuffer
    } = this.buffers

    let {
      programSkin,
    } = this.programs
    
    // let lmh = this.props.getFrequencyData();
    // this.hdAA = this.props.getHDAA();
    // let hdSize = this.hdAA[0] ? 1 : .3;
    // hdSize *= window.devicePixelRatio || 1;

    // if(twgl.resizeCanvasToDisplaySize(gl.canvas, hdSize)){
    //   twgl.resizeFramebufferInfo(gl, skinBuffer);
    // }


    // calc life
    // gl.useProgram(programSkin.program);
    // twgl.setBuffersAndAttributes(gl, programSkin, canvasBuffer);
    // twgl.setUniforms(programSkin, { 
    //   // u_texture: skinBuffer.attachments[0],
    //   iTime: audioData.curTime,
    //   iChannel0: textures.pebbles,
    //   randSampler: textures.rand,
    //   iResolution: [gl.canvas.width, gl.canvas.height],
    //   iAudio: lmh,
    //   HD: this.hdAA[0],
    // });
    // twgl.setUniforms(programSkin, this.evalObj(this.sequencerUniforms))
    // twgl.bindFramebufferInfo(gl, gl.canvas);
    // twgl.drawBufferInfo(gl, canvasBuffer);

    const skinUniforms = {
      ...seqUniEval,
      iTime: audioData.curTime,
      iChannel0: textures.pebbles,
      randSampler: textures.rand,
      iResolution: [gl.canvas.width, gl.canvas.height],
      iAudio: lmh,
      HD: this.hdAA[0],
    }
    twglr.runProgram(gl, programSkin, skinUniforms, bufferInfo, gl.canvas)

    
  }
}
export default Hoping
