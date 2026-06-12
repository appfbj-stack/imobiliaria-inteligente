export interface Property {
  id: string;
  code: string;
  type: 'casa' | 'apartamento' | 'terreno' | 'chácara';
  address: string;
  bairro: string;
  cidade: string;
  price: number;
  builtArea: number; // in m²
  landArea: number;  // in m²
  bedrooms: number;
  bathrooms: number;
  garage: number;    // number of spots
  description: string;
  images: string[];  // URLs or base64
  videoUrl?: string; // Optional direct video URL
  status: 'Disponível' | 'Vendido' | 'Alugado';
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  cpf: string;
  address: string;
  interest: 'compra' | 'aluguel' | 'ambos';
  priceRangeMin: number;
  priceRangeMax: number;
  propertyTypeInterest: ('casa' | 'apartamento' | 'terreno' | 'chácara')[];
  observations: string;
}

export interface Visit {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  clientId: string;
  propertyId: string;
  notes: string;
}

export interface DashboardStats {
  totalProperties: number;
  totalSold: number;
  totalRented: number;
  totalClients: number;
  totalVisits: number;
}

export interface AISearchResult {
  query: string;
  matchedPropertyIds: string[];
  explanation: string;
}

export interface MatchmakingResult {
  client: Client;
  matches: {
    property: Property;
    score: number; // percentage 0-100
    reasons: string[];
  }[];
}
