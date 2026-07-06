import type { Client, Property, Visit } from '../types';
import type { Broker, Contract, MockClient, MockProperty, MockVisit } from '../mocks/schema';

export interface InsightsInput {
  properties: Property[];
  mockProperties: MockProperty[];
  clients: Client[];
  mockClients: MockClient[];
  visits: Visit[];
  mockVisits: MockVisit[];
  contracts: Contract[];
  brokers: Broker[];
}

export type InsightTone = 'success' | 'warning' | 'danger' | 'info';

export interface Insight {
  id: string;
  title: string;
  description: string;
  tone: InsightTone;
  metric: string;
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

/**
 * Pure aggregation over real (API-backed) + mock (demo) data — no
 * generative AI involved. This is what Aion's dashboard cards read from,
 * and what the Aion chat's analytical intents reuse under the hood, so
 * both surfaces always agree with each other.
 */
export function computeOpportunityRadar(input: InsightsInput): Insight[] {
  const now = new Date();
  const insights: Insight[] = [];

  // 1. High-demand properties with very few scheduled visits.
  const visitCountByProperty = new Map<string, number>();
  [...input.visits, ...input.mockVisits].forEach((v) => {
    visitCountByProperty.set(v.propertyId, (visitCountByProperty.get(v.propertyId) ?? 0) + 1);
  });
  const highDemandLowVisits = input.mockProperties
    .filter((p) => p.status === 'Disponível' && p.favorites > 150 && (visitCountByProperty.get(p.id) ?? 0) < 2)
    .sort((a, b) => b.favorites - a.favorites);
  if (highDemandLowVisits.length > 0) {
    const top = highDemandLowVisits[0];
    insights.push({
      id: 'high-demand-low-visits',
      title: `${highDemandLowVisits.length} imóveis com alta procura e poucas visitas`,
      description: `${top.code} (${top.bairro}, ${top.cidade}) tem ${top.favorites} favoritos mas quase nenhuma visita agendada — vale destacar no catálogo ou sugerir aos clientes compatíveis.`,
      tone: 'info',
      metric: String(highDemandLowVisits.length),
    });
  }

  // 2. Clients recently in touch whose budget already matches available inventory.
  const readyClients = input.mockClients.filter((c) => {
    const daysSinceContact = daysBetween(new Date(c.lastContactDate), now);
    const hasMatch = input.mockProperties.some(
      (p) => p.status === 'Disponível' && p.price <= c.priceRangeMax && p.price >= c.priceRangeMin * 0.85,
    );
    return daysSinceContact <= 14 && hasMatch;
  });
  if (readyClients.length > 0) {
    insights.push({
      id: 'ready-clients',
      title: `${readyClients.length} clientes prontos para fechar negócio`,
      description: `Contato recente (últimos 14 dias) e já existem imóveis disponíveis dentro da faixa de preço desejada — priorize o follow-up.`,
      tone: 'success',
      metric: String(readyClients.length),
    });
  }

  // 3. Rental contracts expiring in the next 30 days.
  const expiringContracts = input.contracts.filter((c) => {
    if (c.tipo !== 'locacao' || !c.endDate) return false;
    const diff = daysBetween(now, new Date(c.endDate));
    return diff >= 0 && diff <= 30;
  });
  if (expiringContracts.length > 0) {
    insights.push({
      id: 'expiring-contracts',
      title: `${expiringContracts.length} contratos de locação vencem em 30 dias`,
      description: `Antecipe a renovação ou o distrato para evitar vacância — a lista completa está em Contratos.`,
      tone: 'warning',
      metric: String(expiringContracts.length),
    });
  }

  // 4. Properties sitting on the market for a long time.
  const staleProperties = input.mockProperties.filter((p) => p.status === 'Disponível' && daysBetween(new Date(p.createdAt), now) > 180);
  if (staleProperties.length > 0) {
    insights.push({
      id: 'stale-properties',
      title: `${staleProperties.length} imóveis parados há mais de 6 meses`,
      description: `Considere revisar preço, fotos ou estratégia de marketing para reaquecer o interesse.`,
      tone: 'danger',
      metric: String(staleProperties.length),
    });
  }

  // 5. Region (city) with the highest visit demand.
  const visitsByCity = new Map<string, number>();
  input.mockVisits.forEach((v) => {
    const prop = input.mockProperties.find((p) => p.id === v.propertyId);
    if (prop) visitsByCity.set(prop.cidade, (visitsByCity.get(prop.cidade) ?? 0) + 1);
  });
  const topCity = [...visitsByCity.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topCity) {
    insights.push({
      id: 'top-region',
      title: `${topCity[0]} é a região com maior demanda`,
      description: `${topCity[1]} visitas agendadas no período — considere concentrar captação e campanhas nessa região.`,
      tone: 'info',
      metric: topCity[0],
    });
  }

  // 6. Commission forecast from contracts still open/in negotiation.
  const pipelineCommission = input.contracts
    .filter((c) => c.status === 'negociacao' || c.status === 'renovacao')
    .reduce((sum, c) => sum + c.commission, 0);
  if (pipelineCommission > 0) {
    insights.push({
      id: 'commission-forecast',
      title: `${formatCurrency(pipelineCommission)} em comissões previstas`,
      description: `Soma das comissões de contratos ainda em negociação ou renovação — potencial de faturamento do próximo período.`,
      tone: 'success',
      metric: formatCurrency(pipelineCommission),
    });
  }

  return insights;
}

/** Clients with no registered contact in the last N days (default 60) — Aion + Radar reuse this. */
export function staleClients(clients: MockClient[], days = 60, reference = new Date()) {
  return clients.filter((c) => daysBetween(new Date(c.lastContactDate), reference) > days);
}

/** People (brokers/owners) with a birthday matching the reference date's month/day. */
export function birthdaysOn(people: { birthDate: string }[], reference = new Date()) {
  const month = String(reference.getMonth() + 1).padStart(2, '0');
  const day = String(reference.getDate()).padStart(2, '0');
  return people.filter((p) => p.birthDate.slice(5, 7) === month && p.birthDate.slice(8, 10) === day);
}

export function topBrokerBySales(brokers: Broker[]) {
  return [...brokers].sort((a, b) => b.salesCount - a.salesCount)[0];
}
