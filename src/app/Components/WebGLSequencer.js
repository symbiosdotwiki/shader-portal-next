import React, { Component } from 'react'
import { getCanvasMousePosition } from '@/helpers/screen'
import { render } from 'react-dom'
import * as twglr from '@/helpers/twgl'
import {afn, minGreater, maxLessthan} from '@/helpers/animation'
import WebGLInfo from './WebGLInfo'
import WebGLComponent from './WebGLComponent'

var twgl = twglr.twgl

class WebGLSequencer extends WebGLComponent {

  startBar = 0
  randomSeed = 0

  dt = 0
  prevTime = -1
  prevTimeFPS = 0
  fps = 0
  curBar = 0
  loopBar = -2
  loopStartBar = 0

  resetBtn = true

  audioData = {}

  AUDIO_HIGH = 0
  AUDIO_MID = 0
  AUDIO_LOW = 0
  lmh = [0,0,0]

  nextRenderFrame = null
  nextFrame = 1

  sequencerUniforms = {}
  sequencerUniformsOG = {}

  curKeyframe = -1
  prevKeyframe = -1

  keyframes = {}

  evalObj = (toEval, evalTime) => {
    if(evalTime == null){
      evalTime = this.props.getAudioData().curTime + this.randomSeed
    }
    let retObj = {}
    Object.keys(toEval).forEach(key => {
      let val = toEval[key]
      if (typeof val === 'function') {
          val = val(evalTime)
      }
      retObj[key] = val
    })
    return retObj
  }

  sequencer = () => {
    let {audioData, prevTime, randomSeed} =  this
    let resetTime = false
    let curTime = audioData.curTime + randomSeed

    if(prevTime > curTime || this.resetBtn){
      this.curKeyframe = -1
      this.prevKeyframe = -1

      if(!this.resetBtn){
        resetTime = true
        this.sequencerUniforms = this.evalObj(this.sequencerUniforms, prevTime)
      }
      else{
        this.sequencerUniforms = JSON.parse(JSON.stringify(this.sequencerUniformsOG))
        
      }
    }

    let {keyframes, curKeyframe, prevKeyframe, curBar} = this
    
    while(curBar > curKeyframe && curKeyframe > -2 && prevKeyframe < curBar){

      if(curKeyframe > -1){
        let thisKeyframe = keyframes[curKeyframe.toString()]
        
        for(var i = 0; i < thisKeyframe.length; i++){
          let ev = thisKeyframe[i]
          let evTime = resetTime ? audioData.curTime : curKeyframe * 4 * 60 / audioData.bpm
          evTime += randomSeed;
          if(ev.type == 'const'){
            this.sequencerUniforms[ev.name] = ev.val
          }
          else{
            let dur = 4 * ev.dur * 60 / audioData.bpm
            let curVal = this.evalObj(this.sequencerUniforms, prevTime)[ev.name]
            let nextVal = this.evalObj(this.sequencerUniforms)[ev.name]

            let rangeStart = ev.range[0] == null || ev.range[0] == 'auto' ? curVal : ev.range[0]
            let rangeEnd = ev.range[0] == null ? curVal + ev.range[1] :  ev.range[1]
            
            let phase = ev.phase ? ev.phase : 0;

            this.sequencerUniforms[ev.name] = afn[ev.type](
              rangeStart, rangeEnd, evTime,
              evTime + dur, phase
            )
          }
          
        }
      }

      prevKeyframe = curKeyframe
      this.prevKeyframe = prevKeyframe
      curKeyframe = minGreater(Object.keys(keyframes), curKeyframe)
      this.curKeyframe = curKeyframe

    }
    this.resetBtn = false
  }

  handleMouseMove = (event) => {
      this.mousePos = getCanvasMousePosition(event, this.CANVAS_REF.current)
  }

  constructor(props) {
    super(props)
    this.audioData = this.props.getAudioData()
  }

  componentDidMount() {
    this.sequencerUniformsOG = JSON.parse(JSON.stringify(this.sequencerUniforms))
    this.setup()
    this.startRender()
  }


  setStartTime = () => {
    let startTime = this.startBar > 0 ? this.startBar * 4 * 60 / this.audioData.bpm - 1 : 0
    this.props.setCurTime(startTime)
  }

  reset = () => {
    this.setStartTime()
    this.resetBtn = true
  }

  loopTrack = () => {
    let startTime = this.loopStartBar * 4 * 60 / this.audioData.bpm
    this.props.setCurTime(startTime)
  }

  startRender = () => {
    if(this.props.DEMO_MODE){
      setTimeout(() => this.reset(), 100)
    }
    requestAnimationFrame(this.renderGl)
  }

  renderGl = (rTime) => {
    this.setHDAA()
    if(this.loopBar > -1 && this.curBar >= this.loopBar - .015){
      this.loopTrack()
    }
    this.audioData = this.props.getAudioData()

    this.seqUniEval = this.evalObj(this.sequencerUniforms)

    let time = rTime/1000
    let {prevTimeFPS, prevTime} = this
    let dt = (prevTimeFPS) ? time - prevTimeFPS : 0
    this.prevTimeFPS = time

    this.fps = .9 * this.fps + .1 * Math.ceil(1/dt)
    this.curBar = this.audioData.curTime * this.audioData.bpm / 60 / 4 

    if(this.props.getAudioData().playState == 'playing'){
      this.sequencer()
      this.renderLoop()
    }

    this.prevTime = this.audioData.curTime + this.randomSeed
    this.renderAudio()
    
    if(this.nextFrame > 0){
      this.nextRenderFrame = setTimeout(
        () => requestAnimationFrame(this.renderGl),
        1
      )
    }
  }

  skipFrame = () => { 
    requestAnimationFrame(this.renderGl)
  }

  renderAudio = () => {
    this.hdAA = this.props.getHDAA()
    let audioDataArray = this.props.getFrequencyData()
    this.lmh = audioDataArray
    this.AUDIO_LOW = audioDataArray[0]
    this.AUDIO_MID = audioDataArray[1]
    this.AUDIO_HIGH = audioDataArray[2]
  }

  getInfo = () => {
    return {
      fps: this.fps,
      curBar: this.curBar
    }
  }

  render(){
    const {DEMO_MODE} = this.props
    return (
      <div>
        <canvas ref={this.CANVAS_REF} width='100%' height='100%'/>
        {DEMO_MODE ? 
          <WebGLInfo
            getInfo={this.getInfo}
            reset={this.reset}
          /> : ''}
      </div>
    )}

}
export default WebGLSequencer
