import React, { useContext } from "react";
import styled from "styled-components";
import { UIContext, AuthContext, UIContextType, AuthContextType } from "../App";

const Main = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: ${({ theme }) => theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const ModalBody = styled.div`
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.purple500};
  background-color: ${({ theme }) => theme.colors.white};
  height: 240px;
  font-size: 20px;
  position: relative;
  text-align: center;
  max-width: 40%;
`;

const Close = styled.div`
  position: absolute;
  top: 5px;
  right: 16px;
  font-size: 30px;
  cursor: pointer;
`;

const Connect = styled.span`
  cursor: pointer;
`;

const MessageModal: React.FC<{}> = () => {
  const uiContext = useContext<UIContextType>(UIContext);
  const authContext = useContext<AuthContextType>(AuthContext);

  const { showModal, closeModal } = uiContext;
  const {
    hasMetamask,
    isMetamaskConnected,
    isConnectedToMatic,
    authenticate
  } = authContext;

  if (!showModal) {
    return null;
  }

  return (
    <Main>
      <ModalBody>
        <Close onClick={closeModal}>&times;</Close>
        {!hasMetamask ? (
          <span onClick={closeModal}>
            <a
              href="https://metamask.io/download.html"
              rel="nofollow, noreferrer"
              target="_blank"
            >
              Please install Metamask to use this app
              <br />
              <u>Click here to see how</u>
            </a>
          </span>
        ) : !isMetamaskConnected ? (
          <Connect
            onClick={() => {
              closeModal();
              authenticate();
            }}
          >
            Please connect with Metamask, <u>click here</u>
          </Connect>
        ) : !isConnectedToMatic ? (
          <span onClick={closeModal}>
            <a
              href="https://blog.matic.network/deposits-and-withdrawals-on-pos-bridge/"
              rel="nofollow, noreferrer"
              target="_blank"
            >
              Please follow the steps <u>here</u> to connect to the MATIC
              network to be able to use this app
            </a>
          </span>
        ) : null}
      </ModalBody>
    </Main>
  );
};

export default MessageModal;
