import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import WindowFrame from '../components/WindowFrame';
import DrawingBoard from '../components/DrawingBoard';

const MyHome = () => {
    const MY_NICKNAME = '체리쥬빌레';

    // 🗂️ 탭 상태 관리
    const [activeTab, setActiveTab] = useState('home'); // 'home' vs 'recommend'
    const [homeContentTab, setHomeContentTab] = useState('posts'); // 'posts' vs 'guest'
    const [recommendTab, setRecommendTab] = useState('today'); // 'today' vs 'friends'

    // 🪟 팝업(모달) 상태 관리
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [isWriteOpen, setIsWriteOpen] = useState(false);
    const [isLikeListOpen, setIsLikeListOpen] = useState(false);

    // 🔄 강제 리렌더링용
    const [trigger, setTrigger] = useState(false);

    // 📍 Refs
    const nodeRef = useRef(null);
    const writeRef = useRef(null);
    const likeRef = useRef(null);

    // ==========================================
    // 💾 [데이터] 전체 유저 DB
    // ==========================================
    const allUsersData = useRef({
        '체리쥬빌레': {
            nickname: '체리쥬빌레',
            intro: '오늘도 핑크색 하루 되세요! ♡',
            profileImg: 'https://via.placeholder.com/150/FFDEE9/FF69B4?text=Me',
            isPrivate: false,
            friends: ['복숭아농장'],
            posts: [],
            guestbook: [{ id: 1, author: '딸기우유', content: '홈피 너무 예뻐요! 맞팔해요~', date: '2023.10.24' }],
        },
        '복숭아농장': {
            nickname: '복숭아농장',
            intro: '복숭아 팝니다 🍑 (일촌공개)',
            profileImg: 'https://via.placeholder.com/150/FFB7B2/ffffff?text=Peach',
            isPrivate: true,
            friends: ['체리쥬빌레'],
            posts: [{ id: 10, content: 'https://via.placeholder.com/400x300/FFB7B2/ffffff?text=Peach+Drawing', date: '2023.10.20', author: '복숭아농장', likes: ['체리쥬빌레'] }],
            guestbook: []
        },
        '초코쿠키': {
            nickname: '초코쿠키',
            intro: '달달한게 최고야 🍪',
            profileImg: 'https://via.placeholder.com/150/D2691E/ffffff?text=Cookie',
            isPrivate: false,
            friends: [],
            posts: [{ id: 11, content: 'https://via.placeholder.com/400x300/8B4513/ffffff?text=Cookie+Art', date: '2023.10.22', author: '초코쿠키', likes: [] }],
            guestbook: [{ id: 2, author: '체리쥬빌레', content: '퍼가요~♡', date: '2023.10.26' }]
        },
        '하늘구름': {
            nickname: '하늘구름',
            intro: '둥실둥실 ☁️',
            profileImg: 'https://via.placeholder.com/150/87CEEB/ffffff?text=Cloud',
            isPrivate: false,
            friends: [],
            posts: [{ id: 12, content: 'https://via.placeholder.com/400x300/E0FFFF/000000?text=Sky+View', date: '2023.10.25', author: '하늘구름', likes: ['체리쥬빌레', '초코쿠키'] }],
            guestbook: []
        },
        '비밀요원': {
            nickname: '비밀요원',
            intro: '접근 금지 구역',
            profileImg: 'https://via.placeholder.com/150/333333/ffffff?text=Secret',
            isPrivate: true,
            friends: [],
            posts: [{ id: 99, content: 'https://via.placeholder.com/400x300/000/fff?text=Secret', date: '2023.10.01', author: '비밀요원', likes: [] }],
            guestbook: []
        },
        // (없는 유저 테스트용: 딸기우유는 DB에 없어서 클릭 시 알림 뜸)
    });

    // 👤 현재 보여지는 화면의 주인 (State)
    const [user, setUser] = useState(allUsersData.current['체리쥬빌레']);
    const [posts, setPosts] = useState(allUsersData.current['체리쥬빌레'].posts);
    const [guestbook, setGuestbook] = useState(allUsersData.current['체리쥬빌레'].guestbook);

    // ✨ 추천 탭용 데이터 (State)
    const [recommendPosts, setRecommendPosts] = useState([
        { id: 101, author: '하늘구름', date: '2023.10.26', content: 'https://via.placeholder.com/400x300/87CEEB/ffffff?text=Sunny+Day', likes: ['user1', '체리쥬빌레'] },
        { id: 102, author: '복숭아농장', date: '2023.10.26', content: 'https://via.placeholder.com/400x300/FFB7B2/ffffff?text=Peach+Juice', likes: ['cherry'] },
        { id: 103, author: '비밀요원', date: '2023.10.25', content: 'https://via.placeholder.com/400x300/333/fff?text=TopSecret', likes: [] },
    ]);
    const [friendPosts, setFriendPosts] = useState([
        { id: 201, author: '복숭아농장', date: '방금 전', content: 'https://via.placeholder.com/400x300/FFB7B2/ffffff?text=For+Friends', likes: ['me'] },
        { id: 202, author: '초코쿠키', date: '1시간 전', content: 'https://via.placeholder.com/400x300/8B4513/ffffff?text=Cookie+Yum', likes: [] },
    ]);

    // 설정/작성/팝업 관련 State
    const [tempImg, setTempImg] = useState(user.profileImg);
    const [tempIsPrivate, setTempIsPrivate] = useState(user.isPrivate);
    const [newGuestMsg, setNewGuestMsg] = useState('');
    const [selectedLikeUsers, setSelectedLikeUsers] = useState([]);

    // 권한 체크
    const isMyHome = user.nickname === MY_NICKNAME;
    const isMyFriend = allUsersData.current[MY_NICKNAME].friends.includes(user.nickname);
    const canAccess = isMyHome || !user.isPrivate || isMyFriend;


    // ==========================================
    // 🚀 기능 함수들
    // ==========================================

    const visitHome = (targetNickname) => {
        const targetData = allUsersData.current[targetNickname];
        // ⚠️ DB에 없는 유저(예: 딸기우유)일 경우 처리
        if (!targetData) { alert('존재하지 않는 유저입니다.'); return; }

        setUser({ ...targetData });
        setPosts(targetData.posts);
        setGuestbook(targetData.guestbook);
        setTempImg(targetData.profileImg);
        setTempIsPrivate(targetData.isPrivate);
        setActiveTab('home');
        setHomeContentTab('posts');
        const mainContent = document.getElementById('main-content');
        if (mainContent) mainContent.scrollTop = 0;
    };

    // 🌊 파도타기 (나 자신 & 현재 보고있는 사람 제외)
    const handleSurfing = () => {
        const allUserNames = Object.keys(allUsersData.current);
        const potentialTargets = allUserNames.filter(name =>
            name !== MY_NICKNAME &&
            name !== user.nickname
        );

        if (potentialTargets.length === 0) {
            alert('파도탈 곳이 없어요..');
            return;
        }

        const randomName = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
        visitHome(randomName);
    };

    const toggleFriend = () => {
        const myData = allUsersData.current[MY_NICKNAME];
        const targetData = allUsersData.current[user.nickname];

        if (isMyFriend) {
            if (window.confirm(`${user.nickname}님과 일촌을 해제하시겠습니까?`)) {
                myData.friends = myData.friends.filter(name => name !== user.nickname);
                targetData.friends = targetData.friends.filter(name => name !== MY_NICKNAME);
                alert('일촌이 해제되었습니다.');
            }
        } else {
            myData.friends.push(user.nickname);
            targetData.friends.push(MY_NICKNAME);
            alert(`${user.nickname}님과 일촌이 되었습니다! 🎉`);
        }
        setTrigger(!trigger);
    };

    const handleImgChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => { setTempImg(ev.target.result); };
            reader.readAsDataURL(file);
        }
    };

    const saveSettings = () => {
        setUser({ ...user, profileImg: tempImg, isPrivate: tempIsPrivate });
        const myData = allUsersData.current[MY_NICKNAME];
        myData.profileImg = tempImg;
        myData.isPrivate = tempIsPrivate;
        myData.nickname = user.nickname;
        myData.intro = user.intro;
        setIsSettingOpen(false);
    };

    const handleUpload = (drawingData) => {
        const newPost = { id: Date.now(), content: drawingData, date: new Date().toLocaleString(), author: MY_NICKNAME, likes: [] };
        setPosts([newPost, ...posts]);
        allUsersData.current[MY_NICKNAME].posts.unshift(newPost);
        setIsWriteOpen(false);
    };

    // 1️⃣ [홈 탭] 좋아요 토글
    const toggleLike = (postId) => {
        setPosts(posts.map(p => {
            if (p.id === postId) {
                const hasLiked = p.likes.includes(MY_NICKNAME);
                const newLikes = hasLiked ? p.likes.filter(u => u !== MY_NICKNAME) : [...p.likes, MY_NICKNAME];
                return { ...p, likes: newLikes };
            }
            return p;
        }));
    };

    // 2️⃣ [추천 탭] 좋아요 토글
    const toggleRecommendLike = (postId, listType) => {
        const targetList = listType === 'today' ? recommendPosts : friendPosts;
        const setTargetList = listType === 'today' ? setRecommendPosts : setFriendPosts;

        setTargetList(targetList.map(post => {
            if (post.id === postId) {
                const hasLiked = post.likes.includes(MY_NICKNAME);
                const newLikes = hasLiked
                    ? post.likes.filter(u => u !== MY_NICKNAME)
                    : [...post.likes, MY_NICKNAME];
                return { ...post, likes: newLikes };
            }
            return post;
        }));
    };

    // 3️⃣ [공통] 좋아요 리스트 열기
    const openLikeList = (likes) => {
        setSelectedLikeUsers(likes);
        setIsLikeListOpen(true);
    };

    const addGuestbook = () => {
        if (!newGuestMsg.trim()) return;
        const entry = { id: Date.now(), author: MY_NICKNAME, content: newGuestMsg, date: new Date().toLocaleDateString() };
        setGuestbook([entry, ...guestbook]);
        allUsersData.current[user.nickname].guestbook.unshift(entry);
        setNewGuestMsg('');
    };

    const deleteGuestbook = (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            setGuestbook(guestbook.filter(g => g.id !== id));
            allUsersData.current[user.nickname].guestbook = allUsersData.current[user.nickname].guestbook.filter(g => g.id !== id);
        }
    };

    // UI용 데이터 필터링
    const recommendFriendsUI = [
        { name: '복숭아농장', img: allUsersData.current['복숭아농장'].profileImg },
        { name: '초코쿠키', img: allUsersData.current['초코쿠키'].profileImg },
        { name: '하늘구름', img: allUsersData.current['하늘구름'].profileImg }
    ];

    const getFilteredPosts = (postList) => {
        return postList.filter(post => {
            const authorData = allUsersData.current[post.author];
            const amIFriendWithAuthor = allUsersData.current[MY_NICKNAME].friends.includes(post.author);
            if (authorData && authorData.isPrivate && !amIFriendWithAuthor) return false;
            return true;
        });
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#FFDEE9', minHeight: '100vh' }}>
            <WindowFrame title={`${user.nickname}'s Sweet Home ${user.isPrivate ? '🔒' : '♡'}`} isMain={true}>

                {/* 상단 네비게이션 */}
                <div style={{ display: 'flex', gap: '15px', padding: '5px 10px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc', fontSize: '12px', marginBottom: '10px' }}>
                    <span onClick={() => visitHome(MY_NICKNAME)} style={{ cursor: 'pointer', fontWeight: activeTab === 'home' && isMyHome ? 'bold' : 'normal', color: activeTab === 'home' && isMyHome ? '#FF69B4' : '#000' }}>홈(H)</span>
                    <span onClick={() => setActiveTab('recommend')} style={{ cursor: 'pointer', fontWeight: activeTab === 'recommend' ? 'bold' : 'normal', color: activeTab === 'recommend' ? '#FF69B4' : '#000' }}>추천(R)</span>
                    <span onClick={handleSurfing} style={{ cursor: 'pointer', color: '#1E90FF', fontWeight: 'bold' }}>파도타기(S) 🌊</span>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>

                    {/* ⬅️ 왼쪽 사이드바 */}
                    <aside style={{ width: '200px', flexShrink: 0 }}>
                        <div style={{ background: '#fff', padding: '10px', border: '1px solid #FFC1CC', textAlign: 'center', minHeight: '500px' }}>
                            {activeTab === 'home' ? (
                                <>
                                    <div style={{ width: '100%', height: '150px', backgroundImage: `url(${user.profileImg})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px inset #eee', marginBottom: '10px' }} />
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', alignItems: 'center' }}>
                                        <b>{user.nickname}</b>
                                        {isMyHome ? (
                                            <button onClick={() => { setTempImg(user.profileImg); setTempIsPrivate(user.isPrivate); setIsSettingOpen(true); }} style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}>⚙️</button>
                                        ) : (
                                            <button
                                                onClick={toggleFriend}
                                                style={{
                                                    cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px',
                                                    background: isMyFriend ? '#eee' : '#FF69B4', color: isMyFriend ? '#333' : '#fff',
                                                    fontSize: '11px', padding: '1px 5px', marginLeft: '5px'
                                                }}
                                                title={isMyFriend ? "일촌 해제" : "일촌 신청"}
                                            >
                                                {isMyFriend ? '➖' : '➕'}
                                            </button>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '11px', color: '#666', margin: '5px 0' }}>{user.intro}</p>

                                    {/* 일촌 목록 */}
                                    {canAccess ? (
                                        <div style={{ marginTop: '15px', borderTop: '1px dashed #ddd', paddingTop: '10px', textAlign: 'left' }}>
                                            <div style={{ fontSize: '12px', color: '#FF69B4', fontWeight: 'bold', marginBottom: '5px', textAlign: 'center' }}>
                                                {isMyHome ? 'My Friends' : `${user.nickname}'s Friends`}
                                            </div>
                                            <div style={{ height: '180px', overflowY: 'auto', backgroundColor: '#fafafa', border: '1px solid #eee', padding: '5px' }}>
                                                {(user.friends || []).map((friendName, idx) => (
                                                    <div key={idx} onClick={() => visitHome(friendName)} style={{ fontSize: '11px', padding: '4px', cursor: 'pointer', borderBottom: '1px dotted #e0e0e0', display: 'flex', gap: '5px' }}>
                                                        🍊 {friendName}
                                                    </div>
                                                ))}
                                                {(user.friends || []).length === 0 && <div style={{ color: '#ccc', fontSize: '10px', textAlign: 'center' }}>일촌이 없어요..</div>}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '20px', fontSize: '11px', color: '#999', padding: '10px', background: '#f5f5f5' }}>
                                            🔒 친구 공개입니다.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* 추천 탭 사이드바 */}
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#FF69B4', marginBottom: '15px', marginTop: '5px' }}>✨ 추천 친구 ✨</p>
                                        {recommendFriendsUI.map((f, i) => (
                                            <div key={i} style={{ marginBottom: '15px', padding: '10px 5px', borderBottom: '1px dashed #eee' }}>
                                                <img
                                                    src={f.img}
                                                    alt={f.name}
                                                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #FFDEE9', marginBottom: '5px' }}
                                                />
                                                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>{f.name}</div>
                                                <button
                                                    onClick={() => visitHome(f.name)}
                                                    style={{ fontSize: '11px', padding: '3px 8px', cursor: 'pointer', background: '#FF69B4', color: '#fff', border: 'none', borderRadius: '10px' }}
                                                >
                                                    방문하기
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </aside>

                    {/* ➡️ 오른쪽 메인 컨텐츠 */}
                    <main id="main-content" style={{ flex: 1, height: '570px', overflowY: 'auto' }}>
                        <div style={{ background: '#fff', border: '1px solid #FFC1CC', minHeight: '100%', paddingBottom: '15px' }}>

                            {activeTab === 'home' ? (
                                <>
                                    {/* --- 🏠 홈 탭 --- */}
                                    {canAccess ? (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #FFDEE9', position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#fff', padding: '10px 15px 0 15px', marginBottom: '5px' }}>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <div onClick={() => setHomeContentTab('posts')} style={{ padding: '5px 10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: homeContentTab === 'posts' ? '#FF69B4' : '#ccc', borderBottom: homeContentTab === 'posts' ? '2px solid #FF69B4' : 'none', marginBottom: '-2px' }}>게시글</div>
                                                    <div onClick={() => setHomeContentTab('guest')} style={{ padding: '5px 10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: homeContentTab === 'guest' ? '#FF69B4' : '#ccc', borderBottom: homeContentTab === 'guest' ? '2px solid #FF69B4' : 'none', marginBottom: '-2px' }}>방명록</div>
                                                </div>
                                                {isMyHome && homeContentTab === 'posts' && (
                                                    <button onClick={() => setIsWriteOpen(true)} style={{ background: '#FF69B4', color: '#fff', border: 'none', padding: '5px 15px', fontSize: '11px', cursor: 'pointer', borderRadius: '15px', marginBottom: '5px' }}>글쓰기 🖌️</button>
                                                )}
                                            </div>

                                            <div style={{ padding: '0 15px' }}>
                                                {homeContentTab === 'posts' ? (
                                                    <>
                                                        {posts.length === 0 && <p style={{ color: '#ccc', textAlign: 'center', marginTop: '50px' }}>게시물이 없습니다.</p>}
                                                        {posts.map(post => (
                                                            <div key={post.id} style={{ marginBottom: '15px', padding: '5px 10px 15px 10px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                                                <div style={{ fontSize: '11px', color: '#999', marginBottom: '5px' }}>{post.date}</div>
                                                                <img src={post.content} alt="post" style={{ maxWidth: '100%', border: '1px solid #eee' }} />
                                                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                                    <span onClick={() => toggleLike(post.id)} style={{ cursor: 'pointer', fontSize: '14px' }}>
                                                                        {post.likes.includes(MY_NICKNAME) ? '❤️' : '🤍'} {post.likes.length}
                                                                    </span>
                                                                    <span onClick={() => openLikeList(post.likes)} style={{ cursor: 'pointer', color: '#999', fontSize: '12px' }}>...</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <div style={{ fontSize: '12px' }}>
                                                        <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', marginTop: '10px' }}>
                                                            <input value={newGuestMsg} onChange={(e) => setNewGuestMsg(e.target.value)} placeholder="일촌평 남기기" style={{ flex: 1, padding: '5px', border: '1px solid #ddd' }} />
                                                            <button onClick={addGuestbook} style={{ background: '#FF69B4', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>남기기</button>
                                                        </div>
                                                        {guestbook.map(g => (
                                                            <div key={g.id} style={{ padding: '10px', borderBottom: '1px dashed #eee', backgroundColor: '#f9f9f9', marginBottom: '5px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                                                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                                                        {/* ⬇️⬇️ 여기가 수정된 부분입니다 ⬇️⬇️ */}
                                                                        <b
                                                                            onClick={() => visitHome(g.author)}
                                                                            style={{
                                                                                color: g.author === MY_NICKNAME ? '#FF69B4' : '#333',
                                                                                cursor: 'pointer',
                                                                                textDecoration: 'underline'
                                                                            }}
                                                                            title={`${g.author}님 홈으로 이동`}
                                                                        >
                                                                            {g.author}
                                                                        </b>
                                                                        <span style={{ color: '#999', fontSize: '10px' }}>({g.date})</span>
                                                                    </div>
                                                                    {(g.author === MY_NICKNAME || isMyHome) && (
                                                                        <button onClick={() => deleteGuestbook(g.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ccc' }}>❌</button>
                                                                    )}
                                                                </div>
                                                                <div>{g.content}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999', gap: '15px' }}>
                                            <div style={{ fontSize: '60px' }}>🔒</div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>비공개 홈입니다.</div>
                                                <div style={{ fontSize: '12px', marginTop: '5px' }}>일촌을 맺으면 게시글을 볼 수 있어요!</div>
                                            </div>
                                            <button onClick={toggleFriend} style={{ background: '#FF69B4', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>➕ 일촌 신청하기</button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* --- ✨ 추천 탭 --- */}
                                    <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#fff', padding: '15px 15px 10px 15px', borderBottom: '1px solid #eee' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => setRecommendTab('today')} style={{ flex: 1, padding: '8px', cursor: 'pointer', background: recommendTab === 'today' ? '#FF69B4' : '#eee', color: recommendTab === 'today' ? '#fff' : '#000', border: 'none', fontWeight: 'bold' }}>오늘의 추천글</button>
                                            <button onClick={() => setRecommendTab('friends')} style={{ flex: 1, padding: '8px', cursor: 'pointer', background: recommendTab === 'friends' ? '#FF69B4' : '#eee', color: recommendTab === 'friends' ? '#fff' : '#000', border: 'none', fontWeight: 'bold' }}>내 친구들의 글</button>
                                        </div>
                                    </div>

                                    <div style={{ padding: '15px' }}>
                                        {getFilteredPosts(recommendTab === 'today' ? recommendPosts : friendPosts).map((item) => (
                                            <div key={item.id} style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <span onClick={() => visitHome(item.author)} style={{ fontSize: '13px', fontWeight: 'bold', color: '#FF69B4', cursor: 'pointer', textDecoration: 'underline' }}>
                                                            {item.author} 🏠
                                                        </span>
                                                    </div>
                                                    <span style={{ fontSize: '10px', color: '#999' }}>{item.date}</span>
                                                </div>
                                                <div style={{ textAlign: 'center', backgroundColor: '#fafafa', padding: '5px', border: '1px solid #eee', marginBottom: '8px' }}>
                                                    <img src={item.content} alt="drawing" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                                                </div>

                                                {/* ✨✨ 좋아요 + 좋아요 명단 보기 ✨✨ */}
                                                <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                    <span onClick={() => toggleRecommendLike(item.id, recommendTab)} style={{ cursor: 'pointer', fontSize: '14px' }}>
                                                        {item.likes.includes(MY_NICKNAME) ? '❤️' : '🤍'} {item.likes.length}
                                                    </span>
                                                    <span onClick={() => openLikeList(item.likes)} style={{ cursor: 'pointer', color: '#999', fontSize: '12px' }}>...</span>
                                                </div>

                                            </div>
                                        ))}

                                        {getFilteredPosts(recommendTab === 'today' ? recommendPosts : friendPosts).length === 0 && (
                                            <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>
                                                {recommendTab === 'today' ? '추천글이 없습니다.' : '친구들의 새 글이 없습니다.'}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </main>
                </div>
            </WindowFrame>

            {/* 설정 팝업 */}
            {isSettingOpen && isMyHome && (
                <Draggable nodeRef={nodeRef} handle=".pink-top-line">
                    <div ref={nodeRef} style={{ position: 'fixed', top: '100px', left: '35%', zIndex: 1000 }}>
                        <WindowFrame title="Profile Setting" onClose={() => setIsSettingOpen(false)}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', width: '220px', fontSize: '12px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', margin: '0 auto 10px', backgroundImage: `url(${tempImg})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid #ccc' }} />
                                    <label style={{ cursor: 'pointer', background: '#eee', padding: '3px 8px', border: '1px solid #ccc', fontSize: '11px' }}>
                                        사진 변경
                                        <input type="file" accept="image/*" onChange={handleImgChange} style={{ display: 'none' }} />
                                    </label>
                                </div>
                                <div>닉네임: <input type="text" value={user.nickname} onChange={(e) => setUser({ ...user, nickname: e.target.value })} style={{ width: '95%' }} /></div>
                                <div>소개글: <textarea value={user.intro} onChange={(e) => setUser({ ...user, intro: e.target.value })} style={{ width: '95%', height: '40px' }} /></div>
                                <div style={{ background: '#fff0f5', padding: '8px', borderRadius: '5px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={tempIsPrivate} onChange={(e) => setTempIsPrivate(e.target.checked)} />
                                        <span style={{ fontWeight: 'bold', color: '#FF69B4' }}>🔒 비공개 홈 설정</span>
                                    </label>
                                </div>
                                <button onClick={saveSettings} style={{ background: '#FF69B4', color: '#fff', border: 'none', padding: '8px', cursor: 'pointer', marginTop: '5px' }}>저장하기 ✨</button>
                            </div>
                        </WindowFrame>
                    </div>
                </Draggable>
            )}

            {/* 글쓰기 팝업 */}
            {isWriteOpen && isMyHome && (
                <Draggable nodeRef={writeRef} handle=".pink-top-line">
                    <div ref={writeRef} style={{ position: 'fixed', top: '50px', left: '25%', zIndex: 1100 }}>
                        <WindowFrame title="New Diary" onClose={() => setIsWriteOpen(false)}>
                            <div style={{ width: '520px', background: '#fff' }}>
                                <DrawingBoard onSave={handleUpload} isExpanded={true} />
                            </div>
                        </WindowFrame>
                    </div>
                </Draggable>
            )}

            {/* 좋아요 리스트 팝업 */}
            {isLikeListOpen && (
                <Draggable nodeRef={likeRef} handle=".pink-top-line">
                    <div ref={likeRef} style={{ position: 'fixed', top: '200px', left: '40%', zIndex: 1200 }}>
                        <WindowFrame title="Who Liked?" onClose={() => setIsLikeListOpen(false)}>
                            <div style={{ width: '180px', padding: '15px', background: '#fff', fontSize: '12px', minHeight: '100px' }}>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {selectedLikeUsers.length === 0 ? <li>아직 없어요...</li> : selectedLikeUsers.map((u, i) => <li key={i}>💖 {u}</li>)}
                                </ul>
                            </div>
                        </WindowFrame>
                    </div>
                </Draggable>
            )}
        </div>
    );
};

export default MyHome;