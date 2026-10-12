"""
Análisis estadístico del benchmark de multiplicación de matrices.

Genera:
  - Estadísticas descriptivas (descriptive_stats.csv)
  - ANOVA de dos factores con interacción (anova_results.txt)
  - Comparaciones post-hoc Tukey HSD (tukey_results.txt)
  - Boxplot por lenguaje y tamaño (boxplot_by_language.png)
  - Gráfico de interacción (interaction_plot.png)
"""

import argparse
import os

import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from statsmodels.formula.api import ols
from statsmodels.stats.anova import anova_lm
from statsmodels.stats.multicomp import pairwise_tukeyhsd


def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.columns = df.columns.str.strip()
    df["language"] = df["language"].str.strip()
    df["N"] = df["N"].astype(int)
    df["repetition"] = df["repetition"].astype(int)
    df["time_seconds"] = df["time_seconds"].astype(float)
    return df


def descriptive_stats(df: pd.DataFrame, output_dir: str):
    desc = (
        df.groupby(["language", "N"])["time_seconds"]
        .agg(["count", "mean", "std", "min", "median", "max"])
        .round(6)
        .reset_index()
    )
    path = os.path.join(output_dir, "descriptive_stats.csv")
    desc.to_csv(path, index=False)
    print(f"Estadísticas descriptivas guardadas en {path}")
    return desc


def run_anova(df: pd.DataFrame, output_dir: str):
    # Convertir N a categórico para ANOVA factorial
    df["N_cat"] = df["N"].astype(str)

    model = ols("time_seconds ~ C(language) * C(N_cat)", data=df).fit()
    anova_table = anova_lm(model, typ=2)

    path = os.path.join(output_dir, "anova_results.txt")
    with open(path, "w") as f:
        f.write("=" * 70 + "\n")
        f.write("ANOVA DE DOS FACTORES CON INTERACCIÓN\n")
        f.write("Factores: language (lenguaje), N (tamaño de matriz)\n")
        f.write("Variable dependiente: time_seconds\n")
        f.write("=" * 70 + "\n\n")
        f.write(anova_table.to_string())
        f.write("\n\n")
        f.write("-" * 70 + "\n")
        f.write("Interpretación:\n")
        for idx, row in anova_table.iterrows():
            if pd.notna(row.get("PR(>F)")):
                sig = "***" if row["PR(>F)"] < 0.001 else (
                    "**" if row["PR(>F)"] < 0.01 else (
                    "*" if row["PR(>F)"] < 0.05 else "ns"))
                f.write(f"  {idx}: F={row['F']:.4f}, p={row['PR(>F)']:.2e} [{sig}]\n")
        f.write("-" * 70 + "\n")

    print(f"Resultados ANOVA guardados en {path}")
    return anova_table


def run_tukey(df: pd.DataFrame, output_dir: str):
    # Tukey HSD agrupando por lenguaje (colapsando N)
    tukey_lang = pairwise_tukeyhsd(
        df["time_seconds"], df["language"], alpha=0.05
    )

    # Tukey HSD por combinación lenguaje-N
    df["group"] = df["language"] + "_N" + df["N"].astype(str)
    tukey_full = pairwise_tukeyhsd(
        df["time_seconds"], df["group"], alpha=0.05
    )

    path = os.path.join(output_dir, "tukey_results.txt")
    with open(path, "w") as f:
        f.write("=" * 70 + "\n")
        f.write("COMPARACIONES POST-HOC: TUKEY HSD\n")
        f.write("=" * 70 + "\n\n")
        f.write("--- Por lenguaje (colapsando tamaño) ---\n\n")
        f.write(str(tukey_lang))
        f.write("\n\n")
        f.write("--- Por combinación lenguaje × tamaño ---\n\n")
        f.write(str(tukey_full))
        f.write("\n")

    print(f"Resultados Tukey HSD guardados en {path}")


def plot_boxplot(df: pd.DataFrame, output_dir: str):
    fig, ax = plt.subplots(figsize=(12, 6))
    sns.boxplot(
        data=df, x="N", y="time_seconds", hue="language",
        palette="Set2", ax=ax
    )
    ax.set_title("Tiempo de ejecución por lenguaje y tamaño de matriz", fontsize=14)
    ax.set_xlabel("Tamaño de matriz (N)", fontsize=12)
    ax.set_ylabel("Tiempo (segundos)", fontsize=12)
    ax.legend(title="Lenguaje", fontsize=10)
    plt.tight_layout()
    path = os.path.join(output_dir, "boxplot_by_language.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"Boxplot guardado en {path}")


def plot_interaction(df: pd.DataFrame, output_dir: str):
    means = df.groupby(["language", "N"])["time_seconds"].mean().reset_index()

    fig, ax = plt.subplots(figsize=(10, 6))
    for lang in means["language"].unique():
        subset = means[means["language"] == lang]
        ax.plot(
            subset["N"], subset["time_seconds"],
            marker="o", linewidth=2, label=lang
        )

    ax.set_title("Gráfico de interacción: Lenguaje × Tamaño de matriz", fontsize=14)
    ax.set_xlabel("Tamaño de matriz (N)", fontsize=12)
    ax.set_ylabel("Tiempo promedio (segundos)", fontsize=12)
    ax.set_xticks(means["N"].unique())
    ax.legend(title="Lenguaje", fontsize=10)
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    path = os.path.join(output_dir, "interaction_plot.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"Gráfico de interacción guardado en {path}")


def main():
    parser = argparse.ArgumentParser(description="Análisis estadístico del benchmark")
    parser.add_argument("--input", required=True, help="Ruta a benchmark.csv")
    parser.add_argument("--output-dir", default="results/", help="Directorio de salida")
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    print("Cargando datos...")
    df = load_data(args.input)
    print(f"Registros cargados: {len(df)}")

    print("\n--- Estadísticas descriptivas ---")
    descriptive_stats(df, args.output_dir)

    print("\n--- ANOVA de dos factores ---")
    run_anova(df, args.output_dir)

    print("\n--- Tukey HSD ---")
    run_tukey(df, args.output_dir)

    print("\n--- Generando gráficos ---")
    plot_boxplot(df, args.output_dir)
    plot_interaction(df, args.output_dir)

    print("\nAnálisis completado.")


if __name__ == "__main__":
    main()
