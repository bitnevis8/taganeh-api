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
    slug: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    description: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tags',
        key: 'id'
      },
      comment: 'شناسه والد (اختیاری)'
    }
  },
  {
    sequelize,
    modelName: "Tag",
    tableName: "tags",
    timestamps: true,
    underscored: true
  }
);

module.exports = Tag; 