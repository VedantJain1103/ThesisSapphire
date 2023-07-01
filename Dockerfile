FROM node:18
WORKDIR /Users/om/desktop/prect/ThesisApprovalTransparentSite
 
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
CMD [ "npm", "start" ]
