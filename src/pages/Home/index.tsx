import { useContext, useEffect, useState } from "react";
import AppContext from "../../AppContext";
import { Header, ShowDisciplinas, FormAddDisciplina, Menu } from "../../components";
import styles from "./style.module.css"

export default function Home() {
  const { Disciplinas, currentUser } = useContext(AppContext);
  const [busca, setBusca] = useState("");
  const [openFormAdd, setOpenFormAdd] = useState(false);
  const [arquivadosShown, setArquivadosShown] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState<string[]>([]);
  const [disciplinasPaginadas, setDisciplinasPaginadas] = useState<typeof Disciplinas>([]);
  const [qtdMostrada, setQtdMostrada] = useState(10);
  const [pagAtual, setPagAtual] = useState(0);
  const [qtdPags, setQtdPags] = useState(1);
  const [antigasShown, setAntigasShown] = useState(false);
  const [versoesVisiveis, setVersoesVisiveis] = useState<string[]>([]);

  // Efeito principal para filtrar e paginar as disciplinas
  useEffect(() => {
    // 1. Aplica os filtros primários (arquivados, antigas, versão)
    const idsAntigos = Disciplinas.filter(d => d.disciplinaAntiga !== "").map(d => d.disciplinaAntiga.toString());

    let disciplinasProcessadas = Disciplinas
      .filter(d => arquivadosShown || d.excluida === "")
      .filter(d => antigasShown || !idsAntigos.includes(d.id.toString()))
      .filter(d => filtrosAtivos.length === 0 || filtrosAtivos.includes(d.versao));

    // 2. Aplica o filtro de busca (termo pesquisado)
    if (busca) {
      disciplinasProcessadas = disciplinasProcessadas.filter(d =>
        d.nome.toLowerCase().includes(busca.toLowerCase())
      );
    }

    // 3. Calcula a quantidade total de páginas
    const totalPags = Math.ceil(disciplinasProcessadas.length / qtdMostrada);
    setQtdPags(totalPags > 0 ? totalPags : 1);

    // 4. Garante que a página atual não seja inválida após a filtragem
    const paginaValida = Math.max(0, Math.min(pagAtual, totalPags - 1));
    setPagAtual(paginaValida);

    // 5. Pagina o resultado final
    const inicio = paginaValida * qtdMostrada;
    const fim = inicio + qtdMostrada;
    setDisciplinasPaginadas(disciplinasProcessadas.slice(inicio, fim));

  }, [Disciplinas, busca, filtrosAtivos, arquivadosShown, antigasShown, qtdMostrada, pagAtual]);

  // Efeito para resetar a página para a primeira ao mudar os filtros
  useEffect(() => {
    setPagAtual(0);
  }, [busca, filtrosAtivos, arquivadosShown, antigasShown, qtdMostrada]);


  // Efeito para definir as versões visíveis para os botões de filtro
  useEffect(() => {
    const idsAntigos = Disciplinas.filter(d => d.disciplinaAntiga !== "").map(d => d.disciplinaAntiga.toString());

    const disciplinasVisiveis = Disciplinas
      .filter(d => arquivadosShown || d.excluida === "")
      .filter(d => antigasShown || !idsAntigos.includes(d.id.toString()));

    const versoes = [...new Set(disciplinasVisiveis.map(d => d.versao).filter(v => v !== ""))];
    setVersoesVisiveis(versoes);
  }, [Disciplinas, arquivadosShown, antigasShown]);

  return (
    <div className={styles.container}>
      <Header />
      <Menu />
      {Disciplinas.length === 0 ? <h1>Carregando...</h1> : <>
        <div style={{ display: "flex", flexDirection: 'row-reverse' }}>
          <div className={styles.filtros} style={{ padding: 20, justifyContent: 'center' }}>
            {currentUser?.admin && <button className={styles.btn} onClick={() => setOpenFormAdd(true)} disabled={openFormAdd}>Adicionar Disciplina</button>}
            <button className={styles.btn} style={{ marginTop: "5px" }} onClick={() => setArquivadosShown(!arquivadosShown)}>{arquivadosShown ? "Ocultar Arquivados" : "Mostrar Arquivados"}</button>
            <button className={styles.btn} style={{ marginTop: "5px" }} onClick={() => setAntigasShown(!antigasShown)}>{antigasShown ? "Ocultar Disciplinas Antigas" : "Mostrar Disciplinas Antigas"}</button>
          </div>
          <div className={styles.filtros}>
            <input type="text" placeholder="Buscar" id="busca" value={busca} onChange={(e) => setBusca(e.target.value)} className={styles.busca} style={{ maxHeight: 20 }} />
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p style={{ margin: 5 }}>Filtros:</p>
              <button
                onClick={() => setFiltrosAtivos([])}
                style={{ margin: 10 }}
                className={styles.btn}
                disabled={filtrosAtivos.length === 0}
              >
                Todos
              </button>
              {versoesVisiveis.sort((a, b) => {
                const numA = parseInt(a.replace("V", ""));
                const numB = parseInt(b.replace("V", ""));
                return numA - numB;
              }).map(versao => {
                const ativo = filtrosAtivos.includes(versao);
                return (
                  <button
                    key={versao}
                    onClick={() => {
                      setFiltrosAtivos(prev =>
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
                          setFiltrosAtivos(prev => prev.filter(v => v !== versao));
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
        </div>
        {openFormAdd ? <FormAddDisciplina closeAction={() => setOpenFormAdd(false)} /> : null}
        {/* Renderiza as disciplinas já paginadas */}
        <ShowDisciplinas idsAntigos={Disciplinas.filter(d => d.disciplinaAntiga !== "").map(d => d.disciplinaAntiga.toString())} disciplinas={disciplinasPaginadas} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={{ margin: 10 }} className={styles.btn} onClick={() => setPagAtual(p => Math.max(0, p - 1))} disabled={pagAtual === 0}>{"<"}</button>
          <p>{pagAtual + 1}/{qtdPags}</p>
          <button style={{ margin: 10 }} className={styles.btn} onClick={() => setPagAtual(p => Math.min(qtdPags - 1, p + 1))} disabled={pagAtual + 1 >= qtdPags}>{">"}</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <select value={qtdMostrada} style={{ margin: 10 }} onChange={(e) => setQtdMostrada(parseInt(e.target.value, 10))}>
            <option value="10">10</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </select>
          <p>disciplinas mostradas</p>
        </div>
      </>}
    </div>
  );
}
