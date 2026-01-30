import React from 'react';

const WindowFrame = ({ title, children, onClose, isMain = false }) => {
    return (
        // 전체를 감싸는 최상위 부모 요소
        <div className={`window-container ${isMain ? 'main-style' : ''}`} style={{
            border: '2px solid #fff',
            borderRightColor: '#848484',
            borderBottomColor: '#848484',
            background: '#f0f0f0',
            marginBottom: '20px',
            boxShadow: '2px 2px 0px #000'
        }}>
            {/* 핑크색 상단 바 */}
            <div className="pink-top-line" style={{
                background: 'linear-gradient(90deg, #FF69B4, #FFC1CC)',
                padding: '4px 8px',
                display: 'flex',
                justifyContent: 'space-between', // 하이픈 대신 따옴표로 감싸거나 justifyContent로 써야함
                alignItems: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px'
            }}>
                <span className="window-title">{title}</span>
                <div className="window-controls" style={{ display: 'flex', gap: '5px' }}>
                    <button style={{ cursor: 'pointer', width: '20px', height: '20px', padding: '0' }}>_</button>
                    <button style={{ cursor: 'pointer', width: '20px', height: '20px', padding: '0' }}>□</button>
                    <button
                        onClick={() => {
                            if (isMain) {
                                if (window.confirm("로그아웃 하시겠습니까?")) {
                                    window.location.reload();
                                }
                            } else if (onClose) {
                                onClose();
                            }
                        }}
                        style={{
                            cursor: 'pointer',
                            background: '#ff4d4d',
                            color: 'white',
                            border: '1px solid #fff',
                            width: '20px',
                            height: '20px',
                            padding: '0',
                            lineHeight: '1'
                        }}
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* 내용 영역 */}
            <div className="window-content" style={{ padding: '15px' }}>
                {children}
            </div>
        </div>
    );
};

export default WindowFrame;