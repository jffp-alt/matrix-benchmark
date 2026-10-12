FROM gcc:13
WORKDIR /app
COPY matrix_mult.cpp .
RUN g++ -O0 -o matrix_mult matrix_mult.cpp
ENTRYPOINT ["./matrix_mult"]
