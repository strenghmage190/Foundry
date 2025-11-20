import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getDefense, getAbsorptionPool, getInitiativePool } from '../utils/calculations';
import '../styles/components/_character-overview.css';

interface Props {
  agentData: any | null;
  participant: any;
  campaign?: any | null;
  onClose: () => void;
}

const CharacterOverviewModal: React.FC<Props> = ({ agentData, participant, campaign, onClose }) => {
  const navigate = useNavigate();

  if (!participant) return null;

  const character = agentData?.character || {};
  const avatar = (character && character.avatarUrl) ? character.avatarUrl : (participant.user_profiles?.signedAvatarUrl ?? null);
  const pathName = character.pathways?.primary ?? (Array.isArray(character.pathway) ? character.pathway?.[0] : character.pathway) ?? '';
  const hasPathway = pathName && pathName.trim() !== '' && pathName !== 'Nenhum caminho selecionado.';

  const stats = {
    defense: getDefense(agentData),
    absorption: getAbsorptionPool(agentData),
    initiative: getInitiativePool(agentData),
  };

  const agentRowId = participant.agent_id ?? (participant.agents && (participant.agents.id || (participant.agents[0] && participant.agents[0].id))) ?? null;

  const getSkillPoints = (agent: any, skillName: string) => {
    const h = agent?.habilidades || { gerais: [], investigativas: [] };
    const all = [ ...(h.gerais || []), ...(h.investigativas || []) ];
    const found = all.find((s: any) => (s.name || '').toLowerCase() === (skillName || '').toLowerCase());
    return found ? (found.points || 0) : 0;
  };

  const rac = agentData ? (agentData.attributes?.raciocinio || 0) : 0;
  const esquivaPts = agentData ? getSkillPoints(agentData, 'Esquiva') : 0;
  const defesaDetailed = `${stats.defense} (${rac} Raciocínio + ${esquivaPts} Esquiva)`;

  const vigor = agentData ? (agentData.attributes?.vigor || 0) : 0;
  const armorBonus = agentData ? ((agentData.protections || []).find((p:any)=>p.isEquipped)?.armorBonus || 0) : 0;
  const absorcaoDetailed = `${stats.absorption} (${vigor} Vigor + ${armorBonus} Armadura)`;

  const per = agentData ? (agentData.attributes?.percepcao || 0) : 0;
  const pront = agentData ? getSkillPoints(agentData, 'Prontidão') : 0;
  const iniciativaDetailed = `${stats.initiative} (${per} Percepção + ${pront} Prontidão)`;

  return (
    <div className="modal-overlay character-overview" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3 className="title-font">Ficha: {character.name ?? (participant.user_profiles?.displayName ?? `Participante #${participant.id}`)}</h3>
          <div>
            <button className="button-secondary" onClick={onClose}>Fechar</button>
          </div>
        </div>

        <div className="modal-body">
          <section className="identity-block">
            <div className="identity-left">
              <div className="avatar-wrap">
                {avatar ? <img src={avatar} alt={character.name || participant.user_profiles?.displayName} /> : <div className="avatar-fallback">{(participant.user_profiles?.displayName || '??').slice(0,2).toUpperCase()}</div>}
              </div>
            </div>
            <div className="identity-right">
              <h1>{character.name || participant.user_profiles?.displayName}</h1>
              <h3>{hasPathway ? pathName : '—'}</h3>
              <p>Sequência {character.sequence ?? '—'} • Arquétipo: {(character as any).archetypes?.join(' | ') || '—'}</p>
            </div>
          </section>

          <hr className="section-divider" />

          <section className="stat-block">
            <h2>Status de Combate</h2>
            <ul>
              <li><strong>Defesa:</strong> {defesaDetailed}</li>
              <li><strong>Absorção:</strong> {absorcaoDetailed}</li>
              <li><strong>Iniciativa:</strong> {iniciativaDetailed}</li>
            </ul>
          </section>

          <section className="attack-block">
            <h2>Ataques Principais</h2>
            { (agentData?.attacks || []).length === 0 ? (
              <div className="empty">Nenhum ataque cadastrado.</div>
            ) : (
              (agentData.attacks || []).map((atk: any) => {
                const attrVal = agentData.attributes ? (agentData.attributes as any)[(atk.attribute || '').toLowerCase()] || 0 : 0;
                const skillPts = getSkillPoints(agentData, atk.skill || '');
                const diceCount = attrVal + skillPts;
                return (
                  <div key={atk.id} className="attack-item">
                    <h4>{atk.name} {atk.quality ? <span className="tag">{atk.quality}</span> : null}</h4>
                    <p><strong>Parada de Dados:</strong> <span className="dice-roll">{diceCount}d10</span> ({attrVal} {atk.attribute || ''} + {skillPts} {atk.skill || ''})</p>
                    <p><strong>Dano:</strong> {atk.damageFormula || '—'}</p>
                    {atk.specialQualities && <p className="qualities"><strong>Qualidades:</strong> {atk.specialQualities}</p>}
                  </div>
                );
              })
            )}
          </section>

          <hr className="section-divider" />

          <section className="powers-block">
            <h2>Poderes Beyonder & Habilidades</h2>
            { ((agentData?.habilidadesBeyonder || []) as any[]).map((p:any,i:number) => (
              <div className="power-item" key={p.id ?? i}>
                <h4>{p.name}</h4>
                <p>{p.description}</p>
              </div>
            )) }
          </section>

          <hr className="section-divider" />

          <section className="resources-block">
            <h2>Recursos & Equipamentos</h2>
            <div className="resources-columns">
              <div>
                <h5>Equipamento Ativo</h5>
                <ul>
                  { (agentData?.attacks || []).slice(0,3).map((a:any)=> (<li key={a.id}>{a.name} — {a.damageFormula}</li>)) }
                  { (agentData?.protections || []).filter((p:any)=>p.isEquipped).map((p:any)=> (<li key={p.id}>{p.name} — +{p.armorBonus} Absorção</li>)) }
                </ul>
              </div>
              <div>
                <h5>Artefatos Selados</h5>
                <ul>
                  { (agentData?.artifacts || []).slice(0,5).map((art:any)=> (<li key={art.id}>[{art.grau ?? 2}] {art.name} — {art.maldicao ?? '—'}</li>)) }
                </ul>
              </div>
            </div>
          </section>

          <section className="status-end">
            <h4>Condição Atual e Progressão</h4>
            <div className="conditions">{(character.currentCurse) ? (<div>Condição: {character.currentCurse}</div>) : <div>Sem condições ativas.</div>}</div>
            <div className="corruption">Estágio de Corrupção: {(character as any).corruptionStage ?? '—'}</div>
            <div className="pa-progress">PA: {character.paDisponivel || 0} / {character.paTotalGasto || 0}</div>
          </section>

          <div className="modal-actions">
            <button className="button-secondary" onClick={onClose}>Fechar</button>
            {agentRowId && <button className="button-primary" onClick={() => navigate(`/campaign/${campaign?.id}/agent/${agentRowId}`)} style={{ marginLeft: 8 }}>Abrir Ficha Completa</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterOverviewModal;
