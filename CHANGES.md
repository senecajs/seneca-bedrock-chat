# Changes

## 0.1.0 2026-10-22

* Seneca 4 support. Seneca 4.0.0 validates with
  [shape](https://github.com/rjrodger/shape), the renamed successor of
  Gubu, and rejects option defaults built with Gubu
  (`plugin_gubu_shape`) and Gubu nodes in message rules
  (`add_gubu_shape`), so 0.0.5 stops the process at startup there.
  `defaults` is now a function of `{ valid }`, the builders Seneca
  passes to it: shape on Seneca 4, Gubu on Seneca 3. The options are
  unchanged.
* The `submit:query` rule (`query` a required string, `chat`
  defaulting to `''`) is built with the validator of the Seneca
  instance (`seneca.valid`). An invalid message is still refused with
  `act_invalid_msg`; Seneca 4.0.0 words the error without the value.
* The gubu import is removed. gubu was never a declared dependency; it
  was available only through Seneca 3's own dependency on it.
* Breaking: Seneca 3 support starts at 3.38. The peer range is
  `>=3.38||>=4.0.0-rc5` (was `>=3||>=4.0.0-rc2`).
* Breaking: the entity plugin peer is `@seneca/entity >=29` (was
  `seneca-entity >=26`). Versions up to 28.1.0 were published as
  `seneca-entity`, and do not load on Seneca 4.0.0.
* The tests run against Seneca 4.0.0, 4.0.0-rc5 (the development
  dependency, `^4.0.0-rc5`) and 3.38 (with seneca-promisify). New
  tests cover the resolved options and the `submit:query` rule without
  calling AWS. The repository's `.npmrc` sets `legacy-peer-deps` until
  Seneca 4.0.0 is published.
