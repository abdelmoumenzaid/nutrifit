# Multi-stage build pour Keycloak 23.0.7
FROM quay.io/keycloak/keycloak:23.0.7 as builder

ENV KC_DB=postgres
ENV KC_METRICS_ENABLED=true
ENV KC_FEATURES=token-exchange

RUN /opt/keycloak/bin/kc.sh build

# Stage final : Runtime
FROM quay.io/keycloak/keycloak:23.0.7

COPY --from=builder /opt/keycloak/lib /opt/keycloak/lib
COPY --from=builder /opt/keycloak/conf /opt/keycloak/conf
COPY --from=builder /opt/keycloak/providers /opt/keycloak/providers

ENV KC_DB=postgres
ENV KC_DB_URL_DRIVER=postgresql

WORKDIR /opt/keycloak

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--hostname-strict=false", "--proxy=edge"]
