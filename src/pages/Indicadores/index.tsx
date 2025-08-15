import styles from './styles.module.css';
import { Menu, Header, Visualizador } from '../../components';
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';
import AppContext from '../../AppContext';
import { getInfo } from '../../App';
import { Disciplina, Topico, Video } from '../../Interfaces';

interface Indicador {
    titulo: string;
    quantidade: number;
    aoVisualizar: () => void;
    filhos?: Indicador[];
}

const CardIndicador = ({ title, cor, corTexto, corBorda, valor, aoVisualizar, corTextoBotao, children, style, containerStyle }: PropsWithChildren<{ title?: string, cor?: string, corTexto?: string, corBorda?: string, valor?: any[], aoVisualizar?: Function, corTextoBotao?: string, style?: React.CSSProperties, containerStyle?: React.CSSProperties }>) => {
    return (
        <div className={styles.container} style={{ ...{ backgroundColor: cor, border: "5px solid " + corBorda, margin: 10, borderRadius: 20, padding: 10, color: corTexto ?? "black", textAlign: "center" }, ...containerStyle }}>
            {title && <h2>{title}</h2>}
            {(valor && aoVisualizar) && <>
                <p>{valor.length}</p>
                <button style={{ backgroundColor: corBorda, color: corTextoBotao }} className={styles.btn} onClick={(e) => { e.stopPropagation(); aoVisualizar(); }}>
                    Visualizar
                </button>
            </>
            }
            <div style={{ ...{ display: 'flex' }, ...style }}>
                {children}
            </div>
        </div >
    );
}

const IndicadorHierarquico = ({ titulo, quantidade, aoVisualizar, filhos = [] }: Indicador) => {
    const [aberto, setAberto] = useState(false);

    return (
        <div className={styles.indicador}>
            <div className={styles.cabecalho} onClick={() => setAberto(!aberto)}>
                <span className={styles.seta}>{filhos.length > 0 ? (aberto ? '▼' : '▶') : '•'}</span>
                <span className={styles.titulo}>{titulo}</span>
                <span className={styles.qtd}>{quantidade}</span>
                <button className={styles.btn} onClick={(e) => { e.stopPropagation(); aoVisualizar(); }}>
                    Visualizar
                </button>
            </div>
            {aberto && filhos.length > 0 && (
                <div className={styles.filhos}>
                    {filhos.map((filho, index) => (
                        <IndicadorHierarquico key={index} {...filho} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function Indicadores() {
    const { Disciplinas, setDisciplinas, setProfissionais, setTopicos, setVideos } = useContext(AppContext);
    const [orcamentoAtual, setOrcamentoAtual] = useState(new Date().getFullYear() % 100 + ((new Date().getMonth() + 1) <= 6 ? "/1" : "/2"))
    useEffect(() => {
        if (!Disciplinas) {
            getInfo(setProfissionais, setDisciplinas, setVideos, setTopicos);
        }
    }, [])
    const [disciplinasNoOrcamento, setDisciplinasNoOrcamento] = useState<Disciplina[]>([]);
    const [topicosNoOrcamento, setTopicosNoOrcamento] = useState<Topico[]>([]);
    const [videosNoOrcamento, setVideosNoOrcamento] = useState<Video[]>([]);
    const [tipoVisualizacao, setTipoVisualizacao] = useState<string>("");
    const [titleVisualizacao, setTitleVisualizacao] = useState<string>("");
    const [subtitleVisualizacao, setSubtitleVisualizacao] = useState("");
    const [listaVisualizacao, setListaVisualizacao] = useState<any[]>([]);
    useEffect(() => {
        if (orcamentoAtual != "") {
            setVideosNoOrcamento(Disciplinas.map((disciplina) => disciplina.topicos.map((topico) => topico.videos.filter((video) => video.orcamento == orcamentoAtual)).flat()).flat())
            setTopicosNoOrcamento(Disciplinas.map((disciplina) => disciplina.topicos.filter((topico) => topico.orcamento == orcamentoAtual)).flat())
            setDisciplinasNoOrcamento(Disciplinas.filter((disciplina) => (disciplina.topicos.filter((topico) => topico.orcamento == orcamentoAtual).length > 0 || disciplina.topicos.filter((topico) => topico.videos.filter((video) => video.orcamento == orcamentoAtual).length > 0).length > 0)));
        } else {
            setVideosNoOrcamento(Disciplinas.map((disciplina) => disciplina.topicos).flat().map((topico) => topico.videos).flat());
            setTopicosNoOrcamento(Disciplinas.map((disciplina) => disciplina.topicos).flat());
            setDisciplinasNoOrcamento(Disciplinas);
        }
    }, [Disciplinas, orcamentoAtual])
    const statusList = [
        "Nada", "Iniciado Contato", "Na mão", "Retorno OC", "Plágio",
        "Retorno Plágio", "Revisão", "Retorno Revisão", "Gramática", "Retorno Gramática",
        "Pronto para DTI", "Pendente Interação", "HTML Pronto", "Revisão Final",
        "Pronto", "Problema"
    ]
    const videosStatusList = [
        "Não Gravado", "Liberado OC", "Agendado", "Gravado", "Editado", "Postado", "Aguardando Gravação", "Aguardando Agendamento", "Problema"
    ]
    return (
        <div>
            <Visualizador tipo={tipoVisualizacao} title={titleVisualizacao} subtitle={subtitleVisualizacao} lista={listaVisualizacao} reset={() => {
                setTipoVisualizacao("");
                setTitleVisualizacao("");
                setSubtitleVisualizacao("");
                setListaVisualizacao([]);
            }} />
            <Menu />
            <Header />
            {Disciplinas.length > 0 ? (
                <div className={styles.container}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: "90%" }}>
                        <div style={{ display: "flex", justifyContent: 'center' }}>
                            <CardIndicador title="Finalizados" cor="#e6f4ea" corBorda='#2e7d32' containerStyle={{ flex: 1 }}>
                                <CardIndicador
                                    title="Disciplinas"
                                    cor="#f0f9f4"
                                    corBorda="#81c784"
                                    corTextoBotao='black'
                                    valor={Disciplinas.filter(
                                        (d) => d.status == "Finalizada" || d.status == "Pronta para Oferta"
                                    )}
                                    aoVisualizar={() => {
                                        setTipoVisualizacao("disciplina");
                                        setTitleVisualizacao("Disciplinas Finalizadas");
                                        setListaVisualizacao(
                                            Disciplinas.filter(
                                                (d) =>
                                                    d.status == "Finalizada" || d.status == "Pronta para Oferta"
                                            )
                                        );
                                    }}
                                />
                                <CardIndicador
                                    title="Tópicos"
                                    cor="#f0f9f4"
                                    corBorda="#81c784"
                                    corTextoBotao='black'
                                    valor={Disciplinas.map((disciplina) => disciplina.topicos.filter((topico) => ["Revisão Final", "Pronto"].includes(topico.status))).flat()}
                                    aoVisualizar={() => {
                                        setTipoVisualizacao("topico");
                                        setTitleVisualizacao("Tópicos Finalizados");
                                        setListaVisualizacao(
                                            Disciplinas.map((disciplina) => disciplina.topicos.filter((topico) => ["Revisão Final", "Pronto"].includes(topico.status))).flat()
                                        );
                                    }}
                                />
                            </CardIndicador>
                            <CardIndicador title="Em Produção" cor="#fff8e1" corBorda="#f9a825" containerStyle={{ flex: 1 }}>
                                <CardIndicador
                                    title="Disciplinas"
                                    cor="#fffde7"
                                    corBorda="#f7c040"
                                    corTextoBotao='black'
                                    valor={Disciplinas.filter(
                                        (d) => d.status == "Não Iniciada" || d.status == "Produzindo"
                                    )}
                                    aoVisualizar={() => {
                                        setTipoVisualizacao("disciplina");
                                        setTitleVisualizacao("Disciplinas Em Produção");
                                        setListaVisualizacao(
                                            Disciplinas.filter(
                                                (d) => d.status == "Não Iniciada" || d.status == "Produzindo"
                                            )
                                        );
                                    }}
                                />
                                <CardIndicador
                                    title="Tópicos"
                                    cor="#fffde7"
                                    corBorda="#f7c040"
                                    corTextoBotao='black'
                                    valor={Disciplinas.map((disciplina) =>
                                        disciplina.topicos.filter((topico) =>
                                            [
                                                "Nada", "Problema", "Iniciado Contato", "Na mão", "Retorno OC",
                                                "Plágio", "Retorno Plágio", "Revisão", "Retorno Revisão",
                                                "Gramática", "Retorno Gramática", "Pronto para DTI",
                                                "Pendente Interação", "HTML Pronto"
                                            ].includes(topico.status)
                                        )
                                    ).flat()}
                                    aoVisualizar={() => {
                                        setTipoVisualizacao("topico");
                                        setTitleVisualizacao("Tópicos Em Produção");
                                        setListaVisualizacao(
                                            Disciplinas.map((disciplina) =>
                                                disciplina.topicos.filter((topico) =>
                                                    [
                                                        "Nada", "Problema", "Iniciado Contato", "Na mão", "Retorno OC",
                                                        "Plágio", "Retorno Plágio", "Revisão", "Retorno Revisão",
                                                        "Gramática", "Retorno Gramática", "Pronto para DTI",
                                                        "Pendente Interação", "HTML Pronto"
                                                    ].includes(topico.status)
                                                )
                                            ).flat()
                                        );
                                    }}
                                />
                            </CardIndicador>
                        </div>
                        <div className={styles.container} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <CardIndicador title='Linha do Tempo de Produção (Tópicos)' cor='#fadef9' corBorda='#e0abe0' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <CardIndicador cor='#fae8f9' title='Pendentes' corBorda='#e3b6e1' corTextoBotao='black' valor={Disciplinas.map((disciplina) =>
                                    disciplina.topicos.filter((topico) =>
                                        [
                                            "Nada", "Problema"
                                        ].includes(topico.status)
                                    )
                                ).flat()} aoVisualizar={() => {
                                    setTipoVisualizacao("topico");
                                    setTitleVisualizacao("Pendentes");
                                    setSubtitleVisualizacao("Tópicos que ainda não foram iniciados ou que foram interrompidos devido a algum problema");
                                    setListaVisualizacao(Disciplinas.map((disciplina) =>
                                        disciplina.topicos.filter((topico) =>
                                            [
                                                "Nada", "Problema"
                                            ].includes(topico.status)
                                        )
                                    ).flat());
                                }} ></CardIndicador>
                                <p style={{ fontSize: 32 }}>→</p>
                                <CardIndicador cor='#fae8f9' title='No Fluxo' corBorda='#e3b6e1' corTextoBotao='black' valor={Disciplinas.map((disciplina) =>
                                    disciplina.topicos.filter((topico) =>
                                        [
                                            "Iniciado Contato", "Na mão", "Retorno OC",
                                            "Plágio", "Retorno Plágio",
                                        ].includes(topico.status)
                                    )
                                ).flat()} aoVisualizar={() => {
                                    setTipoVisualizacao("topico");
                                    setTitleVisualizacao("No Fluxo");
                                    setSubtitleVisualizacao("Tópicos que estão nos estágios iniciais da produção")
                                    setListaVisualizacao(Disciplinas.map((disciplina) =>
                                        disciplina.topicos.filter((topico) =>
                                            [
                                                "Iniciado Contato", "Na mão", "Retorno OC",
                                                "Plágio", "Retorno Plágio",
                                            ].includes(topico.status)
                                        )
                                    ).flat());
                                }}></CardIndicador>
                                <p style={{ fontSize: 32 }}>→</p>
                                <CardIndicador cor='#fae8f9' title='Promissores' corBorda='#e3b6e1' corTextoBotao='black' valor={Disciplinas.map((disciplina) =>
                                    disciplina.topicos.filter((topico) =>
                                        [
                                            "Revisão", "Retorno Revisão",
                                        ].includes(topico.status)
                                    )
                                ).flat()} aoVisualizar={() => {
                                    setTipoVisualizacao("topico");
                                    setTitleVisualizacao("No Fluxo");
                                    setSubtitleVisualizacao("Tópicos que estão nos estágios iniciais da produção")
                                    setListaVisualizacao(Disciplinas.map((disciplina) =>
                                        disciplina.topicos.filter((topico) =>
                                            [
                                                "Revisão", "Retorno Revisão",
                                            ].includes(topico.status)
                                        )
                                    ).flat());
                                }}></CardIndicador>
                                <p style={{ fontSize: 32 }}>→</p>
                                <CardIndicador cor='#fae8f9' title='Gramática' corBorda='#e3b6e1' corTextoBotao='black' valor={Disciplinas.map((disciplina) =>
                                    disciplina.topicos.filter((topico) =>
                                        [
                                            "Gramática", "Retorno Gramática",
                                        ].includes(topico.status)
                                    )
                                ).flat()} aoVisualizar={() => {
                                    setTipoVisualizacao("topico");
                                    setTitleVisualizacao("No Fluxo");
                                    setSubtitleVisualizacao("Tópicos que estão nos estágios iniciais da produção")
                                    setListaVisualizacao(Disciplinas.map((disciplina) =>
                                        disciplina.topicos.filter((topico) =>
                                            [
                                                "Gramática", "Retorno Gramática",
                                            ].includes(topico.status)
                                        )
                                    ).flat());
                                }}></CardIndicador>
                                <p style={{ fontSize: 32 }}>→</p>
                                <CardIndicador cor='#fae8f9' title='Preparados' corBorda='#e3b6e1' corTextoBotao='black' valor={Disciplinas.map((disciplina) =>
                                    disciplina.topicos.filter((topico) =>
                                        [
                                            "Pronto para DTI", "Pendente Interação", "HTML Pronto"
                                        ].includes(topico.status)
                                    )
                                ).flat()} aoVisualizar={() => {
                                    setTipoVisualizacao("topico");
                                    setTitleVisualizacao("No Fluxo");
                                    setSubtitleVisualizacao("Tópicos que estão nos estágios iniciais da produção")
                                    setListaVisualizacao(Disciplinas.map((disciplina) =>
                                        disciplina.topicos.filter((topico) =>
                                            [
                                                "Pronto para DTI", "Pendente Interação", "HTML Pronto"
                                            ].includes(topico.status)
                                        )
                                    ).flat());
                                }}></CardIndicador>
                                <p style={{ fontSize: 32 }}>→</p>
                                <CardIndicador cor='#fae8f9' title='Prontos' corBorda='#e3b6e1' corTextoBotao='black' valor={Disciplinas.map((disciplina) =>
                                    disciplina.topicos.filter((topico) =>
                                        [
                                            "Revisão Final", "Pronto"
                                        ].includes(topico.status)
                                    )
                                ).flat()} aoVisualizar={() => {
                                    setTipoVisualizacao("topico");
                                    setTitleVisualizacao("No Fluxo");
                                    setSubtitleVisualizacao("Tópicos que estão nos estágios iniciais da produção")
                                    setListaVisualizacao(Disciplinas.map((disciplina) =>
                                        disciplina.topicos.filter((topico) =>
                                            [
                                                "Revisão Final", "Pronto"
                                            ].includes(topico.status)
                                        )
                                    ).flat());
                                }}></CardIndicador>
                            </CardIndicador>
                        </div>
                        <div style={{ display: "flex", justifyContent: 'center' }}>
                            <CardIndicador title="Crítico (Pendentes)" cor="#f5cece" corBorda='#e88787' containerStyle={{ flex: 1 }}>
                                <CardIndicador
                                    title="Não iniciadas"
                                    cor="#fff0f0"
                                    corBorda="#e3a3a3"
                                    corTextoBotao='black'
                                    valor={Disciplinas.map((disciplina) => disciplina.topicos.filter((topico) => ["Nada"].includes(topico.status))).flat()}
                                    aoVisualizar={() => {
                                        setTipoVisualizacao("topico");
                                        setTitleVisualizacao("Não iniciadas");
                                        setListaVisualizacao(
                                            Disciplinas.map((disciplina) => disciplina.topicos.filter((topico) => ["Nada"].includes(topico.status))).flat()
                                        );
                                    }}
                                />
                                <CardIndicador
                                    title="Problemas"
                                    cor="#fff0f0"
                                    corBorda="#e3a3a3"
                                    corTextoBotao='black'
                                    valor={Disciplinas.map((disciplina) => disciplina.topicos.filter((topico) => ["Problema"].includes(topico.status))).flat()}
                                    aoVisualizar={() => {
                                        setTipoVisualizacao("topico");
                                        setTitleVisualizacao("Problemas");
                                        setListaVisualizacao(
                                            Disciplinas.map((disciplina) => disciplina.topicos.filter((topico) => ["Problema"].includes(topico.status))).flat()
                                        );
                                    }}
                                />
                            </CardIndicador>
                            <CardIndicador title="Foco (No Fluxo)" cor="#edd5be" corBorda="#c9a98b" containerStyle={{ flex: 1 }}>
                                <CardIndicador
                                    title="Iniciado Contato"
                                    cor="#f7ebdf"
                                    corBorda="#dbb693"
                                    corTextoBotao='black'
                                    valor={Disciplinas.map((disciplina) =>
                                        disciplina.topicos.filter((topico) =>
                                            [
                                                "Iniciado Contato"
                                            ].includes(topico.status)
                                        )
                                    ).flat()}
                                    aoVisualizar={() => {
                                        setTipoVisualizacao("topico");
                                        setTitleVisualizacao("Iniciado Contato");
                                        setListaVisualizacao(
                                            Disciplinas.map((disciplina) =>
                                                disciplina.topicos.filter((topico) =>
                                                    [
                                                        "Iniciado Contato"
                                                    ].includes(topico.status)
                                                )
                                            ).flat()
                                        );
                                    }}
                                />
                                <CardIndicador
                                    title="Na mão"
                                    cor="#f7ebdf"
                                    corBorda="#dbb693"
                                    corTextoBotao='black'
                                    valor={Disciplinas.map((disciplina) =>
                                        disciplina.topicos.filter((topico) =>
                                            [
                                                "Na mão"
                                            ].includes(topico.status)
                                        )
                                    ).flat()}
                                    aoVisualizar={() => {
                                        setTipoVisualizacao("topico");
                                        setTitleVisualizacao("Na mão");
                                        setListaVisualizacao(
                                            Disciplinas.map((disciplina) =>
                                                disciplina.topicos.filter((topico) =>
                                                    [
                                                        "Na mão"
                                                    ].includes(topico.status)
                                                )
                                            ).flat()
                                        );
                                    }}
                                />
                                <CardIndicador
                                    title="Retorno OC"
                                    cor="#f7ebdf"
                                    corBorda="#dbb693"
                                    corTextoBotao='black'
                                    valor={Disciplinas.map((disciplina) =>
                                        disciplina.topicos.filter((topico) =>
                                            [
                                                "Retorno OC"
                                            ].includes(topico.status)
                                        )
                                    ).flat()}
                                    aoVisualizar={() => {
                                        setTipoVisualizacao("topico");
                                        setTitleVisualizacao("Retorno OC");
                                        setListaVisualizacao(
                                            Disciplinas.map((disciplina) =>
                                                disciplina.topicos.filter((topico) =>
                                                    [
                                                        "Retorno OC"
                                                    ].includes(topico.status)
                                                )
                                            ).flat()
                                        );
                                    }}
                                />
                                <CardIndicador
                                    title="Plágio"
                                    cor="#f7ebdf"
                                    corBorda="#dbb693"
                                    corTextoBotao='black'
                                    valor={Disciplinas.map((disciplina) =>
                                        disciplina.topicos.filter((topico) =>
                                            [
                                                "Plágio"
                                            ].includes(topico.status)
                                        )
                                    ).flat()}
                                    aoVisualizar={() => {
                                        setTipoVisualizacao("topico");
                                        setTitleVisualizacao("Plágio");
                                        setListaVisualizacao(
                                            Disciplinas.map((disciplina) =>
                                                disciplina.topicos.filter((topico) =>
                                                    [
                                                        "Plágio"
                                                    ].includes(topico.status)
                                                )
                                            ).flat()
                                        );
                                    }}
                                />
                                <CardIndicador
                                    title="Retorno Plágio"
                                    cor="#f7ebdf"
                                    corBorda="#dbb693"
                                    corTextoBotao='black'
                                    valor={Disciplinas.map((disciplina) =>
                                        disciplina.topicos.filter((topico) =>
                                            [
                                                "Retorno Plágio"
                                            ].includes(topico.status)
                                        )
                                    ).flat()}
                                    aoVisualizar={() => {
                                        setTipoVisualizacao("topico");
                                        setTitleVisualizacao("Retorno Plágio");
                                        setListaVisualizacao(
                                            Disciplinas.map((disciplina) =>
                                                disciplina.topicos.filter((topico) =>
                                                    [
                                                        "Retorno Plágio"
                                                    ].includes(topico.status)
                                                )
                                            ).flat()
                                        );
                                    }}
                                />
                            </CardIndicador>
                        </div>
                        <div className={styles.container} style={{ backgroundColor: "#d2c8e6", border: "5px solid var(--Roxo)", borderRadius: 30, flex: 1 }}>
                            <h2>Orçamento</h2>
                            <div id='orcamento' className={styles.qtdsTxt}>
                                <p style={{ margin: 5 }}>Orçamento atual:</p>
                                <input style={{ margin: 5 }} type="text" value={orcamentoAtual} onChange={(e) => setOrcamentoAtual(e.target.value)} />
                            </div>
                            <div className={styles.containerHierarquico}>
                                <IndicadorHierarquico titulo='Disciplinas no orçamento' quantidade={disciplinasNoOrcamento.length} aoVisualizar={() => {
                                    setTipoVisualizacao("disciplina");
                                    setTitleVisualizacao("Disciplinas no orçamento");
                                    setListaVisualizacao(disciplinasNoOrcamento)
                                }} filhos={[
                                    {
                                        titulo: "Disciplinas Prontas",
                                        quantidade: disciplinasNoOrcamento.filter(d => d.status == "Finalizada" || d.status == "Pronta para Oferta").length,
                                        aoVisualizar: () => {
                                            setTipoVisualizacao("disciplina");
                                            setTitleVisualizacao("Disciplinas Prontas no Orçamento");
                                            setListaVisualizacao(disciplinasNoOrcamento.filter(d => d.status == "Finalizada" || d.status == "Pronta para Oferta"));
                                        }
                                    },
                                    {
                                        titulo: "Disciplinas Em Produção",
                                        quantidade: disciplinasNoOrcamento.filter(d => d.status != "Finalizada" && d.status != "Pronta para Oferta").length,
                                        aoVisualizar: () => {
                                            setTipoVisualizacao("disciplina");
                                            setTitleVisualizacao("Disciplinas Em Produção no Orçamento");
                                            setListaVisualizacao(disciplinasNoOrcamento.filter(d => d.status != "Finalizada" && d.status != "Pronta para Oferta"));
                                        }
                                    }
                                ]} />
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div className={styles.containerHierarquico}>
                                    <IndicadorHierarquico
                                        titulo="Tópicos no orçamento"
                                        quantidade={topicosNoOrcamento.length}
                                        aoVisualizar={() => {
                                            setTipoVisualizacao("topico");
                                            setTitleVisualizacao("Tópicos no orçamento");
                                            setListaVisualizacao(topicosNoOrcamento);
                                        }}
                                        filhos={[
                                            {
                                                titulo: "Tópicos finalizados",
                                                quantidade: topicosNoOrcamento.filter((topico) =>
                                                    ["Pronto"].includes(topico.status)
                                                ).length,
                                                aoVisualizar: () => {
                                                    setTipoVisualizacao("topico");
                                                    setTitleVisualizacao("Tópicos finalizados");
                                                    setSubtitleVisualizacao('Tópicos com status "Pronto"')
                                                    setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                        ["Pronto"].includes(topico.status)
                                                    ));
                                                }
                                            },
                                            {
                                                titulo: "Tópicos não finalizados",
                                                quantidade: topicosNoOrcamento.filter((topico) =>
                                                    !["Pronto"].includes(topico.status)
                                                ).length,
                                                aoVisualizar: () => {
                                                    setTipoVisualizacao("topico");
                                                    setTitleVisualizacao("Tópicos não finalizados");
                                                    setSubtitleVisualizacao('Tópicos sem status "Pronto"')
                                                    setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                        ["Nada", "Problema", "Iniciado Contato", "Na mão", "Retorno OC", "Plágio", "Retorno Plágio", "Revisão", "Retorno Revisão", "Gramática", "Retorno Gramática", "Pronto para DTI", "Pendente Interação", "HTML Pronto", "Revisão Final"].includes(topico.status)
                                                    ));
                                                },
                                                filhos: [{
                                                    titulo: "Com produção pronta",
                                                    quantidade: topicosNoOrcamento.filter((topico) =>
                                                        ["Revisão Final"].includes(topico.status)
                                                    ).length,
                                                    aoVisualizar: () => {
                                                        setTipoVisualizacao("topico");
                                                        setTitleVisualizacao("Com produção pronta");
                                                        setSubtitleVisualizacao("Falta apenas revisão - Já tem condições de oferta")
                                                        setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                            ["Revisão Final"].includes(topico.status)
                                                        ));
                                                    }
                                                },
                                                {
                                                    titulo: "Sem produção pronta",
                                                    quantidade: topicosNoOrcamento.filter((topico) =>
                                                        ["Nada", "Problema", "Iniciado Contato", "Na mão", "Retorno OC", "Plágio", "Retorno Plágio", "Revisão", "Retorno Revisão", "Gramática", "Retorno Gramática", "Pronto para DTI", "Pendente Interação", "HTML Pronto"].includes(topico.status)
                                                    ).length,
                                                    aoVisualizar: () => {
                                                        setTipoVisualizacao("topico");
                                                        setTitleVisualizacao("Sem produção pronta");
                                                        setSubtitleVisualizacao("Está em processo de produção - Ainda sem condições de oferta")
                                                        setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                            ["Nada", "Problema", "Iniciado Contato", "Na mão", "Retorno OC", "Plágio", "Retorno Plágio", "Revisão", "Retorno Revisão", "Gramática", "Retorno Gramática", "Pronto para DTI", "Pendente Interação", "HTML Pronto"].includes(topico.status)
                                                        ));
                                                    },
                                                    filhos: [
                                                        {
                                                            titulo: "Com pagamento liberado",
                                                            quantidade: topicosNoOrcamento.filter((topico) =>
                                                                ["Gramática", "Retorno Gramática", "Pronto para DTI", "Pendente Interação", "HTML Pronto"].includes(topico.status)
                                                            ).length,
                                                            aoVisualizar: () => {
                                                                setTipoVisualizacao("topico");
                                                                setTitleVisualizacao("Com pagamento liberado");
                                                                setSubtitleVisualizacao("Já estão na etapa de gramática em diante, o que indica que o conteúdista pode ser pago")
                                                                setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                                    ["Gramática", "Retorno Gramática", "Pronto para DTI", "Pendente Interação", "HTML Pronto"].includes(topico.status)
                                                                ));
                                                            },
                                                            filhos: [
                                                                {
                                                                    titulo: "Faltam carga (Pronto para DTI em diante)",
                                                                    quantidade: topicosNoOrcamento.filter((topico) =>
                                                                        ["Pronto para DTI", "Pendente Interação", "HTML Pronto"].includes(topico.status)
                                                                    ).length,
                                                                    aoVisualizar: () => {
                                                                        setTipoVisualizacao("topico");
                                                                        setTitleVisualizacao("Faltam carga");
                                                                        setSubtitleVisualizacao("Ainda precisa adicionar algo no AVA, podendo ser tanto a lição quanto algum dos outros recursos")
                                                                        setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                                            ["Pronto para DTI", "Pendente Interação", "HTML Pronto"].includes(topico.status)
                                                                        ));
                                                                    }
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            titulo: "Com pagamento a ser analisado",
                                                            quantidade: topicosNoOrcamento.filter((topico) =>
                                                                ["Nada", "Problema", "Iniciado Contato", "Na mão", "Retorno OC", "Plágio", "Retorno Plágio", "Revisão", "Retorno Revisão"].includes(topico.status)
                                                            ).length,
                                                            aoVisualizar: () => {
                                                                setTipoVisualizacao("topico");
                                                                setTitleVisualizacao("Com pagamento a ser analisado");
                                                                setSubtitleVisualizacao("Ainda não chegaram a etapa de gramática, indicando que o pagamento ainda não está disponibilizado")
                                                                setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                                    ["Nada", "Problema", "Iniciado Contato", "Na mão", "Retorno OC", "Plágio", "Retorno Plágio", "Revisão", "Retorno Revisão"].includes(topico.status)
                                                                ));
                                                            },
                                                            filhos: [
                                                                {
                                                                    titulo: "Com potencial de cumprimento de meta",
                                                                    quantidade: topicosNoOrcamento.filter((topico) =>
                                                                        ["Revisão", "Retorno Revisão"].includes(topico.status)
                                                                    ).length,
                                                                    aoVisualizar: () => {
                                                                        setTipoVisualizacao("topico");
                                                                        setTitleVisualizacao("Com potencial de cumprimento de meta");
                                                                        setSubtitleVisualizacao("Está na etapa de VT, o que indica que há há um potencial de cumprimento da meta nesses tópicos")
                                                                        setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                                            ["Revisão", "Retorno Revisão"].includes(topico.status)
                                                                        ));
                                                                    },
                                                                },
                                                                {
                                                                    titulo: "Com potencial de NÃO cumprimento de meta",
                                                                    quantidade: topicosNoOrcamento.filter((topico) =>
                                                                        ["Nada", "Problema", "Iniciado Contato", "Na mão", "Retorno OC", "Plágio", "Retorno Plágio"].includes(topico.status)
                                                                    ).length,
                                                                    aoVisualizar: () => {
                                                                        setTipoVisualizacao("topico");
                                                                        setTitleVisualizacao("Com potencial de NÃO cumprimento de meta");
                                                                        setSubtitleVisualizacao("Ainda não chegaram na Etapa de VT, o que indica que tem possibilidade de não cumprimento da meta nesses tópicos")
                                                                        setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                                            ["Nada", "Problema", "Iniciado Contato", "Na mão", "Retorno OC", "Plágio", "Retorno Plágio"].includes(topico.status)
                                                                        ));
                                                                    },
                                                                    filhos: [
                                                                        {
                                                                            titulo: "Tópicos Crítico",
                                                                            quantidade: topicosNoOrcamento.filter((topico) =>
                                                                                ["Problema", "Nada"].includes(topico.status)
                                                                            ).length,
                                                                            aoVisualizar: () => {
                                                                                setTipoVisualizacao("topico");
                                                                                setTitleVisualizacao("Tópicos Crítico");
                                                                                setSubtitleVisualizacao("Indicam os tópicos que ainda não iniciaram a produção")
                                                                                setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                                                    ["Problema", "Nada"].includes(topico.status)
                                                                                ));
                                                                            },
                                                                            filhos: [
                                                                                {
                                                                                    titulo: "Não iniciados",
                                                                                    quantidade: topicosNoOrcamento.filter((topico) =>
                                                                                        ["Nada"].includes(topico.status)
                                                                                    ).length,
                                                                                    aoVisualizar: () => {
                                                                                        setTipoVisualizacao("topico");
                                                                                        setTitleVisualizacao("Não iniciados");
                                                                                        setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                                                            ["Nada"].includes(topico.status)
                                                                                        ));
                                                                                    },
                                                                                },
                                                                                {
                                                                                    titulo: "Problemas",
                                                                                    quantidade: topicosNoOrcamento.filter((topico) =>
                                                                                        ["Problema"].includes(topico.status)
                                                                                    ).length,
                                                                                    aoVisualizar: () => {
                                                                                        setTipoVisualizacao("topico");
                                                                                        setTitleVisualizacao("Problemas");
                                                                                        setSubtitleVisualizacao("Indicam os tópicos que não iniciaram ou tiveram que ser interrompidos devido a problemas")
                                                                                        setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                                                            ["Problema"].includes(topico.status)
                                                                                        ));
                                                                                    },
                                                                                    filhos: [
                                                                                        {
                                                                                            titulo: "Captação",
                                                                                            quantidade: topicosNoOrcamento.filter((topico) =>
                                                                                                ["Captação"].includes(topico.catProblemaLicao)
                                                                                            ).length,
                                                                                            aoVisualizar: () => {
                                                                                                setTipoVisualizacao("topico");
                                                                                                setTitleVisualizacao("Captação");
                                                                                                setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                                                                    ["Captação"].includes(topico.catProblemaLicao)
                                                                                                ));
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            titulo: "Contratos",
                                                                                            quantidade: topicosNoOrcamento.filter((topico) =>
                                                                                                ["Contratos"].includes(topico.catProblemaLicao)
                                                                                            ).length,
                                                                                            aoVisualizar: () => {
                                                                                                setTipoVisualizacao("topico");
                                                                                                setTitleVisualizacao("Contratos");
                                                                                                setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                                                                    ["Contratos"].includes(topico.catProblemaLicao)
                                                                                                ));
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            titulo: "Produção",
                                                                                            quantidade: topicosNoOrcamento.filter((topico) =>
                                                                                                ["Produção"].includes(topico.catProblemaLicao)
                                                                                            ).length,
                                                                                            aoVisualizar: () => {
                                                                                                setTipoVisualizacao("topico");
                                                                                                setTitleVisualizacao("Produção");
                                                                                                setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                                                                    ["Produção"].includes(topico.catProblemaLicao)
                                                                                                ));
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            titulo: "Validação",
                                                                                            quantidade: topicosNoOrcamento.filter((topico) =>
                                                                                                ["Validação"].includes(topico.catProblemaLicao)
                                                                                            ).length,
                                                                                            aoVisualizar: () => {
                                                                                                setTipoVisualizacao("topico");
                                                                                                setTitleVisualizacao("Validação");
                                                                                                setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                                                                    ["Validação"].includes(topico.catProblemaLicao)
                                                                                                ));
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            titulo: "Resolvido",
                                                                                            quantidade: topicosNoOrcamento.filter((topico) =>
                                                                                                ["Resolvido"].includes(topico.catProblemaLicao)
                                                                                            ).length,
                                                                                            aoVisualizar: () => {
                                                                                                setTipoVisualizacao("topico");
                                                                                                setTitleVisualizacao("Resolvido");
                                                                                                setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                                                                    ["Resolvido"].includes(topico.catProblemaLicao)
                                                                                                ));
                                                                                            },
                                                                                        },
                                                                                    ]
                                                                                },
                                                                            ]
                                                                        },
                                                                        {
                                                                            titulo: "Tópicos Foco",
                                                                            quantidade: topicosNoOrcamento.filter((topico) =>
                                                                                ["Iniciado Contato", "Na mão", "Retorno OC", "Plágio", "Retorno Plágio"].includes(topico.status)
                                                                            ).length,
                                                                            aoVisualizar: () => {
                                                                                setTipoVisualizacao("topico");
                                                                                setTitleVisualizacao("Tópicos Foco");
                                                                                setSubtitleVisualizacao("Indicam os tópicos que estão no fluxo de produção")
                                                                                setListaVisualizacao(topicosNoOrcamento.filter((topico) =>
                                                                                    ["Na mão", "Retorno OC", "Plágio", "Retorno Plágio"].includes(topico.status)
                                                                                ));
                                                                            },
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }]
                                            }
                                        ]}
                                    />
                                </div>
                                <div className={styles.containerHierarquico}>
                                    <IndicadorHierarquico
                                        titulo="Vídeos no orçamento"
                                        quantidade={videosNoOrcamento.length}
                                        aoVisualizar={() => {
                                            setTipoVisualizacao("video");
                                            setTitleVisualizacao("Vídeos no orçamento");
                                            setListaVisualizacao(videosNoOrcamento);
                                        }}
                                        filhos={[{
                                            titulo: "Vídeos finalizados",
                                            quantidade: videosNoOrcamento.filter((video) => video.status == "Postado").length,
                                            aoVisualizar: () => {
                                                setTipoVisualizacao("video");
                                                setTitleVisualizacao("Vídeos finalizados");
                                                setListaVisualizacao(videosNoOrcamento.filter((video) => video.status == "Postado"));
                                            }
                                        },
                                        {
                                            titulo: "Vídeos não finalizados",
                                            quantidade: videosNoOrcamento.filter((video) => video.status !== "Postado").length,
                                            aoVisualizar: () => {
                                                setTipoVisualizacao("video");
                                                setTitleVisualizacao("Vídeos não finalizados");
                                                setListaVisualizacao(videosNoOrcamento.filter((video) => video.status !== "Postado"));
                                            },
                                            filhos: [
                                                {
                                                    titulo: "Com produção pronta (Falta revisão)",
                                                    quantidade: videosNoOrcamento.filter((video) => video.status === "Postado").length,
                                                    aoVisualizar: () => {
                                                        setTipoVisualizacao("video");
                                                        setTitleVisualizacao("Com produção pronta");
                                                        setListaVisualizacao(videosNoOrcamento.filter((video) => video.status === "Postado"));
                                                    }
                                                },
                                                {
                                                    titulo: "Sem produção pronta",
                                                    quantidade: videosNoOrcamento.filter((video) => video.status !== "Postado").length,
                                                    aoVisualizar: () => {
                                                        setTipoVisualizacao("video");
                                                        setTitleVisualizacao("Sem produção pronta");
                                                        setListaVisualizacao(videosNoOrcamento.filter((video) => video.status !== "Postado"));
                                                    },
                                                    filhos: [
                                                        {
                                                            titulo: "Com pagamento liberado",
                                                            quantidade: videosNoOrcamento.filter((video) =>
                                                                ["Editado", "Postado"].includes(video.status)
                                                            ).length,
                                                            aoVisualizar: () => {
                                                                setTipoVisualizacao("video");
                                                                setTitleVisualizacao("Com pagamento liberado");
                                                                setListaVisualizacao(videosNoOrcamento.filter((video) =>
                                                                    ["Editado", "Postado"].includes(video.status)
                                                                ));
                                                            }
                                                        },
                                                        {
                                                            titulo: "Com pagamento a ser analisado",
                                                            quantidade: videosNoOrcamento.filter((video) =>
                                                                ["Problema", "Não Gravado", "Liberado OC", "Agendado", "Gravado", "Aguardando Gravação", "Aguardando Agendamento", "Alerta Agendamento"].includes(video.status)
                                                            ).length,
                                                            aoVisualizar: () => {
                                                                setTipoVisualizacao("video");
                                                                setTitleVisualizacao("Com pagamento a ser analisado");
                                                                setListaVisualizacao(videosNoOrcamento.filter((video) =>
                                                                    ["Problema", "Não Gravado", "Liberado OC", "Agendado", "Gravado", "Aguardando Gravação", "Aguardando Agendamento", "Alerta Agendamento"].includes(video.status)
                                                                ));
                                                            },
                                                            filhos: [
                                                                {
                                                                    titulo: "Vídeos gravados",
                                                                    quantidade: videosNoOrcamento.filter((video) =>
                                                                        ["Gravado"].includes(video.status)
                                                                    ).length,
                                                                    aoVisualizar: () => {
                                                                        setTipoVisualizacao("video");
                                                                        setTitleVisualizacao("Vídeos gravados");
                                                                        setListaVisualizacao(videosNoOrcamento.filter((video) =>
                                                                            ["Gravado"].includes(video.status)
                                                                        ));
                                                                    }
                                                                },
                                                                {
                                                                    titulo: "Vídeos agendados",
                                                                    quantidade: videosNoOrcamento.filter((video) =>
                                                                        ["Agendado", "Aguardando Gravação"].includes(video.status)
                                                                    ).length,
                                                                    aoVisualizar: () => {
                                                                        setTipoVisualizacao("video");
                                                                        setTitleVisualizacao("Vídeos agendados");
                                                                        setListaVisualizacao(videosNoOrcamento.filter((video) =>
                                                                            ["Agendado", "Aguardando Gravação"].includes(video.status)
                                                                        ));
                                                                    }
                                                                },
                                                                {
                                                                    titulo: "Vídeos não agendados",
                                                                    quantidade: videosNoOrcamento.filter((video) =>
                                                                        ["Problema", "Não Gravado", "Liberado OC", "Aguardando Agendamento", "Alerta Agendamento"].includes(video.status)
                                                                    ).length,
                                                                    aoVisualizar: () => {
                                                                        setTipoVisualizacao("video");
                                                                        setTitleVisualizacao("Vídeos não agendados");
                                                                        setListaVisualizacao(videosNoOrcamento.filter((video) =>
                                                                            ["Problema", "Não Gravado", "Liberado OC", "Aguardando Agendamento", "Alerta Agendamento"].includes(video.status)
                                                                        ));
                                                                    },
                                                                    filhos: [
                                                                        {
                                                                            titulo: "Crítico",
                                                                            quantidade: videosNoOrcamento.filter((video) =>
                                                                                ["Problema", "Não Gravado", "Alerta Agendamento"].includes(video.status)
                                                                            ).length,
                                                                            aoVisualizar: () => {
                                                                                setTipoVisualizacao("video");
                                                                                setTitleVisualizacao("Vídeos Crítico");
                                                                                setListaVisualizacao(videosNoOrcamento.filter((video) =>
                                                                                    ["Problema", "Não Gravado", "Alerta Agendamento"].includes(video.status)
                                                                                ));
                                                                            },
                                                                            filhos: [
                                                                                {
                                                                                    titulo: "Problema",
                                                                                    quantidade: videosNoOrcamento.filter((video) => video.status === "Problema").length,
                                                                                    aoVisualizar: () => {
                                                                                        setTipoVisualizacao("video");
                                                                                        setTitleVisualizacao("Problema");
                                                                                        setListaVisualizacao(videosNoOrcamento.filter((video) => video.status === "Problema"));
                                                                                    },
                                                                                    filhos: [
                                                                                        {
                                                                                            titulo: "Captação",
                                                                                            quantidade: videosNoOrcamento.filter((video) => video.catProblema === "Captação").length,
                                                                                            aoVisualizar: () => {
                                                                                                setTipoVisualizacao("video");
                                                                                                setTitleVisualizacao("Captação");
                                                                                                setListaVisualizacao(videosNoOrcamento.filter((video) => video.catProblema === "Captação"));
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            titulo: "Contratos",
                                                                                            quantidade: videosNoOrcamento.filter((video) => video.catProblema === "Contratos").length,
                                                                                            aoVisualizar: () => {
                                                                                                setTipoVisualizacao("video");
                                                                                                setTitleVisualizacao("Contratos");
                                                                                                setListaVisualizacao(videosNoOrcamento.filter((video) => video.catProblema === "Contratos"));
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            titulo: "Agendamento",
                                                                                            quantidade: videosNoOrcamento.filter((video) => video.catProblema === "Agendamento").length,
                                                                                            aoVisualizar: () => {
                                                                                                setTipoVisualizacao("video");
                                                                                                setTitleVisualizacao("Agendamento");
                                                                                                setListaVisualizacao(videosNoOrcamento.filter((video) => video.catProblema === "Agendamento"));
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            titulo: "Gravação",
                                                                                            quantidade: videosNoOrcamento.filter((video) => video.catProblema === "Gravação").length,
                                                                                            aoVisualizar: () => {
                                                                                                setTipoVisualizacao("video");
                                                                                                setTitleVisualizacao("Gravação");
                                                                                                setListaVisualizacao(videosNoOrcamento.filter((video) => video.catProblema === "Gravação"));
                                                                                            }
                                                                                        },
                                                                                        {
                                                                                            titulo: "Edição",
                                                                                            quantidade: videosNoOrcamento.filter((video) => video.catProblema === "Edição").length,
                                                                                            aoVisualizar: () => {
                                                                                                setTipoVisualizacao("video");
                                                                                                setTitleVisualizacao("Edição");
                                                                                                setListaVisualizacao(videosNoOrcamento.filter((video) => video.catProblema === "Edição"));
                                                                                            }
                                                                                        }
                                                                                    ]
                                                                                },
                                                                                {
                                                                                    titulo: "Não iniciado",
                                                                                    quantidade: videosNoOrcamento.filter((video) => video.status === "Não Gravado").length,
                                                                                    aoVisualizar: () => {
                                                                                        setTipoVisualizacao("video");
                                                                                        setTitleVisualizacao("Não iniciado");
                                                                                        setListaVisualizacao(videosNoOrcamento.filter((video) => video.status === "Não Gravado"));
                                                                                    }
                                                                                }
                                                                            ]
                                                                        },
                                                                        {
                                                                            titulo: "Foco",
                                                                            quantidade: videosNoOrcamento.filter((video) =>
                                                                                ["Liberado OC", "Aguardando Agendamento"].includes(video.status)
                                                                            ).length,
                                                                            aoVisualizar: () => {
                                                                                setTipoVisualizacao("video");
                                                                                setTitleVisualizacao("Vídeos Foco");
                                                                                setListaVisualizacao(videosNoOrcamento.filter((video) =>
                                                                                    ["Liberado OC", "Aguardando Agendamento"].includes(video.status)
                                                                                ));
                                                                            },
                                                                            filhos: [
                                                                                {
                                                                                    titulo: "Liberado OC",
                                                                                    quantidade: videosNoOrcamento.filter((video) => video.status === "Liberado OC").length,
                                                                                    aoVisualizar: () => {
                                                                                        setTipoVisualizacao("video");
                                                                                        setTitleVisualizacao("Liberado OC");
                                                                                        setListaVisualizacao(videosNoOrcamento.filter((video) => video.status === "Liberado OC"));
                                                                                    }
                                                                                },
                                                                                {
                                                                                    titulo: "Aguardando Agendamento",
                                                                                    quantidade: videosNoOrcamento.filter((video) => video.status === "Aguardando Agendamento").length,
                                                                                    aoVisualizar: () => {
                                                                                        setTipoVisualizacao("video");
                                                                                        setTitleVisualizacao("Aguardando Agendamento");
                                                                                        setListaVisualizacao(videosNoOrcamento.filter((video) => video.status === "Aguardando Agendamento"));
                                                                                    }
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }]}
                                    />
                                </div>
                            </div>
                            <div className={styles.tabelasQtds}>
                                <div id='qtdsTopicos' style={{ margin: 10 }}>
                                    <table className={styles.tabela}>
                                        <thead>
                                            <tr>
                                                <th colSpan={3}>Tópicos no Orçamento</th>
                                            </tr>
                                            <tr>
                                                <th>Status</th>
                                                <th colSpan={2}>Quantidade de Tópicos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statusList.map((status) => (<tr>
                                                <td>{status}</td>
                                                <td>{topicosNoOrcamento.filter((topico) => topico.status == status).length}</td>
                                                <td>
                                                    <button className={styles.btn} onClick={() => {
                                                        setTipoVisualizacao("topico");
                                                        setTitleVisualizacao(status);
                                                        setListaVisualizacao(topicosNoOrcamento.filter((topico) => topico.status == status));
                                                    }}>Visualizar</button>
                                                </td>
                                            </tr>))}
                                        </tbody>
                                        <thead>
                                            <tr>
                                                <th>Total de topicos no Orçamento</th>
                                                <td>{topicosNoOrcamento.length}</td>
                                                <td>
                                                    <button className={styles.btn} onClick={() => {
                                                        setTipoVisualizacao("topico");
                                                        setTitleVisualizacao("Total de topicos no Orçamento");
                                                        setListaVisualizacao(topicosNoOrcamento);
                                                    }}>Visualizar</button>
                                                </td>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>
                                <div id='qtdsvideos' style={{ margin: 10 }}>
                                    <table className={styles.tabela}>
                                        <thead>
                                            <tr>
                                                <th colSpan={3}>Videos no Orçamento</th>
                                            </tr>
                                            <tr>
                                                <th>Status</th>
                                                <th colSpan={2}>Quantidade de Vídeos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {videosStatusList.map((status) => (<tr>
                                                <td>{status}</td>
                                                <td>{videosNoOrcamento.filter((video) => video.status == status).length}</td>
                                                <td>
                                                    <button className={styles.btn} onClick={() => {
                                                        setTipoVisualizacao("video");
                                                        setTitleVisualizacao(status);
                                                        setListaVisualizacao(videosNoOrcamento.filter((video) => video.status == status));
                                                    }}>Visualizar</button>
                                                </td>
                                            </tr>))}
                                        </tbody>
                                        <thead>
                                            <tr>
                                                <th>Total de videos no Orçamento</th>
                                                <td>{videosNoOrcamento.length}</td>
                                                <td>
                                                    <button className={styles.btn} onClick={() => {
                                                        setTipoVisualizacao("video");
                                                        setTitleVisualizacao("Total de videos no Orçamento");
                                                        setListaVisualizacao(videosNoOrcamento);
                                                    }}>Visualizar</button>
                                                </td>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>
                            </div>
                            <div id='povPagamento' style={{ margin: 10 }}>
                                <table className={styles.tabela}>
                                    <thead>
                                        <tr>
                                            <th colSpan={7}>Estágio de pagamento:</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Tópicos com pagamento liberado</td>
                                            <td>{topicosNoOrcamento.filter((topico) =>
                                                ["Gramática", "Retorno Gramática", "Pronto para DTI", "HTML Pronto", "Revisão Final", "Pronto"].includes(topico.status)
                                            ).length}</td>
                                            <td>
                                                <button className={styles.btn} onClick={() => {
                                                    setTipoVisualizacao("topico");
                                                    setTitleVisualizacao("Tópicos com pagamento liberado");
                                                    setListaVisualizacao(topicosNoOrcamento.filter((topico) => ["Gramática", "Retorno Gramática", "Pronto para DTI", "HTML Pronto", "Revisão Final", "Pronto"].includes(topico.status)));
                                                }}>Visualizar</button>
                                            </td>
                                            <td style={{ border: 'none', padding: 10 }}></td>
                                            <td>Tópicos com pagamento em aguardo</td>
                                            <td>{topicosNoOrcamento.filter((topico) =>
                                                !["Gramática", "Retorno Gramática", "Pronto para DTI", "HTML Pronto", "Revisão Final", "Pronto"].includes(topico.status)
                                            ).length}</td>
                                            <td>
                                                <button className={styles.btn} onClick={() => {
                                                    setTipoVisualizacao("topico");
                                                    setTitleVisualizacao("Tópicos com pagamento em aguardo");
                                                    setListaVisualizacao(topicosNoOrcamento.filter((topico) => !["Gramática", "Retorno Gramática", "Pronto para DTI", "HTML Pronto", "Revisão Final", "Pronto"].includes(topico.status)));
                                                }}>Visualizar</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Vídeos com pagamento liberado</td>
                                            <td>{videosNoOrcamento.filter((video) =>
                                                ["Editado", "Postado"].includes(video.status)
                                            ).length}</td>
                                            <td>
                                                <button className={styles.btn} onClick={() => {
                                                    setTipoVisualizacao("video");
                                                    setTitleVisualizacao("Vídeos com pagamento liberado");
                                                    setListaVisualizacao(videosNoOrcamento.filter((video) => ["Editado", "Postado"].includes(video.status)));
                                                }}>Visualizar</button>
                                            </td>
                                            <td style={{ border: 'none', padding: 10 }}></td>
                                            <td>Vídeos com pagamento em aguardo</td>
                                            <td>{videosNoOrcamento.filter((video) =>
                                                !["Editado", "Postado"].includes(video.status)
                                            ).length}</td>
                                            <td>
                                                <button className={styles.btn} onClick={() => {
                                                    setTipoVisualizacao("video");
                                                    setTitleVisualizacao("Vídeos com pagamento em aguardo");
                                                    setListaVisualizacao(videosNoOrcamento.filter((video) => !["Editado", "Postado"].includes(video.status)));
                                                }}>Visualizar</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ) : <div className={styles.container}><h2>Carregando...</h2></div>}
        </div>
    );
}