/**
 * A simple object class, to illustrate the basic anatomy of a Java Class
 */
public class SimpleObject {

    private int sumTo;

    /**
     * Class constructor that specifies an integer value for the sumTo attribute.
     *
     * @param sumTo the amount to sum up to.
     */
    public SimpleObject(int sumTo) {
        this.sumTo = sumTo;
    }

    /**
     * Public method that returns the sum of every integer between 0 up to and including the value of
     * the instance's sumTo variable. If sumTo is a negative number, return 0.
     *
     * @return      the sum of every integer to the value of sumTo for this class
     */
    public int sumUp() {
        throw new UnsupportedOperationException(); //replace this with your code!
    }
}

