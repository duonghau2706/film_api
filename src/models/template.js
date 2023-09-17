import { DataTypes } from 'sequelize'
import { sequelize } from '@/helpers/connection'

const Template = sequelize.define(
  'templates',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    number_of_characters: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    template_name: {
      type: DataTypes.TEXT,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
    },
    styles: {
      type: DataTypes.TEXT,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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

export default Template
