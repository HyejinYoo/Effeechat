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

// 로그아웃 함수
export const logout = () => {
  localStorage.removeItem('jwt_token');  // 로컬 스토리지에서 JWT 토큰 삭제
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
      throw new Error('User is not authenticated');
    }
  } catch (error) {
    console.error('Error fetching user ID:', error);
    logout();  // 오류가 발생하면 로그아웃 처리
    throw error;
  }
};