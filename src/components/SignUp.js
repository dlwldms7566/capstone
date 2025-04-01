import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/SignUp.module.css";

function SignUp() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        isAllAgreed: false,
        isAgreed: false,
        privacy: false,
        ad: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAllCheck = () => {
        const newState = !formData.isAllAgreed;
        setFormData({
            ...formData,
            isAllAgreed: newState,
            isAgreed: newState,
            privacy: newState,
            ad: newState
        });
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        
        setFormData((prev) => {
            const updatedState = {
                ...prev,
                [name]: checked, 
            };
    
            const allChecked = updatedState.isAgreed && updatedState.privacy && updatedState.ad;
            updatedState.isAllAgreed = allChecked;
    
            return updatedState;
        });
    };
    

const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // try {
        //     const requestData = {
        //         email: formData.email,
        //         password: formData.password,
        //         name: formData.name
        //     };
        //     const response = await fetch('http://172.16.41.240:8080/auth/signup', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify(requestData),
        //     });
        //     console.log(requestData)
        //     const responseData = await response.json();
        //     console.log(responseData)
        //     if (response.ok) {
        //         alert('회원가입 성공! 로그인해주세요.');
        //         navigate('/signin');
        //     } else {
        //         alert(`회원가입 실패: ${responseData.message || '알 수 없는 오류가 발생했습니다.'}`);
        //     }
        // } catch (error) {
        //     console.error('회원가입 에러:', error);
        //     alert('회원가입 처리 중 오류가 발생했습니다.');
        // } finally {
        //     setIsLoading(false);
        // }
    };

    return (
        <div className={styles.container}>
            <div className={styles.signupBox}>
                <div className="logo_title">
                    <img src="/logo.png" alt="로고" />
                    <h2 className={styles.title}>과시리</h2>
                </div>
                <form onSubmit={handleSubmit} className={styles.form}>

                    <div>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            placeholder="이름"
                        />
                    </div>

                    <div>
                        <input
                            type="id"
                            name="id"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            placeholder="아이디"
                        />
                    </div>

                    <div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            placeholder="이메일 주소"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            placeholder="비밀번호"
                        />
                    </div>
                    8~20자 영문 대소문자, 숫자, 특수문자 중 2가지 이상 조합
                    <div>
                        <input
                            type="password check"
                            name="password check"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            placeholder="비밀번호 다시 입력"
                        />
                    </div>

                    <div>
                        <input
                            type="birthday"
                            name="birthday"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            placeholder="생년월일(8자리)"
                        />
                    </div>

                    <div>
                        <input
                            type="phone"
                            name="phone"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            placeholder="휴대전화번호"
                        />
                    </div>

                    <div className={styles.gender}>
                        성별
                        <label>
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                onChange={handleChange}
                                checked={formData.gender === "male"}
                            />
                            남
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                onChange={handleChange}
                                checked={formData.gender === "female"}
                            />
                            여
                        </label>
                    </div>

                    <div className={styles.checkboxContainer}>
                        <label>
                            <input
                                type="checkbox"
                                name="isAllAgreed"
                                checked={formData.isAllAgreed}
                                onChange={handleAllCheck}
                            />
                            아래 내용에 모두 동의합니다{" "}
                            <a className={styles.policy} href="https://openai.com/policies/terms-of-use/" target="_blank" rel="noopener noreferrer">
                                자세히 보기
                            </a>
                        </label>
                    </div>

                    <div className={styles.checkboxContainer}>
                        <label>
                            <input
                                type="checkbox"
                                name="isAgreed"
                                checked={formData.isAgreed}
                                onChange={handleCheckboxChange}
                                required
                            />
                            (필수) 이용약관에 동의합니다.{" "}
                            <a className={styles.policy} href="https://openai.com/policies/terms-of-use/" target="_blank" rel="noopener noreferrer">
                                자세히 보기
                            </a>
                        </label>
                    </div>

                    <div className={styles.checkboxContainer}>
                        <label>
                            <input
                                type="checkbox"
                                name="privacy"
                                checked={formData.privacy}
                                onChange={handleCheckboxChange}
                                required
                            />
                            (필수) 개인정보 수집 및 이용에 대한 안내에 동의합니다.{" "}
                            <a className={styles.policy} href="https://openai.com/policies/terms-of-use/" target="_blank" rel="noopener noreferrer">
                                자세히 보기
                            </a>
                        </label>
                    </div>

                    <div className={styles.checkboxContainer}>
                        <label>
                            <input
                                type="checkbox"
                                name="ad"
                                checked={formData.ad}
                                onChange={handleCheckboxChange}
                            />
                            (선택) 홍보성 정보 수신에 동의합니다.{" "}
                            <a className={styles.policy} href="https://openai.com/policies/terms-of-use/" target="_blank" rel="noopener noreferrer">
                                자세히 보기
                            </a>
                        </label>
                    </div>

                    <button type="submit" className={styles.button}>
                        회원가입
                    </button>
                </form>
                {/* <p className={styles.loginText}>
                    이미 계정이 있으신가요?{" "}
                    <span className={styles.loginLink} onClick={() => navigate("/login")}>
                        로그인
                    </span>
                </p>
                <div className={styles.bottom}>
                    <a className={styles.loginLink} href="https://openai.com/policies/terms-of-use/">
                        <span>이용약관     </span>
                    </a>
                    |
                    <a className={styles.loginLink} href="https://openai.com/policies/privacy-policy/">
                        <span>     개인정보 보호 정책</span>
                    </a>
                </div> */}
            </div>
        </div>
    );
}

export default SignUp;