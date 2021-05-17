import React from 'react';

const MyMemesIcon: React.FC<{ active?: boolean, className?: string }> = ({ active, className }) => {
  return (
    <svg className={className} width="14" height="15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.95 7.74c.906 0 1.634-1.097 1.634-2.447s-.728-2.445-1.633-2.445-1.64 1.095-1.64 2.445c0 1.35.735 2.446 1.64 2.446zm-4.917-.98c1.088 0 1.96-1.31 1.96-2.934S6.121.891 5.033.891c-1.089 0-1.967 1.311-1.967 2.935s.878 2.935 1.967 2.935zM9.95 9.697c-1.2 0-3.607.9-3.607 2.69v2.201h7.213v-2.201c0-1.79-2.406-2.69-3.606-2.69zm-4.918-.979c-1.528 0-4.59 1.145-4.59 3.424v2.446h4.59v-2.201c0-.832.216-2.29 1.554-3.395-.57-.176-1.121-.274-1.554-.274z" fill={active ? '#2979FF' : '#9696A0'} /></svg>

  )
}

export default MyMemesIcon;