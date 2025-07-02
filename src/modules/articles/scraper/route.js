const express = require("express");
const router = express.Router();
const scraperController = require("./controller");

// -------------------------------------------------------------------------
// روت‌های تسنیم
// -------------------------------------------------------------------------
router.get("/tasnim/political", scraperController.scrapeTasnimPolitical);
router.post("/tasnim/political/save", scraperController.scrapeAndSaveTasnimPolitical);
router.get("/tasnim/economic", scraperController.scrapeTasnimEconomic);
router.post("/tasnim/economic/save", scraperController.scrapeAndSaveTasnimEconomic);
router.get("/tasnim/sports", scraperController.scrapeTasnimSports);
router.post("/tasnim/sports/save", scraperController.scrapeAndSaveTasnimSports);
router.get("/tasnim/social", scraperController.scrapeTasnimSocial);
router.post("/tasnim/social/save", scraperController.scrapeAndSaveTasnimSocial);
router.get("/tasnim/international", scraperController.scrapeTasnimInternational);
router.post("/tasnim/international/save", scraperController.scrapeAndSaveTasnimInternational);
router.get("/tasnim/cultural", scraperController.scrapeTasnimCultural);
router.post("/tasnim/cultural/save", scraperController.scrapeAndSaveTasnimCultural);
router.get("/tasnim/science-tech", scraperController.scrapeTasnimScienceTech);
router.post("/tasnim/science-tech/save", scraperController.scrapeAndSaveTasnimScienceTech);

// -------------------------------------------------------------------------
// روت‌های خبرآنلاین
// -------------------------------------------------------------------------
router.get("/khabaronline/political", scraperController.scrapeKhabarOnlinePolitical);
router.post("/khabaronline/political/save", scraperController.scrapeAndSaveKhabarOnlinePolitical);
router.get("/khabaronline/economic", scraperController.scrapeKhabarOnlineEconomic);
router.post("/khabaronline/economic/save", scraperController.scrapeAndSaveKhabarOnlineEconomic);
router.get("/khabaronline/sports", scraperController.scrapeKhabarOnlineSports);
router.post("/khabaronline/sports/save", scraperController.scrapeAndSaveKhabarOnlineSports);
router.get("/khabaronline/society", scraperController.scrapeKhabarOnlineSociety);
router.post("/khabaronline/society/save", scraperController.scrapeAndSaveKhabarOnlineSociety);
router.get("/khabaronline/international", scraperController.scrapeKhabarOnlineInternational);
router.post("/khabaronline/international/save", scraperController.scrapeAndSaveKhabarOnlineInternational);
router.get("/khabaronline/culture", scraperController.scrapeKhabarOnlineCulture);
router.post("/khabaronline/culture/save", scraperController.scrapeAndSaveKhabarOnlineCulture);
router.get("/khabaronline/science-tech", scraperController.scrapeKhabarOnlineScienceTech);
router.post("/khabaronline/science-tech/save", scraperController.scrapeAndSaveKhabarOnlineScienceTech);

// -------------------------------------------------------------------------
// روت‌های اطلاعات آنلاین
// -------------------------------------------------------------------------
router.get("/ettelaat/political", scraperController.scrapeEttelaatPolitical);
router.post("/ettelaat/political/save", scraperController.scrapeAndSaveEttelaatPolitical);
router.get("/ettelaat/economic", scraperController.scrapeEttelaatEconomic);
router.post("/ettelaat/economic/save", scraperController.scrapeAndSaveEttelaatEconomic);
router.get("/ettelaat/sports", scraperController.scrapeEttelaatSports);
router.post("/ettelaat/sports/save", scraperController.scrapeAndSaveEttelaatSports);
router.get("/ettelaat/international", scraperController.scrapeEttelaatInternational);
router.post("/ettelaat/international/save", scraperController.scrapeAndSaveEttelaatInternational);
router.get("/ettelaat/culture-art", scraperController.scrapeEttelaatCultureArt);
router.post("/ettelaat/culture-art/save", scraperController.scrapeAndSaveEttelaatCultureArt);
router.get("/ettelaat/social", scraperController.scrapeEttelaatSocial);
router.post("/ettelaat/social/save", scraperController.scrapeAndSaveEttelaatSocial);
router.get("/ettelaat/science-tech", scraperController.scrapeEttelaatScienceTech);
router.post("/ettelaat/science-tech/save", scraperController.scrapeAndSaveEttelaatScienceTech);

// -------------------------------------------------------------------------
// روت جمعی همه سایت‌ها
// -------------------------------------------------------------------------
router.get("/all", scraperController.scrapeAll);
router.post("/all/save", scraperController.scrapeAndSaveAll);

// -------------------------------------------------------------------------
// روت‌های افکار نیوز
// -------------------------------------------------------------------------
router.get("/afkarnews/politics", scraperController.scrapeAfkarNewsPolitics);
router.post("/afkarnews/politics/save", scraperController.scrapeAndSaveAfkarNewsPolitics);
router.get("/afkarnews/sports", scraperController.scrapeAfkarNewsSports);
router.post("/afkarnews/sports/save", scraperController.scrapeAndSaveAfkarNewsSports);
router.get("/afkarnews/economy", scraperController.scrapeAfkarNewsEconomy);
router.post("/afkarnews/economy/save", scraperController.scrapeAndSaveAfkarNewsEconomy);
router.get("/afkarnews/international", scraperController.scrapeAfkarNewsInternational);
router.post("/afkarnews/international/save", scraperController.scrapeAndSaveAfkarNewsInternational);
router.get("/afkarnews/social", scraperController.scrapeAfkarNewsSocial);
router.post("/afkarnews/social/save", scraperController.scrapeAndSaveAfkarNewsSocial);
router.get("/afkarnews/culture-art", scraperController.scrapeAfkarNewsCultureArt);
router.post("/afkarnews/culture-art/save", scraperController.scrapeAndSaveAfkarNewsCultureArt);

// -------------------------------------------------------------------------
// روت‌های پارس نیوز
// -------------------------------------------------------------------------
router.get("/parsnews/politics", scraperController.scrapeParsNewsPolitics);
router.post("/parsnews/politics/save", scraperController.scrapeAndSaveParsNewsPolitics);
router.get("/parsnews/international", scraperController.scrapeParsNewsInternational);
router.post("/parsnews/international/save", scraperController.scrapeAndSaveParsNewsInternational);
router.get("/parsnews/economy", scraperController.scrapeParsNewsEconomy);
router.post("/parsnews/economy/save", scraperController.scrapeAndSaveParsNewsEconomy);
router.get("/parsnews/social", scraperController.scrapeParsNewsSocial);
router.post("/parsnews/social/save", scraperController.scrapeAndSaveParsNewsSocial);
router.get("/parsnews/sports", scraperController.scrapeParsNewsSports);
router.post("/parsnews/sports/save", scraperController.scrapeAndSaveParsNewsSports);
router.get("/parsnews/culture-art", scraperController.scrapeParsNewsCultureArt);
router.post("/parsnews/culture-art/save", scraperController.scrapeAndSaveParsNewsCultureArt);

// Fararu
router.get("/fararu/politics", scraperController.scrapeFararuPolitical);
router.post("/fararu/politics/save", scraperController.scrapeAndSaveFararuPolitical);
router.get("/fararu/sports", scraperController.scrapeFararuSports);
router.post("/fararu/sports/save", scraperController.scrapeAndSaveFararuSports);
router.get("/fararu/science-tech", scraperController.scrapeFararuScienceTech);
router.post("/fararu/science-tech/save", scraperController.scrapeAndSaveFararuScienceTech);
router.get("/fararu/economy", scraperController.scrapeFararuEconomy);
router.post("/fararu/economy/save", scraperController.scrapeAndSaveFararuEconomy);
router.get("/fararu/society", scraperController.scrapeFararuSociety);
router.post("/fararu/society/save", scraperController.scrapeAndSaveFararuSociety);
router.get("/fararu/culture-art", scraperController.scrapeFararuCultureArt);
router.post("/fararu/culture-art/save", scraperController.scrapeAndSaveFararuCultureArt);
router.get("/fararu/international", scraperController.scrapeFararuInternational);
router.post("/fararu/international/save", scraperController.scrapeAndSaveFararuInternational);

router.get("/hamshahri-online/politics", scraperController.scrapeHamshahriOnlinePolitics);
router.post("/hamshahri-online/politics/save", scraperController.scrapeAndSaveHamshahriOnlinePolitics);
router.get("/hamshahri-online/international", scraperController.scrapeHamshahriOnlineInternational);
router.post("/hamshahri-online/international/save", scraperController.scrapeAndSaveHamshahriOnlineInternational);
router.get("/hamshahri-online/social", scraperController.scrapeHamshahriOnlineSocial);
router.post("/hamshahri-online/social/save", scraperController.scrapeAndSaveHamshahriOnlineSocial);
router.get("/hamshahri-online/economy", scraperController.scrapeHamshahriOnlineEconomy);
router.post("/hamshahri-online/economy/save", scraperController.scrapeAndSaveHamshahriOnlineEconomy);
router.get("/hamshahri-online/science-tech", scraperController.scrapeHamshahriOnlineScienceTech);
router.post("/hamshahri-online/science-tech/save", scraperController.scrapeAndSaveHamshahriOnlineScienceTech);
router.get("/hamshahri-online/culture-art", scraperController.scrapeHamshahriOnlineCultureArt);
router.post("/hamshahri-online/culture-art/save", scraperController.scrapeAndSaveHamshahriOnlineCultureArt);
router.get("/hamshahri-online/sports", scraperController.scrapeHamshahriOnlineSports);
router.post("/hamshahri-online/sports/save", scraperController.scrapeAndSaveHamshahriOnlineSports);

router.get("/namehnews/politics", scraperController.scrapeNamehNewsPolitics);
router.post("/namehnews/politics/save", scraperController.scrapeAndSaveNamehNewsPolitics);
router.get("/namehnews/economy", scraperController.scrapeNamehNewsEconomy);
router.post("/namehnews/economy/save", scraperController.scrapeAndSaveNamehNewsEconomy);
router.get("/namehnews/sports", scraperController.scrapeNamehNewsSports);
router.post("/namehnews/sports/save", scraperController.scrapeAndSaveNamehNewsSports);
router.get("/namehnews/science-tech", scraperController.scrapeNamehNewsScienceTech);
router.post("/namehnews/science-tech/save", scraperController.scrapeAndSaveNamehNewsScienceTech);
router.get("/namehnews/social", scraperController.scrapeNamehNewsSocial);
router.post("/namehnews/social/save", scraperController.scrapeAndSaveNamehNewsSocial);

// Mashregh News
router.get("/mashreghnews/politics", scraperController.scrapeMashreghNewsPolitics);
router.post("/mashreghnews/politics/save", scraperController.scrapeAndSaveMashreghNewsPolitics);
router.get("/mashreghnews/culture-art", scraperController.scrapeMashreghNewsCultureArt);
router.post("/mashreghnews/culture-art/save", scraperController.scrapeAndSaveMashreghNewsCultureArt);
router.get("/mashreghnews/international", scraperController.scrapeMashreghNewsInternational);
router.post("/mashreghnews/international/save", scraperController.scrapeAndSaveMashreghNewsInternational);
router.get("/mashreghnews/social", scraperController.scrapeMashreghNewsSocial);
router.post("/mashreghnews/social/save", scraperController.scrapeAndSaveMashreghNewsSocial);
router.get("/mashreghnews/economy", scraperController.scrapeMashreghNewsEconomy);
router.post("/mashreghnews/economy/save", scraperController.scrapeAndSaveMashreghNewsEconomy);
router.get("/mashreghnews/sports", scraperController.scrapeMashreghNewsSports);
router.post("/mashreghnews/sports/save", scraperController.scrapeAndSaveMashreghNewsSports);

router.get("/mosalasonline/politics", scraperController.scrapePoliticsMosalasOnline);
router.post("/mosalasonline/politics/save", scraperController.scrapeAndSavePoliticsMosalasOnline);
router.get("/mosalasonline/international", scraperController.scrapeInternationalMosalasOnline);
router.post("/mosalasonline/international/save", scraperController.scrapeAndSaveInternationalMosalasOnline);
router.get("/mosalasonline/culture-art", scraperController.scrapeCultureArtMosalasOnline);
router.post("/mosalasonline/culture-art/save", scraperController.scrapeAndSaveCultureArtMosalasOnline);
router.get("/mosalasonline/social", scraperController.scrapeSocialMosalasOnline);
router.post("/mosalasonline/social/save", scraperController.scrapeAndSaveSocialMosalasOnline);

module.exports = router; 