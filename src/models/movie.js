import { DataTypes } from 'sequelize'
import { sequelize } from '@/helpers/connection'
const Movie = sequelize.define(
  'movies',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.TEXT,
    },
    url: {
      type: DataTypes.TEXT,
    },
    trailer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    poster_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    country: {
      type: DataTypes.TEXT,
      unique: false,
    },
    time: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    avg_rated: {
      type: DataTypes.DECIMAL(3, 1),
      defaultValue: 0,
    },
    current_rated: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    list_rated: {
      type: DataTypes.TEXT,
    },
    number_of_rated: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    actor: {
      type: DataTypes.TEXT,
    },
    view: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_monday: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_tuesday: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_wednesday: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_thursday: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_friday: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_saturday: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_sunday: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_day: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_month_one: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_month_two: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_month_three: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_month_four: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_month_five: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_month_six: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_month_seven: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_month_eight: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_month_nine: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_month_ten: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_month_eleven: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_month_twelve: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    view_of_month: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    episode_total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    year: {
      type: DataTypes.INTEGER,
    },
    publish: {
      type: DataTypes.TEXT,
    },
    admin_id: {
      type: DataTypes.UUID,
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
export default Movie
