async function startAction(url: string, env: Env) {
	const fUrl = 'https://api.github.com/repos/OWNER/REPO/dispatches';

	// @ts-ignore
	const token = env.GITHUB_ACCESS_TOKEN;

	const data = {
		event_type: 'trigger_event',
		client_payload: {
			url,
		},
	};

	const r = await fetch(fUrl, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Authorization': `token ${token}`,
			'Accept': 'application/vnd.github.v3+json',
		}
	});

	const res = await r.json();
	return res;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		switch (url.pathname) {
			case '/start': {
				const urlParam = url.searchParams.get('url')!;

				await startAction(urlParam, env);

				break;
			}

			default: {
				return new Response('Hello World');
			}
		}
		return new Response('Hello World');
	},
} satisfies ExportedHandler<Env>;
