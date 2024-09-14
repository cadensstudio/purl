# pURL

## Overview

PURL is a Cloudflare Worker that generates presigned URLs to securely upload files to Cloudflare R2 using the S3 API. Presigned URLs allow clients to upload files directly to R2 without requiring full access to your Cloudflare R2 credentials. This worker generates these URLs on the fly, ensuring that the upload process is secure and controlled.

## Key Features

- Secure Uploads: Generate presigned URLs that authorize specific PUT operations to R2 buckets, allowing for secure and temporary access to upload files.
- Flexible Configuration: Easily configure the Worker to handle uploads to specific folders and files within your R2 bucket.
- Expiry Control: Set expiration times for the presigned URLs, ensuring that the URLs can only be used within a limited time window.
- R2 Integration: Directly integrates with Cloudflare R2 using the S3-compatible API, making it straightforward to manage object storage in R2.

## Local Development Setup

1. Ensure you have configured the necessary environment variables outlined in `.dev.vars.example`. The `ACCESS_KEY_ID` and `SECRET_ACCESS_KEY` variables can be obtained from your Cloudflare R2 dashboard.

    ```bash
    cp .dev.vars.example .dev.vars
    ```
2. Start the development server.

    ```bash
    npm run dev
    ```

3. Send a GET request to the running worker.

    ```bash
    curl http://localhost:8787/image/example.png
    ```
4. Send a PUT request to the presigned URL to upload the image file.

    ```bash
    curl -X PUT "<presignedURL>" -H "Content-Type: image/png" --upload-file "/path/to/example.png"
    ```
## Configuration Options

- **URL Expiration**: This Worker sets an expiry time of 3600 seconds (1 hour). This value can be anything between 1 second and 604,800 seconds (7 days).
    ```ts
    r2Url.searchParams.set('X-Amz-Expires', '3600'); // URL valid for 1 hour
    ```

- **URL Parsing**: The Worker extracts the folder and file names from the incoming request URL to ensure that a valid object path is provided.
    ```ts
    const url = new URL(req.url);
		const pathname = url.pathname;

		// Extract the path to the file from the URL (expected format: url/path/to/upload/file)
		const pathSegments = pathname.split('/').filter(Boolean); // Remove empty segments
		if (pathSegments.length < 2) {
			return new Response('Invalid URL format', { status: 400 });
		}
    ```

- For additional configuration options, see [Cloudflare's Docs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/).

## License

This project is licensed under the [MIT License](LICENSE).
