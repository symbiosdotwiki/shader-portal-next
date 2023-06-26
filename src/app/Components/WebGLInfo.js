import React, { Component } from 'react'
import { render } from 'react-dom'

import '@/static/styles/webgl-info.css'

class WebGLInfo extends Component {

  constructor(props) {
    super(props)
    this.state = {
      fps: 0, 
      curBar: 0,
    }
  }

  componentDidMount() {
    this.startRender()
  }

  startRender = () => {
    this.renderInfo()
  }

  renderInfo = (time) => {
    this.setState(this.props.getInfo(), () => {
      setTimeout(() => {requestAnimationFrame(this.renderInfo)}, 50)
    })
  }

  render(){
    const {fps, curBar} = this.state
    const {reset} = this.props
    return (
      <div className='wInfo'>
        <div>{'FPS: ' + fps.toString()}</div>
        <div>{'Bar: ' + curBar.toFixed(2).toString()}</div>
        <div><button onClick={reset}>RESET</button></div>
      </div>
    )}

}
export default WebGLInfo