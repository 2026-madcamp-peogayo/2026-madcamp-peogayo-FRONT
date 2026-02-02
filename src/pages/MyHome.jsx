import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';

import WindowFrame from '../components/WindowFrame';
import HomeSidebar from '../components/HomeSidebar';
import HomeMainContent from '../components/HomeMainContent';
import TogetherBoard from '../components/TogetherBoard';
import DrawingBoard from '../components/DrawingBoard'; // DrawingBoard 컴포넌트 경로 확인 필요

// ★ 서버 URL 상수
const SERVER_URL = "http://13.125.245.75:8080";

const MyHome = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [homeContentTab, setHomeContentTab] = useState('posts');

    // 팝업 상태
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [isWriteOpen, setIsWriteOpen] = useState(false);
    const [isLikeListOpen, setIsLikeListOpen] = useState(false);

    // Refs
    const settingRef = useRef(null);
    const writeRef = useRef(null);
    const likeListRef = useRef(null);

    // 데이터 상태
    const [myInfo, setMyInfo] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [homeInfo, setHomeInfo] = useState({
        id: null, nickname: 'Loading...', intro: '', profileImageUrl: '', isHomePrivate: false, friends: []
    });
    const [posts, setPosts] = useState([]);
    const [guestbook, setGuestbook] = useState([]);
    const [newGuestMsg, setNewGuestMsg] = useState('');
    const [selectedLikeUsers, setSelectedLikeUsers] = useState([]);

    // 설정 임시 상태
    const [tempProfileImg, setTempProfileImg] = useState(null);
    const [tempPreviewImg, setTempPreviewImg] = useState('');
    const [tempNickname, setTempNickname] = useState('');
    const [tempIntro, setTempIntro] = useState('');
    const [tempIsPrivate, setTempIsPrivate] = useState(false);

    const [nicknameMsg, setNicknameMsg] = useState('');
    const [isNicknameChecked, setIsNicknameChecked] = useState(true);

    const isMyHome = myInfo && currentUserId === myInfo.id;
    const canAccess = isMyHome || !homeInfo.isHomePrivate;
    // userId 혹은 id 둘 중 하나라도 일치하면 친구로 인정
    const isMyFriend = myInfo && homeInfo.friends?.some(f => (f.userId || f.id) === myInfo.id);
    const [feedTab, setFeedTab] = useState('ALL'); // 'ALL' 또는 'FRIENDS'

    // ★ 이미지 URL 처리 헬퍼 함수
    const getImgUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${SERVER_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    // 1. 내 정보 체크
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/users/me');
                if (res.ok) {
                    const data = await res.json();
                    setMyInfo(data);
                    if (!currentUserId) setCurrentUserId(data.id);
                }
            } catch (e) { console.error("Session Check Failed", e); }
        };
        checkSession();
    }, []);

    // 2. 홈피 데이터 로드
    useEffect(() => {
        if (currentUserId) loadHomeData(currentUserId);
    }, [currentUserId]);


    // 3. 추천 탭 (전체공개/친구공개 글) 로직 구현
    useEffect(() => {
        const fetchFeeds = async () => {
            if (activeTab === 'recommend') {
                try {
                    // API 엔드포인트는 백엔드 명세에 맞게 수정 필요 (예시: /api/posts/public, /api/posts/friends)
                    const endpoint = feedTab === 'ALL' ? '/api/posts/public' : '/api/posts/feed';
                    const res = await fetch(endpoint);
                    if (res.ok) {
                        const data = await res.json();
                        const processed = data.map(p => ({
                            ...p,
                            contentImageUrl: getImgUrl(p.contentImageUrl),
                            writerProfileImg: getImgUrl(p.writerProfileImg)
                        }));
                        setPosts(processed);
                    }
                } catch (e) {
                    console.error("피드 로딩 실패", e);
                }
            }
        };
        fetchFeeds();
    }, [activeTab, feedTab]); // 탭이 바뀌거나 피드필터가 바뀌면 재실행

    const handleGoMyHome = () => {
        if (!myInfo) {
            console.log("내 정보를 불러오는 중입니다...");
            return;
        }
        setPosts([]); // 기존 글 비우기
        setCurrentUserId(myInfo.id);
        setActiveTab('home');
        setHomeContentTab('posts');
        loadHomeData(myInfo.id);
    };

    const loadHomeData = async (targetId) => {
        try {
            // 1. 홈 기본 정보
            const homeRes = await fetch(`/api/home/${targetId}`);
            let homeData = {};
            if (homeRes.ok) {
                homeData = await homeRes.json();
                homeData.profileImageUrl = getImgUrl(homeData.profileImageUrl);
            }

            // 2. 친구 목록
            let friendsData = [];
            try {
                const friendRes = await fetch(`/api/friends/${targetId}`);
                if (friendRes.ok) {
                    friendsData = await friendRes.json();
                    friendsData = friendsData.map(f => ({
                        ...f,
                        profileImg: getImgUrl(f.profileImg)
                    }));
                }
            } catch (err) {
                console.error("친구 목록 로드 실패", err);
            }

            setHomeInfo({
                ...homeData,
                intro: homeData.greeting,
                friends: friendsData
            });

            // 4. 내 홈이면 설정값 초기화
            if (myInfo && Number(targetId) === Number(myInfo.id)) {
                setTempNickname(homeData.nickname || '');
                setTempIntro(homeData.greeting || '');
                setTempPreviewImg(homeData.profileImageUrl);
                setTempIsPrivate(homeData.isHomePrivate || false);
                setIsNicknameChecked(true);
                setNicknameMsg('');
            }

            // 5. 게시글 목록
            const postRes = await fetch(`/api/posts/${targetId}`);
            if (postRes.ok) {
                const postData = await postRes.json();
                const processedPosts = postData.map(p => ({
                    ...p,
                    contentImageUrl: getImgUrl(p.contentImageUrl),
                    writerProfileImg: getImgUrl(p.writerProfileImg)
                }));
                setPosts(processedPosts);
            }

            // 6. 방명록
            const guestRes = await fetch(`/api/guestbooks/${targetId}`);
            if (guestRes.ok) {
                const guestData = await guestRes.json();
                const processedGuestbook = guestData.map(g => ({
                    ...g,
                    writerProfileImg: getImgUrl(g.writerProfileImg)
                }));
                setGuestbook(processedGuestbook);
            }

        } catch (e) {
            console.error(e);
        }
    };

    // --- 기능 핸들러 ---
    const visitHome = (userId) => {
        setCurrentUserId(userId);
        setActiveTab('home');
        setHomeContentTab('posts');
    };

    const handleSurfing = async () => {
        // 무한 루프 방지를 위해 최대 3번까지만 재시도
        let retryCount = 0;
        const MAX_RETRIES = 3;
        let foundOthers = false;

        while (retryCount < MAX_RETRIES) {
            try {
                const res = await fetch('/api/main/surfing');
                if (res.ok) {
                    const data = await res.json();
                    let targetId = null;

                    // 데이터 파싱 (객체인지 숫자인지 확인)
                    if (typeof data === 'object' && data !== null) {
                        targetId = data.userId || data.id;
                    } else if (typeof data === 'number') {
                        targetId = data;
                    }

                    if (targetId) {
                        // ★ 핵심 로직: 내가 아니면 이동하고 종료
                        if (Number(targetId) !== Number(currentUserId)) {
                            visitHome(targetId);
                            foundOthers = true;
                            break; // 루프 탈출
                        } else {
                            // 나 자신이 나오면 로그만 찍고 다시 루프를 돕니다
                            console.log(`파도타기 ${retryCount + 1}번째 시도: 나 자신이 나왔습니다. 다시 찾습니다... 🌊`);
                            retryCount++;
                        }
                    } else {
                        // ID가 없으면 그냥 종료
                        break;
                    }
                } else {
                    alert("파도타기 서버 오류!");
                    break;
                }
            } catch (e) {
                console.error(e);
                break;
            }
        }

        // 3번 다 돌았는데도 나만 나왔거나 실패했을 경우
        if (!foundOthers) {
            alert("지금은 파도를 탈 수 있는 다른 미니홈피가 없어요 😢 (혹시 나 혼자?!)");
        }
    };

    const handleNicknameChange = (e) => {
        const newName = e.target.value;
        setTempNickname(newName);
        if (newName === homeInfo.nickname) {
            setIsNicknameChecked(true);
            setNicknameMsg('');
        } else {
            setIsNicknameChecked(false);
            setNicknameMsg('중복 확인을 해주세요.');
        }
    };

    const checkNicknameDuplicate = async () => {
        if (!tempNickname.trim()) {
            setNicknameMsg('닉네임을 입력해주세요.');
            return;
        }
        if (tempNickname === homeInfo.nickname) {
            setIsNicknameChecked(true);
            setNicknameMsg('현재 사용 중인 닉네임입니다.');
            return;
        }
        try {
            const res = await fetch(`/api/users/check-nickname?nickname=${encodeURIComponent(tempNickname)}`);
            if (res.ok) {
                const isDuplicate = await res.json();
                if (isDuplicate) {
                    setIsNicknameChecked(false);
                    setNicknameMsg('이미 사용 중인 닉네임입니다 😢');
                } else {
                    setIsNicknameChecked(true);
                    setNicknameMsg('사용 가능한 닉네임입니다 ✨');
                }
            }
        } catch (e) { setNicknameMsg('서버 연결 실패'); }
    };

    const saveSettings = async () => {
        const isNicknameChanged = tempNickname !== homeInfo.nickname;
        if (isNicknameChanged && !isNicknameChecked) {
            alert("닉네임이 변경되었습니다. 중복 확인을 꼭 해주세요! 🧐");
            return;
        }

        const formData = new FormData();
        const jsonPart = {
            nickname: tempNickname,
            greeting: tempIntro,
            isHomePrivate: tempIsPrivate,
        };
        formData.append('data', new Blob([JSON.stringify(jsonPart)], { type: 'application/json' }));
        if (tempProfileImg) {
            // 주의: 백엔드가 'image'를 원하는지 'profileImage'를 원하는지 확인 필요
            // 여기서는 기존 코드대로 'profileImage' 유지
            formData.append('profileImage', tempProfileImg);
        }

        try {
            const res = await fetch('/api/home/profile', {
                method: 'PUT',
                body: formData
            });
            if (res.ok) {
                alert("프로필이 변경되었습니다! ✨");
                setIsSettingOpen(false);
                loadHomeData(currentUserId);
            } else {
                alert("저장 실패... 서버 에러 ㅠ");
            }
        } catch (e) { console.error(e); }
    };

    // ▼▼▼ [수정된 부분] 게시글 업로드 핸들러 ▼▼▼
    const handleUploadPost = async (blob) => {
        if (!blob) return alert("이미지가 생성되지 않았습니다.");

        const formData = new FormData();
        // 1. 이미지 파일 추가 (File 객체로 변환 추천)
        const file = new File([blob], `drawing_${Date.now()}.png`, { type: "image/png" });
        formData.append("image", file);

        // 2. 게시글 정보 (JSON) - postDto 변수 제거하고 직접 객체 생성
        const postData = {
            visibility: "PUBLIC"
        };

        formData.append("data", new Blob([JSON.stringify(postData)], { type: "application/json" }));

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert("업로드 완료! 🎨");
                setIsWriteOpen(false); // 창 닫기
                loadHomeData(currentUserId); // 목록 새로고침
            } else {
                const errText = await res.text();
                console.error("Upload Error:", errText);
                alert("업로드 실패 ㅠㅠ (서버 로그 확인)");
            }
        } catch (e) {
            console.error(e);
            alert("서버 에러 발생");
        }
    };
    // ▲▲▲ --------------------------------- ▲▲▲

    const handleShowLikes = () => {
        setSelectedLikeUsers([{ nickname: '테스트유저' }]);
        setIsLikeListOpen(true);
    };

    const toggleFriend = async () => {
        if (!myInfo) return alert("로그인이 필요합니다 😢");
        if (isMyHome) return alert("자기 자신과는 일촌을 맺을 수 없습니다 😅");

        const targetId = homeInfo.userId || homeInfo.id;
        const isAdding = !isMyFriend;
        const url = isAdding
            ? `/api/friends/request/${targetId}`
            : `/api/friends/${targetId}`;

        const method = isAdding ? 'POST' : 'DELETE';
        const actionMsg = isAdding ? '일촌 목록에 추가하시겠습니까?' : '일촌을 끊으시겠습니까?';

        if (!window.confirm(actionMsg)) return;

        try {
            const res = await fetch(url, { method: method });
            if (res.ok) {
                alert(isAdding ? "일촌으로 등록되었습니다! 🎉" : "일촌이 해제되었습니다.");
                // 화면 갱신
                loadHomeData(targetId);
                // 내 정보(내 사이드바 친구목록)도 갱신
                const meRes = await fetch('/api/users/me');
                if (meRes.ok) {
                    const meData = await meRes.json();
                    setMyInfo(meData);
                }
            } else {
                alert("처리 실패! (서버 로그를 확인해주세요)");
            }
        } catch (e) {
            console.error("일촌 기능 에러:", e);
            alert("네트워크 오류가 발생했습니다.");
        }
    };

    const addGuestbook = async () => {
        if (!newGuestMsg.trim()) return;
        try {
            const res = await fetch(`/api/guestbooks/${currentUserId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newGuestMsg })
            });
            if (res.ok) { setNewGuestMsg(''); loadHomeData(currentUserId); }
        } catch (e) { console.error(e); }
    };

    const deleteGuestbook = async (gbId) => {
        if (!window.confirm("정말 방명록을 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`/api/guestbooks/${gbId}`, { method: 'DELETE' });
            if (res.ok) { alert("삭제되었습니다."); loadHomeData(currentUserId); }
        } catch (e) { console.error(e); }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("정말 이 게시글을 삭제하시겠습니까? (복구 불가)")) return;
        try {
            const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
            if (res.ok) { alert("게시글이 삭제되었습니다. 🗑️"); loadHomeData(currentUserId); }
            else { alert("삭제 실패"); }
        } catch (e) { alert("서버 오류"); }
    };

    const handleLike = async (postId) => {
        try { await fetch(`/api/posts/${postId}/like`, { method: 'POST' }); loadHomeData(currentUserId); } catch (e) { }
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#FFDEE9', minHeight: '100vh', fontFamily: 'DungGeunMo, sans-serif' }}>
            <WindowFrame
                title={`${homeInfo.nickname || 'Guest'}'s Sweet Home`}
                isMain={true}
            >
                <div style={{ display: 'flex', gap: '15px', padding: '8px 15px', backgroundColor: '#eee', borderBottom: '1px solid #ccc', fontSize: '12px' }}>
                    <span
                        onClick={handleGoMyHome}
                        style={{
                            cursor: 'pointer',
                            fontWeight: activeTab === 'home' && isMyHome ? 'bold' : 'normal',
                            color: activeTab === 'home' && isMyHome ? '#FF69B4' : '#000'
                        }}
                    >마이홈(H)</span>
                    <span onClick={() => setActiveTab('recommend')} style={{ cursor: 'pointer', fontWeight: activeTab === 'recommend' ? 'bold' : 'normal', color: activeTab === 'recommend' ? '#FF69B4' : '#000' }}>추천(R)</span>
                    <span onClick={handleSurfing} style={{ cursor: 'pointer', color: '#1596ff', fontWeight: 'normal' }}>파도타기(S)</span>
                    <span onClick={() => setActiveTab('together')} style={{ cursor: 'pointer', color: '#9932CC', fontWeight: activeTab === 'together' ? 'bold' : 'normal', borderLeft: '1px solid #ccc', paddingLeft: '15px' }}>함께그리기</span>
                </div>

                <div style={{ display: 'flex', height: '540px', backgroundColor: '#fff', margin: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    {activeTab !== 'together' && (
                        <aside style={{ width: '220px', flexShrink: 0, borderRight: '1px dashed #ccc', padding: '15px', backgroundColor: '#fdfdfd' }}>
                            <HomeSidebar
                                currentUserId={currentUserId}
                                myInfo={myInfo}
                                onGoMyHome={handleGoMyHome}
                                activeTab={activeTab}
                                homeInfo={homeInfo}
                                isMyHome={isMyHome}
                                isMyFriend={isMyFriend}
                                onVisitHome={visitHome}
                                onOpenSettings={() => setIsSettingOpen(true)}
                                onToggleFriend={toggleFriend}
                            />
                        </aside>
                    )}
                    <main style={{ flex: 1, overflowY: 'auto' }}>
                        {activeTab === 'together' ? (
                            <TogetherBoard currentUser={myInfo} />
                        ) : (
                            <HomeMainContent
                                activeTab={activeTab}
                                homeContentTab={homeContentTab}
                                setHomeContentTab={setHomeContentTab}
                                canAccess={canAccess}
                                isMyHome={isMyHome}
                                posts={posts}
                                guestbook={guestbook}
                                newGuestMsg={newGuestMsg}
                                setNewGuestMsg={setNewGuestMsg}
                                onOpenWrite={() => setIsWriteOpen(true)}
                                onLike={handleLike}
                                onShowLikes={handleShowLikes}
                                onAddGuestbook={addGuestbook}
                                onDeleteGuestbook={deleteGuestbook}
                                onDeletePost={handleDeletePost}
                                onToggleFriend={toggleFriend}
                                feedTab={feedTab}
                                setFeedTab={setFeedTab}
                                onVisitHome={visitHome}
                            />
                        )}
                    </main>
                </div>
            </WindowFrame>

            {/* 팝업들 */}
            {isSettingOpen && (
                <Draggable nodeRef={settingRef} handle=".window-header">
                    <div ref={settingRef} style={{ position: 'fixed', top: '100px', left: '35%', zIndex: 1000, width: '290px' }}>
                        <WindowFrame title="Profile Setting" onClose={() => setIsSettingOpen(false)}>
                            <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '80px', height: '80px', margin: '0 auto 10px',
                                        backgroundImage: `url(${tempPreviewImg || '/default_profile.png'})`,
                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                        borderRadius: '50%', border: '2px solid #FF69B4'
                                    }} />
                                    <label style={{ cursor: 'pointer', backgroundColor: '#eee', padding: '3px 8px', borderRadius: '3px', fontSize: '11px' }}>
                                        사진 변경
                                        <input type="file" style={{ display: 'none' }} accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    setTempProfileImg(e.target.files[0]);
                                                    setTempPreviewImg(URL.createObjectURL(e.target.files[0]));
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', color: '#555' }}>닉네임</label>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input type="text" value={tempNickname} onChange={handleNicknameChange} style={{ flex: 1, padding: '5px', border: '1px solid #ccc', borderRadius: '3px' }} />
                                        <button onClick={checkNicknameDuplicate} style={{
                                            fontSize: '11px', padding: '0 8px', cursor: 'pointer',
                                            backgroundColor: (tempNickname !== homeInfo.nickname && !isNicknameChecked) ? '#FFF0F5' : '#eee',
                                            border: (tempNickname !== homeInfo.nickname && !isNicknameChecked) ? '1px solid #FF69B4' : '1px solid #ccc',
                                            color: (tempNickname !== homeInfo.nickname && !isNicknameChecked) ? '#FF1493' : '#000',
                                            borderRadius: '3px'
                                        }}>
                                            {isNicknameChecked && tempNickname !== homeInfo.nickname ? "확인됨" : "중복확인"}
                                        </button>
                                    </div>
                                    <div style={{ fontSize: '11px', marginTop: '4px', color: isNicknameChecked ? 'green' : 'red' }}>{nicknameMsg}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '3px', fontWeight: 'bold', color: '#555' }}>한줄 소개</label>
                                    <input type="text" value={tempIntro} onChange={(e) => setTempIntro(e.target.value)} style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '3px' }} />
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={tempIsPrivate} onChange={(e) => setTempIsPrivate(e.target.checked)} />
                                    <span style={{ color: '#666' }}>미니홈피 비공개</span>
                                </label>
                                <button onClick={saveSettings} style={{ background: '#FF69B4', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', marginTop: '5px', fontWeight: 'bold' }}>변경사항 저장</button>
                            </div>
                        </WindowFrame>
                    </div>
                </Draggable>
            )}

            {isWriteOpen && (
                <Draggable nodeRef={writeRef} handle=".window-header">
                    <div ref={writeRef} style={{ position: 'fixed', top: '50px', left: '20%', zIndex: 1100 }}>
                        <WindowFrame title="Drawing Board" onClose={() => setIsWriteOpen(false)}>
                            {/* ▼▼▼ [수정] onSave와 onClose 모두 전달 ▼▼▼ */}
                            <DrawingBoard
                                onSave={handleUploadPost}
                                onClose={() => setIsWriteOpen(false)}
                            />
                        </WindowFrame>
                    </div>
                </Draggable>
            )}

            {isLikeListOpen && (
                <Draggable nodeRef={likeListRef} handle=".window-header">
                    <div ref={likeListRef} style={{ position: 'fixed', top: '200px', left: '40%', zIndex: 1200, width: '200px' }}>
                        <WindowFrame title="Likes" onClose={() => setIsLikeListOpen(false)}>
                            <ul style={{ listStyle: 'none', padding: '10px' }}>
                                {selectedLikeUsers.length > 0 ? selectedLikeUsers.map((u, i) => (
                                    <li key={i} style={{ borderBottom: '1px dotted #ccc', padding: '5px' }}>{u.nickname}</li>
                                )) : <li style={{ color: '#999', fontSize: '11px' }}>아직 좋아요가 없어요</li>}
                            </ul>
                        </WindowFrame>
                    </div>
                </Draggable>
            )}
        </div>
    );
};

export default MyHome;