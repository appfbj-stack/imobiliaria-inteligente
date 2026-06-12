import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Property, Client, Visit } from "./src/types";

dotenv.config();

// Initialize Gemini SDK with telemetry header
const ai = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

const DB_PATH = path.join(process.cwd(), "database.json");

// Safe helper to write / read database
function loadDatabase() {
  const defaultDb = {
    properties: [
      {
        id: "prop-1",
        code: "IMOB-101",
        type: "casa",
        address: "Rua XV de Novembro, 1420",
        bairro: "Centro",
        cidade: "Blumenau",
        price: 420000,
        builtArea: 150,
        landArea: 300,
        bedrooms: 3,
        bathrooms: 2,
        garage: 2,
        description: "Bela casa térrea no centro da cidade, com amplo terreno nos fundos, área de festas com churrasqueira e acabamento em gesso. Pronta para morar!",
        images: [
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
        ],
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        status: "Disponível"
      },
      {
        id: "prop-2",
        code: "IMOB-102",
        type: "apartamento",
        address: "Avenida Atlântica, 450",
        bairro: "Barra Sul",
        cidade: "Balneário Camboriú",
        price: 980000,
        builtArea: 110,
        landArea: 110,
        bedrooms: 2,
        bathrooms: 2,
        garage: 1,
        description: "Apartamento de frente para o mar, mobiliado e decorado. Possui suíte mais 1 dormitório, sacada integrada com churrasqueira a carvão e vista espetacular de toda a praia.",
        images: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
        ],
        videoUrl: "",
        status: "Disponível"
      },
      {
        id: "prop-3",
        code: "IMOB-103",
        type: "chácara",
        address: "Estrada Geral do Progresso, Km 12",
        bairro: "Vila Itoupava",
        cidade: "Blumenau",
        price: 350000,
        builtArea: 90,
        landArea: 5000,
        bedrooms: 2,
        bathrooms: 1,
        garage: 3,
        description: "Excelente chácara para quem busca silêncio, sossego e contato com a natureza. Riacho passando nos fundos, pomar com árvores frutíferas e casa rústica de madeira tratada.",
        images: [
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80"
        ],
        status: "Disponível"
      },
      {
        id: "prop-4",
        code: "IMOB-104",
        type: "apartamento",
        address: "Rua Almirante Lamego, 88",
        bairro: "Centro",
        cidade: "Florianópolis",
        price: 650000,
        builtArea: 85,
        landArea: 85,
        bedrooms: 3,
        bathrooms: 2,
        garage: 2,
        description: "Lindo apartamento andar alto com linda vista parcial da Ponte Hercílio Luz. Sacada com churrasqueira, condomínio estruturado com piscina, academia e portaria 24 horas.",
        images: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
        ],
        status: "Vendido"
      }
    ] as Property[],
    clients: [
      {
        id: "cli-1",
        name: "Carlos Alberto Mendes",
        phone: "(47) 99122-4433",
        whatsapp: "(47) 99122-4433",
        email: "carlos.mendes@email.com",
        cpf: "123.456.789-00",
        address: "Rua Bahia, 45 - Blumenau/SC",
        interest: "compra",
        priceRangeMin: 300000,
        priceRangeMax: 500000,
        propertyTypeInterest: ["casa", "apartamento"],
        observations: "Busca casa ou apartamento em Blumenau de preferência no bairro Centro ou proximidades com pelo menos 3 quartos para acomodar a família (tem 2 filhos pequenos)."
      },
      {
        id: "cli-2",
        name: "Juliana Rocha Souza",
        phone: "(48) 98877-1122",
        whatsapp: "(48) 98877-1122",
        email: "juliana.souza@gmail.com",
        cpf: "987.654.321-11",
        address: "Av Beira Mar, 1000 - Florianópolis/SC",
        interest: "compra",
        priceRangeMin: 800000,
        priceRangeMax: 1200000,
        propertyTypeInterest: ["apartamento"],
        observations: "Busca imóvel alto padrão perto do mar ou com bela vista. Pode ser Balneário Camboriú ou Florianópolis."
      }
    ] as Client[],
    visits: [
      {
        id: "vis-1",
        date: "2026-06-15",
        time: "10:00",
        clientId: "cli-1",
        propertyId: "prop-1",
        notes: "Cliente deseja verificar a tubulação de água quente e insolação solar da churrasqueira na parte da tarde."
      },
      {
        id: "vis-2",
        date: "2026-06-18",
        time: "14:30",
        clientId: "cli-2",
        propertyId: "prop-2",
        notes: "Mostrar o condomínio completo, áreas comuns, garagem e acessar a praia pela saída exclusiva para banhistas."
      }
    ] as Visit[]
  };

  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf8");
      return defaultDb;
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error loading database, returning defaults:", err);
    return defaultDb;
  }
}

function saveDatabase(db: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save database:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set limits higher so brokers can upload base64 images directly to local storage inside our JSON database
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Load database
  let db = loadDatabase();

  // --- API ROUTING ---

  // 1. Properties CRUD
  app.get("/api/properties", (req, res) => {
    db = loadDatabase();
    res.json(db.properties);
  });

  app.post("/api/properties", (req, res) => {
    try {
      db = loadDatabase();
      const newProp: Property = {
        ...req.body,
        id: `prop-${Date.now()}`
      };
      // Simple code validation / fallback
      if (!newProp.code) {
        newProp.code = `IMOB-${Math.floor(100 + Math.random() * 900)}`;
      }
      db.properties.push(newProp);
      saveDatabase(db);
      res.status(201).json(newProp);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/properties/:id", (req, res) => {
    try {
      db = loadDatabase();
      const index = db.properties.findIndex((p: Property) => p.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: "Propriedade não encontrada" });
      }
      db.properties[index] = { ...db.properties[index], ...req.body };
      saveDatabase(db);
      res.json(db.properties[index]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/properties/:id", (req, res) => {
    db = loadDatabase();
    const index = db.properties.findIndex((p: Property) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Propriedade não encontrada" });
    }
    db.properties.splice(index, 1);
    // Also cleanup dependent visits
    db.visits = db.visits.filter((v: Visit) => v.propertyId !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 2. Clients CRUD
  app.get("/api/clients", (req, res) => {
    db = loadDatabase();
    res.json(db.clients);
  });

  app.post("/api/clients", (req, res) => {
    try {
      db = loadDatabase();
      const newClient: Client = {
        ...req.body,
        id: `cli-${Date.now()}`
      };
      db.clients.push(newClient);
      saveDatabase(db);
      res.status(201).json(newClient);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/clients/:id", (req, res) => {
    try {
      db = loadDatabase();
      const index = db.clients.findIndex((c: Client) => c.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }
      db.clients[index] = { ...db.clients[index], ...req.body };
      saveDatabase(db);
      res.json(db.clients[index]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/clients/:id", (req, res) => {
    db = loadDatabase();
    const index = db.clients.findIndex((c: Client) => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    db.clients.splice(index, 1);
    // Also cleanup dependent visits
    db.visits = db.visits.filter((v: Visit) => v.clientId !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 3. Visits CRUD
  app.get("/api/visits", (req, res) => {
    db = loadDatabase();
    res.json(db.visits);
  });

  app.post("/api/visits", (req, res) => {
    try {
      db = loadDatabase();
      const newVisit: Visit = {
        ...req.body,
        id: `vis-${Date.now()}`
      };
      db.visits.push(newVisit);
      saveDatabase(db);
      res.status(201).json(newVisit);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/visits/:id", (req, res) => {
    try {
      db = loadDatabase();
      const index = db.visits.findIndex((v: Visit) => v.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: "Visita não encontrada" });
      }
      db.visits[index] = { ...db.visits[index], ...req.body };
      saveDatabase(db);
      res.json(db.visits[index]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/visits/:id", (req, res) => {
    db = loadDatabase();
    const index = db.visits.findIndex((v: Visit) => v.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Visita não encontrada" });
    }
    db.visits.splice(index, 1);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 4. Admin Dashboard Metrics
  app.get("/api/dashboard", (req, res) => {
    db = loadDatabase();
    const metricsSubmit = {
      totalProperties: db.properties.length,
      totalSold: db.properties.filter((p: Property) => p.status === "Vendido").length,
      totalRented: db.properties.filter((p: Property) => p.status === "Alugado").length,
      totalClients: db.clients.length,
      totalVisits: db.visits.length,
    };
    res.json(metricsSubmit);
  });

  // 5. Intelligent Matchmaking Function (Auto Matching)
  // Calculates compatibility score based on interests, ranges, types of property, and city/bairro if matched.
  app.get("/api/clients/:id/matches", (req, res) => {
    db = loadDatabase();
    const client = db.clients.find((c: Client) => c.id === req.params.id);
    if (!client) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const matchesList = db.properties.map((prop: Property) => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Status availability
      if (prop.status !== "Disponível") {
        return { property: prop, score: 0, reasons: ["Imóvel indisponível (Vendido/Alugado)."] };
      }

      // 2. Interest Match (purchase vs. rent)
      const isClientBuying = client.interest === "compra" || client.interest === "ambos";
      const isClientRenting = client.interest === "aluguel" || client.interest === "ambos";
      
      // Let's assume properties are for sale if price is high, or rent if low or let brokers write in description,
      // For general purposes we match price range directly.
      reasons.push("Imóvel está Disponível para negociação.");
      score += 20;

      // 3. Price Range matching
      const priceVal = prop.price;
      if (priceVal >= client.priceRangeMin && priceVal <= client.priceRangeMax) {
        score += 40;
        reasons.push(`Preço de R$ ${priceVal.toLocaleString("pt-BR")} está perfeitamente na faixa desejada (R$ ${client.priceRangeMin.toLocaleString("pt-BR")} - R$ ${client.priceRangeMax.toLocaleString("pt-BR")}).`);
      } else if (priceVal < client.priceRangeMin) {
        score += 25;
        reasons.push(`Preço está abaixo do mínimo estipulado (ótima oportunidade econômica).`);
      } else {
        const excess = priceVal - client.priceRangeMax;
        const percentExcess = (excess / client.priceRangeMax) * 100;
        if (percentExcess <= 15) {
          score += 15;
          reasons.push(`Preço ultrapassa a faixa máxima por apenas ${percentExcess.toFixed(0)}%, negociável.`);
        } else {
          reasons.push(`Preço está muito acima das condições indicadas pelo cliente.`);
        }
      }

      // 4. Property Type match
      if (client.propertyTypeInterest && client.propertyTypeInterest.includes(prop.type)) {
        score += 25;
        reasons.push(`Tipo do imóvel (${prop.type}) é exatamente o que o cliente procura.`);
      } else {
        reasons.push(`Imóvel do tipo ${prop.type}, diferente de suas preferências principais.`);
      }

      // 5. Keyword match inside description/address (simple heuristics)
      const obsLower = client.observations.toLowerCase();
      const descLower = prop.description.toLowerCase();
      const cityLower = prop.cidade.toLowerCase();
      const neighborhoodLower = prop.bairro.toLowerCase();

      let hasLocationMatch = false;
      if (obsLower.includes(cityLower) || obsLower.includes(neighborhoodLower)) {
        score += 15;
        hasLocationMatch = true;
        reasons.push(`Localização (${prop.bairro}, ${prop.cidade}) coincide com as observações do cliente.`);
      }

      // 6. Bedrooms filter
      if (obsLower.includes("quartos") || obsLower.includes("quarto")) {
        const matchBed = obsLower.match(/(\d+)\s*quarto/);
        if (matchBed) {
          const reqBeds = parseInt(matchBed[1], 10);
          if (prop.bedrooms >= reqBeds) {
            score += 10;
            reasons.push(`Possui ${prop.bedrooms} quartos, atendendo o requisito de mínimo ${reqBeds} quartos.`);
          }
        }
      }

      // Cap at 100
      const finalScore = Math.min(score, 100);

      return {
        property: prop,
        score: finalScore,
        reasons: reasons.filter(Boolean)
      };
    });

    // Filter non-zero scores and sort descending
    const finalMatches = matchesList
      .filter((m) => m.score > 10)
      .sort((a, b) => b.score - a.score);

    res.json({
      client,
      matches: finalMatches
    });
  });

  // 6. Intelligent / AI Natural Language Query Search (/api/ai-search)
  app.post("/api/ai-search", async (req, res) => {
    const { searchQuery } = req.body;
    db = loadDatabase();

    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.json({
        query: "",
        matchedPropertyIds: db.properties.map((p: Property) => p.id),
        explanation: "Mostrando todos os imóveis."
      });
    }

    if (!ai) {
      // Offline fallback: Simple keyword search of code, bairro, cidade, type, bedrooms and descriptions
      console.log("No Gemini API key specified or SDK client null, running offline fallback parsing");
      const normalizedQuery = searchQuery.toLowerCase();
      
      const filtered = db.properties.filter((prop: Property) => {
        const textToSearch = `${prop.code} ${prop.type} ${prop.address} ${prop.bairro} ${prop.cidade} ${prop.description}`.toLowerCase();
        
        // Match numbers or ranges
        let match = true;
        
        // E.g. "até 350.000" or "até R$ 350.000" -> extract digits
        const priceKeywords = ["até", "ate", "max", "maximo", "máximo", "valor"];
        const priceMatcher = normalizedQuery.match(/(?:at\w+|max\w*|R\$)?\s*(\d+[\d\s\.]*)/i);
        if (priceMatcher && priceKeywords.some(kw => normalizedQuery.includes(kw))) {
          const cleanedPriceString = priceMatcher[1].replace(/[.\s]/g, "");
          const extractedPrice = parseInt(cleanedPriceString, 10);
          if (!isNaN(extractedPrice) && extractedPrice > 5000) {
            // Check if price matches
            if (prop.price > extractedPrice) {
              match = false;
            }
          }
        }

        // Bedrooms matcher, e.g. "3 quartos" or "3 quarto" or "com 3 q"
        const roomsMatcher = normalizedQuery.match(/(\d+)\s*(?:quarto|dormit\w+|qto|suite|suíte)/i);
        if (roomsMatcher) {
          const extractedRooms = parseInt(roomsMatcher[1], 10);
          if (!isNaN(extractedRooms)) {
            if (prop.bedrooms < extractedRooms) {
              match = false;
            }
          }
        }

        // Simple text filters
        if (!normalizedQuery.split(/\s+/).some(word => word.length > 2 && textToSearch.includes(word))) {
          if (normalizedQuery.split(/\s+/).filter(w => w.length > 2).length > 0) {
            match = false;
          }
        }

        return match;
      });

      return res.json({
        query: searchQuery,
        matchedPropertyIds: filtered.map((p: Property) => p.id),
        explanation: `Busca inteligente off-line. Encontrados ${filtered.length} imóveis que coincidem com sua frase (busca por termos, quartos e faixa de preço de R$).`
      });
    }

    try {
      // Format our available database properties catalog so Gemini can select them nicely
      const propertiesCatalogSummary = db.properties.map((p: Property) => ({
        id: p.id,
        code: p.code,
        type: p.type,
        bairro: p.bairro,
        cidade: p.cidade,
        price: p.price,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        garage: p.garage,
        builtArea: p.builtArea,
        landArea: p.landArea,
        status: p.status,
        description: p.description
      }));

      const prompt = `Você é o assistente inteligente da nossa imobiliária parceira.
Sua tarefa é analisar o catálogo de imóveis disponíveis e o pedido do usuário em português.
Selecione APENAS os IDs dos imóveis que são compatíveis com o pedido do cliente. Em seguida, dê uma explicação simples em português de até 3 frases sobre os resultados encontrados.

Catálogo de Imóveis:
${JSON.stringify(propertiesCatalogSummary, null, 2)}

Pedido do Corretor / Cliente:
"${searchQuery}"

Retorne o seu veredito em formato JSON estrito com a seguinte estrutura:
{
  "matchedPropertyIds": ["prop-1", "prop-2"],
  "explanation": "Explicação amigável em português explicando por que estes imóveis foram sugeridos e se correspondem à faixa de preço/características."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchedPropertyIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Lista com os IDs dos imóveis correspondentes"
              },
              explanation: {
                type: Type.STRING,
                description: "Uma explicação amigável do corretor inteligente sobre o resultado"
              }
            },
            required: ["matchedPropertyIds", "explanation"]
          }
        }
      });

      const parsedResponse = JSON.parse(response.text?.trim() || "{}");
      res.json({
        query: searchQuery,
        matchedPropertyIds: parsedResponse.matchedPropertyIds || [],
        explanation: parsedResponse.explanation || "Nenhum imóvel compatível pôde ser determinado."
      });

    } catch (err: any) {
      console.error("Gemini query search failed:", err);
      // Fail gracefully with offline filtering
      res.json({
        query: searchQuery,
        matchedPropertyIds: db.properties.map((p: Property) => p.id),
        explanation: "Houve um problema de conexão com a IA, mas listamos todos os nossos imóveis para você procurar manualmente."
      });
    }
  });

  // Vite development middleware vs Static fallback for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Imobiliária Inteligente] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
