FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y docker.io

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "api"]