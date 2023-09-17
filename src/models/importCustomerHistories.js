import { DataTypes } from 'sequelize'
import { sequelize } from '@/helpers/connection'
const ImportCustomerHistories = sequelize.define(
  'import_customer_histories',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customer_resource_id: {
      type: DataTypes.UUID,
    },
    import_date: {
      type: DataTypes.DATE,
    },
    customer_number: {
      type: DataTypes.TEXT,
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
export default ImportCustomerHistories
