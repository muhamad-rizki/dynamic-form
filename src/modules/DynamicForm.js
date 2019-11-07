'use-strict';

import isEqual from 'react-fast-compare';
import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import jsonpath from 'jsonpath';
import useForm from 'react-hook-form';

import DynamicFormContext from './contexts/DynamicFormContext';

interface HeaderFooterProps {
  values: Object,
  errors: Object,
  formState: Object,
  actions: {
    submit: () => void,
    reset: () => void,
  }
}

interface WizardHeaderFooterProps {
  wizardState: {
    totalStep: Number,
    step: Number,
    stepKey: String,
    title: String,
  },
  actions: {
    nextStep: () => void,
    previousStep: () => void,
  }
}

interface SingleDynamicFormProps {
  storageKey: String,
  handlers: Array<Function>,
  schema: Object,
  initialValue: Object,
  onSubmit: (data: Object) => void,
  scrollViewRef: () => ScrollView | FlatList,
  renderFooter: (props: HeaderFooterProps) => React.Component,
  renderHeader: (props: HeaderFooterProps) => React.Component,
  renderStickyFooter: (props: HeaderFooterProps) => React.Component,
  renderStickyHeader: (props: HeaderFooterProps) => React.Component,
}

let IS_SCROLLED = true;

let LAST_SCHEMA = {};

let LAST_PROPS_SCHEMA = {};

const itemHeights = {};

const FieldRenderer = (props) => {
  const {
    item: Field,
    index,
    fieldKeys,
    componentProps,
    register,
    formats,
    storageKey,
    getValues,
    setValue,
    errors,
    unregister,
    messages,
    getSchema,
    setSchema,
    parentSchema,
    setParentSchema,
    setParentValue,
    handlers,
    formInitialValues,
  } = props;
  const key = fieldKeys[index].replace(/(\.?)type$|^\$\.|properties./g, '');
  if (key === '') {
    return <View />;
  }
  const prop = componentProps[index];
  delete prop.properties;
  if (prop.type !== 'object') {
    useEffect(() => {
      register({ name: key },
        {
          ...(
            (prop.isRequired && (!prop.config || !prop.config.isHidden))
              ? { required: messages.required ? messages.required : 'This field is required' }
              : {}
          ),
          ...(
            prop.minLength
              ? { minLength: { value: prop.minLength, message: messages.minLength ? messages.minLength(prop.minLength) : `Minimum length is ${prop.minLength} character(s)` } }
              : {}
          ),
          ...(
            prop.maxLength
              ? { maxLength: { value: prop.maxLength, message: messages.maxLength ? messages.maxLength(prop.maxLength) : `Maximum length is ${prop.maxLength} character(s)` } }
              : {}
          ),
          ...(
            prop.format && formats[prop.format]
              ? { pattern: { value: formats[prop.format], message: messages[prop.format] ? messages[prop.format] : 'Invalid value format' } }
              : {}
          ),
        });
      if (formInitialValues && formInitialValues[key]) setValue(key, formInitialValues[key], true);
      return () => {
        unregister(key);
      };
    }, [key]);
  }
  const isHidden = prop.config && prop.config.isHidden;
  if (isHidden) {
    return <View />;
  }
  return (
    <View
      onLayout={(e) => {
        itemHeights[key] = e.nativeEvent.layout.height;
      }}
      key={index.toString()}
      style={{ flexGrow: 1 }}
    >
      <Field
        handlers={jsonpath.value(handlers, key)}
        config={{
          accessibilityLabel: `${storageKey.toLowerCase()}_${key.toLowerCase().replace('.', '_')}`,
        }}
        value={getValues()[key]}
        onChange={(val) => {
          setValue(key, val, true);
          // triggerValidation({ name: key, value: val });
        }}
        hasError={errors[key]}
        error={errors[key] && errors[key].message}
        label={prop.title}
        schema={prop}
        options={prop.enum && prop.enum.map((en) => ({ value: en, text: en }))}
        dynamicForm={{
          setValue,
          getSingleSchema: getSchema,
          setSingleSchemaAt: setSchema,
          getParentSchema: parentSchema,
          setParentSchema,
          setCrossValue: setParentValue,
        }}
        {...prop}
      />
    </View>
  );
};

// const FieldRenderer = React.memo(Field);

export const SingleDynamicForm = (props: SingleDynamicFormProps) => {
  const {
    storageKey,
    handlers,
    onSubmit,
    schema: PropsSchema,
    initialValue,
    scrollViewRef,
    renderFooter,
    renderHeader,
    renderStickyFooter,
    renderStickyHeader,
    parentSchema,
    setParentSchema,
    setParentValue,
  } = props;

  // global dynamic form context
  const context = useContext(DynamicFormContext);
  const {
    templates,
    formats,
    messages,
    formValues,
  } = context;

  const formInitialValues = {
    ...formValues[storageKey],
    ...initialValue,
  };

  // react-hook-form context
  const {
    register,
    unregister,
    setValue,
    errors,
    getValues,
    formState,
    handleSubmit,
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: formInitialValues,
  });

  const [schema, setSchema] = useState(JSON.parse(JSON.stringify(PropsSchema)));
  const scrollToComponent = useRef();

  useEffect(() => {
    LAST_PROPS_SCHEMA = PropsSchema;
  }, []);

  useEffect(() => {
    LAST_PROPS_SCHEMA = JSON.parse(JSON.stringify(PropsSchema));
    setSchema(LAST_PROPS_SCHEMA);
  }, [isEqual(LAST_PROPS_SCHEMA, PropsSchema)]);

  const isEqualSchema = () => {
    const same = isEqual(LAST_SCHEMA, schema);
    if (!same) {
      LAST_SCHEMA = JSON.parse(JSON.stringify(schema));
    }
    return same;
  };

  const fieldKeys = jsonpath.paths(schema, '$..type').map((p) => jsonpath.stringify(p)).filter((p) => p.indexOf('.events.') < 0);

  const componentEqualityFn = (prev, next) => isEqual(prev.value, next.value)
    && isEqual(prev.error, next.error)
    && isEqual(prev.schema, next.schema);

  const fields = useMemo(() => fieldKeys.map((key) => {
    const type = jsonpath.value(schema, key);
    const customTemplate = jsonpath.value(schema, key.replace(/type$/, 'customTemplate'));
    switch (type) {
      case 'object':
        if (!customTemplate || !templates[customTemplate]) {
          return View;
        }
        return React.memo(templates[customTemplate], componentEqualityFn);
      default:
        if (!customTemplate || !templates[customTemplate]) {
          return TextInput;
        }
        return React.memo(templates[customTemplate], componentEqualityFn);
    }
  }), [isEqualSchema()]);

  const componentProps = fieldKeys.map((key) => JSON.parse(JSON.stringify(jsonpath.value(schema, key.replace(/\.type$/, '')))));

  const ScrollTo = (offset) => {
    if (scrollViewRef && scrollViewRef()) {
      if (scrollViewRef().scrollTo) {
        scrollViewRef().scrollTo({ y: offset, animated: true });
      } else if (scrollViewRef().scrollToOffset) {
        scrollViewRef().scrollToOffset({ offset, animated: true });
      } else {
        throw new Error('Invalid scrollViewRef props');
      }
    } else {
      scrollToComponent.current.scrollToOffset({ offset });
    }
  };

  useEffect(() => {
    if (IS_SCROLLED === false) {
      let offset = 0;
      for (let i = 0; i < fieldKeys.length; i += 1) {
        const fieldKey = fieldKeys[i].replace(/(\.?)type$|^\$\.|properties./g, '');
        if (fieldKey !== '' && errors[fieldKey]) {
          ScrollTo(offset);
          IS_SCROLLED = true;
          break;
        }
        offset += itemHeights[fieldKey] || 0;
      }
    }
  }, [errors]);

  const onSubmitForm = handleSubmit(() => {
    onSubmit(getValues(true));
    fields.forEach((field, index) => {
      const key = fieldKeys[index].replace(/(\.?)type$|^\$\.|properties./g, '');
      unregister(key);
      // console.log('asdasd unregistered', key)
    });
    reset({});
  });

  useEffect(() => {
    ScrollTo(0);
    // if (formInitialValues) {
    //   Object.keys(formInitialValues).forEach((key) => {
    //     setValue(key, formInitialValues[key]);
    //   });
    // }
  }, [formState.isSubmitted]);

  console.log('asdaasd', getValues(true))

  const keyExtractor = (item, index) => index.toString();

  const btnSubmitPressed = () => {
    IS_SCROLLED = false;
    onSubmitForm();
  };

  const actions = {
    submit: btnSubmitPressed,
    reset,
  };

  return (
    <View style={{ flex: 1 }}>
      {
        renderStickyHeader && renderStickyHeader({
          errors: () => errors,
          values: {
            asObject: () => getValues(true),
            asArray: () => getValues(),
          },
          formState,
          actions,
        })
      }
      <FlatList
        data={fields}
        ref={scrollToComponent}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={(fieldProps) => (
          <FieldRenderer
            {...fieldProps}
            handlers={handlers}
            parentSchema={parentSchema}
            setParentSchema={setParentSchema}
            fieldKeys={fieldKeys}
            componentProps={componentProps}
            register={register}
            unregister={unregister}
            formats={formats}
            storageKey={storageKey}
            getValues={getValues}
            setValue={setValue}
            errors={errors}
            messages={messages}
            getSchema={() => JSON.parse(JSON.stringify(schema))}
            setSchema={setSchema}
            setParentValue={setParentValue}
            formInitialValues={formInitialValues}
          />
        )}
        ListFooterComponent={renderFooter
          && renderFooter({
            errors: () => errors,
            values: {
              asObject: () => getValues(true),
              asArray: () => getValues(),
            },
            formState,
            actions,
          })}
        // stickyHeaderIndices={[0]}
        ListHeaderComponent={renderHeader
          && renderHeader({
            errors: () => errors,
            values: {
              asObject: () => getValues(true),
              asArray: () => getValues(),
            },
            formState,
            actions,
          })}
      />
      {
        renderStickyFooter && renderStickyFooter({
          errors: () => errors,
          values: {
            asObject: () => getValues(true),
            asArray: () => getValues(),
          },
          formState,
          actions,
        })
      }
    </View>
  );
};

interface WizardDynamicFormProps {
  storageKey: String,
  handlers: Array<Function>,
  schema: Object,
  initialValue: Object,
  initialStep: Number,
  onSubmit: (data: Object) => void,
  scrollViewRef: () => ScrollView | FlatList,
  renderFooter: (props: HeaderFooterProps) => React.Component,
  renderHeader: (props: HeaderFooterProps) => React.Component,
  renderStickyFooter: (props: HeaderFooterProps) => React.Component,
  renderStickyHeader: (props: HeaderFooterProps) => React.Component,
  renderWizardHeader: (props: WizardHeaderFooterProps) => React.Component,
  renderWizardFooter: (props: WizardHeaderFooterProps) => React.Component,
}

let LAST_WIZARD_PROPS_SCHEMA = {};

export const WizardDynamicForm = (props: WizardDynamicFormProps) => {
  const {
    schema: WizardSchema,
    renderFooter,
    renderHeader,
    renderStickyFooter,
    renderStickyHeader,
    onSubmit,
    handlers,
    initialStep,
    initialValue,
  } = props;

  const [schema, setSchema] = useState(JSON.parse(JSON.stringify(WizardSchema)))

  useEffect(() => {
    LAST_WIZARD_PROPS_SCHEMA = schema;
  }, []);

  useEffect(() => {
    LAST_WIZARD_PROPS_SCHEMA = schema;
    setSchema(JSON.parse(JSON.stringify(WizardSchema)));
  }, [isEqual(LAST_WIZARD_PROPS_SCHEMA, WizardSchema)])

  const context = useContext(DynamicFormContext);

  const schemas = Object.keys(schema.properties).filter((k) => !WizardSchema.properties[k].config
    || !schema.properties[k].config.isHidden);

  const [step, setStep] = useState(initialStep || 0);

  const [values, setValues] = useState({});

  const isLastStep = step === (schemas.length - 1);

  const isFirstStep = step === 0;

  const WizardProps = {
    wizardState: {
      totalStep: schemas.length,
      step,
      stepKey: schemas[step],
      title: schema.properties[schemas[step]].title || schema.properties[schemas[step]].label,
    },
    actions: {
      previousStep: () => (isFirstStep ? {} : setStep(step - 1)),
    },
  };

  return (
    <SingleDynamicForm
      handlers={handlers}
      parentSchema={() => JSON.parse(JSON.stringify(schema))}
      setParentSchema={s => setSchema(s)}
      setParentValue={(v) => setValues(v)}
      schema={JSON.parse(JSON.stringify(schema.properties[schemas[step]]))}
      storageKey={schemas[step]}
      initialValue={initialValue && initialValue[schemas[step]]}
      renderFooter={renderFooter
        ? (xProps) => renderFooter({
          ...xProps,
          ...WizardProps,
          actions: { ...xProps.actions, ...WizardProps.actions },
        })
        : undefined}
      renderHeader={renderHeader
        ? (xProps) => renderHeader({
          ...xProps,
          ...WizardProps,
          actions: { ...xProps.actions, ...WizardProps.actions },
        })
        : undefined}
      renderStickyFooter={renderStickyFooter
        ? (xProps) => renderStickyFooter({
          ...xProps,
          ...WizardProps,
          actions: { ...xProps.actions, ...WizardProps.actions },
        })
        : undefined}
      renderStickyHeader={renderStickyHeader
        ? (xProps) => renderStickyHeader({
          ...xProps,
          ...WizardProps,
          actions: { ...xProps.actions, ...WizardProps.actions },
        })
        : undefined}
      onSubmit={(val) => {
        values[schemas[step]] = val;
        if (isLastStep) {
          onSubmit(values);
        } else {
          setValues({ ...values });
          setStep(step + 1);
        }
      }}
    />
  );
};
