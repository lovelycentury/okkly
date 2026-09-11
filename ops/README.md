# ops — VPS deploy

This monorepo deploys one thing: the Storybook static site.

- https://storybook.okkly.lol — static build of `@okkly/react`

This is the only host on the okkly.lol domain; the other repos stay on
`*.okkly.dev`. The old `storybook.okkly.dev` answers 301 to the new URL.

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
                 ┌─────┴─────┐
                 │ storybook │   this compose, no host ports.
                 └───────────┘   static files inside caddy:alpine, :80
```

One hop. There used to be a second proxy (`okkly-caddy`) between the two;
it was removed along with `ops/Caddyfile`, and the security headers it added
moved into `~/vps-infra/Caddyfile`'s `(common)` snippet.

| File                   | Role                                                    |
| ---------------------- | ------------------------------------------------------- |
| `docker-compose.yml`   | stack: `storybook` alone                                |
| `Dockerfile.storybook` | Vite Storybook → static files inside `caddy:alpine`     |
| `spa.Caddyfile`        | Caddy inside the storybook image: SPA fallback, caching |

Edge TLS is Caddy from `~/vps-infra`. This stack joins the same Docker network
`vps-infra_default` and listens only inside it, as `storybook:80`.

## First-time VPS setup

### 1. Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"   # then log in again
```

### 2. DNS (Cloudflare, proxied)

An A record with the **orange cloud** (Proxied):

- `storybook.okkly.lol` → VPS IP

SSL/TLS → Overview → **Full**, same as the `*.okkly.dev` hosts, if okkly.lol
is on Cloudflare too. A plain A record elsewhere works as well — Caddy gets its
own certificate over HTTP-01 either way.

`~/vps-infra/Caddyfile` must route `storybook.okkly.lol` →
`reverse_proxy storybook:80`. After editing:

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
sudo mkdir -p /srv/okkly && sudo chown "$USER":"$USER" /srv/okkly
# copy docker-compose.yml and Caddyfile from the repo
```

### 5. Deploy key for GitHub Actions

```bash
ssh-keygen -t ed25519 -f ~/.ssh/okkly_deploy -C "github-actions" -N ""
ssh-copy-id -i ~/.ssh/okkly_deploy.pub user@VPS_IP
ssh-keyscan VPS_IP
cat ~/.ssh/okkly_deploy
```

Repo secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `DEPLOY_PATH`.

### 6. First start

```bash
cd /srv/okkly
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
