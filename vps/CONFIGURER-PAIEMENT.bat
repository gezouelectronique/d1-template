@echo off
chcp 65001 >nul
title Configurer les paiements - Carriere Humanitaire au Niger
setlocal
set IP=162.35.180.79
set TMPF=%TEMP%\carriere-config.txt

echo ==========================================================
echo   CONFIGURER LES PAIEMENTS : NITA, AMANA, WAVE
echo ==========================================================
echo.
echo Appuyez sur Entree pour garder la valeur proposee entre crochets.
echo Laissez vide ce que vous n'avez pas.
echo.
set "NITA=+22796464949"
set "AMANA=+22796464949"
set "WAVE="
set "HOLDER=Jakfar Elhadji Yacoubou"
set "WA=22796464949"
set /p "NITA=Numero Nita   [%NITA%] : "
set /p "AMANA=Numero Amana  [%AMANA%] : "
set /p "WAVE=Numero Wave (ex +22790000000) : "
set /p "HOLDER=Nom du titulaire des comptes [%HOLDER%] : "
set /p "WA=WhatsApp de contact, sans + [%WA%] : "

set "METHODS=Nita ou Amana"
if not "%WAVE%"=="" set "METHODS=Nita, Amana ou Wave"

> "%TMPF%" echo MANUAL_PAYMENT_ACCOUNTS=Nita=%NITA%; Amana=%AMANA%; Wave=%WAVE%
>> "%TMPF%" echo MANUAL_PAYMENT_HOLDER=%HOLDER%
>> "%TMPF%" echo PAYMENT_METHODS=%METHODS%
>> "%TMPF%" echo SUPPORT_WHATSAPP=%WA%
echo.

if not exist "site\configurer.sh" (
  echo [ERREUR] Fichier site\configurer.sh introuvable. Placez ce .bat dans le dossier CARRIERE HUMANITAIRE NIGER.
  goto fin
)
echo Le mot de passe root sera demande 2 fois (il ne s'affiche pas).
echo [1/2] Envoi de l'outil de configuration...
scp -o StrictHostKeyChecking=accept-new "site\configurer.sh" root@%IP%:/opt/carriere-humanitaire/configurer.sh
if errorlevel 1 (
  echo [ERREUR] Envoi impossible. Faites une capture et envoyez-la a Claude.
  goto fin
)
echo [2/2] Enregistrement de la configuration...
ssh root@%IP% "sed -i 's/\r$//' /opt/carriere-humanitaire/configurer.sh && bash /opt/carriere-humanitaire/configurer.sh" < "%TMPF%"
if errorlevel 1 (
  echo.
  echo [ERREUR] La configuration n'a pas abouti. Faites une capture de cette fenetre et envoyez-la a Claude.
) else (
  echo.
  echo ==========================================================
  echo   C'EST FAIT. Verifiez la page de paiement du site.
  echo ==========================================================
  start "" "https://carrierehumanitaireniger.org/produit/pack-cv"
)

:fin
del "%TMPF%" >nul 2>&1
echo.
pause
