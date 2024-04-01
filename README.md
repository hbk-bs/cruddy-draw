# CRUD Site

Small CRUD Site that uses deno and val.town

## Pre-requisites

- Install deno (https://docs.deno.com/runtime/manual)

```bash
deno install --allow-net --allow-read --allow-write --allow-run https://deno.land/x/denoliver/mod.ts
```

## Run the site

```bash
deno task dev
```

## Run the api (locally)

```bash
IS_LOCAL=true deno run --allow-net api.ts
```

Copy the code from api.ts into a http [val.town](https://www.val.town/) and use
it as
