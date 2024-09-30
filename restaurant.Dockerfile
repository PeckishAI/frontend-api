# Build environment
FROM node:20-alpine as react-build

# Set working directory
WORKDIR /build

# Copy the entire project into the container
COPY . .

# Install dependencies
RUN yarn install

# Debugging step: Print directory structure before the build
RUN echo "Before Build:" && ls -al /build && ls -al /build/apps/restaurant

# Build the project (ensure the proper filtering)
RUN yarn turbo run build --filter=restaurant --no-cache

# Debugging step: Verify the build output
RUN echo "After Build:" && ls -al /build/apps/restaurant && ls -al /build/apps/restaurant/dist

# Server environment
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/configfile.template

# Copy the built assets from the previous stage
COPY --from=react-build /build/apps/restaurant/dist /usr/share/nginx/html

# Environment variables for Cloud Run
ENV PORT 8080
ENV HOST 0.0.0.0

# Expose the application port
EXPOSE 8080

# Start the NGINX server with dynamic port configuration
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
