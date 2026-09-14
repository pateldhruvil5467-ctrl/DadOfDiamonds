// Operational threshold, not a database property — a product's row in Postgres has no concept
// of "low stock." This number is a store-operations judgment call (currently: flag anything at
// or below 5 units, based on the store's actual stock spread at the time this was chosen) and
// is expected to be tuned by whoever runs the store, not derived from the schema.
export const LOW_STOCK_THRESHOLD = 5;

// The storefront is single-currency by design (see PLAN.md). Admin product create/edit always
// writes this value server-side — currency is never a client-selectable field, so there is no
// path for an admin (or a tampered request) to create a product in a different currency.
export const PRODUCT_CURRENCY = "EUR";

// Sane upper bound on images per product — prevents a pathological payload, not a real business
// constraint.
export const MAX_PRODUCT_IMAGES = 20;
