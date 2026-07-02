# Backups de base de datos

Los backups se generan con `pg_dump` dentro del contenedor PostgreSQL.

## Crear backup

```powershell
.\scripts\backup-db.ps1
```

Parametros opcionales:

```powershell
.\scripts\backup-db.ps1 -ContainerName innova-postgres-dev -Database innova_solutions -User techcenter_user
```

Los archivos se guardan en:

```txt
scripts/backups/
```

Los archivos `.sql`, `.dump` y `.backup` dentro de esa carpeta estan ignorados por Git.

## Restaurar backup

```powershell
.\scripts\restore-db.ps1 -BackupFile scripts/backups/innova_solutions-YYYYMMDD-HHMMSS.sql
```

## Recomendacion

- Crear backup diario antes de cerrar operaciones.
- Guardar copias fuera del equipo principal.
- Verificar periodicamente que los backups restauran correctamente.

## Precaucion

Restaurar un backup puede sobrescribir datos actuales. Hacer una copia nueva antes de restaurar.
