import React, { useState } from 'react';
import { CombatSession } from '../types';
import '../styles/components/_combat-session-manager.css';

interface CombatSessionManagerProps {
  sessions: CombatSession[];
  availableParticipants: Array<{ id: string; name: string; avatarUrl?: string }>;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: (session: CombatSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateSession: (sessionId: string, updates: Partial<CombatSession>) => void;
  activeSessionId?: string;
}

export const CombatSessionManager: React.FC<CombatSessionManagerProps> = ({
  sessions,
  availableParticipants,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onUpdateSession,
  activeSessionId
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionLocation, setNewSessionLocation] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  const handleCreateSession = () => {
    if (!newSessionName.trim()) return;

    const newSession: CombatSession = {
      id: `combat_${Date.now()}`,
      name: newSessionName,
      location: newSessionLocation || undefined,
      participantIds: selectedParticipants,
      createdAt: new Date(),
      status: 'active',
    };

    onCreateSession(newSession);
    setNewSessionName('');
    setNewSessionLocation('');
    setSelectedParticipants([]);
    setIsCreating(false);
  };

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleToggleParticipantInSession = (sessionId: string, participantId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const newParticipantIds = session.participantIds.includes(participantId)
      ? session.participantIds.filter(id => id !== participantId)
      : [...session.participantIds, participantId];

    onUpdateSession(sessionId, { participantIds: newParticipantIds });
  };

  return (
    <div className="combat-session-manager">
      <div className="csm-header">
        <h3>Gerenciador de Combates</h3>
        <button 
          className="csm-create-btn"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? '✕ Cancelar' : '+ Novo Combate'}
        </button>
      </div>

      {isCreating && (
        <div className="csm-create-form">
          <div className="csm-form-group">
            <label>Nome do Combate</label>
            <input
              type="text"
              placeholder="Ex: Confronto no Beco Escuro"
              value={newSessionName}
              onChange={e => setNewSessionName(e.target.value)}
            />
          </div>

          <div className="csm-form-group">
            <label>Local (opcional)</label>
            <input
              type="text"
              placeholder="Ex: Centro da Cidade - Rua Principal"
              value={newSessionLocation}
              onChange={e => setNewSessionLocation(e.target.value)}
            />
          </div>

          <div className="csm-form-group">
            <label>Participantes</label>
            <div className="csm-participants-list">
              {availableParticipants.map(participant => (
                <label key={participant.id} className="csm-participant-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(participant.id)}
                    onChange={() => toggleParticipant(participant.id)}
                  />
                  <span className="csm-participant-name">{participant.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="csm-form-actions">
            <button 
              className="csm-create-confirm-btn"
              onClick={handleCreateSession}
              disabled={!newSessionName.trim()}
            >
              Criar Combate
            </button>
          </div>
        </div>
      )}

      <div className="csm-sessions-list">
        {sessions.length === 0 ? (
          <div className="csm-empty-state">
            <p>Nenhum combate criado. Clique em "Novo Combate" para começar.</p>
          </div>
        ) : (
          sessions.map(session => (
            <div
              key={session.id}
              className={`csm-session-card ${activeSessionId === session.id ? 'active' : ''} ${session.status}`}
            >
              <div className="csm-session-header">
                <div className="csm-session-info">
                  <h4>{session.name}</h4>
                  {session.location && <p className="csm-location">📍 {session.location}</p>}
                  <p className="csm-status">Status: <span className="csm-status-badge">{session.status}</span></p>
                </div>
                <div className="csm-session-actions">
                  <button
                    className="csm-btn csm-btn-primary"
                    onClick={() => onSelectSession(session.id)}
                  >
                    {activeSessionId === session.id ? 'Ativo' : 'Entrar'}
                  </button>
                  <button
                    className="csm-btn csm-btn-danger"
                    onClick={() => onDeleteSession(session.id)}
                    title="Deletar combate"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="csm-session-body">
                <div className="csm-session-participants">
                  <h5>Participantes ({(session.participantIds || []).length})</h5>
                  <div className="csm-participants-grid">
                    {(session.participantIds || []).length === 0 ? (
                      <p className="csm-no-participants">Sem participantes</p>
                    ) : (
                      (session.participantIds || []).map(participantId => {
                        const participant = availableParticipants.find(p => p.id === participantId);
                        return participant ? (
                          <div key={participantId} className="csm-participant-badge">
                            {participant.avatarUrl && (
                              <img src={participant.avatarUrl} alt={participant.name} />
                            )}
                            <span>{participant.name}</span>
                            <button
                              className="csm-remove-participant"
                              onClick={() => handleToggleParticipantInSession(session.id, participantId)}
                              title="Remover do combate"
                            >
                              ✕
                            </button>
                          </div>
                        ) : null;
                      })
                    )}
                  </div>

                  {editingSessionId === session.id && (
                    <div className="csm-edit-participants">
                      <h5>Adicionar Participantes</h5>
                      <div className="csm-participants-list">
                        {availableParticipants
                          .filter(p => !session.participantIds.includes(p.id))
                          .map(participant => (
                            <label key={participant.id} className="csm-participant-checkbox">
                              <input
                                type="checkbox"
                                onChange={() => handleToggleParticipantInSession(session.id, participant.id)}
                              />
                              <span className="csm-participant-name">{participant.name}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="csm-session-footer">
                <button
                  className="csm-btn csm-btn-secondary"
                  onClick={() => setEditingSessionId(editingSessionId === session.id ? null : session.id)}
                >
                  {editingSessionId === session.id ? 'Pronto' : 'Editar Participantes'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CombatSessionManager;
