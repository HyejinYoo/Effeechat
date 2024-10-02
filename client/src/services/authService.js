import axios from "axios";


export const getKakaoAuthUrl = () => {
  const REACT_APP_REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
  const REACT_APP_REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI;
  
    return `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REACT_APP_REST_API_KEY}&redirect_uri=${REACT_APP_REDIRECT_URI}`;
  };


  export const logout = () => {
    localStorage.removeItem('jwt_token');  // 로컬 스토리지에서 JWT 토큰 삭제
  };


// 보호된 데이터 요청 함수 (쿠키 기반)
export const fetchProtectedData = async () => {
  try {
    const response = await axios.get("http://localhost:3001/auth/check", {
      withCredentials: true,  // 쿠키를 포함하여 요청
    });
    return response.data;  // 받아온 데이터 반환
  } catch (error) {
    console.error("Error fetching protected data:", error);
    throw new Error("데이터를 가져오는 데 실패했습니다.");  // 에러 발생 시 예외 던짐
  }
};


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
