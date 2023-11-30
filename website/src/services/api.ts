
export default async function api(
    path: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
        body?: unknown
        params?: { [key: string]: string | number },
        withCredentials?: boolean
    } = {},
) {
    let credentials: 'omit' | 'include' | undefined;
    if(options.withCredentials !== undefined) {
        credentials = options.withCredentials ? 'include' : 'omit';
    }
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
        credentials,
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    if (!res.ok) {
        let error = "Unexpected error";
        if (res.status === 401) { // Unauthorized
            error = "Unauthorized";
        }
        try {
            error = await res.json();
        } catch (e) {
            console.error("Error parsing json : ", e);
        }
        throw new Error(error);
    } else {
        return res.json();
    }
}