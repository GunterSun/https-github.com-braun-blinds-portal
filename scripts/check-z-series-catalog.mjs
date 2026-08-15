import { Z_SERIES_CONFIGS, Z_SERIES_FABRICS, Z_SERIES_PRICE_TIERS } from "../data/z-series/catalog-source.ts";

const fail = (message) => {
  console.error(`Z-Series catalog check failed: ${message}`);
  process.exitCode = 1;
};

if (Z_SERIES_CONFIGS.length !== 16) fail(`expected 16 configs, got ${Z_SERIES_CONFIGS.length}`);
if (Z_SERIES_FABRICS.length !== 58) fail(`expected 58 fabrics, got ${Z_SERIES_FABRICS.length}`);
const fabricCodes = Z_SERIES_FABRICS.map((row) => row[0]);
const productCodes = Z_SERIES_CONFIGS.map((row) => row[0]);
if (new Set(fabricCodes).size !== fabricCodes.length) fail("duplicate fabric code");
if (new Set(productCodes).size !== productCodes.length) fail("duplicate product code");

let validRows = 0;
for (const fabric of Z_SERIES_FABRICS) {
  const [fabricCode, seriesZh, seriesEn, descriptionZh, descriptionEn, tierIndex] = fabric;
  if (!fabricCode || !seriesZh || !seriesEn || !descriptionZh || !descriptionEn) {
    fail(`missing bilingual fabric metadata for ${fabricCode || "unknown fabric"}`);
  }
  const tier = Z_SERIES_PRICE_TIERS[tierIndex];
  if (!tier) {
    fail(`missing price tier ${tierIndex} for ${fabricCode}`);
    continue;
  }
  if (tier.length !== Z_SERIES_CONFIGS.length) fail(`tier ${tierIndex} length ${tier.length} does not match config count ${Z_SERIES_CONFIGS.length}`);
  tier.forEach((price, index) => {
    if (price == null) return;
    validRows += 1;
    if (!Number.isFinite(price) || price <= 0) fail(`invalid price ${price} for ${fabricCode}/${Z_SERIES_CONFIGS[index]?.[0]}`);
  });
}

for (const [tierIndex, tier] of Z_SERIES_PRICE_TIERS.entries()) {
  if (tier.length !== Z_SERIES_CONFIGS.length) fail(`tier ${tierIndex} length ${tier.length} does not match config count ${Z_SERIES_CONFIGS.length}`);
}

if (validRows !== 800) fail(`expected 800 valid price rows, got ${validRows}`);

for (const config of Z_SERIES_CONFIGS) {
  const [productCode, systemZh, systemEn, styleZh, styleEn, structureZh, structureEn, constructionZh, constructionEn, minWidth, maxWidth, minHeight, maxHeight, minDepthExclusive] = config;
  if (!productCode || !systemZh || !systemEn || !styleZh || !styleEn || !structureZh || !structureEn || !constructionZh || !constructionEn) {
    fail(`missing bilingual config metadata for ${productCode || "unknown product"}`);
  }
  if (!(minWidth > 0 && maxWidth >= minWidth && minHeight > 0 && maxHeight >= minHeight && minDepthExclusive >= 0)) {
    fail(`invalid size limits for ${productCode}`);
  }
}

const bzm11 = Z_SERIES_FABRICS.find((row) => row[0] === "BZM11");
const lm0002Index = Z_SERIES_CONFIGS.findIndex((row) => row[0] === "LM0002");
if (!bzm11 || lm0002Index < 0) fail("representative BZM11/LM0002 record is missing");
else {
  const actual = Z_SERIES_PRICE_TIERS[bzm11[5]]?.[lm0002Index];
  if (actual !== 559.55) fail(`expected BZM11 + LM0002 retail 559.55, got ${actual}`);
}

if (!process.exitCode) {
  console.log(`Z-Series catalog OK: ${Z_SERIES_FABRICS.length} fabrics, ${Z_SERIES_CONFIGS.length} configs, ${validRows} valid combinations.`);
}
