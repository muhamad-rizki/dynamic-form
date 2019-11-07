import React from 'react';

const DynamicFormContext = React.createContext({
  formats: {},
  templates: {},
  formValues: {},
  formErrors: {},
  messages: {},
  setFormValues: () => { },
  setFormErrors: () => { },
});

export default DynamicFormContext;
