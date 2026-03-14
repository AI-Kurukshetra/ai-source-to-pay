# Skills Configuration

This document defines the technologies and patterns used in this project.

## Tech Stack

Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

Backend
- Supabase
- Supabase Auth
- Supabase Postgres Database
- Supabase Storage

Forms
- React Hook Form
- Zod validation

State Management
- React hooks
- Server actions

---

## UI Design

Use Tailwind CSS for styling.

Design rules:

- responsive layouts
- modern SaaS dashboard UI
- cards and tables for data display
- sidebar navigation for dashboards

---

## Database

Database is managed using Supabase.

Tables include:

- users
- suppliers
- supplier_documents
- rfqs
- rfq_responses

Use foreign keys for relationships.

---

## Authentication

Authentication is implemented using Supabase Auth.

User roles:

- admin
- supplier

Sessions must be validated on server side.

---

## File Storage

Documents are uploaded using Supabase Storage.

Supported supplier documents:

- GST certificate
- company registration
- bank proof

---

## API Design

Use Next.js server actions when possible.

Use API routes only when necessary.

---

## Code Quality

Rules:

- use TypeScript everywhere
- keep components reusable
- separate UI components from business logic
- avoid large files

---

## Folder Structure

app/
components/
lib/
types/

Example:

app/supplier
app/admin
components/forms
components/ui
lib/supabase

---

## Security

- enforce role based access
- protect admin routes
- validate form inputs
- sanitize file uploads

---

## Development Principles

- implement features in small steps
- write reusable components
- prefer simple solutions