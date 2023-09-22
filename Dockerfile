FROM node:lts-buster-slim

WORKDIR /app

COPY package*.json ./
RUN yarn install


CMD [ "yarn", "run", "watch" ]
