import React, { useState, useEffect } from 'react'; 
import { fetchRooms, createRoom } from '../../services/chatRoomService'; 
import { fetchUserId } from '../../services/authService'; 
import { useNavigate } from 'react-router-dom';

const ChatRoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(null); 

  const navigate = useNavigate();

  // 사용자 ID를 서버에서 가져오기
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userId = await fetchUserId();
        setUserId(userId);
      } catch (error) {
        console.error(error);
      }
    };

    getUserId();
  }, []);

  // 채팅방 목록 가져오기
  useEffect(() => {
    const getRooms = async () => {
      try {
        const rooms = await fetchRooms();
        setRooms(rooms);
      } catch (error) {
        console.error(error);
      }
    };

    getRooms();
  }, []);

  // 채팅방 생성
  const handleCreateRoom = async () => {
    if (!userId) {
      console.error('User ID is not available.');
      return;
    }

    try {
      const createdRoom = await createRoom(roomName, description, userId); 
      console.log(createdRoom);
      setRoomName('');
      setDescription('');
      // 채팅방 목록 업데이트
      const updatedRooms = await fetchRooms();
      setRooms(updatedRooms);
    } catch (error) {
      console.error(error);
    }
  };

   // 채팅방 클릭 시 해당 채팅방으로 이동
  const handleRoomClick = (roomId) => {
    navigate(`/chatroom/${roomId}`);  // 해당 채팅방으로 이동
  };

  // 방 입장 가능 여부 확인 함수
  const canJoinRoom = (participants, maxParticipants, isOpen) => {
    return isOpen && participants < maxParticipants; 
  };

  // 채팅방 검색
  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Chat Rooms</h1>

      {/* 검색창 */}
      <input
        type="text"
        placeholder="Search rooms..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 채팅방 생성 폼 */}
      <div>
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleCreateRoom}>Create Room</button>
      </div>

      {/* 채팅방 목록 */}
      <ul>
        {filteredRooms.map((room) => (
          <li 
            key={room.id}
            onClick={() => handleRoomClick(room.id)}  // 채팅방 클릭 시 이동
            className={canJoinRoom(room.participants, room.max_participants, room.is_open) ? 'room-open' : 'room-full'}
          >
            <strong>{room.name}</strong>
            <p>{room.description}</p>
            <p>Participants: {room.participants}/{room.max_participants}</p>
            <p>Status: {room.is_open ? 'Open' : 'Closed'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatRoomList;