# Hermes Unified AI Workspace — deployment image

Derived image for the always-on VPS deployment. It extends the upstream Hermes
Agent image and does not reimplement the agent.

## Build

From the `hermes-agent` checkout:

```bash
docker build -f deploy/workspace/Dockerfile \
  --build-arg HERMES_BASE=nousresearch/hermes-agent:latest \
  -t hermes-workspace:dev .
```

Or build the pinned fork image first (`docker build -t hermes-agent .` in the
repo root) and point `HERMES_BASE` at it.

## Run

```bash
docker run -d --name hermes-workspace \
  -v "$HOME/.hermes:/opt/data" \
  --network tailscale0 \            # private network; do NOT publish publicly
  -e HERMES_UID="$(id -u)" -e HERMES_GID="$(id -g)" \
  hermes-workspace:dev
```

## Requirements before it is production-ready

- Set `webapp.enabled: true` in the mounted `/opt/data/config.yaml` (the webapp
  is off by default) and confirm the actual webapp port (this scaffold assumes
  the dashboard listener on 9119).
- Terminate HTTPS at a reverse proxy; keep the dashboard/webapp port private.
- Keep provider keys and bot tokens in the mounted state / secret mounts, never
  in the image.
- The base image is the authoritative runtime; pin `HERMES_BASE` to an exact
  digest for reproducible deploys.

## Status

Scaffold only — not yet built or run. Treat as unverified until a build and a
gateway healthcheck pass are recorded.
