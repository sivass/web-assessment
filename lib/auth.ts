export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth-token="))
    ?.split("=")[1];
    
  console.log('Getting auth token:', token);
  return token;
};

export const removeAuthToken = () => {
  if (typeof window === "undefined") return;
  
  document.cookie = "auth-token=; Max-Age=0; path=/";
  console.log('Removed auth token');
};
