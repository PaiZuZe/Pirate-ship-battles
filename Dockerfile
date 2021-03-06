FROM node:12-alpine

WORKDIR /usr/src/server

COPY package.json yarn.lock ./

RUN yarn install

RUN yarn add @types/node --dev

RUN yarn add @types/express --dev

RUN yarn add @types/socket.io --dev

COPY . .

EXPOSE 2000

CMD [ "yarn", "up" ]
