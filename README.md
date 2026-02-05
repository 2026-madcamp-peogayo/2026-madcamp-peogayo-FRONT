
# 🎨 퍼가요~

> **"그때 그 감성 그대로"** — 직접 그린 그림과 사진으로 소통하는 레트로 SNS 플랫폼

## 📝 프로젝트 소개

퍼가요는 2000년대 초반 싸이월드의 감성을 현대적인 기술 스택으로 재현한 SNS.
텍스트 위주의 정형화된 포스팅에서 벗어나, HTML5 Canvas를 활용한 그림판 에디터로 사용자만의 개성을 표현할 수 있는 소셜 네트워킹 서비스를 지향

---

## 🛠 Tech Stack

### Frontend

* **Library:** React.js
* **Styling:** CSS3 (Retro UI Design)
* **Feature:** HTML5 Canvas API

### Backend

* **Framework:** Spring Boot 3.x
* **Data JPA:** Hibernate (ORM)
* **Database:** MySQL 8.0
* **Security:** Session-based Authentication

---

## Key Features

### 1. 🖌️ Plaza

* 마우스/터치를 이용한 실시간 드로잉 기능.
* 생성된 그림을 `Blob` 데이터로 변환하여 서버에 전송.

<img width="1192" height="867" alt="image (3)" src="https://github.com/user-attachments/assets/86722da8-450d-4d33-a851-6ea293b2cd8b" />

### 2. 🏠 My Home 

* 유저별 개인 페이지 제공 (프로필, 배경화면, 인사말 설정).
* **공개/비공개 설정:** 마이홈 및 친구 목록의 노출 여부를 선택하여 프라이버시 보호.
* 게시글에는 그림만 등록 가능 (+ 바로 촬영을 하여 꾸며서 올릴수있음)
<img width="1195" height="865" alt="image (1)" src="https://github.com/user-attachments/assets/00499c4e-c752-41ae-85a6-a93bef21a25e" />

<img width="1195" height="868" alt="image" src="https://github.com/user-attachments/assets/89765999-183d-4a5e-ad87-1a6144cd89c9" />

### 3. 🌊 Random Wave (파도타기)

* `ORDER BY RAND()` 쿼리를 활용하여 전체 공개 유저 중 한 명의 마이홈으로 랜덤 이동.
* 새로운 이웃을 발견하는 레트로 방식의 네트워킹.

### 4. 🤝 Friend System (일촌)

* 일촌 신청,해제 기능.
* 친구 관계에 따른 게시글 열람 권한 차등 부여.

### 5. 📖 Guestbook

* 타인의 홈에 방문하여 메시지를 남길 수 있는 소통 창구 방명록.
<img width="1185" height="868" alt="image (2)" src="https://github.com/user-attachments/assets/179857a1-0ccb-468a-a825-7f4e65fbf334" />

---

## Database Architecture

* **Users:** 회원 정보 및 홈 설정값 관리.
* **Posts:** 게시글 데이터 및 이미지 경로 저장.
* **Friends:** 유저 간 관계 상태(`PENDING`, `ACCEPTED`) 관리.
* **Guestbook:** 유저 간 짧은 메시지 데이터 관리.

---
