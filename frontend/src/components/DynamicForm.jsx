import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from '../context/FormContext';

export default function DynamicForm({ schema, onSubmit, submitLabel = 'Continue', contextKey, title, description }) {
  const { step1Data, setStep1Data, step2Data, setStep2Data } = useFormContext();
  const [errors, setErrors] = useState({});

  // Bind to context by key; this keeps usage simple across pages
  const boundValue = contextKey === 'step1' ? step1Data : step2Data;
  const setBoundValue = contextKey === 'step1' ? setStep1Data : setStep2Data;

  const fields = useMemo(() => (schema?.fields ?? []), [schema]);

  // Initialize missing fields once schema loads. Only update when needed to avoid loops.
  useEffect(() => {
    if (!schema) return;
    const fieldNames = new Set((schema.fields || []).map((f) => f.name));
    let needsInit = false;
    for (const name of fieldNames) {
      if (!boundValue || !(name in boundValue)) {
        needsInit = true;
        break;
      }
    }
    if (!needsInit) return;
    const init = {};
    for (const f of schema.fields) init[f.name] = '';
    setBoundValue({ ...init, ...(boundValue || {}) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema]);

  function validateField(field, v) {
    const str = String(v ?? '');
    if (field.required && str.trim() === '') return `${field.label} is required`;
    if (field.pattern && str) {
      const re = new RegExp(field.pattern);
      if (!re.test(str)) return `Invalid ${field.label}`;
    }
    if (typeof field.minLength === 'number' && str.length < field.minLength)
      return `${field.label} must be at least ${field.minLength} characters`;
    if (typeof field.maxLength === 'number' && str.length > field.maxLength)
      return `${field.label} must be at most ${field.maxLength} characters`;
    return null;
  }

  function handleChange(name, nextVal, field) {
    const next = { ...(boundValue || {}), [name]: nextVal };
    setBoundValue(next);
    const err = validateField(field, nextVal);
    setErrors((prev) => ({ ...prev, [name]: err || '' }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const currentErrors = {};
    for (const f of fields) {
      const err = validateField(f, boundValue?.[f.name]);
      if (err) currentErrors[f.name] = err;
    }
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length === 0 && onSubmit) onSubmit();
  }

  if (!schema) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(schema.title || title) && (
        <div className="text-center space-y-1">
          {/* <h2 className="text-xl font-semibold text-gray-900">{schema.title || title}</h2> */}
          {(schema.description || description) && (
            <p className="text-sm text-gray-600">{schema.description || description}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-5">
        {fields.map((f) => {
          const fieldError = errors[f.name];
          const valueStr = String(boundValue?.[f.name] ?? '');
          const commonInputClass = `w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            fieldError ? 'border-red-500' : 'border-gray-300'
          }`;

          return (
            <div key={f.name} className="flex flex-col">
              <label htmlFor={f.name} className="mb-1 text-sm font-medium text-gray-800">
                {f.label}
                {f.required && <span className="text-red-600">*</span>}
              </label>

              {f.type === 'select' ? (
                <select
                  id={f.name}
                  className={commonInputClass}
                  value={valueStr}
                  onChange={(e) => handleChange(f.name, e.target.value, f)}
                >
                  <option value="">Select</option>
                  {(f.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={f.name}
                  type={f.type === 'number' ? 'number' : f.type || 'text'}
                  placeholder={f.placeholder}
                  className={commonInputClass}
                  value={valueStr}
                  onChange={(e) => handleChange(f.name, e.target.value, f)}
                />
              )}

              {fieldError && (
                <span className="text-xs text-red-600 mt-1">{fieldError}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center p-4">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 w-full sm:w-auto"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}


