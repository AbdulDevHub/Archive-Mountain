package lab07;

/*
 * Visitor interface
 */
public interface Visitor {

        /*
         * Visit an expression that is a NUMBER.
         * Accumulate the value of the number in this.value.
         *
         * @param v Evaluate the value of a number (results to be stored in value attribute)
         */
        public void VisitNumber(Number n) throws ValueError;

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
        public void VisitBinOp(BinOp a) throws ValueError;
}