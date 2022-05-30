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
const Bagian = db.define('bagian', {
    // Define attributes
    KODE: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    NAMA: {
        type: DataTypes.STRING
    }
}, {
    // Freeze Table Name
    freezeTableName: true,
    timestamps: false
});

Bagian.hasMany(User, {
    foreignKey: 'BAGIAN'
})

// Export model Bagian
export default Bagian;