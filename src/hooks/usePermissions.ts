import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useMyContext } from '../../MyContext';

interface UserPermissions {
  can_create_pathways: boolean;
  max_pathways: number;
  can_see_pathway_aeon?: boolean;
  can_see_pathway_veu?: boolean;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions>({ 
    can_create_pathways: false, 
    max_pathways: 1,
    can_see_pathway_aeon: false,
    can_see_pathway_veu: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        // Pega o usuário atual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setLoading(false);
          return;
        }
        
        // Busca as permissões do usuário
        const { data, error } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setPermissions({
            can_create_pathways: data.can_create_pathways,
            max_pathways: data.max_pathways,
            can_see_pathway_aeon: data.can_see_pathway_aeon || false,
            can_see_pathway_veu: data.can_see_pathway_veu || false
          });
        }
      } catch (err) {
        console.error('Erro ao buscar permissões:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPermissions();
  }, []);

  return { permissions, loading };
};
