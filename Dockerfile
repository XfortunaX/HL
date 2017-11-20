FROM ubuntu:16.04

MAINTAINER Sergey Buklin

RUN apt-get -y update

RUN apt-get install -y wget curl

USER root

RUN curl -sL https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get install -y nodejs

ADD . /hl
WORKDIR /hl
RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
