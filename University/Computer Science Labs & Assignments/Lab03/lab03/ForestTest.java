package lab03;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * The ForestTest class for the third Lab in CSC207, Fall 2022.
 * ForestTest serves to test the Forest class
 */
class ForestTest {

    @Test
    void currCarbonContent() {
        Forest forest = new Forest(1000);
        assertEquals(28643.9, forest.currCarbonContent(),1);
    }

    @Test
    void harvestTest() {
        Forest forest = new Forest(1000);
        WhiteAsh tree = new WhiteAsh(12);
        forest.harvest(tree);
        assertEquals(false, forest.getForest().get(50).getLiving());
    }

    //Make sure to add your own tests, too!!

}