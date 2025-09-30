# Guia de Gestão de Pacientes - Mind Lattice Pro

## Visão Geral

O sistema Mind Lattice Pro agora inclui funcionalidade completa de gestão de pacientes, permitindo que terapeutas cadastrem, visualizem, editem e gerenciem informações de seus pacientes de forma segura e eficiente.

## Funcionalidades Implementadas

### 1. Cadastro de Novos Pacientes

**Componente**: `PatientDialog`
**Localização**: `/src/components/PatientDialog.tsx`

#### Campos Disponíveis:
- **Nome Completo** (obrigatório)
- **Data de Nascimento**
- **Email**
- **Telefone**
- **Endereço**
- **Contato de Emergência**
- **Telefone de Emergência**
- **Observações**
- **Status** (Ativo/Inativo/Alta)

#### Como Usar:
1. Navegue até a página "Gestão de Pacientes"
2. Clique no botão "Novo Paciente"
3. Preencha os campos necessários
4. Clique em "Criar Paciente"

### 2. Visualização de Pacientes

**Componente**: `PatientCard`
**Localização**: `/src/components/PatientCard.tsx`

#### Informações Exibidas:
- Nome completo e idade (calculada automaticamente)
- Status (com cores diferenciadas)
- Informações de contato (email, telefone, endereço)
- Data de cadastro
- Ações rápidas para prontuário e rede de processos

### 3. Busca e Filtros

#### Funcionalidades de Busca:
- **Busca por texto**: Nome, email, telefone ou observações
- **Filtro por status**: Todos, Ativos, Inativos, Alta
- **Busca em tempo real**: Resultados atualizados conforme você digita

### 4. Dashboard de Estatísticas

#### Métricas Disponíveis:
- **Total de Pacientes**
- **Pacientes Ativos**
- **Pacientes Inativos** 
- **Pacientes com Alta**

### 5. Integração com Outras Funcionalidades

#### Navegação Rápida:
- **Prontuário**: Acesso direto aos registros do paciente
- **Rede de Processos**: Visualização da rede psicológica do paciente
- **Edição**: Modificação das informações (implementação futura)

## Estrutura Técnica

### Hook de Gestão (`usePatients`)
**Localização**: `/src/hooks/usePatients.ts`

#### Funcionalidades:
- `fetchPatients()`: Carrega lista de pacientes
- `deletePatient(id)`: Remove um paciente
- `updatePatient(id, updates)`: Atualiza informações
- `searchPatients(term)`: Busca por termo
- `getPatientsByStatus(status)`: Filtra por status
- `getPatientStats()`: Retorna estatísticas

### Segurança e Permissões

#### Row Level Security (RLS):
- Terapeutas só podem ver seus próprios pacientes
- Todas as operações são autenticadas
- Dados sensíveis protegidos por criptografia

#### Políticas de Banco de Dados:
```sql
-- Terapeutas podem ver apenas seus pacientes
CREATE POLICY "Therapists can view own patients"
  ON public.patients FOR SELECT
  USING (auth.uid() = therapist_id);

-- Terapeutas podem criar pacientes
CREATE POLICY "Therapists can create patients"
  ON public.patients FOR INSERT
  WITH CHECK (auth.uid() = therapist_id);
```

## Estados da Interface

### 1. Estado de Carregamento
- Skeleton loaders para melhor UX
- Indicadores visuais durante operações

### 2. Estado Vazio
- Mensagem de boas-vindas para novos usuários
- Call-to-action para adicionar primeiro paciente

### 3. Estado de Erro
- Tratamento de erros de conexão
- Botões de retry para operações falhas
- Mensagens de erro amigáveis

### 4. Estado de Busca Sem Resultados
- Mensagem explicativa quando não há resultados
- Opção para limpar filtros

## Próximas Funcionalidades

### Em Desenvolvimento:
1. **Edição de Pacientes**: Modal para editar informações existentes
2. **Histórico de Mudanças**: Log de alterações nas informações
3. **Exportação de Dados**: PDF e Excel com informações dos pacientes
4. **Backup e Sincronização**: Backup automático dos dados

### Planejadas:
1. **Upload de Documentos**: Anexar arquivos aos prontuários
2. **Notificações**: Lembretes de consultas e acompanhamentos
3. **Relatórios Avançados**: Analytics e insights sobre os pacientes
4. **Integração com Agenda**: Sincronização com calendários externos

## Fluxo de Dados

```
Usuário → PatientDialog → usePatients → Supabase → Database
                ↓
Interface atualizada ← usePatients ← Resposta do banco
```

## Validações Implementadas

### Frontend:
- Nome completo obrigatório
- Formato de email válido
- Campos de texto limitados
- Validação de datas

### Backend:
- RLS policies
- Constraints de banco de dados
- Validação de tipos de dados

## Troubleshooting

### Problemas Comuns:

1. **Pacientes não aparecem**
   - Verificar autenticação do usuário
   - Confirmar políticas RLS
   - Verificar logs do navegador

2. **Erro ao criar paciente**
   - Verificar campos obrigatórios
   - Confirmar conexão com banco
   - Verificar permissões do usuário

3. **Busca não funciona**
   - Limpar filtros
   - Verificar termo de busca
   - Atualizar página

### Logs Úteis:
```javascript
// Verificar estado do hook
console.log('Patients:', patients);
console.log('Loading:', loading);
console.log('Error:', error);

// Verificar autenticação
console.log('User:', user);
console.log('Session:', session);
```

## Considerações de Performance

- **Lazy Loading**: Pacientes carregados sob demanda
- **Debounce**: Busca com delay para evitar requests excessivos
- **Caching**: React Query para cache inteligente
- **Paginação**: Preparado para grandes volumes de dados

## Acessibilidade

- **Navegação por teclado**: Todos os controles acessíveis via teclado
- **Screen readers**: Labels apropriados em todos os campos
- **Contraste**: Cores que atendem WCAG 2.1
- **Focus management**: Foco gerenciado adequadamente em modals

---

*Este documento será atualizado conforme novas funcionalidades forem implementadas.*