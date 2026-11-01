#!/bin/bash
# =============================================================================
# run_experiment.sh — Semana 4: Automatización y análisis estadístico
# =============================================================================
# Script de demostración que ejecuta el flujo completo del experimento:
#   1. Construye manualmente las 4 imágenes Docker desde los Dockerfiles
#   2. Instala dependencias de análisis (Python)
#   3. Ejecuta el pipeline Snakemake (benchmark + análisis estadístico)
#   4. Verifica que todos los artefactos fueron generados
#
# Uso:
#   chmod +x run_experiment.sh
#   ./run_experiment.sh
#
# Prerequisitos:
#   - Docker >= 24.0 instalado y corriendo
#   - Snakemake >= 8.0 (pip install snakemake)
#   - Python >= 3.10
#
# Nota: La ejecución completa puede tomar más de 1 hora
#       (especialmente Python N=1500, ~6 min por repetición).
# =============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # Sin color

# Directorio raíz del proyecto
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}  BENCHMARK REPRODUCIBLE - MULTIPLICACIÓN DE MATRICES NxN   ${NC}"
echo -e "${CYAN}  Semana 4: Automatización y análisis estadístico           ${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

# ---------------------------------------------------------
# Paso 0: Verificar prerequisitos
# ---------------------------------------------------------
echo -e "${YELLOW}[Paso 0] Verificando prerequisitos...${NC}"

MISSING=0

if ! command -v docker &>/dev/null; then
    echo -e "  ${RED}✗ Docker no encontrado${NC}"
    MISSING=1
else
    echo -e "  ${GREEN}✓ Docker: $(docker --version | head -1)${NC}"
fi

if ! docker info &>/dev/null 2>&1; then
    echo -e "  ${RED}✗ Docker daemon no está corriendo${NC}"
    MISSING=1
else
    echo -e "  ${GREEN}✓ Docker daemon activo${NC}"
fi

if ! command -v snakemake &>/dev/null; then
    echo -e "  ${RED}✗ Snakemake no encontrado (pip install snakemake)${NC}"
    MISSING=1
else
    echo -e "  ${GREEN}✓ Snakemake: $(snakemake --version)${NC}"
fi

if ! command -v python3 &>/dev/null && ! command -v python &>/dev/null; then
    echo -e "  ${RED}✗ Python no encontrado${NC}"
    MISSING=1
else
    PYTHON=$(command -v python3 || command -v python)
    echo -e "  ${GREEN}✓ Python: $($PYTHON --version)${NC}"
fi

if [ "$MISSING" -eq 1 ]; then
    echo ""
    echo -e "${RED}Faltan prerequisitos. Instálalos antes de continuar.${NC}"
    exit 1
fi

echo ""

# ---------------------------------------------------------
# Paso 1: Construir imágenes Docker manualmente
# ---------------------------------------------------------
echo -e "${YELLOW}[Paso 1] Construyendo imágenes Docker desde Dockerfiles...${NC}"
echo -e "  ${CYAN}(Las imágenes se construyen localmente, NO se descargan de registros)${NC}"
echo ""

LANGUAGES=("cpp" "go" "java" "python")

for LANG in "${LANGUAGES[@]}"; do
    echo -e "  Construyendo ${GREEN}matrix-${LANG}${NC} desde implementations/${LANG}/Dockerfile..."
    docker build -t "matrix-${LANG}" "implementations/${LANG}/" \
        --quiet 2>&1 | tail -1
    echo -e "  ${GREEN}✓ matrix-${LANG} construida${NC}"
done

echo ""
echo -e "  Imágenes disponibles:"
docker images --format "    {{.Repository}}:{{.Tag}} ({{.Size}})" | grep "^    matrix-"
echo ""

# ---------------------------------------------------------
# Paso 2: Instalar dependencias de análisis
# ---------------------------------------------------------
echo -e "${YELLOW}[Paso 2] Instalando dependencias de análisis...${NC}"
pip install -q -r analysis/requirements.txt
echo -e "  ${GREEN}✓ Dependencias instaladas${NC}"
echo ""

# ---------------------------------------------------------
# Paso 3: Limpiar resultados previos (para reproducción limpia)
# ---------------------------------------------------------
echo -e "${YELLOW}[Paso 3] Limpiando resultados previos...${NC}"

# Archivos generados por el pipeline
GENERATED_FILES=(
    "results/benchmark.csv"
    "results/cpp.csv"
    "results/go.csv"
    "results/java.csv"
    "results/python.csv"
    "results/descriptive_stats.csv"
    "results/anova_results.txt"
    "results/tukey_results.txt"
    "results/boxplot_by_language.png"
    "results/interaction_plot.png"
    "results/bar_chart_comparison.png"
    "results/boxplot_comparison.png"
    "results/heatmap_times.png"
    "results/speedup_chart.png"
    "results/interaction_chart.png"
)

CLEANED=0
for f in "${GENERATED_FILES[@]}"; do
    if [ -f "$f" ]; then
        rm -f "$f"
        CLEANED=$((CLEANED + 1))
    fi
done

# También limpiar archivos temporales de Snakemake
rm -f results/*_N*.csv 2>/dev/null || true

echo -e "  ${GREEN}✓ ${CLEANED} archivos eliminados${NC}"
mkdir -p results
echo ""

# ---------------------------------------------------------
# Paso 4: Ejecutar pipeline Snakemake
# ---------------------------------------------------------
echo -e "${YELLOW}[Paso 4] Ejecutando pipeline Snakemake...${NC}"
echo -e "  ${CYAN}Diseño experimental: 4 lenguajes × 3 tamaños × 10 reps = 120 observaciones${NC}"
echo -e "  ${CYAN}Semilla fija: seed=42 (LCG determinístico)${NC}"
echo ""

START_TIME=$(date +%s)

snakemake --cores 1 --printshellcmds 2>&1 | while IFS= read -r line; do
    # Resaltar las reglas que se van ejecutando
    if echo "$line" | grep -q "^rule "; then
        echo -e "  ${GREEN}▶ ${line}${NC}"
    elif echo "$line" | grep -q "^Finished"; then
        echo -e "  ${GREEN}${line}${NC}"
    else
        echo "  $line"
    fi
done

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
MINS=$((ELAPSED / 60))
SECS=$((ELAPSED % 60))

echo ""
echo -e "  ${GREEN}✓ Pipeline completado en ${MINS}m ${SECS}s${NC}"
echo ""

# ---------------------------------------------------------
# Paso 5: Verificar artefactos generados
# ---------------------------------------------------------
echo -e "${YELLOW}[Paso 5] Verificando artefactos generados...${NC}"
echo ""

ALL_OK=1

echo "  Datos:"
for f in results/benchmark.csv results/cpp.csv results/go.csv results/java.csv results/python.csv; do
    if [ -f "$f" ]; then
        ROWS=$(tail -n +2 "$f" | wc -l)
        echo -e "    ${GREEN}✓${NC} $(basename $f) ($ROWS registros)"
    else
        echo -e "    ${RED}✗${NC} $(basename $f) — FALTANTE"
        ALL_OK=0
    fi
done

echo ""
echo "  Análisis estadístico:"
for f in results/descriptive_stats.csv results/anova_results.txt results/tukey_results.txt; do
    if [ -f "$f" ]; then
        echo -e "    ${GREEN}✓${NC} $(basename $f)"
    else
        echo -e "    ${RED}✗${NC} $(basename $f) — FALTANTE"
        ALL_OK=0
    fi
done

echo ""
echo "  Gráficos:"
CHARTS=(
    "boxplot_by_language.png"
    "interaction_plot.png"
    "bar_chart_comparison.png"
    "boxplot_comparison.png"
    "heatmap_times.png"
    "speedup_chart.png"
    "interaction_chart.png"
)
for f in "${CHARTS[@]}"; do
    if [ -f "results/$f" ]; then
        SIZE=$(du -h "results/$f" | cut -f1)
        echo -e "    ${GREEN}✓${NC} $f ($SIZE)"
    else
        echo -e "    ${RED}✗${NC} $f — FALTANTE"
        ALL_OK=0
    fi
done

echo ""

# Verificar conteo de registros en benchmark.csv
if [ -f "results/benchmark.csv" ]; then
    TOTAL=$(tail -n +2 results/benchmark.csv | wc -l)
    EXPECTED=120
    if [ "$TOTAL" -eq "$EXPECTED" ]; then
        echo -e "  ${GREEN}✓ benchmark.csv contiene ${TOTAL}/${EXPECTED} observaciones esperadas${NC}"
    else
        echo -e "  ${RED}✗ benchmark.csv contiene ${TOTAL} registros (se esperaban ${EXPECTED})${NC}"
        ALL_OK=0
    fi
fi

echo ""
echo -e "${CYAN}============================================================${NC}"
if [ "$ALL_OK" -eq 1 ]; then
    echo -e "${GREEN}  EXPERIMENTO COMPLETADO EXITOSAMENTE${NC}"
    echo -e "${GREEN}  Todos los artefactos fueron generados correctamente.${NC}"
else
    echo -e "${RED}  EXPERIMENTO INCOMPLETO — revisar artefactos faltantes.${NC}"
fi
echo -e "${CYAN}============================================================${NC}"
echo ""
echo "  Pipeline:        Snakefile"
echo "  Resultados:      results/"
echo "  Análisis:        analysis/analyze.py"
echo "  Tiempo total:    ${MINS}m ${SECS}s"
echo "  Observaciones:   4 lenguajes × 3 tamaños × 10 reps = 120"
echo ""
