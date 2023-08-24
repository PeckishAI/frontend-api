# build environment
FROM node:current-alpine as react-build
WORKDIR /build
COPY . .

RUN yarn
RUN yarn build --filter docs

# server environment
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/configfile.template

COPY --from=react-build /build/apps/docs/storybook-static /usr/share/nginx/html

ENV PORT $PORT
ENV HOST 0.0.0.0
EXPOSE $PORT
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"