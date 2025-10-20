export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      affiliate_credentials: {
        Row: {
          created_at: string | null
          credentials: Json | null
          id: string
          is_active: boolean | null
          provider_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credentials?: Json | null
          id?: string
          is_active?: boolean | null
          provider_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credentials?: Json | null
          id?: string
          is_active?: boolean | null
          provider_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      affiliate_earnings: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          earnings_amount: number | null
          id: string
          is_verified: boolean | null
          metadata: Json | null
          provider_name: string | null
          source: string | null
          status: string | null
          tiptop_revenue: number | null
          transaction_type: string | null
          updated_at: string | null
          user_earnings: number | null
          user_id: string
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          earnings_amount?: number | null
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          provider_name?: string | null
          source?: string | null
          status?: string | null
          tiptop_revenue?: number | null
          transaction_type?: string | null
          updated_at?: string | null
          user_earnings?: number | null
          user_id: string
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          earnings_amount?: number | null
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          provider_name?: string | null
          source?: string | null
          status?: string | null
          tiptop_revenue?: number | null
          transaction_type?: string | null
          updated_at?: string | null
          user_earnings?: number | null
          user_id?: string
        }
        Relationships: []
      }
      affiliate_registrations: {
        Row: {
          bundle_selection_id: string | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          provider_id: string | null
          provider_name: string
          registration_data: Json | null
          registration_status: string | null
          status: string | null
          total_earnings: number | null
          tracking_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bundle_selection_id?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          provider_id?: string | null
          provider_name: string
          registration_data?: Json | null
          registration_status?: string | null
          status?: string | null
          total_earnings?: number | null
          tracking_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bundle_selection_id?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          provider_id?: string | null
          provider_name?: string
          registration_data?: Json | null
          registration_status?: string | null
          status?: string | null
          total_earnings?: number | null
          tracking_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      available_services: {
        Row: {
          analysis_id: string | null
          created_at: string | null
          id: string
          is_available: boolean | null
          monthly_revenue_high: number | null
          monthly_revenue_low: number | null
          priority_score: number | null
          provider_info: Json | null
          requirements: Json | null
          roi_months: number | null
          service_name: string
          service_type: string
          setup_cost: number | null
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          monthly_revenue_high?: number | null
          monthly_revenue_low?: number | null
          priority_score?: number | null
          provider_info?: Json | null
          requirements?: Json | null
          roi_months?: number | null
          service_name: string
          service_type: string
          setup_cost?: number | null
        }
        Update: {
          analysis_id?: string | null
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          monthly_revenue_high?: number | null
          monthly_revenue_low?: number | null
          priority_score?: number | null
          provider_info?: Json | null
          requirements?: Json | null
          roi_months?: number | null
          service_name?: string
          service_type?: string
          setup_cost?: number | null
        }
        Relationships: []
      }
      bundle_configurations: {
        Row: {
          asset_requirements: string[] | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_providers_per_asset: number | null
          min_assets: number | null
          name: string
          total_monthly_earnings_high: number | null
          total_monthly_earnings_low: number | null
          total_setup_cost: number | null
          updated_at: string | null
        }
        Insert: {
          asset_requirements?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_providers_per_asset?: number | null
          min_assets?: number | null
          name: string
          total_monthly_earnings_high?: number | null
          total_monthly_earnings_low?: number | null
          total_setup_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          asset_requirements?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_providers_per_asset?: number | null
          min_assets?: number | null
          name?: string
          total_monthly_earnings_high?: number | null
          total_monthly_earnings_low?: number | null
          total_setup_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      enhanced_service_providers: {
        Row: {
          asset_types: string[] | null
          avg_monthly_earnings_high: number | null
          avg_monthly_earnings_low: number | null
          commission_rate: number | null
          connected: boolean | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          login_url: string | null
          logo: string | null
          name: string
          priority: number | null
          referral_link_template: string | null
          setup_instructions: string | null
          setup_requirements: Json | null
          supported_assets: string[] | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          asset_types?: string[] | null
          avg_monthly_earnings_high?: number | null
          avg_monthly_earnings_low?: number | null
          commission_rate?: number | null
          connected?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          login_url?: string | null
          logo?: string | null
          name: string
          priority?: number | null
          referral_link_template?: string | null
          setup_instructions?: string | null
          setup_requirements?: Json | null
          supported_assets?: string[] | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          asset_types?: string[] | null
          avg_monthly_earnings_high?: number | null
          avg_monthly_earnings_low?: number | null
          commission_rate?: number | null
          connected?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          login_url?: string | null
          logo?: string | null
          name?: string
          priority?: number | null
          referral_link_template?: string | null
          setup_instructions?: string | null
          setup_requirements?: Json | null
          supported_assets?: string[] | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      enhanced_solar_cache: {
        Row: {
          annual_savings: number | null
          coordinates: Json | null
          created_at: string | null
          expires_at: string | null
          formatted_solar_data: Json | null
          id: string
          panel_count: number | null
          property_address: string
          raw_solar_response: Json | null
          roof_area_sqft: number | null
          setup_cost: number | null
          solar_potential_kwh: number | null
          updated_at: string | null
          using_real_data: boolean | null
        }
        Insert: {
          annual_savings?: number | null
          coordinates?: Json | null
          created_at?: string | null
          expires_at?: string | null
          formatted_solar_data?: Json | null
          id?: string
          panel_count?: number | null
          property_address: string
          raw_solar_response?: Json | null
          roof_area_sqft?: number | null
          setup_cost?: number | null
          solar_potential_kwh?: number | null
          updated_at?: string | null
          using_real_data?: boolean | null
        }
        Update: {
          annual_savings?: number | null
          coordinates?: Json | null
          created_at?: string | null
          expires_at?: string | null
          formatted_solar_data?: Json | null
          id?: string
          panel_count?: number | null
          property_address?: string
          raw_solar_response?: Json | null
          roof_area_sqft?: number | null
          setup_cost?: number | null
          solar_potential_kwh?: number | null
          updated_at?: string | null
          using_real_data?: boolean | null
        }
        Relationships: []
      }
      flexoffers_transactions: {
        Row: {
          click_date: string | null
          commission: number
          created_at: string | null
          id: string
          payload: Json | null
          program_name: string
          status: string
          transaction_date: string
          transaction_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          click_date?: string | null
          commission: number
          created_at?: string | null
          id?: string
          payload?: Json | null
          program_name: string
          status: string
          transaction_date: string
          transaction_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          click_date?: string | null
          commission?: number
          created_at?: string | null
          id?: string
          payload?: Json | null
          program_name?: string
          status?: string
          transaction_date?: string
          transaction_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      flexoffers_user_mapping: {
        Row: {
          created_at: string | null
          id: string
          sub_affiliate_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          sub_affiliate_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          sub_affiliate_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journey_analytics: {
        Row: {
          address_conversion_rate: number | null
          addresses_entered: number | null
          analyses_completed: number | null
          analysis_conversion_rate: number | null
          auth_conversion_rate: number | null
          auths_completed: number | null
          created_at: string | null
          dashboard_conversion_rate: number | null
          dashboards_accessed: number | null
          date: string
          id: string
          manual_vs_concierge: Json | null
          option_selection_rate: number | null
          options_selected: number | null
          popular_services: Json | null
          returning_visitors: number | null
          service_view_rate: number | null
          services_viewed: number | null
          total_visitors: number | null
          unique_visitors: number | null
        }
        Insert: {
          address_conversion_rate?: number | null
          addresses_entered?: number | null
          analyses_completed?: number | null
          analysis_conversion_rate?: number | null
          auth_conversion_rate?: number | null
          auths_completed?: number | null
          created_at?: string | null
          dashboard_conversion_rate?: number | null
          dashboards_accessed?: number | null
          date?: string
          id?: string
          manual_vs_concierge?: Json | null
          option_selection_rate?: number | null
          options_selected?: number | null
          popular_services?: Json | null
          returning_visitors?: number | null
          service_view_rate?: number | null
          services_viewed?: number | null
          total_visitors?: number | null
          unique_visitors?: number | null
        }
        Update: {
          address_conversion_rate?: number | null
          addresses_entered?: number | null
          analyses_completed?: number | null
          analysis_conversion_rate?: number | null
          auth_conversion_rate?: number | null
          auths_completed?: number | null
          created_at?: string | null
          dashboard_conversion_rate?: number | null
          dashboards_accessed?: number | null
          date?: string
          id?: string
          manual_vs_concierge?: Json | null
          option_selection_rate?: number | null
          options_selected?: number | null
          popular_services?: Json | null
          returning_visitors?: number | null
          service_view_rate?: number | null
          services_viewed?: number | null
          total_visitors?: number | null
          unique_visitors?: number | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          metadata: Json | null
          phone: string | null
          source: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          phone?: string | null
          source?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          phone?: string | null
          source?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      onboarding_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          onboarding_id: string
          role: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          onboarding_id: string
          role: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          onboarding_id?: string
          role?: string
        }
        Relationships: []
      }
      partner_clicks: {
        Row: {
          click_count: number | null
          conversion_count: number | null
          created_at: string | null
          id: string
          integration_status: string | null
          partner_name: string
          referral_link: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          click_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          id?: string
          integration_status?: string | null
          partner_name: string
          referral_link?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          click_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          id?: string
          integration_status?: string | null
          partner_name?: string
          referral_link?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      partner_integration_progress: {
        Row: {
          created_at: string | null
          earnings_data: Json | null
          id: string
          integration_status: string | null
          next_steps: string[] | null
          onboarding_id: string
          partner_name: string
          referral_link: string | null
          registration_data: Json | null
          session_id: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          earnings_data?: Json | null
          id?: string
          integration_status?: string | null
          next_steps?: string[] | null
          onboarding_id: string
          partner_name: string
          referral_link?: string | null
          registration_data?: Json | null
          session_id?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          earnings_data?: Json | null
          id?: string
          integration_status?: string | null
          next_steps?: string[] | null
          onboarding_id?: string
          partner_name?: string
          referral_link?: string | null
          registration_data?: Json | null
          session_id?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      partner_recommendations: {
        Row: {
          asset_type: string
          created_at: string | null
          estimated_monthly_earnings: number | null
          id: string
          onboarding_id: string
          partner_name: string
          priority_score: number | null
          recommendation_reason: string | null
          referral_link: string | null
          setup_complexity: string | null
          updated_at: string | null
        }
        Insert: {
          asset_type: string
          created_at?: string | null
          estimated_monthly_earnings?: number | null
          id?: string
          onboarding_id: string
          partner_name: string
          priority_score?: number | null
          recommendation_reason?: string | null
          referral_link?: string | null
          setup_complexity?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_type?: string
          created_at?: string | null
          estimated_monthly_earnings?: number | null
          id?: string
          onboarding_id?: string
          partner_name?: string
          priority_score?: number | null
          recommendation_reason?: string | null
          referral_link?: string | null
          setup_complexity?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      provider_commissions: {
        Row: {
          api_endpoint: string | null
          api_key_required: boolean | null
          created_at: string | null
          fixed_fee_amount: number | null
          has_api: boolean | null
          id: string
          is_active: boolean | null
          payment_model: string
          provider_name: string
          tiptop_commission_rate: number
          updated_at: string | null
          user_earning_rate: number
        }
        Insert: {
          api_endpoint?: string | null
          api_key_required?: boolean | null
          created_at?: string | null
          fixed_fee_amount?: number | null
          has_api?: boolean | null
          id?: string
          is_active?: boolean | null
          payment_model?: string
          provider_name: string
          tiptop_commission_rate?: number
          updated_at?: string | null
          user_earning_rate?: number
        }
        Update: {
          api_endpoint?: string | null
          api_key_required?: boolean | null
          created_at?: string | null
          fixed_fee_amount?: number | null
          has_api?: boolean | null
          id?: string
          is_active?: boolean | null
          payment_model?: string
          provider_name?: string
          tiptop_commission_rate?: number
          updated_at?: string | null
          user_earning_rate?: number
        }
        Relationships: []
      }
      provider_setup_requirements: {
        Row: {
          created_at: string
          id: string
          provider_id: string
          requirement_key: string
          requirement_type: string | null
          requirement_value: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider_id: string
          requirement_key: string
          requirement_type?: string | null
          requirement_value: string
        }
        Update: {
          created_at?: string
          id?: string
          provider_id?: string
          requirement_key?: string
          requirement_type?: string | null
          requirement_value?: string
        }
        Relationships: []
      }
      provider_supported_assets: {
        Row: {
          asset_type: string
          created_at: string
          id: string
          provider_id: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          id?: string
          provider_id: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          id?: string
          provider_id?: string
        }
        Relationships: []
      }
      service_integrations: {
        Row: {
          configuration: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          provider: string | null
          updated_at: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          provider?: string | null
          updated_at?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          provider?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          affiliate_program_url: string | null
          avg_monthly_earnings_high: number | null
          avg_monthly_earnings_low: number | null
          category: string | null
          commission_rate: number | null
          conversion_rate: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          priority: number | null
          referral_link_template: string | null
          setup_cost: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          affiliate_program_url?: string | null
          avg_monthly_earnings_high?: number | null
          avg_monthly_earnings_low?: number | null
          category?: string | null
          commission_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          priority?: number | null
          referral_link_template?: string | null
          setup_cost?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          affiliate_program_url?: string | null
          avg_monthly_earnings_high?: number | null
          avg_monthly_earnings_low?: number | null
          category?: string | null
          commission_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          priority?: number | null
          referral_link_template?: string | null
          setup_cost?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          configuration: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      solar_api_cache: {
        Row: {
          cached_at: string | null
          coordinates: Json | null
          created_at: string | null
          expires_at: string | null
          id: string
          property_address: string
          solar_data: Json
        }
        Insert: {
          cached_at?: string | null
          coordinates?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          property_address: string
          solar_data: Json
        }
        Update: {
          cached_at?: string | null
          coordinates?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          property_address?: string
          solar_data?: Json
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address: string | null
          created_at: string | null
          formatted_address: string | null
          id: string
          is_primary: boolean | null
          latitude: number | null
          longitude: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          formatted_address?: string | null
          id?: string
          is_primary?: boolean | null
          latitude?: number | null
          longitude?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          formatted_address?: string | null
          id?: string
          is_primary?: boolean | null
          latitude?: number | null
          longitude?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_asset_selections: {
        Row: {
          analysis_id: string | null
          asset_data: Json | null
          asset_type: string
          created_at: string | null
          id: string
          monthly_revenue: number | null
          roi_months: number | null
          selected_at: string | null
          session_id: string | null
          setup_cost: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analysis_id?: string | null
          asset_data?: Json | null
          asset_type: string
          created_at?: string | null
          id?: string
          monthly_revenue?: number | null
          roi_months?: number | null
          selected_at?: string | null
          session_id?: string | null
          setup_cost?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_id?: string | null
          asset_data?: Json | null
          asset_type?: string
          created_at?: string | null
          id?: string
          monthly_revenue?: number | null
          roi_months?: number | null
          selected_at?: string | null
          session_id?: string | null
          setup_cost?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_bundle_selections: {
        Row: {
          bundle_data: Json | null
          bundle_name: string
          created_at: string | null
          id: string
          property_address: string | null
          selected_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bundle_data?: Json | null
          bundle_name: string
          created_at?: string | null
          id?: string
          property_address?: string | null
          selected_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bundle_data?: Json | null
          bundle_name?: string
          created_at?: string | null
          id?: string
          property_address?: string | null
          selected_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_dashboard_preferences: {
        Row: {
          created_at: string | null
          dashboard_layout: Json | null
          id: string
          notification_settings: Json | null
          primary_address_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dashboard_layout?: Json | null
          id?: string
          notification_settings?: Json | null
          primary_address_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dashboard_layout?: Json | null
          id?: string
          notification_settings?: Json | null
          primary_address_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_events: {
        Row: {
          created_at: string | null
          event_target: string
          event_type: string
          id: string
          metadata: Json | null
          page_url: string
          session_id: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_target: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_url: string
          session_id: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_target?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_url?: string
          session_id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_journey_complete: {
        Row: {
          address_entered_at: string | null
          analysis_completed_at: string | null
          analysis_id: string | null
          analysis_results: Json | null
          auth_completed_at: string | null
          created_at: string | null
          current_step: string | null
          dashboard_accessed_at: string | null
          extra_data_filled_at: string | null
          extra_form_data: Json | null
          id: string
          interested_services: Json | null
          journey_start_at: string | null
          options_selected_at: string | null
          property_address: string | null
          property_coordinates: Json | null
          selected_option: string | null
          selected_services: Json | null
          services_viewed_at: string | null
          session_id: string | null
          total_monthly_revenue: number | null
          total_opportunities: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_entered_at?: string | null
          analysis_completed_at?: string | null
          analysis_id?: string | null
          analysis_results?: Json | null
          auth_completed_at?: string | null
          created_at?: string | null
          current_step?: string | null
          dashboard_accessed_at?: string | null
          extra_data_filled_at?: string | null
          extra_form_data?: Json | null
          id?: string
          interested_services?: Json | null
          journey_start_at?: string | null
          options_selected_at?: string | null
          property_address?: string | null
          property_coordinates?: Json | null
          selected_option?: string | null
          selected_services?: Json | null
          services_viewed_at?: string | null
          session_id?: string | null
          total_monthly_revenue?: number | null
          total_opportunities?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_entered_at?: string | null
          analysis_completed_at?: string | null
          analysis_id?: string | null
          analysis_results?: Json | null
          auth_completed_at?: string | null
          created_at?: string | null
          current_step?: string | null
          dashboard_accessed_at?: string | null
          extra_data_filled_at?: string | null
          extra_form_data?: Json | null
          id?: string
          interested_services?: Json | null
          journey_start_at?: string | null
          options_selected_at?: string | null
          property_address?: string | null
          property_coordinates?: Json | null
          selected_option?: string | null
          selected_services?: Json | null
          services_viewed_at?: string | null
          session_id?: string | null
          total_monthly_revenue?: number | null
          total_opportunities?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_journey_progress: {
        Row: {
          address_data: Json | null
          address_entered: boolean | null
          analysis_completed: boolean | null
          analysis_id: string | null
          auth_completed: boolean | null
          created_at: string | null
          current_step: string | null
          dashboard_accessed: boolean | null
          extra_data: Json | null
          extra_data_filled: boolean | null
          id: string
          option_selected: string | null
          services_viewed: boolean | null
          session_id: string | null
          step_completed_at: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_data?: Json | null
          address_entered?: boolean | null
          analysis_completed?: boolean | null
          analysis_id?: string | null
          auth_completed?: boolean | null
          created_at?: string | null
          current_step?: string | null
          dashboard_accessed?: boolean | null
          extra_data?: Json | null
          extra_data_filled?: boolean | null
          id?: string
          option_selected?: string | null
          services_viewed?: boolean | null
          session_id?: string | null
          step_completed_at?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_data?: Json | null
          address_entered?: boolean | null
          analysis_completed?: boolean | null
          analysis_id?: string | null
          auth_completed?: boolean | null
          created_at?: string | null
          current_step?: string | null
          dashboard_accessed?: boolean | null
          extra_data?: Json | null
          extra_data_filled?: boolean | null
          id?: string
          option_selected?: string | null
          services_viewed?: boolean | null
          session_id?: string | null
          step_completed_at?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_login_stats: {
        Row: {
          created_at: string | null
          first_login_at: string | null
          id: string
          last_ip: string | null
          last_login_at: string | null
          last_user_agent: string | null
          login_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          first_login_at?: string | null
          id?: string
          last_ip?: string | null
          last_login_at?: string | null
          last_user_agent?: string | null
          login_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          first_login_at?: string | null
          id?: string
          last_ip?: string | null
          last_login_at?: string | null
          last_user_agent?: string | null
          login_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding: {
        Row: {
          chat_history: Json | null
          completed_assets: string[] | null
          created_at: string | null
          current_step: number | null
          id: string
          onboarding_data: Json | null
          progress_data: Json | null
          selected_option: Database["public"]["Enums"]["onboarding_option"]
          status: Database["public"]["Enums"]["onboarding_status"]
          total_steps: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chat_history?: Json | null
          completed_assets?: string[] | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          onboarding_data?: Json | null
          progress_data?: Json | null
          selected_option: Database["public"]["Enums"]["onboarding_option"]
          status?: Database["public"]["Enums"]["onboarding_status"]
          total_steps?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chat_history?: Json | null
          completed_assets?: string[] | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          onboarding_data?: Json | null
          progress_data?: Json | null
          selected_option?: Database["public"]["Enums"]["onboarding_option"]
          status?: Database["public"]["Enums"]["onboarding_status"]
          total_steps?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_property_analyses: {
        Row: {
          address_id: string | null
          analysis_results: Json | null
          analysis_version: string | null
          coordinates: Json | null
          created_at: string | null
          id: string
          property_type: string | null
          satellite_image_url: string | null
          session_id: string | null
          total_monthly_revenue: number | null
          total_opportunities: number | null
          updated_at: string | null
          user_id: string | null
          using_real_solar_data: boolean | null
        }
        Insert: {
          address_id?: string | null
          analysis_results?: Json | null
          analysis_version?: string | null
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          property_type?: string | null
          satellite_image_url?: string | null
          session_id?: string | null
          total_monthly_revenue?: number | null
          total_opportunities?: number | null
          updated_at?: string | null
          user_id?: string | null
          using_real_solar_data?: boolean | null
        }
        Update: {
          address_id?: string | null
          analysis_results?: Json | null
          analysis_version?: string | null
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          property_type?: string | null
          satellite_image_url?: string | null
          session_id?: string | null
          total_monthly_revenue?: number | null
          total_opportunities?: number | null
          updated_at?: string | null
          user_id?: string | null
          using_real_solar_data?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_property_analyses_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "user_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_property_images: {
        Row: {
          analysis_id: string | null
          created_at: string | null
          id: string
          image_base64: string | null
          image_metadata: Json | null
          image_type: string
          image_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string | null
          id?: string
          image_base64?: string | null
          image_metadata?: Json | null
          image_type: string
          image_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          created_at?: string | null
          id?: string
          image_base64?: string | null
          image_metadata?: Json | null
          image_type?: string
          image_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_service_selections: {
        Row: {
          available_service_id: string | null
          created_at: string | null
          id: string
          journey_id: string | null
          notes: string | null
          priority: number | null
          selected_at: string | null
          selection_type: string | null
          user_id: string | null
        }
        Insert: {
          available_service_id?: string | null
          created_at?: string | null
          id?: string
          journey_id?: string | null
          notes?: string | null
          priority?: number | null
          selected_at?: string | null
          selection_type?: string | null
          user_id?: string | null
        }
        Update: {
          available_service_id?: string | null
          created_at?: string | null
          id?: string
          journey_id?: string | null
          notes?: string | null
          priority?: number | null
          selected_at?: string | null
          selection_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_supplier_connections: {
        Row: {
          analysis_id: string | null
          asset_type: string
          connection_status: string | null
          created_at: string | null
          estimated_revenue: number | null
          id: string
          notes: string | null
          referral_link: string | null
          setup_cost: number | null
          supplier_data: Json | null
          supplier_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          asset_type: string
          connection_status?: string | null
          created_at?: string | null
          estimated_revenue?: number | null
          id?: string
          notes?: string | null
          referral_link?: string | null
          setup_cost?: number | null
          supplier_data?: Json | null
          supplier_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          asset_type?: string
          connection_status?: string | null
          created_at?: string | null
          estimated_revenue?: number | null
          id?: string
          notes?: string | null
          referral_link?: string | null
          setup_cost?: number | null
          supplier_data?: Json | null
          supplier_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      visitor_sessions: {
        Row: {
          address_entered_at: string | null
          analysis_completed_at: string | null
          analysis_data: Json | null
          auth_completed_at: string | null
          completed_at: string | null
          conversion_type: string | null
          created_at: string | null
          current_step: string | null
          dashboard_accessed_at: string | null
          extra_data: Json | null
          id: string
          ip_address: unknown | null
          journey_data: Json | null
          landing_page: string | null
          options_selected_at: string | null
          property_address: string | null
          referrer: string | null
          selected_option: string | null
          selected_services: Json | null
          services_viewed_at: string | null
          session_id: string
          started_at: string | null
          total_time_seconds: number | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          address_entered_at?: string | null
          analysis_completed_at?: string | null
          analysis_data?: Json | null
          auth_completed_at?: string | null
          completed_at?: string | null
          conversion_type?: string | null
          created_at?: string | null
          current_step?: string | null
          dashboard_accessed_at?: string | null
          extra_data?: Json | null
          id?: string
          ip_address?: unknown | null
          journey_data?: Json | null
          landing_page?: string | null
          options_selected_at?: string | null
          property_address?: string | null
          referrer?: string | null
          selected_option?: string | null
          selected_services?: Json | null
          services_viewed_at?: string | null
          session_id: string
          started_at?: string | null
          total_time_seconds?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          address_entered_at?: string | null
          analysis_completed_at?: string | null
          analysis_data?: Json | null
          auth_completed_at?: string | null
          completed_at?: string | null
          conversion_type?: string | null
          created_at?: string | null
          current_step?: string | null
          dashboard_accessed_at?: string | null
          extra_data?: Json | null
          id?: string
          ip_address?: unknown | null
          journey_data?: Json | null
          landing_page?: string | null
          options_selected_at?: string | null
          property_address?: string | null
          referrer?: string | null
          selected_option?: string | null
          selected_services?: Json | null
          services_viewed_at?: string | null
          session_id?: string
          started_at?: string | null
          total_time_seconds?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      admin_revenue_by_provider: {
        Row: {
          active_users: number | null
          avg_commission_rate: number | null
          has_api: boolean | null
          last_transaction: string | null
          payment_model: string | null
          provider_name: string | null
          total_gross_revenue: number | null
          total_tiptop_revenue: number | null
          total_transactions: number | null
          total_user_earnings: number | null
        }
        Relationships: []
      }
      admin_revenue_timeline: {
        Row: {
          active_users: number | null
          daily_tiptop_revenue: number | null
          daily_user_earnings: number | null
          date: string | null
          provider_name: string | null
          transactions: number | null
        }
        Relationships: []
      }
      admin_user_ltv: {
        Row: {
          avg_monthly_tiptop_revenue: number | null
          first_earning_date: string | null
          last_earning_date: string | null
          providers_count: number | null
          total_tiptop_revenue: number | null
          total_user_earnings: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_all_analyses: {
        Row: {
          address_id: string | null
          analysis_results: Json | null
          coordinates: Json | null
          created_at: string | null
          id: string | null
          property_address: string | null
          property_type: string | null
          satellite_image_url: string | null
          source_table: string | null
          total_monthly_revenue: number | null
          total_opportunities: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_user_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_all_analyses: {
        Args: { p_user_id: string }
        Returns: {
          address_id: string
          analysis_results: Json
          coordinates: Json
          created_at: string
          id: string
          property_address: string
          property_type: string
          satellite_image_url: string
          source_table: string
          total_monthly_revenue: number
          total_opportunities: number
          updated_at: string
          user_id: string
        }[]
      }
      get_user_analyses_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_dashboard_data: {
        Args: { p_user_id: string }
        Returns: {
          analysis_id: string
          analysis_results: Json
          journey_id: string
          journey_progress: Json
          property_address: string
          selected_option: string
          selected_services: Json
          total_monthly_revenue: number
          total_opportunities: number
        }[]
      }
      get_visitor_sessions_with_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          completed_at: string
          conversion_type: string
          current_step: string
          extra_data: Json
          id: string
          landing_page: string
          referrer: string
          session_id: string
          started_at: string
          total_time_seconds: number
          updated_at: string
          user_agent: string
          user_email: string
          user_id: string
        }[]
      }
      link_anonymous_analysis_to_user: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: number
      }
      link_journey_to_user: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: undefined
      }
      link_session_to_user: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: number
      }
      link_user_analyses_from_journey: {
        Args: { p_user_id: string }
        Returns: number
      }
      refresh_admin_revenue_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      repair_orphaned_user_selections: {
        Args: { p_analysis_id: string; p_user_id: string }
        Returns: number
      }
      repair_recent_orphaned_selections: {
        Args: {
          p_analysis_id: string
          p_time_threshold?: unknown
          p_user_id: string
        }
        Returns: number
      }
      save_property_analysis: {
        Args: {
          p_analysis_results?: Json
          p_coordinates?: Json
          p_property_address?: string
          p_satellite_image_url?: string
          p_session_id?: string
          p_total_monthly_revenue?: number
          p_total_opportunities?: number
          p_user_id?: string
        }
        Returns: string
      }
      update_asset_selections_with_analysis: {
        Args: { p_analysis_id: string; p_session_id: string }
        Returns: number
      }
      update_journey_step: {
        Args: { p_data?: Json; p_session_id: string; p_step: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator"
      onboarding_option: "manual" | "concierge"
      onboarding_status: "not_started" | "in_progress" | "completed" | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "moderator"],
      onboarding_option: ["manual", "concierge"],
      onboarding_status: ["not_started", "in_progress", "completed", "paused"],
    },
  },
} as const
