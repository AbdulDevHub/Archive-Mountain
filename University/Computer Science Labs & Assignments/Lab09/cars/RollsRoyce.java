package cars;

/**
 * Rolls Royce class
 */
public class RollsRoyce implements Car {

    /**
     * get max speed of car
     *
     * @return max speed of car
     */
    @Override
    public double maxSpeed() {
        return 250.0;
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
        return "Rolls Royce";
    }

}