export default function InfrastructureGrid({ items, admin, onEdit, onDelete, getStatusBadgeClass }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">{item.name}</h3>
            <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
          </div>
          {item.type && (
            <div className="text-xs text-slate-500">Type: {item.type}</div>
          )}
          {item.bookable ? (
            <>
              {["RESERVED", "IN_USE"].includes(item.status) && (
                <div className="text-sm text-slate-600">
                  Used by: {item.used_by || "-"}
                  <br />
                  {item.from_time && item.to_time ? `${item.from_time} - ${item.to_time}` : ""}
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-slate-600">
              Open: {item.open_time || "-"} | Close: {item.close_time || "-"}
            </div>
          )}
          {admin && (
            <div className="flex gap-2 mt-auto">
              <button onClick={() => onEdit(item)} className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700">Edit</button>
              <button onClick={() => onDelete(item.id)} className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700">Delete</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
