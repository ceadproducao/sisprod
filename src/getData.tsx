import { Profissional, Video, Disciplina, Topico } from './Interfaces';
import { parse } from "date-fns";

export async function getData(url: string): Promise<{
    profissionais: Profissional[],
    videos: Video[],
    topicos: Topico[],
    disciplinas: Disciplina[]
}> {
    try {
        const response = await fetch(url, { credentials: 'omit' });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();

        // Profissionais
        const profissionaisData = json.Profissionais;
        const profissionais: Profissional[] = profissionaisData && Array.isArray(profissionaisData)
            ? profissionaisData.map((item) => ({
                id: item["ID do profissional"],
                nome: item.Profissionais,
                email: item.Email,
                telefone: item.Telefone,
                foto: item.Foto,
                internoExterno: item["Interno/Externo"],
                treinamentos: item.Treinamentos,
                admin: item.Admin == "Sim" ? true : false,
                temAcesso: item["Permitir Acesso"] == "Sim" ? true : false,
            }))
            : [];

        // Vídeos
        const videosData = json["Vídeo"];
        const videos: Video[] = videosData && Array.isArray(videosData)
            ? videosData.map((item) => ({
                id: item["ID do Vídeo"],
                idDisciplina: item["ID da Disciplina"],
                topicoNum: parseInt(item["Tópico"].split("Tópico ")[1]),
                backup: (item["Backup no Storage"] == "Sim" ? true : false),
                tipo: item['Tipo de vídeo'],
                recursosEspeciaisVideo: item["Recursos Especiais do Vídeo"],
                gravacaoInternaExterna: item["Gravação Interna/Externa"],
                status: item.Status,
                codigoVimeo: item["Código Vimeo"],
                apresentador: profissionais.filter(x => item['Apresentador/Entrevistador'].includes(x.nome)),
                convidado: profissionais.filter(x => item['Convidado Videocast'].includes(x.nome)),
                dataLiberacao: item["Data Liberação"] == '' ? "" : parse(item["Data Liberação"], "dd/MM/yyyy", new Date()),
                dataEmail: item["Data Email"] == '' ? "" : parse(item["Data Email"], "dd/MM/yyyy", new Date()),
                dataAgendamento: item["Data Agendamento"] == '' ? "" : parse(item["Data Agendamento"], "dd/MM/yyyy", new Date()),
                orcamento: item["Orçamento"],
                versao: item["Versão"],
                videoAutorizado: item["Vídeo Autorizado?"],
                catProblema: item["Categoria do problema"],
                descProblema: item["Descrição do problema"],
                excluido: item["Excluído?"],
            }))
            : [];

        // Tópicos
        const topicosData = json.Topicos;
        let topicos: Topico[] = topicosData && Array.isArray(topicosData)
            ? topicosData.map((item) => ({
                id: item["ID do Tópico"],
                idDisciplina: item["ID da Disciplina"],
                numero: parseInt(item.Tópico.split("Tópico ")[1]),
                conteudistas: profissionais.filter(x => item.Conteudista.includes(x.nome)),
                validadores: profissionais.filter(x => item.Validador.includes(x.nome)),
                status: item.Status,
                carga: item.Carga,
                orcamento: item["Orçamento"],
                versao: item["Versão"],
                recursosEspeciaisLicao: item["Recursos Especiais da Lição"],
                licaoAutorizada: item["Lição Autorizada?"],
                catProblemaLicao: item["Categoria do problema"],
                descProblemaLicao: item["Descrição do problema"],
                videos: videos.filter(x => x.idDisciplina == item["ID da Disciplina"]).filter(x => x.id.split("-")[0] + "-" + x.id.split("-")[1] == item["ID do Tópico"]),
                dataPrevistaInicio: item["Data prevista de início"] == '' ? "" : parse(item["Data prevista de início"], "dd/MM/yyyy", new Date()) as "" | Date,
                dataEfetivaInicio: item["Data efetiva de início"] == '' ? "" : parse(item["Data efetiva de início"], "dd/MM/yyyy", new Date()) as "" | Date,
                dataPrevistaNaMao: item["Data prevista Na Mão"] == '' ? "" : parse(item["Data prevista Na Mão"], "dd/MM/yyyy", new Date()) as "" | Date,
                dataEfetivaNaMao: item["Data efetiva Na Mão"] == '' ? "" : parse(item["Data efetiva Na Mão"], "dd/MM/yyyy", new Date()) as "" | Date,
                dataPrevistaVT: item["Data prevista VT"] == '' ? "" : parse(item["Data prevista VT"], "dd/MM/yyyy", new Date()) as "" | Date,
                dataEfetivaVT: item["Data efetiva VT"] == '' ? "" : parse(item["Data efetiva VT"], "dd/MM/yyyy", new Date()) as "" | Date,
                dataPrevistaGramatica: item["Data prevista Gramática"] == '' ? "" : parse(item["Data prevista Gramática"], "dd/MM/yyyy", new Date()) as "" | Date,
                dataEfetivaGramatica: item["Data efetiva Gramática"] == '' ? "" : parse(item["Data efetiva Gramática"], "dd/MM/yyyy", new Date()) as "" | Date,
                excluido: item["Excluído?"],
                tipo: "Completo" as "Completo" | "Video"
            }))
            : [];
        topicos = [...topicos, ...videos.filter(x => !topicos.map(y => y.id).includes(x.id.split("-").slice(0, 2).join("-"))).map(x => ({
            id: x.id.split("-").slice(0, 2).join("-"),
            idDisciplina: x.idDisciplina,
            numero: x.topicoNum,
            conteudistas: [],
            validadores: [],
            status: "Nada",
            carga: "",
            orcamento: "",
            versao: "",
            recursosEspeciaisLicao: "",
            licaoAutorizada: "",
            catProblemaLicao: "",
            descProblemaLicao: "",
            videos: [x],
            dataPrevistaInicio: "" as "" | Date,
            dataEfetivaInicio: "" as "" | Date,
            dataPrevistaNaMao: "" as "" | Date,
            dataEfetivaNaMao: "" as "" | Date,
            dataPrevistaVT: "" as "" | Date,
            dataEfetivaVT: "" as "" | Date,
            dataPrevistaGramatica: "" as "" | Date,
            dataEfetivaGramatica: "" as "" | Date,
            excluido: "",
            tipo: "Video" as "Completo" | "Video"
        } as Topico))]

        // Disciplinas
        const disciplinasData = json.Disciplinas;
        const disciplinas: Disciplina[] = disciplinasData && Array.isArray(disciplinasData)
            ? disciplinasData.map((item) => (
                {
                    id: item.ID,
                    nome: item.Disciplina,
                    versao: item.Versão ? item.Versão : "",
                    up: item.UP,
                    disciplinaAntiga: item["Disciplina Antiga (Caso UP)"],
                    area: item.Área,
                    excluida: item["Excluída?"],
                    status: item.Status,
                    ano: item.Ano,
                    prioridade: item.Prioridade,
                    orientadores: profissionais.filter(x => item["Orientador de Conteudo"].includes(x.nome)),
                    statusMatriz: item["Status Matriz"],
                    linkMatriz: item["Link Matriz"],
                    desenho: item["Desenho"],
                    ementa: item.Ementa,
                    isbn: item.ISBN,
                    padrao: item.Padrão,
                    detalhamento: item.Detalhamento,
                    ambiente: item.Ambiente,
                    liberadoCriacao: item["Liberado para Criação"] == "Sim" ? true : false,
                    codAVA20: item["Código AVA 20%"],
                    codAVA100: item["Código AVA 100%"],
                    topicos: topicos.filter(x => x.idDisciplina == item.ID)
                })).filter(disciplina => disciplina !== undefined)
            : [];
        disciplinas.sort((a, b) => {
            return a.nome.localeCompare(b.nome);
        });

        return { profissionais, videos, topicos, disciplinas };

    } catch (error: any) {
        console.error("Erro ao obter dados: ", error);
        return {
            profissionais: [],
            videos: [],
            topicos: [],
            disciplinas: []
        };
    }
}