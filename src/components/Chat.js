import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import styles from "../styles/Chat.module.css";
import { useNavigate } from "react-router-dom";
import { MdOutlineSupportAgent } from 'react-icons/md';
import { FaBalanceScale } from 'react-icons/fa';
import { HiOutlineDocumentSearch } from 'react-icons/hi';

function Chat() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState("initial");
  const [accidentType, setAccidentType] = useState(null);
  const [roadType, setRoadType] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [inputOptions, setInputOptions] = useState([]);

  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  const token = useRef(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setMessages(prev => [
        ...prev,
        { role: 'AI', content: '안녕하세요! 사고 분석을 도와드릴 과시리입니다. 먼저 사고 유형을 선택해주세요.' }
      ]);
      setInputOptions(['자동차 대 자동차', '자동차 대 보행자']);
      setStep("awaitingAccidentType");
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) token.current = storedToken;
  }, []);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOptionSubmit = () => {
    if (!selectedOption) return;
    setMessages(prev => [...prev, { role: 'user', content: selectedOption }]);

    if (step === 'awaitingAccidentType') {
      setAccidentType(selectedOption);
      setSelectedOption("");
      setInputOptions(['교차로', '고속도로', '일반도로']);
      setStep("awaitingRoadType");
      setMessages(prev => [...prev, { role: 'AI', content: '사고가 발생한 도로 유형을 선택해주세요.' }]);
    } else if (step === 'awaitingRoadType') {
      const finalAccidentType = accidentType;
      const finalRoadType = selectedOption;
      setRoadType(finalRoadType);
      setSelectedOption("");
      setInputOptions([]);
      submitAccidentInfo(finalAccidentType, finalRoadType);
    }
  };

  const submitAccidentInfo = async (accType, roadType) => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://172.16.41.240:8080/video/upload', {
        accident_type: accType,
        road_type: roadType
      }, {
        headers: {
          'Authorization': `Bearer ${token.current}`,
          'Content-Type': 'application/json'
        }
      });

      setMessages(prev => [...prev, {
        role: 'AI',
        content: '정보가 성공적으로 전송되었습니다. 블랙박스 영상을 업로드해주세요.'
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'AI',
        content: `오류가 발생했습니다: ${err.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return;
    const newMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  return (
    <div>
      <a href="/">
        <img className={styles.logo} src="/logo.png" alt="로고" />
      </a>

      <button className={styles.LogIn} onClick={() => window.location.reload()}>새 채팅</button>
      <button className={styles.Join} onClick={() => navigate("/signup")}>채팅 기록</button>

      <div className={styles.ChatContainer} ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`${styles.messageWrapper} ${message.role === 'AI' ? styles.aiWrapper : styles.userWrapper}`}>
            {message.role === 'AI' && (
              <img src="/ai.png" alt="AI" className={styles.avatar} />
            )}
            <div className={`${styles.message} ${message.role === 'AI' ? styles.aiMessage : styles.userMessage}`}>
              <span>{message.content}</span>
            </div>
            {message.role === 'user' && (
              <img src="/user.png" alt="User" className={styles.avatar} />
            )}
          </div>
        ))}
      </div>

      <div className={styles.ChatInputContainer}>
        <div className={styles.InputContainer}>
          {inputOptions.length > 0 ? (
            <div className={styles.SelectInputWrapper}>
              <div className={styles.OptionList}>
                {inputOptions.map((option, i) => (
                  <label key={i} className={styles.radioOption}>
                    <input
                      type="radio"
                      name="selectOption"
                      value={option}
                      checked={selectedOption === option}
                      onChange={() => setSelectedOption(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
              <button className={styles.SendButton} onClick={handleOptionSubmit}>
                <img src="/send.png" alt="Send" className={styles.sendIcon} />
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                className={styles.ChatInput}
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder=""
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button className={styles.SendButton} onClick={handleSendMessage}>
                <img src="/send.png" alt="Send" className={styles.sendIcon} />
              </button>
            </>
          )}
        </div>

        <div className={styles.Divider}></div>

        <div className={styles.ButtonContainer}>
          <label htmlFor="fileUpload" className={styles.AttachButton}>
            <img src="/attach.png" alt="Attach" className={styles.attachIcon} />
          </label>
          <input
            id="fileUpload"
            type="file"
            style={{ display: 'none' }}
            onChange={() => {}}
          />

          <button className={styles.search}><HiOutlineDocumentSearch className={styles.searchIcon2} />유사 판례 보기</button>
          <button className={styles.reason}><MdOutlineSupportAgent className={styles.reasonIcon} />대처 방법 보기</button>
          <button className={styles.reason}><FaBalanceScale className={styles.lawIcon} />관련 법률 보기</button>
        </div>
      </div>

      <p className={styles.refer}>과시리의 판단에 오류가 있을 수 있으며 법적 효력이 없습니다.</p>
    </div>
  );
}

export default Chat;
