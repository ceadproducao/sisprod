import { useEffect, useState, useContext } from "react";
import styles from "./styles.module.css"
import { Disciplina, Profissional, Topico, Video } from "../../Interfaces";
import AppContext from "../../AppContext";
import { getInfo } from "../../App";
import { ConfirmPrompt, FormAddProfissional, SelectDisciplina } from "../";

/**
 * Componente responsável por exibir e gerenciar o painel de edição de uma disciplina.
 * @param {string} tipo - Tipo de painel de edição aberto ("disciplina", "topico", "video").
 * @param {Function} setTipo - Função para alterar o tipo de painel.
 * @param {boolean} open - Indica se o painel está aberto.
 * @param {Function} setOpen - Função para alterar o estado de abertura do painel.
 * @param {Disciplina} disciplina - Objeto da disciplina que está sendo exibida/editada.
 */
export default function Panel({ tipo, setTipo, open, setOpen, disciplina }: { tipo: string, setTipo: Function, open: boolean, setOpen: Function, disciplina: Disciplina }) {

    /** Dados da disciplina temporários (Edições antes de serem salvas) */
    const [disciplinaTemp, setDisciplinaTemp] = useState<Disciplina>(disciplina);

    /** ID do tópico atualmente selecionado */
    const [idTopicoSelecionado, setIdTopicoSelecionado] = useState<string>("");

    /** Objeto do tópico atualmente selecionado */
    const [topicoSelecionado, setTopicoSelecionado] = useState<Topico>();

    /** Objeto do tópico atualmente selecionado para vídeos */
    const [topicoVidSelecionado, setTopicoVidSelecionado] = useState<Topico>();

    /** ID do tópico relacionado aos vídeos selecionados */
    const [idTopicoVidSelecionado, setIdTopicoVidSelecionado] = useState<string>("");

    /** Vídeo atualmente selecionado */
    const [videoSelecionado, setVideoSelecionado] = useState<Video>();

    /** Mapeia IDs de tópicos com seus respectivos números (usado em reordenação) */
    let obj = {};
    for (let i = 0; i < disciplinaTemp.topicos.length; i++) {
        obj = { ...obj, [disciplinaTemp.topicos[i].id]: disciplinaTemp.topicos[i].numero }
    }

    /** Novo estado com os números atualizados de cada tópico */
    const [novoNumTopicos, setNovoNumTopicos] = useState<Record<string, number>>(obj);

    /** Acesso ao contexto global da aplicação */
    const { Profissionais, Disciplinas, setProfissionais, setDisciplinas, setTopicos, setVideos } = useContext(AppContext);

    /** Estado para indicar se o processo de alteração na tabela foi iniciada */
    const [startedChange, setStartedChange] = useState(false);

    /** Estado para indicar se a animação de "Concluído!" foi iniciada */
    const [startedAnim, setStartedAnim] = useState(false);

    /** Estado que indica se o processo de alteração na tabela foi concluído */
    const [finishedChange, setFinishedChange] = useState(false);

    /** Texto digitado no campo de filtro (busca por profissionais) */
    const [filtro, setFiltro] = useState("");

    /** Lista de profissionais filtrados com base no texto do filtro */
    const [profissionaisFiltrados, setProfissionaisFiltrados] = useState(Profissionais);

    /** Lista final dos profissionais selecionados para edição */
    const [profs, setProfs] = useState<Profissional[]>([]);

    /** Controla a exibição do painel de profissionais */
    const [openProfsPainel, setOpenProfsPainel] = useState(false);

    /** Estado que define qual categoria de profissionais está sendo alterada ("orientador", "validador", "conteudista", "convidado", "apresentador") */
    const [mudar, setMudar] = useState("");

    /** Controla a exibição do formulário para adicionar profissional */
    const [addProf, setAddProf] = useState(false);

    /** Indica se há tópicos ou vídeos arquivados na disciplina */
    const [temArquivados, setTemArquivados] = useState(false);

    /** Controla se os conteúdos arquivados devem ser exibidos */
    const [arquivadosShown, setArquivadosShown] = useState(false);

    /** Texto exibido na caixa de confirmação */
    const [textConfirm, setTextConfirm] = useState("");

    /** Indica se a caixa de confirmação está fechada */
    const [closedConfirm, setClosedConfirm] = useState(true);

    /** Função que será executada após a confirmação */
    const [confirmAction, setConfirmAction] = useState<() => {}>(() => () => { });

    const [isUp, setIsUp] = useState(disciplina.up != "");
    const [opcoesCarga, setOpcoesCarga] = useState([
        { label: "Roteiro", sigla: "R" },
        { label: "Desafio", sigla: "D" },
        { label: "Na Prática", sigla: "N" },
        { label: "Lição", sigla: "L" },
        { label: "Exercícios", sigla: "E" },
        { label: "Vídeo", sigla: "V" },
    ]);

    const [novaCarga, setNovaCarga] = useState("");

    const [novaSiglaCarga, setNovaSiglaCarga] = useState("");

    const [opcoesRecursos, setOpcoesRecursos] = useState([
        { label: "Genially", sigla: "Genially" },
        { label: "Infográfico", sigla: "Infográfico" },
        { label: "Mapa Mental", sigla: "Mapa Mental" },
    ]);

    const [opcoesRecursosVideo, setOpcoesRecursosVideo] = useState([
        { label: "Video Interativo", sigla: "Video Interativo" },
        { label: "Tablet", sigla: "Tablet" },
        { label: "Lightboard", sigla: "Lightboard" },
    ]);

    const [novoRecurso, setNovoRecurso] = useState("");
    const [novoRecursoVideo, setNovoRecursoVideo] = useState("");

    /**
     * Atualiza a disciplina temporária sempre que as disciplinas no contexto forem alteradas.
     */
    useEffect(() => {
        setDisciplinaTemp(Disciplinas.find((disci) => disciplina.id == disci.id) ?? disciplina);
    }, [Disciplinas]);

    /**
     * Ao montar o componente:
     * - Seleciona o primeiro tópico e vídeo disponíveis
     * - Define os tópicos/vídeos arquivados como não exibidos (caso existam)
     */
    useEffect(() => {
        if (disciplinaTemp.topicos.length > 0) {
            setIdTopicoSelecionado(disciplinaTemp.topicos[0].id);
            setTopicoSelecionado(disciplinaTemp.topicos[0]);
            setTopicoVidSelecionado(disciplinaTemp.topicos[0]);
            setIdTopicoVidSelecionado(disciplinaTemp.topicos[0].id);

            // Seleciona o primeiro vídeo do tópico (se disponível)
            if (topicoVidSelecionado) {
                setVideoSelecionado(topicoVidSelecionado.videos[0]);
            }
        }

        // Exibe todos os tópicos se nenhum estiver arquivado
        if (!disciplinaTemp.topicos.some((topico) => topico.excluido != "")) {
            setArquivadosShown(true);
        }
    }, []);

    /**
     * Atualiza o estado `temArquivados` com base nos tópicos e vídeos da disciplina.
     * Considera arquivados os que possuem `excluido` preenchido.
     */
    useEffect(() => {
        setTemArquivados(
            disciplinaTemp.topicos.some((topico) => topico.excluido !== "") ||
            disciplinaTemp.topicos.some((topico) =>
                topico.videos.some((video) => video.excluido !== "")
            )
        );
    }, [disciplinaTemp]);

    /**
     * Adiciona um profissional à lista de selecionados para edição.
     * Usado para marcar profissionais que serão atribuídos como orientadores, conteudistas, validadores, etc.
     *
     * @param {Profissional} prof - Profissional a ser adicionado.
     */
    function selectProf({ prof }: { prof: Profissional }) {
        setProfs((prev) => ([...prev, prof]));
    }

    /**
     * Remove um profissional da lista de selecionados.
     * Usado para desmarcar profissionais atribuídos anteriormente.
     *
     * @param {Profissional} prof - Profissional a ser removido.
     */
    function unselectProf({ prof }: { prof: Profissional }) {
        setProfs((prev) => prev.filter((x) => x.id != prof.id));
    }

    function changeProfissionais(all?: boolean) {
        // Atualiza todos os tópicos (validador / conteudista)
        if (all && (mudar === "validador" || mudar === "conteudista")) {
            const novosTopicos = disciplinaTemp.topicos.map((topico) => {
                if (mudar === "validador") {
                    return { ...topico, validadores: profs };
                } else {
                    return { ...topico, conteudistas: profs };
                }
            });

            setDisciplinaTemp({ ...disciplinaTemp, topicos: novosTopicos });
        }

        // Atualiza vídeos com o mesmo tipo do vídeoSelecionado (apresentador / convidado)
        if (all && (mudar === "apresentador" || mudar === "convidado") && videoSelecionado) {
            const tipoVideoSelecionado = videoSelecionado.tipo;

            const novosTopicos = disciplinaTemp.topicos.map((topico) => {
                const novosVideos = topico.videos.map((video) => {
                    if (video.tipo === tipoVideoSelecionado) {
                        if (mudar === "apresentador") {
                            return { ...video, apresentador: profs };
                        } else {
                            return { ...video, convidado: profs };
                        }
                    }
                    return video;
                });
                return { ...topico, videos: novosVideos };
            });

            setDisciplinaTemp({ ...disciplinaTemp, topicos: novosTopicos });
        }

        // Atualiza tópico selecionado (validador / conteudista)
        if (topicoSelecionado && (mudar === "validador" || mudar === "conteudista")) {
            if (mudar === "validador") {
                setTopicoSelecionado({ ...topicoSelecionado, validadores: profs });
            } else {
                setTopicoSelecionado({ ...topicoSelecionado, conteudistas: profs });
            }
        }

        // Atualiza vídeo selecionado (apresentador / convidado)
        if (videoSelecionado && (mudar === "apresentador" || mudar === "convidado")) {
            if (mudar === "apresentador") {
                setVideoSelecionado({ ...videoSelecionado, apresentador: profs });
            } else {
                setVideoSelecionado({ ...videoSelecionado, convidado: profs });
            }
        }

        // Atualiza orientadores da disciplina
        if (mudar === "orientador") {
            setDisciplinaTemp({ ...disciplinaTemp, orientadores: profs });
        }
    }

    useEffect(() => { console.log(disciplinaTemp) }, [disciplinaTemp])

    /**
     * Atualiza a lista de profissionais selecionados conforme o tipo atual de modificação (mudar).
     * Executado sempre que `mudar` for alterado.
     */
    useEffect(() => {
        if (mudar == "orientador") {
            setProfs(disciplinaTemp.orientadores);
        }
        if (topicoSelecionado) {
            if (mudar == "validador") {
                setProfs(topicoSelecionado.validadores);
            }
            else if (mudar == "conteudista") {
                setProfs(topicoSelecionado.conteudistas);
            }
        }
        if (videoSelecionado) {
            if (mudar == "apresentador") {
                setProfs(videoSelecionado.apresentador);
            }
            else if (mudar == "convidado") {
                setProfs(videoSelecionado.convidado);
            }
        }
    }, [mudar])

    /**
     * Atualiza o tópico selecionado ao mudar o ID (`idTopicoSelecionado`).
     * Garante que `topicoSelecionado` esteja sincronizado com o ID atual.
     */
    useEffect(() => {
        const topico = disciplinaTemp.topicos.find(x => x.id === idTopicoSelecionado);

        if (!topico && disciplinaTemp.topicos.length > 0) {
            setIdTopicoSelecionado(disciplinaTemp.topicos[0].id);
        } else if (topico) {
            setTopicoSelecionado(topico);
        }
    }, [idTopicoSelecionado]);

    /**
     * Atualiza o tópico de vídeo e o vídeo selecionado ao mudar `idTopicoVidSelecionado`.
     * Utilizado na aba de edição de vídeos.
     */
    useEffect(() => {
        const topico = disciplinaTemp.topicos.find(x => x.id === idTopicoVidSelecionado);
        if (!topico && disciplinaTemp.topicos.length > 0) {
            setIdTopicoVidSelecionado(disciplinaTemp.topicos[0].id);
        } else if (topico) {
            setTopicoVidSelecionado(topico);
            setVideoSelecionado(topico.videos[0]);
        }
    }, [idTopicoVidSelecionado]);

    /**
     * Atualiza a lista de tópicos da disciplina com o `topicoSelecionado` alterado.
     */
    useEffect(() => {
        setDisciplinaTemp({ ...disciplinaTemp, topicos: disciplinaTemp.topicos.map((x) => x.id == topicoSelecionado?.id ? topicoSelecionado : x) });
    }, [topicoSelecionado])

    /**
    * Atualiza a lista de tópicos da disciplina com o `topicoVidSelecionado` alterado.
    */
    useEffect(() => {
        setDisciplinaTemp({ ...disciplinaTemp, topicos: disciplinaTemp.topicos.map((x) => x.id == topicoVidSelecionado?.id ? topicoVidSelecionado : x) })
    }, [topicoVidSelecionado])


    /**
     * Atualiza o vídeo dentro do tópico com a nova versão de `videoSelecionado`.
     */
    useEffect(() => {
        if (topicoVidSelecionado) {
            setTopicoVidSelecionado({ ...topicoVidSelecionado, videos: ((topicoVidSelecionado?.videos.map((x) => x.id == videoSelecionado?.id ? videoSelecionado : x)) ?? []) })
        }
    }, [videoSelecionado])

    /**
     * Atualiza a lista de profissionais filtrados com base no texto de filtro digitado.
     */
    useEffect(() => {
        setProfissionaisFiltrados(filtro == "" ? Profissionais : Profissionais.filter((x) => x.nome.toLowerCase().includes(filtro.toLowerCase())));
    }, [filtro, Profissionais])

    /**
     * Garante que os elementos arquivados não fiquem selecionados quando ocultos.
     * Redireciona para itens válidos sempre que `arquivadosShown` muda ou os itens arquivados estão selecionados.
     */
    useEffect(() => {
        if (!arquivadosShown && topicoSelecionado?.excluido != "") {
            const topNaoExcluido = disciplinaTemp.topicos.find((topico) => topico.excluido == "");
            setIdTopicoSelecionado(topNaoExcluido?.id ?? "");
        }
        if (!arquivadosShown && topicoVidSelecionado?.excluido != "") {
            const topNaoExcluido = disciplinaTemp.topicos.find((topico) => topico.excluido == "");
            setIdTopicoVidSelecionado(topNaoExcluido?.id ?? "");
        }
        if (!arquivadosShown && videoSelecionado?.excluido != "") {
            const vidNaoExcluido = topicoVidSelecionado?.videos.find((video) => video.excluido == "");
            if (vidNaoExcluido?.id != videoSelecionado?.id) {
                setVideoSelecionado(vidNaoExcluido);
            } else {
                setVideoSelecionado(undefined);
            }
        }
        if (arquivadosShown && !videoSelecionado) {
            setVideoSelecionado(topicoVidSelecionado?.videos[0])
        }
    }, [arquivadosShown, topicoSelecionado, videoSelecionado])

    /**
     * Atualiza a disciplina com os dados modificados localmente.
     *
     * - Valida números duplicados de tópicos.
     * - Atualiza o estado local (`disciplinaTemp`) e sincroniza tópicos e vídeos.
     * - Envia os dados para o backend via `fetch` (Google Apps Script).
     * - Ao concluir, recarrega os dados globais do contexto via `getInfo`.
     */
    function UpdateDisciplina() {
        setStartedChange(true);
        const valorParaIds: Record<number, string[]> = {};

        Object.entries(novoNumTopicos).forEach(([idStr, novo]) => {
            if (disciplinaTemp.topicos.find((topico) => topico.id == idStr)?.excluido == "") {
                const id = idStr;
                if (!valorParaIds[novo]) {
                    valorParaIds[novo] = [];
                }
                valorParaIds[novo].push(id);
            }
        });

        const duplicados: string[] = Object.entries(valorParaIds)
            .filter(([_, Ids]) => Ids.length > 1)
            .flatMap(([_, Ids]) => Ids);

        if (duplicados.length > 0) {
            alert(`Há números repetidos nos tópicos: ${duplicados.join(", ")}.`);
            return;
        }

        const disciplinaAtualizada = {
            ...disciplinaTemp,
            up: isUp ? disciplinaTemp.up : "",
            disciplinaAntiga: isUp ? disciplinaTemp.disciplinaAntiga : "",
            topicos: disciplinaTemp.topicos.map((x) => ({
                ...x,
                videos: x.videos.map((y) => ({ ...y, topicoNum: novoNumTopicos[x.id] })),
                numero: novoNumTopicos[x.id],
            }))
        };

        setDisciplinaTemp(disciplinaAtualizada);
        if (topicoSelecionado) {
            setTopicoSelecionado({
                ...topicoSelecionado,
                numero: novoNumTopicos[idTopicoSelecionado],
            });
        }

        const formData = {
            acao: "updateDisciplina",
            disciplina: disciplinaAtualizada
        };

        fetch("https://script.google.com/macros/s/AKfycbyqzSfSRHYC6NgH9d_FkQCF_2_Br6nSjNwZ_0J4hUm1io4lTj-7a0t0YmlJ43KtgzbS/exec", {
            method: "POST",
            redirect: "follow",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(formData),
        })
            .then(res => res.text())
            .then(data => console.log(data))
            .then(() => {
                getInfo(setProfissionais, setDisciplinas, setVideos, setTopicos).then(() => {
                    setStartedChange(false);
                    setStartedAnim(true);
                    setTimeout(() => {
                        setFinishedChange(true);
                    }, 100);
                    setTimeout(() => {
                        setFinishedChange(false);
                        setTimeout(() => {
                            setStartedAnim(false);
                        }, 500);
                    }, 5000);
                });
            })
            .catch(err => console.error(err));
    }

    /**
 * Renderiza o painel de edição principal da disciplina, que pode alternar entre
 * as abas de "Disciplina", "Tópicos" e "Vídeos".
 *
 * O conteúdo mostrado depende do estado `tipo`, e somente é exibido se `open` for verdadeiro.
 */
    return (
        open ?
            <>
                {/* Modal de confirmação para ações perigosas, exibido quando `closedConfirm` está false */}
                {closedConfirm ? null : (
                    <ConfirmPrompt
                        text={textConfirm}
                        confirmAction={confirmAction}
                        setClosed={setClosedConfirm}
                    />
                )}

                {/* Fundo escuro na pagina, para exibição do painel, com layout centralizado */}
                <div className={styles.bg}>
                    <div className={styles.innerPanel}>
                        <div className={styles.panel}>

                            {/* Botão de fechar o painel */}
                            <button
                                className={styles.closeBtn}
                                onClick={() => setOpen(false)}
                            >
                                X
                            </button>

                            {/* Abas de navegação para trocar entre os modos de edição */}
                            <div className={styles.abas}>
                                <div
                                    onClick={() => { setTipo("disciplina"); }}
                                    className={tipo === "disciplina" ? styles.active : ""}
                                >
                                    Disciplina
                                </div>
                                <div
                                    onClick={() => { setTipo("topico"); }}
                                    className={tipo === "topico" ? styles.active : ""}
                                >
                                    Tópicos
                                </div>
                                <div
                                    onClick={() => { setTipo("video"); }}
                                    className={tipo === "video" ? styles.active : ""}
                                >
                                    Vídeos
                                </div>
                            </div>

                            {/* Se estiver no meio de uma edição e salvamento da disciplina, mostra indicador */}
                            {startedChange ? (
                                <div className={styles.panelChange}>
                                    <div className={styles.changeDisciplina}>
                                        <h3>Editando disciplina...</h3>
                                    </div>
                                </div>
                            ) :
                                <>
                                    {/* Se a aba ativa for "disciplina", exibe o formulário de edição da disciplina */}
                                    {tipo == "disciplina" ? (
                                        <div className={styles.content}>
                                            {/* Animação de feedback visual ao salvar disciplina */}
                                            {startedAnim ? (
                                                <div className={styles.changed + " " + (finishedChange ? styles.changedShown : "")}>
                                                    <h3>Disciplina editada com sucesso!</h3>
                                                </div>
                                            ) : null}

                                            <h3>Editar Disciplina</h3>

                                            {/* Formulário principal para edição dos campos da disciplina */}
                                            <form action="">
                                                <div className={styles.formDivNome}>
                                                    {/* Campo: Nome da disciplina */}
                                                    <div className={styles.formDivNomeDisci}>
                                                        <label htmlFor="nomeDisciplina">Nome: </label>
                                                        <input
                                                            type="text"
                                                            id="nomeDisciplina"
                                                            value={disciplinaTemp.nome}
                                                            onChange={(e) =>
                                                                setDisciplinaTemp({ ...disciplinaTemp, nome: e.target.value })
                                                            }
                                                        />
                                                    </div>

                                                    {/* Checkbox: Flag "Up" da disciplina */}
                                                    <div>
                                                        <label htmlFor="up">Up: </label>
                                                        <input type="checkbox" checked={isUp} onChange={(e) => { setIsUp(e.target.checked); setDisciplinaTemp({ ...disciplinaTemp, up: "Total" }) }} />
                                                    </div>
                                                </div>
                                                {isUp && <div className={styles.formDiv}>
                                                    <label htmlFor="tipoUp">Tipo da Up: </label>
                                                    <select
                                                        id="tipoUp"
                                                        value={disciplinaTemp.up}
                                                        onChange={(e) =>
                                                            setDisciplinaTemp({ ...disciplinaTemp, up: e.target.value })
                                                        }
                                                    >
                                                        <option value="Total">Total</option>
                                                        <option value="Parcial">Parcial</option>
                                                    </select>
                                                </div>}
                                                {isUp && <div style={{ backgroundColor: "var(--Cinza)", display: 'flex', alignItems: 'center', padding: 10, borderRadius: 10 }}>
                                                    <p><strong>Disciplina Anterior:</strong></p>
                                                    <SelectDisciplina disciplinaAtual={disciplina} disciplinaSelecionada={Disciplinas.find(d => d.id.toString() == disciplinaTemp.disciplinaAntiga)} setDisciplinaSelecionada={(valor: Disciplina) => { setDisciplinaTemp({ ...disciplinaTemp, disciplinaAntiga: (valor?.id ?? "").toString() }) }} />
                                                </div>}


                                                {/* Campo: Versão da disciplina */}
                                                <div className={styles.formDiv}>
                                                    <label htmlFor="versao">Versão: </label>
                                                    <input
                                                        type="text"
                                                        id="versao"
                                                        value={disciplinaTemp.versao}
                                                        onChange={(e) =>
                                                            setDisciplinaTemp({ ...disciplinaTemp, versao: e.target.value })
                                                        }
                                                    />
                                                </div>

                                                {/* Select: Área da disciplina */}
                                                <div className={styles.formDiv}>
                                                    <label htmlFor="area">Área: </label>
                                                    <select
                                                        id="area"
                                                        value={disciplinaTemp.area}
                                                        onChange={(e) =>
                                                            setDisciplinaTemp({ ...disciplinaTemp, area: e.target.value })
                                                        }
                                                    >
                                                        <option value="Tecnologia">Tecnologia</option>
                                                        <option value="Saúde">Saúde</option>
                                                        <option value="Humanas">Humanas</option>
                                                    </select>
                                                </div>

                                                {/* Campo: Ano da disciplina */}
                                                <div className={styles.formDiv}>
                                                    <label htmlFor="ano">Ano: </label>
                                                    <input
                                                        type="text"
                                                        id="ano"
                                                        value={disciplinaTemp.ano}
                                                        onChange={(e) =>
                                                            setDisciplinaTemp({ ...disciplinaTemp, ano: e.target.value })
                                                        }
                                                    />
                                                </div>

                                                {/* Select: Prioridade da disciplina */}
                                                <div className={styles.formDiv}>
                                                    <label htmlFor="prioridade">Prioridade: </label>
                                                    <select
                                                        id="prioridade"
                                                        value={disciplinaTemp.prioridade}
                                                        onChange={(e) =>
                                                            setDisciplinaTemp({ ...disciplinaTemp, prioridade: e.target.value as "Baixa" | "Normal" | "Alta" })
                                                        }
                                                    >
                                                        <option value="Baixa">Baixa</option>
                                                        <option value="Normal">Normal</option>
                                                        <option value="Alta">Alta</option>
                                                    </select>
                                                </div>

                                                {/* Select: Status da Matriz */}
                                                <div className={styles.formDiv}>
                                                    <label htmlFor="statusMatriz">Status da Matriz: </label>
                                                    <select
                                                        id="statusMatriz"
                                                        value={disciplinaTemp.statusMatriz}
                                                        onChange={(e) =>
                                                            setDisciplinaTemp({ ...disciplinaTemp, statusMatriz: e.target.value })
                                                        }
                                                    >
                                                        <option value="Nada">Nada</option>
                                                        <option value="Solicitada">Solicitada</option>
                                                        <option value="Recebida">Recebida</option>
                                                        <option value="Revisão Interna">Revisão Interna</option>
                                                        <option value="Revisão Externa">Revisão Externa</option>
                                                        <option value="Revisão Coord. Ped.">Revisão Coord. Ped.</option>
                                                        <option value="Concluída">Concluída</option>
                                                    </select>
                                                </div>

                                                {/* Campo: Link da Matriz */}
                                                <div className={styles.formDiv}>
                                                    <label htmlFor="linkMatriz">Link da Matriz: </label>
                                                    <input
                                                        type="text"
                                                        id="linkMatriz"
                                                        value={disciplinaTemp.linkMatriz}
                                                        onChange={(e) =>
                                                            setDisciplinaTemp({ ...disciplinaTemp, linkMatriz: e.target.value })
                                                        }
                                                    />
                                                </div>

                                                {/* Select: Desenho da disciplina */}
                                                <div className={styles.formDiv}>
                                                    <label htmlFor="desenho">Desenho: </label>
                                                    <select
                                                        id="desenho"
                                                        value={disciplinaTemp.desenho}
                                                        onChange={(e) =>
                                                            setDisciplinaTemp({ ...disciplinaTemp, desenho: e.target.value })
                                                        }
                                                    >
                                                        <option value="Padrão">Padrão</option>
                                                        <option value="Video Embutido">Video Embutido</option>
                                                        <option value="Misto">Misto</option>
                                                        <option value="Especial">Especial</option>
                                                    </select>
                                                </div>

                                                {/* Campo: Ementa da disciplina */}
                                                <div className={styles.formDiv}>
                                                    <label htmlFor="ementa">Ementa: </label>
                                                    <textarea
                                                        id="ementa"
                                                        rows={3}
                                                        cols={59}
                                                        value={disciplinaTemp.ementa}
                                                        onChange={(e) =>
                                                            setDisciplinaTemp({ ...disciplinaTemp, ementa: e.target.value })
                                                        }
                                                    ></textarea>
                                                </div>

                                                {/* Campo: ISBN da disciplina */}
                                                <div className={styles.formDiv}>
                                                    <label htmlFor="isbn">ISBN: </label>
                                                    <input
                                                        type="text"
                                                        id="isbn"
                                                        value={disciplinaTemp.isbn}
                                                        onChange={(e) =>
                                                            setDisciplinaTemp({ ...disciplinaTemp, isbn: e.target.value })
                                                        }
                                                    />
                                                </div>

                                                {/* Select: Padrão de importação */}
                                                <div className={styles.formDiv}>
                                                    <label htmlFor="padrao">Padrão de Importação: </label>
                                                    <select
                                                        id="padrao"
                                                        value={disciplinaTemp.padrao}
                                                        onChange={(e) =>
                                                            setDisciplinaTemp({ ...disciplinaTemp, padrao: e.target.value })
                                                        }
                                                    >
                                                        <option value=""></option>
                                                    </select>
                                                </div>

                                                {/* Campo: Detalhamento de importação */}
                                                <div className={styles.formDiv}>
                                                    <label htmlFor="detalhamento">Detalhamento de Importação: </label>
                                                    <textarea
                                                        id="detalhamento"
                                                        rows={3}
                                                        cols={59}
                                                        value={disciplinaTemp.detalhamento}
                                                        onChange={(e) =>
                                                            setDisciplinaTemp({ ...disciplinaTemp, detalhamento: e.target.value })
                                                        }
                                                    ></textarea>
                                                </div>

                                                {/* Campo: Ambiente (100% ou 20%) */}
                                                <div className={styles.formDiv}>
                                                    <label htmlFor="ambiente">Ambiente: </label>
                                                    <select
                                                        name="ambiente"
                                                        id="ambiente"
                                                        value={disciplinaTemp.ambiente}
                                                        onChange={(e) =>
                                                            setDisciplinaTemp({
                                                                ...disciplinaTemp,
                                                                ambiente: e.target.value as "100%" | "20%",
                                                            })
                                                        }
                                                    >
                                                        <option value="100%">100%</option>
                                                        <option value="20%">20%</option>
                                                    </select>
                                                </div>

                                                {/* Campo condicional: Código AVA 20% */}
                                                {disciplinaTemp.ambiente == "20%" ? (
                                                    <div className={styles.formDiv}>
                                                        <label htmlFor="codAVA20">Código AVA: </label>
                                                        <input
                                                            type="text"
                                                            id="codAVA20"
                                                            value={disciplinaTemp.codAVA20}
                                                            onChange={(e) =>
                                                                setDisciplinaTemp({ ...disciplinaTemp, codAVA20: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                ) : null}

                                                {/* Campo condicional: Código AVA 100% */}
                                                {disciplinaTemp.ambiente == "100%" ? (
                                                    <div className={styles.formDiv}>
                                                        <label htmlFor="codAVA100">Código AVA: </label>
                                                        <input
                                                            type="text"
                                                            id="codAVA100"
                                                            value={disciplinaTemp.codAVA100}
                                                            onChange={(e) =>
                                                                setDisciplinaTemp({ ...disciplinaTemp, codAVA100: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                ) : null}

                                                {/* Checkbox: Flag "Liberado para Criação" da disciplina */}
                                                <div className={styles.formDiv}>
                                                    <label htmlFor="liberadoCriacao">Liberado para Criação da disciplina no AVA: </label>
                                                    <input
                                                        type="checkbox"
                                                        id="liberadoCriacao"
                                                        checked={disciplinaTemp.liberadoCriacao}
                                                        onChange={(e) =>
                                                            setDisciplinaTemp({ ...disciplinaTemp, liberadoCriacao: e.target.checked })
                                                        }
                                                    />
                                                </div>

                                                {/* Lista de orientadores e botão para edição */}
                                                <div className={styles.formDiv}>
                                                    <p>
                                                        <strong>Orientadores: </strong>
                                                        {disciplinaTemp.orientadores.map((x, index) =>
                                                            x.nome +
                                                            (disciplinaTemp.orientadores.length > 1 &&
                                                                index != disciplinaTemp.orientadores.length - 1
                                                                ? ", "
                                                                : "")
                                                        )}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        className={styles.btn}
                                                        disabled={openProfsPainel}
                                                        onClick={() => {
                                                            setOpenProfsPainel(true);
                                                            setMudar("orientador");
                                                        }}
                                                    >
                                                        Alterar Orientadores
                                                    </button>
                                                </div>

                                                {/* Botão para salvar as alterações */}
                                                <div className={styles.submitContainer}>
                                                    <input
                                                        type="submit"
                                                        value="Salvar"
                                                        className={styles.submitBtn}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            UpdateDisciplina();
                                                        }}
                                                    />
                                                </div>
                                            </form>
                                        </div>
                                    ) : null}
                                    {/* Aba de edição de Tópicos - exibida se houver tópicos disponíveis e um estiver selecionado */}
                                    {tipo == "topico" ? (
                                        disciplinaTemp.topicos.length > 0 && topicoSelecionado && idTopicoSelecionado ? (
                                            <div className={styles.content}>

                                                {/* Animação de feedback após edição */}
                                                {startedAnim ? (
                                                    <div className={styles.changed + " " + (finishedChange ? styles.changedShown : "")}>
                                                        <h3>Disciplina editada com sucesso!</h3>
                                                    </div>
                                                ) : null}

                                                <h3>Editar Tópicos</h3>

                                                {/* Botão para mostrar ou ocultar tópicos arquivados */}
                                                {temArquivados ? (
                                                    <button
                                                        className={arquivadosShown ? styles.btn : styles.btnDel}
                                                        style={{ position: 'absolute', right: 10 }}
                                                        onClick={() => setArquivadosShown(!arquivadosShown)}
                                                    >
                                                        Arquivados: {arquivadosShown ? "On" : "Off"}
                                                    </button>
                                                ) : null}

                                                {/* Seleção de tópico por ID */}
                                                <select
                                                    name="topico"
                                                    id="topico"
                                                    className={styles.topicoSelect}
                                                    value={idTopicoSelecionado}
                                                    onChange={(e) => setIdTopicoSelecionado(e.target.value)}
                                                >
                                                    {(arquivadosShown ? disciplinaTemp.topicos : disciplinaTemp.topicos.filter((topico) => topico.excluido == "")).map((topico, index) => (
                                                        <option key={index} value={topico.id}>
                                                            Tópico {topico.numero} {topico.excluido ? " - (ARQUIVADO)" : null}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div style={{ backgroundColor: "var(--Cinza)", border: "2px solid black", padding: 5, borderRadius: 10 }}>
                                                    <label htmlFor="soVideo">Tópico tem somente vídeos (Sem Lição)</label>
                                                    <input type="checkbox" name="soVideo" id="soVideo" checked={(topicoSelecionado.tipo == "Video")} onChange={(e) => setTopicoSelecionado({ ...topicoSelecionado, tipo: e.target.checked ? "Video" : "Completo" })} />
                                                </div>

                                                {/* Botões: adicionar novo tópico e arquivar/desarquivar atual */}
                                                <div>
                                                    <button
                                                        className={styles.btn}
                                                        onClick={() => {
                                                            // Define novo número e ID únicos para o novo tópico
                                                            let maiorNumero = 0;
                                                            let ultimoId = 0;
                                                            disciplinaTemp.topicos.filter((topico) => topico.excluido == "").forEach(topico => {
                                                                if (topico.numero > maiorNumero) maiorNumero = topico.numero;

                                                            });
                                                            disciplinaTemp.topicos.forEach(topico => {
                                                                if (parseInt(topico.id.split("-")[1]) > ultimoId) ultimoId = parseInt(topico.id.split("-")[1]);
                                                            });
                                                            setDisciplinaTemp({
                                                                ...disciplinaTemp, topicos: [...disciplinaTemp.topicos, {
                                                                    id: disciplina.id + "-" + (ultimoId + 1),
                                                                    idDisciplina: disciplina.id,
                                                                    numero: maiorNumero + 1,
                                                                    conteudistas: [],
                                                                    validadores: [],
                                                                    status: "Nada",
                                                                    carga: "",
                                                                    orcamento: "",
                                                                    versao: "",
                                                                    recursosEspeciaisLicao: "",
                                                                    licaoAutorizada: "",
                                                                    catProblemaLicao: "",
                                                                    descProblemaLicao: "",
                                                                    dataPrevistaInicio: "",
                                                                    dataEfetivaInicio: "",
                                                                    dataPrevistaNaMao: "",
                                                                    dataEfetivaNaMao: "",
                                                                    dataPrevistaVT: "",
                                                                    dataEfetivaVT: "",
                                                                    dataPrevistaGramatica: "",
                                                                    dataEfetivaGramatica: "",
                                                                    videos: [],
                                                                    excluido: "",
                                                                    tipo: "Completo"
                                                                }]
                                                            })
                                                            setIdTopicoSelecionado(disciplina.id + "-" + (ultimoId + 1));
                                                            setNovoNumTopicos({
                                                                ...novoNumTopicos,
                                                                [disciplina.id + "-" + (ultimoId + 1)]: maiorNumero + 1
                                                            });
                                                        }}
                                                    >
                                                        Adicionar mais um Tópico
                                                    </button>

                                                    {/* Botão para arquivar ou desarquivar o tópico atual */}
                                                    <button
                                                        className={styles.btnDel}
                                                        onClick={() => {
                                                            setTopicoSelecionado({
                                                                ...topicoSelecionado,
                                                                excluido: topicoSelecionado.excluido == "" ? "Excluído" : "",
                                                            });
                                                        }}
                                                    >
                                                        {topicoSelecionado.excluido == "" ? "Arquivar" : "Desarquivar"} este tópico
                                                    </button>
                                                </div>

                                                {/* Formulário de edição do tópico */}
                                                <form action="">
                                                    {topicoSelecionado.tipo == "Completo" &&
                                                        /* Número do tópico (editável) */
                                                        <div>
                                                            <div className={styles.formDiv}>
                                                                <label htmlFor="num">Número do Tópico: </label>
                                                                <input
                                                                    type="number"
                                                                    id="num"
                                                                    value={novoNumTopicos[idTopicoSelecionado]}
                                                                    onChange={(e) => {
                                                                        const novoValor = parseInt(e.target.value);
                                                                        if (novoValor >= 1) {
                                                                            setNovoNumTopicos({
                                                                                ...novoNumTopicos,
                                                                                [idTopicoSelecionado]: novoValor,
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                            {/* Conteudistas atribuídos */}
                                                            <div className={styles.formDiv}>
                                                                <p>
                                                                    <strong>Conteudistas: </strong>
                                                                    {topicoSelecionado.conteudistas.map((x, index) =>
                                                                        x.nome +
                                                                        (topicoSelecionado.conteudistas.length > 1 &&
                                                                            index != topicoSelecionado.conteudistas.length - 1
                                                                            ? ", "
                                                                            : "")
                                                                    )}
                                                                </p>
                                                                <button
                                                                    type="button"
                                                                    className={styles.btn}
                                                                    disabled={openProfsPainel}
                                                                    onClick={() => {
                                                                        setOpenProfsPainel(true);
                                                                        setMudar("conteudista");
                                                                    }}
                                                                >
                                                                    Alterar Conteudistas
                                                                </button>
                                                            </div>

                                                            {/* Validadores atribuídos */}
                                                            <div className={styles.formDiv}>
                                                                <p>
                                                                    <strong>Validadores: </strong>
                                                                    {topicoSelecionado.validadores.map((x, index) =>
                                                                        x.nome +
                                                                        (topicoSelecionado.validadores.length > 1 &&
                                                                            index != topicoSelecionado.validadores.length - 1
                                                                            ? ", "
                                                                            : "")
                                                                    )}
                                                                </p>
                                                                <button
                                                                    type="button"
                                                                    className={styles.btn}
                                                                    disabled={openProfsPainel}
                                                                    onClick={() => {
                                                                        setOpenProfsPainel(true);
                                                                        setMudar("validador");
                                                                    }}
                                                                >
                                                                    Alterar Validadores
                                                                </button>
                                                            </div>

                                                            {/* Status do tópico (select) */}
                                                            <div className={styles.formDiv}>
                                                                <label htmlFor="status">Status: </label>
                                                                <select
                                                                    name="status"
                                                                    id="status"
                                                                    className={styles.statusSelect}
                                                                    value={topicoSelecionado.status}
                                                                    onChange={(e) =>
                                                                        setTopicoSelecionado({
                                                                            ...topicoSelecionado,
                                                                            status: e.target.value as Topico["status"],
                                                                        })
                                                                    }
                                                                >
                                                                    {/* Opções do fluxo de produção */}
                                                                    <option value="Nada">0 - Nada</option>
                                                                    <option value="Problema">0.1 - Problema</option>
                                                                    <option value="Alerta Etapa Produção">0.2 - Alerta Etapa Produção</option>
                                                                    <option value="Alerta Etapa Validação">0.3 - Alerta Etapa Validação</option>
                                                                    <option value="Iniciado Contato">1 - Iniciado Contato</option>
                                                                    <option value="Na mão">2 - Na mão</option>
                                                                    <option value="Retorno OC">2.5 - Retorno OC</option>
                                                                    <option value="Plágio">3 - Plágio</option>
                                                                    <option value="Retorno Plágio">3.5 - Retorno Plágio</option>
                                                                    <option value="Revisão">4 - Revisão</option>
                                                                    <option value="Retorno Revisão">4.5 - Retorno Revisão</option>
                                                                    <option value="Gramática">5 - Gramática</option>
                                                                    <option value="Retorno Gramática">5.5 - Retorno Gramática</option>
                                                                    <option value="Pronto para DTI">6 - Pronto para DTI</option>
                                                                    <option value="Pendente Interação">6.5 - Pendente Interação</option>
                                                                    <option value="HTML Pronto">7 - HTML Pronto</option>
                                                                    <option value="Revisão Final">8 - Revisão Final</option>
                                                                    <option value="Pronto">9 - Pronto</option>
                                                                </select>
                                                            </div>

                                                            {/* Categoria do problema (select) */}
                                                            {topicoSelecionado.status == "Problema" &&
                                                                <>
                                                                    <div className={styles.formDiv}>
                                                                        <label htmlFor="status">Categoria do Problema: </label>
                                                                        <select
                                                                            name="problema"
                                                                            id="problema"
                                                                            className={styles.StatusSelect}
                                                                            value={topicoSelecionado.catProblemaLicao}
                                                                            onChange={(e) =>
                                                                                setTopicoSelecionado({
                                                                                    ...topicoSelecionado,
                                                                                    catProblemaLicao: e.target.value,
                                                                                })
                                                                            }
                                                                        >
                                                                            {/* Opções de problemas */}
                                                                            <option value="">Selecione uma categoria</option>
                                                                            <option value="Captação">Captação</option>
                                                                            <option value="Contratos">Contratos</option>
                                                                            <option value="Produção">Produção</option>
                                                                            <option value="Validação">Validação</option>
                                                                            <option value="Resolvido">Resolvido</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className={styles.formDiv}>
                                                                        <label htmlFor="descProblemaLicao">Descrição do problema:</label>
                                                                        <textarea
                                                                            id="descProblemaLicao"
                                                                            rows={3}
                                                                            cols={59}
                                                                            value={topicoSelecionado.descProblemaLicao}
                                                                            onChange={(e) =>
                                                                                setTopicoSelecionado({ ...topicoSelecionado, descProblemaLicao: e.target.value })
                                                                            }
                                                                        ></textarea>
                                                                    </div>
                                                                </>}

                                                            {/* Campo: orçamento do tópico */}
                                                            <div className={styles.formDiv}>
                                                                <label htmlFor="orcamento">Orçamento: </label>
                                                                <input
                                                                    type="text"
                                                                    name="orcamento"
                                                                    id="orcamento"
                                                                    value={topicoSelecionado.orcamento}
                                                                    onChange={(e) =>
                                                                        setTopicoSelecionado({
                                                                            ...topicoSelecionado,
                                                                            orcamento: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                            </div>

                                                            {/* Campo: versão do tópico */}
                                                            <div className={styles.formDiv}>
                                                                <label htmlFor="versao">Versão: </label>
                                                                <input
                                                                    type="text"
                                                                    id="versao"
                                                                    value={topicoSelecionado.versao}
                                                                    onChange={(e) =>
                                                                        setTopicoSelecionado({
                                                                            ...topicoSelecionado,
                                                                            versao: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                            {/* Checkbox: Flag "Liberado para Criação" da disciplina */}
                                                            <div className={styles.formDiv}>
                                                                <label htmlFor="licaoAutorizada">Lição Autorizada: </label>
                                                                <input
                                                                    type="checkbox"
                                                                    id="licaoAutorizada"
                                                                    checked={topicoSelecionado.licaoAutorizada == "Sim" ? true : false}
                                                                    onChange={(e) =>
                                                                        setTopicoSelecionado({ ...topicoSelecionado, licaoAutorizada: e.target.checked ? "Sim" : "Não" })
                                                                    }
                                                                />
                                                            </div>

                                                            {/* Campo: Carga do tópico (checkboxes com siglas) */}
                                                            <div className={styles.formDiv}>
                                                                <p style={{ marginRight: "10px" }}><strong>Carga: </strong></p>
                                                                <div className={styles.divCarga}>
                                                                    {opcoesCarga.map(({ label, sigla }) => (
                                                                        <div key={sigla}>
                                                                            <label>{label}:</label>
                                                                            <input
                                                                                type="checkbox"
                                                                                className={styles.check}
                                                                                checked={topicoSelecionado.carga.split(", ").includes(sigla)}
                                                                                onChange={(e) =>
                                                                                    setTopicoSelecionado({
                                                                                        ...topicoSelecionado,
                                                                                        carga: e.target.checked
                                                                                            ? [...new Set([...topicoSelecionado.carga.split(", ").filter(Boolean), sigla])].join(", ")
                                                                                            : topicoSelecionado.carga
                                                                                                .split(", ")
                                                                                                .filter((c) => c !== sigla)
                                                                                                .join(", "),
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {/* Adicionar nova carga */}
                                                                    <div style={{ marginTop: "10px" }}>
                                                                        <input
                                                                            placeholder="Nova Carga"
                                                                            value={novaCarga}
                                                                            onChange={(e) => setNovaCarga(e.target.value)}
                                                                            style={{ marginRight: "5px" }}
                                                                        />
                                                                        <input
                                                                            placeholder="Sigla"
                                                                            value={novaSiglaCarga}
                                                                            onChange={(e) => setNovaSiglaCarga(e.target.value)}
                                                                            style={{ width: "50px", marginRight: "5px" }}
                                                                        />
                                                                        <button type="button" className={styles.btn}
                                                                            onClick={() => {
                                                                                if (novaCarga && novaSiglaCarga) {
                                                                                    setOpcoesCarga([...opcoesCarga, { label: novaCarga, sigla: novaSiglaCarga }]);
                                                                                    setNovaCarga("");
                                                                                    setNovaSiglaCarga("");
                                                                                }
                                                                            }}
                                                                        >+</button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Campo: Recursos especiais do tópico */}
                                                            <div className={styles.formDiv}>
                                                                <p style={{ marginRight: "10px" }}><strong>Recursos Especiais da Lição: </strong></p>
                                                                <div className={styles.divCarga}>
                                                                    {opcoesRecursos.map(({ label, sigla }) => (
                                                                        <div key={sigla}>
                                                                            <label>{label}:</label>
                                                                            <input
                                                                                type="checkbox"
                                                                                className={styles.check}
                                                                                checked={topicoSelecionado.recursosEspeciaisLicao.split(";\n").includes(sigla)}
                                                                                onChange={(e) =>
                                                                                    setTopicoSelecionado({
                                                                                        ...topicoSelecionado,
                                                                                        recursosEspeciaisLicao: e.target.checked
                                                                                            ? [...new Set([...topicoSelecionado.recursosEspeciaisLicao.split(";\n").filter(Boolean), sigla])].join(";\n")
                                                                                            : topicoSelecionado.recursosEspeciaisLicao
                                                                                                .split(";\n")
                                                                                                .filter((c) => c !== sigla)
                                                                                                .join(";\n"),
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>
                                                                    ))}

                                                                    {/* Adicionar novo recurso */}
                                                                    <div style={{ marginTop: "10px" }}>
                                                                        <input
                                                                            placeholder="Novo Recurso"
                                                                            value={novoRecurso}
                                                                            onChange={(e) => setNovoRecurso(e.target.value)}
                                                                            style={{ marginRight: "5px" }}
                                                                        />
                                                                        <button type="button" className={styles.btn}
                                                                            onClick={() => {
                                                                                if (novoRecurso) {
                                                                                    setOpcoesRecursos([...opcoesRecursos, { label: novoRecurso, sigla: novoRecurso }]);
                                                                                    setNovoRecurso("");
                                                                                }
                                                                            }}
                                                                        >+</button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Campo: Data prevista de Início */}
                                                            <div className={styles.formDiv}>
                                                                <div>
                                                                    <label htmlFor="dataPrevistaInicio">Data Prevista de Início: </label>
                                                                    <input
                                                                        type="date"
                                                                        id="dataPrevistaInicio"
                                                                        value={
                                                                            topicoSelecionado.dataPrevistaInicio instanceof Date
                                                                                ? topicoSelecionado.dataPrevistaInicio.toISOString().split("T")[0]
                                                                                : topicoSelecionado.dataPrevistaInicio || ""
                                                                        }
                                                                        onChange={(e) =>
                                                                            setTopicoSelecionado({
                                                                                ...topicoSelecionado,
                                                                                dataPrevistaInicio: e.target.value !== "" ? new Date(e.target.value) : "",
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label htmlFor="dataEfetivaInicio">Data Efetiva de Início: </label>
                                                                    <input
                                                                        type="date"
                                                                        id="dataEfetivaInicio"
                                                                        value={
                                                                            topicoSelecionado.dataEfetivaInicio instanceof Date
                                                                                ? topicoSelecionado.dataEfetivaInicio.toISOString().split("T")[0]
                                                                                : topicoSelecionado.dataEfetivaInicio || ""
                                                                        }
                                                                        onChange={(e) =>
                                                                            setTopicoSelecionado({
                                                                                ...topicoSelecionado,
                                                                                dataEfetivaInicio: e.target.value !== "" ? new Date(e.target.value) : "",
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Campo: Data prevista e efetiva para Na Mão */}
                                                            <div className={styles.formDiv}>
                                                                <div>
                                                                    <label htmlFor="dataPrevistaNaMao">Data Prevista para Na Mão: </label>
                                                                    <input
                                                                        type="date"
                                                                        id="dataPrevistaNaMao"
                                                                        value={
                                                                            topicoSelecionado.dataPrevistaNaMao instanceof Date
                                                                                ? topicoSelecionado.dataPrevistaNaMao.toISOString().split("T")[0]
                                                                                : topicoSelecionado.dataPrevistaNaMao || ""
                                                                        }
                                                                        onChange={(e) =>
                                                                            setTopicoSelecionado({
                                                                                ...topicoSelecionado,
                                                                                dataPrevistaNaMao: e.target.value !== "" ? new Date(e.target.value) : "",
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label htmlFor="dataEfetivaNaMao">Data Efetiva para Na Mão: </label>
                                                                    <input
                                                                        type="date"
                                                                        id="dataEfetivaNaMao"
                                                                        value={
                                                                            topicoSelecionado.dataEfetivaNaMao instanceof Date
                                                                                ? topicoSelecionado.dataEfetivaNaMao.toISOString().split("T")[0]
                                                                                : topicoSelecionado.dataEfetivaNaMao || ""
                                                                        }
                                                                        onChange={(e) =>
                                                                            setTopicoSelecionado({
                                                                                ...topicoSelecionado,
                                                                                dataEfetivaNaMao: e.target.value !== "" ? new Date(e.target.value) : "",
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Campo: Data prevista e efetiva para VT */}
                                                            <div className={styles.formDiv}>
                                                                <div>
                                                                    <label htmlFor="dataPrevistaVT">Data Prevista para VT: </label>
                                                                    <input
                                                                        type="date"
                                                                        id="dataPrevistaVT"
                                                                        value={
                                                                            topicoSelecionado.dataPrevistaVT instanceof Date
                                                                                ? topicoSelecionado.dataPrevistaVT.toISOString().split("T")[0]
                                                                                : topicoSelecionado.dataPrevistaVT || ""
                                                                        }
                                                                        onChange={(e) =>
                                                                            setTopicoSelecionado({
                                                                                ...topicoSelecionado,
                                                                                dataPrevistaVT: e.target.value !== "" ? new Date(e.target.value) : "",
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label htmlFor="dataEfetivaVT">Data Efetiva para VT: </label>
                                                                    <input
                                                                        type="date"
                                                                        id="dataEfetivaVT"
                                                                        value={
                                                                            topicoSelecionado.dataEfetivaVT instanceof Date
                                                                                ? topicoSelecionado.dataEfetivaVT.toISOString().split("T")[0]
                                                                                : topicoSelecionado.dataEfetivaVT || ""
                                                                        }
                                                                        onChange={(e) =>
                                                                            setTopicoSelecionado({
                                                                                ...topicoSelecionado,
                                                                                dataEfetivaVT: e.target.value !== "" ? new Date(e.target.value) : "",
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Campo: Data prevista e efetiva para Gramática */}
                                                            <div className={styles.formDiv}>
                                                                <div>
                                                                    <label htmlFor="dataPrevistaGramatica">Data Prevista para Gramática: </label>
                                                                    <input
                                                                        type="date"
                                                                        id="dataPrevistaGramatica"
                                                                        value={
                                                                            topicoSelecionado.dataPrevistaGramatica instanceof Date
                                                                                ? topicoSelecionado.dataPrevistaGramatica.toISOString().split("T")[0]
                                                                                : topicoSelecionado.dataPrevistaGramatica || ""
                                                                        }
                                                                        onChange={(e) =>
                                                                            setTopicoSelecionado({
                                                                                ...topicoSelecionado,
                                                                                dataPrevistaGramatica: e.target.value !== "" ? new Date(e.target.value) : "",
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label htmlFor="dataEfetivaGramatica">Data Efetiva para Gramática: </label>
                                                                    <input
                                                                        type="date"
                                                                        id="dataEfetivaGramatica"
                                                                        value={
                                                                            topicoSelecionado.dataEfetivaGramatica instanceof Date
                                                                                ? topicoSelecionado.dataEfetivaGramatica.toISOString().split("T")[0]
                                                                                : topicoSelecionado.dataEfetivaGramatica || ""
                                                                        }
                                                                        onChange={(e) =>
                                                                            setTopicoSelecionado({
                                                                                ...topicoSelecionado,
                                                                                dataEfetivaGramatica: e.target.value !== "" ? new Date(e.target.value) : "",
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>}

                                                    {/* Botão de envio para salvar alterações do tópico */}
                                                    <div className={styles.submitContainer}>
                                                        <input
                                                            type="submit"
                                                            value="Salvar"
                                                            className={styles.submitBtn}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                UpdateDisciplina();
                                                            }}
                                                        />
                                                    </div>
                                                </form>
                                            </div>) : <div className={styles.noTops}>
                                            <button className={styles.btn} onClick={() => {
                                                let maiorNumero = 0;
                                                let ultimoId = 0;
                                                disciplinaTemp.topicos.filter((topico) => topico.excluido == "").forEach(topico => {
                                                    if (topico.numero > maiorNumero) maiorNumero = topico.numero;

                                                });
                                                disciplinaTemp.topicos.forEach(topico => {
                                                    if (parseInt(topico.id.split("-")[1]) > ultimoId) ultimoId = parseInt(topico.id.split("-")[1]);
                                                });
                                                setDisciplinaTemp({
                                                    ...disciplinaTemp, topicos: [...disciplinaTemp.topicos, {
                                                        id: disciplina.id + "-" + (ultimoId + 1),
                                                        idDisciplina: disciplina.id,
                                                        numero: maiorNumero + 1,
                                                        conteudistas: [],
                                                        validadores: [],
                                                        status: "Nada",
                                                        carga: "",
                                                        orcamento: "",
                                                        versao: "",
                                                        recursosEspeciaisLicao: "",
                                                        licaoAutorizada: "",
                                                        catProblemaLicao: "",
                                                        descProblemaLicao: "",
                                                        dataPrevistaInicio: "",
                                                        dataEfetivaInicio: "",
                                                        dataPrevistaNaMao: "",
                                                        dataEfetivaNaMao: "",
                                                        dataPrevistaVT: "",
                                                        dataEfetivaVT: "",
                                                        dataPrevistaGramatica: "",
                                                        dataEfetivaGramatica: "",
                                                        videos: [],
                                                        excluido: "",
                                                        tipo: "Completo"
                                                    }]
                                                })
                                                setIdTopicoSelecionado(disciplina.id + "-" + (ultimoId + 1));
                                                setNovoNumTopicos({
                                                    ...novoNumTopicos,
                                                    [disciplina.id + "-" + (ultimoId + 1)]: maiorNumero + 1
                                                });
                                            }}>Adicionar Tópico</button>
                                        </div>) : null}
                                    {tipo == "video" && topicoVidSelecionado && idTopicoVidSelecionado ? <div className={styles.content}>
                                        {startedAnim ? <div className={styles.changed + " " + (finishedChange ? styles.changedShown : "")}><h3>Disciplina editada com sucesso!</h3></div> : null}
                                        <h3>Editar Vídeos</h3>
                                        {temArquivados ? <button className={arquivadosShown ? styles.btn : styles.btnDel} style={{ position: 'absolute', right: 10 }} onClick={() => setArquivadosShown(!arquivadosShown)}>Arquivados: {arquivadosShown ? "On" : "Off"}</button> : null}
                                        <select name="topicoVid" id="topicoVid" className={styles.topicoSelect} value={topicoVidSelecionado?.id}
                                            onChange={
                                                (e) => setIdTopicoVidSelecionado(e.target.value)
                                            } >
                                            {(arquivadosShown ? disciplinaTemp.topicos : disciplinaTemp.topicos.filter((topico) => topico.excluido == "")).map((topico, index) =>
                                                <option key={index} value={topico.id}>
                                                    {"Tópico " + topico.numero +
                                                        (topico.videos.length > 0
                                                            ? (topico.excluido !== "" ? " - (ARQUIVADO)" : "") +
                                                            (arquivadosShown
                                                                ? topico.videos
                                                                : topico.videos.filter(video => video.excluido == "")
                                                            )
                                                                .map((x, i) => (i === 0 ? " - " + x.tipo : ", " + x.tipo) + (x.excluido !== "" ? " - (ARQUIVADO)" : ""))
                                                                .join("") // <== aqui junta sem vírgulas extras
                                                            : ""
                                                        )
                                                    }
                                                </option>
                                            )}
                                        </select>
                                        {videoSelecionado ?
                                            <select name="video" id="video" className={styles.topicoSelect} value={videoSelecionado.id} onChange={(e) => setVideoSelecionado(topicoVidSelecionado.videos.find(x => x.id == e.target.value) ?? topicoVidSelecionado.videos[0])} >
                                                {topicoVidSelecionado ? (arquivadosShown ? topicoVidSelecionado.videos : topicoVidSelecionado.videos.filter((video) => video.excluido == "")).map((video, index) =>
                                                    <option key={index} value={video.id}>Video {index + 1} - {video.tipo} {video.excluido != "" ? " - (ARQUIVADO)" : null}</option>
                                                ) : null}
                                            </select> : null}
                                        <button className={styles.btn} onClick={() => {
                                            if (topicoVidSelecionado) {
                                                let ultimoIdVideo: number = topicoVidSelecionado.videos.length > 0 ? parseInt(topicoVidSelecionado.videos[topicoVidSelecionado.videos.length - 1].id.split("-")[2]) : 0;
                                                let novoVideo: Video = {
                                                    id: topicoVidSelecionado.id + "-" + (ultimoIdVideo + 1),
                                                    idDisciplina: disciplinaTemp.id,
                                                    topicoNum: topicoVidSelecionado.numero,
                                                    backup: false,
                                                    tipo: "Videoaula",
                                                    recursosEspeciaisVideo: "",
                                                    gravacaoInternaExterna: "Interna",
                                                    status: "Não Gravado",
                                                    codigoVimeo: "",
                                                    apresentador: [],
                                                    convidado: [],
                                                    dataLiberacao: "",
                                                    dataEmail: "",
                                                    dataAgendamento: "",
                                                    orcamento: "",
                                                    versao: "",
                                                    videoAutorizado: false,
                                                    catProblema: "",
                                                    descProblema: "",
                                                    excluido: ""
                                                }
                                                let novosVideos = [...topicoVidSelecionado.videos, novoVideo];
                                                setTopicoVidSelecionado({
                                                    ...topicoVidSelecionado, videos: novosVideos
                                                })
                                                setVideoSelecionado(novosVideos.find(x => x.id == novoVideo.id) ?? novosVideos[0]);
                                            }
                                        }}>Adicionar mais um Vídeo</button>
                                        {videoSelecionado ?
                                            <button
                                                className={styles.btnDel}
                                                onClick={() => {
                                                    videoSelecionado ?
                                                        setVideoSelecionado({ ...videoSelecionado, excluido: videoSelecionado.excluido == "" ? "Excluído" : "" }) : null;
                                                }}
                                            >
                                                {videoSelecionado?.excluido == "" ? "Arquivar" : "Desarquivar"} este vídeo
                                            </button> : null}
                                        {videoSelecionado ?
                                            <>
                                                <form action="" style={{ marginTop: 10 }}>
                                                    <div className={styles.formDiv}>
                                                        <label htmlFor="backup">Backup feito? </label>
                                                        <input type="checkbox" name="backup" id="backup" checked={videoSelecionado.backup} onChange={(e) => setVideoSelecionado({ ...videoSelecionado, backup: e.target.checked })} />
                                                    </div>
                                                    {topicoVidSelecionado.tipo == "Video" &&
                                                        <div className={styles.formDiv}>
                                                            <label htmlFor="numTopVid">Número do tópico:</label>
                                                            <input id="numTopVid" name="numTopVid" type="number" value={videoSelecionado.topicoNum} onChange={(e) => {
                                                                setVideoSelecionado({ ...videoSelecionado, topicoNum: parseInt(e.target.value) });
                                                                setNovoNumTopicos({ ...novoNumTopicos, [topicoVidSelecionado.id]: parseInt(e.target.value) })
                                                            }} />
                                                        </div>
                                                    }
                                                    <div className={styles.formDiv}>
                                                        <p><strong>Apresentador:</strong> {videoSelecionado?.apresentador.map((x, index) => index == 0 ? x.nome : ", " + x.nome)}</p>
                                                        <button type="button" className={styles.btn} disabled={openProfsPainel} onClick={() => {
                                                            setOpenProfsPainel(true);
                                                            setMudar("apresentador");
                                                        }}>Alterar Apresentador</button>
                                                    </div>
                                                    {videoSelecionado?.tipo == "Videocast" ?
                                                        <div className={styles.formDiv}>
                                                            <p><strong>Convidado:</strong> {videoSelecionado?.convidado.map((x, index) => index == 0 ? x.nome : ", " + x.nome)}</p>
                                                            <button type="button" className={styles.btn} disabled={openProfsPainel} onClick={() => {
                                                                setOpenProfsPainel(true);
                                                                setMudar("convidado");
                                                            }}>Alterar convidado</button>
                                                        </div> : null}
                                                    <div className={styles.formDiv}>
                                                        <label htmlFor="tipo">Tipo: </label>
                                                        <select name="tipo" id="tipo" value={videoSelecionado?.tipo ?? ""} onChange={(e) => {
                                                            setVideoSelecionado({ ...videoSelecionado, tipo: e.target.value as Video["tipo"] })
                                                        }} >
                                                            <option value="">Selecione um tipo</option>
                                                            <option value="Apresentação">Apresentação</option>
                                                            <option value="Videoaula">Videoaula</option>
                                                            <option value="Video Embutido">Video Embutido</option>
                                                            <option value="Videocast">Videocast</option>
                                                        </select>
                                                    </div>
                                                    <div className={styles.formDiv}>
                                                        <label htmlFor="statusVid">Status: </label>
                                                        <select name="statusVid" id="statusVid" className={styles.statusSelect} value={videoSelecionado?.status ?? ""} onChange={(e) => {
                                                            setVideoSelecionado({ ...videoSelecionado, status: e.target.value as Video["status"] })
                                                        }}>
                                                            <option value="Não Gravado">0 - Não Gravado</option>
                                                            <option value="Problema">0.1 - Problema</option>
                                                            <option value="Alerta Agendamento">0.2 - Alerta Agendamento</option>
                                                            <option value="Liberado OC">1 - Liberado OC</option>
                                                            <option value="Aguardando Agendamento">1.5 - Aguardando Agendamento</option>
                                                            <option value="Agendado">2 - Agendado</option>
                                                            <option value="Aguardando Gravação">2.5 - Aguardando Agendamento</option>
                                                            <option value="Gravado">3 - Gravado</option>
                                                            <option value="Editado">4 - Editado</option>
                                                            <option value="Postado">5 - Postado</option>
                                                        </select>
                                                    </div>
                                                    {/* Categoria do problema (select) */}
                                                    {videoSelecionado.status == "Problema" &&
                                                        <>
                                                            <div className={styles.formDiv}>
                                                                <label htmlFor="status">Categoria do Problema: </label>
                                                                <select
                                                                    name="problema"
                                                                    id="problema"
                                                                    className={styles.StatusSelect}
                                                                    value={videoSelecionado.catProblema}
                                                                    onChange={(e) =>
                                                                        setVideoSelecionado({
                                                                            ...videoSelecionado,
                                                                            catProblema: e.target.value,
                                                                        })
                                                                    }
                                                                >
                                                                    {/* Opções de problemas */}
                                                                    <option value="">Selecione uma categoria</option>
                                                                    <option value="Captação">Captação</option>
                                                                    <option value="Contratos">Contratos</option>
                                                                    <option value="Produção">Produção</option>
                                                                    <option value="Validação">Validação</option>
                                                                    <option value="Resolvido">Resolvido</option>
                                                                </select>
                                                            </div>
                                                            <div className={styles.formDiv}>
                                                                <label htmlFor="descProblema">Descrição do problema:</label>
                                                                <textarea
                                                                    id="descProblema"
                                                                    rows={3}
                                                                    cols={59}
                                                                    value={videoSelecionado.descProblema}
                                                                    onChange={(e) =>
                                                                        setVideoSelecionado({ ...videoSelecionado, descProblema: e.target.value })
                                                                    }
                                                                ></textarea>
                                                            </div>
                                                        </>}
                                                    {/* Campo: Recursos especiais do tópico */}
                                                    <div className={styles.formDiv}>
                                                        <p style={{ marginRight: "10px" }}><strong>Recursos Especiais do Vídeo: </strong></p>
                                                        <div className={styles.divCarga}>
                                                            {opcoesRecursosVideo.map(({ label, sigla }) => (
                                                                <div key={sigla}>
                                                                    <label>{label}:</label>
                                                                    <input
                                                                        type="checkbox"
                                                                        className={styles.check}
                                                                        checked={videoSelecionado.recursosEspeciaisVideo.split(";\n").includes(sigla)}
                                                                        onChange={(e) =>
                                                                            setVideoSelecionado({
                                                                                ...videoSelecionado,
                                                                                recursosEspeciaisVideo: e.target.checked
                                                                                    ? [...new Set([...videoSelecionado.recursosEspeciaisVideo.split(";\n").filter(Boolean), sigla])].join(";\n")
                                                                                    : videoSelecionado.recursosEspeciaisVideo
                                                                                        .split(";\n")
                                                                                        .filter((c) => c !== sigla)
                                                                                        .join(";\n"),
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                            ))}

                                                            {/* Adicionar novo recurso */}
                                                            <div style={{ marginTop: "10px" }}>
                                                                <input
                                                                    placeholder="Novo Recurso"
                                                                    value={novoRecursoVideo}
                                                                    onChange={(e) => setNovoRecursoVideo(e.target.value)}
                                                                    style={{ marginRight: "5px" }}
                                                                />
                                                                <button type="button" className={styles.btn}
                                                                    onClick={() => {
                                                                        if (novoRecursoVideo) {
                                                                            setOpcoesRecursosVideo([...opcoesRecursosVideo, { label: novoRecursoVideo, sigla: novoRecursoVideo }]);
                                                                            setNovoRecursoVideo("");
                                                                        }
                                                                    }}
                                                                >+</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={styles.formDiv}>
                                                        <label>
                                                            Local: <select name="localVideo" id="localVideo" value={videoSelecionado.gravacaoInternaExterna} onChange={(e) => setVideoSelecionado({ ...videoSelecionado, gravacaoInternaExterna: e.target.value as "Interna" | "Externa" })}>
                                                                <option value="Interna">Interna</option>
                                                                <option value="Externa">Externa</option>
                                                            </select>
                                                        </label>
                                                    </div>
                                                    <div className={styles.formDiv}>
                                                        <p><strong>Códigos Vimeo: </strong></p>
                                                        <div className={styles.divCodigosVimeo}>
                                                            {videoSelecionado.codigoVimeo.toString().split(";").map((x, i, arr) => (
                                                                <div key={i}>
                                                                    <input
                                                                        type="text"
                                                                        value={x.trim()}
                                                                        onChange={(e) => {
                                                                            const novosCodigos = [...arr];
                                                                            novosCodigos[i] = e.target.value;
                                                                            setVideoSelecionado({
                                                                                ...videoSelecionado,
                                                                                codigoVimeo: novosCodigos.map((c) => c.trim()).join("; ")
                                                                            });
                                                                        }}
                                                                    />
                                                                    <button type="button" className={styles.btn} style={{ margin: 0 }} onClick={() => {
                                                                        const novosCodigos = [...arr];
                                                                        novosCodigos.splice(i, 1);
                                                                        setVideoSelecionado({
                                                                            ...videoSelecionado,
                                                                            codigoVimeo: novosCodigos.map((c) => c.trim()).join("; ")
                                                                        });
                                                                    }}>-</button>
                                                                </div>
                                                            ))
                                                            }
                                                            <button type="button" style={{ width: "93%" }} className={styles.btn} onClick={() => setVideoSelecionado({ ...videoSelecionado, codigoVimeo: (videoSelecionado.codigoVimeo.toString() + "; ") })}>+</button>
                                                        </div>
                                                    </div>
                                                    <div className={styles.formDiv}>
                                                        <label htmlFor="videoAutorizado">Vídeo Autorizado: </label>
                                                        <input type="checkbox" id="videoAutorizado" checked={videoSelecionado.videoAutorizado} onChange={(e) => setVideoSelecionado({ ...videoSelecionado, videoAutorizado: e.target.checked })} />
                                                    </div>
                                                    <div className={styles.formDiv}>
                                                        <label htmlFor="dataLiberacao">Data Liberação: </label>
                                                        <input type="date" id="dataLiberacao" value={videoSelecionado.dataLiberacao ? videoSelecionado.dataLiberacao.toISOString().split("T")[0] : ""} onChange={(e) => setVideoSelecionado({ ...videoSelecionado, dataLiberacao: new Date(e.target.value) })} />
                                                    </div>
                                                    <div className={styles.formDiv}>
                                                        <label htmlFor="dataEmail">Data Email: </label>
                                                        <input type="date" id="dataEmail" value={videoSelecionado.dataEmail ? videoSelecionado.dataEmail.toISOString().split("T")[0] : ""} onChange={(e) => setVideoSelecionado({ ...videoSelecionado, dataEmail: new Date(e.target.value) })} />
                                                    </div>
                                                    <div className={styles.formDiv}>
                                                        <label htmlFor="dataAgendamento">Data Agendamento: </label>
                                                        <input type="date" id="dataAgendamento" value={videoSelecionado.dataAgendamento ? videoSelecionado.dataAgendamento.toISOString().split("T")[0] : ""} onChange={(e) => setVideoSelecionado({ ...videoSelecionado, dataAgendamento: new Date(e.target.value) })} />
                                                    </div>
                                                    <div className={styles.formDiv}>
                                                        <label htmlFor="orcamento">Orçamento: </label>
                                                        <input type="text" id="orcamento" value={videoSelecionado.orcamento} onChange={(e) => setVideoSelecionado({ ...videoSelecionado, orcamento: e.target.value })} />
                                                    </div>
                                                    <div className={styles.formDiv}>
                                                        <label htmlFor="versao">Versão: </label>
                                                        <input type="text" id="versao" value={videoSelecionado.versao} onChange={(e) => setVideoSelecionado({ ...videoSelecionado, orcamento: e.target.value })} />
                                                    </div>
                                                    <div className={styles.submitContainer}>
                                                        <input type="submit" value="Salvar" className={styles.submitBtn} onClick={(e) => {
                                                            e.preventDefault();
                                                            UpdateDisciplina();
                                                        }} />
                                                    </div>
                                                </form>
                                            </> : null}
                                    </div> : null}
                                </>
                            }
                        </div>
                        {openProfsPainel ? (<div className={styles.profissionaisContainer}>
                            <div className={styles.searchContainer}>
                                <input type="text" placeholder="Buscar" value={filtro} onChange={(e) => {
                                    setFiltro(e.target.value);
                                }} />
                            </div>
                            <div className={styles.profissionais}>
                                <div>
                                    {addProf ?
                                        <FormAddProfissional closeAction={(profissional: Profissional) => { setAddProf(false); profissional ? setProfissionais([...Profissionais, profissional]) : null }}></FormAddProfissional>
                                        :
                                        <button className={styles.btn} onClick={() => setAddProf(true)}>Adicionar Novo Profissional</button>}
                                </div>
                                {[...profs, ...profissionaisFiltrados.filter(x => !profs.includes(x))].map((pessoa, index) => (
                                    <button className={styles.card} style={profs.includes(pessoa) ? { backgroundColor: "var(--Roxo-Claro)" } : {}} onClick={() => {
                                        profs.includes(pessoa) ? unselectProf({ prof: pessoa }) : selectProf({ prof: pessoa });
                                    }} key={index}>
                                        <img src={pessoa.foto != "" ? pessoa.foto : "/icons/avatar.svg"} alt="" />
                                        <div>
                                            <h3>{pessoa.nome}</h3>
                                            <p>{pessoa.email}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className={styles.submitContainer}>
                                <input type="submit" value="Salvar" className={styles.submitBtn} onClick={(e) => {
                                    e.preventDefault();
                                    changeProfissionais();
                                    setOpenProfsPainel(false);
                                    setMudar("");
                                }} />
                                {mudar == "conteudista" || mudar == "validador" || mudar == "apresentador" || mudar == "convidado" ?
                                    <input type="submit" value="Salvar para todos os tópicos" className={styles.submitBtn} onClick={(e) => {
                                        e.preventDefault();
                                        setConfirmAction(() => () => {
                                            changeProfissionais(true);
                                            setOpenProfsPainel(false);
                                            setMudar("");
                                        });
                                        setTextConfirm("Tem certeza que deseja definir estes profissionais como " + mudar + (mudar == "conteudista" || mudar == "validador" ? " para todos os tópicos dessa disciplina? (Isso irá excluir qualquer informação presente no momento)" : "para todos os(as) " + videoSelecionado
                                            ?.tipo + " de todos os tópicos dessa disciplina? (Fazer isso irá excluir qualquer informação presente no momento)"))
                                        setClosedConfirm(false);
                                    }} /> : null}
                            </div>
                        </div>) : null}
                    </div>
                </div >
            </> : null
    );
}