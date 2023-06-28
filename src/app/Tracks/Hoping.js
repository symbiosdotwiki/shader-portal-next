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

  // setupUser = () => {

  // }

  renderLoop = (rTime) => {
    let {
      gl, bufferInfo, prevTime, textures, audioData,
      lmh, AUDIO_HIGH, AUDIO_MID, AUDIO_LOW, seqUniEval
    } = this

    let {
      skinBuffer
    } = this.buffers

    let {
      programSkin,
    } = this.programs
    

    const skinUniforms = {
      ...seqUniEval,
      iTime: audioData.curTime,
      iChannel0: textures.pebbles,
      randSampler: textures.rand,
      iResolution: this.canvasSize(),
      iAudio: lmh,
      HD: this.hdAA[0],
    }
    this.runProgram(programSkin, skinUniforms, gl.canvas)

    
  }
}
export default Hoping
