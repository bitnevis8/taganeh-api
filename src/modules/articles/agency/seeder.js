const Agency = require("./model");
const seederData = require("./seederData.json");

const seedAgencies = async () => {
  try {
    console.log("🌱 Seeding Agencies...");
    
    for (const data of seederData) {
      try {
        const existingAgency = await Agency.findOne({
          where: { 
            [require('sequelize').Op.or]: [
              { name: data.name },
              { websiteUrl: data.websiteUrl }
            ]
          }
        });

        if (!existingAgency) {
          await Agency.create(data);
          console.log(`✅ Agency created: ${data.name}`);
        } else {
          console.log(`⚠️ Agency already exists: ${data.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating agency ${data.name}:`, error.message);
        // Continue with next agency instead of stopping
      }
    }

    console.log("✅ Agencies seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding Agencies:", error);
    throw error;
  }
};

module.exports = seedAgencies; 