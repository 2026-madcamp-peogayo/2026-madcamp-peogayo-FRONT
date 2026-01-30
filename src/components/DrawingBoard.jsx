import React, { useRef, useEffect, useState } from 'react';

const DrawingBoard = ({ onSave }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [penColor, setPenColor] = useState('#FF69B4'); // 펜 색상
    const [lineWidth, setLineWidth] = useState(3);       // 펜 굵기 (기본 3)

    // 캔버스 크기 설정 (높이 250 유지)
    const canvasWidth = 500;
    const canvasHeight = 250;

    // 초기화
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round'; // 선이 꺾일 때 둥글게 처리
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    // 펜 스타일(색상, 굵기) 변경 감지
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = penColor;
        ctx.lineWidth = lineWidth;
    }, [penColor, lineWidth]);

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e) => {
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current.getContext('2d');

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                // 이미지 비율 유지하며 꽉 채우기
                const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
                const w = img.width * ratio;
                const h = img.height * ratio;

                // 기존 그림 유지하려면 아래 줄 삭제, 덮어쓰려면 유지
                // ctx.fillStyle = "#ffffff";
                // ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div style={{ padding: '10px' }}>
            {/* 도구 모음 */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', alignItems: 'center', fontSize: '12px' }}>

                {/* 1. 색상 선택 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>🎨 색상</span>
                    <input
                        type="color"
                        value={penColor}
                        onChange={(e) => setPenColor(e.target.value)}
                        style={{ width: '25px', height: '25px', padding: 0, border: 'none', cursor: 'pointer' }}
                        title="펜 색상 변경"
                    />
                </div>

                {/* 2. 굵기 조절 (슬라이더) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>✏️ 굵기</span>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        style={{ width: '80px', cursor: 'pointer', accentColor: '#FF69B4' }}
                        title={`현재 굵기: ${lineWidth}px`}
                    />
                    <span style={{ fontSize: '10px', color: '#666', minWidth: '20px' }}>{lineWidth}px</span>
                </div>

                {/* 3. 사진 첨부 */}
                <label style={{ cursor: 'pointer', background: '#eee', border: '1px solid #ccc', padding: '3px 8px', marginLeft: 'auto' }}>
                    🖼️ 사진
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
            </div>

            {/* 캔버스 */}
            <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={draw}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
                style={{ border: '1px solid #ccc', cursor: 'crosshair', background: '#fff', display: 'block' }}
            />

            {/* 하단 버튼 */}
            <div style={{ marginTop: '10px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
                <button
                    onClick={() => {
                        const ctx = canvasRef.current.getContext('2d');
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                    }}
                    style={{ background: '#fff', border: '1px solid #ccc', padding: '5px 10px', cursor: 'pointer', fontSize: '12px' }}
                >
                    지우기
                </button>
                <button
                    onClick={() => onSave(canvasRef.current.toDataURL())}
                    style={{ background: '#FF69B4', color: '#fff', border: 'none', padding: '5px 15px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                >
                    올리기 ✨
                </button>
            </div>
        </div>
    );
};

export default DrawingBoard;