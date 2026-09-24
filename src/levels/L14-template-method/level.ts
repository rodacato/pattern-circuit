import { defineLevel, type NodeInput } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import baseManga from './base_manga.rb?raw'
import builder from './builder.rb?raw'
import common from './common.rb?raw'
import strategy from './strategy.rb?raw'
import template from './template.rb?raw'
import templateManga from './template_manga.rb?raw'

const code = withCommon(common)
const step = (id: string, label: string, codeRef: string, at: [number, number], tag: string): NodeInput =>
  node(id, label, codeRef.split('#')[0], at, { type: 'transform', addTags: [tag] }, { codeRef })
const skeleton = (id: string, label: string, codeRef: string, x: number, tag: string) => skinned('template-method', step(id, label, codeRef, [x, 2], tag))

export default defineLevel({
  id: 'L14-template-method',
  order: 14,
  chapter: 'hora-pico',
  title: 'Recetas copiadas',
  targetPattern: 'template-method',
  brief: {
    problem: 'Café y té siguen la misma receta: hervir agua, preparar, servir, tapar. Pero son dos copias del mismo código, y a la copia del té se le olvidó la tapa.',
    goal: 'Que los pasos comunes vivan en un solo lugar y cada bebida solo defina lo que la hace distinta.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('barra', 'Barra', 'Bar', [3, 2], { type: 'branch', cases: { cafe: 'cafe', te: 'te' } }, { codeRef: 'Bar#order' }),
      step('hervirC', 'Hervir agua', 'CoffeeRecipe#make', [6, 0], 'hervido'),
      step('extraer', 'Extraer', 'CoffeeRecipe#make', [9, 0], 'extraido'),
      step('servirC', 'Servir', 'CoffeeRecipe#make', [12, 0], 'servido'),
      step('tapaC', 'Tapar', 'CoffeeRecipe#make', [15, 0], 'tapa'),
      step('hervirT', 'Hervir agua', 'TeaRecipe#make', [6, 4], 'hervido'),
      step('infusionar', 'Infusionar', 'TeaRecipe#make', [9, 4], 'infusionado'),
      step('servirT', 'Servir', 'TeaRecipe#make', [12, 4], 'servido'),
      node('entregar', 'Entregar', 'Pickup', [19, 2], { type: 'sink', expects: { all: [{ hasTag: 'hervido' }, { hasTag: 'servido' }, { hasTag: 'tapa' }] } }, { codeRef: 'Pickup#hand_over' }),
    ],
    wires: [
      wire('cliente', 'barra'),
      wire('barra', 'hervirC', { port: 'cafe' }),
      wire('barra', 'hervirT', { port: 'te' }),
      ...chain('hervirC', 'extraer', 'servirC', 'tapaC', 'entregar'),
      ...chain('hervirT', 'infusionar', 'servirT', 'entregar'),
    ],
  },
  sockets: [
    {
      id: 'receta',
      at: 'barra',
      label: 'Receta',
      inventory: ['template-method', 'strategy', 'builder'],
      options: {
        'template-method': {
          outcome: 'solves',
          code: 'template',
          note: {
            title: 'Template Method: un esqueleto fijo con huecos',
            body: 'La receta común vive en la clase base: hervir, preparar, servir, tapar. Cada bebida solo rellena el paso que cambia. Nadie puede olvidar la tapa, y un paso nuevo se agrega una sola vez.',
          },
          patch: {
            remove: ['hervirC', 'servirC', 'tapaC', 'hervirT', 'servirT'],
            update: [
              { id: 'barra', behavior: { type: 'pass' }, codeRef: 'Recipe#make', skin: 'template-method' },
              { id: 'extraer', at: [10.5, 0], codeRef: 'CoffeeRecipe#brew', skin: 'template-method' },
              { id: 'infusionar', at: [10.5, 4], codeRef: 'TeaRecipe#brew', skin: 'template-method' },
            ],
            add: {
              nodes: [
                skeleton('hervir', 'Hervir agua', 'Recipe#boil_water', 5.5, 'hervido'),
                skinned('template-method', node('preparar', 'Preparar (hueco)', 'Recipe', [8, 2], { type: 'slot' }, { codeRef: 'Recipe#make' })),
                skeleton('servir', 'Servir', 'Recipe#pour_in_cup', 13, 'servido'),
                skeleton('tapa', 'Tapar', 'Recipe#put_lid', 15.5, 'tapa'),
              ],
              wires: [
                ...chain('barra', 'hervir', 'preparar'),
                abstract('preparar', 'extraer', 'cafe'),
                abstract('preparar', 'infusionar', 'te'),
                wire('extraer', 'servir'),
                wire('infusionar', 'servir'),
                ...chain('servir', 'tapa', 'entregar'),
              ],
            },
          },
        },
        strategy: {
          outcome: 'misfit',
          code: 'strategy',
          note: {
            title: 'Strategy cambia el algoritmo entero',
            body: 'Elegir la receta como estrategia deja dos algoritmos completos y duplicados. Template Method reparte distinto: lo común arriba, lo variable abajo. Aquí el té sigue sin tapa.',
          },
          patch: {
            removeWires: ['barra.cafe->hervirC', 'barra.te->hervirT'],
            update: [{ id: 'barra', behavior: { type: 'slot' }, skin: 'strategy', codeRef: 'RecipeStrategy' }],
            add: { wires: [abstract('barra', 'hervirC', 'cafe'), abstract('barra', 'hervirT', 'te')] },
          },
        },
        builder: {
          outcome: 'misfit',
          code: 'builder',
          note: {
            title: 'Builder arma objetos, no comparte pasos',
            body: 'Armar la taza paso a paso antes de la receta no toca las dos copias de la receta. La del té sigue sin tapa.',
          },
          patch: {
            removeWires: ['cliente->barra'],
            add: {
              nodes: [skinned('builder', node('taza', 'Armar taza', 'CupBuilder', [1.5, 0], { type: 'pass' }))],
              wires: [wire('cliente', 'taza'), wire('taza', 'barra')],
            },
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: [pulse(0, 'Café', ['cafe']), pulse(35, 'Té', ['te']), pulse(70, 'Café', ['cafe']), pulse(105, 'Té', ['te'])] }],
  changeTickets: [
    {
      id: 'manga',
      text: 'Todas las bebidas ahora llevan manga térmica.',
      scenario: 'main',
      without: {
        removeWires: ['tapaC->entregar', 'servirT->entregar'],
        add: {
          nodes: [step('mangaC', 'Manga', 'CoffeeRecipe#make', [17, 0], 'manga'), step('mangaT', 'Manga', 'TeaRecipe#make', [15, 4], 'manga')],
          wires: [...chain('tapaC', 'mangaC', 'entregar'), ...chain('servirT', 'mangaT', 'entregar')],
        },
      },
      with: {
        removeWires: ['tapa->entregar'],
        add: {
          nodes: [skinned('template-method', step('manga', 'Manga', 'Recipe#add_sleeve', [17.25, 0], 'manga'))],
          wires: chain('tapa', 'manga', 'entregar'),
        },
      },
      code: { without: 'base_manga', with: 'template_manga' },
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
      base_manga: code(baseManga),
      template: code(template),
      template_manga: code(templateManga),
      strategy: code(strategy),
      builder: code(builder),
    },
  },
})
