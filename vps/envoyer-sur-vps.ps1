# Envoi du site sur le VPS depuis Windows (PowerShell).
# Clic droit sur ce fichier > « Exécuter avec PowerShell », ou dans PowerShell :
#   .\envoyer-sur-vps.ps1 -IP 1.2.3.4 -Domaine mondomaine.com
param(
  [Parameter(Mandatory=$true)][string]$IP,
  [Parameter(Mandatory=$true)][string]$Domaine,
  [string]$Utilisateur = "root",
  [string]$Email = ""
)
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$site = Join-Path $here "site"
Write-Host "Envoi des fichiers vers $Utilisateur@$IP ..." -ForegroundColor Cyan
ssh "$Utilisateur@$IP" "rm -rf ~/carriere-site && mkdir -p ~/carriere-site"
scp -r "$site\*" "${Utilisateur}@${IP}:carriere-site/"
Write-Host "Installation sur le serveur ..." -ForegroundColor Cyan
ssh -t "$Utilisateur@$IP" "sed -i 's/\r`$//' ~/carriere-site/install.sh ~/carriere-site/configuration.env && sudo bash ~/carriere-site/install.sh $Domaine $Email"
Write-Host "Terminé." -ForegroundColor Green
Read-Host "Appuyez sur Entrée pour fermer"
