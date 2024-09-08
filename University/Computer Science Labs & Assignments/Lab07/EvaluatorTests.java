import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import static org.junit.jupiter.api.Assertions.*;

import lab07.Evaluator;
import lab07.BinOp;
import lab07.Number;

public class EvaluatorTests {
    @Test
    void VisitNumber() {
        Evaluator evaluator = new Evaluator();
        assertEquals(10, evaluator.evaluate(new Number(10)), "VisitNumber doesn't evaluate number correctly");
    }


    @Test
    void VisitBinOp() {
        Evaluator evaluator = new Evaluator();

        BinOp bo = new BinOp(new Number(10), "+", new Number(11));

        try {
            assertEquals(21, evaluator.evaluate(bo), 0.1,
                    "Evaluator evaluated to a wrong answer.");
        } catch (Exception e) {
            fail("Evaluator.evaluate() shouldn't raise Exception.");
        }
    }

}
