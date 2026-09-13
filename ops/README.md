# ops — VPS deploy

This monorepo deploys one thing: a Storybook static site per framework.

- https://react-storybook.okkly.dev — static build of `@okkly/react`
  (also answers on the legacy `storybook.okkly.lol`)
- https://vue-storybook.okkly.dev — static build of `@okkly/vue`
- https://svelte-storybook.okkly.dev — static build of `@okkly/svelte`
- https://angular-storybook.okkly.dev — static build of `@okkly/angular`

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
      ┌────────────────┼────────────────┬─────────────────┐
┌─────┴──────┐  ┌───────┴────┐  ┌────────┴─────┐  ┌────────┴──────┐
│ storybook- │  │ storybook- │  │  storybook-  │  │   storybook-  │
│   react    │  │    vue     │  │    svelte    │  │    angular    │
└────────────┘  └────────────┘  └──────────────┘  └───────────────┘
   this compose, no host ports. static files inside caddy:alpine, :80 each.
```

One hop. There used to be a second proxy (`okkly-caddy`) between the two;
it was removed along with `ops/Caddyfile`, and the security headers it added
moved into `~/vps-infra/Caddyfile`'s `(common)` snippet.

| File                   | Role                                                            |
| ---------------------- | ---------------------------------------------------------------- |
| `docker-compose.yml`   | stack: `storybook-react`, `-vue`, `-svelte`, `-angular`           |
| `Dockerfile.storybook` | Vite Storybook (picked by `--build-arg PACKAGE=...`) → static files inside `caddy:alpine` |
| `spa.Caddyfile`        | Caddy inside each storybook image: SPA fallback, caching          |

Edge TLS is Caddy from `~/vps-infra`. This stack joins the same Docker network
`vps-infra_default` and listens only inside it, as `storybook:80`.

## First-time VPS setup

### 1. Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"   # then log in again
```

### 2. DNS (Cloudflare, proxied)

An A record with the **orange cloud** (Proxied) for each host:

- `react-storybook.okkly.dev` → VPS IP (also `storybook.okkly.lol`, kept as
  a legacy alias)
- `vue-storybook.okkly.dev` → VPS IP
- `svelte-storybook.okkly.dev` → VPS IP
- `angular-storybook.okkly.dev` → VPS IP

SSL/TLS → Overview → **Full**, same as the other `*.okkly.dev` hosts.

`~/vps-infra/Caddyfile` must route each host to its own container:
`reverse_proxy storybook-react:80` (and `-vue`/`-svelte`/`-angular`). After
editing:

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

Push to `main` → one `.github/workflows/deploy-<framework>-storybook.yml` per
framework: build that framework's storybook image to ghcr.io → scp the
(shared) compose file → `docker compose pull <service> && up -d <service>`.
Each framework's own workflow only touches its own service; the deploy jobs
share a `storybook-vps-deploy` concurrency group so they don't race on the
VPS.

PRs run `check` only.

Rollback: pin a SHA tag instead of `latest` for the affected service in
`docker-compose.yml` and `docker compose up -d <service>`.

## Local image check

```bash
# from the monorepo root
docker build -f ops/Dockerfile.storybook --build-arg PACKAGE=vue -t storybook-vue:local .
docker run --rm -p 8080:80 storybook-vue:local   # http://localhost:8080
```
