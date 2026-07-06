import { useState } from 'react';
import { Plus, Edit, Trash2, Sparkles, Send } from 'lucide-react';
import type { Client, MatchmakingResult } from '../types';
import { useRealData } from '../state/RealDataContext';
import ClientModal from '../components/client/ClientModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Drawer } from '../components/ui/Drawer';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

export function ClientsPage() {
  const { clients, loadingClients, saveClient, deleteClient, fetchMatches } = useRealData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [matchClient, setMatchClient] = useState<Client | null>(null);
  const [matchResult, setMatchResult] = useState<MatchmakingResult | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);

  const openMatchmaking = async (client: Client) => {
    setMatchClient(client);
    setMatchLoading(true);
    setMatchResult(null);
    const result = await fetchMatches(client.id);
    setMatchResult(result);
    setMatchLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="flex items-center justify-between border-primary/20 bg-primary/5 p-5">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Gestão inteligente de contatos</h3>
          <p className="mt-1 text-xs text-text-secondary">
            Clique em "Compatibilidade IA" para cruzar automaticamente um cliente com o catálogo de imóveis.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedClient(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={14} /> Adicionar cliente
        </Button>
      </Card>

      {loadingClients ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : clients.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {clients.map((client) => (
            <Card key={client.id} className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-black leading-tight text-text-primary">{client.name}</h4>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                      CPF: {client.cpf || 'Não preenchido'}
                    </p>
                  </div>
                  <Badge tone={client.interest === 'compra' ? 'success' : client.interest === 'aluguel' ? 'warning' : 'info'}>
                    {client.interest}
                  </Badge>
                </div>

                <div className="my-4 grid grid-cols-2 gap-3 border-y border-border py-3 text-[11px]">
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-text-secondary">Telefone</span>
                    <span className="font-semibold text-text-primary">{client.phone}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-text-secondary">E-mail</span>
                    <span className="block truncate font-medium text-text-primary">{client.email}</span>
                  </div>
                </div>

                <div className="mb-4 space-y-2 rounded-2xl bg-surface-hover/70 p-4.5 text-xs text-text-primary">
                  <div className="flex items-baseline justify-between">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">Faixa de preço</span>
                    <span className="font-extrabold text-text-primary">
                      R$ {client.priceRangeMin.toLocaleString('pt-BR')} - R$ {client.priceRangeMax.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-secondary">Tipos desejados</span>
                    <div className="flex flex-wrap gap-1.5">
                      {client.propertyTypeInterest.map((t) => (
                        <Badge key={t} tone="neutral" className="capitalize">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {client.observations && (
                    <div className="mt-2 border-t border-border pt-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">Observações</span>
                      <p className="mt-0.5 text-[11px] italic leading-relaxed text-text-secondary">"{client.observations}"</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={() => openMatchmaking(client)} className="flex-1">
                  <Sparkles size={14} /> Compatibilidade IA
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    setSelectedClient(client);
                    setIsModalOpen(true);
                  }}
                  title="Editar"
                >
                  <Edit size={15} />
                </Button>
                <Button variant="danger" size="icon" onClick={() => deleteClient(client.id)} title="Excluir">
                  <Trash2 size={15} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum cliente cadastrado ainda"
          description="Registre compradores ou inquilinos para calcular compatibilidades automaticamente com o portfólio."
        />
      )}

      <ClientModal
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
        onSave={async (formData) => {
          const ok = await saveClient(formData);
          if (ok) {
            setIsModalOpen(false);
            setSelectedClient(null);
          }
        }}
      />

      <Drawer open={!!matchClient} onClose={() => setMatchClient(null)} title="Compatibilidade IA" widthClassName="max-w-2xl">
        {matchLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : matchResult && matchClient ? (
          <div className="space-y-6">
            <Card className="space-y-3 border-primary/30 bg-primary/5 p-6">
              <Badge tone="info">Comprador sob análise</Badge>
              <h3 className="text-lg font-black text-text-primary">{matchClient.name}</h3>
              <div className="grid grid-cols-1 gap-4 pt-2 text-xs md:grid-cols-3">
                <div>
                  <span className="block text-[10px] font-black uppercase text-text-secondary">Interesse</span>
                  <span className="font-semibold capitalize text-text-primary">{matchClient.interest}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase text-text-secondary">Tipos de imóvel</span>
                  <span className="font-semibold capitalize text-text-primary">{matchClient.propertyTypeInterest.join(', ')}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase text-text-secondary">Faixa disponível</span>
                  <span className="font-semibold text-text-primary">
                    R$ {matchClient.priceRangeMin.toLocaleString('pt-BR')} - R$ {matchClient.priceRangeMax.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </Card>

            <div>
              <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-text-secondary">
                Correspondências em destaque ({matchResult.matches.length})
              </h4>
              {matchResult.matches.length > 0 ? (
                <div className="space-y-4">
                  {matchResult.matches.map((match) => (
                    <Card key={match.property.id} className="flex flex-col gap-4 p-5 md:flex-row">
                      <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-surface-hover md:w-40">
                        <img
                          src={match.property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'}
                          alt=""
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-extrabold capitalize text-text-primary">
                                {match.property.type} no {match.property.bairro} ({match.property.cidade})
                              </h4>
                              <p className="mt-1 text-xs font-semibold text-primary">R$ {match.property.price.toLocaleString('pt-BR')}</p>
                            </div>
                            <Badge tone="success">{match.score}%</Badge>
                          </div>
                          <div className="mt-3 space-y-1.5">
                            {match.reasons.map((r, i) => (
                              <p key={i} className="text-xs leading-normal text-text-secondary">
                                ✓ {r}
                              </p>
                            ))}
                          </div>
                        </div>
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `Olá ${matchClient.name}! Localizamos um imóvel compatível no bairro ${match.property.bairro}, com ${match.property.bedrooms} quartos por R$ ${match.property.price.toLocaleString('pt-BR')}. Gostaria de agendarmos uma visita?`,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 self-start rounded-xl bg-success/15 px-3.5 py-2 text-xs font-bold text-success hover:bg-success/25"
                        >
                          <Send size={13} /> Enviar para cliente
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-text-secondary">
                  Nenhum imóvel disponível possui pontuação compatível com os critérios deste comprador.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
