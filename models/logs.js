"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Logs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Logs.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      hash: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      remoteAddr: {
        type: DataTypes.STRING,
      },
      remoteUser: {
        type: DataTypes.STRING,
      },
      timeStr: {
        type: DataTypes.STRING,
      },
      time: {
        type: DataTypes.DATE,
      },
      request: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
      },
      httpReferer: {
        type: DataTypes.STRING,
      },
      httpXForwardedFor: {
        type: DataTypes.STRING,
      },
      client: {
        type: DataTypes.STRING,
      },
      clientUsername: {
        type: DataTypes.STRING,
      },
      requestBody: {
        type: DataTypes.TEXT("long"),
        get() {
          const rawValue = this.getDataValue("requestBody");
          return rawValue ? JSON.parse(rawValue) : null;
        },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: false,
      modelName: "Log",
      tableName: "logs",
      defaultScope: {
        order: [["time", "DESC"]],
      },
    }
  );
  return Logs;
};
