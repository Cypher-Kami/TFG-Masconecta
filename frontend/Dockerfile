# Usa una imagen base adecuada para tu frontend, como node, nginx, etc.
FROM node:14 as build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias e instálalos antes de copiar el código fuente
COPY package.json package-lock.json ./
RUN npm install

# Copia el código fuente de tu frontend al contenedor
COPY . .

# Ejecuta el comando de construcción para compilar tu frontend (asegúrate de que coincida con el comando para construir tu frontend en el package.json)
RUN npm run build

# Usa una imagen de servidor web ligero como Nginx como la imagen final
FROM nginx:alpine

# Copia los archivos compilados de tu frontend desde la etapa anterior al directorio de la imagen de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Define el puerto en el que escucha tu frontend (asegúrate de que coincida con el puerto que expone Nginx)
EXPOSE 80

# Comando para iniciar Nginx y servir tu frontend
CMD ["nginx", "-g", "daemon off;"]