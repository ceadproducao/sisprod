import { useState, useEffect, useContext } from "react";
import CardPessoa from "../CardPessoa";
import styles from "./styles.module.css";
import AppContext from "../../AppContext";
import { Profissional } from "../../Interfaces";

export default function ShowPessoas({ setPanelOpen }: { setPanelOpen: Function }) {
    const { Profissionais, Disciplinas, currentUser } = useContext(AppContext);

    const [profissionaisFiltrados, setProfissionaisFiltrados] = useState<
        (Profissional & { funcoes: string[] })[]
    >([]);

    const [busca, setBusca] = useState("");
    const [filtroAtual, setFiltroAtual] = useState("");
    const cargos = [
        { valor: "Orientador(a) de Conteúdo", nome: "Orientadores de Conteúdo" },
        { valor: "Conteudista", nome: "Conteudistas" },
        { valor: "Validador(a)", nome: "Validadores" },
        { valor: "Entrevistador(a) de VideoCast", nome: "Entrevistadores de VideoCast" },
        { valor: "Apresentador(a) de Video", nome: "Apresentadores de Video" },
        { valor: "Convidado(a) de VideoCast", nome: "Convidados de VideoCast" }
    ]
    // Recalcula as funções de cada profissional toda vez que Profissionais ou Disciplinas mudam
    useEffect(() => {
        const listaComFuncoes = Profissionais.map(pessoa => {
            const funcoesTemp: string[] = [];

            Disciplinas.forEach(disciplina => {
                disciplina.orientadores.forEach(x => {
                    if (x.nome === pessoa.nome) {
                        funcoesTemp.push("Orientador(a) de Conteúdo");
                    }
                });
                disciplina.topicos.forEach(x => {
                    if (x.conteudistas.some(c => c.nome === pessoa.nome)) {
                        funcoesTemp.push("Conteudista");
                    }
                    if (x.validadores.some(v => v.nome === pessoa.nome)) {
                        funcoesTemp.push("Validador(a)");
                    }
                    x.videos.forEach(y => {
                        if (y.apresentador.some(a => a.nome === pessoa.nome)) {
                            funcoesTemp.push(y.tipo === "Videocast" ? "Entrevistador(a) de VideoCast" : "Apresentador(a) de Video");
                        }
                        if (y.convidado.some(c => c.nome === pessoa.nome)) {
                            funcoesTemp.push("Convidado(a) de VideoCast");
                        }
                    });
                });
            });

            return { ...pessoa, funcoes: funcoesTemp };
        });

        setProfissionaisFiltrados(listaComFuncoes);

    }, [Disciplinas, Profissionais]);

    // Filtro aplicado sempre baseado no array completo já atualizado
    const profissionaisExibidos = profissionaisFiltrados.filter(p =>
        (filtroAtual ? p.funcoes.includes(filtroAtual) : true) &&
        p.nome.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        Profissionais.length > 0 ? (
            <div className={styles.pessoalTecnico}>
                <h1 style={{ marginBottom: 0 }}>Profissionais</h1>
                <div style={{ display: "flex", flexDirection: 'row-reverse' }}>
                    {currentUser?.admin && <div className={styles.filtros} style={{ padding: 20, justifyContent: 'center' }}>
                        <button className={styles.btn} onClick={() => setPanelOpen(true)}>Adicionar Profissional</button>
                    </div>}
                    <div className={styles.filtros}>
                        <input type="text" placeholder="Buscar" id="busca" value={busca} onChange={(e) => setBusca(e.target.value)} className={styles.busca} />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <p style={{ margin: 5 }}>Filtros:</p>
                            <button onClick={() => setFiltroAtual("")} style={{ margin: 10, flex: 1 }} className={styles.btn} disabled={filtroAtual == ""}>Todos</button>
                            {cargos.map(cargo => <button style={{ margin: 10 }} key={cargo.valor} className={styles.btn} onClick={() => setFiltroAtual(cargo.valor)} disabled={filtroAtual == cargo.valor}>{cargo.nome}</button>)}
                        </div>
                    </div>
                </div>
                {profissionaisExibidos.length > 0 ? (
                    <div className={styles.profissionais}>
                        {profissionaisExibidos.map((profissional) => (
                            <CardPessoa key={profissional.id} pessoa={profissional} />
                        ))}
                    </div>
                ) : (
                    <p>Nenhum profissional encontrado.</p>
                )}
            </div>
        ) : (
            <h2>Carregando...</h2>
        )
    );
}
