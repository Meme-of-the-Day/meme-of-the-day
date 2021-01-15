import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Loader from "./Loader";

interface Props {
  step: number;
  signMessage: () => Promise<string>;
  getSellerApproval: () => Promise<any>;
  txDetails: any;
  closeModal: () => void;
  dismiss: () => void;
}

type DetailsObject = {
  isLink?: boolean;
  link?: string;
  text?: string;
};

const Main = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
`;

const ModalBody = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  width: 40%;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const CustomLink = styled(Link)`
  text-decoration: underline;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.black};
  margin: 10px auto;
`;

const TxDetails = styled.div`
  overflow: hidden;
  transition: height 0.5s ease-out;
  word-break: break-word;
  border: 1px solid ${({ theme }) => theme.colors.purple100};
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 16px;

  &.open {
    border: 1px solid ${({ theme }) => theme.colors.gray50};
    height: 200px;
    padding: 10px;
  }
`;

const DetailDiv = styled.div`
  word-break: break-all;
  margin: 10px 0;
`;

const Step = styled.div<{ isCurrent: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;
  margin: 10px;
  opacity: ${({ isCurrent }) => (isCurrent === true ? "1" : "0.2")};
  background-color: ${({ theme, isCurrent }) =>
    isCurrent === true ? theme.colors.purple100 : "none"};
`;

const Number = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.purple400};
  height: 40px;
  width: 40px;
  border-radius: 50%;
  margin-right: 16px;
`;

const Message = styled.div`
  flex: 1;
`;

const Action = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.purple500};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.white};
  width: 100px;
  border: none;
`;

const DoneButton = styled.button`
  background-color: ${({ theme }) => theme.colors.blue};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: none;
  padding: 8px 16px;
  width: 100px;
  margin: auto;
`;

const Close = styled.div`
  text-align: right;
  font-size: 36px;
  margin: -8px 0;
`;

const UploadModal: React.FC<Props> = ({
  step,
  signMessage,
  getSellerApproval,
  txDetails,
  closeModal,
  dismiss
}) => {
  const renderDetails = (value: string | DetailsObject) => {
    switch (typeof value) {
      case "string":
        return value;
      case "object":
        if (value.isLink) {
          return (
            <a target="_blank" rel="noopener noreferrer" href={value.link}>
              {value.text || value.link}
            </a>
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <Main>
      <ModalBody>
        <Close onClick={dismiss}>&times;</Close>
        <Step isCurrent={step === 1}>
          <Number>1</Number>

          <Message>Minting your NFT...</Message>

          {step === 1 && <Loader isSmall />}
        </Step>
        <Step isCurrent={step === 2}>
          <Number>2</Number>

          <Message>Sign the sale transaction</Message>
          <Action onClick={step === 2 ? signMessage : undefined}>Sign</Action>
        </Step>
        <Step isCurrent={step === 3}>
          <Number>3</Number>

          <Message>Provide approval...</Message>
          <Action onClick={step === 3 ? getSellerApproval : undefined}>
            Approve
          </Action>
        </Step>
        {step === 4 && (
          <>
            <TxDetails>
              <div>Transaction Details:</div>
              {Object.keys(txDetails).map(key => {
                return (
                  <DetailDiv>
                    <em>{key}</em>: {renderDetails(txDetails[key])}
                  </DetailDiv>
                );
              })}
            </TxDetails>
            <DoneButton onClick={closeModal}>Done</DoneButton>
            <CustomLink to="/me">View your memes</CustomLink>
          </>
        )}
      </ModalBody>
    </Main>
  );
};

export default UploadModal;
