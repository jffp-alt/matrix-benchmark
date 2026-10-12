"""
Snakefile - Pipeline reproducible para benchmark de multiplicación de matrices.
Coordina la ejecución de contenedores Docker, integración de resultados y análisis estadístico.

Prerequisitos:
  Las imágenes Docker deben construirse manualmente antes de ejecutar el pipeline:
    docker build -t matrix-cpp implementations/cpp/
    docker build -t matrix-go implementations/go/
    docker build -t matrix-java implementations/java/
    docker build -t matrix-python implementations/python/
"""

LANGUAGES = ["cpp", "go", "java", "python"]
SIZES = [500, 1000, 1500]
SEED = 42
REPS = 10


rule all:
    input:
        "results/benchmark.csv",
        "results/anova_results.txt",
        "results/boxplot_by_language.png",
        "results/interaction_plot.png",
        "results/tukey_results.txt",
        "results/descriptive_stats.csv"


rule run_benchmark:
    """Ejecuta el contenedor Docker para un lenguaje y tamaño de matriz específico."""
    output:
        temp("results/{lang}_N{n}.csv")
    params:
        seed=SEED,
        reps=REPS
    shell:
        """
        docker run --rm \
            -v $(pwd)/results:/output \
            matrix-{wildcards.lang} \
            --n {wildcards.n} --reps {params.reps} --seed {params.seed} \
            --output /output/{wildcards.lang}_N{wildcards.n}.csv
        """


rule merge_language:
    """Integra los resultados parciales de un lenguaje en un único archivo."""
    input:
        expand("results/{{lang}}_N{n}.csv", n=SIZES)
    output:
        "results/{lang}.csv"
    shell:
        """
        echo "language,N,repetition,time_seconds" > {output}
        cat {input} >> {output}
        """


rule merge_all:
    """Integra los cuatro archivos por lenguaje en benchmark.csv."""
    input:
        expand("results/{lang}.csv", lang=LANGUAGES)
    output:
        "results/benchmark.csv"
    shell:
        """
        echo "language,N,repetition,time_seconds" > {output}
        for f in {input}; do
            tail -n +2 "$f" >> {output}
        done
        """


rule analysis:
    """Ejecuta el análisis estadístico completo: ANOVA, Tukey HSD, tablas y gráficos."""
    input:
        "results/benchmark.csv"
    output:
        "results/anova_results.txt",
        "results/tukey_results.txt",
        "results/descriptive_stats.csv",
        "results/boxplot_by_language.png",
        "results/interaction_plot.png"
    shell:
        """
        python analysis/analyze.py --input {input} --output-dir results/
        """
