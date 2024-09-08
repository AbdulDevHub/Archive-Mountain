package cars;

/**
 * Corvette class
 */
public class Corvette implements Car {

    /**
     * get max speed of car
     *
     * @return max speed of car
     */
    @Override
    public double maxSpeed() {
        return 194.0;
    }

    /**
     * get units for speed
     *
     * @return string stating units of speed
     */
    @Override
    public String getUnits() {
        return "miles per hour";
    }

    /**
     * get name of car
     *
     * @return String containing name
     */
    @Override
    public String getName() {
        return "Corvette";
    }

}
