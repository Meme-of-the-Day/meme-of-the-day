import React from 'react';

const UploadIcon: React.FC<{ active?: boolean, className?: string }> = ({ active, className }) => {
  return (
    <svg className={className} width="11" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M.443 0h10l-3.5 7h3.5l-7 13v-8h-3V0zm2 2v8h3v2.66l2-3.66h-3.76l3.52-7h-4.76z" fill={active ? '#2979FF' : '#9696A0'} /></svg>
  )
}

export default UploadIcon;