#!/usr/bin/env bash
# Runs ON the VPS via ssh stdin from the GitHub Actions workflow.
# Expects env: APP_CHANGED, NGINX_CHANGED, GHCR_TOKEN, GHCR_USER, REPO, SHA
set -e

mkdir -p /opt/feni/frontend/deploy/nginx
API="https://api.github.com/repos/$REPO/contents"
HDR="Authorization: token $GHCR_TOKEN"
ACC="Accept: application/vnd.github.raw"
curl -fsSL -H "$HDR" -H "$ACC" "$API/deploy/docker-compose.yml?ref=$SHA" -o /opt/feni/frontend/deploy/docker-compose.yml
curl -fsSL -H "$HDR" -H "$ACC" "$API/deploy/nginx/fenibloodline.com.conf?ref=$SHA" -o /opt/feni/frontend/deploy/nginx/fenibloodline.com.conf

if [ "$NGINX_CHANGED" = "true" ]; then
  if [ -f /etc/letsencrypt/live/fenibloodline.com/fullchain.pem ]; then
    echo ">> Updating nginx config"
    cp /opt/feni/frontend/deploy/nginx/fenibloodline.com.conf /etc/nginx/sites-available/fenibloodline.com.conf
    ln -sf /etc/nginx/sites-available/fenibloodline.com.conf /etc/nginx/sites-enabled/fenibloodline.com.conf
    nginx -t && systemctl reload nginx
  else
    echo ">> TLS cert not issued yet, keeping bootstrap config (run certbot on the VPS first)"
  fi
else
  echo ">> No nginx changes, skipping"
fi

if [ "$APP_CHANGED" = "true" ]; then
  echo ">> Deploying new image"
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
  cd /opt/feni/frontend/deploy
  docker compose pull
  docker compose up -d
  docker image prune -f
else
  echo ">> No app changes, skipping"
fi
echo ">> Deploy finished OK"
