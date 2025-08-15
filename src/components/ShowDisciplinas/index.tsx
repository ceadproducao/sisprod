import { Link } from "react-router-dom";
import styles from "./styles.module.css"
import { Disciplina, Profissional } from "../../Interfaces";
import { useEffect } from "react";

export default function ShowDisciplinas({ profissional, disciplinas, idsAntigos }: { profissional?: Profissional, disciplinas: Disciplina[], idsAntigos?: string[] }) {
    function getFuncoes(disciplina: Disciplina, pessoa: Profissional) {
        const funcoesTemp: Set<string> = new Set();
        disciplina.orientadores.forEach(x => {
            if (x.nome == pessoa.nome) {
                funcoesTemp.add("Orientador(a) de Conteúdo");
            }
        });
        disciplina.topicos.forEach(x => {
            if (x.conteudistas.includes(pessoa)) {
                funcoesTemp.add("Conteudista");
            }
            if (x.validadores.includes(pessoa)) {
                funcoesTemp.add("Validador(a)");
            }
            x.videos.forEach(y => {
                if (y.apresentador.includes(pessoa)) {
                    if (y.tipo == "Videocast") {
                        funcoesTemp.add("Entrevistador(a) de VideoCast");
                    } else {
                        funcoesTemp.add("Apresentador(a) de Video");
                    }
                }
                if (y.convidado.includes(pessoa)) {
                    funcoesTemp.add("Convidado(a) de VideoCast");
                }
            });
        });

        return Array.from(funcoesTemp).join(", ");
    }
    return (
        <div className={styles.container}>
            {disciplinas.map((x) => (
                <Link to={`/disciplina/${x.id}` + (profissional ? `/profissional/${profissional.id}` : "")} key={x.id} className={styles.btn} style={x.excluida ? { backgroundColor: "#f2a5a0", color: 'black' } : idsAntigos?.includes(x.id.toString()) ? { backgroundColor: "var(--Cinza-Claro)", color: '#707070' } : {}}>
                    <h3>{x.nome} {x.up != "" ? "(UP)" : null}{x.versao ? " - " + x.versao : null} {x.excluida ? "- (ARQUIVADA)" : null} {idsAntigos?.includes(x.id.toString()) && "- (ANTIGA)"}{profissional ? <span style={{ fontWeight: "normal" }}> - {(getFuncoes(x, profissional))}</span> : null}</h3>
                </Link >
            ))}
        </div>
    );
}