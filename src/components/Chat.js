import React, { useState, useEffect, useRef } from "react";
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
import { TbWorldSearch } from 'react-icons/tb'; 
import { MdOutlineSupportAgent } from 'react-icons/md'; 
import { FaBalanceScale } from 'react-icons/fa';
import { HiOutlineDocumentSearch } from 'react-icons/hi'; 
import { PiScalesDuotone } from 'react-icons/pi';

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

  // const handleSendMessage = async () => {
  //   if (!input.trim() || isLoading) return;

  //   setIsChatting(true);

    // const newMessage = { role: 'user', content: input.trim() };
    // setInput('');  // 입력 필드를 초기화
    // setMessages(prev => [...prev, newMessage]);
    // setIsLoading(true);

    // try {
    //   if (!token.current) {
    //     throw new Error('인증 토큰이 없습니다.');
    //   }

    //   const response = await fetch('http://172.16.41.240:8080/query', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${token.current}`
    //     },
    //     body: JSON.stringify({ requestMessage: newMessage.content })
    //   });

    //   if (!mounted.current) return;

    //   if (!response.ok) {
    //     throw new Error('서버 응답이 올바르지 않습니다.');
    //   }

    //   const result = await response.json();
    //   console.log(result)
    //   if (!mounted.current) return;

    //   if (result.success || result.responseMessage) {
    //     setMessages(prev => [...prev, {
    //       role: 'ai',
    //       content: result.responseMessage
  //     }]);
  //   } else {
  //     throw new Error('응답 메시지를 받지 못했습니다.');
  //   }
  // } catch (error) {
  //   console.error('Error:', error);
  //   if (mounted.current) {
  //     setMessages(prev => [...prev, {
  //       role: 'ai',
  //       content: `오류가 발생했습니다: ${error.message}`
  //     }]);
  //   }
  // } finally {
  //   if (mounted.current) {
  //     setIsLoading(false);
  //   }
  // }
  // };

  return (
    <div>
      <a href="/">
        <img className={styles.logo} src="/logo.png" alt="로고" />
      </a>

      <button className={styles.LogIn} onClick={handleNewChat}>새 채팅</button>
      <button className={styles.Join} onClick={() => navigate("/signup")}>채팅 기록</button >

      {isChatting && (
        <div className={styles.ChatContainer} ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.message} ${message.role === 'AI' ? styles.aiMessage : styles.userMessage}`}
            >
              {message.content}
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