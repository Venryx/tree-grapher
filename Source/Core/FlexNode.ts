import {hierarchy} from "d3-hierarchy";

export class FlexNode extends hierarchy.prototype.constructor {
	constructor(data, nodeSize: (self: FlexNode)=>any, spacing: (self: FlexNode, oNode: FlexNode)=>any) {
		super(data);
		this.func_nodeSize = nodeSize;
		this.func_spacing = spacing;
	}
	func_nodeSize: (self: FlexNode)=>any;
	func_spacing: (self: FlexNode, oNode: FlexNode)=>any;

	copy() {
		const c = this.wrap(this.constructor, this, node=>node.children);
		c.each(node => node.data = node.data.data);
		return c;
	}
	get size() { return this.func_nodeSize(this); }
	spacing(oNode) { return this.func_spacing(this, oNode); }
	get nodes() { return this.descendants(); }
	get xSize() { return this.size[0]; }
	get ySize() { return this.size[1]; }
	get top() { return this.y; }
	get bottom() { return this.y + this.ySize; }
	get left() { return this.x - this.xSize / 2; }
	get right() { return this.x + this.xSize / 2; }
	get root() {
		const ancs = this.ancestors();
		return ancs[ancs.length - 1];
	}
	get numChildren() {
		return this.hasChildren ? this.children.length : 0;
	}
	get hasChildren() { return !this.noChildren; }
	get noChildren() { return this.children === null; }
	get firstChild() {
		return this.hasChildren ? this.children[0] : null;
	}
	get lastChild() {
		return this.hasChildren ? this.children[this.numChildren - 1] : null;
	}
	get extents() {
		return (this.children || []).reduce(
			(acc, kid) => FlexNode.maxExtents(acc, kid.extents),
			this.nodeExtents);
	}
	get nodeExtents() {
		return {
			top: this.top,
			bottom: this.bottom,
			left: this.left,
			right: this.right,
		};
	}
	static maxExtents(e0, e1) {
		return {
			top: Math.min(e0.top, e1.top),
			bottom: Math.max(e0.bottom, e1.bottom),
			left: Math.min(e0.left, e1.left),
			right: Math.max(e0.right, e1.right),
		};
	}
};

export class FlexNode_Wrapper extends FlexNode {
	constructor(data, nodeSize: (self: FlexNode)=>any, spacing: (self: FlexNode, oNode: FlexNode)=>any) {
		super(data, nodeSize, spacing);
		Object.assign(this, {
			x: 0, y: 0,
			relX: 0, prelim: 0, shift: 0, change: 0,
			lExt: this, lExtRelX: 0, lThr: null,
			rExt: this, rExtRelX: 0, rThr: null,
		});
	}
	get size() { return this.func_nodeSize(this.data); }
	spacing(oNode: FlexNode) { return this.func_spacing(this.data, oNode.data); }
	get x() { return this.data.x; }
	set x(v) { this.data.x = v; }
	get y() { return this.data.y; }
	set y(v) { this.data.y = v; }
	update() {
		layoutChildren(this);
		resolveX(this);
		return this;
	}
}

const layoutChildren = (w, y = 0) => {
	w.y = y;
	(w.children || []).reduce((acc, kid) => {
		const [i, lastLows] = acc;
		layoutChildren(kid, w.y + w.ySize);
		// The lowest vertical coordinate while extreme nodes still point
		// in current subtree.
		const lowY = (i === 0 ? kid.lExt : kid.rExt).bottom;
		if (i !== 0) separate(w, i, lastLows);
		const lows = updateLows(lowY, i, lastLows);
		return [i + 1, lows];
	}, [0, null]);
	shiftChange(w);
	positionRoot(w);
	return w;
};

// Resolves the relative coordinate properties - relX and prelim --
// to set the final, absolute x coordinate for each node. This also sets
// `prelim` to 0, so that `relX` for each node is its x-coordinate relative
// to its parent.
const resolveX = (w, prevSum?, parentX?) => {
	// A call to resolveX without arguments is assumed to be for the root of
	// the tree. This will set the root's x-coord to zero.
	if (typeof prevSum === 'undefined') {
		prevSum = -w.relX - w.prelim;
		parentX = 0;
	}
	const sum = prevSum + w.relX;
	w.relX = sum + w.prelim - parentX;
	w.prelim = 0;
	w.x = parentX + w.relX;
	(w.children || []).forEach(k => resolveX(k, sum, w.x));
	return w;
};

// Process shift and change for all children, to add intermediate spacing to
// each child's modifier.
const shiftChange = w => {
	(w.children || []).reduce((acc, child) => {
		const [lastShiftSum, lastChangeSum] = acc;
		const shiftSum = lastShiftSum + child.shift;
		const changeSum = lastChangeSum + shiftSum + child.change;
		child.relX += changeSum;
		return [shiftSum, changeSum];
	}, [0, 0]);
};

// Separates the latest child from its previous sibling
/* eslint-disable complexity */
const separate = (w, i, lows) => {
	const lSib = w.children[i - 1];
	const curSubtree = w.children[i];
	let rContour = lSib;
	let rSumMods = lSib.relX;
	let lContour = curSubtree;
	let lSumMods = curSubtree.relX;
	let isFirst = true;
	while (rContour && lContour) {
		if (rContour.bottom > lows.lowY) lows = lows.next;
		// How far to the left of the right side of rContour is the left side
		// of lContour? First compute the center-to-center distance, then add
		// the "spacing"
		const dist =
			(rSumMods + rContour.prelim) - (lSumMods + lContour.prelim) +
			rContour.xSize / 2 + lContour.xSize / 2 +
			rContour.spacing(lContour);
		if (dist > 0 || (dist < 0 && isFirst)) {
			lSumMods += dist;
			// Move subtree by changing relX.
			moveSubtree(curSubtree, dist);
			distributeExtra(w, i, lows.index, dist);
		}
		isFirst = false;
		// Advance highest node(s) and sum(s) of modifiers
		const rightBottom = rContour.bottom;
		const leftBottom = lContour.bottom;
		if (rightBottom <= leftBottom) {
			rContour = nextRContour(rContour);
			if (rContour) rSumMods += rContour.relX;
		}
		if (rightBottom >= leftBottom) {
			lContour = nextLContour(lContour);
			if (lContour) lSumMods += lContour.relX;
		}
	}
	// Set threads and update extreme nodes. In the first case, the
	// current subtree is taller than the left siblings.
	if (!rContour && lContour) setLThr(w, i, lContour, lSumMods);
	// In the next case, the left siblings are taller than the current subtree
	else if (rContour && !lContour) setRThr(w, i, rContour, rSumMods);
};
/* eslint-enable complexity */

// Move subtree by changing relX.
const moveSubtree = (subtree, distance) => {
	subtree.relX += distance;
	subtree.lExtRelX += distance;
	subtree.rExtRelX += distance;
};

const distributeExtra = (w, curSubtreeI, leftSibI, dist) => {
	const curSubtree = w.children[curSubtreeI];
	const n = curSubtreeI - leftSibI;
	// Are there intermediate children?
	if (n > 1) {
		const delta = dist / n;
		w.children[leftSibI + 1].shift += delta;
		curSubtree.shift -= delta;
		curSubtree.change -= dist - delta;
	}
};

const nextLContour = w => {
	return w.hasChildren ? w.firstChild : w.lThr;
};

const nextRContour = w => {
	return w.hasChildren ? w.lastChild : w.rThr;
};

const setLThr = (w, i, lContour, lSumMods) => {
	const firstChild = w.firstChild;
	const lExt = firstChild.lExt;
	const curSubtree = w.children[i];
	lExt.lThr = lContour;
	// Change relX so that the sum of modifier after following thread is correct.
	const diff = lSumMods - lContour.relX - firstChild.lExtRelX;
	lExt.relX += diff;
	// Change preliminary x coordinate so that the node does not move.
	lExt.prelim -= diff;
	// Update extreme node and its sum of modifiers.
	firstChild.lExt = curSubtree.lExt;
	firstChild.lExtRelX = curSubtree.lExtRelX;
};

// Mirror image of setLThr.
const setRThr = (w, i, rContour, rSumMods) => {
	const curSubtree = w.children[i];
	const rExt = curSubtree.rExt;
	const lSib = w.children[i - 1];
	rExt.rThr = rContour;
	const diff = rSumMods - rContour.relX - curSubtree.rExtRelX;
	rExt.relX += diff;
	rExt.prelim -= diff;
	curSubtree.rExt = lSib.rExt;
	curSubtree.rExtRelX = lSib.rExtRelX;
};

// Position root between children, taking into account their modifiers
const positionRoot = w => {
	if (w.hasChildren) {
		const k0 = w.firstChild;
		const kf = w.lastChild;
		const prelim = (k0.prelim + k0.relX - k0.xSize / 2 +
			kf.relX + kf.prelim + kf.xSize / 2 ) / 2;
		Object.assign(w, {
			prelim,
			lExt: k0.lExt, lExtRelX: k0.lExtRelX,
			rExt: kf.rExt, rExtRelX: kf.rExtRelX,
		});
	}
};

// Make/maintain a linked list of the indexes of left siblings and their
// lowest vertical coordinate.
const updateLows = (lowY, index, lastLows) => {
	// Remove siblings that are hidden by the new subtree.
	while (lastLows !== null && lowY >= lastLows.lowY)
		lastLows = lastLows.next;
	// Prepend the new subtree.
	return {
		lowY,
		index,
		next: lastLows,
	};
};