@echo off
chcp 65001 >nul
title ViveRioja Experience — Guardar y publicar

echo ============================================
echo   ViveRioja Experience — Guardar cambios
echo ============================================
echo.

:: Verificar que estamos en el directorio correcto
if not exist "index.html" (
    echo [ERROR] No se encontro index.html en este directorio.
    echo         Asegurate de ejecutar este archivo desde la carpeta del proyecto.
    echo.
    pause
    exit /b 1
)

:: Verificar que git está disponible
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git no esta instalado o no esta en el PATH.
    echo         Descarga Git desde https://git-scm.com
    echo.
    pause
    exit /b 1
)

:: Generar mensaje de commit con fecha y hora
for /f "tokens=1-5 delims=/ " %%a in ('date /t') do set FECHA=%%c-%%b-%%a
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set HORA=%%a:%%b
set MENSAJE=Actualizacion automatica - %FECHA% %HORA%

echo [1/4] Comprobando estado del repositorio...
git status
echo.

echo [2/4] Añadiendo todos los archivos...
git add .
if errorlevel 1 (
    echo [ERROR] Fallo al añadir archivos.
    pause
    exit /b 1
)
echo       OK
echo.

echo [3/4] Creando commit: "%MENSAJE%"
git commit -m "%MENSAJE%"
if errorlevel 1 (
    echo [AVISO] No hay cambios nuevos que confirmar, o hubo un error en el commit.
    echo         Puede que ya este todo guardado.
    echo.
    pause
    exit /b 0
)
echo       OK
echo.

echo [4/4] Publicando en GitHub (rama master)...
git push origin master
if errorlevel 1 (
    echo [ERROR] Fallo al publicar en GitHub.
    echo         Comprueba tu conexion a internet y que el repositorio remoto este configurado.
    echo         Ejecuta: git remote -v
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   EXITO - Cambios publicados correctamente
echo   URL: https://looperjajo.github.io/viverioja-experience
echo ============================================
echo.
echo Puedes cerrar esta ventana o presionar cualquier tecla.
pause
