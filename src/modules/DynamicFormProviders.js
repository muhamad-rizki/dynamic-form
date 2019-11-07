import React, { useState } from 'react';
import DynamicFormContext from './contexts/DynamicFormContext';

interface DynamicFormProviderProps {
  children: React.ReactChildren,
  formats: Object,
  templates: Object,
  messages: Object,
}

const DynamicFormProvider = (props: DynamicFormProviderProps) => {
  const {
    children,
    formats,
    templates,
    messages,
  } = props;
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  return (
    <DynamicFormContext.Provider
      value={{
        formats,
        templates,
        formValues,
        formErrors,
        setFormValues,
        setFormErrors,
        messages,
      }}
    >
      {children}
    </DynamicFormContext.Provider>
  );
};

export default DynamicFormProvider;
