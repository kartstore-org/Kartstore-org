# KARTSTORE Marketplace — JavaScript Starter Project

A full-stack React + Node/Express + MongoDB marketplace foundation. It includes a customer storefront, guest checkout (cash on delivery), contact-verified order lookup, permanent KARTSTORE IDs, seller onboarding and access, seller-owned product management, XLS/XLSX/CSV bulk imports, product moderation and a basic admin console.

> **Production status:** This is a runnable foundation, not a claim that every marketplace integration in the larger specification is already live. Online payment processing, supplier API fulfillment, carrier webhooks, cloud media storage, detailed returns/refunds, email/SMS provider setup and production hardening still require provider credentials and additional implementation/testing. Online checkout is deliberately disabled until a real payment gateway is configured.

## Requirements
- Node.js 20+
- MongoDB 6+ (local MongoDB or Atlas)
- npm 10+

## Setup

1. Copy `backend/.env.example` to `backend/.env` and configure `MONGODB_URI`, a strong `JWT_SECRET`, admin credentials and delivery providers.
2. For local development, OTPs are printed in the backend terminal when SMTP/Twilio are not configured. This fallback is disabled in production.
3. Install dependencies from the project root:

   ```bash
   npm install
   ```

4. Seed the first administrator:

   ```bash
   npm run seed:admin
   ```

5. Start the API and React app (Webpack development server):

   ```bash
   npm run dev
   ```

   For a production frontend bundle, run `npm run build` from the project root. Webpack writes the compiled frontend to `frontend/dist/`.

6. Open `http://localhost:5173`. The React frontend is bundled by Webpack. API health: `http://localhost:5000/api/v1/health`.

## Main workflows

### Customer
- Browse published products without an account.
- Add products to a local cart and place a COD order.
- Open **Track Order**, enter the exact email or phone used at checkout, verify OTP and retrieve matching purchases.

### Seller
- Register with account type **Seller**. Registration generates a permanent ID such as `KART-2026-000001`.
- Verify both email and phone using OTPs.
- Submit seller application (the initial seller registration is marked pending).
- Admin approves the seller in `/admin`.
- Seller uses **Seller Access** with their KARTSTORE ID plus email OTP, or their existing session.
- Approved sellers can manually add products or upload XLS/XLSX/CSV files. Products are linked to the authenticated seller on the server and remain pending moderation until published by an admin.

### Administrator
- Visit `/admin` and sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD` configured in `backend/.env`.
- Approve/reject seller applications and publish/reject products.

## Spreadsheet format
The CSV template is available in the app and from `GET /api/v1/products/template.csv`. Recognized columns include `Product Name`, `Description`, `Category`, `Brand`, `SKU`, `Cost Price`, `Selling Price`, `Quantity`, and `Image URL`. Column matching is case-insensitive for supported aliases. Invalid rows are reported; successful rows are saved under the authenticated seller and submitted for review.

## Environment configuration
See `backend/.env.example` and `frontend/.env.example`. The Webpack frontend reads `KARTSTORE_API_URL` from `frontend/.env` at build/start time (default: `http://localhost:5000/api/v1`). SMTP is required for production email OTP delivery. Twilio credentials are required for production SMS OTP delivery. Never deploy with the development OTP console fallback or default admin password.

## Security and implementation notes
- Public KARTSTORE IDs are identifiers, not secrets. Seller access always requires OTP verification.
- Product ownership is derived from the authenticated session, not client-supplied seller IDs.
- Customer order history is disclosed only after OTP verification of the purchase-time email or phone.
- Seller product and order queries are scoped to the authenticated seller.
- Admin and seller routes enforce role/status middleware on the backend.
- Use HTTPS, strong secrets, a managed MongoDB deployment, a persistent session strategy, backups, monitoring, malware scanning for uploads, and a reviewed privacy/retention policy before launch.
- This starter's in-memory spreadsheet upload is capped at 8 MB and processes rows synchronously. Large-scale production imports should move to a durable queue/worker and object storage.
- Current payment method is COD only. `online` is intentionally unavailable until Razorpay/PayU order creation, signature verification and signed webhooks are integrated.
- Supplier and affiliate source fields exist, but live CJ/AliExpress/Zendrop/Spocket/DSers/Amazon/ShipBob/ShipMonk API connectors are not yet implemented. Use only official APIs and authorized feeds.

## Project structure

```text
kartstore/
  backend/
    src/config/       MongoDB connection
    src/models/       Mongoose models
    src/middleware/   Authentication and role checks
    src/routes/       Auth, products, orders and admin APIs
    src/services/     OTP delivery
    scripts/          Admin seeding
  frontend/
    webpack.config.cjs  Webpack development and production bundling
    src/utils/          Shared display-formatting helpers (`prettify.js`)
    src/components/   Shared layout/navigation
    src/context/      Session and cart state
    src/pages/        Storefront, seller, customer and admin pages
```

## API overview
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/verify-registration`
- `POST /api/v1/auth/seller-access/request`
- `POST /api/v1/auth/seller-access/verify`
- `GET /api/v1/auth/me`
- `GET /api/v1/products`
- `POST /api/v1/products` (approved seller)
- `POST /api/v1/products/import` (approved seller)
- `GET /api/v1/products/mine` (approved seller)
- `POST /api/v1/orders` (guest checkout, COD)
- `POST /api/v1/orders/lookup/request-otp`
- `POST /api/v1/orders/lookup/verify`
- `GET /api/v1/orders/seller/mine` (approved seller)
- `GET /api/v1/admin/stats` (admin)

## Next production milestones
1. Add a durable queue and import-batch/row collections for large spreadsheet imports.
2. Implement payment provider adapters (Razorpay/PayU), signed webhook verification and refund reconciliation.
3. Implement separate seller suborder records, commission ledger and compliant settlement/payout integration.
4. Implement supplier connector adapters and verified carrier tracking webhooks.
5. Add object storage/image processing, transactional inventory reservation, email templates, audit logs and automated tests.
6. Add deployment manifests, CI/CD, monitoring, security review and privacy/legal review.
