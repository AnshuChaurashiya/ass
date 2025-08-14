import { useEffect, useState } from 'react';
import axios from 'axios';
import DynamicForm from '../components/DynamicForm';
import Progress from '../components/Progress';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://ass-xyat.onrender.com';

export default function Step2() {
  const [schema, setSchema] = useState(null);
  const { step1Data, step2Data } = useFormContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!step1Data || Object.keys(step1Data).length === 0) navigate('/');
  }, [step1Data, navigate]);

    useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/schema/step2`);
        setSchema(res.data);
      } catch (err) {
        setError('Failed to load step 2 schema');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function onSubmit() {
    try {
      const res = await axios.post(`${API_BASE}/api/submit`, { step1: step1Data, step2: step2Data });
      navigate('/success', { state: { result: res.data } });
    } catch (err) {
      alert('Submission failed.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Udyam Registration</h1>
        <Progress current={2} />
        {loading && <p className="text-center text-gray-600">Loading schema...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && (
          <DynamicForm schema={schema} contextKey="step2" onSubmit={onSubmit} submitLabel="Submit" />
        )}
      </div>
    </div>
  );
}


