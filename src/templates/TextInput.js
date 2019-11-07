import React from 'react';
import { Text, View, TextInput } from 'react-native';

export default function TextInputComponent(locals) {
  return (
    <View
      style={{
        marginBottom: locals.help && locals.help.trim() !== '' ? 35 : 30,
      }}
    >
      <View>
        <Text style={[{ fontSize: 10, color: '#0088AB' }]}>
          {locals.config.subLabel}
        </Text>

        <View style={{ flexDirection: 'row' }}>
          <Text style={[{ fontSize: 12, color: '#000000' }]}>
            {locals.label}
          </Text>
          {
            !locals.isRequired
              ? (
                <Text style={[{
                  fontSize: 10,
                  color: '#BDBDBD',
                  alignSelf: 'center',
                }]}
                >
                  {locals.config.subOptional ? ' - optional' : locals.config.subOptional}
                </Text>
              ) : null
          }
        </View>

        {
          locals.config.format === 'email'
            ? (
              <TextInput
                accessibilityLabel={locals.config.accessibilityLabel}
                maxLength={locals.maxLength}
                underlineColorAndroid="transparent"
                style={{
                  borderColor: '#000000',
                  borderBottomWidth: 2,
                  backgroundColor: locals.hasError ? '#F9C9C9' : '#FFFFFF',
                }}
                keyboardType="email-address"
                value={locals.value ? locals.value.toLowerCase() : locals.value}
                editable={locals.editable}
                onBlur={locals.onBlur}
                onChange={
                  (val) => {
                    if (locals.onChange !== undefined) {
                      locals.onChange(val.nativeEvent.text.toLowerCase());
                    }
                    if (locals.onChangeNative !== undefined) {
                      locals.onChangeNative(val);
                    }
                  }
}
              />
            )
            : (
              <TextInput
                accessibilityLabel={locals.config.accessibilityLabel}
                maxLength={locals.maxLength}
                underlineColorAndroid="transparent"
                style={{
                  borderColor: '#000000',
                  borderBottomWidth: 2,
                  backgroundColor: locals.hasError ? '#F9C9C9' : '#FFFFFF',
                }}
                value={locals.value}
                editable={locals.editable}
                onBlur={locals.onBlur}
                onChange={
                  (val) => {
                    if (locals.onChange
                      !== undefined) locals.onChange(val.nativeEvent.text);
                  }
}
              />
            )
        }
        <View>
          {
            locals.help
              ? (
                <Text style={[{ fontSize: 10, color: '#000000' }]}>{locals.help}</Text>
              ) : null
          }
        </View>
        <View>
          {
            locals.error
              ? (
                <Text style={[{ fontSize: 10, color: '#c00' }]}>{locals.error}</Text>
              ) : null
          }
        </View>
      </View>
    </View>
  );
}
