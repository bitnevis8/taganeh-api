const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../core/database/mysql/connection");

class Tag extends Model {}

Tag.init(
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
    hasFamily: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false,
      comment: 'آیا این تگ خانواده دارد یا نه'
    },
    tagFamilyId: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      references: {
        model: 'news_tag_families',
        key: 'id'
      },
      comment: 'شناسه خانواده تگ (اختیاری)'
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'news_tags',
        key: 'id'
      },
      comment: 'شناسه والد (اختیاری)'
    }
  },
  {
    sequelize,
    modelName: "Tag",
    tableName: "news_tags",
    timestamps: true,
    underscored: true
  }
);

module.exports = Tag; 