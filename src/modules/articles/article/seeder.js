const Article = require("./model");
const Agency = require("../agency/model");
const Category = require("../category/model");
const Tag = require("../tag/model");
const ArticleCategory = require("../articleCategory/model");
const ArticleTag = require("../articleTag/model");

const seedArticles = async () => {
  try {
    console.log("🌱 Seeding Articles...");
    
    // دریافت آژانس‌ها، دسته‌بندی‌ها و تگ‌ها
    const agencies = await Agency.findAll({ where: { isActive: true } });
    const categories = await Category.findAll({ where: { isActive: true } });
    const tags = await Tag.findAll({ where: { isActive: true } });

    console.log(`📊 Found ${agencies.length} agencies, ${categories.length} categories, ${tags.length} tags`);

    if (agencies.length === 0) {
      console.log("⚠️ No agencies found! Please seed agencies first!");
      return;
    }

    if (categories.length === 0) {
      console.log("⚠️ No categories found! Please seed categories first!");
      return;
    }

    if (tags.length === 0) {
      console.log("⚠️ No tags found! Please seed tags first!");
      return;
    }


    console.log("✅ Articles seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding Articles:", error);
    throw error;
  }
};

module.exports = seedArticles; 