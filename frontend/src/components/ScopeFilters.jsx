export default function ScopeFilters({
  scope,
  categories,
  category,
  onCategoryChange,
  departments,
  department,
  onDepartmentChange
}) {
  if (scope === "GENERAL") {
    return (
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1 rounded-full text-sm ${category === cat ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {departments.map((dept) => (
        <button
          key={dept.id}
          className={`px-3 py-1 rounded-full text-sm ${department === dept.id ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}
          onClick={() => onDepartmentChange(dept.id)}
        >
          {dept.label}
        </button>
      ))}
    </div>
  );
}
