import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const MODULE_ID = 'beyonders-system';

export function isFoundry(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).game !== 'undefined';
}

// Read helpers
export async function getAllActors() {
  if (isFoundry()) {
    // Prefer actor flag `MODULE_ID.agentData` if present (stores original AgentData),
    // otherwise provide a minimal mapping from Actor fields.
    return (window as any).game.actors.contents.map((a: any) => {
      const flagData = a.getFlag ? a.getFlag(MODULE_ID, 'agentData') : null;
      if (flagData) {
        return {
          ...flagData,
          id: a.id,
        };
      }
      return {
        id: a.id,
        character: {
          name: a.name,
          avatarUrl: a.img,
        },
        lastModified: a.updatedAt || a.data?.updatedAt || null,
      };
    });
  }

  // Fallback to supabase (your original API) if not running inside Foundry
  const { data, error } = await supabase.from('agents').select('data, id');
  if (error) throw error;
  return data.map((item: any) => ({ ...(item.data || {}), id: item.id }));
}

export function getActorById(actorId: string) {
  if (isFoundry()) {
    return (window as any).game.actors.get(actorId) || null;
  }
  // No fallback synchronous fetch; leave to caller to use getAllActors when not Foundry
  return null;
}

export async function updateActorData(actorId: string, updates: any) {
  if (isFoundry()) {
    const actor = (window as any).game.actors.get(actorId);
    if (!actor) throw new Error('Actor not found');
    return actor.update(updates);
  }
  // Fallback to supabase update example
  const { data, error } = await supabase.from('agents').update({ data: updates }).eq('id', actorId);
  if (error) throw error;
  return data;
}

export async function createActor(actorData: any) {
  if (isFoundry()) {
    // Ensure a valid Actor `type` is provided (Foundry requires this).
    // Default to `character` if the caller didn't specify one to avoid
    // runtime validation errors like "type may not be undefined".
    const dataToCreate = { ...(actorData || {}) };
    if (typeof dataToCreate.type === 'undefined' || dataToCreate.type === null) {
      console.warn('[foundryAdapter] createActor called without `type`. Defaulting to "hero".');
      dataToCreate.type = 'hero';
    }
    // Map legacy or generic types coming from the web app to system-specific types
    if (dataToCreate.type === 'character' || dataToCreate.type === 'npc') {
      console.info('[foundryAdapter] mapping actor type', dataToCreate.type, '->', 'hero');
      dataToCreate.type = 'hero';
    }
    return (window as any).Actor.create(dataToCreate);
  }
  const { data, error } = await supabase.from('agents').insert([{ data: actorData }]);
  if (error) throw error;
  return data;
}

export async function deleteActor(actorId: string) {
  if (isFoundry()) {
    const actor = (window as any).game.actors.get(actorId);
    if (!actor) throw new Error('Actor not found');
    return actor.delete();
  }
  const { data, error } = await supabase.from('agents').delete().eq('id', actorId);
  if (error) throw error;
  return data;
}

export async function getAgentDataById(agentId: string) {
  if (isFoundry()) {
    const actor = (window as any).game.actors.get(agentId);
    if (!actor) return null;
    const flag = actor.getFlag ? actor.getFlag(MODULE_ID, 'agentData') : null;
    if (flag) return { ...flag, id: actor.id };
    // Construct a minimal AgentData-like object from actor
    return {
      id: actor.id,
      character: {
        name: actor.name,
        avatarUrl: actor.img,
      },
      lastModified: actor.updatedAt || actor.data?.updatedAt || null,
    };
  }

  const { data, error } = await supabase.from('agents').select('id, data, is_private').eq('id', agentId).single();
  if (error) throw error;
  const revived = data?.data || null;
  return revived ? { ...revived, id: data.id, isPrivate: !!data.is_private } : null;
}

export async function saveAgentData(agentId: string, dataObj: any) {
  if (isFoundry()) {
    const actor = (window as any).game.actors.get(agentId);
    if (!actor) throw new Error('Actor not found');
    return actor.setFlag(MODULE_ID, 'agentData', dataObj);
  }
  const { data, error } = await supabase.from('agents').update({ data: dataObj }).eq('id', agentId);
  if (error) throw error;
  return data;
}

export async function createChat(content: string) {
  if (isFoundry()) {
    return (window as any).ChatMessage.create({ content });
  }
  // Fallback: log to console or write to supabase table 'chat_messages'
  console.log('Chat:', content);
  return null;
}

// Foundry-specific helpers for file uploads and dice logging
export async function uploadAvatarToFoundry(file: File, agentId: string, fieldName: string): Promise<string> {
  if (!isFoundry()) {
    throw new Error('uploadAvatarToFoundry only works in Foundry');
  }

  const fp = (window as any).FilePicker;
  if (!fp) {
    throw new Error('FilePicker not available');
  }

  // Upload to world assets directory
  const result = await fp.upload('data', `worlds/${(window as any).game.world.id}/assets/avatars`, file, {
    bucket: null,
    path: `worlds/${(window as any).game.world.id}/assets/avatars`
  });

  if (!result?.path) {
    throw new Error('Upload failed');
  }

  return result.path;
}

export async function logDiceRollToFoundry(payload: {
  campaign_id?: string;
  character_name: string;
  roll_name: string;
  result: string;
  details: string;
  roll_data?: any;
  damage?: number;
}) {
  if (!isFoundry()) {
    throw new Error('logDiceRollToFoundry only works in Foundry');
  }

  const content = `
    <div class="dice-roll-log">
      <h4>${payload.roll_name}</h4>
      <p><strong>${payload.character_name}:</strong> ${payload.result}</p>
      <details>
        <summary>Detalhes</summary>
        <pre>${payload.details}</pre>
        ${payload.roll_data ? `<pre>Rolagem: ${JSON.stringify(payload.roll_data, null, 2)}</pre>` : ''}
        ${payload.damage ? `<p>Dano: ${payload.damage}</p>` : ''}
      </details>
    </div>
  `;

  return (window as any).ChatMessage.create({
    content,
    speaker: { alias: payload.character_name },
    type: CONST.CHAT_MESSAGE_TYPES.ROLL
  });
}

// Example convenience: heal actor by amount
export async function healActor(actorId: string, amount: number) {
  if (isFoundry()) {
    const actor = (window as any).game.actors.get(actorId);
    if (!actor) throw new Error('Actor not found');
    // try common system path for hp, otherwise merge
    const hpPath = findHpPath(actor.system);
    if (hpPath) {
      const current = getNested(actor.system, hpPath);
      const updateObj: any = {};
      setNested(updateObj, hpPath, current + amount);
      await actor.update(updateObj);
    } else {
      throw new Error('HP path not found on actor system');
    }
    await createChat(`<strong>${actor.name}</strong> foi curado em ${amount} pontos.`);
    return actor;
  }

  // Fallback to supabase action or API
  const { data, error } = await supabase.from('actors').select('*').eq('id', actorId).single();
  if (error) throw error;
  const newHp = (data.hp || 0) + amount;
  const { data: u, error: e2 } = await supabase.from('actors').update({ hp: newHp }).eq('id', actorId);
  if (e2) throw e2;
  return u;
}

// React hook to listen for Foundry actor updates
export function useFoundryActorUpdate(actorId?: string) {
  const [actor, setActor] = useState<any | null>(null);

  useEffect(() => {
    if (!isFoundry() || !actorId) return;

    const handler = (updatedActor: any, changes: any) => {
      if (updatedActor.id === actorId) {
        setActor(updatedActor);
      }
    };

    const hookId = (window as any).Hooks.on('updateActor', handler);

    // initial load
    const existing = (window as any).game.actors.get(actorId);
    if (existing) setActor(existing);

    return () => {
      try {
        (window as any).Hooks.off('updateActor', hookId);
      } catch (e) {
        // best-effort
      }
    };
  }, [actorId]);

  return actor;
}

// Small helpers for nested paths
function findHpPath(system: any) {
  if (!system) return null;
  // common patterns
  if (system.attributes && system.attributes.hp && typeof system.attributes.hp.value !== 'undefined') return 'attributes.hp.value';
  if (system.hp && typeof system.hp.value !== 'undefined') return 'hp.value';
  return null;
}

function getNested(obj: any, path: string) {
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

function setNested(obj: any, path: string, value: any) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    cur[p] = cur[p] || {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

export default {
  isFoundry,
  getAllActors,
  getActorById,
  updateActorData,
  healActor,
  createChat,
  useFoundryActorUpdate
};
