import React, { useRef, useState, useEffect } from 'react';

const DrawingBoard = ({ onSave, onClose }) => {
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null); // 파일 인풋용 Ref
    const [ctx, setCtx] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // 펜 설정
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);

    // 캔버스 초기화
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            // 캔버스 크기 설정 (부모 컨테이너에 맞춤)
            canvas.width = 500;
            canvas.height = 400;

            const context = canvas.getContext('2d');
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.fillStyle = "white";
            context.fillRect(0, 0, canvas.width, canvas.height); // 흰 배경으로 시작
            setCtx(context);
        }
    }, []);

    // 1. 이미지 업로드 핸들러 (★ 핵심 기능)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                if (!ctx) return;
                // 이미지를 캔버스 크기에 맞춰서 배경으로 그리기
                // (기존 그림 위에 덮어씌워지므로, 보통 맨 처음에 불러옵니다)
                ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
            };
        };
        reader.readAsDataURL(file);
    };

    // 그리기 시작
    const startDrawing = ({ nativeEvent }) => {
        if (!ctx) return;
        const { offsetX, offsetY } = nativeEvent;
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    // 그리는 중
    const draw = ({ nativeEvent }) => {
        if (!isDrawing || !ctx) return;
        const { offsetX, offsetY } = nativeEvent;

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    // 그리기 끝
    const stopDrawing = () => {
        if (ctx) ctx.closePath();
        setIsDrawing(false);
    };

    // 초기화 (흰색으로 덮기)
    const clearCanvas = () => {
        if (!ctx) return;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    // 저장 (Blob 변환 후 부모에게 전달)
    const handleSave = () => {
        if (!canvasRef.current) return;
        // 캔버스를 이미지 Blob으로 변환
        canvasRef.current.toBlob((blob) => {
            onSave(blob); // MyHome.js의 handleUploadPost 호출
        }, 'image/png');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* 툴바 영역 */}
            <div style={{
                padding: '10px',
                backgroundColor: '#eee',
                borderBottom: '1px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap'
            }}>
                {/* 1. 파일 업로드 버튼 */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                />
                <button
                    onClick={() => fileInputRef.current.click()}
                    style={{ cursor: 'pointer', border: '1px solid #999', padding: '2px 8px', backgroundColor: '#fff', fontSize: '12px' }}
                >
                    🖼️ 사진 불러오기
                </button>

                <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc' }}></div>

                {/* 색상 선택 */}
                <label style={{ fontSize: '12px' }}>색상:</label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{ width: '30px', height: '30px', cursor: 'pointer', padding: 0, border: 'none' }}
                />

                {/* 굵기 선택 */}
                <label style={{ fontSize: '12px' }}>굵기:</label>
                <select
                    value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                    style={{ padding: '2px' }}
                >
                    <option value={1}>얇게</option>
                    <option value={3}>보통</option>
                    <option value={5}>굵게</option>
                    <option value={10}>매우 굵게</option>
                    <option value={20}>매우 매우 굵게</option>
                </select>


                <button
                    onClick={clearCanvas}
                    style={{ cursor: 'pointer', border: '1px solid #999', padding: '2px 8px', backgroundColor: '#fff', fontSize: '12px', marginLeft: 'auto' }}
                >
                    전체 지우기
                </button>
            </div>

            {/* 캔버스 영역 */}
            <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#888', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    style={{
                        backgroundColor: 'white',
                        cursor: `url('data:image/svg+xml;utf8,<svg ...>...</svg>') 0 20, auto`, // 커스텀 커서 원하면 추가 가능
                        boxShadow: '0 0 10px rgba(0,0,0,0.3)'
                    }}
                />
            </div>

            {/* 하단 버튼 (저장/취소) */}
            <div style={{ padding: '10px', textAlign: 'center', backgroundColor: '#eee', borderTop: '1px solid #ccc' }}>
                <button
                    onClick={handleSave}
                    style={{
                        padding: '8px 20px', marginRight: '10px',
                        backgroundColor: '#FF69B4', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer'
                    }}
                >
                    올리기
                </button>
                <button
                    onClick={onClose}
                    style={{
                        padding: '8px 20px',
                        backgroundColor: '#999', color: 'white', border: 'none', cursor: 'pointer'
                    }}
                >
                    취소
                </button>
            </div>
        </div>
    );
};

export default DrawingBoard;