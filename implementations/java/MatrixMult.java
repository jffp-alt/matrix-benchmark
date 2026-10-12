public class MatrixMult {

    // LCG - Generador lineal congruencial idéntico al de C++/Go
    static long lcgState;

    static void lcgSeed(long seed) {
        lcgState = seed;
    }

    static double lcgNext() {
        lcgState = lcgState * 6364136223846793005L + 1442695040888963407L;
        return (double) (((lcgState >>> 33) % 10000)) / 100.0;
    }

    static double[][] generateMatrix(int n) {
        double[][] mat = new double[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                mat[i][j] = lcgNext();
        return mat;
    }

    static double[][] multiply(double[][] A, double[][] B, int n) {
        double[][] C = new double[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                for (int k = 0; k < n; k++)
                    C[i][j] += A[i][k] * B[k][j];
        return C;
    }

    public static void main(String[] args) throws Exception {
        int N = 500;
        int reps = 10;
        long seed = 42;
        String outfile = "java.csv";

        for (int i = 0; i < args.length; i++) {
            switch (args[i]) {
                case "--n": N = Integer.parseInt(args[++i]); break;
                case "--reps": reps = Integer.parseInt(args[++i]); break;
                case "--seed": seed = Long.parseLong(args[++i]); break;
                case "--output": outfile = args[++i]; break;
            }
        }

        // Generar matrices antes de medir
        lcgSeed(seed);
        double[][] A = generateMatrix(N);
        lcgSeed(seed + 1);
        double[][] B = generateMatrix(N);

        java.io.FileWriter fw = new java.io.FileWriter(outfile, true);

        for (int r = 1; r <= reps; r++) {
            long start = System.nanoTime();
            double[][] C = multiply(A, B, N);
            long end = System.nanoTime();

            double elapsed = (end - start) / 1e9;
            fw.write(String.format("java,%d,%d,%.6f%n", N, r, elapsed));

            System.err.printf("java,N=%d,rep=%d,time=%.6fs%n", N, r, elapsed);
        }

        fw.close();
    }
}
