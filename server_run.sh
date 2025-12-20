#!/bin/bash

chmod 600 ./.ssh/ssh.pem

ssh -o StrictKeyChecking=no -o UserKnownHostsFile=/dev/null -L 8188:127.0.0.1:8188 -i ./.ssh/ssh.pem ubuntu@machine.runyour.ai &

npm run start