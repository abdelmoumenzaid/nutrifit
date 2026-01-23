FROM quay.io/keycloak/keycloak:23.0.7

WORKDIR /opt/keycloak

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start"]
