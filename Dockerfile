FROM node:alpine AS builder

WORKDIR /frotend

COPY package*.json ./
RUN npm install

COPY . .

FROM node:alpine

WORKDIR /frotend

COPY --from=builder /frotend/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
