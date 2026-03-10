# Usa uma imagem oficial do Node
FROM node:18

# Cria diretório da aplicação
WORKDIR /app

# Copia package.json
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o resto do projeto
COPY . .

# Porta usada pela aplicação
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]