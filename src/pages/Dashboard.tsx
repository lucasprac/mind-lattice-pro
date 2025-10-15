import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Network, Grid3x3, FileText, TrendingUp, Calendar as CalendarIcon, Plus, Clock, User, ArrowRight } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { usePatientAssessments } from "@/hooks/usePatientAssessments";
import { useNavigate } from "react-router-dom";
import { format, addWeeks, addMonths, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

// Mock appointments hook - this should be replaced with real Supabase integration
const useAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  
  const addAppointment = (appointment: any) => {
    const newAppointment = {
      id: Date.now().toString(),
      ...appointment,
      created_at: new Date().toISOString()
    };
    setAppointments(prev => [...prev, newAppointment]);
    return true;
  };
  
  return { appointments, addAppointment, loading: false };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { appointments, addAppointment } = useAppointments();
  
  // Get all records to calculate sessions this month
  const allRecords = patients.reduce((acc, patient) => {
    const { records } = useRecords(patient.id);
    return [...acc, ...records];
  }, [] as any[]);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const sessionsThisMonth = allRecords.filter(record => {
    const recordDate = new Date(record.session_date);
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  }).length;

  // Calculate total assessments across all patients
  const totalAssessments = patients.reduce((acc, patient) => {
    const { assessments } = usePatientAssessments(patient.id);
    return acc + assessments.length;
  }, 0);

  const stats = [
    { label: "Pacientes Ativos", value: patients.filter(p => p.status === 'active').length.toString(), icon: Users, color: "text-blue-600" },
    { label: "Avaliações Realizadas", value: totalAssessments.toString(), icon: FileText, color: "text-green-600" },
    { label: "Sessões este Mês", value: sessionsThisMonth.toString(), icon: CalendarIcon, color: "text-purple-600" },
    { label: "Consultas Agendadas", value: appointments.length.toString(), icon: Clock, color: "text-orange-600" },
  ];

  // Appointment scheduling state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: "",
    title: "",
    description: "",
    time: "",
    duration: "60",
    recurrence: "none"
  });
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);

  const handleScheduleAppointment = () => {
    if (!appointmentForm.patient_id || !appointmentForm.title || !appointmentForm.time) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const appointmentDateTime = new Date(selectedDate);
    const [hours, minutes] = appointmentForm.time.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

    const baseAppointment = {
      patient_id: appointmentForm.patient_id,
      title: appointmentForm.title,
      description: appointmentForm.description,
      date: appointmentDateTime.toISOString(),
      duration: parseInt(appointmentForm.duration),
      recurrence: appointmentForm.recurrence
    };

    // Create recurring appointments
    const appointmentsToCreate = [baseAppointment];
    
    if (appointmentForm.recurrence !== "none") {
      let nextDate = new Date(appointmentDateTime);
      for (let i = 0; i < 12; i++) { // Create next 12 occurrences
        switch (appointmentForm.recurrence) {
          case "weekly":
            nextDate = addWeeks(nextDate, 1);
            break;
          case "biweekly":
            nextDate = addWeeks(nextDate, 2);
            break;
          case "monthly":
            nextDate = addMonths(nextDate, 1);
            break;
        }
        
        appointmentsToCreate.push({
          ...baseAppointment,
          date: nextDate.toISOString()
        });
      }
    }

    appointmentsToCreate.forEach(apt => addAppointment(apt));
    
    toast.success(`Consulta${appointmentsToCreate.length > 1 ? 's' : ''} agendada${appointmentsToCreate.length > 1 ? 's' : ''} com sucesso!`);
    setIsSchedulingOpen(false);
    setAppointmentForm({
      patient_id: "",
      title: "",
      description: "",
      time: "",
      duration: "60",
      recurrence: "none"
    });
  };

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const recentPatients = patients
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Visão geral do seu sistema de Terapia Baseada em Processos
          </p>
        </div>
        <Dialog open={isSchedulingOpen} onOpenChange={setIsSchedulingOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 shadow-lg">
              <Plus className="h-5 w-5" />
              Agendar Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agendar Nova Consulta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Paciente *</Label>
                <Select value={appointmentForm.patient_id} onValueChange={(value) => 
                  setAppointmentForm(prev => ({ ...prev, patient_id: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Título da Consulta *</Label>
                <Input
                  value={appointmentForm.title}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Sessão de Terapia"
                />
              </div>
              
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={appointmentForm.description}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Observações sobre a consulta..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Horário *</Label>
                  <Input
                    type="time"
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Duração (min)</Label>
                  <Select value={appointmentForm.duration} onValueChange={(value) => 
                    setAppointmentForm(prev => ({ ...prev, duration: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Recorrência</Label>
                <Select value={appointmentForm.recurrence} onValueChange={(value) => 
                  setAppointmentForm(prev => ({ ...prev, recurrence: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Apenas uma vez</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="biweekly">Quinzenal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsSchedulingOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleScheduleAppointment} className="flex-1">
                  Agendar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-10 translate-x-10"></div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Calendário</h2>
              <p className="text-sm text-muted-foreground">Selecione uma data para agendar</p>
            </div>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            modifiers={{
              appointment: appointments.map(apt => new Date(apt.date))
            }}
            modifiersStyles={{
              appointment: { backgroundColor: 'hsl(var(--primary))', color: 'white' }
            }}
          />
          {selectedDate && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">
                {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <Dialog open={isSchedulingOpen} onOpenChange={setIsSchedulingOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Agendar Consulta
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </Card>

        {/* Recent Patients */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Pacientes Recentes</h2>
                <p className="text-sm text-muted-foreground">Últimos cadastrados</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/patients')}>
              Ver Todos
            </Button>
          </div>
          
          {recentPatients.length > 0 ? (
            <div className="space-y-3">
              {recentPatients.map(patient => {
                const statusConfig = {
                  active: { color: "bg-green-500", label: "Ativo" },
                  inactive: { color: "bg-orange-500", label: "Inativo" },
                  discharged: { color: "bg-purple-500", label: "Alta" }
                }[patient.status] || { color: "bg-gray-500", label: "Desconhecido" };
                
                return (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-full">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{patient.full_name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className={`w-2 h-2 ${statusConfig.color} rounded-full`}></div>
                          {statusConfig.label}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Nenhum paciente cadastrado ainda</p>
              <Button className="mt-3" variant="outline" size="sm" onClick={() => navigate('/patients')}>
                Adicionar Paciente
              </Button>
            </div>
          )}
        </Card>

        {/* Upcoming Appointments */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Próximas Consultas</h2>
              <p className="text-sm text-muted-foreground">Agenda dos próximos dias</p>
            </div>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map(appointment => {
                const patient = patients.find(p => p.id === appointment.patient_id);
                const appointmentDate = new Date(appointment.date);
                const isToday = isSameDay(appointmentDate, new Date());
                
                return (
                  <div key={appointment.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{appointment.title}</div>
                      {isToday && <Badge className="text-xs">Hoje</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>{patient?.full_name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(appointmentDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        <span>•</span>
                        <span>{appointment.duration}min</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Nenhuma consulta agendada</p>
              <Dialog open={isSchedulingOpen} onOpenChange={setIsSchedulingOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-3" variant="outline" size="sm">
                    Agendar Consulta
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </Card>
      </div>

      {/* EEMM Promotion Card */}
      <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary rounded-xl">
              <Grid3x3 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Modelo EEMM</h2>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">
                O Extended Evolutionary Meta-Model organiza os processos psicológicos em uma matriz 
                multidimensional, permitindo análise e intervenção precisas baseadas em evidências.
              </p>
            </div>
          </div>
          <Button size="lg" className="shrink-0 gap-2" onClick={() => navigate('/eemm')}>
            Explorar Matriz EEMM
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="p-6 h-auto flex-col gap-3"
            onClick={() => navigate('/patients')}
          >
            <Users className="h-8 w-8 text-primary" />
            <span>Gestão de Pacientes</span>
          </Button>
          <Button 
            variant="outline" 
            className="p-6 h-auto flex-col gap-3"
            onClick={() => navigate('/networks')}
          >
            <Network className="h-8 w-8 text-green-600" />
            <span>Redes de Processos</span>
          </Button>
          <Button 
            variant="outline" 
            className="p-6 h-auto flex-col gap-3"
            onClick={() => navigate('/records')}
          >
            <FileText className="h-8 w-8 text-blue-600" />
            <span>Prontuários</span>
          </Button>
          <Button 
            variant="outline" 
            className="p-6 h-auto flex-col gap-3"
            onClick={() => navigate('/interventions')}
          >
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <span>Intervenções</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;