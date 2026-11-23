#!/usr/bin/env bash
# Envoi du site sur le VPS depuis Mac ou Linux :
#   bash envoyer-sur-vps.sh 1.2.3.4 mondomaine.com [email]
set -euo pipefail
IP="$1"; DOMAIN="$2"; EMAIL="${3:-}"; USER_SSH="${VPS_USER:-root}"
HERE="$(cd "$(dirname "$0")" && pwd)"
ssh "$USER_SSH@$IP" "rm -rf ~/carriere-site && mkdir -p ~/carriere-site"
scp -r "$HERE/site/." "$USER_SSH@$IP:carriere-site/"
ssh -t "$USER_SSH@$IP" "sudo bash ~/carriere-site/install.sh $DOMAIN $EMAIL"
