const Class = require('./model');
const data = require('./seederData.json');

module.exports = async () => {
  // ابتدا همه کلاس‌ها را بدون parentSlug بسازید
  const slugToId = {};
  for (const item of data) {
    const { parentSlug, ...rest } = item;
    const [cls] = await Class.findOrCreate({ where: { slug: item.slug }, defaults: rest });
    slugToId[item.slug] = cls.id;
  }
  
  // سپس parentSlug را مقداردهی کنید
  for (const item of data) {
    if (item.parentSlug) {
      await Class.update(
        { parentSlug: item.parentSlug },
        { where: { slug: item.slug } }
      );
    }
  }
}; 