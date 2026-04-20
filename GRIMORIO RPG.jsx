import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Dice6, Sword, Shield, Heart, Sparkles, Scroll, Package,
  BookOpen, ChevronRight, ChevronLeft, Trash2, Edit3, X, Check,
  Zap, Eye, Brain, Star, TrendingUp, Award, Flame, Crown,
  ArrowUp, ArrowDown, RotateCw, Info, User, Skull, Minus, Settings, Copy
} from 'lucide-react';

// =============================================================================
// DADOS D&D 5E 2024
// =============================================================================

const CLASSES = {
  'Bárbaro':    { hitDie: 12, magico: false,  desc: 'Guerreiro furioso movido pela fúria primal',       cor: '#dc2626' },
  'Bardo':      { hitDie: 8,  magico: 'full', desc: 'Mestre da canção, palavra e magia inspiradora',    cor: '#ec4899' },
  'Bruxo':      { hitDie: 8,  magico: 'pact', desc: 'Portador de poder arcano vindo de um patrono',     cor: '#7c3aed' },
  'Clérigo':    { hitDie: 8,  magico: 'full', desc: 'Campeão divino de uma divindade',                  cor: '#eab308' },
  'Druida':     { hitDie: 8,  magico: 'full', desc: 'Sacerdote da Velha Fé, ligado à natureza',         cor: '#16a34a' },
  'Feiticeiro': { hitDie: 6,  magico: 'full', desc: 'Conjurador com magia inata pelo sangue',           cor: '#f97316' },
  'Guerreiro':  { hitDie: 10, magico: false,  desc: 'Mestre em combate, armas e armaduras',             cor: '#94a3b8' },
  'Ladino':     { hitDie: 8,  magico: false,  desc: 'Astuto especialista em furtividade e precisão',    cor: '#64748b' },
  'Mago':       { hitDie: 6,  magico: 'full', desc: 'Estudioso erudito das artes arcanas',              cor: '#3b82f6' },
  'Monge':      { hitDie: 8,  magico: false,  desc: 'Artista marcial que domina o ki',                  cor: '#06b6d4' },
  'Paladino':   { hitDie: 10, magico: 'half', desc: 'Guerreiro sagrado ligado a um juramento',          cor: '#fbbf24' },
  'Patrulheiro':{ hitDie: 10, magico: 'half', desc: 'Caçador e explorador das terras selvagens',        cor: '#10b981' }
};

const RACAS = [
  'Aasimar', 'Anão', 'Draconato', 'Elfo', 'Gnomo', 'Goliath',
  'Halfling', 'Humano', 'Meio-Elfo', 'Meio-Orc', 'Orc', 'Tiefling'
];

const ALINHAMENTOS = [
  'Leal e Bom', 'Neutro e Bom', 'Caótico e Bom',
  'Leal e Neutro', 'Neutro', 'Caótico e Neutro',
  'Leal e Mau', 'Neutro e Mau', 'Caótico e Mau'
];

const ATRIBUTOS = [
  { key: 'forca',        nome: 'Força',        abrev: 'FOR', icon: Sword,    desc: 'Poder físico, atletismo' },
  { key: 'destreza',     nome: 'Destreza',     abrev: 'DES', icon: Zap,      desc: 'Agilidade, reflexos, equilíbrio' },
  { key: 'constituicao', nome: 'Constituição', abrev: 'CON', icon: Heart,    desc: 'Vigor, saúde, resistência' },
  { key: 'inteligencia', nome: 'Inteligência', abrev: 'INT', icon: BookOpen, desc: 'Raciocínio, memória, análise' },
  { key: 'sabedoria',    nome: 'Sabedoria',    abrev: 'SAB', icon: Eye,      desc: 'Percepção, intuição, discernimento' },
  { key: 'carisma',      nome: 'Carisma',      abrev: 'CAR', icon: Star,     desc: 'Força de personalidade, liderança' }
];

const PERICIAS = [
  { nome: 'Acrobacia',         attr: 'destreza' },
  { nome: 'Adestrar Animais',  attr: 'sabedoria' },
  { nome: 'Arcanismo',         attr: 'inteligencia' },
  { nome: 'Atletismo',         attr: 'forca' },
  { nome: 'Atuação',           attr: 'carisma' },
  { nome: 'Enganação',         attr: 'carisma' },
  { nome: 'Furtividade',       attr: 'destreza' },
  { nome: 'História',          attr: 'inteligencia' },
  { nome: 'Intimidação',       attr: 'carisma' },
  { nome: 'Intuição',          attr: 'sabedoria' },
  { nome: 'Investigação',      attr: 'inteligencia' },
  { nome: 'Medicina',          attr: 'sabedoria' },
  { nome: 'Natureza',          attr: 'inteligencia' },
  { nome: 'Percepção',         attr: 'sabedoria' },
  { nome: 'Persuasão',         attr: 'carisma' },
  { nome: 'Prestidigitação',   attr: 'destreza' },
  { nome: 'Religião',          attr: 'inteligencia' },
  { nome: 'Sobrevivência',     attr: 'sabedoria' }
];

const XP_TABLE = {
  1: 0, 2: 300, 3: 900, 4: 2700, 5: 6500, 6: 14000, 7: 23000,
  8: 34000, 9: 48000, 10: 64000, 11: 85000, 12: 100000, 13: 120000,
  14: 140000, 15: 165000, 16: 195000, 17: 225000, 18: 265000, 19: 305000, 20: 355000
};

// Slots de magia para conjurador completo (full caster)
const SPELL_SLOTS_FULL = {
  1:  [2,0,0,0,0,0,0,0,0],
  2:  [3,0,0,0,0,0,0,0,0],
  3:  [4,2,0,0,0,0,0,0,0],
  4:  [4,3,0,0,0,0,0,0,0],
  5:  [4,3,2,0,0,0,0,0,0],
  6:  [4,3,3,0,0,0,0,0,0],
  7:  [4,3,3,1,0,0,0,0,0],
  8:  [4,3,3,2,0,0,0,0,0],
  9:  [4,3,3,3,1,0,0,0,0],
  10: [4,3,3,3,2,0,0,0,0],
  11: [4,3,3,3,2,1,0,0,0],
  12: [4,3,3,3,2,1,0,0,0],
  13: [4,3,3,3,2,1,1,0,0],
  14: [4,3,3,3,2,1,1,0,0],
  15: [4,3,3,3,2,1,1,1,0],
  16: [4,3,3,3,2,1,1,1,0],
  17: [4,3,3,3,2,1,1,1,1],
  18: [4,3,3,3,3,1,1,1,1],
  19: [4,3,3,3,3,2,1,1,1],
  20: [4,3,3,3,3,2,2,1,1]
};

// Half caster (Paladino, Patrulheiro)
const SPELL_SLOTS_HALF = {
  1:[0,0,0,0,0], 2:[2,0,0,0,0], 3:[3,0,0,0,0], 4:[3,0,0,0,0], 5:[4,2,0,0,0],
  6:[4,2,0,0,0], 7:[4,3,0,0,0], 8:[4,3,0,0,0], 9:[4,3,2,0,0], 10:[4,3,2,0,0],
  11:[4,3,3,0,0], 12:[4,3,3,0,0], 13:[4,3,3,1,0], 14:[4,3,3,1,0], 15:[4,3,3,2,0],
  16:[4,3,3,2,0], 17:[4,3,3,3,1], 18:[4,3,3,3,1], 19:[4,3,3,3,2], 20:[4,3,3,3,2]
};

// Pact magic (Bruxo)
const SPELL_SLOTS_PACT = {
  1:{slots:1,level:1}, 2:{slots:2,level:1}, 3:{slots:2,level:2}, 4:{slots:2,level:2},
  5:{slots:2,level:3}, 6:{slots:2,level:3}, 7:{slots:2,level:4}, 8:{slots:2,level:4},
  9:{slots:2,level:5}, 10:{slots:2,level:5}, 11:{slots:3,level:5}, 12:{slots:3,level:5},
  13:{slots:3,level:5}, 14:{slots:3,level:5}, 15:{slots:3,level:5}, 16:{slots:3,level:5},
  17:{slots:4,level:5}, 18:{slots:4,level:5}, 19:{slots:4,level:5}, 20:{slots:4,level:5}
};

const ESCOLAS_MAGIA = [
  'Abjuração','Adivinhação','Conjuração','Encantamento',
  'Evocação','Ilusão','Necromancia','Transmutação'
];

// Avatares (emojis temáticos)
const AVATARS = ['⚔️','🏹','🛡️','🪄','🔮','🗡️','🏛️','🌙','☀️','🔥','❄️','⚡','🌿','💀','👹','🐉','🦅','🐺','🦊','🦁'];

// =============================================================================
// HELPERS
// =============================================================================

const calcMod = (valor) => Math.floor((valor - 10) / 2);
const fmtMod = (mod) => (mod >= 0 ? `+${mod}` : `${mod}`);

const profBonus = (nivel) => {
  if (nivel <= 4) return 2;
  if (nivel <= 8) return 3;
  if (nivel <= 12) return 4;
  if (nivel <= 16) return 5;
  return 6;
};

const xpProximoNivel = (nivel) => XP_TABLE[nivel + 1] ?? XP_TABLE[20];
const xpDoNivel = (nivel) => XP_TABLE[nivel] ?? 0;

const nivelPorXP = (xp) => {
  let n = 1;
  for (let i = 1; i <= 20; i++) if (xp >= XP_TABLE[i]) n = i;
  return n;
};

const getSpellSlots = (classe, nivel) => {
  const c = CLASSES[classe];
  if (!c) return null;
  if (c.magico === 'full') return { tipo: 'full', slots: SPELL_SLOTS_FULL[nivel] || [] };
  if (c.magico === 'half') return { tipo: 'half', slots: SPELL_SLOTS_HALF[nivel] || [] };
  if (c.magico === 'pact') return { tipo: 'pact', pact: SPELL_SLOTS_PACT[nivel] };
  return null;
};

const uid = () => Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

// =============================================================================
// PERSONAGEM FACTORY
// =============================================================================

const novoPersonagem = () => ({
  id: uid(),
  nome: 'Novo Aventureiro',
  avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
  classe: 'Guerreiro',
  raca: 'Humano',
  nivel: 1,
  xp: 0,
  antecedente: '',
  alinhamento: 'Neutro',
  atributos: { forca: 10, destreza: 10, constituicao: 10, inteligencia: 10, sabedoria: 10, carisma: 10 },
  hpMax: 10,
  hpAtual: 10,
  hpTemp: 0,
  ca: 10,
  velocidade: 9,
  iniciativa: 0,
  inspiracao: false,
  pericias: {}, // { 'Percepção': 'proficiente' | 'expert' | null }
  savesProf: {}, // { 'forca': true }
  ataques: [], // { nome, bonus, dano, dados }
  magiasConhecidas: [],  // { nome, nivel, escola, desc, preparada }
  slotsGastos: [0,0,0,0,0,0,0,0,0],  // slots gastos por nível
  pactSlotsGastos: 0,
  inventario: [], // { nome, qtd, desc }
  moedas: { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 }, // cobre, prata, eletro, ouro, platina
  tracos: '',
  ideais: '',
  vinculos: '',
  fraquezas: '',
  notas: '',
  caracteristicas: '' // habilidades de classe, features
});

// =============================================================================
// STORAGE (compartilhado para todos os jogadores)
// =============================================================================

const STORAGE_KEY = 'grimorio:characters:v1';
const ROLLS_KEY = 'grimorio:rolls:v1';

// Storage com fallback: tenta window.storage (compartilhado entre jogadores),
// cai em localStorage (local) se não disponível, cai em memória se nada funcionar.
const memStore = {};

const hasSharedStorage = () => typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function';
const hasLocalStorage = () => {
  try { return typeof window !== 'undefined' && !!window.localStorage; } catch { return false; }
};

// Timeout helper: se a promise demorar mais que ms, rejeita
const withTimeout = (promise, ms) => Promise.race([
  promise,
  new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))
]);

const storageGet = async (key) => {
  if (hasSharedStorage()) {
    try {
      const r = await withTimeout(window.storage.get(key, true), 4000);
      if (r && r.value) return r.value;
    } catch (e) { /* chave inexistente ou timeout */ }
  }
  if (hasLocalStorage()) {
    try { return window.localStorage.getItem(key); } catch {}
  }
  return memStore[key] || null;
};

const storagePut = async (key, value) => {
  memStore[key] = value;
  if (hasLocalStorage()) {
    try { window.localStorage.setItem(key, value); } catch {}
  }
  if (hasSharedStorage()) {
    try { await withTimeout(window.storage.set(key, value, true), 4000); } catch {}
  }
};

const storageLoad = async () => {
  const raw = await storageGet(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
};
const storageSave = async (chars) => { await storagePut(STORAGE_KEY, JSON.stringify(chars)); };

const rollsLoad = async () => {
  const raw = await storageGet(ROLLS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
};
const rollsSave = async (rolls) => { await storagePut(ROLLS_KEY, JSON.stringify(rolls.slice(0, 30))); };

// =============================================================================
// ESTILO GLOBAL + FONTES
// =============================================================================

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

    .font-display { font-family: 'Cinzel Decorative', serif; letter-spacing: 0.02em; }
    .font-serif-ui { font-family: 'Cinzel', serif; letter-spacing: 0.04em; }
    .font-sans-ui { font-family: 'Outfit', sans-serif; }
    .font-mono-ui { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }

    * { -webkit-tap-highlight-color: transparent; }

    .grimorio-bg {
      background:
        radial-gradient(ellipse at top, #2a1150 0%, transparent 50%),
        radial-gradient(ellipse at bottom right, #3d0c5c 0%, transparent 60%),
        radial-gradient(ellipse at bottom left, #1a0a3e 0%, transparent 50%),
        #0b0418;
      min-height: 100vh;
    }

    .card-bg {
      background: linear-gradient(145deg, rgba(60, 30, 110, 0.35), rgba(30, 15, 65, 0.55));
      border: 1px solid rgba(168, 85, 247, 0.18);
      backdrop-filter: blur(8px);
    }
    .card-solid {
      background: linear-gradient(145deg, #2a1555, #1a0b3a);
      border: 1px solid rgba(168, 85, 247, 0.22);
    }
    .card-hover:hover {
      border-color: rgba(192, 132, 252, 0.5);
      background: linear-gradient(145deg, rgba(80, 40, 140, 0.5), rgba(40, 20, 85, 0.65));
    }

    .glow-purple { box-shadow: 0 0 24px rgba(168, 85, 247, 0.3), inset 0 0 16px rgba(168, 85, 247, 0.08); }
    .glow-gold   { box-shadow: 0 0 32px rgba(251, 191, 36, 0.45), inset 0 0 18px rgba(251, 191, 36, 0.15); }

    .btn-primary {
      background: linear-gradient(180deg, #a855f7, #7c3aed);
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255,255,255,0.2);
      color: white;
      transition: all 0.15s ease;
    }
    .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-primary:active { transform: translateY(0); filter: brightness(0.95); }

    .btn-ghost {
      background: rgba(168, 85, 247, 0.1);
      border: 1px solid rgba(168, 85, 247, 0.25);
      color: #d8b4fe;
      transition: all 0.15s ease;
    }
    .btn-ghost:hover { background: rgba(168, 85, 247, 0.2); border-color: rgba(168, 85, 247, 0.5); }

    .input-dark {
      background: rgba(15, 6, 35, 0.6);
      border: 1px solid rgba(168, 85, 247, 0.2);
      color: #e9d5ff;
      transition: border-color 0.2s;
    }
    .input-dark:focus { outline: none; border-color: #a855f7; box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2); }
    .input-dark::placeholder { color: rgba(168, 85, 247, 0.4); }

    /* Dados */
    .dice-btn {
      background: linear-gradient(145deg, #3d1f70, #1e0c42);
      border: 2px solid rgba(168, 85, 247, 0.35);
      transition: all 0.2s;
      position: relative;
      overflow: hidden;
    }
    .dice-btn::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 60%);
      pointer-events: none;
    }
    .dice-btn:hover { transform: translateY(-2px) scale(1.04); border-color: #c084fc; box-shadow: 0 8px 20px rgba(168, 85, 247, 0.4); }
    .dice-btn:active { transform: scale(0.96); }

    /* Animação de dado girando */
    @keyframes dice-roll {
      0%   { transform: rotate(0deg)   scale(1); }
      25%  { transform: rotate(540deg) scale(1.1); }
      50%  { transform: rotate(1080deg) scale(0.95); }
      75%  { transform: rotate(1440deg) scale(1.05); }
      100% { transform: rotate(1800deg) scale(1); }
    }
    .dice-rolling { animation: dice-roll 0.8s cubic-bezier(0.25, 0.8, 0.25, 1); }

    /* Brilho de resultado */
    @keyframes result-pulse {
      0%, 100% { transform: scale(1); filter: brightness(1); }
      50%      { transform: scale(1.08); filter: brightness(1.3); }
    }
    .result-pulse { animation: result-pulse 0.6s ease-out; }

    /* Barra de XP brilhando */
    @keyframes xp-shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .xp-shimmer {
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(251, 191, 36, 0.6) 50%,
        transparent 100%);
      background-size: 200% 100%;
      animation: xp-shimmer 2.5s linear infinite;
    }

    /* Level up pulse */
    @keyframes level-up-beacon {
      0%, 100% { box-shadow: 0 0 16px rgba(251, 191, 36, 0.5); }
      50%      { box-shadow: 0 0 32px rgba(251, 191, 36, 0.9), 0 0 48px rgba(251, 191, 36, 0.4); }
    }
    .level-up-pulse { animation: level-up-beacon 1.5s ease-in-out infinite; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: rgba(15, 6, 35, 0.4); }
    ::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.3); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.5); }

    .rune-border {
      position: relative;
    }
    .rune-border::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(135deg, rgba(168,85,247,0.6), transparent 40%, transparent 60%, rgba(168,85,247,0.6));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude;
      pointer-events: none;
    }

    .natural20 { color: #fbbf24; text-shadow: 0 0 20px rgba(251, 191, 36, 0.9); }
    .natural1  { color: #f87171; text-shadow: 0 0 18px rgba(239, 68, 68, 0.8); }

    @keyframes fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-in { animation: fade-in 0.3s ease-out; }

    @keyframes slide-up {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .slide-up { animation: slide-up 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
  `}</style>
);

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

const IconDice = ({ sides, size = 24 }) => {
  // SVG customizado para cada dado
  const colors = { 4: '#ef4444', 6: '#a855f7', 8: '#3b82f6', 10: '#10b981', 12: '#f59e0b', 20: '#c084fc', 100: '#ec4899' };
  const c = colors[sides] || '#a855f7';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {sides === 4 && <polygon points="20,4 36,32 4,32" fill={c} stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5"/>}
      {sides === 6 && <rect x="6" y="6" width="28" height="28" rx="4" fill={c} stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5"/>}
      {sides === 8 && <polygon points="20,3 36,20 20,37 4,20" fill={c} stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5"/>}
      {sides === 10 && <polygon points="20,3 34,12 30,30 10,30 6,12" fill={c} stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5"/>}
      {sides === 12 && <polygon points="20,3 32,9 36,22 28,34 12,34 4,22 8,9" fill={c} stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5"/>}
      {sides === 20 && <polygon points="20,2 35,11 35,29 20,38 5,29 5,11" fill={c} stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5"/>}
      {sides === 100 && <circle cx="20" cy="20" r="16" fill={c} stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5"/>}
    </svg>
  );
};

const TextField = ({ label, value, onChange, type='text', placeholder, className='' }) => (
  <label className={`block ${className}`}>
    {label && <span className="block text-xs uppercase tracking-wider text-purple-300/70 mb-1.5 font-serif-ui">{label}</span>}
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      placeholder={placeholder}
      className="w-full input-dark rounded-xl px-4 py-2.5 font-sans-ui"
    />
  </label>
);

const SelectField = ({ label, value, onChange, options, className='' }) => (
  <label className={`block ${className}`}>
    {label && <span className="block text-xs uppercase tracking-wider text-purple-300/70 mb-1.5 font-serif-ui">{label}</span>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full input-dark rounded-xl px-4 py-2.5 font-sans-ui"
    >
      {options.map(o => <option key={o} value={o} style={{ background: '#1a0b3a' }}>{o}</option>)}
    </select>
  </label>
);

const TextArea = ({ label, value, onChange, placeholder, rows=3, className='' }) => (
  <label className={`block ${className}`}>
    {label && <span className="block text-xs uppercase tracking-wider text-purple-300/70 mb-1.5 font-serif-ui">{label}</span>}
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full input-dark rounded-xl px-4 py-2.5 font-sans-ui resize-none"
    />
  </label>
);

// =============================================================================
// HOME SCREEN - lista de personagens
// =============================================================================

function HomeScreen({ characters, onSelect, onCreate, onDelete }) {
  return (
    <div className="grimorio-bg px-5 py-8 pb-16 fade-in">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl card-solid glow-purple mb-4">
            <BookOpen className="w-10 h-10 text-purple-300" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl text-purple-100 tracking-widest">GRIMÓRIO</h1>
          <p className="font-serif-ui text-xs tracking-[0.3em] text-purple-400/70 mt-1">FICHAS · D&D 5E</p>
        </div>

        {/* Lista */}
        {characters.length === 0 ? (
          <div className="card-bg rounded-2xl p-8 text-center">
            <Scroll className="w-12 h-12 mx-auto text-purple-400/50 mb-3" strokeWidth={1.5} />
            <p className="font-serif-ui text-purple-200 mb-1">Nenhum herói ainda</p>
            <p className="text-sm text-purple-300/60 font-sans-ui">Crie sua primeira ficha abaixo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {characters.map(c => (
              <CharacterCard key={c.id} personagem={c} onClick={() => onSelect(c.id)} onDelete={() => onDelete(c.id)} />
            ))}
          </div>
        )}

        {/* Botão novo */}
        <button
          onClick={onCreate}
          className="w-full mt-6 btn-primary rounded-2xl py-4 font-serif-ui text-sm tracking-[0.2em] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          NOVA FICHA
        </button>

        <p className="text-center text-[10px] text-purple-400/40 mt-8 font-serif-ui tracking-widest">
          GRIMÓRIO · COMPARTILHADO ENTRE JOGADORES
        </p>
      </div>
    </div>
  );
}

function CharacterCard({ personagem, onClick, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const xpAtual = personagem.xp - xpDoNivel(personagem.nivel);
  const xpNecessario = xpProximoNivel(personagem.nivel) - xpDoNivel(personagem.nivel);
  const xpPct = personagem.nivel >= 20 ? 100 : Math.min(100, (xpAtual / xpNecessario) * 100);
  const canLevelUp = personagem.xp >= xpProximoNivel(personagem.nivel) && personagem.nivel < 20;
  const cor = CLASSES[personagem.classe]?.cor || '#a855f7';

  return (
    <div className={`card-bg rounded-2xl p-4 card-hover cursor-pointer transition-all ${canLevelUp ? 'level-up-pulse' : ''}`} onClick={onClick}>
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
          style={{ background: `linear-gradient(145deg, ${cor}33, ${cor}11)`, border: `1px solid ${cor}55` }}
        >
          {personagem.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif-ui text-lg text-purple-100 truncate">{personagem.nome}</h3>
          <p className="text-xs text-purple-300/70 font-sans-ui">
            {personagem.raca} · {personagem.classe} · <span className="font-mono-ui text-purple-200">Nv {personagem.nivel}</span>
          </p>
          {/* Barra XP */}
          <div className="mt-2 h-1.5 bg-black/40 rounded-full overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${xpPct}%`,
                background: canLevelUp ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : `linear-gradient(90deg, ${cor}, ${cor}aa)`
              }}
            />
            {canLevelUp && <div className="absolute inset-0 xp-shimmer" />}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirmDel) onDelete();
            else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 2500); }
          }}
          className={`p-2 rounded-xl transition-all ${confirmDel ? 'bg-red-500/30 text-red-300' : 'text-purple-400/50 hover:text-purple-300 hover:bg-purple-500/10'}`}
          title={confirmDel ? 'Confirmar exclusão' : 'Excluir'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {canLevelUp && (
        <div className="mt-3 flex items-center gap-2 text-xs text-yellow-300 font-serif-ui tracking-wider">
          <Crown className="w-4 h-4" />
          PRONTO PARA SUBIR DE NÍVEL
        </div>
      )}
    </div>
  );
}

// =============================================================================
// FICHA DO PERSONAGEM
// =============================================================================

function CharacterSheet({ personagem, onUpdate, onBack, onRoll, onLevelUp }) {
  const [tab, setTab] = useState('geral');
  const [diceOpen, setDiceOpen] = useState(false);
  const [editName, setEditName] = useState(false);

  const update = (patch) => onUpdate({ ...personagem, ...patch });
  const cor = CLASSES[personagem.classe]?.cor || '#a855f7';
  const canLevelUp = personagem.xp >= xpProximoNivel(personagem.nivel) && personagem.nivel < 20;

  const tabs = [
    { id: 'geral',      nome: 'Geral',      icon: User },
    { id: 'combate',    nome: 'Combate',    icon: Sword },
    { id: 'magias',     nome: 'Magias',     icon: Sparkles },
    { id: 'inventario', nome: 'Inventário', icon: Package },
    { id: 'historia',   nome: 'História',   icon: Scroll }
  ];

  return (
    <div className="grimorio-bg pb-32 fade-in">
      {/* Top bar */}
      <div className="sticky top-0 z-20 px-4 py-3 flex items-center justify-between backdrop-blur-lg bg-[#0b0418]/80 border-b border-purple-500/10">
        <button onClick={onBack} className="btn-ghost rounded-xl p-2">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-serif-ui text-sm tracking-[0.2em] text-purple-200 truncate px-2">
          {personagem.nome.toUpperCase()}
        </h2>
        <button onClick={() => setDiceOpen(true)} className="btn-ghost rounded-xl p-2">
          <Dice6 className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4">
        {/* Header com avatar */}
        <div className="card-bg rounded-3xl p-5 mb-4 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: `radial-gradient(ellipse at top, ${cor}88, transparent 60%)` }}
          />
          <div className="relative flex flex-col items-center">
            <button
              onClick={() => {
                const idx = AVATARS.indexOf(personagem.avatar);
                update({ avatar: AVATARS[(idx + 1) % AVATARS.length] });
              }}
              className="w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-transform active:scale-95"
              style={{ background: `linear-gradient(145deg, ${cor}44, ${cor}11)`, border: `2px solid ${cor}66` }}
              title="Trocar avatar"
            >
              {personagem.avatar}
            </button>

            {editName ? (
              <input
                autoFocus
                value={personagem.nome}
                onChange={(e) => update({ nome: e.target.value })}
                onBlur={() => setEditName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditName(false)}
                className="mt-4 bg-transparent text-center font-display text-2xl text-purple-100 border-b border-purple-400 focus:outline-none w-full"
              />
            ) : (
              <h1
                onClick={() => setEditName(true)}
                className="mt-4 font-display text-2xl text-purple-100 text-center cursor-pointer"
              >
                {personagem.nome}
              </h1>
            )}
            <p className="text-xs font-serif-ui tracking-widest text-purple-300/70 mt-1">
              {personagem.raca.toUpperCase()} · {personagem.classe.toUpperCase()}
            </p>

            {/* Level & XP */}
            <div className="w-full mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-mono-ui text-xs font-bold" style={{ background: cor, color: '#0b0418' }}>
                    {personagem.nivel}
                  </div>
                  <span className="font-serif-ui text-xs tracking-wider text-purple-300">NÍVEL {personagem.nivel}</span>
                </div>
                <span className="font-mono-ui text-[11px] text-purple-300/70">
                  {personagem.xp.toLocaleString()} / {xpProximoNivel(personagem.nivel).toLocaleString()} XP
                </span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${personagem.nivel >= 20 ? 100 : Math.min(100, ((personagem.xp - xpDoNivel(personagem.nivel)) / (xpProximoNivel(personagem.nivel) - xpDoNivel(personagem.nivel))) * 100)}%`,
                    background: canLevelUp ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : `linear-gradient(90deg, ${cor}, ${cor}bb)`
                  }}
                />
                {canLevelUp && <div className="absolute inset-0 xp-shimmer" />}
              </div>

              {canLevelUp && (
                <button
                  onClick={onLevelUp}
                  className="w-full mt-3 rounded-xl py-3 font-serif-ui text-sm tracking-[0.2em] flex items-center justify-center gap-2 level-up-pulse"
                  style={{ background: 'linear-gradient(180deg, #fbbf24, #d97706)', color: '#0b0418' }}
                >
                  <Crown className="w-4 h-4" strokeWidth={2.5} />
                  SUBIR DE NÍVEL
                </button>
              )}
            </div>

            {/* Editar XP e nível manualmente */}
            <div className="w-full grid grid-cols-2 gap-2 mt-3">
              <div className="card-solid rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] font-serif-ui tracking-wider text-purple-300/60">XP</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => update({ xp: Math.max(0, personagem.xp - 100) })} className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 active:scale-90">−</button>
                  <input
                    type="number"
                    value={personagem.xp}
                    onChange={(e) => update({ xp: Math.max(0, Number(e.target.value)) })}
                    className="w-16 bg-transparent text-center font-mono-ui text-sm text-purple-100 focus:outline-none"
                  />
                  <button onClick={() => update({ xp: personagem.xp + 100 })} className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 active:scale-90">+</button>
                </div>
              </div>
              <div className="card-solid rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] font-serif-ui tracking-wider text-purple-300/60">INSPIRAÇÃO</span>
                <button
                  onClick={() => update({ inspiracao: !personagem.inspiracao })}
                  className={`w-8 h-6 rounded-md flex items-center justify-center transition-all ${personagem.inspiracao ? 'bg-yellow-500/30 text-yellow-300' : 'bg-purple-500/10 text-purple-400/40'}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats principais */}
        <StatsPrincipais personagem={personagem} update={update} />

        {/* Atributos */}
        <div className="mt-4">
          <h3 className="font-serif-ui text-xs tracking-[0.25em] text-purple-300/70 mb-3 px-1">ATRIBUTOS</h3>
          <div className="grid grid-cols-3 gap-2">
            {ATRIBUTOS.map(a => (
              <AtributoCard
                key={a.key}
                atributo={a}
                valor={personagem.atributos[a.key]}
                onChange={(v) => update({ atributos: { ...personagem.atributos, [a.key]: v } })}
                onRoll={() => onRoll({
                  tipo: 'atributo',
                  nome: a.nome,
                  mod: calcMod(personagem.atributos[a.key]),
                  personagem: personagem.nome
                })}
              />
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-1 card-solid rounded-2xl p-1.5 min-w-min">
            {tabs.map(t => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-3 rounded-xl transition-all min-w-[60px] ${active ? 'bg-purple-500/30 text-purple-100' : 'text-purple-400/60 hover:text-purple-300'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-serif-ui tracking-wider">{t.nome.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo da tab */}
        <div className="mt-4">
          {tab === 'geral'      && <TabGeral personagem={personagem} update={update} onRoll={onRoll} />}
          {tab === 'combate'    && <TabCombate personagem={personagem} update={update} onRoll={onRoll} />}
          {tab === 'magias'     && <TabMagias personagem={personagem} update={update} onRoll={onRoll} />}
          {tab === 'inventario' && <TabInventario personagem={personagem} update={update} />}
          {tab === 'historia'   && <TabHistoria personagem={personagem} update={update} />}
        </div>
      </div>

      {/* Botão flutuante de dados */}
      <button
        onClick={() => setDiceOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full btn-primary glow-purple flex items-center justify-center z-30"
        style={{ boxShadow: '0 8px 24px rgba(124, 58, 237, 0.5)' }}
      >
        <Dice6 className="w-7 h-7" strokeWidth={1.5} />
      </button>

      {/* Modal de dados */}
      {diceOpen && <DiceModal onClose={() => setDiceOpen(false)} onRoll={onRoll} personagem={personagem} />}
    </div>
  );
}

function StatsPrincipais({ personagem, update }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {/* HP */}
      <div className="card-bg rounded-2xl p-3 col-span-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="font-serif-ui text-xs tracking-wider text-purple-300">PONTOS DE VIDA</span>
          </div>
          <span className="font-mono-ui text-xs text-purple-300/70">
            {personagem.hpAtual}{personagem.hpTemp > 0 && <span className="text-cyan-300"> +{personagem.hpTemp}</span>} / {personagem.hpMax}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => update({ hpAtual: Math.max(0, personagem.hpAtual - 1) })} className="w-9 h-9 rounded-xl bg-red-500/20 text-red-300 font-bold active:scale-90 transition-transform">−</button>
          <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(0, Math.min(100, (personagem.hpAtual / personagem.hpMax) * 100))}%`,
                background: 'linear-gradient(90deg, #ef4444, #f87171)'
              }}
            />
            {personagem.hpTemp > 0 && (
              <div
                className="absolute top-0 h-full bg-cyan-400/60 rounded-r-full"
                style={{
                  left: `${Math.min(100, (personagem.hpAtual / personagem.hpMax) * 100)}%`,
                  width: `${Math.min(100 - (personagem.hpAtual / personagem.hpMax) * 100, (personagem.hpTemp / personagem.hpMax) * 100)}%`
                }}
              />
            )}
          </div>
          <button onClick={() => update({ hpAtual: Math.min(personagem.hpMax, personagem.hpAtual + 1) })} className="w-9 h-9 rounded-xl bg-green-500/20 text-green-300 font-bold active:scale-90 transition-transform">+</button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <label className="block">
            <span className="text-[10px] font-serif-ui tracking-wider text-purple-300/50 uppercase block">Atual</span>
            <input type="number" value={personagem.hpAtual} onChange={(e) => update({ hpAtual: Number(e.target.value) })} className="w-full input-dark rounded-lg px-2 py-1 text-sm font-mono-ui text-center" />
          </label>
          <label className="block">
            <span className="text-[10px] font-serif-ui tracking-wider text-purple-300/50 uppercase block">Máx</span>
            <input type="number" value={personagem.hpMax} onChange={(e) => update({ hpMax: Number(e.target.value) })} className="w-full input-dark rounded-lg px-2 py-1 text-sm font-mono-ui text-center" />
          </label>
          <label className="block">
            <span className="text-[10px] font-serif-ui tracking-wider text-purple-300/50 uppercase block">Temp</span>
            <input type="number" value={personagem.hpTemp} onChange={(e) => update({ hpTemp: Number(e.target.value) })} className="w-full input-dark rounded-lg px-2 py-1 text-sm font-mono-ui text-center text-cyan-300" />
          </label>
        </div>
      </div>

      {/* CA */}
      <div className="card-bg rounded-2xl p-3 flex flex-col items-center">
        <Shield className="w-4 h-4 text-blue-300 mb-1" />
        <span className="text-[10px] font-serif-ui tracking-wider text-purple-300/60">CLASSE DE ARMADURA</span>
        <input type="number" value={personagem.ca} onChange={(e) => update({ ca: Number(e.target.value) })} className="w-full bg-transparent text-center font-mono-ui text-2xl text-purple-100 focus:outline-none font-bold mt-1" />
      </div>

      {/* Velocidade */}
      <div className="card-bg rounded-2xl p-3 flex flex-col items-center">
        <TrendingUp className="w-4 h-4 text-emerald-300 mb-1" />
        <span className="text-[10px] font-serif-ui tracking-wider text-purple-300/60">DESLOCAMENTO</span>
        <div className="flex items-baseline gap-1 mt-1">
          <input type="number" value={personagem.velocidade} onChange={(e) => update({ velocidade: Number(e.target.value) })} className="w-12 bg-transparent text-center font-mono-ui text-2xl text-purple-100 focus:outline-none font-bold" />
          <span className="text-[10px] text-purple-300/50">m</span>
        </div>
      </div>

      {/* Iniciativa */}
      <div className="card-bg rounded-2xl p-3 flex flex-col items-center">
        <Zap className="w-4 h-4 text-yellow-300 mb-1" />
        <span className="text-[10px] font-serif-ui tracking-wider text-purple-300/60">INICIATIVA</span>
        <span className="font-mono-ui text-2xl text-purple-100 font-bold mt-1">
          {fmtMod(calcMod(personagem.atributos.destreza) + (personagem.iniciativa || 0))}
        </span>
      </div>

      {/* Prof bonus */}
      <div className="card-bg rounded-2xl p-3 flex flex-col items-center">
        <Award className="w-4 h-4 text-purple-300 mb-1" />
        <span className="text-[10px] font-serif-ui tracking-wider text-purple-300/60">PROFICIÊNCIA</span>
        <span className="font-mono-ui text-2xl text-purple-100 font-bold mt-1">
          +{profBonus(personagem.nivel)}
        </span>
      </div>
    </div>
  );
}

function AtributoCard({ atributo, valor, onChange, onRoll }) {
  const mod = calcMod(valor);
  const Icon = atributo.icon;
  return (
    <div className="card-bg rounded-2xl p-3 relative">
      <div className="flex items-center justify-between mb-1">
        <Icon className="w-3.5 h-3.5 text-purple-300/60" />
        <input
          type="number"
          value={valor}
          onChange={(e) => onChange(Math.max(1, Math.min(30, Number(e.target.value))))}
          className="w-10 bg-black/30 rounded-md text-center text-[11px] font-mono-ui text-purple-200 focus:outline-none py-0.5"
        />
      </div>
      <button onClick={onRoll} className="w-full text-center active:scale-95 transition-transform">
        <div className="font-mono-ui text-3xl text-purple-100 font-bold leading-none my-1">{fmtMod(mod)}</div>
      </button>
      <div className="text-[10px] font-serif-ui tracking-wider text-purple-300/70 text-center uppercase">{atributo.abrev}</div>
    </div>
  );
}

// =============================================================================
// TAB GERAL (perícias + resistências)
// =============================================================================

function TabGeral({ personagem, update, onRoll }) {
  const pb = profBonus(personagem.nivel);

  const togglePericia = (nome) => {
    const atual = personagem.pericias[nome];
    const next = atual === 'proficiente' ? 'expert' : atual === 'expert' ? null : 'proficiente';
    update({ pericias: { ...personagem.pericias, [nome]: next } });
  };

  const toggleSave = (attr) => {
    update({ savesProf: { ...personagem.savesProf, [attr]: !personagem.savesProf[attr] } });
  };

  const calcPericia = (p) => {
    const mod = calcMod(personagem.atributos[p.attr]);
    const prof = personagem.pericias[p.nome];
    if (prof === 'expert') return mod + pb * 2;
    if (prof === 'proficiente') return mod + pb;
    return mod;
  };

  return (
    <div className="space-y-4 slide-up">
      {/* Saves */}
      <div>
        <h3 className="font-serif-ui text-xs tracking-[0.25em] text-purple-300/70 mb-2 px-1">TESTES DE RESISTÊNCIA</h3>
        <div className="card-bg rounded-2xl p-3 space-y-1">
          {ATRIBUTOS.map(a => {
            const mod = calcMod(personagem.atributos[a.key]);
            const prof = personagem.savesProf[a.key];
            const total = mod + (prof ? pb : 0);
            return (
              <div key={a.key} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                <button
                  onClick={() => toggleSave(a.key)}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${prof ? 'bg-purple-500 border-purple-500' : 'border-purple-400/40'}`}
                >
                  {prof && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
                <span className="flex-1 text-sm font-sans-ui text-purple-100">{a.nome}</span>
                <button
                  onClick={() => onRoll({ tipo: 'save', nome: `Salvar ${a.nome}`, mod: total, personagem: personagem.nome })}
                  className="font-mono-ui text-sm font-bold text-purple-200 w-12 text-right active:scale-95"
                >
                  {fmtMod(total)}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Perícias */}
      <div>
        <h3 className="font-serif-ui text-xs tracking-[0.25em] text-purple-300/70 mb-2 px-1">PERÍCIAS</h3>
        <p className="text-[11px] text-purple-400/60 mb-2 px-1 font-sans-ui">
          Toque no círculo: vazio → proficiente ● → especialista ✦
        </p>
        <div className="card-bg rounded-2xl p-3 space-y-0.5">
          {PERICIAS.map(p => {
            const prof = personagem.pericias[p.nome];
            const total = calcPericia(p);
            return (
              <div key={p.nome} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                <button
                  onClick={() => togglePericia(p.nome)}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                    prof === 'expert' ? 'bg-yellow-400 border-yellow-400' :
                    prof === 'proficiente' ? 'bg-purple-500 border-purple-500' :
                    'border-purple-400/40'
                  }`}
                >
                  {prof === 'expert' && <Sparkles className="w-2 h-2 text-purple-900" />}
                  {prof === 'proficiente' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-sans-ui text-purple-100 truncate">{p.nome}</div>
                  <div className="text-[10px] font-serif-ui tracking-wider text-purple-400/50">
                    {ATRIBUTOS.find(a => a.key === p.attr)?.abrev}
                  </div>
                </div>
                <button
                  onClick={() => onRoll({ tipo: 'pericia', nome: p.nome, mod: total, personagem: personagem.nome })}
                  className="font-mono-ui text-sm font-bold text-purple-200 w-12 text-right active:scale-95"
                >
                  {fmtMod(total)}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info básica */}
      <div>
        <h3 className="font-serif-ui text-xs tracking-[0.25em] text-purple-300/70 mb-2 px-1">IDENTIDADE</h3>
        <div className="card-bg rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Classe" value={personagem.classe} onChange={(v) => update({ classe: v })} options={Object.keys(CLASSES)} />
            <SelectField label="Raça" value={personagem.raca} onChange={(v) => update({ raca: v })} options={RACAS} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Alinhamento" value={personagem.alinhamento} onChange={(v) => update({ alinhamento: v })} options={ALINHAMENTOS} />
            <TextField label="Antecedente" value={personagem.antecedente} onChange={(v) => update({ antecedente: v })} placeholder="Ex: Sábio" />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TAB COMBATE
// =============================================================================

function TabCombate({ personagem, update, onRoll }) {
  const [showAdd, setShowAdd] = useState(false);
  const [novoAtaque, setNovoAtaque] = useState({ nome: '', bonus: 0, dano: '1d6', tipoDano: 'cortante' });

  const adicionar = () => {
    if (!novoAtaque.nome) return;
    update({ ataques: [...personagem.ataques, { ...novoAtaque, id: uid() }] });
    setNovoAtaque({ nome: '', bonus: 0, dano: '1d6', tipoDano: 'cortante' });
    setShowAdd(false);
  };

  const remover = (id) => update({ ataques: personagem.ataques.filter(a => a.id !== id) });

  return (
    <div className="space-y-4 slide-up">
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="font-serif-ui text-xs tracking-[0.25em] text-purple-300/70">ATAQUES E CONJURAÇÕES</h3>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-ghost rounded-lg px-2 py-1 text-xs flex items-center gap-1">
            <Plus className="w-3 h-3" />ADD
          </button>
        </div>

        {showAdd && (
          <div className="card-solid rounded-2xl p-3 mb-3 space-y-2 fade-in">
            <TextField label="Nome" value={novoAtaque.nome} onChange={(v) => setNovoAtaque({ ...novoAtaque, nome: v })} placeholder="Espada Longa" />
            <div className="grid grid-cols-2 gap-2">
              <TextField label="Bônus ataque" type="number" value={novoAtaque.bonus} onChange={(v) => setNovoAtaque({ ...novoAtaque, bonus: v })} />
              <TextField label="Dano" value={novoAtaque.dano} onChange={(v) => setNovoAtaque({ ...novoAtaque, dano: v })} placeholder="1d8+3" />
            </div>
            <TextField label="Tipo" value={novoAtaque.tipoDano} onChange={(v) => setNovoAtaque({ ...novoAtaque, tipoDano: v })} placeholder="cortante, perfurante..." />
            <div className="flex gap-2">
              <button onClick={adicionar} className="btn-primary rounded-xl px-4 py-2 text-sm flex-1">Adicionar</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost rounded-xl px-4 py-2 text-sm">Cancelar</button>
            </div>
          </div>
        )}

        {personagem.ataques.length === 0 ? (
          <div className="card-bg rounded-2xl p-6 text-center">
            <Sword className="w-8 h-8 mx-auto text-purple-400/40 mb-2" strokeWidth={1.5} />
            <p className="text-xs text-purple-300/60 font-sans-ui">Nenhum ataque cadastrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {personagem.ataques.map(a => (
              <div key={a.id} className="card-bg rounded-2xl p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-serif-ui text-sm text-purple-100">{a.nome}</div>
                  <div className="flex items-center gap-3 text-xs mt-0.5 font-mono-ui">
                    <span className="text-purple-300/70">Atq <span className="text-purple-100">{fmtMod(a.bonus)}</span></span>
                    <span className="text-purple-300/70">Dano <span className="text-purple-100">{a.dano}</span></span>
                    <span className="text-purple-400/60 text-[10px]">{a.tipoDano}</span>
                  </div>
                </div>
                <button
                  onClick={() => onRoll({ tipo: 'ataque', nome: a.nome, mod: a.bonus, danoExpr: a.dano, personagem: personagem.nome })}
                  className="btn-primary rounded-lg px-3 py-2 text-xs font-serif-ui tracking-wider"
                >
                  ROLAR
                </button>
                <button onClick={() => remover(a.id)} className="text-purple-400/40 hover:text-red-400 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Características de classe */}
      <div>
        <h3 className="font-serif-ui text-xs tracking-[0.25em] text-purple-300/70 mb-2 px-1">CARACTERÍSTICAS E HABILIDADES</h3>
        <div className="card-bg rounded-2xl p-3">
          <TextArea
            value={personagem.caracteristicas}
            onChange={(v) => update({ caracteristicas: v })}
            placeholder="Fúria (2 usos), Ataque Extra, Fonte de Magia..."
            rows={6}
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TAB MAGIAS
// =============================================================================

function TabMagias({ personagem, update, onRoll }) {
  const [showAdd, setShowAdd] = useState(false);
  const [nova, setNova] = useState({ nome: '', nivel: 0, escola: 'Evocação', desc: '', preparada: true });
  const [expanded, setExpanded] = useState({});

  const slots = getSpellSlots(personagem.classe, personagem.nivel);

  const adicionar = () => {
    if (!nova.nome) return;
    update({ magiasConhecidas: [...personagem.magiasConhecidas, { ...nova, id: uid() }] });
    setNova({ nome: '', nivel: 0, escola: 'Evocação', desc: '', preparada: true });
    setShowAdd(false);
  };

  const remover = (id) => update({ magiasConhecidas: personagem.magiasConhecidas.filter(m => m.id !== id) });
  const toggleMagia = (id) => update({
    magiasConhecidas: personagem.magiasConhecidas.map(m => m.id === id ? { ...m, preparada: !m.preparada } : m)
  });

  const usarSlot = (nivel) => {
    if (slots?.tipo === 'pact') {
      update({ pactSlotsGastos: Math.min((slots.pact?.slots || 0), personagem.pactSlotsGastos + 1) });
    } else {
      const novos = [...personagem.slotsGastos];
      novos[nivel - 1] = (novos[nivel - 1] || 0) + 1;
      update({ slotsGastos: novos });
    }
  };
  const recuperarSlot = (nivel) => {
    if (slots?.tipo === 'pact') {
      update({ pactSlotsGastos: Math.max(0, personagem.pactSlotsGastos - 1) });
    } else {
      const novos = [...personagem.slotsGastos];
      novos[nivel - 1] = Math.max(0, (novos[nivel - 1] || 0) - 1);
      update({ slotsGastos: novos });
    }
  };
  const descansoLongo = () => {
    update({ slotsGastos: [0,0,0,0,0,0,0,0,0], pactSlotsGastos: 0, hpAtual: personagem.hpMax });
  };

  // Magias por nível
  const magiasPorNivel = {};
  for (let i = 0; i <= 9; i++) magiasPorNivel[i] = [];
  personagem.magiasConhecidas.forEach(m => { magiasPorNivel[m.nivel]?.push(m); });

  const classeMagica = CLASSES[personagem.classe]?.magico;

  return (
    <div className="space-y-4 slide-up">
      {!classeMagica ? (
        <div className="card-bg rounded-2xl p-6 text-center">
          <Sparkles className="w-8 h-8 mx-auto text-purple-400/40 mb-2" strokeWidth={1.5} />
          <p className="text-sm text-purple-300/70 font-sans-ui">{personagem.classe} não usa magias</p>
          <p className="text-xs text-purple-400/50 mt-1 font-sans-ui">Você ainda pode cadastrar magias de talentos/itens</p>
        </div>
      ) : (
        <>
          {/* Slots */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="font-serif-ui text-xs tracking-[0.25em] text-purple-300/70">ESPAÇOS DE MAGIA</h3>
              <button onClick={descansoLongo} className="btn-ghost rounded-lg px-2 py-1 text-[10px] flex items-center gap-1 font-serif-ui tracking-wider">
                <RotateCw className="w-3 h-3" />DESC. LONGO
              </button>
            </div>
            <div className="card-bg rounded-2xl p-3 space-y-2">
              {slots?.tipo === 'pact' ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-serif-ui text-sm text-purple-100">Magia de Pacto</div>
                    <div className="text-[11px] text-purple-400/70 font-sans-ui">Todos os slots são de {slots.pact.level}º nível</div>
                  </div>
                  <SlotTracker
                    total={slots.pact?.slots || 0}
                    gastos={personagem.pactSlotsGastos}
                    onUsar={() => usarSlot(0)}
                    onRecuperar={() => recuperarSlot(0)}
                  />
                </div>
              ) : (
                slots?.slots.map((total, idx) => {
                  if (total === 0) return null;
                  const nivel = idx + 1;
                  const gastos = personagem.slotsGastos[idx] || 0;
                  return (
                    <div key={nivel} className="flex items-center justify-between">
                      <span className="font-serif-ui text-xs text-purple-200 tracking-wider">NÍVEL {nivel}</span>
                      <SlotTracker total={total} gastos={gastos} onUsar={() => usarSlot(nivel)} onRecuperar={() => recuperarSlot(nivel)} />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Lista magias */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="font-serif-ui text-xs tracking-[0.25em] text-purple-300/70">MAGIAS</h3>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-ghost rounded-lg px-2 py-1 text-xs flex items-center gap-1">
            <Plus className="w-3 h-3" />ADD
          </button>
        </div>

        {showAdd && (
          <div className="card-solid rounded-2xl p-3 mb-3 space-y-2 fade-in">
            <TextField label="Nome da magia" value={nova.nome} onChange={(v) => setNova({ ...nova, nome: v })} placeholder="Bola de Fogo" />
            <div className="grid grid-cols-2 gap-2">
              <SelectField
                label="Nível"
                value={String(nova.nivel)}
                onChange={(v) => setNova({ ...nova, nivel: Number(v) })}
                options={['0','1','2','3','4','5','6','7','8','9']}
              />
              <SelectField label="Escola" value={nova.escola} onChange={(v) => setNova({ ...nova, escola: v })} options={ESCOLAS_MAGIA} />
            </div>
            <TextArea label="Descrição" value={nova.desc} onChange={(v) => setNova({ ...nova, desc: v })} placeholder="Alcance, duração, efeito..." rows={2} />
            <div className="flex gap-2">
              <button onClick={adicionar} className="btn-primary rounded-xl px-4 py-2 text-sm flex-1">Adicionar</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost rounded-xl px-4 py-2 text-sm">Cancelar</button>
            </div>
          </div>
        )}

        {personagem.magiasConhecidas.length === 0 ? (
          <div className="card-bg rounded-2xl p-6 text-center">
            <Sparkles className="w-8 h-8 mx-auto text-purple-400/40 mb-2" strokeWidth={1.5} />
            <p className="text-xs text-purple-300/60 font-sans-ui">Nenhuma magia cadastrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(magiasPorNivel).map(([nivel, magias]) => {
              if (magias.length === 0) return null;
              const label = nivel === '0' ? 'TRUQUES' : `${nivel}º NÍVEL`;
              return (
                <div key={nivel}>
                  <div className="text-[10px] font-serif-ui tracking-[0.25em] text-purple-400/60 mb-1.5 px-1">{label}</div>
                  <div className="space-y-1.5">
                    {magias.map(m => (
                      <div key={m.id} className="card-bg rounded-xl p-3">
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => toggleMagia(m.id)}
                            className={`w-4 h-4 mt-1 rounded-full border-2 flex items-center justify-center shrink-0 ${m.preparada ? 'bg-purple-500 border-purple-500' : 'border-purple-400/40'}`}
                            title={m.preparada ? 'Preparada' : 'Não preparada'}
                          >
                            {m.preparada && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </button>
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded({ ...expanded, [m.id]: !expanded[m.id] })}>
                            <div className="font-serif-ui text-sm text-purple-100">{m.nome}</div>
                            <div className="text-[10px] text-purple-400/60 font-sans-ui">{m.escola}</div>
                            {expanded[m.id] && m.desc && (
                              <div className="mt-2 text-xs text-purple-200/80 font-sans-ui whitespace-pre-wrap">{m.desc}</div>
                            )}
                          </div>
                          <button onClick={() => remover(m.id)} className="text-purple-400/40 hover:text-red-400 p-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SlotTracker({ total, gastos, onUsar, onRecuperar }) {
  const disponiveis = total - gastos;
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={onRecuperar} className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 text-xs active:scale-90" disabled={gastos === 0}>−</button>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-sm transition-all ${i < disponiveis ? 'bg-purple-400' : 'bg-purple-900/40 border border-purple-500/30'}`}
          />
        ))}
      </div>
      <button onClick={onUsar} className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 text-xs active:scale-90" disabled={disponiveis === 0}>+</button>
      <span className="font-mono-ui text-xs text-purple-300/70 ml-1">{disponiveis}/{total}</span>
    </div>
  );
}

// =============================================================================
// TAB INVENTÁRIO
// =============================================================================

function TabInventario({ personagem, update }) {
  const [showAdd, setShowAdd] = useState(false);
  const [item, setItem] = useState({ nome: '', qtd: 1, desc: '' });

  const adicionar = () => {
    if (!item.nome) return;
    update({ inventario: [...personagem.inventario, { ...item, id: uid() }] });
    setItem({ nome: '', qtd: 1, desc: '' });
    setShowAdd(false);
  };

  const remover = (id) => update({ inventario: personagem.inventario.filter(i => i.id !== id) });

  const atualizarQtd = (id, delta) => {
    update({
      inventario: personagem.inventario.map(i =>
        i.id === id ? { ...i, qtd: Math.max(0, i.qtd + delta) } : i
      )
    });
  };

  return (
    <div className="space-y-4 slide-up">
      {/* Moedas */}
      <div>
        <h3 className="font-serif-ui text-xs tracking-[0.25em] text-purple-300/70 mb-2 px-1">MOEDAS</h3>
        <div className="card-bg rounded-2xl p-3 grid grid-cols-5 gap-2">
          {[
            { key: 'pc', label: 'PC', cor: '#c2410c', nome: 'Cobre' },
            { key: 'pp', label: 'PP', cor: '#94a3b8', nome: 'Prata' },
            { key: 'pe', label: 'PE', cor: '#eab308', nome: 'Eletro' },
            { key: 'po', label: 'PO', cor: '#fbbf24', nome: 'Ouro' },
            { key: 'pl', label: 'PL', cor: '#e5e7eb', nome: 'Platina' }
          ].map(m => (
            <div key={m.key} className="text-center">
              <div
                className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-[9px] font-bold"
                style={{ background: `linear-gradient(145deg, ${m.cor}, ${m.cor}88)`, color: '#1a0b3a' }}
              >{m.label}</div>
              <input
                type="number"
                value={personagem.moedas?.[m.key] || 0}
                onChange={(e) => update({ moedas: { ...personagem.moedas, [m.key]: Number(e.target.value) } })}
                className="w-full bg-black/30 rounded-md text-center text-xs font-mono-ui text-purple-200 focus:outline-none py-1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Itens */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="font-serif-ui text-xs tracking-[0.25em] text-purple-300/70">ITENS</h3>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-ghost rounded-lg px-2 py-1 text-xs flex items-center gap-1">
            <Plus className="w-3 h-3" />ADD
          </button>
        </div>

        {showAdd && (
          <div className="card-solid rounded-2xl p-3 mb-3 space-y-2 fade-in">
            <div className="grid grid-cols-3 gap-2">
              <TextField label="Item" value={item.nome} onChange={(v) => setItem({ ...item, nome: v })} placeholder="Poção de cura" className="col-span-2" />
              <TextField label="Qtd" type="number" value={item.qtd} onChange={(v) => setItem({ ...item, qtd: v })} />
            </div>
            <TextArea label="Descrição (opcional)" value={item.desc} onChange={(v) => setItem({ ...item, desc: v })} rows={2} />
            <div className="flex gap-2">
              <button onClick={adicionar} className="btn-primary rounded-xl px-4 py-2 text-sm flex-1">Adicionar</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost rounded-xl px-4 py-2 text-sm">Cancelar</button>
            </div>
          </div>
        )}

        {personagem.inventario.length === 0 ? (
          <div className="card-bg rounded-2xl p-6 text-center">
            <Package className="w-8 h-8 mx-auto text-purple-400/40 mb-2" strokeWidth={1.5} />
            <p className="text-xs text-purple-300/60 font-sans-ui">Mochila vazia</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {personagem.inventario.map(i => (
              <ItemRow key={i.id} item={i} onMinus={() => atualizarQtd(i.id, -1)} onPlus={() => atualizarQtd(i.id, 1)} onRemove={() => remover(i.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ItemRow({ item, onMinus, onPlus, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card-bg rounded-xl p-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="font-sans-ui text-sm text-purple-100 truncate">{item.nome}</div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onMinus} className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 text-sm active:scale-90">−</button>
          <span className="font-mono-ui text-sm text-purple-200 w-6 text-center">{item.qtd}</span>
          <button onClick={onPlus} className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 text-sm active:scale-90">+</button>
        </div>
        <button onClick={onRemove} className="text-purple-400/40 hover:text-red-400 p-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {expanded && item.desc && (
        <div className="mt-2 text-xs text-purple-300/70 font-sans-ui whitespace-pre-wrap border-t border-purple-500/10 pt-2">{item.desc}</div>
      )}
    </div>
  );
}

// =============================================================================
// TAB HISTÓRIA
// =============================================================================

function TabHistoria({ personagem, update }) {
  return (
    <div className="space-y-3 slide-up">
      <div className="card-bg rounded-2xl p-4 space-y-3">
        <TextArea label="Traços de Personalidade" value={personagem.tracos} onChange={(v) => update({ tracos: v })} rows={2} placeholder="O que torna seu personagem único..." />
        <TextArea label="Ideais" value={personagem.ideais} onChange={(v) => update({ ideais: v })} rows={2} placeholder="Princípios que o guiam..." />
        <TextArea label="Vínculos" value={personagem.vinculos} onChange={(v) => update({ vinculos: v })} rows={2} placeholder="Pessoas, lugares, objetos importantes..." />
        <TextArea label="Fraquezas" value={personagem.fraquezas} onChange={(v) => update({ fraquezas: v })} rows={2} placeholder="Vícios, medos, compulsões..." />
      </div>
      <div className="card-bg rounded-2xl p-4">
        <TextArea label="Anotações" value={personagem.notas} onChange={(v) => update({ notas: v })} rows={8} placeholder="Diário de aventura, NPCs, pistas, segredos..." />
      </div>
    </div>
  );
}

// =============================================================================
// MODAL DE DADOS
// =============================================================================

function DiceModal({ onClose, onRoll, personagem }) {
  const [mode, setMode] = useState('quick'); // quick | custom | history
  const [qtd, setQtd] = useState(1);
  const [lados, setLados] = useState(20);
  const [mod, setMod] = useState(0);
  const [vantagem, setVantagem] = useState('normal'); // normal | vantagem | desvantagem
  const [resultado, setResultado] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => { rollsLoad().then(setHistory); }, []);

  const rolarDado = async (numLados, qtdDados = 1, modif = 0, adv = 'normal') => {
    setRolling(true);
    setResultado(null);
    await new Promise(r => setTimeout(r, 700));

    const rolls = [];
    for (let i = 0; i < qtdDados; i++) rolls.push(Math.floor(Math.random() * numLados) + 1);

    let finalRolls = rolls;
    if (adv === 'vantagem' && numLados === 20 && qtdDados === 1) {
      const r2 = Math.floor(Math.random() * 20) + 1;
      finalRolls = [Math.max(rolls[0], r2)];
    } else if (adv === 'desvantagem' && numLados === 20 && qtdDados === 1) {
      const r2 = Math.floor(Math.random() * 20) + 1;
      finalRolls = [Math.min(rolls[0], r2)];
    }

    const soma = finalRolls.reduce((a,b) => a+b, 0);
    const total = soma + modif;
    const natural = numLados === 20 && finalRolls.length === 1 ? finalRolls[0] : null;

    const res = {
      id: uid(),
      timestamp: Date.now(),
      personagem: personagem.nome,
      expr: `${qtdDados}d${numLados}${modif ? (modif > 0 ? `+${modif}` : modif) : ''}${adv !== 'normal' ? ` (${adv === 'vantagem' ? 'VA' : 'DE'})` : ''}`,
      rolls: finalRolls,
      allRolls: adv !== 'normal' ? rolls : finalRolls,
      mod: modif,
      total,
      natural
    };

    setResultado(res);
    setRolling(false);
    const newHistory = [res, ...history].slice(0, 30);
    setHistory(newHistory);
    rollsSave(newHistory);
    return res;
  };

  const rolarRapido = (l) => { setLados(l); setQtd(1); setMod(0); setVantagem('normal'); rolarDado(l, 1, 0, 'normal'); };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 fade-in" onClick={onClose}>
      <div
        className="card-solid w-full max-w-md rounded-t-3xl md:rounded-3xl overflow-hidden slide-up border-purple-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/10">
          <h3 className="font-display text-lg text-purple-100 tracking-wider">MESA DE DADOS</h3>
          <button onClick={onClose} className="btn-ghost rounded-lg p-1.5"><X className="w-4 h-4" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-purple-500/10">
          {[['quick','Rápido'],['custom','Custom'],['history','Histórico']].map(([id,label]) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex-1 py-2 rounded-lg text-xs font-serif-ui tracking-wider transition-colors ${mode === id ? 'bg-purple-500/30 text-purple-100' : 'text-purple-400/60'}`}
            >{label.toUpperCase()}</button>
          ))}
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {mode === 'quick' && (
            <>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[4,6,8,10,12,20,100].map(l => (
                  <button
                    key={l}
                    onClick={() => rolarRapido(l)}
                    className="dice-btn rounded-2xl aspect-square flex flex-col items-center justify-center gap-1"
                  >
                    <IconDice sides={l} size={28} />
                    <span className="font-mono-ui text-xs text-purple-200 font-bold">d{l}</span>
                  </button>
                ))}
              </div>
              <p className="text-center text-[11px] text-purple-400/60 font-sans-ui">Toque num dado para rolar</p>
            </>
          )}

          {mode === 'custom' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-serif-ui tracking-wider text-purple-300/70 mb-1 uppercase">Qtd</label>
                  <div className="flex items-center card-bg rounded-xl p-1">
                    <button onClick={() => setQtd(Math.max(1, qtd - 1))} className="w-7 h-7 text-purple-300 active:scale-90">−</button>
                    <input type="number" value={qtd} onChange={(e) => setQtd(Math.max(1, Number(e.target.value)))} className="flex-1 bg-transparent text-center font-mono-ui text-lg text-purple-100 focus:outline-none" />
                    <button onClick={() => setQtd(qtd + 1)} className="w-7 h-7 text-purple-300 active:scale-90">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-serif-ui tracking-wider text-purple-300/70 mb-1 uppercase">Dado</label>
                  <SelectField value={String(lados)} onChange={(v) => setLados(Number(v))} options={['4','6','8','10','12','20','100']} />
                </div>
                <div>
                  <label className="block text-[10px] font-serif-ui tracking-wider text-purple-300/70 mb-1 uppercase">Mod</label>
                  <div className="flex items-center card-bg rounded-xl p-1">
                    <button onClick={() => setMod(mod - 1)} className="w-7 h-7 text-purple-300 active:scale-90">−</button>
                    <input type="number" value={mod} onChange={(e) => setMod(Number(e.target.value))} className="flex-1 bg-transparent text-center font-mono-ui text-lg text-purple-100 focus:outline-none" />
                    <button onClick={() => setMod(mod + 1)} className="w-7 h-7 text-purple-300 active:scale-90">+</button>
                  </div>
                </div>
              </div>

              {lados === 20 && qtd === 1 && (
                <div>
                  <label className="block text-[10px] font-serif-ui tracking-wider text-purple-300/70 mb-1 uppercase">Tipo</label>
                  <div className="flex gap-1 card-bg rounded-xl p-1">
                    {[['desvantagem','Desvantagem','🔻'],['normal','Normal','='],['vantagem','Vantagem','🔺']].map(([id,label,em]) => (
                      <button
                        key={id}
                        onClick={() => setVantagem(id)}
                        className={`flex-1 py-2 px-2 rounded-lg text-xs font-serif-ui tracking-wider transition-colors ${vantagem === id ? 'bg-purple-500/30 text-purple-100' : 'text-purple-400/60'}`}
                      >{em} {label}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center font-mono-ui text-purple-300/70 text-sm">
                {qtd}d{lados}{mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : ''}{vantagem !== 'normal' ? ` (${vantagem})` : ''}
              </div>

              <button
                onClick={() => rolarDado(lados, qtd, mod, vantagem)}
                disabled={rolling}
                className="w-full btn-primary rounded-2xl py-4 font-serif-ui text-sm tracking-[0.25em]"
              >
                ROLAR
              </button>
            </div>
          )}

          {mode === 'history' && (
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-center text-sm text-purple-300/60 font-sans-ui py-8">Nenhuma rolagem ainda</p>
              ) : (
                history.map(h => (
                  <div key={h.id} className="card-bg rounded-xl p-3 flex items-center gap-3">
                    <div className={`font-mono-ui text-2xl font-bold ${h.natural === 20 ? 'natural20' : h.natural === 1 ? 'natural1' : 'text-purple-100'}`}>
                      {h.total}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-serif-ui text-sm text-purple-200">{h.expr}</div>
                      <div className="text-[10px] text-purple-400/60 font-sans-ui truncate">
                        {h.personagem} · [{h.allRolls.join(', ')}]
                        {h.mod !== 0 && ` ${h.mod > 0 ? '+' : ''}${h.mod}`}
                      </div>
                    </div>
                    <div className="text-[10px] text-purple-400/50 font-mono-ui shrink-0">
                      {new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Resultado */}
          {(rolling || resultado) && mode !== 'history' && (
            <div className="mt-5 card-solid rounded-2xl p-5 text-center rune-border">
              {rolling ? (
                <div className="py-4">
                  <div className="dice-rolling inline-block">
                    <IconDice sides={lados} size={64} />
                  </div>
                  <p className="mt-3 font-serif-ui text-sm tracking-wider text-purple-300">ROLANDO...</p>
                </div>
              ) : resultado && (
                <div className="result-pulse">
                  <p className="font-serif-ui text-xs tracking-widest text-purple-300/70 mb-1">{resultado.expr}</p>
                  <div className={`font-mono-ui text-6xl font-bold my-2 ${resultado.natural === 20 ? 'natural20' : resultado.natural === 1 ? 'natural1' : 'text-purple-100'}`}>
                    {resultado.total}
                  </div>
                  {resultado.natural === 20 && <p className="font-display text-yellow-300 text-lg tracking-widest">CRÍTICO!</p>}
                  {resultado.natural === 1 && <p className="font-display text-red-400 text-lg tracking-widest">FALHA CRÍTICA</p>}
                  <p className="text-xs text-purple-400/70 font-mono-ui mt-2">
                    [{resultado.allRolls.join(', ')}]{resultado.mod !== 0 ? ` ${resultado.mod > 0 ? '+' : ''}${resultado.mod}` : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// LEVEL UP WIZARD (gameficado)
// =============================================================================

function LevelUpModal({ personagem, onClose, onConfirm }) {
  const [passo, setPasso] = useState(0);
  const novoNivel = personagem.nivel + 1;
  const classe = CLASSES[personagem.classe];
  const hitDie = classe?.hitDie || 8;
  const conMod = calcMod(personagem.atributos.constituicao);

  const [hpMode, setHpMode] = useState('medio'); // medio | aleatorio | max
  const [hpAleatorio, setHpAleatorio] = useState(null);
  const hpMedio = Math.floor(hitDie / 2) + 1; // ex: d10 -> 6
  const hpGanho =
    hpMode === 'medio' ? hpMedio + conMod :
    hpMode === 'max' ? hitDie + conMod :
    (hpAleatorio !== null ? hpAleatorio + conMod : null);

  // ASI/Talento: 4, 8, 12, 16, 19 (em 2024)
  const isASI = [4,8,12,16,19].includes(novoNivel);
  const [asiChoice, setAsiChoice] = useState('asi'); // asi | talento
  const [asiPoints, setAsiPoints] = useState({}); // { forca: 1 }
  const pontosGastos = Object.values(asiPoints).reduce((a,b) => a+b, 0);

  const newSlots = getSpellSlots(personagem.classe, novoNivel);
  const oldSlots = getSpellSlots(personagem.classe, personagem.nivel);

  const rolarHp = () => {
    const r = Math.floor(Math.random() * hitDie) + 1;
    setHpAleatorio(r);
  };

  const confirmar = () => {
    const patch = {
      nivel: novoNivel,
      hpMax: personagem.hpMax + (hpGanho || 0),
      hpAtual: personagem.hpAtual + (hpGanho || 0)
    };
    if (isASI && asiChoice === 'asi') {
      const novosAttr = { ...personagem.atributos };
      Object.entries(asiPoints).forEach(([key, v]) => { novosAttr[key] = (novosAttr[key] || 10) + v; });
      patch.atributos = novosAttr;
    }
    onConfirm(patch);
  };

  // Dicas por classe
  const dicasClasse = {
    'Bárbaro': 'Foque em FORÇA e CONSTITUIÇÃO. No 3º nível você escolhe um Caminho Primal.',
    'Bardo': 'Seu atributo principal é CARISMA. No 3º nível você escolhe um Colégio Bárdico.',
    'Bruxo': 'CARISMA é sua chave. Lembre que slots de pacto recuperam em descanso curto!',
    'Clérigo': 'SABEDORIA guia suas magias. Você prepara magias da sua lista de classe.',
    'Druida': 'SABEDORIA é o principal. No 2º nível ganha Forma Selvagem.',
    'Feiticeiro': 'CARISMA é primordial. Os Pontos de Feitiçaria dão flexibilidade com metamagia.',
    'Guerreiro': 'FORÇA ou DESTREZA (escolha um). Retomada é sua habilidade-assinatura.',
    'Ladino': 'DESTREZA é o principal. Ataque Furtivo é seu pão de cada dia.',
    'Mago': 'INTELIGÊNCIA é tudo. Você pode aprender novas magias escrevendo no grimório.',
    'Monge': 'DESTREZA e SABEDORIA. Ki alimenta suas habilidades especiais.',
    'Paladino': 'FORÇA e CARISMA. Punições Divinas convertem slots em dano massivo.',
    'Patrulheiro': 'DESTREZA e SABEDORIA. Escolha presas favoritas com sabedoria.'
  };

  const novasFeaturesMsg = {
    2: 'Você desbloqueia novas capacidades de classe.',
    3: '🌟 Subclasse! Você escolhe sua especialização.',
    5: '⚡ Ataque Extra para muitas classes, ou magias de 3º nível para conjuradores.',
    11: '💫 Magias de 6º nível para conjuradores completos.',
    20: '👑 Capacidade suprema! Seu personagem atinge o auge.'
  };

  const passos = [
    'evolucao',
    'hp',
    ...(isASI ? ['asi'] : []),
    'magias',
    'confirmar'
  ];

  const passoAtual = passos[passo];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 fade-in">
      <div className="card-solid w-full max-w-md rounded-3xl overflow-hidden slide-up rune-border">
        {/* Header épico */}
        <div
          className="px-6 py-5 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
        >
          <div className="relative">
            <Crown className="w-10 h-10 mx-auto text-purple-900 mb-1" strokeWidth={2} />
            <h2 className="font-display text-2xl tracking-widest text-purple-950">SUBIR DE NÍVEL</h2>
            <p className="font-serif-ui text-xs tracking-[0.3em] text-purple-900/70 mt-1">
              NÍVEL {personagem.nivel} → NÍVEL {novoNivel}
            </p>
          </div>
        </div>

        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {/* Stepper */}
          <div className="flex gap-1 mb-5">
            {passos.map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= passo ? 'bg-yellow-400' : 'bg-purple-900/50'}`} />
            ))}
          </div>

          {/* Passo 1: Evolução */}
          {passoAtual === 'evolucao' && (
            <div className="text-center">
              <div className="font-display text-purple-100 text-xl mb-2">Sua jornada evolui</div>
              <p className="text-sm text-purple-300/80 font-sans-ui mb-4 leading-relaxed">
                {dicasClasse[personagem.classe]}
              </p>
              {novasFeaturesMsg[novoNivel] && (
                <div className="card-bg rounded-2xl p-4 mb-4">
                  <p className="font-serif-ui text-sm text-yellow-300 tracking-wide">{novasFeaturesMsg[novoNivel]}</p>
                </div>
              )}
              <div className="card-bg rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-300 shrink-0" />
                  <span className="text-xs text-purple-200 font-sans-ui">Bônus de proficiência: <strong className="font-mono-ui">+{profBonus(personagem.nivel)}</strong> → <strong className="font-mono-ui">+{profBonus(novoNivel)}</strong></span>
                </div>
                {isASI && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span className="text-xs text-purple-200 font-sans-ui">Aumento de atributo ou talento disponível</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-300 shrink-0" />
                  <span className="text-xs text-purple-200 font-sans-ui">Ganha novos pontos de vida (d{hitDie})</span>
                </div>
              </div>
              <p className="text-[11px] text-purple-400/50 mt-3 font-sans-ui italic">
                ⚠️ Verifique as novas capacidades da sua classe no livro para o nível {novoNivel}
              </p>
            </div>
          )}

          {/* Passo 2: HP */}
          {passoAtual === 'hp' && (
            <div>
              <h3 className="font-display text-purple-100 text-lg mb-1 text-center">Pontos de Vida</h3>
              <p className="text-xs text-purple-400/70 font-sans-ui text-center mb-4">
                Dado de vida: d{hitDie} · CON: {fmtMod(conMod)}
              </p>

              <div className="space-y-2 mb-4">
                <button
                  onClick={() => setHpMode('medio')}
                  className={`w-full p-3 rounded-2xl text-left transition-all ${hpMode === 'medio' ? 'card-solid border-yellow-400/50 border-2' : 'card-bg'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-serif-ui text-sm text-purple-100">⭐ Valor Médio</div>
                      <div className="text-[11px] text-purple-400/60 font-sans-ui">Recomendado · Estável</div>
                    </div>
                    <div className="font-mono-ui text-xl text-purple-200">+{hpMedio + conMod}</div>
                  </div>
                </button>

                <button
                  onClick={() => { setHpMode('aleatorio'); if (hpAleatorio === null) rolarHp(); }}
                  className={`w-full p-3 rounded-2xl text-left transition-all ${hpMode === 'aleatorio' ? 'card-solid border-yellow-400/50 border-2' : 'card-bg'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-serif-ui text-sm text-purple-100">🎲 Rolar Dado</div>
                      <div className="text-[11px] text-purple-400/60 font-sans-ui">
                        {hpAleatorio !== null ? `Rolou ${hpAleatorio}` : 'Deixe a sorte decidir'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hpAleatorio !== null && <div className="font-mono-ui text-xl text-purple-200">+{hpAleatorio + conMod}</div>}
                      {hpMode === 'aleatorio' && (
                        <button onClick={(e) => { e.stopPropagation(); rolarHp(); }} className="btn-ghost rounded-lg p-2">
                          <RotateCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setHpMode('max')}
                  className={`w-full p-3 rounded-2xl text-left transition-all ${hpMode === 'max' ? 'card-solid border-yellow-400/50 border-2' : 'card-bg'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-serif-ui text-sm text-purple-100">💪 Máximo</div>
                      <div className="text-[11px] text-purple-400/60 font-sans-ui">Se o mestre permitir</div>
                    </div>
                    <div className="font-mono-ui text-xl text-purple-200">+{hitDie + conMod}</div>
                  </div>
                </button>
              </div>

              <div className="card-bg rounded-2xl p-3 text-center">
                <div className="text-[10px] font-serif-ui tracking-wider text-purple-300/70">NOVO HP MÁXIMO</div>
                <div className="font-mono-ui text-3xl text-purple-100 font-bold">
                  {personagem.hpMax} → <span className="text-yellow-300">{personagem.hpMax + (hpGanho || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Passo 3: ASI */}
          {passoAtual === 'asi' && (
            <div>
              <h3 className="font-display text-purple-100 text-lg mb-1 text-center">Aumento de Atributo</h3>
              <p className="text-xs text-purple-400/70 font-sans-ui text-center mb-4">Você pode aumentar atributos OU escolher um talento</p>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAsiChoice('asi')}
                  className={`flex-1 p-3 rounded-xl transition-all ${asiChoice === 'asi' ? 'card-solid border-yellow-400/50 border-2' : 'card-bg'}`}
                >
                  <div className="font-serif-ui text-xs tracking-wider text-purple-100">AUMENTAR ATRIBUTO</div>
                  <div className="text-[10px] text-purple-400/60 mt-1">+2 em 1 OU +1 em 2</div>
                </button>
                <button
                  onClick={() => setAsiChoice('talento')}
                  className={`flex-1 p-3 rounded-xl transition-all ${asiChoice === 'talento' ? 'card-solid border-yellow-400/50 border-2' : 'card-bg'}`}
                >
                  <div className="font-serif-ui text-xs tracking-wider text-purple-100">TALENTO</div>
                  <div className="text-[10px] text-purple-400/60 mt-1">Anote manualmente</div>
                </button>
              </div>

              {asiChoice === 'asi' ? (
                <div>
                  <div className="text-center text-xs font-serif-ui tracking-wider text-purple-300 mb-3">
                    PONTOS RESTANTES: <span className="text-yellow-300 font-bold">{2 - pontosGastos}</span> / 2
                  </div>
                  <div className="space-y-2">
                    {ATRIBUTOS.map(a => {
                      const atual = personagem.atributos[a.key];
                      const ganho = asiPoints[a.key] || 0;
                      const final = atual + ganho;
                      return (
                        <div key={a.key} className="card-bg rounded-xl p-3 flex items-center gap-3">
                          <span className="font-serif-ui text-sm text-purple-100 w-24">{a.nome}</span>
                          <div className="flex-1 text-right">
                            <div className="font-mono-ui text-sm text-purple-200">
                              {atual} {ganho > 0 && <span className="text-yellow-300">→ {final}</span>}
                            </div>
                            <div className="text-[10px] text-purple-400/60">mod {fmtMod(calcMod(final))}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { if (ganho > 0) setAsiPoints({ ...asiPoints, [a.key]: ganho - 1 }); }}
                              className="w-7 h-7 rounded-md bg-purple-500/20 text-purple-300 active:scale-90 disabled:opacity-30"
                              disabled={ganho === 0}
                            >−</button>
                            <span className="font-mono-ui text-sm w-6 text-center text-yellow-300">+{ganho}</span>
                            <button
                              onClick={() => { if (pontosGastos < 2 && final < 20 && ganho < 2) setAsiPoints({ ...asiPoints, [a.key]: ganho + 1 }); }}
                              className="w-7 h-7 rounded-md bg-purple-500/20 text-purple-300 active:scale-90 disabled:opacity-30"
                              disabled={pontosGastos >= 2 || final >= 20 || ganho >= 2}
                            >+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="card-bg rounded-2xl p-4 text-center">
                  <Sparkles className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
                  <p className="text-sm text-purple-200 font-sans-ui">
                    Escolha seu talento consultando a lista do Livro do Jogador e anote manualmente em <strong>Características</strong> (aba Combate).
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Passo 4: Magias */}
          {passoAtual === 'magias' && (
            <div>
              <h3 className="font-display text-purple-100 text-lg mb-3 text-center">
                {CLASSES[personagem.classe]?.magico ? 'Capacidade Mágica' : 'Capacidades de Classe'}
              </h3>

              {newSlots && oldSlots ? (
                <div className="card-bg rounded-2xl p-4">
                  <div className="font-serif-ui text-xs tracking-wider text-purple-300/70 mb-3 text-center">NOVOS SLOTS DE MAGIA</div>
                  {newSlots.tipo === 'pact' ? (
                    <div className="text-center">
                      <div className="font-mono-ui text-xl text-purple-100">
                        {oldSlots.pact?.slots || 0}× Nv {oldSlots.pact?.level || 1} → <span className="text-yellow-300">{newSlots.pact.slots}× Nv {newSlots.pact.level}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {newSlots.slots.map((qtd, idx) => {
                        const oldQtd = oldSlots.slots[idx] || 0;
                        if (qtd === 0 && oldQtd === 0) return null;
                        const mudou = qtd !== oldQtd;
                        return (
                          <div key={idx} className={`flex items-center justify-between text-sm ${mudou ? 'text-yellow-300' : 'text-purple-300/70'}`}>
                            <span className="font-serif-ui tracking-wider">{idx + 1}º Nível</span>
                            <span className="font-mono-ui">
                              {oldQtd} {mudou && <>→ <strong>{qtd}</strong></>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="mt-3 text-[11px] text-purple-400/60 font-sans-ui text-center">
                    Não esqueça de cadastrar novas magias conhecidas/preparadas na aba Magias!
                  </p>
                </div>
              ) : (
                <div className="card-bg rounded-2xl p-4 text-center">
                  <Sword className="w-8 h-8 mx-auto text-purple-400/60 mb-2" />
                  <p className="text-sm text-purple-200 font-sans-ui">
                    Consulte o livro para as capacidades ganhas de <strong>{personagem.classe}</strong> no nível {novoNivel} e anote em <strong>Características</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Passo 5: Confirmar */}
          {passoAtual === 'confirmar' && (
            <div className="text-center">
              <Crown className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
              <h3 className="font-display text-purple-100 text-xl mb-2">Pronto para ascender?</h3>
              <div className="card-bg rounded-2xl p-4 space-y-2 text-left mt-4">
                <Row label="Nível" val={`${personagem.nivel} → ${novoNivel}`} />
                <Row label="HP Máximo" val={`${personagem.hpMax} → ${personagem.hpMax + (hpGanho || 0)}`} />
                <Row label="Proficiência" val={`+${profBonus(personagem.nivel)} → +${profBonus(novoNivel)}`} />
                {isASI && asiChoice === 'asi' && Object.entries(asiPoints).filter(([_,v]) => v > 0).map(([key, v]) => (
                  <Row key={key} label={ATRIBUTOS.find(a => a.key === key)?.nome} val={`+${v}`} highlight />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer com navegação */}
        <div className="p-4 border-t border-purple-500/10 flex gap-2">
          {passo > 0 ? (
            <button onClick={() => setPasso(passo - 1)} className="btn-ghost rounded-xl px-5 py-3 font-serif-ui text-xs tracking-wider">
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={onClose} className="btn-ghost rounded-xl px-5 py-3 font-serif-ui text-xs tracking-wider">
              CANCELAR
            </button>
          )}

          {passo < passos.length - 1 ? (
            <button
              onClick={() => setPasso(passo + 1)}
              disabled={
                (passoAtual === 'hp' && hpGanho === null) ||
                (passoAtual === 'asi' && asiChoice === 'asi' && pontosGastos !== 2)
              }
              className="btn-primary rounded-xl px-5 py-3 font-serif-ui text-xs tracking-[0.2em] flex-1 disabled:opacity-40"
            >
              CONTINUAR <ChevronRight className="w-4 h-4 inline ml-1" />
            </button>
          ) : (
            <button
              onClick={confirmar}
              className="rounded-xl px-5 py-3 font-serif-ui text-xs tracking-[0.2em] flex-1"
              style={{ background: 'linear-gradient(180deg, #fbbf24, #d97706)', color: '#0b0418', fontWeight: 700 }}
            >
              ✨ ASCENDER
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, val, highlight }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-serif-ui tracking-wider text-purple-300/70">{label}</span>
      <span className={`font-mono-ui text-sm ${highlight ? 'text-yellow-300' : 'text-purple-100'}`}>{val}</span>
    </div>
  );
}

// =============================================================================
// MODAL NOVO PERSONAGEM
// =============================================================================

function NewCharacterModal({ onClose, onCreate }) {
  const [p, setP] = useState(novoPersonagem());

  const criar = () => {
    onCreate(p);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 fade-in" onClick={onClose}>
      <div className="card-solid w-full max-w-md rounded-t-3xl md:rounded-3xl overflow-hidden slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/10">
          <h3 className="font-display text-lg text-purple-100 tracking-wider">NOVA FICHA</h3>
          <button onClick={onClose} className="btn-ghost rounded-lg p-1.5"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {/* Avatar picker */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-purple-300/70 mb-2 font-serif-ui">Avatar</label>
            <div className="grid grid-cols-5 gap-2">
              {AVATARS.map(a => (
                <button
                  key={a}
                  onClick={() => setP({ ...p, avatar: a })}
                  className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${p.avatar === a ? 'card-solid border-2 border-purple-400 scale-110' : 'card-bg'}`}
                >{a}</button>
              ))}
            </div>
          </div>

          <TextField label="Nome do personagem" value={p.nome} onChange={(v) => setP({ ...p, nome: v })} placeholder="Ex: Lyra Meianoite" />

          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Classe" value={p.classe} onChange={(v) => setP({ ...p, classe: v })} options={Object.keys(CLASSES)} />
            <SelectField label="Raça" value={p.raca} onChange={(v) => setP({ ...p, raca: v })} options={RACAS} />
          </div>

          <div className="card-bg rounded-xl p-3">
            <div className="text-[11px] text-purple-300/80 font-sans-ui leading-relaxed">
              <strong className="font-serif-ui tracking-wide" style={{ color: CLASSES[p.classe]?.cor }}>{p.classe}:</strong> {CLASSES[p.classe]?.desc}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextField label="Nível inicial" type="number" value={p.nivel} onChange={(v) => setP({ ...p, nivel: Math.max(1, Math.min(20, v)), xp: XP_TABLE[Math.max(1, Math.min(20, v))] })} />
            <SelectField label="Alinhamento" value={p.alinhamento} onChange={(v) => setP({ ...p, alinhamento: v })} options={ALINHAMENTOS} />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-purple-300/70 mb-2 font-serif-ui">Atributos (Point Buy / Rolagem)</label>
            <div className="grid grid-cols-3 gap-2">
              {ATRIBUTOS.map(a => (
                <div key={a.key} className="card-bg rounded-xl p-2 text-center">
                  <div className="text-[10px] font-serif-ui tracking-wider text-purple-300/60">{a.abrev}</div>
                  <input
                    type="number"
                    value={p.atributos[a.key]}
                    onChange={(e) => setP({ ...p, atributos: { ...p.atributos, [a.key]: Math.max(1, Math.min(30, Number(e.target.value))) } })}
                    className="w-full bg-transparent text-center font-mono-ui text-xl text-purple-100 focus:outline-none font-bold my-1"
                  />
                  <div className="text-[10px] text-purple-400/60">{fmtMod(calcMod(p.atributos[a.key]))}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextField label="HP Máximo" type="number" value={p.hpMax} onChange={(v) => setP({ ...p, hpMax: v, hpAtual: v })} />
            <TextField label="CA" type="number" value={p.ca} onChange={(v) => setP({ ...p, ca: v })} />
          </div>
        </div>
        <div className="p-4 border-t border-purple-500/10 flex gap-2">
          <button onClick={onClose} className="btn-ghost rounded-xl px-5 py-3 font-serif-ui text-xs tracking-wider">CANCELAR</button>
          <button onClick={criar} className="btn-primary rounded-xl px-5 py-3 font-serif-ui text-xs tracking-[0.2em] flex-1">
            ✨ CRIAR FICHA
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// APP ROOT
// =============================================================================

export default function App() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [levelingUp, setLevelingUp] = useState(false);

  // Rolagem global via botão de atributo/perícia
  const [diceResult, setDiceResult] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Carrega o mais rápido possível; em caso de qualquer erro, libera a UI
    storageLoad()
      .then(chars => { if (mounted) { setCharacters(chars); setLoading(false); } })
      .catch(() => { if (mounted) setLoading(false); });

    // Timeout de segurança: se em 5s o loading não saiu, força saída
    const safety = setTimeout(() => { if (mounted) setLoading(false); }, 5000);

    // Auto-refresh a cada 15s para detectar mudanças de outros jogadores
    const interval = setInterval(() => {
      storageLoad()
        .then(chars => {
          if (!mounted) return;
          setCharacters(prev => JSON.stringify(prev) !== JSON.stringify(chars) ? chars : prev);
        })
        .catch(() => {});
    }, 15000);

    return () => { mounted = false; clearTimeout(safety); clearInterval(interval); };
  }, []);

  const saveAll = useCallback((chars) => {
    setCharacters(chars);
    storageSave(chars);
  }, []);

  const updateCharacter = (updated) => {
    const novos = characters.map(c => c.id === updated.id ? updated : c);
    saveAll(novos);
  };

  const createCharacter = (novo) => {
    saveAll([...characters, novo]);
    setCurrentId(novo.id);
  };

  const deleteCharacter = (id) => {
    saveAll(characters.filter(c => c.id !== id));
  };

  const current = characters.find(c => c.id === currentId);

  // Rolagem com modificador vindo de perícia/atributo/ataque
  const handleQuickRoll = async (info) => {
    // info: { tipo, nome, mod, personagem }
    const r1 = Math.floor(Math.random() * 20) + 1;
    const total = r1 + (info.mod || 0);
    const result = {
      id: uid(),
      timestamp: Date.now(),
      personagem: info.personagem,
      expr: `${info.nome} (1d20${info.mod >= 0 ? '+' : ''}${info.mod})`,
      rolls: [r1],
      allRolls: [r1],
      mod: info.mod || 0,
      total,
      natural: r1
    };
    setDiceResult(result);
    const history = await rollsLoad();
    rollsSave([result, ...history]);
    setTimeout(() => setDiceResult(null), 3500);
  };

  if (loading) {
    return (
      <div className="grimorio-bg flex items-center justify-center min-h-screen">
        <GlobalStyles />
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl card-solid flex items-center justify-center glow-purple animate-pulse">
            <BookOpen className="w-8 h-8 text-purple-300" />
          </div>
          <p className="font-serif-ui text-sm tracking-[0.3em] text-purple-300/70">CARREGANDO GRIMÓRIO</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans-ui">
      <GlobalStyles />

      {current ? (
        <CharacterSheet
          personagem={current}
          onUpdate={updateCharacter}
          onBack={() => setCurrentId(null)}
          onRoll={handleQuickRoll}
          onLevelUp={() => setLevelingUp(true)}
        />
      ) : (
        <HomeScreen
          characters={characters}
          onSelect={setCurrentId}
          onCreate={() => setCreating(true)}
          onDelete={deleteCharacter}
        />
      )}

      {creating && <NewCharacterModal onClose={() => setCreating(false)} onCreate={createCharacter} />}

      {levelingUp && current && (
        <LevelUpModal
          personagem={current}
          onClose={() => setLevelingUp(false)}
          onConfirm={(patch) => {
            updateCharacter({ ...current, ...patch });
            setLevelingUp(false);
          }}
        />
      )}

      {/* Toast de rolagem rápida */}
      {diceResult && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 card-solid rounded-2xl p-4 rune-border fade-in" style={{ minWidth: 240 }}>
          <p className="font-serif-ui text-[10px] tracking-widest text-purple-300/70 text-center">{diceResult.expr}</p>
          <div className={`font-mono-ui text-4xl font-bold text-center my-1 ${diceResult.natural === 20 ? 'natural20' : diceResult.natural === 1 ? 'natural1' : 'text-purple-100'}`}>
            {diceResult.total}
          </div>
          {diceResult.natural === 20 && <p className="font-display text-yellow-300 text-xs tracking-widest text-center">CRÍTICO!</p>}
          {diceResult.natural === 1 && <p className="font-display text-red-400 text-xs tracking-widest text-center">FALHA!</p>}
          <p className="text-[10px] text-purple-400/60 font-mono-ui text-center mt-1">
            rolou [{diceResult.rolls[0]}]{diceResult.mod !== 0 ? ` ${diceResult.mod > 0 ? '+' : ''}${diceResult.mod}` : ''}
          </p>
        </div>
      )}
    </div>
  );
}
