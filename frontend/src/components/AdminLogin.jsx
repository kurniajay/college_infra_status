export default function AdminLogin({ loginForm, loginError, onChange, onBack, onSubmit }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-xl font-semibold mb-2">Admin Login</div>
        <p className="text-sm text-slate-500 mb-4">Use your admin credentials to manage infrastructure.</p>
        {loginError && <div className="mb-3 text-sm text-red-600">{loginError}</div>}
        <div className="space-y-3">
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => onChange({ ...loginForm, email: e.target.value })}
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => onChange({ ...loginForm, password: e.target.value })}
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={onBack} className="text-sm text-slate-600">Back to Dashboard</button>
          <button onClick={onSubmit} className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm">Login</button>
        </div>
      </div>
    </div>
  );
}
