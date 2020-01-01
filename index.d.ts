

declare module 'react-native-parallax-scrollview' {
  import React from 'react'
  import { ScrollViewProps, StyleProp, ViewStyle } from "react-native";

  interface Props extends ScrollViewProps {
    backgroundSource?: object,
    windowHeight: number,
    navBarTitle?: string,
    navBarTitleColor?: string,
    navBarTitleComponent?: React.ReactElement,
    navBarColor?: string,
    userImage?: string,
    userName?: string,
    userTitle?: string,
    headerView?: React.ReactElement,
    leftIcon?: object,
    rightIcon?: object,
    headerStyle?: StyleProp<ViewStyle>,
    leftIconOnPress?: () => void,
    rightIconOnPress?: () => void,
    androidFullScreen?: boolean,
    headerViewStyle?: StyleProp<ViewStyle>,
  }

  export default class ParallaxScrollView extends React.Component<Props>{ }
}