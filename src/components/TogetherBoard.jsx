import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';

// ★ 서버 URL (웹소켓)
const BROKER_URL = "ws://13.125.245.75:8080/ws-stomp";
// ★ 서버 URL (API)
const API_URL = "http://13.125.245.75:8080/api/plaza/history";

const TogetherBoard = ({ currentUser }) => {
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const clientRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    // 내 그리기 상태
    const [isDrawing, setIsDrawing] = useState(false);

    // 자유로운 색상 및 굵기 선택을 위한 state
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(3);

    const lastPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // 1. 캔버스 초기화
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 450;

        // 기본 스타일 설정
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 3;
        setCtx(context);

        // 2. ★ 수정됨: 기존 그림 기록(History) 불러오기 (JSON 리스트)
        loadDrawingHistory(context);

        // 3. 소켓 연결 설정
        connectSocket(context);

        // 4. 컴포넌트 언마운트 시 연결 종료
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                console.log("Disconnected.");
            }
        };
        // eslint-disable-next-line
    }, []);

    const loadDrawingHistory = async (context) => {
        try {
            const response = await fetch(API_URL);
            const history = await response.json();

            if (history && history.length > 0) {
                console.log(`데이터 ${history.length}개 로딩 중...`);

                history.forEach((data, index) => {
                    // x, y가 없으면 무시
                    if (data.x === undefined || data.y === undefined) return;

                    // ★ 테스트용: 그냥 빨간 사각형을 찍어봅니다.
                    // 선 연결 로직 다 빼고 일단 보이는지 확인
                    context.fillStyle = data.color || 'red';

                    // x,y 위치에 3x3 픽셀 사각형 그리기
                    // 만약 x,y가 0이면 왼쪽 맨 위에 붙어서 나옵니다.
                    context.fillRect(data.x, data.y, 4, 4);
                });
            }
        } catch (error) {
            console.error("실패:", error);
        }
    };

    const connectSocket = (context) => {
        const client = new Client({
            brokerURL: BROKER_URL,
            reconnectDelay: 5000,
            onConnect: () => {
                setIsConnected(true);
                console.log("TogetherBoard Connected! 🔗");

                client.subscribe('/topic/plaza', (message) => {
                    const body = JSON.parse(message.body);
                    // 내가 보낸 게 아닐 때만 그리기 (내껀 이미 그렸으니까)
                    if (body.senderId !== currentUser?.id) {
                        drawFromRemote(context, body);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
        clientRef.current = client;
    };

    const startDrawing = ({ nativeEvent }) => {
        if (!ctx) return;
        const { offsetX, offsetY } = nativeEvent;
        lastPos.current = { x: offsetX, y: offsetY };
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing || !ctx || !clientRef.current || !isConnected) return;
        const { offsetX, offsetY } = nativeEvent;

        // 1. 내 화면 그리기 (여긴 그대로)
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();

        // 2. ★ 서버 전송 (여기를 수정!)
        // 서버 DB에 'x', 'y'로 저장되므로, 보낼 때도 이름을 맞춰줍니다.
        const drawData = {
            senderId: currentUser?.id || 0,
            nickname: currentUser?.nickname || 'Guest',

            // 기존 startX, endX 대신 서버 포맷인 x, y로 보냄 (끝점을 현재 위치로)
            x: offsetX,
            y: offsetY,

            color: color,
            width: lineWidth,
            type: "DRAW" // 혹시 몰라 타입도 명시
        };

        clientRef.current.publish({
            destination: "/app/plaza/draw",
            body: JSON.stringify(drawData),
        });

        lastPos.current = { x: offsetX, y: offsetY };
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    // ★ 원격 데이터(또는 히스토리)를 받아서 그리는 함수
    const drawFromRemote = (context, data) => {
        if (!context) return;
        context.beginPath();
        context.strokeStyle = data.color;
        context.lineWidth = data.width || 3;
        context.moveTo(data.startX, data.startY);
        context.lineTo(data.endX, data.endY);
        context.stroke();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', backgroundColor: '#f0f0f0' }}>

            {/* 툴바 영역 */}
            <div style={{
                width: '100%', padding: '10px', backgroundColor: '#eee',
                display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center',
                borderBottom: '2px solid #aaa', flexWrap: 'wrap'
            }}>
                {/* 연결 상태 */}
                <span style={{ fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}>
                    {isConnected ? "🟢 접속됨" : "🔴 연결 중..."}
                </span>

                {/* 1. 색상 선택기 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label style={{ fontSize: '12px' }}>색상:</label>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        style={{ width: '30px', height: '30px', cursor: 'pointer', padding: 0, border: 'none', backgroundColor: 'transparent' }}
                    />
                </div>

                {/* 2. 굵기 선택기 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <label style={{ fontSize: '12px' }}>굵기:</label>
                    <select
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        style={{ padding: '2px', cursor: 'pointer' }}
                    >
                        <option value={1}>얇게</option>
                        <option value={3}>보통</option>
                        <option value={5}>굵게</option>
                        <option value={10}>매우 굵게</option>
                        <option value={20}>매우 매우 굵게</option>
                    </select>
                </div>
            </div>

            {/* 캔버스 영역 */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    style={{
                        backgroundColor: 'white',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                        cursor: 'crosshair'
                    }}
                />
            </div>
        </div>
    );
};

export default TogetherBoard;