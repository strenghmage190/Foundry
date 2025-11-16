import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AgentListPage } from './components/AgentListPage';
import { CharacterSheetPage } from './components/CharacterSheetPage';
import { Header } from './components/Header';
import UserProfilePage from './components/UserProfilePage';
import CampaignsListPage from './components/CampaignsListPage';
import CampaignDashboardPage from './components/CampaignDashboardPage';
import InvitePage from './components/InvitePage';
import MasterScreenPage from './components/MasterScreenPage';
import PlayerSettingsPage from './components/PlayerSettingsPage';
import { initialAgentData } from './constants';
import { getUserProfile } from './api/users';
import { getSignedAvatarUrl } from './utils/avatarUtils';
import { AgentData, ToastData } from './types';
import { LiveToastContainer } from './components/LiveToastContainer';
import { AuthPage } from './components/AuthPage';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';
import './styles/main.css';

import { useMyContext, MyContextProvider } from './MyContext';

// --- Componente AppContent ---
// Este componente agora apenas define o layout e as rotas
const AppContent = () => {
    const { addLiveToast, addLogEntry, logHistory, onRemoveLogEntry, liveToasts, removeLiveToast } = useMyContext();
    const navigate = useNavigate();

        // Apply dyslexic font class if user previously enabled it (localStorage fallback)
        useEffect(() => {
            try {
                const raw = localStorage.getItem('userProfile');
                if (raw) {
                    const parsed = JSON.parse(raw) as any;
                    if (parsed?.useOpenDyslexicFont) document.body.classList.add('open-dyslexic');
                    else document.body.classList.remove('open-dyslexic');
                }
            } catch (e) {
                // ignore
            }
        }, []);

    // A função handleAddAgent agora só precisa navegar
    const handleAddAgent = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            alert("Você precisa estar logado para criar um agente!");
            return;
        }

        const tempName = `Agente_${Date.now()}`;
                // Attempt to use profile avatar as default for new agents
                let defaultAvatar = '';
                try {
                    const dbProfile = await getUserProfile(user.id);
                    if (dbProfile?.avatarPath) {
                        const signed = await getSignedAvatarUrl(dbProfile.avatarPath, 'user-avatars');
                        defaultAvatar = signed || '';
                    }
                } catch (e) {
                    console.warn('Could not resolve user profile avatar for new agent', e);
                }

                const newAgentBase = {
            ...JSON.parse(JSON.stringify(initialAgentData)),
            lastModified: new Date().toISOString(),
            character: {
                ...(initialAgentData.character || {}),
                name: tempName,
                                avatarUrl: defaultAvatar,
            },
        };

        const { data: insertedData, error } = await supabase
            .from("agents")
            .insert({
                data: newAgentBase,
                user_id: user.id,
            })
            .select("data, id")
            .single();

        if (error) {
            console.error("Erro ao adicionar agente:", error.message);
        } else if (insertedData) {
            // Após criar, navega para a ficha do novo agente
            navigate(`/agent/${insertedData.id}`);
        }
    }, [navigate]);

    return (
        <div className="app-container">
            <LiveToastContainer toasts={liveToasts} onRemove={removeLiveToast} />
            <Header
                onShowAgents={() => navigate('/agents')}
                onShowCampaigns={() => navigate('/campaigns')}
                onShowProfile={() => navigate('/profile')}
                onLogout={async () => { await supabase.auth.signOut(); }} />
            <main className="main-content">
                <Routes>
                    {/* Rota Padrão e Lista de Agentes */}
                    <Route path="/" element={<AgentListPage onAdd={handleAddAgent} />} />
                    <Route path="/agents" element={<AgentListPage onAdd={handleAddAgent} />} />

                    {/* 👇 ROTA DA FICHA - SEM PASSAR PROPS 👇 */}
                    {/* A ficha buscará seus próprios dados usando o ID da URL */}
                    <Route path="/agent/:agentId" element={<CharacterSheetPage />} />

                    {/* Rota da Ficha no Contexto de uma Campanha */}
                    <Route path="/campaign/:campaignId/agent/:agentId" element={<CharacterSheetPage />} />

                    {/* ... Suas outras rotas (campaigns, masterscreen, etc.) */}
                    <Route path="/campaigns" element={<CampaignsListPage />} />
                    <Route path="/campaign/:campaignId" element={<CampaignDashboardPage />} />
                    <Route path="/campaign/:campaignId/player/:playerId" element={<PlayerSettingsPage />} />
                    <Route path="/masterscreen/:campaignId" element={<MasterScreenPage />} />
                    <Route path="/profile" element={<UserProfilePage />} />
                    <Route path="/invite/:inviteCode" element={<InvitePage />} />
                </Routes>
            </main>
        </div>
    );
};

// --- Componente de Autenticação e Roteamento ---
const App = () => {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    return (
        <BrowserRouter>
            {session ? (
                <MyContextProvider>
                    <AppContent />
                </MyContextProvider>
            ) : <AuthPage />}
        </BrowserRouter>
    );
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);