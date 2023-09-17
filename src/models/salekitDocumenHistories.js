import { DataTypes } from 'sequelize'
import { sequelize } from '@/helpers/connection'

const SalekitDocumenHistories = sequelize.define(
  'salekit_document_histories',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    //tên trường thanh đổi
    field_name: {
      type: DataTypes.TEXT,
      unique: true,
    },

    //dữ liệu trước khi thay đổi
    old_data: {
      type: DataTypes.TEXT,
    },
    // Dữ liệu sau thay đổi
    new_data: {
      type: DataTypes.TEXT,
      allowNull: false,
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

export default SalekitDocumenHistories
