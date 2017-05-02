FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/xmldocxapp
WORKDIR /usr/src/xmldocxapp

# Install app dependencies
COPY package.json /usr/src/xmldocxapp/
RUN npm install

# Install PHP
RUN apt-get update
RUN apt-get install php5 -y

# Bundle app source
COPY . /usr/src/xmldocxapp

EXPOSE 8080
CMD [ "npm", "start" ]

