import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import { X, Users, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ClientModalProps {
  client: Client | null; // null means creating
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
}

export default function ClientModal({ client, isOpen, onClose, onSave }: ClientModalProps) {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    cpf: '',
    address: '',
    interest: 'compra',
    priceRangeMin: 100000,
    priceRangeMax: 800000,
    propertyTypeInterest: ['casa'],
    observations: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({
        name: '',
        phone: '',
        whatsapp: '',
        email: '',
        cpf: '',
        address: '',
        interest: 'compra',
        priceRangeMin: 100000,
        priceRangeMax: 800000,
        propertyTypeInterest: ['casa', 'apartamento'],
        observations: ''
      });
    }
    setErrorMsg('');
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'priceRangeMin' || name === 'priceRangeMax') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (type: 'casa' | 'apartamento' | 'terreno' | 'chácara') => {
    const current = formData.propertyTypeInterest || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    setFormData(prev => ({ ...prev, propertyTypeInterest: updated }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.phone?.trim()) {
      setErrorMsg("O nome do cliente e o telefone de contato são obrigatórios.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface rounded-3xl shadow-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface-hover rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl text-[#04121a]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-text-primary text-lg">
                {client ? `Editar Cliente` : 'Cadastrar Novo Cliente'}
              </h3>
              <p className="text-xs text-text-secondary">Insira as informações de contato e preferências do comprador/locador</p>
            </div>
          </div>
          <button 
            id="close-client-modal"
            onClick={onClose}
            className="p-1 px-2.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">Nome Completo</label>
              <input 
                type="text"
                name="name"
                required
                placeholder="Ex: Carlos Mendes"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">CPF (Apenas números)</label>
              <input 
                type="text"
                name="cpf"
                placeholder="Ex: 123.456.789-00"
                value={formData.cpf || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">Telefone</label>
              <input 
                type="text"
                name="phone"
                placeholder="Ex: (47) 99122-4433"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">WhatsApp</label>
              <input 
                type="text"
                name="whatsapp"
                placeholder="Ex: (47) 99122-4433"
                value={formData.whatsapp || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">E-mail</label>
              <input 
                type="email"
                name="email"
                placeholder="contato@exemplo.com"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">Região / Endereço do Cliente</label>
            <input 
              type="text"
              name="address"
              placeholder="Ex: Rua Bahia, 45 - Blumenau/SC"
              value={formData.address || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden"
            />
          </div>

          {/* Preferences Subgroup */}
          <div className="p-5 bg-surface-hover/55 rounded-2xl border border-border space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Preferências de Imóvel</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Intenção</label>
                <select
                  name="interest"
                  value={formData.interest || 'compra'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs focus:outline-hidden"
                >
                  <option value="compra">Compra</option>
                  <option value="aluguel">Aluguel</option>
                  <option value="ambos">Ambos (Compra ou Aluguel)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Preço Mínimo (R$)</label>
                <input 
                  type="number"
                  name="priceRangeMin"
                  value={formData.priceRangeMin || 0}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Preço Máximo (R$)</label>
                <input 
                  type="number"
                  name="priceRangeMax"
                  value={formData.priceRangeMax || 0}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">Tipos de Interesse</label>
              <div className="flex flex-wrap gap-4">
                {(['casa', 'apartamento', 'terreno', 'chácara'] as const).map(type => {
                  const isChecked = formData.propertyTypeInterest?.includes(type);
                  return (
                    <label key={type} className="flex items-center gap-2 cursor-pointer select-none text-xs text-text-primary bg-surface border border-border px-3 py-1.5 rounded-lg hover:bg-surface-hover">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(type)}
                        className="rounded-sm border-border text-primary focus:ring-primary/40"
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">Observações Detalhadas (Dicas para IA e Matchmaking)</label>
            <textarea
              name="observations"
              rows={3}
              placeholder="Ex: Busca apartamento de no mínimo 3 quartos com 2 vagas perto de universidade. Aceita permuta..."
              value={formData.observations || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden focus:ring-1 focus:ring-primary/40"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex gap-3 justify-end sticky bottom-0 bg-surface py-2">
            <button
              type="button"
              id="cancel-client-btn"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border text-text-secondary text-sm font-bold hover:bg-surface-hover transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="save-client-btn"
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-[#04121a] font-bold rounded-xl text-sm shadow-xs transition"
            >
              Salvar Cliente
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
