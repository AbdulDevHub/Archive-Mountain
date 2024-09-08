import guidelines.Forester;
import guidelines.Guidelines;
import guidelines.observer.GuidelineObserver;
import org.junit.jupiter.api.Test;

import java.io.OutputStream;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

public class GuidelineTests {

    @Test
    void updateTest() {
        PrintStream stdOut = System.out;
        System.setOut(new PrintStream(new OutputStream() {
            public void write(int b) {}
        }));

        HashMap<String, ArrayList<String>> hashmap = new HashMap<>();
        hashmap.put("name", new ArrayList<>(List.of("env")));

        GuidelineObserver o = new Forester();
        o.update(hashmap);
        assertEquals(List.of("env"), ((Forester) o).getGuidelines("name"));

        System.setOut(stdOut);
    }

    @Test
    void addGuidelineTest() {
        PrintStream stdOut = System.out;
        System.setOut(new PrintStream(new OutputStream() {
            public void write(int b) {}
        }));

        Guidelines forestryGuidelines = new Guidelines();
        assertEquals(Collections.emptyMap(), forestryGuidelines.getGuidelines()); // empty

        forestryGuidelines.addGuideline("name1", "env1"); // name1: [env1]
        forestryGuidelines.addGuideline("name2", "env1"); // name1: [env1], name2: [env1]

        assertEquals(List.of("env1"), forestryGuidelines.getGuidelines().get("name1"),
                "Guideline was not correctly added.");
        forestryGuidelines.addGuideline("name1", "env2"); // name1: [env1, env2], name2: [env1]
        assertEquals(List.of("env1", "env2"), forestryGuidelines.getGuidelines().get("name1"),
                "Newly added guideline was not properly added.");

        System.setOut(stdOut);
    }

    @Test
    void removeGuidelineTest() {
        Guidelines forestryGuidelines = new Guidelines();
        try {
            forestryGuidelines.removeGuideline("name", "env"); // shouldn't change anything
        } catch (Exception e) {
            fail("Removing guideline from empty Guidelines class shouldn't raise exception.");
        }

        forestryGuidelines.addGuideline("name1", "env1");
        forestryGuidelines.addGuideline("name1", "env2");

        forestryGuidelines.removeGuideline("name1", "env1");
        assertEquals(List.of("env2"), forestryGuidelines.getGuidelines().get("name1"),
                "Guideline was not properly removed.");

    }
}
