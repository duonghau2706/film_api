import { DataTypes } from 'sequelize'
import { sequelize } from '@/helpers/connection'

const SalekitCategories = sequelize.define(
  'salekit_categories',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    //tên
    name: {
      type: DataTypes.TEXT,
      unique: true,
    },

    //type
    type: {
      type: DataTypes.INTEGER, //1: loại tài liệu, 2: loại lưu trữ, 3: domain, 4: language
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

export default SalekitCategories
