**NDIS CARE DASHBOARD**

Product Requirements Document

_All-in-one web management system for small NDIS providers in Australia_

Clients | Staff | Rostering | Billing | Compliance | Shift Notes

| **Version**      | 1.0 - Initial Release                                          |
| ---------------- | -------------------------------------------------------------- |
| **Date**         | May 2026                                                       |
| **Status**       | Draft - For Internal Review                                    |
| **Stack**        | Next.js 14 + Supabase (PostgreSQL) + Tailwind CSS + Netlify    |
| **Target Users** | Small NDIS providers, directors, coordinators, support workers |

# **1\. Executive Summary**

Small NDIS providers in Australia currently rely on a fragmented mix of Excel spreadsheets, paper-based timesheets, and disconnected apps to manage their operations. This PRD defines the full product requirements for NDIS Care Dashboard - an in-house web application purpose-built for small NDIS providers to replace that fragmented workflow with a single, compliance-ready system.

The system is modelled on the capabilities of market leaders such as ShiftCare, FlowLogic, Lumary, and Imploy, enriched with features specific to the needs of small operators - including ABN-based staff invoicing, NDIA-managed claim output, plan-managed client invoicing, and real-time shift start/end via a mobile web app for support workers.

## **1.1 Problems Being Solved**

- Time-consuming manual invoice creation from spreadsheets each fortnight
- No centralised participant or staff record - documents scattered across email and files
- No compliance tracking - staff certificates and ID documents expire without warning
- No digital shift notes - workers write on paper or send WhatsApp messages
- No single source of truth for rosters - coordinator and worker operate from different lists
- No integrated NDIS price guide lookup - rates must be manually verified
- Client billing separated from service delivery data - double-entry errors are common

## **1.2 Market Context**

Competing platforms (ShiftCare from ~$9/user/month, FlowLogic, Lumary, Imploy) offer comprehensive NDIS management but are priced for medium-to-large providers and carry significant per-user fees. Small providers running 3-20 staff find themselves over-paying for features they don't use. An in-house build on Supabase + Next.js delivers equivalent core functionality with full data ownership, zero per-user fees at scale, and the ability to tailor every feature to the provider's exact workflow.

## **1.3 Key Differentiators vs. Market**

| **Feature**                 | **Market Platforms** | **NDIS Care Dashboard**                             |
| --------------------------- | -------------------- | --------------------------------------------------- |
| Per-user cost               | $9-$27/user/month    | Zero (self-hosted on Netlify + Supabase free tier)  |
| ABN staff invoicing         | Partial / workaround | Native - staff generate their own invoice PDF       |
| NDIA claim output (bulk)    | Yes (higher tiers)   | Yes - bulk payment request CSV for NDIS portal      |
| Plan-managed client invoice | Yes                  | Yes - line-item PDF with NDIS codes                 |
| NDIS price guide sync       | Manual update        | Automated download from ndis.gov.au XLSX            |
| Staff mobile shift app      | Native mobile app    | PWA (progressive web app) - no install needed       |
| Data sovereignty            | Vendor cloud         | Your Supabase project - full ownership              |

# **2\. System Architecture**

## **2.1 Technology Stack**

| **Layer**           | **Technology**                      | **Rationale**                                                       |
| ------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| Frontend            | Next.js 14 (App Router)             | Server components, file-based routing, built-in API routes          |
| Styling             | Tailwind CSS + shadcn/ui            | Rapid development, accessible components                            |
| Database            | Supabase (PostgreSQL)               | Row-level security, real-time subscriptions, built-in auth, storage |
| Auth                | Supabase Auth                       | Email/password, role-based access control via RLS policies          |
| File Storage        | Supabase Storage                    | Compliance documents, profile photos, signed URLs                   |
| PDF Generation      | react-pdf / @react-pdf/renderer     | Dynamic invoice and payslip PDFs rendered server-side               |
| Hosting             | Netlify                             | Next.js deployment                                                  |
| Email/Notifications | Resend + React Email                | Transactional emails, compliance reminders                          |
| NDIS Catalogue Sync | Scheduled Netlify Cron + xlsx parser| Weekly fetch + parse of ndis.gov.au support catalogue XLSX          |
| Timezone            | Australia/Sydney (AEDT/AEST)        | All timestamps stored in UTC, displayed in local time               |
