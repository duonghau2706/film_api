import { DataTypes } from 'sequelize'
import { sequelize } from '@/helpers/connection'

const SentMailHistory = sequelize.define(
  'sent_mail_histories',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    customer_name: {
      type: DataTypes.TEXT,
      // allowNull: false,
    },
    customer_email: {
      type: DataTypes.TEXT,
    },
    customer_url: {
      type: DataTypes.TEXT,
      // allowNull: false,
    },
    pregnancy_status_sending: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    template_id: {
      type: DataTypes.UUID,
      // allowNull: false,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status_feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    //* Người phụ trách */
    person_in_charge: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    //* Người gửi */
    user_id: {
      type: DataTypes.UUID,
      // allowNull: false,
    },
    feedback_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    meeting: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    send_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    send_from: {
      type: DataTypes.TEXT,
    },
    reason_send_mail: {
      type: DataTypes.TEXT,
    },
    template_name: {
      type: DataTypes.TEXT,
      // allowNull: false,
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

export default SentMailHistory
