FROM node:22

WORKDIR /app

RUN apt-get update && \
    apt-get install -y openssh-client \
    netcat-openbsd \
    bash && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run prisma
RUN npm run routes
RUN npm run build

EXPOSE 3000

CMD ["bash", "server_run.sh"]