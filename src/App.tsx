import { useEffect, useContext, JSX } from 'react'
import { Profissional, Disciplina, Video, Topico } from './Interfaces'
import { getData } from './getData'
import AppContext from './AppContext'
import { useLocation, Navigate, HashRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DisciplinaPage from './pages/DisciplinaPage'
import ProfissionaisPage from './pages/ProfissionaisPage'
import ProfissionalPage from './pages/ProfissionalPage'
import Indicadores from './pages/Indicadores'
import LoginScreen from './pages/LoginScreen'
import ChangePasswordScreen from './pages/ChangePasswordScreen'

export async function getInfo(setProfissionais: (novosProfissionais: Profissional[]) => void, setDisciplinas: (novasDisciplinas: Disciplina[]) => void, setVideos: (novosVideos: Video[]) => void, setTopicos: (novosTopicos: Topico[]) => void) {
  const data = await getData("https://script.google.com/macros/s/AKfycbyqzSfSRHYC6NgH9d_FkQCF_2_Br6nSjNwZ_0J4hUm1io4lTj-7a0t0YmlJ43KtgzbS/exec?planilhas=Profissionais,Vídeo,Topicos,Disciplinas")
  setProfissionais(data.profissionais)
  setVideos(data.videos)
  setTopicos(data.topicos)
  setDisciplinas(data.disciplinas)
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { currentUser, isLoading, primeiroAcesso } = useContext(AppContext);
  const location = useLocation();

  if (isLoading) return null; // ou <Loading />

  if (!currentUser) return <Navigate to="/login" replace />;

  if (primeiroAcesso && location.pathname !== "/editarsenha") {
    return <Navigate to="/editarsenha" replace />;
  }

  return children;
}


function LoginRoute({ children }: { children: JSX.Element }) {
  const { currentUser, isLoading } = useContext(AppContext);

  if (isLoading) return null; // ou um loader, tipo <Loading />

  return !currentUser ? children : <Navigate to="/" replace />;
}

function App() {
  const { setProfissionais, setDisciplinas, setVideos, setTopicos } = useContext(AppContext)
  useEffect(() => {
    getInfo(setProfissionais, setDisciplinas, setVideos, setTopicos);
  }, [])
  return (
    <Router>
      <Routes>
        <Route path='/login' element={
          <LoginRoute><LoginScreen /></LoginRoute>
        } />

        <Route path='/' element={
          <PrivateRoute><Home /></PrivateRoute>
        } />

        <Route path='/disciplina/:id/:back/:idProf' element={
          <PrivateRoute><DisciplinaPage /></PrivateRoute>
        } />
        <Route path='/disciplina/:id' element={
          <PrivateRoute><DisciplinaPage /></PrivateRoute>
        } />
        <Route path='/disciplina' element={
          <PrivateRoute><DisciplinaPage /></PrivateRoute>
        } />
        <Route path='/profissionais' element={
          <PrivateRoute><ProfissionaisPage /></PrivateRoute>
        } />
        <Route path='/profissional/:id' element={
          <PrivateRoute><ProfissionalPage /></PrivateRoute>
        } />
        <Route path='/profissional' element={
          <PrivateRoute><ProfissionalPage /></PrivateRoute>
        } />
        <Route path='/indicadores' element={
          <PrivateRoute><Indicadores /></PrivateRoute>
        } />
        <Route path='/editarsenha' element={
          <PrivateRoute><ChangePasswordScreen /></PrivateRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
