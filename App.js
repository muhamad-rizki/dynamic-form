import React, { Component } from 'react';
import { View } from 'react-native'
import useForm from 'react-hook-form'
import DynamicFormProvider from './src/modules/DynamicFormProviders';
import { SingleDynamicForm } from './src/modules/DynamicForm';
import CheckBox from './src/templates/CheckBox';
import DatePicker from './src/templates/DatePicker';
import DefaultContainer from './src/templates/DefaultContainer';
import RadioGroup from './src/templates/RadioGroup';
import TextInput from './src/templates/TextInput';

const FormSchema = require('./src/schemas/example.json');

export default App = (props) => {
  const { register, setValue, handleSubmit, errors } = useForm();
  const onSubmit = data => console.log('asd', data);

  return (
    <View style={{ flex: 1 }}>
      <DynamicFormProvider
        formats={{}}
        templates={{
          CheckBox,
          DatePicker,
          DefaultContainer,
          RadioGroup,
          TextInput,
        }}
      >
        <SingleDynamicForm
          handlers={{}}
          storageKey="FRM001a"
          onSubmit={data => console.log('asd', data)}
          schema={FormSchema}
        />
      </DynamicFormProvider>
    </View>
  );
}