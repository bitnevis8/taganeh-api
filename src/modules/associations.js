const User = require('./user/user/model');
const Role = require('./user/role/model');
const UserRole = require('./user/userRole/model');
// const { MissionOrder, MissionCompanion } = require('./aryafoulad/missionOrder/model');
const FileUpload = require('./fileUpload/model');
// const Item = require('./aryafoulad/warehouseModule/item/model');
// const Inventory = require('./aryafoulad/warehouseModule/inventory/model');
// const Warehouse = require('./aryafoulad/warehouseModule/warehouse/model');
// const StockHistory = require('./aryafoulad/warehouseModule/stockHistory/model');
// const ItemAssignment = require('./aryafoulad/warehouseModule/itemAssignment/model');

// Import مدل‌های ماژول articles
const Agency = require('./articles/agency/model');
const Article = require('./articles/article/model');
const Category = require('./articles/category/model');
const Tag = require('./articles/tag/model');
const TagFamily = require('./articles/tagFamily/model');
const ArticleCategory = require('./articles/articleCategory/model');
const ArticleTag = require('./articles/articleTag/model');

// تعریف ارتباطات بین مدل‌ها
const defineAssociations = () => {
    // ارتباطات مربوط به کاربران و نقش‌ها
    // User.belongsTo(Role, { 
    //     foreignKey: "roleId", 
    //     as: "role",
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });
    // Role.hasMany(User, { 
    //     foreignKey: "roleId", 
    //     as: "users" 
    // });

    // ارتباطات Many-to-Many بین User و Role
    User.belongsToMany(Role, {
        through: UserRole,
        foreignKey: 'userId',
        otherKey: 'roleId',
        as: 'userRoles',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Role.belongsToMany(User, {
        through: UserRole,
        foreignKey: 'roleId',
        otherKey: 'userId',
        as: 'roleUsers',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    // ارتباطات مربوط به ماموریت‌ها
    // MissionOrder.belongsTo(User, { 
    //     foreignKey: 'userId', 
    //     as: 'user',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });
    // MissionOrder.belongsToMany(User, { 
    //     through: MissionCompanion, 
    //     as: 'missionCompanions',
    //     foreignKey: 'missionOrderId',
    //     otherKey: 'userId',
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE'
    // });
    // User.belongsToMany(MissionOrder, { 
    //     through: MissionCompanion, 
    //     as: 'missions',
    //     foreignKey: 'userId',
    //     otherKey: 'missionOrderId',
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE'
    // });

    // ارتباطات مربوط به فایل‌ها
    // MissionOrder.hasMany(FileUpload, {
    //     foreignKey: 'missionOrderId',
    //     as: 'files',
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE'
    // });
    // FileUpload.belongsTo(MissionOrder, {
    //     foreignKey: 'missionOrderId',
    //     as: 'missionOrder',
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE'
    // });

    // ارتباطات مربوط به انبار
    // Warehouse.hasMany(Inventory, { 
    //     foreignKey: 'warehouseId', 
    //     as: 'inventories',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });
    // Inventory.belongsTo(Warehouse, { 
    //     foreignKey: 'warehouseId', 
    //     as: 'warehouse',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });

    // ارتباطات مربوط به کالا
    // Item.hasMany(Inventory, { 
    //     foreignKey: 'itemId', 
    //     as: 'inventories',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });
    // Inventory.belongsTo(Item, { 
    //     foreignKey: 'itemId', 
    //     as: 'item',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });

    // ارتباطات مربوط به تخصیص کالا
    // Item.hasMany(ItemAssignment, { 
    //     foreignKey: 'itemId', 
    //     as: 'assignments',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });
    // ItemAssignment.belongsTo(Item, { 
    //     foreignKey: 'itemId', 
    //     as: 'assignedItem',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });

    // ارتباطات مربوط به تاریخچه موجودی
    // Inventory.hasMany(StockHistory, { 
    //     foreignKey: 'inventoryId', 
    //     as: 'stockHistory',
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE'
    // });
    // StockHistory.belongsTo(Inventory, { 
    //     foreignKey: 'inventoryId', 
    //     as: 'inventory',
    //     onDelete: 'CASCADE',
    //     onUpdate: 'CASCADE'
    // });

    // ارتباطات مربوط به تخصیص و کاربر
    // ItemAssignment.belongsTo(User, { 
    //     foreignKey: 'userId', 
    //     as: 'assignedUser',
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE'
    // });

    // ===== ارتباطات ماژول Articles =====
    
    // ارتباطات مربوط به آژانس و مقاله
    Agency.hasMany(Article, { 
        foreignKey: 'agencyId', 
        as: 'articles',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });
    Article.belongsTo(Agency, { 
        foreignKey: 'agencyId', 
        as: 'agency',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });

    // ارتباطات مربوط به خانواده تگ و تگ
    TagFamily.hasMany(Tag, { 
        foreignKey: 'tagFamilyId', 
        as: 'tags',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });
    Tag.belongsTo(TagFamily, { 
        foreignKey: 'tagFamilyId', 
        as: 'tagFamily',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });

    // ارتباطات مربوط به دسته‌بندی سلسله‌مراتبی
    Category.hasMany(Category, { 
        foreignKey: 'parentId', 
        as: 'subCategories',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });
    Category.belongsTo(Category, { 
        foreignKey: 'parentId', 
        as: 'parentCategory',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });

    // ارتباطات چند-به-چند مقاله و دسته‌بندی
    Article.belongsToMany(Category, { 
        through: ArticleCategory, 
        as: 'categories',
        foreignKey: 'articleId',
        otherKey: 'categoryId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Category.belongsToMany(Article, { 
        through: ArticleCategory, 
        as: 'articles',
        foreignKey: 'categoryId',
        otherKey: 'articleId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    // ارتباطات چند-به-چند مقاله و تگ
    Article.belongsToMany(Tag, { 
        through: ArticleTag, 
        as: 'tags',
        foreignKey: 'articleId',
        otherKey: 'tagId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Tag.belongsToMany(Article, { 
        through: ArticleTag, 
        as: 'articles',
        foreignKey: 'tagId',
        otherKey: 'articleId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
};

module.exports = defineAssociations; 