
export default async function api(
    path: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
        body?: unknown,
        params?: { [key: string]: string | number }
    } = {},
    withCredentials = true
) {
    let url = path.startsWith('http') ? path : '/api/' + path;
    if (options.params) {
        const params = new URLSearchParams();
        for (const key in options.params) {
            params.append(key, options.params[key].toString());
        }
        url += '?' + params.toString();
    }
    const res = await fetch(url, {
        method: options.method || 'GET',
        headers: {
            "Content-Type": "application/json",
        },
        credentials: withCredentials ? 'include' : 'omit',
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    if (!res.ok) {
        const err = await res.json();
        if (err.code === 401) { // Unauthorized
            throw new Error('Unauthorized');
            //window.location.replace('/');
            return new Promise(() => {}); // Never resolve because we're redirecting
        }
        throw err;
    } else {
        if (res.status === 204) {
            throw new Error('Empty or bad content');
        }
        return res.json();
    }
}