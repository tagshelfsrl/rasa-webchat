import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { MESSAGES_TYPES } from 'constants';
import { Image, Message, Buttons } from 'messagesComponents';
import { showTooltip as showTooltipAction } from 'actions';
import openLauncher from 'assets/launcher_button.svg';
import closeIcon from 'assets/clear-button-grey.svg';
import close from 'assets/clear-button.svg';
import Badge from './components/Badge';

import './style.scss';


const Launcher = ({
  toggle,
  isChatOpen,
  badge,
  fullScreenMode,
  openLauncherImage,
  closeImage,
  unreadCount,
  displayUnreadCount,
  showTooltip,
  lastMessages,
  closeTooltip
}) => {
  const sliderSettings = {
    dots: true,
    infinite: false,
    adaptiveHeight: true
  };
  const lastMessage = lastMessages ? lastMessages.slice(-1)[0] : new Map();
  // This is used to distinguish bw drag and click events in the tooltips sequences.
  const dragStatus = useRef({
    x: 0,
    y: 0
  });
  const className = ['rw-launcher'];
  if (isChatOpen) className.push('rw-hide-sm');
  if (fullScreenMode && isChatOpen) className.push('rw-full-screen rw-hide');


  const getComponentToRender = (message) => {
    const ComponentToRender = (() => {
      switch (message.get('type')) {
        case MESSAGES_TYPES.TEXT: {
          return Message;
        }
        case MESSAGES_TYPES.IMGREPLY.IMAGE: {
          return Image;
        }
        case MESSAGES_TYPES.BUTTONS: {
          return Buttons;
        }
        default:
          return null;
      }
    })();
    return <ComponentToRender id={-1} params={{}} message={message} isLast />;
  };


  const renderToolTip = () => (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="rw-tooltip-body" onClick={(e) => { e.stopPropagation(); }}>
      <div className="rw-tooltip-close" >
        <button onClick={(e) => { e.stopPropagation(); closeTooltip(); }}>
          <img
            src={closeIcon}
            alt="close"
          />
        </button>
      </div>
      <div className="rw-slider-safe-zone">
        <Slider {...sliderSettings}>
          {lastMessages.map(message => (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
              className="rw-tooltip-response"
              onMouseDown={(event) => {
                dragStatus.current.x = event.clientX;
                dragStatus.current.y = event.clientY;
              }}
              onMouseUp={(event) => {
                if (
                  Math.abs(dragStatus.current.x - event.clientX) +
                    Math.abs(dragStatus.current.y - event.clientY) <
                  15
                ) {
                  toggle();
                }
              }}
            >
              {getComponentToRender(message)}
            </div>
          ))}
        </Slider>
      </div>
      <div className="rw-tooltip-decoration" />
    </div>
  );

  const renderOpenLauncherImage = () => (
    <div className="rw-open-launcher__container">
      {unreadCount > 0 && displayUnreadCount && (
        <div className="rw-unread-count-pastille">{unreadCount}</div>
      )}
      <img src={openLauncherImage || openLauncher} className="rw-open-launcher" alt="" />
      {showTooltip && lastMessage && lastMessage.get('sender') === 'response' && renderToolTip()}
    </div>
  );

  return (
    <button type="button" className={className.join(' ')} onClick={toggle}>
      <Badge badge={badge} />
      {isChatOpen ? (
        <img
          src={closeImage || close}
          className={`rw-close-launcher ${closeImage ? '' : 'rw-default'}`}
          alt=""
        />
      ) : (
        renderOpenLauncherImage()
      )}
    </button>
  );
};

Launcher.propTypes = {
  toggle: PropTypes.func,
  isChatOpen: PropTypes.bool,
  badge: PropTypes.number,
  fullScreenMode: PropTypes.bool,
  openLauncherImage: PropTypes.string,
  closeImage: PropTypes.string,
  unreadCount: PropTypes.number,
  displayUnreadCount: PropTypes.bool,
  showTooltip: PropTypes.bool,
  lastMessages: PropTypes.arrayOf(ImmutablePropTypes.map)
};

const mapStateToProps = state => ({
  lastMessages: (state.messages && (() => {
    const messages = [];
    for (let i = 1; i <= state.behavior.get('unreadCount'); i += 1) {
      if (state.messages.get(-i) && state.messages.get(-i).get('sender') !== 'response') break;
      messages.unshift(state.messages.get(-i));
    }
    return messages;
  })()) || new Map(),
  unreadCount: state.behavior.get('unreadCount') || 0,
  showTooltip: state.metadata.get('showTooltip'),
  linkTarget: state.metadata.get('linkTarget')
});

const mapDispatchToProps = dispatch => ({
  closeTooltip: () => dispatch(showTooltipAction(false))
});

export default connect(mapStateToProps, mapDispatchToProps)(Launcher);
