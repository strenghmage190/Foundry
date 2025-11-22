import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMyContext } from '../MyContext';
import { supabase } from '../supabaseClient';
import { getUserProfile, upsertUserProfile } from '../api/users';
import type { UserProfile } from '../types';

const defaultProfile: UserProfile = {
  displayName: '',
  pronouns: '',
  useOpenDyslexicFont: false,
  avatarPath: null,
  highlightColor: '#8b5cf6',
};

const STORAGE_KEY = 'userProfile';

const UserProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { updateHighlightColor } = useMyContext();

  // Load profile from DB (with fallback to localStorage)
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.log('[UserProfilePage] No authenticated user, loading from localStorage');
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw && mounted) {
            try {
              const parsed = JSON.parse(raw) as Partial<UserProfile>;
              console.log('[UserProfilePage] Loaded from localStorage:', parsed);
              setProfile(current => ({ ...current, ...parsed }));
            } catch (e) {
              console.error('[UserProfilePage] Failed to parse localStorage:', e);
            }
          }
          return;
        }

        // Try to load from database first
        console.log(`[UserProfilePage] Loading profile from DB for user ${user.id}`);
        const dbProfile = await getUserProfile(user.id);

        if (dbProfile && mounted) {
          console.log('[UserProfilePage] Successfully loaded from database:', dbProfile);
          setProfile(dbProfile);
          // Sync to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dbProfile));
          console.log('[UserProfilePage] Synced profile to localStorage');
        } else {
          // Fallback to localStorage if DB fails or returns null
          console.log('[UserProfilePage] DB load failed or returned null, trying localStorage');
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw && mounted) {
            try {
              const parsed = JSON.parse(raw) as Partial<UserProfile>;
              console.log('[UserProfilePage] Loaded from localStorage:', parsed);
              setProfile(current => ({ ...current, ...parsed }));
            } catch (e) {
              console.error('[UserProfilePage] Failed to parse localStorage:', e);
            }
          } else {
            console.log('[UserProfilePage] No localStorage data either');
          }
        }
      } catch (e) {
        console.error('[UserProfilePage] Error loading profile:', e);
        setError('Erro ao carregar perfil');
      }
    };

    loadProfile();
    return () => { mounted = false; };
  }, []);

  // Generate avatar URL when path changes
  useEffect(() => {
    const generateAvatarUrl = async () => {
      try {
        if (!profile.avatarPath) {
          setAvatarUrl(null);
          return;
        }

        // If it's already a full URL, use it as-is
        if (profile.avatarPath.startsWith('http')) {
          setAvatarUrl(profile.avatarPath);
          return;
        }

        console.log('[UserProfilePage] Generating public URL for avatar:', profile.avatarPath);
        
        // Use getPublicUrl to generate a permanent public URL (no expiration)
        const { data } = supabase.storage
          .from('user-avatars')
          .getPublicUrl(profile.avatarPath);

        if (data?.publicUrl) {
          console.log('[UserProfilePage] ✓ Public URL generated:', data.publicUrl);
          setAvatarUrl(data.publicUrl);
        } else {
          console.warn('[UserProfilePage] Failed to generate public URL');
          setAvatarUrl(null);
        }
      } catch (e) {
        console.error('[UserProfilePage] Error generating avatar URL:', e);
        setAvatarUrl(null);
      }
    };

    generateAvatarUrl();
  }, [profile.avatarPath]);

  const handlePick = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setUploadingAvatar(true);

        // Validate file
        if (!file.type.startsWith('image/')) {
          setError('Por favor, selecione um arquivo de imagem válido');
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError('A imagem deve ter menos de 5MB');
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Você precisa estar autenticado para enviar uma foto');
          return;
        }

        // Generate safe filename
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `${user.id}/${user.id}_${Date.now()}.${fileExt}`;

        console.log(`[UserProfilePage] Uploading avatar: ${fileName}`);

        // Upload file
        const { error: uploadError } = await supabase.storage
          .from('user-avatars')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type,
          });

        if (uploadError) {
          console.error('[UserProfilePage] Upload error:', uploadError);
          const errorMsg = uploadError.message.toLowerCase();
          if (errorMsg.includes('bucket not found')) {
            setError("Bucket 'user-avatars' não encontrado no Supabase. Crie o bucket em Storage → Buckets.");
          } else {
            setError(`Erro ao enviar: ${uploadError.message}`);
          }
          return;
        }

        console.log('[UserProfilePage] Avatar uploaded, saving to database');

        // Create updated profile with new avatar path
        const updatedProfile = { ...profile, avatarPath: fileName };
        console.log('[UserProfilePage] Updated profile:', updatedProfile);

        // Save to database with full profile
        console.log('[UserProfilePage] Saving to database with avatarPath:', fileName);
        const ok = await upsertUserProfile(user.id, updatedProfile);
        
        if (!ok) {
          console.error('[UserProfilePage] DB save FAILED for user:', user.id);
          console.warn('[UserProfilePage] Falling back to localStorage only');
          setProfile(updatedProfile);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
          setError('⚠️ Avatar enviado mas falha ao salvar no banco de dados. Usando cache local.');
          return;
        }

        console.log('[UserProfilePage] ✓ DB save succeeded, updating local state');
        // Update local state AFTER successful DB save
        setProfile(updatedProfile);
        // Also save to localStorage as backup
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
        setError(null);
        console.log('[UserProfilePage] ✓ Avatar successfully saved to DB and local storage');
      } catch (e) {
        console.error('[UserProfilePage] Unexpected upload error:', e);
        setError(`Erro inesperado: ${String(e)}`);
      } finally {
        setUploadingAvatar(false);
        // Reset file input
        if (fileRef.current) fileRef.current.value = '';
        
        // Small delay to ensure state updates are processed
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    },
    [profile]
  );

  const handleSave = useCallback(async () => {
    try {
      setError(null);
      setSaving(true);

      // Validate required fields
      if (!profile.displayName.trim()) {
        setError('Nome de exibição é obrigatório');
        return;
      }

      console.log('[UserProfilePage] Saving profile');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('[UserProfilePage] No authenticated user, saving to localStorage only');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        setError('Perfil salvo localmente (sem autenticação)');
        return;
      }

      // Save to database
      const ok = await upsertUserProfile(user.id, profile);
      if (!ok) {
        console.warn('[UserProfilePage] DB save failed, falling back to localStorage');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        setError('Perfil salvo localmente (erro ao sincronizar com banco de dados)');
        return;
      }

      // Apply dyslexic font preference
      if (profile.useOpenDyslexicFont) {
        document.body.classList.add('open-dyslexic');
      } else {
        document.body.classList.remove('open-dyslexic');
      }

      // Update global highlight color
      updateHighlightColor(profile.highlightColor);

      console.log('[UserProfilePage] Profile saved successfully');
      setError(null);
      // Show temporary success message
      const msg = 'Perfil salvo com sucesso!';
      console.log(msg);
      setTimeout(() => setError(null), 3000);
    } catch (e) {
      console.error('[UserProfilePage] Unexpected save error:', e);
      setError(`Erro ao salvar: ${String(e)}`);
    } finally {
      setSaving(false);
    }
  }, [profile, updateHighlightColor]);

  return (
    <div className="up-container">
      <style>{`
        :root {
          --bg: #1a1a1a;
          --card: #111113;
          --text: #e5e7eb;
          --muted: #a1a1aa;
          --border: #2f2f2f;
          --field-bg: #2d2d2d;
          --field-border: #4a4a4a;
          --focus: #8b5cf6;
          --save: #8b5cf6;
          --save-hover: #9b6df9;
          --error: #ef4444;
        }
        
        .up-container {
          max-width: 900px;
          margin: 32px auto;
          padding: 0 16px;
          color: var(--text);
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, sans-serif;
        }
        
        .up-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .up-title {
          margin: 0 0 16px 0;
          font-size: 20px;
          font-weight: 600;
        }
        
        .up-grid {
          display: flex;
          gap: 24px;
        }
        
        .up-left {
          flex: 0 0 30%;
          min-width: 220px;
        }
        
        .up-right {
          flex: 1;
        }
        
        .up-avatar {
          position: relative;
          border: 2px dashed #555;
          border-radius: 10px;
          background: #181818;
          aspect-ratio: 1/1;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--muted);
          transition: border-color 0.2s, background-color 0.2s;
        }
        
        .up-avatar:hover {
          border-color: var(--focus);
          background: #222;
        }
        
        .up-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .up-avatar-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .up-form {
          display: grid;
          gap: 14px;
        }
        
        .up-field {
          display: grid;
          gap: 6px;
        }
        
        .up-label {
          color: #c9c9ce;
          font-size: 14px;
          font-weight: 500;
        }
        
        .up-input {
          background: var(--field-bg);
          color: var(--text);
          border: 1px solid var(--field-border);
          border-radius: 8px;
          padding: 10px 12px;
          outline: none;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .up-input:focus {
          border-color: var(--focus);
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.25);
        }
        
        .up-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .up-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .up-toggle input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        
        .up-actions {
          margin-top: 12px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .up-btn {
          background: var(--save);
          color: #fff;
          border: none;
          padding: 10px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: background-color 0.2s, opacity 0.2s;
        }
        
        .up-btn:hover:not(:disabled) {
          background: var(--save-hover);
        }
        
        .up-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .up-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--error);
          border-radius: 8px;
          padding: 12px;
          color: #fca5a5;
          font-size: 14px;
          margin-bottom: 16px;
        }
        
        @media (max-width: 768px) {
          .up-grid {
            flex-direction: column;
          }
          
          .up-left {
            flex: 0 0 auto;
            min-width: unset;
            max-width: 200px;
          }
        }
      `}</style>

      {error && (
        <div className="up-error" role="alert">
          {error}
        </div>
      )}

      <section className="up-card">
        <h2 className="up-title">Perfil do Usuário</h2>
        <div className="up-grid">
          <div className="up-left">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={uploadingAvatar}
            />
            <div
              className="up-avatar"
              onClick={handlePick}
              title={uploadingAvatar ? 'Enviando...' : 'Clique para enviar foto'}
              style={{ cursor: uploadingAvatar ? 'not-allowed' : 'pointer' }}
            >
              {uploadingAvatar ? (
                <div className="up-avatar-loading">
                  <span>Enviando...</span>
                </div>
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar do usuário" />
              ) : (
                <span>Clique para enviar foto</span>
              )}
            </div>
          </div>

          <div className="up-right">
            <div className="up-form">
              <div className="up-field">
                <label className="up-label" htmlFor="displayName">
                  Nome de Exibição *
                </label>
                <input
                  id="displayName"
                  className="up-input"
                  type="text"
                  value={profile.displayName}
                  onChange={(e) =>
                    setProfile({ ...profile, displayName: e.target.value })
                  }
                  placeholder="Seu nome"
                  disabled={saving || uploadingAvatar}
                />
              </div>

              <div className="up-field">
                <label className="up-label" htmlFor="pronouns">
                  Pronomes
                </label>
                <input
                  id="pronouns"
                  className="up-input"
                  type="text"
                  value={profile.pronouns}
                  onChange={(e) =>
                    setProfile({ ...profile, pronouns: e.target.value })
                  }
                  placeholder="ele/dele, ela/dela, elu/delu"
                  disabled={saving || uploadingAvatar}
                />
              </div>

              <div className="up-field">
                <label className="up-label" htmlFor="highlightColor">
                  Cor de Destaque
                </label>
                <input
                  id="highlightColor"
                  className="up-input"
                  type="color"
                  value={profile.highlightColor}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      highlightColor: e.target.value,
                    })
                  }
                  disabled={saving || uploadingAvatar}
                  style={{ height: '40px', padding: '2px' }}
                />
              </div>

              <div className="up-field up-toggle">
                <input
                  id="dys"
                  type="checkbox"
                  checked={profile.useOpenDyslexicFont}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      useOpenDyslexicFont: e.target.checked,
                    })
                  }
                  disabled={saving || uploadingAvatar}
                />
                <label htmlFor="dys">Usar fonte para dislexia</label>
              </div>

              <div className="up-actions">
                <button
                  className="up-btn"
                  disabled={saving || uploadingAvatar}
                  onClick={handleSave}
                >
                  {saving ? 'Salvando...' : 'Salvar Perfil'}
                </button>
                {process.env.NODE_ENV === 'development' && (
                  <button
                    className="up-btn"
                    style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.7 }}
                    onClick={() => {
                      console.log('[DEBUG] Current profile state:', profile);
                      console.log('[DEBUG] Avatar path:', profile.avatarPath);
                      console.log('[DEBUG] localStorage:', localStorage.getItem(STORAGE_KEY));
                    }}
                  >
                    Debug
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserProfilePage;