export default function Modal({ open, onClose, title, children, footer }){
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[90vw] max-w-lg mx-auto">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">{title}</div>
        </div>
        <div className="p-4 space-y-3">
          {children}
        </div>
        <div className="p-4 border-t flex items-center justify-end gap-2">
          {footer}
        </div>
      </div>
    </div>
  );
}

