import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ReactSlider from 'rc-slider';
import './ArtistInfo.css';
import '../css/ReactSlider.css';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import SpeakerIcon from './svg/SpeakerIcon.js';
import Marquee from 'react-marquee';
import cx from 'classnames';
import Swipeable from 'react-swipeable';
import partial from 'lodash/partial';
import invoke from 'lodash/invoke';
import detectMobile from '../utils/detection';

const SpeakerHandle = props =>
  <div className="rc-slider-handle" style={{left: Math.max((props.offset*.96), 4) + '%'}}>
    <SpeakerIcon className="rc-slider-handle-icon"/>
  </div>

export default class ArtistInfo extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showMarquee: false,
      marqueeDuration: 0,
      isMobile: detectMobile()
    }
  }

  static propTypes = {
    coverURL: React.PropTypes.string,
    title: React.PropTypes.string,
    artist: React.PropTypes.string,
    onVolumeChange: React.PropTypes.func,
    volume: React.PropTypes.number,
    hasError: React.PropTypes.bool
  };

  static defaultProps = {
    volume: 75,
    hasError: false
  };

  // This is dangerous. Never set state on update without a clear condition
  componentDidUpdate() {
    const title = ReactDOM.findDOMNode(this.refs.title);
    const node = ReactDOM.findDOMNode(this.refs.marquee);
    const shouldShow = (title.getBoundingClientRect().width - node.clientWidth) > 0;
    if (this.state.showMarquee != shouldShow) {
      this.setState({
        showMarquee: shouldShow,
        marqueeDuration: (node.scrollWidth / node.clientWidth) * 3
      });
    }
  }

  onVolumeChange = (value) => {
    if (isFunction(this.props.onVolumeChange)) {
      this.props.onVolumeChange(value);
    }
  }

  handleImageError = (e) => {
    e.currentTarget.src = require("raw!../assets/default_cover.txt");
  }

  handleSwiping = (e) => {
    if (typeof e === 'string') {
      switch (e) {
        case 'left':
          invoke(this.props, 'onNext');
          break;
        case 'right':
          invoke(this.props, 'onPrevious');
          break;
      }
    }
  }

  render() {

    const { title, artist, volume, songID, hasError } = this.props;
    const animate = {
      animation: `marquee ${this.state.marqueeDuration}s linear infinite`,
      animationDelay: '1s',
      animationDirection: 'alternate'
    };

    return (
      <div className="artist-info">

        {
          hasError &&
          <div className="artist-info__error">
            Error Playing Media
          </div>
        }

        <Swipeable
          onSwipedRight={partial(this.handleSwiping, 'right')}
          onSwipedLeft={partial(this.handleSwiping, 'left')}>
          <div className="artist-info__cover-container">
            <ReactCSSTransitionGroup
              transitionName="cover"
              transitionEnterTimeout={250}
              transitionLeaveTimeout={250}>
              <img key={songID} className="artist-info__cover" src={this.props.coverURL}
              onError={this.handleImageError} />
            </ReactCSSTransitionGroup>
          </div>
        </Swipeable>

        {
          !this.state.isMobile &&
          <ReactSlider
            onChange={this.onVolumeChange}
            value={volume}
            handle={<SpeakerHandle />} />
        }

        <div className="artist-info__song">
          <div className="artist-info_title">
            <div ref="marquee" className="marquee">
              <div className="marquee_content"
                   style={this.state.showMarquee ? animate : {}}>
                <h2 ref="title">{title}</h2>
              </div>
            </div>
          </div>
          <h6 className="truncate">{artist}</h6>
        </div>

      </div>
    );
  }

}
