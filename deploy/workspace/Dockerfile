# Hermes Unified AI Workspace — derived runtime image
#
# The workspace runs the Hermes Agent gateway + first-party webapp on an
# always-on VPS, so a container is the unit of deployment. This image does NOT
# reimplement Hermes: it EXTENDS the upstream Hermes Agent image (which already
# ships the s6 supervisor, gateway, dashboard and profile multiplexer) and sets
# the workspace defaults. Config and secrets live in the mounted HERMES_HOME
# (/opt/data) and are never baked into the image.
#
# Access model (decision D3): private network + HTTPS, single operator. Publish
# this container only on a private network (Tailscale/WireGuard) behind a TLS
# reverse proxy — do not expose the dashboard port publicly.
#
# Status: SCAFFOLD. Not yet built or run. Validate the webapp port and the
# `webapp.enabled` setting against the pinned image before deployment.

ARG HERMES_BASE=nousresearch/hermes-agent:latest
FROM ${HERMES_BASE}

# Upstream image home the compose file mounts; keep it explicit.
ENV HERMES_HOME=/opt/data

# Persistent agent state: config, sessions, skills, X checkout, indexes.
VOLUME ["/opt/data"]

# The first-party webapp is served by the gateway. Enable it in the mounted
# config (`webapp.enabled: true`) rather than via a baked setting, so the
# toggle stays reviewable in config and not hidden in the image.

# Dashboard/webapp listener. Upstream binds localhost by default; expose only
# inside the private network / TLS reverse proxy.
EXPOSE 9119

# Gateway health surface (upstream /health). curl is present in the base image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:9119/health || exit 1

# Inherit the upstream /init (s6) ENTRYPOINT; run the gateway as the service.
CMD ["gateway", "run"]
