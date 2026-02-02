export default function InfrastructureForm({
  open,
  formData,
  error,
  categories,
  departments,
  types,
  onChange,
  onClose,
  onSubmit
}) {
  if (!open) return null;

  const isEdit = Boolean(formData.id);
  const departmentsForScope = formData.scope === "UG"
    ? departments.filter((dept) => dept.hasUg)
    : formData.scope === "PG"
    ? departments.filter((dept) => dept.hasPg)
    : [];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{isEdit ? "Edit" : "Add"} Infrastructure</h3>
          <button onClick={onClose} className="text-sm text-slate-600 hover:text-slate-800">Close</button>
        </div>

        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Infrastructure name"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={formData.type}
                onChange={(e) => onChange({ ...formData, type: e.target.value })}
              >
                {types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Scope</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={formData.scope}
                onChange={(e) => {
                  const newScope = e.target.value;
                  const updates = { scope: newScope };
                  if (newScope === "GENERAL") {
                    updates.category = categories[0];
                    updates.department = null;
                  } else {
                    updates.category = null;
                    const depts = newScope === "UG" 
                      ? departments.filter((d) => d.hasUg)
                      : departments.filter((d) => d.hasPg);
                    updates.department = depts[0]?.id || null;
                  }
                  onChange({ ...formData, ...updates });
                }}
              >
                <option value="GENERAL">GENERAL</option>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
              </select>
            </div>
          </div>

          {formData.scope === "GENERAL" ? (
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={formData.category}
                onChange={(e) => onChange({ ...formData, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={formData.department || ""}
                onChange={(e) => onChange({ ...formData, department: e.target.value })}
              >
                {departmentsForScope.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={formData.status}
                onChange={(e) => onChange({ ...formData, status: e.target.value })}
              >
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
                <option value="RESERVED">RESERVED</option>
                <option value="IN_USE">IN_USE</option>
                <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
              </select>
            </div>

            <div className="flex items-center pt-7">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.bookable}
                  onChange={(e) => onChange({ ...formData, bookable: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Bookable</span>
              </label>
            </div>
          </div>

          {formData.bookable && ["RESERVED", "IN_USE"].includes(formData.status) && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Used By</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="User or department name"
                  value={formData.used_by}
                  onChange={(e) => onChange({ ...formData, used_by: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">From Time</label>
                  <input
                    type="time"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.from_time}
                    onChange={(e) => onChange({ ...formData, from_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To Time</label>
                  <input
                    type="time"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.to_time}
                    onChange={(e) => onChange({ ...formData, to_time: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {!formData.bookable && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Open Time</label>
                <input
                  type="time"
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.open_time}
                  onChange={(e) => onChange({ ...formData, open_time: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Close Time</label>
                <input
                  type="time"
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.close_time}
                  onChange={(e) => onChange({ ...formData, close_time: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900"
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
