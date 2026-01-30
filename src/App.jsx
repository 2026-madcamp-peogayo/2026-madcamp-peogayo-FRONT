import React, { useState } from 'react';
import WindowFrame from './components/WindowFrame';
import Login from './pages/Login';
import MyHome from './pages/MyHome';
import './styles/global.css';

function App() {
    // 로그인 상태 관리 (기본값 false)
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 로그인 버튼을 누르면 실행될 함수
    const handleLoginSuccess = () => {
        console.log("로그인 성공! 화면을 전환합니다.");
        setIsLoggedIn(true);
    };

    return (
        <div className="App">
            {isLoggedIn ? (
                // 로그인 상태가 true면 마이홈을 보여줌
                <MyHome />
            ) : (
                // 로그인 상태가 false면 로그인 페이지를 보여줌
                // 중요: handleLoginSuccess 함수를 'onLogin'이라는 이름의 배달통에 담아서 보냄!
                <Login onLogin={handleLoginSuccess} />
            )}
        </div>
    );
}

export default App;