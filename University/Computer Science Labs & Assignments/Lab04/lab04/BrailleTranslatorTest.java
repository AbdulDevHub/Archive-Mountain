package lab04;

import java.io.IOException;
import java.util.Arrays;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class BrailleTranslatorTest {
    @Test
    void initializeMap() {
        try {
            BrailleTranslator translator = new BrailleTranslator();
            assertEquals("", translator.toString(),
                    "BrailleTranslator.toString() should be empty before translating.");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }


    @Test
    void translateChar() {
        try {
            BrailleTranslator translator = new BrailleTranslator();
            assertEquals(Arrays.asList("10", "00", "00"), translator.translateChar('a'),
                    "BrailleTranslator.translateChar() failed to provide correct translation.");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void translateLine_invalid() {
        try {
            BrailleTranslator translator = new BrailleTranslator();
            assertThrows(BrailleLetterException.class, () -> {
                translator.translateLine("/");
            }, "Invalid characters should make BrailleTranslator.translateLine() to raise BrailleLetterException.");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void translateLine_valid() throws BrailleLetterException {
        try {
            BrailleTranslator translator = new BrailleTranslator();
            translator.translateLine("Great.");
            String expected = "111010100100\n111101001111\n001000001001\n";
            assertEquals(expected, translator.toString());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

}
