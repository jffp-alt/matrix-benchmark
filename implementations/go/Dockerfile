FROM golang:1.22
WORKDIR /app
COPY matrix_mult.go .
RUN go build -o matrix_mult matrix_mult.go
ENTRYPOINT ["./matrix_mult"]
