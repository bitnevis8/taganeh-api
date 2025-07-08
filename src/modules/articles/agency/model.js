const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../core/database/mysql/connection");

class Agency extends Model {}

Agency.init(
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
    nameEn: { 
      type: DataTypes.STRING(100), 
      allowNull: false, 
      unique: true 
    },
    websiteUrl: { 
      type: DataTypes.STRING(255), 
      allowNull: false, 
      unique: true 
    },
    description: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    logo: { 
      type: DataTypes.STRING(255), 
      allowNull: true 
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
    scrapingConfig: { 
      type: DataTypes.JSON, 
      allowNull: true,
      comment: 'تنظیمات اسکرپینگ برای این آژانس'
    }
  },
  {
    sequelize,
    modelName: "Agency",
    tableName: "agencies",
    timestamps: true,
    underscored: true
  }
);

module.exports = Agency; 