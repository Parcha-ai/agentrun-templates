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
# The server needs node only. npm, npx, corepack and yarn ship their own dependencies, which is where the image scan's
# findings come from, so they are removed from the image that runs.
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
           /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg
WORKDIR /site
COPY --from=build /repo/site/serve.mjs ./serve.mjs
COPY --from=build /repo/site/lib/server.mjs ./lib/server.mjs
COPY --from=build /repo/site/dist ./dist
USER node
EXPOSE 8080
CMD ["node", "serve.mjs", "--dir", "dist", "--host", "0.0.0.0", "--port", "8080", "--prod"]
