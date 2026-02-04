export default function AppHeader({ admin, onLoginClick, onLogout, onOpenAdminPanel }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-semibold">College Infrastructure Dashboard</div>
        <div className="flex items-center gap-3">
          {admin ? (
            <>
              <span className="text-sm bg-slate-100 px-3 py-1 rounded-full">{admin.email}</span>
              {admin.role === "super" && (
                <button
                  onClick={onOpenAdminPanel}
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Manage Admins
                </button>
              )}
              <button onClick={onLogout} className="text-sm text-slate-600 hover:text-slate-900">Logout</button>
            </>
          ) : (
            <button onClick={onLoginClick} className="text-sm text-slate-600 hover:text-slate-900">
              Admin Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
