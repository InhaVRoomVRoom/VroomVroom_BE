#!/bin/bash

chmod 600 ~/.ssh/ssh.pem

ssh -o StrictHostKeyChecking=no -N -L 8188:127.0.0.1:8188 -i /.ssh/ssh.pem ubuntu@runyour.ai &

npm run start