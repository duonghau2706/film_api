import { DataTypes } from 'sequelize'
import { sequelize } from '@/helpers/connection'

const EffortMembers = sequelize.define(
  'effort_members',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    //Tên người dùng
    name_user: {
      type: DataTypes.TEXT,
    },
    //id người dùng
    user_id: {
      type: DataTypes.UUID,
    },
    //Ngày làm việc
    work_date: {
      type: DataTypes.DATE,
    },
    //số giờ làm việc
    number_work_hours: {
      type: DataTypes.DECIMAL(6, 2),
    },
    note: {
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

export default EffortMembers
