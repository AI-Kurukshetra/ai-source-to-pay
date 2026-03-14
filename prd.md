# Product Requirements Document (PRD)

## Product Name
AI-Powered Source-to-Pay Procurement Platform

## Module (MVP Focus)
Supplier Self Registration (SSR) Portal + RFQ Sourcing

---

# 1. Product Overview

This project builds a modern procurement platform that manages the
complete sourcing workflow from supplier onboarding to supplier
quote submission.

The first phase focuses on the Supplier Self Registration (SSR)
portal where vendors can register themselves and participate in
RFQ sourcing events.

The platform will later expand to full Source-to-Pay functionality
including purchasing, invoicing, and payments.

---

# 2. Goals

Primary goals of this system:

- Digitize supplier onboarding
- Enable self-service supplier registration
- Manage supplier documents and compliance
- Allow procurement teams to approve suppliers
- Run RFQ sourcing events
- Allow suppliers to submit quotes

Long-term goals:

- AI-powered supplier recommendation
- spend analytics
- automated procurement workflows

---

# 3. Target Users

## Supplier (External User)

Suppliers register themselves on the platform and participate in sourcing events.

Capabilities:
- register company profile
- upload company documents
- view RFQ invitations
- submit quotes
- track RFQ status

---

## Procurement Manager / Admin

Internal company user responsible for supplier management and sourcing.

Capabilities:

- review supplier registrations
- approve or reject suppliers
- create RFQ sourcing events
- evaluate supplier responses
- manage supplier database

---

# 4. Core Features

## 4.1 Supplier Self Registration (SSR)

Suppliers can register themselves on the platform.

Information collected:

- company name
- contact person
- email
- phone
- company address
- GST / tax ID
- business type
- product categories
- bank details

Supplier status:

- pending
- approved
- rejected

---

## 4.2 Supplier Document Upload

Suppliers must upload verification documents.

Examples:

- GST certificate
- company registration
- bank proof
- compliance certificates

Documents are stored securely.

---

## 4.3 Supplier Dashboard

After login suppliers can:

- view and edit profile
- upload documents
- check approval status
- view RFQs
- submit quotes

---

## 4.4 Admin Supplier Management

Admins can:

- view supplier registrations
- review documents
- approve or reject suppliers
- manage supplier database

---

## 4.5 RFQ Management

Admins can create RFQ sourcing events.

RFQ fields include:

- title
- description
- product requirements
- quantity
- deadline

Suppliers can:

- view RFQs
- submit quote
- attach message or comments

---

# 5. User Workflows

## Supplier Flow

Register
→ Submit company details
→ Upload documents
→ Wait for approval
→ Login to dashboard
→ View RFQs
→ Submit quote

---

## Admin Flow

Login
→ Review supplier registrations
→ Approve supplier
→ Create RFQ
→ Send RFQ to suppliers
→ Review supplier quotes

---

# 6. Data Model (Core Entities)

users
- id
- email
- role
- created_at

suppliers
- id
- user_id
- company_name
- contact_person
- phone
- address
- gst_number
- approval_status
- created_at

supplier_documents
- id
- supplier_id
- document_type
- file_url
- uploaded_at

rfqs
- id
- title
- description
- created_by
- created_at

rfq_responses
- id
- rfq_id
- supplier_id
- quote_price
- message
- created_at

---

# 7. MVP Scope

Included in MVP:

- authentication
- supplier self registration
- supplier document upload
- supplier dashboard
- admin supplier approval
- RFQ management
- RFQ response submission

Not included in MVP:

- purchase requisition
- purchase orders
- invoice processing
- payment processing
- spend analytics
- AI procurement recommendations

---

# 8. Future Enhancements

Future platform capabilities may include:

- AI supplier recommendation
- predictive procurement analytics
- reverse auctions
- contract management
- invoice automation
- ERP integration
- supplier performance scoring

---

# 9. Tech Stack

Frontend:
- Next.js
- Tailwind CSS
- TypeScript

Backend:
- Supabase (Postgres, Auth, Storage)

Infrastructure:
- Vercel