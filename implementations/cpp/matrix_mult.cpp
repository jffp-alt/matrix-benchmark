#include <iostream>
#include <fstream>
#include <vector>
#include <chrono>
#include <cstdlib>
#include <cstring>
#include <string>

using namespace std;

// Generador lineal congruencial para reproducibilidad multiplataforma
class LCG {
    unsigned long long state;
public:
    LCG(unsigned long long seed) : state(seed) {}
    double next() {
        state = (state * 6364136223846793005ULL + 1442695040888963407ULL);
        return (double)((state >> 33) % 10000) / 100.0;
    }
};

vector<vector<double>> generate_matrix(int n, LCG &rng) {
    vector<vector<double>> mat(n, vector<double>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            mat[i][j] = rng.next();
    return mat;
}

vector<vector<double>> multiply(const vector<vector<double>> &A,
                                 const vector<vector<double>> &B, int n) {
    vector<vector<double>> C(n, vector<double>(n, 0.0));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            for (int k = 0; k < n; k++)
                C[i][j] += A[i][k] * B[k][j];
    return C;
}

int main(int argc, char *argv[]) {
    int N = 500;
    int reps = 10;
    unsigned long long seed = 42;
    string outfile = "cpp.csv";

    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--n") == 0 && i + 1 < argc) N = atoi(argv[++i]);
        else if (strcmp(argv[i], "--reps") == 0 && i + 1 < argc) reps = atoi(argv[++i]);
        else if (strcmp(argv[i], "--seed") == 0 && i + 1 < argc) seed = strtoull(argv[++i], nullptr, 10);
        else if (strcmp(argv[i], "--output") == 0 && i + 1 < argc) outfile = argv[++i];
    }

    // Generar matrices antes de medir
    LCG rng_a(seed);
    auto A = generate_matrix(N, rng_a);
    LCG rng_b(seed + 1);
    auto B = generate_matrix(N, rng_b);

    ofstream out(outfile, ios::app);

    for (int r = 1; r <= reps; r++) {
        auto start = chrono::high_resolution_clock::now();
        auto C = multiply(A, B, N);
        auto end = chrono::high_resolution_clock::now();

        double elapsed = chrono::duration<double>(end - start).count();
        out << "cpp," << N << "," << r << "," << elapsed << "\n";

        cerr << "cpp,N=" << N << ",rep=" << r << ",time=" << elapsed << "s" << endl;
    }

    out.close();
    return 0;
}
