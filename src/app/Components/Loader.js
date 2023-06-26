import React, { Component } from 'react'
import { render } from 'react-dom'

import WebGLComponent from './WebGLComponent'
import * as twglr from '@/helpers/twgl'


// var twgl = twglr.twgl

class Loader extends WebGLComponent {
  
  programDefs = {
    'programYY' : ['default.vs', 'yinyang.fs']
  }

  renderLoop = (time) => {
    const { gl, bufferInfo } = this
    const { programYY } = this.programs

    const uniformsYY = {
      TIME: time/50,
      resolution: [gl.canvas.width, gl.canvas.height],
      swirl: Math.sqrt(2),
      depth: this.props.trackNum,
      border: .01
    }

    twglr.runProgram(gl, programYY, uniformsYY, this.bufferInfo, gl.canvas)
  }

  // render(){
  //   return (
  //       <canvas ref={this.CANVAS_REF}/>
  //   )
  // }

}
export default Loader 
