import React, { Component } from 'react'
import { render } from 'react-dom'

import Info from './Info'
import WebGLComponent from './WebGLComponent'

import * as twglr from '@/helpers/twgl'

var twgl = twglr.twgl;

class AudioControls extends WebGLComponent {

  toggleStatus = 0

  programDefs = {
    'programMedia': ['default.vs', 'mediaplayer.fs']
  }

  constructor(props) {
    const { tex, type } = props
    super(props)

    this.textureDefs = {
      'diffuse': { src: tex[type + " player diffuse.jpg"] },
      'buttons': { src: tex[type + " player buttons.jpg"] },
      'height': { src: tex[type + " player height.jpg"] },
      'playN': { src: tex[type + " player play N.jpg"] },
      'pauseN': { src: tex[type + " player pause N.jpg"] },
      'lights': { src: tex[type + " player lights.jpg"] }
    }

    this.state = {
      audioState: 'paused',
      wglLoaded: true,
      toggledOn: false,
    }
  }

  // setupUser() {
  // }

  renderLoop = (time) => {
    const { toggledOn, audioState } = this.state
    const { gl, textures, bufferInfo } = this
    const { programMedia } = this.programs
    const { 
      getAudioState, trackNum, audioLoaded, maxTrack, getToggleStatus
    } = this.props

    this.toggleStatus = getToggleStatus()

    if(this.toggleStatus < .5){

      if(!toggledOn){
        this.setState({toggledOn:true})
      }

      const uniformsMedia = {
        TIME: time/50,
        resolution: this.canvasSize(),
        light: [this.mousePos.x, this.mousePos.y, 1],
        u_diffuse: textures["diffuse"],
        u_buttons: textures["buttons"],
        u_playN: textures["playN"],
        u_pauseN: textures["pauseN"],
        u_height: textures["height"],
        u_lights: textures["lights"],
        playing: audioState != "playing",
        hdAA: this.hdAA,
        buttonStatus: [
          (trackNum == 0 ? 0 : 1),
          (trackNum >= maxTrack ? 0 : 1),
          (audioLoaded ? 1 : 0)
        ],
        toggleStatus: this.toggleStatus,
      }
      this.runProgram(programMedia, uniformsMedia, gl.canvas)

    }
    else{
      if(toggledOn){
        this.setState({toggledOn:false})
      }
    }

    if(audioState != getAudioState()){
      this.setState({audioState: getAudioState()})
    }
  }

  calcSinCos = (radius, trackName) => {
    let phi = 12.5 + 66/19*trackName.length;
    let sinTrack = radius * Math.sin(-phi);
    let cosTrack = radius * Math.cos(-phi);
    return sinTrack.toFixed(2) + ' ' + cosTrack.toFixed(2);
  }

	render(){
    const { wglLoaded, toggledOn, audioState } = this.state
    const { 
      audioLoaded, maxTrack, trackNum, TRACKLIST, clicked, type, 
      prevAudio, nextAudio, playAudio, pauseAudio, toggleHD, toggleAA
    } = this.props
    const trackDisplay = '0' + (trackNum+1).toString() + '. ' + TRACKLIST[trackNum].name
    
    return (
      <div className={
          type+'player hidden' + 
          (wglLoaded && toggledOn ? ' shown' : '')
        } >
        <div className={type+'controls'} >
          <div className={type+'buttons'} >
            <button
              id='playPause'
              onClick={() => 
                audioState != 'playing' ? playAudio() : pauseAudio()}
              disabled={!clicked || audioLoaded ? false : true}
              >
             {audioLoaded ? (audioState != 'playing' ? "PLAY" : "PAUSE") : 'LOADING'}
            </button>
            <button
              id='prevTrack'
              onClick={() => prevAudio(audioState)}
              disabled={trackNum == 0}
              >
             Prev
            </button>
            <button
              id='nextTrack'
              onClick={() => nextAudio(audioState)}
              disabled={trackNum >= maxTrack}
              >
             Next
            </button>
            {type == "media" ?
              <button
                id='HD'
                onClick={() => toggleHD()}
              /> : ''
            }
            {type == "media" ?
              <button
                id='AA'
                onClick={() => toggleAA()}
              /> : ''
            }
            {type == "media" ?
              <Info
                toggledOn={toggledOn}
              /> : ''
            }
          </div>
          {type == "mini" ?
          <div id="trackName"> <span>{trackDisplay}</span></div> :
          <svg viewBox="0 0 100 100" id="circleTrack">
            <defs>
              <path d=" M 63.67 99.06 A 50 50 0 0 0 99.06 63.67"
                id="textcircle"
              >
              </path>
            </defs>
            <text dy="-19.9">
              <textPath href="#textcircle">
                <animate 
                  attributeName="startOffset" 
                  from="125%" 
                  to ={(-66/19*trackDisplay.length - 75).toFixed(2) + "%"} 
                  begin="0s" 
                  dur={((trackDisplay.length + 19)/4 ).toFixed(2) + "s"} 
                  repeatCount="indefinite"
                />
                {trackDisplay}
              </textPath>
            </text>
          </svg>
        }
        </div>
        <canvas ref={this.CANVAS_REF}/>
      </div>
    );}

}
export default AudioControls 