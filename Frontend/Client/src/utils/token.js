export const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
};

export const getAccessToken = () =>
  getCookie('accessToken') || localStorage.getItem('accessToken');

export const getRefreshToken = () =>
  getCookie('refreshToken') || localStorage.getItem('refreshToken');

export const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    document.cookie = `accessToken=${encodeURIComponent(accessToken)}; path=/`;
  }

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
    document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/`;
  }
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  document.cookie = 'accessToken=; Max-Age=0; path=/';
  document.cookie = 'refreshToken=; Max-Age=0; path=/';
};
