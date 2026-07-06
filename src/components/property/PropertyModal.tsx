import React, { useState, useEffect } from 'react';
import { Property } from '../../types';
import { X, Plus, Trash2, Home, Check, Image as ImageIcon, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface PropertyModalProps {
  property: Property | null; // Null means we are creating
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Partial<Property>) => void;
}

const PRESET_IMAGES = [
  { url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80", tag: "Casa Tradicional" },
  { url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80", tag: "Mansão Moderna" },
  { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", tag: "Apartamento Luxo" },
  { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", tag: "Apartamento Cozy" },
  { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80", tag: "Chácara Luxo" },
];

export default function PropertyModal({ property, isOpen, onClose, onSave }: PropertyModalProps) {
  const [formData, setFormData] = useState<Partial<Property>>({
    code: '',
    type: 'casa',
    address: '',
    bairro: '',
    cidade: '',
    price: 350000,
    builtArea: 120,
    landArea: 250,
    bedrooms: 3,
    bathrooms: 2,
    garage: 1,
    description: '',
    images: [],
    videoUrl: '',
    status: 'Disponível'
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state if property is changed
  useEffect(() => {
    if (property) {
      setFormData(property);
    } else {
      // Set empty/fresh data
      setFormData({
        code: `IMOB-${Math.floor(100 + Math.random() * 900)}`,
        type: 'casa',
        address: '',
        bairro: '',
        cidade: '',
        price: 350000,
        builtArea: 100,
        landArea: 200,
        bedrooms: 3,
        bathrooms: 2,
        garage: 1,
        description: '',
        images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80"],
        videoUrl: '',
        status: 'Disponível'
      });
    }
    setErrorMsg('');
  }, [property, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Check if numeric conversions are required
    if (['price', 'builtArea', 'landArea', 'bedrooms', 'bathrooms', 'garage'].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), imageUrlInput.trim()]
    }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleSelectPresetImage = (url: string) => {
    if (formData.images?.includes(url)) return;
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), url]
    }));
  };

  // Handle Drag and Drop simulated upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Simulate reading dropped files to a nice mock URL to look slick
    const simulatedFiles = [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
    ];
    const pickedImg = simulatedFiles[Math.floor(Math.random() * simulatedFiles.length)];
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), pickedImg]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address?.trim() || !formData.bairro?.trim() || !formData.cidade?.trim()) {
      setErrorMsg("Por favor, preencha o Endereço completo (Endereço, Bairro e Cidade).");
      return;
    }
    if ((formData.images || []).length === 0) {
      setErrorMsg("Adicione pelo menos uma foto para ilustrar o imóvel.");
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
        className="bg-surface rounded-3xl shadow-xl border border-border max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface-hover rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl text-[#04121a]">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-text-primary text-lg">
                {property ? `Editar Imóvel [${formData.code}]` : 'Cadastrar Novo Imóvel'}
              </h3>
              <p className="text-xs text-text-secondary">Preencha as informações para o catálogo da imobiliária</p>
            </div>
          </div>
          <button 
            id="close-property-modal"
            onClick={onClose}
            className="p-1 px-2.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Codigo */}
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">Código do Imóvel</label>
              <input 
                type="text"
                name="code"
                placeholder="Ex: IMOB-101"
                value={formData.code || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden focus:ring-1 focus:ring-primary/40"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">Tipo de Imóvel</label>
              <select
                name="type"
                value={formData.type || 'casa'}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden focus:ring-1 focus:ring-primary/40"
              >
                <option value="casa">Casa</option>
                <option value="apartamento">Apartamento</option>
                <option value="terreno">Terreno</option>
                <option value="chácara">Chácara</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">Status Atual</label>
              <select
                name="status"
                value={formData.status || 'Disponível'}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden focus:ring-1 focus:ring-primary/40"
              >
                <option value="Disponível">Disponível</option>
                <option value="Vendido">Vendido</option>
                <option value="Alugado">Alugado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Preco */}
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">Valor de Negociação (R$)</label>
              <input 
                type="number"
                name="price"
                value={formData.price || 0}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden focus:ring-1 focus:ring-primary/40 font-bold text-text-primary"
              />
            </div>

            {/* Area Construida */}
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">Área Construída (m²)</label>
              <input 
                type="number"
                name="builtArea"
                value={formData.builtArea || 0}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden focus:ring-1 focus:ring-primary/40"
              />
            </div>

            {/* Area Terreno */}
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">Área do Terreno (m²)</label>
              <input 
                type="number"
                name="landArea"
                value={formData.landArea || 0}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-surface-hover rounded-2xl">
            <div>
              <label className="block text-[11px] font-black text-text-secondary uppercase tracking-wider mb-1.5 text-center">Quartos / Dorms</label>
              <input 
                type="number"
                name="bedrooms"
                min="0"
                value={formData.bedrooms || 0}
                onChange={handleChange}
                className="w-full text-center px-4 py-2 rounded-xl bg-surface border border-border text-sm focus:outline-hidden focus:ring-1 focus:ring-primary/40 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-text-secondary uppercase tracking-wider mb-1.5 text-center">Banheiros</label>
              <input 
                type="number"
                name="bathrooms"
                min="0"
                value={formData.bathrooms || 0}
                onChange={handleChange}
                className="w-full text-center px-4 py-2 rounded-xl bg-surface border border-border text-sm focus:outline-hidden focus:ring-1 focus:ring-primary/40 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-text-secondary uppercase tracking-wider mb-1.5 text-center">Vagas de Garagem</label>
              <input 
                type="number"
                name="garage"
                min="0"
                value={formData.garage || 0}
                onChange={handleChange}
                className="w-full text-center px-4 py-2 rounded-xl bg-surface border border-border text-sm focus:outline-hidden focus:ring-1 focus:ring-primary/40 font-bold"
              />
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Localização do Imóvel
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-text-secondary mb-1">Cidade</label>
                <input 
                  type="text"
                  name="cidade"
                  placeholder="Ex: Blumenau"
                  value={formData.cidade || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Bairro</label>
                <input 
                  type="text"
                  name="bairro"
                  placeholder="Ex: Centro"
                  value={formData.bairro || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Endereço Literal</label>
                <input 
                  type="text"
                  name="address"
                  placeholder="Ex: Rua XV de Novembro, 100"
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Description & Video link */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">Descrição Executiva do Imóvel</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Exponha os pontos fortes do imóvel. Ex: Ótima ventilação cruzada, sol da manhã, acabamento diferenciado..."
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden focus:ring-1 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-1">Vídeo de Apresentação (Ex: YouTube ou Vimeo URL)</label>
              <input 
                type="text"
                name="videoUrl"
                placeholder="Ex de link: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={formData.videoUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-hidden focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Photo Management */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-text-secondary uppercase tracking-wider">Mídia e Fotos do Imóvel</label>
            
            {/* Predefined photo library options to make cataloging quick */}
            <div className="p-3 bg-primary/10/50 rounded-2xl">
              <span className="text-[11px] text-primary font-bold block mb-2">Selecione fotos de demonstração rápida:</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_IMAGES.map((img) => {
                  const isSelected = formData.images?.includes(img.url);
                  return (
                    <button
                      key={img.tag}
                      type="button"
                      id={`preset-img-btn-${img.tag.replace(/\s+/g, '')}`}
                      onClick={() => handleSelectPresetImage(img.url)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${isSelected ? 'bg-primary border-primary text-[#04121a] font-bold' : 'bg-surface border-border text-text-secondary hover:border-border'}`}
                    >
                      {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-text-secondary" />}
                      {img.tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Link Add */}
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Cole um link de foto da internet (URL)..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-border text-xs focus:outline-hidden"
              />
              <button
                type="button"
                id="add-custom-photo-btn"
                onClick={handleAddImage}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-[#04121a] font-bold rounded-xl text-xs transition"
              >
                Injetar Link
              </button>
            </div>

            {/* Simulated Drag and Drop */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:bg-surface-hover cursor-pointer transition"
            >
              <div className="flex flex-col items-center gap-1.5">
                <ImageIcon className="w-8 h-8 text-text-secondary" />
                <p className="text-xs text-text-primary font-medium">Arraste e solte arquivos aqui para simular upload</p>
                <p className="text-[10px] text-text-secondary">Suporta JPG, PNG</p>
              </div>
            </div>

            {/* Selected Images list with delete buttons */}
            {formData.images && formData.images.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mt-4">
                {formData.images.map((imgUrl, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border border-border aspect-video bg-surface-hover">
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-danger hover:bg-danger/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition duration-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/70 text-[9px] px-1.5 rounded-sm text-white">
                      Foto {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-border flex gap-3 justify-end sticky bottom-0 bg-surface z-10 py-2">
            <button
              type="button"
              id="cancel-property-modal"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border text-text-secondary text-sm font-bold hover:bg-surface-hover transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="save-property-modal"
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-[#04121a] font-bold rounded-xl text-sm shadow-xs transition"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
