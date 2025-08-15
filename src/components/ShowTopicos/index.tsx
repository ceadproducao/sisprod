import { useContext, useState } from "react";
import { Topico } from "../../Interfaces";
import styles from "./styles.module.css";
import React from "react";
import AppContext from "../../AppContext";

export default function ShowTopicos({
    topicos,
    classBtn,
    classTitle,
    setOpenPainel,
    setTipoPainel
}: {
    topicos: Topico[];
    classBtn: string;
    classTitle: string;
    setOpenPainel: Function;
    setTipoPainel: Function;
}) {
    const [expanded, setExpanded] = useState<number[]>([]);

    const toggleExpand = (index: number) => {
        if (expanded.includes(index)) {
            setExpanded(expanded.filter((i) => i !== index)); // Recolhe
        } else {
            setExpanded([...expanded, index]); // Expande
        }
    };

    const { currentUser } = useContext(AppContext);

    const coresStatus = {
        "Nada": { cor: "black", texto: "white" },
        "Problema": { cor: "red", texto: "white" },
        "Iniciado Contato": { cor: "#b7b7b7", texto: "black" },
        "Na mão": { cor: "#f9cb9c", texto: "black" },
        "Retorno OC": { cor: "#f9cb9c", texto: "black" },
        "Plágio": { cor: "#d5a6bd", texto: "black" },
        "Retorno Plágio": { cor: "#d5a6bd", texto: "black" },
        "Revisão": { cor: "#00ffff", texto: "black" },
        "Retorno Revisão": { cor: "#00ffff", texto: "black" },
        "Gramática": { cor: "#9fc5e8", texto: "black" },
        "Retorno Gramática": { cor: "#9fc5e8", texto: "black" },
        "Pronto para DTI": { cor: "#b6d7a8", texto: "black" },
        "Pendente Interação": { cor: "#ff9900", texto: "black" },
        "HTML Pronto": { cor: "#ffff00", texto: "black" },
        "Revisão Final": { cor: "#ead1dc", texto: "black" },
        "Pronto": { cor: "#00ff00", texto: "black" }
    }

    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <div className={classTitle}>
                    <h3>Tópicos</h3>
                    {currentUser?.admin && <div style={{ display: "flex", flexDirection: "column" }}>
                        <button
                            className={classBtn}
                            onClick={() => {
                                setOpenPainel(true);
                                setTipoPainel("topico");
                            }}
                            style={{ margin: 5 }}
                        >
                            Editar Tópicos
                        </button>
                    </div>}
                </div>

                <div className={styles.topicos}>
                    <table>
                        <thead>
                            <tr>
                                <th>Versão</th>
                                <th>Orçamento</th>
                                <th>Tópico</th>
                                <th>Status</th>
                                <th>Conteudistas</th>
                                <th>Validadores</th>
                            </tr>
                        </thead>

                        <tbody>
                            {topicos.filter(x => x.tipo != "Video").map((topico, index) =>
                                topico.excluido !== "" ? null : (
                                    <React.Fragment key={topico.id || index}>
                                        <tr
                                            style={(index % 2 == 0) ? { backgroundColor: "#dadada", cursor: "pointer" } : { cursor: "pointer" }} className={styles.topico}
                                            onClick={() => toggleExpand(index)}
                                        >
                                            <td>{topico.versao}</td>
                                            <td>{topico.orcamento}</td>
                                            <td>Tópico {topico.numero}</td>
                                            <td><div style={{ display: "flex", alignItems: 'center' }}>
                                                <div style={{ backgroundColor: coresStatus[topico.status].cor, color: coresStatus[topico.status].texto, width: 25, height: 25, borderRadius: "50%", marginRight: 10, border: '1px solid black' }} />
                                                {topico.status}
                                            </div>
                                            </td>
                                            <td>
                                                {Array.isArray(topico.conteudistas)
                                                    ? topico.conteudistas.map((c) => c.nome).join(", ")
                                                    : ""}
                                            </td>
                                            <td>
                                                {Array.isArray(topico.validadores)
                                                    ? topico.validadores.map((v) => v.nome).join(", ")
                                                    : ""}
                                            </td>
                                        </tr>

                                        {expanded.includes(index) && (
                                            <tr>
                                                <td colSpan={6} style={{ backgroundColor: "#f2f2f2" }}>
                                                    <div className={styles.detalhes}>
                                                        <p><strong>ID:</strong> {topico.id}</p>
                                                        <p><strong>Carga:</strong> {topico.carga}</p>
                                                        <p><strong>Recursos Especiais:</strong> {topico.recursosEspeciaisLicao}</p>
                                                        <p><strong>Lição Autorizada:</strong> {topico.licaoAutorizada}</p>
                                                        <p><strong>Categoria do Problema:</strong> {topico.catProblemaLicao}</p>
                                                        <p><strong>Descrição do Problema:</strong> {topico.descProblemaLicao}</p>
                                                        <p><strong>Datas:</strong></p>
                                                        <ul>
                                                            <li>Prevista Início: {topico.dataPrevistaInicio ? new Date(topico.dataPrevistaInicio).toLocaleString().split(",")[0] : ""}</li>
                                                            <li>Efetiva Início: {topico.dataEfetivaInicio ? new Date(topico.dataEfetivaInicio).toLocaleString().split(",")[0] : ""}</li>
                                                            <li>Prevista Na Mão: {topico.dataPrevistaNaMao ? new Date(topico.dataPrevistaNaMao).toLocaleString().split(",")[0] : ""}</li>
                                                            <li>Efetiva Na Mão: {topico.dataEfetivaNaMao ? new Date(topico.dataEfetivaNaMao).toLocaleString().split(",")[0] : ""}</li>
                                                            <li>Prevista VT: {topico.dataPrevistaVT ? new Date(topico.dataPrevistaVT).toLocaleString().split(",")[0] : ""}</li>
                                                            <li>Efetiva VT: {topico.dataEfetivaVT ? new Date(topico.dataEfetivaVT).toLocaleString().split(",")[0] : ""}</li>
                                                            <li>Prevista Gramática: {topico.dataPrevistaGramatica ? new Date(topico.dataPrevistaGramatica).toLocaleString().split(",")[0] : ""}</li>
                                                            <li>Efetiva Gramática: {topico.dataEfetivaGramatica ? new Date(topico.dataEfetivaGramatica).toLocaleString().split(",")[0] : ""}</li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
