#!/bin/sh
# Traefik is image: traefik:v3.7.13 (no Dockerfile). --build is a no-op.
# --force-recreate applies command / volume / label changes.
cd "$(dirname "$0")"
mkdir -p acme
sudo docker compose -f docker-compose.yml up --build --force-recreate -d
