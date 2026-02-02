import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, DEPARTMENTS, SCOPES, TYPES } from "./constants/infrastructure.js";
import { getApiBase } from "./utils/api.js";
import { statusBadge } from "./utils/status.js";
import AdminLogin from "./components/AdminLogin.jsx";
import AppHeader from "./components/AppHeader.jsx";
import ScopeTabs from "./components/ScopeTabs.jsx";
import ScopeFilters from "./components/ScopeFilters.jsx";
import InfrastructureGrid from "./components/InfrastructureGrid.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import InfrastructureForm from "./components/InfrastructureForm.jsx";

export default function App() {
  const [scope, setScope] = useState("GENERAL");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [department, setDepartment] = useState(DEPARTMENTS[0].id);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState("");
  const [loginView, setLoginView] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
    role: "general",
    scope: "GENERAL",
    department: DEPARTMENTS[0].id
  });
  const [adminFormError, setAdminFormError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: TYPES[0],
    scope: "GENERAL",
    category: CATEGORIES[0],
    department: DEPARTMENTS[0].id,
    bookable: false,
    status: "OPEN",
    used_by: "",
    from_time: "",
    to_time: "",
    open_time: "08:00",
    close_time: "18:00"
  });

  const apiBase = useMemo(() => getApiBase(), []);

  const departmentsForScope = useMemo(() => {
    if (scope === "UG") return DEPARTMENTS.filter((dept) => dept.hasUg);
    if (scope === "PG") return DEPARTMENTS.filter((dept) => dept.hasPg);
    return [];
  }, [scope]);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("scope", scope);
      if (scope === "GENERAL") params.set("category", category);
      if (scope !== "GENERAL") params.set("department", department);
      const res = await fetch(`${apiBase}/api/public/infrastructure?${params.toString()}`);
      const json = await res.json();
      setItems(json.data || []);
    } catch (err) {
      setError("Failed to load infrastructure data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${apiBase}/api/admin/admins`, { credentials: "include" });
      if (!res.ok) return;
      const json = await res.json();
      setAdmins(json.data || []);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (scope !== "GENERAL" && !departmentsForScope.find((dept) => dept.id === department)) {
      setDepartment(departmentsForScope[0]?.id || "");
      return;
    }
    fetchItems();
  }, [scope, category, department, departmentsForScope]);

  useEffect(() => {
    if (admin?.role === "super") {
      fetchAdmins();
    }
  }, [admin]);

  const openAddForm = () => {
    setFormData({
      name: "",
        type: TYPES[0],
      scope,
      category: CATEGORIES[0],
      department: DEPARTMENTS[0].id,
      bookable: false,
      status: "OPEN",
      used_by: "",
      from_time: "",
      to_time: "",
      open_time: "08:00",
      close_time: "18:00"
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      type: item.type || TYPES[0],
      scope: item.scope,
      category: item.category || CATEGORIES[0],
      department: item.department || DEPARTMENTS[0].id,
      bookable: Boolean(item.bookable),
      status: item.status,
      used_by: item.used_by || "",
      from_time: item.from_time || "",
      to_time: item.to_time || "",
      open_time: item.open_time || "08:00",
      close_time: item.close_time || "18:00"
    });
    setFormOpen(true);
  };

  const submitForm = async () => {
    setError("");
    const isEdit = Boolean(formData.id);
    const url = isEdit ? `${apiBase}/api/admin/infrastructure/${formData.id}` : `${apiBase}/api/admin/infrastructure`;
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData)
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Failed to save infrastructure");
      return;
    }
    setFormOpen(false);
    fetchItems();
  };

  const removeItem = async (id) => {
    if (!window.confirm("Delete this infrastructure item?")) return;
    const res = await fetch(`${apiBase}/api/admin/infrastructure/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (!res.ok) {
      setError("Failed to delete infrastructure");
      return;
    }
    fetchItems();
  };

  const handleLogin = async () => {
    setLoginError("");
    const res = await fetch(`${apiBase}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(loginForm)
    });
    if (!res.ok) {
      setLoginError("Invalid credentials");
      return;
    }
    const json = await res.json();
    setAdmin(json);
    setLoginView(false);
  };

  const handleLogout = async () => {
    await fetch(`${apiBase}/api/admin/logout`, { method: "POST", credentials: "include" });
    setAdmin(null);
    setAdmins([]);
  };

  const createAdmin = async () => {
    setAdminFormError("");
    const payload = {
      email: adminForm.email,
      password: adminForm.password,
      role: adminForm.role,
      scope: adminForm.scope,
      department: adminForm.role === "dept" ? adminForm.department : undefined
    };
    const res = await fetch(`${apiBase}/api/admin/admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setAdminFormError(json.error || "Failed to create admin");
      return;
    }
    setAdminForm({
      email: "",
      password: "",
      role: "general",
      scope: "GENERAL",
      department: DEPARTMENTS[0].id
    });
    fetchAdmins();
  };

  if (loginView && !admin) {
    return (
      <AdminLogin
        loginForm={loginForm}
        loginError={loginError}
        onChange={setLoginForm}
        onBack={() => setLoginView(false)}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <AppHeader
        admin={admin}
        onLoginClick={() => setLoginView(true)}
        onLogout={handleLogout}
        onOpenAdminPanel={() => setAdminPanelOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <ScopeTabs scopes={SCOPES} scope={scope} onChange={setScope} />

          <div className="mt-4">
            <ScopeFilters
              scope={scope}
              categories={CATEGORIES}
              category={category}
              onCategoryChange={setCategory}
              departments={departmentsForScope}
              department={department}
              onDepartmentChange={setDepartment}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Infrastructure</h2>
          {admin && (
            <button onClick={openAddForm} className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm">Add Infrastructure</button>
          )}
        </div>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
        {loading && <div className="mt-4 text-sm text-slate-500">Loading...</div>}

        {!loading && items.length === 0 && (
          <div className="mt-6 text-slate-500">No infrastructure found for this selection.</div>
        )}

        <InfrastructureGrid
          items={items}
          admin={admin}
          onEdit={openEditForm}
          onDelete={removeItem}
          getStatusBadgeClass={statusBadge}
        />
      </main>

      <InfrastructureForm
        open={formOpen}
        formData={formData}
        error={error}
        categories={CATEGORIES}
        departments={DEPARTMENTS}
        types={TYPES}
        onChange={setFormData}
        onClose={() => setFormOpen(false)}
        onSubmit={submitForm}
      />

      <AdminPanel
        open={adminPanelOpen}
        admin={admin}
        admins={admins}
        departments={DEPARTMENTS}
        adminForm={adminForm}
        adminFormError={adminFormError}
        onClose={() => setAdminPanelOpen(false)}
        onCreateAdmin={createAdmin}
        onChangeAdminForm={setAdminForm}
      />
    </div>
  );
}
