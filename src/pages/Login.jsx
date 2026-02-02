import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import WindowFrame from '../components/WindowFrame'; // 경로 확인 필요

const Login = ({ onLogin }) => {
    // 🗂️ 로그인 상태
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');

    // 🗂️ 회원가입 상태
    const [showSignup, setShowSignup] = useState(false);
    const [signupData, setSignupData] = useState({
        loginId: '',
        password: '',
        passwordCheck: '',
        nickname: ''
    });

    // 🔴 [NEW] 중복 확인 통과 여부 상태
    const [isLoginIdChecked, setIsLoginIdChecked] = useState(false);
    const [isNicknameChecked, setIsNicknameChecked] = useState(false);

    // 📍 Refs (드래그 성능 및 오류 방지를 위해 필수)
    const nodeRef = useRef(null);

    // ==========================================
    // 🔐 로그인 로직
    // ==========================================
    const handleLogin = async () => {
        if (!loginId || !password) {
            alert('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        try {
            // POST /api/users/login
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loginId, password })
            });

            if (res.ok) {
                console.log("Login Success");
                if (onLogin) onLogin(); // 메인 화면 진입 함수 호출
            } else {
                alert('아이디 또는 비밀번호가 일치하지 않습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('로그인 중 오류가 발생했습니다. (서버 연결 확인 필요)');
        }
    };

    // ==========================================
    // 🆕 회원가입 & 중복확인 로직
    // ==========================================

    const handleSignupChange = (e) => {
        const { name, value } = e.target;
        setSignupData(prev => ({ ...prev, [name]: value }));

        // 🔴 [NEW] 사용자가 내용을 수정하면 중복 확인 상태를 초기화 (다시 검사해야 함)
        if (name === 'loginId') {
            setIsLoginIdChecked(false);
        }
        if (name === 'nickname') {
            setIsNicknameChecked(false);
        }
    };

    // 🆔 아이디 중복 확인
    const checkLoginId = async () => {
        if (!signupData.loginId) return alert('아이디를 입력해주세요.');

        try {
            const res = await fetch(`/api/users/check-loginid?loginId=${signupData.loginId}`);
            if (res.ok) {
                const isDuplicated = await res.json();
                if (isDuplicated) {
                    alert('이미 사용 중인 아이디입니다. 😢');
                    setIsLoginIdChecked(false); // 실패 시 false
                } else {
                    alert('사용 가능한 아이디입니다! 🎉');
                    setIsLoginIdChecked(true);  // 🔴 성공 시 true
                }
            } else {
                alert('중복 확인에 실패했습니다.');
                setIsLoginIdChecked(false);
            }
        } catch (e) {
            console.error("ID Check Error:", e);
            alert('서버와 연결할 수 없습니다.');
            setIsLoginIdChecked(false);
        }
    };

    // 🏷️ 닉네임 중복 확인
    const checkNickname = async () => {
        if (!signupData.nickname) return alert('닉네임을 입력해주세요.');

        try {
            const res = await fetch(`/api/users/check-nickname?nickname=${signupData.nickname}`);
            if (res.ok) {
                const isDuplicated = await res.json();
                if (isDuplicated) {
                    alert('이미 사용 중인 닉네임입니다. 😢');
                    setIsNicknameChecked(false); // 실패 시 false
                } else {
                    alert('멋진 닉네임이네요! 사용 가능합니다. 👍');
                    setIsNicknameChecked(true);  // 🔴 성공 시 true
                }
            } else {
                alert('중복 확인에 실패했습니다.');
                setIsNicknameChecked(false);
            }
        } catch (e) {
            console.error("Nickname Check Error:", e);
            alert('서버와 연결할 수 없습니다.');
            setIsNicknameChecked(false);
        }
    };

    // 🚀 회원가입 요청
    const handleSignupSubmit = async () => {
        const { loginId, password, passwordCheck, nickname } = signupData;

        if (!loginId || !password || !nickname) {
            return alert('모든 항목을 입력해주세요.');
        }

        // 🔴 [NEW] 중복 확인 여부 검사
        if (!isNicknameChecked) {
            return alert('닉네임 중복 확인을 해주세요! 🧐');
        }
        if (!isLoginIdChecked) {
            return alert('아이디 중복 확인을 해주세요! 🧐');
        }

        if (password !== passwordCheck) {
            return alert('비밀번호가 일치하지 않습니다.');
        }

        try {
            const res = await fetch('/api/users/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupData)
            });

            if (res.ok) {
                alert('회원가입 성공! 로그인해주세요. 🎀');
                setShowSignup(false);
                // 상태 초기화
                setSignupData({ loginId: '', password: '', passwordCheck: '', nickname: '' });
                setIsLoginIdChecked(false);
                setIsNicknameChecked(false);
            } else {
                alert('회원가입 실패. 입력 정보를 확인해주세요.');
            }
        } catch (e) {
            console.error(e);
            alert('회원가입 중 오류가 발생했습니다.');
        }
    };

    // 엔터키 입력 시 회원가입 시도
    const handleKeyDownSignup = (e) => {
        if (e.key === 'Enter') handleSignupSubmit();
    };

    // ==========================================
    // 🖥️ UI 렌더링
    // ==========================================
    return (
        <div className="login-page" style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            height: '100vh', backgroundColor: '#FFDEE9'
        }}>
            {/* 🚪 메인 로그인 창 */}
            <div style={{ width: '320px' }}>
                <WindowFrame title="Login.exe">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ textAlign: 'center', fontSize: '30px' }}>🎀</div>

                        <input
                            type="text"
                            placeholder="ID"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            style={{ padding: '10px', border: '2px inset #fff' }}
                        />
                        <input
                            type="password"
                            placeholder="PW"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            style={{ padding: '10px', border: '2px inset #fff' }}
                        />

                        <button
                            onClick={handleLogin}
                            style={{
                                padding: '10px', background: '#FF69B4', color: 'white',
                                border: '2px outset #fff', cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            LOGIN
                        </button>

                        <span
                            onClick={() => setShowSignup(true)}
                            style={{
                                textAlign: 'center', fontSize: '12px', cursor: 'pointer',
                                textDecoration: 'underline', color: '#FF1493', marginTop: '5px'
                            }}
                        >
                            회원가입하기 (Join Us)
                        </span>
                    </div>
                </WindowFrame>
            </div>

            {/* 📝 회원가입 팝업 */}
            {showSignup && (
                <Draggable nodeRef={nodeRef} handle=".window-header">
                    <div ref={nodeRef} style={{
                        position: 'fixed',
                        width: '300px',
                        zIndex: 1000,
                        top: '20%',
                        left: 'calc(50% - 150px)',
                        boxShadow: '5px 5px 15px rgba(0,0,0,0.1)'
                    }}>
                        <WindowFrame title="Join Us!" onClose={() => setShowSignup(false)}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <p style={{ fontSize: '12px', color: '#FF69B4', margin: '0', textAlign: 'center' }}>
                                    Welcome! ♡
                                </p>

                                {/* 닉네임 입력 */}
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input
                                        name="nickname"
                                        value={signupData.nickname}
                                        onChange={handleSignupChange}
                                        type="text" placeholder="닉네임"
                                        style={{ padding: '8px', flex: 1, border: '2px inset #eee' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={checkNickname}
                                        style={{
                                            fontSize: '10px', cursor: 'pointer',
                                            // 확인 완료되면 초록색, 아니면 회색
                                            background: isNicknameChecked ? '#90EE90' : '#eee',
                                            color: isNicknameChecked ? '#006400' : '#000',
                                            border: '1px solid #ccc',
                                            fontWeight: isNicknameChecked ? 'bold' : 'normal'
                                        }}
                                    >
                                        {isNicknameChecked ? "확인됨" : "중복\n확인"}
                                    </button>
                                </div>

                                {/* 아이디 입력 */}
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input
                                        name="loginId"
                                        value={signupData.loginId}
                                        onChange={handleSignupChange}
                                        type="text" placeholder="아이디"
                                        style={{ padding: '8px', flex: 1, border: '2px inset #eee' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={checkLoginId}
                                        style={{
                                            fontSize: '10px', cursor: 'pointer',
                                            // 확인 완료되면 초록색, 아니면 회색
                                            background: isLoginIdChecked ? '#90EE90' : '#eee',
                                            color: isLoginIdChecked ? '#006400' : '#000',
                                            border: '1px solid #ccc',
                                            fontWeight: isLoginIdChecked ? 'bold' : 'normal'
                                        }}
                                    >
                                        {isLoginIdChecked ? "확인됨" : "중복\n확인"}
                                    </button>
                                </div>

                                {/* 비밀번호 입력 */}
                                <input
                                    name="password"
                                    value={signupData.password}
                                    onChange={handleSignupChange}
                                    type="password" placeholder="8자 이상의 비밀번호"
                                    style={{ padding: '8px', border: '2px inset #eee' }}
                                />
                                <input
                                    name="passwordCheck"
                                    value={signupData.passwordCheck}
                                    onChange={handleSignupChange}
                                    onKeyDown={handleKeyDownSignup}
                                    type="password" placeholder="비밀번호 확인"
                                    style={{ padding: '8px', border: '2px inset #eee' }}
                                />

                                <button
                                    onClick={handleSignupSubmit}
                                    style={{
                                        background: '#FFC1CC', border: '2px outset #fff',
                                        padding: '10px', cursor: 'pointer', fontWeight: 'bold', color: '#555'
                                    }}
                                >
                                    가입완료
                                </button>
                            </div>
                        </WindowFrame>
                    </div>
                </Draggable>
            )}
        </div>
    );
};

export default Login;