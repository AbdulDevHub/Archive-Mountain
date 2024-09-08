package lab04;

/**
 * Class BrailleLetterException.
 * A  BrailleLetterException is an exception that will be thrown
 * when a given ASCII character is not in the set of translatable letters.
 */
public class BrailleLetterException extends Throwable {
    public BrailleLetterException(String message) {
        super(message);
    }
}