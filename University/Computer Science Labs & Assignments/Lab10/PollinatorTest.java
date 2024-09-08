import garden.Flower;
import org.junit.jupiter.api.Test;
import garden.Bee;
import garden.Flower;
import garden.Garden;

import static org.junit.jupiter.api.Assertions.*;

public class PollinatorTest {

    @Test
    public void PollinatorTest() {
        Garden garden = new Garden();
        Bee honeyBee = new Bee(garden);
        Thread Pollinator = new Thread(honeyBee);
        Pollinator.run();
        assertEquals(honeyBee.getHealth(), 0);

    }

    @Test
    public void PollenGeneratorTest() {
        Garden garden = new Garden();
        Flower gardenia = new Flower(garden);
        Thread PollenGenerator = new Thread(gardenia);
        PollenGenerator.run();
        assertEquals(gardenia.getPollenCount(), 200);
    }


}
