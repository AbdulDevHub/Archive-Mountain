import decorator.BenchDecorator;
import decorator.TreeDecorator;
import trees.NorwayMaple;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class DecoratorTest {

    @Test
    void BenchDecorator() {
        NorwayMaple tree = new NorwayMaple();
        TreeDecorator d = new BenchDecorator(tree);
        assertTrue(d.getDescription().toLowerCase().contains("bench"),
                "Description printed does not contain the word bench.");
        assertTrue(d.getDescription().toLowerCase().contains("maple"),
                "Description printed does not contain the word maple.");
    }
}