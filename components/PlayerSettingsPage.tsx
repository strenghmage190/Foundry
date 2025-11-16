import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PlayerSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { campaignId, playerId } = useParams<{ campaignId: string; playerId: string }>();

  const [playerName, setPlayerName] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [gmNotes, setGmNotes] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickFile = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarPreview(url);
  };

  const handleSave = () => {
    // Placeholder de persistência – integrar com Supabase depois
    alert('Alterações salvas (exemplo).');
    navigate(`/campaign/${campaignId}?tab=players`);
  };

  const handleRemove = () => {
    if (confirm('Remover jogador desta campanha?')) {
      // Placeholder – integrar com remoção real depois
      alert('Jogador removido (exemplo).');
      navigate(`/campaign/${campaignId}?tab=players`);
    }
  };

  return (
    <div className="pc-container">
      <style>{`
        :root{ --bg:#1a1a1a; --card:#111113; --text:#e5e7eb; --muted:#a1a1aa; --border:#2f2f2f; --field-bg:#2d2d2d; --field-border:#4a4a4a; --focus:#8b5cf6; --save:#8b5cf6; --save-hover:#9b6df9; --danger:#991b1b; --danger-hover:#b91c1c; }
        .pc-container{ max-width:1100px; margin:32px auto; padding:0 16px; color:var(--text); font-family: system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,Arial,sans-serif; }
        .pc-card{ background:var(--card); border:1px solid var(--border); border-radius:10px; padding:20px; }
        .pc-title{ margin:0 0 16px 0; font-size:20px; }
        .pc-flex{ display:flex; gap:24px; }
        .pc-left{ flex:0 0 30%; min-width:240px; }
        .pc-right{ flex:1 1 70%; }
        .pc-avatar-wrap{ position:relative; border:1px dashed #555; border-radius:10px; background:#181818; aspect-ratio:4/3; overflow:hidden; display:flex; align-items:center; justify-content:center; color:var(--muted); cursor:pointer; transition:border-color .2s,color .2s; }
        .pc-avatar-wrap:hover{ border-color:#888; color:#ddd; }
        .pc-avatar-img{ width:100%; height:100%; object-fit:cover; }
        .pc-avatar-overlay{ position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,.05), rgba(0,0,0,.55)); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s; font-weight:600; }
        .pc-avatar-wrap:hover .pc-avatar-overlay{ opacity:1; }
        .pc-avatar-hint{ font-size:14px; color:var(--muted); margin-top:8px; text-align:center; }
        .pc-form{ display:grid; gap:14px; }
        .pc-field{ display:grid; gap:6px; }
        .pc-label{ color:#c9c9ce; font-size:.95rem; }
        .pc-input,.pc-textarea{ width:100%; background:var(--field-bg); color:var(--text); border:1px solid var(--field-border); border-radius:8px; padding:10px 12px; outline:none; transition:border-color .15s, box-shadow .15s; }
        .pc-input::placeholder,.pc-textarea::placeholder{ color:#a7a7ad; }
        .pc-input:focus,.pc-textarea:focus{ border-color:var(--focus); box-shadow:0 0 0 2px rgba(139,92,246,.25); }
        .pc-textarea{ min-height:140px; resize:vertical; }
        .pc-actions{ display:flex; gap:12px; margin-top:10px; flex-wrap:wrap; }
        .pc-btn{ appearance:none; border:none; border-radius:8px; padding:10px 14px; font-weight:600; cursor:pointer; transition: background-color .15s, opacity .15s; }
        .pc-btn:disabled{ opacity:.6; cursor:not-allowed; }
        .pc-btn-save{ background:var(--save); color:#fff; }
        .pc-btn-save:hover{ background:var(--save-hover); }
        .pc-btn-danger{ background:var(--danger); color:#fff; }
        .pc-btn-danger:hover{ background:var(--danger-hover); }
        @media (max-width:820px){ .pc-flex{ flex-direction:column; } .pc-left{ min-width:unset; } }
        .sr-only{ position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
      `}</style>

      <section className="pc-card">
        <h2 className="pc-title">Configurar Jogador</h2>
        <div style={{ marginBottom: 12, color: '#a1a1aa' }}>Campanha: {campaignId} · Jogador: {playerId}</div>

        <div className="pc-flex">
          <div className="pc-left">
            <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
            <div className="pc-avatar-wrap" onClick={handlePickFile} title="Alterar Foto">
              {avatarPreview ? (
                <img src={avatarPreview} className="pc-avatar-img" alt="Avatar do jogador" />
              ) : (
                <div> Clique para enviar uma foto </div>
              )}
              <div className="pc-avatar-overlay">Alterar Foto</div>
            </div>
            <div className="pc-avatar-hint">Formatos: JPG, PNG, WEBP (até 5MB).</div>
          </div>

          <div className="pc-right">
            <form className="pc-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="pc-field">
                <label className="pc-label" htmlFor="playerName">Nome do Jogador</label>
                <input id="playerName" className="pc-input" type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Ex.: João Silva" />
              </div>

              <div className="pc-field">
                <label className="pc-label" htmlFor="characterName">Nome do Personagem</label>
                <input id="characterName" className="pc-input" type="text" value={characterName} onChange={(e) => setCharacterName(e.target.value)} placeholder="Ex.: Alastor Crowley" />
              </div>

              <div className="pc-field">
                <label className="pc-label" htmlFor="pronouns">Pronomes (opcional)</label>
                <input id="pronouns" className="pc-input" type="text" value={pronouns} onChange={(e) => setPronouns(e.target.value)} placeholder="ele/dele, ela/dela, elu/delu" />
              </div>

              <div className="pc-field">
                <label className="pc-label" htmlFor="gmNotes">Anotações do Mestre</label>
                <textarea id="gmNotes" className="pc-textarea" value={gmNotes} onChange={(e) => setGmNotes(e.target.value)} placeholder="Observações privadas do mestre..."></textarea>
              </div>

              <div className="pc-actions">
                <button className="pc-btn pc-btn-save" type="submit">Salvar Alterações</button>
                <button className="pc-btn pc-btn-danger" type="button" onClick={handleRemove}>Remover Jogador</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlayerSettingsPage;
