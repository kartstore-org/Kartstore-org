# Production Readiness Checklist

The repository implements the initial end-to-end marketplace foundation. Complete and verify the following before accepting real customer payments or operating at scale.

- [ ] Configure production SMTP and Twilio credentials; test delivery, retry, abuse controls and sender/domain reputation.
- [ ] Move session state to a revocable persistent store and configure HTTPS, secure cookies, CSRF protection and strict origin policies.
- [ ] Add a transactional inventory reservation strategy and automated stock-release/expiry handling.
- [ ] Add a durable import queue, import batch/row records, resumable jobs and object storage for large files.
- [ ] Add file malware scanning, robust content-type inspection, formula-safe exports and spreadsheet size/row limits.
- [ ] Complete seller suborders, seller-scoped financial ledger, commission rules, payout settlement and reconciliation.
- [ ] Integrate Razorpay/PayU with server-created payment orders, signature validation, signed webhooks, idempotency and refund handling.
- [ ] Implement and certify each supplier connector against official APIs; keep credentials encrypted and rotate them.
- [ ] Implement affiliate feed adapters and required disclosures/attribution.
- [ ] Add carrier integrations, webhook signature validation and real tracking-event normalization.
- [ ] Add product image upload/storage, transformations, moderation and CDN delivery.
- [ ] Add automated unit, API integration, browser, concurrency and authorization tests.
- [ ] Add structured logs, error monitoring, metrics, alerting, backups and tested restore procedures.
- [ ] Review Indian consumer, tax, privacy, marketplace, payments and seller KYC obligations with qualified professionals.
