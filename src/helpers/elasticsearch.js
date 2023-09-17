// const { Client } = require('@elastic/elasticsearch')
// const client = new Client({ node: 'http://localhost:9200' })

// const mapping = {
//   properties: {
//     name: {
//       type: 'text',
//     },
//   },
// }

// async function createIndexWithMapping() {
//   await client.indices.create({
//     index: 'products',
//     body: {
//       mappings: mapping,
//     },
//   })
// }

// createIndexWithMapping()
//   .then(() => console.log('Index created with mapping'))
//   .catch((err) => console.error(err))
import { elasticsearchClient } from '@/server'
import log4js from 'log4js'
import { CustomerModel } from '@/models'
import ResponseUtils from '@/utils/ResponseUtils'
const logger = log4js.getLogger()

const createIndexOfCustomer = async () => {
  try {
    function getElasticsearchDataType(dataType) {
      // Map Sequelize data types to Elasticsearch data types
      switch (dataType.key) {
        case 'INTEGER':
          return 'long'
        case 'UUID':
          return 'keyword'
        case 'DOUBLE':
          return 'float'
        case 'DECIMAL':
          return 'float'
        case 'TEXT':
          return 'text'
        case 'INTEGER':
          return 'integer'
        case 'BOOLEAN':
          return 'boolean'
        case 'DATE':
          return 'date'
        default:
          return 'text'
      }
    }

    const properties = {}

    // Get the attributes of the Product model and map them to Elasticsearch data types
    for (const [attributeName, attribute] of Object.entries(
      CustomerModel.rawAttributes
    )) {
      properties[attributeName] = {
        type: getElasticsearchDataType(attribute.type),
      }
    }

    const res = await elasticsearchClient.indices.create({
      index: 'customers_index',
      body: {
        mappings: {
          properties,
        },
      },
    })

    console.log(res)
  } catch (error) {
    console.log(error)
    logger.error(error.message)
    res
      .status(error.statusCode)
      .json(ResponseUtils(error.statusCode, error.message, null))
  } finally {
  }
}

export { createIndexOfCustomer }
