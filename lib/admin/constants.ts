// Operational threshold, not a database property — a product's row in Postgres has no concept
// of "low stock." This number is a store-operations judgment call (currently: flag anything at
// or below 5 units, based on the store's actual stock spread at the time this was chosen) and
// is expected to be tuned by whoever runs the store, not derived from the schema.
export const LOW_STOCK_THRESHOLD = 5;
