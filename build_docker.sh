#!/bin/bash
# =============================================================================
# build_docker.sh - Construccion MANUAL de imagenes Docker
# =============================================================================
# Este script construye las 4 imagenes Docker desde los Dockerfiles locales.
# DEBE ejecutarse ANTES del pipeline Snakemake.
# Las imagenes se construyen localmente, NO se descargan de registros externos.
#
# Uso:
#   chmod +x build_docker.sh
#   ./build_docker.sh
# =============================================================================

set -e

echo ""
echo "============================================================"
echo "  CONSTRUCCION MANUAL DE IMAGENES DOCKER"
echo "============================================================"
echo ""

# Verificar Docker
if ! docker info &>/dev/null 2>&1; then
    echo "[X] Docker daemon no esta corriendo."
    exit 1
fi
echo "[OK] Docker daemon activo"
echo ""
echo "Construyendo imagenes desde Dockerfiles locales..."
echo "(NO se descargan imagenes pre-construidas de registros externos)"
echo ""

LANGUAGES=("cpp" "go" "java" "python")

for LANG in "${LANGUAGES[@]}"; do
    echo "  Construyendo matrix-${LANG} desde implementations/${LANG}/Dockerfile..."
    docker build -t "matrix-${LANG}" "implementations/${LANG}/"
    echo "  [OK] matrix-${LANG} construida"
done

echo ""
echo "Imagenes construidas:"
docker images --format "  {{.Repository}}:{{.Tag}} ({{.Size}})" | grep "matrix-"
echo ""
echo "============================================================"
echo "  LISTO - Ahora ejecute el pipeline:"
echo "    snakemake --cores 1 --forceall"
echo "============================================================"
echo ""
