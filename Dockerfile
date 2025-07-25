FROM node:20

WORKDIR /usr/src/app

# Copy dependency files first for better caching
COPY package.json yarn.lock ./

# Install dependencies (this layer will be cached unless dependencies change)
RUN yarn install --frozen-lockfile --production=false

# Copy source code after dependencies are installed
COPY . .

# Build the application
RUN yarn build

EXPOSE 3000

ENTRYPOINT [ "yarn", "start" ]