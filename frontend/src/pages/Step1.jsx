import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DynamicForm from '../components/DynamicForm';
import Progress from '../components/Progress';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://ass-xyat.onrender.com';

export default function Step1() {
  const [schema, setSchema] = useState(null);
  const { step1Data } = useFormContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/schema/step1`);
        setSchema(res.data);
      } catch (err) {
        setError('Failed to load step 1 schema');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const basicSchema = useMemo(() => {
    if (!schema) return null;
    const wanted = new Set(['nameOnAadhaar', 'aadhaarNumber', 'mobileNumber']);
    return { ...schema, fields: schema.fields.filter((f) => wanted.has(f.name)) };
  }, [schema]);

  const otpSchema = useMemo(() => {
    if (!schema) return null;
    const otpField = schema.fields.find((f) => f.name === 'otp');
    return {
      title: 'OTP',
      description: 'We sent a 6-digit code to your mobile number',
      fields: otpField ? [otpField] : [],
    };
  }, [schema]);

  async function handleSendOtp() {
    try {
      // Validate initial fields (name, aadhaar number, mobile)
      const payload = {
        nameOnAadhaar: step1Data?.nameOnAadhaar,
        aadhaarNumber: step1Data?.aadhaarNumber,
        mobileNumber: step1Data?.mobileNumber,
      };
      await axios.post(`${API_BASE}/api/validate/step1`, payload);
      setShowOtp(true);
    } catch (err) {
      alert('Please fill valid Name, Aadhaar and Mobile first.');
    }
  }

  async function handleVerifyAndContinue() {
    try {
      const otp = String(step1Data?.otp || '');
      if (!/^\d{6}$/.test(otp)) {
        alert('Please enter a valid 6-digit OTP.');
        return;
      }
      // Final validation (includes OTP)
      await axios.post(`${API_BASE}/api/validate/step1`, step1Data);
      navigate('/step-2');
    } catch (err) {
      alert('OTP verification failed.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6 sm:p-0 overflow-hidden">
        <h1 className="text-2xl font-bold text-white p-2  bg-blue-700 text-center">Udyam Registration</h1>
        <Progress current={1} />
        {loading && <p className="text-center text-gray-600">Loading schema...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="space-y-6">
            {!showOtp && (
              <DynamicForm
                schema={basicSchema}
                contextKey="step1"
                onSubmit={handleSendOtp}
                submitLabel="Generate OTP"
              />
            )}

            {showOtp && (
              <div className="space-y-3">
                <DynamicForm
                  schema={otpSchema}
                  contextKey="step1"
                  onSubmit={handleVerifyAndContinue}
                  submitLabel="Verify OTP & Continue"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-sm text-blue-600 underline"
                >
                  Resend OTP
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


