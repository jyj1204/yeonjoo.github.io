import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ReferenceLine
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
  teal:      "#0D9488",
  tealBg:    "#F0FDFA",
  tealDim:   "#99F6E4",
};

/* ─── 폰트 ───────────────────────────────────── */
const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: ${C.bg}; color: ${C.text}; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.6; word-break: keep-all; overflow-wrap: break-word; }
    p, div, span, a, button { word-break: keep-all; }
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
  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: size, color: color || C.muted }}>{children}</span>
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
  reorderCurve: Array.from({ length: 50 }, (_, i) => {
    // 실제 분석 패턴 반영: 0~10 불안정, 10+ 안정
    const x = i + 1;
    let y;
    if (x <= 2) y = 0.65 - (x * 0.12);
    else if (x <= 5) y = 0.41 + (x - 2) * 0.03;
    else if (x <= 10) y = 0.50 + (x - 5) * 0.025;
    else y = 0.625 + Math.min((x - 10) * 0.008, 0.14) + Math.sin(x * 0.3) * 0.012;
    return { x, y: Math.min(Math.max(y, 0.3), 0.82) };
  }),
  repurchaseDays: [
    { day: 1, rate: 0.68 }, { day: 2, rate: 0.52 }, { day: 3, rate: 0.45 },
    { day: 4, rate: 0.42 }, { day: 5, rate: 0.40 }, { day: 6, rate: 0.38 },
    { day: 7, rate: 0.44 }, { day: 8, rate: 0.39 }, { day: 9, rate: 0.36 },
    { day: 10, rate: 0.35 }, { day: 11, rate: 0.34 }, { day: 12, rate: 0.33 },
    { day: 13, rate: 0.32 }, { day: 14, rate: 0.36 }, { day: 15, rate: 0.30 },
    { day: 16, rate: 0.28 }, { day: 17, rate: 0.27 }, { day: 18, rate: 0.26 },
    { day: 19, rate: 0.25 }, { day: 20, rate: 0.24 }, { day: 21, rate: 0.23 },
    { day: 22, rate: 0.22 }, { day: 23, rate: 0.21 }, { day: 24, rate: 0.20 },
    { day: 25, rate: 0.19 }, { day: 26, rate: 0.18 }, { day: 27, rate: 0.17 },
    { day: 28, rate: 0.16 }, { day: 29, rate: 0.12 }, { day: 30, rate: 0.08 },
  ],
  cartPosition: [
    { pos: 1, rate: 0.79 }, { pos: 2, rate: 0.74 }, { pos: 3, rate: 0.71 },
    { pos: 4, rate: 0.68 }, { pos: 5, rate: 0.65 }, { pos: 6, rate: 0.63 },
    { pos: 7, rate: 0.61 }, { pos: 8, rate: 0.59 }, { pos: 9, rate: 0.57 },
    { pos: 10, rate: 0.55 },
  ],
  hourlyReorder: [
    { hour: "0시", count: 120 }, { hour: "2시", count: 80 }, { hour: "4시", count: 60 },
    { hour: "6시", count: 200 }, { hour: "7시", count: 480 }, { hour: "8시", count: 1200 },
    { hour: "9시", count: 2100 }, { hour: "10시", count: 2400 }, { hour: "11시", count: 2600 },
    { hour: "12시", count: 2500 }, { hour: "13시", count: 2400 }, { hour: "14시", count: 2300 },
    { hour: "15시", count: 2100 }, { hour: "16시", count: 1900 }, { hour: "17시", count: 1700 },
    { hour: "18시", count: 1500 }, { hour: "19시", count: 1200 }, { hour: "20시", count: 900 },
    { hour: "21시", count: 650 }, { hour: "22시", count: 400 }, { hour: "23시", count: 220 },
  ],
  dayOfWeek: [
    { day: "토", count: 1850 }, { day: "일", count: 2200 }, { day: "월", count: 2100 },
    { day: "화", count: 2050 }, { day: "수", count: 1700 }, { day: "목", count: 1600 }, { day: "금", count: 1750 },
  ],
  matchRate: [
    { range: "0~10%", count: 18000 }, { range: "10~20%", count: 4200 }, { range: "20~30%", count: 1800 },
    { range: "30~50%", count: 980 }, { range: "50~70%", count: 320 }, { range: "70~100%", count: 90 },
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
      </div>
    </nav>
  );
};

const sectionTabs = [
  { label: "개요", href: "#overview" },
  { label: "데이터", href: "#data" },
  { label: "WHO", href: "#who" },
  { label: "WHEN", href: "#when" },
  { label: "WHAT", href: "#what" },
  { label: "HOW", href: "#how" },
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
        {["데이터 분석", "개인화 마케팅", "고객 세분화", "SQL · Python · Tableau", "Kaggle 공개 데이터"].map((t, i) => (
          <Tag key={t} color={i === 0 ? C.accent : C.muted} bg={i === 0 ? C.accentBg : C.bg}>{t}</Tag>
        ))}
      </div>

      <h1 className="fu fu2" style={{
        fontFamily: "'Lora', serif", fontSize: 48, fontWeight: 500,
        lineHeight: 1.15, letterSpacing: "-0.02em", color: C.text,
        marginBottom: 16, maxWidth: 720,
      }}>
        Instacart 구매 로그 기반<br />
        <span style={{ color: C.accent }}>개인화 마케팅 전략</span>
      </h1>

      <p className="fu fu3" style={{
        fontSize: 17, color: C.muted, lineHeight: 1.7,
        marginBottom: 28, maxWidth: 600,
      }}>
        300만 건 이상의 실제 주문 로그에서 <strong style={{ color: C.text }}>고객 생애주기 신호</strong>를 포착하고,<br />
        누구에게 · 언제 · 무엇을 추천할지 데이터 기반 마케팅 전략으로 설계.
      </p>

      <div className="fu fu5" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 48 }}>
        {[
          { label: "총 주문 수", val: "300만+", sub: "Kaggle 공개 prior 주문 기록", color: C.accent },
          { label: "고객 수", val: "20만+", sub: "생애주기 3단계로 세분화", color: C.text },
          { label: "분석 상품 수", val: "4만+", sub: "부서 · 카테고리 통합", color: C.text },
          { label: "팀 구성", val: "4명", sub: "데이터 분석가", color: C.green },
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
        왜 이 분석인가
      </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 40, lineHeight: 1.6, maxWidth: 760 }}>
        이커머스 시장의 고객 유지 경쟁이 심화될수록, 방대한 로그 속 유의미한 신호를 포착하는 능력이 핵심.<br />
        단순 판매량이 아닌 <strong style={{ color: C.text }}>고객 행동 변곡점</strong>에서 전략 도출.
      </p>

      {/* 분석 흐름 */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 16 }}>5단계 분석 프로세스</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(120px, 1fr))", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
          {[
            { step: "01", label: "데이터 통합", desc: "7개 테이블 병합\n피처 엔지니어링", color: C.muted },
            { step: "02", label: "WHO", desc: "고객 생애주기\n3단계 세분화", color: C.accent },
            { step: "03", label: "WHEN", desc: "재구매 타이밍\n개인화 예측", color: C.purple },
            { step: "04", label: "WHAT", desc: "상품 조합 시너지\n저성과 부서 개선", color: C.amber },
            { step: "05", label: "HOW", desc: "마케팅 실행\n액션 플랜", color: C.green },
          ].map(({ step, label, desc, color }, i, arr) => (
            <div key={step} style={{ position: "relative", minWidth: 120 }}>
              <div style={{
                background: C.surface, border: `1px solid ${color}40`,
                borderRadius: 10, padding: "14px 18px", textAlign: "center",
                borderTop: `3px solid ${color}`, height: "100%",
              }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.faint, marginBottom: 4 }}>{step}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: C.muted, whiteSpace: "pre-line", lineHeight: 1.5 }}>{desc}</div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ position: "absolute", top: "50%", right: -14, transform: "translateY(-50%)", zIndex: 2, display: "flex", alignItems: "center", pointerEvents: "none" }}>
                  <div style={{ width: 12, height: 1, background: C.border }} />
                  <div style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: `6px solid ${C.borderDark}` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 핵심 문제 정의 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          {
            icon: "🎯",
            title: "핵심 과제 1",
            problem: "단순 재구매율의 한계",
            solution: "재구매율 × log(판매량) 조합의 '재구매 점수' 설계 → 실질 매출 기여 상품 식별",
            color: C.accent,
          },
          {
            icon: "⏱️",
            title: "핵심 과제 2",
            problem: "평균 주기의 함정",
            solution: "개인별 '재구매 간격 일치율' 도입 → 평균이 아닌 실제 행동 패턴 기반 타이밍 마케팅",
            color: C.purple,
          },
          {
            icon: "📊",
            title: "핵심 과제 3",
            problem: "등급제로 충성 고객 식별 불가",
            solution: "재주문 횟수의 통계적 변곡점(10회) 기반 3단계 생애주기 정의 → 단계별 전략 차별화",
            color: C.green,
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
              <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginBottom: 3 }}>해결</div>
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
      title: "Prior 주문 필터링",
      desc: "train/test는 마지막 주문 1회분이라 포함 시 재구매율이 부정확하게 높아짐 → prior 주문만 추출",
      color: C.accent,
    },
    {
      title: "테이블 통합",
      desc: "products + aisles + departments 상품 정보 통합 후, orders + order_products_prior 주문 정보와 병합",
      color: C.purple,
    },
    {
      title: "파생 변수 생성",
      desc: "① Organic 라벨링 (상품명 텍스트 마이닝)\n② User Reorder Count (사용자별 특정 상품 재주문 횟수)\n③ Product Metrics (총 판매량 · 재구매율 · 재구매 점수)",
      color: C.amber,
    },
    {
      title: "결측치 처리",
      desc: "첫 구매 시 주문 간격 NaN → -1 치환\nmissing·other 부서 라벨은 삭제 없이 유지 (유의미한 패턴 가능성)",
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
          Kaggle Instacart 데이터셋 7개 테이블을 통합하고, 분석 목적에 맞는 핵심 지표 설계.
        </p>

        {/* 데이터셋 규모 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 36 }}>
          {[
            { label: "총 주문 수", val: "3,421,083", unit: "건", color: C.accent },
            { label: "고객 수", val: "206,209", unit: "명", color: C.purple },
            { label: "상품 수", val: "49,688", unit: "개", color: C.green },
          ].map(({ label, val, unit, color }) => (
            <Card key={label} style={{ padding: "24px 28px" }} hover={false}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, fontWeight: 500 }}>{label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 32, color, letterSpacing: "-0.02em" }}>{val}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{unit}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* 전처리 단계 탭 */}
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

        {/* 핵심 지표: 재구매 점수 */}
        <Card style={{ padding: "28px 32px", background: C.accentBg, border: `1px solid ${C.accentDim}` }} hover={false}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: "0.06em" }}>★ 핵심 설계 지표</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>재구매 점수 (Repurchase Score)</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 12, alignItems: "center" }}>
            <div style={{ background: C.surface, borderRadius: 8, padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>재구매율</div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 22, color: C.accent }}>reorder_rate</div>
            </div>
            <div style={{ fontSize: 24, color: C.accentDim, fontWeight: 300 }}>×</div>
            <div style={{ background: C.surface, borderRadius: 8, padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>판매량 가중치</div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 22, color: C.accent }}>log₁₊(total_orders)</div>
            </div>
            <div style={{ fontSize: 24, color: C.accentDim, fontWeight: 300 }}>=</div>
            <div style={{ background: C.surface, borderRadius: 8, padding: "16px 20px", textAlign: "center", border: `1px solid ${C.accentDim}` }}>
              <div style={{ fontSize: 11, color: C.accent, marginBottom: 6, fontWeight: 600 }}>Repurchase Score</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>단순 재구매율의 한계 보완<br />실질 매출 기여도 반영</div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

/* ─── WHO SECTION ────────────────────────────── */
const WhoSection = () => {
  const [activeSegment, setActiveSegment] = useState(0);

  const segments = [
    {
      name: "첫 구매 고객", badge: "신규",
      color: C.teal,
      insight: "장바구니에 먼저 담은 상품일수록 재구매율이 높음 (1번째 상품 재구매율 79%)",
      strategy: "검증된 스테디셀러 중심 추천 — 신선식품·유기농·유제품 인기 상품 10개 랜덤 노출",
      bullets: ["바나나·딸기·아보카도 등 신선식품 집중", "Organic 상품 우선 노출", "장바구니 초반 담기 상품 가중치 부여"],
    },
    {
      name: "탐색형 (Exploratory)", badge: "0~10회",
      color: C.amber,
      insight: "재주문 확률 변동이 크고 이탈 위험 높음 — 불안정 구간",
      strategy: "고충성 부서(Babies·Pets) 첫 경험 유도 → 잠금 효과 활용",
      bullets: ["타겟 광고: Babies/Pets 부서 첫 유입 유도", "푸드 페어링: Alcohol 구매 시 Snacks 추천", "'첫 Babies 구매 시 유기농 우유 증정' 메시지"],
    },
    {
      name: "정착형 (Established)", badge: "11회+",
      color: C.purple,
      insight: "재주문 확률 안정적 유지 — 습관 형성 완료, 카테고리 확장 가능성 보유",
      strategy: "구독 전환 + 카테고리 확장으로 충성 고객 전환",
      bullets: ["Pets 1~2회 구매 시 정기구독 제안", "Alcohol 구매 시 Meat/Seafood 페어링 추천", "충성 고객 전환 집중 관리"],
    },
    {
      name: "충성 고객 (Loyal)", badge: "상위 20%",
      color: C.accent,
      insight: "Instacart를 일상의 일부로 인식 — 규칙적·예측 가능한 구매 패턴",
      strategy: "VIP 우선권 + 선제적 이탈 방지 케어",
      bullets: ["구매 주기 예측 → 재고 선확보", "품절 임박 상품 VIP 우선 구매권 부여", "예측 재고 관리로 충성 고객 만족도 유지"],
    },
  ];

  return (
    <section id="who" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SecLabel>WHO — 고객 세분화</SecLabel>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
          고객 생애주기 기반 등급 정의
        </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6, maxWidth: 1000 }}>
          재주문 횟수 기반 통계적 변곡점(10회)에서 고객 단계가 나뉨. 단순 주문 횟수가 아닌 <strong style={{ color: C.text }}>재주문 확률 안정성</strong>이 세분화 기준.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          {/* 재주문 확률 곡선 */}
          <Card style={{ padding: "24px 28px" }} hover={false}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>재주문 횟수별 재구매 확률</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>10회를 기점으로 확률이 안정화됨</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={DATA.reorderCurve} margin={{ top: 4, right: 16, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="x" tick={{ fontSize: 11, fill: C.faint }} label={{ value: "재주문 횟수", position: "insideBottom", offset: -2, fontSize: 11, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.faint }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                <Tooltip content={<ChartTip unit="" />} formatter={(v) => [`${(v * 100).toFixed(1)}%`, "재구매 확률"]} />
                <ReferenceLine x={10} stroke={C.red} strokeDasharray="4 4" label={{ value: "변곡점", position: "insideTopRight", fontSize: 10, fill: C.red }} />
                {/* 불안정 구간 */}
                <Line type="monotone" dataKey="y" stroke={C.accent} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: 2, background: C.amber }} />
                <span style={{ fontSize: 11, color: C.muted }}>불안정 구간 (0~10회)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: 2, background: C.green }} />
                <span style={{ fontSize: 11, color: C.muted }}>안정 구간 (10회+)</span>
              </div>
            </div>
          </Card>

          {/* 부서별 가치 매트릭스 */}
          <Card style={{ padding: "24px 28px" }} hover={false}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>부서별 충성도 × 도달률 분석</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>구매 고객 수는 적어도 재주문율이 높은 '고충성 부서' 타겟</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: C.border, borderRadius: 8, overflow: "hidden", height: 180 }}>
              {[
                { label: "충성도 형성 부서", items: "Babies, Pets, Alcohol, Bulk", color: C.green, bg: C.greenBg, desc: "고재주문율 · 소고객수 → 잠금효과 ★" },
                { label: "핵심 부서", items: "Produce, Dairy Eggs, Beverages, Snacks", color: C.accent, bg: C.accentBg, desc: "고재주문율 · 고고객수 → 주력" },
                { label: "개선 필요 부서", items: "International, Personal Care, Missing", color: C.muted, bg: C.bg, desc: "저재주문율 · 저고객수" },
                { label: "잠재적 성장", items: "Household, Pantry, Frozen", color: C.amber, bg: C.amberBg, desc: "저재주문율 · 고고객수 → 번들 전략" },
              ].map(({ label, items, color, bg, desc }) => (
                <div key={label} style={{ background: bg, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 11, color: C.text, marginBottom: 4, lineHeight: 1.4 }}>{items}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{desc}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 10, color: C.faint }}>← 구매 고객 수 (낮음)</span>
              <span style={{ fontSize: 10, color: C.faint }}>구매 고객 수 (높음) →</span>
            </div>
          </Card>
        </div>

        {/* 세그먼트 전략 탭 */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "stretch" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, height: "100%" }}>
            {segments.map(({ name, badge, color }, i) => (
              <button key={i} onClick={() => setActiveSegment(i)} style={{
                padding: "12px 16px", borderRadius: 8, cursor: "pointer", textAlign: "left", flex: 1,
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
            <div style={{ background: C.amberBg, borderRadius: 8, padding: "12px 16px", marginBottom: 14, border: `1px solid ${C.amberDim}` }}>
              <div style={{ fontSize: 11, color: C.amber, fontWeight: 600, marginBottom: 4 }}>분석 인사이트</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{segments[activeSegment].insight}</div>
            </div>
            <div style={{ background: C.accentBg, borderRadius: 8, padding: "12px 16px", marginBottom: 14, border: `1px solid ${C.accentDim}` }}>
              <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginBottom: 4 }}>마케팅 전략</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{segments[activeSegment].strategy}</div>
            </div>
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

/* ─── WHEN SECTION ───────────────────────────── */
const WhenSection = () => (
  <section id="when" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <SecLabel>WHEN — 타이밍 마케팅</SecLabel>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
        언제 마케팅할 것인가
      </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6, maxWidth: 580 }}>
        재구매 간격 일치율로 '평균의 함정'을 피하고, 요일·시간대 분석으로 개인화 푸시 타이밍 최적화.
      </p>

      {/* 재구매 간격 일치율 설명 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>재구매 간격 일치율이란?</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>단순 평균 주문 간격의 한계를 보완 — 개별 고객이 평균 ±1일 이내로 실제 재구매한 비율</div>

          {/* User A vs B 시각화 */}
          {[
            { label: "User A (규칙적)", gaps: [14, 15, 14], widths: [52, 56, 52], color: C.green, rate: "일치율 HIGH" },
            { label: "User B (불규칙)", gaps: [2, 25, 7], widths: [18, 92, 34], color: C.red, rate: "일치율 LOW" },
          ].map(({ label, gaps, widths, color, rate }) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{label}</span>
                <Tag color={color}>{rate}</Tag>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                {["구매1", "구매2", "구매3", "구매4"].map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, border: `2px solid ${color}` }} />
                    {i < 3 && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ fontSize: 9, color: C.faint, marginBottom: 1 }}>{gaps[i]}일</div>
                        <div style={{ width: widths[i], height: 1, background: C.borderDark }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ background: C.accentBg, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.accentDim}`, marginTop: 8 }}>
            <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 4 }}>마케팅 타겟 기준</div>
            <div style={{ fontSize: 12, color: C.text }}>일치율 <strong>30% 이상</strong> → 최종 <strong>285개 상품</strong> 추출</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>예: 성인용 비타민 젤리 — 일치율 100%, 30일 주기 정기 구매</div>
          </div>
        </Card>

        {/* 재구매 주기 패턴 */}
        <Card style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>이전 주문 후 경과일별 재구매율</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>7일, 14일에 재구매율 상승 피크 — 마케팅 골든타임</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={DATA.repurchaseDays} margin={{ top: 4, right: 16, left: -24, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.faint }} label={{ value: "경과일", position: "insideBottom", offset: -2, fontSize: 11, fill: C.muted }} />
              <YAxis tick={{ fontSize: 10, fill: C.faint }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
              <Tooltip formatter={(v) => [`${(v * 100).toFixed(1)}%`, "재구매율"]} />
              <ReferenceLine x={7} stroke={C.accent} strokeDasharray="3 3" />
              <ReferenceLine x={14} stroke={C.purple} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="rate" stroke={C.accent} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
            {[
              { days: "≤8일", desc: "고빈도 생필품", action: "정기 배송 구독", color: C.accent },
              { days: "9~14일", desc: "다양한 식재료", action: "격주 배송 구독", color: C.purple },
              { days: "15일+", desc: "건강 식단 재료", action: "JIT 리마인드", color: C.green },
            ].map(({ days, desc, action, color }) => (
              <div key={days} style={{ flex: 1, minWidth: 80 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color }}>{days}</div>
                <div style={{ fontSize: 11, color: C.text }}>{desc}</div>
                <div style={{ fontSize: 10, color: C.muted }}>→ {action}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 요일 · 시간대 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20 }}>
        <Card style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>요일별 재구매 집중도</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>일~화 오전에 집중 푸시 알림 효율 최대</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={DATA.dayOfWeek} margin={{ top: 4, right: 8, left: -28, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: C.text }} />
              <YAxis tick={{ fontSize: 10, fill: C.faint }} />
              <Tooltip formatter={(v) => [v.toLocaleString(), "재구매 주문 수"]} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {DATA.dayOfWeek.map((d, i) => (
                  <Cell key={i} fill={["일", "월", "화"].includes(d.day) ? C.accent : C.accentDim} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>시간대별 재구매 집중도</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>오전 9시~오후 3시 집중 — 푸시 알림 최적 타이밍</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={DATA.hourlyReorder} margin={{ top: 4, right: 8, left: -28, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: C.faint }} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: C.faint }} />
              <Tooltip formatter={(v) => [v.toLocaleString(), "재구매 주문 수"]} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {DATA.hourlyReorder.map((d, i) => {
                  const h = parseInt(d.hour);
                  const peak = h >= 9 && h <= 15;
                  return <Cell key={i} fill={peak ? C.accent : C.accentDim} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, background: C.accentBg, padding: "8px 12px", borderRadius: 6 }}>
            <span style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>★ 핵심 타이밍</span>
            <span style={{ fontSize: 12, color: C.text }}>일~화요일 오전 9시 ~ 오후 3시 집중 푸시 알림 발송</span>
          </div>
        </Card>
      </div>

      {/* 개인화 추천 로직 */}
      <div style={{ marginTop: 20 }}>
        <Card style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>개인화 추천 리스트 생성 로직</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { step: "STEP 1", title: "선호 시점 추출", desc: "USER ID + 주문 요일 + 주문 시각 조합 → 사용자별 TOP 3 구매 시점 추출", color: C.accent },
              { step: "STEP 2", title: "다양성 확보 추천", desc: "카테고리 가중치 반영 상위 70% + 확률적 랜덤 추출 30% 조합 → 추천 고착화 방지", color: C.purple },
              { step: "RESULT", title: "개인 맞춤 알림", desc: "앱 푸시·이메일·문자 중 선호 채널에 선호 시점 맞춤 큐레이션 10개 제공", color: C.green },
            ].map(({ step, title, desc, color }) => (
              <div key={step} style={{ background: C.bg, borderRadius: 8, padding: "16px" }}>
                <Mono size={10} color={color}>{step}</Mono>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: "6px 0 8px" }}>{title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  </section>
);

/* ─── WHAT SECTION ───────────────────────────── */
const WhatSection = () => (
  <section id="what" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <SecLabel>WHAT — 상품 전략</SecLabel>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
        무엇을 추천할 것인가
      </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6, maxWidth: 560 }}>
        연관 규칙 분석으로 상품 조합 시너지를 찾고, 잔차 분석으로 판매량 대비 재구매율이 낮은 부서 개선.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* 상품 조합 시너지 */}
        <Card style={{ padding: "24px 28px", display: "flex", flexDirection: "column", minHeight: 456 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>상품 조합 시너지 (연관 규칙 분석)</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>Produce 부서 중심으로 교차 부서 연관 관계 분석 → 크로스 셀링 번들 기획</div>

          {/* 네트워크 다이어그램 */}
          <div style={{ position: "relative", height: 250, background: C.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, flexShrink: 0 }}>
            {/* 중심 */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 2 }}>
              <div style={{ background: C.accent, borderRadius: "50%", width: 68, height: 68, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", boxShadow: `0 0 0 8px ${C.accentDim}` }}>
                <div style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>Produce</div>
                <div style={{ fontSize: 9, color: C.accentDim }}>바나나·딸기</div>
              </div>
            </div>
            {/* 주변 노드 */}
            {[
              { label: "Dairy Eggs", sub: "우유·요거트", x: "50%", y: "6%", tx: "-50%", ty: "0" },
              { label: "Bakery", sub: "빵", x: "86%", y: "22%", tx: "-100%", ty: "0" },
              { label: "Snacks", sub: "프레츨", x: "88%", y: "65%", tx: "-100%", ty: "0" },
              { label: "Frozen", sub: "아이스크림", x: "50%", y: "78%", tx: "-50%", ty: "0" },
              { label: "Beverages", sub: "주스·탄산", x: "12%", y: "65%", tx: "0", ty: "0" },
              { label: "Bakery", sub: "베이커리", x: "10%", y: "22%", tx: "0", ty: "0" },
            ].map(({ label, sub, x, y, tx, ty }, i) => (
              <div key={i} style={{ position: "absolute", top: y, left: x, transform: `translate(${tx}, ${ty})`, zIndex: 1 }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", textAlign: "center", fontSize: 10 }}>
                  <div style={{ fontWeight: 600, color: C.text }}>{label}</div>
                  <div style={{ color: C.faint }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { bundle: "스무디 번들", items: "바나나 + 딸기 + 우유", color: C.teal },
              { bundle: "건강 식사 세트", items: "바나나 + 프레츨 스낵", color: C.green },
            ].map(({ bundle, items, color }) => (
              <div key={bundle} style={{ background: color + "10", border: `1px solid ${color}30`, borderRadius: 6, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color }}>{bundle}</span>
                <span style={{ fontSize: 12, color: C.muted }}>{items}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 저성과 부서 개선 */}
        <Card style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>저성과 부서 식별 (잔차 분석)</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.5 }}>회귀선 기준으로 판매량 대비 재구매율이 낮은 부서 → 개선 대상</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { dept: "Pantry", issue: "판매량 높으나 재구매율 기대치 하회", action: "파스타 + 소스 인기 세트 구성", color: C.red },
              { dept: "Household", issue: "세제 등 소진 주기 불규칙", action: "구매 주기 리마인드 알림 자동 발송", color: C.amber },
              { dept: "Frozen", issue: "잔차 분석 개선 필요군", action: "아이스크림 계절 프로모션 연계", color: C.amber },
              { dept: "Dry Goods / Canned", issue: "장기 보관 상품 재구매 유인 부족", action: "장기 보관 식재료 세트 번들화", color: C.muted },
            ].map(({ dept, issue, action, color }) => (
              <div key={dept} style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", borderLeft: `3px solid ${color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{dept}</span>
                  <Tag color={color}>개선 필요</Tag>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{issue}</div>
                <div style={{ fontSize: 12, color: C.green }}>→ {action}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  </section>
);

/* ─── HOW SECTION ────────────────────────────── */
const HowSection = () => (
  <section id="how" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <SecLabel>HOW — 마케팅 프레임워크</SecLabel>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
        종합 마케팅 실행 전략
      </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6, maxWidth: 580 }}>
        WHO · WHEN · WHAT 분석 결과를 하나의 실행 가능한 마케팅 프레임워크로 통합.
      </p>

      {/* 3개 축 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          {
            axis: "WHO", icon: "👤", color: C.accent,
            title: "고객 생애주기별 접근",
            points: [
              "첫 구매: 스테디셀러 중심 진입 유도",
              "탐색형: 고충성 부서 잠금 효과 활용",
              "정착형: 구독 전환 + 카테고리 확장",
              "충성형: VIP 우선권 이탈 방지",
            ],
          },
          {
            axis: "WHEN", icon: "⏰", color: C.purple,
            title: "최적의 골든타임 공략",
            points: [
              "재구매 주기(7일/14일) D-1 리마인드",
              "일~화 오전 9시~15시 집중 푸시",
              "사용자별 선호 요일·시간대 분석",
              "일치율 80%+ 상품은 정기배송 유도",
            ],
          },
          {
            axis: "WHAT", icon: "📦", color: C.green,
            title: "상품 시너지 + 번들링",
            points: [
              "교차 부서 연관 규칙 기반 추천",
              "스무디·건강식사 세트 크로스 셀링",
              "저성과 부서 번들 + 리마인드 전략",
              "다양성 30% 랜덤 추천으로 고착화 방지",
            ],
          },
        ].map(({ axis, icon, color, title, points }) => (
          <Card key={axis} style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
              <div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 22, color, letterSpacing: "-0.02em" }}>{axis}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{title}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {points.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: color, marginTop: 7, flexShrink: 0 }} />
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{p}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* 기대 효과 */}
      <Card style={{ padding: "28px 32px", background: C.accentBg, border: `1px solid ${C.accentDim}` }} hover={false}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 16 }}>데이터 기반 정밀 타겟팅의 기대 효과</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { title: "고객 충성도 증대", desc: "생애주기별 차별화 전략으로 이탈 방지 + VIP 잠금 효과 강화", color: C.accent },
            { title: "신규 수요 창출", desc: "교차 부서 번들 + 개인화 추천으로 미구매 카테고리 전환 유도", color: C.purple },
            { title: "지속 가능한 성장", desc: "구독 전환 + 정기 배송 리마인드로 안정적 재구매 기반 구축", color: C.green },
          ].map(({ title, desc, color }) => (
            <div key={title} style={{ background: C.surface, borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 8 }}>✓ {title}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </Card>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* 좋았던 점 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
            좋았던 점
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "비즈니스 목적에 부합하는 지표 설계", desc: "단순 재구매율의 한계를 보완한 재구매 점수 설계로 실질 매출 기여 상품 식별. 평균의 함정을 피하기 위한 일치율 지표 도입으로 개별 행동 패턴 기반 타겟팅 근거 마련." },
              { title: "데이터 근거 기반 고객 세분화", desc: "재주문 확률의 통계적 변곡점을 기준으로 고객 라이프사이클을 정의하여 마케팅 우선순위와 단계별 전략 방향성 수립." },
              { title: "전략 실행력을 고려한 인사이트 도출", desc: "[WHO-WHEN-WHAT] 구조를 통해 분석 결과가 단순 현황 파악에 그치지 않고, 실무에 적용 가능한 액션 플랜으로 연결되도록 설계." },
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
              { title: "추천 알고리즘 고도화 필요", desc: "현재 규칙 기반 분석을 넘어 협업 필터링 또는 딥러닝 기반 모델을 도입하면 더 정교한 개인화 추천 성능 확보 가능.", next: "협업 필터링(CF) 또는 딥러닝 추천 모델 도입" },
              { title: "외부 변수 데이터 부재", desc: "주문 로그 외 프로모션 노출 정보, 유입 채널 등 외부 변수 데이터 부재로 구매 동기 파악에 한계.", next: "프로모션·유입 채널 데이터 연계 분석" },
              { title: "A/B 테스트 성과 검증 미비", desc: "도출된 전략의 실제 구매 전환율 기여도를 확인할 수 있는 실험 설계 및 사후 성과 분석 프로세스 부족.", next: "전략별 A/B 테스트 설계 및 정량적 검증" },
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
        <div style={{ fontSize: 13, color: C.muted }}>Instacart 구매 로그 기반 개인화 마케팅 전략</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <a href="./portfolio_case_warehouse.html" style={{
          padding: "8px 16px", borderRadius: 7, fontSize: 12,
          background: "transparent", color: C.muted,
          border: `1px solid ${C.border}`, cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600, transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderDark; e.currentTarget.style.color = C.text; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
        >← 이전 프로젝트</a>
        <a href="./portfolio_case_jewelry.html" style={{
          padding: "8px 16px", borderRadius: 7, fontSize: 12,
          background: C.accent, color: "#fff",
          border: `1px solid ${C.accent}`, cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600, transition: "opacity 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
        >다음 프로젝트 →</a>
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
        <WhoSection />
        <WhenSection />
        <WhatSection />
        <HowSection />
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
