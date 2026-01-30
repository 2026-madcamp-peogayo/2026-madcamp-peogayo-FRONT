import React from 'react';

// friends가 없을 경우를 대비해 기본값 []를 설정합니다.
const FriendList = ({ friends = [] }) => {
    return (
        <div className="friend-list" style={{ marginTop: '15px', textAlign: 'left' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#FF69B4', marginBottom: '8px', borderBottom: '1px solid #FFDEE9' }}>
                일촌 목록 ♡
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '150px', overflowY: 'auto' }}>
                {friends.map((friend) => (
                    <li key={friend.id} style={{ fontSize: '11px', marginBottom: '4px', cursor: 'pointer' }}>
                        <span style={{ color: friend.isPublic ? '#444' : '#999' }}>
                            {friend.isPublic ? '●' : '○'} {friend.nickname}
                        </span>
                    </li>
                ))}
            </ul>
            {friends.length === 0 && <p style={{ fontSize: '10px', color: '#ccc' }}>친구가 없어요..ㅠ</p>}
        </div>
    );
};

export default FriendList;