import React from 'react';
import { Text, View } from 'react-native';
import { isEmpty } from '../modules/helpers';

export default function DefaultContainer(locals) {
  return (
    <View style={{ flex: 1 }}>
      {
        isEmpty(locals.title) ? undefined
          : (
            <Text style={[{ fontSize: 18, color: '#0088AB' }]}>
              {locals.title}
            </Text>
          )
      }
    </View>
  );
}
