const BaseController = require("../../../core/baseController");
const KhabarOnlineScraper = require("./sites/khabaronline");
const TasnimScraper = require("./sites/tasnim");
const EttelaatScraper = require("./sites/ettelaat");
const ParsNewsScraper = require('./sites/parsnews');
const FararuScraper = require('./sites/fararu');
const PQueue = require('p-queue').default;
const HamshahriOnlineScraper = require("./sites/hamshahrionline");
const NamehNewsScraper = require('./sites/namehnews');
const MashreghNewsScraper = require('./sites/mashreghnews');
const mosalasonline = require("./sites/mosalasonline");

class ScraperController extends BaseController {
  constructor() {
    super();
  }

  // خبرآنلاین
  async scrapeKhabarOnlinePolitical(req, res) {
    try {
      const articles = await KhabarOnlineScraper.scrapePolitics();
      return this.response(res, 200, true, "اخبار سیاسی خبرآنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveKhabarOnlinePolitical(req, res) {
    try {
      const article = await KhabarOnlineScraper.scrapeAndSavePolitics();
      return this.response(res, 201, true, "خبر سیاسی خبرآنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeKhabarOnlineEconomic(req, res) {
    try {
      const articles = await KhabarOnlineScraper.scrapeEconomy();
      return this.response(res, 200, true, "اخبار اقتصادی خبرآنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveKhabarOnlineEconomic(req, res) {
    try {
      const article = await KhabarOnlineScraper.scrapeAndSaveEconomy();
      return this.response(res, 201, true, "خبر اقتصادی خبرآنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeKhabarOnlineSports(req, res) {
    try {
      const articles = await KhabarOnlineScraper.scrapeSports();
      return this.response(res, 200, true, "اخبار ورزشی خبرآنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveKhabarOnlineSports(req, res) {
    try {
      const article = await KhabarOnlineScraper.scrapeAndSaveSports();
      return this.response(res, 201, true, "خبر ورزشی خبرآنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeKhabarOnlineSociety(req, res) {
    try {
      const articles = await KhabarOnlineScraper.scrapeSociety();
      return this.response(res, 200, true, "اخبار اجتماعی خبرآنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveKhabarOnlineSociety(req, res) {
    try {
      const article = await KhabarOnlineScraper.scrapeAndSaveSociety();
      return this.response(res, 201, true, "خبر اجتماعی خبرآنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeKhabarOnlineInternational(req, res) {
    try {
      const articles = await KhabarOnlineScraper.scrapeInternational();
      return this.response(res, 200, true, "اخبار بین‌الملل خبرآنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveKhabarOnlineInternational(req, res) {
    try {
      const article = await KhabarOnlineScraper.scrapeAndSaveInternational();
      return this.response(res, 201, true, "خبر بین‌الملل خبرآنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeKhabarOnlineCulture(req, res) {
    try {
      const articles = await KhabarOnlineScraper.scrapeCulture();
      return this.response(res, 200, true, "اخبار فرهنگی خبرآنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveKhabarOnlineCulture(req, res) {
    try {
      const article = await KhabarOnlineScraper.scrapeAndSaveCulture();
      return this.response(res, 201, true, "خبر فرهنگی خبرآنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeKhabarOnlineScienceTech(req, res) {
    try {
      const articles = await KhabarOnlineScraper.scrapeScienceTech();
      return this.response(res, 200, true, "اخبار علم و فناوری خبرآنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveKhabarOnlineScienceTech(req, res) {
    try {
      const article = await KhabarOnlineScraper.scrapeAndSaveScienceTech();
      return this.response(res, 201, true, "خبر علم و فناوری خبرآنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  // تسنیم
  async scrapeTasnimPolitical(req, res) {
    try {
      const articles = await TasnimScraper.scrapePolitical();
      return this.response(res, 200, true, "اخبار سیاسی تسنیم دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveTasnimPolitical(req, res) {
    try {
      const article = await TasnimScraper.scrapeAndSavePolitical();
      return this.response(res, 201, true, "خبر سیاسی تسنیم ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeTasnimEconomic(req, res) {
    try {
      const articles = await TasnimScraper.scrapeEconomic();
      return this.response(res, 200, true, "اخبار اقتصادی تسنیم دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveTasnimEconomic(req, res) {
    try {
      const article = await TasnimScraper.scrapeAndSaveEconomic();
      return this.response(res, 201, true, "خبر اقتصادی تسنیم ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeTasnimSports(req, res) {
    try {
      const articles = await TasnimScraper.scrapeSports();
      return this.response(res, 200, true, "اخبار ورزشی تسنیم دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveTasnimSports(req, res) {
    try {
      const article = await TasnimScraper.scrapeAndSaveSports();
      return this.response(res, 201, true, "خبر ورزشی تسنیم ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeTasnimSocial(req, res) {
    try {
      const articles = await TasnimScraper.scrapeSocial();
      return this.response(res, 200, true, "اخبار اجتماعی تسنیم دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveTasnimSocial(req, res) {
    try {
      const article = await TasnimScraper.scrapeAndSaveSocial();
      return this.response(res, 201, true, "خبر اجتماعی تسنیم ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeTasnimInternational(req, res) {
    try {
      const articles = await TasnimScraper.scrapeInternational();
      return this.response(res, 200, true, "اخبار بین‌الملل تسنیم دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveTasnimInternational(req, res) {
    try {
      const article = await TasnimScraper.scrapeAndSaveInternational();
      return this.response(res, 201, true, "خبر بین‌الملل تسنیم ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeTasnimCultural(req, res) {
    try {
      const articles = await TasnimScraper.scrapeCultural();
      return this.response(res, 200, true, "اخبار فرهنگی تسنیم دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveTasnimCultural(req, res) {
    try {
      const article = await TasnimScraper.scrapeAndSaveCultural();
      return this.response(res, 201, true, "خبر فرهنگی تسنیم ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeTasnimScienceTech(req, res) {
    try {
      const articles = await TasnimScraper.scrapeScienceTech();
      return this.response(res, 200, true, "اخبار علم و فناوری تسنیم دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveTasnimScienceTech(req, res) {
    try {
      const article = await TasnimScraper.scrapeAndSaveScienceTech();
      return this.response(res, 201, true, "خبر علم و فناوری تسنیم ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  // اسکرپ همه سایت‌ها (بدون ذخیره)
  async scrapeAll(req, res) {
    try {
      const results = {};
      results.khabaronline = {
        politics: await KhabarOnlineScraper.scrapePolitics(),
        economy: await KhabarOnlineScraper.scrapeEconomy(),
        sports: await KhabarOnlineScraper.scrapeSports(),
        society: await KhabarOnlineScraper.scrapeSociety(),
        international: await KhabarOnlineScraper.scrapeInternational(),
        culture: await KhabarOnlineScraper.scrapeCulture(),
        'science-tech': await KhabarOnlineScraper.scrapeScienceTech(),
      };
      results.tasnim = {
        political: await TasnimScraper.scrapePolitical(),
        economic: await TasnimScraper.scrapeEconomic(),
        sports: await TasnimScraper.scrapeSports(),
        social: await TasnimScraper.scrapeSocial(),
        international: await TasnimScraper.scrapeInternational(),
        cultural: await TasnimScraper.scrapeCultural(),
        'science-tech': await TasnimScraper.scrapeScienceTech(),
      };
      results.ettelaat = {
        politics: await EttelaatScraper.scrapePolitics(),
        economy: await EttelaatScraper.scrapeEconomy(),
        sports: await EttelaatScraper.scrapeSports(),
        international: await EttelaatScraper.scrapeInternational(),
        'culture-art': await EttelaatScraper.scrapeCultureArt(),
        social: await EttelaatScraper.scrapeSocial(),
        'science-tech': await EttelaatScraper.scrapeScienceTech(),
      };
      const AfkarNewsScraper = require('./sites/afkarnews');
      results.afkarnews = {
        politics: await AfkarNewsScraper.scrapePolitics(),
        economy: await AfkarNewsScraper.scrapeEconomy(),
        sports: await AfkarNewsScraper.scrapeSports(),
        international: await AfkarNewsScraper.scrapeInternational(),
        social: await AfkarNewsScraper.scrapeSocial(),
        'culture-art': await AfkarNewsScraper.scrapeCultureArt(),
      };
      results.parsnews = {
        politics: await ParsNewsScraper.scrapePolitics(),
        international: await ParsNewsScraper.scrapeInternational(),
        economy: await ParsNewsScraper.scrapeEconomy(),
        social: await ParsNewsScraper.scrapeSocial(),
        sports: await ParsNewsScraper.scrapeSports(),
        'culture-art': await ParsNewsScraper.scrapeCultureArt(),
      };
      results.fararu = {
        politics: await FararuScraper.scrapePolitics(),
        sports: await FararuScraper.scrapeSports(),
        'science-tech': await FararuScraper.scrapeScienceTech(),
        economy: await FararuScraper.scrapeEconomy(),
        society: await FararuScraper.scrapeSociety(),
        'culture-art': await FararuScraper.scrapeCultureArt(),
        international: await FararuScraper.scrapeInternational(),
      };
      results.hamshahrionline = {
        politics: await HamshahriOnlineScraper.scrapePolitics(),
      };
      results.namehnews = {
        politics: await NamehNewsScraper.scrapePolitics(),
        economy: await NamehNewsScraper.scrapeEconomy(),
        sports: await NamehNewsScraper.scrapeSports(),
        'science-tech': await NamehNewsScraper.scrapeScienceTech(),
        social: await NamehNewsScraper.scrapeSocial(),
      };
      results.mashreghnews = {
        politics: await MashreghNewsScraper.scrapePolitics(),
        'culture-art': await MashreghNewsScraper.scrapeCultureArt(),
        international: await MashreghNewsScraper.scrapeInternational(),
        social: await MashreghNewsScraper.scrapeSocial(),
        economy: await MashreghNewsScraper.scrapeEconomy(),
        sports: await MashreghNewsScraper.scrapeSports(),
      };
      return this.response(res, 200, true, "دریافت اخبار همه سایت‌ها با موفقیت انجام شد.", results);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  // اسکرپ و ذخیره همه سایت‌ها
  async scrapeAndSaveAll(req, res) {
    const queue = new PQueue({ concurrency: 4 });
    try {
      const results = {};
      results.khabaronline = {};
      results.tasnim = {};
      results.ettelaat = {};
      results.afkarnews = {};
      results.parsnews = {};
      results.fararu = {};
      results.hamshahrionline = {};
      results.namehnews = {};
      results.mashreghnews = {};
      results.mosalasonline = {};

      // KhabarOnline
      for (const [cat, fn] of Object.entries({
        politics: () => KhabarOnlineScraper.scrapeAndSavePolitics(),
        economy: () => KhabarOnlineScraper.scrapeAndSaveEconomy(),
        sports: () => KhabarOnlineScraper.scrapeAndSaveSports(),
        society: () => KhabarOnlineScraper.scrapeAndSaveSociety(),
        international: () => KhabarOnlineScraper.scrapeAndSaveInternational(),
        culture: () => KhabarOnlineScraper.scrapeAndSaveCulture(),
        'science-tech': () => KhabarOnlineScraper.scrapeAndSaveScienceTech(),
      })) {
        console.log(`[QUEUE] KhabarOnline/${cat} - started`);
        try {
          results.khabaronline[cat] = await queue.add(() => fn());
          console.log(`[QUEUE] KhabarOnline/${cat} - success`);
        } catch (err) {
          console.error(`[QUEUE] KhabarOnline/${cat} - error:`, err.message);
          results.khabaronline[cat] = { error: err.message };
        }
      }
      // Tasnim
      for (const [cat, fn] of Object.entries({
        political: () => TasnimScraper.scrapeAndSavePolitical(),
        economic: () => TasnimScraper.scrapeAndSaveEconomic(),
        sports: () => TasnimScraper.scrapeAndSaveSports(),
        social: () => TasnimScraper.scrapeAndSaveSocial(),
        international: () => TasnimScraper.scrapeAndSaveInternational(),
        cultural: () => TasnimScraper.scrapeAndSaveCultural(),
        'science-tech': () => TasnimScraper.scrapeAndSaveScienceTech(),
      })) {
        console.log(`[QUEUE] Tasnim/${cat} - started`);
        try {
          results.tasnim[cat] = await queue.add(() => fn());
          console.log(`[QUEUE] Tasnim/${cat} - success`);
        } catch (err) {
          console.error(`[QUEUE] Tasnim/${cat} - error:`, err.message);
          results.tasnim[cat] = { error: err.message };
        }
      }
      // Ettelaat
      for (const [cat, fn] of Object.entries({
        politics: () => EttelaatScraper.scrapeAndSavePolitics(),
        economy: () => EttelaatScraper.scrapeAndSaveEconomy(),
        sports: () => EttelaatScraper.scrapeAndSaveSports(),
        international: () => EttelaatScraper.scrapeAndSaveInternational(),
        'culture-art': () => EttelaatScraper.scrapeAndSaveCultureArt(),
        social: () => EttelaatScraper.scrapeAndSaveSocial(),
        'science-tech': () => EttelaatScraper.scrapeAndSaveScienceTech(),
      })) {
        console.log(`[QUEUE] Ettelaat/${cat} - started`);
        try {
          results.ettelaat[cat] = await queue.add(() => fn());
          console.log(`[QUEUE] Ettelaat/${cat} - success`);
        } catch (err) {
          console.error(`[QUEUE] Ettelaat/${cat} - error:`, err.message);
          results.ettelaat[cat] = { error: err.message };
        }
      }
      // AfkarNews
      const AfkarNewsScraper = require('./sites/afkarnews');
      for (const [cat, fn] of Object.entries({
        politics: () => AfkarNewsScraper.scrapeAndSavePolitics(),
        economy: () => AfkarNewsScraper.scrapeAndSaveEconomy(),
        sports: () => AfkarNewsScraper.scrapeAndSaveSports(),
        international: () => AfkarNewsScraper.scrapeAndSaveInternational(),
        social: () => AfkarNewsScraper.scrapeAndSaveSocial(),
        'culture-art': () => AfkarNewsScraper.scrapeAndSaveCultureArt(),
      })) {
        console.log(`[QUEUE] AfkarNews/${cat} - started`);
        try {
          results.afkarnews[cat] = await queue.add(() => fn());
          console.log(`[QUEUE] AfkarNews/${cat} - success`);
        } catch (err) {
          console.error(`[QUEUE] AfkarNews/${cat} - error:`, err.message);
          results.afkarnews[cat] = { error: err.message };
        }
      }
      // ParsNews
      for (const [cat, fn] of Object.entries({
        politics: () => ParsNewsScraper.scrapeAndSavePolitics(),
        international: () => ParsNewsScraper.scrapeAndSaveInternational(),
        economy: () => ParsNewsScraper.scrapeAndSaveEconomy(),
        social: () => ParsNewsScraper.scrapeAndSaveSocial(),
        sports: () => ParsNewsScraper.scrapeAndSaveSports(),
        'culture-art': () => ParsNewsScraper.scrapeAndSaveCultureArt(),
      })) {
        console.log(`[QUEUE] ParsNews/${cat} - started`);
        try {
          results.parsnews[cat] = await queue.add(() => fn());
          console.log(`[QUEUE] ParsNews/${cat} - success`);
        } catch (err) {
          console.error(`[QUEUE] ParsNews/${cat} - error:`, err.message);
          results.parsnews[cat] = { error: err.message };
        }
      }
      // Fararu
      for (const [cat, fn] of Object.entries({
        politics: () => FararuScraper.scrapeAndSavePolitics(),
        sports: () => FararuScraper.scrapeAndSaveSports(),
        'science-tech': () => FararuScraper.scrapeAndSaveScienceTech(),
        economy: () => FararuScraper.scrapeAndSaveEconomy(),
        society: () => FararuScraper.scrapeAndSaveSociety(),
        'culture-art': () => FararuScraper.scrapeAndSaveCultureArt(),
        international: () => FararuScraper.scrapeAndSaveInternational(),
      })) {
        console.log(`[QUEUE] Fararu/${cat} - started`);
        try {
          results.fararu[cat] = await queue.add(() => fn());
          console.log(`[QUEUE] Fararu/${cat} - success`);
        } catch (err) {
          console.error(`[QUEUE] Fararu/${cat} - error:`, err.message);
          results.fararu[cat] = { error: err.message };
        }
      }
      // Hamshahri Online
      for (const [cat, fn] of Object.entries({
        politics: () => HamshahriOnlineScraper.scrapeAndSavePolitics(),
        international: () => HamshahriOnlineScraper.scrapeAndSaveInternational(),
        social: () => HamshahriOnlineScraper.scrapeAndSaveSocial(),
        economy: () => HamshahriOnlineScraper.scrapeAndSaveEconomy(),
        'science-tech': () => HamshahriOnlineScraper.scrapeAndSaveScienceTech(),
        'culture-art': () => HamshahriOnlineScraper.scrapeAndSaveCultureArt(),
        sports: () => HamshahriOnlineScraper.scrapeAndSaveSports(),
      })) {
        console.log(`[QUEUE] HamshahriOnline/${cat} - started`);
        try {
          results.hamshahrionline[cat] = await queue.add(() => fn());
          console.log(`[QUEUE] HamshahriOnline/${cat} - success`);
        } catch (err) {
          console.error(`[QUEUE] HamshahriOnline/${cat} - error:`, err.message);
          results.hamshahrionline[cat] = { error: err.message };
        }
      }
      // Nameh News
      for (const [cat, fn] of Object.entries({
        politics: () => NamehNewsScraper.scrapeAndSavePolitics(),
        economy: () => NamehNewsScraper.scrapeAndSaveEconomy(),
        sports: () => NamehNewsScraper.scrapeAndSaveSports(),
        'science-tech': () => NamehNewsScraper.scrapeAndSaveScienceTech(),
        social: () => NamehNewsScraper.scrapeAndSaveSocial(),
      })) {
        console.log(`[QUEUE] NamehNews/${cat} - started`);
        try {
          results.namehnews[cat] = await queue.add(() => fn());
        } catch (err) {
          results.namehnews[cat] = { error: err.message };
        }
      }
      // Mashregh News
      for (const [cat, fn] of Object.entries({
        politics: () => MashreghNewsScraper.scrapeAndSavePolitics(),
        'culture-art': () => MashreghNewsScraper.scrapeAndSaveCultureArt(),
        international: () => MashreghNewsScraper.scrapeAndSaveInternational(),
        social: () => MashreghNewsScraper.scrapeAndSaveSocial(),
        economy: () => MashreghNewsScraper.scrapeAndSaveEconomy(),
        sports: () => MashreghNewsScraper.scrapeAndSaveSports(),
      })) {
        try {
          results.mashreghnews[cat] = await queue.add(() => fn());
        } catch (err) {
          results.mashreghnews[cat] = { error: err.message };
        }
      }
      // Mosalas Online
      results.mosalasonline = {};
      for (const [cat, fn] of Object.entries({
        politics: () => mosalasonline.scrapeAndSavePolitics(),
        international: () => mosalasonline.scrapeAndSaveInternational(),
        'culture-art': () => mosalasonline.scrapeAndSaveCultureArt(),
        economy: () => mosalasonline.scrapeAndSaveEconomy(),
        social: () => mosalasonline.scrapeAndSaveSocial(),
      })) {
        try {
          results.mosalasonline[cat] = await queue.add(() => fn());
        } catch (err) {
          results.mosalasonline[cat] = { error: err.message };
        }
      }
      return this.response(res, 201, true, "ذخیره اخبار همه سایت‌ها با موفقیت انجام شد.", results);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  // اطلاعات آنلاین
  async scrapeEttelaatPolitical(req, res) {
    try {
      const articles = await EttelaatScraper.scrapePolitics();
      return this.response(res, 200, true, "اخبار سیاسی اطلاعات آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveEttelaatPolitical(req, res) {
    try {
      const article = await EttelaatScraper.scrapeAndSavePolitics();
      return this.response(res, 201, true, "خبر سیاسی اطلاعات آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeEttelaatEconomic(req, res) {
    try {
      const articles = await EttelaatScraper.scrapeEconomy();
      return this.response(res, 200, true, "اخبار اقتصادی اطلاعات آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveEttelaatEconomic(req, res) {
    try {
      const article = await EttelaatScraper.scrapeAndSaveEconomy();
      return this.response(res, 201, true, "خبر اقتصادی اطلاعات آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeEttelaatSports(req, res) {
    try {
      const articles = await EttelaatScraper.scrapeSports();
      return this.response(res, 200, true, "اخبار ورزشی اطلاعات آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveEttelaatSports(req, res) {
    try {
      const article = await EttelaatScraper.scrapeAndSaveSports();
      return this.response(res, 201, true, "خبر ورزشی اطلاعات آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeEttelaatInternational(req, res) {
    try {
      const articles = await EttelaatScraper.scrapeInternational();
      return this.response(res, 200, true, "اخبار بین‌الملل اطلاعات آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveEttelaatInternational(req, res) {
    try {
      const article = await EttelaatScraper.scrapeAndSaveInternational();
      return this.response(res, 201, true, "خبر بین‌الملل اطلاعات آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeEttelaatCultureArt(req, res) {
    try {
      const articles = await EttelaatScraper.scrapeCultureArt();
      return this.response(res, 200, true, "اخبار فرهنگ و هنر اطلاعات آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveEttelaatCultureArt(req, res) {
    try {
      const article = await EttelaatScraper.scrapeAndSaveCultureArt();
      return this.response(res, 201, true, "خبر فرهنگ و هنر اطلاعات آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeEttelaatSocial(req, res) {
    try {
      const articles = await EttelaatScraper.scrapeSocial();
      return this.response(res, 200, true, "اخبار اجتماعی اطلاعات آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveEttelaatSocial(req, res) {
    try {
      const article = await EttelaatScraper.scrapeAndSaveSocial();
      return this.response(res, 201, true, "خبر اجتماعی اطلاعات آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeEttelaatScienceTech(req, res) {
    try {
      const articles = await EttelaatScraper.scrapeScienceTech();
      return this.response(res, 200, true, "اخبار علم و فناوری اطلاعات آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveEttelaatScienceTech(req, res) {
    try {
      const article = await EttelaatScraper.scrapeAndSaveScienceTech();
      return this.response(res, 201, true, "خبر علم و فناوری اطلاعات آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAfkarNewsPolitics(req, res) {
    try {
      const articles = await require('./sites/afkarnews').scrapePolitics();
      return this.response(res, 200, true, "اخبار سیاسی افکار نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveAfkarNewsPolitics(req, res) {
    try {
      const article = await require('./sites/afkarnews').scrapeAndSavePolitics();
      return this.response(res, 201, true, "خبر سیاسی افکار نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAfkarNewsSports(req, res) {
    try {
      const articles = await require('./sites/afkarnews').scrapeSports();
      return this.response(res, 200, true, "اخبار ورزشی افکار نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveAfkarNewsSports(req, res) {
    try {
      const article = await require('./sites/afkarnews').scrapeAndSaveSports();
      return this.response(res, 201, true, "خبر ورزشی افکار نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAfkarNewsEconomy(req, res) {
    try {
      const articles = await require('./sites/afkarnews').scrapeEconomy();
      return this.response(res, 200, true, "اخبار اقتصادی افکار نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveAfkarNewsEconomy(req, res) {
    try {
      const article = await require('./sites/afkarnews').scrapeAndSaveEconomy();
      return this.response(res, 201, true, "خبر اقتصادی افکار نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAfkarNewsInternational(req, res) {
    try {
      const articles = await require('./sites/afkarnews').scrapeInternational();
      return this.response(res, 200, true, "اخبار بین‌الملل افکار نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveAfkarNewsInternational(req, res) {
    try {
      const article = await require('./sites/afkarnews').scrapeAndSaveInternational();
      return this.response(res, 201, true, "خبر بین‌الملل افکار نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAfkarNewsSocial(req, res) {
    try {
      const articles = await require('./sites/afkarnews').scrapeSocial();
      return this.response(res, 200, true, "اخبار اجتماعی افکار نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveAfkarNewsSocial(req, res) {
    try {
      const article = await require('./sites/afkarnews').scrapeAndSaveSocial();
      return this.response(res, 201, true, "خبر اجتماعی افکار نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAfkarNewsCultureArt(req, res) {
    try {
      const articles = await require('./sites/afkarnews').scrapeCultureArt();
      return this.response(res, 200, true, "اخبار فرهنگ و هنر افکار نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveAfkarNewsCultureArt(req, res) {
    try {
      const article = await require('./sites/afkarnews').scrapeAndSaveCultureArt();
      return this.response(res, 201, true, "خبر فرهنگ و هنر افکار نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeParsNewsPolitics(req, res) {
    try {
      const articles = await ParsNewsScraper.scrapePolitics();
      return this.response(res, 200, true, "اخبار سیاسی پارس نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveParsNewsPolitics(req, res) {
    try {
      const article = await ParsNewsScraper.scrapeAndSavePolitics();
      return this.response(res, 201, true, "خبر سیاسی پارس نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeParsNewsInternational(req, res) {
    try {
      const articles = await ParsNewsScraper.scrapeInternational();
      return this.response(res, 200, true, "اخبار بین الملل پارس نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveParsNewsInternational(req, res) {
    try {
      const article = await ParsNewsScraper.scrapeAndSaveInternational();
      return this.response(res, 201, true, "خبر بین الملل پارس نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeParsNewsEconomy(req, res) {
    try {
      const articles = await ParsNewsScraper.scrapeEconomy();
      return this.response(res, 200, true, "اخبار اقتصادی پارس نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveParsNewsEconomy(req, res) {
    try {
      const article = await ParsNewsScraper.scrapeAndSaveEconomy();
      return this.response(res, 201, true, "خبر اقتصادی پارس نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeParsNewsSocial(req, res) {
    try {
      const articles = await ParsNewsScraper.scrapeSocial();
      return this.response(res, 200, true, "اخبار اجتماعی پارس نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveParsNewsSocial(req, res) {
    try {
      const article = await ParsNewsScraper.scrapeAndSaveSocial();
      return this.response(res, 201, true, "خبر اجتماعی پارس نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeParsNewsSports(req, res) {
    try {
      const articles = await ParsNewsScraper.scrapeSports();
      return this.response(res, 200, true, "اخبار ورزشی پارس نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveParsNewsSports(req, res) {
    try {
      const article = await ParsNewsScraper.scrapeAndSaveSports();
      return this.response(res, 201, true, "خبر ورزشی پارس نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeParsNewsCultureArt(req, res) {
    try {
      const articles = await ParsNewsScraper.scrapeCultureArt();
      return this.response(res, 200, true, "اخبار فرهنگ و هنر پارس نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
  async scrapeAndSaveParsNewsCultureArt(req, res) {
    try {
      const article = await ParsNewsScraper.scrapeAndSaveCultureArt();
      return this.response(res, 201, true, "خبر فرهنگ و هنر پارس نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  // Fararu
  async scrapeFararuPolitical(req, res) {
    try {
      const articles = await FararuScraper.scrapePolitics();
      return this.response(res, 200, true, "اخبار سیاسی فرارو دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveFararuPolitical(req, res) {
    try {
      const article = await FararuScraper.scrapeAndSavePolitics();
      return this.response(res, 201, true, "خبر سیاسی فرارو ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeFararuSports(req, res) {
    try {
      const articles = await FararuScraper.scrapeSports();
      return this.response(res, 200, true, "اخبار ورزشی فرارو دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveFararuSports(req, res) {
    try {
      const article = await FararuScraper.scrapeAndSaveSports();
      return this.response(res, 201, true, "خبر ورزشی فرارو ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeFararuScienceTech(req, res) {
    try {
      const articles = await FararuScraper.scrapeScienceTech();
      return this.response(res, 200, true, "اخبار علم و فناوری فرارو دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveFararuScienceTech(req, res) {
    try {
      const article = await FararuScraper.scrapeAndSaveScienceTech();
      return this.response(res, 201, true, "خبر علم و فناوری فرارو ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeFararuEconomy(req, res) {
    try {
      const articles = await FararuScraper.scrapeEconomy();
      return this.response(res, 200, true, "اخبار اقتصادی فرارو دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveFararuEconomy(req, res) {
    try {
      const article = await FararuScraper.scrapeAndSaveEconomy();
      return this.response(res, 201, true, "خبر اقتصادی فرارو ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeFararuSociety(req, res) {
    try {
      const articles = await FararuScraper.scrapeSociety();
      return this.response(res, 200, true, "اخبار جامعه فرارو دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveFararuSociety(req, res) {
    try {
      const article = await FararuScraper.scrapeAndSaveSociety();
      return this.response(res, 201, true, "خبر جامعه فرارو ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeFararuCultureArt(req, res) {
    try {
      const articles = await FararuScraper.scrapeCultureArt();
      return this.response(res, 200, true, "اخبار فرهنگ و هنر فرارو دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveFararuCultureArt(req, res) {
    try {
      const article = await FararuScraper.scrapeAndSaveCultureArt();
      return this.response(res, 201, true, "خبر فرهنگ و هنر فرارو ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeFararuInternational(req, res) {
    try {
      const articles = await FararuScraper.scrapeInternational();
      return this.response(res, 200, true, "اخبار بین‌الملل فرارو دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveFararuInternational(req, res) {
    try {
      const article = await FararuScraper.scrapeAndSaveInternational();
      return this.response(res, 201, true, "خبر بین‌الملل فرارو ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeHamshahriOnlinePolitics(req, res) {
    try {
      const articles = await HamshahriOnlineScraper.scrapePolitics();
      return this.response(res, 200, true, "اخبار سیاسی همشهری آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveHamshahriOnlinePolitics(req, res) {
    try {
      const articles = await HamshahriOnlineScraper.scrapePolitics();
      // ذخیره هر خبر بدون content
      const saved = [];
      for (const article of articles) {
        // فرض بر این است که متد saveArticle وجود دارد و content ذخیره نمی‌شود
        const { content, ...rest } = article;
        const result = await this.saveArticle(rest, 'hamshahrionline', 'politics');
        saved.push(result);
      }
      return this.response(res, 201, true, "اخبار سیاسی همشهری آنلاین ذخیره شد.", saved);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeHamshahriOnlineInternational(req, res) {
    try {
      const articles = await HamshahriOnlineScraper.scrapeInternational();
      return this.response(res, 200, true, "اخبار بین‌الملل همشهری آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveHamshahriOnlineInternational(req, res) {
    try {
      const article = await HamshahriOnlineScraper.scrapeAndSaveInternational();
      return this.response(res, 201, true, "خبر بین‌الملل همشهری آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeHamshahriOnlineSocial(req, res) {
    try {
      const articles = await HamshahriOnlineScraper.scrapeSocial();
      return this.response(res, 200, true, "اخبار اجتماعی همشهری آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveHamshahriOnlineSocial(req, res) {
    try {
      const article = await HamshahriOnlineScraper.scrapeAndSaveSocial();
      return this.response(res, 201, true, "خبر اجتماعی همشهری آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeHamshahriOnlineEconomy(req, res) {
    try {
      const articles = await HamshahriOnlineScraper.scrapeEconomy();
      return this.response(res, 200, true, "اخبار اقتصادی همشهری آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveHamshahriOnlineEconomy(req, res) {
    try {
      const article = await HamshahriOnlineScraper.scrapeAndSaveEconomy();
      return this.response(res, 201, true, "خبر اقتصادی همشهری آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeHamshahriOnlineScienceTech(req, res) {
    try {
      const articles = await HamshahriOnlineScraper.scrapeScienceTech();
      return this.response(res, 200, true, "اخبار علم و فناوری همشهری آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveHamshahriOnlineScienceTech(req, res) {
    try {
      const article = await HamshahriOnlineScraper.scrapeAndSaveScienceTech();
      return this.response(res, 201, true, "خبر علم و فناوری همشهری آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeHamshahriOnlineCultureArt(req, res) {
    try {
      const articles = await HamshahriOnlineScraper.scrapeCultureArt();
      return this.response(res, 200, true, "اخبار فرهنگ و هنر همشهری آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveHamshahriOnlineCultureArt(req, res) {
    try {
      const article = await HamshahriOnlineScraper.scrapeAndSaveCultureArt();
      return this.response(res, 201, true, "خبر فرهنگ و هنر همشهری آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeHamshahriOnlineSports(req, res) {
    try {
      const articles = await HamshahriOnlineScraper.scrapeSports();
      return this.response(res, 200, true, "اخبار ورزشی همشهری آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveHamshahriOnlineSports(req, res) {
    try {
      const article = await HamshahriOnlineScraper.scrapeAndSaveSports();
      return this.response(res, 201, true, "خبر ورزشی همشهری آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  // Nameh News
  async scrapeNamehNewsPolitics(req, res) {
    try {
      const articles = await NamehNewsScraper.scrapePolitics();
      return this.response(res, 200, true, "اخبار سیاسی نامه نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveNamehNewsPolitics(req, res) {
    try {
      const article = await NamehNewsScraper.scrapeAndSavePolitics();
      return this.response(res, 201, true, "خبر سیاسی نامه نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeNamehNewsEconomy(req, res) {
    try {
      const articles = await NamehNewsScraper.scrapeEconomy();
      return this.response(res, 200, true, "اخبار اقتصادی نامه نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveNamehNewsEconomy(req, res) {
    try {
      const article = await NamehNewsScraper.scrapeAndSaveEconomy();
      return this.response(res, 201, true, "خبر اقتصادی نامه نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeNamehNewsSports(req, res) {
    try {
      const articles = await NamehNewsScraper.scrapeSports();
      return this.response(res, 200, true, "اخبار ورزشی نامه نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveNamehNewsSports(req, res) {
    try {
      const article = await NamehNewsScraper.scrapeAndSaveSports();
      return this.response(res, 201, true, "خبر ورزشی نامه نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeNamehNewsScienceTech(req, res) {
    try {
      const articles = await NamehNewsScraper.scrapeScienceTech();
      return this.response(res, 200, true, "اخبار علم و فناوری نامه نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveNamehNewsScienceTech(req, res) {
    try {
      const article = await NamehNewsScraper.scrapeAndSaveScienceTech();
      return this.response(res, 201, true, "خبر علم و فناوری نامه نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeNamehNewsSocial(req, res) {
    try {
      const articles = await NamehNewsScraper.scrapeSocial();
      return this.response(res, 200, true, "اخبار اجتماعی نامه نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveNamehNewsSocial(req, res) {
    try {
      const article = await NamehNewsScraper.scrapeAndSaveSocial();
      return this.response(res, 201, true, "خبر اجتماعی نامه نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeMashreghNewsPolitics(req, res) {
    try {
      const articles = await MashreghNewsScraper.scrapePolitics();
      return this.response(res, 200, true, "اخبار سیاسی مشرق نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveMashreghNewsPolitics(req, res) {
    try {
      const article = await MashreghNewsScraper.scrapeAndSavePolitics();
      return this.response(res, 201, true, "خبر سیاسی مشرق نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeMashreghNewsCultureArt(req, res) {
    try {
      const articles = await MashreghNewsScraper.scrapeCultureArt();
      return this.response(res, 200, true, "اخبار فرهنگ و هنر مشرق نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveMashreghNewsCultureArt(req, res) {
    try {
      const article = await MashreghNewsScraper.scrapeAndSaveCultureArt();
      return this.response(res, 201, true, "خبر فرهنگ و هنر مشرق نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeMashreghNewsInternational(req, res) {
    try {
      const articles = await MashreghNewsScraper.scrapeInternational();
      return this.response(res, 200, true, "اخبار بین‌الملل مشرق نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveMashreghNewsInternational(req, res) {
    try {
      const article = await MashreghNewsScraper.scrapeAndSaveInternational();
      return this.response(res, 201, true, "خبر بین‌الملل مشرق نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeMashreghNewsSocial(req, res) {
    try {
      const articles = await MashreghNewsScraper.scrapeSocial();
      return this.response(res, 200, true, "اخبار اجتماعی مشرق نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveMashreghNewsSocial(req, res) {
    try {
      const article = await MashreghNewsScraper.scrapeAndSaveSocial();
      return this.response(res, 201, true, "خبر اجتماعی مشرق نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeMashreghNewsEconomy(req, res) {
    try {
      const articles = await MashreghNewsScraper.scrapeEconomy();
      return this.response(res, 200, true, "اخبار اقتصادی مشرق نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveMashreghNewsEconomy(req, res) {
    try {
      const article = await MashreghNewsScraper.scrapeAndSaveEconomy();
      return this.response(res, 201, true, "خبر اقتصادی مشرق نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeMashreghNewsSports(req, res) {
    try {
      const articles = await MashreghNewsScraper.scrapeSports();
      return this.response(res, 200, true, "اخبار ورزشی مشرق نیوز دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveMashreghNewsSports(req, res) {
    try {
      const article = await MashreghNewsScraper.scrapeAndSaveSports();
      return this.response(res, 201, true, "خبر ورزشی مشرق نیوز ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeCultureArtMosalasOnline(req, res) {
    try {
      const articles = await mosalasonline.scrapeCultureArt();
      return this.response(res, 200, true, "اخبار فرهنگ و هنر مثلث آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveCultureArtMosalasOnline(req, res) {
    try {
      const article = await mosalasonline.scrapeAndSaveCultureArt();
      return this.response(res, 201, true, "خبر فرهنگ و هنر مثلث آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapePoliticsMosalasOnline(req, res) {
    try {
      const articles = await mosalasonline.scrapePolitics();
      return this.response(res, 200, true, "اخبار سیاسی مثلث آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSavePoliticsMosalasOnline(req, res) {
    try {
      const article = await mosalasonline.scrapeAndSavePolitics();
      return this.response(res, 201, true, "خبر سیاسی مثلث آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeInternationalMosalasOnline(req, res) {
    try {
      const articles = await mosalasonline.scrapeInternational();
      return this.response(res, 200, true, "اخبار بین‌الملل مثلث آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveInternationalMosalasOnline(req, res) {
    try {
      const article = await mosalasonline.scrapeAndSaveInternational();
      return this.response(res, 201, true, "خبر بین‌الملل مثلث آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeEconomyMosalasOnline(req, res) {
    try {
      const articles = await mosalasonline.scrapeEconomy();
      return this.response(res, 200, true, "اخبار اقتصادی مثلث آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveEconomyMosalasOnline(req, res) {
    try {
      const article = await mosalasonline.scrapeAndSaveEconomy();
      return this.response(res, 201, true, "خبر اقتصادی مثلث آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeSocialMosalasOnline(req, res) {
    try {
      const articles = await mosalasonline.scrapeSocial();
      return this.response(res, 200, true, "اخبار اجتماعی مثلث آنلاین دریافت شد.", articles);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }

  async scrapeAndSaveSocialMosalasOnline(req, res) {
    try {
      const article = await mosalasonline.scrapeAndSaveSocial();
      return this.response(res, 201, true, "خبر اجتماعی مثلث آنلاین ذخیره شد.", article);
    } catch (error) {
      return this.response(res, 500, false, error.message);
    }
  }
}

module.exports = new ScraperController(); 