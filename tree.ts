interface TreeAttr {
    key: string;
    value: any;
}

interface TNode {
    value: any;
}

interface Tree {
    insert(value: any): TNode;
    find(value: any): TNode;
    remove(value: any): TNode;
}

interface Comparator {
    <L, R>(left: L, right: R): number;
}

function defaultComparator(left: number, right: number) {
    if (left > right) {
        return -1;
    }
    else if (left < right) {
        return 1;
    }
    return 0;
}

class BNode implements TNode {
    left: BNode;
    right: BNode;
    parent: BNode;
    isParentsLeft: boolean;

    constructor(public value: any) {

    }

    put(parent: BNode, value: any, c: Comparator): BNode {
        if (0 <= c(this.value, value)) {
            if (null == this.right) {
                this.right = new BNode(value);
                this.right.parent = parent;
                this.right.isParentsLeft = false;
                return this.right
            }
            else {
                return this.right.put(this.right, value, c);
            }
        }
        else {
            if (null == this.left) {
                this.left = new BNode(value);
                this.left.parent = parent;
                this.left.isParentsLeft = true;
                return this.left;
            }
            else {
                return this.left.put(this.left, value, c);
            }
        }
    }
}

class BSTree<T> implements Tree {
    protected pAttr: TreeAttr[];
    protected pCmptor: Comparator;
    protected pRoot: BNode;


    constructor(attr: TreeAttr[], comparator?: Comparator) {
        this.pAttr = attr;
        if (null != comparator) {
            this.pCmptor = comparator;
        }
        else {
            this.pCmptor = defaultComparator;
        }
    }

    insert(value: T): BNode {
        if (null == this.pRoot) {
            this.pRoot = new BNode(value);
            this.pRoot.parent = null;
            return this.pRoot;
        }

        return this.pRoot.put(this.pRoot, value, this.pCmptor);

    }

    find(value: T): BNode {
        if (0 == this.pCmptor(this.pRoot.value, value)) {
            return this.pRoot;
        }
        else {
            var s: BNode = this.pRoot;
            while(null != s) {
                var r: number = this.pCmptor(s.value, value);
                if (0 == r) {
                    return s;
                }
                else if(1 <= r) {
                    s = s.right;
                }
                else {
                    s = s.left;
                }
            }
        }

        return null;
    }

    remove(value: T): BNode {
        var node: BNode = this.find(value);
        if (null != node) {
            var l: BNode = node.left;
            var r: BNode = node.right;
            // No child
            if (null == l && null == r) {
                if (null != node.parent) {
                    if (!node.isParentsLeft) {
                        node.parent.right = null;
                    }
                    else {
                        node.parent.left = null;
                    }
                }
                else {
                    this.pRoot = null;
                }
            }
            // Two children
            else if (null != l && null != r) {
                //find the right sub-tree's minimum node.
                var n: BNode = r;
                while(null != n) {
                    if (null != n.left) {
                        n = n.left;
                    }
                    else {
                        break;
                    }
                }
                if (null != node.parent) {
                    if (!node.isParentsLeft) {
                        node.parent.right = n;
                        n.parent.left = null;
                        node.parent.right.parent = node.parent;
                        node.parent.right.left = node.left;
                        node.parent.right.right = node.right;
                    }
                    else {
                        node.parent.left = n;
                        n.parent.left = null;
                        node.parent.left.parent = node.parent;
                        node.parent.left.left = node.left;
                        node.parent.left.right = node.right;
                    }
                }
                else {
                    n.parent.left = null;
                    n.left = this.pRoot.left;
                    n.right = this.pRoot.right;
                    this.pRoot.left.parent = n;
                    this.pRoot.right.parent = n;
                    this.pRoot = n;
                    this.pRoot.parent = null;
                }
            }
            // One child
            else {
                if (null != node.parent) {
                    if (!node.isParentsLeft) {
                        node.parent.right = null;
                        node.parent.right = node.left || node.right;
                        node.parent.right.parent = node.parent;
                    }
                    else {
                        node.parent.left = null;
                        node.parent.left = node.left || node.right;
                        node.parent.left.parent = node.parent;
                    }
                }
                else {
                    this.pRoot = node.left || node.right;
                    this.pRoot.parent = null;
                }
            }
            return node;
        }

        return node;
    }
}

class AVLTree<T> extends BSTree<T> {

    insert(value: T): BNode {
        var node: BNode = super.insert(value);
        while(null != node.parent) {
            var f: number = this.balanceFactor(node.parent);
            if (f > 1) {
                var s: number = this.balanceFactor(node.parent.left);
                var N: BNode = node.parent;
                if (-1 == s) {
                    this.leftRotate(N.left);
                }
                this.rightRotate(N);
            }

            if (f < -1) {
                var s: number = this.balanceFactor(node.parent.right);
                var N: BNode = node.parent;
                if (1 == s) {
                    this.rightRotate(N.right);
                }
                this.leftRotate(N);
            }
            node = node.parent;
        }

        return node;
    }

    remove(value: T): BNode {
        var node: BNode = super.remove(value);
        while(null != node.parent) {
            var f: number = this.balanceFactor(node.parent);
            if (f > 1) {
                var s: number = this.balanceFactor(node.parent.left);
                var N: BNode = node.parent;
                if (-1 == s) {
                    this.leftRotate(N.left);
                }
                this.rightRotate(N);
            }

            if (f < -1) {
                var s: number = this.balanceFactor(node.parent.right);
                var N: BNode = node.parent;
                if (1 == s) {
                    this.rightRotate(N.right);
                }
                this.leftRotate(N);
            }
            node = node.parent;
        }
        return node
    }

    show() {
        var h: number = this.traverse(this.pRoot, 0);
        console.log('show', 'degree', h);
        var stack = new Array();
        stack.push(this.pRoot);
        while(stack.length != 0) {
            var str: string = "";
            var l = stack.length;
            for(var i = 0; i<l; i++) {
                var n = stack.shift();
                if (n.left) stack.push(n.left);
                if (n.right) stack.push(n.right);
                str += (n.value + " ");
            }
            console.log(str);
        }

    }

    private rightRotate(node: BNode) {
        var left: BNode = node.left;
        var right: BNode = left.right;
        if (null != node.parent) {
            if (node.parent.right == node) {
                node.parent.right = left;
            }
            else {
                node.parent.left = left;
            }
            left.parent = node.parent;
        }
        else {
            this.pRoot = left;
            left.parent = null;
        }

        left.right = node;

        node.parent = left;
        node.left = right;
    }

    private leftRotate(node: BNode) {
        var right: BNode = node.right;
        var left: BNode = right.left;
        if (null != node.parent) {
            if (node.parent.left == node) {
                node.parent.left = right;
            }
            else {
                node.parent.right = right;
            }
            right.parent = node.parent;
        }
        else {
            this.pRoot = right;
            right.parent = null;
        }
        right.left = node;

        node.parent = right;
        node.right = left;
    }

    private balanceFactor(node: BNode): number {
        return this.height(node.left) - this.height(node.right);
    }

    private height(node: BNode): number {
        return this.traverse(node, -1);
    }

    private traverse(node: BNode, level: number): number {
        if (null != node) {
            level += 1;
            var l: number = this.traverse(node.left, level);
            var r: number = this.traverse(node.right, level);

            return Math.max(l, r);
        }

        return level;
    }
}