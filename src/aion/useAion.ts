import { useCallback, useState } from 'react';
import { useRealData } from '../state/RealDataContext';
import { useDemoData } from '../state/DemoDataProvider';
import { useToast } from '../components/ui/Toast';
import { AION_INTENTS, normalize } from './intents';
import type { AionContext, AionResponse } from './types';

export interface AionMessage {
  id: string;
  role: 'user' | 'assistant';
  response?: AionResponse;
  text?: string;
}

let messageId = 0;

export function useAion() {
  const { properties, clients, visits, saveVisit, aiSearch } = useRealData();
  const { properties: mockProperties, clients: mockClients, visits: mockVisits, contracts, brokers, owners } = useDemoData();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<AionMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      response: {
        text:
          'Olá! Sou o Aion, consultor imobiliário inteligente da Kairós. Pergunte, por exemplo: "quem faz aniversário hoje?", "quais contratos vencem nos próximos 30 dias?" ou "mostre imóveis com piscina em Sorocaba".',
      },
    },
  ]);
  const [loading, setLoading] = useState(false);

  const ctx: AionContext = {
    properties,
    mockProperties,
    clients,
    mockClients,
    visits,
    mockVisits,
    contracts,
    brokers,
    owners,
    saveVisit,
    aiSearch,
  };

  const ask = useCallback(
    async (rawQuery: string) => {
      const query = rawQuery.trim();
      if (!query) return;

      setMessages((prev) => [...prev, { id: `u-${++messageId}`, role: 'user', text: query }]);
      setLoading(true);

      const normalized = normalize(query);
      const intent = AION_INTENTS.find((i) => i.match(normalized));

      try {
        let response: AionResponse;
        if (intent) {
          response = await intent.run(normalized, ctx);
        } else {
          const result = await aiSearch(query);
          response = result
            ? {
                text: result.explanation ?? `Encontrei ${result.matchedPropertyIds.length} imóveis compatíveis com sua busca.`,
              }
            : { text: 'Não consegui entender essa pergunta ainda. Tente reformular ou veja os exemplos sugeridos.' };
        }
        setMessages((prev) => [...prev, { id: `a-${++messageId}`, role: 'assistant', response }]);
      } catch {
        showToast('Erro ao processar a pergunta no Aion.', 'error');
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [properties, clients, visits, mockProperties, mockClients, mockVisits, contracts, brokers, owners, aiSearch, saveVisit, showToast],
  );

  return { messages, ask, loading };
}
