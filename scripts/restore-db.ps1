param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [string]$ContainerName = "innova-postgres-dev",
  [string]$Database = "innova_solutions",
  [string]$User = "techcenter_user"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker no esta disponible en PATH."
}

if (-not (Test-Path $BackupFile)) {
  throw "No existe el archivo de backup: $BackupFile"
}

Get-Content -Raw $BackupFile | docker exec -i $ContainerName psql -U $User -d $Database

Write-Host "Base de datos restaurada desde: $BackupFile"
