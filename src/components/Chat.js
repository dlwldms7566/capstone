import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import styles from "../styles/Chat.module.css";
import { LuSquarePen } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { PiWaveformBold } from "react-icons/pi";
import { FaArrowUp } from "react-icons/fa6";
import { AiOutlineCode } from "react-icons/ai";
import { HiOutlineDocumentText } from "react-icons/hi";
import { HiOutlineEye } from "react-icons/hi";
import { RiGraduationCapLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { MdOutlineSupportAgent } from 'react-icons/md';
import { FaBalanceScale } from 'react-icons/fa';
import { HiOutlineDocumentSearch } from 'react-icons/hi';

function Chat() {

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  const token = useRef(null);
  const mounted = useRef(false);

  const initialAIMessage = {
    role: 'AI',
    content: "안녕하세요! 사고 당시 블랙박스 영상을 업로드해주세요.",
  };

  const handleNewChat = () => {
    setInput("");   
    setMessages([]); 
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setMessages(prevMessages => [...prevMessages, initialAIMessage]);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token.current = storedToken;
    }
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsChatting(true);

    const newMessage = { role: 'user', content: input.trim() };
    setInput(''); 
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      if (!token.current) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await axios.post(
        'http://172.16.41.240:8080/video/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token.current}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (!response.data.success) {
        throw new Error('파일 업로드에 실패했습니다.');
      }

      // Update the messages with AI's response or acknowledgment
      setMessages(prev => [
        ...prev,
        {
          role: 'AI',
          content: '파일이 성공적으로 업로드되었습니다. 추가적인 질문이 있으시면 알려주세요.'
        }
      ]);
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'AI',
          content: `파일 업로드 중 오류가 발생했습니다: ${error.message}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <a href="/">
        <img className={styles.logo} src="/logo.png" alt="로고" />
      </a>

      <button className={styles.LogIn} onClick={handleNewChat}>새 채팅</button>
      <button className={styles.Join} onClick={() => navigate("/signup")}>채팅 기록</button >

      {messages.length > 0 && (
        <div className={styles.ChatContainer} ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div
            key={index}
            className={`${styles.messageWrapper} ${message.role === 'AI' ? styles.aiWrapper : styles.userWrapper}`}
          >
            {message.role === 'AI' && (
              <img src="/ai.png" alt="AI" className={styles.avatar} />
            )}
            
            <div
              className={`${styles.message} ${message.role === 'AI' ? styles.aiMessage : styles.userMessage}`}
            >
              {message.isCustom ? message.content : <span>{message.content}</span>}
            </div>
        
            {message.role === 'user' && (
              <img src="/user.png" alt="User" className={styles.avatar} />
            )}
          </div>
          ))}
        </div>
      )}

      <div className={styles.ChatInputContainer}>
        <div className={styles.InputContainer}>

          {/* 입력창 */}
          <input
            type="text"
            className={styles.ChatInput}
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="아래 아이콘을 눌러 블랙박스 영상을 업로드하세요"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />

          {/* Send 버튼 */}
          <button className={styles.SendButton} onClick={handleSendMessage}>
            <img src="/send.png" alt="Send" className={styles.sendIcon} />
          </button>
        </div>

        {/* 가운데 선 */}
        <div className={styles.Divider}></div>

        {/* 첨부 버튼 */}
        <div className={styles.ButtonContainer}>
        <label htmlFor="fileUpload" className={styles.AttachButton}>
          <img src="/attach.png" alt="Attach" className={styles.attachIcon} />
        </label>
        <input
          id="fileUpload"
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(e)}
        />

        {/* 나머지 버튼들 */}
        <button className={styles.search}><HiOutlineDocumentSearch className={styles.searchIcon2} />유사 판례 보기</button>
        <button className={styles.reason}><MdOutlineSupportAgent className={styles.reasonIcon} />대처 방법 보기</button>
        <button className={styles.reason}><FaBalanceScale className={styles.lawIcon} />관련 법률 보기</button>
        </div>
      </div>

      <p className={styles.refer}>
        과시리의 판단에 오류가 있을 수 있으며 법적 효력이 없습니다.
      </p>
    </div>
  );
}

export default Chat;