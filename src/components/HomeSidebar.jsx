import React, { useState, useEffect } from 'react';

// ★ 서버 주소 (상황에 맞게 유지)
const API_BASE_URL = 'http://13.125.245.75:8080';

const HomeSidebar = ({
    activeTab, homeInfo, isMyHome, isMyFriend,
    onVisitHome, onOpenSettings, onToggleFriend
}) => {
    const [randomUsers, setRandomUsers] = useState([]);

    useEffect(() => {
        if (activeTab === 'recommend') {
            fetchRandomUsers();
        }
    }, [activeTab]);

    const fetchRandomUsers = async () => {
        try {
            const res = await fetch('/api/main/recommend'); // 백엔드 엔드포인트 확인 필요

            if (res.ok) {
                const data = await res.json();
                // 데이터가 있으면 앞에서부터 3명만 자름
                // (백엔드가 3명만 보내주겠지만, 프론트에서도 한번 더 확실하게 처리)
                if (Array.isArray(data)) {
                    setRandomUsers(data.slice(0, 3));
                } else {
                    setRandomUsers([]);
                }
            } else {
                console.warn("추천 친구 데이터를 가져오지 못했습니다.");
                setRandomUsers([]);
            }
        } catch (e) {
            console.error(e);
            setRandomUsers([]);
        }
    };

    const getProfileImg = (url) => {
        if (!url) return '/default_profile.png'; // 기본 이미지 경로 확인
        return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    };

    return (
        <aside style={{ width: '200px', flexShrink: 0 }}>
            <div style={{ background: '#fff', padding: '10px', border: '1px solid #FFC1CC', textAlign: 'center', minHeight: '500px' }}>

                {activeTab !== 'recommend' ? (
                    /* 1. 기본 사이드바 (내 홈피 정보) */
                    <>
                        <div style={{
                            width: '100%', height: '150px',
                            backgroundImage: `url(${getProfileImg(homeInfo.profileImageUrl)})`,
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            marginBottom: '10px', border: '1px inset #eee'
                        }} />

                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                            <b>{homeInfo.nickname}</b>

                            {isMyHome ? (
                                <button onClick={onOpenSettings} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>⚙️</button>
                            ) : (
                                /* ▼▼▼ [수정됨] 일촌 상태에 따라 버튼 모양과 텍스트 변경 ▼▼▼ */
                                <button
                                    onClick={onToggleFriend}
                                    style={{
                                        border: '1px solid #ddd',
                                        // 친구면 회색(#eee), 아니면 핑크색(#FF69B4)
                                        background: isMyFriend ? '#eee' : '#FF69B4',
                                        // 친구면 검은글씨, 아니면 흰글씨
                                        color: isMyFriend ? '#333' : '#fff',
                                        fontSize: '10px',
                                        padding: '2px 5px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {/* 텍스트도 변경 */}
                                    {isMyFriend ? '일촌해제 ✂️' : '일촌신청 💌'}
                                </button>
                                /* ▲▲▲ --------------------------------------------- ▲▲▲ */
                            )}
                        </div>
                        <p style={{ fontSize: '11px', color: '#666', margin: '5px 0' }}>{homeInfo.intro}</p>

                        <div style={{ marginTop: '15px', borderTop: '1px dashed #ddd', paddingTop: '10px', textAlign: 'left' }}>
                            <div style={{ fontSize: '12px', color: '#FF69B4', fontWeight: 'bold', marginBottom: '5px', textAlign: 'center' }}>Friends</div>
                            <div style={{ height: '180px', overflowY: 'auto', background: '#fafafa', padding: '5px' }}>
                                {(homeInfo.friends || []).map((friend) => (
                                    <div key={friend.userId || friend.id} onClick={() => onVisitHome(friend.userId || friend.id)} style={{ fontSize: '11px', padding: '4px', cursor: 'pointer', borderBottom: '1px dotted #eee' }}>
                                        🍊 {friend.nickname}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    /* 2. 추천 탭 (추천 친구 3명 표시) */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
                        <h4 style={{ color: '#FF69B4', marginBottom: '20px' }}>오늘의 추천 친구 👋</h4>

                        {randomUsers.length > 0 ? (
                            randomUsers.map((user, index) => (
                                <div key={user.userId || index} onClick={() => onVisitHome(user.userId)} style={{ marginBottom: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%',
                                        backgroundImage: `url(${getProfileImg(user.profileImg || user.profileImageUrl)})`,
                                        backgroundSize: 'cover', backgroundPosition: 'center', border: '2px solid #FFC1CC', marginBottom: '8px'
                                    }} />
                                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>{user.nickname}</span>
                                    <span style={{ fontSize: '10px', color: '#999' }}>파도타기 🌊</span>
                                </div>
                            ))
                        ) : (
                            /* 데이터가 없을 때 표시할 문구 수정됨 */
                            <div style={{ color: '#999', fontSize: '12px', marginTop: '40px', lineHeight: '1.6' }}>
                                😅 아직 추천할 친구가 없어요.<br />
                                다른 친구들이 가입할 때까지<br />
                                조금만 기다려주세요!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default HomeSidebar;