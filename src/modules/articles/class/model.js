const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../core/database/mysql/connection");

class Class extends Model {}

Class.init(
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
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parentSlug: {
      type: DataTypes.STRING(100),
      allowNull: true,
      references: {
        model: 'classes',
        key: 'slug'
      },
      comment: 'اسلاگ والد برای زیرمجموعه‌ها'
    }
  },
  {
    sequelize,
    modelName: "Class",
    tableName: "classes",
    timestamps: true,
    underscored: true
  }
);

module.exports = Class; 