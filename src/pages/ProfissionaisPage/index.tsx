import { useContext, useState } from "react";
import { FormAddProfissional, Header, Menu, ShowPessoas } from "../../components"
import { getInfo } from "../../App";
import AppContext from "../../AppContext";

export default function ProfissionaisPage() {
    const [panelOpen, setPanelOpen] = useState(false);
    const { setProfissionais, setDisciplinas, setVideos, setTopicos } = useContext(AppContext);
    return (
        <div>
            <Menu />
            <Header />
            {panelOpen ? <FormAddProfissional closeAction={() => { setPanelOpen(false); getInfo(setProfissionais, setDisciplinas, setVideos, setTopicos) }} /> : null}
            <ShowPessoas setPanelOpen={setPanelOpen} />
        </div>
    );
}