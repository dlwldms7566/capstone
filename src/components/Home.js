import React from "react";
import { useNavigate } from "react-router-dom"; 

export default function Home() {
    const navigate = useNavigate();

    return (
        <div>
            <button className="login-button" onClick={() => navigate("/login")}>로그인</button>
            <button className="login-button" onClick={() => navigate("/signup")}>회원가입</button>
            <button className="login-button" onClick={() => navigate("/chat")}>채팅</button>
        </div>
    );
}