'use client'

import React from 'react'

interface ExpandIconProps {
  isExpanded: boolean
  className?: string
}

const ExpandIcon: React.FC<ExpandIconProps> = ({ isExpanded, className = "w-4 h-4" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {isExpanded ? (
        // 收回状态 - 向上箭头
        <path
          d="M7 14L12 9L17 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        // 展开状态 - 向下箭头
        <path
          d="M7 10L12 15L17 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

export default ExpandIcon

