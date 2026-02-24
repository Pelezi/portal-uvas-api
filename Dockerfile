# PRODUCTION DOCKERFILE
# ---------------------
FROM node:20-alpine as builder

# FIX 1: Install OpenSSL and libc6-compat (Strictly required for Prisma to work on Alpine)
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV build

USER node
WORKDIR /home/node

# Copy package files first to leverage Docker layer caching
COPY --chown=node:node package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY --chown=node:node . .

# Generate Prisma Client, build the NestJS app, and remove dev dependencies
RUN npx prisma generate \
    && npm run build \
    && npm prune --omit=dev

# ---

FROM node:20-alpine

# FIX 1 (Continued): The production runner ALSO needs OpenSSL for the Prisma engine to execute queries
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV production

USER node
WORKDIR /home/node

# Copy the stripped-down node_modules and compiled dist folder from the builder stage
COPY --from=builder --chown=node:node /home/node/package*.json ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/ ./dist/

# FIX 2: Explicitly copy the Prisma folder. This is helpful if you ever need to run migrations 
# directly against this container or if Prisma needs to resolve the schema path at runtime.
COPY --from=builder --chown=node:node /home/node/prisma/ ./prisma/

# FIX 3: Verify this entry point! NestJS usually outputs to 'dist/main.js'. 
# If your app actually uses 'server.js', leave this alone. If not, change it to "dist/main.js".
CMD ["node", "dist/server.js"]