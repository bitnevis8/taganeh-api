const Tag = require("./model");
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
          await Tag.create(data);
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