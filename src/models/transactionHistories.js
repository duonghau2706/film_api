import { DataTypes } from 'sequelize'
import { sequelize } from '@/helpers/connection'

const TransactionHistories = sequelize.define(
  'transaction_histories',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    money: {
      type: DataTypes.BIGINT,
    },
    account_balance: {
      type: DataTypes.BIGINT,
    },
    service: {
      type: DataTypes.INTEGER,
    },
    bank_name: {
      type: DataTypes.TEXT,
    },
    bank_account: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

export default TransactionHistories
