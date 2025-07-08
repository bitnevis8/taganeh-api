const Class = require('../class/model');
const Tag = require('../tag/model');
const ClassTag = require('./model');
const tagClassRelations = require('./seederData.json');

module.exports = async () => {

  // ایجاد ارتباطات
  for (const relation of tagClassRelations) {
    const tag = await Tag.findOne({ where: { name: relation.tagName } });
    if (!tag) {
      console.log(`Tag not found: ${relation.tagName}`);
      continue;
    }

    for (const classSlug of relation.classSlugs) {
      const classItem = await Class.findOne({ where: { slug: classSlug } });
      if (!classItem) {
        console.log(`Class not found: ${classSlug}`);
        continue;
      }

      await ClassTag.findOrCreate({
        where: {
          tagId: tag.id,
          classId: classItem.id
        }
      });
    }
  }
}; 