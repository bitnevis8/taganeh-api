const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../core/database/mysql/connection");

class Article extends Model {}

Article.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    title: { 
      type: DataTypes.STRING(500), 
      allowNull: false 
    },
    content: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    summary: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    sourceUrl: { 
      type: DataTypes.STRING(500), 
      allowNull: false, 
      unique: true 
    },
    imageUrl: { 
      type: DataTypes.STRING(500), 
      allowNull: true 
    },
    publishedAt: { 
      type: DataTypes.DATE, 
      allowNull: false 
    },
    agencyId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'agencies',
        key: 'id'
      }
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
    scrapedAt: { 
      type: DataTypes.DATE, 
      allowNull: false,
      defaultValue: DataTypes.NOW 
    }
  },
  {
    sequelize,
    modelName: "Article",
    tableName: "articles",
    timestamps: true,
    underscored: true
  }
);

module.exports = Article; 