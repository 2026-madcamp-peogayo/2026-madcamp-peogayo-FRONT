import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import WindowFrame from '../components/WindowFrame';

const Login = ({ onLogin }) => {
    const [showSignup, setShowSignup] = useState(false);
    const nodeRef = useRef(null);

    return (
        <div className="login-page" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#FFDEE9'
        }}>
            {/* 메인 로그인 창 */}
            <div style={{ width: '320px' }}>
                <WindowFrame title="Login.exe">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ textAlign: 'center', fontSize: '30px' }}>🎀</div>
                        <input type="text" placeholder="ID" style={{ padding: '10px', border: '2px inset #fff' }} />
                        <input type="password" placeholder="PW" style={{ padding: '10px', border: '2px inset #fff' }} />
                        <button
                            onClick={() => {
                                console.log("Login button clicked!");
                                onLogin();
                            }}
                            style={{
                                padding: '10px',
                                background: '#FF69B4',
                                color: 'white',
                                border: '2px outset #fff',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            LOGIN
                        </button>
                        <span
                            onClick={() => setShowSignup(true)}
                            style={{
                                textAlign: 'center',
                                fontSize: '12px',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                color: '#FF1493',
                                marginTop: '5px'
                            }}
                        >
                            회원가입하기 (Join Us)
                        </span>
                    </div>
                </WindowFrame>
            </div>

            {/* 회원가입 팝업 */}
            {showSignup && (
                <Draggable
                    nodeRef={nodeRef}
                    handle=".pink-top-line" // 이제 WindowFrame에 이 클래스가 있어서 작동합니다!
                >
                    <div
                        ref={nodeRef}
                        style={{
                            position: 'fixed', // absolute보다 fixed가 팝업에 유리함
                            width: '300px',
                            zIndex: 1000,
                            top: '20%',
                            left: 'calc(50% - 150px)'
                        }}
                    >
                        <WindowFrame title="Join Us!" onClose={() => setShowSignup(false)}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <p style={{ fontSize: '12px', color: '#FF69B4', margin: '0' }}>Welcome! ♡</p>
                                <input type="text" placeholder="Nickname" style={{ padding: '8px' }} />
                                <input type="text" placeholder="ID" style={{ padding: '8px' }} />
                                <input type="password" placeholder="Password" style={{ padding: '8px' }} />
                                <button
                                    onClick={() => {
                                        alert('가입 완료!');
                                        setShowSignup(false);
                                    }}
                                    style={{ background: '#FFC1CC', border: '2px outset #fff', padding: '10px', cursor: 'pointer' }}
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