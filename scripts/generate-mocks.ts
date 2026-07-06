/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { fakerPT_BR as faker } from '@faker-js/faker';

// Deterministic output: re-running this script always produces the same
// fixtures, so the generated JSON files can be reviewed/diffed like any
// other source file instead of behaving like opaque random blobs.
faker.seed(42);

const OUT_DIR = path.join(process.cwd(), 'src/mocks/data');
fs.mkdirSync(OUT_DIR, { recursive: true });

function pad(n: number, width = 4) {
  return String(n).padStart(width, '0');
}
function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function weightedPick<T>(items: { value: T; weight: number }[]): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let r = faker.number.float({ min: 0, max: total });
  for (const item of items) {
    if (r < item.weight) return item.value;
    r -= item.weight;
  }
  return items[items.length - 1].value;
}

interface City {
  cidade: string;
  uf: string;
  lat: number;
  lng: number;
  priceMultiplier: number;
}

const CITIES: City[] = [
  { cidade: 'Blumenau', uf: 'SC', lat: -26.9194, lng: -49.0661, priceMultiplier: 1.0 },
  { cidade: 'Balneário Camboriú', uf: 'SC', lat: -26.9926, lng: -48.6353, priceMultiplier: 1.6 },
  { cidade: 'Florianópolis', uf: 'SC', lat: -27.5954, lng: -48.548, priceMultiplier: 1.7 },
  { cidade: 'Curitiba', uf: 'PR', lat: -25.4284, lng: -49.2733, priceMultiplier: 1.2 },
  { cidade: 'São Paulo', uf: 'SP', lat: -23.5505, lng: -46.6333, priceMultiplier: 1.9 },
  { cidade: 'Campinas', uf: 'SP', lat: -22.9099, lng: -47.0626, priceMultiplier: 1.15 },
  { cidade: 'Sorocaba', uf: 'SP', lat: -23.5015, lng: -47.4526, priceMultiplier: 1.0 },
  { cidade: 'Ribeirão Preto', uf: 'SP', lat: -21.1775, lng: -47.8103, priceMultiplier: 1.05 },
  { cidade: 'Santos', uf: 'SP', lat: -23.9608, lng: -46.3336, priceMultiplier: 1.3 },
  { cidade: 'Rio de Janeiro', uf: 'RJ', lat: -22.9068, lng: -43.1729, priceMultiplier: 1.75 },
  { cidade: 'Belo Horizonte', uf: 'MG', lat: -19.9167, lng: -43.9345, priceMultiplier: 1.1 },
  { cidade: 'Porto Alegre', uf: 'RS', lat: -30.0346, lng: -51.2177, priceMultiplier: 1.1 },
];

const PROPERTY_TYPES = ['casa', 'apartamento', 'terreno', 'chácara'] as const;

// faker's pt_BR locale has no localized location.county() data (it falls
// back to English county names), so bairros are drawn from a curated list
// of common Brazilian neighborhood names instead.
const BAIRROS = [
  'Centro',
  'Jardim América',
  'Vila Nova',
  'Boa Vista',
  'Santa Mônica',
  'Jardim Europa',
  'Vila Madalena',
  'Bela Vista',
  'Cidade Jardim',
  'Jardim Botânico',
  'Vila Mariana',
  'Alto da Boa Vista',
  'Jardim das Flores',
  'Vila Isabel',
  'Parque das Nações',
  'Jardim Paulista',
  'Vila Olímpia',
  'Recreio',
  'Itaim Bibi',
  'Moema',
];
function randomBairro() {
  return faker.helpers.arrayElement(BAIRROS);
}
const AMENITY_POOL = [
  'piscina',
  'churrasqueira',
  'academia',
  'portaria 24h',
  'salão de festas',
  'vista para o mar',
  'quintal amplo',
  'ar-condicionado',
  'mobiliado',
  'energia solar',
];

function randomCity(): City {
  return faker.helpers.arrayElement(CITIES);
}

function jitter(base: number, spread: number) {
  return base + (faker.number.float({ min: -1, max: 1 }) * spread);
}

// --- Brokers & Owners (birthDate pool used by the Aniversariantes screen) ---
// July gets an extra weight so "this month" lands near ~120 out of ~750
// people on the 2026-07-06 reference date, without hardcoding a fixed list.
const MONTH_WEIGHTS = Array.from({ length: 12 }, (_, i) => ({ month: i, weight: i === 6 ? 2.1 : 1 }));

function randomBirthDate(minAge: number, maxAge: number) {
  const month = weightedPick(MONTH_WEIGHTS.map((m) => ({ value: m.month, weight: m.weight })));
  const day = faker.number.int({ min: 1, max: 28 });
  const age = faker.number.int({ min: minAge, max: maxAge });
  const year = new Date().getFullYear() - age;
  return isoDate(new Date(Date.UTC(year, month, day)));
}

const BROKER_COUNT = 150;
const OWNER_COUNT = 600;

const brokers = Array.from({ length: BROKER_COUNT }, (_, i) => {
  const id = `COR-${pad(i + 1)}`;
  const name = faker.person.fullName();
  const region = randomCity().cidade;
  return {
    id,
    name,
    avatarUrl: `https://i.pravatar.cc/150?u=${id}`,
    email: faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase(),
    phone: faker.phone.number({ style: 'national' }),
    birthDate: randomBirthDate(23, 62),
    hiredAt: isoDate(daysAgo(faker.number.int({ min: 30, max: 2500 }))),
    region,
    salesCount: faker.number.int({ min: 0, max: 40 }),
    rentalsCount: faker.number.int({ min: 0, max: 30 }),
    commissionTotal: faker.number.int({ min: 5000, max: 420000 }),
    rating: Number(faker.number.float({ min: 3.2, max: 5, fractionDigits: 1 })),
    goalProgress: faker.number.int({ min: 10, max: 130 }),
  };
});

const owners = Array.from({ length: OWNER_COUNT }, (_, i) => {
  const id = `PRO-${pad(i + 1)}`;
  const name = faker.person.fullName();
  return {
    id,
    name,
    avatarUrl: `https://i.pravatar.cc/150?u=${id}`,
    email: faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase(),
    phone: faker.phone.number({ style: 'national' }),
    cpf: faker.string.numeric(11),
    birthDate: randomBirthDate(28, 78),
    propertyIds: [] as string[],
    monthlyRevenue: 0,
  };
});

// --- Mock properties (overlay volume for the Imóveis screen) ---
const PROPERTY_COUNT = 800;
const mockProperties = Array.from({ length: PROPERTY_COUNT }, (_, i) => {
  const id = `MKT-IMV-${pad(i + 1)}`;
  const city = randomCity();
  const type = faker.helpers.arrayElement(PROPERTY_TYPES);
  const isLand = type === 'terreno';
  const bedrooms = isLand ? 0 : faker.number.int({ min: 1, max: 5 });
  const bathrooms = isLand ? 0 : Math.max(1, bedrooms - faker.number.int({ min: 0, max: 1 }));
  const garage = isLand ? 0 : faker.number.int({ min: 0, max: 4 });
  const builtArea = isLand ? 0 : faker.number.int({ min: 45, max: 420 });
  const landArea = type === 'chácara' ? faker.number.int({ min: 1000, max: 20000 }) : faker.number.int({ min: 120, max: 900 });
  const basePrice = isLand ? 90000 : builtArea * faker.number.int({ min: 2600, max: 6200 });
  const price = Math.round((basePrice * city.priceMultiplier) / 1000) * 1000;
  const owner = faker.helpers.arrayElement(owners);
  const broker = faker.helpers.arrayElement(brokers);
  const amenities = faker.helpers.arrayElements(AMENITY_POOL, { min: 1, max: 5 });
  const createdAt = isoDate(daysAgo(faker.number.int({ min: 1, max: 900 })));
  const status = weightedPick([
    { value: 'Disponível' as const, weight: 6 },
    { value: 'Vendido' as const, weight: 2 },
    { value: 'Alugado' as const, weight: 2 },
  ]);

  owner.propertyIds.push(id);

  return {
    id,
    __source: 'mock' as const,
    code: `KRS-${10000 + i}`,
    type,
    address: faker.location.streetAddress(),
    bairro: randomBairro(),
    cidade: city.cidade,
    price,
    builtArea,
    landArea,
    bedrooms,
    bathrooms,
    garage,
    description: faker.lorem.sentences({ min: 2, max: 3 }),
    images: Array.from({ length: faker.number.int({ min: 2, max: 4 }) }, (_, imgIdx) => `https://picsum.photos/seed/${id}-${imgIdx}/800/600`),
    videoUrl: undefined,
    status,
    lat: jitter(city.lat, 0.12),
    lng: jitter(city.lng, 0.12),
    amenities,
    views: faker.number.int({ min: 0, max: 4200 }),
    favorites: faker.number.int({ min: 0, max: 340 }),
    brokerId: broker.id,
    ownerId: owner.id,
    createdAt,
  };
});

owners.forEach((owner) => {
  owner.monthlyRevenue = owner.propertyIds.reduce((sum, propId) => {
    const prop = mockProperties.find((p) => p.id === propId);
    return sum + (prop && prop.status === 'Alugado' ? Math.round(prop.price * 0.005) : 0);
  }, 0);
});

// --- Mock clients (overlay volume for the Clientes screen) ---
const CLIENT_COUNT = 1500;
const mockClients = Array.from({ length: CLIENT_COUNT }, (_, i) => {
  const id = `MKT-CLI-${pad(i + 1)}`;
  const name = faker.person.fullName();
  const interest = faker.helpers.arrayElement(['compra', 'aluguel', 'ambos'] as const);
  const min = faker.number.int({ min: 15, max: 60 }) * 10000;
  const broker = faker.helpers.arrayElement(brokers);
  return {
    id,
    __source: 'mock' as const,
    name,
    phone: faker.phone.number({ style: 'national' }),
    whatsapp: faker.phone.number({ style: 'national' }),
    email: faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase(),
    cpf: faker.string.numeric(11),
    address: faker.location.streetAddress(),
    interest,
    priceRangeMin: min,
    priceRangeMax: min + faker.number.int({ min: 10, max: 80 }) * 10000,
    propertyTypeInterest: faker.helpers.arrayElements(PROPERTY_TYPES, { min: 1, max: 2 }),
    observations: faker.lorem.sentence(),
    lastContactDate: isoDate(daysAgo(faker.number.int({ min: 0, max: 260 }))),
    brokerId: broker.id,
  };
});

// --- Mock visits (overlay volume for the Visitas / Agenda screens) ---
const VISIT_COUNT = 1200;
const mockVisits = Array.from({ length: VISIT_COUNT }, (_, i) => {
  const id = `MKT-VIS-${pad(i + 1)}`;
  const offset = faker.number.int({ min: -60, max: 45 });
  const date = offset >= 0 ? daysFromNow(offset) : daysAgo(-offset);
  const status: 'Confirmada' | 'Cancelada' | 'Realizada' =
    offset < 0
      ? weightedPick([
          { value: 'Realizada' as const, weight: 7 },
          { value: 'Cancelada' as const, weight: 3 },
        ])
      : 'Confirmada';
  return {
    id,
    __source: 'mock' as const,
    date: isoDate(date),
    time: `${faker.number.int({ min: 8, max: 18 })}:${faker.helpers.arrayElement(['00', '30'])}`,
    clientId: faker.helpers.arrayElement(mockClients).id,
    propertyId: faker.helpers.arrayElement(mockProperties).id,
    notes: faker.datatype.boolean(0.4) ? faker.lorem.sentence() : '',
    status,
  };
});

// --- Contracts: unified venda/locação (500 + 250), ~450 formalized ---
const SALE_COUNT = 500;
const RENTAL_COUNT = 250;

function buildContract(index: number, tipo: 'venda' | 'locacao'): any {
  const id = `CTR-${pad(index)}`;
  const property = faker.helpers.arrayElement(mockProperties);
  const client = faker.helpers.arrayElement(mockClients);
  const createdAt = daysAgo(faker.number.int({ min: 5, max: 700 }));
  const commissionPct = tipo === 'venda' ? faker.number.float({ min: 0.04, max: 0.06 }) : 0.1;
  const value = tipo === 'venda' ? property.price : Math.round(property.price * 0.005);

  const status: import('../src/mocks/schema').ContractStatus =
    tipo === 'venda'
      ? weightedPick([
          { value: 'assinado' as const, weight: 300 },
          { value: 'negociacao' as const, weight: 150 },
          { value: 'distrato' as const, weight: 50 },
        ])
      : weightedPick([
          { value: 'ativo' as const, weight: 150 },
          { value: 'negociacao' as const, weight: 70 },
          { value: 'encerrado' as const, weight: 30 },
        ]);

  const signedAt = status === 'negociacao' ? null : isoDate(daysAgo(faker.number.int({ min: 0, max: 500 })));
  const startDate = isoDate(createdAt);
  const endDate = tipo === 'locacao' ? isoDate(daysFromNow(faker.number.int({ min: -60, max: 400 }))) : null;

  return {
    id,
    tipo,
    status,
    propertyId: property.id,
    clientId: client.id,
    brokerId: property.brokerId,
    ownerId: property.ownerId,
    value,
    commission: Math.round(value * commissionPct),
    signedAt,
    startDate,
    endDate,
    createdAt: isoDate(createdAt),
  };
}

const contracts = [
  ...Array.from({ length: SALE_COUNT }, (_, i) => buildContract(i + 1, 'venda')),
  ...Array.from({ length: RENTAL_COUNT }, (_, i) => buildContract(SALE_COUNT + i + 1, 'locacao')),
];

// --- Proposals ---
const PROPOSAL_COUNT = 300;
const proposals = Array.from({ length: PROPOSAL_COUNT }, (_, i) => {
  const property = faker.helpers.arrayElement(mockProperties);
  const client = faker.helpers.arrayElement(mockClients);
  return {
    id: `PRP-${pad(i + 1)}`,
    propertyId: property.id,
    clientId: client.id,
    brokerId: property.brokerId,
    value: Math.round(property.price * faker.number.float({ min: 0.85, max: 1.02 })),
    status: weightedPick([
      { value: 'pendente' as const, weight: 3 },
      { value: 'negociacao' as const, weight: 3 },
      { value: 'aceita' as const, weight: 2 },
      { value: 'recusada' as const, weight: 2 },
    ]),
    createdAt: isoDate(daysAgo(faker.number.int({ min: 0, max: 180 }))),
    notes: faker.lorem.sentence(),
  };
});

// --- Documents ---
const DOCUMENT_COUNT = 400;
const documents = Array.from({ length: DOCUMENT_COUNT }, (_, i) => {
  const category = faker.helpers.arrayElement(['contrato', 'proposta', 'imovel', 'cliente', 'financeiro'] as const);
  const relatedId =
    category === 'contrato'
      ? faker.helpers.arrayElement(contracts).id
      : category === 'proposta'
        ? faker.helpers.arrayElement(proposals).id
        : category === 'imovel'
          ? faker.helpers.arrayElement(mockProperties).id
          : category === 'cliente'
            ? faker.helpers.arrayElement(mockClients).id
            : `FIN-${pad(faker.number.int({ min: 1, max: 400 }))}`;
  const fileType = faker.helpers.arrayElement(['pdf', 'docx', 'jpg'] as const);
  return {
    id: `DOC-${pad(i + 1)}`,
    title: `${category.charAt(0).toUpperCase()}${category.slice(1)} · ${relatedId}`,
    category,
    relatedId,
    fileType,
    uploadedAt: isoDate(daysAgo(faker.number.int({ min: 0, max: 500 }))),
    size: `${faker.number.float({ min: 0.2, max: 8, fractionDigits: 1 })} MB`,
  };
});

// --- Captação leads ---
const LEAD_COUNT = 150;
const leads = Array.from({ length: LEAD_COUNT }, (_, i) => {
  const city = randomCity();
  const broker = faker.helpers.arrayElement(brokers);
  return {
    id: `LED-${pad(i + 1)}`,
    ownerName: faker.person.fullName(),
    phone: faker.phone.number({ style: 'national' }),
    propertyType: faker.helpers.arrayElement(PROPERTY_TYPES),
    cidade: city.cidade,
    bairro: randomBairro(),
    estimatedValue: faker.number.int({ min: 120000, max: 2500000 }),
    stage: faker.helpers.arrayElement(['novo', 'contato', 'visita_agendada', 'avaliacao', 'captado', 'perdido'] as const),
    brokerId: broker.id,
    createdAt: isoDate(daysAgo(faker.number.int({ min: 0, max: 120 }))),
  };
});

// --- Finance entries (last ~12 months, tied to contract commissions/rents) ---
const FINANCE_COUNT = 400;
const financeCategories = {
  entrada: ['Comissão de venda', 'Comissão de locação', 'Taxa de administração', 'Taxa de captação'],
  saida: ['Marketing', 'Folha de pagamento', 'Manutenção de imóveis', 'Despesas administrativas'],
};
// faker.finance.transactionDescription() isn't localized (English text +
// random foreign currency codes), so descriptions are built from
// Portuguese templates per category instead.
function financeDescription(category: string, relatedContract: (typeof contracts)[number] | null) {
  if (relatedContract) {
    return `${category} referente ao contrato ${relatedContract.id} (${relatedContract.tipo})`;
  }
  const company = faker.company.name();
  return `${category} · ${company}`;
}

const finance = Array.from({ length: FINANCE_COUNT }, (_, i) => {
  const type = faker.helpers.arrayElement(['entrada', 'saida'] as const);
  const relatedContract = type === 'entrada' && faker.datatype.boolean(0.6) ? faker.helpers.arrayElement(contracts) : null;
  const category = faker.helpers.arrayElement(financeCategories[type]);
  return {
    id: `FIN-${pad(i + 1)}`,
    type,
    category,
    description: financeDescription(category, relatedContract),
    value: relatedContract ? relatedContract.commission : faker.number.int({ min: 800, max: 45000 }),
    date: isoDate(daysAgo(faker.number.int({ min: 0, max: 365 }))),
    relatedContractId: relatedContract?.id,
  };
});

const files: Record<string, unknown> = {
  brokers,
  owners,
  properties: mockProperties,
  clients: mockClients,
  visits: mockVisits,
  contracts,
  proposals,
  documents,
  leads,
  finance,
  cities: CITIES,
};

for (const [name, data] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT_DIR, `${name}.json`), JSON.stringify(data, null, 2));
  console.log(`wrote ${name}.json (${Array.isArray(data) ? data.length : 0} records)`);
}

const julyBirthdays = [...brokers, ...owners].filter((p) => p.birthDate.slice(5, 7) === '07').length;
console.log(`\nPeople with a July birthday (calibration check): ${julyBirthdays} / ${brokers.length + owners.length}`);
console.log(`Formalized contracts (assinado + ativo): ${contracts.filter((c) => c.status === 'assinado' || c.status === 'ativo').length}`);
