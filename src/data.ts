export type FeeStatus = "PENDING" | "PAID";

export interface FeeItem {
  name: string;
  amount: number;
}

export interface Fee {
  billMonth: string;
  totalAmount: number;
  dueDate: string;
  status: FeeStatus;
  account: {
    bank: string;
    no: string;
    holder: string;
  };
  items: FeeItem[];
}

export interface Profile {
  name: string;
  buildingName: string;
  unitNo: string;
  regionGu: string;
  email: string;
  consent: {
    privacy: boolean;
    push: boolean;
    message: boolean;
  };
}

export interface MoodQuestion {
  text: string;
  dimension: "사회적 연결" | "생활 리듬" | "마음 에너지" | "삶의 질";
  positive: boolean;
}

export interface ResourceLink {
  id: string;
  category: string;
  title: string;
  help: string;
  detail: string;
  linkUrl: string;
  phone?: string;
}

export const demoProfile: Profile = {
  name: "김도현",
  buildingName: "행복오피스텔",
  unitNo: "302",
  regionGu: "광진구",
  email: "demo@gwanribeaver.kr",
  consent: {
    privacy: true,
    push: true,
    message: true,
  },
};

const defaultAccount = {
  bank: "국민",
  no: "123456-01-789012",
  holder: "행복오피스텔관리단",
};

export const feeMonths = ["2026-04", "2026-05", "2026-06", "2026-07"];

export const fees: Record<string, Fee> = {
  "2026-05": {
    billMonth: "2026-05",
    totalAmount: 79800,
    dueDate: "2026-06-05",
    status: "PAID",
    account: defaultAccount,
    items: [
      { name: "일반관리비", amount: 32800 },
      { name: "전기료", amount: 23000 },
      { name: "수도료", amount: 12000 },
      { name: "공용시설관리비", amount: 7000 },
      { name: "건물보험료", amount: 5000 },
    ],
  },
  "2026-06": {
    billMonth: "2026-06",
    totalAmount: 81200,
    dueDate: "2026-07-05",
    status: "PAID",
    account: defaultAccount,
    items: [
      { name: "일반관리비", amount: 32000 },
      { name: "전기료", amount: 25000 },
      { name: "수도료", amount: 11000 },
      { name: "공용시설관리비", amount: 8200 },
      { name: "건물보험료", amount: 5000 },
    ],
  },
  "2026-07": {
    billMonth: "2026-07",
    totalAmount: 87400,
    dueDate: "2026-08-05",
    status: "PENDING",
    account: defaultAccount,
    items: [
      { name: "일반관리비", amount: 32000 },
      { name: "전기료", amount: 28000 },
      { name: "도시가스비", amount: 14000 },
      { name: "수도료", amount: 8000 },
      { name: "건물보험료", amount: 5400 },
    ],
  },
};

export const notices = [
  {
    id: "notice-isolation-center",
    title: "혼자여도 괜찮아요 — 서울시 고립예방센터 안내",
    summary: "가까운 곳에서 받을 수 있는 도움과 프로그램을 확인해보세요.",
    linkUrl: "https://www.welfare.seoul.kr/web/contents/business1-4-7.do",
    pinned: true,
  },
  {
    id: "notice-emergency-welfare",
    title: "갑작스러운 생계·주거 위기, 서울형 긴급복지가 도와드려요",
    summary: "생계비·주거비·의료비 등 위기 상황별 지원 기준과 신청 방법을 확인하세요.",
    linkUrl: "https://news.seoul.go.kr/welfare/archives/48196",
    pinned: false,
  },
  {
    id: "notice-hangang-pool",
    title: "한강 수영장 개장 — 서울 도심에서 즐기는 여름 물놀이",
    summary: "뚝섬·여의도 수영장과 4개 물놀이장의 운영 기간·시간·요금을 확인하세요.",
    linkUrl: "https://hangang.seoul.go.kr/www/eventMng/detail.do?evntSn=432&mid=53",
    pinned: false,
  },
];

export const moodQuestions: MoodQuestion[] = [
  {
    text: "요즘 하루가 비슷하게 반복된다고 느꼈다.",
    dimension: "삶의 질",
    positive: false,
  },
  {
    text: "누군가와 편하게 이야기를 나눌 수 있다고 느꼈다.",
    dimension: "사회적 연결",
    positive: true,
  },
  {
    text: "집 밖으로 나가는 일이 부담스럽거나 피하고 싶었다.",
    dimension: "사회적 연결",
    positive: false,
  },
  {
    text: "아무것도 하고 싶지 않거나 기운이 없었다.",
    dimension: "마음 에너지",
    positive: false,
  },
  {
    text: "식사나 씻기 같은 기본적인 일상을 챙기기 어려웠다.",
    dimension: "생활 리듬",
    positive: false,
  },
  {
    text: "앞으로의 삶이 조금이라도 나아질 수 있다고 느꼈다.",
    dimension: "삶의 질",
    positive: true,
  },
];

export const gwangjinResources: ResourceLink[] = [
  {
    id: "gwangjin-mental-health",
    category: "마음 상담",
    title: "광진구 정신건강복지센터",
    help: "마음이 지치거나 일상 유지가 어려울 때",
    detail: "전문상담, 정신건강 평가와 지속적인 사례관리 서비스를 받을 수 있어요.",
    linkUrl: "https://gwangjin.go.kr/health/main/contents.do?menuNo=300107",
    phone: "02-450-1895",
  },
  {
    id: "gwangjin-one-person-center",
    category: "관계·생활",
    title: "광진구 1인가구지원센터",
    help: "혼자 지내는 일상에 사람과 활동이 필요할 때",
    detail: "사회적 관계망, 상담, 교육, 여가문화와 생활지원 프로그램을 연결해요.",
    linkUrl: "https://gwangjin.go.kr/portal/main/contents.do?menuNo=201691",
    phone: "02-465-0336",
  },
  {
    id: "gwangjin-one-person-programs",
    category: "생활 지원",
    title: "광진구 1인가구 지원사업",
    help: "건강검진·식사·주거·상담 지원을 찾을 때",
    detail: "무료 건강검진, 마음건강 상담비, 청년도시락, 이사 지원 등 사업을 한 번에 확인해요.",
    linkUrl: "https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=201574",
  },
  {
    id: "gwangjin-integrated-care",
    category: "돌봄·주거",
    title: "광진구 의료·요양 통합돌봄",
    help: "방문건강·생활돌봄·집수리가 함께 필요할 때",
    detail: "방문진료와 정신건강관리, 일상생활 돌봄, 긴급복지와 주거 지원을 통합 연결해요.",
    linkUrl: "https://gwangjin.go.kr/portal/main/contents.do?menuNo=201860",
    phone: "02-450-1140",
  },
];

export const quickSupportLinks = [
  {
    title: "서울형 긴급복지",
    summary: "갑작스러운 생계·주거·의료 위기 지원",
    linkUrl: "https://news.seoul.go.kr/welfare/archives/48196",
  },
  {
    title: "광진구 정신건강복지센터",
    summary: "마음 상담과 지속적인 지역 연계",
    linkUrl: "https://gwangjin.go.kr/health/main/contents.do?menuNo=300107",
  },
];

export const formatWon = (amount: number) =>
  new Intl.NumberFormat("ko-KR").format(amount) + "원";

export const formatMonth = (month: string) => {
  const [year, value] = month.split("-");
  return `${year}년 ${Number(value)}월`;
};

export const formatDate = (date: string) => date.replaceAll("-", ".");
