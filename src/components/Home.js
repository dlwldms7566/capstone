import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home-container">
      {/* 헤더 */}
      <header className="header">
        <div className="left-group">
         <img src="/logo.png" alt="과시리 로고" className="logo" />
         <nav className="nav-links">
         <Link to="/intro">소개</Link>     
         <Link to="/faq">FAQ</Link> 
         </nav>
        </div>
        <div className="right-group">
         <Link to="/login">로그인</Link>
         <Link to="/signup">회원가입</Link>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="main-content">
        <div className="text-section">
          <h1>
            <span className="highlight">교통사고 과실 분석,</span><br />
            AI 과시리에게 맡기세요!
          </h1>
          <Link to="/chat" className="upload-button">
            블랙박스 영상 업로드 하러가기
          </Link>
          <p className="description">
            <span className="highlight2">
            AI 영상분석
            <img src="/analysis_icon.png" alt="아이콘" className="analysis-icon" />
            </span>
            <br />
            과시리는 교통사고 블랙박스 영상을 분석하여 과실 비율을 측정해줍니다.
          </p>
        </div>
        <div className="background-circle"></div>
        <div className="background-circle2"></div>
        <div className="image-section">
          <img src="/robot.png" alt="AI 캐릭터" className="robot-img" />
        </div>
      </main>
    </div>
  );
}

export default Home;
