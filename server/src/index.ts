async function startAction(url: string, env: Env) {
	const fUrl = "https://api.github.com/repos/xiaochuan-dev/novel-bot/dispatches";

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
			'Authorization': `Bearer ${token}`,
			'Accept': 'application/vnd.github.v3+json',
		}
	});

	const res = await r.text();
	return res;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		switch (url.pathname) {
			case '/start': {
				const urlParam = url.searchParams.get('url')!;

				const res = await startAction(urlParam, env);
				console.log(res);

				break;
			}

			default: {
				return new Response('Hello World');
			}
		}
		return new Response('Hello World');
	},
} satisfies ExportedHandler<Env>;
