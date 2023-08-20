# Establecer la imagen base de Node.js
FROM node:14

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos necesarios para el backend
COPY package*.json ./

# Instalar las dependencias del backend
RUN npm install

# Copiar todo el código del backend al contenedor
COPY . .

# Exponer el puerto en el que se ejecutará el backend
EXPOSE 3001

# Comando para ejecutar el backend
CMD ["npm", "start"]