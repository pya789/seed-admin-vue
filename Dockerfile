FROM node:lts-alpine AS node
WORKDIR /build
# 设置淘宝npm镜像 国外服务器可以不用
RUN npm config set registry https://registry.npm.taobao.org
COPY package.json /build/package.json
RUN npm install
COPY ./ /build
RUN npm run build
# nginx代理
FROM nginx
RUN mkdir /app
COPY --from=node /build/dist /app
COPY --from=node /build/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80