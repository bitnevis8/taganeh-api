const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../core/database/mysql/connection");

class Category extends Model {}

Category.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    name: { 
      type: DataTypes.STRING(100), 
      allowNull: false, 
      unique: true 
    },
    description: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    slug: { 
      type: DataTypes.STRING(100), 
      allowNull: false, 
      unique: true 
    },
    parentId: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      references: {
        model: 'news_categories',
        key: 'id'
      },
      comment: 'شناسه دسته‌بندی والد (برای زیردسته‌ها)'
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    }
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "news_categories",
    timestamps: true,
    underscored: true
  }
);

module.exports = Category; 