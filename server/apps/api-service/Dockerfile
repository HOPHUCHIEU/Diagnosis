FROM node:23 as builder


WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.5.3 --activate

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:23

WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist /app/dist

EXPOSE 5000

CMD ["node", "dist/apps/api-service/main.js"]
