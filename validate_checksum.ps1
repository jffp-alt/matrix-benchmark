# =============================================================================
# validate_checksum.ps1 - Validacion numerica cruzada entre lenguajes
# =============================================================================
# Ejecuta cada implementacion con N=10 (rapido) y compara que los 4 lenguajes
# produzcan la misma suma de la matriz resultado (checksum).
# Esto verifica que el LCG y la multiplicacion son identicos en los 4 lenguajes.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File validate_checksum.ps1
#
# Prerequisitos:
#   - Imagenes Docker construidas (build_docker.ps1)
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  VALIDACION NUMERICA CRUZADA ENTRE LENGUAJES               " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
try {
    docker info 2>&1 | Out-Null
} catch {
    Write-Host "[X] Docker daemon no esta corriendo." -ForegroundColor Red
    exit 1
}

$languages = @("cpp", "go", "java", "python")
$testN = 10
$testSeed = 42
$checksums = @{}

# Crear directorio temporal para output
$tempDir = Join-Path $env:TEMP "matrix_checksum_test"
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir | Out-Null
}

Write-Host "Ejecutando cada lenguaje con N=$testN, seed=$testSeed, reps=1..." -ForegroundColor Yellow
Write-Host ""

foreach ($lang in $languages) {
    $imgName = "matrix-$lang"

    # Verificar que la imagen existe
    $imgExists = docker images --format "{{.Repository}}" | Select-String "^$imgName$"
    if (-not $imgExists) {
        Write-Host "  [X] Imagen $imgName no encontrada. Ejecute build_docker.ps1 primero." -ForegroundColor Red
        exit 1
    }

    # Ejecutar contenedor y capturar stderr (donde esta el CHECKSUM)
    $outFile = Join-Path $tempDir "${lang}_test.csv"
    if (Test-Path $outFile) { Remove-Item $outFile }

    Write-Host "  Ejecutando $imgName..." -ForegroundColor White -NoNewline

    $stderr = docker run --rm -v "${tempDir}:/output" $imgName --n $testN --reps 1 --seed $testSeed --output "/output/${lang}_test.csv" 2>&1 |
        Where-Object { $_ -match "CHECKSUM:" }

    if ($stderr) {
        $checksumLine = $stderr | Select-Object -Last 1
        if ($checksumLine -match "CHECKSUM:N=\d+,sum=(.+)") {
            $checksums[$lang] = $Matches[1].Trim()
            Write-Host " checksum = $($checksums[$lang])" -ForegroundColor Green
        } else {
            Write-Host " [X] No se pudo parsear el checksum: $checksumLine" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host " [X] No se obtuvo checksum de $lang" -ForegroundColor Red
        exit 1
    }
}

# Limpiar directorio temporal
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  COMPARACION DE CHECKSUMS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Comparar todos los checksums
$uniqueChecksums = $checksums.Values | Sort-Object -Unique

Write-Host "  Lenguaje    Checksum" -ForegroundColor White
Write-Host "  ----------  --------------------" -ForegroundColor White
foreach ($lang in $languages) {
    Write-Host "  $($lang.PadRight(10))  $($checksums[$lang])" -ForegroundColor White
}

Write-Host ""

if ($uniqueChecksums.Count -eq 1) {
    Write-Host "  [OK] VALIDACION EXITOSA: Los 4 lenguajes producen el mismo resultado." -ForegroundColor Green
    Write-Host "  Checksum comun: $($uniqueChecksums[0])" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Esto confirma que:" -ForegroundColor Cyan
    Write-Host "    - El generador LCG es identico en los 4 lenguajes" -ForegroundColor Cyan
    Write-Host "    - La multiplicacion de matrices produce resultados equivalentes" -ForegroundColor Cyan
    Write-Host "    - Las diferencias de tiempo son genuinas, no por datos distintos" -ForegroundColor Cyan
} else {
    Write-Host "  [X] VALIDACION FALLIDA: Los checksums difieren entre lenguajes." -ForegroundColor Red
    Write-Host "  Se encontraron $($uniqueChecksums.Count) valores distintos." -ForegroundColor Red
}

Write-Host ""
