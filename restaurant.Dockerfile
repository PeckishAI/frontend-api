# build environment
FROM node:20-alpine as react-build
WORKDIR /build
COPY . .

ARG VITE_CONFIG_MODE

RUN yarn
RUN yarn build --filter=restaurant

# server environment
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/configfile.template

# Make sure this path exists
COPY --from=react-build /build/apps/restaurant/dist /usr/share/nginx/html

ENV PORT $PORT
ENV HOST 0.0.0.0
EXPOSE $PORT
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
