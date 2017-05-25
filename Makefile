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
	go get github.com/onsi/ginkgo/ginkgo
	go get github.com/onsi/gomega
	go get github.com/wadey/gocovmerge
	ginkgo -race -v -coverpkg=./model/... ./cmd/... ./model/... ./server/...
	$(shell [ ! -d dist ] && mkdir dist)
	gocovmerge ./model/**/*.coverprofile > dist/cover.out
	go tool cover -html=dist/cover.out -o=dist/cover.html
	rm -f ./**/*.coverprofile

lint:
	go get github.com/alecthomas/gometalinter
	gometalinter --install
	gometalinter --vendor --deadline=60m --config=./gometalinter.json ./server/... ./model/... ./cmd/... .
