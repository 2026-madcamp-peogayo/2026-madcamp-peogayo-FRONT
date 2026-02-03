import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { useParams } from 'react-router-dom';
import WindowFrame from '../components/WindowFrame';
import HomeSidebar from '../components/HomeSidebar';
import HomeMainContent from '../components/HomeMainContent';
import TogetherBoard from '../components/TogetherBoard';
import DrawingBoard from '../components/DrawingBoard';

// ★ 서버 URL 상수
const SERVER_URL = "http://13.125.245.75:8080";

const MyHome = () => {
    // 1. URL 파라미터 및 기본 상태 정의
    const { id } = useParams();
    // id가 없으면(내 홈으로 바로 왔을 때) 처리를 위해 일단 변수에 담음
    const targetId = id;

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
    const isMyFriend = myInfo && homeInfo.friends?.some(f => (f.userId || f.id) === myInfo.id);
    const [feedTab, setFeedTab] = useState('ALL');

    // ─────────────────────────────────────────────────────────────
    // [헬퍼 함수 정의]
    // ─────────────────────────────────────────────────────────────
    const getImgUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${SERVER_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    // ★★★ [중요] loadHomeData를 useEffect보다 먼저 정의해야 에러가 안 납니다! ★★★
    const loadHomeData = async (tgtId, viewerInfo = myInfo) => {
        try {
            const viewerId = viewerInfo?.id;

            // 1. 홈 기본 정보
            const homeRes = await fetch(`/api/home/${tgtId}`);
            let homeData = {};
            if (homeRes.ok) {
                homeData = await homeRes.json();
                homeData.profileImageUrl = getImgUrl(homeData.profileImageUrl);
            }

            // 2. 친구 목록
            let friendsData = [];
            try {
                const friendRes = await fetch(`/api/friends/${tgtId}`);
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

            // 3. 내 홈이면 설정값 초기화
            if (viewerId && Number(tgtId) === Number(viewerId)) {
                setTempNickname(homeData.nickname || '');
                setTempIntro(homeData.greeting || '');
                setTempPreviewImg(homeData.profileImageUrl);
                setTempIsPrivate(homeData.isHomePrivate || false);
                setIsNicknameChecked(true);
                setNicknameMsg('');
            }

            // 4. 게시글 목록 (좋아요 상태 계산 포함)
            const postRes = await fetch(`/api/posts/${tgtId}`);
            if (postRes.ok) {
                const postData = await postRes.json();
                const processedPosts = postData.map(p => ({
                    ...p,
                    contentImageUrl: getImgUrl(p.contentImageUrl),
                    writerProfileImg: getImgUrl(p.writerProfileImg),
                    // 좋아요 여부 계산 (viewerId 사용)
                    isLiked: p.likeUsers?.some(user => user.id === viewerId) || false
                }));
                setPosts(processedPosts);
            }

            // 5. 방명록
            const guestRes = await fetch(`/api/guestbooks/${tgtId}`);
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

    // ─────────────────────────────────────────────────────────────
    // [useEffect] 데이터 로드 로직 (함수 정의보다 아래에 있어야 함)
    // ─────────────────────────────────────────────────────────────

    // 1. 세션 체크 & 홈 데이터 로드
    useEffect(() => {
        const initHome = async () => {
            if (activeTab === 'recommend') return;

            let userInfo = myInfo;

            // 세션 체크
            if (!userInfo || !userInfo.id) {
                try {
                    const res = await fetch('/api/users/me');
                    if (res.ok) {
                        userInfo = await res.json();
                        setMyInfo(userInfo);
                        setCurrentUserId(userInfo.id);
                    }
                } catch (e) {
                    console.log("세션 체크 실패");
                }
            }

            // 데이터 로드
            const idToLoad = targetId || userInfo?.id;
            if (idToLoad) {
                loadHomeData(idToLoad, userInfo);
            }
        };

        initHome();
    }, [activeTab, targetId]);

    // 2. 추천 탭 (전체공개/일촌공개) 데이터 로드 - API 명세서 반영 완료
    // 2. 추천 탭 (전체공개/일촌공개) 데이터 로드 - [최종 수정] 토큰 검사 제거
    useEffect(() => {
        const fetchFeeds = async () => {
            if (activeTab !== 'recommend') return;

            // ★ 수정됨: 불필요한 토큰 검사(localStorage) 삭제
            // 대신 myInfo(내 정보)가 있는지로 판단
            if (feedTab === 'FRIENDS' && !myInfo) {
                // 아직 내 정보 로딩 중일 수도 있으니 alert 대신 콘솔만 찍고 중단
                console.log("일촌 글 로딩 대기 중 (내 정보 없음)...");
                return;
            }

            try {
                // ★ 명세서대로 주소 설정 (이건 맞습니다!)
                // 전체보기: /api/main/posts/all
                // 친구보기: /api/main/posts/friends
                const endpoint = feedTab === 'ALL'
                    ? '/api/main/posts/all'
                    : '/api/main/posts/friends';

                // ★ 수정됨: Authorization 헤더 제거 (세션/쿠키 방식이므로 필요 없음)
                const res = await fetch(endpoint);

                if (res.ok) {
                    const data = await res.json();

                    // 데이터가 배열인지, content 객체인지 확인 후 처리
                    const feedList = Array.isArray(data) ? data : (data.content || []);

                    const processed = feedList.map(p => ({
                        ...p,
                        contentImageUrl: getImgUrl(p.contentImageUrl),
                        writerProfileImg: getImgUrl(p.writerProfileImg),
                        isLiked: p.likeUsers?.some(user => user.id === myInfo?.id) || false
                    }));

                    setPosts(processed);
                } else {
                    console.error(`[Feed Load] 실패 status: ${res.status}`);
                }
            } catch (e) {
                console.error("[Feed Load] 에러:", e);
            }
        };

        if (activeTab === 'recommend') {
            fetchFeeds();
        }
    }, [activeTab, feedTab, myInfo]); // myInfo가 로딩되면(로그인 확인되면) 다시 실행됨
    // ─────────────────────────────────────────────────────────────
    // [이벤트 핸들러]
    // ─────────────────────────────────────────────────────────────

    // 2. 추천 탭 (전체공개/일촌공개) 데이터 로드 - [최종 수정] 토큰 검사 제거
    useEffect(() => {
        const fetchFeeds = async () => {
            if (activeTab !== 'recommend') return;

            // ★ 수정됨: 불필요한 토큰 검사(localStorage) 삭제
            // 대신 myInfo(내 정보)가 있는지로 판단
            if (feedTab === 'FRIENDS' && !myInfo) {
                // 아직 내 정보 로딩 중일 수도 있으니 alert 대신 콘솔만 찍고 중단
                console.log("일촌 글 로딩 대기 중 (내 정보 없음)...");
                return;
            }

            try {
                // ★ 명세서대로 주소 설정 (이건 맞습니다!)
                // 전체보기: /api/main/posts/all
                // 친구보기: /api/main/posts/friends
                const endpoint = feedTab === 'ALL'
                    ? '/api/main/posts/all'
                    : '/api/main/posts/friends';

                // ★ 수정됨: Authorization 헤더 제거 (세션/쿠키 방식이므로 필요 없음)
                const res = await fetch(endpoint);

                if (res.ok) {
                    const data = await res.json();

                    // 데이터가 배열인지, content 객체인지 확인 후 처리
                    const feedList = Array.isArray(data) ? data : (data.content || []);

                    const processed = feedList.map(p => ({
                        ...p,
                        contentImageUrl: getImgUrl(p.contentImageUrl),
                        writerProfileImg: getImgUrl(p.writerProfileImg),
                        isLiked: p.likeUsers?.some(user => user.id === myInfo?.id) || false
                    }));

                    setPosts(processed);
                } else {
                    console.error(`[Feed Load] 실패 status: ${res.status}`);
                }
            } catch (e) {
                console.error("[Feed Load] 에러:", e);
            }
        };

        if (activeTab === 'recommend') {
            fetchFeeds();
        }
    }, [activeTab, feedTab, myInfo]); // myInfo가 로딩되면(로그인 확인되면) 다시 실행됨
    
    const handleGoMyHome = () => {
        if (!myInfo) {
            console.log("내 정보를 불러오는 중입니다...");
            return;
        }
        setPosts([]);
        setCurrentUserId(myInfo.id);
        setActiveTab('home');
        setHomeContentTab('posts');
        loadHomeData(myInfo.id, myInfo); // 내 정보 명시적 전달
    };

    const visitHome = (userId) => {
        setCurrentUserId(userId);
        setActiveTab('home');
        setHomeContentTab('posts');
        loadHomeData(userId, myInfo);
    };

    const handleSurfing = async () => {
        let retryCount = 0;
        const MAX_RETRIES = 3;
        let foundOthers = false;

        while (retryCount < MAX_RETRIES) {
            try {
                const res = await fetch('/api/main/surfing');
                if (res.ok) {
                    const data = await res.json();
                    let tId = null;
                    if (typeof data === 'object' && data !== null) {
                        tId = data.userId || data.id;
                    } else if (typeof data === 'number') {
                        tId = data;
                    }

                    if (tId) {
                        if (Number(tId) !== Number(currentUserId)) {
                            visitHome(tId);
                            foundOthers = true;
                            break;
                        } else {
                            console.log(`파도타기 ${retryCount + 1}번째 시도: 나 자신. 재시도...`);
                            retryCount++;
                        }
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            } catch (e) {
                console.error(e);
                break;
            }
        }
        if (!foundOthers) {
            alert("지금은 파도를 탈 수 있는 다른 미니홈피가 없어요 😢");
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

    const handleUploadPost = async (blob) => {
        if (!blob) return alert("이미지가 생성되지 않았습니다.");
        const formData = new FormData();
        const file = new File([blob], `drawing_${Date.now()}.png`, { type: "image/png" });
        formData.append("image", file);
        const postData = { visibility: "PUBLIC" };
        formData.append("data", new Blob([JSON.stringify(postData)], { type: "application/json" }));

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert("업로드 완료! 🎨");
                setIsWriteOpen(false);
                loadHomeData(currentUserId);
            } else {
                alert("업로드 실패 ㅠㅠ");
            }
        } catch (e) {
            console.error(e);
            alert("서버 에러 발생");
        }
    };

    const handleShowLikes = (postId) => {
        const targetPost = posts.find(p => p.id === postId);
        if (targetPost && targetPost.likeUsers) {
            setSelectedLikeUsers(targetPost.likeUsers);
        } else {
            setSelectedLikeUsers([]);
        }
        setIsLikeListOpen(true);
    };

    const toggleFriend = async () => {
        if (!myInfo) return alert("로그인이 필요합니다 😢");
        if (isMyHome) return alert("자기 자신과는 일촌을 맺을 수 없습니다 😅");

        const tId = homeInfo.userId || homeInfo.id;
        const isAdding = !isMyFriend;
        const url = isAdding
            ? `/api/friends/request/${tId}`
            : `/api/friends/${tId}`;
        const method = isAdding ? 'POST' : 'DELETE';
        const actionMsg = isAdding ? '일촌 목록에 추가하시겠습니까?' : '일촌을 끊으시겠습니까?';

        if (!window.confirm(actionMsg)) return;

        try {
            const res = await fetch(url, { method: method });
            if (res.ok) {
                alert(isAdding ? "일촌으로 등록되었습니다! 🎉" : "일촌이 해제되었습니다.");
                loadHomeData(tId);
                const meRes = await fetch('/api/users/me');
                if (meRes.ok) {
                    const meData = await meRes.json();
                    setMyInfo(meData);
                }
            } else {
                alert("처리 실패!");
            }
        } catch (e) {
            console.error("일촌 기능 에러:", e);
            alert("네트워크 오류");
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
        if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
            if (res.ok) { alert("게시글이 삭제되었습니다."); loadHomeData(currentUserId); }
            else { alert("삭제 실패"); }
        } catch (e) { alert("서버 오류"); }
    };

    // ▼▼▼ [오타 수정됨] 이상한 '좋아요' 글자 제거 완료 ▼▼▼
    const handleLike = async (postId) => {
        setPosts(prevPosts => prevPosts.map(post => {
            if (post.id === postId) {
                const currentlyLiked = post.isLiked;
                return {
                    ...post,
                    isLiked: !currentlyLiked,
                    likeCount: currentlyLiked
                        ? (post.likeCount || 1) - 1
                        : (post.likeCount || 0) + 1,
                    likeUsers: currentlyLiked
                        ? post.likeUsers?.filter(u => u.id !== currentUserId)
                        : [...(post.likeUsers || []), myInfo]
                };
            }
            return post;
        }));

        try {
            const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
            if (!res.ok) throw new Error("서버 반영 실패");
        } catch (e) {
            console.error("좋아요 실패", e);
            alert("좋아요 처리에 실패했습니다.");
            loadHomeData(currentUserId);
        }
    };

    // ─────────────────────────────────────────────────────────────
    // [JSX 렌더링]
    // ─────────────────────────────────────────────────────────────
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
                    <span
                        onClick={() => {
                            setActiveTab('recommend');
                            setHomeContentTab('posts'); // ★ 이 줄이 핵심입니다! 게시글 모드로 강제 전환
                            setPosts([]); // 기존 글 비워주기 (로딩 느낌)
                        }}
                        style={{ cursor: 'pointer', fontWeight: activeTab === 'recommend' ? 'bold' : 'normal', color: activeTab === 'recommend' ? '#FF69B4' : '#000' }}
                    >
                        추천(R)
                    </span>
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