import React, { useEffect, useState } from "react";
import { fetchProtectedData } from "../../services/authService";  // 서비스에서 데이터 요청 함수 가져오기

const Dashboard = () => {
  const [data, setData] = useState(null);  // 데이터를 저장할 상태
  const [loading, setLoading] = useState(true);  // 로딩 상태
  const [error, setError] = useState(null);  // 에러 상태

  // 컴포넌트가 로드될 때 보호된 데이터를 가져옴
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchProtectedData();  // 보호된 데이터 요청
        setData(result);  // 데이터를 상태에 저장
        setLoading(false);  // 로딩 상태 해제
      } catch (err) {
        setError(err.message);  // 에러 메시지 저장
        setLoading(false);  // 로딩 상태 해제
      }
    };

    loadData();  // 데이터 로드 함수 호출
  }, []);

  // 로딩 중일 때 표시할 내용
  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 에러 발생 시 표시할 내용
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Protected Dashboard</h1>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>  // 데이터가 있을 경우 JSON으로 출력
      ) : (
        <p>데이터가 없습니다.</p>  // 데이터가 없을 때
      )}
    </div>
  );
};

export default Dashboard;