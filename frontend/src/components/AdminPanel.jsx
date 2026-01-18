export default function AdminPanel({
  open,
  admin,
  admins,
  departments,
  adminForm,
  adminFormError,
  onClose,
  onCreateAdmin,
  onChangeAdminForm
}) {
  if (!open || admin?.role !== "super") return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Manage Admins</h3>
          <button onClick={onClose} className="text-sm text-slate-600">Close</button>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Create New Admin</h4>
          {adminFormError && <div className="text-sm text-red-600 mb-2">{adminFormError}</div>}
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Email"
              value={adminForm.email}
              onChange={(e) => onChangeAdminForm({ ...adminForm, email: e.target.value })}
            />
            <input
              className="border rounded-lg px-3 py-2"
              type="password"
              placeholder="Password"
              value={adminForm.password}
              onChange={(e) => onChangeAdminForm({ ...adminForm, password: e.target.value })}
            />
            <select
              className="border rounded-lg px-3 py-2"
              value={adminForm.role}
              onChange={(e) => {
                const role = e.target.value;
                const nextScope = role === "general" ? "GENERAL" : role === "dept" ? "UG" : "GENERAL";
                onChangeAdminForm({ ...adminForm, role, scope: nextScope });
              }}
            >
              <option value="general">General Admin</option>
              <option value="dept">Department Admin</option>
              <option value="super">Super Admin</option>
            </select>
            <select
              className="border rounded-lg px-3 py-2"
              value={adminForm.scope}
              onChange={(e) => onChangeAdminForm({ ...adminForm, scope: e.target.value })}
              disabled={adminForm.role === "general"}
            >
              <option value="GENERAL">GENERAL</option>
              <option value="UG">UG</option>
              <option value="PG">PG</option>
            </select>
            {adminForm.role === "dept" && (
              <select
                className="border rounded-lg px-3 py-2 sm:col-span-2"
                value={adminForm.department}
                onChange={(e) => onChangeAdminForm({ ...adminForm, department: e.target.value })}
              >
                {departments.filter((dept) => (adminForm.scope === "PG" ? dept.hasPg : dept.hasUg)).map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            )}
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={onCreateAdmin} className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm">Create Admin</button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Existing Admins</h4>
          <div className="max-h-64 overflow-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-3 py-2">Email</th>
                  <th className="text-left px-3 py-2">Role</th>
                  <th className="text-left px-3 py-2">Scope</th>
                  <th className="text-left px-3 py-2">Department</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-3 py-2">{item.email}</td>
                    <td className="px-3 py-2">{item.role}</td>
                    <td className="px-3 py-2">{item.scope}</td>
                    <td className="px-3 py-2">{item.department || "-"}</td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-slate-500" colSpan="4">No admins found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
