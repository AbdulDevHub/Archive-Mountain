package lab07;

/**
 * Class BinOp (Binary Operation).  A Binary Operation is an expression like
 * "1 + 1".  It has a left hand side, a right hand side and an operation
 * in the middle. The left and right hand sides will be ASTNodes as well.
 */
public class BinOp extends ASTNode {

    private ASTNode left;
    private String operation;
    private ASTNode right;

    /**
     * Constructor
     *
     * @param l Left hand AST
     * @param r right hand AST
     * @param operation operation to be applied
     */
    public BinOp(ASTNode l, String operation, ASTNode r) {
        this.left = l;
        this.operation = operation;
        this.right = r;
    }

    /**
     * Getter for left AST
     *
     * @return Left AST
     */
    public ASTNode getLeft() {
        return this.left;
    }

    /**
     * Getter for right AST
     *
     * @return Right AST
     */
    public ASTNode getRight() {
        return this.right;
    }

    /**
     * Getter for operation
     *
     * @return AST operation
     */
    public String getOp() {
        return this.operation;
    }

    /**
     * All ASTNodes must accept visitors!
     * This will evaluate the node (or throw a ValueError if the expression is illegal).
     *
     * @param v Visitor (used to evaluate AST)
     */
    @Override
    void Accept(Visitor v) {
        try {
            v.VisitBinOp(this);
        } catch (ValueError e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Evaluation will involve recursion.  Meaning, we need to know
     * when we hit the leaves of an AST, so we know to stop recursing!
     *
     * @return  true if AST node is a leaf
     */
    @Override
    boolean isLeaf() {
        return false;
    }
}
