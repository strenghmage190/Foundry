import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { getUserProfile, upsertUserProfile } from '../api/users';
import { getSignedAvatarUrl, getAvatarUrlOrFallback } from '../utils/avatarUtils';

interface UserProfile {
  displayName: string;
  pronouns: string;
  useOpenDyslexicFont: boolean;
  avatarPath: string | null;
}

const defaultProfile: UserProfile = {
  displayName: '',
  pronouns: '',
  useOpenDyslexicFont: false,
  avatarPath: null,
};

const STORAGE_KEY = 'userProfile';

const UserProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Load profile from DB (fallback to localStorage)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // fallback to localStorage
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw && mounted) {
            const parsed = JSON.parse(raw) as any;
            setProfile({
              displayName: parsed.displayName ?? '',
              pronouns: parsed.pronouns ?? '',
              useOpenDyslexicFont: parsed.useOpenDyslexicFont ?? false,
              avatarPath: parsed.avatarPath ?? null,
            });
          }
          return;
        }

        // Try DB first
        const dbProfile = await getUserProfile(user.id);
        if (dbProfile && mounted) {
          setProfile({
            displayName: (dbProfile as any).displayName ?? '',
            pronouns: (dbProfile as any).pronouns ?? '',
            useOpenDyslexicFont: (dbProfile as any).useOpenDyslexicFont ?? false,
            avatarPath: (dbProfile as any).avatarPath ?? null,
          });
        } else {
          // fallback to localStorage
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw && mounted) {
            const parsed = JSON.parse(raw) as any;
            setProfile({
              displayName: parsed.displayName ?? '',
              pronouns: parsed.pronouns ?? '',
              useOpenDyslexicFont: parsed.useOpenDyslexicFont ?? false,
              avatarPath: parsed.avatarPath ?? null,
            });
          }
        }
      } catch (e) {
        console.error('Error loading profile', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // If profile has avatarPath (storage key), generate a signed URL
  useEffect(() => {
    const gen = async () => {
      if (profile.avatarPath && !profile.avatarPath.startsWith('http')) {
        try {
          const { data } = await supabase.storage.from('user-avatars').createSignedUrl(profile.avatarPath, 3600);
          setAvatarUrl(data?.signedUrl || null);
        } catch (e) {
          console.warn('Could not create signed URL for avatar', e);
          setAvatarUrl(null);
        }
      } else {
        setAvatarUrl(profile.avatarPath || null);
      }
    };
    gen();
  }, [profile.avatarPath]);

  const handlePick = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Faça login antes de enviar avatar.'); return; }
    const uid = user.id;
    // ensure extension exists
    let ext = file.name.split('.').pop();
    if (!ext || ext.length > 6) ext = 'png';
    const fileName = `${uid}/${uid}_${Date.now()}.${ext}`; // place in user folder for clarity

    try {
      console.debug('Uploading avatar', { fileName, size: file.size, type: file.type });
      // Upload to bucket (include metadata and content type; use upsert)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'application/octet-stream',
          metadata: { user_id: uid },
        });

      console.debug('Upload result', { uploadData, uploadError });
      if (uploadError) {
        console.error('Upload error', uploadError);
        const msg = String(uploadError.message || JSON.stringify(uploadError));
        if (msg.toLowerCase().includes('bucket not found')) {
          alert("Falha ao enviar imagem: bucket 'user-avatars' não encontrado no Supabase.\nCrie um bucket chamado 'user-avatars' em Storage → Buckets no painel do Supabase e tente novamente.");
        } else {
          alert('Falha ao enviar imagem: ' + msg);
        }
        return;
      }
    } catch (err) {
      console.error('Unexpected upload exception', err);
      alert('Falha ao enviar imagem: ' + String(err));
      return;
    }

    // Persist path immediately in DB
    const ok = await upsertUserProfile(user.id, { avatarPath: fileName });
    if (!ok) {
      alert('Arquivo enviado mas falha ao salvar perfil (fallback em localStorage).');
      setProfile(p => ({ ...p, avatarPath: fileName }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...profile, avatarPath: fileName }));
      return;
    }

    // update profile state and immediately generate a signed URL for preview
    setProfile(p => ({ ...p, avatarPath: fileName }));
    try {
      const signed = await getSignedAvatarUrl(fileName, 'user-avatars');
      setAvatarUrl(signed || null);
    } catch (e) {
      console.warn('Could not create signed URL for uploaded avatar', e);
      setAvatarUrl(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const ok = await upsertUserProfile(user.id, profile);
        if (!ok) {
          // fallback to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }

      // toggle body class for dyslexic font
      if (profile.useOpenDyslexicFont) document.body.classList.add('open-dyslexic');
      else document.body.classList.remove('open-dyslexic');

      alert('Perfil salvo!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="up-container">
      <style>{`
        :root{ --bg:#1a1a1a; --card:#111113; --text:#e5e7eb; --muted:#a1a1aa; --border:#2f2f2f; --field-bg:#2d2d2d; --field-border:#4a4a4a; --focus:#8b5cf6; --save:#8b5cf6; --save-hover:#9b6df9; }
        .up-container{ max-width:900px; margin:32px auto; padding:0 16px; color:var(--text); font-family: system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,Arial,sans-serif; }
        .up-card{ background:var(--card); border:1px solid var(--border); border-radius:10px; padding:20px; }
        .up-title{ margin:0 0 16px 0; font-size:20px; }
        .up-grid{ display:flex; gap:24px; }
        .up-left{ flex:0 0 30%; min-width:220px; }
        .up-right{ flex:1; }
        .up-avatar{ position:relative; border:1px dashed #555; border-radius:10px; background:#181818; aspect-ratio:1/1; overflow:hidden; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); }
        .up-avatar:hover{ border-color:#888; color:#ddd; }
        .up-avatar img{ width:100%; height:100%; object-fit:cover; }
        .up-form{ display:grid; gap:14px; }
        .up-field{ display:grid; gap:6px; }
        .up-label{ color:#c9c9ce; }
        .up-input{ background:var(--field-bg); color:var(--text); border:1px solid var(--field-border); border-radius:8px; padding:10px 12px; outline:none; }
        .up-input:focus{ border-color:var(--focus); box-shadow:0 0 0 2px rgba(139,92,246,.25); }
        .up-toggle{ display:flex; align-items:center; gap:10px; }
        .up-actions{ margin-top:12px; }
        .up-btn{ background:var(--save); color:#fff; border:none; padding:10px 14px; border-radius:8px; cursor:pointer; font-weight:600; }
        .up-btn:hover{ background:var(--save-hover); }
      `}</style>

      <section className="up-card">
        <h2 className="up-title">Perfil do Usuário</h2>
        <div className="up-grid">
          <div className="up-left">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            <div className="up-avatar" onClick={handlePick} title="Alterar foto de perfil">
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" /> : <span>Clique para enviar foto</span>}
            </div>
          </div>
          <div className="up-right">
            <div className="up-form">
              <div className="up-field">
                <label className="up-label" htmlFor="displayName">Nome de Exibição</label>
                <input id="displayName" className="up-input" type="text" value={profile.displayName} onChange={(e)=>setProfile({ ...profile, displayName: e.target.value })} placeholder="Seu nome" />
              </div>
              <div className="up-field">
                <label className="up-label" htmlFor="pronouns">Pronomes</label>
                <input id="pronouns" className="up-input" type="text" value={profile.pronouns} onChange={(e)=>setProfile({ ...profile, pronouns: e.target.value })} placeholder="ele/dele, ela/dela, elu/delu" />
              </div>
              <div className="up-field up-toggle">
                <input id="dys" type="checkbox" checked={profile.useOpenDyslexicFont} onChange={(e)=>setProfile({ ...profile, useOpenDyslexicFont: e.target.checked })} />
                <label htmlFor="dys">Usar fonte para dislexia</label>
              </div>
              <div className="up-actions">
                <button className="up-btn" disabled={saving} onClick={handleSave}>{saving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserProfilePage;
