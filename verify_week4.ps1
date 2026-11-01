# =============================================================================
# verify_week4.ps1 - Verificacion de cumplimiento Semana 4
# =============================================================================
# Verifica que el repositorio cumple TODOS los requisitos de la Semana 4:
#   - Estructura de archivos completa
#   - Imagenes Docker construidas
#   - Pipeline Snakemake con DAG correcto
#   - Resultados generados (120 observaciones)
#   - Analisis estadistico (ANOVA, Tukey, tablas, graficos)
#   - Documentacion y FAIR datasheet
#   - Criterios ACM Reusable
#
# Uso:
#   cd D:\ruta\matrix-benchmark
#   powershell -ExecutionPolicy Bypass -File verify_week4.ps1
# =============================================================================

$ErrorActionPreference = "Continue"

$pass = 0
$fail = 0
$warn = 0

function Test-OK($msg) {
    $script:pass++
    Write-Host "  [OK] $msg" -ForegroundColor Green
}

function Test-FAIL($msg) {
    $script:fail++
    Write-Host "  [X]  $msg" -ForegroundColor Red
}

function Test-WARN($msg) {
    $script:warn++
    Write-Host "  [!]  $msg" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  VERIFICACION SEMANA 4 - Automatizacion y analisis         " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# =============================================================
# 1. ESTRUCTURA DEL REPOSITORIO
# =============================================================
Write-Host "[1] Estructura del repositorio" -ForegroundColor Yellow

$requiredFiles = @(
    @("README.md",                          "Documentacion principal"),
    @("Snakefile",                          "Pipeline Snakemake"),
    @("FAIR_datasheet.md",                  "Mini datasheet FAIR"),
    @("LICENSE",                            "Licencia MIT"),
    @("analysis/analyze.py",               "Script de analisis estadistico"),
    @("analysis/requirements.txt",         "Dependencias Python"),
    @("implementations/cpp/matrix_mult.cpp",    "Implementacion C++"),
    @("implementations/cpp/Dockerfile",         "Dockerfile C++"),
    @("implementations/go/matrix_mult.go",      "Implementacion Go"),
    @("implementations/go/Dockerfile",          "Dockerfile Go"),
    @("implementations/java/MatrixMult.java",   "Implementacion Java"),
    @("implementations/java/Dockerfile",        "Dockerfile Java"),
    @("implementations/python/matrix_mult.py",  "Implementacion Python"),
    @("implementations/python/Dockerfile",      "Dockerfile Python")
)

foreach ($item in $requiredFiles) {
    if (Test-Path $item[0]) {
        Test-OK "$($item[1]) ($($item[0]))"
    } else {
        Test-FAIL "$($item[1]) - FALTA $($item[0])"
    }
}

Write-Host ""

# =============================================================
# 2. IMAGENES DOCKER
# =============================================================
Write-Host "[2] Imagenes Docker construidas localmente" -ForegroundColor Yellow

$dockerOk = $true
try {
    docker info 2>&1 | Out-Null
} catch {
    Test-FAIL "Docker daemon no esta corriendo"
    $dockerOk = $false
}

if ($dockerOk) {
    $images = docker images --format "{{.Repository}}" 2>&1
    $requiredImages = @("matrix-cpp", "matrix-go", "matrix-java", "matrix-python")
    foreach ($img in $requiredImages) {
        if ($images -match "^$img$") {
            $size = docker images --format "{{.Size}}" $img 2>&1
            Test-OK "Imagen $img ($size)"
        } else {
            Test-FAIL "Imagen $img no encontrada - ejecutar: docker build -t $img implementations/$($img -replace 'matrix-','')/"
        }
    }
}

Write-Host ""

# =============================================================
# 3. PIPELINE SNAKEMAKE (DAG y reglas)
# =============================================================
Write-Host "[3] Pipeline Snakemake" -ForegroundColor Yellow

if (Test-Path "Snakefile") {
    $snakefile = Get-Content "Snakefile" -Raw

    # Verificar reglas requeridas
    $rules = @("rule all:", "rule run_benchmark:", "rule merge_language:", "rule merge_all:", "rule analysis:")
    foreach ($rule in $rules) {
        if ($snakefile -match [regex]::Escape($rule)) {
            Test-OK "Regla definida: $($rule -replace ':','')"
        } else {
            Test-FAIL "Regla faltante: $($rule -replace ':','')"
        }
    }

    # Verificar parametros experimentales
    if ($snakefile -match 'SIZES\s*=\s*\[500,\s*1000,\s*1500\]') {
        Test-OK "Tamanos de matriz: N=500, N=1000, N=1500"
    } else {
        Test-FAIL "Tamanos de matriz no configurados correctamente"
    }

    if ($snakefile -match 'REPS\s*=\s*10') {
        Test-OK "Repeticiones: 10 por combinacion"
    } else {
        Test-FAIL "Repeticiones no configuradas a 10"
    }

    if ($snakefile -match 'SEED\s*=\s*42') {
        Test-OK "Semilla fija: seed=42"
    } else {
        Test-FAIL "Semilla no configurada a 42"
    }

    # Verificar que rule all incluye todos los outputs
    $expectedOutputs = @(
        "benchmark.csv", "anova_results.txt", "tukey_results.txt",
        "descriptive_stats.csv", "boxplot_by_language.png", "interaction_plot.png",
        "bar_chart_comparison.png", "boxplot_comparison.png", "heatmap_times.png",
        "speedup_chart.png", "interaction_chart.png"
    )
    $missingOutputs = @()
    foreach ($out in $expectedOutputs) {
        if ($snakefile -notmatch [regex]::Escape($out)) {
            $missingOutputs += $out
        }
    }
    if ($missingOutputs.Count -eq 0) {
        Test-OK "rule all declara los 11 outputs esperados"
    } else {
        Test-FAIL "rule all no incluye: $($missingOutputs -join ', ')"
    }

    # Verificar uso de Docker en run_benchmark
    if ($snakefile -match 'docker run') {
        Test-OK "rule run_benchmark usa contenedores Docker"
    } else {
        Test-FAIL "rule run_benchmark no ejecuta Docker"
    }

} else {
    Test-FAIL "Snakefile no existe"
}

Write-Host ""

# =============================================================
# 4. RESULTADOS GENERADOS
# =============================================================
Write-Host "[4] Resultados generados" -ForegroundColor Yellow

# CSVs por lenguaje
$langFiles = @("cpp.csv", "go.csv", "java.csv", "python.csv")
foreach ($f in $langFiles) {
    $path = "results/$f"
    if (Test-Path $path) {
        $rows = (Get-Content $path | Measure-Object -Line).Lines - 1
        if ($rows -eq 30) {
            Test-OK "$f ($rows registros - 3 tamanos x 10 reps)"
        } else {
            Test-WARN "$f tiene $rows registros (se esperaban 30)"
        }
    } else {
        Test-FAIL "$f - no encontrado"
    }
}

# benchmark.csv
if (Test-Path "results/benchmark.csv") {
    $totalRows = (Get-Content "results/benchmark.csv" | Measure-Object -Line).Lines - 1
    if ($totalRows -eq 120) {
        Test-OK "benchmark.csv ($totalRows/120 observaciones)"
    } else {
        Test-FAIL "benchmark.csv tiene $totalRows registros (se esperaban 120)"
    }

    # Verificar las 4 columnas
    $header = (Get-Content "results/benchmark.csv" -TotalCount 1).Trim()
    if ($header -eq "language,N,repetition,time_seconds") {
        Test-OK "benchmark.csv columnas correctas: language, N, repetition, time_seconds"
    } else {
        Test-FAIL "benchmark.csv cabecera incorrecta: $header"
    }

    # Verificar 4 lenguajes presentes
    $langs = Get-Content "results/benchmark.csv" | Select-Object -Skip 1 |
        ForEach-Object { ($_ -split ",")[0].Trim() } | Sort-Object -Unique
    if (($langs -join ",") -eq "cpp,go,java,python") {
        Test-OK "benchmark.csv contiene los 4 lenguajes"
    } else {
        Test-FAIL "benchmark.csv lenguajes encontrados: $($langs -join ', ')"
    }
} else {
    Test-FAIL "benchmark.csv no encontrado"
}

Write-Host ""

# =============================================================
# 5. ANALISIS ESTADISTICO
# =============================================================
Write-Host "[5] Analisis estadistico" -ForegroundColor Yellow

# descriptive_stats.csv
if (Test-Path "results/descriptive_stats.csv") {
    $statsRows = (Get-Content "results/descriptive_stats.csv" | Measure-Object -Line).Lines - 1
    if ($statsRows -eq 12) {
        Test-OK "descriptive_stats.csv ($statsRows grupos: 4 lenguajes x 3 tamanos)"
    } else {
        Test-WARN "descriptive_stats.csv tiene $statsRows filas (se esperaban 12)"
    }
} else {
    Test-FAIL "descriptive_stats.csv no encontrado"
}

# ANOVA
if (Test-Path "results/anova_results.txt") {
    $anova = Get-Content "results/anova_results.txt" -Raw
    if ($anova -match "C\(language\)" -and $anova -match "C\(N_cat\)" -and $anova -match "C\(language\):C\(N_cat\)") {
        Test-OK "anova_results.txt - ANOVA dos factores con interaccion (lenguaje x tamano)"
    } else {
        Test-WARN "anova_results.txt existe pero no contiene los 3 factores esperados"
    }
} else {
    Test-FAIL "anova_results.txt no encontrado"
}

# Tukey HSD
if (Test-Path "results/tukey_results.txt") {
    $tukey = Get-Content "results/tukey_results.txt" -Raw
    if ($tukey -match "Tukey HSD" -and $tukey -match "Por lenguaje") {
        Test-OK "tukey_results.txt - Comparaciones post-hoc Tukey HSD"
    } else {
        Test-WARN "tukey_results.txt existe pero formato inesperado"
    }
} else {
    Test-FAIL "tukey_results.txt no encontrado"
}

Write-Host ""

# =============================================================
# 6. GRAFICOS
# =============================================================
Write-Host "[6] Graficos generados por el pipeline" -ForegroundColor Yellow

$charts = @(
    @("boxplot_by_language.png",   "Boxplot por lenguaje y tamano"),
    @("interaction_plot.png",      "Grafico de interaccion"),
    @("bar_chart_comparison.png",  "Comparacion de barras"),
    @("boxplot_comparison.png",    "Boxplot comparativo por tamano"),
    @("heatmap_times.png",         "Mapa de calor"),
    @("speedup_chart.png",         "Speedup relativo a Python"),
    @("interaction_chart.png",     "Interaccion con barras de error")
)

foreach ($chart in $charts) {
    $path = "results/$($chart[0])"
    if (Test-Path $path) {
        $sizeKB = [math]::Round((Get-Item $path).Length / 1KB, 0)
        Test-OK "$($chart[1]) - $($chart[0]) (${sizeKB} KB)"
    } else {
        Test-FAIL "$($chart[1]) - $($chart[0]) FALTANTE"
    }
}

Write-Host ""

# =============================================================
# 7. DOCUMENTACION Y FAIR
# =============================================================
Write-Host "[7] Documentacion y criterios ACM Reusable" -ForegroundColor Yellow

# README.md
if (Test-Path "README.md") {
    $readme = Get-Content "README.md" -Raw
    $readmeChecks = @(
        @("Instrucciones de reproduccion",  "snakemake --cores 1"),
        @("Diseno experimental",            "120"),
        @("Entorno de ejecucion",           "Docker"),
        @("Hipotesis",                      "H."),
        @("Variables",                      "Independiente"),
        @("ACM Artifact",                   "Reusable")
    )
    foreach ($check in $readmeChecks) {
        if ($readme -match [regex]::Escape($check[1])) {
            Test-OK "README.md documenta: $($check[0])"
        } else {
            Test-WARN "README.md podria faltar: $($check[0])"
        }
    }
} else {
    Test-FAIL "README.md no encontrado"
}

# FAIR datasheet
if (Test-Path "FAIR_datasheet.md") {
    $fair = Get-Content "FAIR_datasheet.md" -Raw
    if ($fair -match "\[Nombre del estudiante\]") {
        Test-FAIL "FAIR_datasheet.md aun tiene placeholder [Nombre del estudiante]"
    } else {
        Test-OK "FAIR_datasheet.md - autor completado"
    }
    if ($fair -match "Findable" -and $fair -match "Accessible" -and $fair -match "Interoperable" -and $fair -match "Reusable") {
        Test-OK "FAIR_datasheet.md - principios FAIR documentados"
    } else {
        Test-WARN "FAIR_datasheet.md - faltan principios FAIR"
    }
} else {
    Test-FAIL "FAIR_datasheet.md no encontrado"
}

# analyze.py genera todos los outputs
if (Test-Path "analysis/analyze.py") {
    $analyzePy = Get-Content "analysis/analyze.py" -Raw
    $functions = @("descriptive_stats", "run_anova", "run_tukey", "plot_boxplot", "plot_interaction", "plot_bar_chart", "plot_heatmap", "plot_speedup")
    $missingFn = @()
    foreach ($fn in $functions) {
        if ($analyzePy -notmatch "def ${fn}\(") {
            $missingFn += $fn
        }
    }
    if ($missingFn.Count -eq 0) {
        Test-OK "analyze.py contiene las $($functions.Count) funciones requeridas"
    } else {
        Test-FAIL "analyze.py le faltan: $($missingFn -join ', ')"
    }
} else {
    Test-FAIL "analysis/analyze.py no encontrado"
}

Write-Host ""

# =============================================================
# RESUMEN
# =============================================================
$total = $pass + $fail + $warn

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE VERIFICACION SEMANA 4" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [OK]  $pass / $total verificaciones pasaron" -ForegroundColor Green
if ($warn -gt 0) {
    Write-Host "  [!]   $warn advertencias" -ForegroundColor Yellow
}
if ($fail -gt 0) {
    Write-Host "  [X]   $fail verificaciones fallaron" -ForegroundColor Red
}
Write-Host ""

if ($fail -eq 0) {
    Write-Host "  RESULTADO: CUMPLE todos los requisitos de Semana 4" -ForegroundColor Green
    Write-Host "  El artifact esta listo para la demostracion." -ForegroundColor Green
} else {
    Write-Host "  RESULTADO: HAY $fail ITEMS PENDIENTES" -ForegroundColor Red
    Write-Host "  Corrige los items marcados con [X] antes de la demostracion." -ForegroundColor Red
}
Write-Host ""
