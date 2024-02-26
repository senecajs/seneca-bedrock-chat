require('dotenv').config({path:'.env.local'})
console.log(process.env) // remove this

const Seneca = require('seneca')
const BedrockChatDoc = require('../dist/BedrockChatDoc')
const BedrockChat = require('../dist/BedrockChat')


run()

async function run() {
  const seneca = Seneca({ legacy: false })
        .test('print')
        .use('promisify')
        .use('entity')
        .use(BedrockChat, {
          /*
          opensearch: {
            region: process.env.TEST_OPENSEARCH_REGION,
            node: process.env.TEST_OPENSEARCH_NODE,
            index: process.env.TEST_OPENSEARCH_INDEX,
            }
          */
        })
  await seneca.ready()

  /*
  console.log('OPTS', seneca.options().plugin.BedrockChat)
  console.log('LIST', seneca.list('sys:chat'))

  let res0 = await seneca.post('sys:chat,build:prompt',{
    query:'QTN', context:'CTX'
  })

  console.log('res0', res0)
  */

  let res1 = await seneca.post('sys:chat,submit:query',{
    query:'what is devrel?',
  })

  console.log('res1', res1)

}
