# Static site image: tools/build.sh produces dist/ (minified modules + gzip
# copies), nginx serves it with the headers docs/deploy.md requires.
FROM docker.1ms.run/node:20-alpine AS builder
RUN apk add --no-cache bash gzip
WORKDIR /site
# Warm the npx cache so the pinned esbuild used by tools/build.sh is ready.
RUN npx --yes esbuild@0.25.10 --version
COPY . .
RUN bash tools/build.sh

FROM docker.1ms.run/nginx:stable-alpine
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /site/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1