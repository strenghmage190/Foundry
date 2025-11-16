import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ToastData,
  AgentData,
  Character,
  Habilidade,
  Attributes,
  MythicalFormStage,
  PathwayData,
  ProtectionItem,
} from "../types.ts";
import { supabase } from "../supabaseClient";
import { uploadAgentAvatar } from "../api/agents";
import { logDiceRoll } from "../api/campaigns";
import { useDebounce } from "../src/hooks/useDebounce";
import { usePermissions } from "../src/hooks/usePermissions";
import { useMyContext } from "../MyContext";

// Imports de Componentes
import { StatusBar } from "./StatusBar";
import { SanityTracker } from "./SanityTracker";
import { AttributesSection } from "./AttributesSection";
import { CombatTab } from "./tabs/CombatTab.tsx";
import { BeyonderTab } from "./tabs/BeyonderTab.tsx";
import { MagicTab } from "./tabs/MagicTab.tsx";
import { InventoryTab } from "./tabs/InventoryTab.tsx";
import { NotesTab } from "./tabs/NotesTab.tsx";
import { AntecedentesTab } from "./tabs/AntecedentesTab.tsx";
import { MagicGrimoireModal } from './modals/MagicGrimoireModal';
import { ImprovementModal } from './modals/ImprovementModal';
import { CreatePathwayModal } from './modals/CreatePathwayModal';
import { CreateMagicAttackModal } from './modals/CreateMagicAttackModal';
import { AddWeaponModal } from './modals/AddAttackModal';
import { AddProtectionModal } from './modals/AddBeyonderAbilityModal';
import { CustomizationModal } from './modals/CustomizationModal';
import { DiceRollerModal } from './modals/DiceRollerModal';
import { MythicalFormModal } from './modals/MythicalFormModal';
import { DiceIcon, PaletteIcon, FlameIcon } from "./icons.tsx";

// Imports de Dados e Utilitários
import { caminhosData } from "../data/beyonders-data.tsx";
import { rollDice, rollSimpleDice, rollDamage } from "../utils/diceRoller.ts";
import { getAvatarForSanityAndVitality } from "../utils/agentUtils";
import {
  getContrastColor,
  darkenColor,
  hexToRgb,
} from "../utils/colorUtils.ts";
import { NotificationLog } from "./ToastContainer.tsx";
import { ControlTestTracker } from "./ControlTestTracker.tsx";
import { AnchorsTracker } from "./AnchorsTracker.tsx";
import { PaTracker } from "./PaTracker.tsx";
import { computeDerivedFromPrimary, getMaxLuckPointsBySequence } from "../utils/calculations";

type RollType = "skill" | "absorption";

// --- PathwayManager Component ---
interface PathwayManagerProps {
  agent: AgentData;
  permissions: { max_pathways: number; can_create_pathways: boolean };
  allPathways: { [key: string]: PathwayData };
  onUpdate: (updatedAgent: Partial<AgentData>) => void;
  onPathwayToggle: (pathName: string) => void;
  onSetAsPrimary: (pathName: string) => void;
}

const PathwayManager: React.FC<PathwayManagerProps> = ({ 
  agent, 
  permissions, 
  allPathways, 
  onUpdate,
  onPathwayToggle,
  onSetAsPrimary
}) => {
  const { pathways } = agent.character;
  const primaryPathway = pathways?.primary;

  const removePathway = (pathName: string) => {
    if (pathName === primaryPathway) {
      alert('Não é possível remover o caminho principal. Mude o primário primeiro.');
      return;
    }
    onPathwayToggle(pathName);
  };

  const addPathway = (pathName: string) => {
    if (!pathName) return;
    onPathwayToggle(pathName);
  };
  
  // Lista de caminhos disponíveis para adicionar
  const availablePathways = Object.keys(allPathways).filter(
    p => p !== primaryPathway && !pathways?.secondary?.includes(p)
  );
  
  const currentCount = (pathways?.secondary?.length || 0) + (pathways?.primary ? 1 : 0);
  const hasSpace = currentCount < permissions.max_pathways;

  // --- Renderização Principal ---
  return (
    <div className="pathway-manager">
      <h4>Caminhos Beyonder</h4>

      {/* Interface Padrão (para usuários normais) */}
      {!primaryPathway && <p>Nenhum caminho selecionado.</p>}
      
      {primaryPathway && permissions.max_pathways <= 1 && (
        <div className="pathway-tag primary single">
          <span className="path-name">{primaryPathway}</span>
        </div>
      )}
      
      {/* Interface Avançada (para usuários com permissão) */}
      {primaryPathway && permissions.max_pathways > 1 && (
        <div className="pathway-list-advanced">
          {/* Exibe o caminho primário */}
          <div className="pathway-tag primary">
            <span className="star-icon">★</span>
            <span className="path-name">{primaryPathway}</span>
          </div>

          {/* Exibe os caminhos secundários */}
          {(pathways?.secondary || []).map(pathName => (
            <div key={pathName} className="pathway-tag secondary">
              <span className="path-name">{pathName}</span>
              <div className="tag-actions">
                <button onClick={() => onSetAsPrimary(pathName)} title="Tornar Primário">Primário</button>
                <button onClick={() => removePathway(pathName)} className="remove-btn">×</button>
              </div>
            </div>
          ))}

          {/* Formulário para adicionar mais caminhos (se houver espaço) */}
          {hasSpace && (
            <div className="add-pathway-form">
              <select onChange={(e) => addPathway(e.target.value)} value="">
                <option value="">+ Adicionar Caminho</option>
                {availablePathways.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Sub-componente para o Popover de Rolagem ---
interface RollPopoverProps {
  popoverData: {
    top: number;
    left: number;
    name: string;
    pool: number;
    rollType: RollType;
    meta?: any;
  };
  onClose: () => void;
  onConfirm: (
    name: string,
    pool: number,
    assimilationDice: number,
    rollType: RollType
  ) => void;
  agentData: AgentData;
}

const RollPopover: React.FC<RollPopoverProps> = ({
  popoverData,
  onClose,
  onConfirm,
  agentData: effectiveAgentData,
}) => {
  const [assimilationDice, setAssimilationDice] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: popoverData.top, left: popoverData.left });

  const isSkillRoll = popoverData.rollType === "skill";
  const maxAssimilation = isSkillRoll
    ? Math.min(effectiveAgentData.character.assimilationDice, popoverData.pool)
    : 0;

  // Reset assimilation dice when popover data changes
  useEffect(() => {
    setAssimilationDice(0);
  }, [popoverData.name, popoverData.pool]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Ensure popover is fully visible in the viewport (adjust if near edges)
  useEffect(() => {
    // reset to initial requested coordinates when popoverData changes
    setPosition({ top: popoverData.top, left: popoverData.left });

    const adjust = () => {
      if (!popoverRef.current) return;
      const rect = popoverRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const padding = 12; // keep some space from edges

      let newLeft = popoverData.left;
      let newTop = popoverData.top;

      // If popover would overflow right edge, shift left
      if (rect.right > vw - padding) {
        newLeft = Math.max(padding, popoverData.left - (rect.right - (vw - padding)));
      }
      // If popover would overflow left edge, shift right
      if (rect.left < padding) {
        newLeft = Math.min(vw - padding, popoverData.left + (padding - rect.left));
      }
      // If popover would overflow bottom edge, move it above the click point
      if (rect.bottom > vh - padding) {
        newTop = Math.max(padding, popoverData.top - (rect.bottom - (vh - padding)) - 8);
      }

      setPosition({ top: newTop, left: newLeft });
    };

    // Run adjustment after a short delay to allow layout to settle
    const t = setTimeout(adjust, 0);
    return () => clearTimeout(t);
  }, [popoverData.top, popoverData.left]);

  const handleConfirm = () => {
    onConfirm(
      popoverData.name,
      popoverData.pool,
      isSkillRoll ? assimilationDice : 0,
      popoverData.rollType
    );
  };

  const handleAssimilationChange = (amount: number) => {
    setAssimilationDice((prev) =>
      Math.max(0, Math.min(maxAssimilation, prev + amount))
    );
  };

  return (
    <div
      className="skill-roll-popover"
      ref={popoverRef}
      style={{ top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
    >
      {isSkillRoll ? (
        <>
          <h5 className="popover-title">Usar Dados de Assimilação?</h5>
          <div className="popover-content">
            <label htmlFor="popover-assim-input">Quantidade:</label>
            <div className="popover-stepper">
              <button
                onClick={() => handleAssimilationChange(-1)}
                disabled={assimilationDice <= 0}
              >
                -
              </button>
              <input
                id="popover-assim-input"
                type="number"
                value={assimilationDice}
                onChange={(e) =>
                  setAssimilationDice(
                    Math.max(
                      0,
                      Math.min(maxAssimilation, Number(e.target.value))
                    )
                  )
                }
                min="0"
                max={maxAssimilation}
              />
              <button
                onClick={() => handleAssimilationChange(1)}
                disabled={assimilationDice >= maxAssimilation}
              >
                +
              </button>
            </div>
            <small>
              Total: {popoverData.pool} (Alma:{" "}
              {popoverData.pool - assimilationDice}, Assimilação:{" "}
              {assimilationDice})
            </small>
          </div>
        </>
      ) : (
        <h5 className="popover-title">{popoverData.name}?</h5>
      )}
      <button className="popover-confirm-btn" onClick={handleConfirm}>
        Confirmar Rolagem
      </button>
    </div>
  );
};

type Tab =
  | "COMBATE & EQUIP."
  | "BEYONDER"
  | "MAGIA"
  | "INVENTÁRIO"
  | "HISTÓRICO"
  | "ANTECEDENTES";

const stringToHash = (str: string | undefined) => {
  let hash = 0;
  for (let i = 0; i < (str?.length || 0); i++) {
    const char = str!.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
};

const normalizeAttributeName = (name: string): string => {
  if (!name) return "";
  const specialCases: { [key: string]: string } = {
    "presença (fé)": "carisma",
    presença: "carisma",
  };
  const lowerCaseName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return specialCases[lowerCaseName] || lowerCaseName;
};

export const CharacterSheetPage = () => {
  const { addLiveToast, addLogEntry, logHistory, onRemoveLogEntry } =
    useMyContext();
  const { permissions, loading: permissionsLoading } = usePermissions();
  // =======================================================
  // 1. FONTE DA VERDADE E ESTADO PRINCIPAL
  // =======================================================
  const { agentId, campaignId } = useParams<{ agentId: string; campaignId?: string }>();
  const [allPathways, setAllPathways] = useState<typeof caminhosData>(caminhosData);
  console.log("CharacterSheetPage carregada. AgentID:", agentId, "| CampaignID:", campaignId);
  const navigate = useNavigate();

  // ÚNICO estado para os dados do agente
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "salvo" | "salvando" | "não salvo"
  >("salvo");

  // Estado para URLs assinadas dos avatares
  const [signedAvatarUrls, setSignedAvatarUrls] = useState<{
    avatarHealthy?: string;
    avatarInsane?: string;
    avatarHurt?: string;
  }>({});

  // =======================================================
  // 2. BUSCA DE DADOS (APENAS UMA VEZ)
  // =======================================================
  useEffect(() => {
    if (!agentId) {
      addLiveToast({
        type: "failure",
        title: "Erro",
        message: "ID do Agente não encontrado.",
      });
      navigate('/agents'); // Redireciona para a lista de agentes se não houver ID
      setIsLoading(false);
      return;
    }

    async function fetchAgent() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("agents")
        .select("id, data, is_private")
        .eq("id", agentId)
        .single();

      if (error || !data) {
        console.error("Erro ao buscar agente:", error);
        addLiveToast({
          type: "failure",
          title: "Erro",
          message: "Agente não encontrado.",
        });
        setAgent(null);
      } else {
        const formattedAgent = { ...(data.data as AgentData), id: data.id, isPrivate: !!(data as any).is_private };
        setAgent(formattedAgent);
      }
      setIsLoading(false);
    }
    fetchAgent();
  }, [agentId, addLiveToast]);

  // =======================================================
  // 2.5. GERAR URLs ASSINADAS PARA AVATARES
  // =======================================================
  useEffect(() => {
    if (!agent) return;

    const generateSignedUrls = async () => {
      const newSignedUrls: { avatarHealthy?: string; avatarInsane?: string; avatarHurt?: string } = {};

      const avatarFields = ['avatarHealthy', 'avatarInsane', 'avatarHurt'] as const;
      for (const field of avatarFields) {
        const url = agent.customization?.[field];
        if (url) {
          try {
            const { data } = await supabase.storage.from('agent-avatars').createSignedUrl(url, 3600); // 1 hour
            newSignedUrls[field] = data?.signedUrl || '';
          } catch (error) {
            console.error(`Error generating signed URL for ${field}:`, error);
            newSignedUrls[field] = '';
          }
        } else {
          newSignedUrls[field] = '';
        }
      }

      setSignedAvatarUrls(newSignedUrls);
    };

    generateSignedUrls();
  }, [agent]);

  // =======================================================
  // 2.6. BUSCAR CAMINHOS CUSTOMIZADOS
  // =======================================================
  useEffect(() => {
    async function fetchCustomPathways() {
      try {
        const { data, error } = await supabase.from('custom_pathways').select('*');
        if (error) {
          console.error('Erro ao buscar caminhos customizados:', error);
          return;
        }
        if (data && data.length > 0) {
          const customData = data.reduce((acc: any, path: any) => {
            acc[path.name] = path.pathway_data;
            return acc;
          }, {});
          setAllPathways(prev => ({ ...prev, ...customData }));
        }
      } catch (error) {
        console.error('Erro ao buscar caminhos customizados:', error);
      }
    }
    fetchCustomPathways();
  }, []);

  // =======================================================
  // 3. FUNÇÃO DE ATUALIZAÇÃO CENTRALIZADA
  // =======================================================
  // Hook para Auto-Save com Debounce
  const debouncedAgent = useDebounce(agent, 1500);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Não salva na montagem inicial ou se não houver dados do agente
    if (isInitialMount.current || !debouncedAgent) {
      isInitialMount.current = false;
      return;
    }

    const saveChanges = async () => {
      setSaveStatus("salvando");
      const { id, isPrivate, ...dataToSave } = debouncedAgent; // Separa o ID e campos fora de data
      const { error } = await supabase
        .from("agents")
        .update({ data: dataToSave })
        .eq("id", id); // Salva apenas o objeto 'data'
      if (error) {
        setSaveStatus("não salvo");
        console.error("Auto-save failed:", error);
        addLiveToast({
          type: "failure",
          title: "Erro ao Salvar",
          message: "Não foi possível salvar as alterações automaticamente.",
        });
      } else {
        setSaveStatus("salvo");
      }
    };
    saveChanges();
  }, [debouncedAgent, addLiveToast]); // Removido 'saveStatus' das dependências para evitar loop

  const handleUpdate = useCallback(
    async (update: Partial<AgentData> | { field: string; file: File }) => {
      setSaveStatus("não salvo");

      // Lógica para upload de arquivo
      if (update && typeof update === "object" && "file" in update) {
        const { field, file } = update;
        if (!agent) return;

        try {
          const newUrl = await uploadAgentAvatar(
            agent.id,
            field,
            file,
            agent.customization?.[field]
          ); // Sua função de API
          // Após o upload, atualiza o estado local com a nova URL
          setAgent((prevAgent: AgentData | null) => {
            if (!prevAgent) return null;
            const newCustomization = {
              ...prevAgent.customization,
              [field]: newUrl,
            };
            return { ...prevAgent, customization: newCustomization };
          });
          addLiveToast({
            type: "success",
            title: "Avatar Atualizado!",
            message: "Sua nova imagem foi salva.",
          });
        } catch (error) {
          addLiveToast({
            type: "failure",
            title: "Erro no Upload",
            message: "Não foi possível salvar seu avatar.",
          });
        }
        return; // Encerra a função aqui para não prosseguir com a lógica de mesclagem
      }

      // Se a atualização inclui a privacidade, persista imediatamente no topo (coluna is_private)
      if (update && typeof update === 'object' && 'isPrivate' in update) {
        const newIsPrivate = (update as any).isPrivate === true;
        try {
          if (agent?.id) {
            const { error } = await supabase
              .from('agents')
              .update({ is_private: newIsPrivate })
              .eq('id', agent.id);
            if (error) throw error;
          }
          setAgent(prev => prev ? { ...prev, isPrivate: newIsPrivate } as AgentData : prev);
        } catch (e) {
          addLiveToast({ type: 'failure', title: 'Erro', message: 'Não foi possível atualizar a privacidade.' });
        }
      } else {
        // Lógica de mesclagem de dados normal (sem upload)
        setAgent((prev) =>
          prev ? { ...prev, ...(update as Partial<AgentData>) } : null
        );
      }
    },
    [agent, addLiveToast]
  );

  const [activeTab, setActiveTab] = useState<Tab>("BEYONDER");

  // Refatoração: Um único estado para gerenciar todos os modais
  type ModalType =
    | "magicGrimoire"
    | "improvement"
    | "addWeapon"
    | "addProtection"
    | "createMagicAttack"
    | "customization"
    | "diceRoller"
    | "mythicalForm"
    | "createPathway";
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [improvingPathway, setImprovingPathway] = useState<string | null>(null);

  // Estado relacionado à Forma Mítica
  const [isMythicalFormActive, setIsMythicalFormActive] = useState(false);
  const [activeMythicalForm, setActiveMythicalForm] =
    useState<MythicalFormStage | null>(null);
  const [corruptionPoints, setCorruptionPoints] = useState(0);
  const [originalState, setOriginalState] = useState<{
    attributes: Attributes;
    maxVitality: number;
  } | null>(null);
  const [hasMaintainedForm, setHasMaintainedForm] = useState(false);
  const [maintainButtonFeedback, setMaintainButtonFeedback] = useState(false);
  const prevPathwayRef = useRef<string>("");
  const [editingSkillAttr, setEditingSkillAttr] = useState<string | null>(null);

  const [rollPopover, setRollPopover] = useState<{
    isVisible: boolean;
    top: number;
    left: number;
    name: string;
    pool: number;
    rollType: RollType;
    meta?: any;
  } | null>(null);

  const pathwayData = useMemo(() => {
    if (!agent) return null;
    // Suporte para novo formato (pathways) e antigo (pathway)
    let pathwayKey: string | undefined;
    if (agent.character.pathways?.primary) {
      pathwayKey = agent.character.pathways.primary;
    } else if (agent.character.pathway) {
      // Fallback para formato antigo
      pathwayKey = Array.isArray(agent.character.pathway) 
        ? agent.character.pathway[0] 
        : agent.character.pathway;
    }
    return pathwayKey ? allPathways[pathwayKey] : null;
  }, [agent, allPathways]);

  const formToActivate = useMemo(() => {
    if (!pathwayData?.mythicalForm || !agent) return null;
    return agent.character.sequence <= 2
      ? pathwayData.mythicalForm.complete
      : pathwayData.mythicalForm.incomplete;
  }, [pathwayData, agent]);

  // =======================================================
  // 👇👇👇 A GRANDE MUDANÇA ESTÁ AQUI 👇👇👇
  // =======================================================
  const derivedStats = useMemo(() => {
    if (!agent) return null;

    // Suporte para novo formato (pathways) e antigo (pathway)
    let pathwayKey: string | undefined;
    if (agent.character.pathways?.primary) {
      pathwayKey = agent.character.pathways.primary;
    } else if (agent.character.pathway) {
      pathwayKey = Array.isArray(agent.character.pathway) 
        ? agent.character.pathway[0] 
        : agent.character.pathway;
    }
    const pathwayData = pathwayKey ? allPathways[pathwayKey] : null;
    if (!pathwayData) return null;

    const { sequence } = agent.character;
    const base = computeDerivedFromPrimary(agent, pathwayData);
    // Verifica se tem CAMINHO DA RODA DA FORTUNA (suporta ambos formatos)
    let characterPathways: string[] = [];
    if (agent.character.pathways) {
      characterPathways = [agent.character.pathways.primary, ...agent.character.pathways.secondary].filter(Boolean);
    } else if (agent.character.pathway) {
      characterPathways = Array.isArray(agent.character.pathway) ? agent.character.pathway : [agent.character.pathway];
    }
    const hasFortuneWheel = characterPathways.includes("CAMINHO DA RODA DA FORTUNA");
    const maxLuckPoints = hasFortuneWheel ? getMaxLuckPointsBySequence(sequence) : 0;

    return {
      maxVitality: base.maxVitality,
      maxSpirituality: base.maxSpirituality,
      maxWillpower: base.maxWillpower,
      maxSanity: base.maxSanity,
      absorption: base.absorption,
      maxLuckPoints,
    };
  }, [agent, allPathways]); // Este hook só recalcula quando 'agent' ou 'allPathways' muda

  // Agora, usamos os valores calculados diretamente no JSX
  const effectiveAgentData = useMemo(() => {
    if (!agent) return null;
    if (!derivedStats) return agent;

    return {
      ...agent,
      character: {
        ...agent.character,
        ...derivedStats,
        vitality: Math.min(agent.character.vitality, derivedStats.maxVitality),
        spirituality: Math.min(
          agent.character.spirituality,
          derivedStats.maxSpirituality
        ),
        willpower: Math.min(
          agent.character.willpower,
          derivedStats.maxWillpower
        ),
        sanity: Math.min(
          agent.character.sanity,
          derivedStats.maxSanity
        ),
        maxSanity: derivedStats.maxSanity,
        luckPoints: Math.min(
          agent.character.luckPoints || 0,
          derivedStats?.maxLuckPoints ?? (agent.character.maxLuckPoints || 0)
        ),
      },
    };
  }, [agent, derivedStats]);
  // =======================================================
  // 👆👆👆 FIM DA GRANDE MUDANÇA 👆👆👆
  // =======================================================

  const sheetStyle = useMemo(() => {
    if (!agent) return {};
    const color = agent.character.pathwayColor || "#9c27b0";
    return {
      "--character-color": color,
      "--character-color-dark": darkenColor(color, 0.2),
      "--character-contrast-color": getContrastColor(color),
      "--character-color-rgb": hexToRgb(color),
    };
  }, [agent]);

  if (isLoading) return <div>Carregando Ficha...</div>;

  if (!agent || !effectiveAgentData) return <div>Agente não encontrado.</div>;

  console.log("Renderizando com a aba ativa:", activeTab);

  const tabButtons: Tab[] = [
    "COMBATE & EQUIP.",
    "BEYONDER",
    "MAGIA",
    "INVENTÁRIO",
    "HISTÓRICO",
    "ANTECEDENTES",
  ];

  const handleCharacterFieldChange = (field: keyof Character, value: any) => {
    const updatedCharacter = {
      ...effectiveAgentData.character,
      [field]: value,
    };

    if (field === "sequence" && value < effectiveAgentData.character.sequence) {
      updatedCharacter.paTotalGasto = 0;
      updatedCharacter.purifiedDiceThisSequence = 0;
      updatedCharacter.assimilationDice =
        (effectiveAgentData.character.assimilationDice || 0) + 4;
      updatedCharacter.maxAssimilationDice =
        (effectiveAgentData.character.maxAssimilationDice || 0) + 4;

      addLiveToast({
        type: "success",
        title: "Avanço de Sequência!",
        message: `Você avançou para a Sequência ${value}. Ganhou 4 Dados de Assimilação.`,
      });
    }

    handleUpdate({ character: updatedCharacter });
  };

  const handleAttributeChange = (
    attribute: keyof Attributes,
    value: number
  ) => {
    handleUpdate({
      attributes: { ...effectiveAgentData.attributes, [attribute]: value },
    });
  };

  // Funções para gerenciar múltiplos caminhos (primário/secundários)
  const handlePathwayToggle = (pathwayName: string) => {
    const currentPathways = effectiveAgentData.character.pathways;
    
    // Se não existe estrutura de pathways, cria uma nova
    if (!currentPathways || !currentPathways.primary) {
      handleUpdate({ 
        character: { 
          ...effectiveAgentData.character, 
          pathways: { primary: pathwayName, secondary: [] } 
        } 
      });
      return;
    }

    const isPrimary = currentPathways.primary === pathwayName;
    const isSecondary = currentPathways.secondary.includes(pathwayName);

    if (isPrimary) {
      // Não permite remover o primário diretamente
      addLiveToast({
        type: 'failure',
        title: 'Ação Inválida',
        message: 'Não é possível remover o caminho primário. Defina outro como primário primeiro.'
      });
      return;
    }

    if (isSecondary) {
      // Remove o caminho secundário
      const newSecondary = currentPathways.secondary.filter(p => p !== pathwayName);
      handleUpdate({ 
        character: { 
          ...effectiveAgentData.character, 
          pathways: { primary: currentPathways.primary, secondary: newSecondary } 
        } 
      });
    } else {
      // Adiciona novo caminho secundário (verifica limite)
      const totalPathways = 1 + currentPathways.secondary.length; // primary + secondary
      if (totalPathways >= permissions.max_pathways) {
        addLiveToast({
          type: 'failure',
          title: 'Limite Atingido',
          message: `Você só pode ter ${permissions.max_pathways} caminho(s).`
        });
        return;
      }

      const newSecondary = [...currentPathways.secondary, pathwayName];
      handleUpdate({ 
        character: { 
          ...effectiveAgentData.character, 
          pathways: { primary: currentPathways.primary, secondary: newSecondary } 
        } 
      });
    }
  };

  const setAsPrimaryPathway = (pathwayName: string) => {
    const currentPathways = effectiveAgentData.character.pathways;
    if (!currentPathways || currentPathways.primary === pathwayName) return;

    // Move o primário antigo para secundários e define o novo primário
    const newSecondary = [
      ...currentPathways.secondary.filter(p => p !== pathwayName),
      currentPathways.primary
    ];

    handleUpdate({ 
      character: { 
        ...effectiveAgentData.character, 
        pathways: { primary: pathwayName, secondary: newSecondary } 
      } 
    });

    addLiveToast({
      type: 'success',
      title: 'Caminho Primário Alterado',
      message: `${pathwayName} agora é seu caminho primário.`
    });
  };

  const handleOpenImprovementModal = (pathwayName: string) => {
    setImprovingPathway(pathwayName);
    setActiveModal('improvement');
  };

  const toggleMythicalForm = () => {
    if (isMythicalFormActive) {
      if (originalState) {
        const expiationDifficulty = Math.max(1, 1 + corruptionPoints);
        const { willpower } = effectiveAgentData.character;
        const { rolls, successes } = rollDice(willpower, expiationDifficulty);
        const expiationPassed = successes > 0;

        let logMessage = "Forma Mítica desativada.";
        let logDetails = `Teste de Expiação: Parada ${willpower}, Dificuldade ${expiationDifficulty}. Rolagem [${rolls.join(
          ", "
        )}]. `;

        let newSanity = effectiveAgentData.character.sanity;

        if (!expiationPassed) {
          const sanityLoss = corruptionPoints;
          newSanity -= sanityLoss;
          logDetails += `Falha! Perdeu ${sanityLoss} de Sanidade.`;
          addLiveToast({
            type: "failure",
            title: "Corrupção Mítica",
            message: `Falhou no Teste de Expiação! Perdeu ${sanityLoss} de Sanidade.`,
          });
        } else {
          logDetails += `Sucesso! A mente resistiu à corrupção.`;
        }
        addLogEntry({
          type: "info",
          title: "Forma Mítica",
          message: logMessage,
          details: logDetails,
        });

        const agentToUpdate = {
          attributes: originalState.attributes,
          character: {
            ...effectiveAgentData.character,
            vitality: Math.min(
              effectiveAgentData.character.vitality,
              originalState.maxVitality
            ),
            tempHpBonus: 0,
            sanity: newSanity,
          },
        };
        handleUpdate(agentToUpdate);
      }

      setIsMythicalFormActive(false);
      setActiveMythicalForm(null);
      setOriginalState(null);
      setHasMaintainedForm(false);
      setCorruptionPoints(0);
    } else {
      if (!formToActivate) {
        addLiveToast({
          type: "failure",
          title: "Forma Mítica",
          message: "Dados da Forma Mítica não encontrados para este caminho.",
        });
        return;
      }

      setOriginalState({
        attributes: { ...effectiveAgentData.attributes },
        maxVitality: effectiveAgentData.character.maxVitality,
      });

      const newAttributes = { ...effectiveAgentData.attributes };
      Object.entries(formToActivate.attributeBoosts).forEach(
        ([attr, boost]) => {
          let key = attr.toLowerCase();
          if (key.includes("presença")) key = "carisma";
          if (newAttributes.hasOwnProperty(key))
            newAttributes[key as keyof Attributes] += boost;
        }
      );

      const vitalityIncrease =
        (newAttributes.vigor - effectiveAgentData.attributes.vigor) * 3 +
        formToActivate.tempHpBonus;

      handleUpdate({
        attributes: newAttributes,
        character: {
          ...effectiveAgentData.character,
          vitality: effectiveAgentData.character.vitality + vitalityIncrease,
          tempHpBonus: formToActivate.tempHpBonus,
        },
      });

      setIsMythicalFormActive(true);
      setActiveMythicalForm(formToActivate);
      setCorruptionPoints(0);
      setHasMaintainedForm(false);
      addLogEntry({
        type: "info",
        title: "Forma Mítica",
        message: "Forma Mítica ativada!",
        details: `Bônus aplicados. Cuidado com a corrupção.`,
      });
    }
  };

  const handleMaintainForm = () => {
    if (!isMythicalFormActive || !activeMythicalForm || hasMaintainedForm)
      return;
    setHasMaintainedForm(true);
    setMaintainButtonFeedback(true);
    setTimeout(() => setMaintainButtonFeedback(false), 400);

    const newCorruptionPoints = corruptionPoints + 1;
    setCorruptionPoints(newCorruptionPoints);

    const { sequence } = effectiveAgentData.character;
    const formInUse =
      sequence <= 2
        ? pathwayData?.mythicalForm?.complete
        : pathwayData?.mythicalForm?.incomplete;
    let sanityCost = 0;
    let sanityCostString = "";

    if ((sequence === 4 || sequence === 3) && formInUse?.sanityCostPerTurn) {
      sanityCost = rollSimpleDice(formInUse.sanityCostPerTurn);
      sanityCostString = ` Custo: ${sanityCost} (${formInUse.sanityCostPerTurn}) de Sanidade`;
      handleCharacterFieldChange(
        "sanity",
        effectiveAgentData.character.sanity - sanityCost
      );
    }

    addLogEntry({
      type: "info",
      title: "Forma Mítica Mantida",
      message: `Corrupção aumentou para ${newCorruptionPoints}.`,
      details: `Você mantém a Forma Mítica.${sanityCostString} e +1 Ponto de Corrupção.`,
    });
    addLiveToast({
      type: "info",
      title: "Forma Mítica Mantida",
      message: `Corrupção: ${newCorruptionPoints}.`,
    });
  };

  const handlePassTurn = () => {
    if (isMythicalFormActive && !hasMaintainedForm) {
      addLogEntry({
        type: "info",
        title: "Forma Mítica",
        message: "Forma Mítica não foi mantida e se desfez.",
      });
      toggleMythicalForm();
    } else {
      addLogEntry({
        type: "info",
        title: "Turno",
        message: "Turno encerrado.",
      });
    }
    setHasMaintainedForm(false);
  };

  const handleControlTest = () => {
    const { autocontrole } = effectiveAgentData.attributes;
    const { willpower, controlStage } = effectiveAgentData.character;
    const pool = autocontrole + willpower;
    const difficulty = 6 + (controlStage || 0);
    const { rolls, successes } = rollDice(pool, difficulty);

    const resultType = successes > 0 ? "success" : "failure";
    const title = "Teste de Controle";
    const message = `${successes} sucesso(s)!`;
    const details = `Parada: ${pool} (Autocontrole ${autocontrole} + Vontade ${willpower})\nDificuldade: ${difficulty}\nRolagem: [${rolls.join(
      ", "
    )}]`;

    addLiveToast({ type: resultType, title, message });
    addLogEntry({ type: resultType, title, message, details });
  };

  const handleInvokeAnchor = (index: number) => {
    const anchor = effectiveAgentData.character.anchors[index];
    if (!anchor || !anchor.conviction || !anchor.symbol) return;

    const newSanity = Math.min(
      effectiveAgentData.character.maxSanity,
      effectiveAgentData.character.sanity + 1
    );
    handleCharacterFieldChange("sanity", newSanity);

    addLiveToast({
      type: "info",
      title: "Âncora Invocada",
      message: `Você recuperou 1 de Sanidade ao focar em "${anchor.conviction}".`,
    });
  };

  const handleConfirmRoll = async (
    name: string,
    pool: number,
    assimilationDiceUsed: number,
    rollType: RollType
  ) => {
    if (rollType === "skill") {
      if (
        assimilationDiceUsed > effectiveAgentData.character.assimilationDice
      ) {
        addLiveToast({
          type: "failure",
          title: "Dados Insuficientes",
          message: `Você tentou usar ${assimilationDiceUsed}, mas só tem ${effectiveAgentData.character.assimilationDice}.`,
        });
        setRollPopover(null);
        return;
      }

      const soulDiceUsed = Math.max(0, pool - assimilationDiceUsed);

      const soulRolls = Array.from(
        { length: soulDiceUsed },
        () => Math.floor(Math.random() * 10) + 1
      );
      const assimilationRolls = Array.from(
        { length: assimilationDiceUsed },
        () => Math.floor(Math.random() * 10) + 1
      );

      let madnessTriggers = 0;
      const soulSuccessContributions: number[] = [];
      const assimilationSuccessContributions: number[] = [];

      soulRolls.forEach((roll) => {
        if (roll >= 6 && roll <= 9) soulSuccessContributions.push(1);
        else if (roll === 10) soulSuccessContributions.push(2);
      });

      assimilationRolls.forEach((roll) => {
        if (roll === 1) madnessTriggers++;
        else if (roll >= 6 && roll <= 9)
          assimilationSuccessContributions.push(2);
        else if (roll === 10) assimilationSuccessContributions.push(3);
      });

      const soulSuccesses = soulSuccessContributions.reduce((a, b) => a + b, 0);
      const assimilationSuccesses = assimilationSuccessContributions.reduce(
        (a, b) => a + b,
        0
      );

      const allSuccessContributions = [
        ...soulSuccessContributions,
        ...assimilationSuccessContributions,
      ];
      let totalSuccesses = allSuccessContributions.reduce(
        (acc, val) => acc + val,
        0
      );

      let madnessMessage = "";
      if (madnessTriggers > 0) {
        allSuccessContributions.sort((a, b) => b - a);
        let successesCancelled = 0;
        for (let i = 0; i < madnessTriggers; i++) {
          if (i < allSuccessContributions.length) {
            const cancelled = allSuccessContributions[i];
            totalSuccesses -= cancelled;
            successesCancelled += cancelled;
          }
        }
        madnessMessage = ` O poder se rebelou, cancelando ${successesCancelled} sucesso(s).`;
      }

      const finalSuccesses = Math.max(0, totalSuccesses);

      const breakdownLines = [];
      if (soulRolls.length > 0)
        breakdownLines.push(
          `Alma [${soulRolls.join(", ")}] = ${soulSuccesses} Sucesso(s)`
        );
      if (assimilationRolls.length > 0)
        breakdownLines.push(
          `Assimilação [${assimilationRolls.join(
            ", "
          )}] = ${assimilationSuccesses} Sucesso(s)`
        );
      if (madnessTriggers > 0)
        breakdownLines.push(
          `Intrusão de Loucura (${madnessTriggers}x '1') cancelou os maiores sucessos.`
        );

      const resultType: ToastData["type"] =
        madnessTriggers > 0
          ? "failure"
          : finalSuccesses > 0
          ? "success"
          : "failure";
      const title = madnessTriggers > 0 ? `⚠️ INTRUSÃO DE LOUCURA!` : name;
      const toastMessage =
        madnessTriggers > 0
          ? `O poder se rebelou! Resultado: ${finalSuccesses} sucesso(s).`
          : `${finalSuccesses} sucesso(s).`;
      const logMessage = `${finalSuccesses} sucesso(s).${madnessMessage}`;
      const details = breakdownLines.join("\n");

      // reserve total damage for logging / payload (may be set when attack formula present)
      let totalDamageForPayload: number | null = null;

      // If this popover came from an attack, compute damage using the attack's damage formula
      try {
        const meta = (rollPopover && (rollPopover as any).meta) || null;
          if (meta && meta.isAttack && meta.damageFormula) {
            const damageResult = rollDamage(meta.damageFormula, finalSuccesses);
            // If the damage formula doesn't explicitly include 'sucessos', add successes to the damage total
            const formulaIncludesSuccesses = /sucessos/i.test(meta.damageFormula);
            const baseDamageTotal = damageResult?.total ?? 0;
            const totalDamage = baseDamageTotal + (formulaIncludesSuccesses ? 0 : finalSuccesses);
            const damageBreakdown = `${damageResult?.breakdown ?? ''}${formulaIncludesSuccesses ? '' : ` | + Sucessos: ${finalSuccesses} = ${totalDamage}`}`;
            const damageObj = { total: totalDamage, breakdown: damageBreakdown };
            const damageText = `Dano total: ${damageObj.total} (${damageObj.breakdown})`;
            // Mostrar apenas a mensagem resumida no toast ao vivo; detalhes completos vão para o log
            addLiveToast({
              type: resultType,
              title: title,
              message: toastMessage,
              rollInfo: {
                soulRolls,
                assimilationRolls,
                successes: finalSuccesses,
                damage: damageObj,
              },
            });
            addLogEntry({ type: resultType, title: title, message: `${logMessage} · ${damageText}`, details: `${details}\n${damageText}`, damage: damageObj.total ?? null, rollInfo: { soulRolls, assimilationRolls, successes: finalSuccesses, damage: damageObj } });
            totalDamageForPayload = damageObj.total ?? null;
            // If logging to campaign, include damage in payload below (handled later)
          } else {
          addLiveToast({
            type: resultType,
            title,
            message: toastMessage,
            rollInfo: { soulRolls, assimilationRolls, successes: finalSuccesses, damage: null },
          });
          addLogEntry({
            type: resultType,
            title: title,
            message: logMessage,
            details,
            rollInfo: { soulRolls, assimilationRolls, successes: finalSuccesses, damage: null },
          });
        }
      } catch (err) {
        // Fallback to normal toast/log if damage calculation fails
        addLiveToast({ type: resultType, title, message: toastMessage });
        addLogEntry({
          type: resultType,
          title: title,
          message: logMessage,
          details,
        });
      }

      if (assimilationDiceUsed > 0) {
        handleCharacterFieldChange(
          "assimilationDice",
          effectiveAgentData.character.assimilationDice - assimilationDiceUsed
        );
      }
      // Log the dice roll to the campaign
      try {
        // 👇👇👇 ADICIONE ESTE BLOCO DE LOGS 👇👇👇
        console.group("--- VERIFICANDO DADOS PARA LOG DE ROLAGEM ---");
        console.log("Valor de `campaignId`:", campaignId);
        console.log("Objeto `agent` existe?", !!agent);
        if (agent) {
            console.log("Nome do personagem:", agent.character?.name);
        }
        console.groupEnd();
        // 👆👆👆 FIM DO BLOCO DE LOGS 👆👆👆
        if (agent?.character?.name) {
          if (campaignId) {
            const rollData = {
              soulRolls: soulRolls, // Ex: [8, 5]
              assimilationRolls: assimilationRolls, // Ex: [10, 1]
              totalSuccesses: finalSuccesses,
              type: name // Ex: "Briga", "Absorção", "Teste de Controle"
            };
            const payload = {
              campaign_id: campaignId,
              character_name: effectiveAgentData.character.name,
              roll_name: name,
              result: `${finalSuccesses} sucesso(s)`, // Um resumo simples
              details: details, // O texto de breakdown
              // 👇 ADICIONE O NOVO CAMPO JSON
              roll_data: rollData,
              damage: totalDamageForPayload,
            };
            console.log("3. Payload a ser enviado para a API:", payload);
            logDiceRoll(payload);
          } else {
            console.log("Rolagem realizada, mas não logada na campanha (sem campaignId).");
          }
        }
      } catch (error) {
        console.error("Erro ao registrar rolagem de dados:", error);
      }
    } else if (rollType === "absorption") {
      const rolls = Array.from(
        { length: pool },
        () => Math.floor(Math.random() * 10) + 1
      );
      const successes = rolls.filter((r) => r >= 6).length;

      const resultType: ToastData["type"] =
        successes > 0 ? "success" : "failure";
      const title = name;
      const message = `${successes} sucesso(s).`;
      const details = `Parada: ${pool}\nRolagem: [${rolls.join(", ")}]`;

      addLiveToast({ type: resultType, title, message, rollInfo: { absorptionRolls: rolls, successes, damage: null } });
      addLogEntry({ type: resultType, title, message, details, rollInfo: { absorptionRolls: rolls, successes, damage: null } });

      // Log the dice roll to the campaign
      try {
        // 👇👇👇 ADICIONE ESTE BLOCO DE LOGS 👇👇👇
        console.group("--- VERIFICANDO DADOS PARA LOG DE ROLAGEM (ABSORÇÃO) ---");
        console.log("Valor de `campaignId`:", campaignId);
        console.log("Objeto `agent` existe?", !!agent);
        if (agent) {
            console.log("Nome do personagem:", agent.character?.name);
        }
        console.groupEnd();
        // 👆👆👆 FIM DO BLOCO DE LOGS 👆👆👆
        if (campaignId && agent?.character?.name) {
          const rollData = {
            rolls: rolls, // Ex: [8, 5]
            totalSuccesses: successes,
            type: "absorption" // Ex: "Absorção"
          };
          const payload = {
            campaign_id: campaignId,
            character_name: effectiveAgentData.character.name,
            roll_name: name,
            result: `${successes} sucesso(s)`,
            details: details,
            roll_data: rollData
          };

          console.log("3. Payload a ser enviado para a API:", payload);
          logDiceRoll(payload);
        } else {
          console.warn("LOG DE ROLAGEM BLOQUEADO: Condições não atendidas.");
        }
      } catch (error) {
        console.error("Erro ao registrar rolagem de dados:", error);
      }
    }

    setRollPopover(null);
  };

  const handleDirectSkillRoll = (name: string, pool: number) => {
    handleConfirmRoll(name, pool, 0, "skill");
  };

  const handleRollRequest = (
    event: React.MouseEvent,
    name: string,
    pool: number,
    rollType: RollType,
    meta?: any
  ) => {
    // Prefer anchoring to the clicked element's bounding rect so the popover
    // appears next to the button, not just the click coordinates.
    const target = event.currentTarget as HTMLElement | null;
    let left = event.clientX;
    let top = event.clientY;
    if (target && typeof target.getBoundingClientRect === 'function') {
      const rect = target.getBoundingClientRect();
      left = rect.left + rect.width / 2; // center horizontally on the button
      top = rect.top + rect.height + 8; // place slightly below the button
    }

    setRollPopover({
      isVisible: true,
      top,
      left,
      name,
      pool,
      rollType,
      meta,
    });
  };

  return (
    <div
      className="sheet-container-v2"
      style={sheetStyle as React.CSSProperties}
    >
      <div className="sheet-management-bar">
        <button onClick={() => navigate(-1)} className="back-to-list-btn">
          ← Voltar
        </button>{" "}
        <div className="save-status-indicator">
          {saveStatus === "não salvo" && "Alterações não salvas..."}
          {saveStatus === "salvando" && "Salvando..."}
          {saveStatus === "salvo" && "✓ Salvo"}
        </div>
        <div className="sheet-management-actions">
          <button
            onClick={handlePassTurn}
            className="back-to-list-btn"
            style={{
              borderColor: "var(--success-color)",
              color: "var(--info-color)",
            }}
          >
            Salvar
          </button>
          {permissions.can_create_pathways && (
            <button
              onClick={() => setActiveModal("createPathway")}
              className="customize-btn"
              aria-label="Criar Novo Caminho"
              title="Criar Novo Caminho"
            >
              <FlameIcon />
            </button>
          )}
          <button
            onClick={() => setActiveModal("customization")}
            className="customize-btn"
            aria-label="Personalizar Ficha"
          >
            <PaletteIcon />
          </button>
        </div>
      </div>
      <div className="sheet-grid">
        <div className="sheet-col-left">
          <div className="char-header-v2">
            <div
              className="char-avatar"
              style={{
                backgroundImage: `url(${
                  getAvatarForSanityAndVitality({
                    sanity: effectiveAgentData.character.sanity,
                    maxSanity: effectiveAgentData.character.maxSanity,
                    vitality: effectiveAgentData.character.vitality,
                    maxVitality: effectiveAgentData.character.maxVitality,
                    avatarUrl: signedAvatarUrls.avatarHealthy || effectiveAgentData.customization?.avatarHealthy,
                    insaneAvatarUrl: signedAvatarUrls.avatarInsane || effectiveAgentData.customization?.avatarInsane,
                    deadAvatarUrl: signedAvatarUrls.avatarHurt || effectiveAgentData.customization?.avatarHurt,
                  }) || ""
                })`,
              }}
            ></div>
            <div className="char-info-main">
              <input
                type="text"
                value={effectiveAgentData.character.name}
                onChange={(e) =>
                  handleCharacterFieldChange("name", e.target.value)
                }
              />
            </div>
            <div className="pathway-and-color">
              <PathwayManager
                agent={effectiveAgentData}
                permissions={permissions}
                allPathways={allPathways}
                onUpdate={handleUpdate}
                onPathwayToggle={handlePathwayToggle}
                onSetAsPrimary={setAsPrimaryPathway}
              />
            </div>
            <div className="char-info-sub">
              <input
                type="text"
                value={effectiveAgentData.character.player}
                onChange={(e) =>
                  handleCharacterFieldChange("player", e.target.value)
                }
              />
              <input
                type="number"
                value={effectiveAgentData.character.sequence}
                onChange={(e) =>
                  handleCharacterFieldChange("sequence", Number(e.target.value))
                }
              />
            </div>
          </div>
          <div className="status-bars-container">
            <StatusBar
              label="Vitalidade"
              value={effectiveAgentData.character.vitality}
              max={effectiveAgentData.character.maxVitality}
              onMaxValueChange={(v) =>
                handleCharacterFieldChange("maxVitality", v)
              }
              onValueChange={(v) => handleCharacterFieldChange("vitality", v)}
              color="#D32F2F"
            />
            <StatusBar
              label="Espiritualidade"
              value={effectiveAgentData.character.spirituality}
              max={effectiveAgentData.character.maxSpirituality}
              onMaxValueChange={(v) =>
                handleCharacterFieldChange("maxSpirituality", v)
              }
              onValueChange={(v) =>
                handleCharacterFieldChange("spirituality", v)
              }
              color="#1976D2"
            />
            <StatusBar
              label="Vontade"
              value={effectiveAgentData.character.willpower}
              max={effectiveAgentData.character.maxWillpower}
              onMaxValueChange={(v) =>
                handleCharacterFieldChange("maxWillpower", v)
              }
              onValueChange={(v) => handleCharacterFieldChange("willpower", v)}
              color="#388E3C"
            />
            {(() => {
              const c = effectiveAgentData.character;
              let hasWheel = false;
              if (c.pathways?.primary) {
                const list = [c.pathways.primary, ...(c.pathways.secondary || [])].filter(Boolean);
                hasWheel = list.includes("CAMINHO DA RODA DA FORTUNA");
              } else if (c.pathway) {
                hasWheel = Array.isArray(c.pathway)
                  ? c.pathway.includes("CAMINHO DA RODA DA FORTUNA")
                  : c.pathway === "CAMINHO DA RODA DA FORTUNA";
              }
              return hasWheel;
            })() && (
              <StatusBar
                label="Pontos de Sorte"
                value={effectiveAgentData.character.luckPoints || 0}
                max={effectiveAgentData.character.maxLuckPoints || 0}
                onValueChange={(v) =>
                  handleCharacterFieldChange("luckPoints", v)
                }
                color="#FFC107"
              />
            )}
          </div>

          {!isMythicalFormActive &&
            effectiveAgentData.character.sequence <= 4 &&
            pathwayData?.mythicalForm && (
              <div className="mythical-form-trigger-container">
                <button
                  id="mythical-form-trigger-btn"
                  onClick={() => setActiveModal("mythicalForm")}
                  aria-label="Ativar Forma Mítica"
                  title="Ativar Forma Mítica"
                >
                  <FlameIcon />
                </button>
              </div>
            )}

          <SanityTracker
            sanity={effectiveAgentData.character.sanity}
            maxSanity={effectiveAgentData.character.maxSanity}
            onSanityChange={(v) => handleCharacterFieldChange("sanity", v)}
            onMaxSanityChange={(v) =>
              handleCharacterFieldChange("maxSanity", v)
            }
            pathwayColor={
              effectiveAgentData.character.pathwayColor || "#6a1b9a"
            }
          />

          {isMythicalFormActive ? (
            <div id="mythical-form-status-banner">
              <h2>Forma Mítica Ativa!</h2>
              <p id="mf-corruption-counter">
                Pontos de Corrupção: {corruptionPoints}
              </p>
              <div className="mythical-form-banner-actions">
                <button
                  id="maintain-form-btn"
                  className={`maintain-btn ${
                    maintainButtonFeedback ? "feedback" : ""
                  }`}
                  onClick={handleMaintainForm}
                  disabled={hasMaintainedForm}
                >
                  {hasMaintainedForm ? "Forma Mantida" : "Manter Forma"}
                </button>
                <button className="deactivate-btn" onClick={toggleMythicalForm}>
                  Desativar Forma Mítica
                </button>
              </div>
            </div>
          ) : (
            <AttributesSection
              attributes={effectiveAgentData.attributes}
              onAttributeChange={handleAttributeChange}
            />
          )}

          <AnchorsTracker
            anchors={effectiveAgentData.character.anchors}
            onAnchorsChange={(v) => handleCharacterFieldChange("anchors", v)}
            onInvokeAnchor={handleInvokeAnchor}
          />
          <PaTracker
            agent={effectiveAgentData}
            onUpdate={handleUpdate}
            onOpenImprovements={() => setActiveModal("improvement")}
            addLiveToast={addLiveToast}
          />
        </div>

        <div className="sheet-col-middle">
          <div className="tabs-section">
            <nav className="tabs-nav">
              {tabButtons.map((tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </nav>
            <div className="tab-content">
              <div
                style={{
                  display: activeTab === "COMBATE & EQUIP." ? "block" : "none",
                }}
              >
                <CombatTab
                  agent={effectiveAgentData}
                  onUpdate={handleUpdate}
                  addLiveToast={addLiveToast}
                  addLogEntry={addLogEntry}
                  onOpenAddWeaponModal={() => setActiveModal("addWeapon")}
                  onOpenAddProtectionModal={() =>
                    setActiveModal("addProtection")
                  }
                  onOpenMagicCreator={() => setActiveModal("createMagicAttack")}
                  onRollRequest={handleRollRequest}
                  onDirectRoll={handleDirectSkillRoll}
                />
              </div>
              <div
                style={{ display: activeTab === "BEYONDER" ? "block" : "none" }}
              >
                <BeyonderTab
                  abilities={effectiveAgentData.habilidadesBeyonder}
                  onAbilitiesChange={(v) =>
                    handleUpdate({ habilidadesBeyonder: v })
                  }
                  pathwayData={pathwayData}
                  allPathways={allPathways}
                  sequence={effectiveAgentData.character.sequence}
                  character={effectiveAgentData.character}
                  onCharacterChange={handleCharacterFieldChange}
                  onOpenImprovementModal={handleOpenImprovementModal}
                />
              </div>
              <div
                style={{ display: activeTab === "MAGIA" ? "block" : "none" }}
              >
                <MagicTab
                  agent={effectiveAgentData}
                  onUpdate={handleUpdate}
                  onOpenMagicGrimoire={() => setActiveModal("magicGrimoire")}
                  addLogEntry={addLogEntry}
                />
              </div>
              <div
                style={{
                  display: activeTab === "INVENTÁRIO" ? "block" : "none",
                }}
              >
                <InventoryTab
                  inventory={effectiveAgentData.inventory}
                  onInventoryChange={(v) => handleUpdate({ inventory: v })}
                  artifacts={effectiveAgentData.artifacts}
                  onArtifactsChange={(v) => handleUpdate({ artifacts: v })}
                  money={effectiveAgentData.money}
                  onMoneyChange={(v) => handleUpdate({ money: v })}
                />
              </div>
              <div
                style={{
                  display: activeTab === "HISTÓRICO" ? "block" : "none",
                }}
              >
                <NotesTab
                  character={effectiveAgentData.character}
                  onFieldChange={handleCharacterFieldChange}
                />
              </div>
              <div
                style={{
                  display: activeTab === "ANTECEDENTES" ? "block" : "none",
                }}
              >
                <AntecedentesTab
                  agent={effectiveAgentData}
                  onUpdate={handleUpdate}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sheet-col-right">
          <div className="pericias-section">
            <div className="pericias-header">
              <h3 className="section-title">Perícias</h3>
              <button
                onClick={() => setActiveModal("diceRoller")}
                className="dice-roller-modal-btn-inline"
                aria-label="Abrir Rolador de Dados"
              >
                <DiceIcon />
              </button>
            </div>
            {Object.entries(effectiveAgentData.habilidades).map(
              ([type, list]) => (
                <div key={type}>
                  <h4 className="habilidade-subheader">
                    {type === "gerais" ? "Gerais" : "Investigativas"}
                  </h4>
                  {(list as Habilidade[]).map((skill, index) => {
                    const attrName = skill.attr.split("/")[0];
                    const normalizedAttr = normalizeAttributeName(
                      attrName
                    ) as keyof Attributes;
                    const attrValue =
                      effectiveAgentData.attributes[normalizedAttr] || 0;
                    const total = skill.points + attrValue;
                    return (
                      <div key={skill.name} className="pericia-item-v2">
                        <label>{skill.name}</label>
                        <div className="pericia-controls">
                          <div className="skill-attr-selector-wrapper">
                            {editingSkillAttr === skill.name ? (
                              <select
                                className="skill-attr-select"
                                value={skill.attr}
                                onChange={(e) => {
                                  const newList = [...(list as Habilidade[])];
                                  newList[index] = {
                                    ...skill,
                                    attr: e.target.value,
                                  };
                                  handleUpdate({
                                    habilidades: {
                                      ...effectiveAgentData.habilidades,
                                      [type]: newList,
                                    },
                                  });
                                  setEditingSkillAttr(null);
                                }}
                                onBlur={() => setEditingSkillAttr(null)}
                                autoFocus
                              >
                                <option value="Força">FOR</option>
                                <option value="Destreza">DES</option>
                                <option value="Constituição">CON</option>
                                <option value="Inteligência">INT</option>
                                <option value="Sabedoria">SAB</option>
                                <option value="Carisma">CAR</option>
                              </select>
                            ) : (
                              <div 
                                className="skill-attr-tag" 
                                onClick={() => setEditingSkillAttr(skill.name)}
                              >
                                {attrName.substring(0, 3).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <input
                            type="number"
                            value={skill.points}
                            onChange={(e) => {
                              const newList = [...(list as Habilidade[])];
                              newList[index] = {
                                ...skill,
                                points: Number(e.target.value),
                              };
                              handleUpdate({
                                habilidades: {
                                  ...effectiveAgentData.habilidades,
                                  [type]: newList,
                                },
                              });
                            }}
                          />
                          <div className="skill-total-display">{total}</div>
                          <button
                            className="skill-roll-btn"
                            onClick={(e) =>
                              handleRollRequest(e, skill.name, total, "skill")
                            }
                          >
                            <DiceIcon />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
          <div className="assimilation-dice-tracker">
            <h3 className="section-title">Dados de Assimilação</h3>
            <div className="pa-display">
              <div className="pa-box">
                <div className="pa-box-value">
                  <input
                    type="number"
                    value={effectiveAgentData.character.assimilationDice}
                    onChange={(e) =>
                      handleCharacterFieldChange(
                        "assimilationDice",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="pa-box-label">Atuais</div>
              </div>
              <div className="pa-box">
                <div className="pa-box-value">
                  <input
                    type="number"
                    value={effectiveAgentData.character.maxAssimilationDice}
                    onChange={(e) =>
                      handleCharacterFieldChange(
                        "maxAssimilationDice",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="pa-box-label">Máximos</div>
              </div>
            </div>
          </div>
          <ControlTestTracker
            currentStage={effectiveAgentData.character.controlStage}
            onStageChange={(v) => handleCharacterFieldChange("controlStage", v)}
            onPerformTest={handleControlTest}
          />
          <NotificationLog toasts={logHistory} onRemove={onRemoveLogEntry} />
        </div>
      </div>

      {rollPopover?.isVisible && (
        <RollPopover
          popoverData={rollPopover}
          onClose={() => setRollPopover(null)}
          onConfirm={handleConfirmRoll}
          agentData={effectiveAgentData}
        />
      )}

      {activeModal === "magicGrimoire" && (
        <MagicGrimoireModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onAddParticles={(p) =>
            handleUpdate({
              learnedParticles: [
                ...effectiveAgentData.learnedParticles,
                ...p.map((i) => ({ ...i, id: Date.now() + Math.random() })),
              ],
            })
          }
        />
      )}
      {activeModal === "improvement" && (
        <ImprovementModal
          isOpen={true}
          onClose={() => {
            setActiveModal(null);
            setImprovingPathway(null);
          }}
          agent={effectiveAgentData}
          onUpdateAgent={handleUpdate}
          addLiveToast={addLiveToast}
          pathwayToImprove={improvingPathway}
          allPathwaysData={allPathways}
        />
      )}
      {activeModal === "addWeapon" && (
        <AddWeaponModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onAddAttack={(a) =>
            handleUpdate({ attacks: [...effectiveAgentData.attacks, a] })
          }
        />
      )}
      {activeModal === "addProtection" && (
        <AddProtectionModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onAddProtection={(p) =>
            handleUpdate({
              protections: [...effectiveAgentData.protections, p],
            })
          }
        />
      )}
      {activeModal === "createMagicAttack" && (
        <CreateMagicAttackModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onAddAttack={(a) =>
            handleUpdate({ attacks: [...effectiveAgentData.attacks, a] })
          }
          agent={effectiveAgentData}
          learnedParticles={effectiveAgentData.learnedParticles || []}
        />
      )}
      {activeModal === "customization" && (
        <CustomizationModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          agent={effectiveAgentData}
          onUpdateAgent={handleUpdate}
        />
      )}
      {activeModal === "diceRoller" && (
        <DiceRollerModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          addLiveToast={addLiveToast}
          addLogEntry={addLogEntry}
          agentData={effectiveAgentData}
          onUpdate={handleUpdate}
        />
      )}
      {activeModal === "mythicalForm" && formToActivate && (
        <MythicalFormModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onConfirm={() => {
            toggleMythicalForm();
            setActiveModal(null);
          }}
          mythicalFormData={formToActivate}
          pathwayName={pathwayData?.formaMitica?.nome || "Forma Mítica"}
          sequence={effectiveAgentData.character.sequence}
        />
      )}
      {activeModal === "createPathway" && (
        <CreatePathwayModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onCreate={async (newPathwayData) => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) {
                addLiveToast({
                  type: 'failure',
                  title: 'Erro',
                  message: 'Você precisa estar logado para criar um caminho.'
                });
                return;
              }

              const { error } = await supabase.from('custom_pathways').insert({
                created_by: user.id,
                name: newPathwayData.pathway,
                pathway_data: newPathwayData
              });

              if (error) {
                console.error('Erro ao criar caminho:', error);
                addLiveToast({
                  type: 'failure',
                  title: 'Erro',
                  message: 'Falha ao criar o caminho personalizado.'
                });
              } else {
                // Adiciona o novo caminho ao estado local
                setAllPathways(prev => ({
                  ...prev,
                  [newPathwayData.pathway]: newPathwayData as any
                }));
                addLiveToast({
                  type: 'success',
                  title: 'Caminho Criado!',
                  message: `${newPathwayData.pathway} foi criado com sucesso.`
                });
              }
            } catch (error) {
              console.error('Erro ao criar caminho:', error);
              addLiveToast({
                type: 'failure',
                title: 'Erro',
                message: 'Erro inesperado ao criar o caminho.'
              });
            }
          }}
        />
      )}
    </div>
  );
};
