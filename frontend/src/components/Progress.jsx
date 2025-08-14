import { useLocation } from 'react-router-dom';

export default function Progress({ current }) {
  const location = useLocation();

  const steps = [
    { id: 1, label: 'Step 1: Aadhaar' },
    { id: 2, label: 'Step 2: PAN' },
  ];

  function deriveCurrent() {
    if (typeof current === 'number' && current > 0) return current;
    const path = location.pathname;
    if (path === '/' || path === '/step-1') return 1;
    if (path === '/step-2' || path === '/success') return 2;
    return 1;
  }

  const activeStep = deriveCurrent();

  return (
    <div className="my-6">
      <ol className="flex items-center justify-center gap-6">
        {steps.map((s, idx) => {
          const isComplete = activeStep > s.id;
          const isActive = activeStep === s.id;
          return (
            <li key={s.id} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border ${
                  isActive || isComplete
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                {s.id}
              </div>
              <span className={`text-sm ${isActive || isComplete ? 'text-blue-700' : 'text-gray-600'}`}>
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <span
                  className={`hidden sm:block h-px w-10 mx-2 ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}


