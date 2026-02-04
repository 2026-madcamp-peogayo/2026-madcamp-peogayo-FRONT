import React, { useRef, useState, useEffect } from 'react';

const DrawingBoard = ({ onSave, onClose }) => {
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const videoRef = useRef(null); // 비디오 태그용 Ref

    const [ctx, setCtx] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // 카메라 관련 상태
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);

    // 펜 설정
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);

    // 캔버스 초기화
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = 500;
            canvas.height = 400;

            const context = canvas.getContext('2d');
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.fillStyle = "white";
            context.fillRect(0, 0, canvas.width, canvas.height);
            setCtx(context);
        }

        // 컴포넌트 언마운트 시 카메라 스트림 정리
        return () => {
            stopCamera();
        };
    }, []);

    // ★ 공통 함수: 이미지 소스(URL)를 받아서 캔버스에 꽉 차게 그리기
    const drawImageToCanvas = (imageSrc) => {
        if (!ctx || !canvasRef.current) return;
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            // 캔버스 크기에 맞춰서 배경으로 그리기 (기존 로직 유지)
            ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        };
    };

    // 1. 파일 업로드 핸들러
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            // 공통 함수 호출
            drawImageToCanvas(event.target.result);
        };
        reader.readAsDataURL(file);
        // 같은 파일을 다시 선택할 수 있도록 input 초기화
        e.target.value = '';
    };

    // 2. 카메라 열기
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(stream);
            setIsCameraOpen(true);

            // 모달이 렌더링된 후 비디오에 스트림 연결
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            }, 100);
        } catch (err) {
            console.error("카메라 접근 오류:", err);
            alert("카메라를 실행할 수 없습니다. 권한을 확인해주세요.");
        }
    };

    // 3. 카메라 끄기 (스트림 정지)
    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIsCameraOpen(false);
    };

    // 4. 사진 찍기 (현재 비디오 화면 캡처)
    const takePhoto = () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        // 임시 캔버스를 만들어 비디오의 현재 프레임을 그림
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        // 이미지 데이터 URL 추출
        const dataUrl = tempCanvas.toDataURL('image/png');

        // 메인 캔버스에 그리기 (공통 함수 재사용)
        drawImageToCanvas(dataUrl);

        // 카메라 닫기
        stopCamera();
    };


    // 그리기 로직들
    const startDrawing = ({ nativeEvent }) => {
        if (!ctx) return;
        const { offsetX, offsetY } = nativeEvent;
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing || !ctx) return;
        const { offsetX, offsetY } = nativeEvent;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (ctx) ctx.closePath();
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        if (!ctx) return;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const handleSave = () => {
        if (!canvasRef.current) return;
        canvasRef.current.toBlob((blob) => {
            onSave(blob);
        }, 'image/png');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

            {/* ---------------- 카메라 팝업 (모달) ---------------- */}
            {isCameraOpen && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    zIndex: 100,
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>📷 사진 찍기</h3>
                        <video
                            ref={videoRef}
                            style={{ width: '100%', maxWidth: '400px', borderRadius: '4px', backgroundColor: '#000' }}
                        />
                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={takePhoto}
                                style={{ padding: '8px 16px', backgroundColor: '#FF69B4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                찰칵! (적용)
                            </button>
                            <button
                                onClick={stopCamera}
                                style={{ padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* -------------------------------------------------- */}


            {/* 툴바 영역 */}
            <div style={{
                padding: '10px', backgroundColor: '#eee', borderBottom: '1px solid #ccc',
                display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'
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

                {/* ★ 2. 사진 찍기 버튼 추가 */}
                <button
                    onClick={startCamera}
                    style={{ cursor: 'pointer', border: '1px solid #999', padding: '2px 8px', backgroundColor: '#fff', fontSize: '12px' }}
                >
                    📷 사진 찍기
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