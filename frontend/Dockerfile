# Usa una imagen base adecuada para tu frontend, como node, nginx, etc.
FROM node:14 as build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias e instala antes de copiar el código fuente
COPY package.json package-lock.json ./
RUN npm install

# Copia el código fuente de tu frontend al contenedor
COPY . .

# Ejecuta el comando de construcción para compilar tu frontend
RUN npm run build

FROM nginx:alpine

# Copia los archivos compilados de tu frontend desde la etapa anterior al directorio de la imagen de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Define el puerto en el que escucha tu frontend
EXPOSE 80

# Copia la conf manual a la configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]