/*
  FANTUBE ARCHIVE MEDIA — 영상 설정 파일
  영상 추가/수정은 이 파일만 편집하면 됩니다.

  youtubeId: 유튜브 주소의 영상 ID
    예) https://www.youtube.com/watch?v=ABC123xyz00
    youtubeId: "ABC123xyz00"

  category: STAGE, FAN EVENT, FESTIVAL, OTHER 중 하나
  titleKo / titleEn: 한국어 / 영어 제목
  date: 표시할 날짜 (예: 2026.10.21)
  subtitleKo / subtitleEn: 짧은 설명
  url: 영상 주소. 비워두면 카드가 유튜브로 이동하지 않습니다.

  아래는 예시 카드입니다. 실제 영상 주소로 바꿔 주세요.
*/
window.FAM_VIDEOS = [
  {
    youtubeId: "eWdaMBoFOWA",
    url: "https://www.youtube.com/watch?v=eWdaMBoFOWA",
    category: "STAGE",
    titleKo: "앳하트 — 무대 직캠",
    titleEn: "AtHeart — Stage Cam",
    date: "LATEST",
    subtitleKo: "앳하트 구리 코스모스 축제",
    subtitleEn: "AtHeart Guri COSMOS Festival fancam",
    graphic: "STAGE CAM"
  },
  {
    youtubeId: "kthim28tD6Y",
    url: "https://www.youtube.com/watch?v=kthim28tD6Y",
    category: "FAN EVENT",
    titleKo: "팬사인회 현장 기록",
    titleEn: "Fan Sign Event",
    date: "ARCHIVE",
    subtitleKo: "뮤직플랜트 팬사인회 현장영상",
    subtitleEn: "Fansign events moments",
    graphic: "FAN EVENT"
  },
  {
    youtubeId: "eoZT4oWlO4o",
    url: "https://www.youtube.com/watch?v=eoZT4oWlO4o",
    category: "FESTIVAL",
    titleKo: "대학 축제 라이브",
    titleEn: "University Festival Live",
    date: "ARCHIVE",
    subtitleKo: "앳하트 수원과학대학교 BIMA 축제 현장",
    subtitleEn: "Festival and live performance archive",
    graphic: "LIVE MOMENTS"
  }
];

window.FAM_SETTINGS = {
  email: "peace0602@hotmail.com", // 문의 이메일 입력
  youtube: "https://www.youtube.com/channel/UCF_76U7I7UxadB0O3yLg_dw", // 유튜브 채널 주소 입력
  social: "https://x.com/Fantube_AtHeart" // SNS 주소 입력
};
