package cars;

/**
 * Car Factory class
 */
public class CarFactory {

    /**
     * Create a car
     * @param type type of car to create
     * @return car of specified type
     */
    public Car getCar(String type) {
        if (type.equals("Corvette")){return new Corvette();}
        else if (type.equals("Ferrari")){return new Ferrari();}
        return new RollsRoyce();
    }
}
