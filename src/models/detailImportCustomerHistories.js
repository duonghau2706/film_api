import { DataTypes } from 'sequelize'
import { sequelize } from '@/helpers/connection'
const DetailImportCustomerHistories = sequelize.define(
  'detail_import_customer_histories',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    romaji_name: {
      type: DataTypes.TEXT,
    },
    field_name: {
      type: DataTypes.TEXT,
    },
    url: {
      type: DataTypes.TEXT,
    },
    email: {
      type: DataTypes.TEXT,
      unique: false,
    },
    size: {
      type: DataTypes.TEXT,
    },
    customer_resource_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    revenue: {
      type: DataTypes.DECIMAL(15, 3),
      allowNull: true,
    },
    investment: {
      type: DataTypes.DECIMAL(15, 3),
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
    },
    type_of_customer: {
      type: DataTypes.TEXT,
    },
    frequency_of_email: {
      type: DataTypes.TEXT,
    },
    reason: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.TEXT,
    },
    import_customer_histories_id: {
      type: DataTypes.UUID,
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
export default DetailImportCustomerHistories
