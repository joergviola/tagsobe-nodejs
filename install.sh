#!/bin/sh
# install node.js probe on tagsobe vm

# Installing node.js
sudo yum -y install gcc-c++
sudo yum -y install zlib-devel
sudo yum -y install openssl-devel
curl http://nodejs.org/dist/v0.6.6/node-v0.6.6.tar.gz > node-v0.6.6.tar.gz
tar zxf node-v0.6.6.tar.gz
cd node-v0.6.6
./configure --without-ssl --prefix $HOME/node
make install
PATH=$PATH:$HOME/node/bin
cd ..

# Installing app
npm install
npm install moment
npm install sequelize

node app.js &

echo "http://localhost:3000/search" > probe.url
