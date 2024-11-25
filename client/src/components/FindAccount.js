import React, { useState } from "react";
import { findAccount } from "../services/authService"; // 서비스 호출
import "../styles/FindAccount.css";

const FindAccount = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const successMessage = await findAccount(email); // 서비스 호출
            setMessage(successMessage);
        } catch (errorMessage) {
            setMessage(errorMessage); // 오류 메시지 설정
        }
    };

    return (
        <div className="find-account-container">
            <div className="find-account-card">
                <h2>Find Your Account</h2>
                <p>학교 이메일을 입력하면 카카오 계정의 닉네임 정보를 확인할 수 있습니다.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            className="find-account-input"
                            placeholder="Enter your school email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="find-account-button">Find Account</button>
                    </div>
                </form>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default FindAccount;