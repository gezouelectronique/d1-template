@echo off
chcp 65001 >nul
title Installation - Carriere Humanitaire au Niger
setlocal
set IP=162.35.180.79
set DOMAINE=carrierehumanitaireniger.org
cd /d "%~dp0"

echo ==========================================================
echo   INSTALLATION DU SITE SUR LE VPS
echo   Serveur : %IP%     Domaine : %DOMAINE%
echo ==========================================================
echo.
echo Le mot de passe root vous sera demande 3 fois.
echo Il ne s'affiche PAS quand vous tapez : c'est normal.
echo Tapez-le puis appuyez sur Entree.
echo.

where ssh >nul 2>&1
if errorlevel 1 (
  echo [ERREUR] OpenSSH n'est pas installe sur ce PC.
  echo Parametres Windows ^> Applications ^> Fonctionnalites facultatives ^> Ajouter ^> "Client OpenSSH".
  goto fin
)
if not exist "site\install.sh" (
  echo [ERREUR] Le dossier "site" est introuvable. Placez ce fichier dans le dossier CARRIERE HUMANITAIRE NIGER.
  goto fin
)

echo [1/3] Preparation du serveur...
ssh -o StrictHostKeyChecking=accept-new root@%IP% "rm -rf ~/carriere-site"
if errorlevel 1 goto erreur

echo.
echo [2/3] Envoi des fichiers...
scp -o StrictHostKeyChecking=accept-new -r site root@%IP%:carriere-site
if errorlevel 1 goto erreur

echo.
echo [3/3] Installation (environ 5 minutes)...
ssh -t root@%IP% "sed -i 's/\r$//' ~/carriere-site/install.sh ~/carriere-site/configuration.env && bash ~/carriere-site/install.sh %DOMAINE%"
if errorlevel 1 goto erreur

echo.
echo ==========================================================
echo   TERMINE ! Le site est en ligne : https://%DOMAINE%
echo ==========================================================
start "" "https://%DOMAINE%"
goto fin

:erreur
echo.
echo [ERREUR] L'installation s'est arretee. Faites une capture d'ecran de cette fenetre
echo et envoyez-la a Claude.

:fin
echo.
pause
