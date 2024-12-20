export interface Unit {
  unit_uuid?: string;
  unit_name?: string;
}

export interface InvoiceSupplier {
  supplier_uuid?: string;
  supplier_name?: string;
}

export interface Invoices {
  invoice_uuid?: string;
  invoice_number?: string;
  date?: string;
  amount?: number;
  supplier?: InvoiceSupplier;
  documents?: InvoiceDocument[];
  ingredients?: InvoiceIngredient[];
  created_supplier?: boolean;
}

export interface InvoiceDocument {
  document_uuid?: string;
  document_type?: string;
  file_path?: string;
  name?: string;
}

export interface InvoiceIngredient {
  uuid?: string;
  ingredient_uuid?: string;
  ingredient_name?: string;
  detected_name?: string;
  quantity?: number;
  unit?: Unit;
  unit_cost?: number;
  total_cost?: number;
  vat?: number;
  product_code?: string;
  created_ingredient?: boolean;
}

export interface Stocktake {
  stocktake_uuid?: string;
  event_type?: string;
  status?: string;
  restaurant_uuid?: string;
  documents?: StocktakeDocument[];
  ingredients?: StocktakeIngredient[];
  value?: number;
  created_by?: string;
  created_at?: string;
}

export interface StocktakeDocument {
  document_uuid?: string;
  document_type?: string;
  file_path?: string;
  restaurant_uuid?: string;
  status?: string;
}

export interface StocktakeIngredient {
  uuid?: string;
  ingredient_uuid?: string;
  ingredient_name?: string;
  quantity?: number;
  unit?: Unit;
  document_uuid?: string;
  comment?: string;
  timestamp?: string;
}
