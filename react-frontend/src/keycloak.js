import Keycloak from "keycloak-js";

// ✅ Update these values with your actual Keycloak details
const keycloak = new Keycloak({
  url: "http://localhost:8080", // your Keycloak URL
  realm: "mlc-realm",           // your realm name
  clientId: "mlc-frontend",     // your client ID
});

export default keycloak;
