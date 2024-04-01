FROM node:21 AS ui-build

WORKDIR /usr/app/

COPY package*.json ./

RUN npm install
RUN npm build

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD [ "node", "server.js" ]