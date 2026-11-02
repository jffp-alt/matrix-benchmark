#!/bin/bash
# =============================================================================
# validate_checksum.sh - Validacion numerica cruzada entre lenguajes
# =============================================================================
# Ejecuta cada implementacion con N=10 y compara que los 4 lenguajes
# produzcan la misma suma de la matriz resultado (checksum).
#
# Uso:
#   chmod +x validate_checksum.sh
#   ./validate_checksum.sh
#
# Prerequisitos:
#   - Imagenes Docker construidas (build_docker.sh)
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}  VALIDACION NUMERICA CRUZADA ENTRE LENGUAJES               ${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

if ! docker info &>/dev/null 2>&1; then
    echo -e "${RED}[X] Docker daemon no esta corriendo.${NC}"
    exit 1
fi

LANGUAGES=("cpp" "go" "java" "python")
TEST_N=10
TEST_SEED=42
TEMP_DIR=$(mktemp -d)

echo -e "${YELLOW}Ejecutando cada lenguaje con N=$TEST_N, seed=$TEST_SEED, reps=1...${NC}"
echo ""

declare -A CHECKSUMS

for LANG in "${LANGUAGES[@]}"; do
    IMG="matrix-${LANG}"

    if ! docker image inspect "$IMG" &>/dev/null; then
        echo -e "  ${RED}[X] Imagen $IMG no encontrada. Ejecute build_docker.sh primero.${NC}"
        rm -rf "$TEMP_DIR"
        exit 1
    fi

    echo -n "  Ejecutando $IMG..."

    STDERR=$(docker run --rm -v "$TEMP_DIR:/output" "$IMG" \
        --n $TEST_N --reps 1 --seed $TEST_SEED \
        --output "/output/${LANG}_test.csv" 2>&1 >/dev/null)

    CHECKSUM_LINE=$(echo "$STDERR" | grep "CHECKSUM:" | tail -1)

    if [ -n "$CHECKSUM_LINE" ]; then
        SUM=$(echo "$CHECKSUM_LINE" | sed 's/.*sum=//')
        CHECKSUMS[$LANG]="$SUM"
        echo -e " checksum = ${GREEN}$SUM${NC}"
    else
        echo -e " ${RED}[X] No se obtuvo checksum${NC}"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
done

rm -rf "$TEMP_DIR"

echo ""
echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}  COMPARACION DE CHECKSUMS${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

printf "  %-10s  %s\n" "Lenguaje" "Checksum"
printf "  %-10s  %s\n" "----------" "--------------------"
for LANG in "${LANGUAGES[@]}"; do
    printf "  %-10s  %s\n" "$LANG" "${CHECKSUMS[$LANG]}"
done

echo ""

UNIQUE=$(printf '%s\n' "${CHECKSUMS[@]}" | sort -u | wc -l)

if [ "$UNIQUE" -eq 1 ]; then
    echo -e "  ${GREEN}[OK] VALIDACION EXITOSA: Los 4 lenguajes producen el mismo resultado.${NC}"
    echo -e "  ${GREEN}Checksum comun: ${CHECKSUMS[cpp]}${NC}"
    echo ""
    echo -e "  ${CYAN}Esto confirma que:${NC}"
    echo -e "  ${CYAN}  - El generador LCG es identico en los 4 lenguajes${NC}"
    echo -e "  ${CYAN}  - La multiplicacion de matrices produce resultados equivalentes${NC}"
    echo -e "  ${CYAN}  - Las diferencias de tiempo son genuinas, no por datos distintos${NC}"
else
    echo -e "  ${RED}[X] VALIDACION FALLIDA: Los checksums difieren entre lenguajes.${NC}"
fi

echo ""
