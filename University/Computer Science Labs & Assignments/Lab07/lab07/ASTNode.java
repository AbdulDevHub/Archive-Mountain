package lab07;

/**
 * Class ASTNode.  All elements in an AST tree are ASTNodes!
 */
abstract class ASTNode {

    /**
     * All ASTNodes must accept visitors, for evaluation
     *
     * @param v Visitor (used to evaluate AST)
     */
    abstract void Accept(Visitor v); //all AST nodes accept visitors when evaluating

    /**
     * All ASTNodes may be leaves of an AST tree, or they may be joined to other AST nodes
     *
     * @return  true if AST node is a leaf
     */
    abstract boolean isLeaf();
}
