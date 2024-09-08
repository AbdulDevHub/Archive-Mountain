package lab07;

/*
 * Class Evaluator.  An Evaluator will be used to evaluate an AST.
 * It implements the Visitor interface
 */
public class Evaluator implements Visitor {

    private double value;

    /*
     * Evaluation of an AST.  Note that each node in the tree will
     * accept a visitor.  This will impact the resulting value
     * of the Evaluator! Accept will call either VisitNumber or
     * VisitBinOp depending on the type of node encountered.
     *
     * @param root a reference to the AST to be evaluated
     */
    public double evaluate(ASTNode root) {
        root.Accept(this);
        return this.value;
    }

    /*
     * Visit an expression that is a NUMBER.
     * Accumulate the value of the number in this.value.
     *
     * @param v Evaluate the value of a number (results to be stored in value attribute)
     */
    @Override
    public void VisitNumber(Number n) throws ValueError {
        this.value = n.getValue();
    }

    /**
     * Visit an expression that is a BinOp.
     * This will ONLY be used to evaluate BinOps that represent additions or multiplications.
     * The only expected operation symbols will be "*" or "+".
     * Note that this will be a recursive function!
     * If both the right and left-hand sides of the BinOp are leaves,
     * you can evaluate the BinOp and accumulate the value in this.value.
     * If any side is NOT a leaf, you will have to ask the ASTNode
     * to recursively "Accept" a visitor until a leaf is encountered.
     * If you encounter any invalid operations (i.e. those other than + or *), throw a ValueError.
     *
     * @param a Binary Operation to be evaluated (results to be stored in value attribute)
     */
    @Override
    public void VisitBinOp(BinOp a) throws ValueError {
        double right, left;

        if (a.getRight().isLeaf()){right = ((Number)a.getRight()).getValue();}
        else {right = new Evaluator().evaluate((BinOp)a.getRight());}

        if (a.getLeft().isLeaf()){left = ((Number)a.getLeft()).getValue();}
        else {left = new Evaluator().evaluate((BinOp)a.getLeft());}

        if (a.getOp().equals("+")){this.value = left + right;}
        else if (a.getOp().equals("*")){this.value = left * right;}
        else {throw new ValueError("Invalid: " + a.getOp());}
    }
}



