import React, { useState, useMemo } from 'react';
import {
  ARMAS_UMA_MAO,
  ARMAS_HASTE,
  LAMINAS_PESADAS,
  ARMAS_ESMAGADORAS,
  ARMAS_EXOTICAS,
  ARMAS_DISPARO_UMA_MAO,
  ARMAS_DISPARO_DUAS_MAOS,
  ARMADURAS,
  ESCUDOS,
  MUNICAO,
  WEAPON_MODIFICATIONS,
  Equipment,
  Weapon,
  Armor,
  Ammunition,
  WeaponModification,
  EquipmentCategory,
} from '../data/equipment';

type EquipmentFilter = 'Todas' | 'Armas' | 'Armaduras' | 'Munição' | 'Modificações';
type WeaponCategory = 'Arma Simples' | 'Arma de Haste' | 'Lâmina Pesada' | 'Esmagadora' | 'Arma Exótica' | 'Arma de Disparo (1 Mão)' | 'Arma de Disparo (2 Mãos)';

interface EquipmentFilterState {
  category: EquipmentFilter;
  weaponCategory: WeaponCategory | 'Todas';
  na: number; // Nível de Acesso máximo
  searchTerm: string;
}

const EquipmentExplorer: React.FC = () => {
  const [filterState, setFilterState] = useState<EquipmentFilterState>({
    category: 'Todas',
    weaponCategory: 'Todas',
    na: 5,
    searchTerm: '',
  });
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Consolidar todas as armas
  const allWeapons = useMemo(() => {
    return [
      ...ARMAS_UMA_MAO,
      ...ARMAS_HASTE,
      ...LAMINAS_PESADAS,
      ...ARMAS_ESMAGADORAS,
      ...ARMAS_EXOTICAS,
      ...ARMAS_DISPARO_UMA_MAO,
      ...ARMAS_DISPARO_DUAS_MAOS,
    ];
  }, []);

  // Filtrar equipamentos
  const filteredEquipment = useMemo(() => {
    let items: Equipment[] = [];

    if (filterState.category === 'Todas' || filterState.category === 'Armas') {
      items = [
        ...items,
        ...allWeapons.filter(w => {
          if (filterState.weaponCategory !== 'Todas' && w.category !== filterState.weaponCategory) {
            return false;
          }
          if (w.na > filterState.na) return false;
          if (filterState.searchTerm && !w.name.toLowerCase().includes(filterState.searchTerm.toLowerCase())) {
            return false;
          }
          return true;
        }),
      ];
    }

    if (filterState.category === 'Todas' || filterState.category === 'Armaduras') {
      const armors = [...ARMADURAS, ...ESCUDOS].filter(a => {
        if (a.na > filterState.na) return false;
        if (filterState.searchTerm && !a.name.toLowerCase().includes(filterState.searchTerm.toLowerCase())) {
          return false;
        }
        return true;
      });
      items = [...items, ...armors];
    }

    if (filterState.category === 'Todas' || filterState.category === 'Munição') {
      const ammo = MUNICAO.filter(m => {
        if (m.na > filterState.na) return false;
        if (filterState.searchTerm && !m.name.toLowerCase().includes(filterState.searchTerm.toLowerCase())) {
          return false;
        }
        return true;
      });
      items = [...items, ...ammo];
    }

    return items;
  }, [filterState, allWeapons]);

  // Cores por categoria
  const getCategoryColor = (category: EquipmentCategory | string): string => {
    if (category.includes('Arma')) return '#ff6b6b';
    if (category.includes('Armadura')) return '#4ecdc4';
    if (category.includes('Escudo')) return '#45b7d1';
    if (category.includes('Munição')) return '#f7b801';
    return '#8896a8';
  };

  // Cores por NA
  const getNAColor = (na: number): string => {
    switch (na) {
      case 0:
        return '#8896a8';
      case 1:
        return '#10b981';
      case 2:
        return '#3b82f6';
      case 3:
        return '#d4af37';
      case 4:
        return '#ec4899';
      case 5:
        return '#a855f7';
      default:
        return '#8896a8';
    }
  };

  const getNALabel = (na: number): string => {
    switch (na) {
      case 0:
        return 'Miserável';
      case 1:
        return 'Pobre';
      case 2:
        return 'Classe Média';
      case 3:
        return 'Rico';
      case 4:
        return 'Nobre';
      case 5:
        return 'Magnata';
      default:
        return 'Desconhecido';
    }
  };

  const renderWeaponStats = (weapon: Weapon) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
      <div>
        <p style={{ color: '#8896a8', margin: '0 0 0.25rem 0', fontSize: '0.75rem', fontWeight: 'bold' }}>DANO</p>
        <p style={{ color: '#e8e8e8', margin: '0', fontWeight: 'bold' }}>{weapon.dano}</p>
      </div>
      <div>
        <p style={{ color: '#8896a8', margin: '0 0 0.25rem 0', fontSize: '0.75rem', fontWeight: 'bold' }}>CRÍTICO</p>
        <p style={{ color: '#e8e8e8', margin: '0', fontWeight: 'bold' }}>{weapon.critico}</p>
      </div>
      <div>
        <p style={{ color: '#8896a8', margin: '0 0 0.25rem 0', fontSize: '0.75rem', fontWeight: 'bold' }}>TIPO</p>
        <p style={{ color: '#e8e8e8', margin: '0' }}>{weapon.tipo}</p>
      </div>
      {weapon.alcance && (
        <div>
          <p style={{ color: '#8896a8', margin: '0 0 0.25rem 0', fontSize: '0.75rem', fontWeight: 'bold' }}>ALCANCE</p>
          <p style={{ color: '#e8e8e8', margin: '0' }}>{weapon.alcance}</p>
        </div>
      )}
      {weapon.municao && (
        <div>
          <p style={{ color: '#8896a8', margin: '0 0 0.25rem 0', fontSize: '0.75rem', fontWeight: 'bold' }}>MUNIÇÃO</p>
          <p style={{ color: '#e8e8e8', margin: '0' }}>{weapon.municao}</p>
        </div>
      )}
    </div>
  );

  const renderArmorStats = (armor: Armor) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
      <div>
        <p style={{ color: '#8896a8', margin: '0 0 0.25rem 0', fontSize: '0.75rem', fontWeight: 'bold' }}>BÔNUS</p>
        <p style={{ color: '#e8e8e8', margin: '0', fontWeight: 'bold' }}>{armor.bonusArmadura} dados</p>
      </div>
      <div>
        <p style={{ color: '#8896a8', margin: '0 0 0.25rem 0', fontSize: '0.75rem', fontWeight: 'bold' }}>ESPAÇOS</p>
        <p style={{ color: '#e8e8e8', margin: '0' }}>{armor.espacos}</p>
      </div>
    </div>
  );

  const renderAmmunitionStats = (ammo: Ammunition) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
      <div>
        <p style={{ color: '#8896a8', margin: '0 0 0.25rem 0', fontSize: '0.75rem', fontWeight: 'bold' }}>QUANTIDADE</p>
        <p style={{ color: '#e8e8e8', margin: '0', fontWeight: 'bold' }}>{ammo.quantidade}/caixa</p>
      </div>
      <div>
        <p style={{ color: '#8896a8', margin: '0 0 0.25rem 0', fontSize: '0.75rem', fontWeight: 'bold' }}>EFEITO</p>
        <p style={{ color: '#e8e8e8', margin: '0' }}>{ammo.efeito}</p>
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'rgba(30, 35, 45, 0.9)',
        color: '#e8e8e8',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#d4af37', marginBottom: '0.5rem' }}>
            ⚔️ ARSENAL DE EQUIPAMENTOS
          </h1>
          <p style={{ fontSize: '1rem', color: '#8896a8' }}>
            Guia completo de armas, armaduras, munições e modificações
          </p>
        </div>

        {/* Filtros */}
        <div
          style={{
            backgroundColor: 'rgba(50, 60, 80, 0.5)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            marginBottom: '2rem',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {/* Busca */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#d4af37' }}>
                🔍 Buscar
              </label>
              <input
                type="text"
                placeholder="Nome do item..."
                value={filterState.searchTerm}
                onChange={e => setFilterState({ ...filterState, searchTerm: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(232, 232, 232, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '0.375rem',
                  color: '#e8e8e8',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* Categoria */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#d4af37' }}>
                📋 Categoria
              </label>
              <select
                value={filterState.category}
                onChange={e => setFilterState({ ...filterState, category: e.target.value as EquipmentFilter, weaponCategory: 'Todas' })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(232, 232, 232, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '0.375rem',
                  color: '#e8e8e8',
                  fontSize: '0.875rem',
                }}
              >
                <option value="Todas">Todos os Equipamentos</option>
                <option value="Armas">Armas</option>
                <option value="Armaduras">Armaduras & Escudos</option>
                <option value="Munição">Munição</option>
              </select>
            </div>

            {/* Tipo de Arma (se aplicável) */}
            {(filterState.category === 'Todas' || filterState.category === 'Armas') && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#d4af37' }}>
                  🗡️ Tipo de Arma
                </label>
                <select
                  value={filterState.weaponCategory}
                  onChange={e => setFilterState({ ...filterState, weaponCategory: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(232, 232, 232, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '0.375rem',
                    color: '#e8e8e8',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="Todas">Todas as Armas</option>
                  <option value="Arma Simples">Armas Simples</option>
                  <option value="Arma de Haste">Armas de Haste</option>
                  <option value="Lâmina Pesada">Lâminas Pesadas</option>
                  <option value="Esmagadora">Armas Esmagadoras</option>
                  <option value="Arma Exótica">Armas Exóticas</option>
                  <option value="Arma de Disparo (1 Mão)">Disparo (1 Mão)</option>
                  <option value="Arma de Disparo (2 Mãos)">Disparo (2 Mãos)</option>
                </select>
              </div>
            )}

            {/* Nível de Acesso */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#d4af37' }}>
                💰 Nível de Acesso Máx.
              </label>
              <select
                value={filterState.na}
                onChange={e => setFilterState({ ...filterState, na: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(232, 232, 232, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '0.375rem',
                  color: '#e8e8e8',
                  fontSize: '0.875rem',
                }}
              >
                <option value="0">N.A. 0 - Miserável</option>
                <option value="1">N.A. 1 - Pobre</option>
                <option value="2">N.A. 2 - Classe Média</option>
                <option value="3">N.A. 3 - Rico</option>
                <option value="4">N.A. 4 - Nobre</option>
                <option value="5">N.A. 5 - Magnata</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid de Equipamentos */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#8896a8', marginBottom: '1rem' }}>
            📊 {filteredEquipment.length} itens encontrados
          </p>

          {filteredEquipment.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: 'rgba(50, 60, 80, 0.3)',
                borderRadius: '0.75rem',
                color: '#8896a8',
              }}
            >
              Nenhum equipamento encontrado com esses critérios
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {filteredEquipment.map(item => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'rgba(50, 60, 80, 0.6)',
                    border: `2px solid ${getCategoryColor(item.category)}`,
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(50, 60, 80, 0.8)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(50, 60, 80, 0.6)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#d4af37', margin: '0 0 0.25rem 0' }}>
                        {item.name}
                      </h3>
                      <p style={{ fontSize: '0.75rem', color: '#8896a8', margin: '0' }}>
                        {item.category}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.375rem 0.75rem',
                          backgroundColor: getNAColor(item.na),
                          color: '#1e2330',
                          borderRadius: '0.25rem',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          textAlign: 'center',
                        }}
                      >
                        N.A. {item.na}
                      </span>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.375rem 0.75rem',
                          backgroundColor: 'rgba(212, 175, 55, 0.2)',
                          color: '#d4af37',
                          borderRadius: '0.25rem',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {item.espacos} esp.
                      </span>
                    </div>
                  </div>

                  {/* Descrição */}
                  <p style={{ fontSize: '0.875rem', color: '#c0c0c0', margin: '0 0 1rem 0', lineHeight: '1.5' }}>
                    {item.descricao}
                  </p>

                  {/* Stats (se expandido) */}
                  {expandedItem === item.id && (
                    <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '1rem' }}>
                      {/* Renderizar stats específicos por tipo */}
                      {'dano' in item && renderWeaponStats(item as Weapon)}
                      {'bonusArmadura' in item && renderArmorStats(item as Armor)}
                      {'quantidade' in item && renderAmmunitionStats(item as Ammunition)}

                      {/* Qualidades */}
                      {item.qualidades && item.qualidades.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8896a8', margin: '0 0 0.5rem 0' }}>
                            ✨ QUALIDADES
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {item.qualidades.map((qual, idx) => (
                              <span
                                key={idx}
                                style={{
                                  display: 'inline-block',
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                  border: '1px solid rgba(212, 175, 55, 0.4)',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.7rem',
                                  color: '#d4af37',
                                }}
                              >
                                {qual}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Compatibilidade (apenas munição) */}
                      {'compatibilidade' in item && (
                        <div>
                          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8896a8', margin: '0 0 0.5rem 0' }}>
                            🎯 COMPATIBILIDADE
                          </p>
                          <p style={{ fontSize: '0.8rem', color: '#e8e8e8', margin: '0' }}>
                            {(item as Ammunition).compatibilidade.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expand indicator */}
                  <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#8896a8' }}>
                    {expandedItem === item.id ? '▲ Fechar' : '▼ Detalhes'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seção de Modificações */}
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d4af37', marginBottom: '2rem', textAlign: 'center' }}>
            🔧 MODIFICAÇÕES DE ARMAS
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {WEAPON_MODIFICATIONS.map(mod => (
              <div
                key={mod.id}
                style={{
                  backgroundColor: 'rgba(50, 60, 80, 0.6)',
                  border: `2px solid ${
                    mod.type === 'Ferreiro' ? '#ff6b6b' : mod.type === 'Engenheiro' ? '#45b7d1' : '#a855f7'
                  }`,
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(50, 60, 80, 0.8)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(50, 60, 80, 0.6)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#d4af37', margin: '0 0 0.25rem 0' }}>
                      {mod.name}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#8896a8', margin: '0' }}>
                      {mod.type}
                    </p>
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'rgba(212, 175, 55, 0.2)',
                      color: '#d4af37',
                      borderRadius: '0.25rem',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                    }}
                  >
                    £{mod.custo}
                  </span>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#c0c0c0', margin: '0 0 1rem 0', lineHeight: '1.5' }}>
                  {mod.descricao}
                </p>

                <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8896a8', margin: '0 0 0.25rem 0' }}>
                    EFEITO
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#d4af37', margin: '0', fontStyle: 'italic' }}>
                    {mod.efeito}
                  </p>
                </div>

                {mod.catalisador && (
                  <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: '0.75rem', borderRadius: '0.375rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#a78bfa', margin: '0 0 0.25rem 0' }}>
                      CATALISADOR
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#e8e8e8', margin: '0' }}>
                      {mod.catalisador}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentExplorer;
