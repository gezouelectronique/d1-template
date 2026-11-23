#!/usr/bin/env bash
# Installation / mise à jour automatique sur un VPS Ubuntu ou Debian.
# Usage (sur le VPS, en root) :  bash install.sh mondomaine.com [email@exemple.com]
set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-}"
APP_DIR=/opt/carriere-humanitaire
APP_USER=carriere
SRC="$(cd "$(dirname "$0")" && pwd)"

if [[ -z "$DOMAIN" ]]; then echo "Usage : bash install.sh mondomaine.com [email]"; exit 1; fi
if [[ $EUID -ne 0 ]]; then echo "Lancez ce script en root (ou avec sudo)."; exit 1; fi

echo "==> 1/6 Paquets système (nginx, certbot, sqlite3)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx curl ca-certificates sqlite3

echo "==> 2/6 Node.js 22"
if ! command -v node >/dev/null || [[ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node --version

echo "==> 3/6 Fichiers de l'application dans $APP_DIR"
id "$APP_USER" >/dev/null 2>&1 || useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin "$APP_USER"
mkdir -p "$APP_DIR/data" "$APP_DIR/backups"
rm -rf "$APP_DIR/dist" "$APP_DIR/migrations" "$APP_DIR/public"
cp -r "$SRC/dist" "$SRC/migrations" "$SRC/public" "$APP_DIR/"
if [[ ! -f "$APP_DIR/.env" ]]; then
  cp "$SRC/configuration.env" "$APP_DIR/.env"
  sed -i "s|^SITE_URL=.*|SITE_URL=https://$DOMAIN|" "$APP_DIR/.env"
  echo "   Fichier de configuration créé : $APP_DIR/.env"
else
  echo "   Configuration existante conservée : $APP_DIR/.env"
fi
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chmod 600 "$APP_DIR/.env"

echo "==> 4/6 Service systemd (démarrage automatique)"
cat > /etc/systemd/system/carriere-humanitaire.service <<UNIT
[Unit]
Description=Carriere Humanitaire au Niger - boutique en ligne
After=network.target

[Service]
User=$APP_USER
WorkingDirectory=$APP_DIR
Environment=APP_DIR=$APP_DIR
Environment=PORT=3000
EnvironmentFile=$APP_DIR/.env
ExecStart=/usr/bin/node --no-warnings $APP_DIR/dist/server.mjs
Restart=always
RestartSec=3
NoNewPrivileges=true
ProtectSystem=full
ReadWritePaths=$APP_DIR/data

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable carriere-humanitaire >/dev/null
systemctl restart carriere-humanitaire

echo "==> 5/6 Nginx pour $DOMAIN"
cat > /etc/nginx/sites-available/carriere-humanitaire <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    client_max_body_size 1m;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/carriere-humanitaire /etc/nginx/sites-enabled/carriere-humanitaire
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
if command -v ufw >/dev/null && ufw status | grep -q active; then ufw allow 'Nginx Full' || true; fi

echo "==> 6/6 Certificat HTTPS (Let's Encrypt)"
if [[ -n "$EMAIL" ]]; then MAIL_OPT=(-m "$EMAIL"); else MAIL_OPT=(--register-unsafely-without-email); fi
if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --redirect "${MAIL_OPT[@]}"; then
  echo "   HTTPS activé."
else
  echo "   ⚠️  HTTPS non activé : vérifiez que $DOMAIN et www.$DOMAIN pointent vers l'IP de ce VPS (enregistrements DNS A),"
  echo "      puis relancez :  certbot --nginx -d $DOMAIN -d www.$DOMAIN --redirect"
fi

# Sauvegarde quotidienne de la base (14 jours conservés)
cat > /etc/cron.daily/carriere-humanitaire-backup <<CRON
#!/bin/sh
sqlite3 $APP_DIR/data/boutique.sqlite ".backup '$APP_DIR/backups/boutique-\$(date +%F).sqlite'"
find $APP_DIR/backups -name '*.sqlite' -mtime +14 -delete
CRON
chmod +x /etc/cron.daily/carriere-humanitaire-backup

sleep 2
if curl -fsS -o /dev/null http://127.0.0.1:3000/; then
  echo ""
  echo "✅ Site installé : https://$DOMAIN"
  echo "   Tableau de bord : https://$DOMAIN/admin"
  echo "   Configuration   : nano $APP_DIR/.env   puis   systemctl restart carriere-humanitaire"
else
  echo "❌ Le site ne répond pas. Journal : journalctl -u carriere-humanitaire -n 50"
  exit 1
fi
