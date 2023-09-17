import { DataTypes } from 'sequelize'

import { sequelize } from '@/helpers/connection'

const ContactInfor = sequelize.define(

  'contact_infors',

  {

    id: {

      type: DataTypes.UUID,

      defaultValue: DataTypes.UUIDV4,

      primaryKey: true,

    },

    name_kanji: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    name_hira: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    name_kata: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    name_company_kanji: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    name_company_hira: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    name_company_kata: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    address_kanji: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    address_hira: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    address_kata: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    position_kanji: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    position_hira: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    position_kata: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    mail: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    url: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    position_name: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    post_office_code: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    phone_number: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    field: {

      type: DataTypes.TEXT,

      allowNull: true,

    },

    title: {

      type: DataTypes.TEXT,

      allowNull: true,

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

export default ContactInfor