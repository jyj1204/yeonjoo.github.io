import { useState, useEffect, useRef } from "react";

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
  gold: "#D4A843",
  goldDim: "#3D2E0A",
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
    @keyframes blink {
      0%, 100% { opacity: 1; } 50% { opacity: 0; }
    }
    .fade-up { animation: fadeUp 0.6s ease forwards; }
    .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
    .fade-up-2 { animation-delay: 0.25s; opacity: 0; }
    .fade-up-3 { animation-delay: 0.4s; opacity: 0; }
    .fade-up-4 { animation-delay: 0.55s; opacity: 0; }
    .cursor-blink { animation: blink 1.2s step-end infinite; }
  `}</style>
);

/* ─── 데이터 ─────────────────────────────────── */
const techStack = [
  { category: "프론트엔드", items: ["HTML5", "CSS3", "Vanilla JS"] },
  { category: "AI API", items: ["OpenAI GPT-4 API"] },
  { category: "상태 관리", items: ["JS Object (단서·씬)"] },
  { category: "씬 전환", items: ["switchScene() 커스텀 엔진"] },
  { category: "오디오", items: ["Web Audio API"] },
  { category: "개발 방식", items: ["AI 협업 개발 (Vibe Coding)"] },
];

const scenarios = [
  {
    id: "01",
    title: "개나리아파트 살인사건",
    icon: "🏢",
    bg: C.redDim,
    border: C.red,
    color: C.red,
    setting: "한적한 아파트 단지 내 의문의 살인",
    locations: ["13층 복도", "거실", "각 층 주차장·관리실"],
    suspects: ["아내", "동료", "할머니", "군인"],
    clueSystem: "장소 클릭 → 이미지·텍스트 단서 획득",
    desc: "플레이어가 탐정이 되어 현장 증거를 분석하고 용의자를 심문하며 진범 추적",
  },
  {
    id: "02",
    title: "놀이공원 화재사건",
    icon: "🎡",
    bg: C.amberDim,
    border: C.amber,
    color: C.amber,
    setting: "놀이공원에서 발생한 의문의 화재",
    locations: ["무대", "회전목마", "스태프 폭케실", "티켓부스"],
    suspects: ["AI 그룹 (다수)"],
    clueSystem: "지도 UI — 현장 지도 직접 클릭 → 단서 획득",
    desc: "숨겨진 동기와 의도를 파헤치는 사건. BGM 씬별 다른 배경음악으로 몰입감 극대화",
  },
];

const aiSystem = [
  {
    title: "시스템 프롬프트 구조",
    icon: "🧠",
    desc: "용의자의 직업·알리바이·숨기는 비밀·수집된 단서를 포함한 시스템 프롬프트 생성",
    color: C.accent,
  },
  {
    title: "단서 연동",
    icon: "🔗",
    desc: "플레이어가 단서 관련 키워드를 언급하면 해당 단서 내용이 프롬프트에 자동 추가되어 AI가 자연스럽게 반응",
    color: C.green,
  },
  {
    title: "답변 규칙",
    icon: "⚖️",
    desc: "범인임을 인정하지 않게, 단서 언급 시 당황하거나 회피하는 반응 포함, 100자 제한 등 형식 설정",
    color: C.amber,
  },
  {
    title: "대화 기록 유지",
    icon: "💬",
    desc: "GPT API에 이전 대화 내용을 전달하여 전후 맥락을 유지한 대화 흐름 구현",
    color: C.red,
  },
];

const scoringCriteria = [
  { name: "논리적 근거의 타당성", score: 40, color: C.accent },
  { name: "단서 활용도", score: 30, color: C.green },
  { name: "범인 특정 정확도", score: 30, color: C.amber },
];

const engineFeatures = [
  {
    name: "switchScene() 엔진",
    icon: "⚙️",
    desc: "HTML 셀렉터를 숨겼다 보여주는 방식으로 상황 전환 구현. 비동기 페이드 애니메이션 포함.",
    color: C.accent,
  },
  {
    name: "단서 상태 관리",
    icon: "📦",
    desc: "JS Object로 플레이어가 수집한 단서와 게임 상태를 실시간 관리 및 시각적 표현.",
    color: C.green,
  },
  {
    name: "Web Audio API",
    icon: "🔊",
    desc: "BGM, 타자기 효과음 등 씬 전환 시 단서 추가, BGM 변경, 타이머 적용이 함께 실행되도록 중앙화.",
    color: C.amber,
  },
];

const projectSteps = [
  { num: "01", phase: "기획", title: "두 개의 독립 시나리오", desc: "아파트 vs 놀이공원, 각기 다른 클루 수집 방식", badge: "설계", bColor: C.accent },
  { num: "02", phase: "AI 설계", title: "프롬프트 엔지니어링", desc: "개성·알리바이·거짓말 패턴을 GPT에 주입", badge: "핵심 기술", bColor: C.amber },
  { num: "03", phase: "구현", title: "Vibe Coding 실험", desc: "ChatGPT·Claude로 코드 설계·구현·디버깅 전 과정", badge: "AI 협업", bColor: C.green },
  { num: "04", phase: "평가 AI", title: "최종 추리 자동 채점", desc: "GPT가 논리 타당성·단서 활용도·정확도 평가", badge: "자동화", bColor: C.accent },
  { num: "05", phase: "완성", title: "몰입형 경험 설계", desc: "BGM·페이드·타이머가 씬 전환과 동기화", badge: "UX", bColor: C.red },
];

const highlights = [
  { icon: "🤖", title: "Vibe Coding", val: "전 과정 AI 협업", sub: "ChatGPT·Claude로 설계·구현·디버깅", color: C.accent },
  { icon: "🎭", title: "AI 용의자 심문", val: "GPT-4 기반", sub: "맥락 유지·단서 연동·거짓말 패턴", color: C.amber },
  { icon: "🗺️", title: "2개 시나리오", val: "독립 타임라인", sub: "아파트 살인 + 놀이공원 화재", color: C.green },
  { icon: "🏆", title: "자동 채점", val: "S/A/B/C 등급", sub: "논리·단서·정확도 3축 GPT 평가", color: C.red },
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
        {["스토리", "핵심기능", "시나리오", "기술", "결론"].map(t => (
          <a key={t} href={`#${t}`} style={{
            fontSize: 13, color: C.muted, textDecoration: "none",
            transition: "color 0.2s",
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
const Hero = () => {
  const [typed, setTyped] = useState("");
  const full = "용의자를 심문하라. AI가 거짓말한다.";
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setTyped(full.slice(0, i + 1));
      i++;
      if (i >= full.length) clearInterval(t);
    }, 60);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{
      padding: "80px 40px 60px",
      borderBottom: `0.5px solid ${C.border}`,
      position: "relative", overflow: "hidden",
    }}>
      {/* 배경 장식 */}
      <div style={{
        position: "absolute", top: -100, right: -100,
        width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.accent}08 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -80, left: -80,
        width: 400, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.red}06 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div className="fade-up fade-up-1" style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <Badge color={C.muted}>2024</Badge>
        <Badge color={C.accent}>캡스톤 디자인</Badge>
        <Badge color={C.green}>4인 팀 프로젝트</Badge>
        <Badge color={C.amber}>Vibe Coding</Badge>
      </div>

      <div className="fade-up fade-up-1" style={{ marginBottom: 8 }}>
        <Mono style={{ fontSize: 12, color: C.muted, letterSpacing: "0.1em" }}>PROJECT_04 / HTML·CSS·JS + GPT API</Mono>
      </div>

      <h1 className="fade-up fade-up-2" style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 52, lineHeight: 1.08, color: C.white,
        marginBottom: 20, letterSpacing: "-0.02em",
      }}>
        AI 탐정게임 개발<br />
        <span style={{ color: C.accent, fontStyle: "italic" }}>Detective</span>
      </h1>

      {/* 타이핑 효과 */}
      <div className="fade-up fade-up-3" style={{
        marginBottom: 28,
        fontFamily: "'DM Mono', monospace",
        fontSize: 16, color: C.amber,
        display: "flex", alignItems: "center", gap: 2,
      }}>
        <span style={{ color: C.muted }}>&gt; </span>
        {typed}
        <span className="cursor-blink" style={{ width: 2, height: 18, background: C.amber, display: "inline-block", marginLeft: 2 }} />
      </div>

      <p className="fade-up fade-up-3" style={{
        fontSize: 15, color: C.muted, lineHeight: 1.8,
        maxWidth: 620, marginBottom: 32,
      }}>
        HTML/CSS/JavaScript만으로 구현한 인터랙티브 웹 추리게임. GPT API 기반 AI 용의자와
        실제 대화하며 단서를 수집하고 최종 추리를 완성하는 몰입형 탐정 경험.
        전 과정을 AI 협업 개발(Vibe Coding) 방식으로 진행한 실험 프로젝트.
      </p>

      <div className="fade-up fade-up-4" style={{ display: "flex", gap: 12 }}>
        {["JavaScript", "GPT API", "프롬프트 엔지니어링", "Vibe Coding"].map(tag => (
          <Badge key={tag} color={C.accent}>{tag}</Badge>
        ))}
      </div>
    </section>
  );
};

/* ─── PROJECT STEPS ──────────────────────────── */
const StoryFlow = () => (
  <section id="스토리" style={{ padding: "60px 40px", borderBottom: `0.5px solid ${C.border}` }}>
    <SectionLabel>프로젝트 흐름</SectionLabel>
    <h2 style={{
      fontFamily: "'DM Serif Display', serif",
      fontSize: 32, color: C.white, marginBottom: 36,
    }}>어떻게 만들었는가</h2>

    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {projectSteps.map(({ num, phase, title, desc, badge, bColor }, i) => (
        <div key={num} style={{
          display: "grid", gridTemplateColumns: "60px 120px 1fr auto",
          gap: 24, alignItems: "start",
          padding: "24px 0",
          borderBottom: i < projectSteps.length - 1 ? `0.5px solid ${C.border}` : "none",
        }}>
          <Mono style={{ fontSize: 24, color: C.border, fontWeight: 500 }}>{num}</Mono>
          <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", paddingTop: 4 }}>
            {phase}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, color: C.white, marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
          </div>
          <Badge color={bColor}>{badge}</Badge>
        </div>
      ))}
    </div>
  </section>
);

/* ─── HIGHLIGHTS ─────────────────────────────── */
const Highlights = () => (
  <section id="핵심기능" style={{ padding: "60px 40px", borderBottom: `0.5px solid ${C.border}` }}>
    <SectionLabel>핵심 수치</SectionLabel>
    <h2 style={{
      fontFamily: "'DM Serif Display', serif",
      fontSize: 32, color: C.white, marginBottom: 36,
    }}>무엇이 핵심인가</h2>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      {highlights.map(({ icon, title, val, sub, color }) => (
        <div key={title} style={{
          background: C.surface, border: `0.5px solid ${C.border}`,
          borderRadius: 12, padding: "24px 20px",
          borderTop: `2px solid ${color}`,
          transition: "border-color 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = color}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
        >
          <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, color, fontWeight: 500, marginBottom: 4 }}>{val}</div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{sub}</div>
        </div>
      ))}
    </div>

    {/* AI 심문 시스템 상세 */}
    <div style={{ marginTop: 32 }}>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>AI 용의자 심문 설계 방식</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {aiSystem.map(({ title, icon, desc, color }) => (
          <div key={title} style={{
            background: C.surface, border: `0.5px solid ${C.border}`,
            borderRadius: 8, padding: "16px 20px",
            display: "flex", gap: 14, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── SCENARIOS ──────────────────────────────── */
const ScenariosSection = () => {
  const [active, setActive] = useState(0);
  const sc = scenarios[active];

  return (
    <section id="시나리오" style={{ padding: "60px 40px", borderBottom: `0.5px solid ${C.border}` }}>
      <SectionLabel>시나리오 & 기능</SectionLabel>
      <h2 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 32, color: C.white, marginBottom: 8,
      }}>두 개의 독립 사건</h2>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 1.6 }}>
        각 시나리오는 독립적인 타임라인과 단서 수집 동선을 가집니다.
      </p>

      {/* 탭 */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `0.5px solid ${C.border}` }}>
        {scenarios.map((s, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            padding: "12px 24px", background: "transparent", border: "none",
            cursor: "pointer", fontSize: 14, fontFamily: "'Outfit', sans-serif",
            color: active === i ? C.white : C.muted,
            borderBottom: active === i ? `1.5px solid ${s.color}` : "1.5px solid transparent",
            transition: "all 0.2s",
          }}>
            {s.icon} {s.title}
          </button>
        ))}
      </div>

      {/* 선택된 시나리오 */}
      <div style={{
        background: C.surface, border: `0.5px solid ${sc.border}40`,
        borderRadius: 12, padding: "28px 32px",
        borderLeft: `3px solid ${sc.color}`,
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>배경</div>
            <div style={{ fontSize: 14, color: C.text, marginBottom: 20, lineHeight: 1.6 }}>{sc.setting} — {sc.desc}</div>

            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>단서 수집 방식</div>
            <div style={{
              background: sc.bg + "60", borderRadius: 6, padding: "10px 14px",
              fontSize: 13, color: sc.color, fontFamily: "'DM Mono', monospace",
              border: `0.5px solid ${sc.color}30`,
            }}>{sc.clueSystem}</div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>탐색 장소</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {sc.locations.map(l => (
                <Badge key={l} color={sc.color}>{l}</Badge>
              ))}
            </div>

            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>용의자</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {sc.suspects.map(s => (
                <Badge key={s} color={C.muted}>{s}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 최종 추리 평가 */}
      <div style={{
        marginTop: 20, background: C.surface, border: `0.5px solid ${C.border}`,
        borderRadius: 12, padding: "24px 28px",
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.white, marginBottom: 16 }}>
          🏆 최종 추리 평가 AI — GPT 자동 채점 시스템
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {scoringCriteria.map(({ name, score, color }) => (
            <div key={name} style={{
              background: C.bg, borderRadius: 8, padding: "14px 16px",
              border: `0.5px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  flex: 1, height: 4, background: C.border, borderRadius: 2, overflow: "hidden",
                }}>
                  <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 2 }} />
                </div>
                <Mono style={{ fontSize: 13, color, fontWeight: 500 }}>{score}점</Mono>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: C.muted }}>
          플레이어가 제시한 논리에 따라 상세한 피드백과 점수가 제공되며 S/A/B/C 등급으로 분류
        </div>
      </div>
    </section>
  );
};

/* ─── TECH STACK ─────────────────────────────── */
const TechSection = () => (
  <section id="기술" style={{ padding: "60px 40px", borderBottom: `0.5px solid ${C.border}` }}>
    <SectionLabel>기술 스택 & 구현</SectionLabel>
    <h2 style={{
      fontFamily: "'DM Serif Display', serif",
      fontSize: 32, color: C.white, marginBottom: 36,
    }}>어떻게 구현했는가</h2>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* 기술 스택 */}
      <div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>기술 스택</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {techStack.map(({ category, items }) => (
            <div key={category} style={{
              background: C.surface, border: `0.5px solid ${C.border}`,
              borderRadius: 8, padding: "14px 18px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase", width: 100 }}>
                {category}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {items.map(item => (
                  <Mono key={item} style={{ fontSize: 13, color: C.text }}>{item}</Mono>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 엔진 상세 */}
      <div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>핵심 구현 상세</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {engineFeatures.map(({ name, icon, desc, color }) => (
            <div key={name} style={{
              background: C.surface, border: `0.5px solid ${C.border}`,
              borderRadius: 8, padding: "16px 20px",
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <Mono style={{ fontSize: 13, color, fontWeight: 500 }}>{name}</Mono>
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Vibe Coding 강조 박스 */}
    <div style={{
      marginTop: 20, background: C.accentDim + "30",
      border: `0.5px solid ${C.accent}40`, borderRadius: 12, padding: "24px 28px",
    }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ fontSize: 32 }}>🤖</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.accent, marginBottom: 8 }}>
            Vibe Coding — AI 협업 개발 실험
          </div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
            ChatGPT, Claude 등 AI 툴을 활용해 코드 설계·구현·디버깅 전 과정을 진행한 Vibe Coding 실험 프로젝트.
            단순 채팅봇이 아닌 게임 맥락을 이해하는 AI 용의자 심문 시스템 구현 / GPT API 프롬프트 엔지니어링으로
            각 용의자의 개성·알리바이·거짓말 패턴 구현 / 플레이어의 최종 추리 논리를 AI가 평가하여 점수·등급·피드백을 자동 생성.
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─── CONCLUSION ─────────────────────────────── */
const Conclusion = () => (
  <section id="결론" style={{ padding: "60px 40px" }}>
    <SectionLabel>프로젝트 결론</SectionLabel>
    <h2 style={{
      fontFamily: "'DM Serif Display', serif",
      fontSize: 40, color: C.white, marginBottom: 16, lineHeight: 1.1,
    }}>
      AI가 거짓말하도록 설계했습니다.<br />
      <span style={{ color: C.accent }}>그것이 몰입의 열쇠였습니다.</span>
    </h2>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 40 }}>
      {[
        { from: "처음 시도", fromVal: "단순 채팅봇 Q&A", to: "실제 구현", toVal: "맥락 유지 + 단서 연동 AI 용의자", color: C.accent },
        { from: "예상한 것", fromVal: "구현이 어려울 것", to: "발견한 것", toVal: "프롬프트 엔지니어링으로 충분히 가능", color: C.green },
        { from: "단순 개발 목표", fromVal: "게임 완성", to: "실험적 성과", toVal: "AI 협업 개발(Vibe Coding) 방법론 검증", color: C.amber },
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
        {["GitHub", "캡스톤 포스터 PDF", "게임 데모", "발표 PPT"].map(t => (
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
        <Highlights />
        <ScenariosSection />
        <TechSection />
        <Conclusion />
      </main>
    </div>
  );
}
