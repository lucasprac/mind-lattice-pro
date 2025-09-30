import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações do sistema
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Perfil do Terapeuta</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crp">CRP</Label>
              <Input id="crp" placeholder="00/00000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="seu@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="(00) 00000-0000" />
          </div>
        </div>
        <Button className="mt-6">Salvar Alterações</Button>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Preferências do Sistema</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações de Consultas</p>
              <p className="text-sm text-muted-foreground">Receba lembretes antes das consultas</p>
            </div>
            <Button variant="outline" size="sm">Ativar</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Backup Automático</p>
              <p className="text-sm text-muted-foreground">Backup diário dos dados</p>
            </div>
            <Button variant="outline" size="sm">Configurar</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
