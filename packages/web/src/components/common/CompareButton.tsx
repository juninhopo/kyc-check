interface CompareButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const CompareButton = ({ onClick, disabled }: CompareButtonProps) => {
  return (
    <div className="flex justify-center mb-6">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center kyc-compare-btn rounded-md py-2 px-4 text-sm font-medium ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <span
          data-lang-pt="Comparar Faces"
          data-lang-en="Compare Faces"
        >
          Comparar Faces
        </span>
      </button>
    </div>
  );
};