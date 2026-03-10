FROM node:18

# diretório da aplicação
WORKDIR /app

# copia apenas backend
COPY backend/package*.json ./

# instala dependências
RUN npm install

# copia código do backend
COPY backend .

# porta da api
EXPOSE 3000

# inicia o servidor
CMD ["npm", "start"]