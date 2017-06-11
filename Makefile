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
	go get github.com/smartystreets/goconvey
	go get github.com/go-playground/overalls
	overalls -project=github.com/soprasteria/docktor -covermode=atomic -- -race -v
	mkdir -p ./dist
	go tool cover -html=overalls.coverprofile -o=dist/cover.html
	cp overalls.coverprofile coverage.txt
	rm -f ./*.coverprofile

lint:
	go get github.com/alecthomas/gometalinter
	gometalinter --install
	gometalinter --vendor --deadline=60m --fast --config=./gometalinter.json ./server/... ./cmd/... .
