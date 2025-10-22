import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, addWeeks, addMonths, addDays, parseISO } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Appointment = Tables<'appointments'>;

type RecurrenceType = "none" | "daily" | "weekly" | "biweekly" | "monthly" | "custom";

interface CreateAppointmentData {
  title: string;
  description?: string;
  start_datetime: Date;
  end_datetime: Date;
  patient_id?: string;
  appointment_type?: string;
  recurrence_type?: RecurrenceType;
  recurrence_count?: number;
  custom_interval?: number;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAppointments = async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("appointments")
        .select(`*, patient:patients(id, full_name)`) // relies on FK for patient join
        .eq("therapist_id", user.id)
        .order("start_datetime", { ascending: true });
      if (fetchError) { setError(fetchError.message); toast.error("Erro ao carregar consultas"); return; }
      setAppointments((data as any) || []);
    } catch (err) {
      setError("Erro inesperado ao carregar consultas"); toast.error("Erro inesperado ao carregar consultas");
    } finally { setLoading(false); }
  };

  const createAppointment = async (appointmentData: CreateAppointmentData) => {
    if (!user?.id) { toast.error("Usuário não autenticado"); return false; }
    try {
      if (!appointmentData.recurrence_type || appointmentData.recurrence_type === "none") {
        const { error } = await supabase.from("appointments").insert({
          therapist_id: user.id,
          title: appointmentData.title,
          description: appointmentData.description ?? null,
          start_datetime: appointmentData.start_datetime.toISOString(),
          end_datetime: appointmentData.end_datetime.toISOString(),
          patient_id: appointmentData.patient_id ?? null,
          appointment_type: appointmentData.appointment_type ?? "consultation",
          status: "scheduled",
        });
        if (error) { toast.error("Erro ao criar consulta"); return false; }
      } else {
        const appointments = generateRecurringAppointments(appointmentData);
        const recurrence_group_id = crypto.randomUUID();
        const payload = appointments.map(apt => ({
          therapist_id: user.id,
          title: appointmentData.title,
          description: appointmentData.description ?? null,
          start_datetime: apt.start_datetime.toISOString(),
          end_datetime: apt.end_datetime.toISOString(),
          patient_id: appointmentData.patient_id ?? null,
          appointment_type: appointmentData.appointment_type ?? "consultation",
          status: "scheduled" as const,
          recurrence_rule: `${appointmentData.recurrence_type}:${appointmentData.recurrence_count || 1}`,
          recurrence_group_id,
        }));
        const { error } = await supabase.from("appointments").insert(payload);
        if (error) { toast.error("Erro ao criar consultas recorrentes"); return false; }
      }
      toast.success("Consulta(s) criada(s) com sucesso");
      await fetchAppointments();
      return true;
    } catch (err) { toast.error("Erro inesperado ao criar consulta"); return false; }
  };

  const generateRecurringAppointments = (appointmentData: CreateAppointmentData) => {
    const appointments = [] as { start_datetime: Date; end_datetime: Date }[];
    const count = appointmentData.recurrence_count || 1;
    const duration = appointmentData.end_datetime.getTime() - appointmentData.start_datetime.getTime();
    for (let i = 0; i < count; i++) {
      let nextStartDate: Date;
      switch (appointmentData.recurrence_type) {
        case "daily": nextStartDate = addDays(appointmentData.start_datetime, i); break;
        case "weekly": nextStartDate = addWeeks(appointmentData.start_datetime, i); break;
        case "biweekly": nextStartDate = addWeeks(appointmentData.start_datetime, i * 2); break;
        case "monthly": nextStartDate = addMonths(appointmentData.start_datetime, i); break;
        case "custom": nextStartDate = addDays(appointmentData.start_datetime, i * (appointmentData.custom_interval || 1)); break;
        default: nextStartDate = appointmentData.start_datetime;
      }
      const nextEndDate = new Date(nextStartDate.getTime() + duration);
      appointments.push({ start_datetime: nextStartDate, end_datetime: nextEndDate });
    }
    return appointments;
  };

  const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
    if (!user?.id) { toast.error("Usuário não autenticado"); return false; }
    const { error } = await supabase.from("appointments").update(updates).eq("id", appointmentId).eq("therapist_id", user.id);
    if (error) { toast.error("Erro ao atualizar consulta"); return false; }
    toast.success("Consulta atualizada com sucesso"); await fetchAppointments(); return true;
  };

  const deleteAppointment = async (appointmentId: string, deleteRecurring = false) => {
    if (!user?.id) { toast.error("Usuário não autenticado"); return false; }
    try {
      if (deleteRecurring) {
        const { data: appointment } = await supabase.from("appointments").select("recurrence_group_id").eq("id", appointmentId).single();
        if (appointment?.recurrence_group_id) {
          const { error } = await supabase.from("appointments").delete().eq("recurrence_group_id", appointment.recurrence_group_id).eq("therapist_id", user.id);
          if (error) { toast.error("Erro ao deletar consultas recorrentes"); return false; }
          toast.success("Todas as consultas recorrentes foram deletadas");
        }
      } else {
        const { error } = await supabase.from("appointments").delete().eq("id", appointmentId).eq("therapist_id", user.id);
        if (error) { toast.error("Erro ao deletar consulta"); return false; }
        toast.success("Consulta deletada com sucesso");
      }
      await fetchAppointments(); return true;
    } catch { toast.error("Erro inesperado ao deletar consulta"); return false; }
  };

  const getAppointmentsByDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => format(parseISO(apt.start_datetime), 'yyyy-MM-dd') === dateStr);
  };

  const getUpcomingAppointments = (limit = 5) => {
    const now = new Date();
    return appointments.filter(apt => parseISO(apt.start_datetime) > now && apt.status === 'scheduled').slice(0, limit);
  };

  const getAppointmentStats = () => {
    const total = appointments.length;
    const scheduled = appointments.filter(apt => apt.status === 'scheduled').length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
    const thisMonth = appointments.filter(apt => {
      const aptDate = parseISO(apt.start_datetime); const now = new Date();
      return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
    }).length;
    return { total, scheduled, completed, cancelled, thisMonth };
  };

  useEffect(() => { fetchAppointments(); }, [user?.id]);

  return { appointments, loading, error, createAppointment, updateAppointment, deleteAppointment, getAppointmentsByDate, getUpcomingAppointments, getAppointmentStats, fetchAppointments, refetch: fetchAppointments };
};
