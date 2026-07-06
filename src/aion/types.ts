import type { Client, Property, Visit } from '../types';
import type { Broker, Contract, MockClient, MockProperty, MockVisit, Owner } from '../mocks/schema';
import type { Column } from '../components/ui/Table';

export interface AionContext {
  properties: Property[];
  mockProperties: MockProperty[];
  clients: Client[];
  mockClients: MockClient[];
  visits: Visit[];
  mockVisits: MockVisit[];
  contracts: Contract[];
  brokers: Broker[];
  owners: Owner[];
  saveVisit: (visit: Partial<Visit>) => Promise<boolean>;
  aiSearch: (query: string) => Promise<{ matchedPropertyIds: string[]; explanation: string | null } | null>;
}

export interface AionTable<T = Record<string, string | number>> {
  columns: Column<T>[];
  rows: T[];
}

export interface AionAction {
  label: string;
  run: () => void | Promise<void>;
}

export interface AionResponse {
  text: string;
  table?: AionTable;
  actions?: AionAction[];
}

export interface AionIntent {
  id: string;
  match: (query: string) => boolean;
  run: (query: string, ctx: AionContext) => Promise<AionResponse> | AionResponse;
}
