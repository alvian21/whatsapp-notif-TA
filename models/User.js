// import sequelize 
import {
    Sequelize
} from "sequelize";
// import connection 
import db from "../config/database.js";
import Bagian from "./Bagian.js";

// init DataTypes
const {
    DataTypes
} = Sequelize;

// Define schema
const User = db.define('kar_mf', {
    // Define attributes
    NIK: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    PIN: {
        type: DataTypes.STRING
    }
}, {
    // Freeze Table Name
    freezeTableName: true,
    timestamps: false
});

User.belongsTo(Bagian)

// Export model User
export default User;