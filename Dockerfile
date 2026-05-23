FROM node:22-alpine AS builder
WORKDIR /workspace/apps/auth

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY libs /workspace/libs
COPY apps/auth/package.json apps/auth/package-lock.json ./
RUN npm ci

COPY apps/auth/ .
RUN npm run build

FROM node:22-alpine AS app
WORKDIR /workspace/apps/auth

ENV NODE_ENV=production

COPY --from=builder /workspace/apps/auth/.next ./.next
COPY --from=builder /workspace/apps/auth/public ./public
COPY --from=builder /workspace/apps/auth/node_modules ./node_modules
COPY apps/auth/package.json ./

EXPOSE 3002
CMD ["npm", "run", "start"]
