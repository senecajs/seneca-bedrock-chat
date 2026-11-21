# Changes

## 0.1.0 2026-11-21

* Seneca 4 only: the peer dependency is `seneca` `^4.0.0`. Seneca 3
  users stay on `@seneca/bedrock-chat` 0.0.5.
* Node.js 24 or later (`engines.node` `>=24`).
* Seneca 4.0.0 validates with
  [shape](https://github.com/rjrodger/shape), the renamed successor of
  Gubu, and rejects option defaults built with Gubu
  (`plugin_gubu_shape`) and Gubu nodes in message rules
  (`add_gubu_shape`), so 0.0.5 stops the process at startup there.
  `defaults` is now a function of `{ valid }`, the builders Seneca
  passes to it (B1). The options are unchanged.
* The `submit:query` rule (`query` a required string, `chat`
  defaulting to `''`) is built with the validator of the Seneca
  instance (`seneca.valid`). An invalid message is still refused with
  `act_invalid_msg`; Seneca 4.0.0 words the error without the value.
* The gubu import is removed. gubu was never a declared dependency; it
  was available only through Seneca 3's own dependency on it.
* Breaking: the only peer dependencies are `seneca` and
  `@aws-sdk/client-bedrock-runtime`. The unused peers
  `seneca-entity`, `@seneca/entity-util`, `seneca-promisify`,
  `@opensearch-project/opensearch` and
  `@aws-sdk/credential-provider-node` are removed, so npm no longer
  installs them with this plugin.
* Tests: new tests cover the resolved options, the `submit:query` rule,
  and the `InvokeModel` call through the AWS SDK against a local
  stand-in of the Bedrock runtime API. The live Bedrock tests skip
  without `AWS_PROFILE`; they were not run on Seneca 4.
