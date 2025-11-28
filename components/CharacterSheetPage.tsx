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
  Attack,
  FormaMitica,
} from "../types.ts";
import { supabase } from "../supabaseClient";
import { uploadAgentAvatar } from "../api/agents";
import { logDiceRoll } from "../api/campaigns";
import { useDebounce } from "../src/hooks/useDebounce";
import { usePermissions } from "../src/hooks/usePermissions";
import { useMyContext } from "../MyContext";
import { rollDice } from "../utils/diceRoller";

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
import { ResourcesTab } from "./tabs/ResourcesTab.tsx";
import { MagicGrimoireModal } from './modals/MagicGrimoireModal';
import { ImprovementModal } from './modals/ImprovementModal';
import { CreatePathwayModal } from './modals/CreatePathwayModal';
import { CreateMagicAttackModal } from './modals/CreateMagicAttackModal';
import { AddWeaponModal } from './modals/AddAttackModal';
import { AddProtectionModal } from './modals/AddBeyonderAbilityModal';
import { CustomizationModal } from './modals/CustomizationModal';
import { updateAgentCustomization } from '../api/agents';
import { DiceRollerModal } from './modals/DiceRollerModal';
import { MythicalFormModal } from './modals/MythicalFormModal';
import { DiceIcon, PaletteIcon, FlameIcon } from "./icons.tsx";

// Imports de Dados e Utilitários
import { caminhosData } from "../data/beyonders-data.tsx";
import { rollDiceWithTypes, rollSimpleDice, rollDamage } from "../utils/diceRoller.ts";
import { reviveInfinityInObject, beyondersReplacer } from "../utils/serializationUtils";
import { getAvatarForSanityAndVitality } from "../utils/agentUtils";
import {
  getContrastColor,
  darkenColor,
  hexToRgb,
  generateSmartButtonColor,
  getIntelligentContrast,
} from "../utils/colorUtils.ts";
import { NotificationLog } from "./ToastContainer.tsx";
import { ControlTestTracker } from "./ControlTestTracker.tsx";
import { AnchorsTracker } from "./AnchorsTracker.tsx";
import { PaTracker } from "./PaTracker.tsx";
import { SimplePaTracker } from "./SimplePaTracker.tsx";
import { computeDerivedFromPrimary, getMaxLuckPointsBySequence } from "../utils/calculations";
import { countActiveAnchors } from "../utils/anchorUtils";

type RollType = "skill" | "absorption";

// --- PathwayManager Component ---
interface PathwayManagerProps {
  agent: AgentData;
  permissions: { max_pathways: number; can_create_pathways: boolean };
  allPathways: PathwayData[];
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

  // Helper para obter nome de exibição do caminho
  const getPathwayDisplayName = (pathwayName: string): string => {
    // Se o caminho primário tem um nome alternativo configurado, usa ele
    if (pathwayName === primaryPathway && agent.character.pathwayDisplayName) {
      return agent.character.pathwayDisplayName;
    }
    return pathwayName;
  };

  // Filtra caminhos secretos que não pertencem a este agente/usuário
  const visiblePathways = useMemo(() => {
    return allPathways
      .filter((data) => {
        // Se não é secreto, sempre mostra
        if (!data.isSecret) return true;
        
        // Se é secreto, verifica permissões específicas do banco
        const pathwayName = data.pathway.toUpperCase();
        
        if (pathwayName.includes('ÉON') || pathwayName.includes('AEON')) {
          return permissions.can_see_pathway_aeon === true;
        }
        
        if (pathwayName.includes('PRIMOGÊNITO') || pathwayName.includes('PRIMOGENITO') || pathwayName.includes('PRIMOGÊNITO DO CAOS') || pathwayName.includes('PRIMOGENITO DO CAOS')) {
          return permissions.can_see_pathway_veu === true;
        }
        
        // Fallback para arrays de IDs (mantido para compatibilidade)
        const agentAllowed = data.allowedAgentIds?.includes(agent.id);
        const userAllowed = data.allowedUserIds?.includes(agent.character.player);
        return agentAllowed || userAllowed;
      })
      .reduce((acc, pathway) => { 
        acc[pathway.pathway] = pathway; 
        return acc; 
      }, {} as { [key: string]: PathwayData });
  }, [allPathways, agent, permissions]);

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
  const availablePathways = Object.keys(visiblePathways).filter(
    p => p !== primaryPathway && !pathways?.secondary?.includes(p)
  );
  
  const currentCount = (pathways?.secondary?.length || 0) + (pathways?.primary ? 1 : 0);
  const hasSpace = currentCount < permissions.max_pathways;

  // --- Renderização Principal ---
  return (
    <div className="pathway-manager">
      <h4>Caminhos Beyonder</h4>

      {/* Interface para seleção inicial quando não há caminho */}
      {!primaryPathway && (
        <div className="select-initial-pathway">
          <p style={{ marginBottom: '0.75rem', color: '#aaa' }}>Nenhum caminho selecionado.</p>
          <select 
            onChange={(e) => {
              if (e.target.value) {
                onUpdate({
                  character: {
                    ...agent.character,
                    pathways: { primary: e.target.value, secondary: [] }
                  }
                });
              }
            }}
            value=""
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: '#2a2a2e',
              border: '1px solid #444',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="">Selecione um caminho...</option>
            {Object.keys(visiblePathways).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      )}
      
      {primaryPathway && permissions.max_pathways <= 1 && (
        <div className="pathway-tag primary single">
          <span className="path-name">{getPathwayDisplayName(primaryPathway)}</span>
          {/* Permitir remover se for único */}
          <button
            style={{ marginLeft: '0.5rem' }}
            onClick={() => onPathwayToggle(primaryPathway)}
            title="Remover Caminho"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Interface Avançada (para usuários com permissão) */}
      {primaryPathway && permissions.max_pathways > 1 && (
        <div className="pathway-list-advanced">
          {/* Exibe o caminho primário */}
          <div className="pathway-tag primary">
            <span className="star-icon">★</span>
            <span className="path-name">{getPathwayDisplayName(primaryPathway)}</span>
            { (pathways?.secondary?.length || 0) === 0 && (
              <div className="tag-actions" style={{ marginLeft: '0.5rem' }}>
                <button onClick={() => onPathwayToggle(primaryPathway)} className="remove-btn" title="Remover Caminho Principal">×</button>
              </div>
            )}
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: popoverData.top, left: popoverData.left });

  const isSkillRoll = popoverData.rollType === "skill";
  const maxAssimilation = isSkillRoll
    ? Math.min(effectiveAgentData.character.assimilationDice, popoverData.pool)
    : 0;

  // Reset assimilation dice when popover data changes
  useEffect(() => {
    setAssimilationDice(0);
  }, [popoverData.name, popoverData.pool]);

  // Previne scroll wheel de alterar o valor do input
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleWheel = (e: WheelEvent) => {
      // Previne o comportamento padrão de incremento/decremento do input number
      e.preventDefault();
    };

    input.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      input.removeEventListener('wheel', handleWheel);
    };
  }, []);

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
                ref={inputRef}
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
  | "ANTECEDENTES"
  | "ÂNCORAS"
  | "RECURSOS";

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
  const { permissions: rawPermissions, loading: permissionsLoading } = usePermissions();
  
  // Memoize permissions para evitar re-renderizações desnecessárias
  const permissions = useMemo(() => rawPermissions, [
    rawPermissions.can_create_pathways,
    rawPermissions.max_pathways,
    rawPermissions.can_see_pathway_aeon,
    rawPermissions.can_see_pathway_veu
  ]);
  
  // =======================================================
  // 1. FONTE DA VERDADE E ESTADO PRINCIPAL
  // =======================================================
  const { agentId, campaignId } = useParams<{ agentId: string; campaignId?: string }>();
  const [allPathways, setAllPathways] = useState<typeof caminhosData>(caminhosData);
  const navigate = useNavigate();

  // ÚNICO estado para os dados do agente
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "salvo" | "salvando" | "não salvo"
  >("salvo");

  // Estado para URLs assinadas dos avatares
  const [signedAvatarUrls, setSignedAvatarUrls] = useState<{
    avatarUrl?: string;
    avatarHealthy?: string;
    avatarInsane?: string;
    avatarHurt?: string;
    avatarDisturbed?: string;
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
      navigate("/agents");
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
        const revivedData = reviveInfinityInObject(data.data);
        const formattedAgent = {
          ...revivedData,
          id: data.id,
          isPrivate: !!data.is_private,
        };
        // Normalize certain stored pathway names (compatibility fix for Éon/Aeon variants)
        const stripAccents = (s?: string) =>
          (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

        let normalizedAgent = { ...formattedAgent } as any;
        let changed = false;

        const normalizePath = (p?: string) => {
          if (!p) return p;
          const key = stripAccents(p);
          // If it looks like any AEON/EON variant, normalize to canonical pathway
          if (key.includes("AEON") || key.includes("EON")) {
            changed = true;
            return "CAMINHO DO ÉON ETERNO";
          }
          // Handle an old exact typo key
          if (key === "CAMINHO DO AEON ETERNO") {
            changed = true;
            return "CAMINHO DO ÉON ETERNO";
          }
          return p;
        };

        // New structure: pathways.primary / pathways.secondary
        if (normalizedAgent.character?.pathways) {
          const p = normalizedAgent.character.pathways.primary;
          const fixedPrimary = normalizePath(p);
          if (fixedPrimary !== p) normalizedAgent.character.pathways.primary = fixedPrimary;
          if (Array.isArray(normalizedAgent.character.pathways.secondary)) {
            normalizedAgent.character.pathways.secondary = normalizedAgent.character.pathways.secondary.map((s: string) => normalizePath(s));
          }
        }

        // Legacy single pathway field
        if (normalizedAgent.character?.pathway) {
          if (Array.isArray(normalizedAgent.character.pathway)) {
            normalizedAgent.character.pathway = normalizedAgent.character.pathway.map((s: string) => normalizePath(s));
          } else {
            normalizedAgent.character.pathway = normalizePath(normalizedAgent.character.pathway);
          }
        }

        // If we changed anything, persist normalized data back to DB
        if (changed) {
          try {
            const toSave = { ...(normalizedAgent as any) } as any;
            // remove DB-only fields
            delete toSave.id;
            delete toSave.isPrivate;
            const jsonString = JSON.stringify(toSave, beyondersReplacer);
            const dataToSaveProcessed = JSON.parse(jsonString);
            const { error: updateErr } = await supabase
              .from('agents')
              .update({ data: dataToSaveProcessed })
              .eq('id', data.id);
            if (updateErr) {
              console.warn('Falha ao persistir normalização de caminho (AEON):', updateErr);
            } else {
              console.log('Normalização de caminho aplicada e salva para agente', data.id);
            }
          } catch (e) {
            console.warn('Erro ao tentar normalizar caminhos do agente:', e);
          }
        }

        setAgent(normalizedAgent);
      }
      setIsLoading(false);
    }

    fetchAgent();
  }, [agentId]); // Removed addLiveToast to prevent unnecessary re-renders

  // =======================================================
  // 2.5. GERAR URLs ASSINADAS PARA AVATARES
  // =======================================================
  useEffect(() => {
    if (!agent) return;

    const generateSignedUrls = async () => {
      const newSignedUrls = {};
      const avatarFields = [
        "avatarHealthy",
        "avatarInsane",
        "avatarHurt",
        "avatarDisturbed",
      ];

      for (const field of avatarFields) {
        const url = agent.customization?.[field];
        if (url && !url.startsWith("http")) {
          try {
            const { data } = supabase.storage.from("agent-avatars").getPublicUrl(url);
            newSignedUrls[field] = data.publicUrl || url;
          } catch {
            newSignedUrls[field] = url;
          }
        } else {
          newSignedUrls[field] = url || "";
        }
      }

      setSignedAvatarUrls(newSignedUrls);
    };

    generateSignedUrls();
  }, [agent]); // Optimized dependencies

  // =======================================================
  // 2.6. BUSCAR CAMINHOS CUSTOMIZADOS
  // =======================================================
  const customPathwaysLoaded = useRef(false);
  useEffect(() => {
    if (customPathwaysLoaded.current) return;
    
    async function fetchCustomPathways() {
      try {
        const { data, error } = await supabase.from('custom_pathways').select('*');
        if (error) {
          console.error('Erro ao buscar caminhos customizados:', error);
          return;
        }
        if (data && data.length > 0) {
          const customPathways = data.map((path: any) => path.pathway_data);
          setAllPathways(prev => [...prev, ...customPathways]);
          customPathwaysLoaded.current = true;
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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Não salva na montagem inicial ou se não houver dados do agente
    if (isInitialMount.current || !debouncedAgent) {
      isInitialMount.current = false;
      return;
    }

    const saveChanges = async () => {
      setSaveStatus("salvando");
      const { id, isPrivate, ...dataToSave } = debouncedAgent; // Separa o ID e campos fora de data
      
      // Handle Infinity serialization
      const jsonString = JSON.stringify(dataToSave, beyondersReplacer);
      const dataToSaveProcessed = JSON.parse(jsonString);
      
      const { error } = await supabase
        .from("agents")
        .update({ data: dataToSaveProcessed })
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
      console.log('[CharacterSheetPage] handleUpdate called with:', update);
      console.log('[CharacterSheetPage] Current agent state:', agent);
      setSaveStatus("não salvo");

      // CRITICAL: Check type FIRST before routing to specific handlers
      // Only treat as "file" if it ONLY has "file" and "field"
      const isFileUpdate = update && typeof update === "object" && "file" in update && !("customization" in update) && !("character" in update) && !("attributes" in update);
      
      // Only treat as "isPrivate" update if it ONLY has isPrivate
      const isPrivacyOnlyUpdate = update && typeof update === 'object' && 'isPrivate' in update && Object.keys(update).length === 1;

      // Lógica para upload de arquivo
      if (isFileUpdate) {
        const { field, file } = update;
        if (!agent) return;

        try {
          const newUrl = await uploadAgentAvatar(
            agent.id,
            field,
            file
          ); // Removed the fourth argument
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
          // Persiste imediatamente no banco (salvamento rápido apenas do campo customization)
          try {
            if (agent?.id) {
              const currentData = { ...agent } as any;
              const updatedCustomization = { ...currentData.customization, [field]: newUrl };
              currentData.customization = updatedCustomization;
              const { id, isPrivate, ...dataToSave } = currentData;
              const { error: persistError } = await supabase.from('agents').update({ data: dataToSave }).eq('id', agent.id);
              if (persistError) throw persistError;
            }
          } catch (persistErr) {
            console.warn('Falha ao persistir avatar imediatamente:', persistErr);
            addLiveToast({ type: 'failure', title: 'Persistência Avatar', message: 'Upload ok, mas não salvou no servidor.' });
          }
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
      if (isPrivacyOnlyUpdate) {
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
        return;
      }
      
      // Lógica de mesclagem de dados normal (sem upload) - merge profundo para character
      setAgent((prev) => {
        if (!prev) return null;
        const partial = update as Partial<AgentData>;
        const beforeSeq = prev.character.sequence;
        const nextCharacter = partial.character
          ? { ...prev.character, ...partial.character }
          : prev.character;
        const nextAttributes = partial.attributes
          ? { ...prev.attributes, ...partial.attributes }
          : prev.attributes;
        const nextCustomization = partial.customization
          ? { ...prev.customization, ...partial.customization }
          : prev.customization;
        const afterSeq = nextCharacter.sequence;
        
        console.log('[CharacterSheetPage] setAgent merging data:');
        console.log('[CharacterSheetPage]   prev.customization:', prev.customization);
        console.log('[CharacterSheetPage]   partial.customization:', partial.customization);
        console.log('[CharacterSheetPage]   nextCustomization:', nextCustomization);
        
        if (partial.character && 'pathwayColor' in partial.character) {
          console.log('🎨 Mudando cor:', prev.character.pathwayColor, '=>', partial.character.pathwayColor);
        }
        
        const updatedAgent = {
          ...prev,
          ...partial,
          character: nextCharacter,
          attributes: nextAttributes,
          customization: nextCustomization,
        };
        
        console.log('[CharacterSheetPage] New updatedAgent.customization:', updatedAgent.customization);
        
        // Marca para salvamento assíncrono debounced se customização ou cor mudou
        if (partial.character?.pathwayColor || partial.customization) {
          console.log('[CharacterSheetPage] Setting customizationDirty = true');
          setCustomizationDirty(true);
        }
        
        return updatedAgent;
      });
    },
    [agent, addLiveToast]
  );

  // Estado para salvar customização de forma desacoplada
  const [customizationDirty, setCustomizationDirty] = useState(false);
  const customizationSaveRef = useRef<number | null>(null);
  useEffect(() => {
    if (!customizationDirty || !agent?.id) return;
    
    // Debounce 300ms (reduzido de 600ms)
    if (customizationSaveRef.current) window.clearTimeout(customizationSaveRef.current);
    customizationSaveRef.current = window.setTimeout(async () => {
      console.log('[CharacterSheetPage] Saving customization (debounce triggered)');
      console.log('[CharacterSheetPage] agent.customization at debounce time:', agent.customization);
      setSaveStatus('salvando');
      const ok = await updateAgentCustomization(agent);
      if (ok) {
        setSaveStatus('salvo');
        console.log('✅ [CharacterSheetPage] Customização salva com sucesso');
      } else {
        setSaveStatus('não salvo');
        console.error('❌ [CharacterSheetPage] Falha ao salvar customização');
        addLiveToast({ type: 'failure', title: 'Erro ao Salvar', message: 'Falha ao salvar customização.' });
      }
      setCustomizationDirty(false);
    }, 300);
    return () => {
      if (customizationSaveRef.current) window.clearTimeout(customizationSaveRef.current);
    };
  }, [customizationDirty, agent?.customization, agent?.character?.pathwayColor]);

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
  const [editingAttack, setEditingAttack] = useState<Attack | null>(null);

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
  // Bônus temporário por perícia (não persiste no banco)
  const [skillTempBonus, setSkillTempBonus] = useState<Record<string, number>>({});
  const [compactSkillsView, setCompactSkillsView] = useState<boolean>(true);
  const [showAnchorMechanics, setShowAnchorMechanics] = useState<boolean>(false);

  const [rollPopover, setRollPopover] = useState<{
    isVisible: boolean;
    top: number;
    left: number;
    name: string;
    pool: number;
    rollType: RollType;
    meta?: any;
  } | null>(null);

  // Converte array de caminhos em objeto indexado por nome para compatibilidade
  const allPathwaysMap = useMemo(() => {
    return allPathways.reduce((acc, pathway) => {
      acc[pathway.pathway] = pathway;
      return acc;
    }, {} as { [key: string]: PathwayData });
  }, [allPathways]);

  // Mapeamento de nomes curtos para nomes completos
  const pathwayNameMapping: Record<string, string> = {
    'Tolo': 'CAMINHO DO TOLO',
    'Porta': 'CAMINHO DA PORTA',
    'Erro': 'CAMINHO DO ERRO',
    'Visionário': 'CAMINHO DO VISIONÁRIO',
    'Sol': 'CAMINHO DO SOL',
    'Tirano': 'CAMINHO DO TIRANO',
    'Torre Branca': 'CAMINHO DA TORRE BRANCA',
    'Enforcado': 'CAMINHO DO ENFORCADO',
    'Trevas': 'CAMINHO DAS TREVAS',
    'Morte': 'CAMINHO DA MORTE',
    'Gigante do Crepúsculo': 'CAMINHO DO GIGANTE DO CREPÚSCULO',
    'Demônio': 'CAMINHO DO DEMÔNIO',
    'Padre Vermelho': 'CAMINHO DO PADRE VERMELHO',
    'Eremita': 'CAMINHO DO EREMITA',
    'Paragon': 'CAMINHO DO PARAGON',
    'Mãe': 'CAMINHO DA MÃE',
    'Lua': 'CAMINHO DA LUA',
    'Abismo': 'CAMINHO DO ABISMO',
    'Acorrentado': 'CAMINHO DO ACORRENTADO',
    'Justiceiro': 'CAMINHO DO JUSTICEIRO',
    'Imperador Negro': 'CAMINHO DO IMPERADOR NEGRO',
    'Roda da Fortuna': 'CAMINHO DA RODA DA FORTUNA',
    // Suporte explícito para Éon Eterno (formas abreviadas / display)
    'Éon Eterno': 'CAMINHO DO ÉON ETERNO',
    'Aeon Eterno': 'CAMINHO DO ÉON ETERNO',
    'Aeon': 'CAMINHO DO ÉON ETERNO',
    'Éon': 'CAMINHO DO ÉON ETERNO'
  };

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
    
    // Tentar mapear nome curto para nome completo
    if (pathwayKey && !allPathwaysMap[pathwayKey]) {
      const mappedKey = pathwayNameMapping[pathwayKey];
      if (mappedKey && allPathwaysMap[mappedKey]) {
        pathwayKey = mappedKey;
      }
    }
    
    return pathwayKey ? allPathwaysMap[pathwayKey] : null;
  }, [agent, allPathwaysMap]);

  const formToActivate = useMemo(() => {
    if (!pathwayData || !agent) return null;
    // Prioriza novo formato (mythicalForm)
    if (pathwayData.mythicalForm) {
      return agent.character.sequence <= 2
        ? pathwayData.mythicalForm.complete
        : pathwayData.mythicalForm.incomplete;
    }
    // Fallback para formato legado (formaMitica)
    if ((pathwayData as any).formaMitica) {
      const legacy = (pathwayData as any).formaMitica as FormaMitica; // usando tipo legado
      // Parse de bônus de atributos (ex.: "+2 Espiritualidade, +2 Vigor")
      const attributeBoosts: { [key: string]: number } = {};
      if (legacy.bonus) {
        legacy.bonus.split(/[,\.]/).forEach(part => {
          const m = part.trim().match(/([+-]?\d+)\s+([A-Za-zÀ-ÿ]+)/);
          if (m) {
            const rawAttr = m[2];
            const value = parseInt(m[1], 10);
            const normalized = normalizeAttributeName(rawAttr).toLowerCase();
            // Mapeia para chaves de atributos válidas
            const map: Record<string, string> = {
              'força': 'forca',
              'destreza': 'destreza',
              'vigor': 'vigor',
              'carisma': 'carisma',
              'manipulação': 'manipulacao',
              'autocontrole': 'autocontrole',
              'percepção': 'percepcao',
              'inteligência': 'inteligencia',
              'raciocínio': 'raciocinio',
              'espiritualidade': 'espiritualidade'
            };
            const key = map[normalized];
            if (key) attributeBoosts[key] = (attributeBoosts[key] || 0) + value;
          }
        });
      }
      // Converte poderes legados para abilities
      const abilities = (legacy.poderes || []).map(p => ({ name: `${p.tipo}: ${p.nome}`, desc: p.desc }));
      const stage: MythicalFormStage = {
        tempHpBonus: 0,
        attributeBoosts,
        abilities
      };
      return stage; // Usa mesma "stage" para qualquer sequência (sem versões incompleta/complete distintas no legado)
    }
    return null;
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
    
    // Tentar mapear nome curto para nome completo
    if (pathwayKey && !allPathwaysMap[pathwayKey]) {
      const mappedKey = pathwayNameMapping[pathwayKey];
      if (mappedKey && allPathwaysMap[mappedKey]) {
        pathwayKey = mappedKey;
      }
    }
    
    const pathwayData = pathwayKey ? allPathwaysMap[pathwayKey] : null;
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
    
    // Mapear nomes curtos para nomes completos
    characterPathways = characterPathways.map(p => pathwayNameMapping[p] || p);
    
    const hasFortuneWheel = characterPathways.includes("CAMINHO DA RODA DA FORTUNA");
    const maxLuckPoints = hasFortuneWheel ? getMaxLuckPointsBySequence(sequence) : 0;

    // Calcula Pontos de Estase (Caminho do Éon Eterno)
    // PEt = Espiritualidade (pontos atuais) + Vigor (atributo)
    const hasAeonPathway = characterPathways.some(p => p.toUpperCase().includes('ÉON') || p.toUpperCase().includes('AEON'));
    const maxEstasePoints = hasAeonPathway ? (agent.character.spirituality || 0) + (agent.attributes.vigor || 0) : 0;

    return {
      maxVitality: base.maxVitality,
      maxSpirituality: base.maxSpirituality,
      maxWillpower: base.maxWillpower,
      maxSanity: base.maxSanity,
      absorption: base.absorption,
      maxLuckPoints,
      maxEstasePoints,
    };
  }, [agent, allPathwaysMap]); // Este hook só recalcula quando 'agent' ou 'allPathwaysMap' muda

  // Agora, usamos os valores calculados diretamente no JSX
  const effectiveAgentData = useMemo(() => {
    if (!agent) return null;
    if (!derivedStats) {
      return {
        ...agent,
        character: {
          ...agent.character,
          maxEstasePoints: 0,
          estasePoints: 0,
        }
      };
    }

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
        maxEstasePoints: derivedStats.maxEstasePoints || 0,
        // Permite que o jogador controle estasePoints manualmente
        // Apenas inicializa com max se for undefined
        estasePoints: agent.character.estasePoints !== undefined 
          ? agent.character.estasePoints 
          : (derivedStats.maxEstasePoints || 0),
      },
    };
  }, [agent, derivedStats]);
  // =======================================================
  // 👆👆👆 FIM DA GRANDE MUDANÇA 👆👆👆
  // =======================================================

  // Inicializar Pontos de Estase automaticamente para personagens existentes
  useEffect(() => {
    if (!effectiveAgentData || !derivedStats) return;
    
    const { character } = effectiveAgentData;
    const needsInitialization = 
      derivedStats.maxEstasePoints > 0 && 
      (character.maxEstasePoints === undefined || character.maxEstasePoints === 0) &&
      (character.estasePoints === undefined || character.estasePoints === 0);
    
    if (needsInitialization) {
      console.log('🔧 Inicializando Pontos de Estase para personagem existente:', {
        maxEstasePoints: derivedStats.maxEstasePoints,
        vigor: effectiveAgentData.attributes.vigor,
        espiritualidade: effectiveAgentData.attributes.espiritualidade
      });
      
      handleUpdate({
        character: {
          ...character,
          maxEstasePoints: derivedStats.maxEstasePoints,
          estasePoints: derivedStats.maxEstasePoints
        }
      });
    }
  }, [effectiveAgentData?.character.pathway, effectiveAgentData?.character.pathways, derivedStats?.maxEstasePoints]);

  const sheetStyle = useMemo(() => {
    if (!agent) return {};
    const color = agent.character.pathwayColor || "#9c27b0";
    const smartButtonColor = generateSmartButtonColor(color);
    const intelligentContrast = getIntelligentContrast(smartButtonColor);
    return {
      "--character-color": smartButtonColor,
      "--character-color-dark": darkenColor(smartButtonColor, 0.2),
      "--character-contrast-color": intelligentContrast,
      "--character-color-rgb": hexToRgb(smartButtonColor),
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
    "ÂNCORAS",
    "RECURSOS",
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

      // Calcular a Espiritualidade correta baseada na sequência
      const sequencesWithEspIncrement = [5, 3, 2, 1];
      const currentSeq = effectiveAgentData.character.sequence;
      const newSeq = value;
      
      // Contar quantos incrementos devem existir
      const incrementsNeeded = sequencesWithEspIncrement.filter(s => s >= newSeq && s < 9).length;
      const newEspiritualidade = 1 + incrementsNeeded;
      
      // Atualizar atributos também
      handleUpdate({ 
        character: updatedCharacter,
        attributes: {
          ...effectiveAgentData.attributes,
          espiritualidade: newEspiritualidade
        }
      });

      addLiveToast({
        type: "success",
        title: "Avanço de Sequência!",
        message: `Você avançou para a Sequência ${value}. Ganhou 4 Dados de Assimilação. Espiritualidade: ${newEspiritualidade}`,
      });
      return;
    }

    handleUpdate({ character: updatedCharacter });
  };

  const handleAttributeChange = (
    attribute: keyof Attributes,
    value: number
  ) => {
    const newAttributes = { ...effectiveAgentData.attributes, [attribute]: value };
    
    // Recalcular maxEstasePoints se vigor mudar (PEt = Espiritualidade + Vigor)
    if (attribute === 'vigor' && effectiveAgentData) {
      const c = effectiveAgentData.character;
      let hasAeon = false;
      if (c.pathways?.primary) {
        const list = [c.pathways.primary, ...(c.pathways.secondary || [])].filter(Boolean);
        hasAeon = list.some(p => p.toUpperCase().includes('ÉON') || p.toUpperCase().includes('AEON'));
      } else if (c.pathway) {
        const pathStr = Array.isArray(c.pathway) ? c.pathway.join(' ') : c.pathway;
        hasAeon = pathStr.toUpperCase().includes('ÉON') || pathStr.toUpperCase().includes('AEON');
      }
      
      if (hasAeon) {
        const newMaxEstase = (c.spirituality || 0) + value;
        const currentEstase = c.estasePoints || 0;
        
        handleUpdate({
          attributes: newAttributes,
          character: {
            ...c,
            maxEstasePoints: newMaxEstase,
            estasePoints: Math.min(currentEstase, newMaxEstase)
          }
        });
        return;
      }
    }
    
    handleUpdate({
      attributes: newAttributes,
    });
  };

  // Funções para gerenciar múltiplos caminhos (primário/secundários)
  const handlePathwayToggle = (pathwayName: string) => {
    const currentPathways = effectiveAgentData.character.pathways;

    // Se não existe estrutura de pathways, cria uma nova com este como primário
    if (!currentPathways || !currentPathways.primary) {
      handleUpdate({
        character: {
          ...effectiveAgentData.character,
          pathways: { primary: pathwayName, secondary: [] }
        }
      });
      addLiveToast({
        type: 'success',
        title: 'Caminho Definido',
        message: `${pathwayName} definido como caminho primário.`
      });
      return;
    }

    const isPrimary = currentPathways.primary === pathwayName;
    const isSecondary = currentPathways.secondary.includes(pathwayName);

    if (isPrimary) {
      // Novo comportamento: permitir remover se for o único caminho
      if (currentPathways.secondary.length === 0) {
        handleUpdate({
          character: {
            ...effectiveAgentData.character,
            pathways: { primary: '', secondary: [] }
          }
        });
        addLiveToast({
          type: 'success',
          title: 'Caminho Removido',
          message: 'Caminho principal removido. Selecione outro para adicionar.'
        });
      } else {
        addLiveToast({
          type: 'failure',
          title: 'Ação Inválida',
          message: 'Defina outro caminho como primário antes de remover este.'
        });
      }
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
      addLiveToast({
        type: 'info',
        title: 'Caminho Removido',
        message: `${pathwayName} removido dos secundários.`
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
      addLiveToast({
        type: 'success',
        title: 'Caminho Adicionado',
        message: `${pathwayName} adicionado como secundário.`
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
    const { willpower, controlStage, anchors } = effectiveAgentData.character;
    
    // Calcular bônus de âncoras (Resiliência Mental)
    const anchorBonus = countActiveAnchors(anchors || []);
    
    const basePool = autocontrole + willpower;
    const pool = basePool + anchorBonus;
    const difficulty = 6 + (controlStage || 0);
    const { rolls, successes } = rollDice(pool, difficulty);

    const resultType = successes > 0 ? "success" : "failure";
    const title = "Teste de Controle";
    const message = `${successes} sucesso(s)!`;
    
    let details = `Parada: ${pool} (Autocontrole ${autocontrole} + Vontade ${willpower}`;
    if (anchorBonus > 0) {
      details += ` + ${anchorBonus} Âncora${anchorBonus > 1 ? 's' : ''}`;
    }
    details += `)\nDificuldade: ${difficulty}\nRolagem: [${rolls.join(", ")}]`;

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

      // NOVO: Usar o sistema de regras de Beyonders
      const rollResult = rollDiceWithTypes(soulDiceUsed, assimilationDiceUsed, 6);
      
      const { soulRolls, assimilationRolls, totalSuccesses, soulSuccesses, assimilationSuccesses, madnessTriggers, isBotch, madnessMessage } = rollResult;
      const finalSuccesses = totalSuccesses;

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
                    avatarUrl: signedAvatarUrls.avatarUrl || effectiveAgentData.character.avatarUrl || effectiveAgentData.customization?.avatarHealthy,
                    customization: {
                      avatarHealthy: signedAvatarUrls.avatarHealthy || effectiveAgentData.customization?.avatarHealthy,
                      avatarInsane: signedAvatarUrls.avatarInsane || effectiveAgentData.customization?.avatarInsane,
                      avatarHurt: signedAvatarUrls.avatarHurt || effectiveAgentData.customization?.avatarHurt,
                      avatarDisturbed: signedAvatarUrls.avatarDisturbed || effectiveAgentData.customization?.avatarDisturbed,
                      useOpenDyslexicFont: effectiveAgentData.customization?.useOpenDyslexicFont || false
                    }
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
            {(() => {
              const c = effectiveAgentData.character;
              let hasAeon = false;
              if (c.pathways?.primary) {
                const list = [c.pathways.primary, ...(c.pathways.secondary || [])].filter(Boolean);
                hasAeon = list.some(p => p.toUpperCase().includes('ÉON') || p.toUpperCase().includes('AEON'));
              } else if (c.pathway) {
                const pathStr = Array.isArray(c.pathway) ? c.pathway.join(' ') : c.pathway;
                hasAeon = pathStr.toUpperCase().includes('ÉON') || pathStr.toUpperCase().includes('AEON');
              }
              return hasAeon;
            })() && (
              <StatusBar
                label="Pontos de Estase (PEt)"
                value={effectiveAgentData.character.estasePoints || 0}
                max={effectiveAgentData.character.maxEstasePoints || 0}
                onValueChange={(v) =>
                  handleCharacterFieldChange("estasePoints", v)
                }
                color="#9c27b0"
              />
            )}
          </div>

          {( (pathwayData?.mythicalForm || (pathwayData as any)?.formaMitica) && !isMythicalFormActive ) && (
            <div className="mythical-form-trigger-container">
              <button
                id="mythical-form-trigger-btn"
                onClick={() => effectiveAgentData.character.sequence <= 4 && setActiveModal("mythicalForm")}
                aria-label="Ativar Forma Mítica"
                title={
                  effectiveAgentData.character.sequence <= 4
                    ? "Ativar Forma Mítica"
                    : "Forma Mítica desbloqueia na Sequência 4 ou menor"
                }
                disabled={effectiveAgentData.character.sequence > 4}
                className={effectiveAgentData.character.sequence > 4 ? "locked" : ""}
              >
                <FlameIcon />
              </button>
              {effectiveAgentData.character.sequence > 4 && (
                <p className="locked-hint">Disponível ao atingir Sequência 4</p>
              )}
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
                  onOpenAddWeaponModal={(attack?: Attack) => {
                    setEditingAttack(attack || null);
                    setActiveModal("addWeapon");
                  }}
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
                  allPathways={allPathwaysMap}
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
                  onAddAttack={(a) => handleUpdate({ attacks: [...effectiveAgentData.attacks, a] })}
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
              <div
                style={{
                  display: activeTab === "ÂNCORAS" ? "block" : "none",
                }}
              >
                <div className="ancoras-tab-content">
                  <div className="ancoras-description">
                    <h3 className="ancoras-title">⚓ Âncoras: Segurando a Humanidade</h3>
                    <p className="ancoras-intro">Para não se tornar um monstro, o Beyonder precisa de âncoras — conexões com sua humanidade, sua vida mortal e sua sanidade.</p>
                    
                    <button 
                      className="toggle-mechanics-btn"
                      onClick={() => setShowAnchorMechanics(prev => !prev)}
                    >
                      {showAnchorMechanics ? '▼' : '▶'} Explicação sobre Âncoras
                    </button>

                    {showAnchorMechanics && (
                      <div className="ancoras-mechanics-section">
                        <h4 className="mechanics-subtitle">📖 Mecânica da Âncora</h4>
                        <div className="mechanics-list">
                          <div className="mechanic-item">
                            <strong>O Pilar do Eu (A Convicção):</strong> O princípio ou crença que o personagem preza ("Devo proteger os inocentes.").
                          </div>
                          <div className="mechanic-item">
                            <strong>A Âncora (O Símbolo):</strong> A personificação física daquele Pilar (uma pessoa, um lugar, um grupo).
                          </div>
                          <div className="mechanic-item">
                            Um personagem começa com <strong>1 Âncora</strong> e pode desenvolver até <strong>3</strong>.
                          </div>
                        </div>
                        
                        <h4 className="mechanics-subtitle benefits">✨ Benefícios da Âncora</h4>
                        <div className="mechanics-list">
                          <div className="mechanic-item benefit">
                            <strong>Resiliência Mental (Passivo):</strong> Por cada Âncora que possui, você ganha +1 na sua parada de dados em testes para resistir à perda de Sanidade causada por influências sobrenaturais graduais.
                          </div>
                          <div className="mechanic-item benefit">
                            <strong>Reafirmar a Humanidade (Ativo):</strong> Uma vez por sessão, ao falhar em um teste de Vontade ou Sanidade, você pode gastar 1 Ponto de Vontade para invocar uma Âncora. Você pode então rolar novamente o teste com um bônus de +2 dados.
                          </div>
                        </div>
                        
                        <h4 className="mechanics-subtitle risks">⚠️ O Risco das Âncoras</h4>
                        <div className="mechanics-list">
                          <div className="mechanic-item risk">
                            <strong>Âncora em Perigo:</strong> Enquanto sua Âncora está sob ameaça crível, você sofre uma penalidade de -1 dado em todos os testes para resistir à perda de controle.
                          </div>
                          <div className="mechanic-item risk">
                            <strong>Danificando uma Âncora:</strong> Imediatamente após o evento, você deve fazer um teste de Vontade (Dificuldade 6). Se falhar, sofre 1 Nível de Degradação de Sanidade.
                          </div>
                          <div className="mechanic-item risk">
                            <strong>Destruindo uma Âncora:</strong> Você sofre uma perda imediata e permanente de 2 Níveis de Degradação de Sanidade, sem teste. Aquele espaço de Âncora fica "queimado" e precisa de um arco de história para ser recuperado.
                          </div>
                          <div className="mechanic-item risk">
                            <strong>Agir Contra seu Próprio Pilar:</strong> Você imediatamente sofre 1d3 Níveis de Degradação de Sanidade.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <AnchorsTracker
                    anchors={effectiveAgentData.character.anchors}
                    onAnchorsChange={(v) => handleCharacterFieldChange("anchors", v)}
                    onInvokeAnchor={handleInvokeAnchor}
                  />
                </div>
              </div>
              <div
                style={{
                  display: activeTab === "RECURSOS" ? "block" : "none",
                }}
              >
                <ResourcesTab
                  character={effectiveAgentData.character}
                  onCharacterChange={handleCharacterFieldChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sheet-col-right">
          <div className="pericias-section">
            <div className="pericias-header">
              <h3 className="section-title">Perícias</h3>
              <div className="pericias-actions">
                <button
                  onClick={() => setCompactSkillsView(v => !v)}
                  className="skills-compact-toggle"
                  title="Alternar modo compacto"
                >
                  {compactSkillsView ? 'Expandir' : 'Compactar'}
                </button>
                <button
                  onClick={() => setActiveModal("diceRoller")}
                  className="dice-roller-modal-btn-inline"
                  aria-label="Abrir Rolador de Dados"
                >
                  <DiceIcon />
                </button>
              </div>
            </div>
            {compactSkillsView ? (
              <div className="skills-compact-wrapper">
                {Object.entries(effectiveAgentData.habilidades).map(([type, list]) => (
                  <table className="skills-compact-table" key={type}>
                    <thead>
                      <tr>
                        <th className="col-nome">{type === 'gerais' ? 'Gerais' : 'Investigativas'}</th>
                        <th>ATR</th>
                        <th>Bônus</th>
                        <th>Pts</th>
                        <th>Total</th>
                        <th>Roll</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(list as Habilidade[]).map((skill, index) => {
                        const attrName = skill.attr.split('/')[0];
                        const normalizedAttr = normalizeAttributeName(attrName) as keyof Attributes;
                        const attrValue = effectiveAgentData.attributes[normalizedAttr] || 0;
                        const tempBonus = skillTempBonus[skill.name] || 0;
                        const total = skill.points + attrValue + tempBonus;
                        const shortName = skill.name.length > 16 ? skill.name.slice(0,13) + '…' : skill.name;
                        return (
                          <tr key={skill.name}>
                            <td title={skill.name}>{shortName}</td>
                            <td>
                              {editingSkillAttr === skill.name ? (
                                <select
                                  className="skill-attr-select small"
                                  value={skill.attr}
                                  onChange={(e) => {
                                    const newList = [...(list as Habilidade[])];
                                    newList[index] = { ...skill, attr: e.target.value };
                                    handleUpdate({ habilidades: { ...effectiveAgentData.habilidades, [type]: newList } });
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
                                <span className="skill-attr-tag compact" onClick={() => setEditingSkillAttr(skill.name)}>{attrName.substring(0,3).toUpperCase()}</span>
                              )}
                            </td>
                            <td>
                              <input
                                type="number"
                                className="skill-temp-bonus compact"
                                value={tempBonus}
                                onChange={e => setSkillTempBonus(prev => ({ ...prev, [skill.name]: Number(e.target.value) }))}
                                title="Bônus Temporário"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="skill-points-input compact"
                                value={skill.points}
                                onChange={e => {
                                  const newList = [...(list as Habilidade[])];
                                  newList[index] = { ...skill, points: Number(e.target.value) };
                                  handleUpdate({ habilidades: { ...effectiveAgentData.habilidades, [type]: newList } });
                                }}
                              />
                            </td>
                            <td><span className="skill-total-display small">{total}</span></td>
                            <td>
                              <button
                                className="skill-roll-btn compact"
                                onClick={(e) => handleRollRequest(e, skill.name, total, 'skill')}
                              >
                                <DiceIcon />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ))}
              </div>
            ) : (
              // Check if habilidades has the expected structure
              effectiveAgentData.habilidades && 
              typeof effectiveAgentData.habilidades === 'object' &&
              (effectiveAgentData.habilidades.gerais || effectiveAgentData.habilidades.investigativas) ? (
                Object.entries(effectiveAgentData.habilidades).map(
                  ([type, list]) => {
                    // Ensure list is an array
                    if (!Array.isArray(list)) return null;
                    
                    return (
                      <div key={type}>
                        <h4 className="habilidade-subheader">{type === 'gerais' ? 'Gerais' : 'Investigativas'}</h4>
                        {list.map((skill, index) => {
                      const attrName = skill.attr.split('/') [0];
                      const normalizedAttr = normalizeAttributeName(attrName) as keyof Attributes;
                      const attrValue = effectiveAgentData.attributes[normalizedAttr] || 0;
                      const tempBonus = skillTempBonus[skill.name] || 0;
                      const total = skill.points + attrValue + tempBonus;
                      const displayName = skill.name.length > 14 ? skill.name.slice(0,11) + '…' : skill.name;
                      return (
                        <div key={skill.name} className="pericia-item-v2">
                          <label title={skill.name}>{displayName}</label>
                          <div className="pericia-controls">
                            <div className="skill-attr-selector-wrapper">
                              {editingSkillAttr === skill.name ? (
                                <select
                                  className="skill-attr-select"
                                  value={skill.attr}
                                  onChange={(e) => {
                                    const newList = [...(list as Habilidade[])];
                                    newList[index] = { ...skill, attr: e.target.value };
                                    handleUpdate({ habilidades: { ...effectiveAgentData.habilidades, [type]: newList } });
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
                                <div className="skill-attr-tag" onClick={() => setEditingSkillAttr(skill.name)}>{attrName.substring(0,3).toUpperCase()}</div>
                              )}
                            </div>
                            <input
                              type="number"
                              value={skill.points}
                              onChange={(e) => {
                                const newList = [...(list as Habilidade[])];
                                newList[index] = { ...skill, points: Number(e.target.value) };
                                handleUpdate({ habilidades: { ...effectiveAgentData.habilidades, [type]: newList } });
                              }}
                            />
                            <input
                              type="number"
                              className="skill-temp-bonus"
                              value={tempBonus}
                              onChange={(e) => setSkillTempBonus(prev => ({ ...prev, [skill.name]: Number(e.target.value) }))}
                              title="Bônus Temporário"
                            />
                            <div className="skill-total-display">{total}</div>
                            <button className="skill-roll-btn" onClick={(e) => handleRollRequest(e, skill.name, total, 'skill')}>
                              <DiceIcon />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                    );
                  }
                )
              ) : (
                <div style={{ padding: '1rem', color: '#8896a8', textAlign: 'center' }}>
                  Nenhuma habilidade cadastrada
                </div>
              )
            )}
          </div>
          
          <SimplePaTracker 
            pa={effectiveAgentData.character.pa || 0} 
            paGasto={effectiveAgentData.character.paTotalGasto || 0}
            sequence={effectiveAgentData.character.sequence || 9}
            onPaChange={(val) => handleCharacterFieldChange('pa', val)}
            onOpenImprovements={() => setActiveModal('improvement')}
          />

          <ControlTestTracker
            currentStage={effectiveAgentData.character.controlStage}
            onStageChange={(v) => handleCharacterFieldChange("controlStage", v)}
            onPerformTest={handleControlTest}
            anchorBonus={countActiveAnchors(effectiveAgentData.character.anchors || [])}
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
                ...p.map((i) => ({ ...i, id: Date.now() + Math.random(), isDomain: false })),
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
          allPathwaysData={allPathwaysMap}
        />
      )}
      {activeModal === "addWeapon" && (
        <AddWeaponModal
          isOpen={true}
          onClose={() => {
            setActiveModal(null);
            setEditingAttack(null);
          }}
          initialData={editingAttack}
          attributes={effectiveAgentData.attributes}
          skills={effectiveAgentData.habilidades?.gerais || []}
          onAddAttack={(a) => {
            if (editingAttack) {
              // Modo edição: substitui o ataque existente
              const updatedAttacks = effectiveAgentData.attacks.map(atk => 
                atk.id === editingAttack.id ? { ...a, id: editingAttack.id } : atk
              );
              handleUpdate({ attacks: updatedAttacks });
            } else {
              // Modo novo: adiciona novo ataque
              handleUpdate({ attacks: [...effectiveAgentData.attacks, a] });
            }
            setEditingAttack(null);
          }}
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
