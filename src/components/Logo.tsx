import React from 'react';
import { Image, View } from 'react-native';
import Text from './AppText';
import { styles } from '../styles/styles';

const LOGO_SOURCE: any = require('../../assets/images/logo.png');

export default function Logo({ dark = false, auth = false }: { dark?: boolean; auth?: boolean }) {
  if (LOGO_SOURCE) {
    return (
      <Image
        source={LOGO_SOURCE}
        resizeMode="contain"
        style={
          auth
            ? {
                width: 220,
                height: 72,
                alignSelf: 'flex-start',
                transform: [{ translateX: -28 }, { translateY: 10 }],
              }
            : { width: 280, height: 90 }
        }
        accessibilityLabel="LibrasHub"
      />
    );
  }

  return (
    <View
      style={
        auth
          ? {
              width: 165,
              height: 53,
              justifyContent: 'center',
              alignSelf: 'flex-start',
              transform: [{ translateX: -30000 }],
            }
          : { width: 280, height: 90, justifyContent: 'center' }
      }
    />
  );
}