import { birthdaysOn, staleClients, topBrokerBySales } from '../lib/insights';
import type { AionContext, AionIntent, AionResponse } from './types';

/** Lowercase + strip accents, so keyword matching doesn't care about diacritics. */
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function includesAny(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

const AMENITIES = ['piscina', 'churrasqueira', 'academia', 'portaria 24h', 'salao de festas', 'vista para o mar', 'quintal amplo', 'ar-condicionado', 'mobiliado', 'energia solar'];

const birthdaysToday: AionIntent = {
  id: 'birthdays-today',
  match: (q) => includesAny(q, ['aniversari']) && !includesAny(q, ['mes', 'semana']),
  run: (_q, ctx) => {
    const people = birthdaysOn([...ctx.brokers, ...ctx.owners]);
    if (people.length === 0) {
      return { text: 'Ninguém faz aniversário hoje. Veja a lista completa do mês em Aniversariantes.' };
    }
    return {
      text: `${people.length} pessoa(s) fazem aniversário hoje:`,
      table: {
        columns: [
          { key: 'name', header: 'Nome', render: (r) => String(r.name) },
          { key: 'birthDate', header: 'Data', render: (r) => String(r.birthDate).slice(5) },
        ],
        rows: people.map((p) => ({ name: p.name, birthDate: p.birthDate })),
      },
    };
  },
};

const contractsExpiringSoon: AionIntent = {
  id: 'contracts-expiring',
  match: (q) => includesAny(q, ['contrato']) && includesAny(q, ['vence', 'vencendo', 'vencimento', '30 dias']),
  run: (_q, ctx) => {
    const now = new Date();
    const expiring = ctx.contracts.filter((c) => {
      if (c.tipo !== 'locacao' || !c.endDate) return false;
      const diff = daysBetween(now, new Date(c.endDate));
      return diff >= 0 && diff <= 30;
    });
    if (expiring.length === 0) return { text: 'Nenhum contrato de locação vence nos próximos 30 dias.' };
    return {
      text: `${expiring.length} contrato(s) de locação vencem nos próximos 30 dias:`,
      table: {
        columns: [
          { key: 'id', header: 'Contrato', render: (r) => String(r.id) },
          { key: 'endDate', header: 'Vencimento', render: (r) => String(r.endDate) },
          { key: 'value', header: 'Valor', render: (r) => `R$ ${Number(r.value).toLocaleString('pt-BR')}` },
        ],
        rows: expiring.slice(0, 15).map((c) => ({ id: c.id, endDate: c.endDate, value: c.value })),
      },
    };
  },
};

const staleClientsIntent: AionIntent = {
  id: 'stale-clients',
  match: (q) => includesAny(q, ['cliente']) && includesAny(q, ['sem contato', '60 dias', 'contato ha']),
  run: (_q, ctx) => {
    const stale = staleClients(ctx.mockClients, 60);
    if (stale.length === 0) return { text: 'Todos os clientes tiveram contato nos últimos 60 dias.' };
    return {
      text: `${stale.length} cliente(s) sem contato há mais de 60 dias:`,
      table: {
        columns: [
          { key: 'name', header: 'Cliente', render: (r) => String(r.name) },
          { key: 'lastContactDate', header: 'Último contato', render: (r) => String(r.lastContactDate) },
        ],
        rows: stale.slice(0, 15).map((c) => ({ name: c.name, lastContactDate: c.lastContactDate })),
      },
    };
  },
};

const topPropertiesByVisits: AionIntent = {
  id: 'top-properties-by-visits',
  match: (q) => includesAny(q, ['imove']) && includesAny(q, ['visita']) && includesAny(q, ['mais', 'top', 'maior']),
  run: (_q, ctx) => {
    const counts = new Map<string, number>();
    [...ctx.visits, ...ctx.mockVisits].forEach((v) => counts.set(v.propertyId, (counts.get(v.propertyId) ?? 0) + 1));
    const ranked = [...ctx.mockProperties]
      .map((p) => ({ p, count: counts.get(p.id) ?? 0 }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    if (ranked.length === 0) return { text: 'Nenhuma visita registrada ainda este período.' };
    return {
      text: `Os imóveis com mais visitas agendadas são:`,
      table: {
        columns: [
          { key: 'code', header: 'Código', render: (r) => String(r.code) },
          { key: 'local', header: 'Local', render: (r) => String(r.local) },
          { key: 'visitas', header: 'Visitas', render: (r) => String(r.visitas) },
        ],
        rows: ranked.map(({ p, count }) => ({ code: p.code, local: `${p.bairro}, ${p.cidade}`, visitas: count })),
      },
    };
  },
};

const topBroker: AionIntent = {
  id: 'top-broker',
  match: (q) => includesAny(q, ['corretor']) && includesAny(q, ['vendeu mais', 'mais vendas', 'melhor corretor', 'top corretor']),
  run: (_q, ctx) => {
    const top = topBrokerBySales(ctx.brokers);
    if (!top) return { text: 'Ainda não há corretores cadastrados.' };
    return {
      text: `${top.name} é o corretor com mais vendas no período: ${top.salesCount} vendas, R$ ${top.commissionTotal.toLocaleString('pt-BR')} em comissão acumulada, avaliação ${top.rating.toFixed(1)}/5.`,
    };
  },
};

function parsePriceThreshold(q: string): number | null {
  const millionMatch = q.match(/(\d+(?:[.,]\d+)?)\s*milh/);
  if (millionMatch) return parseFloat(millionMatch[1].replace(',', '.')) * 1_000_000;
  const milMatch = q.match(/(\d+(?:[.,]\d+)?)\s*mil/);
  if (milMatch) return parseFloat(milMatch[1].replace(',', '.')) * 1_000;
  const rawMatch = q.match(/r\$\s*([\d.,]+)/);
  if (rawMatch) return parseFloat(rawMatch[1].replace(/\./g, '').replace(',', '.'));
  return null;
}

const propertyFilterIntent: AionIntent = {
  id: 'property-filter',
  match: (q) => includesAny(q, ['imove', 'imovel', 'casa', 'apartamento']) && (parsePriceThreshold(q) !== null || AMENITIES.some((a) => q.includes(a))),
  run: (q, ctx) => {
    const threshold = parsePriceThreshold(q);
    const amenity = AMENITIES.find((a) => q.includes(a));
    const cityMatch = ['sorocaba', 'blumenau', 'balneario camboriu', 'florianopolis', 'curitiba', 'sao paulo', 'campinas', 'ribeirao preto', 'santos', 'rio de janeiro', 'belo horizonte', 'porto alegre'].find(
      (c) => q.includes(c),
    );

    let results = ctx.mockProperties.filter((p) => p.status === 'Disponível');
    if (threshold !== null) {
      const above = includesAny(q, ['acima', 'maior', 'mais de']);
      results = results.filter((p) => (above ? p.price >= threshold : p.price <= threshold));
    }
    if (amenity) results = results.filter((p) => p.amenities.some((a) => normalize(a) === amenity));
    if (cityMatch) results = results.filter((p) => normalize(p.cidade) === cityMatch);

    results = results.slice(0, 15);
    if (results.length === 0) return { text: 'Não encontrei imóveis disponíveis com esses critérios.' };

    const filters = [
      threshold !== null ? `${includesAny(q, ['acima', 'maior', 'mais de']) ? 'acima de' : 'até'} R$ ${threshold.toLocaleString('pt-BR')}` : null,
      amenity ? `com ${amenity}` : null,
      cityMatch ? `em ${cityMatch}` : null,
    ].filter(Boolean);

    return {
      text: `Encontrei ${results.length} imóve(l/is) ${filters.join(', ')}:`,
      table: {
        columns: [
          { key: 'code', header: 'Código', render: (r) => String(r.code) },
          { key: 'tipo', header: 'Tipo', render: (r) => String(r.tipo) },
          { key: 'local', header: 'Local', render: (r) => String(r.local) },
          { key: 'preco', header: 'Preço', render: (r) => `R$ ${Number(r.preco).toLocaleString('pt-BR')}` },
        ],
        rows: results.map((p) => ({ code: p.code, tipo: p.type, local: `${p.bairro}, ${p.cidade}`, preco: p.price })),
      },
    };
  },
};

function parseScheduleDate(q: string): string | null {
  const today = new Date();
  if (q.includes('amanha')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }
  if (q.includes('hoje')) return today.toISOString().slice(0, 10);
  return null;
}

function parseTime(q: string): string | null {
  const match = q.match(/(\d{1,2})h(?:(\d{2}))?|(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hour = match[1] ?? match[3];
  const minute = match[2] ?? match[4] ?? '00';
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

const scheduleVisitIntent: AionIntent = {
  id: 'schedule-visit',
  match: (q) => includesAny(q, ['agend']) && includesAny(q, ['visita']),
  run: (q, ctx) => {
    const date = parseScheduleDate(q);
    const time = parseTime(q);
    if (!date || !time || ctx.clients.length === 0 || ctx.properties.length === 0) {
      return {
        text:
          'Para agendar preciso de mais detalhes: data (hoje/amanhã), horário (ex: 15h) e um cliente/imóvel cadastrados na base real. Tente novamente informando esses dados, ou use a tela de Visitas.',
      };
    }
    const client = ctx.clients[0];
    const property = ctx.properties[0];
    return {
      text: `Posso agendar uma visita de ${client.name} ao imóvel ${property.code} em ${date} às ${time}. Confirma?`,
      actions: [
        {
          label: 'Confirmar agendamento',
          run: async () => {
            await ctx.saveVisit({ date, time, clientId: client.id, propertyId: property.id, notes: 'Agendado via Aion' });
          },
        },
      ],
    };
  },
};

function buildDocumentText(kind: 'proposta' | 'contrato de locação' | 'contrato de venda', ctx: AionContext): string {
  const property = ctx.mockProperties[0];
  const client = ctx.mockClients[0];
  const broker = ctx.brokers[0];
  const lines = [
    `${kind.toUpperCase()} — PRÉVIA GERADA PELO AION`,
    '',
    `Imóvel: ${property.code} · ${property.type} · ${property.bairro}, ${property.cidade}`,
    `Valor de referência: R$ ${property.price.toLocaleString('pt-BR')}`,
    `Cliente: ${client.name}`,
    `Corretor responsável: ${broker.name}`,
    '',
    'Este é um documento de demonstração gerado automaticamente e não possui valor jurídico.',
  ];
  return lines.join('\n');
}

const generateDocumentIntent: AionIntent = {
  id: 'generate-document',
  match: (q) => includesAny(q, ['gere', 'gerar', 'crie', 'criar']) && includesAny(q, ['proposta', 'contrato']),
  run: (q, ctx): AionResponse => {
    const kind = q.includes('locacao') || q.includes('locação') || q.includes('aluguel') ? 'contrato de locação' : q.includes('contrato') ? 'contrato de venda' : 'proposta';
    if (ctx.mockProperties.length === 0 || ctx.mockClients.length === 0) {
      return { text: 'Não há dados suficientes para gerar um documento de exemplo.' };
    }
    const text = buildDocumentText(kind as 'proposta' | 'contrato de locação' | 'contrato de venda', ctx);
    return {
      text: `Prévia de ${kind} gerada (documento fictício, sem valor jurídico):\n\n${text}`,
    };
  },
};

export const AION_INTENTS: AionIntent[] = [
  birthdaysToday,
  contractsExpiringSoon,
  staleClientsIntent,
  topPropertiesByVisits,
  topBroker,
  scheduleVisitIntent,
  generateDocumentIntent,
  propertyFilterIntent,
];

export { normalize };
