export default function ScopeTabs({ scopes, scope, onChange }) {
  const scopeIndex = scopes.indexOf(scope);
  const indicatorStyle = { transform: `translateX(${scopeIndex * 100}%)` };

  return (
    <div className="relative bg-slate-100 rounded-full p-1 flex items-center">
      <div
        className="absolute top-1 left-1 h-[calc(100%-8px)] w-1/3 bg-white rounded-full shadow transition-transform duration-200"
        style={indicatorStyle}
      />
      {scopes.map((item) => (
        <button
          key={item}
          className={`relative z-10 flex-1 py-2 text-sm font-medium ${scope === item ? "text-slate-900" : "text-slate-500"}`}
          onClick={() => onChange(item)}
        >
          {item === "GENERAL" ? "General Facilities" : item}
        </button>
      ))}
    </div>
  );
}
