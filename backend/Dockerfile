FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (nodemon already hai tumhare package.json me)
RUN npm install

# Copy source code (volumes se override hoga development me)
COPY . .

EXPOSE 3000

# ✅ Legacy watch mode enable karo Windows/Mac ke liye
CMD ["npm", "run", "dev"]
