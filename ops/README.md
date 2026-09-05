# ops — VPS deploy

This monorepo deploys one thing: the Storybook static site.

- https://storybook.okryshto.dev — static build of `@okkly/react`

The apps moved to their own repos and deploy themselves:
`lovelycentury/profile`, `lovelycentury/iam`, `lovelycentury/resume`.

```
                    internet
                       │  :80 / :443
                 ┌─────┴──────┐
                 │ vps-infra  │   ~/vps-infra Caddy (TLS, Cloudflare)
                 │   caddy    │
                 └─────┬──────┘
                       │  HTTP, network vps-infra_default
                 ┌─────┴──────┐
                 │ okryshto-  │   this compose, no host ports
                 │   caddy    │
                 └─────┬──────┘
                       │
                 ┌─────┴─────┐
                 │ storybook │  static files inside caddy:alpine, :80
                 └───────────┘
```

| File                   | Role                                                    |
| ---------------------- | ------------------------------------------------------- |
| `Caddyfile`            | inner proxy: `storybook.okryshto.dev` → `storybook:80`  |
| `docker-compose.yml`   | stack: `caddy` + `storybook`                            |
| `Dockerfile.storybook` | Vite Storybook → static files inside `caddy:alpine`     |
| `spa.Caddyfile`        | Caddy inside the storybook image: SPA fallback, caching |

Edge TLS is Caddy from `~/vps-infra`. This stack joins the same Docker network
`vps-infra_default` and listens only inside it (`okryshto-caddy:80`).

## First-time VPS setup

### 1. Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"   # then log in again
```

### 2. DNS (Cloudflare, proxied)

An A record with the **orange cloud** (Proxied):

- `storybook.okryshto.dev` → VPS IP

SSL/TLS → Overview → **Full** (same as the other `*.okryshto.dev` hosts).

`~/vps-infra/Caddyfile` must route `storybook.okryshto.dev` →
`reverse_proxy okryshto-caddy:80`. After editing:

```bash
cd ~/vps-infra && docker compose restart caddy
```

### 3. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw enable
```

### 4. Stack files

```bash
sudo mkdir -p /srv/okryshto && sudo chown "$USER":"$USER" /srv/okryshto
# copy docker-compose.yml and Caddyfile from the repo
```

### 5. Deploy key for GitHub Actions

```bash
ssh-keygen -t ed25519 -f ~/.ssh/okryshto_deploy -C "github-actions" -N ""
ssh-copy-id -i ~/.ssh/okryshto_deploy.pub user@VPS_IP
ssh-keyscan VPS_IP
cat ~/.ssh/okryshto_deploy
```

Repo secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `DEPLOY_PATH`.

### 6. First start

```bash
cd /srv/okryshto
docker pull caddy:2-alpine
docker compose up -d
docker compose logs -f caddy
```

## After that

Push to `main` → `.github/workflows/deploy.yml`: build the storybook image to
ghcr.io → scp compose + Caddyfile → `docker compose pull && up -d`.

PRs run `check` only.

Rollback: pin a SHA tag instead of `latest` in `docker-compose.yml` and
`docker compose up -d`.

## Local image check

```bash
# from the monorepo root
docker build -f ops/Dockerfile.storybook -t storybook:local .
docker run --rm -p 8080:80 storybook:local   # http://localhost:8080
```
