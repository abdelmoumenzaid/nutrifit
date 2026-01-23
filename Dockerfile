# Multi-stage build pour Keycloak 23.0.7 - Mode OPTIMISÉ
FROM quay.io/keycloak/keycloak:23.0.7 as builder

# Build options (optionnels - les vrais paramètres viennent du runtime)
ENV KC_FEATURES=token-exchange

RUN /opt/keycloak/bin/kc.sh build

# Stage final : Runtime
FROM quay.io/keycloak/keycloak:23.0.7

COPY --from=builder /opt/keycloak/lib /opt/keycloak/lib
COPY --from=builder /opt/keycloak/conf /opt/keycloak/conf
COPY --from=builder /opt/keycloak/providers /opt/keycloak/providers

WORKDIR /opt/keycloak

# Les vrais paramètres viennent des variables d'environnement à RUNTIME
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]
