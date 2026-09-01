export const endpointAuthTypes = ["none", "bearer", "api_key", "basic"] as const;

export type EndpointAuthType = typeof endpointAuthTypes[number];

export function endpointAuthLabel(authType: EndpointAuthType | undefined) {
  switch (authType) {
    case "bearer": return "Bearer token";
    case "api_key": return "API key";
    case "basic": return "Basic authentication";
    default: return "No authentication";
  }
}
