"use client"

import React, { Component, useState, useEffect } from 'react'
import AudioDataContainer from './AudioDataContainer'
import { mobileAndTabletCheck, audioCheck, glCheck } from '@/helpers/screen'
import NoSleep from 'nosleep.js'
import '@/static/styles/main.css'

function imgSrc(imgName){
  return "/media/img/"+imgName
  //process.env.PUBLIC_URL+
}

function importAll(r) {
  return r.keys().map(r)
}

import { TRACKLIST, DEMO_MODE } from 'portal.config.js'

const env = process.env.NODE_ENV
const isProd = env == "production"

class Portal extends Component {

  FIRST_TRACK = 0
  hdState = true
  aaState = true
  volume = 1

  skip = false

  // noSleep = new NoSleep()

  BUTTON_TEXT = "CLICK TO START"

  errorText = "Your device is not capable of communication. Please try again with a newer device."

  textureImg = null

  resizeTimer = null

  hasGL = true
  hasAnalyzer = true
  

  getPlatformInfo = () => {
    const glInfo = glCheck()
    const audioInfo = audioCheck()

    let isMobile = mobileAndTabletCheck()

    this.hasGL = glInfo.error ? false : true
    this.hdState = glInfo.card === null || isMobile ? false : true
    this.aaState = isMobile ? false : true

  }

  resizeFunc = () => {
    document.body.classList.add("resize-animation-stopper")
    clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(() => {
      document.body.classList.remove("resize-animation-stopper")
    }, 400)
  }

  constructor(props) {
    super(props)
    const { track, router } = this.props

    this.router = router

    this.getPlatformInfo()

    this.SET_TRACK = track ? true : false
    this.FIRST_TRACK = this.SET_TRACK ? track : this.FIRST_TRACK
    this.FIRST_TRACK = parseInt(this.FIRST_TRACK)

    this.CANVAS_REF = React.createRef()

    this.imgSrcs = Object.values(this.props.data.imgs)
    this.imgNames = Object.keys(this.props.data.imgs)

    this.TRACKLIST = TRACKLIST
    this.DEMO_MODE = isProd ? false : DEMO_MODE
    
    this.state = {
      loaded: true,
      clicked: false,
      curText:'',
      imgLoaded: false,
    }
  }

  componentDidMount() {
    if(!this.hasAnalyzer || !this.hasGL){
      this.setState({
        "curText": this.errorText,
      })
      return null
    }

    this.imgCollection = this.loadImages(
      this.imgNames,
      this.imgSrcs,
      () => {
        this.setState({imgLoaded:true}) 
      }
    )

    document.body.onkeyup = (e) => {
      e.preventDefault()
      if(e.keyCode == 83){
          this.skip = true
      }
    }
    window.addEventListener("resize", this.resizeFeedback)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeFeedback)
  }

  loadImages(names, files, onAllLoaded) {
    var i, numLoading = names.length
    const onload = () => --numLoading === 0 && onAllLoaded()
    const images = {}
    for (i = 0; i < names.length; i++) {
        const img = images[names[i]] = new Image
        img.src = files[i]
        img.onload = onload
    }
    return images
  }

  clickMe(){
    this.setState({
      "clicked": true,
    })
  }

	render(){
    const { loaded, curText, clicked, imgLoaded } = this.state
    const audioDataCont = 
      <AudioDataContainer
        FIRST_TRACK={this.FIRST_TRACK}
        DEMO_MODE={this.DEMO_MODE}
        TRACKLIST={this.TRACKLIST}
        clicked={clicked}
        hdState={this.hdState}
        aaState={this.aaState}
        tex={this.imgCollection}
        shaders={this.props.data.shaders}
        volume={this.volume}
      />
    const skip = clicked || this.SET_TRACK

    return (
      !this.DEMO_MODE ? 
        <div className="container">
          <div className={'container intro hidden ' + 
            ( skip ? ' ' : 'shown ')
          }>
            { loaded && imgLoaded ?
                <div id="enterBtnDiv"><button 
                  id='enterButton'
                  onClick={() => this.clickMe()}
                >
                  {this.BUTTON_TEXT}
                  </button> </div>: ''
              }
            <canvas ref={this.CANVAS_REF}/>
          </div>
          
          { skip && imgLoaded ?
            audioDataCont : ''
          }
        </div>
      : imgLoaded ? audioDataCont : ''
    )}

}
export default Portal 