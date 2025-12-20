FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run prisma
RUN npm run routes
RUN npm run build

EXPOSE 3000

CMD ["server_run.sh"]