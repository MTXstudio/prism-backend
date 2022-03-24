export declare global {
	function fetch(url: RequestInfo, init?: RequestInit | undefined): Promise<Response>;
	// eslint-disable-next-line no-var
	var Headers: Headers;
	// eslint-disable-next-line no-var
	var Request: Request;
	// eslint-disable-next-line no-var
	var Response: Response;
}
