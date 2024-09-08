package garden;

import java.util.Stack;

/**
 * Garden Class.  Garden stores pollen
 */
public class Garden extends Stack<Pollen> {

    /*
     * Use this method to pull Pollen from the Garden.
     */
    public Pollen pull() {
        if (!this.empty()) {
            this.lastElement().print();
            return this.pop();
        } else {
            System.out.println("Empty garden! And so, no pollen for Bees.");
        }
        return null;
    }

}
