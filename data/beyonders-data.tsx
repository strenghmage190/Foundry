import { PathwayData } from '../types';
import { toloData } from './pathways/tolo';
import { erroData } from './pathways/erro';
import { portaData } from './pathways/porta';
import { visionarioData } from './pathways/visionario';
import { tiranoData } from './pathways/tirano';
import { torreBrancaData } from './pathways/torre-branca';
import { enforcadoData } from './pathways/enforcado';
import { solData } from './pathways/sol';
import { demonioData } from './pathways/demonio';
import { justiceiroData } from './pathways/justiceiro';
import { maeData } from './pathways/mae';
import { luaData } from './pathways/lua';
import { acorrentadoData } from './pathways/acorrentado';
import { giganteData } from './pathways/gigante';
import { abismoData } from './pathways/abismo';
import { morteData } from './pathways/morte';
import { imperadorNegroData } from './pathways/imperador-negro';
import { padreVermelhoData } from './pathways/padre-vermelho';
import { paragonData } from './pathways/paragon';
import { trevasData } from './pathways/trevas';
import { eremitaData } from './pathways/eremita';
import { rodaDaFortunaData } from './pathways/roda-da-fortuna';
import { aeonData } from './pathways/aeon';
import { veuData } from './pathways/veu';

export const caminhosData: PathwayData[] = [
    toloData,
    erroData,
    portaData,
    visionarioData,
    tiranoData,
    torreBrancaData,
    enforcadoData,
    solData,
    demonioData,
    justiceiroData,
    maeData,
    luaData,
    acorrentadoData,
    giganteData,
    abismoData,
    morteData,
    imperadorNegroData,
    padreVermelhoData,
    paragonData,
    trevasData,
    eremitaData,
    rodaDaFortunaData,
    aeonData,
    veuData,
];

// Alias para compatibilidade
export const beyonderAbilities = caminhosData;
