package adapter;

import cars.Car;

/**
 * EuroCarAdapter adapter.  Make a european car report speed in miles
 */
public class EuroCarAdapter implements Car {
    private Car car;

    public EuroCarAdapter(Car v1) {
        this.car = v1;
    }

    @Override
    public double maxSpeed(){
        if (this.car.getName().contains("mile")){
            return this.car.maxSpeed();
        } return this.car.maxSpeed() / 1.61;

    }

    @Override
    public String getUnits(){
        return "miles per hour";
    }

    @Override
    public String getName(){
        return "Adapted " + this.car.getName();
    }
}
