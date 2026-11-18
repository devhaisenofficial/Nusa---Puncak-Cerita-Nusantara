import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../..");
const datasetPath = path.join(scriptDirectory, "alam_indonesia.json");
const imagesDirectory = path.join(projectRoot, "public", "images", "peaks");
const attributionPath = path.join(scriptDirectory, "peak-image-attributions.json");
const apiUrl = "https://commons.wikimedia.org/w/api.php";
const imageWidth = 1600;
const apiRequestInterval = 1800;
const imagePoolSourceIds = [
  2, 4, 5, 8, 9, 10, 15, 16, 18, 19,
  22, 24, 25, 31, 40, 45, 47, 48, 53, 61,
  67, 69, 73, 107, 110, 114, 115, 118, 121, 255,
];
const headers = {
  "User-Agent": "EcoAtlasNusantara/1.0 (local Indonesian mountain image catalogue)",
};

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
let apiQueue = Promise.resolve();
let nextApiRequestAt = 0;

function getSha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function requestApi(url) {
  const pendingRequest = apiQueue.then(async () => {
    const wait = Math.max(0, nextApiRequestAt - Date.now());
    if (wait > 0) await sleep(wait);
    nextApiRequestAt = Date.now() + apiRequestInterval;
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
    if (response.status === 429 || response.status >= 500) {
      const retryAfter = Number(response.headers.get("retry-after"));
      if (Number.isFinite(retryAfter) && retryAfter > 0) {
        nextApiRequestAt = Math.max(nextApiRequestAt, Date.now() + retryAfter * 1000);
      }
    }
    return response;
  });
  apiQueue = pendingRequest.then(() => undefined, () => undefined);
  return pendingRequest;
}

function plainText(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&#039;/g, "'").trim();
}

function normalize(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getPeakTerms(name) {
  return normalize(name.replace(/\s*\([^)]*\)/g, " "))
    .split(" ")
    .filter((term) => term.length > 2 && !["gunung", "bukit", "mount", "mountain", "mt", "puncak"].includes(term));
}

function relevanceScore(peak, page, info) {
  const terms = getPeakTerms(peak.name);
  if (terms.length === 0) return 0;

  const title = normalize(page.title);
  const description = normalize(plainText(info.extmetadata?.ImageDescription?.value));
  const categories = normalize(plainText(info.extmetadata?.Categories?.value));
  const allText = `${title} ${description} ${categories}`;
  const matchedCount = terms.filter((term) => allText.includes(term)).length;
  if (matchedCount !== terms.length) return 0;
  const hasMountainContext = /\b(mount|mountain|gunung|bukit|puncak|volcano|volcanic|crater|caldera|summit|ridge|peak)\b/i.test(
    `${title} ${description}`,
  ) || terms.some((term) => title.includes(`g ${term}`));
  if (!hasMountainContext) return 0;

  const titleMatches = terms.filter((term) => title.includes(term)).length;
  const descriptionMatches = terms.filter((term) => description.includes(term)).length;
  return 20 + titleMatches * 10 + descriptionMatches * 3;
}

function hasReusableLicense(info) {
  const license = info.extmetadata?.LicenseShortName?.value?.trim() ?? "";
  return /^(CC\b|Creative Commons\b|Public domain\b|Public Domain\b|CC0\b|GFDL\b)/i.test(license);
}

function getExtension(mime) {
  return {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[mime];
}

async function requestJson(url) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let response;
    try {
      response = await requestApi(url);
    } catch (error) {
      if (attempt === 3) throw error;
      await sleep(1500 * (attempt + 1));
      continue;
    }
    if (response.ok) return response.json();

    if (response.status !== 429 && response.status < 500) {
      throw new Error(`Wikimedia API returned HTTP ${response.status}`);
    }

    const retryAfter = Number(response.headers.get("retry-after"));
    await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1500 * (attempt + 1));
  }
  throw new Error("Wikimedia API remained unavailable after retries");
}

const normalizeTitle = (title) => title.trim().replace(/_/g, " ").replace(/\s+/g, " ").toLocaleLowerCase("en");

async function findImage(peak, savedSource, savedInfoByTitle) {
  if (savedSource?.sourceFile) {
    const savedPage = savedInfoByTitle.get(normalizeTitle(savedSource.sourceFile));
    const savedInfo = savedPage?.imageinfo?.[0];
    if (savedPage && savedInfo && getExtension(savedInfo.mime) && hasReusableLicense(savedInfo)) {
      return { page: savedPage, info: savedInfo, score: 0 };
    }
  }

  const cleanedName = peak.name.replace(/\s*\([^)]*\)/g, " ").trim();
  const searchName = /^(gunung|bukit|puncak)\b/i.test(cleanedName)
    ? cleanedName
    : `Gunung ${cleanedName}`;
  const searchUrl = new URL(apiUrl);
  searchUrl.search = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `"${searchName}" ${peak.province.split("/")[0].trim()}`,
    gsrnamespace: "6",
    gsrwhat: "text",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: String(imageWidth),
  }).toString();

  const data = await requestJson(searchUrl);
  const pages = Object.values(data.query?.pages ?? {});
  const candidates = pages
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info || !getExtension(info.mime) || !hasReusableLicense(info)) return null;
      const score = relevanceScore(peak, page, info);
      return score > 0 ? { page, info, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  if (candidates[0]) return candidates[0];
  if (!savedSource?.sourceFile) return null;

  searchUrl.search = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    titles: savedSource.sourceFile,
    iiprop: "url|mime|extmetadata",
    iiurlwidth: String(imageWidth),
  }).toString();
  const savedData = await requestJson(searchUrl);
  const page = Object.values(savedData.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!page || !info || !getExtension(info.mime) || !hasReusableLicense(info)) return null;
  return { page, info, score: 0 };
}

async function downloadImage(url, outputPath) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    let response;
    try {
      response = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
    } catch (error) {
      if (attempt === 4) throw error;
      await sleep(2000 * (attempt + 1));
      continue;
    }
    if (response.ok) {
      const contentType = response.headers.get("content-type")?.split(";")[0].toLocaleLowerCase("en");
      if (!contentType?.startsWith("image/")) {
        throw new Error(`Unexpected image content type: ${contentType ?? "missing"}`);
      }

      const image = Buffer.from(await response.arrayBuffer());
      if (image.length < 2048) throw new Error(`Image response is unexpectedly small (${image.length} bytes)`);

      const temporaryPath = `${outputPath}.tmp`;
      await fs.writeFile(temporaryPath, image);
      await fs.rename(temporaryPath, outputPath);
      return;
    }

    if (response.status !== 429 && response.status < 500) {
      throw new Error(`Image download returned HTTP ${response.status}`);
    }

    const retryAfter = Number(response.headers.get("retry-after"));
    await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2000 * (attempt + 1));
  }
  throw new Error("Image host remained unavailable after retries");
}

async function main() {
  const dataset = JSON.parse(await fs.readFile(datasetPath, "utf8"));
  if (!Array.isArray(dataset.peaks)) throw new Error("Dataset must contain a peaks array");
  await fs.mkdir(imagesDirectory, { recursive: true });

  const savedAttributions = await fs.readFile(attributionPath, "utf8")
    .then((contents) => JSON.parse(contents))
    .catch((error) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
  const savedSources = new Map(savedAttributions.map((image) => [image.sourceId, image]));
  const savedTitles = [...savedSources.values()].map((image) => image.sourceFile).filter(Boolean);
  const savedInfoByTitle = new Map();
  if (savedTitles.length > 0) {
    const sourceUrl = new URL(apiUrl);
    sourceUrl.search = new URLSearchParams({
      action: "query",
      format: "json",
      prop: "imageinfo",
      titles: savedTitles.join("|"),
      iiprop: "url|mime|extmetadata",
      iiurlwidth: String(imageWidth),
    }).toString();
    const data = await requestJson(sourceUrl);
    for (const page of Object.values(data.query?.pages ?? {})) {
      savedInfoByTitle.set(normalizeTitle(page.title), page);
    }
  }
  if (
    savedAttributions.length === imagePoolSourceIds.length
    && imagePoolSourceIds.every((sourceId, index) => savedAttributions[index]?.sourceId === sourceId)
    && (await Promise.all(savedAttributions.map(async (image) => {
      const localFile = path.join(projectRoot, "public", image.localPath.replace(/^\//, ""));
      const stat = await fs.stat(localFile).catch((error) => {
        if (error.code === "ENOENT") return null;
        throw error;
      });
      if (!stat || stat.size < 2048 || !(image.imageWidth >= imageWidth) || !image.contentSha256) return false;
      return getSha256(await fs.readFile(localFile)) === image.contentSha256;
    }))).every(Boolean)
  ) {
    dataset.peaks.forEach((peak, index) => {
      peak.image = `/images/peaks/indonesia-mountain-${String((index % 30) + 1).padStart(2, "0")}.jpg`;
    });
    await fs.writeFile(datasetPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
    console.log(`Verified existing pool of 30 licensed Indonesian mountain photos across ${dataset.peaks.length} records.`);
    return;
  }

  const downloadedSourceImages = [];
  const missing = [];
  const attributions = [];

  async function processPeak(index) {
    const peak = dataset.peaks.find((item) => item.id === imagePoolSourceIds[index]);
    if (!peak) throw new Error(`Dataset is missing source peak ID ${imagePoolSourceIds[index]}`);
    try {
      const savedSource = savedSources.get(peak.id);
      if (savedSource?.imageWidth >= imageWidth && savedSource.contentSha256) {
        const sourcePath = path.join(projectRoot, "public", savedSource.localPath.replace(/^\//, ""));
        const sourceBuffer = await fs.readFile(sourcePath).catch((error) => {
          if (error.code === "ENOENT") return null;
          throw error;
        });
        if (sourceBuffer && getSha256(sourceBuffer) === savedSource.contentSha256) {
          downloadedSourceImages.push({
            sourceId: peak.id,
            sourceBuffer,
            sourceFile: savedSource.sourceFile,
            sourcePage: savedSource.sourcePage,
            author: savedSource.author,
            license: savedSource.license,
            licenseUrl: savedSource.licenseUrl,
            description: savedSource.description,
            imageWidth: savedSource.imageWidth,
            name: peak.name,
          });
          console.log(`[${index + 1}/${imagePoolSourceIds.length}] REUSE: ${peak.name}`);
          return;
        }
      }

      const candidate = await findImage(peak, savedSource, savedInfoByTitle);
      if (!candidate) {
        missing.push(peak);
        console.log(`[${index + 1}/${imagePoolSourceIds.length}] NO MATCH: ${peak.name}; retaining existing image`);
        return;
      }

      const { page, info } = candidate;
      const sourceFilename = `peak-${peak.id}.${getExtension(info.mime)}`;
      const sourcePath = path.join(imagesDirectory, sourceFilename);
      const existingImage = await fs.stat(sourcePath).catch((error) => {
        if (error.code === "ENOENT") return null;
        throw error;
      });
      if (!existingImage || existingImage.size < 2048) {
        await downloadImage(info.thumburl ?? info.url, sourcePath);
      }

      const metadata = info.extmetadata ?? {};
      downloadedSourceImages.push({
        sourceId: peak.id,
        sourcePath,
        sourceFile: page.title,
        sourcePage: info.descriptionurl,
        author: plainText(metadata.Artist?.value || metadata.Credit?.value || "Author not listed"),
        license: metadata.LicenseShortName?.value || "License not listed",
        licenseUrl: metadata.LicenseUrl?.value || "",
        description: plainText(metadata.ImageDescription?.value || ""),
        imageWidth: info.thumbwidth ?? info.width,
        name: peak.name,
      });
      console.log(`[${index + 1}/${imagePoolSourceIds.length}] OK: ${peak.name} -> ${sourceFilename}`);
    } catch (error) {
      missing.push(peak);
      console.error(`[${index + 1}/${imagePoolSourceIds.length}] ERROR: ${peak.name}: ${error.message}`);
    }
  }

  for (let index = 0; index < imagePoolSourceIds.length; index += 1) {
    await processPeak(index);
  }
  if (downloadedSourceImages.length !== imagePoolSourceIds.length) {
    throw new Error(
      `Could not verify all 30 photos; found ${downloadedSourceImages.length}. Dataset was not updated.`,
    );
  }

  downloadedSourceImages.sort(
    (a, b) => imagePoolSourceIds.indexOf(a.sourceId) - imagePoolSourceIds.indexOf(b.sourceId),
  );
  for (const image of downloadedSourceImages) {
    if (!image.sourceBuffer) image.sourceBuffer = await fs.readFile(image.sourcePath);
  }
  for (const [index, image] of downloadedSourceImages.entries()) {
    const poolFilename = `indonesia-mountain-${String(index + 1).padStart(2, "0")}.jpg`;
    await fs.writeFile(path.join(imagesDirectory, poolFilename), image.sourceBuffer);
    attributions.push({
      id: index + 1,
      sourceId: image.sourceId,
      name: image.name,
      localPath: `/images/peaks/${poolFilename}`,
      contentSha256: getSha256(image.sourceBuffer),
      sourceFile: image.sourceFile,
      sourcePage: image.sourcePage,
      author: image.author,
      license: image.license,
      licenseUrl: image.licenseUrl,
      description: image.description,
      imageWidth: image.imageWidth,
    });
  }

  for (const filename of await fs.readdir(imagesDirectory)) {
    if (/^peak-\d+\.(jpg|png|webp)$/i.test(filename)) {
      await fs.unlink(path.join(imagesDirectory, filename));
    }
  }

  dataset.peaks.forEach((peak, index) => {
    peak.image = `/images/peaks/indonesia-mountain-${String((index % 30) + 1).padStart(2, "0")}.jpg`;
  });
  await fs.writeFile(datasetPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
  await fs.writeFile(attributionPath, `${JSON.stringify(attributions, null, 2)}\n`, "utf8");

  console.log(
    `\nFinished: ${attributions.length} licensed local photos assigned across ${dataset.peaks.length} peaks.`,
  );
  if (missing.length > 0) {
    console.log(`No verified matching photo for IDs: ${missing.map((peak) => peak.id).join(", ")}`);
  }
}

main().catch((error) => {
  console.error("Peak image fetch failed:", error);
  process.exitCode = 1;
});
