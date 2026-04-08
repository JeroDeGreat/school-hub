@echo off
setlocal

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\preview-school-hub.ps1"

if errorlevel 1 (
  echo.
  echo School Hub preview could not start.
  pause
)
