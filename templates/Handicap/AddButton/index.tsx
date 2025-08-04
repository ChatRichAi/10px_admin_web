import React from 'react';

interface AddButtonProps {
  onClick: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        className="w-14 h-14 bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] hover:from-[#0B58D9] hover:to-[#A5D4BA] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        onClick={onClick}
        title="创建图表"
      >
        <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
};

export default AddButton; 