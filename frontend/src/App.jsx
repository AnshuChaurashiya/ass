import { Routes, Route, Navigate } from 'react-router-dom';
import Step1 from './pages/Step1';
import Step2 from './pages/Step2';
import Success from './pages/Success';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Step1 />} />
      <Route path="/step-2" element={<Step2 />} />
      <Route path="/success" element={<Success />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


