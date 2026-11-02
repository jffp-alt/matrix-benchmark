# =============================================================================
# run_experiment.ps1 - Semana 4: Automatizacion y analisis estadistico
# =============================================================================
# Script de demostracion que ejecuta el flujo completo del experimento:
#   1. Verifica que las imagenes Docker fueron construidas (con build_docker.ps1)
#   2. Instala dependencias de analisis (Python)
#   3. Limpia resultados previos para garantizar ejecucion completa
#   4. Ejecuta el pipeline Snakemake con --forceall (benchmark + analisis)
#   5. Verifica que todos los artefactos fueron generados
#
# Uso:
#   cd D:\ruta\matrix-benchmark
#   powershell -ExecutionPolicy Bypass -File run_experiment.ps1
#
# Prerequisitos:
#   - Docker Desktop instalado y corriendo
#   - Snakemake (pip install snakemake)
#   - Python >= 3.10
#
# Nota: La ejecucion completa puede tomar mas de 1 hora.
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  BENCHMARK REPRODUCIBLE - MULTIPLICACION DE MATRICES NxN   " -ForegroundColor Cyan
Write-Host "  Semana 4: Automatizacion y analisis estadistico           " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------
# Paso 0: Verificar prerequisitos
# ---------------------------------------------------------
Write-Host "[Paso 0] Verificando prerequisitos..." -ForegroundColor Yellow

$missing = $false

# Docker
try {
    $dockerVer = docker --version 2>&1
    Write-Host "  [OK] $dockerVer" -ForegroundColor Green
} catch {
    Write-Host "  [X] Docker no encontrado" -ForegroundColor Red
    $missing = $true
}

# Docker daemon
try {
    docker info 2>&1 | Out-Null
    Write-Host "  [OK] Docker daemon activo" -ForegroundColor Green
} catch {
    Write-Host "  [X] Docker daemon no esta corriendo. Abre Docker Desktop." -ForegroundColor Red
    $missing = $true
}

# Python
try {
    $pythonVer = python --version 2>&1
    Write-Host "  [OK] $pythonVer" -ForegroundColor Green
} catch {
    Write-Host "  [X] Python no encontrado" -ForegroundColor Red
    $missing = $true
}

# Snakemake
try {
    $smkVer = snakemake --version 2>&1
    Write-Host "  [OK] Snakemake $smkVer" -ForegroundColor Green
} catch {
    Write-Host "  [X] Snakemake no encontrado. Ejecuta: pip install snakemake" -ForegroundColor Red
    $missing = $true
}

if ($missing) {
    Write-Host ""
    Write-Host "Faltan prerequisitos. Instalalos antes de continuar." -ForegroundColor Red
    exit 1
}

Write-Host ""

# ---------------------------------------------------------
# Paso 1: Verificar que las imagenes Docker fueron construidas manualmente
# ---------------------------------------------------------
Write-Host "[Paso 1] Verificando imagenes Docker (deben construirse previamente con build_docker.ps1)..." -ForegroundColor Yellow

$languages = @("cpp", "go", "java", "python")
$missingImages = @()

foreach ($lang in $languages) {
    $imgExists = docker images --format "{{.Repository}}" | Select-String "^matrix-$lang$"
    if ($imgExists) {
        Write-Host "  [OK] matrix-$lang encontrada" -ForegroundColor Green
    } else {
        Write-Host "  [X] matrix-$lang NO encontrada" -ForegroundColor Red
        $missingImages += $lang
    }
}

if ($missingImages.Count -gt 0) {
    Write-Host ""
    Write-Host "  Faltan imagenes Docker. Construyalas primero:" -ForegroundColor Red
    Write-Host "    powershell -ExecutionPolicy Bypass -File build_docker.ps1" -ForegroundColor White
    exit 1
}

Write-Host ""

# ---------------------------------------------------------
# Paso 2: Instalar dependencias de analisis
# ---------------------------------------------------------
Write-Host "[Paso 2] Instalando dependencias de analisis..." -ForegroundColor Yellow
pip install -q -r analysis/requirements.txt
Write-Host "  [OK] Dependencias instaladas" -ForegroundColor Green
Write-Host ""

# ---------------------------------------------------------
# Paso 3: Limpiar resultados previos
# ---------------------------------------------------------
Write-Host "[Paso 3] Limpiando resultados previos..." -ForegroundColor Yellow

$generatedFiles = @(
    "results/benchmark.csv",
    "results/cpp.csv",
    "results/go.csv",
    "results/java.csv",
    "results/python.csv",
    "results/descriptive_stats.csv",
    "results/anova_results.txt",
    "results/tukey_results.txt",
    "results/boxplot_by_language.png",
    "results/interaction_plot.png",
    "results/bar_chart_comparison.png",
    "results/boxplot_comparison.png",
    "results/heatmap_times.png",
    "results/speedup_chart.png",
    "results/interaction_chart.png"
)

$cleaned = 0
foreach ($f in $generatedFiles) {
    if (Test-Path $f) {
        Remove-Item $f -Force
        $cleaned++
    }
}

# Limpiar archivos temporales
Get-ChildItem -Path "results" -Filter "*_N*.csv" -ErrorAction SilentlyContinue | Remove-Item -Force

Write-Host "  [OK] $cleaned archivos eliminados" -ForegroundColor Green

if (-not (Test-Path "results")) {
    New-Item -ItemType Directory -Path "results" | Out-Null
}

Write-Host ""

# ---------------------------------------------------------
# Paso 4: Ejecutar pipeline Snakemake
# ---------------------------------------------------------
Write-Host "[Paso 4] Ejecutando pipeline Snakemake..." -ForegroundColor Yellow
Write-Host "  Diseno experimental: 4 lenguajes x 3 tamanos x 10 reps = 120 observaciones" -ForegroundColor Cyan
Write-Host "  Semilla fija: seed=42 (LCG deterministico)" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

snakemake --cores 1 --forceall --printshellcmds

if ($LASTEXITCODE -ne 0) {
    Write-Host "  [X] Snakemake fallo. Revisa los errores arriba." -ForegroundColor Red
    exit 1
}

$elapsed = (Get-Date) - $startTime
$mins = [math]::Floor($elapsed.TotalMinutes)
$secs = $elapsed.Seconds

Write-Host ""
Write-Host "  [OK] Pipeline completado en ${mins}m ${secs}s" -ForegroundColor Green
Write-Host ""

# ---------------------------------------------------------
# Paso 5: Verificar artefactos generados
# ---------------------------------------------------------
Write-Host "[Paso 5] Verificando artefactos generados..." -ForegroundColor Yellow
Write-Host ""

$allOk = $true

# Datos
Write-Host "  Datos:" -ForegroundColor White
$dataFiles = @("results/benchmark.csv", "results/cpp.csv", "results/go.csv", "results/java.csv", "results/python.csv")
foreach ($f in $dataFiles) {
    if (Test-Path $f) {
        $rows = (Get-Content $f | Measure-Object -Line).Lines - 1
        Write-Host "    [OK] $(Split-Path $f -Leaf) ($rows registros)" -ForegroundColor Green
    } else {
        Write-Host "    [X] $(Split-Path $f -Leaf) - FALTANTE" -ForegroundColor Red
        $allOk = $false
    }
}

# Analisis estadistico
Write-Host ""
Write-Host "  Analisis estadistico:" -ForegroundColor White
$analysisFiles = @("results/descriptive_stats.csv", "results/anova_results.txt", "results/tukey_results.txt")
foreach ($f in $analysisFiles) {
    if (Test-Path $f) {
        Write-Host "    [OK] $(Split-Path $f -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "    [X] $(Split-Path $f -Leaf) - FALTANTE" -ForegroundColor Red
        $allOk = $false
    }
}

# Graficos
Write-Host ""
Write-Host "  Graficos:" -ForegroundColor White
$charts = @(
    "boxplot_by_language.png",
    "interaction_plot.png",
    "bar_chart_comparison.png",
    "boxplot_comparison.png",
    "heatmap_times.png",
    "speedup_chart.png",
    "interaction_chart.png"
)
foreach ($f in $charts) {
    $path = "results/$f"
    if (Test-Path $path) {
        $size = [math]::Round((Get-Item $path).Length / 1KB, 0)
        Write-Host "    [OK] $f (${size} KB)" -ForegroundColor Green
    } else {
        Write-Host "    [X] $f - FALTANTE" -ForegroundColor Red
        $allOk = $false
    }
}

# Verificar conteo
Write-Host ""
if (Test-Path "results/benchmark.csv") {
    $total = (Get-Content "results/benchmark.csv" | Measure-Object -Line).Lines - 1
    if ($total -eq 120) {
        Write-Host "  [OK] benchmark.csv contiene $total/120 observaciones esperadas" -ForegroundColor Green
    } else {
        Write-Host "  [X] benchmark.csv contiene $total registros (se esperaban 120)" -ForegroundColor Red
        $allOk = $false
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
if ($allOk) {
    Write-Host "  EXPERIMENTO COMPLETADO EXITOSAMENTE" -ForegroundColor Green
    Write-Host "  Todos los artefactos fueron generados correctamente." -ForegroundColor Green
} else {
    Write-Host "  EXPERIMENTO INCOMPLETO - revisar artefactos faltantes." -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Pipeline:        Snakefile"
Write-Host "  Resultados:      results/"
Write-Host "  Analisis:        analysis/analyze.py"
Write-Host "  Tiempo total:    ${mins}m ${secs}s"
Write-Host "  Observaciones:   4 lenguajes x 3 tamanos x 10 reps = 120"
Write-Host ""
