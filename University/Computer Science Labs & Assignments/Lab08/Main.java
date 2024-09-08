import decorator.BenchDecorator;
import decorator.RibbonDecorator;
import decorator.TreeDecorator;
import trees.NorwayMaple;

/**
 * Main Class. Create some trees and print them out.  Decorate some of the string descriptions.
 */
public class Main {

    /**
     * Main Method
     *
     * @param args arguments, if any
     */
    public static void main(String[] args) {

        NorwayMaple m = new NorwayMaple();
        System.out.println(m.getDescription()); //Should print "I'm a Norway Maple."

        TreeDecorator b = new BenchDecorator(m);
        System.out.println(b.getDescription()); //Should print "I'm a **DECORATED** Norway Maple. There is a bench beneath me."

        TreeDecorator c = new RibbonDecorator(b, "yellow");
        System.out.println(c.getDescription()); //Should print "I'm a **DECORATED** Norway Maple. There is a bench beneath me. I am wrapped with a yellow ribbon."
    }
}