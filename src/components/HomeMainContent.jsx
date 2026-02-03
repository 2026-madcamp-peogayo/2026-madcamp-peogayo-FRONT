import React from 'react';

const API_BASE_URL = 'http://13.125.245.75:8080';

const HomeMainContent = ({
    activeTab, homeContentTab, setHomeContentTab, // 기존 탭 상태
    feedTab, setFeedTab, // ★ 추가된 피드 탭 상태 ('ALL' or 'FRIENDS')
    canAccess, isMyHome,
    posts, guestbook, newGuestMsg, setNewGuestMsg,
    onOpenWrite, onLike, onShowLikes, onAddGuestbook,
    onDeleteGuestbook, onDeletePost, onVisitHome // ★ 파도타기용 함수
}) => {

    // ─────────────────────────────────────────────
    // (A) 추천 친구 탭 (뉴스피드 기능: 전체글 vs 친구글)
    // ─────────────────────────────────────────────
    if (activeTab === 'recommend') {
        return (
            <div style={{ padding: '15px', fontFamily: 'DungGeunMo, sans-serif' }}>
                {/* 1. 피드 상단 탭 (전체 vs 일촌) */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
                    <button
                        onClick={() => setFeedTab('ALL')}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', border: 'none',
                            backgroundColor: feedTab === 'ALL' ? '#FF69B4' : '#eee',
                            color: feedTab === 'ALL' ? '#fff' : '#555',
                            fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                    >
                        🔥 전체 추천글
                    </button>
                    <button
                        onClick={() => setFeedTab('FRIENDS')}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', border: 'none',
                            backgroundColor: feedTab === 'FRIENDS' ? '#FF69B4' : '#eee',
                            color: feedTab === 'FRIENDS' ? '#fff' : '#555',
                            fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                    >
                        🥕 내 일촌 소식
                    </button>
                </div>

                {/* 2. 피드 리스트 (게시글 출력) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {posts && posts.length > 0 ? (
                        posts.map((post) => (
                            <div key={post.id} style={{ border: '1px solid #FFC1CC', padding: '15px', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>

                                {/* 작성자 정보 (클릭 시 파도타기) */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px dashed #eee' }}>
                                    <div
                                        onClick={() => onVisitHome(post.writerId)}
                                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        {/* 프로필 이미지 (없으면 기본 원형) */}
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%', background: '#eee',
                                            backgroundImage: post.writerProfileImg ? `url(${post.writerProfileImg.startsWith('http') ? post.writerProfileImg : API_BASE_URL + post.writerProfileImg})` : 'none',
                                            backgroundSize: 'cover', backgroundPosition: 'center'
                                        }} />
                                        <span style={{ fontWeight: 'bold', color: '#003399', fontSize: '14px' }}>{post.writerNickname}</span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#999', marginLeft: 'auto' }}>
                                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                                    </span>
                                </div>

                                {/* 이미지 */}
                                {post.contentImageUrl && (
                                    <div style={{ textAlign: 'center', margin: '10px 0' }}>
                                        <img
                                            src={post.contentImageUrl.startsWith('http') ? post.contentImageUrl : `${API_BASE_URL}${post.contentImageUrl}`}
                                            alt="content"
                                            onError={(e) => e.target.style.display = 'none'}
                                            style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '5px', border: '1px solid #eee' }}
                                        />
                                    </div>
                                )}

                                {/* 내용 */}
                                <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '15px', color: '#333' }}>
                                    {post.contentText}
                                </div>

                                {/* 좋아요 영역 */}
                                <div style={{ fontSize: '12px', color: '#888', display: 'flex', gap: '5px', alignItems: 'center' }}>

                                    {/* 1. 하트와 '좋아요' 글씨 -> 클릭 시 좋아요 토글 (onLike) */}
                                    <span
                                        onClick={() => onLike(post.id)}
                                        style={{ cursor: 'pointer', color: post.isLiked ? '#FF69B4' : '#888', fontWeight: 'bold' }}
                                    >
                                        {post.isLiked ? '❤️' : '🤍'} 좋아요
                                    </span>

                                    {/* 2. 숫자 부분 -> 클릭 시 팝업 열기 (onShowLikes) */}
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation(); // 혹시 모를 버블링 방지
                                            onShowLikes(post.id); // ★ 명단 보기 함수 실행
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            color: '#333',
                                            textDecoration: 'underline' // 클릭 가능하다는 느낌 주기
                                        }}
                                    >
                                        ({post.likeCount || 0})
                                    </span>

                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
                            {feedTab === 'ALL' ? '😅 지금은 올라온 추천 글이 없어요.' : '📭 일촌들이 아직 글을 안 올렸어요!'}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // (B) 비공개 홈피 차단
    // ─────────────────────────────────────────────
    if (!canAccess && activeTab === 'home') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', color: '#888' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
                <div>일촌에게만 공개된 홈피입니다.</div>
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // (C) 메인 화면 (내 홈피 or 친구 홈피 방문)
    // ─────────────────────────────────────────────
    return (
        <div style={{ padding: '15px', fontFamily: 'DungGeunMo, sans-serif' }}>

            {/* 탭 버튼 (게시판 / 방명록) */}
            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', borderBottom: '2px solid #ccc' }}>
                <button
                    onClick={() => setHomeContentTab('posts')}
                    style={{
                        padding: '6px 12px', cursor: 'pointer',
                        fontWeight: homeContentTab === 'posts' ? 'bold' : 'normal',
                        backgroundColor: homeContentTab === 'posts' ? '#fff' : '#eee',
                        border: '1px solid #ccc', borderBottom: 'none',
                        borderTopLeftRadius: '5px', borderTopRightRadius: '5px',
                        color: homeContentTab === 'posts' ? '#333' : '#999'
                    }}
                >
                    게시판
                </button>
                <button
                    onClick={() => setHomeContentTab('guestbook')}
                    style={{
                        padding: '6px 12px', cursor: 'pointer',
                        fontWeight: homeContentTab === 'guestbook' ? 'bold' : 'normal',
                        backgroundColor: homeContentTab === 'guestbook' ? '#fff' : '#eee',
                        border: '1px solid #ccc', borderBottom: 'none',
                        borderTopLeftRadius: '5px', borderTopRightRadius: '5px',
                        color: homeContentTab === 'guestbook' ? '#333' : '#999'
                    }}
                >
                    방명록
                </button>
            </div>

            {/* 1. 게시판 내용 */}
            {homeContentTab === 'posts' && (
                <div>
                    {/* 글쓰기 버튼 (내 홈피일 때만) */}
                    {isMyHome && (
                        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                            <button onClick={onOpenWrite} style={{ cursor: 'pointer', backgroundColor: '#FF69B4', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', fontSize: '13px', fontWeight: 'bold', boxShadow: '1px 1px 2px #ccc' }}>
                                ✏️ 글쓰기
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <div key={post.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>

                                    {/* 헤더 */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '13px', color: '#555', borderBottom: '1px dashed #eee', paddingBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#003399' }}>{post.writerNickname}</span>
                                            <span style={{ fontSize: '11px', color: '#999' }}>
                                                ({post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '날짜없음'})
                                            </span>
                                        </div>
                                        {isMyHome && (
                                            <button onClick={() => onDeletePost(post.id)} style={{ backgroundColor: 'transparent', border: '1px solid #ddd', color: 'red', cursor: 'pointer', fontSize: '11px', padding: '2px 6px', borderRadius: '3px' }}>
                                                삭제 🗑️
                                            </button>
                                        )}
                                    </div>

                                    {/* 이미지 */}
                                    {post.contentImageUrl && (
                                        <div style={{ textAlign: 'center', margin: '10px 0 20px 0' }}>
                                            <img
                                                src={post.contentImageUrl.startsWith('http') ? post.contentImageUrl : `${API_BASE_URL}${post.contentImageUrl}`}
                                                alt="post"
                                                onError={(e) => e.target.style.display = 'none'}
                                                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px', border: '1px solid #eee' }}
                                            />
                                        </div>
                                    )}

                                    {/* 텍스트 */}
                                    <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '15px', color: '#333' }}>
                                        {post.contentText}
                                    </div>

                                    {/* 좋아요 */}
                                    <div style={{ fontSize: '12px', color: '#888', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span onClick={() => onLike(post.id)} style={{ cursor: 'pointer', color: post.isLiked ? '#FF69B4' : '#888', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            {post.isLiked ? '❤️' : '🤍'} 좋아요
                                        </span>
                                        <span onClick={() => onShowLikes(post.id)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                                            ({post.likeCount || 0})
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '50px 0', color: '#999', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                                <div>📭</div>
                                <div>게시글이 아직 없어요.</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 2. 방명록 내용 */}
            {homeContentTab === 'guestbook' && (
                <div>
                    <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #ddd' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={newGuestMsg}
                                onChange={(e) => setNewGuestMsg(e.target.value)}
                                placeholder="일촌평을 남겨주세요~!"
                                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
                                onKeyPress={(e) => e.key === 'Enter' && onAddGuestbook()}
                            />
                            <button onClick={onAddGuestbook} style={{ padding: '0 15px', cursor: 'pointer', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '3px' }}>등록</button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {guestbook && guestbook.length > 0 ? guestbook.map(gb => (
                            <div key={gb.id} style={{ padding: '12px', background: '#fff', border: '1px solid #eee', borderRadius: '5px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {/* 방명록 작성자 프로필 */}
                                    <div style={{
                                        width: '30px', height: '30px', borderRadius: '50%', background: '#eee',
                                        backgroundImage: gb.writerProfileImg ? `url(${gb.writerProfileImg.startsWith('http') ? gb.writerProfileImg : API_BASE_URL + gb.writerProfileImg})` : 'none',
                                        backgroundSize: 'cover', backgroundPosition: 'center'
                                    }} />
                                    <div>
                                        <span style={{ fontWeight: 'bold', color: '#003399', marginRight: '5px' }}>{gb.writerNickname}</span>
                                        <span>{gb.content}</span>
                                        <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>
                                            {gb.createdAt ? new Date(gb.createdAt).toLocaleDateString() : ''}
                                        </div>
                                    </div>
                                </div>
                                {(isMyHome || gb.writerId === (guestbook.myInfo?.id || 0)) && (
                                    <button onClick={() => onDeleteGuestbook(gb.id)} style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#ccc', fontSize: '16px' }}>&times;</button>
                                )}
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>아직 방명록이 없습니다.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeMainContent;