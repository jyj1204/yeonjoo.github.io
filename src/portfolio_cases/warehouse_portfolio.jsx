import { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from "recharts";

/* ─── 색상 시스템 ─────────────────────────────── */
const C = {
  bg:       "#F4F5F7",
  surface:  "#FFFFFF",
  surfaceAlt: "#F9FAFB",
  border:   "#E5E7EB",
  borderDark: "#D1D5DB",
  text:     "#1A1A2E",
  muted:    "#6B7280",
  faint:    "#9CA3AF",
  accent:   "#2563EB",
  accentBg: "#EFF6FF",
  accentDim:"#BFDBFE",
  green:    "#10B981",
  greenBg:  "#ECFDF5",
  greenDim: "#A7F3D0",
  red:      "#EF4444",
  redBg:    "#FEF2F2",
  redDim:   "#FECACA",
  amber:    "#F59E0B",
  amberBg:  "#FFFBEB",
  amberDim: "#FDE68A",
  purple:   "#7C3AED",
  purpleBg: "#F5F3FF",
  purpleDim:"#DDD6FE",
};

/* ─── 폰트 ───────────────────────────────────── */
const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=Lora:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: ${C.bg}; color: ${C.text}; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.6; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: ${C.bg}; }
    ::-webkit-scrollbar-thumb { background: ${C.borderDark}; border-radius: 3px; }
    a { color: inherit; text-decoration: none; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
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
        border: `1px solid ${C.border}`,
        transition: "box-shadow 0.2s",
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

const Divider = () => <div style={{ height: 1, background: C.border, margin: "0" }} />;

/* ─── 커스텀 툴팁 ────────────────────────────── */
const ChartTip = ({ active, payload, label, unit = "분" }) => {
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
  idle: [
    { group: "최저 20%", delay: 36.3 },
    { group: "20~40%",   delay: 28.1 },
    { group: "40~60%",   delay: 18.4 },
    { group: "60~80%",   delay: 10.2 },
    { group: "최고 20%", delay: 5.5  },
  ],
  pack: [
    { range: "0~10%",  delay: 19.8 },
    { range: "10~20%", delay: 17.2 },
    { range: "20~30%", delay: 15.4 },
    { range: "30~40%", delay: 13.8 },
    { range: "40~50%", delay: 13.3 },
    { range: "50~60%", delay: 12.0 },
    { range: "60~70%", delay: 12.1 },
    { range: "70~80%", delay: 12.0 },
    { range: "80~90%", delay: 12.0 },
    { range: "90%+",   delay: 29.6 },
  ],
  combo: [
    { label: "0개 (모두 정상)", delay: 10.2, crisis: 2.4 },
    { label: "1개",             delay: 17.9, crisis: 5.1 },
    { label: "2개",             delay: 29.9, crisis: 8.2 },
    { label: "3개 (모두 나쁨)", delay: 38.1, crisis: 11.3 },
  ],
  psm: [
    { group: "hub_spoke", before: 22.09, after: 21.68 },
    { group: "나머지",    before: 18.40, after: 22.24 },
  ],
  timeline: [
    { snap: "-6", idle: 0.226, congestion: 18.09, battery: 0.266 },
    { snap: "-5", idle: 0.223, congestion: 18.15, battery: 0.274 },
    { snap: "-4", idle: 0.221, congestion: 18.08, battery: 0.281 },
    { snap: "-3", idle: 0.219, congestion: 18.07, battery: 0.283 },
    { snap: "-2", idle: 0.217, congestion: 18.05, battery: 0.284 },
    { snap: "-1", idle: 0.215, congestion: 18.13, battery: 0.282 },
    { snap: "위기\n직전", idle: 0.214, congestion: 18.37, battery: 0.280 },
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
  { label: "분석 스토리", href: "#story" },
  { label: "핵심 발견", href: "#findings" },
  { label: "시각화", href: "#viz" },
  { label: "방법론", href: "#method" },
  { label: "운영 전략", href: "#priority" },
  { label: "경진대회", href: "#competition" },
  { label: "한계", href: "#limits" },
];

const SectionTabs = () => (
  <div style={{
    position: "sticky", top: 56, zIndex: 90,
    background: C.bg, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
  }}>
    <div style={{
      maxWidth: 1100, margin: "0 auto", padding: "0 40px",
      display: "flex", gap: 24, overflowX: "auto",
    }}>
      {sectionTabs.map(({ label, href }) => (
        <a key={label} href={href} style={{
          display: "inline-flex", alignItems: "center", height: 56,
          fontSize: 13, color: C.muted, fontWeight: 500, whiteSpace: "nowrap",
          borderBottom: "2px solid transparent",
          transition: "color 0.15s, border-color 0.15s",
        }}
          onMouseEnter={e => {
            e.currentTarget.style.color = C.text;
            e.currentTarget.style.borderBottomColor = C.text;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = C.muted;
            e.currentTarget.style.borderBottomColor = "transparent";
          }}
        >{label}</a>
      ))}
    </div>
  </div>
);

/* ─── HERO ───────────────────────────────────── */
const Hero = () => (
  <section style={{ padding: "64px 40px 48px", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div className="fu fu1" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["물류 · 운영 분석", "LightGBM", "CatBoost", "PSM 인과 검증", "K-Means 군집화", "경진대회 상위 15%"].map((t, i) => (
          <Tag key={t} color={i === 5 ? C.green : i === 0 ? C.accent : C.muted} bg={i === 5 ? C.greenBg : i === 0 ? C.accentBg : C.bg}>{t}</Tag>
        ))}
      </div>

      <h1 className="fu fu2" style={{
        fontFamily: "'Lora', serif", fontSize: 48, fontWeight: 500,
        lineHeight: 1.15, letterSpacing: "-0.02em", color: C.text,
        marginBottom: 16, maxWidth: 700,
      }}>
        DACON 스마트 창고<br />
        <span style={{ color: C.accent }}>출고 지연</span> 예측
      </h1>

      <p className="fu fu3" style={{
        fontSize: 17, color: C.muted, lineHeight: 1.7,
        marginBottom: 48, maxWidth: 640,
      }}>
        250개 창고, 25만 건 데이터. 레이아웃이 문제라고 생각했는데 운영이었고,
        중요하지 않다고 본 변수가 핵심.
        <strong style={{ color: C.text, fontWeight: 600 }}> 분석 과정에서 결론이 세 번 바뀜. 그 인사이트로 경진대회 상위 15% 달성.</strong>
      </p>

      {/* KPI 4개 */}
      <div className="fu fu4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "분석 창고 수", val: "250개", sub: "4개 레이아웃 유형", color: C.text },
          { label: "지연 최대 차이", val: "6.6×", sub: "idle 최저 vs 최고", color: C.accent },
          { label: "결론 수정 횟수", val: "3회", sub: "가설 → 검증 → 수정", color: C.text },
          { label: "경진대회 성적", val: "상위 15%", sub: "예측 모델 MAE 최적화", color: C.green },
        ].map(({ label, val, sub, color }) => (
          <Card key={label} style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, fontWeight: 500 }}>{label}</div>
            <div style={{
              fontFamily: "'Lora', serif", fontSize: 36,
              color, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 6,
            }}>{val}</div>
            <div style={{ fontSize: 12, color: C.faint }}>{sub}</div>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ─── STORY FLOW ─────────────────────────────── */
const StoryFlow = () => {
  const steps = [
    { num: "01", phase: "EDA", title: "idle이 핵심이다", desc: "30% 임계점 발견. 배터리 소모→충전 대기→idle 감소 연쇄 구조 확인.", badge: "발견", bc: C.accent },
    { num: "02", phase: "모델링", title: "EDA가 놓친 변수", desc: "pack_utilization 상관계수 0.105 → '관계 없음' 판단했는데 모델 중요도 1위(14.2%).", badge: "한계 발견", bc: C.amber },
    { num: "03", phase: "경보 규칙", title: "임계값 방식 실패", desc: "규칙·ML 모두 Precision ~0.12 상한. 단일 시점으론 위기 예측 불가 확인.", badge: "실패→전환", bc: C.red },
    { num: "04", phase: "군집화", title: "취약형 102개 발견", desc: "hub_spoke 창고 67%가 취약 군집 → 레이아웃이 원인인가? 가설 형성.", badge: "가설 형성", bc: C.accent },
    { num: "05", phase: "PSM", title: "결론이 뒤집혔다", desc: "운영 조건 통제 후 hub_spoke 효과 소멸(p=0.783). 레이아웃이 아닌 운영이 원인.", badge: "결론 수정", bc: C.green },
  ];

  return (
    <section id="story" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SecLabel>분석 스토리</SecLabel>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
          결론이 세 번 바뀐 과정
        </h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 40, lineHeight: 1.6, maxWidth: 560 }}>
          각 단계는 이전 결론을 의심하고 검증하는 방향으로 연결.
          분석이 깊어질수록 결론은 더 정확해짐.
        </p>

        <div style={{ position: "relative" }}>
          {/* 연결선 */}
          <div style={{
            position: "absolute", top: 20, left: "5%", right: "5%", height: 1,
            background: `linear-gradient(to right, ${C.border}, ${C.accentDim}, ${C.greenDim}, ${C.border})`,
            zIndex: 0,
          }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, position: "relative", zIndex: 1 }}>
            {steps.map((s, i) => (
              <Card key={i} style={{ padding: "20px 18px" }}>
                {/* 번호 */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: s.bc + "15", border: `1px solid ${s.bc}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 14,
                }}>
                  <Mono color={s.bc} size={12}>{s.num}</Mono>
                </div>
                <div style={{ fontSize: 11, color: C.faint, marginBottom: 4, fontWeight: 500 }}>{s.phase}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8, lineHeight: 1.4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginBottom: 12 }}>{s.desc}</div>
                <Tag color={s.bc}>{s.badge}</Tag>
              </Card>
            ))}
          </div>
        </div>

        {/* 결론 수정 3개 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 24 }}>
          {[
            { from: "처음엔 의심했다", fv: "hub_spoke 구조가 지연 원인 (+3.69분, p=0.007)", to: "PSM으로 확인했다", tv: "운영이 원인 — 레이아웃 효과 없음 (p=0.783)", color: C.accent },
            { from: "EDA로는 몰랐다", fv: "pack_utilization r=0.105 → '관계 없음'으로 오판", to: "모델이 발견했다", tv: "비선형 U자형 패턴 — 모델 중요도 1위 (14.2%)", color: C.amber },
            { from: "기대했던 것", fv: "임계값 조합으로 경보 규칙 만들 수 있을 것", to: "발견한 것", tv: "Precision ~0.12 구조적 상한 — 단일 시점의 한계", color: C.red },
          ].map(({ from, fv, to, tv, color }, i) => (
            <Card key={i} style={{ overflow: "hidden" }}>
              <div style={{ borderLeft: `3px solid ${color}`, padding: "16px 18px 16px 14px" }}>
                <div style={{ fontSize: 11, color: C.faint, marginBottom: 3, fontWeight: 500 }}>{from}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>{fv}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 16, height: 1, background: C.border }} />
                  <span style={{ fontSize: 11, color: color, fontWeight: 600 }}>→ 수정</span>
                </div>
                <div style={{ fontSize: 11, color: C.faint, marginBottom: 3, fontWeight: 500 }}>{to}</div>
                <div style={{ fontSize: 12, color: C.text, fontWeight: 500, lineHeight: 1.5 }}>{tv}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── FINDINGS ───────────────────────────────── */
const Findings = () => {
  const items = [
    { icon: "⚡", title: "idle 비율이 1차 방어선", val: "6.6×", sub: "최저 36.3분 vs 최고 5.5분. 30% 아래로 떨어지면 즉각 고착. 배터리 소모→충전 대기→idle 감소 연쇄.", color: C.accent },
    { icon: "🔍", title: "숨은 병목 — pack_utilization", val: "r=0.105 → 1위", sub: "EDA 상관계수로는 '관계 없음'. 비선형 U자형: 저가동=처리 부족, 고가동=후처리 병목. 반례 분석과 수렴.", color: C.amber },
    { icon: "🧪", title: "PSM 인과 검증", val: "p=0.783", sub: "hub_spoke +3.69분(p=0.007) → 운영 조건 통제 후 -0.55분(p=0.783). 레이아웃 효과 소멸. 운영 개선이 우선.", color: C.green },
    { icon: "⏱", title: "위기는 누적된다", val: "6스냅샷 전", sub: "경보 규칙 실패 원인. 위기 6스냅샷 전부터 이미 신호가 쌓임. 단일 시점 탐지보다 누적 감지가 필요.", color: C.purple },
    { icon: "🗺", title: "복합 병목 조합", val: "3.7배", sub: "모두 정상 10.2분 → 3개 동시 나쁨 38.1분. idle만 낮아도 23.5분. idle이 1차, pack이 2차 방어선.", color: C.red },
    { icon: "🎯", title: "운영 우선순위 6유형", val: "포장병목형★", sub: "3순위 포장병목형(27.0분)이 1순위 즉시개입형(24.6분)보다 지연 높음. 반례 분석 없인 발견 불가능.", color: C.accent },
  ];

  return (
    <section id="findings" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SecLabel>핵심 발견</SecLabel>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>6가지 핵심 발견</h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6 }}>각 발견은 독립 결과가 아니라 하나의 인과 구조로 연결.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {items.map(({ icon, title, val, sub, color }) => (
            <Card key={title} style={{ padding: "24px", borderTop: `3px solid ${color}`, borderRadius: "0 0 12px 12px" }}>
              <div style={{ fontSize: 22, marginBottom: 12 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>{title}</div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 24, color, lineHeight: 1.1, marginBottom: 10 }}>{val}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{sub}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── 시스템 구조도 ──────────────────────────── */
const SystemFlow = () => (
  <div style={{ background: C.surfaceAlt, borderRadius: 12, border: `1px solid ${C.border}`, padding: "28px 32px" }}>
    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>시스템 병목 인과 구조</div>
    <div style={{ fontSize: 12, color: C.muted, marginBottom: 24 }}>주문 증가에서 출고 지연까지 이어지는 전체 흐름</div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      {/* 트리거 */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 500, color: C.muted }}>
        주문 증가 <Mono color={C.faint} size={11}>(order_inflow 2.47×↑)</Mono>
      </div>
      <div style={{ display: "flex", gap: 80, alignItems: "flex-start", marginTop: 0 }}>
        {/* 경로 A */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, paddingTop: 0 }}>
          <div style={{ width: 1, height: 20, background: C.border }} />
          <div style={{ fontSize: 11, color: C.red, fontWeight: 600, marginBottom: 4 }}>경로 A</div>
          <div style={{ background: C.redBg, border: `1px solid ${C.redDim}`, borderRadius: 8, padding: "10px 18px", fontSize: 12, fontWeight: 500, color: C.red, textAlign: "center" }}>
            혼잡 증가<br /><Mono color={C.red} size={11}>blocked_path 15.8×↑</Mono>
          </div>
          <div style={{ width: 1, height: 12, background: C.redDim }} />
          <div style={{ background: C.redBg, border: `1px solid ${C.redDim}`, borderRadius: 8, padding: "10px 18px", fontSize: 12, color: C.red, textAlign: "center" }}>
            경로 차단·교착<br /><Mono color={C.red} size={11}>교착 39.3분 &gt; 고장 35.3분</Mono>
          </div>
          <div style={{ width: 1, height: 12, background: C.redDim }} />
        </div>
        {/* 경로 B */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          <div style={{ width: 1, height: 20, background: C.border }} />
          <div style={{ fontSize: 11, color: C.amber, fontWeight: 600, marginBottom: 4 }}>경로 B</div>
          <div style={{ background: C.amberBg, border: `1px solid ${C.amberDim}`, borderRadius: 8, padding: "10px 18px", fontSize: 12, fontWeight: 500, color: C.amber, textAlign: "center" }}>
            배터리 소모<br /><Mono color={C.amber} size={11}>저배터리 58×↑</Mono>
          </div>
          <div style={{ width: 1, height: 12, background: C.amberDim }} />
          <div style={{ background: C.amberBg, border: `1px solid ${C.amberDim}`, borderRadius: 8, padding: "10px 18px", fontSize: 12, color: C.amber, textAlign: "center" }}>
            충전 대기 급증<br /><Mono color={C.amber} size={11}>charging_ratio 31×↑</Mono>
          </div>
          <div style={{ width: 1, height: 12, background: C.amberDim }} />
        </div>
      </div>
      {/* 수렴 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}>
        <div style={{ width: 80, height: 1, background: C.border }} />
        <div style={{ fontSize: 11, color: C.faint }}>두 경로 수렴</div>
        <div style={{ width: 80, height: 1, background: C.border }} />
      </div>
      <div style={{ width: 1, height: 12, background: C.border }} />
      {/* idle 감소 */}
      <div style={{
        background: C.accentBg, border: `2px solid ${C.accent}`, borderRadius: 10,
        padding: "12px 32px", textAlign: "center",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>⚠ idle 비율 급감</div>
        <div style={{ fontSize: 12, color: C.accent }}><Mono color={C.accent} size={11}>최저 36.3분 vs 최고 5.5분 (6.6배)</Mono></div>
      </div>
      <div style={{ width: 1, height: 12, background: C.border }} />
      {/* pack 병목 */}
      <div style={{
        background: C.purpleBg, border: `1px solid ${C.purpleDim}`, borderRadius: 10,
        padding: "12px 32px", textAlign: "center",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.purple }}>pack 과포화 → 후처리 병목</div>
        <div style={{ fontSize: 12, color: C.purple }}><Mono color={C.purple} size={11}>선형 상관 0.105 → 모델 1위 (14.2%) — 숨은 병목</Mono></div>
      </div>
      <div style={{ width: 1, height: 12, background: C.border }} />
      {/* 최종 */}
      <div style={{
        background: C.redBg, border: `2px solid ${C.red}`, borderRadius: 10,
        padding: "12px 32px", textAlign: "center",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>출고 지연 폭발</div>
        <div style={{ fontSize: 12, color: C.red }}><Mono color={C.red} size={11}>3개 동시 나쁨: 38.1분 (정상 10.2분의 3.7배)</Mono></div>
      </div>
    </div>
  </div>
);

/* ─── VIZ SECTION ────────────────────────────── */
const VizSection = () => {
  const [tab, setTab] = useState(0);
  const tabs = ["시스템 구조도", "idle 비율", "U자형 발견", "복합 병목", "PSM 전후", "위기 시계열"];

  const charts = [
    <SystemFlow key="sys" />,

    // idle
    <div key="idle">
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ background: C.accentBg, borderRadius: 8, padding: "10px 16px", flex: 1 }}>
          <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginBottom: 2 }}>핵심 발견</div>
          <div style={{ fontSize: 13, color: C.text }}>최저 <strong>36.3분</strong> vs 최고 <strong style={{ color: C.green }}>5.5분</strong> — 6.6배 차이. 30%가 임계점.</div>
        </div>
        <div style={{ background: C.redBg, borderRadius: 8, padding: "10px 16px", flex: 1 }}>
          <div style={{ fontSize: 11, color: C.red, fontWeight: 600, marginBottom: 2 }}>실행 연결</div>
          <div style={{ fontSize: 13, color: C.text }}>idle &lt; 30% → 즉각 경보 + 충전 스케줄 조정</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={DATA.idle} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 6" stroke={C.border} vertical={false} />
          <XAxis dataKey="group" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
          <ReferenceLine y={19} stroke={C.faint} strokeDasharray="4 4" label={{ value: "전체 평균", fill: C.faint, fontSize: 11, position: "right" }} />
          <Tooltip content={<ChartTip />} />
          <Bar dataKey="delay" radius={[5, 5, 0, 0]} name="평균 지연">
            {DATA.idle.map((_, i) => (
              <Cell key={i} fill={i === 0 ? C.red : i === 4 ? C.green : C.accent + (["CC", "99", "66", "44"][i - 1] || "44")} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>,

    // pack U자형
    <div key="pack">
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ background: C.amberBg, borderRadius: 8, padding: "10px 16px" }}>
          <div style={{ fontSize: 11, color: C.amber, fontWeight: 600, marginBottom: 2 }}>EDA 오판</div>
          <div style={{ fontSize: 13, color: C.text }}>상관계수 <Mono color={C.amber}>r=0.105</Mono> → "관계 없음"</div>
        </div>
        <div style={{ background: C.accentBg, borderRadius: 8, padding: "10px 16px" }}>
          <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginBottom: 2 }}>모델 발견</div>
          <div style={{ fontSize: 13, color: C.text }}>중요도 <Mono color={C.accent}>1위 (14.2%)</Mono> — 비선형 U자형</div>
        </div>
        <div style={{ background: C.greenBg, borderRadius: 8, padding: "10px 16px" }}>
          <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginBottom: 2 }}>최적 구간</div>
          <div style={{ fontSize: 13, color: C.text }}>60~80% 유지 → <strong>12.0분</strong></div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={DATA.pack} margin={{ top: 4, right: 20, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 6" stroke={C.border} vertical={false} />
          <XAxis dataKey="range" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} domain={[8, 35]} />
          <ReferenceLine y={19} stroke={C.faint} strokeDasharray="4 4" />
          <Tooltip content={<ChartTip />} />
          <Line type="monotone" dataKey="delay" stroke={C.accent} strokeWidth={2.5} name="평균 지연"
            dot={(props) => {
              const isLast = props.index === DATA.pack.length - 1;
              const isMin = props.index === 5;
              return <circle key={props.index} cx={props.cx} cy={props.cy}
                r={isLast || isMin ? 6 : 3}
                fill={isLast ? C.red : isMin ? C.green : C.accent}
                stroke={C.surface} strokeWidth={2} />;
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>,

    // 복합 병목
    <div key="combo">
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ background: C.accentBg, borderRadius: 8, padding: "10px 16px", flex: 1 }}>
          <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginBottom: 2 }}>핵심 발견</div>
          <div style={{ fontSize: 13, color: C.text }}>3개 동시: <strong style={{ color: C.red }}>38.1분</strong> (정상 10.2분의 3.7배). idle만 낮아도 23.5분.</div>
        </div>
        <div style={{ background: C.greenBg, borderRadius: 8, padding: "10px 16px", flex: 1 }}>
          <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginBottom: 2 }}>전략적 시사점</div>
          <div style={{ fontSize: 13, color: C.text }}>idle 수호가 1차 방어선. idle 정상이면 다른 조건이 나빠도 20분 이하.</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={DATA.combo} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 6" stroke={C.border} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTip />} />
          <Bar dataKey="delay" radius={[5, 5, 0, 0]} name="평균 지연">
            {DATA.combo.map((_, i) => (
              <Cell key={i} fill={[C.green, C.amber, C.red + "CC", C.red][i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>,

    // PSM
    <div key="psm">
      <div style={{ background: C.accentBg, borderRadius: 8, padding: "12px 16px", marginBottom: 16, border: `1px solid ${C.accentDim}` }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.accent, marginBottom: 4 }}>PSM 분석 결론</div>
        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>
          매칭 전: hub_spoke <Mono color={C.red}>+3.69분 (p=0.007)</Mono> → 통계적 유의미 →
          PSM 매칭 후: <Mono color={C.green}>-0.55분 (p=0.783)</Mono> → 효과 소멸.
          <strong> hub_spoke 레이아웃 자체가 문제가 아니라 운영이 나쁜 창고들이 몰려 있었던 것.</strong>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {["before", "after"].map((key, ki) => (
          <div key={key}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, textAlign: "center", fontWeight: 500 }}>
              {ki === 0 ? "매칭 전 — 단순 비교" : "PSM 매칭 후 — 운영 조건 통제"}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={DATA.psm} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 6" stroke={C.border} vertical={false} />
                <XAxis dataKey="group" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} domain={[15, 25]} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey={key} radius={[5, 5, 0, 0]} name="평균 지연"
                  fill={ki === 0 ? C.red + "88" : C.accent + "88"} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ textAlign: "center", fontSize: 13, fontWeight: 600, marginTop: 6, color: ki === 0 ? C.red : C.green }}>
              {ki === 0 ? "+3.69분  p=0.007 **" : "-0.55분  p=0.783 (n.s.)"}
            </div>
          </div>
        ))}
      </div>
    </div>,

    // 위기 시계열
    <div key="timeline">
      <div style={{ background: C.accentBg, borderRadius: 8, padding: "12px 16px", marginBottom: 16, border: `1px solid ${C.accentDim}` }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.accent, marginBottom: 4 }}>경보 규칙이 실패한 이유</div>
        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>
          위기는 갑자기 터지는 사건이 아님.
          <strong> 6스냅샷 전부터 이미 idle이 낮고 혼잡이 높은 상태 지속.</strong>
          단일 시점 탐지로는 누락 — 연속 상태 누적 감지 필요.
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={DATA.timeline} margin={{ top: 4, right: 20, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 6" stroke={C.border} vertical={false} />
          <XAxis dataKey="snap" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTip unit="" />} />
          <Line type="monotone" dataKey="idle" stroke={C.accent} strokeWidth={2} name="idle_ratio" dot={{ r: 3, fill: C.accent }} />
          <Line type="monotone" dataKey="battery" stroke={C.amber} strokeWidth={2} name="저배터리" dot={{ r: 3, fill: C.amber }} strokeDasharray="5 3" />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
        {[
          { color: C.accent, label: "idle_ratio (정상 0.526 → 위기 0.214)" },
          { color: C.amber, label: "저배터리 비율 (정상 0.128 → 위기 0.280)" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }}>
            <div style={{ width: 20, height: 2, background: color, borderRadius: 1 }} />
            {label}
          </div>
        ))}
      </div>
    </div>,
  ];

  return (
    <section id="viz" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SecLabel>주요 시각화</SecLabel>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
          데이터로 보는 발견들
        </h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 1.6 }}>
          각 차트는 독립적인 결과가 아니라 하나의 분석 흐름으로 이어짐.
        </p>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 24, overflowX: "auto" }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              padding: "10px 16px", fontSize: 13, cursor: "pointer", fontWeight: tab === i ? 600 : 400,
              background: "transparent", border: "none", whiteSpace: "nowrap",
              color: tab === i ? C.accent : C.muted,
              borderBottom: tab === i ? `2px solid ${C.accent}` : "2px solid transparent",
              transition: "all 0.15s", fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>{t}</button>
          ))}
        </div>

        <Card style={{ padding: "28px 32px", minHeight: 380 }}>
          {charts[tab]}
        </Card>
      </div>
    </section>
  );
};

/* ─── METHOD SECTION ─────────────────────────── */
const MethodSection = () => {
  const [open, setOpen] = useState(null);
  const methods = [
    { q: "왜 GroupKFold를 선택했는가?", bad: "일반 KFold → 같은 창고 스냅샷이 학습·검증에 동시 포함 → 데이터 누출 → 성능 과대평가", good: "창고 단위로 완전 분리 → 학습에 없던 창고로만 검증 → 실제 배포 환경 시뮬레이션 → 신뢰할 수 있는 OOF 성능" },
    { q: "왜 상관계수 대신 모델 중요도를 봤는가?", bad: "상관계수만 → pack_utilization r=0.105 '관계 없음' → 핵심 변수 누락 → 잘못된 분석 방향", good: "비선형 U자형 패턴 포착 가능 → 모델 1위 재발견 → 반례 분석과 수렴 → 신뢰도 상승" },
    { q: "왜 PSM이 필요했는가?", bad: "단순 비교 → hub_spoke +3.69분 유의미 → 레이아웃 개선 추진 → 고비용·잘못된 방향", good: "운영 조건 통제 후 비교 → 효과 소멸(p=0.783) → 레이아웃 X, 운영 개선 O → 비용 절감" },
    { q: "왜 반례 분석을 별도로 진행했는가?", bad: "전체 경향만 → 'idle 높으면 안전' 단순 결론 → idle 정상인데 지연 큰 창고 20개 미발견", good: "공통 원인: pack 과포화 → U자형 분석과 수렴 → 두 독립 분석이 같은 결론 → 신뢰도 상승" },
    { q: "왜 단일 임계값 경보가 실패했는가?", bad: "idle ≤ 0.30 조합 → 최고 Precision 0.12 → 그리드 서치·ML 모두 동일 상한", good: "단일 변수 상위 10% 구간도 위기율 11% 상한 → 위기는 복합 누적 현상 → 연속 상태 감지 필요" },
  ];

  return (
    <section id="method" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SecLabel>방법론 선택 이유</SecLabel>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
          왜 이 방법을 선택했는가
        </h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6, maxWidth: 560 }}>
          각 방법은 기법을 써보려고 선택한 것이 아님.
          그 방법이 아니었다면 잘못된 결론에 도달했을 가능성.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {methods.map(({ q, bad, good }, i) => (
            <Card key={i} style={{ overflow: "hidden" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{
                width: "100%", padding: "18px 24px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{q}</span>
                <span style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: open === i ? C.accentBg : C.bg,
                  color: open === i ? C.accent : C.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0, transition: "all 0.2s",
                  border: `1px solid ${open === i ? C.accentDim : C.border}`,
                }}>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div style={{ padding: "0 24px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: C.redBg, borderRadius: 8, padding: "14px 16px", border: `1px solid ${C.redDim}` }}>
                    <div style={{ fontSize: 11, color: C.red, fontWeight: 600, marginBottom: 8 }}>✗ 다른 방법 썼다면</div>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{bad}</div>
                  </div>
                  <div style={{ background: C.greenBg, borderRadius: 8, padding: "14px 16px", border: `1px solid ${C.greenDim}` }}>
                    <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginBottom: 8 }}>✓ 이 방법을 선택한 이유</div>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{good}</div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── PARADOX SECTION ────────────────────────── */
const ParadoxSection = () => (
  <section style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <SecLabel>반례 분석</SecLabel>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
        왜 일부 창고는 일반 패턴을 따르지 않았는가
      </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 1.6, maxWidth: 560 }}>
        좋은 분석은 안 맞는 사례를 봄. 예외가 시스템 구조를 더 깊이 이해하게 해줌.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {[
          {
            title: "반례 유형 1 — idle 높아도 지연이 큰 창고 (20개)",
            q: "idle이 충분한데 왜 지연이 큰가?",
            rows: [["pack_utilization", "0.436 (일반)", "0.732 (반례)", "1.68×"], ["혼잡도", "13.30", "6.79", "0.51× (오히려 낮음)"], ["저배터리", "0.213", "0.085", "0.40× (오히려 낮음)"]],
            conclusion: "idle은 필요조건, pack 최적화는 충분조건 — idle이 여유 있어도 포장 라인이 막히면 소용없음",
            color: C.red,
          },
          {
            title: "반례 유형 2 — 혼잡 낮아도 위기가 많은 창고 (29개)",
            q: "혼잡도가 낮은데 왜 위기가 자주 발생하는가?",
            rows: [["pack_utilization", "0.388 (일반)", "0.673 (반례)", "1.73×"], ["혼잡도", "4.896", "4.815", "0.98× (거의 동일)"], ["저배터리", "0.087", "0.090", "1.04× (거의 동일)"]],
            conclusion: "단일 병목(pack)이 전체 시스템을 무력화 — 혼잡·배터리 정상이어도 pack이 막히면 위기",
            color: C.amber,
          },
        ].map(({ title, q, rows, conclusion, color }) => (
          <Card key={title} style={{ padding: "24px", borderTop: `3px solid ${color}`, borderRadius: "0 0 12px 12px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 14 }}>Q. {q}</div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16, fontSize: 12 }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {["변수", "일반 창고", "반례 창고", "배율"].map(h => (
                    <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: C.muted, fontWeight: 500, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: "6px 8px", borderBottom: `1px solid ${C.border}`, color: ci === 3 ? color : C.text, fontWeight: ci === 3 ? 600 : 400 }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ background: color + "10", borderRadius: 8, padding: "10px 14px", border: `1px solid ${color}30` }}>
              <div style={{ fontSize: 11, color, fontWeight: 600, marginBottom: 4 }}>결론</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{conclusion}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: "20px 24px", background: C.accentBg, border: `1px solid ${C.accentDim}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 6 }}>
          두 반례의 공통 원인 — pack_utilization 과포화
        </div>
        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>
          U자형 분석(모델 발견)과 반례 분석(예외 탐색)이 독립적인 방법으로 같은 결론에 도달.
          서로 다른 접근이 같은 답을 가리킬 때 분석 신뢰도 상승.
        </div>
      </Card>
    </div>
  </section>
);

/* ─── PRIORITY SECTION ───────────────────────── */
const PrioritySection = () => {
  const types = [
    { rank: "1순위", type: "즉시개입형",      n: 49,  delay: 24.6, feature: "고혼잡 + 저idle",            action: "경로 재배정 즉시 / 충전 스케줄 긴급 조정",  target: "idle 30% 회복",       color: C.red },
    { rank: "2순위", type: "배터리위기형",     n: 23,  delay: 23.3, feature: "저idle + 배터리 나쁨",       action: "사전 충전 스케줄 / 배터리 교체 점검",       target: "저배터리 10% 이하",   color: C.red },
    { rank: "3순위★", type: "포장병목형",     n: 40,  delay: 27.0, feature: "pack 고가동 (숨은 병목)",    action: "포장 부하 분산 / pack 60~80% 조정",         target: "U자형 최적 구간",     color: C.amber },
    { rank: "4순위", type: "혼잡관리형",       n: 29,  delay: 15.4, feature: "idle 정상 + 고혼잡",         action: "피크타임 경로 사전 분산 / 모니터링",        target: "혼잡도 임계 이하",    color: C.amber },
    { rank: "5순위", type: "배터리최적화형",   n: 6,   delay: 17.0, feature: "idle 정상 + 배터리 나쁨",    action: "정기 충전 스케줄 최적화",                   target: "low_bat 10% 관리",   color: C.accent },
    { rank: "6순위", type: "모니터링형",       n: 103, delay: 13.5, feature: "전반적 정상",                action: "정기 모니터링 / 이상 징후 조기 감지",       target: "현재 상태 유지",      color: C.green },
  ];

  return (
    <section id="priority" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SecLabel>운영 전략</SecLabel>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
          운영 우선순위 매트릭스
        </h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 8, lineHeight: 1.6, maxWidth: 560 }}>
          250개 창고를 6개 운영 유형으로 분류하고 맞춤 개입 전략 제시.
        </p>
        <div style={{ background: C.amberBg, border: `1px solid ${C.amberDim}`, borderRadius: 8, padding: "10px 16px", marginBottom: 28, display: "inline-block" }}>
          <span style={{ fontSize: 13, color: C.amber, fontWeight: 600 }}>★ </span>
          <span style={{ fontSize: 13, color: C.text }}>포장병목형(3순위) 평균 지연 27.0분 &gt; 즉시개입형(1순위) 24.6분 — 반례 분석 없이는 발견 불가</span>
        </div>

        {/* 헤더 */}
        <div style={{
          display: "grid", gridTemplateColumns: "100px 130px 70px 80px 1fr 1fr 100px",
          gap: 12, padding: "8px 20px",
          fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}>
          {["우선순위", "유형", "창고 수", "평균 지연", "특징", "즉각 조치", "목표"].map(h => <div key={h}>{h}</div>)}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {types.map(({ rank, type, n, delay, feature, action, target, color }) => {
            const [hov, setHov] = useState(false);
            return (
              <div key={rank}
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                style={{
                  display: "grid", gridTemplateColumns: "100px 130px 70px 80px 1fr 1fr 100px",
                  gap: 12, padding: "14px 20px",
                  background: hov ? C.bg : C.surface,
                  border: `1px solid ${C.border}`,
                  alignItems: "center",
                  borderLeft: `3px solid ${color}`,
                  borderRadius: "0 8px 8px 0",
                  transition: "all 0.15s",
                }}>
                <Tag color={color}>{rank}</Tag>
                <div style={{ fontSize: 13, fontWeight: 600, color: rank.includes("★") ? C.amber : C.text }}>{type}</div>
                <Mono size={13}>{n}개</Mono>
                <div style={{ fontSize: 13, fontWeight: 600, color: delay > 25 ? C.red : delay > 20 ? C.amber : C.green }}>
                  {delay}분
                </div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{feature}</div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4 }}>{action}</div>
                <Tag color={color} bg={color + "10"}>{target}</Tag>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ─── COMPETITION SECTION ────────────────────── */
const CompetitionSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["모델 구성", "피처 엔지니어링", "앙상블 전략", "결과"];

  const modelRows = [
    { name: "lgbm_l1_raw_deeper", family: "LightGBM", obj: "MAE", iter: "2,400", leaves: "112", seeds: 3, weight: "20%", transform: "none" },
    { name: "lgbm_huber_log_deeper", family: "LightGBM", obj: "Huber", iter: "2,400", leaves: "128", seeds: 1, weight: "8%", transform: "log1p" },
    { name: "catboost_mae_log_depth7", family: "CatBoost", obj: "MAE", iter: "3,000", leaves: "depth=7", seeds: 2, weight: "46%", transform: "log1p" },
    { name: "catboost_mae_log_depth6", family: "CatBoost", obj: "MAE", iter: "3,000", leaves: "depth=6", seeds: 1, weight: "16%", transform: "log1p" },
    { name: "catboost_rmse_log_depth7", family: "CatBoost", obj: "RMSE", iter: "3,000", leaves: "depth=7", seeds: 1, weight: "10%", transform: "log1p" },
  ];

  const featureGroups = [
    {
      icon: "⏱",
      title: "시계열 피처",
      color: C.accent,
      count: "22개 변수 × 8종",
      desc: "lag1~3, diff1, rollmean3/6/8, rollmax, rollstd, EWM(α=0.4). 시나리오 내 누적 패턴을 포착.",
      detail: "congestion_score, fault_count 등 9개 핵심 변수는 8스냅샷 롤링 통계 추가 계산"
    },
    {
      icon: "📐",
      title: "물리적 병목 피처",
      color: C.red,
      count: "30개+ 조합 변수",
      desc: "inflow÷robot, queue÷charger, pack_util², order×avg_trip_distance 등. 실제 운영 부하를 수치화.",
      detail: "EDA 분석의 병목 인과구조를 수학적으로 표현 — 분석 인사이트가 모델로 연결됨"
    },
    {
      icon: "🔄",
      title: "안전 누적 통계",
      color: C.amber,
      count: "7개 변수 × 7종",
      desc: "시나리오 내 prev 기반 cummax, cummean, cumstd. 현재 값 ÷ 누적 최대 비율로 상대적 심각도 측정.",
      detail: "리크 없는 순수 과거 기반 — 현재 시점에서 '얼마나 나빠졌는가'를 정량화"
    },
    {
      icon: "🏗",
      title: "레이아웃 인코딩",
      color: C.green,
      count: "타겟 인코딩 + 원핫",
      desc: "layout_id: smoothed target encoding (smoothing=10). layout_type: 4개 원핫. 교차검증 내 fold별 피팅으로 리크 방지.",
      detail: "PSM 분석 결과(레이아웃보다 운영) 반영 — 레이아웃을 배경 변수로만 활용"
    },
    {
      icon: "🚨",
      title: "병목 개시 이벤트",
      color: C.purple,
      count: "charging, queue 각 5종",
      desc: "최초 발생 시점, 발생 여부, 현재 - 발생 시점 경과, 조기 발생 여부 등. 위기 누적 패턴 캡처.",
      detail: "경보 규칙 실패 분석에서 발견한 '누적 신호'를 피처로 직접 모델링"
    },
    {
      icon: "📊",
      title: "교차 병목 피처",
      color: C.text,
      count: "6개 조합 상호작용",
      desc: "congestion8×fault8, queue8×wait8, inflow8÷active8 등. 복합 병목의 롤링 평균 상호작용.",
      detail: "단일 변수로 놓치는 복합 병목(idle×pack×battery 38.1분) 현상을 피처로 구현"
    },
  ];

  const ensembleData = [
    { name: "CatBoost\nMAE depth7", weight: 46, color: C.accent },
    { name: "CatBoost\nMAE depth6", weight: 16, color: C.accent + "AA" },
    { name: "LightGBM\nMAE", weight: 20, color: C.amber },
    { name: "CatBoost\nRMSE", weight: 10, color: C.green },
    { name: "LightGBM\nHuber", weight: 8, color: C.muted },
  ];

  const designDecisions = [
    { q: "왜 CatBoost에 72% 가중치를 줬는가?", a: "5-Fold GroupKFold OOF 검증에서 CatBoost가 일관되게 LightGBM보다 낮은 MAE를 기록. 특히 log1p 변환 + MAE loss 조합이 지연 시간의 우편향(skewed) 분포에 적합했기 때문." },
    { q: "왜 log1p 타겟 변환을 썼는가?", a: "avg_delay_minutes는 0~수백 분 우편향 분포. log1p 변환으로 극단값 영향을 줄이고 Huber/MAE 계열 손실함수와 결합 시 잔차 분포가 안정화됨. 예측 후 expm1 역변환." },
    { q: "왜 GroupKFold를 유지했는가?", a: "시나리오 단위 완전 분리. 같은 시나리오의 다른 스냅샷이 학습/검증에 동시 포함되면 시계열 리크 발생. 실제 unseen 시나리오 예측력을 OOF에서 신뢰도 있게 측정." },
    { q: "expanding 통계를 왜 제거했는가?", a: "v6에서 expanding 통계 추가 시 OOF MAE 일시 개선 → 실제 리더보드에서 오히려 하락. 타겟과의 미묘한 리크 가능성 확인 후 전량 제거. 안전한 prev 기반 누적 통계만 유지." },
  ];

  return (
    <section id="competition" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SecLabel>경진대회 모델링</SecLabel>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
          분석 → 예측 모델 — 상위 15%
        </h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.6, maxWidth: 620 }}>
          EDA 인사이트를 바탕으로 피처를 설계하고, CatBoost·LightGBM 앙상블로
          출고 지연 시간(avg_delay_minutes_next_30m)을 예측해 상위 15% 달성.
        </p>

        {/* 성과 배너 */}
        <div style={{
          background: `linear-gradient(135deg, ${C.accent}08, ${C.green}08)`,
          border: `1px solid ${C.accentDim}`,
          borderRadius: 12, padding: "20px 28px", marginBottom: 36,
          display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap",
        }}>
          {[
            { label: "최종 성적", val: "상위 15%", color: C.green },
            { label: "평가 지표", val: "MAE", color: C.accent },
            { label: "검증 방식", val: "5-Fold GroupKFold", color: C.text },
            { label: "총 모델 수", val: "8개 (5종 × 멀티시드)", color: C.text },
            { label: "피처 수", val: "600개+", color: C.text },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 11, color: C.faint, fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color, fontFamily: color === C.green ? "'Lora', serif" : undefined }}>{val}</div>
            </div>
          ))}
        </div>

        {/* 분석 → 모델 연결 설명 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>분석 인사이트가 모델 설계에 어떻게 연결됐는가</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              { from: "위기는 단일 시점이 아닌 누적", arrow: "→", to: "lag/rolling 피처, 누적 통계, onset 이벤트 피처", color: C.accent },
              { from: "pack_utilization 비선형 U자형", arrow: "→", to: "pack_util² 비선형 항 + 조합 상호작용 피처 명시적 추가", color: C.amber },
              { from: "레이아웃보다 운영이 원인 (PSM)", arrow: "→", to: "layout_id는 target encoding 배경변수로만, 운영 변수 중심 설계", color: C.green },
            ].map(({ from, arrow, to, color }) => (
              <div key={from} style={{ background: C.surface, borderRadius: 8, padding: "14px 16px", border: `1px solid ${C.border}`, borderTop: `3px solid ${color}` }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, lineHeight: 1.4 }}>{from}</div>
                <div style={{ fontSize: 13, color, fontWeight: 600, marginBottom: 6 }}>{arrow}</div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.45 }}>{to}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 24 }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)} style={{
              padding: "10px 18px", fontSize: 13, cursor: "pointer", fontWeight: activeTab === i ? 600 : 400,
              background: "transparent", border: "none", whiteSpace: "nowrap",
              color: activeTab === i ? C.accent : C.muted,
              borderBottom: activeTab === i ? `2px solid ${C.accent}` : "2px solid transparent",
              transition: "all 0.15s", fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>{t}</button>
          ))}
        </div>

        <Card style={{ padding: "28px 32px" }}>
          {/* 탭 0: 모델 구성 */}
          {activeTab === 0 && (
            <div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
                LightGBM(MAE/Huber)과 CatBoost(MAE/RMSE) 이종 앙상블. 손실함수·깊이·시드가 모두 다른 5종 8개 모델 가중 평균.
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {["모델명", "계열", "Loss", "트리 수", "깊이/리프", "시드수", "앙상블 가중치", "타겟 변환"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modelRows.map((r, i) => (
                      <tr key={r.name} style={{ background: i % 2 === 0 ? C.surface : C.surfaceAlt }}>
                        <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
                          <Mono size={11} color={C.text}>{r.name}</Mono>
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
                          <Tag color={r.family === "CatBoost" ? C.accent : C.amber}>{r.family}</Tag>
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, color: C.text, fontWeight: 500 }}>{r.obj}</td>
                        <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
                          <Mono size={11}>{r.iter}</Mono>
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
                          <Mono size={11}>{r.leaves}</Mono>
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, textAlign: "center", color: C.muted }}>{r.seeds}</td>
                        <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 60, height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ width: r.weight, height: "100%", background: r.family === "CatBoost" ? C.accent : C.amber, borderRadius: 3, transition: "width 0.3s" }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{r.weight}</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
                          <Tag color={r.transform === "log1p" ? C.green : C.muted}>{r.transform}</Tag>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 16, padding: "12px 16px", background: C.accentBg, borderRadius: 8, border: `1px solid ${C.accentDim}` }}>
                <span style={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>멀티시드 전략: </span>
                <span style={{ fontSize: 12, color: C.text }}>동일 하이퍼파라미터에 다른 시드 3개를 돌려 분산을 줄임. lgbm_l1_raw_deeper는 seed 42·123·777 앙상블 → 단일 시드 대비 OOF MAE 안정화.</span>
              </div>
            </div>
          )}

          {/* 탭 1: 피처 엔지니어링 */}
          {activeTab === 1 && (
            <div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
                600개+ 피처는 6개 그룹으로 설계. 각 그룹은 EDA 인사이트를 직접 모델 입력으로 변환한 결과.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {featureGroups.map(({ icon, title, color, count, desc, detail }) => (
                  <div key={title} style={{ background: C.bg, borderRadius: 10, padding: "16px 18px", border: `1px solid ${C.border}`, borderLeft: `3px solid ${color}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 18 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</div>
                        <Tag color={color}>{count}</Tag>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 8 }}>{desc}</div>
                    <div style={{ fontSize: 11, color, lineHeight: 1.4, fontStyle: "italic" }}>→ {detail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 탭 2: 앙상블 전략 */}
          {activeTab === 2 && (
            <div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
                OOF MAE 기반으로 가중치 결정. 단순 평균이 아닌 검증 성능 비례 가중 평균.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {/* 가중치 시각화 */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>모델별 앙상블 가중치</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {ensembleData.map(({ name, weight, color }) => (
                      <div key={name}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: C.text }}>{name.replace("\n", " ")}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color }}>{weight}%</span>
                        </div>
                        <div style={{ height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${weight * 2}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 설계 근거 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {designDecisions.map(({ q, a }) => (
                    <div key={q} style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 5 }}>Q. {q}</div>
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 탭 3: 결과 */}
          {activeTab === 3 && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* 버전 히스토리 */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>버전별 개선 히스토리</div>
                  {[
                    { ver: "v1", desc: "기본 lag/rolling 피처 + LightGBM MAE", result: "베이스라인", color: C.faint },
                    { ver: "v4", desc: "물리적 병목 비율 피처 추가 (인사이트 반영)", result: "MAE 개선", color: C.muted },
                    { ver: "v5", desc: "CatBoost 추가 + log1p 타겟 변환", result: "리더보드 상승", color: C.amber },
                    { ver: "v6", desc: "onset 이벤트 + 안전 누적 통계 + target encoding", result: "안정화", color: C.accent },
                    { ver: "v7", desc: "이종 앙상블 + 멀티시드 + expanding 제거", result: "상위 15% 달성", color: C.green },
                  ].map(({ ver, desc, result, color }) => (
                    <div key={ver} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: color + "20", border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Mono color={color} size={10}>{ver}</Mono>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: C.text, marginBottom: 2 }}>{desc}</div>
                        <Tag color={color}>{result}</Tag>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 핵심 교훈 */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>모델링에서 배운 것</div>
                  {[
                    { icon: "💡", title: "분석 인사이트가 피처의 품질을 결정한다", desc: "pack_utilization²(비선형), onset 이벤트(누적), charge_pressure(복합 비율) — 모두 EDA에서 발견한 구조를 수식으로 변환한 결과. 도메인 없이는 만들 수 없는 피처.", color: C.accent },
                    { icon: "⚠️", title: "리더보드 성능과 OOF 성능은 다를 수 있다", desc: "v6에서 expanding 통계가 OOF MAE를 개선했지만 리더보드에서는 오히려 하락. 미묘한 리크 의심 → 제거 후 안정화. OOF 개선 = 실제 개선이 아닐 수 있음.", color: C.red },
                    { icon: "🎯", title: "CatBoost가 log1p + MAE 조합에서 강했다", desc: "우편향 분포(지연 시간)에서 log1p 변환 후 MAE 최소화는 실제 오차 패턴과 잘 맞음. LightGBM Huber를 8%만 넣은 것도 다양성을 위한 최소 포함.", color: C.green },
                  ].map(({ icon, title, desc, color }) => (
                    <Card key={title} style={{ padding: "16px 18px", marginBottom: 10, borderLeft: `3px solid ${color}` }}>
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>{title}</div>
                          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>{desc}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};


const LimitsSection = () => (
  <section id="limits" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <SecLabel>한계 및 향후 방향</SecLabel>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
        솔직한 한계 진단
      </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 1.6 }}>
        좋은 분석은 성공만 보여주지 않음. 한계를 명시할수록 신뢰도 상승.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          { title: "경보 규칙 Precision ~0.12 상한", desc: "단일 시점 변수만으로는 위기 예측이 구조적으로 어려움. 단일 변수 상위 10% 구간도 위기율 11% 수준이 이론적 상한.", next: "LSTM/GRU로 스냅샷 시퀀스 학습 → 위기 누적 패턴 포착", color: C.red },
          { title: "PSM 소표본 (30쌍)", desc: "매칭 쌍이 30개로 소표본이고 충전 중 비율·고장 횟수의 표준화 평균 차이(SMD)가 0.25 초과. hub_spoke 효과 없음은 잠정적 결론.", next: "더 많은 창고 데이터 확보 후 재검증 필요", color: C.amber },
          { title: "모델 수요폭증형 과소예측", desc: "300분+ 구간에서 평균 잔차 +328분. 설비 용량 자체가 수요를 따라가지 못하는 케이스는 운영 변수로 설명 불가.", next: "수요폭증형 별도 모델 + 앙상블 구성", color: C.amber },
          { title: "ROI 가정 기반 추정", desc: "연간 절감 추정치(~1,855억원)는 출고 100건/시나리오, 1분=500원 등 가정에 매우 민감. 절대 금액보다 상대 우선순위가 핵심.", next: "파일럿 창고 적용 후 실제 데이터로 검증 필요", color: C.muted },
        ].map(({ title, desc, next, color }) => (
          <Card key={title} style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 5 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</div>
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 12, paddingLeft: 18 }}>{desc}</div>
            <div style={{ paddingLeft: 18, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 11, color: C.green, fontWeight: 600, flexShrink: 0, marginTop: 1 }}>→ 향후</span>
              <span style={{ fontSize: 12, color: C.green, lineHeight: 1.5 }}>{next}</span>
            </div>
          </Card>
        ))}
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
        <div style={{ fontSize: 13, color: C.muted }}>스마트 창고 출고 지연 예측</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <a href="./portfolio_case_instacart.html" style={{
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
        <StoryFlow />
        <Findings />
        <VizSection />
        <MethodSection />
        <ParadoxSection />
        <PrioritySection />
        <CompetitionSection />
        <LimitsSection />
      </main>
      <Footer />
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
