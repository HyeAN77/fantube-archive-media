FANTUBE ARCHIVE MEDIA 홈페이지 v3 — 시작 안내
============================================

구성 파일
- index.html : 홈페이지 내용 및 NEWS / VIDEO ARCHIVE / EVENT COVERAGE 섹션
- fantube-signature.png : 채널 시그니처 마크
- style.css  : 디자인 / 색상 / 모바일 레이아웃
- videos.js  : 영상 목록, 유튜브 채널, 이메일, SNS 주소 설정
- script.js  : 언어 전환, 카테고리 필터 등 기능

1. 영상 추가하기
----------------
videos.js 파일을 메모장이나 코드 편집기로 엽니다.
window.FAM_VIDEOS 배열 안에 있는 예시를 실제 영상 정보로 교체하세요.

유튜브 주소 예시:
https://www.youtube.com/watch?v=AbCdEf12345
여기서 v= 뒤의 AbCdEf12345가 youtubeId입니다.

예:
{
  youtubeId: "AbCdEf12345",
  url: "https://www.youtube.com/watch?v=AbCdEf12345",
  category: "STAGE",
  titleKo: "앳하트 — 대학 축제 직캠",
  titleEn: "AtHeart — University Festival Stage Cam",
  date: "2026.10.21",
  subtitleKo: "대학 축제 무대 기록",
  subtitleEn: "Live stage at a university festival",
  graphic: "STAGE CAM"
}

category는 STAGE / FAN EVENT / FESTIVAL / OTHER 중 하나를 사용합니다. 홈페이지에는 NEWS, VIDEO ARCHIVE, EVENT COVERAGE 섹션이 추가되어 있습니다. NEWS의 예시 카드는 현재 디자인용 샘플이며 실제 기사로 교체해 주세요.
youtubeId를 입력하면 유튜브 썸네일이 자동으로 표시됩니다.
카드 제목을 누르면 해당 영상으로 이동합니다.

2. 연락처 / 채널 설정하기
-------------------------
videos.js 맨 아래 FAM_SETTINGS에서 다음 항목을 바꾸세요.

email: "문의받을 이메일 주소"
youtube: "유튜브 채널 URL"
social: "인스타그램 등 SNS URL"

3. 내 컴퓨터에서 미리보기
-------------------------
index.html 파일을 웹 브라우저로 열면 미리 볼 수 있습니다.
Google Fonts를 사용하므로 인터넷 연결 시 글꼴이 더 정확하게 표시됩니다.

4. 무료로 인터넷에 공개하기 (Cloudflare Pages 추천)
--------------------------------------------------
Cloudflare Pages는 정적 HTML/CSS/JS 사이트를 무료 플랜으로 배포할 수 있습니다.
공식 안내: https://pages.cloudflare.com/

간단한 방법:
1) https://dash.cloudflare.com/ 에서 계정을 만듭니다.
2) Workers & Pages 또는 Pages 메뉴로 이동합니다.
3) 새 Pages 프로젝트를 만들고 Direct Upload(파일 직접 업로드)를 선택합니다.
4) 이 압축 파일을 푼 폴더의 파일 4개를 업로드합니다.
5) 배포 후 제공되는 *.pages.dev 주소로 사이트를 확인합니다.

메뉴 이름은 Cloudflare 화면 업데이트에 따라 조금 다를 수 있습니다.
자체 도메인은 나중에 구매해서 연결할 수 있습니다.

참고:
- 이 홈페이지는 정적 사이트입니다. 회원가입, 관리자 로그인, 게시물 작성용 데이터베이스는 없습니다.
- 새 영상을 추가할 때는 videos.js를 수정하고 사이트를 다시 배포하면 됩니다.
- 유튜브 영상을 홈페이지에 직접 업로드하지 않습니다. 유튜브 링크와 썸네일을 사용합니다.
- 문의 이메일과 채널 링크는 실제 주소로 바꾼 뒤 공개하세요.

5. v3 글자 크기
------------
상단 메뉴와 본문 설명, 영상 제목, 뉴스 제목, 문의 링크 등의 글자 크기를 전반적으로 조금 키워 큰 모니터에서도 읽기 편하게 조정했습니다. 모바일 화면은 기존의 작은 화면 레이아웃을 유지합니다.
