export default function BackBar({ onBack, label = "Back", className = "" }) {
  return (
    <div className={["max-w-2xl mx-auto px-4", className].join(" ")}> 
      <button
        className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-2"
        onClick={onBack}
        type="button"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {label}
      </button>
    </div>
  );
}

