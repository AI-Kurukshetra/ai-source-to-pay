export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "supplier" | "employee";
export type SupplierApprovalStatus = "pending" | "approved" | "rejected";
export type SupplierDocumentType =
  | "gst_certificate"
  | "company_registration"
  | "bank_proof"
  | "compliance_certificate";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      suppliers: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          contact_person: string;
          email: string;
          phone: string;
          address: string;
          gst_number: string;
          business_type: string;
          product_categories: string[];
          bank_details: Json;
          approval_status: SupplierApprovalStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          contact_person: string;
          email: string;
          phone: string;
          address: string;
          gst_number: string;
          business_type: string;
          product_categories: string[];
          bank_details: Json;
          approval_status?: SupplierApprovalStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          contact_person?: string;
          email?: string;
          phone?: string;
          address?: string;
          gst_number?: string;
          business_type?: string;
          product_categories?: string[];
          bank_details?: Json;
          approval_status?: SupplierApprovalStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "suppliers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      supplier_documents: {
        Row: {
          id: string;
          supplier_id: string;
          document_type: SupplierDocumentType;
          file_url: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          document_type: SupplierDocumentType;
          file_url: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          document_type?: SupplierDocumentType;
          file_url?: string;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "supplier_documents_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      rfqs: {
        Row: {
          id: string;
          title: string;
          description: string;
          product_requirements: string;
          quantity: number;
          deadline: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          product_requirements: string;
          quantity: number;
          deadline: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          product_requirements?: string;
          quantity?: number;
          deadline?: string;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rfqs_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      rfq_responses: {
        Row: {
          id: string;
          rfq_id: string;
          supplier_id: string;
          quote_price: number;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          supplier_id: string;
          quote_price: number;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          rfq_id?: string;
          supplier_id?: string;
          quote_price?: number;
          message?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rfq_responses_rfq_id_fkey";
            columns: ["rfq_id"];
            isOneToOne: false;
            referencedRelation: "rfqs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rfq_responses_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      purchase_requisitions: {
        Row: {
          id: string;
          title: string;
          item_name: string;
          description: string;
          quantity: number;
          estimated_budget: number;
          category: string;
          urgency: "low" | "medium" | "high";
          status: "draft" | "pending" | "approved" | "rejected";
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          item_name: string;
          description: string;
          quantity: number;
          estimated_budget: number;
          category: string;
          urgency: "low" | "medium" | "high";
          status?: "draft" | "pending" | "approved" | "rejected";
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          item_name?: string;
          description?: string;
          quantity?: number;
          estimated_budget?: number;
          category?: string;
          urgency?: "low" | "medium" | "high";
          status?: "draft" | "pending" | "approved" | "rejected";
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
