import React, { Component } from 'react'

import { render } from 'react-dom'

import '@/static/styles/info.scss'

class Info extends Component {

  resizing = null

  constructor(props) {
    super(props);
    this.state = {
      pop:false
    }
  }

  // componentDidMount() {
     
  // }

  togglePop = () => {
    this.setState({pop:!this.state.pop})
  }

  componentDidUpdate(prevProps) {
  if (prevProps.toggledOn !== this.props.toggledOn) {
    this.setState({pop:false})
  }
}

  render(){
    const { togglePop } = this
    const { pop } = this.state
    return (
      <div> 
        <div 
          id="info-pop"
          className={'popClose' + (pop ? ' popOpen' : '')}
          onClick={() => this.togglePop()}
        >
          <div className={'crt crtClose' + (pop ? ' crtOpen' : '')}></div>
          <div id="info-text">
            <p><strong>Isomov - In Theory</strong> (DECISIONS 016)</p>
            <p><strong>Audio</strong></p>
            <p>All tracks written, produced, and mixed by Isomov between 2017 and 2019</p>
            <p>Mastering by Air Max '97</p>
            <p><strong>WiFi Holoports</strong></p>
            <p>Hologram, WebGL visualizer, and captive portal concepts by Isomov</p>
            <p>Built between 2018 and 2021</p>
            <p><strong>Holograms</strong></p>
            <p>The holograms would not have been possible without the guidance and generosity of Dr. Martina Mrongovius</p>
            <p>The first batch of holograms were recorded using Dr. Mrongovius' 532nm diode laser at the Holocenter on Governor's Island in NYC</p>
            <p>Subsequent holograms were recorded in Isomov's home studio using an identical 532nm diode laser</p>
            <p>All lasers were expertly supplied by Phil Bergeron</p>
            <p><strong>Cases</strong></p>
            <p>Cases designed by Thomas Lauria, based on C4Labs Zebra cases</p>
            <p>Acrylic cases were cut with the help of Gabe Liberti at Future Space in Brooklyn</p>
            <p>CNC cuts made by Alex Hayden</p>
            <p><strong>Visualizers</strong></p>
            <p>WebGL (via TWGL.js) is used to display real-time, uncompressed, and unique vizualizers for each song on the EP</p>
            <p>Origin, Emergence, and The One - Implementation of black hole raytracing algorithm modified from set111 via Shadertoy, stars are generated using Conway&rsquo;s Game of Life</p>
            <p>HOPiNG MECHANiSMS - Implementation of Colin Barre-Brisebois and Marc Bouchard&rsquo;s algorithm for subsurface scattering modified from XT95 via Shadertoy, general raytracing setup adapted from iq via Shadertoy</p>
            <p>Ensemble - Physarum particle simulation adapted from Sage Jensen, implemented using 8bit WebGL 1.0 texture buffers which pack 16bit XY data for position and velocity into RG and BA respectively for compatibility purposes, feedback implemented with ping-ponging, rendered using 2D phong shading</p>
            <p>WaVeLeT - Wavelet transform adapted from pixelbeast via Shadertoy, custom aurora ray tracing algorithm&nbsp;</p>
            <p>Memory L&infin;ps - Raytracing setup modified from iq via Shadertoy, custom 3D truchet and Poincare disc schemes</p>
            <p>Yin-Yang Loader - Algorithm design by Isomov</p>
            <p>Media Players - Modelling, offline renders, and phong shading by Isomov</p>
            <p><br/></p>
          </div>
        </div>
      </div>
    )
  }

}
export default Info 
