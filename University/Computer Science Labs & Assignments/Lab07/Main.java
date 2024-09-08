import lab07.Evaluator;
import lab07.BinOp;
import lab07.Number;

/*
 * Class Main.  Some code to demonstrate evaluation of an AST
 */
public class Main {

    public static void main(String[] args) {

        Evaluator total = new Evaluator();

        Number n1 = new Number(7);
        Number n2 = new Number(9);
        Number n3 = new Number(1);

        BinOp a1 = new BinOp(n2, "+", n3);  //9 + 1
        BinOp a2 = new BinOp(n1, "*", a1); //7 * (9 + 1)

        double val = total.evaluate(a2);

        System.out.println("7 * (9 + 1): " + val);

        Number n4 = new Number(4);
        Number n5 = new Number(5);

        BinOp o1 = new BinOp(n4, "*", n5);//4 * 5
        BinOp o2 = new BinOp(n3, "+", o1);//1 + (4 * 5)
        BinOp o3 = new BinOp(o2, "+", n1);//1 + (4 * 5) + 7
        BinOp o4 = new BinOp(n2, "*", o3);//9 * (1 + (4 * 5) + 7)

        val = total.evaluate(o4);

        System.out.println("9 * (1 + (4 * 5) + 7): " + val);

    }

}
