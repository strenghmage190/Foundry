import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../../types.ts';
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
} from '../../data/equipment.ts';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (items: InventoryItem[]) => void;
  onAddWeaponToCombat?: (weapon: InventoryItem & Weapon) => void;
}

type TabType = 'Armas' | 'Proteções' | 'Munição' | 'Modificações';

export const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({ isOpen, onClose, onAdd, onAddWeaponToCombat }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Armas');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');

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

  const allArmor = useMemo(() => {
    return [...ARMADURAS, ...ESCUDOS];
  }, []);

  // Obter items baseado na tab ativa
  const getTabItems = (): Equipment[] => {
    const items: Equipment[] = [];
    switch (activeTab) {
      case 'Armas':
        return allWeapons;
      case 'Proteções':
        return allArmor;
      case 'Munição':
        return MUNICAO;
      case 'Modificações':
        return WEAPON_MODIFICATIONS;
      default:
        return [];
    }
  };

  // Filtrar items
  const tabItems = getTabItems();
  const filteredItems = useMemo(() => {
    if (!searchTerm) return tabItems;
    const lowerSearch = searchTerm.toLowerCase();
    return tabItems.filter((item) =>
      item.name.toLowerCase().includes(lowerSearch) ||
      item.descricao.toLowerCase().includes(lowerSearch)
    );
  }, [tabItems, searchTerm]);

  // Toggle seleção
  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      const newQuantities = { ...quantities };
      delete newQuantities[id];
      setQuantities(newQuantities);
    } else {
      newSelected.add(id);
      setQuantities({ ...quantities, [id]: 1 });
    }
    setSelectedItems(newSelected);
  };

  // Atualizar quantidade
  const setQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setQuantities({ ...quantities, [id]: qty });
  };

  // Converter equipment para InventoryItem
  const convertToInventoryItem = (equipment: Equipment, quantity: number): InventoryItem => {
    return {
      id: Date.now() + Math.random(),
      name: equipment.name,
      quantity: activeTab === 'Munição' ? quantity : 1,
      category: activeTab,
      description: equipment.descricao,
      imageUrl: '',
      na: equipment.na,
      peso: equipment.espacos,
      origem: 'equipment',
    };
  };

  // Confirmar seleção
  const handleConfirm = () => {
    const newItems: InventoryItem[] = [];
    selectedItems.forEach((id) => {
      const equipment = tabItems.find((item) => item.id === id);
      if (equipment) {
        const quantity = quantities[id] || 1;
        if (activeTab === 'Munição') {
          newItems.push(convertToInventoryItem(equipment, quantity));
        } else {
          for (let i = 0; i < quantity; i++) {
            newItems.push(convertToInventoryItem(equipment, 1));
          }
        }
      }
    });

    onAdd(newItems);
    resetModal();
  };

  const resetModal = () => {
    setSelectedItems(new Set());
    setQuantities({});
    setSearchTerm('');
    setActiveTab('Armas');
    onClose();
  };

  if (!isOpen) return null;

  const selectedCount = selectedItems.size;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={resetModal}
    >
      <div
        style={{
          backgroundColor: '#1a1a1c',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '1.5rem',
          width: '95%',
          maxWidth: '850px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          color: '#fff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '1px solid #333',
            paddingBottom: '0.75rem',
          }}
        >
          <h2 style={{ margin: 0, fontFamily: 'Cinzel', fontSize: '1.2rem' }}>Adicionar Equipamento</h2>
          <button
            onClick={resetModal}
            style={{
              background: 'none',
              border: 'none',
              color: '#aaa',
              fontSize: '1.3rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            borderBottom: '1px solid #333',
            paddingBottom: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          {(['Armas', 'Proteções', 'Munição', 'Modificações'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchTerm('');
              }}
              style={{
                background: activeTab === tab ? '#a978f8' : 'transparent',
                color: activeTab === tab ? '#fff' : '#aaa',
                border: 'none',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                fontSize: '0.85rem',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem',
            marginBottom: '1rem',
            backgroundColor: '#2a2a2e',
            border: '1px solid #444',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '0.9rem',
          }}
        />

        {/* Items List */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {filteredItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: '#777',
                padding: '2rem',
              }}
            >
              Nenhum item encontrado
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedItems.has(item.id);
              const quantity = quantities[item.id] || 1;
              const isWeapon = activeTab === 'Armas';

              // Extrair propriedades da arma se existir
              const weapon = item as Weapon;
              const qualidades = weapon.qualidades || [];

              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  style={{
                    padding: '0.9rem',
                    backgroundColor: isSelected ? 'rgba(169, 120, 248, 0.2)' : '#2a2a2e',
                    border: `1px solid ${isSelected ? '#a978f8' : '#444'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Header com checkbox invisível e nome */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: isSelected ? '0.75rem' : '0.25rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    />
                    <h4
                      style={{
                        margin: 0,
                        color: '#fff',
                        fontSize: '0.95rem',
                        fontWeight: 'bold',
                        flex: 1,
                      }}
                    >
                      {item.name}
                    </h4>
                    <span style={{ color: '#a978f8', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      N.A. {item.na}
                    </span>
                    <span style={{ color: '#4ecdc4', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {item.espacos} esp.
                    </span>
                  </div>

                  {/* Linha de info compacta */}
                  {!isSelected && (
                    <p
                      style={{
                        margin: '0',
                        fontSize: '0.8rem',
                        color: '#aaa',
                        maxHeight: '1.5em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.descricao}
                    </p>
                  )}

                  {/* Info expandida quando selecionado */}
                  {isSelected && (
                    <>
                      {isWeapon && (
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                          {(weapon as Weapon).dano && (
                            <span style={{ color: '#ff6b6b' }}>Dano: <strong>{(weapon as Weapon).dano}</strong></span>
                          )}
                          {(weapon as Weapon).critico && (
                            <span style={{ color: '#ffd93d' }}>Crítico: <strong>{(weapon as Weapon).critico}</strong></span>
                          )}
                        </div>
                      )}

                      {qualidades.length > 0 && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {qualidades.slice(0, 3).map((q, idx) => (
                              <span
                                key={idx}
                                style={{
                                  backgroundColor: 'rgba(169, 120, 248, 0.3)',
                                  color: '#a978f8',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '3px',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {q}
                              </span>
                            ))}
                            {qualidades.length > 3 && (
                              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                                +{qualidades.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <p
                        style={{
                          margin: '0 0 0.75rem 0',
                          fontSize: '0.8rem',
                          color: '#ccc',
                          lineHeight: '1.4',
                        }}
                      >
                        {item.descricao}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'center',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label
                          style={{
                            fontSize: '0.8rem',
                            color: '#aaa',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Qtd:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(item.id, parseInt(e.target.value, 10))}
                          style={{
                            width: '50px',
                            padding: '0.3rem',
                            backgroundColor: '#1a1a1c',
                            border: '1px solid #a978f8',
                            borderRadius: '4px',
                            color: '#fff',
                            textAlign: 'center',
                            fontSize: '0.8rem',
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.75rem',
            borderTop: '1px solid #333',
            gap: '1rem',
          }}
        >
          <span style={{ color: '#aaa', fontSize: '0.85rem' }}>
            {selectedCount} item{selectedCount !== 1 ? 'ns' : ''} selecionado{selectedCount !== 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={resetModal}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: '1px solid #444',
                color: '#aaa',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: selectedCount === 0 ? '#555' : '#a978f8',
                border: 'none',
                color: '#fff',
                borderRadius: '4px',
                cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: 'bold',
              }}
            >
              Confirmar ({selectedCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
