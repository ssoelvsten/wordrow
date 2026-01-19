# Builder image
FROM alpine:latest AS builder

ENV WORKDIR=/app
WORKDIR $WORKDIR

# Add the repository to the work directory.
ADD https://github.com/ssoelvsten/wordrow.git $WORKDIR/

# Add the anatree submodule from the cpp/header-only branch.
ADD https://github.com/ssoelvsten/anatree.git#cpp/header-only $/WORKDIR/dict.cpp/external/anatree

# Add dependencies.
RUN apk add make npm cmake clang --no-cache
# Build project.
RUN make build

# Create image for hosting
FROM alpine:latest

ENV WORKDIR=/app
WORKDIR $WORKDIR

# Add files from the build container.
COPY --from=builder $WORKDIR/build $WORKDIR

# Add the httpd program to the container.
RUN apk add --no-cache busybox-extras

# This does not actually expose a port, just indicates the expected port.
EXPOSE 8000

# Set the command to be in the container.
CMD ["httpd", "-f", "-p", "8000"]
