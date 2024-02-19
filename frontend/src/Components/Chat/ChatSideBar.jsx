import React, { useState, useEffect } from 'react'
import { ListGroup } from 'react-bootstrap';
import { useUserContext } from '../../Usercontext';
import axios from 'axios';

function ChatSideBar({ onChatSelect }) {
    const { userState } = useUserContext();
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const fetchAmigos = async () => {
          try {
            const response = await axios.get(`http://localhost:3001/usuario/amigos/${userState.id}`);
            setChats(response.data);
            console.log(response.data, "Amigos");
          } catch (error) {
            console.error("Error al cargar amigos:", error);
          }
        };
      
        fetchAmigos();
      }, [userState.id]);

  return (
    <ListGroup>
      {chats.map(chat => (
        <ListGroup.Item key={chat.ID} action onClick={() => onChatSelect(chat.ID)}>
          {chat.Mote}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

export default ChatSideBar