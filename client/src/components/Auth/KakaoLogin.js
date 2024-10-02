import React from "react";
import { getKakaoAuthUrl } from "../../services/authService";

const KakaoLogin = () => {
  const kakaoLoginUrl = getKakaoAuthUrl();  // 서비스에서 인증 URL 가져오기

  return (
    <div>
      <a href={kakaoLoginUrl}>
        <img src="img/kakao_login_medium_narrow.png" alt="Kakao Login" />
      </a>
    </div>
  );
};

export default KakaoLogin;