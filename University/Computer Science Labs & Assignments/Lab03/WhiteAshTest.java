package lab03;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * The WhiteAshTest class for the third Lab in CSC207, Fall 2022.
 * WhiteAshTest serves to test the WhiteAsh class
 */
class WhiteAshTest {
    
    @Test
    void grow() {
        WhiteAsh t = new WhiteAsh(30);
        t.grow(2.0);
        assertEquals(30.6,t.getDiameter());
    }

    @Test
    void carbonContent() {
        WhiteAsh t = new WhiteAsh(30);
        assertEquals(247.0,Math.round(t.carbonContent()));
    }

    @Test
    void equals() {
        WhiteAsh t = new WhiteAsh(30);
        WhiteAsh j = new WhiteAsh(30);
        boolean value = t.equals(j);
        assertEquals(true,value);
    }

    @Test
    void hashCodeTest() {
        WhiteAsh t = new WhiteAsh(30);
        WhiteAsh j = new WhiteAsh(30);
        WhiteAsh l = new WhiteAsh(30);
        l.fellTree();
        int value1 = t.hashCode();
        int value2 = j.hashCode();
        int value3 = l.hashCode();
        assertEquals(true,value2 == value1 && value1 != value3);
    }

    //Make sure to add your own tests, too!!

}