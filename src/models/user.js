import { DataTypes } from 'sequelize'

import { sequelize } from '@/helpers/connection'




const Users = sequelize.define(

  'users',

  {

    id: {

      type: DataTypes.UUID,

      defaultValue: DataTypes.UUIDV4,

      primaryKey: true,

    },

    name: {

      type: DataTypes.TEXT,

    },

    username: {

      type: DataTypes.TEXT,

    },

    email: {

      type: DataTypes.TEXT,

    },

    gender: {

      type: DataTypes.INTEGER,

      defaultValue: 2,

    },

    phoneNumber: {

      type: DataTypes.BIGINT,

      allowNull: true,

    },

    address: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    role: {

      type: DataTypes.INTEGER,

      defaultValue: 0,

    },

    deleted: {

      type: DataTypes.BOOLEAN,

      defaultValue: false,

    },

    created_by: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    updated_by: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

  },

  {

    timestamps: true,

    createdAt: 'created_at',

    updatedAt: 'updated_at',

  }

)




export default Users