import React, { useState } from 'react';
import { Property } from '../../types';
import { 
  Home, BedDouble, Bath, Car, Maximize, MapPin, 
  Share2, Edit, Trash2, CheckCircle, AlertCircle, XCircle, 
  CornerDownRight, Image as ImageIcon, Send, ExternalLink, Video 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void | Promise<void>;
}

export default function PropertyCard({ property, onEdit, onDelete }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Status Badge Colors & Icons Helper
  const getStatusBadge = () => {
    switch (property.status) {
      case 'Disponível':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-success/10 text-success border border-success/30">
            <CheckCircle className="w-3.5 h-3.5" />
            Disponível
          </span>
        );
      case 'Vendido':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/30">
            <XCircle className="w-3.5 h-3.5" />
            Vendido
          </span>
        );
      case 'Alugado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-warning/10 text-warning border border-warning/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Alugado
          </span>
        );
    }
  };

  // WhatsApp Message Generators
  const getShareTextSummary = () => {
    const text = `Olá! Quero compartilhar um excelente imóvel localizado no ${property.bairro} em ${property.cidade}.\n\n` +
      `🏠 *${property.type.toUpperCase()}* - Código: ${property.code}\n` +
      `📍 Endereço: ${property.address}\n` +
      `💰 Valor: R$ ${property.price.toLocaleString('pt-BR')}\n` +
      `📐 Área Construída: ${property.builtArea} m²\n` +
      `🛏️ ${property.bedrooms} Quartos | 🚿 ${property.bathrooms} Banheiros | 🚗 ${property.garage} Vagas\n\n` +
      `📝 Descrição: ${property.description}`;
    return encodeURIComponent(text);
  };

  const getShareTextPhotos = () => {
    const photoList = property.images.map((img, idx) => `Foto ${idx + 1}: ${img}`).join('\n');
    const text = `Seguem os links das fotos do imóvel *${property.code}*:\n\n${photoList}`;
    return encodeURIComponent(text);
  };

  const getShareTextMap = () => {
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.address}, ${property.bairro}, ${property.cidade}`)}`;
    const text = `Olá! Segue a localização do imóvel *${property.code}* (${property.type}):\n\n` +
      `📍 Endereço: ${property.address}, ${property.bairro} - ${property.cidade}\n\n` +
      `Veja no Google Maps:\n${mapsLink}`;
    return encodeURIComponent(text);
  };

  const currentImg = property.images[currentImageIndex] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

  return (
    <div id={`card-${property.id}`} className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group relative">
      {/* Photo carousel container */}
      <div className="relative h-60 w-full overflow-hidden bg-surface-hover">
        <img 
          src={currentImg} 
          alt={property.address}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Gallery Overlay Controls */}
        {property.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/60 backdrop-blur-xs px-2.5 py-1 rounded-full flex gap-1 items-center">
            {property.images.map((_, idx) => (
              <button 
                key={idx}
                id={`carousel-btn-${property.id}-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-surface w-3' : 'bg-surface/40'}`}
              />
            ))}
          </div>
        )}

        {/* Floating Top Info Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
          <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md">
            {property.code}
          </span>
          {getStatusBadge()}
        </div>

        {/* Floating Status / Property Type pill */}
        <div className="absolute top-4 right-4 bg-surface/95 backdrop-blur-xs py-1 px-3 rounded-lg shadow-xs text-text-primary text-[11px] font-semibold uppercase tracking-wider">
          {property.type}
        </div>
      </div>

      {/* Content wrapper */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Address */}
          <div className="mb-2">
            <span className="text-[13px] text-text-secondary font-medium block">Preço de Venda / Aluguel</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-text-primary">R$ {property.price.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-text-secondary mb-4">
            <MapPin className="w-4 h-4 shrink-0 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-text-primary leading-snug">{property.address}</p>
              <p className="text-xs text-text-secondary">{property.bairro}, {property.cidade}</p>
            </div>
          </div>

          {/* Core attributes grid */}
          <div className="grid grid-cols-4 gap-2 py-3.5 border-y border-border mb-4 bg-surface-hover/50 rounded-xl px-3 text-text-primary">
            <div className="text-center flex flex-col items-center">
              <BedDouble className="w-4 h-4 text-text-secondary mb-1" />
              <span className="text-xs font-bold block">{property.bedrooms}</span>
              <span className="text-[10px] text-text-secondary font-medium">Quat.</span>
            </div>
            <div className="text-center flex flex-col items-center">
              <Bath className="w-4 h-4 text-text-secondary mb-1" />
              <span className="text-xs font-bold block">{property.bathrooms}</span>
              <span className="text-[10px] text-text-secondary font-medium">Banh.</span>
            </div>
            <div className="text-center flex flex-col items-center">
              <Car className="w-4 h-4 text-text-secondary mb-1" />
              <span className="text-xs font-bold block">{property.garage}</span>
              <span className="text-[10px] text-text-secondary font-medium">Vagas</span>
            </div>
            <div className="text-center flex flex-col items-center">
              <Maximize className="w-4 h-4 text-text-secondary mb-1" />
              <span className="text-xs font-bold block">{property.builtArea}m²</span>
              <span className="text-[10px] text-text-secondary font-medium">Const.</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-text-secondary line-clamp-3 mb-4 leading-relaxed italic">
            "{property.description}"
          </p>
        </div>

        {/* Action Panel */}
        <div>
          {/* Direct property video link if any */}
          {property.videoUrl && (
            <a 
              href={property.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              id={`video-btn-${property.id}`}
              className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-1.5 mb-3 rounded-lg border border-danger/30 bg-danger/10 text-xs font-semibold text-danger hover:bg-danger/15 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              Assistir Vídeo de Apresentação
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* Sharing on WhatsApp options */}
          <div className="relative mb-3">
            <button 
              id={`share-menu-btn-${property.id}`}
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="w-full flex items-center justify-center gap-2 bg-success/10 hover:bg-success/15 border border-success/30 text-success text-xs font-bold py-2.5 px-3 rounded-xl transition-all duration-200"
            >
              <Share2 className="w-4 h-4 shrink-0 text-success" />
              Compartilhar no WhatsApp
            </button>

            <AnimatePresence>
              {showShareMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-surface rounded-xl shadow-lg border border-border p-2 z-20 flex flex-col gap-1"
                  >
                    <p className="text-[11px] text-text-secondary font-bold uppercase tracking-wider px-2 py-1 border-b border-border mb-1">
                      Visualizar Opções
                    </p>
                    <a
                      href={`https://api.whatsapp.com/send?text=${getShareTextSummary()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={`share-summary-wa-${property.id}`}
                      className="flex items-center gap-2 hover:bg-surface-hover p-2 rounded-lg text-xs font-semibold text-text-primary transition"
                      onClick={() => setShowShareMenu(false)}
                    >
                      <Send className="w-3.5 h-3.5 text-success" />
                      Enviar Resumo do Imóvel
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?text=${getShareTextPhotos()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={`share-gallery-wa-${property.id}`}
                      className="flex items-center gap-2 hover:bg-surface-hover p-2 rounded-lg text-xs font-semibold text-text-primary transition"
                      onClick={() => setShowShareMenu(false)}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-primary" />
                      Compartilhar Links de Fotos
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?text=${getShareTextMap()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={`share-map-wa-${property.id}`}
                      className="flex items-center gap-2 hover:bg-surface-hover p-2 rounded-lg text-xs font-semibold text-text-primary transition"
                      onClick={() => setShowShareMenu(false)}
                    >
                      <MapPin className="w-3.5 h-3.5 text-danger" />
                      Compartilhar Localização (Maps)
                    </a>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Edit & Delete row */}
          <div className="flex gap-2">
            <button
              id={`edit-property-btn-${property.id}`}
              onClick={() => onEdit(property)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-bold border border-border text-text-secondary hover:bg-surface-hover hover:border-border transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Editar
            </button>
            <button
              id={`delete-property-btn-${property.id}`}
              onClick={() => onDelete(property.id)}
              className="flex items-center justify-center p-2 rounded-lg text-xs font-bold border border-danger/30 text-danger hover:bg-danger/10 hover:border-danger/30 transition-colors"
              title="Excluir Imóvel"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
