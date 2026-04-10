import { supabase } from '../supabaseClient';

// Utility to fetch delivered details for a customer
export async function fetchDeliveredDetails(customerName) {
  const { data, error } = await supabase
    .from('VSRCYLINDERDATA')
    .select('*')
    .eq('customer_name', customerName)
    .eq('type', 'delivery')
    .order('date', { ascending: false });
  
  if (error) {
    throw new Error(error.message || 'Failed to fetch delivered details');
  }
  
  return data || [];
}
