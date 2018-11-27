import * as sdk from 'botpress/sdk'
import _ from 'lodash'

import { DocumentClassifier } from './classifier'
import { Indexer } from './indexer'

const indexers: { [botId: string]: Indexer } = {}
const classifiers: { [botId: string]: DocumentClassifier } = {}

const onServerStarted = async (bp: typeof sdk) => {
  Indexer.ghostProvider = bp.ghost.forBot
  DocumentClassifier.ghostProvider = bp.ghost.forBot

  bp.events.registerMiddleware({
    name: 'knowledge.incoming',
    direction: 'incoming',
    handler: async (event, next) => {
      if (event.type !== 'text') {
        next()
      }

      // TODO Append suggested replies here

      next()
    },
    order: 15,
    description: 'Finds content from Knowledge base files',
    enabled: true
  })
}

const onServerReady = async (bp: typeof sdk) => {}

const onBotMount = async (bp: typeof sdk, botId: string) => {
  classifiers[botId] = new DocumentClassifier(botId)
  indexers[botId] = new Indexer(botId, classifiers[botId])
  await classifiers[botId].loadMostRecent()
}

const onBotUnmount = async (bp: typeof sdk, botId: string) => {
  delete indexers[botId]
}

const entryPoint: sdk.ModuleEntryPoint = {
  onServerStarted,
  onServerReady,
  onBotMount,
  onBotUnmount,
  definition: {
    name: 'knowledge',
    menuIcon: 'question_answer',
    menuText: 'Knowledge',
    fullName: 'knowledge',
    homepage: 'https://botpress.io',
    noInterface: true,
    plugins: [],
    moduleView: { stretched: true }
  }
}

export default entryPoint