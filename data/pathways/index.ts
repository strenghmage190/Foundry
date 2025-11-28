import { PathwayData } from '../../types';
import { aeonData } from './aeon';
import { abismoData } from './abismo';
import { acorrentadoData } from './acorrentado';
import { demonioData } from './demonio';
import { enforcadoData } from './enforcado';
import { eremitaData } from './eremita';
import { erroData } from './erro';
import { giganteData } from './gigante';
import { imperadorNegroData } from './imperador-negro';
import { justiceiroData } from './justiceiro';
import { luaData } from './lua';
import { maeData } from './mae';
import { morteData } from './morte';
import { padreVermelhoData } from './padre-vermelho';
import { paragonData } from './paragon';
import { portaData } from './porta';
import { rodaDaFortunaData } from './roda-da-fortuna';
import { solData } from './sol';
import { tiranoData } from './tirano';
import { toloData } from './tolo';
import { torreBrancaData } from './torre-branca';
import { trevasData } from './trevas';
import { veuData } from './veu';
import { visionarioData } from './visionario';

// Map pathway display name to PathwayData
export const PATHWAYS_DATA: Record<string, PathwayData> = {
  [aeonData.pathway]: aeonData,
  [abismoData.pathway]: abismoData,
  [acorrentadoData.pathway]: acorrentadoData,
  [demonioData.pathway]: demonioData,
  [enforcadoData.pathway]: enforcadoData,
  [eremitaData.pathway]: eremitaData,
  [erroData.pathway]: erroData,
  [giganteData.pathway]: giganteData,
  [imperadorNegroData.pathway]: imperadorNegroData,
  [justiceiroData.pathway]: justiceiroData,
  [luaData.pathway]: luaData,
  [maeData.pathway]: maeData,
  [morteData.pathway]: morteData,
  [padreVermelhoData.pathway]: padreVermelhoData,
  [paragonData.pathway]: paragonData,
  [portaData.pathway]: portaData,
  [rodaDaFortunaData.pathway]: rodaDaFortunaData,
  [solData.pathway]: solData,
  [tiranoData.pathway]: tiranoData,
  [toloData.pathway]: toloData,
  [torreBrancaData.pathway]: torreBrancaData,
  [trevasData.pathway]: trevasData,
  [veuData.pathway]: veuData,
  [visionarioData.pathway]: visionarioData,
};

export default PATHWAYS_DATA;
