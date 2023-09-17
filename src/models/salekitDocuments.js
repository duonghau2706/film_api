import { DataTypes } from 'sequelize'
import { sequelize } from '@/helpers/connection'

const SalekitDocument = sequelize.define(
  'salekit_documents',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    //tên file
    file_name: {
      type: DataTypes.TEXT,
    },

    //loại file
    file_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    //Thông tin url của file trên share point
    url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    //Thông tin id sharepoint của file trên share point
    sharepoint_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    //loại upload
    upload_type: {
      type: DataTypes.INTEGER, //0: tài liệu mới, 1: cập nhật tài liệu có sẵn
      allowNull: true,
    },
    //tài liệu gốc nếu là tài liệu mới thì ID là chính nó.
    original_document_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    //phiên bản
    version: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    //ngôn ngữ
    language_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    //loại tài liệu
    document_type_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    //loại lưu trữ
    storage_type_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    //domain
    domain_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    //sub domain
    sub_domain: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    //công nghệ sử dụng
    technology_used: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    //ngôn ngữ phát triển
    language_development: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    //hashtag
    hashtag: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },

    //mô tả
    description: {
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

export default SalekitDocument
