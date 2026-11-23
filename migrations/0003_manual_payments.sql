-- Migration number: 0003 	 2026-11-23T00:00:00.000Z
-- Paiement manuel : le client envoie l'argent (Wave, MyNita, Amanata, Airtel Money…)
-- puis saisit la référence de transaction ; l'administrateur valide la commande dans /admin.
ALTER TABLE orders ADD COLUMN provider TEXT NOT NULL DEFAULT 'cinetpay'; -- cinetpay | manual
ALTER TABLE orders ADD COLUMN payment_method TEXT;                       -- ex : Wave, MyNita
ALTER TABLE orders ADD COLUMN payment_reference TEXT;                    -- référence saisie par le client
ALTER TABLE orders ADD COLUMN reference_at TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_provider ON orders(provider, status);
-- Une même référence ne peut pas servir à deux commandes.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_reference ON orders(payment_method, payment_reference);
