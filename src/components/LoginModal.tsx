import React, { useContext, useEffect, useState } from "react";
import DirectWebSdk from "@toruslabs/torus-direct-web-sdk";
import styled from "styled-components";
import { UIContext, UIContextType } from "../App";
import { Torus } from "../utils/torus";
import ReactTooltip from 'react-tooltip';
import { UserMetadata } from "../utils/torusTypes";
import web3Obj from "../../src/helper/helper";
import '../assets/flaticon.css';
import '../assets/css/custom.css';
const GOOGLE = "google";
const FACEBOOK = "facebook";
const REDDIT = "reddit";
const DISCORD = "discord";
const TWITCH = "twitch";
const GITHUB = "github";
const APPLE = "apple";
const LINKEDIN = "linkedin";
const TWITTER = "twitter";
const WEIBO = "weibo";
const LINE = "line";
const EMAIL_PASSWORD = "email_password";
const PASSWORDLESS = "passwordless";
const HOSTED_EMAIL_PASSWORDLESS = "hosted_email_passwordless";
const HOSTED_SMS_PASSWORDLESS = "hosted_sms_passwordless";
const WEBAUTHN = "webauthn";

const AUTH_DOMAIN = "https://torus-test.auth0.com";

const verifierMap = {
    [GOOGLE]: {
        name: "Google",
        typeOfLogin: "google",
        clientId: "221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com",
        verifier: "google-lrc",
    },
    [FACEBOOK]: { name: "Facebook", typeOfLogin: "facebook", clientId: "617201755556395", verifier: "facebook-lrc" },
    [REDDIT]: { name: "Reddit", typeOfLogin: "reddit", clientId: "YNsv1YtA_o66fA", verifier: "torus-reddit-test" },
    [TWITCH]: { name: "Twitch", typeOfLogin: "twitch", clientId: "f5and8beke76mzutmics0zu4gw10dj", verifier: "twitch-lrc" },
    [DISCORD]: { name: "Discord", typeOfLogin: "discord", clientId: "682533837464666198", verifier: "discord-lrc" },
    [EMAIL_PASSWORD]: {
        name: "Email Password",
        typeOfLogin: "email_password",
        clientId: "sqKRBVSdwa4WLkaq419U7Bamlh5vK1H7",
        verifier: "torus-auth0-email-password",
    },
    [PASSWORDLESS]: {
        name: "Passwordless",
        typeOfLogin: "passwordless",
        clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
        verifier: "torus-auth0-passwordless",
    },
    [APPLE]: { name: "Apple", typeOfLogin: "apple", clientId: "m1Q0gvDfOyZsJCZ3cucSQEe9XMvl9d9L", verifier: "torus-auth0-apple-lrc" },
    [GITHUB]: { name: "Github", typeOfLogin: "github", clientId: "PC2a4tfNRvXbT48t89J5am0oFM21Nxff", verifier: "torus-auth0-github-lrc" },
    [LINKEDIN]: { name: "Linkedin", typeOfLogin: "linkedin", clientId: "59YxSgx79Vl3Wi7tQUBqQTRTxWroTuoc", verifier: "torus-auth0-linkedin-lrc" },
    [TWITTER]: { name: "Twitter", typeOfLogin: "twitter", clientId: "A7H8kkcmyFRlusJQ9dZiqBLraG2yWIsO", verifier: "torus-auth0-twitter-lrc" },
    [WEIBO]: { name: "Weibo", typeOfLogin: "weibo", clientId: "dhFGlWQMoACOI5oS5A1jFglp772OAWr1", verifier: "torus-auth0-weibo-lrc" },
    [LINE]: { name: "Line", typeOfLogin: "line", clientId: "WN8bOmXKNRH1Gs8k475glfBP5gDZr9H1", verifier: "torus-auth0-line-lrc" },
    [HOSTED_EMAIL_PASSWORDLESS]: {
        name: "Hosted Email Passwordless",
        typeOfLogin: "jwt",
        clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
        verifier: "torus-auth0-passwordless",
    },
    [HOSTED_SMS_PASSWORDLESS]: {
        name: "Hosted SMS Passwordless",
        typeOfLogin: "jwt",
        clientId: "nSYBFalV2b1MSg5b2raWqHl63tfH3KQa",
        verifier: "torus-auth0-sms-passwordless",
    },
    [WEBAUTHN]: {
        name: "WebAuthn",
        typeOfLogin: "webauthn",
        clientId: "webauthn",
        verifier: "webauthn-lrc",
    }
};



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
  minHeight: 460px;
  font-size: 20px;
  position: relative;
  text-align: center;
  max-width: 50%;
  margin-top: 10px;
`;

const Close = styled.div`
  position: absolute;
  top: 5px;
  right: 16px;
  font-size: 30px;
  cursor: pointer;
`;

const Button = styled.button`
  align-items: center;
  color: ${({ theme }) => theme.colors.blue};
  background-color: ${({ theme }) => theme.colors.white};
  justify-content: space-between;
  cursor: pointer;
  border-radius: 8px;
`;

const loginButton = {
    color: "#000",
    borderColor: "#000",
    backgroundColor: "#fff",
    padding: "0",
    borderRadius: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "40px",
    minWidth: "40px"
};

const mtZero = {
    marginTop: "0",
};
const success = {
    marginTop: "0",
    color: "green",
};
const Connect = styled.span`
  cursor: pointer;
`;

const LoginModal: React.FC<{}> = () => {
    const [torus, setTorus] = useState([] as any);
    const [loginHint, setLoginHint] = useState('');
    const [selectedVerifier, setSeletedVerifier] = useState(GOOGLE);

    const [LoginCheck, setLoginCheck] = useState(false);

    const uiContext = useContext<UIContextType>(UIContext);
    const { showLoginModal, closeModal } = uiContext;

    useEffect(() => {
        async function torusInitialization() {
            try {
                const torusDirectWebSdk = new DirectWebSdk({
                    baseUrl: `${window.location.origin}/serviceworker`,
                    // redirectPathName: "auth",
                    enableLogging: true,
                    network: "testnet",
                    // uxMode: "redirect"
                });
                await torusDirectWebSdk.init({ skipSw: true });
                setTorus(torusDirectWebSdk);
                console.log("Successfull Initialization")
                console.log(torusDirectWebSdk)
            } catch (error) {
                console.error(error, "useeffect error caught");
            }
        }
        torusInitialization();
    }, []);


    const login = async (key: any) => {
        // try {

        //     setSeletedVerifier(key);

        //     const jwtParams = _loginToConnectionMap()[selectedVerifier] || {};
        //     const { typeOfLogin, clientId, verifier } = verifierMap[key];
        //     const torusLoginResponse = await torus.triggerLogin({
        //         typeOfLogin,
        //         verifier,
        //         clientId,
        //         jwtParams,
        //     })
        //     var finalData = typeof torusLoginResponse === "object" ? JSON.stringify(torusLoginResponse) : torusLoginResponse;
        //     localStorage.setItem('loginDetails', finalData);
        //     finalData = JSON.parse(finalData);
        //     console.log(finalData, "Final Data")
        //     const torusInstance = await Torus.getInstance();
        //     let userInfo = finalData.userInfo;
        //     const userData = await torusInstance.getUserData(userInfo.verifierId);
        //     if (userData.length == 0) {
        //         // let usexrMatadata: UserMetadata = {
        //         //     _id: userInfo.verifierId,
        //         //     // tokenID: finalData.privateKey,
        //         //     walletID: finalData.publicAddress,
        //         //     cid: "Not Found",
        //         //     path: "Pass BuK PAth",
        //         //     publicAddress: finalData.publicAddress,
        //         //     privateKey: finalData.privateKey,
        //         //     date: "" + new Date(),
        //         //     // metadataNonce : 0,
        //         //     pub_key: finalData.pubKey,
        //         //     userInfo: userInfo,
        //         //     email: userInfo.email,
        //         // }
        //         console.log('usexrMatadata');
        //         // const result = await torusInstance.createUserMetadata(usexrMatadata);
        //     } else {
        //         console.log("There Login")
        //     }
        //     setLoginCheck(true);
        //     // closeModal();

        // } catch (error) {
        //     console.error(error, "login error");
        // }
    };

    const _loginToConnectionMap = () => {
        return {
            [EMAIL_PASSWORD]: { domain: AUTH_DOMAIN },
            [PASSWORDLESS]: { domain: AUTH_DOMAIN, login_hint: loginHint },
            [HOSTED_EMAIL_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "", isVerifierIdCaseSensitive: false },
            [HOSTED_SMS_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "" },
            [APPLE]: { domain: AUTH_DOMAIN },
            [GITHUB]: { domain: AUTH_DOMAIN },
            [LINKEDIN]: { domain: AUTH_DOMAIN },
            [TWITTER]: { domain: AUTH_DOMAIN },
            [WEIBO]: { domain: AUTH_DOMAIN },
            [LINE]: { domain: AUTH_DOMAIN },
        };
    };



    if (!showLoginModal) {
        return null;
    }

    return (
        <Main>
            <ModalBody>
                <div>
                    <Close onClick={closeModal}>&times;</Close>
                    <ReactTooltip />
                    <div className="App">
                        <div >

                            <h5 style={mtZero}>TO ACCESS MEME OF THE DAY'S FEATURES,<br />
                            SIGN IN/UP USING <span className="gray">GOOGLE</span>
                            </h5>


                            {LoginCheck && (
                                <h5 style={success}> Login Successfully Done!
                                </h5>
                            )}




                            <div className="socialBtnWrap">
                                <button data-tip="Continue with Google" style={loginButton} type="button" onClick={() => login(GOOGLE)}>
                                    <i className="flaticon-google-glass-logo"></i>
                                </button>
                                <button data-tip="Continue With FB" style={loginButton} type="button" onClick={() => login(FACEBOOK)}>
                                    <i className="flaticon-facebook"></i>
                                </button>
                                <button data-tip="Continue With REDDIT" style={loginButton} type="button" onClick={() => login(REDDIT)}>
                                    <i className="flaticon-reddit-logo"></i>
                                </button>
                                <button data-tip="Continue With DISCORD" style={loginButton} type="button" onClick={() => login(DISCORD)}>
                                    <i className="flaticon-discord"></i>
                                </button>
                                <button data-tip="Continue With TWITCH" style={loginButton} type="button" onClick={() => login(TWITCH)}>
                                    <i className="flaticon-twitch"></i>
                                </button>
                                <button className="mt0" data-tip="Continue With GITHUB" style={loginButton} type="button" onClick={() => login(GITHUB)}>
                                    <i className="flaticon-github"></i>
                                </button>
                                <button data-tip="Continue With APPLE" style={loginButton} type="button" onClick={() => login(APPLE)}>
                                    <i className="flaticon-apple"></i>
                                </button>
                                <button data-tip="Continue With LINKEDIN" style={loginButton} type="button" onClick={() => login(LINKEDIN)}>
                                    <i className="flaticon-linkedin"></i>
                                </button>
                                <button data-tip="Continue With TWITTER" style={loginButton} type="button" onClick={() => login(TWITTER)}>
                                    <i className="flaticon-twitter"></i>
                                </button>
                                <button data-tip="Continue With WEIBO" style={loginButton} type="button" onClick={() => login(WEIBO)}>
                                    <i className="flaticon-weibo-website-logo"></i>
                                </button>
                                <button data-tip="Continue With LINE" style={loginButton} type="button" onClick={() => login(LINE)}>
                                    <svg className="svgIcon" id="Layer_1" enable-background="new 0 0 485 485" viewBox="0 0 485 485" xmlns="http://www.w3.org/2000/svg"><g><g><g><path d="m411.494 57.953c-45.237-37.372-105.254-57.953-168.994-57.953s-123.757 20.581-168.994 57.953c-45.789 37.827-71.006 88.274-71.006 142.047 0 50.591 21.962 98.125 61.84 133.849 37.054 33.192 87.599 54.423 143.16 60.292v80.859c0 3.805 2.159 7.279 5.569 8.965 1.405.694 2.921 1.035 4.43 1.035 2.156 0 4.297-.697 6.075-2.056l149.951-114.663c35.514-26.813 60.008-50.324 77.084-73.992 21.459-29.743 31.891-60.585 31.891-94.289 0-53.773-25.217-104.22-71.006-142.047zm-50.067 294.404-133.926 102.409v-69.765c0-5.236-4.039-9.586-9.261-9.973-54.809-4.065-104.725-23.98-140.555-56.076-35.586-31.879-55.185-74.123-55.185-118.952 0-99.252 98.691-180 220-180s220 80.748 220 180c0 66.832-48.555 112.704-101.073 152.357z" /><path d="m299.708 156.655c-.039-7.48-3.955-11.646-10.225-11.574-6.211.084-9.951 4.352-9.99 11.813-.108 13.805-.03 27.598-.059 41.391 0 1.992-.186 3.961-.352 7.721-2.363-2.76-3.701-4.18-4.893-5.718-12.793-16.608-25.547-33.248-38.33-49.879-3.125-4.067-7.08-6.52-12.266-4.893-5.166 1.615-7.431 5.834-7.441 10.928-.098 26.656-.098 53.296 0 79.941.01 4.371 1.777 8.121 6.035 10.133 7.52 3.539 14.639-1.797 14.727-11.344.176-13.027.059-26.074.059-39.121 0-2.516 0-5.036 0-7.559 2.51 1.142 3.731 2.476 4.844 3.902 12.754 16.414 25.478 32.84 38.203 49.297 3.155 4.129 6.768 7.149 12.432 5.223 5.547-1.882 7.305-6.043 7.305-11.439-.029-26.283.049-52.549-.049-78.822z" /><path d="m338.829 165.955c1.924-.148 4.121-.449 6.357-.455 7.54-.065 15.118.084 22.647-.098 2.754-.078 5.771-.273 8.203-1.416 4.765-2.223 6.181-6.67 4.902-11.475-1.25-4.903-4.902-7.451-10.068-7.467-13.409-.033-26.817-.062-40.225-.033-9.61.025-13.457 3.744-13.477 13.314-.098 25.324-.098 50.65 0 75.963.02 9.42 4.131 13.424 13.516 13.463 12.5.058 24.951.039 37.412-.012 2.05-.02 4.14-.301 6.113-.879 4.463-1.308 6.885-4.355 7.031-9.105.166-4.981-2.099-8.414-6.777-9.844-2.51-.766-5.215-.957-7.803-.977-9.356-.121-18.741-.055-28.262-.055 0-7.071 0-13.204 0-19.643 1.787-.166 3.233-.404 4.689-.418 8.877-.049 17.783.199 26.65-.117 7.724-.289 11.777-4.521 11.484-11.07-.254-5.886-4.571-9.519-11.641-9.652-4.921-.088-9.824-.016-14.775-.02-18.34 0-18.34 0-16.621-18.389.03-.365.274-.703.645-1.615z" /><path d="m156.328 226.988c-2.061-.24-4.141-.109-6.211-.109-8.662-.014-17.285 0-26.758 0 0-3.197 0-5.453 0-7.689 0-20.205.039-40.424-.029-60.631-.029-8.622-3.848-13.426-10.381-13.477-6.768-.063-10.43 4.531-10.43 13.273-.019 25.688-.039 51.362.02 77.059.04 8.164 4.004 12.16 12.188 12.324 7.344.129 34.922.246 41.338-.086 6.259-.352 10.615-4.981 10.527-10.465-.098-5.263-4.268-9.488-10.264-10.199z" /><path d="m198.593 155.269c-.059-7.785-2.539-10.25-10.049-10.26-7.647-.02-10.234 2.334-10.254 10.068-.088 27.402-.088 54.795 0 82.207.02 7.692 2.813 10.453 10.049 10.465 7.441.04 10.215-2.832 10.254-10.855.04-13.414.02-26.82.02-40.244 0-13.795.02-27.578-.02-41.381z" /></g></g></g><g /><g /><g /><g /><g /><g /><g /><g /><g /><g /><g /><g /><g /><g /><g /></svg>
                                </button>
                                <button className="mt0" data-tip="Continue With EMAIL_PASSWORD" style={loginButton} type="button" onClick={() => login(EMAIL_PASSWORD)}>
                                    <svg className="svgIcon" height="427pt" viewBox="-7 0 427 427.79603" width="427pt" xmlns="http://www.w3.org/2000/svg"><path d="m330.863281 97.527344-85.535156-95.355469c-.050781-.054687-.109375-.101563-.164063-.152344-1.132812-1.285156-2.765624-2.019531-4.480468-2.019531-.257813 0-.511719.0195312-.769532.0546875l-.242187-.0234375c-.199219-.0234375-.398437-.03125-.597656-.03125h-120.960938c-20.820312.0234375-37.691406 16.894531-37.714843 37.714844v81.941406l-67.558594 40.945312c-7.707032 4.746094-12.410156 13.136719-12.441406 22.1875v194.558594c.027343 27.847656 22.59375 50.417969 50.445312 50.449219h311.109375c27.847656-.03125 50.417969-22.601563 50.445313-50.449219v-194.558594c-.027344-9.042968-4.726563-17.425781-12.421876-22.175781l-65.347656-40.324219c-.199218-.125-.410156-.238281-.625-.335937l-1.605468-.746094v-17.671875c0-1.480468-.546876-2.90625-1.535157-4.007812zm-124.464843 215.011718-114-69.667968v-24.976563h228v24.976563zm-130-106.644531c-2.210938 0-4-1.789062-4-4v-46c0-2.207031 1.789062-4 4-4h260c2.207031 0 4 1.792969 4 4v46c0 2.210938-1.792969 4-4 4zm170.285156-184.242187 57.460937 64.0625h-31.746093c-14.195313-.019532-25.699219-11.523438-25.714844-25.71875zm-128.570313-9.65625h116.570313v48c.023437 20.820312 16.894531 37.695312 37.714844 37.71875h42.511718l5.488282 6.117187v36.0625h-228v-102.179687c.015624-14.199219 11.519531-25.703125 25.714843-25.71875zm-99.035156 158.855468 61.320313-37.164062v6.207031h-4c-8.832032.011719-15.988282 7.167969-16 16v46c.011718 8.832031 7.167968 15.992188 16 16h4v17.644531l-68-41.554687v-11.195313c.015624-4.867187 2.539062-9.378906 6.679687-11.9375zm342.875 244.945313h-311.109375c-21.226562-.023437-38.421875-17.226563-38.445312-38.449219v-169.300781l69.777343 42.644531c.660157.65625 1.46875 1.148438 2.351563 1.4375l118.742187 72.566406c1.921875 1.175782 4.335938 1.175782 6.257813 0l118.738281-72.5625c.886719-.289062 1.691406-.78125 2.355469-1.4375l69.777344-42.648437v169.300781c-.023438 21.222656-17.21875 38.425782-38.445313 38.449219zm31.746094-244.957031c4.148437 2.554687 6.683593 7.074218 6.699219 11.949218v11.195313l-68 41.554687v-17.644531h4c8.832031-.007812 15.988281-7.167969 16-16v-46c-.011719-8.832031-7.167969-15.988281-16-16h-4v-6.882812zm0 0" /><path d="m135.742188 169.738281c-5.058594 0-9.160157 4.097657-9.160157 9.15625 0 5.058594 4.101563 9.160157 9.15625 9.160157 5.058594 0 9.160157-4.101563 9.160157-9.160157-.007813-5.054687-4.101563-9.152343-9.15625-9.15625zm0 12c-1.570313 0-2.84375-1.273437-2.84375-2.84375 0-1.566406 1.273437-2.839843 2.84375-2.839843 1.570312 0 2.839843 1.273437 2.839843 2.839843 0 1.570313-1.273437 2.839844-2.839843 2.84375zm0 0" /><path d="m171.070312 169.738281c-5.058593 0-9.160156 4.101563-9.160156 9.15625 0 5.058594 4.101563 9.160157 9.160156 9.160157 5.054688 0 9.15625-4.101563 9.15625-9.160157-.003906-5.054687-4.101562-9.152343-9.15625-9.15625zm0 12c-1.570312 0-2.84375-1.273437-2.84375-2.84375 0-1.570312 1.273438-2.839843 2.84375-2.839843 1.570313 0 2.839844 1.273437 2.839844 2.839843 0 1.570313-1.273437 2.84375-2.839844 2.84375zm0 0" /><path d="m206.398438 169.738281c-5.058594 0-9.160157 4.101563-9.160157 9.15625 0 5.058594 4.101563 9.160157 9.160157 9.160157 5.058593 0 9.15625-4.101563 9.15625-9.160157-.003907-5.054687-4.101563-9.152343-9.15625-9.15625zm0 12c-1.570313 0-2.84375-1.273437-2.84375-2.84375 0-1.566406 1.273437-2.839843 2.84375-2.839843 1.570312 0 2.839843 1.273437 2.839843 2.839843 0 1.570313-1.269531 2.84375-2.839843 2.84375zm0 0" /><path d="m241.726562 169.738281c-5.058593 0-9.15625 4.097657-9.160156 9.15625 0 5.058594 4.101563 9.160157 9.160156 9.160157 5.058594 0 9.15625-4.101563 9.15625-9.160157-.003906-5.054687-4.101562-9.152343-9.15625-9.15625zm0 12c-1.570312 0-2.839843-1.273437-2.839843-2.84375 0-1.566406 1.269531-2.839843 2.839843-2.839843 1.570313 0 2.84375 1.273437 2.84375 2.839843-.003906 1.570313-1.273437 2.839844-2.84375 2.84375zm0 0" /><path d="m277.054688 169.738281c-5.058594 0-9.15625 4.101563-9.15625 9.15625 0 5.058594 4.097656 9.160157 9.15625 9.160157 5.058593 0 9.160156-4.101563 9.160156-9.160157-.007813-5.054687-4.105469-9.152343-9.160156-9.15625zm0 12c-1.570313 0-2.839844-1.273437-2.839844-2.84375 0-1.570312 1.273437-2.839843 2.839844-2.839843 1.570312 0 2.84375 1.273437 2.84375 2.839843-.003907 1.570313-1.273438 2.84375-2.84375 2.84375zm0 0" /><path d="m100.410156 169.738281c-5.054687 0-9.15625 4.101563-9.15625 9.15625 0 5.058594 4.101563 9.160157 9.15625 9.160157 5.058594 0 9.160156-4.101563 9.160156-9.160157-.003906-5.054687-4.101562-9.152343-9.160156-9.15625zm0 12c-1.566406 0-2.839844-1.273437-2.839844-2.84375 0-1.566406 1.273438-2.839843 2.839844-2.839843 1.570313 0 2.84375 1.273437 2.84375 2.839843 0 1.570313-1.273437 2.84375-2.84375 2.84375zm0 0" /><path d="m312.382812 169.738281c-5.054687 0-9.15625 4.101563-9.15625 9.15625 0 5.058594 4.101563 9.160157 9.15625 9.160157 5.058594 0 9.160157-4.101563 9.160157-9.160157-.007813-5.054687-4.101563-9.152343-9.160157-9.15625zm0 12c-1.570312 0-2.839843-1.273437-2.839843-2.84375 0-1.566406 1.269531-2.839843 2.839843-2.839843 1.570313 0 2.84375 1.273437 2.84375 2.839843-.003906 1.570313-1.273437 2.84375-2.84375 2.84375zm0 0" /></svg>
                                </button>

                                <button data-tip="Continue With PASSWORDLESS" style={loginButton} type="button" onClick={() => login(PASSWORDLESS)}>
                                    <svg className="svgIcon" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 486.8 486.8">
                                        <g>
                                            <g>
                                                <path d="M80,370.406c-1.9-3.3-6.2-4.4-9.5-2.5l-17.4,10.1v-20.1c0-3.8-3.1-6.9-6.9-6.9c-3.8,0-6.9,3.1-6.9,6.9v20.1l-17.4-10.1
                                            c-3.3-1.9-7.6-0.8-9.5,2.5s-0.8,7.6,2.5,9.5l17.5,10.2l-17.5,10.2c-3.3,1.9-4.4,6.2-2.5,9.5s6.2,4.4,9.5,2.5l17.4-10.1v20.1
                                            c0,3.8,3.1,6.9,6.9,6.9c3.8,0,6.9-3.1,6.9-6.9v-20.1l17.4,10.1c3.3,1.9,7.6,0.8,9.5-2.5s0.8-7.6-2.5-9.5l-17.5-10.2l17.5-10.2
                                            C80.8,377.906,82,373.706,80,370.406z"/>
                                                <path d="M143.9,409.706c1.9,3.3,6.2,4.4,9.5,2.5l17.4-10.1v20.1c0,3.8,3.1,6.9,6.9,6.9c3.8,0,6.9-3.1,6.9-6.9v-20.1l17.4,10.1
                                            c3.3,1.9,7.6,0.8,9.5-2.5s0.8-7.6-2.5-9.5l-17.5-10.2l17.5-10.2c3.3-1.9,4.4-6.2,2.5-9.5s-6.2-4.4-9.5-2.5l-17.4,10.1v-20.1
                                            c0-3.8-3.1-6.9-6.9-6.9c-3.8,0-6.9,3.1-6.9,6.9v20.1l-17.4-10c-3.3-1.9-7.6-0.8-9.5,2.5s-0.8,7.6,2.5,9.5l17.5,10.2l-17.5,10.1
                                            C143.1,402.106,142,406.406,143.9,409.706z"/>
                                                <path d="M131.5,462.106v12.2c0,2.9,2.4,5.3,5.3,5.3h81.9c2.9,0,5.3-2.4,5.3-5.3v-12.2c0-2.9-2.4-5.3-5.3-5.3h-81.9
                                            C133.8,456.806,131.5,459.206,131.5,462.106z"/>
                                                <path d="M331.1,121.106h-0.6v-27.2c0-47.3-38.7-87.5-85.9-86.7c-45.9,0.8-83.1,38.4-83.1,84.5v2.6c0,3.9,3.2,7.1,7.1,7.1h22.7
                                            c3.9,0,7.1-3.2,7.1-7.1v-0.8c0-25.4,19.1-47.7,44.5-49.3c27.6-1.7,50.6,20.2,50.6,47.4v29.4h-70v0.1h-64.7
                                            c-12,0.4-21.7,10.1-21.7,22.2v123c0,12.3,10,22.3,22.3,22.3H331c12.3,0,22.3-10,22.3-22.3v-122.9
                                            C353.4,131.106,343.4,121.106,331.1,121.106z M258.5,210.406c-1.7,1.2-2.2,2.5-2.2,4.5c0.1,9,0.1,18,0,27.1l0,0
                                            c0.2,3.8-1.7,7.4-5.1,9.1c-7.9,4-15.8-1.6-15.8-9.1c0,0,0,0,0-0.1c0-9,0-18.1,0-27.1c0-1.8-0.4-3.1-2-4.3
                                            c-8.2-6-10.9-16.3-6.8-25.4c4-8.8,13.7-14,22.8-12.1c10.2,2,17.3,10.3,17.4,20.4C267.1,200.506,264.2,206.306,258.5,210.406z"/>
                                                <path d="M262.9,462.106v12.2c0,2.9,2.4,5.3,5.3,5.3h81.9c2.9,0,5.3-2.4,5.3-5.3v-12.2c0-2.9-2.4-5.3-5.3-5.3h-81.9
                                            C265.3,456.806,262.9,459.206,262.9,462.106z"/>
                                                <path d="M275.3,409.706c1.9,3.3,6.2,4.4,9.5,2.5l17.4-10.1v20.1c0,3.8,3.1,6.9,6.9,6.9s6.9-3.1,6.9-6.9v-20.1l17.4,10.1
                                            c3.3,1.9,7.6,0.8,9.5-2.5s0.8-7.6-2.5-9.5l-17.5-10.2l17.5-10.2c3.3-1.9,4.4-6.2,2.5-9.5s-6.2-4.4-9.5-2.5l-17.4,10.1v-20.1
                                            c0-3.8-3.1-6.9-6.9-6.9s-6.9,3.1-6.9,6.9v20.1l-17.4-10.1c-3.3-1.9-7.6-0.8-9.5,2.5s-0.8,7.6,2.5,9.5l17.5,10.2l-17.5,10.2
                                            C274.5,402.106,273.4,406.406,275.3,409.706z"/>
                                                <path d="M481.5,456.806h-81.9c-2.9,0-5.3,2.4-5.3,5.3v12.2c0,2.9,2.4,5.3,5.3,5.3h81.9c2.9,0,5.3-2.4,5.3-5.3v-12.2
                                            C486.8,459.206,484.4,456.806,481.5,456.806z"/>
                                                <path d="M5.3,479.606h81.9c2.9,0,5.3-2.4,5.3-5.3v-12.2c0-2.9-2.4-5.3-5.3-5.3H5.3c-2.9,0-5.3,2.4-5.3,5.3v12.2
                                            C0,477.206,2.4,479.606,5.3,479.606z"/>
                                                <path d="M406.8,409.706c1.9,3.3,6.2,4.4,9.5,2.5l17.4-10.1v20.1c0,3.8,3.1,6.9,6.9,6.9s6.9-3.1,6.9-6.9v-20.1l17.4,10.1
                                            c3.3,1.9,7.6,0.8,9.5-2.5s0.8-7.6-2.5-9.5l-17.5-10.2l17.5-10.2c3.3-1.9,4.4-6.2,2.5-9.5s-6.2-4.4-9.5-2.5l-17.4,10.1v-20.1
                                            c0-3.8-3.1-6.9-6.9-6.9s-6.9,3.1-6.9,6.9v20.1l-17.4-10.1c-3.3-1.9-7.6-0.8-9.5,2.5s-0.8,7.6,2.5,9.5l17.5,10.2l-17.5,10.2
                                            C406,402.106,404.8,406.406,406.8,409.706z"/></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
                                </button>

                                <button data-tip="Continue With HOSTED_EMAIL_PASSWORDLESS" style={loginButton} type="button" onClick={() => login(HOSTED_EMAIL_PASSWORDLESS)}>
                                    <svg className="svgIcon" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 486.8 486.8">
                                        <g>
                                            <g>
                                                <path d="M80,370.406c-1.9-3.3-6.2-4.4-9.5-2.5l-17.4,10.1v-20.1c0-3.8-3.1-6.9-6.9-6.9c-3.8,0-6.9,3.1-6.9,6.9v20.1l-17.4-10.1
                                            c-3.3-1.9-7.6-0.8-9.5,2.5s-0.8,7.6,2.5,9.5l17.5,10.2l-17.5,10.2c-3.3,1.9-4.4,6.2-2.5,9.5s6.2,4.4,9.5,2.5l17.4-10.1v20.1
                                            c0,3.8,3.1,6.9,6.9,6.9c3.8,0,6.9-3.1,6.9-6.9v-20.1l17.4,10.1c3.3,1.9,7.6,0.8,9.5-2.5s0.8-7.6-2.5-9.5l-17.5-10.2l17.5-10.2
                                            C80.8,377.906,82,373.706,80,370.406z"/>
                                                <path d="M143.9,409.706c1.9,3.3,6.2,4.4,9.5,2.5l17.4-10.1v20.1c0,3.8,3.1,6.9,6.9,6.9c3.8,0,6.9-3.1,6.9-6.9v-20.1l17.4,10.1
                                            c3.3,1.9,7.6,0.8,9.5-2.5s0.8-7.6-2.5-9.5l-17.5-10.2l17.5-10.2c3.3-1.9,4.4-6.2,2.5-9.5s-6.2-4.4-9.5-2.5l-17.4,10.1v-20.1
                                            c0-3.8-3.1-6.9-6.9-6.9c-3.8,0-6.9,3.1-6.9,6.9v20.1l-17.4-10c-3.3-1.9-7.6-0.8-9.5,2.5s-0.8,7.6,2.5,9.5l17.5,10.2l-17.5,10.1
                                            C143.1,402.106,142,406.406,143.9,409.706z"/>
                                                <path d="M131.5,462.106v12.2c0,2.9,2.4,5.3,5.3,5.3h81.9c2.9,0,5.3-2.4,5.3-5.3v-12.2c0-2.9-2.4-5.3-5.3-5.3h-81.9
                                            C133.8,456.806,131.5,459.206,131.5,462.106z"/>
                                                <path d="M331.1,121.106h-0.6v-27.2c0-47.3-38.7-87.5-85.9-86.7c-45.9,0.8-83.1,38.4-83.1,84.5v2.6c0,3.9,3.2,7.1,7.1,7.1h22.7
                                            c3.9,0,7.1-3.2,7.1-7.1v-0.8c0-25.4,19.1-47.7,44.5-49.3c27.6-1.7,50.6,20.2,50.6,47.4v29.4h-70v0.1h-64.7
                                            c-12,0.4-21.7,10.1-21.7,22.2v123c0,12.3,10,22.3,22.3,22.3H331c12.3,0,22.3-10,22.3-22.3v-122.9
                                            C353.4,131.106,343.4,121.106,331.1,121.106z M258.5,210.406c-1.7,1.2-2.2,2.5-2.2,4.5c0.1,9,0.1,18,0,27.1l0,0
                                            c0.2,3.8-1.7,7.4-5.1,9.1c-7.9,4-15.8-1.6-15.8-9.1c0,0,0,0,0-0.1c0-9,0-18.1,0-27.1c0-1.8-0.4-3.1-2-4.3
                                            c-8.2-6-10.9-16.3-6.8-25.4c4-8.8,13.7-14,22.8-12.1c10.2,2,17.3,10.3,17.4,20.4C267.1,200.506,264.2,206.306,258.5,210.406z"/>
                                                <path d="M262.9,462.106v12.2c0,2.9,2.4,5.3,5.3,5.3h81.9c2.9,0,5.3-2.4,5.3-5.3v-12.2c0-2.9-2.4-5.3-5.3-5.3h-81.9
                                            C265.3,456.806,262.9,459.206,262.9,462.106z"/>
                                                <path d="M275.3,409.706c1.9,3.3,6.2,4.4,9.5,2.5l17.4-10.1v20.1c0,3.8,3.1,6.9,6.9,6.9s6.9-3.1,6.9-6.9v-20.1l17.4,10.1
                                            c3.3,1.9,7.6,0.8,9.5-2.5s0.8-7.6-2.5-9.5l-17.5-10.2l17.5-10.2c3.3-1.9,4.4-6.2,2.5-9.5s-6.2-4.4-9.5-2.5l-17.4,10.1v-20.1
                                            c0-3.8-3.1-6.9-6.9-6.9s-6.9,3.1-6.9,6.9v20.1l-17.4-10.1c-3.3-1.9-7.6-0.8-9.5,2.5s-0.8,7.6,2.5,9.5l17.5,10.2l-17.5,10.2
                                            C274.5,402.106,273.4,406.406,275.3,409.706z"/>
                                                <path d="M481.5,456.806h-81.9c-2.9,0-5.3,2.4-5.3,5.3v12.2c0,2.9,2.4,5.3,5.3,5.3h81.9c2.9,0,5.3-2.4,5.3-5.3v-12.2
                                            C486.8,459.206,484.4,456.806,481.5,456.806z"/>
                                                <path d="M5.3,479.606h81.9c2.9,0,5.3-2.4,5.3-5.3v-12.2c0-2.9-2.4-5.3-5.3-5.3H5.3c-2.9,0-5.3,2.4-5.3,5.3v12.2
                                            C0,477.206,2.4,479.606,5.3,479.606z"/>
                                                <path d="M406.8,409.706c1.9,3.3,6.2,4.4,9.5,2.5l17.4-10.1v20.1c0,3.8,3.1,6.9,6.9,6.9s6.9-3.1,6.9-6.9v-20.1l17.4,10.1
                                            c3.3,1.9,7.6,0.8,9.5-2.5s0.8-7.6-2.5-9.5l-17.5-10.2l17.5-10.2c3.3-1.9,4.4-6.2,2.5-9.5s-6.2-4.4-9.5-2.5l-17.4,10.1v-20.1
                                            c0-3.8-3.1-6.9-6.9-6.9s-6.9,3.1-6.9,6.9v20.1l-17.4-10.1c-3.3-1.9-7.6-0.8-9.5,2.5s-0.8,7.6,2.5,9.5l17.5,10.2l-17.5,10.2
                                            C406,402.106,404.8,406.406,406.8,409.706z"/></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
                                </button>


                                <button data-tip="Continue With HOSTED_SMS_PASSWORDLESS" style={loginButton} type="button" onClick={() => login(HOSTED_SMS_PASSWORDLESS)}>
                                    <svg className="svgIcon" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 486.8 486.8">
                                        <g>
                                            <g>
                                                <path d="M80,370.406c-1.9-3.3-6.2-4.4-9.5-2.5l-17.4,10.1v-20.1c0-3.8-3.1-6.9-6.9-6.9c-3.8,0-6.9,3.1-6.9,6.9v20.1l-17.4-10.1
                                            c-3.3-1.9-7.6-0.8-9.5,2.5s-0.8,7.6,2.5,9.5l17.5,10.2l-17.5,10.2c-3.3,1.9-4.4,6.2-2.5,9.5s6.2,4.4,9.5,2.5l17.4-10.1v20.1
                                            c0,3.8,3.1,6.9,6.9,6.9c3.8,0,6.9-3.1,6.9-6.9v-20.1l17.4,10.1c3.3,1.9,7.6,0.8,9.5-2.5s0.8-7.6-2.5-9.5l-17.5-10.2l17.5-10.2
                                            C80.8,377.906,82,373.706,80,370.406z"/>
                                                <path d="M143.9,409.706c1.9,3.3,6.2,4.4,9.5,2.5l17.4-10.1v20.1c0,3.8,3.1,6.9,6.9,6.9c3.8,0,6.9-3.1,6.9-6.9v-20.1l17.4,10.1
                                            c3.3,1.9,7.6,0.8,9.5-2.5s0.8-7.6-2.5-9.5l-17.5-10.2l17.5-10.2c3.3-1.9,4.4-6.2,2.5-9.5s-6.2-4.4-9.5-2.5l-17.4,10.1v-20.1
                                            c0-3.8-3.1-6.9-6.9-6.9c-3.8,0-6.9,3.1-6.9,6.9v20.1l-17.4-10c-3.3-1.9-7.6-0.8-9.5,2.5s-0.8,7.6,2.5,9.5l17.5,10.2l-17.5,10.1
                                            C143.1,402.106,142,406.406,143.9,409.706z"/>
                                                <path d="M131.5,462.106v12.2c0,2.9,2.4,5.3,5.3,5.3h81.9c2.9,0,5.3-2.4,5.3-5.3v-12.2c0-2.9-2.4-5.3-5.3-5.3h-81.9
                                            C133.8,456.806,131.5,459.206,131.5,462.106z"/>
                                                <path d="M331.1,121.106h-0.6v-27.2c0-47.3-38.7-87.5-85.9-86.7c-45.9,0.8-83.1,38.4-83.1,84.5v2.6c0,3.9,3.2,7.1,7.1,7.1h22.7
                                            c3.9,0,7.1-3.2,7.1-7.1v-0.8c0-25.4,19.1-47.7,44.5-49.3c27.6-1.7,50.6,20.2,50.6,47.4v29.4h-70v0.1h-64.7
                                            c-12,0.4-21.7,10.1-21.7,22.2v123c0,12.3,10,22.3,22.3,22.3H331c12.3,0,22.3-10,22.3-22.3v-122.9
                                            C353.4,131.106,343.4,121.106,331.1,121.106z M258.5,210.406c-1.7,1.2-2.2,2.5-2.2,4.5c0.1,9,0.1,18,0,27.1l0,0
                                            c0.2,3.8-1.7,7.4-5.1,9.1c-7.9,4-15.8-1.6-15.8-9.1c0,0,0,0,0-0.1c0-9,0-18.1,0-27.1c0-1.8-0.4-3.1-2-4.3
                                            c-8.2-6-10.9-16.3-6.8-25.4c4-8.8,13.7-14,22.8-12.1c10.2,2,17.3,10.3,17.4,20.4C267.1,200.506,264.2,206.306,258.5,210.406z"/>
                                                <path d="M262.9,462.106v12.2c0,2.9,2.4,5.3,5.3,5.3h81.9c2.9,0,5.3-2.4,5.3-5.3v-12.2c0-2.9-2.4-5.3-5.3-5.3h-81.9
                                            C265.3,456.806,262.9,459.206,262.9,462.106z"/>
                                                <path d="M275.3,409.706c1.9,3.3,6.2,4.4,9.5,2.5l17.4-10.1v20.1c0,3.8,3.1,6.9,6.9,6.9s6.9-3.1,6.9-6.9v-20.1l17.4,10.1
                                            c3.3,1.9,7.6,0.8,9.5-2.5s0.8-7.6-2.5-9.5l-17.5-10.2l17.5-10.2c3.3-1.9,4.4-6.2,2.5-9.5s-6.2-4.4-9.5-2.5l-17.4,10.1v-20.1
                                            c0-3.8-3.1-6.9-6.9-6.9s-6.9,3.1-6.9,6.9v20.1l-17.4-10.1c-3.3-1.9-7.6-0.8-9.5,2.5s-0.8,7.6,2.5,9.5l17.5,10.2l-17.5,10.2
                                            C274.5,402.106,273.4,406.406,275.3,409.706z"/>
                                                <path d="M481.5,456.806h-81.9c-2.9,0-5.3,2.4-5.3,5.3v12.2c0,2.9,2.4,5.3,5.3,5.3h81.9c2.9,0,5.3-2.4,5.3-5.3v-12.2
                                            C486.8,459.206,484.4,456.806,481.5,456.806z"/>
                                                <path d="M5.3,479.606h81.9c2.9,0,5.3-2.4,5.3-5.3v-12.2c0-2.9-2.4-5.3-5.3-5.3H5.3c-2.9,0-5.3,2.4-5.3,5.3v12.2
                                            C0,477.206,2.4,479.606,5.3,479.606z"/>
                                                <path d="M406.8,409.706c1.9,3.3,6.2,4.4,9.5,2.5l17.4-10.1v20.1c0,3.8,3.1,6.9,6.9,6.9s6.9-3.1,6.9-6.9v-20.1l17.4,10.1
                                            c3.3,1.9,7.6,0.8,9.5-2.5s0.8-7.6-2.5-9.5l-17.5-10.2l17.5-10.2c3.3-1.9,4.4-6.2,2.5-9.5s-6.2-4.4-9.5-2.5l-17.4,10.1v-20.1
                                            c0-3.8-3.1-6.9-6.9-6.9s-6.9,3.1-6.9,6.9v20.1l-17.4-10.1c-3.3-1.9-7.6-0.8-9.5,2.5s-0.8,7.6,2.5,9.5l17.5,10.2l-17.5,10.2
                                            C406,402.106,404.8,406.406,406.8,409.706z"/></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
                                </button>

                                <button data-tip="Continue with WEBAUTHN" style={loginButton} type="button" onClick={() => login(WEBAUTHN)}>
                                    <svg className="svgIcon" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M496,400h-8V376a40,40,0,0,0-80,0v24h-8a8,8,0,0,0-8,8v24H278.62A24.067,24.067,0,0,0,264,417.38V359.8c84.52-4.18,152-74.26,152-159.8S348.52,44.38,264,40.2V40H248v.2C163.48,44.38,96,114.46,96,200s67.48,155.62,152,159.8v57.58A24.067,24.067,0,0,0,233.38,432H120V408a8,8,0,0,0-8-8h-8V376a40,40,0,0,0-80,0v24H16a8,8,0,0,0-8,8v64a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V448H233.38a23.99,23.99,0,0,0,45.24,0H392v24a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V408A8,8,0,0,0,496,400ZM302.69,336.23a126.6,126.6,0,0,0,16.96-25.02A180.183,180.183,0,0,0,329.75,288H369.9A144.587,144.587,0,0,1,302.69,336.23ZM380.67,272h-45.9a271.6,271.6,0,0,0,9.12-64h55.88A142.886,142.886,0,0,1,380.67,272Zm19.1-80H343.89a271.6,271.6,0,0,0-9.12-64h45.9A142.886,142.886,0,0,1,399.77,192ZM369.9,112H329.75a180.183,180.183,0,0,0-10.1-23.21,126.6,126.6,0,0,0-16.96-25.02A144.587,144.587,0,0,1,369.9,112ZM264,56.93c15.34,3.54,29.84,17.18,41.49,39.32A160.25,160.25,0,0,1,312.67,112H264ZM264,128h54.15a251.618,251.618,0,0,1,9.73,64H264Zm0,80h63.88a251.618,251.618,0,0,1-9.73,64H264Zm0,80h48.67a160.25,160.25,0,0,1-7.18,15.75c-11.65,22.14-26.15,35.78-41.49,39.32ZM40,376a24,24,0,0,1,48,0v24H40Zm64,88H24V416h80ZM248,56.93V112H199.33a160.25,160.25,0,0,1,7.18-15.75C218.16,74.11,232.66,60.47,248,56.93ZM184.12,192a251.618,251.618,0,0,1,9.73-64H248v64ZM248,208v64H193.85a251.618,251.618,0,0,1-9.73-64ZM209.31,63.77a126.6,126.6,0,0,0-16.96,25.02A180.183,180.183,0,0,0,182.25,112H142.1A144.587,144.587,0,0,1,209.31,63.77ZM131.33,128h45.9a271.6,271.6,0,0,0-9.12,64H112.23A142.886,142.886,0,0,1,131.33,128Zm-19.1,80h55.88a271.6,271.6,0,0,0,9.12,64h-45.9A142.886,142.886,0,0,1,112.23,208Zm29.87,80h40.15a180.183,180.183,0,0,0,10.1,23.21,126.6,126.6,0,0,0,16.96,25.02A144.587,144.587,0,0,1,142.1,288Zm64.41,15.75A160.25,160.25,0,0,1,199.33,288H248v55.07C232.66,339.53,218.16,325.89,206.51,303.75ZM256,448a8,8,0,1,1,8-8A8.011,8.011,0,0,1,256,448Zm168-72a24,24,0,0,1,48,0v24H424Zm64,88H408V416h80Z" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="or_divider">
                            <span>or</span>
                        </div>
                        <div>
                            <Button className="signupBtn">SIGN IN/UP WITH EMAIL</Button>
                        </div>
                        <div className="statement_para">
                            <p>Torus is a trusted service that makes login in easy with popular social accounts.
                            By login in your accept torus <a href=""> Terms and Conditions </a></p>
                            <p>The following sign in a third party authentication Apple Email GitHub Twitter LinkedIn and <a href="#">learn more</a></p>
                        </div>

                    </div>
                </div>
            </ModalBody>
        </Main>
    );
};

export default LoginModal;