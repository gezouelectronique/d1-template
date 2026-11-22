-- Migration number: 0002 	 2026-11-22T00:00:00.000Z
-- Boutique de produits digitaux : commandes, prospects (leads), événements.
DROP TABLE IF EXISTS comments;

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY NOT NULL,              -- identifiant de transaction (envoyé à CinetPay)
    product_slug TEXT NOT NULL,
    amount INTEGER NOT NULL,                   -- en FCFA
    currency TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    status TEXT NOT NULL DEFAULT 'pending',    -- pending | paid | failed
    download_token TEXT UNIQUE,
    download_count INTEGER NOT NULL DEFAULT 0,
    source TEXT,                               -- facebook | whatsapp | linkedin | ...
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    paid_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, paid_at);

CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    source TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
