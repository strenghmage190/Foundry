import { Enemy } from '../types.ts';

export const lobisomemExample: Enemy = {
    id: 'wraith-werewolf-01',
    name: 'Lobisomem (Wraith)',
    description: 'Uma criatura da noite nascida da maldição do Caminho Acorrentado. Meio homem, meio besta, o Lobisomem é um predador movido por uma fúria primal e uma fome insaciável. Sua silhueta contra a lua cheia é um presságio de morte violenta, e seus uivos carregam a insanidade da lua carmesim.',
    threatLevel: 'Média',
    recommendedSequence: 'Sequência 8 ou 7',
    
    attributes: {
        forca: 5,
        destreza: 4,
        vigor: 5,
        carisma: 1,
        manipulacao: 2,
        autocontrole: 2,
        percepcao: 4,
        inteligencia: 2,
        raciocinio: 3,
        espiritualidade: 3
    },
    espiritualidade: 3,
    
    healthPoints: 40,
    initiative: 7,
    initiativeBreakdown: 'Percepção 4 + Prontidão 3',
    defense: 6,
    defenseBreakdown: 'Raciocínio 3 + Esquiva 3',
    absorption: 6,
    absorptionBreakdown: 'Vigor 5 + Couro Resistente 1',
    movement: 12,
    
    attacks: [
        {
            name: 'Garras',
            dicePool: 8,
            damage: 'd8 + Sucessos Líquidos (Letal)',
            qualities: 'Cruel. Um ferimento causado pelas garras aumenta a dificuldade de cura em +2.',
            notes: 'Ação Principal: Ataque Múltiplo - O Lobisomem pode fazer dois ataques com suas garras.'
        }
    ],
    
    abilities: [
        {
            name: 'Regeneração Lupina',
            actionType: 'Passivo',
            description: 'No início de seu turno, o Lobisomem recupera 3 Pontos de Vida.',
            effects: 'Esta regeneração não funciona no turno seguinte a ter sofrido dano por fogo ou prata.'
        },
        {
            name: 'Uivo Aterrador',
            actionType: 'Ação Principal',
            description: 'O Lobisomem solta um uivo que ataca a sanidade. Todos os alvos em um raio de 20 metros que puderem ouvi-lo devem fazer um teste de Vontade + Autocontrole (Dificuldade 8).',
            effects: 'Falha: O alvo fica amedrontado por 1d4 turnos, sofrendo -2 dados em todas as ações e não pode se mover voluntariamente para perto do Lobisomem.'
        },
        {
            name: 'Visão Noturna Superior',
            actionType: 'Passivo',
            description: 'O Lobisomem enxerga perfeitamente na escuridão total.'
        }
    ],
    
    vulnerabilities: [
        'Ataques feitos com armas de prata causam danos Agravado. O dano Agravado não pode ser absorvido por armadura ou resistência natural.'
    ],
    
    weaknesses: [
        'Fúria da Lua Cheia: Em noites de lua cheia, a criatura é consumida pela sua besta interior. A dificuldade para resistir a um frenesi (atacar o alvo mais próximo, seja amigo ou inimigo) aumenta drasticamente.'
    ],
    
    notes: 'Esta criatura é uma ameaça séria em combate. Sua regeneração a torna difícil de derrotar, mas atacantes com armas de prata podem infligir dano permanente. O Uivo Aterrador pode desorganizar grupos inteiros, tornando o Lobisomem um combatente estratégico.'
};

export const enemies: Enemy[] = [
    lobisomemExample
];
