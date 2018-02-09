import {ViewStyle} from "react-native"
import * as yoga from "yoga-layout"
import { styleFromComponent, textLines } from "../layout/component-to-node"
import textToSvg from "./text-to-svg"
import { FontCache } from '../layout/'

import { RenderedComponent, Settings } from "../layout/index"
import wsp from "../whitespace"
import renderRect from './rect'

export const getOpacity = node => {
  const {opacity = 1} = styleFromComponent(node)
  return opacity
}

const renderers: {[key: string]: (fontState: FontCache, node: RenderedComponent) => string[]} = {
  RCTScrollView: (fontState, node) => renderers.View(fontState, node),
  Image: (fontState, node) => {
    const style = styleFromComponent(node)
    if (node.props.source && (node.props.source.testUri || node.props.source.uri)) {
      const uri = node.props.source.testUri || node.props.source.uri
      const opacity = getOpacity(node)
      return [svg("image", node.layout, {
        "xlink:href": uri,
        "preserveAspectRatio": node.props.resizeMode === "cover" ? "xMidYMid slice" : "",
        opacity: opacity === 1 ? undefined : opacity,
      })]
    } else {
      return renderers.View(fontState, node)
    }
  },
  Text: (fontState, node) => [textToSvg(fontState, node.layout, styleFromComponent(node), node[textLines])],
  View: (fontState, node) => {
      const opacity = getOpacity(node)
      const attributes: any = {
        type: node.type,
        // fill: "transparent",
        // stroke: "none",
        opacity: opacity === 1 ? undefined : opacity,
        // "stroke-width": "0.5",
        // "stroke": "#ff00ff",
        // "stroke-opacity": "0.3",
      }
      const style = styleFromComponent(node)

      return [renderRect(node.layout, style, attributes)]
  }
}

const svgForNode = (fontState: FontCache, node) => {
  if (!renderers[node.type]) {
    console.log("unexpected node type", node.type)
    return renderers.View(fontState, node)
  } else {
    return renderers[node.type](fontState, node)
  }
}

const nodeToSVG = (fontState: FontCache, indent: number, node: RenderedComponent, settings: Settings) => {
  const nodes: string[] = svgForNode(fontState, node)
  return nodes.map(text => "\n" + wsp(indent) + text).join("")
}

// This might be a reduce function?
const attributes = (settings) => {
  let attributeString = ""
  for (const key in settings) {
    if (settings.hasOwnProperty(key)) {
      const element = settings[key]
      if (element != null) {
        attributeString += ` ${key}="${element}"`
      }
    }
  }
  return attributeString
}

const svg = (type, {left, top, width, height}, settings) =>
  `<${type}${attributes(settings)} x="${left}" y="${top}" width="${width}" height="${height}"/>`

export default nodeToSVG
