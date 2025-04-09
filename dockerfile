# Use the official Node.js image
FROM node:16

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set the working directory
WORKDIR /app

# Copy package files and install Node.js dependencies
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps


# Copy the rest of the application code
COPY . .

# Install Python requirements
COPY requirements.txt .
RUN pip3 install --break-system-packages -r requirements.txt



# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]