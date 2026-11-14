# marketplace.agentrun.ai: builds the site from this repo and serves it with the security headers in lib/server.mjs.
# Build from the repository root: docker build -f site/Dockerfile --build-arg NF_GIT_SHA=<commit> .
# Northflank passes NF_GIT_SHA, the commit being built; install links pin it.

FROM node:24-alpine AS build
RUN apk add --no-cache git
WORKDIR /repo
COPY site/package.json site/package-lock.json site/
RUN npm ci --prefix site --no-audit --no-fund
COPY . .
ARG NF_GIT_SHA
RUN npm test --prefix site \
 && SITE_SHA="$NF_GIT_SHA" node site/build.mjs \
 && node site/check.mjs \
 && chmod -R a+rX site/serve.mjs site/lib site/dist

FROM node:24-alpine
WORKDIR /site
COPY --from=build /repo/site/serve.mjs ./serve.mjs
COPY --from=build /repo/site/lib/server.mjs ./lib/server.mjs
COPY --from=build /repo/site/dist ./dist
USER node
EXPOSE 8080
CMD ["node", "serve.mjs", "--dir", "dist", "--host", "0.0.0.0", "--port", "8080", "--prod"]
