import React from 'react';

const SingleDynamicFormContext = React.createContext({
  storageKey: {},
  schema: {},
  handlers: {},
  onSubmit: {},
  setSchema: () => { },
  setStorageKey: () => { },
  setHandlers: () => { },
});

export default SingleDynamicFormContext;
