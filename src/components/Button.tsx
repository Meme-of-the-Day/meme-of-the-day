import React from 'react';
import styled from 'styled-components';

interface Props {
  text: string;
  icon?: string;
  onClick?: () => void;
  className?: string;
}

const Main = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.blue50};
  color: ${({ theme }) => theme.colors.blue};
  border-radius: 4px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  width: 80px;
  background-color: ${({ theme }) => theme.colors.white};

  & > img {
    width: 15px;
    margin-right: 8px;
  }
`;

const Button: React.FC<Props> = ({ text, icon, onClick, className }) => {
  return (
    <Main onClick={onClick} className={className}>
      <img src={icon} alt={text} />
      {text}
    </Main>
  )
}

export default Button;