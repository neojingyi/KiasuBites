/**
 * Database Types for Supabase
 * 
 * This file contains TypeScript types generated from your Supabase database schema.
 * You can regenerate these types using the Supabase CLI:
 * 
 *   npx supabase gen types typescript --project-id your-project-id > types/database.types.ts
 * 
 * For now, we'll define the types manually based on our schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'consumer' | 'vendor'
          dietary_preferences: string[] | null
          radius_km: number | null
          phone_number: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role: 'consumer' | 'vendor'
          dietary_preferences?: string[] | null
          radius_km?: number | null
          phone_number?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'consumer' | 'vendor'
          dietary_preferences?: string[] | null
          radius_km?: number | null
          phone_number?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          name: string
          address: string
          lat: number
          lng: number
          category: string
          rating: number
          total_reviews: number
          tags: string[] | null
          photo_url: string | null
          pickup_instructions: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          address: string
          lat: number
          lng: number
          category: string
          rating?: number
          total_reviews?: number
          tags?: string[] | null
          photo_url?: string | null
          pickup_instructions?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          lat?: number
          lng?: number
          category?: string
          rating?: number
          total_reviews?: number
          tags?: string[] | null
          photo_url?: string | null
          pickup_instructions?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vendor_business_info: {
        Row: {
          id: string
          vendor_id: string
          company_name: string
          brand_name: string | null
          uen: string
          business_type: string
          director_name: string
          nric: string
          address: string
          phone: string
          email: string
          opening_hours: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          company_name: string
          brand_name?: string | null
          uen: string
          business_type: string
          director_name: string
          nric: string
          address: string
          phone: string
          email: string
          opening_hours?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          company_name?: string
          brand_name?: string | null
          uen?: string
          business_type?: string
          director_name?: string
          nric?: string
          address?: string
          phone?: string
          email?: string
          opening_hours?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vendor_settings: {
        Row: {
          id: string
          vendor_id: string
          instructions: string | null
          collection_info: string | null
          storage_info: string | null
          show_allergens: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          instructions?: string | null
          collection_info?: string | null
          storage_info?: string | null
          show_allergens?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          instructions?: string | null
          collection_info?: string | null
          storage_info?: string | null
          show_allergens?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vendor_availability: {
        Row: {
          id: string
          vendor_id: string
          day_of_week: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
          available: boolean
          pickup_start: string
          pickup_end: string
          default_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          day_of_week: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
          available?: boolean
          pickup_start: string
          pickup_end: string
          default_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          day_of_week?: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
          available?: boolean
          pickup_start?: string
          pickup_end?: string
          default_quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      surprise_bags: {
        Row: {
          id: string
          vendor_id: string
          title: string
          description: string
          price: number
          original_price: number
          pickup_start: string
          pickup_end: string
          quantity: number
          dietary_tags: string[] | null
          status: 'active' | 'sold_out' | 'inactive'
          category: 'Meals' | 'Bread & Pastries' | 'Groceries' | 'Dessert' | 'Other' | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          title: string
          description: string
          price: number
          original_price: number
          pickup_start: string
          pickup_end: string
          quantity?: number
          dietary_tags?: string[] | null
          status?: 'active' | 'sold_out' | 'inactive'
          category?: 'Meals' | 'Bread & Pastries' | 'Groceries' | 'Dessert' | 'Other' | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          title?: string
          description?: string
          price?: number
          original_price?: number
          pickup_start?: string
          pickup_end?: string
          quantity?: number
          dietary_tags?: string[] | null
          status?: 'active' | 'sold_out' | 'inactive'
          category?: 'Meals' | 'Bread & Pastries' | 'Groceries' | 'Dessert' | 'Other' | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          consumer_id: string
          bag_id: string
          vendor_id: string
          bag_title: string
          vendor_name: string
          quantity: number
          total_price: number
          estimated_value: number
          status: 'reserved' | 'picked_up' | 'cancelled' | 'no_show'
          pickup_start: string
          pickup_end: string
          confirmation_code: string
          rating: number | null
          review: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          consumer_id: string
          bag_id: string
          vendor_id: string
          bag_title: string
          vendor_name: string
          quantity: number
          total_price: number
          estimated_value: number
          status?: 'reserved' | 'picked_up' | 'cancelled' | 'no_show'
          pickup_start: string
          pickup_end: string
          confirmation_code: string
          rating?: number | null
          review?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          consumer_id?: string
          bag_id?: string
          vendor_id?: string
          bag_title?: string
          vendor_name?: string
          quantity?: number
          total_price?: number
          estimated_value?: number
          status?: 'reserved' | 'picked_up' | 'cancelled' | 'no_show'
          pickup_start?: string
          pickup_end?: string
          confirmation_code?: string
          rating?: number | null
          review?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          vendor_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vendor_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vendor_id?: string
          created_at?: string
        }
      }
      payout_methods: {
        Row: {
          id: string
          vendor_id: string
          type: 'bank_account'
          bank_name: string
          account_number: string
          account_holder_name: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          type?: 'bank_account'
          bank_name: string
          account_number: string
          account_holder_name: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          type?: 'bank_account'
          bank_name?: string
          account_number?: string
          account_holder_name?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      monthly_statements: {
        Row: {
          id: string
          vendor_id: string
          month: number
          year: number
          total_orders: number
          total_revenue: number
          platform_fees: number
          net_payout: number
          status: 'pending' | 'processing' | 'paid'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          month: number
          year: number
          total_orders?: number
          total_revenue?: number
          platform_fees?: number
          net_payout?: number
          status?: 'pending' | 'processing' | 'paid'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          month?: number
          year?: number
          total_orders?: number
          total_revenue?: number
          platform_fees?: number
          net_payout?: number
          status?: 'pending' | 'processing' | 'paid'
          created_at?: string
          updated_at?: string
        }
      }
      daily_invoices: {
        Row: {
          id: string
          order_id: string
          date: string
          product_type: string
          total_amount: number
          invoice_url: string | null
          credit_note_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          date: string
          product_type: string
          total_amount: number
          invoice_url?: string | null
          credit_note_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          date?: string
          product_type?: string
          total_amount?: number
          invoice_url?: string | null
          credit_note_url?: string | null
          created_at?: string
        }
      }
      partner_details: {
        Row: {
          id: string
          vendor_id: string
          business_name: string
          address: string
          postal_code: string
          city: string
          country: string
          invoice_email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          business_name: string
          address: string
          postal_code: string
          city: string
          country?: string
          invoice_email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          business_name?: string
          address?: string
          postal_code?: string
          city?: string
          country?: string
          invoice_email?: string
          created_at?: string
          updated_at?: string
        }
      }
      email_settings: {
        Row: {
          id: string
          vendor_id: string
          enabled: boolean
          include_account_statements: boolean
          include_order_summaries: boolean
          include_invoices: boolean
          include_self_billing_invoices: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          enabled?: boolean
          include_account_statements?: boolean
          include_order_summaries?: boolean
          include_invoices?: boolean
          include_self_billing_invoices?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          enabled?: boolean
          include_account_statements?: boolean
          include_order_summaries?: boolean
          include_invoices?: boolean
          include_self_billing_invoices?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

