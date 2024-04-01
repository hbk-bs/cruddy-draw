import { serve } from "https://deno.land/std@0.145.0/http/server.ts";
import { exists } from "https://deno.land/std@0.145.0/fs/mod.ts";
import {
  basename,
  extname,
  join,
} from "https://deno.land/std@0.145.0/path/mod.ts";

// Create server
const server = serve({ port: 8080 });
console.log("HTTP webserver running at: http://localhost:8080");

for await (const request of server) {
  let fullPath = join(Deno.cwd(), request.url.substring(1));

  // Default path to index.html
  if ((await exists(fullPath)) && (await Deno.stat(fullPath)).isDirectory) {
    fullPath = join(fullPath, "index.html");
  }

  if (await exists(fullPath)) {
    // If the requested file exists, we serve it.
    const file = await Deno.readFile(fullPath);
    const ext = extname(fullPath);

    // Set the appropriate mime type based on file extension
    let contentType = "text/plain";
    switch (ext) {
      case ".html":
        contentType = "text/html";
        break;
      case ".js":
        contentType = "application/javascript";
        break;
      case ".css":
        contentType = "text/css";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
    }

    request.respond({
      body: file,
      headers: new Headers({ "content-type": contentType }),
    });
  } else {
    // If the file does not exist, we return a 404 error.
    request.respond({
      status: 404,
      body: `File not found (${basename(fullPath)})`,
    });
  }
}
