const Category = require("./model");
const seederData = require("./seederData.json");

const seedCategories = async () => {
  try {
    console.log("🌱 Seeding Categories...");
    
    // ابتدا parent categories را ایجاد می‌کنیم
    const parentCategories = seederData.filter(cat => cat.parentId === null);
    const childCategories = seederData.filter(cat => cat.parentId !== null);
    
    // ایجاد parent categories
    for (const data of parentCategories) {
      try {
        const existingCategory = await Category.findOne({
          where: { 
            [require('sequelize').Op.or]: [
              { name: data.name },
              { slug: data.slug }
            ]
          }
        });

        if (!existingCategory) {
          await Category.create(data);
          console.log(`✅ Parent Category created: ${data.name}`);
        } else {
          console.log(`⚠️ Parent Category already exists: ${data.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating parent category ${data.name}:`, error.message);
      }
    }

    // حالا child categories را با parent_id صحیح ایجاد می‌کنیم
    for (const data of childCategories) {
      try {
        // پیدا کردن parent category بر اساس نام
        const parentCategory = await Category.findOne({
          where: { 
            name: getParentNameByParentId(data.parentId)
          }
        });

        if (!parentCategory) {
          console.log(`⚠️ Parent category not found for ${data.name}, skipping...`);
          continue;
        }

        const existingCategory = await Category.findOne({
          where: { 
            [require('sequelize').Op.or]: [
              { name: data.name },
              { slug: data.slug }
            ]
          }
        });

        if (!existingCategory) {
          await Category.create({
            ...data,
            parentId: parentCategory.id
          });
          console.log(`✅ Child Category created: ${data.name} (Parent: ${parentCategory.name})`);
        } else {
          console.log(`⚠️ Child Category already exists: ${data.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating child category ${data.name}:`, error.message);
      }
    }

    console.log("✅ Categories seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding Categories:", error);
    throw error;
  }
};

// تابع کمکی برای پیدا کردن نام parent بر اساس parentId در seederData
function getParentNameByParentId(parentId) {
  const parentCategories = seederData.filter(cat => cat.parentId === null);
  return parentCategories[parentId - 1]?.name;
}

module.exports = seedCategories; 