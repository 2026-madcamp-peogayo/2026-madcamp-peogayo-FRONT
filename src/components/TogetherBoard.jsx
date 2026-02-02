import React from 'react';

const TogetherBoard = ({ currentUser }) => {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fdfdfd' }}>
            <h3 style={{ color: '#9932CC' }}>🎨 함께 그림 그리기</h3>
            <p style={{ fontSize: '12px', color: '#666' }}>실시간으로 친구들과 그림을 그려보세요!</p>
            <div style={{ width: '90%', height: '300px', border: '2px dashed #ccc', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                Canvas Area (Implementation needed)
            </div>
            {/* 여기에 WebSocket/Canvas 로직이 들어갑니다 */}
        </div>
    );
};

export default TogetherBoard;