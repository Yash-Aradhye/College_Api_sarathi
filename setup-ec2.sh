#!/bin/bash

# Update system
sudo dnf update -y
sudo dnf upgrade -y

# Install Node.js and npm
# Using dnf for Amazon Linux 2023
sudo dnf install -y nodejs npm

# Install PM2 globally
sudo npm install -g pm2

# Create application directory
mkdir -p ~/counselling/Backend/College_api

# Set up PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

echo "EC2 instance setup complete for College API!"
