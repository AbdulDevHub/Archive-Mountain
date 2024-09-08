package garden;

/**
 * Bee Class.  Bee consumes pollen
 */
public class Bee implements Runnable {
    private Garden garden;
    private int health;

    /**
     * Bee constructor
     * @param garden
     */
    public Bee(Garden garden) {
        this.garden = garden;
        this.health = 200;
    }

    /*
     * The run method for a Bee.
     * This method should:
     * 1. Check to see if the Bee's health has hit 0 or the bee has consumed <= 200 pollen grains.
     * 2. If yes, terminate the thread!
     * 3. If no, and if the Garden has pollen to give, the Bee should consume Pollen from the Garden.
     * 4. If no, and if the Garden has no pollen to give, decrement the Bee's health by 1 unit.
     * 5. After each iteration of this thread, put it to sleep for 10 milliseconds!  You can do this using the command:
     *    Thread.sleep(10);
     */
    @Override
    public void run() {
        if (this.health == 0 || ){Thread.}
        else if (){}
        else {this.health--;}
        Thread.sleep(10);
    }

    /**
     * Getter for health
     * @return health
     */
    public int getHealth () {
        return this.health;
    }
}