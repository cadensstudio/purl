import { AwsClient } from 'aws4fetch';

interface Env {
	ACCESS_KEY_ID: string;
	SECRET_ACCESS_KEY: string;
	ACCOUNT_ID: string;
	BUCKET_NAME: string;
}

export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		const r2 = new AwsClient({
			accessKeyId: env.ACCESS_KEY_ID,
			secretAccessKey: env.SECRET_ACCESS_KEY,
		});

		const url = new URL(req.url);
		const pathname = url.pathname;

		// Extract the path to the file from the URL (expected format: url/path/to/upload/file)
		const pathSegments = pathname.split('/').filter(Boolean); // Remove empty segments
		if (pathSegments.length < 2) {
			return new Response('Invalid URL format', { status: 400 });
		}

		const folderName = pathSegments.slice(0, -1).join('/');
		const filename = pathSegments[pathSegments.length - 1];

		if (!filename || !folderName) {
			return new Response('Missing filename or folderName', { status: 400 });
		}

		const accountId = env.ACCOUNT_ID;
		const bucketName = env.BUCKET_NAME;

		const r2Url = new URL(`https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${folderName}/${filename}`);

		r2Url.searchParams.set('X-Amz-Expires', '3600'); // URL valid for 1 hour

		const signedUrl = await r2.sign(new Request(r2Url, { method: 'PUT' }), { aws: { signQuery: true } });

		return new Response(JSON.stringify({ url: signedUrl.url }), { status: 200 });
	},
};
