import type {
  Broker,
  CaptationLead,
  CityCoord,
  Contract,
  DocumentItem,
  FinanceEntry,
  MockClient,
  MockProperty,
  MockVisit,
  Proposal,
} from './schema';

import brokersData from './data/brokers.json';
import ownersData from './data/owners.json';
import propertiesData from './data/properties.json';
import clientsData from './data/clients.json';
import visitsData from './data/visits.json';
import contractsData from './data/contracts.json';
import proposalsData from './data/proposals.json';
import documentsData from './data/documents.json';
import leadsData from './data/leads.json';
import financeData from './data/finance.json';
import citiesData from './data/cities.json';

export const mockBrokers = brokersData as Broker[];
export const mockOwners = ownersData as import('./schema').Owner[];
export const mockProperties = propertiesData as MockProperty[];
export const mockClients = clientsData as MockClient[];
export const mockVisits = visitsData as MockVisit[];
export const mockContracts = contractsData as Contract[];
export const mockProposals = proposalsData as Proposal[];
export const mockDocuments = documentsData as DocumentItem[];
export const mockLeads = leadsData as CaptationLead[];
export const mockFinance = financeData as FinanceEntry[];
export const cities = citiesData as CityCoord[];

const brokerById = new Map(mockBrokers.map((b) => [b.id, b]));
const ownerById = new Map(mockOwners.map((o) => [o.id, o]));
const propertyById = new Map(mockProperties.map((p) => [p.id, p]));
const clientById = new Map(mockClients.map((c) => [c.id, c]));

export const getBroker = (id: string) => brokerById.get(id);
export const getOwner = (id: string) => ownerById.get(id);
export const getMockProperty = (id: string) => propertyById.get(id);
export const getMockClient = (id: string) => clientById.get(id);

/** Everyone whose birthday falls within the given month (1-12), used by Aniversariantes + Aion. */
export function peopleWithBirthdayInMonth(month: number) {
  const target = String(month).padStart(2, '0');
  return [
    ...mockBrokers.map((p) => ({ ...p, role: 'corretor' as const })),
    ...mockOwners.map((p) => ({ ...p, role: 'proprietario' as const })),
  ].filter((p) => p.birthDate.slice(5, 7) === target);
}

export function isSameDayThisYear(isoDate: string, reference: Date) {
  const [, month, day] = isoDate.split('-').map(Number);
  return month === reference.getMonth() + 1 && day === reference.getDate();
}
