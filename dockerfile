FROM node:lts-alpine
LABEL maintainer "ard@gmail.com"

ENV NODE_ENV=${NODE_ENV}

WORKDIR /app
EXPOSE 3000

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

COPY package.json pnpm-lock.yaml ./
RUN touch .env

RUN set -x && pnpm install --frozen-lockfile

COPY . .

CMD [ "pnpm", "start:dev" ]
