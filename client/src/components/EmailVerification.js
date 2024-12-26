import React, { useState, useEffect } from "react";
import {
    sendEmailVerificationCode,
    verifyAndCreateUser,
    checkDuplicateEmail,
} from "../services/authService";
import "../styles/EmailVerification.css"; // 스타일 파일 추가

const EmailVerification = () => {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [nickname, setNickname] = useState("");
    const [kakaoId, setKakaoId] = useState("");
    const [step, setStep] = useState(1);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const emailFromUrl = "";
        const nicknameFromUrl = queryParams.get("nickname");
        const kakaoIdFromUrl = queryParams.get("kakaoId");

        if (emailFromUrl) setEmail(emailFromUrl);
        if (nicknameFromUrl) setNickname(nicknameFromUrl);
        if (kakaoIdFromUrl) setKakaoId(kakaoIdFromUrl);
    }, []);

    const handleSendCode = async () => {
        if (!email) {
            alert("이메일을 입력하세요.");
            return;
        }

        try {

            // 중복 확인
            const duplicateMessage = await checkDuplicateEmail(email);
            if (duplicateMessage === "이미 가입된 이메일입니다.") {
                alert(duplicateMessage);
                return;
            }

            // 중복 확인 통과 시 인증 코드 전송
            await sendEmailVerificationCode(email);
            setStep(2);
            alert("인증 코드가 이메일로 전송되었습니다.");
        } catch (error) {
            if (error.response && error.response.status === 400) {
                // 서버에서 400 상태 코드를 반환한 경우
                alert(error.response.data.message); // 서버의 에러 메시지 표시
            } else {
                // 기타 에러
                alert("인증 코드 전송에 실패했습니다.");
            }
        }
    };

    const handleVerifyCode = async () => {
        if (!email || !code || !nickname || !kakaoId) {
            alert("모든 필드를 입력하세요.");
            return;
        }

        try {
            const data = await verifyAndCreateUser(email, code, nickname, kakaoId);
            alert(data.message);

            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            }
        } catch (error) {
            alert("인증에 실패했습니다.");
        }
    };

    return (
        <div className="email-verification-container">
            <div className="verification-card">
                {step === 1 && (
                    <div className="verification-step">
                        <h2>이메일 인증</h2>
                        <p className="instruction">
                            인증을 위해 <strong>이화여자대학교 이메일(e.g., yourname@ewhain.net)</strong>을 입력한 후<br />
                            인증 코드를 요청하세요.<br />
                            이 이메일은 계정 등록 및 복구에 사용됩니다.
                        </p>
                        <input
                            className="input-field"
                            type="email"
                            placeholder="이메일을 입력하세요."
                            value={email || ""}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button className="primary-button" onClick={handleSendCode}>
                            인증 코드 받기
                        </button>
                    </div>
                )}
                {step === 2 && (
                    <div className="verification-step">
                        <h2>인증 코드 입력</h2>
                        <p className="instruction">
                            입력하신 <strong>이화여대 이메일</strong>로 발송된 6자리 인증 코드를 입력하세요. 
                            코드는 10분 동안 유효합니다. 인증이 완료되면 회원가입 절차가 이어집니다.
                        </p>
                        <input
                            className="input-field"
                            type="text"
                            placeholder="6자리 인증 코드를 입력하세요"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <button className="primary-button" onClick={handleVerifyCode}>
                            확인
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailVerification;