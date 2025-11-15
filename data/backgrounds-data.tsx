export interface Background {
    id: string;
    name: string;
    description: string;
}

export const backgroundsData: Background[] = [
    {
        id: "academic",
        name: "Acadêmico",
        description: "Você possui educação formal em uma instituição de ensino superior ou similar."
    },
    {
        id: "criminal",
        name: "Criminoso",
        description: "Você tem experiência no mundo do crime, seja como ladrão, contrabandista ou algo pior."
    },
    {
        id: "military",
        name: "Militar",
        description: "Você serviu nas forças armadas ou em uma milícia organizada."
    },
    {
        id: "noble",
        name: "Nobre",
        description: "Você nasceu em uma família aristocrática ou possui título de nobreza."
    },
    {
        id: "occultist",
        name: "Ocultista",
        description: "Você estudou conhecimentos proibidos, rituais ou artefatos místicos."
    },
    {
        id: "priest",
        name: "Sacerdote",
        description: "Você é ou foi membro de uma ordem religiosa ou clerical."
    },
    {
        id: "scholar",
        name: "Erudito",
        description: "Você dedicou sua vida ao estudo acadêmico ou pesquisa independente."
    },
    {
        id: "trader",
        name: "Comerciante",
        description: "Você trabalha no comércio, seja como mercador, negociante ou empresário."
    },
    {
        id: "vagrant",
        name: "Vagabundo",
        description: "Você viveu nas ruas, sobrevivendo como mendigo, ladrão de rua ou trabalhador eventual."
    },
    {
        id: "wealthy",
        name: "Rico",
        description: "Você possui riquezas significativas, herdadas ou adquiridas."
    }
];
