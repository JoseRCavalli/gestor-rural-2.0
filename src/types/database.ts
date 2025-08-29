// Tipos temporários para resolver problemas de build do Supabase
export interface Animal {
  id: string;
  user_id: string;
  name?: string;
  tag: string;
  birth_date: string;
  phase: string;
  created_at: string;
  updated_at: string;
  batch: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type?: string;
  icon?: string;
  completed?: boolean;
  created_at: string;
  updated_at: string;
  date: string;
}

export interface StockItem {
  id: string;
  user_id: string;
  name: string;
  code?: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock: number;
  average_cost?: number;
  selling_price?: number;
  reserved_stock?: number;
  available_stock?: number;
  created_at: string;
  updated_at: string;
}

export interface VaccineType {
  id: string;
  name: string;
  description?: string;
  min_age_months?: number;
  max_age_months?: number;
  interval_months?: number;
  phases?: string[];
  created_at: string;
}

export interface Vaccination {
  id: string;
  user_id: string;
  animal_id: string;
  vaccine_type_id: string;
  application_date: string;
  next_dose_date?: string;
  manufacturer?: string;
  responsible?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_notifications?: boolean;
  whatsapp_notifications?: boolean;
  stock_alerts?: boolean;
  weather_alerts?: boolean;
  alert_advance_minutes?: number;
  default_reminder_time?: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  report_type: string;
  title: string;
  data: any;
  generated_at: string;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  property_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ImportLog {
  id: string;
  user_id: string;
  import_type: string;
  file_name?: string;
  records_processed?: number;
  records_success?: number;
  records_failed?: number;
  errors?: any;
  created_at: string;
}