# build environment
FROM node:current-alpine as react-build
WORKDIR /app
COPY . .

RUN yarn
RUN yarn build --filter restaurant

# server environment
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/configfile.template

COPY --from=react-build ./apps/restaurant/dist /usr/share/nginx/html
# COPY --from=react-build /app/dist /usr/share/nginx/html

ENV PORT $PORT
ENV HOST 0.0.0.0
EXPOSE $PORT
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"