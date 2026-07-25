import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  demoProfile,
  feeMonths,
  fees,
  formatDate,
  formatMonth,
  formatWon,
  gwangjinResources,
  moodQuestions,
  notices,
  quickSupportLinks,
  type Fee,
  type Profile,
} from "./data";

type Screen =
  | "splash"
  | "login"
  | "signup"
  | "home"
  | "community"
  | "detail"
  | "settings"
  | "mood"
  | "mood-question"
  | "mood-result"
  | "help-request"
  | "resource";

type ConsentKey = "privacy" | "push" | "message";

const STORAGE_KEY = "gwanribeaver_session";
const PROFILE_KEY = "gwanribeaver_profile";

const consentCopy: Record<
  ConsentKey,
  { title: string; summary: string; body: string }
> = {
  privacy: {
    title: "개인정보 수집·이용 동의",
    summary: "서비스 제공을 위한 필수 동의",
    body: "이름, 이메일, 건물명, 호수, 거주 지역(구 단위)을 회원 식별과 관리비 고지 제공을 위해 수집합니다. 회원 탈퇴 시 지체 없이 파기하며, 실시간 위치나 상세 주소는 수집하지 않습니다.",
  },
  push: {
    title: "알림(푸시) 수신 동의",
    summary: "관리비 고지와 납부기한 안내",
    body: "관리비 고지 등록, 납부기한 임박 등 서비스 이용에 필요한 알림을 받을 수 있습니다. 설정 화면에서 언제든 수신 여부를 변경할 수 있습니다.",
  },
  message: {
    title: "메시지 수신 동의",
    summary: "생활·복지 정보 안내",
    body: "1인 가구 생활 정보와 지역 복지 프로그램 안내를 받을 수 있습니다. 동의를 철회해도 관리비 조회 기능은 그대로 이용할 수 있습니다.",
  },
};

function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [profile, setProfile] = useState<Profile>(demoProfile);
  const [selectedMonth, setSelectedMonth] = useState("2026-07");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [modalConsent, setModalConsent] = useState<ConsentKey | null>(null);
  const [moodScore, setMoodScore] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const splashTimer = window.setTimeout(() => {
      try {
        const token =
          localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
        const savedProfile = localStorage.getItem(PROFILE_KEY);
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile) as Profile);
        }
        setScreen(token ? "home" : "login");
      } catch {
        setScreen("login");
      }
    }, 950);
    return () => window.clearTimeout(splashTimer);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const fee = fees[selectedMonth];

  function showToast(message: string) {
    setToast(message);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setToast(""), 2600);
  }

  function navigate(next: Screen) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setScreen(next);
  }

  function simulateLoad(action: () => void) {
    setLoading(true);
    window.setTimeout(() => {
      try {
        action();
      } catch {
        showToast("정보를 불러오지 못했어요. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    }, 360);
  }

  function changeMonth(direction: -1 | 1) {
    const current = feeMonths.indexOf(selectedMonth);
    const next = Math.min(Math.max(current + direction, 0), feeMonths.length - 1);
    if (next === current) return;
    simulateLoad(() => setSelectedMonth(feeMonths[next]));
  }

  async function copyAccount(accountNo: string) {
    try {
      await navigator.clipboard.writeText(accountNo);
      showToast("계좌번호가 복사됐어요.");
    } catch {
      showToast("복사하지 못했어요. 계좌번호를 길게 눌러 복사해주세요.");
    }
  }

  function login(email: string, password: string, autoLogin: boolean) {
    setLoading(true);
    window.setTimeout(() => {
      if (
        email.trim().toLowerCase() === "demo@gwanribeaver.kr" &&
        password === "beaver1234"
      ) {
        const target = autoLogin ? localStorage : sessionStorage;
        target.setItem(STORAGE_KEY, "demo-session-token");
        setProfile(demoProfile);
        setLoading(false);
        navigate("home");
        showToast("도현님, 다시 오셨군요.");
        return;
      }
      setLoading(false);
      showToast("아이디 또는 비밀번호를 확인해주세요.");
    }, 520);
  }

  function signUp(nextProfile: Profile) {
    setLoading(true);
    window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "local-signup-token");
      localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
      setProfile(nextProfile);
      setLoading(false);
      navigate("home");
      showToast(`${nextProfile.name}님, 관리비버에 오신 걸 환영해요.`);
    }, 560);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    navigate("login");
    showToast("안전하게 로그아웃했어요.");
  }

  function updatePush(value: boolean) {
    const nextProfile = {
      ...profile,
      consent: { ...profile.consent, push: value },
    };
    setProfile(nextProfile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
    showToast(value ? "관리비 알림을 켰어요." : "관리비 알림을 껐어요.");
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        본문으로 바로가기
      </a>
      {screen === "splash" ? (
        <Splash />
      ) : screen === "login" ? (
        <LoginScreen loading={loading} onLogin={login} onSignup={() => navigate("signup")} />
      ) : screen === "signup" ? (
        <SignUpScreen
          loading={loading}
          onBack={() => navigate("login")}
          onSubmit={signUp}
          onOpenConsent={setModalConsent}
        />
      ) : (
        <AuthenticatedShell
          screen={screen}
          profile={profile}
          fee={fee}
          selectedMonth={selectedMonth}
          loading={loading}
          moodScore={moodScore}
          onNavigate={navigate}
          onChangeMonth={changeMonth}
          onCopyAccount={copyAccount}
          onOpenNotice={(url) => {
            try {
              const opened = window.open(url, "_blank", "noopener,noreferrer");
              if (!opened) throw new Error("popup blocked");
            } catch {
              showToast("연결에 실패했어요. 잠시 후 다시 시도해주세요.");
            }
          }}
          onRetry={() => simulateLoad(() => setSelectedMonth(selectedMonth))}
          onLogout={logout}
          onUpdatePush={updatePush}
          onOpenConsent={setModalConsent}
          onMoodComplete={(score) => {
            setMoodScore(score);
            navigate("mood-result");
          }}
        />
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span aria-hidden="true">✓</span>
          {toast}
        </div>
      )}

      {modalConsent && (
        <ConsentModal
          consentKey={modalConsent}
          onClose={() => setModalConsent(null)}
        />
      )}
    </div>
  );
}

function Splash() {
  return (
    <main className="splash-screen" aria-label="관리비버 시작 화면">
      <div className="splash-mark">
        <span className="brand-name">관리비버</span>
        <span className="brand-dot">.</span>
      </div>
      <div className="splash-mascot-wrap">
        <img src="/beaver-mascot.png" alt="안전모와 안경을 쓴 관리비버" />
      </div>
      <p>관리비 확인에서 시작되는 안심</p>
      <span className="loader" role="status" aria-label="로그인 상태 확인 중" />
    </main>
  );
}

interface LoginProps {
  loading: boolean;
  onLogin: (email: string, password: string, autoLogin: boolean) => void;
  onSignup: () => void;
}

function LoginScreen({ loading, onLogin, onSignup }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [autoLogin, setAutoLogin] = useState(true);

  function submit(event: FormEvent) {
    event.preventDefault();
    onLogin(email, password, autoLogin);
  }

  function fillDemo() {
    setEmail("demo@gwanribeaver.kr");
    setPassword("beaver1234");
  }

  return (
    <main id="main-content" className="auth-page">
      <section className="auth-intro">
        <div className="compact-brand">
          관리비버<span>.</span>
        </div>
        <div className="auth-mascot">
          <img src="/beaver-mascot.png" alt="" />
        </div>
        <p className="eyebrow">MONTHLY, CLEARLY.</p>
        <h1>
          관리비는 명확하게,
          <br />
          안심은 <em>가까이.</em>
        </h1>
        <p className="auth-copy">
          매달 꼭 확인하는 관리비 안에, 필요한 생활 정보와 도움의 접점을
          담았습니다.
        </p>
      </section>

      <section className="auth-card hard-shadow">
        <div className="section-heading">
          <div>
            <span className="eyebrow">WELCOME BACK</span>
            <h2>로그인</h2>
          </div>
          <button className="text-button" type="button" onClick={fillDemo}>
            데모 계정 채우기
          </button>
        </div>
        <form onSubmit={submit}>
          <label>
            아이디 / 이메일
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일을 입력해주세요"
              autoComplete="email"
              required
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력해주세요"
              autoComplete="current-password"
              required
            />
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={autoLogin}
              onChange={(event) => setAutoLogin(event.target.checked)}
            />
            <span>자동 로그인</span>
          </label>
          <button className="primary-button full-button" disabled={loading}>
            {loading ? <span className="button-loader" /> : "로그인"}
          </button>
        </form>
        <div className="demo-note">
          <strong>발표용 데모</strong>
          <span>demo@gwanribeaver.kr · beaver1234</span>
        </div>
        <p className="auth-switch">
          처음이신가요?
          <button type="button" onClick={onSignup}>
            회원가입
          </button>
        </p>
      </section>
    </main>
  );
}

interface SignUpProps {
  loading: boolean;
  onBack: () => void;
  onSubmit: (profile: Profile) => void;
  onOpenConsent: (key: ConsentKey) => void;
}

function SignUpScreen({
  loading,
  onBack,
  onSubmit,
  onOpenConsent,
}: SignUpProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    buildingName: "",
    unitNo: "",
    regionGu: "",
  });
  const [consent, setConsent] = useState<Record<ConsentKey, boolean>>({
    privacy: false,
    push: false,
    message: false,
  });

  const allConsented = Object.values(consent).every(Boolean);
  const allFilled = Object.values(form).every((value) => value.trim().length > 0);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!allConsented || !allFilled) return;
    onSubmit({
      name: form.name,
      email: form.email,
      buildingName: form.buildingName,
      unitNo: form.unitNo,
      regionGu: form.regionGu,
      consent,
    });
  }

  return (
    <main id="main-content" className="form-page">
      <header className="page-topbar">
        <button className="icon-button" type="button" onClick={onBack} aria-label="로그인으로 돌아가기">
          ←
        </button>
        <div className="compact-brand">
          관리비버<span>.</span>
        </div>
        <span className="topbar-spacer" />
      </header>
      <section className="signup-hero">
        <span className="eyebrow">HELLO, NEIGHBOR</span>
        <h1>반가워요.</h1>
        <p>관리비를 편하게 확인할 수 있도록 기본 정보를 알려주세요.</p>
      </section>
      <form className="signup-form" onSubmit={submit}>
        <div className="form-section">
          <h2>
            <span>01</span> 계정 정보
          </h2>
          <label>
            이름
            <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="이름" required />
          </label>
          <label>
            아이디 / 이메일
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="name@example.com" required />
          </label>
          <label>
            비밀번호
            <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="6자 이상 입력해주세요" minLength={6} required />
          </label>
        </div>
        <div className="form-section">
          <h2>
            <span>02</span> 거주 정보
          </h2>
          <label>
            건물명
            <input value={form.buildingName} onChange={(e) => update("buildingName", e.target.value)} placeholder="예: 행복오피스텔" required />
          </label>
          <div className="field-grid">
            <label>
              호수
              <input value={form.unitNo} onChange={(e) => update("unitNo", e.target.value)} placeholder="예: 302" required />
            </label>
            <label>
              거주지
              <input value={form.regionGu} onChange={(e) => update("regionGu", e.target.value)} placeholder="예: 광진구" required />
            </label>
          </div>
          <p className="privacy-note">실시간 위치와 상세주소는 수집하지 않아요.</p>
        </div>
        <div className="form-section consent-section">
          <div className="consent-title-row">
            <h2>
              <span>03</span> 이용 동의
            </h2>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                const next = !allConsented;
                setConsent({ privacy: next, push: next, message: next });
              }}
            >
              모두 동의
            </button>
          </div>
          {(Object.keys(consent) as ConsentKey[]).map((key) => (
            <div className="consent-row" key={key}>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={consent[key]}
                  onChange={(event) =>
                    setConsent((current) => ({ ...current, [key]: event.target.checked }))
                  }
                />
                <span>
                  {consentCopy[key].title} <small>(필수)</small>
                </span>
              </label>
              <button type="button" className="detail-link" onClick={() => onOpenConsent(key)}>
                전문 보기
              </button>
            </div>
          ))}
        </div>
        <button className="primary-button full-button signup-submit" disabled={!allFilled || !allConsented || loading}>
          {loading ? <span className="button-loader" /> : "가입하고 시작하기"}
        </button>
      </form>
    </main>
  );
}

interface AuthenticatedShellProps {
  screen: Screen;
  profile: Profile;
  fee: Fee | undefined;
  selectedMonth: string;
  loading: boolean;
  moodScore: number;
  onNavigate: (screen: Screen) => void;
  onChangeMonth: (direction: -1 | 1) => void;
  onCopyAccount: (account: string) => void;
  onOpenNotice: (url: string) => void;
  onRetry: () => void;
  onLogout: () => void;
  onUpdatePush: (value: boolean) => void;
  onOpenConsent: (key: ConsentKey) => void;
  onMoodComplete: (score: number) => void;
}

function AuthenticatedShell(props: AuthenticatedShellProps) {
  const showTabs =
    props.screen === "home" ||
    props.screen === "community" ||
    props.screen === "settings";
  return (
    <div className="app-frame">
      <header className="desktop-app-header">
        <div className="compact-brand">
          관리비버<span>.</span>
        </div>
        <span>관리비 확인에서 시작되는 안심</span>
      </header>
      <main id="main-content" className={showTabs ? "app-content with-tabs" : "app-content"}>
        {props.screen === "home" && <HomeScreen {...props} />}
        {props.screen === "community" && (
          <CommunityScreen profile={props.profile} />
        )}
        {props.screen === "detail" && props.fee && (
          <FeeDetail
            fee={props.fee}
            onBack={() => props.onNavigate("home")}
            onCopyAccount={props.onCopyAccount}
            onMood={() => props.onNavigate("mood")}
            onResources={() => props.onNavigate("resource")}
          />
        )}
        {props.screen === "detail" && !props.fee && (
          <EmptyState month={props.selectedMonth} onBack={() => props.onNavigate("home")} />
        )}
        {props.screen === "settings" && <SettingsScreen {...props} />}
        {props.screen === "mood" && (
          <MoodIntro
            onBack={() => props.onNavigate("home")}
            onStart={() => props.onNavigate("mood-question")}
            onResources={() => props.onNavigate("resource")}
            onHelpRequest={() => props.onNavigate("help-request")}
            onOpenLink={props.onOpenNotice}
          />
        )}
        {props.screen === "mood-question" && (
          <MoodAssessment
            onBack={() => props.onNavigate("mood")}
            onComplete={props.onMoodComplete}
          />
        )}
        {props.screen === "mood-result" && (
          <MoodResult
            score={props.moodScore}
            onResources={() => props.onNavigate("resource")}
            onHome={() => props.onNavigate("home")}
            onOpenLink={props.onOpenNotice}
          />
        )}
        {props.screen === "help-request" && (
          <HelpRequestPage
            onBack={() => props.onNavigate("mood")}
            onResources={() => props.onNavigate("resource")}
          />
        )}
        {props.screen === "resource" && (
          <ResourceList
            profile={props.profile}
            onBack={() => props.onNavigate("mood")}
            onOpenLink={props.onOpenNotice}
          />
        )}
      </main>
      {showTabs && (
        <BottomTabs current={props.screen} onNavigate={props.onNavigate} />
      )}
    </div>
  );
}

const rotatingMoodQuestions = [
  "요즘 힘든 하루가 비슷하게 반복되고 있지 않나요?",
  "최근 2주, 기분이 밝고 좋았던 날이 있었나요?",
  "차분하고 편안하다고 느낀 순간이 있었나요?",
  "아침에 깰 때 개운하고 상쾌했나요?",
  "나의 일상은 흥미로운 것들로 가득했나요?",
];

function HomeScreen(props: AuthenticatedShellProps) {
  const [bannerQuestionIndex, setBannerQuestionIndex] = useState(0);

  useEffect(() => {
    const questionTimer = window.setInterval(() => {
      setBannerQuestionIndex(
        (current) => (current + 1) % rotatingMoodQuestions.length,
      );
    }, 3000);
    return () => window.clearInterval(questionTimer);
  }, []);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-topline">
          <div className="compact-brand mobile-brand">
            관리비버<span>.</span>
          </div>
          <button
            className="round-avatar"
            type="button"
            onClick={() => props.onNavigate("settings")}
            aria-label="설정 열기"
          >
            {props.profile.name.slice(0, 1)}
          </button>
        </div>
        <div className="resident-copy">
          <p className="eyebrow">GOOD TO SEE YOU</p>
          <h1>{props.profile.name}님,</h1>
          <p>
            {props.profile.buildingName} {props.profile.unitNo}호
          </p>
        </div>
        <div className="hero-beaver">
          <img src="/beaver-mascot.png" alt="관리비를 안내하는 관리비버" />
        </div>
      </section>

      <section className="fee-section">
        <MonthSelector
          month={props.selectedMonth}
          onChange={props.onChangeMonth}
        />
        {props.loading ? (
          <FeeSkeleton />
        ) : props.fee ? (
          <FeeCard
            fee={props.fee}
            onCopy={props.onCopyAccount}
            onDetail={() => props.onNavigate("detail")}
          />
        ) : (
          <EmptyFee month={props.selectedMonth} onRetry={props.onRetry} />
        )}
      </section>

      <section className="notice-section">
        <div className="content-heading">
          <div>
            <span className="eyebrow">FOR YOUR EVERYDAY</span>
            <h2>생활·복지 소식</h2>
          </div>
          <span className="count-label">{notices.length}</span>
        </div>
        <div className="notice-list">
          {[...notices]
            .sort((a, b) => Number(b.pinned) - Number(a.pinned))
            .map((notice) => (
              <button
                className="notice-card"
                type="button"
                key={notice.id}
                onClick={() => props.onOpenNotice(notice.linkUrl)}
                aria-label={`${notice.title}, 새 창에서 열기`}
              >
                <span className="notice-index">
                  {notice.pinned ? "PIN" : String(notices.indexOf(notice) + 1).padStart(2, "0")}
                </span>
                <span className="notice-copy">
                  {notice.pinned && <small>꼭 읽어보세요</small>}
                  <strong>{notice.title}</strong>
                  <span>{notice.summary}</span>
                </span>
                <span className="notice-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
            ))}
        </div>
      </section>

      <section className="safety-banner hard-shadow">
        <div className="banner-accent" aria-hidden="true">?</div>
        <div className="banner-copy">
          <span className="eyebrow">나만 보는 마음체크</span>
          <h2 className="rotating-question" key={bannerQuestionIndex}>
            {rotatingMoodQuestions[bannerQuestionIndex]}
          </h2>
          <p>정답도 평가도 없이, 요즘의 나를 천천히 살펴보세요.</p>
        </div>
        <button className="banner-button" type="button" onClick={() => props.onNavigate("mood")} aria-label="마음체크 시작하기">
          시작하기 <span aria-hidden="true">→</span>
        </button>
      </section>
    </div>
  );
}

function MonthSelector({
  month,
  onChange,
}: {
  month: string;
  onChange: (direction: -1 | 1) => void;
}) {
  const index = feeMonths.indexOf(month);
  return (
    <div className="month-selector" aria-label="관리비 청구 월 선택">
      <button type="button" onClick={() => onChange(-1)} disabled={index === 0} aria-label="이전 달">
        ←
      </button>
      <div>
        <span>청구 월</span>
        <strong>{formatMonth(month)}</strong>
      </div>
      <button type="button" onClick={() => onChange(1)} disabled={index === feeMonths.length - 1} aria-label="다음 달">
        →
      </button>
    </div>
  );
}

function FeeCard({
  fee,
  onCopy,
  onDetail,
}: {
  fee: Fee;
  onCopy: (account: string) => void;
  onDetail: () => void;
}) {
  return (
    <article className="fee-card hard-shadow">
      <div className="fee-card-top">
        <span>이번 달 청구금액</span>
        <span className={`status-badge ${fee.status.toLowerCase()}`}>
          {fee.status === "PENDING" ? "납부대기" : "납부완료"}
        </span>
      </div>
      <strong className="fee-total">{formatWon(fee.totalAmount)}</strong>
      <p className="due-date">
        {fee.status === "PENDING"
          ? `${formatDate(fee.dueDate)}까지 납부해주세요`
          : `${formatMonth(fee.billMonth)} 납부가 완료됐어요`}
      </p>
      <div className="account-box">
        <div>
          <span>입금계좌</span>
          <strong>
            {fee.account.bank} {fee.account.no}
          </strong>
          <small>예금주 {fee.account.holder}</small>
        </div>
        <button className="outline-button compact" type="button" onClick={() => onCopy(fee.account.no)}>
          복사
        </button>
      </div>
      <button className="primary-button full-button" type="button" onClick={onDetail}>
        상세내역 보기 <span aria-hidden="true">→</span>
      </button>
    </article>
  );
}

function FeeSkeleton() {
  return (
    <div className="fee-card skeleton-card" role="status" aria-label="관리비 정보를 불러오는 중">
      <div className="skeleton-line short" />
      <div className="skeleton-line amount" />
      <div className="skeleton-line medium" />
      <div className="skeleton-box" />
      <div className="skeleton-button" />
    </div>
  );
}

function EmptyFee({ month, onRetry }: { month: string; onRetry: () => void }) {
  return (
    <div className="empty-card hard-shadow">
      <div className="empty-beaver">
        <img src="/beaver-mascot.png" alt="" />
      </div>
      <span className="eyebrow">NOTHING YET</span>
      <h2>해당 월 고지 내역이 없어요.</h2>
      <p>{formatMonth(month)} 관리비가 등록되면 바로 알려드릴게요.</p>
      <button className="outline-button" type="button" onClick={onRetry}>
        다시 확인
      </button>
    </div>
  );
}

function FeeDetail({
  fee,
  onBack,
  onCopyAccount,
  onMood,
  onResources,
}: {
  fee: Fee;
  onBack: () => void;
  onCopyAccount: (account: string) => void;
  onMood: () => void;
  onResources: () => void;
}) {
  const [showCarePrompt, setShowCarePrompt] = useState(false);
  const sum = useMemo(
    () => fee.items.reduce((total, item) => total + item.amount, 0),
    [fee],
  );

  useEffect(() => {
    const careTimer = window.setTimeout(() => setShowCarePrompt(true), 7000);
    return () => window.clearTimeout(careTimer);
  }, []);

  return (
    <div className="sub-page">
      <header className="page-topbar sticky">
        <button className="icon-button" type="button" onClick={onBack} aria-label="홈으로 돌아가기">
          ←
        </button>
        <strong>관리비 상세</strong>
        <span className="topbar-spacer" />
      </header>
      <section className="detail-hero">
        <span className="eyebrow">{fee.billMonth.replace("-", " / ")}</span>
        <h1>{formatMonth(fee.billMonth)} 관리비</h1>
        <strong>{formatWon(fee.totalAmount)}</strong>
        <span className={`status-badge ${fee.status.toLowerCase()}`}>
          {fee.status === "PENDING" ? "납부대기" : "납부완료"}
        </span>
      </section>
      <section className="detail-section">
        <div className="content-heading">
          <h2>항목별 내역</h2>
          <span>{fee.items.length}개 항목</span>
        </div>
        <div className="fee-items">
          {fee.items.map((item, index) => (
            <div className="fee-item" key={item.name}>
              <span className="item-number">{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.name}</strong>
              <span>{formatWon(item.amount)}</span>
            </div>
          ))}
          <div className="fee-sum">
            <span>합계</span>
            <strong>{formatWon(sum)}</strong>
          </div>
        </div>
        {sum !== fee.totalAmount && (
          <div className="error-inline" role="alert">
            청구금액과 항목 합계가 일치하지 않아요.
          </div>
        )}
      </section>
      <section className="detail-account">
        <span className="eyebrow">PAYMENT ACCOUNT</span>
        <h2>입금 계좌</h2>
        <strong>
          {fee.account.bank} {fee.account.no}
        </strong>
        <p>예금주 {fee.account.holder}</p>
        <button className="primary-button full-button" type="button" onClick={() => onCopyAccount(fee.account.no)}>
          계좌번호 복사
        </button>
      </section>
      {showCarePrompt && (
        <div className="care-prompt-backdrop" role="presentation" onMouseDown={() => setShowCarePrompt(false)}>
          <section
            className="care-prompt"
            role="dialog"
            aria-modal="true"
            aria-labelledby="care-prompt-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="care-prompt-close"
              type="button"
              onClick={() => setShowCarePrompt(false)}
              aria-label="안내 닫기"
            >
              ×
            </button>
            <span className="eyebrow">잠깐, 관리비보다 중요한 이야기</span>
            <h2 id="care-prompt-title">요즘 혼자 감당하는 일이 많지 않았나요?</h2>
            <p>
              누구에게도 알리지 않고 지금의 생활과 마음 상태를 살펴보거나,
              가까운 지원기관을 바로 확인할 수 있어요.
            </p>
            <button className="primary-button full-button" type="button" onClick={onMood}>
              내 상태 살펴보기
            </button>
            <button className="outline-button full-button" type="button" onClick={onResources}>
              광진구 도움 바로 보기
            </button>
            <small>이 확인은 의료적 진단이 아니며 결과는 기기에만 남아요.</small>
          </section>
        </div>
      )}
    </div>
  );
}

function EmptyState({ month, onBack }: { month: string; onBack: () => void }) {
  return (
    <div className="sub-page">
      <header className="page-topbar">
        <button className="icon-button" type="button" onClick={onBack} aria-label="홈으로 돌아가기">
          ←
        </button>
        <strong>관리비 상세</strong>
        <span className="topbar-spacer" />
      </header>
      <EmptyFee month={month} onRetry={onBack} />
    </div>
  );
}

function SettingsScreen(props: AuthenticatedShellProps) {
  return (
    <div className="settings-page">
      <header className="settings-hero">
        <div className="compact-brand mobile-brand">
          관리비버<span>.</span>
        </div>
        <span className="eyebrow">MY SETTINGS</span>
        <h1>내 정보</h1>
      </header>
      <section className="profile-card hard-shadow">
        <div className="profile-initial">{props.profile.name.slice(0, 1)}</div>
        <div>
          <h2>{props.profile.name}</h2>
          <p>{props.profile.email}</p>
          <span>
            {props.profile.buildingName} {props.profile.unitNo}호 · {props.profile.regionGu}
          </span>
        </div>
      </section>
      <section className="settings-section">
        <div className="content-heading">
          <h2>알림 설정</h2>
        </div>
        <div className="setting-row">
          <div>
            <strong>관리비 알림</strong>
            <span>고지 등록과 납부기한을 알려드려요.</span>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={props.profile.consent.push}
              onChange={(event) => props.onUpdatePush(event.target.checked)}
              aria-label="관리비 알림 수신"
            />
            <span />
          </label>
        </div>
      </section>
      <section className="settings-section">
        <div className="content-heading">
          <h2>동의 내역</h2>
        </div>
        {(Object.keys(consentCopy) as ConsentKey[]).map((key) => (
          <button className="setting-link-row" type="button" key={key} onClick={() => props.onOpenConsent(key)}>
            <span>
              <strong>{consentCopy[key].title}</strong>
              <small>{props.profile.consent[key] ? "동의함" : "동의 안 함"}</small>
            </span>
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </section>
      <section className="ethics-note">
        <strong>내 정보는 내가 선택해요.</strong>
        <p>실시간 위치를 추적하지 않으며, 마음체크 결과는 본인만 볼 수 있어요.</p>
      </section>
      <button className="logout-button" type="button" onClick={props.onLogout}>
        로그아웃
      </button>
    </div>
  );
}

function MoodIntro({
  onBack,
  onStart,
  onResources,
  onHelpRequest,
  onOpenLink,
}: {
  onBack: () => void;
  onStart: () => void;
  onResources: () => void;
  onHelpRequest: () => void;
  onOpenLink: (url: string) => void;
}) {
  return (
    <div className="sub-page mood-page">
      <header className="page-topbar transparent">
        <button className="icon-button" type="button" onClick={onBack} aria-label="홈으로 돌아가기">
          ←
        </button>
        <strong>마음체크</strong>
        <span className="topbar-spacer" />
      </header>
      <section className="mood-hero">
        <div className="gentle-beaver">
          <img src="/beaver-listening.png" alt="두 손을 모으고 이야기를 들을 준비를 한 관리비버" />
        </div>
        <span className="eyebrow">여기서는 천천히 말해도 괜찮아요</span>
        <h1>
          잠깐, 요즘의 나를
          <br />
          살펴볼까요?
        </h1>
        <p>
          최근 2주 동안의 고립감, 생활 리듬, 마음의 에너지와 삶의 질을
          돌아보는 질문이에요. 따뜻한 차 한 모금이 식기 전, 여섯 문항이면
          충분해요.
        </p>
      </section>
      <section className="mood-info hard-shadow">
        <div>
          <strong>6</strong>
          <span>문항</span>
        </div>
        <div>
          <strong>1분</strong>
          <span>안쪽</span>
        </div>
        <div>
          <strong>나만</strong>
          <span>확인</span>
        </div>
      </section>
      <section className="assessment-scope">
        {["사회적 연결", "생활 리듬", "마음 에너지", "삶의 질"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </section>
      <button className="primary-button full-button" type="button" onClick={onStart}>
        마음체크 시작하기
      </button>
      <button className="outline-button full-button" type="button" onClick={onResources}>
        질문 없이 도움 정보 보기
      </button>
      <button className="text-action-button full-button" type="button" onClick={onHelpRequest}>
        직접 도움받고 싶은 내용 작성하기 <span aria-hidden="true">→</span>
      </button>
      <p className="assessment-disclaimer">
        이 체크는 의료적 진단이나 위기 판정이 아니며, 나에게 맞는 지역
        자원을 찾기 위한 참고로만 사용돼요.
      </p>
      <EmergencyGuide onOpenLink={onOpenLink} />
    </div>
  );
}

const HELP_DRAFT_KEY = "gwanribeaver_help_draft";

function HelpRequestPage({
  onBack,
  onResources,
}: {
  onBack: () => void;
  onResources: () => void;
}) {
  const [category, setCategory] = useState("잘 모르겠어요");
  const [need, setNeed] = useState("");
  const [situation, setSituation] = useState("");
  const [saved, setSaved] = useState(false);
  const categories = ["생계·주거", "마음·관계", "건강·돌봄", "일자리·생활", "잘 모르겠어요"];

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem(
      HELP_DRAFT_KEY,
      JSON.stringify({ category, need, situation, savedAt: new Date().toISOString() }),
    );
    setSaved(true);
  }

  return (
    <div className="sub-page help-request-page">
      <header className="page-topbar">
        <button className="icon-button" type="button" onClick={onBack} aria-label="마음체크 안내로 돌아가기">
          ←
        </button>
        <strong>도움 내용 작성</strong>
        <span className="topbar-spacer" />
      </header>
      <section className="help-request-hero">
        <span className="eyebrow">말이 잘 정리되지 않아도 괜찮아요</span>
        <h1>지금 필요한 도움을<br />편한 말로 적어주세요.</h1>
        <p>내용은 이 기기에 초안으로만 저장돼요. 실제로 전달하기 전, 연결할 기관을 직접 고를 수 있어요.</p>
      </section>
      <form className="help-request-form" onSubmit={saveDraft}>
        <fieldset>
          <legend>어떤 도움이 가장 가까운가요?</legend>
          <div className="category-chips">
            {categories.map((item) => (
              <button
                className={category === item ? "selected" : ""}
                type="button"
                key={item}
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>
        <label>
          <span>지금 가장 도움받고 싶은 내용</span>
          <textarea
            value={need}
            onChange={(event) => {
              setNeed(event.target.value);
              setSaved(false);
            }}
            placeholder="예: 월세가 밀려 어디에 문의해야 할지 모르겠어요."
            rows={5}
            required
          />
        </label>
        <label>
          <span>현재 처한 상황이나 걱정되는 점 <small>선택</small></span>
          <textarea
            value={situation}
            onChange={(event) => {
              setSituation(event.target.value);
              setSaved(false);
            }}
            placeholder="언제부터 어려웠는지, 지금 가장 걱정되는 점을 적어주세요."
            rows={4}
          />
        </label>
        <button className="primary-button full-button" type="submit">
          작성 내용 저장하기
        </button>
        {saved && (
          <div className="draft-saved" role="status">
            <strong>도움 요청 초안이 저장됐어요.</strong>
            <p>원할 때 연결 가능한 기관을 확인하고 다음 단계를 선택하세요.</p>
            <button className="outline-button full-button" type="button" onClick={onResources}>
              연결 가능한 기관 보기
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function MoodAssessment({
  onBack,
  onComplete,
}: {
  onBack: () => void;
  onComplete: (score: number) => void;
}) {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Array<number | null>>(
    () => Array(moodQuestions.length).fill(null) as Array<number | null>,
  );
  const answers = [
    "전혀 그렇지 않아요",
    "별로 그렇지 않아요",
    "가끔 그래요",
    "자주 그래요",
    "매우 그래요",
  ];
  const question = moodQuestions[step];
  const selected = responses[step];

  function selectAnswer(value: number) {
    setResponses((current) => {
      const next = [...current];
      next[step] = value;
      return next;
    });
  }

  function goNext() {
    if (selected === null) return;
    if (step < moodQuestions.length - 1) {
      setStep((current) => current + 1);
      return;
    }
    const score = moodQuestions.reduce((total, item, index) => {
      const response = responses[index] ?? 0;
      return total + (item.positive ? 4 - response : response);
    }, 0);
    onComplete(score);
  }

  return (
    <div className="sub-page question-page">
      <header className="page-topbar">
        <button
          className="icon-button"
          type="button"
          onClick={() => (step === 0 ? onBack() : setStep((current) => current - 1))}
          aria-label={step === 0 ? "마음체크 안내로 돌아가기" : "이전 문항"}
        >
          ←
        </button>
        <strong>마음체크</strong>
        <span className="topbar-spacer" />
      </header>
      <div className="progress-track" aria-label={`전체 ${moodQuestions.length}문항 중 ${step + 1}번째`}>
        <span style={{ width: `${((step + 1) / moodQuestions.length) * 100}%` }} />
      </div>
      <section className="question-content">
        <span className="dimension-label">{question.dimension}</span>
        <span className="eyebrow">최근 2주 동안 · {step + 1}/{moodQuestions.length}</span>
        <h1>{question.text}</h1>
        <p>지금의 나와 가장 가까운 답을 골라주세요.</p>
        <div className="answer-list">
          {answers.map((answer, index) => (
            <button
              className={selected === index ? "answer-button selected" : "answer-button"}
              type="button"
              key={answer}
              onClick={() => selectAnswer(index)}
              aria-pressed={selected === index}
            >
              <span>{answer}</span>
              <span className="radio-mark" aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>
      <div className="question-actions">
        <button
          className="outline-button"
          type="button"
          onClick={() => (step === 0 ? onBack() : setStep((current) => current - 1))}
        >
          이전
        </button>
        <button
          className="primary-button"
          type="button"
          disabled={selected === null}
          onClick={goNext}
        >
          {step === moodQuestions.length - 1 ? "결과 확인하기" : "다음"}
        </button>
      </div>
    </div>
  );
}

function MoodResult({
  score,
  onResources,
  onHome,
  onOpenLink,
}: {
  score: number;
  onResources: () => void;
  onHome: () => void;
  onOpenLink: (url: string) => void;
}) {
  const result =
    score <= 7
      ? {
          grade: "마음 돌봄 1단계",
          eyebrow: "생활 리듬 이어가기",
          title: "지금의 생활 리듬을\n천천히 지켜가세요.",
          body: "힘든 날이 생겨도 연결될 곳을 미리 알아두면 마음이 조금 가벼워질 수 있어요.",
        }
      : score <= 15
        ? {
            grade: "마음 돌봄 2단계",
            eyebrow: "부담 없는 변화 시작하기",
            title: "혼자 버티는 시간을\n조금 줄여봐도 괜찮아요.",
            body: "일상과 관계에서 지친 신호가 보여요. 부담 없는 프로그램이나 상담부터 살펴보세요.",
          }
        : {
            grade: "마음 돌봄 3단계",
            eyebrow: "도움 받을 수 있는 정보 알아보기",
            title: "지금은 도움을 받는 것도\n나를 돌보는 방법이에요.",
            body: "여러 영역에서 어려움이 겹쳐 있을 수 있어요. 가까운 전문기관과 이야기를 나눠보세요.",
          };

  return (
    <div className="sub-page result-page">
      <header className="page-topbar">
        <button className="icon-button" type="button" onClick={onHome} aria-label="홈으로 돌아가기">
          ×
        </button>
        <strong>마음체크 결과</strong>
        <span className="topbar-spacer" />
      </header>
      <section className="result-hero">
        <img src="/beaver-listening.png" alt="" />
        <span className="result-grade">{result.grade}</span>
        <span className="eyebrow">{result.eyebrow}</span>
        <h1>{result.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
        <p>{result.body}</p>
      </section>
      <section className="result-note">
        <strong>이 단계는 위험도를 뜻하지 않아요.</strong>
        <p>의료적 진단이 아니라, 지금 필요한 다음 행동을 찾기 위한 안내 등급이에요.</p>
      </section>
      <div className="result-actions">
        <button className="primary-button full-button" type="button" onClick={onResources}>
          광진구에서 받을 수 있는 도움 보기
        </button>
        <button className="outline-button full-button" type="button" onClick={onHome}>
          홈으로 돌아가기
        </button>
      </div>
      <EmergencyGuide onOpenLink={onOpenLink} />
    </div>
  );
}

function ResourceList({
  profile,
  onBack,
  onOpenLink,
}: {
  profile: Profile;
  onBack: () => void;
  onOpenLink: (url: string) => void;
}) {
  return (
    <div className="sub-page resource-page">
      <header className="page-topbar">
        <button className="icon-button" type="button" onClick={onBack} aria-label="마음체크로 돌아가기">
          ←
        </button>
        <strong>지역 도움 찾기</strong>
        <span className="topbar-spacer" />
      </header>
      <section className="resource-hero">
        <span className="eyebrow">{profile.regionGu}에서 연결할 수 있어요</span>
        <h1>가까운 곳에서<br />이어지는 도움</h1>
        <p>
          필요한 도움의 성격을 먼저 살펴보고, 편한 곳부터 공식 페이지에서
          자세히 확인하세요.
        </p>
      </section>
      <div className="resource-list">
        {gwangjinResources.map((resource, index) => (
          <button
            className="resource-card"
            type="button"
            key={resource.id}
            onClick={() => onOpenLink(resource.linkUrl)}
            aria-label={`${resource.title} 공식 페이지 새 창에서 열기`}
          >
            <span className="resource-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="resource-card-copy">
              <small>{resource.category}</small>
              <strong>{resource.title}</strong>
              <em>{resource.help}</em>
              <span>{resource.detail}</span>
              {resource.phone && <b>문의 {resource.phone}</b>}
            </span>
            <span className="resource-arrow" aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      <section className="location-note">
        <strong>현재 등록 지역: {profile.regionGu}</strong>
        <p>GPS나 실시간 위치는 사용하지 않고, 회원 정보의 구 단위 지역만 활용해요.</p>
      </section>
      <EmergencyGuide onOpenLink={onOpenLink} />
    </div>
  );
}

function EmergencyGuide({ onOpenLink }: { onOpenLink: (url: string) => void }) {
  return (
    <section className="emergency-guide" aria-label="바로 연결할 수 있는 복지 도움">
      <strong>바로 연결할 수 있는 도움</strong>
      <p>혼자 찾기 어렵다면 아래 공식 기관부터 살펴보세요.</p>
      <div className="quick-support-list">
        {quickSupportLinks.map((support) => (
          <button type="button" key={support.title} onClick={() => onOpenLink(support.linkUrl)}>
            <span>
              <b>{support.title}</b>
              <small>{support.summary}</small>
            </span>
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </section>
  );
}

type CommunityAuthorMode = "anonymous" | "room";

interface CommunityFeedPost {
  id: string;
  author: string;
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  timeLabel: string;
  likes: number;
  comments: string[];
  anonymous?: boolean;
}

function getSeedCommunityPosts(buildingName: string): CommunityFeedPost[] {
  return [
    {
      id: "flowers",
      author: `${buildingName} 203호 · 임주찬`,
      content: `${buildingName} 앞 공원에 핀 꽃이 예쁘네요^~^`,
      imageUrl: "/community-flowers.png",
      imageAlt: `${buildingName} 앞 공원에 핀 분홍색, 노란색, 흰색 꽃`,
      timeLabel: "오늘 오전 9:18",
      likes: 24,
      comments: ["저도 출근길에 봤어요. 아침부터 기분이 좋더라고요!"],
    },
    {
      id: "recycling",
      author: "익명 이웃",
      content: "이거 분리수거 제대로 해주세요 ㅡㅡ",
      imageUrl: "/community-recycling.png",
      imageAlt: "주거지 분리수거장 앞에 섞여 놓인 재활용 봉투",
      timeLabel: "어제 오후 8:42",
      likes: 11,
      comments: ["관리실 안내문도 다시 붙여주시면 좋겠어요."],
      anonymous: true,
    },
    {
      id: "potatoes",
      author: "박은예님",
      content:
        "친정에서 감자를 받아왔는데, 감자가 너무 많아서 나눔해요. 필요하신 분 댓글 달아주세요~",
      imageUrl: "/community-potatoes.png",
      imageAlt: "나눔을 위해 상자에 담아둔 신선한 감자",
      timeLabel: "2일 전",
      likes: 31,
      comments: ["저 5개만 부탁드려도 될까요?", "아이 간식으로 잘 먹을 것 같아요!"],
    },
  ];
}

function CommunityScreen({ profile }: { profile: Profile }) {
  const storageKey = `gwanribeaver_community_${profile.buildingName}`;
  const seedPosts = useMemo(
    () => getSeedCommunityPosts(profile.buildingName),
    [profile.buildingName],
  );
  const [myPosts, setMyPosts] = useState<CommunityFeedPost[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem(storageKey) ?? "[]",
      ) as CommunityFeedPost[];
    } catch {
      return [];
    }
  });
  const [composerOpen, setComposerOpen] = useState(false);
  const [authorMode, setAuthorMode] =
    useState<CommunityAuthorMode>("anonymous");
  const [content, setContent] = useState("");
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const posts = [...myPosts, ...seedPosts];

  function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) return;
    const nextPost: CommunityFeedPost = {
      id: `mine-${Date.now()}`,
      author:
        authorMode === "anonymous"
          ? "익명 이웃"
          : `${profile.buildingName} ${profile.unitNo}호 · ${profile.name}`,
      content: trimmedContent,
      timeLabel: "방금 전",
      likes: 0,
      comments: [],
      anonymous: authorMode === "anonymous",
    };
    const nextPosts = [nextPost, ...myPosts];
    setMyPosts(nextPosts);
    localStorage.setItem(storageKey, JSON.stringify(nextPosts));
    setContent("");
    setComposerOpen(false);
  }

  function toggleLike(postId: string) {
    setLikedPostIds((current) =>
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId],
    );
  }

  return (
    <div className="community-page">
      <header className="community-hero">
        <div>
          <span className="eyebrow">OUR BUILDING, OUR STORIES</span>
          <h1>{profile.buildingName} 이야기</h1>
          <p>{profile.buildingName} 이웃들과 나누는 작고 솔직한 이야기예요.</p>
        </div>
        <button
          className="community-write-button"
          type="button"
          onClick={() => setComposerOpen((current) => !current)}
          aria-expanded={composerOpen}
        >
          {composerOpen ? "닫기" : "글쓰기"}
        </button>
      </header>

      {composerOpen && (
        <form className="community-composer hard-shadow" onSubmit={submitPost}>
          <div className="composer-heading">
            <strong>이웃에게 이야기하기</strong>
            <span>이 기기에 게시글이 저장돼요.</span>
          </div>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="우리 건물 이웃들과 나누고 싶은 이야기를 적어주세요."
            rows={4}
            required
            aria-label="커뮤니티 게시글 내용"
          />
          <fieldset>
            <legend>작성자 공개 방식</legend>
            <div className="author-mode-options">
              <button
                className={authorMode === "anonymous" ? "selected" : ""}
                type="button"
                onClick={() => setAuthorMode("anonymous")}
                aria-pressed={authorMode === "anonymous"}
              >
                <span aria-hidden="true">?</span>
                익명으로 올리기
              </button>
              <button
                className={authorMode === "room" ? "selected" : ""}
                type="button"
                onClick={() => setAuthorMode("room")}
                aria-pressed={authorMode === "room"}
              >
                <span aria-hidden="true">{profile.unitNo}</span>
                {profile.unitNo}호·이름 공개
              </button>
            </div>
          </fieldset>
          <button className="primary-button full-button" type="submit">
            이야기 올리기
          </button>
        </form>
      )}

      <div
        className="community-feed"
        aria-label={`${profile.buildingName} 커뮤니티 게시글`}
      >
        {posts.map((post) => {
          const liked = likedPostIds.includes(post.id);
          return (
            <article className="community-post" key={post.id}>
              <header className="post-author-row">
                <span
                  className={
                    post.anonymous ? "post-avatar anonymous" : "post-avatar"
                  }
                >
                  {post.anonymous
                    ? "?"
                    : post.author.includes("박은예")
                      ? "박"
                      : "임"}
                </span>
                <span>
                  <strong>{post.author}</strong>
                  <small>{post.timeLabel}</small>
                </span>
                {post.anonymous && <em>대나무숲</em>}
              </header>
              {post.imageUrl && (
                <img
                  className="post-image"
                  src={post.imageUrl}
                  alt={post.imageAlt ?? ""}
                />
              )}
              <div className="post-actions">
                <button
                  className={liked ? "liked" : ""}
                  type="button"
                  onClick={() => toggleLike(post.id)}
                  aria-pressed={liked}
                  aria-label={`${post.author} 게시글 좋아요`}
                >
                  <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
                  좋아요 {post.likes + (liked ? 1 : 0)}
                </button>
                <span>댓글 {post.comments.length}</span>
              </div>
              <div className="post-body">
                <p>
                  <strong>{post.author}</strong> {post.content}
                </p>
                {post.comments.length > 0 && (
                  <div className="comment-preview">
                    {post.comments.map((comment, index) => (
                      <p key={`${post.id}-comment-${index}`}>
                        <strong>이웃 {index + 1}</strong> {comment}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <p className="community-end">여기까지가 최근 이야기예요.</p>
    </div>
  );
}

function BottomTabs({
  current,
  onNavigate,
}: {
  current: Screen;
  onNavigate: (screen: Screen) => void;
}) {
  return (
    <nav className="bottom-tabs" aria-label="주요 메뉴">
      <button className={current === "home" ? "active" : ""} type="button" onClick={() => onNavigate("home")}>
        <span className="tab-icon" aria-hidden="true">⌂</span>
        홈
      </button>
      <button className={current === "community" ? "active" : ""} type="button" onClick={() => onNavigate("community")}>
        <span className="tab-icon community-tab-icon" aria-hidden="true">◫</span>
        커뮤니티
      </button>
      <button className={current === "settings" ? "active" : ""} type="button" onClick={() => onNavigate("settings")}>
        <span className="tab-icon" aria-hidden="true">●</span>
        설정
      </button>
    </nav>
  );
}

function ConsentModal({
  consentKey,
  onClose,
}: {
  consentKey: ConsentKey;
  onClose: () => void;
}) {
  const copy = consentCopy[consentKey];
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="consent-modal" role="dialog" aria-modal="true" aria-labelledby="consent-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-handle" />
        <span className="eyebrow">TERMS & PRIVACY</span>
        <h2 id="consent-title">{copy.title}</h2>
        <strong>{copy.summary}</strong>
        <p>{copy.body}</p>
        <button className="primary-button full-button" type="button" onClick={onClose}>
          확인했어요
        </button>
      </section>
    </div>
  );
}

export default App;
