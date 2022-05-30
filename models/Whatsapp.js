// import sequelize 
import {
    Sequelize
} from "sequelize";
// import connection 
import db from "../config/database.js";

// init DataTypes
const {
    DataTypes
} = Sequelize;

// Define schema
const Whatsapp = db.define('whatsapps', {
    // Define attributes
    WHATSAPP_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    NIK: {
        type: DataTypes.STRING,
        allowNull: true
    },
    NO_WA: {
        type: DataTypes.STRING,
    },
    TOKEN: {
        type: DataTypes.STRING,
    },
}, {
    // Freeze Table Name
    freezeTableName: true
});

// Export model Whatsapp
export default Whatsapp;