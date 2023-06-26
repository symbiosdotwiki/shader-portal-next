import React, { Component } from 'react'
import { render } from 'react-dom'

import WebGLComponent from './WebGLComponent'

import * as twglr from '@/helpers/twgl'
import { getCanvasMousePosition } from '@/helpers/screen'

import '@/static/styles/mediaToggle.css'

var twgl = twglr.twgl;

class Toggle extends WebGLComponent {

  programDefs = {
    'programMedia' : ['default.vs', 'mediaToggle.fs']
  }

  textureDefs = {
      'diffuse': { src: this.props.tex["x.jpg"] },
      'normal': { src: this.props.tex["x N.jpg"] },
    }

  constructor(props) {
    super(props)
    this.state = {
      toggleStatus: 'mini',
      wglLoaded: true,
    }
  }

  renderLoop = (time) => {
    const { gl, bufferInfo, textures } = this
    const { programMedia } = this.programs
    const { toggleStatus } = this.state

    const uniformsMedia = {
      TIME: time/50,
      resolution: this.canvasSize(),
      light: [this.mousePos.x, this.mousePos.y, 1],
      u_diffuse: textures["diffuse"],
      u_normal: textures["normal"],
      toggleStatus: (toggleStatus != 'mini' ? 1 : 0),
    }

    this.runProgram(programMedia, uniformsMedia, gl.canvas)
  }

  toggleStatus = (toggleType) => {
    this.props.toggleStatus(toggleType)
    let newToggle = (this.state.toggleStatus=='mini' ? 'media' : 'mini')
    this.setState({toggleStatus: newToggle})
  }

	render(){
    const { toggleStatus, wglLoaded } = this.state
    const { audioLoadedOnce } = this.props
    return (
      <div 
        className={
          'mediaToggle hidden' + 
          (wglLoaded && audioLoadedOnce ? ' shown' : '') + 
          (toggleStatus == 'mini' ? '' : ' x')
        }
        onClick={() => this.toggleStatus(toggleStatus)}
      >
        <canvas ref={this.CANVAS_REF}/>
      </div>
    );}

}
export default Toggle
