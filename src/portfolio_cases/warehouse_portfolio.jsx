import { useState, useEffect, useRef } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

/* ─── 색상 팔레트 ─────────────────────────────── */
const C = {
  bg: "#0A0A0F",
  surface: "#111118",
  border: "#1E1E2E",
  borderBright: "#2E2E4E",
  text: "#E8E8F0",
  muted: "#7070A0",
  accent: "#6C6CF8",
  accentDim: "#3A3A8A",
  red: "#F05050",
  redDim: "#4A1818",
  green: "#3FD68A",
  greenDim: "#0D3D2A",
  amber: "#F0B040",
  amberDim: "#3D2D0A",
  white: "#FFFFFF",
};

/* ─── 폰트 로드 ───────────────────────────────── */
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${C.bg}; color: ${C.text}; font-family: 'Outfit', sans-serif; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: ${C.bg}; }
    ::-webkit-scrollbar-thumb { background: ${C.accentDim}; border-radius: 2px; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
    }
    .fade-up { animation: fadeUp 0.6s ease forwards; }
    .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
    .fade-up-2 { animation-delay: 0.25s; opacity: 0; }
    .fade-up-3 { animation-delay: 0.4s; opacity: 0; }
    .fade-up-4 { animation-delay: 0.55s; opacity: 0; }
  `}</style>
);

/* ─── 데이터 ─────────────────────────────────── */
const idleData = [
  { group: "최저 20%", delay: 36.3 },
  { group: "20~40%",   delay: 28.1 },
  { group: "40~60%",   delay: 18.4 },
  { group: "60~80%",   delay: 10.2 },
  { group: "최고 20%", delay: 5.5  },
];

const packData = [
  { range: "0~10%",   delay: 19.8 },
  { range: "10~20%",  delay: 17.2 },
  { range: "20~30%",  delay: 15.4 },
  { range: "30~40%",  delay: 13.8 },
  { range: "40~50%",  delay: 13.3 },
  { range: "50~60%",  delay: 12.0 },
  { range: "60~70%",  delay: 12.1 },
  { range: "70~80%",  delay: 12.0 },
  { range: "80~90%",  delay: 12.0 },
  { range: "90%+",    delay: 29.6 },
];

const comboData = [
  { label: "0개 (정상)", delay: 10.2, crisis: 2.4 },
  { label: "1개",        delay: 17.9, crisis: 5.1 },
  { label: "2개",        delay: 29.9, crisis: 8.2 },
  { label: "3개 (최악)", delay: 38.1, crisis: 11.3 },
];

const psmData = [
  { group: "hub_spoke", before: 22.09, after: 21.68 },
  { group: "나머지",    before: 18.40, after: 22.24 },
];

const storySteps = [
  { num: "01", phase: "EDA",      title: "idle이 핵심이다",         desc: "30% 임계점, 배터리 연쇄 구조", badge: "발견",       bColor: C.accent },
  { num: "02", phase: "모델링",   title: "EDA가 놓친 변수",         desc: "pack_util r=0.105 → 모델 1위", badge: "한계 발견",   bColor: C.amber  },
  { num: "03", phase: "경보",     title: "Precision 상한 발견",     desc: "어떤 방법도 12% 돌파 불가",   badge: "실패→전환",   bColor: C.red    },
  { num: "04", phase: "군집화",   title: "취약형 102개 발견",       desc: "hub_spoke 67% 취약 → 가설",   badge: "가설 형성",   bColor: C.accent },
  { num: "05", phase: "PSM",      title: "결론이 뒤집혔다",         desc: "운영 통제 후 효과 소멸",       badge: "결론 수정",   bColor: C.green  },
];

const findings = [
  { icon: "⚡", title: "idle 비율이 핵심", val: "6.6×", sub: "최저 vs 최고 구간 지연 차이", color: C.red },
  { icon: "🔍", title: "숨은 병목 발견",   val: "r=0.105 → 1위", sub: "EDA 오판, 모델로 재발견", color: C.amber },
  { icon: "🧪", title: "PSM 인과 검증",   val: "p=0.783", sub: "운영 통제 후 레이아웃 효과 소멸", color: C.green },
  { icon: "🗺️", title: "운영 우선순위",   val: "6개 유형", sub: "포장병목형이 즉시개입형보다 위험", color: C.accent },
];

const methodReasons = [
  { q: "왜 GroupKFold?", bad: "일반 KFold → 같은 창고 스냅샷 누출 → 성능 과대평가", good: "창고 단위 완전 분리 → 실제 배포 환경 시뮬레이션" },
  { q: "왜 모델 중요도?", bad: "상관계수만 → pack r=0.105 '관계 없음' → 핵심 변수 누락", good: "비선형 U자형 포착 → 모델 1위 재발견 → 반례 수렴" },
  { q: "왜 PSM?", bad: "단순 비교 → hub_spoke +3.69분 → 레이아웃 개선 추진 (고비용 오판)", good: "운영 조건 통제 → 효과 소멸(p=0.783) → 레이아웃 X, 운영 O" },
  { q: "왜 반례 분석?", bad: "전체 경향만 → 'idle 높으면 안전' 단순 결론", good: "공통 원인: pack 과포화 → U자형 분석과 수렴 → 신뢰도↑" },
];

const priorityTypes = [
  { rank: "1순위", type: "즉시개입형",    n: 49,  delay: 24.6, feature: "고혼잡 + 저idle",          action: "경로 재배정 + 충전 긴급", color: C.red    },
  { rank: "2순위", type: "배터리위기형",  n: 23,  delay: 23.3, feature: "저idle + 배터리 나쁨",     action: "사전 충전 스케줄",        color: C.red    },
  { rank: "3순위★", type: "포장병목형",  n: 40,  delay: 27.0, feature: "pack 고가동 (숨은 병목)",  action: "pack 60~80% 조정",        color: C.amber  },
  { rank: "4순위", type: "혼잡관리형",    n: 29,  delay: 15.4, feature: "idle 정상 + 고혼잡",       action: "경로 모니터링",           color: C.amber  },
  { rank: "5순위", type: "배터리최적화형", n: 6,  delay: 17.0, feature: "idle 정상 + 배터리 나쁨",  action: "정기 충전 최적화",        color: C.accent },
  { rank: "6순위", type: "모니터링형",    n: 103, delay: 13.5, feature: "전반적 정상",               action: "정기 모니터링",           color: C.green  },
];

/* ─── 공통 컴포넌트 ─────────────────────────── */
const Mono = ({ children, style }) => (
  <span style={{ fontFamily: "'DM Mono', monospace", ...style }}>{children}</span>
);

const Badge = ({ children, color }) => (
  <span style={{
    fontSize: 11, fontWeight: 500, padding: "3px 8px",
    borderRadius: 4, background: color + "22", color,
    border: `0.5px solid ${color}44`, letterSpacing: "0.03em",
  }}>{children}</span>
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 500, color: C.muted,
    letterSpacing: "0.12em", textTransform: "uppercase",
    marginBottom: 20,
    display: "flex", alignItems: "center", gap: 10,
  }}>
    <span style={{ width: 24, height: 0.5, background: C.border, display: "inline-block" }} />
    {children}
  </div>
);

const Divider = () => (
  <div style={{ height: 0.5, background: C.border, margin: "0 0" }} />
);

/* ─── NAV ────────────────────────────────────── */
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? C.surface + "EE" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `0.5px solid ${C.border}` : "none",
      transition: "all 0.3s ease",
      padding: "16px 40px", display: "flex", alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, letterSpacing: "-0.01em" }}>
        분석 포트폴리오
      </div>
      <div style={{ display: "flex", gap: 28 }}>
        {["스토리", "발견", "시각화", "방법론", "우선순위"].map(t => (
          <a key={t} href={`#${t}`} style={{
            fontSize: 13, color: C.muted, textDecoration: "none",
            transition: "color 0.2s",
            onMouseEnter: e => e.target.style.color = C.text,
            onMouseLeave: e => e.target.style.color = C.muted,
          }}
            onMouseEnter={e => e.target.style.color = C.text}
            onMouseLeave={e => e.target.style.color = C.muted}
          >{t}</a>
        ))}
      </div>
    </nav>
  );
};

/* ─── HERO ───────────────────────────────────── */
const Hero = () => (
  <section style={{
    padding: "80px 40px 60px",
    borderBottom: `0.5px solid ${C.border}`,
    position: "relative", overflow: "hidden",
  }}>
    {/* 배경 그라데이션 장식 */}
    <div style={{
      position: "absolute", top: -100, right: -100,
      width: 500, height: 500, borderRadius: "50%",
      background: `radial-gradient(circle, ${C.accentDim}30 0%, transparent 70%)`,
      pointerEvents: "none",
    }} />

    <div style={{ maxWidth: 720, position: "relative" }}>
      <div className="fade-up fade-up-1" style={{ marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Badge color={C.accent}>물류 · 운영 분석</Badge>
        <Badge color={C.muted}>LightGBM</Badge>
        <Badge color={C.muted}>PSM 인과 검증</Badge>
        <Badge color={C.muted}>K-Means</Badge>
        <Badge color={C.muted}>Python</Badge>
      </div>

      <h1 className="fade-up fade-up-2" style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 52, lineHeight: 1.12, letterSpacing: "-0.02em",
        marginBottom: 20, color: C.white,
      }}>
        창고 로봇 시스템<br />
        <span style={{ color: C.accent }}>출고 지연</span> 원인 분석
      </h1>

      <p className="fade-up fade-up-3" style={{
        fontSize: 17, color: C.muted, lineHeight: 1.7,
        marginBottom: 32, maxWidth: 560,
      }}>
        250개 창고, 25만 건 데이터.
        레이아웃이 문제라고 생각했는데 운영이었고,
        중요하지 않다고 본 변수가 핵심이었습니다.
        <strong style={{ color: C.text }}> 분석 과정에서 결론이 세 번 바뀌었습니다.</strong>
      </p>

      <div className="fade-up fade-up-4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "GitHub", icon: "↗" },
          { label: "보고서 PDF", icon: "↓" },
          { label: "태블로 대시보드", icon: "↗", primary: true },
        ].map(({ label, icon, primary }) => (
          <button key={label} style={{
            padding: "10px 20px", borderRadius: 6, cursor: "pointer",
            fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6,
            background: primary ? C.accent : "transparent",
            color: primary ? C.white : C.text,
            border: primary ? "none" : `0.5px solid ${C.borderBright}`,
            transition: "all 0.2s",
            fontFamily: "'Outfit', sans-serif",
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            {label} <span style={{ fontSize: 12 }}>{icon}</span>
          </button>
        ))}
      </div>
    </div>

    {/* KPI 4개 */}
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      gap: 12, marginTop: 60,
    }}>
      {[
        { label: "분석 창고", val: "250개", sub: "4개 레이아웃 유형" },
        { label: "지연 최대 차이", val: "6.6×", sub: "idle 최저 vs 최고", accent: true },
        { label: "결론 수정 횟수", val: "3회", sub: "가설→검증→수정" },
        { label: "지연 감소 추정", val: "78%", sub: "가정 기반 시뮬레이션" },
      ].map(({ label, val, sub, accent }) => (
        <div key={label} style={{
          background: C.surface, border: `0.5px solid ${C.border}`,
          borderRadius: 8, padding: "20px 24px",
        }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{label}</div>
          <div style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 34, color: accent ? C.accent : C.white,
            letterSpacing: "-0.02em", lineHeight: 1,
          }}>{val}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{sub}</div>
        </div>
      ))}
    </div>
  </section>
);

/* ─── STORY FLOW ─────────────────────────────── */
const StoryFlow = () => (
  <section id="스토리" style={{ padding: "60px 40px", borderBottom: `0.5px solid ${C.border}` }}>
    <SectionLabel>분석 스토리</SectionLabel>
    <h2 style={{
      fontFamily: "'DM Serif Display', serif",
      fontSize: 32, color: C.white, marginBottom: 8,
    }}>결론이 세 번 바뀐 과정</h2>
    <p style={{ fontSize: 14, color: C.muted, marginBottom: 40, lineHeight: 1.6 }}>
      각 단계는 이전 결론을 의심하고 검증하는 방향으로 진행됐습니다.
    </p>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, position: "relative" }}>
      {/* 연결선 */}
      <div style={{
        position: "absolute", top: 28, left: "10%", right: "10%",
        height: 0.5, background: `linear-gradient(to right, ${C.border}, ${C.accent}50, ${C.border})`,
        zIndex: 0,
      }} />

      {storySteps.map((s, i) => (
        <div key={i} style={{
          position: "relative", zIndex: 1,
          padding: "0 12px",
          display: "flex", flexDirection: "column", alignItems: "flex-start",
        }}>
          {/* 번호 원 */}
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: C.surface, border: `0.5px solid ${s.bColor}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 16,
            boxShadow: `0 0 20px ${s.bColor}30`,
          }}>
            <Mono style={{ fontSize: 12, color: s.bColor }}>{s.num}</Mono>
          </div>

          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{s.phase}</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.white, marginBottom: 6, lineHeight: 1.3 }}>{s.title}</div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 10 }}>{s.desc}</div>
          <Badge color={s.bColor}>{s.badge}</Badge>
        </div>
      ))}
    </div>
  </section>
);

/* ─── FINDINGS ───────────────────────────────── */
const Findings = () => (
  <section id="발견" style={{ padding: "60px 40px", borderBottom: `0.5px solid ${C.border}` }}>
    <SectionLabel>핵심 발견</SectionLabel>
    <h2 style={{
      fontFamily: "'DM Serif Display', serif",
      fontSize: 32, color: C.white, marginBottom: 40,
    }}>4가지 핵심 발견</h2>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
      {findings.map(({ icon, title, val, sub, color }) => (
        <div key={title} style={{
          background: C.surface, border: `0.5px solid ${C.border}`,
          borderRadius: 12, padding: "28px 32px",
          borderLeft: `2px solid ${color}`,
          transition: "border-color 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.borderLeftColor = color}
          onMouseLeave={e => e.currentTarget.style.borderLeftColor = color}
        >
          <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.white, marginBottom: 6 }}>{title}</div>
          <div style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 28, color, lineHeight: 1, marginBottom: 8,
          }}>{val}</div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{sub}</div>
        </div>
      ))}
    </div>
  </section>
);

/* ─── VISUALIZATION TABS ─────────────────────── */
const VisSection = () => {
  const [tab, setTab] = useState(0);
  const tabs = ["idle 비율", "U자형 발견", "복합 병목", "PSM 전후"];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "8px 12px" }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.white }}>{payload[0].value.toFixed(1)}분</div>
      </div>
    );
  };

  const charts = [
    // idle 비율
    <div key="idle" style={{ height: 260 }}>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
        여유 최저 구간 36.3분 vs 최고 5.5분 — <strong style={{ color: C.white }}>6.6배 차이</strong>. 30%가 임계점.
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={idleData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={C.border} vertical={false} />
          <XAxis dataKey="group" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="delay" radius={[4, 4, 0, 0]}>
            {idleData.map((_, i) => (
              <Cell key={i} fill={i === 0 ? C.red : i === 4 ? C.green : C.accent + "88"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>,

    // U자형
    <div key="pack" style={{ height: 260 }}>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
        선형 상관계수 <Mono style={{ color: C.amber }}>r=0.105</Mono> → 모델 중요도 <Mono style={{ color: C.green }}>1위(14.2%)</Mono>.
        저가동=처리 부족, 고가동=후처리 병목.
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={packData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={C.border} vertical={false} />
          <XAxis dataKey="range" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="delay" stroke={C.accent} strokeWidth={2.5}
            dot={(props) => {
              const last = props.index === packData.length - 1;
              return <circle key={props.index} cx={props.cx} cy={props.cy} r={last ? 6 : 3}
                fill={last ? C.red : C.accent} stroke={C.bg} strokeWidth={2} />;
            }} />
        </LineChart>
      </ResponsiveContainer>
    </div>,

    // 복합 병목
    <div key="combo" style={{ height: 260 }}>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
        나쁜 조건이 겹칠수록 폭발적 증가 — <strong style={{ color: C.white }}>3개 동시: 38.1분 (정상의 3.7배)</strong>
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={comboData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={C.border} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="delay" radius={[4, 4, 0, 0]}>
            {comboData.map((_, i) => (
              <Cell key={i} fill={[C.green, C.amber + "CC", C.red + "CC", C.red][i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>,

    // PSM
    <div key="psm" style={{ height: 260 }}>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
        매칭 전 <Mono style={{ color: C.red }}>+3.69분 (p=0.007)</Mono> → 매칭 후 <Mono style={{ color: C.green }}>-0.55분 (p=0.783)</Mono>.
        레이아웃 효과 소멸.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: "calc(100% - 48px)" }}>
        {["before", "after"].map((key, ki) => (
          <div key={key} style={{ position: "relative" }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, textAlign: "center" }}>
              {ki === 0 ? "매칭 전 (단순 비교)" : "PSM 매칭 후"}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={psmData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="2 4" stroke={C.border} vertical={false} />
                <XAxis dataKey="group" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} domain={[15, 25]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={key} radius={[4, 4, 0, 0]}
                  fill={ki === 0 ? C.red + "88" : C.accent + "88"} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{
              textAlign: "center", fontSize: 12, fontWeight: 500, marginTop: 4,
              color: ki === 0 ? C.red : C.green,
            }}>
              {ki === 0 ? "+3.69분 **" : "-0.55분 (n.s.)"}
            </div>
          </div>
        ))}
      </div>
    </div>,
  ];

  return (
    <section id="시각화" style={{ padding: "60px 40px", borderBottom: `0.5px solid ${C.border}` }}>
      <SectionLabel>주요 시각화</SectionLabel>
      <h2 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 32, color: C.white, marginBottom: 32,
      }}>데이터로 보는 발견들</h2>

      {/* 탭 */}
      <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: `0.5px solid ${C.border}` }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            padding: "10px 20px", fontSize: 13, cursor: "pointer", fontWeight: 500,
            background: "transparent", border: "none", fontFamily: "'Outfit', sans-serif",
            color: tab === i ? C.white : C.muted,
            borderBottom: tab === i ? `1.5px solid ${C.accent}` : "1.5px solid transparent",
            transition: "all 0.2s",
          }}>{t}</button>
        ))}
      </div>

      <div style={{
        background: C.surface, border: `0.5px solid ${C.border}`,
        borderRadius: 12, padding: "28px 32px",
        minHeight: 340,
      }}>
        {charts[tab]}
      </div>
    </section>
  );
};

/* ─── METHOD REASONS ─────────────────────────── */
const MethodSection = () => {
  const [open, setOpen] = useState(null);
  return (
    <section id="방법론" style={{ padding: "60px 40px", borderBottom: `0.5px solid ${C.border}` }}>
      <SectionLabel>방법론 선택 이유</SectionLabel>
      <h2 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 32, color: C.white, marginBottom: 12,
      }}>왜 이 방법을 선택했는가</h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6 }}>
        각 방법은 기법을 써보려고 선택한 게 아닙니다.
        그 방법이 아니었으면 잘못된 결론에 도달했을 것이기 때문에 선택했습니다.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {methodReasons.map(({ q, bad, good }, i) => (
          <div key={i} style={{
            background: C.surface, border: `0.5px solid ${open === i ? C.accentDim : C.border}`,
            borderRadius: 8, overflow: "hidden", transition: "border-color 0.2s",
          }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{
              width: "100%", padding: "18px 24px", display: "flex", justifyContent: "space-between",
              alignItems: "center", background: "transparent", border: "none",
              cursor: "pointer", textAlign: "left",
            }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: C.white, fontFamily: "'Outfit', sans-serif" }}>{q}</span>
              <span style={{
                fontSize: 18, color: C.muted, transition: "transform 0.2s",
                transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
              }}>+</span>
            </button>
            {open === i && (
              <div style={{ padding: "0 24px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: C.redDim + "60", borderRadius: 6, padding: "12px 16px", border: `0.5px solid ${C.red}30` }}>
                  <div style={{ fontSize: 11, color: C.red, marginBottom: 6, fontWeight: 500 }}>✗ 다른 방법 썼다면</div>
                  <div style={{ fontSize: 13, color: C.text + "CC", lineHeight: 1.5 }}>{bad}</div>
                </div>
                <div style={{ background: C.greenDim + "60", borderRadius: 6, padding: "12px 16px", border: `0.5px solid ${C.green}30` }}>
                  <div style={{ fontSize: 11, color: C.green, marginBottom: 6, fontWeight: 500 }}>✓ 이 방법을 쓴 이유</div>
                  <div style={{ fontSize: 13, color: C.text + "CC", lineHeight: 1.5 }}>{good}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

/* ─── PRIORITY MATRIX ────────────────────────── */
const PrioritySection = () => (
  <section id="우선순위" style={{ padding: "60px 40px", borderBottom: `0.5px solid ${C.border}` }}>
    <SectionLabel>운영 우선순위</SectionLabel>
    <h2 style={{
      fontFamily: "'DM Serif Display', serif",
      fontSize: 32, color: C.white, marginBottom: 12,
    }}>어떤 창고부터 개입하는가</h2>
    <p style={{ fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 1.6 }}>
      ★ 포장병목형(3순위)이 즉시개입형(1순위)보다 평균 지연 높음 — 반례 분석 없이는 발견하기 어려운 유형
    </p>

    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* 헤더 */}
      <div style={{
        display: "grid", gridTemplateColumns: "100px 140px 80px 80px 1fr 1fr",
        gap: 12, padding: "10px 20px",
        fontSize: 11, color: C.muted, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase",
      }}>
        {["우선순위", "유형", "창고", "지연", "특징", "조치"].map(h => <div key={h}>{h}</div>)}
      </div>

      {priorityTypes.map(({ rank, type, n, delay, feature, action, color }) => (
        <div key={rank} style={{
          display: "grid", gridTemplateColumns: "100px 140px 80px 80px 1fr 1fr",
          gap: 12, padding: "14px 20px",
          background: C.surface, border: `0.5px solid ${C.border}`,
          borderRadius: 8, alignItems: "center",
          borderLeft: `2px solid ${color}`,
          transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = C.border}
          onMouseLeave={e => e.currentTarget.style.background = C.surface}
        >
          <Badge color={color}>{rank}</Badge>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.white }}>{type}</div>
          <Mono style={{ fontSize: 13, color: C.muted }}>{n}개</Mono>
          <Mono style={{ fontSize: 13, color: delay > 25 ? C.red : delay > 20 ? C.amber : C.green }}>
            {delay}분
          </Mono>
          <div style={{ fontSize: 12, color: C.muted }}>{feature}</div>
          <div style={{ fontSize: 12, color: C.text + "CC" }}>{action}</div>
        </div>
      ))}
    </div>
  </section>
);

/* ─── CONCLUSION ─────────────────────────────── */
const Conclusion = () => (
  <section style={{ padding: "60px 40px" }}>
    <SectionLabel>최종 결론</SectionLabel>
    <h2 style={{
      fontFamily: "'DM Serif Display', serif",
      fontSize: 40, color: C.white, marginBottom: 16, lineHeight: 1.1,
    }}>
      결론이 세 번 바뀌었습니다.<br />
      <span style={{ color: C.accent }}>그것이 분석의 가치입니다.</span>
    </h2>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 40 }}>
      {[
        { from: "처음엔 의심했다", fromVal: "hub_spoke 구조가 원인", to: "PSM으로 확인했다", toVal: "운영이 원인, 레이아웃 효과 없음", color: C.accent },
        { from: "EDA로는 몰랐다", fromVal: "pack r=0.105 '관계 없음'", to: "모델이 발견했다", toVal: "비선형 U자형, 모델 1위", color: C.amber },
        { from: "기대했던 것", fromVal: "경보 규칙으로 예측 가능", to: "발견한 것", toVal: "Precision ~0.12 구조적 상한", color: C.red },
      ].map(({ from, fromVal, to, toVal, color }, i) => (
        <div key={i} style={{
          background: C.surface, border: `0.5px solid ${C.border}`,
          borderRadius: 12, padding: "24px", display: "flex", flexDirection: "column", gap: 16,
        }}>
          <div style={{ background: C.bg, borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{from}</div>
            <div style={{ fontSize: 13, color: C.text + "AA" }}>{fromVal}</div>
          </div>
          <div style={{ textAlign: "center", color, fontSize: 20 }}>↓</div>
          <div style={{ background: color + "15", borderRadius: 8, padding: "12px 16px", border: `0.5px solid ${color}40` }}>
            <div style={{ fontSize: 11, color, marginBottom: 4, fontWeight: 500 }}>{to}</div>
            <div style={{ fontSize: 13, color: C.white, fontWeight: 500 }}>{toVal}</div>
          </div>
        </div>
      ))}
    </div>

    {/* 하단 링크 */}
    <div style={{
      marginTop: 48, paddingTop: 32, borderTop: `0.5px solid ${C.border}`,
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: C.muted }}>
        분석 포트폴리오
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        {["GitHub", "보고서 PDF", "태블로 대시보드", "발표 PPT"].map(t => (
          <a key={t} href="#" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}
            onMouseEnter={e => e.target.style.color = C.text}
            onMouseLeave={e => e.target.style.color = C.muted}
          >{t}</a>
        ))}
      </div>
    </div>
  </section>
);

/* ─── APP ────────────────────────────────────── */
export default function App() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <FontLink />
      <Nav />
      <main style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Hero />
        <StoryFlow />
        <Findings />
        <VisSection />
        <MethodSection />
        <PrioritySection />
        <Conclusion />
      </main>
    </div>
  );
}
