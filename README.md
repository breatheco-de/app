# 4Geeks.com App

## Getting Started

1. Install Bun:

```bash
# If bun has not been installed in your work environment (Gitpod, Codespaces, and more)
npm install -g bun 
```

2. Install packages:

```bash
bun install
```

3. Copy `.env.example` content to `.env.development` and `.env.production`

4. Then generate required files before start:

```bash
bun prepare-repo
# or
bun run prepare-repo
```

5. Then, run the development server:

```bash
bun run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Asset Registry Cache

### Reset cached lesson:

Assets are cached internally for better performance, you can reset an asset with the following request:

```bash
PUT https://4geeks.com/api/asset/<slug>
```

### Get cached lesson:

You can open the redis terminal in vercel and type: `GET <asset_slug>` to get the latest asset json from the breathecode API. [Here is an example](https://www.awesomescreenshot.com/image/45567980?key=5be790828078a884b05a6f6598510541).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Run lint
```bash
bun run lint:files
```

## Fix lint errors
```bash
bun run lint:fix
```
