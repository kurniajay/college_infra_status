export const getApiBase = () => {
  const envBase = import.meta.env.VITE_API_BASE_URL;
  const host = window.location.hostname;
  const port = window.location.port;

  if (envBase && envBase !== "AUTO") {
    if (envBase.includes("localhost") && host !== "localhost") {
      return `${window.location.protocol}//${host}:3000`;
    }
    return envBase;
  }

  // Vite dev/preview ports → use local backend on 3000
  if (["5173", "5174", "4173"].includes(port)) {
    return `${window.location.protocol}//${host}:3000`;
  }

  // K8s/NodePort default
  return `${window.location.protocol}//${host}:30081`;
};
