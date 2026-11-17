FROM node:20-alpine

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

RUN npm install --global pm2

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.js"]
