import React from 'react';
import { Child } from '../../types';

interface ChildSelectorProps {
  childrenList: Child[];
  selectedChildId: string | 'all';
  onSelectChild: (childId: string | 'all') => void;
}

export const ChildSelector: React.FC<ChildSelectorProps> = ({
  childrenList,
  selectedChildId,
  onSelectChild,
}) => {
  return (
    <div
      id="child-selector-container"
      className="flex items-center gap-1 p-1 bg-[#89A589]/10 rounded-full border border-[#89A589]/20 shadow-xs max-w-full overflow-x-auto no-scrollbar"
    >
      <button
        id="child-select-all-btn"
        onClick={() => onSelectChild('all')}
        type="button"
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer select-none whitespace-nowrap flex items-center gap-1.5 ${
          selectedChildId === 'all'
            ? 'bg-[#133A34] text-white shadow-sm'
            : 'text-[#133A34]/60 hover:text-[#133A34] hover:bg-[#133A34]/5'
        }`}
      >
        <span>Todos</span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            selectedChildId === 'all' ? 'bg-[#F08A6B]' : 'bg-[#89A589]'
          }`}
        />
      </button>

      {childrenList.map((child) => {
        const isSelected = selectedChildId === child.id;
        const initial = child.name.charAt(0).toUpperCase();

        return (
          <button
            key={child.id}
            id={`child-select-${child.id}-btn`}
            onClick={() => onSelectChild(child.id)}
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer select-none whitespace-nowrap flex items-center gap-1.5 ${
              isSelected
                ? 'bg-[#133A34] text-white shadow-sm'
                : 'text-[#133A34]/60 hover:text-[#133A34] hover:bg-[#133A34]/5'
            }`}
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-[#FFF6EE]"
              style={{
                backgroundColor: child.avatarBgColor || (isSelected ? '#F08A6B' : '#89A589'),
              }}
            >
              {initial}
            </span>
            <span>{child.name}</span>
          </button>
        );
      })}
    </div>
  );
};
