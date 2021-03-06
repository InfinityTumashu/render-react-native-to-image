
import componentTreeToNodeTree from "./component-tree-to-nodes"
import renderedComponentTree from "./reapply-layouts-to-components"
import * as yoga from "yoga-layout"

export type FontCache = {
  fonts: {[key: string]: any},
  fallbacks: {[key: string]: string}
};

export interface Component {
    type: string
    props: any
    children: Component[] | string[] | null
}

export interface RenderedComponent {
    type: string
    props: any
    textContent?: string
    children: RenderedComponent[]
    layout: {
        left: number
        right: number
        top: number
        bottom: number
        width: number
        height: number
    }
}

export interface Settings {
    backgroundColor?: string
    basePath: string
    renderPath: string
    fontCache: FontCache
    assetMap: {[key: string]: string}
    width: number
    height: number
}

export default (root: Component, settings: Settings) => {
  const rootNode = componentTreeToNodeTree(root, settings)
  if (!rootNode) {
    throw new Error("Unable to convert to node")
  }

  // This will mutate the node tree, we cannot trust that the nodes  in the original tree will
  // still exist.
  rootNode.calculateLayout(settings.width, settings.height, yoga.DIRECTION_LTR)

  // Generate a tree of components with the layout baked into it, them clean up yog memory
  const renderedComponentRoot = renderedComponentTree(root, rootNode)
  rootNode.freeRecursive()

  return renderedComponentRoot
};
