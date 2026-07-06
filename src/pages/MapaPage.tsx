import { useMemo, useState } from 'react';
import { useRealData } from '../state/RealDataContext';
import { useDemoData } from '../state/DemoDataProvider';
import { MapView, type MapMarker } from '../components/map/MapView';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { STATUS_COLORS } from '../components/charts/theme';

type Layer = 'imoveis' | 'corretores';

export function MapaPage() {
  const { properties } = useRealData();
  const { properties: mockProps, brokers } = useDemoData();
  const [layer, setLayer] = useState<Layer>('imoveis');

  const propertyMarkers: MapMarker[] = useMemo(
    () =>
      mockProps.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        cidade: p.cidade,
        label: `${p.code} · ${p.type} · ${p.bairro} (${p.cidade}) · R$ ${p.price.toLocaleString('pt-BR')}`,
        color: p.status === 'Disponível' ? STATUS_COLORS.success : p.status === 'Vendido' ? STATUS_COLORS.info : STATUS_COLORS.warning,
      })),
    [mockProps],
  );

  const brokerMarkers: MapMarker[] = useMemo(() => {
    const cityCenters = new Map<string, { lat: number; lng: number }>();
    mockProps.forEach((p) => {
      if (!cityCenters.has(p.cidade)) cityCenters.set(p.cidade, { lat: p.lat, lng: p.lng });
    });
    return brokers.map((b, i) => {
      const c = cityCenters.get(b.region) ?? { lat: -14.235, lng: -51.9253 };
      return {
        id: b.id,
        lat: c.lat + ((i % 5) - 2) * 0.02,
        lng: c.lng + ((i % 3) - 1) * 0.02,
        cidade: b.region,
        label: `${b.name} · ${b.region} · ${b.salesCount} vendas`,
        color: STATUS_COLORS.info,
      };
    });
  }, [brokers, mockProps]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-text-primary">Mapa</h2>
          <p className="text-xs text-text-secondary">
            {properties.length} imóveis reais + {mockProps.length} de demonstração distribuídos em {new Set(mockProps.map((p) => p.cidade)).size} cidades
          </p>
        </div>
        <Tabs
          value={layer}
          onChange={(v) => setLayer(v)}
          items={[
            { value: 'imoveis', label: 'Imóveis' },
            { value: 'corretores', label: 'Corretores' },
          ]}
        />
      </div>

      <Card className="p-2">
        <MapView markers={layer === 'imoveis' ? propertyMarkers : brokerMarkers} height={560} />
      </Card>
    </div>
  );
}
