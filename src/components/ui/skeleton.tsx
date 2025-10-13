import { cn } from '@/lib/utils';
import { Card } from './card';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

// Skeleton específico para card de paciente
const PatientCardSkeleton = () => (
  <Card className="p-4">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  </Card>
);

// Skeleton para lista de pacientes
const PatientListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid gap-4">
    {Array.from({ length: count }, (_, i) => (
      <PatientCardSkeleton key={i} />
    ))}
  </div>
);

// Skeleton para card de sessão
const SessionCardSkeleton = () => (
  <Card className="p-4">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-3 w-24" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  </Card>
);

// Skeleton para lista de sessões
const SessionListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="grid gap-4">
    {Array.from({ length: count }, (_, i) => (
      <SessionCardSkeleton key={i} />
    ))}
  </div>
);

// Skeleton para dashboard
const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    
    {/* Stats cards */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Card key={i} className="p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        </Card>
      ))}
    </div>
    
    {/* Main content */}
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-4">
        <Skeleton className="h-6 w-48 mb-4" />
        <PatientListSkeleton count={3} />
      </Card>
      
      <Card className="p-4">
        <Skeleton className="h-6 w-48 mb-4" />
        <SessionListSkeleton count={3} />
      </Card>
    </div>
  </div>
);

// Skeleton para formulário PBAT
const PBATFormSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full max-w-2xl" />
    </div>
    
    <div className="grid gap-6">
      {Array.from({ length: 8 }, (_, i) => (
        <Card key={i} className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex space-x-2">
              {Array.from({ length: 5 }, (_, j) => (
                <Skeleton key={j} className="h-8 w-8 rounded" />
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// Skeleton para canvas de rede
const NetworkCanvasSkeleton = () => (
  <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center">
    <div className="text-center space-y-2">
      <Skeleton className="h-8 w-8 rounded-full mx-auto" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
);

// Skeleton para tabela
const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }, (_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: columns }, (_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// Skeleton para gráficos
const ChartSkeleton = () => (
  <Card className="p-4">
    <Skeleton className="h-6 w-48 mb-4" />
    <div className="space-y-2">
      <div className="flex items-end space-x-2 h-32">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton 
            key={i} 
            className={`w-8 bg-muted`}
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
      <div className="flex space-x-2 mt-2">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  </Card>
);

export {
  Skeleton,
  PatientCardSkeleton,
  PatientListSkeleton,
  SessionCardSkeleton,
  SessionListSkeleton,
  DashboardSkeleton,
  PBATFormSkeleton,
  NetworkCanvasSkeleton,
  TableSkeleton,
  ChartSkeleton,
};
