import type { Client, Property, Visit } from '../types';

/**
 * Types for the demo-only domains that have no backing API/database
 * today. Kept out of src/types.ts on purpose: these never round-trip
 * through server.ts, so mixing them with the real contracts would be
 * misleading. Everything here is generated once by
 * scripts/generate-mocks.ts (seeded, deterministic) into
 * src/mocks/data/*.json and treated as read-only-ish demo data —
 * DemoDataProvider allows local edits that never leave the browser.
 */

export interface MockProperty extends Property {
  __source: 'mock';
  lat: number;
  lng: number;
  amenities: string[];
  views: number;
  favorites: number;
  brokerId: string;
  ownerId: string;
  createdAt: string;
}

export interface MockClient extends Client {
  __source: 'mock';
  lastContactDate: string;
  brokerId: string;
}

export type VisitStatus = 'Confirmada' | 'Cancelada' | 'Realizada';

export interface MockVisit extends Visit {
  __source: 'mock';
  status: VisitStatus;
}

export interface Broker {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  phone: string;
  birthDate: string;
  hiredAt: string;
  region: string;
  salesCount: number;
  rentalsCount: number;
  commissionTotal: number;
  rating: number;
  goalProgress: number;
}

export interface Owner {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  propertyIds: string[];
  monthlyRevenue: number;
}

export type ContractType = 'venda' | 'locacao';
export type ContractStatus = 'negociacao' | 'assinado' | 'ativo' | 'renovacao' | 'encerrado' | 'distrato';

export interface Contract {
  id: string;
  tipo: ContractType;
  status: ContractStatus;
  propertyId: string;
  clientId: string;
  brokerId: string;
  ownerId: string;
  value: number;
  commission: number;
  signedAt: string | null;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export type ProposalStatus = 'pendente' | 'aceita' | 'recusada' | 'negociacao';

export interface Proposal {
  id: string;
  propertyId: string;
  clientId: string;
  brokerId: string;
  value: number;
  status: ProposalStatus;
  createdAt: string;
  notes: string;
}

export type DocumentCategory = 'contrato' | 'proposta' | 'imovel' | 'cliente' | 'financeiro';

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  relatedId: string;
  fileType: 'pdf' | 'docx' | 'jpg';
  uploadedAt: string;
  size: string;
}

export type LeadStage = 'novo' | 'contato' | 'visita_agendada' | 'avaliacao' | 'captado' | 'perdido';

export interface CaptationLead {
  id: string;
  ownerName: string;
  phone: string;
  propertyType: Property['type'];
  cidade: string;
  bairro: string;
  estimatedValue: number;
  stage: LeadStage;
  brokerId: string;
  createdAt: string;
}

export type FinanceEntryType = 'entrada' | 'saida';

export interface FinanceEntry {
  id: string;
  type: FinanceEntryType;
  category: string;
  description: string;
  value: number;
  date: string;
  relatedContractId?: string;
}

export interface CityCoord {
  cidade: string;
  uf: string;
  lat: number;
  lng: number;
}
