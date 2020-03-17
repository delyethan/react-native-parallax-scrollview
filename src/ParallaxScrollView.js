import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  Text,
  View,
  Image,
  Animated,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { getInset } from 'react-native-safe-area-view';
import FastImage from 'react-native-fast-image'

import { Icon, List, ListItem } from 'react-native-elements';

import { USER, FACEBOOK_LIST, SLACK_LIST, GENERIC_LIST, SCREEN_WIDTH, SCREEN_HEIGHT, DEFAULT_WINDOW_MULTIPLIER, DEFAULT_NAVBAR_HEIGHT } from './constants';

import styles from './styles';

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)
const AnimatedFastImage = Animated.createAnimatedComponent(FastImage)

const ScrollViewPropTypes = ScrollView.propTypes;

export default class ParallaxScrollView extends Component {
  constructor() {
    super();

    this.state = {
      scrollY: new Animated.Value(0),
      orientation: 'portrait',
      topPadding: getInset('top', false),
      topPaddingLandscape: getInset('top', true),
      navHeight: 100,
      isLight: false
    };
    const isPortrait = () => {
      const dim = Dimensions.get('screen');
      return dim.height >= dim.width;
    };
    Dimensions.addEventListener('change', () => {
      this.setState({
        orientation: isPortrait() ? 'portrait' : 'landscape'
      });
    });
  }

  scrollTo(where) {
    if (!this._scrollView) return;
    this._scrollView.scrollTo(where);
  }

  renderBackground() {
    var { windowHeight, backgroundSource, onBackgroundLoadEnd, onBackgroundLoadError } = this.props;
    var { scrollY } = this.state;
    if (!windowHeight || !backgroundSource) {
      return null;
    }

    return (
      <AnimatedFastImage
        style={[
          styles.background,
          {
            height: windowHeight,
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [-windowHeight, 0, windowHeight],
                  outputRange: [windowHeight / 2, 0, -windowHeight / 3]
                })
              },
              {
                scale: scrollY.interpolate({
                  inputRange: [-windowHeight, 0, windowHeight],
                  outputRange: [2, 1, 1]
                })
              }
            ]
          }
        ]}
        source={backgroundSource}
        onLoadEnd={onBackgroundLoadEnd}
        onError={onBackgroundLoadError}
      >
      </AnimatedFastImage>
    );
  }

  renderHeaderView() {
    const { windowHeight, backgroundSource, userImage, userName, userTitle, navBarHeight, headerViewStyle } = this.props;
    const { scrollY, navHeight } = this.state;
    if (!windowHeight || !backgroundSource) {
      return null;
    }

    const newNavBarHeight = navBarHeight || DEFAULT_NAVBAR_HEIGHT;
    const newWindowHeight = windowHeight - newNavBarHeight;

    return (
      <Animated.View
        style={[{
          // opacity: scrollY.interpolate({
          //   inputRange: [-windowHeight, 0, (windowHeight - (navHeight * 2)) * 0.8 + newNavBarHeight],
          //   // inputRange: [-windowHeight, 0, windowHeight * DEFAULT_WINDOW_MULTIPLIER + newNavBarHeight],
          //   outputRange: [1, 1, 0.3]
          // })
        }, headerViewStyle]}
      >
        <View style={{ height: newWindowHeight }}>
          {this.props.headerView ||
            (
              <View>
                <View
                  style={styles.avatarView}
                >
                  {(typeof userImage === "string" || userImage instanceof String) ?
                    <FastImage source={{ uri: userImage || USER.image }} style={{ height: 120, width: 120, borderRadius: 60 }} />
                    :
                    <FastImage source={userImage || USER.image} style={{ height: 120, width: 120, borderRadius: 60 }} />
                  }
                </View>
                <View style={{ paddingVertical: 10 }}>
                  <Text style={{ textAlign: 'center', fontSize: 22, color: 'white', paddingBottom: 5 }}>{userName || USER.name}</Text>
                  <Text style={{ textAlign: 'center', fontSize: 17, color: 'rgba(247,247, 250, 1)', paddingBottom: 5 }}>{userTitle || USER.title}</Text>
                </View>
              </View>
            )
          }
        </View>
      </Animated.View>
    );
  }

  renderNavBarTitle() {
    const { windowHeight, backgroundSource, navBarTitleColor, navBarTitleComponent } = this.props;
    const { scrollY, navHeight } = this.state;
    if (!windowHeight || !backgroundSource) {
      return null;
    }

    return (
      <Animated.View
        style={{
          flex: 1,
          opacity: scrollY.interpolate({
            inputRange: [-windowHeight, (windowHeight - (navHeight * 2)) * 0.8, windowHeight - (navHeight * 2)],
            outputRange: [0, 0, 1]
          })
        }}
      >
        {navBarTitleComponent ||
          <Text style={{ fontSize: 18, fontWeight: '600', color: navBarTitleColor || 'white' }}>
            {this.props.navBarTitle || USER.name}
          </Text>}
      </Animated.View>
    );
  }

  checkStatusBarColor = () => {
    // const { windowHeight } = this.props
    // const { scrollY, navHeight } = this.state
    // scrollY.addListener(value => {
    //   const isLight = value.value > windowHeight - (navHeight * 2);
    //   if (isLight === false) {
    //     if (stateLight === true) {
    //       stateLight = false
    //       StatusBar.setBarStyle('light-content')
    //     }
    //   }
    //   if (isLight === true) {
    //     if (stateLight === false) {
    //       stateLight = true
    //       StatusBar.setBarStyle('dark-content')
    //     }
    //   }
    // })
  }

  rendernavBar() {
    const {
      windowHeight, backgroundSource, leftIcon,
      rightIcon, leftIconOnPress, rightIconOnPress, navBarColor, navBarHeight, leftIconUnderlayColor, rightIconUnderlayColor,
      headerStyle, androidFullScreen
    } = this.props;
    const { scrollY, orientation, topPaddingLandscape, topPadding, navHeight } = this.state;
    if (!windowHeight || !backgroundSource) {
      return null;
    }
    const extraHight = orientation === 'portrait' ? topPadding : topPaddingLandscape
    const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : ifIphoneX(extraHight, 0)
    let prevPaddingTop = 0
    if (headerStyle != undefined) {
      if (Array.isArray(headerStyle)) {
        const array = newHeaderStyle.filter(m => m.paddingTop).map(m => m.paddingTop)
        prevPaddingTop = array[array.length - 1]
        headerStyle.map(m => { delete m.paddingTop; return m })
      } else {
        prevPaddingTop = headerStyle && headerStyle.paddingTop ? headerStyle.paddingTop : 0
        delete headerStyle['paddingTop']
      }
    }

    if (this.props.navBarView) {
      return (
        <AnimatedSafeAreaView
          onLayout={ref => ref.nativeEvent ? this.setState({ navHeight: ref.nativeEvent.layout.height }) : null}
          emulateUnlessSupported={true}
          style={[{
            paddingTop: (androidFullScreen ? paddingTop : 0) + prevPaddingTop,
            width: SCREEN_WIDTH,
            flexDirection: 'row',
            backgroundColor: scrollY.interpolate({
              inputRange: [-windowHeight, (windowHeight - (navHeight * 2)) * 0.8, windowHeight - (navHeight * 2)],
              outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,0)', navBarColor || 'rgba(0, 0, 0, 1.0)'],
              extrapolate: 'clamp'
            }),
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }]}
        >
          {/* <StatusBar animated barStyle={!this.state.isLight ? 'light-content' : 'dark-content'} /> */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {this.props.navBarView.Left ? <View>
              {this.props.navBarView.Left}
            </View> : null}
            {this.renderNavBarTitle()}
            {this.props.navBarView.Right ? <View>
              {this.props.navBarView.Right}
            </View> : null}
          </View>
        </AnimatedSafeAreaView>
      );
    }
    else {
      return (
        <AnimatedSafeAreaView
          onLayout={ref => ref.nativeEvent ? this.setState({ navHeight: ref.nativeEvent.layout.height }) : null}
          emulateUnlessSupported={true}
          style={[{
            paddingTop: (androidFullScreen ? paddingTop : 0) + prevPaddingTop,
            width: SCREEN_WIDTH,
            flexDirection: 'row',
            backgroundColor: scrollY.interpolate({
              inputRange: [-windowHeight, (windowHeight - (navHeight * 2)) * 0.8, windowHeight - (navHeight * 2)],
              outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,0)', navBarColor || 'rgba(0, 0, 0, 1.0)'],
              extrapolate: 'clamp'
            }),
          }]}
        >
          {leftIcon &&
            <View
              style={[{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }, headerStyle]}
            >
              <Icon
                name={leftIcon && leftIcon.name || 'menu'}
                type={leftIcon && leftIcon.type || 'simple-line-icon'}
                color={leftIcon && leftIcon.color || 'white'}
                size={leftIcon && leftIcon.size || 23}
                onPress={leftIconOnPress}
                underlayColor={leftIconUnderlayColor || 'transparent'}
              />
            </View>
          }
          <View
            style={{
              flex: 5,
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center'
            }}
          >
            {this.renderNavBarTitle()}
          </View>
          {rightIcon &&
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Icon
                name={rightIcon && rightIcon.name || 'present'}
                type={rightIcon && rightIcon.type || 'simple-line-icon'}
                color={rightIcon && rightIcon.color || 'white'}
                size={rightIcon && rightIcon.size || 23}
                onPress={rightIconOnPress}
                underlayColor={rightIconUnderlayColor || 'transparent'}
              />
            </View>
          }
        </AnimatedSafeAreaView>
      );
    }
  }

  renderTodoListContent() {
    return (
      <View style={styles.listView}>
        <List>
          {
            FACEBOOK_LIST.map((item, index) => (
              <ListItem
                key={index}
                onPress={() => console.log('List item pressed')}
                title={item.title}
                leftIcon={{ name: item.icon }} />
            ))
          }
        </List>
        <List>
          {
            SLACK_LIST.map((item, index) => (
              <ListItem
                key={index}
                onPress={() => console.log('List item pressed')}
                title={item.title}
                leftIcon={{ name: item.icon }} />
            ))
          }
        </List>
        <List>
          {
            GENERIC_LIST.map((item, index) => (
              <ListItem
                key={index}
                onPress={() => console.log('List item pressed')}
                title={item.title}
                leftIcon={{ name: item.icon }} />
            ))
          }
        </List>
        <List containerStyle={{ marginBottom: 15 }}>
          <ListItem
            key={1}
            hideChevron={true}
            onPress={() => console.log('Logout Pressed')}
            title='LOGOUT'
            titleStyle={styles.logoutText}
            icon={{ name: '' }} />
        </List>
      </View>
    );
  }

  render() {
    const { style, ...props } = this.props;
    return (
      <View style={[styles.container, style]}>
        {this.renderBackground()}
        <View style={{ position: 'absolute', top: 0, zIndex: 1 }}>
          {this.rendernavBar()}
        </View>
        <ScrollView
          ref={component => {
            this._scrollView = component;
          }}
          {...props}
          style={styles.scrollView}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
            { listener: _.debounce(this.checkStatusBarColor, 16) }
          )}
          scrollEventThrottle={16}
        >
          {this.renderHeaderView()}
          <View style={[styles.content, props.scrollableViewStyle]}>
            {this.props.children || this.renderTodoListContent()}
          </View>
        </ScrollView>
      </View>
    );
  }
}

ParallaxScrollView.defaultProps = {
  backgroundSource: { uri: 'http://i.imgur.com/6Iej2c3.png' },
  windowHeight: SCREEN_HEIGHT * DEFAULT_WINDOW_MULTIPLIER,
  leftIconOnPress: () => console.log('Left icon pressed'),
  rightIconOnPress: () => console.log('Right icon pressed')
};

ParallaxScrollView.propTypes = {
  ...ScrollViewPropTypes,
  backgroundSource: PropTypes.any,
  windowHeight: PropTypes.number,
  navBarTitle: PropTypes.string,
  navBarTitleColor: PropTypes.string,
  navBarTitleComponent: PropTypes.node,
  navBarColor: PropTypes.string,
  userImage: PropTypes.string,
  userName: PropTypes.string,
  userTitle: PropTypes.string,
  headerView: PropTypes.node,
  leftIcon: PropTypes.object,
  rightIcon: PropTypes.object,
  androidFullScreen: PropTypes.bool
};
