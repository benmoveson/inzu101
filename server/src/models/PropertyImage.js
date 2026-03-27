const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const PropertyImage = sequelize.define(
  "PropertyImage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "property_images",
  },
);

module.exports = PropertyImage;
