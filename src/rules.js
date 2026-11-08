export const rhythms = [
  ["Thrash Metal / Hard Rock", "+2", "Lutar ou Atirar"],
  ["Heavy Metal / Rock Gótico", "+2", "Espírito contra Medo ou Intimidar"],
  ["Blues Rock / Southern Rock", "Remove", "Distraído", "instant"],
  ["Punk Rock", "+2", "Atletismo para escapar"],
  ["Rock Progressivo / Alternativo", "+2", "Pesquisar, Perceber ou Consertar"],
  ["Funk Rock / New Wave", "+2", "Ao bônus de Suporte bem-sucedido; teto +4"],
  ["Glam Rock", "+2", "Persuasão ou Atuação"],
  [
    "Grunge / Pós-punk",
    "+2",
    "Astúcia contra Provocar ou Espírito contra Intimidar",
  ],
];
export const instruments = [
  [
    "Vocal",
    "Voz de Comando",
    "Próxima Característica como ação. Não vale para dano ou reações.",
  ],
  [
    "Guitarra solo",
    "Solo Devastador",
    "Atuação × Espírito: Distraído ou Vulnerável; com ampliação, também Abalado.",
    "condition",
  ],
  [
    "Guitarra base",
    "Muralha Sonora",
    "Próxima resistência contra Medo, Intimidação, Provocação ou outro Desafio. Não vale para Absorção, recuperação de Abalado ou Incapacitação.",
  ],
  [
    "Baixo",
    "Pulso Restaurador",
    "Remove Distraído ou Vulnerável; com ampliação, ambos. Não remove Abalado.",
    "instant",
  ],
  ["Bateria", "Batida Implacável", "Próxima rolagem de Atletismo."],
  [
    "Teclado",
    "Distorção Harmônica",
    "Próxima rolagem de Perceber ou Furtividade, com orientação ou distração plausível.",
  ],
  ["Saxofone", "Improviso Selvagem", "Próxima rolagem de Provocação."],
  ["Violino elétrico", "Tensão Crescente", "Próxima rolagem de Intimidação."],
  [
    "DJ / Sampler",
    "Remix Instantâneo",
    "Próxima rolagem de Consertar envolvendo tecnologia.",
  ],
  ["Percussão", "Ritmo Interior", "Próxima rolagem de Espírito."],
  ["Harmônica", "Lamento da Estrada", "Próxima rolagem de Sobrevivência."],
];
export const initial = () => ({
  version: 1,
  band: "Sua banda",
  scene: 1,
  round: 1,
  cohesion: 3,
  active: null,
  activationRound: null,
  played: [],
  bisUsed: false,
  hymnUsed: false,
  members: [0, 1, 3, 4].map((instrument, i) => ({
    id: crypto.randomUUID(),
    name: ["Vocalista", "Guitarrista", "Baixista", "Baterista"][i],
    instrument,
    solo: null,
    rhythmUsed: false,
    embaloUsed: false,
  })),
  songs: [
    ["Fúria Elétrica", 0],
    ["Alma da Meia-Noite", 2],
    ["Labirinto Sonoro", 4],
  ].map(([name, rhythm]) => ({
    id: crypto.randomUUID(),
    name,
    rhythm,
    grade: 1,
  })),
  effects: [],
  hasBis: false,
  hasEmbalo: false,
});
export function activate(state, id, { bis = false, free = false } = {}) {
  const song = state.songs.find((s) => s.id === id);
  if (!song) throw Error("Composição não encontrada.");
  if (state.activationRound === state.round)
    throw Error("A banda já ativou uma música nesta rodada.");
  const repeat = state.played.includes(id);
  if (repeat && (!bis || !state.hasBis || state.bisUsed))
    throw Error(
      "Essa composição já foi ativada nesta cena. Use Bis! se a banda tiver a Vantagem.",
    );
  if (free && (repeat || song.grade !== 4 || state.hymnUsed))
    throw Error(
      "A ativação gratuita exige um Hino e só pode ser usada uma vez por sessão.",
    );
  if (!free && state.cohesion < 1)
    throw Error("É necessário 1 ponto de Coesão.");
  return {
    ...state,
    active: id,
    activationRound: state.round,
    cohesion: state.cohesion - (free ? 0 : 1),
    played: [...new Set([...state.played, id])],
    bisUsed: state.bisUsed || repeat,
    hymnUsed: state.hymnUsed || free,
    members: state.members.map((m) => ({
      ...m,
      rhythmUsed: rhythms[song.rhythm][3] === "instant",
    })),
  };
}
export function nextScene(s) {
  return {
    ...s,
    scene: s.scene + 1,
    round: 1,
    active: null,
    activationRound: null,
    played: [],
    bisUsed: false,
    effects: [],
    members: s.members.map((m) => ({
      ...m,
      solo: null,
      rhythmUsed: false,
      embaloUsed: false,
    })),
  };
}
export function validState(s) {
  return (
    s?.version === 1 &&
    typeof s.band === "string" &&
    s.band.length <= 80 &&
    Number.isInteger(s.scene) &&
    s.scene > 0 &&
    Number.isInteger(s.round) &&
    s.round > 0 &&
    Number.isInteger(s.cohesion) &&
    s.cohesion >= 0 &&
    s.cohesion <= 5 &&
    Array.isArray(s.members) &&
    s.members.length >= 1 &&
    s.members.length <= 6 &&
    Array.isArray(s.songs) &&
    s.songs.length >= 1 &&
    s.songs.length <= 8 &&
    s.members.every(
      (m) =>
        typeof m.id === "string" &&
        [null, "Falha", "Sucesso", "Ampliação"].includes(m.solo) &&
        typeof m.rhythmUsed === "boolean" &&
        typeof m.embaloUsed === "boolean" &&
        typeof m.name === "string" &&
        m.name.length <= 40 &&
        Number.isInteger(m.instrument) &&
        instruments[m.instrument],
    ) &&
    s.songs.every(
      (x) =>
        typeof x.id === "string" &&
        typeof x.name === "string" &&
        x.name.length <= 80 &&
        Number.isInteger(x.rhythm) &&
        rhythms[x.rhythm] &&
        [1, 2, 3, 4].includes(x.grade),
    ) &&
    Array.isArray(s.played) &&
    Array.isArray(s.effects) &&
    s.effects.length <= 50 &&
    s.effects.every(
      (e) =>
        typeof e.id === "string" &&
        typeof e.text === "string" &&
        typeof e.target === "string" &&
        typeof e.source === "string",
    ) &&
    (s.active === null || s.songs.some((x) => x.id === s.active))
  );
}
