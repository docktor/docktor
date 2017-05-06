.PHONY: build run test lint

ldflags = -ldflags "
ldflags += -X github.com/soprasteria/docktor/cmd.Version=$(npm_package_version)
ldflags += -X github.com/soprasteria/docktor/cmd.BuildDate=$$(date -u +%Y/%m/%d)
ldflags += -X github.com/soprasteria/docktor/cmd.GitHash=$$(git rev-parse HEAD)"

default: build

build:
	go build $(ldflags)

run:
	go get github.com/skelterjohn/rerun
	rerun github.com/soprasteria/docktor serve

test:
	go get github.com/stretchr/testify
	go test ./cmd/... ./model/... ./server/...

lint:
	go get github.com/alecthomas/gometalinter
	gometalinter --install
	gometalinter --vendor --deadline=60m --config=./gometalinter.json ./server/... ./model/... ./cmd/... .
