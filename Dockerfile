FROM node:18

# Set the working directory inside the container
WORKDIR /home/ubuntu/project/ThesisApprovalTransparentSite

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source code
COPY . .

 #Specify the command to run when the container starts
EXPOSE 8080
CMD ["node", "app.js"]

