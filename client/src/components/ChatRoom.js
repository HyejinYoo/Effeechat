import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ChatRoom = ({ socket }) => {
  const { roomId } = useParams();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  
  useEffect(() => {
    // 방에 입장 (중복 호출 방지)
    if (socket) {
      socket.emit('join room', roomId);

      // 서버로부터 메시지 수신 (이벤트 중복 등록 방지)
      const handleMessage = (msg) => {
        console.log('Received message:', msg);
        setChatMessages((prevMessages) => [...prevMessages, msg.message || JSON.stringify(msg)]);
      };

      socket.on('chat message', handleMessage);

      return () => {
        // 이벤트 핸들러 해제 (중복 방지)
        socket.off('chat message', handleMessage);
        socket.emit('leave room', roomId);  // 방을 떠날 때 알림
      };
    }
  }, [roomId, socket]);
;

  const sendMessage = () => {
    socket.emit('chat message', { roomId, message });
    setMessage('');  // 메시지 입력창 비우기
  };

  return (
    <div>
      <h1>Welcome to Chat Room {roomId}</h1>

      <div>
        {chatMessages.map((msg, index) => (
          <div key={index}>{msg}</div>  // 메시지 표시
        ))}
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatRoom;