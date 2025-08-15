import React from "react";
import { Video, Profissional, Topico, Disciplina } from "./Interfaces";

const AppContext = React.createContext<{
    Videos: Video[];
    setVideos: (novosVideos: Video[]) => void;
    Profissionais: Profissional[];
    setProfissionais: (novosProfissionais: Profissional[]) => void;
    Topicos: Topico[];
    setTopicos: (novosTopicos: Topico[]) => void;
    Disciplinas: Disciplina[];
    setDisciplinas: (novasDisciplinas: Disciplina[]) => void;
    menuOpen: boolean;
    setMenuOpen: (open: boolean) => void;
    currentUser: Profissional | undefined;
    setCurrentUser: (profissional: Profissional | undefined) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    primeiroAcesso: boolean;
    setPrimeiroAcesso: (primeiroAcesso: boolean) => void;
}>({
    Videos: [], setVideos: () => [],
    Profissionais: [], setProfissionais: () => [],
    Topicos: [], setTopicos: () => [],
    Disciplinas: [], setDisciplinas: () => [],
    menuOpen: true,
    setMenuOpen: () => { },
    currentUser: undefined,
    setCurrentUser: () => { },
    isLoading: false,
    setIsLoading: () => { },
    primeiroAcesso: true,
    setPrimeiroAcesso: () => { },
});

export default AppContext;
