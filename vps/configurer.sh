#!/usr/bin/env bash
# Met à jour les identifiants CinetPay et le WhatsApp de contact (lus sur l'entrée standard),
# puis redémarre le site. Appelé par CONFIGURER-PAIEMENT.bat.
F="${ENV_FILE:-/opt/carriere-humanitaire/.env}"
read -r K; read -r S; read -r W
K="${K%$'\r'}"; S="${S%$'\r'}"; W="${W%$'\r'}"
K="${K//[[:space:]]/}"; S="${S//[[:space:]]/}"; W="${W//[^0-9]/}"
if [[ ! -f "$F" ]]; then echo "Fichier de configuration introuvable : $F"; exit 1; fi
setv() {
  local tmp; tmp="$(mktemp)"
  grep -v "^$1=" "$F" > "$tmp" || true
  printf '%s=%s\n' "$1" "$2" >> "$tmp"
  cat "$tmp" > "$F"
  rm -f -- "$tmp"
}
[[ -n "$K" ]] && setv CINETPAY_API_KEY "$K" && echo "Clé CinetPay enregistrée."
[[ -n "$S" ]] && setv CINETPAY_SITE_ID "$S" && echo "Site ID CinetPay enregistré."
[[ -n "$W" ]] && setv SUPPORT_WHATSAPP "$W" && echo "WhatsApp de contact enregistré : $W"
if [[ -z "${ENV_FILE:-}" ]]; then
  systemctl restart carriere-humanitaire; sleep 3
  systemctl is-active --quiet carriere-humanitaire || { echo "Le site n'a pas redémarré :"; journalctl -u carriere-humanitaire -n 20 --no-pager; exit 1; }
fi
echo OK_CONFIG
