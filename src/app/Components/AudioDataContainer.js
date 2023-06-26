import React from 'react'

import AudioControls from './AudioControls'
import Toggle from './Toggle'
import Loader from './Loader'

import Track from './Track'

import '@/static/styles/main.css'
import '@/static/styles/mediaplayer.css'
import '@/static/styles/miniplayer.css'

const mp3Loc = "/media/mp3/";

function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
  }


class AudioDataContainer extends React.Component {

  audioFile = new Audio()
  contextClass = (
    window.AudioContext || 
    window.webkitAudioContext || 
    window.mozAudioContext || 
    window.oAudioContext || 
    window.msAudioContext
  )
  audioContext = new this.contextClass()
  source = this.audioContext.createMediaElementSource(this.audioFile)
  audioData = this.audioContext.createAnalyser()
  audioDataHD = this.audioContext.createAnalyser()

  toggleVal = 0
  toggleLerp = null

  hdState = null
  aaState = null

  constructor(props) {
    super(props)    

    // this.audioState = this.props.clicked ? 'playing' : 'paused'
    this.audioState = this.audioContext.state == 'running'
      ? 'playing' : 'paused'

// console.log('volume', props.volume)
    this.audioFile.preload = 'auto'
    
    this.frequencyBandArray = [...Array(25).keys()]
    this.audioFile.src = this.mp3Src(props.FIRST_TRACK)
    this.audioFile.volume = props.volume
    
    this.source.connect(this.audioContext.destination)
    // console.log('hi')

    this.audioData.fftSize = 1024
    this.audioData.maxDecibels = -2
    this.source.connect(this.audioData)

    this.audioDataHD.fftSize = 8192 / 2
    this.audioDataHD.maxDecibels = -8
    this.source.connect(this.audioDataHD)

    this.hdState = this.props.hdState
    this.aaState = this.props.aaState

    this.state = {
      trackNum: props.FIRST_TRACK,
      audioLoaded: false,
      webglLoaded: true,
      ended: false,
      audioLoadedOnce: false,
      toggle: false,
      hide:false,
      loadVizzy: false
    }
  }

  componentDidMount() {
    this.audioFile.addEventListener('loadedmetadata', this.audioLoaded, false)
    this.audioFile.addEventListener('ended', this.audioEnded, false)
    document.body.onkeyup = (e) => {
        e.preventDefault()
        if(e.keyCode == 32){
            this.playPauseAudio()
        }
        else if(e.keyCode == 72){
            this.toggleHide()
        }
        else if(e.keyCode == 39){
            this.nextAudio()
        }
        else if(e.keyCode == 37){
            this.prevAudio()
        }
        else if(e.keyCode == 70){
          this.toggleHD()
        }
    }
    addEventListener("dblclick", (event) => this.toggleHide())
    setTimeout(() => this.setState({loadVizzy: true}), 100)
  }

  componentWillUnmount() {
    this.audioContext.close()
  }

  toggleHide = () => {
    this.setState({hide:!this.state.hide})
  }

  mp3Src = (tracknum) => {
    return mp3Loc+this.props.TRACKLIST[tracknum].source
  }

  setScreenOrientation = () => {
    let orientation = this.getScreenOrientation()
    if(orientation != this.state.orientation){
      this.setState({orientation:orientation})
    }
  }

  audioLoaded = () => {
    let waitTime = this.props.DEMO_MODE ? 2 : 2000
    setTimeout(() => this.setState({
      audioLoaded:true,
      audioLoadedOnce: true,
    }, () => {
      if(this.audioState == 'playing'){
        this.audioFile.play()
      }
    })
    , waitTime)
  }

  audioEnded = () => {
    const {DEMO_MODE} = this.props
    if(this.state.trackNum < this.props.TRACKLIST.length-1 && !DEMO_MODE){
      this.nextAudio()
    }
    else if(DEMO_MODE){
      this.audioFile.currentTime = 0
      this.audioFile.play()
    }
  }

  setCurTime = (setTime) => {
    this.audioFile.currentTime = setTime
    if(this.audioContext.state == 'running'){
      this.audioFile.play()
      this.audioState = 'playing'
    }
  }

  initializeAudioAnalyser = () => {
      this.playAudio()
  }

  setAudio = (trackNum, audioState) => {
    this.trackNum = trackNum
    this.audioFile.pause()
    this.audioFile.src = this.mp3Src(trackNum);
    this.audioFile.load()
    let url = '/' + (trackNum + 1)
    window.history.replaceState({ ...window.history.state, as: url, url: url }, '', url);
  }

  playAudio = () => {
    this.audioFile.play()
    this.audioContext.resume()
    this.audioState = 'playing'
    if(!this.state.clicked){
      this.setState({clicked:true})
    }
  }

  pauseAudio = () => {
    this.audioFile.pause()
    this.audioState = 'paused'
  }

  playPauseAudio = () => {
    if(this.audioState == 'playing'){
      this.pauseAudio()
    }
    else{
      this.playAudio()
    }
  }

  stopAudio = () => {
    this.audioFile.stop()
    this.audioState = 'stopped'
  }

  nextAudio = (audioState) => {
    const {DEMO_MODE} = this.props
    if(this.state.trackNum < this.props.TRACKLIST.length-1 && !DEMO_MODE){
      this.setState({
        trackNum:this.state.trackNum + 1,
        audioLoaded:false,
        loadVizzy: false,
      }, () => {
        this.setAudio(this.state.trackNum, audioState)
        setTimeout(() => this.setState({loadVizzy: true}), 100)
      })
    }
  }

  prevAudio = (audioState) => {
    const {DEMO_MODE} = this.props
    if(this.state.trackNum > 0 && !DEMO_MODE){
      this.setState({
        trackNum:this.state.trackNum - 1,
        audioLoaded:false,
        loadVizzy: false,
      }, () => {
        this.setAudio(this.state.trackNum, audioState)
        setTimeout(() => this.setState({loadVizzy: true}), 100)
      })
    }
  }

  getTrackNum = () => {
    return this.state.trackNum
  }

  freq2Index = (freq) => {
    let fftSize = this.aaState ? this.audioDataHD.fftSize : this.audioData.fftSize
    let binSize = (44100 / fftSize / 4);
    return Math.ceil(freq / binSize);
  }

  melScale = (ampArray) => {
    let fftSize = this.aaState ? this.audioDataHD.fftSize : this.audioData.fftSize
    let binSize = (44100.0 / fftSize / 4);
    let melArray = []
    for(let i = 0; i < ampArray.length; i++){
      let dB = ampArray[i] / 255.0
      let melVal = (i / ampArray.length + 1) * dB
      melArray.push(melVal*melVal)
    }
    // console.log(melArray)
    return melArray;
  }

  getFrequencyData = () => {
    let calcAudioData = this.aaState ? this.audioDataHD : this.audioData
    const bufferLength = calcAudioData.frequencyBinCount
    const amplitudeArray = new Uint8Array(bufferLength)
    calcAudioData.getByteFrequencyData(amplitudeArray)
    
    let lowF = 120
    let midF = 1200
    let lowIdx = this.freq2Index(lowF)
    let midIdx = this.freq2Index(midF)
    // console.log(lowIdx)
    let melAmpArray = this.melScale(amplitudeArray)
    let low = melAmpArray.slice(0, lowIdx).reduce((a, b) => a + b, 0)
    let mid = melAmpArray.slice(lowIdx, midIdx).reduce((a, b) => a + b, 0)
    let high = melAmpArray.slice(midIdx, bufferLength).reduce((a, b) => a + b, 0)
    let mult = 1.5
    let lmh = [low/lowIdx * mult, mid/(midIdx-lowIdx) * mult, high/(bufferLength-midIdx) * mult]
    // console.log(buffeLength)
    return lmh
  }

  getAllFrequencyData = () => {
    let calcAudioData = this.aaState ? this.audioDataHD : this.audioData
    const bufferLength = calcAudioData.frequencyBinCount
    const freqArray = new Uint8Array(bufferLength)
    const timeArray = new Uint8Array(bufferLength)

    calcAudioData.getByteFrequencyData(freqArray)

    calcAudioData.getByteTimeDomainData(timeArray)

    let audioArray = freqArray.reduce((acc, cur, idx) => {
      return acc.concat([cur, timeArray[idx]]);
    }, []);

    return audioArray
  }

  incrementToggle = (toggleType) => {
    if(this.toggleVal < 30 && toggleType == 'mini'){
      this.toggleVal += 1
      this.toggleLerp = setTimeout(() => this.incrementToggle(toggleType), 33)
    }
    else if(this.toggleVal > 0 && toggleType != 'mini'){
      this.toggleVal -= 1
      this.toggleLerp = setTimeout(() => this.incrementToggle(toggleType), 33)
    }
  }

  toggleStatus = (toggleType) => {
    this.setState({toggle:!this.state.toggle})
    clearTimeout(this.toggleLerp)
    this.toggleLerp = setTimeout(
      () => this.incrementToggle(toggleType)
    , 33)
  }

  getToggleStatus = () => {
    return 1-this.toggleVal/30
  }
  getMiniToggleStatus = () => {
    return this.toggleVal/30
  }
  getAudioState = () => {
    return this.audioState
  }

  toggleHD = () => {
    this.hdState = !this.hdState;
  }

  toggleAA = () => {
    this.aaState = !this.aaState;
    this.audioData = this.audioContext.createAnalyser()
    this.audioData.fftSize = this.aaState ? 512 : 128
    this.source.connect(this.audioContext.destination)
    this.source.connect(this.audioData)
  }

  getHDAA = () => {
    return [this.hdState, this.aaState] ;
  }

  getAudioData = () => {
    return {
      "playState" : this.audioState,
      "curTime" : this.audioFile.currentTime,
      "bpm" : this.props.TRACKLIST[this.state.trackNum].bpm
    }
  }

  visualizer = (trackNum) => {
    const components = this.props.TRACKLIST.map(r => r.component)
    const compNum = Math.max(0, Math.min(components.length, trackNum))
    return <Track 
      trackNum={trackNum}
      getAudioData={this.getAudioData}
      getAllFrequencyData={this.getAllFrequencyData}
      getFrequencyData={this.getFrequencyData}
      getHDAA={this.getHDAA}
      setCurTime={this.setCurTime}
      DEMO_MODE={this.props.DEMO_MODE}
      tex={this.props.tex}
      shaders={this.props.shaders}
      componentName={components[compNum]}
    />
  }

  audioController = (type) => {
    return <AudioControls
      maxTrack={this.props.TRACKLIST.length-1}
      trackNum={this.state.trackNum}
      prevAudio={this.prevAudio}
      nextAudio={this.nextAudio}
      playAudio={this.playAudio}
      pauseAudio={this.pauseAudio}
      TRACKLIST={this.props.TRACKLIST}
      audioLoaded={this.state.audioLoaded}
      getAudioState={this.getAudioState}
      getHDAA={this.getHDAA}
      toggleHD={this.toggleHD}
      type={type}
      tex={this.props.tex}
      shaders={this.props.shaders}
      getToggleStatus={type == 'mini' ? this.getMiniToggleStatus : this.getToggleStatus}
    />
  }

  render(){
    const { 
      trackNum, audioLoaded, webglLoaded, clicked, audioLoadedOnce,
      toggle, hide, loadVizzy
    } = this.state
    const { TRACKLIST, DEMO_MODE, tex, shaders } = this.props
    const miniController = this.audioController('mini')
    const mediaController = this.audioController('media')
    return (
      <div className='container'>
      {!DEMO_MODE && !hide ? 
        <div className='audioControls'>
          <Toggle
            tex={tex}
            shaders={shaders}
            toggleStatus={this.toggleStatus}
            audioLoadedOnce={audioLoadedOnce}
            getHDAA={this.getHDAA}
          />
          {miniController}
          {mediaController}
        </div> : ''}
        {loadVizzy && <div className={'bg hidden-fast '+ 
          ( (audioLoaded && webglLoaded) ? 'shown' : ' ')
        }>
        { this.visualizer(trackNum) }
        </div>}
        <div className={(!toggle ? 'loader' : 'loader-mini') + 
          ' hidden ' + 
          ( (audioLoaded && webglLoaded) ? ' ' : 'shown-fast ')
        }>
          {!DEMO_MODE ? 
          <Loader
            shaders={shaders}
            trackNum={trackNum}
            getHDAA={this.getHDAA}
            className='overlay'
          /> : ''}
        </div>
      </div>
    );
  }
}

export default AudioDataContainer