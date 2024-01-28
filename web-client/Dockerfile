## Stage 1: Build
From node:18 AS builder

# set working directory
WORKDIR /app

# copy package*.json
COPY package*.json ./

# install dependencies
RUN npm install

# copy other files
COPY . .

# Build app
RUN npm run build

## Stage 2: Production
FROM node:18

WORKDIR /app

COPY package*.json ./

# install only production dependencies
RUN npm install --only=production

# copy built app from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# expose listening port
EXPOSE 3000

# Run
CMD ["npm", "start"]
