import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";

/* ═══════════════════════════════════════════════════════════
   PIXEL STAR FIELD — 16-bit canvas stars
═══════════════════════════════════════════════════════════ */
function PixelStarField() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.id = "pixel-stars";
    canvas.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;";
    document.body.prepend(canvas);
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Estrelas brancas com piscar aleatório
    const stars = Array.from({ length: 220 }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      size: Math.random() < 0.72 ? 1 : 2,
      t:    Math.random() * Math.PI * 2,
      spd:  Math.random() * 0.04 + 0.01,   // velocidade de piscar variada
      blink: Math.random() < 0.3,            // 30% piscam mais rápido
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.t += s.blink ? s.spd * 2.5 : s.spd;
        const alpha = (Math.sin(s.t) + 1) / 2;
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = s.blink
          ? alpha * 0.95 + 0.05          // piscantes: variação alta
          : alpha * 0.55 + 0.08;         // normais: brilho suave
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
        // cruz de brilho nas estrelas maiores quando estão no pico
        if (s.size === 2 && alpha > 0.8) {
          ctx.globalAlpha = (alpha - 0.8) * 3;
          ctx.fillRect(Math.floor(s.x) + 1, Math.floor(s.y) - 1, 1, 1);
          ctx.fillRect(Math.floor(s.x) + 1, Math.floor(s.y) + 2, 1, 1);
          ctx.fillRect(Math.floor(s.x) - 1, Math.floor(s.y) + 1, 1, 1);
          ctx.fillRect(Math.floor(s.x) + 3, Math.floor(s.y) + 1, 1, 1);
        }
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      const el = document.getElementById("pixel-stars");
      if (el) el.remove();
    };
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════════════
   WELCOME SCREEN — simple name entry
═══════════════════════════════════════════════════════════ */
function WelcomeScreen({ onStart }) {
  const [nome, setNome] = useState("");

  const iniciar = () => {
    if (!nome.trim()) return;
    onStart({ nome: nome.trim(), racaId: "elfo_noite", classeId: "druida", fotoUrl: null });
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"#06080f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <PixelStarField />
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", width:"100%", maxWidth:"480px", padding:"24px" }}>
        <div style={{ textAlign:"center", marginBottom:"40px" }}>
          <div style={{ fontSize:"9px", color:"#2a4880", letterSpacing:".3em", marginBottom:"12px" }}>✦ ✦ ✦</div>
          <div className="px-font" style={{ fontSize:"clamp(14px,3.5vw,24px)", color:"#f0c030", textShadow:"0 0 20px rgba(200,160,0,.7)", letterSpacing:".1em", animation:"pxGlow 2s ease-in-out infinite" }}>
            MYLOG RPG
          </div>
          <div className="px-font" style={{ fontSize:"6px", color:"#3060b8", marginTop:"10px", letterSpacing:".2em" }}>FIAP · QUEST TRACKER</div>
        </div>
        <div style={{ background:"#0c1630", border:"3px solid #c8a000", boxShadow:"0 0 0 1px #06080f, 0 0 0 4px #c8a00044, inset 0 0 0 2px #c8a00044, 0 0 30px #c8a00022", padding:"28px 40px", minWidth:"280px", width:"100%" }}>
          <div className="px-font" style={{ fontSize:"8px", color:"#f0c030", marginBottom:"16px", textAlign:"center" }}>✦ COMO DESEJA SER CHAMADO?</div>
          <input autoFocus className="px-input"
            style={{ marginBottom:"16px", fontSize:"22px", letterSpacing:".1em", textTransform:"uppercase", color:"#f0c030", borderColor:"#c8a000" }}
            placeholder="> SEU NOME..."
            maxLength={14}
            value={nome}
            onChange={e => setNome(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && iniciar()}
          />
          <button
            onClick={iniciar}
            disabled={!nome.trim()}
            style={{ width:"100%", padding:"16px", background:"linear-gradient(135deg,#201400,#3a2800)", border:"3px solid #c8a000", color: nome.trim()?"#f0c030":"#4a3000", fontFamily:"'Press Start 2P',monospace", fontSize:"9px", cursor: nome.trim()?"pointer":"not-allowed", boxShadow:"0 0 20px rgba(200,160,0,.3), 3px 3px 0 #4a3000", letterSpacing:".08em" }}>
            ⚔ COMEÇAR AVENTURA
          </button>
        </div>
        <div className="px-blink px-font" style={{ marginTop:"28px", fontSize:"6px", color:"#1e3060", letterSpacing:".15em" }}>🧝 ELFO DA NOITE · 🌿 DRUIDA</div>
      </div>
    </div>
  );

}

/* ═══════════════════════════════════════════════════════════
   PERSONAGEM MODAL — nome + foto apenas
═══════════════════════════════════════════════════════════ */
function PersonagemModal({ personagem, onSave, onClose }) {
  const [nome,   setNome]   = useState(personagem?.nome || "");
  const [fotoUrl, setFotoUrl] = useState(personagem?.fotoUrl || null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFotoUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"#06080fee", zIndex:800, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", backdropFilter:"blur(3px)" }}>
      <div style={{ width:"100%", maxWidth:"400px", background:"#0c1630", border:"3px solid #c8a000", boxShadow:"0 0 0 1px #06080f, 0 0 40px rgba(200,160,0,.25)" }}>
        <div style={{ padding:"14px 18px", borderBottom:"2px solid #1e3060", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div className="px-font" style={{ fontSize:"8px", color:"#f0c030" }}>✦ MEU PERSONAGEM</div>
          <button onClick={onClose} style={{ background:"none", border:"2px solid #1e3060", color:"#3060b8", fontFamily:"'Press Start 2P',monospace", fontSize:"8px", padding:"6px 10px", cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ padding:"20px" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:"20px", gap:"12px" }}>
            <CharacterPortrait fotoUrl={fotoUrl} size={120} />
            <button onClick={() => fileRef.current?.click()}
              style={{ padding:"8px 16px", background:"#0c1428", border:"2px solid #3060b8", color:"#4898f0", fontFamily:"'Press Start 2P',monospace", fontSize:"6px", cursor:"pointer" }}>
              📷 TROCAR FOTO
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
          </div>
          <div className="px-font" style={{ fontSize:"6px", color:"#3060b8", marginBottom:"8px", letterSpacing:".15em" }}>NOME DO HERÓI</div>
          <input className="px-input" maxLength={14}
            value={nome} onChange={e => setNome(e.target.value.toUpperCase())}
            placeholder="> SEU NOME..."
            style={{ fontSize:"20px", letterSpacing:".1em", textTransform:"uppercase", color:"#f0c030", borderColor:"#c8a000", marginBottom:"8px" }}
          />
          <div className="px-font" style={{ fontSize:"6px", color:"#1e3060", marginBottom:"20px" }}>🧝 ELFO DA NOITE · 🌿 DRUIDA</div>
        </div>
        <div style={{ padding:"14px 18px", borderTop:"2px solid #1e3060", display:"flex", gap:"10px" }}>
          <button onClick={() => nome.trim() && onSave({ ...personagem, nome: nome.trim(), fotoUrl })}
            disabled={!nome.trim()}
            style={{ flex:1, padding:"14px", background:"#201400", border:"3px solid #c8a000", color:nome.trim()?"#f0c030":"#4a3000", fontFamily:"'Press Start 2P',monospace", fontSize:"8px", cursor:nome.trim()?"pointer":"not-allowed", boxShadow:"3px 3px 0 #4a3000" }}>
            ✦ SALVAR
          </button>
          <button onClick={onClose} style={{ padding:"14px 18px", background:"#0c1428", border:"3px solid #1e3060", color:"#3060b8", fontFamily:"'Press Start 2P',monospace", fontSize:"8px", cursor:"pointer" }}>
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   RAÇAS E CLASSES — World of Warcraft inspired
═══════════════════════════════════════════════════════════ */
const RACAS = [
  { id:"humano",       nome:"Humano",             icone:"👤", fracao:"Aliança",  cor:"#c8d8f0", desc:"Versáteis e determinados. Bônus em aprendizado de todas as habilidades.", bonus:"✦ +10% XP em todas as áreas" },
  { id:"elfo_noite",   nome:"Elfo da Noite",       icone:"🧝‍♀️", fracao:"Aliança",  cor:"#8060c0", desc:"Ágeis e sábios, guardiões das florestas ancestrais.", bonus:"⚡ +Agilidade · +Furtividade" },
  { id:"anao",         nome:"Anão",                icone:"⛏️", fracao:"Aliança",  cor:"#a07840", desc:"Resistentes e determinados. Mestres da engenharia e da sobrevivência.", bonus:"🛡️ +Resistência · +Sorte" },
  { id:"gnomo",        nome:"Gnomo",               icone:"🔭", fracao:"Aliança",  cor:"#e090c0", desc:"Inventivos e brilhantes. Inteligência acima da média, baixa estatura.", bonus:"🧠 +Inteligência · +Tecnologia" },
  { id:"draenei",      nome:"Draenei",             icone:"💙", fracao:"Aliança",  cor:"#60b0e0", desc:"Seres de luz exilados. Sábios e conectados ao sagrado.", bonus:"✨ +Sabedoria · +Sagrado" },
  { id:"worgen",       nome:"Worgen",              icone:"🐺", fracao:"Aliança",  cor:"#808080", desc:"Humanos amaldiçoados com a forma do lobisomem. Ferocidade e controle.", bonus:"🐾 +Força · +Velocidade" },
  { id:"orc",          nome:"Orc",                 icone:"💪", fracao:"Horda",    cor:"#60a040", desc:"Guerreiros honrados da Horda. Força bruta e determinação inabalável.", bonus:"⚔️ +Força · +Resistência" },
  { id:"tauren",       nome:"Tauren",              icone:"🐂", fracao:"Horda",    cor:"#c07030", desc:"Guardiões da natureza. Imponentes e espirituais, ligados à terra.", bonus:"🌿 +Força · +Espírito da Natureza" },
  { id:"morto_vivo",   nome:"Morto-vivo",          icone:"💀", fracao:"Horda",    cor:"#90a070", desc:"Os Renegados. Libertos da Lich King, buscam sua própria vingança.", bonus:"☠️ +Resistência · +Magia Sombria" },
  { id:"elfo_sangue",  nome:"Elfo de Sangue",      icone:"🌹", fracao:"Horda",    cor:"#e04060", desc:"Elfos marcados pelo fel. Consumidos pelo arcano, elegantes e perigosos.", bonus:"🔮 +Inteligência · +Arcano" },
  { id:"troll",        nome:"Troll",               icone:"🌀", fracao:"Horda",    cor:"#40c0a0", desc:"Shamanistas instintivos. Regeneração acelerada e ligação com os espíritos.", bonus:"⚡ +Velocidade · +Regeneração" },
  { id:"pandaren",     nome:"Pandaren",            icone:"🐼", fracao:"Neutro",   cor:"#e0c080", desc:"Mestres do equilíbrio e da sabedoria. Nem Aliança nem Horda os definem.", bonus:"🍵 +Sabedoria · +Espírito" },
];

const CLASSES = [
  { id:"mago",           nome:"Mago",                icone:"🔥", cor:"#80b0ff", desc:"Mestre do arcano, gelo e fogo. Destrói com feitiços e controla batalhas.", atributo:"Inteligência" },
  { id:"guerreiro",      nome:"Guerreiro",            icone:"⚔️", cor:"#c0a060", desc:"O bastião da linha de frente. Absorve dano e protege os aliados com força bruta.", atributo:"Força" },
  { id:"druida",         nome:"Druida",               icone:"🌿", cor:"#40c060", desc:"Forma de animais, cura natural, equilíbrio entre ataque e suporte.", atributo:"Versatilidade" },
  { id:"ladino",         nome:"Ladino",               icone:"🗡️", cor:"#ffe060", desc:"Veloz e letal nas sombras. Golpes precisos e fuga quando necessário.", atributo:"Agilidade" },
  { id:"paladino",       nome:"Paladino",             icone:"🛡️", cor:"#f0d080", desc:"Guerreiro sagrado. Cura, tanque e dano em um só — o mais versátil da Aliança.", atributo:"Força + Sagrado" },
  { id:"cacador",        nome:"Caçador",              icone:"🏹", cor:"#80c040", desc:"Arqueiro e mestre de animais selvagens. Dano à distância incomparável.", atributo:"Agilidade + Precisão" },
  { id:"xama",           nome:"Xamã",                 icone:"⚡", cor:"#4898f0", desc:"Chama os elementos: terra, fogo, água, ar. Cura, dano e suporte elemental.", atributo:"Espírito" },
  { id:"sacerdote",      nome:"Sacerdote",            icone:"✨", cor:"#e0e8ff", desc:"Curandeiro sagrado ou mestre das sombras. Dois caminhos, um poder enorme.", atributo:"Espírito + Inteligência" },
  { id:"bruxo",          nome:"Bruxo",                icone:"👁️", cor:"#a060e0", desc:"Conjura demônios e usa magia proibida. Drena vida, espalha maldições.", atributo:"Inteligência Sombria" },
  { id:"monge",          nome:"Monge",                icone:"👊", cor:"#40c0c0", desc:"Mestre das artes marciais e do chi. Equilibra ataque, cura e mobilidade.", atributo:"Agilidade + Chi" },
  { id:"cav_morte",      nome:"Cavaleiro da Morte",   icone:"☠️", cor:"#8090b0", desc:"Ex-servos da Lich King. Usam runas e morte para devastar inimigos.", atributo:"Força + Runa" },
  { id:"cac_demonios",   nome:"Caçador de Demônios",  icone:"😈", cor:"#c040e0", desc:"Consumiram energia demoníaca para combatê-la. Ágeis e implacáveis.", atributo:"Agilidade + Fel" },
  { id:"evocador",       nome:"Evocador",             icone:"🐉", cor:"#40e0a0", desc:"Meio-dragão descendente dos Dracthyr. Controla magia dracônica.", atributo:"Inteligência Dracônica" },
];


/* DAILY QUEST DEFAULTS */
const DAILY_QUEST_DEFAULTS = [
  { id:"dq_estudar",   title:"Estudar 20 minutos",  category:"estudos",  xp:30, icon:"📚" },
  { id:"dq_exercitar", title:"Ir para a academia",   category:"saude",    xp:40, icon:"💪" },
  { id:"dq_casa",      title:"Arrumar o quarto",     category:"pessoal",  xp:20, icon:"🧹" },
  { id:"dq_agua",      title:"Beber 2L de água",     category:"saude",    xp:20, icon:"💧" },
  { id:"dq_ler",       title:"Ler por 15 minutos",   category:"leitura",  xp:25, icon:"📖" },
];

/* ═══════════════════════════════════════════════════════════
   THEMES — Visual palettes
═══════════════════════════════════════════════════════════ */
const THEMES = [
  { id:"arcane",       label:"ARCANO",         icon:"🔮", desc:"WoW Clássico · Azul & Ouro",       bg:"#06080f", headerBg:"#080c1a" },
  { id:"darkfantasy",  label:"DARK FANTASY",   icon:"⚔️", desc:"Berserk · Eclipse · Carmesim & Negro",    bg:"#080000", headerBg:"#0a0100" },
  { id:"cyberpunk",    label:"CYBER PUNK",     icon:"🔫", desc:"Night City · CP2077 · Amarelo & Ciano",  bg:"#020308", headerBg:"#010206" },
  { id:"fantasia",     label:"FANTASIA",       icon:"🌿", desc:"Floresta Mágica · Verde & Bronze", bg:"#040e04", headerBg:"#030c03" },
  { id:"finalfantasy", label:"FINAL FANTASY",  icon:"💎", desc:"Cristal Eterno · Safira & Prata",  bg:"#030815", headerBg:"#040a18" },
  { id:"stardew",      label:"STARDEW VALLEY", icon:"🌾", desc:"Fazenda Aconchegante · Marrom",    bg:"#1a1008", headerBg:"#160e04" },
];

/* ═══════════════════════════════════════════════════════════
   THEME ICONS — ícones únicos por tema
═══════════════════════════════════════════════════════════ */
const THEME_ICONS = {
  arcane: {
    soundStyle: "rpg",
    tabs:      { hall:"⚔", diary:"📖", quests:"📜", goals:"🏆", calendar:"📅", notes:"📚", skilltree:"🌳", oracle:"🔮", album:"📸", raid:"⚔" },
    deco:      "✦",
    dungeon:   "🏰",
    companion: "🧙",
    character: "🧝",
    questTypes:{ lendaria:"👑", epica:"💜", normal:"🔵", secundaria:"🌿" },
    guilds:    { leitura:"📚", estudos:"🎓", saude:"🌿", financeiro:"💰", pessoal:"⭐", trabalho:"🛡️" },
    stats:     { diary:"📖", quests:"⚔️", overdue:"☠️", goals:"🏆" },
  },
  darkfantasy: {
    /* ── BERSERK: Guts · Dragon Slayer · Eclipse · Godhand ── */
    soundStyle: "dark",
    tabs:      { hall:"⚔️", diary:"🩸", quests:"💀", goals:"🔥", calendar:"🌑", notes:"📜", skilltree:"🐺", oracle:"👁️", album:"🖼️", raid:"⛧" },
    deco:      "✠",
    dungeon:   "🌑",
    companion: "🧙‍♀️",
    character: "⚔️",
    questTypes:{ lendaria:"🔥", epica:"💀", normal:"🩸", secundaria:"⚔️" },
    guilds:    { leitura:"📜", estudos:"🔥", saude:"🩸", financeiro:"⚰️", pessoal:"🌑", trabalho:"⚔️" },
    stats:     { diary:"🩸", quests:"⚔️", overdue:"⛧", goals:"🔥" },
  },
  cyberpunk: {
    /* ── CYBERPUNK 2077: V · Night City · Arasaka · Johnny Silverhand ── */
    soundStyle: "cyber",
    tabs:      { hall:"🔫", diary:"💿", quests:"⚡", goals:"🏙️", calendar:"📆", notes:"🧠", skilltree:"🔌", oracle:"👁️", album:"📷", raid:"💀" },
    deco:      "◈",
    dungeon:   "🏙️",
    companion: "💀",
    character: "🔫",
    questTypes:{ lendaria:"💥", epica:"⚡", normal:"🔵", secundaria:"💚" },
    guilds:    { leitura:"💾", estudos:"🧠", saude:"💊", financeiro:"💳", pessoal:"🎸", trabalho:"🔧" },
    stats:     { diary:"💿", quests:"⚡", overdue:"⚠️", goals:"🏙️" },
  },
  fantasia: {
    soundStyle: "nature",
    tabs:      { hall:"🌿", diary:"🍃", quests:"🌱", goals:"🌸", calendar:"🌻", notes:"📜", skilltree:"🌲", oracle:"🧚", album:"🦋", raid:"🐉" },
    deco:      "✿",
    dungeon:   "🌲",
    companion: "🧙‍♀️",
    character: "🧚",
    questTypes:{ lendaria:"🌸", epica:"🍄", normal:"🌿", secundaria:"🌱" },
    guilds:    { leitura:"📜", estudos:"🧪", saude:"🍃", financeiro:"🌰", pessoal:"🦋", trabalho:"⚒️" },
    stats:     { diary:"🍃", quests:"🗡️", overdue:"🥀", goals:"🌸" },
  },
  finalfantasy: {
    soundStyle: "crystal",
    tabs:      { hall:"⚔️", diary:"📔", quests:"🗡️", goals:"💎", calendar:"🗓️", notes:"📖", skilltree:"💠", oracle:"🔷", album:"🖼️", raid:"🐲" },
    deco:      "◆",
    dungeon:   "🗼",
    companion: "🧙‍♂️",
    character: "🧝‍♂️",
    questTypes:{ lendaria:"💎", epica:"🔷", normal:"💙", secundaria:"🌀" },
    guilds:    { leitura:"📖", estudos:"🔷", saude:"💊", financeiro:"💰", pessoal:"💎", trabalho:"🛡️" },
    stats:     { diary:"📔", quests:"⚔️", overdue:"💔", goals:"💎" },
  },
  stardew: {
    soundStyle: "cozy",
    tabs:      { hall:"🏡", diary:"📝", quests:"🌾", goals:"🌻", calendar:"📅", notes:"🗒️", skilltree:"🌱", oracle:"🌙", album:"📷", raid:"🐄" },
    deco:      "✿",
    dungeon:   "⛏️",
    companion: "🐱",
    character: "👨‍🌾",
    questTypes:{ lendaria:"🌟", epica:"🌻", normal:"🌾", secundaria:"🌱" },
    guilds:    { leitura:"📚", estudos:"🔬", saude:"🥕", financeiro:"💰", pessoal:"🏡", trabalho:"🪓" },
    stats:     { diary:"📝", quests:"🌾", overdue:"🌧️", goals:"🌻" },
  },
};

const ThemeContext = createContext(THEME_ICONS.arcane);

/* ═══════════════════════════════════════════════════════════
   RAID FINAL — META SEMESTRAL (defaults)
═══════════════════════════════════════════════════════════ */
const RAID_DEFAULTS = {
  titulo: "RAID FINAL — SEMESTRE ÉPICO",
  deadline: "",
  objetivos: [
    { id:"r1", titulo:"Concluir todas as matérias do semestre",  xp:500, done:false },
    { id:"r2", titulo:"Zero faltas em todas as aulas",           xp:300, done:false },
    { id:"r3", titulo:"Média acima de 7 em todas as provas",     xp:400, done:false },
    { id:"r4", titulo:"Entregar todos os projetos no prazo",     xp:350, done:false },
    { id:"r5", titulo:"Completar a Árvore de Habilidades FIAP",  xp:600, done:false },
  ],
};

/* ═══════════════════════════════════════════════════════════
   RPG NOTIFICATIONS — mensagens do reino
═══════════════════════════════════════════════════════════ */
const RPG_NOTIF_MSGS = [
  "⚔ Seu reino precisa de você, herói!",
  "🐉 Um boss apareceu — complete suas quests!",
  "🔮 O Oráculo aguarda sua consulta...",
  "📖 A crônica de hoje ainda está em branco!",
  "⭐ Suas façanhas estão esquecidas, aventureiro!",
  "💀 Quests atrasadas drenando sua vida...",
  "🧙 Ignis o aguarda para uma sessão de estudos!",
  "🏆 O RAID FINAL se aproxima — esteja preparado!",
  "⚡ Que a magia do conhecimento guie seus passos!",
  "🛡️ Guerreiro, não abandone sua jornada hoje!",
  "🌟 O nível seguinte está ao seu alcance!",
  "🌿 A guilda convoca seus membros para batalha!",
];

/* ═══════════════════════════════════════════════════════════
   PIXEL BAR — segmented like classic RPG HP bars
═══════════════════════════════════════════════════════════ */
function PixelBar({ value, max = 100, color = "#39ff14", segments = 24 }) {
  const filled = Math.round((Math.min(value, max) / max) * segments);
  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {Array.from({ length: segments }, (_, i) => (
        <div key={i} style={{
          width: "8px", height: "10px",
          background: i < filled ? color : "#0a1840",
          border: `1px solid ${i < filled ? color + "88" : "#071020"}`,
          imageRendering: "pixelated",
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CHARACTER PORTRAIT — real photo display
═══════════════════════════════════════════════════════════ */
function CharacterPortrait({ fotoUrl, size = 64 }) {
  const icons = useContext(ThemeContext);
  return (
    <div style={{
      width: size, height: size,
      border: "3px solid #c8a000",
      boxShadow: "0 0 0 1px #06080f, 0 0 16px rgba(200,160,0,.4)",
      overflow: "hidden",
      flexShrink: 0,
      background: "#0c1630",
      position: "relative",
    }}>
      {fotoUrl ? (
        <img src={fotoUrl} alt="personagem" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
      ) : (
        <div style={{
          width:"100%", height:"100%",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize: Math.round(size * 0.55) + "px",
          background: "linear-gradient(135deg,#0a1428,#1a2848)",
        }}>{icons.character}</div>
      )}
    </div>
  );
}



/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES — PIXEL 16-BIT ARCANE
═══════════════════════════════════════════════════════════ */
function usePixelStyles() {
  useEffect(() => {
    if (document.getElementById("pixel-arcane-styles")) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.id = "pixel-arcane-styles";
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; image-rendering: pixelated; }
      html, body { margin: 0; padding: 0; background: #06080f; }

      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #080c1a; border-left: 2px solid #1a2860; }
      ::-webkit-scrollbar-thumb { background: #2a4a90; border: 2px solid #06080f; }
      ::-webkit-scrollbar-thumb:hover { background: #80b4ff; }

      .px-font   { font-family: 'Press Start 2P', monospace; }
      .px-body   { font-family: 'VT323', monospace; letter-spacing: 0.02em; }

      /* ══════════════════════════════════════════
         FF WINDOW — classic Final Fantasy panel
      ══════════════════════════════════════════ */
      .px-panel {
        position: relative;
        background: #0c1630;
        border: 3px solid #3060b8;
        box-shadow:
          0 0 0 1px #06080f,
          0 0 0 4px #1a3870,
          inset 0 0 0 2px #1e3e80,
          0 0 16px rgba(48,96,184,0.15);
        padding: 20px;
        margin-bottom: 16px;
        border-radius: 0;
      }

      /* ── GOLD HERO PANEL ── */
      .px-panel-hero {
        position: relative;
        background: #100e00;
        border: 3px solid #c8a000;
        box-shadow:
          0 0 0 1px #06080f,
          0 0 0 4px #4a3800,
          inset 0 0 0 2px #8a6800,
          0 0 20px rgba(200,160,0,0.18),
          0 0 40px rgba(200,160,0,0.06);
        padding: 20px;
        margin-bottom: 16px;
        border-radius: 0;
      }

      /* ── CRYSTAL PANEL (antigo arcane) ── */
      .px-panel-arcane {
        position: relative;
        background: #081428;
        border: 3px solid #4898f0;
        box-shadow:
          0 0 0 1px #06080f,
          0 0 0 4px #0e2860,
          inset 0 0 0 2px #1a4898,
          0 0 20px rgba(72,152,240,0.15),
          0 0 40px rgba(72,152,240,0.06);
        padding: 20px;
        margin-bottom: 16px;
        border-radius: 0;
      }

      /* FF corner gems — diamond pixel */
      .px-panel::before, .px-panel-hero::before, .px-panel-arcane::before {
        content: '';
        position: absolute;
        top: -5px; left: -5px;
        width: 7px; height: 7px;
        background: #3060b8;
        border: 2px solid #80b4ff;
        z-index: 2;
        transform: rotate(45deg);
      }
      .px-panel::after, .px-panel-hero::after, .px-panel-arcane::after {
        content: '';
        position: absolute;
        bottom: -5px; right: -5px;
        width: 7px; height: 7px;
        background: #3060b8;
        border: 2px solid #80b4ff;
        z-index: 2;
        transform: rotate(45deg);
      }
      .px-panel-hero::before, .px-panel-hero::after {
        background: #c8a000;
        border-color: #ffe060;
      }
      .px-panel-arcane::before, .px-panel-arcane::after {
        background: #4898f0;
        border-color: #a0d0ff;
      }

      /* ── BUTTONS ── */
      .px-btn {
        cursor: pointer;
        font-family: 'Press Start 2P', monospace;
        font-size: 8px;
        letter-spacing: 0.05em;
        border: none;
        border-radius: 0;
        padding: 10px 14px;
        transition: filter 0.1s, transform 0.1s;
        text-transform: uppercase;
        position: relative;
        image-rendering: pixelated;
      }
      .px-btn:hover  { filter: brightness(1.3); transform: translateY(-1px); }
      .px-btn:active { transform: translateY(1px); filter: brightness(0.85); }

      .px-btn-cyan {
        background: #0e2050;
        color: #80b4ff;
        border: 3px solid #4080d0;
        box-shadow: 3px 3px 0 #061030, inset 1px 1px 0 #4080d044;
      }
      .px-btn-gold {
        background: #201400;
        color: #f0c030;
        border: 3px solid #c8a000;
        box-shadow: 3px 3px 0 #4a3000, inset 1px 1px 0 #c8a00044;
      }
      .px-btn-purple {
        background: #081428;
        color: #a0c8ff;
        border: 3px solid #4898f0;
        box-shadow: 3px 3px 0 #0a1840, inset 1px 1px 0 #4898f044;
      }
      .px-btn-ghost {
        background: #0c1428;
        color: #6898c8;
        border: 3px solid #1e3060;
        box-shadow: 3px 3px 0 #060c18;
      }
      .px-btn-danger {
        background: #1a0808;
        color: #e04040;
        border: 3px solid #c03030;
        box-shadow: 3px 3px 0 #500000;
      }

      /* ── INPUTS ── */
      .px-input {
        width: 100%; background: #080e20;
        border: 2px solid #1e3870;
        border-radius: 0; color: #e0eeff;
        font-family: 'VT323', monospace;
        font-size: 18px; padding: 8px 12px;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        box-shadow: inset 2px 2px 0 #04080f;
      }
      .px-input:focus {
        border-color: #4898f0;
        box-shadow: inset 2px 2px 0 #04080f, 0 0 0 2px rgba(72,152,240,.25);
      }
      .px-input::placeholder { color: #1e3860; }

      .px-textarea {
        width: 100%; background: #080e20;
        border: 2px solid #1e3870;
        border-radius: 0; color: #e0eeff;
        font-family: 'VT323', monospace;
        font-size: 18px; padding: 10px 12px;
        resize: vertical; min-height: 120px; line-height: 1.6;
        outline: none;
        transition: border-color .15s;
        box-shadow: inset 2px 2px 0 #04080f;
      }
      .px-textarea:focus {
        border-color: #4898f0;
        box-shadow: inset 2px 2px 0 #04080f, 0 0 0 2px rgba(72,152,240,.25);
      }
      .px-textarea::placeholder { color: #1e3860; }

      select.px-input option { background: #080e20; color: #e0eeff; }

      /* ── NAV FF-style ── */
      .px-nav-btn {
        padding: 12px 16px;
        border: none; border-bottom: 3px solid transparent;
        background: none; cursor: pointer;
        font-family: 'Press Start 2P', monospace;
        font-size: 7px; letter-spacing: 0.05em;
        white-space: nowrap; text-transform: uppercase;
        transition: color .15s, border-color .15s, background .15s;
        color: #2a4880;
      }
      .px-nav-btn:hover { color: #80b4ff; background: rgba(48,96,184,.08); }
      .px-nav-btn.active {
        color: #f0c030 !important;
        border-bottom-color: #c8a000;
        background: rgba(200,160,0,.08);
        text-shadow: 0 0 10px rgba(200,160,0,0.6), 0 0 20px rgba(200,160,0,0.2);
      }

      /* ── BADGE ── */
      .px-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 2px 8px; border-radius: 0;
        font-family: 'Press Start 2P', monospace;
        font-size: 7px; letter-spacing: 0.04em;
        border: 2px solid;
      }

      /* ── DIVIDER ── */
      .px-divider {
        border: none; height: 2px;
        background: linear-gradient(90deg, transparent, #1e3870 20%, #3060b844 50%, #1e3870 80%, transparent);
        margin: 14px 0;
      }

      /* ── ANIMATIONS ── */
      @keyframes pxBlink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
      @keyframes pxGlow  { 0%,100%{text-shadow:0 0 8px #c8a00066} 50%{text-shadow:0 0 18px #f0c030cc, 0 0 30px #c8a00044} }
      @keyframes pxFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      @keyframes pxScan  {
        0%   { background-position: 0 -100%; }
        100% { background-position: 0 100%; }
      }
      @keyframes pxPulse { 0%,100%{opacity:.7} 50%{opacity:1} }

      .px-blink   { animation: pxBlink 1s step-end infinite; }
      .px-glow-cx { animation: pxGlow 2s ease-in-out infinite; }
      .px-float   { animation: pxFloat 2.5s ease-in-out infinite; }

      /* ── Scan line overlay for CRT feel ── */
      .px-crt::after {
        content: '';
        position: fixed; inset: 0;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 3px,
          rgba(0,0,0,0.06) 3px,
          rgba(0,0,0,0.06) 4px
        );
        pointer-events: none;
        z-index: 999;
      }

      /* ── Quest row hover ── */
      .px-quest:hover {
        border-color: #00d4ff !important;
        box-shadow: 0 0 8px rgba(0,212,255,0.2) !important;
      }

      /* ══════════════════════════════════════════════
         THEME: DARK FANTASY — Berserk · Eclipse · Dragon Slayer
      ══════════════════════════════════════════════ */
      [data-theme="darkfantasy"] .px-panel {
        background: #120000; border-color: #8b0000;
        box-shadow: 0 0 0 1px #080000, 0 0 0 4px #3a0000, inset 0 0 0 2px #5a0000, 0 0 16px rgba(139,0,0,0.2);
      }
      [data-theme="darkfantasy"] .px-panel::before,
      [data-theme="darkfantasy"] .px-panel::after { background:#8b0000; border-color:#ff2200; }
      [data-theme="darkfantasy"] .px-panel-hero {
        background: #1a0000; border-color: #cc2200;
        box-shadow: 0 0 0 1px #080000, 0 0 0 4px #5a0a00, inset 0 0 0 2px #aa1500, 0 0 24px rgba(204,34,0,0.25);
      }
      [data-theme="darkfantasy"] .px-panel-hero::before,
      [data-theme="darkfantasy"] .px-panel-hero::after { background:#cc2200; border-color:#ff5500; }
      [data-theme="darkfantasy"] .px-panel-arcane {
        background: #100500; border-color: #7a1800;
        box-shadow: 0 0 0 1px #080000, 0 0 0 4px #3a0800, inset 0 0 0 2px #601000, 0 0 20px rgba(122,24,0,0.18);
      }
      [data-theme="darkfantasy"] .px-panel-arcane::before,
      [data-theme="darkfantasy"] .px-panel-arcane::after { background:#7a1800; border-color:#ff4400; }
      [data-theme="darkfantasy"] ::-webkit-scrollbar-thumb { background:#8b0000; }
      [data-theme="darkfantasy"] ::-webkit-scrollbar-track { background:#080000; border-left-color:#3a0000; }
      [data-theme="darkfantasy"] .px-nav-btn { color:#3a1000; }
      [data-theme="darkfantasy"] .px-nav-btn:hover { color:#ff3300; background:rgba(204,34,0,.10); }
      [data-theme="darkfantasy"] .px-nav-btn.active { color:#ff5500 !important; border-bottom-color:#cc2200; background:rgba(204,34,0,.10); text-shadow:0 0 12px rgba(255,80,0,0.8); }
      [data-theme="darkfantasy"] .px-btn-cyan { background:#180000; color:#ff5500; border-color:#8b0000; box-shadow:3px 3px 0 #0a0000; }
      [data-theme="darkfantasy"] .px-btn-gold { background:#1a0500; color:#ff8040; border-color:#cc2200; box-shadow:3px 3px 0 #5a0a00; }
      [data-theme="darkfantasy"] .px-input { background:#0a0000; border-color:#3a0000; }
      [data-theme="darkfantasy"] .px-input:focus { border-color:#8b0000; box-shadow:inset 2px 2px 0 #060000, 0 0 0 2px rgba(139,0,0,.30); }
      [data-theme="darkfantasy"] .px-textarea { background:#0a0000; border-color:#3a0000; }
      [data-theme="darkfantasy"] .px-quest:hover { border-color:#cc2200 !important; box-shadow:0 0 10px rgba(204,34,0,0.3) !important; }

      /* ══════════════════════════════════════════════
         THEME: CYBER PUNK — Night City · CP2077
         Primário: Amarelo elétrico #f0d000
         Secundário: Ciano #00e5ff
      ══════════════════════════════════════════════ */
      [data-theme="cyberpunk"] .px-panel {
        background: #0a0800; border-color: #a08000;
        box-shadow: 0 0 0 1px #020308, 0 0 0 4px #403000, inset 0 0 0 2px #706000, 0 0 16px rgba(200,160,0,0.15);
      }
      [data-theme="cyberpunk"] .px-panel::before,
      [data-theme="cyberpunk"] .px-panel::after { background:#a08000; border-color:#f0d000; }
      [data-theme="cyberpunk"] .px-panel-hero {
        background: #020810; border-color: #00c8e0;
        box-shadow: 0 0 0 1px #020308, 0 0 0 4px #003a40, inset 0 0 0 2px #0090a8, 0 0 20px rgba(0,200,224,0.2);
      }
      [data-theme="cyberpunk"] .px-panel-hero::before,
      [data-theme="cyberpunk"] .px-panel-hero::after { background:#00c8e0; border-color:#80eeff; }
      [data-theme="cyberpunk"] .px-panel-arcane {
        background: #080600; border-color: #f0d000;
        box-shadow: 0 0 0 1px #020308, 0 0 0 4px #604800, inset 0 0 0 2px #907000, 0 0 20px rgba(240,208,0,0.18);
      }
      [data-theme="cyberpunk"] .px-panel-arcane::before,
      [data-theme="cyberpunk"] .px-panel-arcane::after { background:#f0d000; border-color:#fff080; }
      [data-theme="cyberpunk"] ::-webkit-scrollbar-thumb { background:#a08000; }
      [data-theme="cyberpunk"] ::-webkit-scrollbar-track { background:#020308; border-left-color:#403000; }
      [data-theme="cyberpunk"] .px-nav-btn { color:#302800; }
      [data-theme="cyberpunk"] .px-nav-btn:hover { color:#f0d000; background:rgba(240,208,0,.08); }
      [data-theme="cyberpunk"] .px-nav-btn.active { color:#f0d000 !important; border-bottom-color:#f0d000; background:rgba(240,208,0,.10); text-shadow:0 0 10px rgba(240,208,0,0.8); }
      [data-theme="cyberpunk"] .px-btn-cyan { background:#050400; color:#f0d000; border-color:#a08000; box-shadow:3px 3px 0 #1a1400; }
      [data-theme="cyberpunk"] .px-btn-gold { background:#020810; color:#00e5ff; border-color:#00c8e0; box-shadow:3px 3px 0 #003040; }
      [data-theme="cyberpunk"] .px-input { background:#020308; border-color:#403000; color:#f0e8a0; }
      [data-theme="cyberpunk"] .px-input:focus { border-color:#f0d000; box-shadow:inset 2px 2px 0 #010204, 0 0 0 2px rgba(240,208,0,.25); }
      [data-theme="cyberpunk"] .px-textarea { background:#020308; border-color:#403000; color:#f0e8a0; }
      [data-theme="cyberpunk"] .px-quest:hover { border-color:#f0d000 !important; box-shadow:0 0 10px rgba(240,208,0,0.25) !important; }

      /* ══════════════════════════════════════════════
         THEME: FANTASIA — Floresta Mágica
      ══════════════════════════════════════════════ */
      [data-theme="fantasia"] .px-panel {
        background: #081408; border-color: #2a7020;
        box-shadow: 0 0 0 1px #040e04, 0 0 0 4px #103810, inset 0 0 0 2px #1a5018, 0 0 16px rgba(42,112,32,0.15);
      }
      [data-theme="fantasia"] .px-panel::before,
      [data-theme="fantasia"] .px-panel::after { background:#2a7020; border-color:#60c050; }
      [data-theme="fantasia"] .px-panel-hero {
        background: #0a1808; border-color: #8a6020;
        box-shadow: 0 0 0 1px #040e04, 0 0 0 4px #3a2808, inset 0 0 0 2px #6a4818, 0 0 20px rgba(138,96,32,0.18);
      }
      [data-theme="fantasia"] .px-panel-hero::before,
      [data-theme="fantasia"] .px-panel-hero::after { background:#8a6020; border-color:#d4a040; }
      [data-theme="fantasia"] .px-panel-arcane {
        background: #060e18; border-color: #2a5090;
        box-shadow: 0 0 0 1px #040e04, 0 0 0 4px #0e2850, inset 0 0 0 2px #1a4070, 0 0 20px rgba(42,80,144,0.15);
      }
      [data-theme="fantasia"] .px-panel-arcane::before,
      [data-theme="fantasia"] .px-panel-arcane::after { background:#2a5090; border-color:#6090d0; }
      [data-theme="fantasia"] ::-webkit-scrollbar-thumb { background:#2a7020; }
      [data-theme="fantasia"] ::-webkit-scrollbar-track { background:#040e04; border-left-color:#103810; }
      [data-theme="fantasia"] .px-nav-btn { color:#102808; }
      [data-theme="fantasia"] .px-nav-btn:hover { color:#40c040; background:rgba(42,112,32,.08); }
      [data-theme="fantasia"] .px-nav-btn.active { color:#c8a040 !important; border-bottom-color:#8a6020; background:rgba(138,96,32,.08); text-shadow:0 0 10px rgba(138,96,32,0.6); }
      [data-theme="fantasia"] .px-btn-cyan { background:#040e04; color:#60c050; border-color:#2a7020; box-shadow:3px 3px 0 #020804; }
      [data-theme="fantasia"] .px-btn-gold { background:#0a1808; color:#c8a040; border-color:#8a6020; box-shadow:3px 3px 0 #3a2808; }
      [data-theme="fantasia"] .px-input { background:#040e04; border-color:#103810; color:#d8ecd0; }
      [data-theme="fantasia"] .px-input:focus { border-color:#2a7020; box-shadow:inset 2px 2px 0 #020804, 0 0 0 2px rgba(42,112,32,.25); }
      [data-theme="fantasia"] .px-textarea { background:#040e04; border-color:#103810; color:#d8ecd0; }
      [data-theme="fantasia"] .px-quest:hover { border-color:#8a6020 !important; box-shadow:0 0 8px rgba(138,96,32,0.2) !important; }

      /* ══════════════════════════════════════════════
         THEME: FINAL FANTASY — Cristal Eterno
      ══════════════════════════════════════════════ */
      [data-theme="finalfantasy"] .px-panel {
        background: #06102a; border-color: #1840a0;
        box-shadow: 0 0 0 1px #030815, 0 0 0 4px #0a2060, inset 0 0 0 2px #1230a0, 0 0 16px rgba(24,64,160,0.18);
      }
      [data-theme="finalfantasy"] .px-panel::before,
      [data-theme="finalfantasy"] .px-panel::after { background:#1840a0; border-color:#80b0ff; }
      [data-theme="finalfantasy"] .px-panel-hero {
        background: #080620; border-color: #8098e0;
        box-shadow: 0 0 0 1px #030815, 0 0 0 4px #3040a0, inset 0 0 0 2px #6078c0, 0 0 20px rgba(128,152,224,0.2);
      }
      [data-theme="finalfantasy"] .px-panel-hero::before,
      [data-theme="finalfantasy"] .px-panel-hero::after { background:#8098e0; border-color:#c0d0ff; }
      [data-theme="finalfantasy"] .px-panel-arcane {
        background: #050820; border-color: #4080ff;
        box-shadow: 0 0 0 1px #030815, 0 0 0 4px #1030a0, inset 0 0 0 2px #2060e0, 0 0 20px rgba(64,128,255,0.15);
      }
      [data-theme="finalfantasy"] .px-panel-arcane::before,
      [data-theme="finalfantasy"] .px-panel-arcane::after { background:#4080ff; border-color:#a0c0ff; }
      [data-theme="finalfantasy"] ::-webkit-scrollbar-thumb { background:#1840a0; }
      [data-theme="finalfantasy"] ::-webkit-scrollbar-track { background:#030815; border-left-color:#0a2060; }
      [data-theme="finalfantasy"] .px-nav-btn { color:#102050; }
      [data-theme="finalfantasy"] .px-nav-btn:hover { color:#6090e0; background:rgba(24,64,160,.08); }
      [data-theme="finalfantasy"] .px-nav-btn.active { color:#c0d4ff !important; border-bottom-color:#8098e0; background:rgba(128,152,224,.08); text-shadow:0 0 10px rgba(128,152,224,0.5); }
      [data-theme="finalfantasy"] .px-btn-cyan { background:#06102a; color:#80b0ff; border-color:#1840a0; box-shadow:3px 3px 0 #030815; }
      [data-theme="finalfantasy"] .px-btn-gold { background:#080620; color:#c0d4ff; border-color:#8098e0; box-shadow:3px 3px 0 #3040a0; }
      [data-theme="finalfantasy"] .px-input { background:#030815; border-color:#0a2060; color:#d0e8ff; }
      [data-theme="finalfantasy"] .px-input:focus { border-color:#4080ff; box-shadow:inset 2px 2px 0 #020510, 0 0 0 2px rgba(64,128,255,.25); }
      [data-theme="finalfantasy"] .px-textarea { background:#030815; border-color:#0a2060; color:#d0e8ff; }
      [data-theme="finalfantasy"] .px-quest:hover { border-color:#4080ff !important; box-shadow:0 0 8px rgba(64,128,255,0.2) !important; }

      /* ══════════════════════════════════════════════
         THEME: STARDEW VALLEY — Fazenda Aconchegante
      ══════════════════════════════════════════════ */
      [data-theme="stardew"] .px-panel {
        background: #241a0c; border-color: #6a5030;
        box-shadow: 0 0 0 1px #1a1008, 0 0 0 4px #3a2808, inset 0 0 0 2px #5a4020, 0 0 16px rgba(106,80,48,0.15);
      }
      [data-theme="stardew"] .px-panel::before,
      [data-theme="stardew"] .px-panel::after { background:#6a5030; border-color:#c8a060; }
      [data-theme="stardew"] .px-panel-hero {
        background: #201404; border-color: #c89040;
        box-shadow: 0 0 0 1px #1a1008, 0 0 0 4px #6a4808, inset 0 0 0 2px #a07828, 0 0 20px rgba(200,144,64,0.18);
      }
      [data-theme="stardew"] .px-panel-hero::before,
      [data-theme="stardew"] .px-panel-hero::after { background:#c89040; border-color:#e8c880; }
      [data-theme="stardew"] .px-panel-arcane {
        background: #1e1820; border-color: #806040;
        box-shadow: 0 0 0 1px #1a1008, 0 0 0 4px #3a2818, inset 0 0 0 2px #604830, 0 0 20px rgba(128,96,64,0.15);
      }
      [data-theme="stardew"] .px-panel-arcane::before,
      [data-theme="stardew"] .px-panel-arcane::after { background:#806040; border-color:#c0a070; }
      [data-theme="stardew"] ::-webkit-scrollbar-thumb { background:#6a5030; }
      [data-theme="stardew"] ::-webkit-scrollbar-track { background:#1a1008; border-left-color:#3a2808; }
      [data-theme="stardew"] .px-nav-btn { color:#3a2808; }
      [data-theme="stardew"] .px-nav-btn:hover { color:#c89040; background:rgba(200,144,64,.08); }
      [data-theme="stardew"] .px-nav-btn.active { color:#e8c060 !important; border-bottom-color:#c89040; background:rgba(200,144,64,.08); text-shadow:0 0 10px rgba(200,144,64,0.5); }
      [data-theme="stardew"] .px-btn-cyan { background:#241a0c; color:#c89040; border-color:#6a5030; box-shadow:3px 3px 0 #0a0804; }
      [data-theme="stardew"] .px-btn-gold { background:#201404; color:#e8c060; border-color:#c89040; box-shadow:3px 3px 0 #6a4808; }
      [data-theme="stardew"] .px-input { background:#1a1008; border-color:#3a2808; color:#f0e8d0; }
      [data-theme="stardew"] .px-input:focus { border-color:#c89040; box-shadow:inset 2px 2px 0 #0e0c04, 0 0 0 2px rgba(200,144,64,.25); }
      [data-theme="stardew"] .px-textarea { background:#1a1008; border-color:#3a2808; color:#f0e8d0; }
      [data-theme="stardew"] .px-quest:hover { border-color:#c89040 !important; box-shadow:0 0 8px rgba(200,144,64,0.2) !important; }

      /* ── Dungeon Mode animation ── */
      @keyframes dungeonPulse { 0%,100%{opacity:.6} 50%{opacity:1} }
      @keyframes toastSlide { from{transform:translateX(120%);opacity:0} to{transform:translateX(0);opacity:1} }
    `;
    document.head.appendChild(style);
  }, []);
}

/* ═══════════════════════════════════════════════════════════
   SOUND SYSTEM — Web Audio API 8-bit
═══════════════════════════════════════════════════════════ */
const fireSound = (sound) =>
  window.dispatchEvent(new CustomEvent("rpg-sound", { detail: sound }));

/* Perfis de som por tema — frequências, ondas e escalas */
const SOUND_PROFILES = {
  rpg:     { wave:"square",   base:440, scale:[1,1.25,1.5,2],     clickFreq:520,  clickDur:0.05 },
  dark:    { wave:"sawtooth", base:110, scale:[1,1.19,1.33,1.5],  clickFreq:130,  clickDur:0.12 }, /* Berserk — ominoso, grave, lento */
  cyber:   { wave:"square",   base:660, scale:[1,1.5,2,2.67],     clickFreq:720,  clickDur:0.03 }, /* CP2077 — industrial, seco, metálico */
  nature:  { wave:"sine",     base:528, scale:[1,1.12,1.25,1.5],  clickFreq:440,  clickDur:0.09 },
  crystal: { wave:"triangle", base:392, scale:[1,1.25,1.67,2],    clickFreq:392,  clickDur:0.06 },
  cozy:    { wave:"triangle", base:493, scale:[1,1.12,1.33,1.5],  clickFreq:349,  clickDur:0.08 },
};

function useSounds(enabled, soundStyle = "rpg") {
  const acRef = useRef(null);

  const getAC = useCallback(() => {
    if (!acRef.current) {
      try { acRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    return acRef.current;
  }, []);

  const beep = useCallback((freq, dur, vol = 0.28, type) => {
    try {
      const p = SOUND_PROFILES[soundStyle] || SOUND_PROFILES.rpg;
      const ctx = getAC(); if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = type || p.wave;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur);
    } catch(e) {}
  }, [getAC, soundStyle]);

  const play = useCallback((sound) => {
    if (!enabled) return;
    const p = SOUND_PROFILES[soundStyle] || SOUND_PROFILES.rpg;
    const [s0, s1, s2, s3] = p.scale.map(m => Math.round(p.base * m));

    switch (sound) {
      case "click":
        beep(p.clickFreq, p.clickDur, 0.18); break;

      case "success":
        beep(s0, 0.09, 0.25);
        setTimeout(() => beep(s1, 0.09, 0.25), 100);
        setTimeout(() => beep(s2, 0.18, 0.30), 200); break;

      case "levelup":
        [s0, s1, s2, s3].forEach((f, i) =>
          setTimeout(() => beep(f, 0.14, 0.32), i * 110));
        break;

      case "error":
        beep(Math.round(p.base * 0.5), 0.11, 0.22);
        setTimeout(() => beep(Math.round(p.base * 0.4), 0.18, 0.22), 110); break;

      case "notification":
        beep(s2, 0.07, 0.2);
        setTimeout(() => beep(s3, 0.14, 0.25), 90); break;

      case "quest_add":
        beep(s1, 0.07, 0.2);
        setTimeout(() => beep(s2, 0.11, 0.25), 80); break;

      case "dungeon_enter":
        beep(Math.round(p.base * 0.25), 0.45, 0.38, "sawtooth");
        setTimeout(() => beep(Math.round(p.base * 0.33), 0.35, 0.28, "sawtooth"), 280);
        setTimeout(() => beep(Math.round(p.base * 0.37), 0.55, 0.32, "sawtooth"), 560); break;

      default: break;
    }
  }, [enabled, soundStyle, beep]);

  useEffect(() => {
    const handler = (e) => play(e.detail);
    window.addEventListener("rpg-sound", handler);
    return () => window.removeEventListener("rpg-sound", handler);
  }, [play]);

  return { play };
}

/* ═══════════════════════════════════════════════════════════
   RPG TOAST — notificação in-app estilo RPG
═══════════════════════════════════════════════════════════ */
function RPGToast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position:"fixed", bottom:"24px", right:"24px", zIndex:3000,
      background:"#0c1630", border:"3px solid #c8a000",
      boxShadow:"0 0 20px rgba(200,160,0,.4), 4px 4px 0 #4a3000",
      padding:"14px 16px", maxWidth:"300px",
      animation:"toastSlide .3s ease-out",
    }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:"10px" }}>
        <span style={{ fontSize:"24px", flexShrink:0 }}>📯</span>
        <div style={{ flex:1 }}>
          <div className="px-font" style={{ fontSize:"7px", color:"#f0c030", marginBottom:"4px" }}>
            ⚔ MENSAGEM DO REINO
          </div>
          <div className="px-body" style={{ fontSize:"16px", color:"#c8deff", lineHeight:1.4 }}>
            {message}
          </div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#2a4880", fontFamily:"'Press Start 2P',monospace", fontSize:"9px", cursor:"pointer", flexShrink:0, lineHeight:1 }}>✕</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   THEME SWITCHER — dropdown de temas
═══════════════════════════════════════════════════════════ */
function ThemeSwitcher({ currentThemeId, onSelect }) {
  const [open, setOpen] = useState(false);
  const theme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  return (
    <div style={{ position:"relative" }}>
      <button
        onClick={() => { setOpen(o => !o); fireSound("click"); }}
        style={{ background:"none", border:"1px solid #1e3060", color:"#2a4880", fontFamily:"'Press Start 2P',monospace", fontSize:"6px", padding:"8px 10px", cursor:"pointer", whiteSpace:"nowrap" }}
        title="Mudar tema"
      >
        {theme.icon} TEMA
      </button>
      {open && (
        <div style={{
          position:"absolute", right:0, top:"calc(100% + 4px)", zIndex:500,
          background:"#0c1630", border:"3px solid #3060b8",
          boxShadow:"0 8px 32px rgba(0,0,0,.9)", minWidth:"220px",
        }}>
          {THEMES.map(t => (
            <button key={t.id} onClick={() => { onSelect(t.id); setOpen(false); fireSound("click"); }}
              style={{
                display:"block", width:"100%", padding:"10px 14px",
                background: currentThemeId === t.id ? "#1e3060" : "none",
                border:"none", borderBottom:"1px solid #0a1840",
                color: currentThemeId === t.id ? "#f0c030" : "#4898f0",
                fontFamily:"'Press Start 2P',monospace", fontSize:"7px",
                cursor:"pointer", textAlign:"left", lineHeight:1.6,
              }}>
              {t.icon} {t.label}
              <div style={{ fontSize:"5px", color:"#1a4070", marginTop:"2px" }}>{t.desc}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const MOODS = [
  { emoji: "😄", label: "ABENÇOADO",    value: 5, color: "#39ff14" },
  { emoji: "🙂", label: "BOM",          value: 4, color: "#00d4ff" },
  { emoji: "😐", label: "NEUTRO",       value: 3, color: "#ffd700" },
  { emoji: "😔", label: "AMALDIÇOADO", value: 2, color: "#f97316" },
  { emoji: "😢", label: "PERDIDO",      value: 1, color: "#ff5555" },
];

const GUILDS = [
  { id: "leitura",    label: "ORDEM DOS SÁBIOS",  icon: "📚", color: "#bb86fc" },
  { id: "estudos",    label: "ACADEMIA MÁGICA",   icon: "🎓", color: "#00d4ff" },
  { id: "saude",      label: "SALÃO DRUIDA",      icon: "🌿", color: "#39ff14" },
  { id: "financeiro", label: "CLÃ MERCANTE",      icon: "💰", color: "#ffd700" },
  { id: "pessoal",    label: "CÍRCULO DO HERÓI",  icon: "⭐", color: "#ff79c6" },
  { id: "trabalho",   label: "ESTRATEGISTAS",     icon: "🛡️", color: "#4fc3f7" },
];

const QUEST_TYPES = [
  { value: "lendaria",  label: "LENDÁRIA",   color: "#ffd700", xp: 200, icon: "👑" },
  { value: "epica",     label: "ÉPICA",      color: "#bb86fc", xp: 100, icon: "💜" },
  { value: "normal",    label: "NORMAL",     color: "#00d4ff", xp:  50, icon: "🔵" },
  { value: "secundaria",label: "SECUNDÁRIA", color: "#39ff14", xp:  25, icon: "🌿" },
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const fmtDate    = d  => new Date(d).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"});
const fmtDateKey = d  => { const x=new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; };
const todayKey   = () => fmtDateKey(new Date());
const uid        = () => Math.random().toString(36).substr(2,9)+Date.now().toString(36);

const useLS = (k, init) => {
  const [v,set] = useState(()=>{ try{const s=localStorage.getItem(k);return s?JSON.parse(s):init;}catch{return init;} });
  useEffect(()=>{ try{localStorage.setItem(k,JSON.stringify(v));}catch{} },[k,v]);
  return [v,set];
};

const calcXP    = (t,d,g) => { let x=0; t.forEach(q=>{ if(q.completed){const qt=QUEST_TYPES.find(e=>e.value===q.priority)||QUEST_TYPES[2]; x+=qt.xp;} }); x+=Object.keys(d).length*20; g.forEach(e=>{x+=Math.floor((e.currentValue||0)*2);}); return x; };
const calcLevel = xp => Math.max(1,Math.floor(Math.sqrt(xp/80))+1);
const xpForLvl  = l  => Math.pow(l-1,2)*80;
const xpForNext = l  => Math.pow(l,2)*80;
const calcHP    = d  => { const wa=new Date(Date.now()-7*86400000); const r=Object.entries(d).filter(([k])=>new Date(k)>=wa).map(([,e])=>e.mood).filter(Boolean); return r.length?Math.round(r.reduce((a,b)=>a+b,0)/r.length/5*100):50; };
const getClass  = g  => { if(!g.length)return{title:"ARQUEIRO ARCANO",icon:"🏹"}; const c={}; g.forEach(x=>c[x.category]=(c[x.category]||0)+1); const t=Object.entries(c).sort((a,b)=>b[1]-a[1])[0][0]; return ({leitura:{title:"GUARDIÃO DO SABER",icon:"📚"},estudos:{title:"ARQUIMAGO",icon:"🧙‍♀️"},saude:{title:"DRUIDA",icon:"🌿"},financeiro:{title:"MERCADOR",icon:"💰"},pessoal:{title:"HERÓI",icon:"⭐"},trabalho:{title:"PALADINO",icon:"🛡️"}})[t]||{title:"AVENTUREIRO",icon:"🏹"}; };
const getTitle  = l  => l>=20?"ANCESTRAL":l>=15?"CAMPEÃO":l>=10?"GUARDIÃO":l>=7?"GUERREIRO":l>=4?"ESCUDEIRO":"RECRUTA";

/* ═══════════════════════════════════════════════════════════
   SHARED UI
═══════════════════════════════════════════════════════════ */
const PxLabel = ({ children, color = "#00d4ff" }) => (
  <div className="px-font" style={{ fontSize:"8px", color, letterSpacing:".12em", textTransform:"uppercase", marginBottom:"8px" }}>
    {children}
  </div>
);

const PxTitle = ({ children, icon, color = "#00d4ff" }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"18px" }}>
    {icon && <span style={{ fontSize:"16px" }}>{icon}</span>}
    <span className="px-font" style={{ fontSize:"9px", color, letterSpacing:".12em", textShadow:`0 0 10px ${color}88` }}>
      {children}
    </span>
    <div style={{ flex:1, height:"2px", background:`linear-gradient(90deg,${color}66,transparent)` }} />
    <span className="px-blink px-font" style={{ fontSize:"8px", color, marginLeft:"4px" }}>▌</span>
  </div>
);

const PxBadge = ({ color, children }) => (
  <span className="px-badge" style={{ background:color+"18", color, borderColor:color+"66" }}>
    {children}
  </span>
);

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════ */
function DashboardModule({ diary, tasks, goals, nomeHeroi = "HERÓI", racaDados, classeDados, fotoUrl }) {
  const icons = useContext(ThemeContext);
  const now    = new Date();
  const wa     = new Date(now - 7*86400000);
  const moods  = Object.entries(diary).filter(([k])=>new Date(k)>=wa).map(([,e])=>e.mood).filter(Boolean);
  const avgM   = moods.length ? moods.reduce((a,b)=>a+b,0)/moods.length : null;
  const curMood= avgM ? MOODS.find(m=>m.value===Math.round(avgM)) : null;
  const done   = tasks.filter(t=>t.completed).length;
  const pending= tasks.filter(t=>!t.completed).length;
  const overdue= tasks.filter(t=>t.dueDate&&new Date(t.dueDate)<now&&!t.completed).length;
  const xp     = calcXP(tasks,diary,goals);
  const lv     = calcLevel(xp);
  const hp     = calcHP(diary);
  const xpCur  = xp-xpForLvl(lv);
  const xpNeed = xpForNext(lv)-xpForLvl(lv);
  const cls    = getClass(goals);
  const avgG   = goals.length?Math.round(goals.reduce((s,g)=>s+(g.targetValue>0?(g.currentValue/g.targetValue)*100:0),0)/goals.length):0;
  const weekEntries = Object.keys(diary).filter(k=>new Date(k)>=wa).length;

  return (
    <div>
      {/* ── Hero Panel ── */}
      <div className="px-panel-hero">
        <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #ffd700", zIndex:2 }} />
        <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #ffd700", zIndex:2 }} />

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"16px" }}>
          {/* Avatar + name */}
          <div style={{ display:"flex", gap:"16px", alignItems:"center", flex:1 }}>
            <CharacterPortrait fotoUrl={fotoUrl} size={76} />
            <div>
              <div className="px-font" style={{ fontSize:"7px", color:"#ffd70088", letterSpacing:".2em", marginBottom:"6px" }}>
                ✦ SALÃO DO HERÓI · REINO ARCANO ✦
              </div>
              <div className="px-font px-glow-cx" style={{ fontSize:"16px", color:"#f0c030", lineHeight:1.2, marginBottom:"4px", textShadow:"0 0 20px rgba(200,160,0,.6)" }}>
                {nomeHeroi}
              </div>
              {(classeDados || racaDados) && (
                <div className="px-font" style={{ fontSize:"6px", color:classeDados?.cor||"#80b4ff", marginBottom:"2px" }}>
                  {classeDados?.icone} {classeDados?.nome}{racaDados ? ` · ${racaDados.icone} ${racaDados.nome}` : ""}
                </div>
              )}
              <div className="px-body" style={{ fontSize:"18px", color:"#4fc3f788" }}>
                {cls.icon} {cls.title} · LVL {lv} · {getTitle(lv)}
              </div>
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            {curMood
              ? <>
                  <div className="px-float" style={{ fontSize:"52px", lineHeight:1, display:"block", marginBottom:"4px" }}>{curMood.emoji}</div>
                  <PxBadge color={curMood.color}>{curMood.label}</PxBadge>
                </>
              : <div className="px-float" style={{ fontSize:"52px", opacity:.2, display:"block" }}>🏹</div>
            }
          </div>
        </div>

        <div className="px-divider" style={{ borderColor:"#ffd70044" }} />

        {/* Stat Bars */}
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
              <span className="px-font" style={{ fontSize:"7px", color:"#39ff14" }}>❤ HP</span>
              <span className="px-font" style={{ fontSize:"7px", color:"#39ff14" }}>{hp} / 100</span>
            </div>
            <PixelBar value={hp} color="#39ff14" segments={25} />
          </div>
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
              <span className="px-font" style={{ fontSize:"7px", color:"#4fc3f7" }}>✦ MP  (MANA)</span>
              <span className="px-font" style={{ fontSize:"7px", color:"#4fc3f7" }}>{Math.min(100,done*8+20)} / 100</span>
            </div>
            <PixelBar value={Math.min(100,done*8+20)} color="#4fc3f7" segments={25} />
          </div>
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
              <span className="px-font" style={{ fontSize:"7px", color:"#ffd700" }}>★ XP  LVL {lv}</span>
              <span className="px-font" style={{ fontSize:"7px", color:"#ffd700" }}>{xpCur} / {xpNeed}</span>
            </div>
            <PixelBar value={xpCur} max={xpNeed} color="#ffd700" segments={25} />
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px", marginBottom:"16px" }}>
        {[
          { icon:icons.stats.diary,   label:"CRÔNICA",       val:Object.keys(diary).length, sub:`${weekEntries} esta semana`, color:"#bb86fc" },
          { icon:icons.stats.quests,  label:"QUESTS FEITAS", val:done,   sub:`${pending} abertas`,    color:"#39ff14" },
          { icon:icons.stats.overdue, label:"ATRASADAS",     val:overdue, sub:overdue>0?"PERIGO!":"TUDO OK", color:overdue>0?"#ff5555":"#39ff14" },
          { icon:icons.stats.goals,   label:"FAÇANHAS",      val:`${avgG}%`, sub:`${goals.length} ativas`,   color:"#ffd700" },
        ].map(s => (
          <div key={s.label} className="px-panel" style={{ textAlign:"center", marginBottom:0, padding:"14px 10px" }}>
            <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
            <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
            <div style={{ fontSize:"24px", marginBottom:"6px" }}>{s.icon}</div>
            <div className="px-font" style={{ fontSize:"14px", fontFamily:"'Press Start 2P',monospace", color:s.color, marginBottom:"4px", textShadow:`0 0 14px ${s.color}88`, display:"block" }}
            >{s.val}</div>
            <div className="px-font" style={{ fontSize:"6px", color:"#1a4070", letterSpacing:".1em", marginBottom:"2px" }}>{s.label}</div>
            <div className="px-body" style={{ fontSize:"14px", color:s.color+"88" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Goal bars ── */}
      {goals.length>0 && (
        <div className="px-panel">
          <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
          <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
          <PxTitle icon={icons.stats.goals} color="#ffd700">FAÇANHAS EM PROGRESSO</PxTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            {goals.map(g=>{
              const guild=GUILDS.find(x=>x.id===g.category);
              const pct=g.targetValue>0?Math.round((g.currentValue/g.targetValue)*100):0;
              return (
                <div key={g.id}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                    <span className="px-body" style={{ fontSize:"17px", color:"#c0e8ff" }}>{icons.guilds[g.category]||guild?.icon} {g.title}</span>
                    <span className="px-font" style={{ fontSize:"8px", color:guild?.color||"#00d4ff" }}>{pct}%</span>
                  </div>
                  <PixelBar value={pct} color={guild?.color||"#00d4ff"} segments={20} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Open Quests ── */}
      {tasks.filter(t=>!t.completed).length>0 && (
        <div className="px-panel">
          <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
          <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
          <PxTitle icon={icons.tabs.quests} color="#00d4ff">QUESTS ATIVAS</PxTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            {tasks.filter(t=>!t.completed).slice(0,5).map(q=>{
              const qt=QUEST_TYPES.find(t=>t.value===q.priority)||QUEST_TYPES[2];
              const over=q.dueDate&&new Date(q.dueDate)<now;
              return (
                <div key={q.id} className="px-quest" style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 10px", background:"#04091a", border:`2px solid ${qt.color}44`, borderLeft:`4px solid ${qt.color}`, transition:"all .15s" }}>
                  <span style={{ fontSize:"14px" }}>{icons.questTypes[qt.value]||qt.icon}</span>
                  <span className="px-body" style={{ flex:1, fontSize:"18px", color:qt.color }}>{q.title}</span>
                  <PxBadge color={qt.color}>{qt.label}</PxBadge>
                  {q.dueDate && <span className="px-font" style={{ fontSize:"6px", color:over?"#ff5555":"#1a4070" }}>{fmtDate(q.dueDate+"T12:00:00")}</span>}
                </div>
              );
            })}
            {tasks.filter(t=>!t.completed).length>5 && (
              <div className="px-body" style={{ fontSize:"16px", color:"#1a4070", textAlign:"center", padding:"4px" }}>
                +{tasks.filter(t=>!t.completed).length-5} mais quests...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DIARY
═══════════════════════════════════════════════════════════ */
function DiaryModule({ data, setData }) {
  const tk = todayKey();

  /* Normalize entry: supports both old { text, mood, activities } and new { mood, entries: [] } */
  const normEntry = (e) => {
    if (!e) return { mood:null, entries:[] };
    if (Array.isArray(e.entries)) return e;
    // Legacy format — wrap in entries array
    const entries = (e.text || e.activities)
      ? [{ id:"legacy", text:e.text||"", activities:e.activities||"", createdAt:tk+"T00:00:00" }]
      : [];
    return { mood:e.mood||null, entries };
  };

  const todayNorm = normEntry(data[tk]);
  const setMood   = (v) => setData(p => ({ ...p, [tk]: { ...normEntry(p[tk]), mood:v } }));

  /* Add a fresh blank entry for today */
  const [draft,   setDraft]   = useState({ text:"", activities:"" });
  const [editing, setEditing] = useState(null); // id of entry being edited

  const addEntry = () => {
    if (!draft.text.trim() && !draft.activities.trim()) return;
    const newEntry = { id:uid(), text:draft.text, activities:draft.activities, createdAt:new Date().toISOString() };
    setData(p => {
      const norm = normEntry(p[tk]);
      return { ...p, [tk]: { ...norm, entries:[...norm.entries, newEntry] } };
    });
    setDraft({ text:"", activities:"" });
  };

  const delEntry = (eid) => {
    setData(p => {
      const norm = normEntry(p[tk]);
      return { ...p, [tk]: { ...norm, entries: norm.entries.filter(e=>e.id!==eid) } };
    });
    if (editing === eid) setEditing(null);
  };

  const updEntry = (eid, field, val) => {
    setData(p => {
      const norm = normEntry(p[tk]);
      return { ...p, [tk]: { ...norm, entries: norm.entries.map(e=>e.id===eid?{...e,[field]:val}:e) } };
    });
  };

  const list = Object.entries(data)
    .sort((a,b)=>b[0].localeCompare(a[0]))
    .filter(([k]) => k !== tk);

  return (
    <div>
      {/* ── Today's entry ── */}
      <div className="px-panel-hero">
        <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #ffd700", zIndex:2 }} />
        <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #ffd700", zIndex:2 }} />
        <PxTitle icon="📖" color="#ffd700">CRÔNICA — {fmtDate(new Date())}</PxTitle>

        <PxLabel color="#bb86fc">ESTADO DE AURA</PxLabel>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"18px" }}>
          {MOODS.map(m=>(
            <button key={m.value} onClick={()=>setMood(m.value)} style={{
              padding:"8px 12px", border:`3px solid ${todayNorm.mood===m.value?m.color:m.color+"44"}`,
              background:todayNorm.mood===m.value?m.color+"22":"#04091a",
              cursor:"pointer", display:"flex", alignItems:"center", gap:"6px",
              boxShadow:todayNorm.mood===m.value?`0 0 12px ${m.color}66, 3px 3px 0 ${m.color}44`:"3px 3px 0 #020a1e",
              transition:"all .15s",
            }}>
              <span style={{ fontSize:"18px" }}>{m.emoji}</span>
              <span className="px-font" style={{ fontSize:"7px", color:todayNorm.mood===m.value?m.color:"#1a4070" }}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Existing today entries */}
        {todayNorm.entries.length > 0 && (
          <div style={{ marginBottom:"16px" }}>
            <PxLabel color="#39ff14">ENTRADAS DE HOJE ({todayNorm.entries.length})</PxLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {todayNorm.entries.map((e,i) => (
                <div key={e.id} style={{ padding:"12px", background:"#04091a", border:"2px solid #1e3860", borderLeft:"4px solid #39ff14" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                    <span className="px-font" style={{ fontSize:"6px", color:"#1a4070" }}>
                      ENTRADA {i+1} · {new Date(e.createdAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}
                    </span>
                    <div style={{ display:"flex", gap:"6px" }}>
                      <button onClick={()=>setEditing(editing===e.id?null:e.id)} style={{ background:"none", border:"1px solid #1e3060", color:"#3060b8", fontFamily:"'Press Start 2P',monospace", fontSize:"6px", padding:"4px 7px", cursor:"pointer" }}>
                        {editing===e.id?"✕":"✎"}
                      </button>
                      <button onClick={()=>delEntry(e.id)} style={{ background:"none", border:"1px solid #c03030", color:"#e04040", fontFamily:"'Press Start 2P',monospace", fontSize:"6px", padding:"4px 7px", cursor:"pointer" }}>DEL</button>
                    </div>
                  </div>
                  {editing === e.id ? (
                    <>
                      <input className="px-input" style={{ marginBottom:"8px", fontSize:"16px" }}
                        placeholder="> Feitos..." value={e.activities}
                        onChange={ev=>updEntry(e.id,"activities",ev.target.value)} />
                      <textarea className="px-textarea" style={{ minHeight:"80px", fontSize:"16px" }}
                        placeholder="> Reflexão..."
                        value={e.text} onChange={ev=>updEntry(e.id,"text",ev.target.value)} />
                    </>
                  ) : (
                    <>
                      {e.activities && <p className="px-body" style={{ fontSize:"16px", color:"#00d4ff88", margin:"0 0 4px" }}>{'>'} {e.activities}</p>}
                      {e.text && <p className="px-body" style={{ fontSize:"17px", color:"#4fc3f7", margin:0, lineHeight:1.5 }}>{e.text}</p>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New entry form */}
        <PxLabel color="#00d4ff">+ NOVA ENTRADA</PxLabel>
        <input className="px-input" style={{ marginBottom:"10px" }}
          placeholder="> Feitos, atividades, conquistas..."
          value={draft.activities}
          onChange={e=>setDraft(p=>({...p,activities:e.target.value}))}
        />
        <textarea className="px-textarea" style={{ minHeight:"90px" }}
          placeholder="> Reflexão, sentimentos, aprendizados do dia..."
          value={draft.text}
          onChange={e=>setDraft(p=>({...p,text:e.target.value}))}
        />
        <div style={{ marginTop:"10px", display:"flex", gap:"10px", alignItems:"center" }}>
          <button className="px-btn px-btn-gold" style={{ padding:"10px 18px" }} onClick={addEntry}
            disabled={!draft.text.trim() && !draft.activities.trim()}>
            ✦ REGISTRAR ENTRADA
          </button>
          <span className="px-font" style={{ fontSize:"6px", color:"#1a4070" }}>+20 XP POR DIA DE REGISTRO</span>
        </div>
      </div>

      {/* Past entries */}
      {list.length > 0 && (
        <div className="px-panel">
          <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
          <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
          <PxTitle icon="🗓️" color="#4fc3f7">REGISTROS ANTERIORES</PxTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {list.map(([k,eRaw])=>{
              const e    = normEntry(eRaw);
              const mood = MOODS.find(m=>m.value===e.mood);
              return (
                <div key={k} style={{ padding:"12px", background:"#04091a", border:"2px solid #0d2860", borderLeft:`4px solid ${mood?.color||"#1a4070"}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                    <span className="px-font" style={{ fontSize:"7px", color:"#1a4070" }}>{fmtDate(k+"T12:00:00")}</span>
                    <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                      {mood && <PxBadge color={mood.color}>{mood.emoji} {mood.label}</PxBadge>}
                      <span className="px-font" style={{ fontSize:"6px", color:"#1a4070" }}>{e.entries.length} entrada{e.entries.length!==1?"s":""}</span>
                    </div>
                  </div>
                  {e.entries.map((en,i) => (
                    <div key={en.id} style={{ marginBottom:"8px", paddingLeft:"8px", borderLeft:"2px solid #1e3060" }}>
                      <div className="px-font" style={{ fontSize:"6px", color:"#1a3050", marginBottom:"4px" }}>
                        {i+1}. {new Date(en.createdAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}
                      </div>
                      {en.activities && <p className="px-body" style={{ fontSize:"15px", color:"#00d4ff88", margin:"0 0 2px" }}>{'>'} {en.activities}</p>}
                      {en.text && <p className="px-body" style={{ fontSize:"16px", color:"#4fc3f7", margin:0, lineHeight:1.4 }}>
                        {en.text.length>180 ? en.text.slice(0,180)+"..." : en.text}
                      </p>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   QUEST LOG
═══════════════════════════════════════════════════════════ */
function QuestLogModule({ tasks, setTasks, dailyQuests, setDailyQuests, dailyCompletions, setDailyCompletions }) {
  const icons = useContext(ThemeContext);
  const [form,setForm]    = useState({title:"",priority:"normal",dueDate:"",category:""});
  const [filter,setFilter]= useState("all");
  const [showDailyForm,setShowDailyForm] = useState(false);
  const [dailyDraft,setDailyDraft] = useState({title:"",category:"estudos",xp:20,icon:"⚡"});

  const tk = todayKey();
  const todayDone = dailyCompletions[tk] || {};

  const toggleDaily = (id) => {
    setDailyCompletions(p => {
      const today = p[tk] || {};
      return { ...p, [tk]: { ...today, [id]: !today[id] } };
    });
  };
  const addDailyQuest = () => {
    if (!dailyDraft.title.trim()) return;
    setDailyQuests(p => [...p, { ...dailyDraft, id: uid() }]);
    setDailyDraft({ title:"", category:"estudos", xp:20, icon:"⚡" });
    setShowDailyForm(false);
  };
  const delDailyQuest = (id) => setDailyQuests(p => p.filter(q => q.id !== id));

  const dailyDoneCount = dailyQuests.filter(q => todayDone[q.id]).length;
  const now = new Date();

  const add = () => { if(!form.title.trim())return; setTasks(p=>[...p,{...form,id:uid(),completed:false,createdAt:new Date().toISOString()}]); setForm({title:"",priority:"normal",dueDate:"",category:""}); };
  const tog = id => setTasks(p=>p.map(t=>t.id===id?{...t,completed:!t.completed}:t));
  const del = id => setTasks(p=>p.filter(t=>t.id!==id));

  const list   = filter==="all"?tasks:filter==="done"?tasks.filter(t=>t.completed):tasks.filter(t=>!t.completed);
  const doneCt = tasks.filter(t=>t.completed).length;
  const pct    = tasks.length>0?(doneCt/tasks.length)*100:0;

  return (
    <div>
      {/* ── QUESTS DIÁRIAS ── */}
      <div className="px-panel-hero" style={{ marginBottom:"16px" }}>
        <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #ffd700", zIndex:2 }} />
        <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #ffd700", zIndex:2 }} />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px", flexWrap:"wrap", gap:"8px" }}>
          <PxTitle icon={icons.tabs.diary} color="#f0c030">QUESTS DIÁRIAS</PxTitle>
          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
            <span className="px-font" style={{ fontSize:"7px", color:"#f0c03088" }}>{dailyDoneCount}/{dailyQuests.length} HOJE</span>
            <button className="px-btn px-btn-gold" style={{ padding:"7px 12px" }} onClick={()=>setShowDailyForm(p=>!p)}>+ NOVA</button>
          </div>
        </div>

        {showDailyForm && (
          <div style={{ background:"#100e00", border:"2px solid #c8a00044", padding:"14px", marginBottom:"14px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"8px", marginBottom:"8px" }}>
              <input className="px-input" placeholder="> Nome da quest diária..." value={dailyDraft.title}
                onChange={e=>setDailyDraft(p=>({...p,title:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&addDailyQuest()} />
              <input className="px-input" style={{ width:"46px", textAlign:"center" }} placeholder="⚡"
                value={dailyDraft.icon} onChange={e=>setDailyDraft(p=>({...p,icon:e.target.value}))} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:"8px" }}>
              <select className="px-input" value={dailyDraft.category} onChange={e=>setDailyDraft(p=>({...p,category:e.target.value}))}>
                {GUILDS.map(g=><option key={g.id} value={g.id}>{g.icon} {g.label}</option>)}
              </select>
              <input type="number" className="px-input" style={{ width:"70px" }} placeholder="XP" min="5" max="200"
                value={dailyDraft.xp} onChange={e=>setDailyDraft(p=>({...p,xp:Number(e.target.value)}))} />
              <button className="px-btn px-btn-gold" style={{ padding:"8px 14px" }} onClick={addDailyQuest}>✓</button>
            </div>
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {dailyQuests.length === 0 && (
            <div className="px-body" style={{ textAlign:"center", color:"#4a3000", padding:"16px", fontSize:"17px" }}>
              Nenhuma quest diária configurada. Clique em + NOVA!
            </div>
          )}
          {dailyQuests.map(q => {
            const guild = GUILDS.find(g=>g.id===q.category);
            const done  = !!todayDone[q.id];
            return (
              <div key={q.id} style={{
                display:"flex", alignItems:"center", gap:"12px",
                padding:"10px 12px", background:"#04091a",
                border:`2px solid ${done?"#39ff1444":"#c8a00022"}`,
                borderLeft:`5px solid ${done?"#39ff14":"#c8a000"}`,
                opacity: done ? 0.7 : 1, transition:"all .15s",
              }}>
                <button onClick={()=>toggleDaily(q.id)} style={{
                  width:"22px", height:"22px", flexShrink:0,
                  border:`2px solid ${done?"#39ff14":"#c8a00088"}`,
                  background:done?"#39ff1418":"#04091a",
                  cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:done?"0 0 8px rgba(57,255,20,.4)":"none",
                }}>
                  {done && <span className="px-font" style={{ color:"#39ff14", fontSize:"7px" }}>✓</span>}
                </button>
                <span style={{ fontSize:"18px" }}>{q.icon}</span>
                <div style={{ flex:1 }}>
                  <div className="px-body" style={{ fontSize:"19px", color:done?"#1a4070":"#f0c030", textDecoration:done?"line-through":"none" }}>{q.title}</div>
                  <div style={{ display:"flex", gap:"6px", marginTop:"2px" }}>
                    {guild && <PxBadge color={guild.color}>{icons.guilds[guild.id]||guild.icon} {guild.label}</PxBadge>}
                    <PxBadge color="#f0c030">+{q.xp} XP</PxBadge>
                  </div>
                </div>
                <button onClick={()=>delDailyQuest(q.id)} style={{ background:"none", border:"1px solid #c03030", color:"#e04040", fontFamily:"'Press Start 2P',monospace", fontSize:"6px", padding:"5px 8px", cursor:"pointer" }}>DEL</button>
              </div>
            );
          })}
        </div>
        {dailyQuests.length > 0 && (
          <div style={{ marginTop:"12px" }}>
            <PixelBar value={dailyDoneCount} max={dailyQuests.length} color="#f0c030" segments={dailyQuests.length} />
          </div>
        )}
      </div>

      {/* ── QUESTS NORMAIS ── */}
      <div className="px-panel">
        <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
        <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
        <PxTitle icon={icons.tabs.quests} color="#00d4ff">ACEITAR NOVA QUEST</PxTitle>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <input className="px-input" placeholder="> Nome da quest..."
            value={form.title}
            onChange={e=>setForm(p=>({...p,title:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&add()}
          />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px" }}>
            {[
              { label:"DIFICULDADE", child:<select className="px-input" value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>{QUEST_TYPES.map(q=><option key={q.value} value={q.value}>{q.icon} {q.label}</option>)}</select> },
              { label:"PRAZO",       child:<input type="date" className="px-input" value={form.dueDate} onChange={e=>setForm(p=>({...p,dueDate:e.target.value}))} /> },
              { label:"GUILDA",      child:<select className="px-input" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                  <option value="">-- NENHUMA --</option>
                  {GUILDS.map(g=><option key={g.id} value={g.id}>{g.icon} {g.label}</option>)}
                </select> },
            ].map(({label,child})=>(
              <div key={label}>
                <PxLabel>{label}</PxLabel>
                {child}
              </div>
            ))}
          </div>
          <button className="px-btn px-btn-cyan" onClick={add}>⚔ ACEITAR QUEST</button>
        </div>
      </div>

      {tasks.length>0 && (
        <div className="px-panel">
          <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
          <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px", flexWrap:"wrap", gap:"8px" }}>
            <span className="px-font" style={{ fontSize:"7px", color:"#1a4070" }}>{doneCt}/{tasks.length} COMPLETAS</span>
            <div style={{ display:"flex", gap:"6px" }}>
              {[["all","TODAS"],["pending","ATIVAS"],["done","FEITAS"]].map(([f,l])=>(
                <button key={f} className={`px-btn ${filter===f?"px-btn-cyan":"px-btn-ghost"}`} style={{ padding:"7px 12px" }} onClick={()=>setFilter(f)}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:"16px" }}>
            <PixelBar value={pct} color="#00d4ff" segments={28} />
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {list.length===0 && <div className="px-body" style={{ textAlign:"center", color:"#1a4070", padding:"20px", fontSize:"18px" }}>SEM QUESTS NESTE FILTRO...</div>}
            {list.map(q=>{
              const qt  = QUEST_TYPES.find(t=>t.value===q.priority)||QUEST_TYPES[2];
              const g   = GUILDS.find(x=>x.id===q.category);
              const over= q.dueDate&&new Date(q.dueDate)<now&&!q.completed;
              return (
                <div key={q.id} className="px-quest" style={{
                  display:"flex", alignItems:"center", gap:"12px",
                  padding:"10px 12px", background:"#04091a",
                  border:`2px solid ${over?"#ff555544":qt.color+"44"}`,
                  borderLeft:`5px solid ${qt.color}`,
                  opacity:q.completed?.55:1, transition:"all .15s",
                }}>
                  <button onClick={()=>tog(q.id)} style={{
                    width:"20px", height:"20px",
                    border:`2px solid ${q.completed?"#39ff14":qt.color+"88"}`,
                    background:q.completed?"#39ff1418":"#04091a",
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                    boxShadow:q.completed?"0 0 8px rgba(57,255,20,.4)":"none",
                  }}>
                    {q.completed && <span className="px-font" style={{ color:"#39ff14", fontSize:"7px" }}>✓</span>}
                  </button>
                  <div style={{ flex:1 }}>
                    <div className="px-body" style={{ fontSize:"19px", color:q.completed?"#1a4070":qt.color, textDecoration:q.completed?"line-through":"none", marginBottom:"3px" }}>
                      {q.title}
                    </div>
                    <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", alignItems:"center" }}>
                      <PxBadge color={qt.color}>{icons.questTypes[qt.value]||qt.icon} {qt.label} +{qt.xp}XP</PxBadge>
                      {g && <PxBadge color={g.color}>{icons.guilds[g.id]||g.icon} {g.label}</PxBadge>}
                      {q.dueDate && <PxBadge color={over?"#ff5555":"#1a4070"}>{fmtDate(q.dueDate+"T12:00:00")}</PxBadge>}
                    </div>
                  </div>
                  <button className="px-btn px-btn-danger" style={{ padding:"5px 8px", fontSize:"8px" }} onClick={()=>del(q.id)}>DEL</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tasks.length===0 && (
        <div className="px-panel" style={{ textAlign:"center", padding:"40px" }}>
          <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
          <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
          <div className="px-float" style={{ fontSize:"48px", marginBottom:"12px", display:"block" }}>{icons.tabs.quests}</div>
          <div className="px-font" style={{ fontSize:"9px", color:"#1a4070", marginBottom:"8px" }}>QUADRO DE QUESTS VAZIO</div>
          <div className="px-body" style={{ fontSize:"18px", color:"#0d2860" }}>Aceite sua primeira quest, aventureiro!</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GRIMÓRIO (NOTES)
═══════════════════════════════════════════════════════════ */
function GrimorioModule({ notes, setNotes }) {
  const [sel,setSel]      = useState(null);
  const [search,setSearch]= useState("");
  const create = () => { const n={id:uid(),title:"NOVO FEITIÇO",content:"",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}; setNotes(p=>[n,...p]); setSel(n.id); };
  const upd    = (id,f,v)=>setNotes(p=>p.map(n=>n.id===id?{...n,[f]:v,updatedAt:new Date().toISOString()}:n));
  const del    = id=>{setNotes(p=>p.filter(n=>n.id!==id));if(sel===id)setSel(null);};
  const list   = notes.filter(n=>n.title.toLowerCase().includes(search.toLowerCase())||n.content.toLowerCase().includes(search.toLowerCase()));
  const cur    = notes.find(n=>n.id===sel);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:"16px", minHeight:"500px" }}>
      <div>
        <div style={{ display:"flex", gap:"8px", marginBottom:"10px" }}>
          <input className="px-input" style={{ flex:1, fontSize:"15px" }} placeholder="> buscar..." value={search} onChange={e=>setSearch(e.target.value)} />
          <button className="px-btn px-btn-purple" style={{ padding:"8px 12px", fontSize:"12px" }} onClick={create}>+</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"6px", maxHeight:"580px", overflowY:"auto" }}>
          {list.length===0 && <div className="px-body" style={{ color:"#0d2860", textAlign:"center", padding:"20px", fontSize:"18px" }}>GRIMÓRIO VAZIO...</div>}
          {list.map(n=>(
            <div key={n.id} onClick={()=>setSel(n.id)} style={{
              padding:"10px", background:"#04091a",
              border:`2px solid ${sel===n.id?"#bb86fc":"#0d2860"}`,
              borderLeft:`4px solid ${sel===n.id?"#bb86fc":"#0d2860"}`,
              cursor:"pointer", transition:"all .15s",
              boxShadow:sel===n.id?"0 0 10px rgba(187,134,252,.2)":"none",
            }}>
              <div className="px-font" style={{ fontSize:"7px", color:sel===n.id?"#bb86fc":"#1a4070", marginBottom:"4px" }}>📜 {n.title||"SEM TÍTULO"}</div>
              <div className="px-body" style={{ fontSize:"14px", color:"#0d2860" }}>{n.content?n.content.slice(0,55)+"...":"[vazio]"}</div>
              <div className="px-font" style={{ fontSize:"6px", color:"#0a1840", marginTop:"4px" }}>{fmtDate(n.updatedAt)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-panel-arcane" style={{ minHeight:"500px" }}>
        <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #bb86fc", zIndex:2 }} />
        <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #bb86fc", zIndex:2 }} />
        {cur
          ? <>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px", gap:"10px" }}>
                <input style={{ background:"transparent", border:"none", borderBottom:"3px solid #bb86fc44", color:"#bb86fc", fontFamily:"'Press Start 2P',monospace", fontSize:"10px", flex:1, padding:"0 0 8px 0", outline:"none" }}
                  value={cur.title} onChange={e=>upd(cur.id,"title",e.target.value)} placeholder="NOME DO FEITIÇO..." />
                <button className="px-btn px-btn-danger" style={{ padding:"7px 12px", flexShrink:0 }} onClick={()=>del(cur.id)}>DEL</button>
              </div>
              <textarea style={{ background:"transparent", border:"none", color:"#c0e8ff", fontFamily:"'VT323',monospace", fontSize:"18px", width:"100%", minHeight:"400px", resize:"none", outline:"none", lineHeight:1.7 }}
                value={cur.content} onChange={e=>upd(cur.id,"content",e.target.value)}
                placeholder="> Escreva seus feitiços arcanos, segredos e sabedoria ancestral aqui..." />
            </>
          : <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"400px", gap:"12px" }}>
              <span className="px-float" style={{ fontSize:"48px", opacity:.2, display:"block" }}>📚</span>
              <span className="px-font" style={{ fontSize:"8px", color:"#1a4070", textAlign:"center", lineHeight:2 }}>SELECIONE UM FEITIÇO<br/>OU CRIE UM NOVO</span>
              <button className="px-btn px-btn-purple" style={{ padding:"12px 20px" }} onClick={create}>✦ NOVO FEITIÇO</button>
            </div>
        }
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FAÇANHAS (GOALS)
═══════════════════════════════════════════════════════════ */
function FacanhasModule({ goals, setGoals }) {
  const icons = useContext(ThemeContext);
  const [showForm,setShowForm]= useState(false);
  const [form,setForm]        = useState({title:"",category:"estudos",description:"",targetValue:100,currentValue:0,unit:"%",deadline:""});
  const [activeG,setActiveG]  = useState("all");

  const add  = ()=>{ if(!form.title.trim())return; setGoals(p=>[...p,{...form,id:uid(),createdAt:new Date().toISOString(),logs:[]}]); setForm({title:"",category:"estudos",description:"",targetValue:100,currentValue:0,unit:"%",deadline:""}); setShowForm(false); };
  const adv  = (id,d)=>setGoals(p=>p.map(g=>{ if(g.id!==id)return g; const nv=Math.min(Math.max(0,g.currentValue+d),g.targetValue); return{...g,currentValue:nv,logs:[...(g.logs||[]),{date:new Date().toISOString(),value:nv,delta:d}]}; }));
  const rm   = id=>setGoals(p=>p.filter(g=>g.id!==id));
  const list = activeG==="all"?goals:goals.filter(g=>g.category===activeG);

  return (
    <div>
      <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap", alignItems:"center" }}>
        <button className={`px-btn ${activeG==="all"?"px-btn-gold":"px-btn-ghost"}`} style={{ padding:"8px 12px" }} onClick={()=>setActiveG("all")}>🏆 TODAS</button>
        {GUILDS.map(g=>(
          <button key={g.id} onClick={()=>setActiveG(g.id)} style={{
            padding:"8px 12px",
            border:`3px solid ${activeG===g.id?g.color:g.color+"44"}`,
            background:activeG===g.id?g.color+"18":"#04091a",
            cursor:"pointer", fontFamily:"'Press Start 2P',monospace", fontSize:"7px",
            color:activeG===g.id?g.color:"#1a4070", transition:"all .15s",
            boxShadow:activeG===g.id?`0 0 10px ${g.color}44, 3px 3px 0 ${g.color}44`:"3px 3px 0 #020a1e",
          }}>
            {icons.guilds[g.id]||g.icon} {g.label}
          </button>
        ))}
        <button className="px-btn px-btn-gold" style={{ padding:"8px 14px", marginLeft:"auto" }} onClick={()=>setShowForm(!showForm)}>+ NOVA FAÇANHA</button>
      </div>

      {showForm && (
        <div className="px-panel-hero">
          <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #ffd700", zIndex:2 }} />
          <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #ffd700", zIndex:2 }} />
          <PxTitle icon={icons.tabs.goals} color="#ffd700">NOVA FAÇANHA ÉPICA</PxTitle>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <input className="px-input" placeholder="> Nome da façanha..." value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              {[
                { label:"GUILDA",           child:<select className="px-input" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>{GUILDS.map(g=><option key={g.id} value={g.id}>{g.icon} {g.label}</option>)}</select> },
                { label:"PRAZO",            child:<input type="date" className="px-input" value={form.deadline} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))} /> },
                { label:"VALOR ALVO",       child:<input type="number" className="px-input" value={form.targetValue} onChange={e=>setForm(p=>({...p,targetValue:Number(e.target.value)}))} /> },
                { label:"UNIDADE (%, PÁG, KM...)", child:<input className="px-input" value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} placeholder="%" /> },
              ].map(({label,child})=>(
                <div key={label}><PxLabel>{label}</PxLabel>{child}</div>
              ))}
            </div>
            <textarea className="px-textarea" placeholder="> Descrição (opcional)..." value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} />
            <div style={{ display:"flex", gap:"8px" }}>
              <button className="px-btn px-btn-gold" style={{ padding:"12px 20px" }} onClick={add}>⚔ INICIAR FAÇANHA</button>
              <button className="px-btn px-btn-ghost" style={{ padding:"12px 16px" }} onClick={()=>setShowForm(false)}>CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {list.length===0&&!showForm && (
        <div className="px-panel" style={{ textAlign:"center", padding:"40px" }}>
          <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
          <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
          <div className="px-float" style={{ fontSize:"48px", marginBottom:"12px", display:"block" }}>{icons.tabs.goals}</div>
          <div className="px-font" style={{ fontSize:"8px", color:"#1a4070", marginBottom:"12px" }}>SEM FAÇANHAS ENCONTRADAS</div>
          <button className="px-btn px-btn-gold" style={{ padding:"12px 20px" }} onClick={()=>setShowForm(true)}>{icons.deco} CRIAR PRIMEIRA FAÇANHA</button>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        {list.map(goal=>{
          const guild=GUILDS.find(g=>g.id===goal.category);
          const pct=goal.targetValue>0?(goal.currentValue/goal.targetValue)*100:0;
          const done=pct>=100;
          const dl=goal.deadline?Math.ceil((new Date(goal.deadline)-new Date())/(1000*3600*24)):null;
          return (
            <div key={goal.id} className="px-panel" style={{ borderLeftColor:guild?.color||"#00d4ff", marginBottom:0 }}>
              <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
              <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"12px" }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px", flexWrap:"wrap" }}>
                    <span style={{ fontSize:"18px" }}>{icons.guilds[goal.category]||guild?.icon}</span>
                    <span className="px-font" style={{ fontSize:"9px", color:guild?.color||"#00d4ff" }}>{goal.title}</span>
                    {done && <PxBadge color="#39ff14">✓ COMPLETA!</PxBadge>}
                  </div>
                  {goal.description && <p className="px-body" style={{ fontSize:"16px", color:"#1a4070", margin:"0 0 10px 0" }}>{goal.description}</p>}
                  <div style={{ marginBottom:"8px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                      <span className="px-font" style={{ fontSize:"7px", color:guild?.color||"#00d4ff" }}>PROGRESSO</span>
                      <span className="px-font" style={{ fontSize:"7px", color:guild?.color||"#00d4ff" }}>{goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                    </div>
                    <PixelBar value={pct} color={guild?.color||"#00d4ff"} segments={22} />
                  </div>
                  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                    <PxBadge color={guild?.color||"#00d4ff"}>{icons.guilds[goal.category]||guild?.icon} {guild?.label}</PxBadge>
                    {dl!==null && <PxBadge color={dl<7?"#ff5555":"#1a4070"}>{dl>0?`${dl}D RESTANTES`:dl===0?"HOJE!":"EXPIRADA"}</PxBadge>}
                    <span className="px-font" style={{ fontSize:"7px", color:"#0d2860", alignSelf:"center" }}>{Math.round(pct)}%</span>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  <button className="px-btn px-btn-cyan"   style={{ padding:"9px 14px", fontSize:"14px" }} onClick={()=>adv(goal.id, 1)}>+</button>
                  <button className="px-btn px-btn-ghost"  style={{ padding:"9px 14px", fontSize:"14px" }} onClick={()=>adv(goal.id,-1)}>-</button>
                  <button className="px-btn px-btn-danger" style={{ padding:"7px 10px", fontSize:"8px" }}  onClick={()=>rm(goal.id)}>DEL</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ORACLE (AI)
═══════════════════════════════════════════════════════════ */
function OracleModule({ diary, tasks, goals, notes, apiKey, setApiKey, nomeHeroi = "HERÓI" }) {
  const [modo,    setModo]    = useState("revelacoes"); // "revelacoes" | "companion"
  const [analysis,setAnalysis]= useState("");
  const [loading,setLoading]  = useState(false);
  const [error,setError]      = useState("");
  const [type,setType]        = useState("semanal");

  /* ── COMPANION CHAT ── */
  const [chatMsgs,  setChatMsgs]  = useLS("mylog_companion_chat", []);
  const [chatInput, setChatInput] = useState("");
  const [chatLoad,  setChatLoad]  = useState(false);
  const chatEndRef = useCallback(el => el?.scrollIntoView({ behavior:"smooth" }), []);

  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg || !apiKey.trim()) return;
    const userMsg = { role:"user", content: msg, ts: Date.now() };
    const history = [...chatMsgs, userMsg];
    setChatMsgs(history);
    setChatInput("");
    setChatLoad(true);

    const sysPrompt = `Você é Ignis, um Mago Oráculo ancião de um mundo de fantasia no estilo Final Fantasy. Você é o companheiro fiel de ${nomeHeroi}, um jovem aventureiro estudante de Tecnologia na FIAP.
Responda SEMPRE em português, com linguagem levemente épica mas clara, direta e amigável — como um mestre sábio conversando com seu aprendiz.
Você sabe que ${nomeHeroi} está aprendendo: Python, Java, JavaScript, FrontEnd, Banco de Dados, Business Model e Chat Bot IA (Watson).
Ajude com dúvidas de programação, motivação, organização e qualquer pergunta. Seja conciso: máximo 4 parágrafos curtos.
Nunca quebre o personagem. Use termos como "jovem aventureiro", "herói", "a jornada" quando apropriado, mas sem exagerar.`;

    const messages = history.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));

    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({ model:"claude-opus-4-6", max_tokens:800, system: sysPrompt, messages }),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error?.message || `Erro ${r.status}`); }
      const d = await r.json();
      setChatMsgs(prev => [...prev, { role:"assistant", content: d.content[0].text, ts: Date.now() }]);
    } catch(e) {
      setChatMsgs(prev => [...prev, { role:"assistant", content:`⚠ Ignis não conseguiu responder: ${e.message}`, ts: Date.now() }]);
    } finally {
      setChatLoad(false);
    }
  };

  const buildCtx = useCallback(()=>{
    const wa=new Date(Date.now()-7*86400000);
    const rd=Object.entries(diary).filter(([k])=>new Date(k)>=wa).map(([k,e])=>{
      const mood=MOODS.find(m=>m.value===e.mood);
      return `${fmtDate(k+"T12:00:00")}: Humor: ${mood?.label||"-"}. Atividades: ${e.activities||"-"}. Reflexão: ${e.text||"-"}`;
    }).join("\n");
    const p=tasks.filter(t=>!t.completed), d=tasks.filter(t=>t.completed), o=tasks.filter(t=>t.dueDate&&new Date(t.dueDate)<new Date()&&!t.completed);
    const gi=goals.map(g=>{const gl=GUILDS.find(c=>c.id===g.category);const pct=g.targetValue>0?Math.round((g.currentValue/g.targetValue)*100):0;return `- ${gl?.icon} ${g.title} (${gl?.label}): ${pct}% — ${g.currentValue}/${g.targetValue} ${g.unit}`;}).join("\n");
    return {
      diary: rd||"Sem entradas esta semana.",
      tasks: `Total: ${tasks.length} | Completas: ${d.length} | Pendentes: ${p.length} | Atrasadas: ${o.length}\nPendentes: ${p.map(t=>t.title).join(", ")||"nenhuma"}\nAtrasadas: ${o.map(t=>t.title).join(", ")||"nenhuma"}`,
      goals: gi||"Nenhuma façanha ativa.",
    };
  },[diary,tasks,goals]);

  const consult = async ()=>{
    if(!apiKey.trim()){setError("INSIRA A CHAVE ARCANA (API KEY) PARA DESPERTAR O ORÁCULO.");return;}
    setLoading(true); setError(""); setAnalysis("");
    const ctx=buildCtx();
    const prompts={
      semanal:`Você é um Ancião Mago Oráculo de um mundo de fantasia RPG. Use linguagem levemente épica mas seja claro e útil. Analise a semana do herói Carlos em português.

DIÁRIO DA SEMANA:\n${ctx.diary}
QUESTS:\n${ctx.tasks}
FAÇANHAS:\n${ctx.goals}

Forneça:
1. ⚔️ **Veredicto da Semana** — Foi gloriosa, mediana ou sombria?
2. 🌟 **Conquistas** — O que fez bem
3. 🗡️ **Batalhas Perdidas** — O que precisa melhorar
4. 📜 **Missões Prioritárias** — 3 ações concretas para os próximos dias
5. 🔮 **Profecia** — Um insight inspirador baseado nos dados

Use os dados reais. Seja empático e honesto.`,
      humor:`Você é um Curandeiro Mago. Analise o estado emocional de Carlos em português.

DIÁRIO:\n${ctx.diary}

Forneça:
1. 🌑 **Leitura da Aura** — Estado emocional da semana
2. ⚡ **Fontes de Energia e Escuridão** — O que influencia o humor
3. 🌿 **Poções de Bem-Estar** — Dicas práticas
4. 🔮 **Tendência** — Está melhorando ou piorando?`,
      metas:`Você é um General Estrategista Mago. Analise as metas de Carlos em português.

QUESTS:\n${ctx.tasks}
FAÇANHAS:\n${ctx.goals}

Forneça:
1. 🏆 **Status das Façanhas** — Análise do progresso
2. ☠️ **Em Perigo** — O que requer atenção imediata
3. ⚔️ **Estratégia** — Como otimizar o progresso
4. 📅 **Plano da Semana** — Foco para os próximos 7 dias
5. 🌟 **Façanha em Destaque** — Qual merece mais esforço agora`,
    };

    try {
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-opus-4-6",max_tokens:1500,messages:[{role:"user",content:prompts[type]}]}),
      });
      if(!r.ok){const e=await r.json();throw new Error(e.error?.message||`Error ${r.status}`);}
      const d=await r.json();
      setAnalysis(d.content[0].text);
    }catch(e){setError(`ORÁCULO INACESSÍVEL: ${e.message}`);}
    finally{setLoading(false);}
  };

  return (
    <div>
      {/* ── Abas de modo ── */}
      <div style={{ display:"flex", gap:"0", marginBottom:"16px", borderBottom:"3px solid #1e3060" }}>
        {[
          { id:"revelacoes", icon:"🔮", label:"REVELAÇÕES" },
          { id:"companion",  icon:"🧙", label:"IGNIS — COMPANHEIRO" },
        ].map(m => (
          <button key={m.id} onClick={() => setModo(m.id)} style={{
            padding:"10px 16px", background:"none", border:"none",
            borderBottom: modo === m.id ? "3px solid #4898f0" : "3px solid transparent",
            marginBottom:"-3px",
            color: modo === m.id ? "#80b4ff" : "#2a4880",
            fontFamily:"'Press Start 2P',monospace", fontSize:"7px",
            cursor:"pointer", letterSpacing:".05em",
            textShadow: modo === m.id ? "0 0 10px rgba(72,152,240,.5)" : "none",
            transition:"all .15s",
          }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* ────────── COMPANION CHAT ────────── */}
      {modo === "companion" && (
        <div>
          {!apiKey.trim() && (
            <div className="px-panel-arcane" style={{ marginBottom:"12px" }}>
              <PxLabel color="#4898f0">CHAVE ARCANA · ANTHROPIC API KEY</PxLabel>
              <input type="password" className="px-input" style={{ borderColor:"#4898f044", marginBottom:"6px" }} placeholder="> sk-ant-api03-..." value={apiKey} onChange={e=>setApiKey(e.target.value)} />
              <p className="px-body" style={{ fontSize:"14px", color:"#1e3870" }}>
                [CHAVE SALVA LOCALMENTE · <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color:"#4898f0" }}>console.anthropic.com</a>]
              </p>
            </div>
          )}

          {/* janela de chat */}
          <div className="px-panel-arcane" style={{ padding:"0", overflow:"hidden" }}>
            {/* cabeçalho do companion */}
            <div style={{ padding:"14px 18px", borderBottom:"2px solid #1e3870", display:"flex", alignItems:"center", gap:"12px" }}>
              <div className="px-float" style={{ fontSize:"32px" }}>🧙</div>
              <div>
                <div className="px-font" style={{ fontSize:"8px", color:"#80b4ff" }}>IGNIS — MAGO ORÁCULO</div>
                <div className="px-body" style={{ fontSize:"14px", color:"#1e4080" }}>Seu companheiro de aventura · FIAP</div>
              </div>
              {apiKey.trim() && (
                <button onClick={() => setChatMsgs([])} style={{ marginLeft:"auto", background:"none", border:"1px solid #1e3060", color:"#2a4880", fontFamily:"'Press Start 2P',monospace", fontSize:"6px", padding:"5px 8px", cursor:"pointer" }}>
                  LIMPAR
                </button>
              )}
            </div>

            {/* mensagens */}
            <div style={{ height:"380px", overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:"12px" }}>
              {chatMsgs.length === 0 && (
                <div style={{ textAlign:"center", marginTop:"60px" }}>
                  <div className="px-float" style={{ fontSize:"48px", display:"block", marginBottom:"12px" }}>🧙</div>
                  <div className="px-font" style={{ fontSize:"7px", color:"#1e3870", lineHeight:2 }}>
                    Saudações, {nomeHeroi}!<br/>
                    Sou Ignis, seu guia nessa jornada.<br/>
                    Pergunte-me qualquer coisa.
                  </div>
                </div>
              )}
              {chatMsgs.map((m, i) => (
                <div key={i} style={{
                  display:"flex", gap:"10px",
                  flexDirection: m.role === "user" ? "row-reverse" : "row",
                  alignItems:"flex-end",
                }}>
                  <div style={{ fontSize:"20px", flexShrink:0 }}>
                    {m.role === "user" ? "⚔️" : "🧙"}
                  </div>
                  <div style={{
                    maxWidth:"75%", padding:"10px 14px",
                    background: m.role === "user" ? "#102040" : "#081428",
                    border:`2px solid ${m.role === "user" ? "#3060b8" : "#4898f0"}`,
                    borderRadius: "0",
                  }}>
                    <div className="px-body" style={{ fontSize:"17px", color: m.role === "user" ? "#c8deff" : "#a0c8ff", lineHeight:1.6, whiteSpace:"pre-wrap" }}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {chatLoad && (
                <div style={{ display:"flex", gap:"10px", alignItems:"flex-end" }}>
                  <div style={{ fontSize:"20px" }}>🧙</div>
                  <div style={{ padding:"10px 14px", background:"#081428", border:"2px solid #4898f0" }}>
                    <span className="px-blink px-font" style={{ fontSize:"8px", color:"#4898f0" }}>▌▌▌</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* input */}
            <div style={{ padding:"12px 16px", borderTop:"2px solid #1e3870", display:"flex", gap:"8px" }}>
              <input
                className="px-input"
                style={{ flex:1, fontSize:"17px" }}
                placeholder="> Fale com Ignis..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                disabled={chatLoad || !apiKey.trim()}
              />
              <button
                className="px-btn px-btn-purple"
                style={{ padding:"8px 14px", fontSize:"12px", flexShrink:0 }}
                onClick={sendChat}
                disabled={chatLoad || !apiKey.trim() || !chatInput.trim()}
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────── REVELAÇÕES (modo original) ────────── */}
      {modo === "revelacoes" && (
      <>
      <div className="px-panel-arcane">
        <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #bb86fc", zIndex:2 }} />
        <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #bb86fc", zIndex:2 }} />
        <PxTitle icon="🔮" color="#4898f0">CÂMARA DO ORÁCULO</PxTitle>

        <PxLabel color="#4898f0">CHAVE ARCANA · ANTHROPIC API KEY</PxLabel>
        <input type="password" className="px-input" style={{ borderColor:"#bb86fc44", marginBottom:"6px" }} placeholder="> sk-ant-api03-..." value={apiKey} onChange={e=>setApiKey(e.target.value)} />
        <p className="px-body" style={{ fontSize:"15px", color:"#1a4070", marginBottom:"16px", fontStyle:"italic" }}>
          [CHAVE SALVA LOCALMENTE · OBTENHA A SUA EM{" "}
          <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color:"#bb86fc" }}>console.anthropic.com</a>]
        </p>

        <PxLabel color="#bb86fc">SELECIONE O TIPO DE REVELAÇÃO</PxLabel>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"18px" }}>
          {[
            {id:"semanal",icon:"📊",label:"VISÃO SEMANAL",     desc:"Jornada completa da semana"},
            {id:"humor",  icon:"🌑",label:"LEITURA DE AURA",   desc:"Emocional e espiritual"},
            {id:"metas",  icon:"⚔️",label:"MAPA DE FAÇANHAS",  desc:"Quests e objetivos"},
          ].map(t=>(
            <button key={t.id} onClick={()=>setType(t.id)} style={{
              padding:"12px 14px",
              border:`3px solid ${type===t.id?"#bb86fc":"#bb86fc44"}`,
              background:type===t.id?"#bb86fc18":"#04091a",
              cursor:"pointer", textAlign:"left",
              boxShadow:type===t.id?`0 0 12px rgba(187,134,252,.3), 3px 3px 0 #4a1a80`:"3px 3px 0 #020a1e",
              transition:"all .15s",
            }}>
              <div className="px-font" style={{ fontSize:"8px", color:type===t.id?"#bb86fc":"#1a4070", marginBottom:"4px" }}>{t.icon} {t.label}</div>
              <div className="px-body" style={{ fontSize:"15px", color:type===t.id?"#9c6ddc":"#0d2860" }}>{t.desc}</div>
            </button>
          ))}
        </div>

        <button className="px-btn" onClick={consult} disabled={loading} style={{
          width:"100%", padding:"16px",
          background:loading?"#0a0518":"linear-gradient(135deg,#4a1a80,#7b2fff)",
          color:loading?"#2a0a50":"#e8d0ff",
          border:`3px solid ${loading?"#2a0a50":"#bb86fc"}`,
          fontFamily:"'Press Start 2P',monospace", fontSize:"9px", letterSpacing:".1em", textTransform:"uppercase",
          boxShadow:loading?"none":"0 0 20px rgba(187,134,252,.4), 3px 3px 0 #200050",
          cursor:loading?"not-allowed":"pointer", transition:"all .2s",
        }}>
          {loading?"⌛ ORÁCULO LÊ AS ESTRELAS...":"✦ INVOCAR VISÃO DO ORÁCULO ✦"}
        </button>

        {error && (
          <div style={{ marginTop:"14px", padding:"12px", background:"#200808", border:"3px solid #ff555566" }}>
            <span className="px-font" style={{ fontSize:"7px", color:"#ff5555" }}>☠ ERRO: </span>
            <span className="px-body" style={{ fontSize:"16px", color:"#ff8888" }}>{error}</span>
          </div>
        )}
      </div>

      {analysis && (
        <div className="px-panel-arcane">
          <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #4898f0", zIndex:2 }} />
          <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #4898f0", zIndex:2 }} />
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"18px" }}>
            <div className="px-float" style={{ fontSize:"40px", display:"block" }}>🔮</div>
            <div>
              <div className="px-font" style={{ fontSize:"9px", color:"#80b4ff", textShadow:"0 0 10px rgba(72,152,240,.7)" }}>REVELAÇÃO DO ORÁCULO</div>
              <div className="px-body" style={{ fontSize:"14px", color:"#1e4080" }}>{new Date().toLocaleString("pt-BR")}</div>
            </div>
          </div>
          <div className="px-body" style={{ fontSize:"18px", color:"#c8deff", lineHeight:1.8, whiteSpace:"pre-wrap" }}>{analysis}</div>
        </div>
      )}
      </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SKILL TREE DATA — Árvore de Habilidades FIAP 1º Ano
═══════════════════════════════════════════════════════════ */
const SKILL_TREE = [
  {
    id: "python",
    icon: "🐍",
    name: "Python",
    color: "#3b8ede",
    materia: "Computational Thinking Using Python",
    dependsOn: null,
    unlocks: "chatbot",
    quests: [
      { id: "py1", name: "Variáveis e Tipos de Dados" },
      { id: "py2", name: "Estruturas Condicionais (if/elif/else)" },
      { id: "py3", name: "Laços de Repetição (for/while)" },
      { id: "py4", name: "Funções e Parâmetros" },
      { id: "py5", name: "Listas e Tuplas" },
      { id: "py6", name: "Dicionários" },
      { id: "py7", name: "Programação Orientada a Objetos" },
      { id: "py8", name: "Tratamento de Exceções" },
      { id: "py9", name: "Manipulação de Arquivos" },
      { id: "py10", name: "Bibliotecas e pip" },
    ],
  },
  {
    id: "chatbot",
    icon: "🤖",
    name: "Chat Bot IA",
    color: "#39ff14",
    materia: "Artificial Intelligence & Chatbot — IBM Watson",
    dependsOn: null,
    unlocks: null,
    quests: [
      { id: "ai1",  name: "IA Generativa e seu Impacto como Desenvolvedor" },
      { id: "ai2",  name: "Fundamentos de Inteligência Artificial" },
      { id: "ai3",  name: "Machine Learning — Aprendizado de Máquina" },
      { id: "ai4",  name: "NLP — Processamento de Linguagem Natural" },
      { id: "ai5",  name: "NLC — Classificador de Linguagem Natural" },
      { id: "ai6",  name: "NLU — Compreensão de Linguagem Natural" },
      { id: "ai7",  name: "Watson Assistant — Criação de Assistente Virtual" },
      { id: "ai8",  name: "STT — Speech to Text (Fala para Texto)" },
      { id: "ai9",  name: "TTS — Text to Speech (Texto para Fala)" },
      { id: "ai10", name: "Construção de Chatbot Cognitivo Interativo" },
      { id: "ai11", name: "Chatbot para E-commerce e Banking" },
      { id: "ai12", name: "UX Conversacional e Interação Natural" },
    ],
  },
  {
    id: "javascript",
    icon: "⚡",
    name: "JavaScript",
    color: "#ffd700",
    materia: "Front-end Design Engineering",
    dependsOn: null,
    unlocks: "frontend",
    quests: [
      { id: "js1", name: "Variáveis e Tipos (let, const, var)" },
      { id: "js2", name: "Funções e Arrow Functions" },
      { id: "js3", name: "Manipulação do DOM" },
      { id: "js4", name: "Eventos" },
      { id: "js5", name: "Arrays e Métodos (map, filter, reduce)" },
      { id: "js6", name: "Objetos e Desestruturação" },
      { id: "js7", name: "Promises e Async/Await" },
      { id: "js8", name: "Fetch API e AJAX" },
      { id: "js9", name: "React Básico" },
    ],
  },
  {
    id: "frontend",
    icon: "🌐",
    name: "FrontEnd",
    color: "#e34c26",
    materia: "Front-end Design Engineering",
    dependsOn: null,
    unlocks: null,
    quests: [
      { id: "fe1", name: "HTML Semântico" },
      { id: "fe2", name: "CSS Básico" },
      { id: "fe3", name: "Flexbox" },
      { id: "fe4", name: "CSS Grid" },
      { id: "fe5", name: "Responsividade e Media Queries" },
      { id: "fe6", name: "Animações CSS" },
      { id: "fe7", name: "Formulários HTML" },
      { id: "fe8", name: "Acessibilidade Web (W3C)" },
      { id: "fe9", name: "SEO Básico" },
    ],
  },
  {
    id: "java",
    icon: "☕",
    name: "Java",
    color: "#f89820",
    materia: "Programação Orientada a Objetos com Java",
    dependsOn: null,
    unlocks: null,
    quests: [
      { id: "jv1", name: "Sintaxe Básica e Tipos Primitivos" },
      { id: "jv2", name: "Classes e Objetos" },
      { id: "jv3", name: "Herança" },
      { id: "jv4", name: "Polimorfismo" },
      { id: "jv5", name: "Interfaces e Classes Abstratas" },
      { id: "jv6", name: "Tratamento de Exceções" },
      { id: "jv7", name: "Coleções (List, Map, Set)" },
      { id: "jv8", name: "Java com BD (JDBC)" },
    ],
  },
  {
    id: "database",
    icon: "🗄️",
    name: "Banco de Dados",
    color: "#4fc3f7",
    materia: "Building Relational Database",
    dependsOn: null,
    unlocks: null,
    quests: [
      { id: "db1", name: "Modelagem Relacional" },
      { id: "db2", name: "Diagrama ER" },
      { id: "db3", name: "SQL — SELECT básico" },
      { id: "db4", name: "SQL — INSERT, UPDATE, DELETE" },
      { id: "db5", name: "JOINs (INNER, LEFT, RIGHT)" },
      { id: "db6", name: "Subconsultas" },
      { id: "db7", name: "Índices e Performance" },
      { id: "db8", name: "Normalização (1FN, 2FN, 3FN)" },
    ],
  },
  {
    id: "business",
    icon: "💼",
    name: "Business Model",
    color: "#bb86fc",
    materia: "Software Engineering & Business Model",
    dependsOn: null,
    unlocks: null,
    quests: [
      { id: "bm1", name: "Business Model Canvas" },
      { id: "bm2", name: "Análise SWOT" },
      { id: "bm3", name: "Lean Startup" },
      { id: "bm4", name: "Design Thinking" },
      { id: "bm5", name: "Pitch e Apresentação" },
      { id: "bm6", name: "Análise de Mercado" },
      { id: "bm7", name: "Metodologias Ágeis (Scrum/Kanban)" },
    ],
  },
];

/* ─── Categorias da Árvore de Habilidades ─── */
const SKILL_CATEGORIES = [
  {
    id:    "dev",
    name:  "Desenvolvimento",
    icon:  "💻",
    color: "#00d4ff",
    desc:  "Habilidades de desenvolvimento de software — FIAP 1º Ano",
    rows: [
      { left: "python",     right: "chatbot"  }, // 🐍  🤖
      { left: "javascript", right: "frontend" }, // ⚡  🌐
      { left: "java",       right: "database" }, // ☕  🗄️
      { left: "business",   right: null       }, // 💼
    ],
  },
  // Futuras categorias:
  // { id: "arte", name: "Arte & Design", icon: "🎨", color: "#ff79c6", desc: "Habilidades criativas", rows: [] },
];

/* ═══════════════════════════════════════════════════════════
   SKILL TREE MODULE
═══════════════════════════════════════════════════════════ */
function SkillTreeModule() {
  const [done,      setDone]      = useLS("fiap_skilltree_done", {});
  const [selected,  setSelected]  = useState(null);
  const [activecat, setActivecat] = useState(SKILL_CATEGORIES[0].id);

  /* helpers */
  const progress = (skill) => {
    const c = skill.quests.filter(q => done[q.id]).length;
    return { done: c, total: skill.quests.length, pct: skill.quests.length ? (c / skill.quests.length) * 100 : 0 };
  };

  const isUnlocked    = (id) => { const s = SKILL_TREE.find(x => x.id === id); return s ? progress(s).pct >= 100 : false; };
  const isAccessible  = (id) => { const s = SKILL_TREE.find(x => x.id === id); return s && (!s.dependsOn || isUnlocked(s.dependsOn)); };

  const toggleQuest = (qid) => setDone(prev => ({ ...prev, [qid]: !prev[qid] }));

  const sel = SKILL_TREE.find(s => s.id === selected);
  const totalQuests    = SKILL_TREE.reduce((a, s) => a + s.quests.length, 0);
  const totalCompleted = SKILL_TREE.reduce((a, s) => a + s.quests.filter(q => done[q.id]).length, 0);
  const totalUnlocked  = SKILL_TREE.filter(s => isUnlocked(s.id)).length;
  const curCat         = SKILL_CATEGORIES.find(c => c.id === activecat);

  /* ── Skill Node Card ── */
  const SkillNode = ({ skillId }) => {
    if (!skillId) return <div style={{ width: "160px", flex: "0 0 160px" }} />;
    const skill = SKILL_TREE.find(s => s.id === skillId);
    const prog  = progress(skill);
    const unlk  = isUnlocked(skill.id);
    const acc   = isAccessible(skill.id);
    const active = selected === skill.id;

    return (
      <div
        onClick={() => acc ? setSelected(active ? null : skill.id) : null}
        style={{
          flex: "0 0 160px", width: "160px",
          border: `3px solid ${active ? skill.color : unlk ? skill.color : acc ? skill.color + "66" : "#0d2860"}`,
          background: active ? skill.color + "18" : unlk ? skill.color + "12" : "#070d22",
          padding: "14px 10px",
          cursor: acc ? "pointer" : "not-allowed",
          opacity: acc ? 1 : 0.4,
          position: "relative",
          transition: "border-color .2s, background .2s",
          boxShadow: unlk ? `0 0 14px ${skill.color}55, 0 0 30px ${skill.color}22` : "none",
        }}
      >
        {/* corner pixels */}
        <div style={{ position:"absolute", top:-4, right:-4, width:6, height:6, background:"#020a1e", border:`2px solid ${skill.color}` }} />
        <div style={{ position:"absolute", bottom:-4, left:-4, width:6, height:6, background:"#020a1e", border:`2px solid ${skill.color}` }} />

        {/* lock overlay */}
        {!acc && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>
            🔒
          </div>
        )}

        <div style={{ textAlign:"center", marginBottom:"8px", fontSize:"32px", filter: unlk ? `drop-shadow(0 0 8px ${skill.color})` : "none" }}>
          {skill.icon}
        </div>
        <div className="px-font" style={{ fontSize:"7px", color: unlk ? skill.color : acc ? skill.color + "bb" : "#0d2860", textAlign:"center", marginBottom:"6px", wordBreak:"break-word" }}>
          {skill.name}
        </div>

        {/* mini barra de progresso */}
        <div style={{ display:"flex", gap:"2px", justifyContent:"center", flexWrap:"wrap" }}>
          {Array.from({ length: skill.quests.length }, (_, i) => (
            <div key={i} style={{
              width: "6px", height: "6px",
              background: i < prog.done ? skill.color : "#0a1840",
              border: `1px solid ${i < prog.done ? skill.color + "88" : "#071020"}`,
            }} />
          ))}
        </div>

        <div className="px-font" style={{ fontSize:"6px", color: skill.color + "99", textAlign:"center", marginTop:"6px" }}>
          {prog.done}/{prog.total} QUESTS
        </div>

        {unlk && (
          <div className="px-font" style={{ fontSize:"6px", color:"#39ff14", textAlign:"center", marginTop:"4px", textShadow:"0 0 6px #39ff14" }}>
            ✓ DESBLOQUEADA
          </div>
        )}
      </div>
    );
  };

  /* ── Seta de dependência (reservado para uso futuro) ── */
  // const Arrow = ({ color }) => (...);

  return (
    <div style={{ maxWidth:"900px", margin:"0 auto" }}>

      {/* ── Cabeçalho ── */}
      <div className="px-panel-hero" style={{ marginBottom:"24px" }}>
        <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #ffd700" }} />
        <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #ffd700" }} />
        <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"16px" }}>
          <div className="px-float" style={{ fontSize:"44px" }}>🌳</div>
          <div>
            <div className="px-font" style={{ fontSize:"11px", color:"#ffd700", textShadow:"0 0 10px rgba(255,215,0,.6)" }}>
              ÁRVORE DE HABILIDADES
            </div>
            <div className="px-body" style={{ fontSize:"15px", color:"#4a3000", marginTop:"4px" }}>
              FIAP — 1º Ano · Técnico em Desenvolvimento de Sistemas
            </div>
          </div>
        </div>

        {/* stats globais */}
        <div style={{ display:"flex", gap:"16px", flexWrap:"wrap" }}>
          {[
            { label:"HABILIDADES DESBLOQUEADAS", val:`${totalUnlocked}/${SKILL_TREE.length}`, color:"#ffd700" },
            { label:"QUESTS CONCLUÍDAS",         val:`${totalCompleted}/${totalQuests}`,       color:"#39ff14" },
            { label:"PROGRESSO GERAL",           val:`${Math.round((totalCompleted/totalQuests)*100)}%`,color:"#4fc3f7" },
          ].map(s => (
            <div key={s.label} className="px-panel" style={{ flex:1, minWidth:"160px", marginBottom:0 }}>
              <div className="px-font" style={{ fontSize:"6px", color:s.color, marginBottom:"6px" }}>{s.label}</div>
              <div className="px-font" style={{ fontSize:"16px", color:s.color, textShadow:`0 0 8px ${s.color}88` }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Abas de Categorias ── */}
      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"16px" }}>
        {SKILL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActivecat(cat.id); setSelected(null); }}
            style={{
              padding:"10px 16px",
              border:`3px solid ${activecat === cat.id ? cat.color : cat.color + "44"}`,
              background: activecat === cat.id ? cat.color + "18" : "#04091a",
              cursor:"pointer",
              fontFamily:"'Press Start 2P',monospace", fontSize:"7px",
              color: activecat === cat.id ? cat.color : "#1a4070",
              boxShadow: activecat === cat.id ? `0 0 12px ${cat.color}44, 3px 3px 0 ${cat.color}44` : "3px 3px 0 #020a1e",
              transition:"all .15s",
            }}
          >
            {cat.icon} {cat.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Árvore Visual ── */}
      <div className="px-panel" style={{ marginBottom:"24px", borderColor: curCat?.color + "88" }}>
        <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:`2px solid ${curCat?.color || "#00d4ff"}` }} />
        <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:`2px solid ${curCat?.color || "#00d4ff"}` }} />
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
          <span style={{ fontSize:"24px" }}>{curCat?.icon}</span>
          <div>
            <div className="px-font" style={{ fontSize:"8px", color: curCat?.color || "#00d4ff" }}>▶ {curCat?.name.toUpperCase()}</div>
            <div className="px-body" style={{ fontSize:"14px", color:"#1a4070", marginTop:"2px" }}>{curCat?.desc}</div>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          {(curCat?.rows || []).map((row, i) => {
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"0" }}>
                <SkillNode skillId={row.left} />
                {row.right && (
                  <>
                    <div style={{ width:"16px", flex:"0 0 16px" }} />
                    <SkillNode skillId={row.right} />
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-body" style={{ fontSize:"14px", color:"#0d2860", marginTop:"16px" }}>
          🔒 Habilidades bloqueadas requerem a conclusão da habilidade anterior
        </div>
      </div>

      {/* ── Painel de Quests (ao clicar numa habilidade) ── */}
      {sel && (
        <div className="px-panel" style={{ borderColor: sel.color, marginBottom:"24px" }}>
          <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:`2px solid ${sel.color}` }} />
          <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:`2px solid ${sel.color}` }} />

          {/* cabeçalho do painel */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <span style={{ fontSize:"36px", filter:`drop-shadow(0 0 8px ${sel.color})` }}>{sel.icon}</span>
              <div>
                <div className="px-font" style={{ fontSize:"10px", color:sel.color, textShadow:`0 0 8px ${sel.color}66` }}>
                  {sel.name}
                </div>
                <div className="px-body" style={{ fontSize:"14px", color:"#4a5070", marginTop:"2px" }}>
                  {sel.materia}
                </div>
                {sel.dependsOn && (
                  <div className="px-body" style={{ fontSize:"13px", color:"#f89820", marginTop:"2px" }}>
                    Requer: {SKILL_TREE.find(s => s.id === sel.dependsOn)?.name}
                    {isUnlocked(sel.dependsOn) ? " ✓" : " 🔒"}
                  </div>
                )}
              </div>
            </div>
            <button
              className="px-btn px-btn-ghost"
              style={{ padding:"8px 14px", fontSize:"10px" }}
              onClick={() => setSelected(null)}
            >
              ✕ FECHAR
            </button>
          </div>

          {/* barra de progresso */}
          <div style={{ marginBottom:"16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
              <span className="px-font" style={{ fontSize:"7px", color:sel.color }}>PROGRESSO</span>
              <span className="px-font" style={{ fontSize:"7px", color:sel.color }}>
                {progress(sel).done}/{progress(sel).total} QUESTS CONCLUÍDAS
              </span>
            </div>
            <PixelBar value={progress(sel).pct} color={sel.color} segments={sel.quests.length} />
          </div>

          {isUnlocked(sel.id) && (
            <div className="px-panel" style={{ borderColor:"#39ff14", marginBottom:"16px", background:"#001a00" }}>
              <div className="px-font" style={{ fontSize:"9px", color:"#39ff14", textShadow:"0 0 10px #39ff14" }}>
                ✓ HABILIDADE DESBLOQUEADA! PARABÉNS, HERÓI!
              </div>
              {sel.unlocks && (
                <div className="px-body" style={{ fontSize:"14px", color:"#39ff14aa", marginTop:"6px" }}>
                  Você desbloqueou acesso a: {SKILL_TREE.find(s => s.id === sel.unlocks)?.icon} {SKILL_TREE.find(s => s.id === sel.unlocks)?.name}
                </div>
              )}
            </div>
          )}

          {/* lista de quests */}
          <div className="px-font" style={{ fontSize:"8px", color:"#00d4ff", marginBottom:"12px" }}>▶ QUESTS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {sel.quests.map((q, i) => {
              const completed = !!done[q.id];
              return (
                <div
                  key={q.id}
                  onClick={() => toggleQuest(q.id)}
                  style={{
                    display:"flex", alignItems:"center", gap:"12px",
                    padding:"10px 14px",
                    background: completed ? sel.color + "18" : "#020a1e",
                    border: `2px solid ${completed ? sel.color : "#0d2860"}`,
                    cursor:"pointer",
                    transition:"background .15s, border-color .15s",
                  }}
                >
                  {/* checkbox pixel */}
                  <div style={{
                    width:"14px", height:"14px", flexShrink:0,
                    border:`2px solid ${completed ? sel.color : "#0d2860"}`,
                    background: completed ? sel.color : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    {completed && <span style={{ color:"#020a1e", fontSize:"10px", fontWeight:"bold" }}>✓</span>}
                  </div>

                  <span className="px-body" style={{ fontSize:"17px", color: completed ? sel.color : "#4a5070", flex:1, textDecoration: completed ? "line-through" : "none" }}>
                    {String(i + 1).padStart(2, "0")}. {q.name}
                  </span>

                  {completed && <PxBadge color={sel.color}>+XP</PxBadge>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Dica ── */}
      {!sel && (
        <div className="px-body" style={{ textAlign:"center", fontSize:"16px", color:"#0d2860", padding:"16px" }}>
          Clique em uma habilidade desbloqueada para ver e completar suas quests
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CALENDÁRIO
═══════════════════════════════════════════════════════════ */
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const EVENT_COLORS = [
  { id:"aula",     label:"Aula",         color:"#00d4ff" },
  { id:"prova",    label:"Prova/Entrega", color:"#ff5555" },
  { id:"projeto",  label:"Projeto",      color:"#ffd700" },
  { id:"pessoal",  label:"Pessoal",      color:"#bb86fc" },
  { id:"fiap",     label:"FIAP",         color:"#39ff14" },
];

function CalendarioModule() {
  const today  = new Date();
  const [ano,  setAno]  = useState(today.getFullYear());
  const [mes,  setMes]  = useState(today.getMonth());
  const [eventos, setEventos] = useLS("mylog_calendario", {});
  const [modal, setModal]     = useState(null);   // { dia, mes, ano }
  const [form, setForm]       = useState({ titulo:"", tipo:"aula", hora:"" });

  /* chave do dia: "2026-04-09" */
  const dKey = (a, m, d) => `${a}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  /* dias do mês com offset de semana */
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias   = new Date(ano, mes+1, 0).getDate();
  const celulas     = primeiroDia + totalDias;
  const linhas      = Math.ceil(celulas / 7);

  const addEvento = () => {
    if (!form.titulo.trim()) return;
    const k = dKey(modal.ano, modal.mes, modal.dia);
    setEventos(prev => ({
      ...prev,
      [k]: [...(prev[k] || []), { id: uid(), ...form }],
    }));
    setForm({ titulo:"", tipo:"aula", hora:"" });
  };

  const delEvento = (k, id) => {
    setEventos(prev => ({ ...prev, [k]: (prev[k] || []).filter(e => e.id !== id) }));
  };

  const navMes = (d) => {
    let m = mes + d, a = ano;
    if (m < 0)  { m = 11; a--; }
    if (m > 11) { m = 0;  a++; }
    setMes(m); setAno(a);
  };

  const modalKey = modal ? dKey(modal.ano, modal.mes, modal.dia) : null;
  const modalEvs = modalKey ? (eventos[modalKey] || []) : [];

  return (
    <div>
      {/* ── Cabeçalho ── */}
      <div className="px-panel-hero" style={{ marginBottom:"16px" }}>
        <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #ffd700" }} />
        <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #ffd700" }} />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            <span className="px-float" style={{ fontSize:"36px" }}>📅</span>
            <div>
              <div className="px-font" style={{ fontSize:"10px", color:"#ffd700", textShadow:"0 0 10px rgba(255,215,0,.6)" }}>
                CALENDÁRIO
              </div>
              <div className="px-body" style={{ fontSize:"16px", color:"#4a3000", marginTop:"2px" }}>
                Marque seus compromissos
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <button className="px-btn px-btn-ghost" style={{ padding:"8px 14px", fontSize:"12px" }} onClick={()=>navMes(-1)}>◀</button>
            <div className="px-font" style={{ fontSize:"9px", color:"#ffd700", minWidth:"180px", textAlign:"center" }}>
              {MESES[mes].toUpperCase()} {ano}
            </div>
            <button className="px-btn px-btn-ghost" style={{ padding:"8px 14px", fontSize:"12px" }} onClick={()=>navMes(1)}>▶</button>
          </div>
        </div>
      </div>

      {/* ── Legenda ── */}
      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"12px" }}>
        {EVENT_COLORS.map(c => (
          <div key={c.id} style={{ display:"flex", alignItems:"center", gap:"5px" }}>
            <div style={{ width:10, height:10, background:c.color, border:`1px solid ${c.color}88` }} />
            <span className="px-font" style={{ fontSize:"6px", color:c.color }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* ── Grade do Calendário ── */}
      <div className="px-panel" style={{ padding:"12px" }}>
        <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff" }} />
        <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff" }} />

        {/* cabeçalho dos dias da semana */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px", marginBottom:"6px" }}>
          {DIAS_SEMANA.map(d => (
            <div key={d} className="px-font" style={{ fontSize:"6px", color:"#1a4070", textAlign:"center", padding:"4px 0" }}>{d}</div>
          ))}
        </div>

        {/* células */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px" }}>
          {Array.from({ length: linhas * 7 }, (_, i) => {
            const dia = i - primeiroDia + 1;
            const valido = dia >= 1 && dia <= totalDias;
            const k = valido ? dKey(ano, mes, dia) : null;
            const evs = k ? (eventos[k] || []) : [];
            const isHoje = valido && dia === today.getDate() && mes === today.getMonth() && ano === today.getFullYear();
            return (
              <div
                key={i}
                onClick={() => valido && setModal({ dia, mes, ano })}
                style={{
                  minHeight:"52px", padding:"4px",
                  background: isHoje ? "#00d4ff18" : valido ? "#04091a" : "transparent",
                  border: isHoje ? "2px solid #00d4ff" : valido ? "1px solid #0d2860" : "1px solid transparent",
                  cursor: valido ? "pointer" : "default",
                  transition:"background .15s, border-color .15s",
                  position:"relative",
                }}
              >
                {valido && (
                  <>
                    <div className="px-font" style={{ fontSize:"6px", color: isHoje ? "#00d4ff" : "#1a4070", marginBottom:"3px", textAlign:"right" }}>
                      {dia}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                      {evs.slice(0,2).map(ev => {
                        const cor = EVENT_COLORS.find(c=>c.id===ev.tipo)?.color || "#00d4ff";
                        return (
                          <div key={ev.id} style={{
                            background: cor + "33",
                            borderLeft: `3px solid ${cor}`,
                            padding:"1px 3px",
                          }}>
                            <span className="px-body" style={{ fontSize:"11px", color:cor, whiteSpace:"nowrap", overflow:"hidden", display:"block", maxWidth:"100%" }}>
                              {ev.titulo}
                            </span>
                          </div>
                        );
                      })}
                      {evs.length > 2 && (
                        <div className="px-font" style={{ fontSize:"5px", color:"#1a4070" }}>+{evs.length-2}</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modal do Dia ── */}
      {modal && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(2,7,26,.85)",
          display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:200, padding:"16px",
        }} onClick={e => e.target===e.currentTarget && setModal(null)}>
          <div className="px-panel" style={{ width:"100%", maxWidth:"420px", maxHeight:"80vh", overflowY:"auto" }}>
            <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff" }} />
            <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff" }} />

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
              <div className="px-font" style={{ fontSize:"8px", color:"#00d4ff" }}>
                📅 {String(modal.dia).padStart(2,"0")}/{String(modal.mes+1).padStart(2,"0")}/{modal.ano}
              </div>
              <button className="px-btn px-btn-ghost" style={{ padding:"6px 10px", fontSize:"10px" }} onClick={()=>setModal(null)}>✕</button>
            </div>

            {/* form novo evento */}
            <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"16px" }}>
              <input
                className="px-input"
                placeholder="> Nome do compromisso..."
                value={form.titulo}
                onChange={e=>setForm(p=>({...p,titulo:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&addEvento()}
              />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                <div>
                  <PxLabel color="#00d4ff">TIPO</PxLabel>
                  <select className="px-input" value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))}>
                    {EVENT_COLORS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <PxLabel color="#00d4ff">HORÁRIO</PxLabel>
                  <input type="time" className="px-input" value={form.hora} onChange={e=>setForm(p=>({...p,hora:e.target.value}))} />
                </div>
              </div>
              <button className="px-btn px-btn-cyan" onClick={addEvento}>+ ADICIONAR</button>
            </div>

            {/* lista de eventos do dia */}
            {modalEvs.length > 0 && (
              <>
                <div className="px-font" style={{ fontSize:"7px", color:"#1a4070", marginBottom:"8px" }}>▶ COMPROMISSOS</div>
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  {modalEvs.map(ev => {
                    const cor = EVENT_COLORS.find(c=>c.id===ev.tipo)?.color || "#00d4ff";
                    return (
                      <div key={ev.id} style={{
                        display:"flex", alignItems:"center", gap:"10px",
                        padding:"8px 10px", background:"#04091a",
                        border:`2px solid ${cor}44`, borderLeft:`4px solid ${cor}`,
                      }}>
                        <div style={{ flex:1 }}>
                          <div className="px-body" style={{ fontSize:"17px", color:cor }}>{ev.titulo}</div>
                          {ev.hora && <div className="px-font" style={{ fontSize:"6px", color:cor+"88", marginTop:"2px" }}>⏰ {ev.hora}</div>}
                          <div className="px-font" style={{ fontSize:"6px", color:"#1a4070", marginTop:"2px" }}>
                            {EVENT_COLORS.find(c=>c.id===ev.tipo)?.label}
                          </div>
                        </div>
                        <button className="px-btn px-btn-danger" style={{ padding:"5px 8px", fontSize:"8px" }} onClick={()=>delEvento(modalKey,ev.id)}>✕</button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {modalEvs.length === 0 && (
              <div className="px-body" style={{ textAlign:"center", color:"#0d2860", fontSize:"16px", padding:"12px" }}>
                Nenhum compromisso neste dia
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ÁLBUM DE MEMÓRIAS
═══════════════════════════════════════════════════════════ */
function AlbumModule({ memorias, setMemorias }) {
  const [foto,    setFoto]    = useState(null);
  const [legenda, setLegenda] = useState("");
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const salvar = () => {
    if (!foto) return;
    setMemorias(prev => [...prev, { id: uid(), fotoUrl: foto, legenda: legenda.trim(), data: new Date().toISOString() }]);
    setFoto(null);
    setLegenda("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const deletar = (id) => {
    if (window.confirm("Remover esta memória?")) setMemorias(prev => prev.filter(m => m.id !== id));
  };

  const fmt = (iso) => { const d = new Date(iso); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; };

  return (
    <div>
      <PxTitle icon="📸" color="#c8a000">ÁLBUM DE MEMÓRIAS</PxTitle>

      {/* ── Form nova memória ── */}
      <div className="px-panel-hero" style={{ marginBottom:"24px" }}>
        <div className="px-font" style={{ fontSize:"7px", color:"#f0c030", marginBottom:"16px" }}>✦ NOVA MEMÓRIA</div>

        {foto ? (
          <div style={{ position:"relative", display:"inline-block", marginBottom:"16px" }}>
            <img src={foto} alt="preview" style={{ maxWidth:"100%", maxHeight:"220px", objectFit:"contain", border:"3px solid #c8a000", display:"block" }} />
            <button onClick={() => { setFoto(null); if(fileRef.current) fileRef.current.value=""; }}
              style={{ position:"absolute", top:"6px", right:"6px", background:"#06080f", border:"2px solid #e04040", color:"#e04040", fontFamily:"'Press Start 2P',monospace", fontSize:"6px", padding:"4px 6px", cursor:"pointer" }}>✕</button>
          </div>
        ) : (
          <div onClick={() => fileRef.current?.click()}
            style={{ border:"3px dashed #1e3060", padding:"32px", textAlign:"center", cursor:"pointer", background:"#06080f", marginBottom:"16px", transition:"border-color .15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor="#c8a000"}
            onMouseLeave={e => e.currentTarget.style.borderColor="#1e3060"}>
            <div style={{ fontSize:"48px", marginBottom:"8px" }}>📷</div>
            <div className="px-font" style={{ fontSize:"6px", color:"#2a4880" }}>CLIQUE PARA ESCOLHER UMA FOTO</div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />

        <div className="px-font" style={{ fontSize:"6px", color:"#3060b8", letterSpacing:".15em", marginBottom:"8px" }}>LEGENDA</div>
        <textarea
          value={legenda} onChange={e => setLegenda(e.target.value)} maxLength={200} rows={3}
          placeholder="Escreva uma legenda para esta memória..."
          style={{ width:"100%", boxSizing:"border-box", background:"#06080f", border:"3px solid #1e3060", color:"#c8deff", fontFamily:"'VT323',monospace", fontSize:"18px", padding:"10px 12px", outline:"none", resize:"vertical", marginBottom:"4px" }}
        />
        <div className="px-font" style={{ fontSize:"5px", color:"#1e3060", marginBottom:"16px" }}>{legenda.length}/200</div>

        <button onClick={salvar} disabled={!foto}
          style={{ padding:"14px 24px", background: foto?"linear-gradient(135deg,#201400,#3a2800)":"#0c1428", border:`3px solid ${foto?"#c8a000":"#1e3060"}`, color: foto?"#f0c030":"#2a4880", fontFamily:"'Press Start 2P',monospace", fontSize:"8px", cursor: foto?"pointer":"not-allowed", boxShadow: foto?"3px 3px 0 #4a3000":"none" }}>
          ✦ GUARDAR MEMÓRIA
        </button>
      </div>

      {/* ── Grade de memórias ── */}
      {memorias.length === 0 ? (
        <div className="px-panel" style={{ textAlign:"center", padding:"40px" }}>
          <div style={{ fontSize:"56px", marginBottom:"12px", opacity:.4 }}>🗃️</div>
          <div className="px-font" style={{ fontSize:"7px", color:"#2a4880" }}>NENHUMA MEMÓRIA AINDA</div>
          <div className="px-body" style={{ fontSize:"16px", color:"#1e3060", marginTop:"8px" }}>Adicione sua primeira foto acima!</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"16px" }}>
          {[...memorias].reverse().map(m => (
            <div key={m.id} style={{ background:"#0c1630", border:"3px solid #1e3060", boxShadow:"0 0 0 1px #06080f", overflow:"hidden" }}>
              <div style={{ position:"relative", cursor:"pointer" }} onClick={() => setPreview(m)}>
                <img src={m.fotoUrl} alt={m.legenda||"memória"} style={{ width:"100%", height:"180px", objectFit:"cover", display:"block" }} />
                <button onClick={e => { e.stopPropagation(); deletar(m.id); }}
                  style={{ position:"absolute", top:"6px", right:"6px", background:"#06080fee", border:"2px solid #e04040", color:"#e04040", fontFamily:"'Press Start 2P',monospace", fontSize:"5px", padding:"3px 5px", cursor:"pointer" }}>✕</button>
              </div>
              <div style={{ padding:"10px 12px" }}>
                {m.legenda && <div className="px-body" style={{ fontSize:"16px", color:"#c8deff", marginBottom:"6px", lineHeight:1.4 }}>{m.legenda}</div>}
                <div className="px-font" style={{ fontSize:"5px", color:"#2a4880" }}>📅 {fmt(m.data)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Lightbox ── */}
      {preview && (
        <div onClick={() => setPreview(null)}
          style={{ position:"fixed", inset:0, background:"#06080fee", zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", cursor:"pointer" }}>
          <div style={{ maxWidth:"90vw", maxHeight:"90vh", textAlign:"center" }} onClick={e => e.stopPropagation()}>
            <img src={preview.fotoUrl} alt={preview.legenda} style={{ maxWidth:"100%", maxHeight:"70vh", objectFit:"contain", border:"3px solid #c8a000", display:"block", margin:"0 auto" }} />
            {preview.legenda && <div className="px-body" style={{ fontSize:"20px", color:"#c8deff", marginTop:"12px" }}>{preview.legenda}</div>}
            <div className="px-font" style={{ fontSize:"5px", color:"#2a4880", marginTop:"6px" }}>📅 {fmt(preview.data)}</div>
            <button onClick={() => setPreview(null)}
              style={{ marginTop:"14px", background:"none", border:"2px solid #1e3060", color:"#3060b8", fontFamily:"'Press Start 2P',monospace", fontSize:"6px", padding:"8px 14px", cursor:"pointer" }}>✕ FECHAR</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DUNGEON MODE — Foco total com trilha sonora épica
═══════════════════════════════════════════════════════════ */
function DungeonModeOverlay({ onExit, nomeHeroi }) {
  const icons = useContext(ThemeContext);
  const [seconds, setSeconds] = useState(0);
  const [ambientOn, setAmbientOn] = useState(false);
  const ambientRef = useRef(null);
  const acRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const startAmbient = () => {
    try {
      if (!acRef.current) acRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = acRef.current;

      const master = ctx.createGain();
      master.gain.value = 0.12;
      master.connect(ctx.destination);

      // Drone grave
      const drone = ctx.createOscillator();
      drone.type = "sawtooth"; drone.frequency.value = 55;
      drone.connect(master); drone.start();

      // LFO de vibrato
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.frequency.value = 0.08; lfoG.gain.value = 2.5;
      lfo.connect(lfoG); lfoG.connect(drone.frequency); lfo.start();

      // Harmônico médio
      const mid = ctx.createOscillator();
      const midG = ctx.createGain();
      mid.type = "sine"; mid.frequency.value = 110; midG.gain.value = 0.4;
      mid.connect(midG); midG.connect(master); mid.start();

      // Nota alta suave
      const high = ctx.createOscillator();
      const highG = ctx.createGain();
      high.type = "sine"; high.frequency.value = 220; highG.gain.value = 0.15;
      high.connect(highG); highG.connect(master); high.start();

      ambientRef.current = { drone, lfo, mid, high, master };
      setAmbientOn(true);
    } catch(e) {}
  };

  const stopAmbient = () => {
    try {
      if (ambientRef.current) {
        const { drone, lfo, mid, high } = ambientRef.current;
        [drone, lfo, mid, high].forEach(n => { try { n.stop(); } catch(e) {} });
        ambientRef.current = null;
      }
    } catch(e) {}
    setAmbientOn(false);
  };

  useEffect(() => () => stopAmbient(), []);

  const fmt = s =>
    `${String(Math.floor(s / 3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:2000,
      background:"radial-gradient(ellipse at 50% 25%, #0a0a2a 0%, #000006 75%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
    }}>
      {/* Scan lines sutis */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.08) 3px,rgba(0,0,0,0.08) 4px)", pointerEvents:"none" }} />

      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"24px" }}>
        <div className="px-font" style={{ fontSize:"7px", color:"#1e3060", letterSpacing:".3em", marginBottom:"20px" }}>
          ⚔ MODO DUNGEON ⚔
        </div>

        {/* Ícone pulsante */}
        <div style={{ fontSize:"64px", marginBottom:"16px", animation:"dungeonPulse 2s ease-in-out infinite" }}>
          {icons.dungeon}
        </div>

        {/* Cronômetro */}
        <div className="px-font" style={{
          fontSize:"clamp(28px,7vw,56px)", color:"#c8a000",
          textShadow:"0 0 30px rgba(200,160,0,.9), 0 0 60px rgba(200,160,0,.3)",
          letterSpacing:".12em", marginBottom:"12px",
        }}>
          {fmt(seconds)}
        </div>

        <div className="px-font" style={{ fontSize:"7px", color:"#1e3060", marginBottom:"8px", letterSpacing:".12em" }}>
          FOCO TOTAL
        </div>
        <div className="px-body" style={{ fontSize:"18px", color:"#2a4880", marginBottom:"36px" }}>
          {nomeHeroi} · distrações bloqueadas · concentração máxima
        </div>

        {/* Trilha sonora */}
        <div className="px-panel" style={{ width:"100%", maxWidth:"420px", marginBottom:"24px", textAlign:"center" }}>
          <div className="px-font" style={{ fontSize:"7px", color:"#4898f0", marginBottom:"12px" }}>
            🎵 TRILHA SONORA ÉPICA
          </div>
          <div style={{ display:"flex", gap:"8px", justifyContent:"center" }}>
            {["🔥 BATALHA", "🌙 DUNGEON", "🌊 FLORESTA"].map((label, i) => (
              <button key={i}
                onClick={() => { if (!ambientOn) startAmbient(); else stopAmbient(); }}
                className="px-btn px-btn-purple"
                style={{ padding:"8px 10px", fontSize:"6px", background: ambientOn && i===1 ? "#4898f044" : undefined }}>
                {ambientOn && i===1 ? "▮▮" : "▶"} {label}
              </button>
            ))}
          </div>
          {ambientOn && (
            <div className="px-body" style={{ fontSize:"14px", color:"#4898f088", marginTop:"10px" }}>
              ♪ trilha épica ativa — use fones para melhor experiência ♪
            </div>
          )}
        </div>

        <div style={{ display:"flex", gap:"14px" }}>
          <button
            onClick={() => { stopAmbient(); onExit(); }}
            className="px-btn px-btn-danger"
            style={{ padding:"14px 28px", fontSize:"9px" }}
          >
            ✕ SAIR DA DUNGEON
          </button>
        </div>

        <div className="px-font" style={{ fontSize:"5px", color:"#0d1a40", marginTop:"20px", letterSpacing:".1em" }}>
          PRESSIONE ESC PARA SAIR
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   RAID FINAL — META SEMESTRAL (Boss Fight)
═══════════════════════════════════════════════════════════ */
function RaidFinalModule({ nomeHeroi }) {
  const icons = useContext(ThemeContext);
  const [raid, setRaid]     = useLS("mylog_raid_final", RAID_DEFAULTS);
  const [showAdd, setShowAdd] = useState(false);
  const [newObj, setNewObj]  = useState("");
  const [editTitle, setEditTitle] = useState(false);

  const total   = raid.objetivos.length;
  const done    = raid.objetivos.filter(o => o.done).length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
  const bossHp  = 100 - pct;
  const totalXp = raid.objetivos.filter(o => o.done).reduce((s, o) => s + (o.xp || 200), 0);
  const allDone = pct === 100;

  const toggle = id => {
    setRaid(p => ({ ...p, objetivos: p.objetivos.map(o => o.id===id ? {...o, done:!o.done} : o) }));
    fireSound("success");
  };
  const delObj = id => setRaid(p => ({ ...p, objetivos: p.objetivos.filter(o => o.id !== id) }));
  const addObj = () => {
    if (!newObj.trim()) return;
    setRaid(p => ({ ...p, objetivos: [...p.objetivos, { id: uid(), titulo: newObj.trim(), xp: 200, done: false }] }));
    setNewObj(""); setShowAdd(false);
    fireSound("quest_add");
  };

  const bossColor = bossHp > 60 ? "#ff2200" : bossHp > 30 ? "#ff8800" : "#ffdd00";

  return (
    <div style={{ maxWidth:"860px", margin:"0 auto" }}>

      {/* ── BOSS BANNER ── */}
      <div className="px-panel-hero" style={{ textAlign:"center", padding:"32px 24px", marginBottom:"24px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #ffd700", zIndex:2 }} />
        <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #ffd700", zIndex:2 }} />

        {/* Splash art do boss */}
        <div style={{ fontSize:"88px", display:"block", marginBottom:"16px",
          animation: allDone ? "pxFloat 2s ease-in-out infinite" : "dungeonPulse 1.8s ease-in-out infinite",
          filter: allDone ? "drop-shadow(0 0 24px #39ff14)" : `drop-shadow(0 0 20px ${bossColor})` }}>
          {allDone ? icons.tabs.goals : bossHp > 60 ? "💀" : bossHp > 30 ? "🩻" : "⚰️"}
        </div>

        {editTitle ? (
          <input className="px-input" value={raid.titulo}
            style={{ textAlign:"center", fontSize:"16px", marginBottom:"12px" }}
            onChange={e => setRaid(p => ({...p, titulo: e.target.value}))}
            onBlur={() => setEditTitle(false)} autoFocus />
        ) : (
          <div className="px-font" onClick={() => setEditTitle(true)} style={{
            fontSize:"clamp(7px,2vw,12px)", color: allDone ? "#39ff14" : "#f0c030",
            letterSpacing:".08em", marginBottom:"10px", cursor:"pointer",
            textShadow: allDone ? "0 0 16px #39ff1488" : "0 0 10px rgba(200,160,0,.5)",
          }} title="Clique para editar">
            {raid.titulo}
          </div>
        )}

        <div className="px-font" style={{ fontSize:"8px", color: allDone ? "#39ff14" : bossColor,
          textShadow:`0 0 16px ${allDone ? "#39ff1466" : bossColor+"66"}`, marginBottom:"16px" }}>
          {allDone ? "✓ RAID CONCLUÍDO — HERÓI LENDÁRIO!" : `☠ CHEFE DO SEMESTRE · HP ${bossHp}%`}
        </div>

        {/* Boss HP Bar */}
        <div style={{ marginBottom:"10px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
            <span className="px-font" style={{ fontSize:"7px", color: allDone ? "#39ff14" : "#ff4444" }}>
              {allDone ? "✓ DERROTADO" : "☠ BOSS HP"}
            </span>
            <span className="px-font" style={{ fontSize:"7px", color: allDone ? "#39ff14" : "#ff4444" }}>
              {done}/{total} OBJETIVOS CONCLUÍDOS
            </span>
          </div>
          <div style={{ display:"flex", gap:"2px" }}>
            {Array.from({ length: 25 }, (_, i) => {
              const seg = 25 - i;
              const filled = seg <= Math.round((bossHp / 100) * 25);
              return (
                <div key={i} style={{
                  flex:1, height:"14px",
                  background: filled
                    ? (bossHp > 60 ? "#ff2200" : bossHp > 30 ? "#ff8800" : "#ffdd00")
                    : "#001800",
                  border:`1px solid ${filled ? "#ff000033" : "#0a1040"}`,
                  transition:"background .4s",
                }} />
              );
            })}
          </div>
        </div>

        <div style={{ display:"flex", gap:"16px", justifyContent:"center", flexWrap:"wrap", marginTop:"12px" }}>
          <div className="px-font" style={{ fontSize:"7px", color:"#4a3000" }}>
            +{totalXp.toLocaleString("pt-BR")} XP ACUMULADOS
          </div>
          {raid.deadline && (
            <div className="px-font" style={{ fontSize:"7px", color:"#1e3060" }}>
              ⚔ PRAZO: {new Date(raid.deadline + "T12:00:00").toLocaleDateString("pt-BR")}
            </div>
          )}
        </div>
      </div>

      {/* ── OBJETIVOS ── */}
      <div className="px-panel" style={{ marginBottom:"24px" }}>
        <div style={{ position:"absolute", top:-6, right:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />
        <div style={{ position:"absolute", bottom:-6, left:-6, width:8, height:8, background:"#020a1e", border:"2px solid #00d4ff", zIndex:2 }} />

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"12px" }}>
          <PxTitle icon="⚔" color="#ffd700">OBJETIVOS DO RAID</PxTitle>
          <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <span className="px-font" style={{ fontSize:"6px", color:"#1a4070" }}>PRAZO:</span>
              <input type="date" className="px-input"
                style={{ width:"auto", fontSize:"13px", padding:"4px 8px" }}
                value={raid.deadline}
                onChange={e => setRaid(p => ({...p, deadline: e.target.value}))} />
            </div>
            <button className="px-btn px-btn-gold" style={{ padding:"8px 14px" }}
              onClick={() => { setShowAdd(!showAdd); fireSound("click"); }}>
              + OBJETIVO
            </button>
          </div>
        </div>

        {showAdd && (
          <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
            <input className="px-input" style={{ flex:1 }}
              placeholder="> Novo objetivo do raid..."
              value={newObj}
              onChange={e => setNewObj(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addObj()}
              autoFocus />
            <button className="px-btn px-btn-gold" style={{ padding:"8px 14px" }} onClick={addObj}>✓</button>
            <button className="px-btn px-btn-ghost" style={{ padding:"8px 12px" }} onClick={() => setShowAdd(false)}>✕</button>
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {raid.objetivos.map((o, i) => (
            <div key={o.id} onClick={() => toggle(o.id)}
              style={{
                display:"flex", alignItems:"center", gap:"12px",
                padding:"12px 14px", cursor:"pointer",
                background: o.done ? "#001a00" : "#020a1e",
                border:`2px solid ${o.done ? "#39ff14" : "#1e3060"}`,
                borderLeft:`4px solid ${o.done ? "#39ff14" : "#c8a000"}`,
                transition:"all .15s",
              }}>
              <div style={{
                width:16, height:16, flexShrink:0,
                border:`2px solid ${o.done ? "#39ff14" : "#1e3060"}`,
                background: o.done ? "#39ff14" : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                {o.done && <span style={{ color:"#020a1e", fontSize:"10px", fontWeight:"bold" }}>✓</span>}
              </div>
              <div style={{ flex:1 }}>
                <div className="px-body" style={{
                  fontSize:"19px", color: o.done ? "#39ff14" : "#c0e8ff",
                  textDecoration: o.done ? "line-through" : "none",
                }}>
                  {String(i + 1).padStart(2,"0")}. {o.titulo}
                </div>
              </div>
              <PxBadge color={o.done ? "#39ff14" : "#c8a000"}>+{o.xp} XP</PxBadge>
              <button onClick={ev => { ev.stopPropagation(); delObj(o.id); }}
                style={{ background:"none", border:"1px solid #3a0000", color:"#883030",
                  fontFamily:"'Press Start 2P',monospace", fontSize:"6px",
                  padding:"4px 7px", cursor:"pointer" }}>
                DEL
              </button>
            </div>
          ))}
        </div>

        {raid.objetivos.length === 0 && (
          <div style={{ textAlign:"center", padding:"24px" }}>
            <div className="px-body" style={{ fontSize:"16px", color:"#1a4070" }}>
              Adicione objetivos para o raid semestral acima
            </div>
          </div>
        )}
      </div>

      {/* ── Recompensa final ── */}
      {allDone && (
        <div className="px-panel" style={{ borderColor:"#39ff14", background:"#001800", textAlign:"center", padding:"36px 24px" }}>
          <div style={{ fontSize:"72px", marginBottom:"16px", animation:"pxFloat 2s ease-in-out infinite" }}>{icons.tabs.goals}</div>
          <div className="px-font" style={{ fontSize:"12px", color:"#39ff14", textShadow:"0 0 20px #39ff14aa", marginBottom:"10px" }}>
            RAID CONCLUÍDO!
          </div>
          <div className="px-body" style={{ fontSize:"20px", color:"#80ff80", marginBottom:"8px" }}>
            {nomeHeroi} tornou-se um herói lendário do semestre!
          </div>
          <div className="px-font" style={{ fontSize:"7px", color:"#1a5030" }}>
            +{totalXp.toLocaleString("pt-BR")} XP GANHOS NESTE RAID
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  usePixelStyles();

  const [personagem,         setPersonagem]         = useLS("mylog_personagem",           null);
  const [tab,                setTab]                = useState("dashboard");
  const [diary,              setDiary]              = useLS("meudiario_diary",             {});
  const [tasks,              setTasks]              = useLS("meudiario_tasks",             []);
  const [goals,              setGoals]              = useLS("meudiario_goals",             []);
  const [notes,              setNotes]              = useLS("meudiario_notes",             []);
  const [apiKey,             setApiKey]             = useLS("meudiario_apikey",            "");
  const [dailyQuests,        setDailyQuests]        = useLS("mylog_daily_quests",          DAILY_QUEST_DEFAULTS);
  const [dailyCompletions,   setDailyCompletions]   = useLS("mylog_daily_completions",     {});
  const [memorias,           setMemorias]           = useLS("mylog_memorias",               []);
  const [showPersonagemModal,setShowPersonagemModal] = useState(false);
  const [themeId,            setThemeId]            = useLS("mylog_theme",                "arcane");
  const [dungeonMode,        setDungeonMode]        = useState(false);
  const [soundEnabled,       setSoundEnabled]       = useLS("mylog_sound",                true);
  const [toast,              setToast]              = useState(null);

  const curIcons = THEME_ICONS[themeId] || THEME_ICONS.arcane;
  useSounds(soundEnabled, curIcons.soundStyle);

  // Aplica data-theme no body para CSS vars
  useEffect(() => {
    document.body.setAttribute("data-theme", themeId);
  }, [themeId]);

  // ESC sai do Modo Dungeon
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setDungeonMode(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Toast RPG a cada 45 min enquanto o app está aberto
  useEffect(() => {
    const t = setInterval(() => {
      setToast(RPG_NOTIF_MSGS[Math.floor(Math.random() * RPG_NOTIF_MSGS.length)]);
    }, 45 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // Notificações Push do browser (RPG style)
  useEffect(() => {
    if (!("Notification" in window) || !personagem?.nome) return;
    const schedule = async () => {
      if (Notification.permission === "default") await Notification.requestPermission();
      if (Notification.permission !== "granted") return;
      const fire = () => {
        const msg = RPG_NOTIF_MSGS[Math.floor(Math.random() * RPG_NOTIF_MSGS.length)];
        try { new Notification(`⚔ ${personagem.nome} — MYLOG RPG`, { body: msg, icon: "/logo192.png" }); } catch(e) {}
        setTimeout(fire, (2 + Math.random() * 2) * 3600000);
      };
      setTimeout(fire, 1800000); // 1ª notificação após 30 min
    };
    schedule();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personagem?.nome]);

  // Primeira vez: mostrar tela de nome
  if (!personagem || !personagem.nome) {
    return (
      <WelcomeScreen
        onStart={(p) => setPersonagem(p || { nome:"HERÓI", racaId:"elfo_noite", classeId:"druida", fotoUrl:null })}
      />
    );
  }

  const nomeHeroi   = personagem.nome;
  const racaDados   = RACAS.find(r => r.id === personagem.racaId);
  const classeDados = CLASSES.find(c => c.id === personagem.classeId);
  const fotoUrl     = personagem.fotoUrl || null;
  const curTheme    = THEMES.find(t => t.id === themeId) || THEMES[0];

  const xp    = calcXP(tasks,diary,goals);
  const lv    = calcLevel(xp);
  const hp    = calcHP(diary);
  const done  = tasks.filter(t=>t.completed).length;
  const mana  = Math.min(100,done*8+20);
  const xpCur = xp-xpForLvl(lv);
  const xpNeed= xpForNext(lv)-xpForLvl(lv);

  const ti = curIcons.tabs;
  const TABS = [
    {id:"dashboard",  label:`${ti.hall} HALL`},
    {id:"diary",      label:`${ti.diary} CRÔNICA`},
    {id:"tasks",      label:`${ti.quests} QUESTS`},
    {id:"goals",      label:`${ti.goals} FAÇANHAS`},
    {id:"calendario", label:`${ti.calendar} CALENDÁRIO`},
    {id:"notes",      label:`${ti.notes} GRIMÓRIO`},
    {id:"skilltree",  label:`${ti.skilltree} ÁRV. HAB.`},
    {id:"ai",         label:`${ti.oracle} ORÁCULO`},
    {id:"album",      label:`${ti.album} ÁLBUM`},
    {id:"raid",       label:`${ti.raid} RAID FINAL`},
  ];

  return (
    <ThemeContext.Provider value={curIcons}>
    <div className="px-crt" style={{ minHeight:"100vh", background: curTheme.bg, color:"#c8deff", fontFamily:"'VT323',monospace", position:"relative" }}>
      <PixelStarField />

      {/* ══ PERSONAGEM MODAL ══ */}
      {showPersonagemModal && (
        <PersonagemModal
          personagem={personagem}
          onSave={(p) => { setPersonagem(p); setShowPersonagemModal(false); }}
          onClose={() => setShowPersonagemModal(false)}
        />
      )}

      {/* ══ DUNGEON MODE ══ */}
      {dungeonMode && (
        <DungeonModeOverlay
          onExit={() => setDungeonMode(false)}
          nomeHeroi={nomeHeroi}
        />
      )}

      {/* ══ RPG TOAST ══ */}
      {toast && <RPGToast message={toast} onClose={() => setToast(null)} />}

      {/* ══ HEADER FF-style ══ */}
      <header style={{
        background: curTheme.headerBg,
        borderBottom:"3px solid #1a3060",
        boxShadow:"0 3px 0 #06080f, 0 6px 20px rgba(0,0,0,.7), 0 2px 16px rgba(48,96,184,.08)",
        padding:"8px 20px",
        position:"sticky", top:0, zIndex:100,
      }}>
        <div style={{ maxWidth:"980px", margin:"0 auto", display:"flex", alignItems:"center", gap:"16px", flexWrap:"wrap" }}>
          {/* Retrato do personagem */}
          <button onClick={() => setShowPersonagemModal(true)} style={{ background:"none", border:"none", padding:"2px", cursor:"pointer", flexShrink:0 }} title="Editar personagem">
            <CharacterPortrait fotoUrl={fotoUrl} size={48} />
          </button>

          <div style={{ flex:"0 0 auto" }}>
            <div className="px-font px-glow-cx" style={{ fontSize:"10px", color:"#f0c030", letterSpacing:".06em" }}>
              ✦ MYLOG RPG ✦
            </div>
            <div className="px-font" style={{ fontSize:"6px", color:"#2a4880", marginTop:"3px" }}>
              {nomeHeroi} · LVL {lv} · {getTitle(lv)}
            </div>
            {(classeDados || racaDados) && (
              <div className="px-font" style={{ fontSize:"5px", color:"#1e3860", marginTop:"2px" }}>
                {classeDados ? `${classeDados.icone} ${classeDados.nome}` : ""}
                {classeDados && racaDados ? " · " : ""}
                {racaDados ? `${racaDados.icone} ${racaDados.nome}` : ""}
              </div>
            )}
          </div>

          <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"5px", minWidth:"200px" }}>
            {[
              {label:"❤ HP",  val:`${hp}/100`,          pct:hp,    color:"#40c060"},
              {label:"✦ MP",  val:`${mana}/100`,         pct:mana,  color:"#4898f0"},
              {label:"★ XP",  val:`${xpCur}/${xpNeed}`,  pct:Math.min((xpCur/Math.max(xpNeed,1))*100,100), color:"#f0c030"},
            ].map(s=>(
              <div key={s.label} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <span className="px-font" style={{ fontSize:"6px", color:s.color, minWidth:"36px" }}>{s.label}</span>
                <PixelBar value={s.pct} color={s.color} segments={18} />
                <span className="px-font" style={{ fontSize:"6px", color:s.color, minWidth:"56px", textAlign:"right" }}>{s.val}</span>
              </div>
            ))}
          </div>

          {/* Botão de editar personagem */}
          <button
            onClick={() => setShowPersonagemModal(true)}
            style={{ background:"none", border:"1px solid #1e3060", color:"#2a4880", fontFamily:"'Press Start 2P',monospace", fontSize:"6px", padding:"8px 10px", cursor:"pointer" }}
            title="Editar personagem"
          >⚙ PERSONAGEM</button>

          {/* ── DUNGEON MODE ── */}
          <button
            onClick={() => { setDungeonMode(true); fireSound("dungeon_enter"); }}
            style={{
              background: dungeonMode ? "#1a0020" : "none",
              border:`1px solid ${dungeonMode ? "#880088" : "#1e3060"}`,
              color: dungeonMode ? "#cc00cc" : "#2a4880",
              fontFamily:"'Press Start 2P',monospace", fontSize:"6px",
              padding:"8px 10px", cursor:"pointer", whiteSpace:"nowrap",
            }}
            title="Modo Dungeon — Foco total"
          >
            {curIcons.dungeon} DUNGEON
          </button>

          {/* ── SOM ── */}
          <button
            onClick={() => { setSoundEnabled(v => !v); }}
            style={{
              background:"none", border:"1px solid #1e3060",
              color: soundEnabled ? "#39ff14" : "#2a4880",
              fontFamily:"'Press Start 2P',monospace", fontSize:"8px",
              padding:"8px 10px", cursor:"pointer",
            }}
            title={soundEnabled ? "Som ativado — clique para silenciar" : "Som desativado — clique para ativar"}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>

          {/* ── TEMA ── */}
          <ThemeSwitcher currentThemeId={themeId} onSelect={setThemeId} />

          {/* ── NOTIFICAÇÃO MANUAL ── */}
          <button
            onClick={() => setToast(RPG_NOTIF_MSGS[Math.floor(Math.random() * RPG_NOTIF_MSGS.length)])}
            style={{ background:"none", border:"1px solid #1e3060", color:"#2a4880", fontFamily:"'Press Start 2P',monospace", fontSize:"8px", padding:"8px 10px", cursor:"pointer" }}
            title="Mensagem do reino"
          >📯</button>
        </div>
      </header>

      {/* ══ NAV ══ */}
      <nav style={{ background: curTheme.bg, borderBottom:"3px solid #1a3060", boxShadow:"0 3px 0 #04060a", display:"flex", overflowX:"auto", paddingLeft:"8px" }}>
        <div style={{ maxWidth:"980px", margin:"0 auto", display:"flex", width:"100%" }}>
          {TABS.map(t=>(
            <button key={t.id} className={`px-nav-btn${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </nav>

      {/* ══ MAIN ══ */}
      <main style={{ maxWidth:"980px", margin:"0 auto", padding:"24px 20px", position:"relative", zIndex:1 }}>
        {tab==="dashboard"  && <DashboardModule diary={diary} tasks={tasks} goals={goals} nomeHeroi={nomeHeroi} racaDados={racaDados} classeDados={classeDados} fotoUrl={fotoUrl} />}
        {tab==="diary"      && <DiaryModule data={diary} setData={setDiary} />}
        {tab==="tasks"      && <QuestLogModule tasks={tasks} setTasks={setTasks} dailyQuests={dailyQuests} setDailyQuests={setDailyQuests} dailyCompletions={dailyCompletions} setDailyCompletions={setDailyCompletions} />}
        {tab==="goals"      && <FacanhasModule goals={goals} setGoals={setGoals} />}
        {tab==="notes"      && <GrimorioModule notes={notes} setNotes={setNotes} />}
        {tab==="calendario" && <CalendarioModule />}
        {tab==="skilltree"  && <SkillTreeModule />}
        {tab==="ai"         && <OracleModule diary={diary} tasks={tasks} goals={goals} notes={notes} apiKey={apiKey} setApiKey={setApiKey} nomeHeroi={nomeHeroi} racaDados={racaDados} classeDados={classeDados} />}
        {tab==="album"      && <AlbumModule memorias={memorias} setMemorias={setMemorias} />}
        {tab==="raid"       && <RaidFinalModule nomeHeroi={nomeHeroi} />}
      </main>
    </div>
    </ThemeContext.Provider>
  );
}