import React from "react";
import { getKakaoAuthUrl } from "../services/authService";
import "../styles/KakaoLogin.css";
import { Link } from "react-router-dom";

const KakaoLogin = () => {
  const kakaoLoginUrl = getKakaoAuthUrl(); // 인증 URL 가져오기

  return (
    <div className="form-container">
      <div className="form-box">
        <h1 className="form-title">E-ffeeChat</h1>
        <p className="form-info">
           E-ffeeChat은 이화여자대학교 재학생 및 졸업생을 위한 커뮤니티입니다. 
           학교 이메일 인증 후 이용 가능합니다.
        </p>
        <a href={kakaoLoginUrl} className="kakao-button">
          <img
            src="img/kakao_login_large_wide.png"
            alt="Kakao Login"
            className="kakao-button-image"
          />
        </a>
        <p className="form-footer">
          Forgot your account? <Link to="/find-account">Find it here</Link>
        </p>
      </div>
    </div>
  );
};

export default KakaoLogin;
