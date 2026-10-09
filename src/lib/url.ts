// Base-path aware internal URLs, so the site works at a domain root or under /portfolio (GitHub project pages).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const u = (path: string) => (/^(https?:|mailto:|#)/.test(path) ? path : base + (path.startsWith('/') ? path : `/${path}`));
