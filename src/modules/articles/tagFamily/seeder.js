const TagFamily = require("./model");
const seederData = require("./seederData.json");

const seedTagFamilies = async () => {
  try {
    console.log("🌱 Seeding TagFamilies...");
    
    for (const data of seederData) {
      const existingTagFamily = await TagFamily.findOne({
        where: { name: data.name }
      });

      if (!existingTagFamily) {
        await TagFamily.create(data);
        console.log(`✅ TagFamily created: ${data.name}`);
      } else {
        console.log(`⚠️ TagFamily already exists: ${data.name}`);
      }
    }

    console.log("✅ TagFamilies seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding TagFamilies:", error);
    throw error;
  }
};

module.exports = seedTagFamilies; 