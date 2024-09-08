import adapter.AmericanCarAdapter;
import cars.*;

/**
 * Main class
 */
public class Main {

    /**
     * Main method
     * @param args
     */
    public static void main (String args[]) {

        //Output of code should be as follows:
        //Max speed of Corvette is 194.0 miles per hour.
        //Max speed of Rolls Royce is 250.0 kilometers per hour.
        //Max speed of Ferrari is 340.0 kilometers per hour.
        //Adapted max speed of Corvette is 312.0 kilometers per hour.

        CarFactory carFactory = new CarFactory(); //make factory

        Car v1 = carFactory.getCar("Corvette"); //get a corvette from factory
        System.out.println("Max speed of " + v1.getName() + " is " + v1.maxSpeed() + " " + v1.getUnits() + ".");

        Car v2 = carFactory.getCar("Rolls Royce");  //get a rolls from factory
        System.out.println("Max speed of " + v2.getName() + " is " + v2.maxSpeed() + " " + v2.getUnits() + ".");

        Car v3 = carFactory.getCar("Ferrari"); //get a ferrari from factory
        System.out.println("Max speed of " + v3.getName() + " is " + v3.maxSpeed() + " " + v3.getUnits() + ".");

        AmericanCarAdapter a1 = new AmericanCarAdapter(v1); //adapt the american car to report speed in KM
        System.out.println("Adapted max speed of " + v1.getName() + " is " + a1.maxSpeed() + " " + a1.getUnits() + ".");


    }

}
