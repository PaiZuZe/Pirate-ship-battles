FROM node:11-alpine

WORKDIR /usr/src/server

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 2000

CMD [ "yarn", "up" ]
