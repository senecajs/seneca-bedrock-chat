![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) plugin

# @seneca/bedrock-chat

[![npm version](https://img.shields.io/npm/v/@seneca/bedrock-chat.svg)](https://npmjs.com/package/@seneca/bedrock-chat)
[![build](https://github.com/senecajs/seneca-bedrock-chat/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-bedrock-chat/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-bedrock-chat/badge.svg?branch=main)](https://coveralls.io/github/senecajs/seneca-bedrock-chat?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-bedrock-chat/badge.svg)](https://snyk.io/test/github/senecajs/seneca-bedrock-chat)
[![Maintainability](https://api.codeclimate.com/v1/badges/06a44ac68c7be4a46c67/maintainability)](https://codeclimate.com/github/senecajs/seneca-bedrock-chat/maintainability)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

Expose AWS Bedrock LLM Chat API via standard `sys:chat` message patterns.
This plugin is part of a family of plugins that wrap LLM Chat APIs.
Production Example: [Voxgig Podmind](https://github.com/voxgig/podmind)

## Install

```sh
$ npm install @seneca/bedrock-chat
```

## Quick Example

```js
seneca.use('bedrock-chat')

let chatRes = await seneca.post('sys:chat,submit:query', {
  query: 'what is devrel?',
})
// ==== { ok: true, answer: 'DevRel stands for Developer Relations...' }
```

## More Examples

Review the [unit tests](test/BedrockChat.test.ts) for more examples.

## Motivation

A [Seneca.js](http://senecajs.org) plugin.

## Support

If you're using this module and need help, you can:

- Post a [github issue](https://github.com/senecajs/seneca-bedrock-chat/issues)
- Tweet to [@senecajs](http://twitter.com/senecajs)
- Ask on the [Gitter](https://gitter.im/senecajs/seneca)

## API

### Options

* `debug` : boolean
* `global` : boolean
* `bedrock` : object
* `config` : object
* `init$` : boolean

### Action Patterns

* [sys:chat](#-syschat-)
* [sys:chat,chat:bedrock,invoke:model](#-syschatchatbedrockinvokemodel-)
* [sys:chat,chat:bedrock,submit:query](#-syschatchatbedrocksubmitquery-)

### Action Descriptions

### &laquo; `sys:chat` &raquo;

No description provided.



----------
### &laquo; `sys:chat,chat:bedrock,invoke:model` &raquo;

Invoke LLM with a prompt.


#### Parameters


* __prompt__ : _string_
* __config__ : _object_


----------
### &laquo; `sys:chat,chat:bedrock,submit:query` &raquo;

Submit a chat query, optionally specifying chat provider.


#### Parameters


* __query__ : _string_


----------

## Contributing

The [Senecajs org](https://github.com/senecajs/) encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

### Running tests

```sh
npm run test
```

## Background

Part of the [Senecajs org](https://github.com/senecajs/).
