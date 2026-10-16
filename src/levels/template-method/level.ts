import { defineLevel, type NodeInput } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import baseSleeve from './base_sleeve.rb?raw'
import builder from './builder.rb?raw'
import common from './common.rb?raw'
import strategy from './strategy.rb?raw'
import template from './template.rb?raw'
import templateSleeve from './template_sleeve.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsBaseSleeve from './ts/base_sleeve.ts?raw'
import tsBuilder from './ts/builder.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'
import tsTemplate from './ts/template.ts?raw'
import tsTemplateSleeve from './ts/template_sleeve.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const step = (id: string, codeRef: string, at: [number, number], tag: string): NodeInput =>
  node(id, codeRef.split('#')[0], at, { type: 'transform', addTags: [tag] }, { codeRef })
const skeleton = (id: string, codeRef: string, x: number, tag: string) => skinned('template-method', step(id, codeRef, [x, 2], tag))

export default defineLevel({
  id: 'template-method',
  order: 14,
  chapter: 'rush-hour',
  targetPattern: 'template-method',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('bar', 'Bar', [3, 2], { type: 'branch', cases: { coffee: 'coffee', tea: 'tea' } }, { codeRef: 'Bar#order' }),
      step('boilC', 'CoffeeRecipe#make', [6, 0], 'boiled'),
      step('extract', 'CoffeeRecipe#make', [9, 0], 'extracted'),
      step('serveC', 'CoffeeRecipe#make', [12, 0], 'served'),
      step('lidC', 'CoffeeRecipe#make', [15, 0], 'lid'),
      step('boilT', 'TeaRecipe#make', [6, 4], 'boiled'),
      step('infuse', 'TeaRecipe#make', [9, 4], 'infused'),
      step('serveT', 'TeaRecipe#make', [12, 4], 'served'),
      node('handOver', 'Pickup', [19, 2], { type: 'sink', expects: { all: [{ hasTag: 'boiled' }, { hasTag: 'served' }, { hasTag: 'lid' }] } }, { codeRef: 'Pickup#hand_over' }),
    ],
    wires: [
      wire('customer', 'bar'),
      wire('bar', 'boilC', { port: 'coffee' }),
      wire('bar', 'boilT', { port: 'tea' }),
      ...chain('boilC', 'extract', 'serveC', 'lidC', 'handOver'),
      ...chain('boilT', 'infuse', 'serveT', 'handOver'),
    ],
  },
  sockets: [
    {
      id: 'recipe',
      at: 'bar',
      inventory: ['template-method', 'strategy', 'builder'],
      options: {
        'template-method': {
          outcome: 'solves',
          code: 'template',
          patch: {
            remove: ['boilC', 'serveC', 'lidC', 'boilT', 'serveT'],
            update: [
              { id: 'bar', behavior: { type: 'pass' }, codeRef: 'Recipe#make', skin: 'template-method' },
              { id: 'extract', at: [10.5, 0], codeRef: 'CoffeeRecipe#brew', skin: 'template-method' },
              { id: 'infuse', at: [10.5, 4], codeRef: 'TeaRecipe#brew', skin: 'template-method' },
            ],
            add: {
              nodes: [
                skeleton('boil', 'Recipe#boil_water', 5.5, 'boiled'),
                skinned('template-method', node('prepare', 'Recipe', [8, 2], { type: 'slot' }, { codeRef: 'Recipe#make' })),
                skeleton('serve', 'Recipe#pour_in_cup', 13, 'served'),
                skeleton('lid', 'Recipe#put_lid', 15.5, 'lid'),
              ],
              wires: [
                ...chain('bar', 'boil', 'prepare'),
                abstract('prepare', 'extract', 'coffee'),
                abstract('prepare', 'infuse', 'tea'),
                wire('extract', 'serve'),
                wire('infuse', 'serve'),
                ...chain('serve', 'lid', 'handOver'),
              ],
            },
          },
        },
        strategy: {
          outcome: 'partial',
          code: 'strategy',
          patch: {
            removeWires: ['bar.coffee->boilC', 'bar.tea->boilT'],
            update: [{ id: 'bar', behavior: { type: 'slot' }, skin: 'strategy', codeRef: 'RecipeStrategy' }],
            add: { wires: [abstract('bar', 'boilC', 'coffee'), abstract('bar', 'boilT', 'tea')] },
          },
        },
        builder: {
          outcome: 'misfit',
          code: 'builder',
          patch: {
            removeWires: ['customer->bar'],
            add: {
              nodes: [skinned('builder', node('cup', 'CupBuilder', [1.5, 0], { type: 'pass' }))],
              wires: [wire('customer', 'cup'), wire('cup', 'bar')],
            },
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: [pulse(0, ['coffee']), pulse(35, ['tea']), pulse(70, ['coffee']), pulse(105, ['tea'])] }],
  changeTickets: [
    {
      id: 'sleeve',
      scenario: 'main',
      without: {
        removeWires: ['lidC->handOver', 'serveT->handOver'],
        add: {
          nodes: [step('sleeveC', 'CoffeeRecipe#make', [17, 0], 'sleeve'), step('sleeveT', 'TeaRecipe#make', [15, 4], 'sleeve')],
          wires: [...chain('lidC', 'sleeveC', 'handOver'), ...chain('serveT', 'sleeveT', 'handOver')],
        },
      },
      with: {
        removeWires: ['lid->handOver'],
        add: {
          nodes: [skinned('template-method', step('sleeve', 'Recipe#add_sleeve', [17.25, 0], 'sleeve'))],
          wires: chain('lid', 'sleeve', 'handOver'),
        },
      },
      code: { without: 'base_sleeve', with: 'template_sleeve' },
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 4 },
    { metric: 'invalidAtSink', op: '==', value: 0 },
    { metric: 'nodesTouched', op: '<=', value: 1 },
  ],
  code: {
    rb: {
      base: code(base),
      base_sleeve: code(baseSleeve),
      template: code(template),
      template_sleeve: code(templateSleeve),
      strategy: code(strategy),
      builder: code(builder),
    },
    ts: {
      base: codeTs(tsBase),
      base_sleeve: codeTs(tsBaseSleeve),
      template: codeTs(tsTemplate),
      template_sleeve: codeTs(tsTemplateSleeve),
      strategy: codeTs(tsStrategy),
      builder: codeTs(tsBuilder),
    },
  },
})
