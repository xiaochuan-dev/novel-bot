async function sendMessage(env: Env, chatId: any, message: string) {
	// @ts-ignore
	const telegram_token = env.TELEGRAM_TOKEN;
    const url = `https://api.telegram.org/bot${telegram_token}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('消息发送成功:', data);
    } catch (error) {
        console.error('发送消息时出错:', error);
    }
}

async function startAction({ url, env, chatId }: { url: string; env: Env; chatId?: string }) {
	const fUrl = 'https://api.github.com/repos/xiaochuan-dev/novel-bot/dispatches';

	// @ts-ignore
	const token = env.GITHUB_ACCESS_TOKEN;

	const data = {
		event_type: 'trigger_event',
		client_payload: {
			url,
			chatId
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

async function queryStatus(env: Env): Promise<string> {
	// @ts-ignore
	const token = env.GITHUB_ACCESS_TOKEN;
	const url = `https://api.github.com/repos/xiaochuan-dev/novel-bot/actions/runs?status=in_progress`;
	const r = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
		},
	});

	const res: any = await r.json();
	if (res.total_count > 0) {
		return `${res.total_count}个任务正在运行`;
	} else {
		return `无任务正在运行`;
	}
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		// @ts-ignore
		const telegram_token = env.TELEGRAM_TOKEN;

		switch (url.pathname) {
			case `/webhook/${telegram_token}`: {
				const requestBody: any = await request.json();
				console.log(requestBody);

				const t: string = requestBody.message.text;

				if (t === '/query') {
					const res = await queryStatus(env);
					const chatId = requestBody.message.chat.id;
					await sendMessage(env, chatId, res);
					return new Response(res);
				}

				if (t.startsWith('http')) {
					const chatId = requestBody.message.chat.id;
					await startAction({ url: t, env, chatId });
					return new Response('开始爬取');
				} else {
					return new Response('url有误');
				}

				break;
			}

			case '/start': {
				if (request.method === 'GET') {
					const urlParam = url.searchParams.get('url')!;
					const res = await startAction({ url: urlParam, env });
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
