import { useParams, useNavigate } from "react-router-dom";
import { Header, ShowPessoal, ShowTopicos, ShowVideos, Panel, Menu, ConfirmPrompt } from "../../components";
import styles from "./styles.module.css";
import { useContext, useEffect, useState } from "react";
import AppContext from "../../AppContext";
import { Disciplina } from "../../Interfaces";

export default function DisciplinaPage() {
    const { id, back, idProf } = useParams();
    const navigate = useNavigate();
    const { Disciplinas, setDisciplinas, currentUser } = useContext(AppContext);
    const [disciplinaAtual, setDisciplinaAtual] = useState<Disciplina | null>(null);
    const [tipoPainel, setTipoPainel] = useState("");
    const [openPainel, setOpenPainel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [textConfirm, setTextConfirm] = useState("");
    const [confirmAction, setConfirmAction] = useState<() => void>(() => () => { });
    const [closed, setClosed] = useState(true);
    const [disciplinaAntiga, setDisciplinaAntiga] = useState<Disciplina>()

    useEffect(() => {
        // Se não houver ID, redireciona imediatamente
        if (!id) {
            navigate("/", { replace: true });
            return;
        }

        // Aguarda as disciplinas carregarem
        if (Disciplinas.length > 0) {
            const encontrada = Disciplinas.find(x => x.id == parseInt(id));
            if (!encontrada) {
                navigate("/", { replace: true });
            } else {
                setDisciplinaAtual(encontrada);
            }
        }
    }, [id, Disciplinas, navigate]);

    useEffect(() => {
        setDisciplinaAntiga(Disciplinas.find(d => d.id.toString() == disciplinaAtual?.disciplinaAntiga));
    }, [disciplinaAtual])

    if (!disciplinaAtual) return <><Header back={back ? ("/" + back + (idProf ? "/" + idProf : "")) : "/"} /><Menu /><h2 className={[styles.centered, styles.container].join(" ")}>Carregando...</h2></>; // ou exiba um loading

    function Arquivo(excluida: boolean) {
        setLoading(true);
        const body = {
            acao: "arquivoDisciplina",
            id: disciplinaAtual?.id,
            excluida: excluida ? "Excluída" : ""
        };
        fetch("https://script.google.com/macros/s/AKfycbyqzSfSRHYC6NgH9d_FkQCF_2_Br6nSjNwZ_0J4hUm1io4lTj-7a0t0YmlJ43KtgzbS/exec", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(body),
        })
            .then(res => res.text())
            .then(data => console.log(data))
            .then(() => {
                if (disciplinaAtual) {
                    setDisciplinas(Disciplinas.map(d => d.id == disciplinaAtual.id ? { ...d, excluida: excluida ? "Excluída" : "" } : d))
                    setDisciplinaAtual({ ...disciplinaAtual, excluida: excluida ? "Excluída" : "" });
                }
                setLoading(false);
            }
            )
            .catch(err => {
                console.error(err);
            });
    }

    function CalcularStatus() {
        if (!disciplinaAtual) return "Não Iniciada";

        const statusTopicos = disciplinaAtual.topicos.map(t => t.status);

        const naoIniciados = [
            "Nada", "Problema", "Alerta Etapa Produção", "Alerta Etapa Validação"
        ];
        const prontos = [
            "Revisão Final", "Pronto"
        ];

        const todosNaoIniciados = statusTopicos.every(status => naoIniciados.includes(status));
        if (todosNaoIniciados) return "Não Iniciada";

        const todosProntos = statusTopicos.every(status => prontos.includes(status));
        if (todosProntos) return "Pronta";

        return "Produzindo";
    }

    return (
        <>
            <Menu />
            {closed ? null : <ConfirmPrompt text={textConfirm} confirmAction={() => confirmAction()} setClosed={setClosed} />}
            <Header back={back ? ("/" + back + (idProf ? "/" + idProf : "")) : "/"} />
            {loading ? <h2 className={[styles.centered, styles.container].join(" ")}>Processando...</h2> : disciplinaAtual.excluida ?
                <div className={[styles.centered, styles.container].join(" ")}>
                    <h2>Esta disciplina está arquivada</h2>
                    {currentUser?.admin && <button className={styles.btn} onClick={() => Arquivo(false)}>Desarquivar</button>}
                </div> :
                <>
                    <Panel tipo={tipoPainel} setTipo={setTipoPainel} open={openPainel} setOpen={setOpenPainel} disciplina={disciplinaAtual} />
                    <div className={styles.container}>
                        <div className={styles.titleContainer}>
                            <h1>{disciplinaAtual.nome} {disciplinaAtual.up ? "(UP)" : null}</h1>
                            {currentUser?.admin && <div>
                                <button onClick={() => { setTextConfirm("Tem certeza que deseja arquivar essa disciplina?"); setConfirmAction(() => () => Arquivo(true)); setClosed(false); }} className={styles.btnDel} style={{ margin: "0 5px" }}>Arquivar disciplina</button>
                                <button className={styles.btn} onClick={() => { setOpenPainel(true); setTipoPainel("disciplina") }}>Editar Disciplina</button>
                            </div>}
                        </div>
                        <p><strong>ID:</strong> {disciplinaAtual.id}</p>
                        <p><strong>Área:</strong> {disciplinaAtual.area}</p>
                        {disciplinaAntiga && <p><strong>Disciplina Antiga:</strong> {disciplinaAntiga.id} - {disciplinaAntiga.nome} <button className={styles.btn} onClick={() => navigate("/disciplina/" + disciplinaAntiga.id)}>Acessar</button></p>}
                        <p><strong>Versão:</strong> {disciplinaAtual.versao}</p>
                        {disciplinaAtual.up ? <p><strong>UP:</strong> {disciplinaAtual.up}</p> : null}
                        {disciplinaAtual.prioridade && <p><strong>Prioridade:</strong> {disciplinaAtual.prioridade}</p>}
                        {disciplinaAtual.statusMatriz && <p><strong>Status da Matriz:</strong> {disciplinaAtual.statusMatriz} ({disciplinaAtual.linkMatriz})</p>}
                        <p><strong>Ano:</strong> {disciplinaAtual.ano}</p>
                        {(disciplinaAtual.ementa || currentUser?.admin) && (
                            <p>
                                <strong>Ementa: </strong>
                                {disciplinaAtual.ementa ?? (
                                    <button
                                        className={styles.btn}
                                        onClick={() => {
                                            setOpenPainel(true);
                                            setTipoPainel("disciplina");
                                        }}
                                    >
                                        Adicionar Ementa
                                    </button>
                                )}
                            </p>
                        )}
                        {(disciplinaAtual.isbn || currentUser?.admin) && <p><strong>ISBN: </strong>
                            {disciplinaAtual.isbn ??
                                <button
                                    className={styles.btn}
                                    onClick={() => {
                                        setOpenPainel(true);
                                        setTipoPainel("disciplina")
                                    }}
                                >
                                    Adicionar ISBN
                                </button>}
                        </p>}
                        <p><strong>Status:</strong> {CalcularStatus()}</p>
                        {disciplinaAtual.detalhamento && <p><strong>Detalhamento de Produção/Importação:</strong> {disciplinaAtual.detalhamento}</p>}
                    </div>
                    <ShowPessoal disciplina={disciplinaAtual} />
                    <ShowTopicos topicos={disciplinaAtual.topicos} classBtn={styles.btn} classTitle={styles.titleContainer} setOpenPainel={setOpenPainel} setTipoPainel={setTipoPainel} />
                    <ShowVideos videos={disciplinaAtual.topicos.flatMap(t => t.videos)} classBtn={styles.btn} classTitle={styles.titleContainer} setOpenPainel={setOpenPainel} setTipoPainel={setTipoPainel} />
                    <div className={styles.container}>
                        <h3>AVA</h3>
                        <p><strong>Liberado para criação da instância?</strong> {disciplinaAtual.liberadoCriacao ? "Sim" : "Não"}</p>
                        <p><strong>Padrão:</strong> {disciplinaAtual.padrao}</p>
                        <p><strong>Ambiente:</strong> {disciplinaAtual.ambiente}</p>
                        {disciplinaAtual.codAVA20 && <p><strong>Código do AVA 20%:</strong> {disciplinaAtual.codAVA20}</p>}
                        {disciplinaAtual.codAVA100 && <p><strong>Código do AVA 100%:</strong> {disciplinaAtual.codAVA100}</p>}
                    </div>
                </>}
        </>
    );
}
