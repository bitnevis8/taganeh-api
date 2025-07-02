const Tag = require("./model");
const TagFamily = require("../tagFamily/model");
const seederData = require("./seederData.json");

const seedTags = async () => {
  try {
    console.log("🌱 Seeding Tags...");
    
    for (const data of seederData) {
      try {
        const existingTag = await Tag.findOne({
          where: { name: data.name }
        });

        if (!existingTag) {
          // اگر tagFamilyId ارائه شده، پیدا کردن خانواده تگ بر اساس نام
          let tagFamilyId = null;
          if (data.tagFamilyId) {
            const tagFamilies = await TagFamily.findAll({ where: { isActive: true } });
            if (data.tagFamilyId <= tagFamilies.length) {
              tagFamilyId = tagFamilies[data.tagFamilyId - 1].id;
            }
          }

          await Tag.create({
            ...data,
            tagFamilyId: tagFamilyId
          });
          console.log(`✅ Tag created: ${data.name}`);
        } else {
          console.log(`⚠️ Tag already exists: ${data.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating tag ${data.name}:`, error.message);
        // Continue with next tag instead of stopping
      }
    }

    console.log("✅ Tags seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding Tags:", error);
    throw error;
  }
};

module.exports = seedTags; 