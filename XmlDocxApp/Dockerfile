FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/xmldocx
WORKDIR /usr/src/xmldocx

# Install app dependencies
COPY package.json /usr/src/xmldocx/
RUN npm install


# Install PHP
RUN apt-get update &&  apt-get install -y apt-transport-https \
&& php5-cli \
&& php5-curl \
&& php5-tidy \
&& php5-xsl \
&& php5-zip \

#RUN docker-php-ext-install ZIP
#RUN docker-php-ext-enable ZIP

#RUN docker-php-ext-install XSLT 
#RUN docker-php-ext-enable XSLT 

#RUN docker-php-ext-install Tidy 
#RUN docker-php-ext-enable Tidy 

# Bundle app source
COPY . /usr/src/xmldocx

EXPOSE 8080
CMD [ "npm", "start" ]

