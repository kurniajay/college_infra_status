export const statusBadge = (status) => {
  const base = "text-xs font-semibold px-2 py-1 rounded-full";
  const color = status === "AVAILABLE" || status === "OPEN" ? "bg-emerald-100 text-emerald-700"
    : status === "IN_USE" ? "bg-amber-100 text-amber-700"
    : status === "RESERVED" ? "bg-blue-100 text-blue-700"
    : "bg-slate-200 text-slate-700";
  return `${base} ${color}`;
};
