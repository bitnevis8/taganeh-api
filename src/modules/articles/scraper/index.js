const TasnimScraper = require("./sites/tasnim");
const KhabarOnlineScraper = require("./sites/khabaronline");
const mosalasonline = require("./sites/mosalasonline");

async function runTasnimPoliticalScraper() {
  const tasnim = new TasnimScraper();
  return await tasnim.scrapePolitical();
}

async function runTasnimEconomicScraper() {
  const tasnim = new TasnimScraper();
  return await tasnim.scrapeEconomic();
}

async function runTasnimSportsScraper() {
  const tasnim = new TasnimScraper();
  return await tasnim.scrapeSports();
}

async function runTasnimSocialScraper() {
  const tasnim = new TasnimScraper();
  return await tasnim.scrapeSocial();
}

async function runTasnimInternationalScraper() {
  const tasnim = new TasnimScraper();
  return await tasnim.scrapeInternational();
}

async function runTasnimCulturalScraper() {
  const tasnim = new TasnimScraper();
  return await tasnim.scrapeCultural();
}

async function runKhabarOnlinePoliticalScraper() {
  const khabaronline = new KhabarOnlineScraper();
  return await khabaronline.scrapePolitics();
}

async function runKhabarOnlineEconomicScraper() {
  const khabaronline = new KhabarOnlineScraper();
  return await khabaronline.scrapeEconomy();
}

async function runKhabarOnlineSportsScraper() {
  const khabaronline = new KhabarOnlineScraper();
  return await khabaronline.scrapeSports();
}

async function runKhabarOnlineSocietyScraper() {
  const khabaronline = new KhabarOnlineScraper();
  return await khabaronline.scrapeSociety();
}

async function runKhabarOnlineInternationalScraper() {
  const khabaronline = new KhabarOnlineScraper();
  return await khabaronline.scrapeInternational();
}

async function runKhabarOnlineCultureScraper() {
  const khabaronline = new KhabarOnlineScraper();
  return await khabaronline.scrapeCulture();
}

async function scrapeAll() {
  const results = [
    await runTasnimPoliticalScraper(),
    await runTasnimEconomicScraper(),
    await runTasnimSportsScraper(),
    await runTasnimSocialScraper(),
    await runTasnimInternationalScraper(),
    await runTasnimCulturalScraper(),
    await runKhabarOnlinePoliticalScraper(),
    await runKhabarOnlineEconomicScraper(),
    await runKhabarOnlineSportsScraper(),
    await runKhabarOnlineSocietyScraper(),
    await runKhabarOnlineInternationalScraper(),
    await runKhabarOnlineCultureScraper(),
  ];
  const mosalasonlinePolitics = await mosalasonline.scrapePolitics().catch(() => []);
  return [
    ...results,
    ...mosalasonlinePolitics,
  ];
}

async function scrapeAndSaveAll() {
  let results = [
    await runTasnimPoliticalScraper(),
    await runTasnimEconomicScraper(),
    await runTasnimSportsScraper(),
    await runTasnimSocialScraper(),
    await runTasnimInternationalScraper(),
    await runTasnimCulturalScraper(),
    await runKhabarOnlinePoliticalScraper(),
    await runKhabarOnlineEconomicScraper(),
    await runKhabarOnlineSportsScraper(),
    await runKhabarOnlineSocietyScraper(),
    await runKhabarOnlineInternationalScraper(),
    await runKhabarOnlineCultureScraper(),
  ];
  try { results.push(await mosalasonline.scrapeAndSavePolitics()); } catch {}
  return results;
}

module.exports = {
  runTasnimPoliticalScraper,
  runTasnimEconomicScraper,
  runTasnimSportsScraper,
  runTasnimSocialScraper,
  runTasnimInternationalScraper,
  runTasnimCulturalScraper,
  runKhabarOnlinePoliticalScraper,
  runKhabarOnlineEconomicScraper,
  runKhabarOnlineSportsScraper,
  runKhabarOnlineSocietyScraper,
  runKhabarOnlineInternationalScraper,
  runKhabarOnlineCultureScraper,
  TasnimScraper,
  KhabarOnlineScraper
}; 