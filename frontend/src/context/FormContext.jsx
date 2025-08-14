import { createContext, useContext, useMemo, useState } from 'react';

const FormContext = createContext(null);

export function FormProvider({ children }) {
  const [step1Data, setStep1Data] = useState({});
  const [step2Data, setStep2Data] = useState({});

  const value = useMemo(
    () => ({ step1Data, setStep1Data, step2Data, setStep2Data }),
    [step1Data, step2Data]
  );

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useFormContext() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error('useFormContext must be used within FormProvider');
  return ctx;
}


