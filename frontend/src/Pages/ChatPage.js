import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ChatSidebar from '../Components/Chat/ChatSideBar';
import ChatWindow from '../Components/Chat/ChatWindow';

const ChatPage = () => {
  const [activeChatId, setActiveChatId] = useState(null);

  const handleChatSelect = (id) => {
    setActiveChatId(id);
  };

  return (
    <Container fluid>
      <Row>
        <Col md={4} className="p-0 mt-5">
          <ChatSidebar onChatSelect={handleChatSelect} />
        </Col>
        <Col md={8} className="p-0 pl-3 ml-2 mt-5 border-bottom-0 border-top-0">
          <ChatWindow chatId={activeChatId} />
        </Col>
      </Row>
    </Container>
  );
};

export default ChatPage;
