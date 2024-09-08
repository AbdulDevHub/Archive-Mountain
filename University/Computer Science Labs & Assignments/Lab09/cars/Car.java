package cars;

/**
 * Car interface
 */
public interface Car {

    /**
     * get max speed of car
     *
     * @return max speed of car
     */
    public double maxSpeed();

    /**
     * get units for speed
     *
     * @return string stating units of speed
     */
    public String getUnits();

    /**
     * get name of car
     *
     * @return String containing name
     */
    public String getName();
}
