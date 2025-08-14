import { useLocation, Link } from 'react-router-dom';

export default function Success() {
  const location = useLocation();
  const result = location.state?.result || null;
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Submitted Successfully</h1>
        {/* <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs mt-4">{JSON.stringify(result, null, 2)}</pre> */}
        <div className="mt-6 text-center">
          <Link className="text-blue-600 underline" to="/">Back to Step 1</Link>
        </div>
      </div>
    </div>
  );
}


