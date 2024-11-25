import axios from "axios";
import { jwtDecode } from 'jwt-decode'; // 올바른 import

// 환경 변수에서 API URL 가져오기
const API_URL = process.env.REACT_APP_API_URL;

// 카카오 인증 URL 생성 함수
export const getKakaoAuthUrl = () => {
  const REACT_APP_REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
  const REACT_APP_REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI;
  
  return `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REACT_APP_REST_API_KEY}&redirect_uri=${REACT_APP_REDIRECT_URI}`;
};


// 보호된 데이터 요청 함수 (쿠키 기반)
export const fetchProtectedData = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/check`, {
      withCredentials: true,  // 쿠키를 포함하여 요청
    });
    return response.data;  // 받아온 데이터 반환
  } catch (error) {
    console.error("Error fetching protected data:", error);
    throw new Error("데이터를 가져오는 데 실패했습니다.");  // 에러 발생 시 예외 던짐
  }
};

export const logout = async () => {
  try {
    // 서버로 로그아웃 요청
    await axios.post(`${API_URL}/api/auth/logout`, null, {
      withCredentials: true, // 쿠키를 포함하여 요청
    });

    // 클라이언트에서도 로컬 스토리지 JWT 삭제
    localStorage.removeItem('jwt_token');
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

// JWT 토큰 유효성 확인 함수
export const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // JWT Payload 디코드
    const currentTime = Math.floor(Date.now() / 1000); // 현재 시간 (초 단위)
    return decodedToken.exp > currentTime; // 만료 시간 확인
  } catch (error) {
    console.error("Invalid token format", error);
    return false;
  }
};


// 사용자 ID 가져오기 (인증 체크)
export const fetchUserId = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/check`, {
      withCredentials: true, // 쿠키를 포함하여 인증 처리
    });

    if (response.data.isAuthenticated) {
      return response.data.userId;
    } else {
      logout();  // 인증되지 않은 경우 로그아웃 처리
      return false;
    }
  } catch (error) {
    console.error('Error fetching user ID:', error);
    logout();  // 오류가 발생하면 로그아웃 처리
    return false
  }
};


export const sendEmailVerificationCode = async (email) => {
  try {
      const response = await axios.post(`${API_URL}/api/auth/send-email`, { email });
      return response.data;
  } catch (error) {
      console.error("Error sending email verification code:", error);
      throw error;
  }
};

// 이메일 인증 코드 검증 및 회원 생성
export const verifyAndCreateUser = async (email, code, nickname, kakaoId) => {
  try {
      const response = await axios.post(`${API_URL}/api/auth/verify-and-create-user`, {
          email,
          code,
          nickname,
          kakaoId,
      });
      return response.data;
  } catch (error) {
      console.error("Error verifying code or creating user:", error);
      throw error;
  }
};


// 계정 찾기 서비스
export const findAccount = async (schoolEmail) => {
  try {
      const response = await axios.post(`${API_URL}/api/auth/find-account`, { schoolEmail });
      return response.data.message; // 성공 메시지 반환
  } catch (error) {
      // 오류 메시지 반환
      throw error.response?.data?.message || "계정을 찾는 중 오류가 발생했습니다.";
  }
};