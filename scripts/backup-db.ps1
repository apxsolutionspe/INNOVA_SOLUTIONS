param(
  [string]$ContainerName = "innova-postgres-dev",
  [string]$Database = "innova_solutions",
  [string]$User = "techcenter_user",
  [string]$OutputDir = "scripts/backups"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker no esta disponible en PATH."
}

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Force $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = Join-Path $OutputDir "$Database-$timestamp.sql"

docker exec $ContainerName pg_dump -U $User -d $Database --clean --if-exists | Out-File -FilePath $backupFile -Encoding utf8

Write-Host "Backup creado: $backupFile"
