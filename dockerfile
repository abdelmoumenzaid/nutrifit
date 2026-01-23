# Stage 1: Build optimized Keycloak runtime
FROM quay.io/keycloak/keycloak:23.0.7 as builder

ENV KC_DB=postgres
ENV KC_FEATURES=token-exchange

RUN /opt/keycloak/bin/kc.sh build

# Stage 2: Runtime image
FROM quay.io/keycloak/keycloak:23.0.7

COPY --from=builder /opt/keycloak/lib /opt/keycloak/lib
COPY --from=builder /opt/keycloak/server /opt/keycloak/server

ENV KC_DB=postgres

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]
