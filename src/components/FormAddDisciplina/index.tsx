import AppContext from "../../AppContext";

import { useContext, useEffect, useState } from "react";

import styles from "./styles.module.css";

import { Disciplina, Profissional, Topico } from "../../Interfaces";

import { FormAddProfissional, SelectDisciplina } from "../";



export default function FormAddDisciplina({ closeAction }: { closeAction: () => void }) {

    const [versaoNova, setVersaoNova] = useState<string>('');

    const [versoes, setVersoes] = useState<string[]>([]);

    const [isUp, setIsUp] = useState<boolean>(false);

    const [disciplinaAntiga, setDisciplinaAntiga] = useState<Disciplina | undefined>();

    const [qtdTops, setQtdTops] = useState<number>(0);

    const { Disciplinas, setDisciplinas, Profissionais, setProfissionais } = useContext(AppContext);



    const [startedAdd, setStartedAdd] = useState<boolean>(false);

    const [finishedAdd, setFinishedAdd] = useState<boolean>(false);

    const [startedAnim, setStartedAnim] = useState<boolean>(false);

    const [conteudistaPadrao, setConteudistaPadrao] = useState<Profissional | null>(null);

    const [openProfsPainel, setOpenProfsPainel] = useState(false);

    const [validadorPadrao, setValidadorPadrao] = useState<Profissional | null>(null);

    const [openValidadorPainel, setOpenValidadorPainel] = useState(false);

    const [apresentadorPadrao, setApresentadorPadrao] = useState<Profissional | null>(null);

    const [openApresentadorPainel, setOpenApresentadorPainel] = useState(false);

    const [filtro, setFiltro] = useState("");

    const [profissionaisFiltrados, setProfissionaisFiltrados] = useState<Profissional[]>(Profissionais);

    const [addProf, setAddProf] = useState(false);

    const [disciplinaTemp, setDisciplinaTemp] = useState<Disciplina>({

        id: 0,

        nome: "",

        versao: "",

        up: "",

        ano: "",

        area: "",

        ambiente: "100%",

        excluida: "",

        status: "Não Iniciada",

        orientadores: [],

        prioridade: "",

        statusMatriz: "",

        linkMatriz: "",

        desenho: "",

        ementa: "",

        disciplinaAntiga: "",

        isbn: "",

        padrao: "",

        detalhamento: "",

        liberadoCriacao: false,

        codAVA100: "",

        codAVA20: "",

        topicos: []

    });

    const [openProfsSelector, setOpenProfsSelector] = useState<{

        [topicoId: string]: {

            conteudista: boolean;

            validador: boolean;

            videos: {

                [videoId: string]: {

                    apresentador: boolean;

                    convidado: boolean;

                }

            };

        };

    }>({});

    const [disciplinaLegado, setDisciplinaLegado] = useState(false);
    const [orcPadrao, setOrcPadrao] = useState<string>("");

    useEffect(() => { console.log(disciplinaTemp.topicos) }, [disciplinaTemp])


    useEffect(() => {

        setProfissionaisFiltrados(Profissionais.filter(x => x.nome.toLowerCase().includes(filtro.toLowerCase())));

    }, [Profissionais, filtro])



    useEffect(() => {

        const unicas = Array.from(new Set(Disciplinas.map(d => d.versao)));

        setVersoes(unicas);

    }, [Disciplinas]);

    useEffect(() => {

        setQtdTops(8);

    }, [])



    useEffect(() => {

        if (qtdTops > 20) return setQtdTops(20);

        if (qtdTops < 0) return setQtdTops(0);

        setDisciplinaTemp({

            ...disciplinaTemp, topicos: Array.from({ length: qtdTops }, (_, i) => disciplinaTemp.topicos[i] || {

                id: `${disciplinaTemp.id}-${i + 1}`,

                idDisciplina: disciplinaTemp.id,

                numero: i + 1,

                conteudistas: conteudistaPadrao ? [conteudistaPadrao] : [],

                validadores: validadorPadrao ? [validadorPadrao] : [],

                status: "Nada",

                carga: "",

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

                versao: "",

                orcamento: "",

                videos: [{

                    id: `${disciplinaTemp.id}-${i + 1}-1`,

                    idDisciplina: disciplinaTemp.id,

                    topicoNum: i + 1,

                    backup: false,

                    tipo: "Videoaula",

                    recursosEspeciaisVideo: "",

                    gravacaoInternaExterna: "Interna",

                    status: "Não Gravado",

                    codigoVimeo: "",

                    apresentador: apresentadorPadrao ? [apresentadorPadrao] : [],

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

                }],

                excluido: "",

                tipo: "Completo"

            })

        })

        setOpenProfsSelector((prev) => {

            const novo = { ...prev };



            for (let i = 0; i < qtdTops; i++) {

                const topico = disciplinaTemp.topicos[i];

                const topicoId = `${disciplinaTemp.id}-${i + 1}`;



                if (!novo[topicoId]) {

                    novo[topicoId] = {

                        conteudista: false,

                        validador: false,

                        videos: {},

                    };

                } else {

                    // Garante que conteudista e validador existam

                    novo[topicoId].conteudista ??= false;

                    novo[topicoId].validador ??= false;

                    novo[topicoId].videos ??= {};

                }



                // Atualiza vídeos

                if (topico?.videos) {

                    topico.videos.forEach((video) => {

                        if (!(video.id in novo[topicoId].videos)) {

                            novo[topicoId].videos[video.id] = { apresentador: false, convidado: false };

                        }

                    });

                }

            }



            return novo;

        });

    }, [qtdTops]);

    useEffect(() => {

        setDisciplinaTemp({ ...disciplinaTemp, topicos: disciplinaTemp.topicos.map((x) => ({ ...x, conteudistas: conteudistaPadrao ? [conteudistaPadrao] : [] })) });

    }, [conteudistaPadrao])

    useEffect(() => {

        setDisciplinaTemp({ ...disciplinaTemp, topicos: disciplinaTemp.topicos.map((x) => ({ ...x, validadores: validadorPadrao ? [validadorPadrao] : [] })) });

    }, [validadorPadrao])

    useEffect(() => {

        setDisciplinaTemp({ ...disciplinaTemp, topicos: disciplinaTemp.topicos.map((x) => ({ ...x, videos: x.videos.map((y) => ({ ...y, apresentador: apresentadorPadrao ? [apresentadorPadrao] : [] })) })) });

    }, [apresentadorPadrao])



    function AddDisciplina() {

        setStartedAdd(true);

        const maiorId = Math.max(...Disciplinas.map(d => d.id));

        const id = maiorId + 1;

        setDisciplinaTemp({

            ...disciplinaTemp,

            id: disciplinaLegado ? disciplinaTemp.id : id,

            nome: disciplinaTemp.nome.toLowerCase().split(' ').filter(palavra => palavra.trim() !== '').map(palavra => palavra[0].toUpperCase() + palavra.slice(1)).join(' '),

            versao: disciplinaTemp.versao === "nova" ? versaoNova : disciplinaTemp.versao,

            up: isUp ? disciplinaTemp.up : "",

            disciplinaAntiga: disciplinaAntiga?.id.toString() ?? "",

            topicos: disciplinaTemp.topicos.map((top, idx) => ({

                id: `${disciplinaLegado ? disciplinaTemp.id : id}-${idx + 1}`,

                idDisciplina: disciplinaLegado ? disciplinaTemp.id : id,

                numero: idx + 1,

                conteudistas: top.conteudistas,

                validadores: top.validadores,

                status: top.status,

                carga: top.carga,

                recursosEspeciaisLicao: top.recursosEspeciaisLicao,

                licaoAutorizada: top.licaoAutorizada,

                catProblemaLicao: top.catProblemaLicao,

                descProblemaLicao: top.descProblemaLicao,

                dataPrevistaInicio: top.dataPrevistaInicio,

                dataEfetivaInicio: top.dataEfetivaInicio,

                dataPrevistaNaMao: top.dataPrevistaNaMao,

                dataEfetivaNaMao: top.dataEfetivaNaMao,

                dataPrevistaVT: top.dataPrevistaVT,

                dataEfetivaVT: top.dataEfetivaVT,

                dataPrevistaGramatica: top.dataPrevistaGramatica,

                dataEfetivaGramatica: top.dataEfetivaGramatica,

                versao: top.versao,

                orcamento: top.orcamento,

                videos: top.videos.map((vid, j) => ({

                    id: `${disciplinaLegado ? disciplinaTemp.id : id}-${idx + 1}-${j + 1}`,

                    idDisciplina: disciplinaLegado ? disciplinaTemp.id : id,

                    topicoNum: idx + 1,

                    backup: false,

                    tipo: vid.tipo,

                    recursosEspeciaisVideo: vid.recursosEspeciaisVideo,

                    gravacaoInternaExterna: vid.gravacaoInternaExterna,

                    status: vid.status,

                    codigoVimeo: vid.codigoVimeo,

                    apresentador: vid.apresentador,

                    convidado: vid.convidado,

                    dataLiberacao: vid.dataLiberacao,

                    dataEmail: vid.dataEmail,

                    dataAgendamento: vid.dataAgendamento,

                    orcamento: vid.orcamento,

                    versao: vid.versao,

                    videoAutorizado: vid.videoAutorizado,

                    catProblema: vid.catProblema,

                    descProblema: vid.descProblema,

                    excluido: vid.excluido

                })),

                excluido: top.excluido,

                tipo: top.tipo

            }))

        })



        const body = {

            acao: "adicionarDisciplina",

            disciplina: {

                ...disciplinaTemp,

                id: disciplinaLegado ? disciplinaTemp.id : id,

                nome: disciplinaTemp.nome.toLowerCase().split(' ').filter(palavra => palavra.trim() !== '').map(palavra => palavra[0].toUpperCase() + palavra.slice(1)).join(' '),

                versao: disciplinaTemp.versao === "nova" ? versaoNova : disciplinaTemp.versao,

                up: isUp ? disciplinaTemp.up : "",

                disciplinaAntiga: disciplinaAntiga?.id.toString() ?? "",

                topicos: disciplinaTemp.topicos.map((top, idx) => ({

                    id: `${disciplinaLegado ? disciplinaTemp.id : id}-${idx + 1}`,

                    idDisciplina: disciplinaLegado ? disciplinaTemp.id : id,

                    numero: idx + 1,

                    conteudistas: top.conteudistas,

                    validadores: top.validadores,

                    status: top.status,

                    carga: top.carga,

                    recursosEspeciaisLicao: top.recursosEspeciaisLicao,

                    licaoAutorizada: top.licaoAutorizada,

                    catProblemaLicao: top.catProblemaLicao,

                    descProblemaLicao: top.descProblemaLicao,

                    dataPrevistaInicio: top.dataPrevistaInicio,

                    dataEfetivaInicio: top.dataEfetivaInicio,

                    dataPrevistaNaMao: top.dataPrevistaNaMao,

                    dataEfetivaNaMao: top.dataEfetivaNaMao,

                    dataPrevistaVT: top.dataPrevistaVT,

                    dataEfetivaVT: top.dataEfetivaVT,

                    dataPrevistaGramatica: top.dataPrevistaGramatica,

                    dataEfetivaGramatica: top.dataEfetivaGramatica,

                    versao: top.versao,

                    orcamento: top.orcamento,

                    videos: top.videos.map((vid, j) => ({

                        id: `${disciplinaLegado ? disciplinaTemp.id : id}-${idx + 1}-${j + 1}`,

                        idDisciplina: disciplinaLegado ? disciplinaTemp.id : id,

                        topicoNum: idx + 1,

                        backup: false,

                        tipo: vid.tipo,

                        recursosEspeciaisVideo: vid.recursosEspeciaisVideo,

                        gravacaoInternaExterna: vid.gravacaoInternaExterna,

                        status: vid.status,

                        codigoVimeo: vid.codigoVimeo,

                        apresentador: vid.apresentador,

                        convidado: vid.convidado,

                        dataLiberacao: vid.dataLiberacao,

                        dataEmail: vid.dataEmail,

                        dataAgendamento: vid.dataAgendamento,

                        orcamento: vid.orcamento,

                        versao: vid.versao,

                        videoAutorizado: vid.videoAutorizado,

                        catProblema: vid.catProblema,

                        descProblema: vid.descProblema,

                        excluido: vid.excluido

                    })),

                    excluido: top.excluido,

                    tipo: top.tipo

                }))

            }

        };

        console.log(JSON.stringify(body));



        fetch("https://script.google.com/macros/s/AKfycbyqzSfSRHYC6NgH9d_FkQCF_2_Br6nSjNwZ_0J4hUm1io4lTj-7a0t0YmlJ43KtgzbS/exec", {

            method: "POST",

            headers: { "Content-Type": "text/plain;charset=utf-8" },

            body: JSON.stringify(body),

        })

            .then(res => res.text())

            .then(() => {

                setDisciplinas([...Disciplinas, {

                    ...disciplinaTemp,

                    id: disciplinaLegado ? disciplinaTemp.id : id,

                    nome: disciplinaTemp.nome.toLowerCase().split(' ').filter(palavra => palavra.trim() !== '').map(palavra => palavra[0].toUpperCase() + palavra.slice(1)).join(' '),

                    versao: disciplinaTemp.versao === "nova" ? versaoNova : disciplinaTemp.versao,

                    up: isUp ? disciplinaTemp.up : "",

                    disciplinaAntiga: disciplinaAntiga?.id.toString() ?? "",

                    topicos: disciplinaTemp.topicos.map((top, idx) => ({

                        id: `${disciplinaLegado ? disciplinaTemp.id : id}-${idx + 1}`,

                        idDisciplina: disciplinaLegado ? disciplinaTemp.id : id,

                        numero: idx + 1,

                        conteudistas: top.conteudistas,

                        validadores: top.validadores,

                        status: top.status,

                        carga: top.carga,

                        recursosEspeciaisLicao: top.recursosEspeciaisLicao,

                        licaoAutorizada: top.licaoAutorizada,

                        catProblemaLicao: top.catProblemaLicao,

                        descProblemaLicao: top.descProblemaLicao,

                        dataPrevistaInicio: top.dataPrevistaInicio,

                        dataEfetivaInicio: top.dataEfetivaInicio,

                        dataPrevistaNaMao: top.dataPrevistaNaMao,

                        dataEfetivaNaMao: top.dataEfetivaNaMao,

                        dataPrevistaVT: top.dataPrevistaVT,

                        dataEfetivaVT: top.dataEfetivaVT,

                        dataPrevistaGramatica: top.dataPrevistaGramatica,

                        dataEfetivaGramatica: top.dataEfetivaGramatica,

                        versao: top.versao,

                        orcamento: top.orcamento,

                        videos: top.videos.map((vid, j) => ({

                            id: `${disciplinaLegado ? disciplinaTemp.id : id}-${idx + 1}-${j + 1}`,

                            idDisciplina: disciplinaLegado ? disciplinaTemp.id : id,

                            topicoNum: idx + 1,

                            backup: false,

                            tipo: vid.tipo,

                            recursosEspeciaisVideo: vid.recursosEspeciaisVideo,

                            gravacaoInternaExterna: vid.gravacaoInternaExterna,

                            status: vid.status,

                            codigoVimeo: vid.codigoVimeo,

                            apresentador: vid.apresentador,

                            convidado: vid.convidado,

                            dataLiberacao: vid.dataLiberacao,

                            dataEmail: vid.dataEmail,

                            dataAgendamento: vid.dataAgendamento,

                            orcamento: vid.orcamento,

                            versao: vid.versao,

                            videoAutorizado: vid.videoAutorizado,

                            catProblema: vid.catProblema,

                            descProblema: vid.descProblema,

                            excluido: vid.excluido

                        })),

                        excluido: top.excluido,

                        tipo: top.tipo

                    }))

                }]);

                setStartedAdd(false);

                setStartedAnim(true);

                setTimeout(() => setFinishedAdd(true), 100);

                setTimeout(() => {

                    setFinishedAdd(false);

                    setTimeout(() => setStartedAnim(false), 500);

                }, 5000);

            })

            .catch(err => {

                console.error(err);

                setStartedAdd(false);

            });

    }

    const adicionarVideoAoTopico = (topId: string) => {

        setDisciplinaTemp((prev) => ({

            ...prev,

            topicos: prev.topicos.map((topico) => {

                if (topico.id === topId) {

                    const novoId = `${topico.id}-${topico.videos.length + 1}`;

                    const novoVideo = {

                        id: novoId,

                        idDisciplina: prev.id,

                        topicoNum: topico.numero,

                        backup: false,

                        tipo: "Videoaula" as "Videoaula" | "Video Embutido" | "Videocast",

                        recursosEspeciaisVideo: "",

                        gravacaoInternaExterna: "Interna" as "Interna" | "Externa",

                        status: "Não Gravado" as "Problema" | "Não Gravado" | "Liberado OC" | "Agendado" | "Gravado" | "Editado" | "Postado" | "Aguardando Agendamento",

                        codigoVimeo: "",

                        apresentador: [],

                        convidado: [],

                        dataLiberacao: "" as "" | Date,

                        dataEmail: "" as "" | Date,

                        dataAgendamento: "" as "" | Date,

                        orcamento: "",

                        versao: "",

                        videoAutorizado: false,

                        catProblema: "",

                        descProblema: "",

                        excluido: "" as "" | "Excluído"

                    };

                    return {

                        ...topico,

                        videos: [...topico.videos, novoVideo]

                    };

                }

                return topico;

            })

        }));



        setOpenProfsSelector((prev) => ({

            ...prev,

            [topId]: {

                ...prev[topId],

                videos: {

                    ...prev[topId]?.videos,

                    [`${topId}-${disciplinaTemp.topicos.find(t => t.id === topId)?.videos.length ?? 0 + 1}`]: {

                        apresentador: false,

                        convidado: false

                    }

                }

            }

        }));

    };

    useEffect(() => {

        if (isUp) {

            setDisciplinaTemp({ ...disciplinaTemp, up: "Total" });

        } else {

            setDisciplinaTemp({ ...disciplinaTemp, up: "" });

        }

    }, [isUp])





    return startedAdd ? <div className={styles.addDisciplina}><h3>Adicionando disciplina...</h3></div> : (
        //OLHA O GEMINI PRA RESOLVER ESSE ERRO!!
        <form onSubmit={e => { e.preventDefault(); AddDisciplina(); }} className={styles.addDisciplina}>

            {startedAnim && <div className={`${styles.added} ${finishedAdd ? styles.addedShown : ""}`}><h3>Disciplina adicionada com sucesso!</h3></div>}



            <h3>Adicionar nova disciplina:</h3>

            <label>Disciplina Legado? <input type="checkbox" name="disciplinaLegado" id="disciplinaLegado" checked={disciplinaLegado} onChange={(e) => setDisciplinaLegado(e.target.checked)} /></label>

            {disciplinaLegado && (

                <label>Id: <input type="number" required value={disciplinaTemp.id} onChange={e => setDisciplinaTemp({ ...disciplinaTemp, id: parseInt(e.target.value) })} /></label>

            )}

            <label>Nome: <input type="text" required value={disciplinaTemp.nome} onChange={e => setDisciplinaTemp({ ...disciplinaTemp, nome: e.target.value })} /></label>

            <label>Up: <input type="checkbox" checked={isUp} onChange={e => setIsUp(e.target.checked)} /></label>

            {isUp && (

                <>

                    <label>Tipo de Up:

                        <select value={disciplinaTemp.up} onChange={e => setDisciplinaTemp({ ...disciplinaTemp, up: e.target.value as "Total" | "Parcial" })}>

                            <option value="Total">Total</option>

                            <option value="Parcial">Parcial</option>

                        </select>

                    </label>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>

                        <label>Disciplina Anterior:</label>

                        <SelectDisciplina disciplinaSelecionada={disciplinaAntiga} setDisciplinaSelecionada={setDisciplinaAntiga} />

                    </div>

                </>

            )}

            <label>Versão:

                <select required value={disciplinaTemp.versao} onChange={e => setDisciplinaTemp({ ...disciplinaTemp, versao: e.target.value, topicos: disciplinaTemp.topicos.map((t) => { return { ...t, versao: e.target.value, videos: t.videos.map((v) => { return { ...v, versao: e.target.value } }) } }) })}>

                    <option value="" disabled hidden>Selecione uma versão</option>

                    {versoes.filter(x => x).map((x, idx) => <option key={idx} value={x}>{x}</option>)}

                    <option value="nova">Nova Versão</option>

                </select>

            </label>

            {disciplinaTemp.versao === "nova" && (

                <label>Nova Versão: <input type="text" required value={versaoNova} onChange={e => setVersaoNova(e.target.value)} /></label>

            )}

            <label>Orçamento Padrão:
                <input type="text" name="orcPadrao" id="orcPadrao" style={{ marginLeft: 10 }} value={orcPadrao} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setOrcPadrao(e.target.value); setDisciplinaTemp({ ...disciplinaTemp, topicos: disciplinaTemp.topicos.map((t) => { return { ...t, orcamento: e.target.value, videos: t.videos.map((v) => { return { ...v, orcamento: e.target.value } }) } }) }) }} />
            </label>

            <label>Conteudista Padrão:

                <button

                    type="button"

                    className={styles.btn}

                    onClick={() => setOpenProfsPainel(true)}

                    style={{ marginLeft: "10px" }}

                >

                    {conteudistaPadrao ? conteudistaPadrao.nome : "Selecionar"}

                </button>

            </label>

            {openProfsPainel && (

                <div className={styles.profissionaisContainer}>

                    <div className={styles.searchContainer}>

                        <input

                            type="text"

                            placeholder="Buscar"

                            value={filtro}

                            onChange={(e) => setFiltro(e.target.value)}

                        />

                    </div>

                    <div>

                        {addProf ?

                            <FormAddProfissional closeAction={(profissional: Profissional) => { setAddProf(false); profissional ? setProfissionais([...Profissionais, profissional]) : null }}></FormAddProfissional>

                            :

                            <button className={styles.btn} onClick={() => setAddProf(true)}>Adicionar Novo Profissional</button>}

                    </div>

                    <div className={styles.profissionais}>

                        {profissionaisFiltrados.map((pessoa, index) => (

                            <button

                                key={index}

                                className={styles.card}

                                style={

                                    conteudistaPadrao?.id === pessoa.id

                                        ? { backgroundColor: "var(--Roxo-Claro)" }

                                        : {}

                                }

                                onClick={() => {

                                    setConteudistaPadrao(pessoa);

                                    setOpenProfsPainel(false);

                                }}

                            >

                                <img src={pessoa.foto || `${import.meta.env.BASE_URL}icons/avatar.svg`} alt="" />

                                <div>

                                    <h3>{pessoa.nome}</h3>

                                    <p>{pessoa.email}</p>

                                </div>

                            </button>

                        ))}

                    </div>



                    <div className={styles.submitContainer}>

                        <button

                            type="button"

                            className={styles.btnDel}

                            onClick={() => setOpenProfsPainel(false)}

                        >

                            Cancelar

                        </button>

                    </div>

                </div>

            )}

            <label>Validador Padrão:

                <button

                    type="button"

                    className={styles.btn}

                    onClick={() => setOpenValidadorPainel(true)}

                    style={{ marginLeft: "10px" }}

                >

                    {validadorPadrao ? validadorPadrao.nome : "Selecionar"}

                </button>

            </label>

            {openValidadorPainel && (

                <div className={styles.profissionaisContainer}>

                    <div className={styles.searchContainer}>

                        <input

                            type="text"

                            placeholder="Buscar"

                            value={filtro}

                            onChange={(e) => setFiltro(e.target.value)}

                        />

                    </div>

                    <div>

                        {addProf ?

                            <FormAddProfissional closeAction={(profissional: Profissional) => { setAddProf(false); profissional ? setProfissionais([...Profissionais, profissional]) : null }}></FormAddProfissional>

                            :

                            <button className={styles.btn} onClick={() => setAddProf(true)}>Adicionar Novo Profissional</button>}

                    </div>

                    <div className={styles.profissionais}>

                        {profissionaisFiltrados.map((pessoa, index) => (

                            <button

                                key={index}

                                className={styles.card}

                                style={

                                    validadorPadrao?.email === pessoa.email

                                        ? { backgroundColor: "var(--Roxo-Claro)" }

                                        : {}

                                }

                                onClick={() => {

                                    setValidadorPadrao(pessoa);

                                    setOpenValidadorPainel(false);

                                }}

                            >

                                <img src={pessoa.foto || `${import.meta.env.BASE_URL}icons/avatar.svg`} alt="" />

                                <div>

                                    <h3>{pessoa.nome}</h3>

                                    <p>{pessoa.email}</p>

                                </div>

                            </button>

                        ))}

                    </div>



                    <div className={styles.submitContainer}>

                        <button

                            type="button"

                            className={styles.btnDel}

                            onClick={() => setOpenValidadorPainel(false)}

                        >

                            Cancelar

                        </button>

                    </div>

                </div>

            )}

            <label>Apresentador Padrão:

                <button

                    type="button"

                    className={styles.btn}

                    onClick={() => setOpenApresentadorPainel(true)}

                    style={{ marginLeft: "10px" }}

                >

                    {apresentadorPadrao ? apresentadorPadrao.nome : "Selecionar"}

                </button>

            </label>

            {openApresentadorPainel && (

                <div className={styles.profissionaisContainer}>

                    <div className={styles.searchContainer}>

                        <input

                            type="text"

                            placeholder="Buscar"

                            value={filtro}

                            onChange={(e) => setFiltro(e.target.value)}

                        />

                    </div>

                    <div>

                        {addProf ?

                            <FormAddProfissional closeAction={(profissional: Profissional) => { setAddProf(false); profissional ? setProfissionais([...Profissionais, profissional]) : null }}></FormAddProfissional>

                            :

                            <button className={styles.btn} onClick={() => setAddProf(true)}>Adicionar Novo Profissional</button>}

                    </div>

                    <div className={styles.profissionais}>

                        {profissionaisFiltrados.map((pessoa, index) => (

                            <button

                                key={index}

                                className={styles.card}

                                style={

                                    apresentadorPadrao?.email === pessoa.email

                                        ? { backgroundColor: "var(--Roxo-Claro)" }

                                        : {}

                                }

                                onClick={() => {

                                    setApresentadorPadrao(pessoa);

                                    setOpenApresentadorPainel(false);

                                }}

                            >

                                <img src={pessoa.foto || `${import.meta.env.BASE_URL}icons/avatar.svg`} alt="" />

                                <div>

                                    <h3>{pessoa.nome}</h3>

                                    <p>{pessoa.email}</p>

                                </div>

                            </button>

                        ))}

                    </div>



                    <div className={styles.submitContainer}>

                        <button

                            type="button"

                            className={styles.btnDel}

                            onClick={() => setOpenApresentadorPainel(false)}

                        >

                            Cancelar

                        </button>

                    </div>

                </div>

            )}

            <label>Área:

                <select required value={disciplinaTemp.area} onChange={e => setDisciplinaTemp({ ...disciplinaTemp, area: e.target.value })}>

                    <option value="" disabled hidden>Selecione uma área</option>

                    <option value="Humanas">Humanas</option>

                    <option value="Saúde">Saúde</option>

                    <option value="Tecnologia">Tecnologia</option>

                </select>

            </label>

            <label>Ano: <input type="text" required value={disciplinaTemp.ano} onChange={e => setDisciplinaTemp({ ...disciplinaTemp, ano: e.target.value })} /></label>

            <label>Ambiente:

                <select value={disciplinaTemp.ambiente} onChange={e => setDisciplinaTemp({ ...disciplinaTemp, ambiente: e.target.value as "100%" | "20%" | "Ambos" })}>

                    <option value="100%">100%</option>

                    <option value="20%">20%</option>

                    <option value="Ambos">Ambos</option>

                </select>

            </label>

            <label>Qtd. de Tópicos:

                <input type="number" min={0} max={20} value={qtdTops} onChange={e => setQtdTops(parseInt(e.target.value))} />

            </label>



            {qtdTops > 0 ? (

                <div className={styles.addVids}>

                    <h3>Tópicos e Vídeos:</h3>

                    <div className={styles.outerContainer}>

                        {disciplinaTemp.topicos.map((top: Topico, i) => (

                            <div key={i} className={styles.topicoContainer}>

                                <h4>Tópico {i + 1}</h4>

                                <label>Tópico sem lição? <input type="checkbox" checked={top.tipo == "Video"} onChange={(e) => { setDisciplinaTemp({ ...disciplinaTemp, topicos: disciplinaTemp.topicos.map(t => t.id == top.id ? { ...t, tipo: e.target.checked ? "Video" : "Completo" } : t) }) }} /> </label>

                                {top.tipo == "Completo" ?

                                    <>

                                        <label>Conteudista:

                                            <button

                                                type="button"

                                                className={styles.btnDel}

                                                onClick={() => setOpenProfsSelector({ ...openProfsSelector, [top.id]: { ...openProfsSelector[top.id], conteudista: true } })}

                                                style={{ marginLeft: "10px" }}

                                            >

                                                {top.conteudistas.length > 0 ? top.conteudistas[0].nome : "Selecionar"}

                                            </button>

                                        </label>

                                        {openProfsSelector[top.id]?.conteudista && (

                                            <div className={styles.profissionaisContainer}>

                                                <div className={styles.searchContainer}>

                                                    <input

                                                        type="text"

                                                        placeholder="Buscar"

                                                        value={filtro}

                                                        onChange={(e) => setFiltro(e.target.value)}

                                                    />

                                                </div>

                                                <div>

                                                    {addProf ?

                                                        <FormAddProfissional closeAction={(profissional: Profissional) => { setAddProf(false); profissional ? setProfissionais([...Profissionais, profissional]) : null }}></FormAddProfissional>

                                                        :

                                                        <button className={styles.btn} onClick={() => setAddProf(true)}>Adicionar Novo Profissional</button>}

                                                </div>

                                                <div className={styles.profissionais}>

                                                    {profissionaisFiltrados.map((pessoa, index) => (

                                                        <button

                                                            key={index}

                                                            className={styles.card}

                                                            style={

                                                                top.conteudistas[0]?.id === pessoa.id

                                                                    ? { backgroundColor: "var(--Roxo-Claro)" }

                                                                    : {}

                                                            }

                                                            onClick={() => {

                                                                setDisciplinaTemp({

                                                                    ...disciplinaTemp,

                                                                    topicos: disciplinaTemp.topicos.map(x =>

                                                                        top.id === x.id ? { ...x, conteudistas: [pessoa] } : x

                                                                    ),

                                                                });

                                                                setOpenProfsSelector({ ...openProfsSelector, [top.id]: { ...openProfsSelector[top.id], conteudista: false } })

                                                            }}

                                                        >

                                                            <img src={pessoa.foto || `${import.meta.env.BASE_URL}icons/avatar.svg`} alt="" />

                                                            <div>

                                                                <h3>{pessoa.nome}</h3>

                                                                <p>{pessoa.email}</p>

                                                            </div>

                                                        </button>

                                                    ))}

                                                </div>



                                                <div className={styles.submitContainer}>

                                                    <button

                                                        type="button"

                                                        className={styles.btnDel}

                                                        onClick={() => setOpenProfsSelector({ ...openProfsSelector, [top.id]: { ...openProfsSelector[top.id], conteudista: false } })}

                                                    >

                                                        Cancelar

                                                    </button>

                                                </div>

                                            </div>

                                        )}

                                        <label>Validador:

                                            <button

                                                type="button"

                                                className={styles.btnDel}

                                                onClick={() => setOpenProfsSelector({ ...openProfsSelector, [top.id]: { ...openProfsSelector[top.id], validador: true } })}

                                                style={{ marginLeft: "10px" }}

                                            >

                                                {top.validadores.length > 0 ? top.validadores[0].nome : "Selecionar"}

                                            </button>

                                        </label>

                                        {openProfsSelector[top.id]?.validador && (

                                            <div className={styles.profissionaisContainer}>

                                                <div className={styles.searchContainer}>

                                                    <input

                                                        type="text"

                                                        placeholder="Buscar"

                                                        value={filtro}

                                                        onChange={(e) => setFiltro(e.target.value)}

                                                    />

                                                </div>

                                                <div>

                                                    {addProf ?

                                                        <FormAddProfissional closeAction={(profissional: Profissional) => { setAddProf(false); profissional ? setProfissionais([...Profissionais, profissional]) : null }}></FormAddProfissional>

                                                        :

                                                        <button className={styles.btn} onClick={() => setAddProf(true)}>Adicionar Novo Profissional</button>}

                                                </div>

                                                <div className={styles.profissionais}>

                                                    {profissionaisFiltrados.map((pessoa, index) => (

                                                        <button

                                                            key={index}

                                                            className={styles.card}

                                                            style={

                                                                top.validadores[0]?.id === pessoa.id

                                                                    ? { backgroundColor: "var(--Roxo-Claro)" }

                                                                    : {}

                                                            }

                                                            onClick={() => {

                                                                setDisciplinaTemp({

                                                                    ...disciplinaTemp,

                                                                    topicos: disciplinaTemp.topicos.map(x =>

                                                                        top.id === x.id ? { ...x, validadores: [pessoa] } : x

                                                                    ),

                                                                });

                                                                setOpenProfsSelector({ ...openProfsSelector, [top.id]: { ...openProfsSelector[top.id], validador: false } });

                                                            }}

                                                        >

                                                            <img src={pessoa.foto || `${import.meta.env.BASE_URL}icons/avatar.svg`} alt="" />

                                                            <div>

                                                                <h3>{pessoa.nome}</h3>

                                                                <p>{pessoa.email}</p>

                                                            </div>

                                                        </button>

                                                    ))}

                                                </div>



                                                <div className={styles.submitContainer}>

                                                    <button

                                                        type="button"

                                                        className={styles.btnDel}

                                                        onClick={() => setOpenProfsSelector({ ...openProfsSelector, [top.id]: { ...openProfsSelector[top.id], validador: false } })}

                                                    >

                                                        Cancelar

                                                    </button>

                                                </div>

                                            </div>

                                        )}

                                        <label>Versão do Tópico: <input type="text" value={top.versao} onChange={e => {

                                            setDisciplinaTemp({ ...disciplinaTemp, topicos: disciplinaTemp.topicos.map((x) => x.id == top.id ? { ...x, versao: e.target.value } : x) })

                                        }} /></label>

                                        <label>Orçamento do Tópico: <input type="text" value={top.orcamento} onChange={e => {

                                            setDisciplinaTemp({ ...disciplinaTemp, topicos: disciplinaTemp.topicos.map((x) => x.id == top.id ? { ...x, orcamento: e.target.value } : x) })

                                        }} /></label>

                                    </> : null}

                                <button

                                    className={styles.btnDel}

                                    type="button"

                                    onClick={() => adicionarVideoAoTopico(top.id)}

                                >

                                    Adicionar Vídeo

                                </button>



                                {top.videos.length > 0 && top.videos.map((vid, j) => (

                                    <div key={j} className={styles.videoContainer}>

                                        <h5>Vídeo {j + 1}</h5>

                                        <label>Apresentador:

                                            <button

                                                type="button"

                                                className={styles.btn}

                                                onClick={() => setOpenProfsSelector({ ...openProfsSelector, [top.id]: { ...openProfsSelector[top.id], videos: { ...openProfsSelector[top.id]?.videos, [vid.id]: { apresentador: true, convidado: openProfsSelector[top.id]?.videos?.[vid.id]?.convidado } } } })}

                                                style={{ marginLeft: "10px" }}

                                            >

                                                {vid.apresentador.length > 0 ? vid.apresentador[0].nome : "Selecionar"}

                                            </button>

                                        </label>

                                        {openProfsSelector[top.id]?.videos[vid.id]?.apresentador && (

                                            <div className={styles.profissionaisContainer}>

                                                <div className={styles.searchContainer}>

                                                    <input

                                                        type="text"

                                                        placeholder="Buscar"

                                                        value={filtro}

                                                        onChange={(e) => setFiltro(e.target.value)}

                                                    />

                                                </div>

                                                <div>

                                                    {addProf ?

                                                        <FormAddProfissional closeAction={(profissional: Profissional) => { setAddProf(false); profissional ? setProfissionais([...Profissionais, profissional]) : null }}></FormAddProfissional>

                                                        :

                                                        <button className={styles.btn} onClick={() => setAddProf(true)}>Adicionar Novo Profissional</button>}

                                                </div>

                                                <div className={styles.profissionais}>

                                                    {profissionaisFiltrados.map((pessoa, index) => (

                                                        <button

                                                            key={index}

                                                            className={styles.card}

                                                            style={

                                                                vid.apresentador[0]?.id === pessoa.id

                                                                    ? { backgroundColor: "var(--Roxo-Claro)" }

                                                                    : {}

                                                            }

                                                            onClick={() => {

                                                                setDisciplinaTemp({

                                                                    ...disciplinaTemp,

                                                                    topicos: disciplinaTemp.topicos.map(x =>

                                                                        x.id === top.id

                                                                            ? {

                                                                                ...x,

                                                                                videos: x.videos.map(y =>

                                                                                    y.id === vid.id ? { ...y, apresentador: [pessoa] } : y

                                                                                )

                                                                            }

                                                                            : x

                                                                    )

                                                                });

                                                                setOpenProfsSelector({ ...openProfsSelector, [top.id]: { ...openProfsSelector[top.id], videos: { ...openProfsSelector[top.id]?.videos, [vid.id]: { apresentador: false, convidado: openProfsSelector[top.id]?.videos?.[vid.id]?.convidado } } } });

                                                            }}

                                                        >

                                                            <img src={pessoa.foto || `${import.meta.env.BASE_URL}icons/avatar.svg`} alt="" />

                                                            <div>

                                                                <h3>{pessoa.nome}</h3>

                                                                <p>{pessoa.email}</p>

                                                            </div>

                                                        </button>

                                                    ))}

                                                </div>
                                                <div className={styles.submitContainer}>

                                                    <button

                                                        type="button"

                                                        className={styles.btnDel}

                                                        onClick={() => setOpenProfsSelector({ ...openProfsSelector, [top.id]: { ...openProfsSelector[top.id], videos: { ...openProfsSelector[top.id]?.videos, [vid.id]: { convidado: openProfsSelector[top.id]?.videos?.[vid.id]?.convidado, apresentador: false } } } })}

                                                    >

                                                        Cancelar

                                                    </button>

                                                </div>
                                            </div>
                                        )}
                                        {vid.tipo == "Videocast" &&
                                            < label > Convidado:

                                                <button

                                                    type="button"

                                                    className={styles.btn}

                                                    onClick={() => setOpenProfsSelector({ ...openProfsSelector, [top.id]: { ...openProfsSelector[top.id], videos: { ...openProfsSelector[top.id]?.videos, [vid.id]: { apresentador: openProfsSelector[top.id]?.videos?.[vid.id]?.apresentador, convidado: true } } } })}

                                                    style={{ marginLeft: "10px" }}

                                                >

                                                    {vid.convidado.length > 0 ? vid.convidado[0].nome : "Selecionar"}

                                                </button>

                                            </label>}

                                        {openProfsSelector[top.id]?.videos[vid.id]?.convidado && vid.tipo == "Videocast" && (

                                            <div className={styles.profissionaisContainer}>

                                                <div className={styles.searchContainer}>

                                                    <input

                                                        type="text"

                                                        placeholder="Buscar"

                                                        value={filtro}

                                                        onChange={(e) => setFiltro(e.target.value)}

                                                    />

                                                </div>

                                                <div>

                                                    {addProf ?

                                                        <FormAddProfissional closeAction={(profissional: Profissional) => { setAddProf(false); profissional ? setProfissionais([...Profissionais, profissional]) : null }}></FormAddProfissional>

                                                        :

                                                        <button className={styles.btn} onClick={() => setAddProf(true)}>Adicionar Novo Profissional</button>}

                                                </div>

                                                <div className={styles.profissionais}>

                                                    {profissionaisFiltrados.map((pessoa, index) => (

                                                        <button

                                                            key={index}

                                                            className={styles.card}

                                                            style={

                                                                vid.convidado[0]?.id === pessoa.id

                                                                    ? { backgroundColor: "var(--Roxo-Claro)" }

                                                                    : {}

                                                            }

                                                            onClick={() => {

                                                                setDisciplinaTemp({

                                                                    ...disciplinaTemp,

                                                                    topicos: disciplinaTemp.topicos.map(x =>

                                                                        x.id === top.id

                                                                            ? {

                                                                                ...x,

                                                                                videos: x.videos.map(y =>

                                                                                    y.id === vid.id ? { ...y, convidado: [pessoa] } : y

                                                                                )

                                                                            }

                                                                            : x

                                                                    )

                                                                });

                                                                setOpenProfsSelector({ ...openProfsSelector, [top.id]: { ...openProfsSelector[top.id], videos: { ...openProfsSelector[top.id]?.videos, [vid.id]: { apresentador: openProfsSelector[top.id]?.videos?.[vid.id]?.apresentador, convidado: false } } } });

                                                            }}

                                                        >

                                                            <img src={pessoa.foto || `${import.meta.env.BASE_URL}icons/avatar.svg`} alt="" />

                                                            <div>

                                                                <h3>{pessoa.nome}</h3>

                                                                <p>{pessoa.email}</p>

                                                            </div>

                                                        </button>

                                                    ))}

                                                </div>



                                                <div className={styles.submitContainer}>

                                                    <button

                                                        type="button"

                                                        className={styles.btnDel}

                                                        onClick={() => setOpenProfsSelector({ ...openProfsSelector, [top.id]: { ...openProfsSelector[top.id], videos: { ...openProfsSelector[top.id]?.videos, [vid.id]: { apresentador: openProfsSelector[top.id]?.videos?.[vid.id]?.apresentador, convidado: false } } } })}

                                                    >

                                                        Cancelar

                                                    </button>

                                                </div>

                                            </div>

                                        )}

                                        <label>Tipo: <select value={vid.tipo} onChange={e => {

                                            setDisciplinaTemp({ ...disciplinaTemp, topicos: disciplinaTemp.topicos.map((x) => x.id == top.id ? { ...x, videos: x.videos.map((y) => y.id == vid.id ? { ...y, tipo: e.target.value as "Apresentação" | "Videoaula" | "Video Embutido" | "Videocast" } : y) } : x) })

                                        }}>

                                            <option value="Videoaula">Videoaula</option>

                                            <option value="Video Embutido">Vídeo Embutido</option>

                                            <option value="Videocast">Videocast</option>

                                        </select>

                                        </label>



                                        <label>Versão do Vídeo: <input type="text" value={vid.versao} onChange={e => {

                                            setDisciplinaTemp({ ...disciplinaTemp, topicos: disciplinaTemp.topicos.map((x) => x.id == top.id ? { ...x, videos: x.videos.map((y) => y.id == vid.id ? { ...y, versao: e.target.value } : y) } : x) })

                                        }} />

                                        </label>



                                        <label>Orçamento do Vídeo: <input type="text" value={vid.orcamento} onChange={e => {

                                            setDisciplinaTemp({ ...disciplinaTemp, topicos: disciplinaTemp.topicos.map((x) => x.id == top.id ? { ...x, videos: x.videos.map((y) => y.id == vid.id ? { ...y, orcamento: e.target.value } : y) } : x) })

                                        }} />

                                        </label>



                                        <button

                                            className={styles.btn}

                                            type="button"

                                            onClick={() => {

                                                setDisciplinaTemp({

                                                    ...disciplinaTemp,

                                                    topicos: disciplinaTemp.topicos.map((x) =>

                                                        x.id == top.id

                                                            ? {

                                                                ...x,

                                                                videos: x.videos.filter((y) => y.id !== vid.id),

                                                            }

                                                            : x

                                                    ),

                                                });

                                            }}

                                        >

                                            Remover Vídeo

                                        </button>

                                    </div>

                                ))}

                            </div>

                        ))}

                    </div>

                </div>

            ) : null
            }



            <div className={styles.btns}>

                <input className={styles.btn} type="submit" value="Salvar" />

                <button className={styles.btn} style={{ backgroundColor: "var(--Cinza-Claro)", color: "black" }} type="button" onClick={() => closeAction()}>Fechar</button>

            </div>

        </form >

    );

}