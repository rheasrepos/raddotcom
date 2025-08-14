type DynamicRoutes = {
	"/posts/[id]": { id: string }
};

type Layouts = {
	"/": { id?: string };
	"/about": undefined;
	"/admin": undefined;
	"/posts": { id?: string };
	"/posts/[id]": { id: string };
	"/projects": undefined;
	"/resume": undefined
};

export type RouteId = "/" | "/about" | "/admin" | "/posts" | "/posts/[id]" | "/projects" | "/resume";

export type RouteParams<T extends RouteId> = T extends keyof DynamicRoutes ? DynamicRoutes[T] : Record<string, never>;

export type LayoutParams<T extends RouteId> = Layouts[T] | Record<string, never>;

export type Pathname = "/" | "/about" | "/admin" | "/posts" | `/posts/${string}` & {} | "/projects" | "/resume";

export type ResolvedPathname = `${"" | `/${string}`}${Pathname}`;

export type Asset = "/favicon.png";