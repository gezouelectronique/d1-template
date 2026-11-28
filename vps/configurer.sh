#!/usr/bin/env bash
# Enregistre des réglages "NOM=valeur" (lus sur l'entrée standard, un par ligne) dans le .env
# du site, puis redémarre le site. Appelé par CONFIGURER-PAIEMENT.bat.
F="${ENV_FILE:-/opt/carriere-humanitaire/.env}"
ALLOWED=" CINETPAY_API_KEY CINETPAY_SITE_ID SUPPORT_WHATSAPP MANUAL_PAYMENT_ACCOUNTS MANUAL_PAYMENT_HOLDER PAYMENT_METHODS ADMIN_PASSWORD LINKEDIN_URL META_PIXEL_ID "
if [[ ! -f "$F" ]]; then echo "Fichier de configuration introuvable : $F"; exit 1; fi
setv() {
  local tmp; tmp="$(mktemp)"
  grep -v "^$1=" "$F" > "$tmp" || true
  printf '%s=%s\n' "$1" "$2" >> "$tmp"
  cat "$tmp" > "$F"
  rm -f -- "$tmp"
}
while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%$'\r'}"
  [[ "$line" =~ ^([A-Z_]+)=(.*)$ ]] || continue
  key="${BASH_REMATCH[1]}"; val="${BASH_REMATCH[2]}"
  val="${val#"${val%%[![:space:]]*}"}"; val="${val%"${val##*[![:space:]]}"}"
  [[ -z "$val" ]] && continue
  [[ "$ALLOWED" == *" $key "* ]] || { echo "Réglage ignoré : $key"; continue; }
  setv "$key" "$val"
  case "$key" in *KEY*|*PASSWORD*|*SITE_ID*) echo "Enregistré : $key = (masqué)";; *) echo "Enregistré : $key = $val";; esac
done
if [[ -z "${ENV_FILE:-}" ]]; then
  systemctl restart carriere-humanitaire; sleep 3
  systemctl is-active --quiet carriere-humanitaire || { echo "Le site n'a pas redémarré :"; journalctl -u carriere-humanitaire -n 20 --no-pager; exit 1; }
fi
echo OK_CONFIG
