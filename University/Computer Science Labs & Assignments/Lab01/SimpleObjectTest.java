import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SimpleObjectTest {

    @Test
    void sumUp() {
        SimpleObject s = new SimpleObject(10);
        assertEquals(55, s.sumUp(), "Failed test when input is 10.");
    }
}
