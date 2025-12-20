#!/bin/bash

chmod 600 ./.ssh/ssh.pem

ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -L 8188:127.0.0.1:8188 -i ./.ssh/ssh.pem ubuntu@machine.runyour.ai &

SSH_PID=$!

trap "kill $SSH_PID" EXIT

until nc -z localhost 8188; do
  sleep 0.5
done

npm run start