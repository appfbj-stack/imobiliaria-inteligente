import { Moon, Bell, Users, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';

export function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-text-primary">Configurações</h2>
        <p className="text-xs text-text-secondary">Preferências da conta, equipe e integrações da Kairós.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar name="Ricardo Corretor" size="lg" />
          <div>
            <p className="font-bold text-text-primary">Ricardo Corretor</p>
            <p className="text-xs text-text-secondary">Administrador · Imobiliária Kairós</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-primary" />
            <CardTitle>Aparência</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon size={15} className="text-text-secondary" />
            <p className="text-xs text-text-primary">Dark mode</p>
          </div>
          <Badge tone="success">Ativo</Badge>
        </CardContent>
        <CardContent className="border-t border-border pt-4 text-xs text-text-secondary">
          Modo claro chega em uma próxima atualização — os componentes já usam os tokens de tema, então a troca será só
          uma nova paleta.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-primary" />
            <CardTitle>Notificações</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-text-secondary">
          <p>Novas propostas, contratos próximos do vencimento e aniversariantes do dia (em breve, configurável).</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-primary" />
            <CardTitle>Equipe</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-xs text-text-secondary">
          Gerencie corretores e permissões na seção <strong className="text-text-primary">Corretores</strong>.
        </CardContent>
      </Card>
    </div>
  );
}
