export const getSchedulingErrorMessage = (error, fallback) => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  const data = error?.response?.data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (Array.isArray(data)) return data.join(" ");
  if (typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const value = data[firstKey];
      if (Array.isArray(value)) return value.join(" ");
      if (typeof value === "string") return value;
    }
  }
  return error.message || fallback;
};
