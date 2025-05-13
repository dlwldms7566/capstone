import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "../styles/Chat.module.css";
import { useNavigate } from "react-router-dom";
import { MdOutlineSupportAgent } from "react-icons/md";
import { FaBalanceScale } from "react-icons/fa";
import { HiOutlineDocumentSearch } from "react-icons/hi";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState("initial");
  const [roadType, setRoadType] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [inputOptions, setInputOptions] = useState([]);
  const [aiResultId, setAiResultId] = useState(null);

  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setMessages([
        { role: "AI", content: "안녕하세요! 사고 분석을 도와드릴 과시리입니다. 먼저 도로 유형을 선택해주세요." }
      ]);
      setInputOptions(["교차로", "고속도로", "일반도로"]);
      setStep("awaitingRoadType");
    }
  }, []);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOptionSubmit = async () => {
    if (!selectedOption) return;

    if (step === "awaitingRoadType") {
      const currentRoadType = selectedOption;
      setRoadType(currentRoadType);
      setMessages(prev => [
        ...prev,
        { role: "user", content: currentRoadType },
        { role: "AI", content: "정보가 성공적으로 전송되었습니다. 블랙박스 영상을 업로드해주세요." }
      ]);
      setSelectedOption("");
      setInputOptions([]);
      setStep("awaitingVideoUpload");

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("토큰 없음: 로그인 필요");
        return;
      }

      try {
        const res = await axios.post(
          "http://172.16.41.240:8080/ai-result/init",
          {
            road_type: currentRoadType,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        );
        setAiResultId(res.data.id);
      } catch (error) {
        console.error("AI 결과 초기화 실패:", error);
        setMessages(prev => [
          ...prev,
          { role: "AI", content: "서버에 접속할 수 없습니다. 나중에 다시 시도해주세요." }
        ]);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !roadType) return;

    const fileURL = URL.createObjectURL(file);

    setMessages(prev => [
      ...prev,
      { role: 'user', content: fileURL, isVideo: true },
      { role: 'AI', content: '영상 분석중...', id: 'loading' }
    ]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userID", localStorage.getItem("userID"));
    formData.append("ai_result_id", aiResultId);

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("토큰 없음: 로그인 필요");
      return;
    }

    try {
      const response = await fetch("http://172.16.41.240:8080/video/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("업로드 실패");
      const result = await response.json();

      const { labels_detected } = result.ai_result;
      const { analysis, similar_case, explanation, question, needs_confirmation } = labels_detected;

      if (needs_confirmation) {
        setStep("awaitingUserAnswer");
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== 'loading'),
          {
            role: "AI",
            content: `분석 결과에 불확실한 항목이 있습니다. 다음 질문에 답해주세요: ${question}`
          }
        ]);
        return;
      }

      const analysisItems = Object.entries(analysis || {}).map(([key, value], i) => (
        <p key={i}><strong>{key}:</strong> {String(value)}</p>
      ));

      const similar = similar_case ? (
        <div>
          <p><strong>유사 판례:</strong></p>
          <p>유사도: {similar_case.score}</p>
          <p>상황: {similar_case.situation}</p>
          <p>최종 과실 비율: {similar_case.final_ratio}</p>
        </div>
      ) : null;

      const explanationBlock = explanation ? (
        <p><strong>설명:</strong> {explanation}</p>
      ) : null;

      const questionBlock = question ? (
        <p style={{ color: "red" }}><strong>추가 질문:</strong> {question}</p>
      ) : null;

      setMessages(prev => [
        ...prev.filter(msg => msg.id !== 'loading'),
        { role: 'AI', content: '분석이 완료되었습니다. 결과를 확인해주세요.' },
        {
          role: 'AI',
          content: (
            <div style={{ maxWidth: '240px', marginTop: '10px', textAlign: 'left' }}>
              <p style={{ fontWeight: 'bold' }}>분석 결과</p>
              {analysisItems}
              {similar}
              {explanationBlock}
              {questionBlock}
            </div>
          )
        }
      ]);

    } catch (error) {
      console.error("파일 업로드 또는 분석 실패:", error);
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== 'loading'),
        { role: 'AI', content: '파일 업로드 중 문제가 발생했습니다. 다시 시도해주세요.' }
      ]);
    }
  };


  const handleUserAnswerSubmit = async (userAnswer) => {
    const token = localStorage.getItem("token");
    const userID = localStorage.getItem("userID");

    if (!token || !userID || !aiResultId) {
      console.error("필수 정보 누락 (token, userID, aiResultId)");
      return;
    }

    try {
      const res = await axios.post(
        "http://172.16.41.240:8080/analyze/update-analysis",
        {
          userID: parseInt(userID),
          ai_result_id: aiResultId,
          user_answer: userAnswer,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      const result = res.data;
      const { labels_detected } = result;
      const { analysis, similar_case, explanation, question } = labels_detected;

      const analysisItems = Object.entries(analysis || {}).map(([key, value], i) => (
        <p key={i}><strong>{key}:</strong> {String(value)}</p>
      ));

      const similar = similar_case ? (
        <div>
          <p><strong>유사 판례:</strong></p>
          <p>유사도: {result.similar_case.score}</p>
          <p>상황: {result.similar_case.situation}</p>
          <p>최종 과실 비율: {result.similar_case.final_ratio}</p>
        </div>
      ) : null;

      const explanationBlock = explanation ? (
        <p><strong>설명:</strong> {result.explanation}</p>
      ) : null;

      const questionBlock = question ? (
        <p style={{ color: "red" }}><strong>추가 질문:</strong> {result.question}</p>
      ) : null;

      setMessages(prev => [
        ...prev,
        { role: "user", content: userAnswer },
        {
          role: "AI",
          content: (
            <div style={{ maxWidth: "240px", marginTop: "10px", textAlign: "left" }}>
              <p style={{ fontWeight: "bold" }}>갱신된 분석 결과</p>
              {analysisItems}
              {similar}
              {explanationBlock}
              {questionBlock}
            </div>
          )
        }
      ]);

    } catch (err) {
      console.error("분석 갱신 실패:", err);
      setMessages(prev => [
        ...prev,
        { role: "AI", content: "추가 분석 중 오류가 발생했습니다. 다시 시도해주세요." }
      ]);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: input.trim() }]);
    setInput("");
  };

  return (
    <div>
      <a href="/">
        <img className={styles.logo} src="/logo.png" alt="로고" />
      </a>

      <button className={styles.LogIn} onClick={() => window.location.reload()}>새 채팅</button>
      <button className={styles.Join} onClick={() => navigate("/signup")}>채팅 기록</button>

      <div className={styles.ChatContainer} ref={chatContainerRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.messageWrapper} ${msg.role === "AI" ? styles.aiWrapper : styles.userWrapper}`}>
            {msg.role === "AI" && <img src="/ai.png" alt="AI" className={styles.avatar} />}
            <div className={`${styles.message} ${msg.role === "AI" ? styles.aiMessage : styles.userMessage}`}>
              {msg.isVideo ? (
                <video controls width="250" src={msg.content} className={styles.videoPreview} poster="/video_thumbnail.png" />
              ) : typeof msg.content === "string" ? (
                <span>{msg.content}</span>
              ) : (
                msg.content
              )}
            </div>
            {msg.role === "user" && <img src="/user.png" alt="User" className={styles.avatar} />}
          </div>
        ))}
      </div>

      <div className={styles.ChatInputContainer}>
        <div className={styles.InputContainer}>
          {step === "awaitingUserAnswer" && (
            <div className={styles.SelectInputWrapper}>
              <input
                type="text"
                className={styles.ChatInput}
                placeholder="추가 설명을 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                className={styles.SendButton}
                onClick={() => {
                  handleUserAnswerSubmit(input);
                  setInput("");
                  setStep("finished");
                }}
              >
                <img src="/send.png" alt="Send" className={styles.sendIcon} />
              </button>
            </div>
          )}

          {inputOptions.length > 0 ? (
            <div className={styles.SelectInputWrapper}>
              <div className={styles.OptionList}>
                {inputOptions.map((opt, i) => (
                  <label key={i} className={styles.radioOption}>
                    <input type="radio" name="selectOption" value={opt} checked={selectedOption === opt} onChange={() => setSelectedOption(opt)} />
                    {opt}
                  </label>
                ))}
              </div>
              <button className={styles.SendButton} onClick={handleOptionSubmit}>
                <img src="/send.png" alt="Send" className={styles.sendIcon} />
              </button>
            </div>
          ) : (
            <>
              <label htmlFor="fileUpload" className={styles.AttachButton}>
                <img src="/attach.png" alt="Attach" className={styles.attachIcon} />
              </label>
              <input id="fileUpload" type="file" style={{ display: "none" }} onChange={handleFileUpload} />
              <input type="text" className={styles.ChatInput} ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} />
              <button className={styles.SendButton} onClick={handleSendMessage}>
                <img src="/send.png" alt="Send" className={styles.sendIcon} />
              </button>
            </>
          )}
        </div>

        {/* <div className={styles.Divider}></div>

        <div className={styles.ButtonContainer}>
          <label htmlFor="fileUpload" className={styles.AttachButton}>
            <img src="/attach.png" alt="Attach" className={styles.attachIcon} />
          </label>
          <input id="fileUpload" type="file" style={{ display: "none" }} onChange={handleFileUpload} />
          <button className={styles.search}><HiOutlineDocumentSearch /> 유사 판례 보기</button>
          <button className={styles.reason}><MdOutlineSupportAgent /> 대처 방법 보기</button>
          <button className={styles.reason}><FaBalanceScale /> 관련 법률 보기</button>
        </div> */}
      </div>

      <p className={styles.refer}>과시리의 판단에 오류가 있을 수 있으며 법적 효력이 없습니다.</p>
    </div>
  );
}

export default Chat;
