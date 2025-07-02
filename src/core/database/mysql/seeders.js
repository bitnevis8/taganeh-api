const sequelize = require("./connection");

// Import user module seeders
const seedRoles = require("../../../modules/user/role/seeder");
const seedUsers = require("../../../modules/user/user/seeder");
const seedUserRoles = require("../../../modules/user/userRole/seeder");

// Import article module seeders
const seedTagFamilies = require("../../../modules/articles/tagFamily/seeder");
const seedTags = require("../../../modules/articles/tag/seeder");
const seedCategories = require("../../../modules/articles/category/seeder");
const seedAgencies = require("../../../modules/articles/agency/seeder");
const seedArticles = require("../../../modules/articles/article/seeder");

// Group seeders by module for better organization and control
const userSeeders = [seedRoles, seedUsers, seedUserRoles];

async function runSeederGroup(seeders, groupName) {
  console.log(`\nRunning ${groupName} Seeders...`);
  for (const seeder of seeders) {
    try {
      await seeder();
      console.log(`✅ ${seeder.name} completed successfully`);
    } catch (error) {
      console.error(`❌ Error in ${seeder.name}:`, error);
      throw error; // Re-throw to stop the seeding process
    }
  }
  console.log(`✅ ${groupName} Seeding completed\n`);
}

async function runSeeders() {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Run user module seeders
    await runSeederGroup(userSeeders, "User Data");

    // Run article module seeders
    await runSeederGroup([seedTagFamilies, seedTags, seedCategories, seedAgencies, seedArticles], "Article Data");

    console.log("\n✅ All database seeding completed successfully!");
  } catch (error) {
    console.error("\n❌ Database seeding failed:", error);
    process.exit(1);
  }
}

module.exports = runSeeders; 