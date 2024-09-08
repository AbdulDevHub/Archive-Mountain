import adapter.AmericanCarAdapter;


import org.junit.jupiter.api.Test;
import cars.Car;
import cars.CarFactory;
import cars.Corvette;


import static org.junit.jupiter.api.Assertions.*;


public class StudentTests {

    //write your own tests with your partner!!

    @Test
    void CarAdaptationTest() {
        Car v1 = new Corvette();
        AmericanCarAdapter amCar = new AmericanCarAdapter(v1);
        assertEquals(312.0, amCar.maxSpeed(),1);
    }

    @Test
    void CarFactoryTest() {
        CarFactory carFactory = new CarFactory();
        Car v2 = carFactory.getCar("Rolls Royce");
        assertEquals(250.0, v2.maxSpeed(),1);
    }


}
