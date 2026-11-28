@echo off
chcp 65001 >nul
title Activer le paiement - Carriere Humanitaire au Niger
setlocal
set IP=162.35.180.79
set TMPF=%TEMP%\carriere-config.txt

echo ==========================================================
echo   ACTIVER LE PAIEMENT ET LE CONTACT WHATSAPP
echo ==========================================================
echo.
echo Les identifiants CinetPay se trouvent dans votre tableau de bord
echo CinetPay, rubrique "Integration".
echo Laissez vide (appuyez juste sur Entree) ce que vous n'avez pas encore.
echo.
set "K="
set "S="
set "W="
set /p "K=CinetPay API KEY  : "
set /p "S=CinetPay SITE ID  : "
set /p "W=Votre numero WhatsApp de contact (ex 22790000000, sans +) : "
echo.

> "%TMPF%" echo(%K%
>> "%TMPF%" echo(%S%
>> "%TMPF%" echo(%W%

if not exist "site\configurer.sh" (
  echo [ERREUR] Fichier site\configurer.sh introuvable. Placez ce .bat dans le dossier CARRIERE HUMANITAIRE NIGER.
  goto fin
)
echo Le mot de passe root sera demande 2 fois (il ne s'affiche pas).
echo [1/2] Envoi de l'outil de configuration...
scp -o StrictHostKeyChecking=accept-new "site\configurer.sh" root@%IP%:/opt/carriere-humanitaire/configurer.sh
if errorlevel 1 (
  echo [ERREUR] Envoi impossible. Faites une capture et envoyez-la a Claude.
  del "%TMPF%" >nul 2>&1
  goto fin
)
echo [2/2] Enregistrement de la configuration...
ssh root@%IP% "sed -i 's/\r$//' /opt/carriere-humanitaire/configurer.sh && bash /opt/carriere-humanitaire/configurer.sh" < "%TMPF%"
set RC=%ERRORLEVEL%
del "%TMPF%" >nul 2>&1
if not "%RC%"=="0" (
  echo.
  echo [ERREUR] La configuration n'a pas abouti. Faites une capture de cette fenetre et envoyez-la a Claude.
) else (
  echo.
  echo ==========================================================
  echo   C'EST FAIT. Testez maintenant un achat sur le site.
  echo ==========================================================
  start "" "https://carrierehumanitaireniger.org/produit/pack-cv"
)
goto fin_ok
:fin
del "%TMPF%" >nul 2>&1
:fin_ok
echo.
pause
