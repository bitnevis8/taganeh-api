const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../core/database/mysql/connection");

class ClassTag extends Model {}

ClassTag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tags',
        key: 'id'
      }
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: "ClassTag",
    tableName: "class_tags",
    timestamps: false,
    underscored: true
  }
);

module.exports = ClassTag; 