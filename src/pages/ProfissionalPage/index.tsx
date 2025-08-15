import { useParams } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../../AppContext";
import { Disciplina, Profissional } from "../../Interfaces";
import { Header, Menu, ShowDisciplinas, ConfirmPrompt, EditProfissional } from "../../components";
import styles from "./styles.module.css";
import { getInfo } from "../../App";

export default function ProfissionalPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { Profissionais, Disciplinas, currentUser, setProfissionais, setDisciplinas, setVideos, setTopicos } = useContext(AppContext);
    const [profissional, setProfissional] = useState<Profissional>();
    const [confirmText, setConfirmText] = useState("");
    const [confirmClosed, setConfirmClosed] = useState(true);
    const [confirmAction, setConfirmAction] = useState(() => () => { });
    const [versoesSelecionadas, setVersoesSelecionadas] = useState<string[]>([]);
    const [cargosSelecionados, setCargosSelecionados] = useState<string[]>([]);
    const [arquivadosShown, setArquivadosShown] = useState(false);
    const [busca, setBusca] = useState("");
    const [disciplinasFiltradas, setDisciplinasFiltradas] = useState<Disciplina[]>([]);
    const [showEditPanel, setShowEditPanel] = useState(false);

    useEffect(() => {
        if (profissional) {
            const disciplinas = getDisciplinasAtuadas().filter(d => {
                const versaoOk = versoesSelecionadas.length === 0 || versoesSelecionadas.includes(d.versao);
                const cargosOk =
                    cargosSelecionados.length === 0 ||
                    d.orientadores.some(o => o.id === profissional.id && cargosSelecionados.includes("Orientador")) ||
                    d.topicos.some(t =>
                        (t.conteudistas.some(c => c.id === profissional.id) && cargosSelecionados.includes("Conteudista")) ||
                        (t.validadores.some(v => v.id === profissional.id) && cargosSelecionados.includes("Validador")) ||
                        (t.videos.some(v =>
                            (v.apresentador.some(a => a.id === profissional.id) && cargosSelecionados.includes("Apresentador")) ||
                            (v.convidado.some(c => c.id === profissional.id) && cargosSelecionados.includes("Convidado"))
                        ))
                    );

                return versaoOk && cargosOk;
            });

            setDisciplinasFiltradas(
                arquivadosShown ? disciplinas : disciplinas.filter(d => d.excluida === "")
            );
        }
    }, [Disciplinas, profissional, versoesSelecionadas, cargosSelecionados, arquivadosShown]);

    function getDisciplinasAtuadas() {
        const disciplinasAtuadas: Disciplina[] = [];
        Disciplinas.forEach(disciplina => {
            disciplina.orientadores.forEach(orientador => {
                if (orientador.id == profissional?.id) {
                    if (!disciplinasAtuadas.includes(disciplina))
                        disciplinasAtuadas.push(disciplina);
                }
            });
            disciplina.topicos.forEach(topico => {
                topico.conteudistas.forEach(conteudante => {
                    if (conteudante.id == profissional?.id) {
                        if (!disciplinasAtuadas.includes(disciplina))
                            disciplinasAtuadas.push(disciplina);
                    }
                });
                topico.validadores.forEach(validador => {
                    if (validador.id == profissional?.id) {
                        if (!disciplinasAtuadas.includes(disciplina))
                            disciplinasAtuadas.push(disciplina);
                    }
                });
                topico.videos.forEach(video => {
                    video.apresentador.forEach(apresentador => {
                        if (apresentador.id == profissional?.id) {
                            if (!disciplinasAtuadas.includes(disciplina))
                                disciplinasAtuadas.push(disciplina);
                        }
                    });
                    video.convidado.forEach(convidado => {
                        if (convidado.id == profissional?.id) {
                            if (!disciplinasAtuadas.includes(disciplina))
                                disciplinasAtuadas.push(disciplina);
                        }
                    });
                });
            });
        });
        return disciplinasAtuadas;
    }
    function getCargosDoProfissional(): string[] {
        const cargos = new Set<string>();

        Disciplinas.forEach(disciplina => {
            disciplina.orientadores.forEach(o => {
                if (o.id === profissional?.id) cargos.add("Orientador");
            });

            disciplina.topicos.forEach(topico => {
                topico.conteudistas.forEach(c => {
                    if (c.id === profissional?.id) cargos.add("Conteudista");
                });
                topico.validadores.forEach(v => {
                    if (v.id === profissional?.id) cargos.add("Validador");
                });
                topico.videos.forEach(video => {
                    video.apresentador.forEach(a => {
                        if (a.id === profissional?.id) cargos.add("Apresentador");
                    });
                    video.convidado.forEach(c => {
                        if (c.id === profissional?.id) cargos.add("Convidado");
                    });
                });
            });
        });

        return Array.from(cargos);
    }

    useEffect(() => {
        // Se não houver ID, redireciona imediatamente
        if (!id) {
            navigate("/", { replace: true });
            return;
        }

        // Aguarda as disciplinas carregarem
        if (Profissionais.length > 0) {
            const encontrada = Profissionais.find(x => x.id == parseInt(id));
            if (!encontrada) {
                navigate("/", { replace: true });
            } else {
                setProfissional(encontrada);
            }
        }
    }, [id, Profissionais, navigate]);

    return (
        <div>
            {confirmClosed ? null : <ConfirmPrompt text={confirmText} confirmAction={confirmAction} setClosed={setConfirmClosed} />}
            {showEditPanel && profissional && <EditProfissional profissional={profissional} closeAction={() => { setShowEditPanel(false); getInfo(setProfissionais, setDisciplinas, setVideos, setTopicos) }} />}
            <Menu></Menu>
            <Header back="/profissionais"></Header>
            {profissional ?
                <div>
                    <div className={styles.containerTitle} style={{ position: "relative" }}>
                        <div>
                            <h1>{profissional.nome}</h1>
                            {(currentUser?.admin || currentUser?.id == profissional.id) && <button style={{ position: "absolute", right: 10, top: 10 }} className={styles.btn} onClick={() => { setShowEditPanel(true) }}>{currentUser?.id != profissional.id ? "Editar profissional" : "Editar perfil"}</button>}
                            {currentUser?.id == profissional.id && <button style={{ position: "absolute", right: 10, top: 50 }} className={styles.btn} onClick={() => { navigate("/editarsenha") }}>Alterar senha</button>}
                            <p><strong>Email: </strong>{profissional.email}</p>
                            {profissional.telefone ? <p><strong>Telefone: </strong>{profissional.telefone} </p> : null}
                            <p><strong>Vínculo: </strong>{profissional.internoExterno}</p>
                            <p><strong>Treinamentos realizados: </strong>{profissional.treinamentos != "" ? profissional.treinamentos : "Nenhum"}</p>
                            <p><strong>Tem acesso ao sistema: </strong>
                                {profissional.temAcesso ? (
                                    <>
                                        Sim{" "}
                                        <span>
                                            <br />
                                            <strong>Tem permissão de edição:</strong> {profissional.admin ? "Sim" : (
                                                <>
                                                    Não{" "}
                                                    {currentUser?.admin && (
                                                        <button className={styles.btn} onClick={() => {
                                                            setConfirmText(`Deseja dar permissão de edição ao usuário ${profissional.nome}? (Essa ação não pode ser desfeita)`);
                                                            setConfirmClosed(false);
                                                            setConfirmAction(() => () => {
                                                                const body = {
                                                                    acao: "tornarAdmin",
                                                                    email: profissional.email,
                                                                };

                                                                fetch("https://script.google.com/macros/s/AKfycbyqzSfSRHYC6NgH9d_FkQCF_2_Br6nSjNwZ_0J4hUm1io4lTj-7a0t0YmlJ43KtgzbS/exec", {
                                                                    method: "POST",
                                                                    headers: {
                                                                        "Content-Type": "text/plain;charset=utf-8"
                                                                    },
                                                                    body: JSON.stringify(body),
                                                                })
                                                                    .then(res => res.text())
                                                                    .then(() => setProfissionais(Profissionais.map(x => x.email === profissional.email ? { ...x, admin: true } : x)))
                                                                    .catch(console.error);
                                                            });
                                                        }}>
                                                            Dar permissão
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Não{" "}
                                        {currentUser?.admin && (
                                            <button className={styles.btn} onClick={() => {
                                                setConfirmText(`Deseja dar acesso ao sistema para ${profissional.nome}? (Essa ação não pode ser desfeita)`);
                                                setConfirmClosed(false);
                                                setConfirmAction(() => () => {
                                                    const body = {
                                                        acao: "permitirAcesso",
                                                        email: profissional.email,
                                                    };

                                                    fetch("https://script.google.com/macros/s/AKfycbyqzSfSRHYC6NgH9d_FkQCF_2_Br6nSjNwZ_0J4hUm1io4lTj-7a0t0YmlJ43KtgzbS/exec", {
                                                        method: "POST",
                                                        headers: {
                                                            "Content-Type": "text/plain;charset=utf-8"
                                                        },
                                                        body: JSON.stringify(body),
                                                    })
                                                        .then(res => res.text())
                                                        .then(() => setProfissionais(Profissionais.map(x => x.email === profissional.email ? { ...x, temAcesso: true } : x)))
                                                        .catch(console.error);
                                                });
                                            }}>
                                                Dar Acesso
                                            </button>
                                        )}
                                    </>
                                )}
                            </p>
                        </div>
                        <img src={profissional.foto != "" ? profissional.foto : "/icons/avatar.svg"} alt="" />
                    </div>
                    <div className={styles.container}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>Disciplinas em que atua:</h2>
                            <div style={{ display: "flex", flexDirection: 'row-reverse' }}>
                                <div className={styles.filtros} style={{ padding: 20, justifyContent: 'center' }}>
                                    <button className={styles.btn} style={{ marginTop: "5px" }} onClick={() => setArquivadosShown(!arquivadosShown)}>{arquivadosShown ? "Ocultar Arquivados" : "Mostrar Arquivados"}</button>
                                </div>
                                <div className={styles.filtros}>
                                    <p style={{ margin: 5 }}>Filtros:</p>
                                    <input type="text" placeholder="Buscar" id="busca" value={busca} onChange={(e) => setBusca(e.target.value)} className={styles.busca} />
                                    <div style={{ display: "flex" }}>
                                        <div style={{ backgroundColor: "var(--Cinza)", border: "2px solid white", borderRadius: 10, margin: 5 }}>
                                            <p style={{ margin: 5 }}>Versões:</p>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => setVersoesSelecionadas([])}
                                                    style={{ margin: 10 }}
                                                    className={styles.btn}
                                                    disabled={versoesSelecionadas.length === 0}
                                                >
                                                    Todos
                                                </button>
                                                {Array.from(new Set(Disciplinas.filter(d => d.versao != "").map(d => d.versao))).map(versao => {
                                                    const ativo = versoesSelecionadas.includes(versao);
                                                    return (
                                                        <button
                                                            key={versao}
                                                            onClick={() => {
                                                                setVersoesSelecionadas(prev =>
                                                                    ativo ? prev.filter(v => v !== versao) : [...prev, versao]
                                                                );
                                                            }}
                                                            style={{
                                                                position: "relative",
                                                                margin: 10,
                                                                backgroundColor: ativo ? 'var(--Cinza-Claro)' : undefined,
                                                                color: ativo ? "black" : undefined,
                                                                overflow: "visible",
                                                            }}
                                                            className={styles.btn}
                                                        >
                                                            {versao}
                                                            {ativo && (
                                                                <span
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setVersoesSelecionadas(prev => prev.filter(v => v !== versao));
                                                                    }}
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: -6,
                                                                        right: -6,
                                                                        width: 16,
                                                                        height: 16,
                                                                        borderRadius: "50%",
                                                                        backgroundColor: "red",
                                                                        color: "white",
                                                                        fontSize: 12,
                                                                        fontWeight: "bold",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        cursor: "pointer",
                                                                        boxShadow: "0 0 2px rgba(0,0,0,0.3)",
                                                                        zIndex: 1,
                                                                    }}
                                                                >
                                                                    ×
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {getCargosDoProfissional().length > 0 && <div style={{ backgroundColor: "var(--Cinza)", border: "2px solid white", borderRadius: 10, margin: 5 }}>
                                            <p style={{ margin: 5 }}>Cargos:</p>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => setCargosSelecionados([])}
                                                    style={{ margin: 10 }}
                                                    className={styles.btn}
                                                    disabled={cargosSelecionados.length === 0}
                                                >
                                                    Todos
                                                </button>
                                                {getCargosDoProfissional().map(cargo => {
                                                    const ativo = cargosSelecionados.includes(cargo);
                                                    return (
                                                        <button
                                                            key={cargo}
                                                            onClick={() => {
                                                                setCargosSelecionados(prev =>
                                                                    ativo ? prev.filter(c => c !== cargo) : [...prev, cargo]
                                                                );
                                                            }}
                                                            style={{
                                                                position: "relative",
                                                                margin: 10,
                                                                backgroundColor: ativo ? 'var(--Cinza-Claro)' : undefined,
                                                                color: ativo ? "black" : undefined,
                                                                overflow: "visible",
                                                            }}
                                                            className={styles.btn}
                                                        >
                                                            {cargo}
                                                            {ativo && (
                                                                <span
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setCargosSelecionados(prev => prev.filter(c => c !== cargo));
                                                                    }}
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: -6,
                                                                        right: -6,
                                                                        width: 16,
                                                                        height: 16,
                                                                        borderRadius: "50%",
                                                                        backgroundColor: "red",
                                                                        color: "white",
                                                                        fontSize: 12,
                                                                        fontWeight: "bold",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        cursor: "pointer",
                                                                        boxShadow: "0 0 2px rgba(0,0,0,0.3)",
                                                                        zIndex: 1,
                                                                    }}
                                                                >
                                                                    ×
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.disciplinas}>
                            {disciplinasFiltradas.length > 0 ? <ShowDisciplinas profissional={profissional} disciplinas={disciplinasFiltradas}></ShowDisciplinas>
                                : <h3>Nenhuma disciplina encontrada para esse profissional no filtro selecionado</h3>}
                        </div>
                    </div>
                </div>
                : <h2>Carregando...</h2>
            }
        </div >
    );
}