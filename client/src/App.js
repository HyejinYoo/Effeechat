import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import KakaoLogin from "./components/Auth/KakaoLogin";
import ChatRoomList from "./components/ChatRoom/ChatRoomList";
import ChatRoom from "./components/ChatRoom/ChatRoom";
import LogoutButton from "./components/Auth/LogoutButton";
import { fetchUserId } from "./services/authService";
import io from 'socket.io-client';  // socket.io-client import

const API_URL = process.env.REACT_APP_API_URL;  // 환경 변수에서 API URL 가져오기

let socket;  // 전역 소켓 변수

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userId = await fetchUserId();
        if (userId) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    // 소켓 연결 (한 번만 생성)
    if (!socket) {
      socket = io(API_URL);  // 소켓을 전역적으로 한 번만 연결
      socket.on('connect', () => {
        console.log('Connected to server:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server:', socket.id);
      });
    }

    checkAuthStatus();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <ChatRoomList /> : <Navigate to="/login" />
          }
        />
        
        <Route
          path="/login"
          element={
            isAuthenticated === false ? <KakaoLogin /> : <Navigate to="/" />
          }
        />

        <Route path="/logout" element={<LogoutButton />} />

        <Route
          path="/chatroom/:roomId"
          element={
            isAuthenticated ? <ChatRoom socket={socket} /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;