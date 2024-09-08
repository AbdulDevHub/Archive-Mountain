import garden.Bee;
import garden.Flower;
import garden.Garden;

/**
 * Main class.
 */
public class Main {

    static Garden garden;
    static Bee honeyBee;
    static Flower gardenia;

    /**
     * Driver to run the garden
     * @param args
     */
    public static void main(String[] args) {
        runGarden(); //run interacting threads to simulate a garden!
    }

    /**
     * Run the garden
     */
    public static void runGarden() {

        garden = new Garden();
        honeyBee = new Bee(garden);
        gardenia = new Flower(garden);

        Thread Pollinator = new Thread(honeyBee);
        Thread PollenGenerator = new Thread(gardenia);

        Pollinator.start(); //start the concurrent threads!
        PollenGenerator.start();
    }
}