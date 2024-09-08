package cars;

/**
 * Ferrari class
 */
public class Ferrari implements Car {

    /**
     * get max speed of car
     *
     * @return max speed of car
     */
    @Override
    public double maxSpeed() {
        return 340.0;
    }

    /**
     * get units for speed
     *
     * @return string stating units of speed
     */
    public String getUnits() {
        return "kilometers per hour";
    }

    /**
     * get name of car
     *
     * @return String containing name
     */
    @Override
    public String getName() {
        return "Ferrari";
    }


}
