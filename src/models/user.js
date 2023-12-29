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

    email: {
      type: DataTypes.TEXT,
    },

    password: {
      type: DataTypes.TEXT,
    },

    gender: {
      type: DataTypes.INTEGER,

      defaultValue: 2,
    },

    born: {
      type: DataTypes.TEXT,
    },

    phone: {
      type: DataTypes.TEXT,

      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,

      allowNull: true,
    },

    money: {
      type: DataTypes.BIGINT,
    },

    list_movie_id: {
      type: DataTypes.TEXT,
    },

    service: {
      type: DataTypes.INTEGER,
    },

    renewal_date: {
      type: DataTypes.TEXT,
    },

    bank_name: {
      type: DataTypes.TEXT,
    },

    bank_account: {
      type: DataTypes.TEXT,
    },

    role: {
      type: DataTypes.INTEGER,

      defaultValue: 0,
    },

    is_member: {
      type: DataTypes.BOOLEAN,

      defaultValue: true,
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

    updated_at: {
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
