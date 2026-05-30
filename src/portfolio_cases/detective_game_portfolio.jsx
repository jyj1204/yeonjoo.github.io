import { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

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
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    .blink { animation: blink 1.1s step-end infinite; }
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
          개발 포트폴리오
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { label: "개요", href: "#overview" },
            { label: "AI 설계", href: "#ai" },
            { label: "시나리오", href: "#scenario" },
            { label: "기술 구현", href: "#tech" },
            { label: "Vibe Coding", href: "#vibe" },
            { label: "한계와 성과", href: "#limits" },
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
  { label: "AI 설계", href: "#ai" },
  { label: "시나리오", href: "#scenario" },
  { label: "기술 구현", href: "#tech" },
  { label: "Vibe Coding", href: "#vibe" },
  { label: "한계와 성과", href: "#limits" },
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
const Hero = () => {
  const [typed, setTyped] = useState("");
  const full = "interrogate_suspect --ai-powered --lie-detection";
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => { setTyped(full.slice(0, i + 1)); i++; if (i >= full.length) clearInterval(t); }, 55);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{ padding: "64px 40px 48px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="fu fu1" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {["웹 게임 개발", "GPT API", "프롬프트 엔지니어링", "Vibe Coding", "캡스톤 디자인"].map((t, i) => (
            <Tag key={t} color={i === 0 ? C.accent : C.muted} bg={i === 0 ? C.accentBg : C.bg}>{t}</Tag>
          ))}
        </div>

        <h1 className="fu fu2" style={{
          fontFamily: "'Lora', serif", fontSize: 48, fontWeight: 500,
          lineHeight: 1.15, letterSpacing: "-0.02em", color: C.text,
          marginBottom: 16, maxWidth: 700,
        }}>
          AI 탐정게임<br />
          <span style={{ color: C.accent }}>용의자가 거짓말한다</span>
        </h1>

        <div className="fu fu2" style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
          color: C.accent, marginBottom: 20, display: "flex", alignItems: "center", gap: 2,
        }}>
          <span style={{ color: C.muted }}>$ </span>
          {typed}
          <span className="blink" style={{ width: 8, height: 14, background: C.accent, display: "inline-block", marginLeft: 1 }} />
        </div>

        <p className="fu fu3" style={{
          fontSize: 17, color: C.muted, lineHeight: 1.7,
          marginBottom: 28, maxWidth: 580,
        }}>
          HTML/CSS/JavaScript만으로 구현한 인터랙티브 웹 추리게임.
          GPT API 기반 AI 용의자와 실제 대화하며 단서를 수집하고 최종 추리를 완성하는 몰입형 탐정 경험.
          <strong style={{ color: C.text, fontWeight: 600 }}> 전 과정을 AI 협업(Vibe Coding) 방식으로 진행한 실험 프로젝트.</strong>
        </p>

        <div className="fu fu4" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 48 }}>
          {[
            { label: "게임 데모 ↗", primary: true },
            { label: "GitHub ↗" },
            { label: "캡스톤 포스터 PDF ↓" },
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

        {/* KPI 4개 */}
        <div className="fu fu5" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { label: "개발 방식", val: "Vibe Coding", sub: "ChatGPT·Claude 전 과정 협업", color: C.accent },
            { label: "AI 용의자 수", val: "최대 4인", sub: "각기 다른 알리바이·거짓말 패턴", color: C.text },
            { label: "시나리오", val: "2개", sub: "아파트 살인 + 놀이공원 화재", color: C.text },
            { label: "채점 기준", val: "3축 평가", sub: "논리·단서·정확도 → S/A/B/C", color: C.green },
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
};

/* ─── OVERVIEW SECTION ───────────────────────── */
const OverviewSection = () => (
  <section id="overview" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <SecLabel>프로젝트 개요</SecLabel>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
        무엇을 만들었는가
      </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 40, lineHeight: 1.6, maxWidth: 560 }}>
        단순한 Q&A 챗봇이 아닌, 게임 맥락을 이해하고 거짓말하는 AI 용의자를 구현하는 것이 핵심 과제였습니다.
      </p>

      {/* 게임 플로우 */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 16 }}>게임 전체 흐름</div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
          {[
            { step: "01", label: "인트로", desc: "사건 브리핑\n배경 음악 시작", color: C.muted },
            { step: "02", label: "현장 탐색", desc: "장소 클릭\n단서 수집", color: C.accent },
            { step: "03", label: "용의자 심문", desc: "GPT AI와\n실시간 대화", color: C.purple },
            { step: "04", label: "추가 단서", desc: "심문 중 키워드\n→ 자동 단서 추가", color: C.amber },
            { step: "05", label: "최종 추리", desc: "범인 지목 +\n근거 텍스트 입력", color: C.red },
            { step: "06", label: "GPT 채점", desc: "논리·단서·정확도\nS/A/B/C 등급", color: C.green },
          ].map(({ step, label, desc, color }, i, arr) => (
            <div key={step} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                background: C.surface, border: `1px solid ${color}40`,
                borderRadius: 10, padding: "14px 18px", textAlign: "center",
                borderTop: `3px solid ${color}`, minWidth: 110,
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

      {/* 핵심 도전 과제 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          {
            icon: "🤔",
            title: "핵심 도전 1",
            problem: "AI가 맥락을 잃는 문제",
            solution: "GPT API에 전체 대화 기록을 매 요청마다 전달하여 전후 맥락 유지",
            color: C.accent,
          },
          {
            icon: "🎭",
            title: "핵심 도전 2",
            problem: "AI가 범인임을 자백하는 문제",
            solution: "시스템 프롬프트에 '범인임을 절대 인정하지 않음' 규칙 + 단서 언급 시 당황하는 반응 패턴 설계",
            color: C.red,
          },
          {
            icon: "🔗",
            title: "핵심 도전 3",
            problem: "단서와 AI 반응이 따로 노는 문제",
            solution: "플레이어가 수집한 단서 목록을 실시간으로 시스템 프롬프트에 주입하여 AI가 단서를 자연스럽게 인지",
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

/* ─── AI DESIGN SECTION ──────────────────────── */
const AISection = () => {
  const [open, setOpen] = useState(0);

  const promptStructure = [
    {
      title: "역할 정의 레이어",
      code: `당신은 [용의자 이름]입니다.
직업: [직업]
사건 당일 알리바이: [알리바이 상세]
실제 행동: [숨기는 진실]
성격: [성격 특성]`,
      desc: "용의자의 신원과 기본 설정을 주입. 각 용의자마다 개별 파일로 관리하여 4인의 AI가 완전히 다른 페르소나를 가집니다.",
      color: C.accent,
    },
    {
      title: "단서 연동 레이어",
      code: `플레이어가 수집한 단서:
${"{clues.map(c => `- ${c.name}: ${c.content}`).join('\\n')}"}

위 단서가 언급되면 당황하거나
자연스럽게 화제를 돌리세요.
단서를 직접 언급하지 않는 한
모르는 척 하세요.`,
      desc: "플레이어의 단서 수집 상태를 실시간으로 프롬프트에 반영. 단서를 많이 모을수록 AI가 더 긴장합니다.",
      color: C.purple,
    },
    {
      title: "답변 제약 레이어",
      code: `규칙:
- 절대 범인임을 인정하지 마세요
- 답변은 100자 이내로 제한
- 단서 직접 언급 시 당황한 반응
- 거짓 알리바이를 일관되게 유지
- 플레이어가 압박하면 화제 전환`,
      desc: "AI가 게임 규칙을 지키도록 강제하는 제약 레이어. 이 레이어 없이는 GPT가 쉽게 자백하거나 힌트를 줍니다.",
      color: C.red,
    },
    {
      title: "최종 추리 평가 프롬프트",
      code: `플레이어 주장: [범인 지목]
제시한 근거: [근거 텍스트]
수집한 단서: [단서 목록]

다음 3가지 기준으로 평가하세요:
- 논리적 근거의 타당성 (40점)
- 단서 활용도 (30점)
- 범인 특정 정확도 (30점)

등급(S/A/B/C)과 구체적 피드백 제공`,
      desc: "게임 후반부에 별도로 호출하는 채점 전용 프롬프트. 같은 GPT API지만 완전히 다른 역할을 수행합니다.",
      color: C.green,
    },
  ];

  return (
    <section id="ai" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SecLabel>AI 시스템 설계</SecLabel>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
          어떻게 AI를 거짓말하게 만들었는가
        </h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6, maxWidth: 600 }}>
          GPT API의 시스템 프롬프트를 4개 레이어로 구분해 설계했습니다.
          각 레이어는 독립적으로 관리되며 런타임에 조합됩니다.
        </p>

        {/* 프롬프트 구조 탭 */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, marginBottom: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {promptStructure.map(({ title, color }, i) => (
              <button key={i} onClick={() => setOpen(i)} style={{
                padding: "12px 16px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                background: open === i ? color + "15" : C.surface,
                border: `1px solid ${open === i ? color + "40" : C.border}`,
                borderLeft: `3px solid ${open === i ? color : "transparent"}`,
                fontSize: 13, fontWeight: open === i ? 600 : 400,
                color: open === i ? color : C.muted,
                transition: "all 0.15s", fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>{title}</button>
            ))}
          </div>
          <Card style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <Tag color={promptStructure[open].color}>{promptStructure[open].title}</Tag>
            </div>
            <div style={{
              background: "#1A1A2E", borderRadius: 8, padding: "16px 20px",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
              color: "#A8B2C8", lineHeight: 1.7, marginBottom: 16,
              whiteSpace: "pre-wrap", overflowX: "auto",
            }}>
              {promptStructure[open].code}
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{promptStructure[open].desc}</div>
          </Card>
        </div>

        {/* 단서 연동 흐름 */}
        <Card style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 20 }}>
            단서 수집 → AI 반응 실시간 연동 흐름
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", rowGap: 12 }}>
            {[
              { label: "장소 클릭", sub: "현장 탐색", color: C.accent },
              null,
              { label: "단서 획득", sub: "clues[] 배열 업데이트", color: C.accent },
              null,
              { label: "심문 입력", sub: "플레이어 질문", color: C.purple },
              null,
              { label: "프롬프트 재조합", sub: "단서 목록 자동 주입", color: C.amber },
              null,
              { label: "GPT 호출", sub: "맥락 인식 답변", color: C.red },
              null,
              { label: "용의자 반응", sub: "당황·회피·거짓말", color: C.red },
            ].map((item, i) =>
              item === null ? (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ width: 16, height: 1, background: C.border }} />
                  <div style={{ width: 0, height: 0, borderTop: "4px solid transparent", borderBottom: "4px solid transparent", borderLeft: `5px solid ${C.borderDark}` }} />
                </div>
              ) : (
                <div key={i} style={{
                  background: item.color + "10", border: `1px solid ${item.color}30`,
                  borderRadius: 8, padding: "10px 14px", textAlign: "center", minWidth: 100,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: item.color }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>{item.sub}</div>
                </div>
              )
            )}
          </div>
        </Card>

        {/* 채점 시스템 */}
        <div style={{ marginTop: 16 }}>
          <Card style={{ padding: "24px 28px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>
              최종 추리 자동 채점 시스템
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
              {[
                { name: "논리적 근거의 타당성", score: 40, desc: "플레이어가 제시한 추론이 사건 흐름과 일치하는지 평가", color: C.accent },
                { name: "단서 활용도", score: 30, desc: "수집한 단서를 얼마나 근거로 활용했는지 평가", color: C.purple },
                { name: "범인 특정 정확도", score: 30, desc: "최종 지목한 범인의 정확도", color: C.green },
              ].map(({ name, score, desc, color }) => (
                <div key={name} style={{
                  background: C.bg, borderRadius: 8, padding: "14px 16px", border: `1px solid ${C.border}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{name}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color, fontWeight: 500 }}>{score}점</div>
                  </div>
                  <div style={{ height: 4, background: C.border, borderRadius: 2, marginBottom: 8, overflow: "hidden" }}>
                    <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.accentBg, borderRadius: 8, padding: "12px 16px", border: `1px solid ${C.accentDim}` }}>
              <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 4 }}>등급 기준</div>
              <div style={{ display: "flex", gap: 16 }}>
                {[["S", "90점+", C.green], ["A", "75~89점", C.accent], ["B", "60~74점", C.amber], ["C", "60점 미만", C.red]].map(([grade, range, color]) => (
                  <div key={grade} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 4,
                      background: color + "20", border: `1px solid ${color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color,
                    }}>{grade}</span>
                    <span style={{ fontSize: 12, color: C.muted }}>{range}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

/* ─── SCENARIO SECTION ───────────────────────── */
const ScenarioSection = () => {
  const [active, setActive] = useState(0);

  const scenarios = [
    {
      id: "01",
      title: "개나리아파트 살인사건",
      tag: "밀실 살인",
      tagColor: C.red,
      setting: "한적한 아파트 단지 내 발생한 의문의 살인. 피해자의 인간관계에서 진실을 밝혀내야 한다.",
      clueMethod: "장소 클릭 → 이미지·텍스트 단서 획득",
      locations: [
        { name: "13층 복도", clue: "혈흔 흔적, 목격자 발자국" },
        { name: "거실", clue: "피해자 유품, 메모지" },
        { name: "주차장", clue: "CCTV 기록, 차량 흔적" },
        { name: "관리실", clue: "출입 기록, 경비원 증언" },
      ],
      suspects: [
        { name: "아내", role: "피해자의 배우자", motive: "보험금 수령", lie: "사건 당일 외출 사실 은폐" },
        { name: "동료", role: "직장 동료", motive: "사업 갈등", lie: "마지막 만남 시각 거짓말" },
        { name: "할머니", role: "옆집 주민", motive: "소음 갈등", lie: "목격한 것 부인" },
        { name: "군인", role: "아파트 경비", motive: "금품 강탈", lie: "근무 시간대 위치 조작" },
      ],
      color: C.red,
    },
    {
      id: "02",
      title: "놀이공원 화재사건",
      tag: "방화 의혹",
      tagColor: C.amber,
      setting: "놀이공원에서 발생한 의문의 화재. 숨겨진 동기와 의도를 파헤쳐야 한다.",
      clueMethod: "지도 UI — 공원 현장 지도를 직접 클릭하여 이미지·텍스트 단서 획득",
      locations: [
        { name: "무대", clue: "발화 지점 흔적, 소화기 위치" },
        { name: "회전목마", clue: "목격자 진술, 오일 흔적" },
        { name: "스태프 폭케실", clue: "내부 메모, 열쇠 분실 기록" },
        { name: "티켓부스", clue: "CCTV 영상, 입장 기록" },
        { name: "캐비닛", clue: "내부 서류, 열쇠 묶음" },
        { name: "카루셀 뒷편", clue: "숨겨진 메모, 오일통" },
      ],
      suspects: [
        { name: "AI 그룹", role: "다수 용의자", motive: "각기 다른 동기", lie: "사건 당일 위치 불일치" },
      ],
      specialFeature: "지도 UI: 놀이공원 현장 지도를 직접 클릭 → 위치별 이미지+텍스트 단서 획득. 씬별 배경음악이 달라 몰입감 극대화.",
      color: C.amber,
    },
  ];

  const sc = scenarios[active];

  return (
    <section id="scenario" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SecLabel>시나리오 & 게임 콘텐츠</SecLabel>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
          두 개의 독립 사건
        </h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 1.6 }}>
          각 시나리오는 독립적인 타임라인과 단서 수집 동선을 가집니다.
          같은 엔진 위에서 전혀 다른 경험을 제공합니다.
        </p>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 28 }}>
          {scenarios.map((s, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              padding: "12px 24px", background: "transparent", border: "none",
              cursor: "pointer", fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: active === i ? C.text : C.muted, fontWeight: active === i ? 600 : 400,
              borderBottom: active === i ? `2px solid ${s.color}` : "2px solid transparent",
              transition: "all 0.15s",
            }}>
              {s.id === "01" ? "🏢" : "🎡"} {s.title}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* 좌: 사건 개요 + 장소 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card style={{ padding: "22px 24px", borderTop: `3px solid ${sc.color}`, borderRadius: "0 0 12px 12px" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <Tag color={sc.tagColor}>{sc.tag}</Tag>
                <Tag color={C.muted} bg={C.bg}>시나리오 {sc.id}</Tag>
              </div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6, marginBottom: 16 }}>{sc.setting}</div>
              <div style={{ background: sc.color + "10", borderRadius: 6, padding: "10px 14px", border: `1px solid ${sc.color}30` }}>
                <div style={{ fontSize: 11, color: sc.color, fontWeight: 600, marginBottom: 4 }}>단서 수집 방식</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.text }}>{sc.clueMethod}</div>
              </div>
            </Card>

            <Card style={{ padding: "22px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14 }}>탐색 가능 장소 & 단서</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sc.locations.map(({ name, clue }) => (
                  <div key={name} style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    paddingBottom: 8, borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{
                      background: sc.color + "15", borderRadius: 6, padding: "4px 10px",
                      fontSize: 12, fontWeight: 600, color: sc.color, flexShrink: 0, marginTop: 1,
                    }}>{name}</div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{clue}</div>
                  </div>
                ))}
              </div>
              {sc.specialFeature && (
                <div style={{ marginTop: 12, background: C.amberBg, borderRadius: 8, padding: "10px 14px", border: `1px solid ${C.amberDim}` }}>
                  <div style={{ fontSize: 11, color: C.amber, fontWeight: 600, marginBottom: 4 }}>✦ 시나리오 2 특수 기능</div>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{sc.specialFeature}</div>
                </div>
              )}
            </Card>
          </div>

          {/* 우: 용의자 카드 */}
          <div>
            <Card style={{ padding: "22px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14 }}>
                AI 용의자 프로필
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sc.suspects.map(({ name, role, motive, lie }) => (
                  <div key={name} style={{
                    background: C.bg, borderRadius: 8, padding: "14px 16px",
                    border: `1px solid ${C.border}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{name}</div>
                      <Tag color={C.muted} bg={C.surface}>{role}</Tag>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: C.faint, fontWeight: 600, marginBottom: 3, letterSpacing: "0.06em" }}>동기</div>
                        <div style={{ fontSize: 12, color: C.text }}>{motive}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: C.red, fontWeight: 600, marginBottom: 3, letterSpacing: "0.06em" }}>AI 거짓말 포인트</div>
                        <div style={{ fontSize: 12, color: C.text }}>{lie}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 14, background: C.purpleBg, borderRadius: 8,
                padding: "12px 16px", border: `1px solid ${C.purpleDim}`,
              }}>
                <div style={{ fontSize: 11, color: C.purple, fontWeight: 600, marginBottom: 6 }}>GPT 심문 시스템 동작 방식</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    "용의자 클릭 → 해당 용의자 시스템 프롬프트 로드",
                    "수집된 단서 목록 자동 프롬프트 주입",
                    "플레이어 질문 입력 → GPT API 호출",
                    "용의자 캐릭터로 답변 생성 (100자 제한)",
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Mono size={11} color={C.purple}>{String(i + 1).padStart(2, "0")}.</Mono>
                      <div style={{ fontSize: 12, color: C.text }}>{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── TECH SECTION ───────────────────────────── */
const TechSection = () => {
  const [open, setOpen] = useState(null);

  const techDetails = [
    {
      q: "switchScene() 커스텀 엔진은 어떻게 동작하는가?",
      why: "React나 Vue 없이 순수 JS로 SPA 같은 씬 전환을 구현해야 했습니다. 라이브러리 없이 게임 흐름을 제어하려면 자체 엔진이 필요했습니다.",
      how: "HTML의 모든 씬(.screen)을 display:none으로 감추고, 활성화할 씬만 보여주는 방식. 전환 시 opacity 0→1 CSS transition으로 비동기 페이드 효과 구현. 씬 전환 시 단서 추가, BGM 변경, 타이머 시작이 함께 실행되도록 Promise 체인으로 중앙화.",
      code: `async function switchScene(nextId, options = {}) {\n  await fadeOut(currentScene);\n  currentScene.style.display = 'none';\n  \n  if (options.addClue) addClue(options.clue);\n  if (options.changeBGM) playBGM(options.bgm);\n  if (options.startTimer) startTimer();\n  \n  nextScene.style.display = 'flex';\n  await fadeIn(nextScene);\n  currentScene = nextScene;\n}`,
      color: C.accent,
    },
    {
      q: "단서 상태를 어떻게 관리했는가?",
      why: "React 같은 상태관리 없이 게임 내 단서 수집 상태를 추적하고, 이를 GPT 프롬프트에 실시간 반영해야 했습니다.",
      how: "JS Object를 전역 상태로 사용. 단서 수집 시 배열에 push하고, 심문 창 열릴 때마다 해당 배열을 읽어 시스템 프롬프트를 재조합. 수집된 단서는 UI 단서 패널에도 즉시 반영됩니다.",
      code: `const gameState = {\n  collectedClues: [],\n  suspectHistory: {},  // 용의자별 대화 기록\n  currentSuspect: null,\n};\n\nfunction buildSystemPrompt(suspect) {\n  const clueContext = gameState.collectedClues\n    .map(c => \`- \${c.name}: \${c.content}\`)\n    .join('\\n');\n  return SUSPECT_PROMPTS[suspect] + '\\n\\n수집된 단서:\\n' + clueContext;\n}`,
      color: C.purple,
    },
    {
      q: "GPT API 대화 맥락을 어떻게 유지했는가?",
      why: "GPT API는 상태가 없습니다(stateless). 이전 대화를 기억하게 하려면 매 요청마다 전체 대화 기록을 함께 보내야 했습니다.",
      how: "용의자별로 messages 배열을 유지. 새 질문이 들어오면 시스템 프롬프트(단서 포함) + 이전 대화 전체 + 새 질문을 messages 배열로 조합해 API 호출. 대화가 길어지면 오래된 기록을 trimming하여 토큰 한계 관리.",
      code: `async function askSuspect(suspectId, userMessage) {\n  const systemPrompt = buildSystemPrompt(suspectId);\n  const history = gameState.suspectHistory[suspectId] || [];\n  \n  const messages = [\n    { role: 'system', content: systemPrompt },\n    ...history,\n    { role: 'user', content: userMessage },\n  ];\n  \n  const res = await callGPT(messages);\n  history.push({ role: 'user', content: userMessage });\n  history.push({ role: 'assistant', content: res });\n  gameState.suspectHistory[suspectId] = history;\n  return res;\n}`,
      color: C.green,
    },
    {
      q: "Web Audio API로 몰입감을 어떻게 높였는가?",
      why: "단순 <audio> 태그로는 씬 전환과 BGM 변경의 동기화, 페이드 인/아웃 효과를 구현하기 어려웠습니다.",
      how: "AudioContext와 GainNode를 사용해 볼륨 페이드 인/아웃 구현. 씬마다 다른 BGM이 자동 교체되며, 타이핑 효과음은 Web Audio API의 버퍼를 사용해 빠른 연속 재생 처리. 효과음 오버랩 방지를 위한 타임스탬프 관리도 추가.",
      code: `function switchBGM(src) {\n  const gain = audioCtx.createGain();\n  gain.connect(audioCtx.destination);\n  \n  // 현재 BGM 페이드 아웃\n  currentGain.gain.linearRampToValueAtTime(\n    0, audioCtx.currentTime + 1.5\n  );\n  \n  // 새 BGM 로드 + 페이드 인\n  const source = audioCtx.createBufferSource();\n  source.buffer = await loadAudio(src);\n  source.connect(gain);\n  gain.gain.setValueAtTime(0, audioCtx.currentTime + 1.5);\n  gain.gain.linearRampToValueAtTime(0.7, audioCtx.currentTime + 3);\n  source.start(audioCtx.currentTime + 1.5);\n  currentGain = gain;\n}`,
      color: C.amber,
    },
  ];

  return (
    <section id="tech" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SecLabel>기술 구현 상세</SecLabel>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
          어떻게 구현했는가
        </h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.6, maxWidth: 560 }}>
          프레임워크 없이 Vanilla JS만으로 구현한 기술적 결정들. 각 선택에는 이유가 있습니다.
        </p>

        {/* 기술 스택 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 32 }}>
          {[
            { category: "프론트엔드", items: ["HTML5", "CSS3", "Vanilla JS"], color: C.accent },
            { category: "AI API", items: ["OpenAI GPT-4 API"], color: C.purple },
            { category: "상태 관리", items: ["JS Object (단서·씬)"], color: C.green },
            { category: "씬 전환", items: ["switchScene() 커스텀"], color: C.amber },
            { category: "오디오", items: ["Web Audio API"], color: C.red },
          ].map(({ category, items, color }) => (
            <Card key={category} style={{ padding: "16px" }}>
              <div style={{ fontSize: 10, color, fontWeight: 600, marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>{category}</div>
              {items.map(item => (
                <div key={item} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.text, lineHeight: 1.6 }}>{item}</div>
              ))}
            </Card>
          ))}
        </div>

        {/* 기술 결정 아코디언 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {techDetails.map(({ q, why, how, code, color }, i) => (
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
                <div style={{ padding: "0 24px 24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div style={{ background: C.amberBg, borderRadius: 8, padding: "14px 16px", border: `1px solid ${C.amberDim}` }}>
                      <div style={{ fontSize: 11, color: C.amber, fontWeight: 600, marginBottom: 6 }}>왜 필요했는가</div>
                      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{why}</div>
                    </div>
                    <div style={{ background: C.accentBg, borderRadius: 8, padding: "14px 16px", border: `1px solid ${C.accentDim}` }}>
                      <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginBottom: 6 }}>어떻게 구현했는가</div>
                      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{how}</div>
                    </div>
                  </div>
                  <div style={{
                    background: "#1A1A2E", borderRadius: 8, padding: "16px 20px",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                    color: "#A8B2C8", lineHeight: 1.8, whiteSpace: "pre",
                    overflowX: "auto",
                  }}>{code}</div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── VIBE CODING SECTION ────────────────────── */
const VibeCodingSection = () => (
  <section id="vibe" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <SecLabel>Vibe Coding 실험</SecLabel>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
        AI와 함께 AI를 만든 과정
      </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 40, lineHeight: 1.6, maxWidth: 600 }}>
        ChatGPT·Claude를 활용해 코드 설계·구현·디버깅 전 과정을 진행했습니다.
        Vibe Coding은 단순히 코드를 생성하는 게 아니라, AI와의 대화를 통해 설계를 함께 발전시키는 방식입니다.
      </p>

      {/* 실제 협업 사례 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {[
          {
            phase: "설계 단계",
            icon: "🏗️",
            problem: "GPT API를 어떻게 용의자처럼 말하게 할까?",
            aiRole: "프롬프트 엔지니어링 구조 설계 제안. '4개 레이어' 아이디어 도출",
            outcome: "역할 정의 + 단서 연동 + 답변 제약 + 채점 프롬프트 분리 구조 확정",
            color: C.accent,
          },
          {
            phase: "구현 단계",
            icon: "⚙️",
            problem: "씬 전환 시 BGM과 단서 추가가 동시에 안 됨",
            aiRole: "Promise 체인 기반 switchScene 엔진 구조 제안 및 코드 작성",
            outcome: "비동기 씬 전환 엔진 완성. 페이드·BGM·단서·타이머 동기화 달성",
            color: C.purple,
          },
          {
            phase: "디버깅 단계",
            icon: "🐛",
            problem: "AI 용의자가 3번 질문하면 자백해 버리는 문제",
            aiRole: "시스템 프롬프트의 답변 제약 레이어 강화 방안 제시",
            outcome: "압박 시 화제 전환 패턴 추가. 자백 없이 긴장감 유지 가능",
            color: C.red,
          },
          {
            phase: "개선 단계",
            icon: "✨",
            problem: "채점 결과가 너무 기계적으로 느껴지는 문제",
            aiRole: "채점 기준을 점수 중심 → 서술 피드백 중심으로 재설계 제안",
            outcome: "등급 + 구체적 피드백 텍스트 조합. 플레이어 만족도 향상",
            color: C.green,
          },
        ].map(({ phase, icon, problem, aiRole, outcome, color }) => (
          <Card key={phase} style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <Tag color={color}>{phase}</Tag>
            </div>
            <div style={{ background: C.bg, borderRadius: 6, padding: "10px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 3 }}>직면한 문제</div>
              <div style={{ fontSize: 13, color: C.text }}>{problem}</div>
            </div>
            <div style={{ background: C.purpleBg, borderRadius: 6, padding: "10px 14px", marginBottom: 10, border: `1px solid ${C.purpleDim}` }}>
              <div style={{ fontSize: 11, color: C.purple, fontWeight: 600, marginBottom: 3 }}>AI의 역할</div>
              <div style={{ fontSize: 13, color: C.text }}>{aiRole}</div>
            </div>
            <div style={{ background: C.greenBg, borderRadius: 6, padding: "10px 14px", border: `1px solid ${C.greenDim}` }}>
              <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginBottom: 3 }}>결과</div>
              <div style={{ fontSize: 13, color: C.text }}>{outcome}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Vibe Coding 배운 것 */}
      <Card style={{ padding: "24px 28px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>
          Vibe Coding에서 배운 것
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { title: "AI는 구현보다 설계에 강하다", desc: "'이런 기능 만들어줘'보다 '이런 문제를 어떻게 설계해야 할까?'를 물었을 때 더 좋은 결과가 나왔습니다.", icon: "🧠", color: C.accent },
            { title: "맥락 제공이 핵심이다", desc: "코드만 붙여넣는 것보다 '이 프로젝트는 ~이고, 현재 ~문제가 있어'처럼 배경을 설명했을 때 훨씬 정확한 도움을 받았습니다.", icon: "📝", color: C.purple },
            { title: "AI가 틀릴 때를 알아야 한다", desc: "생성된 코드를 무조건 신뢰하지 않고, 동작 원리를 이해하면서 적용해야 합니다. 이해 없는 Vibe Coding은 복잡성만 키웁니다.", icon: "⚠️", color: C.amber },
          ].map(({ title, desc, icon, color }) => (
            <div key={title} style={{
              background: C.bg, borderRadius: 8, padding: "16px",
              border: `1px solid ${C.border}`,
            }}>
              <span style={{ fontSize: 22, display: "block", marginBottom: 10 }}>{icon}</span>
              <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </section>
);

/* ─── LIMITS SECTION ─────────────────────────── */
const LimitsSection = () => (
  <section id="limits" style={{ padding: "64px 40px", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <SecLabel>한계 및 성과</SecLabel>
      <h2 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, marginBottom: 8, color: C.text }}>
        솔직한 평가
      </h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 1.6 }}>
        잘 된 것만 보여주는 포트폴리오는 신뢰하기 어렵습니다.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        {[
          {
            title: "GPT API 응답 지연 (1~3초)",
            desc: "심문 중 AI 응답을 기다리는 시간이 몰입을 끊습니다. 특히 모바일 환경에서 더 두드러졌습니다.",
            next: "스트리밍 응답(SSE) 적용으로 타이핑 효과처럼 실시간 출력하면 체감 속도 개선 가능",
            color: C.red,
          },
          {
            title: "API 키 클라이언트 노출 문제",
            desc: "현재 구조는 OpenAI API 키가 config.js에 평문으로 존재합니다. 실서비스라면 심각한 보안 문제입니다.",
            next: "Node.js 백엔드 프록시 서버 추가 → API 키를 서버에서만 관리하도록 구조 변경 필요",
            color: C.red,
          },
          {
            title: "토큰 비용 제한 없음",
            desc: "대화가 길어질수록 GPT API 호출 비용이 선형으로 증가합니다. 프로덕션 서비스라면 비용 폭증 가능성이 있습니다.",
            next: "대화 히스토리 요약(summarization) 기법으로 오래된 기록을 압축하여 토큰 절감",
            color: C.amber,
          },
          {
            title: "AI 답변 일관성 한계",
            desc: "같은 질문에 항상 동일한 반응을 보장하지 못합니다. GPT의 확률적 특성상 가끔 시나리오에서 벗어난 답변이 나옵니다.",
            next: "temperature 조정 + Few-shot 예시 추가로 일관성 향상 가능. 완전 해결은 어려움.",
            color: C.amber,
          },
        ].map(({ title, desc, next, color }) => (
          <Card key={title} style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 5 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</div>
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 12, paddingLeft: 18 }}>{desc}</div>
            <div style={{ paddingLeft: 18, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 11, color: C.green, fontWeight: 600, flexShrink: 0, marginTop: 1 }}>→ 개선 방향</span>
              <span style={{ fontSize: 12, color: C.green, lineHeight: 1.5 }}>{next}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* 성과 */}
      <Card style={{ padding: "24px 28px", background: C.accentBg, border: `1px solid ${C.accentDim}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 16 }}>
          프로젝트가 증명한 것
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { claim: "단순 채팅봇 → 맥락 유지 AI 용의자", how: "4레이어 프롬프트 + 대화 히스토리 전달 구조로 달성", color: C.accent },
            { claim: "프롬프트 엔지니어링으로 캐릭터 구현 가능", how: "4인의 AI가 각기 다른 알리바이·거짓말 패턴·반응 방식을 가짐", color: C.purple },
            { claim: "Vibe Coding으로 복잡한 인터랙션 개발 가능", how: "설계·구현·디버깅 전 과정 AI 협업으로 학기 내 완성", color: C.green },
          ].map(({ claim, how, color }) => (
            <div key={claim} style={{ background: C.surface, borderRadius: 8, padding: "16px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 8, lineHeight: 1.4 }}>✓ {claim}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{how}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </section>
);

/* ─── FOOTER ─────────────────────────────────── */
const Footer = () => (
  <footer style={{ padding: "40px 40px", borderTop: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: 16, color: C.text, marginBottom: 4 }}>
          개발 포트폴리오
        </div>
        <div style={{ fontSize: 13, color: C.muted }}>AI 탐정게임 개발 — HTML/CSS/JS + GPT API</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {["게임 데모 ↗", "GitHub ↗", "캡스톤 포스터 PDF", "발표 PPT"].map(t => (
          <button key={t} style={{
            padding: "7px 14px", borderRadius: 6, fontSize: 12,
            background: "transparent", color: C.muted,
            border: `1px solid ${C.border}`, cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderDark; e.currentTarget.style.color = C.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
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
        <AISection />
        <ScenarioSection />
        <TechSection />
        <VibeCodingSection />
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
