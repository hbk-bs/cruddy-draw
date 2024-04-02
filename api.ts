// this is the local version of our api that uses deno kv
// you can run this as `deno task api`
// copy the content to a http val on val.town to have a remote version.
// if you
import * as uuid7 from "https://deno.land/x/uuid7@v0.0.1/mod.ts";
import { blob } from "https://esm.town/v/std/blob";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,GET,PUT,DELETE,OPTIONS",
};
const isDenoDeploy = Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;
const IS_LOCAL = Deno.env.get("IS_LOCAL");
interface DBRecord {
  id: string;
  data: unknown;
}
interface Database {
  create: (data: unknown) => Promise<DBRecord>;
  read: (key: string) => Promise<DBRecord | undefined>;
  update: (key: string, data: unknown) => Promise<DBRecord | undefined>;
  delete: (key: string) => Promise<void>;
}
const findBlob: (
  key: string,
  prefix: string,
) => Promise<DBRecord | undefined> = async (key, prefix) => {
  const blobList = await blob.list(prefix);
  // now we need to filter all the elements in result that have the id === key
  // and return the first one
  const record = blobList.find((r) => r.key === `${prefix}_${key}`);
  if (record) {
    const data = (await blob.getJSON(record.key)) as unknown;
    return { id: key, data };
  }
  return undefined;
};
async function createDatabase(
  isLocal: boolean,
  prefix: string,
): Promise<Database> {
  // TODO list all with prefix
  // https://docs.deno.com/deploy/kv/manual/#listing-several-key-value-pairs
  const generateId = uuid7.v7;
  if (isLocal) {
    // using deno kv https://docs.deno.com/deploy/kv/manual/
    const kv = await Deno.openKv(isDenoDeploy ? undefined : "./data/kv");
    return {
      create: async (data) => {
        const id = generateId();
        await kv.set([prefix, id], data);
        return { id, data };
      },
      read: async (key) => {
        const data = await kv.get([prefix, key]);
        return data ? { id: key, data: data.value } : undefined;
      },
      update: async (key, data) => {
        const record = await kv.get([prefix, key]);
        if (!record) {
          return undefined;
        }
        await kv.set([prefix, key], data);
        return { id: key, data };
      },
      delete: async (key) => {
        return await kv.delete([prefix, key]);
      },
    };
  } else {
    // using val town blob https://docs.val.town/std/blob/

    return {
      create: async (data) => {
        const id = generateId();
        await blob.setJSON(`${prefix}_${id}`, data);
        return { id, data };
      },
      read: async (key) => {
        const record = await findBlob(key, prefix);
        if (!record) {
          return undefined;
        }
        return { id: key, data: record.data };
      },
      update: async (key: string, data) => {
        const record = await findBlob(key, prefix);
        if (!record) {
          return undefined;
        }
        await blob.setJSON(`${prefix}_${key}`, data);
        return { id: key, data };
      },
      delete: async (key) => {
        return await blob.delete(`${prefix}_${key}`);
      },
    };
  }
}

export default async function handler(req: Request) {
  console.log(req.method);
  console.log(req.url);
  const url = new URL(req.url);
  const params = new URLSearchParams(url.search);
  console.log("id is: ", params.get("id"));
  const db = await createDatabase(
    IS_LOCAL || isDenoDeploy ? true : false,
    "test",
  );

  switch (req.method) {
    case "OPTIONS": {
      return new Response("ok", {
        headers,
      });
    }
    case "POST": {
      const json = await req.json();
      const record = await db.create(json);
      return new Response(JSON.stringify(record), {
        headers,
        status: 201,
      });
    }
    case "GET": {
      const id = params.get("id");
      if (id) {
        const record = await db.read(id);
        return new Response(JSON.stringify(record), {
          headers,
        });
      } else {
        return new Response(undefined, {
          status: 404,
          statusText: "Not Found",
          headers,
        });
      }
    }
    case "PUT": {
      const id = params.get("id");
      if (id) {
        const json = await req.json();
        const record = await db.update(id, json);
        return new Response(JSON.stringify(record), {
          headers,
          status: 201,
        });
      } else {
        return new Response(undefined, {
          status: 404,
          statusText: "Not Found",
          headers,
        });
      }
    }
    case "DELETE": {
      const id = params.get("id");
      if (id) {
        await db.delete(id);
        return new Response(undefined, {
          status: 204,
          headers,
        });
      } else {
        return new Response(undefined, {
          status: 404,
          statusText: "Not Found",
          headers,
        });
      }
    }
    default: {
      return new Response(undefined, {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }
}

if (IS_LOCAL || isDenoDeploy) {
  Deno.serve(handler);
}
