import { useContext, useState } from "react";
import { Video } from "../../Interfaces";
import styles from "./styles.module.css";
import React from "react";
import AppContext from "../../AppContext";

export default function ShowVideos({
    videos,
    classBtn,
    classTitle,
    setOpenPainel,
    setTipoPainel
}: {
    videos: Video[];
    classBtn: string;
    classTitle: string;
    setOpenPainel: Function;
    setTipoPainel: Function;
}) {
    const [expanded, setExpanded] = useState<number[]>([]);
    let ultimaCor = false;
    let ultimoTopico = -1;

    const toggleExpand = (index: number) => {
        if (expanded.includes(index)) {
            setExpanded(expanded.filter((i) => i !== index)); // Recolhe
        } else {
            setExpanded([...expanded, index]); // Expande
        }
    };

    const { currentUser } = useContext(AppContext);

    const coresStatus = {
        "Não Gravado": { cor: "black", texto: "black" },
        "Liberado OC": { cor: "#b7b7b7", texto: "black" },
        "Aguardando Agendamento": { cor: "#b7b7b7", texto: "black" },
        "Agendado": { cor: "#f9cb9c", texto: "black" },
        "Gravado": { cor: "#d5a6bd", texto: "black" },
        "Editado": { cor: "#00ffff", texto: "black" },
        "Postado": { cor: "#9fc5e8", texto: "black" },
        "Problema": { cor: "red", texto: "black" },
    }

    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <div className={classTitle}>
                    <h3>Vídeos</h3>
                    {currentUser?.admin && <button
                        className={classBtn}
                        onClick={() => {
                            setOpenPainel(true);
                            setTipoPainel("video");
                        }}
                    >
                        Editar Vídeos
                    </button>}
                </div>

                <div className={styles.topicos}>
                    <table>
                        <thead>
                            <tr>
                                <th>Versão</th>
                                <th>Orçamento</th>
                                <th>Número do Tópico</th>
                                <th>Tipo de Vídeo</th>
                                <th>Status</th>
                                <th>Local</th>
                                <th>Apresentadores/Entrevistadores</th>
                                <th>Convidados Videocast</th>
                            </tr>
                        </thead>
                        <tbody>
                            {videos.map((video, index) => {
                                if (video.topicoNum !== ultimoTopico) {
                                    ultimaCor = !ultimaCor;
                                    ultimoTopico = video.topicoNum;
                                }

                                return (
                                    <React.Fragment key={index}>
                                        <tr
                                            style={
                                                ultimaCor
                                                    ? { backgroundColor: "#dadada", cursor: "pointer" }
                                                    : { cursor: "pointer" }
                                            } className={styles.video}
                                            onClick={() => toggleExpand(index)}
                                        >
                                            <td>{video.versao}</td>
                                            <td>{video.orcamento}</td>
                                            <td>Tópico {video.topicoNum}</td>
                                            <td>{video.tipo}</td>
                                            <td><div style={{ display: "flex", alignItems: 'center' }}>
                                                <div style={{ backgroundColor: coresStatus[video.status].cor, color: coresStatus[video.status].texto, width: 25, height: 25, borderRadius: "50%", marginRight: 10, border: '1px solid black' }} />
                                                {video.status}
                                            </div></td>
                                            <td>{video.gravacaoInternaExterna}</td>
                                            <td>{video.apresentador.map((ap) => ap.nome).join(", ")}</td>
                                            <td>{video.convidado.length > 0 ? video.convidado.map((c) => c.nome).join(", ") : ""}</td>
                                        </tr>

                                        {expanded.includes(index) && (
                                            <tr>
                                                <td colSpan={8} style={{ backgroundColor: "#f2f2f2" }}>
                                                    <div className={styles.detalhes}>
                                                        <p><strong>ID:</strong> {video.id}</p>
                                                        <p><strong>Backup:</strong> {video.backup}</p>
                                                        <p><strong>Recursos Especiais:</strong> {video.recursosEspeciaisVideo}</p>
                                                        <p><strong>Código Vimeo:</strong> {video.codigoVimeo}</p>
                                                        <p><strong>Data Liberação:</strong> {video.dataLiberacao ? new Date(video.dataLiberacao).toLocaleString().split(",")[0] : ""}</p>
                                                        <p><strong>Data Email:</strong> {video.dataEmail ? new Date(video.dataEmail).toLocaleString().split(",")[0] : ""}</p>
                                                        <p><strong>Data Agendamento:</strong> {video.dataAgendamento ? new Date(video.dataAgendamento).toLocaleString().split(",")[0] : ""}</p>
                                                        <p><strong>Vídeo Autorizado:</strong> {video.videoAutorizado}</p>
                                                        <p><strong>Categoria do Problema:</strong> {video.catProblema}</p>
                                                        <p><strong>Descrição do Problema:</strong> {video.descProblema}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
