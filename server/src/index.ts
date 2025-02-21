async function startAction(url: string, env: Env) {
	const fUrl = 'https://api.github.com/repos/xiaochuan-dev/novel-bot/dispatches';

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
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
		},
	});

	const res = await r.text();
	return res;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		// @ts-ignore
		const telegram_token = env.TELEGRAM_TOKEN;

		switch (url.pathname) {

			case `/webhook/${telegram_token}`: {
				const requestBody = await request.json();
				console.log(requestBody);

				break;
			}

			case '/start': {
				if (request.method === 'GET') {
					const urlParam = url.searchParams.get('url')!;
					const res = await startAction(urlParam, env);
					console.log(res);
				}
				if (request.method === 'POST') {
					const requestBody = await request.json();
					console.log(requestBody);
				}

				break;
			}

			default: {
				return new Response('Hello World');
			}
		}
		return new Response('Hello World');
	},
} satisfies ExportedHandler<Env>;
