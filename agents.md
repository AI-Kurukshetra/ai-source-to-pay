# AI Agent Development Guidelines

This project is an AI-Powered Source-to-Pay Procurement Platform.

The current focus is the **Supplier Self Registration (SSR) portal**.

The AI coding agent must follow these rules when generating code.

---

# Tech Stack

Frontend
- Next.js 14
- TypeScript
- Tailwind CSS

Backend
- Supabase (Postgres, Auth, Storage)

Deployment
- Vercel

---

# Architecture Rules

1. Use **Next.js App Router**.
2. Use **Server Actions** for backend operations.
3. Use **Supabase** as the primary database and authentication provider.
4. Keep UI components **reusable and modular**.
5. Separate business logic from UI components.

Project structure must follow:

## Project Structure

Follow this structure:

app/
  admin/
  supplier/
  login/
  register/

components/
  forms/
  dashboard/
  ui/

lib/
  supabase/

types/

---

# Authentication

Use Supabase Auth.

User roles:

## System Roles

The platform supports two user roles:

Admin
- manages suppliers
- approves registrations
- creates RFQs

Supplier
- registers company
- uploads documents
- responds to RFQs

Routes must be protected based on role.

Example:

Supplier routes:
- /supplier/dashboard
- /supplier/profile

Admin routes:
- /admin/dashboard
- /admin/suppliers

---

# UI Guidelines

Use Tailwind CSS.

Design style:

- modern SaaS dashboard
- responsive layout
- sidebar navigation
- clean forms

Components should be placed in:

components/ui
components/forms
components/dashboard

---

# Database Rules

Use Supabase Postgres.

Main tables:

users
suppliers
supplier_documents
rfqs
rfq_responses

Always create:

- primary keys
- foreign keys
- indexes where needed

---

# Coding Standards

Use:

- TypeScript
- functional React components
- strict typing
- async/await

Avoid:

- inline business logic in components
- large monolithic files

Prefer:

small reusable components.

---

# Forms

Use:

React Hook Form
Zod validation

Forms must include:

- validation
- loading state
- error messages

---

# Security

Always verify user role before performing actions.

Example:

Only admins can:

- approve suppliers
- create RFQs

Suppliers can:

- submit quotes
- update profile
- upload documents

---

# Feature Development Order

The AI agent should implement features in this order:

1. Supabase setup
2. Authentication
3. Supplier registration
4. Supplier dashboard
5. Document upload
6. Admin supplier approval
7. RFQ management
8. RFQ responses

---

# Code Quality

Code must include:

- comments
- TypeScript types
- error handling
- loading states

Avoid generating placeholder code unless necessary.

---

# Context

Refer to `prd.md` for product requirements.