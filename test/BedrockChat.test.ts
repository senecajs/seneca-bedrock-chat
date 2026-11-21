/* Copyright © 2024 Seneca Project Contributors, MIT License. */

import {
  createServer,
  Http2Server,
  Http2ServerRequest,
  Http2ServerResponse,
  ServerHttp2Session,
} from 'node:http2'
import { AddressInfo } from 'node:net'

import Seneca from 'seneca'
// import SenecaMsgTest from 'seneca-msg-test'
// import { Maintain } from '@seneca/maintain'

import BedrockChatDoc from '../src/BedrockChatDoc'
import BedrockChat from '../src/BedrockChat'

// NOTE: the live tests (basic-query, model-query, model-json-query) call AWS
// Bedrock, and need the AWS_PROFILE environment variable with Bedrock access.
// They skip without it.
const LOCAL = !!process.env.AWS_PROFILE
const testLive = LOCAL ? test : test.skip


describe('BedrockChat', () => {

  test('happy', async () => {
    expect(BedrockChat).toBeDefined()
    expect(BedrockChatDoc).toBeDefined()
    const seneca = await makeSeneca()
    expect(seneca).toBeDefined()
  })


  test('defaults', async () => {
    const seneca = await makeSeneca()
    expect(seneca.find_plugin('BedrockChat').options).toMatchObject({
      debug: false,
      global: true,
      bedrock: { region: 'us-east-1' },
      config: {
        model: 'ai21.j2-ultra-v1',
        modelSettings: {
          temperature: 0.7,
          region: 'us-east-1',
          maxTokens: 1525,
          topP: 1.0,
        },
      },
    })

    const seneca1 = await makeSeneca({
      bedrock: { region: 'eu-west-1' },
      config: { modelSettings: { maxTokens: null, top_p: 0.9 } },
    })
    expect(seneca1.find_plugin('BedrockChat').options).toMatchObject({
      bedrock: { region: 'eu-west-1' },
      config: {
        model: 'ai21.j2-ultra-v1',
        modelSettings: {
          temperature: 0.7,
          maxTokens: null,
          top_p: 0.9,
        },
      },
    })
  })


  test('submit-query-rule', async () => {
    const seneca = await makeSeneca()

    // Answer invoke:model locally, so no AWS call is made.
    const seen: any[] = []
    seneca.message('sys:chat,chat:bedrock,invoke:model', async (msg: any) => {
      seen.push(msg)
      return { ok: true, answer: 'A' }
    })

    let res1 = await seneca.post('sys:chat,submit:query', { query: 'Q' })
    expect(res1).toEqual({ ok: true, answer: 'A' })
    expect(seen[0]).toMatchObject({
      chat: 'bedrock',
      query: 'Q',
      prompt: 'Q',
      config: { model: 'ai21.j2-ultra-v1' },
    })

    await expect(seneca.post('sys:chat,submit:query', {}))
      .rejects.toMatchObject({ code: 'act_invalid_msg' })
    await expect(seneca.post('sys:chat,submit:query', { query: 1 }))
      .rejects.toMatchObject({ code: 'act_invalid_msg' })
  })


  // The plugin builds its BedrockRuntimeClient from the bedrock option, so the
  // InvokeModel call can go to a local stand-in of the Bedrock runtime API
  // (POST /model/{modelId}/invoke), started here on an ephemeral port. The
  // Bedrock runtime client sends its requests over HTTP/2, so the stand-in
  // is an HTTP/2 server without TLS (the endpoint is http://). It
  // answers in the two response formats the plugin reads: AI21 Jurassic-2
  // (completions, the default model) and Meta Llama (generation).
  test('invoke-model-stub', async () => {
    const calls: any[] = []
    const stub = await startBedrockStub((modelId, body) => {
      calls.push({ modelId, body })
      return modelId.startsWith('meta.')
        ? { generation: 'Llama answer.<|eot_id|> trailing' }
        : { completions: [{ data: { text: 'Jurassic answer.' } }] }
    })

    try {
      const bedrock = {
        region: 'us-east-1',
        endpoint: stub.url,
        credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
      }

      const seneca = await makeSeneca({ bedrock })
      const res1 = await seneca.post('sys:chat,submit:query', { query: 'Q1' })
      expect(res1).toEqual({ ok: true, answer: 'Jurassic answer.' })
      expect(calls[0]).toEqual({
        modelId: 'ai21.j2-ultra-v1',
        body: { maxTokens: 1525, temperature: 0.7, prompt: 'Q1', topP: 1 },
      })

      const seneca1 = await makeSeneca({
        bedrock,
        config: {
          model: 'meta.llama3-8b-instruct-v1:0',
          modelSettings: { maxTokens: null, topP: null },
        },
      })
      const res2 = await seneca1.post('sys:chat,submit:query', { query: 'Q2' })
      expect(res2).toEqual({ ok: true, answer: 'Llama answer.' })
      expect(calls[1]).toEqual({
        modelId: 'meta.llama3-8b-instruct-v1:0',
        body: { temperature: 0.7, prompt: 'Q2' },
      })

      await seneca.close()
      await seneca1.close()
    } finally {
      await stub.close()
    }
  })


  testLive('basic-query', async () => {

    const seneca = await makeSeneca()
    let res1 = await seneca.post('sys:chat,submit:query', {
      query: 'what is devrel?',
    })

    // console.log('res1', res1)

    expect(res1).toMatchObject({ ok: true })
  }, 9999)


  testLive('model-query', async () => {

    const seneca = await makeSeneca({
      /*
      config: {
        model: 'meta.llama3-8b-instruct-v1:0',
        modelSettings: {
          maxTokens: null,
          topP: null,
          top_p: 0.9,
          max_gen_len: 555,
        }
        }
        */
    })
    let res1 = await seneca.post('sys:chat,submit:query', {
      query: `
<| begin_of_text |> <| start_header_id |>user<| end_header_id |>
what is devrel?
<| eot_id |>
<| begin_of_text |><| start_header_id |>assistant<| end_header_id |>
`,
    })

    expect(res1).toMatchObject({ ok: true })
  }, 9999)


  testLive('model-json-query', async () => {

    const seneca = await makeSeneca({
      config: {
        model: 'meta.llama3-8b-instruct-v1:0',
        modelSettings: {
          maxTokens: null,
          topP: null,
          top_p: 0.9,
          max_gen_len: 1111,
        }
      }
    })
    let res1 = await seneca.post('sys:chat,submit:query', {
      query: `
<| begin_of_text |>
<| start_header_id |>system<| end_header_id |>
Provide one answer only. DO NOT GENERATE A CONVERSATION.
<| eot_id |>
<| begin_of_text |>
<| start_header_id |>user<| end_header_id |>
Generate a JSON document describing the solar system in the format {"planets":{...}}. GENERATE ONLY JSON.
<| eot_id |>
<| begin_of_text |><| start_header_id |>assistant<| end_header_id |>
`,
    })

    expect(res1).toMatchObject({ ok: true })

    const json = JSON.parse(res1.answer)
    expect(json).toMatchObject({ planets: {} })

  }, 9999)

})



async function makeSeneca(opts?: any) {
  const seneca = Seneca({ legacy: false })
    // .test('print')
    .test()
    .use(BedrockChat, opts)
  await seneca.ready()

  return seneca
}


// A stand-in for the Bedrock runtime InvokeModel operation: the reply function
// gets the model id and the JSON request body, and returns the JSON response body.
async function startBedrockStub(
  reply: (modelId: string, body: any) => any,
): Promise<{ url: string; close: () => Promise<void> }> {
  const sessions = new Set<ServerHttp2Session>()
  const server: Http2Server = createServer(
    (req: Http2ServerRequest, res: Http2ServerResponse) => {
      const chunks: Buffer[] = []
      req.on('data', (c: Buffer) => chunks.push(c))
      req.on('end', () => {
        const m = (req.url || '').match(/^\/model\/([^/]+)\/invoke$/)
        if ('POST' !== req.method || null == m) {
          res.writeHead(404, { 'content-type': 'application/json' })
          return res.end(JSON.stringify({ message: 'Not found' }))
        }
        const modelId = decodeURIComponent(m[1])
        const body = JSON.parse(Buffer.concat(chunks).toString())
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify(reply(modelId, body)))
      })
    },
  )
  server.on('session', (session: ServerHttp2Session) => {
    sessions.add(session)
    session.on('close', () => sessions.delete(session))
  })
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()))
  const port = (server.address() as AddressInfo).port
  return {
    url: 'http://127.0.0.1:' + port,
    close: () =>
      new Promise<void>((r) => {
        // The client keeps its HTTP/2 session open, so end it here.
        sessions.forEach((session) => session.destroy())
        server.close(() => r())
      }),
  }
}
