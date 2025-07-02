const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../core/database/mysql/connection");

class TagFamily extends Model {}

TagFamily.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    name: { 
      type: DataTypes.STRING(100), 
      allowNull: false, 
      unique: true,
      comment: 'نام خانواده تگ'
    },
    description: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'توضیحات خانواده تگ'
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true,
      comment: 'وضعیت فعال بودن خانواده تگ'
    }
  },
  {
    sequelize,
    modelName: "TagFamily",
    tableName: "news_tag_families",
    timestamps: true,
    underscored: true,
    comment: 'جدول خانواده‌های تگ برای گروه‌بندی تگ‌های مشابه'
  }
);

module.exports = TagFamily; 