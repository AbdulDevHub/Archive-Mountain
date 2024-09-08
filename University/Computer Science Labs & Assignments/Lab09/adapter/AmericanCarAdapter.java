package adapter;

import cars.Car;

/**
 * AmericanCarAdapter adapter.  Make an american car report speed in km
 */
public class AmericanCarAdapter implements Car {
    private Car car;

    public AmericanCarAdapter(Car v1) {
        this.car = v1;
    }

    @Override
    public double maxSpeed(){
        if (this.car.getName().contains("kilo")){
            return this.car.maxSpeed();
        } return this.car.maxSpeed() * 1.61;

    }

    @Override
    public String getUnits(){
        return "kilometers per hour";
    }

    @Override
    public String getName(){
        return "Adapted " + this.car.getName();
    }
}
