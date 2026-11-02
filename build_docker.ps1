# =============================================================================
# build_docker.ps1 - Construccion MANUAL de imagenes Docker
# =============================================================================
# Este script construye las 4 imagenes Docker desde los Dockerfiles locales.
# DEBE ejecutarse ANTES del pipeline Snakemake.
# Las imagenes se construyen localmente, NO se descargan de registros externos.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File build_docker.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CONSTRUCCION MANUAL DE IMAGENES DOCKER                    " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
try {
    docker info 2>&1 | Out-Null
    Write-Host "  [OK] Docker daemon activo" -ForegroundColor Green
} catch {
    Write-Host "  [X] Docker daemon no esta corriendo. Abre Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Construyendo imagenes desde Dockerfiles locales..." -ForegroundColor Yellow
Write-Host "(NO se descargan imagenes pre-construidas de registros externos)" -ForegroundColor Cyan
Write-Host ""

$languages = @("cpp", "go", "java", "python")

foreach ($lang in $languages) {
    Write-Host "  Construyendo matrix-$lang desde implementations/$lang/Dockerfile..." -ForegroundColor White
    docker build -t "matrix-$lang" "implementations/$lang/"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [X] Error construyendo matrix-$lang" -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] matrix-$lang construida" -ForegroundColor Green
}

Write-Host ""
Write-Host "Imagenes construidas:" -ForegroundColor Yellow
docker images --format "  {{.Repository}}:{{.Tag}} ({{.Size}})" | Select-String "matrix-"
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  LISTO - Ahora ejecute el pipeline:" -ForegroundColor Green
Write-Host "    snakemake --cores 1 --forceall" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
