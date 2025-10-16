import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Network, 
  Grid3x3, 
  FileText, 
  TrendingUp, 
  Calendar,
  Plus,
  Clock,
  Target,
  Activity,
  ArrowRight,
  CalendarDays,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useAppointments, type CreateAppointmentData, type RecurrenceType } from "@/hooks/useAppointments";
import { useEEMMProcesses } from "@/hooks/useEEMMProcesses";
import { useRoadmapProcesses } from "@/hooks/useRoadmapProcesses";
import { useNavigate } from "react-router-dom";
import { format, addDays, startOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { patients, getPatientStats } = usePatients();
  const { appointments, getAppointmentStats, createAppointment } = useAppointments();
  const { getProcessStats: getEEMMStats } = useEEMMProcesses();
  const { getProcessStats: getRoadmapStats } = useRoadmapProcesses();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [appointmentData, setAppointmentData] = useState<{
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    patient_id: string;
    recurrence_type: RecurrenceType;
    recurrence_count: number;
    custom_interval: number;
  }>({
    title: "",
    description: "",
    start_time: "09:00",
    end_time: "10:00",
    patient_id: "",
    recurrence_type: "none",
    recurrence_count: 1,
    custom_interval: 7
  });

  const patientStats = getPatientStats();
  const appointmentStats = getAppointmentStats();
  const eemmStats = getEEMMStats();
  const roadmapStats = getRoadmapStats();

  const stats = [
    { 
      label: "Pacientes Ativos", 
      value: patientStats.active.toString(), 
      icon: Users, 
      color: "text-primary",
      onClick: () => navigate("/patients")
    },
    { 
      label: "Processos EEMM", 
      value: eemmStats.total.toString(), 
      icon: Network, 
      color: "text-secondary",
      onClick: () => navigate("/eemm")
    },
    { 
      label: "Consultas este Mês", 
      value: appointmentStats.thisMonth.toString(), 
      icon: Calendar, 
      color: "text-success"
    },
    { 
      label: "Processos do Roadmap", 
      value: roadmapStats.total.toString(), 
      icon: TrendingUp, 
      color: "text-warning"
    },
  ];

  // Função para gerar dias do calendário
  const generateCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = addDays(start, 41); // 6 semanas
    return eachDayOfInterval({ start, end });
  };

  // Função para obter compromissos de um dia específico
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.start_datetime);
      return isSameDay(aptDate, date);
    });
  };

  const handleCreateAppointment = async () => {
    if (!appointmentData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    if (!selectedDate) {
      toast.error("Selecione uma data");
      return;
    }

    const [startHour, startMinute] = appointmentData.start_time.split(':').map(Number);
    const [endHour, endMinute] = appointmentData.end_time.split(':').map(Number);

    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    const createData: CreateAppointmentData = {
      title: appointmentData.title,
      description: appointmentData.description,
      start_datetime: startDateTime,
      end_datetime: endDateTime,
      patient_id: appointmentData.patient_id || undefined,
      appointment_type: "consultation",
      recurrence_type: appointmentData.recurrence_type,
      recurrence_count: appointmentData.recurrence_count,
      custom_interval: appointmentData.custom_interval
    };

    const success = await createAppointment(createData);
    if (success) {
      setShowNewAppointment(false);
      setAppointmentData({
        title: "",
        description: "",
        start_time: "09:00",
        end_time: "10:00",
        patient_id: "",
        recurrence_type: "none",
        recurrence_count: 1,
        custom_interval: 7
      });
      setSelectedDate(null);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(prev => subWeeks(prev, 4));
    } else {
      setCurrentDate(prev => addWeeks(prev, 4));
    }
  };

  const recentPatients = patients.slice(0, 5);
  const upcomingAppointments = appointments
    .filter(apt => {
      const aptDate = parseISO(apt.start_datetime);
      return aptDate > new Date() && apt.status === 'scheduled';
    })
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu sistema de Terapia Baseada em Processos
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card 
            key={stat.label} 
            className={`p-6 transition-all cursor-pointer hover:shadow-lg ${
              stat.onClick ? 'hover:scale-105' : ''
            }`}
            onClick={stat.onClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`h-12 w-12 ${stat.color} opacity-80`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Calendário</h2>
                <p className="text-sm text-muted-foreground">
                  {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Consulta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Agendar Nova Consulta</DialogTitle>
                    <DialogDescription>
                      {selectedDate && `Data: ${format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        placeholder="Ex: Consulta com João"
                        value={appointmentData.title}
                        onChange={(e) => setAppointmentData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="patient">Paciente</Label>
                      <Select value={appointmentData.patient_id} onValueChange={(value) => setAppointmentData(prev => ({ ...prev, patient_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar paciente (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_time">Horário Início</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={appointmentData.start_time}
                          onChange={(e) => setAppointmentData(prev => ({ ...prev, start_time: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_time">Horário Fim</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={appointmentData.end_time}
                          onChange={(e) => setAppointmentData(prev => ({ ...prev, end_time: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="recurrence">Repetição</Label>
                      <Select 
                        value={appointmentData.recurrence_type} 
                        onValueChange={(value) => setAppointmentData(prev => ({ ...prev, recurrence_type: value as RecurrenceType }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Não repetir</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="biweekly">Quinzenal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {appointmentData.recurrence_type !== 'none' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="count">Quantas vezes</Label>
                          <Input
                            id="count"
                            type="number"
                            min="1"
                            max="52"
                            value={appointmentData.recurrence_count}
                            onChange={(e) => setAppointmentData(prev => ({ ...prev, recurrence_count: parseInt(e.target.value) || 1 }))}
                          />
                        </div>
                        {appointmentData.recurrence_type === 'custom' && (
                          <div>
                            <Label htmlFor="interval">Intervalo (dias)</Label>
                            <Input
                              id="interval"
                              type="number"
                              min="1"
                              max="365"
                              value={appointmentData.custom_interval}
                              onChange={(e) => setAppointmentData(prev => ({ ...prev, custom_interval: parseInt(e.target.value) || 7 }))}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        placeholder="Observações sobre a consulta..."
                        value={appointmentData.description}
                        onChange={(e) => setAppointmentData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowNewAppointment(false)} 
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateAppointment} className="flex-1">
                        Agendar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Grade do Calendário */}
          <div className="grid grid-cols-7 gap-1">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {generateCalendarDays().map((day, index) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <div
                  key={index}
                  className={`
                    p-2 min-h-[80px] border rounded-lg cursor-pointer transition-all
                    ${
                      isCurrentMonth 
                        ? 'bg-background border-border hover:bg-accent' 
                        : 'bg-muted/30 border-muted text-muted-foreground'
                    }
                    ${isToday ? 'border-primary bg-primary/5' : ''}
                    ${isSelected ? 'ring-2 ring-primary' : ''}
                  `}
                  onClick={() => {
                    setSelectedDate(day);
                    setShowNewAppointment(true);
                  }}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-primary' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((apt) => (
                      <div 
                        key={apt.id} 
                        className="text-xs p-1 bg-primary/10 text-primary rounded truncate"
                        title={`${format(parseISO(apt.start_datetime), 'HH:mm')} - ${apt.title}`}
                      >
                        {format(parseISO(apt.start_datetime), 'HH:mm')} {apt.title}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayAppointments.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Próximas Consultas */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Clock className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Próximas Consultas</h2>
              <p className="text-sm text-muted-foreground">Agenda dos próximos dias</p>
            </div>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{appointment.title}</p>
                      {appointment.patient && (
                        <p className="text-sm text-muted-foreground">{appointment.patient.full_name}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(appointment.start_datetime), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Badge variant="outline">{appointment.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Nenhuma consulta agendada</p>
            </div>
          )}
        </Card>
      </div>

      {/* Seção inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pacientes Recentes */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Pacientes Recentes</h2>
              <p className="text-sm text-muted-foreground">Últimos pacientes cadastrados</p>
            </div>
          </div>
          
          {recentPatients.length > 0 ? (
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <div 
                  key={patient.id} 
                  className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{patient.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Cadastrado em {format(new Date(patient.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                      {patient.status === 'active' ? 'Ativo' : patient.status === 'inactive' ? 'Inativo' : 'Alta'}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/patients")}
              >
                Ver Todos os Pacientes
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Nenhum paciente cadastrado ainda</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => navigate("/patients")}
              >
                Adicionar Paciente
              </Button>
            </div>
          )}
        </Card>

        {/* Modelo EEMM */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary rounded-xl">
                <Grid3x3 className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Modelo EEMM</h2>
                <p className="text-muted-foreground">
                  O Extended Evolutionary Meta-Model organiza os processos psicológicos em uma matriz 
                  multidimensional, permitindo análise e intervenção precisas baseadas em evidências.
                </p>
              </div>
            </div>
            
            {eemmStats.total > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{eemmStats.total}</div>
                  <div className="text-xs text-muted-foreground">Processos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{eemmStats.active}</div>
                  <div className="text-xs text-muted-foreground">Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{eemmStats.highIntensity}</div>
                  <div className="text-xs text-muted-foreground">Alta Intensidade</div>
                </div>
              </div>
            )}
            
            <Button 
              size="lg" 
              className="shrink-0"
              onClick={() => navigate("/eemm")}
            >
              Explorar Matriz EEMM
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;