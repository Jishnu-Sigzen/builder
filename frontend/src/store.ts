import { defineStore } from "pinia";
import { WebPageBeta } from "./types/WebsiteBuilder/WebPageBeta";
import Block from "./utils/block";
import getBlockTemplate from "./utils/blockTemplate";
import Component from "./utils/component";
import { stripExtension } from "./utils/helpers";

const useStore = defineStore("store", {
	state: () => ({
		builderState: {
			selectedPage: <string | null>null,
			selectedBlocks: <Block[]>[],
			editableBlock: <Block | null>null,
			activeBreakpoint: "desktop",
			mode: <BuilderMode>"select",
			blocks: <Block[]>[new Block(getBlockTemplate("body"))],
			editingComponent: <Block | null>null,
			editingMode: <EditingMode>"page",
		},
		usedComponents: {},
		hoveredBlock: <string | null>null,
		hoveredBreakpoint: <string | null>null,
		builderLayout: {
			rightPanelWidth: 270,
			leftPanelWidth: 280,
		},
		flow: [
			{
				name: "Row",
				styleKey: "flexDirection",
				styleValue: "row",
				icon: "columns",
			},
			{
				name: "Column",
				styleKey: "flexDirection",
				styleValue: "column",
				icon: "credit-card",
			},
		],
		alignments: [
			{
				name: "Left",
				styleKey: "justifyContent",
				styleValue: "flex-start",
				icon: "align-left",
			},
			{
				name: "Center",
				styleKey: "justifyContent",
				styleValue: "center",
				icon: "align-center",
			},
			{
				name: "Right",
				styleKey: "justifyContent",
				styleValue: "flex-end",
				icon: "align-right",
			},
			{
				name: "Justify",
				styleKey: "justifyContent",
				styleValue: "space-between",
				icon: "align-justify",
			},
		],
		verticalAlignments: [
			{
				name: "Top",
				styleKey: "alignItems",
				styleValue: "flex-start",
				icon: "arrow-up",
			},
			{
				name: "Middle",
				styleKey: "alignItems",
				styleValue: "center",
				icon: "minus",
			},
			{
				name: "Bottom",
				styleKey: "alignItems",
				styleValue: "flex-end",
				icon: "arrow-down",
			},
		],
		pageName: "Home",
		route: "/",
		pastelCssColors: [
			"#FFFFFF",
			"#F5FFFA",
			"#F8F8FF",
			"#F0F8FF",
			"#F5F5DC",
			"#FFE4C4",
			"#FFEBCD",
			"#FFDEAD",
			"#FFC1C1",
			"#FFB6C1",
			"#FFA07A",
			"#FF8C00",
			"#FF7F50",
			"#FF69B4",
			"#FF6347",
			"#FDB813",
			"#FDAB9F",
			"#FDA50F",
			"#F49AC2",
			"#FFB347",
			"#FFD700",
			"#ADFF2F",
			"#87CEFA",
			"#00BFFF",
			"#ADD8E6",
			"#B0E0E6",
			"#5F9EA0",
			"#FDD5B1",
			"#FCCDE3",
			"#FCC2D9",
			"#FCB4D5",
			"#FBB5A3",
			"#FBB917",
			"#FBB972",
			"#FBB9AC",
			"#FBCEB1",
			"linear-gradient(120deg, #f093fb 0%, #f5576c 100%)",
			"linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)",
			"linear-gradient(to top, #a8edea 0%, #fed6e3 100%)",
			"linear-gradient(to top, #96fbc4 0%, #f9f586 100%)",
			"linear-gradient(to top, #9795f0 0%, #fbc8d4 100%)",
			"linear-gradient(-60deg, #16a085 0%, #f4d03f 100%)",
			"linear-gradient( 135deg, #81FFEF 10%, #F067B4 100%)",
			"black",
			"transparent",
		],
		guides: {
			showX: false,
			showY: false,
			x: 0,
			y: 0,
		},
		textColors: [
			"#000000",
			"#424242",
			"#636363",
			"#808080",
			"#9C9C94",
			"#C0C0C0",
			"#CEC6CE",
			"#EFEFEF",
			"#F7F7F7",
			"#FFFFFF",
		],
		deviceBreakpoints: [
			{
				icon: "monitor",
				device: "desktop",
				width: 1400,
				visible: true,
			},
			{
				icon: "tablet",
				device: "tablet",
				width: 800,
				visible: false,
			},
			{
				icon: "smartphone",
				device: "mobile",
				width: 640,
				visible: false,
			},
		],
		sidebarActiveTab: <LeftSidebarTabOption>"Components",
		showPanels: <boolean>true,
		blockEditorCanvas: {
			scale: 0.5,
			translateX: 0,
			translateY: 0,
			startX: 0,
			startY: 0,
			background: "",
			scaling: false,
			panning: false,
			settingCanvas: true,
		},
		componentEditorCanvas: {
			scale: 0.5,
			translateX: 0,
			translateY: 0,
			startX: 0,
			startY: 0,
			background: "",
			scaling: false,
			panning: false,
			settingCanvas: false,
		},
		copiedStyle: <StyleCopy | null>null,
		components: <BlockComponent[]>[],
		overlayElement: <any>null,
		pageData: {
			users: [
				{ name: "Suraj", image: "https://avatars.githubusercontent.com/u/1961952?v=4" },
				{ name: "Raj", image: "https://avatars.githubusercontent.com/u/1961952?v=4" },
				{ name: "Rahul", image: "https://avatars.githubusercontent.com/u/1961952?v=4" },
				{ name: "Rohit", image: "https://avatars.githubusercontent.com/u/1961952?v=4" },
			],
		},
	}),
	actions: {
		clearBlocks() {
			this.builderState.blocks = [];
			this.builderState.blocks.push(this.getRootBlock());
		},
		pushBlocks(blocks: BlockOptions[]) {
			let firstBlock = new Block(blocks[0]);
			if (firstBlock.isRoot()) {
				this.builderState.blocks = [firstBlock];
			} else {
				for (let block of blocks) {
					this.builderState.blocks[0].children.push(this.getBlockInstance(block));
				}
			}
		},
		getBlockCopy(block: BlockOptions | Block, retainId = false): Block {
			let b = JSON.parse(JSON.stringify(block));
			if (!retainId) {
				const deleteBlockId = (block: BlockOptions) => {
					delete block.blockId;
					for (let child of block.children || []) {
						deleteBlockId(child);
					}
				};
				deleteBlockId(b);
			}
			return new Block(b);
		},
		getRootBlock() {
			return new Block(getBlockTemplate("body"));
		},
		getPageData() {
			return this.builderState.blocks;
		},
		setPage(page: WebPageBeta) {
			if (!page) {
				return;
			}
			// clear blocks
			this.clearBlocks();
			this.pushBlocks(page.blocks);
			this.pageName = page.page_name as string;
			this.route = page.route || "/" + this.pageName.toLowerCase().replace(/ /g, "-");
			this.builderState.selectedPage = page.name;
			// localStorage.setItem("selectedPage", page.name);
		},
		getImageBlock(imageSrc: string, imageAlt: string = "") {
			imageAlt = stripExtension(imageAlt);
			const imageBlock = getBlockTemplate("image");
			if (!imageBlock.attributes) {
				imageBlock.attributes = {};
			}
			imageBlock.attributes.src = imageSrc;
			if (imageAlt) {
				imageBlock.attributes.alt = imageAlt;
			}

			return imageBlock;
		},
		findBlock(blockId: string, blocks?: Array<Block>): Block | null {
			if (!blocks) {
				blocks = this.builderState.blocks;
			}
			for (const block of blocks) {
				if (block.blockId === blockId) {
					return block;
				}
				if (block.children) {
					const found = this.findBlock(blockId, block.children);
					if (found) {
						return found;
					}
				}
			}
			return null;
		},
		findParentBlock(blockId: string, blocks?: Array<Block>): Block | null {
			if (!blocks) {
				blocks = this.builderState.blocks;
			}
			for (const block of blocks) {
				if (block.children) {
					for (const child of block.children) {
						if (child.blockId === blockId) {
							return block;
						}
					}
					const found = this.findParentBlock(blockId, block.children);
					if (found) {
						return found;
					}
				}
			}
			return null;
		},
		selectBlock(block: Block, e: MouseEvent | null, scrollIntoView = true) {
			if (e && e.shiftKey) {
				block.toggleSelectBlock();
			} else {
				block.selectBlock();
			}
			if (scrollIntoView) {
				// TODO: move to layers?
				document
					.querySelector(`[data-block-layer-id="${block.blockId}"]`)
					?.scrollIntoView({ behavior: "instant", block: "center" });
				this.builderState.editableBlock = null;
			}
		},
		getBlockInstance(options: BlockOptions) {
			if (options.isComponent) {
				return new Component(options as ComponentOptions);
			} else {
				return new Block(options);
			}
		},
		editComponent(block: Block) {
			this.builderState.editableBlock = block;
			this.builderState.editingMode = "component";
		},
		editPage() {
			this.builderState.editableBlock = null;
			this.builderState.editingMode = "page";
		},
	},
});

export default useStore;
