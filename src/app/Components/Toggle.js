import React, { Component } from 'react'

import { render } from 'react-dom'
import * as twglr from '@/helpers/twgl'
import { getCanvasMousePosition } from '@/helpers/screen'

import '@/static/styles/mediaToggle.css'

var twgl = twglr.twgl;

class Toggle extends Component {

  mousePos = {x: 0, y: 0}
  pixRat = window.devicePixelRatio || 1

  handleMouseMove = (event) => {
      this.mousePos = getCanvasMousePosition(event, this.CANVAS_REF.current)
  }

  constructor(props) {
    super(props)
    this.CANVAS_REF = React.createRef()
    this.state = {
      toggleStatus: 'mini',
      wglLoaded: false,
    }
  }

  componentDidMount() {
    const { type, tex } = this.props;
    
    const gl = this.CANVAS_REF.current.getContext(
      'webgl', { antialias: true }
    )
    this.gl = gl

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    this.programInfo = twglr.createProgramInfo(
      gl, this.props.shaders, 'test.vs', 'mediaToggle.fs'
    )

    this.bufferInfo = twglr.createCanvasBuffer(gl)

    this.textures = twgl.createTextures(gl, {
      diffuse: { src: tex["x.jpg"] },
      normal: { src: tex["x N.jpg"] },
    }, () => this.setState({wglLoaded: true}, this.startRender)
    )

    // console.log(tex, this.textures)
    
    

    // this.setState({
    //   // gl: gl, 
    //   // programInfo: programInfo,
    //   // bufferInfo: bufferInfo,
    //   // textures: textures
    // }, this.startRender)

    


    // this.startRender()


    window.addEventListener('mousemove', (event) => this.handleMouseMove(event))
  }

  startRender = () => {
    requestAnimationFrame(this.renderGl)
  }

  renderGl = (time) => {
    const { gl, programInfo, bufferInfo, textures } = this
    const { toggleStatus } = this.state

    twgl.resizeCanvasToDisplaySize(gl.canvas, this.pixRat)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)


    const uniforms = {
      TIME: time/50,
      resolution: [gl.canvas.width, gl.canvas.height],
      light: [this.mousePos.x, this.mousePos.y, 1],
      u_diffuse: textures["diffuse"],
      u_normal: textures["normal"],
      toggleStatus: (toggleStatus != 'mini' ? 1 : 0),
    }

    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo)

    requestAnimationFrame(this.renderGl, this.CANVAS_REF.current)
  }

  toggleStatus = (toggleType) => {
    this.props.toggleStatus(toggleType)
    let newToggle = (this.state.toggleStatus=='mini' ? 'media' : 'mini')
    this.setState({toggleStatus: newToggle})
  }

	render(){
    const { toggleStatus, wglLoaded } = this.state
    const { audioLoadedOnce } = this.props
    // console.log('Toggle State', this.state)
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
