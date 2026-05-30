import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ReferenceLine, ScatterChart, Scatter
} from "recharts";

/* ─── 색상 시스템 ─────────────────────────────── */
const C = {
  bg:        "#F4F5F7",
  surface:   "#FFFFFF",
  surfaceAlt:"#F9FAFB",
  border:    "#E5E7EB",
  borderDark:"#D1D5DB",
  text:      "#1A1A2E",
  muted:     "#6B7280",
  faint:     "#9CA3AF",
  accent:    "#2563EB",
  accentBg:  "#EFF6FF",
  accentDim: "#BFDBFE",
  green:     "#10B981",
  greenBg:   "#ECFDF5",
  greenDim:  "#A7F3D0",
  red:       "#EF4444",
  redBg:     "#FEF2F2",
  redDim:    "#FECACA",
  amber:     "#F59E0B",
  amberBg:   "#FFFBEB",
  amberDim:  "#FDE68A",
  purple:    "#7C3AED",
  purpleBg:  "#F5F3FF",
  purpleDim: "#DDD6FE",
  rose:      "#E11D48",
  roseBg:    "#FFF1F2",
  roseDim:   "#FECDD3",
  gold:      "#B45309",
  goldBg:    "#FFFBEB",
  goldDim:   "#FDE68A",
};

/* ─── 폰트 ───────────────────────────────────── */
const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: ${C.bg}; color: ${C.text}; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.6; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: ${C.bg}; }
    ::-webkit-scrollbar-thumb { background: ${C.borderDark}; border-radius: 3px; }
    a { color: inherit; text-decoration: none; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .fu { animation: fadeUp 0.5s ease forwards; }
    .fu1 { animation-delay:0.05s; opacity:0; }
    .fu2 { animation-delay:0.15s; opacity:0; }
    .fu3 { animation-delay:0.25s; opacity:0; }
    .fu4 { animation-delay:0.38s; opacity:0; }
    .fu5 { animation-delay:0.50s; opacity:0; }
  `}</style>
);

/* ─── 공통 컴포넌트 ─────────────────────────── */
const Mono = ({ children, color, size = 13 }) => (
  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: size, color: color || C.muted }}>
    {children}
  </span>
);

const Tag = ({ children, color = C.accent, bg }) => (
  <span style={{
    fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 4,
    background: bg || color + "15", color,
    border: `1px solid ${color}25`, letterSpacing: "0.02em", whiteSpace: "nowrap",
  }}>{children}</span>
);

const SecLabel = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
    <div style={{ width: 3, height: 14, background: C.accent, borderRadius: 2 }} />
    <span style={{ fontSize: 12, fontWeight: 600, color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {children}
    </span>
  </div>
);

const Card = ({ children, style, hover = true }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{
        background: C.surface, borderRadius: 12,
        border: `1px solid ${hov && hover ? C.borderDark : C.border}`,
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: hov && hover ? "0 4px 20px rgba(0,0,0,0.06)" : "0 1px 4px rgba(0,0,0,0.04)",
        ...style,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </div>
  );
};

const ChartTip = ({ active, payload, label, unit = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: "8px 12px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 500, color: p.color || C.text }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}{unit}
        </div>
      ))}
    </div>
  );
};

/* ─── 데이터 ─────────────────────────────────── */
const DATA = {
  // CTR 효율 구간별 (연령×성별)
  ctrByTarget: [
    { target: "남성 18-24", effLow: 0.8,  effHigh: 0.9,  cpc: 320 },
    { target: "여성 18-24", effLow: 1.1,  effHigh: 1.3,  cpc: 310 },
    { target: "남성 25-34", effLow: 1.2,  effHigh: 1.4,  cpc: 290 },
    { target: "여성 25-34", effLow: 1.3,  effHigh: 1.6,  cpc: 270 },
    { target: "남성 35-44", effLow: 1.4,  effHigh: 2.2,  cpc: 255 },
    { target: "여성 35-44", effLow: 1.5,  effHigh: 2.6,  cpc: 240 },
    { target: "남성 45-54", effLow: 1.6,  effHigh: 3.1,  cpc: 230 },
    { target: "여성 45-54", effLow: 1.8,  effHigh: 4.2,  cpc: 218 },
    { target: "남성 55-64", effLow: 1.5,  effHigh: 3.8,  cpc: 222 },
    { target: "여성 55-64", effLow: 1.7,  effHigh: 4.5,  cpc: 215 },
    { target: "남성 65+",   effLow: 1.2,  effHigh: 2.0,  cpc: 240 },
    { target: "여성 65+",   effLow: 0.9,  effHigh: 1.1,  cpc: 285 },
  ],
  // 변수 중요도
  varImportance: [
    { name: "연령 (Age)", value: 65.0, color: "#2563EB" },
    { name: "성별 (Gender)", value: 26.6, color: "#7C3AED" },
    { name: "시기 (Time)", value: 8.4, color: "#9CA3AF" },
  ],
  // ROAS 시뮬레이션
  roasSimulation: Array.from({ length: 11 }, (_, i) => ({
    rate: i * 10,
    improvement: i * 2.3,
  })),
  // 재구매 주기 분류
  repurchaseSegment: [
    { name: "단기 재구매", value: 50, color: "#2563EB", days: "14일 이내" },
    { name: "중기 재구매", value: 20, color: "#7C3AED", days: "14~40일" },
    { name: "장기 재구매", value: 30, color: "#9CA3AF", days: "40일 이후" },
  ],
  // Top5 판매량 상관관계 변화
  top5Correlation: [
    { period: "'25.03 이전", value: 0.86, label: "강한 양의 상관" },
    { period: "'25.03 이후", value: -0.26, label: "상관 소멸" },
  ],
  // 장기 구매자 — 프로모션 vs 광고노출 상관계수
  longTermCorr: [
    { name: "프로모션", value: 0.12, fill: C.faint },
    { name: "광고 노출", value: 0.68, fill: "#2563EB" },
  ],
};

/* ─── NAV ────────────────────────────────────── */
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.border}` : "none",
      transition: "all 0.25s ease",
      padding: "0 40px",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56,
      }}>
        <div style={{ fontFamily: "'Lora', serif", fontSize: 15, fontWeight: 500, color: C.text }}>
          데이터 분석 포트폴리오
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { label: "개요", href: "#overview" },
            { label: "데이터", href: "#data" },
            { label: "비효율 구간", href: "#inefficiency" },
            { label: "페르소나", href: "#persona" },
            { label: "세그먼트", href: "#segment" },
            { label: "전략", href: "#strategy" },
            { label: "회고", href: "#retro" },
          ].map(({ label, href }) => (
            <a key={label} href={href} style={{
              fontSize: 13, color: C.muted, padding: "6px 12px", borderRadius: 6,
              transition: "background 0.15s, color 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.muted; }}
            >{label}</a>
          ))}
        </div>
      </div>
    </nav>
  );
};

const sectionTabs = [
  { label: "개요", href: "#overview" },
  { label: "데이터", href: "#data" },
  { label: "비효율 구간", href: "#inefficiency" },
  { label: "페르소나", href: "#persona" },
  { label: "세그먼트", href: "#segment" },
  { label: "전략", href: "#strategy" },
  { label: "회고", href: "#retro" },
];

const useActiveSection = (tabs) => {
  const [activeHref, setActiveHref] = useState(tabs[0]?.href || "");

  useEffect(() => {
    const sectionIds = tabs.map(({ href }) => href.slice(1));
    const updateActive = () => {
      let current = sectionIds[0];
      sectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= 150) current = id;
      });
      setActiveHref(`#${current}`);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [tabs]);

  return activeHref;
};

const SectionTabs = () => {
  const activeHref = useActiveSection(sectionTabs);

  return (
    <div className="case-section-tabs" style={{
      position: "sticky", top: 56, zIndex: 120,
      background: "rgba(242, 243, 246, 0.96)",
      borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      boxShadow: "0 8px 18px rgba(15, 23, 42, 0.04)",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "0 40px",
        display: "flex", gap: 24, overflowX: "auto", scrollbarWidth: "none",
      }}>
        {sectionTabs.map(({ label, href }) => {
          const active = activeHref === href;
          return (
            <a key={label} href={href} aria-current={active ? "true" : undefined} style={{
              display: "inline-flex", alignItems: "center", height: 56,
              fontSize: 13, color: active ? C.text : C.muted,
              fontWeight: active ? 700 : 500, whiteSpace: "nowrap",
              borderBottom: `2px solid ${active ? C.text : "transparent"}`,
              transition: "color 0.15s, border-color 0.15s",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.color = C.text;
                e.currentTarget.style.borderBottomColor = C.text;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = active ? C.text : C.muted;
                e.currentTarget.style.borderBottomColor = active ? C.text : "transparent";
              }}
            >{label}</a>
          );
        })}
      </div>
    </div>
  );
};

/* ─── HERO ───────────────────────────────────── */
const Hero = () => (
  <section style={{ padding: "64px 40px 48px", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div className="fu fu1" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["광고 최적화", "타겟 리포지셔닝", "고객 세분화", "SQL · Python · Tableau", "실제 기업 데이터"].map((t, i) => (
          <Tag key={t} color={i === 0 ? C.accent : C.muted} bg={i === 0 ? C.accentBg : C.bg}>{t}</Tag>
        ))}
      </div>

      <h1 className="fu fu2" style={{
        fontFamily: "'Lora', serif", fontSize: 48, fontWeight: 500,
        lineHeight: 1.15, letterSpacing: "-0.02em", color: C.text,
        marginBottom: 16, maxWidth: 720,
      }}>
        쥬얼리 브랜드 R사,<br />
        <span style={{ color: C.accent }}>타겟 리포지셔닝</span>과 광고 예산 최적화
      </h1>

      <p className="fu fu3" style={{
        fontSize: 17, color: C.muted, lineHeight: 1.7,
        marginBottom: 28, maxWidth: 600,
      }}>
        매출 <strong style={{ color: C.text }}>28% 하락, ROAS 17% 급감</strong>. 광고 예산의 30%가 잘못된 타겟에 낭비되고 있었습니다.
        리뷰 데이터 형태소 분석으로 실제 구매자 페르소나를 재정의하고,
        추가 예산 없이 ROAS 23% 반등 시뮬레이션을 도출했습니다.
      </p>

      <div className="fu fu4" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 48 }}>
        {[
          { label: "태블로 대시보드", primary: true },
          { label: "GitHub ↗" },
          { label: "발표 PPT ↓" },
        ].map(({ label, primary }) => (
          <button key={label} style={{
            padding: "9px 18px", borderRadius: 7, cursor: "pointer",
            fontSize: 13, fontWeight: 500,
            background: primary ? C.accent : C.surface,
            color: primary ? "#fff" : C.text,
            border: primary ? "none" : `1px solid ${C.border}`,
            transition: "all 0.15s", fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >{label}</button>
        ))}
      </div>

      <div className="fu fu5" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "매출 하락폭 (YoY)", val: "–28%", sub: "2023 → 2024 전년 대비", color: C.red },
          { label: "낭비 예산 규모", val: "~497만원/월", sub: "전체 예산의 30% 미스매칭", color: C.amber },
          { label: "CTR 성과 격차", val: "5.2×", sub: "저효율 대비 고효율 구간", color: C.accent },
          { label: "ROAS 반등 전망", val: "+23%", sub: "추가 예산 없이 재배치만으로", color: C.green },
        ].map(({ label, val, sub, color }) => (
          <Card key={label} style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, fontWeight: 500 }}>{label}</div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 28, color, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 6 }}>{val}</div>
            <div style={{ fontSize: 12, color: C.faint }}>{sub}</div>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ─── OVERVIEW SECTION ───────────────────────── */
const OverviewSection = () => (
  <section id="overview" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <SecLabel>프로젝트 개요</SecLabel>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
        무엇이 문제였는가
      </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 40, lineHeight: 1.6, maxWidth: 600 }}>
        광고비는 그대로인데 성과가 떨어지고 있었습니다.
        데이터를 열어보니 문제는 예산 규모가 아니라 <strong style={{ color: C.text }}>어디에 쓰는가</strong>였습니다.
      </p>

      {/* 5단계 분석 프로세스 */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 16 }}>5단계 분석 프로세스</div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
          {[
            { step: "01", label: "데이터 전처리", desc: "고유키 생성\n효율 지표 설계", color: C.muted },
            { step: "02", label: "비효율 구간 식별", desc: "예산 누수 규모\n산출", color: C.red },
            { step: "03", label: "페르소나 재정의", desc: "트리 모델 +\n리뷰 형태소 분석", color: C.accent },
            { step: "04", label: "세그먼트 분류", desc: "재구매 주기\n단기/장기 분류", color: C.purple },
            { step: "05", label: "예산 최적화", desc: "재배치 시뮬레이션\nROAS 전망", color: C.green },
          ].map(({ step, label, desc, color }, i, arr) => (
            <div key={step} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                background: C.surface, border: `1px solid ${color}40`,
                borderRadius: 10, padding: "14px 18px", textAlign: "center",
                borderTop: `3px solid ${color}`, minWidth: 120,
              }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.faint, marginBottom: 4 }}>{step}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: C.muted, whiteSpace: "pre-line", lineHeight: 1.5 }}>{desc}</div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", padding: "0 8px" }}>
                  <div style={{ width: 24, height: 1, background: C.border }} />
                  <div style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: `6px solid ${C.borderDark}` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3가지 핵심 배경 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          {
            icon: "📉",
            title: "배경 1",
            problem: "매출 28% · ROAS 17% 급감",
            solution: "광고 예산을 브랜드 페르소나 미스매칭 구간에 낭비 중임을 데이터로 확인",
            color: C.red,
          },
          {
            icon: "🎯",
            title: "배경 2",
            problem: "기존 등급제의 한계",
            solution: "비회원 비율 74%, 실버 등급 이상 1.5% 미만 → 등급으로는 충성 고객 식별 자체가 불가",
            color: C.amber,
          },
          {
            icon: "🔍",
            title: "배경 3",
            problem: "페르소나 미스매칭",
            solution: "2030 연인 타겟으로 운영 중이었으나, 실제 구매자는 3564 기혼 부부였음을 리뷰 분석으로 발견",
            color: C.accent,
          },
        ].map(({ icon, title, problem, solution, color }) => (
          <Card key={title} style={{ padding: "22px 24px" }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
            <div style={{ fontSize: 11, color, fontWeight: 600, marginBottom: 6, letterSpacing: "0.06em" }}>{title}</div>
            <div style={{ background: C.redBg, borderRadius: 6, padding: "8px 12px", marginBottom: 10, border: `1px solid ${C.redDim}` }}>
              <div style={{ fontSize: 11, color: C.red, fontWeight: 600, marginBottom: 3 }}>문제</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{problem}</div>
            </div>
            <div style={{ background: C.greenBg, borderRadius: 6, padding: "8px 12px", border: `1px solid ${C.greenDim}` }}>
              <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginBottom: 3 }}>발견</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{solution}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ─── DATA SECTION ───────────────────────────── */
const DataSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const steps = [
    {
      title: "Unknown Target 제거",
      desc: "연령·성별 결측치 삭제\n타겟별 성과 비교 신뢰도 확보를 위해 분석 대상에서 제외",
      color: C.red,
    },
    {
      title: "Unique Key 생성",
      desc: "이름 + 전화번호 뒷자리 + 주소 조합으로 고유키 생성\n고유키 부재 문제 해결 → 개인별 세그먼트 추적 가능",
      color: C.accent,
    },
    {
      title: "Numeric Formatting",
      desc: "노출·클릭·비용 컬럼: 문자형 → 수치형 변환\n집계 및 지표 연산을 위한 전처리",
      color: C.purple,
    },
    {
      title: "파생 변수 생성",
      desc: "① Target Type: 캠페인명 기반 오픈 타겟 여부 라벨링\n② 효율 점수: CTR ÷ CPC — 광고 반응성과 비용 효율을 동시에 고려한 핵심 성과 지표",
      color: C.green,
    },
  ];

  return (
    <section id="data" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SecLabel>데이터 전처리</SecLabel>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
          분석 인프라 구축
        </h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6, maxWidth: 560 }}>
          실제 기업 광고 데이터를 정제하고, 성과 측정을 위한 핵심 지표를 설계했습니다.
        </p>

        {/* 전처리 탭 */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, marginBottom: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {steps.map(({ title, color }, i) => (
              <button key={i} onClick={() => setActiveTab(i)} style={{
                padding: "12px 16px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                background: activeTab === i ? color + "15" : C.surface,
                border: `1px solid ${activeTab === i ? color + "40" : C.border}`,
                borderLeft: `3px solid ${activeTab === i ? color : "transparent"}`,
                fontSize: 13, fontWeight: activeTab === i ? 600 : 400,
                color: activeTab === i ? color : C.muted,
                transition: "all 0.15s", fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                <Mono size={11} color={activeTab === i ? color : C.faint}>0{i + 1} </Mono>
                {title}
              </button>
            ))}
          </div>
          <Card style={{ padding: "28px 32px" }}>
            <Tag color={steps[activeTab].color}>{`STEP 0${activeTab + 1}`}</Tag>
            <div style={{ fontSize: 17, fontWeight: 600, color: C.text, margin: "14px 0 12px" }}>
              {steps[activeTab].title}
            </div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {steps[activeTab].desc}
            </div>
          </Card>
        </div>

        {/* 핵심 지표: 효율 점수 */}
        <Card style={{ padding: "28px 32px", background: C.accentBg, border: `1px solid ${C.accentDim}` }} hover={false}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: "0.06em" }}>★ 핵심 설계 지표</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>광고 효율 점수 (Efficiency Score)</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 12, alignItems: "center" }}>
            <div style={{ background: C.surface, borderRadius: 8, padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>클릭률 (반응도)</div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 22, color: C.accent }}>CTR</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>클릭 수 ÷ 노출 수</div>
            </div>
            <div style={{ fontSize: 24, color: C.accentDim, fontWeight: 300 }}>÷</div>
            <div style={{ background: C.surface, borderRadius: 8, padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>클릭당 비용</div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 22, color: C.accent }}>CPC</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>광고비 ÷ 클릭 수</div>
            </div>
            <div style={{ fontSize: 24, color: C.accentDim, fontWeight: 300 }}>=</div>
            <div style={{ background: C.surface, borderRadius: 8, padding: "16px 20px", textAlign: "center", border: `1px solid ${C.accentDim}` }}>
              <div style={{ fontSize: 11, color: C.accent, marginBottom: 6, fontWeight: 600 }}>효율 점수</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>광고 반응성과<br />비용 효율을 동시에 반영</div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

/* ─── INEFFICIENCY SECTION ───────────────────── */
const InefficiencySection = () => (
  <section id="inefficiency" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <SecLabel>비효율 구간 식별</SecLabel>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
        예산의 30%가 낭비되고 있었다
      </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6, maxWidth: 580 }}>
        오픈 타겟 방식의 구조적 문제 — 연령·성별을 특정하지 않고 집행한 광고가
        실제로는 <strong style={{ color: C.text }}>미스매칭 구간에 집중 노출</strong>되고 있었습니다.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* CTR 효율 차트 */}
        <Card style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>
            연령×성별 구간별 CTR 효율 비교
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>
            회색: 저효율 구간 / 파란색: 고효율 구간 — 여성 45~64세에서 5.2배 격차
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={DATA.ctrByTarget} margin={{ top: 4, right: 8, left: -24, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="target" tick={{ fontSize: 9, fill: C.faint }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10, fill: C.faint }} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="effLow" name="저효율 CTR" radius={[3, 3, 0, 0]}>
                {DATA.ctrByTarget.map((d, i) => (
                  <Cell key={i} fill={C.borderDark} />
                ))}
              </Bar>
              <Bar dataKey="effHigh" name="고효율 CTR" radius={[3, 3, 0, 0]}>
                {DATA.ctrByTarget.map((d, i) => {
                  const isHigh = d.effHigh >= 3.0;
                  return <Cell key={i} fill={isHigh ? C.accent : C.accentDim} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 낭비 규모 카드 3개 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            {
              label: "낭비 예산 규모",
              val: "30%",
              sub: "약 497만원 / 월\n미스매칭 구간에 노출",
              color: C.red, bg: C.redBg, dim: C.redDim,
            },
            {
              label: "성과 격차",
              val: "CTR 5.2×",
              sub: "저효율 구간 대비\n고효율 구간 증대 확인",
              color: C.accent, bg: C.accentBg, dim: C.accentDim,
            },
            {
              label: "기회 유입",
              val: "4,960건/월",
              sub: "추가 예산 없이\n순수 유입 증대 기대",
              color: C.green, bg: C.greenBg, dim: C.greenDim,
            },
          ].map(({ label, val, sub, color, bg, dim }) => (
            <div key={label} style={{
              background: bg, border: `1px solid ${dim}`,
              borderRadius: 12, padding: "20px 24px", flex: 1,
            }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, fontWeight: 500 }}>{label}</div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 28, color, lineHeight: 1, marginBottom: 6 }}>{val}</div>
              <div style={{ fontSize: 12, color: C.muted, whiteSpace: "pre-line", lineHeight: 1.6 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Winning Pattern */}
      <Card style={{ padding: "24px 28px", background: C.accentBg, border: `1px solid ${C.accentDim}` }} hover={false}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 14 }}>
          ★ Winning Pattern — 고효율 광고의 공통점
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { title: "타겟 구간", val: "35~44세 + 커플 세트", desc: "고효율 광고의 60% 점유. 노출 상위 · CTR 우수 · CPC/CPM 저감", color: C.accent },
            { title: "핵심 변수", val: "연령 (Age) 65.0%", desc: "CTR 영향 변수 중요도 1위. 35세 이상부터 성과 급격히 상승", color: C.purple },
            { title: "Winning 기준", val: "여성 45~54 · 55~64", desc: "효율 점수 최상위. CPC 대비 CTR 비율이 전 구간 중 최고치", color: C.green },
          ].map(({ title, val, desc, color }) => (
            <div key={title} style={{ background: C.surface, borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 6 }}>{val}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </section>
);

/* ─── PERSONA SECTION ────────────────────────── */
const PersonaSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["변수 중요도", "리뷰 형태소 분석"];

  return (
    <section id="persona" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SecLabel>성과 결정 요인 분석 · 페르소나 재정의</SecLabel>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
          누가 실제 구매자인가
        </h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6, maxWidth: 600 }}>
          트리 모델의 분기점 탐색과 리뷰 데이터 형태소 분석. 두 방법이 독립적으로
          <strong style={{ color: C.text }}> 같은 결론</strong>에 도달했습니다.
        </p>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)} style={{
              padding: "8px 18px", borderRadius: 7, cursor: "pointer", fontSize: 13,
              background: activeTab === i ? C.accent : C.surface,
              color: activeTab === i ? "#fff" : C.muted,
              border: `1px solid ${activeTab === i ? C.accent : C.border}`,
              fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.15s",
            }}>{t}</button>
          ))}
        </div>

        {activeTab === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* 변수 중요도 차트 */}
            <Card style={{ padding: "24px 28px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>CTR 결정 변수 중요도</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>트리 기반 모델(Decision Tree) — 연령이 압도적 1위</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={DATA.varImportance} layout="vertical" margin={{ top: 4, right: 40, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                  <XAxis type="number" domain={[0, 80]} tick={{ fontSize: 10, fill: C.faint }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: C.text }} width={100} />
                  <Tooltip formatter={(v) => [`${v}%`, "중요도"]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} name="중요도">
                    {DATA.varImportance.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ background: C.accentBg, borderRadius: 8, padding: "10px 14px", border: `1px solid ${C.accentDim}`, marginTop: 16 }}>
                <div style={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>
                  ★ 트리 모델 분기점 — <strong>"35세 이상"</strong>부터 성과 급격 상승
                </div>
              </div>
            </Card>

            {/* 기존 vs 재정의 */}
            <Card style={{ padding: "24px 28px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 20 }}>타겟 페르소나 Before / After</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "타겟 구간", before: "2030 연인", after: "35~64세 기혼 부부 집중", icon: "🎯" },
                  { label: "메시지 전략", before: "설렘, 로맨틱, 사랑", after: "가족의 안녕과 재물운", icon: "💬" },
                  { label: "운영 시기", before: "상시 운영", after: "7~9월 여름 시즌 집중", icon: "📅" },
                ].map(({ label, before, after, icon }) => (
                  <div key={label} style={{ display: "grid", gridTemplateColumns: "24px 1fr 24px 1fr", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <div style={{
                      background: C.redBg, borderRadius: 6, padding: "8px 12px",
                      border: `1px solid ${C.redDim}`,
                    }}>
                      <div style={{ fontSize: 10, color: C.red, fontWeight: 600, marginBottom: 2 }}>기존</div>
                      <div style={{ fontSize: 12, color: C.text, textDecoration: "line-through" }}>{before}</div>
                    </div>
                    <div style={{ textAlign: "center", fontSize: 14, color: C.faint }}>→</div>
                    <div style={{
                      background: C.greenBg, borderRadius: 6, padding: "8px 12px",
                      border: `1px solid ${C.greenDim}`,
                    }}>
                      <div style={{ fontSize: 10, color: C.green, fontWeight: 600, marginBottom: 2 }}>재정의</div>
                      <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{after}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: C.accentBg, borderRadius: 8, padding: "10px 14px", border: `1px solid ${C.accentDim}`, marginTop: 16 }}>
                <div style={{ fontSize: 12, color: C.accent }}>기대효과: 유입 효율 <strong>21% 상승</strong> 예상</div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* 리뷰 키워드 분석 */}
            <Card style={{ padding: "24px 28px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>구매 리뷰 형태소 분석</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>실제 구매자가 리뷰에 남긴 키워드 빈도 분석</div>

              {/* 버블 시각화 */}
              <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
                {/* 가족 버블 (큼) */}
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 110, height: 110, borderRadius: "50%",
                    background: C.accentBg, border: `2px solid ${C.accentDim}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexDirection: "column", margin: "0 auto 8px",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>가족</div>
                    <div style={{ fontSize: 11, color: C.muted }}>남편, 아내</div>
                    <div style={{ fontSize: 10, color: C.faint }}>결혼기념일</div>
                  </div>
                  <Tag color={C.accent}>2× 높음</Tag>
                </div>

                <div style={{ fontSize: 20, color: C.borderDark, fontWeight: 300 }}>&gt;</div>

                {/* 연인 버블 (작음) */}
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: C.bg, border: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexDirection: "column", margin: "0 auto 8px",
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.muted }}>연인</div>
                    <div style={{ fontSize: 10, color: C.faint }}>남자친구</div>
                    <div style={{ fontSize: 10, color: C.faint }}>여자친구</div>
                  </div>
                  <Tag color={C.muted} bg={C.bg}>상대적 낮음</Tag>
                </div>
              </div>

              <div style={{ background: C.amberBg, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.amberDim}`, marginTop: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.amber, marginBottom: 4 }}>인사이트</div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
                  가족 관련 키워드(남편·아내·결혼기념일)가 연인 관련 키워드보다 <strong>2배</strong> 높게 발견.
                  광고는 연인을 타겟했지만 실제 구매 동기는 가족 선물이었음.
                </div>
              </div>
            </Card>

            {/* 문제-해결 */}
            <Card style={{ padding: "24px 28px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 20 }}>페르소나 미스매칭이 만든 구조적 문제</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: C.redBg, borderRadius: 8, padding: "14px 16px", border: `1px solid ${C.redDim}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.red, marginBottom: 6 }}>⚠ Problem</div>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>
                    높은 관심(CTR)에도 불구하고 <strong>잘못된 연인 컨셉</strong>으로 접근하여
                    실제 구매 전환 비용(CPA)이 급등. CTR은 높은데 전환이 안 되는 구조.
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{ fontSize: 20, color: C.faint }}>↓</div>
                </div>
                <div style={{ background: C.greenBg, borderRadius: 8, padding: "14px 16px", border: `1px solid ${C.greenDim}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 6 }}>✓ Solution</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { label: "타겟", val: "35~64세 기혼 부부 집중" },
                      { label: "메시지", val: "'설렘'보다 '안녕·재물운' 감성 카피" },
                      { label: "기대효과", val: "유입 효율 21% 상승 예상" },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 12, color: C.green, fontWeight: 600, minWidth: 60 }}>{label}</span>
                        <span style={{ fontSize: 12, color: C.text }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

/* ─── SEGMENT SECTION ────────────────────────── */
const SegmentSection = () => {
  const [activeSegment, setActiveSegment] = useState(0);

  const segments = [
    {
      name: "단기 재구매자",
      badge: "14일 이내",
      color: C.accent,
      insight: "인기 제품(TOP 5) 의존도가 과거 매우 높았으나 점차 분산 중 — 과도기",
      desc: "즉각적 만족 & 제품 중심 행동. 동일 제품 재구매 비율 높음(만족도 기반).",
      bullets: [
        "실시간 성과 모니터링: 현재 인기 제품이 과도기에 있어 관찰 시급",
        "Rapid Filtering: 인기/비인기 제품 빠른 구분 및 분류",
        "검증된 베스트셀러에 자원 집중 투자",
      ],
    },
    {
      name: "중기 재구매자",
      badge: "14~40일",
      color: C.purple,
      insight: "단기와 장기 사이 과도기. 브랜드 신뢰 형성 여부가 결정되는 구간",
      desc: "재구매 여부가 브랜드 경험 만족도에 의해 결정됨. 이 구간을 장기로 전환하는 것이 핵심.",
      bullets: [
        "만족도 후속 관리: 구매 후 케어 메시지 발송",
        "동일 계열 제품 추천으로 브랜드 내 다음 구매 유도",
        "리뷰 유도로 브랜드 신뢰 형성 가속화",
      ],
    },
    {
      name: "장기 재구매자",
      badge: "40일 이후",
      color: C.green,
      insight: "프로모션보다 브랜드 노출 빈도가 재구매의 핵심 요인 (상관계수 0.68)",
      desc: "브랜드 신뢰 & 회상 중심. 첫 구매 제품이 브랜드 신뢰 형성 → 타 계열로 확장.",
      bullets: [
        "AI 기반 교차 판매: 첫 구매 → 타 계열 제품 추천 (예: 호안오닉스 → 자마노 10% 쿠폰)",
        "CRM 자동화: 재구매 주기(3~4개월)에 맞춰 자동 메시지 발송",
        "브랜드 회상: 감정적 기억 / 브랜드 이미지 중심 메시지 발송",
      ],
    },
  ];

  return (
    <section id="segment" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SecLabel>세그먼트 분류 · 재구매 패턴 분석</SecLabel>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
          기존 등급제를 넘어선 새로운 분류
        </h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6, maxWidth: 580 }}>
          비회원 74%, 실버 이상 1.5% 미만. 등급으로는 아무것도 보이지 않았습니다.
          재주문 기간이라는 새로운 기준으로 세분화했습니다.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          {/* 등급제 한계 + 도넛 차트 */}
          <Card style={{ padding: "24px 28px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 16 }}>재주문 기간 기반 3가지 분류</div>

            {/* 도넛 차트 (SVG로 직접 구현) */}
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <svg width={140} height={140} viewBox="0 0 140 140">
                {/* 단기 50% */}
                <circle cx={70} cy={70} r={50} fill="none" stroke={C.accent} strokeWidth={22}
                  strokeDasharray={`${50 * 3.14} ${100 * 3.14}`} strokeDashoffset={0}
                  transform="rotate(-90 70 70)" />
                {/* 장기 30% */}
                <circle cx={70} cy={70} r={50} fill="none" stroke={C.borderDark} strokeWidth={22}
                  strokeDasharray={`${30 * 3.14} ${100 * 3.14}`} strokeDashoffset={`${-50 * 3.14}`}
                  transform="rotate(-90 70 70)" />
                {/* 중기 20% */}
                <circle cx={70} cy={70} r={50} fill="none" stroke={C.purple} strokeWidth={22}
                  strokeDasharray={`${20 * 3.14} ${100 * 3.14}`} strokeDashoffset={`${-80 * 3.14}`}
                  transform="rotate(-90 70 70)" />
                <text x={70} y={66} textAnchor="middle" fontSize={12} fill={C.muted} fontFamily="Plus Jakarta Sans">재구매</text>
                <text x={70} y={82} textAnchor="middle" fontSize={12} fill={C.muted} fontFamily="Plus Jakarta Sans">고객</text>
              </svg>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {DATA.repurchaseSegment.map(({ name, value, color, days }) => (
                  <div key={name} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{name} <span style={{ color }}>{value}%</span></div>
                      <div style={{ fontSize: 11, color: C.faint }}>{days}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 20, background: C.amberBg, borderRadius: 8, padding: "10px 14px", border: `1px solid ${C.amberDim}` }}>
              <div style={{ fontSize: 12, color: C.amber, fontWeight: 600, marginBottom: 2 }}>핵심 차이</div>
              <div style={{ fontSize: 12, color: C.text }}>단기 vs 장기 구매자의 <strong>재구매 동기</strong>가 완전히 다름 — 제품 중심 vs 브랜드 신뢰 중심</div>
            </div>
          </Card>

          {/* 장기 구매자: 프로모션 vs 광고노출 */}
          <Card style={{ padding: "24px 28px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>장기 구매자 — 재구매 결정 요인</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>프로모션보다 브랜드 노출 빈도가 압도적으로 중요</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={[
                { name: "프로모션", value: 0.12, fill: C.borderDark },
                { name: "광고 노출 빈도", value: 0.68, fill: C.accent },
              ]} margin={{ top: 4, right: 16, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: C.text }} />
                <YAxis tick={{ fontSize: 10, fill: C.faint }} domain={[0, 1]} tickFormatter={v => v.toFixed(1)} />
                <Tooltip formatter={(v) => [v.toFixed(2), "상관계수 (R)"]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="상관계수">
                  {[
                    <Cell key={0} fill={C.borderDark} />,
                    <Cell key={1} fill={C.accent} />,
                  ]}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ background: C.accentBg, borderRadius: 8, padding: "10px 14px", border: `1px solid ${C.accentDim}`, marginTop: 12 }}>
              <div style={{ fontSize: 12, color: C.accent }}>
                인사이트: <strong>가격 혜택보다 지속적인 브랜드 리마인드가 더 효과적</strong>
              </div>
            </div>
          </Card>
        </div>

        {/* 세그먼트 전략 탭 */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {segments.map(({ name, badge, color }, i) => (
              <button key={i} onClick={() => setActiveSegment(i)} style={{
                padding: "12px 16px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                background: activeSegment === i ? color + "15" : C.surface,
                border: `1px solid ${activeSegment === i ? color + "40" : C.border}`,
                borderLeft: `3px solid ${activeSegment === i ? color : "transparent"}`,
                transition: "all 0.15s", fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                <div style={{ fontSize: 13, fontWeight: activeSegment === i ? 600 : 400, color: activeSegment === i ? color : C.text, marginBottom: 3 }}>{name}</div>
                <Tag color={color}>{badge}</Tag>
              </button>
            ))}
          </div>
          <Card style={{ padding: "28px 32px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <Tag color={segments[activeSegment].color}>{segments[activeSegment].badge}</Tag>
              <div style={{ fontSize: 17, fontWeight: 600, color: C.text }}>{segments[activeSegment].name}</div>
            </div>
            <div style={{ background: C.amberBg, borderRadius: 8, padding: "12px 16px", marginBottom: 12, border: `1px solid ${C.amberDim}` }}>
              <div style={{ fontSize: 11, color: C.amber, fontWeight: 600, marginBottom: 4 }}>분석 인사이트</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{segments[activeSegment].insight}</div>
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>{segments[activeSegment].desc}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10 }}>실행 전략</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {segments[activeSegment].bullets.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: segments[activeSegment].color, marginTop: 6, flexShrink: 0 }} />
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{b}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

/* ─── STRATEGY SECTION ───────────────────────── */
const StrategySection = () => (
  <section id="strategy" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <SecLabel>예산 최적화 · 실행 전략</SecLabel>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
        저효율 예산 30%를 고효율 '가족 세트'로 재배치
      </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6, maxWidth: 580 }}>
        추가 예산 없이, 기존 예산 재배치만으로 ROAS 23% 반등이 가능합니다.
      </p>

      {/* 3가지 전략 축 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          {
            num: "1", label: "리포지셔닝 (Targeting)",
            before: "2030 연인 타겟",
            after: "35~64 기혼 부부 집중",
            desc: "높은 CPA의 원인이었던 연인 타겟팅 중단. 가족 선물 수요가 높은 기혼층 집중 공략.",
            color: C.accent,
          },
          {
            num: "2", label: "메시지 전략 (Copywriting)",
            before: "설렘, 로맨틱, 사랑",
            after: "가족의 안녕과 재물운",
            desc: "3040 구매자의 실질적 구매 동기에 맞춘 감성 카피 적용. 페르소나 불일치 해소.",
            color: C.purple,
          },
          {
            num: "3", label: "운영 시기 (Timing)",
            before: "상시 운영",
            after: "7~9월 여름 시즌 집중",
            desc: "t-test 검증 결과 효율이 입증된 여름 시즌에 예산을 집중하여 노출 극대화 및 전환 유도.",
            color: C.green,
          },
        ].map(({ num, label, before, after, desc, color }) => (
          <Card key={num} style={{ padding: "24px", borderTop: `3px solid ${color}`, borderRadius: "0 0 12px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: color + "15", border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mono color={color} size={12}>{num}</Mono>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ background: C.bg, borderRadius: 6, padding: "6px 10px", fontSize: 12, color: C.muted, textDecoration: "line-through", flex: 1, textAlign: "center" }}>
                {before}
              </div>
              <div style={{ fontSize: 12, color: C.faint, flexShrink: 0 }}>→</div>
              <div style={{ background: color + "15", borderRadius: 6, padding: "6px 10px", fontSize: 12, color, fontWeight: 600, flex: 1, textAlign: "center", border: `1px solid ${color}30` }}>
                {after}
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
          </Card>
        ))}
      </div>

      {/* ROAS 시뮬레이션 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <Card style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>ROAS 개선 시뮬레이션</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>예산 재배치 비중에 따른 ROAS 개선폭 예측</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={DATA.roasSimulation} margin={{ top: 4, right: 16, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="rate" tick={{ fontSize: 10, fill: C.faint }} tickFormatter={v => `${v}%`}
                label={{ value: "예산 재배치 비중", position: "insideBottom", offset: -2, fontSize: 11, fill: C.muted }} />
              <YAxis tick={{ fontSize: 10, fill: C.faint }} tickFormatter={v => `+${v}%`} />
              <ReferenceLine x={100} stroke={C.accent} strokeDasharray="4 4"
                label={{ value: "+23%", position: "insideTopRight", fontSize: 11, fill: C.accent }} />
              <Tooltip formatter={(v) => [`+${v.toFixed(1)}%`, "ROAS 개선폭"]} />
              <Line type="monotone" dataKey="improvement" stroke={C.accent} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: "24px 28px", background: C.accentBg, border: `1px solid ${C.accentDim}` }} hover={false}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 20 }}>예상 성과 요약</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "ROAS 전망", val: "+23%", sub: "추가 예산 없이 전년 대비 반등", color: C.green },
              { label: "월 순수 유입 증대", val: "+4,960건", sub: "미스매칭 예산 재배치 효과", color: C.accent },
              { label: "유입 효율 개선", val: "+21%", sub: "타겟 재정의 효과", color: C.purple },
            ].map(({ label, val, sub, color }) => (
              <div key={label} style={{ background: C.surface, borderRadius: 8, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 11, color: C.faint }}>{sub}</div>
                </div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 24, color }}>{val}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  </section>
);

/* ─── RETRO SECTION ──────────────────────────── */
const RetroSection = () => (
  <section id="retro" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <SecLabel>프로젝트 회고</SecLabel>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
        솔직한 평가
      </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 1.6 }}>
        잘 된 것만 보여주는 포트폴리오는 신뢰하기 어렵습니다.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* 좋았던 점 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
            좋았던 점
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                title: "데이터 기반 페르소나 재정의",
                desc: "리뷰 데이터 형태소 분석으로 실제 구매 동기가 연인 선물이 아닌 가족의 안녕·재물운임을 발견. 트리 모델 분기점 탐색과 독립적으로 같은 결론에 도달하여 신뢰도를 높였습니다.",
              },
              {
                title: "비효율 구간 식별 → 즉각적 비용 절감 제안",
                desc: "추가 예산 없이 타겟 재배치만으로 ROAS 23% 반등 시뮬레이션을 정량적으로 도출. 분석이 실무 액션으로 직결됩니다.",
              },
              {
                title: "재구매 주기 기반 세그먼트 고도화",
                desc: "기존 등급제 한계를 극복하기 위해 재주문 기간이라는 새로운 기준을 도입. 단기/중기/장기 구매자별 CRM 액션 플랜까지 설계했습니다.",
              },
            ].map(({ title, desc }) => (
              <Card key={title} style={{ padding: "18px 22px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* 보완할 점 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.amber }} />
            보완할 점
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                title: "시각적 요소 분석의 부재",
                desc: "고효율 광고 소재들이 공통적으로 가진 시각적 특징까지는 수치화하여 분석하지 못했습니다. 쥬얼리 산업 특성상 이미지가 구매 결정에 큰 영향을 미치는 만큼, 이미지 인식 등을 활용한 분석이 필요합니다.",
                next: "Computer Vision으로 광고 소재 시각 특성 분석",
              },
              {
                title: "성과 시뮬레이션의 변수 단순화",
                desc: "ROAS 23% 상승 전망 시, 경쟁사 프로모션이나 시장 트렌드 변화 같은 외부 변수를 배제한 채 내부 광고 효율 지표 위주로 산출했습니다.",
                next: "시장 외부 변수 포함 보수적 시나리오 제시 필요",
              },
              {
                title: "단기 구매자 과도기 추가 검증 필요",
                desc: "Top 5 판매량과의 상관관계가 '25.03 이후 소멸(-0.26)된 현상은 흥미롭지만, 원인 분석이 충분하지 않았습니다. 트렌드 변화인지 데이터 특이점인지 검증이 필요합니다.",
                next: "기간 확장 데이터로 상관 소멸 원인 재분석",
              },
            ].map(({ title, desc, next }) => (
              <Card key={title} style={{ padding: "18px 22px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 10 }}>{desc}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 11, color: C.green, fontWeight: 600, flexShrink: 0 }}>→ 개선</span>
                  <span style={{ fontSize: 12, color: C.green, lineHeight: 1.5 }}>{next}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─── FOOTER ─────────────────────────────────── */
const Footer = () => (
  <footer style={{ padding: "40px 40px", borderTop: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: 16, color: C.text, marginBottom: 4 }}>
          데이터 분석 포트폴리오
        </div>
        <div style={{ fontSize: 13, color: C.muted }}>쥬얼리 브랜드 R사 — 타겟 리포지셔닝 및 광고 예산 최적화</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {["태블로 대시보드", "GitHub ↗", "발표 PPT", "← 이전 프로젝트"].map(t => (
          <button key={t} style={{
            padding: "7px 14px", borderRadius: 6, fontSize: 12,
            background: t === "← 이전 프로젝트" ? C.accent : "transparent",
            color: t === "← 이전 프로젝트" ? "#fff" : C.muted,
            border: t === "← 이전 프로젝트" ? "none" : `1px solid ${C.border}`,
            cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { if (t !== "← 이전 프로젝트") { e.currentTarget.style.borderColor = C.borderDark; e.currentTarget.style.color = C.text; } }}
            onMouseLeave={e => { if (t !== "← 이전 프로젝트") { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; } }}
          >{t}</button>
        ))}
      </div>
    </div>
  </footer>
);

/* ─── APP ────────────────────────────────────── */
export default function App() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <Fonts />
      <Nav />
      <main>
        <Hero />
        <SectionTabs />
        <OverviewSection />
        <DataSection />
        <InefficiencySection />
        <PersonaSection />
        <SegmentSection />
        <StrategySection />
        <RetroSection />
      </main>
      <Footer />
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
