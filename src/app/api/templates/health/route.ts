import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readJsonIfExists(p: string): Promise<any | null> {
  try {
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET() {
  const templatesDir = path.join(process.cwd(), "public", "templates");

  let entries: Array<{ name: string; isDirectory: boolean }> = [];
  try {
    const dirents = await fs.readdir(templatesDir, { withFileTypes: true });
    entries = dirents.map((d) => ({ name: d.name, isDirectory: d.isDirectory() }));
  } catch {
    return Response.json({ ok: false, error: "templates_dir_missing" }, { status: 500 });
  }

  const premiumDirs = entries
    .filter((e) => e.isDirectory && e.name.endsWith("-premium"))
    .map((e) => e.name)
    .sort();

  const templates = await Promise.all(
    premiumDirs.map(async (slug) => {
      const dir = path.join(templatesDir, slug);
      const previewPdf = path.join(dir, "preview.pdf");
      const thumbnailPng = path.join(dir, "thumbnail.png");
      const manifestPath = path.join(dir, "manifest.json");
      const manifest = await readJsonIfExists(manifestPath);
      return {
        slug,
        assets: {
          previewPdf: `/templates/${slug}/preview.pdf`,
          thumbnail: `/templates/${slug}/thumbnail.png`,
        },
        exists: {
          previewPdf: await exists(previewPdf),
          thumbnail: await exists(thumbnailPng),
          manifest: await exists(manifestPath),
        },
        manifest: manifest
          ? {
              schemaVersion: manifest.schemaVersion,
              sections: manifest.sections,
            }
          : null,
      };
    })
  );

  const healthy = templates.every((t) => t.exists.previewPdf && t.exists.thumbnail);

  return Response.json(
    {
      ok: true,
      healthy,
      count: templates.length,
      templates,
    },
    { status: 200 }
  );
}
