# =============================================================================
# NOTE: NEXT_PUBLIC_ variables (such as NEXT_PUBLIC_LD_CLIENT_KEY) MUST be
# passed as --build-arg at build time, NOT via -e at container run time.
# These variables are baked into the statically built bundle.
# =============================================================================

########################
# Builder Stage
########################
FROM node:20-alpine AS builder

# Accept NEXT_PUBLIC_ env vars at build time
ARG NEXT_PUBLIC_LD_CLIENT_KEY

# Make NEXT_PUBLIC_ variable available at build/buildtime
ENV NEXT_PUBLIC_LD_CLIENT_KEY=$NEXT_PUBLIC_LD_CLIENT_KEY

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; fi

# Copy all source files
COPY . .

# Build the app
RUN npm run build

########################
# Runner Stage
########################
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built output and production deps from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]