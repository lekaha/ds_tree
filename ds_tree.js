var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
function defaultComparator(left, right) {
    if (left > right) {
        return -1;
    }
    else if (left < right) {
        return 1;
    }
    return 0;
}
var BNode = (function () {
    function BNode(value) {
        this.value = value;
    }
    BNode.prototype.put = function (parent, value, c) {
        if (0 <= c(this.value, value)) {
            if (null == this.right) {
                this.right = new BNode(value);
                this.right.parent = parent;
                this.right.isParentsLeft = false;
                return this.right;
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
    };
    return BNode;
})();
var BSTree = (function () {
    function BSTree(attr, comparator) {
        this.pAttr = attr;
        if (null != comparator) {
            this.pCmptor = comparator;
        }
        else {
            this.pCmptor = defaultComparator;
        }
    }
    BSTree.prototype.root = function () {
        return this.pRoot;
    };
    BSTree.prototype.insert = function (value) {
        if (null == this.pRoot) {
            this.pRoot = new BNode(value);
            this.pRoot.parent = null;
            return this.pRoot;
        }
        return this.pRoot.put(this.pRoot, value, this.pCmptor);
    };
    BSTree.prototype.find = function (value) {
        if (0 == this.pCmptor(this.pRoot.value, value)) {
            return this.pRoot;
        }
        else {
            var s = this.pRoot;
            while (null != s) {
                var r = this.pCmptor(s.value, value);
                if (0 == r) {
                    return s;
                }
                else if (1 <= r) {
                    s = s.right;
                }
                else {
                    s = s.left;
                }
            }
        }
        return null;
    };
    BSTree.prototype.remove = function (value) {
        var node = this.find(value);
        if (null != node) {
            var l = node.left;
            var r = node.right;
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
            else if (null != l && null != r) {
                //find the right sub-tree's minimum node.
                var n = r;
                while (null != n) {
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
    };
    BSTree.prototype.iterator = function () {
        return new BinaryTreeIterator(this);
    };
    return BSTree;
})();
var AVLTree = (function (_super) {
    __extends(AVLTree, _super);
    function AVLTree() {
        _super.apply(this, arguments);
    }
    AVLTree.prototype.insert = function (value) {
        var insertedNode = _super.prototype.insert.call(this, value);
        var node = insertedNode;
        while (null != node.parent) {
            var f = this.balanceFactor(node.parent);
            if (f > 1) {
                var s = this.balanceFactor(node.parent.left);
                var N = node.parent;
                if (-1 == s) {
                    this.leftRotate(N.left);
                }
                this.rightRotate(N);
            }
            if (f < -1) {
                var s = this.balanceFactor(node.parent.right);
                var N = node.parent;
                if (1 == s) {
                    this.rightRotate(N.right);
                }
                this.leftRotate(N);
            }
            node = node.parent;
            if (null == node) {
                break;
            }
        }
        return insertedNode;
    };
    AVLTree.prototype.remove = function (value) {
        var removedNode = _super.prototype.remove.call(this, value);
        var node = removedNode;
        while (null != node.parent) {
            var f = this.balanceFactor(node.parent);
            if (f > 1) {
                var s = this.balanceFactor(node.parent.left);
                var N = node.parent;
                if (-1 == s) {
                    this.leftRotate(N.left);
                }
                this.rightRotate(N);
            }
            if (f < -1) {
                var s = this.balanceFactor(node.parent.right);
                var N = node.parent;
                if (1 == s) {
                    this.rightRotate(N.right);
                }
                this.leftRotate(N);
            }
            node = node.parent;
            if (null == node) {
                break;
            }
        }
        return removedNode;
    };
    AVLTree.prototype.show = function () {
        var h = this.traverse(this.pRoot, 0);
        console.log('show', 'degree', h);
        var stack = new Array();
        stack.push(this.pRoot);
        while (stack.length != 0) {
            var str = "";
            var l = stack.length;
            for (var i = 0; i < l; i++) {
                var n = stack.shift();
                if (n.left)
                    stack.push(n.left);
                if (n.right)
                    stack.push(n.right);
                str += (n.value + " ");
            }
            console.log(str);
        }
    };
    AVLTree.prototype.rightRotate = function (node) {
        var left = node.left;
        var right = left.right;
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
    };
    AVLTree.prototype.leftRotate = function (node) {
        var right = node.right;
        var left = right.left;
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
    };
    AVLTree.prototype.balanceFactor = function (node) {
        return this.height(node.left) - this.height(node.right);
    };
    AVLTree.prototype.height = function (node) {
        return this.traverse(node, -1);
    };
    AVLTree.prototype.traverse = function (node, level) {
        if (null != node) {
            level += 1;
            var l = this.traverse(node.left, level);
            var r = this.traverse(node.right, level);
            return Math.max(l, r);
        }
        return level;
    };
    return AVLTree;
})(BSTree);
/*
This iterator uses BFS to tree.
 */
var BinaryTreeIterator = (function () {
    function BinaryTreeIterator(tree) {
        this.mTree = tree;
        this.mQ = [];
        this.init();
    }
    BinaryTreeIterator.prototype.hasNext = function () {
        return this.mQ.length != 0;
    };
    BinaryTreeIterator.prototype.next = function () {
        return this.mQ.shift();
    };
    BinaryTreeIterator.prototype.init = function () {
        var node = this.mTree.root();
        if (null != node) {
            var stack = new Array();
            stack.push(node);
            while (stack.length != 0) {
                var l = stack.length;
                for (var i = 0; i < l; i++) {
                    var n = stack.shift();
                    this.mQ.push(n);
                    if (n.left)
                        stack.push(n.left);
                    if (n.right)
                        stack.push(n.right);
                }
            }
        }
    };
    return BinaryTreeIterator;
})();
//# sourceMappingURL=ds_tree.js.map