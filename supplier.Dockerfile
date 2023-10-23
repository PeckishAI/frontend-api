# build environment
FROM node:20-alpine as react-build
WORKDIR /build
COPY . .

# Given by --build-arg on the cloudbuild task
ARG VITE_CONFIG_MODE

RUN yarn
RUN yarn build --filter supplier

# server environment
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/configfile.template

COPY --from=react-build /build/apps/supplier/dist /usr/share/nginx/html
# COPY --from=react-build /app/dist /usr/share/nginx/html

ENV PORT $PORT
ENV HOST 0.0.0.0
EXPOSE $PORT
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"