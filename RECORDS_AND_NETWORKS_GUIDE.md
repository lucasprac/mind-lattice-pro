# Guia de Registros de Consultas e Redes de Processos - Mind Lattice Pro

## Visão Geral

O sistema Mind Lattice Pro agora inclui funcionalidades completas para:
1. **Registro de Consultas**: Documentação detalhada das sessões com sistema de palavras-chave
2. **Criação de Redes**: Editor visual interativo para mapear processos psicológicos baseado no modelo EEMM

## 1. Sistema de Registro de Consultas

### Funcionalidades Implementadas

#### ✅ **RecordDialog Component**
- **Localização**: `/src/components/RecordDialog.tsx`
- **Função**: Modal para registro de novas consultas

**Campos Disponíveis:**
- **Paciente** (obrigatório): Seleção de pacientes ativos
- **Número da Sessão**: Controle sequencial das consultas
- **Descrição da Consulta** (obrigatória): Área de texto expansiva para documentação detalhada
- **Palavras-chave**: Sistema avançado com sugestões baseadas na PBT
- **Observações Adicionais**: Campo opcional para notas complementares

#### ✅ **Sistema de Palavras-chave Inteligente**

**Palavras-chave Pré-definidas (baseadas na PBT):**
- **Dimensões EEMM**: Cognição, Emoção, Self, Motivação, Comportamento Explícito
- **Processos Clínicos**: Ansiedade, Depressão, Evitação, Fusão Cognitiva, Regulação Emocional
- **Características de Self**: Autoestima, Valores, Aceitação, Mindfulness, Relacionamentos
- **Habilidades**: Assertividade, Autoeficácia, Resiliência, Autocompaixão, Flexibilidade Psicológica
- **Padrões Cognitivos**: Ruminação, Catastrofização, Pensamento Dicotômico, Perfeccionismo
- **Abordagens**: Experiencial, Contextual, Funcional, Processo, Mudança
- **Estados Emocionais**: Trauma, Luto, Raiva, Medo, Culpa, Vergonha, Esperança

**Funcionalidades:**
- ✅ Clique rápido para adicionar palavras-chave sugeridas
- ✅ Adição de palavras-chave personalizadas
- ✅ Remoção individual de palavras-chave selecionadas
- ✅ Exibição visual com badges coloridos

#### ✅ **Página de Registros Atualizada**
- **Localização**: `/src/pages/Records.tsx`

**Recursos:**
- Dashboard com estatísticas de registros
- Busca avançada por conteúdo, palavras-chave ou paciente
- Filtros por paciente e palavra-chave
- Análise de frequência de palavras-chave
- Cards visuais para cada registro
- Estados de loading, erro e vazio

#### ✅ **Hook useRecords**
- **Localização**: `/src/hooks/useRecords.ts`

**Funções Disponíveis:**
- `fetchRecords()`: Carrega registros do banco
- `deleteRecord(id)`: Remove registro
- `updateRecord(id, updates)`: Atualiza registro
- `searchRecords(term)`: Busca por termo
- `getRecordsByKeyword(keyword)`: Filtra por palavra-chave
- `getRecordsByPatient(patientId)`: Filtra por paciente
- `getAllKeywords()`: Lista todas as palavras-chave utilizadas
- `getKeywordFrequency()`: Análise de frequência
- `getRecordStats()`: Estatísticas gerais

## 2. Sistema de Redes de Processos (EEMM)

### Modelo Meta-evolutivo Estendido (EEMM)

O sistema implementa o framework EEMM conforme especificado:

#### **5 Dimensões:**
1. **Cognição** (Azul)
   - Processos de pensamento, crenças e percepções
   
2. **Emoção** (Vermelho)
   - Estados emocionais e regulação afetiva
   
3. **Self** (Verde)
   - Identidade, autoconceito e autoestima
   
4. **Motivação** (Amarelo)
   - Valores, objetivos e direcionamento comportamental
   
5. **Comportamento Explícito** (Roxo)
   - Ações observáveis e padrões comportamentais

#### **3 Níveis:**
1. **Biologia/Fisiologia**
   - Processos biológicos, genéticos e fisiológicos
   
2. **Psicologia**
   - Processos psicológicos individuais
   
3. **Relacionamentos Sociais/Cultura**
   - Contexto social, cultural e interpessoal

### Funcionalidades Implementadas

#### ✅ **NetworkCanvas Component**
- **Localização**: `/src/components/NetworkCanvas.tsx`
- **Função**: Editor visual interativo estilo Miro

**Recursos do Editor:**
- ✅ **Interface Drag-and-Drop**: Arrastar e posicionar processos livremente
- ✅ **Sistema de Conexões**: Criar ligações entre processos com diferentes tipos
- ✅ **Zoom e Pan**: Navegação fluida no canvas
- ✅ **Grid de Apoio**: Grade visual para alinhamento
- ✅ **Histórico (Undo/Redo)**: Controle de versões das modificações
- ✅ **Cores por Dimensão**: Codificação visual automática
- ✅ **Intensidade e Frequência**: Sliders para cada processo (1-5)
- ✅ **Estatísticas em Tempo Real**: Métricas da rede atual

**Tipos de Processo:**
- Cada processo possui:
  - Texto descritivo
  - Dimensão (com cor específica)
  - Nível do EEMM
  - Intensidade (1-5)
  - Frequência (1-5)

**Tipos de Conexão:**
- Causal: Relação de causa e efeito
- Funcional: Relação de função/propósito
- Bidirecional: Influência mútua

#### ✅ **NetworkDialog Component**
- **Localização**: `/src/components/NetworkDialog.tsx`
- **Função**: Processo de criação de redes em 2 etapas

**Etapa 1 - Informações Básicas:**
- Seleção de paciente
- Nome da rede
- Descrição opcional
- Controle de versão

**Etapa 2 - Editor Visual:**
- Interface completa do NetworkCanvas
- Salvamento integrado
- Validação de conteúdo

#### ✅ **Hook useNetworks**
- **Localização**: `/src/hooks/useNetworks.ts`

**Funções Avançadas:**
- `fetchNetworks()`: Carrega redes com dados do paciente
- `deleteNetwork(id)`: Remove rede
- `updateNetwork(id, updates)`: Atualiza rede
- `duplicateNetwork(network, name)`: Cria cópia da rede
- `searchNetworks(term)`: Busca por termo
- `getNetworksByPatient(patientId)`: Filtra por paciente
- `getNetworkStats()`: Estatísticas globais
- `getComplexityAnalysis()`: Análise de complexidade
- `exportNetwork(network)`: Exporta rede em JSON

#### ✅ **NetworkCard Component**
- **Localização**: `/src/components/NetworkCard.tsx`
- **Função**: Visualização de redes em cards

**Informações Exibidas:**
- Nome da rede e versão
- Paciente (quando aplicável)
- Nível de complexidade (Simples/Médio/Complexo)
- Número de processos e conexões
- Intensidade e frequência médias
- Dimensões utilizadas
- Densidade da rede (% de conexões possíveis)
- Datas de criação e atualização

**Ações Disponíveis:**
- Visualizar (modo somente leitura)
- Editar (modo completo)
- Duplicar
- Exportar (JSON)
- Excluir

#### ✅ **Página Networks Completa**
- **Localização**: `/src/pages/Networks.tsx`

**Recursos:**
- Dashboard com estatísticas avançadas
- Análise de complexidade das redes
- Busca e filtros por paciente
- Visualização em modal (somente leitura)
- Edição em modal (modo completo)
- Grid responsivo de redes
- Informações sobre o modelo EEMM

## 3. Integração Entre Sistemas

### Fluxo de Trabalho Integrado

1. **Cadastro de Paciente**
   - Usar PatientDialog para criar novo paciente
   
2. **Registro de Consultas**
   - Documentar sessões com RecordDialog
   - Utilizar palavras-chave baseadas na PBT
   - Analisar padrões via dashboard
   
3. **Criação de Redes**
   - Usar insights dos registros para mapear processos
   - Criar rede visual com NetworkCanvas
   - Analisar complexidade e densidade
   
4. **Análise e Acompanhamento**
   - Comparar versões de redes ao longo do tempo
   - Exportar dados para análises externas
   - Utilizar estatísticas para insights clínicos

### Navegação Contextual

- Cards de pacientes possuem links diretos para:
  - Registros do paciente
  - Redes do paciente
  
- Páginas aceitam parâmetros de estado para:
  - Pré-selecionar paciente em diálogos
  - Filtrar conteúdo por contexto

## 4. Características Técnicas

### Arquitetura dos Dados

#### Registros (Records)
```typescript
interface Record {
  id: string;
  patient_id: string;
  therapist_id: string;
  session_date: string;
  session_number?: number;
  description: string;        // Área de texto principal
  keywords: string[];         // Array de palavras-chave
  observations?: string;
  created_at: string;
  updated_at: string;
}
```

#### Redes (Networks)
```typescript
interface Network {
  id: string;
  patient_id: string;
  therapist_id: string;
  name: string;
  description?: string;
  network_data: {
    nodes: ProcessNode[];       // Processos do EEMM
    connections: Connection[];  // Conexões entre processos
    metadata: {
      created_at: string;
      total_nodes: number;
      total_connections: number;
      dimensions_used: string[];
      levels_used: string[];
    };
  };
  version: number;
  created_at: string;
  updated_at: string;
}
```

#### Processo (ProcessNode)
```typescript
interface ProcessNode {
  id: string;
  x: number;                  // Posição X no canvas
  y: number;                  // Posição Y no canvas
  width: number;
  height: number;
  text: string;               // Descrição do processo
  dimension: string;          // Uma das 5 dimensões EEMM
  level: string;              // Um dos 3 níveis EEMM
  intensity: number;          // 1-5
  frequency: number;          // 1-5
}
```

### Segurança e Performance

- **RLS (Row Level Security)** ativo em todas as tabelas
- **Validação client-side** antes do envio
- **Otimização de queries** com joins inteligentes
- **Cache local** com React Query
- **Estados de loading** para melhor UX
- **Tratamento de erros** robusto

### Estados da Interface

#### Registros
- ✅ Loading com skeleton cards
- ✅ Estado vazio com call-to-action
- ✅ Busca sem resultados
- ✅ Erro com retry
- ✅ Dashboard com estatísticas

#### Redes
- ✅ Loading com skeleton cards
- ✅ Estado vazio com informações sobre EEMM
- ✅ Busca sem resultados
- ✅ Erro com retry
- ✅ Dashboard com análise de complexidade
- ✅ Modais de visualização e edição

## 5. Guia de Uso

### Para Terapeutas

#### Registrando uma Consulta
1. Acesse "Prontuários" no menu lateral
2. Clique em "Nova Consulta"
3. Selecione o paciente
4. Documente detalhadamente a sessão
5. Adicione palavras-chave relevantes
6. Inclua observações se necessário
7. Salve o registro

#### Criando uma Rede de Processos
1. Acesse "Redes de Processos" no menu lateral
2. Clique em "Nova Rede"
3. Configure informações básicas da rede
4. Use o editor visual para:
   - Adicionar processos nas dimensões apropriadas
   - Ajustar intensidade e frequência
   - Conectar processos relacionados
   - Organizar visualmente a rede
5. Salve a rede completa

#### Analisando Padrões
1. Use dashboards para identificar:
   - Palavras-chave mais frequentes
   - Padrões de complexidade nas redes
   - Evolução ao longo do tempo
2. Compare versões de redes
3. Exporte dados para análises externas

## 6. Próximas Funcionalidades

### Prioritárias
- [ ] **Visualização detalhada de registros**: Modal expansivo
- [ ] **Edição de registros**: Modificação de consultas existentes
- [ ] **Análise temporal**: Gráficos de evolução
- [ ] **Exportação de registros**: PDF e Word

### Avançadas
- [ ] **IA para sugestão de palavras-chave**: Baseada no conteúdo
- [ ] **Análise preditiva de redes**: Identificação de padrões
- [ ] **Comparação visual de redes**: Side-by-side
- [ ] **Geração automática de relatórios**: Insights baseados em dados
- [ ] **Integração com intervenções**: Ligação entre rede e plano de tratamento

---

**Sistema atualizado com sucesso!** ✅

O Mind Lattice Pro agora possui sistema completo de registro de consultas e criação de redes de processos, implementando fielmente o modelo EEMM com interface visual intuitiva e funcionalidades avançadas para terapeutas baseados em processos.