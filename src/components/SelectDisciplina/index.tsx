import { useContext, useState } from "react";
import AppContext from "../../AppContext";
import { Disciplina } from "../../Interfaces";
import styles from './styles.module.css'

export default function SelectDisciplina({ disciplinaAtual, disciplinaSelecionada, setDisciplinaSelecionada }: { disciplinaAtual?: Disciplina, disciplinaSelecionada?: Disciplina, setDisciplinaSelecionada: Function }) {
    const { Disciplinas } = useContext(AppContext);
    const [disciplinasFiltradas, setDisciplinasFiltradas] = useState<Disciplina[]>(Disciplinas.filter(d => (d.id != disciplinaAtual?.id)));

    return (
        <div className={styles.container}>
            <input type="text" placeholder="Buscar" onClick={() => { setDisciplinasFiltradas(Disciplinas) }} onChange={(e) => { setDisciplinasFiltradas(Disciplinas.filter(d => (d.id != disciplinaAtual?.id)).filter(d => (d.id + "-" + d.nome + (d.up != "" ? "(UP)" : null) + (d.versao && " - " + d.versao) + (d.excluida && " - (ARQUIVADA)")).toLowerCase().includes(e.target.value.toLowerCase()))) }} />
            <div className={styles.scroll}>
                {disciplinasFiltradas.map(
                    disciplina => {
                        return <button type="button" disabled={disciplinaSelecionada?.id !== disciplina.id && disciplinaSelecionada != undefined} className={styles.item} onClick={
                            disciplinaSelecionada != disciplina
                                ? () => setDisciplinaSelecionada(disciplina)
                                : () => setDisciplinaSelecionada(undefined)
                        } key={disciplina.id}>{disciplina.id} - {disciplina.nome} {disciplina.up != "" ? "(UP)" : null}{disciplina.versao && " - " + disciplina.versao} {disciplina.excluida && " - (ARQUIVADA)"} {disciplinaSelecionada == disciplina && " - ✅"}
                        </button>
                    }
                )}
            </div>
        </div>
    );
}