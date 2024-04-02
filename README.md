# CRUD Site

Small CRUD Site that uses deno and val.town

## Pre-requisites

- Deno installed (https://docs.deno.com/runtime/manual)
- GitHub account
- Val.town account
- Deno Deploy account

## Development

### Run the site

you might to have to reload your site to see the changes (I unfortunatley did
not find anything compareable to budo, reload for deno)

```bash
deno task dev
```

### Run the API (locally)

```bash
IS_LOCAL=true deno run --allow-net api.ts
```

## Deploy

### Site

Use a hoster of your liking, [netlify.com](https://netlify.com),
[vercel.com](https://vercel.com), [cloudflare.com](https://cloudflare.com), etc.
We used simple [GitHub pages](https://pages.github.com/) for this example.

### API

Copy the code from api.ts into a http [val.town](https://www.val.town/) and use
its http endpoint as `API_URL` in `index.js` or deploy it to deno deploy using
deplyctrl (`deno install -Arf jsr:@deno/deployctl` and then
`deployctl deploy api.ts --prod --save-config`)
