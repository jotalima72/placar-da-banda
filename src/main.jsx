import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  rhythms,
  instruments,
  initial,
  activate,
  nextScene,
  validState,
} from "./rules";
import "./style.css";
const KEY = "rnnd-placar-v1";
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    return validState(s)
      ? { ...s, configured: s.configured === true }
      : { ...initial(), configured: false };
  } catch {
    return { ...initial(), configured: false };
  }
}
function App() {
  const [s, setS] = useState(load),
    [panel, setPanel] = useState(() => (s.configured ? null : "setup")),
    [message, setMessage] = useState(""),
    [solo, setSolo] = useState(null),
    [target, setTarget] = useState(""),
    [condition, setCondition] = useState("Distraído"),
    [draft, setDraft] = useState(() => structuredClone(s)),
    [undo, setUndo] = useState(null);
  const file = useRef(),
    opener = useRef();
  useEffect(() => {
    if (!panel) return;
    const previous = opener.current;
    const handler = (e) => {
      if (e.key === "Escape") {
        setPanel(null);
        return;
      }
      if (e.key === "Tab") {
        const nodes = [
          ...document.querySelectorAll(
            ".drawer button:not(:disabled),.drawer input:not(:disabled),.drawer select:not(:disabled)",
          ),
        ];
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [panel]);
  const song = s.songs.find((x) => x.id === s.active),
    rhythm = song && rhythms[song.rhythm];
  function commit(n) {
    setUndo(s);
    setS(n);
    try {
      localStorage.setItem(KEY, JSON.stringify(n));
      setMessage("");
    } catch {
      setMessage(
        "Não foi possível salvar no navegador. Exporte o placar para guardar os dados.",
      );
    }
  }
  function run(fn) {
    try {
      commit(fn());
    } catch (e) {
      setMessage(e.message);
    }
  }
  function member(id, patch) {
    commit({
      ...s,
      members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    });
  }
  function openSetup() {
    setDraft(structuredClone(s));
    setPanel("setup");
  }
  function result(value) {
    const m = s.members.find((x) => x.id === solo),
      inst = instruments[m.instrument];
    if (!target.trim() && value !== "Falha") {
      setMessage("Informe quem recebe o efeito.");
      return;
    }
    const effect = {
      id: crypto.randomUUID(),
      source: m.name,
      target: target.trim(),
      text: `${inst[1]} · ${inst[3] === "condition" ? `${condition}${value === "Ampliação" ? " + Abalado" : ""}` : inst[3] === "instant" ? `Remove ${value === "Ampliação" ? "Distraído e Vulnerável" : condition}` : `${value === "Ampliação" ? "+3" : "+2"} · ${inst[2]}`}`,
      kind: inst[3] || "bonus",
    };
    commit({
      ...s,
      members: s.members.map((x) =>
        x.id === m.id ? { ...x, solo: value } : x,
      ),
      effects: value === "Falha" ? s.effects : [...s.effects, effect],
    });
    setSolo(null);
    setPanel(null);
  }
  function exportFile() {
    const blob = new Blob([JSON.stringify(s, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "placar-da-banda.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  async function importFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    try {
      if (f.size > 100000) throw Error();
      const n = JSON.parse(await f.text());
      if (!validState(n)) throw Error();
      commit({ ...n, configured: true });
      setPanel(null);
    } catch {
      setMessage("Arquivo inválido. Importe um JSON exportado pelo placar.");
    }
    e.target.value = "";
  }
  return (
    <>
      <main
        className="board"
        onClickCapture={(e) => {
          if (!panel) opener.current = e.target.closest("button");
        }}
      >
        <header>
          <div className="brand">
            ROCK <span>’N’ ROLL</span>
            <br />
            NEVER DIES
          </div>
          <div className="band">
            <h1>{s.band}</h1>
            <span>Placar de sessão</span>
          </div>
          <button aria-label="Abrir configuração da banda" onClick={openSetup}>
            Configurar
          </button>
        </header>
        <section
          className={"now " + (song ? "playing" : "")}
          aria-label="Música ativa"
        >
          <div className="track">
            <span>{song ? "Música ativa" : "A banda está pronta"}</span>
            <h2>{song ? song.name : "O palco é de vocês."}</h2>
            <p>
              {song
                ? rhythm[0]
                : "Selecione uma composição do setlist para começar."}
            </p>
          </div>
          <div className="rhythm">
            <strong>{rhythm ? rhythm[1] : "—"}</strong>
            <div>
              <b>{rhythm ? rhythm[2] : "Nenhum ritmo ativo"}</b>
              <small>
                {song
                  ? rhythm[3]
                    ? "Efeito imediato aplicado a todos."
                    : "Uma vez por integrante nesta ativação."
                  : "Ativar custa 1 Coesão e libera os Solos."}
              </small>
            </div>
          </div>
          <div className="cohesion">
            <span>Coesão</span>
            <div>
              <button
                aria-label="Diminuir Coesão"
                disabled={!s.cohesion}
                onClick={() => commit({ ...s, cohesion: s.cohesion - 1 })}
              >
                −
              </button>
              <strong>
                {s.cohesion}
                <small>/5</small>
              </strong>
              <button
                aria-label="Aumentar Coesão"
                disabled={s.cohesion === 5}
                onClick={() => commit({ ...s, cohesion: s.cohesion + 1 })}
              >
                +
              </button>
            </div>
          </div>
        </section>
        <div className="workspace">
          <aside className="setlist">
            <div className="section-heading">
              <h2>Setlist</h2>
              <span>{s.songs.length} faixas</span>
            </div>
            <div className="songs">
              {s.songs.map((x, i) => (
                <button
                  key={x.id}
                  className={"song " + (s.active === x.id ? "selected" : "")}
                  onClick={() => {
                    setPanel(x.id);
                  }}
                >
                  <span className="track-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <b>{x.name}</b>
                    <small>{rhythms[x.rhythm][0]}</small>
                  </div>
                  <span className="song-state">
                    {s.active === x.id
                      ? "ATIVA"
                      : s.played.includes(x.id)
                        ? "TOCADA"
                        : "PRONTA"}
                  </span>
                </button>
              ))}
            </div>
            <div className="scene-actions">
              <p>
                1 música por rodada.
                <br />
                Cada faixa, 1 vez por cena.
              </p>
              <button onClick={() => setPanel("scene")}>Encerrar cena</button>
              <button className="quiet" onClick={() => setPanel("session")}>
                Nova sessão
              </button>
            </div>
          </aside>
          <section className="musicians">
            <div className="section-heading">
              <h2>Integrantes</h2>
              <span>Solo: 1 tentativa por cena</span>
            </div>
            <div className="table-head">
              <span>Músico / Solo</span>
              <span>Ritmo</span>
              <span>Tentativa de Solo</span>
            </div>
            <div className="members" style={{ "--count": s.members.length }}>
              {s.members.map((m) => (
                <article className="member" key={m.id}>
                  <div className="member-info">
                    <h3>
                      {m.name}
                      <small>{instruments[m.instrument][0]}</small>
                    </h3>
                    <b>{instruments[m.instrument][1]}</b>
                    <p>
                      {instruments[m.instrument][3] ? (
                        instruments[m.instrument][2]
                      ) : (
                        <>
                          {" "}
                          <strong>+2 / +3</strong> ·{" "}
                          {instruments[m.instrument][2]}
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    className={"rhythm-use " + (m.rhythmUsed ? "spent" : "")}
                    disabled={!song || !!rhythm?.[3]}
                    onClick={() => member(m.id, { rhythmUsed: !m.rhythmUsed })}
                  >
                    {!song
                      ? "Sem música"
                      : rhythm[3]
                        ? "Aplicado"
                        : m.rhythmUsed
                          ? "Consumido"
                          : "Usar ritmo"}
                  </button>
                  <button
                    className={"solo-use " + (m.solo ? "spent" : "")}
                    disabled={!song || !!m.solo}
                    onClick={() => {
                      setSolo(m.id);
                      setTarget(m.name);
                      setCondition("Distraído");
                      setPanel("solo");
                    }}
                  >
                    {m.solo ? m.solo : "Fazer Solo"}
                  </button>
                  {s.hasEmbalo && song && m.rhythmUsed && !m.embaloUsed && (
                    <button
                      className="embalo"
                      onClick={() => {
                        member(m.id, {
                          rhythmUsed: !!rhythm[3],
                          embaloUsed: true,
                        });
                        setMessage(
                          "No Embalo usado. Desconte 1 Bene na ficha do personagem.",
                        );
                      }}
                    >
                      No Embalo · 1 Bene
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
        <section className="effects">
          <div className="section-heading">
            <h2>Efeitos dos Solos</h2>
            <span>{s.effects.length} em acompanhamento</span>
          </div>
          {s.effects.length ? (
            <div className="effect-list">
              {s.effects.map((e) => (
                <button
                  key={e.id}
                  onClick={() =>
                    commit({
                      ...s,
                      effects: s.effects.filter((x) => x.id !== e.id),
                    })
                  }
                  title="Toque para encerrar este efeito"
                >
                  <b>{e.target}</b>
                  <span>{e.text}</span>
                  <small>
                    {e.source} · {e.kind === "bonus" ? "Consumir" : "Encerrar"}
                  </small>
                </button>
              ))}
            </div>
          ) : (
            <p className="empty">
              Os efeitos aparecem aqui ao registrar um Solo bem-sucedido.
            </p>
          )}
        </section>
        <footer>
          <p>
            <b>Vale o maior bônus.</b> Ritmo e Solos não se somam. Bônus
            pendentes expiram no fim da cena.
          </p>
          <button
            className="quiet"
            disabled={!undo}
            onClick={() => {
              if (undo) {
                const prev = undo;
                commit(prev);
                setUndo(null);
              }
            }}
          >
            Desfazer
          </button>
          <button className="quiet" onClick={exportFile}>
            Exportar
          </button>
        </footer>
      </main>
      {message && (
        <div className="notice" role="status">
          {message}
          <button aria-label="Fechar aviso" onClick={() => setMessage("")}>
            Fechar
          </button>
        </div>
      )}
      {panel && (
        <div
          className="overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPanel(null);
          }}
        >
          <section
            className={"drawer " + (panel === "setup" ? "wide" : "")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <button
              className="close"
              autoFocus
              onClick={() => {
                setPanel(null);
                setMessage("");
              }}
              aria-label="Fechar painel"
            >
              Fechar
            </button>
            {panel === "setup" ? (
              <>
                <h2 id="dialog-title">Preparar a banda</h2>
                <p>
                  Configure entre cenas. Salvar inicia uma nova cena,
                  preservando Coesão e o uso de Hino da sessão.
                </p>
                <label>
                  Nome da banda
                  <input
                    maxLength={80}
                    value={draft.band}
                    onChange={(e) =>
                      setDraft({ ...draft, band: e.target.value })
                    }
                  />
                </label>
                <h3>
                  Integrantes <small>até 6 no placar</small>
                </h3>
                {draft.members.map((m, i) => (
                  <div className="edit-row" key={m.id}>
                    <input
                      aria-label={`Nome do integrante ${i + 1}`}
                      maxLength={40}
                      value={m.name}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          members: draft.members.map((x) =>
                            x.id === m.id ? { ...x, name: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    <select
                      aria-label={`Instrumento de ${m.name}`}
                      value={m.instrument}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          members: draft.members.map((x) =>
                            x.id === m.id
                              ? { ...x, instrument: +e.target.value }
                              : x,
                          ),
                        })
                      }
                    >
                      {instruments.map((x, j) => (
                        <option value={j} key={j}>
                          {x[0]}
                        </option>
                      ))}
                    </select>
                    <button
                      disabled={draft.members.length === 1}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          members: draft.members.filter((x) => x.id !== m.id),
                        })
                      }
                    >
                      Remover
                    </button>
                  </div>
                ))}
                <button
                  disabled={draft.members.length === 6}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      members: [
                        ...draft.members,
                        {
                          id: crypto.randomUUID(),
                          name: "Novo integrante",
                          instrument: 0,
                          solo: null,
                          rhythmUsed: false,
                          embaloUsed: false,
                        },
                      ],
                    })
                  }
                >
                  Adicionar integrante
                </button>
                <h3>
                  Setlist <small>limite conforme o patamar</small>
                </h3>
                {draft.songs.map((x, i) => (
                  <div className="edit-row songs-edit" key={x.id}>
                    <input
                      aria-label={`Nome da composição ${i + 1}`}
                      maxLength={80}
                      value={x.name}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          songs: draft.songs.map((y) =>
                            y.id === x.id ? { ...y, name: e.target.value } : y,
                          ),
                        })
                      }
                    />
                    <select
                      aria-label={`Ritmo de ${x.name}`}
                      value={x.rhythm}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          songs: draft.songs.map((y) =>
                            y.id === x.id
                              ? { ...y, rhythm: +e.target.value }
                              : y,
                          ),
                        })
                      }
                    >
                      {rhythms.map((r, j) => (
                        <option value={j} key={j}>
                          {r[0]}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label={`Grau de ${x.name}`}
                      value={x.grade}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          songs: draft.songs.map((y) =>
                            y.id === x.id
                              ? { ...y, grade: +e.target.value }
                              : y,
                          ),
                        })
                      }
                    >
                      {["Demo", "Estúdio", "Single", "Hino"].map((g, j) => (
                        <option value={j + 1} key={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <button
                      disabled={draft.songs.length === 1}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          songs: draft.songs.filter((y) => y.id !== x.id),
                        })
                      }
                    >
                      Remover
                    </button>
                  </div>
                ))}
                <button
                  disabled={draft.songs.length === 8}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      songs: [
                        ...draft.songs,
                        {
                          id: crypto.randomUUID(),
                          name: "Nova composição",
                          rhythm: 0,
                          grade: 1,
                        },
                      ],
                    })
                  }
                >
                  Adicionar composição
                </button>
                <div className="checks">
                  <label>
                    <input
                      type="checkbox"
                      checked={draft.hasBis}
                      onChange={(e) =>
                        setDraft({ ...draft, hasBis: e.target.checked })
                      }
                    />{" "}
                    Banda possui Bis!
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={draft.hasEmbalo}
                      onChange={(e) =>
                        setDraft({ ...draft, hasEmbalo: e.target.checked })
                      }
                    />{" "}
                    Mostrar No Embalo (usar só para quem possui)
                  </label>
                </div>
                <div className="actions">
                  <button
                    className="primary"
                    onClick={() => {
                      if (
                        !draft.band.trim() ||
                        draft.members.some((m) => !m.name.trim()) ||
                        draft.songs.some((x) => !x.name.trim())
                      ) {
                        setMessage(
                          "Preencha os nomes da banda, dos integrantes e das composições.",
                        );
                        return;
                      }
                      commit({ ...nextScene(draft), configured: true });
                      setPanel(null);
                    }}
                  >
                    Salvar e preparar cena
                  </button>
                  <button onClick={() => file.current.click()}>
                    Importar placar
                  </button>
                </div>
              </>
            ) : panel === "solo" ? (
              <>
                <h2 id="dialog-title">
                  {
                    instruments[
                      s.members.find((m) => m.id === solo).instrument
                    ][1]
                  }
                </h2>
                <p>
                  Uma ação e Atuação contra 4; Guitarra solo usa Atuação
                  resistida por Espírito. A falha também gasta a tentativa.
                </p>
                <label>
                  Alvo do efeito
                  <input
                    value={target}
                    maxLength={80}
                    onChange={(e) => setTarget(e.target.value)}
                    list="targets"
                  />
                </label>
                {instruments[
                  s.members.find((m) => m.id === solo).instrument
                ][3] && (
                  <label>
                    Condição
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                    >
                      <option>Distraído</option>
                      <option>Vulnerável</option>
                    </select>
                  </label>
                )}
                <datalist id="targets">
                  {s.members.map((m) => (
                    <option key={m.id} value={m.name} />
                  ))}
                </datalist>
                <p>
                  {
                    instruments[
                      s.members.find((m) => m.id === solo).instrument
                    ][2]
                  }
                </p>
                <div className="actions">
                  <button onClick={() => result("Falha")}>Falha</button>
                  <button className="primary" onClick={() => result("Sucesso")}>
                    Sucesso
                  </button>
                  <button
                    className="primary"
                    onClick={() => result("Ampliação")}
                  >
                    Ampliação
                  </button>
                </div>
              </>
            ) : panel === "scene" || panel === "session" ? (
              <>
                <h2 id="dialog-title">
                  {panel === "scene"
                    ? "Encerrar esta cena?"
                    : "Começar uma nova sessão?"}
                </h2>
                <p>
                  Música e efeitos encerram. Tentativas de Solo, ritmos e Bis
                  ficam disponíveis novamente.{" "}
                  {panel === "session"
                    ? "A ativação gratuita de Hino também será recuperada."
                    : "O uso de Hino da sessão permanece marcado."}{" "}
                  Coesão permanece igual.
                </p>
                <button
                  className="primary"
                  onClick={() => {
                    commit(
                      panel === "scene"
                        ? nextScene(s)
                        : { ...nextScene(s), hymnUsed: false },
                    );
                    setPanel(null);
                  }}
                >
                  {panel === "scene"
                    ? "Começar próxima cena"
                    : "Começar sessão"}
                </button>
              </>
            ) : (
              (() => {
                const x = s.songs.find((x) => x.id === panel);
                if (!x) return null;
                const repeat = s.played.includes(x.id);
                return (
                  <>
                    <h2 id="dialog-title">{x.name}</h2>
                    <p>
                      {rhythms[x.rhythm][1]} · {rhythms[x.rhythm][2]}
                    </p>
                    <p>
                      Ação livre em seu turno, com concordância da banda. A
                      troca encerra benefícios de ritmo não usados e mantém os
                      efeitos dos Solos.
                    </p>
                    <div className="actions">
                      <button
                        className="primary"
                        disabled={
                          s.cohesion < 1 ||
                          (repeat && (!s.hasBis || s.bisUsed))
                        }
                        onClick={() =>
                          run(() => {
                            const n = activate(s, x.id, { bis: repeat });
                            setPanel(null);
                            return n;
                          })
                        }
                      >
                        {repeat ? "Bis! · 1 Coesão" : "Ativar · 1 Coesão"}
                      </button>
                      {x.grade === 4 && (
                        <button
                          disabled={
                            s.hymnUsed || repeat
                          }
                          onClick={() =>
                            run(() => {
                              const n = activate(s, x.id, { free: true });
                              setPanel(null);
                              return n;
                            })
                          }
                        >
                          Hino · ativação gratuita
                        </button>
                      )}
                    </div>
                    <p className="hint">
                      {repeat
                          ? s.bisUsed
                            ? "Bis! já usado nesta cena."
                            : s.hasBis
                              ? "Repetição consome o único Bis! da banda nesta cena."
                              : "Faixa já tocada. A repetição exige a Vantagem Bis!"
                          : "Uma ativação desta composição por cena."}
                    </p>
                  </>
                );
              })()
            )}
          </section>
        </div>
      )}
      <input
        type="file"
        accept="application/json,.json"
        hidden
        ref={file}
        onChange={importFile}
      />
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
