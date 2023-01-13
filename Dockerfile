FROM node:18-alpine

WORKDIR /app

COPY ./ ./

RUN npm install \
    && npm -g install typescript \
    && tsc

CMD ["npm", "start"]