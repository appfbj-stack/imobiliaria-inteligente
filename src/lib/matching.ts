import type { Client, MatchmakingResult, Property } from '../types';

/**
 * Client-side mirror of the scoring heuristic in server.ts's
 * GET /api/clients/:id/matches — reused (not called) so demo-only mock
 * clients can get the same "Compatibilidade IA" experience against the
 * combined real+mock property pool without adding a new API endpoint.
 */
export function scoreClientAgainstProperties(client: Client, properties: Property[]): MatchmakingResult {
  const matches = properties.map((prop) => {
    if (prop.status !== 'Disponível') {
      return { property: prop, score: 0, reasons: ['Imóvel indisponível (Vendido/Alugado).'] };
    }

    let score = 20;
    const reasons: string[] = ['Imóvel está Disponível para negociação.'];

    if (prop.price >= client.priceRangeMin && prop.price <= client.priceRangeMax) {
      score += 40;
      reasons.push(
        `Preço de R$ ${prop.price.toLocaleString('pt-BR')} está perfeitamente na faixa desejada (R$ ${client.priceRangeMin.toLocaleString('pt-BR')} - R$ ${client.priceRangeMax.toLocaleString('pt-BR')}).`,
      );
    } else if (prop.price < client.priceRangeMin) {
      score += 25;
      reasons.push('Preço está abaixo do mínimo estipulado (ótima oportunidade econômica).');
    } else {
      const percentExcess = ((prop.price - client.priceRangeMax) / client.priceRangeMax) * 100;
      if (percentExcess <= 15) {
        score += 15;
        reasons.push(`Preço ultrapassa a faixa máxima por apenas ${percentExcess.toFixed(0)}%, negociável.`);
      } else {
        reasons.push('Preço está muito acima das condições indicadas pelo cliente.');
      }
    }

    if (client.propertyTypeInterest?.includes(prop.type)) {
      score += 25;
      reasons.push(`Tipo do imóvel (${prop.type}) é exatamente o que o cliente procura.`);
    } else {
      reasons.push(`Imóvel do tipo ${prop.type}, diferente de suas preferências principais.`);
    }

    const obsLower = client.observations.toLowerCase();
    if (obsLower.includes(prop.cidade.toLowerCase()) || obsLower.includes(prop.bairro.toLowerCase())) {
      score += 15;
      reasons.push(`Localização (${prop.bairro}, ${prop.cidade}) coincide com as observações do cliente.`);
    }

    const bedMatch = obsLower.match(/(\d+)\s*quarto/);
    if (bedMatch) {
      const reqBeds = parseInt(bedMatch[1], 10);
      if (prop.bedrooms >= reqBeds) {
        score += 10;
        reasons.push(`Possui ${prop.bedrooms} quartos, atendendo o requisito de mínimo ${reqBeds} quartos.`);
      }
    }

    return { property: prop, score: Math.min(score, 100), reasons };
  });

  return {
    client,
    matches: matches.filter((m) => m.score > 10).sort((a, b) => b.score - a.score),
  };
}
