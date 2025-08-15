import React, { useEffect, useState } from "react";
import AppContext from "./AppContext";
import { Video, Profissional, Topico, Disciplina } from "./Interfaces";

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);
    const [topicos, setTopicos] = useState<Topico[]>([]);
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Profissional>();
    const [isLoading, setIsLoading] = useState(true);
    const [primeiroAcesso, setPrimeiroAcesso] = useState(false);
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            const jsonUser = storedUser == "undefined" ? undefined : JSON.parse(storedUser);
            setCurrentUser(jsonUser);
        }
        setIsLoading(false);
    }, [])
    return (
        <AppContext.Provider value={{
            Videos: videos,
            setVideos,
            Profissionais: profissionais,
            setProfissionais,
            Topicos: topicos,
            setTopicos,
            Disciplinas: disciplinas,
            setDisciplinas,
            menuOpen: menuOpen,
            setMenuOpen: setMenuOpen,
            currentUser: currentUser,
            setCurrentUser: setCurrentUser,
            isLoading: isLoading,
            setIsLoading: setIsLoading,
            primeiroAcesso: primeiroAcesso,
            setPrimeiroAcesso: setPrimeiroAcesso
        }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppProvider;
