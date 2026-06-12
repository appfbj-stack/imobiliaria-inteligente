import React, { useState, useEffect } from 'react';
import { Visit, Property, Client } from '../types';
import { X, Calendar, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface VisitModalProps {
  visit: Visit | null; // null means creating
  isOpen: boolean;
  onClose: () => void;
  onSave: (visit: Partial<Visit>) => void;
  properties: Property[];
  clients: Client[];
}

export default function VisitModal({ visit, isOpen, onClose, onSave, properties, clients }: VisitModalProps) {
  const [formData, setFormData] = useState<Partial<Visit>>({
    date: '',
    time: '',
    clientId: '',
    propertyId: '',
    notes: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (visit) {
      setFormData(visit);
    } else {
      setFormData({
        date: new Date().toISOString().substring(0, 10),
        time: '14:00',
        clientId: clients[0]?.id || '',
        propertyId: properties[0]?.id || '',
        notes: ''
      });
    }
    setErrorMsg('');
  }, [visit, isOpen, clients, properties]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.propertyId || !formData.date || !formData.time) {
      setErrorMsg("O cliente, o imóvel, a data e a hora da visita são campos obrigatórios.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {visit ? `Editar Visita` : 'Agendar Visita de Imóvel'}
              </h3>
              <p className="text-xs text-slate-400">Marque o dia e hora para conduzir o cliente ao imóvel desejado</p>
            </div>
          </div>
          <button 
            id="close-visit-modal"
            onClick={onClose}
            className="p-1 px-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Client Selection */}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Comprador ou Inquilino (Cliente)</label>
            <select
              name="clientId"
              value={formData.clientId || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="" disabled>--- Selecione um cliente cadastrado ---</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.cpf ? `(${c.cpf})` : ''} - Telef: {c.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Property Selection */}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Imóvel de Interesse</label>
            <select
              name="propertyId"
              value={formData.propertyId || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="" disabled>--- Selecione um imóvel do catálogo ---</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.type.toUpperCase()} no {p.bairro} ({p.cidade}) - R$ {p.price.toLocaleString('pt-BR')} [{p.status}]
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Data
              </label>
              <input 
                type="date"
                name="date"
                value={formData.date || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Horário
              </label>
              <input 
                type="time"
                name="time"
                value={formData.time || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden"
              />
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Instruções ou Observações para a Visita</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Ex: Cliente tem interesse em examinar a vaga da garagem, verificar a incidência de sol na sacada pela tarde..."
              value={formData.notes || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end sticky bottom-0 bg-white py-2">
            <button
              type="button"
              id="cancel-visit-btn"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="save-visit-btn"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-xs transition animate-pulse-once"
            >
              Confirmar Agenda
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
